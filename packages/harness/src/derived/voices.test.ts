import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  buildPreviewVoiceIndex,
  buildVoiceIndex,
  formatVoiceIndexToon,
  parseVoiceIndexToon,
  readVoiceIndex,
  terminalVoiceAt,
  writeVoiceIndex,
} from "./voices.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

// [0, 17) narration; [17, 41) the reported speech, licensed at [17, 26).
const SOURCE = "{2a} ΝΑΡΡ. alpha ἔφη ΒΗΤΑ. {2b} beta gamma";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function writeRepoFixture() {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), SOURCE, "utf8");
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/turns/fixture.toon"),
    [
      "dialogue: fixture",
      "source_path: raw/plato/greek/fixture.txt",
      `source_sha256: ${sha256(SOURCE)}`,
      "sigla_path: derived/plato/turns/sigla.toml",
      `sigla_sha256: ${sha256("sigla")}`,
      "turns[1]:",
      "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
      `  turn_fixture_0001 | ΝΑΡΡ.   | 2a           | 2b         | 0          | ${SOURCE.length}       | ${sha256(SOURCE)} | 5`,
      "",
    ].join("\n"),
    "utf8",
  );

  // The compiler runs the full ledger validator, which resolves chain sigla
  // against this registry.
  mkdirSync(join(root, "derived/plato/voices"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/voices/sigla.toml"),
    '[[dialogues]]\nslug = "fixture"\nsigla = ["ΝΑΡΡ.", "ΒΗΤΑ.", "ΓΑΜΜΑ."]\n',
    "utf8",
  );
}

/** Mirrors the validator's marker arithmetic so fixtures declare a real span. */
function stephanusSpan(start: number, end: number) {
  const markers = [
    { marker: "2a", index: SOURCE.indexOf("{2a}") },
    { marker: "2b", index: SOURCE.indexOf("{2b}") },
  ];
  let startMarker = markers[0]!.marker;
  let endMarker = startMarker;
  for (const marker of markers) {
    if (marker.index <= start) startMarker = marker.marker;
    if (marker.index < end) endMarker = marker.marker;
    else break;
  }
  return startMarker === endMarker ? startMarker : `${startMarker}-${endMarker}`;
}

type Options = {
  id?: string;
  start?: number;
  end?: number;
  chain?: string[];
  resolution?: string;
  review?: string;
  /** Resolve by reviewed adjudication instead of cited bytes (the Phaedo discourse attribution review). */
  reviewed?: boolean;
};

function voiceBlock(options: Options = {}) {
  const start = options.start ?? 0;
  const end = options.end ?? SOURCE.length;
  const chain = options.chain ?? ["ΝΑΡΡ."];
  const resolution = options.resolution ?? "resolved";
  const lines = [
    "```yaml",
    `voice_id: ${options.id ?? "voice_fixture_0001"}`,
    "source_work: Fixture",
    "outer_turn_id: turn_fixture_0001",
    `stephanus_span: ${stephanusSpan(start, end)}`,
    "char_span:",
    `  start_char: ${start}`,
    `  end_char: ${end}`,
    "source_path: raw/plato/greek/fixture.txt",
    `source_sha256: "${sha256(SOURCE)}"`,
    `span_sha256: "${sha256(SOURCE.slice(start, end))}"`,
    `voice_chain: [${chain.map((s) => `"${s}"`).join(", ")}]`,
    `depth: ${resolution === "unresolved" ? chain.length + 1 : chain.length}`,
    `resolution: ${resolution}`,
  ];
  if (resolution === "resolved" && options.reviewed) {
    lines.push(
      "reviewed_attribution:",
      "  kind: discourse_resolution",
      `  candidate_owners: [${[...new Set(["ΝΑΡΡ.", ...chain])].map((s) => `"${s}"`).join(", ")}]`,
      "  context_span:",
      `    start_char: ${0}`,
      `    end_char: ${SOURCE.length}`,
      `    text_sha256: "${sha256(SOURCE)}"`,
      '  rationale: "Named handoff; this span answers the named addressee."',
    );
  } else if (resolution === "resolved") {
    // Cite evidence the span can actually carry: the printed siglum at [5, 10)
    // for narration-only spans, the reporting formula at [17, 26) otherwise
    // (inside the span, or within the lookback window before it).
    const useSiglum = start <= 5 && end >= 10 && !(start <= 17 && end >= 26);
    lines.push(
      "evidence_refs:",
      `  - kind: ${useSiglum ? "printed_siglum" : "named_reporting_formula"}`,
      `    text: "${useSiglum ? "ΝΑΡΡ." : "ἔφη ΒΗΤΑ."}"`,
      `    start_char: ${useSiglum ? 5 : 17}`,
      `    end_char: ${useSiglum ? 10 : 26}`,
    );
  } else {
    lines.push('unresolved_reason: "no cue names an owner"');
  }
  lines.push('limits: "Structure only."', `review_status: ${options.review ?? "accepted"}`, "```", "");
  return lines.join("\n");
}

function writeLedger(blocks: string[]) {
  mkdirSync(join(root, "wiki/voices"), { recursive: true });
  writeFileSync(join(root, "wiki/voices/fixture.md"), blocks.join("\n"), "utf8");
}

/** Narration over the whole turn, with a deeper reported speech inside it. */
function nestedLedger(overrides: { parentReview?: string; childReview?: string } = {}) {
  return [
    voiceBlock({ id: "voice_fixture_0001", review: overrides.parentReview ?? "accepted" }),
    voiceBlock({
      id: "voice_fixture_0002",
      start: 17,
      chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
      review: overrides.childReview ?? "accepted",
    }),
  ];
}

describe("voice index compiler", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "voices-compile-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeRepoFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("compiles an accepted cohort", () => {
    writeLedger(nestedLedger());
    expect(buildVoiceIndex("fixture").records.map((record) => record.voiceId)).toEqual([
      "voice_fixture_0001",
      "voice_fixture_0002",
    ]);
  });

  it("refuses to derive any authoritative artifact from a wholly unreviewed ledger", () => {
    // A nonempty ledger with nothing accepted must not compile to a zero-record
    // index. An empty index is not "no opinion" — the join reads it as "this
    // dialogue has no embedded voices" and hands every claim back to the
    // printed turn siglum, which is the collapse this lane exists to undo.
    writeLedger(nestedLedger({ parentReview: "unreviewed", childReview: "unreviewed" }));
    expect(() => buildVoiceIndex("fixture")).toThrow(/none accepted/u);
  });

  it("writes no file when the ledger is unreviewed", () => {
    writeLedger(nestedLedger({ parentReview: "unreviewed", childReview: "unreviewed" }));
    expect(() => writeVoiceIndex("fixture")).toThrow();
    expect(existsSync(join(root, "derived/plato/voices/fixture.toon"))).toBe(false);
  });

  describe("atomic acceptance", () => {
    it("refuses to compile when a deeper child is left unreviewed", () => {
      writeLedger(nestedLedger({ childReview: "unreviewed" }));
      expect(() => buildVoiceIndex("fixture")).toThrow(/Incomplete review cohort/u);
    });

    it("names the voice the orphaned range would fall back to", () => {
      writeLedger(nestedLedger({ childReview: "unreviewed" }));
      // The whole point: accepting only the parent would silently return the
      // child's characters to the enclosing narrator.
      expect(() => buildVoiceIndex("fixture")).toThrow(/would fall back to "ΝΑΡΡ."/u);
    });

    it("refuses a voiced turn that carries records but none accepted", () => {
      // One turn fully accepted, another voiced turn wholly pending, is still a
      // refusal: the pending turn must not fall through to turn_level.
      writeLedger([
        voiceBlock({ id: "voice_fixture_0001", start: 0, end: 17 }),
        voiceBlock({ id: "voice_fixture_0002", start: 17, review: "unreviewed" }),
      ]);
      expect(() => buildVoiceIndex("fixture")).toThrow(/Incomplete review cohort/u);
    });

    it("refuses when a deeper child is rejected without replacement", () => {
      writeLedger(nestedLedger({ childReview: "rejected" }));
      expect(() => buildVoiceIndex("fixture")).toThrow(/Incomplete review cohort/u);
    });

    it("compiles when a rejected child is replaced by an accepted record over the same region", () => {
      writeLedger([
        voiceBlock({ id: "voice_fixture_0001" }),
        voiceBlock({ id: "voice_fixture_0002", start: 17, chain: ["ΝΑΡΡ.", "ΒΗΤΑ."], review: "rejected" }),
        voiceBlock({
          id: "voice_fixture_0003",
          start: 17,
          chain: ["ΝΑΡΡ."],
          resolution: "unresolved",
          review: "accepted",
        }),
      ]);
      const ids = buildVoiceIndex("fixture").records.map((record) => record.voiceId);
      expect(ids).toEqual(["voice_fixture_0001", "voice_fixture_0003"]);
    });

    it("requires a replacement to cover the rejected record's WHOLE range", () => {
      // The replacement covers [30, 42) of a rejected [17, 42). Partial overlap
      // used to satisfy the check, leaving [17, 30) to fall back to the parent.
      writeLedger([
        voiceBlock({ id: "voice_fixture_0001" }),
        voiceBlock({ id: "voice_fixture_0002", start: 17, chain: ["ΝΑΡΡ.", "ΒΗΤΑ."], review: "rejected" }),
        voiceBlock({
          id: "voice_fixture_0003",
          start: 30,
          chain: ["ΝΑΡΡ."],
          resolution: "unresolved",
          review: "accepted",
        }),
      ]);
      expect(() => buildVoiceIndex("fixture")).toThrow(/not completely replaced/u);
    });

    it("refuses when accepted records leave part of the turn uncovered", () => {
      // Live records tile the turn, so the ledger is VALID; only the accepted
      // subset leaves a hole. That is the projection check's own job.
      writeLedger([
        voiceBlock({ id: "voice_fixture_0001", start: 0, end: 17 }),
        voiceBlock({ id: "voice_fixture_0002", start: 17, review: "unreviewed" }),
      ]);
      expect(() => buildVoiceIndex("fixture")).toThrow(/uncovered at depth/u);
    });

    it("refuses when an accepted deep record has no accepted parent", () => {
      writeLedger([
        voiceBlock({ id: "voice_fixture_0001", chain: ["ΝΑΡΡ."], review: "unreviewed" }),
        voiceBlock({ id: "voice_fixture_0002", start: 17, chain: ["ΝΑΡΡ.", "ΒΗΤΑ."] }),
      ]);
      expect(() => buildVoiceIndex("fixture")).toThrow(/no accepted depth-1 parent/u);
    });
  });

  describe("preview index", () => {
    it("compiles unreviewed records so review can see the numbers", () => {
      writeLedger(nestedLedger({ parentReview: "unreviewed", childReview: "unreviewed" }));
      expect(buildPreviewVoiceIndex("fixture").records).toHaveLength(2);
    });

    it("does not bypass the atomic check for authoritative output", () => {
      writeLedger(nestedLedger({ childReview: "unreviewed" }));
      expect(buildPreviewVoiceIndex("fixture").records).toHaveLength(2);
      expect(() => buildVoiceIndex("fixture")).toThrow(/Incomplete review cohort/u);
    });
  });

  it("orders records outermost-first so a consumer always sees the parent", () => {
    writeLedger([
      voiceBlock({ id: "voice_fixture_0001", start: 17, chain: ["ΝΑΡΡ.", "ΒΗΤΑ."] }),
      voiceBlock({ id: "voice_fixture_0002" }),
    ]);
    expect(buildVoiceIndex("fixture").records.map((record) => record.depth)).toEqual([1, 2]);
  });

  it("resolves the deepest record covering an offset", () => {
    writeLedger(nestedLedger());
    const index = buildVoiceIndex("fixture");
    expect(terminalVoiceAt(index, 5)?.voiceId).toBe("voice_fixture_0001");
    expect(terminalVoiceAt(index, 20)?.voiceId).toBe("voice_fixture_0002");
  });

  it("throws when a record's span hash no longer matches the source", () => {
    writeLedger([voiceBlock().replace(/span_sha256: "[a-f0-9]+"/u, `span_sha256: "${"0".repeat(64)}"`)]);
    expect(() => buildVoiceIndex("fixture")).toThrow(/span_sha256/u);
  });

  it("throws when cited evidence no longer matches the source bytes", () => {
    writeLedger([voiceBlock().replace('text: "ἔφη ΒΗΤΑ."', 'text: "φάναι ΒΗΤΑ."')]);
    expect(() => buildVoiceIndex("fixture")).toThrow(/does not match the source bytes/u);
  });

  it("refuses to compile a malformed ledger at all", () => {
    // A ledger that `bun run validate` would reject must never become
    // authoritative: the derived layer cannot be valid and invalid at once.
    writeLedger([voiceBlock({ chain: ["ΔΕΛΤΑ."] })]);
    expect(() => buildVoiceIndex("fixture")).toThrow(/fails validation/u);
  });

  it("throws when the turn index is stale relative to the source", () => {
    writeLedger(nestedLedger());
    writeFileSync(join(root, "raw/plato/greek/fixture.txt"), `${SOURCE} delta`, "utf8");
    expect(() => buildVoiceIndex("fixture")).toThrow(/Stale turn index/u);
  });

  it("round-trips through the TOON formatter", () => {
    writeLedger(nestedLedger());
    const index = buildVoiceIndex("fixture");
    expect(parseVoiceIndexToon(formatVoiceIndexToon(index))).toEqual(index);
  });

  it("writes byte-stable voice index files", () => {
    writeLedger(nestedLedger());
    const first = writeVoiceIndex("fixture");
    const firstContent = readFileSync(join(root, first.path), "utf8");
    const second = writeVoiceIndex("fixture");
    expect(readFileSync(join(root, second.path), "utf8")).toBe(firstContent);
    expect(firstContent).toBe(formatVoiceIndexToon(buildVoiceIndex("fixture")));
  });

  it("rejects a malformed voice index header on parse", () => {
    expect(() => parseVoiceIndexToon("dialogue: fixture\n")).toThrow(/Malformed voice index header/u);
  });

  /**
   * The Phaedo discourse attribution review. A reviewed adjudication must not compile to a bare `resolved` row
   * with zero evidence — a consumer could not then tell an adjudicated owner
   * from a formula-licensed one.
   */
  describe("resolution basis", () => {
    function reviewedLedger() {
      return [
        voiceBlock({ id: "voice_fixture_0001", review: "accepted" }),
        voiceBlock({
          id: "voice_fixture_0002",
          start: 17,
          chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          review: "accepted",
          reviewed: true,
        }),
      ];
    }

    it("marks a reviewed-discourse record and leaves explicit ones unmarked", () => {
      writeLedger(reviewedLedger());
      const index = buildVoiceIndex("fixture");

      const explicit = index.records.find((record) => record.voiceId === "voice_fixture_0001")!;
      const adjudicated = index.records.find((record) => record.voiceId === "voice_fixture_0002")!;
      expect(explicit.resolutionBasis).toBeUndefined();
      expect(adjudicated.resolutionBasis).toBe("reviewed_discourse");
      expect(adjudicated.evidenceCount).toBe(0);
    });

    it("survives a write/read round trip and stays byte-stable", () => {
      writeLedger(reviewedLedger());
      const index = buildVoiceIndex("fixture");
      expect(parseVoiceIndexToon(formatVoiceIndexToon(index))).toEqual(index);

      const first = writeVoiceIndex("fixture");
      const content = readFileSync(join(root, first.path), "utf8");
      writeVoiceIndex("fixture");
      expect(readFileSync(join(root, first.path), "utf8")).toBe(content);
      expect(content).toContain("resolution_basis");
      expect(readVoiceIndex("fixture").records).toHaveLength(2);
    });

    it("does not add the column to an explicit-only index", () => {
      // The Symposium is explicit-only and its compiled bytes are bound by a
      // live join hash. An unrelated Phaedo change must not rewrite them.
      writeLedger(nestedLedger());
      expect(formatVoiceIndexToon(buildVoiceIndex("fixture"))).not.toContain("resolution_basis");
    });

    it("refuses to compile a reviewed context whose bytes moved", () => {
      writeLedger([
        voiceBlock({ id: "voice_fixture_0001", review: "accepted" }),
        voiceBlock({
          id: "voice_fixture_0002",
          start: 17,
          chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          review: "accepted",
          reviewed: true,
        }).replace(/text_sha256: "[a-f0-9]{64}"/u, `text_sha256: "${"0".repeat(64)}"`),
      ]);

      // The authoritative path runs the full validator first, so it fails there.
      expect(() => buildVoiceIndex("fixture")).toThrow(/reviewed_attribution_context_sha256_mismatch/u);
      // Preview deliberately skips the validator, so the compiler's own byte
      // check is the one that has to hold — the same way it does for evidence.
      expect(() => buildPreviewVoiceIndex("fixture")).toThrow(/reviewed_attribution context/u);
    });
  });
});

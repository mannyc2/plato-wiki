import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { buildClaimSupport } from "./claim-support.js";
import {
  buildVoiceJoin,
  buildVoiceJoinFromIndex,
  formatTrajectory,
  formatVoiceJoinToon,
  parseVoiceJoinToon,
  writeVoiceJoin,
} from "./voice-joins.js";
import { buildPreviewVoiceIndex, writeVoiceIndex } from "./voices.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

// A two-party exchange with an interlocutor question between two ΒΗΤΑ. turns —
// the shape of claim_symposium_0106.
//   [0, 20)   narration
//   [20, 40)  ΒΗΤΑ. turn one, containing the term "πρῶτον"
//   [40, 60)  ΝΑΡΡ. question
//   [60, 84)  ΒΗΤΑ. turn two, containing the term "δεύτερον"
// A second turn, [79, ...), carries NO voice records — it is what makes the
// turn_level fallback testable at all. Appending keeps every offset above
// unchanged.
const SOURCE =
  "{2a} ΝΑΡΡ. alpha  " + // 0-18
  "{2b}" + // 18-22
  " ἔφη πρῶτον ταῦτα  " + // 22-41
  " τί οὖν ὦ ΒΗΤΑ    " + // 41-59
  " ἔφη δεύτερον ταῦτα " + // 59-79
  "{2c} ΓΑΜΜΑ. later  "; // 79-99

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

/** End of the voiced turn; everything after belongs to the unvoiced turn. */
const VOICED_TURN_END = 79;
const BETA_ONE = { start: 22, end: 41 };
const NARR_Q = { start: 41, end: 59 };
const BETA_TWO = { start: 59, end: VOICED_TURN_END };
const UNVOICED_TURN = { start: VOICED_TURN_END, end: SOURCE.length };

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
      "turns[2]:",
      "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
      `  turn_fixture_0001 | ΝΑΡΡ.   | 2a           | 2b         | 0          | ${VOICED_TURN_END}       | ${sha256(SOURCE.slice(0, VOICED_TURN_END))} | 5`,
      `  turn_fixture_0002 | ΓΑΜΜΑ.  | 2c           | 2c         | ${VOICED_TURN_END}         | ${SOURCE.length}       | ${sha256(SOURCE.slice(VOICED_TURN_END))} | 5`,
      "",
    ].join("\n"),
    "utf8",
  );

  mkdirSync(join(root, "derived/plato/voices"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/voices/sigla.toml"),
    '[[dialogues]]\nslug = "fixture"\nsigla = ["ΝΑΡΡ.", "ΒΗΤΑ.", "ΓΑΜΜΑ."]\n',
    "utf8",
  );

  // Writing a stored join is the consumer step, so it needs an activation entry
  // (the voice activation contract). This file tests join geometry, not the activation boundary —
  // voice-cutover.test.ts owns that — so the fixture is activated throughout.
  const note = "wiki/review/2026-07-25-fixture-cutover-execution.md";
  mkdirSync(join(root, "wiki/review"), { recursive: true });
  writeFileSync(join(root, note), "# Fixture cutover execution\n\nReviewed.\n", "utf8");
  writeFileSync(
    join(root, "derived/plato/voices/cutovers.toml"),
    ["schema_version = 1", "", "[[dialogues]]", 'slug = "fixture"', 'status = "active"', `decision_note = "${note}"`, ""].join(
      "\n",
    ),
    "utf8",
  );
}

/** Mirrors the validator's marker arithmetic so fixtures declare a real span. */
function stephanusSpan(start: number, end: number) {
  const markers = [
    { marker: "2a", index: SOURCE.indexOf("{2a}") },
    { marker: "2b", index: SOURCE.indexOf("{2b}") },
    { marker: "2c", index: SOURCE.indexOf("{2c}") },
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

function voiceBlock(
  id: string,
  start: number,
  end: number,
  chain: string[],
  resolution = "resolved",
  review = "accepted",
) {
  const lines = [
    "```yaml",
    `voice_id: ${id}`,
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
  if (resolution === "resolved") {
    lines.push("evidence_refs:", "  - kind: named_reporting_formula", '    text: "ἔφη"', "    start_char: 23", "    end_char: 26");
  } else {
    lines.push('unresolved_reason: "no cue names an owner"');
  }
  lines.push('limits: "Structure only."', `review_status: ${review}`, "```", "");
  return lines.join("\n");
}

function writeVoicesLedger(blocks: string[]) {
  mkdirSync(join(root, "wiki/voices"), { recursive: true });
  writeFileSync(join(root, "wiki/voices/fixture.md"), blocks.join("\n"), "utf8");
}

/** ΝΑΡΡ. over the whole turn; two ΒΗΤΑ. turns with a ΝΑΡΡ. question between. */
function writeExchangeLedger() {
  writeVoicesLedger([
    voiceBlock("voice_fixture_0001", 0, VOICED_TURN_END, ["ΝΑΡΡ."]),
    voiceBlock("voice_fixture_0002", BETA_ONE.start, BETA_ONE.end, ["ΝΑΡΡ.", "ΒΗΤΑ."]),
    voiceBlock("voice_fixture_0003", BETA_TWO.start, BETA_TWO.end, ["ΝΑΡΡ.", "ΒΗΤΑ."]),
  ]);
  writeVoiceIndex("fixture");
}

function citation(start: number, end: number, indent = "  ") {
  return [
    `${indent}source_path: raw/plato/greek/fixture.txt`,
    `${indent}stephanus_span: 2a-2b`,
    `${indent}start_marker: 2a`,
    `${indent}end_marker: 2b`,
    `${indent}start_char: ${start}`,
    `${indent}end_char: ${end}`,
    `${indent}text_sha256: "${sha256(SOURCE.slice(start, end))}"`,
  ].join("\n");
}

function writeObservations(entries: Array<{ id: string; start: number; end: number }>) {
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  const blocks = entries.map((entry) =>
    ["```yaml", `observation_id: ${entry.id}`, "source_ref:", citation(entry.start, entry.end), "review_status: accepted", "```"].join("\n"),
  );
  writeFileSync(join(root, "wiki/observations/fixture.md"), `${blocks.join("\n\n")}\n`, "utf8");
}

type ClaimSpec = {
  id: string;
  start: number;
  end: number;
  terms?: string[];
  stance?: Array<[number, number]>;
  speaker?: string;
  review?: string;
};

function writeClaims(entries: ClaimSpec[]) {
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  const blocks = entries.map((entry) => {
    const lines = ["```yaml", `claim_id: ${entry.id}`, "source_ref:", citation(entry.start, entry.end), `speaker: ${entry.speaker ?? "ΝΑΡΡ."}`];
    if (entry.terms) {
      lines.push("greek_terms:");
      for (const term of entry.terms) lines.push(`  - ${term}`);
    }
    if (entry.stance) {
      lines.push("stance_events:");
      for (const [start, end] of entry.stance) {
        lines.push("  - kind: asserted", "    source_ref:", citation(start, end, "      "));
      }
    }
    lines.push(`review_status: ${entry.review ?? "accepted"}`, "```");
    return lines.join("\n");
  });
  writeFileSync(join(root, "wiki/claims/fixture.md"), `${blocks.join("\n\n")}\n`, "utf8");
}

function rowFor(id: string) {
  return buildVoiceJoin("fixture").rows.find((row) => row.recordId === id);
}

describe("voice joins", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "voice-joins-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeRepoFixture();
    writeObservations([]);
    writeClaims([]);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  describe("claim ownership versus stance actors", () => {
    it("keeps the claim owner when a later stance event is spoken by someone else", () => {
      writeExchangeLedger();
      // Owner from the ΒΗΤΑ. turn; a challenge later voiced in ΝΑΡΡ.'s question.
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_ONE.end,
          stance: [[BETA_ONE.start, BETA_ONE.end], [NARR_Q.start, NARR_Q.end]],
        },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("resolved");
      expect(row.owner).toBe("ΒΗΤΑ.");
    });

    it("joins each stance event to its own voice", () => {
      writeExchangeLedger();
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_ONE.end,
          stance: [[BETA_ONE.start, BETA_ONE.end], [NARR_Q.start, NARR_Q.end]],
        },
      ]);
      const actors = buildVoiceJoin("fixture").stanceRows.map((row) => row.actor);
      expect(actors).toEqual(["ΒΗΤΑ.", "ΝΑΡΡ."]);
    });

    it("summarizes participation when owner and actors differ", () => {
      writeExchangeLedger();
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_ONE.end,
          stance: [[NARR_Q.start, NARR_Q.end]],
        },
      ]);
      expect(rowFor("claim_fixture_0001")!.trajectory).toEqual(["ΒΗΤΑ.", "ΝΑΡΡ."]);
    });

    it("renders (single) when one resolved voice does everything", () => {
      writeExchangeLedger();
      writeClaims([
        { id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end, stance: [[BETA_ONE.start, BETA_ONE.end]] },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.trajectoryComplete).toBe(true);
      expect(formatTrajectory(row)).toBe("(single)");
    });

    it("never renders an unresolved trajectory as (single)", () => {
      writeExchangeLedger();
      // The claim's window crosses voices and it has no terms, so its owner is
      // unresolved. Reporting "(single)" here would assert one voice throughout
      // a record where no voice was identified at all.
      writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end }]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.owner).toBe("(unattributed)");
      expect(row.trajectoryComplete).toBe(false);
      expect(formatTrajectory(row)).toBe("(unresolved)");
    });

    it("marks a partly unresolved trajectory rather than reporting one voice", () => {
      writeExchangeLedger();
      // Owner resolves to ΒΗΤΑ.; the stance event sits on the unresolved-owner
      // window, so the trajectory is known-but-incomplete.
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_ONE.end,
          stance: [[BETA_ONE.start, BETA_TWO.end]],
        },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.owner).toBe("ΒΗΤΑ.");
      expect(row.trajectoryComplete).toBe(false);
      expect(formatTrajectory(row)).toBe("ΒΗΤΑ.>(unresolved)");
    });
  });

  describe("exact claim-support ranges", () => {
    it("resolves a claim whose two noncontiguous terms sit in two turns of the same voice", () => {
      writeExchangeLedger();
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_TWO.end,
          terms: ["πρῶτον", "δεύτερον"],
        },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("resolved");
      expect(row.owner).toBe("ΒΗΤΑ.");
      expect(row.supportUniqueRanges).toBe(2);
      expect(row.supportCandidateRanges).toBe(0);
      expect(row.supportCandidateChoices).toBe(0);
    });

    it("does not attribute the intervening interlocutor turn to the owner", () => {
      writeExchangeLedger();
      writeClaims([
        { id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end, terms: ["πρῶτον", "δεύτερον"] },
      ]);
      // The window covers ΝΑΡΡ.'s question, but the support ranges do not.
      const support = buildClaimSupport("fixture")[0]!;
      for (const range of support.ranges) {
        expect(range.startChar >= NARR_Q.end || range.endChar <= NARR_Q.start).toBe(true);
      }
    });

    it("records needs_anchor when a term does not occur in its own window", () => {
      writeExchangeLedger();
      writeClaims([
        { id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end, terms: ["πρῶτον", "ἀπόν"] },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("needs_anchor");
      expect(row.evidence).toContain("missing");
    });

    it("resolves an ambiguous term when EVERY occurrence lands on the same voice", () => {
      writeExchangeLedger();
      // "ταῦτα" occurs in both ΒΗΤΑ. turns and nowhere else. Whichever
      // occurrence the claim meant, the owner is the same — so resolving makes
      // no choice between them.
      writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end, terms: ["ταῦτα"] }]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("resolved");
      expect(row.owner).toBe("ΒΗΤΑ.");
    });

    it("records needs_anchor when a term's occurrences straddle voices", () => {
      writeExchangeLedger();
      // "τ" occurs in both ΒΗΤΑ. turns AND in the ΝΑΡΡ. question between them,
      // so the owner genuinely depends on which occurrence was meant.
      writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end, terms: ["τ"] }]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("needs_anchor");
      expect(row.evidence).toContain("produce different outcomes");
    });

    it("never picks among several occurrences of a term", () => {
      writeExchangeLedger();
      writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end, terms: ["ταῦτα"] }]);
      const support = buildClaimSupport("fixture")[0]!;
      // The ambiguous term yields no single exact range — every occurrence is
      // enumerated instead, and ownership must hold for all of them.
      expect(support.ranges).toEqual([]);
      expect(support.candidates[0]!.occurrences).toHaveLength(2);
    });

    it("resolves from a single-voiced context window without needing terms", () => {
      writeExchangeLedger();
      writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("resolved");
      expect(row.owner).toBe("ΒΗΤΑ.");
      expect(row.evidence).toContain("single-voiced context window");
    });

    it("reports cross_voice when support ranges genuinely land on different voices", () => {
      writeExchangeLedger();
      writeClaims([
        { id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end, terms: ["πρῶτον", "τί οὖν"] },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("cross_voice");
      expect(row.owner).toBe("(unattributed)");
    });

    it("preserves cross_voice when every repeated-term choice is cross-voice", () => {
      writeExchangeLedger();
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_TWO.end,
          terms: ["πρῶτον", "τί οὖν", "ταῦτα"],
        },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("cross_voice");
      expect(row.supportUniqueRanges).toBe(2);
      expect(row.supportCandidateRanges).toBe(2);
      expect(row.supportCandidateChoices).toBe(2);
      expect(row.evidence).toContain("all 2 occurrence choice(s) yield cross_voice");
    });

    it("preserves unresolved_span when every repeated-term choice is unresolved", () => {
      writeVoicesLedger([
        voiceBlock("voice_fixture_0001", 0, VOICED_TURN_END, ["ΝΑΡΡ."]),
        voiceBlock(
          "voice_fixture_0002",
          BETA_ONE.start,
          BETA_TWO.end,
          ["ΝΑΡΡ."],
          "unresolved",
        ),
      ]);
      writeVoiceIndex("fixture");
      writeClaims([
        {
          id: "claim_fixture_0001",
          start: BETA_ONE.start,
          end: BETA_TWO.end,
          terms: ["ταῦτα"],
        },
      ]);
      const row = rowFor("claim_fixture_0001")!;
      expect(row.status).toBe("unresolved_span");
      expect(row.supportUniqueRanges).toBe(0);
      expect(row.supportCandidateRanges).toBe(2);
      expect(row.supportCandidateChoices).toBe(2);
      expect(row.evidence).toContain("all 2 occurrence choice(s) yield unresolved_span");
    });
  });

  describe("observations", () => {
    it("attributes an observation inside one voice", () => {
      writeExchangeLedger();
      writeObservations([{ id: "obs_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
      const row = rowFor("obs_fixture_0001")!;
      expect(row.status).toBe("resolved");
      expect(row.owner).toBe("ΒΗΤΑ.");
      expect(row.outerTurnSpeaker).toBe("ΝΑΡΡ.");
    });

    it("reports a broad observation spanning voices as cross_voice with the shared chain", () => {
      writeExchangeLedger();
      writeObservations([{ id: "obs_fixture_0001", start: BETA_ONE.start, end: BETA_TWO.end }]);
      const row = rowFor("obs_fixture_0001")!;
      expect(row.status).toBe("cross_voice");
      expect(row.attributed).toBe(false);
      expect(row.ownerChain).toEqual(["ΝΑΡΡ."]);
    });

    it("refuses an observation whose covering span is unresolved", () => {
      writeVoicesLedger([
        voiceBlock("voice_fixture_0001", 0, VOICED_TURN_END, ["ΝΑΡΡ."]),
        voiceBlock("voice_fixture_0002", BETA_ONE.start, BETA_ONE.end, ["ΝΑΡΡ."], "unresolved"),
      ]);
      writeVoiceIndex("fixture");
      writeObservations([{ id: "obs_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
      const row = rowFor("obs_fixture_0001")!;
      expect(row.status).toBe("unresolved_span");
      expect(row.attributed).toBe(false);
    });
  });

  it("falls back to the printed turn siglum only when a turn carries no voice records", () => {
    writeExchangeLedger();
    // turn_fixture_0002 has no voice records at all, so its printed siglum is
    // the honest owner.
    writeObservations([{ id: "obs_fixture_0001", start: UNVOICED_TURN.start, end: UNVOICED_TURN.end }]);
    const row = rowFor("obs_fixture_0001")!;
    expect(row.status).toBe("turn_level");
    expect(row.owner).toBe("ΓΑΜΜΑ.");
  });

  it("refuses rather than falling back to turn_level when a voiced turn is unreviewed", () => {
    // The defect this lane exists to fix, wearing a new name: an unreviewed
    // voiced turn must not quietly hand its records back to the narrator.
    writeVoicesLedger([voiceBlock("voice_fixture_0001", 0, VOICED_TURN_END, ["ΝΑΡΡ."], "resolved", "unreviewed")]);
    expect(() => writeVoiceIndex("fixture")).toThrow(/none accepted/u);
    writeObservations([{ id: "obs_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
    expect(() => buildVoiceJoin("fixture")).toThrow(/Missing authoritative voice index/u);
  });

  it("round-trips through the TOON formatter", () => {
    writeExchangeLedger();
    writeObservations([{ id: "obs_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
    writeClaims([
      { id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end, stance: [[NARR_Q.start, NARR_Q.end]] },
    ]);
    const index = buildVoiceJoin("fixture");
    expect(parseVoiceJoinToon(formatVoiceJoinToon(index))).toEqual(index);
  });

  it("rejects the pre-cutover support_ranges join schema", () => {
    writeExchangeLedger();
    writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
    const legacy = formatVoiceJoinToon(buildVoiceJoin("fixture")).replace(
      "support_unique_ranges | support_candidate_ranges | support_candidate_choices",
      "support_ranges",
    );
    expect(() => parseVoiceJoinToon(legacy)).toThrow("Malformed voice join header");
  });

  it("writes byte-stable voice join files", () => {
    writeExchangeLedger();
    writeObservations([{ id: "obs_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
    writeClaims([{ id: "claim_fixture_0001", start: BETA_ONE.start, end: BETA_ONE.end }]);
    const first = writeVoiceJoin("fixture");
    const firstContent = readFileSync(join(root, first.path), "utf8");
    writeVoiceJoin("fixture");
    expect(readFileSync(join(root, first.path), "utf8")).toBe(firstContent);
  });

  it("writes outside derived/plato/joins so the site's join scan is untouched", () => {
    writeExchangeLedger();
    expect(writeVoiceJoin("fixture").path).toBe("derived/plato/joins/voices/fixture.toon");
  });
});

describe("live Symposium repeated-term outcomes", () => {
  function liveJoin() {
    return buildVoiceJoinFromIndex(
      "symposium",
      buildPreviewVoiceIndex("symposium"),
      `${"0".repeat(56)}preview`,
    );
  }

  it("resolves repaired claim 0112 to Socrates from its two unique support ranges", () => {
    const row = liveJoin().rows.find((candidate) => candidate.recordId === "claim_symposium_0112");
    expect(row).toMatchObject({
      status: "resolved",
      owner: "ΣΩ.",
      supportUniqueRanges: 2,
      supportCandidateRanges: 0,
      supportCandidateChoices: 0,
    });
  });

  it("resolves repaired claim 0135 when both repeated-term choices stay inside Diotima", () => {
    const row = liveJoin().rows.find((candidate) => candidate.recordId === "claim_symposium_0135");
    expect(row).toMatchObject({
      status: "resolved",
      owner: "ΔΙΟ.",
      supportUniqueRanges: 2,
      supportCandidateRanges: 2,
      supportCandidateChoices: 2,
    });
  });

  it("reports claim 0108's repeated-term evidence and Cartesian choice counts explicitly", () => {
    const row = liveJoin().rows.find((candidate) => candidate.recordId === "claim_symposium_0108");
    expect(row).toMatchObject({
      supportUniqueRanges: 0,
      supportCandidateRanges: 5,
      supportCandidateChoices: 6,
    });
  });
});

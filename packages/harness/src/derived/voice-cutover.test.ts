/**
 * End-to-end integration tests for the reported-speech voice cutover.
 *
 * These drive the REAL artifacts an operator runs — the compiler, the join, and
 * `scripts/voices/migrate-claim-speakers.ts` as a subprocess — against a
 * fixture repository, because the failures this lane must prevent live in the
 * seams between them. A unit test on the compiler cannot tell you that a
 * hand-written index would be accepted by the migration.
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  collectOrphanVoiceDerivedFailures,
  collectStaleVoiceDerivedFailures,
  collectVoiceClaimConsistencyFailures,
} from "../wiki/voices-validator.js";
import { buildVoiceJoin, buildVoiceJoinFromIndex, writeVoiceJoin, writeVoiceJoins } from "./voice-joins.js";
import { readVoiceIndex, writeVoiceIndex } from "./voices.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

const MIGRATION = join(
  new URL("../../../../", import.meta.url).pathname.replace(/\/$/, ""),
  "scripts/voices/migrate-claim-speakers.ts",
);

//   0        "{2a} "
//   5        "ΝΑΡΡ. "        printed siglum, narration
//   11       "ἔφη ΒΗΤΑ. "    named reporting formula at [11, 20)
//   21       "{2b} "
//   26       "πρῶτον καλον"  ΒΗΤΑ.'s reported speech
const SOURCE = "{2a} ΝΑΡΡ. ἔφη ΒΗΤΑ. {2b} πρῶτον καλον";
const NARRATION = { start: 0, end: 26 };
const SPEECH = { start: 26, end: SOURCE.length };

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function write(relative: string, content: string) {
  const absolute = join(root, relative);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

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

/** The reviewed note every active registry entry must cite. */
const DECISION_NOTE = "wiki/review/2026-07-25-fixture-cutover-execution.md";

/**
 * Activation is a registry decision, never an inference from data (the voice activation contract).
 * The fixture repo activates `fixture` by default because most of this file
 * tests post-cutover behavior; the activation-boundary suite below removes it.
 */
function activate(...slugs: string[]) {
  write(
    "derived/plato/voices/cutovers.toml",
    [
      "schema_version = 1",
      ...slugs.flatMap((slug) => [
        "",
        "[[dialogues]]",
        `slug = "${slug}"`,
        'status = "active"',
        `decision_note = "${DECISION_NOTE}"`,
      ]),
      "",
    ].join("\n"),
  );
}

function deactivate() {
  rmSync(join(root, "derived/plato/voices/cutovers.toml"), { force: true });
}

function writeTurnIndex(dialogue: string) {
  write(
    `derived/plato/turns/${dialogue}.toon`,
    [
      `dialogue: ${dialogue}`,
      `source_path: raw/plato/greek/${dialogue}.txt`,
      `source_sha256: ${sha256(SOURCE)}`,
      "sigla_path: derived/plato/turns/sigla.toml",
      `sigla_sha256: ${sha256("sigla")}`,
      "turns[1]:",
      "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
      `  turn_${dialogue}_0001 | ΝΑΡΡ.   | 2a           | 2b         | 0          | ${SOURCE.length}       | ${sha256(SOURCE)} | 5`,
      "",
    ].join("\n"),
  );
}

function writeBaseRepo() {
  write("raw/plato/greek/fixture.txt", SOURCE);
  writeTurnIndex("fixture");
  write("derived/plato/voices/sigla.toml", '[[dialogues]]\nslug = "fixture"\nsigla = ["ΝΑΡΡ.", "ΒΗΤΑ."]\n');
  write("wiki/observations/fixture.md", "");
  write(DECISION_NOTE, "# Fixture cutover execution\n\nReviewed and applied.\n");
  activate("fixture");
}

type VoiceOptions = {
  id: string;
  start: number;
  end: number;
  chain: string[];
  resolution?: string;
  review?: string;
  dialogue?: string;
};

function voiceBlock(options: VoiceOptions) {
  const { id, start, end, chain } = options;
  const dialogue = options.dialogue ?? "fixture";
  const resolution = options.resolution ?? "resolved";
  const lines = [
    "```yaml",
    `voice_id: ${id}`,
    `source_work: ${dialogue.charAt(0).toUpperCase()}${dialogue.slice(1)}`,
    `outer_turn_id: turn_${dialogue}_0001`,
    `stephanus_span: ${stephanusSpan(start, end)}`,
    "char_span:",
    `  start_char: ${start}`,
    `  end_char: ${end}`,
    `source_path: raw/plato/greek/${dialogue}.txt`,
    `source_sha256: "${sha256(SOURCE)}"`,
    `span_sha256: "${sha256(SOURCE.slice(start, end))}"`,
    `voice_chain: [${chain.map((siglum) => `"${siglum}"`).join(", ")}]`,
    `depth: ${resolution === "unresolved" ? chain.length + 1 : chain.length}`,
    `resolution: ${resolution}`,
  ];
  if (resolution === "resolved") {
    const siglum = start <= 5 && end >= 11;
    lines.push(
      "evidence_refs:",
      `  - kind: ${siglum ? "printed_siglum" : "named_reporting_formula"}`,
      `    text: "${siglum ? "ΝΑΡΡ." : "ἔφη ΒΗΤΑ."}"`,
      `    start_char: ${siglum ? 5 : 11}`,
      `    end_char: ${siglum ? 10 : 20}`,
    );
  } else {
    lines.push('unresolved_reason: "no cue names an owner"');
  }
  lines.push('limits: "Structure only."', `review_status: ${options.review ?? "accepted"}`, "```", "");
  return lines.join("\n");
}

/** Narration over the whole turn plus ΒΗΤΑ.'s reported speech inside it. */
function writeVoiceLedger(review = "accepted", dialogue = "fixture") {
  write(
    `wiki/voices/${dialogue}.md`,
    [
      voiceBlock({
        id: `voice_${dialogue}_0001`,
        start: 0,
        end: SOURCE.length,
        chain: ["ΝΑΡΡ."],
        review,
        dialogue,
      }),
      voiceBlock({
        id: `voice_${dialogue}_0002`,
        start: SPEECH.start,
        end: SPEECH.end,
        chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
        review,
        dialogue,
      }),
    ].join("\n"),
  );
}

/** A second canonical dialogue, so "all dialogues" has something to choose between. */
function writeSecondDialogue(slug = "other") {
  write(`raw/plato/greek/${slug}.txt`, SOURCE);
  writeTurnIndex(slug);
  write(`wiki/observations/${slug}.md`, "");
  writeVoiceLedger("accepted", slug);
  write(
    "derived/plato/voices/sigla.toml",
    [
      "[[dialogues]]",
      'slug = "fixture"',
      'sigla = ["ΝΑΡΡ.", "ΒΗΤΑ."]',
      "",
      "[[dialogues]]",
      `slug = "${slug}"`,
      'sigla = ["ΝΑΡΡ.", "ΒΗΤΑ."]',
      "",
    ].join("\n"),
  );
}

function citation(start: number, end: number, indent = "  ") {
  return [
    `${indent}source_path: raw/plato/greek/fixture.txt`,
    `${indent}start_char: ${start}`,
    `${indent}end_char: ${end}`,
    `${indent}text_sha256: "${sha256(SOURCE.slice(start, end))}"`,
  ].join("\n");
}

type ClaimOptions = { id: string; start: number; end: number; speaker: string; terms?: string[]; review?: string };

function writeClaims(entries: ClaimOptions[]) {
  const blocks = entries.map((entry) => {
    const lines = [
      "```yaml",
      `claim_id: ${entry.id}`,
      "source_ref:",
      citation(entry.start, entry.end),
      `speaker: ${entry.speaker}`,
    ];
    if (entry.terms) lines.push(`greek_terms: [${entry.terms.map((term) => `"${term}"`).join(", ")}]`);
    lines.push(`review_status: ${entry.review ?? "accepted"}`, "```");
    return lines.join("\n");
  });
  write("wiki/claims/fixture.md", `${blocks.join("\n\n")}\n`);
}

/** The claim inside ΒΗΤΑ.'s speech: currently mis-attributed to the narrator. */
function writeStandardClaims() {
  writeClaims([{ id: "claim_fixture_0001", start: SPEECH.start, end: SPEECH.end, speaker: "ΝΑΡΡ." }]);
}

function git(...args: string[]) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/** The migration script is the artifact an operator runs; drive it as one. */
function migrate(
  mode: "--plan" | "--apply" | "--verify",
  extraEnv: Record<string, string> = {},
) {
  // Bun 1.3 can return empty pipe captures for a nested Bun process under
  // `bun test`. Real file descriptors preserve the operator diagnostics and
  // let the integration suite assert them without changing the production CLI.
  const stdoutPath = join(root, ".migration-stdout");
  const stderrPath = join(root, ".migration-stderr");
  const stdoutFd = openSync(stdoutPath, "w");
  const stderrFd = openSync(stderrPath, "w");
  let result: ReturnType<typeof spawnSync>;
  try {
    result = spawnSync("bun", [MIGRATION, "fixture", mode], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", stdoutFd, stderrFd],
      env: { ...process.env, VOICES_REPO_ROOT: root, ...extraEnv },
    });
  } finally {
    closeSync(stdoutFd);
    closeSync(stderrFd);
  }
  const stdout = readFileSync(stdoutPath, "utf8");
  const stderr = readFileSync(stderrPath, "utf8");
  rmSync(stdoutPath, { force: true });
  rmSync(stderrPath, { force: true });
  return { ...result, stdout, stderr, output: [null, stdout, stderr] };
}

describe("the reported-speech voice attribution rollout voice cutover", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "voice-cutover-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeBaseRepo();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  describe("authority cannot be manufactured", () => {
    it("creates no authoritative artifact from an unreviewed ledger", () => {
      writeVoiceLedger("unreviewed");
      expect(() => writeVoiceIndex("fixture")).toThrow(/none accepted/u);
      expect(existsSync(join(root, "derived/plato/voices/fixture.toon"))).toBe(false);
    });

    it("refuses a ledger with one accepted voiced turn and one pending record", () => {
      write(
        "wiki/voices/fixture.md",
        [
          voiceBlock({ id: "voice_fixture_0001", start: 0, end: SOURCE.length, chain: ["ΝΑΡΡ."] }),
          voiceBlock({
            id: "voice_fixture_0002",
            start: SPEECH.start,
            end: SPEECH.end,
            chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
            review: "unreviewed",
          }),
        ].join("\n"),
      );
      expect(() => writeVoiceIndex("fixture")).toThrow(/Incomplete review cohort/u);
    });

    it("cannot compile a malformed ledger", () => {
      write("wiki/voices/fixture.md", voiceBlock({ id: "voice_fixture_0001", start: 0, end: 5, chain: ["ΝΑΡΡ."] }));
      // Leaves most of the turn uncovered — the validator's own invariant.
      expect(() => writeVoiceIndex("fixture")).toThrow(/fails validation/u);
    });

    it("refuses an EMPTY index", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      const path = join(root, "derived/plato/voices/fixture.toon");
      writeFileSync(path, readFileSync(path, "utf8").replace(/^voices\[\d+\]:$/mu, "voices[0]:").split("\n").slice(0, 9).join("\n") + "\n", "utf8");
      expect(() => readVoiceIndex("fixture")).toThrow(/zero voice records|does not match what/u);
    });

    it("refuses a STALE index after the ledger moves underneath it", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      // Re-write the ledger with the same records but a trailing comment, so the
      // compiled artifact no longer corresponds to its input.
      writeFileSync(join(root, "wiki/voices/fixture.md"), `${readFileSync(join(root, "wiki/voices/fixture.md"), "utf8")}\n<!-- edited -->\n`, "utf8");
      expect(() => readVoiceIndex("fixture")).toThrow(/stale/u);
    });

    it("refuses a FORGED index whose rows the ledger never produced", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      const path = join(root, "derived/plato/voices/fixture.toon");
      // Flip the owner of the deepest span by hand, leaving every hash intact.
      writeFileSync(path, readFileSync(path, "utf8").replace("ΝΑΡΡ.>ΒΗΤΑ.", "ΝΑΡΡ.>ΓΑΜΜΑ"), "utf8");
      expect(() => readVoiceIndex("fixture")).toThrow(/does not match what/u);
    });

    it("refuses an ORPHANED index whose ledger is gone", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      rmSync(join(root, "wiki/voices/fixture.md"));
      expect(() => readVoiceIndex("fixture")).toThrow(/orphaned/u);
    });
  });

  describe("segmentation", () => {
    it("cannot turn a mixed paragraph into a single-owner span", () => {
      // Two owners over the same characters at the same depth is exactly what a
      // "{p} is one speaker" segmentation produces when the paragraph hands off.
      write(
        "wiki/voices/fixture.md",
        [
          voiceBlock({ id: "voice_fixture_0001", start: 0, end: SOURCE.length, chain: ["ΝΑΡΡ."] }),
          voiceBlock({
            id: "voice_fixture_0002",
            start: SPEECH.start,
            end: SPEECH.end,
            chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          }),
          voiceBlock({
            id: "voice_fixture_0003",
            start: SPEECH.start,
            end: SPEECH.end,
            chain: ["ΝΑΡΡ."],
            resolution: "unresolved",
          }),
        ].join("\n"),
      );
      expect(() => writeVoiceIndex("fixture")).toThrow(/overlap_same_depth|fails validation/u);
    });
  });

  describe("migration", () => {
    beforeEach(() => {
      git("init", "-q");
      git("config", "user.email", "fixture@example.com");
      git("config", "user.name", "fixture");
    });

    it("refuses to migrate before the ledger is accepted and compiled", () => {
      writeVoiceLedger("unreviewed");
      writeStandardClaims();
      const before = readFileSync(join(root, "wiki/claims/fixture.md"), "utf8");
      const result = migrate("--plan");
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("does not exist");
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toBe(before);
    });

    it("refuses to migrate on a forged index", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      const path = join(root, "derived/plato/voices/fixture.toon");
      writeFileSync(path, readFileSync(path, "utf8").replace("ΝΑΡΡ.>ΒΗΤΑ.", "ΝΑΡΡ.>ΓΑΜΜΑ"), "utf8");
      const before = readFileSync(join(root, "wiki/claims/fixture.md"), "utf8");
      expect(migrate("--apply").status).not.toBe(0);
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toBe(before);
    });

    it("requires a reviewed plan before apply and creates no artifact on refusal", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      const before = readFileSync(join(root, "wiki/claims/fixture.md"), "utf8");
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");

      const result = migrate("--apply");

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("no reviewed plan artifact");
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toBe(before);
      expect(existsSync(artifactPath)).toBe(false);
    });

    it("allows a dirty target when its exact bytes are bound by the reviewed plan", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");

      const claimsPath = join(root, "wiki/claims/fixture.md");
      writeFileSync(claimsPath, `${readFileSync(claimsPath, "utf8")}\n<!-- reviewed but uncommitted -->\n`, "utf8");
      expect(git("diff", "--quiet", "HEAD", "--", "wiki/claims/fixture.md").status).not.toBe(0);
      expect(migrate("--plan").status).toBe(0);
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const reviewedPlan = readFileSync(artifactPath, "utf8");

      const result = migrate("--apply");

      expect(result.status).toBe(0);
      expect(readFileSync(claimsPath, "utf8")).toContain("speaker: ΒΗΤΑ.");
      expect(readFileSync(claimsPath, "utf8")).toContain("<!-- reviewed but uncommitted -->");
      expect(readFileSync(artifactPath, "utf8")).toBe(reviewedPlan);
    });

    it("refuses claim-ledger drift after plan without replacing the reviewed artifact", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      expect(migrate("--plan").status).toBe(0);
      const claimsPath = join(root, "wiki/claims/fixture.md");
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const reviewedPlan = readFileSync(artifactPath, "utf8");
      const drifted = `${readFileSync(claimsPath, "utf8")}\n<!-- drift after review -->\n`;
      writeFileSync(claimsPath, drifted, "utf8");

      const result = migrate("--apply");

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("does not match the current migration plan");
      expect(readFileSync(claimsPath, "utf8")).toBe(drifted);
      expect(readFileSync(artifactPath, "utf8")).toBe(reviewedPlan);
    });

    it("refuses voice-index drift after plan without touching claims or artifact", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      expect(migrate("--plan").status).toBe(0);
      const claimsPath = join(root, "wiki/claims/fixture.md");
      const before = readFileSync(claimsPath, "utf8");
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const reviewedPlan = readFileSync(artifactPath, "utf8");

      const ledgerPath = join(root, "wiki/voices/fixture.md");
      writeFileSync(ledgerPath, `${readFileSync(ledgerPath, "utf8")}\n<!-- accepted authority revision -->\n`, "utf8");
      writeVoiceIndex("fixture");

      const result = migrate("--apply");

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("does not match the current migration plan");
      expect(readFileSync(claimsPath, "utf8")).toBe(before);
      expect(readFileSync(artifactPath, "utf8")).toBe(reviewedPlan);
    });

    it("refuses a tampered change list without repairing or replacing the artifact", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      expect(migrate("--plan").status).toBe(0);
      const claimsPath = join(root, "wiki/claims/fixture.md");
      const before = readFileSync(claimsPath, "utf8");
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as { changes: unknown[] };
      artifact.changes = [];
      const tampered = `${JSON.stringify(artifact, null, 2)}\n`;
      writeFileSync(artifactPath, tampered, "utf8");

      const result = migrate("--apply");

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("does not match the current migration plan");
      expect(readFileSync(claimsPath, "utf8")).toBe(before);
      expect(readFileSync(artifactPath, "utf8")).toBe(tampered);
    });

    it("leaves claims byte-identical when an accepted claim blocks the cutover", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      // A term that is not in its own window can never resolve, and the claim is
      // accepted — so the whole all-or-nothing cutover must refuse.
      writeClaims([
        { id: "claim_fixture_0001", start: SPEECH.start, end: SPEECH.end, speaker: "ΝΑΡΡ." },
        { id: "claim_fixture_0002", start: NARRATION.start, end: SOURCE.length, speaker: "ΝΑΡΡ.", terms: ["ἀπόν"] },
      ]);
      const before = readFileSync(join(root, "wiki/claims/fixture.md"), "utf8");
      git("add", "-A");
      git("commit", "-qm", "fixture");

      const planned = migrate("--plan");
      expect(planned.status).toBe(0);
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const reviewedPlan = readFileSync(artifactPath, "utf8");

      const result = migrate("--apply");

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("refusing a partial cutover");
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toBe(before);
      expect(readFileSync(artifactPath, "utf8")).toBe(reviewedPlan);
    });

    it("cleans up an aborted atomic write and preserves the original claim ledger", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      expect(migrate("--plan").status).toBe(0);
      const claimsPath = join(root, "wiki/claims/fixture.md");
      const before = readFileSync(claimsPath, "utf8");
      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const reviewedPlan = readFileSync(artifactPath, "utf8");

      const result = migrate("--apply", { VOICES_MIGRATION_TEST_ABORT_AFTER_TEMP_WRITE: "1" });

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("simulated abort after temporary write");
      expect(readFileSync(claimsPath, "utf8")).toBe(before);
      expect(readFileSync(artifactPath, "utf8")).toBe(reviewedPlan);
      expect(readdirSync(join(root, "wiki/claims")).filter((name) => name.includes(".tmp-")).length).toBe(0);
    });

    it("reaches green only after the migration is applied", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");

      // Before: the claim still carries the outer narrator, and the join
      // disagrees with it.
      const joinBefore = buildVoiceJoin("fixture");
      const rowBefore = joinBefore.rows.find((row) => row.recordId === "claim_fixture_0001")!;
      expect(rowBefore.owner).toBe("ΒΗΤΑ.");
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toContain("speaker: ΝΑΡΡ.");
      expect(migrate("--verify").status).not.toBe(0);

      // Apply, then verify passes.
      expect(migrate("--plan").status).toBe(0);
      const applied = migrate("--apply");
      expect(applied.status).toBe(0);
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toContain("speaker: ΒΗΤΑ.");
      writeVoiceJoin("fixture");
      const verified = migrate("--verify");
      expect(verified.status).toBe(0);
      expect(verified.stdout).toContain("PASS");
    });

    it("fails --verify when the owner drifts after the migration", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");
      expect(migrate("--plan").status).toBe(0);
      expect(migrate("--apply").status).toBe(0);
      writeVoiceJoin("fixture");
      expect(migrate("--verify").status).toBe(0);

      // Hand-edit the migrated speaker: the ledger still says ΒΗΤΑ.
      const claimsPath = join(root, "wiki/claims/fixture.md");
      writeFileSync(claimsPath, readFileSync(claimsPath, "utf8").replace("speaker: ΒΗΤΑ.", "speaker: ΝΑΡΡ."), "utf8");
      writeVoiceJoin("fixture");

      const result = migrate("--verify");
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("does not match the applied migration");
    });

    it("fails --verify when authority drifts for a claim that was originally already correct", () => {
      // First authority has no embedded child, so the claim is already correct
      // as narration and is absent from artifact.changes.
      write(
        "wiki/voices/fixture.md",
        voiceBlock({ id: "voice_fixture_0001", start: 0, end: SOURCE.length, chain: ["ΝΑΡΡ."] }),
      );
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");
      writeVoiceIndex("fixture");

      expect(migrate("--plan").status).toBe(0);
      expect(migrate("--apply").status).toBe(0);
      writeVoiceJoin("fixture");
      expect(migrate("--verify").status).toBe(0);

      const artifact = JSON.parse(
        readFileSync(join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json"), "utf8"),
      ) as { changes: unknown[] };
      expect(artifact.changes).toEqual([]);

      // A newly accepted embedded span changes the owner to ΒΗΤΑ. The claim
      // ledger itself has not moved, so verification must notice the authority
      // hash rather than relying on the old list of changed claims.
      writeVoiceLedger();
      writeVoiceIndex("fixture");

      const result = migrate("--verify");
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("changed after the migration");
    });

    it("verifies every accepted claim even if the recorded change list is forged empty", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");
      expect(migrate("--plan").status).toBe(0);
      expect(migrate("--apply").status).toBe(0);

      const claimsPath = join(root, "wiki/claims/fixture.md");
      writeFileSync(claimsPath, readFileSync(claimsPath, "utf8").replace("speaker: ΒΗΤΑ.", "speaker: ΝΑΡΡ."), "utf8");
      writeVoiceJoin("fixture");

      const artifactPath = join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
        generated_from: { claim_ledger_sha256_after: string };
        changes: unknown[];
      };
      artifact.generated_from.claim_ledger_sha256_after = sha256(readFileSync(claimsPath, "utf8"));
      artifact.changes = [];
      writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

      const result = migrate("--verify");
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("accepted claim has speaker");
    });
  });

  describe("stored join integrity", () => {
    function acceptedFixture() {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
    }

    function integrityFailures() {
      return collectStaleVoiceDerivedFailures(
        "fixture",
        readFileSync(join(root, "wiki/voices/fixture.md"), "utf8"),
      );
    }

    it("requires a stored join whenever authoritative voice data exists", () => {
      acceptedFixture();
      expect(integrityFailures().join("\n")).toContain("is missing while authoritative");
    });

    it("accepts only the deterministic join over the current three inputs", () => {
      acceptedFixture();
      writeVoiceJoin("fixture");
      expect(integrityFailures()).toEqual([]);
    });

    it("rejects claim-ledger and observation-ledger drift", () => {
      acceptedFixture();
      writeVoiceJoin("fixture");

      writeFileSync(join(root, "wiki/claims/fixture.md"), `${readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")}\n`, "utf8");
      expect(integrityFailures().join("\n")).toContain("wiki/claims/fixture.md");

      writeStandardClaims();
      writeVoiceJoin("fixture");
      writeFileSync(join(root, "wiki/observations/fixture.md"), "<!-- drift -->\n", "utf8");
      expect(integrityFailures().join("\n")).toContain("wiki/observations/fixture.md");
    });

    it("rejects forged join rows even when every provenance header remains current", () => {
      acceptedFixture();
      writeVoiceJoin("fixture");
      const path = join(root, "derived/plato/joins/voices/fixture.toon");
      const original = readFileSync(path, "utf8");
      const forged = original.replace("ΒΗΤΑ.", "ΝΑΡΡ.");
      expect(forged).not.toBe(original);
      writeFileSync(path, forged, "utf8");
      expect(integrityFailures().join("\n")).toContain("deterministic rebuild");
    });

    it("rejects an orphaned stored join when its voice index is absent", () => {
      acceptedFixture();
      writeVoiceJoin("fixture");
      rmSync(join(root, "derived/plato/voices/fixture.toon"));
      expect(integrityFailures().join("\n")).toContain("is orphaned");
    });

    it("finds artifacts whose ledger was deleted", () => {
      acceptedFixture();
      writeVoiceJoin("fixture");
      rmSync(join(root, "wiki/voices/fixture.md"));
      const failures = collectOrphanVoiceDerivedFailures().join("\n");
      expect(failures).toContain("derived/plato/voices/fixture.toon is orphaned");
      expect(failures).toContain("derived/plato/joins/voices/fixture.toon is orphaned");
    });
  });

  /**
   * The voice activation contract. Extracting reported turns, accepting them, and rewriting claim
   * speakers were one event; they are now three. Everything here asserts the
   * seam: a dialogue may hold accepted, compiled, fully validated reported-turn
   * data and still have no effect whatsoever on any claim.
   */
  describe("activation boundary", () => {
    function integrityFailures(dialogue = "fixture") {
      return collectStaleVoiceDerivedFailures(
        dialogue,
        readFileSync(join(root, `wiki/voices/${dialogue}.md`), "utf8"),
      );
    }

    describe("a dialogue absent from the registry", () => {
      beforeEach(() => {
        deactivate();
        writeVoiceLedger();
        writeStandardClaims();
      });

      it("still compiles a nonempty authoritative index", () => {
        const written = writeVoiceIndex("fixture");

        expect(written.recordCount).toBe(2);
        expect(readVoiceIndex("fixture").records).toHaveLength(2);
      });

      it("does not require a materialized join", () => {
        writeVoiceIndex("fixture");

        expect(integrityFailures()).toEqual([]);
      });

      it("does not check its claim speakers against the reported-turn data", () => {
        writeVoiceIndex("fixture");
        // The claim sits inside ΒΗΤΑ.'s reported speech but is still recorded
        // against the printed narrator. Under the old coupling, compiling the
        // index alone made that a validation failure — which is precisely what
        // made Phaedo's 102 accepted claims look like an extraction blocker.
        expect(collectVoiceClaimConsistencyFailures("fixture")).toEqual([]);
        expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toContain("speaker: ΝΑΡΡ.");
      });

      it("refuses to write a join, naming the registry", () => {
        writeVoiceIndex("fixture");

        expect(() => writeVoiceJoin("fixture")).toThrow(/cutovers\.toml/u);
        expect(existsSync(join(root, "derived/plato/joins/voices/fixture.toon"))).toBe(false);
      });

      it("rejects a stored join as unauthorized consumer state", () => {
        writeVoiceIndex("fixture");
        activate("fixture");
        writeVoiceJoin("fixture");
        deactivate();

        expect(integrityFailures().join("\n")).toContain("not activated");
      });

      it("keeps the in-memory preview available and non-mutating", () => {
        writeVoiceIndex("fixture");

        const preview = buildVoiceJoin("fixture");

        expect(preview.rows.find((row) => row.recordId === "claim_fixture_0001")?.owner).toBe("ΒΗΤΑ.");
        expect(existsSync(join(root, "derived/plato/joins/voices/fixture.toon"))).toBe(false);
      });
    });

    it("writes joins for exactly the active registry entries", () => {
      writeVoiceLedger();
      writeStandardClaims();
      writeSecondDialogue();
      writeVoiceIndex("fixture");
      writeVoiceIndex("other");
      activate("fixture");

      const written = writeVoiceJoins();

      expect(written.map((entry) => entry.dialogue)).toEqual(["fixture"]);
      expect(existsSync(join(root, "derived/plato/joins/voices/other.toon"))).toBe(false);
    });

    it("restores index, join, and claim requirements when an entry is added", () => {
      writeVoiceLedger();
      writeStandardClaims();
      writeVoiceIndex("fixture");
      activate("fixture");

      // Active and missing its join: fail closed.
      expect(integrityFailures().join("\n")).toContain("is missing while authoritative");

      writeVoiceJoin("fixture");
      expect(integrityFailures()).toEqual([]);

      // Active with a join whose owner the claim ledger contradicts: fail closed.
      expect(collectVoiceClaimConsistencyFailures("fixture").join("\n")).toContain("resolves its owner to");
    });

    it("fails an active dialogue that has no compiled index at all", () => {
      writeVoiceLedger("unreviewed");
      activate("fixture");

      expect(integrityFailures().join("\n")).toContain("is activated");
    });

    it("derives voiced turns from the compiled index rather than ledger presence", () => {
      // The join must read the artifact, not the working file. Handed an index
      // that carries no record for the turn, it reports the printed siglum even
      // though the ledger on disk speaks about that turn at length. On the
      // authoritative path the two agree — the compiler refuses to emit an index
      // while any voiced turn is unreviewed — so this only changes previews,
      // which is where reading an unaccepted ledger was never legitimate.
      writeVoiceLedger();
      writeStandardClaims();
      writeVoiceIndex("fixture");
      const stored = readVoiceIndex("fixture");

      const join = buildVoiceJoinFromIndex("fixture", { ...stored, records: [] }, sha256("empty"));

      const row = join.rows.find((entry) => entry.recordId === "claim_fixture_0001")!;
      expect(row.status).toBe("turn_level");
      expect(row.owner).toBe("ΝΑΡΡ.");
    });
  });

  /**
   * The Symposium re-review step 2, fixtures 4-7.
   *
   * The Symposium re-review edits an ALREADY ACTIVE ledger, which is the one
   * shape none of the suites above exercise end to end: every migration test
   * here builds its authority once and then attacks it. Re-review moves the
   * authority underneath a live consumer, so the failure mode to pin is a tree
   * that looks finished while the index, the join, and the claim ledger disagree
   * about who said what.
   *
   * These also fix the reviewed-discourse authority path at the consumer seam.
   * `reviewed_attribution` was added by the Phaedo discourse attribution review for a dialogue with no claim
   * consumer at all, so nothing yet asserts that an adjudicated owner migrates a
   * claim exactly as a byte-cited one does — nor that it is confined to the
   * spans it actually covers.
   */
  describe("re-reviewing an active ledger", () => {
    /** A resolved record whose authority is a reviewed adjudication, not bytes. */
    function reviewedBlock(options: { id: string; start: number; end: number; chain: string[] }) {
      const { id, start, end, chain } = options;
      return [
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
        `voice_chain: [${chain.map((siglum) => `"${siglum}"`).join(", ")}]`,
        `depth: ${chain.length}`,
        "resolution: resolved",
        "reviewed_attribution:",
        "  kind: discourse_resolution",
        `  candidate_owners: [${chain.map((siglum) => `"${siglum}"`).join(", ")}]`,
        "  context_span:",
        "    start_char: 0",
        `    end_char: ${SOURCE.length}`,
        `    text_sha256: "${sha256(SOURCE)}"`,
        '  rationale: "The named formula earlier in the turn hands the floor over and no later cue takes it back."',
        'limits: "A reviewed adjudication over the cited context, not a naming formula."',
        "review_status: accepted",
        "```",
        "",
      ].join("\n");
    }

    /** Narration over the whole turn; the reported speech is ADJUDICATED, not cited. */
    function writeReviewedLedger() {
      write(
        "wiki/voices/fixture.md",
        [
          voiceBlock({ id: "voice_fixture_0001", start: 0, end: SOURCE.length, chain: ["ΝΑΡΡ."] }),
          reviewedBlock({ id: "voice_fixture_0002", start: SPEECH.start, end: SPEECH.end, chain: ["ΝΑΡΡ.", "ΒΗΤΑ."] }),
        ].join("\n"),
      );
    }

    /** The narration-only authority the re-review starts from. */
    function writeNarrationOnlyLedger() {
      write(
        "wiki/voices/fixture.md",
        voiceBlock({ id: "voice_fixture_0001", start: 0, end: SOURCE.length, chain: ["ΝΑΡΡ."] }),
      );
    }

    function integrityFailures() {
      return collectStaleVoiceDerivedFailures("fixture", readFileSync(join(root, "wiki/voices/fixture.md"), "utf8"));
    }

    function migrationArtifact() {
      return JSON.parse(
        readFileSync(join(root, "wiki/review/2026-07-voices/fixture-speaker-migration.json"), "utf8"),
      ) as { changes: { claimId: string; from: string; to: string; evidence: string }[] };
    }

    it("plans an exact speaker change from a reviewed discourse resolution", () => {
      // The claim's exact support lies under the adjudicated owner. An owner
      // established by review must move it exactly as a cited one does; if it
      // did not, the Phaedo discourse attribution review's authority path would be invisible to consumers.
      writeNarrationOnlyLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");
      expect(migrate("--plan").status).toBe(0);
      expect(migrationArtifact().changes).toEqual([]);

      writeReviewedLedger();
      writeVoiceIndex("fixture");
      const compiled = readVoiceIndex("fixture").records.find((record) => record.voiceId === "voice_fixture_0002")!;
      expect(compiled.resolutionBasis).toBe("reviewed_discourse");

      expect(migrate("--plan").status).toBe(0);
      expect(migrationArtifact().changes).toEqual([
        expect.objectContaining({ claimId: "claim_fixture_0001", from: "ΝΑΡΡ.", to: "ΒΗΤΑ." }),
      ]);
      // The plan must name the adjudicated record as its structural basis, so a
      // reviewer can check the owner against the reviewed span rather than
      // against the claim's content.
      expect(migrationArtifact().changes[0]!.evidence).toContain("voice_fixture_0002");
    });

    it("changes no claim when the reviewed resolution covers no claim's support", () => {
      // Same adjudication, but the only claim's support sits in the narration
      // outside it. A re-review must not repaint spans it never touched.
      writeNarrationOnlyLedger();
      writeVoiceIndex("fixture");
      writeClaims([{ id: "claim_fixture_0001", start: NARRATION.start, end: NARRATION.end, speaker: "ΝΑΡΡ." }]);
      git("add", "-A");
      git("commit", "-qm", "fixture");

      writeReviewedLedger();
      writeVoiceIndex("fixture");
      const before = readFileSync(join(root, "wiki/claims/fixture.md"), "utf8");

      expect(migrate("--plan").status).toBe(0);
      expect(migrationArtifact().changes).toEqual([]);
      expect(migrate("--apply").status).toBe(0);
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toBe(before);
    });

    it("makes the stored index and join stale the moment the active ledger is edited", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      writeVoiceJoin("fixture");
      expect(integrityFailures()).toEqual([]);

      // Step 4 of the plan: the ledger changes and nothing downstream has been
      // regenerated yet. This is the interval that must never be committed.
      writeReviewedLedger();
      expect(integrityFailures().join("\n")).toContain("derived/plato/voices/fixture.toon");

      // Recompiling the index alone is not enough: the join still binds the old
      // index hash, so the chain stays fail-closed until it is rebuilt too.
      writeVoiceIndex("fixture");
      expect(integrityFailures().join("\n")).toContain("derived/plato/joins/voices/fixture.toon");

      writeVoiceJoin("fixture");
      expect(integrityFailures()).toEqual([]);
    });

    it("goes green again only after the whole regenerated chain is applied in order", () => {
      writeVoiceLedger();
      writeVoiceIndex("fixture");
      writeStandardClaims();
      git("add", "-A");
      git("commit", "-qm", "fixture");
      expect(migrate("--plan").status).toBe(0);
      expect(migrate("--apply").status).toBe(0);
      writeVoiceJoin("fixture");
      expect(migrate("--verify").status).toBe(0);

      // Re-review: the same span keeps the same owner but its authority becomes
      // a reviewed adjudication, so every downstream hash moves.
      writeReviewedLedger();
      expect(migrate("--verify").status).not.toBe(0);

      writeVoiceIndex("fixture");
      expect(migrate("--plan").status).toBe(0);
      expect(migrate("--apply").status).toBe(0);
      writeVoiceJoin("fixture");

      const verified = migrate("--verify");
      expect(verified.status).toBe(0);
      expect(verified.stdout).toContain("PASS");
      expect(integrityFailures()).toEqual([]);
      expect(collectVoiceClaimConsistencyFailures("fixture")).toEqual([]);
      expect(readFileSync(join(root, "wiki/claims/fixture.md"), "utf8")).toContain("speaker: ΒΗΤΑ.");
    });
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { collectClaimSpeakerConsistencyFailures } from "../wiki/voices-validator.js";
import { buildClaimSupport } from "./claim-support.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

//        0         1         2         3         4         5
//        0123456789012345678901234567890123456789012345678901234
// The trailing clause carries commas INSIDE what a claim quotes as one term.
// Appended so every offset above stays put.
const SOURCE = "alpha πρῶτον beta ταῦτα gamma δεύτερον ταῦτα delta, ὦ Σώκρατες, εὖ λέγεις";
const COMMA_PHRASE = "delta, ὦ Σώκρατες, εὖ λέγεις";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function citation(start: number, end: number, indent = "  ") {
  return [
    `${indent}source_path: raw/plato/greek/fixture.txt`,
    `${indent}start_char: ${start}`,
    `${indent}end_char: ${end}`,
    `${indent}text_sha256: "${sha256(SOURCE.slice(start, end))}"`,
  ].join("\n");
}

function writeClaims(blocks: string[]) {
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(join(root, "wiki/claims/fixture.md"), `${blocks.join("\n\n")}\n`, "utf8");
}

function claim(options: {
  id?: string;
  start?: number;
  end?: number;
  terms?: string[];
  inlineTerms?: string;
  stance?: Array<[number, number]>;
  speakerRange?: [number, number];
}) {
  const lines = [
    "```yaml",
    `claim_id: ${options.id ?? "claim_fixture_0001"}`,
    "source_ref:",
    citation(options.start ?? 0, options.end ?? SOURCE.length),
    "speaker: ΝΑΡΡ.",
  ];
  if (options.inlineTerms) lines.push(`greek_terms: [${options.inlineTerms}]`);
  else if (options.terms) {
    lines.push("greek_terms:");
    for (const term of options.terms) lines.push(`  - ${term}`);
  }
  if (options.speakerRange) {
    lines.push(
      "speaker_source_ref:",
      "  source_path: raw/plato/greek/fixture.txt",
      `  start_char: ${options.speakerRange[0]}`,
      `  end_char: ${options.speakerRange[1]}`,
      `  text_sha256: "${sha256(SOURCE.slice(...options.speakerRange))}"`,
    );
  }
  if (options.stance) {
    lines.push("stance_events:");
    for (const [start, end] of options.stance) {
      lines.push("  - kind: challenged", "    source_ref:", citation(start, end, "      "));
    }
  }
  lines.push("review_status: accepted", "```");
  return lines.join("\n");
}

describe("claim support ranges", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "claim-support-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
    writeFileSync(join(root, "raw/plato/greek/fixture.txt"), SOURCE, "utf8");
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("locates uniquely occurring terms as exact byte ranges", () => {
    writeClaims([claim({ terms: ["πρῶτον"] })]);
    expect(buildClaimSupport("fixture")[0]!.ranges).toEqual([
      { term: "πρῶτον", startChar: 6, endChar: 12 },
    ]);
  });

  it("permits multiple noncontiguous support ranges", () => {
    writeClaims([claim({ terms: ["πρῶτον", "δεύτερον"] })]);
    const support = buildClaimSupport("fixture")[0]!;
    expect(support.ranges.map((range) => range.term)).toEqual(["πρῶτον", "δεύτερον"]);
    expect(support.ranges[0]!.endChar).toBeLessThan(support.ranges[1]!.startChar);
    expect(support.anchorGaps).toEqual([]);
  });

  it("reports a term that does not occur in the window as missing", () => {
    writeClaims([claim({ terms: ["ἀπόν"] })]);
    expect(buildClaimSupport("fixture")[0]!.anchorGaps).toEqual([
      { term: "ἀπόν", reason: "missing", occurrences: 0 },
    ]);
  });

  it("enumerates every occurrence of an ambiguous term rather than choosing one", () => {
    // Ambiguity is not an anchor gap: it is a set of candidates. Ownership is
    // decided later, and only if EVERY candidate lands on the same voice.
    writeClaims([claim({ terms: ["ταῦτα"] })]);
    const support = buildClaimSupport("fixture")[0]!;
    expect(support.anchorGaps).toEqual([]);
    expect(support.ranges).toEqual([]);
    expect(support.candidates).toHaveLength(1);
    expect(support.candidates[0]!.term).toBe("ταῦτα");
    expect(support.candidates[0]!.occurrences).toHaveLength(2);
  });

  it("keeps a single quoted Greek phrase containing commas intact", () => {
    // Regression: splitting the flow sequence on every comma shredded this one
    // term into three fragments, two of them carrying a stray quote character.
    // None occurs in the source, so all three reported MISSING and a
    // well-anchored claim came back needs_anchor.
    writeClaims([claim({ inlineTerms: `"${COMMA_PHRASE}"` })]);
    const support = buildClaimSupport("fixture")[0]!;
    expect(support.terms).toEqual([COMMA_PHRASE]);
    expect(support.anchorGaps).toEqual([]);
    expect(support.ranges).toEqual([
      { term: COMMA_PHRASE, startChar: SOURCE.indexOf(COMMA_PHRASE), endChar: SOURCE.length },
    ]);
  });

  it("still splits a flow sequence on commas BETWEEN quoted scalars", () => {
    writeClaims([claim({ inlineTerms: `"πρῶτον", "${COMMA_PHRASE}"` })]);
    expect(buildClaimSupport("fixture")[0]!.terms).toEqual(["πρῶτον", COMMA_PHRASE]);
  });

  it("never searches outside the claim's own context window", () => {
    // "δεύτερον" sits at 29; a window ending at 25 must not see it.
    writeClaims([claim({ start: 0, end: 25, terms: ["δεύτερον"] })]);
    expect(buildClaimSupport("fixture")[0]!.anchorGaps[0]!.reason).toBe("missing");
  });

  it("reads inline and block greek_terms lists alike", () => {
    writeClaims([claim({ inlineTerms: '"πρῶτον", "δεύτερον"' })]);
    expect(buildClaimSupport("fixture")[0]!.ranges).toHaveLength(2);
  });

  it("keeps stance-event citations separate from the claim's own", () => {
    writeClaims([claim({ start: 0, end: 20, stance: [[29, 38]] })]);
    const support = buildClaimSupport("fixture")[0]!;
    expect(support.contextStartChar).toBe(0);
    expect(support.contextEndChar).toBe(20);
    expect(support.stanceEvents).toEqual([{ index: 0, kind: "challenged", startChar: 29, endChar: 38 }]);
  });

  it("reads speaker_source_ref by field name without treating it as a stance event", () => {
    writeClaims([claim({ start: 0, end: SOURCE.length, speakerRange: [6, 12], stance: [[29, 38]] })]);
    const support = buildClaimSupport("fixture")[0]!;
    expect(support.speakerRange).toEqual({ startChar: 6, endChar: 12 });
    expect(support.stanceEvents).toEqual([{ index: 0, kind: "challenged", startChar: 29, endChar: 38 }]);
  });
});

describe("live Symposium source-bound greek_terms", () => {
  it("retains only claim 0054 terms that occur exactly in its cited Greek bytes", () => {
    const support = buildClaimSupport("symposium").find(
      (candidate) => candidate.claimId === "claim_symposium_0054",
    );
    expect(support?.terms).toEqual([
      "ὅλον",
      "στρογγύλον",
      "νῶτον",
    ]);
  });

  it("drops claim 0172's normalized apostrophe variant outside the exact source bytes", () => {
    const support = buildClaimSupport("symposium").find(
      (candidate) => candidate.claimId === "claim_symposium_0172",
    );
    expect(support?.terms).toEqual([
      "πολλοῦ ἐνδεὴς ὢν",
      "ἐμαυτοῦ μὲν ἀμελῶ",
    ]);
  });
});

describe("post-cutover claim speaker consistency", () => {
  const row = (overrides: Partial<Parameters<typeof collectClaimSpeakerConsistencyFailures>[1]["rows"][number]> = {}) => ({
    recordId: "claim_fixture_0001",
    recordKind: "claim",
    reviewStatus: "accepted",
    owner: "ΒΗΤΑ.",
    status: "resolved",
    evidence: "voice_fixture_0002",
    ...overrides,
  });

  it("passes when every accepted claim's speaker equals its resolved owner", () => {
    const failures = collectClaimSpeakerConsistencyFailures(
      "fixture",
      { rows: [row()], stanceRows: [] },
      new Map([["claim_fixture_0001", "ΒΗΤΑ."]]),
    );
    expect(failures).toEqual([]);
  });

  it("fails when a materialized speaker disagrees with the resolved owner", () => {
    const failures = collectClaimSpeakerConsistencyFailures(
      "fixture",
      { rows: [row()], stanceRows: [] },
      new Map([["claim_fixture_0001", "ΝΑΡΡ."]]),
    );
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("Re-run the claim-speaker migration");
  });

  it("fails when an accepted claim resolves to no single owner", () => {
    const failures = collectClaimSpeakerConsistencyFailures(
      "fixture",
      { rows: [row({ status: "needs_anchor", owner: "(unattributed)" })], stanceRows: [] },
      new Map([["claim_fixture_0001", "ΝΑΡΡ."]]),
    );
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("resolves to no single owner");
  });

  it("ignores claims that are not accepted", () => {
    const failures = collectClaimSpeakerConsistencyFailures(
      "fixture",
      { rows: [row({ reviewStatus: "needs_split", status: "cross_voice" })], stanceRows: [] },
      new Map([["claim_fixture_0001", "ΝΑΡΡ."]]),
    );
    expect(failures).toEqual([]);
  });

  it("does not treat a differing stance actor as an ownership violation", () => {
    const failures = collectClaimSpeakerConsistencyFailures(
      "fixture",
      { rows: [row()], stanceRows: [{ claimId: "claim_fixture_0001", actor: "ΝΑΡΡ." }] },
      new Map([["claim_fixture_0001", "ΒΗΤΑ."]]),
    );
    expect(failures).toEqual([]);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import {
  buildRelationCandidates,
  planSegmentedRelationReview,
  planSegmentedRelations,
  relationCandidateKey,
  relationCandidateKeysComplete,
  type RelationClaim,
} from "./relations.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function claim(partial: Partial<RelationClaim> & { claimId: string; dialogue: string; greekTerms: string[] }): RelationClaim {
  return {
    claimKind: "thesis",
    speaker: "ΣΩ.",
    content: "A claim is stated.",
    normalizedTerms: partial.greekTerms.map((term) => term.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("el-GR").replace(/ς/gu, "σ").normalize("NFC")),
    finalStatus: "left_standing",
    reviewStatus: "accepted",
    startChar: 0,
    endChar: 10,
    ...partial,
  };
}

function claimRecord(id: string, kind: "definition" | "thesis" = "thesis") {
  return `\`\`\`yaml
claim_id: ${id}
source_work: Testdialogue
stephanus_span: 2a
speaker: "ΣΩ."
claim_kind: ${kind}
content: "The speaker makes a testable claim."
greek_terms: [ἀρετή]
final_status: left_standing
review_status: accepted
\`\`\``;
}

function relationRecord(
  id: string,
  pairId: string,
  claimA = "claim_testdialogue_0001",
  claimB = "claim_testdialogue_0002",
) {
  return `\`\`\`yaml
relation_id: ${id}
pair_id: ${pairId}
claim_a: ${claimA}
claim_b: ${claimB}
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Testdialogue accepted claim coverage only.
review_status: unreviewed
\`\`\``;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "relations-"));
  restoreRepoRoot = setRepoRootForTesting(root);
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("relation candidates", () => {
  it("generates deterministic intra and cross-dialogue candidates from accepted claims", () => {
    const report = buildRelationCandidates([
      claim({ claimId: "claim_meno_0001", dialogue: "meno", greekTerms: ["ἀρετή"] }),
      claim({ claimId: "claim_meno_0002", dialogue: "meno", claimKind: "definition", greekTerms: ["ἀρετη"] }),
      claim({ claimId: "claim_crito_0001", dialogue: "crito", greekTerms: ["ἀρετή"] }),
      claim({ claimId: "claim_crito_0002", dialogue: "crito", claimKind: "report", greekTerms: ["ἀρετή"] }),
    ]);

    expect(report.counts.by_scope).toMatchObject({
      meno: 1,
      "cross-dialogue": 2,
    });
    expect(report.entries.map((entry) => entry.pair_id)).toEqual([
      "pair_cross-dialogue_00001",
      "pair_cross-dialogue_00002",
      "pair_meno_00001",
    ]);
    expect(report.entries[0]).toMatchObject({
      candidate_key: "cross-dialogue::claim_crito_0001::claim_meno_0001",
      claim_a: "claim_crito_0001",
      claim_b: "claim_meno_0001",
      shared_terms: ["αρετη"],
    });
  });

  it("reads every canonical block-list Greek term instead of treating the first dash as data", () => {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/testdialogue.md"),
      [
        `\`\`\`yaml
claim_id: claim_testdialogue_0001
source_work: Testdialogue
stephanus_span: 1a
speaker: A
claim_kind: thesis
content: The first claim.
greek_terms:
  - πρώτη
  - ἀρετή
final_status: left_standing
review_status: accepted
\`\`\``,
        `\`\`\`yaml
claim_id: claim_testdialogue_0002
source_work: Testdialogue
stephanus_span: 1b
speaker: B
claim_kind: definition
content: The second claim.
greek_terms:
  - δεύτερα
  - ἀρετή
final_status: left_standing
review_status: accepted
\`\`\``,
      ].join("\n\n"),
      "utf8",
    );

    const report = buildRelationCandidates();
    expect(report.entries).toEqual([
      expect.objectContaining({
        candidate_key: "testdialogue::claim_testdialogue_0001::claim_testdialogue_0002",
        shared_terms: ["αρετη"],
      }),
    ]);
  });

  it("keeps a candidate key stable when positional labels reorder", () => {
    const targetKey = relationCandidateKey("testdialogue", "claim_testdialogue_0002", "claim_testdialogue_0003");
    const baseline = buildRelationCandidates([
      claim({ claimId: "claim_testdialogue_0002", dialogue: "testdialogue", greekTerms: ["ἀρετή"] }),
      claim({ claimId: "claim_testdialogue_0003", dialogue: "testdialogue", greekTerms: ["ἀρετή"] }),
    ]);
    const reordered = buildRelationCandidates([
      claim({ claimId: "claim_testdialogue_0001", dialogue: "testdialogue", greekTerms: ["ἀρετή"] }),
      claim({ claimId: "claim_testdialogue_0002", dialogue: "testdialogue", greekTerms: ["ἀρετή"] }),
      claim({ claimId: "claim_testdialogue_0003", dialogue: "testdialogue", greekTerms: ["ἀρετή"] }),
    ]);

    const baselineTarget = baseline.entries.find((entry) => entry.candidate_key === targetKey);
    const reorderedTarget = reordered.entries.find((entry) => entry.candidate_key === targetKey);

    expect(baselineTarget?.pair_id).toBe("pair_testdialogue_00001");
    expect(reorderedTarget?.pair_id).toBe("pair_testdialogue_00003");
    expect(baselineTarget?.candidate_key).toBe(targetKey);
    expect(reorderedTarget?.candidate_key).toBe(targetKey);
  });

  it("plans and completes by claim-pair key despite a positional label collision", () => {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/testdialogue.md"),
      [
        claimRecord("claim_testdialogue_0001"),
        claimRecord("claim_testdialogue_0002", "definition"),
        claimRecord("claim_testdialogue_0003"),
        claimRecord("claim_testdialogue_0004", "definition"),
      ].join("\n\n"),
      "utf8",
    );
    mkdirSync(join(root, "wiki/relations"), { recursive: true });
    writeFileSync(
      join(root, "wiki/relations/testdialogue.md"),
      relationRecord(
        "rel_testdialogue_0001",
        "pair_testdialogue_00001",
        "claim_testdialogue_0003",
        "claim_testdialogue_0004",
      ),
      "utf8",
    );

    const targetKey = relationCandidateKey("testdialogue", "claim_testdialogue_0001", "claim_testdialogue_0002");
    const missing = relationCandidateKey("testdialogue", "claim_testdialogue_9998", "claim_testdialogue_9999");
    const pinned = planSegmentedRelations("testdialogue", 1, [targetKey]);

    expect(pinned.map((batch) => batch.candidateKeys)).toEqual([[targetKey]]);
    expect(pinned.map((batch) => batch.diagnosticPairIds)).toEqual([["pair_testdialogue_00001"]]);
    expect(planSegmentedRelations("testdialogue", 1, [missing])).toEqual([]);
    expect(() => planSegmentedRelations("testdialogue", 1, ["pair_testdialogue_00001"])).toThrow("candidate key");
    expect(relationCandidateKeysComplete("testdialogue", [targetKey])).toBe(false);

    writeFileSync(
      join(root, "wiki/relations/testdialogue.md"),
      [
        relationRecord(
          "rel_testdialogue_0001",
          "pair_testdialogue_00001",
          "claim_testdialogue_0003",
          "claim_testdialogue_0004",
        ),
        relationRecord(
          "rel_testdialogue_0002",
          "pair_testdialogue_00099",
          "claim_testdialogue_0001",
          "claim_testdialogue_0002",
        ),
      ].join("\n\n"),
      "utf8",
    );

    expect(relationCandidateKeysComplete("testdialogue", [targetKey])).toBe(true);

    writeFileSync(
      join(root, "wiki/relations/testdialogue.md"),
      [
        relationRecord(
          "rel_testdialogue_0001",
          "pair_testdialogue_00001",
          "claim_testdialogue_0003",
          "claim_testdialogue_0004",
        ),
        relationRecord(
          "rel_testdialogue_0002",
          "pair_testdialogue_00099",
          "claim_testdialogue_0001",
          "claim_testdialogue_0002",
        ),
        relationRecord(
          "rel_testdialogue_0003",
          "pair_testdialogue_00100",
          "claim_testdialogue_0001",
          "claim_testdialogue_0002",
        ),
      ].join("\n\n"),
      "utf8",
    );

    expect(relationCandidateKeysComplete("testdialogue", [targetKey])).toBe(false);
  });

  it("pins segmented relation review planning to explicit relation ids", () => {
    mkdirSync(join(root, "wiki/relations"), { recursive: true });
    writeFileSync(
      join(root, "wiki/relations/testdialogue.md"),
      [
        relationRecord("rel_testdialogue_0001", "pair_testdialogue_00001"),
        relationRecord("rel_testdialogue_0002", "pair_testdialogue_00002"),
      ].join("\n\n"),
      "utf8",
    );

    const pinned = planSegmentedRelationReview("testdialogue", 1, ["rel_testdialogue_0002"]);
    const missing = planSegmentedRelationReview("testdialogue", 1, ["rel_testdialogue_9999"]);

    expect(pinned.map((batch) => batch.relationIds)).toEqual([["rel_testdialogue_0002"]]);
    expect(missing).toEqual([]);
  });
});

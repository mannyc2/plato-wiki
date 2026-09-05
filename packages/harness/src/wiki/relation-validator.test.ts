import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { validateRelationLedger } from "./relation-validator.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function claimRecord(id: string, status = "accepted", finalStatus = "left_standing") {
  return `\`\`\`yaml
claim_id: ${id}
review_status: ${status}
final_status: ${finalStatus}
\`\`\``;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "relation-validator-test-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(
    join(root, "wiki/claims/meno.md"),
    `${claimRecord("claim_meno_0001")}\n\n${claimRecord("claim_meno_0002")}\n\n${claimRecord("claim_meno_0003", "rejected")}\n`,
    "utf8",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("validateRelationLedger", () => {
  it("accepts a standing relation between accepted left-standing claims", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Meno claim coverage only.
review_status: unreviewed
\`\`\``;

    expect(validateRelationLedger("wiki/relations/meno.md", content)).toEqual([]);
  });

  it("rejects nonaccepted claims and standing resolutions over non-standing claims", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0003
relation_kind: contradiction
resolution: standing
basis: The two claim contents are incompatible.
limits: Checked within Meno claim coverage only.
review_status: unreviewed
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/meno.md", content);
    expect(issues.map((issue) => issue.code)).toContain("nonaccepted_claim");
  });

  it("allows a rejected relation to preserve an existing rejected claim reference", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0003
relation_kind: tension
resolution: standing
basis: The historical candidate depended on support that did not survive review.
limits: Rejected because claim_meno_0003 is not accepted; no substantive relation is asserted.
review_status: rejected
\`\`\``;

    expect(validateRelationLedger("wiki/relations/meno.md", content)).toEqual([]);
  });

  it("treats a rejected relation resolution as review provenance rather than a live edge", () => {
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      `${claimRecord("claim_meno_0001", "accepted", "left_standing")}\n\n${claimRecord("claim_meno_0002", "rejected", "refuted")}\n`,
      "utf8",
    );
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: This historical candidate was rejected after the second endpoint was refuted.
limits: The standing value is preserved only as rejected review provenance.
review_status: rejected
\`\`\``;

    expect(validateRelationLedger("wiki/relations/meno.md", content)).toEqual([]);
  });

  it("rejects the confirmed accepted schema-compliance non-relation", () => {
    const content = `\`\`\`yaml
relation_id: rel_cross-dialogue_0011
pair_id: pair_cross-dialogue_00011
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: restatement
resolution: standing
basis: No substantive relation connects the unrelated frameworks; this was filed as a restatement for schema compliance and is effectively a non-relation.
limits: The record asserts no textual connection beyond the schema slot.
review_status: accepted
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/cross-dialogue.md", content);
    expect(issues.map((issue) => issue.code)).toContain("accepted_relation_denial");
  });

  it("allows denial prose only on a rejected relation decision", () => {
    const content = `\`\`\`yaml
relation_id: rel_cross-dialogue_0011
pair_id: pair_cross-dialogue_00011
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: restatement
resolution: standing
basis: No substantive relation connects the unrelated frameworks; this is a non-relation.
limits: Rejected review decision retained as provenance.
review_status: rejected
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/cross-dialogue.md", content);
    expect(issues.map((issue) => issue.code)).not.toContain("accepted_relation_denial");
  });

  it("rejects equivalent accepted denials in limits", () => {
    const content = `\`\`\`yaml
relation_id: rel_cross-dialogue_0716
pair_id: pair_cross-dialogue_00716
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The claims share one lexical item.
limits: The lexical coincidence is not a substantive doctrinal relation.
review_status: accepted
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/cross-dialogue.md", content);
    expect(issues.map((issue) => issue.code)).toContain("accepted_relation_denial");
  });

  it("rejects accepted typed relations whose own basis and limits deny the edge", () => {
    const fixtures = [
      {
        path: "wiki/relations/republic.md",
        content: `\`\`\`yaml
relation_id: rel_republic_0024
pair_id: pair_republic_00024
claim_a: claim_republic_0088
claim_b: claim_republic_0247
relation_kind: tension
resolution: verbal_only
basis: Both claims share the term ἀμαθία but deploy it in different argumentative frames and with different scope. No contradiction obtains because the predicate is not asserted of the same subject under the same respects.
limits: The shared term alone does not create a contradiction or substantive tension.
review_status: accepted
\`\`\``,
      },
      {
        path: "wiki/relations/cross-dialogue.md",
        content: `\`\`\`yaml
relation_id: rel_cross-dialogue_0638
pair_id: pair_cross-dialogue_00638
claim_a: claim_laws_0246
claim_b: claim_republic_0777
relation_kind: tension
resolution: standing
basis: The shared term ψυχήν does not indicate a shared thesis; one is a political ranking of goods, the other is a metaphysical argument about the soul's indestructibility. They neither contradict nor restate each other.
limits: This adjudication is confined to the two claim records as written.
review_status: accepted
\`\`\``,
      },
      {
        path: "wiki/relations/timaeus.md",
        content: `\`\`\`yaml
relation_id: rel_timaeus_0050
pair_id: pair_timaeus_00050
claim_a: claim_timaeus_0216
claim_b: claim_timaeus_0226
relation_kind: tension
resolution: standing
basis: These are thematically linked by πνεῦμα but address different bodily processes.
limits: The claims do not conflict. The relation is limited to the shared substance-term πνεῦμα across different explanatory contexts.
review_status: accepted
\`\`\``,
      },
    ];

    for (const fixture of fixtures) {
      expect(
        validateRelationLedger(fixture.path, fixture.content).map((issue) => issue.code),
        fixture.path,
      ).toContain("accepted_relation_denial");
    }
  });

  it("does not confuse a non-contradictory substantive tension with a denied edge", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The claims are not formally contradictory, but they pull against each other because one makes knowledge sufficient while the other identifies a further condition.
limits: The tension is substantive even though both claims can remain left standing.
review_status: accepted
\`\`\``;

    expect(validateRelationLedger("wiki/relations/meno.md", content)).toEqual([]);
  });

  it("does not treat an unresolved-tension limit as denial of the tension", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions while both remain left standing.
limits: The checked span does not resolve whether the tension is addressed later.
review_status: accepted
\`\`\``;

    expect(validateRelationLedger("wiki/relations/meno.md", content)).toEqual([]);
  });

  it("rejects an accepted relation that references a rejected claim", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0003
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Meno claim coverage only.
review_status: accepted
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/meno.md", content);
    expect(issues.map((issue) => issue.code)).toContain("nonaccepted_claim");
  });

  it("rejects a rejected relation that references a missing claim", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_9999
relation_kind: tension
resolution: standing
basis: The historical candidate depended on support that no longer exists.
limits: Rejected because the second claim cannot be identified.
review_status: rejected
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/meno.md", content);
    expect(issues.map((issue) => issue.code)).toContain("unknown_claim");
  });

  it("requires relation ids to match the ledger path", () => {
    const content = `\`\`\`yaml
relation_id: rel_crito_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Meno claim coverage only.
review_status: unreviewed
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/meno.md", content);
    expect(issues.map((issue) => issue.code)).toContain("invalid_id");
  });

  it("rejects multiple YAML documents inside one fenced record", () => {
    const content = `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Meno claim coverage only.
review_status: accepted
---
relation_id: rel_meno_0002
pair_id: pair_meno_00002
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: restatement
resolution: standing
basis: The two claim contents restate one another.
limits: Checked within Meno claim coverage only.
review_status: accepted
\`\`\``;

    const issues = validateRelationLedger("wiki/relations/meno.md", content);
    expect(issues.map((issue) => issue.code)).toContain("duplicate_field");
    expect(issues.find((issue) => issue.code === "duplicate_field")?.message).toMatch(
      /not one strict YAML 1\.2 document:[\s\S]*Source contains multiple documents/u,
    );
  });

  it("rejects a second ledger pair id for the same candidate identity", () => {
    const content = [
      `\`\`\`yaml
relation_id: rel_meno_0001
pair_id: pair_meno_00001
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Meno claim coverage only.
review_status: unreviewed
\`\`\``,
      `\`\`\`yaml
relation_id: rel_meno_0002
pair_id: pair_meno_00002
claim_a: claim_meno_0001
claim_b: claim_meno_0002
relation_kind: restatement
resolution: standing
basis: The two claim contents restate one another.
limits: Checked within Meno claim coverage only.
review_status: unreviewed
\`\`\``,
    ].join("\n\n");

    const issues = validateRelationLedger("wiki/relations/meno.md", content);
    expect(issues.map((issue) => issue.code)).toContain("duplicate_candidate");
  });
});

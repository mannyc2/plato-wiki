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

  it("rejects multiple relation records inside one fenced yaml block", () => {
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

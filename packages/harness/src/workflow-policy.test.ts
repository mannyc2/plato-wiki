import { describe, expect, it } from "bun:test";
import { findCorpusWorkflowPathFailures } from "./workflow-policy.js";

describe("findCorpusWorkflowPathFailures", () => {
  it("accepts canonical data, generic validators, and decision receipts", () => {
    expect(
      findCorpusWorkflowPathFailures([
        "wiki/claims/republic.md",
        "wiki/review/2026-08-16-relation-decisions.md",
        "packages/harness/src/wiki/relation-validator.ts",
        "scripts/check-ledger.ts",
      ]),
    ).toEqual([]);
  });

  it("rejects committed coordination state and cohort-specific machinery", () => {
    expect(
      findCorpusWorkflowPathFailures([
        ".wave2-scratch/coord/review-lib.ts",
        "scripts/one-off-relation-wave.ts",
        "plans/symposium-work-package.md",
        "plans/symposium-disagreement-packets.md",
        "wiki/review/2026-08-12-republic-packet-freeze.md",
        "wiki/review/2026-08-13-republic-review-framework.md",
        "wiki/review/2026-08-13-republic-materialization-dry-run.md",
      ]),
    ).toEqual([
      ".wave2-scratch/coord/review-lib.ts: coordination scratch must remain ignored and disposable",
      "plans/symposium-disagreement-packets.md: review dispatch and intermediate reviewer state are not canonical evidence",
      "plans/symposium-work-package.md: review dispatch and intermediate reviewer state are not canonical evidence",
      "scripts/one-off-relation-wave.ts: durable scripts must name a recurring corpus operation, not a one-time campaign",
      "wiki/review/2026-08-12-republic-packet-freeze.md: review receipts must record accepted decisions, not coordination machinery",
      "wiki/review/2026-08-13-republic-materialization-dry-run.md: review receipts must record accepted decisions, not coordination machinery",
      "wiki/review/2026-08-13-republic-review-framework.md: review receipts must record accepted decisions, not coordination machinery",
    ]);
  });
});

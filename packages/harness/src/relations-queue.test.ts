import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { relationCandidateKey } from "./relations.js";
import { planRelationQueue, runRelationQueue, runWorkerPool, shouldValidateBatch } from "./relations-queue.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

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

function relationRecord(id: string, pairId: string, claimA: string, claimB: string) {
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
  root = mkdtempSync(join(tmpdir(), "relations-queue-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(
    join(root, "wiki/claims/testdialogue.md"),
    `${claimRecord("claim_testdialogue_0001")}\n\n${claimRecord("claim_testdialogue_0002", "definition")}\n`,
    "utf8",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("runRelationQueue", () => {
  it("plans dry-run relation batches without writing relation ledgers", async () => {
    const result = await runRelationQueue("testdialogue", {
      dryRun: true,
      targetPairs: 1,
      limit: 2,
    });

    expect(result.plannedBatches.map((batch) => batch.candidateKeys)).toEqual([
      [relationCandidateKey("testdialogue", "claim_testdialogue_0001", "claim_testdialogue_0002")],
    ]);
    expect(result.plannedBatches.map((batch) => batch.diagnosticPairIds)).toEqual([["pair_testdialogue_00001"]]);
    expect(result.completedBatches).toEqual([]);
    expect(existsSync(join(root, "wiki/relations"))).toBe(false);
  });

  it("retries the frozen candidate key through a candidate reordering", async () => {
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
    const relationPath = join(root, "wiki/relations/testdialogue.md");
    writeFileSync(
      relationPath,
      relationRecord(
        "rel_testdialogue_0001",
        "pair_testdialogue_00001",
        "claim_testdialogue_0003",
        "claim_testdialogue_0004",
      ),
      "utf8",
    );

    const targetKey = relationCandidateKey("testdialogue", "claim_testdialogue_0001", "claim_testdialogue_0002");
    const attempts: string[][] = [];
    const pinnedAttempts: boolean[] = [];
    const result = await runRelationQueue(
      "testdialogue",
      {
        targetPairs: 1,
        candidateKeys: [targetKey],
        limit: 1,
        retries: 1,
        validateFinal: false,
      },
      async (_scope, _options, _targetPairs, _timeoutSeconds, batch, pinned) => {
        attempts.push(batch.candidateKeys);
        pinnedAttempts.push(pinned);
        if (attempts.length === 1) {
          writeFileSync(
            join(root, "wiki/claims/testdialogue.md"),
            [
              claimRecord("claim_testdialogue_0000"),
              claimRecord("claim_testdialogue_0001"),
              claimRecord("claim_testdialogue_0002", "definition"),
              claimRecord("claim_testdialogue_0003"),
              claimRecord("claim_testdialogue_0004", "definition"),
            ].join("\n\n"),
            "utf8",
          );
        }
        if (attempts.length === 2) {
          writeFileSync(
            relationPath,
            [
              readFileSync(relationPath, "utf8").trimEnd(),
              relationRecord(
                "rel_testdialogue_0002",
                "pair_testdialogue_00005",
                "claim_testdialogue_0001",
                "claim_testdialogue_0002",
              ),
            ].join("\n\n"),
            "utf8",
          );
        }
        return { transcriptDir: "fixture" };
      },
    );

    expect(attempts).toEqual([[targetKey], [targetKey]]);
    expect(pinnedAttempts).toEqual([true, true]);
    expect(result.failedBatch).toBeUndefined();
    expect(result.completedBatches).toEqual([
      {
        candidateKeys: [targetKey],
        attemptCount: 2,
        status: "completed",
        transcriptDir: "fixture",
      },
    ]);
  });

  it("rejects the removed pairIds queue option instead of silently ignoring it", () => {
    expect(() =>
      planRelationQueue("testdialogue", {
        pairIds: ["pair_testdialogue_00001"],
      } as unknown as Parameters<typeof planRelationQueue>[1]),
    ).toThrow("candidateKeys");
  });

  async function expectDuplicateCandidateCompletionToFail(workers: number) {
    const targetKey = relationCandidateKey("testdialogue", "claim_testdialogue_0001", "claim_testdialogue_0002");
    const relationPath = join(root, "wiki/relations/testdialogue.md");
    let attempts = 0;
    const result = await runRelationQueue(
      "testdialogue",
      {
        targetPairs: 1,
        candidateKeys: [targetKey],
        limit: 1,
        workers,
        retries: 1,
        validateFinal: false,
      },
      async () => {
        attempts += 1;
        if (attempts === 1) {
          mkdirSync(join(root, "wiki/relations"), { recursive: true });
          writeFileSync(
            relationPath,
            [
              relationRecord("rel_testdialogue_0001", "pair_testdialogue_00001", "claim_testdialogue_0001", "claim_testdialogue_0002"),
              relationRecord("rel_testdialogue_0002", "pair_testdialogue_00002", "claim_testdialogue_0001", "claim_testdialogue_0002"),
            ].join("\n\n"),
            "utf8",
          );
        }
        return { transcriptDir: "fixture" };
      },
    );

    expect(attempts).toBe(2);
    expect(result.completedBatches).toEqual([]);
    expect(result.failedBatch).toEqual(expect.objectContaining({
      candidateKeys: [targetKey],
      attemptCount: 2,
      status: "failed",
      error: expect.stringContaining("did not cover target candidates"),
    }));
  }

  it("fails serial completion when a runner writes duplicate candidate rows", async () => {
    await expectDuplicateCandidateCompletionToFail(1);
  });

  it("fails parallel completion when a runner writes duplicate candidate rows", async () => {
    await expectDuplicateCandidateCompletionToFail(2);
  });

  it("rejects non-positive validation cadence", async () => {
    await expect(
      runRelationQueue("testdialogue", {
        dryRun: true,
        targetPairs: 1,
        limit: 1,
        validateEvery: 0,
      }),
    ).rejects.toThrow("--validate-every");
  });

  it("rejects non-positive worker counts", async () => {
    await expect(
      runRelationQueue("testdialogue", {
        dryRun: true,
        targetPairs: 1,
        limit: 1,
        workers: 0,
      }),
    ).rejects.toThrow("--workers");
  });
});

describe("shouldValidateBatch", () => {
  it("validates every batch when validateEach is true", () => {
    expect(shouldValidateBatch(1, true, undefined)).toBe(true);
    expect(shouldValidateBatch(24, true, 25)).toBe(true);
    expect(shouldValidateBatch(25, true, 25)).toBe(true);
  });

  it("validates only on cadence boundaries", () => {
    for (let count = 1; count < 25; count += 1) {
      expect(shouldValidateBatch(count, undefined, 25)).toBe(false);
    }

    expect(shouldValidateBatch(25, undefined, 25)).toBe(true);
    expect(shouldValidateBatch(50, undefined, 25)).toBe(true);
  });

  it("does not validate without either validation option", () => {
    expect(shouldValidateBatch(1, undefined, undefined)).toBe(false);
    expect(shouldValidateBatch(25, undefined, undefined)).toBe(false);
  });
});

describe("runWorkerPool", () => {
  it("runs no more than the requested worker count concurrently", async () => {
    let active = 0;
    let maxActive = 0;
    const completed: number[] = [];

    await runWorkerPool([1, 2, 3, 4, 5, 6], 3, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      completed.push(item);
      active -= 1;
    });

    expect(maxActive).toBe(3);
    expect(completed.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("stops assigning new work after a failed item while in-flight work drains", async () => {
    const started: number[] = [];

    await runWorkerPool([1, 2, 3, 4], 2, async (item) => {
      started.push(item);
      if (item === 1) return false;
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(started.sort((a, b) => a - b)).toEqual([1, 2]);
  });
});

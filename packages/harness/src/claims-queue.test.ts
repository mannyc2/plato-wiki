import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { runClaimQueue } from "./claims-queue.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "claims-queue-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(
    join(root, "raw/plato/greek/testdialogue.txt"),
    "{2a} first segment text. {2b} second segment text. {2c} third segment text.",
    "utf8",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("runClaimQueue", () => {
  it("plans dry-run claim segments without writing claim ledgers", async () => {
    const result = await runClaimQueue("testdialogue", {
      dryRun: true,
      targetBytes: 25,
      limit: 2,
    });

    expect(result.plannedSegments.map((segment) => segment.span)).toEqual(["2a", "2b"]);
    expect(result.completedSegments).toEqual([]);
    expect(existsSync(join(root, "wiki/claims"))).toBe(false);
  });
});

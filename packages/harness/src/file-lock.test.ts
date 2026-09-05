import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lockPathForTarget, resolveLockTargets, withRepoWriteLock } from "./file-lock.js";
import { setRepoRootForTesting } from "./paths.js";

let restoreRepoRoot: (() => void) | undefined;
let root: string;
let previousTimeout: string | undefined;

function heldLocks() {
  const directory = join(root, "scratch/wiki-write-locks");
  return existsSync(directory) ? readdirSync(directory).sort() : [];
}

describe("withRepoWriteLock", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "file-lock-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    previousTimeout = process.env.WIKI_WRITE_LOCK_TIMEOUT_MS;
    process.env.WIKI_WRITE_LOCK_TIMEOUT_MS = "200";
  });

  afterEach(() => {
    if (previousTimeout === undefined) delete process.env.WIKI_WRITE_LOCK_TIMEOUT_MS;
    else process.env.WIKI_WRITE_LOCK_TIMEOUT_MS = previousTimeout;
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("locks the written path, not the label", () => {
    // The regression this guards: `ingest_log:${dialogue}` used three distinct
    // labels for one shared file, and `commentary-draft:` / `commentary-outline:`
    // used distinct labels for one shared ledger.
    expect(lockPathForTarget("wiki/ingest-log.md")).toBe(lockPathForTarget("wiki/ingest-log.md"));
    expect(lockPathForTarget("wiki/ingest-log.md")).not.toBe(lockPathForTarget("wiki/commentary/crito.md"));
  });

  it("keeps distinct targets distinct even when sanitizing collapses them", () => {
    expect(lockPathForTarget("wiki/a/b.md")).not.toBe(lockPathForTarget("wiki/a__b.md"));
  });

  it("normalizes, dedupes, and sorts targets", () => {
    expect(resolveLockTargets(["wiki/b.md", "wiki/a.md", join(root, "wiki/b.md")])).toEqual([
      "wiki/a.md",
      "wiki/b.md",
    ]);
  });

  it("rejects an empty target set", () => {
    expect(() => resolveLockTargets([])).toThrow("at least one target path");
  });

  it("rejects targets outside the repository", () => {
    expect(() => resolveLockTargets(["../escape.md"])).toThrow("outside the repository");
  });

  it("rejects a symlinked lock root instead of writing through it", () => {
    const outside = join(root, "outside-lock-root");
    mkdirSync(join(root, "scratch"), { recursive: true });
    mkdirSync(outside, { recursive: true });
    symlinkSync(outside, join(root, "scratch/wiki-write-locks"), "dir");
    expect(() => withRepoWriteLock({ paths: ["wiki/a.md"], label: "unsafe" }, () => undefined)).toThrow(
      "traverses a symlink or realpath alias",
    );
  });

  it("rejects a repository root that is itself a symlink", () => {
    const actualRoot = join(root, "actual-repo");
    const rootAlias = join(root, "repo-alias");
    mkdirSync(actualRoot, { recursive: true });
    symlinkSync(actualRoot, rootAlias, "dir");
    restoreRepoRoot?.();
    restoreRepoRoot = setRepoRootForTesting(rootAlias);
    expect(() => withRepoWriteLock({ paths: ["wiki/a.md"], label: "unsafe-root" }, () => undefined)).toThrow(
      "Repository root traverses a symlink or realpath alias",
    );
  });

  it("does not serialize writes to different paths", () => {
    const order: string[] = [];
    const result = withRepoWriteLock({ paths: ["wiki/commentary/crito.md"], label: "outer" }, () => {
      order.push("outer");
      return withRepoWriteLock({ paths: ["wiki/commentary/meno.md"], label: "inner" }, () => {
        order.push("inner");
        return "done";
      });
    });

    expect(result).toBe("done");
    expect(order).toEqual(["outer", "inner"]);
  });

  it("serializes writes to the same path across differing labels", () => {
    expect(() =>
      withRepoWriteLock({ paths: ["wiki/ingest-log.md"], label: "ingest_log:crito" }, () =>
        withRepoWriteLock({ paths: ["wiki/ingest-log.md"], label: "claim_log:meno" }, () => "unreachable"),
      ),
    ).toThrow("Timed out waiting for wiki write lock on wiki/ingest-log.md");
  });

  it("records the label and target in the owner file", () => {
    withRepoWriteLock({ paths: ["wiki/commentary/crito.md"], label: "commentary-draft:crito" }, () => {
      const [entry] = heldLocks();
      const owner = JSON.parse(
        readFileSync(join(root, "scratch/wiki-write-locks", entry!, "owner.json"), "utf8"),
      );
      expect(owner.label).toBe("commentary-draft:crito");
      expect(owner.target).toBe("wiki/commentary/crito.md");
      return undefined;
    });
  });

  it("holds every path in a multi-path scope and releases them all", () => {
    withRepoWriteLock({ paths: ["wiki/b.md", "wiki/a.md"], label: "multi" }, () => {
      expect(heldLocks()).toHaveLength(2);
      return undefined;
    });

    expect(heldLocks()).toHaveLength(0);
  });

  it("releases locks when the body throws", () => {
    expect(() =>
      withRepoWriteLock({ paths: ["wiki/a.md", "wiki/b.md"], label: "boom" }, () => {
        throw new Error("body failed");
      }),
    ).toThrow("body failed");

    expect(heldLocks()).toHaveLength(0);
  });

  it("releases already-held locks when a later acquisition times out", () => {
    expect(() =>
      withRepoWriteLock({ paths: ["wiki/b.md"], label: "holder" }, () =>
        withRepoWriteLock({ paths: ["wiki/a.md", "wiki/b.md"], label: "blocked" }, () => "unreachable"),
      ),
    ).toThrow("Timed out waiting for wiki write lock on wiki/b.md");

    expect(heldLocks()).toHaveLength(0);
  });
});

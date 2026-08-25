import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeRepoPath, setRepoRootForTesting } from "./paths.js";
import { assertReadableWikiPath } from "./wiki/guards.js";

let restoreRepoRoot: (() => void) | undefined;
let root: string;

describe("normalizeRepoPath", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "paths-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("accepts repository-relative paths inside the root", () => {
    const resolved = normalizeRepoPath("wiki/observations/euthyphro.md");

    expect(resolved.relativePath).toBe("wiki/observations/euthyphro.md");
    expect(resolved.absolutePath.startsWith(root)).toBe(true);
  });

  it("rejects parent traversal outside the root", () => {
    expect(() => normalizeRepoPath("../outside.txt")).toThrow(/outside the repository/);
  });

  it("rejects absolute paths outside the root", () => {
    expect(() => normalizeRepoPath("/etc/hosts")).toThrow(/outside the repository/);
  });

  it("rejects the repository parent marker itself", () => {
    expect(() => normalizeRepoPath("..")).toThrow(/outside the repository/);
  });

  it("normalizes interior traversal and leaves final guard checks to guard functions", () => {
    const resolved = normalizeRepoPath("wiki/observations/../../.env");

    expect(resolved.relativePath).toBe(".env");
    expect(() => assertReadableWikiPath(resolved.relativePath)).toThrow(/not allowed/);
  });

  it("normalizes repeated separators inside the root", () => {
    const resolved = normalizeRepoPath("wiki//observations//x.md");

    expect(resolved.relativePath).toBe("wiki/observations/x.md");
  });
});

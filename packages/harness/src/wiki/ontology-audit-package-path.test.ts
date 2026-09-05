import { describe, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  assertCanonicalOntologyRegenerationWorkerPaths,
  createCanonicalOntologyRegenerationWorkspace,
  ensureCanonicalOntologyWorkRoot,
  resolveCanonicalOntologyRepoFileWriteTarget,
} from "./ontology-audit-package-path.js";

function fixture(prefix: string) {
  const parent = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), prefix)));
  const repoRoot = join(parent, "repo");
  mkdirSync(repoRoot);
  return { parent, repoRoot };
}

describe("ontology mutation path confinement", () => {
  test("rejects a symlinked sibling work root without changing outside bytes", () => {
    const paths = fixture("ontology-work-root-");
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-work-outside-")));
    const sentinel = join(outside, "must-remain.txt");
    writeFileSync(sentinel, "outside must remain\n", "utf8");
    symlinkSync(outside, join(paths.parent, "work"), "dir");
    try {
      expect(() => ensureCanonicalOntologyWorkRoot(paths.repoRoot)).toThrow("Ontology work root");
      expect(readFileSync(sentinel, "utf8")).toBe("outside must remain\n");
    } finally {
      rmSync(paths.parent, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("confines worker site and manifest paths to exact paired workspace children", () => {
    const paths = fixture("ontology-worker-paths-");
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-worker-outside-")));
    const sentinel = join(outside, "must-remain.txt");
    writeFileSync(sentinel, "outside must remain\n", "utf8");
    try {
      const workspace = createCanonicalOntologyRegenerationWorkspace(paths.repoRoot);
      expect(() => assertCanonicalOntologyRegenerationWorkerPaths({
        repoRoot: paths.repoRoot,
        siteDirectory: outside,
      })).toThrow("outside a minted canonical work-root workspace");
      expect(() => assertCanonicalOntologyRegenerationWorkerPaths({
        repoRoot: paths.repoRoot,
        siteDirectory: workspace.siteOne,
        manifestPath: sentinel,
      })).toThrow("not the exact paired worker child");

      symlinkSync(outside, workspace.siteOne, "dir");
      expect(() => assertCanonicalOntologyRegenerationWorkerPaths({
        repoRoot: paths.repoRoot,
        siteDirectory: workspace.siteOne,
        manifestPath: workspace.manifestOne,
      })).toThrow("Ontology regeneration site");
      rmSync(workspace.siteOne);

      expect(assertCanonicalOntologyRegenerationWorkerPaths({
        repoRoot: paths.repoRoot,
        siteDirectory: workspace.siteOne,
        manifestPath: workspace.manifestOne,
      })).toMatchObject({
        temporaryRoot: workspace.temporaryRoot,
        siteDirectory: workspace.siteOne,
        manifestPath: workspace.manifestOne,
      });
      expect(readFileSync(sentinel, "utf8")).toBe("outside must remain\n");
    } finally {
      rmSync(paths.parent, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("rejects a symlinked closure-receipt parent without changing outside bytes", () => {
    const paths = fixture("ontology-receipt-path-");
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-receipt-outside-")));
    const receiptName = "2026-08-30-ontology-vnext-closure.md";
    const sentinel = join(outside, receiptName);
    writeFileSync(sentinel, "outside must remain\n", "utf8");
    mkdirSync(join(paths.repoRoot, "wiki"));
    symlinkSync(outside, join(paths.repoRoot, "wiki/review"), "dir");
    try {
      expect(() => resolveCanonicalOntologyRepoFileWriteTarget({
        repoRoot: paths.repoRoot,
        relativePath: `wiki/review/${receiptName}`,
        label: "Ontology closure receipt",
      })).toThrow("parent");
      expect(readFileSync(sentinel, "utf8")).toBe("outside must remain\n");
    } finally {
      rmSync(paths.parent, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

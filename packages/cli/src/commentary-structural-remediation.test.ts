import { describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const PACKAGE_ROOT = join(import.meta.dir, "..");
const REPO_ROOT = join(PACKAGE_ROOT, "..", "..");

function runCli(...arguments_: string[]) {
  return spawnSync("bun", ["src/cli.ts", ...arguments_], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
  });
}

describe("structural remediation CLI", () => {
  it("publishes delegated audit preview/apply syntax in commentary usage", () => {
    const result = runCli("commentary", "delegated-audit-preview", "accepted");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("delegated-audit-preview <dialogue> [<unit-key>] <candidate-path>");
    expect(result.stderr).toContain("delegated-audit-apply <dialogue> [<unit-key>] <candidate-path>");
  });

  it("publishes dedicated preview/apply syntax and rejects a missing candidate before any gate work", () => {
    const result = runCli("commentary", "structural-remediation-preview");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("structural-remediation-preview <candidate-path>");
    expect(result.stderr).toContain("structural-remediation-apply <candidate-path>");
    expect(result.stderr).toContain("structural-remediation-batch-preview <candidate-path>");
    expect(result.stderr).toContain("structural-remediation-batch-apply <candidate-path>");
  });

  it("loads a candidate path and reports malformed JSON without invoking the provider", () => {
    const relativePath = "scratch/commentary/structural-cli-test.json";
    const absolutePath = join(REPO_ROOT, relativePath);
    mkdirSync(join(absolutePath, ".."), { recursive: true });
    writeFileSync(absolutePath, "not json\n", "utf8");
    try {
      const result = runCli("commentary", "structural-remediation-preview", relativePath);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Structural remediation candidate is malformed JSON");
    } finally {
      rmSync(absolutePath, { force: true });
    }
  });

  it("loads a batch candidate path and reports malformed JSON without mutating a ledger", () => {
    const relativePath = "scratch/commentary/structural-cli-batch-test.json";
    const absolutePath = join(REPO_ROOT, relativePath);
    mkdirSync(join(absolutePath, ".."), { recursive: true });
    writeFileSync(absolutePath, "not json\n", "utf8");
    try {
      const result = runCli("commentary", "structural-remediation-batch-preview", relativePath);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Structural remediation batch candidate is malformed JSON");
    } finally {
      rmSync(absolutePath, { force: true });
    }
  });
});

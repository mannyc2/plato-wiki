import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "../../..");

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "wiki-cli-"));
  const source = "{1a} ΣΩ. λόγος.";
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/testdialogue.txt"), source);
  const path = "wiki/observations/testdialogue.md";
  const content = `# Testdialogue observations

\`\`\`yaml
observation_id: obs_testdialogue_0001
source_work: Testdialogue
stephanus_span: 1a
source_ref:
  source_path: raw/plato/greek/testdialogue.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: 0
  end_char: ${source.length}
  text_sha256: ${createHash("sha256").update(source).digest("hex")}
greek_terms: []
english_gloss: A spoken word.
observation: The speaker names a word.
textual_basis: The word follows the speaker marker.
limits: This record concerns only the cited word.
review_status: unreviewed
\`\`\`
`;
  const callsPath = join(root, "calls.json");
  writeFileSync(callsPath, JSON.stringify([
    { name: "wiki_stage_observation", arguments: { path, content } },
    { name: "wiki_commit_observation", arguments: { path } },
  ]));
  return { root, callsPath, ledgerPath: join(root, path) };
}

function runCli(root: string, ...args: string[]) {
  // Use the existing test root override in the child too; a regression must
  // never turn this write-boundary test into a canonical corpus mutation.
  const setup = [
    `const { setRepoRootForTesting } = await import(${JSON.stringify(join(REPO_ROOT, "packages/harness/src/paths.ts"))});`,
    `setRepoRootForTesting(${JSON.stringify(root)});`,
    `process.argv = ${JSON.stringify(["bun", "cli.ts", ...args])};`,
    `await import(${JSON.stringify(join(REPO_ROOT, "packages/cli/src/cli.ts"))});`,
  ].join("\n");
  return spawnSync(process.execPath, ["--eval", setup], { cwd: REPO_ROOT, encoding: "utf8" });
}

describe("wiki tools CLI", () => {
  it("executes the documented stage-and-commit calls file", () => {
    const { root, callsPath, ledgerPath } = fixture();
    try {
      const result = runCli(root, "wiki", "ingest", callsPath);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("wiki_tool_commit_observation");
      expect(existsSync(ledgerPath)).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects flags and extra arguments before reading or executing a calls file", () => {
    const { root, callsPath, ledgerPath } = fixture();
    try {
      for (const extra of ["--dry-run", "--profile", "extra.json"]) {
        const result = runCli(root, "wiki", "ingest", callsPath, extra);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("flags and extra arguments are not supported");
        expect(existsSync(ledgerPath)).toBe(false);
      }
      const misplacedFlag = runCli(root, "wiki", "ingest", "--dry-run");
      expect(misplacedFlag.status).toBe(1);
      expect(misplacedFlag.stderr).toContain("flags and extra arguments are not supported");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

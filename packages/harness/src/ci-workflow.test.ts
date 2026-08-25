import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";

const root = getRepoRoot();
const workflowPath = join(root, ".github/workflows/ci.yml");
const workflow = existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
const driver = readFileSync(join(root, "scripts/ci.ts"), "utf8");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  scripts?: Record<string, string>;
  packageManager?: string;
};

describe("ci contract", () => {
  it("exposes one verification entry point", () => {
    expect(manifest.scripts?.ci).toBe("bun scripts/ci.ts");
  });

  it("runs every required stage and cannot pass while one is skipped", () => {
    for (const stage of ["test", "typecheck", "validate", "site"]) {
      expect(driver).toContain(`name: "${stage}"`);
    }
    // A failed stage must abort the run rather than be reported and ignored.
    expect(driver).toContain("process.exit(1)");
  });

  it("uses a disposable site by default and retains only an explicitly bound release artifact", () => {
    expect(driver).toMatch(/mkdtempSync\(join\(tmpdir\(\)/u);
    expect(driver).toMatch(/"--out-dir",\s*siteOutDir/u);
    expect(driver).toContain("release artifact mode requires --site-out-dir, --source-revision, and --export-manifest together");
    expect(driver).toContain("writeSiteReleaseMarker");
    expect(driver).toMatch(/if \(!releaseArtifactMode\) rmSync\(siteOutDir/u);
  });

  it("has a workflow that pins every action to a full commit sha", () => {
    expect(workflow).not.toBe("");
    const uses = [...workflow.matchAll(/uses:\s*(\S+)/gu)].map((match) => match[1]!);
    expect(uses.length).toBeGreaterThan(0);
    for (const ref of uses) {
      expect(ref).toMatch(/@[0-9a-f]{40}$/u);
    }
  });

  it("keeps Pages authority job-scoped and protects the final repository deployment", () => {
    expect(workflow).toContain("permissions:\n  contents: read");
    const [verifyWorkflow, deployJob = ""] = workflow.split("\n  deploy:");
    expect(verifyWorkflow).not.toContain("pages: write");
    expect(verifyWorkflow).not.toContain("id-token: write");
    expect(deployJob).toContain("needs: verify");
    expect(deployJob).toContain("pages: write");
    expect(deployJob).toContain("id-token: write");
    expect(deployJob).toContain("name: github-pages");
    expect(deployJob).toContain("github.event_name != 'pull_request'");
    expect(deployJob).toContain("github.ref == 'refs/heads/main'");
    expect(deployJob).toContain("github.repository == 'mannyc2/straussian-llm-wiki'");
    expect(deployJob).toContain("actions/deploy-pages@");
  });

  it("never authenticates to a provider or runs billable or remote work", () => {
    for (const forbidden of [
      "secrets.",
      "ANTHROPIC",
      "OPENAI",
      "CLOUDFLARE",
      "wrangler",
      "ssh gpu",
      "--execute",
    ]) {
      expect(workflow).not.toContain(forbidden);
    }
  });

  it("runs strict public gates without writing canonical corpus state", () => {
    expect(workflow).not.toContain("--write");
    expect(workflow).not.toContain("--allow-incomplete");
    expect(workflow).toContain("bun run completeness -- --target knowledge-base");
    expect(workflow).toContain("bun run public:export");
    expect(workflow).toContain("bun run release:audit");
    expect(workflow).toContain("--public-tree");
    expect(workflow).toContain("--export-manifest");
    expect(workflow).toContain("actions/upload-pages-artifact@");
    expect(workflow).toContain("scripts/release/smoke-site.ts");
  });

  it("installs with a frozen lockfile at the pinned bun version", () => {
    expect(workflow).toContain("bun install --frozen-lockfile");
    const pinned = manifest.packageManager?.replace("bun@", "");
    expect(pinned).toBeTruthy();
    expect(workflow).toContain(`bun-version: ${pinned}`);
  });

  it("provisions the pinned audio-mastering interop toolchain before verification", () => {
    // `recordings.test.ts` exercises the real mastering path with ffmpeg and
    // `uv run --with numpy==2.2.6`; a hosted runner must provision both before
    // Bun starts the suite, rather than silently relying on a developer cache.
    expect(workflow).toContain("Install audio interop tools");
    expect(workflow).toContain("apt-get install -y --no-install-recommends ffmpeg");
    expect(workflow).toContain("astral-sh/setup-uv@c771a70e6277c0a99b617c7a806ffedaca235ff9");
    expect(workflow).toContain("version: 0.9.24");
    expect(workflow).toContain('python-version: "3.13.11"');
    expect(workflow).toContain("Pre-warm the Python interop environment");
    expect(workflow).toContain("UV_CACHE_DIR: ${{ runner.temp }}/uv-cache");
    expect(workflow.indexOf("Pre-warm the Python interop environment")).toBeLessThan(workflow.indexOf("- name: Verify"));
  });

  it("fails if hosted checks modify the checkout", () => {
    expect(workflow).toContain("git diff --check");
    expect(workflow).toContain("git status --porcelain");
  });
});

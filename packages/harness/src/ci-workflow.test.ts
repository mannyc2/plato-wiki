import { describe, expect, it } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";

const root = getRepoRoot();
const workflowPath = join(root, ".github/workflows/ci.yml");
const workflow = existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
type WorkflowStep = { name?: string; id?: string; if?: string; run?: string; uses?: string };
const workflowJobs = (Bun.YAML.parse(workflow) as {
  jobs: { verify: { steps: WorkflowStep[] }; deploy: { if: string } };
}).jobs;
const driver = readFileSync(join(root, "scripts/ci.ts"), "utf8");
const publicFiles = readFileSync(join(root, "release/public-files.toml"), "utf8");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  scripts?: Record<string, string>;
  packageManager?: string;
};

describe("ci contract", () => {
  it("exposes one verification entry point", () => {
    expect(manifest.scripts?.ci).toBe("bun scripts/ci.ts");
  });

  it("keeps the declared release-provenance generator executable", () => {
    const command = manifest.scripts?.["release:provenance"];
    expect(command).toBe("bun scripts/release/generate-provenance.ts");
    const scriptPath = command?.split(" ").at(-1);
    expect(scriptPath).toBeTruthy();
    expect(existsSync(join(root, scriptPath!))).toBe(true);
    expect(publicFiles).toContain('"scripts/"');
    expect(publicFiles).not.toContain(`"${scriptPath}"`);
  });

  it("runs every required stage and cannot pass while one is skipped", () => {
    for (const stage of ["lint", "test", "typecheck", "validate", "build"]) {
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

  it("fetches history for snapshot-bound ontology verification", () => {
    const [verifyWorkflow = ""] = workflow.split("\n  deploy:");
    const checkoutStep = verifyWorkflow.match(
      /- uses: actions\/checkout@[0-9a-f]{40}\n(?: {8,}[^\n]*\n)*/u,
    )?.[0] ?? "";
    expect(checkoutStep).toContain("fetch-depth: 0");
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
    expect(deployJob).toContain("github.repository == 'mannyc2/plato-wiki'");
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
    expect(workflow).toContain("bun run harness completeness --target knowledge-base --json");
    expect(workflow).toContain("bun run public:export");
    expect(workflow).toContain("bun run release:audit");
    expect(workflow).toContain("--public-tree");
    expect(workflow).toContain("--export-manifest");
    expect(workflow).toContain("actions/upload-pages-artifact@");
    expect(workflow).toContain("scripts/release/smoke-site.ts");
  });

  it("verifies incomplete editions and requires readiness for every release artifact", () => {
    const verify = workflowJobs.verify.steps.find((step) => step.name === "Verify integrity and build")!;
    expect(verify.if).toBeUndefined();
    expect(verify.run).toContain('if [ "${{ steps.edition.outputs.ready }}" = \'true\' ]; then');
    expect(verify.run).toContain('--export-manifest "${RUNNER_TEMP}/public-manifest.json"');
    expect(verify.run).toMatch(/else\s+bun run ci\s+fi/u);
    const gated = workflowJobs.verify.steps.filter((step) =>
      step.id === "public_manifest" || step.name === "Package downloadable edition" ||
      (step.uses?.startsWith("actions/upload-") && step.if !== "always()"));
    expect(gated).toHaveLength(4);
    for (const step of gated) expect(step.if).toBe("steps.edition.outputs.ready == 'true'");
    expect(workflowJobs.deploy.if).toContain("needs.verify.outputs.edition_ready == 'true'");
    expect(workflow).not.toContain("continue-on-error");
  });

  it("distinguishes valid incomplete reports from command errors before allowing verification", () => {
    const readiness = workflowJobs.verify.steps.find((step) => step.id === "edition")!.run!;
    const script = readiness.match(/bun -e '([\s\S]+?)'/u)?.[1];
    expect(script).toBeDefined();
    const directory = mkdtempSync(join(tmpdir(), "plato-ci-readiness-"));
    const path = join(directory, "report.json");
    const report = (ready: boolean) => JSON.stringify({
      selectedTarget: "knowledge-base", selected: { target: "knowledge-base", ready },
      report: {
        schemaVersion: 1, artifactKind: "plato-edition-completeness",
        targets: { "knowledge-base": { ready } },
      },
    });
    try {
      for (const [content, status, expected] of [
        [report(true), 0, "ready=true\n"],
        [report(false), 2, "ready=false\n"],
        [report(false), 1, undefined],
        [report(false), 0, undefined],
        [report(true), 2, undefined],
        [report(true).replace('"schemaVersion":1', '"schemaVersion":2'), 0, undefined],
        [report(false).replace('"ready":false', '"ready":true'), 0, undefined],
        ['{"selectedTarget":"corpus"}', 2, undefined],
        ["not JSON", 2, undefined],
      ] as const) {
        writeFileSync(path, content);
        const result = Bun.spawnSync([process.execPath, "-e", script!, path, String(status)], {
          stdout: "pipe", stderr: "pipe",
        });
        if (expected !== undefined) {
          expect(result.exitCode).toBe(0);
          expect(result.stdout.toString()).toBe(expected);
        } else {
          expect(result.exitCode).not.toBe(0);
          expect(result.stdout.toString()).toBe("");
        }
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
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

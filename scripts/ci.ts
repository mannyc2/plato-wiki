/**
 * The one verification entry point, local and hosted (`bun run ci`).
 *
 * Default runs use a disposable OS-temporary site. Release runs must provide
 * an external output directory, an exact source revision, and the validated
 * public-export manifest; only that explicit mode retains a deployable site.
 */
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { writeSiteReleaseMarker } from "../packages/harness/src/site-release.js";

type Stage = { name: string; command: string; extraArgs?: string[] };

const repoRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const rawArgs = process.argv.slice(2).filter((argument) => argument !== "--");
const options = new Map<string, string>();
const knownOptions = new Set(["--site-out-dir", "--source-revision", "--export-manifest"]);
for (let index = 0; index < rawArgs.length; index += 2) {
  const option = rawArgs[index];
  const value = rawArgs[index + 1];
  if (!option || !knownOptions.has(option) || !value) {
    throw new Error(`unknown or incomplete CI option: ${option ?? "<missing>"}`);
  }
  if (options.has(option)) throw new Error(`duplicate CI option: ${option}`);
  options.set(option, value);
}

const releaseOptionCount = [...knownOptions].filter((option) => options.has(option)).length;
if (releaseOptionCount !== 0 && releaseOptionCount !== knownOptions.size) {
  throw new Error("release artifact mode requires --site-out-dir, --source-revision, and --export-manifest together");
}
const releaseArtifactMode = releaseOptionCount === knownOptions.size;
const requestedSiteOutDir = options.get("--site-out-dir");
if (requestedSiteOutDir && !isAbsolute(requestedSiteOutDir)) {
  throw new Error("--site-out-dir must be an absolute path outside the repository");
}
const siteOutDir = requestedSiteOutDir ? resolve(requestedSiteOutDir) : mkdtempSync(join(tmpdir(), "plato-ci-site-"));
const pathFromRepo = relative(repoRoot, siteOutDir);
if (pathFromRepo === "" || (!pathFromRepo.startsWith("..") && !isAbsolute(pathFromRepo))) {
  throw new Error("--site-out-dir must be outside the repository");
}
if (releaseArtifactMode && existsSync(siteOutDir)) {
  if (lstatSync(siteOutDir).isSymbolicLink() || !lstatSync(siteOutDir).isDirectory()) {
    throw new Error("--site-out-dir must be a real directory or a nonexistent path");
  }
  if (readdirSync(siteOutDir).length > 0) throw new Error("--site-out-dir must be empty before a release build");
}

const STAGES: Stage[] = [
  { name: "test", command: "bun run test" },
  { name: "typecheck", command: "bun run typecheck" },
  { name: "validate", command: "bun run validate" },
  { name: "site", command: "bun run harness site", extraArgs: ["--out-dir", siteOutDir] },
];

const results: Array<{ stage: string; ok: boolean; ms: number }> = [];
let failed: string | undefined;

try {
  for (const stage of STAGES) {
    if (failed) break;
    const startedAt = performance.now();
    console.log(`\n=== ci: ${stage.name} ===`);
    const argv = [...stage.command.split(" "), ...(stage.extraArgs ?? [])];
    const proc = Bun.spawnSync(argv, { cwd: repoRoot, stdout: "inherit", stderr: "inherit" });
    const ms = Math.round(performance.now() - startedAt);
    const ok = proc.exitCode === 0;
    results.push({ stage: stage.name, ok, ms });
    if (!ok) failed = stage.name;
  }

  if (!failed && releaseArtifactMode) {
    const sourceRevision = options.get("--source-revision")!;
    const exportManifestPath = resolve(options.get("--export-manifest")!);
    const sourceCommittedAt = execFileSync("git", ["show", "-s", "--format=%cI", sourceRevision], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const marker = writeSiteReleaseMarker({
      siteOutDir,
      exportManifestPath,
      sourceRevision,
      sourceCommittedAt,
    });
    console.log(`release artifact: ${siteOutDir}`);
    console.log(`release marker: ${marker.sourceRevision} ${marker.publicManifestSha256}`);
  }
} finally {
  if (!releaseArtifactMode) rmSync(siteOutDir, { recursive: true, force: true });
}

console.log("\n=== ci summary ===");
for (const { stage, ok, ms } of results) {
  console.log(`${ok ? "pass" : "FAIL"}  ${stage.padEnd(10)} ${ms}ms`);
}
for (const stage of STAGES.slice(results.length)) {
  console.log(`skip  ${stage.name.padEnd(10)} (earlier stage failed)`);
}

if (failed) {
  console.error(`\nci: ${failed} failed`);
  process.exit(1);
}
console.log("\nci: all stages passed");

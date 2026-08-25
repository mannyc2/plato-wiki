import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { getRepoRoot } from "./paths.js";
import type {
  CompletenessFacts,
  CompletenessReport,
  CompletenessState,
  CompletenessTarget,
} from "./completeness.js";
import {
  type ReleaseProvenanceReceiptRoot,
  validateReleaseProvenanceReceipts,
} from "./release-provenance.js";

export type PublicReleaseTarget = Exclude<CompletenessTarget, "corpus">;
export type PublicReleaseCheckId =
  | "PUB-TARGET"
  | "PUB-PROVENANCE"
  | "PUB-TREE"
  | "PUB-LICENSE"
  | "PUB-CI"
  | "PUB-AUDIO-TRUTH";

export type PublicReleaseFact = {
  id: PublicReleaseCheckId;
  state: Extract<CompletenessState, "pass" | "fail">;
  observed: string;
  evidence: string[];
  remediation?: string;
};

export type PublicReleaseFacts = {
  provenance: { valid: boolean; evidence: string; evidencePath: ReleaseProvenanceReceiptRoot };
  tree: { valid: boolean; manifestPresent: boolean; manifestHash: string | null; inventoryHash: string | null; evidence: string };
  license: { valid: boolean; evidence: string };
  ci: { valid: boolean; evidence: string };
};

export type PublicReleaseReport = {
  schemaVersion: 1;
  artifactKind: "plato-public-release-readiness";
  target: PublicReleaseTarget;
  ready: boolean;
  checks: PublicReleaseFact[];
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function nonEmptyFile(path: string) {
  return existsSync(path) && statSync(path).isFile() && statSync(path).size > 0;
}

type PublicManifestEntry = { path: string; sha256: string };
type DigestBinding = { field: string; sha256: string };
type ParsedManifest = { files: PublicManifestEntry[]; digestBindings: DigestBinding[] };

const SHA256_PATTERN = /^[0-9a-f]{64}$/u;

/** Resolve a package.json script by name, for following a CI entry point. */
function manifestScript(repoRoot: string, name: string) {
  const path = join(repoRoot, "package.json");
  if (!nonEmptyFile(path)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { scripts?: Record<string, unknown> };
    const script = parsed.scripts?.[name];
    return typeof script === "string" ? script : undefined;
  } catch {
    return undefined;
  }
}

function compareManifestEntries(left: PublicManifestEntry, right: PublicManifestEntry) {
  return left.path === right.path ? 0 : left.path < right.path ? -1 : 1;
}

function forbiddenPublicPath(path: string) {
  return path === "plans"
    || path.startsWith("plans/")
    || path === "private"
    || path.startsWith("private/")
    || path === "release/private"
    || path.startsWith("release/private/")
    || path === "wiki/transcripts"
    || path.startsWith("wiki/transcripts/")
    || path === "wiki/public-release-readiness.md"
    || path === ".env"
    || (path.startsWith(".env.") && !path.endsWith(".example"))
    || path === ".git"
    || path.startsWith(".git/")
    || path === "node_modules"
    || path.startsWith("node_modules/")
    || path === "scratch"
    || path.startsWith("scratch/");
}

function pathProblem(path: string) {
  if (path.length === 0) return "empty path";
  if (path.includes("\\")) return "backslashes are forbidden";
  if (path.startsWith("/") || /^[A-Za-z]:/u.test(path)) return "absolute paths are forbidden";
  if (path.includes("\0")) return "NUL bytes are forbidden";
  const segments = path.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) return "non-canonical or traversal segment";
  if (forbiddenPublicPath(path)) return "private or forbidden path";
  return undefined;
}

function digestBinding(record: Record<string, unknown>, field: "publicFilesSha256" | "allowlistSha256"): DigestBinding | undefined {
  if (!(field in record)) return undefined;
  const value = record[field];
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) throw new Error(`${field} must be a lowercase SHA-256 digest`);
  return { field, sha256: value };
}

function parseManifest(value: unknown): ParsedManifest {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("manifest must be an object");
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.files)) throw new Error("manifest.files must be an array");
  if (record.files.length === 0) throw new Error("manifest.files must not be empty");
  const files = record.files.map((value, index): PublicManifestEntry => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`manifest.files[${index}] must be a {path,sha256} object`);
    const entry = value as Record<string, unknown>;
    const keys = Object.keys(entry).sort();
    if (keys.length !== 2 || keys[0] !== "path" || keys[1] !== "sha256") throw new Error(`manifest.files[${index}] must contain exactly path and sha256`);
    if (typeof entry.path !== "string") throw new Error(`manifest.files[${index}].path must be a string`);
    if (typeof entry.sha256 !== "string" || !SHA256_PATTERN.test(entry.sha256)) throw new Error(`manifest.files[${index}].sha256 must be a lowercase SHA-256 digest`);
    const problem = pathProblem(entry.path);
    if (problem) throw new Error(`manifest.files[${index}].path is unsafe: ${problem}`);
    return { path: entry.path, sha256: entry.sha256 };
  });
  const sorted = [...files].sort(compareManifestEntries);
  if (files.some((entry, index) => entry.path !== sorted[index]?.path)) throw new Error("manifest.files must be sorted by path");
  if (files.some((entry, index) => index > 0 && entry.path === files[index - 1]?.path)) throw new Error("manifest.files contains duplicate paths");
  const digestBindings = (["publicFilesSha256", "allowlistSha256"] as const)
    .map((field) => digestBinding(record, field))
    .filter((binding): binding is DigestBinding => binding !== undefined);
  return { files, digestBindings };
}

function hashInventory(files: PublicManifestEntry[]) {
  return sha256(`${files.map((entry) => `${entry.path}\0${entry.sha256}`).join("\n")}\n`);
}

function inventoryTree(root: string, dir = root): PublicManifestEntry[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(dir, entry.name);
    const display = relative(root, absolute).split(sep).join("/");
    if (entry.isSymbolicLink()) throw new Error(`public tree contains symlink: ${display}`);
    if (entry.isDirectory()) return inventoryTree(root, absolute);
    if (!entry.isFile()) throw new Error(`public tree contains unsupported entry: ${display}`);
    return [{ path: display, sha256: sha256(readFileSync(absolute)) }];
  }).sort(compareManifestEntries);
}

function readManifestEntry(root: string, entry: PublicManifestEntry) {
  let current = root;
  for (const segment of entry.path.split("/")) {
    current = join(current, segment);
    if (!existsSync(current)) throw new Error(`manifest entry is missing: ${entry.path}`);
    const metadata = lstatSync(current);
    if (metadata.isSymbolicLink()) throw new Error(`manifest entry traverses a symlink: ${entry.path}`);
  }
  if (!lstatSync(current).isFile()) throw new Error(`manifest entry is not a regular file: ${entry.path}`);
  const actualHash = sha256(readFileSync(current));
  if (actualHash !== entry.sha256) throw new Error(`manifest content hash differs: ${entry.path}`);
  return { path: entry.path, sha256: actualHash };
}

function verifyDigestBindings(repoRoot: string, bindings: DigestBinding[]) {
  if (bindings.length === 0) return;
  const entry = { path: "release/public-files.toml", sha256: bindings[0]!.sha256 };
  readManifestEntry(repoRoot, entry);
  if (bindings.some((binding) => binding.sha256 !== entry.sha256)) throw new Error("manifest public-files digest fields disagree");
}

function safeTreePath(repoRoot: string, tree: string) {
  const absolute = resolve(repoRoot, tree);
  if (!existsSync(absolute) || !lstatSync(absolute).isDirectory() || lstatSync(absolute).isSymbolicLink()) throw new Error(`Public tree does not exist or is not a non-symlink directory: ${tree}`);
  return absolute;
}

export function buildPublicReleaseFacts({
  repoRoot = getRepoRoot(),
  exportManifest = "release/private/public-export-manifest.json",
  publicTree,
  provenanceRoot,
}: {
  repoRoot?: string;
  exportManifest?: string;
  publicTree?: string;
  provenanceRoot?: ReleaseProvenanceReceiptRoot;
} = {}): PublicReleaseFacts {
  const selectedProvenanceRoot = provenanceRoot ?? (
    nonEmptyFile(join(repoRoot, "release/private/replay-provenance.json"))
    && nonEmptyFile(join(repoRoot, "release/private/source-acquisition-receipts.json"))
      ? "release/private"
      : "release/public"
  );
  const provenancePaths = [
    `${selectedProvenanceRoot}/replay-provenance.json`,
    `${selectedProvenanceRoot}/source-acquisition-receipts.json`,
  ];
  const missingProvenance = provenancePaths.filter((path) => !nonEmptyFile(join(repoRoot, path)));
  const provenanceIssues = missingProvenance.length === 0
    ? validateReleaseProvenanceReceipts(repoRoot, selectedProvenanceRoot)
    : [];
  const provenanceValid = missingProvenance.length === 0 && provenanceIssues.length === 0;
  const manifestPath = resolve(repoRoot, exportManifest);
  const manifestPresent = nonEmptyFile(manifestPath);
  let treeValid = false;
  let manifestHash: string | null = null;
  let inventoryHash: string | null = null;
  let treeEvidence = manifestPresent ? "manifest is malformed" : "canonical public-export manifest is missing";
  if (manifestPresent) {
    const content = readFileSync(manifestPath, "utf8");
    manifestHash = sha256(content);
    try {
      const manifest = parseManifest(JSON.parse(content) as unknown);
      verifyDigestBindings(repoRoot, manifest.digestBindings);
      if (publicTree) {
        const treePath = safeTreePath(repoRoot, publicTree);
        const actual = inventoryTree(treePath);
        inventoryHash = hashInventory(actual);
        treeValid = JSON.stringify(actual) === JSON.stringify(manifest.files);
        treeEvidence = treeValid ? `${actual.length} materialized files exactly match manifest paths and content hashes` : `materialized tree differs from ${manifest.files.length}-file path-and-hash manifest`;
      } else {
        const actual = manifest.files.map((entry) => readManifestEntry(repoRoot, entry));
        inventoryHash = hashInventory(actual);
        treeValid = true;
        treeEvidence = `${actual.length} canonical repository files exactly match manifest paths and content hashes`;
      }
    } catch (error) {
      treeValid = false;
      treeEvidence = error instanceof Error ? error.message : "manifest is malformed";
    }
  }

  const codeLicense = ["LICENSE", "LICENSE.md", "LICENSE.txt"].some((path) => nonEmptyFile(join(repoRoot, path)));
  const contentLicense = nonEmptyFile(join(repoRoot, "LICENSE-CONTENT"));
  const notice = nonEmptyFile(join(repoRoot, "NOTICE"));
  const sourceProvenance = nonEmptyFile(join(repoRoot, "raw/plato/SOURCES.md"));
  const publicationLicense = nonEmptyFile(join(repoRoot, "docs/publication-license.md"));
  const ciCandidates = [".github/workflows/public-ci.yml", ".github/workflows/public-ci.yaml", ".github/workflows/ci.yml", ".github/workflows/ci.yaml"];
  const ciPath = ciCandidates.find((path) => nonEmptyFile(join(repoRoot, path)));
  let ciValid = false;
  if (ciPath) {
    const content = readFileSync(join(repoRoot, ciPath), "utf8");
    const secretFree = (text: string) => !/PI_API_KEY|PLATO_RECORDING_ARTIFACT_ROOT|secrets\./u.test(text);
    const runsGates = (text: string) =>
      /bun run test/u.test(text) && /bun run typecheck/u.test(text) && /bun run validate/u.test(text);
    // The workflow may run the gates directly, or delegate to the single
    // `bun run ci` entry point. When it delegates, the contract is checked
    // wherever the manifest actually resolves it to — the script itself if it
    // names the gates, otherwise the driver script it runs. What must hold is
    // the contract, not a particular file layout.
    ciValid = secretFree(content) && runsGates(content);
    if (!ciValid && secretFree(content) && /bun run ci\b/u.test(content)) {
      const script = manifestScript(repoRoot, "ci");
      if (script !== undefined && secretFree(script) && runsGates(script)) {
        // A chained entry point IS the contract, and needs no abort check:
        // `&&` already stops the run at the first failing gate.
        ciValid = true;
      } else {
        const driverPath = script?.match(/(?:^|\s)(\S+\.ts)(?:\s|$)/u)?.[1];
        const driver = driverPath && nonEmptyFile(join(repoRoot, driverPath))
          ? readFileSync(join(repoRoot, driverPath), "utf8")
          : undefined;
        // A driver runs the stages itself and prints its own summary, so it must
        // abort on a failed stage instead of reporting and exiting 0. Grepping
        // for the abort is a PROXY for that behaviour: it cannot see a `throw`,
        // a `process.exitCode` assignment, or an unreachable `process.exit(1)`.
        // Tightening it means executing the driver, which this gate does not do.
        ciValid = driver !== undefined && secretFree(driver) && runsGates(driver) && /process\.exit\(1\)/u.test(driver);
      }
    }
  }
  return {
    provenance: {
      valid: provenanceValid,
      evidencePath: selectedProvenanceRoot,
      evidence: provenanceValid
        ? "exact replay and source receipts validate against current artifact and evidence hashes"
        : missingProvenance.length > 0
          ? `missing: ${missingProvenance.join(", ")}`
          : provenanceIssues.join("; "),
    },
    tree: { valid: treeValid, manifestPresent, manifestHash, inventoryHash, evidence: treeEvidence },
    license: { valid: codeLicense && contentLicense && notice && sourceProvenance && publicationLicense, evidence: `code_license=${codeLicense}; content_license=${contentLicense}; notice=${notice}; source_provenance=${sourceProvenance}; publication_license=${publicationLicense}` },
    ci: { valid: ciValid, evidence: ciPath ? `${ciPath}; static_contract=${ciValid}` : "public CI workflow contract is missing" },
  };
}

function check(id: PublicReleaseCheckId, passed: boolean, observed: string, evidence: string[], remediation: string): PublicReleaseFact {
  return { id, state: passed ? "pass" : "fail", observed, evidence, ...(passed ? {} : { remediation }) };
}

export function buildPublicReleaseReport(
  _facts: CompletenessFacts,
  completeness: CompletenessReport,
  target: PublicReleaseTarget,
  releaseFacts = buildPublicReleaseFacts(),
): PublicReleaseReport {
  const targetResult = completeness.targets[target];
  const audioTruth = completeness.families.find((family) => family.id === "CMP-AUDIO-TRUTH")?.state === "pass";
  const checks = [
    check("PUB-TARGET", targetResult.ready, `${target} ready=${targetResult.ready}`, ["wiki/completeness.md"], `close ${targetResult.blockers.join(", ") || "edition"} blockers`),
    check("PUB-PROVENANCE", releaseFacts.provenance.valid, releaseFacts.provenance.evidence, [releaseFacts.provenance.evidencePath], "add exact replay and acquisition receipts to the supported release provenance surface"),
    check("PUB-TREE", releaseFacts.tree.valid, releaseFacts.tree.evidence, ["release/private/public-export-manifest.json"], "generate and validate the allowlisted public export under the reproducible public-source hard cut"),
    check("PUB-LICENSE", releaseFacts.license.valid, releaseFacts.license.evidence, ["LICENSE", "LICENSE-CONTENT", "NOTICE", "raw/plato/SOURCES.md", "docs/publication-license.md"], "add and align the code license, content license, notice, source provenance, and publication license under the reproducible public-source hard cut"),
    check("PUB-CI", releaseFacts.ci.valid, releaseFacts.ci.evidence, [".github/workflows/ci.yml"], "add the least-privilege public CI contract under the required CI baseline"),
    check("PUB-AUDIO-TRUTH", audioTruth, `exposed audio truth=${audioTruth}`, ["wiki/recordings", "generated site"], "remove draft audio from the export or accept its full production chain"),
  ];
  return { schemaVersion: 1, artifactKind: "plato-public-release-readiness", target, ready: checks.every((entry) => entry.state === "pass"), checks };
}

export function renderPublicReleaseReport(report: PublicReleaseReport) {
  return [
    "# Public Release Readiness",
    "",
    "Private operational report. Generated by `bun run release:audit -- --target knowledge-base --write`; excluded from the public export.",
    "",
    `Selected edition target: **${report.target}**`,
    "",
    `Overall: **${report.ready ? "READY" : "INCOMPLETE"}**`,
    "",
    "| gate | state | observed | evidence |",
    "| --- | --- | --- | --- |",
    ...report.checks.map((entry) => `| ${entry.id} | ${entry.state === "pass" ? "pass" : "FAIL"} | ${entry.observed.replaceAll("|", "\\|")} | ${entry.evidence.join(", ")} |`),
    "",
    "## Blockers",
    "",
    ...report.checks.filter((entry) => entry.state === "fail").map((entry) => `- **${entry.id}**: ${entry.remediation}`),
    "",
    "Hosted CI/deployment status is deliberately outside this local report.",
    "",
  ].join("\n");
}

function atomicWrite(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content, "utf8");
  renameSync(temporary, path);
}

export function writePublicReleaseReport(report: PublicReleaseReport, path = "wiki/public-release-readiness.md") {
  const absolute = join(getRepoRoot(), path);
  atomicWrite(absolute, renderPublicReleaseReport(report));
  return { path: relative(getRepoRoot(), absolute), report };
}

export function validatePublicReleaseReport(
  facts: CompletenessFacts,
  completeness: CompletenessReport,
  path = "wiki/public-release-readiness.md",
) {
  const absolute = join(getRepoRoot(), path);
  if (!nonEmptyFile(absolute)) return [];
  const expected = renderPublicReleaseReport(buildPublicReleaseReport(facts, completeness, "knowledge-base"));
  return readFileSync(absolute, "utf8") === expected
    ? []
    : [{ path, message: "Public-release readiness report is stale; regenerate it with `bun run release:audit -- --target knowledge-base --write`." }];
}

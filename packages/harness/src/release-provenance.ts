import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { getRepoRoot } from "./paths.js";

const SHA256 = /^[0-9a-f]{64}$/u;
const COMMIT = /^[0-9a-f]{40}$/u;
const RELEASE_VERSION = "2.0.0";
const PERSEUS_COMMIT = "e37eed2e8a5fed710c3ab0d312249c3fb04d77e0";
const JTAUBER_COMMIT = "3b482c7af8a43444a6e0316f8cb7044a18dbd094";

export type FileBinding = { path: string; sha256: string };
export type ReplayArtifact = FileBinding & {
  tier: "editorial-session" | "model-replay";
  evidence: FileBinding[];
};

export type ReplayProvenanceReceipt = {
  schema_version: 1;
  artifact_kind: "plato-release-replay-provenance";
  release_version: string;
  corpus_source_commit: string;
  artifacts: ReplayArtifact[];
};

export type PublicReplayProvenanceReceipt = {
  schema_version: 2;
  artifact_kind: "plato-public-replay-provenance";
  release_version: string;
  artifacts: ReplayArtifact[];
};

export type SourceAcquisition = FileBinding & {
  language: "greek" | "english";
  dialogue: string;
  upstream_repository: "PerseusDL/canonical-greekLit" | "jtauber/plato-texts";
  upstream_commit: string;
  upstream_path: string;
  upstream_sha256: string;
  edition: "perseus-grc2" | "perseus-eng2" | "learner-text";
  acquisition: "tei-import" | "byte-identical-copy";
  modifications: string[];
};

export type SourceAcquisitionReceipt = {
  schema_version: 1;
  artifact_kind: "plato-source-acquisition-receipts";
  release_version: string;
  verifier: FileBinding;
  importer: FileBinding;
  sources_record: FileBinding;
  sources: SourceAcquisition[];
};

export type PublicSourceAcquisitionReceipt = Omit<SourceAcquisitionReceipt, "schema_version" | "artifact_kind"> & {
  schema_version: 2;
  artifact_kind: "plato-public-source-acquisition-receipts";
};

export type ReleaseProvenanceReceiptRoot = "release/private" | "release/public";

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function binding(repoRoot: string, path: string): FileBinding {
  const absolute = join(repoRoot, path);
  if (!existsSync(absolute) || !lstatSync(absolute).isFile() || lstatSync(absolute).isSymbolicLink()) {
    throw new Error(`provenance evidence is missing or unsafe: ${path}`);
  }
  return { path, sha256: sha256(readFileSync(absolute)) };
}

function filesUnder(repoRoot: string, directory: string): string[] {
  const root = join(repoRoot, directory);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    const display = relative(repoRoot, path).split("\\").join("/");
    if (entry.isSymbolicLink()) throw new Error(`provenance input contains symlink: ${display}`);
    if (entry.isDirectory()) return filesUnder(repoRoot, display);
    return entry.isFile() ? [display] : [];
  }).sort();
}

const EDITORIAL_DIRECTORIES = [
  "wiki/observations",
  "wiki/claims",
  "wiki/relations",
  "wiki/commentary",
  "wiki/commentary-audits",
  "wiki/voices",
] as const;

export function publicEditorialArtifactPaths(repoRoot = getRepoRoot()) {
  return EDITORIAL_DIRECTORIES.flatMap((directory) => filesUnder(repoRoot, directory))
    .filter((path) => path.endsWith(".md") || path.endsWith(".json"))
    .filter((path) => !path.startsWith("wiki/commentary-audits/") || path.split("/").length === 3)
    .sort();
}

function dialogueFromPath(path: string) {
  return basename(path).replace(/\.(?:md|json)$/u, "");
}

function reviewFiles(repoRoot: string) {
  return filesUnder(repoRoot, "wiki/review");
}

function matchingReviewBindings(repoRoot: string, path: string, reviews: string[]): FileBinding[] {
  const dialogue = dialogueFromPath(path);
  if (path.startsWith("wiki/observations/")) return [binding(repoRoot, "wiki/ingest-log.md")];

  if (path.startsWith("wiki/commentary-audits/") || path.startsWith("wiki/commentary/")) {
    const manifestPath = `wiki/commentary-audits/${dialogue}.json`;
    const manifest = JSON.parse(readFileSync(join(repoRoot, manifestPath), "utf8")) as {
      acceptance?: { review_note?: FileBinding };
    };
    const note = manifest.acceptance?.review_note;
    if (!note) throw new Error(`${manifestPath} has no acceptance review-note binding`);
    const current = binding(repoRoot, note.path);
    if (current.sha256 !== note.sha256) throw new Error(`${manifestPath} has a stale acceptance review-note binding`);
    return path === manifestPath ? [current] : [binding(repoRoot, manifestPath), current];
  }

  const lane = path.startsWith("wiki/claims/")
    ? "claims"
    : path.startsWith("wiki/relations/")
      ? "relations"
      : "voices";
  const selected = reviews.filter((review) => {
    const name = basename(review).toLowerCase();
    const content = readFileSync(join(repoRoot, review), "utf8");
    if (content.includes(`wiki/${lane}/${dialogue}.md`)) return true;
    if (!name.includes(dialogue)) return false;
    if (lane === "claims") return name.includes("claim");
    if (lane === "relations") return name.includes("relation");
    return name.includes("reported-turn") || name.includes("voice");
  });
  return selected.map((review) => binding(repoRoot, review));
}

function buildReplayArtifacts(repoRoot: string) {
  const reviews = reviewFiles(repoRoot);
  return publicEditorialArtifactPaths(repoRoot).map((path): ReplayArtifact => {
    const evidence = matchingReviewBindings(repoRoot, path, reviews);
    if (evidence.length === 0) throw new Error(`accepted public artifact lacks replay/editorial evidence: ${path}`);
    return {
      ...binding(repoRoot, path),
      tier: path.startsWith("wiki/commentary") ? "model-replay" : "editorial-session",
      evidence: evidence.sort((left, right) => left.path.localeCompare(right.path)),
    };
  });
}

export function buildReplayProvenanceReceipt({
  repoRoot = getRepoRoot(),
  corpusSourceCommit,
}: {
  repoRoot?: string;
  corpusSourceCommit: string;
}): ReplayProvenanceReceipt {
  if (!COMMIT.test(corpusSourceCommit)) throw new Error("corpus source commit must be a full lowercase Git SHA");
  return {
    schema_version: 1,
    artifact_kind: "plato-release-replay-provenance",
    release_version: RELEASE_VERSION,
    corpus_source_commit: corpusSourceCommit,
    artifacts: buildReplayArtifacts(repoRoot),
  };
}

export function buildPublicReplayProvenanceReceipt(
  repoRoot = getRepoRoot(),
): PublicReplayProvenanceReceipt {
  return {
    schema_version: 2,
    artifact_kind: "plato-public-replay-provenance",
    release_version: RELEASE_VERSION,
    artifacts: buildReplayArtifacts(repoRoot),
  };
}

export function buildPublicSourceAcquisitionReceipt(
  receipt: SourceAcquisitionReceipt,
): PublicSourceAcquisitionReceipt {
  return {
    schema_version: 2,
    artifact_kind: "plato-public-source-acquisition-receipts",
    release_version: receipt.release_version,
    verifier: receipt.verifier,
    importer: receipt.importer,
    sources_record: receipt.sources_record,
    sources: receipt.sources,
  };
}

type SourceRow = Pick<SourceAcquisition, "upstream_repository" | "upstream_commit" | "upstream_path" | "edition" | "acquisition">;

function sourceRows(repoRoot: string) {
  const rows = new Map<string, SourceRow>();
  const recordPath = join(repoRoot, "raw/plato/SOURCES.md");
  if (!existsSync(recordPath)) return rows;
  for (const line of readFileSync(recordPath, "utf8").split("\n")) {
    const perseus = line.match(/^\| ((?:greek|english)\/[^|]+\.txt) \| tlg0059\.(tlg\d+)\.(perseus-(?:grc|eng)2) \| confirmed \(script(?:;[^)]*)?\) \|$/u);
    if (perseus) {
      rows.set(`raw/plato/${perseus[1]}`, {
        upstream_repository: "PerseusDL/canonical-greekLit",
        upstream_commit: PERSEUS_COMMIT,
        upstream_path: `data/tlg0059/${perseus[2]}/tlg0059.${perseus[2]}.${perseus[3]}.xml`,
        edition: perseus[3] as "perseus-grc2" | "perseus-eng2",
        acquisition: "tei-import",
      });
      continue;
    }
    const copied = line.match(/^\| greek\/([a-z-]+)\.txt \| jtauber\/plato-texts@3b482c7:raw-text\/([a-z-]+)\.txt \| confirmed \(byte-identical copy\) \|$/u);
    if (copied && copied[1] === copied[2]) {
      rows.set(`raw/plato/greek/${copied[1]}.txt`, {
        upstream_repository: "jtauber/plato-texts",
        upstream_commit: JTAUBER_COMMIT,
        upstream_path: `raw-text/${copied[1]}.txt`,
        edition: "learner-text",
        acquisition: "byte-identical-copy",
      });
    }
  }
  return rows;
}

function parseReceipt<T>(repoRoot: string, path: string): T | undefined {
  try {
    return JSON.parse(readFileSync(join(repoRoot, path), "utf8")) as T;
  } catch {
    return undefined;
  }
}

function validateBinding(repoRoot: string, value: FileBinding, label: string, issues: string[]) {
  if (!value || typeof value.path !== "string" || typeof value.sha256 !== "string" || !SHA256.test(value.sha256)) {
    issues.push(`${label} is not a path-and-SHA-256 binding`);
    return;
  }
  try {
    const current = binding(repoRoot, value.path);
    if (current.sha256 !== value.sha256) issues.push(`${label} hash differs: ${value.path}`);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : `${label} is unreadable`);
  }
}

function receiptRoot(repoRoot: string, requested?: ReleaseProvenanceReceiptRoot): ReleaseProvenanceReceiptRoot {
  if (requested) return requested;
  const privateReplay = join(repoRoot, "release/private/replay-provenance.json");
  const privateSources = join(repoRoot, "release/private/source-acquisition-receipts.json");
  return existsSync(privateReplay) && existsSync(privateSources) ? "release/private" : "release/public";
}

export function validateReleaseProvenanceReceipts(
  repoRoot = getRepoRoot(),
  requestedRoot?: ReleaseProvenanceReceiptRoot,
) {
  const issues: string[] = [];
  const root = receiptRoot(repoRoot, requestedRoot);
  const isPublic = root === "release/public";
  const replayPath = `${root}/replay-provenance.json`;
  const sourcePath = `${root}/source-acquisition-receipts.json`;
  const replay = parseReceipt<ReplayProvenanceReceipt | PublicReplayProvenanceReceipt>(repoRoot, replayPath);
  const source = parseReceipt<SourceAcquisitionReceipt | PublicSourceAcquisitionReceipt>(repoRoot, sourcePath);
  if (!replay) issues.push(`${replayPath} is missing or malformed`);
  if (!source) issues.push(`${sourcePath} is missing or malformed`);

  if (replay) {
    const privateIdentity = replay.schema_version === 1
      && replay.artifact_kind === "plato-release-replay-provenance"
      && "corpus_source_commit" in replay
      && COMMIT.test(replay.corpus_source_commit);
    const publicIdentity = replay.schema_version === 2
      && replay.artifact_kind === "plato-public-replay-provenance"
      && !("corpus_source_commit" in replay);
    if (replay.release_version !== RELEASE_VERSION || (isPublic ? !publicIdentity : !privateIdentity)) {
      issues.push(`${replayPath} has invalid release identity`);
    }
    const expected = publicEditorialArtifactPaths(repoRoot);
    const actual = Array.isArray(replay.artifacts) ? replay.artifacts : [];
    if (actual.map((entry) => entry.path).join("\n") !== expected.join("\n")) issues.push(`${replayPath} does not cover the exact public editorial artifact set`);
    for (const [index, artifact] of actual.entries()) {
      validateBinding(repoRoot, artifact, `${replayPath} artifacts[${index}]`, issues);
      if (!Array.isArray(artifact.evidence) || artifact.evidence.length === 0) issues.push(`${replayPath} ${artifact.path} has no evidence`);
      else artifact.evidence.forEach((entry, evidenceIndex) => validateBinding(repoRoot, entry, `${replayPath} ${artifact.path} evidence[${evidenceIndex}]`, issues));
    }
  }

  if (source) {
    const privateIdentity = source.schema_version === 1
      && source.artifact_kind === "plato-source-acquisition-receipts";
    const publicIdentity = source.schema_version === 2
      && source.artifact_kind === "plato-public-source-acquisition-receipts";
    if (source.release_version !== RELEASE_VERSION || (isPublic ? !publicIdentity : !privateIdentity)) {
      issues.push(`${sourcePath} has invalid release identity`);
    }
    validateBinding(repoRoot, source.verifier, `${sourcePath} verifier`, issues);
    validateBinding(repoRoot, source.importer, `${sourcePath} importer`, issues);
    validateBinding(repoRoot, source.sources_record, `${sourcePath} sources_record`, issues);
    const expected = [...filesUnder(repoRoot, "raw/plato/english"), ...filesUnder(repoRoot, "raw/plato/greek")].sort();
    const rows = sourceRows(repoRoot);
    const actual = Array.isArray(source.sources) ? source.sources : [];
    if (rows.size !== 54) issues.push("raw/plato/SOURCES.md does not contain 54 exact confirmed public-source rows");
    if (actual.map((entry) => entry.path).join("\n") !== expected.join("\n") || actual.length !== 54) {
      issues.push(`${sourcePath} does not cover the exact 54-file source set`);
    }
    for (const [index, entry] of actual.entries()) {
      if (isPublic && "initial_import_commit" in entry) {
        issues.push(`${sourcePath} sources[${index}] exposes a private import commit`);
      }
      validateBinding(repoRoot, entry, `${sourcePath} sources[${index}]`, issues);
      const row = rows.get(entry.path);
      if (!row || row.upstream_repository !== entry.upstream_repository || row.upstream_commit !== entry.upstream_commit || row.upstream_path !== entry.upstream_path || row.edition !== entry.edition || row.acquisition !== entry.acquisition || !SHA256.test(entry.upstream_sha256)) {
        issues.push(`${sourcePath} ${entry.path} has invalid upstream binding`);
      }
      if (entry.acquisition === "byte-identical-copy" && entry.upstream_sha256 !== entry.sha256) {
        issues.push(`${sourcePath} ${entry.path} is not byte-identical to its upstream hash`);
      }
    }
  }
  return [...new Set(issues)];
}

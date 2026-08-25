import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";

/**
 * Applied submissions are tracked corpus provenance, not scratch.
 *
 * Every generated artifact in the commentary campaign lands under `scratch/`,
 * which `.gitignore` excludes. Merging a draft into a ledger therefore used to
 * destroy the only copy of what was submitted and what it replaced: symposium's
 * 33 rewrites survive with no audit outputs beside them, and six labeled
 * defects exist corpus-wide. An apply gate records here so the evidence for a
 * merge outlives the scratch directory that produced it.
 */
export const SUBMISSIONS_ROOT = "wiki/submissions";

export const SUBMISSION_SCHEMA_VERSION = 1;

export type SubmissionRecord = {
  schema_version: typeof SUBMISSION_SCHEMA_VERSION;
  submission_id: string;
  lane: string;
  kind: string;
  scope: string;
  unit_key?: string;
  /** Where the agent wrote the artifact. Usually under `scratch/`, hence untracked. */
  source_path: string;
  source_sha256: string;
  /** The canonical file the apply mutated. */
  target_path: string;
  target_sha256_before: string;
  target_sha256_after: string;
  applied_at: string;
  applied_ids: string[];
  submission: unknown;
  /** Content this submission replaced, when it replaced rather than appended. */
  superseded?: unknown;
};

const SLUG = /^[a-z0-9][a-z0-9-]*$/;

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function atomicWrite(path: string, content: string) {
  const temporary = `${path}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  try {
    writeFileSync(temporary, content, "utf8");
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

/** Directory holding one scope's applied submissions. Also the write-lock target. */
export function submissionDirectory(lane: string, scope: string) {
  if (!SLUG.test(lane)) throw new Error(`Invalid submission lane: ${lane}`);
  if (!SLUG.test(scope)) throw new Error(`Invalid submission scope: ${scope}`);
  return `${SUBMISSIONS_ROOT}/${lane}/${scope}`;
}

function nextOrdinal(absoluteDirectory: string) {
  if (!existsSync(absoluteDirectory)) return 1;

  const used = readdirSync(absoluteDirectory)
    .map((name) => /^(\d{4})-/.exec(name)?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => Number(value));
  return used.length === 0 ? 1 : Math.max(...used) + 1;
}

export type RecordSubmissionOptions = {
  lane: string;
  kind: string;
  scope: string;
  unitKey?: string;
  sourcePath: string;
  targetPath: string;
  targetContentBefore: string;
  targetContentAfter: string;
  appliedIds: string[];
  submission: unknown;
  superseded?: unknown;
};

/**
 * Persist one applied submission. Call inside the apply write lock, with the
 * scope directory among the locked paths so ordinals cannot collide.
 */
export function recordSubmission(options: RecordSubmissionOptions) {
  if (!SLUG.test(options.kind)) throw new Error(`Invalid submission kind: ${options.kind}`);

  const directory = submissionDirectory(options.lane, options.scope);
  const absoluteDirectory = join(getRepoRoot(), directory);
  mkdirSync(absoluteDirectory, { recursive: true });

  const ordinal = String(nextOrdinal(absoluteDirectory)).padStart(4, "0");
  const suffix = options.unitKey ? `${options.kind}-${options.unitKey}` : options.kind;
  const submissionId = `${ordinal}-${suffix}`;
  const relativePath = `${directory}/${submissionId}.json`;
  const sourcePath = normalizeRepoPath(options.sourcePath).relativePath;
  const absoluteSourcePath = join(getRepoRoot(), sourcePath);

  const record: SubmissionRecord = {
    schema_version: SUBMISSION_SCHEMA_VERSION,
    submission_id: submissionId,
    lane: options.lane,
    kind: options.kind,
    scope: options.scope,
    ...(options.unitKey ? { unit_key: options.unitKey } : {}),
    source_path: sourcePath,
    source_sha256: existsSync(absoluteSourcePath) ? sha256(readFileSync(absoluteSourcePath)) : "",
    target_path: normalizeRepoPath(options.targetPath).relativePath,
    target_sha256_before: sha256(options.targetContentBefore),
    target_sha256_after: sha256(options.targetContentAfter),
    applied_at: new Date().toISOString(),
    applied_ids: options.appliedIds,
    submission: options.submission,
    ...(options.superseded === undefined ? {} : { superseded: options.superseded }),
  };

  atomicWrite(join(getRepoRoot(), relativePath), prettyJson(record));
  return { submissionId, path: relativePath, record };
}

export function readSubmissions(lane: string, scope: string): SubmissionRecord[] {
  const absoluteDirectory = join(getRepoRoot(), submissionDirectory(lane, scope));
  if (!existsSync(absoluteDirectory)) return [];

  return readdirSync(absoluteDirectory)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(absoluteDirectory, name), "utf8")) as SubmissionRecord);
}

export function listSubmissionScopes(lane: string) {
  if (!SLUG.test(lane)) throw new Error(`Invalid submission lane: ${lane}`);

  const absoluteDirectory = join(getRepoRoot(), `${SUBMISSIONS_ROOT}/${lane}`);
  if (!existsSync(absoluteDirectory)) return [];

  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

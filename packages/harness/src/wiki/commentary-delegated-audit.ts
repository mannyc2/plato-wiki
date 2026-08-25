import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { CommentaryCampaignJob, ReusableCanonicalAuditOutput } from "../commentary-campaign.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "../commentary-authoring.js";
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot, normalizeRepoPath } from "../paths.js";
import { recordSubmission, submissionDirectory, type SubmissionRecord } from "../submissions.js";
import {
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
} from "./commentary-quality-audit-provenance.js";
import { COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA, parseCommentaryQualityAudit, type CommentaryQualityAudit } from "../commentary-audit.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const UNIT_KEY = /^[a-z0-9][a-z0-9-]*$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const CANDIDATE_NAME = /^[a-z0-9][a-z0-9-]*\.json$/u;
const DELEGATED_LUNA_AUDITOR = /^[a-z0-9][a-z0-9-]*-delegated-luna-auditor-[a-z0-9][a-z0-9-]*$/u;
const CANDIDATE_ROOT = "scratch/commentary/delegated-audits";
const DURABLE_ROOT = "wiki/submissions/commentary-audit";

export const COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION = 1 as const;
export const COMMENTARY_DELEGATED_AUDIT_CANDIDATE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["schema_version", "dialogue", "unit_key", "job", "output", "output_sha256", "provenance"],
  properties: {
    schema_version: { type: "integer", const: COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION },
    dialogue: { type: "string", pattern: "^[a-z0-9-]+$" },
    unit_key: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
    job: {
      type: "object",
      additionalProperties: false,
      required: ["job_id", "input_sha256", "audit_brief_path", "audit_brief_sha256", "output_path", "output_schema_sha256"],
      properties: {
        job_id: { type: "string", minLength: 1 },
        input_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
        audit_brief_path: { type: "string", minLength: 1 },
        audit_brief_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
        output_path: { type: "string", minLength: 1 },
        output_schema_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
      },
    },
    output: COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
    output_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
    provenance: {
      type: "object",
      additionalProperties: false,
      required: ["auditor", "model", "effort", "source", "human_listening_or_review"],
      properties: {
        auditor: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*-delegated-luna-auditor-[a-z0-9][a-z0-9-]*$" },
        model: { type: "string", const: COMMENTARY_AUTHORING_MODEL },
        effort: { type: "string", const: COMMENTARY_STAGE_EFFORT.audit },
        source: { type: "string", const: "operator-delegated" },
        human_listening_or_review: { type: "string", const: "none claimed" },
      },
    },
  },
} as const;

export type CommentaryDelegatedAuditJobBinding = {
  job_id: string;
  input_sha256: string;
  audit_brief_path: string;
  audit_brief_sha256: string;
  output_path: string;
  output_schema_sha256: string;
};

export type CommentaryDelegatedAuditProvenance = {
  auditor: string;
  model: typeof COMMENTARY_AUTHORING_MODEL;
  effort: (typeof COMMENTARY_STAGE_EFFORT)["audit"];
  source: "operator-delegated";
  human_listening_or_review: "none claimed";
};

export type CommentaryDelegatedAuditCandidate = {
  schema_version: typeof COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION;
  dialogue: string;
  unit_key: string;
  job: CommentaryDelegatedAuditJobBinding;
  output: CommentaryQualityAudit;
  output_sha256: string;
  provenance: CommentaryDelegatedAuditProvenance;
};

export type CommentaryDelegatedAuditPreview = {
  applied: false;
  dialogue: string;
  unitKey: string;
  candidatePath: string;
  durableOutputPath: string;
  submissionDirectory: string;
  job: CommentaryDelegatedAuditJobBinding;
  output: CommentaryQualityAudit;
  outputSha256: string;
  provenance: CommentaryDelegatedAuditProvenance;
};

export type CommentaryDelegatedAuditApply = Omit<CommentaryDelegatedAuditPreview, "applied"> & {
  applied: true;
  submissionRecordPath: string;
  submission: SubmissionRecord;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2) + "\n";
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(path + " must be an object");
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], path: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(path + " must contain exactly: " + expected.join(", "));
  }
}

function string(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(path + " must be a non-empty string");
  return value;
}

function digest(value: unknown, path: string) {
  const result = string(value, path);
  if (!SHA256.test(result)) throw new Error(path + " must be a lowercase SHA-256 digest");
  return result;
}

function expectedBinding(job: CommentaryCampaignJob): CommentaryDelegatedAuditJobBinding {
  if (job.stage !== "audit" || !job.unit_key || !job.audit_brief_path || !job.audit_brief_sha256) {
    throw new Error("Delegated import requires a current audit job, not " + job.job_id);
  }
  return {
    job_id: job.job_id,
    input_sha256: job.input_sha256,
    audit_brief_path: job.audit_brief_path,
    audit_brief_sha256: job.audit_brief_sha256,
    output_path: job.output_path,
    output_schema_sha256: job.output_schema_sha256,
  };
}

function validateBinding(candidate: CommentaryDelegatedAuditJobBinding, job: CommentaryCampaignJob) {
  const expected = expectedBinding(job);
  for (const field of Object.keys(expected) as Array<keyof CommentaryDelegatedAuditJobBinding>) {
    if (candidate[field] !== expected[field]) throw new Error("Candidate job binding is stale at job." + field);
  }
}

function validateProvenance(value: unknown): CommentaryDelegatedAuditProvenance {
  const provenance = record(value, "candidate.provenance");
  exactKeys(provenance, ["auditor", "model", "effort", "source", "human_listening_or_review"], "candidate.provenance");
  if (typeof provenance.auditor !== "string" || !DELEGATED_LUNA_AUDITOR.test(provenance.auditor)) {
    throw new Error("Candidate provenance auditor must identify an operator-delegated Luna auditor");
  }
  if (provenance.model !== COMMENTARY_AUTHORING_MODEL || provenance.effort !== COMMENTARY_STAGE_EFFORT.audit) {
    throw new Error("Candidate provenance must record model gpt-5.6-luna and effort medium");
  }
  if (provenance.source !== "operator-delegated") throw new Error("Candidate provenance source must be operator-delegated");
  if (provenance.human_listening_or_review !== "none claimed") {
    throw new Error("Candidate provenance must record " + COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING);
  }
  return {
    auditor: provenance.auditor,
    model: COMMENTARY_AUTHORING_MODEL,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    source: "operator-delegated",
    human_listening_or_review: "none claimed",
  };
}

function repoPathWithoutTraversal(input: string, path: string) {
  if (input.startsWith("/") || /^[a-zA-Z]:[\\/]/u.test(input)) {
    throw new Error(path + " must be a repository-relative path");
  }
  if (input.split(/[\\/]+/u).some((segment) => segment === "." || segment === "..")) {
    throw new Error(path + " must not contain traversal segments");
  }
  return normalizeRepoPath(input);
}

function candidatePath(dialogue: string, path: string) {
  const normalized = repoPathWithoutTraversal(path, "Candidate path");
  const expectedDirectory = CANDIDATE_ROOT + "/" + dialogue;
  if (dirname(normalized.relativePath) !== expectedDirectory || !CANDIDATE_NAME.test(basename(normalized.relativePath))) {
    throw new Error("Candidate path must be a JSON file directly inside " + expectedDirectory);
  }
  return normalized;
}

function candidatePathForJob(job: CommentaryCampaignJob, path: string) {
  if (!DIALOGUE.test(job.dialogue) || !job.unit_key) throw new Error("Invalid current delegated audit job " + job.job_id);
  return candidatePath(job.dialogue, path);
}

export function parseCommentaryDelegatedAuditCandidate(
  value: unknown,
  job: CommentaryCampaignJob,
  path = "candidate",
): CommentaryDelegatedAuditCandidate {
  const candidate = record(value, path);
  exactKeys(candidate, ["schema_version", "dialogue", "unit_key", "job", "output", "output_sha256", "provenance"], path);
  if (candidate.schema_version !== COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION) throw new Error(path + ".schema_version must be 1");
  if (candidate.dialogue !== job.dialogue || !DIALOGUE.test(String(candidate.dialogue))) throw new Error(path + ".dialogue does not match the current job");
  if (candidate.unit_key !== job.unit_key || !UNIT_KEY.test(String(candidate.unit_key))) throw new Error(path + ".unit_key does not match the current job");
  const binding = record(candidate.job, path + ".job");
  exactKeys(binding, ["job_id", "input_sha256", "audit_brief_path", "audit_brief_sha256", "output_path", "output_schema_sha256"], path + ".job");
  const jobBinding = {
    job_id: string(binding.job_id, path + ".job.job_id"),
    input_sha256: digest(binding.input_sha256, path + ".job.input_sha256"),
    audit_brief_path: string(binding.audit_brief_path, path + ".job.audit_brief_path"),
    audit_brief_sha256: digest(binding.audit_brief_sha256, path + ".job.audit_brief_sha256"),
    output_path: string(binding.output_path, path + ".job.output_path"),
    output_schema_sha256: digest(binding.output_schema_sha256, path + ".job.output_schema_sha256"),
  } satisfies CommentaryDelegatedAuditJobBinding;
  validateBinding(jobBinding, job);
  const briefAbsolutePath = join(getRepoRoot(), jobBinding.audit_brief_path);
  if (!existsSync(briefAbsolutePath) || sha256(readFileSync(briefAbsolutePath)) !== jobBinding.audit_brief_sha256) {
    throw new Error(path + ".job.audit_brief_sha256 does not bind the current audit brief");
  }
  const output = parseCommentaryQualityAudit(candidate.output, {
    path: path + ".output",
    expectedCommentaryIds: job.commentary_ids ?? [],
  });
  if (output.dialogue !== job.dialogue || output.unit_key !== job.unit_key || output.section_id !== job.section_id) {
    throw new Error(path + ".output identity does not match the current job");
  }
  const outputSha256 = digest(candidate.output_sha256, path + ".output_sha256");
  if (outputSha256 !== sha256(prettyJson(output))) throw new Error(path + ".output_sha256 does not bind normalized output");
  return {
    schema_version: COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION,
    dialogue: job.dialogue,
    unit_key: job.unit_key!,
    job: jobBinding,
    output,
    output_sha256: outputSha256,
    provenance: validateProvenance(candidate.provenance),
  };
}

export function readCommentaryDelegatedAuditCandidate(candidatePath: string, job: CommentaryCampaignJob) {
  const normalized = candidatePathForJob(job, candidatePath);
  if (
    !existsSync(normalized.absolutePath) ||
    !lstatSync(normalized.absolutePath).isFile() ||
    realpathSync(normalized.absolutePath) !== join(realpathSync(getRepoRoot()), normalized.relativePath)
  ) {
    throw new Error("Delegated audit candidate must be a regular non-symlink file " + normalized.relativePath);
  }
  const content = readFileSync(normalized.absolutePath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error("Invalid delegated audit candidate JSON: " + (error instanceof Error ? error.message : String(error)));
  }
  const candidate = parseCommentaryDelegatedAuditCandidate(parsed, job);
  if (content !== prettyJson(candidate)) {
    throw new Error("Delegated audit candidate must be exact normalized JSON");
  }
  return { path: normalized.relativePath, candidate };
}

function durableOutputPath(job: CommentaryCampaignJob) {
  return DURABLE_ROOT + "/" + job.dialogue + "/" + job.unit_key + ".output.json";
}

export function previewCommentaryDelegatedAudit(options: { job: CommentaryCampaignJob; candidatePath: string }): CommentaryDelegatedAuditPreview {
  const result = readCommentaryDelegatedAuditCandidate(options.candidatePath, options.job);
  return {
    applied: false,
    dialogue: options.job.dialogue,
    unitKey: options.job.unit_key!,
    candidatePath: result.path,
    durableOutputPath: durableOutputPath(options.job),
    submissionDirectory: submissionDirectory("commentary-audit", options.job.dialogue),
    job: result.candidate.job,
    output: result.candidate.output,
    outputSha256: result.candidate.output_sha256,
    provenance: result.candidate.provenance,
  };
}

function atomicWrite(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = path + ".tmp-" + process.pid;
  try {
    writeFileSync(temporary, content, "utf8");
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

export function applyCommentaryDelegatedAudit(options: { job: CommentaryCampaignJob; candidatePath: string }): CommentaryDelegatedAuditApply {
  const preview = previewCommentaryDelegatedAudit(options);
  const outputAbsolutePath = join(getRepoRoot(), preview.durableOutputPath);
  return withRepoWriteLock(
    { paths: [preview.durableOutputPath, preview.submissionDirectory], label: "commentary-delegated-audit:" + preview.dialogue + "/" + preview.unitKey },
    () => {
      if (existsSync(outputAbsolutePath)) throw new Error("Refusing to overwrite durable delegated audit " + preview.durableOutputPath);
      const outputContent = prettyJson(preview.output);
      atomicWrite(outputAbsolutePath, outputContent);
      try {
        const recorded = recordSubmission({
          lane: "commentary-audit",
          kind: "delegated-audit",
          scope: preview.dialogue,
          unitKey: preview.unitKey,
          sourcePath: preview.candidatePath,
          targetPath: preview.durableOutputPath,
          targetContentBefore: "",
          targetContentAfter: outputContent,
          appliedIds: preview.output.blocks.map((block) => block.commentary_id),
          submission: {
            schema_version: COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION,
            dialogue: preview.dialogue,
            unit_key: preview.unitKey,
            job: preview.job,
            output_path: preview.durableOutputPath,
            output_sha256: preview.outputSha256,
            provenance: preview.provenance,
          },
        });
        return { ...preview, applied: true, submissionRecordPath: recorded.path, submission: recorded.record };
      } catch (error) {
        rmSync(outputAbsolutePath, { force: true });
        throw error;
      }
    },
  );
}

function durableRecord(value: unknown, path: string) {
  const root = record(value, path);
  exactKeys(
    root,
    [
      "schema_version",
      "submission_id",
      "lane",
      "kind",
      "scope",
      "unit_key",
      "source_path",
      "source_sha256",
      "target_path",
      "target_sha256_before",
      "target_sha256_after",
      "applied_at",
      "applied_ids",
      "submission",
    ],
    path,
  );
  if (root.schema_version !== 1 || root.lane !== "commentary-audit" || root.kind !== "delegated-audit") return undefined;
  return { root, submission: record(root.submission, path + ".submission") };
}

export type ValidatedCommentaryDelegatedAuditSubmission = {
  manifestPath: string;
  recordSha256: string;
  output: CommentaryQualityAudit;
  outputSha256: string;
  provenance: CommentaryDelegatedAuditProvenance;
};

function validateIsoTimestamp(value: unknown, path: string) {
  const timestamp = string(value, path);
  if (Number.isNaN(Date.parse(timestamp)) || new Date(timestamp).toISOString() !== timestamp) {
    throw new Error(path + " must be an exact ISO timestamp");
  }
  return timestamp;
}

function candidateSourcePath(value: unknown, job: CommentaryCampaignJob, path: string) {
  const source = repoPathWithoutTraversal(string(value, path), path);
  const expectedDirectory = CANDIDATE_ROOT + "/" + job.dialogue;
  if (dirname(source.relativePath) !== expectedDirectory || !CANDIDATE_NAME.test(basename(source.relativePath))) {
    throw new Error(path + " must point directly inside " + expectedDirectory);
  }
  return source;
}

/**
 * Validate the complete durable delegated-audit receipt and its target bytes.
 * This is the single provenance boundary used by both reuse and manifest
 * validation; a nested job binding alone is never sufficient.
 */
export function validateCommentaryDelegatedAuditSubmission(options: {
  recordPath: string;
  job: CommentaryCampaignJob;
}): ValidatedCommentaryDelegatedAuditSubmission {
  const normalizedRecord = repoPathWithoutTraversal(options.recordPath, "Delegated provenance path");
  const expectedDirectory = DURABLE_ROOT + "/" + options.job.dialogue;
  if (
    dirname(normalizedRecord.relativePath) !== expectedDirectory ||
    !normalizedRecord.relativePath.endsWith(".json")
  ) {
    throw new Error("Delegated provenance path must be directly inside " + expectedDirectory);
  }
  const recordContent = readFileSync(normalizedRecord.absolutePath, "utf8");
  const rootValue = JSON.parse(recordContent) as unknown;
  const entry = durableRecord(rootValue, normalizedRecord.relativePath);
  if (!entry) throw new Error("Not a delegated commentary-audit submission record");
  const root = entry.root;
  const submission = entry.submission;
  const submissionId = string(root.submission_id, normalizedRecord.relativePath + ".submission_id");
  if (
    submissionId !== basename(normalizedRecord.relativePath, ".json") ||
    !new RegExp("^\\d+-delegated-audit-" + options.job.unit_key + "$", "u").test(submissionId)
  ) {
    throw new Error("Delegated submission filename and submission_id do not bind the current unit");
  }
  const targetBeforeSha256 = digest(root.target_sha256_before, normalizedRecord.relativePath + ".target_sha256_before");
  const targetAfterSha256 = digest(root.target_sha256_after, normalizedRecord.relativePath + ".target_sha256_after");
  const sourceSha256 = digest(root.source_sha256, normalizedRecord.relativePath + ".source_sha256");
  if (
    root.scope !== options.job.dialogue ||
    root.unit_key !== options.job.unit_key ||
    root.target_path !== durableOutputPath(options.job) ||
    targetBeforeSha256 !== sha256("")
  ) {
    throw new Error("Delegated submission outer binding is stale or malformed");
  }
  const outputPath = durableOutputPath(options.job);
  const outputAbsolutePath = join(getRepoRoot(), outputPath);
  if (!existsSync(outputAbsolutePath) || !lstatSync(outputAbsolutePath).isFile() ||
    realpathSync(outputAbsolutePath) !== join(realpathSync(getRepoRoot()), outputPath)) {
    throw new Error("Missing durable delegated audit output " + outputPath);
  }
  const outputContent = readFileSync(outputAbsolutePath, "utf8");
  const output = parseCommentaryQualityAudit(JSON.parse(outputContent) as unknown, {
    path: outputPath,
    expectedCommentaryIds: options.job.commentary_ids ?? [],
  });
  if (
    outputContent !== prettyJson(output) ||
    output.dialogue !== options.job.dialogue ||
    output.unit_key !== options.job.unit_key ||
    output.section_id !== options.job.section_id
  ) throw new Error("Durable delegated output is not the exact current normalized audit");
  const outputSha256 = sha256(outputContent);
  if (targetAfterSha256 !== outputSha256) throw new Error("Delegated target hash does not bind durable output");

  candidateSourcePath(root.source_path, options.job, normalizedRecord.relativePath + ".source_path");
  if (!Array.isArray(root.applied_ids) || root.applied_ids.some((id) => typeof id !== "string") || root.applied_ids.length !== output.blocks.length ||
    root.applied_ids.some((id, index) => id !== output.blocks[index]?.commentary_id)) {
    throw new Error("Delegated applied_ids do not bind durable output coverage");
  }
  validateIsoTimestamp(root.applied_at, normalizedRecord.relativePath + ".applied_at");

  exactKeys(
    submission,
    ["schema_version", "dialogue", "unit_key", "job", "output_path", "output_sha256", "provenance"],
    normalizedRecord.relativePath + ".submission",
  );
  if (submission.schema_version !== COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION ||
    submission.dialogue !== options.job.dialogue || submission.unit_key !== options.job.unit_key ||
    submission.output_path !== outputPath || submission.output_sha256 !== outputSha256) {
    throw new Error("Delegated submission binding is stale");
  }
  const jobBinding = record(submission.job, normalizedRecord.relativePath + ".submission.job");
  exactKeys(jobBinding, ["job_id", "input_sha256", "audit_brief_path", "audit_brief_sha256", "output_path", "output_schema_sha256"], normalizedRecord.relativePath + ".submission.job");
  const candidateBinding = {
    job_id: string(jobBinding.job_id, "submission.job.job_id"),
    input_sha256: digest(jobBinding.input_sha256, "submission.job.input_sha256"),
    audit_brief_path: string(jobBinding.audit_brief_path, "submission.job.audit_brief_path"),
    audit_brief_sha256: digest(jobBinding.audit_brief_sha256, "submission.job.audit_brief_sha256"),
    output_path: string(jobBinding.output_path, "submission.job.output_path"),
    output_schema_sha256: digest(jobBinding.output_schema_sha256, "submission.job.output_schema_sha256"),
  } satisfies CommentaryDelegatedAuditJobBinding;
  validateBinding(candidateBinding, options.job);
  repoPathWithoutTraversal(candidateBinding.audit_brief_path, "submission.job.audit_brief_path");
  const provenance = validateProvenance(submission.provenance);
  const reconstructedCandidate: CommentaryDelegatedAuditCandidate = {
    schema_version: COMMENTARY_DELEGATED_AUDIT_SCHEMA_VERSION,
    dialogue: options.job.dialogue,
    unit_key: options.job.unit_key!,
    job: candidateBinding,
    output,
    output_sha256: outputSha256,
    provenance,
  };
  if (sourceSha256 !== sha256(prettyJson(reconstructedCandidate))) {
    throw new Error("Delegated source hash does not bind the normalized candidate attestation");
  }
  return { manifestPath: normalizedRecord.relativePath, recordSha256: sha256(recordContent), output, outputSha256, provenance };
}

export function readCurrentCommentaryDelegatedAudit(job: CommentaryCampaignJob): (ReusableCanonicalAuditOutput & { source: "delegated_import" }) | undefined {
  if (job.stage !== "audit" || !job.unit_key) return undefined;
  const directory = submissionDirectory("commentary-audit", job.dialogue);
  const absoluteDirectory = join(getRepoRoot(), directory);
  const outputPath = durableOutputPath(job);
  const absoluteOutput = join(getRepoRoot(), outputPath);
  if (!existsSync(absoluteDirectory) || !existsSync(absoluteOutput)) return undefined;
  try {
    const matchingPath = readdirSync(absoluteDirectory)
      .filter((name) => name.endsWith(".json"))
      .map((name) => directory + "/" + name)
      .find((path) => {
        try {
          validateCommentaryDelegatedAuditSubmission({ recordPath: path, job });
          return true;
        } catch {
          return false;
        }
      });
    if (!matchingPath) return undefined;
    const validated = validateCommentaryDelegatedAuditSubmission({ recordPath: matchingPath, job });
    return { manifestPath: validated.manifestPath, output: validated.output, outputSha256: validated.outputSha256, source: "delegated_import" };
  } catch {
    return undefined;
  }
}

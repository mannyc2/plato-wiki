import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  buildCommentaryRevisionLedger,
  commentarySupersededBlocks,
  parseCommentaryRevisions,
  type CommentaryRevision,
} from "../commentary-campaign.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "../commentary-authoring.js";
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot, normalizeRepoPath } from "../paths.js";
import { recordSubmission, submissionDirectory, type SubmissionRecord } from "../submissions.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import {
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
} from "./commentary-quality-audit.js";
import { validateCommentaryQualityAuditAcceptanceSample } from "./commentary-quality-audit-acceptance.js";
import { formatCommentaryLedgerValidationError, validateCommentaryLedger } from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const CANDIDATE_NAME = /^[a-z0-9][a-z0-9-]*\.json$/u;
const MAX_RATIONALE_LENGTH = 300;

export type CommentarySampleRepairCandidate = {
  schema_version: 1;
  dialogue: string;
  ledger: { path: string; sha256: string };
  sample_review: {
    reviewer: string;
    reviewed_on: string;
    rationale: string;
    human_listening_or_review: "none claimed";
    sampled_commentary_ids: string[];
    failed_commentary_ids: string[];
  };
  authoring: { model: typeof COMMENTARY_AUTHORING_MODEL; effort: (typeof COMMENTARY_STAGE_EFFORT)["rewrite"] };
  revisions: CommentaryRevision[];
};

export type CommentarySampleRepairPreview = {
  applied: false;
  dialogue: string;
  candidatePath: string;
  ledgerPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  changedBlockIds: string[];
  candidate: CommentarySampleRepairCandidate;
  prospectiveLedger: string;
};

export type CommentarySampleRepairApply = Omit<CommentarySampleRepairPreview, "applied"> & {
  applied: true;
  submissionPath: string;
  submission: SubmissionRecord;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${path} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: string[], path: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${path} must contain exactly: ${expected.join(", ")}`);
  }
}

function string(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} must be a non-empty string`);
  return value;
}

function stringList(value: unknown, path: string) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !COMMENTARY_ID.test(entry))) {
    throw new Error(`${path} must contain only commentary IDs`);
  }
  return value as string[];
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function readCandidate(dialogue: string, candidatePath: string, currentLedger: string): CommentarySampleRepairCandidate {
  const normalized = normalizeRepoPath(candidatePath);
  const expectedDirectory = `scratch/commentary/sample-repairs/${dialogue}`;
  if (dirname(normalized.relativePath) !== expectedDirectory || !CANDIDATE_NAME.test(basename(normalized.relativePath))) {
    throw new Error(`Candidate path must be a JSON file directly inside ${expectedDirectory}`);
  }
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing sample-repair candidate ${normalized.relativePath}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(normalized.absolutePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Invalid sample-repair JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const candidate = record(parsed, "candidate");
  exactKeys(candidate, ["schema_version", "dialogue", "ledger", "sample_review", "authoring", "revisions"], "candidate");
  if (candidate.schema_version !== 1 || candidate.dialogue !== dialogue) throw new Error("Candidate schema/dialogue mismatch");
  const ledger = record(candidate.ledger, "candidate.ledger");
  exactKeys(ledger, ["path", "sha256"], "candidate.ledger");
  const expectedLedgerPath = `wiki/commentary/${dialogue}.md`;
  if (ledger.path !== expectedLedgerPath || typeof ledger.sha256 !== "string" || !SHA256.test(ledger.sha256)) {
    throw new Error(`Candidate ledger must bind ${expectedLedgerPath} with a lowercase SHA-256`);
  }
  if (ledger.sha256 !== sha256(currentLedger)) throw new Error("Candidate ledger SHA drifted from the current canonical ledger");

  const review = record(candidate.sample_review, "candidate.sample_review");
  exactKeys(review, ["reviewer", "reviewed_on", "rationale", "human_listening_or_review", "sampled_commentary_ids", "failed_commentary_ids"], "candidate.sample_review");
  const reviewer = string(review.reviewer, "candidate.sample_review.reviewer");
  const reviewedOn = string(review.reviewed_on, "candidate.sample_review.reviewed_on");
  const rationale = string(review.rationale, "candidate.sample_review.rationale");
  if (!isDelegatedLunaReviewer(reviewer)) throw new Error("Sample reviewer must identify an operator-delegated Luna reviewer");
  if (!validDate(reviewedOn)) throw new Error("Sample reviewed_on must be a valid YYYY-MM-DD date");
  if (rationale !== rationale.trim() || rationale.length > MAX_RATIONALE_LENGTH || /[\r\n]/u.test(rationale)) {
    throw new Error(`Sample rationale must be one line of at most ${MAX_RATIONALE_LENGTH} characters`);
  }
  if (containsHumanListeningOrReviewClaim(rationale) || review.human_listening_or_review !== "none claimed") {
    throw new Error("Sample review must not claim human listening or human review");
  }
  const sampledIds = stringList(review.sampled_commentary_ids, "candidate.sample_review.sampled_commentary_ids");
  const failedIds = stringList(review.failed_commentary_ids, "candidate.sample_review.failed_commentary_ids");
  if (failedIds.length === 0 || new Set(failedIds).size !== failedIds.length) {
    throw new Error("failed_commentary_ids must be non-empty and unique");
  }
  const activeIds = commentaryMarkdownBlocks(currentLedger)
    .filter((block) => fieldValue(block.content, "review_status") === "accepted")
    .map((block) => block.commentaryId ?? "");
  validateCommentaryQualityAuditAcceptanceSample(sampledIds, activeIds);
  const failedSet = new Set(failedIds);
  if (sampledIds.filter((id) => failedSet.has(id)).some((id, index) => id !== failedIds[index]) ||
      failedIds.some((id) => !sampledIds.includes(id))) {
    throw new Error("failed_commentary_ids must be a canonical-order subset of sampled_commentary_ids");
  }

  const authoring = record(candidate.authoring, "candidate.authoring");
  exactKeys(authoring, ["model", "effort"], "candidate.authoring");
  if (authoring.model !== COMMENTARY_AUTHORING_MODEL || authoring.effort !== COMMENTARY_STAGE_EFFORT.rewrite) {
    throw new Error(`Candidate authoring must record ${COMMENTARY_AUTHORING_MODEL} at high effort`);
  }
  const revisions = parseCommentaryRevisions(candidate.revisions, {
    path: "candidate.revisions",
    expectedCommentaryIds: failedIds,
  });
  return {
    schema_version: 1,
    dialogue,
    ledger: { path: expectedLedgerPath, sha256: ledger.sha256 },
    sample_review: {
      reviewer,
      reviewed_on: reviewedOn,
      rationale,
      human_listening_or_review: "none claimed",
      sampled_commentary_ids: sampledIds,
      failed_commentary_ids: failedIds,
    },
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.rewrite },
    revisions,
  };
}

function buildPreview(dialogue: string, candidatePath: string): CommentarySampleRepairPreview {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
  const issues = validateCommentaryLedger(ledgerPath, currentLedger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  const normalized = normalizeRepoPath(candidatePath);
  const candidate = readCandidate(dialogue, normalized.relativePath, currentLedger);
  const { prospectiveLedger, changedBlockIds } = buildCommentaryRevisionLedger(dialogue, currentLedger, candidate.revisions);
  if (changedBlockIds.some((id) =>
    fieldValue(commentaryMarkdownBlocks(currentLedger).find((block) => block.commentaryId === id)?.content ?? "", "review_status") !== "accepted")) {
    throw new Error("Sample repair may change only currently accepted commentary blocks");
  }
  return {
    applied: false,
    dialogue,
    candidatePath: normalized.relativePath,
    ledgerPath,
    ledgerSha256Before: sha256(currentLedger),
    ledgerSha256After: sha256(prospectiveLedger),
    changedBlockIds,
    candidate,
    prospectiveLedger,
  };
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

export function previewCommentarySampleRepair(options: { dialogue: string; candidatePath: string }) {
  return buildPreview(options.dialogue, options.candidatePath);
}

export function applyCommentarySampleRepair(options: { dialogue: string; candidatePath: string }): CommentarySampleRepairApply {
  const ledgerPath = `wiki/commentary/${options.dialogue}.md`;
  const normalized = normalizeRepoPath(options.candidatePath);
  return withRepoWriteLock(
    {
      paths: [ledgerPath, normalized.relativePath, submissionDirectory("commentary", options.dialogue)],
      label: `commentary-sample-repair:${options.dialogue}`,
    },
    () => {
      const preview = buildPreview(options.dialogue, normalized.relativePath);
      const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
      const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
      atomicWrite(absoluteLedgerPath, preview.prospectiveLedger);
      try {
        const recorded = recordSubmission({
          lane: "commentary",
          kind: "sample-repair",
          scope: options.dialogue,
          sourcePath: preview.candidatePath,
          targetPath: preview.ledgerPath,
          targetContentBefore: currentLedger,
          targetContentAfter: preview.prospectiveLedger,
          appliedIds: preview.changedBlockIds,
          submission: preview.candidate,
          superseded: commentarySupersededBlocks(currentLedger, preview.changedBlockIds),
        });
        return { ...preview, applied: true, submissionPath: recorded.path, submission: recorded.record };
      } catch (error) {
        atomicWrite(absoluteLedgerPath, currentLedger);
        throw error;
      }
    },
  );
}

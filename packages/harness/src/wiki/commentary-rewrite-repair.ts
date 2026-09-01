import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
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
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
} from "./commentary-quality-audit.js";
import { verifyCommentaryBlockReviewChain } from "./commentary-rewrite-review.js";
import { formatCommentaryLedgerValidationError, validateCommentaryLedger } from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const CANDIDATE_NAME = /^[a-z0-9][a-z0-9-]*\.json$/u;
const REPAIR_AUTHOR = /^[a-z0-9][a-z0-9-]*-delegated-luna-repair-author-[a-z0-9][a-z0-9-]*$/u;
const SUBMISSION_ID = /^\d{4}-(?:(?:rewrite|rewrite-batch)(?:-[a-z0-9-]+)?|sample-repair|rewrite-repair)$/u;
const MAX_FINDING_LENGTH = 300;
const REVIEW_BASIS = "review_basis: operator-delegated independent Luna review of every applied rewrite ID";
const BLOCK_REVIEW_BASIS = "review_basis: operator-delegated independent Luna block review";
const SUBMISSION_KINDS = new Set(["rewrite", "rewrite-batch", "sample-repair", "rewrite-repair"]);

export type CommentaryRewriteRepairFinding = { commentary_id: string; finding: string };

export type CommentaryRewriteRepairCandidate = {
  schema_version: 1;
  dialogue: string;
  ledger: { path: string; sha256: string };
  prior_submission: { path: string; sha256: string };
  acceptance_receipt: { path: string; sha256: string };
  prior_review: { reviewer: string; reviewed_on: string; rejection_findings: CommentaryRewriteRepairFinding[] };
  repair_author: string;
  human_listening_or_review: "none claimed";
  target_commentary_ids: string[];
  authoring: { model: typeof COMMENTARY_AUTHORING_MODEL; effort: (typeof COMMENTARY_STAGE_EFFORT)["rewrite"] };
  revisions: CommentaryRevision[];
};

export type CommentaryRewriteRepairPreview = {
  applied: false;
  dialogue: string;
  candidatePath: string;
  ledgerPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  changedBlockIds: string[];
  candidate: CommentaryRewriteRepairCandidate;
  prospectiveLedger: string;
};

export type CommentaryRewriteRepairApply = Omit<CommentaryRewriteRepairPreview, "applied"> & {
  applied: true;
  submissionPath: string;
  submission: SubmissionRecord;
};

type PriorSubmission = SubmissionRecord & { kind: "rewrite" | "rewrite-batch" | "sample-repair" | "rewrite-repair" };
type AcceptanceReceipt = {
  reviewer: string;
  reviewedOn: string;
  appliedIds: string[];
  unacceptedIds: string[];
  postRewriteSha256: string;
  statuses: Array<{ id: string; status: string }>;
  repairStatus: "unreviewed" | "rejected";
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

function ids(value: unknown, path: string) {
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

function boundResource(value: unknown, path: string) {
  const resource = record(value, path);
  exactKeys(resource, ["path", "sha256"], path);
  const resourcePath = string(resource.path, `${path}.path`);
  const digest = string(resource.sha256, `${path}.sha256`);
  if (!SHA256.test(digest)) throw new Error(`${path}.sha256 must be a lowercase SHA-256`);
  return { path: resourcePath, sha256: digest };
}

function loadPriorSubmission(dialogue: string, binding: { path: string; sha256: string }): PriorSubmission {
  const normalized = normalizeRepoPath(binding.path);
  const expectedPrefix = `wiki/submissions/commentary/${dialogue}/`;
  if (
    binding.path !== normalized.relativePath ||
    !normalized.relativePath.startsWith(expectedPrefix) ||
    dirname(normalized.relativePath) !== expectedPrefix.slice(0, -1)
  ) {
    throw new Error(`prior_submission.path must be directly inside ${expectedPrefix}`);
  }
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing prior submission ${normalized.relativePath}`);
  const bytes = readFileSync(normalized.absolutePath);
  if (sha256(bytes) !== binding.sha256) throw new Error("Prior submission SHA mismatch");
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed prior submission: ${error instanceof Error ? error.message : String(error)}`);
  }
  const submission = record(parsed, "prior submission") as Partial<SubmissionRecord>;
  const fileId = basename(normalized.relativePath, ".json");
  const kind = String(submission.kind ?? "");
  const idMatchesKind = kind === "rewrite"
    ? /^\d{4}-rewrite(?:-[a-z0-9-]+)?$/u.test(fileId)
    : kind === "rewrite-batch"
      ? /^\d{4}-rewrite-batch(?:-[a-z0-9-]+)?$/u.test(fileId)
      : kind === "sample-repair"
        ? /^\d{4}-sample-repair$/u.test(fileId)
        : kind === "rewrite-repair" && /^\d{4}-rewrite-repair$/u.test(fileId);
  if (
    submission.schema_version !== 1 ||
    submission.submission_id !== fileId ||
    !SUBMISSION_ID.test(fileId) ||
    !SUBMISSION_KINDS.has(kind) || !idMatchesKind ||
    submission.lane !== "commentary" ||
    submission.scope !== dialogue ||
    submission.target_path !== `wiki/commentary/${dialogue}.md` ||
    typeof submission.target_sha256_before !== "string" || !SHA256.test(submission.target_sha256_before) ||
    typeof submission.target_sha256_after !== "string" || !SHA256.test(submission.target_sha256_after) ||
    !Array.isArray(submission.applied_ids) || submission.applied_ids.length === 0 ||
    submission.applied_ids.some((id) => typeof id !== "string" || !COMMENTARY_ID.test(id)) ||
    new Set(submission.applied_ids).size !== submission.applied_ids.length
  ) {
    throw new Error("Invalid prior tracked rewrite submission");
  }
  return submission as PriorSubmission;
}

function receiptField(lines: string[], name: string, path: string) {
  const values = lines.filter((line) => line.startsWith(`${name}: `)).map((line) => line.slice(name.length + 2));
  if (values.length !== 1) throw new Error(`Acceptance receipt must contain exactly one ${name}: ${path}`);
  return values[0]!;
}

function receiptList(lines: string[], name: string, path: string) {
  const marker = lines.indexOf(`${name}:`);
  if (marker < 0) throw new Error(`Acceptance receipt lacks ${name}: ${path}`);
  const values: string[] = [];
  for (const line of lines.slice(marker + 1)) {
    if (!line.startsWith("- ")) break;
    values.push(line.slice(2));
  }
  return values;
}

function reverseRejectedUnacceptedIds(dialogue: string, currentLedger: string, unacceptedIds: string[]) {
  const allowed = new Set(unacceptedIds);
  let ledger = currentLedger;
  let pending = new Set(commentaryMarkdownBlocks(ledger)
    .filter((block) => block.commentaryId !== undefined && allowed.has(block.commentaryId))
    .filter((block) => fieldValue(block.content, "review_status") === "rejected")
    .map((block) => block.commentaryId!));
  const reviewDir = join(getRepoRoot(), "wiki/review");
  while (pending.size > 0) {
    if (!existsSync(reviewDir)) throw new Error("Rejected unaccepted rewrites lack a canonical block-review receipt");
    const currentSha = sha256(ledger);
    const candidates = readdirSync(reviewDir)
      .filter((name) => new RegExp(`^\\d{4}-\\d{2}-\\d{2}-commentary-block-review-${dialogue}-rejected-[a-f0-9]{12}\\.md$`, "u").test(name))
      .map((name) => `wiki/review/${name}`)
      .filter((path) => {
        const lines = readFileSync(join(getRepoRoot(), path), "utf8").split("\n");
        if (lines[0] !== "# Commentary block review") return false;
        const after = receiptField(lines, "ledger_sha256_after", path);
        const reviewedIds = receiptList(lines, "reviewed_commentary_ids", path);
        return after === currentSha && reviewedIds.length > 0 && reviewedIds.every((id) => pending.has(id));
      });
    if (candidates.length !== 1) {
      throw new Error("Rejected unaccepted rewrites lack one exact canonical block-review receipt chain");
    }
    const path = candidates[0]!;
    const lines = readFileSync(join(getRepoRoot(), path), "utf8").split("\n");
    const reviewer = receiptField(lines, "reviewer", path);
    const reviewedOn = receiptField(lines, "reviewed_on", path);
    const rationale = receiptField(lines, "rationale", path);
    const reviewedIds = receiptList(lines, "reviewed_commentary_ids", path);
    const before = receiptField(lines, "ledger_sha256_before", path);
    const after = receiptField(lines, "ledger_sha256_after", path);
    const expectedReviewKey = sha256(`rejected\n${reviewedIds.join("\n")}\n${before}\n`).slice(0, 12);
    const expectedPath = `wiki/review/${reviewedOn}-commentary-block-review-${dialogue}-rejected-${expectedReviewKey}.md`;
    if (
      path !== expectedPath ||
      receiptField(lines, "dialogue", path) !== dialogue ||
      receiptField(lines, "decision", path) !== "rejected" ||
      receiptField(lines, "ledger_path", path) !== `wiki/commentary/${dialogue}.md` ||
      after !== currentSha || !SHA256.test(before) || !SHA256.test(after) ||
      !isDelegatedLunaReviewer(reviewer) || !validDate(reviewedOn) ||
      rationale.trim() !== rationale || rationale.length === 0 || rationale.length > MAX_FINDING_LENGTH ||
      containsHumanListeningOrReviewClaim(rationale) ||
      !lines.includes(BLOCK_REVIEW_BASIS) || !lines.includes(COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING) ||
      reviewedIds.some((id) => !COMMENTARY_ID.test(id) || !pending.has(id))
    ) {
      throw new Error("Invalid canonical block-review receipt for rejected unaccepted rewrites");
    }
    for (const id of reviewedIds) {
      const block = commentaryMarkdownBlocks(ledger).find((candidate) => candidate.commentaryId === id);
      if (!block || fieldValue(block.content, "review_status") !== "rejected") {
        throw new Error(`Block-review receipt status transition cannot be reversed: ${path}`);
      }
      ledger = ledger.replace(
        block.fullMatch,
        block.fullMatch.replace(/^review_status:\s*rejected\s*$/mu, "review_status: unreviewed"),
      );
      pending.delete(id);
    }
    if (sha256(ledger) !== before) throw new Error(`Block-review receipt before hash mismatch: ${path}`);
  }
  const invalid = commentaryMarkdownBlocks(ledger)
    .filter((block) => block.commentaryId !== undefined && allowed.has(block.commentaryId))
    .find((block) => fieldValue(block.content, "review_status") !== "unreviewed");
  if (invalid?.commentaryId) {
    throw new Error(`Unaccepted rewrite ${invalid.commentaryId} must currently be unreviewed or canonically rejected`);
  }
  return ledger;
}

function loadAcceptanceReceipt(
  dialogue: string,
  binding: { path: string; sha256: string },
  submissionBinding: { path: string; sha256: string },
  submission: PriorSubmission,
  currentLedger: string,
): AcceptanceReceipt {
  const normalized = normalizeRepoPath(binding.path);
  if (binding.path !== normalized.relativePath) throw new Error("acceptance_receipt.path must be canonical repo-relative path");
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing canonical acceptance receipt ${normalized.relativePath}`);
  const bytes = readFileSync(normalized.absolutePath);
  if (sha256(bytes) !== binding.sha256) throw new Error("Acceptance receipt SHA mismatch");
  const lines = bytes.toString("utf8").split("\n");
  if (lines[0] !== "# Commentary rewrite acceptance") throw new Error("Invalid commentary rewrite acceptance receipt header");
  const reviewer = receiptField(lines, "reviewer", normalized.relativePath);
  const reviewedOn = receiptField(lines, "reviewed_on", normalized.relativePath);
  const rationale = receiptField(lines, "rationale", normalized.relativePath);
  const expectedPath = `wiki/review/${reviewedOn}-commentary-rewrite-${dialogue}-${submission.submission_id}-acceptance.md`;
  if (
    normalized.relativePath !== expectedPath ||
    receiptField(lines, "dialogue", normalized.relativePath) !== dialogue ||
    receiptField(lines, "decision", normalized.relativePath) !== "accepted" ||
    receiptField(lines, "submission_id", normalized.relativePath) !== submission.submission_id ||
    receiptField(lines, "submission_record_path", normalized.relativePath) !== submissionBinding.path ||
    receiptField(lines, "submission_record_sha256", normalized.relativePath) !== submissionBinding.sha256 ||
    receiptField(lines, "submission_kind", normalized.relativePath) !== submission.kind ||
    receiptField(lines, "target_path", normalized.relativePath) !== submission.target_path ||
    receiptField(lines, "target_sha256_before", normalized.relativePath) !== submission.target_sha256_before ||
    receiptField(lines, "target_sha256_after", normalized.relativePath) !== submission.target_sha256_after ||
    !isDelegatedLunaReviewer(reviewer) || !validDate(reviewedOn) ||
    rationale.trim() !== rationale || rationale.length === 0 || rationale.length > MAX_FINDING_LENGTH ||
    containsHumanListeningOrReviewClaim(rationale) ||
    !lines.includes(REVIEW_BASIS) || !lines.includes(COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING)
  ) {
    throw new Error("Acceptance receipt does not exactly bind the prior submission and delegated Luna review");
  }
  const postRewriteSha256 = receiptField(lines, "post_rewrite_ledger_sha256", normalized.relativePath);
  if (!SHA256.test(postRewriteSha256)) throw new Error("Acceptance receipt has an invalid post-rewrite ledger SHA");
  const appliedIds = receiptList(lines, "applied_commentary_ids", normalized.relativePath);
  const unacceptedIds = receiptList(lines, "unaccepted_applied_ids", normalized.relativePath);
  const statusRows = receiptList(lines, "post_rewrite_statuses", normalized.relativePath);
  const statuses = statusRows.map((row) => {
    const match = /^(comm_[a-z0-9-]+_\d{4}): (\S+)$/u.exec(row);
    if (!match) throw new Error("Acceptance receipt has an invalid post-rewrite status row");
    return { id: match[1]!, status: match[2]! };
  });
  const appliedSet = new Set(appliedIds);
  const canonicalApplied = submission.applied_ids.filter((id) => appliedSet.has(id));
  const canonicalUnaccepted = submission.applied_ids.filter((id) => !appliedSet.has(id));
  if (
    appliedIds.length === 0 || new Set(appliedIds).size !== appliedIds.length ||
    appliedIds.some((id, index) => !COMMENTARY_ID.test(id) || id !== canonicalApplied[index]) ||
    unacceptedIds.length !== canonicalUnaccepted.length || unacceptedIds.some((id, index) => id !== canonicalUnaccepted[index]) ||
    statuses.length === 0 || new Set(statuses.map((entry) => entry.id)).size !== statuses.length ||
    appliedIds.some((id) => statuses.find((entry) => entry.id === id)?.status !== "unreviewed")
  ) {
    throw new Error("Acceptance receipt applied/unaccepted ID bindings are invalid");
  }

  const currentUnacceptedStatuses = unacceptedIds.map((id) => fieldValue(
    commentaryMarkdownBlocks(currentLedger).find((block) => block.commentaryId === id)?.content ?? "",
    "review_status",
  ));
  const repairStatus = currentUnacceptedStatuses.every((status) => status === "rejected")
    ? "rejected"
    : currentUnacceptedStatuses.every((status) => status === "unreviewed")
      ? "unreviewed"
      : undefined;
  if (!repairStatus) throw new Error("Unaccepted rewrites must currently be unreviewed or canonically rejected with one shared status");
  let preAcceptanceLedger = reverseRejectedUnacceptedIds(dialogue, currentLedger, unacceptedIds);
  for (const id of appliedIds) {
    const block = commentaryMarkdownBlocks(preAcceptanceLedger).find((candidate) => candidate.commentaryId === id);
    if (!block || fieldValue(block.content, "review_status") !== "accepted") {
      throw new Error(`Current ledger no longer matches accepted receipt ID ${id}`);
    }
    preAcceptanceLedger = preAcceptanceLedger.replace(
      block.fullMatch,
      block.fullMatch.replace(/^review_status:\s*accepted\s*$/mu, "review_status: unreviewed"),
    );
  }
  verifyCommentaryBlockReviewChain(dialogue, preAcceptanceLedger, postRewriteSha256, submission.applied_ids);
  const preStatuses = new Map(commentaryMarkdownBlocks(preAcceptanceLedger).map((block) => [
    block.commentaryId ?? "",
    fieldValue(block.content, "review_status") ?? "",
  ]));
  if (statuses.some((entry) => preStatuses.get(entry.id) !== entry.status)) {
    throw new Error("Acceptance receipt post-rewrite statuses do not match its ledger binding");
  }
  verifyCommentaryBlockReviewChain(dialogue, preAcceptanceLedger, submission.target_sha256_after, appliedIds);
  return { reviewer, reviewedOn, appliedIds, unacceptedIds, postRewriteSha256, statuses, repairStatus };
}

function reverseUnrelatedRewriteAcceptanceReceipts(
  dialogue: string,
  currentLedger: string,
  targetSha256: string,
  protectedIds: ReadonlySet<string>,
) {
  let ledger = currentLedger;
  const reviewDir = join(getRepoRoot(), "wiki/review");
  const receiptPaths = existsSync(reviewDir)
    ? readdirSync(reviewDir)
      .filter((name) => new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}-commentary-rewrite-${dialogue}-.+-acceptance\\.md$`,
        "u",
      ).test(name))
      .map((name) => `wiki/review/${name}`)
    : [];
  const used = new Set<string>();

  for (let step = 0; step <= receiptPaths.length; step += 1) {
    if (sha256(ledger) === targetSha256) return ledger;
    const candidates = receiptPaths.flatMap((path) => {
      if (used.has(path)) return [];
      try {
        const lines = readFileSync(join(getRepoRoot(), path), "utf8").split("\n");
        if (lines[0] !== "# Commentary rewrite acceptance") return [];
        const appliedIds = receiptList(lines, "applied_commentary_ids", path);
        if (appliedIds.length === 0 || appliedIds.some((id) => protectedIds.has(id))) return [];
        let reversed = ledger;
        for (const id of appliedIds) {
          const block = commentaryMarkdownBlocks(reversed).find((candidate) => candidate.commentaryId === id);
          if (!block || fieldValue(block.content, "review_status") !== "accepted") return [];
          const replacement = block.fullMatch.replace(
            /^review_status:\s*accepted\s*$/mu,
            "review_status: unreviewed",
          );
          if (replacement === block.fullMatch) return [];
          reversed = reversed.replace(block.fullMatch, replacement);
        }
        const postRewriteSha256 = receiptField(lines, "post_rewrite_ledger_sha256", path);
        return sha256(reversed) === postRewriteSha256
          ? [{ path, lines, appliedIds, postRewriteSha256, reversed }]
          : [];
      } catch {
        return [];
      }
    });
    if (candidates.length !== 1) {
      throw new Error("Current ledger drift from the block rejection lacks one exact unrelated rewrite-acceptance receipt chain");
    }

    const candidate = candidates[0]!;
    const { path, lines, appliedIds, postRewriteSha256, reversed } = candidate;
    const reviewer = receiptField(lines, "reviewer", path);
    const reviewedOn = receiptField(lines, "reviewed_on", path);
    const rationale = receiptField(lines, "rationale", path);
    const submissionId = receiptField(lines, "submission_id", path);
    const submissionPath = receiptField(lines, "submission_record_path", path);
    const submissionSha256 = receiptField(lines, "submission_record_sha256", path);
    const submission = loadPriorSubmission(dialogue, { path: submissionPath, sha256: submissionSha256 });
    const expectedPath = `wiki/review/${reviewedOn}-commentary-rewrite-${dialogue}-${submissionId}-acceptance.md`;
    const appliedSet = new Set(appliedIds);
    const canonicalApplied = submission.applied_ids.filter((id) => appliedSet.has(id));
    const unacceptedIds = receiptList(lines, "unaccepted_applied_ids", path);
    const canonicalUnaccepted = submission.applied_ids.filter((id) => !appliedSet.has(id));
    const statusRows = receiptList(lines, "post_rewrite_statuses", path);
    const statusIds = statusRows.map((row) => /^(comm_[a-z0-9-]+_\d{4}): unreviewed$/u.exec(row)?.[1]);
    if (
      path !== expectedPath ||
      receiptField(lines, "dialogue", path) !== dialogue ||
      receiptField(lines, "decision", path) !== "accepted" ||
      submission.submission_id !== submissionId ||
      receiptField(lines, "submission_kind", path) !== submission.kind ||
      receiptField(lines, "target_path", path) !== submission.target_path ||
      receiptField(lines, "target_sha256_before", path) !== submission.target_sha256_before ||
      receiptField(lines, "target_sha256_after", path) !== submission.target_sha256_after ||
      !SHA256.test(postRewriteSha256) ||
      !isDelegatedLunaReviewer(reviewer) || !validDate(reviewedOn) ||
      rationale.trim() !== rationale || rationale.length === 0 || rationale.length > MAX_FINDING_LENGTH ||
      containsHumanListeningOrReviewClaim(rationale) ||
      !lines.includes(REVIEW_BASIS) || !lines.includes(COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING) ||
      appliedIds.some((id, index) => !COMMENTARY_ID.test(id) || id !== canonicalApplied[index]) ||
      unacceptedIds.length !== canonicalUnaccepted.length ||
      unacceptedIds.some((id, index) => id !== canonicalUnaccepted[index]) ||
      statusIds.length !== appliedIds.length || statusIds.some((id, index) => id !== appliedIds[index])
    ) {
      throw new Error(`Invalid unrelated canonical rewrite-acceptance receipt ${path}`);
    }
    ledger = reversed;
    used.add(path);
  }
  throw new Error("Current ledger drift from the block rejection lacks a complete rewrite-acceptance receipt chain");
}

function verifyUnrelatedSubmissionChain(
  dialogue: string,
  startSha256: string,
  targetSha256: string,
  protectedIds: ReadonlySet<string>,
) {
  let currentSha256 = startSha256;
  const directory = join(getRepoRoot(), `wiki/submissions/commentary/${dialogue}`);
  const paths = existsSync(directory)
    ? readdirSync(directory)
      .filter((name) => name.endsWith(".json"))
      .map((name) => `wiki/submissions/commentary/${dialogue}/${name}`)
    : [];
  const used = new Set<string>();
  for (let step = 0; step <= paths.length; step += 1) {
    if (currentSha256 === targetSha256) return;
    const candidates = paths.flatMap((path) => {
      if (used.has(path)) return [];
      try {
        const bytes = readFileSync(join(getRepoRoot(), path));
        const submission = loadPriorSubmission(dialogue, { path, sha256: sha256(bytes) });
        return submission.target_sha256_before === currentSha256 &&
          submission.applied_ids.every((id) => !protectedIds.has(id))
          ? [{ path, submission }]
          : [];
      } catch {
        return [];
      }
    });
    if (candidates.length !== 1) {
      throw new Error("Block rejection pre-review drift lacks one exact unrelated canonical submission chain");
    }
    const candidate = candidates[0]!;
    currentSha256 = candidate.submission.target_sha256_after;
    used.add(candidate.path);
  }
  throw new Error("Block rejection pre-review drift lacks a complete unrelated canonical submission chain");
}

function loadBlockRejectionReceipt(
  dialogue: string,
  binding: { path: string; sha256: string },
  submission: PriorSubmission,
  currentLedger: string,
): AcceptanceReceipt {
  const normalized = normalizeRepoPath(binding.path);
  if (binding.path !== normalized.relativePath) throw new Error("acceptance_receipt.path must be canonical repo-relative path");
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing canonical block rejection receipt ${normalized.relativePath}`);
  const bytes = readFileSync(normalized.absolutePath);
  if (sha256(bytes) !== binding.sha256) throw new Error("Block rejection receipt SHA mismatch");
  const lines = bytes.toString("utf8").split("\n");
  if (lines[0] !== "# Commentary block review") throw new Error("Invalid commentary block rejection receipt header");
  const reviewer = receiptField(lines, "reviewer", normalized.relativePath);
  const reviewedOn = receiptField(lines, "reviewed_on", normalized.relativePath);
  const rationale = receiptField(lines, "rationale", normalized.relativePath);
  const reviewedIds = receiptList(lines, "reviewed_commentary_ids", normalized.relativePath);
  const before = receiptField(lines, "ledger_sha256_before", normalized.relativePath);
  const after = receiptField(lines, "ledger_sha256_after", normalized.relativePath);
  const expectedReviewKey = sha256(`rejected\n${reviewedIds.join("\n")}\n${before}\n`).slice(0, 12);
  const expectedPath = `wiki/review/${reviewedOn}-commentary-block-review-${dialogue}-rejected-${expectedReviewKey}.md`;
  if (
    normalized.relativePath !== expectedPath ||
    receiptField(lines, "dialogue", normalized.relativePath) !== dialogue ||
    receiptField(lines, "decision", normalized.relativePath) !== "rejected" ||
    receiptField(lines, "ledger_path", normalized.relativePath) !== submission.target_path ||
    !SHA256.test(before) || !SHA256.test(after) ||
    !isDelegatedLunaReviewer(reviewer) || !validDate(reviewedOn) ||
    rationale.trim() !== rationale || rationale.length === 0 || rationale.length > MAX_FINDING_LENGTH ||
    containsHumanListeningOrReviewClaim(rationale) ||
    !lines.includes(BLOCK_REVIEW_BASIS) || !lines.includes(COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING) ||
    reviewedIds.length !== submission.applied_ids.length ||
    reviewedIds.some((id, index) => !COMMENTARY_ID.test(id) || id !== submission.applied_ids[index])
  ) {
    throw new Error("Block rejection receipt does not exactly bind the prior submission and delegated Luna review");
  }
  verifyUnrelatedSubmissionChain(
    dialogue,
    submission.target_sha256_after,
    before,
    new Set(reviewedIds),
  );

  let preRejectionLedger = reverseUnrelatedRewriteAcceptanceReceipts(
    dialogue,
    currentLedger,
    after,
    new Set(reviewedIds),
  );
  for (const id of reviewedIds) {
    const block = commentaryMarkdownBlocks(preRejectionLedger).find((candidate) => candidate.commentaryId === id);
    if (!block || fieldValue(block.content, "review_status") !== "rejected") {
      throw new Error(`Current ledger no longer matches rejected receipt ID ${id}`);
    }
    preRejectionLedger = preRejectionLedger.replace(
      block.fullMatch,
      block.fullMatch.replace(/^review_status:\s*rejected\s*$/mu, "review_status: unreviewed"),
    );
  }
  if (sha256(preRejectionLedger) !== before) {
    throw new Error("Current ledger cannot be reversed to the block rejection receipt pre-review SHA");
  }
  return {
    reviewer,
    reviewedOn,
    appliedIds: [],
    unacceptedIds: reviewedIds,
    postRewriteSha256: before,
    statuses: reviewedIds.map((id) => ({ id, status: "unreviewed" })),
    repairStatus: "rejected",
  };
}

function loadReviewReceipt(
  dialogue: string,
  binding: { path: string; sha256: string },
  submissionBinding: { path: string; sha256: string },
  submission: PriorSubmission,
  currentLedger: string,
) {
  const normalized = normalizeRepoPath(binding.path);
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing canonical review receipt ${normalized.relativePath}`);
  const header = readFileSync(normalized.absolutePath, "utf8").split("\n", 1)[0];
  return header === "# Commentary block review"
    ? loadBlockRejectionReceipt(dialogue, binding, submission, currentLedger)
    : loadAcceptanceReceipt(dialogue, binding, submissionBinding, submission, currentLedger);
}

function readCandidate(dialogue: string, candidatePath: string, currentLedger: string): CommentaryRewriteRepairCandidate {
  const normalized = normalizeRepoPath(candidatePath);
  const expectedDirectory = `scratch/commentary/rewrite-repairs/${dialogue}`;
  if (dirname(normalized.relativePath) !== expectedDirectory || !CANDIDATE_NAME.test(basename(normalized.relativePath))) {
    throw new Error(`Candidate path must be a JSON file directly inside ${expectedDirectory}`);
  }
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing rewrite-repair candidate ${normalized.relativePath}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(normalized.absolutePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Invalid rewrite-repair JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const candidate = record(parsed, "candidate");
  exactKeys(candidate, [
    "schema_version", "dialogue", "ledger", "prior_submission", "acceptance_receipt", "prior_review",
    "repair_author", "human_listening_or_review", "target_commentary_ids", "authoring", "revisions",
  ], "candidate");
  if (candidate.schema_version !== 1 || candidate.dialogue !== dialogue) throw new Error("Candidate schema/dialogue mismatch");
  const ledger = boundResource(candidate.ledger, "candidate.ledger");
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  if (ledger.path !== ledgerPath || ledger.sha256 !== sha256(currentLedger)) {
    throw new Error("Candidate ledger path/SHA drifted from the current canonical ledger");
  }
  const priorBinding = boundResource(candidate.prior_submission, "candidate.prior_submission");
  const receiptBinding = boundResource(candidate.acceptance_receipt, "candidate.acceptance_receipt");
  const priorSubmission = loadPriorSubmission(dialogue, priorBinding);
  const receipt = loadReviewReceipt(dialogue, receiptBinding, priorBinding, priorSubmission, currentLedger);

  const priorReview = record(candidate.prior_review, "candidate.prior_review");
  exactKeys(priorReview, ["reviewer", "reviewed_on", "rejection_findings"], "candidate.prior_review");
  const priorReviewer = string(priorReview.reviewer, "candidate.prior_review.reviewer");
  const priorReviewedOn = string(priorReview.reviewed_on, "candidate.prior_review.reviewed_on");
  if (priorReviewer !== receipt.reviewer || priorReviewedOn !== receipt.reviewedOn) {
    throw new Error("Candidate prior review does not bind the canonical review receipt reviewer/date");
  }
  const targetIds = ids(candidate.target_commentary_ids, "candidate.target_commentary_ids");
  if (targetIds.length === 0 || new Set(targetIds).size !== targetIds.length) {
    throw new Error("target_commentary_ids must be non-empty and unique");
  }
  const targetSet = new Set(targetIds);
  const canonicalTargets = receipt.unacceptedIds.filter((id) => targetSet.has(id));
  if (targetIds.some((id, index) => id !== canonicalTargets[index]) || targetIds.some((id) => !receipt.unacceptedIds.includes(id))) {
    throw new Error("target_commentary_ids must be a canonical-order subset of unaccepted_applied_ids");
  }
  const ledgerBlocks = commentaryMarkdownBlocks(currentLedger);
  const ledgerPositions = targetIds.map((id) => ledgerBlocks.findIndex((block) => block.commentaryId === id));
  if (
    ledgerPositions.some((position) => position < 0) ||
    ledgerPositions.some((position, index) => index > 0 && position <= ledgerPositions[index - 1]!) ||
    targetIds.some((id) => fieldValue(ledgerBlocks.find((block) => block.commentaryId === id)?.content ?? "", "review_status") !== receipt.repairStatus)
  ) {
    throw new Error(`Rewrite-repair targets must exist in canonical order and currently be ${receipt.repairStatus}`);
  }

  if (!Array.isArray(priorReview.rejection_findings)) throw new Error("candidate.prior_review.rejection_findings must be an array");
  const findings = priorReview.rejection_findings.map((entry, index) => {
    const finding = record(entry, `candidate.prior_review.rejection_findings[${index}]`);
    exactKeys(finding, ["commentary_id", "finding"], `candidate.prior_review.rejection_findings[${index}]`);
    const id = string(finding.commentary_id, `candidate.prior_review.rejection_findings[${index}].commentary_id`);
    const text = string(finding.finding, `candidate.prior_review.rejection_findings[${index}].finding`);
    if (id !== targetIds[index] || text !== text.trim() || text.length > MAX_FINDING_LENGTH || /[\r\n]/u.test(text) || containsHumanListeningOrReviewClaim(text)) {
      throw new Error("Rejection findings must cover target IDs exactly in canonical order with concise one-line findings");
    }
    return { commentary_id: id, finding: text };
  });
  if (findings.length !== targetIds.length) throw new Error("Rejection findings must cover every target ID exactly once");

  const repairAuthor = string(candidate.repair_author, "candidate.repair_author");
  if (!REPAIR_AUTHOR.test(repairAuthor) || repairAuthor === priorReviewer) {
    throw new Error("repair_author must be a delegated Luna ID distinct from the prior reviewer");
  }
  if (candidate.human_listening_or_review !== "none claimed") {
    throw new Error("Rewrite repair must not claim human listening or human review");
  }
  const authoring = record(candidate.authoring, "candidate.authoring");
  exactKeys(authoring, ["model", "effort"], "candidate.authoring");
  if (authoring.model !== COMMENTARY_AUTHORING_MODEL || authoring.effort !== COMMENTARY_STAGE_EFFORT.rewrite) {
    throw new Error(`Candidate authoring must record ${COMMENTARY_AUTHORING_MODEL} at high effort`);
  }
  const revisions = parseCommentaryRevisions(candidate.revisions, {
    path: "candidate.revisions",
    expectedCommentaryIds: targetIds,
  });
  return {
    schema_version: 1,
    dialogue,
    ledger,
    prior_submission: priorBinding,
    acceptance_receipt: receiptBinding,
    prior_review: { reviewer: priorReviewer, reviewed_on: priorReviewedOn, rejection_findings: findings },
    repair_author: repairAuthor,
    human_listening_or_review: "none claimed",
    target_commentary_ids: targetIds,
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.rewrite },
    revisions,
  };
}

function buildPreview(dialogue: string, candidatePath: string): CommentaryRewriteRepairPreview {
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

export function previewCommentaryRewriteRepair(options: { dialogue: string; candidatePath: string }) {
  return buildPreview(options.dialogue, options.candidatePath);
}

export function applyCommentaryRewriteRepair(options: { dialogue: string; candidatePath: string }): CommentaryRewriteRepairApply {
  const ledgerPath = `wiki/commentary/${options.dialogue}.md`;
  const normalized = normalizeRepoPath(options.candidatePath);
  const initial = buildPreview(options.dialogue, normalized.relativePath);
  return withRepoWriteLock(
    {
      paths: [
        ledgerPath,
        normalized.relativePath,
        initial.candidate.prior_submission.path,
        initial.candidate.acceptance_receipt.path,
        submissionDirectory("commentary", options.dialogue),
      ],
      label: `commentary-rewrite-repair:${options.dialogue}`,
    },
    () => {
      const preview = buildPreview(options.dialogue, normalized.relativePath);
      if (
        preview.candidate.prior_submission.path !== initial.candidate.prior_submission.path ||
        preview.candidate.prior_submission.sha256 !== initial.candidate.prior_submission.sha256 ||
        preview.candidate.acceptance_receipt.path !== initial.candidate.acceptance_receipt.path ||
        preview.candidate.acceptance_receipt.sha256 !== initial.candidate.acceptance_receipt.sha256
      ) {
        throw new Error("Rewrite-repair provenance bindings changed while acquiring the apply lock");
      }
      const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
      const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
      atomicWrite(absoluteLedgerPath, preview.prospectiveLedger);
      try {
        const recorded = recordSubmission({
          lane: "commentary",
          kind: "rewrite-repair",
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

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot, normalizeRepoPath } from "../paths.js";
import {
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
} from "./commentary-quality-audit.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { formatCommentaryLedgerValidationError, validateCommentaryLedger } from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const REPAIR_AUTHOR = /^[a-z0-9][a-z0-9-]*-delegated-luna-repair-author-[a-z0-9][a-z0-9-]*$/u;
const SUBMISSION_ID = /^\d{4}-(?:(?:rewrite|rewrite-batch)(?:-[a-z0-9-]+)?|sample-repair|rewrite-repair)$/u;
const MAX_RATIONALE_LENGTH = 300;
const COMMENTARY_REWRITE_REVIEW_BASIS = "review_basis: operator-delegated independent Luna review of every applied rewrite ID";
const BLOCK_REVIEW_RECEIPT_BASIS = "review_basis: operator-delegated independent Luna block review";

export type CommentaryRewriteStatusSnapshot = {
  commentaryId: string;
  reviewStatus: string;
};

export type CommentaryRewriteReviewInput = {
  dialogue: string;
  /** The tracked record under wiki/submissions/commentary/<dialogue>. */
  submissionRecordPath: string;
  /** The exact SHA-256 of the canonical submission-record bytes. */
  submissionRecordSha256: string;
  /** Explicit bindings are required; they are checked against the record. */
  targetSha256Before: string;
  targetSha256After: string;
  /** IDs being accepted; this may be a non-empty canonical-order subset of the submission IDs. */
  appliedIds: string[];
  /** Hash and statuses of the ledger after rewrite, before this acceptance. */
  postRewriteLedgerSha256: string;
  postRewriteStatuses: CommentaryRewriteStatusSnapshot[] | Record<string, string>;
  reviewer: string;
  reviewedOn: string;
  rationale: string;
};

export type CommentaryRewriteAcceptancePreview = {
  applied: false;
  dialogue: string;
  submissionRecordPath: string;
  submissionRecordSha256: string;
  receiptPath: string;
  receipt: string;
  ledgerPath: string;
  ledgerSha256BeforeAcceptance: string;
  ledgerSha256AfterAcceptance: string;
  appliedIds: string[];
  unacceptedAppliedIds: string[];
  prospectiveLedger: string;
};

export type CommentaryRewriteAcceptanceApply = Omit<CommentaryRewriteAcceptancePreview, "applied"> & {
  applied: true;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateInput(input: CommentaryRewriteReviewInput) {
  if (!DIALOGUE.test(input.dialogue)) throw new Error(`Invalid dialogue slug: ${input.dialogue}`);
  if (!isDelegatedLunaReviewer(input.reviewer)) {
    throw new Error("reviewer must identify an operator-delegated Luna reviewer");
  }
  if (!validDate(input.reviewedOn)) throw new Error("reviewedOn must be a valid YYYY-MM-DD date");
  if (
    input.rationale.trim().length === 0 ||
    input.rationale !== input.rationale.trim() ||
    input.rationale.length > MAX_RATIONALE_LENGTH ||
    /[\r\n]/u.test(input.rationale)
  ) {
    throw new Error(`rationale must be one non-empty line of at most ${MAX_RATIONALE_LENGTH} characters`);
  }
  if (containsHumanListeningOrReviewClaim(input.rationale)) {
    throw new Error("rationale must not claim human listening or human review");
  }
  if (!SHA256.test(input.submissionRecordSha256)) throw new Error("submissionRecordSha256 must be a lowercase SHA-256 digest");
  for (const [name, value] of [
    ["targetSha256Before", input.targetSha256Before],
    ["targetSha256After", input.targetSha256After],
    ["postRewriteLedgerSha256", input.postRewriteLedgerSha256],
  ] as const) {
    if (!SHA256.test(value)) throw new Error(`${name} must be a lowercase SHA-256 digest`);
  }
  if (!Array.isArray(input.appliedIds) || input.appliedIds.length === 0) {
    throw new Error("appliedIds must be explicitly provided and non-empty");
  }
  if (input.appliedIds.some((id) => !COMMENTARY_ID.test(id))) throw new Error("appliedIds must contain valid commentary IDs");
  if (new Set(input.appliedIds).size !== input.appliedIds.length) throw new Error("appliedIds must be unique");
  if (!Array.isArray(input.postRewriteStatuses) && (typeof input.postRewriteStatuses !== "object" || input.postRewriteStatuses === null)) {
    throw new Error("postRewriteStatuses must be an ordered array or object map");
  }
  const normalized = normalizeStatusSnapshot(input.postRewriteStatuses);
  if (normalized.some((entry) => !COMMENTARY_ID.test(entry.commentaryId))) {
    throw new Error("postRewriteStatuses must contain valid commentary IDs");
  }
}

function submissionPathFor(dialogue: string, supplied: string) {
  const normalized = normalizeRepoPath(supplied);
  const expectedPrefix = `wiki/submissions/commentary/${dialogue}/`;
  if (!normalized.relativePath.startsWith(expectedPrefix) || !normalized.relativePath.endsWith(".json")) {
    throw new Error(`submissionRecordPath must be inside ${expectedPrefix}`);
  }
  return normalized;
}

type TrackedSubmission = {
  schema_version: 1;
  submission_id: string;
  lane: string;
  kind: string;
  scope: string;
  source_path: string;
  source_sha256: string;
  target_path: string;
  target_sha256_before: string;
  target_sha256_after: string;
  applied_at: string;
  applied_ids: string[];
  submission: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadTrackedSubmission(input: CommentaryRewriteReviewInput) {
  const normalized = submissionPathFor(input.dialogue, input.submissionRecordPath);
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing canonical submission record ${normalized.relativePath}`);
  const bytes = readFileSync(normalized.absolutePath);
  const digest = sha256(bytes);
  if (digest !== input.submissionRecordSha256) {
    throw new Error(`Canonical submission record hash mismatch for ${normalized.relativePath}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Canonical submission record is malformed JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isRecord(parsed)) throw new Error("Canonical submission record must be a JSON object");
  const record = parsed as Partial<TrackedSubmission>;
  const fileId = basename(normalized.relativePath, ".json");
  if (record.schema_version !== 1 || record.submission_id !== fileId || !SUBMISSION_ID.test(fileId)) {
    throw new Error("Canonical submission record has an invalid schema or submission_id");
  }
  if (
    record.lane !== "commentary" ||
    record.scope !== input.dialogue ||
    (record.kind !== "rewrite" && record.kind !== "rewrite-batch" && record.kind !== "sample-repair" && record.kind !== "rewrite-repair")
  ) {
    throw new Error("Canonical submission record is not a recognized commentary rewrite submission");
  }
  if (record.kind === "sample-repair") {
    const candidate = isRecord(record.submission) ? record.submission : undefined;
    const sampleReview = candidate && isRecord(candidate.sample_review) ? candidate.sample_review : undefined;
    const sampleReviewer = sampleReview?.reviewer;
    if (!isDelegatedLunaReviewer(sampleReviewer) || sampleReviewer === input.reviewer) {
      throw new Error("Sample-repair acceptance requires a separate operator-delegated Luna reviewer");
    }
  }
  if (record.target_path !== `wiki/commentary/${input.dialogue}.md`) {
    throw new Error("Canonical submission record targets a different commentary ledger");
  }
  if (
    typeof record.target_sha256_before !== "string" ||
    typeof record.target_sha256_after !== "string" ||
    record.target_sha256_before !== input.targetSha256Before ||
    record.target_sha256_after !== input.targetSha256After
  ) {
    throw new Error("Submission target hashes do not match the explicit acceptance bindings");
  }
  if (
    !Array.isArray(record.applied_ids) ||
    record.applied_ids.length === 0 ||
    record.applied_ids.some((id) => typeof id !== "string" || !COMMENTARY_ID.test(id)) ||
    new Set(record.applied_ids).size !== record.applied_ids.length
  ) {
    throw new Error("Canonical submission record has invalid applied_ids");
  }
  if (record.kind === "rewrite-repair") {
    const candidate = isRecord(record.submission) ? record.submission : undefined;
    const priorReview = candidate && isRecord(candidate.prior_review) ? candidate.prior_review : undefined;
    const priorReviewer = priorReview?.reviewer;
    const repairAuthor = candidate?.repair_author;
    const authoring = candidate && isRecord(candidate.authoring) ? candidate.authoring : undefined;
    const targetIds = candidate?.target_commentary_ids;
    const revisions = candidate?.revisions;
    const candidateIdsValid =
      Array.isArray(targetIds) &&
      Array.isArray(revisions) &&
      targetIds.length === record.applied_ids.length &&
      targetIds.every((id, index) => id === record.applied_ids![index]) &&
      revisions.length === targetIds.length &&
      revisions.every((revision, index) => isRecord(revision) && revision.commentary_id === targetIds[index]);
    if (
      !isDelegatedLunaReviewer(priorReviewer) ||
      typeof repairAuthor !== "string" || !REPAIR_AUTHOR.test(repairAuthor) ||
      priorReviewer === repairAuthor ||
      input.reviewer === priorReviewer ||
      input.reviewer === repairAuthor ||
      candidate?.human_listening_or_review !== "none claimed" ||
      authoring?.model !== "gpt-5.6-luna" ||
      authoring.effort !== "high" ||
      !candidateIdsValid
    ) {
      throw new Error("Rewrite-repair acceptance requires valid repair provenance and a separate delegated Luna reviewer");
    }
  }
  return { normalized, record: record as TrackedSubmission, bytes, digest };
}

function validateReviewedSubset(reviewedIds: string[], submissionIds: string[]) {
  const submissionSet = new Set(submissionIds);
  if (reviewedIds.some((id) => !submissionSet.has(id))) {
    throw new Error("reviewed IDs must be present in the canonical submission applied_ids");
  }
  const canonicalSubset = submissionIds.filter((id) => reviewedIds.includes(id));
  if (canonicalSubset.some((id, index) => id !== reviewedIds[index])) {
    throw new Error("reviewed IDs must use canonical submission order");
  }
}

function normalizeStatusSnapshot(value: CommentaryRewriteStatusSnapshot[] | Record<string, string>) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      if (!isRecord(entry) || typeof entry.commentaryId !== "string" || typeof entry.reviewStatus !== "string") {
        throw new Error(`postRewriteStatuses[${index}] must contain commentaryId and reviewStatus`);
      }
      return { commentaryId: entry.commentaryId, reviewStatus: entry.reviewStatus };
    });
  }
  return Object.entries(value).map(([commentaryId, reviewStatus]) => ({ commentaryId, reviewStatus }));
}

function ledgerStatusSnapshot(content: string) {
  return commentaryMarkdownBlocks(content).map((block) => ({
    commentaryId: block.commentaryId ?? "",
    reviewStatus: fieldValue(block.content, "review_status") ?? "unreviewed",
  }));
}

type BlockReviewReceipt = {
  path: string;
  decision: "accepted" | "rejected";
  before: string;
  after: string;
  ids: string[];
};

function blockReviewReceiptField(lines: string[], name: string) {
  const line = lines.find((value) => value.startsWith(`${name}: `));
  return line?.slice(name.length + 2);
}

function parseBlockReviewReceipt(dialogue: string, path: string): BlockReviewReceipt {
  const fileName = basename(path);
  const fileMatch = /^(\d{4}-\d{2}-\d{2})-commentary-block-review-([a-z0-9-]+)-(accepted|rejected)-([a-f0-9]{12})\.md$/u.exec(fileName);
  if (!fileMatch || fileMatch[2] !== dialogue) throw new Error(`Invalid canonical block-review receipt path ${path}`);
  const content = readFileSync(join(getRepoRoot(), path), "utf8");
  const lines = content.split("\n");
  if (lines[0] !== "# Commentary block review") throw new Error(`Invalid block-review receipt header ${path}`);
  if (blockReviewReceiptField(lines, "dialogue") !== dialogue) throw new Error(`Block-review receipt dialogue mismatch ${path}`);
  const decision = blockReviewReceiptField(lines, "decision");
  if (decision !== "accepted" && decision !== "rejected") throw new Error(`Invalid block-review decision ${path}`);
  if (decision !== fileMatch[3]) throw new Error(`Block-review receipt filename decision mismatch ${path}`);
  if (blockReviewReceiptField(lines, "ledger_path") !== `wiki/commentary/${dialogue}.md`) {
    throw new Error(`Block-review receipt ledger path mismatch ${path}`);
  }
  const before = blockReviewReceiptField(lines, "ledger_sha256_before");
  const after = blockReviewReceiptField(lines, "ledger_sha256_after");
  if (!before || !SHA256.test(before) || !after || !SHA256.test(after)) {
    throw new Error(`Invalid block-review ledger hash binding ${path}`);
  }
  const reviewer = blockReviewReceiptField(lines, "reviewer");
  const reviewedOn = blockReviewReceiptField(lines, "reviewed_on");
  const rationale = blockReviewReceiptField(lines, "rationale");
  if (!reviewer || !isDelegatedLunaReviewer(reviewer) || !reviewedOn || reviewedOn !== fileMatch[1] || !validDate(reviewedOn) || !rationale ||
      rationale.length > MAX_RATIONALE_LENGTH || rationale.trim() !== rationale || /[\r\n]/u.test(rationale) ||
      containsHumanListeningOrReviewClaim(rationale)) {
    throw new Error(`Invalid block-review reviewer binding ${path}`);
  }
  if (!lines.includes(BLOCK_REVIEW_RECEIPT_BASIS) || !lines.includes(COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING)) {
    throw new Error(`Block-review receipt lacks delegated Luna/no-human binding ${path}`);
  }
  const marker = lines.indexOf("reviewed_commentary_ids:");
  if (marker < 0) throw new Error(`Block-review receipt lacks reviewed IDs ${path}`);
  const ids = lines.slice(marker + 1).filter((line) => line.startsWith("- ")).map((line) => line.slice(2));
  if (ids.length === 0 || ids.some((id) => !COMMENTARY_ID.test(id)) || new Set(ids).size !== ids.length) {
    throw new Error(`Invalid block-review IDs ${path}`);
  }
  const expectedReviewKeys = [
    sha256(`${decision}\n${ids.join("\n")}`).slice(0, 12),
    sha256(`${decision}\n${ids.join("\n")}\n${before}`).slice(0, 12),
  ];
  if (!expectedReviewKeys.includes(fileMatch[4]!)) {
    throw new Error(`Block-review receipt filename hash mismatch ${path}`);
  }
  return { path, decision, before, after, ids };
}

export function verifyCommentaryBlockReviewChain(dialogue: string, currentLedger: string, targetSha256: string, submissionIds: string[]) {
  let current = currentLedger;
  let currentSha = sha256(current);
  if (currentSha === targetSha256) return;
  const reviewDir = join(getRepoRoot(), "wiki/review");
  if (!existsSync(reviewDir)) throw new Error("Current ledger drift has no canonical block-review receipt chain");
  const receiptPaths = readdirSync(reviewDir)
    .filter((name) => new RegExp(`^\\d{4}-\\d{2}-\\d{2}-commentary-block-review-${dialogue}-(?:accepted|rejected)-[a-f0-9]{12}\\.md$`, "u").test(name))
    .map((name) => `wiki/review/${name}`);
  const receipts = receiptPaths.map((path) => parseBlockReviewReceipt(dialogue, path));
  const submissionSet = new Set(submissionIds);
  const used = new Set<string>();
  for (let step = 0; step <= receipts.length; step += 1) {
    if (currentSha === targetSha256) return;
    const candidates = receipts.filter((receipt) =>
      !used.has(receipt.path) && receipt.after === currentSha && receipt.ids.every((id) => !submissionSet.has(id)),
    );
    if (candidates.length !== 1) {
      throw new Error("Current post-rewrite ledger drift lacks a complete canonical block-review receipt chain");
    }
    const receipt = candidates[0]!;
    const blocks = commentaryMarkdownBlocks(current);
    const positions = receipt.ids.map((id) => blocks.findIndex((block) => block.commentaryId === id));
    if (positions.some((position) => position < 0) || positions.some((position, index) => index > 0 && position <= positions[index - 1]!)) {
      throw new Error(`Block-review receipt IDs are not canonical or are missing: ${receipt.path}`);
    }
    for (const id of receipt.ids) {
      const block = blocks.find((candidate) => candidate.commentaryId === id);
      if (!block || fieldValue(block.content, "review_status") !== receipt.decision) {
        throw new Error(`Block-review receipt status transition cannot be reversed: ${receipt.path}`);
      }
      const replacement = block.fullMatch.replace(
        new RegExp(`^review_status:\\s*${receipt.decision}\\s*$`, "mu"),
        "review_status: unreviewed",
      );
      if (replacement === block.fullMatch) throw new Error(`Block-review receipt status field is not reversible: ${receipt.path}`);
      current = current.replace(block.fullMatch, replacement);
    }
    if (sha256(current) !== receipt.before) throw new Error(`Block-review receipt before hash mismatch: ${receipt.path}`);
    currentSha = receipt.before;
    used.add(receipt.path);
  }
  throw new Error("Current post-rewrite ledger drift lacks a complete canonical block-review receipt chain");
}

function sameEntries(actual: CommentaryRewriteStatusSnapshot[], expected: CommentaryRewriteStatusSnapshot[]) {
  return actual.length === expected.length && actual.every((entry, index) => {
    const other = expected[index];
    return other?.commentaryId === entry.commentaryId && other.reviewStatus === entry.reviewStatus;
  });
}

function validateStatusBinding(input: CommentaryRewriteReviewInput, actual: CommentaryRewriteStatusSnapshot[]) {
  const expected = normalizeStatusSnapshot(input.postRewriteStatuses);
  if (sameEntries(actual, expected)) return expected;
  const actualById = new Map(actual.map((entry) => [entry.commentaryId, entry]));
  if (
    expected.length !== input.appliedIds.length ||
    expected.some((entry, index) => {
      const actualEntry = actualById.get(entry.commentaryId);
      return entry.commentaryId !== input.appliedIds[index] || !actualEntry || actualEntry.reviewStatus !== entry.reviewStatus;
    })
  ) {
    throw new Error("Post-rewrite ledger statuses drifted from the explicit acceptance snapshot");
  }
  return expected;
}

function assertCanonicalOrder(appliedIds: string[], ledgerStatuses: CommentaryRewriteStatusSnapshot[]) {
  const indexes = appliedIds.map((id) => ledgerStatuses.findIndex((entry) => entry.commentaryId === id));
  if (indexes.some((index) => index < 0)) throw new Error("Submission applied_ids contain an ID missing from the current ledger");
  if (indexes.some((index, position) => position > 0 && index <= indexes[position - 1]!)) {
    throw new Error("Submission applied_ids must use canonical ledger order");
  }
}

function acceptedLedger(content: string, appliedIds: string[]) {
  let prospective = content;
  for (const id of appliedIds) {
    const block = commentaryMarkdownBlocks(prospective).find((candidate) => candidate.commentaryId === id);
    if (!block) throw new Error(`Cannot accept missing commentary block ${id}`);
    if (fieldValue(block.content, "review_status") !== "unreviewed") {
      throw new Error(`Commentary block ${id} must be unreviewed before rewrite acceptance`);
    }
    const matches = prospective.split(block.fullMatch).length - 1;
    if (matches !== 1) throw new Error(`Cannot accept ${id}: expected one canonical block, found ${matches}`);
    const replacement = block.fullMatch.replace(/^review_status:\s*unreviewed\s*$/mu, "review_status: accepted");
    if (replacement === block.fullMatch) throw new Error(`Commentary block ${id} has no exact review_status field`);
    prospective = prospective.replace(block.fullMatch, replacement);
  }
  return prospective;
}

function receiptPath(input: CommentaryRewriteReviewInput, submission: TrackedSubmission) {
  return `wiki/review/${input.reviewedOn}-commentary-rewrite-${input.dialogue}-${submission.submission_id}-acceptance.md`;
}

function renderReceipt(
  input: CommentaryRewriteReviewInput,
  submission: TrackedSubmission,
  recordPath: string,
  statuses: CommentaryRewriteStatusSnapshot[],
  ledgerSha: string,
  unacceptedAppliedIds: string[],
) {
  return [
    "# Commentary rewrite acceptance",
    "",
    `dialogue: ${input.dialogue}`,
    "decision: accepted",
    `submission_id: ${submission.submission_id}`,
    `submission_record_path: ${recordPath}`,
    `submission_record_sha256: ${input.submissionRecordSha256}`,
    `submission_kind: ${submission.kind}`,
    `target_path: ${submission.target_path}`,
    `target_sha256_before: ${input.targetSha256Before}`,
    `target_sha256_after: ${input.targetSha256After}`,
    `post_rewrite_ledger_sha256: ${ledgerSha}`,
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    `rationale: ${input.rationale}`,
    COMMENTARY_REWRITE_REVIEW_BASIS,
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    "applied_commentary_ids:",
    ...input.appliedIds.map((id) => `- ${id}`),
    "unaccepted_applied_ids:",
    ...unacceptedAppliedIds.map((id) => `- ${id}`),
    "post_rewrite_statuses:",
    ...statuses.map((entry) => `- ${entry.commentaryId}: ${entry.reviewStatus}`),
    "",
  ].join("\n");
}

function buildPreview(input: CommentaryRewriteReviewInput): CommentaryRewriteAcceptancePreview {
  validateInput(input);
  const tracked = loadTrackedSubmission(input);
  validateReviewedSubset(input.appliedIds, tracked.record.applied_ids);
  const unacceptedAppliedIds = tracked.record.applied_ids.filter((id) => !input.appliedIds.includes(id));
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
  const currentLedgerSha = sha256(currentLedger);
  if (currentLedgerSha !== input.postRewriteLedgerSha256) {
    throw new Error("Current post-rewrite ledger hash drifted from the canonical submission");
  }
  // A later exceptional block review may have changed unrelated IDs. Verify its
  // complete receipt chain, but keep those current statuses in the prospective
  // rewrite ledger; only the submitted IDs are changed below.
  if (currentLedgerSha !== input.targetSha256After) {
    verifyCommentaryBlockReviewChain(input.dialogue, currentLedger, input.targetSha256After, input.appliedIds);
  }
  const validationIssues = validateCommentaryLedger(ledgerPath, currentLedger);
  if (validationIssues.length > 0) throw new Error(formatCommentaryLedgerValidationError(validationIssues));
  const statuses = ledgerStatusSnapshot(currentLedger);
  const boundStatuses = validateStatusBinding(input, statuses);
  assertCanonicalOrder(input.appliedIds, statuses);
  for (const id of input.appliedIds) {
    if (statuses.find((entry) => entry.commentaryId === id)?.reviewStatus !== "unreviewed") {
      throw new Error(`Commentary block ${id} must be unreviewed before rewrite acceptance`);
    }
  }
  const prospectiveLedger = acceptedLedger(currentLedger, input.appliedIds);
  const prospectiveIssues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (prospectiveIssues.length > 0) throw new Error(formatCommentaryLedgerValidationError(prospectiveIssues));
  const targetReceiptPath = receiptPath(input, tracked.record);
  const receipt = renderReceipt(
    input,
    tracked.record,
    tracked.normalized.relativePath,
    boundStatuses,
    currentLedgerSha,
    unacceptedAppliedIds,
  );
  return {
    applied: false,
    dialogue: input.dialogue,
    submissionRecordPath: tracked.normalized.relativePath,
    submissionRecordSha256: tracked.digest,
    receiptPath: targetReceiptPath,
    receipt,
    ledgerPath,
    ledgerSha256BeforeAcceptance: currentLedgerSha,
    ledgerSha256AfterAcceptance: sha256(prospectiveLedger),
    appliedIds: [...input.appliedIds],
    unacceptedAppliedIds,
    prospectiveLedger,
  };
}

export function previewCommentaryRewriteAcceptance(input: CommentaryRewriteReviewInput) {
  return buildPreview(input);
}

export function applyCommentaryRewriteAcceptance(input: CommentaryRewriteReviewInput): CommentaryRewriteAcceptanceApply {
  validateInput(input);
  const firstTracked = loadTrackedSubmission(input);
  const targetReceiptPath = receiptPath(input, firstTracked.record);
  return withRepoWriteLock(
    {
      paths: [targetReceiptPath, `wiki/commentary/${input.dialogue}.md`, firstTracked.normalized.relativePath],
      label: `commentary-rewrite-acceptance:${input.dialogue}:${firstTracked.record.submission_id}`,
    },
    () => {
      const absoluteReceiptPath = join(getRepoRoot(), targetReceiptPath);
      if (existsSync(absoluteReceiptPath)) throw new Error(`Refusing to overwrite existing canonical receipt ${targetReceiptPath}`);
      const preview = buildPreview(input);
      if (preview.receiptPath !== targetReceiptPath) {
        throw new Error("Canonical submission record changed while acquiring the rewrite acceptance lock");
      }
      const absoluteLedgerPath = join(getRepoRoot(), preview.ledgerPath);
      const ledgerTempPath = `${absoluteLedgerPath}.tmp-${process.pid}`;
      const receiptTempPath = `${absoluteReceiptPath}.tmp-${process.pid}`;
      try {
        mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
        writeFileSync(ledgerTempPath, preview.prospectiveLedger, "utf8");
        writeFileSync(receiptTempPath, preview.receipt, "utf8");
        renameSync(receiptTempPath, absoluteReceiptPath);
        try {
          renameSync(ledgerTempPath, absoluteLedgerPath);
        } catch (error) {
          rmSync(absoluteReceiptPath, { force: true });
          throw error;
        }
      } catch (error) {
        rmSync(ledgerTempPath, { force: true });
        rmSync(receiptTempPath, { force: true });
        throw error;
      }
      return { ...preview, applied: true };
    },
  );
}

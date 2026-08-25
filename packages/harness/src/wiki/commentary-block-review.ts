import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot } from "../paths.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import {
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
} from "./commentary-quality-audit.js";
import { formatCommentaryLedgerValidationError, validateCommentaryLedger } from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const MAX_RATIONALE_LENGTH = 300;
const COMMENTARY_BLOCK_REVIEW_BASIS = "review_basis: operator-delegated independent Luna block review";

export type CommentaryBlockReviewDecision = "accepted" | "rejected";

export type CommentaryBlockReviewInput = {
  dialogue: string;
  decision: CommentaryBlockReviewDecision;
  reviewer: string;
  reviewedOn: string;
  rationale: string;
  reviewedIds: string[];
};

export type CommentaryBlockReviewPreview = {
  applied: false;
  dialogue: string;
  decision: CommentaryBlockReviewDecision;
  ledgerPath: string;
  receiptPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  reviewedIds: string[];
  prospectiveLedger: string;
  receipt: string;
};

export type CommentaryBlockReviewApply = Omit<CommentaryBlockReviewPreview, "applied"> & { applied: true };

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function receiptPath(input: CommentaryBlockReviewInput, ledgerSha256Before: string) {
  const reviewKey = sha256(
    `${input.decision}\n${input.reviewedIds.join("\n")}\n${ledgerSha256Before}`,
  ).slice(0, 12);
  return `wiki/review/${input.reviewedOn}-commentary-block-review-${input.dialogue}-${input.decision}-${reviewKey}.md`;
}

function validateInput(input: CommentaryBlockReviewInput) {
  if (!DIALOGUE.test(input.dialogue)) throw new Error(`Invalid dialogue slug: ${input.dialogue}`);
  if (input.decision !== "accepted" && input.decision !== "rejected") {
    throw new Error("decision must be accepted or rejected");
  }
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
  if (!Array.isArray(input.reviewedIds) || input.reviewedIds.length === 0) {
    throw new Error("reviewedIds must be explicitly provided and non-empty");
  }
  if (input.reviewedIds.some((id) => !COMMENTARY_ID.test(id))) {
    throw new Error("reviewedIds must contain only valid commentary IDs");
  }
  if (new Set(input.reviewedIds).size !== input.reviewedIds.length) {
    throw new Error("reviewedIds must be unique");
  }
}

function renderReceipt(input: CommentaryBlockReviewInput, before: string, after: string) {
  return [
    "# Commentary block review",
    "",
    `dialogue: ${input.dialogue}`,
    `decision: ${input.decision}`,
    `ledger_path: wiki/commentary/${input.dialogue}.md`,
    `ledger_sha256_before: ${before}`,
    `ledger_sha256_after: ${after}`,
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    `rationale: ${input.rationale}`,
    COMMENTARY_BLOCK_REVIEW_BASIS,
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    "reviewed_commentary_ids:",
    ...input.reviewedIds.map((id) => `- ${id}`),
    "",
  ].join("\n");
}

function buildPreview(input: CommentaryBlockReviewInput): CommentaryBlockReviewPreview {
  validateInput(input);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const ledger = readFileSync(absoluteLedgerPath, "utf8");
  const issues = validateCommentaryLedger(ledgerPath, ledger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  const blocks = commentaryMarkdownBlocks(ledger);
  const ledgerIds = blocks.map((block) => block.commentaryId ?? fieldValue(block.content, "commentary_id") ?? "");
  const positions = input.reviewedIds.map((id) => ledgerIds.indexOf(id));
  if (positions.some((position) => position < 0)) throw new Error("reviewedIds must contain only IDs from the current ledger");
  if (positions.some((position, index) => index > 0 && position <= positions[index - 1]!)) {
    throw new Error("reviewedIds must use canonical ledger order");
  }
  for (const id of input.reviewedIds) {
    const block = blocks.find((candidate) => candidate.commentaryId === id);
    if (!block || fieldValue(block.content, "review_status") !== "unreviewed") {
      throw new Error(`Commentary block ${id} must currently be unreviewed`);
    }
  }
  let prospectiveLedger = ledger;
  for (const id of input.reviewedIds) {
    const block = commentaryMarkdownBlocks(prospectiveLedger).find((candidate) => candidate.commentaryId === id);
    if (!block) throw new Error(`Cannot review missing commentary block ${id}`);
    const replacement = block.fullMatch.replace(
      /^review_status:\s*unreviewed\s*$/mu,
      `review_status: ${input.decision}`,
    );
    if (replacement === block.fullMatch) throw new Error(`Commentary block ${id} has no exact review_status field`);
    prospectiveLedger = prospectiveLedger.replace(block.fullMatch, replacement);
  }
  const prospectiveIssues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (prospectiveIssues.length > 0) throw new Error(formatCommentaryLedgerValidationError(prospectiveIssues));
  const before = sha256(ledger);
  const after = sha256(prospectiveLedger);
  return {
    applied: false,
    dialogue: input.dialogue,
    decision: input.decision,
    ledgerPath,
    receiptPath: receiptPath(input, before),
    ledgerSha256Before: before,
    ledgerSha256After: after,
    reviewedIds: [...input.reviewedIds],
    prospectiveLedger,
    receipt: renderReceipt(input, before, after),
  };
}

export function previewCommentaryBlockReview(input: CommentaryBlockReviewInput) {
  return buildPreview(input);
}

export function applyCommentaryBlockReview(input: CommentaryBlockReviewInput): CommentaryBlockReviewApply {
  validateInput(input);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const targetReceiptPath = receiptPath(input, sha256(readFileSync(absoluteLedgerPath)));
  return withRepoWriteLock(
    { paths: [ledgerPath, targetReceiptPath], label: `commentary-block-review:${input.dialogue}` },
    () => {
      const absoluteReceiptPath = join(getRepoRoot(), targetReceiptPath);
      if (existsSync(absoluteReceiptPath)) throw new Error(`Refusing to overwrite existing canonical receipt ${targetReceiptPath}`);
      const preview = buildPreview(input);
      if (preview.receiptPath !== targetReceiptPath) {
        throw new Error(`Commentary ledger drift changed the canonical receipt path for ${input.dialogue}`);
      }
      const ledgerTempPath = `${absoluteLedgerPath}.tmp-${process.pid}`;
      const receiptTempPath = `${absoluteReceiptPath}.tmp-${process.pid}`;
      try {
        mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
        writeFileSync(receiptTempPath, preview.receipt, "utf8");
        writeFileSync(ledgerTempPath, preview.prospectiveLedger, "utf8");
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

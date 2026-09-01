import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { resolveAudioInsertionBoundary, renderAudioInsertionLines, type AudioInsertionBoundary } from "../audio-insertion.js";
import { buildCommentaryAuditBriefs, parseCommentaryQualityAudit } from "../commentary-audit.js";
import { commentaryApplyLockScope } from "../commentary-drafts.js";
import {
  validateCurrentCommentaryAuditArtifact,
  validateCurrentCommentaryAuditArtifacts,
} from "../commentary-campaign.js";
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot, normalizeRepoPath } from "../paths.js";
import { recordSubmission } from "../submissions.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import {
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
} from "./commentary-quality-audit.js";
import { formatCommentaryLedgerValidationError, validateCommentaryLedger } from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const UNIT_KEY = /^[a-z0-9][a-z0-9-]*$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const MAX_RATIONALE_LENGTH = 300;
const AUDIT_OUTPUT_PREFIX = "scratch/commentary/audits/";

export type CommentaryStructuralRemediationOperation = {
  operation: "reanchor" | "remove" | "split";
  commentaryId: string;
  /** Required for reanchor; forbidden for remove except split-to-reject resolution. */
  audioInsertion?: AudioInsertionBoundary;
  /** Required exactly when removing the original block for an audit split finding. */
  splitResolution?: "reject-original";
  /** Required exactly when removing the original block for an audit rewrite finding. */
  rewriteResolution?: "reject-original";
};

export type CommentaryStructuralAuditFinding = {
  commentaryId: string;
  disposition: "remove" | "rewrite" | "split";
  splitResolution?: "reject-original";
  rewriteResolution?: "reject-original";
};

export type CommentaryStructuralRemediationInput = {
  dialogue: string;
  unitKey: string;
  sectionId: string;
  /** The exact provider output being adjudicated. */
  auditOutputPath: string;
  auditOutputSha256: string;
  /** Exact current canonical ledger and source-plan bindings. */
  expectedLedgerSha256: string;
  expectedAttributionSha256: string;
  expectedEnglishSha256: string;
  operations: CommentaryStructuralRemediationOperation[];
  reviewer: string;
  reviewedOn: string;
  rationale: string;
};

export type CommentaryStructuralRemediationPreview = {
  applied: false;
  dialogue: string;
  unitKey: string;
  sectionId: string;
  auditOutputPath: string;
  auditOutputSha256: string;
  ledgerPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  expectedAttributionSha256: string;
  expectedEnglishSha256: string;
  operations: CommentaryStructuralRemediationOperation[];
  auditFindings: CommentaryStructuralAuditFinding[];
  prospectiveLedger: string;
  receiptPath: string;
  receipt: string;
};

export type CommentaryStructuralRemediationApply = Omit<
  CommentaryStructuralRemediationPreview,
  "applied" | "receipt"
> & {
  applied: true;
  submissionRecordPath: string;
  submissionRecordSha256: string;
  receipt: string;
};

export type CommentaryStructuralRemediationBatchOperation = {
  operation: "remove";
  commentaryId: string;
  /** Required exactly when a rewrite finding is conservatively rejected. */
  rewriteResolution?: "reject-original";
};

export type CommentaryStructuralRemediationBatchUnit = {
  unitKey: string;
  sectionId: string;
  auditOutputPath: string;
  auditOutputSha256: string;
  operations: CommentaryStructuralRemediationBatchOperation[];
};

export type CommentaryStructuralRemediationBatchInput = {
  schemaVersion: 1;
  dialogue: string;
  /** Scratch candidate whose exact contents are preserved in the submission. */
  candidatePath: string;
  expectedLedgerSha256: string;
  expectedAttributionSha256: string;
  expectedEnglishSha256: string;
  /** Every current audit unit, in deterministic current-unit order. */
  auditUnits: CommentaryStructuralRemediationBatchUnit[];
  reviewer: string;
  reviewedOn: string;
  rationale: string;
};

export type CommentaryStructuralRemediationBatchPreview = {
  applied: false;
  dialogue: string;
  candidatePath: string;
  ledgerPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  expectedAttributionSha256: string;
  expectedEnglishSha256: string;
  auditUnits: CommentaryStructuralRemediationBatchUnit[];
  operations: CommentaryStructuralRemediationBatchOperation[];
  auditFindings: CommentaryStructuralAuditFinding[];
  prospectiveLedger: string;
  receiptPath: string;
  receipt: string;
};

export type CommentaryStructuralRemediationBatchApply = Omit<
  CommentaryStructuralRemediationBatchPreview,
  "applied" | "receipt"
> & {
  applied: true;
  submissionRecordPath: string;
  submissionRecordSha256: string;
  receipt: string;
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isAudioBoundary(value: unknown): value is AudioInsertionBoundary {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateInput(input: CommentaryStructuralRemediationInput) {
  if (!DIALOGUE.test(input.dialogue)) throw new Error(`Invalid dialogue slug: ${input.dialogue}`);
  if (!UNIT_KEY.test(input.unitKey)) throw new Error(`Invalid unit key: ${input.unitKey}`);
  if (!COMMENTARY_ID.test(input.sectionId)) throw new Error(`Invalid section id: ${input.sectionId}`);
  if (!SHA256.test(input.auditOutputSha256)) throw new Error("auditOutputSha256 must be a lowercase SHA-256 digest");
  for (const [name, value] of [
    ["expectedLedgerSha256", input.expectedLedgerSha256],
    ["expectedAttributionSha256", input.expectedAttributionSha256],
    ["expectedEnglishSha256", input.expectedEnglishSha256],
  ] as const) {
    if (!SHA256.test(value)) throw new Error(`${name} must be a lowercase SHA-256 digest`);
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
  if (!Array.isArray(input.operations) || input.operations.length === 0) {
    throw new Error("operations must be a non-empty array");
  }
  const ids = input.operations.map((operation) => operation.commentaryId);
  if (new Set(ids).size !== ids.length) throw new Error("operations must contain unique commentary IDs");
  for (const operation of input.operations) {
    if (!COMMENTARY_ID.test(operation.commentaryId)) throw new Error(`Invalid commentary ID: ${operation.commentaryId}`);
    if (!["reanchor", "remove", "split"].includes(operation.operation)) {
      throw new Error(`Unsupported structural remediation operation: ${String(operation.operation)}`);
    }
    if (operation.operation === "split") {
      throw new Error("split structural remediation is explicitly unsupported; remove the block or submit a reviewed split design");
    }
    if (operation.splitResolution !== undefined && operation.splitResolution !== "reject-original") {
      throw new Error(`splitResolution for ${operation.commentaryId} must be exactly reject-original`);
    }
    if (operation.rewriteResolution !== undefined && operation.rewriteResolution !== "reject-original") {
      throw new Error(`rewriteResolution for ${operation.commentaryId} must be exactly reject-original`);
    }
    if (operation.operation !== "remove" && operation.splitResolution !== undefined) {
      throw new Error(`splitResolution is only allowed on remove operation ${operation.commentaryId}`);
    }
    if (operation.operation !== "remove" && operation.rewriteResolution !== undefined) {
      throw new Error(`rewriteResolution is only allowed on remove operation ${operation.commentaryId}`);
    }
    if (operation.splitResolution !== undefined && operation.rewriteResolution !== undefined) {
      throw new Error(`splitResolution and rewriteResolution are mutually exclusive for ${operation.commentaryId}`);
    }
    if (operation.operation === "reanchor" && !isAudioBoundary(operation.audioInsertion)) {
      throw new Error(`reanchor operation for ${operation.commentaryId} requires audioInsertion`);
    }
    if (operation.operation !== "reanchor" && operation.audioInsertion !== undefined) {
      throw new Error(`audioInsertion is only allowed for reanchor operation ${operation.commentaryId}`);
    }
    if (operation.operation === "reanchor" && operation.splitResolution !== undefined) {
      throw new Error(`splitResolution is only allowed on remove operation ${operation.commentaryId}`);
    }
  }
}

function auditOutputPath(input: CommentaryStructuralRemediationInput) {
  const normalized = normalizeRepoPath(input.auditOutputPath);
  if (normalized.relativePath !== input.auditOutputPath) {
    throw new Error(`auditOutputPath must be canonical repo-relative path: ${normalized.relativePath}`);
  }
  const expectedPrefix = `${AUDIT_OUTPUT_PREFIX}${input.dialogue}/`;
  if (!normalized.relativePath.startsWith(expectedPrefix) || !normalized.relativePath.endsWith(".json")) {
    throw new Error(`auditOutputPath must be a JSON output under ${expectedPrefix}`);
  }
  return normalized;
}

function loadAudit(input: CommentaryStructuralRemediationInput) {
  const normalized = auditOutputPath(input);
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing audit output ${normalized.relativePath}`);
  const content = readFileSync(normalized.absolutePath);
  const digest = sha256(content);
  if (digest !== input.auditOutputSha256) throw new Error(`Audit output hash mismatch for ${normalized.relativePath}`);
  let value: unknown;
  try {
    value = JSON.parse(content.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed audit output ${normalized.relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const audit = parseCommentaryQualityAudit(value, { path: normalized.relativePath });
  if (audit.dialogue !== input.dialogue || audit.unit_key !== input.unitKey || audit.section_id !== input.sectionId) {
    throw new Error("Audit output identity does not match the structural remediation candidate");
  }
  return { normalized, content, audit };
}

function blockId(block: { commentaryId: string | undefined; content: string }) {
  return block.commentaryId ?? fieldValue(block.content, "commentary_id") ?? "";
}

function replaceAudioInsertion(content: string, insertion: AudioInsertionBoundary) {
  const lines = content.split("\n");
  const start = lines.findIndex((line) => /^audio_insertion:\s*$/u.test(line));
  const rendered = renderAudioInsertionLines(insertion);
  if (start >= 0) {
    let end = start + 1;
    while (end < lines.length && (/^\s{2}/u.test(lines[end]!) || lines[end]!.trim() === "")) end += 1;
    lines.splice(start, end - start, ...rendered);
  } else {
    const insertionPoint = lines.findIndex((line) => /^(?:body|cites|crossrefs|author|review_status):/u.test(line));
    if (insertionPoint < 0) throw new Error("Cannot insert audio_insertion into malformed commentary block");
    lines.splice(insertionPoint, 0, ...rendered);
  }
  return lines.join("\n");
}

function withoutAudioInsertion(content: string) {
  const lines = content.split("\n");
  const start = lines.findIndex((line) => /^audio_insertion:\s*$/u.test(line));
  if (start < 0) return content;
  let end = start + 1;
  while (end < lines.length && (/^\s{2}/u.test(lines[end]!) || lines[end]!.trim() === "")) end += 1;
  lines.splice(start, end - start);
  return lines.join("\n");
}

function receiptPath(input: CommentaryStructuralRemediationInput) {
  const candidateHash = sha256(JSON.stringify(input)).slice(0, 12);
  return `wiki/review/${input.reviewedOn}-commentary-structural-remediation-${input.dialogue}-${input.unitKey}-${candidateHash}.md`;
}

function renderReceipt(
  input: CommentaryStructuralRemediationInput,
  preview: Omit<CommentaryStructuralRemediationPreview, "receipt">,
  submissionRecordPath?: string,
) {
  return [
    "# Commentary structural remediation",
    "",
    `dialogue: ${input.dialogue}`,
    `unit_key: ${input.unitKey}`,
    `section_id: ${input.sectionId}`,
    `audit_output_path: ${input.auditOutputPath}`,
    `audit_output_sha256: ${input.auditOutputSha256}`,
    `ledger_path: ${preview.ledgerPath}`,
    `ledger_sha256_before: ${preview.ledgerSha256Before}`,
    `ledger_sha256_after: ${preview.ledgerSha256After}`,
    `attribution_sha256: ${input.expectedAttributionSha256}`,
    `english_sha256: ${input.expectedEnglishSha256}`,
    ...(submissionRecordPath ? [`submission_record_path: ${submissionRecordPath}`] : []),
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    `rationale: ${input.rationale}`,
    "review_basis: operator-delegated independent Luna structural remediation review",
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    "operations:",
    ...input.operations.flatMap((operation) => [
      `- operation: ${operation.operation}`,
      `  commentary_id: ${operation.commentaryId}`,
      `  audited_disposition: ${preview.auditFindings.find((finding) => finding.commentaryId === operation.commentaryId)?.disposition ?? "unknown"}`,
      ...(operation.splitResolution ? [`  split_resolution: ${operation.splitResolution}`] : []),
      ...(operation.rewriteResolution ? [`  rewrite_resolution: ${operation.rewriteResolution}`] : []),
      ...(operation.audioInsertion ? [
        `  turn_id: ${operation.audioInsertion.turn_id}`,
        `  edge: ${operation.audioInsertion.edge}`,
        ...(operation.audioInsertion.char_offset === undefined ? [] : [`  char_offset: ${operation.audioInsertion.char_offset}`]),
      ] : []),
    ]),
    "",
  ].join("\n");
}

function buildPreview(input: CommentaryStructuralRemediationInput): CommentaryStructuralRemediationPreview {
  validateInput(input);
  validateCurrentCommentaryAuditArtifact({
    dialogue: input.dialogue,
    unitKey: input.unitKey,
    outputPath: input.auditOutputPath,
    outputSha256: input.auditOutputSha256,
  });
  const { normalized, audit } = loadAudit(input);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const ledger = readFileSync(absoluteLedgerPath, "utf8");
  const ledgerDigest = sha256(ledger);
  if (ledgerDigest !== input.expectedLedgerSha256) throw new Error("Current commentary ledger hash does not match candidate binding");
  const issues = validateCommentaryLedger(ledgerPath, ledger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  const attributionPath = join(getRepoRoot(), `audio/speaker-attributions/${input.dialogue}.json`);
  const englishPath = join(getRepoRoot(), `raw/plato/english/${input.dialogue}.txt`);
  if (!existsSync(attributionPath) || !existsSync(englishPath)) throw new Error("Current source files required for structural remediation are missing");
  if (sha256(readFileSync(attributionPath)) !== input.expectedAttributionSha256) throw new Error("Current attribution hash does not match candidate binding");
  if (sha256(readFileSync(englishPath)) !== input.expectedEnglishSha256) throw new Error("Current English source hash does not match candidate binding");

  const blocks = commentaryMarkdownBlocks(ledger);
  const ids = blocks.map(blockId);
  const operations = input.operations.map((operation) => ({ operation, index: ids.indexOf(operation.commentaryId) }));
  if (operations.some(({ index }) => index < 0)) throw new Error("Every remediation commentary ID must be present in the current ledger");
  if (operations.some(({ index }, position) => position > 0 && index <= operations[position - 1]!.index)) {
    throw new Error("operations must use canonical current-ledger order");
  }

  let prospectiveLedger = ledger;
  for (const { operation } of operations) {
    const auditBlock = audit.blocks.find((candidate) => candidate.commentary_id === operation.commentaryId);
    if (!auditBlock) throw new Error(`Audit output does not contain ${operation.commentaryId}`);
    if (auditBlock.disposition !== "remove" && auditBlock.disposition !== "rewrite" && auditBlock.disposition !== "split") {
      throw new Error(`${operation.commentaryId} is not a current remove, rewrite, or split finding`);
    }
    if (auditBlock.disposition === "split") {
      if (operation.rewriteResolution !== undefined) {
        throw new Error(`${operation.commentaryId} rewriteResolution reject-original is only valid for rewrite findings`);
      }
      if (operation.operation !== "remove" || operation.splitResolution !== "reject-original") {
        throw new Error(`${operation.commentaryId} split finding requires remove with splitResolution reject-original`);
      }
    }
    if (auditBlock.disposition === "rewrite") {
      if (operation.splitResolution !== undefined) {
        throw new Error(`${operation.commentaryId} splitResolution reject-original is only valid for split findings`);
      }
      if (operation.operation !== "remove" || operation.rewriteResolution !== "reject-original") {
        throw new Error(`${operation.commentaryId} rewrite finding requires remove with rewriteResolution reject-original`);
      }
    }
    if (auditBlock.disposition === "remove") {
      if (operation.splitResolution !== undefined) {
        throw new Error(`${operation.commentaryId} splitResolution reject-original is only valid for split findings`);
      }
      if (operation.rewriteResolution !== undefined) {
        throw new Error(`${operation.commentaryId} rewriteResolution reject-original is only valid for rewrite findings`);
      }
    }
    const currentBlock = commentaryMarkdownBlocks(prospectiveLedger).find((candidate) => blockId(candidate) === operation.commentaryId);
    if (!currentBlock) throw new Error(`Cannot remediate missing commentary block ${operation.commentaryId}`);
    if (fieldValue(currentBlock.content, "review_status") !== "accepted") {
      throw new Error(`${operation.commentaryId} must currently be accepted for structural remediation`);
    }
    if (operation.operation === "reanchor") {
      if (auditBlock.checks.evidence.verdict !== "pass" || auditBlock.checks.listening.verdict !== "pass" || auditBlock.checks.placement.verdict !== "fail") {
        throw new Error(`Reanchor ${operation.commentaryId} requires evidence/listening pass and placement fail`);
      }
      const insertion = operation.audioInsertion!;
      if (insertion.attribution_sha256 !== input.expectedAttributionSha256 || insertion.english_sha256 !== input.expectedEnglishSha256) {
        throw new Error(`Reanchor ${operation.commentaryId} must bind the candidate's current source hashes`);
      }
      const placement = fieldValue(currentBlock.content, "placement");
      const blockKind = fieldValue(currentBlock.content, "block_kind");
      if (placement !== "before" && placement !== "after") throw new Error(`${operation.commentaryId} has invalid placement`);
      resolveAudioInsertionBoundary(input.dialogue, insertion, blockKind === "section" ? undefined : placement);
      const changedContent = replaceAudioInsertion(currentBlock.content, insertion);
      if (withoutAudioInsertion(changedContent) !== withoutAudioInsertion(currentBlock.content)) {
        throw new Error(`Reanchor ${operation.commentaryId} changed fields other than audio_insertion`);
      }
      prospectiveLedger = prospectiveLedger.replace(currentBlock.fullMatch, currentBlock.fullMatch.replace(currentBlock.content, changedContent));
    } else {
      const replacement = currentBlock.fullMatch.replace(/^review_status:\s*accepted\s*$/mu, "review_status: rejected");
      if (replacement === currentBlock.fullMatch) throw new Error(`Cannot reject ${operation.commentaryId}: exact accepted review_status is missing`);
      prospectiveLedger = prospectiveLedger.replace(currentBlock.fullMatch, replacement);
    }
  }
  const prospectiveIssues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (prospectiveIssues.length > 0) throw new Error(formatCommentaryLedgerValidationError(prospectiveIssues));
  const acceptedCount = commentaryMarkdownBlocks(prospectiveLedger)
    .filter((block) => fieldValue(block.content, "review_status") === "accepted")
    .length;
  if (acceptedCount === 0) {
    throw new Error("Structural remediation must retain at least one accepted commentary block");
  }
  const previewWithoutReceipt = {
    applied: false as const,
    dialogue: input.dialogue,
    unitKey: input.unitKey,
    sectionId: input.sectionId,
    auditOutputPath: normalized.relativePath,
    auditOutputSha256: input.auditOutputSha256,
    ledgerPath,
    ledgerSha256Before: ledgerDigest,
    ledgerSha256After: sha256(prospectiveLedger),
    expectedAttributionSha256: input.expectedAttributionSha256,
    expectedEnglishSha256: input.expectedEnglishSha256,
    operations: input.operations.map((operation) => ({ ...operation, ...(operation.audioInsertion ? { audioInsertion: { ...operation.audioInsertion } } : {}) })),
    auditFindings: input.operations.map((operation) => {
      const finding = audit.blocks.find((candidate) => candidate.commentary_id === operation.commentaryId);
      if (!finding || (finding.disposition !== "remove" && finding.disposition !== "rewrite" && finding.disposition !== "split")) {
        throw new Error(`Missing structural audit finding for ${operation.commentaryId}`);
      }
      return {
        commentaryId: operation.commentaryId,
        disposition: finding.disposition,
        ...(operation.splitResolution ? { splitResolution: operation.splitResolution } : {}),
        ...(operation.rewriteResolution ? { rewriteResolution: operation.rewriteResolution } : {}),
      };
    }),
    prospectiveLedger,
    receiptPath: receiptPath(input),
  };
  return { ...previewWithoutReceipt, receipt: renderReceipt(input, previewWithoutReceipt) };
}

export function previewCommentaryStructuralRemediation(input: CommentaryStructuralRemediationInput) {
  return buildPreview(input);
}

export function applyCommentaryStructuralRemediation(input: CommentaryStructuralRemediationInput): CommentaryStructuralRemediationApply {
  validateInput(input);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const targetReceiptPath = receiptPath(input);
  return withRepoWriteLock(commentaryApplyLockScope(input.dialogue, "commentary-structural-remediation"), () => {
    const absoluteReceiptPath = join(getRepoRoot(), targetReceiptPath);
    if (existsSync(absoluteReceiptPath)) throw new Error(`Refusing to overwrite existing structural remediation receipt ${targetReceiptPath}`);
    const preview = buildPreview(input);
    const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
    const ledgerBefore = readFileSync(absoluteLedgerPath, "utf8");
    const ledgerTempPath = `${absoluteLedgerPath}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
    const receiptTempPath = `${absoluteReceiptPath}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
    let submissionPath: string | undefined;
    try {
      mkdirSync(dirname(absoluteLedgerPath), { recursive: true });
      writeFileSync(ledgerTempPath, preview.prospectiveLedger, "utf8");
      renameSync(ledgerTempPath, absoluteLedgerPath);
      const submission = recordSubmission({
        lane: "commentary",
        kind: "structural-remediation",
        scope: input.dialogue,
        unitKey: input.unitKey,
        sourcePath: preview.auditOutputPath,
        targetPath: ledgerPath,
        targetContentBefore: ledgerBefore,
        targetContentAfter: preview.prospectiveLedger,
        appliedIds: input.operations.map((operation) => operation.commentaryId),
        submission: {
          candidate: input,
          audit_output_path: preview.auditOutputPath,
          audit_output_sha256: input.auditOutputSha256,
          audit_findings: preview.auditFindings,
        },
      });
      submissionPath = submission.path;
      const receipt = renderReceipt(input, preview, submission.path);
      mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
      writeFileSync(receiptTempPath, receipt, "utf8");
      renameSync(receiptTempPath, absoluteReceiptPath);
      const recordContent = readFileSync(join(getRepoRoot(), submission.path));
      return {
        ...preview,
        applied: true,
        submissionRecordPath: submission.path,
        submissionRecordSha256: sha256(recordContent),
        receipt,
      };
    } catch (error) {
      rmSync(ledgerTempPath, { force: true });
      rmSync(receiptTempPath, { force: true });
      rmSync(absoluteReceiptPath, { force: true });
      if (submissionPath) rmSync(join(getRepoRoot(), submissionPath), { force: true });
      if (existsSync(absoluteLedgerPath)) {
        const rollbackPath = `${absoluteLedgerPath}.rollback-${process.pid}-${Math.random().toString(16).slice(2)}`;
        try {
          writeFileSync(rollbackPath, ledgerBefore, "utf8");
          renameSync(rollbackPath, absoluteLedgerPath);
        } finally {
          rmSync(rollbackPath, { force: true });
        }
      }
      throw error;
    }
  });
}

function validateBatchInput(input: CommentaryStructuralRemediationBatchInput) {
  if (input.schemaVersion !== 1) throw new Error("Structural remediation batch schemaVersion must be 1");
  if (!DIALOGUE.test(input.dialogue)) throw new Error(`Invalid dialogue slug: ${input.dialogue}`);
  const normalizedCandidate = normalizeRepoPath(input.candidatePath);
  const candidatePrefix = `scratch/commentary/structural-remediation/${input.dialogue}/`;
  if (
    normalizedCandidate.relativePath !== input.candidatePath
    || !input.candidatePath.startsWith(candidatePrefix)
    || !input.candidatePath.endsWith(".json")
  ) {
    throw new Error(`candidatePath must be a canonical JSON path under ${candidatePrefix}`);
  }
  for (const [name, value] of [
    ["expectedLedgerSha256", input.expectedLedgerSha256],
    ["expectedAttributionSha256", input.expectedAttributionSha256],
    ["expectedEnglishSha256", input.expectedEnglishSha256],
  ] as const) {
    if (!SHA256.test(value)) throw new Error(`${name} must be a lowercase SHA-256 digest`);
  }
  if (!isDelegatedLunaReviewer(input.reviewer)) {
    throw new Error("reviewer must identify an operator-delegated Luna reviewer");
  }
  if (!validDate(input.reviewedOn)) throw new Error("reviewedOn must be a valid YYYY-MM-DD date");
  if (
    input.rationale.trim().length === 0
    || input.rationale !== input.rationale.trim()
    || input.rationale.length > MAX_RATIONALE_LENGTH
    || /[\r\n]/u.test(input.rationale)
  ) {
    throw new Error(`rationale must be one non-empty line of at most ${MAX_RATIONALE_LENGTH} characters`);
  }
  if (containsHumanListeningOrReviewClaim(input.rationale)) {
    throw new Error("rationale must not claim human listening or human review");
  }
  if (!Array.isArray(input.auditUnits) || input.auditUnits.length === 0) {
    throw new Error("auditUnits must contain every current dialogue audit unit");
  }
  const unitKeys = new Set<string>();
  const operationIds = new Set<string>();
  let operationCount = 0;
  for (const unit of input.auditUnits) {
    if (!UNIT_KEY.test(unit.unitKey)) throw new Error(`Invalid unit key: ${unit.unitKey}`);
    if (!COMMENTARY_ID.test(unit.sectionId)) throw new Error(`Invalid section id: ${unit.sectionId}`);
    if (!SHA256.test(unit.auditOutputSha256)) throw new Error(`Invalid audit output hash for ${unit.unitKey}`);
    if (unitKeys.has(unit.unitKey)) throw new Error(`Duplicate audit unit: ${unit.unitKey}`);
    unitKeys.add(unit.unitKey);
    if (!Array.isArray(unit.operations)) throw new Error(`operations must be an array for ${unit.unitKey}`);
    for (const operation of unit.operations) {
      operationCount += 1;
      if (operation.operation !== "remove") {
        throw new Error(`Batch structural remediation only supports remove: ${operation.commentaryId}`);
      }
      if (!COMMENTARY_ID.test(operation.commentaryId)) {
        throw new Error(`Invalid commentary ID: ${operation.commentaryId}`);
      }
      if (operationIds.has(operation.commentaryId)) {
        throw new Error(`Duplicate batch remediation commentary ID: ${operation.commentaryId}`);
      }
      operationIds.add(operation.commentaryId);
      if (operation.rewriteResolution !== undefined && operation.rewriteResolution !== "reject-original") {
        throw new Error(`rewriteResolution for ${operation.commentaryId} must be exactly reject-original`);
      }
    }
  }
  if (operationCount === 0) throw new Error("Structural remediation batch has no remove operations");
}

function normalizeBatchAuditPath(dialogue: string, path: string) {
  const normalized = normalizeRepoPath(path);
  const expectedPrefix = `${AUDIT_OUTPUT_PREFIX}${dialogue}/`;
  if (
    normalized.relativePath !== path
    || !path.startsWith(expectedPrefix)
    || !path.endsWith(".json")
  ) {
    throw new Error(`auditOutputPath must be a JSON output under ${expectedPrefix}`);
  }
  return normalized;
}

function loadBatchAudit(
  dialogue: string,
  unit: CommentaryStructuralRemediationBatchUnit,
  expectedCommentaryIds: readonly string[],
) {
  const normalized = normalizeBatchAuditPath(dialogue, unit.auditOutputPath);
  if (!existsSync(normalized.absolutePath)) throw new Error(`Missing audit output ${normalized.relativePath}`);
  const content = readFileSync(normalized.absolutePath);
  if (sha256(content) !== unit.auditOutputSha256) {
    throw new Error(`Audit output hash mismatch for ${normalized.relativePath}`);
  }
  let value: unknown;
  try {
    value = JSON.parse(content.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed audit output ${normalized.relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const audit = parseCommentaryQualityAudit(value, {
    path: normalized.relativePath,
    expectedCommentaryIds: [...expectedCommentaryIds],
  });
  if (audit.dialogue !== dialogue || audit.unit_key !== unit.unitKey || audit.section_id !== unit.sectionId) {
    throw new Error(`Audit output identity does not match batch unit ${dialogue}/${unit.unitKey}`);
  }
  return audit;
}

function exactBatchOperations(
  commentaryIds: readonly string[],
  audit: ReturnType<typeof parseCommentaryQualityAudit>,
): CommentaryStructuralRemediationBatchOperation[] {
  const byId = new Map(audit.blocks.map((block) => [block.commentary_id, block]));
  if (byId.size !== commentaryIds.length || audit.blocks.length !== commentaryIds.length) {
    throw new Error(`Audit ${audit.dialogue}/${audit.unit_key} does not exactly cover the current unit`);
  }
  return commentaryIds.flatMap((commentaryId) => {
    const block = byId.get(commentaryId);
    if (!block) throw new Error(`Current audit is missing ${commentaryId}`);
    if (block.disposition === "pass") return [];
    if (block.disposition === "remove") {
      return [{ operation: "remove" as const, commentaryId }];
    }
    if (block.disposition === "rewrite") {
      return [{ operation: "remove" as const, commentaryId, rewriteResolution: "reject-original" as const }];
    }
    throw new Error(`Batch structural remediation refuses ${block.disposition} finding for ${commentaryId}`);
  });
}

function batchReceiptPath(input: CommentaryStructuralRemediationBatchInput) {
  const candidateHash = sha256(JSON.stringify(input)).slice(0, 12);
  return `wiki/review/${input.reviewedOn}-commentary-structural-remediation-batch-${input.dialogue}-${candidateHash}.md`;
}

function renderBatchReceipt(
  input: CommentaryStructuralRemediationBatchInput,
  preview: Omit<CommentaryStructuralRemediationBatchPreview, "receipt">,
  submissionRecordPath?: string,
) {
  return [
    "# Commentary structural remediation batch",
    "",
    `dialogue: ${input.dialogue}`,
    `candidate_path: ${input.candidatePath}`,
    `ledger_path: ${preview.ledgerPath}`,
    `ledger_sha256_before: ${preview.ledgerSha256Before}`,
    `ledger_sha256_after: ${preview.ledgerSha256After}`,
    `attribution_sha256: ${input.expectedAttributionSha256}`,
    `english_sha256: ${input.expectedEnglishSha256}`,
    ...(submissionRecordPath ? [`submission_record_path: ${submissionRecordPath}`] : []),
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    `rationale: ${input.rationale}`,
    "review_basis: operator-delegated independent Luna structural remediation review",
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    "audit_units:",
    ...input.auditUnits.flatMap((unit) => [
      `- unit_key: ${unit.unitKey}`,
      `  section_id: ${unit.sectionId}`,
      `  audit_output_path: ${unit.auditOutputPath}`,
      `  audit_output_sha256: ${unit.auditOutputSha256}`,
    ]),
    "operations:",
    ...preview.operations.flatMap((operation) => [
      `- operation: ${operation.operation}`,
      `  commentary_id: ${operation.commentaryId}`,
      `  audited_disposition: ${preview.auditFindings.find((finding) => finding.commentaryId === operation.commentaryId)?.disposition ?? "unknown"}`,
      ...(operation.rewriteResolution ? [`  rewrite_resolution: ${operation.rewriteResolution}`] : []),
    ]),
    "",
  ].join("\n");
}

function buildBatchPreview(
  input: CommentaryStructuralRemediationBatchInput,
): CommentaryStructuralRemediationBatchPreview {
  validateBatchInput(input);
  const briefs = buildCommentaryAuditBriefs(input.dialogue);
  if (briefs.length !== input.auditUnits.length) {
    throw new Error(`Batch candidate must bind every current audit unit: expected ${briefs.length}, received ${input.auditUnits.length}`);
  }
  for (const [index, brief] of briefs.entries()) {
    const unit = input.auditUnits[index]!;
    if (
      unit.unitKey !== brief.unitKey
      || unit.sectionId !== brief.sectionId
      || unit.auditOutputPath !== `${AUDIT_OUTPUT_PREFIX}${input.dialogue}/${brief.unitKey}.json`
    ) {
      throw new Error(`Batch audit units must use exact current-unit order and identity at ${brief.unitKey}`);
    }
  }

  validateCurrentCommentaryAuditArtifacts({
    dialogue: input.dialogue,
    artifacts: input.auditUnits.map((unit) => ({
      unitKey: unit.unitKey,
      outputPath: unit.auditOutputPath,
      outputSha256: unit.auditOutputSha256,
    })),
    requireSemanticFailure: false,
  });

  const audits = input.auditUnits.map((unit, index) => loadBatchAudit(
    input.dialogue,
    unit,
    briefs[index]!.commentaryIds,
  ));
  for (const [index, audit] of audits.entries()) {
    const expected = exactBatchOperations(briefs[index]!.commentaryIds, audit);
    const received = input.auditUnits[index]!.operations;
    if (JSON.stringify(received) !== JSON.stringify(expected)) {
      throw new Error(`Batch operations do not exactly match current remove/rewrite findings for ${input.dialogue}/${audit.unit_key}`);
    }
  }

  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const ledger = readFileSync(absoluteLedgerPath, "utf8");
  const ledgerDigest = sha256(ledger);
  if (ledgerDigest !== input.expectedLedgerSha256) {
    throw new Error("Current commentary ledger hash does not match batch candidate binding");
  }
  const issues = validateCommentaryLedger(ledgerPath, ledger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  const attributionPath = join(getRepoRoot(), `audio/speaker-attributions/${input.dialogue}.json`);
  const englishPath = join(getRepoRoot(), `raw/plato/english/${input.dialogue}.txt`);
  if (!existsSync(attributionPath) || !existsSync(englishPath)) {
    throw new Error("Current source files required for structural remediation are missing");
  }
  if (sha256(readFileSync(attributionPath)) !== input.expectedAttributionSha256) {
    throw new Error("Current attribution hash does not match batch candidate binding");
  }
  if (sha256(readFileSync(englishPath)) !== input.expectedEnglishSha256) {
    throw new Error("Current English source hash does not match batch candidate binding");
  }
  if (readFileSync(absoluteLedgerPath, "utf8") !== ledger) {
    throw new Error("Current commentary ledger changed while validating batch audit evidence");
  }

  const ledgerBlocks = commentaryMarkdownBlocks(ledger);
  const ledgerIds = ledgerBlocks.map(blockId);
  const auditByUnit = new Map(audits.map((audit) => [audit.unit_key, audit]));
  const operationEntries = input.auditUnits.flatMap((unit) => unit.operations.map((operation) => {
    const index = ledgerIds.indexOf(operation.commentaryId);
    if (index < 0) throw new Error(`Batch remediation ID is absent from the current ledger: ${operation.commentaryId}`);
    const finding = auditByUnit.get(unit.unitKey)?.blocks.find((block) => block.commentary_id === operation.commentaryId);
    if (!finding || (finding.disposition !== "remove" && finding.disposition !== "rewrite")) {
      throw new Error(`Missing remove/rewrite audit finding for ${operation.commentaryId}`);
    }
    return { operation, disposition: finding.disposition, index };
  })).sort((left, right) => left.index - right.index);

  let prospectiveLedger = ledger;
  for (const { operation } of operationEntries) {
    const currentBlock = commentaryMarkdownBlocks(prospectiveLedger)
      .find((candidate) => blockId(candidate) === operation.commentaryId);
    if (!currentBlock) throw new Error(`Cannot remediate missing commentary block ${operation.commentaryId}`);
    if (fieldValue(currentBlock.content, "review_status") !== "accepted") {
      throw new Error(`${operation.commentaryId} must currently be accepted for batch structural remediation`);
    }
    const replacement = currentBlock.fullMatch.replace(/^review_status:\s*accepted\s*$/mu, "review_status: rejected");
    if (replacement === currentBlock.fullMatch) {
      throw new Error(`Cannot reject ${operation.commentaryId}: exact accepted review_status is missing`);
    }
    prospectiveLedger = prospectiveLedger.replace(currentBlock.fullMatch, replacement);
  }
  const prospectiveIssues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (prospectiveIssues.length > 0) throw new Error(formatCommentaryLedgerValidationError(prospectiveIssues));
  const acceptedCount = commentaryMarkdownBlocks(prospectiveLedger)
    .filter((block) => fieldValue(block.content, "review_status") === "accepted")
    .length;
  if (acceptedCount === 0) {
    throw new Error("Structural remediation batch must retain at least one accepted commentary block");
  }

  const operations = operationEntries.map(({ operation }) => ({ ...operation }));
  const auditFindings = operationEntries.map(({ operation, disposition }) => ({
    commentaryId: operation.commentaryId,
    disposition,
    ...(operation.rewriteResolution ? { rewriteResolution: operation.rewriteResolution } : {}),
  } satisfies CommentaryStructuralAuditFinding));
  const previewWithoutReceipt = {
    applied: false as const,
    dialogue: input.dialogue,
    candidatePath: input.candidatePath,
    ledgerPath,
    ledgerSha256Before: ledgerDigest,
    ledgerSha256After: sha256(prospectiveLedger),
    expectedAttributionSha256: input.expectedAttributionSha256,
    expectedEnglishSha256: input.expectedEnglishSha256,
    auditUnits: input.auditUnits.map((unit) => ({
      ...unit,
      operations: unit.operations.map((operation) => ({ ...operation })),
    })),
    operations,
    auditFindings,
    prospectiveLedger,
    receiptPath: batchReceiptPath(input),
  };
  return { ...previewWithoutReceipt, receipt: renderBatchReceipt(input, previewWithoutReceipt) };
}

export function previewCommentaryStructuralRemediationBatch(
  input: CommentaryStructuralRemediationBatchInput,
) {
  return buildBatchPreview(input);
}

function assertBatchCandidateFile(input: CommentaryStructuralRemediationBatchInput) {
  const normalized = normalizeRepoPath(input.candidatePath);
  if (!existsSync(normalized.absolutePath)) {
    throw new Error(`Missing structural remediation batch candidate ${input.candidatePath}`);
  }
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(normalized.absolutePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed structural remediation batch candidate: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (JSON.stringify(value) !== JSON.stringify(input)) {
    throw new Error("Structural remediation batch input does not match its candidate file");
  }
}

export function applyCommentaryStructuralRemediationBatch(
  input: CommentaryStructuralRemediationBatchInput,
): CommentaryStructuralRemediationBatchApply {
  validateBatchInput(input);
  const targetReceiptPath = batchReceiptPath(input);
  return withRepoWriteLock(commentaryApplyLockScope(input.dialogue, "commentary-structural-remediation-batch"), () => {
    const absoluteReceiptPath = join(getRepoRoot(), targetReceiptPath);
    if (existsSync(absoluteReceiptPath)) {
      throw new Error(`Refusing to overwrite existing structural remediation batch receipt ${targetReceiptPath}`);
    }
    assertBatchCandidateFile(input);
    const preview = buildBatchPreview(input);
    const absoluteLedgerPath = join(getRepoRoot(), preview.ledgerPath);
    const ledgerBefore = readFileSync(absoluteLedgerPath, "utf8");
    const ledgerTempPath = `${absoluteLedgerPath}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
    const receiptTempPath = `${absoluteReceiptPath}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
    let submissionPath: string | undefined;
    try {
      writeFileSync(ledgerTempPath, preview.prospectiveLedger, "utf8");
      renameSync(ledgerTempPath, absoluteLedgerPath);
      const submission = recordSubmission({
        lane: "commentary",
        kind: "structural-remediation-batch",
        scope: input.dialogue,
        sourcePath: input.candidatePath,
        targetPath: preview.ledgerPath,
        targetContentBefore: ledgerBefore,
        targetContentAfter: preview.prospectiveLedger,
        appliedIds: preview.operations.map((operation) => operation.commentaryId),
        submission: {
          candidate: input,
          audit_findings: preview.auditFindings,
        },
      });
      submissionPath = submission.path;
      const receipt = renderBatchReceipt(input, preview, submission.path);
      mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
      writeFileSync(receiptTempPath, receipt, "utf8");
      renameSync(receiptTempPath, absoluteReceiptPath);
      const recordContent = readFileSync(join(getRepoRoot(), submission.path));
      return {
        ...preview,
        applied: true,
        submissionRecordPath: submission.path,
        submissionRecordSha256: sha256(recordContent),
        receipt,
      };
    } catch (error) {
      rmSync(ledgerTempPath, { force: true });
      rmSync(receiptTempPath, { force: true });
      rmSync(absoluteReceiptPath, { force: true });
      if (submissionPath) rmSync(join(getRepoRoot(), submissionPath), { force: true });
      if (existsSync(absoluteLedgerPath)) {
        const rollbackPath = `${absoluteLedgerPath}.rollback-${process.pid}-${Math.random().toString(16).slice(2)}`;
        try {
          writeFileSync(rollbackPath, ledgerBefore, "utf8");
          renameSync(rollbackPath, absoluteLedgerPath);
        } finally {
          rmSync(rollbackPath, { force: true });
        }
      }
      throw error;
    }
  });
}

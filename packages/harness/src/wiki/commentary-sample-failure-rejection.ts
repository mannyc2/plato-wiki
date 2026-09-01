import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  assertCommentaryAuditSampleEvidenceReplay,
  buildCommentaryAuditSampleEvidenceBundle,
  type CommentaryAuditSampleEvidenceBundle,
  type CommentaryAuditSampleEvidenceRecord,
} from "../commentary-audit-sample-campaign.js";
import { withRepoWriteLock } from "../file-lock.js";
import { normalizeRepoPath } from "../paths.js";
import {
  assertCanonicalRepoFileParent,
  canonicalRepoFileForRead,
  canonicalRepoFileForWrite,
} from "../repo-artifact-path.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING } from "./commentary-quality-audit.js";
import { formatCommentaryLedgerValidationError, validateCommentaryLedger } from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const SUBMISSION_PATH =
  /^wiki\/submissions\/commentary-sample-failure-rejection\/([a-z0-9-]+)\/([a-f0-9]{64})\.json$/u;

export type CommentarySampleFailureRejectionInput = {
  dialogue: string;
  reviewedOn: string;
  expectedLedgerSha256: string;
  failedCommentaryIds: string[];
  sampleOutputPath: string;
};

export type CommentarySampleFailureRejectedBlock = {
  commentary_id: string;
  rationale: string;
  rationale_sha256: string;
};

export type CommentarySampleFailureRejectionPreview = {
  applied: false;
  dialogue: string;
  ledgerPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  priorLedger: string;
  prospectiveLedger: string;
  reviewer: string;
  reviewedOn: string;
  failedBlocks: CommentarySampleFailureRejectedBlock[];
  sampleEvidencePath: string;
  sampleEvidenceSha256: string;
  sampleEvidence: string;
  receiptPath: string;
  receiptSha256: string;
  receipt: string;
  submissionPath: string;
  submissionSha256: string;
  submission: string;
};

export type CommentarySampleFailureRejectionApply =
  Omit<CommentarySampleFailureRejectionPreview, "applied"> & { applied: true };

/** Test-only fault point used to prove multi-file rollback. */
export type CommentarySampleFailureRejectionApplyOptions = {
  faultInjector?: (stage: "after_evidence" | "after_receipt" | "after_submission" | "after_ledger") => void;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], path: string) {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  if (actual.length !== canonical.length || actual.some((key, index) => key !== canonical[index])) {
    throw new Error(`${path} has unexpected or missing fields`);
  }
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateInput(input: CommentarySampleFailureRejectionInput) {
  if (!DIALOGUE.test(input.dialogue)) throw new Error(`Invalid dialogue slug: ${input.dialogue}`);
  if (!validDate(input.reviewedOn)) throw new Error("reviewedOn must be a valid YYYY-MM-DD date");
  if (!SHA256.test(input.expectedLedgerSha256)) {
    throw new Error("expectedLedgerSha256 must be a lowercase SHA-256 digest");
  }
  if (!Array.isArray(input.failedCommentaryIds) || input.failedCommentaryIds.length === 0) {
    throw new Error("failedCommentaryIds must be explicitly provided and non-empty");
  }
  if (input.failedCommentaryIds.some((id) => !COMMENTARY_ID.test(id))) {
    throw new Error("failedCommentaryIds must contain only valid commentary IDs");
  }
  if (new Set(input.failedCommentaryIds).size !== input.failedCommentaryIds.length) {
    throw new Error("failedCommentaryIds must be unique");
  }
  const expectedOutput = new RegExp(
    `^scratch/commentary/audit-sample-reviews/${input.dialogue}/[a-f0-9]{16}\\.json$`,
    "u",
  );
  if (!expectedOutput.test(input.sampleOutputPath)) {
    throw new Error(`sampleOutputPath must identify the current bounded scratch result for ${input.dialogue}`);
  }
}

function exactFailedBlocks(
  input: CommentarySampleFailureRejectionInput,
  evidence: CommentaryAuditSampleEvidenceBundle,
) {
  if (evidence.review.sample_verdict !== "fail") {
    throw new Error(`Independent sample for ${input.dialogue} must have sample_verdict=fail`);
  }
  const failed = evidence.review.blocks.filter((block) => block.verdict === "fail");
  const failedIds = failed.map((block) => block.commentary_id);
  if (
    failedIds.length !== input.failedCommentaryIds.length ||
    failedIds.some((id, index) => id !== input.failedCommentaryIds[index])
  ) {
    throw new Error(
      "failedCommentaryIds must equal every failed sample block exactly once in canonical sampled order",
    );
  }
  return failed.map((block) => ({
    commentary_id: block.commentary_id,
    rationale: block.rationale,
    rationale_sha256: sha256(block.rationale),
  }));
}

function replaceAcceptedStatus(ledger: string, commentaryId: string) {
  const block = commentaryMarkdownBlocks(ledger).find((candidate) => candidate.commentaryId === commentaryId);
  if (!block) throw new Error(`Independent sample failure names missing commentary block ${commentaryId}`);
  if (fieldValue(block.content, "review_status") !== "accepted") {
    throw new Error(`Commentary block ${commentaryId} must currently be accepted`);
  }
  const replacementContent = block.content.replace(
    /^review_status:\s*accepted\s*$/mu,
    "review_status: rejected",
  );
  if (replacementContent === block.content) {
    throw new Error(`Commentary block ${commentaryId} has no exact accepted review_status field`);
  }
  const replacement = block.fullMatch.replace(block.content, replacementContent);
  const next = ledger.replace(block.fullMatch, replacement);
  if (next === ledger) throw new Error(`Could not reject commentary block ${commentaryId}`);
  return next;
}

function componentBindings(evidence: CommentaryAuditSampleEvidenceBundle) {
  return {
    pending_manifest: {
      path: evidence.record.pending_manifest.path,
      sha256: evidence.record.pending_manifest.sha256,
    },
    commentary_ledger: {
      path: evidence.record.commentary_ledger.path,
      sha256: evidence.record.commentary_ledger.sha256,
    },
    sample_packet: {
      path: evidence.record.sample_packet.path,
      sha256: evidence.record.sample_packet.sha256,
    },
    output_schema: {
      path: evidence.record.output_schema.path,
      sha256: evidence.record.output_schema.sha256,
    },
    model_catalog: {
      path: evidence.record.model_catalog.path,
      sha256: evidence.record.model_catalog.sha256,
    },
    prompt: { sha256: evidence.record.prompt.sha256 },
    sample_output: {
      path: evidence.record.sample_output.path,
      sha256: evidence.record.sample_output.sha256,
    },
    sample_state: {
      path: evidence.record.sample_state.path,
      sha256: evidence.record.sample_state.sha256,
    },
    codex_execution: {
      path: evidence.record.codex_execution.path,
      sha256: evidence.record.codex_execution.sha256,
    },
  };
}

function receiptPath(input: CommentarySampleFailureRejectionInput, evidenceSha256: string) {
  const key = sha256([
    input.dialogue,
    input.reviewedOn,
    input.expectedLedgerSha256,
    evidenceSha256,
    ...input.failedCommentaryIds,
  ].join("\n")).slice(0, 12);
  return `wiki/review/${input.reviewedOn}-commentary-sample-failure-rejection-${input.dialogue}-${key}.md`;
}

function renderReceipt(input: {
  dialogue: string;
  reviewedOn: string;
  reviewer: string;
  ledgerPath: string;
  ledgerSha256Before: string;
  ledgerSha256After: string;
  evidence: CommentaryAuditSampleEvidenceBundle;
  failedBlocks: CommentarySampleFailureRejectedBlock[];
}) {
  const components = componentBindings(input.evidence);
  return [
    "# Commentary independent-sample failure rejection",
    "",
    `dialogue: ${input.dialogue}`,
    "decision: rejected",
    "prior_review_status: accepted",
    "review_transition: accepted -> rejected",
    `ledger_path: ${input.ledgerPath}`,
    `ledger_sha256_before: ${input.ledgerSha256Before}`,
    `ledger_sha256_after: ${input.ledgerSha256After}`,
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    "review_basis: current operator-delegated independent Luna sample failure",
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    "sample_verdict: fail",
    `sample_evidence_path: ${input.evidence.path}`,
    `sample_evidence_sha256: ${input.evidence.sha256}`,
    `sample_job_id: ${input.evidence.record.job_id}`,
    `sample_input_sha256: ${input.evidence.record.input_sha256}`,
    `pending_manifest_sha256: ${components.pending_manifest.sha256}`,
    `commentary_ledger_sha256: ${components.commentary_ledger.sha256}`,
    `sample_packet_sha256: ${components.sample_packet.sha256}`,
    `output_schema_sha256: ${components.output_schema.sha256}`,
    `model_catalog_sha256: ${components.model_catalog.sha256}`,
    `sample_prompt_sha256: ${components.prompt.sha256}`,
    `sample_output_sha256: ${components.sample_output.sha256}`,
    `sample_state_sha256: ${components.sample_state.sha256}`,
    `codex_execution_sha256: ${components.codex_execution.sha256}`,
    "failed_commentary:",
    ...input.failedBlocks.flatMap((block) => [
      `- commentary_id: ${block.commentary_id}`,
      `  rationale_sha256: ${block.rationale_sha256}`,
      `  rationale: ${JSON.stringify(block.rationale)}`,
    ]),
    "",
  ].join("\n");
}

function buildPreview(input: CommentarySampleFailureRejectionInput): CommentarySampleFailureRejectionPreview {
  validateInput(input);
  const evidence = buildCommentaryAuditSampleEvidenceBundle({
    dialogue: input.dialogue,
    sampleOutputPath: input.sampleOutputPath,
    requiredVerdict: "fail",
  });
  const failedBlocks = exactFailedBlocks(input, evidence);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  if (evidence.record.commentary_ledger.path !== ledgerPath) {
    throw new Error("Independent sample evidence does not bind the canonical commentary ledger path");
  }
  const ledger = readFileSync(canonicalRepoFileForRead(ledgerPath, "commentary ledger"), "utf8");
  const ledgerSha256Before = sha256(ledger);
  if (
    ledgerSha256Before !== input.expectedLedgerSha256 ||
    ledgerSha256Before !== evidence.record.commentary_ledger.sha256 ||
    ledger !== evidence.record.commentary_ledger.content
  ) {
    throw new Error("Current commentary ledger is stale relative to the failed independent sample");
  }
  const activeIds = commentaryMarkdownBlocks(ledger).flatMap((block) =>
    fieldValue(block.content, "review_status") === "accepted" && block.commentaryId ? [block.commentaryId] : []
  );
  assertCommentaryAuditSampleEvidenceReplay({
    evidence: evidence.record,
    pendingManifestContent: evidence.record.pending_manifest.content,
    activeCommentaryIds: activeIds,
    requiredVerdict: "fail",
  });
  let prospectiveLedger = ledger;
  for (const block of failedBlocks) {
    prospectiveLedger = replaceAcceptedStatus(prospectiveLedger, block.commentary_id);
  }
  const prospectiveIssues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (prospectiveIssues.length > 0) {
    throw new Error(formatCommentaryLedgerValidationError(prospectiveIssues));
  }
  const ledgerSha256After = sha256(prospectiveLedger);
  if (ledgerSha256After === ledgerSha256Before) throw new Error("Independent sample rejection must change the ledger");

  const targetReceiptPath = receiptPath(input, evidence.sha256);
  const receipt = renderReceipt({
    dialogue: input.dialogue,
    reviewedOn: input.reviewedOn,
    reviewer: evidence.review.reviewer.id,
    ledgerPath,
    ledgerSha256Before,
    ledgerSha256After,
    evidence,
    failedBlocks,
  });
  const receiptSha256 = sha256(receipt);
  const submissionRecord = {
    schema_version: 1,
    lane: "commentary-sample-failure-rejection",
    dialogue: input.dialogue,
    sample_verdict: "fail",
    reviewer: evidence.review.reviewer.id,
    reviewed_on: input.reviewedOn,
    sample_evidence: { path: evidence.path, sha256: evidence.sha256 },
    sample_components: componentBindings(evidence),
    ledger: {
      path: ledgerPath,
      sha256_before: ledgerSha256Before,
      sha256_after: ledgerSha256After,
    },
    failed_commentary: failedBlocks,
    review_receipt: { path: targetReceiptPath, sha256: receiptSha256 },
  };
  const submission = prettyJson(submissionRecord);
  const submissionSha256 = sha256(submission);
  const submissionPath =
    `wiki/submissions/commentary-sample-failure-rejection/${input.dialogue}/${submissionSha256}.json`;
  return {
    applied: false,
    dialogue: input.dialogue,
    ledgerPath,
    ledgerSha256Before,
    ledgerSha256After,
    priorLedger: ledger,
    prospectiveLedger,
    reviewer: evidence.review.reviewer.id,
    reviewedOn: input.reviewedOn,
    failedBlocks,
    sampleEvidencePath: evidence.path,
    sampleEvidenceSha256: evidence.sha256,
    sampleEvidence: evidence.content,
    receiptPath: targetReceiptPath,
    receiptSha256,
    receipt,
    submissionPath,
    submissionSha256,
    submission,
  };
}

export function previewCommentarySampleFailureRejection(
  input: CommentarySampleFailureRejectionInput,
): CommentarySampleFailureRejectionPreview {
  return buildPreview(input);
}

/**
 * Replay a committed rejection without trusting the now-stale scratch files.
 * The content-addressed evidence preserves the exact pre-rejection ledger and
 * provider execution; the current ledger must equal that ledger with only the
 * receipt's accepted-to-rejected transitions applied.
 */
export function verifyCommentarySampleFailureRejection(submissionPath: string) {
  const match = SUBMISSION_PATH.exec(submissionPath);
  if (!match) throw new Error("Sample-failure rejection submission path is not canonical");
  const pathDialogue = match[1]!;
  const pathSha256 = match[2]!;
  const submissionContent = readFileSync(
    canonicalRepoFileForRead(submissionPath, "sample-failure rejection submission"),
    "utf8",
  );
  if (sha256(submissionContent) !== pathSha256) {
    throw new Error("Sample-failure rejection submission filename hash is stale");
  }
  let parsedSubmission: unknown;
  try {
    parsedSubmission = JSON.parse(submissionContent) as unknown;
  } catch (error) {
    throw new Error(`Sample-failure rejection submission is malformed: ${error instanceof Error ? error.message : String(error)}`);
  }
  const submission = record(parsedSubmission, "sample-failure rejection submission");
  exactKeys(submission, [
    "schema_version",
    "lane",
    "dialogue",
    "sample_verdict",
    "reviewer",
    "reviewed_on",
    "sample_evidence",
    "sample_components",
    "ledger",
    "failed_commentary",
    "review_receipt",
  ], "sample-failure rejection submission");
  if (
    submission.schema_version !== 1 || submission.lane !== "commentary-sample-failure-rejection" ||
    submission.dialogue !== pathDialogue || submission.sample_verdict !== "fail" ||
    typeof submission.reviewer !== "string" || typeof submission.reviewed_on !== "string" ||
    !validDate(submission.reviewed_on)
  ) {
    throw new Error("Sample-failure rejection submission identity is invalid");
  }
  const sampleEvidenceBinding = record(submission.sample_evidence, "sample-failure rejection sample_evidence");
  exactKeys(sampleEvidenceBinding, ["path", "sha256"], "sample-failure rejection sample_evidence");
  if (
    typeof sampleEvidenceBinding.path !== "string" || typeof sampleEvidenceBinding.sha256 !== "string" ||
    !SHA256.test(sampleEvidenceBinding.sha256) ||
    sampleEvidenceBinding.path !==
      `wiki/submissions/commentary-audit-sample/${pathDialogue}/${sampleEvidenceBinding.sha256}.json`
  ) {
    throw new Error("Sample-failure rejection evidence binding is not canonical");
  }
  const evidenceContent = readFileSync(
    canonicalRepoFileForRead(sampleEvidenceBinding.path, "sample-failure rejection evidence"),
    "utf8",
  );
  if (sha256(evidenceContent) !== sampleEvidenceBinding.sha256) {
    throw new Error("Sample-failure rejection evidence hash is stale");
  }
  let evidenceRecord: CommentaryAuditSampleEvidenceRecord;
  try {
    const value = JSON.parse(evidenceContent) as unknown;
    if (evidenceContent !== prettyJson(value)) throw new Error("evidence is not canonical JSON");
    evidenceRecord = value as CommentaryAuditSampleEvidenceRecord;
  } catch (error) {
    throw new Error(`Sample-failure rejection evidence is malformed: ${error instanceof Error ? error.message : String(error)}`);
  }
  const priorLedger = evidenceRecord.commentary_ledger?.content;
  if (typeof priorLedger !== "string") throw new Error("Sample-failure rejection evidence has no prior ledger");
  const priorActiveIds = commentaryMarkdownBlocks(priorLedger).flatMap((block) =>
    fieldValue(block.content, "review_status") === "accepted" && block.commentaryId ? [block.commentaryId] : []
  );
  const replay = assertCommentaryAuditSampleEvidenceReplay({
    evidence: evidenceRecord,
    pendingManifestContent: evidenceRecord.pending_manifest.content,
    activeCommentaryIds: priorActiveIds,
    historical: true,
    requiredVerdict: "fail",
  });
  if (replay.review.reviewer.id !== submission.reviewer) {
    throw new Error("Sample-failure rejection reviewer does not match replayed evidence");
  }
  if (!Array.isArray(submission.failed_commentary) || submission.failed_commentary.length === 0) {
    throw new Error("Sample-failure rejection must preserve non-empty item-level findings");
  }
  const failedBlocks = submission.failed_commentary.map((value, index) => {
    const block = record(value, `sample-failure rejection failed_commentary[${index}]`);
    exactKeys(block, ["commentary_id", "rationale", "rationale_sha256"], `failed_commentary[${index}]`);
    if (
      typeof block.commentary_id !== "string" || !COMMENTARY_ID.test(block.commentary_id) ||
      typeof block.rationale !== "string" || typeof block.rationale_sha256 !== "string" ||
      sha256(block.rationale) !== block.rationale_sha256
    ) {
      throw new Error(`Sample-failure rejection finding ${index} is malformed or hash-mismatched`);
    }
    return {
      commentary_id: block.commentary_id,
      rationale: block.rationale,
      rationale_sha256: block.rationale_sha256,
    };
  });
  const replayFailed = replay.review.blocks.filter((block) => block.verdict === "fail");
  if (
    replayFailed.length !== failedBlocks.length ||
    replayFailed.some((block, index) =>
      block.commentary_id !== failedBlocks[index]!.commentary_id || block.rationale !== failedBlocks[index]!.rationale
    )
  ) {
    throw new Error("Sample-failure rejection findings do not equal the replayed failed blocks in sampled order");
  }
  const ledgerBinding = record(submission.ledger, "sample-failure rejection ledger");
  exactKeys(ledgerBinding, ["path", "sha256_before", "sha256_after"], "sample-failure rejection ledger");
  const ledgerPath = `wiki/commentary/${pathDialogue}.md`;
  if (
    ledgerBinding.path !== ledgerPath || ledgerBinding.sha256_before !== evidenceRecord.commentary_ledger.sha256 ||
    typeof ledgerBinding.sha256_after !== "string" || !SHA256.test(ledgerBinding.sha256_after)
  ) {
    throw new Error("Sample-failure rejection ledger binding is malformed");
  }
  let expectedCurrentLedger = priorLedger;
  for (const block of failedBlocks) expectedCurrentLedger = replaceAcceptedStatus(expectedCurrentLedger, block.commentary_id);
  const currentLedger = readFileSync(canonicalRepoFileForRead(ledgerPath, "sample-rejected commentary ledger"), "utf8");
  if (
    currentLedger !== expectedCurrentLedger || sha256(currentLedger) !== ledgerBinding.sha256_after
  ) {
    throw new Error("Current commentary ledger does not equal the exact receipt-bound rejection transition");
  }
  const receiptBinding = record(submission.review_receipt, "sample-failure rejection review_receipt");
  exactKeys(receiptBinding, ["path", "sha256"], "sample-failure rejection review_receipt");
  if (typeof receiptBinding.path !== "string" || typeof receiptBinding.sha256 !== "string" || !SHA256.test(receiptBinding.sha256)) {
    throw new Error("Sample-failure rejection receipt binding is malformed");
  }
  const evidence: CommentaryAuditSampleEvidenceBundle = {
    path: sampleEvidenceBinding.path,
    sha256: sampleEvidenceBinding.sha256,
    content: evidenceContent,
    record: evidenceRecord,
    review: replay.review,
  };
  const expectedReceiptPath = receiptPath({
    dialogue: pathDialogue,
    reviewedOn: submission.reviewed_on,
    expectedLedgerSha256: ledgerBinding.sha256_before as string,
    failedCommentaryIds: failedBlocks.map((block) => block.commentary_id),
    sampleOutputPath: evidenceRecord.sample_output.path,
  }, evidence.sha256);
  const expectedReceipt = renderReceipt({
    dialogue: pathDialogue,
    reviewedOn: submission.reviewed_on,
    reviewer: submission.reviewer,
    ledgerPath,
    ledgerSha256Before: ledgerBinding.sha256_before as string,
    ledgerSha256After: ledgerBinding.sha256_after,
    evidence,
    failedBlocks,
  });
  if (receiptBinding.path !== expectedReceiptPath || receiptBinding.sha256 !== sha256(expectedReceipt)) {
    throw new Error("Sample-failure rejection receipt path or hash is not canonical");
  }
  const receiptContent = readFileSync(
    canonicalRepoFileForRead(receiptBinding.path, "sample-failure rejection receipt"),
    "utf8",
  );
  if (receiptContent !== expectedReceipt) throw new Error("Sample-failure rejection receipt content is stale");
  const expectedSubmission = prettyJson({
    schema_version: 1,
    lane: "commentary-sample-failure-rejection",
    dialogue: pathDialogue,
    sample_verdict: "fail",
    reviewer: submission.reviewer,
    reviewed_on: submission.reviewed_on,
    sample_evidence: { path: evidence.path, sha256: evidence.sha256 },
    sample_components: componentBindings(evidence),
    ledger: {
      path: ledgerPath,
      sha256_before: ledgerBinding.sha256_before,
      sha256_after: ledgerBinding.sha256_after,
    },
    failed_commentary: failedBlocks,
    review_receipt: { path: expectedReceiptPath, sha256: sha256(expectedReceipt) },
  });
  if (submissionContent !== expectedSubmission) {
    throw new Error("Sample-failure rejection submission does not replay to canonical JSON");
  }
  return {
    dialogue: pathDialogue,
    submissionPath,
    submissionSha256: pathSha256,
    evidencePath: evidence.path,
    evidenceSha256: evidence.sha256,
    receiptPath: expectedReceiptPath,
    receiptSha256: sha256(expectedReceipt),
    ledgerPath,
    ledgerSha256Before: ledgerBinding.sha256_before as string,
    ledgerSha256After: ledgerBinding.sha256_after,
    failedCommentaryIds: failedBlocks.map((block) => block.commentary_id),
  };
}

function removeCreated(relativePath: string, label: string) {
  try {
    rmSync(canonicalRepoFileForRead(relativePath, label), { force: true });
  } catch {
    // Never follow a path that became an alias during cleanup.
  }
}

function renameNew(temporaryPath: string, targetPath: string, label: string) {
  const temporaryRelativePath = normalizeRepoPath(temporaryPath).relativePath;
  canonicalRepoFileForRead(temporaryRelativePath, `temporary ${label}`);
  const targetAbsolutePath = canonicalRepoFileForWrite(targetPath, label);
  assertCanonicalRepoFileParent(targetPath, label);
  if (existsSync(targetAbsolutePath)) throw new Error(`Refusing to overwrite existing ${label} ${targetPath}`);
  renameSync(temporaryPath, targetAbsolutePath);
}

function replaceLedger(temporaryPath: string, preview: CommentarySampleFailureRejectionPreview) {
  const currentPath = canonicalRepoFileForRead(preview.ledgerPath, "commentary ledger");
  if (sha256(readFileSync(currentPath)) !== preview.ledgerSha256Before) {
    throw new Error("Current commentary ledger changed before independent sample rejection apply");
  }
  canonicalRepoFileForRead(normalizeRepoPath(temporaryPath).relativePath, "temporary commentary ledger");
  assertCanonicalRepoFileParent(preview.ledgerPath, "commentary ledger");
  renameSync(temporaryPath, currentPath);
}

export function applyCommentarySampleFailureRejection(
  input: CommentarySampleFailureRejectionInput,
  options: CommentarySampleFailureRejectionApplyOptions = {},
): CommentarySampleFailureRejectionApply {
  const candidate = buildPreview(input);
  const targets = [
    candidate.ledgerPath,
    candidate.sampleEvidencePath,
    candidate.receiptPath,
    candidate.submissionPath,
  ];
  return withRepoWriteLock(
    { paths: targets, label: `commentary-sample-failure-rejection:${input.dialogue}` },
    () => {
      const preview = buildPreview(input);
      if (
        preview.sampleEvidenceSha256 !== candidate.sampleEvidenceSha256 ||
        preview.submissionSha256 !== candidate.submissionSha256 ||
        preview.receiptSha256 !== candidate.receiptSha256 ||
        preview.ledgerSha256After !== candidate.ledgerSha256After
      ) {
        throw new Error("Independent sample rejection inputs changed between preview and apply");
      }
      for (const [path, label] of [
        [preview.sampleEvidencePath, "independent sample evidence"],
        [preview.receiptPath, "independent sample rejection receipt"],
        [preview.submissionPath, "independent sample rejection submission"],
      ] as const) {
        if (existsSync(canonicalRepoFileForWrite(path, label))) {
          throw new Error(`Refusing to overwrite existing ${label} ${path}`);
        }
      }
      const destinations = [
        [preview.sampleEvidencePath, preview.sampleEvidence, "independent sample evidence"],
        [preview.receiptPath, preview.receipt, "independent sample rejection receipt"],
        [preview.submissionPath, preview.submission, "independent sample rejection submission"],
      ] as const;
      for (const [path, , label] of destinations) {
        const absolute = canonicalRepoFileForWrite(path, label);
        mkdirSync(dirname(absolute), { recursive: true });
        assertCanonicalRepoFileParent(path, label);
      }
      const suffix = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const temporary = {
        evidence: canonicalRepoFileForWrite(`${preview.sampleEvidencePath}.tmp-${suffix}`, "temporary sample evidence"),
        receipt: canonicalRepoFileForWrite(`${preview.receiptPath}.tmp-${suffix}`, "temporary rejection receipt"),
        submission: canonicalRepoFileForWrite(`${preview.submissionPath}.tmp-${suffix}`, "temporary rejection submission"),
        ledger: canonicalRepoFileForWrite(`${preview.ledgerPath}.tmp-${suffix}`, "temporary commentary ledger"),
      };
      const created: Array<{ path: string; label: string }> = [];
      let ledgerReplaced = false;
      try {
        writeFileSync(temporary.evidence, preview.sampleEvidence, { encoding: "utf8", flag: "wx" });
        writeFileSync(temporary.receipt, preview.receipt, { encoding: "utf8", flag: "wx" });
        writeFileSync(temporary.submission, preview.submission, { encoding: "utf8", flag: "wx" });
        writeFileSync(temporary.ledger, preview.prospectiveLedger, { encoding: "utf8", flag: "wx" });

        renameNew(temporary.evidence, preview.sampleEvidencePath, "independent sample evidence");
        created.push({ path: preview.sampleEvidencePath, label: "independent sample evidence" });
        options.faultInjector?.("after_evidence");
        renameNew(temporary.receipt, preview.receiptPath, "independent sample rejection receipt");
        created.push({ path: preview.receiptPath, label: "independent sample rejection receipt" });
        options.faultInjector?.("after_receipt");
        renameNew(temporary.submission, preview.submissionPath, "independent sample rejection submission");
        created.push({ path: preview.submissionPath, label: "independent sample rejection submission" });
        options.faultInjector?.("after_submission");
        replaceLedger(temporary.ledger, preview);
        ledgerReplaced = true;
        options.faultInjector?.("after_ledger");
      } catch (error) {
        for (const path of Object.values(temporary)) {
          try {
            const relative = normalizeRepoPath(path).relativePath;
            if (existsSync(path)) removeCreated(relative, "temporary rejection artifact");
          } catch {
            // Never follow an aliased cleanup path.
          }
        }
        let rollbackError: unknown;
        if (ledgerReplaced) {
          const rollbackRelative = `${preview.ledgerPath}.rollback-${suffix}`;
          const rollback = canonicalRepoFileForWrite(rollbackRelative, "commentary ledger rollback");
          try {
            const current = canonicalRepoFileForRead(preview.ledgerPath, "commentary ledger rollback target");
            if (sha256(readFileSync(current)) !== preview.ledgerSha256After) {
              throw new Error("Cannot roll back commentary ledger because it changed after replacement");
            }
            writeFileSync(rollback, preview.priorLedger, { encoding: "utf8", flag: "wx" });
            canonicalRepoFileForRead(rollbackRelative, "commentary ledger rollback");
            assertCanonicalRepoFileParent(preview.ledgerPath, "commentary ledger rollback target");
            renameSync(rollback, current);
          } catch (rollbackFailure) {
            rollbackError = rollbackFailure;
          } finally {
            if (existsSync(rollback)) removeCreated(rollbackRelative, "commentary ledger rollback");
          }
        }
        for (const artifact of created.reverse()) removeCreated(artifact.path, artifact.label);
        if (rollbackError) {
          throw new AggregateError([error, rollbackError], "Independent sample rejection failed and ledger rollback failed");
        }
        throw error;
      }
      return { ...preview, applied: true };
    },
  );
}

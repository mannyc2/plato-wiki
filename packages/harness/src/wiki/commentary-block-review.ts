import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
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
const SHA256 = /^[a-f0-9]{64}$/u;
const EVIDENCE_MANIFEST = /^sha256-([a-f0-9]{64})-commentary-reconsideration-evidence\.json$/u;
const DURABLE_PATH = /^(?!scratch\/)(?!\/)[a-zA-Z0-9_./-]+$/u;
const EVIDENCE_KINDS = ["review_output", "review_packet", "review_schema"] as const;
const MAX_RATIONALE_LENGTH = 300;
const MIN_RECONSIDERATION_RATIONALE_LENGTH = 40;
const COMMENTARY_BLOCK_REVIEW_BASIS = "review_basis: operator-delegated independent Luna block review";
const COMMENTARY_BLOCK_RECONSIDERATION_BASIS =
  "review_basis: operator-delegated independent Luna reconsideration of terminally rejected blocks";

type CommentaryBlockReviewMode = "review_unreviewed" | "reconsider_rejected";
type InternalCommentaryBlockReviewInput = CommentaryBlockReviewInput &
  Partial<Pick<CommentaryBlockReconsiderationInput, "evidenceManifestPath" | "evidenceManifestSha256">>;

export type CommentaryBlockReviewDecision = "accepted" | "rejected";

export type CommentaryBlockReviewInput = {
  dialogue: string;
  decision: CommentaryBlockReviewDecision;
  reviewer: string;
  reviewedOn: string;
  rationale: string;
  reviewedIds: string[];
};

export type CommentaryBlockReconsiderationInput = Omit<CommentaryBlockReviewInput, "decision"> & {
  evidenceManifestPath: string;
  evidenceManifestSha256: string;
};

type CommentaryReconsiderationEvidence = {
  manifestPath: string;
  manifestSha256: string;
  artifacts: Array<{ kind: (typeof EVIDENCE_KINDS)[number]; path: string; sha256: string }>;
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

function canonicalEvidenceManifest(evidence: CommentaryReconsiderationEvidence) {
  return `${JSON.stringify({ schema_version: 1, artifacts: evidence.artifacts }, null, 2)}\n`;
}

function durableArtifactPath(logicalPath: string) {
  if (!DURABLE_PATH.test(logicalPath) || logicalPath.split("/").some((part) => !part || part === "." || part === "..")) {
    return null;
  }
  const root = resolve(getRepoRoot());
  const absolute = resolve(root, logicalPath);
  const canonical = relative(root, absolute).split("\\").join("/");
  return absolute.startsWith(`${root}${sep}`) && canonical === logicalPath ? absolute : null;
}

function loadReconsiderationEvidence(input: CommentaryBlockReconsiderationInput): CommentaryReconsiderationEvidence {
  if (!SHA256.test(input.evidenceManifestSha256)) {
    throw new Error("evidenceManifestSha256 must be a lowercase SHA-256");
  }
  const manifestPath = durableArtifactPath(input.evidenceManifestPath);
  const match = EVIDENCE_MANIFEST.exec(basename(input.evidenceManifestPath));
  if (!manifestPath || !match || match[1] !== input.evidenceManifestSha256 || !existsSync(manifestPath)) {
    throw new Error("Reconsideration evidence manifest must be a present, durable, content-addressed canonical file");
  }
  const bytes = readFileSync(manifestPath);
  if (sha256(bytes) !== input.evidenceManifestSha256) throw new Error("Reconsideration evidence manifest hash mismatch");
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed reconsideration evidence manifest: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Reconsideration evidence manifest must be an object");
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).sort().join(",") !== "artifacts,schema_version" || record.schema_version !== 1 || !Array.isArray(record.artifacts)) {
    throw new Error("Reconsideration evidence manifest must contain exactly schema_version 1 and artifacts");
  }
  const artifacts = record.artifacts.map((value, index) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`Evidence artifact ${index + 1} must be an object`);
    const artifact = value as Record<string, unknown>;
    if (Object.keys(artifact).sort().join(",") !== "kind,path,sha256" ||
      typeof artifact.kind !== "string" || !EVIDENCE_KINDS.includes(artifact.kind as never) ||
      typeof artifact.path !== "string" || typeof artifact.sha256 !== "string" || !SHA256.test(artifact.sha256)) {
      throw new Error(`Evidence artifact ${index + 1} must contain exact kind, path, and sha256 fields`);
    }
    const absolute = durableArtifactPath(artifact.path);
    if (!absolute || !existsSync(absolute) || sha256(readFileSync(absolute)) !== artifact.sha256) {
      throw new Error(`Evidence artifact ${artifact.path} is missing, noncanonical, scratch-only, or hash-mismatched`);
    }
    return {
      kind: artifact.kind as (typeof EVIDENCE_KINDS)[number],
      path: artifact.path,
      sha256: artifact.sha256,
    };
  });
  if (artifacts.length !== EVIDENCE_KINDS.length || artifacts.some((artifact, index) => artifact.kind !== EVIDENCE_KINDS[index])) {
    throw new Error(`Reconsideration evidence must contain exactly ${EVIDENCE_KINDS.join(", ")} in canonical order`);
  }
  const evidence = { manifestPath: input.evidenceManifestPath, manifestSha256: input.evidenceManifestSha256, artifacts };
  if (canonicalEvidenceManifest(evidence) !== bytes.toString("utf8")) throw new Error("Reconsideration evidence manifest is not canonical JSON");
  return evidence;
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function receiptPath(
  input: InternalCommentaryBlockReviewInput,
  ledgerSha256Before: string,
  mode: CommentaryBlockReviewMode,
) {
  const reviewKeyInput = `${input.decision}\n${input.reviewedIds.join("\n")}\n${ledgerSha256Before}\n${input.evidenceManifestSha256 ?? ""}`;
  const reviewKey = sha256(mode === "reconsider_rejected" ? `${mode}\n${reviewKeyInput}` : reviewKeyInput).slice(0, 12);
  const receiptKind = mode === "reconsider_rejected"
    ? "commentary-block-reconsideration"
    : "commentary-block-review";
  return `wiki/review/${input.reviewedOn}-${receiptKind}-${input.dialogue}-${input.decision}-${reviewKey}.md`;
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

function renderReceipt(
  input: InternalCommentaryBlockReviewInput,
  before: string,
  after: string,
  mode: CommentaryBlockReviewMode,
  evidence: CommentaryReconsiderationEvidence | null,
) {
  const reconsideration = mode === "reconsider_rejected";
  return [
    reconsideration ? "# Commentary block reconsideration" : "# Commentary block review",
    "",
    `dialogue: ${input.dialogue}`,
    `decision: ${input.decision}`,
    ...(reconsideration ? ["prior_review_status: rejected", "review_transition: rejected -> accepted"] : []),
    `ledger_path: wiki/commentary/${input.dialogue}.md`,
    `ledger_sha256_before: ${before}`,
    `ledger_sha256_after: ${after}`,
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    `rationale: ${input.rationale}`,
    reconsideration ? COMMENTARY_BLOCK_RECONSIDERATION_BASIS : COMMENTARY_BLOCK_REVIEW_BASIS,
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    ...(evidence ? [
      `evidence_manifest_path: ${evidence.manifestPath}`,
      `evidence_manifest_sha256: ${evidence.manifestSha256}`,
      `- artifact: \`${evidence.manifestPath}\`; sha256: \`${evidence.manifestSha256}\``,
      ...evidence.artifacts.map((artifact) =>
        `- artifact: \`${artifact.path}\`; sha256: \`${artifact.sha256}\``
      ),
    ] : []),
    "reviewed_commentary_ids:",
    ...input.reviewedIds.map((id) => `- ${id}`),
    "",
  ].join("\n");
}

function buildPreview(
  input: InternalCommentaryBlockReviewInput,
  mode: CommentaryBlockReviewMode = "review_unreviewed",
): CommentaryBlockReviewPreview {
  validateInput(input);
  if (
    mode === "reconsider_rejected" &&
    (input.decision !== "accepted" || input.rationale.length < MIN_RECONSIDERATION_RATIONALE_LENGTH)
  ) {
    throw new Error(
      `Rejected-block reconsideration requires an accepted decision and a rationale of at least ${MIN_RECONSIDERATION_RATIONALE_LENGTH} characters`,
    );
  }
  const evidence = mode === "reconsider_rejected"
    ? loadReconsiderationEvidence(input as CommentaryBlockReconsiderationInput)
    : null;
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
  const priorStatus = mode === "reconsider_rejected" ? "rejected" : "unreviewed";
  for (const id of input.reviewedIds) {
    const block = blocks.find((candidate) => candidate.commentaryId === id);
    if (!block || fieldValue(block.content, "review_status") !== priorStatus) {
      throw new Error(`Commentary block ${id} must currently be ${priorStatus}`);
    }
  }
  let prospectiveLedger = ledger;
  for (const id of input.reviewedIds) {
    const block = commentaryMarkdownBlocks(prospectiveLedger).find((candidate) => candidate.commentaryId === id);
    if (!block) throw new Error(`Cannot review missing commentary block ${id}`);
    const replacement = block.fullMatch.replace(
      new RegExp(`^review_status:\\s*${priorStatus}\\s*$`, "mu"),
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
    receiptPath: receiptPath(input, before, mode),
    ledgerSha256Before: before,
    ledgerSha256After: after,
    reviewedIds: [...input.reviewedIds],
    prospectiveLedger,
    receipt: renderReceipt(input, before, after, mode, evidence),
  };
}

export function previewCommentaryBlockReview(input: CommentaryBlockReviewInput) {
  return buildPreview(input);
}

export function previewCommentaryBlockReconsideration(input: CommentaryBlockReconsiderationInput) {
  return buildPreview({ ...input, decision: "accepted" }, "reconsider_rejected");
}

function applyBlockReview(
  input: InternalCommentaryBlockReviewInput,
  mode: CommentaryBlockReviewMode,
): CommentaryBlockReviewApply {
  validateInput(input);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
  const targetReceiptPath = receiptPath(input, sha256(readFileSync(absoluteLedgerPath)), mode);
  return withRepoWriteLock(
    { paths: [ledgerPath, targetReceiptPath], label: `commentary-block-review:${input.dialogue}` },
    () => {
      const absoluteReceiptPath = join(getRepoRoot(), targetReceiptPath);
      if (existsSync(absoluteReceiptPath)) throw new Error(`Refusing to overwrite existing canonical receipt ${targetReceiptPath}`);
      const preview = buildPreview(input, mode);
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


export function applyCommentaryBlockReview(input: CommentaryBlockReviewInput): CommentaryBlockReviewApply {
  return applyBlockReview(input, "review_unreviewed");
}

export function applyCommentaryBlockReconsideration(
  input: CommentaryBlockReconsiderationInput,
): CommentaryBlockReviewApply {
  return applyBlockReview({ ...input, decision: "accepted" }, "reconsider_rejected");
}

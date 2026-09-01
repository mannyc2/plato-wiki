import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseCommentaryQualityAudit } from "../commentary-audit.js";
import {
  buildCommentaryAuditSampleEvidenceBundle,
  type CommentaryAuditSampleEvidenceBundle,
} from "../commentary-audit-sample-campaign.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "../commentary-authoring.js";
import {
  buildCommentaryQualityAuditManifestPreview,
  parseCommentaryQualityAuditManifest,
  validateCommentaryQualityAuditManifest,
  formatCommentaryQualityAuditManifestIssues,
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  COMMENTARY_QUALITY_AUDIT_REVIEW_BASIS,
  type CommentaryQualityAuditManifest,
} from "./commentary-quality-audit.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { fieldValue } from "./observation-ledger.js";
import {
  readCommentaryAuditSampleLedgerEvidence,
  validateAcceptedCommentaryQualityAuditProvenance,
} from "./commentary-quality-audit-provenance.js";
import { withRepoWriteLock } from "../file-lock.js";
import { normalizeRepoPath } from "../paths.js";
import {
  assertCanonicalRepoFileParent,
  canonicalRepoFileForRead,
  canonicalRepoFileForWrite,
} from "../repo-artifact-path.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const MAX_RATIONALE_LENGTH = 300;
const TOP_LEVEL_FIELDS = new Set(["schema_version", "dialogue", "ledger", "protocol", "authoring", "units", "acceptance"]);
const RESOURCE_FIELDS = new Set(["path", "sha256"]);
const AUTHORING_FIELDS = new Set(["model", "effort"]);
const UNIT_FIELDS = new Set(["unit_key", "section_id", "audit_brief_sha256", "output_path", "output_sha256", "output"]);
const UNIT_FIELDS_WITH_PROVENANCE = new Set([...UNIT_FIELDS, "provenance"]);
const PROVENANCE_FIELDS = new Set(["path", "sha256"]);
const ACCEPTANCE_FIELDS = new Set(["decision", "reviewer", "reviewed_on", "rationale", "sampled_commentary_ids", "review_note"]);
const REVIEW_NOTE_FIELDS = new Set(["path", "sha256"]);

export type CommentaryQualityAuditAcceptanceInput = {
  dialogue: string;
  reviewer: string;
  reviewedOn: string;
  rationale: string;
  sampledCommentaryIds: string[];
  sampleOutputPath: string;
  pendingPreviewPath?: string;
};

export type CommentaryQualityAuditAcceptancePreview = {
  applied: false;
  pendingPreviewPath: string;
  manifestPath: string;
  reviewNotePath: string;
  sampleEvidencePath: string;
  sampleEvidenceSha256: string;
  sampleEvidence: string;
  manifest: CommentaryQualityAuditManifest;
  reviewNote: string;
};

export type CommentaryQualityAuditAcceptanceApply = Omit<CommentaryQualityAuditAcceptancePreview, "applied"> & {
  applied: true;
};

/** Input for replacing an accepted audit after the canonical ledger changed. */
export type CommentaryQualityAuditAcceptanceSupersedeInput = CommentaryQualityAuditAcceptanceInput;

export type CommentaryQualityAuditAcceptanceSupersedePreview = {
  applied: false;
  pendingPreviewPath: string;
  manifestPath: string;
  reviewNotePath: string;
  manifest: CommentaryQualityAuditManifest;
  reviewNote: string;
  predecessorManifestPath: string;
  predecessorManifestSha256: string;
  predecessorManifestHistoryPath: string;
  predecessorReviewNotePath: string;
  predecessorReviewNoteSha256: string;
  predecessorReviewNoteHistoryPath: string;
  predecessorLedgerPath: string;
  predecessorLedgerSha256: string;
  predecessorLedgerHistoryPath: string;
  predecessorLedgerContent: string;
  sampleEvidencePath: string;
  sampleEvidenceSha256: string;
  sampleEvidence: string;
};

export type CommentaryQualityAuditAcceptanceSupersedeApply =
  Omit<CommentaryQualityAuditAcceptanceSupersedePreview, "applied"> & { applied: true };

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function renameNewCanonicalFile(temporaryAbsolutePath: string, targetRelativePath: string, label: string) {
  const temporaryRelativePath = normalizeRepoPath(temporaryAbsolutePath).relativePath;
  canonicalRepoFileForRead(temporaryRelativePath, `temporary ${label}`);
  const targetAbsolutePath = canonicalRepoFileForWrite(targetRelativePath, label);
  assertCanonicalRepoFileParent(targetRelativePath, label);
  if (existsSync(targetAbsolutePath)) throw new Error(`Refusing concurrent ${label} creation at ${targetRelativePath}`);
  renameSync(temporaryAbsolutePath, targetAbsolutePath);
}

function replaceCanonicalFile(
  temporaryAbsolutePath: string,
  targetRelativePath: string,
  expectedCurrentSha256: string,
  label: string,
) {
  const temporaryRelativePath = normalizeRepoPath(temporaryAbsolutePath).relativePath;
  canonicalRepoFileForRead(temporaryRelativePath, `temporary ${label}`);
  const targetAbsolutePath = canonicalRepoFileForRead(targetRelativePath, label);
  assertCanonicalRepoFileParent(targetRelativePath, label);
  if (sha256(readFileSync(targetAbsolutePath)) !== expectedCurrentSha256) {
    throw new Error(`Refusing stale ${label} replacement at ${targetRelativePath}`);
  }
  renameSync(temporaryAbsolutePath, targetAbsolutePath);
}

function removeCanonicalFileIfCreated(relativePath: string, label: string) {
  try {
    const absolutePath = canonicalRepoFileForRead(relativePath, label);
    rmSync(absolutePath, { force: true });
  } catch {
    // Never follow an aliased cleanup path. A noncanonical orphan requires
    // explicit inspection instead of best-effort deletion through the alias.
  }
}

function removeCanonicalTemporaryFile(absolutePath: string, label: string) {
  const relativePath = normalizeRepoPath(absolutePath).relativePath;
  if (existsSync(absolutePath)) removeCanonicalFileIfCreated(relativePath, label);
}

function expectedPendingPreviewPath(dialogue: string) {
  return `scratch/commentary/audit-manifests/${dialogue}.json`;
}

function manifestPath(dialogue: string) {
  return `wiki/commentary-audits/${dialogue}.json`;
}

function reviewNotePath(dialogue: string, reviewedOn: string) {
  return `wiki/review/${reviewedOn}-commentary-quality-${dialogue}-luna-sample.md`;
}

function predecessorManifestHistoryPath(dialogue: string, manifestSha256: string) {
  return `wiki/commentary-audits/history/${dialogue}/${manifestSha256}.json`;
}

function predecessorReviewNoteHistoryPath(dialogue: string, reviewNoteSha256: string) {
  return `wiki/review/commentary-quality-history/${dialogue}/${reviewNoteSha256}.md`;
}

function predecessorLedgerHistoryPath(dialogue: string, ledgerSha256: string) {
  return `wiki/commentary-audits/history/${dialogue}/ledgers/${ledgerSha256}.md`;
}

function validDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateInput(input: CommentaryQualityAuditAcceptanceInput) {
  if (!DIALOGUE.test(input.dialogue)) throw new Error(`Invalid dialogue slug: ${input.dialogue}`);
  if (!isDelegatedLunaReviewer(input.reviewer)) {
    throw new Error(
      "reviewer must identify an operator-delegated Luna reviewer, for example cjpher-delegated-luna-reviewer-<id>",
    );
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
  if (!Array.isArray(input.sampledCommentaryIds) || input.sampledCommentaryIds.length === 0) {
    throw new Error("sampledCommentaryIds must be explicitly provided and non-empty");
  }
  if (input.sampledCommentaryIds.some((id) => !COMMENTARY_ID.test(id))) {
    throw new Error("sampledCommentaryIds must contain only valid commentary IDs");
  }
  if (new Set(input.sampledCommentaryIds).size !== input.sampledCommentaryIds.length) {
    throw new Error("sampledCommentaryIds must be unique");
  }
  const expectedSampleOutput = new RegExp(
    `^scratch/commentary/audit-sample-reviews/${input.dialogue}/[a-f0-9]{16}\\.json$`,
    "u",
  );
  if (!expectedSampleOutput.test(input.sampleOutputPath)) {
    throw new Error(`sampleOutputPath must identify the current bounded scratch result for ${input.dialogue}`);
  }
  const expectedPreviewPath = expectedPendingPreviewPath(input.dialogue);
  if (input.pendingPreviewPath !== undefined && input.pendingPreviewPath !== expectedPreviewPath) {
    throw new Error(`pendingPreviewPath must be ${expectedPreviewPath}; legacy or alternate paths are not supported`);
  }
}

function activeLedgerIds(manifest: CommentaryQualityAuditManifest) {
  const ledgerContent = readFileSync(canonicalRepoFileForRead(manifest.ledger.path, "commentary ledger"), "utf8");
  return commentaryMarkdownBlocks(ledgerContent)
    .filter((block) => fieldValue(block.content, "review_status") === "accepted")
    .map((block) => fieldValue(block.content, "commentary_id") ?? "");
}

export function validateCommentaryQualityAuditAcceptanceSample(sampledIds: string[], activeIds: string[]) {
  const minimumSample = Math.min(15, activeIds.length);
  const indexes = sampledIds.map((id) => activeIds.indexOf(id));
  if (activeIds.length === 0) throw new Error("no active commentary IDs are available to sample");
  if (sampledIds.length < minimumSample) throw new Error(`sampledCommentaryIds must contain at least ${minimumSample} IDs`);
  if (sampledIds.length > activeIds.length) throw new Error("sampledCommentaryIds cannot exceed the active ID count");
  if (new Set(sampledIds).size !== sampledIds.length) throw new Error("sampledCommentaryIds must be unique");
  if (indexes.some((index) => index < 0)) throw new Error("sampledCommentaryIds must contain only active IDs");
  if (indexes.some((index, sampleIndex) => sampleIndex > 0 && index <= indexes[sampleIndex - 1]!)) {
    throw new Error("sampledCommentaryIds must use canonical ledger order");
  }
  if (activeIds.length <= 15 && sampledIds.some((id, index) => id !== activeIds[index])) {
    throw new Error("all active IDs must be sampled in canonical ledger order when there are 15 or fewer");
  }
}

function reviewReceiptSampledCommentaryIds(content: string) {
  const lines = content.split(/\r?\n/u).map((line) => line.trim());
  const markerIndexes = lines.flatMap((line, index) => line === "sampled_commentary_ids:" ? [index] : []);
  if (markerIndexes.length !== 1) return undefined;
  const sampledIds: string[] = [];
  for (const line of lines.slice(markerIndexes[0]! + 1)) {
    const match = /^- (comm_[a-z0-9-]+_\d{4})$/u.exec(line);
    if (!match) break;
    sampledIds.push(match[1]!);
  }
  return sampledIds;
}

function renderReviewNote(
  input: CommentaryQualityAuditAcceptanceInput,
  evidence: CommentaryAuditSampleEvidenceBundle,
) {
  return [
    "# Commentary quality-audit acceptance",
    "",
    `dialogue: ${input.dialogue}`,
    "decision: accepted",
    `reviewer: ${input.reviewer}`,
    `reviewed_on: ${input.reviewedOn}`,
    `rationale: ${input.rationale}`,
    COMMENTARY_QUALITY_AUDIT_REVIEW_BASIS,
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
    `sample_evidence_path: ${evidence.path}`,
    `sample_evidence_sha256: ${evidence.sha256}`,
    `sample_input_sha256: ${evidence.record.input_sha256}`,
    `pending_manifest_sha256: ${evidence.record.pending_manifest.sha256}`,
    `commentary_ledger_sha256: ${evidence.record.commentary_ledger.sha256}`,
    `sample_packet_sha256: ${evidence.record.sample_packet.sha256}`,
    `sample_output_sha256: ${evidence.record.sample_output.sha256}`,
    `sample_state_sha256: ${evidence.record.sample_state.sha256}`,
    `codex_execution_sha256: ${evidence.record.codex_execution.sha256}`,
    `output_schema_sha256: ${evidence.record.output_schema.sha256}`,
    `model_catalog_sha256: ${evidence.record.model_catalog.sha256}`,
    `sample_prompt_sha256: ${evidence.record.prompt.sha256}`,
    "sampled_commentary_ids:",
    ...input.sampledCommentaryIds.map((id) => `- ${id}`),
    "",
  ].join("\n");
}

function renderSupersedeReviewNote(
  input: CommentaryQualityAuditAcceptanceInput,
  evidence: CommentaryAuditSampleEvidenceBundle,
  predecessor: {
    manifestPath: string;
    manifestSha256: string;
    manifestHistoryPath: string;
    reviewNotePath: string;
    reviewNoteSha256: string;
    reviewNoteHistoryPath: string;
    ledgerPath: string;
    ledgerSha256: string;
    ledgerHistoryPath: string;
  },
) {
  return [
    renderReviewNote(input, evidence).trimEnd(),
    `predecessor_manifest_path: ${predecessor.manifestPath}`,
    `predecessor_manifest_sha256: ${predecessor.manifestSha256}`,
    `predecessor_manifest_history_path: ${predecessor.manifestHistoryPath}`,
    `predecessor_manifest_history_sha256: ${predecessor.manifestSha256}`,
    `predecessor_review_note_path: ${predecessor.reviewNotePath}`,
    `predecessor_review_note_sha256: ${predecessor.reviewNoteSha256}`,
    `predecessor_review_note_history_path: ${predecessor.reviewNoteHistoryPath}`,
    `predecessor_review_note_history_sha256: ${predecessor.reviewNoteSha256}`,
    `predecessor_ledger_path: ${predecessor.ledgerPath}`,
    `predecessor_ledger_sha256: ${predecessor.ledgerSha256}`,
    `predecessor_ledger_history_path: ${predecessor.ledgerHistoryPath}`,
    `predecessor_ledger_history_sha256: ${predecessor.ledgerSha256}`,
    "",
  ].join("\n");
}

type AcceptedPredecessor = {
  path: string;
  content: string;
  sha256: string;
  reviewNotePath: string;
  reviewNoteContent: string;
  reviewNoteSha256: string;
  ledgerPath: string;
  ledgerContent: string;
  ledgerSha256: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactFields(value: Record<string, unknown>, fields: ReadonlySet<string>) {
  const keys = Object.keys(value);
  return keys.length === fields.size && keys.every((key) => fields.has(key));
}

function loadAcceptedPredecessor(dialogue: string): AcceptedPredecessor {
  const path = manifestPath(dialogue);
  const absolutePath = canonicalRepoFileForRead(path, "accepted predecessor commentary audit manifest");
  if (!existsSync(absolutePath)) throw new Error(`Cannot supersede missing accepted commentary quality-audit manifest ${path}`);
  const content = readFileSync(absolutePath, "utf8");
  const sha256Value = sha256(content);
  let value: unknown;
  try {
    value = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (
    !record(value) ||
    !hasExactFields(value, TOP_LEVEL_FIELDS) ||
    value.schema_version !== 1 ||
    value.dialogue !== dialogue
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: schema or dialogue does not match`);
  }
  const ledger = record(value.ledger) ? value.ledger : undefined;
  const protocol = record(value.protocol) ? value.protocol : undefined;
  const authoring = record(value.authoring) ? value.authoring : undefined;
  if (
    !ledger || !hasExactFields(ledger, RESOURCE_FIELDS) || ledger.path !== `wiki/commentary/${dialogue}.md` ||
    typeof ledger.sha256 !== "string" || !SHA256.test(ledger.sha256) ||
    !protocol || !hasExactFields(protocol, RESOURCE_FIELDS) || protocol.path !== "docs/commentary-protocol.md" ||
    typeof protocol.sha256 !== "string" || !SHA256.test(protocol.sha256) ||
    !authoring || !hasExactFields(authoring, AUTHORING_FIELDS) ||
    authoring.model !== COMMENTARY_AUTHORING_MODEL || authoring.effort !== COMMENTARY_STAGE_EFFORT.audit
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: canonical resource bindings are malformed`);
  }
  const acceptance = record(value.acceptance) ? value.acceptance : undefined;
  if (!acceptance || !hasExactFields(acceptance, ACCEPTANCE_FIELDS) || acceptance.decision !== "accepted") {
    throw new Error(`Cannot supersede ${path} without an existing accepted Luna sample`);
  }
  if (
    !isDelegatedLunaReviewer(acceptance.reviewer) ||
    typeof acceptance.reviewed_on !== "string" || !validDate(acceptance.reviewed_on) ||
    typeof acceptance.rationale !== "string" || acceptance.rationale.trim() !== acceptance.rationale ||
    acceptance.rationale.length === 0 || acceptance.rationale.length > MAX_RATIONALE_LENGTH ||
    /[\r\n]/u.test(acceptance.rationale) || containsHumanListeningOrReviewClaim(acceptance.rationale) ||
    !Array.isArray(acceptance.sampled_commentary_ids) ||
    acceptance.sampled_commentary_ids.some((id) => typeof id !== "string" || !COMMENTARY_ID.test(id)) ||
    new Set(acceptance.sampled_commentary_ids).size !== acceptance.sampled_commentary_ids.length
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: accepted Luna provenance is malformed`);
  }
  const sampledCommentaryIds = acceptance.sampled_commentary_ids as string[];
  const units = Array.isArray(value.units) && value.units.length > 0 ? value.units : undefined;
  const historicalAuditedIds: string[] = [];
  const seenUnitKeys = new Set<string>();
  if (units) {
    for (const [index, unitValue] of units.entries()) {
      if (!record(unitValue)) {
        throw new Error(`Refusing invalid predecessor manifest ${path}: units[${index}] is malformed`);
      }
      const expectedFields = unitValue.provenance === undefined ? UNIT_FIELDS : UNIT_FIELDS_WITH_PROVENANCE;
      if (
        !hasExactFields(unitValue, expectedFields) ||
        typeof unitValue.unit_key !== "string" || unitValue.unit_key.length === 0 ||
        typeof unitValue.section_id !== "string" || !COMMENTARY_ID.test(unitValue.section_id) ||
        typeof unitValue.audit_brief_sha256 !== "string" || !SHA256.test(unitValue.audit_brief_sha256) ||
        typeof unitValue.output_path !== "string" ||
        unitValue.output_path !== `scratch/commentary/audits/${dialogue}/${unitValue.unit_key}.json` ||
        typeof unitValue.output_sha256 !== "string" || !SHA256.test(unitValue.output_sha256) ||
        !record(unitValue.output) ||
        seenUnitKeys.has(unitValue.unit_key)
      ) {
        throw new Error(`Refusing invalid predecessor manifest ${path}: units[${index}] has malformed bindings`);
      }
      seenUnitKeys.add(unitValue.unit_key);
      if (unitValue.provenance !== undefined) {
        const provenance = unitValue.provenance;
        if (
          !record(provenance) || !hasExactFields(provenance, PROVENANCE_FIELDS) ||
          typeof provenance.path !== "string" ||
          !/^wiki\/submissions\/commentary-audit\/[a-z0-9-]+\/[a-z0-9][a-z0-9._-]*\.json$/u.test(provenance.path) ||
          typeof provenance.sha256 !== "string" || !SHA256.test(provenance.sha256)
        ) {
          throw new Error(`Refusing invalid predecessor manifest ${path}: units[${index}].provenance is malformed`);
        }
        let provenanceAbsolutePath: string;
        try {
          provenanceAbsolutePath = canonicalRepoFileForRead(provenance.path, "delegated commentary provenance");
        } catch {
          throw new Error(`Refusing invalid predecessor manifest ${path}: units[${index}].provenance is stale`);
        }
        if (sha256(readFileSync(provenanceAbsolutePath)) !== provenance.sha256) {
          throw new Error(`Refusing invalid predecessor manifest ${path}: units[${index}].provenance is stale`);
        }
      }
      const rawBlocks = Array.isArray(unitValue.output.blocks) ? unitValue.output.blocks : [];
      const expectedCommentaryIds = rawBlocks.flatMap((block) =>
        record(block) && typeof block.commentary_id === "string" ? [block.commentary_id] : [],
      );
      try {
        const output = parseCommentaryQualityAudit(unitValue.output, {
          path: `predecessor units[${index}].output`,
          expectedCommentaryIds,
        });
        if (
          output.dialogue !== dialogue ||
          output.unit_key !== unitValue.unit_key ||
          output.section_id !== unitValue.section_id ||
          output.unit_verdict !== "pass" ||
          output.blocks.some((block) => block.disposition !== "pass") ||
          sha256(prettyJson(unitValue.output)) !== unitValue.output_sha256
        ) {
          throw new Error("identity, verdict, or output hash does not match");
        }
        historicalAuditedIds.push(...output.blocks.map((block) => block.commentary_id));
      } catch (error) {
        throw new Error(
          `Refusing invalid predecessor manifest ${path}: units[${index}] has an invalid embedded audit output: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
  if (
    !units || historicalAuditedIds.length === 0 ||
    historicalAuditedIds.some((id) => !COMMENTARY_ID.test(id)) ||
    new Set(historicalAuditedIds).size !== historicalAuditedIds.length
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: embedded audit coverage is malformed`);
  }
  const reviewNote = record(acceptance.review_note) ? acceptance.review_note : undefined;
  const reviewNotePathValue = reviewNote?.path;
  const reviewNoteSha256 = reviewNote?.sha256;
  if (
    !reviewNote || !hasExactFields(reviewNote, REVIEW_NOTE_FIELDS) ||
    typeof reviewNotePathValue !== "string" ||
    !/^wiki\/review\/[a-z0-9][a-z0-9._-]*\.md$/u.test(reviewNotePathValue) ||
    typeof reviewNoteSha256 !== "string" || !SHA256.test(reviewNoteSha256)
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: review receipt binding is malformed`);
  }
  const absoluteReviewNotePath = canonicalRepoFileForRead(reviewNotePathValue, "predecessor commentary review receipt");
  const reviewNoteContent = readFileSync(absoluteReviewNotePath, "utf8");
  if (sha256(reviewNoteContent) !== reviewNoteSha256) {
    throw new Error(`Refusing stale predecessor review receipt ${reviewNotePathValue}`);
  }
  const requiredLines = [
    `dialogue: ${dialogue}`,
    "decision: accepted",
    `reviewer: ${acceptance.reviewer}`,
    `reviewed_on: ${acceptance.reviewed_on}`,
    `rationale: ${acceptance.rationale}`,
    COMMENTARY_QUALITY_AUDIT_REVIEW_BASIS,
    COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  ];
  const lines = new Set(reviewNoteContent.split(/\r?\n/u).map((line) => line.trim()));
  const receiptSampledIds = reviewReceiptSampledCommentaryIds(reviewNoteContent);
  if (
    requiredLines.some((line) => !lines.has(line)) ||
    !receiptSampledIds ||
    receiptSampledIds.length !== sampledCommentaryIds.length ||
    receiptSampledIds.some((id, index) => id !== sampledCommentaryIds[index]) ||
    containsHumanListeningOrReviewClaim(
      reviewNoteContent.split(/\r?\n/u).filter((line) => line.trim() !== COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING).join("\n"),
    )
  ) {
    throw new Error(`Refusing invalid predecessor review receipt ${reviewNotePathValue}`);
  }
  const ledgerEvidence = readCommentaryAuditSampleLedgerEvidence({
    dialogue,
    noteContent: reviewNoteContent,
    expectedSha256: ledger.sha256 as string,
  });
  const historicalLedgerIds = commentaryMarkdownBlocks(ledgerEvidence.content).flatMap((block) => {
    if (fieldValue(block.content, "review_status") !== "accepted") return [];
    const id = fieldValue(block.content, "commentary_id");
    return id ? [id] : [];
  });
  const auditedSet = new Set(historicalAuditedIds);
  if (
    historicalLedgerIds.length !== historicalAuditedIds.length ||
    new Set(historicalLedgerIds).size !== historicalLedgerIds.length ||
    historicalLedgerIds.some((id) => !auditedSet.has(id))
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: preserved ledger and embedded audit coverage differ`);
  }
  validateCommentaryQualityAuditAcceptanceSample(sampledCommentaryIds, historicalLedgerIds);
  const predecessorProvenanceIssues = validateAcceptedCommentaryQualityAuditProvenance({
    dialogue,
    reviewer: acceptance.reviewer,
    reviewedOn: acceptance.reviewed_on,
    rationale: acceptance.rationale,
    sampledCommentaryIds,
    reviewNote,
    activeCommentaryIds: historicalLedgerIds,
    pendingManifestContent: prettyJson({
      ...value,
      acceptance: {
        decision: "pending",
        reviewer: null,
        reviewed_on: null,
        rationale: null,
        sampled_commentary_ids: [],
        review_note: null,
      },
    }),
    historical: true,
  });
  if (predecessorProvenanceIssues.length > 0) {
    throw new Error(`Refusing invalid predecessor sample provenance ${path}: ${predecessorProvenanceIssues.map((issue) => issue.message).join("; ")}`);
  }
  return {
    path,
    content,
    sha256: sha256Value,
    reviewNotePath: reviewNotePathValue,
    reviewNoteContent,
    reviewNoteSha256,
    ledgerPath: ledgerEvidence.path,
    ledgerContent: ledgerEvidence.content,
    ledgerSha256: ledgerEvidence.sha256,
  };
}

function loadCurrentPending(input: CommentaryQualityAuditAcceptanceInput) {
  const pendingPath = expectedPendingPreviewPath(input.dialogue);
  const absolutePendingPath = canonicalRepoFileForWrite(pendingPath, "pending commentary audit preview");
  if (!existsSync(absolutePendingPath)) {
    throw new Error(`Missing pending commentary audit preview ${pendingPath}; run audit-manifest-preview first`);
  }
  const pendingContent = readFileSync(canonicalRepoFileForRead(pendingPath, "pending commentary audit preview"), "utf8");
  const currentPending = buildCommentaryQualityAuditManifestPreview(input.dialogue);
  const currentPendingContent = prettyJson(currentPending);
  if (pendingContent !== currentPendingContent) {
    throw new Error(
      `Pending commentary audit preview ${pendingPath} is stale; regenerate it from the current ledger and audit outputs`,
    );
  }
  try {
    parseCommentaryQualityAuditManifest(manifestPath(input.dialogue), pendingContent);
  } catch (error) {
    throw new Error(
      `Pending commentary audit preview failed canonical validation: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return currentPending;
}

function loadCurrentPassingSample(
  input: CommentaryQualityAuditAcceptanceInput,
  pending: CommentaryQualityAuditManifest,
) {
  const evidence = buildCommentaryAuditSampleEvidenceBundle({
    dialogue: input.dialogue,
    sampleOutputPath: input.sampleOutputPath,
  });
  if (evidence.record.pending_manifest.content !== prettyJson(pending)) {
    throw new Error(`Independent sample evidence for ${input.dialogue} does not bind the current pending manifest`);
  }
  const review = evidence.review;
  if (
    review.reviewer.id !== input.reviewer || review.rationale !== input.rationale ||
    review.sampled_commentary_ids.length !== input.sampledCommentaryIds.length ||
    review.sampled_commentary_ids.some((id, index) => id !== input.sampledCommentaryIds[index])
  ) {
    throw new Error(`Acceptance inputs for ${input.dialogue} must exactly match the current passing sample output`);
  }
  return evidence;
}

export function previewCommentaryQualityAuditAcceptance(
  input: CommentaryQualityAuditAcceptanceInput,
): CommentaryQualityAuditAcceptancePreview {
  validateInput(input);
  const pending = loadCurrentPending(input);
  const evidence = loadCurrentPassingSample(input, pending);
  const activeIds = activeLedgerIds(pending);
  validateCommentaryQualityAuditAcceptanceSample(input.sampledCommentaryIds, activeIds);

  const reviewPath = reviewNotePath(input.dialogue, input.reviewedOn);
  const reviewNote = renderReviewNote(input, evidence);
  const manifest: CommentaryQualityAuditManifest = {
    ...pending,
    acceptance: {
      decision: "accepted",
      reviewer: input.reviewer,
      reviewed_on: input.reviewedOn,
      rationale: input.rationale,
      sampled_commentary_ids: [...input.sampledCommentaryIds],
      review_note: { path: reviewPath, sha256: sha256(reviewNote) },
    },
  };
  return {
    applied: false,
    pendingPreviewPath: expectedPendingPreviewPath(input.dialogue),
    manifestPath: manifestPath(input.dialogue),
    reviewNotePath: reviewPath,
    sampleEvidencePath: evidence.path,
    sampleEvidenceSha256: evidence.sha256,
    sampleEvidence: evidence.content,
    manifest,
    reviewNote,
  };
}

export function applyCommentaryQualityAuditAcceptance(
  input: CommentaryQualityAuditAcceptanceInput,
): CommentaryQualityAuditAcceptanceApply {
  const candidate = previewCommentaryQualityAuditAcceptance(input);
  const targetManifestPath = manifestPath(input.dialogue);
  const targetReviewPath = reviewNotePath(input.dialogue, input.reviewedOn);
  return withRepoWriteLock(
    {
      paths: [targetManifestPath, targetReviewPath, candidate.sampleEvidencePath],
      label: `commentary-quality-audit-acceptance:${input.dialogue}`,
    },
    () => {
      const preview = previewCommentaryQualityAuditAcceptance(input);
      if (
        preview.sampleEvidencePath !== candidate.sampleEvidencePath ||
        preview.sampleEvidenceSha256 !== candidate.sampleEvidenceSha256
      ) {
        throw new Error(`Independent sample evidence for ${input.dialogue} changed before apply`);
      }
      const manifestAbsolutePath = canonicalRepoFileForWrite(preview.manifestPath, "commentary audit manifest");
      const reviewAbsolutePath = canonicalRepoFileForWrite(preview.reviewNotePath, "commentary audit review note");
      const evidenceAbsolutePath = canonicalRepoFileForWrite(preview.sampleEvidencePath, "commentary sample evidence");
      if (existsSync(manifestAbsolutePath) || existsSync(reviewAbsolutePath) || existsSync(evidenceAbsolutePath)) {
        throw new Error(`Refusing to overwrite existing canonical acceptance files for ${input.dialogue}`);
      }

      // Validate all current ledger/output bindings before materializing either
      // canonical artifact. The review note is then written so the shared
      // manifest validator can perform its final hash-bound validation.
      const pendingIssues = validateCommentaryQualityAuditManifest(
        preview.manifestPath,
        prettyJson({ ...preview.manifest, acceptance: {
          decision: "pending",
          reviewer: null,
          reviewed_on: null,
          rationale: null,
          sampled_commentary_ids: [],
          review_note: null,
        } }),
      );
      if (pendingIssues.length > 0) {
        throw new Error(`Refusing acceptance with stale canonical inputs:\n${formatCommentaryQualityAuditManifestIssues(pendingIssues)}`);
      }

      mkdirSync(dirname(reviewAbsolutePath), { recursive: true });
      mkdirSync(dirname(evidenceAbsolutePath), { recursive: true });
      mkdirSync(dirname(manifestAbsolutePath), { recursive: true });
      assertCanonicalRepoFileParent(preview.reviewNotePath, "commentary audit review note");
      assertCanonicalRepoFileParent(preview.sampleEvidencePath, "commentary sample evidence");
      assertCanonicalRepoFileParent(preview.manifestPath, "commentary audit manifest");
      const suffix = `${process.pid}-${Date.now()}`;
      const evidenceTempPath = canonicalRepoFileForWrite(
        `${preview.sampleEvidencePath}.tmp-${suffix}`,
        "temporary commentary sample evidence",
      );
      const reviewTempPath = canonicalRepoFileForWrite(
        `${preview.reviewNotePath}.tmp-${suffix}`,
        "temporary commentary audit review note",
      );
      const manifestTempPath = canonicalRepoFileForWrite(
        `${preview.manifestPath}.tmp-${suffix}`,
        "temporary commentary audit manifest",
      );
      let evidenceCreated = false;
      let reviewCreated = false;
      try {
        writeFileSync(evidenceTempPath, preview.sampleEvidence, { encoding: "utf8", flag: "wx" });
        writeFileSync(reviewTempPath, preview.reviewNote, { encoding: "utf8", flag: "wx" });
        renameNewCanonicalFile(evidenceTempPath, preview.sampleEvidencePath, "commentary sample evidence");
        evidenceCreated = true;
        renameNewCanonicalFile(reviewTempPath, preview.reviewNotePath, "commentary audit review note");
        reviewCreated = true;
        const acceptedContent = prettyJson(preview.manifest);
        const issues = validateCommentaryQualityAuditManifest(preview.manifestPath, acceptedContent);
        if (issues.length > 0) {
          throw new Error(`Refusing invalid canonical acceptance:\n${formatCommentaryQualityAuditManifestIssues(issues)}`);
        }
        writeFileSync(manifestTempPath, acceptedContent, { encoding: "utf8", flag: "wx" });
        renameNewCanonicalFile(manifestTempPath, preview.manifestPath, "commentary audit manifest");
      } catch (error) {
        removeCanonicalTemporaryFile(evidenceTempPath, "temporary commentary sample evidence");
        removeCanonicalTemporaryFile(reviewTempPath, "temporary commentary audit review note");
        removeCanonicalTemporaryFile(manifestTempPath, "temporary commentary audit manifest");
        if (reviewCreated) removeCanonicalFileIfCreated(preview.reviewNotePath, "commentary audit review note");
        if (evidenceCreated) removeCanonicalFileIfCreated(preview.sampleEvidencePath, "commentary sample evidence");
        throw error;
      }
      return { ...preview, applied: true };
    },
  );
}

function buildSupersedePreview(
  input: CommentaryQualityAuditAcceptanceSupersedeInput,
): CommentaryQualityAuditAcceptanceSupersedePreview {
  validateInput(input);
  const predecessor = loadAcceptedPredecessor(input.dialogue);
  const ledgerPath = `wiki/commentary/${input.dialogue}.md`;
  const ledgerAbsolutePath = canonicalRepoFileForRead(ledgerPath, "commentary ledger");
  const currentLedgerSha256 = sha256(readFileSync(ledgerAbsolutePath));
  const predecessorValue = JSON.parse(predecessor.content) as Record<string, unknown>;
  const predecessorLedger = predecessorValue.ledger as Record<string, unknown>;
  if (predecessorLedger.sha256 === currentLedgerSha256) {
    throw new Error(
      `Refusing unchanged commentary quality-audit candidate for ${input.dialogue}: the canonical ledger has not changed; a supersede requires a fresh changed-ledger sample`,
    );
  }
  const predecessorAcceptance = predecessorValue.acceptance as Record<string, unknown>;
  if (predecessorAcceptance.reviewer === input.reviewer) {
    throw new Error("Refusing non-independent Luna supersede: predecessor and candidate reviewers are identical");
  }

  const pending = loadCurrentPending(input);
  const evidence = loadCurrentPassingSample(input, pending);
  if (pending.ledger.sha256 === predecessorLedger.sha256) {
    throw new Error(`Refusing unchanged commentary quality-audit candidate for ${input.dialogue}`);
  }
  const activeIds = activeLedgerIds(pending);
  validateCommentaryQualityAuditAcceptanceSample(input.sampledCommentaryIds, activeIds);

  const targetManifestPath = manifestPath(input.dialogue);
  const targetReviewNotePath = reviewNotePath(input.dialogue, input.reviewedOn);
  const manifestHistoryPath = predecessorManifestHistoryPath(input.dialogue, predecessor.sha256);
  const reviewNoteHistoryPath = predecessorReviewNoteHistoryPath(input.dialogue, predecessor.reviewNoteSha256);
  const ledgerHistoryPath = predecessorLedgerHistoryPath(input.dialogue, predecessor.ledgerSha256);
  const collisionPaths = [targetReviewNotePath, manifestHistoryPath, reviewNoteHistoryPath, ledgerHistoryPath, evidence.path];
  const collisions = collisionPaths.filter((path) => existsSync(canonicalRepoFileForWrite(path, "supersede artifact")));
  if (collisions.length > 0) {
    throw new Error(`Refusing supersede path collision: ${collisions.join(", ")}`);
  }

  const reviewNote = renderSupersedeReviewNote(input, evidence, {
    manifestPath: predecessor.path,
    manifestSha256: predecessor.sha256,
    manifestHistoryPath,
    reviewNotePath: predecessor.reviewNotePath,
    reviewNoteSha256: predecessor.reviewNoteSha256,
    reviewNoteHistoryPath,
    ledgerPath: predecessor.ledgerPath,
    ledgerSha256: predecessor.ledgerSha256,
    ledgerHistoryPath,
  });
  const manifest: CommentaryQualityAuditManifest = {
    ...pending,
    acceptance: {
      decision: "accepted",
      reviewer: input.reviewer,
      reviewed_on: input.reviewedOn,
      rationale: input.rationale,
      sampled_commentary_ids: [...input.sampledCommentaryIds],
      review_note: { path: targetReviewNotePath, sha256: sha256(reviewNote) },
    },
  };
  const manifestContent = prettyJson(manifest);
  if (sha256(manifestContent) === predecessor.sha256) {
    throw new Error(`Refusing unchanged commentary quality-audit candidate for ${input.dialogue}`);
  }
  return {
    applied: false,
    pendingPreviewPath: expectedPendingPreviewPath(input.dialogue),
    manifestPath: targetManifestPath,
    reviewNotePath: targetReviewNotePath,
    manifest,
    reviewNote,
    predecessorManifestPath: predecessor.path,
    predecessorManifestSha256: predecessor.sha256,
    predecessorManifestHistoryPath: manifestHistoryPath,
    predecessorReviewNotePath: predecessor.reviewNotePath,
    predecessorReviewNoteSha256: predecessor.reviewNoteSha256,
    predecessorReviewNoteHistoryPath: reviewNoteHistoryPath,
    predecessorLedgerPath: predecessor.ledgerPath,
    predecessorLedgerSha256: predecessor.ledgerSha256,
    predecessorLedgerHistoryPath: ledgerHistoryPath,
    predecessorLedgerContent: predecessor.ledgerContent,
    sampleEvidencePath: evidence.path,
    sampleEvidenceSha256: evidence.sha256,
    sampleEvidence: evidence.content,
  };
}

/**
 * Preview replacement of an accepted audit after the ledger changed. This
 * function is read-only: it writes neither the new acceptance nor history.
 */
export function previewCommentaryQualityAuditAcceptanceSupersede(
  input: CommentaryQualityAuditAcceptanceSupersedeInput,
): CommentaryQualityAuditAcceptanceSupersedePreview {
  return buildSupersedePreview(input);
}

/**
 * Apply a supersede under the repository lock. Every predecessor artifact is
 * copied byte-for-byte into content-addressed history before the canonical
 * manifest is replaced; the predecessor receipt itself is never overwritten.
 */
export function applyCommentaryQualityAuditAcceptanceSupersede(
  input: CommentaryQualityAuditAcceptanceSupersedeInput,
): CommentaryQualityAuditAcceptanceSupersedeApply {
  const candidate = buildSupersedePreview(input);
  const manifestPathValue = manifestPath(input.dialogue);
  return withRepoWriteLock(
    {
      paths: [
        manifestPathValue,
        reviewNotePath(input.dialogue, input.reviewedOn),
        candidate.sampleEvidencePath,
        candidate.predecessorManifestHistoryPath,
        candidate.predecessorReviewNoteHistoryPath,
        candidate.predecessorLedgerHistoryPath,
      ],
      label: `commentary-quality-audit-acceptance-supersede:${input.dialogue}`,
    },
    () => {
      const preview = buildSupersedePreview(input);
      if (
        preview.sampleEvidencePath !== candidate.sampleEvidencePath ||
        preview.sampleEvidenceSha256 !== candidate.sampleEvidenceSha256
      ) {
        throw new Error(`Independent sample evidence for ${input.dialogue} changed before supersede apply`);
      }
      const manifestAbsolutePath = canonicalRepoFileForRead(preview.manifestPath, "current commentary audit manifest");
      const reviewNoteAbsolutePath = canonicalRepoFileForWrite(preview.reviewNotePath, "supersede review note");
      const historyManifestAbsolutePath = canonicalRepoFileForWrite(
        preview.predecessorManifestHistoryPath,
        "predecessor manifest history",
      );
      const historyReviewNoteAbsolutePath = canonicalRepoFileForWrite(
        preview.predecessorReviewNoteHistoryPath,
        "predecessor review-note history",
      );
      const historyLedgerAbsolutePath = canonicalRepoFileForWrite(
        preview.predecessorLedgerHistoryPath,
        "predecessor commentary-ledger history",
      );
      const sampleEvidenceAbsolutePath = canonicalRepoFileForWrite(preview.sampleEvidencePath, "commentary sample evidence");
      if (
        existsSync(reviewNoteAbsolutePath) || existsSync(historyManifestAbsolutePath) ||
        existsSync(historyReviewNoteAbsolutePath) || existsSync(historyLedgerAbsolutePath) ||
        existsSync(sampleEvidenceAbsolutePath)
      ) {
        throw new Error(`Refusing supersede path collision for ${input.dialogue}`);
      }

      const predecessorManifestContent = readFileSync(manifestAbsolutePath, "utf8");
      const predecessorReviewNoteContent = readFileSync(
        canonicalRepoFileForRead(preview.predecessorReviewNotePath, "predecessor commentary review note"),
        "utf8",
      );
      if (
        sha256(predecessorManifestContent) !== preview.predecessorManifestSha256 ||
        sha256(predecessorReviewNoteContent) !== preview.predecessorReviewNoteSha256
      ) {
        throw new Error("Refusing stale supersede candidate: predecessor changed after preview");
      }

      const acceptedContent = prettyJson(preview.manifest);
      mkdirSync(dirname(historyManifestAbsolutePath), { recursive: true });
      mkdirSync(dirname(historyReviewNoteAbsolutePath), { recursive: true });
      mkdirSync(dirname(historyLedgerAbsolutePath), { recursive: true });
      mkdirSync(dirname(reviewNoteAbsolutePath), { recursive: true });
      mkdirSync(dirname(sampleEvidenceAbsolutePath), { recursive: true });
      assertCanonicalRepoFileParent(preview.predecessorManifestHistoryPath, "predecessor manifest history");
      assertCanonicalRepoFileParent(preview.predecessorReviewNoteHistoryPath, "predecessor review-note history");
      assertCanonicalRepoFileParent(preview.predecessorLedgerHistoryPath, "predecessor commentary-ledger history");
      assertCanonicalRepoFileParent(preview.reviewNotePath, "supersede review note");
      assertCanonicalRepoFileParent(preview.sampleEvidencePath, "commentary sample evidence");
      const suffix = `${process.pid}-${Date.now()}`;
      const tempPaths = {
        historyManifest: canonicalRepoFileForWrite(
          `${preview.predecessorManifestHistoryPath}.tmp-${suffix}`,
          "temporary predecessor manifest history",
        ),
        historyReviewNote: canonicalRepoFileForWrite(
          `${preview.predecessorReviewNoteHistoryPath}.tmp-${suffix}`,
          "temporary predecessor review-note history",
        ),
        historyLedger: canonicalRepoFileForWrite(
          `${preview.predecessorLedgerHistoryPath}.tmp-${suffix}`,
          "temporary predecessor commentary-ledger history",
        ),
        reviewNote: canonicalRepoFileForWrite(
          `${preview.reviewNotePath}.tmp-${suffix}`,
          "temporary supersede review note",
        ),
        sampleEvidence: canonicalRepoFileForWrite(
          `${preview.sampleEvidencePath}.tmp-${suffix}`,
          "temporary commentary sample evidence",
        ),
        manifest: canonicalRepoFileForWrite(
          `${preview.manifestPath}.tmp-${suffix}`,
          "temporary commentary audit manifest",
        ),
      };
      let historyManifestCreated = false;
      let historyReviewNoteCreated = false;
      let historyLedgerCreated = false;
      let reviewNoteCreated = false;
      let sampleEvidenceCreated = false;
      try {
        writeFileSync(tempPaths.historyManifest, predecessorManifestContent, { encoding: "utf8", flag: "wx" });
        writeFileSync(tempPaths.historyReviewNote, predecessorReviewNoteContent, { encoding: "utf8", flag: "wx" });
        if (sha256(preview.predecessorLedgerContent) !== preview.predecessorLedgerSha256) {
          throw new Error("Refusing stale supersede candidate: preserved predecessor ledger hash changed after preview");
        }
        writeFileSync(tempPaths.historyLedger, preview.predecessorLedgerContent, { encoding: "utf8", flag: "wx" });
        writeFileSync(tempPaths.reviewNote, preview.reviewNote, { encoding: "utf8", flag: "wx" });
        writeFileSync(tempPaths.sampleEvidence, preview.sampleEvidence, { encoding: "utf8", flag: "wx" });
        renameNewCanonicalFile(tempPaths.sampleEvidence, preview.sampleEvidencePath, "commentary sample evidence");
        sampleEvidenceCreated = true;
        renameNewCanonicalFile(tempPaths.reviewNote, preview.reviewNotePath, "supersede review note");
        reviewNoteCreated = true;
        renameNewCanonicalFile(
          tempPaths.historyManifest,
          preview.predecessorManifestHistoryPath,
          "predecessor manifest history",
        );
        historyManifestCreated = true;
        renameNewCanonicalFile(
          tempPaths.historyReviewNote,
          preview.predecessorReviewNoteHistoryPath,
          "predecessor review-note history",
        );
        historyReviewNoteCreated = true;
        renameNewCanonicalFile(
          tempPaths.historyLedger,
          preview.predecessorLedgerHistoryPath,
          "predecessor commentary-ledger history",
        );
        historyLedgerCreated = true;
        const issues = validateCommentaryQualityAuditManifest(preview.manifestPath, acceptedContent);
        if (issues.length > 0) {
          throw new Error(`Refusing invalid superseded canonical acceptance:\n${formatCommentaryQualityAuditManifestIssues(issues)}`);
        }
        writeFileSync(tempPaths.manifest, acceptedContent, { encoding: "utf8", flag: "wx" });
        replaceCanonicalFile(
          tempPaths.manifest,
          preview.manifestPath,
          preview.predecessorManifestSha256,
          "current commentary audit manifest",
        );
      } catch (error) {
        for (const path of Object.values(tempPaths)) {
          removeCanonicalTemporaryFile(path, "temporary supersede artifact");
        }
        if (reviewNoteCreated) removeCanonicalFileIfCreated(preview.reviewNotePath, "supersede review note");
        if (historyReviewNoteCreated) {
          removeCanonicalFileIfCreated(preview.predecessorReviewNoteHistoryPath, "predecessor review-note history");
        }
        if (historyLedgerCreated) {
          removeCanonicalFileIfCreated(preview.predecessorLedgerHistoryPath, "predecessor commentary-ledger history");
        }
        if (historyManifestCreated) {
          removeCanonicalFileIfCreated(preview.predecessorManifestHistoryPath, "predecessor manifest history");
        }
        if (sampleEvidenceCreated) {
          removeCanonicalFileIfCreated(preview.sampleEvidencePath, "commentary sample evidence");
        }
        throw error;
      }
      return { ...preview, applied: true };
    },
  );
}

// “Replacement” is the plain-language alias used by integrations; both names
// intentionally share the same fail-closed implementation and no fallback.
export const previewCommentaryQualityAuditAcceptanceReplacement =
  previewCommentaryQualityAuditAcceptanceSupersede;
export const applyCommentaryQualityAuditAcceptanceReplacement =
  applyCommentaryQualityAuditAcceptanceSupersede;

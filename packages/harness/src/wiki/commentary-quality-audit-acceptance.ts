import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseCommentaryQualityAudit } from "../commentary-audit.js";
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
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot } from "../paths.js";

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
  pendingPreviewPath?: string;
};

export type CommentaryQualityAuditAcceptancePreview = {
  applied: false;
  pendingPreviewPath: string;
  manifestPath: string;
  reviewNotePath: string;
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
};

export type CommentaryQualityAuditAcceptanceSupersedeApply =
  Omit<CommentaryQualityAuditAcceptanceSupersedePreview, "applied"> & { applied: true };

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
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
  const expectedPreviewPath = expectedPendingPreviewPath(input.dialogue);
  if (input.pendingPreviewPath !== undefined && input.pendingPreviewPath !== expectedPreviewPath) {
    throw new Error(`pendingPreviewPath must be ${expectedPreviewPath}; legacy or alternate paths are not supported`);
  }
}

function activeLedgerIds(manifest: CommentaryQualityAuditManifest) {
  const ledgerContent = readFileSync(join(getRepoRoot(), manifest.ledger.path), "utf8");
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

function validateHistoricalPredecessorSample(sampledIds: string[], historicalIds: string[]) {
  const minimumSample = Math.min(15, historicalIds.length);
  const historicalIdSet = new Set(historicalIds);
  if (sampledIds.length < minimumSample) {
    throw new Error(`sampledCommentaryIds must contain at least ${minimumSample} historical IDs`);
  }
  if (sampledIds.length > historicalIds.length) {
    throw new Error("sampledCommentaryIds cannot exceed the embedded historical ID count");
  }
  if (new Set(sampledIds).size !== sampledIds.length) {
    throw new Error("sampledCommentaryIds must be unique");
  }
  if (sampledIds.some((id) => !historicalIdSet.has(id))) {
    throw new Error("sampledCommentaryIds must contain only embedded historical IDs");
  }
  if (
    historicalIds.length <= 15 &&
    (sampledIds.length !== historicalIds.length || historicalIds.some((id) => !sampledIds.includes(id)))
  ) {
    throw new Error("all embedded historical IDs must be sampled when there are 15 or fewer");
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

function renderReviewNote(input: CommentaryQualityAuditAcceptanceInput) {
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
    "sampled_commentary_ids:",
    ...input.sampledCommentaryIds.map((id) => `- ${id}`),
    "",
  ].join("\n");
}

function renderSupersedeReviewNote(
  input: CommentaryQualityAuditAcceptanceInput,
  predecessor: {
    manifestPath: string;
    manifestSha256: string;
    manifestHistoryPath: string;
    reviewNotePath: string;
    reviewNoteSha256: string;
    reviewNoteHistoryPath: string;
  },
) {
  return [
    renderReviewNote(input).trimEnd(),
    `predecessor_manifest_path: ${predecessor.manifestPath}`,
    `predecessor_manifest_sha256: ${predecessor.manifestSha256}`,
    `predecessor_manifest_history_path: ${predecessor.manifestHistoryPath}`,
    `predecessor_manifest_history_sha256: ${predecessor.manifestSha256}`,
    `predecessor_review_note_path: ${predecessor.reviewNotePath}`,
    `predecessor_review_note_sha256: ${predecessor.reviewNoteSha256}`,
    `predecessor_review_note_history_path: ${predecessor.reviewNoteHistoryPath}`,
    `predecessor_review_note_history_sha256: ${predecessor.reviewNoteSha256}`,
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
  const absolutePath = join(getRepoRoot(), path);
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
  const historicalIds: string[] = [];
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
        const provenanceAbsolutePath = join(getRepoRoot(), provenance.path);
        if (!existsSync(provenanceAbsolutePath) || sha256(readFileSync(provenanceAbsolutePath)) !== provenance.sha256) {
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
        historicalIds.push(...output.blocks.map((block) => block.commentary_id));
      } catch (error) {
        throw new Error(
          `Refusing invalid predecessor manifest ${path}: units[${index}] has an invalid embedded audit output: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
  if (
    !units || historicalIds.length === 0 ||
    historicalIds.some((id) => !COMMENTARY_ID.test(id)) ||
    new Set(historicalIds).size !== historicalIds.length
  ) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: embedded audit coverage is malformed`);
  }
  try {
    // The predecessor ledger bytes are no longer canonical after a changed-ledger
    // supersede, while embedded outputs retain campaign-unit order rather than
    // ledger order. Validate the durable historical coverage here; the receipt
    // below remains the exact ordered record of the independently accepted sample.
    validateHistoricalPredecessorSample(sampledCommentaryIds, historicalIds);
  } catch (error) {
    throw new Error(`Refusing invalid predecessor manifest ${path}: ${error instanceof Error ? error.message : String(error)}`);
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
  const absoluteReviewNotePath = join(getRepoRoot(), reviewNotePathValue);
  if (!existsSync(absoluteReviewNotePath)) throw new Error(`Refusing missing predecessor review receipt ${reviewNotePathValue}`);
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
  return {
    path,
    content,
    sha256: sha256Value,
    reviewNotePath: reviewNotePathValue,
    reviewNoteContent,
    reviewNoteSha256,
  };
}

function loadCurrentPending(input: CommentaryQualityAuditAcceptanceInput) {
  const pendingPath = expectedPendingPreviewPath(input.dialogue);
  const absolutePendingPath = join(getRepoRoot(), pendingPath);
  if (!existsSync(absolutePendingPath)) {
    throw new Error(`Missing pending commentary audit preview ${pendingPath}; run audit-manifest-preview first`);
  }
  const pendingContent = readFileSync(absolutePendingPath, "utf8");
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

export function previewCommentaryQualityAuditAcceptance(
  input: CommentaryQualityAuditAcceptanceInput,
): CommentaryQualityAuditAcceptancePreview {
  validateInput(input);
  const pending = loadCurrentPending(input);
  const activeIds = activeLedgerIds(pending);
  validateCommentaryQualityAuditAcceptanceSample(input.sampledCommentaryIds, activeIds);

  const reviewPath = reviewNotePath(input.dialogue, input.reviewedOn);
  const reviewNote = renderReviewNote(input);
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
    manifest,
    reviewNote,
  };
}

export function applyCommentaryQualityAuditAcceptance(
  input: CommentaryQualityAuditAcceptanceInput,
): CommentaryQualityAuditAcceptanceApply {
  const targetManifestPath = manifestPath(input.dialogue);
  const targetReviewPath = reviewNotePath(input.dialogue, input.reviewedOn);
  return withRepoWriteLock(
    {
      paths: [targetManifestPath, targetReviewPath],
      label: `commentary-quality-audit-acceptance:${input.dialogue}`,
    },
    () => {
      const preview = previewCommentaryQualityAuditAcceptance(input);
      const manifestAbsolutePath = join(getRepoRoot(), preview.manifestPath);
      const reviewAbsolutePath = join(getRepoRoot(), preview.reviewNotePath);
      if (existsSync(manifestAbsolutePath) || existsSync(reviewAbsolutePath)) {
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
      const reviewTempPath = `${reviewAbsolutePath}.tmp-${process.pid}`;
      const manifestTempPath = `${manifestAbsolutePath}.tmp-${process.pid}`;
      writeFileSync(reviewTempPath, preview.reviewNote, "utf8");
      renameSync(reviewTempPath, reviewAbsolutePath);
      try {
        const acceptedContent = prettyJson(preview.manifest);
        const issues = validateCommentaryQualityAuditManifest(preview.manifestPath, acceptedContent);
        if (issues.length > 0) {
          throw new Error(`Refusing invalid canonical acceptance:\n${formatCommentaryQualityAuditManifestIssues(issues)}`);
        }
        mkdirSync(dirname(manifestAbsolutePath), { recursive: true });
        writeFileSync(manifestTempPath, acceptedContent, "utf8");
        renameSync(manifestTempPath, manifestAbsolutePath);
      } catch (error) {
        // The note was created by this operation and is not useful without its
        // manifest; remove only that newly-created file on failed apply.
        rmSync(reviewAbsolutePath, { force: true });
        rmSync(reviewTempPath, { force: true });
        rmSync(manifestTempPath, { force: true });
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
  const ledgerAbsolutePath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(ledgerAbsolutePath)) throw new Error(`Missing commentary ledger ${ledgerPath}`);
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
  if (pending.ledger.sha256 === predecessorLedger.sha256) {
    throw new Error(`Refusing unchanged commentary quality-audit candidate for ${input.dialogue}`);
  }
  const activeIds = activeLedgerIds(pending);
  validateCommentaryQualityAuditAcceptanceSample(input.sampledCommentaryIds, activeIds);

  const targetManifestPath = manifestPath(input.dialogue);
  const targetReviewNotePath = reviewNotePath(input.dialogue, input.reviewedOn);
  const manifestHistoryPath = predecessorManifestHistoryPath(input.dialogue, predecessor.sha256);
  const reviewNoteHistoryPath = predecessorReviewNoteHistoryPath(input.dialogue, predecessor.reviewNoteSha256);
  const collisionPaths = [targetReviewNotePath, manifestHistoryPath, reviewNoteHistoryPath];
  const collisions = collisionPaths.filter((path) => existsSync(join(getRepoRoot(), path)));
  if (collisions.length > 0) {
    throw new Error(`Refusing supersede path collision: ${collisions.join(", ")}`);
  }

  const reviewNote = renderSupersedeReviewNote(input, {
    manifestPath: predecessor.path,
    manifestSha256: predecessor.sha256,
    manifestHistoryPath,
    reviewNotePath: predecessor.reviewNotePath,
    reviewNoteSha256: predecessor.reviewNoteSha256,
    reviewNoteHistoryPath,
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
  const manifestPathValue = manifestPath(input.dialogue);
  return withRepoWriteLock(
    {
      paths: [manifestPathValue, reviewNotePath(input.dialogue, input.reviewedOn)],
      label: `commentary-quality-audit-acceptance-supersede:${input.dialogue}`,
    },
    () => {
      const preview = buildSupersedePreview(input);
      const root = getRepoRoot();
      const manifestAbsolutePath = join(root, preview.manifestPath);
      const reviewNoteAbsolutePath = join(root, preview.reviewNotePath);
      const historyManifestAbsolutePath = join(root, preview.predecessorManifestHistoryPath);
      const historyReviewNoteAbsolutePath = join(root, preview.predecessorReviewNoteHistoryPath);
      if (existsSync(reviewNoteAbsolutePath) || existsSync(historyManifestAbsolutePath) || existsSync(historyReviewNoteAbsolutePath)) {
        throw new Error(`Refusing supersede path collision for ${input.dialogue}`);
      }

      const predecessorManifestContent = readFileSync(manifestAbsolutePath, "utf8");
      const predecessorReviewNoteContent = readFileSync(join(root, preview.predecessorReviewNotePath), "utf8");
      if (
        sha256(predecessorManifestContent) !== preview.predecessorManifestSha256 ||
        sha256(predecessorReviewNoteContent) !== preview.predecessorReviewNoteSha256
      ) {
        throw new Error("Refusing stale supersede candidate: predecessor changed after preview");
      }

      const acceptedContent = prettyJson(preview.manifest);
      mkdirSync(dirname(historyManifestAbsolutePath), { recursive: true });
      mkdirSync(dirname(historyReviewNoteAbsolutePath), { recursive: true });
      mkdirSync(dirname(reviewNoteAbsolutePath), { recursive: true });
      const suffix = `${process.pid}-${Date.now()}`;
      const tempPaths = {
        historyManifest: `${historyManifestAbsolutePath}.tmp-${suffix}`,
        historyReviewNote: `${historyReviewNoteAbsolutePath}.tmp-${suffix}`,
        reviewNote: `${reviewNoteAbsolutePath}.tmp-${suffix}`,
        manifest: `${manifestAbsolutePath}.tmp-${suffix}`,
      };
      let historyManifestCreated = false;
      let historyReviewNoteCreated = false;
      let reviewNoteCreated = false;
      try {
        writeFileSync(tempPaths.historyManifest, predecessorManifestContent, "utf8");
        writeFileSync(tempPaths.historyReviewNote, predecessorReviewNoteContent, "utf8");
        writeFileSync(tempPaths.reviewNote, preview.reviewNote, "utf8");
        renameSync(tempPaths.reviewNote, reviewNoteAbsolutePath);
        reviewNoteCreated = true;
        const issues = validateCommentaryQualityAuditManifest(preview.manifestPath, acceptedContent);
        if (issues.length > 0) {
          throw new Error(`Refusing invalid superseded canonical acceptance:\n${formatCommentaryQualityAuditManifestIssues(issues)}`);
        }
        writeFileSync(tempPaths.manifest, acceptedContent, "utf8");
        renameSync(tempPaths.historyManifest, historyManifestAbsolutePath);
        historyManifestCreated = true;
        renameSync(tempPaths.historyReviewNote, historyReviewNoteAbsolutePath);
        historyReviewNoteCreated = true;
        renameSync(tempPaths.manifest, manifestAbsolutePath);
      } catch (error) {
        for (const path of Object.values(tempPaths)) rmSync(path, { force: true });
        if (reviewNoteCreated) rmSync(reviewNoteAbsolutePath, { force: true });
        if (historyReviewNoteCreated) rmSync(historyReviewNoteAbsolutePath, { force: true });
        if (historyManifestCreated) rmSync(historyManifestAbsolutePath, { force: true });
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

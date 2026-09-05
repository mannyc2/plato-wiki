import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  assertCommentaryAuditSampleEvidenceReplay,
  type CommentaryAuditSampleEvidenceRecord,
} from "../commentary-audit-sample-campaign.js";
import {
  COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG,
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_CODEX_CLI_VERSION,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_MODEL_CATALOG_PATH,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "../commentary-authoring.js";
import { canonicalRepoFileForRead } from "../repo-artifact-path.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { fieldValue } from "./observation-ledger.js";

const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
// `delegated-luna` is the semantic identity marker. Older reviewer ids also
// included the redundant `reviewer` segment; keep accepting those canonical
// receipts while allowing release-scoped delegated Luna identities.
const DELEGATED_LUNA_REVIEWER = /^[a-z0-9][a-z0-9-]*-delegated-luna-(?:(?:rewrite-)?reviewer-)?[a-z0-9][a-z0-9-]*$/u;
// Ordinary quality language such as "listening sequence" or "spoken-audio
// listening quality" is part of the commentary contract, not a claim that a
// person performed the review. Fail only on an actual human/person reference
// or an explicit first-person/reviewer/listener claim of hearing or review.
const HUMAN_LISTENING_OR_REVIEW_CLAIM =
  /\bhuman[ -](?:listen(?:ed|ing)?|hear(?:d|ing)?|audition(?:ed|ing)?|review(?:er|ed|ing)?|accept(?:ance|ed))\b|\b(?:i|we|human|person|people|reviewer|operator|editor|listener)\b[^\r\n.!?]{0,80}\b(?:listen(?:ed|ing)?|hear(?:d|ing)?|audition(?:ed|ing)?|review(?:ed|ing))\b|\b(?:listen(?:ed|ing)?|hear(?:d|ing)?|audition(?:ed|ing)?|review(?:ed|ing))\b[^\r\n.!?]{0,80}\bby\s+(?:me|us|a\s+human|a\s+person|people|a\s+reviewer|an\s+operator|a\s+listener)\b/iu;

export const COMMENTARY_QUALITY_AUDIT_REVIEW_BASIS = "review_basis: operator-delegated independent Luna sample review";
export const COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING = "human_listening_or_review: none claimed";

export function isDelegatedLunaReviewer(value: unknown): value is string {
  return typeof value === "string" && DELEGATED_LUNA_REVIEWER.test(value);
}

export function containsHumanListeningOrReviewClaim(value: string) {
  return HUMAN_LISTENING_OR_REVIEW_CLAIM.test(value);
}

export type CommentaryQualityAuditAcceptanceProvenanceIssue = {
  code:
    | "invalid_acceptance"
    | "invalid_acceptance_sample"
    | "invalid_review_note"
    | "invalid_hash"
    | "review_note_hash_mismatch";
  message: string;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length && actual.every((key, index) => key === sortedExpected[index]);
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function noteField(noteContent: string, field: string) {
  const prefix = `${field}: `;
  const values = noteContent.split(/\r?\n/u).flatMap((line) => line.startsWith(prefix) ? [line.slice(prefix.length)] : []);
  return values.length === 1 ? values[0] : undefined;
}

function evidenceResource(
  value: unknown,
  expectedPath: string,
): { path: string; sha256: string; content: string } | undefined {
  if (!record(value) || !exactKeys(value, ["path", "sha256", "content"])) return undefined;
  if (value.path !== expectedPath || typeof value.sha256 !== "string" || !SHA256.test(value.sha256) || typeof value.content !== "string") {
    return undefined;
  }
  return sha256(value.content) === value.sha256 ? {
    path: value.path,
    sha256: value.sha256,
    content: value.content,
  } : undefined;
}

function validateDurableSampleEvidence(input: {
  dialogue: string;
  reviewer: string;
  rationale: string;
  sampledIds: string[];
  noteContent: string;
  pendingManifestContent: string;
  activeCommentaryIds: string[];
  historical?: boolean;
}) {
  const evidencePath = noteField(input.noteContent, "sample_evidence_path");
  const evidenceSha256 = noteField(input.noteContent, "sample_evidence_sha256");
  if (
    !evidencePath || !evidenceSha256 || !SHA256.test(evidenceSha256) ||
    evidencePath !== `wiki/submissions/commentary-audit-sample/${input.dialogue}/${evidenceSha256}.json`
  ) {
    return "Acceptance review note does not bind one canonical content-addressed independent sample evidence record.";
  }
  let evidenceAbsolutePath: string;
  try {
    evidenceAbsolutePath = canonicalRepoFileForRead(evidencePath, "independent sample evidence");
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  const evidenceContent = readFileSync(evidenceAbsolutePath, "utf8");
  if (sha256(evidenceContent) !== evidenceSha256) return `Independent sample evidence hash is stale for ${evidencePath}.`;
  let evidence: unknown;
  try {
    evidence = JSON.parse(evidenceContent) as unknown;
  } catch {
    return `Independent sample evidence is malformed JSON at ${evidencePath}.`;
  }
  const topFields = [
    "schema_version", "campaign", "dialogue", "job_id", "reviewer_id", "input_sha256", "invocation",
    "pending_manifest", "commentary_ledger", "sample_packet", "output_schema", "model_catalog", "prompt",
    "sample_output", "sample_state", "codex_execution",
  ] as const;
  if (
    !record(evidence) || !exactKeys(evidence, topFields) || evidenceContent !== prettyJson(evidence) ||
    evidence.schema_version !== 1 || evidence.campaign !== "plato-commentary-independent-luna-sample" ||
    evidence.dialogue !== input.dialogue || evidence.reviewer_id !== input.reviewer ||
    typeof evidence.input_sha256 !== "string" || !SHA256.test(evidence.input_sha256)
  ) {
    return `Independent sample evidence has invalid canonical identity at ${evidencePath}.`;
  }
  const identity = evidence.input_sha256.slice(0, 16);
  const invocation = record(evidence.invocation) ? evidence.invocation : undefined;
  if (
    !invocation || !exactKeys(invocation, [
      "executable", "codex_cli_version", "model_argument", "authoring_model", "effort", "permission_mode", "isolation_config",
    ]) || invocation.executable !== "codex" || invocation.codex_cli_version !== COMMENTARY_CODEX_CLI_VERSION ||
    invocation.model_argument !== COMMENTARY_MODEL_ARGUMENT || invocation.authoring_model !== COMMENTARY_AUTHORING_MODEL ||
    invocation.effort !== COMMENTARY_STAGE_EFFORT.audit || invocation.permission_mode !== COMMENTARY_PERMISSION_MODE ||
    !Array.isArray(invocation.isolation_config) ||
    invocation.isolation_config.length !== COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG.length ||
    invocation.isolation_config.some((entry, index) => entry !== COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG[index])
  ) {
    return `Independent sample evidence has invalid isolated invocation provenance at ${evidencePath}.`;
  }
  const pending = evidenceResource(evidence.pending_manifest, `scratch/commentary/audit-manifests/${input.dialogue}.json`);
  const ledger = evidenceResource(evidence.commentary_ledger, `wiki/commentary/${input.dialogue}.md`);
  const packet = evidenceResource(evidence.sample_packet, `scratch/commentary/audit-sample-packets/${input.dialogue}/${identity}.md`);
  const schema = evidenceResource(evidence.output_schema, `scratch/commentary/audit-sample-schemas/${input.dialogue}/${identity}.json`);
  const catalog = evidenceResource(evidence.model_catalog, COMMENTARY_MODEL_CATALOG_PATH);
  const output = evidenceResource(evidence.sample_output, `scratch/commentary/audit-sample-reviews/${input.dialogue}/${identity}.json`);
  const state = evidenceResource(evidence.sample_state, `scratch/commentary/audit-sample-state/${input.dialogue}/${identity}.json`);
  const execution = evidenceResource(
    evidence.codex_execution,
    `scratch/commentary/audit-sample-executions/${input.dialogue}/${identity}.jsonl`,
  );
  const prompt = record(evidence.prompt) && exactKeys(evidence.prompt, ["sha256", "content"]) &&
      typeof evidence.prompt.sha256 === "string" && SHA256.test(evidence.prompt.sha256) &&
      typeof evidence.prompt.content === "string" && sha256(evidence.prompt.content) === evidence.prompt.sha256
    ? evidence.prompt as { sha256: string; content: string }
    : undefined;
  if (!pending || !ledger || !packet || !schema || !catalog || !output || !state || !execution || !prompt) {
    return `Independent sample evidence has a missing, stale, or noncanonical resource binding at ${evidencePath}.`;
  }
  if (pending.content !== input.pendingManifestContent) {
    return `Independent sample evidence does not bind the exact pending manifest accepted by ${evidencePath}.`;
  }
  let liveCatalogPath: string;
  try {
    liveCatalogPath = canonicalRepoFileForRead(COMMENTARY_MODEL_CATALOG_PATH, "Luna model catalog");
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  if (readFileSync(liveCatalogPath, "utf8") !== catalog.content) {
    return `Independent sample evidence model catalog is stale at ${evidencePath}.`;
  }
  let review: unknown;
  let sampleState: unknown;
  try {
    review = JSON.parse(output.content) as unknown;
    sampleState = JSON.parse(state.content) as unknown;
    JSON.parse(schema.content);
  } catch {
    return `Independent sample evidence contains malformed normalized JSON at ${evidencePath}.`;
  }
  if (
    !record(review) || output.content !== prettyJson(review) || review.schema_version !== 1 || review.dialogue !== input.dialogue ||
    review.sample_verdict !== "pass" || review.rationale !== input.rationale ||
    !record(review.reviewer) || review.reviewer.id !== input.reviewer ||
    review.reviewer.model !== COMMENTARY_AUTHORING_MODEL || review.reviewer.effort !== COMMENTARY_STAGE_EFFORT.audit ||
    review.pending_manifest_sha256 !== pending.sha256 || review.sample_packet_sha256 !== packet.sha256 ||
    !Array.isArray(review.sampled_commentary_ids) || review.sampled_commentary_ids.length !== input.sampledIds.length ||
    review.sampled_commentary_ids.some((id, index) => id !== input.sampledIds[index]) ||
    !Array.isArray(review.blocks) || review.blocks.length !== input.sampledIds.length ||
    review.blocks.some((block, index) => !record(block) || block.commentary_id !== input.sampledIds[index] || block.verdict !== "pass")
  ) {
    return `Independent sample evidence does not contain the exact passing review recorded by ${evidencePath}.`;
  }
  if (
    !record(sampleState) || state.content !== prettyJson(sampleState) ||
    sampleState.campaign !== "plato-commentary-independent-luna-sample" || sampleState.dialogue !== input.dialogue ||
    sampleState.reviewer_id !== input.reviewer || sampleState.input_sha256 !== evidence.input_sha256 ||
    sampleState.pending_manifest_sha256 !== pending.sha256 || sampleState.sample_packet_sha256 !== packet.sha256 ||
    sampleState.output_schema_sha256 !== schema.sha256 || sampleState.model_catalog_sha256 !== catalog.sha256 ||
    sampleState.prompt_sha256 !== prompt.sha256 || sampleState.output_sha256 !== output.sha256 ||
    sampleState.execution_path !== execution.path || sampleState.execution_sha256 !== execution.sha256 ||
    sampleState.sample_verdict !== "pass" || sampleState.permission_mode !== COMMENTARY_PERMISSION_MODE ||
    sampleState.codex_cli_version !== COMMENTARY_CODEX_CLI_VERSION || sampleState.model !== COMMENTARY_AUTHORING_MODEL ||
    sampleState.effort !== COMMENTARY_STAGE_EFFORT.audit
  ) {
    return `Independent sample evidence state does not bind the exact passing invocation at ${evidencePath}.`;
  }
  const expectedNoteBindings = new Map([
    ["sample_input_sha256", evidence.input_sha256],
    ["pending_manifest_sha256", pending.sha256],
    ["commentary_ledger_sha256", ledger.sha256],
    ["sample_packet_sha256", packet.sha256],
    ["sample_output_sha256", output.sha256],
    ["sample_state_sha256", state.sha256],
    ["codex_execution_sha256", execution.sha256],
    ["output_schema_sha256", schema.sha256],
    ["model_catalog_sha256", catalog.sha256],
    ["sample_prompt_sha256", prompt.sha256],
  ]);
  if ([...expectedNoteBindings].some(([field, expected]) => noteField(input.noteContent, field) !== expected)) {
    return `Acceptance review note component hashes do not match ${evidencePath}.`;
  }
  try {
    assertCommentaryAuditSampleEvidenceReplay({
      evidence: evidence as unknown as CommentaryAuditSampleEvidenceRecord,
      pendingManifestContent: input.pendingManifestContent,
      activeCommentaryIds: input.activeCommentaryIds,
      ...(input.historical ? { historical: true } : {}),
    });
  } catch (error) {
    return `Independent sample evidence does not replay exactly at ${evidencePath}: ${error instanceof Error ? error.message : String(error)}`;
  }
  return undefined;
}

export function readCommentaryAuditSampleLedgerEvidence(input: {
  dialogue: string;
  noteContent: string;
  expectedSha256: string;
}) {
  const evidencePath = noteField(input.noteContent, "sample_evidence_path");
  const evidenceSha256 = noteField(input.noteContent, "sample_evidence_sha256");
  if (
    !evidencePath || !evidenceSha256 || !SHA256.test(evidenceSha256) ||
    evidencePath !== `wiki/submissions/commentary-audit-sample/${input.dialogue}/${evidenceSha256}.json`
  ) {
    throw new Error("Review note does not bind one canonical independent sample evidence record");
  }
  const absolutePath = canonicalRepoFileForRead(evidencePath, "independent sample evidence");
  const content = readFileSync(absolutePath, "utf8");
  if (sha256(content) !== evidenceSha256) throw new Error(`Independent sample evidence hash is stale for ${evidencePath}`);
  const parsed = JSON.parse(content) as unknown;
  if (!record(parsed) || content !== prettyJson(parsed) || parsed.dialogue !== input.dialogue) {
    throw new Error(`Independent sample evidence is not canonical for ${input.dialogue}`);
  }
  const ledger = evidenceResource(parsed.commentary_ledger, `wiki/commentary/${input.dialogue}.md`);
  if (!ledger || ledger.sha256 !== input.expectedSha256) {
    throw new Error(`Independent sample evidence does not preserve the accepted ${input.dialogue} commentary ledger`);
  }
  return ledger;
}

function validReviewDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function reviewNoteClaimsHumanListeningOrReview(noteContent: string) {
  const withoutExplicitNoClaim = noteContent
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING)
    .join("\n");
  return containsHumanListeningOrReviewClaim(withoutExplicitNoClaim);
}

const PREDECESSOR_FIELDS = [
  "predecessor_manifest_path",
  "predecessor_manifest_sha256",
  "predecessor_manifest_history_path",
  "predecessor_manifest_history_sha256",
  "predecessor_review_note_path",
  "predecessor_review_note_sha256",
  "predecessor_review_note_history_path",
  "predecessor_review_note_history_sha256",
  "predecessor_ledger_path",
  "predecessor_ledger_sha256",
  "predecessor_ledger_history_path",
  "predecessor_ledger_history_sha256",
] as const;

function validatePredecessorHistoryBindings(dialogue: string, noteContent: string): string | undefined {
  const values = Object.fromEntries(PREDECESSOR_FIELDS.map((field) => [field, noteField(noteContent, field)])) as
    Record<(typeof PREDECESSOR_FIELDS)[number], string | undefined>;
  const present = PREDECESSOR_FIELDS.filter((field) => values[field] !== undefined);
  if (present.length === 0) return undefined;
  if (present.length !== PREDECESSOR_FIELDS.length) {
    return "Supersede review note must contain every predecessor history binding exactly once.";
  }
  const manifestSha = values.predecessor_manifest_sha256!;
  const reviewSha = values.predecessor_review_note_sha256!;
  const ledgerSha = values.predecessor_ledger_sha256!;
  if (![manifestSha, reviewSha, ledgerSha].every((value) => SHA256.test(value))) {
    return "Supersede predecessor hashes must be lowercase SHA-256 digests.";
  }
  const expected = {
    predecessor_manifest_path: `wiki/commentary-audits/${dialogue}.json`,
    predecessor_manifest_history_path: `wiki/commentary-audits/history/${dialogue}/${manifestSha}.json`,
    predecessor_manifest_history_sha256: manifestSha,
    predecessor_review_note_history_path: `wiki/review/commentary-quality-history/${dialogue}/${reviewSha}.md`,
    predecessor_review_note_history_sha256: reviewSha,
    predecessor_ledger_path: `wiki/commentary/${dialogue}.md`,
    predecessor_ledger_history_path: `wiki/commentary-audits/history/${dialogue}/ledgers/${ledgerSha}.md`,
    predecessor_ledger_history_sha256: ledgerSha,
  } as const;
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (values[field as keyof typeof values] !== expectedValue) {
      return `Supersede predecessor binding ${field} is not canonical.`;
    }
  }
  const predecessorReviewPath = values.predecessor_review_note_path!;
  if (!/^wiki\/review\/[a-z0-9][a-z0-9._-]*\.md$/u.test(predecessorReviewPath)) {
    return "Supersede predecessor review-note path is not canonical.";
  }
  let manifestContent: string;
  let reviewContent: string;
  let ledgerContent: string;
  try {
    manifestContent = readFileSync(
      canonicalRepoFileForRead(values.predecessor_manifest_history_path!, "predecessor manifest history"),
      "utf8",
    );
    reviewContent = readFileSync(
      canonicalRepoFileForRead(values.predecessor_review_note_history_path!, "predecessor review-note history"),
      "utf8",
    );
    ledgerContent = readFileSync(
      canonicalRepoFileForRead(values.predecessor_ledger_history_path!, "predecessor commentary-ledger history"),
      "utf8",
    );
    const originalReviewContent = readFileSync(
      canonicalRepoFileForRead(predecessorReviewPath, "predecessor commentary review note"),
      "utf8",
    );
    if (originalReviewContent !== reviewContent) {
      return "Supersede predecessor review-note history does not preserve the original receipt bytes.";
    }
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  if (sha256(manifestContent) !== manifestSha || sha256(reviewContent) !== reviewSha || sha256(ledgerContent) !== ledgerSha) {
    return "Supersede predecessor history content does not match its content-addressed hashes.";
  }
  let predecessor: Record<string, unknown>;
  try {
    const parsed = JSON.parse(manifestContent) as unknown;
    if (!record(parsed) || manifestContent !== prettyJson(parsed)) throw new Error("manifest is not normalized JSON");
    predecessor = parsed;
  } catch (error) {
    return `Supersede predecessor manifest history is malformed: ${error instanceof Error ? error.message : String(error)}`;
  }
  const ledger = record(predecessor.ledger) ? predecessor.ledger : undefined;
  const acceptance = record(predecessor.acceptance) ? predecessor.acceptance : undefined;
  const reviewNote = acceptance && record(acceptance.review_note) ? acceptance.review_note : undefined;
  if (
    predecessor.dialogue !== dialogue || !ledger || ledger.path !== values.predecessor_ledger_path ||
    ledger.sha256 !== ledgerSha || !acceptance || acceptance.decision !== "accepted" || !reviewNote ||
    reviewNote.path !== predecessorReviewPath || reviewNote.sha256 !== reviewSha
  ) {
    return "Supersede predecessor histories do not reciprocally bind the predecessor manifest.";
  }
  const activeIds = commentaryMarkdownBlocks(ledgerContent).flatMap((block) => {
    if (fieldValue(block.content, "review_status") !== "accepted") return [];
    const id = fieldValue(block.content, "commentary_id");
    return id ? [id] : [];
  });
  const pendingManifestContent = prettyJson({
    ...predecessor,
    acceptance: {
      decision: "pending",
      reviewer: null,
      reviewed_on: null,
      rationale: null,
      sampled_commentary_ids: [],
      review_note: null,
    },
  });
  const predecessorIssues = validateAcceptedCommentaryQualityAuditProvenance({
    dialogue,
    reviewer: acceptance.reviewer,
    reviewedOn: acceptance.reviewed_on,
    rationale: acceptance.rationale,
    sampledCommentaryIds: acceptance.sampled_commentary_ids,
    reviewNote: { path: predecessorReviewPath, sha256: reviewSha },
    activeCommentaryIds: activeIds,
    pendingManifestContent,
    historical: true,
  });
  if (predecessorIssues.length > 0) {
    return `Supersede predecessor history does not replay: ${predecessorIssues.map((issue) => issue.message).join("; ")}`;
  }
  return undefined;
}

export function validateAcceptedCommentaryQualityAuditProvenance(input: {
  dialogue: string;
  reviewer: unknown;
  reviewedOn: unknown;
  rationale: unknown;
  sampledCommentaryIds: unknown;
  reviewNote: unknown;
  activeCommentaryIds: string[];
  pendingManifestContent: string;
  historical?: boolean;
}): CommentaryQualityAuditAcceptanceProvenanceIssue[] {
  const issues: CommentaryQualityAuditAcceptanceProvenanceIssue[] = [];
  const addIssue = (
    code: CommentaryQualityAuditAcceptanceProvenanceIssue["code"],
    message: string,
  ) => issues.push({ code, message });

  if (
    !isDelegatedLunaReviewer(input.reviewer) ||
    !nonEmptyString(input.reviewedOn) ||
    !validReviewDate(input.reviewedOn) ||
    !nonEmptyString(input.rationale)
  ) {
    addIssue(
      "invalid_acceptance",
      "Accepted quality audit requires a non-empty operator-delegated Luna reviewer, valid YYYY-MM-DD reviewed_on date, and rationale.",
    );
  }
  if (!isDelegatedLunaReviewer(input.reviewer)) {
    addIssue(
      "invalid_acceptance",
      "Accepted quality audit reviewer must identify an operator-delegated Luna reviewer.",
    );
  }
  if (typeof input.rationale === "string" && containsHumanListeningOrReviewClaim(input.rationale)) {
    addIssue(
      "invalid_acceptance",
      "Accepted quality-audit rationale must not claim human listening or human review.",
    );
  }

  const sampledIds = Array.isArray(input.sampledCommentaryIds) &&
      input.sampledCommentaryIds.every((id) => typeof id === "string")
    ? input.sampledCommentaryIds as string[]
    : [];
  const sampledIndexes = sampledIds.map((id) => input.activeCommentaryIds.indexOf(id));
  const minimumSample = Math.min(15, input.activeCommentaryIds.length);
  if (
    sampledIds.length < minimumSample ||
    new Set(sampledIds).size !== sampledIds.length ||
    sampledIndexes.some((index) => index < 0) ||
    sampledIndexes.some(
      (index, indexInSample) => indexInSample > 0 && index <= sampledIndexes[indexInSample - 1]!,
    ) ||
    (input.activeCommentaryIds.length <= 15 &&
      sampledIds.some((id, index) => id !== input.activeCommentaryIds[index]))
  ) {
    addIssue(
      "invalid_acceptance_sample",
      `Accepted quality audit must sample unique active accepted commentary IDs in ledger order: at least ${minimumSample}, and all active IDs when there are 15 or fewer. Rejected IDs are excluded.`,
    );
  }

  const reviewNote = input.reviewNote && typeof input.reviewNote === "object" && !Array.isArray(input.reviewNote)
    ? input.reviewNote as Record<string, unknown>
    : undefined;
  const reviewNotePath = reviewNote?.path;
  const reviewNoteSha256 = reviewNote?.sha256;
  if (typeof reviewNotePath !== "string" || !/^wiki\/review\/[a-z0-9][a-z0-9._-]*\.md$/u.test(reviewNotePath)) {
    addIssue(
      "invalid_review_note",
      "Accepted quality audit requires a canonical wiki/review/<note>.md path and SHA-256.",
    );
  } else {
    if (typeof reviewNoteSha256 !== "string" || !SHA256.test(reviewNoteSha256)) {
      addIssue("invalid_hash", "acceptance.review_note.sha256 must be a lowercase SHA-256 digest.");
    }
    let noteContent: string | undefined;
    try {
      noteContent = readFileSync(canonicalRepoFileForRead(reviewNotePath, "acceptance review note"), "utf8");
    } catch (error) {
      addIssue("invalid_review_note", error instanceof Error ? error.message : String(error));
    }
    if (noteContent !== undefined) {
      if (typeof reviewNoteSha256 !== "string" || sha256(noteContent) !== reviewNoteSha256) {
        addIssue("review_note_hash_mismatch", `acceptance.review_note.sha256 is stale for ${reviewNotePath}.`);
      }
      const lines = new Set(noteContent.split(/\r?\n/u).map((line) => line.trim()));
      if (
        !lines.has(`dialogue: ${input.dialogue}`) ||
        !lines.has("decision: accepted") ||
        !lines.has(`reviewer: ${input.reviewer}`) ||
        !lines.has(`reviewed_on: ${input.reviewedOn}`) ||
        !lines.has(`rationale: ${input.rationale}`) ||
        !lines.has(COMMENTARY_QUALITY_AUDIT_REVIEW_BASIS) ||
        !lines.has(COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING) ||
        reviewNoteClaimsHumanListeningOrReview(noteContent) ||
        sampledIds.some((id) => !lines.has(`- ${id}`))
      ) {
        addIssue(
          "invalid_review_note",
          "Acceptance review note must record the dialogue, accepted decision, operator-delegated Luna reviewer, date, rationale, independent Luna sample basis, explicit no-human-listening/review statement, and every sampled commentary ID.",
        );
      }
      if (isDelegatedLunaReviewer(input.reviewer) && typeof input.rationale === "string") {
        const evidenceIssue = validateDurableSampleEvidence({
          dialogue: input.dialogue,
          reviewer: input.reviewer,
          rationale: input.rationale,
          sampledIds,
          noteContent,
          pendingManifestContent: input.pendingManifestContent,
          activeCommentaryIds: input.activeCommentaryIds,
          ...(input.historical ? { historical: true } : {}),
        });
        if (evidenceIssue) addIssue("invalid_review_note", evidenceIssue);
      }
      const predecessorIssue = validatePredecessorHistoryBindings(input.dialogue, noteContent);
      if (predecessorIssue) addIssue("invalid_review_note", predecessorIssue);
    }
  }
  return issues;
}

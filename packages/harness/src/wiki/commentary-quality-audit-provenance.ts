import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";

const SHA256 = /^[a-f0-9]{64}$/u;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const DELEGATED_LUNA_REVIEWER = /^[a-z0-9][a-z0-9-]*-delegated-luna-(?:rewrite-)?reviewer-[a-z0-9][a-z0-9-]*$/u;
const HUMAN_LISTENING_OR_REVIEW_CLAIM = /\b(?:human|person|people|listened|listening|heard|audition(?:ed|ing)?|human[ -](?:review|reviewed|reviewing|acceptance|accepted))\b/iu;

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

export function validateAcceptedCommentaryQualityAuditProvenance(input: {
  dialogue: string;
  reviewer: unknown;
  reviewedOn: unknown;
  rationale: unknown;
  sampledCommentaryIds: unknown;
  reviewNote: unknown;
  activeCommentaryIds: string[];
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
    const noteAbsolutePath = join(getRepoRoot(), reviewNotePath);
    if (!existsSync(noteAbsolutePath)) {
      addIssue("invalid_review_note", `Missing acceptance review note ${reviewNotePath}.`);
    } else {
      const noteContent = readFileSync(noteAbsolutePath, "utf8");
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
    }
  }
  return issues;
}

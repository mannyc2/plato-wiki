import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";

export type EditorialStatus = "required" | "resolved";
export type CharacterIdentityStatus = "source-normalized" | "editorial-required" | "resolved";
export type CharacterPerformanceRole = "voice-owner" | "reported-only" | "review-required";
export type CharacterRoleFlag =
  | "source-speaker"
  | "commentary-narrator"
  | "dream-figure"
  | "reported-speaker"
  | "collective"
  | "personification";

export type CharacterAppearance = {
  dialogue: string;
  editorialStatus: EditorialStatus;
  performanceRole: CharacterPerformanceRole;
  roleFlags: CharacterRoleFlag[];
  sourceLabels: string[];
  sourceAliases: string[];
  sourceAttributions: string[];
  editorialNote?: string;
};

export type SourceEvidenceExclusion = {
  value: string;
  reason: string;
};

export type AudioCharacter = {
  characterId: string;
  displayName: string;
  identityStatus: CharacterIdentityStatus;
  aliases: string[];
  appearances: CharacterAppearance[];
};

export type DialogueCharacterRoster = {
  dialogue: string;
  editorialStatus: EditorialStatus;
  sourceParticipantCount: number;
  sourceSaidElementCount: number;
  sourceAnomalyCount: number;
  characterIds: string[];
  excludedSourceLabels?: SourceEvidenceExclusion[];
  excludedSourceAttributions?: SourceEvidenceExclusion[];
};

export type CharacterCatalog = {
  schemaVersion: 3;
  status: "partial" | "complete";
  updatedAt: string;
  source: {
    path: "audio/english-tei-speaker-census.json";
    sha256: string;
  };
  dialogues: DialogueCharacterRoster[];
  characters: AudioCharacter[];
};

export type DotsVoice = {
  characterId: string;
  displayName: string;
  status: "selected";
  engine: "dots.tts-soar";
  model: {
    repository: "rednote-hilab/dots.tts-soar";
    revision: string;
  };
  mode: "continuation-voice-cloning";
  seed: number;
  reference: {
    sourceUrl: string;
    sourceRegistryPath: "audio/reference-sources.json";
    sourceRegistrySha256: string;
    sourceDialogue: string;
    sourceVideoId: string;
    sourceCharacterId: string;
    videoStartSeconds: number;
    videoEndSeconds: number;
    localDurationSeconds: number;
    localSha256: string;
    promptText: string;
    relativePath?: string;
    referenceAsr:
      | {
          decision: "primary-zero-error";
          primaryExpectedWords: number;
          primaryOrdinaryWordErrors: 0;
          primaryOrdinaryWordErrorRate: 0;
          primaryEvidencePath: string;
          primaryEvidenceSha256: string;
        }
      | {
          decision: "independent-large-v3-zero-error";
          primaryExpectedWords: number;
          primaryOrdinaryWordErrors: number;
          primaryOrdinaryWordErrorRate: number;
          primaryEvidencePath: string;
          primaryEvidenceSha256: string;
          sourceAgreementEvidencePath: string;
          sourceAgreementEvidenceSha256: string;
          sourceAgreementSha256: string;
          adjudicationEvidencePath: string;
          adjudicationEvidenceSha256: string;
          independentExpectedWords: number;
          independentOrdinaryWordErrors: 0;
          independentOrdinaryWordErrorRate: 0;
          independentEvidencePath: string;
          independentEvidenceSha256: string;
          independentModel: {
            repository: "deepdml/faster-whisper-large-v3-turbo-ct2";
            revision: "44cbbd1adefe7387c83df88963a6d9ac4c9adea5";
          };
        };
    speakerPurityEvidencePath: string;
    speakerPurityEvidenceSha256: string;
    speakerPurityProofRecordId: string;
    speakerPuritySourceAgreementSha256: string;
    speakerPurityMethod: "jowett-caption-turn-alignment-v1" | "campp-exclusive-overlap-v1";
    dominantSpeakerCoverage: number;
    competingSpeakerCoverage: number;
    uncoveredSpeakerCoverage: number;
  };
  generation: {
    numSteps: number;
    guidanceScale: number;
    speakerScale: number;
    language: string;
    precision: string;
  };
  audition: {
    relativePath: string;
    sha256: string;
    durationSeconds: number;
    expectedWords: number;
    ordinaryWordErrors: number;
    ordinaryWordErrorRate: number;
    asrEvidencePath: string;
    asrEvidenceSha256: string;
    meanSpeakerCosineSimilarity: number;
    minimumWindowSpeakerCosineSimilarity: number;
    acousticEvidencePath: string;
    acousticEvidenceSha256: string;
    clippedSamples: number;
    truePeakDbtp: number;
    peakAmplitude: number;
  };
  selection: {
    basis: "operator-authorized-deterministic-gates";
    policy: "cast-auto-accept-v1";
    acceptedAt: string;
    label: string;
    allGatesPassed: true;
    candidateSelection: "highest-ranked-passing" | "operator-pinned";
    evaluatedCandidateCount: number;
    passingCandidateCount: number;
    selectedRank: number;
    decisionPath: string;
    decisionSha256: string;
    sourceAssignment: {
      kind: "same-character" | "voice-source-reassignment";
      authorizedBy: "operator";
      reason: string;
    };
  };
};

export const CAST_ACCEPTANCE_GATES = {
  referenceDuration: {
    minimumSeconds: 3,
    maximumSeconds: 15,
    maximumIntervalDeltaSeconds: 0.05,
  },
  speakerPurity: {
    minimumDominantCoverage: 0.95,
    maximumCompetingCoverage: 0.02,
    maximumUncoveredCoverage: 0.03,
  },
  asrFidelity: {
    minimumReferenceExpectedWords: 8,
    maximumReferenceOrdinaryWordErrors: 0,
    maximumReferenceOrdinaryWordErrorRate: 0,
    referenceFailureAdjudication: "exact-source-agreement-plus-pinned-independent-large-v3-zero-v1",
    minimumExpectedWords: 40,
    maximumOrdinaryWordErrors: 0,
    maximumOrdinaryWordErrorRate: 0,
  },
  acousticConsistency: {
    minimumMeanCosineSimilarity: 0.85,
    minimumWindowCosineSimilarity: 0.8,
  },
  signalSafety: {
    maximumClippedSamples: 0,
    maximumTruePeakDbtp: 0,
    maximumPeakAmplitude: 0.9999,
  },
  auditionDuration: {
    minimumSeconds: 8,
    maximumSeconds: 60,
    minimumWordsPerSecond: 1.5,
    maximumWordsPerSecond: 4.5,
  },
} as const;

export type CastCatalog = {
  schemaVersion: 3;
  status: "partial" | "complete";
  updatedAt: string;
  enginePolicy: {
    defaultEngine: "dots.tts-soar";
    exceptionsRequireRecordedQaFailure: true;
    implicitFallbackVoice: false;
    voiceOwnership: "one-voice-per-character";
    reportedSpeech: "inherit-active-character";
    acceptancePolicy: "operator-authorized-deterministic-v1";
    manualListeningRequired: false;
    acceptanceGates: typeof CAST_ACCEPTANCE_GATES;
  };
  voices: DotsVoice[];
};

export type AudioCatalogValidationIssue = {
  code:
    | "malformed_json"
    | "invalid_shape"
    | "unknown_field"
    | "invalid_schema_version"
    | "invalid_status"
    | "invalid_identifier"
    | "invalid_date"
    | "invalid_hash"
    | "source_hash_mismatch"
    | "source_census_mismatch"
    | "duplicate_dialogue"
    | "duplicate_character_id"
    | "duplicate_alias"
    | "duplicate_appearance"
    | "alias_appearance_mismatch"
    | "roster_appearance_mismatch"
    | "invalid_completeness_claim"
    | "invalid_role_flags"
    | "invalid_editorial_evidence"
    | "missing_character"
    | "cast_character_mismatch"
    | "duplicate_voice"
    | "invalid_engine_policy"
    | "implicit_fallback"
    | "invalid_dots_voice"
    | "invalid_reference_path"
    | "invalid_source_provenance"
    | "cast_evidence_mismatch"
    | "failed_cast_acceptance_gate";
  path: string;
  message: string;
};

function characterIdsForPerformanceRole(
  catalog: CharacterCatalog,
  dialogue: string,
  performanceRole: CharacterPerformanceRole,
) {
  return catalog.characters
    .filter((character) =>
      character.appearances.some(
        (appearance) => appearance.dialogue === dialogue && appearance.performanceRole === performanceRole,
      ),
    )
    .map((character) => character.characterId)
    .sort((left, right) => left.localeCompare(right));
}

export function voiceOwnerCharacterIdsForDialogue(catalog: CharacterCatalog, dialogue: string) {
  return characterIdsForPerformanceRole(catalog, dialogue, "voice-owner");
}

export function reportedOnlyCharacterIdsForDialogue(catalog: CharacterCatalog, dialogue: string) {
  return characterIdsForPerformanceRole(catalog, dialogue, "reported-only");
}

export function reviewRequiredVoiceCharacterIdsForDialogue(catalog: CharacterCatalog, dialogue: string) {
  return characterIdsForPerformanceRole(catalog, dialogue, "review-required");
}

type Inspected<T> = { value?: T; issues: AudioCatalogValidationIssue[] };

const CHARACTER_PATH = "audio/characters.json";
const CAST_PATH = "audio/cast.json";
const CENSUS_PATH = "audio/english-tei-speaker-census.json";
const REFERENCE_SOURCE_PATH = "audio/reference-sources.json";
const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_REVISION = /^[0-9a-f]{40}$/u;
const IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/u;
const CHARACTER_ROLE_FLAGS = new Set<CharacterRoleFlag>([
  "source-speaker",
  "commentary-narrator",
  "dream-figure",
  "reported-speaker",
  "collective",
  "personification",
]);
const CHARACTER_PERFORMANCE_ROLES = new Set<CharacterPerformanceRole>([
  "voice-owner",
  "reported-only",
  "review-required",
]);

const CATALOG_FIELDS = new Set(["schemaVersion", "status", "updatedAt", "source", "dialogues", "characters"]);
const SOURCE_FIELDS = new Set(["path", "sha256"]);
const ROSTER_FIELDS = new Set([
  "dialogue",
  "editorialStatus",
  "sourceParticipantCount",
  "sourceSaidElementCount",
  "sourceAnomalyCount",
  "characterIds",
  "excludedSourceLabels",
  "excludedSourceAttributions",
]);
const SOURCE_EXCLUSION_FIELDS = new Set(["value", "reason"]);
const CHARACTER_FIELDS = new Set(["characterId", "displayName", "identityStatus", "aliases", "appearances"]);
const APPEARANCE_FIELDS = new Set([
  "dialogue",
  "editorialStatus",
  "performanceRole",
  "roleFlags",
  "sourceLabels",
  "sourceAliases",
  "sourceAttributions",
  "editorialNote",
]);
const CAST_FIELDS = new Set(["schemaVersion", "status", "updatedAt", "enginePolicy", "voices"]);
const POLICY_FIELDS = new Set([
  "defaultEngine",
  "exceptionsRequireRecordedQaFailure",
  "implicitFallbackVoice",
  "voiceOwnership",
  "reportedSpeech",
  "acceptancePolicy",
  "manualListeningRequired",
  "acceptanceGates",
]);
const ACCEPTANCE_GATE_FIELDS = new Set([
  "referenceDuration",
  "speakerPurity",
  "asrFidelity",
  "acousticConsistency",
  "signalSafety",
  "auditionDuration",
]);
const REFERENCE_DURATION_GATE_FIELDS = new Set([
  "minimumSeconds",
  "maximumSeconds",
  "maximumIntervalDeltaSeconds",
]);
const SPEAKER_PURITY_GATE_FIELDS = new Set([
  "minimumDominantCoverage",
  "maximumCompetingCoverage",
  "maximumUncoveredCoverage",
]);
const ASR_FIDELITY_GATE_FIELDS = new Set([
  "minimumReferenceExpectedWords",
  "maximumReferenceOrdinaryWordErrors",
  "maximumReferenceOrdinaryWordErrorRate",
  "referenceFailureAdjudication",
  "minimumExpectedWords",
  "maximumOrdinaryWordErrors",
  "maximumOrdinaryWordErrorRate",
]);
const ACOUSTIC_CONSISTENCY_GATE_FIELDS = new Set([
  "minimumMeanCosineSimilarity",
  "minimumWindowCosineSimilarity",
]);
const SIGNAL_SAFETY_GATE_FIELDS = new Set([
  "maximumClippedSamples",
  "maximumTruePeakDbtp",
  "maximumPeakAmplitude",
]);
const AUDITION_DURATION_GATE_FIELDS = new Set([
  "minimumSeconds",
  "maximumSeconds",
  "minimumWordsPerSecond",
  "maximumWordsPerSecond",
]);
const VOICE_FIELDS = new Set([
  "characterId",
  "displayName",
  "status",
  "engine",
  "model",
  "mode",
  "seed",
  "reference",
  "generation",
  "audition",
  "selection",
]);
const MODEL_FIELDS = new Set(["repository", "revision"]);
const REFERENCE_FIELDS = new Set([
  "sourceUrl",
  "sourceRegistryPath",
  "sourceRegistrySha256",
  "sourceDialogue",
  "sourceVideoId",
  "sourceCharacterId",
  "videoStartSeconds",
  "videoEndSeconds",
  "localDurationSeconds",
  "localSha256",
  "promptText",
  "relativePath",
  "referenceAsr",
  "speakerPurityEvidencePath",
  "speakerPurityEvidenceSha256",
  "speakerPurityProofRecordId",
  "speakerPuritySourceAgreementSha256",
  "speakerPurityMethod",
  "dominantSpeakerCoverage",
  "competingSpeakerCoverage",
  "uncoveredSpeakerCoverage",
]);
const GENERATION_FIELDS = new Set([
  "numSteps",
  "guidanceScale",
  "speakerScale",
  "language",
  "precision",
]);
const AUDITION_FIELDS = new Set([
  "relativePath",
  "sha256",
  "durationSeconds",
  "expectedWords",
  "ordinaryWordErrors",
  "ordinaryWordErrorRate",
  "asrEvidencePath",
  "asrEvidenceSha256",
  "meanSpeakerCosineSimilarity",
  "minimumWindowSpeakerCosineSimilarity",
  "acousticEvidencePath",
  "acousticEvidenceSha256",
  "clippedSamples",
  "truePeakDbtp",
  "peakAmplitude",
]);
const SELECTION_FIELDS = new Set([
  "basis",
  "policy",
  "acceptedAt",
  "label",
  "allGatesPassed",
  "candidateSelection",
  "evaluatedCandidateCount",
  "passingCandidateCount",
  "selectedRank",
  "decisionPath",
  "decisionSha256",
  "sourceAssignment",
]);
const SOURCE_ASSIGNMENT_FIELDS = new Set(["kind", "authorizedBy", "reason"]);
const PRIMARY_REFERENCE_ASR_FIELDS = new Set([
  "decision",
  "primaryExpectedWords",
  "primaryOrdinaryWordErrors",
  "primaryOrdinaryWordErrorRate",
  "primaryEvidencePath",
  "primaryEvidenceSha256",
]);
const INDEPENDENT_REFERENCE_ASR_FIELDS = new Set([
  ...PRIMARY_REFERENCE_ASR_FIELDS,
  "sourceAgreementEvidencePath",
  "sourceAgreementEvidenceSha256",
  "sourceAgreementSha256",
  "adjudicationEvidencePath",
  "adjudicationEvidenceSha256",
  "independentExpectedWords",
  "independentOrdinaryWordErrors",
  "independentOrdinaryWordErrorRate",
  "independentEvidencePath",
  "independentEvidenceSha256",
  "independentModel",
]);
const INDEPENDENT_REFERENCE_ASR_MODEL_FIELDS = new Set(["repository", "revision"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function finiteFraction(value: unknown): value is number {
  return finiteNumber(value) && value >= 0 && value <= 1;
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function exactStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonEmptyString) && new Set(value).size === value.length;
}

function hasExactFields(value: Record<string, unknown>, fields: ReadonlySet<string>) {
  return Object.keys(value).length === fields.size && Object.keys(value).every((field) => fields.has(field));
}

function matchesCastAcceptanceGates(value: unknown): value is typeof CAST_ACCEPTANCE_GATES {
  if (!isRecord(value) || !hasExactFields(value, ACCEPTANCE_GATE_FIELDS)) return false;
  const referenceDuration = value.referenceDuration;
  const speakerPurity = value.speakerPurity;
  const asrFidelity = value.asrFidelity;
  const acousticConsistency = value.acousticConsistency;
  const signalSafety = value.signalSafety;
  const auditionDuration = value.auditionDuration;
  return (
    isRecord(referenceDuration) &&
    hasExactFields(referenceDuration, REFERENCE_DURATION_GATE_FIELDS) &&
    referenceDuration.minimumSeconds === CAST_ACCEPTANCE_GATES.referenceDuration.minimumSeconds &&
    referenceDuration.maximumSeconds === CAST_ACCEPTANCE_GATES.referenceDuration.maximumSeconds &&
    referenceDuration.maximumIntervalDeltaSeconds ===
      CAST_ACCEPTANCE_GATES.referenceDuration.maximumIntervalDeltaSeconds &&
    isRecord(speakerPurity) &&
    hasExactFields(speakerPurity, SPEAKER_PURITY_GATE_FIELDS) &&
    speakerPurity.minimumDominantCoverage === CAST_ACCEPTANCE_GATES.speakerPurity.minimumDominantCoverage &&
    speakerPurity.maximumCompetingCoverage === CAST_ACCEPTANCE_GATES.speakerPurity.maximumCompetingCoverage &&
    speakerPurity.maximumUncoveredCoverage === CAST_ACCEPTANCE_GATES.speakerPurity.maximumUncoveredCoverage &&
    isRecord(asrFidelity) &&
    hasExactFields(asrFidelity, ASR_FIDELITY_GATE_FIELDS) &&
    asrFidelity.minimumReferenceExpectedWords ===
      CAST_ACCEPTANCE_GATES.asrFidelity.minimumReferenceExpectedWords &&
    asrFidelity.maximumReferenceOrdinaryWordErrors ===
      CAST_ACCEPTANCE_GATES.asrFidelity.maximumReferenceOrdinaryWordErrors &&
    asrFidelity.maximumReferenceOrdinaryWordErrorRate ===
      CAST_ACCEPTANCE_GATES.asrFidelity.maximumReferenceOrdinaryWordErrorRate &&
    asrFidelity.referenceFailureAdjudication ===
      CAST_ACCEPTANCE_GATES.asrFidelity.referenceFailureAdjudication &&
    asrFidelity.minimumExpectedWords === CAST_ACCEPTANCE_GATES.asrFidelity.minimumExpectedWords &&
    asrFidelity.maximumOrdinaryWordErrors === CAST_ACCEPTANCE_GATES.asrFidelity.maximumOrdinaryWordErrors &&
    asrFidelity.maximumOrdinaryWordErrorRate === CAST_ACCEPTANCE_GATES.asrFidelity.maximumOrdinaryWordErrorRate &&
    isRecord(acousticConsistency) &&
    hasExactFields(acousticConsistency, ACOUSTIC_CONSISTENCY_GATE_FIELDS) &&
    acousticConsistency.minimumMeanCosineSimilarity ===
      CAST_ACCEPTANCE_GATES.acousticConsistency.minimumMeanCosineSimilarity &&
    acousticConsistency.minimumWindowCosineSimilarity ===
      CAST_ACCEPTANCE_GATES.acousticConsistency.minimumWindowCosineSimilarity &&
    isRecord(signalSafety) &&
    hasExactFields(signalSafety, SIGNAL_SAFETY_GATE_FIELDS) &&
    signalSafety.maximumClippedSamples === CAST_ACCEPTANCE_GATES.signalSafety.maximumClippedSamples &&
    signalSafety.maximumTruePeakDbtp === CAST_ACCEPTANCE_GATES.signalSafety.maximumTruePeakDbtp &&
    signalSafety.maximumPeakAmplitude === CAST_ACCEPTANCE_GATES.signalSafety.maximumPeakAmplitude &&
    isRecord(auditionDuration) &&
    hasExactFields(auditionDuration, AUDITION_DURATION_GATE_FIELDS) &&
    auditionDuration.minimumSeconds === CAST_ACCEPTANCE_GATES.auditionDuration.minimumSeconds &&
    auditionDuration.maximumSeconds === CAST_ACCEPTANCE_GATES.auditionDuration.maximumSeconds &&
    auditionDuration.minimumWordsPerSecond === CAST_ACCEPTANCE_GATES.auditionDuration.minimumWordsPerSecond &&
    auditionDuration.maximumWordsPerSecond === CAST_ACCEPTANCE_GATES.auditionDuration.maximumWordsPerSecond
  );
}

function validReferenceAsrAdjudication(value: unknown): value is DotsVoice["reference"]["referenceAsr"] {
  if (!isRecord(value)) return false;
  const commonValid =
    nonNegativeInteger(value.primaryExpectedWords) &&
    value.primaryExpectedWords > 0 &&
    nonNegativeInteger(value.primaryOrdinaryWordErrors) &&
    value.primaryOrdinaryWordErrors <= value.primaryExpectedWords &&
    finiteFraction(value.primaryOrdinaryWordErrorRate) &&
    value.primaryOrdinaryWordErrorRate === value.primaryOrdinaryWordErrors / value.primaryExpectedWords &&
    nonEmptyString(value.primaryEvidencePath) &&
    validRepoRelativePath(value.primaryEvidencePath) &&
    nonEmptyString(value.primaryEvidenceSha256) &&
    SHA256.test(value.primaryEvidenceSha256);
  if (!commonValid) return false;
  if (value.decision === "primary-zero-error") {
    return (
      hasExactFields(value, PRIMARY_REFERENCE_ASR_FIELDS) &&
      value.primaryOrdinaryWordErrors === 0 &&
      value.primaryOrdinaryWordErrorRate === 0
    );
  }
  if (value.decision !== "independent-large-v3-zero-error" || !hasExactFields(value, INDEPENDENT_REFERENCE_ASR_FIELDS)) {
    return false;
  }
  const model = value.independentModel;
  return (
    nonNegativeInteger(value.primaryOrdinaryWordErrors) &&
    finiteFraction(value.primaryOrdinaryWordErrorRate) &&
    (value.primaryOrdinaryWordErrors > 0 || value.primaryOrdinaryWordErrorRate > 0) &&
    nonEmptyString(value.sourceAgreementEvidencePath) &&
    validRepoRelativePath(value.sourceAgreementEvidencePath) &&
    nonEmptyString(value.sourceAgreementEvidenceSha256) &&
    SHA256.test(value.sourceAgreementEvidenceSha256) &&
    nonEmptyString(value.sourceAgreementSha256) &&
    SHA256.test(value.sourceAgreementSha256) &&
    nonEmptyString(value.adjudicationEvidencePath) &&
    validRepoRelativePath(value.adjudicationEvidencePath) &&
    nonEmptyString(value.adjudicationEvidenceSha256) &&
    SHA256.test(value.adjudicationEvidenceSha256) &&
    value.independentExpectedWords === value.primaryExpectedWords &&
    value.independentOrdinaryWordErrors === 0 &&
    value.independentOrdinaryWordErrorRate === 0 &&
    nonEmptyString(value.independentEvidencePath) &&
    validRepoRelativePath(value.independentEvidencePath) &&
    nonEmptyString(value.independentEvidenceSha256) &&
    SHA256.test(value.independentEvidenceSha256) &&
    isRecord(model) &&
    hasExactFields(model, INDEPENDENT_REFERENCE_ASR_MODEL_FIELDS) &&
    model.repository === "deepdml/faster-whisper-large-v3-turbo-ct2" &&
    model.revision === "44cbbd1adefe7387c83df88963a6d9ac4c9adea5"
  );
}

function validateAppearanceRoleEvidence(
  appearance: Record<string, unknown>,
  location: string,
  path: string,
  issues: AudioCatalogValidationIssue[],
) {
  if (!exactStringArray(appearance.roleFlags)) return;
  const roleFlags = appearance.roleFlags as CharacterRoleFlag[];
  if (roleFlags.length === 0 || roleFlags.some((flag) => !CHARACTER_ROLE_FLAGS.has(flag))) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location}.roleFlags must be a non-empty array from the closed character-role enum.`,
    });
    return;
  }
  if (
    !nonEmptyString(appearance.performanceRole) ||
    !CHARACTER_PERFORMANCE_ROLES.has(appearance.performanceRole as CharacterPerformanceRole)
  ) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location}.performanceRole must be voice-owner, reported-only, or review-required.`,
    });
    return;
  }
  const performanceRole = appearance.performanceRole as CharacterPerformanceRole;
  const hasSourceSpeaker = roleFlags.includes("source-speaker");
  const hasCommentaryNarrator = roleFlags.includes("commentary-narrator");
  const hasReportedSpeaker = roleFlags.includes("reported-speaker");
  const hasNonSourceRole = roleFlags.some((flag) => flag !== "source-speaker");
  const hasSourceEvidence = [appearance.sourceLabels, appearance.sourceAliases, appearance.sourceAttributions].some(
    (value) => Array.isArray(value) && value.length > 0,
  );
  const hasEditorialNote = nonEmptyString(appearance.editorialNote);

  if (hasSourceSpeaker !== hasSourceEvidence) {
    issues.push({
      code: "invalid_editorial_evidence",
      path,
      message: `${location} must pair source-speaker with TEI source evidence and reserve empty source fields for non-TEI roles.`,
    });
  }
  if (hasNonSourceRole !== hasEditorialNote || (!hasNonSourceRole && appearance.editorialNote !== undefined)) {
    issues.push({
      code: "invalid_editorial_evidence",
      path,
      message: `${location}.editorialNote is required only for non-TEI production or embedded roles.`,
    });
  }
  if (
    (roleFlags.includes("dream-figure") || roleFlags.includes("personification")) &&
    !roleFlags.includes("reported-speaker")
  ) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location} dream figures and personifications must also be reported-speaker roles.`,
    });
  }
  if (hasCommentaryNarrator && roleFlags.length !== 1) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location} commentary-narrator is an edition role and cannot be combined with source roles.`,
    });
  }
  if (performanceRole === "voice-owner" && !hasSourceSpeaker && !hasCommentaryNarrator) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location} voice-owner requires a source-speaker or commentary-narrator role.`,
    });
  }
  if (performanceRole === "reported-only" && (!hasReportedSpeaker || hasCommentaryNarrator)) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location} reported-only requires reported-speaker and cannot be commentary-narrator.`,
    });
  }
  if (hasCommentaryNarrator && performanceRole !== "voice-owner") {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location} commentary-narrator must be a voice-owner.`,
    });
  }
  if (performanceRole === "review-required" && (!hasSourceSpeaker || hasCommentaryNarrator)) {
    issues.push({
      code: "invalid_role_flags",
      path,
      message: `${location} review-required requires source-speaker and cannot be commentary-narrator.`,
    });
  }
}

function validSourceExclusions(
  value: unknown,
  location: string,
  path: string,
  issues: AudioCatalogValidationIssue[],
) {
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  const seen = new Set<string>();
  let valid = true;
  for (const [index, exclusion] of value.entries()) {
    if (!isRecord(exclusion)) {
      valid = false;
      continue;
    }
    unknownFields(exclusion, SOURCE_EXCLUSION_FIELDS, `${location}[${index}]`, path, issues);
    if (!nonEmptyString(exclusion.value) || !nonEmptyString(exclusion.reason) || seen.has(exclusion.value)) {
      valid = false;
      continue;
    }
    seen.add(exclusion.value);
  }
  return valid;
}

function unknownFields(
  value: Record<string, unknown>,
  allowed: Set<string>,
  location: string,
  path: string,
  issues: AudioCatalogValidationIssue[],
) {
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) {
      issues.push({ code: "unknown_field", path, message: `${location} contains unknown field \`${field}\`.` });
    }
  }
}

function malformedJson(content: string, path: string): Inspected<never> | undefined {
  try {
    JSON.parse(content);
    return undefined;
  } catch (error) {
    return {
      issues: [
        {
          code: "malformed_json",
          path,
          message: `Malformed JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

function validRepoRelativePath(value: string) {
  if (value.includes("\\")) return false;
  try {
    normalizeRepoPath(value);
    return true;
  } catch {
    return false;
  }
}

function inspectCharacterCatalog(path: string, content: string): Inspected<CharacterCatalog> {
  const malformed = malformedJson(content, path);
  if (malformed) return malformed;
  const raw = JSON.parse(content) as unknown;
  const issues: AudioCatalogValidationIssue[] = [];
  if (!isRecord(raw)) {
    return { issues: [{ code: "invalid_shape", path, message: "Character catalog must be a JSON object." }] };
  }
  unknownFields(raw, CATALOG_FIELDS, "catalog", path, issues);

  if (raw.schemaVersion !== 3) {
    issues.push({ code: "invalid_schema_version", path, message: "Character catalog schemaVersion must be 3." });
  }
  if (raw.status !== "partial" && raw.status !== "complete") {
    issues.push({ code: "invalid_status", path, message: "status must be partial or complete." });
  }
  if (!nonEmptyString(raw.updatedAt) || !DATE.test(raw.updatedAt)) {
    issues.push({ code: "invalid_date", path, message: "updatedAt must use YYYY-MM-DD." });
  }

  if (!isRecord(raw.source)) {
    issues.push({ code: "invalid_shape", path, message: "source must be an object." });
  } else {
    unknownFields(raw.source, SOURCE_FIELDS, "source", path, issues);
    if (raw.source.path !== CENSUS_PATH) {
      issues.push({ code: "invalid_shape", path, message: `source.path must be ${CENSUS_PATH}.` });
    }
    if (!nonEmptyString(raw.source.sha256) || !SHA256.test(raw.source.sha256)) {
      issues.push({ code: "invalid_hash", path, message: "source.sha256 must be a lowercase SHA-256 digest." });
    }
  }

  const dialogues: DialogueCharacterRoster[] = [];
  if (!Array.isArray(raw.dialogues)) {
    issues.push({ code: "invalid_shape", path, message: "dialogues must be an array." });
  } else {
    for (const [index, row] of raw.dialogues.entries()) {
      if (!isRecord(row)) {
        issues.push({ code: "invalid_shape", path, message: `dialogues[${index}] must be an object.` });
        continue;
      }
      unknownFields(row, ROSTER_FIELDS, `dialogues[${index}]`, path, issues);
      if (
        !nonEmptyString(row.dialogue) ||
        !IDENTIFIER.test(row.dialogue) ||
        (row.editorialStatus !== "required" && row.editorialStatus !== "resolved") ||
        !nonNegativeInteger(row.sourceParticipantCount) ||
        !nonNegativeInteger(row.sourceSaidElementCount) ||
        !nonNegativeInteger(row.sourceAnomalyCount) ||
        !exactStringArray(row.characterIds) ||
        !row.characterIds.every((id) => IDENTIFIER.test(id)) ||
        !validSourceExclusions(row.excludedSourceLabels, `dialogues[${index}].excludedSourceLabels`, path, issues) ||
        !validSourceExclusions(
          row.excludedSourceAttributions,
          `dialogues[${index}].excludedSourceAttributions`,
          path,
          issues,
        )
      ) {
        issues.push({ code: "invalid_shape", path, message: `dialogues[${index}] has invalid or missing fields.` });
        continue;
      }
      dialogues.push(row as DialogueCharacterRoster);
    }
  }

  const characters: AudioCharacter[] = [];
  if (!Array.isArray(raw.characters)) {
    issues.push({ code: "invalid_shape", path, message: "characters must be an array." });
  } else {
    for (const [index, row] of raw.characters.entries()) {
      if (!isRecord(row)) {
        issues.push({ code: "invalid_shape", path, message: `characters[${index}] must be an object.` });
        continue;
      }
      unknownFields(row, CHARACTER_FIELDS, `characters[${index}]`, path, issues);
      const identityStatuses = new Set(["source-normalized", "editorial-required", "resolved"]);
      if (
        !nonEmptyString(row.characterId) ||
        !IDENTIFIER.test(row.characterId) ||
        !nonEmptyString(row.displayName) ||
        !identityStatuses.has(String(row.identityStatus)) ||
        !exactStringArray(row.aliases) ||
        row.aliases.length === 0 ||
        !Array.isArray(row.appearances) ||
        row.appearances.length === 0
      ) {
        issues.push({ code: "invalid_shape", path, message: `characters[${index}] has invalid or missing fields.` });
        continue;
      }

      const appearances: CharacterAppearance[] = [];
      for (const [appearanceIndex, appearance] of row.appearances.entries()) {
        if (!isRecord(appearance)) {
          issues.push({
            code: "invalid_shape",
            path,
            message: `characters[${index}].appearances[${appearanceIndex}] must be an object.`,
          });
          continue;
        }
        unknownFields(
          appearance,
          APPEARANCE_FIELDS,
          `characters[${index}].appearances[${appearanceIndex}]`,
          path,
          issues,
        );
        if (
          !nonEmptyString(appearance.dialogue) ||
          !IDENTIFIER.test(appearance.dialogue) ||
          (appearance.editorialStatus !== "required" && appearance.editorialStatus !== "resolved") ||
          !nonEmptyString(appearance.performanceRole) ||
          !exactStringArray(appearance.roleFlags) ||
          appearance.roleFlags.length === 0 ||
          !exactStringArray(appearance.sourceLabels) ||
          !exactStringArray(appearance.sourceAliases) ||
          !exactStringArray(appearance.sourceAttributions) ||
          (appearance.editorialNote !== undefined && !nonEmptyString(appearance.editorialNote))
        ) {
          issues.push({
            code: "invalid_shape",
            path,
            message: `characters[${index}].appearances[${appearanceIndex}] has invalid or missing fields.`,
          });
          continue;
        }
        validateAppearanceRoleEvidence(
          appearance,
          `characters[${index}].appearances[${appearanceIndex}]`,
          path,
          issues,
        );
        appearances.push(appearance as CharacterAppearance);
      }
      characters.push({ ...(row as Omit<AudioCharacter, "appearances">), appearances });
    }
  }

  if (issues.some((issue) => ["invalid_shape", "unknown_field"].includes(issue.code))) return { issues };
  return { issues, value: raw as CharacterCatalog };
}

function validateCharacterIntegrity(catalog: CharacterCatalog, path: string) {
  const issues: AudioCatalogValidationIssue[] = [];
  const dialogueIds = new Set<string>();
  for (const roster of catalog.dialogues) {
    if (dialogueIds.has(roster.dialogue)) {
      issues.push({ code: "duplicate_dialogue", path, message: `Dialogue \`${roster.dialogue}\` appears more than once.` });
    }
    dialogueIds.add(roster.dialogue);
  }

  const ids = new Set<string>();
  const aliases = new Map<string, string>();
  const appearancesByDialogue = new Map<string, Set<string>>();
  for (const character of catalog.characters) {
    if (ids.has(character.characterId)) {
      issues.push({
        code: "duplicate_character_id",
        path,
        message: `characterId \`${character.characterId}\` appears more than once.`,
      });
    }
    ids.add(character.characterId);

    for (const alias of character.aliases) {
      const key = alias.toLocaleLowerCase("en-US");
      const prior = aliases.get(key);
      if (prior && prior !== character.characterId) {
        issues.push({
          code: "duplicate_alias",
          path,
          message: `Alias \`${alias}\` belongs to both \`${prior}\` and \`${character.characterId}\`.`,
        });
      } else {
        aliases.set(key, character.characterId);
      }
    }
    if (!character.aliases.includes(character.displayName)) {
      issues.push({
        code: "alias_appearance_mismatch",
        path,
        message: `Character \`${character.characterId}\` aliases must include its displayName \`${character.displayName}\`.`,
      });
    }

    const appearanceDialogues = new Set<string>();
    for (const appearance of character.appearances) {
      if (appearanceDialogues.has(appearance.dialogue)) {
        issues.push({
          code: "duplicate_appearance",
          path,
          message: `Character \`${character.characterId}\` has duplicate \`${appearance.dialogue}\` appearances.`,
        });
      }
      appearanceDialogues.add(appearance.dialogue);
      if (!dialogueIds.has(appearance.dialogue)) {
        issues.push({
          code: "roster_appearance_mismatch",
          path,
          message: `Character \`${character.characterId}\` appears in unknown dialogue \`${appearance.dialogue}\`.`,
        });
      }
      for (const alias of [...appearance.sourceLabels, ...appearance.sourceAliases]) {
        if (!character.aliases.includes(alias)) {
          issues.push({
            code: "alias_appearance_mismatch",
            path,
            message: `Appearance alias \`${alias}\` is absent from \`${character.characterId}\` aliases.`,
          });
        }
      }
      const dialogueCharacters = appearancesByDialogue.get(appearance.dialogue) ?? new Set<string>();
      dialogueCharacters.add(character.characterId);
      appearancesByDialogue.set(appearance.dialogue, dialogueCharacters);
    }
  }

  for (const roster of catalog.dialogues) {
    const fromAppearances = appearancesByDialogue.get(roster.dialogue) ?? new Set<string>();
    const fromRoster = new Set(roster.characterIds);
    if (
      fromAppearances.size !== fromRoster.size ||
      [...fromAppearances].some((characterId) => !fromRoster.has(characterId))
    ) {
      issues.push({
        code: "roster_appearance_mismatch",
        path,
        message: `Dialogue \`${roster.dialogue}\` characterIds do not exactly match character appearances.`,
      });
    }
  }

  const unresolved =
    catalog.dialogues.some((row) => row.editorialStatus !== "resolved") ||
    catalog.characters.some(
      (character) =>
        character.identityStatus !== "resolved" ||
        character.appearances.some((appearance) => appearance.editorialStatus !== "resolved"),
    );
  if (catalog.status === "complete" && unresolved) {
    issues.push({
      code: "invalid_completeness_claim",
      path,
      message: "Character catalog cannot be complete while a roster, identity, or appearance still requires editorial review.",
    });
  }
  if (catalog.status === "partial" && !unresolved) {
    issues.push({
      code: "invalid_completeness_claim",
      path,
      message: "Character catalog is marked partial even though every editorial state is resolved.",
    });
  }
  return issues;
}

function inspectCastCatalog(path: string, content: string): Inspected<CastCatalog> {
  const malformed = malformedJson(content, path);
  if (malformed) return malformed;
  const raw = JSON.parse(content) as unknown;
  const issues: AudioCatalogValidationIssue[] = [];
  if (!isRecord(raw)) {
    return { issues: [{ code: "invalid_shape", path, message: "Cast catalog must be a JSON object." }] };
  }
  unknownFields(raw, CAST_FIELDS, "cast catalog", path, issues);
  if (raw.schemaVersion !== 3) {
    issues.push({ code: "invalid_schema_version", path, message: "Cast catalog schemaVersion must be 3." });
  }
  if (raw.status !== "partial" && raw.status !== "complete") {
    issues.push({ code: "invalid_status", path, message: "status must be partial or complete." });
  }
  if (!nonEmptyString(raw.updatedAt) || !DATE.test(raw.updatedAt)) {
    issues.push({ code: "invalid_date", path, message: "updatedAt must use YYYY-MM-DD." });
  }
  if (!isRecord(raw.enginePolicy)) {
    issues.push({ code: "invalid_engine_policy", path, message: "enginePolicy must be an object." });
  } else {
    unknownFields(raw.enginePolicy, POLICY_FIELDS, "enginePolicy", path, issues);
    if (
      raw.enginePolicy.defaultEngine !== "dots.tts-soar" ||
      raw.enginePolicy.exceptionsRequireRecordedQaFailure !== true ||
      raw.enginePolicy.voiceOwnership !== "one-voice-per-character" ||
      raw.enginePolicy.reportedSpeech !== "inherit-active-character" ||
      raw.enginePolicy.acceptancePolicy !== "operator-authorized-deterministic-v1" ||
      raw.enginePolicy.manualListeningRequired !== false ||
      !matchesCastAcceptanceGates(raw.enginePolicy.acceptanceGates)
    ) {
      issues.push({
        code: "invalid_engine_policy",
        path,
        message:
          "The v3 cast policy requires Dots TTS, one voice per character, inherited reported speech, and the exact operator-authorized deterministic acceptance gates; manual listening cannot be required.",
      });
    }
    if (raw.enginePolicy.implicitFallbackVoice !== false) {
      issues.push({
        code: "implicit_fallback",
        path,
        message: "implicitFallbackVoice must be false; every speaking identity needs an explicit selected voice.",
      });
    }
  }

  const voices: DotsVoice[] = [];
  if (!Array.isArray(raw.voices)) {
    issues.push({ code: "invalid_shape", path, message: "voices must be an array." });
  } else {
    for (const [index, voice] of raw.voices.entries()) {
      if (!isRecord(voice)) {
        issues.push({ code: "invalid_dots_voice", path, message: `voices[${index}] must be an object.` });
        continue;
      }
      unknownFields(voice, VOICE_FIELDS, `voices[${index}]`, path, issues);
      const model = voice.model;
      const reference = voice.reference;
      const generation = voice.generation;
      const audition = voice.audition;
      const selection = voice.selection;
      if (isRecord(model)) unknownFields(model, MODEL_FIELDS, `voices[${index}].model`, path, issues);
      if (isRecord(reference)) unknownFields(reference, REFERENCE_FIELDS, `voices[${index}].reference`, path, issues);
      if (isRecord(generation)) unknownFields(generation, GENERATION_FIELDS, `voices[${index}].generation`, path, issues);
      if (isRecord(audition)) unknownFields(audition, AUDITION_FIELDS, `voices[${index}].audition`, path, issues);
      if (isRecord(selection)) {
        unknownFields(selection, SELECTION_FIELDS, `voices[${index}].selection`, path, issues);
        if (isRecord(selection.sourceAssignment)) {
          unknownFields(
            selection.sourceAssignment,
            SOURCE_ASSIGNMENT_FIELDS,
            `voices[${index}].selection.sourceAssignment`,
            path,
            issues,
          );
        }
      }

      let sourceUrlValid = false;
      if (isRecord(reference) && nonEmptyString(reference.sourceUrl)) {
        try {
          const url = new URL(reference.sourceUrl);
          sourceUrlValid =
            url.protocol === "https:" &&
            url.hostname === "www.youtube.com" &&
            url.pathname === "/watch" &&
            nonEmptyString(reference.sourceVideoId) &&
            url.searchParams.get("v") === reference.sourceVideoId;
        } catch {
          sourceUrlValid = false;
        }
      }
      const referencePathValid =
        !isRecord(reference) ||
        reference.relativePath === undefined ||
        (nonEmptyString(reference.relativePath) && validRepoRelativePath(reference.relativePath));
      if (!referencePathValid) {
        issues.push({
          code: "invalid_reference_path",
          path,
          message: `voices[${index}].reference.relativePath must be a repository-relative POSIX path.`,
        });
      }

      const evidencePathsValid =
        !isRecord(reference) ||
        (nonEmptyString(reference.speakerPurityEvidencePath) &&
          validRepoRelativePath(reference.speakerPurityEvidencePath) &&
          isRecord(audition) &&
          nonEmptyString(audition.asrEvidencePath) &&
          validRepoRelativePath(audition.asrEvidencePath) &&
          nonEmptyString(audition.acousticEvidencePath) &&
          validRepoRelativePath(audition.acousticEvidencePath));

      const valid =
        nonEmptyString(voice.characterId) &&
        IDENTIFIER.test(voice.characterId) &&
        nonEmptyString(voice.displayName) &&
        voice.status === "selected" &&
        voice.engine === "dots.tts-soar" &&
        voice.mode === "continuation-voice-cloning" &&
        nonNegativeInteger(voice.seed) &&
        isRecord(model) &&
        model.repository === "rednote-hilab/dots.tts-soar" &&
        nonEmptyString(model.revision) &&
        GIT_REVISION.test(model.revision) &&
        isRecord(reference) &&
        sourceUrlValid &&
        reference.sourceRegistryPath === "audio/reference-sources.json" &&
        nonEmptyString(reference.sourceRegistrySha256) &&
        SHA256.test(reference.sourceRegistrySha256) &&
        nonEmptyString(reference.sourceDialogue) &&
        IDENTIFIER.test(reference.sourceDialogue) &&
        nonEmptyString(reference.sourceVideoId) &&
        VIDEO_ID.test(reference.sourceVideoId) &&
        nonEmptyString(reference.sourceCharacterId) &&
        IDENTIFIER.test(reference.sourceCharacterId) &&
        finiteNumber(reference.videoStartSeconds) &&
        reference.videoStartSeconds >= 0 &&
        finitePositive(reference.videoEndSeconds) &&
        reference.videoEndSeconds > reference.videoStartSeconds &&
        finitePositive(reference.localDurationSeconds) &&
        nonEmptyString(reference.localSha256) &&
        SHA256.test(reference.localSha256) &&
        nonEmptyString(reference.promptText) &&
        referencePathValid &&
        evidencePathsValid &&
        validReferenceAsrAdjudication(reference.referenceAsr) &&
        nonEmptyString(reference.speakerPurityEvidenceSha256) &&
        SHA256.test(reference.speakerPurityEvidenceSha256) &&
        nonEmptyString(reference.speakerPurityProofRecordId) &&
        IDENTIFIER.test(reference.speakerPurityProofRecordId) &&
        nonEmptyString(reference.speakerPuritySourceAgreementSha256) &&
        SHA256.test(reference.speakerPuritySourceAgreementSha256) &&
        (reference.speakerPurityMethod === "jowett-caption-turn-alignment-v1" ||
          reference.speakerPurityMethod === "campp-exclusive-overlap-v1") &&
        finiteFraction(reference.dominantSpeakerCoverage) &&
        finiteFraction(reference.competingSpeakerCoverage) &&
        finiteFraction(reference.uncoveredSpeakerCoverage) &&
        isRecord(generation) &&
        nonNegativeInteger(generation.numSteps) &&
        generation.numSteps > 0 &&
        finitePositive(generation.guidanceScale) &&
        finitePositive(generation.speakerScale) &&
        nonEmptyString(generation.language) &&
        nonEmptyString(generation.precision) &&
        isRecord(audition) &&
        nonEmptyString(audition.relativePath) &&
        validRepoRelativePath(audition.relativePath) &&
        nonEmptyString(audition.sha256) &&
        SHA256.test(audition.sha256) &&
        finitePositive(audition.durationSeconds) &&
        nonNegativeInteger(audition.expectedWords) &&
        nonNegativeInteger(audition.ordinaryWordErrors) &&
        audition.ordinaryWordErrors <= audition.expectedWords &&
        finiteFraction(audition.ordinaryWordErrorRate) &&
        nonEmptyString(audition.asrEvidenceSha256) &&
        SHA256.test(audition.asrEvidenceSha256) &&
        finiteNumber(audition.meanSpeakerCosineSimilarity) &&
        audition.meanSpeakerCosineSimilarity >= -1 &&
        audition.meanSpeakerCosineSimilarity <= 1 &&
        finiteNumber(audition.minimumWindowSpeakerCosineSimilarity) &&
        audition.minimumWindowSpeakerCosineSimilarity >= -1 &&
        audition.minimumWindowSpeakerCosineSimilarity <= 1 &&
        nonEmptyString(audition.acousticEvidenceSha256) &&
        SHA256.test(audition.acousticEvidenceSha256) &&
        nonNegativeInteger(audition.clippedSamples) &&
        finiteNumber(audition.truePeakDbtp) &&
        finiteFraction(audition.peakAmplitude) &&
        isRecord(selection) &&
        selection.basis === "operator-authorized-deterministic-gates" &&
        selection.policy === "cast-auto-accept-v1" &&
        nonEmptyString(selection.acceptedAt) &&
        DATE.test(selection.acceptedAt) &&
        nonEmptyString(selection.label) &&
        selection.allGatesPassed === true &&
        (selection.candidateSelection === "highest-ranked-passing" ||
          selection.candidateSelection === "operator-pinned") &&
        nonNegativeInteger(selection.evaluatedCandidateCount) &&
        selection.evaluatedCandidateCount > 0 &&
        nonNegativeInteger(selection.passingCandidateCount) &&
        selection.passingCandidateCount > 0 &&
        selection.passingCandidateCount <= selection.evaluatedCandidateCount &&
        nonNegativeInteger(selection.selectedRank) &&
        selection.selectedRank > 0 &&
        selection.selectedRank <= selection.passingCandidateCount &&
        (selection.candidateSelection !== "highest-ranked-passing" || selection.selectedRank === 1) &&
        nonEmptyString(selection.decisionPath) &&
        validRepoRelativePath(selection.decisionPath) &&
        nonEmptyString(selection.decisionSha256) &&
        SHA256.test(selection.decisionSha256) &&
        isRecord(selection.sourceAssignment) &&
        (selection.sourceAssignment.kind === "same-character" ||
          selection.sourceAssignment.kind === "voice-source-reassignment") &&
        selection.sourceAssignment.authorizedBy === "operator" &&
        nonEmptyString(selection.sourceAssignment.reason) &&
        ((selection.sourceAssignment.kind === "same-character" &&
          reference.sourceCharacterId === voice.characterId) ||
          (selection.sourceAssignment.kind === "voice-source-reassignment" &&
            reference.sourceCharacterId !== voice.characterId));

      if (!valid) {
        issues.push({
          code: "invalid_dots_voice",
          path,
          message: `voices[${index}] must provide the exact Dots model, registered source, evidence hashes, seed, generation, measured audition, and deterministic selection fields.`,
        });
        continue;
      }

      const typedReference = reference as DotsVoice["reference"];
      const typedAudition = audition as DotsVoice["audition"];
      if (
        typedReference.referenceAsr.decision === "independent-large-v3-zero-error" &&
        typedReference.referenceAsr.sourceAgreementSha256 !==
          typedReference.speakerPuritySourceAgreementSha256
      ) {
        issues.push({
          code: "invalid_dots_voice",
          path,
          message: `voices[${index}] must bind independent ASR to the same source-agreement digest as speaker purity.`,
        });
        continue;
      }
      const intervalDuration = typedReference.videoEndSeconds - typedReference.videoStartSeconds;
      const coverageTotal =
        typedReference.dominantSpeakerCoverage +
        typedReference.competingSpeakerCoverage +
        typedReference.uncoveredSpeakerCoverage;
      const wordsPerSecond = typedAudition.expectedWords / typedAudition.durationSeconds;
      const failedGates = [
        [
          "reference-duration",
          typedReference.localDurationSeconds >= CAST_ACCEPTANCE_GATES.referenceDuration.minimumSeconds &&
            typedReference.localDurationSeconds <= CAST_ACCEPTANCE_GATES.referenceDuration.maximumSeconds &&
            Math.abs(intervalDuration - typedReference.localDurationSeconds) <=
              CAST_ACCEPTANCE_GATES.referenceDuration.maximumIntervalDeltaSeconds,
        ],
        [
          "speaker-purity",
          typedReference.dominantSpeakerCoverage >=
            CAST_ACCEPTANCE_GATES.speakerPurity.minimumDominantCoverage &&
            typedReference.competingSpeakerCoverage <=
              CAST_ACCEPTANCE_GATES.speakerPurity.maximumCompetingCoverage &&
            typedReference.uncoveredSpeakerCoverage <=
              CAST_ACCEPTANCE_GATES.speakerPurity.maximumUncoveredCoverage &&
            Math.abs(coverageTotal - 1) <= 0.001,
        ],
        [
          "asr-fidelity",
          typedReference.referenceAsr.primaryExpectedWords >=
            CAST_ACCEPTANCE_GATES.asrFidelity.minimumReferenceExpectedWords &&
            (typedReference.referenceAsr.decision === "independent-large-v3-zero-error" ||
              (typedReference.referenceAsr.primaryOrdinaryWordErrors <=
                CAST_ACCEPTANCE_GATES.asrFidelity.maximumReferenceOrdinaryWordErrors &&
                typedReference.referenceAsr.primaryOrdinaryWordErrorRate <=
                  CAST_ACCEPTANCE_GATES.asrFidelity.maximumReferenceOrdinaryWordErrorRate)) &&
            typedAudition.expectedWords >= CAST_ACCEPTANCE_GATES.asrFidelity.minimumExpectedWords &&
            typedAudition.ordinaryWordErrors <=
              CAST_ACCEPTANCE_GATES.asrFidelity.maximumOrdinaryWordErrors &&
            typedAudition.ordinaryWordErrorRate <=
              CAST_ACCEPTANCE_GATES.asrFidelity.maximumOrdinaryWordErrorRate &&
            typedAudition.ordinaryWordErrorRate ===
              typedAudition.ordinaryWordErrors / typedAudition.expectedWords,
        ],
        [
          "acoustic-consistency",
          typedAudition.meanSpeakerCosineSimilarity >=
            CAST_ACCEPTANCE_GATES.acousticConsistency.minimumMeanCosineSimilarity &&
            typedAudition.minimumWindowSpeakerCosineSimilarity >=
              CAST_ACCEPTANCE_GATES.acousticConsistency.minimumWindowCosineSimilarity &&
            typedAudition.minimumWindowSpeakerCosineSimilarity <= typedAudition.meanSpeakerCosineSimilarity,
        ],
        [
          "signal-safety",
          typedAudition.clippedSamples <= CAST_ACCEPTANCE_GATES.signalSafety.maximumClippedSamples &&
            typedAudition.truePeakDbtp <= CAST_ACCEPTANCE_GATES.signalSafety.maximumTruePeakDbtp &&
            typedAudition.peakAmplitude <= CAST_ACCEPTANCE_GATES.signalSafety.maximumPeakAmplitude,
        ],
        [
          "audition-duration",
          typedAudition.durationSeconds >= CAST_ACCEPTANCE_GATES.auditionDuration.minimumSeconds &&
            typedAudition.durationSeconds <= CAST_ACCEPTANCE_GATES.auditionDuration.maximumSeconds &&
            wordsPerSecond >= CAST_ACCEPTANCE_GATES.auditionDuration.minimumWordsPerSecond &&
            wordsPerSecond <= CAST_ACCEPTANCE_GATES.auditionDuration.maximumWordsPerSecond,
        ],
      ].flatMap(([gate, passed]) => (passed ? [] : [gate]));
      if (failedGates.length > 0) {
        issues.push({
          code: "failed_cast_acceptance_gate",
          path,
          message: `voices[${index}] cannot be selected because these deterministic gates failed: ${failedGates.join(", ")}.`,
        });
      }
      voices.push(voice as DotsVoice);
    }
  }
  if (issues.some((issue) => ["invalid_shape", "unknown_field", "invalid_dots_voice"].includes(issue.code))) {
    return { issues };
  }
  return { issues, value: raw as CastCatalog };
}

function validateCastIntegrity(cast: CastCatalog, characters: CharacterCatalog | undefined, path: string) {
  const issues: AudioCatalogValidationIssue[] = [];
  const voiceIds = new Set<string>();
  const charactersById = new Map(
    characters?.characters.map((character) => [character.characterId, character] as const) ?? [],
  );
  const characterIds = new Set(charactersById.keys());
  const voiceOwnerCharacters =
    characters?.characters.filter((character) =>
      character.appearances.some((appearance) => appearance.performanceRole === "voice-owner"),
    ) ?? [];
  const voiceOwnerIds = new Set(voiceOwnerCharacters.map((character) => character.characterId));
  for (const voice of cast.voices) {
    if (voiceIds.has(voice.characterId)) {
      issues.push({ code: "duplicate_voice", path, message: `Character \`${voice.characterId}\` has multiple selected voices.` });
    }
    voiceIds.add(voice.characterId);
    if (characters && !characterIds.has(voice.characterId)) {
      issues.push({
        code: "missing_character",
        path,
        message: `Selected voice \`${voice.characterId}\` does not exist in ${CHARACTER_PATH}.`,
      });
    } else if (characters) {
      const targetCharacter = charactersById.get(voice.characterId)!;
      const targetVoiceOwnerAppearances = targetCharacter.appearances.filter(
        (appearance) => appearance.performanceRole === "voice-owner",
      );
      if (
        targetCharacter.identityStatus !== "resolved" ||
        targetVoiceOwnerAppearances.length === 0 ||
        targetVoiceOwnerAppearances.some((appearance) => appearance.editorialStatus !== "resolved")
      ) {
        issues.push({
          code: "cast_character_mismatch",
          path,
          message: `Selected voice \`${voice.characterId}\` is not a globally resolved canonical voice owner in ${CHARACTER_PATH}.`,
        });
      }
      if (targetCharacter.displayName !== voice.displayName) {
        issues.push({
          code: "cast_character_mismatch",
          path,
          message: `Selected voice \`${voice.characterId}\` displayName does not match ${CHARACTER_PATH}.`,
        });
      }
      if (voice.reference.sourceCharacterId === voice.characterId) {
        if (
          !targetCharacter.appearances.some(
            (appearance) => appearance.dialogue === voice.reference.sourceDialogue,
          )
        ) {
          issues.push({
            code: "invalid_source_provenance",
            path,
            message: `Selected voice \`${voice.characterId}\` cites source dialogue \`${voice.reference.sourceDialogue}\` where that character has no catalogued appearance.`,
          });
        }
      } else {
        const sourceCharacter = charactersById.get(voice.reference.sourceCharacterId);
        if (
          !sourceCharacter ||
          !sourceCharacter.appearances.some(
            (appearance) => appearance.dialogue === voice.reference.sourceDialogue,
          )
        ) {
          issues.push({
            code: "invalid_source_provenance",
            path,
            message: `Selected voice \`${voice.characterId}\` cites source character \`${voice.reference.sourceCharacterId}\` without a matching \`${voice.reference.sourceDialogue}\` appearance.`,
          });
        }
      }
    }
  }
  if (cast.status === "complete") {
    if (!characters) {
      issues.push({
        code: "invalid_completeness_claim",
        path,
        message: "Cast cannot be complete without the canonical character catalog.",
      });
    } else {
      const reviewRequired = characters.characters.flatMap((character) =>
        character.appearances
          .filter((appearance) => appearance.performanceRole === "review-required")
          .map((appearance) => `${character.characterId}:${appearance.dialogue}`),
      );
      if (reviewRequired.length > 0) {
        issues.push({
          code: "invalid_completeness_claim",
          path,
          message: `Cast is marked complete while ${reviewRequired.length} character appearances still require voice-ownership review.`,
        });
      }

      const unresolvedVoiceOwners = voiceOwnerCharacters.filter(
        (character) =>
          character.identityStatus !== "resolved" ||
          character.appearances.some(
            (appearance) =>
              appearance.performanceRole === "voice-owner" && appearance.editorialStatus !== "resolved",
          ),
      );
      if (unresolvedVoiceOwners.length > 0) {
        issues.push({
          code: "invalid_completeness_claim",
          path,
          message: `Cast is marked complete while ${unresolvedVoiceOwners.length} voice-owner identities or appearances remain unresolved.`,
        });
      }

      const missing = [...voiceOwnerIds].filter((characterId) => !voiceIds.has(characterId));
      if (missing.length > 0) {
        issues.push({
          code: "invalid_completeness_claim",
          path,
          message: `Cast is marked complete but ${missing.length} voice-owner characters have no selected voice.`,
        });
      }
    }
  }
  return issues;
}

export function validateCharacterCatalog(path: string, content: string) {
  const inspected = inspectCharacterCatalog(path, content);
  return inspected.value ? [...inspected.issues, ...validateCharacterIntegrity(inspected.value, path)] : inspected.issues;
}

export function parseCharacterCatalog(path: string, content: string) {
  const inspected = inspectCharacterCatalog(path, content);
  const issues = inspected.value ? [...inspected.issues, ...validateCharacterIntegrity(inspected.value, path)] : inspected.issues;
  if (!inspected.value || issues.length > 0) {
    throw new Error(formatAudioCatalogValidationError(issues));
  }
  return inspected.value;
}

export function validateCastCatalog(path: string, content: string, characters?: CharacterCatalog) {
  const inspected = inspectCastCatalog(path, content);
  return inspected.value
    ? [...inspected.issues, ...validateCastIntegrity(inspected.value, characters, path)]
    : inspected.issues;
}

export function parseCastCatalog(path: string, content: string, characters?: CharacterCatalog) {
  const inspected = inspectCastCatalog(path, content);
  const issues = inspected.value
    ? [...inspected.issues, ...validateCastIntegrity(inspected.value, characters, path)]
    : inspected.issues;
  if (!inspected.value || issues.length > 0) {
    throw new Error(formatAudioCatalogValidationError(issues));
  }
  return inspected.value;
}

function sha256File(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function validateMaterializedCastEvidence(cast: CastCatalog, root: string, path: string) {
  const issues: AudioCatalogValidationIssue[] = [];
  const registryPath = join(root, REFERENCE_SOURCE_PATH);
  if (!existsSync(registryPath)) {
    return [
      {
        code: "invalid_source_provenance" as const,
        path,
        message: `${REFERENCE_SOURCE_PATH} must exist before a deterministic cast selection can validate.`,
      },
    ];
  }
  const registrySha256 = sha256File(registryPath);
  const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
    dialogues?: Array<{
      dialogue?: unknown;
      videos?: Array<{ videoId?: unknown; durationSeconds?: unknown; url?: unknown }>;
    }>;
  };
  for (const voice of cast.voices) {
    const location = `voices[${voice.characterId}]`;
    if (voice.reference.sourceRegistrySha256 !== registrySha256) {
      issues.push({
        code: "invalid_source_provenance",
        path,
        message: `${location} sourceRegistrySha256 does not match ${REFERENCE_SOURCE_PATH}.`,
      });
    }
    const row = registry.dialogues?.find((entry) => entry.dialogue === voice.reference.sourceDialogue);
    const video = row?.videos?.find((entry) => entry.videoId === voice.reference.sourceVideoId);
    if (
      !video ||
      typeof video.durationSeconds !== "number" ||
      voice.reference.videoEndSeconds > video.durationSeconds ||
      video.url !== `https://www.youtube.com/watch?v=${voice.reference.sourceVideoId}`
    ) {
      issues.push({
        code: "invalid_source_provenance",
        path,
        message: `${location} does not resolve to a bounded video in ${REFERENCE_SOURCE_PATH}.`,
      });
    }

    const decisionPath = join(root, voice.selection.decisionPath);
    if (!existsSync(decisionPath)) {
      issues.push({
        code: "cast_evidence_mismatch",
        path,
        message: `${location} committed cast acceptance decision is missing.`,
      });
    } else if (sha256File(decisionPath) !== voice.selection.decisionSha256) {
      issues.push({
        code: "cast_evidence_mismatch",
        path,
        message: `${location} cast acceptance decision does not match its recorded SHA-256.`,
      });
    } else {
      try {
        const decision = JSON.parse(readFileSync(decisionPath, "utf8")) as unknown;
        if (
          !isRecord(decision) ||
          decision.schemaVersion !== 1 ||
          decision.status !== "accepted-deterministic-cast-decision" ||
          decision.policy !== "cast-auto-accept-v1" ||
          !nonEmptyString(decision.decisionContentSha256) ||
          !SHA256.test(decision.decisionContentSha256) ||
          decision.characterId !== voice.characterId ||
          decision.sourceCharacterId !== voice.reference.sourceCharacterId ||
          decision.acceptedAt !== voice.selection.acceptedAt ||
          decision.candidateSelection !== voice.selection.candidateSelection ||
          decision.selectedSeed !== voice.seed ||
          decision.selectedPassingRank !== voice.selection.selectedRank ||
          canonicalJson(decision.reference) !== canonicalJson(voice.reference)
        ) {
          issues.push({
            code: "cast_evidence_mismatch",
            path,
            message: `${location} cast acceptance decision is stale or semantically inconsistent.`,
          });
        }
      } catch {
        issues.push({
          code: "cast_evidence_mismatch",
          path,
          message: `${location} cast acceptance decision is not valid JSON.`,
        });
      }
    }

    const referenceAsrEvidence =
      voice.reference.referenceAsr.decision === "primary-zero-error"
        ? [
            [
              voice.reference.referenceAsr.primaryEvidencePath,
              voice.reference.referenceAsr.primaryEvidenceSha256,
              "primary reference ASR evidence",
            ],
          ]
        : [
            [
              voice.reference.referenceAsr.primaryEvidencePath,
              voice.reference.referenceAsr.primaryEvidenceSha256,
              "primary reference ASR evidence",
            ],
            [
              voice.reference.referenceAsr.sourceAgreementEvidencePath,
              voice.reference.referenceAsr.sourceAgreementEvidenceSha256,
              "reference source-agreement evidence",
            ],
            [
              voice.reference.referenceAsr.independentEvidencePath,
              voice.reference.referenceAsr.independentEvidenceSha256,
              "independent reference ASR evidence",
            ],
            [
              voice.reference.referenceAsr.adjudicationEvidencePath,
              voice.reference.referenceAsr.adjudicationEvidenceSha256,
              "reference ASR adjudication",
            ],
          ];
    const materializedEvidence = [
      [voice.reference.relativePath, voice.reference.localSha256, "reference"],
      ...referenceAsrEvidence,
      [voice.reference.speakerPurityEvidencePath, voice.reference.speakerPurityEvidenceSha256, "speaker-purity evidence"],
      [voice.audition.relativePath, voice.audition.sha256, "audition"],
      [voice.audition.asrEvidencePath, voice.audition.asrEvidenceSha256, "ASR evidence"],
      [voice.audition.acousticEvidencePath, voice.audition.acousticEvidenceSha256, "acoustic evidence"],
    ] as const;
    for (const [relativePath, expectedSha256, label] of materializedEvidence) {
      if (relativePath === undefined) continue;
      const absolutePath = join(root, relativePath);
      if (existsSync(absolutePath) && sha256File(absolutePath) !== expectedSha256) {
        issues.push({
          code: "cast_evidence_mismatch",
          path,
          message: `${location} materialized ${label} does not match its recorded SHA-256.`,
        });
      }
    }
  }
  return issues;
}

export function validateAudioCatalogArtifacts() {
  const root = getRepoRoot();
  const characterPath = join(root, CHARACTER_PATH);
  const castPath = join(root, CAST_PATH);
  const issues: AudioCatalogValidationIssue[] = [];
  let characters: CharacterCatalog | undefined;
  let cast: CastCatalog | undefined;

  if (existsSync(characterPath)) {
    const content = readFileSync(characterPath, "utf8");
    const characterIssues = validateAuthoritativeCharacterCatalog(CHARACTER_PATH, content);
    issues.push(...characterIssues);
    if (characterIssues.length === 0) characters = JSON.parse(content) as CharacterCatalog;
  }

  if (existsSync(castPath)) {
    const castContent = readFileSync(castPath, "utf8");
    const castIssues = validateCastCatalog(CAST_PATH, castContent, characters);
    issues.push(...castIssues);
    if (castIssues.length === 0) cast = JSON.parse(castContent) as CastCatalog;
    if (!characters) {
      issues.push({
        code: "missing_character",
        path: CAST_PATH,
        message: `${CHARACTER_PATH} must exist and validate before selected cast entries can be checked.`,
      });
    }
    if (cast) issues.push(...validateMaterializedCastEvidence(cast, root, CAST_PATH));
  }
  return issues;
}

export function formatAudioCatalogValidationError(issues: AudioCatalogValidationIssue[]) {
  return issues.map((issue) => `${issue.path}: [${issue.code}] ${issue.message}`).join("\n");
}

type RawSpeakerCensus = {
  dialogues: Array<{
    dialogue: string;
    counts: { participants: number; said_elements: number; anomaly_records: number };
    participants: Array<{ labels: Array<{ raw_label: string }> }>;
    said_attributions: Array<{ raw_who: string | null }>;
  }>;
};

type AcceptedActiveSpeakerResolution =
  | {
      activeCharacterId: string;
      performanceRole: "voice-owner";
      evidence: string;
    }
  | {
      activeCharacterId: string;
      performanceRole: "reported-only";
      evidence: string;
      editorialNote: string;
    };

const ACCEPTED_ACTIVE_SPEAKER_POLICY = {
  "apology/meletus": {
    activeCharacterId: "meletus",
    performanceRole: "voice-owner",
    evidence:
      "Apology directly stages Socrates' live courtroom cross-examination of Meletus; Meletus' answers are not a retrospective quotation by Socrates.",
  },
  "euthydemus/cleinias": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Euthydemus span plan assigns the embedded exchange to Socrates.",
    editorialNote:
      "Euthydemus' central conversation is narrated retrospectively by Socrates to Crito. Cleinias remains a textual identity but inherits Socrates' voice.",
  },
  "euthydemus/ctesippus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Euthydemus span plan assigns the embedded exchange to Socrates.",
    editorialNote:
      "Euthydemus' central conversation is narrated retrospectively by Socrates to Crito. Ctesippus remains a textual identity but inherits Socrates' voice.",
  },
  "euthydemus/dionysodorus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Euthydemus span plan assigns the embedded exchange to Socrates.",
    editorialNote:
      "Euthydemus' central conversation is narrated retrospectively by Socrates to Crito. Dionysodorus remains a textual identity but inherits Socrates' voice.",
  },
  "euthydemus/euthydemus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Euthydemus span plan assigns the embedded exchange to Socrates.",
    editorialNote:
      "Euthydemus' central conversation is narrated retrospectively by Socrates to Crito. Euthydemus remains a textual identity but inherits Socrates' voice.",
  },
  "lysis/ctesippus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Lysis span plan assigns the whole retrospective narrative to Socrates.",
    editorialNote:
      "Lysis is narrated retrospectively by Socrates. Ctesippus remains a textual identity but inherits Socrates' voice.",
  },
  "lysis/hippothales": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Lysis span plan assigns the whole retrospective narrative to Socrates.",
    editorialNote:
      "Lysis is narrated retrospectively by Socrates. Hippothales remains a textual identity but inherits Socrates' voice.",
  },
  "lysis/lysis": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Lysis span plan assigns the whole retrospective narrative to Socrates.",
    editorialNote:
      "Lysis is narrated retrospectively by Socrates. Lysis remains a textual identity but inherits Socrates' voice.",
  },
  "lysis/lysis-and-menexenus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Lysis span plan assigns the whole retrospective narrative to Socrates.",
    editorialNote:
      "Lysis is narrated retrospectively by Socrates. The jointly attributed replies by Lysis and Menexenus remain textual evidence but inherit Socrates' voice.",
  },
  "lysis/menexenus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Lysis span plan assigns the whole retrospective narrative to Socrates.",
    editorialNote:
      "Lysis is narrated retrospectively by Socrates. Menexenus remains a textual identity but inherits Socrates' voice.",
  },
  "parmenides/adeimantus": {
    activeCharacterId: "cephalus-of-clazomenae",
    performanceRole: "reported-only",
    evidence: "The accepted Parmenides span plan assigns the whole relayed exchange to Cephalus of Clazomenae.",
    editorialNote:
      "Cephalus quotes Adeimantus' welcome and replies inside his opening narrative. Adeimantus remains a textual identity but inherits Cephalus' voice.",
  },
  "protagoras/alcibiades": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Alcibiades remains a textual identity but inherits Socrates' voice.",
  },
  "protagoras/callias": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Callias remains a textual identity but inherits Socrates' voice.",
  },
  "protagoras/critias": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Critias remains a textual identity but inherits Socrates' voice.",
  },
  "protagoras/hippias": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Hippias remains a textual identity but inherits Socrates' voice.",
  },
  "protagoras/hippocrates": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Hippocrates remains a textual identity but inherits Socrates' voice.",
  },
  "protagoras/prodicus": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Prodicus remains a textual identity but inherits Socrates' voice.",
  },
  "protagoras/protagoras": {
    activeCharacterId: "socrates",
    performanceRole: "reported-only",
    evidence: "The accepted Protagoras span plan assigns the embedded encounter to Socrates.",
    editorialNote:
      "Protagoras' central encounter is narrated retrospectively by Socrates to the outer Friend. Protagoras remains a textual identity but inherits Socrates' voice.",
  },
} as const satisfies Record<string, AcceptedActiveSpeakerResolution>;

export function applyAcceptedActiveSpeakerPolicy(catalog: CharacterCatalog): CharacterCatalog {
  const reconciled = {
    ...catalog,
    characters: catalog.characters.map((character) => ({
      ...character,
      appearances: character.appearances.map((appearance) => {
        const key = `${appearance.dialogue}/${character.characterId}`;
        const resolution = ACCEPTED_ACTIVE_SPEAKER_POLICY[
          key as keyof typeof ACCEPTED_ACTIVE_SPEAKER_POLICY
        ];
        if (!resolution) return appearance;

        if (resolution.performanceRole === "voice-owner") {
          const { editorialNote: _editorialNote, ...sourceAppearance } = appearance;
          return {
            ...sourceAppearance,
            editorialStatus: "resolved" as const,
            performanceRole: "voice-owner" as const,
            roleFlags: appearance.roleFlags.filter((flag) => flag !== "reported-speaker"),
          };
        }

        return {
          ...appearance,
          editorialStatus: "resolved" as const,
          performanceRole: "reported-only" as const,
          roleFlags: [...new Set([...appearance.roleFlags, "reported-speaker" as const])],
          editorialNote: resolution.editorialNote,
        };
      }),
    })),
  };

  if (reconciled.status !== "complete") return reconciled;

  const appearancesByKey = new Map<string, CharacterAppearance>(
    reconciled.characters.flatMap((character) =>
      character.appearances.map((appearance) => [
        `${appearance.dialogue}/${character.characterId}`,
        appearance,
      ] as const),
    ),
  );
  const policyEntries = Object.entries(ACCEPTED_ACTIVE_SPEAKER_POLICY) as Array<
    [string, AcceptedActiveSpeakerResolution]
  >;
  const missingAppearances = policyEntries.filter(([key]) => !appearancesByKey.has(key));
  if (missingAppearances.length > 0) {
    throw new Error(
      `Complete character catalog is missing accepted active-speaker appearances: ${missingAppearances
        .map(([key, resolution]) => `${key} (${resolution.evidence})`)
        .join("; ")}`,
    );
  }

  const charactersById = new Map(reconciled.characters.map((character) => [character.characterId, character]));
  const invalidActiveOwners = policyEntries.flatMap(([key, resolution]) => {
    const dialogue = key.slice(0, key.indexOf("/"));
    const activeCharacter = charactersById.get(resolution.activeCharacterId);
    const activeAppearance = activeCharacter?.appearances.find(
      (appearance) => appearance.dialogue === dialogue,
    );
    return activeCharacter?.identityStatus === "resolved" &&
      activeAppearance?.editorialStatus === "resolved" &&
      activeAppearance.performanceRole === "voice-owner"
      ? []
      : [
          `${key} requires ${dialogue}/${resolution.activeCharacterId} to be a resolved voice-owner (${resolution.evidence})`,
        ];
  });
  if (invalidActiveOwners.length > 0) {
    throw new Error(`Complete character catalog has invalid active-speaker owners: ${invalidActiveOwners.join("; ")}`);
  }

  return reconciled;
}

function validateCatalogAgainstCensus(catalog: CharacterCatalog, census: RawSpeakerCensus, path: string) {
  const issues: AudioCatalogValidationIssue[] = [];
  const rosterByDialogue = new Map(catalog.dialogues.map((roster) => [roster.dialogue, roster]));
  const appearancesByDialogue = new Map<string, CharacterAppearance[]>();
  for (const character of catalog.characters) {
    for (const appearance of character.appearances) {
      const rows = appearancesByDialogue.get(appearance.dialogue) ?? [];
      rows.push(appearance);
      appearancesByDialogue.set(appearance.dialogue, rows);
    }
  }

  const censusDialogues = new Set(census.dialogues.map((dialogue) => dialogue.dialogue));
  for (const roster of catalog.dialogues) {
    if (!censusDialogues.has(roster.dialogue)) {
      issues.push({
        code: "source_census_mismatch",
        path,
        message: `Dialogue \`${roster.dialogue}\` is absent from the source speaker census.`,
      });
    }
  }

  for (const dialogue of census.dialogues) {
    const roster = rosterByDialogue.get(dialogue.dialogue);
    if (!roster) {
      issues.push({
        code: "source_census_mismatch",
        path,
        message: `Source dialogue \`${dialogue.dialogue}\` is absent from the character catalog.`,
      });
      continue;
    }
    if (
      roster.sourceParticipantCount !== dialogue.counts.participants ||
      roster.sourceSaidElementCount !== dialogue.counts.said_elements ||
      roster.sourceAnomalyCount !== dialogue.counts.anomaly_records
    ) {
      issues.push({
        code: "source_census_mismatch",
        path,
        message: `Dialogue \`${dialogue.dialogue}\` source counts do not match the speaker census.`,
      });
    }

    const appearances = appearancesByDialogue.get(dialogue.dialogue) ?? [];
    const preservedLabels = [
      ...appearances.flatMap((appearance) => appearance.sourceLabels),
      ...(roster.excludedSourceLabels ?? []).map((exclusion) => exclusion.value),
    ];
    const censusLabels = dialogue.participants.flatMap((participant) =>
      participant.labels.map((label) => label.raw_label),
    );
    for (const label of new Set(censusLabels)) {
      if (preservedLabels.filter((candidate) => candidate === label).length !== 1) {
        issues.push({
          code: "source_census_mismatch",
          path,
          message: `Dialogue \`${dialogue.dialogue}\` must preserve source participant label \`${label}\` exactly once.`,
        });
      }
    }
    if (preservedLabels.some((label) => !censusLabels.includes(label))) {
      issues.push({
        code: "source_census_mismatch",
        path,
        message: `Dialogue \`${dialogue.dialogue}\` contains a source label absent from the speaker census.`,
      });
    }

    const preservedAttributions = [
      ...appearances.flatMap((appearance) => appearance.sourceAttributions),
      ...(roster.excludedSourceAttributions ?? []).map((exclusion) => exclusion.value),
    ];
    const censusAttributions = dialogue.said_attributions.flatMap((attribution) =>
      attribution.raw_who === null ? [] : [attribution.raw_who],
    );
    for (const attribution of new Set(censusAttributions)) {
      if (!preservedAttributions.includes(attribution)) {
        issues.push({
          code: "source_census_mismatch",
          path,
          message: `Dialogue \`${dialogue.dialogue}\` does not preserve source attribution \`${attribution}\`.`,
        });
      }
    }
    if (preservedAttributions.some((attribution) => !censusAttributions.includes(attribution))) {
      issues.push({
        code: "source_census_mismatch",
        path,
        message: `Dialogue \`${dialogue.dialogue}\` contains an attribution absent from the speaker census.`,
      });
    }
  }
  return issues;
}

export function validateAuthoritativeCharacterCatalog(path: string, content: string) {
  const issues = validateCharacterCatalog(path, content);
  if (issues.length > 0) return issues;

  const catalog = JSON.parse(content) as CharacterCatalog;
  const censusPath = join(getRepoRoot(), CENSUS_PATH);
  if (!existsSync(censusPath)) {
    issues.push({
      code: "source_hash_mismatch",
      path,
      message: `${CENSUS_PATH} must exist before the canonical character catalog can validate.`,
    });
  } else {
    const censusContent = readFileSync(censusPath, "utf8");
    const sourceHash = createHash("sha256").update(censusContent).digest("hex");
    if (sourceHash !== catalog.source.sha256) {
      issues.push({
        code: "source_hash_mismatch",
        path,
        message: `${CENSUS_PATH} no longer matches characters.source.sha256.`,
      });
    } else {
      try {
        issues.push(
          ...validateCatalogAgainstCensus(
            catalog,
            JSON.parse(censusContent) as RawSpeakerCensus,
            path,
          ),
        );
      } catch (error) {
        issues.push({
          code: "source_census_mismatch",
          path,
          message: `${CENSUS_PATH} is not a valid speaker census: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    }
  }

  try {
    const accepted = applyAcceptedActiveSpeakerPolicy(catalog);
    if (canonicalJson(accepted) !== canonicalJson(catalog)) {
      issues.push({
        code: "invalid_editorial_evidence",
        path,
        message: "Character performance roles drift from the accepted active-speaker policy.",
      });
    }
  } catch (error) {
    issues.push({
      code: "invalid_editorial_evidence",
      path,
      message: `Character performance roles violate the accepted active-speaker policy: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }

  return issues;
}

const RAW_ALIAS_CANONICAL = new Map<string, string>([
  ["Σωκράτης", "Socrates"],
  ["Ἀθηναῖος", "Athenian Stranger"],
  ["Athenian", "Athenian Stranger"],
  ["Clinias", "Clinias of Crete"],
  ["Megillus", "Megillus of Lacedaemon"],
  ["Cephalos", "Cephalus"],
  ["An Elean Stranger", "Eleatic Stranger"],
  ["The Stranger", "Eleatic Stranger"],
  ["Stranger", "Eleatic Stranger"],
  ["Thedorus", "Theodorus"],
  ["The Younger Socrates", "Younger Socrates"],
]);

function canonicalDisplayName(alias: string) {
  return RAW_ALIAS_CANONICAL.get(alias) ?? alias;
}

function characterId(displayName: string) {
  return displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[’']/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function attributedAliases(rawWho: string, knownAliases: string[]) {
  const matched: string[] = [];
  let remaining = rawWho;
  for (const alias of [...knownAliases].sort((left, right) => right.length - left.length)) {
    const pointer = `#${alias}`;
    if (remaining.includes(pointer)) {
      matched.push(alias);
      remaining = remaining.replace(pointer, " ");
    }
  }
  return { matched, complete: remaining.trim().length === 0 };
}

export function buildCharacterCatalogFromSpeakerCensus(content: string, updatedAt: string): CharacterCatalog {
  const census = JSON.parse(content) as RawSpeakerCensus;
  const byId = new Map<string, AudioCharacter>();
  const rosters: DialogueCharacterRoster[] = [];

  for (const dialogue of census.dialogues) {
    const participantAliases = dialogue.participants.flatMap((participant) =>
      participant.labels.map((label) => label.raw_label),
    );
    const rawAliases = dialogue.said_attributions.flatMap((attribution) => {
      if (attribution.raw_who === null) return [];
      const aliases = [
        ...participantAliases,
        ...RAW_ALIAS_CANONICAL.keys(),
        ...RAW_ALIAS_CANONICAL.values(),
        "Eryximachus",
        "Younger Socrates",
      ];
      const parsed = attributedAliases(attribution.raw_who, aliases);
      return parsed.complete ? parsed.matched : [];
    });
    const appearanceAliases = [...new Set([...participantAliases, ...rawAliases])];
    const dialogueIds = new Set<string>();

    for (const alias of appearanceAliases) {
      const displayName = canonicalDisplayName(alias);
      const id = characterId(displayName);
      if (!id) continue;
      dialogueIds.add(id);
      const character = byId.get(id) ?? {
        characterId: id,
        displayName,
        identityStatus: "editorial-required" as const,
        aliases: [],
        appearances: [],
      };
      const sameIdentityAliases = appearanceAliases.filter(
        (candidate) => characterId(canonicalDisplayName(candidate)) === id,
      );
      for (const candidate of sameIdentityAliases) {
        if (!character.aliases.includes(candidate)) character.aliases.push(candidate);
      }
      if (!character.aliases.includes(displayName)) character.aliases.push(displayName);

      if (!character.appearances.some((appearance) => appearance.dialogue === dialogue.dialogue)) {
        const sourceLabels = participantAliases.filter(
          (candidate) => characterId(canonicalDisplayName(candidate)) === id,
        );
        const sourceAliases = appearanceAliases.filter(
          (candidate) => characterId(canonicalDisplayName(candidate)) === id,
        );
        const sourceAttributions = dialogue.said_attributions.flatMap((attribution) => {
          if (attribution.raw_who === null) return [];
          const parsed = attributedAliases(attribution.raw_who, appearanceAliases);
          return parsed.complete && parsed.matched.some((candidate) => characterId(canonicalDisplayName(candidate)) === id)
            ? [attribution.raw_who]
            : [];
        });
        character.appearances.push({
          dialogue: dialogue.dialogue,
          editorialStatus: "required",
          performanceRole: "review-required",
          roleFlags: ["source-speaker"],
          sourceLabels,
          sourceAliases,
          sourceAttributions,
        });
      }
      byId.set(id, character);
    }

    rosters.push({
      dialogue: dialogue.dialogue,
      editorialStatus: "required",
      sourceParticipantCount: dialogue.counts.participants,
      sourceSaidElementCount: dialogue.counts.said_elements,
      sourceAnomalyCount: dialogue.counts.anomaly_records,
      characterIds: [...dialogueIds].sort(),
    });
  }

  const addEditionRole = (character: AudioCharacter) => {
    byId.set(character.characterId, character);
    for (const appearance of character.appearances) {
      const roster = rosters.find((candidate) => candidate.dialogue === appearance.dialogue);
      if (roster && !roster.characterIds.includes(character.characterId)) {
        roster.characterIds.push(character.characterId);
        roster.characterIds.sort((left, right) => left.localeCompare(right));
      }
    }
  };

  addEditionRole({
    characterId: "commentary-narrator",
    displayName: "Commentary Narrator",
    identityStatus: "resolved",
    aliases: ["Announcer", "Commentary Narrator", "Commentator"],
    appearances: census.dialogues.map((dialogue) => ({
      dialogue: dialogue.dialogue,
      editorialStatus: "required",
      performanceRole: "voice-owner",
      roleFlags: ["commentary-narrator"],
      sourceLabels: [],
      sourceAliases: [],
      sourceAttributions: [],
      editorialNote:
        "Edition-wide performed role for commentary and announcements; it is not attributed by the English TEI.",
    })),
  });

  if (census.dialogues.some((dialogue) => dialogue.dialogue === "crito")) {
    addEditionRole({
      characterId: "dream-woman",
      displayName: "Dream Woman",
      identityStatus: "resolved",
      aliases: ["Dream Woman"],
      appearances: [
        {
          dialogue: "crito",
          editorialStatus: "required",
          performanceRole: "reported-only",
          roleFlags: ["dream-figure", "reported-speaker"],
          sourceLabels: [],
          sourceAliases: [],
          sourceAttributions: [],
          editorialNote:
            "Crito 44b is a quotation inside Socrates' active turn. The Dream Woman remains textual evidence only and inherits Socrates' voice.",
        },
      ],
    });
    addEditionRole({
      characterId: "laws-of-athens",
      displayName: "Laws of Athens",
      identityStatus: "resolved",
      aliases: ["Laws", "Laws of Athens"],
      appearances: [
        {
          dialogue: "crito",
          editorialStatus: "required",
          performanceRole: "reported-only",
          roleFlags: ["collective", "personification", "reported-speaker"],
          sourceLabels: [],
          sourceAliases: [],
          sourceAttributions: [],
          editorialNote:
            "Crito 50a-54d personifies the Laws inside Socrates' active turns. The Laws remain textual evidence only and inherit Socrates' voice.",
        },
      ],
    });
  }

  const characters = [...byId.values()]
    .map((character) => ({
      ...character,
      aliases: [...new Set(character.aliases)].sort((left, right) => left.localeCompare(right)),
      appearances: character.appearances.sort((left, right) => left.dialogue.localeCompare(right.dialogue)),
    }))
    .sort((left, right) => left.characterId.localeCompare(right.characterId));

  return applyAcceptedActiveSpeakerPolicy({
    schemaVersion: 3,
    status: "partial",
    updatedAt,
    source: {
      path: CENSUS_PATH,
      sha256: createHash("sha256").update(content).digest("hex"),
    },
    dialogues: rosters.sort((left, right) => left.dialogue.localeCompare(right.dialogue)),
    characters,
  });
}

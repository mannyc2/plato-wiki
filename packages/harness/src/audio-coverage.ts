import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { listGreekDialogues } from "./derived/stephanus.js";
import { getRepoRoot } from "./paths.js";
import {
  parseCastCatalog,
  parseCharacterCatalog,
  reportedOnlyCharacterIdsForDialogue,
  reviewRequiredVoiceCharacterIdsForDialogue,
  validateAudioCatalogArtifacts,
  voiceOwnerCharacterIdsForDialogue,
  type CastCatalog,
  type CharacterCatalog,
} from "./audio-catalog.js";
import { validateAudioQaArtifact, validateAudioScriptArtifact } from "./audio-production.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import { validateCommentaryLedger } from "./wiki/commentary-validator.js";
import { fieldValue } from "./wiki/observation-ledger.js";
import { validateGeneratedSite, type GeneratedSiteRecordingExpectation } from "./site/validate.js";
import { resolveRecordingArtifactRoot, validateRecordingMasteringEvidence } from "./site/mastering-evidence.js";
import { inspectMp3File } from "./site/recordings.js";
import {
  parseRecordingManifest,
  validateRecordingManifest,
} from "./wiki/recording-manifest.js";
import {
  parseCommentaryQualityAuditManifest,
  validateCommentaryQualityAuditManifest,
} from "./wiki/commentary-quality-audit.js";

export type AudioCoverageStatusCounts = {
  accepted: number;
  unreviewed: number;
  rejected: number;
  needsSplit: number;
  other: number;
};

export type DialogueAudioCoverage = {
  dialogue: string;
  english: {
    sourcePath: string;
    sourcePresent: boolean;
    indexPath: string;
    indexPresent: boolean;
    indexMatchesSource: boolean;
    complete: boolean;
  };
  commentary: {
    path: string;
    present: boolean;
    blockCount: number;
    statuses: AudioCoverageStatusCounts;
    validationIssueCount: number;
    accepted: boolean;
  };
  qualityAudit: {
    path: string;
    present: boolean;
    validationIssueCount: number;
    acceptanceDecision: "pending" | "accepted" | null;
    passed: boolean;
  };
  characters: {
    registryPath: string;
    registryPresent: boolean;
    validationIssueCount: number;
    rawCensusParticipants: number;
    rawCensusAnomalies: number;
    canonicalCount: number | null;
    unresolvedCharacterIds: string[];
    unknownRequirement: boolean;
    complete: boolean;
  };
  cast: {
    registryPath: string;
    registryPresent: boolean;
    validationIssueCount: number;
    requiredRoleCount: number | null;
    selectedRoleCount: number;
    unselectedCharacterIds: string[];
    reportedOnlyCharacterIds: string[];
    reviewRequiredCharacterIds: string[];
    unknownRequirement: boolean;
    complete: boolean;
  };
  screenplay: {
    path: string;
    present: boolean;
    validationIssueCount: number;
    structurallyRecognized: boolean;
    entryCount: number;
    characterIds: string[];
    unknownCharacterIds: string[];
    nonVoiceOwnerCharacterIds: string[];
    uncastCharacterIds: string[];
    complete: boolean;
  };
  qa: {
    path: string;
    present: boolean;
    validationIssueCount: number;
    status: string | null;
    passed: boolean;
  };
  recording: {
    path: string;
    present: boolean;
    validationIssueCount: number;
    recordingId: string | null;
    status: string | null;
    artifactEvidencePassed: boolean;
    accepted: boolean;
  };
  website: {
    path: string;
    present: boolean;
    hasAudioElement: boolean;
    hasAudioSource: boolean;
    recordingIdLinked: boolean;
    strictValidationPassed: boolean;
    linked: boolean;
  };
  missing: string[];
};

export type AudioCoverageSummary = {
  dialogues: number;
  englishSpines: number;
  acceptedCommentaryLedgers: number;
  commentaryQualityAuditsPassed: number;
  completeCharacterInventories: number;
  unknownCharacterRequirements: number;
  unresolvedCharacters: number;
  completeCasts: number;
  unknownCastRequirements: number;
  unselectedCastRoles: number;
  screenplays: number;
  audioQaPassed: number;
  productionRecordings: number;
  websiteAudioLinks: number;
  missing: number;
};

export type AudioCoverageReport = {
  schemaVersion: 1;
  artifactKind: "plato-audio-edition-coverage";
  summary: AudioCoverageSummary;
  dialogues: DialogueAudioCoverage[];
};

export type WrittenAudioCoverageReport = {
  path: string;
  report: AudioCoverageReport;
};

export type AudioCoverageReportValidationIssue = {
  path: string;
  message: string;
};

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyFile(path: string) {
  return existsSync(path) && statSync(path).isFile() && statSync(path).size > 0;
}

function sha256(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

function readJsonObject(relativePath: string): JsonObject | undefined {
  const absolutePath = join(getRepoRoot(), relativePath);
  if (!nonEmptyFile(absolutePath)) return undefined;
  try {
    const value = JSON.parse(readFileSync(absolutePath, "utf8")) as unknown;
    return isObject(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function objectArray(value: unknown) {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function englishCoverage(dialogue: string) {
  const sourcePath = `raw/plato/english/${dialogue}.txt`;
  const indexPath = `derived/plato/stephanus-english/${dialogue}.toon`;
  const absoluteSourcePath = join(getRepoRoot(), sourcePath);
  const absoluteIndexPath = join(getRepoRoot(), indexPath);
  const sourcePresent = nonEmptyFile(absoluteSourcePath);
  const indexPresent = nonEmptyFile(absoluteIndexPath);
  let indexMatchesSource = false;

  if (sourcePresent && indexPresent) {
    const sourceHash = sha256(readFileSync(absoluteSourcePath));
    const index = readFileSync(absoluteIndexPath, "utf8");
    const indexedDialogue = /^dialogue:\s+(.+)$/mu.exec(index)?.[1]?.trim();
    const indexedSourcePath = /^source_path:\s+(.+)$/mu.exec(index)?.[1]?.trim();
    const indexedHash = /^source_sha256:\s+([a-f0-9]{64})$/mu.exec(index)?.[1];
    indexMatchesSource =
      indexedDialogue === dialogue && indexedSourcePath === sourcePath && indexedHash === sourceHash;
  }

  return {
    sourcePath,
    sourcePresent,
    indexPath,
    indexPresent,
    indexMatchesSource,
    complete: sourcePresent && indexPresent && indexMatchesSource,
  };
}

function commentaryCoverage(dialogue: string) {
  const path = `wiki/commentary/${dialogue}.md`;
  const absolutePath = join(getRepoRoot(), path);
  const present = nonEmptyFile(absolutePath);
  const statuses: AudioCoverageStatusCounts = {
    accepted: 0,
    unreviewed: 0,
    rejected: 0,
    needsSplit: 0,
    other: 0,
  };
  if (!present) {
    return { path, present, blockCount: 0, statuses, validationIssueCount: 0, accepted: false };
  }

  const content = readFileSync(absolutePath, "utf8");
  const blocks = commentaryMarkdownBlocks(content);
  for (const block of blocks) {
    const status = fieldValue(block.content, "review_status");
    if (status === "accepted") statuses.accepted += 1;
    else if (status === "unreviewed") statuses.unreviewed += 1;
    else if (status === "rejected") statuses.rejected += 1;
    else if (status === "needs_split") statuses.needsSplit += 1;
    else statuses.other += 1;
  }

  let validationIssueCount = 0;
  try {
    validationIssueCount = validateCommentaryLedger(path, content).length;
  } catch {
    validationIssueCount = 1;
  }
  const blockCount = blocks.length;
  const activeBlockCount = blockCount - statuses.rejected;
  return {
    path,
    present,
    blockCount,
    statuses,
    validationIssueCount,
    accepted:
      activeBlockCount > 0 &&
      statuses.accepted === activeBlockCount &&
      statuses.unreviewed === 0 &&
      statuses.needsSplit === 0 &&
      statuses.other === 0 &&
      validationIssueCount === 0,
  };
}

function qualityAuditCoverage(dialogue: string) {
  const path = `wiki/commentary-audits/${dialogue}.json`;
  const absolutePath = join(getRepoRoot(), path);
  const present = nonEmptyFile(absolutePath);
  if (!present) {
    return {
      path,
      present,
      validationIssueCount: 0,
      acceptanceDecision: null,
      passed: false,
    } as const;
  }
  const content = readFileSync(absolutePath, "utf8");
  const issues = validateCommentaryQualityAuditManifest(path, content);
  if (issues.length > 0) {
    return {
      path,
      present,
      validationIssueCount: issues.length,
      acceptanceDecision: null,
      passed: false,
    } as const;
  }
  const manifest = parseCommentaryQualityAuditManifest(path, content);
  return {
    path,
    present,
    validationIssueCount: 0,
    acceptanceDecision: manifest.acceptance.decision,
    passed: manifest.acceptance.decision === "accepted",
  } as const;
}

function rawCensusByDialogue() {
  const census = readJsonObject("audio/english-tei-speaker-census.json");
  const result = new Map<string, { participants: number; anomalies: number }>();
  for (const entry of objectArray(census?.dialogues)) {
    if (typeof entry.dialogue !== "string") continue;
    const counts = isObject(entry.counts) ? entry.counts : {};
    result.set(entry.dialogue, {
      participants: typeof counts.participants === "number" ? counts.participants : 0,
      anomalies: typeof counts.anomaly_records === "number" ? counts.anomaly_records : 0,
    });
  }
  return result;
}

function catalogValidationIssuesByPath() {
  const grouped = new Map<string, number>();
  for (const issue of validateAudioCatalogArtifacts()) {
    grouped.set(issue.path, (grouped.get(issue.path) ?? 0) + 1);
  }
  return grouped;
}

function characterCatalogState(validationIssues: Map<string, number>) {
  const registryPath = "audio/characters.json";
  const absolutePath = join(getRepoRoot(), registryPath);
  const rawCatalog = readJsonObject(registryPath);
  let catalog: CharacterCatalog | undefined;
  const validationIssueCount = validationIssues.get(registryPath) ?? 0;
  if (rawCatalog && validationIssueCount === 0) {
    try {
      catalog = parseCharacterCatalog(registryPath, readFileSync(absolutePath, "utf8"));
    } catch {
      catalog = undefined;
    }
  }
  const characters = new Map<string, JsonObject>();
  for (const character of objectArray(rawCatalog?.characters)) {
    if (typeof character.characterId === "string") characters.set(character.characterId, character);
  }
  const dialogues = new Map<string, JsonObject>();
  for (const entry of objectArray(rawCatalog?.dialogues)) {
    if (typeof entry.dialogue === "string") dialogues.set(entry.dialogue, entry);
  }
  return {
    registryPath,
    present: rawCatalog !== undefined,
    valid: catalog !== undefined,
    validationIssueCount,
    catalog,
    characters,
    dialogues,
  };
}

function selectedCastState(
  validationIssues: Map<string, number>,
  characters: CharacterCatalog | undefined,
) {
  const registryPath = "audio/cast.json";
  const absolutePath = join(getRepoRoot(), registryPath);
  const rawCatalog = readJsonObject(registryPath);
  let catalog: CastCatalog | undefined;
  const validationIssueCount = validationIssues.get(registryPath) ?? 0;
  if (rawCatalog && validationIssueCount === 0) {
    try {
      catalog = parseCastCatalog(registryPath, readFileSync(absolutePath, "utf8"), characters);
    } catch {
      catalog = undefined;
    }
  }
  const selected = new Set<string>();
  for (const voice of objectArray(rawCatalog?.voices)) {
    if (typeof voice.characterId === "string" && voice.status === "selected") selected.add(voice.characterId);
  }
  return {
    registryPath,
    present: rawCatalog !== undefined,
    valid: catalog !== undefined,
    status: catalog?.status ?? null,
    validationIssueCount,
    selected,
  };
}

function appearanceResolved(character: JsonObject, dialogue: string) {
  return objectArray(character.appearances).some(
    (appearance) => appearance.dialogue === dialogue && appearance.editorialStatus === "resolved",
  );
}

function screenplayCoverage(
  dialogue: string,
  canonicalIds: Set<string>,
  voiceOwnerIds: Set<string>,
  selectedCastIds: Set<string>,
) {
  const path = `audio/scripts/${dialogue}.json`;
  const absolutePath = join(getRepoRoot(), path);
  const present = existsSync(absolutePath) && statSync(absolutePath).isFile() && statSync(absolutePath).size > 0;
  const content = present ? readFileSync(absolutePath, "utf8") : undefined;
  const validationIssueCount = content ? validateAudioScriptArtifact(path, content).length : 0;
  const script = readJsonObject(path);
  const entries = objectArray(script?.entries);
  const characterIds = sortedUnique(
    entries.map((entry) => entry.character_id).filter((value): value is string => typeof value === "string"),
  );
  const structurallyRecognized = present && validationIssueCount === 0;
  const unknownCharacterIds = characterIds.filter((id) => !canonicalIds.has(id));
  const nonVoiceOwnerCharacterIds = characterIds.filter((id) => !voiceOwnerIds.has(id));
  const uncastCharacterIds = characterIds.filter((id) => !selectedCastIds.has(id));
  return {
    path,
    present,
    validationIssueCount,
    structurallyRecognized,
    entryCount: entries.length,
    characterIds,
    unknownCharacterIds,
    nonVoiceOwnerCharacterIds,
    uncastCharacterIds,
    complete:
      structurallyRecognized &&
      unknownCharacterIds.length === 0 &&
      nonVoiceOwnerCharacterIds.length === 0 &&
      uncastCharacterIds.length === 0,
  };
}

function qaCoverage(dialogue: string) {
  const path = `audio/qa/${dialogue}.json`;
  const absolutePath = join(getRepoRoot(), path);
  const present = existsSync(absolutePath) && statSync(absolutePath).isFile() && statSync(absolutePath).size > 0;
  const content = present ? readFileSync(absolutePath, "utf8") : undefined;
  const validationIssueCount = content ? validateAudioQaArtifact(path, content).length : 0;
  const qa = readJsonObject(path);
  const status = typeof qa?.status === "string" ? qa.status : null;
  return {
    path,
    present,
    validationIssueCount,
    status,
    passed: present && validationIssueCount === 0 && status === "accepted",
  };
}

function recordingCoverage(dialogue: string) {
  const path = `wiki/recordings/${dialogue}.json`;
  const absolutePath = join(getRepoRoot(), path);
  const manifest = readJsonObject(path);
  const present = nonEmptyFile(absolutePath);
  let validationIssueCount = 0;
  if (present) {
    validationIssueCount = validateRecordingManifest(path, readFileSync(absolutePath, "utf8")).length;
  }
  const recordingId = typeof manifest?.recording_id === "string" ? manifest.recording_id : null;
  const status = typeof manifest?.status === "string" ? manifest.status : null;
  let artifactEvidencePassed = false;
  if (present && validationIssueCount === 0 && status === "accepted") {
    try {
      const parsed = parseRecordingManifest(path, readFileSync(absolutePath, "utf8"));
      const evidence = validateRecordingMasteringEvidence(
        parsed,
        resolveRecordingArtifactRoot(process.env.PLATO_RECORDING_ARTIFACT_ROOT),
      );
      inspectMp3File(evidence.publicationPath, parsed.audio.duration_seconds);
      artifactEvidencePassed = true;
    } catch {
      validationIssueCount += 1;
    }
  }
  return {
    path,
    present,
    validationIssueCount,
    recordingId,
    status,
    artifactEvidencePassed,
    accepted: present && validationIssueCount === 0 && status === "accepted" && artifactEvidencePassed,
  };
}

function strictWebsiteRecordingDialogues(dialogues: readonly string[]) {
  const expectations: GeneratedSiteRecordingExpectation[] = [];
  for (const dialogue of dialogues) {
    const path = `wiki/recordings/${dialogue}.json`;
    const absolutePath = join(getRepoRoot(), path);
    if (!nonEmptyFile(absolutePath)) continue;
    const content = readFileSync(absolutePath, "utf8");
    if (validateRecordingManifest(path, content).length > 0) continue;
    const manifest = parseRecordingManifest(path, content);
    if (manifest.status !== "accepted") continue;
    try {
      const evidence = validateRecordingMasteringEvidence(
        manifest,
        resolveRecordingArtifactRoot(process.env.PLATO_RECORDING_ARTIFACT_ROOT),
      );
      inspectMp3File(evidence.publicationPath, manifest.audio.duration_seconds);
    } catch {
      continue;
    }
    expectations.push({
      dialogue,
      recordingId: manifest.recording_id,
      status: "accepted",
      audioSha256: manifest.audio.sha256,
      durationSeconds: manifest.audio.duration_seconds,
      assetPath: `assets/recordings/${dialogue}/complete.mp3`,
      chapterTargets: manifest.chapters.map((chapter) => chapter.commentary_id),
      chapterIds: manifest.chapters.map((chapter) => chapter.chapter_id),
      chapterStartFrames: manifest.chapters.map((chapter) => chapter.start_frame),
      chapterStartSeconds: manifest.chapters.map((chapter) => chapter.start_frame / 48_000),
    });
  }
  if (expectations.length === 0) return new Set<string>();

  const siteRoot = join(getRepoRoot(), "site");
  try {
    validateGeneratedSite(siteRoot, {
      allowedExternalUrls: new Set(["https://creativecommons.org/licenses/by-sa/4.0/"]),
      recordings: expectations,
    });
  } catch {
    return new Set<string>();
  }
  return new Set(expectations.map((expectation) => expectation.dialogue));
}

function websiteCoverage(
  dialogue: string,
  recording: ReturnType<typeof recordingCoverage>,
  strictRecordingDialogues: ReadonlySet<string>,
) {
  const path = `site/dialogues/${dialogue}/reading.html`;
  const absolutePath = join(getRepoRoot(), path);
  const present = nonEmptyFile(absolutePath);
  const content = present ? readFileSync(absolutePath, "utf8") : "";
  const hasAudioElement = /<audio\b/iu.test(content);
  const hasAudioSource = /<audio\b[^>]*\bsrc=["'][^"']+["']/iu.test(content) || /<source\b[^>]*\bsrc=["'][^"']+["']/iu.test(content);
  const recordingIdLinked = recording.recordingId !== null && content.includes(recording.recordingId);
  const strictValidationPassed = strictRecordingDialogues.has(dialogue);
  return {
    path,
    present,
    hasAudioElement,
    hasAudioSource,
    recordingIdLinked,
    strictValidationPassed,
    linked: recording.accepted && strictValidationPassed,
  };
}

function coverageForDialogue(
  dialogue: string,
  rawCensus: Map<string, { participants: number; anomalies: number }>,
  characterCatalog: ReturnType<typeof characterCatalogState>,
  castCatalog: ReturnType<typeof selectedCastState>,
  strictRecordingDialogues: ReadonlySet<string>,
): DialogueAudioCoverage {
  const english = englishCoverage(dialogue);
  const commentary = commentaryCoverage(dialogue);
  const qualityAudit = qualityAuditCoverage(dialogue);
  const census = rawCensus.get(dialogue) ?? { participants: 0, anomalies: 0 };
  const dialogueCharacters = characterCatalog.dialogues.get(dialogue);
  const canonicalIds = sortedUnique(stringArray(dialogueCharacters?.characterIds));
  const voiceOwnerIds = characterCatalog.catalog
    ? voiceOwnerCharacterIdsForDialogue(characterCatalog.catalog, dialogue)
    : [];
  const reportedOnlyIds = characterCatalog.catalog
    ? reportedOnlyCharacterIdsForDialogue(characterCatalog.catalog, dialogue)
    : [];
  const reviewRequiredIds = characterCatalog.catalog
    ? reviewRequiredVoiceCharacterIdsForDialogue(characterCatalog.catalog, dialogue)
    : [];
  const rosterUnresolvedCharacterIds = canonicalIds.filter((id) => {
    const character = characterCatalog.characters.get(id);
    return !character || character.identityStatus !== "resolved" || !appearanceResolved(character, dialogue);
  });
  const screenplay = screenplayCoverage(
    dialogue,
    new Set(canonicalIds),
    new Set(voiceOwnerIds),
    castCatalog.selected,
  );
  const unresolvedCharacterIds = sortedUnique([
    ...rosterUnresolvedCharacterIds,
    ...screenplay.unknownCharacterIds,
  ]);
  const characterComplete =
    characterCatalog.valid &&
    dialogueCharacters?.editorialStatus === "resolved" &&
    canonicalIds.length > 0 &&
    unresolvedCharacterIds.length === 0;
  const characters = {
    registryPath: characterCatalog.registryPath,
    registryPresent: characterCatalog.present,
    validationIssueCount: characterCatalog.validationIssueCount,
    rawCensusParticipants: census.participants,
    rawCensusAnomalies: census.anomalies,
    canonicalCount: dialogueCharacters ? canonicalIds.length : null,
    unresolvedCharacterIds,
    unknownRequirement: dialogueCharacters === undefined,
    complete: characterComplete,
  };
  const unselectedCharacterIds = sortedUnique(voiceOwnerIds.filter((id) => !castCatalog.selected.has(id)));
  const castRequirementUnknown =
    dialogueCharacters === undefined || characterCatalog.catalog === undefined || reviewRequiredIds.length > 0;
  const cast = {
    registryPath: castCatalog.registryPath,
    registryPresent: castCatalog.present,
    validationIssueCount: castCatalog.validationIssueCount,
    requiredRoleCount: castRequirementUnknown ? null : voiceOwnerIds.length,
    selectedRoleCount: voiceOwnerIds.length - unselectedCharacterIds.length,
    unselectedCharacterIds,
    reportedOnlyCharacterIds: reportedOnlyIds,
    reviewRequiredCharacterIds: reviewRequiredIds,
    unknownRequirement: castRequirementUnknown,
    complete:
      castCatalog.valid &&
      castCatalog.status === "complete" &&
      characterCatalog.valid &&
      dialogueCharacters !== undefined &&
      voiceOwnerIds.length > 0 &&
      !castRequirementUnknown &&
      unselectedCharacterIds.length === 0,
  };
  const qa = qaCoverage(dialogue);
  const recording = recordingCoverage(dialogue);
  const website = websiteCoverage(dialogue, recording, strictRecordingDialogues);
  const requirements = {
    english: english.complete,
    commentary: commentary.accepted,
    quality_audit: qualityAudit.passed,
    characters: characters.complete,
    cast: cast.complete,
    screenplay: screenplay.complete,
    qa: qa.passed,
    recording: recording.accepted,
    website: website.linked,
  };

  return {
    dialogue,
    english,
    commentary,
    qualityAudit,
    characters,
    cast,
    screenplay,
    qa,
    recording,
    website,
    missing: Object.entries(requirements)
      .filter(([, complete]) => !complete)
      .map(([requirement]) => requirement),
  };
}

export function buildAudioCoverageReport(): AudioCoverageReport {
  const rawCensus = rawCensusByDialogue();
  const validationIssues = catalogValidationIssuesByPath();
  const characterCatalog = characterCatalogState(validationIssues);
  const castCatalog = selectedCastState(validationIssues, characterCatalog.catalog);
  const canonicalDialogues = listGreekDialogues();
  const strictRecordingDialogues = strictWebsiteRecordingDialogues(canonicalDialogues);
  const dialogues = canonicalDialogues.map((dialogue) =>
    coverageForDialogue(dialogue, rawCensus, characterCatalog, castCatalog, strictRecordingDialogues),
  );
  const unresolvedCharacters = new Set(dialogues.flatMap((entry) => entry.characters.unresolvedCharacterIds));
  const unselectedCastRoles = new Set(dialogues.flatMap((entry) => entry.cast.unselectedCharacterIds));
  const summary: AudioCoverageSummary = {
    dialogues: dialogues.length,
    englishSpines: dialogues.filter((entry) => entry.english.complete).length,
    acceptedCommentaryLedgers: dialogues.filter((entry) => entry.commentary.accepted).length,
    commentaryQualityAuditsPassed: dialogues.filter((entry) => entry.qualityAudit.passed).length,
    completeCharacterInventories: dialogues.filter((entry) => entry.characters.complete).length,
    unknownCharacterRequirements: dialogues.filter((entry) => entry.characters.unknownRequirement).length,
    unresolvedCharacters: unresolvedCharacters.size,
    completeCasts: dialogues.filter((entry) => entry.cast.complete).length,
    unknownCastRequirements: dialogues.filter((entry) => entry.cast.unknownRequirement).length,
    unselectedCastRoles: unselectedCastRoles.size,
    screenplays: dialogues.filter((entry) => entry.screenplay.complete).length,
    audioQaPassed: dialogues.filter((entry) => entry.qa.passed).length,
    productionRecordings: dialogues.filter((entry) => entry.recording.accepted).length,
    websiteAudioLinks: dialogues.filter((entry) => entry.website.linked).length,
    missing: dialogues.reduce((sum, entry) => sum + entry.missing.length, 0),
  };
  return {
    schemaVersion: 1,
    artifactKind: "plato-audio-edition-coverage",
    summary,
    dialogues,
  };
}

function yesNo(value: boolean) {
  return value ? "yes" : "no";
}

function knownCount(value: number | null) {
  return value === null ? "unknown" : String(value);
}

export function renderAudioCoverageReport(report: AudioCoverageReport) {
  const { summary } = report;
  const rows = report.dialogues.map((entry) => {
    const activeCommentaryCount = entry.commentary.blockCount - entry.commentary.statuses.rejected;
    const commentary = `${entry.commentary.statuses.accepted}/${activeCommentaryCount} active${
      entry.commentary.statuses.rejected > 0 ? `; ${entry.commentary.statuses.rejected} rejected` : ""
    }`;
    const characters = entry.characters.complete
      ? `${entry.characters.canonicalCount} resolved`
      : entry.characters.unknownRequirement
        ? "unknown"
        : `${entry.characters.unresolvedCharacterIds.length}/${knownCount(entry.characters.canonicalCount)} unresolved`;
    const cast = entry.cast.complete
      ? `${entry.cast.selectedRoleCount}/${knownCount(entry.cast.requiredRoleCount)}`
      : entry.cast.unknownRequirement
        ? entry.cast.reviewRequiredCharacterIds.length > 0
          ? `${entry.cast.reviewRequiredCharacterIds.length} voice ownership review required`
          : "unknown"
        : `${entry.cast.unselectedCharacterIds.length}/${knownCount(entry.cast.requiredRoleCount)} unselected`;
    return `| ${entry.dialogue} | ${yesNo(entry.english.complete)} | ${commentary} | ${entry.qualityAudit.acceptanceDecision ?? "-"} | ${characters} | ${cast} | ${yesNo(entry.screenplay.complete)} | ${entry.qa.status ?? "-"} | ${entry.recording.status ?? "-"} | ${yesNo(entry.website.linked)} | ${entry.missing.length} |`;
  });

  return [
    "# Plato Audio Edition Coverage",
    "",
    "Generated by `bun run harness audio coverage --write`. Scratch prototypes are intentionally excluded.",
    "Unknown character or cast requirements count as missing; they are not treated as zero unresolved roles.",
    "",
    "```yaml",
    `dialogues: ${summary.dialogues}`,
    `english_spines: ${summary.englishSpines}`,
    `accepted_commentary_ledgers: ${summary.acceptedCommentaryLedgers}`,
    `commentary_quality_audits_passed: ${summary.commentaryQualityAuditsPassed}`,
    `complete_character_inventories: ${summary.completeCharacterInventories}`,
    `unknown_character_requirements: ${summary.unknownCharacterRequirements}`,
    `unresolved_characters: ${summary.unresolvedCharacters}`,
    `complete_casts: ${summary.completeCasts}`,
    `unknown_cast_requirements: ${summary.unknownCastRequirements}`,
    `unselected_cast_roles: ${summary.unselectedCastRoles}`,
    `screenplays: ${summary.screenplays}`,
    `audio_qa_passed: ${summary.audioQaPassed}`,
    `production_recordings: ${summary.productionRecordings}`,
    `website_audio_links: ${summary.websiteAudioLinks}`,
    `missing: ${summary.missing}`,
    "```",
    "",
    "| dialogue | English | accepted ledger | writing audit | characters | cast | screenplay | QA | recording | website | missing |",
    "| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | ---: |",
    ...rows,
    "",
    "## Evidence notes",
    "",
    "- English is complete only when both the source and derived index exist and the index hash points to that exact source.",
    "- Ledger acceptance and production-ready writing are separate. Writing is complete only when every active commentary block is accepted, rejected blocks remain terminally excluded, the full append-only ledger validates, and an exact hash-bound operator-delegated Luna-sample-accepted quality-audit manifest passes.",
    "- Character and cast completion comes only from `audio/characters.json` and `audio/cast.json`; the raw TEI census is evidence, never completion credit.",
    "- Canonical character counts preserve every textual identity. Cast counts include only resolved `voice-owner` appearances; `reported-only` identities retain evidence without requiring voices, while any `review-required` performance role leaves cast scope unknown.",
    "- A screenplay must be schema v2, bind the exact current operator-delegated Luna-sample-accepted commentary-quality audit, and use only resolved voice-owner characters with selected voices. Reported speech inherits its active character's voice. QA requires an explicit accepted status.",
    "- A production recording requires a valid accepted schema-v2 manifest plus the exact mastering-v6 plan/result/mechanical-QA, pinned NumPy 2.2.6 analysis-runtime inventory, RF64 working master, and 48 kHz 96 kbps MP3 bytes beneath the explicit artifact root.",
    "- Website credit requires exact generated-site validation of the recording ID, publication hash and bytes, native player source, and complete authoritative chapter ID/frame/seek inventory; stale HTML or a missing asset earns no credit.",
    "",
  ].join("\n");
}

export function writeAudioCoverageReport(path = "audio/coverage.md"): WrittenAudioCoverageReport {
  const report = buildAudioCoverageReport();
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, renderAudioCoverageReport(report), "utf8");
  return { path: relative(getRepoRoot(), absolutePath), report };
}

export function validateAudioCoverageReport(path = "audio/coverage.md", report = buildAudioCoverageReport()) {
  const absolutePath = join(getRepoRoot(), path);
  if (!nonEmptyFile(absolutePath)) {
    return [{ path, message: "Audio coverage report is missing or empty." }] satisfies AudioCoverageReportValidationIssue[];
  }
  const expected = renderAudioCoverageReport(report);
  const actual = readFileSync(absolutePath, "utf8");
  return actual === expected
    ? []
    : ([
        {
          path,
          message: "Audio coverage report is stale; regenerate it with `bun run harness audio coverage --write`.",
        },
      ] satisfies AudioCoverageReportValidationIssue[]);
}

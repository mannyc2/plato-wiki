import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  parseCastCatalog,
  parseCharacterCatalog,
  voiceOwnerCharacterIdsForDialogue,
  type CastCatalog,
  type CharacterCatalog,
} from "./audio-catalog.js";
import {
  inspectAudioInsertionBlock,
  resolveAudioInsertionBoundary,
  sourceTurnBoundaryAtOrAfter,
  sourceTurnBoundaryAtOrBefore,
  type AudioInsertionBoundary,
} from "./audio-insertion.js";
import {
  englishStephanusIndexPath,
  listGreekDialogues,
  parseStephanusIndexToon,
} from "./derived/stephanus.js";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";
import { projectStephanusSpansToMarkers } from "./source.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import { fieldValue } from "./wiki/observation-ledger.js";
import { parseCommentaryQualityAuditManifest } from "./wiki/commentary-quality-audit.js";

export type AudioScriptEntryKind = "source" | "commentary" | "heading" | "meta";
export type AudioCadenceIntent =
  | "none"
  | "continuation"
  | "short_reply"
  | "exchange"
  | "reflective"
  | "commentary"
  | "chapter";

export type AudioScriptChapter = {
  id: string;
  commentary_id: string;
  title?: string;
};

export type AudioScriptEntry = {
  id: string;
  chapter_id: string;
  kind: AudioScriptEntryKind;
  character_id: string;
  text: string;
  anchor: { stephanus: string } | { commentary_id: string } | { scope: "dialogue" | "chapter" };
  cadence_intent: AudioCadenceIntent;
};

export type AudioScriptRepair = {
  id: string;
  old_text: string;
  new_text: string;
  reason: string;
  occurrence_count: number;
};

export type AudioScriptCoverage = {
  source_words: number;
  source_words_covered: number;
  source_words_uncovered: number;
  source_words_duplicated: number;
  commentary_blocks_expected: number;
  commentary_blocks_covered: number;
  commentary_blocks_missing: number;
  commentary_blocks_duplicated: number;
};

export type AudioScript = {
  schema_version: 2;
  dialogue: string;
  source_hashes: { english: string; stephanus: string };
  commentary_sha256: string;
  commentary_quality_audit_sha256: string;
  cast_sha256: string;
  generator_version: string;
  chapters: AudioScriptChapter[];
  entries: AudioScriptEntry[];
  repairs: AudioScriptRepair[];
  coverage: AudioScriptCoverage;
};

export type AudioQaStatus = "draft" | "accepted" | "rejected";

export type AudioQaChapter = {
  chapter_id: string;
  audio_path: string;
  audio_sha256: string;
  duration_seconds: number;
  source_words_expected: number;
  source_words_covered: number;
  source_words_uncovered: number;
  source_words_duplicated: number;
  commentary_ids_expected: string[];
  commentary_ids_covered: string[];
  asr_expected_words: number;
  asr_word_errors: number;
  asr_ordinary_word_errors: number;
  asr_word_error_rate: number;
  max_silence_ms: number;
  integrated_lufs: number;
  true_peak_dbtp: number;
  clipped_samples: number;
  cast_character_ids: string[];
  unresolved_character_ids: string[];
  mismatched_character_ids: string[];
  listening_disposition: "accepted" | "rerender-required" | "rejected" | "not-performed";
  source_coverage_passed: boolean;
  commentary_coverage_passed: boolean;
  asr_passed: boolean;
  silence_passed: boolean;
  clipping_passed: boolean;
  loudness_passed: boolean;
  cast_consistency_passed: boolean;
  listening_passed: boolean;
};

export type AudioQaReport = {
  schema_version: 2;
  dialogue: string;
  status: AudioQaStatus;
  generated_at: string;
  script_sha256: string;
  cast_sha256: string;
  source_coverage: {
    passed: boolean;
    expected_words: number;
    covered_words: number;
    uncovered_words: number;
    duplicated_words: number;
    repairs_verified: boolean;
  };
  commentary_coverage: {
    passed: boolean;
    expected_ids: string[];
    covered_ids: string[];
    missing_ids: string[];
    duplicate_ids: string[];
  };
  asr: {
    passed: boolean;
    model_repository: string;
    model_revision: string;
    max_word_error_rate: number;
    max_ordinary_word_errors: number;
    expected_words: number;
    recognized_words: number;
    word_errors: number;
    ordinary_word_errors: number;
    word_error_rate: number;
    transcript_sha256: string;
    exceptions: Array<{
      expected: string;
      recognized: string;
      occurrences: number;
      classification: "proper-name" | "punctuation" | "ordinary";
      reviewed: boolean;
    }>;
  };
  audio: {
    master_path: string;
    master_sha256: string;
    mime_type: string;
    duration_seconds: number;
    sample_rate_hz: number;
    channels: number;
    sample_format: string;
    target_lufs: number;
    tolerance_lu: number;
    integrated_lufs: number;
    true_peak_dbtp: number;
    clipped_samples: number;
    silence: {
      max_allowed_ms: number;
      max_observed_ms: number;
      unexpected_segments: Array<{
        chapter_id: string;
        start_seconds: number;
        end_seconds: number;
        reason: string;
      }>;
    };
  };
  cast_consistency: {
    passed: boolean;
    script_character_ids: string[];
    selected_character_ids: string[];
    unresolved_character_ids: string[];
    mismatched_character_ids: string[];
    recurring_voice_change_character_ids: string[];
  };
  listening_review: {
    status: "performed" | "not-performed";
    passed: boolean;
    reviewer: string | null;
    reviewed_at: string | null;
    scope: "complete-master" | "none";
    chapter_ids: string[];
    disposition: "accepted" | "rerender-required" | "rejected" | "not-performed";
    findings: Array<{
      code: string;
      severity: "note" | "failure";
      description: string;
      chapter_id?: string;
      entry_id?: string;
      rerender_input_sha256?: string;
    }>;
  };
  production_acceptance: {
    passed: boolean;
    basis: "complete-master-human-listening" | "operator-authorized-mechanical-and-asr-waiver";
    authorized_by: string;
    authorized_at: string;
    rationale: string;
    handoff_evidence_sha256: string;
    working_master_sha256: string;
    chapter_ids: string[];
    disposition: "accepted" | "accepted-with-listening-waiver";
    findings: Array<{
      code: string;
      severity: "note" | "failure";
      description: string;
      chapter_id?: string;
      entry_id?: string;
      rerender_input_sha256?: string;
    }>;
  };
  chapters: AudioQaChapter[];
};

export type AudioProductionValidationIssue = {
  code:
    | "malformed_json"
    | "invalid_path"
    | "noncanonical_dialogue"
    | "dialogue_mismatch"
    | "invalid_schema_version"
    | "unknown_field"
    | "invalid_shape"
    | "duplicate_id"
    | "invalid_reference"
    | "missing_dependency"
    | "hash_mismatch"
    | "source_coverage_failure"
    | "commentary_coverage_failure"
    | "cast_resolution_failure"
    | "invalid_metric"
    | "acceptance_gate_failure";
  path: string;
  message: string;
};

export type AudioSpokenEnglishSegment = {
  start_char: number;
  end_char: number;
};

type Inspected<T> = { value?: T; issues: AudioProductionValidationIssue[] };

const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_REVISION = /^[0-9a-f]{40}$/u;
const SAFE_ID = /^[a-z0-9][a-z0-9_-]*$/u;
const CHARACTER_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/u;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u;
const SCRIPT_KINDS = new Set<AudioScriptEntryKind>(["source", "commentary", "heading", "meta"]);
const GENERATED_ATTRIBUTION_VERSION = /^screenplay-generator-v3\+attribution\.([a-f0-9]{64})$/u;
const CADENCE_INTENTS = new Set<AudioCadenceIntent>([
  "none",
  "continuation",
  "short_reply",
  "exchange",
  "reflective",
  "commentary",
  "chapter",
]);
const SCRIPT_FIELDS = new Set([
  "schema_version",
  "dialogue",
  "source_hashes",
  "commentary_sha256",
  "commentary_quality_audit_sha256",
  "cast_sha256",
  "generator_version",
  "chapters",
  "entries",
  "repairs",
  "coverage",
]);
const SOURCE_HASH_FIELDS = new Set(["english", "stephanus"]);
const CHAPTER_FIELDS = new Set(["id", "commentary_id", "title"]);
const ENTRY_FIELDS = new Set(["id", "chapter_id", "kind", "character_id", "text", "anchor", "cadence_intent"]);
const REPAIR_FIELDS = new Set(["id", "old_text", "new_text", "reason", "occurrence_count"]);
const COVERAGE_FIELDS = new Set([
  "source_words",
  "source_words_covered",
  "source_words_uncovered",
  "source_words_duplicated",
  "commentary_blocks_expected",
  "commentary_blocks_covered",
  "commentary_blocks_missing",
  "commentary_blocks_duplicated",
]);
const ENGLISH_STRUCTURAL_TOKEN_BODY = String.raw`(?:\d+[a-e]|b\d+|sp\d+|p|\/?(?:add|corr|del|name|pers|place|q|quote|rs|sic))`;
const ENGLISH_STRUCTURAL_TOKEN = new RegExp(`^\\{${ENGLISH_STRUCTURAL_TOKEN_BODY}\\}$`, "u");
const ENGLISH_STRUCTURAL_TOKEN_GLOBAL = new RegExp(`\\{${ENGLISH_STRUCTURAL_TOKEN_BODY}\\}`, "gu");
const ENGLISH_BRACE_TOKEN_GLOBAL = /\{[^{}\n]*\}/gu;
const ENGLISH_SPEAKER_LABEL = String.raw`(?:\p{L}\.(?:\s+\p{L}\.)*\s+\p{L}+|\p{L}+(?:\s+\p{L}+){0,3})`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function positiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function parseJson(path: string, content: string): Inspected<Record<string, unknown>> {
  try {
    const value = JSON.parse(content) as unknown;
    if (!isRecord(value)) {
      return { issues: [{ code: "invalid_shape", path, message: "Artifact must be a JSON object." }] };
    }
    return { value, issues: [] };
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

function unknownFields(
  value: Record<string, unknown>,
  allowed: Set<string>,
  location: string,
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      issues.push({ code: "unknown_field", path, message: `${location} contains unknown field \`${key}\`.` });
    }
  }
}

function exactStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonEmptyString) && new Set(value).size === value.length;
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function sameArray(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validRepoRelativePath(value: string) {
  if (value.includes("\\")) return false;
  try {
    const normalized = normalizeRepoPath(value);
    return normalized.relativePath === value;
  } catch {
    return false;
  }
}

export function audioWordCount(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function normalizeSpokenEnglish(text: string) {
  return text
    .normalize("NFC")
    .replace(/\s+/gu, " ")
    .replace(/\s+([,.;:?!])/gu, "$1")
    .trim();
}

export function characterNamesForDialogue(characters: CharacterCatalog, dialogue: string) {
  return sortedUnique(
    characters.characters.flatMap((character) => {
      const appearances = character.appearances.filter((appearance) => appearance.dialogue === dialogue);
      if (appearances.length === 0) return [];
      return [
        character.displayName,
        ...character.aliases,
        ...appearances.flatMap((appearance) => [...appearance.sourceLabels, ...appearance.sourceAliases]),
      ];
    }),
  );
}

function letterWords(text: string) {
  return text.match(/\p{L}+/gu)?.map((word) => word.toLocaleLowerCase("en-US")) ?? [];
}

function labelMatchesCharacterName(label: string, characterNames: string[]) {
  const labelWords = letterWords(label);
  if (labelWords.length === 0) return false;
  return characterNames.some((name) => {
    const nameWords = letterWords(name);
    if (labelWords.length === 1) {
      return nameWords.some((word) => word.startsWith(labelWords[0]!));
    }
    for (let offset = 0; offset <= nameWords.length - labelWords.length; offset += 1) {
      if (labelWords.every((word, index) => nameWords[offset + index]!.startsWith(word))) return true;
    }
    return false;
  });
}

function escapedRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function sourceSpeakerLabels(content: string, characterNames: string[]) {
  const lineLabel = new RegExp(
    `^(?:\\{${ENGLISH_STRUCTURAL_TOKEN_BODY}\\}\\s*)*(?<label>${ENGLISH_SPEAKER_LABEL})\\.\\s+`,
    "gmu",
  );
  const counts = new Map<string, number>();
  for (const match of content.matchAll(lineLabel)) {
    const label = match.groups?.label;
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts]
    .filter(
      ([label, count]) =>
        labelMatchesCharacterName(label, characterNames) || (count >= 2 && /^\p{Lu}{2,8}$/u.test(label)),
    )
    .map(([label]) => label)
    .sort((left, right) => right.length - left.length || left.localeCompare(right));
}

type SpokenEnglishTransformation = {
  start: number;
  end: number;
  replacement: "" | " ";
};

function validateEnglishStructuralTokens(
  content: string,
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  const unsupportedTokens = sortedUnique(
    [...content.matchAll(ENGLISH_BRACE_TOKEN_GLOBAL)]
      .map((match) => match[0])
      .filter((token) => !ENGLISH_STRUCTURAL_TOKEN.test(token)),
  );
  if (unsupportedTokens.length === 0 && !content.replace(ENGLISH_BRACE_TOKEN_GLOBAL, "").match(/[{}]/u)) {
    return true;
  }
  issues.push({
    code: "source_coverage_failure",
    path,
    message: `Canonical English contains unsupported brace metadata: ${unsupportedTokens.join(", ") || "unbalanced brace"}.`,
  });
  return false;
}

function spokenEnglishTransformations(
  content: string,
  characterNames: string[],
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  const transformations: SpokenEnglishTransformation[] = [];
  for (const match of content.matchAll(ENGLISH_STRUCTURAL_TOKEN_GLOBAL)) {
    transformations.push({
      start: match.index,
      end: match.index + match[0].length,
      replacement: " ",
    });
  }
  for (const label of sourceSpeakerLabels(content, characterNames)) {
    const labelAtBoundary = new RegExp(
      `(^|\\{${ENGLISH_STRUCTURAL_TOKEN_BODY}\\}\\s+)${escapedRegExp(label)}\\.\\s*`,
      "gmu",
    );
    for (const match of content.matchAll(labelAtBoundary)) {
      const prefix = match[1] ?? "";
      transformations.push({
        start: match.index + prefix.length,
        end: match.index + match[0].length,
        replacement: "",
      });
    }
  }
  transformations.sort((left, right) => left.start - right.start || left.end - right.end);
  for (let index = 1; index < transformations.length; index += 1) {
    const previous = transformations[index - 1]!;
    const current = transformations[index]!;
    if (current.start >= previous.end) continue;
    issues.push({
      code: "source_coverage_failure",
      path,
      message: `Canonical English transformations overlap at source offsets ${current.start}-${Math.min(previous.end, current.end)}.`,
    });
    return undefined;
  }
  return transformations;
}

function transformSpokenEnglishRange(
  content: string,
  start: number,
  end: number,
  transformations: SpokenEnglishTransformation[],
) {
  let transformed = "";
  let cursor = start;
  for (const transformation of transformations) {
    if (transformation.end <= start) continue;
    if (transformation.start >= end) break;
    transformed += content.slice(cursor, Math.max(cursor, transformation.start));
    if (transformation.start >= start) transformed += transformation.replacement;
    cursor = Math.max(cursor, Math.min(end, transformation.end));
  }
  return transformed + content.slice(cursor, end);
}

function applySourceRepairs(
  content: string,
  repairs: AudioScriptRepair[],
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  const replacements: Array<{ start: number; end: number; newText: string; repairId: string }> = [];
  for (const repair of repairs) {
    let offset = 0;
    let occurrences = 0;
    while (offset <= content.length - repair.old_text.length) {
      const start = content.indexOf(repair.old_text, offset);
      if (start < 0) break;
      replacements.push({
        start,
        end: start + repair.old_text.length,
        newText: repair.new_text,
        repairId: repair.id,
      });
      occurrences += 1;
      offset = start + repair.old_text.length;
    }
    if (occurrences !== repair.occurrence_count) {
      issues.push({
        code: "source_coverage_failure",
        path,
        message: `Repair \`${repair.id}\` declares ${repair.occurrence_count} occurrences but source contains ${occurrences}.`,
      });
    }
  }
  replacements.sort((left, right) => left.start - right.start || left.end - right.end);
  for (let index = 1; index < replacements.length; index += 1) {
    const previous = replacements[index - 1]!;
    const current = replacements[index]!;
    if (current.start < previous.end) {
      issues.push({
        code: "source_coverage_failure",
        path,
        message: `Repairs \`${previous.repairId}\` and \`${current.repairId}\` overlap in the canonical English source.`,
      });
    }
  }
  if (issues.some((issue) => issue.code === "source_coverage_failure")) return undefined;
  let repaired = "";
  let cursor = 0;
  for (const replacement of replacements) {
    repaired += content.slice(cursor, replacement.start);
    repaired += replacement.newText;
    cursor = replacement.end;
  }
  return repaired + content.slice(cursor);
}

export function canonicalSpokenEnglish(
  content: string,
  repairs: AudioScriptRepair[],
  characterNames: string[],
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  const repaired = applySourceRepairs(content, repairs, path, issues);
  if (repaired === undefined) return undefined;
  if (!validateEnglishStructuralTokens(repaired, path, issues)) return undefined;
  const transformations = spokenEnglishTransformations(repaired, characterNames, path, issues);
  if (!transformations) return undefined;
  return normalizeSpokenEnglish(transformSpokenEnglishRange(repaired, 0, repaired.length, transformations));
}

export function canonicalSpokenEnglishSegments(
  content: string,
  segments: readonly AudioSpokenEnglishSegment[],
  characterNames: string[],
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  if (!validateEnglishStructuralTokens(content, path, issues)) return undefined;
  let cursor = 0;
  for (const [index, segment] of segments.entries()) {
    if (
      !Number.isSafeInteger(segment.start_char) ||
      !Number.isSafeInteger(segment.end_char) ||
      segment.start_char !== cursor ||
      segment.end_char <= segment.start_char ||
      segment.end_char > content.length
    ) {
      issues.push({
        code: "source_coverage_failure",
        path,
        message: `Spoken-English segment ${index} must start at ${cursor} and end within the canonical source.`,
      });
      return undefined;
    }
    cursor = segment.end_char;
  }
  if (cursor !== content.length) {
    issues.push({
      code: "source_coverage_failure",
      path,
      message: `Spoken-English segments end at ${cursor}, but the canonical source ends at ${content.length}.`,
    });
    return undefined;
  }
  const transformations = spokenEnglishTransformations(content, characterNames, path, issues);
  if (!transformations) return undefined;
  const spokenSegments = segments.map((segment) =>
    normalizeSpokenEnglish(
      transformSpokenEnglishRange(content, segment.start_char, segment.end_char, transformations),
    ),
  );
  for (let index = 1; index < spokenSegments.length; index += 1) {
    const leadingPunctuation = /^[,.;:?!]+/u.exec(spokenSegments[index]!)?.[0];
    if (!leadingPunctuation) continue;
    spokenSegments[index - 1] += leadingPunctuation;
    spokenSegments[index] = spokenSegments[index]!.slice(leadingPunctuation.length).trimStart();
  }
  return spokenSegments;
}

function firstTextDifference(expected: string, actual: string) {
  let offset = 0;
  while (offset < expected.length && offset < actual.length && expected[offset] === actual[offset]) offset += 1;
  return {
    offset,
    expected: expected.slice(Math.max(0, offset - 24), offset + 48),
    actual: actual.slice(Math.max(0, offset - 24), offset + 48),
  };
}

function artifactDialogue(path: string, directory: "scripts" | "qa") {
  return new RegExp(`^audio/${directory}/([a-z0-9-]+)\\.json$`, "u").exec(path)?.[1];
}

function canonicalDialogueIssues(path: string, dialogue: string, directory: "scripts" | "qa") {
  const issues: AudioProductionValidationIssue[] = [];
  const fromPath = artifactDialogue(path, directory);
  if (!fromPath) {
    issues.push({
      code: "invalid_path",
      path,
      message: `Path must match audio/${directory}/<canonical-dialogue>.json.`,
    });
  } else if (fromPath !== dialogue) {
    issues.push({
      code: "dialogue_mismatch",
      path,
      message: `Artifact dialogue \`${dialogue}\` does not match filename dialogue \`${fromPath}\`.`,
    });
  }
  if (!listGreekDialogues().includes(dialogue)) {
    issues.push({
      code: "noncanonical_dialogue",
      path,
      message: `Dialogue \`${dialogue}\` is not one of the canonical Greek source files.`,
    });
  }
  return issues;
}

function inspectScript(path: string, content: string): Inspected<AudioScript> {
  const parsed = parseJson(path, content);
  if (!parsed.value) return parsed as Inspected<AudioScript>;
  const raw = parsed.value;
  const issues = parsed.issues;
  unknownFields(raw, SCRIPT_FIELDS, "screenplay", path, issues);
  if (raw.schema_version !== 2) {
    issues.push({ code: "invalid_schema_version", path, message: "screenplay.schema_version must be 2." });
  }
  if (!nonEmptyString(raw.dialogue) || !CHARACTER_ID.test(raw.dialogue)) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.dialogue must be a lowercase dialogue slug." });
  }
  if (!nonEmptyString(raw.generator_version)) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.generator_version must be non-empty." });
  }
  for (const field of ["commentary_sha256", "commentary_quality_audit_sha256", "cast_sha256"] as const) {
    if (!nonEmptyString(raw[field]) || !SHA256.test(raw[field])) {
      issues.push({ code: "invalid_shape", path, message: `screenplay.${field} must be a lowercase SHA-256.` });
    }
  }
  if (!isRecord(raw.source_hashes)) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.source_hashes must be an object." });
  } else {
    unknownFields(raw.source_hashes, SOURCE_HASH_FIELDS, "screenplay.source_hashes", path, issues);
    if (
      Object.keys(raw.source_hashes).length !== 2 ||
      !nonEmptyString(raw.source_hashes.english) ||
      !SHA256.test(raw.source_hashes.english) ||
      !nonEmptyString(raw.source_hashes.stephanus) ||
      !SHA256.test(raw.source_hashes.stephanus)
    ) {
      issues.push({
        code: "invalid_shape",
        path,
        message: "screenplay.source_hashes must contain exactly lowercase SHA-256 fields english and stephanus.",
      });
    }
  }

  const chapters: AudioScriptChapter[] = [];
  if (!Array.isArray(raw.chapters) || raw.chapters.length === 0) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.chapters must be a non-empty array." });
  } else {
    for (const [index, chapter] of raw.chapters.entries()) {
      if (!isRecord(chapter)) {
        issues.push({ code: "invalid_shape", path, message: `screenplay.chapters[${index}] must be an object.` });
        continue;
      }
      unknownFields(chapter, CHAPTER_FIELDS, `screenplay.chapters[${index}]`, path, issues);
      if (
        !nonEmptyString(chapter.id) ||
        !SAFE_ID.test(chapter.id) ||
        !nonEmptyString(chapter.commentary_id) ||
        (chapter.title !== undefined && !nonEmptyString(chapter.title))
      ) {
        issues.push({ code: "invalid_shape", path, message: `screenplay.chapters[${index}] has invalid fields.` });
        continue;
      }
      chapters.push(chapter as AudioScriptChapter);
    }
  }

  const entries: AudioScriptEntry[] = [];
  if (!Array.isArray(raw.entries) || raw.entries.length === 0) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.entries must be a non-empty array." });
  } else {
    for (const [index, entry] of raw.entries.entries()) {
      if (!isRecord(entry)) {
        issues.push({ code: "invalid_shape", path, message: `screenplay.entries[${index}] must be an object.` });
        continue;
      }
      unknownFields(entry, ENTRY_FIELDS, `screenplay.entries[${index}]`, path, issues);
      if (
        !nonEmptyString(entry.id) ||
        !SAFE_ID.test(entry.id) ||
        !nonEmptyString(entry.chapter_id) ||
        !nonEmptyString(entry.character_id) ||
        !CHARACTER_ID.test(entry.character_id) ||
        !nonEmptyString(entry.text) ||
        entry.text !== entry.text.trim() ||
        /\s{2,}/u.test(entry.text) ||
        !SCRIPT_KINDS.has(entry.kind as AudioScriptEntryKind) ||
        !CADENCE_INTENTS.has(entry.cadence_intent as AudioCadenceIntent) ||
        !isRecord(entry.anchor)
      ) {
        issues.push({ code: "invalid_shape", path, message: `screenplay.entries[${index}] has invalid fields.` });
        continue;
      }
      entries.push(entry as AudioScriptEntry);
    }
  }

  const repairs: AudioScriptRepair[] = [];
  if (!Array.isArray(raw.repairs)) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.repairs must be an array." });
  } else {
    for (const [index, repair] of raw.repairs.entries()) {
      if (!isRecord(repair)) {
        issues.push({ code: "invalid_shape", path, message: `screenplay.repairs[${index}] must be an object.` });
        continue;
      }
      unknownFields(repair, REPAIR_FIELDS, `screenplay.repairs[${index}]`, path, issues);
      if (
        !nonEmptyString(repair.id) ||
        !SAFE_ID.test(repair.id) ||
        !nonEmptyString(repair.old_text) ||
        !nonEmptyString(repair.new_text) ||
        repair.old_text === repair.new_text ||
        !nonEmptyString(repair.reason) ||
        !nonNegativeInteger(repair.occurrence_count) ||
        repair.occurrence_count === 0
      ) {
        issues.push({ code: "invalid_shape", path, message: `screenplay.repairs[${index}] has invalid fields.` });
        continue;
      }
      repairs.push(repair as AudioScriptRepair);
    }
  }

  let coverage: AudioScriptCoverage | undefined;
  if (!isRecord(raw.coverage)) {
    issues.push({ code: "invalid_shape", path, message: "screenplay.coverage must be an object." });
  } else {
    const rawCoverage = raw.coverage as Record<string, unknown>;
    unknownFields(rawCoverage, COVERAGE_FIELDS, "screenplay.coverage", path, issues);
    if (
      Object.keys(rawCoverage).length !== COVERAGE_FIELDS.size ||
      [...COVERAGE_FIELDS].some((field) => !nonNegativeInteger(rawCoverage[field]))
    ) {
      issues.push({
        code: "invalid_shape",
        path,
        message: "screenplay.coverage must contain every deterministic non-negative integer total and no defaults.",
      });
    } else {
      coverage = rawCoverage as AudioScriptCoverage;
    }
  }

  if (
    issues.some((issue) => ["malformed_json", "invalid_shape", "unknown_field"].includes(issue.code)) ||
    raw.schema_version !== 2 ||
    !nonEmptyString(raw.dialogue) ||
    !isRecord(raw.source_hashes) ||
    !nonEmptyString(raw.commentary_sha256) ||
    !nonEmptyString(raw.commentary_quality_audit_sha256) ||
    !nonEmptyString(raw.cast_sha256) ||
    !nonEmptyString(raw.generator_version) ||
    !coverage
  ) {
    return { issues };
  }
  return {
    issues,
    value: {
      schema_version: 2,
      dialogue: raw.dialogue,
      source_hashes: raw.source_hashes as AudioScript["source_hashes"],
      commentary_sha256: raw.commentary_sha256,
      commentary_quality_audit_sha256: raw.commentary_quality_audit_sha256,
      cast_sha256: raw.cast_sha256,
      generator_version: raw.generator_version,
      chapters,
      entries,
      repairs,
      coverage,
    },
  };
}

function exactAnchor(
  entry: AudioScriptEntry,
  index: number,
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  const fields = Object.keys(entry.anchor);
  const location = `screenplay.entries[${index}].anchor`;
  if (entry.kind === "source") {
    if (fields.length !== 1 || !nonEmptyString((entry.anchor as { stephanus?: unknown }).stephanus)) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `${location} must contain exactly stephanus for a source entry.`,
      });
    }
    if (entry.cadence_intent === "commentary") {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Source entry \`${entry.id}\` cannot use commentary cadence.`,
      });
    }
    return;
  }
  if (entry.kind === "commentary" || entry.kind === "heading") {
    if (fields.length !== 1 || !nonEmptyString((entry.anchor as { commentary_id?: unknown }).commentary_id)) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `${location} must contain exactly commentary_id for a ${entry.kind} entry.`,
      });
    }
    const allowedCadence = entry.kind === "heading" ? entry.cadence_intent === "chapter" : ["commentary", "chapter"].includes(entry.cadence_intent);
    if (!allowedCadence) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `${entry.kind} entry \`${entry.id}\` has incompatible cadence \`${entry.cadence_intent}\`.`,
      });
    }
    return;
  }
  const scope = (entry.anchor as { scope?: unknown }).scope;
  if (fields.length !== 1 || (scope !== "dialogue" && scope !== "chapter")) {
    issues.push({
      code: "invalid_reference",
      path,
      message: `${location} must contain exactly scope (dialogue or chapter) for a meta entry.`,
    });
  }
  if (entry.cadence_intent !== "none" && entry.cadence_intent !== "chapter") {
    issues.push({
      code: "invalid_reference",
      path,
      message: `Meta entry \`${entry.id}\` must use none or chapter cadence.`,
    });
  }
}

function validateScriptIntegrity(script: AudioScript, path: string) {
  const issues = canonicalDialogueIssues(path, script.dialogue, "scripts");
  const chapterIds = new Set<string>();
  const commentaryChapterIds = new Set<string>();
  for (const chapter of script.chapters) {
    if (chapterIds.has(chapter.id)) {
      issues.push({ code: "duplicate_id", path, message: `Duplicate chapter id \`${chapter.id}\`.` });
    }
    if (commentaryChapterIds.has(chapter.commentary_id)) {
      issues.push({
        code: "duplicate_id",
        path,
        message: `Commentary section \`${chapter.commentary_id}\` is assigned to multiple chapters.`,
      });
    }
    chapterIds.add(chapter.id);
    commentaryChapterIds.add(chapter.commentary_id);
  }

  const entryIds = new Set<string>();
  const repairIds = new Set<string>();
  const repairOldTexts = new Set<string>();
  const chapterOrder = new Map(script.chapters.map((chapter, index) => [chapter.id, index]));
  const chapterCounts = new Map(script.chapters.map((chapter) => [chapter.id, 0]));
  let priorChapterIndex = -1;
  for (const [index, entry] of script.entries.entries()) {
    if (entryIds.has(entry.id)) {
      issues.push({ code: "duplicate_id", path, message: `Duplicate entry id \`${entry.id}\`.` });
    }
    entryIds.add(entry.id);
    const currentChapterIndex = chapterOrder.get(entry.chapter_id);
    if (currentChapterIndex === undefined) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Entry \`${entry.id}\` refers to unknown chapter \`${entry.chapter_id}\`.`,
      });
    } else {
      if (currentChapterIndex < priorChapterIndex) {
        issues.push({
          code: "invalid_reference",
          path,
          message: `Entry \`${entry.id}\` returns to an earlier chapter; chapter entry order must be contiguous.`,
        });
      }
      priorChapterIndex = currentChapterIndex;
      chapterCounts.set(entry.chapter_id, (chapterCounts.get(entry.chapter_id) ?? 0) + 1);
    }
    exactAnchor(entry, index, path, issues);
  }
  for (const [chapterId, count] of chapterCounts) {
    if (count === 0) {
      issues.push({ code: "invalid_reference", path, message: `Chapter \`${chapterId}\` has no screenplay entries.` });
    }
  }

  for (const repair of script.repairs) {
    if (repairIds.has(repair.id)) {
      issues.push({ code: "duplicate_id", path, message: `Duplicate repair id \`${repair.id}\`.` });
    }
    if (repairOldTexts.has(repair.old_text)) {
      issues.push({
        code: "duplicate_id",
        path,
        message: `Repair source text \`${repair.old_text}\` is enumerated more than once.`,
      });
    }
    repairIds.add(repair.id);
    repairOldTexts.add(repair.old_text);
  }

  const sourceWords = script.entries
    .filter((entry) => entry.kind === "source")
    .reduce((sum, entry) => sum + audioWordCount(entry.text), 0);
  const commentaryAnchors = script.entries
    .filter((entry) => entry.kind === "commentary")
    .map((entry) => (entry.anchor as { commentary_id: string }).commentary_id);
  const duplicateCommentaryCount = commentaryAnchors.length - new Set(commentaryAnchors).size;
  const coverage = script.coverage;
  if (sourceWords === 0) {
    issues.push({
      code: "source_coverage_failure",
      path,
      message: "A production screenplay must contain at least one non-empty source entry.",
    });
  }
  if (
    coverage.source_words !== sourceWords ||
    coverage.source_words_covered !== sourceWords ||
    coverage.source_words_uncovered !== 0 ||
    coverage.source_words_duplicated !== 0
  ) {
    issues.push({
      code: "source_coverage_failure",
      path,
      message: `Source coverage must report exactly ${sourceWords} screenplay source words with zero uncovered or duplicated words.`,
    });
  }
  if (
    coverage.commentary_blocks_covered !== new Set(commentaryAnchors).size ||
    coverage.commentary_blocks_duplicated !== duplicateCommentaryCount ||
    coverage.commentary_blocks_missing !==
      Math.max(coverage.commentary_blocks_expected - coverage.commentary_blocks_covered, 0) ||
    coverage.commentary_blocks_missing !== 0 ||
    coverage.commentary_blocks_duplicated !== 0
  ) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: "Commentary coverage totals must match unique commentary entries with zero missing or duplicated blocks.",
    });
  }
  return issues;
}

type CommentaryRecord = {
  id: string;
  kind: string;
  placement: string;
  span: string;
  title: string;
  body: string;
  status: string;
  audioInsertion?: AudioInsertionBoundary;
};

function commentaryRecords(content: string) {
  return commentaryMarkdownBlocks(content).flatMap((block): CommentaryRecord[] => {
    const id = fieldValue(block.content, "commentary_id");
    if (!id) return [];
    const audioInsertion = inspectAudioInsertionBlock(block.content).value;
    return [
      {
        id,
        kind: fieldValue(block.content, "block_kind") ?? "",
        placement: fieldValue(block.content, "placement") ?? "",
        span: fieldValue(block.content, "stephanus_span") ?? "",
        title: fieldValue(block.content, "title") ?? "",
        body: fieldValue(block.content, "body") ?? "",
        status: fieldValue(block.content, "review_status") ?? "",
        ...(audioInsertion ? { audioInsertion } : {}),
      },
    ];
  });
}

function readCatalogs(): { characters?: CharacterCatalog; cast?: CastCatalog } {
  const root = getRepoRoot();
  const characterPath = join(root, "audio/characters.json");
  const castPath = join(root, "audio/cast.json");
  if (!existsSync(characterPath) || !existsSync(castPath)) return {};
  try {
    const characterContent = readFileSync(characterPath, "utf8");
    const characters = parseCharacterCatalog("audio/characters.json", characterContent);
    const cast = parseCastCatalog("audio/cast.json", readFileSync(castPath, "utf8"), characters);
    return { characters, cast };
  } catch {
    return {};
  }
}

function commentaryAudioBoundaryChars(
  dialogue: string,
  englishContent: string,
  stephanusContent: string,
  records: CommentaryRecord[],
) {
  const index = parseStephanusIndexToon(stephanusContent);
  const ranges = projectStephanusSpansToMarkers(
    index.markers,
    records.map((record) => ({ id: record.id, span: record.span })),
  );
  const rangeById = new Map(ranges.map((range) => [range.id, range]));
  return new Map(
    records.map((record) => {
      const range = rangeById.get(record.id)!;
      const boundaryChar = record.audioInsertion
        ? resolveAudioInsertionBoundary(
            dialogue,
            record.audioInsertion,
            record.kind === "section"
              ? undefined
              : record.placement === "before"
                ? "before"
                : "after",
          ).boundaryChar
        : record.kind === "section"
          ? sourceTurnBoundaryAtOrAfter(englishContent, range.markers[0]!.startChar)
          : record.placement === "before"
            ? sourceTurnBoundaryAtOrBefore(englishContent, range.markers[0]!.startChar)
            : sourceTurnBoundaryAtOrAfter(englishContent, range.markers.at(-1)!.endChar);
      return [record.id, boundaryChar] as const;
    }),
  );
}

function spokenPrefixesAtBoundaries(
  englishContent: string,
  boundaries: readonly number[],
  characterNames: string[],
  path: string,
  issues: AudioProductionValidationIssue[],
) {
  const cuts = [...new Set([0, ...boundaries, englishContent.length])].sort((left, right) => left - right);
  if (cuts.some((cut) => cut < 0 || cut > englishContent.length)) return undefined;
  const segments = cuts.slice(0, -1).map((startChar, index) => ({
    start_char: startChar,
    end_char: cuts[index + 1]!,
  }));
  const spoken = canonicalSpokenEnglishSegments(englishContent, segments, characterNames, path, issues);
  if (!spoken) return undefined;
  const prefixes = new Map<number, string>([[0, ""]]);
  let cumulative = "";
  for (const [index, text] of spoken.entries()) {
    cumulative = normalizeSpokenEnglish([cumulative, text].filter(Boolean).join(" "));
    prefixes.set(cuts[index + 1]!, cumulative);
  }
  return prefixes;
}

function validateScriptAgainstRepo(script: AudioScript, path: string) {
  const root = getRepoRoot();
  const issues: AudioProductionValidationIssue[] = [];
  const attributionVersion = GENERATED_ATTRIBUTION_VERSION.exec(script.generator_version);
  if (!attributionVersion) {
    issues.push({
      code: "hash_mismatch",
      path,
      message: "Screenplay generator_version must use screenplay-generator-v3 and bind the exact accepted speaker-attribution SHA-256.",
    });
  }
  const dependencies = {
    english: `raw/plato/english/${script.dialogue}.txt`,
    stephanus: englishStephanusIndexPath(script.dialogue),
    commentary: `wiki/commentary/${script.dialogue}.md`,
    commentaryQualityAudit: `wiki/commentary-audits/${script.dialogue}.json`,
    cast: "audio/cast.json",
    characters: "audio/characters.json",
    ...(attributionVersion ? { attribution: `audio/speaker-attributions/${script.dialogue}.json` } : {}),
  };
  for (const [label, relativePath] of Object.entries(dependencies)) {
    if (!existsSync(join(root, relativePath))) {
      issues.push({
        code: "missing_dependency",
        path,
        message: `Present screenplay requires ${label} dependency \`${relativePath}\`.`,
      });
    }
  }
  if (issues.some((issue) => issue.code === "missing_dependency")) return issues;

  const englishContent = readFileSync(join(root, dependencies.english), "utf8");
  const stephanusContent = readFileSync(join(root, dependencies.stephanus), "utf8");
  const commentaryContent = readFileSync(join(root, dependencies.commentary), "utf8");
  const commentaryQualityAuditContent = readFileSync(join(root, dependencies.commentaryQualityAudit), "utf8");
  const castContent = readFileSync(join(root, dependencies.cast), "utf8");
  const expectedHashes = {
    english: sha256(englishContent),
    stephanus: sha256(stephanusContent),
    commentary: sha256(commentaryContent),
    commentaryQualityAudit: sha256(commentaryQualityAuditContent),
    cast: sha256(castContent),
  };
  const hashChecks: Array<[string, string, string]> = [
    ["source_hashes.english", script.source_hashes.english, expectedHashes.english],
    ["source_hashes.stephanus", script.source_hashes.stephanus, expectedHashes.stephanus],
    ["commentary_sha256", script.commentary_sha256, expectedHashes.commentary],
    [
      "commentary_quality_audit_sha256",
      script.commentary_quality_audit_sha256,
      expectedHashes.commentaryQualityAudit,
    ],
    ["cast_sha256", script.cast_sha256, expectedHashes.cast],
  ];
  for (const [field, actual, expected] of hashChecks) {
    if (actual !== expected) {
      issues.push({
        code: "hash_mismatch",
        path,
        message: `screenplay.${field} does not match the current repository dependency (expected ${expected}).`,
      });
    }
  }
  try {
    const qualityAudit = parseCommentaryQualityAuditManifest(
      dependencies.commentaryQualityAudit,
      commentaryQualityAuditContent,
    );
    if (qualityAudit.acceptance.decision !== "accepted") {
      issues.push({
        code: "acceptance_gate_failure",
        path,
        message: `Screenplay requires an operator-delegated Luna-sample-accepted commentary quality audit ${dependencies.commentaryQualityAudit}.`,
      });
    }
  } catch (error) {
    issues.push({
      code: "invalid_reference",
      path,
      message: `Screenplay commentary quality audit is invalid: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  if (attributionVersion) {
    const attributionPath = `audio/speaker-attributions/${script.dialogue}.json`;
    const attributionContent = readFileSync(join(root, attributionPath), "utf8");
    if (sha256(attributionContent) !== attributionVersion[1]) {
      issues.push({
        code: "hash_mismatch",
        path,
        message: `screenplay.generator_version does not match the current accepted speaker attribution ${attributionPath}.`,
      });
    }
    try {
      const attribution = JSON.parse(attributionContent) as unknown;
      if (
        !isRecord(attribution) ||
        attribution.schema_version !== 2 ||
        attribution.voice_policy !== "reported-speech-inherits-active-character-v1" ||
        attribution.dialogue !== script.dialogue ||
        attribution.english_sha256 !== expectedHashes.english ||
        attribution.status !== "accepted" ||
        !nonEmptyString(attribution.reviewer) ||
        !nonEmptyString(attribution.reviewed_at) ||
        !DATE.test(attribution.reviewed_at)
      ) {
        issues.push({
          code: "invalid_reference",
          path,
          message: `Generated screenplay requires a reviewed, accepted, source-pinned ${attributionPath}.`,
        });
      }
    } catch {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Generated screenplay attribution dependency ${attributionPath} is malformed JSON.`,
      });
    }
  }

  const { characters, cast } = readCatalogs();
  if (!characters || !cast) {
    issues.push({
      code: "cast_resolution_failure",
      path,
      message: "Screenplay cast resolution requires valid audio/characters.json and audio/cast.json.",
    });
  }

  if (characters) {
    const expectedSpoken = canonicalSpokenEnglish(
      englishContent,
      script.repairs,
      characterNamesForDialogue(characters, script.dialogue),
      path,
      issues,
    );
    if (expectedSpoken !== undefined) {
      const actualSpoken = normalizeSpokenEnglish(
        script.entries
          .filter((entry) => entry.kind === "source")
          .map((entry) => entry.text)
          .join(" "),
      );
      if (actualSpoken !== expectedSpoken) {
        const difference = firstTextDifference(expectedSpoken, actualSpoken);
        issues.push({
          code: "source_coverage_failure",
          path,
          message:
            "Ordered source entries must equal the complete canonical spoken English after deterministic repairs and metadata normalization; " +
            `first difference at character ${difference.offset} (expected ${JSON.stringify(difference.expected)}, got ${JSON.stringify(difference.actual)}).`,
        });
      }
      const expectedWords = audioWordCount(expectedSpoken);
      if (
        script.coverage.source_words !== expectedWords ||
        script.coverage.source_words_covered !== expectedWords ||
        script.coverage.source_words_uncovered !== 0 ||
        script.coverage.source_words_duplicated !== 0
      ) {
        issues.push({
          code: "source_coverage_failure",
          path,
          message: `Coverage must report all ${expectedWords} canonical spoken English words exactly once.`,
        });
      }
    }
  }

  let indexMarkers = new Set<string>();
  try {
    const index = parseStephanusIndexToon(stephanusContent);
    indexMarkers = new Set(index.markers.map((marker) => marker.marker));
  } catch (error) {
    issues.push({
      code: "invalid_reference",
      path,
      message: `Cannot parse ${dependencies.stephanus}: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  for (const entry of script.entries.filter((candidate) => candidate.kind === "source")) {
    const span = (entry.anchor as { stephanus: string }).stephanus;
    const [start, end = start] = span.split("-");
    if (!start || !end || !indexMarkers.has(start) || !indexMarkers.has(end)) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Source entry \`${entry.id}\` has unknown English Stephanus anchor \`${span}\`.`,
      });
    }
  }

  const records = commentaryRecords(commentaryContent);
  const pending = records.filter(
    (record) => record.status !== "accepted" && record.status !== "rejected",
  );
  const acceptedRecords = records.filter((record) => record.status === "accepted");
  if (acceptedRecords.length === 0 || pending.length > 0) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: `Screenplay requires at least one accepted commentary block and no active pending blocks; ${pending.length} block(s) remain unreviewed or needs_split. Rejected blocks are terminal and excluded from playback.`,
    });
  }
  const accepted = new Map(acceptedRecords.map((record) => [record.id, record]));
  const sectionIds = sortedUnique([...accepted.values()].filter((record) => record.kind === "section").map((record) => record.id));
  const chapterCommentaryIds = sortedUnique(script.chapters.map((chapter) => chapter.commentary_id));
  if (!sameArray(chapterCommentaryIds, sectionIds)) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: "Chapter commentary IDs must cover every accepted section commentary block exactly once.",
    });
  }
  const spokenCommentaryEntries = script.entries.filter((entry) => entry.kind === "commentary");
  const spokenCommentaryIds = spokenCommentaryEntries.map(
    (entry) => (entry.anchor as { commentary_id: string }).commentary_id,
  );
  if (!sameArray(sortedUnique(spokenCommentaryIds), sortedUnique([...accepted.keys()])) || spokenCommentaryIds.length !== accepted.size) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: "Commentary entries must speak every accepted commentary block exactly once and no other block.",
    });
  }
  for (const entry of spokenCommentaryEntries) {
    const id = (entry.anchor as { commentary_id: string }).commentary_id;
    const record = accepted.get(id);
    if (!record || entry.text !== record.body) {
      issues.push({
        code: "commentary_coverage_failure",
        path,
        message: `Commentary entry \`${entry.id}\` text must exactly match accepted block \`${id}\` body.`,
      });
    }
  }
  for (const entry of script.entries.filter((candidate) => candidate.kind === "heading")) {
    const id = (entry.anchor as { commentary_id: string }).commentary_id;
    const record = accepted.get(id);
    if (!record || record.kind !== "section" || !record.title || entry.text !== record.title) {
      issues.push({
        code: "commentary_coverage_failure",
        path,
        message: `Heading entry \`${entry.id}\` must exactly match an accepted section title.`,
      });
    }
  }
  const sectionRecords = acceptedRecords.filter((record) => record.kind === "section");
  if (!sameArray(script.chapters.map((chapter) => chapter.commentary_id), sectionRecords.map((record) => record.id))) {
    issues.push({
      code: "invalid_reference",
      path,
      message: "Screenplay chapters must preserve canonical commentary section order.",
    });
  }
  if (characters) {
    try {
      const boundaryChars = commentaryAudioBoundaryChars(
        script.dialogue,
        englishContent,
        stephanusContent,
        acceptedRecords,
      );
      const sectionBoundaries = sectionRecords.map((record) => boundaryChars.get(record.id)!);
      if (
        sectionBoundaries[0] !== 0 ||
        sectionBoundaries.some(
          (boundary, index) =>
            boundary >= englishContent.length ||
            (index > 0 && boundary <= sectionBoundaries[index - 1]!),
        )
      ) {
        issues.push({
          code: "invalid_reference",
          path,
          message: "Resolved chapter audio boundaries must begin at source char 0 and be strictly increasing without overlap.",
        });
      } else {
        const prefixes = spokenPrefixesAtBoundaries(
          englishContent,
          [...boundaryChars.values()],
          characterNamesForDialogue(characters, script.dialogue),
          path,
          issues,
        );
        if (prefixes) {
          let actualPrefix = "";
          for (const entry of script.entries) {
            if (entry.kind === "source") {
              actualPrefix = normalizeSpokenEnglish([actualPrefix, entry.text].filter(Boolean).join(" "));
              continue;
            }
            if (entry.kind !== "heading" && entry.kind !== "commentary") continue;
            const commentaryId = (entry.anchor as { commentary_id: string }).commentary_id;
            const boundaryChar = boundaryChars.get(commentaryId);
            const expectedPrefix = boundaryChar === undefined ? undefined : prefixes.get(boundaryChar);
            if (expectedPrefix !== undefined && actualPrefix !== expectedPrefix) {
              issues.push({
                code: "invalid_reference",
                path,
                message:
                  `Commentary entry \`${entry.id}\` must occur at its resolved source-turn boundary ` +
                  `(English char ${boundaryChar}); the current chapter/editorial boundary splits or reorders source text.`,
              });
            }
          }
        }
      }
    } catch (error) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Cannot resolve screenplay audio insertion boundaries: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  if (
    script.coverage.commentary_blocks_expected !== accepted.size ||
    script.coverage.commentary_blocks_covered !== accepted.size
  ) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: `Coverage must report ${accepted.size} expected and covered accepted commentary blocks.`,
    });
  }

  if (characters && cast) {
    const characterIds = new Set(characters.characters.map((character) => character.characterId));
    const voiceOwnerIds = new Set(voiceOwnerCharacterIdsForDialogue(characters, script.dialogue));
    const selectedIds = new Set(cast.voices.map((voice) => voice.characterId));
    for (const characterId of sortedUnique(script.entries.map((entry) => entry.character_id))) {
      if (!characterIds.has(characterId)) {
        issues.push({
          code: "cast_resolution_failure",
          path,
          message: `Screenplay character \`${characterId}\` is absent from audio/characters.json.`,
        });
      } else if (!voiceOwnerIds.has(characterId)) {
        issues.push({
          code: "cast_resolution_failure",
          path,
          message: `Screenplay character \`${characterId}\` is not a voice owner in this dialogue; reported speech must inherit the active character's voice.`,
        });
      } else if (!selectedIds.has(characterId)) {
        issues.push({
          code: "cast_resolution_failure",
          path,
          message: `Screenplay character \`${characterId}\` has no explicit selected cast voice; fallback is forbidden.`,
        });
      }
    }
  }
  return issues;
}

export function validateAudioScript(path: string, content: string) {
  const inspected = inspectScript(path, content);
  return inspected.value ? [...inspected.issues, ...validateScriptIntegrity(inspected.value, path)] : inspected.issues;
}

export function validateAudioScriptArtifact(path: string, content: string) {
  const inspected = inspectScript(path, content);
  if (!inspected.value) return inspected.issues;
  return [
    ...inspected.issues,
    ...validateScriptIntegrity(inspected.value, path),
    ...validateScriptAgainstRepo(inspected.value, path),
  ];
}

export function parseAudioScript(path: string, content: string) {
  const inspected = inspectScript(path, content);
  const issues = inspected.value ? [...inspected.issues, ...validateScriptIntegrity(inspected.value, path)] : inspected.issues;
  if (!inspected.value || issues.length > 0) throw new Error(formatAudioProductionIssues(issues));
  return inspected.value;
}

const QA_FIELDS = new Set([
  "schema_version",
  "dialogue",
  "status",
  "generated_at",
  "script_sha256",
  "cast_sha256",
  "source_coverage",
  "commentary_coverage",
  "asr",
  "audio",
  "cast_consistency",
  "listening_review",
  "production_acceptance",
  "chapters",
]);
const QA_SOURCE_FIELDS = new Set([
  "passed",
  "expected_words",
  "covered_words",
  "uncovered_words",
  "duplicated_words",
  "repairs_verified",
]);
const QA_COMMENTARY_FIELDS = new Set(["passed", "expected_ids", "covered_ids", "missing_ids", "duplicate_ids"]);
const QA_ASR_FIELDS = new Set([
  "passed",
  "model_repository",
  "model_revision",
  "max_word_error_rate",
  "max_ordinary_word_errors",
  "expected_words",
  "recognized_words",
  "word_errors",
  "ordinary_word_errors",
  "word_error_rate",
  "transcript_sha256",
  "exceptions",
]);
const QA_ASR_EXCEPTION_FIELDS = new Set([
  "expected",
  "recognized",
  "occurrences",
  "classification",
  "reviewed",
]);
const QA_AUDIO_FIELDS = new Set([
  "master_path",
  "master_sha256",
  "mime_type",
  "duration_seconds",
  "sample_rate_hz",
  "channels",
  "sample_format",
  "target_lufs",
  "tolerance_lu",
  "integrated_lufs",
  "true_peak_dbtp",
  "clipped_samples",
  "silence",
]);
const QA_SILENCE_FIELDS = new Set(["max_allowed_ms", "max_observed_ms", "unexpected_segments"]);
const QA_SILENCE_SEGMENT_FIELDS = new Set(["chapter_id", "start_seconds", "end_seconds", "reason"]);
const QA_CAST_FIELDS = new Set([
  "passed",
  "script_character_ids",
  "selected_character_ids",
  "unresolved_character_ids",
  "mismatched_character_ids",
  "recurring_voice_change_character_ids",
]);
const QA_LISTENING_FIELDS = new Set([
  "status",
  "passed",
  "reviewer",
  "reviewed_at",
  "scope",
  "chapter_ids",
  "disposition",
  "findings",
]);
const QA_PRODUCTION_ACCEPTANCE_FIELDS = new Set([
  "passed",
  "basis",
  "authorized_by",
  "authorized_at",
  "rationale",
  "handoff_evidence_sha256",
  "working_master_sha256",
  "chapter_ids",
  "disposition",
  "findings",
]);
const QA_FINDING_FIELDS = new Set([
  "code",
  "severity",
  "description",
  "chapter_id",
  "entry_id",
  "rerender_input_sha256",
]);
const QA_CHAPTER_FIELDS = new Set([
  "chapter_id",
  "audio_path",
  "audio_sha256",
  "duration_seconds",
  "source_words_expected",
  "source_words_covered",
  "source_words_uncovered",
  "source_words_duplicated",
  "commentary_ids_expected",
  "commentary_ids_covered",
  "asr_expected_words",
  "asr_word_errors",
  "asr_ordinary_word_errors",
  "asr_word_error_rate",
  "max_silence_ms",
  "integrated_lufs",
  "true_peak_dbtp",
  "clipped_samples",
  "cast_character_ids",
  "unresolved_character_ids",
  "mismatched_character_ids",
  "listening_disposition",
  "source_coverage_passed",
  "commentary_coverage_passed",
  "asr_passed",
  "silence_passed",
  "clipping_passed",
  "loudness_passed",
  "cast_consistency_passed",
  "listening_passed",
]);

function exactFieldsPresent(value: Record<string, unknown>, fields: Set<string>) {
  return Object.keys(value).length === fields.size && [...fields].every((field) => field in value);
}

function inspectQa(path: string, content: string): Inspected<AudioQaReport> {
  const parsed = parseJson(path, content);
  if (!parsed.value) return parsed as Inspected<AudioQaReport>;
  const raw = parsed.value;
  const issues = parsed.issues;
  unknownFields(raw, QA_FIELDS, "QA report", path, issues);
  if (raw.schema_version !== 2) {
    issues.push({ code: "invalid_schema_version", path, message: "qa.schema_version must be 2." });
  }
  if (!nonEmptyString(raw.dialogue) || !CHARACTER_ID.test(raw.dialogue)) {
    issues.push({ code: "invalid_shape", path, message: "qa.dialogue must be a lowercase dialogue slug." });
  }
  if (raw.status !== "draft" && raw.status !== "accepted" && raw.status !== "rejected") {
    issues.push({ code: "invalid_shape", path, message: "qa.status must be draft, accepted, or rejected." });
  }
  if (!nonEmptyString(raw.generated_at) || !TIMESTAMP.test(raw.generated_at)) {
    issues.push({ code: "invalid_shape", path, message: "qa.generated_at must be an explicit UTC ISO timestamp." });
  }
  for (const field of ["script_sha256", "cast_sha256"] as const) {
    if (!nonEmptyString(raw[field]) || !SHA256.test(raw[field])) {
      issues.push({ code: "invalid_shape", path, message: `qa.${field} must be a lowercase SHA-256.` });
    }
  }

  const source = raw.source_coverage;
  if (!isRecord(source)) {
    issues.push({ code: "invalid_shape", path, message: "qa.source_coverage must be an object." });
  } else {
    unknownFields(source, QA_SOURCE_FIELDS, "qa.source_coverage", path, issues);
    if (
      !exactFieldsPresent(source, QA_SOURCE_FIELDS) ||
      typeof source.passed !== "boolean" ||
      typeof source.repairs_verified !== "boolean" ||
      !nonNegativeInteger(source.expected_words) ||
      !nonNegativeInteger(source.covered_words) ||
      !nonNegativeInteger(source.uncovered_words) ||
      !nonNegativeInteger(source.duplicated_words)
    ) {
      issues.push({ code: "invalid_shape", path, message: "qa.source_coverage has invalid or defaulted fields." });
    }
  }

  const commentary = raw.commentary_coverage;
  if (!isRecord(commentary)) {
    issues.push({ code: "invalid_shape", path, message: "qa.commentary_coverage must be an object." });
  } else {
    unknownFields(commentary, QA_COMMENTARY_FIELDS, "qa.commentary_coverage", path, issues);
    if (
      !exactFieldsPresent(commentary, QA_COMMENTARY_FIELDS) ||
      typeof commentary.passed !== "boolean" ||
      !exactStringArray(commentary.expected_ids) ||
      !exactStringArray(commentary.covered_ids) ||
      !exactStringArray(commentary.missing_ids) ||
      !exactStringArray(commentary.duplicate_ids)
    ) {
      issues.push({ code: "invalid_shape", path, message: "qa.commentary_coverage has invalid or defaulted fields." });
    }
  }

  const asr = raw.asr;
  if (!isRecord(asr)) {
    issues.push({ code: "invalid_shape", path, message: "qa.asr must be an object." });
  } else {
    unknownFields(asr, QA_ASR_FIELDS, "qa.asr", path, issues);
    if (
      !exactFieldsPresent(asr, QA_ASR_FIELDS) ||
      typeof asr.passed !== "boolean" ||
      !nonEmptyString(asr.model_repository) ||
      !nonEmptyString(asr.model_revision) ||
      !GIT_REVISION.test(asr.model_revision) ||
      typeof asr.max_word_error_rate !== "number" ||
      !Number.isFinite(asr.max_word_error_rate) ||
      asr.max_word_error_rate < 0 ||
      asr.max_word_error_rate > 1 ||
      !nonNegativeInteger(asr.max_ordinary_word_errors) ||
      !nonNegativeInteger(asr.expected_words) ||
      !nonNegativeInteger(asr.recognized_words) ||
      !nonNegativeInteger(asr.word_errors) ||
      !nonNegativeInteger(asr.ordinary_word_errors) ||
      typeof asr.word_error_rate !== "number" ||
      !Number.isFinite(asr.word_error_rate) ||
      asr.word_error_rate < 0 ||
      asr.word_error_rate > 1 ||
      !nonEmptyString(asr.transcript_sha256) ||
      !SHA256.test(asr.transcript_sha256) ||
      !Array.isArray(asr.exceptions)
    ) {
      issues.push({ code: "invalid_shape", path, message: "qa.asr has invalid or defaulted fields." });
    } else {
      for (const [index, exception] of asr.exceptions.entries()) {
        if (!isRecord(exception)) {
          issues.push({ code: "invalid_shape", path, message: `qa.asr.exceptions[${index}] must be an object.` });
          continue;
        }
        unknownFields(exception, QA_ASR_EXCEPTION_FIELDS, `qa.asr.exceptions[${index}]`, path, issues);
        if (
          !exactFieldsPresent(exception, QA_ASR_EXCEPTION_FIELDS) ||
          !nonEmptyString(exception.expected) ||
          !nonEmptyString(exception.recognized) ||
          !nonNegativeInteger(exception.occurrences) ||
          exception.occurrences === 0 ||
          !["proper-name", "punctuation", "ordinary"].includes(String(exception.classification)) ||
          typeof exception.reviewed !== "boolean"
        ) {
          issues.push({ code: "invalid_shape", path, message: `qa.asr.exceptions[${index}] has invalid fields.` });
        }
      }
    }
  }

  const audio = raw.audio;
  if (!isRecord(audio)) {
    issues.push({ code: "invalid_shape", path, message: "qa.audio must be an object." });
  } else {
    unknownFields(audio, QA_AUDIO_FIELDS, "qa.audio", path, issues);
    if (
      !exactFieldsPresent(audio, QA_AUDIO_FIELDS) ||
      !nonEmptyString(audio.master_path) ||
      !validRepoRelativePath(audio.master_path) ||
      !nonEmptyString(audio.master_sha256) ||
      !SHA256.test(audio.master_sha256) ||
      !nonEmptyString(audio.mime_type) ||
      !positiveNumber(audio.duration_seconds) ||
      !nonNegativeInteger(audio.sample_rate_hz) ||
      audio.sample_rate_hz === 0 ||
      !nonNegativeInteger(audio.channels) ||
      audio.channels === 0 ||
      !nonEmptyString(audio.sample_format) ||
      typeof audio.target_lufs !== "number" ||
      !Number.isFinite(audio.target_lufs) ||
      !positiveNumber(audio.tolerance_lu) ||
      typeof audio.integrated_lufs !== "number" ||
      !Number.isFinite(audio.integrated_lufs) ||
      typeof audio.true_peak_dbtp !== "number" ||
      !Number.isFinite(audio.true_peak_dbtp) ||
      !nonNegativeInteger(audio.clipped_samples) ||
      !isRecord(audio.silence)
    ) {
      issues.push({ code: "invalid_shape", path, message: "qa.audio has invalid or defaulted fields." });
    } else {
      const silence = audio.silence;
      unknownFields(silence, QA_SILENCE_FIELDS, "qa.audio.silence", path, issues);
      if (
        !exactFieldsPresent(silence, QA_SILENCE_FIELDS) ||
        !nonNegativeInteger(silence.max_allowed_ms) ||
        !nonNegativeInteger(silence.max_observed_ms) ||
        !Array.isArray(silence.unexpected_segments)
      ) {
        issues.push({ code: "invalid_shape", path, message: "qa.audio.silence has invalid fields." });
      } else {
        for (const [index, segment] of silence.unexpected_segments.entries()) {
          if (!isRecord(segment)) {
            issues.push({ code: "invalid_shape", path, message: `qa.audio.silence.unexpected_segments[${index}] must be an object.` });
            continue;
          }
          unknownFields(segment, QA_SILENCE_SEGMENT_FIELDS, `qa.audio.silence.unexpected_segments[${index}]`, path, issues);
          if (
            !exactFieldsPresent(segment, QA_SILENCE_SEGMENT_FIELDS) ||
            !nonEmptyString(segment.chapter_id) ||
            typeof segment.start_seconds !== "number" ||
            !Number.isFinite(segment.start_seconds) ||
            segment.start_seconds < 0 ||
            !positiveNumber(segment.end_seconds) ||
            segment.end_seconds <= segment.start_seconds ||
            !nonEmptyString(segment.reason)
          ) {
            issues.push({ code: "invalid_shape", path, message: `qa.audio.silence.unexpected_segments[${index}] has invalid fields.` });
          }
        }
      }
    }
  }

  const cast = raw.cast_consistency;
  if (!isRecord(cast)) {
    issues.push({ code: "invalid_shape", path, message: "qa.cast_consistency must be an object." });
  } else {
    unknownFields(cast, QA_CAST_FIELDS, "qa.cast_consistency", path, issues);
    if (
      !exactFieldsPresent(cast, QA_CAST_FIELDS) ||
      typeof cast.passed !== "boolean" ||
      !exactStringArray(cast.script_character_ids) ||
      !exactStringArray(cast.selected_character_ids) ||
      !exactStringArray(cast.unresolved_character_ids) ||
      !exactStringArray(cast.mismatched_character_ids) ||
      !exactStringArray(cast.recurring_voice_change_character_ids)
    ) {
      issues.push({ code: "invalid_shape", path, message: "qa.cast_consistency has invalid or defaulted fields." });
    }
  }

  const listening = raw.listening_review;
  if (!isRecord(listening)) {
    issues.push({ code: "invalid_shape", path, message: "qa.listening_review must be an object." });
  } else {
    unknownFields(listening, QA_LISTENING_FIELDS, "qa.listening_review", path, issues);
    const commonListeningShapeIsValid =
      !exactFieldsPresent(listening, QA_LISTENING_FIELDS) ||
      !["performed", "not-performed"].includes(String(listening.status)) ||
      typeof listening.passed !== "boolean" ||
      !exactStringArray(listening.chapter_ids) ||
      !Array.isArray(listening.findings);
    const performedListeningShapeIsValid =
      listening.status === "performed" &&
      nonEmptyString(listening.reviewer) &&
      nonEmptyString(listening.reviewed_at) &&
      DATE.test(listening.reviewed_at) &&
      listening.scope === "complete-master" &&
      ["accepted", "rerender-required", "rejected"].includes(String(listening.disposition));
    const notPerformedListeningShapeIsValid =
      listening.status === "not-performed" &&
      listening.passed === false &&
      listening.reviewer === null &&
      listening.reviewed_at === null &&
      listening.scope === "none" &&
      Array.isArray(listening.chapter_ids) &&
      listening.chapter_ids.length === 0 &&
      listening.disposition === "not-performed" &&
      Array.isArray(listening.findings) &&
      listening.findings.length === 0;
    if (commonListeningShapeIsValid || (!performedListeningShapeIsValid && !notPerformedListeningShapeIsValid)) {
      issues.push({ code: "invalid_shape", path, message: "qa.listening_review has invalid or defaulted fields." });
    } else if (Array.isArray(listening.findings)) {
      for (const [index, finding] of listening.findings.entries()) {
        if (!isRecord(finding)) {
          issues.push({ code: "invalid_shape", path, message: `qa.listening_review.findings[${index}] must be an object.` });
          continue;
        }
        unknownFields(finding, QA_FINDING_FIELDS, `qa.listening_review.findings[${index}]`, path, issues);
        if (
          !nonEmptyString(finding.code) ||
          !SAFE_ID.test(finding.code) ||
          (finding.severity !== "note" && finding.severity !== "failure") ||
          !nonEmptyString(finding.description) ||
          (finding.chapter_id !== undefined && !nonEmptyString(finding.chapter_id)) ||
          (finding.entry_id !== undefined && !nonEmptyString(finding.entry_id)) ||
          (finding.rerender_input_sha256 !== undefined &&
            (!nonEmptyString(finding.rerender_input_sha256) || !SHA256.test(finding.rerender_input_sha256)))
        ) {
          issues.push({ code: "invalid_shape", path, message: `qa.listening_review.findings[${index}] has invalid fields.` });
        }
      }
    }
  }

  const productionAcceptance = raw.production_acceptance;
  if (!isRecord(productionAcceptance)) {
    issues.push({ code: "invalid_shape", path, message: "qa.production_acceptance must be an object." });
  } else {
    unknownFields(
      productionAcceptance,
      QA_PRODUCTION_ACCEPTANCE_FIELDS,
      "qa.production_acceptance",
      path,
      issues,
    );
    if (
      !exactFieldsPresent(productionAcceptance, QA_PRODUCTION_ACCEPTANCE_FIELDS) ||
      typeof productionAcceptance.passed !== "boolean" ||
      ![
        "complete-master-human-listening",
        "operator-authorized-mechanical-and-asr-waiver",
      ].includes(String(productionAcceptance.basis)) ||
      !nonEmptyString(productionAcceptance.authorized_by) ||
      !nonEmptyString(productionAcceptance.authorized_at) ||
      !DATE.test(productionAcceptance.authorized_at) ||
      !nonEmptyString(productionAcceptance.rationale) ||
      !nonEmptyString(productionAcceptance.handoff_evidence_sha256) ||
      !SHA256.test(productionAcceptance.handoff_evidence_sha256) ||
      !nonEmptyString(productionAcceptance.working_master_sha256) ||
      !SHA256.test(productionAcceptance.working_master_sha256) ||
      !exactStringArray(productionAcceptance.chapter_ids) ||
      !["accepted", "accepted-with-listening-waiver"].includes(String(productionAcceptance.disposition)) ||
      !Array.isArray(productionAcceptance.findings)
    ) {
      issues.push({ code: "invalid_shape", path, message: "qa.production_acceptance has invalid or defaulted fields." });
    } else {
      for (const [index, finding] of productionAcceptance.findings.entries()) {
        if (!isRecord(finding)) {
          issues.push({
            code: "invalid_shape",
            path,
            message: `qa.production_acceptance.findings[${index}] must be an object.`,
          });
          continue;
        }
        unknownFields(
          finding,
          QA_FINDING_FIELDS,
          `qa.production_acceptance.findings[${index}]`,
          path,
          issues,
        );
        if (
          !nonEmptyString(finding.code) ||
          !SAFE_ID.test(finding.code) ||
          (finding.severity !== "note" && finding.severity !== "failure") ||
          !nonEmptyString(finding.description) ||
          (finding.chapter_id !== undefined && !nonEmptyString(finding.chapter_id)) ||
          (finding.entry_id !== undefined && !nonEmptyString(finding.entry_id)) ||
          (finding.rerender_input_sha256 !== undefined &&
            (!nonEmptyString(finding.rerender_input_sha256) || !SHA256.test(finding.rerender_input_sha256)))
        ) {
          issues.push({
            code: "invalid_shape",
            path,
            message: `qa.production_acceptance.findings[${index}] has invalid fields.`,
          });
        }
      }
    }
  }

  if (!Array.isArray(raw.chapters) || raw.chapters.length === 0) {
    issues.push({ code: "invalid_shape", path, message: "qa.chapters must be a non-empty array." });
  } else {
    for (const [index, chapter] of raw.chapters.entries()) {
      if (!isRecord(chapter)) {
        issues.push({ code: "invalid_shape", path, message: `qa.chapters[${index}] must be an object.` });
        continue;
      }
      unknownFields(chapter, QA_CHAPTER_FIELDS, `qa.chapters[${index}]`, path, issues);
      if (
        !exactFieldsPresent(chapter, QA_CHAPTER_FIELDS) ||
        !nonEmptyString(chapter.chapter_id) ||
        !nonEmptyString(chapter.audio_path) ||
        !validRepoRelativePath(chapter.audio_path) ||
        !nonEmptyString(chapter.audio_sha256) ||
        !SHA256.test(chapter.audio_sha256) ||
        !positiveNumber(chapter.duration_seconds) ||
        !nonNegativeInteger(chapter.source_words_expected) ||
        !nonNegativeInteger(chapter.source_words_covered) ||
        !nonNegativeInteger(chapter.source_words_uncovered) ||
        !nonNegativeInteger(chapter.source_words_duplicated) ||
        !exactStringArray(chapter.commentary_ids_expected) ||
        !exactStringArray(chapter.commentary_ids_covered) ||
        !nonNegativeInteger(chapter.asr_expected_words) ||
        !nonNegativeInteger(chapter.asr_word_errors) ||
        !nonNegativeInteger(chapter.asr_ordinary_word_errors) ||
        typeof chapter.asr_word_error_rate !== "number" ||
        !Number.isFinite(chapter.asr_word_error_rate) ||
        chapter.asr_word_error_rate < 0 ||
        chapter.asr_word_error_rate > 1 ||
        !nonNegativeInteger(chapter.max_silence_ms) ||
        typeof chapter.integrated_lufs !== "number" ||
        !Number.isFinite(chapter.integrated_lufs) ||
        typeof chapter.true_peak_dbtp !== "number" ||
        !Number.isFinite(chapter.true_peak_dbtp) ||
        !nonNegativeInteger(chapter.clipped_samples) ||
        !exactStringArray(chapter.cast_character_ids) ||
        !exactStringArray(chapter.unresolved_character_ids) ||
        !exactStringArray(chapter.mismatched_character_ids) ||
        !["accepted", "rerender-required", "rejected", "not-performed"].includes(
          String(chapter.listening_disposition),
        ) ||
        [
          chapter.source_coverage_passed,
          chapter.commentary_coverage_passed,
          chapter.asr_passed,
          chapter.silence_passed,
          chapter.clipping_passed,
          chapter.loudness_passed,
          chapter.cast_consistency_passed,
          chapter.listening_passed,
        ].some((value) => typeof value !== "boolean")
      ) {
        issues.push({ code: "invalid_shape", path, message: `qa.chapters[${index}] has invalid or defaulted fields.` });
      }
    }
  }

  if (
    issues.some((issue) => ["malformed_json", "invalid_shape", "unknown_field"].includes(issue.code)) ||
    raw.schema_version !== 2 ||
    !nonEmptyString(raw.dialogue)
  ) {
    return { issues };
  }
  return { issues, value: raw as AudioQaReport };
}

function validateQaIntegrity(qa: AudioQaReport, path: string) {
  const issues = canonicalDialogueIssues(path, qa.dialogue, "qa");
  const chapterIds = qa.chapters.map((chapter) => chapter.chapter_id);
  if (new Set(chapterIds).size !== chapterIds.length) {
    issues.push({ code: "duplicate_id", path, message: "qa.chapters contains duplicate chapter_id values." });
  }
  if (new Set(qa.chapters.map((chapter) => chapter.audio_path)).size !== qa.chapters.length) {
    issues.push({ code: "duplicate_id", path, message: "qa.chapters must name a distinct audio_path for each chapter." });
  }

  const source = qa.source_coverage;
  const sourcePass =
    source.expected_words === source.covered_words &&
    source.uncovered_words === 0 &&
    source.duplicated_words === 0 &&
    source.repairs_verified;
  if (source.passed !== sourcePass) {
    issues.push({
      code: "source_coverage_failure",
      path,
      message: `qa.source_coverage.passed must equal the exact-coverage result (${sourcePass}).`,
    });
  }

  const commentary = qa.commentary_coverage;
  const expectedIds = sortedUnique(commentary.expected_ids);
  const coveredIds = sortedUnique(commentary.covered_ids);
  const commentaryPass =
    sameArray(commentary.expected_ids, expectedIds) &&
    sameArray(commentary.covered_ids, coveredIds) &&
    sameArray(expectedIds, coveredIds) &&
    commentary.missing_ids.length === 0 &&
    commentary.duplicate_ids.length === 0;
  if (commentary.passed !== commentaryPass) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: `qa.commentary_coverage.passed must equal the exact ID-coverage result (${commentaryPass}).`,
    });
  }

  const asr = qa.asr;
  const computedWer = asr.expected_words === 0 ? (asr.word_errors === 0 ? 0 : 1) : asr.word_errors / asr.expected_words;
  if (Math.abs(asr.word_error_rate - computedWer) > 1e-9) {
    issues.push({
      code: "invalid_metric",
      path,
      message: `qa.asr.word_error_rate must equal word_errors / expected_words (${computedWer}).`,
    });
  }
  const exceptionErrors = asr.exceptions.reduce((sum, exception) => sum + exception.occurrences, 0);
  const ordinaryErrors = asr.exceptions
    .filter((exception) => exception.classification === "ordinary")
    .reduce((sum, exception) => sum + exception.occurrences, 0);
  if (exceptionErrors !== asr.word_errors || ordinaryErrors !== asr.ordinary_word_errors) {
    issues.push({
      code: "invalid_metric",
      path,
      message: "qa.asr exceptions must enumerate every word error and every ordinary-word error exactly.",
    });
  }
  const thresholdIsProductionSafe = asr.max_word_error_rate <= 0.02 && asr.max_ordinary_word_errors === 0;
  const asrPass =
    thresholdIsProductionSafe &&
    asr.word_error_rate <= asr.max_word_error_rate &&
    asr.ordinary_word_errors <= asr.max_ordinary_word_errors &&
    asr.exceptions.every((exception) => exception.reviewed);
  if (!thresholdIsProductionSafe) {
    issues.push({
      code: "invalid_metric",
      path,
      message: "qa.asr v2 threshold must permit at most 2% WER and zero ordinary-word errors.",
    });
  }
  if (asr.passed !== asrPass) {
    issues.push({
      code: "invalid_metric",
      path,
      message: `qa.asr.passed must equal the pinned threshold result (${asrPass}); v2 permits at most 2% WER and zero ordinary-word errors.`,
    });
  }

  const audio = qa.audio;
  const loudnessPass =
    audio.target_lufs === -19 &&
    audio.tolerance_lu > 0 &&
    audio.tolerance_lu <= 1 &&
    Math.abs(audio.integrated_lufs - audio.target_lufs) <= audio.tolerance_lu &&
    audio.true_peak_dbtp <= -1;
  const clippingPass = audio.clipped_samples === 0;
  const silencePass =
    audio.silence.max_allowed_ms <= 800 &&
    audio.silence.max_observed_ms <= audio.silence.max_allowed_ms &&
    audio.silence.unexpected_segments.length === 0;
  if (
    audio.mime_type !== "audio/wav" ||
    !audio.master_path.endsWith(".wav") ||
    audio.sample_rate_hz !== 48_000 ||
    audio.channels !== 1 ||
    audio.sample_format !== "PCM_24" ||
    qa.chapters.some((chapter) => !chapter.audio_path.endsWith(".wav"))
  ) {
    issues.push({
      code: "invalid_metric",
      path,
      message: "QA master and chapters must be WAV paths describing production mono 48 kHz PCM_24 lossless audio.",
    });
  }
  if (audio.silence.max_allowed_ms > 1200) {
    issues.push({
      code: "invalid_metric",
      path,
      message: "qa.audio.silence.max_allowed_ms cannot exceed the 1200 ms internal-prosody ceiling.",
    });
  }

  const cast = qa.cast_consistency;
  const castIdsSorted = [
    cast.script_character_ids,
    cast.selected_character_ids,
    cast.unresolved_character_ids,
    cast.mismatched_character_ids,
    cast.recurring_voice_change_character_ids,
  ].every((ids) => sameArray(ids, sortedUnique(ids)));
  const castPass =
    castIdsSorted &&
    sameArray(cast.script_character_ids, cast.selected_character_ids) &&
    cast.unresolved_character_ids.length === 0 &&
    cast.mismatched_character_ids.length === 0 &&
    cast.recurring_voice_change_character_ids.length === 0;
  if (cast.passed !== castPass) {
    issues.push({
      code: "cast_resolution_failure",
      path,
      message: `qa.cast_consistency.passed must equal the explicit selected-and-stable cast result (${castPass}).`,
    });
  }

  const listening = qa.listening_review;
  const listeningPass =
    listening.status === "performed" &&
    nonEmptyString(listening.reviewer) &&
    nonEmptyString(listening.reviewed_at) &&
    listening.scope === "complete-master" &&
    listening.disposition === "accepted" &&
    listening.findings.every((finding) => finding.severity !== "failure") &&
    sameArray(listening.chapter_ids, chapterIds);
  if (listening.passed !== listeningPass) {
    issues.push({
      code: "acceptance_gate_failure",
      path,
      message: `qa.listening_review.passed must equal the complete-master listening result (${listeningPass}).`,
    });
  }

  const productionAcceptance = qa.production_acceptance;
  const factualNotPerformedListening =
    listening.status === "not-performed" &&
    listening.passed === false &&
    listening.reviewer === null &&
    listening.reviewed_at === null &&
    listening.scope === "none" &&
    listening.chapter_ids.length === 0 &&
    listening.disposition === "not-performed" &&
    listening.findings.length === 0;
  const actualListeningAcceptance =
    productionAcceptance.basis === "complete-master-human-listening" &&
    productionAcceptance.disposition === "accepted" &&
    listeningPass;
  const operatorWaiverAcceptance =
    productionAcceptance.basis === "operator-authorized-mechanical-and-asr-waiver" &&
    productionAcceptance.disposition === "accepted-with-listening-waiver" &&
    factualNotPerformedListening;
  const productionAcceptancePass =
    productionAcceptance.working_master_sha256 === audio.master_sha256 &&
    sameArray(productionAcceptance.chapter_ids, chapterIds) &&
    productionAcceptance.findings.every((finding) => finding.severity !== "failure") &&
    (actualListeningAcceptance || operatorWaiverAcceptance);
  if (productionAcceptance.passed !== productionAcceptancePass) {
    issues.push({
      code: "acceptance_gate_failure",
      path,
      message: `qa.production_acceptance.passed must equal the explicit production-acceptance result (${productionAcceptancePass}).`,
    });
  }
  const waiverPass = productionAcceptancePass && operatorWaiverAcceptance;

  for (const [index, chapter] of qa.chapters.entries()) {
    const chapterSourcePass =
      chapter.source_words_expected === chapter.source_words_covered &&
      chapter.source_words_uncovered === 0 &&
      chapter.source_words_duplicated === 0;
    const chapterExpectedCommentary = sortedUnique(chapter.commentary_ids_expected);
    const chapterCoveredCommentary = sortedUnique(chapter.commentary_ids_covered);
    const chapterCommentaryPass =
      sameArray(chapter.commentary_ids_expected, chapterExpectedCommentary) &&
      sameArray(chapter.commentary_ids_covered, chapterCoveredCommentary) &&
      sameArray(chapterExpectedCommentary, chapterCoveredCommentary);
    const chapterWer =
      chapter.asr_expected_words === 0
        ? chapter.asr_word_errors === 0
          ? 0
          : 1
        : chapter.asr_word_errors / chapter.asr_expected_words;
    const chapterAsrPass =
      Math.abs(chapter.asr_word_error_rate - chapterWer) <= 1e-9 &&
      chapter.asr_word_error_rate <= asr.max_word_error_rate &&
      chapter.asr_ordinary_word_errors <= asr.max_ordinary_word_errors;
    const chapterSilencePass = chapter.max_silence_ms <= audio.silence.max_allowed_ms;
    const chapterClippingPass = chapter.clipped_samples === 0;
    const chapterLoudnessPass =
      Math.abs(chapter.integrated_lufs - audio.target_lufs) <= audio.tolerance_lu && chapter.true_peak_dbtp <= -1;
    const chapterCastPass =
      sameArray(chapter.cast_character_ids, sortedUnique(chapter.cast_character_ids)) &&
      chapter.unresolved_character_ids.length === 0 &&
      chapter.mismatched_character_ids.length === 0;
    const chapterListeningPass = chapter.listening_disposition === "accepted";
    const expectedListeningDisposition = waiverPass ? "not-performed" : "accepted";
    const expectedListeningPass = !waiverPass;
    if (
      productionAcceptancePass &&
      (chapter.listening_disposition !== expectedListeningDisposition || chapter.listening_passed !== expectedListeningPass)
    ) {
      issues.push({
        code: "acceptance_gate_failure",
        path,
        message: `qa.chapters[${index}] must preserve the factual listening state for the selected production-acceptance basis.`,
      });
    }
    const reported = [
      chapter.source_coverage_passed,
      chapter.commentary_coverage_passed,
      chapter.asr_passed,
      chapter.silence_passed,
      chapter.clipping_passed,
      chapter.loudness_passed,
      chapter.cast_consistency_passed,
      chapter.listening_passed,
    ];
    const computed = [
      chapterSourcePass,
      chapterCommentaryPass,
      chapterAsrPass,
      chapterSilencePass,
      chapterClippingPass,
      chapterLoudnessPass,
      chapterCastPass,
      chapterListeningPass,
    ];
    if (reported.some((value, gateIndex) => value !== computed[gateIndex])) {
      issues.push({
        code: "invalid_metric",
        path,
        message: `qa.chapters[${index}] pass flags must equal its measured source, commentary, ASR, silence, clipping, loudness, cast, and listening results.`,
      });
    }
  }

  const chapterSourceExpected = qa.chapters.reduce((sum, chapter) => sum + chapter.source_words_expected, 0);
  const chapterSourceCovered = qa.chapters.reduce((sum, chapter) => sum + chapter.source_words_covered, 0);
  const chapterCommentaryExpected = sortedUnique(qa.chapters.flatMap((chapter) => chapter.commentary_ids_expected));
  const chapterCommentaryCovered = sortedUnique(qa.chapters.flatMap((chapter) => chapter.commentary_ids_covered));
  const chapterAsrExpected = qa.chapters.reduce((sum, chapter) => sum + chapter.asr_expected_words, 0);
  const chapterAsrErrors = qa.chapters.reduce((sum, chapter) => sum + chapter.asr_word_errors, 0);
  const chapterOrdinaryErrors = qa.chapters.reduce((sum, chapter) => sum + chapter.asr_ordinary_word_errors, 0);
  const chapterCastIds = sortedUnique(qa.chapters.flatMap((chapter) => chapter.cast_character_ids));
  if (
    chapterSourceExpected !== source.expected_words ||
    chapterSourceCovered !== source.covered_words ||
    !sameArray(chapterCommentaryExpected, commentary.expected_ids) ||
    !sameArray(chapterCommentaryCovered, commentary.covered_ids) ||
    chapterAsrExpected !== asr.expected_words ||
    chapterAsrErrors !== asr.word_errors ||
    chapterOrdinaryErrors !== asr.ordinary_word_errors ||
    !sameArray(chapterCastIds, cast.script_character_ids)
  ) {
    issues.push({
      code: "invalid_metric",
      path,
      message: "Per-chapter QA measurements must aggregate exactly to complete-master source, commentary, ASR, and cast results.",
    });
  }

  const chapterPass = qa.chapters.every(
    (chapter) =>
      chapter.source_coverage_passed &&
      chapter.commentary_coverage_passed &&
      chapter.asr_passed &&
      chapter.silence_passed &&
      chapter.clipping_passed &&
      chapter.loudness_passed &&
      chapter.cast_consistency_passed &&
      (chapter.listening_passed || (waiverPass && chapter.listening_disposition === "not-performed")),
  );
  const accepted =
    sourcePass &&
    commentaryPass &&
    asrPass &&
    loudnessPass &&
    clippingPass &&
    silencePass &&
    castPass &&
    productionAcceptancePass &&
    chapterPass;
  if (qa.status === "accepted" && !accepted) {
    issues.push({
      code: "acceptance_gate_failure",
      path,
      message:
        "Accepted QA requires every source, commentary, ASR, silence, clipping, loudness, cast, and chapter gate plus explicit production acceptance; listening may only be absent under the operator-authorized waiver basis.",
    });
  }
  return issues;
}

function validateLocalAudioHash(relativePath: string, expected: string, path: string, location: string) {
  const issues: AudioProductionValidationIssue[] = [];
  const absolutePath = join(getRepoRoot(), relativePath);
  if (!existsSync(absolutePath)) return issues;
  if (!statSync(absolutePath).isFile()) {
    issues.push({ code: "invalid_reference", path, message: `${location} does not name a local file.` });
    return issues;
  }
  const actual = sha256(readFileSync(absolutePath));
  if (actual !== expected) {
    issues.push({
      code: "hash_mismatch",
      path,
      message: `${location} hash mismatch for \`${relativePath}\`: expected ${expected}, got ${actual}.`,
    });
  }
  return issues;
}

function validateQaAgainstRepo(qa: AudioQaReport, path: string) {
  const root = getRepoRoot();
  const issues: AudioProductionValidationIssue[] = [];
  const scriptPath = `audio/scripts/${qa.dialogue}.json`;
  const castPath = "audio/cast.json";
  const absoluteScriptPath = join(root, scriptPath);
  const absoluteCastPath = join(root, castPath);
  if (!existsSync(absoluteScriptPath) || !existsSync(absoluteCastPath)) {
    issues.push({
      code: "missing_dependency",
      path,
      message: `Present QA requires \`${scriptPath}\` and \`${castPath}\`.`,
    });
    return issues;
  }
  const scriptContent = readFileSync(absoluteScriptPath, "utf8");
  const castContent = readFileSync(absoluteCastPath, "utf8");
  const scriptIssues = validateAudioScriptArtifact(scriptPath, scriptContent);
  let script: AudioScript | undefined;
  try {
    script = parseAudioScript(scriptPath, scriptContent);
  } catch {
    // The precise screenplay issues are reported by the screenplay validator.
  }
  if (!script || scriptIssues.length > 0) {
    issues.push({
      code: "missing_dependency",
      path,
      message: `QA references a screenplay with ${scriptIssues.length} validation issue(s); fix ${scriptPath} first.`,
    });
    return issues;
  }

  const expectedScriptHash = sha256(scriptContent);
  const expectedCastHash = sha256(castContent);
  if (qa.script_sha256 !== expectedScriptHash) {
    issues.push({
      code: "hash_mismatch",
      path,
      message: `qa.script_sha256 does not match ${scriptPath} (expected ${expectedScriptHash}).`,
    });
  }
  if (qa.cast_sha256 !== expectedCastHash || qa.cast_sha256 !== script.cast_sha256) {
    issues.push({
      code: "hash_mismatch",
      path,
      message: `qa.cast_sha256 must match both ${castPath} and the screenplay cast hash (${expectedCastHash}).`,
    });
  }

  const scriptChapterIds = script.chapters.map((chapter) => chapter.id);
  const qaChapterIds = qa.chapters.map((chapter) => chapter.chapter_id);
  if (!sameArray(qaChapterIds, scriptChapterIds)) {
    issues.push({
      code: "invalid_reference",
      path,
      message: "qa.chapters must cover screenplay chapters exactly once and in screenplay order.",
    });
  }
  if (
    (qa.listening_review.status === "performed" &&
      !sameArray(qa.listening_review.chapter_ids, scriptChapterIds)) ||
    (qa.listening_review.status === "not-performed" && qa.listening_review.chapter_ids.length !== 0)
  ) {
    issues.push({
      code: "invalid_reference",
      path,
      message:
        "qa.listening_review.chapter_ids must cover every screenplay chapter in order when performed, or be empty when not performed.",
    });
  }
  if (!sameArray(qa.production_acceptance.chapter_ids, scriptChapterIds)) {
    issues.push({
      code: "invalid_reference",
      path,
      message: "qa.production_acceptance.chapter_ids must cover every screenplay chapter in order.",
    });
  }
  for (const [index, chapter] of qa.chapters.entries()) {
    const entries = script.entries.filter((entry) => entry.chapter_id === chapter.chapter_id);
    const sourceWords = entries
      .filter((entry) => entry.kind === "source")
      .reduce((sum, entry) => sum + audioWordCount(entry.text), 0);
    const commentaryIds = sortedUnique(
      entries
        .filter((entry) => entry.kind === "commentary")
        .map((entry) => (entry.anchor as { commentary_id: string }).commentary_id),
    );
    const spokenWords = entries.reduce((sum, entry) => sum + audioWordCount(entry.text), 0);
    const characterIds = sortedUnique(entries.map((entry) => entry.character_id));
    if (
      chapter.source_words_expected !== sourceWords ||
      chapter.source_words_covered !== sourceWords ||
      !sameArray(chapter.commentary_ids_expected, commentaryIds) ||
      !sameArray(chapter.commentary_ids_covered, commentaryIds) ||
      chapter.asr_expected_words !== spokenWords ||
      !sameArray(chapter.cast_character_ids, characterIds)
    ) {
      issues.push({
        code: "invalid_metric",
        path,
        message: `qa.chapters[${index}] measurements must match screenplay chapter \`${chapter.chapter_id}\` source words, commentary IDs, spoken words, and cast.`,
      });
    }
  }

  const scriptCharacterIds = sortedUnique(script.entries.map((entry) => entry.character_id));
  const selectedCastIds = new Set<string>();
  try {
    const charactersContent = readFileSync(join(root, "audio/characters.json"), "utf8");
    const characters = parseCharacterCatalog("audio/characters.json", charactersContent);
    const cast = parseCastCatalog(castPath, castContent, characters);
    for (const voice of cast.voices) selectedCastIds.add(voice.characterId);
  } catch {
    // Screenplay dependency validation already reports invalid canonical catalogs.
  }
  const selectedScriptIds = scriptCharacterIds.filter((id) => selectedCastIds.has(id));
  if (
    !sameArray(qa.cast_consistency.script_character_ids, scriptCharacterIds) ||
    !sameArray(qa.cast_consistency.selected_character_ids, selectedScriptIds)
  ) {
    issues.push({
      code: "cast_resolution_failure",
      path,
      message: "qa.cast_consistency character IDs must exactly match screenplay use and explicit selected cast entries.",
    });
  }

  const commentaryIds = sortedUnique(
    script.entries
      .filter((entry) => entry.kind === "commentary")
      .map((entry) => (entry.anchor as { commentary_id: string }).commentary_id),
  );
  if (
    !sameArray(qa.commentary_coverage.expected_ids, commentaryIds) ||
    !sameArray(qa.commentary_coverage.covered_ids, commentaryIds)
  ) {
    issues.push({
      code: "commentary_coverage_failure",
      path,
      message: "qa.commentary_coverage expected and covered IDs must exactly match screenplay commentary entries.",
    });
  }
  if (
    qa.source_coverage.expected_words !== script.coverage.source_words ||
    qa.source_coverage.covered_words !== script.coverage.source_words_covered
  ) {
    issues.push({
      code: "source_coverage_failure",
      path,
      message: "qa.source_coverage word totals must exactly match screenplay deterministic coverage.",
    });
  }
  const expectedAsrWords = script.entries.reduce((sum, entry) => sum + audioWordCount(entry.text), 0);
  if (qa.asr.expected_words !== expectedAsrWords) {
    issues.push({
      code: "invalid_metric",
      path,
      message: `qa.asr.expected_words must equal all ${expectedAsrWords} spoken screenplay words.`,
    });
  }

  const knownChapterIds = new Set(scriptChapterIds);
  const entryIds = new Set(script.entries.map((entry) => entry.id));
  for (const segment of qa.audio.silence.unexpected_segments) {
    if (!knownChapterIds.has(segment.chapter_id)) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Silence segment refers to unknown chapter \`${segment.chapter_id}\`.`,
      });
    }
  }
  for (const finding of qa.listening_review.findings) {
    if (finding.chapter_id && !knownChapterIds.has(finding.chapter_id)) {
      issues.push({ code: "invalid_reference", path, message: `Listening finding refers to unknown chapter \`${finding.chapter_id}\`.` });
    }
    if (finding.entry_id && !entryIds.has(finding.entry_id)) {
      issues.push({ code: "invalid_reference", path, message: `Listening finding refers to unknown entry \`${finding.entry_id}\`.` });
    }
  }
  for (const finding of qa.production_acceptance.findings) {
    if (finding.chapter_id && !knownChapterIds.has(finding.chapter_id)) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Production-acceptance finding refers to unknown chapter \`${finding.chapter_id}\`.`,
      });
    }
    if (finding.entry_id && !entryIds.has(finding.entry_id)) {
      issues.push({
        code: "invalid_reference",
        path,
        message: `Production-acceptance finding refers to unknown entry \`${finding.entry_id}\`.`,
      });
    }
  }

  issues.push(...validateLocalAudioHash(qa.audio.master_path, qa.audio.master_sha256, path, "qa.audio.master_path"));
  for (const [index, chapter] of qa.chapters.entries()) {
    issues.push(
      ...validateLocalAudioHash(chapter.audio_path, chapter.audio_sha256, path, `qa.chapters[${index}].audio_path`),
    );
  }
  const chapterDuration = qa.chapters.reduce((sum, chapter) => sum + chapter.duration_seconds, 0);
  if (chapterDuration > qa.audio.duration_seconds + 0.001) {
    issues.push({
      code: "invalid_metric",
      path,
      message: "Sum of chapter durations cannot exceed complete-master duration.",
    });
  }
  return issues;
}

export function validateAudioQa(path: string, content: string) {
  const inspected = inspectQa(path, content);
  return inspected.value ? [...inspected.issues, ...validateQaIntegrity(inspected.value, path)] : inspected.issues;
}

export function validateAudioQaArtifact(path: string, content: string) {
  const inspected = inspectQa(path, content);
  if (!inspected.value) return inspected.issues;
  return [
    ...inspected.issues,
    ...validateQaIntegrity(inspected.value, path),
    ...validateQaAgainstRepo(inspected.value, path),
  ];
}

export function parseAudioQa(path: string, content: string) {
  const inspected = inspectQa(path, content);
  const issues = inspected.value ? [...inspected.issues, ...validateQaIntegrity(inspected.value, path)] : inspected.issues;
  if (!inspected.value || issues.length > 0) throw new Error(formatAudioProductionIssues(issues));
  return inspected.value;
}

function listJsonArtifacts(directory: "scripts" | "qa") {
  const absoluteDirectory = join(getRepoRoot(), `audio/${directory}`);
  if (!existsSync(absoluteDirectory)) return [];
  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => `audio/${directory}/${entry.name}`)
    .sort();
}

export function listAudioScriptPaths() {
  return listJsonArtifacts("scripts");
}

export function listAudioQaPaths() {
  return listJsonArtifacts("qa");
}

export function validateAudioProductionArtifacts() {
  const root = getRepoRoot();
  const issues: AudioProductionValidationIssue[] = [];
  for (const path of listAudioScriptPaths()) {
    issues.push(...validateAudioScriptArtifact(path, readFileSync(join(root, path), "utf8")));
  }
  for (const path of listAudioQaPaths()) {
    issues.push(...validateAudioQaArtifact(path, readFileSync(join(root, path), "utf8")));
  }
  return issues;
}

export function formatAudioProductionIssues(issues: AudioProductionValidationIssue[]) {
  return issues.map((issue) => `${issue.path}: [${issue.code}] ${issue.message}`).join("\n");
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  formatAudioProductionIssues,
  parseAudioQa,
  parseAudioScript,
  validateAudioQaArtifact,
  validateAudioScriptArtifact,
} from "../audio-production.js";
import { getRepoRoot, normalizeRepoPath } from "../paths.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { fieldValue } from "./observation-ledger.js";

export type RecordingStatus = "draft" | "accepted" | "withdrawn";

export type RecordingAudio = {
  path: string;
  mime_type: string;
  duration_seconds: number;
  sha256: string;
};

export type RecordingProduction = {
  screenplay_sha256: string;
  qa_sha256: string;
  mastering_plan_path: string;
  mastering_plan_artifact_sha256: string;
  mastering_plan_sha256: string;
  mastering_result_path: string;
  mastering_result_sha256: string;
  mechanical_qa_path: string;
  mechanical_qa_sha256: string;
  working_master_path: string;
  working_master_sha256: string;
  publication_path: string;
  publication_sha256: string;
};

export type RecordingChapter = {
  chapter_id: string;
  commentary_id: string;
  start_frame: number;
  title?: string;
};

export type RecordingCastDisplay = {
  character_id: string;
  name: string;
  voice: string;
};

export type RecordingProvenanceDisplay = {
  label: string;
  value: string;
  url?: string;
};

export type RecordingManifest = {
  schema_version: 2;
  recording_id: string;
  dialogue: string;
  status: RecordingStatus;
  production?: RecordingProduction;
  audio: RecordingAudio;
  chapters: RecordingChapter[];
  cast?: RecordingCastDisplay[];
  provenance?: RecordingProvenanceDisplay[];
};

export type RecordingManifestValidationIssue = {
  code:
    | "malformed_json"
    | "invalid_manifest_path"
    | "invalid_manifest_shape"
    | "invalid_schema_version"
    | "unknown_field"
    | "dialogue_mismatch"
    | "invalid_recording_id"
    | "invalid_status"
    | "missing_production_dependency"
    | "invalid_production_dependency"
    | "production_hash_mismatch"
    | "production_status_mismatch"
    | "production_chapter_mismatch"
    | "production_duration_mismatch"
    | "invalid_audio_path"
    | "invalid_audio_mime"
    | "invalid_audio_duration"
    | "invalid_audio_sha256"
    | "invalid_chapter"
    | "duplicate_chapter_target"
    | "first_chapter_not_zero"
    | "non_monotonic_chapters"
    | "missing_section_target"
    | "duplicate_recording_id";
  path: string;
  message: string;
};

type ParsedManifest = {
  manifest?: RecordingManifest;
  issues: RecordingManifestValidationIssue[];
};

const TOP_LEVEL_FIELDS = new Set([
  "schema_version",
  "recording_id",
  "dialogue",
  "status",
  "production",
  "audio",
  "chapters",
  "cast",
  "provenance",
]);
const AUDIO_FIELDS = new Set(["path", "mime_type", "duration_seconds", "sha256"]);
const PRODUCTION_PATH_FIELDS = [
  "mastering_plan_path",
  "mastering_result_path",
  "mechanical_qa_path",
  "working_master_path",
  "publication_path",
] as const;
const PRODUCTION_HASH_FIELDS = [
  "screenplay_sha256",
  "qa_sha256",
  "mastering_plan_artifact_sha256",
  "mastering_plan_sha256",
  "mastering_result_sha256",
  "mechanical_qa_sha256",
  "working_master_sha256",
  "publication_sha256",
] as const;
const PRODUCTION_FIELDS = new Set([...PRODUCTION_PATH_FIELDS, ...PRODUCTION_HASH_FIELDS]);
const CHAPTER_FIELDS = new Set(["chapter_id", "commentary_id", "start_frame", "title"]);
const CAST_FIELDS = new Set(["character_id", "name", "voice"]);
const PROVENANCE_FIELDS = new Set(["label", "value", "url"]);
const RECORDING_STATUSES = new Set<RecordingStatus>(["draft", "accepted", "withdrawn"]);
const SHA256 = /^[a-f0-9]{64}$/u;
const SAMPLE_RATE = 48_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function unknownFields(
  value: Record<string, unknown>,
  allowed: Set<string>,
  location: string,
  path: string,
  issues: RecordingManifestValidationIssue[],
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      issues.push({
        code: "unknown_field",
        path,
        message: `${location} contains unknown field \`${key}\`.`,
      });
    }
  }
}

function parseDisplayRows<T>(
  value: unknown,
  field: "cast" | "provenance",
  allowed: Set<string>,
  required: string[],
  path: string,
  issues: RecordingManifestValidationIssue[],
) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    issues.push({
      code: "invalid_manifest_shape",
      path,
      message: `\`${field}\` must be an array when present.`,
    });
    return undefined;
  }

  const rows: Record<string, string>[] = [];
  for (const [index, row] of value.entries()) {
    if (!isRecord(row)) {
      issues.push({
        code: "invalid_manifest_shape",
        path,
        message: `\`${field}[${index}]\` must be an object.`,
      });
      continue;
    }
    unknownFields(row, allowed, `${field}[${index}]`, path, issues);
    if (required.some((key) => !nonEmptyString(row[key]))) {
      issues.push({
        code: "invalid_manifest_shape",
        path,
        message: `\`${field}[${index}]\` must contain non-empty ${required.join(", ")}.`,
      });
      continue;
    }
    const parsed = Object.fromEntries(
      Object.entries(row).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
    rows.push(parsed);
  }
  return rows as T[];
}

function inspectRecordingManifest(path: string, content: string): ParsedManifest {
  const issues: RecordingManifestValidationIssue[] = [];
  let value: unknown;
  try {
    value = JSON.parse(content) as unknown;
  } catch (error) {
    issues.push({
      code: "malformed_json",
      path,
      message: `Malformed JSON: ${error instanceof Error ? error.message : String(error)}`,
    });
    return { issues };
  }

  if (!isRecord(value)) {
    issues.push({
      code: "invalid_manifest_shape",
      path,
      message: "Recording manifest must be a JSON object.",
    });
    return { issues };
  }

  unknownFields(value, TOP_LEVEL_FIELDS, "manifest", path, issues);
  const recordingId = value.recording_id;
  const dialogue = value.dialogue;
  const status = value.status;
  const schemaVersion = value.schema_version;
  const productionValue = value.production;
  const audioValue = value.audio;
  const chaptersValue = value.chapters;

  if (
    typeof schemaVersion !== "number" ||
    !nonEmptyString(recordingId) ||
    !nonEmptyString(dialogue) ||
    !nonEmptyString(status)
  ) {
    issues.push({
      code: "invalid_manifest_shape",
      path,
      message: "Recording manifest requires numeric schema_version and non-empty recording_id, dialogue, and status fields.",
    });
  }
  if (!isRecord(audioValue)) {
    issues.push({
      code: "invalid_manifest_shape",
      path,
      message: "Recording manifest requires an audio object.",
    });
  }
  if (productionValue !== undefined && !isRecord(productionValue)) {
    issues.push({
      code: "invalid_manifest_shape",
      path,
      message: "Recording manifest production must be an object when present.",
    });
  }
  if (!Array.isArray(chaptersValue) || chaptersValue.length === 0) {
    issues.push({
      code: "invalid_manifest_shape",
      path,
      message: "Recording manifest requires at least one chapter.",
    });
  }

  let audio: RecordingAudio | undefined;
  if (isRecord(audioValue)) {
    unknownFields(audioValue, AUDIO_FIELDS, "audio", path, issues);
    if (
      nonEmptyString(audioValue.path) &&
      nonEmptyString(audioValue.mime_type) &&
      typeof audioValue.duration_seconds === "number" &&
      nonEmptyString(audioValue.sha256)
    ) {
      audio = {
        path: audioValue.path,
        mime_type: audioValue.mime_type,
        duration_seconds: audioValue.duration_seconds,
        sha256: audioValue.sha256,
      };
    } else {
      issues.push({
        code: "invalid_manifest_shape",
        path,
        message: "Audio requires non-empty path, mime_type, sha256, and numeric duration_seconds fields.",
      });
    }
  }

  let production: RecordingProduction | undefined;
  if (isRecord(productionValue)) {
    unknownFields(productionValue, PRODUCTION_FIELDS, "production", path, issues);
    if (
      Object.keys(productionValue).length === PRODUCTION_FIELDS.size &&
      PRODUCTION_HASH_FIELDS.every(
        (field) => nonEmptyString(productionValue[field]) && SHA256.test(productionValue[field] as string),
      ) &&
      PRODUCTION_PATH_FIELDS.every((field) => nonEmptyString(productionValue[field]))
    ) {
      production = productionValue as RecordingProduction;
    } else {
      issues.push({
        code: "invalid_manifest_shape",
        path,
        message:
          "Production requires the exact mastering-v6 plan, result, mechanical-QA, working-master, and publication path/hash binding.",
      });
    }
  }

  const chapters: RecordingChapter[] = [];
  if (Array.isArray(chaptersValue)) {
    for (const [index, chapterValue] of chaptersValue.entries()) {
      if (!isRecord(chapterValue)) {
        issues.push({
          code: "invalid_chapter",
          path,
          message: `Chapter ${index + 1} must be an object.`,
        });
        continue;
      }
      unknownFields(chapterValue, CHAPTER_FIELDS, `chapters[${index}]`, path, issues);
      if (
        !nonEmptyString(chapterValue.chapter_id) ||
        !nonEmptyString(chapterValue.commentary_id) ||
        typeof chapterValue.start_frame !== "number" ||
        (chapterValue.title !== undefined && !nonEmptyString(chapterValue.title))
      ) {
        issues.push({
          code: "invalid_chapter",
          path,
          message: `Chapter ${index + 1} requires a chapter_id, commentary_id, numeric start_frame, and optional non-empty title.`,
        });
        continue;
      }
      chapters.push({
        chapter_id: chapterValue.chapter_id,
        commentary_id: chapterValue.commentary_id,
        start_frame: chapterValue.start_frame,
        ...(chapterValue.title === undefined ? {} : { title: chapterValue.title }),
      });
    }
  }

  const cast = parseDisplayRows<RecordingCastDisplay>(
    value.cast,
    "cast",
    CAST_FIELDS,
    ["character_id", "name", "voice"],
    path,
    issues,
  );
  const provenance = parseDisplayRows<RecordingProvenanceDisplay>(
    value.provenance,
    "provenance",
    PROVENANCE_FIELDS,
    ["label", "value"],
    path,
    issues,
  );

  if (
    issues.some((issue) =>
      ["malformed_json", "invalid_manifest_shape", "invalid_chapter", "unknown_field"].includes(issue.code),
    ) ||
    !nonEmptyString(recordingId) ||
    !nonEmptyString(dialogue) ||
    !nonEmptyString(status) ||
    typeof schemaVersion !== "number" ||
    !audio ||
    chapters.length === 0
  ) {
    return { issues };
  }

  return {
    issues,
    manifest: {
      schema_version: schemaVersion as 2,
      recording_id: recordingId,
      dialogue,
      status: status as RecordingStatus,
      ...(production === undefined ? {} : { production }),
      audio,
      chapters,
      ...(cast === undefined ? {} : { cast }),
      ...(provenance === undefined ? {} : { provenance }),
    },
  };
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function isCanonicalArtifactPath(value: string) {
  try {
    if (value.includes("\\")) return false;
    return normalizeRepoPath(value).relativePath === value;
  } catch {
    return false;
  }
}

function validateAcceptedProduction(manifest: RecordingManifest, path: string) {
  const issues: RecordingManifestValidationIssue[] = [];
  if (manifest.status !== "accepted") return issues;
  if (!manifest.production) {
    issues.push({
      code: "missing_production_dependency",
      path,
      message: "Accepted recording requires the exact screenplay, QA, mastering-v6 evidence, working master, and publication binding.",
    });
    return issues;
  }
  const production = manifest.production;

  const root = getRepoRoot();
  const screenplayPath = `audio/scripts/${manifest.dialogue}.json`;
  const qaPath = `audio/qa/${manifest.dialogue}.json`;
  const absoluteScreenplayPath = join(root, screenplayPath);
  const absoluteQaPath = join(root, qaPath);
  const missing = [
    ...(existsSync(absoluteScreenplayPath) ? [] : [screenplayPath]),
    ...(existsSync(absoluteQaPath) ? [] : [qaPath]),
  ];
  if (missing.length > 0) {
    issues.push({
      code: "missing_production_dependency",
      path,
      message: `Accepted recording requires ${missing.join(" and ")}.`,
    });
    return issues;
  }

  const screenplayContent = readFileSync(absoluteScreenplayPath, "utf8");
  const qaContent = readFileSync(absoluteQaPath, "utf8");
  const screenplayIssues = validateAudioScriptArtifact(screenplayPath, screenplayContent);
  const qaIssues = validateAudioQaArtifact(qaPath, qaContent);
  if (screenplayIssues.length > 0 || qaIssues.length > 0) {
    issues.push({
      code: "invalid_production_dependency",
      path,
      message: `Accepted recording requires valid screenplay and QA artifacts.\n${formatAudioProductionIssues([
        ...screenplayIssues,
        ...qaIssues,
      ])}`,
    });
    return issues;
  }

  const screenplayDigest = sha256(screenplayContent);
  const qaDigest = sha256(qaContent);
  const screenplay = parseAudioScript(screenplayPath, screenplayContent);
  const qa = parseAudioQa(qaPath, qaContent);
  if (
    production.screenplay_sha256 !== screenplayDigest ||
    production.qa_sha256 !== qaDigest ||
    production.working_master_path !== qa.audio.master_path ||
    production.working_master_sha256 !== qa.audio.master_sha256 ||
    production.publication_path !== manifest.audio.path ||
    production.publication_sha256 !== manifest.audio.sha256 ||
    qa.script_sha256 !== screenplayDigest
  ) {
    issues.push({
      code: "production_hash_mismatch",
      path,
      message:
        "Recording production paths and hashes must match the exact screenplay, accepted QA report, QA source master, and publication audio.",
    });
  }
  if (qa.status !== "accepted") {
    issues.push({
      code: "production_status_mismatch",
      path,
      message: `Accepted recording requires accepted QA; ${qaPath} is ${qa.status}.`,
    });
  }

  const chapterMappingMatches =
    manifest.chapters.length === screenplay.chapters.length &&
    manifest.chapters.length === qa.chapters.length &&
    manifest.chapters.every(
      (chapter, index) =>
        chapter.chapter_id === screenplay.chapters[index]?.id &&
        chapter.commentary_id === screenplay.chapters[index]?.commentary_id &&
        qa.chapters[index]?.chapter_id === screenplay.chapters[index]?.id,
    );
  if (!chapterMappingMatches) {
    issues.push({
      code: "production_chapter_mismatch",
      path,
      message: "Recording chapters must cover every screenplay and QA chapter exactly once and in order.",
    });
  }
  if (
    production.mastering_plan_path !== `plans/${production.mastering_plan_sha256}.json` ||
    production.mastering_result_path !== `artifacts/${production.mastering_plan_sha256}/mastering.json` ||
    production.mechanical_qa_path !== `artifacts/${production.mastering_plan_sha256}/mechanical-qa.json` ||
    production.working_master_path !== `artifacts/${production.mastering_plan_sha256}/master.wav` ||
    production.publication_path !== `artifacts/${production.mastering_plan_sha256}/publication.mp3` ||
    PRODUCTION_PATH_FIELDS.some((field) => !isCanonicalArtifactPath(production[field]))
  ) {
    issues.push({
      code: "invalid_production_dependency",
      path,
      message:
        "Accepted mastering paths must be canonical and colocated at plans/<plan>.json and artifacts/<plan>/{mastering.json,mechanical-qa.json,master.wav,publication.mp3}.",
    });
  }
  return issues;
}

function acceptedSectionIds(dialogue: string) {
  const path = join(getRepoRoot(), `wiki/commentary/${dialogue}.md`);
  if (!existsSync(path)) return new Set<string>();

  const sectionIds = new Set<string>();
  for (const block of commentaryMarkdownBlocks(readFileSync(path, "utf8"))) {
    const commentaryId = fieldValue(block.content, "commentary_id");
    if (
      commentaryId &&
      fieldValue(block.content, "block_kind") === "section" &&
      fieldValue(block.content, "review_status") === "accepted"
    ) {
      sectionIds.add(commentaryId);
    }
  }
  return sectionIds;
}

export function validateRecordingManifest(path: string, content: string) {
  const inspected = inspectRecordingManifest(path, content);
  const issues = inspected.issues;
  const manifest = inspected.manifest;
  if (!manifest) return issues;

  const pathMatch = /^wiki\/recordings\/([a-z0-9-]+)\.json$/u.exec(path);
  const fileDialogue = pathMatch?.[1];
  if (!fileDialogue) {
    issues.push({
      code: "invalid_manifest_path",
      path,
      message: "Recording manifest path must match wiki/recordings/<dialogue>.json.",
    });
  } else if (manifest.dialogue !== fileDialogue) {
    issues.push({
      code: "dialogue_mismatch",
      path,
      message: `Manifest dialogue \`${manifest.dialogue}\` does not match filename dialogue \`${fileDialogue}\`.`,
    });
  }

  if (manifest.schema_version !== 2) {
    issues.push({
      code: "invalid_schema_version",
      path,
      message: `Unsupported schema_version \`${manifest.schema_version}\`; expected 2.`,
    });
  }

  if (!/^[a-z0-9][a-z0-9._-]*$/u.test(manifest.recording_id)) {
    issues.push({
      code: "invalid_recording_id",
      path,
      message: "recording_id must be a stable lowercase identifier using letters, numbers, dot, underscore, or hyphen.",
    });
  }
  if (!RECORDING_STATUSES.has(manifest.status)) {
    issues.push({
      code: "invalid_status",
      path,
      message: `Unknown recording status \`${manifest.status}\`; use draft, accepted, or withdrawn.`,
    });
  }

  if (!isCanonicalArtifactPath(manifest.audio.path)) {
    issues.push({
      code: "invalid_audio_path",
      path,
      message: "audio.path must be a canonical POSIX path relative to the configured recording artifact root.",
    });
  }
  if (!/^audio\/[a-z0-9][a-z0-9.+-]*$/u.test(manifest.audio.mime_type)) {
    issues.push({
      code: "invalid_audio_mime",
      path,
      message: `Invalid audio MIME type \`${manifest.audio.mime_type}\`.`,
    });
  }
  if (!Number.isFinite(manifest.audio.duration_seconds) || manifest.audio.duration_seconds <= 0) {
    issues.push({
      code: "invalid_audio_duration",
      path,
      message: "audio.duration_seconds must be a finite positive number.",
    });
  }
  const validSha256 = SHA256.test(manifest.audio.sha256);
  if (!validSha256) {
    issues.push({
      code: "invalid_audio_sha256",
      path,
      message: "audio.sha256 must be exactly 64 lowercase hexadecimal characters.",
    });
  }

  const sectionIds = acceptedSectionIds(manifest.dialogue);
  const seenTargets = new Set<string>();
  const seenChapterIds = new Set<string>();
  let previousFrame = Number.NEGATIVE_INFINITY;
  for (const [index, chapter] of manifest.chapters.entries()) {
    if (index === 0 && chapter.start_frame !== 0) {
      issues.push({
        code: "first_chapter_not_zero",
        path,
        message: "The first chapter must start at frame 0 so the complete recording is chapter-covered.",
      });
    }
    if (
      !Number.isSafeInteger(chapter.start_frame) ||
      chapter.start_frame < 0 ||
      chapter.start_frame / SAMPLE_RATE >= manifest.audio.duration_seconds
    ) {
      issues.push({
        code: "invalid_chapter",
        path,
        message: `Chapter ${index + 1} start_frame must be a safe non-negative integer before audio end.`,
      });
    }
    if (chapter.start_frame <= previousFrame) {
      issues.push({
        code: "non_monotonic_chapters",
        path,
        message: `Chapter ${index + 1} start_frame must be strictly greater than the preceding chapter.`,
      });
    }
    previousFrame = chapter.start_frame;

    if (seenChapterIds.has(chapter.chapter_id)) {
      issues.push({
        code: "invalid_chapter",
        path,
        message: `Chapter id \`${chapter.chapter_id}\` appears more than once.`,
      });
    }
    seenChapterIds.add(chapter.chapter_id);

    if (seenTargets.has(chapter.commentary_id)) {
      issues.push({
        code: "duplicate_chapter_target",
        path,
        message: `Section commentary target \`${chapter.commentary_id}\` appears more than once.`,
      });
    }
    seenTargets.add(chapter.commentary_id);
    if (!sectionIds.has(chapter.commentary_id)) {
      issues.push({
        code: "missing_section_target",
        path,
        message: `Chapter target \`${chapter.commentary_id}\` is not an accepted section in wiki/commentary/${manifest.dialogue}.md.`,
      });
    }
  }

  issues.push(...validateAcceptedProduction(manifest, path));

  return issues;
}

export function formatRecordingManifestValidationError(issues: RecordingManifestValidationIssue[]) {
  return issues.map((issue) => `- [${issue.code}] ${issue.message}`).join("\n");
}

export function parseRecordingManifest(path: string, content: string): RecordingManifest {
  const issues = validateRecordingManifest(path, content);
  if (issues.length > 0) {
    throw new Error(`Recording manifest validation failed for ${path}:\n${formatRecordingManifestValidationError(issues)}`);
  }
  return inspectRecordingManifest(path, content).manifest!;
}

export function listRecordingManifestPaths() {
  const directory = join(getRepoRoot(), "wiki/recordings");
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => `wiki/recordings/${entry.name}`)
    .sort();
}

export function validateRecordingManifests() {
  const issues: RecordingManifestValidationIssue[] = [];
  const ids = new Map<string, string>();
  for (const path of listRecordingManifestPaths()) {
    const content = readFileSync(join(getRepoRoot(), path), "utf8");
    issues.push(...validateRecordingManifest(path, content));
    const manifest = inspectRecordingManifest(path, content).manifest;
    if (!manifest) continue;
    const previousPath = ids.get(manifest.recording_id);
    if (previousPath) {
      issues.push({
        code: "duplicate_recording_id",
        path,
        message: `recording_id \`${manifest.recording_id}\` is already used by ${previousPath}.`,
      });
    } else {
      ids.set(manifest.recording_id, path);
    }
  }
  return issues;
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";

const SHA256 = /^[a-f0-9]{64}$/u;
const TURN_ID = /^[a-z0-9][a-z0-9_-]*$/u;
const AUDIO_INSERTION_FIELDS = [
  "attribution_path",
  "attribution_sha256",
  "english_sha256",
  "turn_id",
  "edge",
  "char_offset",
] as const;

export type AudioInsertionBoundary = {
  attribution_path: string;
  attribution_sha256: string;
  english_sha256: string;
  turn_id: string;
  edge: "before" | "after";
  char_offset?: number;
};

export type AudioInsertionResolution = {
  boundary: AudioInsertionBoundary;
  boundaryChar: number;
  turn: {
    id: string;
    start_char: number;
    end_char: number;
    character_id: string;
  };
};

export type CommentaryPlaybackBoundaryMethod =
  | "explicit_audio_insertion"
  | "section_turn_at_or_after"
  | "before_turn_at_or_before"
  | "after_turn_at_or_after";

export type CommentaryPlaybackBoundary = {
  boundaryChar: number;
  method: CommentaryPlaybackBoundaryMethod;
};

export function sourceTurnBoundaryAtOrAfter(content: string, boundary: number) {
  const candidate = Math.min(Math.max(boundary, 0), content.length);
  const lineStart = content.lastIndexOf("\n", Math.max(0, candidate - 1)) + 1;
  const linePrefix = content.slice(lineStart, candidate);
  if (
    candidate === 0 ||
    candidate === content.length ||
    content[candidate] === "\n" ||
    content[candidate - 1] === "\n" ||
    /^(?:\s*\{[^{}]+\})*\s*$/u.test(linePrefix)
  ) {
    return candidate;
  }
  const nextLineBoundary = content.indexOf("\n", candidate);
  return nextLineBoundary < 0 ? content.length : nextLineBoundary;
}

export function sourceTurnBoundaryAtOrBefore(content: string, boundary: number) {
  const candidate = Math.min(Math.max(boundary, 0), content.length);
  const lineStart = content.lastIndexOf("\n", Math.max(0, candidate - 1)) + 1;
  const linePrefix = content.slice(lineStart, candidate);
  if (
    candidate === 0 ||
    candidate === content.length ||
    content[candidate] === "\n" ||
    content[candidate - 1] === "\n" ||
    /^(?:\s*\{[^{}]+\})*\s*$/u.test(linePrefix)
  ) {
    return candidate;
  }
  const previousLineBoundary = content.lastIndexOf("\n", candidate - 1);
  return previousLineBoundary < 0 ? 0 : previousLineBoundary;
}

/**
 * Resolve the exact English boundary used by deterministic screenplay playback.
 * Audit and generation must share this function so marker placement cannot be
 * judged at a different edge from the one a listener will actually hear.
 */
export function resolveCommentaryPlaybackBoundary(input: {
  dialogue: string;
  englishContent: string;
  blockKind: string;
  placement: "before" | "after";
  englishStartChar: number;
  englishEndChar: number;
  audioInsertion?: AudioInsertionBoundary;
}): CommentaryPlaybackBoundary {
  if (input.audioInsertion) {
    return {
      boundaryChar: resolveAudioInsertionBoundary(
        input.dialogue,
        input.audioInsertion,
        input.blockKind === "section" ? undefined : input.placement,
      ).boundaryChar,
      method: "explicit_audio_insertion",
    };
  }
  if (input.blockKind === "section") {
    return {
      boundaryChar: sourceTurnBoundaryAtOrAfter(input.englishContent, input.englishStartChar),
      method: "section_turn_at_or_after",
    };
  }
  if (input.placement === "before") {
    return {
      boundaryChar: sourceTurnBoundaryAtOrBefore(input.englishContent, input.englishStartChar),
      method: "before_turn_at_or_before",
    };
  }
  return {
    boundaryChar: sourceTurnBoundaryAtOrAfter(input.englishContent, input.englishEndChar),
    method: "after_turn_at_or_after",
  };
}

type Inspection<T> = { value?: T; errors: string[]; present: boolean };

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanScalar(value: string | undefined) {
  return value?.trim().replace(/^(["'])(.*)\1$/u, "$2");
}

export function inspectAudioInsertionValue(value: unknown): Inspection<AudioInsertionBoundary> {
  if (!isRecord(value)) return { present: true, errors: ["audio_insertion must be an object"] };
  const errors: string[] = [];
  const allowed = new Set<string>(AUDIO_INSERTION_FIELDS);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`audio_insertion contains unknown field ${key}`);
  }
  for (const key of AUDIO_INSERTION_FIELDS.slice(0, 5)) {
    if (!(key in value)) errors.push(`audio_insertion.${key} is required`);
  }
  if (typeof value.attribution_path !== "string" || value.attribution_path.trim().length === 0) {
    errors.push("audio_insertion.attribution_path must be a non-empty string");
  }
  if (typeof value.attribution_sha256 !== "string" || !SHA256.test(value.attribution_sha256)) {
    errors.push("audio_insertion.attribution_sha256 must be a lowercase SHA-256");
  }
  if (typeof value.english_sha256 !== "string" || !SHA256.test(value.english_sha256)) {
    errors.push("audio_insertion.english_sha256 must be a lowercase SHA-256");
  }
  if (typeof value.turn_id !== "string" || !TURN_ID.test(value.turn_id)) {
    errors.push("audio_insertion.turn_id must be a stable turn id");
  }
  if (value.edge !== "before" && value.edge !== "after") {
    errors.push("audio_insertion.edge must be before or after");
  }
  if (
    value.char_offset !== undefined &&
    (typeof value.char_offset !== "number" || !Number.isSafeInteger(value.char_offset) || value.char_offset < 0)
  ) {
    errors.push("audio_insertion.char_offset must be a non-negative safe integer");
  }
  if (value.char_offset !== undefined && value.edge !== "after") {
    errors.push("audio_insertion with char_offset must use edge after");
  }
  if (errors.length > 0) return { present: true, errors };
  return { present: true, errors: [], value: value as AudioInsertionBoundary };
}

export function inspectAudioInsertionBlock(content: string): Inspection<AudioInsertionBoundary> {
  const lines = content.split("\n");
  const start = lines.findIndex((line) => /^audio_insertion:\s*$/u.test(line));
  if (start < 0) return { present: false, errors: [] };
  const values: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim().length === 0) continue;
    if (!/^\s/u.test(line)) break;
    const match = /^\s{2}([a-z0-9_]+):\s*(.*?)\s*$/u.exec(line);
    if (!match) {
      errors.push(`audio_insertion contains malformed line ${line.trim()}`);
      continue;
    }
    const field = match[1]!;
    const raw = cleanScalar(match[2]);
    if (field === "char_offset") {
      const parsed = Number(raw);
      values[field] = Number.isSafeInteger(parsed) ? parsed : raw;
    } else {
      values[field] = raw;
    }
  }
  const inspected = inspectAudioInsertionValue(values);
  return { ...inspected, errors: [...errors, ...inspected.errors] };
}

function acceptedAttribution(
  dialogue: string,
  path: string,
  content: string,
  englishHash: string,
  englishLength: number,
) {
  let raw: unknown;
  try {
    raw = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`Malformed accepted attribution ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (
    !isRecord(raw) ||
    raw.schema_version !== 2 ||
    raw.dialogue !== dialogue ||
    raw.english_sha256 !== englishHash ||
    raw.status !== "accepted" ||
    !Array.isArray(raw.segments) ||
    raw.segments.length === 0
  ) {
    throw new Error(`${path} is not the current accepted attribution for ${dialogue}`);
  }
  const segments: AudioInsertionResolution["turn"][] = [];
  let cursor = 0;
  for (const [index, value] of raw.segments.entries()) {
    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      !TURN_ID.test(value.id) ||
      typeof value.start_char !== "number" ||
      !Number.isSafeInteger(value.start_char) ||
      value.start_char !== cursor ||
      typeof value.end_char !== "number" ||
      !Number.isSafeInteger(value.end_char) ||
      value.end_char <= value.start_char ||
      typeof value.character_id !== "string" ||
      value.character_id.length === 0
    ) {
      throw new Error(`${path} has invalid or non-contiguous segment ${index}`);
    }
    segments.push({
      id: value.id,
      start_char: value.start_char,
      end_char: value.end_char,
      character_id: value.character_id,
    });
    cursor = value.end_char;
  }
  if (new Set(segments.map((segment) => segment.id)).size !== segments.length) {
    throw new Error(`${path} has duplicate turn ids`);
  }
  if (cursor !== englishLength) throw new Error(`${path} does not cover the complete current English source`);
  return segments;
}

function explicitInteriorBoundary(content: string, start: number, offset: number, end: number) {
  const before = content
    .slice(start, offset)
    .replace(/\{[^{}]*\}/gu, "")
    .trimEnd();
  const after = content.slice(offset, end);
  const sentenceEnd = /[.!?]["'’”»)}\]]*$/u.test(before);
  const labelStart = /^\s*(?:\{[^{}]*\}\s*)*[\p{L}][\p{L}\p{M}. '’_-]{0,60}\.\s/u.test(after);
  return before.length > 0 && /[\p{L}\p{N}]/u.test(after.replace(/\{[^{}]*\}/gu, "")) && (sentenceEnd || labelStart);
}

export function resolveAudioInsertionBoundary(
  dialogue: string,
  boundary: AudioInsertionBoundary,
  expectedPlacement?: "before" | "after",
): AudioInsertionResolution {
  const root = getRepoRoot();
  const canonicalAttributionPath = `audio/speaker-attributions/${dialogue}.json`;
  const canonicalEnglishPath = `raw/plato/english/${dialogue}.txt`;
  if (boundary.attribution_path !== canonicalAttributionPath) {
    throw new Error(`audio_insertion.attribution_path must be ${canonicalAttributionPath}`);
  }
  if (expectedPlacement && boundary.edge !== expectedPlacement) {
    throw new Error(`audio_insertion.edge ${boundary.edge} must match placement ${expectedPlacement}`);
  }
  const attributionAbsolute = join(root, canonicalAttributionPath);
  const englishAbsolute = join(root, canonicalEnglishPath);
  if (!existsSync(attributionAbsolute) || !existsSync(englishAbsolute)) {
    throw new Error(`audio_insertion requires ${canonicalAttributionPath} and ${canonicalEnglishPath}`);
  }
  const attributionContent = readFileSync(attributionAbsolute, "utf8");
  const englishContent = readFileSync(englishAbsolute, "utf8");
  const currentAttributionHash = sha256(attributionContent);
  const currentEnglishHash = sha256(englishContent);
  if (boundary.attribution_sha256 !== currentAttributionHash) {
    throw new Error(`audio_insertion.attribution_sha256 does not match ${canonicalAttributionPath}`);
  }
  if (boundary.english_sha256 !== currentEnglishHash) {
    throw new Error(`audio_insertion.english_sha256 does not match ${canonicalEnglishPath}`);
  }
  const segments = acceptedAttribution(
    dialogue,
    canonicalAttributionPath,
    attributionContent,
    currentEnglishHash,
    englishContent.length,
  );
  const turn = segments.find((segment) => segment.id === boundary.turn_id);
  if (!turn) throw new Error(`audio_insertion.turn_id ${boundary.turn_id} is absent from ${canonicalAttributionPath}`);

  let boundaryChar: number;
  if (boundary.char_offset === undefined) {
    boundaryChar = boundary.edge === "before" ? turn.start_char : turn.end_char;
  } else {
    if (boundary.edge !== "after") throw new Error("Interior audio_insertion.char_offset requires edge after");
    if (!(turn.start_char < boundary.char_offset && boundary.char_offset < turn.end_char)) {
      throw new Error(`audio_insertion.char_offset must lie strictly inside ${turn.id}`);
    }
    if (!explicitInteriorBoundary(englishContent, turn.start_char, boundary.char_offset, turn.end_char)) {
      throw new Error(`audio_insertion.char_offset is not an explicit sentence or label boundary inside ${turn.id}`);
    }
    boundaryChar = boundary.char_offset;
  }
  return { boundary, boundaryChar, turn };
}

export function renderAudioInsertionLines(boundary: AudioInsertionBoundary) {
  return [
    "audio_insertion:",
    `  attribution_path: ${boundary.attribution_path}`,
    `  attribution_sha256: "${boundary.attribution_sha256}"`,
    `  english_sha256: "${boundary.english_sha256}"`,
    `  turn_id: ${boundary.turn_id}`,
    `  edge: ${boundary.edge}`,
    ...(boundary.char_offset === undefined ? [] : [`  char_offset: ${boundary.char_offset}`]),
  ];
}

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  parseCastCatalog,
  parseCharacterCatalog,
  reportedOnlyCharacterIdsForDialogue,
  reviewRequiredVoiceCharacterIdsForDialogue,
  voiceOwnerCharacterIdsForDialogue,
  type CharacterCatalog,
} from "./audio-catalog.js";
import {
  audioWordCount,
  canonicalSpokenEnglish,
  canonicalSpokenEnglishSegments,
  characterNamesForDialogue,
  validateAudioScript,
  validateAudioScriptArtifact,
  type AudioProductionValidationIssue,
  type AudioScript,
  type AudioScriptEntry,
} from "./audio-production.js";
import {
  inspectAudioInsertionBlock,
  resolveAudioInsertionBoundary,
  sourceTurnBoundaryAtOrAfter,
  sourceTurnBoundaryAtOrBefore,
  type AudioInsertionBoundary,
} from "./audio-insertion.js";
import {
  englishStephanusIndexPath,
  markerForOffset,
  parseStephanusIndexToon,
} from "./derived/stephanus.js";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";
import { projectStephanusSpansToMarkers, stephanusMarkerOrdinal } from "./source.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import { fieldValue } from "./wiki/observation-ledger.js";
import { parseCommentaryQualityAuditManifest } from "./wiki/commentary-quality-audit.js";

const ATTRIBUTION_SCHEMA_VERSION = 2 as const;
const ATTRIBUTION_VOICE_POLICY = "reported-speech-inherits-active-character-v1" as const;
const GENERATOR_VERSION = "screenplay-generator-v3";
const SAFE_ID = /^[a-z0-9][a-z0-9_-]*$/u;
const DIALOGUE = /^[a-z0-9][a-z0-9-]*$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/u;

function lastBoundaryIndexAtOrBefore(boundaries: number[], value: number) {
  for (let index = boundaries.length - 1; index >= 0; index -= 1) {
    if (boundaries[index]! <= value) return index;
  }
  return -1;
}

export type SpeakerAttributionSegment = {
  id: string;
  start_char: number;
  end_char: number;
  /** Active voice owner for the whole span, including any reported or quoted speech. */
  character_id: string;
};

export type SpeakerAttributionPlan = {
  schema_version: 2;
  dialogue: string;
  english_sha256: string;
  voice_policy: typeof ATTRIBUTION_VOICE_POLICY;
  status: "accepted";
  reviewer: string;
  reviewed_at: string;
  commentary_character_id: string;
  segments: SpeakerAttributionSegment[];
};

export type ScreenplayGenerationBlocker = {
  code:
    | "missing_dependency"
    | "invalid_character_catalog"
    | "invalid_cast_catalog"
    | "invalid_commentary"
    | "commentary_not_accepted"
    | "missing_commentary_quality_audit"
    | "invalid_commentary_quality_audit"
    | "commentary_quality_audit_not_accepted"
    | "missing_attribution_plan"
    | "invalid_attribution_plan"
    | "reported_only_voice_owner"
    | "review_required_voice_owner"
    | "unresolved_character"
    | "incomplete_attribution"
    | "chapter_mapping_failure"
    | "screenplay_contract_failure"
    | "missing_cast_voice";
  message: string;
  character_ids?: string[];
};

export type SourceAttributionDiagnostic = {
  line: number;
  start_char: number;
  end_char: number;
  reason: "no_explicit_source_label" | "embedded_quote_requires_span_review" | "ambiguous_source_label";
  labels: string[];
  excerpt: string;
};

export type ScreenplayGenerationReport = {
  schema_version: 1;
  artifact_class: "screenplay-generation-report";
  dialogue: string;
  dry_run: true;
  counts_as_production_screenplay: false;
  screenplay_status: "blocked" | "draft-ready" | "production-contract-valid";
  production_eligible: boolean;
  inputs: {
    english_path: string;
    stephanus_path: string;
    commentary_path: string;
    commentary_quality_audit_path: string;
    characters_path: "audio/characters.json";
    cast_path: "audio/cast.json";
    attribution_path: string;
  };
  commentary: {
    block_count: number;
    accepted_block_count: number;
    section_count: number;
    fully_accepted: boolean;
    quality_audit_sha256: string | null;
    quality_audit_accepted: boolean;
  };
  characters: {
    roster_character_ids: string[];
    voice_owner_character_ids: string[];
    reported_only_character_ids: string[];
    review_required_voice_character_ids: string[];
    attributed_character_ids: string[];
    commentary_character_id: string | null;
    selected_cast_character_ids: string[];
    missing_cast_character_ids: string[];
  };
  source_diagnostics: {
    physical_line_count: number;
    explicit_label_line_count: number;
    embedded_quote_line_count: number;
    unresolved_lines: SourceAttributionDiagnostic[];
  };
  blockers: ScreenplayGenerationBlocker[];
  structural_validation_issues: AudioProductionValidationIssue[];
  repository_validation_issues: AudioProductionValidationIssue[];
  prospective_screenplay?: AudioScript;
};

type CommentaryRecord = {
  id: string;
  kind: string;
  placement: string;
  title: string;
  span: string;
  body: string;
  status: string;
  audioInsertion?: AudioInsertionBoundary;
};

type PreparedSourceSegment = SpeakerAttributionSegment & {
  text: string;
  startMarker: string;
  endMarker: string;
  anchor: string;
  chapterId: string;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function atomicWrite(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  rmSync(temporary, { force: true });
  writeFileSync(temporary, content, "utf8");
  renameSync(temporary, path);
}

function labelWords(value: string) {
  return value.match(/\p{L}+/gu)?.map((word) => word.toLocaleLowerCase("en-US")) ?? [];
}

function labelMatchesName(label: string, name: string) {
  const labelParts = labelWords(label);
  const nameParts = labelWords(name);
  if (labelParts.length === 0) return false;
  if (labelParts.length === 1) return nameParts.some((part) => part.startsWith(labelParts[0]!));
  for (let offset = 0; offset <= nameParts.length - labelParts.length; offset += 1) {
    if (labelParts.every((part, index) => nameParts[offset + index]!.startsWith(part))) return true;
  }
  return false;
}

function sourceDiagnostics(content: string, catalog: CharacterCatalog, dialogue: string) {
  const dialogueCharacters = catalog.characters.filter((character) =>
    character.appearances.some((appearance) => appearance.dialogue === dialogue),
  );
  const labelPattern = /(^|\{(?:\d+[a-e]|b\d+|sp\d+|p|\/?(?:add|corr|del|name|pers|place|q|quote|rs|sic))\}\s+)(?<label>(?:\p{L}\.(?:\s+\p{L}\.)*\s+\p{L}+|\p{L}+(?:\s+\p{L}+){0,3}))\.\s+/gmu;
  const unresolvedLines: SourceAttributionDiagnostic[] = [];
  let offset = 0;
  let explicitLabelLineCount = 0;
  let embeddedQuoteLineCount = 0;
  const lines = content.split(/(?<=\n)/u);

  for (const [index, line] of lines.entries()) {
    const rawLabels = [...line.matchAll(labelPattern)].map((match) => match.groups?.label ?? "").filter(Boolean);
    const labels = rawLabels.filter((label) =>
      dialogueCharacters.some((character) =>
        [character.displayName, ...character.aliases].some((name) => labelMatchesName(label, name)),
      ),
    );
    const candidateIds = sortedUnique(
      labels.flatMap((label) =>
        dialogueCharacters
          .filter((character) =>
            [character.displayName, ...character.aliases].some((name) => labelMatchesName(label, name)),
          )
          .map((character) => character.characterId),
      ),
    );
    const hasEmbeddedQuote = line.includes("{q}") || line.includes("{quote}");
    if (labels.length > 0 && candidateIds.length === 1) explicitLabelLineCount += 1;
    if (hasEmbeddedQuote) embeddedQuoteLineCount += 1;

    let reason: SourceAttributionDiagnostic["reason"] | undefined;
    if (labels.length === 0) reason = "no_explicit_source_label";
    else if (candidateIds.length !== 1) reason = "ambiguous_source_label";
    else if (hasEmbeddedQuote) reason = "embedded_quote_requires_span_review";
    if (reason) {
      unresolvedLines.push({
        line: index + 1,
        start_char: offset,
        end_char: offset + line.length,
        reason,
        labels,
        excerpt: line.replace(/\s+/gu, " ").trim().slice(0, 180),
      });
    }
    offset += line.length;
  }
  return {
    physical_line_count: lines.length,
    explicit_label_line_count: explicitLabelLineCount,
    embedded_quote_line_count: embeddedQuoteLineCount,
    unresolved_lines: unresolvedLines,
  };
}

function commentaryRecords(content: string): CommentaryRecord[] {
  return commentaryMarkdownBlocks(content).map((block) => {
    const audioInsertion = inspectAudioInsertionBlock(block.content).value;
    return {
      id: fieldValue(block.content, "commentary_id") ?? "",
      kind: fieldValue(block.content, "block_kind") ?? "",
      placement: fieldValue(block.content, "placement") ?? "",
      title: fieldValue(block.content, "title") ?? "",
      span: fieldValue(block.content, "stephanus_span") ?? "",
      body: fieldValue(block.content, "body") ?? "",
      status: fieldValue(block.content, "review_status") ?? "",
      ...(audioInsertion ? { audioInsertion } : {}),
    };
  });
}

function readAttributionPlan(
  content: string,
  dialogue: string,
  englishHash: string,
): { plan?: SpeakerAttributionPlan; errors: string[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(content) as unknown;
  } catch (error) {
    return { errors: [`Malformed attribution JSON: ${error instanceof Error ? error.message : String(error)}`] };
  }
  if (!isRecord(raw)) return { errors: ["Attribution plan must be a JSON object."] };
  const allowed = new Set([
    "schema_version",
    "dialogue",
    "english_sha256",
    "voice_policy",
    "status",
    "reviewer",
    "reviewed_at",
    "commentary_character_id",
    "segments",
  ]);
  const errors = Object.keys(raw)
    .filter((field) => !allowed.has(field))
    .map((field) => `Unknown attribution field: ${field}`);
  if (raw.schema_version !== ATTRIBUTION_SCHEMA_VERSION) errors.push("schema_version must be 2.");
  if (raw.dialogue !== dialogue) errors.push(`dialogue must be ${dialogue}.`);
  if (raw.english_sha256 !== englishHash) errors.push(`english_sha256 must match the current ${dialogue} spine.`);
  if (raw.voice_policy !== ATTRIBUTION_VOICE_POLICY) {
    errors.push(`voice_policy must be ${ATTRIBUTION_VOICE_POLICY}.`);
  }
  if (raw.status !== "accepted") errors.push("status must be accepted; draft attribution never receives screenplay credit.");
  if (typeof raw.reviewer !== "string" || raw.reviewer.trim() === "") errors.push("reviewer must be non-empty.");
  if (typeof raw.reviewed_at !== "string" || !DATE.test(raw.reviewed_at)) errors.push("reviewed_at must use YYYY-MM-DD.");
  if (typeof raw.commentary_character_id !== "string" || !SAFE_ID.test(raw.commentary_character_id)) {
    errors.push("commentary_character_id must be a stable character id.");
  }
  if (!Array.isArray(raw.segments) || raw.segments.length === 0) {
    errors.push("segments must be a non-empty array.");
  }

  const segments: SpeakerAttributionSegment[] = [];
  if (Array.isArray(raw.segments)) {
    for (const [index, value] of raw.segments.entries()) {
      if (!isRecord(value)) {
        errors.push(`segments[${index}] must be an object.`);
        continue;
      }
      const fields = new Set(["id", "start_char", "end_char", "character_id"]);
      for (const field of Object.keys(value)) {
        if (!fields.has(field)) errors.push(`segments[${index}] contains unknown field ${field}.`);
      }
      if (
        typeof value.id !== "string" ||
        !SAFE_ID.test(value.id) ||
        typeof value.start_char !== "number" ||
        !Number.isSafeInteger(value.start_char) ||
        value.start_char < 0 ||
        typeof value.end_char !== "number" ||
        !Number.isSafeInteger(value.end_char) ||
        value.end_char <= value.start_char ||
        typeof value.character_id !== "string" ||
        !SAFE_ID.test(value.character_id)
      ) {
        errors.push(`segments[${index}] has invalid fields.`);
        continue;
      }
      segments.push(value as SpeakerAttributionSegment);
    }
  }
  if (new Set(segments.map((segment) => segment.id)).size !== segments.length) {
    errors.push("segment ids must be unique.");
  }
  if (errors.length > 0) return { errors };
  return { plan: raw as SpeakerAttributionPlan, errors: [] };
}

function chapterId(commentaryId: string) {
  return `chapter-${commentaryId.replace(/^comm_/u, "")}`;
}

function entryId(prefix: string, id: string) {
  return `${prefix}-${id}`.replace(/_/gu, "-");
}

function cadenceForSource(current: PreparedSourceSegment, previous: PreparedSourceSegment | undefined) {
  if (previous?.character_id === current.character_id) return "continuation" as const;
  if (audioWordCount(current.text) <= 8) return "short_reply" as const;
  return "exchange" as const;
}

function buildScreenplay(
  dialogue: string,
  englishContent: string,
  stephanusContent: string,
  commentaryContent: string,
  commentaryQualityAuditSha256: string,
  castContent: string,
  plan: SpeakerAttributionPlan,
  attributionSha256: string,
  characters: CharacterCatalog,
  records: CommentaryRecord[],
  blockers: ScreenplayGenerationBlocker[],
) {
  const index = parseStephanusIndexToon(stephanusContent);
  const sections = records.filter((record) => record.kind === "section");
  const projection = projectStephanusSpansToMarkers(
    index.markers,
    sections.map((section) => ({ id: chapterId(section.id), span: section.span })),
  );
  const sectionRanges = projection.map((chapter, sectionIndex) => ({
    ...chapter,
    englishMarkers: chapter.markers,
    record: sections[sectionIndex]!,
  }));
  const commentaryRanges = projectStephanusSpansToMarkers(
    index.markers,
    records.map((record) => ({ id: record.id, span: record.span })),
  );
  const commentaryRangeById = new Map(commentaryRanges.map((range) => [range.id, range]));
  const invalidEnglishMarkers = index.markers.filter((marker) => {
    const ordinal = stephanusMarkerOrdinal(marker.marker);
    return sectionRanges.filter((section) => section.start <= ordinal && ordinal <= section.end).length !== 1;
  });
  const sectionBoundaryChars: number[] = [];
  for (const section of sectionRanges) {
    try {
      sectionBoundaryChars.push(
        section.record.audioInsertion
          ? resolveAudioInsertionBoundary(dialogue, section.record.audioInsertion).boundaryChar
          : sourceTurnBoundaryAtOrAfter(englishContent, section.englishMarkers[0]!.startChar),
      );
    } catch (error) {
      blockers.push({
        code: "invalid_commentary",
        message: `Commentary ${section.record.id} has invalid audio_insertion: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  const sectionStartsAreOrdered =
    sectionBoundaryChars.length === sectionRanges.length &&
    sectionBoundaryChars[0] === 0 &&
    sectionBoundaryChars.every(
      (start, sectionIndex) =>
        start < englishContent.length &&
        (sectionIndex === 0 || start > sectionBoundaryChars[sectionIndex - 1]!),
    );
  if (invalidEnglishMarkers.length > 0 || !sectionStartsAreOrdered || blockers.some((blocker) => blocker.code === "invalid_commentary")) {
    blockers.push({
      code: "chapter_mapping_failure",
      message:
        "Accepted Greek section spans must project to an ordered, exact marker partition and strictly increasing source-turn or explicit audio boundaries beginning at source char 0; " +
        `${invalidEnglishMarkers.length} English marker(s) have non-unique coverage and section order is ${sectionStartsAreOrdered ? "valid" : "invalid"}.`,
    });
    return undefined;
  }

  const commentaryBoundaryCharById = new Map<string, number>();
  for (const record of records.filter((candidate) => candidate.kind !== "section")) {
    const range = commentaryRangeById.get(record.id)!;
    try {
      const boundaryChar = record.audioInsertion
        ? resolveAudioInsertionBoundary(
            dialogue,
            record.audioInsertion,
            record.placement === "before" ? "before" : "after",
          ).boundaryChar
        : record.placement === "before"
          ? sourceTurnBoundaryAtOrBefore(englishContent, range.markers[0]!.startChar)
          : sourceTurnBoundaryAtOrAfter(englishContent, range.markers.at(-1)!.endChar);
      commentaryBoundaryCharById.set(record.id, boundaryChar);
    } catch (error) {
      blockers.push({
        code: "invalid_commentary",
        message: `Commentary ${record.id} has invalid audio_insertion: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  if (blockers.some((blocker) => blocker.code === "invalid_commentary")) return undefined;

  const characterNames = characterNamesForDialogue(characters, dialogue);
  let cursor = 0;
  for (const segment of plan.segments) {
    if (segment.start_char !== cursor || segment.end_char > englishContent.length) {
      blockers.push({
        code: "incomplete_attribution",
        message: `Attribution segments must partition every source byte in order; ${segment.id} starts at ${segment.start_char}, expected ${cursor}.`,
      });
      break;
    }
    cursor = segment.end_char;
  }
  if (cursor !== englishContent.length && !blockers.some((blocker) => blocker.code === "incomplete_attribution")) {
    blockers.push({
      code: "incomplete_attribution",
      message: `Attribution segments end at ${cursor}, but the canonical English spine has ${englishContent.length} characters.`,
    });
  }
  if (blockers.some((blocker) => blocker.code === "incomplete_attribution")) return undefined;

  const fragmentBoundaries = [...new Set(
    [
      ...sectionBoundaryChars.slice(1),
      ...commentaryBoundaryCharById.values(),
    ]
      .filter((boundary) => 0 < boundary && boundary < englishContent.length),
  )].sort((left, right) => left - right);
  const fragments = plan.segments.flatMap((segment) => {
    const cuts = [
      segment.start_char,
      ...fragmentBoundaries.filter((boundary) => segment.start_char < boundary && boundary < segment.end_char),
      segment.end_char,
    ];
    return cuts.slice(0, -1).map((startChar, fragmentIndex) => ({
      parentSegmentId: segment.id,
      start_char: startChar,
      end_char: cuts[fragmentIndex + 1]!,
      character_id: segment.character_id,
    }));
  });

  const normalizationIssues: AudioProductionValidationIssue[] = [];
  const spokenFragments = canonicalSpokenEnglishSegments(
    englishContent,
    fragments,
    characterNames,
    `audio/speaker-attributions/${dialogue}.json`,
    normalizationIssues,
  );
  if (!spokenFragments || normalizationIssues.length > 0) {
    blockers.push({
      code: "incomplete_attribution",
      message: `Accepted attribution does not yield source-global canonical spoken text${
        normalizationIssues.length > 0 ? `: ${normalizationIssues.map((issue) => issue.message).join(" ")}` : "."
      }`,
    });
    return undefined;
  }

  const nonEmptyFragmentCounts = new Map<string, number>();
  for (const [fragmentIndex, fragment] of fragments.entries()) {
    if (spokenFragments[fragmentIndex]!.length === 0) continue;
    nonEmptyFragmentCounts.set(fragment.parentSegmentId, (nonEmptyFragmentCounts.get(fragment.parentSegmentId) ?? 0) + 1);
  }
  const emptyParent = plan.segments.find((segment) => !nonEmptyFragmentCounts.has(segment.id));
  if (emptyParent) {
    blockers.push({
      code: "incomplete_attribution",
      message: `Attribution segment ${emptyParent.id} does not yield non-empty canonical spoken text.`,
    });
    return undefined;
  }

  const prepared: PreparedSourceSegment[] = [];
  const emittedPartCounts = new Map<string, number>();
  for (const [fragmentIndex, fragment] of fragments.entries()) {
    const text = spokenFragments[fragmentIndex]!;
    if (text.length === 0) continue;
    const startMarker = markerForOffset(index.markers, fragment.start_char);
    const endMarker = markerForOffset(index.markers, Math.max(fragment.start_char, fragment.end_char - 1));
    const chapterIndex = lastBoundaryIndexAtOrBefore(sectionBoundaryChars, fragment.start_char);
    const chapter = sectionRanges[chapterIndex];
    const chapterEnd = sectionBoundaryChars[chapterIndex + 1] ?? englishContent.length;
    if (!chapter || fragment.end_char > chapterEnd) {
      blockers.push({
        code: "chapter_mapping_failure",
        message: `Attribution fragment from ${fragment.parentSegmentId} (${startMarker}-${endMarker}) crosses or falls outside the source-turn-safe section chapters.`,
      });
      break;
    }
    const partIndex = (emittedPartCounts.get(fragment.parentSegmentId) ?? 0) + 1;
    emittedPartCounts.set(fragment.parentSegmentId, partIndex);
    const id =
      nonEmptyFragmentCounts.get(fragment.parentSegmentId) === 1
        ? fragment.parentSegmentId
        : `${fragment.parentSegmentId}-part-${String(partIndex).padStart(3, "0")}`;
    prepared.push({
      id,
      start_char: fragment.start_char,
      end_char: fragment.end_char,
      character_id: fragment.character_id,
      text,
      startMarker,
      endMarker,
      anchor: startMarker === endMarker ? startMarker : `${startMarker}-${endMarker}`,
      chapterId: chapter.id,
    });
  }
  if (new Set(prepared.map((segment) => segment.id)).size !== prepared.length) {
    blockers.push({
      code: "chapter_mapping_failure",
      message: "Projected source fragment ids are not unique.",
    });
  }
  if (blockers.some((blocker) => ["incomplete_attribution", "chapter_mapping_failure"].includes(blocker.code))) {
    return undefined;
  }

  const expectedIssues: AudioProductionValidationIssue[] = [];
  const expectedSource = canonicalSpokenEnglish(
    englishContent,
    [],
    characterNames,
    `raw/plato/english/${dialogue}.txt`,
    expectedIssues,
  );
  const actualSource = prepared.map((segment) => segment.text).join(" ");
  if (expectedSource === undefined || expectedIssues.length > 0 || actualSource !== expectedSource) {
    blockers.push({
      code: "incomplete_attribution",
      message: "Ordered attribution segments do not reconstruct the exact canonical spoken English spine.",
    });
    return undefined;
  }

  const boundaryIndexForChar = (boundaryChar: number) => {
    const crossing = prepared.find(
      (segment) => segment.start_char < boundaryChar && boundaryChar < segment.end_char,
    );
    if (crossing) {
      blockers.push({
        code: "chapter_mapping_failure",
        message: `Resolved audio boundary at English char ${boundaryChar} splits source entry ${crossing.id}.`,
      });
    }
    const indexAtOrAfter = prepared.findIndex((segment) => segment.start_char >= boundaryChar);
    return indexAtOrAfter < 0 ? prepared.length : indexAtOrAfter;
  };
  const commentaryBoundaryById = new Map(
    [...commentaryBoundaryCharById].map(([id, boundaryChar]) => [id, boundaryIndexForChar(boundaryChar)]),
  );
  if (blockers.some((blocker) => blocker.code === "chapter_mapping_failure")) return undefined;

  const commentaryByChapter = new Map<string, CommentaryRecord[]>();
  for (const record of records.filter((candidate) => candidate.kind !== "section")) {
    const boundaryChar = commentaryBoundaryCharById.get(record.id)!;
    let chapterIndex = lastBoundaryIndexAtOrBefore(sectionBoundaryChars, boundaryChar);
    if (
      record.placement === "after" &&
      chapterIndex > 0 &&
      sectionBoundaryChars[chapterIndex] === boundaryChar
    ) {
      chapterIndex -= 1;
    }
    const chapter = sectionRanges[chapterIndex];
    if (!chapter) {
      blockers.push({
        code: "chapter_mapping_failure",
        message: `Commentary ${record.id} cannot be assigned at resolved English boundary ${boundaryChar}.`,
      });
      continue;
    }
    const values = commentaryByChapter.get(chapter.id) ?? [];
    values.push(record);
    commentaryByChapter.set(chapter.id, values);
  }
  if (blockers.some((blocker) => blocker.code === "chapter_mapping_failure")) return undefined;

  const emptyChapter = sectionRanges.find(
    (section) => !prepared.some((segment) => segment.chapterId === section.id),
  );
  if (emptyChapter) {
    blockers.push({
      code: "chapter_mapping_failure",
      message: `Resolved audio boundaries leave chapter ${emptyChapter.id} without source text.`,
    });
    return undefined;
  }

  const entries: AudioScriptEntry[] = [];
  for (const section of sectionRanges) {
    const recordsForChapter = commentaryByChapter.get(section.id) ?? [];
    entries.push({
      id: entryId(`${dialogue}-heading`, section.record.id),
      chapter_id: section.id,
      kind: "heading",
      character_id: plan.commentary_character_id,
      text: section.record.title,
      anchor: { commentary_id: section.record.id },
      cadence_intent: "chapter",
    });
    entries.push({
      id: entryId(`${dialogue}-commentary`, section.record.id),
      chapter_id: section.id,
      kind: "commentary",
      character_id: plan.commentary_character_id,
      text: section.record.body,
      anchor: { commentary_id: section.record.id },
      cadence_intent: "chapter",
    });

    const source = prepared.filter((segment) => segment.chapterId === section.id);
    const sourceStart = source.length > 0 ? prepared.indexOf(source[0]!) : -1;
    const sourceEnd = sourceStart < 0 ? -1 : sourceStart + source.length;
    const remainingCommentary = recordsForChapter;
    const commentaryAtBoundary = new Map<number, CommentaryRecord[]>();
    for (const record of remainingCommentary) {
      const boundary = commentaryBoundaryById.get(record.id)!;
      if (boundary < sourceStart || boundary > sourceEnd) {
        blockers.push({
          code: "chapter_mapping_failure",
          message: `Commentary ${record.id} resolved outside its assigned chapter source range.`,
        });
        continue;
      }
      commentaryAtBoundary.set(boundary, [...(commentaryAtBoundary.get(boundary) ?? []), record]);
    }
    const emitCommentary = (record: CommentaryRecord) => {
      entries.push({
        id: entryId(`${dialogue}-commentary`, record.id),
        chapter_id: section.id,
        kind: "commentary",
        character_id: plan.commentary_character_id,
        text: record.body,
        anchor: { commentary_id: record.id },
        cadence_intent: "commentary",
      });
    };
    for (const [index, segment] of source.entries()) {
      const globalIndex = sourceStart + index;
      for (const record of commentaryAtBoundary.get(globalIndex) ?? []) emitCommentary(record);
      entries.push({
        id: entryId(`${dialogue}-source`, segment.id),
        chapter_id: section.id,
        kind: "source",
        character_id: segment.character_id,
        text: segment.text,
        anchor: { stephanus: segment.anchor },
        cadence_intent: cadenceForSource(segment, source[index - 1]),
      });
    }
    for (const record of commentaryAtBoundary.get(sourceEnd) ?? []) emitCommentary(record);
  }
  if (blockers.some((blocker) => blocker.code === "chapter_mapping_failure")) return undefined;

  const sourceWords = audioWordCount(expectedSource);
  const script: AudioScript = {
    schema_version: 2,
    dialogue,
    source_hashes: { english: sha256(englishContent), stephanus: sha256(stephanusContent) },
    commentary_sha256: sha256(commentaryContent),
    commentary_quality_audit_sha256: commentaryQualityAuditSha256,
    cast_sha256: sha256(castContent),
    generator_version: `${GENERATOR_VERSION}+attribution.${attributionSha256}`,
    chapters: sectionRanges.map((section) => ({
      id: section.id,
      commentary_id: section.record.id,
      title: section.record.title,
    })),
    entries,
    repairs: [],
    coverage: {
      source_words: sourceWords,
      source_words_covered: sourceWords,
      source_words_uncovered: 0,
      source_words_duplicated: 0,
      commentary_blocks_expected: records.length,
      commentary_blocks_covered: records.length,
      commentary_blocks_missing: 0,
      commentary_blocks_duplicated: 0,
    },
  };
  return script;
}

export function buildScreenplayGenerationReport(dialogue: string): ScreenplayGenerationReport {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const root = getRepoRoot();
  const inputs = {
    english_path: `raw/plato/english/${dialogue}.txt`,
    stephanus_path: englishStephanusIndexPath(dialogue),
    commentary_path: `wiki/commentary/${dialogue}.md`,
    commentary_quality_audit_path: `wiki/commentary-audits/${dialogue}.json`,
    characters_path: "audio/characters.json" as const,
    cast_path: "audio/cast.json" as const,
    attribution_path: `audio/speaker-attributions/${dialogue}.json`,
  };
  const blockers: ScreenplayGenerationBlocker[] = [];
  for (const [label, path] of Object.entries(inputs).filter(
    ([label]) => label !== "attribution_path" && label !== "commentary_quality_audit_path",
  )) {
    if (!existsSync(join(root, path))) {
      blockers.push({ code: "missing_dependency", message: `Missing ${label}: ${path}.` });
    }
  }
  if (!existsSync(join(root, inputs.commentary_quality_audit_path))) {
    blockers.push({
      code: "missing_commentary_quality_audit",
      message: `Missing accepted commentary quality audit: ${inputs.commentary_quality_audit_path}.`,
    });
  }

  const emptyReport = (): ScreenplayGenerationReport => ({
    schema_version: 1,
    artifact_class: "screenplay-generation-report",
    dialogue,
    dry_run: true,
    counts_as_production_screenplay: false,
    screenplay_status: "blocked",
    production_eligible: false,
    inputs,
    commentary: {
      block_count: 0,
      accepted_block_count: 0,
      section_count: 0,
      fully_accepted: false,
      quality_audit_sha256: null,
      quality_audit_accepted: false,
    },
    characters: {
      roster_character_ids: [],
      voice_owner_character_ids: [],
      reported_only_character_ids: [],
      review_required_voice_character_ids: [],
      attributed_character_ids: [],
      commentary_character_id: null,
      selected_cast_character_ids: [],
      missing_cast_character_ids: [],
    },
    source_diagnostics: {
      physical_line_count: 0,
      explicit_label_line_count: 0,
      embedded_quote_line_count: 0,
      unresolved_lines: [],
    },
    blockers,
    structural_validation_issues: [],
    repository_validation_issues: [],
  });

  const requiredWithoutAttribution = Object.entries(inputs)
    .filter(([label]) => label !== "attribution_path")
    .map(([, path]) => path);
  if (requiredWithoutAttribution.some((path) => !existsSync(join(root, path)))) return emptyReport();

  const englishContent = readFileSync(join(root, inputs.english_path), "utf8");
  const stephanusContent = readFileSync(join(root, inputs.stephanus_path), "utf8");
  const commentaryContent = readFileSync(join(root, inputs.commentary_path), "utf8");
  const commentaryQualityAuditContent = readFileSync(join(root, inputs.commentary_quality_audit_path), "utf8");
  const characterContent = readFileSync(join(root, inputs.characters_path), "utf8");
  const castContent = readFileSync(join(root, inputs.cast_path), "utf8");
  let commentaryQualityAuditSha256: string | undefined;
  let commentaryQualityAuditAccepted = false;
  try {
    const qualityAudit = parseCommentaryQualityAuditManifest(
      inputs.commentary_quality_audit_path,
      commentaryQualityAuditContent,
    );
    commentaryQualityAuditSha256 = sha256(commentaryQualityAuditContent);
    if (qualityAudit.acceptance.decision === "accepted") {
      commentaryQualityAuditAccepted = true;
    } else {
      blockers.push({
        code: "commentary_quality_audit_not_accepted",
        message: `${inputs.commentary_quality_audit_path} is valid but still pending operator-delegated Luna sample acceptance.`,
      });
    }
  } catch (error) {
    blockers.push({
      code: "invalid_commentary_quality_audit",
      message: error instanceof Error ? error.message : String(error),
    });
  }
  let characters: CharacterCatalog;
  try {
    characters = parseCharacterCatalog(inputs.characters_path, characterContent);
  } catch (error) {
    blockers.push({
      code: "invalid_character_catalog",
      message: error instanceof Error ? error.message : String(error),
    });
    return emptyReport();
  }
  let cast;
  try {
    cast = parseCastCatalog(inputs.cast_path, castContent, characters);
  } catch (error) {
    blockers.push({ code: "invalid_cast_catalog", message: error instanceof Error ? error.message : String(error) });
    return { ...emptyReport(), source_diagnostics: sourceDiagnostics(englishContent, characters, dialogue) };
  }

  const records = commentaryRecords(commentaryContent);
  const accepted = records.filter((record) => record.status === "accepted");
  const active = records.filter((record) => record.status !== "rejected");
  const pending = active.filter((record) => record.status !== "accepted");
  const sections = accepted.filter((record) => record.kind === "section");
  const invalidRecords = records.filter(
    (record) =>
      !record.id ||
      !SAFE_ID.test(record.id) ||
      !record.kind ||
      !record.placement ||
      !record.span ||
      !record.body ||
      (record.kind === "section" && !record.title),
  );
  if (accepted.length === 0 || sections.length === 0 || invalidRecords.length > 0) {
    blockers.push({
      code: "invalid_commentary",
      message: `Commentary ledger must contain valid blocks and at least one titled section; found ${invalidRecords.length} invalid blocks.`,
    });
  }
  if (pending.length > 0) {
    blockers.push({
      code: "commentary_not_accepted",
      message: `All active commentary must be accepted or terminally rejected before screenplay generation; ${pending.length} of ${active.length} active blocks remain unreviewed or needs_split. Rejected blocks are excluded from playback.`,
    });
  }

  const roster = characters.dialogues.find((entry) => entry.dialogue === dialogue);
  const rosterIds = roster?.characterIds ?? [];
  const voiceOwnerIds = voiceOwnerCharacterIdsForDialogue(characters, dialogue);
  const reportedOnlyIds = reportedOnlyCharacterIdsForDialogue(characters, dialogue);
  const reviewRequiredIds = reviewRequiredVoiceCharacterIdsForDialogue(characters, dialogue);
  const voiceOwnerIdSet = new Set(voiceOwnerIds);
  const reportedOnlyIdSet = new Set(reportedOnlyIds);
  const reviewRequiredIdSet = new Set(reviewRequiredIds);
  const selectedIds = cast.voices.map((voice) => voice.characterId);
  const voiceOwnersMissingCast = voiceOwnerIds.filter((characterId) => !selectedIds.includes(characterId));
  if (voiceOwnersMissingCast.length > 0) {
    blockers.push({
      code: "missing_cast_voice",
      message: `${voiceOwnersMissingCast.length} voice-owner dialogue roles have no selected voice.`,
      character_ids: voiceOwnersMissingCast,
    });
  }
  if (reviewRequiredIds.length > 0) {
    blockers.push({
      code: "review_required_voice_owner",
      message: "Every dialogue appearance must resolve voice ownership before screenplay generation.",
      character_ids: reviewRequiredIds,
    });
  }

  const diagnostics = sourceDiagnostics(englishContent, characters, dialogue);
  let plan: SpeakerAttributionPlan | undefined;
  let attributionSha256: string | undefined;
  if (!existsSync(join(root, inputs.attribution_path))) {
    blockers.push({
      code: "missing_attribution_plan",
      message:
        `Missing accepted span-level attribution plan ${inputs.attribution_path}; aggregate TEI census and scratch prototypes are not sufficient production evidence.`,
    });
  } else {
    const attributionContent = readFileSync(join(root, inputs.attribution_path), "utf8");
    const result = readAttributionPlan(
      attributionContent,
      dialogue,
      sha256(englishContent),
    );
    if (!result.plan) {
      blockers.push({ code: "invalid_attribution_plan", message: result.errors.join(" ") });
    } else {
      plan = result.plan;
      attributionSha256 = sha256(attributionContent);
    }
  }

  const allCharacters = new Map(characters.characters.map((character) => [character.characterId, character]));
  const attributedIds = plan ? sortedUnique(plan.segments.map((segment) => segment.character_id)) : [];
  if (plan) {
    const requiredIds = sortedUnique([...attributedIds, plan.commentary_character_id]);
    const attributedReportedOnly = requiredIds.filter((characterId) => reportedOnlyIdSet.has(characterId));
    if (attributedReportedOnly.length > 0) {
      blockers.push({
        code: "reported_only_voice_owner",
        message:
          "Reported-only identities cannot own screenplay audio; their speech must retain the active voice-owner character.",
        character_ids: attributedReportedOnly,
      });
    }
    const attributedReviewRequired = requiredIds.filter((characterId) => reviewRequiredIdSet.has(characterId));
    if (
      attributedReviewRequired.length > 0 &&
      !blockers.some((blocker) => blocker.code === "review_required_voice_owner")
    ) {
      blockers.push({
        code: "review_required_voice_owner",
        message: "A review-required identity cannot own screenplay audio.",
        character_ids: attributedReviewRequired,
      });
    }
    const unresolved = requiredIds.filter((characterId) => {
      const character = allCharacters.get(characterId);
      return (
        !character ||
        !voiceOwnerIdSet.has(characterId) ||
        character.identityStatus !== "resolved" ||
        !character.appearances.some(
          (appearance) => appearance.dialogue === dialogue && appearance.editorialStatus === "resolved",
        )
      );
    });
    if (unresolved.length > 0) {
      blockers.push({
        code: "unresolved_character",
        message:
          "Every attributed source and commentary character must be a resolved voice-owner appearance for this dialogue.",
        character_ids: unresolved,
      });
    }
    const unrepresentedVoiceOwners = voiceOwnerIds.filter((characterId) => !requiredIds.includes(characterId));
    if (unrepresentedVoiceOwners.length > 0) {
      blockers.push({
        code: "incomplete_attribution",
        message: "Accepted attribution must represent every voice-owner role in the dialogue.",
        character_ids: unrepresentedVoiceOwners,
      });
    }
  }

  const fatalCodes = new Set([
    "missing_dependency",
    "invalid_character_catalog",
    "invalid_cast_catalog",
    "invalid_commentary",
    "commentary_not_accepted",
    "missing_commentary_quality_audit",
    "invalid_commentary_quality_audit",
    "commentary_quality_audit_not_accepted",
    "missing_attribution_plan",
    "invalid_attribution_plan",
    "reported_only_voice_owner",
    "review_required_voice_owner",
    "unresolved_character",
    "incomplete_attribution",
    "chapter_mapping_failure",
  ]);
  let screenplay: AudioScript | undefined;
  if (
    plan &&
    attributionSha256 &&
    commentaryQualityAuditSha256 &&
    commentaryQualityAuditAccepted &&
    !blockers.some((blocker) => fatalCodes.has(blocker.code))
  ) {
    try {
      screenplay = buildScreenplay(
        dialogue,
        englishContent,
        stephanusContent,
        commentaryContent,
        commentaryQualityAuditSha256,
        castContent,
        plan,
        attributionSha256,
        characters,
        accepted,
        blockers,
      );
    } catch (error) {
      blockers.push({
        code: "chapter_mapping_failure",
        message: `Cannot map screenplay chapters: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  const structuralIssues = screenplay
    ? validateAudioScript(`audio/scripts/${dialogue}.json`, JSON.stringify(screenplay))
    : [];
  if (screenplay && structuralIssues.length > 0) {
    blockers.push({
      code: "screenplay_contract_failure",
      message: `Generated screenplay has ${structuralIssues.length} structural contract issue(s).`,
    });
  }
  const repositoryIssues = screenplay
    ? validateAudioScriptArtifact(`audio/scripts/${dialogue}.json`, JSON.stringify(screenplay))
    : [];
  const productionEligible = screenplay !== undefined && repositoryIssues.length === 0 && blockers.length === 0;
  const draftEligible =
    screenplay !== undefined &&
    structuralIssues.length === 0 &&
    repositoryIssues.every((issue) => issue.code === "cast_resolution_failure");
  if (screenplay && !productionEligible && !draftEligible && !blockers.some((blocker) => blocker.code === "screenplay_contract_failure")) {
    blockers.push({
      code: "screenplay_contract_failure",
      message: "Generated draft has a non-cast repository contract failure and cannot be materialized.",
    });
  }
  return {
    schema_version: 1,
    artifact_class: "screenplay-generation-report",
    dialogue,
    dry_run: true,
    counts_as_production_screenplay: false,
    screenplay_status: productionEligible ? "production-contract-valid" : draftEligible ? "draft-ready" : "blocked",
    production_eligible: productionEligible,
    inputs,
    commentary: {
      block_count: active.length,
      accepted_block_count: accepted.length,
      section_count: sections.length,
      fully_accepted: accepted.length > 0 && pending.length === 0,
      quality_audit_sha256: commentaryQualityAuditSha256 ?? null,
      quality_audit_accepted: commentaryQualityAuditAccepted,
    },
    characters: {
      roster_character_ids: rosterIds,
      voice_owner_character_ids: voiceOwnerIds,
      reported_only_character_ids: reportedOnlyIds,
      review_required_voice_character_ids: reviewRequiredIds,
      attributed_character_ids: attributedIds,
      commentary_character_id: plan?.commentary_character_id ?? null,
      selected_cast_character_ids: selectedIds,
      missing_cast_character_ids: sortedUnique(
        blockers.flatMap((blocker) => (blocker.code === "missing_cast_voice" ? blocker.character_ids ?? [] : [])),
      ),
    },
    source_diagnostics: diagnostics,
    blockers,
    structural_validation_issues: structuralIssues,
    repository_validation_issues: repositoryIssues,
    ...(screenplay ? { prospective_screenplay: screenplay } : {}),
  };
}

export function writeDraftScreenplay(report: ScreenplayGenerationReport) {
  if (!report.prospective_screenplay || report.screenplay_status === "blocked") {
    throw new Error(`Cannot write ${report.dialogue} draft: source attribution/commentary inputs are incomplete.`);
  }
  const relativePath = `scratch/audio-screenplays/${report.dialogue}.draft.json`;
  const { absolutePath } = normalizeRepoPath(relativePath);
  atomicWrite(absolutePath, `${JSON.stringify(report.prospective_screenplay, null, 2)}\n`);
  return relativePath;
}

export function writeProductionScreenplay(report: ScreenplayGenerationReport) {
  if (!report.production_eligible || !report.prospective_screenplay) {
    throw new Error(`Cannot publish ${report.dialogue} screenplay: the full repository contract is not valid.`);
  }
  const relativePath = `audio/scripts/${report.dialogue}.json`;
  const { absolutePath } = normalizeRepoPath(relativePath);
  const content = `${JSON.stringify(report.prospective_screenplay, null, 2)}\n`;
  const issues = validateAudioScriptArtifact(relativePath, content);
  if (issues.length > 0) {
    throw new Error(`Refusing production write after ${issues.length} validation issue(s).`);
  }
  atomicWrite(absolutePath, content);
  return relativePath;
}

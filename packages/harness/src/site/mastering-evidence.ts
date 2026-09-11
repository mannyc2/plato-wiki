import { createHash } from "node:crypto";
import { closeSync, existsSync, lstatSync, openSync, readFileSync, readSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { parseAudioQa } from "../audio-production.js";
import { getRepoRoot } from "../paths.js";
import type { RecordingManifest, RecordingProduction } from "../wiki/recording-manifest.js";

const SAMPLE_RATE = 48_000;
const MASTERING_PLAN_SCHEMA_VERSION = 7;
const MASTERING_SCHEMA_VERSION = 6;
const MASTERING_IMPLEMENTATION_VERSION = 8;
const SHA256 = /^[a-f0-9]{64}$/u;
const RESULT_STATUS = "mastered-mechanical-evidence-only";
const QA_STATUS = "mechanical-pass-unaccepted";
const MECHANICAL_ACCEPTANCE_REASON =
  "mechanical evidence only; accepted production requires separate ASR and explicit production authorization";

type JsonObject = Record<string, unknown>;

export type ValidatedRecordingEvidence = {
  publicationPath: string;
  workingMasterPath: string;
};

function object(value: unknown, location: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${location} must be an object`);
  }
  return value as JsonObject;
}

function exactFields(value: JsonObject, fields: readonly string[], location: string) {
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  if (actual.length !== expected.length || actual.some((field, index) => field !== expected[index])) {
    throw new Error(`${location} fields are invalid`);
  }
}

function sha256(value: unknown, location: string): string {
  if (typeof value !== "string" || !SHA256.test(value)) throw new Error(`${location} is not a lowercase SHA-256`);
  return value;
}

function positiveInteger(value: unknown, location: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) throw new Error(`${location} must be a positive safe integer`);
  return value as number;
}

function nonNegativeInteger(value: unknown, location: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${location} must be a non-negative safe integer`);
  return value as number;
}

function finiteNumber(value: unknown, location: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${location} must be finite`);
  return value;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const record = value as JsonObject;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("canonical JSON cannot contain undefined");
  return encoded;
}

function streamFileSha256(path: string) {
  const descriptor = openSync(path, "r");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  const hash = createHash("sha256");
  try {
    while (true) {
      const bytesRead = readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
    }
  } finally {
    closeSync(descriptor);
  }
  return hash.digest("hex");
}

function readAt(descriptor: number, position: number, length: number) {
  const buffer = Buffer.alloc(length);
  let offset = 0;
  while (offset < length) {
    const bytesRead = readSync(descriptor, buffer, offset, length - offset, position + offset);
    if (bytesRead === 0) break;
    offset += bytesRead;
  }
  return buffer.subarray(0, offset);
}

function inspectPcm24Wav(path: string) {
  const bytes = statSync(path).size;
  const descriptor = openSync(path, "r");
  try {
    const header = readAt(descriptor, 0, 12);
    const container = header.subarray(0, 4).toString("ascii");
    if (
      header.length !== 12 ||
      (container !== "RIFF" && container !== "RF64") ||
      header.subarray(8, 12).toString("ascii") !== "WAVE" ||
      (container === "RIFF" && header.readUInt32LE(4) + 8 !== bytes) ||
      (container === "RF64" && header.readUInt32LE(4) !== 0xffff_ffff)
    ) {
      throw new Error("working master is not a complete RIFF or RF64 WAVE file");
    }
    let position = 12;
    let formatSeen = false;
    let dataFrames: number | undefined;
    let dataOffsetBytes: number | undefined;
    let fmtChunkSizeBytes: number | undefined;
    let formatTag: "pcm" | "extensible-pcm" | undefined;
    const chunkIds: string[] = [];
    let dataChunkUsedSentinel = false;
    let ds64: { riffBytes: number; dataBytes: number; sampleFrames: number } | undefined;
    while (position + 8 <= bytes) {
      const chunkHeader = readAt(descriptor, position, 8);
      if (chunkHeader.length !== 8) throw new Error("working master has a truncated WAV chunk header");
      const id = chunkHeader.subarray(0, 4).toString("ascii");
      chunkIds.push(id);
      const declaredSize = chunkHeader.readUInt32LE(4);
      const payload = position + 8;
      if (id === "ds64") {
        if (container !== "RF64" || position !== 12 || ds64 || declaredSize !== 28) throw new Error("working master RF64 ds64 chunk is invalid");
        const value = readAt(descriptor, payload, 28);
        const riffBytes = value.readBigUInt64LE(0);
        const dataBytes = value.readBigUInt64LE(8);
        const sampleFrames = value.readBigUInt64LE(16);
        const tableLength = value.readUInt32LE(24);
        if (
          riffBytes > BigInt(Number.MAX_SAFE_INTEGER) ||
          dataBytes > BigInt(Number.MAX_SAFE_INTEGER) ||
          sampleFrames > BigInt(Number.MAX_SAFE_INTEGER) ||
          tableLength !== 0 ||
          28 + tableLength * 12 > declaredSize
        ) {
          throw new Error("working master RF64 ds64 sizes are unsafe or truncated");
        }
        ds64 = {
          riffBytes: Number(riffBytes),
          dataBytes: Number(dataBytes),
          sampleFrames: Number(sampleFrames),
        };
      }
      let size = declaredSize;
      if (declaredSize === 0xffff_ffff) {
        if (id !== "data" || !ds64) throw new Error(`working master RF64 ${id} chunk has an unresolved sentinel size`);
        size = ds64.dataBytes;
        dataChunkUsedSentinel = true;
      }
      const next = payload + size + (size & 1);
      if (next > bytes) throw new Error(`working master WAV ${id} chunk extends beyond the file`);
      if (id === "fmt ") {
        if (formatSeen || (size !== 16 && size !== 40)) throw new Error("working master WAV format chunk is invalid");
        const format = readAt(descriptor, payload, size);
        const pcmSubformat = Buffer.from([
          0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00,
          0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71,
        ]);
        const exactRf64Extensible =
          container === "RF64" &&
          size === 40 &&
          format.readUInt16LE(0) === 0xfffe &&
          format.readUInt16LE(16) === 22 &&
          format.readUInt16LE(18) === 24 &&
          [0, 4].includes(format.readUInt32LE(20)) &&
          format.subarray(24, 40).equals(pcmSubformat);
        const exactClassicPcm = size === 16 && format.readUInt16LE(0) === 1;
        if (
          (!exactRf64Extensible && !exactClassicPcm) ||
          format.readUInt16LE(2) !== 1 ||
          format.readUInt32LE(4) !== SAMPLE_RATE ||
          format.readUInt32LE(8) !== SAMPLE_RATE * 3 ||
          format.readUInt16LE(12) !== 3 ||
          format.readUInt16LE(14) !== 24
        ) {
          throw new Error("working master must be exact mono 48 kHz PCM24 WAV");
        }
        formatSeen = true;
        fmtChunkSizeBytes = size;
        formatTag = exactClassicPcm ? "pcm" : "extensible-pcm";
      } else if (id === "data") {
        if (!formatSeen || dataFrames !== undefined || size === 0 || size % 3 !== 0) {
          throw new Error("working master WAV data chunk is invalid");
        }
        dataOffsetBytes = payload;
        dataFrames = size / 3;
        if ((size & 1) && readAt(descriptor, payload + size, 1)[0] !== 0) {
          throw new Error("working master RF64 data padding must be zero");
        }
      } else if (id !== "ds64" && container === "RF64") {
        throw new Error(`working master RF64 contains unapproved chunk ${id}`);
      }
      position = next;
    }
    if (position !== bytes || !formatSeen || dataFrames === undefined) {
      throw new Error("working master WAV is missing exact format or PCM data evidence");
    }
    if (
      container === "RF64" &&
      (!ds64 ||
        !dataChunkUsedSentinel ||
        ds64.riffBytes + 8 !== bytes ||
        ds64.dataBytes !== dataFrames * 3 ||
        ds64.sampleFrames !== dataFrames ||
        fmtChunkSizeBytes === undefined ||
        formatTag === undefined ||
        dataOffsetBytes !== 64 + fmtChunkSizeBytes ||
        !sameJson(chunkIds, ["ds64", "fmt ", "data"]))
    ) {
      throw new Error("working master RF64 ds64 evidence differs from the exact file and PCM frame count");
    }
    return {
      container,
      bytes,
      frames: dataFrames,
      durationSeconds: dataFrames / SAMPLE_RATE,
      rf64:
        container === "RF64"
          ? {
              profile: "rf64-pcm24-v1",
              riff_size_bytes: ds64!.riffBytes,
              data_size_bytes: ds64!.dataBytes,
              sample_count: ds64!.sampleFrames,
              data_offset_bytes: dataOffsetBytes!,
              fmt_chunk_size_bytes: fmtChunkSizeBytes!,
              format_tag: formatTag!,
              chunk_ids: chunkIds,
            }
          : null,
    };
  } finally {
    closeSync(descriptor);
  }
}

function sameJson(left: unknown, right: unknown) {
  return canonicalJson(left) === canonicalJson(right);
}

function validateImplementation(value: unknown) {
  const implementation = object(value, "mastering implementation");
  exactFields(implementation, ["name", "version", "code_sha256"], "mastering implementation");
  if (
    implementation.name !== "plato-master-audio" ||
    implementation.version !== MASTERING_IMPLEMENTATION_VERSION
  ) {
    throw new Error("mastering implementation name/version is stale");
  }
  sha256(implementation.code_sha256, "mastering implementation code_sha256");
  return implementation;
}

function validateAnalysisRuntime(value: unknown) {
  const runtime = object(value, "mastering analysis_runtime");
  exactFields(
    runtime,
    [
      "name",
      "version",
      "distribution_root",
      "module_origin",
      "module_origin_sha256",
      "record_sha256",
      "inventory_sha256",
      "file_count",
      "binary_file_count",
      "total_bytes",
    ],
    "mastering analysis_runtime",
  );
  if (
    runtime.name !== "numpy" ||
    runtime.version !== "2.2.6" ||
    typeof runtime.distribution_root !== "string" ||
    !isAbsolute(runtime.distribution_root) ||
    typeof runtime.module_origin !== "string" ||
    !isAbsolute(runtime.module_origin) ||
    !insideRoot(runtime.distribution_root, runtime.module_origin) ||
    relative(runtime.distribution_root, runtime.module_origin).split(sep).join("/") !== "numpy/__init__.py"
  ) {
    throw new Error("mastering analysis_runtime NumPy identity or paths are invalid");
  }
  for (const field of ["module_origin_sha256", "record_sha256", "inventory_sha256"] as const) {
    sha256(runtime[field], `mastering analysis_runtime ${field}`);
  }
  for (const field of ["file_count", "binary_file_count", "total_bytes"] as const) {
    positiveInteger(runtime[field], `mastering analysis_runtime ${field}`);
  }
  if ((runtime.binary_file_count as number) > (runtime.file_count as number)) {
    throw new Error("mastering analysis_runtime binary count exceeds its file inventory");
  }
  return runtime;
}

function insideRoot(root: string, target: string) {
  const child = relative(root, target);
  return child === "" || (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`));
}

export function resolveRecordingArtifactRoot(artifactRoot: string | undefined) {
  if (!artifactRoot) {
    throw new Error(
      "Playable recording manifests require an explicit recordingArtifactRoot or PLATO_RECORDING_ARTIFACT_ROOT.",
    );
  }
  if (!isAbsolute(artifactRoot)) throw new Error(`Recording artifact root must be an absolute path: ${artifactRoot}`);
  const configured = resolve(artifactRoot);
  if (!existsSync(configured) || lstatSync(configured).isSymbolicLink() || !statSync(configured).isDirectory()) {
    throw new Error(`Recording artifact root does not exist, is symlinked, or is not a directory: ${configured}`);
  }
  return realpathSync(configured);
}

function resolveEvidenceFile(root: string, relativePath: string, label: string) {
  const configured = resolve(root, relativePath);
  if (!insideRoot(root, configured)) throw new Error(`${label} escapes the configured artifact root: ${relativePath}`);
  if (!existsSync(configured)) throw new Error(`${label} is missing: ${configured}`);
  if (lstatSync(configured).isSymbolicLink() || !statSync(configured).isFile()) {
    throw new Error(`${label} must be a regular non-symlink file: ${configured}`);
  }
  const resolved = realpathSync(configured);
  if (!insideRoot(root, resolved)) throw new Error(`${label} resolves outside the configured artifact root: ${relativePath}`);
  return resolved;
}

function readJson(path: string, label: string) {
  try {
    return object(JSON.parse(readFileSync(path, "utf8")) as unknown, label);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`${label} is malformed JSON: ${error.message}`);
    throw error;
  }
}

const CHAPTER_EVIDENCE_FIELDS = [
  "chapter_id",
  "input_sha256",
  "audio_sha256",
  "frames",
  "timing_sha256",
  "sidecar_sha256",
] as const;
const TIMELINE_FIELDS = [
  ...CHAPTER_EVIDENCE_FIELDS,
  "start_frame",
  "end_frame",
  "start_seconds",
  "end_seconds",
] as const;

function validateRendererAndTimeline(value: JsonObject, timelineValue: unknown, timelineDigestValue: unknown) {
  exactFields(
    value,
    ["dialogue", "render_plan_sha256", "render_plan_artifact_sha256", "chapters", "complete"],
    "mastering renderer",
  );
  sha256(value.render_plan_sha256, "mastering renderer render_plan_sha256");
  sha256(value.render_plan_artifact_sha256, "mastering renderer render_plan_artifact_sha256");
  if (!Array.isArray(value.chapters) || value.chapters.length === 0) throw new Error("mastering renderer chapters are empty");
  const chapters = value.chapters.map((raw, index) => {
    const chapter = object(raw, `mastering renderer chapter ${index + 1}`);
    exactFields(chapter, [...CHAPTER_EVIDENCE_FIELDS, "duration_seconds"], `mastering renderer chapter ${index + 1}`);
    if (typeof chapter.chapter_id !== "string" || chapter.chapter_id.length === 0) throw new Error("mastering chapter id is invalid");
    const frames = positiveInteger(chapter.frames, `mastering chapter ${chapter.chapter_id} frames`);
    if (finiteNumber(chapter.duration_seconds, `mastering chapter ${chapter.chapter_id} duration`) !== frames / SAMPLE_RATE) {
      throw new Error(`mastering chapter ${chapter.chapter_id} duration differs from its frames`);
    }
    for (const field of ["input_sha256", "audio_sha256", "timing_sha256", "sidecar_sha256"] as const) {
      sha256(chapter[field], `mastering chapter ${chapter.chapter_id} ${field}`);
    }
    return chapter;
  });
  const chapterIds = chapters.map((chapter) => chapter.chapter_id as string);
  if (new Set(chapterIds).size !== chapterIds.length) throw new Error("mastering chapter ids are duplicated");

  const complete = object(value.complete, "mastering renderer complete");
  exactFields(
    complete,
    [
      "input_sha256",
      "audio_sha256",
      "frames",
      "duration_seconds",
      "timing_sha256",
      "sidecar_sha256",
      "chapter_starts_sha256",
      "container_profile",
    ],
    "mastering renderer complete",
  );
  if (complete.container_profile !== "rf64-pcm24") {
    throw new Error("mastering renderer complete container profile is not forced RF64 PCM24");
  }
  const completeFrames = positiveInteger(complete.frames, "mastering renderer complete frames");
  if (finiteNumber(complete.duration_seconds, "mastering renderer complete duration") !== completeFrames / SAMPLE_RATE) {
    throw new Error("mastering renderer complete duration differs from its frames");
  }
  for (const field of ["input_sha256", "audio_sha256", "timing_sha256", "sidecar_sha256", "chapter_starts_sha256"] as const) {
    sha256(complete[field], `mastering renderer complete ${field}`);
  }

  if (!Array.isArray(timelineValue) || timelineValue.length !== chapters.length) {
    throw new Error("mastering chapter timeline does not cover every renderer chapter");
  }
  const timelineDigest = sha256(timelineDigestValue, "mastering chapter_timeline_sha256");
  let priorEnd = 0;
  const timeline = timelineValue.map((raw, index) => {
    const item = object(raw, `mastering chapter timeline ${index + 1}`);
    exactFields(item, TIMELINE_FIELDS, `mastering chapter timeline ${index + 1}`);
    const chapter = chapters[index]!;
    for (const field of CHAPTER_EVIDENCE_FIELDS) {
      if (item[field] !== chapter[field]) throw new Error(`mastering timeline item ${index + 1} differs from renderer chapter evidence`);
    }
    const start = nonNegativeInteger(item.start_frame, `mastering timeline item ${index + 1} start_frame`);
    const end = positiveInteger(item.end_frame, `mastering timeline item ${index + 1} end_frame`);
    if ((index === 0 && start !== 0) || start < priorEnd || end !== start + (chapter.frames as number) || end > completeFrames) {
      throw new Error(`mastering timeline item ${index + 1} frame interval is invalid`);
    }
    if (
      finiteNumber(item.start_seconds, `mastering timeline item ${index + 1} start_seconds`) !== start / SAMPLE_RATE ||
      finiteNumber(item.end_seconds, `mastering timeline item ${index + 1} end_seconds`) !== end / SAMPLE_RATE
    ) {
      throw new Error(`mastering timeline item ${index + 1} seconds differ from its frames`);
    }
    priorEnd = end;
    return item;
  });
  if (priorEnd !== completeFrames) throw new Error("mastering chapter timeline does not end at the complete renderer frame count");
  return { chapters, complete, timeline, timelineDigest };
}

type SourceBinding = ReturnType<typeof validateRendererAndTimeline> & { sourceFrames: number };

function validateRepairedSource(renderer: JsonObject, source: JsonObject, timelineValue: unknown, timelineDigest: unknown, boundariesValue: unknown, edit: JsonObject): SourceBinding {
  exactFields(edit, ["schema_version", "kind", "implementation", "original", "base_edit", "repairs", "derived", "human_listening_performed"], "utterance repair document");
  if (edit.schema_version !== 1 || edit.human_listening_performed !== false) throw new Error("utterance repair schema/listening claim is invalid");
  const implementation = object(edit.implementation, "utterance repair implementation");
  exactFields(implementation, ["source_audio_repairs_sha256"], "utterance repair implementation");
  sha256(implementation.source_audio_repairs_sha256, "utterance repair implementation hash");
  const baseEdit = object(edit.base_edit, "utterance repair base edit");
  if (baseEdit.kind !== "mechanically-reviewed-derived-pcm" || !sameJson(baseEdit.original, edit.original)) throw new Error("utterance repair requires its original conservative edit evidence");
  const baseDerived = object(baseEdit.derived, "utterance repair base result");
  const reference = object(source.edit_manifest, "utterance repair reference");
  exactFields(reference, ["path", "sha256", "document"], "utterance repair reference");
  const base = validateSourceAudio(renderer, { ...source, audio_sha256: baseDerived.audio_sha256, frames: baseDerived.frames, edit_manifest: { ...reference, document: baseEdit } }, baseDerived.chapter_timeline, timelineDigest, baseDerived.boundaries);
  const cuts = (baseEdit.cuts as unknown[]).map((row) => object(row, "repair base cut"));
  const baseFrame = (frame: number) => frame - cuts.reduce((sum, row) => sum + Math.max(0, Math.min(frame, row.end_frame as number) - (row.start_frame as number)), 0);
  const protections = (baseEdit.protected_geometry as unknown[]).map((value) => {
    const row = object(value, "repair base protection");
    return { start: baseFrame(row.start_frame as number), end: baseFrame(row.end_frame as number) };
  });
  if (!Array.isArray(edit.repairs) || edit.repairs.length === 0) throw new Error("utterance replacements are missing");
  let previousEnd = 0;
  const repairs = edit.repairs.map((value) => {
    const row = object(value, "utterance replacement");
    exactFields(row, ["start_frame", "end_frame", "audio_path", "audio_sha256", "frames", "source_pcm_sha256", "entry_id", "canonical_text", "reason", "evidence"], "utterance replacement");
    const start = nonNegativeInteger(row.start_frame, "replacement start"), end = positiveInteger(row.end_frame, "replacement end");
    const frames = positiveInteger(row.frames, "replacement frames");
    if (start < previousEnd || start >= end || end > base.sourceFrames || protections.some((span) => start < span.end && span.start < end)) throw new Error("replacement overlaps protected or out-of-range source geometry");
    previousEnd = end;
    if (typeof row.audio_path !== "string" || !isAbsolute(row.audio_path)) throw new Error("replacement audio path must be absolute");
    sha256(row.audio_sha256, "replacement audio hash");
    sha256(row.source_pcm_sha256, "replacement source PCM hash");
    for (const key of ["entry_id", "canonical_text", "reason"]) if (typeof row[key] !== "string" || (row[key] as string).trim().length === 0) throw new Error("replacement requires canonical text and a reason");
    if (!Array.isArray(row.evidence)) throw new Error("replacement evidence is missing");
    const roles = new Set<string>();
    for (const raw of row.evidence) {
      const item = object(raw, "replacement evidence");
      exactFields(item, ["path", "sha256", "role"], "replacement evidence");
      if (typeof item.path !== "string" || !isAbsolute(item.path) || typeof item.role !== "string" || item.role.trim().length === 0) throw new Error("replacement evidence path/role is invalid");
      sha256(item.sha256, "replacement evidence hash");
      roles.add(item.role);
    }
    if (!["synthesis", "transcription", "source-task"].every((role) => roles.has(role))) throw new Error("replacement lacks synthesis, transcription or source-task evidence");
    return { start, end, frames };
  });
  const map = (frame: number) => {
    if (repairs.some((row) => row.start < frame && frame < row.end)) throw new Error("replacement intersects a projected boundary");
    return frame + repairs.reduce((sum, row) => sum + (row.end <= frame ? row.frames - (row.end - row.start) : 0), 0);
  };
  const timeline = base.timeline.map((row) => {
    const start = map(row.start_frame as number), end = map(row.end_frame as number);
    return { chapter_id: row.chapter_id, start_frame: start, end_frame: end, frames: end - start, start_seconds: start / SAMPLE_RATE, end_seconds: end / SAMPLE_RATE };
  });
  const boundaries = (baseDerived.boundaries as unknown[]).map((value) => {
    const row = object(value, "repair base boundary");
    const start = map(row.start_frame as number), end = map(row.end_frame as number);
    if (end - start !== (row.end_frame as number) - (row.start_frame as number)) throw new Error("replacement changes a declared pause");
    const result: JsonObject = { ...row, start_frame: start, end_frame: end };
    if ("start_seconds" in row) result.start_seconds = start / SAMPLE_RATE;
    if ("end_seconds" in row) result.end_seconds = end / SAMPLE_RATE;
    return result;
  });
  const sourceFrames = map(base.sourceFrames);
  const derived = object(edit.derived, "utterance repair derived result");
  exactFields(derived, ["audio_sha256", "frames", "removed_frames", "chapter_timeline", "chapter_timeline_sha256", "boundaries", "boundaries_sha256"], "utterance repair derived result");
  if (source.frames !== sourceFrames || derived.frames !== sourceFrames || derived.audio_sha256 !== source.audio_sha256 || derived.removed_frames !== (base.complete.frames as number) - sourceFrames || !sameJson(derived.chapter_timeline, timeline) || !sameJson(timelineValue, timeline) || !sameJson(derived.boundaries, boundaries) || !sameJson(boundariesValue, boundaries)) throw new Error("utterance repair output differs from its exact splice projection");
  sha256(derived.chapter_timeline_sha256, "repaired timeline hash");
  sha256(derived.boundaries_sha256, "repaired boundaries hash");
  return { ...base, timeline, sourceFrames };
}

function validateSourceAudio(renderer: JsonObject, value: unknown, timelineValue: unknown, timelineDigestValue: unknown, boundariesValue: unknown): SourceBinding {
  const source = object(value, "mastering source_audio");
  exactFields(source, ["audio_path", "audio_sha256", "frames", "renderer_chapter_timeline", "renderer_boundaries", "edit_manifest"], "mastering source_audio");
  if (typeof source.audio_path !== "string" || !isAbsolute(source.audio_path)) throw new Error("mastering source audio path must be absolute");
  sha256(source.audio_sha256, "mastering source audio hash");
  const sourceFrames = positiveInteger(source.frames, "mastering source frames");
  if (source.edit_manifest !== null) {
    const reference = object(source.edit_manifest, "source edit reference");
    const edit = object(reference.document, "source edit document");
    if (edit.kind === "utterance-repaired-derived-pcm") return validateRepairedSource(renderer, source, timelineValue, timelineDigestValue, boundariesValue, edit);
  }
  const binding = validateRendererAndTimeline(renderer, source.renderer_chapter_timeline, timelineDigestValue);
  if (!Array.isArray(source.renderer_boundaries)) throw new Error("mastering renderer boundaries must be an array");
  const originalFrames = binding.complete.frames as number;
  let cuts: { start: number; end: number }[] = [];
  let edit: JsonObject | undefined;
  const originalBoundaries = source.renderer_boundaries.map((row) => object(row, "original source boundary"));
  const interval = (row: JsonObject, empty = false) => {
    const start = nonNegativeInteger(row.start_frame, "source interval start");
    const end = nonNegativeInteger(row.end_frame, "source interval end");
    if (end > originalFrames || start > end || (!empty && start === end)) throw new Error("source interval is outside original frames");
    return { start, end };
  };
  const protectedIntervals = originalBoundaries.map((row) => {
    const { start, end } = interval(row, true);
    const crossfade = finiteNumber(row.crossfade_ms ?? 0, "source boundary crossfade");
    if (crossfade < 0) throw new Error("source boundary crossfade is negative");
    const expansion = Math.max(1, Math.ceil(crossfade * 48));
    return { start: Math.max(0, start - expansion), end: Math.min(originalFrames, end + expansion) };
  });
  const chapterProtections = binding.timeline.flatMap((chapter) => [chapter.start_frame, chapter.end_frame].map((value) => {
    const edge = nonNegativeInteger(value, "source chapter edge");
    return { start: Math.max(0, edge - 1), end: Math.min(originalFrames, edge + 1) };
  }));
  if (source.edit_manifest === null) {
    if (source.audio_sha256 !== binding.complete.audio_sha256 || sourceFrames !== originalFrames) {
      throw new Error("unedited source audio differs from the original renderer");
    }
  } else {
    const reference = object(source.edit_manifest, "source edit manifest reference");
    exactFields(reference, ["path", "sha256", "document"], "source edit manifest reference");
    if (typeof reference.path !== "string" || !isAbsolute(reference.path)) throw new Error("source edit manifest path must be absolute");
    sha256(reference.sha256, "source edit manifest hash");
    edit = object(reference.document, "source edit document");
    exactFields(edit, ["schema_version", "kind", "implementation", "original", "cuts", "policy", "protected_spans", "protected_geometry", "derived"], "source edit document");
    if (edit.schema_version !== 1 || edit.kind !== "mechanically-reviewed-derived-pcm") throw new Error("source edit schema is stale");
    const implementation = object(edit.implementation, "source edit implementation");
    exactFields(implementation, ["source_audio_edits_sha256", "pcm_edits_sha256"], "source edit implementation");
    Object.values(implementation).forEach((hash) => sha256(hash, "source edit implementation hash"));
    const original = object(edit.original, "source edit original");
    exactFields(original, ["path", "audio_sha256", "frames", "render_plan_artifact_sha256", "chapter_timeline", "chapter_timeline_sha256", "boundaries", "boundaries_sha256"], "source edit original");
    if (typeof original.path !== "string" || !isAbsolute(original.path) || original.path === source.audio_path ||
        original.audio_sha256 !== binding.complete.audio_sha256 || original.frames !== originalFrames ||
        original.render_plan_artifact_sha256 !== renderer.render_plan_artifact_sha256 ||
        !sameJson(original.chapter_timeline, binding.timeline) || !sameJson(original.boundaries, originalBoundaries)) {
      throw new Error("source edit original evidence differs from the renderer");
    }
    for (const key of ["chapter_timeline_sha256", "boundaries_sha256"]) sha256(original[key], `source edit original ${key}`);
    const policy = object(edit.policy, "source edit policy");
    exactFields(policy, ["max_abs_amplitude", "guard_frames", "mechanical_review_basis", "human_listening_performed"], "source edit policy");
    if (nonNegativeInteger(policy.max_abs_amplitude, "source edit amplitude") > 4_717 ||
        positiveInteger(policy.guard_frames, "source edit guards") < 960 || policy.human_listening_performed !== false ||
        typeof policy.mechanical_review_basis !== "string" || policy.mechanical_review_basis.trim().length === 0) {
      throw new Error("source edit mechanical policy is invalid");
    }
    if (!Array.isArray(edit.cuts) || !Array.isArray(edit.protected_spans)) throw new Error("source edit cut/protection rows are invalid");
    cuts = edit.cuts.map((raw) => {
      const row = object(raw, "source edit cut");
      exactFields(row, ["start_frame", "end_frame", "reason"], "source edit cut");
      if (typeof row.reason !== "string" || row.reason.trim().length === 0) throw new Error("source edit cut requires a reason");
      return interval(row);
    });
    const protectedSpans = edit.protected_spans.map((raw) => {
      const row = object(raw, "source edit protected span");
      exactFields(row, ["start_frame", "end_frame"], "source edit protected span");
      return interval(row);
    });
    const protections = [...protectedSpans, ...chapterProtections, ...protectedIntervals];
    if (!sameJson(edit.protected_geometry, protections.map(({ start, end }) => ({ start_frame: start, end_frame: end })))) {
      throw new Error("source edit protected geometry differs from declared source geometry");
    }
    let previousEnd = 0;
    for (const cut of cuts) {
      if (cut.start < previousEnd || protections.some((span) => cut.start < span.end && span.start < cut.end)) {
        throw new Error("source edit cuts overlap or delete protected source geometry");
      }
      previousEnd = cut.end;
    }
  }
  const mapFrame = (frame: number) => frame - cuts.reduce((sum, cut) => sum + Math.max(0, Math.min(frame, cut.end) - cut.start), 0);
  if (sourceFrames !== mapFrame(originalFrames)) throw new Error("source frames differ from exact cut projection");
  const timeline = binding.timeline.map((chapter) => {
    const start = mapFrame(chapter.start_frame as number), end = mapFrame(chapter.end_frame as number);
    if (end <= start) throw new Error("source edit deletes a chapter");
    return { chapter_id: chapter.chapter_id, start_frame: start, end_frame: end, frames: end - start, start_seconds: start / SAMPLE_RATE, end_seconds: end / SAMPLE_RATE };
  });
  const boundaries = originalBoundaries.map((row) => {
    const { start, end } = interval(row, true);
    const mapped: JsonObject = { ...row, start_frame: mapFrame(start), end_frame: mapFrame(end) };
    if (mapFrame(end) - mapFrame(start) !== end - start) throw new Error("source edit changes declared pause length");
    if ("start_seconds" in row) mapped.start_seconds = mapFrame(start) / SAMPLE_RATE;
    if ("end_seconds" in row) mapped.end_seconds = mapFrame(end) / SAMPLE_RATE;
    return mapped;
  });
  if (!sameJson(timelineValue, timeline) || !sameJson(boundariesValue, boundaries)) throw new Error("mastering production timeline/boundaries differ from exact source projection");
  if (edit) {
    const derived = object(edit.derived, "source edit derived");
    exactFields(derived, ["audio_sha256", "frames", "removed_frames", "chapter_timeline", "chapter_timeline_sha256", "boundaries", "boundaries_sha256"], "source edit derived");
    if (derived.audio_sha256 !== source.audio_sha256 || derived.frames !== sourceFrames || derived.removed_frames !== originalFrames - sourceFrames ||
        !sameJson(derived.chapter_timeline, timeline) || !sameJson(derived.boundaries, boundaries)) throw new Error("source edit derived evidence differs from exact projection");
    for (const key of ["chapter_timeline_sha256", "boundaries_sha256"]) sha256(derived[key], `source edit derived ${key}`);
  }
  return { ...binding, timeline, sourceFrames };
}

function validateOutputBinding(
  outputsValue: unknown,
  production: RecordingProduction,
  manifest: RecordingManifest,
  workingBytes: number,
  workingFrames: number,
  workingRf64: unknown,
  publicationBytes: number,
  completeFrames: number,
) {
  const outputs = object(outputsValue, "mastering outputs");
  exactFields(outputs, ["working_master", "publication"], "mastering outputs");
  const working = object(outputs.working_master, "mastering working_master output");
  const publication = object(outputs.publication, "mastering publication output");
  exactFields(working, ["filename", "sha256", "probe", "pcm"], "mastering working_master output");
  exactFields(publication, ["filename", "sha256", "probe", "duration_delta_seconds"], "mastering publication output");
  if (working.filename !== "master.wav" || working.sha256 !== production.working_master_sha256) {
    throw new Error("mastering working-master output identity differs from the recording manifest");
  }
  if (publication.filename !== "publication.mp3" || publication.sha256 !== production.publication_sha256) {
    throw new Error("mastering publication output identity differs from the recording manifest");
  }
  const workingProbe = object(working.probe, "mastering working-master probe");
  const publicationProbe = object(publication.probe, "mastering publication probe");
  const probeFields = [
    "format_name", "container_profile", "rf64", "duration_seconds", "size_bytes", "codec_name", "sample_format",
    "sample_rate", "channels", "bits_per_sample", "bit_rate",
  ] as const;
  exactFields(workingProbe, probeFields, "mastering working-master probe");
  exactFields(publicationProbe, probeFields, "mastering publication probe");
  if (
    workingProbe.format_name !== "wav" ||
    workingProbe.container_profile !== "rf64-pcm24-v1" ||
    !sameJson(workingProbe.rf64, workingRf64) ||
    workingProbe.codec_name !== "pcm_s24le" ||
    workingProbe.sample_rate !== SAMPLE_RATE ||
    workingProbe.channels !== 1 ||
    workingProbe.bits_per_sample !== 24 ||
    workingProbe.bit_rate !== 1_152_000 ||
    workingProbe.size_bytes !== workingBytes
  ) {
    throw new Error("mastering working-master probe is not the exact mono 48 kHz PCM24 profile");
  }
  const pcm = object(working.pcm, "mastering working-master PCM evidence");
  exactFields(pcm, ["frames", "duration_seconds", "sample_peak_dbfs", "clipped_samples"], "mastering working-master PCM evidence");
  if (
    pcm.frames !== completeFrames ||
    pcm.frames !== workingFrames ||
    pcm.duration_seconds !== completeFrames / SAMPLE_RATE ||
    workingProbe.duration_seconds !== completeFrames / SAMPLE_RATE
  ) {
    throw new Error("mastering working-master frames/duration differ from the complete renderer timeline");
  }
  if (
    publicationProbe.format_name !== "mp3" ||
    publicationProbe.container_profile !== "mp3-cbr-96k-v1" ||
    publicationProbe.rf64 !== null ||
    publicationProbe.codec_name !== "mp3" ||
    publicationProbe.sample_rate !== SAMPLE_RATE ||
    publicationProbe.channels !== 1 ||
    publicationProbe.bit_rate !== 96_000 ||
    publicationProbe.size_bytes !== publicationBytes ||
    publicationProbe.duration_seconds !== manifest.audio.duration_seconds
  ) {
    throw new Error("mastering publication probe differs from the exact mono 48 kHz 96k MP3 manifest binding");
  }
  finiteNumber(publication.duration_delta_seconds, "mastering publication duration delta");
  return outputs;
}

export function validateRecordingMasteringEvidence(
  manifest: RecordingManifest,
  artifactRoot: string,
): ValidatedRecordingEvidence {
  if (manifest.status !== "accepted" || !manifest.production) {
    throw new Error(`Recording ${manifest.recording_id} is not an accepted production recording`);
  }
  const production = manifest.production;
  try {
    const planPath = resolveEvidenceFile(artifactRoot, production.mastering_plan_path, "Mastering plan");
    const resultPath = resolveEvidenceFile(artifactRoot, production.mastering_result_path, "Mastering result");
    const qaPath = resolveEvidenceFile(artifactRoot, production.mechanical_qa_path, "Mechanical QA");
    const workingPath = resolveEvidenceFile(artifactRoot, production.working_master_path, "Working master");
    const publicationPath = resolveEvidenceFile(artifactRoot, production.publication_path, "Publication derivative");
    const expectedHashes = [
      [planPath, production.mastering_plan_artifact_sha256, "Mastering plan"],
      [resultPath, production.mastering_result_sha256, "Mastering result"],
      [qaPath, production.mechanical_qa_sha256, "Mechanical QA"],
      [workingPath, production.working_master_sha256, "Working master"],
      [publicationPath, production.publication_sha256, "Publication derivative"],
    ] as const;
    for (const [file, expected, label] of expectedHashes) {
      const actual = streamFileSha256(file);
      if (actual !== expected) throw new Error(`${label} hash mismatch: expected ${expected}; found ${actual}`);
    }

    const plan = readJson(planPath, "Mastering plan");
    exactFields(
      plan,
      [
        "schema_version", "status", "plan_sha256", "implementation", "analysis_runtime", "dialogue", "renderer", "source_audio", "chapter_timeline",
        "chapter_timeline_sha256", "tools", "policy", "source_probe", "first_pass", "chapter_normalization", "boundaries", "boundaries_sha256", "commands",
      ],
      "Mastering plan",
    );
    if (
      plan.schema_version !== MASTERING_PLAN_SCHEMA_VERSION ||
      plan.status !== "full-dialogue-mastering-plan" ||
      plan.dialogue !== manifest.dialogue ||
      plan.plan_sha256 !== production.mastering_plan_sha256
    ) {
      throw new Error("Mastering plan schema/status/dialogue/content address differs from the recording manifest");
    }
    validateImplementation(plan.implementation);
    const analysisRuntime = validateAnalysisRuntime(plan.analysis_runtime);
    const renderer = object(plan.renderer, "Mastering plan renderer");
    if (renderer.dialogue !== manifest.dialogue) throw new Error("Mastering renderer dialogue differs from the recording manifest");
    const planBinding = validateSourceAudio(renderer, plan.source_audio, plan.chapter_timeline, plan.chapter_timeline_sha256, plan.boundaries);
    if (!Array.isArray(plan.chapter_normalization) || plan.chapter_normalization.length !== planBinding.timeline.length) {
      throw new Error("Mastering chapter normalization does not cover the authoritative timeline");
    }
    for (const [index, value] of plan.chapter_normalization.entries()) {
      const row = object(value, "Mastering chapter normalization");
      exactFields(row, ["chapter_id", "start_frame", "end_frame", "first_pass", "commands"], "Mastering chapter normalization");
      const chapter = planBinding.timeline[index]!;
      if (row.chapter_id !== chapter.chapter_id || row.start_frame !== chapter.start_frame || row.end_frame !== chapter.end_frame) {
        throw new Error("Mastering chapter normalization differs from the authoritative timeline");
      }
      const measurement = object(row.first_pass, "Mastering chapter first pass");
      exactFields(measurement, ["input_i", "input_tp", "input_lra", "input_thresh", "target_offset"], "Mastering chapter first pass");
      for (const value of Object.values(measurement)) finiteNumber(value, "Mastering chapter first-pass measurement");
      const commands = object(row.commands, "Mastering chapter commands");
      exactFields(commands, ["first_pass", "working_master"], "Mastering chapter commands");
      for (const command of Object.values(commands)) {
        if (!Array.isArray(command) || command.length === 0 || command.some((argument) => typeof argument !== "string")) {
          throw new Error("Mastering chapter command must contain string arguments");
        }
      }
    }

    const result = readJson(resultPath, "Mastering result");
    exactFields(
      result,
      [
        "schema_version", "status", "implementation", "analysis_runtime", "dialogue", "mastering_plan_sha256", "renderer", "source_audio", "chapter_timeline",
        "chapter_timeline_sha256", "tools", "commands", "outputs", "mechanical_qa_sha256", "mechanical_passed", "accepted",
      ],
      "Mastering result",
    );
    if (
      result.schema_version !== MASTERING_SCHEMA_VERSION ||
      result.status !== RESULT_STATUS ||
      result.dialogue !== manifest.dialogue ||
      result.mastering_plan_sha256 !== production.mastering_plan_sha256 ||
      result.mechanical_qa_sha256 !== production.mechanical_qa_sha256 ||
      result.mechanical_passed !== true ||
      result.accepted !== false ||
      result.chapter_timeline_sha256 !== planBinding.timelineDigest ||
      !sameJson(result.renderer, plan.renderer) ||
      !sameJson(result.source_audio, plan.source_audio) ||
      !sameJson(result.chapter_timeline, plan.chapter_timeline) ||
      !sameJson(result.implementation, plan.implementation) ||
      !sameJson(result.analysis_runtime, analysisRuntime) ||
      !sameJson(result.tools, plan.tools) ||
      !sameJson(result.commands, plan.commands)
    ) {
      throw new Error("Mastering result does not preserve the exact reviewed plan and mechanical-only evidence chain");
    }
    const workingMedia = inspectPcm24Wav(workingPath);
    if (workingMedia.container !== "RF64") {
      throw new Error("Mastering working master must use the production RF64 container");
    }
    const outputs = validateOutputBinding(
      result.outputs,
      production,
      manifest,
      workingMedia.bytes,
      workingMedia.frames,
      workingMedia.rf64,
      statSync(publicationPath).size,
      planBinding.sourceFrames,
    );
    const productionQaPath = `audio/qa/${manifest.dialogue}.json`;
    const productionQaContent = readFileSync(resolve(getRepoRoot(), productionQaPath), "utf8");
    if (createHash("sha256").update(productionQaContent).digest("hex") !== production.qa_sha256) {
      throw new Error("Accepted production QA bytes differ from the recording manifest");
    }
    const productionQa = parseAudioQa(productionQaPath, productionQaContent);
    const workingOutput = object(outputs.working_master, "mastering working-master output");
    const workingProbe = object(workingOutput.probe, "mastering working-master probe");
    if (
      productionQa.status !== "accepted" ||
      productionQa.audio.master_path !== production.working_master_path ||
      productionQa.audio.master_sha256 !== production.working_master_sha256 ||
      productionQa.audio.duration_seconds !== workingProbe.duration_seconds
    ) {
      throw new Error("Accepted production QA does not bind the exact mastering working master");
    }

    const qa = readJson(qaPath, "Mechanical QA");
    exactFields(
      qa,
      [
        "schema_version", "status", "evidence_sha256", "implementation", "analysis_runtime", "dialogue", "mastering_plan_sha256", "renderer", "source_audio",
        "chapter_timeline", "chapter_timeline_sha256", "chapters", "measurements", "gates", "acceptance", "asr", "listening", "outputs",
      ],
      "Mechanical QA",
    );
    const acceptance = object(qa.acceptance, "Mechanical QA acceptance");
    const gates = object(qa.gates, "Mechanical QA gates");
    exactFields(
      gates,
      ["loudness_passed", "clipping_passed", "duration_passed", "silence_passed", "mechanical_passed"],
      "Mechanical QA gates",
    );
    if (
      qa.schema_version !== MASTERING_SCHEMA_VERSION ||
      qa.status !== QA_STATUS ||
      qa.dialogue !== manifest.dialogue ||
      qa.mastering_plan_sha256 !== production.mastering_plan_sha256 ||
      qa.chapter_timeline_sha256 !== planBinding.timelineDigest ||
      !SHA256.test(String(qa.evidence_sha256)) ||
      Object.values(gates).some((gate) => gate !== true) ||
      acceptance.accepted !== false ||
      acceptance.reason !== MECHANICAL_ACCEPTANCE_REASON ||
      !sameJson(qa.asr, { status: "not-performed" }) ||
      !sameJson(qa.listening, { status: "not-performed" }) ||
      !sameJson(qa.renderer, plan.renderer) ||
      !sameJson(qa.implementation, plan.implementation) ||
      !sameJson(qa.source_audio, plan.source_audio) ||
      !sameJson(qa.analysis_runtime, analysisRuntime) ||
      !sameJson(qa.chapter_timeline, plan.chapter_timeline) ||
      !sameJson(qa.chapters, planBinding.chapters) ||
      !sameJson(qa.outputs, outputs)
    ) {
      throw new Error("Mechanical QA is stale, incomplete, or falsely accepted");
    }

    if (manifest.chapters.length !== planBinding.timeline.length) {
      throw new Error("Recording chapter inventory does not cover the mastered chapter timeline");
    }
    for (const [index, chapter] of manifest.chapters.entries()) {
      const timeline = planBinding.timeline[index]!;
      if (
        chapter.chapter_id !== timeline.chapter_id ||
        chapter.start_frame !== timeline.start_frame ||
        chapter.start_frame / SAMPLE_RATE !== timeline.start_seconds
      ) {
        throw new Error(`Recording chapter ${index + 1} differs from the authoritative mastered frame timeline`);
      }
    }
    return { publicationPath, workingMasterPath: workingPath };
  } catch (error) {
    throw new Error(
      `Recording mastering evidence invalid for ${manifest.recording_id}: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }
}

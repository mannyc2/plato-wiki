import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { englishStephanusIndexPath, parseStephanusIndexToon, stephanusIndexPath } from "./derived/stephanus.js";
import { getRepoRoot } from "./paths.js";
import type { SourceRef, SourceSpanResolution } from "./types.js";

export type StephanusMarker = {
  marker: string;
  index: number;
};

function normalizeStephanusSpan(span: string) {
  return span.trim().replace(/[–—]/gu, "-").replace(/\s+/gu, "");
}

function parseStephanusSpan(span: string) {
  const normalized = normalizeStephanusSpan(span);
  const [start, end = start] = normalized.split("-");

  if (!start || !end || !/^\d+[a-e]$/u.test(start) || !/^\d+[a-e]$/u.test(end)) {
    throw new Error(`Invalid Stephanus span: ${span}`);
  }

  return { start, end, normalized };
}

export function stephanusMarkerOrdinal(marker: string) {
  const match = /^(\d+)([a-e])$/u.exec(marker);
  if (!match) throw new Error(`Invalid Stephanus marker: ${marker}`);
  return Number(match[1]) * 5 + "abcde".indexOf(match[2]!);
}

export type PositionedStephanusMarker = {
  marker: string;
  startChar: number;
  endChar: number;
};

/**
 * A source resolver scoped to one coherent read of a repository.
 *
 * Static-site construction asks for thousands of overlapping source spans. A
 * resolver keeps each raw source and its already-validated Stephanus index in
 * memory for that one construction, but intentionally never crosses a repo
 * root or a separate build/test invocation.
 */
export type SourceSpanResolver = {
  resolveSourceSpan(dialogue: string, span: string): SourceSpanResolution;
  resolveEnglishSpan(dialogue: string, span: string): SourceSpanResolution;
};

type CachedSource = {
  content: string;
  markers: StephanusMarker[];
  markerIndexes: Map<string, number>;
  positionedMarkers?: PositionedStephanusMarker[];
};

type IndexedMarkerReader = (dialogue: string, content: string, repoRoot: string) => StephanusMarker[] | undefined;

/**
 * Standalone callers repeatedly resolve spans from the same source. Cache by
 * absolute path, but stamp both source and index so edits never serve stale
 * evidence. Scoped resolvers retain their intentionally coherent snapshot.
 */
const sharedSourceCache = new Map<string, { stamp: string; source: CachedSource }>();

function fileStamp(absolutePath: string) {
  if (!existsSync(absolutePath)) return "absent";
  const stats = statSync(absolutePath, { bigint: true });
  return `${stats.size}:${stats.mtimeNs}:${stats.ino}`;
}

export function projectStephanusSpansToMarkers(
  markers: readonly PositionedStephanusMarker[],
  spans: ReadonlyArray<{ id: string; span: string }>,
) {
  if (markers.length === 0) {
    throw new Error("Stephanus marker projection requires a non-empty marker inventory.");
  }
  let previousOrdinal = -1;
  let previousEndChar: number | undefined;
  for (const marker of markers) {
    const ordinal = stephanusMarkerOrdinal(marker.marker);
    if (
      ordinal <= previousOrdinal ||
      !Number.isSafeInteger(marker.startChar) ||
      !Number.isSafeInteger(marker.endChar) ||
      marker.startChar < 0 ||
      marker.endChar <= marker.startChar ||
      (previousEndChar !== undefined && marker.startChar !== previousEndChar)
    ) {
      throw new Error("Stephanus marker projection requires a strictly ordered, gapless marker inventory.");
    }
    previousOrdinal = ordinal;
    previousEndChar = marker.endChar;
  }

  return spans.map((span) => {
    const parsed = parseStephanusSpan(span.span);
    const start = stephanusMarkerOrdinal(parsed.start);
    const end = stephanusMarkerOrdinal(parsed.end);
    if (start > end) throw new Error(`Span start must not come after span end: ${span.span}`);
    if (!markers.some((marker) => marker.marker === parsed.start)) {
      throw new Error(
        `Span ${span.span} cannot be projected because start marker ${parsed.start} is absent from the target marker inventory.`,
      );
    }
    const projectedMarkers = markers.filter((marker) => {
      const ordinal = stephanusMarkerOrdinal(marker.marker);
      return start <= ordinal && ordinal <= end;
    });
    if (projectedMarkers.length === 0) {
      throw new Error(`Span ${span.span} does not cover any marker in the target marker inventory.`);
    }
    return {
      ...span,
      span: parsed.normalized,
      startMarker: parsed.start,
      endMarker: parsed.end,
      start,
      end,
      markers: projectedMarkers,
    };
  });
}

export function stephanusMarkers(content: string): StephanusMarker[] {
  return [...content.matchAll(/\{(\d+[a-e])\}/gu)].map((match) => ({
    marker: match[1]!,
    index: match.index ?? 0,
  }));
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function indexedStephanusMarkersAt(
  dialogue: string,
  content: string,
  indexRelativePath: string,
  regenerateCommand: string,
  repoRoot = getRepoRoot(),
): StephanusMarker[] | undefined {
  const indexPath = join(repoRoot, indexRelativePath);
  if (!existsSync(indexPath)) return undefined;

  const index = parseStephanusIndexToon(readFileSync(indexPath, "utf8"));
  if (index.sourceSha256 !== sha256(content)) {
    throw new Error(
      `Stale Stephanus index for ${dialogue}: ${indexRelativePath} does not match raw source. Regenerate with \`${regenerateCommand}\`.`,
    );
  }

  return index.markers.map((marker) => ({ marker: marker.marker, index: marker.startChar }));
}

function indexedStephanusMarkers(dialogue: string, content: string, repoRoot: string): StephanusMarker[] | undefined {
  return indexedStephanusMarkersAt(
    dialogue,
    content,
    stephanusIndexPath(dialogue),
    `bun run harness derive stephanus ${dialogue}`,
    repoRoot,
  );
}

function indexedEnglishStephanusMarkers(dialogue: string, content: string, repoRoot: string): StephanusMarker[] | undefined {
  return indexedStephanusMarkersAt(
    dialogue,
    content,
    englishStephanusIndexPath(dialogue),
    `bun run harness derive stephanus-english ${dialogue}`,
    repoRoot,
  );
}

function markerIndexes(markers: readonly StephanusMarker[]) {
  const indexes = new Map<string, number>();
  for (const [index, marker] of markers.entries()) {
    if (!indexes.has(marker.marker)) indexes.set(marker.marker, index);
  }
  return indexes;
}

function readSourceAt(
  dialogue: string,
  sourcePath: string,
  missingLabel: string,
  indexRelativePath: string,
  indexedMarkers: IndexedMarkerReader,
  repoRoot: string,
  cache: Map<string, CachedSource> | undefined,
) {
  const cached = cache?.get(sourcePath);
  if (cached) return cached;

  const absolutePath = join(repoRoot, sourcePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing ${missingLabel} text for dialogue: ${dialogue}`);
  }

  const stamp = `${fileStamp(absolutePath)}|${fileStamp(join(repoRoot, indexRelativePath))}`;
  const shared = sharedSourceCache.get(absolutePath);
  if (shared?.stamp === stamp) {
    cache?.set(sourcePath, shared.source);
    return shared.source;
  }

  const content = readFileSync(absolutePath, "utf8");
  const markers = indexedMarkers(dialogue, content, repoRoot) ?? stephanusMarkers(content);
  const loaded: CachedSource = { content, markers, markerIndexes: markerIndexes(markers) };
  sharedSourceCache.set(absolutePath, { stamp, source: loaded });
  cache?.set(sourcePath, loaded);
  return loaded;
}

function resolveSpanFromSource(
  span: string,
  sourcePath: string,
  source: CachedSource,
): SourceSpanResolution {
  const { start, end, normalized } = parseStephanusSpan(span);
  const startMarkerIndex = source.markerIndexes.get(start) ?? -1;
  const endMarkerIndex = source.markerIndexes.get(end) ?? -1;
  const startMarker = source.markers[startMarkerIndex];

  if (!startMarker || endMarkerIndex === -1) {
    throw new Error(`Span ${span} not found in ${sourcePath}`);
  }
  if (startMarkerIndex > endMarkerIndex) {
    throw new Error(`Span start must not come after span end: ${span}`);
  }

  const nextMarker = source.markers[endMarkerIndex + 1];
  const startChar = startMarker.index;
  const endChar = nextMarker?.index ?? source.content.length;
  const text = source.content.slice(startChar, endChar);

  return {
    source_ref: {
      source_path: sourcePath,
      stephanus_span: normalized,
      start_marker: start,
      end_marker: end,
      start_char: startChar,
      end_char: endChar,
      text_sha256: sha256(text),
    } satisfies SourceRef,
    text,
  };
}

function resolveSpanAt(
  dialogue: string,
  span: string,
  sourcePath: string,
  missingLabel: string,
  indexRelativePath: string,
  indexedMarkers: IndexedMarkerReader,
  repoRoot = getRepoRoot(),
  cache?: Map<string, CachedSource>,
): SourceSpanResolution {
  if (!/^[a-z0-9-]+$/u.test(dialogue)) {
    throw new Error(`Dialogue slug must use lowercase letters, numbers, and hyphens: ${dialogue}`);
  }

  parseStephanusSpan(span);
  const source = readSourceAt(
    dialogue,
    sourcePath,
    missingLabel,
    indexRelativePath,
    indexedMarkers,
    repoRoot,
    cache,
  );
  return resolveSpanFromSource(span, sourcePath, source);
}

function resolveEnglishSpanAt(
  dialogue: string,
  span: string,
  repoRoot = getRepoRoot(),
  cache?: Map<string, CachedSource>,
): SourceSpanResolution {
  if (!/^[a-z0-9-]+$/u.test(dialogue)) {
    throw new Error(`Dialogue slug must use lowercase letters, numbers, and hyphens: ${dialogue}`);
  }

  const greekPath = `raw/plato/greek/${dialogue}.txt`;
  const canonical = resolveSpanAt(
    dialogue,
    span,
    greekPath,
    "Greek",
    stephanusIndexPath(dialogue),
    indexedStephanusMarkers,
    repoRoot,
    cache,
  );
  const sourcePath = `raw/plato/english/${dialogue}.txt`;
  const english = readSourceAt(
    dialogue,
    sourcePath,
    "English",
    englishStephanusIndexPath(dialogue),
    indexedEnglishStephanusMarkers,
    repoRoot,
    cache,
  );
  const markers =
    english.positionedMarkers ??
    (english.positionedMarkers = english.markers.map((marker, markerIndex): PositionedStephanusMarker => ({
      marker: marker.marker,
      startChar: marker.index,
      endChar: english.markers[markerIndex + 1]?.index ?? english.content.length,
    })));
  const [projection] = projectStephanusSpansToMarkers(markers, [
    { id: dialogue, span: canonical.source_ref.stephanus_span },
  ]);
  if (!projection) throw new Error(`Span ${span} cannot be projected into ${sourcePath}`);

  if (!markers.some((marker) => marker.marker === projection.endMarker)) {
    const greek = readSourceAt(
      dialogue,
      greekPath,
      "Greek",
      stephanusIndexPath(dialogue),
      indexedStephanusMarkers,
      repoRoot,
      cache,
    );
    const greekEndIndex = greek.markerIndexes.get(projection.endMarker) ?? -1;
    const nextGreekMarker = greek.markers[greekEndIndex + 1]?.marker;
    const nextEnglishMarker = markers.find(
      (marker) => stephanusMarkerOrdinal(marker.marker) > projection.end,
    )?.marker;
    if (nextGreekMarker ? nextEnglishMarker !== nextGreekMarker : nextEnglishMarker !== undefined) {
      throw new Error(
        `Span ${span} has an ambiguous missing English end marker ${projection.endMarker}; the next English marker must be its next canonical Greek marker.`,
      );
    }
  }

  const startChar = projection.markers[0]!.startChar;
  const endChar = projection.markers.at(-1)!.endChar;
  const text = english.content.slice(startChar, endChar);
  return {
    source_ref: {
      source_path: sourcePath,
      stephanus_span: projection.span,
      start_marker: projection.startMarker,
      end_marker: projection.endMarker,
      start_char: startChar,
      end_char: endChar,
      text_sha256: sha256(text),
    },
    text,
  };
}

export function createSourceSpanResolver(): SourceSpanResolver {
  const repoRoot = getRepoRoot();
  const cache = new Map<string, CachedSource>();

  return {
    resolveSourceSpan: (dialogue, span) =>
      resolveSpanAt(
        dialogue,
        span,
        `raw/plato/greek/${dialogue}.txt`,
        "Greek",
        stephanusIndexPath(dialogue),
        indexedStephanusMarkers,
        repoRoot,
        cache,
      ),
    resolveEnglishSpan: (dialogue, span) => resolveEnglishSpanAt(dialogue, span, repoRoot, cache),
  };
}

export function resolveSourceSpan(dialogue: string, span: string): SourceSpanResolution {
  return resolveSpanAt(
    dialogue,
    span,
    `raw/plato/greek/${dialogue}.txt`,
    "Greek",
    stephanusIndexPath(dialogue),
    indexedStephanusMarkers,
  );
}

export function resolveEnglishSpan(dialogue: string, span: string): SourceSpanResolution {
  return resolveEnglishSpanAt(dialogue, span);
}

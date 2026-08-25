import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildCoverageReport, type CoverageGap } from "./coverage.js";
import {
  buildStephanusIndex,
  planStephanusSegments,
  type StephanusIndexEntry,
  type StephanusSegment,
} from "./derived/stephanus.js";
import { withRepoWriteLock } from "./file-lock.js";
import { getRepoRoot } from "./paths.js";
import { fieldValue, nestedFieldValue, observationYamlBlocks } from "./wiki/observation-ledger.js";

export type ObservationSourceRange = {
  observationId: string;
  startChar: number;
  endChar: number;
};

export type SegmentCoverageEntry = {
  dialogue: string;
  span: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  status: "processed" | "no_observations";
  runId: string;
  segmentIndex: number;
  createdAt: string;
};

export type SegmentedIngestSegment = StephanusSegment & {
  span: string;
  existingObservationIds: string[];
  completed: boolean;
};

export type SegmentMarkerRange = {
  fromMarker?: string | undefined;
  toMarker?: string | undefined;
};

function numericFieldValue(block: string, field: string) {
  const value = nestedFieldValue(block, field);
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function stephanusSegmentSpan(segment: Pick<StephanusSegment, "startMarker" | "endMarker">) {
  return segment.startMarker === segment.endMarker ? segment.startMarker : `${segment.startMarker}-${segment.endMarker}`;
}

export function observationSourceRanges(dialogue: string): ObservationSourceRange[] {
  const ledgerPath = join(getRepoRoot(), "wiki/observations", `${dialogue}.md`);
  if (!existsSync(ledgerPath)) return [];

  const ranges: ObservationSourceRange[] = [];
  const content = readFileSync(ledgerPath, "utf8");
  for (const block of observationYamlBlocks(content)) {
    const observationId = fieldValue(block, "observation_id");
    const startChar = numericFieldValue(block, "start_char");
    const endChar = numericFieldValue(block, "end_char");
    if (!observationId || startChar === undefined || endChar === undefined) continue;

    ranges.push({ observationId, startChar, endChar });
  }

  return ranges.sort((a, b) => a.startChar - b.startChar || a.observationId.localeCompare(b.observationId));
}

function segmentCoveragePath() {
  return join(getRepoRoot(), "wiki/observations/segment-coverage.jsonl");
}

function segmentCoverageEntries() {
  const path = segmentCoveragePath();
  if (!existsSync(path)) return [];

  const entries: SegmentCoverageEntry[] = [];
  for (const [index, line] of readFileSync(path, "utf8").split(/\r?\n/u).entries()) {
    if (!line.trim()) continue;

    const parsed = JSON.parse(line) as Partial<SegmentCoverageEntry>;
    if (
      typeof parsed.dialogue !== "string" ||
      typeof parsed.span !== "string" ||
      typeof parsed.startMarker !== "string" ||
      typeof parsed.endMarker !== "string" ||
      typeof parsed.startChar !== "number" ||
      typeof parsed.endChar !== "number" ||
      (parsed.status !== "processed" && parsed.status !== "no_observations") ||
      typeof parsed.runId !== "string" ||
      typeof parsed.segmentIndex !== "number" ||
      typeof parsed.createdAt !== "string"
    ) {
      throw new Error(`Malformed segment coverage entry at line ${index + 1}`);
    }

    entries.push(parsed as SegmentCoverageEntry);
  }

  return entries;
}

export function segmentCoverageRanges(dialogue: string): ObservationSourceRange[] {
  return segmentCoverageEntries()
    .filter((entry) => entry.dialogue === dialogue)
    .map((entry) => ({
      observationId: `coverage:${entry.status}:${entry.dialogue}:${entry.span}`,
      startChar: entry.startChar,
      endChar: entry.endChar,
    }))
    .sort((a, b) => a.startChar - b.startChar || a.observationId.localeCompare(b.observationId));
}

export function appendSegmentCoverage(
  entry: Omit<SegmentCoverageEntry, "createdAt" | "status">,
  status: SegmentCoverageEntry["status"] = "no_observations",
) {
  const coveragePath = segmentCoveragePath();
  return withRepoWriteLock({ paths: [coveragePath], label: `segment_coverage:${entry.dialogue}:${entry.span}` }, () => {
    const next: SegmentCoverageEntry = {
      ...entry,
      status,
      createdAt: new Date().toISOString(),
    };
    const existing = segmentCoverageEntries().some(
      (coverage) =>
        coverage.dialogue === next.dialogue &&
        coverage.status === next.status &&
        coverage.startChar === next.startChar &&
        coverage.endChar === next.endChar,
    );
    if (existing) return false;

    const path = segmentCoveragePath();
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify(next)}\n`, "utf8");
    return true;
  });
}

function rangesOverlap(segment: StephanusSegment, range: ObservationSourceRange) {
  return range.startChar < segment.endChar && range.endChar > segment.startChar;
}

function markerOrder(dialogue: string) {
  return new Map(buildStephanusIndex(dialogue).markers.map((entry, index) => [entry.marker, index]));
}

function requireMarker(order: Map<string, number>, marker: string) {
  const index = order.get(marker);
  if (index === undefined) {
    throw new Error(`Unknown Stephanus marker: ${marker}`);
  }

  return index;
}

function rangeMarkerSlice(dialogue: string, markerRange: SegmentMarkerRange) {
  const order = markerOrder(dialogue);
  const index = buildStephanusIndex(dialogue);
  const fromIndex = markerRange.fromMarker ? requireMarker(order, markerRange.fromMarker) : 0;
  const toIndex = markerRange.toMarker ? requireMarker(order, markerRange.toMarker) : index.markers.length - 1;
  if (fromIndex !== undefined && toIndex !== undefined && fromIndex > toIndex) {
    throw new Error(`Invalid Stephanus marker range: ${markerRange.fromMarker} is after ${markerRange.toMarker}`);
  }

  return index.markers.slice(fromIndex, toIndex + 1);
}

function planMarkerSlice(dialogue: string, markers: StephanusIndexEntry[], targetBytes: number) {
  const segments: StephanusSegment[] = [];
  let startIndex = 0;

  while (startIndex < markers.length) {
    const start = markers[startIndex]!;
    let endIndex = startIndex;
    while (endIndex + 1 < markers.length && markers[endIndex + 1]!.endChar - start.startChar <= targetBytes) {
      endIndex += 1;
    }

    const end = markers[endIndex]!;
    segments.push({
      dialogue,
      startMarker: start.marker,
      endMarker: end.marker,
      startChar: start.startChar,
      endChar: end.endChar,
      markerCount: endIndex - startIndex + 1,
      sourceBytes: end.endChar - start.startChar,
    });
    startIndex = endIndex + 1;
  }

  return segments;
}

function planStephanusSegmentsForRange(dialogue: string, targetBytes: number, markerRange: SegmentMarkerRange) {
  if (!markerRange.fromMarker && !markerRange.toMarker) return planStephanusSegments(dialogue, targetBytes);

  return planMarkerSlice(dialogue, rangeMarkerSlice(dialogue, markerRange), targetBytes);
}

function markerCountForGap(dialogue: string, gap: CoverageGap) {
  const index = buildStephanusIndex(dialogue);
  const startIndex = index.markers.findIndex((marker) => marker.marker === gap.startMarker);
  const endIndex = index.markers.findIndex((marker) => marker.marker === gap.endMarker);

  if (startIndex === -1) {
    throw new Error(`Unknown Stephanus marker: ${gap.startMarker}`);
  }
  if (endIndex === -1) {
    throw new Error(`Unknown Stephanus marker: ${gap.endMarker}`);
  }
  if (startIndex > endIndex) {
    throw new Error(`Invalid coverage gap marker range: ${gap.startMarker} is after ${gap.endMarker}`);
  }

  return endIndex - startIndex + 1;
}

export function planGapIngest(dialogue: string, minGapChars = 800): SegmentedIngestSegment[] {
  const coverage = buildCoverageReport({ dialogue, minGapChars })[0];
  if (!coverage) return [];

  return coverage.gaps.map((gap) => {
    const segment = {
      dialogue,
      startMarker: gap.startMarker,
      endMarker: gap.endMarker,
      startChar: gap.startChar,
      endChar: gap.endChar,
      markerCount: markerCountForGap(dialogue, gap),
      sourceBytes: gap.endChar - gap.startChar,
    };

    return {
      ...segment,
      span: stephanusSegmentSpan(segment),
      existingObservationIds: [],
      completed: false,
    };
  });
}

export function planSegmentedIngest(
  dialogue: string,
  targetBytes = 30_000,
  markerRange: SegmentMarkerRange = {},
): SegmentedIngestSegment[] {
  const existingRanges = [...observationSourceRanges(dialogue), ...segmentCoverageRanges(dialogue)].sort(
    (a, b) => a.startChar - b.startChar || a.observationId.localeCompare(b.observationId),
  );

  return planStephanusSegmentsForRange(dialogue, targetBytes, markerRange).map((segment) => {
    const overlappingRanges = existingRanges.filter((range) => rangesOverlap(segment, range));
    const existingObservationIds = overlappingRanges.map((range) => range.observationId);

    return {
      ...segment,
      span: stephanusSegmentSpan(segment),
      existingObservationIds,
      completed: overlappingRanges.some((range) => range.endChar >= segment.endChar),
    };
  });
}

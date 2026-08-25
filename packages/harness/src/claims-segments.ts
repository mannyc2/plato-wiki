import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildStephanusIndex, type StephanusIndexEntry, type StephanusSegment } from "./derived/stephanus.js";
import { withRepoWriteLock } from "./file-lock.js";
import { getRepoRoot } from "./paths.js";
import { stephanusSegmentSpan, type SegmentMarkerRange } from "./segments.js";
import { claimYamlBlocks } from "./wiki/claim-ledger.js";
import { fieldValue, nestedFieldValue } from "./wiki/observation-ledger.js";

export type ClaimSourceRange = {
  claimId: string;
  startChar: number;
  endChar: number;
};

export type ClaimSegmentCoverageEntry = {
  dialogue: string;
  span: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  status: "processed" | "no_claims";
  runId: string;
  segmentIndex: number;
  createdAt: string;
};

export type SegmentedClaimSegment = StephanusSegment & {
  span: string;
  existingClaimIds: string[];
  completed: boolean;
};

export type ReviewClaimTarget = {
  claimId: string;
  stephanusSpan: string;
  speaker: string;
  claimKind: string;
  finalStatus: string;
  reviewStatus: string;
  block: string;
};

export type SegmentedClaimReviewBatch = {
  dialogue: string;
  index: number;
  claimIds: string[];
  summary: string;
};

function numericNestedFieldValue(block: string, field: string) {
  const value = nestedFieldValue(block, field);
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function claimSourceRanges(dialogue: string): ClaimSourceRange[] {
  const ledgerPath = join(getRepoRoot(), "wiki/claims", `${dialogue}.md`);
  if (!existsSync(ledgerPath)) return [];

  const ranges: ClaimSourceRange[] = [];
  const content = readFileSync(ledgerPath, "utf8");
  for (const block of claimYamlBlocks(content)) {
    const claimId = fieldValue(block, "claim_id");
    const startChar = numericNestedFieldValue(block, "start_char");
    const endChar = numericNestedFieldValue(block, "end_char");
    if (!claimId || startChar === undefined || endChar === undefined) continue;

    ranges.push({ claimId, startChar, endChar });
  }

  return ranges.sort((a, b) => a.startChar - b.startChar || a.claimId.localeCompare(b.claimId));
}

function claimSegmentCoveragePath() {
  return join(getRepoRoot(), "wiki/claims/segment-coverage.jsonl");
}

function claimSegmentCoverageEntries() {
  const path = claimSegmentCoveragePath();
  if (!existsSync(path)) return [];

  const entries: ClaimSegmentCoverageEntry[] = [];
  for (const [index, line] of readFileSync(path, "utf8").split(/\r?\n/u).entries()) {
    if (!line.trim()) continue;

    const parsed = JSON.parse(line) as Partial<ClaimSegmentCoverageEntry>;
    if (
      typeof parsed.dialogue !== "string" ||
      typeof parsed.span !== "string" ||
      typeof parsed.startMarker !== "string" ||
      typeof parsed.endMarker !== "string" ||
      typeof parsed.startChar !== "number" ||
      typeof parsed.endChar !== "number" ||
      (parsed.status !== "processed" && parsed.status !== "no_claims") ||
      typeof parsed.runId !== "string" ||
      typeof parsed.segmentIndex !== "number" ||
      typeof parsed.createdAt !== "string"
    ) {
      throw new Error(`Malformed claim segment coverage entry at line ${index + 1}`);
    }

    entries.push(parsed as ClaimSegmentCoverageEntry);
  }

  return entries;
}

export function claimSegmentCoverageRanges(dialogue: string): ClaimSourceRange[] {
  return claimSegmentCoverageEntries()
    .filter((entry) => entry.dialogue === dialogue)
    .map((entry) => ({
      claimId: `coverage:${entry.status}:${entry.dialogue}:${entry.span}`,
      startChar: entry.startChar,
      endChar: entry.endChar,
    }))
    .sort((a, b) => a.startChar - b.startChar || a.claimId.localeCompare(b.claimId));
}

export function appendClaimSegmentCoverage(
  entry: Omit<ClaimSegmentCoverageEntry, "createdAt" | "status">,
  status: ClaimSegmentCoverageEntry["status"] = "no_claims",
) {
  const coveragePath = claimSegmentCoveragePath();
  return withRepoWriteLock({ paths: [coveragePath], label: `claim_segment_coverage:${entry.dialogue}:${entry.span}` }, () => {
    const next: ClaimSegmentCoverageEntry = {
      ...entry,
      status,
      createdAt: new Date().toISOString(),
    };
    const existing = claimSegmentCoverageEntries().some(
      (coverage) =>
        coverage.dialogue === next.dialogue &&
        coverage.status === next.status &&
        coverage.startChar === next.startChar &&
        coverage.endChar === next.endChar,
    );
    if (existing) return false;

    const path = claimSegmentCoveragePath();
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify(next)}\n`, "utf8");
    return true;
  });
}

function rangesOverlap(segment: StephanusSegment, range: ClaimSourceRange) {
  return range.startChar < segment.endChar && range.endChar > segment.startChar;
}

function markerOrder(markers: StephanusIndexEntry[]) {
  return new Map(markers.map((entry, index) => [entry.marker, index]));
}

function requireMarker(order: Map<string, number>, marker: string) {
  const index = order.get(marker);
  if (index === undefined) {
    throw new Error(`Unknown Stephanus marker: ${marker}`);
  }

  return index;
}

function rangeMarkerSlice(dialogue: string, markerRange: SegmentMarkerRange) {
  const index = buildStephanusIndex(dialogue);
  const order = markerOrder(index.markers);
  const fromIndex = markerRange.fromMarker ? requireMarker(order, markerRange.fromMarker) : 0;
  const toIndex = markerRange.toMarker ? requireMarker(order, markerRange.toMarker) : index.markers.length - 1;
  if (fromIndex > toIndex) {
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

function planClaimSegmentsForRange(dialogue: string, targetBytes: number, markerRange: SegmentMarkerRange) {
  const markers = rangeMarkerSlice(dialogue, markerRange);
  return planMarkerSlice(dialogue, markers, targetBytes);
}

export function planSegmentedClaims(
  dialogue: string,
  targetBytes = 30_000,
  markerRange: SegmentMarkerRange = {},
): SegmentedClaimSegment[] {
  const existingRanges = [...claimSourceRanges(dialogue), ...claimSegmentCoverageRanges(dialogue)].sort(
    (a, b) => a.startChar - b.startChar || a.claimId.localeCompare(b.claimId),
  );

  return planClaimSegmentsForRange(dialogue, targetBytes, markerRange).map((segment) => {
    const overlappingRanges = existingRanges.filter((range) => rangesOverlap(segment, range));
    const existingClaimIds = overlappingRanges.map((range) => range.claimId);

    return {
      ...segment,
      span: stephanusSegmentSpan(segment),
      existingClaimIds,
      completed: overlappingRanges.some((range) => range.endChar >= segment.endChar),
    };
  });
}

export function reviewClaimTargets(dialogue: string): ReviewClaimTarget[] {
  const ledgerPath = join(getRepoRoot(), "wiki/claims", `${dialogue}.md`);
  if (!existsSync(ledgerPath)) return [];

  const content = readFileSync(ledgerPath, "utf8");
  const targets: ReviewClaimTarget[] = [];
  for (const block of claimYamlBlocks(content)) {
    const claimId = fieldValue(block, "claim_id");
    if (!claimId) continue;

    targets.push({
      claimId,
      stephanusSpan: fieldValue(block, "stephanus_span") ?? "",
      speaker: fieldValue(block, "speaker") ?? "",
      claimKind: fieldValue(block, "claim_kind") ?? "",
      finalStatus: fieldValue(block, "final_status") ?? "",
      reviewStatus: fieldValue(block, "review_status") || "unreviewed",
      block,
    });
  }

  return targets;
}

export function claimReviewTargetIdsComplete(dialogue: string, claimIds: string[]) {
  const byId = new Map(reviewClaimTargets(dialogue).map((target) => [target.claimId, target]));
  return claimIds.every((claimId) => {
    const target = byId.get(claimId);
    return target !== undefined && target.reviewStatus !== "unreviewed";
  });
}

export function planSegmentedClaimReview(dialogue: string, targetClaims = 8): SegmentedClaimReviewBatch[] {
  if (!Number.isInteger(targetClaims) || targetClaims <= 0) {
    throw new Error("targetClaims must be a positive integer");
  }

  const pending = reviewClaimTargets(dialogue).filter((target) => target.reviewStatus === "unreviewed");
  const batches: SegmentedClaimReviewBatch[] = [];

  for (let start = 0; start < pending.length; start += targetClaims) {
    const targets = pending.slice(start, start + targetClaims);
    batches.push({
      dialogue,
      index: batches.length + 1,
      claimIds: targets.map((target) => target.claimId),
      summary: targets
        .map(
          (target) =>
            [
              `--- ${target.claimId}`,
              `span=${target.stephanusSpan}; speaker=${target.speaker}; kind=${target.claimKind}; final_status=${target.finalStatus}`,
              "",
              "```yaml",
              target.block.trim(),
              "```",
            ].join("\n"),
        )
        .join("\n\n"),
    });
  }

  return batches;
}

export function planClaimReviewForIds(dialogue: string, claimIds: string[]): SegmentedClaimReviewBatch[] {
  if (claimIds.length === 0) return [];

  const targetsById = new Map(reviewClaimTargets(dialogue).map((target) => [target.claimId, target]));
  const unknownIds = claimIds.filter((claimId) => !targetsById.has(claimId));
  if (unknownIds.length > 0) {
    throw new Error(`Unknown claim id(s) for ${dialogue}: ${unknownIds.join(", ")}`);
  }

  const targets = claimIds
    .map((claimId) => targetsById.get(claimId)!)
    .filter((target) => target.reviewStatus === "unreviewed");
  if (targets.length === 0) return [];

  return [
    {
      dialogue,
      index: 1,
      claimIds: targets.map((target) => target.claimId),
      summary: targets
        .map((target) =>
          [
            `--- ${target.claimId}`,
            `span=${target.stephanusSpan}; speaker=${target.speaker}; kind=${target.claimKind}; final_status=${target.finalStatus}`,
            "",
            "```yaml",
            target.block.trim(),
            "```",
          ].join("\n"),
        )
        .join("\n\n"),
    },
  ];
}

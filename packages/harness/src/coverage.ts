import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { buildStephanusIndex, listGreekDialogues } from "./derived/stephanus.js";
import { getRepoRoot } from "./paths.js";
import {
  fieldValueOrEmpty,
  nestedFieldValueInParent,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";

export type CoverageGapClassification = "rejected_uncovered" | "never_covered";

export type CoverageGap = {
  dialogue: string;
  startChar: number;
  endChar: number;
  startMarker: string;
  endMarker: string;
  classification: CoverageGapClassification;
};

export type DialogueCoverage = {
  dialogue: string;
  sourceChars: number;
  acceptedCoveredChars: number;
  coverageRatio: number;
  gaps: CoverageGap[];
};

export type WrittenCoverageReport = {
  path: string;
  report: DialogueCoverage[];
};

type SourceInterval = {
  startChar: number;
  endChar: number;
  reviewStatus: string;
};

function readObservationIntervals(dialogue: string) {
  const ledgerPath = join(getRepoRoot(), "wiki/observations", `${dialogue}.md`);
  let content = "";
  try {
    content = readFileSync(ledgerPath, "utf8");
  } catch {
    return [];
  }

  const intervals: SourceInterval[] = [];
  for (const block of observationYamlBlocks(content)) {
    const startChar = Number(nestedFieldValueInParent(block, "source_ref", "start_char"));
    const endChar = Number(nestedFieldValueInParent(block, "source_ref", "end_char"));
    if (!Number.isInteger(startChar) || !Number.isInteger(endChar) || endChar <= startChar) continue;
    intervals.push({
      startChar,
      endChar,
      reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
    });
  }

  return intervals.sort((a, b) => a.startChar - b.startChar || a.endChar - b.endChar);
}

function mergeIntervals(intervals: Array<{ startChar: number; endChar: number }>) {
  const merged: Array<{ startChar: number; endChar: number }> = [];
  for (const interval of [...intervals].sort((a, b) => a.startChar - b.startChar || a.endChar - b.endChar)) {
    const previous = merged.at(-1);
    if (previous && interval.startChar <= previous.endChar) {
      previous.endChar = Math.max(previous.endChar, interval.endChar);
    } else {
      merged.push({ ...interval });
    }
  }
  return merged;
}

function acceptedGaps(sourceChars: number, acceptedIntervals: Array<{ startChar: number; endChar: number }>) {
  const gaps: Array<{ startChar: number; endChar: number }> = [];
  let cursor = 0;
  for (const interval of mergeIntervals(acceptedIntervals)) {
    if (interval.startChar > cursor) {
      gaps.push({ startChar: cursor, endChar: interval.startChar });
    }
    cursor = Math.max(cursor, interval.endChar);
  }
  if (cursor < sourceChars) {
    gaps.push({ startChar: cursor, endChar: sourceChars });
  }
  return gaps;
}

function clipIntervals(
  intervals: Array<{ startChar: number; endChar: number }>,
  range: { startChar: number; endChar: number },
) {
  return mergeIntervals(
    intervals
      .map((interval) => ({
        startChar: Math.max(interval.startChar, range.startChar),
        endChar: Math.min(interval.endChar, range.endChar),
      }))
      .filter((interval) => interval.endChar > interval.startChar),
  );
}

function splitGapByRejected(
  gap: { startChar: number; endChar: number },
  rejectedIntervals: Array<{ startChar: number; endChar: number }>,
) {
  const rejected = clipIntervals(rejectedIntervals, gap);
  const parts: Array<{ startChar: number; endChar: number; classification: CoverageGapClassification }> = [];
  let cursor = gap.startChar;

  for (const interval of rejected) {
    if (interval.startChar > cursor) {
      parts.push({ startChar: cursor, endChar: interval.startChar, classification: "never_covered" });
    }
    parts.push({ startChar: interval.startChar, endChar: interval.endChar, classification: "rejected_uncovered" });
    cursor = interval.endChar;
  }

  if (cursor < gap.endChar) {
    parts.push({ startChar: cursor, endChar: gap.endChar, classification: "never_covered" });
  }

  return parts;
}

function markerAtOrBefore(markers: Array<{ marker: string; startChar: number }>, offset: number) {
  return [...markers].reverse().find((marker) => marker.startChar <= offset)?.marker ?? markers[0]?.marker ?? "(none)";
}

function markerAtOrAfter(markers: Array<{ marker: string; startChar: number }>, offset: number) {
  return markers.find((marker) => marker.startChar >= offset)?.marker ?? markers.at(-1)?.marker ?? "(none)";
}

function coverageForDialogue(dialogue: string, minGapChars: number): DialogueCoverage {
  const index = buildStephanusIndex(dialogue);
  const sourceChars = index.markers.at(-1)?.endChar ?? readFileSync(join(getRepoRoot(), index.sourcePath), "utf8").length;
  const intervals = readObservationIntervals(dialogue);
  const acceptedIntervals = intervals.filter((interval) => interval.reviewStatus === "accepted");
  const rejectedIntervals = intervals.filter((interval) => interval.reviewStatus === "rejected");
  const accepted = mergeIntervals(acceptedIntervals);
  const acceptedCoveredChars = accepted.reduce((sum, interval) => sum + interval.endChar - interval.startChar, 0);
  const gaps = acceptedGaps(sourceChars, accepted)
    .filter((gap) => gap.endChar - gap.startChar >= minGapChars)
    .flatMap((gap) => splitGapByRejected(gap, rejectedIntervals))
    .map((gap) => ({
      dialogue,
      startChar: gap.startChar,
      endChar: gap.endChar,
      startMarker: markerAtOrBefore(index.markers, gap.startChar),
      endMarker: markerAtOrAfter(index.markers, gap.endChar),
      classification: gap.classification,
    }));

  return {
    dialogue,
    sourceChars,
    acceptedCoveredChars,
    coverageRatio: sourceChars === 0 ? 1 : acceptedCoveredChars / sourceChars,
    gaps,
  };
}

export function buildCoverageReport({
  minGapChars = 800,
  dialogue,
}: { minGapChars?: number | undefined; dialogue?: string | undefined } = {}) {
  const dialogues = dialogue ? [dialogue] : listGreekDialogues();
  return dialogues.map((entry) => coverageForDialogue(entry, minGapChars)).sort((a, b) => a.dialogue.localeCompare(b.dialogue));
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function renderCoverageReport(report: DialogueCoverage[]) {
  const sections = report.map((dialogue) => {
    const biggestGapChars = Math.max(0, ...dialogue.gaps.map((gap) => gap.endChar - gap.startChar));
    const gapRows =
      dialogue.gaps.length === 0
        ? ["(none)"]
        : [
            "| start | end | chars | classification |",
            "|---|---|---:|---|",
            ...dialogue.gaps.map(
              (gap) =>
                `| ${gap.startMarker} (${gap.startChar}) | ${gap.endMarker} (${gap.endChar}) | ${gap.endChar - gap.startChar} | ${gap.classification} |`,
            ),
          ];

    return [
      `## ${dialogue.dialogue}`,
      "",
      "```yaml",
      `source_chars: ${dialogue.sourceChars}`,
      `accepted_covered_chars: ${dialogue.acceptedCoveredChars}`,
      `coverage: ${percent(dialogue.coverageRatio)}`,
      `gap_count: ${dialogue.gaps.length}`,
      `biggest_gap_chars: ${biggestGapChars}`,
      "```",
      "",
      ...gapRows,
    ].join("\n");
  });

  return [
    "# Coverage Gaps",
    "",
    "Generated by `bun run harness coverage --write`.",
    "",
    "```yaml",
    `dialogues: ${report.length}`,
    `min_coverage: ${percent(Math.min(...report.map((dialogue) => dialogue.coverageRatio)))}`,
    "```",
    "",
    ...sections,
    "",
  ].join("\n");
}

export function writeCoverageReport({
  path = "wiki/coverage-gaps.md",
  minGapChars,
  dialogue,
}: { path?: string | undefined; minGapChars?: number | undefined; dialogue?: string | undefined } = {}): WrittenCoverageReport {
  const report = buildCoverageReport({ minGapChars, dialogue });
  const repoRoot = getRepoRoot();
  const absolutePath = join(repoRoot, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, renderCoverageReport(report), "utf8");
  return { path: relative(repoRoot, absolutePath), report };
}

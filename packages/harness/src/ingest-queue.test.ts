import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planSegmentedIngestQueue, runSegmentedIngestQueue } from "./ingest-queue.js";
import { setRepoRootForTesting } from "./paths.js";
import { appendSegmentCoverage } from "./segments.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "ingest-queue-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/ion.txt"), "{2a} alpha beta {2b} gamma delta {3a} epsilon", "utf8");
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

function sourceWithGap(gapBytes: number) {
  const prefix = `{2a} ${"a".repeat(100)} `;
  const gap = `{2b} ${"b".repeat(gapBytes)} `;
  const suffix = `{3a} ${"c".repeat(100)}`;
  const content = `${prefix}${gap}${suffix}`;
  const gapStart = prefix.length;
  const gapEnd = gapStart + gap.length;
  writeFileSync(join(root, "raw/plato/greek/ion.txt"), content, "utf8");
  return { content, gapStart, gapEnd };
}

function observationRecord(id: string, startChar: number, endChar: number) {
  return `\`\`\`yaml
observation_id: ${id}
review_status: accepted
source_ref:
  start_char: ${startChar}
  end_char: ${endChar}
\`\`\``;
}

describe("segmented ingest queue", () => {
  it("plans a bounded queue of pending segments", () => {
    const segments = planSegmentedIngestQueue("ion", { targetBytes: 16, limit: 2 });

    expect(segments.map((segment) => segment.span)).toEqual(["2a", "2b"]);
  });

  it("skips completed coverage before applying the queue limit", () => {
    appendSegmentCoverage(
      {
        dialogue: "ion",
        span: "2a",
        startMarker: "2a",
        endMarker: "2a",
        startChar: 0,
        endChar: 16,
        runId: "test-run",
        segmentIndex: 1,
      },
      "processed",
    );

    const segments = planSegmentedIngestQueue("ion", { targetBytes: 16, limit: 2 });

    expect(segments.map((segment) => segment.span)).toEqual(["2b", "3a"]);
  });

  it("dry-runs without invoking model-backed ingest", async () => {
    const events: string[] = [];
    const result = await runSegmentedIngestQueue("ion", {
      dryRun: true,
      targetBytes: 16,
      limit: 2,
      onEvent: (event) => events.push(event.type),
    });

    expect(result.dryRun).toBe(true);
    expect(result.plannedSegments.map((segment) => segment.span)).toEqual(["2a", "2b"]);
    expect(result.completedSegments).toEqual([]);
    expect(events).toEqual(["queue_start"]);
  });

  it("plans gap queue segments despite prior no-observation coverage", () => {
    const { content, gapStart, gapEnd } = sourceWithGap(900);
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      [
        observationRecord("obs_ion_0001", 0, gapStart),
        observationRecord("obs_ion_0002", gapEnd, content.length),
      ].join("\n\n"),
      "utf8",
    );
    appendSegmentCoverage({
      dialogue: "ion",
      span: "2b",
      startMarker: "2b",
      endMarker: "2b",
      startChar: gapStart,
      endChar: gapEnd,
      runId: "test-run",
      segmentIndex: 2,
    });

    const segments = planSegmentedIngestQueue("ion", { gaps: true, limit: 2 });

    expect(segments.map((segment) => segment.span)).toEqual(["2b-3a"]);
  });
});

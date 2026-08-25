import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { appendSegmentCoverage, observationSourceRanges, planGapIngest, planSegmentedIngest, segmentCoverageRanges } from "./segments.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "segmented-ingest-"));
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

function observationRecord(id: string, startChar: number, endChar: number, reviewStatus = "accepted") {
  return `\`\`\`yaml
observation_id: ${id}
review_status: ${reviewStatus}
source_ref:
  start_char: ${startChar}
  end_char: ${endChar}
\`\`\``;
}

describe("segmented ingest planning", () => {
  it("marks segments with existing cited source ranges as completed", () => {
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      `# Ion Observations

\`\`\`yaml
observation_id: obs_ion_0001
source_ref:
  start_char: 0
  end_char: 16
\`\`\`
`,
      "utf8",
    );

    const segments = planSegmentedIngest("ion", 16);

    expect(segments.map((segment) => ({ span: segment.span, completed: segment.completed }))).toEqual([
      { span: "2a", completed: true },
      { span: "2b", completed: false },
      { span: "3a", completed: false },
    ]);
    expect(segments[0]?.existingObservationIds).toEqual(["obs_ion_0001"]);
  });

  it("keeps partially covered segments pending for resume", () => {
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      `# Ion Observations

\`\`\`yaml
observation_id: obs_ion_0001
source_ref:
  start_char: 0
  end_char: 10
\`\`\`
`,
      "utf8",
    );

    const [segment] = planSegmentedIngest("ion", 16);

    expect(segment?.existingObservationIds).toEqual(["obs_ion_0001"]);
    expect(segment?.completed).toBe(false);
  });

  it("filters segmented ingest plans by Stephanus marker range", () => {
    const segments = planSegmentedIngest("ion", 100, { fromMarker: "2b", toMarker: "3a" });

    expect(segments.map((segment) => segment.span)).toEqual(["2b-3a"]);
  });

  it("rejects unknown marker range boundaries", () => {
    expect(() => planSegmentedIngest("ion", 16, { fromMarker: "9a" })).toThrow("Unknown Stephanus marker: 9a");
  });

  it("rejects reversed marker ranges", () => {
    expect(() => planSegmentedIngest("ion", 16, { fromMarker: "3a", toMarker: "2b" })).toThrow(
      "Invalid Stephanus marker range: 3a is after 2b",
    );
  });

  it("marks no-observation segment coverage as completed", () => {
    appendSegmentCoverage({
      dialogue: "ion",
      span: "2b",
      startMarker: "2b",
      endMarker: "2b",
      startChar: 16,
      endChar: 33,
      runId: "test-run",
      segmentIndex: 2,
    });

    const segments = planSegmentedIngest("ion", 16);

    expect(segmentCoverageRanges("ion").map((range) => range.observationId)).toEqual(["coverage:no_observations:ion:2b"]);
    expect(segments.map((segment) => ({ span: segment.span, completed: segment.completed }))).toEqual([
      { span: "2a", completed: false },
      { span: "2b", completed: true },
      { span: "3a", completed: false },
    ]);
  });

  it("marks processed segment coverage as completed even when observations only partially cover it", () => {
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      `# Ion Observations

\`\`\`yaml
observation_id: obs_ion_0001
source_ref:
  start_char: 16
  end_char: 24
\`\`\`
`,
      "utf8",
    );
    appendSegmentCoverage(
      {
        dialogue: "ion",
        span: "2b",
        startMarker: "2b",
        endMarker: "2b",
        startChar: 16,
        endChar: 33,
        runId: "test-run",
        segmentIndex: 2,
      },
      "processed",
    );

    const segments = planSegmentedIngest("ion", 16);

    expect(segments[1]?.existingObservationIds).toEqual(["coverage:processed:ion:2b", "obs_ion_0001"]);
    expect(segments[1]?.completed).toBe(true);
  });

  it("returns sorted observation source ranges for resume checks", () => {
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      `\`\`\`yaml
observation_id: obs_ion_0002
source_ref:
  start_char: 20
  end_char: 30
\`\`\`

\`\`\`yaml
observation_id: obs_ion_0001
source_ref:
  start_char: 0
  end_char: 10
\`\`\`
`,
      "utf8",
    );

    expect(observationSourceRanges("ion").map((range) => range.observationId)).toEqual([
      "obs_ion_0001",
      "obs_ion_0002",
    ]);
  });

  it("plans coverage gaps as pending even when no-observation segment coverage exists", () => {
    const { gapStart, gapEnd, content } = sourceWithGap(900);
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

    const retrySegment = planGapIngest("ion")[0];
    const completedSegment = planSegmentedIngest("ion", 950).find((segment) => segment.span === "2b");

    expect(retrySegment).toMatchObject({
      span: "2b-3a",
      startChar: gapStart,
      endChar: gapEnd,
      completed: false,
      existingObservationIds: [],
    });
    expect(completedSegment?.completed).toBe(true);
  });

  it("returns no gap ingest segments for fully covered source text", () => {
    const { content } = sourceWithGap(900);
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      observationRecord("obs_ion_0001", 0, content.length),
      "utf8",
    );

    expect(planGapIngest("ion")).toEqual([]);
  });

  it("filters gap ingest segments below the minGapChars threshold", () => {
    const { gapStart, gapEnd, content } = sourceWithGap(100);
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      [
        observationRecord("obs_ion_0001", 0, gapStart),
        observationRecord("obs_ion_0002", gapEnd, content.length),
      ].join("\n\n"),
      "utf8",
    );

    expect(planGapIngest("ion", 200)).toEqual([]);
  });
});

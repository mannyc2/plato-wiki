import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCoverageReport, renderCoverageReport, writeCoverageReport } from "./coverage.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeSource(dialogue: string, content = "{1a} abc {1b} def {1c} ghi") {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek", `${dialogue}.txt`), content, "utf8");
}

function record({
  id,
  start,
  end,
  status = "accepted",
}: {
  id: string;
  start: number;
  end: number;
  status?: string;
}) {
  return `\`\`\`yaml
observation_id: ${id}
stephanus_span: 1a
review_status: ${status}
source_ref:
  source_path: raw/plato/greek/fixture.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: ${start}
  end_char: ${end}
  text_sha256: unused
\`\`\``;
}

function writeLedger(records: string[]) {
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(join(root, "wiki/observations/fixture.md"), records.join("\n\n"), "utf8");
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "coverage-report-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  writeSource("fixture");
  writeLedger([]);
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("coverage report", () => {
  it("merges overlapping and adjacent accepted intervals", () => {
    writeLedger([
      record({ id: "obs_fixture_0001", start: 0, end: 8 }),
      record({ id: "obs_fixture_0002", start: 6, end: 12 }),
      record({ id: "obs_fixture_0003", start: 12, end: 18 }),
    ]);

    const [coverage] = buildCoverageReport({ dialogue: "fixture", minGapChars: 1 });

    expect(coverage?.acceptedCoveredChars).toBe(18);
    expect(coverage?.gaps.map((gap) => [gap.startChar, gap.endChar])).toEqual([[18, 26]]);
  });

  it("reports full accepted coverage as ratio 1 with no gaps", () => {
    const source = "{1a} abc {1b} def {1c} ghi";
    writeSource("fixture", source);
    writeLedger([record({ id: "obs_fixture_0001", start: 0, end: source.length })]);

    const [coverage] = buildCoverageReport({ dialogue: "fixture", minGapChars: 1 });

    expect(coverage?.coverageRatio).toBe(1);
    expect(coverage?.gaps).toEqual([]);
  });

  it("classifies a rejected uncovered span separately from never-covered text", () => {
    writeLedger([
      record({ id: "obs_fixture_0001", start: 0, end: 6 }),
      record({ id: "obs_fixture_0002", start: 8, end: 14, status: "rejected" }),
    ]);

    const [coverage] = buildCoverageReport({ dialogue: "fixture", minGapChars: 1 });

    expect(coverage?.gaps.map((gap) => [gap.startChar, gap.endChar, gap.classification])).toEqual([
      [6, 8, "never_covered"],
      [8, 14, "rejected_uncovered"],
      [14, 26, "never_covered"],
    ]);
  });

  it("classifies a gap with no record overlap as never covered", () => {
    writeLedger([record({ id: "obs_fixture_0001", start: 0, end: 6 })]);

    const [coverage] = buildCoverageReport({ dialogue: "fixture", minGapChars: 1 });

    expect(coverage?.gaps).toContainEqual(
      expect.objectContaining({ startChar: 6, endChar: 26, classification: "never_covered" }),
    );
  });

  it("filters accepted gaps below the minGapChars threshold", () => {
    writeLedger([
      record({ id: "obs_fixture_0001", start: 0, end: 10 }),
      record({ id: "obs_fixture_0002", start: 12, end: 26 }),
    ]);

    const [coverage] = buildCoverageReport({ dialogue: "fixture", minGapChars: 3 });

    expect(coverage?.gaps).toEqual([]);
  });

  it("maps gap boundaries to surrounding Stephanus markers", () => {
    const source = "{1a} alpha {1b} beta {1c} gamma";
    writeSource("fixture", source);
    writeLedger([record({ id: "obs_fixture_0001", start: 0, end: source.indexOf("{1b}") })]);

    const [coverage] = buildCoverageReport({ dialogue: "fixture", minGapChars: 1 });

    expect(coverage?.gaps[0]).toMatchObject({
      startMarker: "1b",
      endMarker: "1c",
    });
  });

  it("renders and writes deterministic markdown", () => {
    writeLedger([record({ id: "obs_fixture_0001", start: 0, end: 6 })]);

    const written = writeCoverageReport({ dialogue: "fixture", minGapChars: 1 });
    const content = readFileSync(join(root, written.path), "utf8");

    expect(written.path).toBe("wiki/coverage-gaps.md");
    expect(content).toBe(renderCoverageReport(written.report));
    expect(content).toContain("coverage:");
    expect(content).toContain("never_covered");
  });
});

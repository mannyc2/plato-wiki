import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildAnchorsReport,
  renderAnchorsReportMarkdown,
  renderAnchorsReportText,
  writeAnchorsReport,
} from "./anchors-report.js";
import { setRepoRootForTesting } from "./paths.js";
import { writeTokenIndex } from "./derived/tokens.js";
import { writeTurnIndex } from "./derived/turns.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeSource(content: string) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), content, "utf8");
}

function writeLexicon() {
  mkdirSync(join(root, "derived/plato/anchors"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/anchors/lexicon.toml"),
    `[[groups]]
name = "definition_prompt"
forms = ["τί", "ἐστι", "εἶδος"]

[[groups]]
name = "assent_concession"
forms = ["ναί"]
`,
    "utf8",
  );
}

function writeTurnRegistry() {
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/turns/sigla.toml"),
    `[[dialogues]]
slug = "fixture"
sigla = []
`,
    "utf8",
  );
}

function writeDerivedInputs() {
  writeTurnRegistry();
  writeTurnIndex("fixture");
  writeTokenIndex("fixture");
}

function record({ start, end }: { start: number; end: number }) {
  return `\`\`\`yaml
observation_id: obs_fixture_0001
stephanus_span: 1a
review_status: accepted
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

describe("anchor missing-features report", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "anchors-report-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeSource("{1a} τί ἐστι εἶδος {1b} τί ἐστι");
    writeLexicon();
    writeDerivedInputs();
    writeLedger([]);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("reports anchor-dense sections with no overlapping accepted observation", () => {
    const report = buildAnchorsReport({ dialogue: "fixture" });

    expect(report).toHaveLength(1);
    expect(report[0]).toMatchObject({
      dialogue: "fixture",
      marker: "1a",
      anchorCount: 3,
      acceptedObservations: 0,
      groupCounts: { definition_prompt: 3 },
    });
    expect(renderAnchorsReportText(report)).toContain("fixture 1a: anchors=3");
  });

  it("omits anchor-dense sections with overlapping accepted coverage", () => {
    const source = "{1a} τί ἐστι εἶδος {1b} τί ἐστι";
    writeLedger([record({ start: 0, end: source.indexOf("{1b}") })]);

    expect(buildAnchorsReport({ dialogue: "fixture" })).toEqual([]);
  });

  it("keeps the threshold boundary at three anchors", () => {
    expect(buildAnchorsReport({ dialogue: "fixture", minAnchorCount: 4 })).toEqual([]);
    expect(buildAnchorsReport({ dialogue: "fixture", minAnchorCount: 3 })).toHaveLength(1);
  });

  it("writes deterministic markdown under derived anchors", () => {
    const written = writeAnchorsReport({ dialogue: "fixture" });
    const content = readFileSync(join(root, written.path), "utf8");

    expect(written.path).toBe("derived/plato/anchors/report.md");
    expect(content).toBe(renderAnchorsReportMarkdown(written.report));
    expect(content).toContain("| fixture | 1a |");
  });
});

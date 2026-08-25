import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { writeTokenIndex } from "./tokens.js";
import { writeTurnIndex } from "./turns.js";
import {
  assentMetricsPath,
  buildAssentMetrics,
  buildProcedureMetrics,
  buildTurnLengthMetrics,
  formatAssentMetricsToon,
  formatProcedureMetricsToon,
  formatTurnLengthMetricsToon,
  procedureMetricsPath,
  turnLengthMetricsPath,
  writeDerivedMetrics,
} from "./metrics.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeSource(content: string) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), content, "utf8");
}

function writeTurnRegistry() {
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/turns/sigla.toml"),
    `[[dialogues]]
slug = "fixture"
sigla = ["ΑΑ.", "ΒΒ."]
`,
    "utf8",
  );
}

function writeAnchorLexicon() {
  mkdirSync(join(root, "derived/plato/anchors"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/anchors/lexicon.toml"),
    `[[groups]]
name = "assent_concession"
forms = ["ναί", "πάνυ γε", "ὁμολογεῖς"]
`,
    "utf8",
  );
}

function writeProcedureRegistry() {
  mkdirSync(join(root, "derived/plato/metrics/procedure"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/metrics/procedure/anchors.toml"),
    `[[groups]]
name = "brevity_demand"
forms = ["βραχέως"]

[[groups]]
name = "answer_demand"
forms = ["ἀποκρίνου"]
`,
    "utf8",
  );
}

function prepare(content: string) {
  writeSource(content);
  writeTurnRegistry();
  writeAnchorLexicon();
  writeProcedureRegistry();
  writeTurnIndex("fixture");
  writeTokenIndex("fixture");
}

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path, "utf8")).digest("hex");
}

describe("deterministic derived metrics", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "derived-metrics-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("computes turn length rows and speaker summaries from generated token indexes", () => {
    prepare("{1a} ΑΑ. εἶναί τι.\nΒΒ. ναί.\n");

    const metrics = buildTurnLengthMetrics("fixture");
    expect(metrics.turns.map((turn) => [turn.turnId, turn.speaker, turn.tokenCount])).toEqual([
      ["turn_fixture_0001", "ΑΑ.", 3],
      ["turn_fixture_0002", "ΒΒ.", 2],
    ]);
    expect(metrics.speakers.map((speaker) => [speaker.speaker, speaker.turnCount, speaker.totalTokens])).toEqual([
      ["ΑΑ.", 1, 3],
      ["ΒΒ.", 1, 2],
    ]);
  });

  it("counts assent with token boundaries and builds short-assent stretches", () => {
    prepare("{1a} ΑΑ. εἶναί τι.\nΒΒ. ναί.\nΑΑ. ἐρωτῶ;\nΒΒ. ναί.\nΑΑ. λόγος.\nΒΒ. πάνυ γε.\n");

    const metrics = buildAssentMetrics("fixture");
    const alpha = metrics.speakers.find((speaker) => speaker.speaker === "ΑΑ.");
    const beta = metrics.speakers.find((speaker) => speaker.speaker === "ΒΒ.");
    expect(alpha?.assentOccurrences).toBe(0);
    expect(beta).toMatchObject({ assentOccurrences: 3, assentTurns: 3, shortAssentTurns: 3 });
    expect(metrics.stretches).toHaveLength(1);
    expect(metrics.stretches[0]).toMatchObject({
      speaker: "ΒΒ.",
      startTurnId: "turn_fixture_0002",
      endTurnId: "turn_fixture_0006",
      turnCount: 3,
    });
  });

  it("emits procedure candidates from the literal registry", () => {
    prepare("{1a} ΑΑ. ἀποκρίνου βραχέως.\nΒΒ. ναί.\n");

    const metrics = buildProcedureMetrics("fixture");
    expect(metrics.candidates.map((candidate) => [candidate.group, candidate.form, candidate.turnId])).toEqual([
      ["answer_demand", "ἀποκρίνου", "turn_fixture_0001"],
      ["brevity_demand", "βραχέως", "turn_fixture_0001"],
    ]);
  });

  it("formats all metric artifacts without trailing whitespace", () => {
    prepare("{1a} ΑΑ. ἀποκρίνου βραχέως.\nΒΒ. ναί.\nΑΑ. ἐρωτῶ;\nΒΒ. ναί.\nΑΑ. λόγος.\nΒΒ. πάνυ γε.\n");

    const outputs = [
      formatTurnLengthMetricsToon(buildTurnLengthMetrics("fixture")),
      formatAssentMetricsToon(buildAssentMetrics("fixture")),
      formatProcedureMetricsToon(buildProcedureMetrics("fixture")),
    ];
    expect(outputs.every((output) => output.split("\n").every((line) => !/[ \t]$/u.test(line)))).toBe(true);
  });

  it("writes byte-stable metric files", () => {
    prepare("{1a} ΑΑ. ἀποκρίνου βραχέως.\nΒΒ. ναί.\nΑΑ. ἐρωτῶ;\nΒΒ. ναί.\nΑΑ. λόγος.\nΒΒ. πάνυ γε.\n");

    writeDerivedMetrics("fixture");
    const paths = [turnLengthMetricsPath("fixture"), assentMetricsPath("fixture"), procedureMetricsPath("fixture")].map((path) =>
      join(root, path),
    );
    const first = paths.map((path) => fileSha256(path));
    writeDerivedMetrics("fixture");
    expect(paths.map((path) => fileSha256(path))).toEqual(first);
  });
});

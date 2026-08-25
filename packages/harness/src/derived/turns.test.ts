import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  buildTurnIndex,
  formatTurnIndexToon,
  readSiglaRegistry,
  turnIndexPath,
  writeTurnIndex,
  writeTurnIndexes,
} from "./turns.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeSource(content: string, slug = "fixture") {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, `raw/plato/greek/${slug}.txt`), content, "utf8");
}

function writeRegistry(sigla: string[], slug = "fixture") {
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/turns/sigla.toml"),
    `[[dialogues]]
slug = "${slug}"
sigla = [${sigla.map((siglum) => JSON.stringify(siglum)).join(", ")}]
`,
    "utf8",
  );
}

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path, "utf8")).digest("hex");
}

describe("speaker turn index", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "turn-index-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("reads the TOML sigla registry through the repo root", () => {
    writeSource("{1a} ΑΑ. λόγος.");
    writeRegistry(["ΑΑ."]);

    expect(readSiglaRegistry().dialogues.get("fixture")).toEqual(["ΑΑ."]);
  });

  it("extracts basic line-start turns with markers and partitioned offsets", () => {
    const source = "{1a} ΑΑ. λόγος πρῶτος.\nΒΒ. {1b} ναί.\n";
    writeSource(source);
    writeRegistry(["ΑΑ.", "ΒΒ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns).toHaveLength(2);
    expect(index.turns[0]).toMatchObject({
      turnId: "turn_fixture_0001",
      speaker: "ΑΑ.",
      startMarker: "1a",
      endMarker: "1a",
      startChar: 0,
      greekCharCount: 13,
    });
    expect(index.turns[1]).toMatchObject({
      turnId: "turn_fixture_0002",
      speaker: "ΒΒ.",
      startMarker: "1a",
      endMarker: "1b",
      startChar: source.indexOf("ΒΒ."),
      endChar: source.length,
      greekCharCount: 5,
    });
    expect(index.turns[0]!.endChar).toBe(index.turns[1]!.startChar);
  });

  it("starts marker-prefixed turns at the marker and leaves the previous end marker unchanged", () => {
    const source = "{1a} ΑΑ. πρῶτος.\n{1b} ΒΒ. δεύτερος.";
    writeSource(source);
    writeRegistry(["ΑΑ.", "ΒΒ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns).toHaveLength(2);
    expect(index.turns[0]).toMatchObject({ endMarker: "1a", endChar: source.indexOf("{1b}") });
    expect(index.turns[1]).toMatchObject({ startMarker: "1b", startChar: source.indexOf("{1b}") });
  });

  it("accepts allowlisted turn labels without a space before the utterance", () => {
    const source = "{1a} ΑΑ.πρῶτος.\nΒΒ.δεύτερος.";
    writeSource(source);
    writeRegistry(["ΑΑ.", "ΒΒ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns.map((turn) => turn.speaker)).toEqual(["ΑΑ.", "ΒΒ."]);
    expect(index.turns[1]).toMatchObject({ startChar: source.indexOf("ΒΒ.") });
  });

  it("uses the longest two-token siglum and allows its embedded shorter siglum", () => {
    const source = "{1a} ΝΕ. ΣΩ. πρῶτος.\n{1b} ΣΩ. δεύτερος.";
    writeSource(source);
    writeRegistry(["ΝΕ. ΣΩ.", "ΣΩ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns.map((turn) => turn.speaker)).toEqual(["ΝΕ. ΣΩ.", "ΣΩ."]);
  });

  it("emits one unattributed whole-file turn for no-sigla dialogues", () => {
    const source = "{1a} λόγος πρῶτος.\n{1b} λόγος δεύτερος.";
    writeSource(source);
    writeRegistry([]);

    const index = buildTurnIndex("fixture");
    expect(index.turns).toHaveLength(1);
    expect(index.turns[0]).toMatchObject({ speaker: "(none)", startChar: 0, endChar: source.length });
  });

  it("keeps a Greek title lead as an unattributed turn", () => {
    const source = "Τίτλος {1a} ΑΑ. λόγος.";
    writeSource(source);
    writeRegistry(["ΑΑ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns).toHaveLength(2);
    expect(index.turns[0]).toMatchObject({ speaker: "(none)", startChar: 0, endChar: source.indexOf("{1a}") });
    expect(index.turns[1]).toMatchObject({ speaker: "ΑΑ.", startChar: source.indexOf("{1a}") });
  });

  it("merges non-Greek leading markup into the first attributed turn", () => {
    const source = "{b1}\n{1a} ΑΑ. λόγος.";
    writeSource(source);
    writeRegistry(["ΑΑ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns).toHaveLength(1);
    expect(index.turns[0]).toMatchObject({ speaker: "ΑΑ.", startChar: 0 });
  });

  it("throws on candidate unknown sigla", () => {
    const source = "{1a} ΑΑ. λόγος.\nΓΓ. ξένος.";
    writeSource(source);
    writeRegistry(["ΑΑ."]);

    expect(() => buildTurnIndex("fixture")).toThrow(/Unknown siglum "ΓΓ\."/u);
  });

  it("throws on allowlisted sigla appearing outside a turn start", () => {
    const source = "{1a} ΑΑ. λόγος με ΑΑ. μέσον.";
    writeSource(source);
    writeRegistry(["ΑΑ."]);

    expect(() => buildTurnIndex("fixture")).toThrow(/Stray siglum "ΑΑ\."/u);
  });

  it("ignores allowlisted sigla embedded inside Greek words", () => {
    const source = "{1a} ΜΕΝ. λόγος ὑποπτεύοιΜΕΝ.\nΜΕΝ. ναί.";
    writeSource(source);
    writeRegistry(["ΜΕΝ."]);

    const index = buildTurnIndex("fixture");
    expect(index.turns.map((turn) => turn.speaker)).toEqual(["ΜΕΝ.", "ΜΕΝ."]);
  });

  it("writes a byte-stable TOON file without trailing whitespace", () => {
    writeSource("{1a} ΑΑ. λόγος.\n{1b} ΒΒ. ναί.");
    writeRegistry(["ΑΑ.", "ΒΒ."]);

    const output = formatTurnIndexToon(buildTurnIndex("fixture"));
    expect(output.split("\n").every((line) => !/[ \t]$/u.test(line))).toBe(true);

    writeTurnIndex("fixture");
    const path = join(root, turnIndexPath("fixture"));
    const first = fileSha256(path);
    writeTurnIndex("fixture");
    expect(fileSha256(path)).toBe(first);
  });

  it("requires registry coverage for every Greek source when writing all indexes", () => {
    writeSource("{1a} ΑΑ. λόγος.", "fixture");
    writeSource("{1a} ΒΒ. λόγος.", "missing");
    writeRegistry(["ΑΑ."], "fixture");

    expect(() => writeTurnIndexes()).toThrow(/Missing registry: missing/u);
  });
});

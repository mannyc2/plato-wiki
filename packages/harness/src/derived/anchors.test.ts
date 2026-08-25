import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  anchorIndexPath,
  buildAnchorIndex,
  formatAnchorIndexToon,
  readAnchorLexicon,
  writeAnchorIndex,
} from "./anchors.js";
import { writeTokenIndex } from "./tokens.js";
import { writeTurnIndex } from "./turns.js";

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
forms = ["τί", "τί ἐστι", "εἶδος"]

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

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path, "utf8")).digest("hex");
}

describe("anchor occurrence index", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "anchors-index-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeSource("{1a} τί ἐστι εἶδος {1b} ναί τί ἐστι");
    writeLexicon();
    writeDerivedInputs();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("reads the TOML lexicon through the repo root", () => {
    expect(readAnchorLexicon().groups.map((group) => group.name)).toEqual(["definition_prompt", "assent_concession"]);
  });

  it("derives exact occurrences with offsets, markers, and overlapping forms", () => {
    const source = "{1a} τί ἐστι εἶδος {1b} ναί τί ἐστι";
    const index = buildAnchorIndex("fixture");

    expect(index.occurrences).toEqual([
      {
        group: "definition_prompt",
        form: "τί",
        startChar: source.indexOf("τί"),
        endChar: source.indexOf("τί") + "τί".length,
        marker: "1a",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000001"],
      },
      {
        group: "definition_prompt",
        form: "τί ἐστι",
        startChar: source.indexOf("τί ἐστι"),
        endChar: source.indexOf("τί ἐστι") + "τί ἐστι".length,
        marker: "1a",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000001", "tok_fixture_000002"],
      },
      {
        group: "definition_prompt",
        form: "εἶδος",
        startChar: source.indexOf("εἶδος"),
        endChar: source.indexOf("εἶδος") + "εἶδος".length,
        marker: "1a",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000003"],
      },
      {
        group: "assent_concession",
        form: "ναί",
        startChar: source.indexOf("ναί"),
        endChar: source.indexOf("ναί") + "ναί".length,
        marker: "1b",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000004"],
      },
      {
        group: "definition_prompt",
        form: "τί",
        startChar: source.lastIndexOf("τί"),
        endChar: source.lastIndexOf("τί") + "τί".length,
        marker: "1b",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000005"],
      },
      {
        group: "definition_prompt",
        form: "τί ἐστι",
        startChar: source.lastIndexOf("τί ἐστι"),
        endChar: source.lastIndexOf("τί ἐστι") + "τί ἐστι".length,
        marker: "1b",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000005", "tok_fixture_000006"],
      },
    ]);
  });

  it("does not match anchor forms inside larger Greek words", () => {
    writeSource("{1a} εἶναί τι ναί");
    writeDerivedInputs();

    const index = buildAnchorIndex("fixture");
    expect(index.occurrences.filter((occurrence) => occurrence.form === "ναί")).toEqual([
      {
        group: "assent_concession",
        form: "ναί",
        startChar: "{1a} εἶναί τι ".length,
        endChar: "{1a} εἶναί τι ναί".length,
        marker: "1a",
        turnId: "turn_fixture_0001",
        tokenIds: ["tok_fixture_000003"],
      },
    ]);
  });

  it("writes a byte-stable TOON file without trailing whitespace", () => {
    const output = formatAnchorIndexToon(buildAnchorIndex("fixture"));
    expect(output.split("\n").every((line) => !/[ \t]$/u.test(line))).toBe(true);

    writeAnchorIndex("fixture");
    const path = join(root, anchorIndexPath("fixture"));
    const first = fileSha256(path);
    writeAnchorIndex("fixture");
    expect(fileSha256(path)).toBe(first);
  });
});

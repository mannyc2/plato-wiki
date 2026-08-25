import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { writeTurnIndex } from "./turns.js";
import {
  buildTokenIndex,
  formatTokenIndexToon,
  normalizeGreekToken,
  parseTokenIndexToon,
  tokenizeGreekText,
  tokenIndexPath,
  writeTokenIndex,
} from "./tokens.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeSource(content: string) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), content, "utf8");
}

function writeRegistry() {
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

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path, "utf8")).digest("hex");
}

describe("Greek token index", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "token-index-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("normalizes Greek tokens without lemmatizing", () => {
    expect(normalizeGreekToken("Δίκης")).toBe("δικησ");
    expect(normalizeGreekToken("λόγος")).toBe("λογοσ");
  });

  it("tokenizes only contiguous Greek-letter spans with offsets", () => {
    const source = "{1a} ΑΑ. δίκην, κατ' εἴδη.";
    expect(tokenizeGreekText(source)).toEqual([
      { surface: "ΑΑ", normalized: "αα", startChar: source.indexOf("ΑΑ"), endChar: source.indexOf("ΑΑ") + 2 },
      { surface: "δίκην", normalized: "δικην", startChar: source.indexOf("δίκην"), endChar: source.indexOf("δίκην") + 5 },
      { surface: "κατ", normalized: "κατ", startChar: source.indexOf("κατ"), endChar: source.indexOf("κατ") + 3 },
      { surface: "εἴδη", normalized: "ειδη", startChar: source.indexOf("εἴδη"), endChar: source.indexOf("εἴδη") + 4 },
    ]);
  });

  it("assigns tokens to generated turn ids and Stephanus markers", () => {
    const source = "{1a} ΑΑ. δίκην.\n{1b} ΒΒ. ναί.";
    writeSource(source);
    writeRegistry();
    writeTurnIndex("fixture");

    const index = buildTokenIndex("fixture");
    expect(index.turnIndexPath).toBe("derived/plato/turns/fixture.toon");
    expect(index.tokens.map((token) => [token.surface, token.normalized, token.turnId, token.marker])).toEqual([
      ["ΑΑ", "αα", "turn_fixture_0001", "1a"],
      ["δίκην", "δικην", "turn_fixture_0001", "1a"],
      ["ΒΒ", "ββ", "turn_fixture_0002", "1b"],
      ["ναί", "ναι", "turn_fixture_0002", "1b"],
    ]);
  });

  it("requires a generated turn index", () => {
    writeSource("{1a} ΑΑ. δίκην.");
    writeRegistry();

    expect(() => buildTokenIndex("fixture")).toThrow(/Missing generated turn index/u);
  });

  it("round-trips through the TOON format", () => {
    writeSource("{1a} ΑΑ. δίκην.\n{1b} ΒΒ. ναί.");
    writeRegistry();
    writeTurnIndex("fixture");

    const index = buildTokenIndex("fixture");
    expect(parseTokenIndexToon(formatTokenIndexToon(index))).toEqual(index);
  });

  it("writes a byte-stable TOON file without trailing whitespace", () => {
    writeSource("{1a} ΑΑ. δίκην.\n{1b} ΒΒ. ναί.");
    writeRegistry();
    writeTurnIndex("fixture");

    const output = formatTokenIndexToon(buildTokenIndex("fixture"));
    expect(output.split("\n").every((line) => !/[ \t]$/u.test(line))).toBe(true);

    writeTokenIndex("fixture");
    const path = join(root, tokenIndexPath("fixture"));
    const first = fileSha256(path);
    writeTokenIndex("fixture");
    expect(fileSha256(path)).toBe(first);
  });
});

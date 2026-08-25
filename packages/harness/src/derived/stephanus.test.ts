import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { createSourceSpanResolver, resolveEnglishSpan, resolveSourceSpan } from "../source.js";
import {
  buildEnglishStephanusIndex,
  buildStephanusIndex,
  englishStephanusIndexPath,
  formatStephanusIndexToon,
  listEnglishDialogues,
  parseStephanusIndexToon,
  planStephanusSegments,
  stephanusIndexPath,
  writeEnglishStephanusIndex,
  writeStephanusIndex,
} from "./stephanus.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeFixture(content = "{2a} alpha {2b} beta {3a} gamma") {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), content, "utf8");
}

function writeEnglishFixture(content = "{2a} first {3a} second") {
  mkdirSync(join(root, "raw/plato/english"), { recursive: true });
  writeFileSync(join(root, "raw/plato/english/fixture.txt"), content, "utf8");
}

function writeIndexContent(content: string) {
  const path = join(root, stephanusIndexPath("fixture"));
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content, "utf8");
}

describe("Stephanus index", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "stephanus-index-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("derives marker offsets with next-marker end semantics", () => {
    const content = "{2a} alpha {2b} beta {3a} gamma";
    const index = buildStephanusIndex("fixture");

    expect(index.markers).toHaveLength(3);
    expect(index.markers[0]).toMatchObject({ marker: "2a", startChar: 0, endChar: content.indexOf("{2b}") });
    expect(index.markers[1]).toMatchObject({
      marker: "2b",
      startChar: content.indexOf("{2b}"),
      endChar: content.indexOf("{3a}"),
    });
    expect(index.markers[2]).toMatchObject({ marker: "3a", startChar: content.indexOf("{3a}"), endChar: content.length });
  });

  it("round-trips through the TOON format", () => {
    const index = buildStephanusIndex("fixture");

    expect(parseStephanusIndexToon(formatStephanusIndexToon(index))).toEqual(index);
  });

  it("does not emit trailing whitespace in the TOON format", () => {
    const output = formatStephanusIndexToon(buildStephanusIndex("fixture"));

    expect(output.split("\n").every((line) => !/[ \t]$/u.test(line))).toBe(true);
  });

  it("keeps resolveSourceSpan equivalent before and after an index exists", () => {
    const before = resolveSourceSpan("fixture", "2a-2b").source_ref;
    const { markerCount } = writeStephanusIndex("fixture");
    const after = resolveSourceSpan("fixture", "2a-2b").source_ref;

    expect(markerCount).toBe(3);
    expect(after).toEqual(before);
    expect(after.start_char).toBe(buildStephanusIndex("fixture").markers[0]?.startChar);
    expect(after.end_char).toBe(buildStephanusIndex("fixture").markers[2]?.startChar);
  });

  it("keeps a cached resolver equivalent to standalone Greek and English resolution", () => {
    writeEnglishFixture();
    writeStephanusIndex("fixture");
    writeEnglishStephanusIndex("fixture");
    const resolver = createSourceSpanResolver();

    for (const span of ["2a", "2a-2b", "3a"]) {
      expect(resolver.resolveSourceSpan("fixture", span)).toEqual(resolveSourceSpan("fixture", span));
      expect(resolver.resolveEnglishSpan("fixture", span)).toEqual(resolveEnglishSpan("fixture", span));
    }
  });

  it("keeps resolver caches scoped to their creation root", () => {
    const primary = createSourceSpanResolver();
    const alternateRoot = mkdtempSync(join(tmpdir(), "stephanus-index-alternate-"));
    let restoreAlternate: (() => void) | undefined;

    try {
      mkdirSync(join(alternateRoot, "raw/plato/greek"), { recursive: true });
      writeFileSync(join(alternateRoot, "raw/plato/greek/fixture.txt"), "{2a} revised {2b} beta {3a} gamma", "utf8");
      restoreAlternate = setRepoRootForTesting(alternateRoot);
      const alternate = createSourceSpanResolver();

      expect(alternate.resolveSourceSpan("fixture", "2a").text).toBe("{2a} revised ");
      expect(primary.resolveSourceSpan("fixture", "2a").text).toBe("{2a} alpha ");
    } finally {
      restoreAlternate?.();
      setRepoRootForTesting(root);
      rmSync(alternateRoot, { recursive: true, force: true });
    }
  });

  it("rejects a stale index instead of silently scanning raw text", () => {
    writeStephanusIndex("fixture");
    writeFixture("{2a} alpha {2b} beta {3a} gamma plus appended text");

    expect(() => resolveSourceSpan("fixture", "3a")).toThrow(/Stale Stephanus index/);
  });

  it("rejects a stale index when a cached resolver first loads a source", () => {
    writeStephanusIndex("fixture");
    writeFixture("{2a} alpha {2b} beta {3a} gamma plus appended text");
    const resolver = createSourceSpanResolver();

    expect(() => resolver.resolveSourceSpan("fixture", "3a")).toThrow(/Stale Stephanus index/);
  });

  it("rejects a malformed index instead of silently scanning raw text", () => {
    writeIndexContent("not a stephanus index\n");

    expect(() => resolveSourceSpan("fixture", "2a-2b")).toThrow(/Malformed Stephanus index header/);
  });

  it("builds and round-trips an English index without touching the Greek one", () => {
    writeEnglishFixture();
    const index = buildEnglishStephanusIndex("fixture");

    expect(index.sourcePath).toBe("raw/plato/english/fixture.txt");
    expect(index.markers.map((entry) => entry.marker)).toEqual(["2a", "3a"]);
    expect(parseStephanusIndexToon(formatStephanusIndexToon(index))).toEqual(index);

    const { path, markerCount } = writeEnglishStephanusIndex("fixture");
    expect(path).toBe(englishStephanusIndexPath("fixture"));
    expect(markerCount).toBe(2);
    expect(listEnglishDialogues()).toEqual(["fixture"]);
  });

  it("resolves English spans against the English source", () => {
    writeEnglishFixture();
    writeEnglishStephanusIndex("fixture");

    const resolution = resolveEnglishSpan("fixture", "2a");
    expect(resolution.source_ref.source_path).toBe("raw/plato/english/fixture.txt");
    expect(resolution.text).toBe("{2a} first ");
    expect(resolution.source_ref.start_char).toBe(0);
  });

  it("projects a canonical Greek end marker omitted from English when the next marker is unambiguous", () => {
    writeEnglishFixture();
    writeEnglishStephanusIndex("fixture");

    const resolution = resolveEnglishSpan("fixture", "2a-2b");

    expect(resolution.text).toBe("{2a} first ");
    expect(resolution.source_ref).toMatchObject({
      stephanus_span: "2a-2b",
      start_marker: "2a",
      end_marker: "2b",
      start_char: 0,
      end_char: "{2a} first ".length,
    });
  });

  it("rejects missing English starts and ambiguous missing English ends", () => {
    writeEnglishFixture();
    writeEnglishStephanusIndex("fixture");
    expect(() => resolveEnglishSpan("fixture", "2b")).toThrow(/start marker 2b is absent/);

    writeFixture("{2a} alpha {2b} beta {2c} gamma {3a} delta");
    expect(() => resolveEnglishSpan("fixture", "2a-2b")).toThrow(/ambiguous missing English end marker 2b/);
  });

  it("rejects a stale English index instead of silently scanning raw text", () => {
    writeEnglishFixture();
    writeEnglishStephanusIndex("fixture");
    writeEnglishFixture("{2a} first {3a} second plus appended text");

    expect(() => resolveEnglishSpan("fixture", "3a")).toThrow(/Stale Stephanus index/);
    expect(() => resolveEnglishSpan("fixture", "3a")).toThrow(/derive stephanus-english fixture/);
  });

  it("plans bounded segments that cover the dialogue in order", () => {
    const segments = planStephanusSegments("fixture", 16);

    expect(segments).toHaveLength(3);
    expect(segments.map((segment) => `${segment.startMarker}-${segment.endMarker}`)).toEqual(["2a-2a", "2b-2b", "3a-3a"]);
    expect(segments[0]?.startChar).toBe(0);
    expect(segments.at(-1)?.endChar).toBe("{2a} alpha {2b} beta {3a} gamma".length);
  });
});

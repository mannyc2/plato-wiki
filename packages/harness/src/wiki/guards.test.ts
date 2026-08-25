import { describe, expect, it } from "bun:test";
import { assertReadableWikiPath } from "./guards.js";

describe("assertReadableWikiPath", () => {
  it("allows canonical source text, feature registry, and observation ledgers", () => {
    expect(() => assertReadableWikiPath("raw/plato/greek/euthyphro.txt")).not.toThrow();
    expect(() => assertReadableWikiPath("wiki/features-so-far.md")).not.toThrow();
    expect(() => assertReadableWikiPath("wiki/observations/euthyphro.md")).not.toThrow();
  });

  it("rejects harness context and translation files", () => {
    expect(() => assertReadableWikiPath("docs/plato-wiki-extraction-protocol.md")).toThrow();
    expect(() => assertReadableWikiPath("raw/plato/translations/euthyphro_eng.txt")).toThrow();
  });
});

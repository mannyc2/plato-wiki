import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { stephanusMarkers } from "../source.js";

export type ReadingSourceLanguage = "grc" | "en";
export type ReadingSourceParagraph = { startChar: number; text: string };

// Markup and spacing around punctuation are presentation choices. Preserve
// Unicode word boundaries and every nonspace character so joining two source
// words cannot pass the fidelity check.
export function normalizeReadingSourceText(text: string): string {
  const tokens = text.replace(/\{[^}]*\}/gu, "").match(/[\p{L}\p{M}\p{N}]+|[^\s]/gu) ?? [];
  return tokens.join("\u0000");
}

export function readReadingSource(dialogue: string, language: ReadingSourceLanguage) {
  const path = join(getRepoRoot(), "raw/plato", language === "grc" ? "greek" : "english", `${dialogue}.txt`);
  if (!existsSync(path)) {
    if (language === "grc") throw new Error(`Reading ${dialogue} has no canonical Greek source.`);
    return undefined;
  }
  const content = readFileSync(path, "utf8");
  if (stephanusMarkers(content).length === 0) throw new Error(`Reading ${dialogue} ${language} source has no Stephanus spine.`);
  return content;
}

export function readingSourceLines(content: string): ReadingSourceParagraph[] {
  const firstMarker = stephanusMarkers(content)[0]?.index;
  const lines: ReadingSourceParagraph[] = [];
  let startChar = 0;
  for (const text of content.split("\n")) {
    const markerOffset = firstMarker === undefined ? 0 : firstMarker - startChar;
    // Imported titles sometimes share the first dialogue line. Keep their
    // lexical text as a separate leading paragraph, with its original offset,
    // so title text does not conceal the first printed speaker label.
    if (markerOffset > 0 && markerOffset < text.length && normalizeReadingSourceText(text.slice(0, markerOffset)) !== "") {
      lines.push({ startChar, text: text.slice(0, markerOffset) });
      lines.push({ startChar: startChar + markerOffset, text: text.slice(markerOffset) });
    } else {
      lines.push({ startChar, text });
    }
    startChar += text.length + 1;
  }
  return lines;
}

export function readingSourceParagraphs(dialogue: string, language: ReadingSourceLanguage): ReadingSourceParagraph[] {
  const source = readReadingSource(dialogue, language);
  return source === undefined ? [] : readingSourceLines(source)
    .map((line) => ({ startChar: line.startChar, text: normalizeReadingSourceText(line.text) }))
    .filter((line) => line.text !== "");
}

export function readingSourceMatches(
  actual: readonly ReadingSourceParagraph[],
  expected: readonly ReadingSourceParagraph[],
): boolean {
  return actual.length === expected.length && actual.every((paragraph, index) =>
    paragraph.startChar === expected[index]!.startChar && paragraph.text === expected[index]!.text,
  );
}

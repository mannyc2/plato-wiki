// The English rendering at a Stephanus reference, read from the repository when the kit is built.
// passages.ts calls it as a Bun macro, so a page's passages come from the rendering itself and
// nothing retypes Plato; the browser bundle carries only the words at the references named.
//
// The rendering marks Stephanus markers, places, quotations and paragraphs in braces, and starts
// each turn on a new line with its speaker's name. A page shows the words alone, but the checker
// still needs whose turn holds a quotation and whether the words are quoted speech, such as the
// Laws' speech inside Socrates' turn, so the result keeps both, in positions within `text`.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnglishErrata } from "@plato-observation-wiki/harness";
import { readPages } from "./page-sources";

const REPO = join(import.meta.dir, "../../../..");

export type Rendered = {
  readonly text: string;
  // Ranges the rendering marks as quoted speech or verse.
  readonly quoted: ReadonlyArray<readonly [number, number]>;
  // Where each line starts, with the words before its first full stop: the speaker's name in a
  // dialogue rendered turn by turn. The first entry, at 0, is the line the reference starts in.
  readonly lines: ReadonlyArray<readonly [number, string]>;
  // Words the English gets wrong against the Greek (raw/plato/english/errata.toml), with what the
  // Greek says. The rendering's bytes are fixed, so a view marks these instead of rewriting them.
  readonly errata: ReadonlyArray<{ readonly at: readonly [number, number]; readonly correction: string }>;
};

const markerFile = (dialogue: string): string => join(REPO, "derived/plato/stephanus-english", `${dialogue}.toon`);

// The marker table's rows are `marker | start_char | end_char` offsets into the rendering.
const markers = (dialogue: string): ReadonlyMap<string, readonly [number, number]> => {
  const rows = readFileSync(markerFile(dialogue), "utf8")
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells): cells is [string, string, string] => cells.length === 3 && /^\d+$/u.test(cells[1] ?? ""));
  return new Map(rows.map(([marker, start, end]) => [marker, [Number(start), Number(end)] as const]));
};

// "44a-b" runs from 44a to 44b, and "47e-48a" from 47e to 48a.
export const bounds = (ref: string): readonly [string, string] => {
  const match = /^(\d+)([a-e])(?:-(\d+)?([a-e]))?$/u.exec(ref);
  if (!match) throw new Error(`${ref} is not a Stephanus reference`);
  const [, page = "", letter = "", endPage, endLetter] = match;
  return [`${page}${letter}`, endLetter ? `${endPage ?? page}${endLetter}` : `${page}${letter}`];
};

const TAG = /\{[^}]*\}/gu;
const QUOTE_OPEN = /^\{(?:q|quote)\}$/u;
const QUOTE_CLOSE = /^\{\/(?:q|quote)\}$/u;
// No space before closing punctuation, so "Delos {/place} , at" reads "Delos, at".
const CLOSING = /[.,;:!?’”)]/u;

const head = (line: string): string =>
  /^([A-Za-z][A-Za-z’]*(?: [A-Za-z][A-Za-z’]*){0,3})\.\s/u.exec(line.replace(/^(?:\{[^}]*\}\s*)*/u, ""))?.[1] ?? "";

// Quotations open where the reference starts, counted from the start of the rendering.
const depthAt = (source: string, start: number): number =>
  [...source.slice(0, start).matchAll(TAG)].reduce(
    (depth, [tag]) => (QUOTE_OPEN.test(tag) ? depth + 1 : QUOTE_CLOSE.test(tag) ? Math.max(0, depth - 1) : depth),
    0,
  );

export const rendered = (key: string): Rendered => {
  const [dialogue = "", ref = ""] = key.split(" ");
  const [first, last] = bounds(ref);
  const table = markers(dialogue);
  const start = table.get(first)?.[0];
  const end = table.get(last)?.[1];
  if (start === undefined || end === undefined || end <= start) throw new Error(`${key} is not in the ${dialogue} rendering`);
  const source = readFileSync(join(REPO, "raw/plato/english", `${dialogue}.txt`), "utf8");
  const lineAt = (at: number): string => {
    const close = source.indexOf("\n", at);
    return head(source.slice(at, close < 0 ? source.length : close));
  };

  let text = "";
  let space = false;
  let depth = depthAt(source, start);
  // A quotation or a line that has begun but shows no word yet takes its position from the next one.
  let opening = depth > 0;
  let openedAt = 0;
  let newLine: string | undefined;
  const quoted: Array<readonly [number, number]> = [];
  const lines: Array<readonly [number, string]> = [[0, lineAt(source.lastIndexOf("\n", start - 1) + 1)]];
  let at = start;
  for (const piece of source.slice(start, end).split(/(\{[^}]*\}|\n)/u)) {
    at += piece.length;
    if (piece === "\n") {
      newLine = lineAt(at);
      space = true;
      continue;
    }
    if (piece.startsWith("{")) {
      if (QUOTE_OPEN.test(piece) && depth++ === 0) opening = true;
      if (QUOTE_CLOSE.test(piece) && depth > 0 && --depth === 0 && !opening) quoted.push([openedAt, text.length]);
      space = true;
      continue;
    }
    for (const char of piece) {
      if (/\s/u.test(char)) {
        space = true;
        continue;
      }
      if (space && text !== "" && !CLOSING.test(char)) text += " ";
      space = false;
      if (newLine !== undefined) {
        lines.push([text.length, newLine]);
        newLine = undefined;
      }
      if (opening) {
        openedAt = text.length;
        opening = false;
      }
      text += char;
    }
  }
  if (depth > 0 && !opening) quoted.push([openedAt, text.length]);
  return { text, quoted, lines, errata: errataIn(dialogue, first, last, text) };
};

// Stephanus markers in reading order: page, then section a to e.
const position = (marker: string): number => {
  const match = /^(\d+)([a-e])$/u.exec(marker);
  return match ? Number(match[1]) * 5 + "abcde".indexOf(match[2] ?? "a") : -1;
};

// The ledger holds each entry's words to one occurrence in its own span. A longer reference may
// repeat them elsewhere; it marks them only where they are unambiguous, so no mark lands on the
// wrong words.
const errataIn = (dialogue: string, first: string, last: string, text: string): Rendered["errata"] =>
  loadEnglishErrata(REPO)
    .filter((erratum) => erratum.dialogue === dialogue)
    .flatMap((erratum) => {
      const [from, to] = bounds(erratum.span);
      if (position(from) < position(first) || position(to) > position(last)) return [];
      const at = text.indexOf(erratum.english);
      if (at < 0 || text.indexOf(erratum.english, at + 1) >= 0) return [];
      return [{ at: [at, at + erratum.english.length] as const, correction: erratum.correction }];
    });

// A dialogue and a Stephanus reference anywhere in a page: a citation, a passage block's `ref`, or
// what a line note is about.
const REFERENCE = /\b([a-z]+(?:-[a-z]+)*) (\d+[a-e](?:-\d*[a-e])?)\b/gu;

// Every section of each dialogue that has pages, every passage a page names, and the passages the
// kit's own screens quote, for passages.ts to hold. A reference the rendering does not mark is left
// out, so the checker reports it in its page instead of the build failing.
export const held = (kit: ReadonlyArray<string>): Record<string, Rendered> => {
  const pages = readPages();
  const sections = [...new Set(pages.map(({ path }) => path.split("/")[0] ?? ""))]
    .filter((dialogue) => existsSync(markerFile(dialogue)))
    .flatMap((dialogue) => [...markers(dialogue).keys()].map((marker) => `${dialogue} ${marker}`));
  const named = pages.flatMap(({ source }) => [...source.matchAll(REFERENCE)].map(([key]) => key));
  const passages: Record<string, Rendered> = {};
  for (const key of new Set([...sections, ...named, ...kit])) {
    if (!existsSync(markerFile(key.split(" ")[0] ?? ""))) continue;
    try {
      passages[key] = rendered(key);
    } catch {
      // Not a reference the rendering marks; the page that names it fails the checker.
    }
  }
  return passages;
};

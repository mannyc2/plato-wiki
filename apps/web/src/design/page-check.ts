// Curated pages are written ahead and shown only after the user has read them (DEC-20). Every page
// under pages/<dialogue>/ passes the block checker and is named for what it is about: a person's
// key, as in crito/socrates.md, or the reference a line note covers, as in crito/43b-c.md. Line
// notes in one dialogue never overlap, so a reading line has at most one note, and a receipt that
// no longer matches its page fails until the user reads the page again. pages/samples/ holds design
// samples, such as a note written on request, which are checked but never shown as written ahead.
import { parsePage } from "./blocks";
import { type PageFile, readOn, RECEIPT } from "./page-sources";
import { bounds } from "./rendering";

const SAMPLES = "samples";

// Stephanus markers in reading order: page, then section a to e.
const position = (marker: string): number => {
  const match = /^(\d+)([a-e])$/u.exec(marker);
  return match ? Number(match[1]) * 5 + "abcde".indexOf(match[2] ?? "a") : 0;
};

const lineOf = (source: string, pattern: RegExp): number => {
  const at = source.search(pattern);
  return at < 0 ? 1 : source.slice(0, at).split("\n").length;
};

const byPathAndLine = (a: string, b: string): number => {
  const [pathA = "", lineA = "0"] = a.split(":");
  const [pathB = "", lineB = "0"] = b.split(":");
  return pathA === pathB ? Number(lineA) - Number(lineB) : pathA < pathB ? -1 : 1;
};

// Every problem as `path:line: message`, in path and line order.
export const checkPages = (pages: ReadonlyArray<PageFile>): ReadonlyArray<string> => {
  const problems: Array<string> = [];
  const notes = new Map<string, Array<{ readonly path: string; readonly from: number; readonly to: number }>>();
  for (const { path, source } of pages) {
    const [dialogue = "", name = ""] = path.replace(/\.md$/u, "").split("/");
    const { page, problems: found } = parsePage(source);
    problems.push(...found.map((problem) => `${path}:${problem}`));
    const about = page.about.get("about") ?? "";
    const aboutLine = lineOf(source, /^about:/mu);
    if (dialogue !== SAMPLES) {
      if (/^\d/u.test(name)) {
        if (about !== `line ${dialogue} ${name}`) problems.push(`${path}:${aboutLine}: a note in ${path} is about \`line ${dialogue} ${name}\``);
        else {
          const [first, last] = bounds(name);
          notes.set(dialogue, [...(notes.get(dialogue) ?? []), { path, from: position(first), to: position(last) }]);
        }
      } else if (about !== `person ${name}` || page.about.get("in") !== dialogue) {
        problems.push(`${path}:${aboutLine}: a page in ${path} is about \`person ${name}\` in ${dialogue}`);
      }
    }
    const receipt = page.about.get("reviewed");
    if (receipt && readOn(source) === undefined) {
      problems.push(`${path}:${lineOf(source, RECEIPT)}: the page has changed since the user read it on ${receipt.split(" ")[0]}`);
    }
  }
  for (const list of notes.values()) {
    const sorted = list.toSorted((a, b) => a.from - b.from);
    for (const [index, note] of sorted.entries()) {
      const before = sorted[index - 1];
      if (before && note.from <= before.to) problems.push(`${note.path}:1: overlaps ${before.path}`);
    }
  }
  return problems.toSorted(byPathAndLine);
};

// Chapters as a dialogue's audio script divides it (audio/scripts/<dialogue>.json). Each starts at
// the Stephanus marker of its first source line, so the reading view and the recording agree on
// where a chapter begins without anyone retyping it.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";

export type Chapter = {
  readonly title: string;
  // The title's leading clause, up to a colon, a dash or the end of a question, for places too
  // narrow for the whole title: "Before dawn: a friend's grief and Socrates' composure" is "Before
  // dawn", and "Where are the corrupted? A roll call …" is "Where are the corrupted?".
  readonly shortTitle: string;
  readonly from: string;
};

type Script = {
  readonly chapters: ReadonlyArray<{ readonly id: string; readonly title: string }>;
  readonly entries: ReadonlyArray<{ readonly chapter_id: string; readonly kind: string; readonly anchor?: { readonly stephanus?: string } }>;
};

export const shortChapterTitle = (title: string): string => title.split(/(?<=\?)\s|:\s| — | – /u)[0]!.trim();

export function chaptersOf(script: Script): Chapter[] {
  return script.chapters.map(({ id, title }) => {
    const first = script.entries.find((entry) => entry.chapter_id === id && entry.kind === "source" && entry.anchor?.stephanus);
    if (!first?.anchor?.stephanus) throw new Error(`chapter ${id} has no source line with a Stephanus anchor`);
    return { title, shortTitle: shortChapterTitle(title), from: first.anchor.stephanus };
  });
}

export function readChapters(dialogue: string, repoRoot = getRepoRoot()): Chapter[] {
  return chaptersOf(JSON.parse(readFileSync(join(repoRoot, "audio/scripts", `${dialogue}.json`), "utf8")) as Script);
}

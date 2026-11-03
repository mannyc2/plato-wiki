// The English rendering at each Stephanus reference the kit's pages and screens cite. A page names
// a reference and pulls the words from here, so no page retypes Plato: `held` runs as a Bun macro
// and reads the rendering when the kit is built or tested. It holds every section of a dialogue
// with pages and every passage a page names, such as "crito 44a-b" across markers; the list below
// adds the few that only the kit's own screens quote.
import { DIALOGUES, type DialogueKey } from "./covers";
import type { Rendered } from "./rendering";
import { chapterFigures } from "./figures" with { type: "macro" };
import { held } from "./rendering" with { type: "macro" };

export const PASSAGES: Readonly<Record<string, Rendered>> = held(["phaedo 91c", "gorgias 472b", "charmides 161c", "philebus 14b", "theaetetus 151d"]);

export type PassageKey = `${DialogueKey} ${string}`;

export const isPassageKey = (key: string): key is PassageKey => Object.hasOwn(PASSAGES, key);

export const passage = (key: PassageKey): Rendered => {
  const words = PASSAGES[key];
  if (!words) throw new Error(`no passage is held for ${key}`);
  return words;
};

const isDialogueKey = (key: string): key is DialogueKey => Object.hasOwn(DIALOGUES, key);

export const passageDialogue = (key: PassageKey): DialogueKey => {
  const slug = key.split(" ")[0] ?? "";
  if (!isDialogueKey(slug)) throw new Error(`${key} names no dialogue`);
  return slug;
};

// "crito 44a-b" reads "44a–b" beside the dialogue's name and "Crito 44a–b" on its own.
export const refOf = (key: PassageKey): string => (key.split(" ")[1] ?? "").replace("-", "–");
export const refLabel = (key: PassageKey): string => `${DIALOGUES[passageDialogue(key)].title} ${refOf(key)}`;

// A quotation that starts mid-sentence opens with an ellipsis, so a lower-case first word reads as
// cut rather than miscopied.
export const fragment = (words: string): string => (/^[a-z]/u.test(words) ? `…${words}` : words);

// The words from the start of `from` to the end of `to`, or the whole passage without them.
export const excerpt = (key: PassageKey, from?: string, to?: string): string | undefined => {
  const { text } = passage(key);
  const start = from === undefined ? 0 : text.indexOf(from);
  if (start < 0) return undefined;
  if (to === undefined) return text.slice(start);
  const end = text.indexOf(to, start);
  return end < 0 ? undefined : text.slice(start, end + to.length);
};

// The sentence a quotation sits in, split around it, for a source card to light the quoted words.
export const sentenceAround = (
  key: PassageKey,
  quote: string,
): { readonly before: string; readonly quote: string; readonly after: string } | undefined => {
  const { text } = passage(key);
  const at = text.indexOf(quote);
  if (at < 0) return undefined;
  const opening = Math.max(...[". ", "? ", "! "].map((stop) => text.lastIndexOf(stop, at - 1)));
  const start = opening < 0 ? 0 : opening + 2;
  const closings = [".", "?", "!"].map((stop) => text.indexOf(stop, at + quote.length)).filter((index) => index >= 0);
  const end = closings.length > 0 ? Math.min(...closings) + 1 : text.length;
  return { before: text.slice(start, at), quote, after: text.slice(at + quote.length, end) };
};

// What the Greek says wherever the English the card shows gets it wrong.
export const correctionsAround = (key: PassageKey, quote: string): ReadonlyArray<string> => {
  const { text, errata } = passage(key);
  const words = sentenceAround(key, quote);
  if (!words) return [];
  const start = text.indexOf(quote) - words.before.length;
  const end = start + words.before.length + quote.length + words.after.length;
  return errata.filter(({ at: [from, to] }) => from < end && to > start).map(({ correction }) => correction);
};

// Chapters as the recording divides a dialogue, each from the marker it starts at, read from the
// audio scripts when the kit is built.
export const CHAPTERS: Partial<Record<DialogueKey, ReadonlyArray<{ readonly title: string; readonly from: string }>>> = chapterFigures();

// Stephanus markers in reading order: page, then section a to e.
const position = (marker: string): number => {
  const match = /^(\d+)([a-e])/u.exec(marker);
  return match ? Number(match[1]) * 5 + "abcde".indexOf(match[2] ?? "a") : 0;
};

export const chapterOf = (key: PassageKey): { readonly number: number; readonly title: string } | undefined => {
  const chapters = CHAPTERS[passageDialogue(key)] ?? [];
  const at = position(key.split(" ")[1] ?? "");
  const index = chapters.findLastIndex((chapter) => position(chapter.from) <= at);
  const chapter = chapters[index];
  return chapter ? { number: index + 1, title: chapter.title } : undefined;
};

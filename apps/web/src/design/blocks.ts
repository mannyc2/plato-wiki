// Curated pages and on-demand answers are one format: GFM with container directives, as kace's
// postal reference settled on after testing five. A page names passages, ideas, people and
// analytics; the app pulls the words and the figures, so a page never retypes Plato or restates a
// count. Citations are GFM footnotes whose quotation must be found at the reference given. A page
// that fails a check comes back as `line: message` lines in line order, one per cause, which an
// agent can repair in one turn. In Two views, the words cited for a speaker must be that speaker's.
//
//   ## How he argues {#moves}
//   :::moves
//   1. He follows only the argument that seems best on reflection.[^46b] {idea=truth-priority}
//   :::
//   [^46b]: crito 46b "follows nothing but the reasoning"
import { ANALYTIC_NAMES, type AnalyticName, WHO_SPEAKS } from "./analytics";
import { COLLECTIONS, type CollectionKey } from "./collections";
import { DIALOGUES, type DialogueKey } from "./covers";
import { IDEAS, type IdeaKey } from "./ideas";
import { excerpt, isPassageKey, type PassageKey, passage, refLabel } from "./passages";
import { PEOPLE, type PersonKey } from "./people";

export type Inline = { readonly text: string } | { readonly note: string };

export type Said = { readonly person: PersonKey; readonly inline: ReadonlyArray<Inline> };

export type Move = { readonly inline: ReadonlyArray<Inline>; readonly idea?: IdeaKey };

export type Block =
  | { readonly kind: "heading"; readonly id: string; readonly text: string }
  | { readonly kind: "prose"; readonly inline: ReadonlyArray<Inline> }
  | {
      readonly kind: "passage";
      readonly ref: PassageKey;
      readonly from?: string;
      readonly to?: string;
      readonly lit?: string;
      // A featured passage is set large, as a pull quote.
      readonly feature: boolean;
      readonly caption: ReadonlyArray<Inline>;
    }
  | { readonly kind: "moves"; readonly items: ReadonlyArray<Move> }
  // Two speakers' positions on one line, and whether the passage settles between them.
  | { readonly kind: "views"; readonly items: ReadonlyArray<Said>; readonly unresolved: boolean }
  | { readonly kind: "people"; readonly items: ReadonlyArray<Said> }
  | { readonly kind: "analytic"; readonly name: AnalyticName; readonly dialogue: DialogueKey }
  | { readonly kind: "arc"; readonly collection: CollectionKey; readonly at: DialogueKey };

export type Note = { readonly key: string; readonly ref: PassageKey; readonly quote: string };

export type Page = {
  readonly title?: string;
  readonly about: ReadonlyMap<string, string>;
  readonly blocks: ReadonlyArray<Block>;
  readonly notes: ReadonlyArray<Note>;
};

export type Parsed = { readonly page: Page; readonly problems: ReadonlyArray<string> };

const has = <Key extends string>(table: Record<Key, unknown>, key: string): key is Key => Object.hasOwn(table, key);

const NOTE = /\[\^([^\]\s]+)\]/gu;

const inline = (text: string): ReadonlyArray<Inline> =>
  text
    .split(NOTE)
    .map((part, index): Inline => (index % 2 === 1 ? { note: part } : { text: part }))
    .filter((part) => !("text" in part) || part.text !== "");

const attributes = (text: string): ReadonlyMap<string, string> =>
  new Map(
    [...text.matchAll(/([a-z][a-z-]*)(?:=(?:"([^"]*)"|([^\s"}]+)))?/gu)].map(([, key = "", quoted, bare]) => [
      key,
      quoted ?? bare ?? "",
    ]),
  );

const DIRECTIVE = /^(:{2,3})([a-z]+)(?:\{([^}]*)\})?\s*$/u;
const HEADING = /^## (.+?)(?:\s+\{#([a-z0-9-]+)\})?\s*$/u;
const DEFINITION = /^\[\^([^\]\s]+)\]:\s+([a-z-]+ \d+[a-e](?:-\d*[a-e])?)\s+"(.+)"\s*$/u;
const ITEM = /^(?:\d+\.|-)\s+(.+)$/u;
const SAID = /^([a-z-]+):\s+(.+)$/u;
const IDEA = /\s*\{idea=([a-z-]+)\}\s*$/u;

// Whose words a quotation is, from the speaker's name that starts each line of the rendering.
// Quoted speech inside a turn, such as the Laws' speech in Socrates' turns, has no owner the
// rendering names, so a view citing it fails rather than pass under the turn's speaker. These
// labels stand in for the workspace only: production's speaker check is DEC-20's, which never reads
// the rendering.
const ownerOf = (ref: PassageKey, quote: string): string => {
  const { text, quoted, lines } = passage(ref);
  const at = text.indexOf(quote);
  const end = at + quote.length;
  if (quoted.some(([from, to]) => at < to && from < end)) return "quoted";
  return lines.findLast(([start]) => start <= at)?.[1] ?? "";
};

const possessive = (name: string): string => (name.endsWith("s") ? `${name}’` : `${name}’s`);

// A page is about a person in a dialogue, `about: person socrates` with `in: crito`, or about the
// lines at a reference, `about: line crito 43b-c`. `reviewed` is the receipt for the user's read,
// its date and the page's hash, which page-check.ts verifies; `written: on request` marks a note
// written for one reader.
const FRONT = {
  about: (value: string): string | undefined => {
    const [kind = "", ...rest] = value.split(" ");
    const named = rest.join(" ");
    if (kind === "person") return rest.length === 1 && has(PEOPLE, named) ? undefined : `no person is called ${named}`;
    if (kind === "line") return isPassageKey(named) ? undefined : `no passage is held for ${named}`;
    return "a page is about a person or a line";
  },
  in: (value: string): string | undefined => (has(DIALOGUES, value) ? undefined : `no dialogue is called ${value}`),
  written: (value: string): string | undefined => (value === "on request" ? undefined : "written is `on request` or left out"),
  reviewed: (value: string): string | undefined =>
    /^\d{4}-\d{2}-\d{2} [0-9a-f]{64}$/u.test(value) ? undefined : "reviewed is a date and the page’s hash",
};

type Line = { readonly at: number; readonly text: string };
type Problem = { readonly at: number; readonly message: string };

export const parsePage = (source: string): Parsed => {
  const problems: Array<Problem> = [];
  const problem = (at: number, message: string): void => {
    problems.push({ at, message });
  };
  const blocks: Array<Block> = [];
  const notes: Array<Note> = [];
  const about = new Map<string, string>();
  const used = new Map<string, number>();
  // Every footnote key with a definition line, accepted or not, so a misquote is reported once.
  const sourced = new Map<string, number>();
  let title: string | undefined;
  let paragraph: Array<Line> = [];

  const lines = source.split("\n").map((text, index): Line => ({ at: index + 1, text: text.trimEnd() }));
  let index = 0;

  const markUsed = (parts: ReadonlyArray<Inline>, at: number) => {
    for (const part of parts) if ("note" in part && !used.has(part.note)) used.set(part.note, at);
  };
  const flush = () => {
    const first = paragraph[0];
    if (first) {
      const parts = inline(paragraph.map((line) => line.text.trim()).join(" "));
      markUsed(parts, first.at);
      blocks.push({ kind: "prose", inline: parts });
    }
    paragraph = [];
  };

  if (lines[0]?.text === "---") {
    index = 1;
    for (; index < lines.length && lines[index]?.text !== "---"; index++) {
      const match = /^([a-z]+):\s*(.+)$/u.exec(lines[index]?.text ?? "");
      const [, key = "", value = ""] = match ?? [];
      if (!match) problem(index + 1, "frontmatter lines are `key: value`");
      else if (!has(FRONT, key)) problem(index + 1, `no frontmatter key is called ${key}`);
      else {
        about.set(key, value);
        const fault = FRONT[key](value);
        if (fault) problem(index + 1, fault);
      }
    }
    if (about.get("about")?.startsWith("person ") && !about.has("in")) problem(1, "a person page names its dialogue with `in`");
    index++;
  }

  // A container's body runs to its closing `:::`.
  const body = (opening: number): ReadonlyArray<Line> => {
    const inside: Array<Line> = [];
    for (index = opening + 1; index < lines.length; index++) {
      const line = lines[index];
      if (!line || line.text === ":::") return inside;
      if (line.text.trim() !== "") inside.push(line);
    }
    problem(lines[opening]?.at ?? 0, "this block has no closing `:::`");
    return inside;
  };

  // Views items, kept with their lines so their citations can be checked once the sources are read.
  const views: Array<{ readonly at: number; readonly said: Said }> = [];

  const saying = (inside: ReadonlyArray<Line>, keep = false): ReadonlyArray<Said> =>
    inside.flatMap((line) => {
      const item = ITEM.exec(line.text)?.[1];
      const said = item === undefined ? null : SAID.exec(item);
      const person = said?.[1] ?? "";
      if (!said || !has(PEOPLE, person)) {
        problem(line.at, said ? `no person is called ${person}` : "items are `- person: what they say`");
        return [];
      }
      const parts = inline(said[2] ?? "");
      markUsed(parts, line.at);
      if (keep) views.push({ at: line.at, said: { person, inline: parts } });
      return [{ person, inline: parts }];
    });

  const directive = (at: number, name: string, attrs: ReadonlyMap<string, string>, opening: number, container: boolean): void => {
    const inside = container ? body(opening) : [];
    if (name === "passage") {
      const ref = attrs.get("ref") ?? "";
      if (!isPassageKey(ref)) return problem(at, `no passage is held for ${ref || "a missing ref"}`);
      const from = attrs.get("from");
      const to = attrs.get("to");
      const lit = attrs.get("lit");
      const words = excerpt(ref, from, to);
      if (words === undefined) return problem(at, `the from and to words are not in ${refLabel(ref)}, in that order`);
      if (lit !== undefined && !words.includes(lit)) return problem(at, `the lit words are not in the passage shown`);
      const caption = inline(inside.map((line) => line.text.trim()).join(" "));
      markUsed(caption, at);
      blocks.push({
        kind: "passage",
        ref,
        ...(from === undefined ? {} : { from }),
        ...(to === undefined ? {} : { to }),
        ...(lit === undefined ? {} : { lit }),
        feature: attrs.has("feature"),
        caption,
      });
      return;
    }
    if (name === "moves") {
      const items = inside.flatMap((line): ReadonlyArray<Move> => {
        const item = ITEM.exec(line.text)?.[1];
        if (item === undefined) {
          problem(line.at, "moves are numbered list items");
          return [];
        }
        const idea = IDEA.exec(item)?.[1];
        if (idea !== undefined && !has(IDEAS, idea)) problem(line.at, `no idea is called ${idea}`);
        const parts = inline(item.replace(IDEA, ""));
        markUsed(parts, line.at);
        return [idea !== undefined && has(IDEAS, idea) ? { inline: parts, idea } : { inline: parts }];
      });
      blocks.push({ kind: "moves", items });
      return;
    }
    if (name === "views") {
      blocks.push({ kind: "views", items: saying(inside, true), unresolved: attrs.has("unresolved") });
      return;
    }
    if (name === "people") {
      blocks.push({ kind: "people", items: saying(inside) });
      return;
    }
    if (name === "analytic") {
      const analytic = attrs.get("name") ?? "";
      const dialogue = attrs.get("in") ?? "";
      const known = ANALYTIC_NAMES.find((candidate) => candidate === analytic);
      if (!known) return problem(at, `no analytic is called ${analytic}`);
      if (!has(DIALOGUES, dialogue) || !WHO_SPEAKS[dialogue]) return problem(at, `${analytic} has no figures for ${dialogue}`);
      blocks.push({ kind: "analytic", name: known, dialogue });
      return;
    }
    if (name === "arc") {
      const collection = attrs.get("collection") ?? "";
      const place = attrs.get("at") ?? "";
      if (!has(COLLECTIONS, collection)) return problem(at, `no collection is called ${collection}`);
      const dialogues: ReadonlyArray<string> = COLLECTIONS[collection].dialogues;
      if (!has(DIALOGUES, place) || !dialogues.includes(place)) return problem(at, `${place} is not in ${collection}`);
      blocks.push({ kind: "arc", collection, at: place });
      return;
    }
    problem(at, `no block is called ${name}`);
  };

  for (; index < lines.length; index++) {
    const line = lines[index];
    if (!line) continue;
    const { at, text } = line;
    if (text.trim() === "") {
      flush();
      continue;
    }
    if (text === ":::") {
      flush();
      problem(at, "this `:::` closes no block");
      continue;
    }
    const opening = DIRECTIVE.exec(text);
    if (opening) {
      flush();
      directive(at, opening[2] ?? "", attributes(opening[3] ?? ""), index, opening[1] === ":::");
      continue;
    }
    const definition = DEFINITION.exec(text);
    if (definition) {
      flush();
      const [, key = "", ref = "", quote = ""] = definition;
      sourced.set(key, at);
      if (!isPassageKey(ref)) problem(at, `no passage is held for ${ref}`);
      else if (!passage(ref).text.includes(quote)) problem(at, `the quotation is not in ${refLabel(ref)}`);
      else notes.push({ key, ref, quote });
      continue;
    }
    if (text.startsWith("# ")) {
      flush();
      title = text.slice(2).trim();
      continue;
    }
    const heading = HEADING.exec(text);
    if (heading) {
      flush();
      const words = heading[1] ?? "";
      blocks.push({ kind: "heading", id: heading[2] ?? words.toLowerCase().replace(/[^a-z0-9]+/gu, "-"), text: words });
      continue;
    }
    paragraph.push(line);
  }
  flush();

  for (const [key, at] of used) if (!sourced.has(key)) problem(at, `[^${key}] has no source`);
  const accepted = new Map(notes.map((note) => [note.key, note]));
  for (const { at, said } of views) {
    const name = PEOPLE[said.person].name;
    const cited = said.inline.flatMap((part) => ("note" in part ? [part.note] : []));
    if (cited.length === 0) problem(at, `a view needs a citation of ${possessive(name)} words`);
    for (const key of cited) {
      const note = accepted.get(key);
      const owner = note && ownerOf(note.ref, note.quote);
      if (owner === "quoted") problem(at, `the words cited for ${name} are quoted speech inside a turn`);
      else if (owner === "") problem(at, `the words cited for ${name} are in no turn the rendering names`);
      else if (owner && owner !== name) problem(at, `the words cited for ${name} are ${possessive(owner)}`);
    }
  }
  for (const [key, at] of sourced) if (!used.has(key)) problem(at, `[^${key}] is never cited`);

  return {
    page: { ...(title === undefined ? {} : { title }), about, blocks, notes },
    problems: problems.toSorted((a, b) => a.at - b.at).map(({ at, message }) => `${at}: ${message}`),
  };
};

// Citations are numbered in the order a reader meets them.
export const noteNumbers = (page: Page): ReadonlyMap<string, number> => {
  const order: Array<string> = [];
  const visit = (parts: ReadonlyArray<Inline>) => {
    for (const part of parts) if ("note" in part && !order.includes(part.note)) order.push(part.note);
  };
  for (const block of page.blocks) {
    if (block.kind === "prose") visit(block.inline);
    if (block.kind === "passage") visit(block.caption);
    if (block.kind === "moves" || block.kind === "views" || block.kind === "people") for (const item of block.items) visit(item.inline);
  }
  return new Map(order.map((key, index) => [key, index + 1]));
};

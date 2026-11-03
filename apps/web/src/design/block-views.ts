// Blocks drawn with the Bookshelf components. A curated page and an answer written on request use
// these same views, so a reader cannot tell them apart by their look, only by what the page says
// about how it was written. A template decides where each block sits; the page decides what it says.
import type { Html, HtmlBuilder } from "foldkit/html";
import { type Share, WHO_SPEAKS } from "./analytics";
import { type Block, type Inline, type Note, noteNumbers, type Page } from "./blocks";
import { citeMark, type Side, sourceTrail } from "./citations";
import { type Collection, COLLECTIONS } from "./collections";
import { cover, DIALOGUES, type DialogueKey } from "./covers";
import { icon } from "./icons";
import { IDEAS, ideaBadge } from "./ideas";
import type { Child } from "./html";
import { excerpt, fragment, refLabel } from "./passages";
import { avatar, OTHERS, PEOPLE, type PersonKey } from "./people";

// A page is drawn as a page, or in a sheet such as Explain, where headings are quieter.
export type Setting = "page" | "sheet";

export type Context = {
  readonly setting: Setting;
  readonly numbers: ReadonlyMap<string, number>;
  readonly notes: ReadonlyMap<string, Note>;
  // The citation drawn open, for a still frame, and the side its card opens toward.
  readonly open?: { readonly key: string; readonly side: Side };
  // People with their own page in this dialogue, whom a cast row leads to.
  readonly pages?: ReadonlySet<PersonKey>;
};

export const contextFor = (page: Page, setting: Setting, open?: Context["open"]): Context => ({
  setting,
  numbers: noteNumbers(page),
  notes: new Map(page.notes.map((note) => [note.key, note])),
  ...(open === undefined ? {} : { open }),
});

const inlineView = <Message>(parts: ReadonlyArray<Inline>, context: Context, h: HtmlBuilder<Message>): ReadonlyArray<Child> =>
  parts.flatMap((part): ReadonlyArray<Child> => {
    if ("text" in part) return [part.text];
    const note = context.notes.get(part.note);
    const number = context.numbers.get(part.note);
    if (!note || !number) return [];
    return [citeMark({ number, note, ...(context.open?.key === part.note ? { open: context.open.side } : {}) }, h)];
  });

// The passage's words with any lit phrase marked.
const passageWords = <Message>(words: string, lit: string | undefined, h: HtmlBuilder<Message>): ReadonlyArray<Child> => {
  const at = lit === undefined ? -1 : words.indexOf(lit);
  if (lit === undefined || at < 0) return [words];
  return [words.slice(0, at), h.mark([], [lit]), words.slice(at + lit.length)];
};

const passageView = <Message>(block: Extract<Block, { kind: "passage" }>, context: Context, h: HtmlBuilder<Message>): Html => {
  const words = fragment(excerpt(block.ref, block.from, block.to) ?? "");
  if (block.feature) {
    return h.figure(
      [h.Class("bk-pull")],
      [
        h.blockquote([], [`“${words}”`]),
        h.figcaption(
          [],
          [h.span([], [refLabel(block.ref)]), h.span([h.Class("a-btn ghost sm")], [icon("play", h), "Play from here"])],
        ),
      ],
    );
  }
  return h.figure(
    [h.Class("bk-pass")],
    [
      h.blockquote([], ["“", ...passageWords(words, block.lit, h), "”"]),
      h.figcaption([], [h.b([], [refLabel(block.ref)]), " ", ...inlineView(block.caption, context, h)]),
    ],
  );
};

// Past this many steps, the first few show and the rest wait behind a button, so a long argument
// does not push the rest of the page away. Four still show whole: folding one step saves nothing.
const SHOWN_STEPS = 3;
const FOLD_PAST = 4;

const movesView = <Message>(block: Extract<Block, { kind: "moves" }>, context: Context, h: HtmlBuilder<Message>): Html => {
  const step = (move: (typeof block.items)[number], index: number): Html =>
    h.li(
      [],
      [
        h.span([h.Class("bk-n")], [String(index + 1)]),
        h.div(
          [],
          [
            h.p([], inlineView(move.inline, context, h)),
            ...(move.idea ? [h.span([h.Class("bk-idea")], [ideaBadge({ idea: move.idea, size: "sm" }, h), IDEAS[move.idea].name])] : []),
          ],
        ),
      ],
    );
  if (block.items.length <= FOLD_PAST) return h.ol([h.Class("bk-moves")], block.items.map(step));
  const rest = block.items.slice(SHOWN_STEPS);
  return h.div(
    [h.Class("bk-steps")],
    [
      h.ol([h.Class("bk-moves")], block.items.slice(0, SHOWN_STEPS).map(step)),
      h.details(
        [h.Class("bk-fold")],
        [
          h.summary([], [`Show ${rest.length} more steps`, icon("chev-d", h)]),
          h.ol([h.Class("bk-moves")], rest.map((move, index) => step(move, index + SHOWN_STEPS))),
        ],
      ),
    ],
  );
};

const viewsView = <Message>(block: Extract<Block, { kind: "views" }>, context: Context, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class("a-views")],
    [
      ...block.items.map(({ person, inline }) =>
        h.div(
          [h.Class("a-view")],
          [avatar({ person }, h), h.span([], [h.b([], [PEOPLE[person].name]), h.span([], inlineView(inline, context, h))])],
        ),
      ),
      ...(block.unresolved ? [h.p([h.Class("a-views-f")], [icon("info", h), "The passage leaves this unresolved."])] : []),
    ],
  );

// Everyone else in the dialogue, each with what they are to this person. A row leads to that
// person's own page when they have one.
const peopleView = <Message>(block: Extract<Block, { kind: "people" }>, context: Context, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class("bk-people")],
    block.items.map(({ person, inline }) =>
      h.div(
        [h.Class("bk-person")],
        [
          avatar({ person, size: "lg" }, h),
          h.span([], [h.b([], [PEOPLE[person].name]), h.span([], inlineView(inline, context, h))]),
          ...(context.pages?.has(person) ? [icon("chev-r", h)] : []),
        ],
      ),
    ),
  );

// "a, b and c", as a sentence lists names.
const listed = (names: ReadonlyArray<string>): string =>
  names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;

const percent = (value: number) => (value < 1 ? "under 1%" : `${Math.round(value)}%`);

// Who speaks in a dialogue, by share of its words. Speakers under 1% are named below the bar rather
// than drawn in it, and words still waiting for a speaker are their own share, given to no one.
export const whoSpeaks = <Message>(dialogue: DialogueKey, h: HtmlBuilder<Message>): Html => {
  const figures = WHO_SPEAKS[dialogue];
  const shown = figures?.shares ?? [];
  const under = (figures?.under ?? []).map(({ name }) => name);
  const waiting = figures?.waiting ?? 0;
  const quotes = (figures?.shares ?? []).some((share) => (share.quoted ?? 0) > 0);
  const name = (share: Share) => PEOPLE[share.as ?? share.person].name;
  return h.div(
    [h.Class("bk-who")],
    [
      h.div(
        [
          h.Class("w-share"),
          h.Role("img"),
          h.AriaLabel(shown.map((share) => `${name(share)} ${percent(share.percent)}`).join(", ")),
        ],
        [
          ...shown.map((share) => h.i([h.Style({ "--w": `${share.percent}%`, "--c": PEOPLE[share.as ?? share.person].fill })])),
          ...(waiting >= 1 ? [h.i([h.Style({ "--w": `${waiting}%`, "--c": OTHERS })])] : []),
        ],
      ),
      h.div(
        [h.Class("bk-who-k")],
        [
          ...shown.map((share) =>
            h.span(
              [],
              [
                avatar({ person: share.as ?? share.person, size: "sm" }, h),
                h.span([], share.as ? [h.b([], [PEOPLE[share.person].name]), ` as ${PEOPLE[share.as].name.replace(/^The /u, "the ")}`] : [h.b([], [PEOPLE[share.person].name])]),
                h.em([], [percent(share.percent)]),
              ],
            ),
          ),
          ...(waiting >= 1
            ? [h.span([], [h.span([h.Class("a-av sm"), h.Style({ "--pf": OTHERS })]), h.span([], ["Waiting for a speaker"]), h.em([], [percent(waiting)])])]
            : []),
        ],
      ),
      h.p(
        [h.Class("w-fine")],
        [
          `Share of the words in the Greek. A named voice someone performs has its own share.${quotes ? " An unnamed voice counts for whoever quotes it." : ""}`,
          ...(under.length > 0 ? [` Under 1%${under.length > 1 ? " each" : ""}: ${listed(under)}.`] : []),
          ...(waiting > 0 && waiting < 1 ? [" Under 1% waits for its speaker to be marked."] : []),
        ],
      ),
    ],
  );
};

// The collection's dialogues in the order the story runs, each with its moment in it. The page's
// heading names the collection, so the block does not repeat it.
const arcView = <Message>(block: Extract<Block, { kind: "arc" }>, h: HtmlBuilder<Message>): Html => {
  const { dialogues, moments = {} }: Collection = COLLECTIONS[block.collection];
  return h.ol(
    [h.Class("bk-arc")],
    dialogues.map((dialogue) => {
      const moment = moments[dialogue];
      const here = dialogue === block.at;
      return h.li(
        [h.Class(here ? "on" : "")],
        [
          cover({ dialogue, size: "sm" }, h),
          h.span([h.Class("bk-arc-b")], [h.b([], [DIALOGUES[dialogue].title]), ...(moment ? [h.span([], [moment])] : [])]),
          here ? h.span([h.Class("bk-here")], ["You’re here"]) : icon("chev-r", h),
        ],
      );
    }),
  );
};

export const blockView = <Message>(block: Block, context: Context, h: HtmlBuilder<Message>): Html => {
  switch (block.kind) {
    case "heading":
      return context.setting === "page" ? h.h2([h.Class("a-h2 bk-h"), h.Id(block.id)], [block.text]) : h.h3([h.Class("a-sh-h"), h.Id(block.id)], [block.text]);
    case "prose":
      return h.p([h.Class(context.setting === "page" ? "bk-p" : "a-sh-p")], inlineView(block.inline, context, h));
    case "passage":
      return passageView(block, context, h);
    case "moves":
      return movesView(block, context, h);
    case "views":
      return viewsView(block, context, h);
    case "people":
      return peopleView(block, context, h);
    case "analytic":
      return whoSpeaks(block.dialogue, h);
    case "arc":
      return arcView(block, h);
  }
};

// Every source the page cites, numbered as the page numbers them.
export const trailView = <Message>(context: Context, h: HtmlBuilder<Message>, open = false): Html =>
  sourceTrail(
    [...context.numbers].flatMap(([key, number]) => {
      const note = context.notes.get(key);
      return note ? [{ number, note }] : [];
    }),
    h,
    open,
  );

// A side block and the heading that names it, so a template can move them into a panel together.
export type Section = { readonly heading?: Extract<Block, { kind: "heading" }>; readonly blocks: ReadonlyArray<Block> };

export const sections = (page: Page): ReadonlyArray<Section> =>
  page.blocks.reduce<Array<Section>>((all, block) => {
    if (block.kind === "heading") return [...all, { heading: block, blocks: [] }];
    const last = all.at(-1);
    if (!last) return [{ blocks: [block] }];
    return [...all.slice(0, -1), { ...last, blocks: [...last.blocks, block] }];
  }, []);

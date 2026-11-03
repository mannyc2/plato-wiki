// The review artifact for curated pages written ahead (DEC-20): every page of each dialogue drawn as
// the app draws it, with the passage each note explains and whether the user has read it. A page
// the user passes gets its receipt from `bun run pages review`; this sketch only shows the state.
// Dialogues with pages still to read come first; one the user has read through folds away.
import { Schema } from "effect";
import { Runtime } from "foldkit";
import type { Document, Html, HtmlBuilder } from "foldkit/html";
import { defineMessageUnion } from "foldkit/message";
import { blockView, contextFor, sections, trailView } from "../../src/design/block-views";
import { type Page, parsePage } from "../../src/design/blocks";
import { DIALOGUES, type DialogueKey } from "../../src/design/covers";
import { iconSprite } from "../../src/design/icons";
import { curatedPages } from "../../src/design/page-sources" with { type: "macro" };
import { chapterOf, fragment, isPassageKey, type PassageKey, passage, refLabel } from "../../src/design/passages";
import { avatar, PEOPLE, type PersonKey } from "../../src/design/people";

type Drawn = { readonly page: Page; readonly read?: string };
type Person = Drawn & { readonly person: PersonKey };
type LineNote = Drawn & { readonly key: PassageKey };
type Dialogue = { readonly key: DialogueKey; readonly people: ReadonlyArray<Person>; readonly notes: ReadonlyArray<LineNote> };

const isDialogue = (key: string): key is DialogueKey => Object.hasOwn(DIALOGUES, key);
const isPerson = (key: string): key is PersonKey => Object.hasOwn(PEOPLE, key);

// Stephanus markers in reading order: page, then section a to e.
const position = (key: PassageKey): number => {
  const match = /(\d+)([a-e])/u.exec(key.split(" ")[1] ?? "");
  return match ? Number(match[1]) * 5 + "abcde".indexOf(match[2] ?? "a") : 0;
};

const unread = ({ people, notes }: Dialogue): number => [...people, ...notes].filter(({ read }) => read === undefined).length;

const files = curatedPages().map((file) => ({ ...file, page: parsePage(file.source).page }));

const dialogues: ReadonlyArray<Dialogue> = [...new Set(files.map(({ path }) => path.split("/")[0] ?? ""))]
  .filter(isDialogue)
  .map((key) => {
    const own = files.filter(({ path }) => path.startsWith(`${key}/`));
    const people = own
      .flatMap(({ page, read }) => {
        const person = (page.about.get("about") ?? "").replace(/^person /u, "");
        return page.about.get("about")?.startsWith("person ") && isPerson(person) ? [{ page, person, ...(read ? { read } : {}) }] : [];
      })
      // Socrates leads, as he leads the dialogues.
      .toSorted((a, b) => Number(b.person === "socrates") - Number(a.person === "socrates"));
    const notes = own
      .flatMap(({ page, read }) => {
        const note = (page.about.get("about") ?? "").replace(/^line /u, "");
        return page.about.get("about")?.startsWith("line ") && isPassageKey(note) ? [{ page, key: note, ...(read ? { read } : {}) }] : [];
      })
      .toSorted((a, b) => position(a.key) - position(b.key));
    return { key, people, notes };
  })
  .toSorted((a, b) => Number(unread(a) === 0) - Number(unread(b) === 0));

const pageCount = ({ people, notes }: Dialogue): number => people.length + notes.length;

const Model = Schema.Struct({});
type Model = typeof Model.Type;
const Message = defineMessageUnion({ Viewed: {} });
type Message = typeof Message.Type;

const state = <M>(read: string | undefined, h: HtmlBuilder<M>): Html =>
  h.span([h.Class(read ? "rv-st read" : "rv-st")], [read ? `Read ${read}` : "Not read yet"]);

// The passage a note explains, turn by turn, as the rendering gives it.
const passageTurns = <M>(key: PassageKey, h: HtmlBuilder<M>): ReadonlyArray<Html> => {
  const { text, lines } = passage(key);
  const starts = lines.filter(([at], index) => lines[index + 1]?.[0] !== at);
  return starts.map(([at, label], index) => {
    const words = text.slice(at, starts[index + 1]?.[0] ?? text.length).trim();
    const own = words.startsWith(`${label}. `);
    return h.p([], [h.b([], [label]), " ", own ? words.slice(label.length + 2) : fragment(words)]);
  });
};

const personView = <M>(dialogue: DialogueKey, { page, person, read }: Person, pages: ReadonlySet<PersonKey>, h: HtmlBuilder<M>): Html => {
  const context = { ...contextFor(page, "page"), pages };
  return h.article(
    [h.Class("a-web-card rv-pg")],
    [
      h.div(
        [h.Class("rv-pg-h")],
        [
          avatar({ person, size: "lg" }, h),
          h.div([], [h.b([], [page.title ?? PEOPLE[person].name]), h.span([h.Class("rv-ref")], [`In the ${DIALOGUES[dialogue].title}`])]),
          state(read, h),
        ],
      ),
      ...sections(page).flatMap(({ heading, blocks }) => [
        ...(heading ? [h.h3([h.Class("a-h3 rv-sec")], [heading.text])] : []),
        h.div([h.Class(heading ? "" : "bk-lede")], blocks.map((block) => blockView(block, context, h))),
      ]),
      trailView(context, h),
    ],
  );
};

const noteView = <M>({ page, key, read }: LineNote, h: HtmlBuilder<M>): Html => {
  const context = contextFor(page, "sheet");
  return h.article(
    [h.Class("a-web-card rv-pg")],
    [
      h.div([h.Class("rv-pg-h")], [h.span([h.Class("rv-ref")], [refLabel(key)]), state(read, h)]),
      h.details([h.Class("rv-src")], [h.summary([], ["The passage"]), h.div([], passageTurns(key, h))]),
      ...page.blocks.map((block) => blockView(block, context, h)),
      trailView(context, h),
    ],
  );
};

const chapterTitle = (key: PassageKey): string => {
  const chapter = chapterOf(key);
  return chapter ? `Chapter ${chapter.number} · ${chapter.title}` : "";
};

const dialogueView = <M>(dialogue: Dialogue, h: HtmlBuilder<M>): ReadonlyArray<Html> => {
  const { title } = DIALOGUES[dialogue.key];
  const left = unread(dialogue);
  const body = [
    h.h3([h.Class("rv-ch")], ["People"]),
    ...dialogue.people.map((person) => personView(dialogue.key, person, new Set(dialogue.people.map((each) => each.person)), h)),
    ...dialogue.notes.flatMap((note, index) => {
      const chapter = chapterTitle(note.key);
      const before = dialogue.notes[index - 1];
      return [...(chapter && (!before || chapterTitle(before.key) !== chapter) ? [h.h3([h.Class("rv-ch")], [chapter])] : []), noteView(note, h)];
    }),
  ];
  const summary = `${pageCount(dialogue)} pages: ${dialogue.people.length} people and ${dialogue.notes.length} notes, ${left === 0 ? "all read" : `${left} not read yet`}`;
  return left === 0
    ? [h.details([h.Class("rv-done")], [h.summary([], [h.span([h.Class("rv-dt")], [`The ${title}`]), h.span([h.Class("rv-ref")], [summary])]), ...body])]
    : [h.h2([], [`The ${title}`]), h.p([h.Class("rv-lead")], [summary]), ...body];
};

const QUESTIONS: ReadonlyArray<string> = [
  "Tell me which pages pass, or what to change. A page you pass gets a receipt tied to its exact words, so any later edit sends it back to you.",
  "Where the English gets the Greek wrong, a note follows the Greek, but tapping its number still shows the English. In the Euthyphro the English says servants where the Greek says slaves; in the Phaedo, as the poison works, it says thighs where the Greek says shins. Where the English names the wrong friend in the Apology (Aristobulus for Apollodorus), the note says “one other”. Say if you would rather the notes follow the English.",
  "Like the Crito note that names Homer, the Apology note on 28b–d names Achilles, whom Socrates calls only “the son of Thetis”. It stays unless you say otherwise.",
];

const total = dialogues.reduce((sum, dialogue) => sum + pageCount(dialogue), 0);
const toRead = dialogues.reduce((sum, dialogue) => sum + unread(dialogue), 0);

const view = (_model: Model, h: HtmlBuilder<Message>): Document => ({
  title: "Curated Pages",
  body: h.div(
    [h.Class("A rv")],
    [
      iconSprite(h),
      h.div(
        [h.Class("rv-in")],
        [
          h.h1([], ["Pages written ahead"]),
          h.p(
            [h.Class("rv-lead")],
            [
              `Pages for you to read before any reader sees them: for each dialogue, a page for each of its people and notes that explain it stretch by stretch, together covering every line. Each is drawn as the app draws it. A second agent checks every claim against the sentence it cites before a page comes to you. Tap a number to see that sentence.`,
            ],
          ),
          h.p([h.Class("rv-state")], [toRead === 0 ? `All ${total} pages read` : `${toRead} of ${total} pages to read`]),
          h.section([h.Class("rv-qs")], [h.h2([], ["Before you read"]), h.ul([], QUESTIONS.map((question) => h.li([], [question])))]),
          ...dialogues.flatMap((dialogue) => dialogueView(dialogue, h)),
          h.p([h.Class("rv-foot")], ["Chapters follow the review recording."]),
        ],
      ),
    ],
  ),
});

Runtime.run(
  Runtime.makeApplication({
    Model,
    init: () => ({ model: {} }),
    update: (model: Model) => ({ model }),
    view,
    container: document.getElementById("root"),
  }),
);

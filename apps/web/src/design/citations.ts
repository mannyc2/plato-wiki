// Provenance one step away, as kace's citation research settled it. At rest a claim carries only a
// faint raised number. Hovering or focusing it opens a card with the place and the words there,
// the quoted ones lit; nothing at rest names a reference. The whole trail stays closed under
// "N sources" at the foot of the page.
import type { Html, HtmlBuilder } from "foldkit/html";
import type { Note } from "./blocks";
import { icon } from "./icons";
import { chapterOf, refLabel, sentenceAround } from "./passages";

export const sourceCard = <Message>(note: Note, h: HtmlBuilder<Message>): Html => {
  const chapter = chapterOf(note.ref);
  const words = sentenceAround(note.ref, note.quote);
  return h.span(
    [h.Class("a-src"), h.Role("note")],
    [
      h.span(
        [h.Class("a-src-h")],
        [h.b([], [refLabel(note.ref)]), ...(chapter ? [h.span([], [`Chapter ${chapter.number}, ${chapter.title}`])] : [])],
      ),
      h.span([h.Class("a-src-q")], words ? ["“", words.before, h.mark([], [words.quote]), words.after, "”"] : [`“${note.quote}”`]),
      h.span(
        [h.Class("a-src-f")],
        [h.span([h.Class("a-link sm")], ["Read in context"]), h.span([h.Class("a-src-play")], [icon("play", h), "Play from here"])],
      ),
    ],
  );
};

// The side a card opens toward. Near the end of a line it opens toward the start, as a popover
// flips when it would leave the column.
export type Side = "start" | "end";

// `open` draws the card as hovering shows it, for a still frame.
export const citeMark = <Message>(
  { number, note, open }: { readonly number: number; readonly note: Note; readonly open?: Side },
  h: HtmlBuilder<Message>,
): Html =>
  h.span(
    [h.Class(open ? `a-cite open ${open}` : "a-cite")],
    [
      // The joiner holds the number to the word before it. A button may still wrap after a joiner,
      // so the mark is also nowrap.
      "\u2060",
      h.button([h.Type("button"), h.Class("a-cite-n"), h.AriaLabel(`Source ${number}, ${refLabel(note.ref)}`)], [String(number)]),
      sourceCard(note, h),
    ],
  );

export const sourceTrail = <Message>(
  notes: ReadonlyArray<{ readonly number: number; readonly note: Note }>,
  h: HtmlBuilder<Message>,
  open = false,
): Html =>
  h.details(
    [h.Class("a-trail"), ...(open ? [h.Open(true)] : [])],
    [
      h.summary([], [`${notes.length} sources`, icon("chev-d", h)]),
      h.ol(
        [],
        notes.map(({ number, note }) =>
          h.li([], [h.span([h.Class("a-trail-n")], [String(number)]), h.span([], [h.b([], [refLabel(note.ref)]), ` “${note.quote}”`])]),
        ),
      ),
    ],
  );

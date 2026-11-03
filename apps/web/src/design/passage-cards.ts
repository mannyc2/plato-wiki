// A passage quoted by reference, as an idea page lists them: the dialogue's cover, where the passage
// is, its words pulled from the text, and the way back into it.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover, DIALOGUES } from "./covers";
import type { IdeaKey } from "./ideas";
import { excerpt, fragment, type PassageKey, passageDialogue, refOf } from "./passages";

export type Quoted = { readonly ref: PassageKey; readonly from: string; readonly to: string };

// The first passages an idea page lists, each with the words that carry the idea there.
export const IDEA_QUOTES = {
  "truth-priority": [
    { ref: "crito 46b", from: "I am not only now", to: "seems to me best" },
    { ref: "phaedo 91c", from: "if you do as I ask", to: "every argument you can muster" },
    { ref: "gorgias 472b", from: "But I, alone here before you", to: "you fail to convince me" },
    { ref: "charmides 161c", from: "we have not to consider who said it", to: "a true saying or no" },
    { ref: "philebus 14b", from: "the object of our present controversy", to: "the most perfect truth" },
  ],
} satisfies Partial<Record<IdeaKey, ReadonlyArray<Quoted>>>;

export const passageCard = <Message>({ ref, from, to }: Quoted, h: HtmlBuilder<Message>): Html => {
  const dialogue = passageDialogue(ref);
  return h.div(
    [h.Class("pc")],
    [
      cover({ dialogue, size: "xs" }, h),
      h.div(
        [],
        [
          h.span([h.Class("pc-m")], [h.b([], [DIALOGUES[dialogue].title]), ` ${refOf(ref)}`]),
          h.p([], [`“${fragment(excerpt(ref, from, to) ?? "")}”`]),
          h.span([h.Class("a-link sm")], ["Read in context"]),
        ],
      ),
    ],
  );
};

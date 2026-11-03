// "You and this idea": where a reader met an idea, where it comes next in what they are reading
// or hearing, and where it comes back most. It replaced v9's grid of the dialogues met, which said
// how little of an idea someone had seen rather than where to go next. Places are named by
// dialogue and by where they fall for this reader; references stay one step away.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover, DIALOGUES, type DialogueKey } from "./covers";
import { icon } from "./icons";
import type { IdeaKey } from "./ideas";
import { excerpt, fragment } from "./passages";

export type Stop = {
  readonly state: "done" | "next" | "later";
  readonly dialogue: DialogueKey;
  readonly note: string;
  // Where it comes next: the words there, pulled from the text, and how the reader will meet them.
  readonly quote?: string;
  readonly mode?: "reading" | "listening";
};

// Dialogues further on, shown after the trail as one row each.
export type Beyond = { readonly dialogue: DialogueKey; readonly title: string; readonly note: string };

export type Trail = { readonly stops: ReadonlyArray<Stop>; readonly beyond: ReadonlyArray<Beyond> };

// Sample values: the passages and their counts are real, the reader's place in them is not.
export const TRAILS = {
  "truth-priority": {
    stops: [
      { state: "done", dialogue: "crito", note: "Read, in chapter 2" },
      {
        state: "next",
        dialogue: "phaedo",
        note: "Next, 21 min ahead in what you’re hearing",
        quote: excerpt("phaedo 91c", "give little thought", "much more to the truth") ?? "",
        mode: "listening",
      },
      { state: "later", dialogue: "theaetetus", note: "Three passages, where it comes back most" },
    ],
    beyond: [
      { dialogue: "philebus", title: "Philebus", note: "2 passages" },
      { dialogue: "gorgias", title: "Gorgias, Charmides and 3 more", note: "1 passage each" },
    ],
  },
} satisfies Partial<Record<IdeaKey, Trail>>;

const stopIcon = <Message>({ state, mode }: Stop, h: HtmlBuilder<Message>): Html => {
  if (state === "done") return icon("check", h);
  return icon(mode === "listening" ? "headphones" : "bookopen", h);
};

export const ideaTrail = <Message>({ stops, beyond }: Trail, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.ol(
    [h.Class("w-trail")],
    stops.map((stop) =>
      h.li(
        [h.Class(stop.state === "later" ? "" : stop.state)],
        [
          h.span([h.Class("w-st")], [stopIcon(stop, h)]),
          h.span(
            [h.Class("w-trail-b")],
            [
              h.b([], [DIALOGUES[stop.dialogue].title]),
              h.span([], [stop.note]),
              ...(stop.quote ? [h.q([], [fragment(stop.quote)])] : []),
              ...(stop.state === "next"
                ? [
                    h.span(
                      [h.Class("a-btn fill sm")],
                      stop.mode === "listening" ? [icon("play", h), "Play from here"] : [icon("bookopen", h), "Read from here"],
                    ),
                  ]
                : []),
            ],
          ),
        ],
      ),
    ),
  ),
  ...(beyond.length
    ? [
        h.h3([h.Class("w-mini-h")], ["Then"]),
        ...beyond.map(({ dialogue, title, note }) =>
          h.span(
            [h.Class("w-part")],
            [cover({ dialogue, size: "xs" }, h), h.span([], [h.b([], [title]), h.span([], [note])]), icon("chev-r", h)],
          ),
        ),
      ]
    : []),
];

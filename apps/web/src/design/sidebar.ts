// The desktop sidebar: the four places, then what you are reading or listening to, then your
// collections, with Settings at the foot. Each row follows how the dialogue was last used, so
// reading counts chapters and listening counts time.
import type { Html, HtmlBuilder } from "foldkit/html";
import { COLLECTION_KEYS, COLLECTIONS, type Collection } from "./collections";
import { cover, DIALOGUES, type DialogueKey } from "./covers";
import { icon } from "./icons";

export type Place = "home" | "library" | "explore" | "search";

export type Underway = {
  readonly dialogue: DialogueKey;
  readonly mode: "reading" | "listening";
  // What is left, as the row says it: "Chapter 2 of 5" or "1 h 12 min left".
  readonly left: string;
  readonly progress: number;
};

// Sample values: what one reader has underway, the first being the dialogue open now.
export const UNDERWAY: ReadonlyArray<Underway> = [
  { dialogue: "crito", mode: "reading", left: "Chapter 2 of 5", progress: 30 },
  { dialogue: "phaedo", mode: "listening", left: "1 h 12 min left", progress: 38 },
  { dialogue: "meno", mode: "reading", left: "Chapter 1 of 8", progress: 8 },
];

const PLACES: ReadonlyArray<{ readonly place: Place; readonly label: string; readonly icon: "home" | "books" | "compass" | "search" }> = [
  { place: "home", label: "Home", icon: "home" },
  { place: "library", label: "Library", icon: "books" },
  { place: "explore", label: "Explore", icon: "compass" },
  { place: "search", label: "Search", icon: "search" },
];

const underwayRow = <Message>({ dialogue, mode, left, progress }: Underway, isOpen: boolean, h: HtmlBuilder<Message>): Html => {
  const done = mode === "reading" ? "read" : "heard";
  return h.span(
    [h.Class(isOpen ? "w-rn on" : "w-rn")],
    [
      cover({ dialogue, size: "xs" }, h),
      h.span(
        [h.Class("w-rn-t")],
        [h.b([], [DIALOGUES[dialogue].title]), h.span([], [icon(mode === "reading" ? "bookopen" : "headphones", h), left])],
      ),
      h.span([h.Class("w-ring"), h.Style({ "--p": `${progress}%` }), h.Role("img"), h.AriaLabel(`${progress}% ${done}`)]),
    ],
  );
};

const collectionRow = <Message>({ title, dialogues }: Collection, h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Class("w-rn")],
    [
      h.span(
        [h.Class("w-fan")],
        dialogues.map((dialogue) => cover({ dialogue, size: "xs" }, h)),
      ),
      h.span([h.Class("w-rn-t")], [h.b([], [title]), h.span([], [`${dialogues.length} dialogues`])]),
    ],
  );

export const sidebar = <Message>(
  {
    place,
    underway = UNDERWAY,
    settingsOpen = false,
  }: { readonly place: Place; readonly underway?: ReadonlyArray<Underway>; readonly settingsOpen?: boolean },
  h: HtmlBuilder<Message>,
): Html =>
  h.aside(
    [h.Class("w-side")],
    [
      h.b([h.Class("w-logo")], ["Plato"]),
      h.nav(
        [h.Class("w-nav")],
        PLACES.map((item) =>
          h.span(
            [h.Class(item.place === place ? "on" : "")],
            [
              icon(item.icon, h),
              h.b([], [item.label]),
              ...(item.place === "search" ? [h.kbd([h.Class("w-kbd")], ["/"])] : []),
            ],
          ),
        ),
      ),
      h.b([h.Class("w-sh")], ["Reading now"]),
      ...underway.map((row, index) => underwayRow(row, index === 0, h)),
      h.b([h.Class("w-sh")], ["Collections"]),
      ...COLLECTION_KEYS.map((key) => collectionRow(COLLECTIONS[key], h)),
      h.span([h.Class(settingsOpen ? "w-side-f on" : "w-side-f")], [icon("sliders", h), h.b([], ["Settings"])]),
    ],
  );

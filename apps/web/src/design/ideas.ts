// The ideas that recur across the dialogues, as Explore, idea pages and the panels show them.
// Dialogues are dark cloth books, so ideas are light plates: an emblem in one ink on a tint, drawn
// in the covers' language on a 40 by 40 grid with strokes that keep their weight at every size.
// Names are the corpus index's and counts are its distinct passages of accepted records; each line
// is proposed copy until the analysis plan settles it.
import type { Html, HtmlBuilder } from "foldkit/html";

export type Emblem = { readonly lines: ReadonlyArray<string>; readonly dots?: ReadonlyArray<string> };

// Each ink reads at 3:1 or more on its plate, which contrast.ts checks.
export const HUES = {
  lilac: { plate: "#E7DFEE", ink: "#5B4472" },
  rose: { plate: "#F3DFD9", ink: "#8C3A2C" },
  sage: { plate: "#E3EADC", ink: "#3E5B3B" },
  sand: { plate: "#F0E5CE", ink: "#7A5A1C" },
  sky: { plate: "#DEE7EE", ink: "#2E4F6B" },
  stone: { plate: "#E6E2DB", ink: "#4B463E" },
} satisfies Record<string, { readonly plate: string; readonly ink: string }>;

export type Hue = keyof typeof HUES;

export type Idea = {
  readonly name: string;
  readonly line: string;
  readonly passages: number;
  readonly dialogues: number;
  readonly hue: Hue;
  readonly emblem: Emblem;
};

const ring = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const IDEAS = {
  afterlife: {
    name: "Afterlife scenario",
    line: "What death might hold: a dreamless sleep, or a journey to meet the dead and their judges.",
    passages: 10,
    dialogues: 2,
    hue: "lilac",
    emblem: {
      lines: [
        "M7.6 23.6h24.8L28 29.6H12z",
        "M20 23.6V8.4",
        "M20 9.6l7.4 11H20",
        "M4.6 34.4c2.6-1.8 5-1.8 7.6 0s5 1.8 7.6 0 5-1.8 7.6 0 5 1.8 7.6 0",
      ],
    },
  },
  aporia: {
    name: "Aporia reported",
    line: "A speaker admits the argument has left them stuck, with no answer.",
    passages: 34,
    dialogues: 15,
    hue: "lilac",
    emblem: { lines: ["M7.6 33V7.6h24.8v24.8H13.4V13.4h13.2v13.2h-7.4v-6.6"] },
  },
  character: {
    name: "Character description by speaker",
    line: "One speaker describes what another person is like.",
    passages: 22,
    dialogues: 11,
    hue: "rose",
    emblem: {
      lines: [
        "M20 26.4c-4.8 0-8.4-4.4-8.4-10.2S15.2 6 20 6s8.4 4.4 8.4 10.2-3.6 10.2-8.4 10.2z",
        "M20 26.4V34M15.4 34h9.2",
        "M19.4 10.4c1.6.8 2 2.4 1.6 4l1.4 2-1.4.6c.2 1.4-.4 2.6-1.6 3",
      ],
    },
  },
  "common-opinion": {
    name: "Common opinion deployed as challenge",
    line: "Someone appeals to what everyone believes, to test or resist what was just said.",
    passages: 7,
    dialogues: 5,
    hue: "rose",
    emblem: {
      lines: [
        ring(11.6, 16.6, 3.6),
        ring(28.4, 16.6, 3.6),
        ring(20, 12.6, 3.8),
        "M4.8 32c0-5.6 3-8.6 6.8-8.6M35.2 32c0-5.6-3-8.6-6.8-8.6M11.8 32c0-6.6 3.6-10.6 8.2-10.6s8.2 4 8.2 10.6",
      ],
    },
  },
  counterexample: {
    name: "Refutation by counterexample",
    line: "A claim is undone by a single case it cannot fit.",
    passages: 31,
    dialogues: 11,
    hue: "sand",
    emblem: { lines: [ring(7.6, 20, 3.1), ring(16, 20, 3.1), ring(24.4, 20, 3.1), "M29.8 16.9h6.2v6.2h-6.2z"] },
  },
  definition: {
    name: "Definition proposed",
    line: "Someone answers a “what is it?” question with a definition, usually to have it tested.",
    passages: 111,
    dialogues: 22,
    hue: "stone",
    // A boundary stone on the line it marks: the Greek for a definition, horos, is the word for one.
    // The line keeps it from reading as a gravestone.
    emblem: {
      lines: [
        "M15.5 31V13.8l1.6-1.8h5.8l1.6 1.8V31",
        "M6 31h28",
        "M18.4 17.5h3.2M18.4 21.5h3.2",
        "M5.5 24.5h2.6M10.6 24.5h2.6",
        "M26.8 24.5h2.6M31.9 24.5h2.6",
      ],
    },
  },
  "expert-craft": {
    name: "Expert craft analogy",
    line: "Comparing a question about how to live to a craft, such as medicine or training, to ask whose knowledge should count.",
    passages: 77,
    dialogues: 18,
    hue: "sand",
    emblem: { lines: [ring(20, 7.6, 2.4), "M18.8 9.8 11 34M21.2 9.8 29 34", "M14 26.6c4 1.8 8 1.8 12 0"] },
  },
  figures: {
    name: "Figures or types as evidence",
    line: "Famous people or kinds of people cited as proof, such as Themistocles or the craftsmen.",
    passages: 51,
    dialogues: 13,
    hue: "sand",
    // A herm: a head on a pillar, as Athens set its exemplars up in the street.
    emblem: { lines: [ring(20, 10.4, 4.4), "M14.4 18.4h11.2", "M15.6 18.4l1.2 15.2M24.4 18.4l-1.2 15.2", "M11.4 33.6h17.2"] },
  },
  "forced-alternative": {
    name: "Forced alternative",
    line: "Someone is made to choose between two answers that cannot both stand.",
    passages: 50,
    dialogues: 14,
    hue: "rose",
    emblem: { lines: ["M20 35V23.6", "M20 23.6 12.2 11.6M20 23.6l7.8-12", "M11.4 16.4l.8-4.8 4.8 1.2M23 12.8l4.8-1.2.8 4.8"] },
  },
  "initial-question": {
    name: "Initial question stated",
    line: "The question the conversation will pursue is put on the table.",
    passages: 17,
    dialogues: 9,
    hue: "sage",
    emblem: { lines: ["M13.6 14.2c0-5.6 12.8-5.6 12.8 0 0 5-6.4 5.2-6.4 10.4V26"], dots: [ring(20, 31.6, 2)] },
  },
  "knowledge-opinion": {
    name: "Knowledge vs right opinion",
    line: "The difference between knowing something and merely believing what happens to be true.",
    passages: 6,
    dialogues: 2,
    hue: "sky",
    // Meno 97e: true opinions run off like Daedalus' statues until reasoning ties them down.
    emblem: {
      lines: ["M27 35V9.4", "M23.4 9.4h7.2", "M21 35h12", "M24.2 17.4l5.6-2.4M24.2 21.2l5.6-2.4", "M24.2 19.4C17.8 19.6 13.2 23.4 5.6 25"],
    },
  },
  "myth-logos": {
    name: "Myth logos boundary",
    line: "A speaker marks where a story ends and an argued account begins.",
    passages: 18,
    dialogues: 10,
    hue: "sky",
    // A wave for the story, a bar where it stops, and a straight line for the argued account.
    emblem: { lines: ["M5.5 20c1.6-3.2 3.4-3.2 5 0s3.4 3.2 5 0", "M20 12.5v15", "M23.5 20h10", "M30.2 16.6 33.6 20l-3.4 3.4"] },
  },
  "named-cast": {
    name: "Named cast entry or catalog",
    line: "People are named as they arrive, or as someone lists who is involved.",
    passages: 15,
    dialogues: 9,
    hue: "sage",
    emblem: {
      lines: [
        ring(9.6, 8.8, 2.2),
        ring(9.6, 18.4, 2.2),
        ring(9.6, 28, 2.2),
        "M5.8 14.2c.4-1.8 1.8-2.8 3.8-2.8s3.4 1 3.8 2.8M5.8 23.8c.4-1.8 1.8-2.8 3.8-2.8s3.4 1 3.8 2.8M5.8 33.4c.4-1.8 1.8-2.8 3.8-2.8s3.4 1 3.8 2.8",
        "M18 10.4h15M18 20h15M18 29.6h9.4",
      ],
    },
  },
  "one-over-many": {
    name: "One over many form reasoning",
    line: "Many things that share a name are explained by the one form they all have.",
    passages: 19,
    dialogues: 9,
    hue: "stone",
    emblem: {
      lines: [ring(20, 9.4, 3.6), ring(9, 30.4, 3), ring(20, 30.4, 3), ring(31, 30.4, 3), "M18 12.4 10.6 27.6M20 13v14.4M22 12.4l7.4 15.2"],
    },
  },
  "poetic-citation": {
    name: "Poetic citation as argument",
    line: "Lines from a poet, often Homer, quoted as evidence for a point.",
    passages: 26,
    dialogues: 11,
    hue: "lilac",
    // Quotation marks over a line of verse. Not a lyre, which is the Ion's cover.
    emblem: {
      lines: [
        "M9.5 16.5v-2.2c0-2.3 1.2-3.9 3.3-4.6",
        "M15.3 16.5v-2.2c0-2.3 1.2-3.9 3.3-4.6",
        "M9 23.5c2.3-2.6 4.6-2.6 6.9 0s4.6 2.6 6.9 0 4.6-2.6 6.9 0",
        "M9 29.5h14.5",
      ],
      dots: ["M9.5 16.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0z", "M15.3 16.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0z"],
    },
  },
  prison: {
    name: "Prison execution frame",
    line: "The scene is a prison cell, with the execution only days away.",
    passages: 7,
    dialogues: 2,
    hue: "stone",
    emblem: { lines: ["M11 34V18a9 9 0 0 1 18 0v16z", "M17 9.6V34M23 9.6V34", "M11 22.6h18"] },
  },
  scope: {
    name: "Scope delimitation",
    line: "A speaker fixes exactly what is in question and sets everything else aside.",
    passages: 37,
    dialogues: 14,
    hue: "sage",
    emblem: { lines: ["M15 9h-4.4v22H15M25 9h4.4v22H25", ring(3.6, 20, 1.3), ring(36.4, 20, 1.3)], dots: [ring(20, 20, 3)] },
  },
  "truth-priority": {
    name: "Truth priority procedure",
    line: "A speaker commits to follow whichever argument proves best on reflection, wherever it leads.",
    passages: 13,
    dialogues: 9,
    hue: "sky",
    emblem: {
      lines: ["M9 35 17.6 17M31 35l-8.6-18", "M20 34v-3.4M20 26.8v-2.6M20 21.4v-1.6"],
      dots: ["M20 4.4l1.5 3.3 3.3 1.5-3.3 1.5-1.5 3.3-1.5-3.3-3.3-1.5 3.3-1.5z"],
    },
  },
} satisfies Record<string, Idea>;

export type IdeaKey = keyof typeof IDEAS;
export const IDEA_KEYS = Object.keys(IDEAS) as ReadonlyArray<IdeaKey>;

export const idea = (key: IdeaKey): Idea => IDEAS[key];

// sm sits in a list row, md heads a phone page and lg a desktop one.
export type BadgeSize = "sm" | "md" | "lg";

export const ideaEmblem = <Message>(key: IdeaKey, h: HtmlBuilder<Message>): Html => {
  const { lines, dots }: Emblem = idea(key).emblem;
  return h.svg(
    [h.Class("em"), h.ViewBox("0 0 40 40"), h.AriaHidden(true)],
    [...lines.map((d) => h.path([h.Class("em-l"), h.D(d)])), ...(dots ?? []).map((d) => h.path([h.Class("em-d"), h.D(d)]))],
  );
};

export const ideaBadge = <Message>(
  { idea: key, size }: { readonly idea: IdeaKey; readonly size?: BadgeSize },
  h: HtmlBuilder<Message>,
): Html => {
  const { plate, ink } = HUES[idea(key).hue];
  return h.span([h.Class(size ? `a-idb ${size}` : "a-idb"), h.Style({ "--idb": plate, "--idb-ink": ink })], [ideaEmblem(key, h)]);
};

// An idea as a row in a list: its emblem, name and line, and where else it comes back.
export const ideaRow = <Message>(
  { idea: key, where }: { readonly idea: IdeaKey; readonly where: string },
  h: HtmlBuilder<Message>,
): Html => {
  const { name, line } = idea(key);
  return h.div([h.Class("w-idr")], [ideaBadge({ idea: key }, h), h.span([h.Class("w-idr-b")], [h.b([], [name]), h.p([], [line]), h.span([], [where])])]);
};

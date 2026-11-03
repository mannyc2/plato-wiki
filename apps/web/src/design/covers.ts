// Each dialogue is a cloth-bound book. Its cloth colour also tints the dialogue's page band and,
// darkened, its listening screens, so every colour must pass the contrast floors in contrast.ts.
// An emblem is drawn on a 60 by 40 grid with 2-point strokes; dialogues without one show the
// plain ornament until theirs is drawn.
import type { Html, HtmlBuilder } from "foldkit/html";

type Emblem = <Message>(h: HtmlBuilder<Message>) => ReadonlyArray<Html>;

export type Dialogue = {
  readonly title: string;
  readonly cloth: string;
  // Lettering colour where the default cream would sit too close to the cloth.
  readonly ink?: string;
  readonly emblem?: Emblem;
};

export const DIALOGUES = {
  apology: {
    title: "Apology",
    cloth: "#7A2B2B",
    emblem: (h) => [
      h.path([h.D("M30 5.5v27M15.5 11h29")]),
      h.path([h.D("M15.5 11 9.5 23.5h12zM44.5 11l-6 12.5h12z")]),
      h.path([h.D("M21.5 34.5h17")]),
    ],
  },
  charmides: { title: "Charmides", cloth: "#546B2E" },
  cratylus: { title: "Cratylus", cloth: "#3F5466" },
  critias: { title: "Critias", cloth: "#2D5560" },
  crito: {
    title: "Crito",
    cloth: "#2F5D50",
    emblem: (h) => [
      h.path([h.D("M6 31h48")]),
      h.path([h.D("M17 31a13 13 0 0 1 26 0")]),
      h.path([h.D("M30 8.5v5.5M15.5 14.5l3.8 3.8M44.5 14.5l-3.8 3.8M8.5 24.5h4.5M47 24.5h4.5")]),
    ],
  },
  euthydemus: { title: "Euthydemus", cloth: "#534C1A" },
  euthyphro: {
    title: "Euthyphro",
    cloth: "#8A5E1C",
    emblem: (h) => [
      h.path([h.D("M9 15.5 30 5.5l21 10z")]),
      h.path([h.D("M14 19v12M22.5 19v12M37.5 19v12M46 19v12")]),
      h.path([h.D("M8 34.5h44")]),
    ],
  },
  gorgias: {
    title: "Gorgias",
    cloth: "#3E3A6E",
    emblem: (h) => [
      h.path([h.D("M19 33.5h22M23 33.5V20h14v13.5")]),
      h.path([h.D("M17 20h26")]),
      h.path([h.D("M44 11.5a6 6 0 0 1 0 6M47.5 8.5a10.5 10.5 0 0 1 0 12")]),
    ],
  },
  "greater-hippias": { title: "Greater Hippias", cloth: "#5F3355" },
  ion: {
    title: "Ion",
    cloth: "#1F5E6B",
    emblem: (h) => [
      h.path([h.D("M19 6.5c-4.5 6.5-4.5 18.5 3.5 25.5h15c8-7 8-19 3.5-25.5")]),
      h.path([h.D("M22 13.5h16M26 13.5V32M30 13.5V32M34 13.5V32")]),
    ],
  },
  laches: {
    title: "Laches",
    cloth: "#5B3A29",
    emblem: (h) => [
      h.circle([h.Cx("30"), h.Cy("21"), h.R("10.5")]),
      h.path([h.D("M12 35 48 7M48 35 12 7")]),
      h.path([h.D("M45.5 7H48v2.5M14.5 7H12v2.5")]),
    ],
  },
  laws: { title: "Laws", cloth: "#3B4A2F" },
  "lesser-hippias": { title: "Lesser Hippias", cloth: "#6B5675" },
  lysis: { title: "Lysis", cloth: "#8A4B5C" },
  menexenus: { title: "Menexenus", cloth: "#7A3F33" },
  meno: {
    title: "Meno",
    cloth: "#3A4F7A",
    emblem: (h) => [
      h.rect([h.X("18"), h.Y("5.5"), h.Width("24"), h.Height("24")]),
      h.path([h.D("M30 5.5 42 17.5 30 29.5 18 17.5z")]),
      h.path([h.D("M18 29.5 42 5.5")]),
    ],
  },
  parmenides: { title: "Parmenides", cloth: "#2C3E50" },
  phaedo: {
    title: "Phaedo",
    cloth: "#23304A",
    emblem: (h) => [
      h.path([h.D("M10 11.5h40c0 9.2-9 15.2-20 15.2S10 20.7 10 11.5z")]),
      h.path([h.D("M30 26.7v6.3M21.5 34.5h17")]),
      h.path([h.D("M6.5 11.5h3.5M50 11.5h3.5")]),
    ],
  },
  phaedrus: { title: "Phaedrus", cloth: "#7B6A3A" },
  philebus: { title: "Philebus", cloth: "#6E3B47" },
  protagoras: { title: "Protagoras", cloth: "#8C4A2B" },
  republic: {
    title: "Republic",
    cloth: "#2B2B2B",
    ink: "#E2C27E",
    emblem: (h) => [
      h.path([h.D("M10 34V21a20 15 0 0 1 40 0v13")]),
      h.circle([h.Cx("30"), h.Cy("23"), h.R("5")]),
      h.path([h.D("M5.5 34.5h49")]),
    ],
  },
  sophist: { title: "Sophist", cloth: "#3D5A5A" },
  statesman: { title: "Statesman", cloth: "#50466E" },
  symposium: {
    title: "Symposium",
    cloth: "#873A53",
    emblem: (h) => [h.circle([h.Cx("24"), h.Cy("19.5"), h.R("11")]), h.circle([h.Cx("36"), h.Cy("19.5"), h.R("11")])],
  },
  theaetetus: { title: "Theaetetus", cloth: "#45604F" },
  timaeus: { title: "Timaeus", cloth: "#1E3F5A" },
} satisfies Record<string, Dialogue>;

export type DialogueKey = keyof typeof DIALOGUES;
export const DIALOGUE_KEYS = Object.keys(DIALOGUES) as ReadonlyArray<DialogueKey>;

const dialogue = (key: DialogueKey): Dialogue => DIALOGUES[key];

// xs and sm covers drop the lettering in CSS and keep only the emblem or ornament.
export type CoverSize = "xs" | "sm" | "sm2" | "md" | "lg" | "xl" | "fill";

// Eight letters or more set smaller so the title fits the cover on one line, or two for two words.
const isLongTitle = (title: string) => title.length >= 8;

export const coverEmblem = <Message>(key: DialogueKey, h: HtmlBuilder<Message>): Html => {
  const emblem = dialogue(key).emblem;
  if (!emblem) return h.span([h.Class("a-cv-orn")]);
  return h.svg(
    [
      h.Class("em"),
      h.ViewBox("0 0 60 40"),
      h.AriaHidden(true),
      h.Fill("none"),
      h.Stroke("currentColor"),
      h.StrokeWidth("2"),
      h.StrokeLinecap("round"),
      h.StrokeLinejoin("round"),
    ],
    emblem(h),
  );
};

export const cover = <Message>(
  { dialogue: key, size }: { readonly dialogue: DialogueKey; readonly size?: CoverSize },
  h: HtmlBuilder<Message>,
): Html => {
  const { title, cloth, ink } = dialogue(key);
  return h.span(
    [h.Class(size ? `a-cv ${size}` : "a-cv"), h.Style(ink ? { "--cv": cloth, "--cv-ink": ink } : { "--cv": cloth })],
    [
      h.span(
        [h.Class("a-cv-in")],
        [
          h.span([h.Class("a-cv-by")], ["Plato"]),
          coverEmblem(key, h),
          h.span([h.Class(isLongTitle(title) ? "a-cv-t long" : "a-cv-t")], [title]),
        ],
      ),
    ],
  );
};

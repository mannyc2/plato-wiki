// The people of the dialogues, as cast lists, talk shares and person pages show them. Each person
// is a cameo: a cream bust on their fill, facing into the page, with hair, beards and cloaks in a
// tone between the two and details drawn in the fill. Features come from the text where it gives
// them, such as Socrates' snub nose and Meletus' hooked one. The bust reads at 4.5:1 or more on
// the fill and the fill at 3:1 or more as a chart bar on the card, which contrast.ts checks.
import type { Html, HtmlBuilder } from "foldkit/html";

// Paths on a 40 by 40 grid, in drawing order.
export type Portrait = {
  readonly bust: ReadonlyArray<string>;
  readonly tone?: ReadonlyArray<string>;
  readonly lines?: ReadonlyArray<string>;
  readonly dots?: ReadonlyArray<string>;
};

export type Person = {
  readonly name: string;
  readonly fill: string;
  readonly portrait: Portrait;
};

const dot = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const eye = (x: number, y: number) => `M${x - 1.4} ${y}c.8-.6 2-.7 2.8-.2`;

// One head shape, with the face drawn four ways from the forehead down.
const BACK =
  "M2 40C3.6 35.4 8.2 33 13.6 31.6C13.4 29.6 12.6 27.8 11.6 26.2C9.2 22.4 8.6 16.6 10.6 12C12.8 7 17.6 4.4 22.4 4.8C26.4 5.2 29 8 29.6 11.6";
const NECK = "C24.9 30.6 25.6 32.2 26.8 33.2C31.6 34.2 36.2 36 38 40Z";
const STRAIGHT =
  "C29.9 13.2 29.8 14.4 29.4 15.4L29.6 16.2C30.4 17.6 31.4 19 31.8 20C32 20.8 31.2 21.4 30 21.4C30.2 22 30.1 22.6 29.8 23C29.4 23.3 29.4 23.7 29.8 24.1C29.8 25.3 29.3 26.6 28.6 27.4C27.6 28.4 26.2 28.6 25 28.8" +
  NECK;
const SOFT =
  "C29.8 13 29.7 14.3 29.3 15.3L29.4 16C30.1 17.3 30.9 18.6 31.2 19.6C31.3 20.3 30.7 20.8 29.7 20.8C29.9 21.5 29.8 22.1 29.5 22.5C29.1 22.8 29.1 23.2 29.4 23.6C29.4 24.8 28.9 26 28.1 26.7C27.1 27.6 25.8 27.8 24.8 28.2" +
  NECK;
const SNUB =
  "C29.9 13.2 29.8 14.6 29.4 15.8C29.5 17 30.3 18.2 31.1 19.2C31.5 19.8 31.1 20.4 30.3 20.4C30.6 21.6 30.4 23.4 29.8 24.6C29.4 26.4 28.2 27.6 26.6 28.2C25.8 30.2 26 32 26.8 33.2C31.6 34.2 36.2 36 38 40Z";
const HOOKED =
  "C29.9 13.2 29.8 14.4 29.6 15.2C31.2 15.8 32.4 17.6 32.5 19.6C32.5 20.3 32.1 20.8 31.4 20.9C30.9 21 30.5 21.1 30.1 21.3C30.3 22 30.1 22.6 29.8 23C29.4 23.3 29.4 23.7 29.8 24.1C29.8 25.3 29.3 26.6 28.6 27.4C27.6 28.4 26.2 28.6 25 28.8" +
  NECK;
const EAR = "M18.6 16.6c1.9-.6 3.1 2.1 1.7 3.9-.6.7-1.2.6-1.5.1";

// Short hair from the brow to the nape.
const CROPPED =
  "M29.4 10.8C28.4 7 25.2 4.8 21.6 4.8C16.6 4.8 12 8 10.4 12.6C9.2 16.4 9.4 20.8 11.2 24.6C12.6 23.8 13.6 22 14.2 20.2C15 18 16.6 16.4 18.6 15.8C19.4 13.4 21.2 11.6 23.6 11C25.6 10.6 27.6 10.6 29.4 10.8Z";

// A himation over the far shoulder, over the near one, or a cloak pinned at the near shoulder.
const FAR_DRAPE = "M2 40C3.6 35.4 8.2 33 13.6 31.6C16.2 34.4 18.6 37.4 19.8 40Z";
const FAR_FOLD = "M9.6 34.4c2.6 1.2 4.6 3 5.8 5.4";
const NEAR_DRAPE = "M26.8 33.2C31.6 34.2 36.2 36 38 40L20 40C21.6 37 24 34.6 26.8 33.2Z";
const NEAR_FOLD = "M23.6 39.6c1.4-2.2 3.2-3.8 5.4-4.8";
const CLOAK = "M2 40C3.6 35.4 8.2 33 13.6 31.6C18 34.6 23.4 35.8 27.4 35.6C31 35.4 34.6 35.2 38 40Z";
const PIN = dot(27.4, 35.6, 1.1);

export const PEOPLE = {
  crito: {
    name: "Crito",
    fill: "#2F5D50",
    portrait: {
      bust: [BACK + STRAIGHT],
      tone: [
        CROPPED,
        "M29.8 23.6C30.2 25.4 29.8 27.4 28.6 28.6C27 30.2 24.4 30.6 22.4 29.6C20.6 28.6 19.6 26.6 19.4 24.4C19.4 23.2 19.6 22.4 20 21.8C21.4 23 23.4 23.6 25.4 23.4C27 23.2 28.4 23.2 29.8 23.6Z",
        NEAR_DRAPE,
      ],
      lines: [EAR, eye(26.6, 16.8), "M30 21.8c-.8.6-1.8.8-2.8.6", NEAR_FOLD],
      dots: [dot(26.8, 17.1, 0.6)],
    },
  },
  // Phlius, far from Athens, so a traveller's cloak pinned at the shoulder, and a full beard.
  echecrates: {
    name: "Echecrates",
    fill: "#3F4A8C",
    portrait: {
      bust: [BACK + SOFT],
      tone: [
        CROPPED,
        "M29.4 23.2C30.4 25.8 30 29.4 28.2 32C26.8 34 24.4 35 22.2 34.4C20.4 32.6 19.4 30 19.2 27.2C19 25.4 19.4 23.6 20 22.2C21.6 23.2 23.6 23.6 25.6 23.2C27 23 28.2 22.9 29.4 23.2Z",
        CLOAK,
      ],
      lines: [EAR, eye(26.4, 16.6), "M28.2 26.4c-.6.4-1.4.5-2.2.3"],
      dots: [dot(26.6, 16.9, 0.55), PIN],
    },
  },
  euthyphro: {
    name: "Euthyphro",
    fill: "#8A5E1C",
    // A seer, so a laurel wreath, and a long beard.
    portrait: {
      bust: [BACK + STRAIGHT],
      tone: [
        CROPPED,
        "M29.8 23.4C30.8 26.4 30.4 30.6 28.4 33.6C27.4 35.2 26 36.4 24.4 37C23.6 34.6 22 32.6 20.6 30.6C19.6 28.8 19.4 26.2 19.6 23.6C19.6 22.8 19.8 22.4 20 21.8C21.4 23 23.4 23.6 25.4 23.4C27 23.2 28.4 23 29.8 23.4Z",
        FAR_DRAPE,
      ],
      lines: [EAR, eye(26.6, 16.8), "M28.8 10.4C23.6 8.4 16.4 9.8 11.6 15.2", FAR_FOLD],
      dots: [
        dot(26.8, 17.1, 0.6),
        "M26.6 8.6c.6-1.6 2-2.4 3.4-2.2-.4 1.6-1.8 2.6-3.4 2.2z",
        "M22.6 7.8c.2-1.8 1.4-3 3-3.2 0 1.8-1.2 3-3 3.2z",
        "M18.6 8.6c0-1.8.8-3.2 2.4-3.8.4 1.6-.6 3.2-2.4 3.8z",
        "M15 10.6c-.4-1.6.2-3.2 1.6-4 .6 1.6 0 3.2-1.6 4z",
        "M12.2 13.6c-.8-1.4-.6-3.2.6-4.2.8 1.4.6 3.2-.6 4.2z",
      ],
    },
  },
  // The Laws are a voice Socrates performs, so they are an inscribed stone in a bronze that reads as
  // no one on the cast list.
  laws: {
    name: "The Laws",
    fill: "#75633F",
    portrait: {
      bust: ["M11.4 12.6 20 6.2l8.6 6.4z", "M13 12.6h14V35H13z", "M9.4 35h21.2v6H9.4z"],
      lines: ["M16.4 17h7.2M16.4 20.6h7.2M16.4 24.2h5M16.4 27.8h7.2", "M11.4 12.6h17.2"],
    },
  },
  // Euthyphro 2b: long straight hair, not much of a beard, and a hooked nose.
  meletus: {
    name: "Meletus",
    fill: "#7A2B2B",
    portrait: {
      bust: [BACK + HOOKED],
      tone: [
        "M29.4 10.8C28.4 6.8 25 4.6 21.4 4.8C16.2 5 11.8 8.4 10.2 13.2C8.8 17.6 9 22.6 9.6 27.4C10 31 9.6 34.6 8.4 38C10.6 37.4 12.8 36.4 14.6 35C15.2 30.4 15 25.6 15.4 21.2C15.8 18.2 17 16 18.8 15.4C19.6 13.2 21.4 11.6 23.6 11C25.6 10.6 27.6 10.6 29.4 10.8Z",
        NEAR_DRAPE,
      ],
      lines: [EAR, eye(26.6, 16.8), "M12 18.6v12M13.6 17.4v14", "M27.6 27.6l.4 1.6M25.8 28.6l.2 1.8M24 28.6l-.2 1.8M22.2 27.8l-.4 1.6", NEAR_FOLD],
      dots: [dot(26.8, 17.1, 0.6)],
    },
  },
  // A rich young Thessalian, in a pinned cloak and a fillet.
  meno: {
    name: "Meno",
    fill: "#3A4F7A",
    portrait: {
      bust: [BACK + SOFT],
      tone: [
        "M29.4 10.6C28.2 6.6 24.6 4.6 20.8 4.8C15.4 5 11 8.6 9.8 13.6C8.8 18 9.6 22.6 11.6 26.4C11 28.4 11.6 30.4 13.4 31.4C14.8 30.4 15.4 28.6 15 27C16.6 26.6 17.6 25 17.4 23.4C18.8 22.8 19.4 21.2 19 19.8C20.2 18.8 20.4 17.2 19.8 16C21.4 15.2 22 13.6 21.6 12.2C24 10.8 26.8 10.4 29.4 10.6Z",
        CLOAK,
      ],
      lines: [EAR, eye(26.4, 16.8), "M29 10.4C23.4 9 16 10.8 10.8 15.8"],
      dots: [dot(26.6, 17.1, 0.55), PIN],
    },
  },
  // Phaedo 89b: the long hair Socrates says he will cut in mourning.
  phaedo: {
    name: "Phaedo",
    fill: "#23304A",
    portrait: {
      bust: [BACK + SOFT],
      tone: [
        "M29.4 10.6C28.2 6.6 24.6 4.4 20.6 4.6C15.2 4.8 10.6 8.6 9.6 13.8C8.6 18.6 9.6 23.4 10.6 27.8C11.4 31.2 10.6 34.6 8.6 37.2C11.6 37.8 14.6 36.8 16.2 34.6C16.8 31.6 16.4 28.6 15.6 25.8C17.4 24.8 18 22.6 17.4 20.8C18.6 20 19.2 18.4 18.8 17C20.4 16.2 21.2 14.4 20.8 12.8C23.4 11 26.4 10.4 29.4 10.6Z",
        FAR_DRAPE,
      ],
      lines: [EAR, eye(26.4, 16.8), FAR_FOLD],
      dots: [dot(26.6, 17.1, 0.55)],
    },
  },
  protarchus: {
    name: "Protarchus",
    fill: "#6A4E3B",
    portrait: {
      bust: [BACK + SOFT],
      tone: [
        "M11.6 24.4C9.6 23.4 9.4 20.8 10.6 19.4C9.4 17.8 10 15.4 11.8 14.8C11.4 12.6 12.8 10.8 14.8 10.6C15.4 8.4 17.6 7.2 19.6 7.8C20.8 6 23.4 5.6 25 6.8C27 6.6 28.8 7.8 29.2 9.8C30.2 10.4 30.4 11.6 30 12.6C28.2 11.6 26 11.8 24.6 13C23.2 14.2 22.8 16 22.6 17.6C20.4 17.4 18.2 18.6 17.4 20.8C15.6 20.6 13.6 21.8 13 23.6C12.6 24 12 24.4 11.6 24.4Z",
        NEAR_DRAPE,
      ],
      lines: [EAR, eye(26.4, 16.8), NEAR_FOLD],
      dots: [dot(26.6, 17.1, 0.55)],
    },
  },
  // Phaedo 63a: Cebes always hunts out arguments and is not quickly persuaded, so he leans in under
  // a short fringe, young and beardless.
  cebes: {
    name: "Cebes",
    fill: "#6B3A5C",
    portrait: {
      bust: [BACK + STRAIGHT],
      tone: [
        "M29.6 11.6C28.8 7.2 25.2 4.6 21.2 4.8C16.2 5 11.8 8.4 10.4 13.2C9.2 17.4 9.8 21.8 11.6 25.4C13 24.6 14 23 14.4 21.2C15.2 18.6 17 16.8 19.2 16.2C19.4 14.2 20.8 12.6 22.8 12.4C23.8 13.6 25.4 14 26.8 13.4C27.8 12.8 28.6 12 29.6 11.6Z",
        NEAR_DRAPE,
      ],
      lines: [EAR, eye(26.6, 16.9), "M24.8 14.6c1.2-.7 2.8-.8 4-.2", NEAR_FOLD],
      dots: [dot(26.8, 17.2, 0.6)],
    },
  },
  // Phaedo 84d–85b: Simmias, young and gentle, answers Socrates' swan with a hesitant objection; curly
  // hair and a himation over the far shoulder.
  simmias: {
    name: "Simmias",
    fill: "#55642A",
    portrait: {
      bust: [BACK + SOFT],
      tone: [
        "M29.2 10.4C28.6 8 26.6 6.4 24.4 6.6C23.2 5.2 20.8 5 19.4 6.2C17.4 5.8 15.4 7 14.8 8.8C12.8 9.2 11.4 11.2 11.8 13.2C10 14.2 9.4 16.6 10.4 18.4C9.2 19.8 9.4 22.2 11 23.4C11.2 24.6 12 25.6 13.2 25.8C14 24 14.2 22 13.8 20.2C15.4 19.6 16.4 18 16.2 16.4C17.8 16 19 14.6 19 13C20.6 12.8 21.8 11.6 22 10.2C24.4 10.8 26.8 11 29.2 10.4Z",
        FAR_DRAPE,
      ],
      lines: [EAR, eye(26.4, 16.8), FAR_FOLD],
      dots: [dot(26.6, 17.1, 0.55)],
    },
  },
  // Theaetetus 143e and Symposium 215b: bald, snub-nosed, with eyes that stand out, in one old cloak.
  socrates: {
    name: "Socrates",
    fill: "#A8461F",
    portrait: {
      bust: [BACK + SNUB],
      tone: [
        "M30.6 20.8C31.8 21.6 32 23 31.2 23.8C32.2 25.6 31.8 28.6 30.2 30.6C28.4 32.8 25 33.6 22.4 32.6C20.2 31.8 19.2 29.4 19 27C18.8 25 19 23.2 19.8 21.8C21.6 22.6 23.8 22.8 25.8 22.2C27.6 21.8 29.2 21 30.6 20.8Z",
        "M17.8 13.8C14.8 13.6 11.6 15 10.2 17.8C9.2 20.4 9.8 23.6 11.6 26.2C12.8 26 13.8 25.2 14.4 24C13.4 22.4 13.2 20.4 14 18.8C14.8 17.2 16.4 16.2 18.2 16Z",
        FAR_DRAPE,
      ],
      lines: [EAR, "M27.6 24c.8-.3 1.8-.2 2.6.2", "M24.6 14.4c1.2-.9 3.2-1 4.6-.2", FAR_FOLD],
      dots: [dot(26.8, 16.5, 1.2)],
    },
  },
  // A traveller, so a petasos and a cloak pinned for the road.
  visitor: {
    name: "The visitor from Elea",
    fill: "#3D5A5A",
    portrait: {
      bust: [BACK + STRAIGHT],
      tone: [
        "M5.6 14.2C11.4 11.4 26.4 9.8 35.2 12C36.4 12.4 36 13.4 34.6 13.4C26.6 13.2 12.8 14.4 6.6 15.8C5.2 16 4.8 14.6 5.6 14.2Z",
        "M12.8 12.8C13 8 16.6 5.2 21.2 5.2C25.4 5.2 28.4 7.8 28.8 11.6Z",
        "M29.8 23.4C30.6 25.6 30.2 28.4 28.6 30.2C27 31.8 24.4 32.2 22.4 31C20.6 29.8 19.6 27.4 19.6 24.6C19.6 23.4 19.8 22.6 20.2 22C21.6 23.2 23.6 23.6 25.6 23.4C27.2 23.2 28.6 23 29.8 23.4Z",
        CLOAK,
      ],
      lines: [EAR, eye(26.6, 17.4)],
      dots: [dot(26.8, 17.7, 0.6), PIN],
    },
  },
  // Crito 44a: "a beautiful, fair woman, clothed in white raiment", veiled here.
  woman: {
    name: "A woman in a dream",
    fill: "#5E5A80",
    portrait: {
      bust: [BACK + SOFT],
      tone: [
        "M30.2 11.8C29.2 6.2 23.4 2.8 17.6 4.2C11.6 5.6 8.4 11.6 8.8 18.2C9.2 24.4 8 30.8 4.2 36.2C3.2 37.6 2.4 38.8 2 40H20C21.6 36.4 22.2 32.6 21.6 28.8C21 24.8 20.4 20.6 21.6 17.2C22.8 14 25.6 11.8 28.8 11.6C29.2 11.6 29.8 11.7 30.2 11.8Z",
      ],
      lines: [eye(26.4, 16.6), "M27.4 12.2C24 11.6 20.8 13.6 19.8 17.2C18.8 20.8 19.6 24.8 20.2 28.6C20.6 32.4 20 36.4 18.6 40"],
      dots: [dot(26.6, 16.9, 0.55)],
    },
  },
} satisfies Record<string, Person>;

export type PersonKey = keyof typeof PEOPLE;
export const PERSON_KEYS = Object.keys(PEOPLE) as ReadonlyArray<PersonKey>;

export type AvatarSize = "sm" | "lg" | "xl" | "w-xxl";

const avatarClass = (size: AvatarSize | undefined) => (size ? `a-av ${size}` : "a-av");

const layer = <Message>(className: string, paths: ReadonlyArray<string> | undefined, h: HtmlBuilder<Message>) =>
  (paths ?? []).map((d) => h.path([h.Class(className), h.D(d)]));

export const portrait = <Message>(person: PersonKey, h: HtmlBuilder<Message>): Html => {
  const { bust, tone, lines, dots }: Portrait = PEOPLE[person].portrait;
  return h.svg(
    [h.Class("a-pt"), h.ViewBox("0 0 40 40"), h.AriaHidden(true)],
    [...layer("pt-b", bust, h), ...layer("pt-t", tone, h), ...layer("pt-l", lines, h), ...layer("pt-d", dots, h)],
  );
};

export const avatar = <Message>(
  { person, size }: { readonly person: PersonKey; readonly size?: AvatarSize },
  h: HtmlBuilder<Message>,
): Html => h.span([h.Class(avatarClass(size)), h.Style({ "--pf": PEOPLE[person].fill })], [portrait(person, h)]);

// A row that stands for several minor speakers at once shows their number on the muted ink.
export const OTHERS = "#6A6359";

export const othersAvatar = <Message>(
  { count, size }: { readonly count: number; readonly size?: AvatarSize },
  h: HtmlBuilder<Message>,
): Html => h.span([h.Class(avatarClass(size)), h.Style({ "--pf": OTHERS })], [String(count)]);

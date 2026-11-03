// WCAG contrast for the colours the kit mixes from a dialogue's cloth, a person's fill or an idea's
// plate. The floors are the lowest ratios Foundations publishes, so a new cloth, person or idea may
// not lower them. Mixes follow `color-mix(in srgb, ...)` as tokens.css writes them.

const PAPER = "#FBF8F3";
const INK = "#1F1B16";
const CARD = "#FFFFFF";
const ACCENT_TEXT = "#A3321F";
// The cream that cover lettering, listening text and portrait busts use (`--on`).
const ON = "#F4EBD6";

const channel = (hex: string, index: number) => Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);

export const mix = (a: string, share: number, b: string): string =>
  `#${[0, 1, 2]
    .map((index) =>
      Math.round(channel(a, index) * share + channel(b, index) * (1 - share))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;

const linear = (value: number) => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) =>
  0.2126 * linear(channel(hex, 0)) + 0.7152 * linear(channel(hex, 1)) + 0.0722 * linear(channel(hex, 2));

export const contrast = (a: string, b: string): number => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
};

// A published floor is a lowest ratio as Foundations prints it, to one decimal, so the ratio is
// rounded the same way before comparing. A WCAG floor is compared exactly.
export type Check = {
  readonly what: string;
  readonly ratio: number;
  readonly floor: number;
  readonly exact?: boolean;
};

export const rounded = (ratio: number) => Math.round(ratio * 10) / 10;
export const passes = ({ ratio, floor, exact }: Check) => (exact ? ratio : rounded(ratio)) >= floor;

// Listening screens sit on the cloth darkened to 60% (`--deep`) with the cover's glow at 88%; page
// heads on dialogue and person pages sit on a band of the cloth mixed with 82% paper.
export const clothChecks = (cloth: string): ReadonlyArray<Check> => {
  const deep = mix(cloth, 0.6, "#000000");
  const glow = mix(cloth, 0.88, "#000000");
  const band = mix(cloth, 0.18, PAPER);
  return [
    { what: "cover ink on the glow", ratio: contrast(ON, glow), floor: 5.4 },
    { what: "secondary text", ratio: contrast(mix(ON, 0.72, deep), deep), floor: 5.4 },
    { what: "read-along lines still to come", ratio: contrast(mix(ON, 0.64, deep), deep), floor: 4.6 },
    // Lines already read are large bold text, so 3:1 is the floor that applies.
    { what: "read-along lines already read", ratio: contrast(mix(ON, 0.46, deep), deep), floor: 3.2 },
    { what: "secondary text on the band", ratio: contrast(mix(INK, 0.72, band), band), floor: 5.5 },
    { what: "links on the band", ratio: contrast(ACCENT_TEXT, band), floor: 4.6 },
  ];
};

export const personChecks = (fill: string): ReadonlyArray<Check> => [
  { what: "the bust on the fill", ratio: contrast(ON, fill), floor: 4.8 },
  { what: "the fill as a chart bar on the card", ratio: contrast(fill, CARD), floor: 3, exact: true },
];

// An emblem is a graphic, so WCAG's 3:1 for non-text contrast applies.
export const ideaChecks = ({ plate, ink }: { readonly plate: string; readonly ink: string }): ReadonlyArray<Check> => [
  { what: "the emblem on its plate", ratio: contrast(ink, plate), floor: 3, exact: true },
];

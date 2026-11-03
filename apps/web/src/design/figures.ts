// Figures the kit shows, computed from the corpus when the kit is built or tested. analytics.ts and
// passages.ts call these as Bun macros, so the browser bundle carries the results and no figure is
// typed by hand: Who speaks comes from the harness projection over the turn index and the accepted
// voices, and chapters from the audio scripts.
import { readChapters, readWhoSpeaks } from "@plato-observation-wiki/harness";
import type { Share, WhoSpeaks } from "./analytics";
import type { DialogueKey } from "./covers";
import type { PersonKey } from "./people";

// Interim structure for the dialogues with pages, until the analysis cutover (AN6) commits the
// frames table and person map under derived/plato/structure/: each dialogue's scene level, and who
// each siglum is. These are facts about the text's structure, not figures; the build fails on a
// siglum missing here rather than drawing it unnamed.
type Cast = { readonly scene: number; readonly people: Readonly<Record<string, PersonKey>>; readonly names: Readonly<Record<string, string>> };

const CAST = {
  crito: {
    scene: 1,
    people: { "ΣΩ.": "socrates", "ΝΟΜ.": "laws", "ΚΡ.": "crito" },
    names: { "ΓΥΝ.": "the woman in Socrates’ dream" },
  },
  apology: {
    scene: 1,
    people: { "ΣΩ.": "socrates", "ΜΕΛ.": "meletus" },
    names: {
      "ΜΕΛ.": "Meletus",
      "ΑΘΔΙΚ.": "the jurors Socrates imagines",
      "ΠΑΛΔ.": "the old accusers",
      "ΘΕΤ.": "Thetis",
      "ΑΧΙΛ.": "Achilles",
      "ΚΑΛ.": "Callias",
    },
  },
  euthyphro: { scene: 1, people: { "ΣΩ.": "socrates", "ΕΥΘ.": "euthyphro" }, names: {} },
  phaedo: {
    scene: 2,
    people: { "ΣΩ.": "socrates", "ΚΕΒ.": "cebes", "ΣΙΜ.": "simmias", "ΦΑΙΔ.": "phaedo", "ΕΧ.": "echecrates" },
    names: { "ΚΡ.": "Crito", "ΥΠΗΡ.": "the attendant of the Eleven", "ΘΥΡ.": "the doorkeeper", "ΞΑΝΘ.": "Xanthippe" },
  },
} satisfies Partial<Record<DialogueKey, Cast>>;

type CastDialogue = keyof typeof CAST;

// Shares of 1% or more are drawn with a portrait; everyone else is named in the fine print, so the
// figures still account for every letter. A voice someone performs is drawn as theirs, "as" the
// voice, when both have portraits; a performer quoting their own words keeps one share; a voice
// with no portrait, such as the woman in Socrates' dream, is named instead.
const figuresFor = (dialogue: CastDialogue): WhoSpeaks => {
  const cast: Cast = CAST[dialogue];
  const projected = readWhoSpeaks(dialogue, cast.scene);
  const percent = (letters: number) => (100 * letters) / projected.letters;
  const nameOf = (siglum: string): string => {
    const name = cast.names[siglum];
    if (name === undefined) throw new Error(`${dialogue}: no name for ${siglum} in figures.ts`);
    return name;
  };
  const groups = new Map<string, { person: PersonKey; as?: PersonKey; siglum: string; letters: number; quoted: number }>();
  const under: Array<{ name: string; letters: number }> = [];
  for (const { speaker, performer, letters, quoted } of projected.shares) {
    const self = performer === undefined || performer === speaker;
    const voice = cast.people[speaker];
    const by = self ? voice : cast.people[performer];
    if (voice === undefined || by === undefined) {
      under.push({ name: nameOf(speaker), letters });
      continue;
    }
    const key = `${by}\u0000${self ? "" : voice}`;
    const group = groups.get(key) ?? { person: by, ...(self ? {} : { as: voice }), siglum: speaker, letters: 0, quoted: 0 };
    group.letters += letters;
    group.quoted += quoted;
    groups.set(key, group);
  }
  const drawn = [...groups.values()].filter(({ letters }) => percent(letters) >= 1);
  for (const { siglum, letters } of groups.values()) if (percent(letters) < 1) under.push({ name: nameOf(siglum), letters });
  return {
    shares: drawn
      .sort((a, b) => b.letters - a.letters)
      .map(({ person, as, letters, quoted }): Share => ({
        person,
        ...(as ? { as } : {}),
        percent: percent(letters),
        ...(quoted > 0 ? { quoted: percent(quoted) } : {}),
      })),
    under: under.sort((a, b) => b.letters - a.letters).map(({ name, letters }) => ({ name, percent: percent(letters) })),
    waiting: percent(projected.notYetAttributed),
  };
};

export const whoSpeaksFigures = (): Partial<Record<DialogueKey, WhoSpeaks>> =>
  Object.fromEntries((Object.keys(CAST) as CastDialogue[]).map((dialogue) => [dialogue, figuresFor(dialogue)]));

// Chapters by the recording's division, each from its first source line's marker, named by the
// leading clause of the script's title.
export const chapterFigures = (): Partial<Record<DialogueKey, ReadonlyArray<{ readonly title: string; readonly from: string }>>> =>
  Object.fromEntries(
    (Object.keys(CAST) as CastDialogue[]).map((dialogue) => [dialogue, readChapters(dialogue).map(({ shortTitle, from }) => ({ title: shortTitle, from }))]),
  );

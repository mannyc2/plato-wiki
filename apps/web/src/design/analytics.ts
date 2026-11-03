// Figures the app works out from the corpus. A curated page names one with an `::analytic` block
// and never restates its numbers, so a page cannot go stale when the corpus changes. Sample values
// from the voice records, counted by Greek letters under the analysis plan's rules (DEC-19).
import type { DialogueKey } from "./covers";
import type { PersonKey } from "./people";

// A named voice someone performs keeps its own share and names its performer, as the Laws do in the
// Crito. Under DEC-19 an unnamed voice counts for the innermost known speaker above it, as quoted by
// them: `quoted` is that part of `percent`, such as the objector Socrates voices at 48a.
export type Share = { readonly person: PersonKey; readonly as?: PersonKey; readonly percent: number; readonly quoted?: number };

// Shares of 1% or more are drawn, each with its portrait. Everyone with less, performed voices and
// people the kit draws no portrait for among them, is named in the fine print instead, so the figures
// still account for every letter: shares, `under` and `waiting` sum to 100.
export type WhoSpeaks = {
  readonly shares: ReadonlyArray<Share>;
  readonly under: ReadonlyArray<{ readonly name: string; readonly percent: number }>;
  readonly waiting: number;
};

export const WHO_SPEAKS: Partial<Record<DialogueKey, WhoSpeaks>> = {
  crito: {
    shares: [
      { person: "socrates", percent: 40.62, quoted: 0.27 },
      { person: "socrates", as: "laws", percent: 37.21 },
      { person: "crito", percent: 21.96 },
    ],
    under: [{ name: "the woman in Socrates’ dream", percent: 0.21 }],
    waiting: 0,
  },
  // One unlabelled turn, Socrates' to the jury. Meletus' answers under cross-examination are his
  // own words in the scene, not a voice Socrates performs.
  apology: {
    shares: [{ person: "socrates", percent: 98.15, quoted: 0.86 }],
    under: [
      { name: "Meletus", percent: 0.67 },
      { name: "the jurors Socrates imagines", percent: 0.33 },
      { name: "the old accusers", percent: 0.26 },
      { name: "Thetis", percent: 0.26 },
      { name: "Achilles", percent: 0.23 },
      { name: "Callias", percent: 0.1 },
    ],
    waiting: 0,
  },
  euthyphro: {
    shares: [
      { person: "socrates", percent: 74.5 },
      { person: "euthyphro", percent: 25.5 },
    ],
    under: [],
    waiting: 0,
  },
  // Narrated by Phaedo, with the scene at the second level. Three bare replies under the narrator
  // wait for a speaker: two that the Greek leaves to Cebes or Simmias, and a bystander Phaedo cannot
  // name.
  phaedo: {
    shares: [
      { person: "socrates", percent: 75.37 },
      { person: "cebes", percent: 8.25 },
      { person: "simmias", percent: 6.69 },
      { person: "phaedo", percent: 6.29 },
      { person: "echecrates", percent: 1.68 },
    ],
    under: [
      { name: "Crito", percent: 0.73 },
      { name: "the attendant of the Eleven", percent: 0.58 },
      { name: "the doorkeeper", percent: 0.07 },
      { name: "Xanthippe", percent: 0.05 },
    ],
    waiting: 0.29,
  },
};

export type AnalyticName = "who-speaks";
export const ANALYTIC_NAMES: ReadonlyArray<AnalyticName> = ["who-speaks"];

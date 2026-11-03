// Figures the app works out from the corpus. A curated page names one with an `::analytic` block
// and never restates its numbers, so a page cannot go stale when the corpus changes. The figures are
// computed when the kit is built (figures.ts), counted by Greek letters under the analysis plan's
// rules (DEC-19).
import type { DialogueKey } from "./covers";
import { whoSpeaksFigures } from "./figures" with { type: "macro" };
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

export const WHO_SPEAKS: Partial<Record<DialogueKey, WhoSpeaks>> = whoSpeaksFigures();

export type AnalyticName = "who-speaks";
export const ANALYTIC_NAMES: ReadonlyArray<AnalyticName> = ["who-speaks"];

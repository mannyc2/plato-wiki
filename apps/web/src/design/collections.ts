// Reading lists that group dialogues, as the sidebar, the Library and a page's arc show them.
// Sample values until collections are curated.
import type { DialogueKey } from "./covers";

// A collection that tells one story gives each dialogue its moment in it, as a page's arc shows.
export type Collection = {
  readonly title: string;
  readonly dialogues: ReadonlyArray<DialogueKey>;
  readonly moments?: Partial<Record<DialogueKey, string>>;
};

export const COLLECTIONS = {
  "trial-and-death": {
    title: "The trial and death of Socrates",
    dialogues: ["euthyphro", "apology", "crito", "phaedo"],
    moments: { euthyphro: "At the court, before the trial", apology: "The trial", crito: "In prison, before dawn", phaedo: "His last day" },
  },
  love: { title: "Love and friendship", dialogues: ["lysis", "symposium", "phaedrus"] },
  virtue: { title: "What is virtue?", dialogues: ["laches", "charmides", "protagoras", "meno"] },
} satisfies Record<string, Collection>;

export type CollectionKey = keyof typeof COLLECTIONS;
export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as ReadonlyArray<CollectionKey>;

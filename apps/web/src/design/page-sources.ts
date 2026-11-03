// Curated pages as files under pages/<dialogue>/, with the receipt that records the user's read:
// `reviewed: <date> <hash>`, where the hash covers the page without that line, so any later edit
// drops the receipt. Bun only, and free of the kit's other modules, so a review sketch can call
// `curatedPages` as a macro and bundle the pages it shows with whether each has been read.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const PAGES_DIR = join(import.meta.dir, "pages");

export type PageFile = { readonly path: string; readonly source: string };

export const RECEIPT = /^reviewed: .*\n/mu;

export const pageHash = (source: string): string => createHash("sha256").update(source.replace(RECEIPT, "")).digest("hex");

export const readPages = (): ReadonlyArray<PageFile> =>
  readdirSync(PAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(PAGES_DIR, dir.name))
        .filter((name) => name.endsWith(".md"))
        .toSorted()
        .map((name) => ({ path: `${dir.name}/${name}`, source: readFileSync(join(PAGES_DIR, dir.name, name), "utf8") })),
    );

// The date of the user's read, when the receipt still matches the page.
export const readOn = (source: string): string | undefined => {
  const receipt = /^reviewed: (\S+) (\S+)$/mu.exec(source);
  return receipt && receipt[2] === pageHash(source) ? receipt[1] : undefined;
};

// Every page about a dialogue, leaving out samples/, with the date of the user's read where it holds.
export const curatedPages = (): ReadonlyArray<PageFile & { readonly read?: string }> =>
  readPages()
    .filter(({ path }) => !path.startsWith("samples/"))
    .map((page) => {
      const read = readOn(page.source);
      return read === undefined ? page : { ...page, read };
    });

// The receipt for the text the user read, put in the front matter in place of any older one.
export const stamp = (source: string, date: string): string => {
  const unstamped = source.replace(RECEIPT, "");
  const close = unstamped.indexOf("\n---\n", 4);
  if (!unstamped.startsWith("---\n") || close < 0) throw new Error("a page needs front matter to carry a receipt");
  return `${unstamped.slice(0, close + 1)}reviewed: ${date} ${pageHash(unstamped)}\n${unstamped.slice(close + 1)}`;
};

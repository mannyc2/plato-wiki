import { describe, expect, test } from "bun:test";
import { checkPages } from "./page-check";
import { readPages, stamp } from "./page-sources";

const note = (ref: string, quote: string): string =>
  ["---", `about: line crito ${ref}`, "---", "", "It is early.[^a]", "", `[^a]: crito ${ref} "${quote}"`, ""].join("\n");

describe("curated pages", () => {
  test("every page passes the checker, is named for what it is about, and keeps its receipt", () => {
    expect(checkPages(readPages())).toEqual([]);
  });

  test("a receipt holds only for the text the user read", () => {
    const read = stamp(note("43a", "Just before dawn."), "2026-10-27");
    expect(checkPages([{ path: "crito/43a.md", source: read }])).toEqual([]);
    expect(checkPages([{ path: "crito/43a.md", source: read.replace("It is early.", "It is late.") }])).toEqual([
      "crito/43a.md:3: the page has changed since the user read it on 2026-10-27",
    ]);
  });

  test("line notes in a dialogue do not overlap, and each is named for its reference", () => {
    expect(
      checkPages([
        { path: "crito/43b-c.md", source: note("43b-c", "sleepless and sorrowful") },
        { path: "crito/43c.md", source: note("43c", "sad news") },
        { path: "crito/43d.md", source: note("43c", "sad news") },
      ]),
    ).toEqual(["crito/43c.md:1: overlaps crito/43b-c.md", "crito/43d.md:2: a note in crito/43d.md is about `line crito 43d`"]);
  });
});

import { describe, expect, test } from "bun:test";
import { rendered } from "./rendering";

describe("the rendering at a reference", () => {
  test("shows the words without the rendering's markup", () => {
    const { text } = rendered("crito 43c");
    expect(text).toEndWith("Has the ship come from Delos,");
    expect(text).not.toContain("{");
  });

  test("runs a range across pages from its first marker to the end of its last", () => {
    const { text } = rendered("crito 47e-48a");
    expect(text).toStartWith(rendered("crito 47e").text);
    expect(text).toEndWith(rendered("crito 48a").text);
  });

  test("knows whose turn each line is, even where a reference starts partway through a turn", () => {
    expect(rendered("crito 43b").lines.findLast(([at]) => at === 0)).toEqual([0, "Socrates"]);
    expect(rendered("crito 51a").lines).toEqual([[0, "Socrates"]]);
  });

  test("marks quoted speech, even where a reference starts inside it", () => {
    const dream = rendered("crito 44b");
    expect(dream.quoted.map(([from, to]) => dream.text.slice(from, to))).toEqual([
      "Socrates, on the third day thou wouldst come to fertile Phthia.",
    ]);
    const laws = rendered("crito 51a");
    expect(laws.quoted).toEqual([[0, laws.text.length]]);
  });

  test("refuses a reference the rendering does not mark", () => {
    expect(() => rendered("crito 99a")).toThrow("crito 99a is not in the crito rendering");
  });
});

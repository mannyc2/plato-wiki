import { describe, expect, test } from "bun:test";
import { noteNumbers, parsePage } from "./blocks";
import answer from "./pages/samples/answer-crito-54d.md" with { type: "text" };
import explain from "./pages/crito/43b-c.md" with { type: "text" };
import socrates from "./pages/crito/socrates.md" with { type: "text" };

describe("page sources", () => {
  for (const [name, source] of [
    ["Socrates in the Crito", socrates],
    ["the Explain note on Crito 43b–c", explain],
    ["the answer on Crito 54d", answer],
  ] as const) {
    test(`${name} passes every check`, () => {
      expect(parsePage(source).problems).toEqual([]);
    });
  }

  test("citations are numbered in reading order, once each", () => {
    const { page } = parsePage(explain);
    expect([...noteNumbers(page)]).toEqual([
      ["sleepless", 1],
      ["calm", 2],
      ["true", 3],
      ["news", 4],
      ["age", 5],
      ["others", 6],
    ]);
  });
});

describe("the checker", () => {
  const problems = (source: string) => parsePage(source).problems;

  test("holds a quotation to the passage it cites", () => {
    expect(problems('Living well matters most.[^well]\n\n[^well]: crito 48b "not life but the good life"')).toEqual([
      "3: the quotation is not in Crito 48b",
    ]);
  });

  test("refuses a reference the corpus does not hold", () => {
    expect(problems('::passage{ref="crito 99z"}')).toEqual(["1: no passage is held for crito 99z"]);
  });

  test("checks that a passage's anchors run in order", () => {
    expect(problems('::passage{ref="crito 48b" from="most important" to="it is not living"}')).toEqual([
      "1: the from and to words are not in Crito 48b, in that order",
    ]);
  });

  test("names unknown blocks, people, ideas and collections", () => {
    expect(
      problems(
        [
          "::chart{of=pace}",
          ":::people",
          "- xanthippe: His wife.",
          ":::",
          ":::moves",
          "1. A move. {idea=irony}",
          ":::",
          "::arc{collection=late at=crito}",
        ].join("\n"),
      ),
    ).toEqual([
      "1: no block is called chart",
      "3: no person is called xanthippe",
      "6: no idea is called irony",
      "8: no collection is called late",
    ]);
  });

  test("reports a source that nothing cites", () => {
    expect(problems('Text.\n\n[^spare]: crito 54e "since it is in this way that God leads us"')).toEqual([
      "3: [^spare] is never cited",
    ]);
  });

  test("holds the words cited in Two views to the speaker named", () => {
    expect(
      problems(
        [
          ":::views",
          "- socrates: Age frees no one from grief.[^others]",
          "- crito: It would be absurd to mind.[^age]",
          ":::",
          "",
          '[^others]: crito 43c "their age does not in the least prevent them from being disturbed by their fate"',
          '[^age]: crito 43b-c "it would be absurd if at my age I were disturbed because I must die now"',
        ].join("\n"),
      ),
    ).toEqual(["2: the words cited for Socrates are Crito’s", "3: the words cited for Crito are Socrates’"]);
  });

  test("refuses quoted speech in Two views, and a view with nothing cited", () => {
    expect(
      problems(
        [
          ":::views",
          "- socrates: The dream names the day.[^dream]",
          "- crito: The dream is strange.",
          ":::",
          "",
          '[^dream]: crito 44b "on the third day thou wouldst come to fertile Phthia"',
        ].join("\n"),
      ),
    ).toEqual(["2: the words cited for Socrates are quoted speech inside a turn", "3: a view needs a citation of Crito’s words"]);
  });

  test("checks what a page says it is about", () => {
    expect(problems(["---", "about: person xanthippe", "by: an agent", "reviewed: 2026-10-27", "---"].join("\n"))).toEqual([
      "1: a person page names its dialogue with `in`",
      "2: no person is called xanthippe",
      "3: no frontmatter key is called by",
      "4: reviewed is a date and the page’s hash",
    ]);
  });

  test("reports a citation with no source line, in line order", () => {
    expect(problems('Asleep.[^dawn]\n\n::passage{ref="crito 43b" lit="sleeps sweetly"}')).toEqual([
      "1: [^dawn] has no source",
      "3: the lit words are not in the passage shown",
    ]);
  });
});

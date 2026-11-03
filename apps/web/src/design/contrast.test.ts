import { describe, expect, test } from "bun:test";
import { clothChecks, contrast, ideaChecks, mix, passes, personChecks, rounded } from "./contrast";
import { DIALOGUE_KEYS, DIALOGUES } from "./covers";
import { HUES } from "./ideas";
import { OTHERS, PEOPLE, PERSON_KEYS } from "./people";

describe("contrast", () => {
  test("matches the WCAG extremes", () => {
    expect(contrast("#000000", "#FFFFFF")).toBe(21);
    expect(contrast("#777777", "#777777")).toBe(1);
  });

  test("mixes channel by channel, as color-mix does in srgb", () => {
    expect(mix("#2F5D50", 0.6, "#000000")).toBe("#1C3830");
    expect(mix("#FFFFFF", 0.5, "#000000")).toBe("#808080");
  });
});

describe("cloth colours", () => {
  test("every dialogue has a cloth", () => {
    expect(DIALOGUE_KEYS).toHaveLength(27);
  });

  for (const key of DIALOGUE_KEYS) {
    test(`${key} keeps every listening and band ratio at or above its floor`, () => {
      const failing = clothChecks(DIALOGUES[key].cloth).filter((check) => !passes(check));
      expect(failing.map(({ what, ratio }) => `${what} at ${ratio.toFixed(2)}:1`)).toEqual([]);
    });
  }

  // Foundations states these as the lowest ratios across all cloths, so they must be exact.
  test("the lowest ratios across all cloths are the ones Foundations publishes", () => {
    const checks = DIALOGUE_KEYS.map((key) => clothChecks(DIALOGUES[key].cloth));
    const lowest = (checks[0] ?? []).map((first, index) => ({
      what: first.what,
      lowest: rounded(Math.min(...checks.map((all) => all[index]?.ratio ?? Number.POSITIVE_INFINITY))),
    }));
    expect(lowest).toEqual([
      { what: "cover ink on the glow", lowest: 5.4 },
      { what: "secondary text", lowest: 5.4 },
      { what: "read-along lines still to come", lowest: 4.6 },
      { what: "read-along lines already read", lowest: 3.2 },
      { what: "secondary text on the band", lowest: 5.5 },
      { what: "links on the band", lowest: 4.6 },
    ]);
  });
});

describe("people", () => {
  for (const key of PERSON_KEYS) {
    test(`${key} keeps the bust legible and reads as a chart fill`, () => {
      const failing = personChecks(PEOPLE[key].fill).filter((check) => !passes(check));
      expect(failing.map(({ what, ratio }) => `${what} at ${ratio.toFixed(2)}:1`)).toEqual([]);
    });
  }

  test("the lowest bust ratio is the one Foundations publishes", () => {
    const lowest = Math.min(...PERSON_KEYS.map((key) => personChecks(PEOPLE[key].fill)[0]?.ratio ?? 0));
    expect(rounded(lowest)).toBe(4.8);
  });

  test("the count that stands for several speakers is legible", () => {
    expect(contrast("#FFFFFF", OTHERS)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("idea plates", () => {
  for (const [hue, colours] of Object.entries(HUES)) {
    test(`${hue} ink reads on its plate`, () => {
      const failing = ideaChecks(colours).filter((check) => !passes(check));
      expect(failing.map(({ what, ratio }) => `${what} at ${ratio.toFixed(2)}:1`)).toEqual([]);
    });
  }
});

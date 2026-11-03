import { describe, expect, test } from "bun:test";
import { WHO_SPEAKS } from "./analytics";
import { chapterFigures, whoSpeaksFigures } from "./figures";
import { CHAPTERS } from "./passages";

describe("Who speaks", () => {
  for (const [dialogue, figures] of Object.entries(WHO_SPEAKS)) {
    test(`${dialogue} accounts for every letter, and draws only shares of 1% or more`, () => {
      const total = [...figures.shares, ...figures.under].reduce((sum, { percent }) => sum + percent, figures.waiting);
      expect(total).toBeCloseTo(100, 6);
      expect(figures.shares.every(({ percent }) => percent >= 1)).toBe(true);
      expect(figures.under.every(({ percent }) => percent < 1)).toBe(true);
    });
  }

  // Shares carry unrounded fractions of the letter counts, which no typed figure reproduces.
  test("comes from the corpus, as chapters do, not from figures typed into the kit", () => {
    expect(WHO_SPEAKS).toEqual(whoSpeaksFigures());
    expect(CHAPTERS).toEqual(chapterFigures());
  });
});

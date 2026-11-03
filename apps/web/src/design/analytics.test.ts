import { describe, expect, test } from "bun:test";
import { WHO_SPEAKS } from "./analytics";

describe("Who speaks", () => {
  for (const [dialogue, figures] of Object.entries(WHO_SPEAKS)) {
    test(`${dialogue} accounts for every letter, and draws only shares of 1% or more`, () => {
      const total = [...figures.shares, ...figures.under].reduce((sum, { percent }) => sum + percent, figures.waiting);
      expect(total).toBeCloseTo(100, 6);
      expect(figures.shares.every(({ percent }) => percent >= 1)).toBe(true);
      expect(figures.under.every(({ percent }) => percent < 1)).toBe(true);
    });
  }
});

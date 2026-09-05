import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { planSegmentedReview, reviewTargetIdsComplete } from "./review-segments.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function record(id: string, status = "unreviewed") {
  return `\`\`\`yaml
observation_id: ${id}
stephanus_span: 70a
review_status: ${status}
\`\`\``;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "segmented-review-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("segmented review planning", () => {
  it("batches only unreviewed observations", () => {
    writeFileSync(
      join(root, "wiki/observations/meno.md"),
      [record("obs_meno_0001", "accepted"), record("obs_meno_0002"), record("obs_meno_0003")].join("\n\n"),
      "utf8",
    );

    const batches = planSegmentedReview("meno", 1);

    expect(batches.map((batch) => batch.observationIds)).toEqual([["obs_meno_0002"], ["obs_meno_0003"]]);
    expect(batches[0]?.summary).toContain("obs_meno_0002: span=70a");
  });

  it("checks only requested target ids for completion", () => {
    writeFileSync(
      join(root, "wiki/observations/meno.md"),
      [record("obs_meno_0001", "accepted"), record("obs_meno_0002")].join("\n\n"),
      "utf8",
    );

    expect(reviewTargetIdsComplete("meno", ["obs_meno_0001"])).toBe(true);
    expect(reviewTargetIdsComplete("meno", ["obs_meno_0002"])).toBe(false);
    expect(reviewTargetIdsComplete("meno", ["obs_meno_9999"])).toBe(false);
  });
});

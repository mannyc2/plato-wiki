import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { planSegmentedReviewQueue, runSegmentedReviewQueue } from "./review-queue.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "review-queue-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/observations/ion.md"),
    Array.from({ length: 5 }, (_, index) => {
      const id = String(index + 1).padStart(4, "0");
      return `\`\`\`yaml
observation_id: obs_ion_${id}
stephanus_span: 2a
review_status: ${index === 0 ? "accepted" : "unreviewed"}
\`\`\``;
    }).join("\n\n"),
    "utf8",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("segmented review queue", () => {
  it("plans a bounded queue from unreviewed observations", () => {
    const batches = planSegmentedReviewQueue("ion", { targetObservations: 2, limit: 2 });

    expect(batches.map((batch) => batch.observationIds)).toEqual([
      ["obs_ion_0002", "obs_ion_0003"],
      ["obs_ion_0004", "obs_ion_0005"],
    ]);
  });

  it("dry-runs without invoking model-backed review", async () => {
    const events: string[] = [];
    const result = await runSegmentedReviewQueue("ion", {
      dryRun: true,
      targetObservations: 2,
      limit: 1,
      onEvent: (event) => events.push(event.type),
    });

    expect(result.dryRun).toBe(true);
    expect(result.plannedBatches.map((batch) => batch.observationIds)).toEqual([
      ["obs_ion_0002", "obs_ion_0003"],
    ]);
    expect(result.completedBatches).toEqual([]);
    expect(events).toEqual(["queue_start"]);
  });
});

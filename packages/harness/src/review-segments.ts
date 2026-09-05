import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { fieldValueOrEmpty, observationYamlBlocks } from "./wiki/observation-ledger.js";

export type ReviewObservationTarget = {
  observationId: string;
  stephanusSpan: string;
  reviewStatus: string;
};

export type SegmentedReviewBatch = {
  dialogue: string;
  index: number;
  observationIds: string[];
  summary: string;
};

export function reviewObservationTargets(dialogue: string): ReviewObservationTarget[] {
  const ledgerPath = join(getRepoRoot(), "wiki/observations", `${dialogue}.md`);
  if (!existsSync(ledgerPath)) return [];

  const content = readFileSync(ledgerPath, "utf8");
  const targets: ReviewObservationTarget[] = [];
  for (const block of observationYamlBlocks(content)) {
    const observationId = fieldValueOrEmpty(block, "observation_id");
    if (!observationId) continue;

    targets.push({
      observationId,
      stephanusSpan: fieldValueOrEmpty(block, "stephanus_span"),
      reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
    });
  }

  return targets;
}

export function reviewTargetIdsComplete(dialogue: string, observationIds: string[]) {
  const byId = new Map(reviewObservationTargets(dialogue).map((target) => [target.observationId, target]));
  return observationIds.every((observationId) => {
    const target = byId.get(observationId);
    return target !== undefined && target.reviewStatus !== "unreviewed";
  });
}

export function planSegmentedReview(dialogue: string, targetObservations = 8): SegmentedReviewBatch[] {
  if (!Number.isInteger(targetObservations) || targetObservations <= 0) {
    throw new Error("targetObservations must be a positive integer");
  }

  const pending = reviewObservationTargets(dialogue).filter((target) => target.reviewStatus === "unreviewed");
  const batches: SegmentedReviewBatch[] = [];

  for (let start = 0; start < pending.length; start += targetObservations) {
    const targets = pending.slice(start, start + targetObservations);
    batches.push({
      dialogue,
      index: batches.length + 1,
      observationIds: targets.map((target) => target.observationId),
      summary: targets
        .map((target) => `${target.observationId}: span=${target.stephanusSpan}; status=${target.reviewStatus}`)
        .join("\n"),
    });
  }

  return batches;
}

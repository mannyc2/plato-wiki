import { spawn } from "node:child_process";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { planSegmentedReview, reviewTargetIdsComplete, type SegmentedReviewBatch } from "./review-segments.js";
import type { ValidationReport } from "./types.js";
import { validateRepo } from "./validate.js";

export const DEFAULT_REVIEW_QUEUE_TARGET_OBSERVATIONS = 20;
export const DEFAULT_REVIEW_QUEUE_LIMIT = 4;
export const DEFAULT_REVIEW_QUEUE_RETRIES = 2;
export const DEFAULT_REVIEW_QUEUE_TIMEOUT_SECONDS = 240;

export type SegmentedReviewQueueEvent =
  | {
      type: "queue_start";
      dialogue: string;
      plannedBatchCount: number;
      targetObservations: number;
      limit: number;
      retries: number;
      timeoutSeconds: number;
    }
  | {
      type: "batch_attempt";
      batch: SegmentedReviewBatch;
      attempt: number;
      maxAttempts: number;
    }
  | {
      type: "batch_success";
      batch: SegmentedReviewBatch;
      attempt: number;
      transcriptDir: string;
      validation?: ValidationReport | undefined;
    }
  | {
      type: "batch_failure";
      batch: SegmentedReviewBatch;
      attempt: number;
      error: string;
    }
  | {
      type: "queue_validation";
      validation: ValidationReport;
    };

export type SegmentedReviewQueueOptions = {
  dryRun?: boolean;
  profileName?: string | undefined;
  provider?: string | undefined;
  model?: string | undefined;
  targetObservations?: number | undefined;
  limit?: number | undefined;
  retries?: number | undefined;
  timeoutSeconds?: number | undefined;
  validateEach?: boolean | undefined;
  validateFinal?: boolean | undefined;
  onEvent?: ((event: SegmentedReviewQueueEvent) => void) | undefined;
};

export type SegmentedReviewQueueBatchResult = {
  observationIds: string[];
  attemptCount: number;
  status: "completed" | "failed";
  transcriptDir?: string | undefined;
  error?: string | undefined;
};

export type SegmentedReviewQueueResult = {
  dialogue: string;
  dryRun: boolean;
  targetObservations: number;
  limit: number;
  retries: number;
  plannedBatches: SegmentedReviewBatch[];
  completedBatches: SegmentedReviewQueueBatchResult[];
  failedBatch?: SegmentedReviewQueueBatchResult | undefined;
  validation?: ValidationReport | undefined;
};

function positiveInteger(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return resolved;
}

export function planSegmentedReviewQueue(dialogue: string, options: SegmentedReviewQueueOptions = {}) {
  const targetObservations = positiveInteger(
    options.targetObservations,
    DEFAULT_REVIEW_QUEUE_TARGET_OBSERVATIONS,
    "--target-observations",
  );
  const limit = positiveInteger(options.limit, DEFAULT_REVIEW_QUEUE_LIMIT, "--limit");

  return planSegmentedReview(dialogue, targetObservations).slice(0, limit);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function tailOutput(value: string, maxLength = 2_000) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;

  return trimmed.slice(trimmed.length - maxLength);
}

function transcriptDirFromOutput(output: string) {
  const match = /^Transcript:\s*(.+)\s*$/mu.exec(output);
  if (!match?.[1]) return "(child process)";

  return join(getRepoRoot(), match[1].trim());
}

async function runReviewBatchProcess(
  dialogue: string,
  options: SegmentedReviewQueueOptions,
  targetObservations: number,
  timeoutSeconds: number,
  batch: SegmentedReviewBatch,
) {
  const repoRoot = getRepoRoot();
  const args = [
    "packages/cli/src/cli.ts",
    "review-segmented",
    dialogue,
    "--target-observations",
    String(targetObservations),
    "--limit",
    "1",
    ...(options.profileName ? ["--profile", options.profileName] : []),
    ...(options.provider ? ["--provider", options.provider] : []),
    ...(options.model ? ["--model", options.model] : []),
  ];

  return await new Promise<{ transcriptDir: string }>((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
    }, timeoutSeconds * 1_000);

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timeout);
      if (timedOut) {
        reject(new Error(`Review batch ${batch.index} timed out after ${timeoutSeconds}s`));
        return;
      }

      if (code !== 0) {
        const output = tailOutput(stderr || stdout || `process exited with code ${code ?? "unknown"} signal ${signal ?? "none"}`);
        reject(new Error(output));
        return;
      }

      resolve({ transcriptDir: transcriptDirFromOutput(stdout) });
    });
  });
}

export async function runSegmentedReviewQueue(
  dialogue: string,
  options: SegmentedReviewQueueOptions = {},
): Promise<SegmentedReviewQueueResult> {
  const dryRun = options.dryRun ?? false;
  const targetObservations = positiveInteger(
    options.targetObservations,
    DEFAULT_REVIEW_QUEUE_TARGET_OBSERVATIONS,
    "--target-observations",
  );
  const limit = positiveInteger(options.limit, DEFAULT_REVIEW_QUEUE_LIMIT, "--limit");
  const retries = positiveInteger(options.retries, DEFAULT_REVIEW_QUEUE_RETRIES, "--retries");
  const timeoutSeconds = positiveInteger(
    options.timeoutSeconds,
    DEFAULT_REVIEW_QUEUE_TIMEOUT_SECONDS,
    "--timeout-seconds",
  );
  const maxAttempts = retries + 1;
  const plannedBatches = planSegmentedReviewQueue(dialogue, { ...options, targetObservations, limit });
  options.onEvent?.({
    type: "queue_start",
    dialogue,
    plannedBatchCount: plannedBatches.length,
    targetObservations,
    limit,
    retries,
    timeoutSeconds,
  });

  const completedBatches: SegmentedReviewQueueBatchResult[] = [];

  if (dryRun) {
    return {
      dialogue,
      dryRun,
      targetObservations,
      limit,
      retries,
      plannedBatches,
      completedBatches,
    };
  }

  for (let queueIndex = 0; queueIndex < plannedBatches.length; queueIndex += 1) {
    let currentBatch = planSegmentedReview(dialogue, targetObservations)[0];
    if (!currentBatch) break;

    let lastError = "";
    let transcriptDir = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      currentBatch = planSegmentedReview(dialogue, targetObservations)[0] ?? currentBatch;
      options.onEvent?.({ type: "batch_attempt", batch: currentBatch, attempt, maxAttempts });
      try {
        const result = await runReviewBatchProcess(dialogue, options, targetObservations, timeoutSeconds, currentBatch);
        transcriptDir = result.transcriptDir;
        if (!reviewTargetIdsComplete(dialogue, currentBatch.observationIds)) {
          throw new Error(`Review batch did not complete target observations: ${currentBatch.observationIds.join(", ")}`);
        }
        const validation = options.validateEach ? validateRepo() : undefined;
        completedBatches.push({
          observationIds: currentBatch.observationIds,
          attemptCount: attempt,
          status: "completed",
          transcriptDir,
        });
        options.onEvent?.({ type: "batch_success", batch: currentBatch, attempt, transcriptDir, validation });
        lastError = "";
        break;
      } catch (error) {
        lastError = errorMessage(error);
        options.onEvent?.({ type: "batch_failure", batch: currentBatch, attempt, error: lastError });
      }
    }

    if (lastError) {
      const failedBatch: SegmentedReviewQueueBatchResult = {
        observationIds: currentBatch.observationIds,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };

      return {
        dialogue,
        dryRun,
        targetObservations,
        limit,
        retries,
        plannedBatches,
        completedBatches,
        failedBatch,
      };
    }
  }

  const validation = options.validateFinal === false || plannedBatches.length === 0 ? undefined : validateRepo();
  if (validation) options.onEvent?.({ type: "queue_validation", validation });

  return {
    dialogue,
    dryRun,
    targetObservations,
    limit,
    retries,
    plannedBatches,
    completedBatches,
    validation,
  };
}

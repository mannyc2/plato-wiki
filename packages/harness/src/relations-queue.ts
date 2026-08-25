import { spawn } from "node:child_process";
import { join } from "node:path";
import {
  planSegmentedRelationReview,
  planSegmentedRelations,
  relationCandidateKeysComplete,
  relationReviewTargetIdsComplete,
  type SegmentedRelationBatch,
  type SegmentedRelationReviewBatch,
} from "./relations.js";
import { getRepoRoot } from "./paths.js";
import type { ValidationReport } from "./types.js";
import { validateRepo } from "./validate.js";

export const DEFAULT_RELATION_QUEUE_TARGET_PAIRS = 20;
export const DEFAULT_RELATION_QUEUE_TARGET_RELATIONS = 20;
export const DEFAULT_RELATION_QUEUE_LIMIT = 4;
export const DEFAULT_RELATION_QUEUE_RETRIES = 2;
export const DEFAULT_RELATION_QUEUE_TIMEOUT_SECONDS = 240;

export type RelationQueueEvent =
  | {
      type: "queue_start";
      scope: string;
      plannedBatchCount: number;
      targetPairs: number;
      limit: number;
      retries: number;
      timeoutSeconds: number;
    }
  | {
      type: "batch_attempt";
      batch: SegmentedRelationBatch;
      attempt: number;
      maxAttempts: number;
    }
  | {
      type: "batch_success";
      batch: SegmentedRelationBatch;
      attempt: number;
      transcriptDir: string;
      validation?: ValidationReport | undefined;
    }
  | {
      type: "batch_failure";
      batch: SegmentedRelationBatch;
      attempt: number;
      error: string;
    }
  | {
      type: "queue_validation";
      validation: ValidationReport;
    };

export type RelationReviewQueueEvent =
  | {
      type: "queue_start";
      scope: string;
      plannedBatchCount: number;
      targetRelations: number;
      limit: number;
      retries: number;
      timeoutSeconds: number;
    }
  | {
      type: "batch_attempt";
      batch: SegmentedRelationReviewBatch;
      attempt: number;
      maxAttempts: number;
    }
  | {
      type: "batch_success";
      batch: SegmentedRelationReviewBatch;
      attempt: number;
      transcriptDir: string;
      validation?: ValidationReport | undefined;
    }
  | {
      type: "batch_failure";
      batch: SegmentedRelationReviewBatch;
      attempt: number;
      error: string;
    }
  | {
      type: "queue_validation";
      validation: ValidationReport;
    };

export type RelationQueueOptions = {
  dryRun?: boolean;
  profileName?: string | undefined;
  provider?: string | undefined;
  model?: string | undefined;
  targetPairs?: number | undefined;
  candidateKeys?: string[] | undefined;
  limit?: number | undefined;
  workers?: number | undefined;
  retries?: number | undefined;
  timeoutSeconds?: number | undefined;
  validateEach?: boolean | undefined;
  validateEvery?: number | undefined;
  validateFinal?: boolean | undefined;
  onEvent?: ((event: RelationQueueEvent) => void) | undefined;
};

export type RelationReviewQueueOptions = {
  dryRun?: boolean;
  profileName?: string | undefined;
  provider?: string | undefined;
  model?: string | undefined;
  targetRelations?: number | undefined;
  relationIds?: string[] | undefined;
  limit?: number | undefined;
  workers?: number | undefined;
  retries?: number | undefined;
  timeoutSeconds?: number | undefined;
  validateEach?: boolean | undefined;
  validateEvery?: number | undefined;
  validateFinal?: boolean | undefined;
  onEvent?: ((event: RelationReviewQueueEvent) => void) | undefined;
};

export type RelationQueueBatchResult = {
  candidateKeys: string[];
  attemptCount: number;
  status: "completed" | "failed";
  transcriptDir?: string | undefined;
  error?: string | undefined;
};

export type RelationReviewQueueBatchResult = {
  relationIds: string[];
  attemptCount: number;
  status: "completed" | "failed";
  transcriptDir?: string | undefined;
  error?: string | undefined;
};

export type RelationQueueResult = {
  scope: string;
  dryRun: boolean;
  targetPairs: number;
  limit: number;
  retries: number;
  plannedBatches: SegmentedRelationBatch[];
  completedBatches: RelationQueueBatchResult[];
  failedBatch?: RelationQueueBatchResult | undefined;
  validation?: ValidationReport | undefined;
};

export type RelationBatchRunner = (
  scope: string,
  options: RelationQueueOptions,
  targetPairs: number,
  timeoutSeconds: number,
  batch: SegmentedRelationBatch,
  pinned: boolean,
) => Promise<{ transcriptDir: string }>;

export type RelationReviewQueueResult = {
  scope: string;
  dryRun: boolean;
  targetRelations: number;
  limit: number;
  retries: number;
  plannedBatches: SegmentedRelationReviewBatch[];
  completedBatches: RelationReviewQueueBatchResult[];
  failedBatch?: RelationReviewQueueBatchResult | undefined;
  validation?: ValidationReport | undefined;
};

function positiveInteger(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return resolved;
}

function rejectLegacyPairIds(options: object) {
  if (Object.prototype.hasOwnProperty.call(options, "pairIds")) {
    throw new Error("Relation pairIds was removed; use candidateKeys.");
  }
}

export function shouldValidateBatch(
  completedCount: number,
  validateEach: boolean | undefined,
  validateEvery: number | undefined,
) {
  if (validateEach) return true;
  if (validateEvery === undefined) return false;

  return completedCount % validateEvery === 0;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runWorkerPool<T>(
  items: readonly T[],
  workerCount: number,
  runItem: (item: T, index: number, workerIndex: number) => Promise<boolean | void>,
  options: { staggerMs?: number | undefined } = {},
) {
  const workers = positiveInteger(workerCount, 1, "--workers");
  if (items.length === 0) return;

  const activeWorkers = Math.min(workers, items.length);
  let nextIndex = 0;
  let stopped = false;

  await Promise.all(
    Array.from({ length: activeWorkers }, async (_, workerIndex) => {
      if (options.staggerMs && workerIndex > 0) {
        await delay(options.staggerMs * workerIndex);
      }

      while (!stopped) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= items.length) return;

        const shouldContinue = await runItem(items[index]!, index, workerIndex);
        if (shouldContinue === false) {
          stopped = true;
          return;
        }
      }
    }),
  );
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

export function planRelationQueue(scope: string, options: RelationQueueOptions = {}) {
  rejectLegacyPairIds(options);
  const targetPairs = positiveInteger(options.targetPairs, DEFAULT_RELATION_QUEUE_TARGET_PAIRS, "--target-pairs");
  const limit = positiveInteger(options.limit, DEFAULT_RELATION_QUEUE_LIMIT, "--limit");

  return planSegmentedRelations(scope, targetPairs, options.candidateKeys).slice(0, limit);
}

export function planRelationReviewQueue(scope: string, options: RelationReviewQueueOptions = {}) {
  const targetRelations = positiveInteger(options.targetRelations, DEFAULT_RELATION_QUEUE_TARGET_RELATIONS, "--target-relations");
  const limit = positiveInteger(options.limit, DEFAULT_RELATION_QUEUE_LIMIT, "--limit");

  return planSegmentedRelationReview(scope, targetRelations, options.relationIds).slice(0, limit);
}

const runRelationBatchProcess: RelationBatchRunner = async (
  scope: string,
  options: RelationQueueOptions,
  targetPairs: number,
  timeoutSeconds: number,
  batch: SegmentedRelationBatch,
  pinned: boolean,
) => {
  const repoRoot = getRepoRoot();
  const args = [
    "packages/cli/src/cli.ts",
    "relations-segmented",
    scope,
    "--target-pairs",
    String(targetPairs),
    "--limit",
    "1",
    ...(pinned ? ["--candidate-keys", batch.candidateKeys.join(",")] : []),
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
        reject(new Error(`Relation batch ${batch.index} timed out after ${timeoutSeconds}s`));
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
};

async function runRelationReviewBatchProcess(
  scope: string,
  options: RelationReviewQueueOptions,
  targetRelations: number,
  timeoutSeconds: number,
  batch: SegmentedRelationReviewBatch,
  pinned: boolean,
) {
  const repoRoot = getRepoRoot();
  const args = [
    "packages/cli/src/cli.ts",
    "relations-review-segmented",
    scope,
    "--target-relations",
    String(targetRelations),
    "--limit",
    "1",
    ...(pinned ? ["--relation-ids", batch.relationIds.join(",")] : []),
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
        reject(new Error(`Relation review batch ${batch.index} timed out after ${timeoutSeconds}s`));
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

export async function runRelationQueue(
  scope: string,
  options: RelationQueueOptions = {},
  runBatch: RelationBatchRunner = runRelationBatchProcess,
): Promise<RelationQueueResult> {
  const dryRun = options.dryRun ?? false;
  const targetPairs = positiveInteger(options.targetPairs, DEFAULT_RELATION_QUEUE_TARGET_PAIRS, "--target-pairs");
  const limit = positiveInteger(options.limit, DEFAULT_RELATION_QUEUE_LIMIT, "--limit");
  const workers = positiveInteger(options.workers, 1, "--workers");
  const retries = positiveInteger(options.retries, DEFAULT_RELATION_QUEUE_RETRIES, "--retries");
  const timeoutSeconds = positiveInteger(
    options.timeoutSeconds,
    DEFAULT_RELATION_QUEUE_TIMEOUT_SECONDS,
    "--timeout-seconds",
  );
  const validateEvery = options.validateEvery === undefined ? undefined : positiveInteger(options.validateEvery, 1, "--validate-every");
  const maxAttempts = retries + 1;
  const plannedBatches = planRelationQueue(scope, { ...options, targetPairs, limit });
  options.onEvent?.({ type: "queue_start", scope, plannedBatchCount: plannedBatches.length, targetPairs, limit, retries, timeoutSeconds });

  const completedBatches: RelationQueueBatchResult[] = [];

  if (dryRun) {
    return { scope, dryRun, targetPairs, limit, retries, plannedBatches, completedBatches };
  }

  if (workers > 1) {
    let failedBatch: RelationQueueBatchResult | undefined;

    await runWorkerPool(plannedBatches, workers, async (plannedBatch) => {
      if (failedBatch) return false;

      let currentBatch = plannedBatch;
      let lastError = "";
      let transcriptDir = "";
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        currentBatch = planSegmentedRelations(scope, targetPairs, plannedBatch.candidateKeys)[0] ?? currentBatch;
        options.onEvent?.({ type: "batch_attempt", batch: currentBatch, attempt, maxAttempts });
        try {
          const result = await runBatch(scope, options, targetPairs, timeoutSeconds, currentBatch, true);
          transcriptDir = result.transcriptDir;
          if (!relationCandidateKeysComplete(scope, plannedBatch.candidateKeys)) {
            throw new Error(`Relation batch did not cover target candidates: ${plannedBatch.candidateKeys.join(", ")}`);
          }
          completedBatches.push({ candidateKeys: plannedBatch.candidateKeys, attemptCount: attempt, status: "completed", transcriptDir });
          options.onEvent?.({ type: "batch_success", batch: currentBatch, attempt, transcriptDir });
          lastError = "";
          return true;
        } catch (error) {
          lastError = errorMessage(error);
          options.onEvent?.({ type: "batch_failure", batch: currentBatch, attempt, error: lastError });
        }
      }

      failedBatch = {
        candidateKeys: plannedBatch.candidateKeys,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };
      return false;
    }, { staggerMs: 250 });

    if (failedBatch) {
      return { scope, dryRun, targetPairs, limit, retries, plannedBatches, completedBatches, failedBatch };
    }

    const validation = options.validateFinal === false || plannedBatches.length === 0 ? undefined : validateRepo();
    if (validation) options.onEvent?.({ type: "queue_validation", validation });

    return { scope, dryRun, targetPairs, limit, retries, plannedBatches, completedBatches, validation };
  }

  for (const plannedBatch of plannedBatches) {
    let currentBatch = plannedBatch;

    let lastError = "";
    let transcriptDir = "";
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      currentBatch = planSegmentedRelations(scope, targetPairs, plannedBatch.candidateKeys)[0] ?? currentBatch;
      options.onEvent?.({ type: "batch_attempt", batch: currentBatch, attempt, maxAttempts });
      try {
        const result = await runBatch(scope, options, targetPairs, timeoutSeconds, currentBatch, true);
        transcriptDir = result.transcriptDir;
        if (!relationCandidateKeysComplete(scope, plannedBatch.candidateKeys)) {
          throw new Error(`Relation batch did not cover target candidates: ${plannedBatch.candidateKeys.join(", ")}`);
        }
        const validation = shouldValidateBatch(completedBatches.length + 1, options.validateEach, validateEvery)
          ? validateRepo()
          : undefined;
        completedBatches.push({ candidateKeys: plannedBatch.candidateKeys, attemptCount: attempt, status: "completed", transcriptDir });
        options.onEvent?.({ type: "batch_success", batch: currentBatch, attempt, transcriptDir, validation });
        lastError = "";
        break;
      } catch (error) {
        lastError = errorMessage(error);
        options.onEvent?.({ type: "batch_failure", batch: currentBatch, attempt, error: lastError });
      }
    }

    if (lastError) {
      const failedBatch: RelationQueueBatchResult = {
        candidateKeys: plannedBatch.candidateKeys,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };
      return { scope, dryRun, targetPairs, limit, retries, plannedBatches, completedBatches, failedBatch };
    }
  }

  const validation = options.validateFinal === false || plannedBatches.length === 0 ? undefined : validateRepo();
  if (validation) options.onEvent?.({ type: "queue_validation", validation });

  return { scope, dryRun, targetPairs, limit, retries, plannedBatches, completedBatches, validation };
}

export async function runRelationReviewQueue(
  scope: string,
  options: RelationReviewQueueOptions = {},
): Promise<RelationReviewQueueResult> {
  const dryRun = options.dryRun ?? false;
  const targetRelations = positiveInteger(options.targetRelations, DEFAULT_RELATION_QUEUE_TARGET_RELATIONS, "--target-relations");
  const limit = positiveInteger(options.limit, DEFAULT_RELATION_QUEUE_LIMIT, "--limit");
  const workers = positiveInteger(options.workers, 1, "--workers");
  const retries = positiveInteger(options.retries, DEFAULT_RELATION_QUEUE_RETRIES, "--retries");
  const timeoutSeconds = positiveInteger(
    options.timeoutSeconds,
    DEFAULT_RELATION_QUEUE_TIMEOUT_SECONDS,
    "--timeout-seconds",
  );
  const validateEvery = options.validateEvery === undefined ? undefined : positiveInteger(options.validateEvery, 1, "--validate-every");
  const maxAttempts = retries + 1;
  const plannedBatches = planRelationReviewQueue(scope, { ...options, targetRelations, limit });
  options.onEvent?.({ type: "queue_start", scope, plannedBatchCount: plannedBatches.length, targetRelations, limit, retries, timeoutSeconds });

  const completedBatches: RelationReviewQueueBatchResult[] = [];

  if (dryRun) {
    return { scope, dryRun, targetRelations, limit, retries, plannedBatches, completedBatches };
  }

  if (workers > 1) {
    let failedBatch: RelationReviewQueueBatchResult | undefined;

    await runWorkerPool(plannedBatches, workers, async (plannedBatch) => {
      if (failedBatch) return false;

      let currentBatch = plannedBatch;
      let lastError = "";
      let transcriptDir = "";
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        currentBatch = planSegmentedRelationReview(scope, targetRelations, plannedBatch.relationIds)[0] ?? currentBatch;
        options.onEvent?.({ type: "batch_attempt", batch: currentBatch, attempt, maxAttempts });
        try {
          const result = await runRelationReviewBatchProcess(scope, options, targetRelations, timeoutSeconds, currentBatch, true);
          transcriptDir = result.transcriptDir;
          if (!relationReviewTargetIdsComplete(scope, plannedBatch.relationIds)) {
            throw new Error(`Relation review batch did not complete target relations: ${plannedBatch.relationIds.join(", ")}`);
          }
          completedBatches.push({ relationIds: plannedBatch.relationIds, attemptCount: attempt, status: "completed", transcriptDir });
          options.onEvent?.({ type: "batch_success", batch: currentBatch, attempt, transcriptDir });
          lastError = "";
          return true;
        } catch (error) {
          lastError = errorMessage(error);
          options.onEvent?.({ type: "batch_failure", batch: currentBatch, attempt, error: lastError });
        }
      }

      failedBatch = {
        relationIds: plannedBatch.relationIds,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };
      return false;
    }, { staggerMs: 250 });

    if (failedBatch) {
      return { scope, dryRun, targetRelations, limit, retries, plannedBatches, completedBatches, failedBatch };
    }

    const validation = options.validateFinal === false || plannedBatches.length === 0 ? undefined : validateRepo();
    if (validation) options.onEvent?.({ type: "queue_validation", validation });

    return { scope, dryRun, targetRelations, limit, retries, plannedBatches, completedBatches, validation };
  }

  for (let queueIndex = 0; queueIndex < plannedBatches.length; queueIndex += 1) {
    let currentBatch = planSegmentedRelationReview(scope, targetRelations)[0];
    if (!currentBatch) break;

    let lastError = "";
    let transcriptDir = "";
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      currentBatch = planSegmentedRelationReview(scope, targetRelations)[0] ?? currentBatch;
      options.onEvent?.({ type: "batch_attempt", batch: currentBatch, attempt, maxAttempts });
      try {
        const result = await runRelationReviewBatchProcess(scope, options, targetRelations, timeoutSeconds, currentBatch, false);
        transcriptDir = result.transcriptDir;
        if (!relationReviewTargetIdsComplete(scope, currentBatch.relationIds)) {
          throw new Error(`Relation review batch did not complete target relations: ${currentBatch.relationIds.join(", ")}`);
        }
        const validation = shouldValidateBatch(completedBatches.length + 1, options.validateEach, validateEvery)
          ? validateRepo()
          : undefined;
        completedBatches.push({ relationIds: currentBatch.relationIds, attemptCount: attempt, status: "completed", transcriptDir });
        options.onEvent?.({ type: "batch_success", batch: currentBatch, attempt, transcriptDir, validation });
        lastError = "";
        break;
      } catch (error) {
        lastError = errorMessage(error);
        options.onEvent?.({ type: "batch_failure", batch: currentBatch, attempt, error: lastError });
      }
    }

    if (lastError) {
      const failedBatch: RelationReviewQueueBatchResult = {
        relationIds: currentBatch.relationIds,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };
      return { scope, dryRun, targetRelations, limit, retries, plannedBatches, completedBatches, failedBatch };
    }
  }

  const validation = options.validateFinal === false || plannedBatches.length === 0 ? undefined : validateRepo();
  if (validation) options.onEvent?.({ type: "queue_validation", validation });

  return { scope, dryRun, targetRelations, limit, retries, plannedBatches, completedBatches, validation };
}

import { spawn } from "node:child_process";
import { join } from "node:path";
import {
  claimReviewTargetIdsComplete,
  planSegmentedClaimReview,
  planSegmentedClaims,
  type SegmentedClaimReviewBatch,
  type SegmentedClaimSegment,
} from "./claims-segments.js";
import { getRepoRoot } from "./paths.js";
import type { ValidationReport } from "./types.js";
import { validateRepo } from "./validate.js";

export const DEFAULT_CLAIM_QUEUE_TARGET_BYTES = 10_000;
export const DEFAULT_CLAIM_QUEUE_TARGET_CLAIMS = 20;
export const DEFAULT_CLAIM_QUEUE_LIMIT = 4;
export const DEFAULT_CLAIM_QUEUE_RETRIES = 2;
export const DEFAULT_CLAIM_QUEUE_TIMEOUT_SECONDS = 240;

export type ClaimQueueEvent =
  | {
      type: "queue_start";
      dialogue: string;
      plannedSegmentCount: number;
      targetBytes: number;
      limit: number;
      retries: number;
      timeoutSeconds: number;
    }
  | {
      type: "segment_attempt";
      segment: SegmentedClaimSegment;
      attempt: number;
      maxAttempts: number;
    }
  | {
      type: "segment_success";
      segment: SegmentedClaimSegment;
      attempt: number;
      transcriptDir: string;
      validation?: ValidationReport | undefined;
    }
  | {
      type: "segment_failure";
      segment: SegmentedClaimSegment;
      attempt: number;
      error: string;
    }
  | {
      type: "queue_validation";
      validation: ValidationReport;
    };

export type ClaimReviewQueueEvent =
  | {
      type: "queue_start";
      dialogue: string;
      plannedBatchCount: number;
      targetClaims: number;
      limit: number;
      retries: number;
      timeoutSeconds: number;
    }
  | {
      type: "batch_attempt";
      batch: SegmentedClaimReviewBatch;
      attempt: number;
      maxAttempts: number;
    }
  | {
      type: "batch_success";
      batch: SegmentedClaimReviewBatch;
      attempt: number;
      transcriptDir: string;
      validation?: ValidationReport | undefined;
    }
  | {
      type: "batch_failure";
      batch: SegmentedClaimReviewBatch;
      attempt: number;
      error: string;
    }
  | {
      type: "queue_validation";
      validation: ValidationReport;
    };

export type ClaimQueueOptions = {
  dryRun?: boolean;
  profileName?: string | undefined;
  provider?: string | undefined;
  model?: string | undefined;
  targetBytes?: number | undefined;
  fromMarker?: string | undefined;
  toMarker?: string | undefined;
  limit?: number | undefined;
  retries?: number | undefined;
  timeoutSeconds?: number | undefined;
  validateEach?: boolean | undefined;
  validateFinal?: boolean | undefined;
  onEvent?: ((event: ClaimQueueEvent) => void) | undefined;
};

export type ClaimReviewQueueOptions = {
  dryRun?: boolean;
  profileName?: string | undefined;
  provider?: string | undefined;
  model?: string | undefined;
  targetClaims?: number | undefined;
  limit?: number | undefined;
  retries?: number | undefined;
  timeoutSeconds?: number | undefined;
  validateEach?: boolean | undefined;
  validateFinal?: boolean | undefined;
  onEvent?: ((event: ClaimReviewQueueEvent) => void) | undefined;
};

export type ClaimQueueSegmentResult = {
  span: string;
  startMarker: string;
  endMarker: string;
  attemptCount: number;
  status: "completed" | "failed";
  transcriptDir?: string | undefined;
  error?: string | undefined;
};

export type ClaimReviewQueueBatchResult = {
  claimIds: string[];
  attemptCount: number;
  status: "completed" | "failed";
  transcriptDir?: string | undefined;
  error?: string | undefined;
};

export type ClaimQueueResult = {
  dialogue: string;
  dryRun: boolean;
  targetBytes: number;
  limit: number;
  retries: number;
  plannedSegments: SegmentedClaimSegment[];
  completedSegments: ClaimQueueSegmentResult[];
  failedSegment?: ClaimQueueSegmentResult | undefined;
  validation?: ValidationReport | undefined;
};

export type ClaimReviewQueueResult = {
  dialogue: string;
  dryRun: boolean;
  targetClaims: number;
  limit: number;
  retries: number;
  plannedBatches: SegmentedClaimReviewBatch[];
  completedBatches: ClaimReviewQueueBatchResult[];
  failedBatch?: ClaimReviewQueueBatchResult | undefined;
  validation?: ValidationReport | undefined;
};

function positiveInteger(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return resolved;
}

function markerRange(segment: SegmentedClaimSegment) {
  return {
    fromMarker: segment.startMarker,
    toMarker: segment.endMarker,
  };
}

export function planClaimQueue(dialogue: string, options: ClaimQueueOptions = {}) {
  const targetBytes = positiveInteger(options.targetBytes, DEFAULT_CLAIM_QUEUE_TARGET_BYTES, "--target-bytes");
  const limit = positiveInteger(options.limit, DEFAULT_CLAIM_QUEUE_LIMIT, "--limit");

  return planSegmentedClaims(dialogue, targetBytes, {
    ...(options.fromMarker ? { fromMarker: options.fromMarker } : {}),
    ...(options.toMarker ? { toMarker: options.toMarker } : {}),
  })
    .filter((segment) => !segment.completed)
    .slice(0, limit);
}

export function planClaimReviewQueue(dialogue: string, options: ClaimReviewQueueOptions = {}) {
  const targetClaims = positiveInteger(options.targetClaims, DEFAULT_CLAIM_QUEUE_TARGET_CLAIMS, "--target-claims");
  const limit = positiveInteger(options.limit, DEFAULT_CLAIM_QUEUE_LIMIT, "--limit");

  return planSegmentedClaimReview(dialogue, targetClaims).slice(0, limit);
}

function assertClaimSegmentCompleted(dialogue: string, targetBytes: number, segment: SegmentedClaimSegment) {
  const remaining = planSegmentedClaims(dialogue, targetBytes, markerRange(segment)).filter(
    (candidate) => !candidate.completed,
  );
  if (remaining.length === 0) return;

  throw new Error(`Claim segment ${segment.span} is still pending after run: ${remaining.map((candidate) => candidate.span).join(", ")}`);
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

async function runClaimSegmentProcess(
  dialogue: string,
  options: ClaimQueueOptions,
  targetBytes: number,
  timeoutSeconds: number,
  segment: SegmentedClaimSegment,
) {
  const repoRoot = getRepoRoot();
  const args = [
    "packages/cli/src/cli.ts",
    "claims-segmented",
    dialogue,
    "--target-bytes",
    String(targetBytes),
    "--from-marker",
    segment.startMarker,
    "--to-marker",
    segment.endMarker,
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
        reject(new Error(`Claim segment ${segment.span} timed out after ${timeoutSeconds}s`));
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

async function runClaimReviewBatchProcess(
  dialogue: string,
  options: ClaimReviewQueueOptions,
  targetClaims: number,
  timeoutSeconds: number,
  batch: SegmentedClaimReviewBatch,
) {
  const repoRoot = getRepoRoot();
  const args = [
    "packages/cli/src/cli.ts",
    "claims-review-segmented",
    dialogue,
    "--target-claims",
    String(targetClaims),
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
        reject(new Error(`Claim review batch ${batch.index} timed out after ${timeoutSeconds}s`));
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

export async function runClaimQueue(dialogue: string, options: ClaimQueueOptions = {}): Promise<ClaimQueueResult> {
  const dryRun = options.dryRun ?? false;
  const targetBytes = positiveInteger(options.targetBytes, DEFAULT_CLAIM_QUEUE_TARGET_BYTES, "--target-bytes");
  const limit = positiveInteger(options.limit, DEFAULT_CLAIM_QUEUE_LIMIT, "--limit");
  const retries = positiveInteger(options.retries, DEFAULT_CLAIM_QUEUE_RETRIES, "--retries");
  const timeoutSeconds = positiveInteger(
    options.timeoutSeconds,
    DEFAULT_CLAIM_QUEUE_TIMEOUT_SECONDS,
    "--timeout-seconds",
  );
  const maxAttempts = retries + 1;
  const plannedSegments = planClaimQueue(dialogue, { ...options, targetBytes, limit });
  options.onEvent?.({
    type: "queue_start",
    dialogue,
    plannedSegmentCount: plannedSegments.length,
    targetBytes,
    limit,
    retries,
    timeoutSeconds,
  });

  const completedSegments: ClaimQueueSegmentResult[] = [];

  if (dryRun) {
    return {
      dialogue,
      dryRun,
      targetBytes,
      limit,
      retries,
      plannedSegments,
      completedSegments,
    };
  }

  for (const segment of plannedSegments) {
    let lastError = "";
    let transcriptDir = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      options.onEvent?.({ type: "segment_attempt", segment, attempt, maxAttempts });
      try {
        const result = await runClaimSegmentProcess(dialogue, options, targetBytes, timeoutSeconds, segment);
        transcriptDir = result.transcriptDir;
        assertClaimSegmentCompleted(dialogue, targetBytes, segment);
        const validation = options.validateEach ? validateRepo() : undefined;
        const success: ClaimQueueSegmentResult = {
          span: segment.span,
          startMarker: segment.startMarker,
          endMarker: segment.endMarker,
          attemptCount: attempt,
          status: "completed",
          transcriptDir,
        };
        completedSegments.push(success);
        options.onEvent?.({ type: "segment_success", segment, attempt, transcriptDir, validation });
        lastError = "";
        break;
      } catch (error) {
        lastError = errorMessage(error);
        options.onEvent?.({ type: "segment_failure", segment, attempt, error: lastError });
      }
    }

    if (lastError) {
      const failedSegment: ClaimQueueSegmentResult = {
        span: segment.span,
        startMarker: segment.startMarker,
        endMarker: segment.endMarker,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };

      return {
        dialogue,
        dryRun,
        targetBytes,
        limit,
        retries,
        plannedSegments,
        completedSegments,
        failedSegment,
      };
    }
  }

  const validation = options.validateFinal === false || plannedSegments.length === 0 ? undefined : validateRepo();
  if (validation) options.onEvent?.({ type: "queue_validation", validation });

  return {
    dialogue,
    dryRun,
    targetBytes,
    limit,
    retries,
    plannedSegments,
    completedSegments,
    validation,
  };
}

export async function runClaimReviewQueue(
  dialogue: string,
  options: ClaimReviewQueueOptions = {},
): Promise<ClaimReviewQueueResult> {
  const dryRun = options.dryRun ?? false;
  const targetClaims = positiveInteger(options.targetClaims, DEFAULT_CLAIM_QUEUE_TARGET_CLAIMS, "--target-claims");
  const limit = positiveInteger(options.limit, DEFAULT_CLAIM_QUEUE_LIMIT, "--limit");
  const retries = positiveInteger(options.retries, DEFAULT_CLAIM_QUEUE_RETRIES, "--retries");
  const timeoutSeconds = positiveInteger(
    options.timeoutSeconds,
    DEFAULT_CLAIM_QUEUE_TIMEOUT_SECONDS,
    "--timeout-seconds",
  );
  const maxAttempts = retries + 1;
  const plannedBatches = planClaimReviewQueue(dialogue, { ...options, targetClaims, limit });
  options.onEvent?.({
    type: "queue_start",
    dialogue,
    plannedBatchCount: plannedBatches.length,
    targetClaims,
    limit,
    retries,
    timeoutSeconds,
  });

  const completedBatches: ClaimReviewQueueBatchResult[] = [];

  if (dryRun) {
    return {
      dialogue,
      dryRun,
      targetClaims,
      limit,
      retries,
      plannedBatches,
      completedBatches,
    };
  }

  for (let queueIndex = 0; queueIndex < plannedBatches.length; queueIndex += 1) {
    let currentBatch = planSegmentedClaimReview(dialogue, targetClaims)[0];
    if (!currentBatch) break;

    let lastError = "";
    let transcriptDir = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      currentBatch = planSegmentedClaimReview(dialogue, targetClaims)[0] ?? currentBatch;
      options.onEvent?.({ type: "batch_attempt", batch: currentBatch, attempt, maxAttempts });
      try {
        const result = await runClaimReviewBatchProcess(dialogue, options, targetClaims, timeoutSeconds, currentBatch);
        transcriptDir = result.transcriptDir;
        if (!claimReviewTargetIdsComplete(dialogue, currentBatch.claimIds)) {
          throw new Error(`Claim review batch did not complete target claims: ${currentBatch.claimIds.join(", ")}`);
        }
        const validation = options.validateEach ? validateRepo() : undefined;
        completedBatches.push({
          claimIds: currentBatch.claimIds,
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
      const failedBatch: ClaimReviewQueueBatchResult = {
        claimIds: currentBatch.claimIds,
        attemptCount: maxAttempts,
        status: "failed",
        ...(transcriptDir ? { transcriptDir } : {}),
        error: lastError,
      };

      return {
        dialogue,
        dryRun,
        targetClaims,
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
    targetClaims,
    limit,
    retries,
    plannedBatches,
    completedBatches,
    validation,
  };
}

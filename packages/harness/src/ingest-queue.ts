import { spawn } from "node:child_process";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { planGapIngest, planSegmentedIngest, type SegmentedIngestSegment } from "./segments.js";
import type { ValidationReport } from "./types.js";
import { validateRepo } from "./validate.js";

export const DEFAULT_QUEUE_TARGET_BYTES = 2_000;
export const DEFAULT_QUEUE_LIMIT = 4;
export const DEFAULT_QUEUE_RETRIES = 2;
export const DEFAULT_QUEUE_TIMEOUT_SECONDS = 180;

export type SegmentedIngestQueueEvent =
  | {
      type: "queue_start";
      dialogue: string;
      plannedSegmentCount: number;
      targetBytes: number;
      limit: number;
      retries: number;
      timeoutSeconds: number;
      gaps: boolean;
    }
  | {
      type: "segment_attempt";
      segment: SegmentedIngestSegment;
      attempt: number;
      maxAttempts: number;
    }
  | {
      type: "segment_success";
      segment: SegmentedIngestSegment;
      attempt: number;
      transcriptDir: string;
      validation?: ValidationReport | undefined;
    }
  | {
      type: "segment_failure";
      segment: SegmentedIngestSegment;
      attempt: number;
      error: string;
    }
  | {
      type: "queue_validation";
      validation: ValidationReport;
    };

export type SegmentedIngestQueueOptions = {
  dryRun?: boolean;
  profileName?: string | undefined;
  provider?: string | undefined;
  model?: string | undefined;
  targetBytes?: number | undefined;
  fromMarker?: string | undefined;
  toMarker?: string | undefined;
  gaps?: boolean | undefined;
  limit?: number | undefined;
  retries?: number | undefined;
  timeoutSeconds?: number | undefined;
  validateEach?: boolean | undefined;
  validateFinal?: boolean | undefined;
  onEvent?: ((event: SegmentedIngestQueueEvent) => void) | undefined;
};

export type SegmentedIngestQueueSegmentResult = {
  span: string;
  startMarker: string;
  endMarker: string;
  attemptCount: number;
  status: "completed" | "failed";
  transcriptDir?: string | undefined;
  error?: string | undefined;
};

export type SegmentedIngestQueueResult = {
  dialogue: string;
  dryRun: boolean;
  targetBytes: number;
  limit: number;
  retries: number;
  plannedSegments: SegmentedIngestSegment[];
  completedSegments: SegmentedIngestQueueSegmentResult[];
  failedSegment?: SegmentedIngestQueueSegmentResult | undefined;
  validation?: ValidationReport | undefined;
};

function positiveInteger(value: number | undefined, fallback: number, name: string) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return resolved;
}

function markerRange(segment: SegmentedIngestSegment) {
  return {
    fromMarker: segment.startMarker,
    toMarker: segment.endMarker,
  };
}

export function planSegmentedIngestQueue(dialogue: string, options: SegmentedIngestQueueOptions = {}) {
  const targetBytes = positiveInteger(options.targetBytes, DEFAULT_QUEUE_TARGET_BYTES, "--target-bytes");
  const limit = positiveInteger(options.limit, DEFAULT_QUEUE_LIMIT, "--limit");
  if (options.gaps && (options.fromMarker || options.toMarker)) {
    throw new Error("--gaps derives its own ranges; do not combine it with --from-marker or --to-marker");
  }

  return (options.gaps
    ? planGapIngest(dialogue)
    : planSegmentedIngest(dialogue, targetBytes, {
        ...(options.fromMarker ? { fromMarker: options.fromMarker } : {}),
        ...(options.toMarker ? { toMarker: options.toMarker } : {}),
      }))
    .filter((segment) => !segment.completed)
    .slice(0, limit);
}

function assertSegmentCompleted(dialogue: string, targetBytes: number, segment: SegmentedIngestSegment) {
  const remaining = planSegmentedIngest(dialogue, targetBytes, markerRange(segment)).filter(
    (candidate) => !candidate.completed,
  );
  if (remaining.length === 0) return;

  throw new Error(
    `Segment ${segment.span} is still pending after run: ${remaining.map((candidate) => candidate.span).join(", ")}`,
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

async function runSegmentProcess(
  dialogue: string,
  options: SegmentedIngestQueueOptions,
  targetBytes: number,
  timeoutSeconds: number,
  segment: SegmentedIngestSegment,
) {
  const repoRoot = getRepoRoot();
  const segmentArgs = options.gaps
    ? ["--gaps", "--gap-start-char", String(segment.startChar), "--gap-end-char", String(segment.endChar)]
    : ["--target-bytes", String(targetBytes), "--from-marker", segment.startMarker, "--to-marker", segment.endMarker];
  const args = [
    "packages/cli/src/cli.ts",
    "ingest-segmented",
    dialogue,
    ...segmentArgs,
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
        reject(new Error(`Segment ${segment.span} timed out after ${timeoutSeconds}s`));
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

export async function runSegmentedIngestQueue(
  dialogue: string,
  options: SegmentedIngestQueueOptions = {},
): Promise<SegmentedIngestQueueResult> {
  const dryRun = options.dryRun ?? false;
  const targetBytes = positiveInteger(options.targetBytes, DEFAULT_QUEUE_TARGET_BYTES, "--target-bytes");
  const limit = positiveInteger(options.limit, DEFAULT_QUEUE_LIMIT, "--limit");
  const retries = positiveInteger(options.retries, DEFAULT_QUEUE_RETRIES, "--retries");
  const timeoutSeconds = positiveInteger(
    options.timeoutSeconds,
    DEFAULT_QUEUE_TIMEOUT_SECONDS,
    "--timeout-seconds",
  );
  const maxAttempts = retries + 1;
  const plannedSegments = planSegmentedIngestQueue(dialogue, { ...options, targetBytes, limit });
  options.onEvent?.({
    type: "queue_start",
    dialogue,
    plannedSegmentCount: plannedSegments.length,
    targetBytes,
    limit,
    retries,
    timeoutSeconds,
    gaps: options.gaps ?? false,
  });

  const completedSegments: SegmentedIngestQueueSegmentResult[] = [];

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
        const result = await runSegmentProcess(dialogue, options, targetBytes, timeoutSeconds, segment);
        transcriptDir = result.transcriptDir;
        if (!options.gaps) {
          assertSegmentCompleted(dialogue, targetBytes, segment);
        }
        const validation = options.validateEach ? validateRepo() : undefined;
        const success: SegmentedIngestQueueSegmentResult = {
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
      const failedSegment: SegmentedIngestQueueSegmentResult = {
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

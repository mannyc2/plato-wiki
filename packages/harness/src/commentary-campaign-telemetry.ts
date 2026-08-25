import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "./paths.js";

const TELEMETRY_SCHEMA_VERSION = 1 as const;
const ACTIVE_ROOT = "scratch/commentary/campaign-state" as const;
const HISTORY_ROOT = "scratch/commentary/campaign-history" as const;

export type CommentaryCampaignTokenUsage = {
  input_tokens: number;
  cached_input_tokens: number;
  cache_write_input_tokens: number;
  output_tokens: number;
  reasoning_output_tokens: number;
};

export type ParsedCodexExecResult = {
  structured_output: unknown;
  usage: CommentaryCampaignTokenUsage;
};

/**
 * Codex emitted an operational/provider failure in its JSONL event stream.
 * These failures are not candidate artifacts and must stop a campaign so a
 * systemic provider incident cannot be mistaken for recoverable bad output.
 */
export class CodexExecOperationalError extends Error {
  readonly operational = true as const;

  constructor(message: string) {
    super(message);
    this.name = "CodexExecOperationalError";
  }
}

export type CommentaryCampaignAttemptOutcome =
  | "generated"
  | "command_failed"
  | "provider_quota"
  | "invalid_output"
  | "transport_error";

export type CommentaryCampaignAttempt = {
  schema_version: 1;
  campaign: string;
  attempt_id: string;
  job_id: string;
  dialogue: string;
  stage: string;
  unit_key: string | null;
  input_sha256: string;
  model: string;
  effort: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  outcome: CommentaryCampaignAttemptOutcome;
  exit_code: number | null;
  response_sha256: string;
  usage_source: "codex_turn_completed" | "missing";
  usage: CommentaryCampaignTokenUsage | null;
  estimated_cost_usd: null;
  cost_status: "not_reported_by_codex_cli";
};

export type CommentaryCampaignUsageReport = {
  schema_version: 1;
  sources: readonly [typeof ACTIVE_ROOT, typeof HISTORY_ROOT];
  filters: { dialogue?: string; stage?: string };
  attempt_count: number;
  generated_attempt_count: number;
  failed_attempt_count: number;
  missing_usage_attempt_count: number;
  totals: {
    input_tokens: number;
    cached_input_tokens: number;
    cache_write_input_tokens: number;
    uncached_input_tokens: number;
    output_tokens: number;
    reasoning_output_tokens: number;
    total_tokens: number;
    duration_ms: number;
    estimated_cost_usd: null;
  };
  attempts: CommentaryCampaignAttempt[];
};

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function nonnegativeInteger(value: unknown, path: string) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${path} must be a nonnegative safe integer`);
  }
  return value;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], path: string) {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  if (actual.length !== canonical.length || actual.some((key, index) => key !== canonical[index])) {
    throw new Error(`${path} must contain exactly: ${canonical.join(", ")}`);
  }
}

function exactUsage(value: unknown, path: string): CommentaryCampaignTokenUsage {
  const usage = object(value, path);
  const expected = [
    "input_tokens",
    "cached_input_tokens",
    "cache_write_input_tokens",
    "output_tokens",
    "reasoning_output_tokens",
  ] as const;
  try {
    exactKeys(usage, expected, path);
  } catch {
    throw new Error(`${path} must use the exact codex-cli 0.147.0 usage fields`);
  }
  const inputTokens = nonnegativeInteger(usage.input_tokens, `${path}.input_tokens`);
  const cachedInputTokens = nonnegativeInteger(usage.cached_input_tokens, `${path}.cached_input_tokens`);
  const cacheWriteInputTokens = nonnegativeInteger(
    usage.cache_write_input_tokens,
    `${path}.cache_write_input_tokens`,
  );
  const outputTokens = nonnegativeInteger(usage.output_tokens, `${path}.output_tokens`);
  const reasoningOutputTokens = nonnegativeInteger(
    usage.reasoning_output_tokens,
    `${path}.reasoning_output_tokens`,
  );
  if (cachedInputTokens > inputTokens) throw new Error(`${path}.cached_input_tokens exceeds input_tokens`);
  return {
    input_tokens: inputTokens,
    cached_input_tokens: cachedInputTokens,
    cache_write_input_tokens: cacheWriteInputTokens,
    output_tokens: outputTokens,
    reasoning_output_tokens: reasoningOutputTokens,
  };
}

const CODEX_EXEC_EVENT_TYPES: ReadonlySet<string> = new Set([
  "thread.started",
  "turn.started",
  "item.started",
  "item.updated",
  "item.completed",
  "turn.completed",
  "turn.failed",
  "error",
] as const);

const CODEX_EXEC_ITEM_TYPES: ReadonlySet<string> = new Set([
  "agent_message",
  "reasoning",
  "command_execution",
  "file_change",
  "mcp_tool_call",
  "collab_tool_call",
  "web_search",
  "todo_list",
  "error",
] as const);

function parseEventLine(line: string, index: number, path: string) {
  let value: unknown;
  try {
    value = JSON.parse(line) as unknown;
  } catch (error) {
    throw new Error(
      `${path} line ${index + 1} is invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return object(value, `${path} line ${index + 1}`);
}

function eventType(event: Record<string, unknown>, line: number, path: string) {
  if (typeof event.type !== "string" || !CODEX_EXEC_EVENT_TYPES.has(event.type)) {
    const rendered = typeof event.type === "string" ? event.type : typeof event.type;
    throw new Error(`${path} line ${line} has unknown event type ${rendered}`);
  }
  return event.type;
}

function validateItemEvent(event: Record<string, unknown>, line: number, path: string) {
  exactKeys(event, ["type", "item"], `${path} line ${line}`);
  const item = object(event.item, `${path} line ${line}.item`);
  if (typeof item.id !== "string" || item.id.trim().length === 0) {
    throw new Error(`${path} line ${line}.item.id must be a non-empty string`);
  }
  if (typeof item.type !== "string" || !CODEX_EXEC_ITEM_TYPES.has(item.type)) {
    const rendered = typeof item.type === "string" ? item.type : typeof item.type;
    throw new Error(`${path} line ${line}.item has unknown item type ${rendered}`);
  }
  if (item.type === "agent_message" && typeof item.text !== "string") {
    throw new Error(`${path} line ${line}.item.text must be a string`);
  }
  return item;
}

export function parseCodexExecResult(payload: string, path = "Codex JSONL"): ParsedCodexExecResult {
  const lines = payload.split(/\r?\n/u).filter((line) => line.trim().length > 0);
  if (lines.length === 0) throw new Error(`${path} is empty`);
  const events = lines.map((line, index) => parseEventLine(line, index, path));
  let phase: "thread" | "turn" | "items" | "terminal" = "thread";
  let finalAgentMessageText: string | undefined;
  let usage: CommentaryCampaignTokenUsage | undefined;

  for (const [index, event] of events.entries()) {
    const line = index + 1;
    const type = eventType(event, line, path);
    if (type === "error") {
      const message = typeof event.message === "string" ? event.message : "Codex emitted an error event";
      throw new CodexExecOperationalError(
        `${path} line ${line} contains a top-level Codex error event: ${message}`,
      );
    }

    if (phase === "thread") {
      if (type !== "thread.started") throw new Error(`${path} must begin with thread.started`);
      exactKeys(event, ["type", "thread_id"], `${path} line ${line}`);
      if (typeof event.thread_id !== "string" || event.thread_id.trim().length === 0) {
        throw new Error(`${path} line ${line}.thread_id must be a non-empty string`);
      }
      phase = "turn";
      continue;
    }

    if (phase === "turn") {
      if (type !== "turn.started") throw new Error(`${path} line ${line} is out of order; expected turn.started`);
      exactKeys(event, ["type"], `${path} line ${line}`);
      phase = "items";
      continue;
    }

    if (phase === "terminal") {
      throw new Error(`${path} line ${line} occurs after the turn terminal event`);
    }

    if (type === "thread.started" || type === "turn.started") {
      throw new Error(`${path} line ${line} contains an out-of-order duplicate ${type}`);
    }
    if (type === "item.started" || type === "item.updated" || type === "item.completed") {
      const item = validateItemEvent(event, line, path);
      if (type === "item.completed" && item.type === "agent_message") {
        finalAgentMessageText = item.text as string;
      }
      continue;
    }
    if (type === "turn.failed") {
      const error = event.error;
      const message = typeof error === "object" && error !== null && !Array.isArray(error) &&
          typeof (error as Record<string, unknown>).message === "string"
        ? (error as Record<string, unknown>).message as string
        : "Codex turn failed";
      if (index !== events.length - 1) {
        throw new CodexExecOperationalError(`${path} line ${line} turn.failed was not the final event: ${message}`);
      }
      throw new CodexExecOperationalError(`${path} ended with turn.failed: ${message}`);
    }
    if (type === "turn.completed") {
      exactKeys(event, ["type", "usage"], `${path} line ${line}`);
      if (index !== events.length - 1) {
        throw new Error(`${path} line ${line} turn.completed must be the final event`);
      }
      usage = exactUsage(event.usage, `${path} turn.completed.usage`);
      phase = "terminal";
      continue;
    }
  }

  if (phase === "thread") throw new Error(`${path} is missing thread.started`);
  if (phase === "turn") throw new Error(`${path} is missing turn.started`);
  if (phase !== "terminal" || !usage) throw new Error(`${path} is missing a final turn.completed event`);
  if (finalAgentMessageText === undefined) throw new Error(`${path} is missing a completed agent message`);
  let structuredOutput: unknown;
  try {
    structuredOutput = JSON.parse(finalAgentMessageText) as unknown;
  } catch (error) {
    throw new Error(
      `${path} agent message is not structured JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return {
    structured_output: structuredOutput,
    usage,
  };
}

export function commentaryCampaignTelemetryPath(statePath: string) {
  if (!statePath.endsWith(".json")) throw new Error(`Campaign state path must end in .json: ${statePath}`);
  return statePath.replace(/\.json$/u, ".usage.json");
}

function atomicWrite(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  writeFileSync(temporary, content, "utf8");
  renameSync(temporary, path);
}

function responseSha256(stdout: string, stderr: string) {
  const hash = createHash("sha256");
  hash.update("commentary-campaign-codex-response-v1\0", "utf8");
  for (const [channel, content] of [["stdout", stdout], ["stderr", stderr]] as const) {
    const bytes = Buffer.from(content, "utf8");
    hash.update(`${channel}\0${bytes.byteLength}\0`, "utf8");
    hash.update(bytes);
  }
  return hash.digest("hex");
}

export function recordCommentaryCampaignAttempt(options: {
  campaign: string;
  job: {
    job_id: string;
    dialogue: string;
    stage: string;
    unit_key?: string;
    state_path: string;
    input_sha256: string;
    authoring_model: string;
    effort: string;
  };
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  outcome: CommentaryCampaignAttemptOutcome;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  usage: CommentaryCampaignTokenUsage | null;
}) {
  const usage = options.usage === null
    ? null
    : exactUsage(options.usage, "Commentary campaign attempt usage");
  const responseDigest = responseSha256(options.stdout, options.stderr);
  const attemptId = sha256(JSON.stringify({
    job_id: options.job.job_id,
    input_sha256: options.job.input_sha256,
    started_at: options.startedAt.toISOString(),
    response_sha256: responseDigest,
  })).slice(0, 24);
  const attempt: CommentaryCampaignAttempt = {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    campaign: options.campaign,
    attempt_id: attemptId,
    job_id: options.job.job_id,
    dialogue: options.job.dialogue,
    stage: options.job.stage,
    unit_key: options.job.unit_key ?? null,
    input_sha256: options.job.input_sha256,
    model: options.job.authoring_model,
    effort: options.job.effort,
    started_at: options.startedAt.toISOString(),
    completed_at: options.completedAt.toISOString(),
    duration_ms: Math.max(0, Math.round(options.durationMs)),
    outcome: options.outcome,
    exit_code: options.exitCode,
    response_sha256: responseDigest,
    usage_source: usage ? "codex_turn_completed" : "missing",
    usage,
    estimated_cost_usd: null,
    cost_status: "not_reported_by_codex_cli",
  };
  const relativePath = commentaryCampaignTelemetryPath(options.job.state_path);
  const absolutePath = join(getRepoRoot(), relativePath);
  if (existsSync(absolutePath)) {
    throw new Error(`Refusing to overwrite active commentary campaign telemetry: ${relativePath}`);
  }
  atomicWrite(absolutePath, `${JSON.stringify(attempt, null, 2)}\n`);
  return { path: relativePath, attempt };
}

function readAttemptsUnder(relativeRoot: string): CommentaryCampaignAttempt[] {
  const root = join(getRepoRoot(), relativeRoot);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dialogueEntry) => {
      const dialoguePath = join(root, dialogueEntry.name);
      return readdirSync(dialoguePath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".usage.json"))
        .map((entry) => JSON.parse(readFileSync(join(dialoguePath, entry.name), "utf8")) as CommentaryCampaignAttempt);
    });
}

export function buildCommentaryCampaignUsageReport(
  filters: { dialogue?: string; stage?: string } = {},
): CommentaryCampaignUsageReport {
  const attempts = [...readAttemptsUnder(ACTIVE_ROOT), ...readAttemptsUnder(HISTORY_ROOT)]
    .filter((attempt) =>
      attempt.schema_version === TELEMETRY_SCHEMA_VERSION &&
      (!filters.dialogue || attempt.dialogue === filters.dialogue) &&
      (!filters.stage || attempt.stage === filters.stage)
    )
    .sort((a, b) => a.started_at.localeCompare(b.started_at) || a.attempt_id.localeCompare(b.attempt_id));
  const totals = attempts.reduce(
    (sum, attempt) => {
      sum.duration_ms += attempt.duration_ms;
      if (!attempt.usage) return sum;
      sum.input_tokens += attempt.usage.input_tokens;
      sum.cached_input_tokens += attempt.usage.cached_input_tokens;
      sum.cache_write_input_tokens += attempt.usage.cache_write_input_tokens;
      sum.output_tokens += attempt.usage.output_tokens;
      sum.reasoning_output_tokens += attempt.usage.reasoning_output_tokens;
      return sum;
    },
    {
      input_tokens: 0,
      cached_input_tokens: 0,
      cache_write_input_tokens: 0,
      output_tokens: 0,
      reasoning_output_tokens: 0,
      duration_ms: 0,
    },
  );
  return {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    sources: [ACTIVE_ROOT, HISTORY_ROOT],
    filters,
    attempt_count: attempts.length,
    generated_attempt_count: attempts.filter((attempt) => attempt.outcome === "generated").length,
    failed_attempt_count: attempts.filter((attempt) => attempt.outcome !== "generated").length,
    missing_usage_attempt_count: attempts.filter((attempt) => attempt.usage === null).length,
    totals: {
      ...totals,
      uncached_input_tokens: totals.input_tokens - totals.cached_input_tokens,
      total_tokens: totals.input_tokens + totals.output_tokens,
      estimated_cost_usd: null,
    },
    attempts,
  };
}

import {
  appendFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative } from "node:path";
import { createInterface } from "node:readline";
import type { AgentHarnessEvent, AgentMessage } from "@earendil-works/pi-agent-core";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { readConfig } from "./config.js";
import { getRepoRoot } from "./paths.js";
import type {
  HarnessConfig,
  HarnessRunCommand,
  TranscriptInfo,
  TranscriptTraceAssistantError,
  TranscriptTraceIssue,
  TranscriptTraceRejection,
  TranscriptTraceSummary,
  TranscriptTraceWrite,
  TranscriptUsageSummary,
  UsageRecord,
} from "./types.js";
import { summarizeUsageRecords, usageRecordFromMessage, writeUsageArtifacts } from "./usage.js";

export type TranscriptWriter = {
  runId: string;
  runDir: string;
  eventsPath: string;
  summaryPath: string;
  responsePath: string;
  usagePath: string;
  usageMarkdownPath: string;
  write: (type: string, data?: Record<string, unknown>) => void;
  eventCount: (type: string) => number;
  writeSummary: (content: string) => void;
  writeResponse: (content: string) => void;
  recordAssistantUsage: (message: AssistantMessage) => void;
};

function timestampForPath(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function safeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function summarizeMessageForEvent(message: AgentMessage) {
  if (!("role" in message)) {
    return { type: "custom" };
  }

  if (message.role === "user") {
    return {
      role: message.role,
      contentBytes:
        typeof message.content === "string"
          ? Buffer.byteLength(message.content)
          : Buffer.byteLength(JSON.stringify(message.content)),
    };
  }

  if (message.role === "toolResult") {
    return {
      role: message.role,
      toolCallId: message.toolCallId,
      toolName: message.toolName,
      isError: message.isError,
      contentBytes: Buffer.byteLength(JSON.stringify(message.content)),
    };
  }

  if (message.role !== "assistant") {
    return { role: message.role, type: "custom" };
  }

  const errorMessage =
    "errorMessage" in message && typeof message.errorMessage === "string" ? message.errorMessage : undefined;

  return {
    role: message.role,
    stopReason: message.stopReason,
    provider: message.provider,
    model: message.model,
    ...(errorMessage ? { errorMessage } : {}),
    content: message.content.map((part) => {
      if (part.type === "text") {
        return { type: part.type, bytes: Buffer.byteLength(part.text) };
      }
      if (part.type === "thinking") {
        return { type: part.type, bytes: Buffer.byteLength(part.thinking) };
      }
      if (part.type === "toolCall") {
        const partialArgs =
          "partialArgs" in part && typeof part.partialArgs === "string" ? part.partialArgs : undefined;
        return {
          type: part.type,
          id: part.id,
          name: part.name,
          argumentBytes: Buffer.byteLength(JSON.stringify(part.arguments ?? {})),
          partialArgumentBytes: partialArgs ? Buffer.byteLength(partialArgs) : 0,
        };
      }
      return { type: "unknown" };
    }),
    usage: message.usage,
  };
}

function messageRole(message: AgentMessage) {
  return "role" in message ? message.role : "custom";
}

function summarizeProviderPayload(payload: unknown) {
  const messages = payload && typeof payload === "object" && "messages" in payload ? payload.messages : undefined;
  return {
    payloadBytes: Buffer.byteLength(JSON.stringify(payload)),
    messageCount: Array.isArray(messages) ? messages.length : undefined,
  };
}

export async function forEachEventLine(
  eventsPath: string,
  onEvent: (event: Record<string, unknown>) => void,
): Promise<{ lineCount: number; parseErrorCount: number }> {
  const rl = createInterface({
    input: createReadStream(eventsPath, "utf8"),
    crlfDelay: Infinity,
  });
  let lineCount = 0;
  let parseErrorCount = 0;

  for await (const line of rl) {
    if (!line) continue;
    lineCount += 1;
    try {
      onEvent(JSON.parse(line) as Record<string, unknown>);
    } catch {
      parseErrorCount += 1;
    }
  }

  return { lineCount, parseErrorCount };
}

export function createTranscript(config: HarnessConfig, command: HarnessRunCommand, subject: string, dryRun: boolean): TranscriptWriter {
  const repoRoot = getRepoRoot();
  const runId = `${timestampForPath()}-p${process.pid}_${safeSlug(command)}_${safeSlug(subject)}`;
  const runDir = join(repoRoot, config.transcriptsDir, "runs", runId);
  const eventsPath = join(runDir, "events.jsonl");
  const summaryPath = join(runDir, "summary.md");
  const responsePath = join(runDir, "response.md");
  const usagePath = join(runDir, "usage.json");
  const usageMarkdownPath = join(runDir, "usage.md");
  const usageRecords: UsageRecord[] = [];
  const eventCounts = new Map<string, number>();

  mkdirSync(runDir, { recursive: true });

  const writer: TranscriptWriter = {
    runId,
    runDir,
    eventsPath,
    summaryPath,
    responsePath,
    usagePath,
    usageMarkdownPath,
    write(type, data = {}) {
      eventCounts.set(type, (eventCounts.get(type) ?? 0) + 1);
      appendFileSync(eventsPath, `${JSON.stringify({ ts: new Date().toISOString(), type, ...data })}\n`);
    },
    eventCount(type) {
      return eventCounts.get(type) ?? 0;
    },
    writeSummary(content) {
      writeFileSync(summaryPath, content);
    },
    writeResponse(content) {
      writeFileSync(responsePath, content);
    },
    recordAssistantUsage(message) {
      usageRecords.push(usageRecordFromMessage(message));
      const summary = summarizeUsageRecords(runId, runDir, usageRecords);
      writeUsageArtifacts(runDir, summary);
      this.write("usage_recorded", {
        requestCount: summary.requestCount,
        totalTokens: summary.totals.totalTokens,
        cacheRead: summary.totals.cacheRead,
        cacheWrite: summary.totals.cacheWrite,
        cost: summary.totals.cost.total,
        usagePath: relative(repoRoot, usagePath),
        usageMarkdownPath: relative(repoRoot, usageMarkdownPath),
      });
    },
  };

  writer.write("run_created", {
    runId,
    command,
    subject,
    dryRun,
    cwd: repoRoot,
  });

  return writer;
}

export function summarizeEvent(event: AgentHarnessEvent): Record<string, unknown> {
  switch (event.type) {
    case "before_agent_start":
      return {
        prompt: event.prompt,
        systemPrompt: event.systemPrompt,
        skills: event.resources.skills?.map((skill) => skill.name) ?? [],
        promptTemplates: event.resources.promptTemplates?.map((template) => template.name) ?? [],
      };
    case "context":
      return {
        messageCount: event.messages.length,
        roles: event.messages.map(messageRole),
      };
    case "before_provider_payload":
      return {
        provider: event.model.provider,
        model: event.model.id,
        ...summarizeProviderPayload(event.payload),
      };
    case "before_provider_request":
      return {
        provider: event.model.provider,
        model: event.model.id,
        sessionId: event.sessionId,
        streamOptions: event.streamOptions,
      };
    case "after_provider_response":
      return {
        status: event.status,
        headers: event.headers,
      };
    case "message_end":
      return { message: summarizeMessageForEvent(event.message) };
    case "message_start":
      return { message: summarizeMessageForEvent(event.message) };
    case "message_update":
      return {
        message: summarizeMessageForEvent(event.message),
        assistantMessageEventType: event.assistantMessageEvent.type,
      };
    case "turn_end":
      return {
        message: summarizeMessageForEvent(event.message),
        toolResults: event.toolResults.map(summarizeMessageForEvent),
      };
    case "agent_end":
      return {
        messageCount: event.messages.length,
        roles: event.messages.map(messageRole),
      };
    case "tool_call":
      return {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        input: event.input,
      };
    case "tool_result":
      return {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        input: event.input,
        content: event.content,
        details: event.details,
        isError: event.isError,
      };
    case "tool_execution_start":
    case "tool_execution_update":
    case "tool_execution_end":
      return { ...event };
    case "queue_update":
      return {
        steerCount: event.steer.length,
        followUpCount: event.followUp.length,
        nextTurnCount: event.nextTurn.length,
      };
    case "save_point":
      return { hadPendingMutations: event.hadPendingMutations };
    case "settled":
      return { nextTurnCount: event.nextTurnCount };
    case "abort":
      return {
        clearedSteerCount: event.clearedSteer.length,
        clearedFollowUpCount: event.clearedFollowUp.length,
      };
    case "session_before_compact":
    case "session_compact":
    case "session_before_tree":
    case "session_tree":
    case "model_update":
    case "thinking_level_update":
    case "resources_update":
    case "tools_update":
      return { ...event };
    default:
      return {};
  }
}

export function listTranscripts(config = readConfig()): TranscriptInfo[] {
  const repoRoot = getRepoRoot();
  const runsRoot = join(repoRoot, config.transcriptsDir, "runs");
  if (!existsSync(runsRoot)) return [];

  return readdirSync(runsRoot)
    .map((name) => {
      const path = join(runsRoot, name);
      return { name, path, mtime: statSync(path).mtimeMs };
    })
    .filter((entry) => statSync(entry.path).isDirectory())
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 20)
    .map(({ name, path }) => ({ name, path }));
}

function resolveTranscriptRun(runName: string | undefined, config = readConfig()) {
  const repoRoot = getRepoRoot();
  const transcripts = listTranscripts(config);
  const runsRoot = join(repoRoot, config.transcriptsDir, "runs");

  if (!runName) {
    const latest = transcripts[0];
    if (!latest) {
      throw new Error("No transcript runs found.");
    }
    return latest.path;
  }

  const exact = transcripts.find((transcript) => transcript.name === runName);
  if (exact) return exact.path;

  const path = join(runsRoot, runName);
  if (existsSync(path) && statSync(path).isDirectory()) {
    return path;
  }

  throw new Error(`Transcript run not found: ${runName}`);
}

async function usageRecordsFromEvents(eventsPath: string) {
  const records: UsageRecord[] = [];

  await forEachEventLine(eventsPath, (event) => {
    const transcriptEvent = event as {
      type?: string;
      eventType?: string;
      message?: AssistantMessage;
    };

    if (transcriptEvent.type !== "agent_event" || transcriptEvent.eventType !== "message_end") return;
    if (transcriptEvent.message?.role !== "assistant") return;

    records.push(usageRecordFromMessage(transcriptEvent.message));
  });

  return records;
}

export async function summarizeTranscriptUsage(
  runName?: string,
  config: HarnessConfig = readConfig(),
): Promise<TranscriptUsageSummary> {
  const repoRoot = getRepoRoot();
  const runPath = resolveTranscriptRun(runName, config);
  const eventsPath = join(runPath, "events.jsonl");

  if (!existsSync(eventsPath)) {
    throw new Error(`Missing transcript events file: ${relative(repoRoot, eventsPath)}`);
  }

  return summarizeUsageRecords(basename(runPath), runPath, await usageRecordsFromEvents(eventsPath));
}

export async function writeTranscriptUsageArtifacts(
  runName?: string,
  config: HarnessConfig = readConfig(),
): Promise<TranscriptUsageSummary> {
  const summary = await summarizeTranscriptUsage(runName, config);
  writeUsageArtifacts(summary.runPath, summary);
  return summary;
}

function incrementCount(counts: Record<string, number>, key: string | undefined) {
  if (!key) return;
  counts[key] = (counts[key] ?? 0) + 1;
}

function issueCodeSummary(issues: unknown): TranscriptTraceIssue[] {
  if (!Array.isArray(issues)) return [];

  const counts = new Map<string, number>();
  for (const issue of issues) {
    if (!issue || typeof issue !== "object" || !("code" in issue)) continue;
    const code = String(issue.code);
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export async function summarizeTranscriptTrace(runName?: string): Promise<TranscriptTraceSummary> {
  const repoRoot = getRepoRoot();
  const runPath = resolveTranscriptRun(runName);
  const runNameResolved = basename(runPath);
  const eventsPath = join(runPath, "events.jsonl");
  const responsePath = join(runPath, "response.md");
  const eventTypes: Record<string, number> = {};
  const agentEventTypes: Record<string, number> = {};
  const toolExecutionCounts: Record<string, number> = {};
  const wikiEventCounts: Record<string, number> = {};
  const rejections: TranscriptTraceRejection[] = [];
  const writes: TranscriptTraceWrite[] = [];
  const assistantErrors: TranscriptTraceAssistantError[] = [];
  let eventCount = 0;
  let parseErrorCount = 0;
  let usage: TranscriptTraceSummary["usage"];

  if (!existsSync(eventsPath)) {
    throw new Error(`Missing transcript events file: ${relative(repoRoot, eventsPath)}`);
  }

  const eventLineSummary = await forEachEventLine(eventsPath, (rawEvent) => {
    const event = rawEvent as {
      ts?: string;
      type?: string;
      eventType?: string;
      toolName?: string;
      path?: string;
      bytes?: number;
      issueCount?: number;
      issues?: unknown;
      assignedFeatureCount?: number;
      observationCount?: number;
      claimCount?: number;
      relationCount?: number;
      message?: unknown;
    };

    incrementCount(eventTypes, event.type);
    if (event.type === "agent_event") {
      incrementCount(agentEventTypes, event.eventType);
    }
    if (event.type === "agent_event" && event.eventType === "message_end") {
      const message = event.message as
        | {
            role?: string;
            provider?: string;
            model?: string;
            stopReason?: string;
            errorMessage?: string;
          }
        | undefined;
      if (message?.role === "assistant" && (message.stopReason === "error" || message.stopReason === "aborted")) {
        assistantErrors.push({
          ts: event.ts ?? "",
          provider: message.provider,
          model: message.model,
          stopReason: message.stopReason,
          errorMessage: message.errorMessage,
        });
      }
    }
    if (event.type?.startsWith("wiki_tool_")) {
      incrementCount(wikiEventCounts, event.type);
    }
    if (event.type?.startsWith("tool_execution_")) {
      incrementCount(toolExecutionCounts, event.toolName ?? event.type);
    }
    if (event.type?.endsWith("_rejected")) {
      rejections.push({
        ts: event.ts ?? "",
        type: event.type,
        path: event.path,
        issueCount: event.issueCount,
        issueCodes: issueCodeSummary(event.issues),
      });
    }
    if (
      event.type === "wiki_tool_stage_observation" ||
      event.type === "wiki_tool_commit_observation" ||
      event.type === "wiki_tool_write_observation" ||
      event.type === "wiki_tool_append_observations" ||
      event.type === "wiki_tool_commit_claims" ||
      event.type === "wiki_tool_append_claims" ||
      event.type === "wiki_tool_update_claim_review_statuses" ||
      event.type === "wiki_tool_append_relations" ||
      event.type === "wiki_tool_update_relation_review_statuses" ||
      event.type === "wiki_tool_sync_feature_registry" ||
      event.type === "wiki_tool_write_feature_registry" ||
      event.type === "wiki_tool_append_ledger"
    ) {
      writes.push({
        ts: event.ts ?? "",
        type: event.type,
        path: event.path,
        bytes: event.bytes,
        observationCount: event.observationCount,
        claimCount: event.claimCount,
        relationCount: event.relationCount,
        assignedFeatureCount: event.assignedFeatureCount,
      });
    }
  });
  eventCount = eventLineSummary.lineCount;
  parseErrorCount = eventLineSummary.parseErrorCount;

  const usageSummary = await summarizeTranscriptUsage(runNameResolved);
  usage = {
    requestCount: usageSummary.requestCount,
    totals: usageSummary.totals,
  };

  return {
    runName: runNameResolved,
    runPath,
    eventCount,
    parseErrorCount,
    eventTypes,
    agentEventTypes,
    toolExecutionCounts,
    wikiEventCounts,
    rejections,
    writes,
    assistantErrors,
    usage,
    responseText: existsSync(responsePath) ? readFileSync(responsePath, "utf8").trim() : undefined,
  };
}

import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { basename, join, relative } from "node:path";
import { createInterface } from "node:readline";
import { getRepoRoot } from "./paths.js";
import type {
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

export function listTranscripts(config = { transcriptsDir: "wiki/transcripts" }): TranscriptInfo[] {
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

function resolveTranscriptRun(runName: string | undefined, config = { transcriptsDir: "wiki/transcripts" }) {
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
      message?: UsageRecord & { role: string };
    };

    if (transcriptEvent.type !== "agent_event" || transcriptEvent.eventType !== "message_end") return;
    if (transcriptEvent.message?.role !== "assistant") return;

    records.push(usageRecordFromMessage(transcriptEvent.message));
  });

  return records;
}

export async function summarizeTranscriptUsage(
  runName?: string,
  config: { transcriptsDir: string } = { transcriptsDir: "wiki/transcripts" },
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
  config: { transcriptsDir: string } = { transcriptsDir: "wiki/transcripts" },
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

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "bun:test";
import type { AgentHarnessEvent, AgentMessage } from "@earendil-works/pi-agent-core";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { createTranscript, forEachEventLine, summarizeEvent, summarizeTranscriptUsage } from "./transcript.js";
import { emptyUsage } from "./usage.js";
import { getRepoRoot } from "./paths.js";

function assistantMessage(text: string, timestamp = 1): AssistantMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    timestamp,
    api: "test",
    provider: "test-provider",
    model: "test-model",
    responseId: "response-test",
    stopReason: "stop",
    usage: {
      ...emptyUsage(),
      input: 10,
      output: 5,
      totalTokens: 15,
    },
  };
}

function tempPath(prefix: string) {
  return mkdtempSync(join(tmpdir(), prefix));
}

describe("transcript events", () => {
  it("summarizes large event payloads without embedding full content", () => {
    const largeText = "x".repeat(100_000);
    const message = assistantMessage(largeText);
    const messageSummary = summarizeEvent({
      type: "message_end",
      message,
    } as AgentHarnessEvent);
    const agentEndSummary = summarizeEvent({
      type: "agent_end",
      messages: [
        { role: "user", content: "one" },
        message,
        { role: "toolResult", toolCallId: "call", toolName: "tool", isError: false, content: [] },
      ] as AgentMessage[],
    } as AgentHarnessEvent);
    const payloadSummary = summarizeEvent({
      type: "before_provider_payload",
      model: { provider: "test-provider", id: "test-model" },
      payload: { messages: [{ role: "user", content: largeText }] },
    } as unknown as AgentHarnessEvent);

    expect(JSON.stringify(messageSummary).length).toBeLessThan(2_000);
    expect(JSON.stringify(messageSummary)).not.toContain(largeText);
    expect(messageSummary).toMatchObject({
      message: {
        role: "assistant",
        provider: "test-provider",
        model: "test-model",
        content: [{ type: "text", bytes: 100_000 }],
      },
    });
    expect(agentEndSummary).toEqual({ messageCount: 3, roles: ["user", "assistant", "toolResult"] });
    expect(payloadSummary).toMatchObject({
      provider: "test-provider",
      model: "test-model",
      payloadBytes: expect.any(Number),
      messageCount: 1,
    });
    expect(payloadSummary).not.toHaveProperty("payload");
  });

  it("streams valid event lines and counts corrupt lines without throwing", async () => {
    const dir = tempPath("transcript-lines-");
    const eventsPath = join(dir, "events.jsonl");
    const events: Record<string, unknown>[] = [];
    writeFileSync(
      eventsPath,
      [
        JSON.stringify({ type: "run_created" }),
        "{\"type\":\"truncated\"",
        JSON.stringify({ type: "run_completed" }),
        "",
      ].join("\n"),
      "utf8",
    );

    const summary = await forEachEventLine(eventsPath, (event) => events.push(event));

    expect(summary).toEqual({ lineCount: 3, parseErrorCount: 1 });
    expect(events.map((event) => event.type)).toEqual(["run_created", "run_completed"]);
  });

  it("builds usage summaries from streamed event records", async () => {
    const dir = tempPath("transcript-usage-");
    const runDir = join(dir, "runs", "usage_fixture");
    const eventsPath = join(runDir, "events.jsonl");
    mkdirSync(runDir, { recursive: true });
    writeFileSync(
      eventsPath,
      [
        JSON.stringify({ type: "agent_event", eventType: "message_end", message: assistantMessage("one", 1) }),
        JSON.stringify({ type: "ignored" }),
        JSON.stringify({ type: "agent_event", eventType: "message_end", message: assistantMessage("two", 2) }),
      ].join("\n"),
      "utf8",
    );

    const summary = await summarizeTranscriptUsage("usage_fixture", {
      defaultProfile: "test",
      transcriptsDir: relative(getRepoRoot(), dir),
      profiles: {
        test: { provider: "test-provider", model: "test-model" },
      },
    });

    expect(summary.requestCount).toBe(2);
    expect(summary.totals.input).toBe(20);
    expect(summary.totals.output).toBe(10);
    expect(summary.totals.totalTokens).toBe(30);
  });

  it("writes run_failed events to transcript JSONL", () => {
    const dir = tempPath("transcript-failed-");
    const writer = createTranscript(
      {
        defaultProfile: "test",
        transcriptsDir: relative(getRepoRoot(), dir),
        profiles: {
          test: { provider: "test-provider", model: "test-model" },
        },
      },
      "ingest",
      "euthyphro",
      false,
    );

    writer.write("run_failed", { command: "ingest", dialogue: "euthyphro", error: "boom" });
    expect(writer.eventCount("run_failed")).toBe(1);
    expect(writer.eventCount("missing_event")).toBe(0);

    const events = readFileSync(writer.eventsPath, "utf8");
    expect(events).toContain("\"type\":\"run_failed\"");
    expect(events).toContain("\"error\":\"boom\"");
  });

  it("includes the process id in run ids for concurrent child processes", () => {
    const dir = tempPath("transcript-run-id-");
    const writer = createTranscript(
      {
        defaultProfile: "test",
        transcriptsDir: relative(getRepoRoot(), dir),
        profiles: {
          test: { provider: "test-provider", model: "test-model" },
        },
      },
      "relations-segmented",
      "cross-dialogue",
      false,
    );

    expect(writer.runId).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-p\d+_relations-segmented_cross-dialogue$/,
    );
    expect(writer.runId).toContain(`-p${process.pid}_`);
  });

  it("keeps assistant provider errors visible in summaries", () => {
    const message = {
      ...assistantMessage(""),
      stopReason: "error",
      errorMessage: "402 Insufficient Balance",
    };

    const summary = summarizeEvent({
      type: "message_end",
      message,
    } as AgentHarnessEvent);

    expect(summary).toMatchObject({
      message: {
        role: "assistant",
        stopReason: "error",
        errorMessage: "402 Insufficient Balance",
      },
    });
  });
});

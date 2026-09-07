import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "bun:test";
import { forEachEventLine, summarizeTranscriptUsage } from "./transcript.js";
import { emptyUsage } from "./usage.js";
import { getRepoRoot } from "./paths.js";

function assistantMessage(text: string, timestamp = 1) {
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
      transcriptsDir: relative(getRepoRoot(), dir),
    });

    expect(summary.requestCount).toBe(2);
    expect(summary.totals.input).toBe(20);
    expect(summary.totals.output).toBe(10);
    expect(summary.totals.totalTokens).toBe(30);
  });

});

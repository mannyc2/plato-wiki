import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildCommentaryCampaignUsageReport,
  CodexExecOperationalError,
  parseCodexExecResult,
  recordCommentaryCampaignAttempt,
} from "./commentary-campaign-telemetry.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

describe("commentary campaign telemetry", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-telemetry-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  function codexPayload(
    structuredOutput: unknown = { schema_version: 1 },
    usage: Record<string, unknown> = {
      input_tokens: 120,
      cached_input_tokens: 80,
      cache_write_input_tokens: 4,
      output_tokens: 30,
      reasoning_output_tokens: 12,
    },
  ) {
    return [
      JSON.stringify({ type: "thread.started", thread_id: "thread" }),
      JSON.stringify({ type: "turn.started" }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "item_0", type: "agent_message", text: JSON.stringify(structuredOutput) },
      }),
      JSON.stringify({ type: "turn.completed", usage }),
    ].join("\n");
  }

  it("extracts only the exact terminal Codex usage fields", () => {
    const structuredOutput = { schema_version: 1 };
    const payload = codexPayload(structuredOutput);
    expect(parseCodexExecResult(payload)).toEqual({
      structured_output: structuredOutput,
      usage: {
        input_tokens: 120,
        cached_input_tokens: 80,
        cache_write_input_tokens: 4,
        output_tokens: 30,
        reasoning_output_tokens: 12,
      },
    });
    expect(() => parseCodexExecResult(`${payload}\nnot-json`)).toThrow("invalid JSON");
    expect(() => parseCodexExecResult(codexPayload(structuredOutput, {
      input_tokens: 120,
      cached_input_tokens: 80,
      cache_write_input_tokens: 4,
      output_tokens: 30,
      reasoning_output_tokens: 12,
      total_tokens: 150,
    }))).toThrow("exact codex-cli 0.147.0 usage fields");
  });

  it("rejects unknown, malformed, out-of-order, failed, and top-level error events", () => {
    const events = codexPayload().split("\n");
    expect(() => parseCodexExecResult([
      ...events.slice(0, -1),
      JSON.stringify({ type: "future.event" }),
      events.at(-1),
    ].join("\n"))).toThrow("unknown event type future.event");
    expect(() => parseCodexExecResult([
      events[0],
      events[2],
      events[1],
      events[3],
    ].join("\n"))).toThrow("out of order; expected turn.started");
    expect(() => parseCodexExecResult([
      events[0],
      events[1],
      JSON.stringify({ type: "error", message: "provider failure" }),
    ].join("\n"))).toThrow(CodexExecOperationalError);
    expect(() => parseCodexExecResult([
      events[0],
      events[1],
      JSON.stringify({ type: "turn.failed", error: { message: "failed" } }),
    ].join("\n"))).toThrow("ended with turn.failed");
    expect(() => parseCodexExecResult([
      events[0],
      events[1],
      JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: "{}" } }),
      events[3],
    ].join("\n"))).toThrow("item.id must be a non-empty string");
    expect(() => parseCodexExecResult(events.slice(0, -1).join("\n"))).toThrow(
      "missing a final turn.completed event",
    );
  });

  it("parses JSON only from the final completed agent message", () => {
    const payload = [
      JSON.stringify({ type: "thread.started", thread_id: "thread" }),
      JSON.stringify({ type: "turn.started" }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "item_0", type: "agent_message", text: JSON.stringify({ version: 1 }) },
      }),
      JSON.stringify({
        type: "item.updated",
        item: { id: "item_1", type: "agent_message", text: JSON.stringify({ ignored: true }) },
      }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "item_2", type: "agent_message", text: JSON.stringify({ version: 2 }) },
      }),
      codexPayload().split("\n").at(-1),
    ].join("\n");
    expect(parseCodexExecResult(payload).structured_output).toEqual({ version: 2 });
  });

  it("persists compact attempts and reports missing usage explicitly", () => {
    const base = {
      campaign: "campaign",
      job: {
        job_id: "audit:fixture:01",
        dialogue: "fixture",
        stage: "audit",
        unit_key: "01",
        state_path: "scratch/commentary/campaign-state/fixture/audit-01.json",
        input_sha256: "a".repeat(64),
        authoring_model: "gpt-test",
        effort: "medium",
      },
      startedAt: new Date("2026-08-22T12:00:00.000Z"),
      completedAt: new Date("2026-08-22T12:00:01.500Z"),
      durationMs: 1_500,
      exitCode: 0,
      stderr: "",
    } as const;
    expect(() => recordCommentaryCampaignAttempt({
      ...base,
      outcome: "generated",
      stdout: "completed",
      usage: {
        input_tokens: 100,
        cached_input_tokens: 60,
        cache_write_input_tokens: 5,
        output_tokens: 20,
        reasoning_output_tokens: 8,
        total_tokens: 120,
      } as never,
    })).toThrow("exact codex-cli 0.147.0 usage fields");
    const first = recordCommentaryCampaignAttempt({
      ...base,
      outcome: "generated",
      stdout: "completed",
      usage: {
        input_tokens: 100,
        cached_input_tokens: 60,
        cache_write_input_tokens: 5,
        output_tokens: 20,
        reasoning_output_tokens: 8,
      },
    });
    recordCommentaryCampaignAttempt({
      ...base,
      job: {
        ...base.job,
        job_id: "audit:fixture:02",
        unit_key: "02",
        state_path: "scratch/commentary/campaign-state/fixture/audit-02.json",
      },
      outcome: "invalid_output",
      stdout: "invalid",
      usage: null,
    });

    expect(JSON.parse(readFileSync(join(root, first.path), "utf8"))).toMatchObject({
      outcome: "generated",
      usage_source: "codex_turn_completed",
      estimated_cost_usd: null,
    });
    expect(buildCommentaryCampaignUsageReport({ dialogue: "fixture" })).toMatchObject({
      attempt_count: 2,
      generated_attempt_count: 1,
      failed_attempt_count: 1,
      missing_usage_attempt_count: 1,
      totals: {
        input_tokens: 100,
        cached_input_tokens: 60,
        cache_write_input_tokens: 5,
        uncached_input_tokens: 40,
        output_tokens: 20,
        reasoning_output_tokens: 8,
        total_tokens: 120,
        duration_ms: 3_000,
        estimated_cost_usd: null,
      },
    });
  });

  it("domain-separates stdout and stderr in the response hash", () => {
    const base = {
      campaign: "campaign",
      job: {
        job_id: "audit:fixture:01",
        dialogue: "fixture",
        stage: "audit",
        unit_key: "01",
        state_path: "scratch/commentary/campaign-state/fixture/audit-01.json",
        input_sha256: "a".repeat(64),
        authoring_model: "gpt-test",
        effort: "medium",
      },
      startedAt: new Date("2026-08-22T12:00:00.000Z"),
      completedAt: new Date("2026-08-22T12:00:01.000Z"),
      durationMs: 1_000,
      outcome: "invalid_output" as const,
      exitCode: 0,
      usage: null,
    };
    const first = recordCommentaryCampaignAttempt({ ...base, stdout: "ab", stderr: "c" });
    const second = recordCommentaryCampaignAttempt({
      ...base,
      job: {
        ...base.job,
        job_id: "audit:fixture:02",
        unit_key: "02",
        state_path: "scratch/commentary/campaign-state/fixture/audit-02.json",
      },
      stdout: "a",
      stderr: "bc",
    });
    expect(first.attempt.response_sha256).not.toBe(second.attempt.response_sha256);
  });
});

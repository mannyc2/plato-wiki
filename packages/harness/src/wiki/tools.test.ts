import { describe, expect, it } from "bun:test";
import type { TranscriptWriter } from "../transcript.js";
import { createWikiTools } from "./tools.js";

const transcript: TranscriptWriter = {
  runId: "test",
  runDir: "test",
  eventsPath: "test/events.jsonl",
  summaryPath: "test/summary.md",
  responsePath: "test/response.md",
  usagePath: "test/usage.json",
  usageMarkdownPath: "test/usage.md",
  write: () => {},
  writeSummary: () => {},
  writeResponse: () => {},
  recordAssistantUsage: () => {},
};

describe("createWikiTools", () => {
  it("uses staged source-bound observation commits during ingest", () => {
    const names = createWikiTools(transcript, "ingest").map(({ name }) => name);
    expect(names).toContain("wiki_stage_observation");
    expect(names).toContain("wiki_commit_observation");
    expect(names).not.toContain("wiki_write_observation");
    expect(names.some((name) => name.includes("feature"))).toBe(false);
  });

  it("uses append-only observation writes during segmented ingest", () => {
    expect(createWikiTools(transcript, "ingest-segmented").map(({ name }) => name)).toEqual([
      "wiki_source_span",
      "wiki_append_observations",
    ]);
  });

  it("exposes observation review without a peer ontology writer", () => {
    for (const command of ["review", "review-segmented"] as const) {
      const names = createWikiTools(transcript, command).map(({ name }) => name);
      expect(names).toContain("wiki_write_observation");
      expect(names).toContain("wiki_update_review_statuses");
      expect(names.some((name) => name.includes("feature"))).toBe(false);
    }
  });

  it("keeps claim extraction append-only", () => {
    expect(createWikiTools(transcript, "claims-segmented").map(({ name }) => name)).toEqual([
      "wiki_append_claims",
    ]);
  });
});

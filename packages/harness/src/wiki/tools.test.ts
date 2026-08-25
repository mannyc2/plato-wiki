import { describe, expect, it } from "bun:test";
import type { TranscriptWriter } from "../transcript.js";
import { createWikiTools, syncedRegistryOrThrow } from "./tools.js";

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
  it("uses staged observation commits during ingest", () => {
    const toolNames = createWikiTools(transcript, "ingest").map((tool) => tool.name);

    expect(toolNames).toContain("wiki_stage_observation");
    expect(toolNames).toContain("wiki_commit_observation");
    expect(toolNames).not.toContain("wiki_write_observation");
    expect(toolNames).not.toContain("wiki_append_observations");
    expect(toolNames).not.toContain("wiki_append_ledger");
    expect(toolNames).not.toContain("wiki_write_feature_registry");
  });

  it("uses append-only observation writes during segmented ingest", () => {
    const toolNames = createWikiTools(transcript, "ingest-segmented").map((tool) => tool.name);

    expect(toolNames).toContain("wiki_append_observations");
    expect(toolNames).not.toContain("wiki_stage_observation");
    expect(toolNames).not.toContain("wiki_commit_observation");
    expect(toolNames).not.toContain("wiki_append_ledger");
    expect(toolNames).not.toContain("wiki_write_feature_registry");
  });

  it("uses append-only writes during segmented claim extraction", () => {
    const toolNames = createWikiTools(transcript, "claims-segmented").map((tool) => tool.name);

    expect(toolNames).toEqual(["wiki_append_claims"]);
  });

  it("exposes feature registry writes during review", () => {
    for (const command of ["review", "review-segmented"] as const) {
      const toolNames = createWikiTools(transcript, command).map((tool) => tool.name);

      expect(toolNames).toContain("wiki_write_observation");
      expect(toolNames).toContain("wiki_update_review_statuses");
      expect(toolNames).not.toContain("wiki_stage_observation");
      expect(toolNames).not.toContain("wiki_commit_observation");
      expect(toolNames).not.toContain("wiki_append_observations");
      expect(toolNames).not.toContain("wiki_append_ledger");
      expect(toolNames).toContain("wiki_write_feature_registry");
    }
  });

  it("validates synced registry content while preserving valid ingest additions", () => {
    const previousContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** techne_mapping
- **proposed_name:** craft_example
- **status:** accepted
- **observations:** obs_euthyphro_0001
- **notes:** First review note line.
  Continuation line kept by review.
`;
    const links = [
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_002",
        featureFamily: "Craft  Analogy",
        featureLabel: "New Craft Example",
      },
    ];

    const synced = syncedRegistryOrThrow(previousContent, links, {
      knownLinks: [
        {
          observationId: "obs_euthyphro_0001",
          featureId: "feature_candidate_001",
          featureFamily: "craft_analogy",
          featureLabel: "craft_example",
        },
        ...links,
      ],
    });

    expect(synced).toContain("- **family:** techne_mapping");
    expect(synced).toContain("Continuation line kept by review.");
    expect(synced).toContain("- **family:** craft_analogy");
    expect(synced).toContain("- **proposed_name:** new_craft_example");
  });

  it("throws and records a transcript event when synced registry validation fails", () => {
    const events: Array<Record<string, unknown>> = [];
    const recordingTranscript: TranscriptWriter = {
      ...transcript,
      write: (type, data = {}) => events.push({ type, ...data }),
    };
    const previousContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** definition_ladder
- **proposed_name:** definition_requested
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** Existing note.
`;

    expect(() =>
      syncedRegistryOrThrow(previousContent, [], {
        transcript: recordingTranscript,
        sourcePath: "wiki/observations/euthyphro.md",
        knownLinks: [],
      }),
    ).toThrow("Internal error: ingest registry sync produced an invalid registry; nothing was written.");
    expect(events[0]).toMatchObject({
      type: "wiki_tool_sync_feature_registry_rejected",
      path: "wiki/features-so-far.md",
      sourcePath: "wiki/observations/euthyphro.md",
      issueCount: expect.any(Number),
    });
  });
});

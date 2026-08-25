import { describe, expect, it } from "bun:test";
import { formatIngestLogEntry, ingestLogCountsFromLinks } from "./ingest-log.js";
import type { ObservationFeatureLink } from "./observation-feature-index.js";

describe("ingest log", () => {
  it("formats entries with stable field order", () => {
    expect(
      formatIngestLogEntry({
        command: "ingest",
        dialogue: "euthyphro",
        runId: "run-123",
        timestamp: "2026-06-13T12:00:00.000Z",
        provider: "openai",
        model: "gpt-test",
        profile: "default",
        observationCount: 3,
        spanRange: "2a-4c",
        familyCounts: [
          { family: "craft_analogy", observations: 1 },
          { family: "elenchus", observations: 2 },
        ],
        newFeatureIds: ["feature_candidate_002", "feature_candidate_010"],
      }),
    ).toBe(`## 2026-06-13T12:00:00.000Z ingest euthyphro

- run_id: run-123
- provider/model: openai/gpt-test (profile default)
- observations: 3
- span_range: 2a-4c
- families: craft_analogy=1, elenchus=2
- new_candidates: feature_candidate_002, feature_candidate_010`);
  });

  it("counts unique observations by family", () => {
    const links: ObservationFeatureLink[] = [
      {
        observationId: "obs_euthyphro_0001",
        featureId: "feature_candidate_001",
        featureFamily: "elenchus",
        featureLabel: "question_sequence",
      },
      {
        observationId: "obs_euthyphro_0001",
        featureId: "feature_candidate_001",
        featureFamily: "elenchus",
        featureLabel: "question_sequence",
      },
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_002",
        featureFamily: "craft_analogy",
        featureLabel: "craft_example",
      },
    ];

    expect(ingestLogCountsFromLinks(links)).toEqual({
      observationCount: 2,
      familyCounts: [
        { family: "craft_analogy", observations: 1 },
        { family: "elenchus", observations: 1 },
      ],
    });
  });

  it("renders empty candidate lists explicitly", () => {
    expect(
      formatIngestLogEntry({
        command: "review",
        dialogue: "crito",
        runId: "run-456",
        timestamp: "2026-06-13T12:30:00.000Z",
        provider: "openai",
        model: "gpt-test",
        profile: "default",
        observationCount: 0,
        familyCounts: [],
        newFeatureIds: [],
      }),
    ).toContain("- new_candidates: (none)");
  });
});

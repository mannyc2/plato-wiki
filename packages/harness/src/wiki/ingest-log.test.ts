import { describe, expect, it } from "bun:test";
import { formatIngestLogEntry } from "./ingest-log.js";

describe("ingest log", () => {
  it("formats unclassified observation counts in stable field order", () => {
    expect(formatIngestLogEntry({
      command: "ingest",
      dialogue: "euthyphro",
      runId: "run-123",
      timestamp: "2026-06-13T12:00:00.000Z",
      provider: "openai",
      model: "gpt-test",
      profile: "default",
      observationCount: 3,
      spanRange: "2a-4c",
    })).toBe(`## 2026-06-13T12:00:00.000Z ingest euthyphro

- run_id: run-123
- provider/model: openai/gpt-test (profile default)
- observations: 3
- span_range: 2a-4c`);
  });
});

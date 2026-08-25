import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import {
  assertAssistantSucceeded,
  assertNoRejectedAppendWithoutWrite,
  disableDeepSeekThinkingPayload,
  assertObservationWriteOccurred,
  claimSegmentSourceSection,
  existingLabelsByFamilySection,
  featureRegistrySystemSection,
  requireToolChoicePayload,
  reviewLedgerComplete,
} from "./run.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "run-test-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("featureRegistrySystemSection", () => {
  it("injects the compact feature index without registry prose", () => {
    const section = featureRegistrySystemSection(`# Feature Registry

### feature_candidate_001

- **family:** elenchus
- **proposed_name:** test_elencus_label
- **status:** candidate
- **observations:** obs_euthyphro_0001, obs_euthyphro_0002
- **notes:** NOTES_SENTINEL_DO_NOT_INJECT

### feature_candidate_002

- **family:** craft_analogy
- **proposed_name:** test_craft_label
- **status:** accepted
- **observations:** obs_crito_0001
- **notes:** More prose that should stay out of the system prompt.
`);

    expect(section).toContain("## Current features-so-far compact index");
    expect(section).toContain("feature_candidate_001: family=elenchus");
    expect(section).toContain("feature_candidate_002: family=craft_analogy");
    expect(section).toContain("observations=2");
    expect(section).not.toContain("NOTES_SENTINEL_DO_NOT_INJECT");
    expect(section).not.toContain("More prose that should stay out");
  });
});

describe("existingLabelsByFamilySection", () => {
  it("groups existing labels by family and removes duplicates", () => {
    const section = existingLabelsByFamilySection(`# Feature Registry

### feature_candidate_001

- **family:** definition_ladder
- **proposed_name:** definition_by_example
- **status:** candidate
- **observations:** obs_euthyphro_0001

### feature_candidate_002

- **family:** elenchus
- **proposed_name:** assent_chain
- **status:** candidate
- **observations:** obs_meno_0001

### feature_candidate_003

- **family:** definition_ladder
- **proposed_name:** definition_by_example
- **status:** accepted
- **observations:** obs_crito_0001
`);

    expect(section).toContain("## Existing feature labels by family");
    expect(section).toContain("- definition_ladder: definition_by_example");
    expect(section).toContain("- elenchus: assent_chain");
    expect(section.match(/definition_by_example/gu)).toHaveLength(1);
  });
});

describe("reviewLedgerComplete", () => {
  it("is true only when a ledger has statuses and none are unreviewed", () => {
    writeFileSync(
      join(root, "wiki/observations/ion.md"),
      ["review_status: accepted", "review_status: needs_split"].join("\n"),
      "utf8",
    );
    writeFileSync(
      join(root, "wiki/observations/euthyphro.md"),
      ["review_status: accepted", "review_status: unreviewed"].join("\n"),
      "utf8",
    );

    expect(reviewLedgerComplete("ion")).toBe(true);
    expect(reviewLedgerComplete("euthyphro")).toBe(false);
    expect(reviewLedgerComplete("missing")).toBe(false);
  });
});

describe("claimSegmentSourceSection", () => {
  it("injects only the selected Greek source span with segment metadata", () => {
    mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
    const source = "{2a} alpha beta {2b} gamma delta {3a} epsilon";
    writeFileSync(join(root, "raw/plato/greek/ion.txt"), source, "utf8");
    const startChar = source.indexOf("{2b}");
    const endChar = source.indexOf("{3a}");

    const section = claimSegmentSourceSection("ion", {
      dialogue: "ion",
      span: "2b",
      startMarker: "2b",
      endMarker: "2b",
      startChar,
      endChar,
      markerCount: 1,
      sourceBytes: endChar - startChar,
      existingClaimIds: [],
      completed: false,
    });

    expect(section).toContain("Source path: raw/plato/greek/ion.txt");
    expect(section).toContain("Segment: 2b");
    expect(section).toContain(`Start char: ${startChar}`);
    expect(section).toContain(`End char: ${endChar}`);
    expect(section).toContain("Allowed citation markers for this segment.");
    expect(section).toContain('"allowed_markers": [');
    expect(section).toContain('"2b"');
    expect(section).not.toContain('"text_sha256"');
    expect(section).toContain("Segment source text:");
    expect(section).toContain("{2b} gamma delta ");
    expect(section).not.toContain("{2a} alpha beta");
    expect(section).not.toContain("{3a} epsilon");
  });

  it("does not expand large segments into quadratic source_ref objects", () => {
    mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
    const source = Array.from({ length: 40 }, (_, index) => `{${index + 1}a} alpha`).join(" ");
    writeFileSync(join(root, "raw/plato/greek/laws.txt"), source, "utf8");

    const section = claimSegmentSourceSection("laws", {
      dialogue: "laws",
      span: "1a-40a",
      startMarker: "1a",
      endMarker: "40a",
      startChar: 0,
      endChar: source.length,
      markerCount: 40,
      sourceBytes: source.length,
      existingClaimIds: [],
      completed: false,
    });

    expect(section).toContain('"allowed_markers": [');
    expect(section).toContain('"40a"');
    expect(section).not.toContain('"text_sha256"');
  });
});

describe("assertObservationWriteOccurred", () => {
  it("rejects no-op ingest completions", () => {
    expect(() => assertObservationWriteOccurred(2, 2, "Segmented ingest symposium segment 1")).toThrow(
      "Segmented ingest symposium segment 1 completed without writing observations; refusing to continue.",
    );
  });

  it("allows ingest completions after an observation write", () => {
    expect(() => assertObservationWriteOccurred(2, 3, "Segmented ingest symposium segment 1")).not.toThrow();
  });
});

describe("assertNoRejectedAppendWithoutWrite", () => {
  it("rejects segment no-op completions after append validation failures", () => {
    expect(() =>
      assertNoRejectedAppendWithoutWrite(2, 2, 0, 1, "Segmented ingest republic segment 1"),
    ).toThrow(
      "Segmented ingest republic segment 1 had rejected append attempts but no accepted observations; refusing to mark no_observations.",
    );
  });

  it("allows genuine no-observation completions with no append rejection", () => {
    expect(() =>
      assertNoRejectedAppendWithoutWrite(2, 2, 0, 0, "Segmented ingest republic segment 1"),
    ).not.toThrow();
  });

  it("allows completions with accepted writes even after earlier rejections", () => {
    expect(() =>
      assertNoRejectedAppendWithoutWrite(2, 3, 0, 1, "Segmented ingest republic segment 1"),
    ).not.toThrow();
  });
});

describe("assertAssistantSucceeded", () => {
  it("surfaces provider stop errors before write checks", () => {
    expect(() =>
      assertAssistantSucceeded(
        { stopReason: "error", errorMessage: "402 Insufficient Balance" },
        "Segmented ingest symposium segment 1",
      ),
    ).toThrow("Segmented ingest symposium segment 1 failed with stopReason=error: 402 Insufficient Balance");
  });

  it("allows normal assistant stops", () => {
    expect(() => assertAssistantSucceeded({ stopReason: "stop" }, "Segmented ingest symposium segment 1")).not.toThrow();
  });
});

describe("disableDeepSeekThinkingPayload", () => {
  it("forces thinking off and removes reasoning effort", () => {
    const { payload, changed } = disableDeepSeekThinkingPayload({
      model: "deepseek-ai/DeepSeek-V4-Flash",
      reasoning_effort: "high",
      thinking: { type: "enabled" },
    });

    expect(changed).toBe(true);
    expect(payload).toEqual({
      model: "deepseek-ai/DeepSeek-V4-Flash",
      thinking: { type: "disabled" },
    });
  });

  it("leaves an already disabled payload unchanged", () => {
    const original = {
      model: "deepseek-ai/DeepSeek-V4-Flash",
      thinking: { type: "disabled" },
    };
    const { payload, changed } = disableDeepSeekThinkingPayload(original);

    expect(changed).toBe(false);
    expect(payload).toBe(original);
  });
});

describe("requireToolChoicePayload", () => {
  it("requires a tool call when tools are present", () => {
    const { payload, changed } = requireToolChoicePayload({
      model: "deepseek-ai/DeepSeek-V4-Flash",
      tools: [{ type: "function", function: { name: "wiki_append_observations" } }],
    });

    expect(changed).toBe(true);
    expect(payload).toEqual({
      model: "deepseek-ai/DeepSeek-V4-Flash",
      tools: [{ type: "function", function: { name: "wiki_append_observations" } }],
      tool_choice: "required",
    });
  });

  it("does not change payloads without tools", () => {
    const original = { model: "deepseek-ai/DeepSeek-V4-Flash" };
    const { payload, changed } = requireToolChoicePayload(original);

    expect(changed).toBe(false);
    expect(payload).toBe(original);
  });
});

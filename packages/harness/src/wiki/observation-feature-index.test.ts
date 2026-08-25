import { describe, expect, it } from "bun:test";
import {
  extractObservationFeatureLinks,
  formatObservationFeatureIndex,
  normalizeObservationFeatureIds,
  reconcileFeatureRegistryContent,
  syncFeatureRegistryContent,
} from "./observation-feature-index.js";

const emptyRegistry = `# Features So Far

Append new feature candidates here when no existing candidate fits. Reuse
existing candidates when possible. Rename, merge, or split candidates only
during a review pass.

## Feature Candidates

None yet.
`;

function observationBlock(
  observationId: string,
  featureLabel: string,
  featureId?: string,
  featureFamily = "definition_ladder",
) {
  return `\`\`\`yaml
observation_id: ${observationId}
source_work: Euthyphro
stephanus_span: 5d
source_ref:
  source_path: raw/plato/greek/euthyphro.txt
  stephanus_span: 5d
  start_marker: 5d
  end_marker: 5d
  start_char: 0
  end_char: 1
  text_sha256: "unused"
greek_terms: []
english_gloss: ""
${featureId ? `feature_id: ${featureId}\n` : ""}feature_label: ${featureLabel}
feature_family: ${featureFamily}
observation: Socrates asks a question.
textual_basis: The question is in the cited span.
limits: This records the question only.
review_status: unreviewed
\`\`\``;
}

describe("observation feature index", () => {
  it("assigns stable feature ids from feature labels and rewrites model ids", () => {
    const content = [
      "# Euthyphro",
      observationBlock("obs_euthyphro_0001", "Definition By Form Requested", "feature_candidate_999"),
      observationBlock("obs_euthyphro_0002", "definition by form requested"),
      observationBlock("obs_euthyphro_0003", "myth cited as evidence"),
    ].join("\n\n");

    const normalized = normalizeObservationFeatureIds(content, emptyRegistry);
    const links = extractObservationFeatureLinks(normalized.content);

    expect(links).toEqual([
      {
        observationId: "obs_euthyphro_0001",
        featureId: "feature_candidate_001",
        featureFamily: "definition_ladder",
        featureLabel: "definition_by_form_requested",
      },
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_001",
        featureFamily: "definition_ladder",
        featureLabel: "definition_by_form_requested",
      },
      {
        observationId: "obs_euthyphro_0003",
        featureId: "feature_candidate_002",
        featureFamily: "definition_ladder",
        featureLabel: "myth_cited_as_evidence",
      },
    ]);
    expect(normalized.content).toContain("feature_id: feature_candidate_001");
    expect(normalized.content).not.toContain("feature_candidate_999");
  });

  it("reuses existing registry ids by proposed_name", () => {
    const registry = `# Features So Far

## Feature Candidates

### feature_candidate_007
- **proposed_name:** definition_by_form_requested
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** Existing note.
`;
    const normalized = normalizeObservationFeatureIds(
      observationBlock("obs_euthyphro_0002", "definition_by_form_requested"),
      registry,
    );

    expect(extractObservationFeatureLinks(normalized.content)[0]).toMatchObject({
      observationId: "obs_euthyphro_0002",
      featureId: "feature_candidate_007",
      featureFamily: "definition_ladder",
      featureLabel: "definition_by_form_requested",
    });
  });

  it("normalizes feature families and passes through unknown families", () => {
    const content = [
      "# Euthyphro",
      observationBlock("obs_euthyphro_0001", "setup stated", undefined, "Scene Legal Setup"),
      observationBlock("obs_euthyphro_0002", "setup stated", undefined, "new local signal"),
    ].join("\n\n");

    const normalized = normalizeObservationFeatureIds(content, emptyRegistry);
    const links = extractObservationFeatureLinks(normalized.content);

    expect(links).toEqual([
      {
        observationId: "obs_euthyphro_0001",
        featureId: "feature_candidate_001",
        featureFamily: "dramatic_case_setup",
        featureLabel: "setup_stated",
      },
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_002",
        featureFamily: "new_local_signal",
        featureLabel: "setup_stated",
      },
    ]);
    expect(normalized.content).toContain("feature_family: dramatic_case_setup");
    expect(normalized.content).toContain("feature_family: new_local_signal");
  });

  it("syncs feature registry content from accepted observation links", () => {
    const links = [
      {
        observationId: "obs_euthyphro_0001",
        featureId: "feature_candidate_001",
        featureFamily: "definition_ladder",
        featureLabel: "definition_by_form_requested",
      },
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_001",
        featureFamily: "definition_ladder",
        featureLabel: "definition_by_form_requested",
      },
    ];

    const synced = syncFeatureRegistryContent(emptyRegistry, links);

    expect(synced).toContain("### feature_candidate_001");
    expect(synced).toContain("- **family:** definition_ladder");
    expect(synced).toContain("- **proposed_name:** definition_by_form_requested");
    expect(synced).toContain("- **observations:** obs_euthyphro_0001, obs_euthyphro_0002");
    expect(synced).not.toContain("None yet.");
    expect(formatObservationFeatureIndex(links)).toContain("feature_candidate_001");
  });

  it("reconciles the registry exactly to observation feature links", () => {
    const registry = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** definition_ladder
- **proposed_name:** old_label
- **status:** accepted
- **observations:** obs_euthyphro_0001, obs_euthyphro_0002
- **notes:** Existing note.

### feature_candidate_002
- **family:** definition_ladder
- **proposed_name:** stale_label
- **status:** candidate
- **observations:** obs_euthyphro_0003
- **notes:** Stale note.
`;

    const reconciled = reconcileFeatureRegistryContent(registry, [
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_001",
        featureFamily: "definition_ladder",
        featureLabel: "new_label",
      },
    ]);

    expect(reconciled).toContain("### feature_candidate_001");
    expect(reconciled).toContain("- **proposed_name:** new_label");
    expect(reconciled).toContain("- **status:** accepted");
    expect(reconciled).toContain("- **observations:** obs_euthyphro_0002");
    expect(reconciled).not.toContain("obs_euthyphro_0001");
    expect(reconciled).not.toContain("feature_candidate_002");
  });

  it("preserves existing aliased families and multiline notes during sync", () => {
    const registry = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** techne_mapping
- **proposed_name:** craft_example
- **status:** accepted
- **observations:** obs_euthyphro_0001
- **notes:** First review note line.
  Continuation line kept by review.
`;
    const synced = syncFeatureRegistryContent(registry, [
      {
        observationId: "obs_euthyphro_0002",
        featureId: "feature_candidate_002",
        featureFamily: "definition_ladder",
        featureLabel: "definition_requested",
      },
    ]);

    expect(synced).toContain("- **family:** techne_mapping");
    expect(synced).toContain("- **notes:** First review note line.\n  Continuation line kept by review.");
    expect(synced).toContain("### feature_candidate_002");
  });

  it("normalizes new registry entries from incoming links", () => {
    const synced = syncFeatureRegistryContent(emptyRegistry, [
      {
        observationId: "obs_euthyphro_0001",
        featureId: "feature_candidate_001",
        featureFamily: "Craft  Analogy",
        featureLabel: "Definition Requested",
      },
    ]);

    expect(synced).toContain("- **family:** craft_analogy");
    expect(synced).toContain("- **proposed_name:** definition_requested");
  });

  it("reuses ids by normalized family and label while preserving registry text", () => {
    const registry = `# Features So Far

## Feature Candidates

### feature_candidate_009
- **family:** techne_mapping
- **proposed_name:** craft_example
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** Existing review wording.
`;
    const normalized = normalizeObservationFeatureIds(
      observationBlock("obs_euthyphro_0002", "craft example", undefined, "craft_analogy"),
      registry,
    );
    const synced = syncFeatureRegistryContent(registry, normalized.links);

    expect(normalized.links[0]).toMatchObject({
      featureId: "feature_candidate_009",
      featureFamily: "craft_analogy",
      featureLabel: "craft_example",
    });
    expect(synced).toContain("### feature_candidate_009");
    expect(synced).toContain("- **family:** techne_mapping");
    expect(synced).toContain("- **observations:** obs_euthyphro_0001, obs_euthyphro_0002");
  });
});

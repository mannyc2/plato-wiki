import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  applyLabelMergeMap,
  planLabelMergeMap,
  rewriteCommentaryDossierReferences,
  validateLabelMergeMap,
  writeLabelDependentArtifacts,
  type LabelMergeMap,
} from "./labels-normalization.js";
import { collectLabelAudit, writeLabelAudit } from "./labels.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeRegistry(entries: string[]) {
  writeFileSync(
    join(root, "wiki/features-so-far.md"),
    `# Features So Far

Append new feature candidates here when no existing candidate fits. Reuse
existing candidates when possible. Rename, merge, or split candidates only
during a review pass.

## Feature Candidates

${entries.join("\n\n")}
`,
    "utf8",
  );
}

function registryEntry({
  id,
  family,
  label,
  observations,
}: {
  id: string;
  family: string;
  label: string;
  observations: string[];
}) {
  return `### ${id}
- **family:** ${family}
- **proposed_name:** ${label}
- **status:** candidate
- **observations:** ${observations.join(", ")}
- **notes:** test fixture`;
}

function record({
  observationId,
  family,
  label,
  featureId,
  observation = "Original observation prose stays fixed.",
}: {
  observationId: string;
  family: string;
  label: string;
  featureId: string;
  observation?: string;
}) {
  return `\`\`\`yaml
observation_id: ${observationId}
source_work: Test
stephanus_span: 1a
feature_family: ${family}
feature_id: ${featureId}
feature_label: ${label}
observation: ${observation}
textual_basis: Basis stays fixed.
limits: Limits stay fixed.
review_status: accepted
\`\`\``;
}

function writeLedger(name: string, records: string[]) {
  writeFileSync(join(root, "wiki/observations", name), records.join("\n\n"), "utf8");
}

function writeMap(path: string, map: LabelMergeMap) {
  mkdirSync(join(root, "wiki/label-consolidation"), { recursive: true });
  writeFileSync(join(root, path), `${JSON.stringify(map, null, 2)}\n`, "utf8");
}

function validMap(dispositions: LabelMergeMap["dispositions"]): LabelMergeMap {
  const metrics = collectLabelAudit();
  return {
    version: 1,
    standard: "docs/label-normalization-standards.md",
    sourceAudit: "wiki/label-audit.md",
    sourceMetrics: {
      totalLabels: metrics.totalLabels,
      totalObservations: metrics.totalObservations,
      singletonLabels: metrics.singletonLabels,
      crossDialogueLabels: metrics.crossDialogueLabels,
    },
    dispositions,
  };
}

describe("commentary dossier reference rewrites", () => {
  const map: LabelMergeMap = {
    version: 1,
    standard: "docs/label-normalization-standards.md",
    sourceAudit: "wiki/label-audit.md",
    sourceMetrics: { totalLabels: 0, totalObservations: 0, singletonLabels: 0, crossDialogueLabels: 0 },
    dispositions: [
      {
        family: "myth_demarcation",
        label: "poetic_quotation_as_evidence",
        action: "merge",
        to: { family: "myth_demarcation", label: "poetic_citation_as_argument" },
        reason: "Both labels perform the same evidentiary citation function.",
      },
      {
        family: "myth_demarcation",
        label: "poetic_citation_as_argument",
        action: "keep",
        reason: "Distinct citation function retained as the stable target.",
      },
    ],
  };

  it("leaves an unchanged quoted dossier line byte-identical", () => {
    const content = 'cites:\n  dossiers: ["prosopography/sophist_self_presentation"]\n';

    expect(rewriteCommentaryDossierReferences(content, map, "frame_depth")).toEqual({
      content,
      changed: false,
    });
  });

  it("preserves quoting while replacing only the merged dossier key", () => {
    const content =
      'cites:\n  dossiers: ["elenchus/forced_alternative", "myth_demarcation/poetic_quotation_as_evidence"]\n';

    expect(rewriteCommentaryDossierReferences(content, map, "myth_demarcation")).toEqual({
      content:
        'cites:\n  dossiers: ["elenchus/forced_alternative", "myth_demarcation/poetic_citation_as_argument"]\n',
      changed: true,
    });
  });
});

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "label-normalization-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  mkdirSync(join(root, "wiki/label-consolidation"), { recursive: true });
  writeRegistry([]);
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("label normalization maps", () => {
  it("refreshes every label-dependent artifact before building the site", () => {
    const calls: string[] = [];
    const result = writeLabelDependentArtifacts({
      audit: () => {
        calls.push("audit");
        return { path: "wiki/label-audit.md" };
      },
      quality: () => {
        calls.push("quality");
        return { path: "wiki/label-quality.md" };
      },
      clusters: () => {
        calls.push("clusters");
        return [{}, {}];
      },
      dossiers: () => {
        calls.push("dossiers");
        return [{}, {}, {}];
      },
      site: () => {
        calls.push("site");
        return { pages: [{}, {}, {}, {}] };
      },
    });

    expect(calls).toEqual(["audit", "quality", "clusters", "dossiers", "site"]);
    expect(result).toEqual({
      labelAuditPath: "wiki/label-audit.md",
      labelQualityPath: "wiki/label-quality.md",
      clusterFiles: 2,
      dossierFiles: 3,
      sitePages: 4,
    });
  });

  it("plans a full skeleton with singleton todos and reused-label keeps", () => {
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "elenchus",
        label: "shared_move",
        featureId: "feature_candidate_001",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "closure_type",
        label: "single_move",
        featureId: "feature_candidate_002",
      }),
    ]);
    writeLedger("crito.md", [
      record({
        observationId: "obs_crito_0001",
        family: "elenchus",
        label: "shared_move",
        featureId: "feature_candidate_001",
      }),
    ]);

    const written = planLabelMergeMap("wiki/label-consolidation/test.json");

    expect(written.path).toBe("wiki/label-consolidation/test.json");
    expect(written.map.dispositions).toHaveLength(2);
    expect(written.todoCount).toBe(1);
    expect(written.map.dispositions.find((disposition) => disposition.label === "shared_move")?.action).toBe("keep");
    expect(written.map.dispositions.find((disposition) => disposition.label === "single_move")?.action).toBe("todo");
    expect(readFileSync(join(root, "wiki/label-audit.md"), "utf8")).toContain("total_labels: 2");
  });

  it("rejects todos, cycles, and topic-only rationales", () => {
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "elenchus",
        label: "source_move",
        featureId: "feature_candidate_001",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "elenchus",
        label: "target_move",
        featureId: "feature_candidate_002",
      }),
    ]);
    writeLabelAudit();

    writeMap(
      "wiki/label-consolidation/todo.json",
      validMap([
        { family: "elenchus", label: "source_move", action: "todo", reason: "" },
        {
          family: "elenchus",
          label: "target_move",
          action: "keep",
          reason: "Structurally distinct textual function in this test fixture.",
        },
      ]),
    );
    expect(validateLabelMergeMap("wiki/label-consolidation/todo.json").failures).toContain(
      "elenchus/source_move: action must be merge or keep, not todo",
    );

    writeMap(
      "wiki/label-consolidation/topic.json",
      validMap([
        {
          family: "elenchus",
          label: "source_move",
          action: "merge",
          to: { family: "elenchus", label: "target_move" },
          reason: "Both are about Socrates.",
        },
        {
          family: "elenchus",
          label: "target_move",
          action: "keep",
          reason: "Structurally distinct textual function in this test fixture.",
        },
      ]),
    );
    expect(validateLabelMergeMap("wiki/label-consolidation/topic.json").failures).toContain(
      "elenchus/source_move: reason is topic-only or identity-only, not a textual-function rationale",
    );

    writeMap(
      "wiki/label-consolidation/cycle.json",
      validMap([
        {
          family: "elenchus",
          label: "source_move",
          action: "merge",
          to: { family: "elenchus", label: "target_move" },
          reason: "Both labels share the same textual function as an argument move in the test fixture.",
        },
        {
          family: "elenchus",
          label: "target_move",
          action: "merge",
          to: { family: "elenchus", label: "source_move" },
          reason: "Both labels share the same textual function as an argument move in the test fixture.",
        },
      ]),
    );
    expect(validateLabelMergeMap("wiki/label-consolidation/cycle.json").failures).toContain(
      "elenchus/source_move: merge graph contains a cycle",
    );
  });

  it("requires explicit family-change justification only for cross-family merges", () => {
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "elenchus",
        label: "source_move",
        featureId: "feature_candidate_001",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "closure_type",
        label: "target_move",
        featureId: "feature_candidate_002",
      }),
      record({
        observationId: "obs_meno_0003",
        family: "closure_type",
        label: "same_family_source",
        featureId: "feature_candidate_003",
      }),
    ]);
    writeLabelAudit();

    writeMap(
      "wiki/label-consolidation/family-change.json",
      validMap([
        {
          family: "elenchus",
          label: "source_move",
          action: "merge",
          to: { family: "closure_type", label: "target_move" },
          familyChange: true,
          reason: "Both labels share the textual function of marking a closure move in the test fixture.",
        },
        {
          family: "closure_type",
          label: "same_family_source",
          action: "merge",
          to: { family: "closure_type", label: "target_move" },
          familyChange: true,
          reason:
            "Both labels share the textual function of marking a closure move in the same target family.",
        },
        {
          family: "closure_type",
          label: "target_move",
          action: "keep",
          reason: "Structurally distinct textual function for closure moves across the corpus.",
        },
      ]),
    );

    const failures = validateLabelMergeMap("wiki/label-consolidation/family-change.json").failures;

    expect(failures).toContain(
      "elenchus/source_move: family-changing merge reason must explicitly justify the family change",
    );
    expect(failures).toContain(
      "closure_type/same_family_source: familyChange=true is only allowed when the target family differs",
    );
  });

  it("applies a merge without editing observation prose fields", () => {
    writeRegistry([
      registryEntry({
        id: "feature_candidate_001",
        family: "definition_ladder",
        label: "definition_by_example",
        observations: ["obs_meno_0001"],
      }),
      registryEntry({
        id: "feature_candidate_010",
        family: "definition_ladder",
        label: "definition_proposal",
        observations: ["obs_meno_0002"],
      }),
    ]);
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "definition_ladder",
        label: "definition_by_example",
        featureId: "feature_candidate_001",
        observation: "This local observation sentence must not change.",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "definition_ladder",
        label: "definition_proposal",
        featureId: "feature_candidate_010",
      }),
    ]);
    writeFileSync(
      join(root, "wiki/commentary/meno.md"),
      "cites:\n  dossiers: [definition_ladder/definition_by_example, definition_ladder/definition_proposal]\n",
      "utf8",
    );
    writeLabelAudit();
    writeMap(
      "wiki/label-consolidation/apply.json",
      validMap([
        {
          family: "definition_ladder",
          label: "definition_by_example",
          action: "merge",
          to: { family: "definition_ladder", label: "definition_proposal" },
          reason:
            "Both labels share the textual function of offering a definition proposal; local example detail remains in observation prose.",
        },
        {
          family: "definition_ladder",
          label: "definition_proposal",
          action: "keep",
          reason: "Structurally distinct textual function for definition proposals across the corpus.",
        },
      ]),
    );

    const result = applyLabelMergeMap("wiki/label-consolidation/apply.json", { writeDerived: false });
    const ledger = readFileSync(join(root, "wiki/observations/meno.md"), "utf8");
    const registry = readFileSync(join(root, "wiki/features-so-far.md"), "utf8");
    const commentary = readFileSync(join(root, "wiki/commentary/meno.md"), "utf8");

    expect(result.changedObservations).toBe(1);
    expect(result.updatedLedgers).toEqual(["wiki/observations/meno.md"]);
    expect(result.updatedCommentaryLedgers).toEqual(["wiki/commentary/meno.md"]);
    expect(ledger).toContain("feature_family: definition_ladder");
    expect(ledger).toContain("feature_id: feature_candidate_010");
    expect(ledger).toContain("feature_label: definition_proposal");
    expect(ledger).toContain("This local observation sentence must not change.");
    expect(ledger).toContain("textual_basis: Basis stays fixed.");
    expect(ledger).toContain("limits: Limits stay fixed.");
    expect(registry).not.toContain("feature_candidate_001");
    expect(registry).toContain("feature_candidate_010");
    expect(registry).toContain("obs_meno_0001, obs_meno_0002");
    expect(commentary).toContain("dossiers: [definition_ladder/definition_proposal]");
    expect(commentary).not.toContain("definition_ladder/definition_by_example");
  });

  it("allows family-scoped validation and apply while other families remain todo", () => {
    writeRegistry([
      registryEntry({
        id: "feature_candidate_001",
        family: "definition_ladder",
        label: "definition_by_example",
        observations: ["obs_meno_0001"],
      }),
      registryEntry({
        id: "feature_candidate_010",
        family: "definition_ladder",
        label: "definition_proposal",
        observations: ["obs_meno_0002"],
      }),
      registryEntry({
        id: "feature_candidate_020",
        family: "closure_type",
        label: "final_words",
        observations: ["obs_meno_0003"],
      }),
    ]);
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "definition_ladder",
        label: "definition_by_example",
        featureId: "feature_candidate_001",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "definition_ladder",
        label: "definition_proposal",
        featureId: "feature_candidate_010",
      }),
      record({
        observationId: "obs_meno_0003",
        family: "closure_type",
        label: "final_words",
        featureId: "feature_candidate_020",
      }),
    ]);
    writeLabelAudit();
    writeMap(
      "wiki/label-consolidation/family-apply.json",
      validMap([
        {
          family: "definition_ladder",
          label: "definition_by_example",
          action: "merge",
          to: { family: "definition_ladder", label: "definition_proposal" },
          reason:
            "Both labels share the textual function of offering a definition proposal; local example detail remains in observation prose.",
        },
        {
          family: "definition_ladder",
          label: "definition_proposal",
          action: "keep",
          reason: "Structurally distinct textual function for definition proposals across the corpus.",
        },
        { family: "closure_type", label: "final_words", action: "todo", reason: "" },
      ]),
    );

    const full = validateLabelMergeMap("wiki/label-consolidation/family-apply.json");
    const scoped = validateLabelMergeMap("wiki/label-consolidation/family-apply.json", {
      family: "definition_ladder",
    });

    expect(full.failures).toContain("closure_type/final_words: action must be merge or keep, not todo");
    expect(scoped.failures).toEqual([]);

    const result = applyLabelMergeMap("wiki/label-consolidation/family-apply.json", {
      family: "definition_ladder",
      writeDerived: false,
    });
    const ledger = readFileSync(join(root, "wiki/observations/meno.md"), "utf8");

    expect(result.changedObservations).toBe(1);
    expect(ledger).toContain("observation_id: obs_meno_0001");
    expect(ledger).toContain("feature_label: definition_proposal");
    expect(ledger).toContain("observation_id: obs_meno_0003");
    expect(ledger).toContain("feature_label: final_words");
  });
});

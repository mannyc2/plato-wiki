import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { getRepoRoot } from "./paths.js";
import {
  dialogueFromObservationId,
  fieldValueOrEmpty,
  listObservationLedgerPaths,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";

export type LabelAuditObservation = {
  observationId: string;
  dialogue: string;
  stephanusSpan: string;
  reviewStatus: string;
};

export type LabelAuditEntry = {
  family: string;
  label: string;
  featureIds: string[];
  observations: LabelAuditObservation[];
  dialogues: string[];
  status: "singleton" | "within_dialogue_reuse" | "cross_dialogue";
};

export type LabelAuditFamily = {
  family: string;
  labelCount: number;
  singletonCount: number;
  observationCount: number;
  entries: LabelAuditEntry[];
};

export type LabelAuditReport = {
  totalLabels: number;
  totalObservations: number;
  singletonLabels: number;
  crossDialogueLabels: number;
  families: LabelAuditFamily[];
};

export type WrittenLabelAudit = {
  path: string;
  report: LabelAuditReport;
};

function observationLedgerPaths() {
  return listObservationLedgerPaths({ absolute: true });
}

function labelKey(family: string, label: string) {
  return `${family}::${label}`;
}

function labelStatus(observations: LabelAuditObservation[]): LabelAuditEntry["status"] {
  if (observations.length === 1) return "singleton";
  return new Set(observations.map((observation) => observation.dialogue)).size >= 2
    ? "cross_dialogue"
    : "within_dialogue_reuse";
}

export function collectLabelAudit(): LabelAuditReport {
  const entries = new Map<
    string,
    {
      family: string;
      label: string;
      featureIds: Set<string>;
      observations: LabelAuditObservation[];
    }
  >();

  for (const path of observationLedgerPaths()) {
    const content = readFileSync(path, "utf8");
    for (const block of observationYamlBlocks(content)) {
      const observationId = fieldValueOrEmpty(block, "observation_id");
      const family = fieldValueOrEmpty(block, "feature_family");
      const label = fieldValueOrEmpty(block, "feature_label");
      if (!observationId || !family || !label) continue;

      const key = labelKey(family, label);
      const entry = entries.get(key) ?? {
        family,
        label,
        featureIds: new Set<string>(),
        observations: [],
      };
      const featureId = fieldValueOrEmpty(block, "feature_id");
      if (featureId) entry.featureIds.add(featureId);
      entry.observations.push({
        observationId,
        dialogue: dialogueFromObservationId(observationId, "unknown"),
        stephanusSpan: fieldValueOrEmpty(block, "stephanus_span"),
        reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
      });
      entries.set(key, entry);
    }
  }

  const auditEntries: LabelAuditEntry[] = [...entries.values()]
    .map((entry) => {
      const observations = entry.observations.sort((a, b) => a.observationId.localeCompare(b.observationId));
      return {
        family: entry.family,
        label: entry.label,
        featureIds: [...entry.featureIds].sort(),
        observations,
        dialogues: [...new Set(observations.map((observation) => observation.dialogue))].sort(),
        status: labelStatus(observations),
      };
    })
    .sort((a, b) => a.family.localeCompare(b.family) || a.label.localeCompare(b.label));

  const families = [...new Set(auditEntries.map((entry) => entry.family))]
    .sort()
    .map((family) => {
      const familyEntries = auditEntries.filter((entry) => entry.family === family);
      return {
        family,
        labelCount: familyEntries.length,
        singletonCount: familyEntries.filter((entry) => entry.status === "singleton").length,
        observationCount: familyEntries.reduce((sum, entry) => sum + entry.observations.length, 0),
        entries: familyEntries,
      };
    });

  return {
    totalLabels: auditEntries.length,
    totalObservations: auditEntries.reduce((sum, entry) => sum + entry.observations.length, 0),
    singletonLabels: auditEntries.filter((entry) => entry.status === "singleton").length,
    crossDialogueLabels: auditEntries.filter((entry) => entry.status === "cross_dialogue").length,
    families,
  };
}

function yamlList(values: string[]) {
  return `[${values.join(", ")}]`;
}

export function formatLabelAuditMarkdown(report: LabelAuditReport) {
  const sections = report.families.map((family) => {
    const labels = family.entries
      .map((entry) =>
        [
          `### ${entry.family}/${entry.label}`,
          "",
          "```yaml",
          `status: ${entry.status}`,
          `feature_ids: ${yamlList(entry.featureIds)}`,
          `observation_count: ${entry.observations.length}`,
          `dialogues: ${yamlList(entry.dialogues)}`,
          "observations:",
          ...entry.observations.map(
            (observation) =>
              `  - id: ${observation.observationId}; dialogue: ${observation.dialogue}; span: ${observation.stephanusSpan}; review_status: ${observation.reviewStatus}`,
          ),
          "```",
        ].join("\n"),
      )
      .join("\n\n");

    return [
      `## ${family.family}`,
      "",
      "```yaml",
      `labels: ${family.labelCount}`,
      `singletons: ${family.singletonCount}`,
      `observations: ${family.observationCount}`,
      "```",
      "",
      labels,
    ].join("\n");
  });

  return [
    "# Label Audit",
    "",
    "Generated by `bun run harness labels audit --write`.",
    "",
    "```yaml",
    `total_labels: ${report.totalLabels}`,
    `total_observations: ${report.totalObservations}`,
    `singleton_labels: ${report.singletonLabels}`,
    `cross_dialogue_labels: ${report.crossDialogueLabels}`,
    "```",
    "",
    ...sections,
    "",
  ].join("\n");
}

export function writeLabelAudit({ path = "wiki/label-audit.md" }: { path?: string } = {}): WrittenLabelAudit {
  const report = collectLabelAudit();
  const repoRoot = getRepoRoot();
  const absolutePath = join(repoRoot, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatLabelAuditMarkdown(report), "utf8");
  return { path: relative(repoRoot, absolutePath), report };
}

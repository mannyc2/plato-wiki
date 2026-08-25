import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { getRepoRoot } from "./paths.js";
import {
  dialogueFromObservationId,
  fieldValue,
  listObservationLedgerPaths,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";

export type ClusterObservation = {
  observationId: string;
  dialogue: string;
  stephanusSpan: string;
  featureId: string;
  featureFamily: string;
  featureLabel: string;
  reviewStatus: string;
};

export type ObservationCluster = {
  family: string;
  label: string;
  observations: ClusterObservation[];
  dialogues: string[];
  preConvergence: boolean;
};

export type ClusterGateReport = {
  acceptedObservations: number;
  crossDialogueLabels: number;
  medianNonSingletonObservations: number;
  passed: boolean;
};

export type WrittenClusterArtifact = {
  family: string;
  path: string;
  clusterCount: number;
};

function observationLedgerPaths() {
  return listObservationLedgerPaths({ absolute: true });
}

function observationsFromDisk() {
  const observations: ClusterObservation[] = [];

  for (const path of observationLedgerPaths()) {
    const content = readFileSync(path, "utf8");
    for (const block of observationYamlBlocks(content)) {
      const observationId = fieldValue(block, "observation_id");
      const featureId = fieldValue(block, "feature_id");
      const featureFamily = fieldValue(block, "feature_family");
      const featureLabel = fieldValue(block, "feature_label");
      const stephanusSpan = fieldValue(block, "stephanus_span");
      const reviewStatus = fieldValue(block, "review_status") ?? "unreviewed";
      if (!observationId || !featureId || !featureFamily || !featureLabel || !stephanusSpan) continue;

      observations.push({
        observationId,
        dialogue: dialogueFromObservationId(observationId),
        stephanusSpan,
        featureId,
        featureFamily,
        featureLabel,
        reviewStatus,
      });
    }
  }

  return observations;
}

function median(values: number[]) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;

  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export function clusterGateReport(): ClusterGateReport {
  const observations = observationsFromDisk();
  const labels = new Map<string, { observationIds: Set<string>; dialogues: Set<string> }>();

  for (const observation of observations) {
    const key = `${observation.featureFamily}::${observation.featureLabel}`;
    const entry = labels.get(key) ?? { observationIds: new Set<string>(), dialogues: new Set<string>() };
    entry.observationIds.add(observation.observationId);
    entry.dialogues.add(observation.dialogue);
    labels.set(key, entry);
  }

  const nonSingletonCounts = [...labels.values()]
    .map((entry) => entry.observationIds.size)
    .filter((count) => count > 1);
  const report = {
    acceptedObservations: observations.filter((observation) => observation.reviewStatus === "accepted").length,
    crossDialogueLabels: [...labels.values()].filter((entry) => entry.dialogues.size >= 2).length,
    medianNonSingletonObservations: median(nonSingletonCounts),
  };

  return {
    ...report,
    passed:
      report.acceptedObservations > 0 &&
      report.crossDialogueLabels >= 10 &&
      report.medianNonSingletonObservations >= 2,
  };
}

export function buildClusters({ includeUnreviewed = false }: { includeUnreviewed?: boolean } = {}) {
  const grouped = new Map<string, ObservationCluster>();
  const observations = observationsFromDisk().filter(
    (observation) => observation.reviewStatus === "accepted" || includeUnreviewed,
  );

  for (const observation of observations) {
    const key = `${observation.featureFamily}::${observation.featureLabel}`;
    const cluster =
      grouped.get(key) ??
      {
        family: observation.featureFamily,
        label: observation.featureLabel,
        observations: [],
        dialogues: [],
        preConvergence: includeUnreviewed,
      };
    cluster.observations.push(observation);
    cluster.dialogues = [...new Set(cluster.observations.map((entry) => entry.dialogue))].sort();
    grouped.set(key, cluster);
  }

  return [...grouped.values()]
    .map((cluster) => ({
      ...cluster,
      observations: cluster.observations.sort((a, b) => a.observationId.localeCompare(b.observationId)),
    }))
    .sort((a, b) => a.family.localeCompare(b.family) || a.label.localeCompare(b.label));
}

function clusterId(cluster: ObservationCluster) {
  return `cluster_${cluster.family}_${cluster.label}`;
}

export function formatClusterFamilyMarkdown(family: string, clusters: ObservationCluster[]) {
  const body = clusters
    .map((cluster) =>
      [
        "```yaml",
        `cluster_id: ${clusterId(cluster)}`,
        `feature_family: ${cluster.family}`,
        `feature_label: ${cluster.label}`,
        `observation_ids: [${cluster.observations.map((observation) => observation.observationId).join(", ")}]`,
        `dialogues: [${cluster.dialogues.join(", ")}]`,
        "spans:",
        ...cluster.observations.map((observation) => `  ${observation.observationId}: ${observation.stephanusSpan}`),
        "```",
      ].join("\n"),
    )
    .join("\n\n");

  return [`# Cluster Family: ${family}`, "", body, ""].join("\n");
}

export function writeClusterArtifacts({ includeUnreviewed = false }: { includeUnreviewed?: boolean } = {}) {
  if (includeUnreviewed) {
    throw new Error("Refusing to write pre-convergence preview clusters. Omit --include-unreviewed.");
  }

  const gate = clusterGateReport();
  if (!gate.passed) {
    throw new Error(
      [
        "Cluster convergence gate is not met.",
        `accepted observations: ${gate.acceptedObservations} (must be > 0)`,
        `cross-dialogue labels: ${gate.crossDialogueLabels} (must be >= 10)`,
        `median non-singleton observations: ${gate.medianNonSingletonObservations} (must be >= 2)`,
      ].join("\n"),
    );
  }

  const clusters = buildClusters();
  const clustersByFamily = new Map<string, ObservationCluster[]>();
  for (const cluster of clusters) {
    const familyClusters = clustersByFamily.get(cluster.family) ?? [];
    familyClusters.push(cluster);
    clustersByFamily.set(cluster.family, familyClusters);
  }

  const repoRoot = getRepoRoot();
  const clusterDir = join(repoRoot, "wiki/clusters");
  mkdirSync(clusterDir, { recursive: true });
  for (const entry of readdirSync(clusterDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      unlinkSync(join(clusterDir, entry.name));
    }
  }

  const written: WrittenClusterArtifact[] = [];
  for (const [family, familyClusters] of [...clustersByFamily.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const path = join(clusterDir, `${family}.md`);
    writeFileSync(path, formatClusterFamilyMarkdown(family, familyClusters), "utf8");
    written.push({ family, path: relative(repoRoot, path), clusterCount: familyClusters.length });
  }

  return written;
}

export function validateClusterArtifacts() {
  const repoRoot = getRepoRoot();
  const clusterDir = join(repoRoot, "wiki/clusters");
  if (!existsSync(clusterDir)) return [];

  const acceptedObservationIds = new Set(
    observationsFromDisk()
      .filter((observation) => observation.reviewStatus === "accepted")
      .map((observation) => observation.observationId),
  );
  const failures: string[] = [];

  for (const entry of readdirSync(clusterDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const relativePath = `wiki/clusters/${entry.name}`;
    const content = readFileSync(join(clusterDir, entry.name), "utf8");
    for (const match of content.matchAll(/^observation_ids:\s*\[([^\]]*)\]\s*$/gmu)) {
      const observationIds = match[1]!
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      for (const observationId of observationIds) {
        if (!acceptedObservationIds.has(observationId)) {
          failures.push(`${relativePath}: cluster references missing or non-accepted observation ${observationId}`);
        }
      }
    }
  }

  return failures;
}

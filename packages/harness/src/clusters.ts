import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { getRepoRoot } from "./paths.js";
import {
  dialogueFromObservationId,
  fieldValue,
  listObservationLedgerPaths,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";
import { readOntologyVNextRepository, readObservationReviewStatuses } from "./wiki/ontology-vnext-repository.js";

export type ClusterObservation = {
  observationId: string;
  dialogue: string;
  stephanusSpan: string;
};

export type ObservationCluster = {
  axisId: string;
  axisKey: string;
  dimension: string;
  conceptId: string;
  conceptKey: string;
  comparisonQuestion: string;
  observations: ClusterObservation[];
  dialogues: string[];
};

export type ClusterGateReport = {
  acceptedObservations: number;
  crossDialogueConcepts: number;
  medianNonSingletonObservations: number;
  passed: boolean;
};

export type WrittenClusterArtifact = {
  axisId: string;
  axisKey: string;
  path: string;
  clusterCount: number;
};

type ClusterProjectionRow = {
  schema_version: 1;
  projection_kind: "observation_cluster";
  axis_id: string;
  axis_key: string;
  dimension: string;
  concept_id: string;
  concept_key: string;
  comparison_question: string;
  observation_ids: string[];
  dialogues: string[];
  spans: Record<string, string>;
};

function compareStrings(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([key, entry]) => [key, canonicalValue(entry)]),
  );
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalValue(value));
}

function observationMetadata() {
  const observations = new Map<string, ClusterObservation>();
  for (const path of listObservationLedgerPaths({ absolute: true })) {
    const content = readFileSync(path, "utf8");
    for (const block of observationYamlBlocks(content)) {
      const observationId = fieldValue(block, "observation_id");
      const stephanusSpan = fieldValue(block, "stephanus_span");
      if (!observationId || !stephanusSpan) continue;
      observations.set(observationId, {
        observationId,
        dialogue: dialogueFromObservationId(observationId),
        stephanusSpan,
      });
    }
  }
  return observations;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export function buildClusters(): ObservationCluster[] {
  const ontology = readOntologyVNextRepository();
  const metadata = observationMetadata();
  const membershipsByConcept = new Map<string, string[]>();
  for (const membership of ontology.memberships) {
    const bucket = membershipsByConcept.get(membership.concept_id) ?? [];
    bucket.push(membership.observation_id);
    membershipsByConcept.set(membership.concept_id, bucket);
  }

  return ontology.concepts
    .flatMap((concept): ObservationCluster[] => {
      const observationIds = membershipsByConcept.get(concept.concept_id) ?? [];
      if (observationIds.length === 0) return [];
      const axis = ontology.axis(concept.axis_id)!;
      const observations = observationIds
        .map((observationId) => {
          const observation = metadata.get(observationId);
          if (!observation) throw new Error(`Ontology membership references missing observation ${observationId}.`);
          return observation;
        })
        .sort((left, right) => compareStrings(left.observationId, right.observationId));
      return [
        {
          axisId: axis.axis_id,
          axisKey: axis.axis_key,
          dimension: axis.dimension,
          conceptId: concept.concept_id,
          conceptKey: concept.concept_key,
          comparisonQuestion: concept.comparison_question,
          observations,
          dialogues: [...new Set(observations.map((observation) => observation.dialogue))].sort(compareStrings),
        },
      ];
    })
    .sort((left, right) => compareStrings(left.axisId, right.axisId) || compareStrings(left.conceptId, right.conceptId));
}

export function clusterGateReport(): ClusterGateReport {
  const statuses = readObservationReviewStatuses();
  const clusters = buildClusters();
  const report = {
    acceptedObservations: [...statuses.values()].filter((status) => status === "accepted").length,
    crossDialogueConcepts: clusters.filter((cluster) => cluster.dialogues.length >= 2).length,
    medianNonSingletonObservations: median(
      clusters.map((cluster) => cluster.observations.length).filter((count) => count > 1),
    ),
  };
  return {
    ...report,
    passed:
      report.acceptedObservations > 0 &&
      report.crossDialogueConcepts >= 10 &&
      report.medianNonSingletonObservations >= 2,
  };
}

function projectionRow(cluster: ObservationCluster): ClusterProjectionRow {
  return {
    schema_version: 1,
    projection_kind: "observation_cluster",
    axis_id: cluster.axisId,
    axis_key: cluster.axisKey,
    dimension: cluster.dimension,
    concept_id: cluster.conceptId,
    concept_key: cluster.conceptKey,
    comparison_question: cluster.comparisonQuestion,
    observation_ids: cluster.observations.map((observation) => observation.observationId),
    dialogues: cluster.dialogues,
    spans: Object.fromEntries(
      cluster.observations.map((observation) => [observation.observationId, observation.stephanusSpan]),
    ),
  };
}

export function formatClusterAxisJsonl(clusters: ObservationCluster[]) {
  return clusters.length === 0 ? "" : `${clusters.map((cluster) => canonicalJson(projectionRow(cluster))).join("\n")}\n`;
}

function expectedClusterArtifacts() {
  const byAxis = new Map<string, ObservationCluster[]>();
  for (const cluster of buildClusters()) {
    const bucket = byAxis.get(cluster.axisId) ?? [];
    bucket.push(cluster);
    byAxis.set(cluster.axisId, bucket);
  }
  return [...byAxis.values()]
    .map((clusters) => ({
      axisId: clusters[0]!.axisId,
      axisKey: clusters[0]!.axisKey,
      relativePath: `wiki/clusters/${clusters[0]!.axisKey}.jsonl`,
      content: formatClusterAxisJsonl(clusters),
      clusterCount: clusters.length,
    }))
    .sort((left, right) => compareStrings(left.axisId, right.axisId));
}

export function writeClusterArtifacts(): WrittenClusterArtifact[] {
  const gate = clusterGateReport();
  if (!gate.passed) {
    throw new Error(
      [
        "Cluster convergence gate is not met.",
        `accepted observations: ${gate.acceptedObservations} (must be > 0)`,
        `cross-dialogue concepts: ${gate.crossDialogueConcepts} (must be >= 10)`,
        `median non-singleton observations: ${gate.medianNonSingletonObservations} (must be >= 2)`,
      ].join("\n"),
    );
  }

  const repoRoot = getRepoRoot();
  const clusterDir = join(repoRoot, "wiki/clusters");
  rmSync(clusterDir, { recursive: true, force: true });
  mkdirSync(clusterDir, { recursive: true });
  return expectedClusterArtifacts().map((artifact) => {
    const path = join(repoRoot, artifact.relativePath);
    writeFileSync(path, artifact.content, "utf8");
    return {
      axisId: artifact.axisId,
      axisKey: artifact.axisKey,
      path: relative(repoRoot, path),
      clusterCount: artifact.clusterCount,
    };
  });
}

export function validateClusterArtifacts() {
  const repoRoot = getRepoRoot();
  const clusterDir = join(repoRoot, "wiki/clusters");
  const expected = new Map(expectedClusterArtifacts().map((artifact) => [artifact.relativePath, artifact.content]));
  const actual = new Set<string>();
  if (existsSync(clusterDir)) {
    for (const entry of readdirSync(clusterDir, { withFileTypes: true })) {
      if (entry.isFile()) actual.add(`wiki/clusters/${entry.name}`);
    }
  }

  const failures: string[] = [];
  for (const path of expected.keys()) if (!actual.has(path)) failures.push(`${path}: missing cluster artifact`);
  for (const path of actual) if (!expected.has(path)) failures.push(`${path}: stale cluster artifact`);
  for (const [path, content] of expected) {
    if (actual.has(path) && readFileSync(join(repoRoot, path), "utf8") !== content) {
      failures.push(`${path}: cluster artifact does not equal its canonical ontology projection`);
    }
  }
  return failures.sort(compareStrings);
}

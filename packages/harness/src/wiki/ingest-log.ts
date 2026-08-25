import type { ObservationFeatureLink } from "./observation-feature-index.js";

export type IngestLogEntry = {
  command: string;
  dialogue: string;
  runId: string;
  timestamp: string;
  provider: string;
  model: string;
  profile: string;
  observationCount: number;
  familyCounts: Array<{ family: string; observations: number }>;
  newFeatureIds: string[];
  spanRange?: string;
};

export function ingestLogCountsFromLinks(links: ObservationFeatureLink[]) {
  const observationIds = new Set<string>();
  const observationsByFamily = new Map<string, Set<string>>();

  for (const link of links) {
    observationIds.add(link.observationId);
    const family = link.featureFamily || "(missing)";
    const familyObservations = observationsByFamily.get(family) ?? new Set<string>();
    familyObservations.add(link.observationId);
    observationsByFamily.set(family, familyObservations);
  }

  return {
    observationCount: observationIds.size,
    familyCounts: [...observationsByFamily.entries()]
      .map(([family, observations]) => ({ family, observations: observations.size }))
      .sort((a, b) => a.family.localeCompare(b.family)),
  };
}

export function formatIngestLogEntry(entry: IngestLogEntry) {
  const families =
    entry.familyCounts.length > 0
      ? entry.familyCounts.map(({ family, observations }) => `${family}=${observations}`).join(", ")
      : "(none)";
  const newCandidates = entry.newFeatureIds.length > 0 ? entry.newFeatureIds.join(", ") : "(none)";

  return [
    `## ${entry.timestamp} ${entry.command} ${entry.dialogue}`,
    "",
    `- run_id: ${entry.runId}`,
    `- provider/model: ${entry.provider}/${entry.model} (profile ${entry.profile})`,
    `- observations: ${entry.observationCount}`,
    `- span_range: ${entry.spanRange ?? "n/a"}`,
    `- families: ${families}`,
    `- new_candidates: ${newCandidates}`,
  ].join("\n");
}

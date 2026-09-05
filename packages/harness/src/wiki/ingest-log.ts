export type IngestLogEntry = {
  command: string;
  dialogue: string;
  runId: string;
  timestamp: string;
  provider: string;
  model: string;
  profile: string;
  observationCount: number;
  spanRange?: string;
};

export function formatIngestLogEntry(entry: IngestLogEntry) {
  return [
    `## ${entry.timestamp} ${entry.command} ${entry.dialogue}`,
    "",
    `- run_id: ${entry.runId}`,
    `- provider/model: ${entry.provider}/${entry.model} (profile ${entry.profile})`,
    `- observations: ${entry.observationCount}`,
    `- span_range: ${entry.spanRange ?? "n/a"}`,
  ].join("\n");
}

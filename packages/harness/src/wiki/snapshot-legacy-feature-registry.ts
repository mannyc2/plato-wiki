/** Frozen-baseline parser used only by ontology-audit snapshot tooling. */
export type SnapshotLegacyFeatureEntry = {
  id: string;
  family: string;
  proposedName: string;
  status: string;
  observations: string[];
};

const HEADING_RE = /^###\s+([a-zA-Z0-9_-]+)\s*$/gmu;
const OBSERVATION_ID_RE = /\bobs_[a-z0-9-]+_\d{4}\b/gu;

function scalar(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/gu, "") ?? "";
}

function field(body: string, name: string) {
  return scalar(new RegExp(`^-\\s+\\*\\*${name}:\\*\\*\\s*(.+)$`, "mu").exec(body)?.[1]);
}

export function parseSnapshotLegacyFeatureEntries(content: string): SnapshotLegacyFeatureEntry[] {
  const matches = [...content.matchAll(HEADING_RE)];
  return matches.map((match, index) => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = matches[index + 1]?.index ?? content.length;
    const body = content.slice(bodyStart, bodyEnd).trim();
    const observations = field(body, "observations");
    return {
      id: match[1]!,
      family: field(body, "family"),
      proposedName: field(body, "proposed_name"),
      status: field(body, "status") || "candidate",
      observations: [...observations.matchAll(OBSERVATION_ID_RE)].map((entry) => entry[0]!),
    };
  });
}

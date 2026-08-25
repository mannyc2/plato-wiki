import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue, observationYamlBlocks, replaceObservationYamlBlocks } from "./observation-ledger.js";

export type ObservationFeatureLink = {
  observationId: string;
  featureId: string;
  featureFamily: string;
  featureLabel: string;
};

export type FeatureRegistryEntry = {
  id: string;
  family: string;
  proposedName: string;
  status: string;
  observations: string[];
  notes: string;
};

const FEATURE_HEADING_RE = /^###\s+([a-zA-Z0-9_-]+)\s*$/gmu;
const OBSERVATION_ID_RE = /\bobs_[a-z0-9-]+_\d{4}\b/gu;
export const SEED_FEATURE_FAMILIES = [
  "dramatic_case_setup",
  "turn_geometry",
  "prosopography",
  "elenchus",
  "definition_ladder",
  "myth_demarcation",
  "frame_depth",
  "craft_analogy",
  "forms_trajectory",
  "irony_marker",
  "closure_type",
] as const;

const FEATURE_FAMILY_ALIASES = new Map([
  ["scene_legal_setup", "dramatic_case_setup"],
  ["legal_setup", "dramatic_case_setup"],
  ["dramatic_setup", "dramatic_case_setup"],
  ["case_setup", "dramatic_case_setup"],
  ["myth", "myth_demarcation"],
  ["frame", "frame_depth"],
  ["craft", "craft_analogy"],
  ["techne_mapping", "craft_analogy"],
  ["forms", "forms_trajectory"],
  ["form_trajectory", "forms_trajectory"],
  ["irony", "irony_marker"],
  ["closure", "closure_type"],
]);
const DEFAULT_FEATURE_REGISTRY_HEADER = `# Features So Far

Append new feature candidates here when no existing candidate fits. Reuse
existing candidates when possible. Rename, merge, or split candidates only
during a review pass.

## Feature Candidates`;

function cleanScalar(rawValue: string | undefined) {
  return rawValue?.trim().replace(/^["']|["']$/gu, "") ?? "";
}

function bulletFieldValue(body: string, field: string) {
  const match = new RegExp(`^-\\s+\\*\\*${field}:\\*\\*\\s*(.+)$`, "mu").exec(body);
  return cleanScalar(match?.[1]);
}

function bulletFieldBlock(body: string, field: string) {
  const lines = body.split("\n");
  const fieldRe = new RegExp(`^-\\s+\\*\\*${field}:\\*\\*\\s*(.*)$`, "u");
  const startIndex = lines.findIndex((line) => fieldRe.test(line));
  if (startIndex === -1) return "";

  const firstLineRaw = lines[startIndex];
  if (firstLineRaw === undefined) return "";

  const firstLine = fieldRe.exec(firstLineRaw)?.[1] ?? "";
  const block = [cleanScalar(firstLine)];
  for (const line of lines.slice(startIndex + 1)) {
    if (/^-\s+\*\*/u.test(line)) break;
    block.push(line);
  }

  return block.join("\n").trimEnd();
}

function parseObservationIds(rawValue: string | undefined) {
  if (!rawValue) return [];
  return [...rawValue.matchAll(OBSERVATION_ID_RE)].map((match) => match[0]!);
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .replace(/^["']|["']$/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .replace(/_+/gu, "_");
}

export function normalizeFeatureLabel(value: string) {
  return normalizeSlug(value);
}

export function normalizeFeatureFamily(value: string | undefined) {
  const normalized = normalizeSlug(value ?? "");
  return FEATURE_FAMILY_ALIASES.get(normalized) ?? normalized;
}

export function isSeedFeatureFamily(value: string) {
  return (SEED_FEATURE_FAMILIES as readonly string[]).includes(value);
}

function featureRegistryKey(featureFamily: string, featureLabel: string) {
  return `${featureFamily}::${featureLabel}`;
}

export function parseFeatureEntries(content: string): FeatureRegistryEntry[] {
  const matches = [...content.matchAll(FEATURE_HEADING_RE)];

  return matches.map((match, index) => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const nextMatch = matches[index + 1];
    const bodyEnd = nextMatch?.index ?? content.length;
    const body = content.slice(bodyStart, bodyEnd).trim();

    return {
      id: match[1]!,
      family: bulletFieldValue(body, "family"),
      proposedName: bulletFieldValue(body, "proposed_name"),
      status: bulletFieldValue(body, "status") || "candidate",
      observations: parseObservationIds(bulletFieldValue(body, "observations")),
      notes: bulletFieldBlock(body, "notes"),
    };
  });
}

function featureCandidateNumber(featureId: string) {
  const match = /^feature_candidate_(\d+)$/u.exec(featureId);
  return match ? Number(match[1]) : 0;
}

function nextFeatureId(nextNumber: number) {
  return `feature_candidate_${String(nextNumber).padStart(3, "0")}`;
}

function topLevelFieldLineIndex(lines: string[], field: string) {
  return lines.findIndex((line) => new RegExp(`^${field}:\\s*`, "u").test(line));
}

function upsertScalarField(block: string, field: string, value: string, beforeField?: string) {
  const lines = block.split("\n");
  const nextLine = `${field}: ${value}`;
  const existingIndex = topLevelFieldLineIndex(lines, field);

  if (existingIndex >= 0) {
    lines[existingIndex] = nextLine;
    return lines.join("\n");
  }

  const beforeIndex = beforeField ? topLevelFieldLineIndex(lines, beforeField) : -1;
  if (beforeIndex >= 0) {
    lines.splice(beforeIndex, 0, nextLine);
    return lines.join("\n");
  }

  const englishGlossIndex = topLevelFieldLineIndex(lines, "english_gloss");
  if (englishGlossIndex >= 0) {
    lines.splice(englishGlossIndex + 1, 0, nextLine);
    return lines.join("\n");
  }

  lines.push(nextLine);
  return lines.join("\n");
}

function assignFeatureIds(registryContent: string) {
  const existingFeatures = parseFeatureEntries(registryContent);
  const featureIdByFamilyAndLabel = new Map<string, string>();
  const featureIdByUnscopedLabel = new Map<string, string>();
  let maxCandidateNumber = 0;

  for (const feature of existingFeatures) {
    if (feature.proposedName) {
      const featureLabel = normalizeFeatureLabel(feature.proposedName);
      if (feature.family) {
        featureIdByFamilyAndLabel.set(featureRegistryKey(normalizeFeatureFamily(feature.family), featureLabel), feature.id);
      } else if (!featureIdByUnscopedLabel.has(featureLabel)) {
        featureIdByUnscopedLabel.set(featureLabel, feature.id);
      }
    }
    maxCandidateNumber = Math.max(maxCandidateNumber, featureCandidateNumber(feature.id));
  }

  let nextNumber = maxCandidateNumber + 1;

  return (featureFamily: string, featureLabel: string) => {
    const normalizedFamily = normalizeFeatureFamily(featureFamily);
    const normalizedLabel = normalizeFeatureLabel(featureLabel);
    const key = featureRegistryKey(normalizedFamily, normalizedLabel);
    const existingId = featureIdByFamilyAndLabel.get(key) ?? featureIdByUnscopedLabel.get(normalizedLabel);
    if (existingId) return { featureId: existingId, featureFamily: normalizedFamily, featureLabel: normalizedLabel };

    const featureId = nextFeatureId(nextNumber);
    nextNumber += 1;
    featureIdByFamilyAndLabel.set(key, featureId);
    return { featureId, featureFamily: normalizedFamily, featureLabel: normalizedLabel };
  };
}

export function normalizeObservationFeatureIds(content: string, registryContent: string) {
  const assign = assignFeatureIds(registryContent);
  const links: ObservationFeatureLink[] = [];

  const normalizedContent = replaceObservationYamlBlocks(content, (block, fullMatch) => {
    const observationId = fieldValue(block, "observation_id");
    const rawFeatureFamily = fieldValue(block, "feature_family");
    const rawFeatureLabel = fieldValue(block, "feature_label");
    if (!observationId || !rawFeatureLabel) return fullMatch;

    const { featureId, featureFamily, featureLabel } = assign(rawFeatureFamily ?? "", rawFeatureLabel);
    links.push({ observationId, featureId, featureFamily, featureLabel });

    let nextBlock = upsertScalarField(block, "feature_id", featureId, "feature_label");
    if (rawFeatureFamily) {
      nextBlock = upsertScalarField(nextBlock, "feature_family", featureFamily, "feature_label");
    }
    nextBlock = upsertScalarField(nextBlock, "feature_label", featureLabel);
    return `\`\`\`yaml\n${nextBlock}\n\`\`\``;
  });

  return { content: normalizedContent, links };
}

export function extractObservationFeatureLinks(content: string) {
  const links: ObservationFeatureLink[] = [];

  for (const block of observationYamlBlocks(content)) {
    const observationId = fieldValue(block, "observation_id");
    const featureId = fieldValue(block, "feature_id");
    const featureFamily = normalizeFeatureFamily(fieldValue(block, "feature_family"));
    const featureLabel = normalizeFeatureLabel(fieldValue(block, "feature_label") ?? "");
    if (!observationId || !featureId || !featureLabel) continue;
    links.push({ observationId, featureId, featureFamily, featureLabel });
  }

  return links;
}

function groupFeatureLinks(links: ObservationFeatureLink[]) {
  const grouped = new Map<
    string,
    { featureId: string; featureFamily: string; featureLabel: string; observations: Set<string> }
  >();

  for (const link of links) {
    const existing = grouped.get(link.featureId);
    if (existing) {
      if (!existing.featureFamily && link.featureFamily) {
        existing.featureFamily = link.featureFamily;
      }
      existing.observations.add(link.observationId);
      continue;
    }

    grouped.set(link.featureId, {
      featureId: link.featureId,
      featureFamily: link.featureFamily,
      featureLabel: link.featureLabel,
      observations: new Set([link.observationId]),
    });
  }

  return [...grouped.values()].sort((a, b) => a.featureId.localeCompare(b.featureId));
}

export function formatObservationFeatureIndex(links: ObservationFeatureLink[]) {
  const grouped = groupFeatureLinks(links);
  if (grouped.length === 0) return "(no observation feature links found)";

  return grouped
    .map(
      (entry) =>
        `- ${entry.featureId}: family=${entry.featureFamily || "(missing)"}; proposed_name=${entry.featureLabel}; observations=${[...entry.observations].sort().join(", ")}`,
    )
    .join("\n");
}

export function syncFeatureRegistryContent(registryContent: string, links: ObservationFeatureLink[]) {
  const entries = parseFeatureEntries(registryContent);
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  const entriesByFamilyAndProposedName = new Map(
    entries
      .filter((entry) => entry.family && entry.proposedName)
      .map((entry) => [
        featureRegistryKey(normalizeFeatureFamily(entry.family), normalizeFeatureLabel(entry.proposedName)),
        entry,
      ]),
  );
  const unscopedEntriesByProposedName = new Map(
    entries
      .filter((entry) => !entry.family && entry.proposedName)
      .map((entry) => [normalizeFeatureLabel(entry.proposedName), entry]),
  );

  for (const group of groupFeatureLinks(links)) {
    const normalizedGroupFamily = normalizeFeatureFamily(group.featureFamily);
    const normalizedGroupLabel = normalizeFeatureLabel(group.featureLabel);
    const existing =
      entriesById.get(group.featureId) ??
      entriesByFamilyAndProposedName.get(featureRegistryKey(normalizedGroupFamily, normalizedGroupLabel)) ??
      unscopedEntriesByProposedName.get(normalizedGroupLabel);
    if (existing) {
      for (const observationId of group.observations) {
        if (!existing.observations.includes(observationId)) {
          existing.observations.push(observationId);
        }
      }
      continue;
    }

    const entry = {
      id: group.featureId,
      family: normalizedGroupFamily,
      proposedName: normalizedGroupLabel,
      status: "candidate",
      observations: [...group.observations],
      notes: "Candidate created from observation feature labels; review may rename, merge, split, accept, or reject.",
    };
    entries.push(entry);
    entriesById.set(entry.id, entry);
    entriesByFamilyAndProposedName.set(
      featureRegistryKey(normalizeFeatureFamily(entry.family), normalizeFeatureLabel(entry.proposedName)),
      entry,
    );
  }

  if (entries.length === 0) return `${DEFAULT_FEATURE_REGISTRY_HEADER}\n\nNone yet.\n`;

  const body = entries
    .map((entry) =>
      [
        `### ${entry.id}`,
        `- **family:** ${entry.family || "uncategorized"}`,
        `- **proposed_name:** ${entry.proposedName}`,
        `- **status:** ${entry.status || "candidate"}`,
        `- **observations:** ${[...new Set(entry.observations)].sort().join(", ")}`,
        `- **notes:** ${entry.notes || "Review notes pending."}`,
      ].join("\n"),
    )
    .join("\n\n");

  return `${DEFAULT_FEATURE_REGISTRY_HEADER}\n\n${body}\n`;
}

export function reconcileFeatureRegistryContent(registryContent: string, links: ObservationFeatureLink[]) {
  const entries = parseFeatureEntries(registryContent);
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  const reconciled = groupFeatureLinks(links).map((group) => {
    const existing = entriesById.get(group.featureId);
    return {
      id: group.featureId,
      family: normalizeFeatureFamily(group.featureFamily),
      proposedName: normalizeFeatureLabel(group.featureLabel),
      status: existing?.status || "candidate",
      observations: [...group.observations].sort(),
      notes:
        existing?.notes ||
        "Candidate created from observation feature labels; review may rename, merge, split, accept, or reject.",
    };
  });

  if (reconciled.length === 0) return `${DEFAULT_FEATURE_REGISTRY_HEADER}\n\nNone yet.\n`;

  const body = reconciled
    .map((entry) =>
      [
        `### ${entry.id}`,
        `- **family:** ${entry.family || "uncategorized"}`,
        `- **proposed_name:** ${entry.proposedName}`,
        `- **status:** ${entry.status || "candidate"}`,
        `- **observations:** ${entry.observations.join(", ")}`,
        `- **notes:** ${entry.notes || "Review notes pending."}`,
      ].join("\n"),
    )
    .join("\n\n");

  return `${DEFAULT_FEATURE_REGISTRY_HEADER}\n\n${body}\n`;
}

export function observationFeatureLinksFromDisk() {
  const observationDir = join(getRepoRoot(), "wiki/observations");
  const links: ObservationFeatureLink[] = [];

  if (!existsSync(observationDir)) return links;

  for (const entry of readdirSync(observationDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const content = readFileSync(join(observationDir, entry.name), "utf8");
    links.push(...extractObservationFeatureLinks(content));
  }

  return links;
}

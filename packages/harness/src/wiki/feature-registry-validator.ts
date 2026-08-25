import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { normalizeFeatureFamily } from "./observation-feature-index.js";

export type FeatureRegistryValidationIssue = {
  code:
    | "missing_feature_heading"
    | "invalid_feature_id"
    | "duplicate_feature_id"
    | "missing_field"
    | "invalid_status"
    | "invalid_family"
    | "invalid_proposed_name"
    | "duplicate_proposed_name"
    | "empty_observations"
    | "unknown_observation"
    | "mismatched_feature_observation"
    | "unknown_feature_reference"
    | "stale_empty_placeholder"
    | "missing_existing_feature"
    | "mutated_existing_feature"
    | "removed_existing_observation"
    | "invalid_new_feature_status";
  message: string;
  fix: string;
  featureId?: string;
};

type FeatureRegistryValidationOptions = {
  knownObservationIds?: Set<string>;
  observationFeatureIds?: Map<string, string>;
  mode?: "ingest" | "review";
  previousContent?: string;
};

type ParsedFeature = {
  id: string;
  body: string;
  family: string | undefined;
  proposedName: string | undefined;
  status: string | undefined;
  observations: string[] | undefined;
  notes: string | undefined;
};

const FEATURE_HEADING_RE = /^###\s+([a-zA-Z0-9_-]+)\s*$/gmu;
const FEATURE_ID_RE = /^[a-z][a-z0-9_]*$/u;
const FAMILY_RE = /^[a-z][a-z0-9_]*$/u;
const PROPOSED_NAME_RE = /^[a-z][a-z0-9_]*$/u;
const OBSERVATION_ID_RE = /\bobs_[a-z0-9-]+_\d{4}\b/gu;
const VALID_STATUSES = new Set(["candidate", "accepted", "rejected", "needs_split"]);

function fieldValue(body: string, field: string) {
  const match = new RegExp(`^-\\s+\\*\\*${field}:\\*\\*\\s*(.+)$`, "mu").exec(body);
  return match?.[1]?.trim();
}

function parseObservations(rawValue: string | undefined) {
  if (!rawValue) return undefined;
  return [...rawValue.matchAll(OBSERVATION_ID_RE)].map((match) => match[0]);
}

function parseFeatures(content: string) {
  const matches = [...content.matchAll(FEATURE_HEADING_RE)];

  return matches.map((match, index): ParsedFeature => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const nextMatch = matches[index + 1];
    const bodyEnd = nextMatch?.index ?? content.length;
    const body = content.slice(bodyStart, bodyEnd).trim();
    const observations = parseObservations(fieldValue(body, "observations"));

    return {
      id: match[1]!,
      body,
      family: fieldValue(body, "family"),
      proposedName: fieldValue(body, "proposed_name"),
      status: fieldValue(body, "status"),
      observations,
      notes: fieldValue(body, "notes"),
    };
  });
}

function featureMap(features: ParsedFeature[]) {
  return new Map(features.map((feature) => [feature.id, feature]));
}

function fieldName(field: keyof Pick<ParsedFeature, "family" | "proposedName" | "status" | "observations" | "notes">) {
  if (field === "proposedName") return "proposed_name";
  return field;
}

function observationIndexFromDisk() {
  const observationDir = join(getRepoRoot(), "wiki/observations");
  const knownObservationIds = new Set<string>();
  const observationFeatureIds = new Map<string, string>();

  if (!existsSync(observationDir)) {
    return { knownObservationIds, observationFeatureIds };
  }

  for (const entry of readdirSync(observationDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const content = readFileSync(join(observationDir, entry.name), "utf8");
    for (const blockMatch of content.matchAll(/```yaml\n([\s\S]*?)\n```/gu)) {
      const block = blockMatch[1] ?? "";
      const observationId = /^observation_id:\s*(\S+)/mu.exec(block)?.[1];
      const featureId = /^feature_id:\s*(\S+)/mu.exec(block)?.[1];

      if (observationId) {
        knownObservationIds.add(observationId);
        if (featureId) {
          observationFeatureIds.set(observationId, featureId);
        }
      }
    }
  }

  return { knownObservationIds, observationFeatureIds };
}

export function validateFeatureRegistry(
  content: string,
  options: FeatureRegistryValidationOptions = {},
): FeatureRegistryValidationIssue[] {
  const issues: FeatureRegistryValidationIssue[] = [];
  const headingCount = content.match(/^## Feature Candidates$/gmu)?.length ?? 0;
  const features = parseFeatures(content);
  const featuresById = featureMap(features);
  const observationIndex =
    options.knownObservationIds && options.observationFeatureIds
      ? {
          knownObservationIds: options.knownObservationIds,
          observationFeatureIds: options.observationFeatureIds,
        }
      : observationIndexFromDisk();

  if (headingCount !== 1) {
    issues.push({
      code: "missing_feature_heading",
      message: 'Feature registry must contain exactly one "## Feature Candidates" heading.',
      fix: 'Keep one "## Feature Candidates" heading and place every feature below it.',
    });
  }

  if (features.length > 0 && content.includes("\nNone yet.")) {
    issues.push({
      code: "stale_empty_placeholder",
      message: 'Feature registry still contains the "None yet." placeholder after features exist.',
      fix: 'Remove "None yet." when any feature headings are present.',
    });
  }

  const featureIds = new Set<string>();
  const proposedNames = new Map<string, string>();

  for (const feature of features) {
    if (!FEATURE_ID_RE.test(feature.id)) {
      issues.push({
        code: "invalid_feature_id",
        featureId: feature.id,
        message: `Feature id \`${feature.id}\` must be a lowercase snake_case slug.`,
        fix: "Use ids such as feature_candidate_019 or definition_revised_after_objection.",
      });
    }

    if (featureIds.has(feature.id)) {
      issues.push({
        code: "duplicate_feature_id",
        featureId: feature.id,
        message: `Feature id \`${feature.id}\` is duplicated.`,
        fix: "Keep feature ids unique and merge observations into one entry if needed.",
      });
    }
    featureIds.add(feature.id);

    for (const field of ["proposedName", "status", "observations", "notes"] as const) {
      const value = feature[field];
      if (value === undefined || (Array.isArray(value) ? value.length === 0 : value.length === 0)) {
        issues.push({
          code: field === "observations" ? "empty_observations" : "missing_field",
          featureId: feature.id,
          message: `Feature \`${feature.id}\` is missing \`${fieldName(field)}\`.`,
          fix:
            field === "observations"
              ? "List at least one observation id that exists in wiki/observations/*.md."
              : `Add a non-empty \`${fieldName(field)}\` bullet.`,
        });
      }
    }

    if (feature.status && !VALID_STATUSES.has(feature.status)) {
      issues.push({
        code: "invalid_status",
        featureId: feature.id,
        message: `Feature \`${feature.id}\` has invalid status \`${feature.status}\`.`,
        fix: "Use one of: candidate, accepted, rejected, needs_split.",
      });
    }

    if (feature.family && !FAMILY_RE.test(feature.family)) {
      issues.push({
        code: "invalid_family",
        featureId: feature.id,
        message: `Feature \`${feature.id}\` family must be a lowercase snake_case slug.`,
        fix: "Use a seed family such as definition_ladder, or a normalized passthrough family such as legal_oath_formula.",
      });
    }

    if (feature.proposedName) {
      if (!PROPOSED_NAME_RE.test(feature.proposedName)) {
        issues.push({
          code: "invalid_proposed_name",
          featureId: feature.id,
          message: `Feature \`${feature.id}\` proposed_name must be a lowercase snake_case slug.`,
          fix: "Use mechanical names such as definition_revised_after_objection.",
        });
      }

      const proposedNameKey = `${normalizeFeatureFamily(feature.family)}::${feature.proposedName}`;
      const existingFeatureId = proposedNames.get(proposedNameKey);
      if (existingFeatureId && existingFeatureId !== feature.id) {
        issues.push({
          code: "duplicate_proposed_name",
          featureId: feature.id,
          message: `proposed_name \`${feature.proposedName}\` is already used in family \`${normalizeFeatureFamily(feature.family) || "(missing)"}\` by \`${existingFeatureId}\`.`,
          fix: "Merge duplicate features or choose a distinct mechanical name.",
        });
      }
      proposedNames.set(proposedNameKey, feature.id);
    }

    for (const observationId of feature.observations ?? []) {
      if (!observationIndex.knownObservationIds.has(observationId)) {
        issues.push({
          code: "unknown_observation",
          featureId: feature.id,
          message: `Feature \`${feature.id}\` references missing observation \`${observationId}\`.`,
          fix: "Write the observation ledger first, or remove the stale observation id.",
        });
        continue;
      }

      const observationFeatureId = observationIndex.observationFeatureIds.get(observationId);
      if (observationFeatureId && observationFeatureId !== feature.id) {
        issues.push({
          code: "mismatched_feature_observation",
          featureId: feature.id,
          message: `Feature \`${feature.id}\` lists observation \`${observationId}\`, but that observation references \`${observationFeatureId}\`.`,
          fix: "Move the observation id to the feature referenced by the observation ledger, or update the observation feature_id.",
        });
      }
    }
  }

  for (const [observationId, featureId] of observationIndex.observationFeatureIds.entries()) {
    if (!featureIds.has(featureId)) {
      issues.push({
        code: "unknown_feature_reference",
        featureId,
        message: `Observation \`${observationId}\` references missing feature \`${featureId}\`.`,
        fix: "Add the feature to the registry or update the observation to an existing feature id.",
      });
    }
  }

  if (options.mode === "ingest" && options.previousContent !== undefined) {
    const previousFeatures = parseFeatures(options.previousContent);
    const previousFeaturesById = featureMap(previousFeatures);

    for (const previousFeature of previousFeatures) {
      const nextFeature = featuresById.get(previousFeature.id);
      if (!nextFeature) {
        issues.push({
          code: "missing_existing_feature",
          featureId: previousFeature.id,
          message: `Ingest cannot remove existing feature \`${previousFeature.id}\`.`,
          fix: "Preserve existing features during ingest. Rename, merge, split, or delete features only during review.",
        });
        continue;
      }

      for (const field of ["family", "proposedName", "status", "notes"] as const) {
        if (nextFeature[field] !== previousFeature[field]) {
          issues.push({
            code: "mutated_existing_feature",
            featureId: previousFeature.id,
            message: `Ingest cannot change existing feature \`${previousFeature.id}\` field \`${fieldName(field)}\`.`,
            fix: "During ingest, only add new candidates or add observation ids to existing candidates. Do other edits in review.",
          });
        }
      }

      const nextObservations = new Set(nextFeature.observations ?? []);
      for (const previousObservation of previousFeature.observations ?? []) {
        if (!nextObservations.has(previousObservation)) {
          issues.push({
            code: "removed_existing_observation",
            featureId: previousFeature.id,
            message: `Ingest cannot remove observation \`${previousObservation}\` from feature \`${previousFeature.id}\`.`,
            fix: "Preserve existing observation links during ingest. Remove or move links only during review.",
          });
        }
      }
    }

    for (const feature of features) {
      if (previousFeaturesById.has(feature.id)) continue;

      if (feature.status !== "candidate") {
        issues.push({
          code: "invalid_new_feature_status",
          featureId: feature.id,
          message: `New ingest feature \`${feature.id}\` must start with status \`candidate\`.`,
          fix: "Use status candidate during ingest. Accept, reject, split, or merge features only during review.",
        });
      }
    }
  }

  return issues;
}

export function formatFeatureRegistryValidationError(issues: FeatureRegistryValidationIssue[]) {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  }

  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shownIssues = issues.slice(0, 8);
  const lines = [
    "Feature registry rejected by wiki_write_feature_registry.",
    "Fix wiki/features-so-far.md content and call wiki_write_feature_registry again.",
    `Issue counts: ${countSummary}`,
    ...shownIssues.map((issue) => {
      const location = issue.featureId ? `feature ${issue.featureId}` : "registry";
      return `- ${location}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];

  if (issues.length > shownIssues.length) {
    lines.push(`- ${issues.length - shownIssues.length} more issue(s) omitted.`);
  }

  return lines.join("\n");
}

export function assertFeatureRegistryContent(content: string) {
  const issues = validateFeatureRegistry(content);
  if (issues.length > 0) {
    throw new Error(formatFeatureRegistryValidationError(issues));
  }
}

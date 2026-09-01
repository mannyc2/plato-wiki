import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Type, type TSchema } from "typebox";
import { Check, Errors } from "typebox/value";

export const ONTOLOGY_VNEXT_SCHEMA_VERSION = 1 as const;

export const ONTOLOGY_VNEXT_FILES = {
  axes: "axes.jsonl",
  concepts: "concepts.jsonl",
  memberships: "memberships.jsonl",
} as const;

/**
 * A comparison axis has one textual job. These categories keep subject matter,
 * textual function, presentation, dramatic setting, and discourse position
 * from being encoded as interchangeable labels.
 */
export const ONTOLOGY_VNEXT_DIMENSIONS = [
  "textual_function",
  "subject_matter",
  "presentation_form",
  "dramatic_context",
  "discourse_structure",
  "lexical_form",
] as const;

export type OntologyVNextDimension = (typeof ONTOLOGY_VNEXT_DIMENSIONS)[number];
export type ObservationReviewStatus = "unreviewed" | "accepted" | "rejected" | "needs_split";

export type OntologyVNextAxis = {
  schema_version: 1;
  axis_id: string;
  axis_key: string;
  dimension: OntologyVNextDimension;
  comparison_question: string;
};

export type OntologyVNextConcept = {
  schema_version: 1;
  concept_id: string;
  axis_id: string;
  concept_key: string;
  definition: string;
  comparison_question: string;
};

export type OntologyVNextMembership = {
  schema_version: 1;
  membership_id: string;
  observation_id: string;
  concept_id: string;
  assignment_basis: string;
};

export type OntologyVNextDocuments = {
  axes: string;
  concepts: string;
  memberships: string;
};

export type OntologyVNextRows = {
  readonly axes: readonly OntologyVNextAxis[];
  readonly concepts: readonly OntologyVNextConcept[];
  readonly memberships: readonly OntologyVNextMembership[];
};

export type OntologyVNextValidationOptions = {
  observationReviewStatuses: ReadonlyMap<string, ObservationReviewStatus>;
};

export type OntologyVNextIssue = {
  code:
    | "malformed_json"
    | "non_canonical_json"
    | "non_canonical_jsonl"
    | "schema"
    | "legacy_alias"
    | "invalid_axis_id"
    | "invalid_concept_id"
    | "invalid_membership_id"
    | "duplicate_axis_id"
    | "duplicate_axis_key"
    | "duplicate_concept_id"
    | "duplicate_concept_identity"
    | "duplicate_membership_id"
    | "duplicate_membership_pair"
    | "empty_question"
    | "empty_definition"
    | "empty_assignment_basis"
    | "missing_axis_ref"
    | "missing_concept_ref"
    | "missing_observation_ref"
    | "observation_not_accepted";
  path: string;
  message: string;
};

export type OntologyVNextModel = {
  readonly axes: readonly Readonly<OntologyVNextAxis>[];
  readonly concepts: readonly Readonly<OntologyVNextConcept>[];
  readonly memberships: readonly Readonly<OntologyVNextMembership>[];
  axis(axisId: string): Readonly<OntologyVNextAxis> | undefined;
  concept(conceptId: string): Readonly<OntologyVNextConcept> | undefined;
  membershipsForObservation(observationId: string): readonly Readonly<OntologyVNextMembership>[];
  conceptsForObservation(observationId: string): readonly Readonly<OntologyVNextConcept>[];
};

type ParsedRows = {
  axes: OntologyVNextAxis[];
  concepts: OntologyVNextConcept[];
  memberships: OntologyVNextMembership[];
};

type Inspection = ParsedRows & { issues: OntologyVNextIssue[] };

const SLUG_PATTERN = "^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$";
const OBSERVATION_ID_PATTERN = "^obs_[a-z0-9-]+_[0-9]{4}$";
const AXIS_ID_PATTERN = "^axis_sha256_[a-f0-9]{64}$";
const CONCEPT_ID_PATTERN = "^concept_sha256_[a-f0-9]{64}$";
const MEMBERSHIP_ID_PATTERN = "^membership_sha256_[a-f0-9]{64}$";

const DimensionSchema = Type.Union(ONTOLOGY_VNEXT_DIMENSIONS.map((dimension) => Type.Literal(dimension)));

export const OntologyVNextAxisSchema = Type.Object(
  {
    schema_version: Type.Literal(ONTOLOGY_VNEXT_SCHEMA_VERSION),
    axis_id: Type.String({ pattern: AXIS_ID_PATTERN }),
    axis_key: Type.String({ pattern: SLUG_PATTERN }),
    dimension: DimensionSchema,
    comparison_question: Type.String(),
  },
  { additionalProperties: false },
);

export const OntologyVNextConceptSchema = Type.Object(
  {
    schema_version: Type.Literal(ONTOLOGY_VNEXT_SCHEMA_VERSION),
    concept_id: Type.String({ pattern: CONCEPT_ID_PATTERN }),
    axis_id: Type.String({ pattern: AXIS_ID_PATTERN }),
    concept_key: Type.String({ pattern: SLUG_PATTERN }),
    definition: Type.String(),
    comparison_question: Type.String(),
  },
  { additionalProperties: false },
);

export const OntologyVNextMembershipSchema = Type.Object(
  {
    schema_version: Type.Literal(ONTOLOGY_VNEXT_SCHEMA_VERSION),
    membership_id: Type.String({ pattern: MEMBERSHIP_ID_PATTERN }),
    observation_id: Type.String({ pattern: OBSERVATION_ID_PATTERN }),
    concept_id: Type.String({ pattern: CONCEPT_ID_PATTERN }),
    assignment_basis: Type.String(),
  },
  { additionalProperties: false },
);

const LEGACY_ALIAS_FIELDS = new Set([
  "alias",
  "aliases",
  "family",
  "feature_family",
  "feature_id",
  "feature_label",
  "label",
  "legacy_family",
  "legacy_id",
  "legacy_ids",
  "legacy_label",
  "proposed_name",
]);
const LEGACY_IDENTITY_RE = /^feature(?:_candidate)?_/u;
const LEGACY_MEMBERSHIP_ALIAS_RE = /(?:\bfeature(?:_candidate)?_[a-z0-9_]+\b|\b[a-z0-9_]+::[a-z0-9_]+\b)/u;

function semanticId(prefix: "axis" | "concept" | "membership", components: readonly string[]) {
  const identity = ["plato-wiki-ontology-vnext", String(ONTOLOGY_VNEXT_SCHEMA_VERSION), prefix, ...components].join("\u0000");
  return `${prefix}_sha256_${createHash("sha256").update(identity, "utf8").digest("hex")}`;
}

export function deriveOntologyVNextAxisId(dimension: OntologyVNextDimension, axisKey: string) {
  return semanticId("axis", [dimension, axisKey]);
}

export function deriveOntologyVNextConceptId(axisId: string, conceptKey: string) {
  return semanticId("concept", [axisId, conceptKey]);
}

export function deriveOntologyVNextMembershipId(observationId: string, conceptId: string) {
  return semanticId("membership", [observationId, conceptId]);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function canonicalJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJsonValue);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort(compareStrings)
      .map((key) => [key, canonicalJsonValue(value[key])]),
  );
}

function canonicalJson(value: unknown) {
  const serialized = JSON.stringify(canonicalJsonValue(value));
  if (serialized === undefined) throw new TypeError("Canonical JSONL values must be JSON-serializable.");
  return serialized;
}

function compareStrings(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function schemaErrorPath(error: unknown) {
  const candidate = error as { path?: string; instancePath?: string };
  return candidate.path ?? candidate.instancePath ?? "";
}

function inspectJsonl<T extends Record<string, unknown>>(
  content: string,
  file: string,
  schema: TSchema,
  identityField: string,
  issues: OntologyVNextIssue[],
): T[] {
  if (content.length === 0) return [];
  if (!content.endsWith("\n") || content.endsWith("\n\n") || content.includes("\r")) {
    issues.push({
      code: "non_canonical_jsonl",
      path: file,
      message: `${file} must use LF endings, contain no blank lines, and end with exactly one newline.`,
    });
  }

  const lines = content.split("\n");
  if (lines.at(-1) === "") lines.pop();
  const rows: T[] = [];
  let previousIdentity: string | undefined;

  for (const [index, line] of lines.entries()) {
    const linePath = `${file}:${index + 1}`;
    if (line.length === 0) {
      issues.push({ code: "non_canonical_jsonl", path: linePath, message: "Blank JSONL lines are forbidden." });
      continue;
    }

    let value: unknown;
    try {
      value = JSON.parse(line) as unknown;
    } catch (error) {
      issues.push({
        code: "malformed_json",
        path: linePath,
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    if (!isPlainObject(value)) {
      issues.push({ code: "schema", path: linePath, message: "Each JSONL line must be one object." });
      continue;
    }

    for (const field of Object.keys(value)) {
      if (LEGACY_ALIAS_FIELDS.has(field)) {
        issues.push({
          code: "legacy_alias",
          path: `${linePath}/${field}`,
          message: `Legacy or compatibility field ${JSON.stringify(field)} is forbidden in the vNext ontology.`,
        });
      }
    }

    if (canonicalJson(value) !== line) {
      issues.push({
        code: "non_canonical_json",
        path: linePath,
        message: "JSON object keys, escaping, and whitespace do not match canonical serialization.",
      });
    }

    if (!Check(schema, value)) {
      for (const error of Errors(schema, value)) {
        issues.push({
          code: "schema",
          path: `${linePath}${schemaErrorPath(error)}`,
          message: error.message,
        });
      }
      continue;
    }

    const identity = value[identityField];
    if (typeof identity === "string" && previousIdentity !== undefined && identity <= previousIdentity) {
      issues.push({
        code: "non_canonical_jsonl",
        path: linePath,
        message: `${identityField} values must be in strictly increasing byte order.`,
      });
    }
    if (typeof identity === "string") previousIdentity = identity;
    rows.push(value as T);
  }

  return rows;
}

function addTextIssue(
  issues: OntologyVNextIssue[],
  value: string,
  path: string,
  kind: "question" | "definition" | "assignment_basis",
) {
  if (value.trim().length === 0 || value !== value.trim()) {
    issues.push({
      code: kind === "question" ? "empty_question" : kind === "definition" ? "empty_definition" : "empty_assignment_basis",
      path,
      message: `${kind} must be non-empty and have no leading or trailing whitespace.`,
    });
    return;
  }
  if (kind === "question" && (!value.endsWith("?") || /[\r\n]/u.test(value))) {
    issues.push({
      code: "empty_question",
      path,
      message: "comparison_question must be one single-line question ending in a question mark.",
    });
  }
}

function findDuplicates<T>(
  rows: readonly T[],
  key: (row: T) => string,
  issue: (row: T, value: string) => OntologyVNextIssue,
  issues: OntologyVNextIssue[],
) {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = key(row);
    if (seen.has(value)) issues.push(issue(row, value));
    seen.add(value);
  }
}

function inspectOntologyVNext(
  documents: OntologyVNextDocuments,
  options: OntologyVNextValidationOptions,
): Inspection {
  const issues: OntologyVNextIssue[] = [];
  const axes = inspectJsonl<OntologyVNextAxis>(
    documents.axes,
    ONTOLOGY_VNEXT_FILES.axes,
    OntologyVNextAxisSchema,
    "axis_id",
    issues,
  );
  const concepts = inspectJsonl<OntologyVNextConcept>(
    documents.concepts,
    ONTOLOGY_VNEXT_FILES.concepts,
    OntologyVNextConceptSchema,
    "concept_id",
    issues,
  );
  const memberships = inspectJsonl<OntologyVNextMembership>(
    documents.memberships,
    ONTOLOGY_VNEXT_FILES.memberships,
    OntologyVNextMembershipSchema,
    "membership_id",
    issues,
  );

  const axisIds = new Set(axes.map((axis) => axis.axis_id));
  const conceptIds = new Set(concepts.map((concept) => concept.concept_id));

  for (const axis of axes) {
    addTextIssue(issues, axis.comparison_question, `${ONTOLOGY_VNEXT_FILES.axes}/${axis.axis_id}/comparison_question`, "question");
    if (LEGACY_IDENTITY_RE.test(axis.axis_key)) {
      issues.push({
        code: "legacy_alias",
        path: `${ONTOLOGY_VNEXT_FILES.axes}/${axis.axis_id}/axis_key`,
        message: `axis_key ${JSON.stringify(axis.axis_key)} preserves a legacy feature identity.`,
      });
    }
    const expected = deriveOntologyVNextAxisId(axis.dimension, axis.axis_key);
    if (axis.axis_id !== expected) {
      issues.push({
        code: "invalid_axis_id",
        path: `${ONTOLOGY_VNEXT_FILES.axes}/${axis.axis_id}`,
        message: `axis_id must be ${expected}, derived from dimension and axis_key.`,
      });
    }
  }

  for (const concept of concepts) {
    addTextIssue(
      issues,
      concept.comparison_question,
      `${ONTOLOGY_VNEXT_FILES.concepts}/${concept.concept_id}/comparison_question`,
      "question",
    );
    addTextIssue(issues, concept.definition, `${ONTOLOGY_VNEXT_FILES.concepts}/${concept.concept_id}/definition`, "definition");
    if (LEGACY_IDENTITY_RE.test(concept.concept_key)) {
      issues.push({
        code: "legacy_alias",
        path: `${ONTOLOGY_VNEXT_FILES.concepts}/${concept.concept_id}/concept_key`,
        message: `concept_key ${JSON.stringify(concept.concept_key)} preserves a legacy feature identity.`,
      });
    }
    if (!axisIds.has(concept.axis_id)) {
      issues.push({
        code: "missing_axis_ref",
        path: `${ONTOLOGY_VNEXT_FILES.concepts}/${concept.concept_id}/axis_id`,
        message: `Unknown axis_id ${concept.axis_id}.`,
      });
    }
    const expected = deriveOntologyVNextConceptId(concept.axis_id, concept.concept_key);
    if (concept.concept_id !== expected) {
      issues.push({
        code: "invalid_concept_id",
        path: `${ONTOLOGY_VNEXT_FILES.concepts}/${concept.concept_id}`,
        message: `concept_id must be ${expected}, derived from axis_id and concept_key.`,
      });
    }
  }

  for (const membership of memberships) {
    addTextIssue(
      issues,
      membership.assignment_basis,
      `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}/assignment_basis`,
      "assignment_basis",
    );
    if (LEGACY_MEMBERSHIP_ALIAS_RE.test(membership.assignment_basis)) {
      issues.push({
        code: "legacy_alias",
        path: `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}/assignment_basis`,
        message: "assignment_basis preserves a retired feature id or family::label identity.",
      });
    }
    if (!conceptIds.has(membership.concept_id)) {
      issues.push({
        code: "missing_concept_ref",
        path: `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}/concept_id`,
        message: `Unknown concept_id ${membership.concept_id}.`,
      });
    }
    const observationStatus = options.observationReviewStatuses.get(membership.observation_id);
    if (observationStatus === undefined) {
      issues.push({
        code: "missing_observation_ref",
        path: `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}/observation_id`,
        message: `Unknown observation_id ${membership.observation_id}.`,
      });
    } else if (observationStatus !== "accepted") {
      issues.push({
        code: "observation_not_accepted",
        path: `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}/observation_id`,
        message: `Observation ${membership.observation_id} has review_status ${observationStatus}; reader-visible memberships require accepted observations.`,
      });
    }
    const expected = deriveOntologyVNextMembershipId(membership.observation_id, membership.concept_id);
    if (membership.membership_id !== expected) {
      issues.push({
        code: "invalid_membership_id",
        path: `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}`,
        message: `membership_id must be ${expected}, derived from observation_id and concept_id.`,
      });
    }
  }

  findDuplicates(
    axes,
    (axis) => axis.axis_id,
    (_axis, value) => ({ code: "duplicate_axis_id", path: ONTOLOGY_VNEXT_FILES.axes, message: `Duplicate axis_id ${value}.` }),
    issues,
  );
  findDuplicates(
    axes,
    (axis) => axis.axis_key,
    (_axis, value) => ({ code: "duplicate_axis_key", path: ONTOLOGY_VNEXT_FILES.axes, message: `Duplicate axis_key ${value}.` }),
    issues,
  );
  findDuplicates(
    concepts,
    (concept) => concept.concept_id,
    (_concept, value) => ({ code: "duplicate_concept_id", path: ONTOLOGY_VNEXT_FILES.concepts, message: `Duplicate concept_id ${value}.` }),
    issues,
  );
  findDuplicates(
    concepts,
    (concept) => `${concept.axis_id}\u0000${concept.concept_key}`,
    (concept) => ({
      code: "duplicate_concept_identity",
      path: `${ONTOLOGY_VNEXT_FILES.concepts}/${concept.concept_id}`,
      message: `Duplicate concept identity (${concept.axis_id}, ${concept.concept_key}).`,
    }),
    issues,
  );
  findDuplicates(
    memberships,
    (membership) => membership.membership_id,
    (_membership, value) => ({
      code: "duplicate_membership_id",
      path: ONTOLOGY_VNEXT_FILES.memberships,
      message: `Duplicate membership_id ${value}.`,
    }),
    issues,
  );
  findDuplicates(
    memberships,
    (membership) => `${membership.observation_id}\u0000${membership.concept_id}`,
    (membership) => ({
      code: "duplicate_membership_pair",
      path: `${ONTOLOGY_VNEXT_FILES.memberships}/${membership.membership_id}`,
      message: `Duplicate observation-to-concept pair (${membership.observation_id}, ${membership.concept_id}).`,
    }),
    issues,
  );

  return { axes, concepts, memberships, issues };
}

export function validateOntologyVNext(
  documents: OntologyVNextDocuments,
  options: OntologyVNextValidationOptions,
) {
  return inspectOntologyVNext(documents, options).issues;
}

export class OntologyVNextValidationError extends Error {
  override readonly name = "OntologyVNextValidationError";

  constructor(readonly issues: readonly OntologyVNextIssue[]) {
    super(`Ontology vNext rejected:\n${issues.map((issue) => `- [${issue.code}] ${issue.path}: ${issue.message}`).join("\n")}`);
  }
}

function frozenRows<T extends Record<string, unknown>>(rows: readonly T[]) {
  return Object.freeze(rows.map((row) => Object.freeze({ ...row })));
}

export function parseOntologyVNext(
  documents: OntologyVNextDocuments,
  options: OntologyVNextValidationOptions,
): OntologyVNextModel {
  const inspected = inspectOntologyVNext(documents, options);
  if (inspected.issues.length > 0) throw new OntologyVNextValidationError(inspected.issues);

  const axes = frozenRows(inspected.axes);
  const concepts = frozenRows(inspected.concepts);
  const memberships = frozenRows(inspected.memberships);
  const axisById = new Map(axes.map((axis) => [axis.axis_id, axis]));
  const conceptById = new Map(concepts.map((concept) => [concept.concept_id, concept]));
  const mutableMembershipsByObservation = new Map<string, Readonly<OntologyVNextMembership>[]>();
  for (const membership of memberships) {
    const bucket = mutableMembershipsByObservation.get(membership.observation_id) ?? [];
    bucket.push(membership);
    mutableMembershipsByObservation.set(membership.observation_id, bucket);
  }
  const membershipsByObservation = new Map<string, readonly Readonly<OntologyVNextMembership>[]>(
    [...mutableMembershipsByObservation].map(([observationId, bucket]) => [observationId, Object.freeze(bucket)]),
  );

  return Object.freeze({
    axes,
    concepts,
    memberships,
    axis: (axisId: string) => axisById.get(axisId),
    concept: (conceptId: string) => conceptById.get(conceptId),
    membershipsForObservation: (observationId: string) => membershipsByObservation.get(observationId) ?? [],
    conceptsForObservation: (observationId: string) =>
      Object.freeze(
        (membershipsByObservation.get(observationId) ?? []).map((membership) => conceptById.get(membership.concept_id)!),
      ),
  });
}

export function readOntologyVNextDirectory(
  directory: string,
  options: OntologyVNextValidationOptions,
) {
  return parseOntologyVNext(
    {
      axes: readFileSync(join(directory, ONTOLOGY_VNEXT_FILES.axes), "utf8"),
      concepts: readFileSync(join(directory, ONTOLOGY_VNEXT_FILES.concepts), "utf8"),
      memberships: readFileSync(join(directory, ONTOLOGY_VNEXT_FILES.memberships), "utf8"),
    },
    options,
  );
}

function renderRows<T extends Record<string, unknown>>(rows: readonly T[], identity: (row: T) => string) {
  const sorted = [...rows].sort((left, right) => compareStrings(identity(left), identity(right)));
  return sorted.length === 0 ? "" : `${sorted.map(canonicalJson).join("\n")}\n`;
}

export function renderOntologyVNextDocuments(rows: OntologyVNextRows): OntologyVNextDocuments {
  return {
    axes: renderRows(rows.axes, (axis) => axis.axis_id),
    concepts: renderRows(rows.concepts, (concept) => concept.concept_id),
    memberships: renderRows(rows.memberships, (membership) => membership.membership_id),
  };
}

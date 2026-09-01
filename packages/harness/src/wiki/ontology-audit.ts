import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { arch, platform, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { Type } from "typebox";
import type { TSchema } from "typebox";
import { Check, Errors } from "typebox/value";
import { getRepoRoot } from "../paths.js";
import { stephanusMarkers } from "../source.js";
import { parseCanonicalYamlRecord, rawFencedYamlBlocks } from "./fenced-record.js";
import {
  buildOntologyVNextFromConceptAudit,
  readOntologyConceptAudit,
} from "./ontology-concept-audit.js";
import {
  readObservationReviewStatuses,
  readOntologyVNextDocuments,
} from "./ontology-vnext-repository.js";
import { parseSnapshotLegacyFeatureEntries } from "./snapshot-legacy-feature-registry.js";
import { parseAllDocuments } from "yaml";

const SCHEMA_VERSION = 1 as const;
const SNAPSHOT_PREFIX = "sha256-";
const SHA256_PATTERN = "^[a-f0-9]{64}$";
const SHA256_RE = /^[a-f0-9]{64}$/u;
const AUDIT_ROOT = "wiki/ontology-audits";
const PROTOCOL_PATH = "docs/ontology-audit-protocol.md";
const IMPLEMENTATION_PATH = "packages/harness/src/wiki/ontology-audit.ts";
const BASELINE_EVIDENCE_PATH = "baseline-evidence.json";

const BASELINE_SUPPORT_MATERIALS = [
  { path: "derived/plato/README.md", role: "static_nonsemantic_documentation" },
  { path: "derived/plato/anchors/lexicon.toml", role: "generator_input" },
  { path: "derived/plato/metrics/procedure/anchors.toml", role: "generator_input" },
  { path: "derived/plato/turns/sigla.toml", role: "generator_input" },
  { path: "derived/plato/voices/cutovers.toml", role: "generator_input" },
  { path: "derived/plato/voices/sigla.toml", role: "generator_input" },
] as const;

const BASELINE_PROJECTION_GENERATORS = [
  { id: "stephanus", argv: ["bun", "run", "harness", "derive", "stephanus"] },
  { id: "turns", argv: ["bun", "run", "harness", "derive", "turns"] },
  { id: "tokens", argv: ["bun", "run", "harness", "derive", "tokens"] },
  { id: "anchors", argv: ["bun", "run", "harness", "derive", "anchors"] },
  { id: "anchors-report", argv: ["bun", "run", "harness", "anchors", "--write"] },
  { id: "metrics", argv: ["bun", "run", "harness", "derive", "metrics"] },
  { id: "joins", argv: ["bun", "run", "harness", "derive", "joins"] },
  { id: "voices", argv: ["bun", "run", "harness", "derive", "voices"] },
  { id: "voice-joins", argv: ["bun", "run", "harness", "derive", "voice-joins"] },
  { id: "clusters", argv: ["bun", "run", "harness", "clusters", "--write"] },
  { id: "dossiers", argv: ["bun", "run", "harness", "dossiers", "--write"] },
  { id: "label-audit", argv: ["bun", "run", "harness", "labels", "audit", "--write"] },
  { id: "label-report", argv: ["bun", "run", "harness", "labels", "report", "--write"] },
  { id: "coverage", argv: ["bun", "run", "harness", "coverage", "--write"] },
  {
    id: "completeness",
    argv: ["bun", "run", "completeness", "--", "--target", "knowledge-base", "--write"],
  },
] as const;

const BASELINE_VALIDATION_COMMANDS = [
  { id: "test", argv: ["bun", "run", "test"] },
  { id: "typecheck", argv: ["bun", "run", "typecheck"] },
  { id: "validate", argv: ["bun", "run", "validate"] },
  { id: "diff-check", argv: ["git", "diff", "--check"] },
] as const;

export function ontologyBaselineEvidenceContract() {
  return {
    supportMaterials: BASELINE_SUPPORT_MATERIALS.map((entry) => ({ ...entry })),
    projectionGenerators: BASELINE_PROJECTION_GENERATORS.map((entry) => ({
      id: entry.id,
      argv: [...entry.argv],
    })),
    validationCommands: BASELINE_VALIDATION_COMMANDS.map((entry) => ({
      id: entry.id,
      argv: [...entry.argv],
    })),
  };
}

export const ONTOLOGY_AUDIT_PARTITION_FILES = [
  "source-units.jsonl",
  "record-units.jsonl",
  "concept-membership-units.jsonl",
  "graph-units.jsonl",
  "findings.jsonl",
  "adjudications.jsonl",
] as const;

type PartitionFile = (typeof ONTOLOGY_AUDIT_PARTITION_FILES)[number];
type AuditState = "pending" | "complete";
export type ChangeKind = "unchanged" | "modified" | "added" | "removed";

export type BaselinePointer = {
  path: string;
  ordinal: number;
  raw_sha256: string;
  review_status: string | null;
};

export type FinalPointer = {
  path: string;
  ordinal: number;
  canonical_sha256: string;
};

export function ontologyAuditChangeKind(
  baseline: BaselinePointer | null,
  final: FinalPointer | null,
): ChangeKind | null {
  if (baseline === null && final === null) return null;
  if (baseline === null) return "added";
  if (final === null) return "removed";
  return baseline.raw_sha256 === final.canonical_sha256 ? "unchanged" : "modified";
}

export type OntologyAuditSourceUnit = {
  key: string;
  kind: "source_unit";
  dialogue: string;
  source_path: string;
  source_sha256: string;
  marker: string;
  start_char: number;
  end_char: number;
  text_sha256: string;
  overlapping_record_keys: string[];
  overlapping_record_key_set_sha256: string;
  primary: PendingReviewPass | CompletedReviewPass;
  independent: PendingReviewPass | CompletedReviewPass;
  reconciliation: PendingReconciliation | CompletedReconciliation;
};

type PendingReviewPass = {
  state: "pending";
  reviewer: null;
  reviewed_input_sha256: string;
  outcome: null;
  finding_ids: [];
};

type CompletedReviewPass = {
  state: "complete";
  reviewer: string;
  reviewed_input_sha256: string;
  outcome: "zero_result" | "findings";
  finding_ids: string[];
  receipt_path: string;
  receipt_sha256: string;
};

type PendingReconciliation = {
  state: "pending";
  rationale: null;
  adjudication_ids: [];
};

type CompletedReconciliation = {
  state: "agreed" | "adjudicated";
  reviewer: string;
  rationale: string | null;
  adjudication_ids: string[];
  receipt_path: string;
  receipt_sha256: string;
};

export type OntologyAuditRecordUnit = {
  key: string;
  kind: "record";
  lane: string;
  stable_id: string;
  source: { dialogue: string; start_char: number; end_char: number } | null;
  references: string[];
  baseline: BaselinePointer | null;
  final: FinalPointer | null;
  change: ChangeKind;
  audit_state: AuditState;
};

export type OntologyAuditConceptUnit =
  | {
      key: string;
      kind: "axis";
      axis_id: string;
      legacy_family: string;
      comparison_question: string | null;
      baseline: BaselinePointer | null;
      final: FinalPointer | null;
      change: ChangeKind;
      audit_state: AuditState;
    }
  | {
      key: string;
      kind: "concept";
      concept_id: string;
      axis_key: string;
      legacy_family: string;
      legacy_label: string;
      comparison_question: string | null;
      registry_membership_key_set_sha256: string;
      baseline: BaselinePointer | null;
      final: FinalPointer | null;
      change: ChangeKind;
      audit_state: AuditState;
    }
  | {
      key: string;
      kind: "membership";
      observation_key: string;
      concept_key: string;
      legacy_family: string;
      legacy_label: string;
      baseline: BaselinePointer | null;
      final: FinalPointer | null;
      change: ChangeKind;
      audit_state: AuditState;
    }
  | {
      key: string;
      kind: "axis";
      ontology_version: "vnext";
      axis_id: string;
      axis_slug: string;
      dimension: string;
      comparison_question: string;
      baseline: BaselinePointer | null;
      final: FinalPointer | null;
      change: ChangeKind;
      audit_state: AuditState;
    }
  | {
      key: string;
      kind: "concept";
      ontology_version: "vnext";
      concept_id: string;
      axis_key: string;
      concept_slug: string;
      definition: string;
      comparison_question: string;
      baseline: BaselinePointer | null;
      final: FinalPointer | null;
      change: ChangeKind;
      audit_state: AuditState;
    }
  | {
      key: string;
      kind: "membership";
      ontology_version: "vnext";
      membership_id: string;
      observation_key: string;
      concept_key: string;
      assignment_basis: string;
      baseline: BaselinePointer | null;
      final: FinalPointer | null;
      change: ChangeKind;
      audit_state: AuditState;
    };

export type OntologyAuditGraphUnit = {
  key: string;
  kind: "edge";
  edge_kind: string;
  owner_key: string;
  from_key: string;
  to_key: string | null;
  external_target: string | null;
  ordinal: number;
  baseline: BaselinePointer | null;
  final: FinalPointer | null;
  change: ChangeKind;
  audit_state: AuditState;
};

export type OntologyAuditFinding = {
  finding_id: string;
  pass: "primary" | "independent";
  reviewer: string;
  source_unit_keys: string[];
  target_keys: string[];
  defect_class: string;
  proposed_action: string;
  rationale: string;
};

type AdjudicationTargetKind = "source" | "record" | "axis" | "concept" | "membership" | "edge";

export type OntologyAuditAdjudication = {
  adjudication_id: string;
  target_key: string;
  target_kind: AdjudicationTargetKind;
  state: AuditState;
  action: string | null;
  rationale: string | null;
  finding_ids: string[];
  replacement_target_keys: string[];
  receipt_path: string | null;
};

type InputDescriptor = { path: string; sha256: string; bytes: number };
type BaselineSupportRole = (typeof BASELINE_SUPPORT_MATERIALS)[number]["role"];
type BaselineSupportDescriptor = InputDescriptor & { role: BaselineSupportRole };
type ProjectionGeneratorId = (typeof BASELINE_PROJECTION_GENERATORS)[number]["id"];
type ProjectionDescriptor = InputDescriptor & { projection: string; generator_id: ProjectionGeneratorId };
type EvidenceLogDescriptor = InputDescriptor;
type EvidenceCommand = {
  id: string;
  argv: string[];
  exit_code: number;
  outcome: "passed" | "failed";
  stdout: EvidenceLogDescriptor;
  stderr: EvidenceLogDescriptor;
};
type BaselineProjectionArtifactEvidence = {
  path: string;
  generator_id: ProjectionGeneratorId;
  bytes: number;
  expected_sha256: string;
  run_one_sha256: string;
  run_two_sha256: string;
};

export type OntologyBaselineEvidence = {
  schema_version: 1;
  state: "complete";
  snapshot_id: string;
  baseline: {
    git_commit: string;
    git_tree: string;
    corpus_digest: string;
    bun_version: string;
    bun_lock_sha256: string;
    platform: string;
    arch: string;
  };
  support_inputs: BaselineSupportDescriptor[];
  registry_projection: {
    concepts_checked: number;
    memberships_checked: number;
    mismatches: number;
  };
  validation: {
    all_passed: boolean;
    commands: EvidenceCommand[];
  };
  projection_replay: {
    artifact_count: number;
    path_set_sha256: string;
    run_one_sha256: string;
    run_two_sha256: string;
    byte_stable: boolean;
    exact_snapshot_match: boolean;
    run_one_commands: EvidenceCommand[];
    run_two_commands: EvidenceCommand[];
    artifacts: BaselineProjectionArtifactEvidence[];
  };
};
type PartitionDescriptor = {
  path: string;
  sha256: string;
  rows: number;
  key_field: "key" | "finding_id" | "target_key";
  key_set_sha256: string;
};

export type OntologyAuditManifest = {
  schema_version: 1;
  snapshot_id: string;
  audit_state: "pending" | "accepted";
  baseline: {
    git_commit: string;
    git_tree: string;
    corpus_digest: string;
    canonical_inputs: InputDescriptor[];
    greek_sources: InputDescriptor[];
    support_inputs: BaselineSupportDescriptor[];
    counts: Record<string, number>;
    owned_key_count: number;
    owned_key_set_sha256: string;
  };
  schema: { implementation_path: string; implementation_sha256: string };
  protocol: { path: string; sha256: string };
  projections: ProjectionDescriptor[];
  baseline_evidence: { path: typeof BASELINE_EVIDENCE_PATH; sha256: string } | null;
  partitions: Record<PartitionFile, PartitionDescriptor>;
  lane_states: Array<{ lane: string; count: number; state: "pending" | "complete" | "zero_result" }>;
  acceptance_path: "acceptance.json";
};

export type OntologyAuditAcceptance = {
  schema_version: 1;
  snapshot_id: string;
  state: "pending" | "accepted";
  manifest: { path: "manifest.json"; sha256: string };
  partitions: Record<PartitionFile, { sha256: string; rows: number; key_set_sha256: string }>;
  final_corpus_digest: string | null;
  receipt: { path: string; sha256: string } | null;
  closure: {
    baseline_set_equal: boolean;
    final_set_equal: boolean;
    source_passes_complete: boolean;
    reconciliations_complete: boolean;
    adjudications_complete: boolean;
    unresolved_adjudications: number;
    stale_aliases: number;
    rejected_reader_leaks: number;
    regeneration_one_sha256: string | null;
    regeneration_two_sha256: string | null;
  };
};

export type OntologyAuditIssue = {
  code:
    | "missing_package"
    | "malformed_json"
    | "schema"
    | "snapshot_id"
    | "hash_mismatch"
    | "row_count"
    | "key_set"
    | "duplicate_key"
    | "missing_adjudication"
    | "orphan_adjudication"
    | "foreign_key"
    | "source_coverage"
    | "source_hash"
    | "source_review"
    | "reconciliation"
    | "adjudication"
    | "acceptance"
    | "baseline_binding"
    | "final_binding"
    | "change_classification"
    | "projection_binding";
  path: string;
  message: string;
};

export type OntologyAuditRows = {
  sources: OntologyAuditSourceUnit[];
  records: OntologyAuditRecordUnit[];
  concepts: OntologyAuditConceptUnit[];
  graphs: OntologyAuditGraphUnit[];
  findings: OntologyAuditFinding[];
  adjudications: OntologyAuditAdjudication[];
};

type AuditRows = OntologyAuditRows;

type AuditModel = {
  snapshotId: string;
  corpusDigest: string;
  canonicalInputs: InputDescriptor[];
  greekSources: InputDescriptor[];
  supportInputs: BaselineSupportDescriptor[];
  projections: ProjectionDescriptor[];
  gitCommit: string;
  gitTree: string;
  rows: AuditRows;
  counts: Record<string, number>;
  laneStates: OntologyAuditManifest["lane_states"];
};

type CorpusReader = {
  recordFormat: "canonical" | "historical_snapshot";
  commit: string | null;
  tree: string | null;
  files(relativeRoot: string): string[];
  has(path: string): boolean;
  read(path: string): Buffer;
  readText(path: string): string;
};

type SnapshotRecord = Record<string, unknown>;

type SnapshotMarkdownBlock = ReturnType<typeof rawFencedYamlBlocks>[number] & {
  record: SnapshotRecord;
};

const Sha256Schema = Type.String({ pattern: SHA256_PATTERN });
const BaselinePointerSchema = Type.Object(
  {
    path: Type.String({ minLength: 1 }),
    ordinal: Type.Integer({ minimum: 0 }),
    raw_sha256: Sha256Schema,
    review_status: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);
const FinalPointerSchema = Type.Object(
  {
    path: Type.String({ minLength: 1 }),
    ordinal: Type.Integer({ minimum: 0 }),
    canonical_sha256: Sha256Schema,
  },
  { additionalProperties: false },
);
const NullableBaselinePointerSchema = Type.Union([BaselinePointerSchema, Type.Null()]);
const NullableFinalPointerSchema = Type.Union([FinalPointerSchema, Type.Null()]);
const ChangeSchema = Type.Union(
  [Type.Literal("unchanged"), Type.Literal("modified"), Type.Literal("added"), Type.Literal("removed")],
);
const AuditStateSchema = Type.Union([Type.Literal("pending"), Type.Literal("complete")]);
const PendingReviewPassSchema = Type.Object(
  {
    state: Type.Literal("pending"),
    reviewer: Type.Null(),
    reviewed_input_sha256: Sha256Schema,
    outcome: Type.Null(),
    finding_ids: Type.Tuple([]),
  },
  { additionalProperties: false },
);
const CompletedReviewPassSchema = Type.Object(
  {
    state: Type.Literal("complete"),
    reviewer: Type.String({ minLength: 1 }),
    reviewed_input_sha256: Sha256Schema,
    outcome: Type.Union([Type.Literal("zero_result"), Type.Literal("findings")]),
    finding_ids: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    receipt_path: Type.String({ pattern: "^wiki/review/" }),
    receipt_sha256: Sha256Schema,
  },
  { additionalProperties: false },
);
const ReviewPassSchema = Type.Union([PendingReviewPassSchema, CompletedReviewPassSchema]);
const PendingReconciliationSchema = Type.Object(
  {
    state: Type.Literal("pending"),
    rationale: Type.Null(),
    adjudication_ids: Type.Tuple([]),
  },
  { additionalProperties: false },
);
const CompletedReconciliationSchema = Type.Object(
  {
    state: Type.Union([Type.Literal("agreed"), Type.Literal("adjudicated")]),
    reviewer: Type.String({ minLength: 1 }),
    rationale: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    adjudication_ids: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    receipt_path: Type.String({ pattern: "^wiki/review/" }),
    receipt_sha256: Sha256Schema,
  },
  { additionalProperties: false },
);

const SourceUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^source:" }),
    kind: Type.Literal("source_unit"),
    dialogue: Type.String({ minLength: 1 }),
    source_path: Type.String({ pattern: "^raw/plato/greek/" }),
    source_sha256: Sha256Schema,
    marker: Type.String({ minLength: 1 }),
    start_char: Type.Integer({ minimum: 0 }),
    end_char: Type.Integer({ minimum: 0 }),
    text_sha256: Sha256Schema,
    overlapping_record_keys: Type.Array(Type.String({ pattern: "^record:" }), { uniqueItems: true }),
    overlapping_record_key_set_sha256: Sha256Schema,
    primary: ReviewPassSchema,
    independent: ReviewPassSchema,
    reconciliation: Type.Union([PendingReconciliationSchema, CompletedReconciliationSchema]),
  },
  { additionalProperties: false },
);

const SourcePointerSchema = Type.Union([
  Type.Object(
    {
      dialogue: Type.String({ minLength: 1 }),
      start_char: Type.Integer({ minimum: 0 }),
      end_char: Type.Integer({ minimum: 0 }),
    },
    { additionalProperties: false },
  ),
  Type.Null(),
]);

const RecordUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^record:" }),
    kind: Type.Literal("record"),
    lane: Type.String({ minLength: 1 }),
    stable_id: Type.String({ minLength: 1 }),
    source: SourcePointerSchema,
    references: Type.Array(Type.String({ minLength: 1 })),
    baseline: NullableBaselinePointerSchema,
    final: NullableFinalPointerSchema,
    change: ChangeSchema,
    audit_state: AuditStateSchema,
  },
  { additionalProperties: false },
);

const CommonUnionFields = {
  baseline: NullableBaselinePointerSchema,
  final: NullableFinalPointerSchema,
  change: ChangeSchema,
  audit_state: AuditStateSchema,
};

const AxisUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^axis:" }),
    kind: Type.Literal("axis"),
    axis_id: Type.String({ minLength: 1 }),
    legacy_family: Type.String({ minLength: 1 }),
    comparison_question: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);
const ConceptUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^concept:" }),
    kind: Type.Literal("concept"),
    concept_id: Type.String({ minLength: 1 }),
    axis_key: Type.String({ pattern: "^axis:" }),
    legacy_family: Type.String({ minLength: 1 }),
    legacy_label: Type.String({ minLength: 1 }),
    comparison_question: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    registry_membership_key_set_sha256: Sha256Schema,
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);
const MembershipUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^membership:" }),
    kind: Type.Literal("membership"),
    observation_key: Type.String({ pattern: "^record:observation:" }),
    concept_key: Type.String({ pattern: "^concept:" }),
    legacy_family: Type.String({ minLength: 1 }),
    legacy_label: Type.String({ minLength: 1 }),
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);
const VNextAxisUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^axis:vnext:" }),
    kind: Type.Literal("axis"),
    ontology_version: Type.Literal("vnext"),
    axis_id: Type.String({ pattern: "^axis_sha256_[a-f0-9]{64}$" }),
    axis_slug: Type.String({ minLength: 1 }),
    dimension: Type.String({ minLength: 1 }),
    comparison_question: Type.String({ minLength: 1 }),
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);
const VNextConceptUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^concept:vnext:" }),
    kind: Type.Literal("concept"),
    ontology_version: Type.Literal("vnext"),
    concept_id: Type.String({ pattern: "^concept_sha256_[a-f0-9]{64}$" }),
    axis_key: Type.String({ pattern: "^axis:vnext:" }),
    concept_slug: Type.String({ minLength: 1 }),
    definition: Type.String({ minLength: 1 }),
    comparison_question: Type.String({ minLength: 1 }),
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);
const VNextMembershipUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^membership:vnext:" }),
    kind: Type.Literal("membership"),
    ontology_version: Type.Literal("vnext"),
    membership_id: Type.String({ pattern: "^membership_sha256_[a-f0-9]{64}$" }),
    observation_key: Type.String({ pattern: "^record:observation:" }),
    concept_key: Type.String({ pattern: "^concept:vnext:" }),
    assignment_basis: Type.String({ minLength: 1 }),
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);
const ConceptMembershipUnitSchema = Type.Union([
  AxisUnitSchema,
  ConceptUnitSchema,
  MembershipUnitSchema,
  VNextAxisUnitSchema,
  VNextConceptUnitSchema,
  VNextMembershipUnitSchema,
]);

const GraphUnitSchema = Type.Object(
  {
    key: Type.String({ pattern: "^edge:" }),
    kind: Type.Literal("edge"),
    edge_kind: Type.String({ minLength: 1 }),
    owner_key: Type.String({ minLength: 1 }),
    from_key: Type.String({ minLength: 1 }),
    to_key: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    external_target: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    ordinal: Type.Integer({ minimum: 0 }),
    ...CommonUnionFields,
  },
  { additionalProperties: false },
);

const FindingSchema = Type.Object(
  {
    finding_id: Type.String({ pattern: "^finding:" }),
    pass: Type.Union([Type.Literal("primary"), Type.Literal("independent")]),
    reviewer: Type.String({ minLength: 1 }),
    source_unit_keys: Type.Array(Type.String({ pattern: "^source:" }), { minItems: 1, uniqueItems: true }),
    target_keys: Type.Array(Type.String({ minLength: 1 }), { minItems: 1, uniqueItems: true }),
    defect_class: Type.String({ minLength: 1 }),
    proposed_action: Type.String({ minLength: 1 }),
    rationale: Type.String({ minLength: 20 }),
  },
  { additionalProperties: false },
);

const AdjudicationSchema = Type.Object(
  {
    adjudication_id: Type.String({ pattern: "^adjudication:" }),
    target_key: Type.String({ minLength: 1 }),
    target_kind: Type.Union([
      Type.Literal("record"),
      Type.Literal("source"),
      Type.Literal("axis"),
      Type.Literal("concept"),
      Type.Literal("membership"),
      Type.Literal("edge"),
    ]),
    state: AuditStateSchema,
    action: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    rationale: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    finding_ids: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    replacement_target_keys: Type.Array(Type.String({ minLength: 1 }), { uniqueItems: true }),
    receipt_path: Type.Union([Type.String({ pattern: "^wiki/review/" }), Type.Null()]),
  },
  { additionalProperties: false },
);

const InputDescriptorSchema = Type.Object(
  { path: Type.String({ minLength: 1 }), sha256: Sha256Schema, bytes: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false },
);
const ProjectionDescriptorSchema = Type.Object(
  {
    path: Type.String({ minLength: 1 }),
    sha256: Sha256Schema,
    bytes: Type.Integer({ minimum: 0 }),
    projection: Type.String({ minLength: 1 }),
    generator_id: Type.Union(BASELINE_PROJECTION_GENERATORS.map((entry) => Type.Literal(entry.id))),
  },
  { additionalProperties: false },
);
const BaselineSupportDescriptorSchema = Type.Object(
  {
    path: Type.String({ minLength: 1 }),
    sha256: Sha256Schema,
    bytes: Type.Integer({ minimum: 0 }),
    role: Type.Union([
      Type.Literal("generator_input"),
      Type.Literal("static_nonsemantic_documentation"),
    ]),
  },
  { additionalProperties: false },
);
const PartitionDescriptorSchema = Type.Object(
  {
    path: Type.String({ minLength: 1 }),
    sha256: Sha256Schema,
    rows: Type.Integer({ minimum: 0 }),
    key_field: Type.Union([
      Type.Literal("key"),
      Type.Literal("finding_id"),
      Type.Literal("target_key"),
    ]),
    key_set_sha256: Sha256Schema,
  },
  { additionalProperties: false },
);
const PartitionMapSchema = Type.Object(
  Object.fromEntries(ONTOLOGY_AUDIT_PARTITION_FILES.map((path) => [path, PartitionDescriptorSchema])),
  { additionalProperties: false },
);
const ManifestSchema = Type.Object(
  {
    schema_version: Type.Literal(1),
    snapshot_id: Type.String({ pattern: `^${SNAPSHOT_PREFIX}[a-f0-9]{64}$` }),
    audit_state: Type.Union([Type.Literal("pending"), Type.Literal("accepted")]),
    baseline: Type.Object(
      {
        git_commit: Type.String({ pattern: "^[a-f0-9]{40}$" }),
        git_tree: Type.String({ pattern: "^[a-f0-9]{40}$" }),
        corpus_digest: Sha256Schema,
        canonical_inputs: Type.Array(InputDescriptorSchema),
        greek_sources: Type.Array(InputDescriptorSchema),
        support_inputs: Type.Array(BaselineSupportDescriptorSchema),
        counts: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
        owned_key_count: Type.Integer({ minimum: 0 }),
        owned_key_set_sha256: Sha256Schema,
      },
      { additionalProperties: false },
    ),
    schema: Type.Object(
      { implementation_path: Type.String({ minLength: 1 }), implementation_sha256: Sha256Schema },
      { additionalProperties: false },
    ),
    protocol: Type.Object(
      { path: Type.String({ minLength: 1 }), sha256: Sha256Schema },
      { additionalProperties: false },
    ),
    projections: Type.Array(ProjectionDescriptorSchema),
    baseline_evidence: Type.Union([
      Type.Object(
        { path: Type.Literal(BASELINE_EVIDENCE_PATH), sha256: Sha256Schema },
        { additionalProperties: false },
      ),
      Type.Null(),
    ]),
    partitions: PartitionMapSchema,
    lane_states: Type.Array(
      Type.Object(
        {
          lane: Type.String({ minLength: 1 }),
          count: Type.Integer({ minimum: 0 }),
          state: Type.Union([
            Type.Literal("pending"),
            Type.Literal("complete"),
            Type.Literal("zero_result"),
          ]),
        },
        { additionalProperties: false },
      ),
    ),
    acceptance_path: Type.Literal("acceptance.json"),
  },
  { additionalProperties: false },
);

const AcceptancePartitionSchema = Type.Object(
  { sha256: Sha256Schema, rows: Type.Integer({ minimum: 0 }), key_set_sha256: Sha256Schema },
  { additionalProperties: false },
);
const AcceptanceSchema = Type.Object(
  {
    schema_version: Type.Literal(1),
    snapshot_id: Type.String({ pattern: `^${SNAPSHOT_PREFIX}[a-f0-9]{64}$` }),
    state: Type.Union([Type.Literal("pending"), Type.Literal("accepted")]),
    manifest: Type.Object(
      { path: Type.Literal("manifest.json"), sha256: Sha256Schema },
      { additionalProperties: false },
    ),
    partitions: Type.Object(
      Object.fromEntries(ONTOLOGY_AUDIT_PARTITION_FILES.map((path) => [path, AcceptancePartitionSchema])),
      { additionalProperties: false },
    ),
    final_corpus_digest: Type.Union([Sha256Schema, Type.Null()]),
    receipt: Type.Union([
      Type.Object(
        { path: Type.String({ pattern: "^wiki/review/" }), sha256: Sha256Schema },
        { additionalProperties: false },
      ),
      Type.Null(),
    ]),
    closure: Type.Object(
      {
        baseline_set_equal: Type.Boolean(),
        final_set_equal: Type.Boolean(),
        source_passes_complete: Type.Boolean(),
        reconciliations_complete: Type.Boolean(),
        adjudications_complete: Type.Boolean(),
        unresolved_adjudications: Type.Integer({ minimum: 0 }),
        stale_aliases: Type.Integer({ minimum: 0 }),
        rejected_reader_leaks: Type.Integer({ minimum: 0 }),
        regeneration_one_sha256: Type.Union([Sha256Schema, Type.Null()]),
        regeneration_two_sha256: Type.Union([Sha256Schema, Type.Null()]),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const schemasByPartition = {
  "source-units.jsonl": SourceUnitSchema,
  "record-units.jsonl": RecordUnitSchema,
  "concept-membership-units.jsonl": ConceptMembershipUnitSchema,
  "graph-units.jsonl": GraphUnitSchema,
  "findings.jsonl": FindingSchema,
  "adjudications.jsonl": AdjudicationSchema,
} as const;

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function renderJsonl(rows: readonly unknown[]) {
  return rows.length === 0 ? "" : `${rows.map((row) => canonicalJson(row)).join("\n")}\n`;
}

/** Preserve JSON row bytes while enforcing the repository's JSONL transport. */
export function normalizeOntologyAuditJsonl(content: string, context = "JSONL") {
  const lf = content.replace(/\r\n?/gu, "\n");
  const lines = lf.split("\n");
  while (lines.at(-1) === "") lines.pop();
  if (lines.some((line) => /^\s*$/u.test(line))) {
    throw new Error(`${context} contains an interior blank JSONL row`);
  }
  for (const [index, line] of lines.entries()) {
    try {
      JSON.parse(line);
    } catch (error) {
      throw new Error(
        `${context}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

function keySetSha256(keys: readonly string[]) {
  const sorted = [...keys].sort();
  return sha256(sorted.length === 0 ? "" : `${sorted.join("\n")}\n`);
}

function legacyRegistryProjectionSummary(rows: readonly OntologyAuditConceptUnit[]) {
  const concepts = rows.filter((row): row is Extract<OntologyAuditConceptUnit, {
    kind: "concept";
    registry_membership_key_set_sha256: string;
  }> => row.kind === "concept" && "registry_membership_key_set_sha256" in row && row.baseline !== null);
  const memberships = rows.filter((row): row is Extract<OntologyAuditConceptUnit, {
    kind: "membership";
    legacy_family: string;
  }> => row.kind === "membership" && "legacy_family" in row && row.baseline !== null);
  const membershipKeysByConcept = new Map<string, string[]>();
  for (const membership of memberships) {
    const bucket = membershipKeysByConcept.get(membership.concept_key) ?? [];
    bucket.push(membership.key);
    membershipKeysByConcept.set(membership.concept_key, bucket);
  }
  const mismatches = concepts
    .filter((concept) =>
      keySetSha256(membershipKeysByConcept.get(concept.key) ?? [])
        !== concept.registry_membership_key_set_sha256
    )
    .map((concept) => concept.key)
    .sort();
  return {
    conceptsChecked: concepts.length,
    membershipsChecked: memberships.length,
    mismatches,
  };
}

function repoPath(repoRoot: string, absolutePath: string) {
  return relative(repoRoot, absolutePath).split("\\").join("/");
}

function walkFiles(repoRoot: string, relativeRoot: string): string[] {
  const absoluteRoot = join(repoRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  const walk = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return walk(path);
      return entry.isFile() ? [repoPath(repoRoot, path)] : [];
    });
  return walk(absoluteRoot).sort();
}

function worktreeCorpusReader(repoRoot: string): CorpusReader {
  return {
    recordFormat: "canonical",
    commit: null,
    tree: null,
    files: (relativeRoot) => walkFiles(repoRoot, relativeRoot),
    has: (path) => existsSync(join(repoRoot, path)),
    read: (path) => readFileSync(join(repoRoot, path)),
    readText: (path) => readFileSync(join(repoRoot, path), "utf8"),
  };
}

function gitCorpusReader(repoRoot: string, revision = "HEAD"): CorpusReader {
  const commit = gitValue(repoRoot, ["rev-parse", `${revision}^{commit}`]);
  const tree = gitValue(repoRoot, ["rev-parse", `${commit}^{tree}`]);
  const paths = gitValue(repoRoot, ["ls-tree", "-r", "--name-only", commit])
    .split("\n")
    .filter(Boolean)
    .sort();
  const pathSet = new Set(paths);
  const cache = new Map<string, Buffer>();
  const read = (path: string) => {
    const cached = cache.get(path);
    if (cached) return cached;
    if (!pathSet.has(path)) throw new Error(`${commit}:${path} is not present in the frozen Git tree`);
    const value = execFileSync("git", ["show", `${commit}:${path}`], {
      cwd: repoRoot,
      maxBuffer: 64 * 1024 * 1024,
    });
    const content = Buffer.isBuffer(value) ? value : Buffer.from(value);
    cache.set(path, content);
    return content;
  };
  return {
    recordFormat: "historical_snapshot",
    commit,
    tree,
    files: (relativeRoot) => {
      const prefix = relativeRoot.endsWith("/") ? relativeRoot : `${relativeRoot}/`;
      return paths.filter((path) => path.startsWith(prefix));
    },
    has: (path) => pathSet.has(path),
    read,
    readText: (path) => read(path).toString("utf8"),
  };
}

function descriptor(reader: CorpusReader, path: string): InputDescriptor {
  const content = reader.read(path);
  return { path, sha256: sha256(content), bytes: content.byteLength };
}

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function canonicalInputPaths(reader: CorpusReader) {
  const roots = [
    "raw/plato/greek",
    "wiki/observations",
    "wiki/ontology",
    "wiki/claims",
    "wiki/relations",
    "wiki/commentary",
    "wiki/voices",
    "wiki/apparatus",
    "wiki/recordings",
    "wiki/review",
    "wiki/commentary-audits",
    "wiki/label-consolidation",
  ];
  const explicit = [
    "raw/plato/MANIFEST.sha256",
    "raw/plato/SOURCES.md",
    "wiki/features-so-far.md",
    "wiki/ingest-log.md",
    "wiki/reported-turn-scopes.json",
  ];
  return uniqueSorted([
    ...roots.flatMap((root) => reader.files(root)),
    ...explicit.filter((path) => reader.has(path)),
  ]).filter((path) => !path.startsWith(`${AUDIT_ROOT}/`) && !path.includes("/history/"));
}

function projectionGeneratorId(path: string): ProjectionGeneratorId {
  if (path.startsWith("wiki/clusters/")) return "clusters";
  if (path.startsWith("wiki/dossiers/")) return "dossiers";
  if (path === "wiki/label-audit.md") return "label-audit";
  if (path === "wiki/label-quality.md") return "label-report";
  if (path === "wiki/coverage-gaps.md") return "coverage";
  if (path === "wiki/completeness.md") return "completeness";
  if (path.startsWith("derived/plato/joins/voices/")) return "voice-joins";
  if (path.startsWith("derived/plato/joins/")) return "joins";
  if (path.startsWith("derived/plato/voices/")) return "voices";
  if (path.startsWith("derived/plato/metrics/")) return "metrics";
  if (path === "derived/plato/anchors/report.md") return "anchors-report";
  if (path.startsWith("derived/plato/anchors/")) return "anchors";
  if (path.startsWith("derived/plato/tokens/")) return "tokens";
  if (path.startsWith("derived/plato/turns/")) return "turns";
  if (path.startsWith("derived/plato/stephanus/")) return "stephanus";
  throw new Error(`No exact baseline projection generator owns ${path}`);
}

function projectionKind(path: string) {
  if (path.startsWith("wiki/clusters/")) return "clusters";
  if (path.startsWith("wiki/dossiers/")) return "dossiers";
  if (path.startsWith("derived/plato/")) return path.split("/").slice(0, 4).join("/");
  return basename(path);
}

function projectionDescriptors(reader: CorpusReader): ProjectionDescriptor[] {
  const explicit = ["wiki/label-audit.md", "wiki/label-quality.md", "wiki/coverage-gaps.md", "wiki/completeness.md"];
  const supportPaths = new Set<string>(BASELINE_SUPPORT_MATERIALS.map((entry) => entry.path));
  const paths = uniqueSorted([
    ...reader.files("derived/plato").filter((path) => !path.startsWith("derived/plato/stephanus-english/")),
    ...reader.files("wiki/clusters"),
    ...reader.files("wiki/dossiers"),
    ...explicit.filter((path) => reader.has(path)),
  ]).filter((path) => !supportPaths.has(path));
  return paths.map((path) => ({
    ...descriptor(reader, path),
    projection: projectionKind(path),
    generator_id: projectionGeneratorId(path),
  }));
}

function baselineSupportDescriptors(reader: CorpusReader): BaselineSupportDescriptor[] {
  return BASELINE_SUPPORT_MATERIALS.map(({ path, role }) => {
    if (!reader.has(path)) throw new Error(`Frozen baseline support material is missing: ${path}`);
    return { ...descriptor(reader, path), role };
  });
}

function baselinePointer(path: string, ordinal: number, raw: string, reviewStatus: string | null): BaselinePointer {
  return { path, ordinal, raw_sha256: sha256(raw), review_status: reviewStatus };
}

function finalPointer(pointer: BaselinePointer): FinalPointer {
  return { path: pointer.path, ordinal: pointer.ordinal, canonical_sha256: pointer.raw_sha256 };
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function isSnapshotRecord(value: unknown): value is SnapshotRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function looseFieldSection(content: string, field: string, indent: number) {
  const lines = content.split(/\r?\n/u);
  const prefix = " ".repeat(indent);
  const pattern = new RegExp(`^${prefix}${field}:\\s*(.*)$`, "u");
  const index = lines.findIndex((line) => pattern.test(line));
  if (index < 0) return undefined;
  const inline = pattern.exec(lines[index]!)?.[1]?.trim() ?? "";
  const nested: string[] = [];
  for (const line of lines.slice(index + 1)) {
    if (line.trim().length === 0) {
      nested.push(line);
      continue;
    }
    const leading = /^\s*/u.exec(line)?.[0].length ?? 0;
    if (leading <= indent) break;
    nested.push(line);
  }
  return { inline, nested };
}

function looseScalar(content: string, field: string, indent = 0): string | number | boolean | undefined {
  const value = looseFieldSection(content, field, indent)?.inline;
  if (!value || value === "[]" || value === "{}" || value === "null" || value === "~") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/u.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value) as string;
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/gu, "'");
  return value;
}

function looseInlineList(value: string) {
  if (value === "[]") return [];
  const body = value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
  const values: string[] = [];
  const pattern = /"((?:\\.|[^"\\])*)"|'((?:''|[^'])*)'|([^,]+)/gu;
  for (const match of body.matchAll(pattern)) {
    const raw = match[1] !== undefined
      ? (() => {
          try {
            return JSON.parse(`"${match[1]}"`) as string;
          } catch {
            return match[1]!;
          }
        })()
      : match[2] !== undefined
        ? match[2].replace(/''/gu, "'")
        : match[3]?.trim();
    if (raw) values.push(raw);
  }
  return values;
}

function looseStringList(content: string, field: string, indent = 0) {
  const section = looseFieldSection(content, field, indent);
  if (!section) return [];
  if (section.inline) return looseInlineList(section.inline);
  const itemIndent = indent + 2;
  const itemPattern = new RegExp(`^${" ".repeat(itemIndent)}-\\s*(.+?)\\s*$`, "u");
  return section.nested.flatMap((line) => {
    const value = itemPattern.exec(line)?.[1];
    if (!value) return [];
    const parsed = looseInlineList(value);
    return parsed.length === 1 ? parsed : [value.replace(/^['"]|['"]$/gu, "")];
  });
}

function looseObjectList(content: string, field: string, indent = 0) {
  const section = looseFieldSection(content, field, indent);
  if (!section || section.inline === "[]") return [];
  if (section.inline) return [{ snapshot_raw: section.inline }];
  const itemIndent = indent + 2;
  const itemPrefix = `${" ".repeat(itemIndent)}- `;
  const items: Array<{ snapshot_raw: string }> = [];
  let current: string[] = [];
  for (const line of section.nested) {
    if (line.startsWith(itemPrefix)) {
      if (current.length > 0) items.push({ snapshot_raw: current.join("\n") });
      current = [line];
    } else if (current.length > 0) {
      current.push(line);
    }
  }
  if (current.length > 0) items.push({ snapshot_raw: current.join("\n") });
  return items;
}

function looseNestedRecord(content: string, parent: string, scalarFields: readonly string[], listFields: readonly string[] = []) {
  const section = looseFieldSection(content, parent, 0);
  if (!section) return undefined;
  const nestedContent = section.nested.join("\n");
  const record: SnapshotRecord = {};
  for (const field of scalarFields) {
    const value = looseScalar(nestedContent, field, 2);
    if (value !== undefined) record[field] = value;
  }
  for (const field of listFields) record[field] = looseStringList(nestedContent, field, 2);
  return record;
}

function parseLooseSnapshotRecord(content: string): SnapshotRecord {
  const record: SnapshotRecord = {};
  const scalarFields = [
    "observation_id", "claim_id", "relation_id", "commentary_id", "apparatus_id", "voice_id",
    "review_status", "feature_id", "feature_family", "feature_label", "claim_a", "claim_b",
    "relation_kind", "outer_turn_id", "source_path",
  ];
  for (const field of scalarFields) {
    const value = looseScalar(content, field);
    if (value !== undefined) record[field] = value;
  }
  for (const field of ["observation_ids", "voice_chain", "candidate_owners"]) {
    record[field] = looseStringList(content, field);
  }
  for (const field of ["stance_events", "evidence_refs", "crossrefs"]) {
    record[field] = looseObjectList(content, field);
  }
  for (const parent of ["source_ref", "resolution_ref"]) {
    const nested = looseNestedRecord(content, parent, ["source_path", "start_char", "end_char"]);
    if (nested) record[parent] = nested;
  }
  const span = looseNestedRecord(content, "char_span", ["start_char", "end_char"]);
  if (span) record.char_span = span;
  const cites = looseNestedRecord(content, "cites", [], ["observations", "claims", "relations", "dossiers"]);
  if (cites) record.cites = cites;
  const reviewed = looseNestedRecord(content, "reviewed_attribution", [], ["candidate_owners"]);
  if (reviewed) record.reviewed_attribution = reviewed;
  return record;
}

/**
 * Historical-only ingestion for the frozen pre-vNext tree. The old corpus
 * wrapped otherwise usable mappings in YAML document delimiters, which the
 * hard-cut runtime parser correctly rejects. This reader is private to the
 * content-addressed baseline compiler and never participates in live readers.
 */
function parseSnapshotRecord(content: string, context: string): SnapshotRecord {
  const documents = parseAllDocuments(content, {
    customTags: [],
    merge: false,
    prettyErrors: true,
    resolveKnownTags: false,
    schema: "core",
    strict: false,
    uniqueKeys: false,
    version: "1.2",
  });
  const errors = documents.flatMap((document) => document.errors);
  if (errors.length > 0) {
    const loose = parseLooseSnapshotRecord(content);
    if (Object.keys(loose).length === 0) {
      throw new Error(`${context} cannot be inventoried: ${errors.map((error) => error.message).join("; ")}`);
    }
    return loose;
  }
  const records = documents
    .map((document) => document.toJS({ maxAliasCount: 0 }) as unknown)
    .filter(isSnapshotRecord);
  if (records.length !== 1) {
    const loose = parseLooseSnapshotRecord(content);
    if (Object.keys(loose).length > 0) return loose;
    throw new Error(`${context} must contain exactly one mapping document; found ${records.length}`);
  }
  return records[0]!;
}

function snapshotMarkdownBlocks(reader: CorpusReader, content: string, path: string): SnapshotMarkdownBlock[] {
  return rawFencedYamlBlocks(content).map((block) => ({
    ...block,
    record: reader.recordFormat === "historical_snapshot"
      ? parseSnapshotRecord(block.content, `${path}: yaml fence ${block.index + 1}`)
      : parseCanonicalYamlRecord(block.content, { context: `${path}: yaml fence ${block.index + 1}` }),
  }));
}

function snapshotScalar(record: SnapshotRecord, field: string) {
  const value = record[field];
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function snapshotStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (typeof entry === "number" || typeof entry === "boolean") return [String(entry)];
    return [];
  });
}

function snapshotNestedRecord(record: SnapshotRecord, field: string) {
  const value = record[field];
  return isSnapshotRecord(value) ? value : undefined;
}

function snapshotNestedScalar(record: SnapshotRecord, parent: string, field: string) {
  const value = snapshotNestedRecord(record, parent)?.[field];
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function sourcePointer(record: SnapshotRecord, dialogue: string, parent = "source_ref") {
  const startValue = snapshotNestedScalar(record, parent, "start_char");
  const endValue = snapshotNestedScalar(record, parent, "end_char");
  const start = startValue === undefined ? undefined : numberValue(startValue);
  const end = endValue === undefined ? undefined : numberValue(endValue);
  return start === undefined || end === undefined ? null : { dialogue, start_char: start, end_char: end };
}

function recordKey(lane: string, stableId: string) {
  return `record:${lane}:${stableId}`;
}

function markdownPaths(reader: CorpusReader, root: string) {
  return reader.files(root).filter((path) => path.endsWith(".md"));
}

function sourceDialogue(record: SnapshotRecord, parent: string, fallback: string) {
  const path = snapshotNestedScalar(record, parent, "source_path");
  return path ? basename(path, ".txt") : fallback;
}

function readMarkdownRecordUnits(
  reader: CorpusReader,
  lane: string,
  paths: string[],
  idField: string,
  references: (record: SnapshotRecord) => string[],
  source: (path: string, record: SnapshotRecord) => OntologyAuditRecordUnit["source"],
) {
  const records: OntologyAuditRecordUnit[] = [];
  for (const path of paths) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const stableId = snapshotScalar(block.record, idField);
      if (!stableId) throw new Error(`${path}: block ${block.index + 1} has no ${idField}`);
      const baseline = baselinePointer(path, block.index, block.fullMatch, snapshotScalar(block.record, "review_status") ?? null);
      records.push({
        key: recordKey(lane, stableId),
        kind: "record",
        lane,
        stable_id: stableId,
        source: source(path, block.record),
        references: references(block.record),
        baseline,
        final: finalPointer(baseline),
        change: "unchanged",
        audit_state: "pending",
      });
    }
  }
  return records;
}

function buildRecordUnits(reader: CorpusReader) {
  const observations = readMarkdownRecordUnits(
    reader,
    "observation",
    markdownPaths(reader, "wiki/observations"),
    "observation_id",
    () => [],
    (path, record) => sourcePointer(record, sourceDialogue(record, "source_ref", basename(path, ".md"))),
  );
  const claims = readMarkdownRecordUnits(
    reader,
    "claim",
    markdownPaths(reader, "wiki/claims"),
    "claim_id",
    (record) => snapshotStringList(record.observation_ids).map((id) => recordKey("observation", id)),
    (path, record) => sourcePointer(record, sourceDialogue(record, "source_ref", basename(path, ".md"))),
  );
  const relations = readMarkdownRecordUnits(
    reader,
    "relation",
    markdownPaths(reader, "wiki/relations"),
    "relation_id",
    (record) => [snapshotScalar(record, "claim_a"), snapshotScalar(record, "claim_b")]
      .filter((id): id is string => Boolean(id))
      .map((id) => recordKey("claim", id)),
    (path, record) => sourcePointer(record, sourceDialogue(record, "resolution_ref", basename(path, ".md")), "resolution_ref"),
  );
  const commentary = readMarkdownRecordUnits(
    reader,
    "commentary",
    markdownPaths(reader, "wiki/commentary"),
    "commentary_id",
    (record) => {
      const cites = snapshotNestedRecord(record, "cites") ?? {};
      const crossrefs = Array.isArray(record.crossrefs) ? record.crossrefs : [];
      return [
        ...snapshotStringList(cites.observations).map((id) => recordKey("observation", id)),
        ...snapshotStringList(cites.claims).map((id) => recordKey("claim", id)),
        ...snapshotStringList(cites.relations).map((id) => recordKey("relation", id)),
        ...snapshotStringList(cites.dossiers).map((id) => `projection:dossier:${id}`),
        ...crossrefs.map((entry) => `external:source-crossref:${canonicalJson(entry)}`),
      ];
    },
    (path, record) => sourcePointer(record, sourceDialogue(record, "source_ref", basename(path, ".md"))),
  );
  const apparatus = readMarkdownRecordUnits(
    reader,
    "apparatus",
    markdownPaths(reader, "wiki/apparatus"),
    "apparatus_id",
    () => [],
    (path, record) => sourcePointer(record, sourceDialogue(record, "source_ref", basename(path, ".md"))),
  );
  const voices: OntologyAuditRecordUnit[] = [];
  for (const path of markdownPaths(reader, "wiki/voices")) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const voiceId = snapshotScalar(block.record, "voice_id");
      const outerTurnId = snapshotScalar(block.record, "outer_turn_id");
      const span = snapshotNestedRecord(block.record, "char_span");
      const startChar = typeof span?.start_char === "number" ? span.start_char : Number(span?.start_char);
      const endChar = typeof span?.end_char === "number" ? span.end_char : Number(span?.end_char);
      if (!voiceId || !outerTurnId || !Number.isInteger(startChar) || !Number.isInteger(endChar)) {
        throw new Error(`${path}: incomplete voice record in block ${block.index + 1}`);
      }
      const baseline = baselinePointer(path, block.index, block.fullMatch, snapshotScalar(block.record, "review_status") ?? null);
      voices.push({
        key: recordKey("voice", voiceId),
        kind: "record",
        lane: "voice",
        stable_id: voiceId,
        source: {
          dialogue: basename(snapshotScalar(block.record, "source_path") ?? path, snapshotScalar(block.record, "source_path") ? ".txt" : ".md"),
          start_char: startChar,
          end_char: endChar,
        },
        references: [`external:turn:${outerTurnId}`],
        baseline,
        final: finalPointer(baseline),
        change: "unchanged",
        audit_state: "pending",
      });
    }
  }
  const recordings: OntologyAuditRecordUnit[] = [];
  for (const path of reader.files("wiki/recordings").filter((entry) => entry.endsWith(".json"))) {
    const raw = reader.readText(path);
    const parsed = JSON.parse(raw) as { recording_id?: string; status?: string; chapters?: Array<{ commentary_id?: string }> };
    if (!parsed.recording_id) throw new Error(`${path}: missing recording_id`);
    const baseline = baselinePointer(path, 0, raw, parsed.status ?? null);
    recordings.push({
      key: recordKey("recording", parsed.recording_id),
      kind: "record",
      lane: "recording",
      stable_id: parsed.recording_id,
      source: null,
      references: (parsed.chapters ?? [])
        .map((chapter) => chapter.commentary_id)
        .filter((id): id is string => Boolean(id))
        .map((id) => recordKey("commentary", id)),
      baseline,
      final: finalPointer(baseline),
      change: "unchanged",
      audit_state: "pending",
    });
  }
  const scopes: OntologyAuditRecordUnit[] = [];
  const scopesPath = "wiki/reported-turn-scopes.json";
  if (reader.has(scopesPath)) {
    const parsed = JSON.parse(reader.readText(scopesPath)) as {
      dialogues?: Array<{ dialogue?: string; disposition?: string; outerTurnIds?: string[]; reviewReceipt?: { path?: string } }>;
    };
    for (const [ordinal, scope] of (parsed.dialogues ?? []).entries()) {
      if (!scope.dialogue) throw new Error(`${scopesPath}: dialogue row ${ordinal + 1} has no dialogue`);
      const stableId = scope.dialogue;
      const raw = canonicalJson(scope);
      const baseline = baselinePointer(scopesPath, ordinal, raw, scope.disposition ?? null);
      scopes.push({
        key: recordKey("reported-turn-scope", stableId),
        kind: "record",
        lane: "reported-turn-scope",
        stable_id: stableId,
        source: null,
        references: [
          ...(scope.outerTurnIds ?? []).map((id) => `external:turn:${id}`),
          ...(scope.reviewReceipt?.path ? [`external:receipt:${scope.reviewReceipt.path}`] : []),
        ],
        baseline,
        final: finalPointer(baseline),
        change: "unchanged",
        audit_state: "pending",
      });
    }
  }
  return [...observations, ...claims, ...relations, ...commentary, ...apparatus, ...voices, ...recordings, ...scopes]
    .sort((a, b) => a.key.localeCompare(b.key));
}

function featureEntryRawSections(content: string) {
  const matches = [...content.matchAll(/^###\s+[a-zA-Z0-9_-]+\s*$/gmu)];
  return matches.map((match, index) => content.slice(match.index ?? 0, matches[index + 1]?.index ?? content.length));
}

type SnapshotVNextAxis = {
  axis_id: string;
  axis_key: string;
  dimension: string;
  comparison_question: string;
};

type SnapshotVNextConcept = {
  concept_id: string;
  axis_id: string;
  concept_key: string;
  definition: string;
  comparison_question: string;
};

type SnapshotVNextMembership = {
  membership_id: string;
  observation_id: string;
  concept_id: string;
  assignment_basis: string;
};

function snapshotJsonl<T>(reader: CorpusReader, path: string): Array<{ row: T; raw: string; ordinal: number }> {
  return reader.readText(path).split(/\r?\n/u).filter(Boolean).map((raw, ordinal) => ({
    row: JSON.parse(raw) as T,
    raw,
    ordinal,
  }));
}

function buildVNextConceptUnits(reader: CorpusReader) {
  const axesPath = "wiki/ontology/axes.jsonl";
  const conceptsPath = "wiki/ontology/concepts.jsonl";
  const membershipsPath = "wiki/ontology/memberships.jsonl";
  const axes = snapshotJsonl<SnapshotVNextAxis>(reader, axesPath).map(({ row, raw, ordinal }): OntologyAuditConceptUnit => {
    const baseline = baselinePointer(axesPath, ordinal, raw, null);
    return {
      key: `axis:vnext:${row.axis_id}`,
      kind: "axis",
      ontology_version: "vnext",
      axis_id: row.axis_id,
      axis_slug: row.axis_key,
      dimension: row.dimension,
      comparison_question: row.comparison_question,
      baseline,
      final: finalPointer(baseline),
      change: "unchanged",
      audit_state: "pending",
    };
  });
  const concepts = snapshotJsonl<SnapshotVNextConcept>(reader, conceptsPath).map(({ row, raw, ordinal }): OntologyAuditConceptUnit => {
    const baseline = baselinePointer(conceptsPath, ordinal, raw, null);
    return {
      key: `concept:vnext:${row.concept_id}`,
      kind: "concept",
      ontology_version: "vnext",
      concept_id: row.concept_id,
      axis_key: `axis:vnext:${row.axis_id}`,
      concept_slug: row.concept_key,
      definition: row.definition,
      comparison_question: row.comparison_question,
      baseline,
      final: finalPointer(baseline),
      change: "unchanged",
      audit_state: "pending",
    };
  });
  const memberships = snapshotJsonl<SnapshotVNextMembership>(reader, membershipsPath).map(({ row, raw, ordinal }): OntologyAuditConceptUnit => {
    const baseline = baselinePointer(membershipsPath, ordinal, raw, null);
    return {
      key: `membership:vnext:${row.membership_id}`,
      kind: "membership",
      ontology_version: "vnext",
      membership_id: row.membership_id,
      observation_key: recordKey("observation", row.observation_id),
      concept_key: `concept:vnext:${row.concept_id}`,
      assignment_basis: row.assignment_basis,
      baseline,
      final: finalPointer(baseline),
      change: "unchanged",
      audit_state: "pending",
    };
  });
  return [...axes, ...concepts, ...memberships].sort((a, b) => a.key.localeCompare(b.key));
}

function buildLegacyConceptUnits(reader: CorpusReader, records: OntologyAuditRecordUnit[]) {
  const registryPath = "wiki/features-so-far.md";
  const registryContent = reader.readText(registryPath);
  const registry = parseSnapshotLegacyFeatureEntries(registryContent);
  const registryRaw = featureEntryRawSections(registryContent);
  if (registry.length !== registryRaw.length) throw new Error(`${registryPath}: feature parser and raw section counts differ`);
  const axes: OntologyAuditConceptUnit[] = uniqueSorted(registry.map((entry) => entry.family).filter(Boolean)).map((family, ordinal) => {
    const raw = canonicalJson({ family });
    const baseline = baselinePointer(registryPath, ordinal, raw, null);
    return {
      key: `axis:legacy-family:${family}`,
      kind: "axis",
      axis_id: `legacy-family:${family}`,
      legacy_family: family,
      comparison_question: null,
      baseline,
      final: finalPointer(baseline),
      change: "unchanged",
      audit_state: "pending",
    };
  });
  const conceptKeys = registry.map((entry, ordinal) => `concept:registry:${String(ordinal).padStart(4, "0")}:${entry.id}`);
  const concepts: OntologyAuditConceptUnit[] = registry.map((entry, ordinal) => {
    const conceptKey = conceptKeys[ordinal]!;
    const baseline = baselinePointer(registryPath, ordinal, registryRaw[ordinal]!, entry.status);
    const membershipKeys = entry.observations.map((observationId) => `membership:observation:${observationId}`);
    return {
      key: conceptKey,
      kind: "concept",
      concept_id: entry.id,
      axis_key: `axis:legacy-family:${entry.family}`,
      legacy_family: entry.family,
      legacy_label: entry.proposedName,
      comparison_question: null,
      registry_membership_key_set_sha256: keySetSha256(membershipKeys),
      baseline,
      final: finalPointer(baseline),
      change: "unchanged",
      audit_state: "pending",
    };
  });
  const observationById = new Map(
    records.filter((record) => record.lane === "observation").map((record) => [record.stable_id, record]),
  );
  const conceptRows = registry.map((entry, ordinal) => ({ entry, key: conceptKeys[ordinal]! }));
  const memberships: OntologyAuditConceptUnit[] = [];
  for (const path of markdownPaths(reader, "wiki/observations")) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const observationId = snapshotScalar(block.record, "observation_id");
      const featureId = snapshotScalar(block.record, "feature_id");
      const family = snapshotScalar(block.record, "feature_family");
      const label = snapshotScalar(block.record, "feature_label");
      if (!observationId || !featureId || !family || !label) {
        throw new Error(`${path}: incomplete feature membership in observation block ${block.index + 1}`);
      }
      const observation = observationById.get(observationId);
      if (!observation?.baseline) throw new Error(`${path}: missing observation record ${observationId}`);
      const exactConcepts = conceptRows.filter(({ entry }) =>
        entry.id === featureId && entry.family === family && entry.proposedName === label
      );
      const idConcepts = conceptRows.filter(({ entry }) => entry.id === featureId);
      const resolvedConcept = exactConcepts.length === 1 ? exactConcepts[0] : idConcepts.length === 1 ? idConcepts[0] : undefined;
      if (!resolvedConcept) {
        throw new Error(
          `${path}: observation ${observationId} cannot resolve feature ${featureId} (${family}, ${label}) to exactly one registry record`,
        );
      }
      const raw = canonicalJson({ observationId, featureId, family, label });
      const baseline = baselinePointer(path, block.index, raw, observation.baseline.review_status);
      memberships.push({
        key: `membership:observation:${observationId}`,
        kind: "membership",
        observation_key: recordKey("observation", observationId),
        concept_key: resolvedConcept.key,
        legacy_family: family,
        legacy_label: label,
        baseline,
        final: finalPointer(baseline),
        change: "unchanged",
        audit_state: "pending",
      });
    }
  }
  return [...axes, ...concepts, ...memberships].sort((a, b) => a.key.localeCompare(b.key));
}

function buildConceptUnits(reader: CorpusReader, records: OntologyAuditRecordUnit[]) {
  const vnextFiles = [
    "wiki/ontology/axes.jsonl",
    "wiki/ontology/concepts.jsonl",
    "wiki/ontology/memberships.jsonl",
  ];
  const present = vnextFiles.filter((path) => reader.has(path));
  if (present.length === vnextFiles.length) return buildVNextConceptUnits(reader);
  if (present.length > 0) throw new Error(`Incomplete vNext ontology: found ${present.join(", ")}.`);
  if (!reader.has("wiki/features-so-far.md")) throw new Error("No canonical ontology representation is present.");
  return buildLegacyConceptUnits(reader, records);
}

function graphPointer(owner: OntologyAuditRecordUnit, ordinal: number, raw: unknown) {
  const path = owner.baseline?.path ?? owner.final?.path;
  if (!path) throw new Error(`Graph owner ${owner.key} has no path`);
  const baseline = baselinePointer(path, ordinal, canonicalJson(raw), owner.baseline?.review_status ?? null);
  return { baseline, final: finalPointer(baseline) };
}

function graphEdge(
  owner: OntologyAuditRecordUnit,
  edgeKind: string,
  edgeKeySuffix: string,
  ordinal: number,
  toKey: string | null,
  externalTarget: string | null,
  raw: unknown,
): OntologyAuditGraphUnit {
  const pointers = graphPointer(owner, ordinal, raw);
  return {
    key: `edge:${edgeKind}:${owner.stable_id}:${edgeKeySuffix}`,
    kind: "edge",
    edge_kind: edgeKind,
    owner_key: owner.key,
    from_key: owner.key,
    to_key: toKey,
    external_target: externalTarget,
    ordinal,
    baseline: pointers.baseline,
    final: pointers.final,
    change: "unchanged",
    audit_state: "pending",
  };
}

function buildGraphUnits(reader: CorpusReader, records: OntologyAuditRecordUnit[]) {
  const ownerByKey = new Map(records.map((record) => [record.key, record]));
  const edges: OntologyAuditGraphUnit[] = [];
  for (const path of markdownPaths(reader, "wiki/claims")) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const id = snapshotScalar(block.record, "claim_id");
      if (!id) continue;
      const owner = ownerByKey.get(recordKey("claim", id));
      if (!owner) throw new Error(`Missing claim owner ${id}`);
      snapshotStringList(block.record.observation_ids).forEach((target, index) => {
        edges.push(graphEdge(owner, "claim-support", `${String(index).padStart(4, "0")}:${target}`, index, recordKey("observation", target), null, { target }));
      });
      const stanceEvents = Array.isArray(block.record.stance_events) ? block.record.stance_events : [];
      stanceEvents.forEach((event, index) => {
        edges.push(graphEdge(owner, "claim-stance", String(index).padStart(4, "0"), index, null, `external:claim-stance:${canonicalJson(event)}`, event));
      });
    }
  }
  for (const path of markdownPaths(reader, "wiki/relations")) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const id = snapshotScalar(block.record, "relation_id");
      if (!id || snapshotScalar(block.record, "review_status") !== "accepted") continue;
      const owner = ownerByKey.get(recordKey("relation", id));
      if (!owner) throw new Error(`Missing relation owner ${id}`);
      const claimA = snapshotScalar(block.record, "claim_a");
      const claimB = snapshotScalar(block.record, "claim_b");
      if (!claimA || !claimB) continue;
      const pointers = graphPointer(owner, 0, { claimA, claimB, relation_kind: snapshotScalar(block.record, "relation_kind") });
      edges.push({
        key: `edge:relation:${id}`,
        kind: "edge",
        edge_kind: "relation",
        owner_key: owner.key,
        from_key: recordKey("claim", claimA),
        to_key: recordKey("claim", claimB),
        external_target: null,
        ordinal: 0,
        baseline: pointers.baseline,
        final: pointers.final,
        change: "unchanged",
        audit_state: "pending",
      });
    }
  }
  for (const path of markdownPaths(reader, "wiki/commentary")) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const id = snapshotScalar(block.record, "commentary_id");
      if (!id) continue;
      const owner = ownerByKey.get(recordKey("commentary", id));
      if (!owner) throw new Error(`Missing commentary owner ${id}`);
      const cites = snapshotNestedRecord(block.record, "cites") ?? {};
      const targets: Array<{ kind: string; target: string; to: string | null; external: string | null }> = [
        ...snapshotStringList(cites.observations).map((target) => ({ kind: "commentary-cites-observation", target, to: recordKey("observation", target), external: null })),
        ...snapshotStringList(cites.claims).map((target) => ({ kind: "commentary-cites-claim", target, to: recordKey("claim", target), external: null })),
        ...snapshotStringList(cites.relations).map((target) => ({ kind: "commentary-cites-relation", target, to: recordKey("relation", target), external: null })),
        ...snapshotStringList(cites.dossiers).map((target) => ({ kind: "commentary-cites-dossier", target, to: null, external: `projection:dossier:${target}` })),
      ];
      const crossrefs = Array.isArray(block.record.crossrefs) ? block.record.crossrefs : [];
      crossrefs.forEach((target) => {
        targets.push({
          kind: "commentary-source-crossref",
          target: canonicalJson(target),
          to: null,
          external: `external:source-crossref:${canonicalJson(target)}`,
        });
      });
      targets.forEach((target, index) => {
        edges.push(graphEdge(owner, target.kind, `${String(index).padStart(4, "0")}:${target.target}`, index, target.to, target.external, target));
      });
    }
  }
  for (const path of markdownPaths(reader, "wiki/voices")) {
    const content = reader.readText(path);
    for (const block of snapshotMarkdownBlocks(reader, content, path)) {
      const voiceId = snapshotScalar(block.record, "voice_id");
      if (!voiceId) continue;
      const owner = ownerByKey.get(recordKey("voice", voiceId));
      if (!owner) throw new Error(`Missing voice owner ${voiceId}`);
      snapshotStringList(block.record.voice_chain).forEach((target, index) => {
        edges.push(graphEdge(owner, "voice-owner", String(index).padStart(4, "0"), index, null, `external:voice-owner:${target}`, { target, index }));
      });
      const evidenceRefs = Array.isArray(block.record.evidence_refs) ? block.record.evidence_refs : [];
      evidenceRefs.forEach((evidence, index) => {
        edges.push(graphEdge(owner, "voice-evidence", String(index).padStart(4, "0"), index, null, `external:source-evidence:${canonicalJson(evidence)}`, evidence));
      });
      snapshotStringList(block.record.candidate_owners).forEach((target, index) => {
        edges.push(graphEdge(owner, "voice-candidate-owner", String(index).padStart(4, "0"), index, null, `external:voice-owner:${target}`, { target, index }));
      });
      const reviewedAttribution = snapshotNestedRecord(block.record, "reviewed_attribution");
      snapshotStringList(reviewedAttribution?.candidate_owners).forEach((target, index) => {
        edges.push(graphEdge(owner, "voice-reviewed-candidate-owner", String(index).padStart(4, "0"), index, null, `external:voice-owner:${target}`, { target, index }));
      });
    }
  }
  for (const owner of records.filter((record) => record.lane === "recording")) {
    owner.references.forEach((target, index) => {
      edges.push(graphEdge(owner, "recording-chapter-commentary", String(index).padStart(4, "0"), index, target, null, { target, index }));
    });
  }
  for (const owner of records.filter((record) => record.lane === "reported-turn-scope")) {
    owner.references.filter((target) => target.startsWith("external:turn:")).forEach((target, index) => {
      edges.push(graphEdge(owner, "reported-turn-scope", String(index).padStart(4, "0"), index, null, target, { target, index }));
    });
  }
  return edges.sort((a, b) => a.key.localeCompare(b.key));
}

function reviewInputSha256(unit: Omit<OntologyAuditSourceUnit, "primary" | "independent" | "reconciliation">) {
  return sha256(canonicalJson(unit));
}

function greekSourcePaths(reader: CorpusReader) {
  return reader.files("raw/plato/greek").filter((path) => path.endsWith(".txt"));
}

function buildSourceUnits(reader: CorpusReader, records: OntologyAuditRecordUnit[]) {
  const byDialogue = new Map<string, OntologyAuditRecordUnit[]>();
  for (const record of records) {
    if (!record.source) continue;
    const entries = byDialogue.get(record.source.dialogue) ?? [];
    entries.push(record);
    byDialogue.set(record.source.dialogue, entries);
  }
  const units: OntologyAuditSourceUnit[] = [];
  for (const sourcePath of greekSourcePaths(reader)) {
    const dialogue = basename(sourcePath, ".txt");
    const source = reader.readText(sourcePath);
    const discovered = stephanusMarkers(source);
    const seen = new Set<string>();
    for (const marker of discovered) {
      if (seen.has(marker.marker)) throw new Error(`${sourcePath}: duplicate Stephanus marker ${marker.marker}`);
      seen.add(marker.marker);
    }
    const firstMarker = discovered[0];
    const markerUnits = [
      ...((firstMarker?.index ?? 0) > 0
        ? [{ marker: "(preamble)", startChar: 0, endChar: firstMarker!.index }]
        : []),
      ...discovered.map((marker, index) => ({
        marker: marker.marker,
        startChar: marker.index,
        endChar: discovered[index + 1]?.index ?? source.length,
      })),
      ...(discovered.length === 0 ? [{ marker: "(unmarked)", startChar: 0, endChar: source.length }] : []),
    ];
    const sourceSha256 = sha256(source);
    for (const marker of markerUnits) {
      const overlappingRecordKeys = (byDialogue.get(dialogue) ?? [])
        .filter((record) => record.source && record.source.start_char < marker.endChar && marker.startChar < record.source.end_char)
        .map((record) => record.key)
        .sort();
      const base = {
        key: `source:${dialogue}:${marker.startChar}-${marker.endChar}`,
        kind: "source_unit" as const,
        dialogue,
        source_path: sourcePath,
        source_sha256: sourceSha256,
        marker: marker.marker,
        start_char: marker.startChar,
        end_char: marker.endChar,
        text_sha256: sha256(source.slice(marker.startChar, marker.endChar)),
        overlapping_record_keys: overlappingRecordKeys,
        overlapping_record_key_set_sha256: keySetSha256(overlappingRecordKeys),
      };
      const reviewedInputSha256 = reviewInputSha256(base);
      units.push({
        ...base,
        primary: { state: "pending", reviewer: null, reviewed_input_sha256: reviewedInputSha256, outcome: null, finding_ids: [] },
        independent: { state: "pending", reviewer: null, reviewed_input_sha256: reviewedInputSha256, outcome: null, finding_ids: [] },
        reconciliation: { state: "pending", rationale: null, adjudication_ids: [] },
      });
    }
  }
  return units.sort((a, b) => a.key.localeCompare(b.key));
}

function targetKind(row: OntologyAuditRecordUnit | OntologyAuditConceptUnit | OntologyAuditGraphUnit): AdjudicationTargetKind {
  if (row.kind === "record") return "record";
  if (row.kind === "edge") return "edge";
  return row.kind;
}

function buildAdjudications(records: OntologyAuditRecordUnit[], concepts: OntologyAuditConceptUnit[], graphs: OntologyAuditGraphUnit[]) {
  return [...records, ...concepts, ...graphs]
    .map((row): OntologyAuditAdjudication => ({
      adjudication_id: `adjudication:${sha256(row.key).slice(0, 24)}`,
      target_key: row.key,
      target_kind: targetKind(row),
      state: "pending",
      action: null,
      rationale: null,
      finding_ids: [],
      replacement_target_keys: [],
      receipt_path: null,
    }))
    .sort((a, b) => a.target_key.localeCompare(b.target_key));
}

function countBy<T>(values: readonly T[], key: (value: T) => string) {
  const counts: Record<string, number> = {};
  for (const value of values) {
    const name = key(value);
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
}

function conflictCounts<T>(values: readonly T[], key: (value: T) => string) {
  const counts = countBy(values, key);
  const conflicts = Object.values(counts).filter((count) => count > 1);
  return { groups: conflicts.length, rows: conflicts.reduce((sum, count) => sum + count, 0) };
}

function mappingConflictCounts(
  mappings: readonly { left: string; right: string }[],
) {
  const rightByLeft = new Map<string, Set<string>>();
  for (const { left, right } of mappings) {
    const rights = rightByLeft.get(left) ?? new Set<string>();
    rights.add(right);
    rightByLeft.set(left, rights);
  }
  const conflicts = [...rightByLeft.values()].filter((rights) => rights.size > 1);
  return {
    groups: conflicts.length,
    rows: conflicts.reduce((sum, rights) => sum + rights.size, 0),
  };
}

function recordSpanCounts(records: readonly OntologyAuditRecordUnit[]) {
  const sourced = records.filter((record): record is OntologyAuditRecordUnit & { source: NonNullable<OntologyAuditRecordUnit["source"]> } => record.source !== null);
  const duplicate = conflictCounts(sourced, (record) => `${record.source.dialogue}:${record.source.start_char}-${record.source.end_char}`);
  let components = 0;
  let overlappingComponents = 0;
  for (const dialogue of uniqueSorted(sourced.map((record) => record.source.dialogue))) {
    const spans = sourced
      .filter((record) => record.source.dialogue === dialogue)
      .sort((a, b) => a.source.start_char - b.source.start_char || a.source.end_char - b.source.end_char);
    let componentEnd = -1;
    let componentSize = 0;
    for (const span of spans) {
      if (componentSize === 0 || span.source.start_char >= componentEnd) {
        if (componentSize > 0) {
          components += 1;
          if (componentSize > 1) overlappingComponents += 1;
        }
        componentEnd = span.source.end_char;
        componentSize = 1;
      } else {
        componentEnd = Math.max(componentEnd, span.source.end_char);
        componentSize += 1;
      }
    }
    if (componentSize > 0) {
      components += 1;
      if (componentSize > 1) overlappingComponents += 1;
    }
  }
  return { duplicate, components, overlappingComponents };
}

function buildCounts(rows: AuditRows, canonicalInputs: InputDescriptor[], greekSources: InputDescriptor[], projections: ProjectionDescriptor[]) {
  const concepts = rows.concepts.filter((row): row is Extract<OntologyAuditConceptUnit, { kind: "concept" }> => row.kind === "concept");
  const conceptByKey = new Map(concepts.map((row) => [row.key, row]));
  const identityMappings = [
    ...concepts.flatMap((row) =>
      "legacy_family" in row
        ? [{ conceptId: row.concept_id, pair: `${row.legacy_family}\0${row.legacy_label}` }]
        : [],
    ),
    ...rows.concepts
      .filter((row): row is Extract<OntologyAuditConceptUnit, { kind: "membership" }> => row.kind === "membership")
      .flatMap((row) =>
        "legacy_family" in row
          ? [{
              conceptId: conceptByKey.get(row.concept_key)?.concept_id ?? `(missing:${row.concept_key})`,
              pair: `${row.legacy_family}\0${row.legacy_label}`,
            }]
          : [],
      ),
  ];
  const conceptIdConflicts = mappingConflictCounts(
    identityMappings.map(({ conceptId, pair }) => ({ left: conceptId, right: pair })),
  );
  const conceptPairConflicts = mappingConflictCounts(
    identityMappings.map(({ conceptId, pair }) => ({ left: pair, right: conceptId })),
  );
  const spans = recordSpanCounts(rows.records);
  const counts: Record<string, number> = {
    canonical_inputs: canonicalInputs.length,
    greek_sources: greekSources.length,
    projection_artifacts: projections.length,
    source_units: rows.sources.length,
    "source_units.stephanus_markers": rows.sources.filter((row) => row.marker !== "(preamble)").length,
    "source_units.preambles": rows.sources.filter((row) => row.marker === "(preamble)").length,
    record_units: rows.records.length,
    concept_membership_units: rows.concepts.length,
    graph_units: rows.graphs.length,
    findings: rows.findings.length,
    adjudications: rows.adjudications.length,
    "concepts.duplicate_id_groups": conceptIdConflicts.groups,
    "concepts.duplicate_id_rows": conceptIdConflicts.rows,
    "concepts.duplicate_pair_groups": conceptPairConflicts.groups,
    "concepts.duplicate_pair_rows": conceptPairConflicts.rows,
    "records.duplicate_span_groups": spans.duplicate.groups,
    "records.duplicate_span_rows": spans.duplicate.rows,
    "records.overlap_components": spans.components,
    "records.multi_record_overlap_components": spans.overlappingComponents,
    "source_units.record_overlap_edges": rows.sources.reduce((sum, row) => sum + row.overlapping_record_keys.length, 0),
  };
  for (const [lane, count] of Object.entries(countBy(rows.records, (row) => row.lane))) counts[`records.${lane}`] = count;
  for (const [status, count] of Object.entries(countBy(rows.records, (row) => row.baseline?.review_status ?? "(none)"))) counts[`review_status.${status}`] = count;
  for (const [kind, count] of Object.entries(countBy(rows.concepts, (row) => row.kind))) counts[`concepts.${kind}`] = count;
  for (const [kind, count] of Object.entries(countBy(rows.graphs, (row) => row.edge_kind))) counts[`edges.${kind}`] = count;
  for (const [projection, count] of Object.entries(countBy(projections, (row) => row.projection))) counts[`projections.${projection}`] = count;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function gitValue(repoRoot: string, args: string[]) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function corpusDigest(inputs: InputDescriptor[]) {
  return sha256(inputs.map((entry) => `${entry.path}\0${entry.sha256}`).join("\n"));
}

function buildAuditModel(repoRoot: string, reader: CorpusReader): AuditModel {
  const canonicalInputs = canonicalInputPaths(reader).map((path) => descriptor(reader, path));
  const greekSources = greekSourcePaths(reader).map((path) => descriptor(reader, path));
  const records = buildRecordUnits(reader);
  const concepts = buildConceptUnits(reader, records);
  const graphs = buildGraphUnits(reader, records);
  const sources = buildSourceUnits(reader, records);
  const findings: OntologyAuditFinding[] = [];
  const adjudications = buildAdjudications(records, concepts, graphs);
  const rows = { sources, records, concepts, graphs, findings, adjudications };
  const supportInputs = baselineSupportDescriptors(reader);
  const projections = projectionDescriptors(reader);
  const digest = corpusDigest(canonicalInputs);
  const laneCounts = countBy(records, (record) => record.lane);
  const expectedLanes = ["observation", "claim", "relation", "commentary", "voice", "apparatus", "recording", "reported-turn-scope"];
  return {
    snapshotId: `${SNAPSHOT_PREFIX}${digest}`,
    corpusDigest: digest,
    canonicalInputs,
    greekSources,
    supportInputs,
    projections,
    gitCommit: reader.commit ?? gitValue(repoRoot, ["rev-parse", "HEAD"]),
    gitTree: reader.tree ?? gitValue(repoRoot, ["rev-parse", "HEAD^{tree}"]),
    rows,
    counts: buildCounts(rows, canonicalInputs, greekSources, projections),
    laneStates: expectedLanes.map((lane) => ({
      lane,
      count: laneCounts[lane] ?? 0,
      state: (laneCounts[lane] ?? 0) === 0 ? "zero_result" : "pending",
    })),
  };
}

function partitionRows(model: AuditModel): Record<PartitionFile, readonly unknown[]> {
  return {
    "source-units.jsonl": model.rows.sources,
    "record-units.jsonl": model.rows.records,
    "concept-membership-units.jsonl": model.rows.concepts,
    "graph-units.jsonl": model.rows.graphs,
    "findings.jsonl": model.rows.findings,
    "adjudications.jsonl": model.rows.adjudications,
  };
}

function partitionKey(row: unknown, keyField: "key" | "finding_id" | "target_key") {
  const value = (row as Record<string, unknown>)[keyField];
  if (typeof value !== "string") throw new Error(`Partition row is missing ${keyField}`);
  return value;
}

function partitionDescriptors(model: AuditModel) {
  return Object.fromEntries(
    ONTOLOGY_AUDIT_PARTITION_FILES.map((file) => {
      const rows = partitionRows(model)[file];
      const content = renderJsonl(rows);
      const keyField = file === "adjudications.jsonl"
        ? "target_key"
        : file === "findings.jsonl"
          ? "finding_id"
          : "key";
      return [file, {
        path: file,
        sha256: sha256(content),
        rows: rows.length,
        key_field: keyField,
        key_set_sha256: keySetSha256(rows.map((row) => partitionKey(row, keyField))),
      } satisfies PartitionDescriptor];
    }),
  ) as Record<PartitionFile, PartitionDescriptor>;
}

function buildManifest(repoRoot: string, model: AuditModel): OntologyAuditManifest {
  const partitions = partitionDescriptors(model);
  const ownedKeys = [
    ...model.rows.sources.map((row) => row.key),
    ...model.rows.records.map((row) => row.key),
    ...model.rows.concepts.map((row) => row.key),
    ...model.rows.graphs.map((row) => row.key),
  ];
  return {
    schema_version: SCHEMA_VERSION,
    snapshot_id: model.snapshotId,
    audit_state: "pending",
    baseline: {
      git_commit: model.gitCommit,
      git_tree: model.gitTree,
      corpus_digest: model.corpusDigest,
      canonical_inputs: model.canonicalInputs,
      greek_sources: model.greekSources,
      support_inputs: model.supportInputs,
      counts: model.counts,
      owned_key_count: ownedKeys.length,
      owned_key_set_sha256: keySetSha256(ownedKeys),
    },
    schema: { implementation_path: IMPLEMENTATION_PATH, implementation_sha256: sha256(readFileSync(join(repoRoot, IMPLEMENTATION_PATH))) },
    protocol: { path: PROTOCOL_PATH, sha256: sha256(readFileSync(join(repoRoot, PROTOCOL_PATH))) },
    projections: model.projections,
    baseline_evidence: null,
    partitions,
    lane_states: model.laneStates,
    acceptance_path: "acceptance.json",
  };
}

function buildPendingAcceptance(manifest: OntologyAuditManifest, manifestContent: string): OntologyAuditAcceptance {
  return {
    schema_version: SCHEMA_VERSION,
    snapshot_id: manifest.snapshot_id,
    state: "pending",
    manifest: { path: "manifest.json", sha256: sha256(manifestContent) },
    partitions: Object.fromEntries(
      ONTOLOGY_AUDIT_PARTITION_FILES.map((file) => [file, {
        sha256: manifest.partitions[file].sha256,
        rows: manifest.partitions[file].rows,
        key_set_sha256: manifest.partitions[file].key_set_sha256,
      }]),
    ) as OntologyAuditAcceptance["partitions"],
    final_corpus_digest: null,
    receipt: null,
    closure: {
      baseline_set_equal: true,
      final_set_equal: true,
      source_passes_complete: false,
      reconciliations_complete: false,
      adjudications_complete: false,
      unresolved_adjudications: manifest.partitions["adjudications.jsonl"].rows,
      stale_aliases: 0,
      rejected_reader_leaks: 0,
      regeneration_one_sha256: null,
      regeneration_two_sha256: null,
    },
  };
}

function writeImmutable(path: string, content: string) {
  if (existsSync(path)) {
    const existing = readFileSync(path, "utf8");
    if (existing !== content) throw new Error(`Refusing to overwrite content-addressed audit artifact with different bytes: ${path}`);
    return;
  }
  writeFileSync(path, content, "utf8");
}

export function generateOntologyAuditPackage({ repoRoot = getRepoRoot() }: { repoRoot?: string } = {}) {
  const model = buildAuditModel(repoRoot, gitCorpusReader(repoRoot));
  const packageRelativePath = `${AUDIT_ROOT}/${model.snapshotId}`;
  const packagePath = join(repoRoot, packageRelativePath);
  mkdirSync(packagePath, { recursive: true });
  for (const file of ONTOLOGY_AUDIT_PARTITION_FILES) {
    writeImmutable(join(packagePath, file), renderJsonl(partitionRows(model)[file]));
  }
  const manifest = buildManifest(repoRoot, model);
  const manifestContent = prettyJson(manifest);
  writeImmutable(join(packagePath, "manifest.json"), manifestContent);
  const acceptance = buildPendingAcceptance(manifest, manifestContent);
  writeImmutable(join(packagePath, "acceptance.json"), prettyJson(acceptance));
  return { packagePath: packageRelativePath, snapshotId: model.snapshotId, manifest, acceptance };
}

/**
 * Re-observe the current canonical worktree with the same partition builders
 * used by package verification. Finalization consumes this rather than a
 * parallel inventory implementation, so final pointers and exact-set checks
 * cannot drift from the verifier that later certifies them.
 */
export function observeOntologyAuditLiveState(repoRoot = getRepoRoot()) {
  const model = buildAuditModel(repoRoot, worktreeCorpusReader(repoRoot));
  return {
    corpusDigest: model.corpusDigest,
    canonicalInputs: model.canonicalInputs,
    supportInputs: model.supportInputs,
    projections: model.projections,
    counts: model.counts,
    rows: model.rows,
  };
}

function partitionKeyField(file: PartitionFile): PartitionDescriptor["key_field"] {
  return file === "adjudications.jsonl"
    ? "target_key"
    : file === "findings.jsonl"
      ? "finding_id"
      : "key";
}

function partitionDescriptorsFromDisk(packagePath: string) {
  return Object.fromEntries(ONTOLOGY_AUDIT_PARTITION_FILES.map((file) => {
    const path = join(packagePath, file);
    if (!existsSync(path)) writeFileSync(path, "", "utf8");
    const content = readFileSync(path, "utf8");
    const rows = content.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as unknown);
    const keyField = partitionKeyField(file);
    return [file, {
      path: file,
      sha256: sha256(content),
      rows: rows.length,
      key_field: keyField,
      key_set_sha256: keySetSha256(rows.map((row) => partitionKey(row, keyField))),
    } satisfies PartitionDescriptor];
  })) as Record<PartitionFile, PartitionDescriptor>;
}

export function refreshOntologyAuditBindings({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath: string;
}) {
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const manifestPath = join(absolutePackagePath, "manifest.json");
  const acceptancePath = join(absolutePackagePath, "acceptance.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as OntologyAuditManifest;
  const acceptance = JSON.parse(readFileSync(acceptancePath, "utf8")) as OntologyAuditAcceptance;
  manifest.baseline.counts.findings ??= 0;
  manifest.partitions = partitionDescriptorsFromDisk(absolutePackagePath);
  manifest.schema = {
    implementation_path: IMPLEMENTATION_PATH,
    implementation_sha256: sha256(readFileSync(join(repoRoot, IMPLEMENTATION_PATH))),
  };
  manifest.protocol = {
    path: PROTOCOL_PATH,
    sha256: sha256(readFileSync(join(repoRoot, PROTOCOL_PATH))),
  };
  const manifestContent = prettyJson(manifest);
  writeFileSync(manifestPath, manifestContent, "utf8");
  acceptance.manifest = { path: "manifest.json", sha256: sha256(manifestContent) };
  acceptance.partitions = Object.fromEntries(ONTOLOGY_AUDIT_PARTITION_FILES.map((file) => [file, {
    sha256: manifest.partitions[file].sha256,
    rows: manifest.partitions[file].rows,
    key_set_sha256: manifest.partitions[file].key_set_sha256,
  }])) as OntologyAuditAcceptance["partitions"];
  const adjudications = readFileSync(join(absolutePackagePath, "adjudications.jsonl"), "utf8")
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as OntologyAuditAdjudication);
  acceptance.closure.unresolved_adjudications = adjudications.filter((row) => row.state === "pending").length;
  writeFileSync(acceptancePath, prettyJson(acceptance), "utf8");
  return { manifest, acceptance };
}

export function refreshOntologyAuditBaselineDefinitions({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath: string;
}) {
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const manifestPath = join(absolutePackagePath, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as OntologyAuditManifest;
  const frozen = buildAuditModel(repoRoot, gitCorpusReader(repoRoot, manifest.baseline.git_commit));
  if (frozen.snapshotId !== manifest.snapshot_id || frozen.corpusDigest !== manifest.baseline.corpus_digest) {
    throw new Error("Cannot refresh baseline evidence definitions for a different frozen corpus snapshot.");
  }
  manifest.baseline.support_inputs = frozen.supportInputs;
  manifest.baseline.counts = frozen.counts;
  manifest.projections = frozen.projections;
  manifest.baseline_evidence = null;
  writeFileSync(manifestPath, prettyJson(manifest), "utf8");
  return refreshOntologyAuditBindings({ repoRoot, packagePath: absolutePackagePath });
}

function evidenceLogDescriptor(repoRoot: string, logicalPath: string, content: Buffer): EvidenceLogDescriptor {
  const absolute = repositoryArtifactPath(repoRoot, logicalPath);
  if (!absolute) throw new Error(`Evidence log path escapes the repository: ${logicalPath}`);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
  return { path: logicalPath, sha256: sha256(content), bytes: content.byteLength };
}

function observedCommand({
  repoRoot,
  cwd,
  logicalPrefix,
  id,
  argv,
}: {
  repoRoot: string;
  cwd: string;
  logicalPrefix: string;
  id: string;
  argv: readonly string[];
}): EvidenceCommand {
  const result = spawnSync(argv[0]!, argv.slice(1), {
    cwd,
    env: { ...process.env, CI: "1" },
    encoding: null,
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status === null) {
    throw new Error(`${id} did not reach a terminal exit status${result.signal ? ` (signal ${result.signal})` : ""}.`);
  }
  const stdout = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.from(result.stdout ?? "");
  const stderr = Buffer.isBuffer(result.stderr) ? result.stderr : Buffer.from(result.stderr ?? "");
  return {
    id,
    argv: [...argv],
    exit_code: result.status,
    outcome: result.status === 0 ? "passed" : "failed",
    stdout: evidenceLogDescriptor(repoRoot, `${logicalPrefix}-${id}.stdout.log`, stdout),
    stderr: evidenceLogDescriptor(repoRoot, `${logicalPrefix}-${id}.stderr.log`, stderr),
  };
}

function makeDetachedBaselineCheckout(repoRoot: string, commit: string, tree: string) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "plato-ontology-baseline-"));
  const checkout = join(temporaryRoot, "repo");
  try {
    execFileSync("git", ["clone", "--quiet", "--shared", "--no-checkout", repoRoot, checkout], {
      maxBuffer: 64 * 1024 * 1024,
    });
    execFileSync("git", ["checkout", "--quiet", "--detach", commit], {
      cwd: checkout,
      maxBuffer: 64 * 1024 * 1024,
    });
    const observedCommit = gitValue(checkout, ["rev-parse", "HEAD"]);
    const observedTree = gitValue(checkout, ["rev-parse", "HEAD^{tree}"]);
    if (observedCommit !== commit || observedTree !== tree) {
      throw new Error(`Detached baseline checkout resolved ${observedCommit}/${observedTree}, expected ${commit}/${tree}.`);
    }
    execFileSync("bun", ["install", "--frozen-lockfile"], {
      cwd: checkout,
      env: { ...process.env, CI: "1" },
      maxBuffer: 256 * 1024 * 1024,
    });
    const dirty = gitValue(checkout, ["status", "--porcelain=v1", "--untracked-files=no"]);
    if (dirty) throw new Error(`Detached baseline checkout is dirty after frozen install:\n${dirty}`);
    return { temporaryRoot, checkout };
  } catch (error) {
    rmSync(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
}

function runBaselineValidationEvidence({
  repoRoot,
  packageLogicalPath,
  commit,
  tree,
}: {
  repoRoot: string;
  packageLogicalPath: string;
  commit: string;
  tree: string;
}) {
  const { temporaryRoot, checkout } = makeDetachedBaselineCheckout(repoRoot, commit, tree);
  try {
    const commands = BASELINE_VALIDATION_COMMANDS.map(({ id, argv }) => observedCommand({
      repoRoot,
      cwd: checkout,
      logicalPrefix: `${packageLogicalPath}/baseline-evidence/validation`,
      id,
      argv,
    }));
    const dirty = gitValue(checkout, ["status", "--porcelain=v1", "--untracked-files=no"]);
    if (dirty) throw new Error(`Baseline validation commands mutated tracked files:\n${dirty}`);
    return commands;
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function removeDeclaredProjectionArtifacts(checkout: string, projections: readonly ProjectionDescriptor[]) {
  for (const projection of projections) {
    const absolute = repositoryArtifactPath(checkout, projection.path);
    if (!absolute || absolute === resolve(checkout)) {
      throw new Error(`Unsafe baseline projection path: ${projection.path}`);
    }
    rmSync(absolute, { force: true });
  }
}

function projectionDigest(projections: readonly ProjectionDescriptor[]) {
  return sha256(canonicalJson([...projections]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map(({ path, sha256: digest, bytes }) => ({ path, sha256: digest, bytes }))));
}

function runBaselineProjectionReplay({
  repoRoot,
  packageLogicalPath,
  commit,
  tree,
  expected,
}: {
  repoRoot: string;
  packageLogicalPath: string;
  commit: string;
  tree: string;
  expected: readonly ProjectionDescriptor[];
}) {
  const run = (runId: "one" | "two") => {
    const { temporaryRoot, checkout } = makeDetachedBaselineCheckout(repoRoot, commit, tree);
    try {
      removeDeclaredProjectionArtifacts(checkout, expected);
      const commands = BASELINE_PROJECTION_GENERATORS.map(({ id, argv }) => observedCommand({
        repoRoot,
        cwd: checkout,
        logicalPrefix: `${packageLogicalPath}/baseline-evidence/projection-${runId}`,
        id,
        argv,
      }));
      const failed = commands.find((command) => command.exit_code !== 0);
      if (failed) throw new Error(`Baseline projection generator ${failed.id} failed with exit ${failed.exit_code}.`);
      const projections = projectionDescriptors(worktreeCorpusReader(checkout));
      if (!equalStringSets(projections.map((entry) => entry.path), expected.map((entry) => entry.path))) {
        const actual = new Set(projections.map((entry) => entry.path));
        const declared = new Set(expected.map((entry) => entry.path));
        const missing = [...declared].filter((path) => !actual.has(path));
        const extra = [...actual].filter((path) => !declared.has(path));
        throw new Error(
          `Baseline projection replay path set differs from the manifest; missing=${missing.slice(0, 20).join(",") || "(none)"}; extra=${extra.slice(0, 20).join(",") || "(none)"}.`,
        );
      }
      const dirty = gitValue(checkout, ["status", "--porcelain=v1", "--untracked-files=no"]);
      if (dirty) throw new Error(`Baseline projection replay ${runId} did not restore the exact tracked snapshot:\n${dirty}`);
      return { commands, projections };
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  };
  return { one: run("one"), two: run("two") };
}

export function writeOntologyBaselineEvidence({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath?: string;
} = {}) {
  const packages = packagePath ? [packagePath] : listOntologyAuditPackagePaths(repoRoot);
  if (packages.length !== 1) throw new Error(`Expected exactly one ontology audit package; found ${packages.length}.`);
  const logicalPackagePath = packages[0]!.startsWith("/")
    ? relative(repoRoot, packages[0]!).split("\\").join("/")
    : packages[0]!;
  const absolutePackagePath = packages[0]!.startsWith("/") ? packages[0]! : join(repoRoot, packages[0]!);
  const refreshed = refreshOntologyAuditBaselineDefinitions({ repoRoot, packagePath: absolutePackagePath });
  const manifest = refreshed.manifest;
  const validationCommands = runBaselineValidationEvidence({
    repoRoot,
    packageLogicalPath: logicalPackagePath,
    commit: manifest.baseline.git_commit,
    tree: manifest.baseline.git_tree,
  });
  const replay = runBaselineProjectionReplay({
    repoRoot,
    packageLogicalPath: logicalPackagePath,
    commit: manifest.baseline.git_commit,
    tree: manifest.baseline.git_tree,
    expected: manifest.projections,
  });
  const expectedByPath = new Map(manifest.projections.map((entry) => [entry.path, entry]));
  const oneByPath = new Map(replay.one.projections.map((entry) => [entry.path, entry]));
  const twoByPath = new Map(replay.two.projections.map((entry) => [entry.path, entry]));
  const artifacts = manifest.projections.map((expected) => {
    const one = oneByPath.get(expected.path)!;
    const two = twoByPath.get(expected.path)!;
    return {
      path: expected.path,
      generator_id: expected.generator_id,
      bytes: expected.bytes,
      expected_sha256: expected.sha256,
      run_one_sha256: one.sha256,
      run_two_sha256: two.sha256,
    } satisfies BaselineProjectionArtifactEvidence;
  });
  const exactSnapshotMatch = artifacts.every((entry) =>
    entry.expected_sha256 === entry.run_one_sha256
    && entry.expected_sha256 === entry.run_two_sha256
    && oneByPath.get(entry.path)?.bytes === entry.bytes
    && twoByPath.get(entry.path)?.bytes === entry.bytes
    && expectedByPath.get(entry.path)?.generator_id === entry.generator_id
  );
  const runOneSha256 = projectionDigest(replay.one.projections);
  const runTwoSha256 = projectionDigest(replay.two.projections);
  if (!exactSnapshotMatch || runOneSha256 !== runTwoSha256) {
    throw new Error(`Baseline projection replay does not exactly reproduce the frozen snapshot: ${runOneSha256} != ${runTwoSha256}.`);
  }
  const conceptRows = readFileSync(join(absolutePackagePath, "concept-membership-units.jsonl"), "utf8")
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as OntologyAuditConceptUnit);
  const registry = legacyRegistryProjectionSummary(conceptRows);
  if (registry.mismatches.length > 0) {
    throw new Error(`Legacy feature registry membership projection differs for ${registry.mismatches.length} concept(s).`);
  }
  const baselineReader = gitCorpusReader(repoRoot, manifest.baseline.git_commit);
  const evidence: OntologyBaselineEvidence = {
    schema_version: 1,
    state: "complete",
    snapshot_id: manifest.snapshot_id,
    baseline: {
      git_commit: manifest.baseline.git_commit,
      git_tree: manifest.baseline.git_tree,
      corpus_digest: manifest.baseline.corpus_digest,
      bun_version: execFileSync("bun", ["--version"], { encoding: "utf8" }).trim(),
      bun_lock_sha256: descriptor(baselineReader, "bun.lock").sha256,
      platform: platform(),
      arch: arch(),
    },
    support_inputs: manifest.baseline.support_inputs,
    registry_projection: {
      concepts_checked: registry.conceptsChecked,
      memberships_checked: registry.membershipsChecked,
      mismatches: 0,
    },
    validation: {
      all_passed: validationCommands.every((command) => command.exit_code === 0),
      commands: validationCommands,
    },
    projection_replay: {
      artifact_count: artifacts.length,
      path_set_sha256: keySetSha256(artifacts.map((entry) => entry.path)),
      run_one_sha256: runOneSha256,
      run_two_sha256: runTwoSha256,
      byte_stable: true,
      exact_snapshot_match: true,
      run_one_commands: replay.one.commands,
      run_two_commands: replay.two.commands,
      artifacts,
    },
  };
  const evidencePath = join(absolutePackagePath, BASELINE_EVIDENCE_PATH);
  writeFileSync(evidencePath, prettyJson(evidence), "utf8");
  const reboundManifest = JSON.parse(readFileSync(join(absolutePackagePath, "manifest.json"), "utf8")) as OntologyAuditManifest;
  reboundManifest.baseline_evidence = { path: BASELINE_EVIDENCE_PATH, sha256: sha256(readFileSync(evidencePath)) };
  writeFileSync(join(absolutePackagePath, "manifest.json"), prettyJson(reboundManifest), "utf8");
  refreshOntologyAuditBindings({ repoRoot, packagePath: absolutePackagePath });
  return {
    path: `${logicalPackagePath}/${BASELINE_EVIDENCE_PATH}`,
    validationAllPassed: evidence.validation.all_passed,
    projectionArtifacts: evidence.projection_replay.artifact_count,
    projectionSha256: evidence.projection_replay.run_one_sha256,
    registryConcepts: evidence.registry_projection.concepts_checked,
    registryMemberships: evidence.registry_projection.memberships_checked,
  };
}

function issue(issues: OntologyAuditIssue[], code: OntologyAuditIssue["code"], path: string, message: string) {
  issues.push({ code, path, message });
}

function validateEvidenceLog(
  repoRoot: string,
  packageLogicalPath: string,
  value: unknown,
  issues: OntologyAuditIssue[],
  evidencePath: string,
  label: string,
) {
  const row = value as Partial<EvidenceLogDescriptor> | null;
  if (
    !row
    || typeof row.path !== "string"
    || !row.path.startsWith(`${packageLogicalPath}/baseline-evidence/`)
    || typeof row.sha256 !== "string"
    || !SHA256_RE.test(row.sha256)
    || !Number.isInteger(row.bytes)
    || (row.bytes ?? -1) < 0
  ) {
    issue(issues, "baseline_binding", evidencePath, `${label} log descriptor is invalid`);
    return;
  }
  const absolute = repositoryArtifactPath(repoRoot, row.path);
  if (!absolute || !existsSync(absolute)) {
    issue(issues, "baseline_binding", evidencePath, `${label} log is missing: ${row.path}`);
    return;
  }
  const content = readFileSync(absolute);
  if (content.byteLength !== row.bytes || sha256(content) !== row.sha256) {
    issue(issues, "baseline_binding", evidencePath, `${label} log bytes differ from the evidence descriptor`);
  }
}

function validateEvidenceCommands(
  repoRoot: string,
  packageLogicalPath: string,
  value: unknown,
  expected: readonly { id: string; argv: readonly string[] }[],
  issues: OntologyAuditIssue[],
  evidencePath: string,
  label: string,
  requirePassed: boolean,
) {
  if (!Array.isArray(value) || value.length !== expected.length) {
    issue(issues, "baseline_binding", evidencePath, `${label} command set is not exact`);
    return [] as EvidenceCommand[];
  }
  const commands: EvidenceCommand[] = [];
  for (const [index, expectedCommand] of expected.entries()) {
    const command = value[index] as Partial<EvidenceCommand> | null;
    if (
      !command
      || command.id !== expectedCommand.id
      || !Array.isArray(command.argv)
      || command.argv.some((entry) => typeof entry !== "string")
      || canonicalJson(command.argv) !== canonicalJson(expectedCommand.argv)
      || !Number.isInteger(command.exit_code)
      || (command.exit_code ?? -1) < 0
      || (command.outcome !== "passed" && command.outcome !== "failed")
      || command.outcome !== (command.exit_code === 0 ? "passed" : "failed")
    ) {
      issue(issues, "baseline_binding", evidencePath, `${label} command ${expectedCommand.id} is invalid`);
      continue;
    }
    if (requirePassed && command.exit_code !== 0) {
      issue(issues, "projection_binding", evidencePath, `${label} command ${command.id} did not pass`);
    }
    validateEvidenceLog(repoRoot, packageLogicalPath, command.stdout, issues, evidencePath, `${label} ${command.id} stdout`);
    validateEvidenceLog(repoRoot, packageLogicalPath, command.stderr, issues, evidencePath, `${label} ${command.id} stderr`);
    commands.push(command as EvidenceCommand);
  }
  return commands;
}

export function validateOntologyBaselineEvidence({
  repoRoot,
  packagePath,
  manifest,
  concepts,
  baselineLockSha256,
}: {
  repoRoot: string;
  packagePath: string;
  manifest: OntologyAuditManifest;
  concepts: OntologyAuditConceptUnit[];
  baselineLockSha256: string;
}) {
  const issues: OntologyAuditIssue[] = [];
  const evidenceDescriptor = manifest.baseline_evidence;
  const evidencePath = join(packagePath, BASELINE_EVIDENCE_PATH);
  if (!evidenceDescriptor) {
    issue(issues, "baseline_binding", join(packagePath, "manifest.json"), "snapshot-bound baseline evidence is missing");
    return issues;
  }
  if (evidenceDescriptor.path !== BASELINE_EVIDENCE_PATH || !existsSync(evidencePath)) {
    issue(issues, "baseline_binding", evidencePath, "snapshot-bound baseline evidence file is missing");
    return issues;
  }
  const evidenceBytes = readFileSync(evidencePath);
  if (sha256(evidenceBytes) !== evidenceDescriptor.sha256) {
    issue(issues, "hash_mismatch", evidencePath, "baseline evidence hash differs from the manifest");
    return issues;
  }
  let evidence: Partial<OntologyBaselineEvidence>;
  try {
    evidence = JSON.parse(evidenceBytes.toString("utf8")) as Partial<OntologyBaselineEvidence>;
  } catch (error) {
    issue(issues, "malformed_json", evidencePath, error instanceof Error ? error.message : String(error));
    return issues;
  }
  if (evidence.schema_version !== 1 || evidence.state !== "complete" || evidence.snapshot_id !== manifest.snapshot_id) {
    issue(issues, "baseline_binding", evidencePath, "baseline evidence is not terminal and snapshot-bound");
  }
  const baseline = evidence.baseline;
  if (
    !baseline
    || baseline.git_commit !== manifest.baseline.git_commit
    || baseline.git_tree !== manifest.baseline.git_tree
    || baseline.corpus_digest !== manifest.baseline.corpus_digest
    || baseline.bun_lock_sha256 !== baselineLockSha256
    || typeof baseline.bun_version !== "string"
    || baseline.bun_version.length === 0
    || typeof baseline.platform !== "string"
    || baseline.platform.length === 0
    || typeof baseline.arch !== "string"
    || baseline.arch.length === 0
  ) {
    issue(issues, "baseline_binding", evidencePath, "baseline environment does not match the frozen commit, tree, corpus, and lockfile");
  }
  if (canonicalJson(evidence.support_inputs) !== canonicalJson(manifest.baseline.support_inputs)) {
    issue(issues, "baseline_binding", evidencePath, "baseline support inputs differ from the manifest");
  }
  const projectionPathSet = new Set(manifest.projections.map((entry) => entry.path));
  for (const support of manifest.baseline.support_inputs) {
    if (projectionPathSet.has(support.path)) {
      issue(issues, "projection_binding", evidencePath, `${support.path} is both support material and a claimed projection`);
    }
  }

  const registry = legacyRegistryProjectionSummary(concepts);
  for (const key of registry.mismatches) {
    issue(issues, "projection_binding", evidencePath, `${key} registry membership list differs from audited membership rows`);
  }
  if (
    !evidence.registry_projection
    || evidence.registry_projection.concepts_checked !== registry.conceptsChecked
    || evidence.registry_projection.memberships_checked !== registry.membershipsChecked
    || evidence.registry_projection.mismatches !== registry.mismatches.length
  ) {
    issue(issues, "projection_binding", evidencePath, "registry projection counts do not match the audited concept-membership partition");
  }

  const packageLogicalPath = relative(repoRoot, packagePath).split("\\").join("/");
  const validation = evidence.validation;
  const validationCommands = validateEvidenceCommands(
    repoRoot,
    packageLogicalPath,
    validation?.commands,
    BASELINE_VALIDATION_COMMANDS,
    issues,
    evidencePath,
    "baseline validation",
    false,
  );
  if (!validation || validation.all_passed !== validationCommands.every((command) => command.exit_code === 0)) {
    issue(issues, "baseline_binding", evidencePath, "baseline validation all_passed does not match terminal command results");
  }

  const replay = evidence.projection_replay;
  const runOneCommands = validateEvidenceCommands(
    repoRoot,
    packageLogicalPath,
    replay?.run_one_commands,
    BASELINE_PROJECTION_GENERATORS,
    issues,
    evidencePath,
    "projection replay one",
    true,
  );
  const runTwoCommands = validateEvidenceCommands(
    repoRoot,
    packageLogicalPath,
    replay?.run_two_commands,
    BASELINE_PROJECTION_GENERATORS,
    issues,
    evidencePath,
    "projection replay two",
    true,
  );
  if (!replay || !Array.isArray(replay.artifacts)) {
    issue(issues, "projection_binding", evidencePath, "projection replay artifact list is missing");
    return issues;
  }
  const expectedByPath = new Map(manifest.projections.map((entry) => [entry.path, entry]));
  const seen = new Set<string>();
  const runOne: InputDescriptor[] = [];
  const runTwo: InputDescriptor[] = [];
  for (const [index, value] of replay.artifacts.entries()) {
    const row = value as Partial<BaselineProjectionArtifactEvidence>;
    const expected = typeof row.path === "string" ? expectedByPath.get(row.path) : undefined;
    if (
      !expected
      || seen.has(expected.path)
      || row.generator_id !== expected.generator_id
      || row.bytes !== expected.bytes
      || row.expected_sha256 !== expected.sha256
      || typeof row.run_one_sha256 !== "string"
      || !SHA256_RE.test(row.run_one_sha256)
      || typeof row.run_two_sha256 !== "string"
      || !SHA256_RE.test(row.run_two_sha256)
    ) {
      issue(issues, "projection_binding", evidencePath, `invalid or duplicate baseline projection artifact at index ${index}`);
      continue;
    }
    seen.add(expected.path);
    runOne.push({ path: expected.path, sha256: row.run_one_sha256, bytes: expected.bytes });
    runTwo.push({ path: expected.path, sha256: row.run_two_sha256, bytes: expected.bytes });
    if (row.run_one_sha256 !== expected.sha256 || row.run_two_sha256 !== expected.sha256) {
      issue(issues, "projection_binding", evidencePath, `${expected.path} replay bytes differ from the frozen projection`);
    }
  }
  const runOneDigest = sha256(canonicalJson(runOne.sort((left, right) => left.path.localeCompare(right.path))));
  const runTwoDigest = sha256(canonicalJson(runTwo.sort((left, right) => left.path.localeCompare(right.path))));
  if (
    seen.size !== manifest.projections.length
    || replay.artifact_count !== manifest.projections.length
    || replay.path_set_sha256 !== keySetSha256(manifest.projections.map((entry) => entry.path))
    || replay.run_one_sha256 !== runOneDigest
    || replay.run_two_sha256 !== runTwoDigest
    || runOneDigest !== runTwoDigest
    || replay.byte_stable !== true
    || replay.exact_snapshot_match !== true
    || runOneCommands.length !== BASELINE_PROJECTION_GENERATORS.length
    || runTwoCommands.length !== BASELINE_PROJECTION_GENERATORS.length
  ) {
    issue(issues, "projection_binding", evidencePath, "projection replay does not prove exact, byte-stable manifest equality");
  }
  return issues;
}

function validationErrorPath(error: unknown) {
  const value = error as { path?: string; instancePath?: string };
  return value.path ?? value.instancePath ?? "/";
}

function parseJson(path: string, schema: TSchema, issues: OntologyAuditIssue[]) {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    issue(issues, "malformed_json", path, error instanceof Error ? error.message : String(error));
    return undefined;
  }
  if (!Check(schema, value)) {
    for (const error of Errors(schema, value)) issue(issues, "schema", path, `${validationErrorPath(error)} ${error.message}`);
    return undefined;
  }
  return value;
}

function parseJsonl(path: string, schema: TSchema, issues: OntologyAuditIssue[]) {
  const content = readFileSync(path, "utf8");
  const rows: unknown[] = [];
  for (const [index, line] of content.split(/\r?\n/u).entries()) {
    if (line.length === 0) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch (error) {
      issue(issues, "malformed_json", path, `line ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    if (!Check(schema, value)) {
      for (const error of Errors(schema, value)) issue(issues, "schema", path, `line ${index + 1}${validationErrorPath(error)}: ${error.message}`);
      continue;
    }
    rows.push(value);
  }
  return { content, rows };
}

function equalStringSets(a: readonly string[], b: readonly string[]) {
  const left = uniqueSorted(a);
  const right = uniqueSorted(b);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function normalizedFindingSignatures(
  pass: CompletedReviewPass,
  findingsById: ReadonlyMap<string, OntologyAuditFinding>,
) {
  return uniqueSorted(pass.finding_ids.map((findingId) => {
    const finding = findingsById.get(findingId);
    return finding
      ? canonicalJson({
          target_keys: uniqueSorted(finding.target_keys),
          defect_class: finding.defect_class,
          proposed_action: finding.proposed_action,
        })
      : `missing:${findingId}`;
  }));
}

const ACTIONS: Record<AdjudicationTargetKind, Set<string>> = {
  source: new Set(["valid_as_is", "revise", "add"]),
  record: new Set(["valid_as_is", "add", "revise", "split", "merge_duplicate", "retype", "reject", "retire"]),
  edge: new Set(["valid_as_is", "add", "revise", "split", "merge_duplicate", "retype", "reject", "retire"]),
  axis: new Set(["ratify", "add", "redefine", "split", "merge", "retype", "retire"]),
  concept: new Set(["ratify", "add", "redefine", "split", "merge", "retype", "retire"]),
  membership: new Set(["keep", "move", "add", "drop", "split"]),
};

const REPLACEMENT_ACTIONS = new Set(["split", "merge_duplicate", "retype", "merge", "move"]);

type ReceiptInspection = {
  problem: string | null;
  artifacts: ReadonlyMap<string, string>;
};

function repositoryArtifactPath(repoRoot: string, logicalPath: string) {
  const root = resolve(repoRoot);
  const absolute = resolve(root, logicalPath);
  if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) return null;
  return absolute;
}

function createReceiptInspector(repoRoot: string) {
  const cache = new Map<string, ReceiptInspection>();
  return (receiptPath: string, expectedSha256: string | null, requireArtifacts: boolean): ReceiptInspection => {
    const key = `${receiptPath}\u0000${expectedSha256 ?? ""}\u0000${requireArtifacts}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const artifacts = new Map<string, string>();
    const absoluteReceiptPath = repositoryArtifactPath(repoRoot, receiptPath);
    let problem: string | null = null;
    if (!absoluteReceiptPath || !existsSync(absoluteReceiptPath)) {
      problem = "receipt is missing";
    } else {
      const receiptBytes = readFileSync(absoluteReceiptPath);
      if (expectedSha256 !== null && sha256(receiptBytes) !== expectedSha256) {
        problem = "receipt is hash-mismatched";
      } else {
        const receipt = receiptBytes.toString("utf8");
        const bindings = [...receipt.matchAll(/^- artifact: `([^`]+)`; sha256: `([a-f0-9]{64})`$/gmu)];
        if (requireArtifacts && bindings.length === 0) {
          problem = "receipt has no content-addressed review artifacts";
        } else {
          for (const binding of bindings) {
            const artifactPath = binding[1]!;
            const artifactSha256 = binding[2]!;
            const previous = artifacts.get(artifactPath);
            if (previous && previous !== artifactSha256) {
              problem = `review artifact has conflicting hash bindings: ${artifactPath}`;
              break;
            }
            artifacts.set(artifactPath, artifactSha256);
            const absoluteArtifactPath = repositoryArtifactPath(repoRoot, artifactPath);
            const artifactBytes = absoluteArtifactPath && existsSync(absoluteArtifactPath)
              ? readFileSync(absoluteArtifactPath)
              : null;
            if (!artifactBytes || sha256(artifactBytes) !== artifactSha256) {
              problem = `review artifact is missing or hash-mismatched: ${artifactPath}`;
              break;
            }
            if (artifactPath.includes("/review-inputs/") && artifactPath.endsWith(".jsonl")) {
              try {
                const artifactContent = artifactBytes.toString("utf8");
                if (normalizeOntologyAuditJsonl(artifactContent, artifactPath) !== artifactContent) {
                  problem = `review artifact is not canonical JSONL: ${artifactPath}`;
                  break;
                }
              } catch (error) {
                problem = `review artifact is not canonical JSONL: ${artifactPath} (${error instanceof Error ? error.message : String(error)})`;
                break;
              }
            }
          }
        }
      }
    }
    const result = { problem, artifacts };
    cache.set(key, result);
    return result;
  };
}

function validateReviewPasses(
  repoRoot: string,
  units: OntologyAuditSourceUnit[],
  findings: OntologyAuditFinding[],
  adjudications: OntologyAuditAdjudication[],
  issues: OntologyAuditIssue[],
  path: string,
) {
  const inspectReceipt = createReceiptInspector(repoRoot);
  const unitKeys = new Set(units.map((row) => row.key));
  const unitsByKey = new Map(units.map((row) => [row.key, row]));
  const findingsById = new Map<string, OntologyAuditFinding>();
  for (const finding of findings) {
    if (findingsById.has(finding.finding_id)) {
      issue(issues, "duplicate_key", path, `duplicate finding ${finding.finding_id}`);
    }
    findingsById.set(finding.finding_id, finding);
    for (const sourceUnitKey of finding.source_unit_keys) {
      if (!unitKeys.has(sourceUnitKey)) issue(issues, "source_review", path, `${finding.finding_id} references unknown source unit ${sourceUnitKey}`);
    }
  }
  const adjudicationIds = new Set(adjudications.map((row) => row.adjudication_id));
  for (const unit of units) {
    const input = reviewInputSha256({
      key: unit.key,
      kind: unit.kind,
      dialogue: unit.dialogue,
      source_path: unit.source_path,
      source_sha256: unit.source_sha256,
      marker: unit.marker,
      start_char: unit.start_char,
      end_char: unit.end_char,
      text_sha256: unit.text_sha256,
      overlapping_record_keys: unit.overlapping_record_keys,
      overlapping_record_key_set_sha256: unit.overlapping_record_key_set_sha256,
    });
    for (const [name, pass] of [["primary", unit.primary], ["independent", unit.independent]] as const) {
      if (pass.reviewed_input_sha256 !== input) issue(issues, "source_review", path, `${unit.key} ${name} pass is bound to the wrong input hash`);
      if (pass.state === "complete") {
        if (pass.outcome === "zero_result" && pass.finding_ids.length !== 0) issue(issues, "source_review", path, `${unit.key} ${name} zero_result carries findings`);
        if (pass.outcome === "findings" && pass.finding_ids.length === 0) issue(issues, "source_review", path, `${unit.key} ${name} findings outcome has no findings`);
        const problem = inspectReceipt(pass.receipt_path, pass.receipt_sha256, true).problem;
        if (problem) issue(issues, "source_review", path, `${unit.key} ${name} pass ${problem}`);
        for (const findingId of pass.finding_ids) {
          const finding = findingsById.get(findingId);
          if (!finding) issue(issues, "source_review", path, `${unit.key} ${name} pass references unknown finding ${findingId}`);
          else {
            if (finding.pass !== name || finding.reviewer !== pass.reviewer) issue(issues, "source_review", path, `${findingId} reviewer or pass differs from ${unit.key}`);
            if (!finding.source_unit_keys.includes(unit.key)) issue(issues, "source_review", path, `${findingId} does not bind ${unit.key}`);
          }
        }
      }
    }
    if (unit.primary.state === "complete" && unit.independent.state === "complete") {
      if (unit.primary.reviewer === unit.independent.reviewer) issue(issues, "source_review", path, `${unit.key} uses the same reviewer for both passes`);
      const equal = equalStringSets(
        normalizedFindingSignatures(unit.primary, findingsById),
        normalizedFindingSignatures(unit.independent, findingsById),
      );
      if (unit.reconciliation.state === "pending") issue(issues, "reconciliation", path, `${unit.key} completed both passes without reconciliation`);
      if (unit.reconciliation.state !== "pending") {
        if (unit.reconciliation.reviewer === unit.primary.reviewer || unit.reconciliation.reviewer === unit.independent.reviewer) {
          issue(issues, "reconciliation", path, `${unit.key} reconciliation reviewer is not independent of both source passes`);
        }
        const problem = inspectReceipt(unit.reconciliation.receipt_path, unit.reconciliation.receipt_sha256, true).problem;
        if (problem) issue(issues, "reconciliation", path, `${unit.key} reconciliation ${problem}`);
      }
      if (unit.reconciliation.state === "agreed" && !equal) issue(issues, "reconciliation", path, `${unit.key} claims agreement for different finding sets`);
      if (unit.reconciliation.state === "adjudicated") {
        if (!unit.reconciliation.rationale || unit.reconciliation.adjudication_ids.length === 0) issue(issues, "reconciliation", path, `${unit.key} adjudication lacks rationale or decisions`);
        for (const id of unit.reconciliation.adjudication_ids) if (!adjudicationIds.has(id)) issue(issues, "reconciliation", path, `${unit.key} references unknown adjudication ${id}`);
      }
    } else if (unit.reconciliation.state !== "pending") {
      issue(issues, "reconciliation", path, `${unit.key} reconciles before both passes are complete`);
    }
  }
  for (const finding of findings) {
    const referencedByDeclaredPass = finding.source_unit_keys.some((sourceUnitKey) => {
      const unit = unitsByKey.get(sourceUnitKey);
      if (!unit) return false;
      const pass = unit[finding.pass];
      return pass.state === "complete" && pass.finding_ids.includes(finding.finding_id);
    });
    if (!referencedByDeclaredPass) {
      issue(
        issues,
        "source_review",
        path,
        `${finding.finding_id} is not referenced by any declared ${finding.pass} source pass`,
      );
    }
  }
}

function validateAdjudicationReviewEvidence(
  repoRoot: string,
  findings: OntologyAuditFinding[],
  adjudications: OntologyAuditAdjudication[],
  issues: OntologyAuditIssue[],
  path: string,
  acceptedReceiptArtifacts: ReadonlyMap<string, string> | null,
) {
  const inspectReceipt = createReceiptInspector(repoRoot);
  const acceptedReceiptSha256ByPath = new Map<string, string | null>();
  const acceptedReceiptSha256 = (logicalPath: string) => {
    if (acceptedReceiptSha256ByPath.has(logicalPath)) {
      return acceptedReceiptSha256ByPath.get(logicalPath) ?? null;
    }
    const absolutePath = repositoryArtifactPath(repoRoot, logicalPath);
    const digest = absolutePath && existsSync(absolutePath)
      ? sha256(readFileSync(absolutePath))
      : null;
    acceptedReceiptSha256ByPath.set(logicalPath, digest);
    return digest;
  };
  const findingsById = new Map(findings.map((finding) => [finding.finding_id, finding]));
  const adjudicationsByTarget = new Map(adjudications.map((adjudication) => [adjudication.target_key, adjudication]));
  for (const adjudication of adjudications) {
    for (const findingId of adjudication.finding_ids) {
      const finding = findingsById.get(findingId);
      if (!finding) {
        issue(issues, "adjudication", path, `${adjudication.target_key} references unknown finding ${findingId}`);
      } else if (!finding.target_keys.includes(adjudication.target_key)) {
        issue(
          issues,
          "adjudication",
          path,
          `${adjudication.target_key} cites ${findingId}, but that finding does not target the adjudicated item`,
        );
      }
    }
    if (adjudication.state !== "complete" || !adjudication.receipt_path) continue;
    const inspection = inspectReceipt(adjudication.receipt_path, null, true);
    if (inspection.problem) {
      issue(issues, "adjudication", path, `${adjudication.target_key} ${inspection.problem}`);
      continue;
    }
    if (acceptedReceiptArtifacts) {
      const boundSha256 = acceptedReceiptArtifacts.get(adjudication.receipt_path);
      const actualSha256 = acceptedReceiptSha256(adjudication.receipt_path);
      if (!boundSha256 || boundSha256 !== actualSha256) {
        issue(
          issues,
          "acceptance",
          path,
          `${adjudication.target_key} receipt ${adjudication.receipt_path} is not hash-bound by the acceptance receipt`,
        );
      }
    }
  }
  for (const finding of findings) {
    for (const targetKey of finding.target_keys) {
      const adjudication = adjudicationsByTarget.get(targetKey);
      if (!adjudication || !adjudication.finding_ids.includes(finding.finding_id)) {
        issue(
          issues,
          "adjudication",
          path,
          `${finding.finding_id} is not cited by the adjudication for ${targetKey}`,
        );
      }
    }
  }
}

export function validateOntologyAuditReviewEvidence({
  repoRoot,
  sources,
  findings,
  adjudications,
  acceptedReceiptArtifacts = null,
  path = "ontology-audit-review-evidence",
}: {
  repoRoot: string;
  sources: OntologyAuditSourceUnit[];
  findings: OntologyAuditFinding[];
  adjudications: OntologyAuditAdjudication[];
  acceptedReceiptArtifacts?: ReadonlyMap<string, string> | null;
  path?: string;
}) {
  const issues: OntologyAuditIssue[] = [];
  validateReviewPasses(repoRoot, sources, findings, adjudications, issues, path);
  validateAdjudicationReviewEvidence(
    repoRoot,
    findings,
    adjudications,
    issues,
    path,
    acceptedReceiptArtifacts,
  );
  return issues;
}

function appendAcceptedMachineEvidenceIssues({
  repoRoot,
  packagePath,
  acceptance,
  receiptArtifacts,
  issues,
  acceptancePath,
}: {
  repoRoot: string;
  packagePath: string;
  acceptance: OntologyAuditAcceptance;
  receiptArtifacts: ReadonlyMap<string, string>;
  issues: OntologyAuditIssue[];
  acceptancePath: string;
}) {
  const boundPackageArtifact = (name: "regeneration.json" | "closure-evidence.json") => {
    const absolute = join(packagePath, name);
    const logical = relative(repoRoot, absolute).split("\\").join("/");
    const expected = receiptArtifacts.get(logical);
    if (!existsSync(absolute) || !expected || sha256(readFileSync(absolute)) !== expected) {
      issue(issues, "acceptance", acceptancePath, `${logical} is not hash-bound by the acceptance receipt`);
      return undefined;
    }
    try {
      return JSON.parse(readFileSync(absolute, "utf8")) as Record<string, unknown>;
    } catch (error) {
      issue(
        issues,
        "malformed_json",
        absolute,
        error instanceof Error ? error.message : String(error),
      );
      return undefined;
    }
  };

  const regeneration = boundPackageArtifact("regeneration.json");
  if (regeneration) {
    const first = regeneration.regeneration_one_sha256;
    const second = regeneration.regeneration_two_sha256;
    const artifacts = regeneration.artifacts;
    if (
      regeneration.schema_version !== 1
      || regeneration.state !== "complete"
      || typeof first !== "string"
      || !SHA256_RE.test(first)
      || typeof second !== "string"
      || !SHA256_RE.test(second)
      || !Array.isArray(artifacts)
      || !Number.isInteger(regeneration.artifact_count)
      || regeneration.artifact_count !== artifacts.length
    ) {
      issue(issues, "acceptance", join(packagePath, "regeneration.json"), "regeneration receipt has an invalid shape");
    } else {
      const normalized: InputDescriptor[] = [];
      const paths = new Set<string>();
      for (const [index, value] of artifacts.entries()) {
        const row = value as Partial<InputDescriptor>;
        if (
          !value
          || typeof value !== "object"
          || typeof row.path !== "string"
          || row.path.length === 0
          || typeof row.sha256 !== "string"
          || !SHA256_RE.test(row.sha256)
          || !Number.isInteger(row.bytes)
          || (row.bytes ?? -1) < 0
          || paths.has(row.path)
        ) {
          issue(issues, "acceptance", join(packagePath, "regeneration.json"), `invalid or duplicate artifact at index ${index}`);
          continue;
        }
        const artifactPath = row.path;
        paths.add(artifactPath);
        normalized.push({ path: artifactPath, sha256: row.sha256, bytes: row.bytes! });
        if (!artifactPath.startsWith("site/")) {
          const canonicalGeneratedRoots = [
            "derived/plato/joins/",
            "derived/plato/voices/",
            "wiki/clusters/",
            "wiki/dossiers/",
          ];
          const canonicalGeneratedFiles = new Set([
            "audio/coverage.md",
            "wiki/completeness.md",
          ]);
          const absoluteArtifactPath = canonicalGeneratedRoots.some((root) => artifactPath.startsWith(root))
            || canonicalGeneratedFiles.has(artifactPath)
            ? repositoryArtifactPath(repoRoot, artifactPath)
            : null;
          const currentBytes = absoluteArtifactPath && existsSync(absoluteArtifactPath)
            ? readFileSync(absoluteArtifactPath)
            : null;
          if (
            !currentBytes
            || currentBytes.byteLength !== row.bytes
            || sha256(currentBytes) !== row.sha256
          ) {
            issue(
              issues,
              "acceptance",
              join(packagePath, "regeneration.json"),
              `canonical generated artifact differs from the accepted regeneration: ${artifactPath}`,
            );
          }
        }
      }
      const observedDigest = sha256(canonicalJson(normalized.sort((left, right) => left.path.localeCompare(right.path))));
      if (
        normalized.length !== artifacts.length
        || first !== second
        || first !== observedDigest
        || first !== acceptance.closure.regeneration_one_sha256
        || second !== acceptance.closure.regeneration_two_sha256
      ) {
        issue(issues, "acceptance", join(packagePath, "regeneration.json"), "regeneration hashes do not bind the canonical artifact list and acceptance record");
      }
    }
  }

  const evidence = boundPackageArtifact("closure-evidence.json");
  if (evidence) {
    const groups = [
      "staleAliasIssues",
      "rejectedReaderLeaks",
      "terminalStateIssues",
      "acceptedClaimLinkIssues",
      "acceptedCommentaryCitationIssues",
      "acceptedRelationFictionIssues",
    ] as const;
    if (evidence.schema_version !== 1 || evidence.state !== "complete") {
      issue(issues, "acceptance", join(packagePath, "closure-evidence.json"), "closure evidence is not terminal");
    }
    for (const group of groups) {
      if (!Array.isArray(evidence[group]) || evidence[group].some((entry) => typeof entry !== "string")) {
        issue(issues, "acceptance", join(packagePath, "closure-evidence.json"), `${group} is not a string array`);
      } else if (evidence[group].length !== 0) {
        issue(issues, "acceptance", join(packagePath, "closure-evidence.json"), `${group} is not empty`);
      }
    }
  }
}

export function validateOntologyAcceptedMachineEvidence({
  repoRoot,
  packagePath,
  acceptance,
  receiptArtifacts,
  acceptancePath = join(packagePath, "acceptance.json"),
}: {
  repoRoot: string;
  packagePath: string;
  acceptance: OntologyAuditAcceptance;
  receiptArtifacts: ReadonlyMap<string, string>;
  acceptancePath?: string;
}) {
  const issues: OntologyAuditIssue[] = [];
  appendAcceptedMachineEvidenceIssues({
    repoRoot,
    packagePath,
    acceptance,
    receiptArtifacts,
    issues,
    acceptancePath,
  });
  return issues;
}

function validateSourceCoverage(reader: CorpusReader, units: OntologyAuditSourceUnit[], issues: OntologyAuditIssue[], path: string) {
  const bySource = new Map<string, OntologyAuditSourceUnit[]>();
  for (const unit of units) {
    const entries = bySource.get(unit.source_path) ?? [];
    entries.push(unit);
    bySource.set(unit.source_path, entries);
  }
  for (const [sourcePath, sourceUnits] of bySource) {
    if (!reader.has(sourcePath)) {
      issue(issues, "source_coverage", path, `${sourcePath} is missing`);
      continue;
    }
    const source = reader.readText(sourcePath);
    const sorted = [...sourceUnits].sort((a, b) => a.start_char - b.start_char || a.end_char - b.end_char);
    let cursor = 0;
    for (const unit of sorted) {
      if (unit.start_char !== cursor) issue(issues, "source_coverage", path, `${sourcePath} expected next unit at ${cursor}, found ${unit.start_char}`);
      if (unit.end_char <= unit.start_char) issue(issues, "source_coverage", path, `${unit.key} has an empty or reversed interval`);
      if (sha256(source.slice(unit.start_char, unit.end_char)) !== unit.text_sha256) issue(issues, "source_hash", path, `${unit.key} text hash does not match current Greek bytes`);
      if (sha256(source) !== unit.source_sha256) issue(issues, "source_hash", path, `${unit.key} source hash does not match current Greek file`);
      cursor = unit.end_char;
    }
    if (cursor !== source.length) issue(issues, "source_coverage", path, `${sourcePath} coverage ends at ${cursor}, source length is ${source.length}`);
  }
  const expected = new Set(greekSourcePaths(reader));
  if (!equalStringSets([...bySource.keys()], [...expected])) issue(issues, "source_coverage", path, "source-unit files do not exactly equal the Greek source set");
}

function finalOwnedKeys(rows: Array<{ key: string; final: FinalPointer | null }>) {
  return rows.filter((row) => row.final !== null).map((row) => row.key);
}

function baselineOwnedKeys(rows: Array<{ key: string; baseline: BaselinePointer | null }>) {
  return rows.filter((row) => row.baseline !== null).map((row) => row.key);
}

function verifyLiveFinal(model: AuditModel, parsed: AuditRows, issues: OntologyAuditIssue[], packagePath: string) {
  const pairs: Array<[string, Array<{ key: string; final: FinalPointer | null }>, Array<{ key: string }>]> = [
    ["records", parsed.records, model.rows.records],
    ["concept-membership", parsed.concepts, model.rows.concepts],
    ["graphs", parsed.graphs, model.rows.graphs],
  ];
  for (const [name, packageRows, liveRows] of pairs) {
    if (!equalStringSets(finalOwnedKeys(packageRows), liveRows.map((row) => row.key))) {
      issue(issues, "final_binding", packagePath, `${name} final key set does not equal the live canonical key set`);
      continue;
    }
    const liveByKey = new Map(
      liveRows.map((row) => [row.key, (row as { final?: FinalPointer | null }).final ?? null]),
    );
    for (const row of packageRows) {
      if (row.final === null) continue;
      if (canonicalJson(row.final) !== canonicalJson(liveByKey.get(row.key))) {
        issue(issues, "final_binding", packagePath, `${row.key} final pointer differs from the live canonical bytes`);
      }
    }
  }
  if (!equalStringSets(parsed.sources.map((row) => row.key), model.rows.sources.map((row) => row.key))) {
    issue(issues, "final_binding", packagePath, "source-unit key set does not equal the live Greek marker-unit set");
  }
}

function verifyFrozenBaseline(model: AuditModel, parsed: AuditRows, manifest: OntologyAuditManifest, issues: OntologyAuditIssue[], packagePath: string) {
  const pairs: Array<[
    string,
    Array<{ key: string; baseline: BaselinePointer | null }>,
    Array<{ key: string; baseline: BaselinePointer | null }>,
  ]> = [
    ["records", parsed.records, model.rows.records],
    ["concept-membership", parsed.concepts, model.rows.concepts],
    ["graphs", parsed.graphs, model.rows.graphs],
  ];
  for (const [name, packageRows, frozenRows] of pairs) {
    const packageBaseline = packageRows.filter((row) => row.baseline !== null);
    if (!equalStringSets(packageBaseline.map((row) => row.key), frozenRows.map((row) => row.key))) {
      issue(issues, "baseline_binding", packagePath, `${name} baseline key set does not equal the frozen canonical key set`);
      continue;
    }
    const frozenByKey = new Map(frozenRows.map((row) => [row.key, row.baseline]));
    for (const row of packageBaseline) {
      if (canonicalJson(row.baseline) !== canonicalJson(frozenByKey.get(row.key))) {
        issue(issues, "baseline_binding", packagePath, `${row.key} baseline pointer differs from the frozen record bytes`);
      }
    }
  }
  if (!equalStringSets(parsed.sources.map((row) => row.key), model.rows.sources.map((row) => row.key))) {
    issue(issues, "baseline_binding", packagePath, "source-unit key set does not equal the frozen Greek marker-unit set");
  }
  if (canonicalJson(manifest.baseline.counts) !== canonicalJson(model.counts)) {
    issue(issues, "baseline_binding", packagePath, "baseline counts differ from an independent re-observation of the frozen tree");
  }
}

function verifyExplicitConceptAuditProjection(
  repoRoot: string,
  packagePath: string,
  issues: OntologyAuditIssue[],
) {
  const conceptAuditDirectory = join(packagePath, "review-inputs/concept-first");
  if (!existsSync(join(conceptAuditDirectory, "receipt.json"))) return;
  try {
    const semanticDirectory = join(packagePath, "review-inputs/semantic-remediation");
    const semanticDecisionFiles = existsSync(semanticDirectory)
      ? readdirSync(semanticDirectory, { withFileTypes: true })
          .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-decisions\.jsonl$/u.test(entry.name))
          .map((entry) => join(semanticDirectory, entry.name))
          .sort()
      : [];
    if (semanticDecisionFiles.length !== 1) {
      throw new Error(`expected one content-addressed semantic decision artifact, found ${semanticDecisionFiles.length}`);
    }
    const splitMembershipProposalObservationIds = new Map<string, readonly string[]>();
    const decisionRows = readFileSync(semanticDecisionFiles[0]!, "utf8")
      .split(/\r?\n/u)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { target_key?: unknown; replacement_target_keys?: unknown });
    for (const row of decisionRows) {
      if (typeof row.target_key !== "string" || !row.target_key.startsWith("record:observation:")) continue;
      if (!Array.isArray(row.replacement_target_keys)) continue;
      const replacements = row.replacement_target_keys
        .filter((key): key is string => typeof key === "string" && key.startsWith("record:observation:"))
        .map((key) => key.slice("record:observation:".length));
      if (replacements.length > 0) {
        splitMembershipProposalObservationIds.set(
          row.target_key.slice("record:observation:".length),
          [...new Set(replacements)].sort(),
        );
      }
    }
    const built = buildOntologyVNextFromConceptAudit({
      audit: readOntologyConceptAudit(conceptAuditDirectory, { repoRoot }),
      observationReviewStatuses: readObservationReviewStatuses(repoRoot),
      splitMembershipProposalObservationIds,
    });
    const live = readOntologyVNextDocuments(repoRoot);
    for (const field of ["axes", "concepts", "memberships"] as const) {
      if (built.documents[field] !== live[field]) {
        issue(
          issues,
          "projection_binding",
          conceptAuditDirectory,
          `${field}.jsonl is not the exact projection of explicit concept-first decisions`,
        );
      }
    }
  } catch (error) {
    issue(
      issues,
      "projection_binding",
      conceptAuditDirectory,
      `explicit concept-first projection cannot be reconstructed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function verifyOntologyAuditPackage({
  repoRoot = getRepoRoot(),
  packagePath,
  verifyLiveFinal: shouldVerifyLiveFinal = true,
}: {
  repoRoot?: string;
  packagePath: string;
  verifyLiveFinal?: boolean;
}) {
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const issues: OntologyAuditIssue[] = [];
  if (!existsSync(absolutePackagePath)) {
    issue(issues, "missing_package", packagePath, "ontology audit package does not exist");
    return issues;
  }
  const manifestPath = join(absolutePackagePath, "manifest.json");
  const acceptancePath = join(absolutePackagePath, "acceptance.json");
  if (!existsSync(manifestPath) || !existsSync(acceptancePath)) {
    issue(issues, "missing_package", packagePath, "manifest.json or acceptance.json is missing");
    return issues;
  }
  const manifest = parseJson(manifestPath, ManifestSchema, issues) as OntologyAuditManifest | undefined;
  const acceptance = parseJson(acceptancePath, AcceptanceSchema, issues) as OntologyAuditAcceptance | undefined;
  if (!manifest || !acceptance) return issues;
  if (basename(absolutePackagePath) !== manifest.snapshot_id) issue(issues, "snapshot_id", manifestPath, "package directory does not match snapshot_id");
  if (manifest.snapshot_id !== `${SNAPSHOT_PREFIX}${manifest.baseline.corpus_digest}`) issue(issues, "snapshot_id", manifestPath, "snapshot_id does not match corpus digest");
  if (acceptance.snapshot_id !== manifest.snapshot_id) issue(issues, "snapshot_id", acceptancePath, "acceptance snapshot differs from manifest");
  const manifestContent = readFileSync(manifestPath, "utf8");
  if (acceptance.manifest.sha256 !== sha256(manifestContent)) issue(issues, "hash_mismatch", acceptancePath, "acceptance manifest hash mismatch");

  const parsedRows: Partial<AuditRows> = {};
  const ownedKeyOwners = new Map<string, string>();
  for (const file of ONTOLOGY_AUDIT_PARTITION_FILES) {
    const path = join(absolutePackagePath, file);
    if (!existsSync(path)) {
      issue(issues, "missing_package", path, "partition is missing");
      continue;
    }
    const parsed = parseJsonl(path, schemasByPartition[file], issues);
    const descriptor = manifest.partitions[file];
    if (sha256(parsed.content) !== descriptor.sha256) issue(issues, "hash_mismatch", path, "partition hash differs from manifest");
    if (parsed.rows.length !== descriptor.rows) issue(issues, "row_count", path, `manifest rows=${descriptor.rows}, parsed rows=${parsed.rows.length}`);
    const keys = parsed.rows.map((row) => partitionKey(row, descriptor.key_field));
    if (keySetSha256(keys) !== descriptor.key_set_sha256) issue(issues, "key_set", path, "partition key-set digest differs from manifest");
    const binding = acceptance.partitions[file];
    if (binding.sha256 !== descriptor.sha256 || binding.rows !== descriptor.rows || binding.key_set_sha256 !== descriptor.key_set_sha256) issue(issues, "acceptance", acceptancePath, `${file} binding differs from manifest`);
    if (file !== "adjudications.jsonl" && file !== "findings.jsonl") {
      for (const key of keys) {
        const previous = ownedKeyOwners.get(key);
        if (previous) issue(issues, "duplicate_key", path, `${key} is owned by both ${previous} and ${file}`);
        else ownedKeyOwners.set(key, file);
      }
    }
    if (file === "source-units.jsonl") parsedRows.sources = parsed.rows as OntologyAuditSourceUnit[];
    else if (file === "record-units.jsonl") parsedRows.records = parsed.rows as OntologyAuditRecordUnit[];
    else if (file === "concept-membership-units.jsonl") parsedRows.concepts = parsed.rows as OntologyAuditConceptUnit[];
    else if (file === "graph-units.jsonl") parsedRows.graphs = parsed.rows as OntologyAuditGraphUnit[];
    else if (file === "findings.jsonl") parsedRows.findings = parsed.rows as OntologyAuditFinding[];
    else parsedRows.adjudications = parsed.rows as OntologyAuditAdjudication[];
  }
  if (!parsedRows.sources || !parsedRows.records || !parsedRows.concepts || !parsedRows.graphs || !parsedRows.findings || !parsedRows.adjudications) return issues;
  const rows = parsedRows as AuditRows;
  const classifiedPartitions = [
    ["record-units.jsonl", rows.records],
    ["concept-membership-units.jsonl", rows.concepts],
    ["graph-units.jsonl", rows.graphs],
  ] as const;
  for (const [file, partitionRows] of classifiedPartitions) {
    for (const row of partitionRows) {
      const expected = ontologyAuditChangeKind(row.baseline, row.final);
      if (expected === null) {
        issue(
          issues,
          "change_classification",
          join(absolutePackagePath, file),
          `${row.key} has neither a frozen baseline pointer nor a live final pointer`,
        );
      } else if (row.change !== expected) {
        issue(
          issues,
          "change_classification",
          join(absolutePackagePath, file),
          `${row.key} is ${expected} by pointer presence and content hash, but is labeled ${row.change}`,
        );
      }
    }
  }
  const ownedKeys = [...ownedKeyOwners.keys()];
  const baselineOwned = [
    ...rows.sources.map((row) => row.key),
    ...rows.records.filter((row) => row.baseline !== null).map((row) => row.key),
    ...rows.concepts.filter((row) => row.baseline !== null).map((row) => row.key),
    ...rows.graphs.filter((row) => row.baseline !== null).map((row) => row.key),
  ];
  if (
    baselineOwned.length !== manifest.baseline.owned_key_count
    || keySetSha256(baselineOwned) !== manifest.baseline.owned_key_set_sha256
  ) {
    issue(issues, "key_set", manifestPath, "baseline-owned key set differs from the frozen manifest");
  }

  const requiredTargets = new Set([...rows.records, ...rows.concepts, ...rows.graphs].map((row) => row.key));
  const allowedTargets = new Set([...requiredTargets, ...rows.sources.map((row) => row.key)]);
  const finalTargets = new Set([
    ...rows.records.filter((row) => row.final !== null).map((row) => row.key),
    ...rows.concepts.filter((row) => row.final !== null).map((row) => row.key),
    ...rows.graphs.filter((row) => row.final !== null).map((row) => row.key),
  ]);
  const adjudicationByTarget = new Map<string, OntologyAuditAdjudication>();
  for (const adjudication of rows.adjudications) {
    if (adjudicationByTarget.has(adjudication.target_key)) issue(issues, "duplicate_key", join(absolutePackagePath, "adjudications.jsonl"), `duplicate adjudication target ${adjudication.target_key}`);
    adjudicationByTarget.set(adjudication.target_key, adjudication);
    if (!allowedTargets.has(adjudication.target_key)) issue(issues, "orphan_adjudication", join(absolutePackagePath, "adjudications.jsonl"), `unknown target ${adjudication.target_key}`);
    if (adjudication.state === "pending") {
      if (adjudication.action !== null || adjudication.rationale !== null || adjudication.receipt_path !== null || adjudication.replacement_target_keys.length > 0) issue(issues, "adjudication", join(absolutePackagePath, "adjudications.jsonl"), `${adjudication.target_key} pending decision carries terminal fields`);
    } else {
      if (!adjudication.action || !ACTIONS[adjudication.target_kind].has(adjudication.action)) issue(issues, "adjudication", join(absolutePackagePath, "adjudications.jsonl"), `${adjudication.target_key} has invalid action ${adjudication.action ?? "null"}`);
      if (!adjudication.rationale || !adjudication.receipt_path) issue(issues, "adjudication", join(absolutePackagePath, "adjudications.jsonl"), `${adjudication.target_key} terminal decision lacks rationale or receipt`);
      if (adjudication.action && REPLACEMENT_ACTIONS.has(adjudication.action) && adjudication.replacement_target_keys.length === 0) issue(issues, "adjudication", join(absolutePackagePath, "adjudications.jsonl"), `${adjudication.target_key} action ${adjudication.action} requires replacement targets`);
      for (const replacement of adjudication.replacement_target_keys) {
        if (!allowedTargets.has(replacement)) {
          issue(issues, "adjudication", join(absolutePackagePath, "adjudications.jsonl"), `${adjudication.target_key} replacement target ${replacement} does not exist`);
        } else if (!finalTargets.has(replacement)) {
          issue(issues, "adjudication", join(absolutePackagePath, "adjudications.jsonl"), `${adjudication.target_key} replacement target ${replacement} is not live in the final canonical set`);
        }
      }
    }
  }
  for (const target of requiredTargets) if (!adjudicationByTarget.has(target)) issue(issues, "missing_adjudication", join(absolutePackagePath, "adjudications.jsonl"), `no adjudication for ${target}`);

  const internalKeys = new Set(ownedKeys);
  for (const finding of rows.findings) {
    for (const target of finding.target_keys) {
      if (!internalKeys.has(target)) issue(issues, "foreign_key", join(absolutePackagePath, "findings.jsonl"), `${finding.finding_id} references unknown target ${target}`);
    }
  }
  for (const record of rows.records) {
    for (const reference of record.references) {
      if (!reference.startsWith("external:") && !reference.startsWith("projection:") && !internalKeys.has(reference)) issue(issues, "foreign_key", join(absolutePackagePath, "record-units.jsonl"), `${record.key} references unknown ${reference}`);
    }
  }
  for (const unit of rows.concepts) {
    if (unit.kind === "concept" && !internalKeys.has(unit.axis_key)) issue(issues, "foreign_key", join(absolutePackagePath, "concept-membership-units.jsonl"), `${unit.key} references unknown axis ${unit.axis_key}`);
    if (unit.kind === "membership") {
      if (!internalKeys.has(unit.observation_key)) issue(issues, "foreign_key", join(absolutePackagePath, "concept-membership-units.jsonl"), `${unit.key} references unknown observation ${unit.observation_key}`);
      if (!internalKeys.has(unit.concept_key)) issue(issues, "foreign_key", join(absolutePackagePath, "concept-membership-units.jsonl"), `${unit.key} references unknown concept ${unit.concept_key}`);
    }
  }
  const registryProjection = legacyRegistryProjectionSummary(rows.concepts);
  for (const key of registryProjection.mismatches) {
    issue(
      issues,
      "projection_binding",
      join(absolutePackagePath, "concept-membership-units.jsonl"),
      `${key} registry membership list differs from audited membership rows`,
    );
  }
  for (const edge of rows.graphs) {
    if (!internalKeys.has(edge.owner_key) || !internalKeys.has(edge.from_key)) issue(issues, "foreign_key", join(absolutePackagePath, "graph-units.jsonl"), `${edge.key} has unknown owner/from key`);
    if (edge.to_key !== null && !internalKeys.has(edge.to_key)) issue(issues, "foreign_key", join(absolutePackagePath, "graph-units.jsonl"), `${edge.key} references unknown target ${edge.to_key}`);
    if ((edge.to_key === null) === (edge.external_target === null)) issue(issues, "foreign_key", join(absolutePackagePath, "graph-units.jsonl"), `${edge.key} must have exactly one internal or external target`);
  }

  let baselineReader: CorpusReader | undefined;
  let frozenBaselineTargetKeys: string[] | undefined;
  try {
    baselineReader = gitCorpusReader(repoRoot, manifest.baseline.git_commit);
  } catch (error) {
    issue(issues, "baseline_binding", manifestPath, `baseline Git commit cannot be read: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (baselineReader) {
    validateSourceCoverage(baselineReader, rows.sources, issues, join(absolutePackagePath, "source-units.jsonl"));
    const inputs = canonicalInputPaths(baselineReader).map((path) => descriptor(baselineReader!, path));
    const greekSources = greekSourcePaths(baselineReader).map((path) => descriptor(baselineReader!, path));
    const supportInputs = baselineSupportDescriptors(baselineReader);
    if (canonicalJson(inputs) !== canonicalJson(manifest.baseline.canonical_inputs)) {
      issue(issues, "baseline_binding", manifestPath, "canonical input paths, sizes, or hashes differ from the frozen Git tree");
    }
    if (canonicalJson(greekSources) !== canonicalJson(manifest.baseline.greek_sources)) {
      issue(issues, "baseline_binding", manifestPath, "Greek source paths, sizes, or hashes differ from the frozen Git tree");
    }
    if (canonicalJson(supportInputs) !== canonicalJson(manifest.baseline.support_inputs)) {
      issue(issues, "baseline_binding", manifestPath, "baseline support-material paths, roles, sizes, or hashes differ from the frozen Git tree");
    }
    if (corpusDigest(inputs) !== manifest.baseline.corpus_digest) {
      issue(issues, "baseline_binding", manifestPath, "corpus digest does not match the frozen canonical inputs");
    }
    const frozenModel = buildAuditModel(repoRoot, baselineReader);
    frozenBaselineTargetKeys = [
      ...frozenModel.rows.records.map((row) => row.key),
      ...frozenModel.rows.concepts.map((row) => row.key),
      ...frozenModel.rows.graphs.map((row) => row.key),
    ];
    verifyFrozenBaseline(frozenModel, rows, manifest, issues, absolutePackagePath);
    issues.push(...validateOntologyBaselineEvidence({
      repoRoot,
      packagePath: absolutePackagePath,
      manifest,
      concepts: rows.concepts,
      baselineLockSha256: descriptor(baselineReader, "bun.lock").sha256,
    }));
  }
  if (manifest.protocol.sha256 !== sha256(readFileSync(join(repoRoot, manifest.protocol.path)))) issue(issues, "baseline_binding", manifestPath, "protocol hash does not match repository protocol");
  if (manifest.schema.implementation_sha256 !== sha256(readFileSync(join(repoRoot, manifest.schema.implementation_path)))) issue(issues, "baseline_binding", manifestPath, "schema implementation hash does not match repository implementation");
  for (const projection of manifest.projections) {
    if (!baselineReader?.has(projection.path)) {
      issue(issues, "projection_binding", manifestPath, `${projection.path} is absent from the frozen Git tree`);
      continue;
    }
    const content = baselineReader.read(projection.path);
    if (sha256(content) !== projection.sha256 || content.byteLength !== projection.bytes) {
      issue(issues, "projection_binding", manifestPath, `${projection.path} projection bytes differ from the snapshot`);
    }
  }
  const projectionPaths = new Set(manifest.projections.map((entry) => entry.path));
  for (const support of manifest.baseline.support_inputs) {
    if (projectionPaths.has(support.path)) {
      issue(issues, "projection_binding", manifestPath, `${support.path} is a static support material falsely classified as a projection`);
    }
  }
  try {
    const tree = gitValue(repoRoot, ["rev-parse", `${manifest.baseline.git_commit}^{tree}`]);
    if (tree !== manifest.baseline.git_tree) issue(issues, "baseline_binding", manifestPath, "baseline Git commit does not resolve to the recorded tree");
  } catch (error) {
    issue(issues, "baseline_binding", manifestPath, `baseline Git commit cannot be resolved: ${error instanceof Error ? error.message : String(error)}`);
  }

  let liveFinalTargetKeys: string[] | undefined;
  let liveFinalCorpusDigest: string | undefined;
  if (shouldVerifyLiveFinal) {
    verifyExplicitConceptAuditProjection(repoRoot, absolutePackagePath, issues);
    const live = buildAuditModel(repoRoot, worktreeCorpusReader(repoRoot));
    liveFinalCorpusDigest = live.corpusDigest;
    liveFinalTargetKeys = [
      ...live.rows.records.map((row) => row.key),
      ...live.rows.concepts.map((row) => row.key),
      ...live.rows.graphs.map((row) => row.key),
    ];
    verifyLiveFinal(live, rows, issues, absolutePackagePath);
  }
  const baselineKeys = [
    ...baselineOwnedKeys(rows.records),
    ...baselineOwnedKeys(rows.concepts),
    ...baselineOwnedKeys(rows.graphs),
  ];
  const finalKeys = [
    ...finalOwnedKeys(rows.records),
    ...finalOwnedKeys(rows.concepts),
    ...finalOwnedKeys(rows.graphs),
  ];
  const baselineSetEqual = frozenBaselineTargetKeys !== undefined && equalStringSets(baselineKeys, frozenBaselineTargetKeys);
  const finalSetEqual = liveFinalTargetKeys === undefined
    ? acceptance.closure.final_set_equal
    : equalStringSets(finalKeys, liveFinalTargetKeys);
  if (acceptance.closure.baseline_set_equal !== baselineSetEqual) issue(issues, "acceptance", acceptancePath, "baseline_set_equal does not match package rows");
  if (acceptance.closure.final_set_equal !== finalSetEqual) issue(issues, "acceptance", acceptancePath, "final_set_equal does not match package rows");
  const unresolved = rows.adjudications.filter((row) => row.state === "pending").length;
  if (acceptance.closure.unresolved_adjudications !== unresolved) issue(issues, "acceptance", acceptancePath, "unresolved adjudication count is stale");
  const baselineLaneCounts = countBy(
    rows.records.filter((row) => row.baseline !== null),
    (row) => row.lane,
  );
  const laneNames = new Set<string>();
  for (const lane of manifest.lane_states) {
    if (laneNames.has(lane.lane)) issue(issues, "acceptance", manifestPath, `duplicate lane state ${lane.lane}`);
    laneNames.add(lane.lane);
    if (lane.count !== (baselineLaneCounts[lane.lane] ?? 0)) {
      issue(issues, "acceptance", manifestPath, `${lane.lane} lane count is stale`);
    }
  }
  let acceptanceReceiptArtifacts: ReadonlyMap<string, string> | null = null;
  if (acceptance.state === "accepted") {
    const sourcePassesComplete = rows.sources.every((row) => row.primary.state === "complete" && row.independent.state === "complete");
    const reconciliationsComplete = rows.sources.every((row) => row.reconciliation.state !== "pending");
    const adjudicationsComplete = unresolved === 0;
    if (manifest.audit_state !== "accepted") issue(issues, "acceptance", manifestPath, "accepted package retains a pending manifest state");
    for (const lane of manifest.lane_states) {
      const expected = lane.count === 0 ? "zero_result" : "complete";
      if (lane.state !== expected) issue(issues, "acceptance", manifestPath, `${lane.lane} lane is ${lane.state}, expected terminal state ${expected}`);
    }
    for (const row of [...rows.records, ...rows.concepts, ...rows.graphs]) {
      if (row.audit_state !== "complete") issue(issues, "acceptance", acceptancePath, `${row.key} retains pending audit state after acceptance`);
    }
    if (!sourcePassesComplete || !reconciliationsComplete || !adjudicationsComplete) issue(issues, "acceptance", acceptancePath, "accepted package still has pending review work");
    if (
      acceptance.closure.source_passes_complete !== sourcePassesComplete
      || acceptance.closure.reconciliations_complete !== reconciliationsComplete
      || acceptance.closure.adjudications_complete !== adjudicationsComplete
    ) {
      issue(issues, "acceptance", acceptancePath, "accepted closure completion flags do not match the audit partitions");
    }
    if (!acceptance.receipt || !acceptance.final_corpus_digest) issue(issues, "acceptance", acceptancePath, "accepted package lacks receipt or final corpus digest");
    if (liveFinalCorpusDigest && acceptance.final_corpus_digest !== liveFinalCorpusDigest) {
      issue(issues, "acceptance", acceptancePath, "accepted final corpus digest differs from an independent live re-observation");
    }
    if (!acceptance.closure.baseline_set_equal || !acceptance.closure.final_set_equal || acceptance.closure.stale_aliases !== 0 || acceptance.closure.rejected_reader_leaks !== 0) issue(issues, "acceptance", acceptancePath, "accepted package has an open closure condition");
    if (!acceptance.closure.regeneration_one_sha256 || acceptance.closure.regeneration_one_sha256 !== acceptance.closure.regeneration_two_sha256) issue(issues, "acceptance", acceptancePath, "accepted package lacks byte-identical regeneration hashes");
    if (acceptance.receipt) {
      const inspection = createReceiptInspector(repoRoot)(acceptance.receipt.path, acceptance.receipt.sha256, true);
      if (inspection.problem) issue(issues, "acceptance", acceptancePath, `acceptance ${inspection.problem}`);
      else {
        acceptanceReceiptArtifacts = inspection.artifacts;
        issues.push(...validateOntologyAcceptedMachineEvidence({
          repoRoot,
          packagePath: absolutePackagePath,
          acceptance,
          receiptArtifacts: inspection.artifacts,
          acceptancePath,
        }));
      }
    }
  } else {
    if (manifest.audit_state !== "pending") issue(issues, "acceptance", manifestPath, "pending acceptance has a terminal manifest state");
    for (const lane of manifest.lane_states) {
      const expected = lane.count === 0 ? "zero_result" : "pending";
      if (lane.state !== expected) issue(issues, "acceptance", manifestPath, `${lane.lane} lane is ${lane.state}, expected pre-acceptance state ${expected}`);
    }
    if (acceptance.receipt !== null || acceptance.final_corpus_digest !== null) issue(issues, "acceptance", acceptancePath, "pending acceptance must not claim a receipt or final digest");
    if (acceptance.closure.source_passes_complete || acceptance.closure.reconciliations_complete || acceptance.closure.adjudications_complete) issue(issues, "acceptance", acceptancePath, "pending acceptance falsely claims completed review work");
  }
  issues.push(...validateOntologyAuditReviewEvidence({
    repoRoot,
    sources: rows.sources,
    findings: rows.findings,
    adjudications: rows.adjudications,
    acceptedReceiptArtifacts: acceptanceReceiptArtifacts,
    path: join(absolutePackagePath, "adjudications.jsonl"),
  }));
  return issues;
}

export function listOntologyAuditPackagePaths(repoRoot = getRepoRoot()) {
  const root = join(repoRoot, AUDIT_ROOT);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name))
    .map((entry) => `${AUDIT_ROOT}/${entry.name}`)
    .sort();
}

export function collectOntologyAuditFailures(repoRoot = getRepoRoot()) {
  const packages = listOntologyAuditPackagePaths(repoRoot);
  if (packages.length === 0) return [`${AUDIT_ROOT}: no snapshot-bound ontology audit package exists`];
  if (packages.length > 1) return [`${AUDIT_ROOT}: expected one active audit package, found ${packages.length}`];
  return verifyOntologyAuditPackage({ repoRoot, packagePath: packages[0]! }).map(
    (entry) => `${entry.path}: [${entry.code}] ${entry.message}`,
  );
}

export function formatOntologyAuditIssues(issues: readonly OntologyAuditIssue[]) {
  return issues.map((entry) => `${entry.path}: [${entry.code}] ${entry.message}`).join("\n");
}

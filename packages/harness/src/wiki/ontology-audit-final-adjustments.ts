import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { gunzipSync } from "node:zlib";
import {
  assertCommentaryAuditSampleEvidenceReplay,
  type CommentaryAuditSampleEvidenceRecord,
} from "../commentary-audit-sample-campaign.js";
import { parseCommentaryQualityAudit } from "../commentary-audit.js";
import { fencedYamlRecordBlocks, type CanonicalYamlRecord, type FencedYamlRecordBlock } from "./fenced-record.js";
import { acceptedRelationDenial, type AcceptedRelationDenialRule } from "./relation-validator.js";

const DECISION_ARTIFACT = /^sha256-([a-f0-9]{64})-decisions\.jsonl$/u;
const PRIOR_STATE_ARTIFACT = /^sha256-([a-f0-9]{64})-prior-state\.json$/u;
const PRIOR_PARTITION_ARTIFACT = /^sha256-([a-f0-9]{64})-prior-(adjudications|graph-units|record-units)\.jsonl\.gz$/u;
const STRUCTURAL_EVIDENCE_ARTIFACT = /^sha256-([a-f0-9]{64})-commentary-structural-review-evidence\.jsonl$/u;
const RELATION_FICTION_EVIDENCE_ARTIFACT =
  /^sha256-([a-f0-9]{64})-relation-semantic-fiction-review-evidence\.json$/u;
const RECONSIDERATION_RECEIPT_ARTIFACT =
  /^wiki\/review\/(\d{4}-\d{2}-\d{2})-commentary-block-reconsideration-([a-z0-9-]+)-accepted-[a-f0-9]{12}\.md$/u;
const RECONSIDERATION_MANIFEST_ARTIFACT =
  /^sha256-([a-f0-9]{64})-commentary-reconsideration-evidence\.json$/u;
const RECONSIDERATION_OUTPUT_ARTIFACT =
  /^sha256-([a-f0-9]{64})-([a-z0-9-]+)-commentary-reconsideration-review-bundle\.json$/u;
const RECONSIDERATION_PACKET_ARTIFACT =
  /^sha256-([a-f0-9]{64})-([a-z0-9-]+)-commentary-reconsideration-packet-bundle\.json$/u;
const RECONSIDERATION_SCHEMA_ARTIFACT =
  /^sha256-([a-f0-9]{64})-([a-z0-9-]+)-commentary-reconsideration-schema-bundle\.json$/u;
const SAMPLE_FAILURE_RECEIPT_ARTIFACT =
  /^wiki\/review\/(\d{4}-\d{2}-\d{2})-commentary-sample-failure-rejection-([a-z0-9-]+)-[a-f0-9]{12}\.md$/u;
const SAMPLE_FAILURE_EVIDENCE_ARTIFACT =
  /^wiki\/submissions\/commentary-audit-sample\/([a-z0-9-]+)\/([a-f0-9]{64})\.json$/u;
const SAMPLE_FAILURE_SUBMISSION_ARTIFACT =
  /^wiki\/submissions\/commentary-sample-failure-rejection\/([a-z0-9-]+)\/([a-f0-9]{64})\.json$/u;
const TARGET = /^(?:record|edge):\S+$/u;
const RECEIPT = /^wiki\/review\/[a-zA-Z0-9_./-]+\.(?:md|json)$/u;
const REPO_ARTIFACT = /^(?!scratch\/)(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9_./-]+$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const ACTIONS = new Set(["add", "reject", "retire", "revise"]);
const PROVENANCE_KINDS = new Set([
  "commentary_reconsideration",
  "commentary_sample_failure",
  "commentary_structural_review",
  "ontology_item_review",
  "relation_semantic_fiction",
]);
const REQUIRED_KEYS = [
  "action",
  "expected_final_pointer_sha256",
  "prior_final_pointer_sha256",
  "provenance_chain",
  "rationale",
  "receipt_path",
  "superseded_adjudication_sha256",
  "target_key",
] as const;
const PRIOR_PARTITION_FILES = ["adjudications.jsonl", "graph-units.jsonl", "record-units.jsonl"] as const;

export const ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT =
  "wiki/review/2026-09-01-ontology-vnext-final-adjustments.md";
export const ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT =
  "wiki/review/2026-09-01-ontology-relation-semantic-fiction-rejections.md";

const RELATION_FICTION_REVIEWER = "ontology-vnext-relation-gate-independent-review";
const RELATION_FICTION_SOURCE_POLICY =
  "Canonical typed relation records only; no translation was consulted.";
const RELATION_FICTION_GRAPH_POLICY =
  "Retire accepted semantic edges; rejected records and immutable baseline pointers retain review provenance.";
const RELATION_FICTION_TARGET_KEYS = [
  "record:relation:rel_cross-dialogue_0638",
  "record:relation:rel_republic_0024",
  "record:relation:rel_timaeus_0050",
] as const;

export type OntologyAuditArtifactBinding = { path: string; sha256: string };
export type OntologyAuditPriorPartitionBinding = OntologyAuditArtifactBinding & {
  source_path: string;
  uncompressed_sha256: string;
};
export type OntologyAuditFinalAdjustmentAction = "add" | "reject" | "retire" | "revise";
export type OntologyAuditFinalAdjustmentProvenanceKind =
  | "commentary_reconsideration"
  | "commentary_sample_failure"
  | "commentary_structural_review"
  | "ontology_item_review"
  | "relation_semantic_fiction";

export type OntologyAuditFinalAdjustmentProvenanceStage = {
  kind: OntologyAuditFinalAdjustmentProvenanceKind;
  action: OntologyAuditFinalAdjustmentAction;
  prior_final_pointer_sha256: string | null;
  expected_final_pointer_sha256: string | null;
  source_receipt_path: string;
  evidence_artifacts: OntologyAuditArtifactBinding[];
};

export type OntologyAuditFinalAdjustment = {
  target_key: string;
  action: OntologyAuditFinalAdjustmentAction;
  prior_final_pointer_sha256: string | null;
  expected_final_pointer_sha256: string | null;
  superseded_adjudication_sha256: string | null;
  rationale: string;
  receipt_path: typeof ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT;
  provenance_chain: OntologyAuditFinalAdjustmentProvenanceStage[];
};

export type OntologyAuditFinalAdjustmentPriorTarget = {
  target_key: string;
  prior_final: unknown | null;
  superseded_adjudication: unknown | null;
};

export type OntologyAuditFinalAdjustmentPriorState = {
  schema_version: 1;
  acceptance: { path: string; sha256: string; text: string };
  partitions: OntologyAuditPriorPartitionBinding[];
  targets: OntologyAuditFinalAdjustmentPriorTarget[];
};

export type OntologyAuditFinalAdjustmentArtifact = {
  artifactPath: string;
  sha256: string;
  decisions: ReadonlyMap<string, OntologyAuditFinalAdjustment>;
  priorStateArtifactPath: string;
  priorStateSha256: string;
  priorState: OntologyAuditFinalAdjustmentPriorState;
  receiptPath: typeof ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT;
  receiptSha256: string;
  receiptBindings: ReadonlyMap<string, string>;
};

export function assertOntologyAuditFinalAdjustmentRematerializationPending(
  acceptance: unknown,
) {
  if (acceptance === null || typeof acceptance !== "object" || Array.isArray(acceptance) ||
    (acceptance as { state?: unknown }).state !== "pending") {
    throw new Error("Final-adjustment rematerialization requires the current canonical acceptance marker to be pending");
  }
}

type OntologyAuditFinalAdjustmentStageEntry = {
  decision: OntologyAuditFinalAdjustment;
  stage: OntologyAuditFinalAdjustmentProvenanceStage;
  index: number;
};

function provenanceStages(
  decisions: readonly OntologyAuditFinalAdjustment[],
  kind: OntologyAuditFinalAdjustmentProvenanceKind,
): OntologyAuditFinalAdjustmentStageEntry[] {
  return decisions.flatMap((decision) => decision.provenance_chain.flatMap((stage, index) =>
    stage.kind === kind ? [{ decision, stage, index }] : []
  ));
}

export type OntologyAuditRelationFictionReviewEntry = {
  action: "reject";
  claim_a: string;
  claim_b: string;
  denial_field: "basis" | "limits" | "basis+limits";
  denial_rule: AcceptedRelationDenialRule;
  expected_final_full_match_sha256: string;
  expected_final_pointer_sha256: string;
  expected_review_status: "rejected";
  graph_disposition: "retire_accepted_semantic_edge_preserve_baseline_provenance";
  ledger_path: string;
  ordinal: number;
  prior_full_match_sha256: string;
  prior_final_pointer_sha256: string;
  prior_review_status: "accepted";
  rationale: string;
  relation_id: string;
  relation_kind: string;
  replacement_target_keys: [];
  resolution: string;
  superseded_adjudication_sha256: string;
  target_key: string;
};

export type OntologyAuditRelationFictionReviewEvidence = {
  schema_version: 1;
  kind: "accepted_relation_semantic_fiction_review";
  reviewer: typeof RELATION_FICTION_REVIEWER;
  reviewed_on: "2026-09-01";
  source_policy: typeof RELATION_FICTION_SOURCE_POLICY;
  graph_policy: typeof RELATION_FICTION_GRAPH_POLICY;
  receipt_path: typeof ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT;
  entries: OntologyAuditRelationFictionReviewEntry[];
};

export type OntologyAuditRelationFictionReviewArtifact = {
  artifact: OntologyAuditArtifactBinding;
  receiptPath: typeof ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT;
  entries: ReadonlyMap<string, OntologyAuditRelationFictionReviewEntry>;
};

export function ontologyAuditRelationFictionEdgeRationale(
  entry: OntologyAuditRelationFictionReviewEntry,
) {
  return `Retire edge:relation:${entry.relation_id} from the accepted semantic graph because the reviewed relation record is rejected as schema-compliance fiction. The record and the edge's immutable baseline pointer retain the historical endpoint provenance.`;
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function canonicalStructuralEvidenceRow(row: Record<string, unknown>) {
  return `{"audit":${JSON.stringify(row.audit)},"audit_output":${canonicalJson(row.audit_output)},"commentary_ids":${canonicalJson(row.commentary_ids)},"dialogue":${JSON.stringify(row.dialogue)},"receipt":${canonicalJson(row.receipt)},"schema_version":1,"section_id":${JSON.stringify(row.section_id)},"submission":${canonicalJson(row.submission)},"unit_key":${JSON.stringify(row.unit_key)}}`;
}

function exactKeys(value: Record<string, unknown>, required: readonly string[], location: string) {
  const keys = Object.keys(value).sort();
  if (keys.length !== required.length || keys.some((key, index) => key !== required[index])) {
    throw new Error(`${location}: must contain exactly ${required.join(", ")}`);
  }
}

export function ontologyAuditFinalPointerSha256(pointer: unknown | null) {
  return pointer === null ? null : sha256(canonicalJson(pointer));
}

export function ontologyAuditFinalPointerCoreSha256(pointer: unknown | null) {
  if (pointer === null) return null;
  if (typeof pointer !== "object" || Array.isArray(pointer)) {
    throw new Error("Final pointer must be an object or null");
  }
  const value = pointer as Record<string, unknown>;
  const { path, ordinal, canonical_sha256: canonicalSha256 } = value;
  if (
    typeof path !== "string" || path.length === 0 || !Number.isInteger(ordinal) || (ordinal as number) < 0 ||
    typeof canonicalSha256 !== "string" || !SHA256.test(canonicalSha256)
  ) {
    throw new Error("Final pointer has invalid core identity fields");
  }
  return sha256(canonicalJson({ path, ordinal, canonical_sha256: canonicalSha256 }));
}

export function ontologyAuditAdjudicationSha256(adjudication: unknown | null) {
  return adjudication === null ? null : sha256(canonicalJson(adjudication));
}

export function verifyOntologyAuditStructuralReviewReplay(
  value: unknown,
  expectedSha256: string,
  location = "structural review evidence",
) {
  if (!SHA256.test(expectedSha256)) throw new Error(`${location}: audit output SHA-256 is malformed`);
  const audit = parseCommentaryQualityAudit(value, { path: `${location}:audit` });
  const replay = `${JSON.stringify(value, null, 2)}\n`;
  if (sha256(replay) !== expectedSha256) {
    throw new Error(`${location}: embedded parsed audit does not replay the exact reviewed output hash`);
  }
  return audit;
}

export function expectedOntologyAuditFinalAdjustmentAction({
  kind,
  priorFinal,
  expectedFinal,
}: {
  kind: "record" | "edge";
  priorFinal: { path: string; ordinal: number; canonical_sha256: string; review_status?: unknown } | null;
  expectedFinal: { path: string; ordinal: number; canonical_sha256: string; review_status?: unknown } | null;
}): OntologyAuditFinalAdjustmentAction | null {
  const priorCore = ontologyAuditFinalPointerCoreSha256(priorFinal);
  const expectedCore = ontologyAuditFinalPointerCoreSha256(expectedFinal);
  // Graph pointers inherit owner review status. A status-only change does not
  // change the raw link identity and is therefore a non-actionable projection.
  // The same rule permits the one-time legacy FinalPointer schema enrichment.
  if (priorCore === expectedCore) return null;
  if (priorFinal === null) return "add";
  if (expectedFinal === null) return "retire";
  return kind === "record" && expectedFinal.review_status === "rejected" ? "reject" : "revise";
}

function nullableSha256(value: unknown, field: string, location: string) {
  if (value !== null && (typeof value !== "string" || !SHA256.test(value))) {
    throw new Error(`${location}: ${field} must be a lowercase SHA-256 or null`);
  }
  return value as string | null;
}

function validateArtifactBinding(value: unknown, location: string): OntologyAuditArtifactBinding {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: artifact binding must be an object`);
  }
  const record = value as Record<string, unknown>;
  exactKeys(record, ["path", "sha256"], location);
  if (typeof record.path !== "string" || !REPO_ARTIFACT.test(record.path) ||
    record.path.split("/").some((segment) => segment.length === 0 || segment === "." || segment === "..")) {
    throw new Error(`${location}: artifact path must be durable, canonical, repo-relative, and outside scratch/`);
  }
  if (typeof record.sha256 !== "string" || !SHA256.test(record.sha256)) {
    throw new Error(`${location}: artifact sha256 must be a lowercase SHA-256`);
  }
  return { path: record.path, sha256: record.sha256 };
}

function validatePriorPartitionBinding(value: unknown, location: string): OntologyAuditPriorPartitionBinding {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: prior partition binding must be an object`);
  }
  const record = value as Record<string, unknown>;
  exactKeys(record, ["path", "sha256", "source_path", "uncompressed_sha256"], location);
  const binding = validateArtifactBinding({ path: record.path, sha256: record.sha256 }, location);
  const partitionName = PRIOR_PARTITION_ARTIFACT.exec(basename(binding.path));
  if (!partitionName) {
    throw new Error(`${location}: path must name a content-addressed compressed prior partition`);
  }
  if (typeof record.source_path !== "string" || !REPO_ARTIFACT.test(record.source_path) ||
    record.source_path.split("/").some((segment) => segment.length === 0 || segment === "." || segment === "..") ||
    !PRIOR_PARTITION_FILES.includes(basename(record.source_path) as (typeof PRIOR_PARTITION_FILES)[number])) {
    throw new Error(`${location}: source_path must name the accepted record, graph, or adjudication partition`);
  }
  if (`${partitionName[2]}.jsonl` !== basename(record.source_path)) {
    throw new Error(`${location}: compressed artifact kind differs from source_path`);
  }
  if (typeof record.uncompressed_sha256 !== "string" || !SHA256.test(record.uncompressed_sha256)) {
    throw new Error(`${location}: uncompressed_sha256 must be a lowercase SHA-256`);
  }
  return {
    ...binding,
    source_path: record.source_path,
    uncompressed_sha256: record.uncompressed_sha256,
  };
}

function validateAdjustmentTransitionShape(
  action: OntologyAuditFinalAdjustmentAction,
  priorFinalPointerSha256: string | null,
  expectedFinalPointerSha256: string | null,
  location: string,
) {
  if (action === "add" && (priorFinalPointerSha256 !== null || expectedFinalPointerSha256 === null)) {
    throw new Error(`${location}: add requires a null prior pointer and a live expected pointer`);
  }
  if (action === "retire" && (priorFinalPointerSha256 === null || expectedFinalPointerSha256 !== null)) {
    throw new Error(`${location}: retire requires a live prior pointer and a null expected pointer`);
  }
  if ((action === "revise" || action === "reject") &&
    (priorFinalPointerSha256 === null || expectedFinalPointerSha256 === null)) {
    throw new Error(`${location}: ${action} requires live prior and expected pointers`);
  }
  if (priorFinalPointerSha256 !== null && expectedFinalPointerSha256 !== null &&
    priorFinalPointerSha256 === expectedFinalPointerSha256) {
    throw new Error(`${location}: live-to-live adjustment pointers must differ`);
  }
}

function validateProvenanceStage(
  value: unknown,
  targetKey: string,
  location: string,
  repoRoot?: string,
): OntologyAuditFinalAdjustmentProvenanceStage {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: provenance stage must be an object`);
  }
  const record = value as Record<string, unknown>;
  exactKeys(
    record,
    [
      "action",
      "evidence_artifacts",
      "expected_final_pointer_sha256",
      "kind",
      "prior_final_pointer_sha256",
      "source_receipt_path",
    ],
    location,
  );
  const kind = record.kind;
  const action = record.action;
  const priorFinalPointerSha256 = nullableSha256(
    record.prior_final_pointer_sha256,
    "prior_final_pointer_sha256",
    location,
  );
  const expectedFinalPointerSha256 = nullableSha256(
    record.expected_final_pointer_sha256,
    "expected_final_pointer_sha256",
    location,
  );
  if (typeof kind !== "string" || !PROVENANCE_KINDS.has(kind)) {
    throw new Error(`${location}: kind is not one canonical review lane`);
  }
  if (typeof action !== "string" || !ACTIONS.has(action)) {
    throw new Error(`${location}: action must be add, reject, retire, or revise`);
  }
  validateAdjustmentTransitionShape(
    action as OntologyAuditFinalAdjustmentAction,
    priorFinalPointerSha256,
    expectedFinalPointerSha256,
    location,
  );
  if (kind === "commentary_reconsideration" && action !== "add" && action !== "revise") {
    throw new Error(`${location}: commentary reconsideration may only add or revise a target`);
  }
  if (kind !== "commentary_reconsideration" && kind !== "ontology_item_review" &&
    kind !== "relation_semantic_fiction" && action !== "reject") {
    throw new Error(`${location}: rejection review stages must have action reject`);
  }
  if (kind === "relation_semantic_fiction") {
    const rejectsRecord = /^record:relation:rel_[a-z0-9-]+_\d{4}$/u.test(targetKey) && action === "reject";
    const retiresEdge = /^edge:relation:rel_[a-z0-9-]+_\d{4}$/u.test(targetKey) && action === "retire";
    if (!rejectsRecord && !retiresEdge) {
      throw new Error(`${location}: relation semantic-fiction review must reject one relation record or retire its semantic edge`);
    }
  }
  if ((kind === "commentary_structural_review" || kind === "commentary_sample_failure") &&
    !/^record:commentary:comm_[a-z0-9-]+_\d{4}$/u.test(targetKey)) {
    throw new Error(`${location}: commentary rejection review must target one commentary record`);
  }
  if (targetKey.startsWith("edge:") && kind !== "commentary_reconsideration" &&
    kind !== "ontology_item_review" && kind !== "relation_semantic_fiction") {
    throw new Error(`${location}: edge adjustments require exact reconsideration, relation-fiction, or item-review evidence`);
  }
  const sourceReceiptPath = record.source_receipt_path;
  if (typeof sourceReceiptPath !== "string" || !RECEIPT.test(sourceReceiptPath) ||
    sourceReceiptPath === ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT) {
    throw new Error(`${location}: source_receipt_path must name the underlying canonical review receipt`);
  }
  if (!Array.isArray(record.evidence_artifacts) || record.evidence_artifacts.length === 0) {
    throw new Error(`${location}: evidence_artifacts must bind at least one durable canonical artifact`);
  }
  const evidenceArtifacts = record.evidence_artifacts.map((entry, index) =>
    validateArtifactBinding(entry, `${location}: evidence_artifacts[${index}]`)
  );
  const evidencePaths = evidenceArtifacts.map((entry) => entry.path);
  if (new Set(evidencePaths).size !== evidencePaths.length ||
    [...evidencePaths].sort().some((path, index) => path !== evidencePaths[index])) {
    throw new Error(`${location}: evidence_artifacts must be unique and sorted by path`);
  }
  if (repoRoot) {
    for (const path of [sourceReceiptPath, ...evidencePaths]) {
      const absolute = repositoryArtifactPath(repoRoot, path);
      if (!absolute || !existsSync(absolute)) throw new Error(`${location}: bound source artifact is missing: ${path}`);
    }
    for (const binding of evidenceArtifacts) {
      const absolute = repositoryArtifactPath(repoRoot, binding.path)!;
      if (sha256(readFileSync(absolute)) !== binding.sha256) {
        throw new Error(`${location}: bound source artifact is hash-mismatched: ${binding.path}`);
      }
    }
  }
  return {
    kind: kind as OntologyAuditFinalAdjustmentProvenanceKind,
    action: action as OntologyAuditFinalAdjustmentAction,
    prior_final_pointer_sha256: priorFinalPointerSha256,
    expected_final_pointer_sha256: expectedFinalPointerSha256,
    source_receipt_path: sourceReceiptPath,
    evidence_artifacts: evidenceArtifacts,
  };
}

function validateDecision(value: unknown, location: string, repoRoot?: string): OntologyAuditFinalAdjustment {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: final adjustment must be an object`);
  }
  const record = value as Record<string, unknown>;
  exactKeys(record, REQUIRED_KEYS, `${location}: final adjustment`);
  const targetKey = record.target_key;
  const action = record.action;
  const priorFinalPointerSha256 = nullableSha256(record.prior_final_pointer_sha256, "prior_final_pointer_sha256", location);
  const expectedFinalPointerSha256 = nullableSha256(record.expected_final_pointer_sha256, "expected_final_pointer_sha256", location);
  const supersededAdjudicationSha256 = nullableSha256(record.superseded_adjudication_sha256, "superseded_adjudication_sha256", location);
  const rationale = record.rationale;
  const receiptPath = record.receipt_path;
  if (typeof targetKey !== "string" || !TARGET.test(targetKey)) {
    throw new Error(`${location}: target_key must name one exact record or edge target`);
  }
  if (typeof action !== "string" || !ACTIONS.has(action)) {
    throw new Error(`${location}: action must be add, reject, retire, or revise`);
  }
  validateAdjustmentTransitionShape(
    action as OntologyAuditFinalAdjustmentAction,
    priorFinalPointerSha256,
    expectedFinalPointerSha256,
    location,
  );
  if (typeof rationale !== "string" || rationale !== rationale.trim() || rationale.length < 40 || rationale.length > 500 || /[\r\n]/u.test(rationale)) {
    throw new Error(`${location}: rationale must be one meaningful line of 40-500 characters`);
  }
  if (receiptPath !== ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT) {
    throw new Error(`${location}: receipt_path must name the one canonical final-adjustment receipt`);
  }
  if (!Array.isArray(record.provenance_chain) || record.provenance_chain.length === 0 ||
    record.provenance_chain.length > 32) {
    throw new Error(`${location}: provenance_chain must contain 1-32 ordered review stages`);
  }
  const provenanceChain = record.provenance_chain.map((stage, index) =>
    validateProvenanceStage(stage, targetKey, `${location}: provenance_chain[${index}]`, repoRoot)
  );
  if (provenanceChain[0]!.prior_final_pointer_sha256 !== priorFinalPointerSha256 ||
    provenanceChain.at(-1)!.expected_final_pointer_sha256 !== expectedFinalPointerSha256) {
    throw new Error(`${location}: provenance_chain endpoints must equal the decision pointers`);
  }
  for (let index = 1; index < provenanceChain.length; index += 1) {
    if (provenanceChain[index - 1]!.expected_final_pointer_sha256 !==
      provenanceChain[index]!.prior_final_pointer_sha256) {
      throw new Error(`${location}: provenance_chain stage ${index + 1} does not continue the prior stage pointer`);
    }
  }
  return {
    target_key: targetKey,
    action: action as OntologyAuditFinalAdjustmentAction,
    prior_final_pointer_sha256: priorFinalPointerSha256,
    expected_final_pointer_sha256: expectedFinalPointerSha256,
    superseded_adjudication_sha256: supersededAdjudicationSha256,
    rationale,
    receipt_path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
    provenance_chain: provenanceChain,
  };
}

function repositoryArtifactPath(repoRoot: string, logicalPath: string) {
  if (!REPO_ARTIFACT.test(logicalPath)) return null;
  const root = resolve(repoRoot);
  const absolute = resolve(root, logicalPath);
  const canonical = relative(root, absolute).split("\\").join("/");
  if (!absolute.startsWith(`${root}${sep}`) || canonical !== logicalPath || !existsSync(absolute)) return null;
  try {
    const realRoot = realpathSync.native(root);
    const realAbsolute = realpathSync.native(absolute);
    const realCanonical = relative(realRoot, realAbsolute).split("\\").join("/");
    return realAbsolute.startsWith(`${realRoot}${sep}`) && realCanonical === logicalPath
      ? absolute
      : null;
  } catch {
    return null;
  }
}

export function renderOntologyAuditRelationFictionReviewEvidence(
  evidence: OntologyAuditRelationFictionReviewEvidence,
) {
  return `${canonicalJson(evidence)}\n`;
}

export function ontologyAuditRelationFictionReviewArtifactName(content: string) {
  return `sha256-${sha256(content)}-relation-semantic-fiction-review-evidence.json`;
}

function parseRelationFictionReviewEvidence(
  value: unknown,
  location: string,
): OntologyAuditRelationFictionReviewEvidence {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: relation-fiction review evidence must be an object`);
  }
  const record = value as Record<string, unknown>;
  exactKeys(
    record,
    ["entries", "graph_policy", "kind", "receipt_path", "reviewed_on", "reviewer", "schema_version", "source_policy"],
    location,
  );
  if (record.schema_version !== 1 || record.kind !== "accepted_relation_semantic_fiction_review" ||
    record.reviewer !== RELATION_FICTION_REVIEWER || record.reviewed_on !== "2026-09-01" ||
    record.source_policy !== RELATION_FICTION_SOURCE_POLICY || record.graph_policy !== RELATION_FICTION_GRAPH_POLICY ||
    record.receipt_path !== ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT || !Array.isArray(record.entries)) {
    throw new Error(`${location}: relation-fiction review identity or policy is invalid`);
  }
  const entries = record.entries.map((value, index) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${location}: entry ${index + 1} must be an object`);
    }
    const entry = value as Record<string, unknown>;
    exactKeys(
      entry,
      [
        "action",
        "claim_a",
        "claim_b",
        "denial_field",
        "denial_rule",
        "expected_final_full_match_sha256",
        "expected_final_pointer_sha256",
        "expected_review_status",
        "graph_disposition",
        "ledger_path",
        "ordinal",
        "prior_final_pointer_sha256",
        "prior_full_match_sha256",
        "prior_review_status",
        "rationale",
        "relation_id",
        "relation_kind",
        "replacement_target_keys",
        "resolution",
        "superseded_adjudication_sha256",
        "target_key",
      ],
      `${location}: entry ${index + 1}`,
    );
    const stringFields = [
      "claim_a",
      "claim_b",
      "denial_rule",
      "ledger_path",
      "rationale",
      "relation_id",
      "relation_kind",
      "resolution",
      "target_key",
    ] as const;
    if (stringFields.some((field) => typeof entry[field] !== "string" || (entry[field] as string).length === 0) ||
      entry.action !== "reject" || entry.prior_review_status !== "accepted" ||
      entry.expected_review_status !== "rejected" ||
      entry.graph_disposition !== "retire_accepted_semantic_edge_preserve_baseline_provenance" ||
      !["basis", "limits", "basis+limits"].includes(entry.denial_field as string) ||
      !Number.isInteger(entry.ordinal) || (entry.ordinal as number) < 0 ||
      typeof entry.prior_full_match_sha256 !== "string" || !SHA256.test(entry.prior_full_match_sha256) ||
      typeof entry.expected_final_full_match_sha256 !== "string" || !SHA256.test(entry.expected_final_full_match_sha256) ||
      typeof entry.prior_final_pointer_sha256 !== "string" || !SHA256.test(entry.prior_final_pointer_sha256) ||
      typeof entry.expected_final_pointer_sha256 !== "string" || !SHA256.test(entry.expected_final_pointer_sha256) ||
      typeof entry.superseded_adjudication_sha256 !== "string" || !SHA256.test(entry.superseded_adjudication_sha256) ||
      !Array.isArray(entry.replacement_target_keys) || entry.replacement_target_keys.length !== 0 ||
      typeof entry.rationale !== "string" || entry.rationale !== entry.rationale.trim() ||
      entry.rationale.length < 40 || entry.rationale.length > 500 || /[\r\n]/u.test(entry.rationale) ||
      !/^rel_[a-z0-9-]+_\d{4}$/u.test(entry.relation_id as string) ||
      entry.target_key !== `record:relation:${entry.relation_id}` ||
      !/^wiki\/relations\/[a-z0-9-]+\.md$/u.test(entry.ledger_path as string) ||
      !/^claim_[a-z0-9-]+_\d{4}$/u.test(entry.claim_a as string) ||
      !/^claim_[a-z0-9-]+_\d{4}$/u.test(entry.claim_b as string)) {
      throw new Error(`${location}: entry ${index + 1} is malformed`);
    }
    return entry as unknown as OntologyAuditRelationFictionReviewEntry;
  });
  const targetKeys = entries.map((entry) => entry.target_key);
  if (new Set(targetKeys).size !== targetKeys.length ||
    canonicalJson(targetKeys) !== canonicalJson([...targetKeys].sort()) ||
    canonicalJson(targetKeys) !== canonicalJson(RELATION_FICTION_TARGET_KEYS)) {
    throw new Error(`${location}: relation-fiction target set must be the exact exhaustive three-record set`);
  }
  return { ...record, entries } as unknown as OntologyAuditRelationFictionReviewEvidence;
}

function receiptReviewedRelationIds(content: string, location: string) {
  const lines = content.split(/\r?\n/u);
  const starts = lines.map((line, index) => line === "reviewed_relation_ids:" ? index : -1)
    .filter((index) => index >= 0);
  if (starts.length !== 1) throw new Error(`${location}: receipt must contain one reviewed_relation_ids block`);
  const result: string[] = [];
  for (const line of lines.slice(starts[0]! + 1)) {
    if (!line.startsWith("- ")) break;
    result.push(line.slice(2));
  }
  if (result.length !== 3 || new Set(result).size !== result.length ||
    result.some((id) => !/^rel_[a-z0-9-]+_\d{4}$/u.test(id))) {
    throw new Error(`${location}: reviewed_relation_ids must name the exact three unique relation IDs`);
  }
  return result;
}

function receiptRelationDecisionRows(content: string, location: string) {
  const rows = content.split(/\r?\n/u).flatMap((line) => {
    const match = /^- (rel_[a-z0-9-]+_\d{4}) \| endpoints: (claim_[a-z0-9-]+_\d{4}) -> (claim_[a-z0-9-]+_\d{4}) \| rule: ([a-z0-9_]+) \| outcome: rejected \| reason: (.+)$/u.exec(line);
    return match
      ? [{ relationId: match[1]!, claimA: match[2]!, claimB: match[3]!, denialRule: match[4]!, rationale: match[5]! }]
      : [];
  });
  if (rows.length !== 3 || new Set(rows.map((row) => row.relationId)).size !== rows.length) {
    throw new Error(`${location}: receipt must contain exactly three canonical relation decision rows`);
  }
  return rows;
}

export function readOntologyAuditRelationFictionReviewEvidence({ repoRoot, packagePath }: {
  repoRoot: string;
  packagePath: string;
}): OntologyAuditRelationFictionReviewArtifact | null {
  const evidenceDirectory = join(packagePath, "review-inputs/final-adjustment-evidence");
  if (!existsSync(evidenceDirectory)) return null;
  const candidates = readdirSync(evidenceDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && RELATION_FICTION_EVIDENCE_ARTIFACT.test(entry.name));
  if (candidates.length === 0) return null;
  if (candidates.length !== 1) {
    throw new Error(`Expected one relation-fiction review evidence artifact, found ${candidates.length}`);
  }
  const evidenceAbsolute = join(evidenceDirectory, candidates[0]!.name);
  const evidencePath = relative(repoRoot, evidenceAbsolute).split("\\").join("/");
  if (repositoryArtifactPath(repoRoot, evidencePath) !== evidenceAbsolute) {
    throw new Error(`${evidencePath}: relation-fiction evidence is missing or path-aliased`);
  }
  const content = readFileSync(evidenceAbsolute, "utf8");
  const digest = sha256(content);
  if (RELATION_FICTION_EVIDENCE_ARTIFACT.exec(candidates[0]!.name)?.[1] !== digest) {
    throw new Error(`${evidencePath}: content hash does not match its content-addressed filename`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`${evidencePath}: malformed JSON (${error instanceof Error ? error.message : String(error)})`);
  }
  const evidence = parseRelationFictionReviewEvidence(parsed, evidencePath);
  if (renderOntologyAuditRelationFictionReviewEvidence(evidence) !== content) {
    throw new Error(`${evidencePath}: relation-fiction evidence is not canonical JSON`);
  }
  const entries = new Map<string, OntologyAuditRelationFictionReviewEntry>();
  for (const entry of evidence.entries) {
    const ledgerAbsolute = repositoryArtifactPath(repoRoot, entry.ledger_path);
    if (!ledgerAbsolute) throw new Error(`${entry.target_key}: canonical relation ledger is missing or path-aliased`);
    const blocks = fencedYamlRecordBlocks(readFileSync(ledgerAbsolute, "utf8"));
    const matches = blocks.filter((block) => block.record.relation_id === entry.relation_id);
    if (matches.length !== 1 || matches[0]!.index !== entry.ordinal) {
      throw new Error(`${entry.target_key}: current ledger must contain exactly one relation at the recorded ordinal`);
    }
    const block = matches[0]!;
    const identityFields = ["claim_a", "claim_b", "relation_kind", "resolution"] as const;
    if (identityFields.some((field) => block.record[field] !== entry[field]) ||
      block.record.review_status !== "rejected" || sha256(block.fullMatch) !== entry.expected_final_full_match_sha256) {
      throw new Error(`${entry.target_key}: current rejected relation identity or exact bytes differ from reviewed evidence`);
    }
    const statusLines = [...block.fullMatch.matchAll(/^review_status: rejected$/gmu)];
    if (statusLines.length !== 1) {
      throw new Error(`${entry.target_key}: current relation must contain one exact rejected status line`);
    }
    const priorFullMatch = block.fullMatch.replace(/^review_status: rejected$/mu, "review_status: accepted");
    if (sha256(priorFullMatch) !== entry.prior_full_match_sha256) {
      throw new Error(`${entry.target_key}: reconstructed accepted relation bytes differ from reviewed prior evidence`);
    }
    const priorBlocks = fencedYamlRecordBlocks(`${priorFullMatch}\n`);
    if (priorBlocks.length !== 1 || priorBlocks[0]!.record.review_status !== "accepted") {
      throw new Error(`${entry.target_key}: reconstructed prior relation is not one strict accepted YAML record`);
    }
    const denial = acceptedRelationDenial(priorBlocks[0]!.content);
    if (!denial || denial.field !== entry.denial_field || denial.rule !== entry.denial_rule) {
      throw new Error(`${entry.target_key}: typed semantic-denial replay differs from the recorded rule`);
    }
    const expectedFinalPointer = {
      path: entry.ledger_path,
      ordinal: entry.ordinal,
      canonical_sha256: entry.expected_final_full_match_sha256,
      review_status: "rejected",
    };
    if (ontologyAuditFinalPointerSha256(expectedFinalPointer) !== entry.expected_final_pointer_sha256) {
      throw new Error(`${entry.target_key}: expected final pointer hash does not replay from the current rejected bytes`);
    }
    entries.set(entry.target_key, entry);
  }

  const receiptAbsolute = repositoryArtifactPath(repoRoot, ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT);
  if (!receiptAbsolute) throw new Error(`Missing relation-fiction review receipt ${ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT}`);
  const receipt = readFileSync(receiptAbsolute, "utf8");
  if (!receipt.startsWith("# Relation semantic-edge rejection review\n\n") ||
    receiptScalar(receipt, "reviewer", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== RELATION_FICTION_REVIEWER ||
    receiptScalar(receipt, "reviewed_on", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "2026-09-01" ||
    receiptScalar(receipt, "review_transition", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "accepted -> rejected" ||
    receiptScalar(receipt, "record_outcome", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "rejected; provenance retained" ||
    receiptScalar(receipt, "graph_outcome", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "accepted semantic edge retired; baseline edge provenance retained" ||
    receiptScalar(receipt, "replacement_policy", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "no replacement targets" ||
    receiptScalar(receipt, "evidence_path", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== evidencePath ||
    receiptScalar(receipt, "evidence_sha256", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== digest ||
    receiptScalar(receipt, "validation_relation_ledgers", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "pass" ||
    receiptScalar(receipt, "validation_semantic_defects", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "0 accepted_relation_denial" ||
    receiptScalar(receipt, "validation_replay", ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT) !== "pass") {
    throw new Error(`${ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT}: receipt identity, outcome, evidence, or validation is invalid`);
  }
  const reviewedIds = receiptReviewedRelationIds(receipt, ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT);
  const expectedIds = evidence.entries.map((entry) => entry.relation_id);
  if (canonicalJson(reviewedIds) !== canonicalJson(expectedIds)) {
    throw new Error(`${ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT}: reviewed relation set differs from evidence`);
  }
  const decisionRows = receiptRelationDecisionRows(receipt, ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT);
  for (const [index, entry] of evidence.entries.entries()) {
    const row = decisionRows[index];
    if (!row || row.relationId !== entry.relation_id || row.claimA !== entry.claim_a || row.claimB !== entry.claim_b ||
      row.denialRule !== entry.denial_rule || row.rationale !== entry.rationale) {
      throw new Error(`${ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT}: decision row ${index + 1} differs from evidence`);
    }
  }
  if (canonicalJson(receiptArtifactBindings(receipt, ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT)) !==
    canonicalJson([{ path: evidencePath, sha256: digest }])) {
    throw new Error(`${ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT}: artifact binding differs from exact review evidence`);
  }
  return {
    artifact: { path: evidencePath, sha256: digest },
    receiptPath: ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT,
    entries,
  };
}

export function verifyOntologyAuditRelationFictionFinalAdjustments(
  repoRoot: string,
  packagePath: string,
  decisions: readonly OntologyAuditFinalAdjustment[],
  priorState: OntologyAuditFinalAdjustmentPriorState,
) {
  const relationStages = provenanceStages(decisions, "relation_semantic_fiction");
  const evidence = readOntologyAuditRelationFictionReviewEvidence({ repoRoot, packagePath });
  if (!evidence) {
    if (relationStages.length > 0) throw new Error("Relation-fiction final adjustments lack canonical replay evidence");
    return;
  }
  const expectedTargets = [...evidence.entries.values()].flatMap((entry) => [
    entry.target_key,
    `edge:relation:${entry.relation_id}`,
  ]).sort();
  if (canonicalJson(relationStages.map(({ decision }) => decision.target_key).sort()) !==
    canonicalJson(expectedTargets)) {
    throw new Error("Relation-fiction review evidence target set differs from final-adjustment decisions");
  }
  const priorTargets = new Map(priorState.targets.map((target) => [target.target_key, target]));
  for (const { decision, stage, index } of relationStages) {
    const recordTargetKey = decision.target_key.startsWith("edge:relation:")
      ? `record:relation:${decision.target_key.slice("edge:relation:".length)}`
      : decision.target_key;
    const entry = evidence.entries.get(recordTargetKey)!;
    const priorTarget = priorTargets.get(decision.target_key);
    const priorFinal = priorTarget?.prior_final as Record<string, unknown> | null | undefined;
    const sharedInvalid = index !== 0 || decision.provenance_chain.length !== 1 ||
      stage.source_receipt_path !== evidence.receiptPath ||
      canonicalJson(stage.evidence_artifacts) !== canonicalJson([evidence.artifact]) ||
      decision.superseded_adjudication_sha256 === null || !priorFinal;
    if (decision.target_key.startsWith("record:relation:")) {
      if (sharedInvalid || decision.action !== "reject" || stage.action !== "reject" ||
        decision.rationale !== entry.rationale || priorFinal.path !== entry.ledger_path ||
        priorFinal.ordinal !== entry.ordinal || priorFinal.canonical_sha256 !== entry.prior_full_match_sha256 ||
        ontologyAuditFinalPointerSha256(priorFinal) !== entry.prior_final_pointer_sha256 ||
        ontologyAuditAdjudicationSha256(priorTarget?.superseded_adjudication ?? null) !== entry.superseded_adjudication_sha256 ||
        (priorFinal.review_status !== undefined && priorFinal.review_status !== "accepted") ||
        stage.prior_final_pointer_sha256 !== entry.prior_final_pointer_sha256 ||
        stage.expected_final_pointer_sha256 !== entry.expected_final_pointer_sha256 ||
        decision.prior_final_pointer_sha256 !== entry.prior_final_pointer_sha256 ||
        decision.expected_final_pointer_sha256 !== entry.expected_final_pointer_sha256 ||
        decision.superseded_adjudication_sha256 !== entry.superseded_adjudication_sha256) {
        throw new Error(`${decision.target_key}: final adjustment does not bind the exact accepted-to-rejected relation record`);
      }
      continue;
    }
    const priorPointerSha256 = ontologyAuditFinalPointerSha256(priorFinal);
    if (sharedInvalid || decision.target_key !== `edge:relation:${entry.relation_id}` ||
      decision.action !== "retire" || stage.action !== "retire" ||
      decision.rationale !== ontologyAuditRelationFictionEdgeRationale(entry) ||
      priorFinal.path !== entry.ledger_path ||
      (priorFinal.review_status !== undefined && priorFinal.review_status !== null) ||
      stage.prior_final_pointer_sha256 !== priorPointerSha256 ||
      decision.prior_final_pointer_sha256 !== priorPointerSha256 ||
      stage.expected_final_pointer_sha256 !== null || decision.expected_final_pointer_sha256 !== null ||
      ontologyAuditAdjudicationSha256(priorTarget?.superseded_adjudication ?? null) !==
        decision.superseded_adjudication_sha256) {
      throw new Error(`${decision.target_key}: final adjustment does not bind retirement of the rejected relation's accepted semantic edge`);
    }
  }
}

export function renderOntologyAuditFinalAdjustments(decisions: readonly OntologyAuditFinalAdjustment[]) {
  const sorted = [...decisions].sort((left, right) => left.target_key.localeCompare(right.target_key));
  const seen = new Set<string>();
  const valid = sorted.map((decision, index) => validateDecision(decision, `final adjustment ${index + 1}`));
  for (const decision of valid) {
    if (seen.has(decision.target_key)) throw new Error(`Duplicate final adjustment target ${decision.target_key}`);
    seen.add(decision.target_key);
  }
  if (valid.length === 0) throw new Error("Final adjustment artifact must contain at least one decision");
  return `${valid.map(canonicalJson).join("\n")}\n`;
}

export function ontologyAuditFinalAdjustmentArtifactName(content: string) {
  return `sha256-${sha256(content)}-decisions.jsonl`;
}

export function renderOntologyAuditFinalAdjustmentPriorState(state: OntologyAuditFinalAdjustmentPriorState) {
  if (state.schema_version !== 1) throw new Error("Final-adjustment prior state schema_version must be 1");
  if (typeof state.acceptance.path !== "string" || !state.acceptance.path.endsWith("/acceptance.json") ||
    !REPO_ARTIFACT.test(state.acceptance.path) ||
    state.acceptance.path.split("/").some((segment) => segment.length === 0 || segment === "." || segment === "..") ||
    !SHA256.test(state.acceptance.sha256) || sha256(state.acceptance.text) !== state.acceptance.sha256) {
    throw new Error("Final-adjustment prior state must embed the exact accepted acceptance.json bytes");
  }
  let acceptance: { state?: unknown; partitions?: Record<string, { sha256?: unknown }> };
  try {
    acceptance = JSON.parse(state.acceptance.text) as typeof acceptance;
  } catch (error) {
    throw new Error(`Final-adjustment prior acceptance is malformed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (acceptance.state !== "accepted") throw new Error("Final-adjustment prior state must bind an accepted package");
  const partitions = state.partitions.map((entry, index) => validatePriorPartitionBinding(entry, `prior state partitions[${index}]`));
  const expectedSourcePaths = PRIOR_PARTITION_FILES.map((file) => state.acceptance.path.replace(/acceptance\.json$/u, file)).sort();
  if (partitions.length !== expectedSourcePaths.length || partitions.map((entry) => entry.source_path).some((path, index) => path !== expectedSourcePaths[index])) {
    throw new Error("Final-adjustment prior state must bind the accepted record, graph, and adjudication partitions in sorted order");
  }
  for (const partition of partitions) {
    const file = basename(partition.source_path);
    if (acceptance.partitions?.[file]?.sha256 !== partition.uncompressed_sha256) {
      throw new Error(`Final-adjustment prior partition ${file} does not match embedded acceptance.json`);
    }
  }
  const targets = [...state.targets].sort((left, right) => left.target_key.localeCompare(right.target_key));
  if (targets.length === 0 || targets.some((target, index) => target.target_key !== state.targets[index]?.target_key)) {
    throw new Error("Final-adjustment prior targets must be non-empty and sorted by target_key");
  }
  const seen = new Set<string>();
  for (const [index, target] of targets.entries()) {
    if (target === null || typeof target !== "object" || Array.isArray(target)) throw new Error(`prior target ${index + 1} must be an object`);
    exactKeys(target as unknown as Record<string, unknown>, ["prior_final", "superseded_adjudication", "target_key"], `prior target ${index + 1}`);
    if (!TARGET.test(target.target_key) || seen.has(target.target_key)) throw new Error(`prior target ${index + 1} has an invalid or duplicate target_key`);
    seen.add(target.target_key);
  }
  return `${canonicalJson({ schema_version: 1, acceptance: state.acceptance, partitions, targets })}\n`;
}

export function ontologyAuditFinalAdjustmentPriorStateArtifactName(content: string) {
  return `sha256-${sha256(content)}-prior-state.json`;
}

function requiredReceiptBindings({
  repoRoot,
  artifactPath,
  artifactSha256,
  priorStateArtifactPath,
  priorStateSha256,
  priorState,
  decisions,
}: {
  repoRoot: string;
  artifactPath: string;
  artifactSha256: string;
  priorStateArtifactPath: string;
  priorStateSha256: string;
  priorState: OntologyAuditFinalAdjustmentPriorState;
  decisions: readonly OntologyAuditFinalAdjustment[];
}) {
  const bindings = new Map<string, string>([
    [relative(repoRoot, artifactPath).split("\\").join("/"), artifactSha256],
    [relative(repoRoot, priorStateArtifactPath).split("\\").join("/"), priorStateSha256],
  ]);
  for (const partition of priorState.partitions) bindings.set(partition.path, partition.sha256);
  for (const decision of decisions) {
    for (const stage of decision.provenance_chain) {
      const sourceReceipt = repositoryArtifactPath(repoRoot, stage.source_receipt_path);
      if (!sourceReceipt || !existsSync(sourceReceipt)) throw new Error(`Missing source receipt ${stage.source_receipt_path}`);
      const sourceDigest = sha256(readFileSync(sourceReceipt));
      const priorSourceDigest = bindings.get(stage.source_receipt_path);
      if (priorSourceDigest && priorSourceDigest !== sourceDigest) {
        throw new Error(`Conflicting source receipt binding ${stage.source_receipt_path}`);
      }
      bindings.set(stage.source_receipt_path, sourceDigest);
      for (const binding of stage.evidence_artifacts) {
        const previous = bindings.get(binding.path);
        if (previous && previous !== binding.sha256) throw new Error(`Conflicting source artifact binding ${binding.path}`);
        bindings.set(binding.path, binding.sha256);
      }
    }
  }
  return new Map([...bindings].sort(([left], [right]) => left.localeCompare(right)));
}

export function renderOntologyAuditFinalAdjustmentReceipt({
  artifactPath,
  artifactSha256,
  priorStateArtifactPath,
  priorStateSha256,
  decisions,
  bindings,
}: {
  artifactPath: string;
  artifactSha256: string;
  priorStateArtifactPath: string;
  priorStateSha256: string;
  decisions: readonly OntologyAuditFinalAdjustment[];
  bindings: ReadonlyMap<string, string>;
}) {
  return [
    "# Ontology vNext final-adjustment receipt",
    "",
    `- terminal record/edge adjustments: ${decisions.length}`,
    `- decision artifact: \`${artifactPath}\`; sha256: \`${artifactSha256}\``,
    `- superseded accepted state: \`${priorStateArtifactPath}\`; sha256: \`${priorStateSha256}\``,
    "- provenance policy: every underlying review receipt, canonical submission, and durable reviewed-evidence artifact is hash-bound below; scratch output is not provenance",
    ...[...bindings].map(([path, digest]) => `- artifact: \`${path}\`; sha256: \`${digest}\``),
    "",
  ].join("\n");
}

function parsePriorState(content: string, location: string): OntologyAuditFinalAdjustmentPriorState {
  let value: unknown;
  try {
    value = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`${location}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location}: prior state must be an object`);
  const record = value as Record<string, unknown>;
  exactKeys(record, ["acceptance", "partitions", "schema_version", "targets"], location);
  return value as OntologyAuditFinalAdjustmentPriorState;
}

export function verifyPreservedPriorPartitions({
  repoRoot,
  priorState,
}: {
  repoRoot: string;
  priorState: OntologyAuditFinalAdjustmentPriorState;
}) {
  const priorTargets = new Map(priorState.targets.map((target) => [target.target_key, target]));
  for (const partition of priorState.partitions) {
    const absolute = repositoryArtifactPath(repoRoot, partition.path);
    if (!absolute || !existsSync(absolute)) throw new Error(`Missing preserved prior partition ${partition.path}`);
    const compressed = readFileSync(absolute);
    if (sha256(compressed) !== partition.sha256 || PRIOR_PARTITION_ARTIFACT.exec(basename(partition.path))?.[1] !== partition.sha256) {
      throw new Error(`Preserved prior partition is not bound to its compressed bytes: ${partition.path}`);
    }
    let uncompressed: Buffer;
    try {
      uncompressed = gunzipSync(compressed);
    } catch (error) {
      throw new Error(`Preserved prior partition is not valid gzip: ${partition.path} (${error instanceof Error ? error.message : String(error)})`);
    }
    if (sha256(uncompressed) !== partition.uncompressed_sha256) {
      throw new Error(`Preserved prior partition does not match accepted uncompressed hash: ${partition.path}`);
    }
    const file = basename(partition.source_path);
    const relevantTargets = [...priorTargets.values()].filter((target) =>
      file === "adjudications.jsonl" ||
      (file === "record-units.jsonl" && target.target_key.startsWith("record:")) ||
      (file === "graph-units.jsonl" && target.target_key.startsWith("edge:"))
    );
    const rowsByTarget = new Map<string, unknown[]>();
    for (const [index, line] of uncompressed.toString("utf8").split(/\r?\n/u).filter(Boolean).entries()) {
      let row: Record<string, unknown>;
      try {
        row = JSON.parse(line) as Record<string, unknown>;
      } catch (error) {
        throw new Error(`${partition.path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
      const key = file === "adjudications.jsonl" ? row.target_key : row.key;
      if (typeof key !== "string" || !priorTargets.has(key)) continue;
      const entries = rowsByTarget.get(key) ?? [];
      entries.push(row);
      rowsByTarget.set(key, entries);
    }
    for (const target of relevantTargets) {
      const rows = rowsByTarget.get(target.target_key) ?? [];
      const expected = file === "adjudications.jsonl" ? target.superseded_adjudication : target.prior_final;
      if (expected === null) {
        if (rows.length !== 0) throw new Error(`${partition.path}: ${target.target_key} should be absent from the preserved prior partition`);
        continue;
      }
      if (rows.length !== 1) throw new Error(`${partition.path}: ${target.target_key} must occur exactly once in the preserved prior partition`);
      const actual = file === "adjudications.jsonl"
        ? rows[0]
        : (rows[0] as Record<string, unknown>).final;
      if (canonicalJson(actual) !== canonicalJson(expected)) {
        throw new Error(`${partition.path}: preserved row does not prove exact prior value for ${target.target_key}`);
      }
    }
  }
}

function verifyStructuralReviewEvidence(
  repoRoot: string,
  decisions: readonly OntologyAuditFinalAdjustment[],
) {
  const structuralStages = provenanceStages(decisions, "commentary_structural_review");
  if (structuralStages.length === 0) return;
  const evidenceBindings = new Map<string, string>();
  for (const { stage } of structuralStages) {
    for (const binding of stage.evidence_artifacts) {
      if (!STRUCTURAL_EVIDENCE_ARTIFACT.test(basename(binding.path))) continue;
      const previous = evidenceBindings.get(binding.path);
      if (previous && previous !== binding.sha256) throw new Error(`Conflicting structural evidence hash ${binding.path}`);
      evidenceBindings.set(binding.path, binding.sha256);
    }
  }
  if (evidenceBindings.size !== 1) {
    throw new Error("Structural final adjustments must all bind one canonical full-audit evidence JSONL artifact");
  }
  const [evidencePath, evidenceSha256] = [...evidenceBindings][0]!;
  const absoluteEvidence = repositoryArtifactPath(repoRoot, evidencePath);
  if (!absoluteEvidence || !existsSync(absoluteEvidence) || sha256(readFileSync(absoluteEvidence)) !== evidenceSha256 ||
    STRUCTURAL_EVIDENCE_ARTIFACT.exec(basename(evidencePath))?.[1] !== evidenceSha256) {
    throw new Error(`Structural full-audit evidence is missing or not content-addressed: ${evidencePath}`);
  }
  const evidenceByCommentaryId = new Map<string, {
    submission: OntologyAuditArtifactBinding;
    receipt: OntologyAuditArtifactBinding;
    submissionValue: Record<string, unknown>;
  }>();
  const structuralTransitions = new Map<string, {
    dialogue: string;
    targetPath: string;
    before: string;
    after: string;
  }>();
  const lines = readFileSync(absoluteEvidence, "utf8").split(/\r?\n/u).filter(Boolean);
  for (const [index, line] of lines.entries()) {
    let raw: unknown;
    try {
      raw = JSON.parse(line) as unknown;
    } catch (error) {
      throw new Error(`${evidencePath}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`${evidencePath}:${index + 1}: row must be an object`);
    const row = raw as Record<string, unknown>;
    exactKeys(
      row,
      ["audit", "audit_output", "commentary_ids", "dialogue", "receipt", "schema_version", "section_id", "submission", "unit_key"],
      `${evidencePath}:${index + 1}`,
    );
    if (row.schema_version !== 1 || typeof row.dialogue !== "string" ||
      typeof row.unit_key !== "string" || typeof row.section_id !== "string" || !Array.isArray(row.commentary_ids)) {
      throw new Error(`${evidencePath}:${index + 1}: structural evidence row is not canonical or well-formed`);
    }
    if (line !== canonicalStructuralEvidenceRow(row)) {
      throw new Error(`${evidencePath}:${index + 1}: structural evidence row is not canonical or well-formed`);
    }
    const submission = validateArtifactBinding(row.submission, `${evidencePath}:${index + 1}: submission`);
    const receipt = validateArtifactBinding(row.receipt, `${evidencePath}:${index + 1}: receipt`);
    if (row.audit_output === null || typeof row.audit_output !== "object" || Array.isArray(row.audit_output)) {
      throw new Error(`${evidencePath}:${index + 1}: audit_output must be an exact path/hash object`);
    }
    const auditOutputRecord = row.audit_output as Record<string, unknown>;
    exactKeys(auditOutputRecord, ["path", "sha256"], `${evidencePath}:${index + 1}: audit_output`);
    if (typeof auditOutputRecord.path !== "string" || typeof auditOutputRecord.sha256 !== "string" || !SHA256.test(auditOutputRecord.sha256)) {
      throw new Error(`${evidencePath}:${index + 1}: audit_output path/hash is malformed`);
    }
    const auditOutput = { path: auditOutputRecord.path, sha256: auditOutputRecord.sha256 };
    const absoluteSubmission = repositoryArtifactPath(repoRoot, submission.path);
    const absoluteReceipt = repositoryArtifactPath(repoRoot, receipt.path);
    if (!absoluteSubmission || !existsSync(absoluteSubmission) || sha256(readFileSync(absoluteSubmission)) !== submission.sha256 ||
      !absoluteReceipt || !existsSync(absoluteReceipt) || sha256(readFileSync(absoluteReceipt)) !== receipt.sha256) {
      throw new Error(`${evidencePath}:${index + 1}: canonical submission or receipt is missing or hash-mismatched`);
    }
    const audit = verifyOntologyAuditStructuralReviewReplay(
      row.audit,
      auditOutput.sha256,
      `${evidencePath}:${index + 1}`,
    );
    if (audit.dialogue !== row.dialogue || audit.unit_key !== row.unit_key || audit.section_id !== row.section_id) {
      throw new Error(`${evidencePath}:${index + 1}: embedded complete audit identity mismatch`);
    }
    const submissionValue = JSON.parse(readFileSync(absoluteSubmission, "utf8")) as Record<string, unknown>;
    const candidate = (submissionValue.submission as Record<string, unknown> | undefined)?.candidate as Record<string, unknown> | undefined;
    const units = candidate?.auditUnits;
    const matchingUnit = Array.isArray(units)
      ? units.find((entry) => (entry as Record<string, unknown>).unitKey === row.unit_key) as Record<string, unknown> | undefined
      : undefined;
    if (!matchingUnit || matchingUnit.auditOutputPath !== auditOutput.path || matchingUnit.auditOutputSha256 !== auditOutput.sha256) {
      throw new Error(`${evidencePath}:${index + 1}: embedded audit output binding differs from canonical submission`);
    }
    const operationIds = Array.isArray(matchingUnit.operations)
      ? matchingUnit.operations.map((entry) => (entry as Record<string, unknown>).commentaryId).sort()
      : [];
    const commentaryIds = row.commentary_ids.filter((id): id is string => typeof id === "string");
    if (commentaryIds.length !== row.commentary_ids.length || canonicalJson([...commentaryIds].sort()) !== canonicalJson(operationIds)) {
      throw new Error(`${evidencePath}:${index + 1}: commentary_ids differ from canonical submitted operations`);
    }
    for (const commentaryId of commentaryIds) {
      const block = audit.blocks.find((entry) => entry.commentary_id === commentaryId);
      if (!block || block.disposition === "pass" || evidenceByCommentaryId.has(commentaryId)) {
        throw new Error(`${evidencePath}:${index + 1}: ${commentaryId} lacks one unique full non-pass audit block`);
      }
      evidenceByCommentaryId.set(commentaryId, { submission, receipt, submissionValue });
    }
  }
  const decisionIds = structuralStages.map(({ decision }) => decision.target_key.split(":").at(-1)!).sort();
  if (canonicalJson([...evidenceByCommentaryId.keys()].sort()) !== canonicalJson(decisionIds)) {
    throw new Error("Structural full-audit evidence commentary ID set differs from final-adjustment decisions");
  }
  for (const { decision, stage, index } of structuralStages) {
    const id = decision.target_key.split(":").at(-1)!;
    const evidence = evidenceByCommentaryId.get(id)!;
    const expectedBindings = [
      { path: evidencePath, sha256: evidenceSha256 },
      evidence.submission,
    ].sort((left, right) => left.path.localeCompare(right.path));
    if (decision.action !== "reject" || stage.action !== "reject" ||
      index !== decision.provenance_chain.length - 1 ||
      canonicalJson(stage.evidence_artifacts) !== canonicalJson(expectedBindings) ||
      stage.source_receipt_path !== evidence.receipt.path) {
      throw new Error(`${decision.target_key}: decision does not bind its exact full audit, submission, and source receipt`);
    }
    const targetPath = evidence.submissionValue.target_path;
    const before = evidence.submissionValue.target_sha256_before;
    const after = evidence.submissionValue.target_sha256_after;
    const absoluteTarget = typeof targetPath === "string" ? repositoryArtifactPath(repoRoot, targetPath) : null;
    const receiptPath = repositoryArtifactPath(repoRoot, evidence.receipt.path);
    const receipt = receiptPath ? readFileSync(receiptPath, "utf8") : "";
    if (!absoluteTarget || typeof before !== "string" || !SHA256.test(before) ||
      typeof after !== "string" || !SHA256.test(after) ||
      receiptScalar(receipt, "ledger_path", evidence.receipt.path) !== targetPath ||
      receiptScalar(receipt, "ledger_sha256_before", evidence.receipt.path) !== before ||
      receiptScalar(receipt, "ledger_sha256_after", evidence.receipt.path) !== after) {
      throw new Error(`${decision.target_key}: structural submission/receipt does not bind the exact ledger transition`);
    }
    const dialogue = /^wiki\/commentary\/([a-z0-9-]+)\.md$/u.exec(targetPath)?.[1];
    const priorTransition = structuralTransitions.get(evidence.receipt.path);
    if (!dialogue || (priorTransition && (priorTransition.dialogue !== dialogue ||
      priorTransition.targetPath !== targetPath || priorTransition.before !== before || priorTransition.after !== after))) {
      throw new Error(`${decision.target_key}: structural receipt is bound to conflicting ledger transitions`);
    }
    structuralTransitions.set(evidence.receipt.path, { dialogue, targetPath, before, after });
    if (index > 0) {
      const previous = decision.provenance_chain[index - 1]!;
      const previousReceiptPath = repositoryArtifactPath(repoRoot, previous.source_receipt_path);
      const previousReceipt = previousReceiptPath ? readFileSync(previousReceiptPath, "utf8") : "";
      if (previous.kind !== "commentary_reconsideration" ||
        receiptScalar(previousReceipt, "ledger_path", previous.source_receipt_path) !== targetPath ||
        receiptScalar(previousReceipt, "ledger_sha256_after", previous.source_receipt_path) !== before) {
        throw new Error(`${decision.target_key}: structural stage does not continue the exact reconsideration ledger state`);
      }
    }
  }

  const sampleTransitions = new Map<string, { dialogue: string; before: string; after: string }>();
  for (const { stage } of provenanceStages(decisions, "commentary_sample_failure")) {
    if (sampleTransitions.has(stage.source_receipt_path)) continue;
    const absolute = repositoryArtifactPath(repoRoot, stage.source_receipt_path);
    const receipt = absolute ? readFileSync(absolute, "utf8") : "";
    const dialogue = receiptScalar(receipt, "dialogue", stage.source_receipt_path);
    const before = receiptScalar(receipt, "ledger_sha256_before", stage.source_receipt_path);
    const after = receiptScalar(receipt, "ledger_sha256_after", stage.source_receipt_path);
    if (!SHA256.test(before) || !SHA256.test(after)) {
      throw new Error(`${stage.source_receipt_path}: sample ledger transition hashes are malformed`);
    }
    sampleTransitions.set(stage.source_receipt_path, { dialogue, before, after });
  }
  const structuralByDialogue = new Map<string, Array<{ before: string; after: string }>>();
  for (const transition of structuralTransitions.values()) {
    const entries = structuralByDialogue.get(transition.dialogue) ?? [];
    entries.push({ before: transition.before, after: transition.after });
    structuralByDialogue.set(transition.dialogue, entries);
  }
  for (const [dialogue, structural] of structuralByDialogue) {
    const incoming = new Set(structural.map((entry) => entry.after));
    const starts = structural.filter((entry) => !incoming.has(entry.before));
    if (starts.length !== 1 || new Set(structural.map((entry) => entry.before)).size !== structural.length ||
      new Set(structural.map((entry) => entry.after)).size !== structural.length) {
      throw new Error(`${dialogue}: structural ledger transitions must form one unbranched sequence`);
    }
    let cursor = starts[0]!.before;
    for (let index = 0; index < structural.length; index += 1) {
      const next = structural.find((entry) => entry.before === cursor);
      if (!next) throw new Error(`${dialogue}: structural ledger transition sequence is incomplete`);
      cursor = next.after;
    }
    const laterSamples = [...sampleTransitions.values()].filter((entry) => entry.dialogue === dialogue);
    for (let index = 0; index < laterSamples.length; index += 1) {
      const matches = laterSamples.filter((entry) => entry.before === cursor);
      if (matches.length !== 1) throw new Error(`${dialogue}: later sample transition does not uniquely continue structural state`);
      cursor = matches[0]!.after;
    }
    const ledgerPath = `wiki/commentary/${dialogue}.md`;
    const ledgerAbsolute = repositoryArtifactPath(repoRoot, ledgerPath);
    if (!ledgerAbsolute || sha256(readFileSync(ledgerAbsolute)) !== cursor) {
      throw new Error(`${dialogue}: structural/sample chronology does not end at the current ledger`);
    }
  }
}

function receiptScalar(content: string, field: string, location: string) {
  const prefix = `${field}: `;
  const values = content.split(/\r?\n/u)
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length));
  if (values.length !== 1 || values[0]!.length === 0) {
    throw new Error(`${location}: receipt must contain exactly one ${field}`);
  }
  return values[0]!;
}

function receiptReviewedCommentaryIds(content: string, location: string) {
  const lines = content.split(/\r?\n/u);
  const starts = lines.map((line, index) => line === "reviewed_commentary_ids:" ? index : -1).filter((index) => index >= 0);
  if (starts.length !== 1) throw new Error(`${location}: receipt must contain one reviewed_commentary_ids block`);
  const result: string[] = [];
  for (const line of lines.slice(starts[0]! + 1)) {
    if (!line.startsWith("- ")) break;
    result.push(line.slice(2));
  }
  if (result.length === 0 || new Set(result).size !== result.length || result.some((id) => !/^comm_[a-z0-9-]+_\d{4}$/u.test(id))) {
    throw new Error(`${location}: reviewed_commentary_ids must be a non-empty unique commentary-ID list`);
  }
  return result;
}

function receiptArtifactBindings(content: string, location: string) {
  const bindings = content.split(/\r?\n/u).flatMap((line) => {
    const match = /^- artifact: `([^`]+)`; sha256: `([a-f0-9]{64})`$/u.exec(line);
    return match ? [{ path: match[1]!, sha256: match[2]! }] : [];
  });
  if (new Set(bindings.map((binding) => binding.path)).size !== bindings.length) {
    throw new Error(`${location}: receipt contains duplicate artifact bindings`);
  }
  return bindings.sort((left, right) => left.path.localeCompare(right.path));
}

function exactContentAddressedArtifact(
  repoRoot: string,
  binding: OntologyAuditArtifactBinding,
  expression: RegExp,
  location: string,
) {
  const match = expression.exec(basename(binding.path));
  const absolute = repositoryArtifactPath(repoRoot, binding.path);
  if (!match || match[1] !== binding.sha256 || !absolute || sha256(readFileSync(absolute)) !== binding.sha256) {
    throw new Error(`${location}: artifact is missing, aliased, hash-mismatched, or not content-addressed: ${binding.path}`);
  }
  return { absolute, match };
}

function reconsiderationTarget(decision: OntologyAuditFinalAdjustment) {
  const record = /^record:commentary:(comm_[a-z0-9-]+_\d{4})$/u.exec(decision.target_key);
  if (record) return { kind: "record" as const, commentaryId: record[1]! };
  const edge = /^edge:commentary-cites-(?:observation|claim|relation|dossier):(comm_[a-z0-9-]+_\d{4}):\d{4}:\S+$/u.exec(
    decision.target_key,
  );
  return edge ? { kind: "edge" as const, commentaryId: edge[1]! } : null;
}

function exactCommentaryBlock(
  content: string,
  commentaryId: string,
  location: string,
): FencedYamlRecordBlock {
  let blocks: FencedYamlRecordBlock[];
  try {
    blocks = fencedYamlRecordBlocks(content);
  } catch (error) {
    throw new Error(`${location}: cannot strictly parse fenced YAML (${error instanceof Error ? error.message : String(error)})`);
  }
  const matches = blocks.filter((block) => block.record.commentary_id === commentaryId);
  if (matches.length !== 1) {
    throw new Error(`${location}: must contain exactly one fenced YAML block for ${commentaryId}`);
  }
  return matches[0]!;
}

function reviewedCommentaryBlockBytes(block: FencedYamlRecordBlock, location: string) {
  if (block.record.review_status !== "rejected" && block.record.review_status !== "accepted") {
    throw new Error(`${location}: commentary block review_status must be rejected or accepted`);
  }
  const statusLines = [...block.fullMatch.matchAll(/^review_status: (?:rejected|accepted)$/gmu)];
  if (statusLines.length !== 1) {
    throw new Error(`${location}: commentary block must contain one exact review_status line`);
  }
  return block.fullMatch.replace(/^review_status: accepted$/mu, "review_status: rejected");
}

function commentaryStatusPointers(
  path: string,
  block: FencedYamlRecordBlock,
  location: string,
) {
  const rejectedBytes = reviewedCommentaryBlockBytes(block, location);
  const acceptedBytes = rejectedBytes.replace(/^review_status: rejected$/mu, "review_status: accepted");
  const pointer = (reviewStatus: "accepted" | "rejected", bytes: string) => ({
    path,
    ordinal: block.index,
    canonical_sha256: sha256(bytes),
    review_status: reviewStatus,
  });
  const accepted = pointer("accepted", acceptedBytes);
  const rejected = pointer("rejected", rejectedBytes);
  return {
    accepted,
    acceptedBytes,
    acceptedSha256: ontologyAuditFinalPointerSha256(accepted)!,
    rejected,
    rejectedBytes,
    rejectedSha256: ontologyAuditFinalPointerSha256(rejected)!,
  };
}

function exactStringList(value: unknown, location: string) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    throw new Error(`${location}: must be an array of non-empty string targets`);
  }
  return value as string[];
}

function exactReviewedCitationEdges(record: CanonicalYamlRecord, commentaryId: string, location: string) {
  const cites = record.cites;
  if (cites === null || typeof cites !== "object" || Array.isArray(cites)) {
    throw new Error(`${location}: commentary block cites must be a mapping`);
  }
  const citesRecord = cites as CanonicalYamlRecord;
  const citationKinds = [
    ["observations", "commentary-cites-observation"],
    ["claims", "commentary-cites-claim"],
    ["relations", "commentary-cites-relation"],
    ["dossiers", "commentary-cites-dossier"],
  ] as const;
  const targets = citationKinds.flatMap(([field, edgeKind]) =>
    exactStringList(citesRecord[field], `${location}: cites.${field}`).map((target) => ({ edgeKind, target }))
  );
  return new Set(targets.map(({ edgeKind, target }, index) =>
    `edge:${edgeKind}:${commentaryId}:${String(index).padStart(4, "0")}:${target}`
  ));
}

type ReconsiderationBundleOutcome = "terminal_pass" | "superseded_failed_attempt";
type ReconsiderationBundleEntry = {
  commentaryId: string;
  outcome: ReconsiderationBundleOutcome;
  attempt: number | null;
  sourcePath: string;
  sha256: string;
  content: string;
};

function canonicalJsonArtifact(path: string, location: string) {
  const bytes = readFileSync(path, "utf8");
  let value: unknown;
  try {
    value = JSON.parse(bytes) as unknown;
  } catch (error) {
    throw new Error(`${location}: malformed JSON (${error instanceof Error ? error.message : String(error)})`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value) || bytes !== `${JSON.stringify(value, null, 2)}\n`) {
    throw new Error(`${location}: must be one canonical pretty-printed JSON object`);
  }
  return value as Record<string, unknown>;
}

function bundleEntryKey(entry: ReconsiderationBundleEntry) {
  return `${entry.commentaryId}\n${entry.outcome}\n${entry.attempt ?? "terminal"}`;
}

function reconsiderationBundleEntries(
  bundle: Record<string, unknown>,
  field: "reviews" | "packets" | "schemas",
  dialogue: string,
  suffix: "result.json" | "packet.txt" | "schema.json",
  location: string,
) {
  exactKeys(
    bundle,
    field === "reviews"
      ? ["aggregate", "dialogue", "mode", "reviews", "schema_version"]
      : field === "packets"
      ? ["dialogue", "mode", "packets", "schema_version"]
      : ["dialogue", "mode", "schema_version", "schemas"],
    location,
  );
  if (bundle.schema_version !== 1 || bundle.mode !== "one-block-independent-reviews" ||
    bundle.dialogue !== dialogue || !Array.isArray(bundle[field]) || bundle[field].length === 0) {
    throw new Error(`${location}: invalid one-block independent-review bundle identity or entries`);
  }
  const entries = bundle[field].map((value, index): ReconsiderationBundleEntry => {
    const entryLocation = `${location}:${field}[${index}]`;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${entryLocation}: must be an object`);
    }
    const entry = value as Record<string, unknown>;
    exactKeys(entry, ["attempt", "commentary_id", "content", "outcome", "sha256", "source_path"], entryLocation);
    if (typeof entry.commentary_id !== "string" || !entry.commentary_id.startsWith(`comm_${dialogue}_`) ||
      (entry.outcome !== "terminal_pass" && entry.outcome !== "superseded_failed_attempt") ||
      typeof entry.sha256 !== "string" || !SHA256.test(entry.sha256) || typeof entry.content !== "string" ||
      sha256(entry.content) !== entry.sha256 || typeof entry.source_path !== "string") {
      throw new Error(`${entryLocation}: identity, embedded bytes, or hash is invalid`);
    }
    const attempt = entry.attempt;
    if ((entry.outcome === "terminal_pass" && attempt !== null) ||
      (entry.outcome === "superseded_failed_attempt" &&
        (!Number.isInteger(attempt) || typeof attempt !== "number" || attempt < 1 || attempt > 99))) {
      throw new Error(`${entryLocation}: terminal and superseded attempt states are contradictory`);
    }
    const normalizedAttempt = entry.outcome === "terminal_pass" ? null : attempt as number;
    const attemptSuffix = normalizedAttempt === null ? "" : `-attempt-${String(normalizedAttempt).padStart(2, "0")}`;
    const expectedPath = `scratch/commentary/reconsideration/${dialogue}-${entry.commentary_id}${attemptSuffix}-${suffix}`;
    if (entry.source_path !== expectedPath) {
      throw new Error(`${entryLocation}: source_path must identify the exact isolated scratch invocation artifact`);
    }
    return {
      commentaryId: entry.commentary_id,
      outcome: entry.outcome,
      attempt: normalizedAttempt,
      sourcePath: entry.source_path,
      sha256: entry.sha256,
      content: entry.content,
    };
  });
  if (new Set(entries.map(bundleEntryKey)).size !== entries.length) {
    throw new Error(`${location}: contains duplicate isolated review identities`);
  }
  return entries;
}

function validateIsolatedReviewOutput(
  entry: ReconsiderationBundleEntry,
  dialogue: string,
  location: string,
) {
  let value: unknown;
  try {
    value = JSON.parse(entry.content) as unknown;
  } catch (error) {
    throw new Error(`${location}: malformed isolated review JSON (${error instanceof Error ? error.message : String(error)})`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: isolated review output must be an object`);
  }
  const review = value as Record<string, unknown>;
  exactKeys(
    review,
    ["dialogue", "findings", "human_listening_or_review", "rationale", "reviewed_ids", "reviewer", "schema_version", "verdict"],
    location,
  );
  const expectedVerdict = entry.outcome === "terminal_pass" ? "pass" : "fail";
  if (review.schema_version !== 1 || review.dialogue !== dialogue ||
    typeof review.reviewer !== "string" ||
    !/^[a-z0-9][a-z0-9-]*-delegated-luna-reviewer-[a-z0-9][a-z0-9-]*$/u.test(review.reviewer) ||
    review.reviewer.length > 120 || review.human_listening_or_review !== "none claimed" ||
    review.verdict !== expectedVerdict || canonicalJson(review.reviewed_ids) !== canonicalJson([entry.commentaryId]) ||
    typeof review.rationale !== "string" || review.rationale.length < 40 || review.rationale.length > 300 ||
    !Array.isArray(review.findings) || review.findings.length !== 1) {
    throw new Error(`${location}: isolated review does not exactly ${expectedVerdict} its one bound target`);
  }
  const findingValue = review.findings[0];
  if (findingValue === null || typeof findingValue !== "object" || Array.isArray(findingValue)) {
    throw new Error(`${location}: isolated review finding must be an object`);
  }
  const finding = findingValue as Record<string, unknown>;
  exactKeys(finding, ["commentary_id", "rationale", "verdict"], `${location}:finding`);
  if (finding.commentary_id !== entry.commentaryId || finding.verdict !== expectedVerdict ||
    typeof finding.rationale !== "string" || finding.rationale.length < 20 || finding.rationale.length > 300) {
    throw new Error(`${location}: isolated review finding does not exactly ${expectedVerdict} its bound target`);
  }
  return review as Record<string, unknown> & {
    reviewer: string;
    findings: Array<Record<string, unknown>>;
  };
}

function stephanusOrdinal(value: string, location: string) {
  const match = /^(\d+)([a-e])$/u.exec(value);
  if (!match) throw new Error(`${location}: invalid Stephanus point ${value}`);
  return Number(match[1]) * 5 + "abcde".indexOf(match[2]!);
}

function exactGreekSpan(source: string, span: string, location: string) {
  const match = /^(\d+[a-e])(?:-(\d+[a-e]))?$/u.exec(span);
  if (!match) throw new Error(`${location}: invalid Stephanus span ${span}`);
  const start = match[1]!;
  const end = match[2] ?? start;
  const markers = [...source.matchAll(/\{(\d+[a-e])\}/gu)].map((entry) => ({ point: entry[1]!, index: entry.index }));
  const startMarker = markers.find((entry) => entry.point === start);
  if (!startMarker) throw new Error(`${location}: canonical Greek source lacks ${start}`);
  const endOrdinal = stephanusOrdinal(end, location);
  const nextMarker = markers.find((entry) => entry.index > startMarker.index && stephanusOrdinal(entry.point, location) > endOrdinal);
  return source.slice(startMarker.index, nextMarker?.index ?? source.length).trimEnd();
}

function exactIsolatedPacket(
  repoRoot: string,
  entry: ReconsiderationBundleEntry,
  dialogue: string,
  currentLedger: string,
  terminal: boolean,
  location: string,
) {
  const greekPath = repositoryArtifactPath(repoRoot, `raw/plato/greek/${dialogue}.txt`);
  if (!greekPath) throw new Error(`${location}: canonical Greek source is missing or path-aliased`);
  const greek = readFileSync(greekPath, "utf8");
  if (!entry.content.includes(`full_source_sha256=${sha256(greek)}`)) {
    throw new Error(`${location}: isolated packet does not bind the exact canonical Greek source hash`);
  }
  let packetBlocks: FencedYamlRecordBlock[];
  try {
    packetBlocks = fencedYamlRecordBlocks(entry.content);
  } catch (error) {
    throw new Error(`${location}: cannot strictly parse isolated packet (${error instanceof Error ? error.message : String(error)})`);
  }
  const commentaryBlocks = packetBlocks.filter((block) => block.record.commentary_id !== undefined);
  if (commentaryBlocks.length !== 1 || commentaryBlocks[0]!.record.commentary_id !== entry.commentaryId ||
    commentaryBlocks[0]!.record.review_status !== "rejected") {
    throw new Error(`${location}: isolated packet must contain one exact rejected target block`);
  }
  const packetBlock = commentaryBlocks[0]!;
  let acceptedPointerSha256: string | null = null;
  if (terminal) {
    const currentBlock = exactCommentaryBlock(currentLedger, entry.commentaryId, `wiki/commentary/${dialogue}.md`);
    if (packetBlock.fullMatch !== reviewedCommentaryBlockBytes(currentBlock, location)) {
      throw new Error(`${location}: terminal packet does not bind the exact rejected/current commentary bytes`);
    }
    const acceptedBytes = packetBlock.fullMatch.replace(/^review_status: rejected$/mu, "review_status: accepted");
    acceptedPointerSha256 = ontologyAuditFinalPointerSha256({
      path: `wiki/commentary/${dialogue}.md`,
      ordinal: currentBlock.index,
      canonical_sha256: sha256(acceptedBytes),
      review_status: "accepted",
    });
  }
  const span = packetBlock.record.stephanus_span;
  if (typeof span !== "string" || !entry.content.includes(
    `TARGET ${entry.commentaryId}; exact_stephanus_span=${span}\n${exactGreekSpan(greek, span, location)}`,
  )) {
    throw new Error(`${location}: isolated packet does not contain its exact canonical Greek target span`);
  }
  const cites = packetBlock.record.cites;
  if (cites === null || typeof cites !== "object" || Array.isArray(cites)) {
    throw new Error(`${location}: isolated packet commentary cites must be a mapping`);
  }
  const citationLanes = [
    ["observations", "observation_id", `wiki/observations/${dialogue}.md`],
    ["claims", "claim_id", `wiki/claims/${dialogue}.md`],
    ["relations", "relation_id", `wiki/relations/${dialogue}.md`],
  ] as const;
  const citedRecordKeys = new Set<string>();
  for (const [field, idField, ledgerPath] of citationLanes) {
    const ids = exactStringList((cites as CanonicalYamlRecord)[field], `${location}:cites.${field}`);
    if (ids.length === 0) continue;
    const canonicalPath = repositoryArtifactPath(repoRoot, ledgerPath);
    if (!canonicalPath) throw new Error(`${location}: cited canonical ledger ${ledgerPath} is missing`);
    const canonicalBytes = readFileSync(canonicalPath, "utf8");
    let canonicalBlocks: FencedYamlRecordBlock[];
    try {
      canonicalBlocks = fencedYamlRecordBlocks(canonicalBytes);
    } catch (error) {
      throw new Error(`${location}: cannot strictly parse ${ledgerPath} (${error instanceof Error ? error.message : String(error)})`);
    }
    for (const id of ids) {
      const packetMatches = packetBlocks.filter((block) => block.record[idField] === id);
      const canonicalMatches = canonicalBlocks.filter((block) => block.record[idField] === id);
      if (packetMatches.length !== 1 || canonicalMatches.length !== 1 ||
        packetMatches[0]!.fullMatch !== canonicalMatches[0]!.fullMatch ||
        canonicalMatches[0]!.record.review_status !== "accepted") {
        throw new Error(`${location}: cited ${id} is not one exact accepted canonical record in the packet`);
      }
      citedRecordKeys.add(`${idField}:${id}`);
    }
  }
  const packetCitationKeys = packetBlocks.flatMap((block) => ["observation_id", "claim_id", "relation_id"].flatMap((field) =>
    typeof block.record[field] === "string" ? [`${field}:${block.record[field]}`] : []
  ));
  if (canonicalJson([...packetCitationKeys].sort()) !== canonicalJson([...citedRecordKeys].sort())) {
    throw new Error(`${location}: packet citation records differ from the commentary citation lanes`);
  }
  return { record: packetBlock.record, acceptedPointerSha256 };
}

function validateIsolatedSchema(
  entry: ReconsiderationBundleEntry,
  review: Record<string, unknown>,
  dialogue: string,
  location: string,
) {
  let value: unknown;
  try {
    value = JSON.parse(entry.content) as unknown;
  } catch (error) {
    throw new Error(`${location}: malformed isolated output schema (${error instanceof Error ? error.message : String(error)})`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location}: isolated output schema must be an object`);
  }
  const properties = (value as Record<string, unknown>).properties;
  if (properties === null || typeof properties !== "object" || Array.isArray(properties)) {
    throw new Error(`${location}: isolated output schema lacks properties`);
  }
  const fields = properties as Record<string, Record<string, unknown>>;
  const reviewedIds = fields.reviewed_ids;
  const findings = fields.findings;
  const findingItem = findings?.items as Record<string, unknown> | undefined;
  const findingProperties = findingItem?.properties as Record<string, Record<string, unknown>> | undefined;
  if (fields.dialogue?.const !== dialogue || fields.reviewer?.const !== review.reviewer ||
    fields.human_listening_or_review?.const !== "none claimed" || fields.rationale?.maxLength !== 300 ||
    reviewedIds?.minItems !== 1 || reviewedIds.maxItems !== 1 ||
    (reviewedIds.items as Record<string, unknown> | undefined)?.const !== entry.commentaryId ||
    findings?.minItems !== 1 || findings.maxItems !== 1 ||
    findingProperties?.commentary_id?.const !== entry.commentaryId ||
    (findingProperties?.rationale as Record<string, unknown> | undefined)?.maxLength !== 300) {
    throw new Error(`${location}: isolated schema does not exactly bound reviewer, target, and output lengths`);
  }
}

export function verifyOntologyAuditReconsiderationReviewEvidence(
  repoRoot: string,
  decisions: readonly OntologyAuditFinalAdjustment[],
) {
  const reconsiderationStages = provenanceStages(decisions, "commentary_reconsideration");
  if (reconsiderationStages.length === 0) return;
  const byReceipt = new Map<string, OntologyAuditFinalAdjustmentStageEntry[]>();
  for (const entry of reconsiderationStages) {
    const { decision, stage } = entry;
    const receiptMatch = RECONSIDERATION_RECEIPT_ARTIFACT.exec(stage.source_receipt_path);
    const manifests = stage.evidence_artifacts.filter((binding) =>
      RECONSIDERATION_MANIFEST_ARTIFACT.test(basename(binding.path))
    );
    if (!receiptMatch || manifests.length !== 1) {
      throw new Error(`${decision.target_key}: reconsideration requires one canonical acceptance receipt and one evidence manifest`);
    }
    const bucket = byReceipt.get(stage.source_receipt_path) ?? [];
    bucket.push(entry);
    byReceipt.set(stage.source_receipt_path, bucket);
  }

  for (const [receiptPath, receiptStages] of byReceipt) {
    const receiptMatch = RECONSIDERATION_RECEIPT_ARTIFACT.exec(receiptPath)!;
    const dialogue = receiptMatch[2]!;
    const absoluteReceipt = repositoryArtifactPath(repoRoot, receiptPath);
    if (!absoluteReceipt) throw new Error(`${receiptPath}: reconsideration receipt is missing or path-aliased`);
    const receipt = readFileSync(absoluteReceipt, "utf8");
    if (!receipt.startsWith("# Commentary block reconsideration\n\n") ||
      receiptScalar(receipt, "dialogue", receiptPath) !== dialogue ||
      receiptScalar(receipt, "decision", receiptPath) !== "accepted" ||
      receiptScalar(receipt, "prior_review_status", receiptPath) !== "rejected" ||
      receiptScalar(receipt, "review_transition", receiptPath) !== "rejected -> accepted" ||
      receiptScalar(receipt, "ledger_path", receiptPath) !== `wiki/commentary/${dialogue}.md` ||
      receiptScalar(receipt, "human_listening_or_review", receiptPath) !== "none claimed") {
      throw new Error(`${receiptPath}: reconsideration receipt identity or accepted transition is invalid`);
    }
    const reviewer = receiptScalar(receipt, "reviewer", receiptPath);
    if (!/^[a-z0-9][a-z0-9-]*-delegated-luna-reviewer-[a-z0-9][a-z0-9-]*$/u.test(reviewer)) {
      throw new Error(`${receiptPath}: reconsideration reviewer is not an operator-delegated Luna reviewer`);
    }
    const reviewedIds = receiptReviewedCommentaryIds(receipt, receiptPath);
    if (reviewedIds.some((id) => !id.startsWith(`comm_${dialogue}_`))) {
      throw new Error(`${receiptPath}: reviewed commentary IDs do not match receipt dialogue ${dialogue}`);
    }
    const manifestPath = receiptScalar(receipt, "evidence_manifest_path", receiptPath);
    const manifestSha256 = receiptScalar(receipt, "evidence_manifest_sha256", receiptPath);
    if (!SHA256.test(manifestSha256)) throw new Error(`${receiptPath}: evidence manifest hash is malformed`);
    const manifestBinding = { path: manifestPath, sha256: manifestSha256 };
    const { absolute: absoluteManifest } = exactContentAddressedArtifact(
      repoRoot,
      manifestBinding,
      RECONSIDERATION_MANIFEST_ARTIFACT,
      receiptPath,
    );
    let manifestValue: unknown;
    try {
      manifestValue = JSON.parse(readFileSync(absoluteManifest, "utf8")) as unknown;
    } catch (error) {
      throw new Error(`${manifestPath}: malformed reconsideration evidence manifest (${error instanceof Error ? error.message : String(error)})`);
    }
    if (manifestValue === null || typeof manifestValue !== "object" || Array.isArray(manifestValue)) {
      throw new Error(`${manifestPath}: reconsideration evidence manifest must be an object`);
    }
    const manifest = manifestValue as Record<string, unknown>;
    exactKeys(manifest, ["artifacts", "schema_version"], manifestPath);
    if (manifest.schema_version !== 1 || !Array.isArray(manifest.artifacts) || manifest.artifacts.length !== 3) {
      throw new Error(`${manifestPath}: reconsideration evidence manifest must contain exactly three artifacts`);
    }
    const artifactKinds = ["review_output", "review_packet", "review_schema"] as const;
    const artifactBindings = manifest.artifacts.map((value, index) => {
      if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`${manifestPath}: artifact ${index + 1} must be an object`);
      }
      const artifact = value as Record<string, unknown>;
      exactKeys(artifact, ["kind", "path", "sha256"], `${manifestPath}:artifact ${index + 1}`);
      if (artifact.kind !== artifactKinds[index]) {
        throw new Error(`${manifestPath}: artifacts must be review_output, review_packet, review_schema in canonical order`);
      }
      return validateArtifactBinding(
        { path: artifact.path, sha256: artifact.sha256 },
        `${manifestPath}:artifact ${index + 1}`,
      );
    });
    const canonicalManifest = `${JSON.stringify({
      schema_version: 1,
      artifacts: manifest.artifacts,
    }, null, 2)}\n`;
    if (readFileSync(absoluteManifest, "utf8") !== canonicalManifest) {
      throw new Error(`${manifestPath}: reconsideration evidence manifest is not canonical JSON`);
    }
    const output = exactContentAddressedArtifact(
      repoRoot,
      artifactBindings[0]!,
      RECONSIDERATION_OUTPUT_ARTIFACT,
      manifestPath,
    );
    const packet = exactContentAddressedArtifact(
      repoRoot,
      artifactBindings[1]!,
      RECONSIDERATION_PACKET_ARTIFACT,
      manifestPath,
    );
    const schema = exactContentAddressedArtifact(
      repoRoot,
      artifactBindings[2]!,
      RECONSIDERATION_SCHEMA_ARTIFACT,
      manifestPath,
    );
    if (output.match[2] !== dialogue || packet.match[2] !== dialogue || schema.match[2] !== dialogue) {
      throw new Error(`${manifestPath}: review output, packet, or schema bundle dialogue differs from ${dialogue}`);
    }
    const outputBundle = canonicalJsonArtifact(output.absolute, `${manifestPath}:review_output_bundle`);
    const packetBundle = canonicalJsonArtifact(packet.absolute, `${manifestPath}:review_packet_bundle`);
    const schemaBundle = canonicalJsonArtifact(schema.absolute, `${manifestPath}:review_schema_bundle`);
    const outputEntries = reconsiderationBundleEntries(
      outputBundle,
      "reviews",
      dialogue,
      "result.json",
      `${manifestPath}:review_output_bundle`,
    );
    const packetEntries = reconsiderationBundleEntries(
      packetBundle,
      "packets",
      dialogue,
      "packet.txt",
      `${manifestPath}:review_packet_bundle`,
    );
    const schemaEntries = reconsiderationBundleEntries(
      schemaBundle,
      "schemas",
      dialogue,
      "schema.json",
      `${manifestPath}:review_schema_bundle`,
    );
    const expectedEntryKeys = reviewedIds.flatMap((id) => {
      const entries = outputEntries.filter((entry) => entry.commentaryId === id);
      const failed = entries.filter((entry) => entry.outcome === "superseded_failed_attempt");
      const terminal = entries.filter((entry) => entry.outcome === "terminal_pass");
      if (terminal.length !== 1 || canonicalJson(failed.map((entry) => entry.attempt)) !==
        canonicalJson(failed.map((_, index) => index + 1))) {
        throw new Error(`${manifestPath}: ${id} must have contiguous preserved failures followed by one terminal pass`);
      }
      return [...failed, terminal[0]!].map(bundleEntryKey);
    });
    if (canonicalJson(outputEntries.map(bundleEntryKey)) !== canonicalJson(expectedEntryKeys) ||
      canonicalJson(packetEntries.map(bundleEntryKey)) !== canonicalJson(expectedEntryKeys) ||
      canonicalJson(schemaEntries.map(bundleEntryKey)) !== canonicalJson(expectedEntryKeys)) {
      throw new Error(`${manifestPath}: output, packet, and schema bundles must align exactly and cover only receipt targets`);
    }
    const reviews = new Map(outputEntries.map((entry) => [
      bundleEntryKey(entry),
      validateIsolatedReviewOutput(entry, dialogue, `${manifestPath}:${entry.sourcePath}`),
    ]));
    const ledgerPath = `wiki/commentary/${dialogue}.md`;
    const absoluteLedger = repositoryArtifactPath(repoRoot, ledgerPath);
    if (!absoluteLedger) throw new Error(`${manifestPath}: canonical commentary ledger is missing or path-aliased`);
    const ledgerBytes = readFileSync(absoluteLedger, "utf8");
    const exactCitationEdges = new Map<string, ReadonlySet<string>>();
    const acceptedPointerSha256 = new Map<string, string>();
    for (const [index, packetEntry] of packetEntries.entries()) {
      const review = reviews.get(bundleEntryKey(packetEntry));
      const schemaEntry = schemaEntries[index]!;
      if (!review) throw new Error(`${manifestPath}: packet has no exact isolated review output`);
      validateIsolatedSchema(schemaEntry, review, dialogue, `${manifestPath}:${schemaEntry.sourcePath}`);
      const commentary = exactIsolatedPacket(
        repoRoot,
        packetEntry,
        dialogue,
        ledgerBytes,
        packetEntry.outcome === "terminal_pass",
        `${manifestPath}:${packetEntry.sourcePath}`,
      );
      if (packetEntry.outcome === "terminal_pass") {
        if (!commentary.acceptedPointerSha256) {
          throw new Error(`${manifestPath}: terminal packet did not reconstruct its accepted intermediate pointer`);
        }
        acceptedPointerSha256.set(packetEntry.commentaryId, commentary.acceptedPointerSha256);
        exactCitationEdges.set(
          packetEntry.commentaryId,
          exactReviewedCitationEdges(commentary.record, packetEntry.commentaryId, `${manifestPath}:${packetEntry.sourcePath}`),
        );
      }
    }
    const aggregateValue = outputBundle.aggregate;
    if (aggregateValue === null || typeof aggregateValue !== "object" || Array.isArray(aggregateValue)) {
      throw new Error(`${manifestPath}: review output bundle lacks its exact aggregate result`);
    }
    const review = aggregateValue as Record<string, unknown>;
    exactKeys(
      review,
      ["dialogue", "findings", "human_listening_or_review", "rationale", "reviewed_ids", "reviewer", "schema_version", "verdict"],
      `${manifestPath}:review_output_bundle:aggregate`,
    );
    const terminalFindings = reviewedIds.map((id) => {
      const entry = outputEntries.find((candidate) => candidate.commentaryId === id && candidate.outcome === "terminal_pass")!;
      return reviews.get(bundleEntryKey(entry))!.findings[0];
    });
    const receiptRationale = receiptScalar(receipt, "rationale", receiptPath);
    if (review.schema_version !== 1 || review.dialogue !== dialogue || review.reviewer !== reviewer ||
      review.human_listening_or_review !== "none claimed" || review.verdict !== "pass" ||
      canonicalJson(review.reviewed_ids) !== canonicalJson(reviewedIds) || review.rationale !== receiptRationale ||
      typeof review.rationale !== "string" || review.rationale.length < 40 || review.rationale.length > 300 ||
      canonicalJson(review.findings) !== canonicalJson(terminalFindings)) {
      throw new Error(`${manifestPath}: aggregate output does not exactly replay every terminal pass and receipt target`);
    }
    const expectedEvidence = [manifestBinding, ...artifactBindings]
      .sort((left, right) => left.path.localeCompare(right.path));
    if (canonicalJson(receiptArtifactBindings(receipt, receiptPath)) !== canonicalJson(expectedEvidence)) {
      throw new Error(`${receiptPath}: receipt artifact set differs from its exact reconsideration manifest`);
    }
    const recordDecisionIds = new Set<string>();
    const edgeDecisionIds = new Map<string, Set<string>>();
    for (const { decision, stage } of receiptStages) {
      const target = reconsiderationTarget(decision);
      if (!target || !reviewedIds.includes(target.commentaryId) || !target.commentaryId.startsWith(`comm_${dialogue}_`)) {
        throw new Error(`${decision.target_key}: reconsideration evidence does not review this exact target`);
      }
      if ((target.kind === "record" && stage.action !== "revise") ||
        (target.kind === "edge" && stage.action !== "add")) {
        throw new Error(`${decision.target_key}: reconsideration record/edge action is invalid`);
      }
      if (target.kind === "edge" && !exactCitationEdges.get(target.commentaryId)?.has(decision.target_key)) {
        throw new Error(`${decision.target_key}: reconsideration edge is not present in the exact reviewed commentary citation set`);
      }
      if (target.kind === "record") {
        if (recordDecisionIds.has(target.commentaryId)) throw new Error(`${receiptPath}: duplicate reconsidered record ${target.commentaryId}`);
        if (stage.expected_final_pointer_sha256 !== acceptedPointerSha256.get(target.commentaryId)) {
          throw new Error(`${decision.target_key}: reconsideration stage does not bind the reconstructed accepted pointer`);
        }
        recordDecisionIds.add(target.commentaryId);
      } else {
        const keys = edgeDecisionIds.get(target.commentaryId) ?? new Set<string>();
        keys.add(decision.target_key);
        edgeDecisionIds.set(target.commentaryId, keys);
      }
      if (canonicalJson(stage.evidence_artifacts) !== canonicalJson(expectedEvidence)) {
        throw new Error(`${decision.target_key}: decision evidence differs from its exact reconsideration packet`);
      }
    }
    if (canonicalJson([...recordDecisionIds].sort()) !== canonicalJson([...reviewedIds].sort())) {
      throw new Error(`${receiptPath}: reviewed commentary ID set differs from reconsidered record decisions`);
    }
    for (const id of reviewedIds) {
      if (canonicalJson([...(edgeDecisionIds.get(id) ?? [])].sort()) !==
        canonicalJson([...(exactCitationEdges.get(id) ?? [])].sort())) {
        throw new Error(`${receiptPath}: ${id} citation-edge adjustment set differs from the exact terminal packet`);
      }
    }
  }
}

function sampleFailureReceiptBlocks(content: string, location: string) {
  const lines = content.split(/\r?\n/u);
  const start = lines.indexOf("failed_commentary:");
  if (start < 0) throw new Error(`${location}: missing failed_commentary receipt block`);
  const result: Array<{ commentary_id: string; rationale: string; rationale_sha256: string }> = [];
  for (let index = start + 1; index < lines.length;) {
    const id = /^- commentary_id: (comm_[a-z0-9-]+_\d{4})$/u.exec(lines[index] ?? "")?.[1];
    if (!id) break;
    const rationaleSha256 = /^  rationale_sha256: ([a-f0-9]{64})$/u.exec(lines[index + 1] ?? "")?.[1];
    const rawRationale = /^  rationale: (.+)$/u.exec(lines[index + 2] ?? "")?.[1];
    if (!rationaleSha256 || !rawRationale) throw new Error(`${location}: malformed failed_commentary entry ${id}`);
    let rationale: unknown;
    try {
      rationale = JSON.parse(rawRationale) as unknown;
    } catch (error) {
      throw new Error(`${location}: malformed rationale JSON for ${id} (${error instanceof Error ? error.message : String(error)})`);
    }
    if (typeof rationale !== "string" || sha256(rationale) !== rationaleSha256) {
      throw new Error(`${location}: rationale hash mismatch for ${id}`);
    }
    result.push({ commentary_id: id, rationale, rationale_sha256: rationaleSha256 });
    index += 3;
  }
  if (result.length === 0 || new Set(result.map((entry) => entry.commentary_id)).size !== result.length) {
    throw new Error(`${location}: failed_commentary must contain unique review failures`);
  }
  return result;
}

function sampleEvidenceComponentBindings(evidence: CommentaryAuditSampleEvidenceRecord) {
  return {
    pending_manifest: { path: evidence.pending_manifest.path, sha256: evidence.pending_manifest.sha256 },
    commentary_ledger: { path: evidence.commentary_ledger.path, sha256: evidence.commentary_ledger.sha256 },
    sample_packet: { path: evidence.sample_packet.path, sha256: evidence.sample_packet.sha256 },
    output_schema: { path: evidence.output_schema.path, sha256: evidence.output_schema.sha256 },
    model_catalog: { path: evidence.model_catalog.path, sha256: evidence.model_catalog.sha256 },
    prompt: { sha256: evidence.prompt.sha256 },
    sample_output: { path: evidence.sample_output.path, sha256: evidence.sample_output.sha256 },
    sample_state: { path: evidence.sample_state.path, sha256: evidence.sample_state.sha256 },
    codex_execution: { path: evidence.codex_execution.path, sha256: evidence.codex_execution.sha256 },
  };
}

export function verifyOntologyAuditSampleFailureReviewEvidence(
  repoRoot: string,
  decisions: readonly OntologyAuditFinalAdjustment[],
  priorState: OntologyAuditFinalAdjustmentPriorState,
) {
  const sampleStages = provenanceStages(decisions, "commentary_sample_failure");
  if (sampleStages.length === 0) return;
  const priorTargets = new Map(priorState.targets.map((target) => [target.target_key, target]));
  const receiptTransitions = new Map<string, { dialogue: string; before: string; after: string }>();
  const seenTargets = new Set<string>();

  for (const { decision, stage, index } of sampleStages) {
    if (seenTargets.has(decision.target_key)) throw new Error(`Duplicate sample-failure stage ${decision.target_key}`);
    seenTargets.add(decision.target_key);
    const receiptMatch = SAMPLE_FAILURE_RECEIPT_ARTIFACT.exec(stage.source_receipt_path);
    const targetMatch = /^record:commentary:(comm_([a-z0-9-]+)_\d{4})$/u.exec(decision.target_key);
    if (!receiptMatch || !targetMatch || receiptMatch[2] !== targetMatch[2] ||
      decision.action !== "reject" || stage.action !== "reject" || index !== decision.provenance_chain.length - 1) {
      throw new Error(`${decision.target_key}: sample-failure stage identity or terminal action is invalid`);
    }
    const dialogue = targetMatch[2]!;
    const commentaryId = targetMatch[1]!;
    const evidenceBindings = stage.evidence_artifacts.filter((binding) =>
      SAMPLE_FAILURE_EVIDENCE_ARTIFACT.test(binding.path)
    );
    const submissionBindings = stage.evidence_artifacts.filter((binding) =>
      SAMPLE_FAILURE_SUBMISSION_ARTIFACT.test(binding.path)
    );
    if (evidenceBindings.length !== 1 || submissionBindings.length !== 1 || stage.evidence_artifacts.length !== 2) {
      throw new Error(`${decision.target_key}: sample-failure stage must bind one evidence bundle and one submission`);
    }
    const evidenceBinding = evidenceBindings[0]!;
    const submissionBinding = submissionBindings[0]!;
    const evidenceMatch = SAMPLE_FAILURE_EVIDENCE_ARTIFACT.exec(evidenceBinding.path)!;
    const submissionMatch = SAMPLE_FAILURE_SUBMISSION_ARTIFACT.exec(submissionBinding.path)!;
    if (evidenceMatch[1] !== dialogue || evidenceMatch[2] !== evidenceBinding.sha256 ||
      submissionMatch[1] !== dialogue || submissionMatch[2] !== submissionBinding.sha256) {
      throw new Error(`${decision.target_key}: sample-failure content address or dialogue is invalid`);
    }
    const evidenceAbsolute = repositoryArtifactPath(repoRoot, evidenceBinding.path);
    const submissionAbsolute = repositoryArtifactPath(repoRoot, submissionBinding.path);
    const receiptAbsolute = repositoryArtifactPath(repoRoot, stage.source_receipt_path);
    if (!evidenceAbsolute || !submissionAbsolute || !receiptAbsolute ||
      sha256(readFileSync(evidenceAbsolute)) !== evidenceBinding.sha256 ||
      sha256(readFileSync(submissionAbsolute)) !== submissionBinding.sha256) {
      throw new Error(`${decision.target_key}: sample-failure evidence, submission, or receipt is missing or stale`);
    }
    const evidenceValue = canonicalJsonArtifact(evidenceAbsolute, evidenceBinding.path) as unknown as CommentaryAuditSampleEvidenceRecord;
    const activeCommentaryIds = fencedYamlRecordBlocks(evidenceValue.commentary_ledger.content).flatMap((block) =>
      typeof block.record.commentary_id === "string" && block.record.review_status === "accepted"
        ? [block.record.commentary_id]
        : []
    );
    assertCommentaryAuditSampleEvidenceReplay({
      evidence: evidenceValue,
      pendingManifestContent: evidenceValue.pending_manifest.content,
      activeCommentaryIds,
      historical: true,
      requiredVerdict: "fail",
    });
    const sampleReview = JSON.parse(evidenceValue.sample_output.content) as Record<string, unknown>;
    const failedBlocks = Array.isArray(sampleReview.blocks)
      ? sampleReview.blocks.flatMap((value) => {
          const block = value as Record<string, unknown>;
          return block.verdict === "fail" && typeof block.commentary_id === "string" && typeof block.rationale === "string"
            ? [{
                commentary_id: block.commentary_id,
                rationale: block.rationale,
                rationale_sha256: sha256(block.rationale),
              }]
            : [];
        })
      : [];
    const submission = canonicalJsonArtifact(submissionAbsolute, submissionBinding.path);
    exactKeys(
      submission,
      [
        "dialogue",
        "failed_commentary",
        "lane",
        "ledger",
        "review_receipt",
        "reviewed_on",
        "reviewer",
        "sample_components",
        "sample_evidence",
        "sample_verdict",
        "schema_version",
      ],
      submissionBinding.path,
    );
    const receipt = readFileSync(receiptAbsolute, "utf8");
    const receiptBinding = submission.review_receipt as Record<string, unknown> | undefined;
    const ledger = submission.ledger as Record<string, unknown> | undefined;
    const before = ledger?.sha256_before;
    const after = ledger?.sha256_after;
    const ledgerPath = ledger?.path;
    const expectedReceiptSha256 = sha256(receipt);
    if (submission.schema_version !== 1 || submission.lane !== "commentary-sample-failure-rejection" ||
      submission.dialogue !== dialogue || submission.sample_verdict !== "fail" ||
      submission.reviewer !== evidenceValue.reviewer_id ||
      canonicalJson(submission.sample_evidence) !== canonicalJson(evidenceBinding) ||
      canonicalJson(submission.sample_components) !== canonicalJson(sampleEvidenceComponentBindings(evidenceValue)) ||
      canonicalJson(submission.failed_commentary) !== canonicalJson(failedBlocks) ||
      ledgerPath !== `wiki/commentary/${dialogue}.md` || before !== evidenceValue.commentary_ledger.sha256 ||
      typeof after !== "string" || !SHA256.test(after) ||
      receiptBinding?.path !== stage.source_receipt_path || receiptBinding.sha256 !== expectedReceiptSha256) {
      throw new Error(`${decision.target_key}: sample-failure submission differs from replayed evidence or receipt`);
    }
    if (!receipt.startsWith("# Commentary independent-sample failure rejection\n\n") ||
      receiptScalar(receipt, "dialogue", stage.source_receipt_path) !== dialogue ||
      receiptScalar(receipt, "decision", stage.source_receipt_path) !== "rejected" ||
      receiptScalar(receipt, "prior_review_status", stage.source_receipt_path) !== "accepted" ||
      receiptScalar(receipt, "review_transition", stage.source_receipt_path) !== "accepted -> rejected" ||
      receiptScalar(receipt, "ledger_path", stage.source_receipt_path) !== ledgerPath ||
      receiptScalar(receipt, "ledger_sha256_before", stage.source_receipt_path) !== before ||
      receiptScalar(receipt, "ledger_sha256_after", stage.source_receipt_path) !== after ||
      receiptScalar(receipt, "sample_verdict", stage.source_receipt_path) !== "fail" ||
      receiptScalar(receipt, "sample_evidence_path", stage.source_receipt_path) !== evidenceBinding.path ||
      receiptScalar(receipt, "sample_evidence_sha256", stage.source_receipt_path) !== evidenceBinding.sha256 ||
      canonicalJson(sampleFailureReceiptBlocks(receipt, stage.source_receipt_path)) !== canonicalJson(failedBlocks)) {
      throw new Error(`${decision.target_key}: sample-failure receipt differs from exact replayed failure evidence`);
    }
    const failed = failedBlocks.find((block) => block.commentary_id === commentaryId);
    if (!failed) throw new Error(`${decision.target_key}: sample-failure evidence does not reject this target`);
    const evidenceBlock = exactCommentaryBlock(
      evidenceValue.commentary_ledger.content,
      commentaryId,
      `${evidenceBinding.path}:commentary_ledger`,
    );
    const currentLedgerAbsolute = repositoryArtifactPath(repoRoot, ledgerPath);
    if (!currentLedgerAbsolute) throw new Error(`${decision.target_key}: current commentary ledger is missing`);
    const currentBlock = exactCommentaryBlock(
      readFileSync(currentLedgerAbsolute, "utf8"),
      commentaryId,
      ledgerPath,
    );
    const currentPointers = commentaryStatusPointers(ledgerPath, currentBlock, decision.target_key);
    if (evidenceBlock.record.review_status !== "accepted" ||
      evidenceBlock.fullMatch !== currentPointers.acceptedBytes || currentBlock.record.review_status !== "rejected" ||
      stage.expected_final_pointer_sha256 !== currentPointers.rejectedSha256 ||
      decision.expected_final_pointer_sha256 !== currentPointers.rejectedSha256) {
      throw new Error(`${decision.target_key}: sample-failure stage does not prove the exact accepted-to-rejected record transition`);
    }
    if (index === 0) {
      const prior = priorTargets.get(decision.target_key)?.prior_final as Record<string, unknown> | null | undefined;
      if (!prior || prior.path !== ledgerPath || prior.ordinal !== evidenceBlock.index ||
        prior.canonical_sha256 !== sha256(evidenceBlock.fullMatch) ||
        (prior.review_status !== undefined && prior.review_status !== "accepted")) {
        throw new Error(`${decision.target_key}: sample-failure accepted evidence differs from preserved prior state`);
      }
    } else if (stage.prior_final_pointer_sha256 !== currentPointers.acceptedSha256) {
      throw new Error(`${decision.target_key}: sample-failure stage does not continue the exact accepted intermediate pointer`);
    }
    const expectedRationale = `Independent sample review rejected ${commentaryId}: ${failed.rationale}`.slice(0, 500);
    if (decision.rationale !== expectedRationale) {
      throw new Error(`${decision.target_key}: sample-failure rationale differs from the reviewed failure`);
    }
    const priorTransition = receiptTransitions.get(stage.source_receipt_path);
    if (priorTransition && (priorTransition.dialogue !== dialogue || priorTransition.before !== before ||
      priorTransition.after !== after)) {
      throw new Error(`${stage.source_receipt_path}: receipt is bound to conflicting sample ledger transitions`);
    }
    receiptTransitions.set(stage.source_receipt_path, { dialogue, before: before as string, after });
  }

  const transitionsByDialogue = new Map<string, Array<{ before: string; after: string }>>();
  for (const transition of receiptTransitions.values()) {
    const values = transitionsByDialogue.get(transition.dialogue) ?? [];
    values.push({ before: transition.before, after: transition.after });
    transitionsByDialogue.set(transition.dialogue, values);
  }
  for (const [dialogue, transitions] of transitionsByDialogue) {
    const beforeSet = new Set(transitions.map((entry) => entry.before));
    const afterSet = new Set(transitions.map((entry) => entry.after));
    const starts = transitions.filter((entry) => !afterSet.has(entry.before));
    if (starts.length !== 1 || beforeSet.size !== transitions.length || afterSet.size !== transitions.length) {
      throw new Error(`${dialogue}: sample-failure ledger transitions must form one unbranched sequence`);
    }
    let cursor = starts[0]!.before;
    for (let index = 0; index < transitions.length; index += 1) {
      const next = transitions.find((entry) => entry.before === cursor);
      if (!next) throw new Error(`${dialogue}: sample-failure ledger transition sequence is incomplete`);
      cursor = next.after;
    }
    const ledgerPath = `wiki/commentary/${dialogue}.md`;
    const ledgerAbsolute = repositoryArtifactPath(repoRoot, ledgerPath);
    if (!ledgerAbsolute || sha256(readFileSync(ledgerAbsolute)) !== cursor) {
      throw new Error(`${dialogue}: sample-failure ledger transition sequence does not end at the current ledger`);
    }
  }
}

function verifyOntologyAuditItemReviewEvidence(
  repoRoot: string,
  decisions: readonly OntologyAuditFinalAdjustment[],
) {
  for (const { decision, stage } of provenanceStages(decisions, "ontology_item_review")) {
    const absoluteReceipt = repositoryArtifactPath(repoRoot, stage.source_receipt_path);
    if (!absoluteReceipt) throw new Error(`${decision.target_key}: ontology item-review receipt is missing or path-aliased`);
    const receipt = readFileSync(absoluteReceipt, "utf8");
    if (!receipt.startsWith("# Ontology item review\n\n") ||
      receiptScalar(receipt, "target_key", stage.source_receipt_path) !== decision.target_key ||
      receiptScalar(receipt, "action", stage.source_receipt_path) !== stage.action ||
      receiptScalar(receipt, "prior_final_pointer_sha256", stage.source_receipt_path) !==
        (stage.prior_final_pointer_sha256 ?? "null") ||
      receiptScalar(receipt, "expected_final_pointer_sha256", stage.source_receipt_path) !==
        (stage.expected_final_pointer_sha256 ?? "null") ||
      canonicalJson(receiptArtifactBindings(receipt, stage.source_receipt_path)) !==
        canonicalJson(stage.evidence_artifacts)) {
      throw new Error(`${decision.target_key}: ontology item-review receipt does not exactly bind its stage and evidence`);
    }
  }
}

export function verifyOntologyAuditFinalAdjustmentProvenance({
  repoRoot,
  packagePath,
  decisions,
  priorState,
}: {
  repoRoot: string;
  packagePath: string;
  decisions: readonly OntologyAuditFinalAdjustment[];
  priorState: OntologyAuditFinalAdjustmentPriorState;
}) {
  verifyStructuralReviewEvidence(repoRoot, decisions);
  verifyOntologyAuditReconsiderationReviewEvidence(repoRoot, decisions);
  verifyOntologyAuditSampleFailureReviewEvidence(repoRoot, decisions, priorState);
  verifyOntologyAuditItemReviewEvidence(repoRoot, decisions);
  verifyOntologyAuditRelationFictionFinalAdjustments(repoRoot, packagePath, decisions, priorState);
}

export function readOntologyAuditFinalAdjustments({ repoRoot, packagePath }: {
  repoRoot: string;
  packagePath: string;
}): OntologyAuditFinalAdjustmentArtifact | null {
  const directory = join(packagePath, "review-inputs/final-adjustments");
  if (!existsSync(directory)) return null;
  const directoryLogicalPath = relative(resolve(repoRoot), resolve(directory)).split("\\").join("/");
  if (repositoryArtifactPath(repoRoot, directoryLogicalPath) !== resolve(directory)) {
    throw new Error("Final-adjustments directory must be one canonical in-repository directory with no symlink or realpath aliasing.");
  }
  const directoryEntries = readdirSync(directory, { withFileTypes: true });
  if (directoryEntries.some((entry) => !entry.isFile())) {
    throw new Error("Final-adjustments directory may contain only the exact expected regular files; directories and symlinks are forbidden.");
  }
  const files = directoryEntries.map((entry) => entry.name).sort();
  const decisionCandidates = files.filter((name) => DECISION_ARTIFACT.test(name));
  const priorStateCandidates = files.filter((name) => PRIOR_STATE_ARTIFACT.test(name));
  const priorPartitionCandidates = files.filter((name) => PRIOR_PARTITION_ARTIFACT.test(name));
  if (decisionCandidates.length !== 1 || priorStateCandidates.length !== 1 || priorPartitionCandidates.length !== 3 || files.length !== 5) {
    throw new Error(`Expected exactly one decision artifact, one prior-state artifact, and three preserved partitions with no extras; found ${decisionCandidates.length}, ${priorStateCandidates.length}, ${priorPartitionCandidates.length}, and ${files.length} total files.`);
  }
  const artifactPath = join(directory, decisionCandidates[0]!);
  const content = readFileSync(artifactPath, "utf8");
  const expectedSha256 = DECISION_ARTIFACT.exec(basename(artifactPath))?.[1];
  const actualSha256 = sha256(content);
  if (!expectedSha256 || expectedSha256 !== actualSha256) throw new Error(`${artifactPath}: content hash does not match its content-addressed filename`);
  const decisions = new Map<string, OntologyAuditFinalAdjustment>();
  const lines = content.split(/\r?\n/u).filter(Boolean);
  for (const [index, line] of lines.entries()) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line) as unknown;
    } catch (error) {
      throw new Error(`${artifactPath}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
    const decision = validateDecision(parsed, `${artifactPath}:${index + 1}`, repoRoot);
    if (canonicalJson(decision) !== line) throw new Error(`${artifactPath}:${index + 1}: final adjustment is not canonical JSON`);
    if (decisions.has(decision.target_key)) throw new Error(`${artifactPath}:${index + 1}: duplicate target ${decision.target_key}`);
    decisions.set(decision.target_key, decision);
  }
  if (lines.length === 0 || renderOntologyAuditFinalAdjustments([...decisions.values()]) !== content) {
    throw new Error(`${artifactPath}: final adjustments must be non-empty and sorted by target_key`);
  }

  const priorStateArtifactPath = join(directory, priorStateCandidates[0]!);
  const priorStateContent = readFileSync(priorStateArtifactPath, "utf8");
  const priorStateSha256 = sha256(priorStateContent);
  if (PRIOR_STATE_ARTIFACT.exec(basename(priorStateArtifactPath))?.[1] !== priorStateSha256) {
    throw new Error(`${priorStateArtifactPath}: content hash does not match its content-addressed filename`);
  }
  const priorState = parsePriorState(priorStateContent, priorStateArtifactPath);
  const packageRelativePath = relative(repoRoot, packagePath).split("\\").join("/");
  const expectedAcceptancePath = `${packageRelativePath}/acceptance.json`;
  if (priorState.acceptance.path !== expectedAcceptancePath ||
    repositoryArtifactPath(repoRoot, priorState.acceptance.path) !== join(packagePath, "acceptance.json")) {
    throw new Error(`${priorStateArtifactPath}: prior acceptance path must exactly name this audit package acceptance.json`);
  }
  if (renderOntologyAuditFinalAdjustmentPriorState(priorState) !== priorStateContent) {
    throw new Error(`${priorStateArtifactPath}: prior state is not canonical`);
  }
  const declaredPartitionFiles = priorState.partitions.map((partition) => basename(partition.path)).sort();
  if (declaredPartitionFiles.some((name, index) => name !== priorPartitionCandidates[index])) {
    throw new Error(`${priorStateArtifactPath}: declared preserved partition set differs from exact directory files`);
  }
  verifyPreservedPriorPartitions({ repoRoot, priorState });
  const priorTargets = new Map(priorState.targets.map((target) => [target.target_key, target]));
  if (priorTargets.size !== decisions.size) throw new Error(`${priorStateArtifactPath}: prior target set differs from decisions`);
  for (const decision of decisions.values()) {
    const prior = priorTargets.get(decision.target_key);
    if (!prior || ontologyAuditFinalPointerSha256(prior.prior_final) !== decision.prior_final_pointer_sha256 ||
      ontologyAuditAdjudicationSha256(prior.superseded_adjudication) !== decision.superseded_adjudication_sha256) {
      throw new Error(`${priorStateArtifactPath}: prior state does not exactly prove ${decision.target_key}`);
    }
  }
  verifyOntologyAuditFinalAdjustmentProvenance({
    repoRoot,
    packagePath,
    decisions: [...decisions.values()],
    priorState,
  });

  const bindings = requiredReceiptBindings({
    repoRoot,
    artifactPath,
    artifactSha256: actualSha256,
    priorStateArtifactPath,
    priorStateSha256,
    priorState,
    decisions: [...decisions.values()],
  });
  const absoluteReceipt = repositoryArtifactPath(repoRoot, ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT);
  if (!absoluteReceipt) throw new Error(`Missing or noncanonical final-adjustment receipt ${ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT}`);
  const receipt = readFileSync(absoluteReceipt, "utf8");
  const relativeArtifactPath = relative(repoRoot, artifactPath).split("\\").join("/");
  const relativePriorStatePath = relative(repoRoot, priorStateArtifactPath).split("\\").join("/");
  const expectedReceipt = renderOntologyAuditFinalAdjustmentReceipt({
    artifactPath: relativeArtifactPath,
    artifactSha256: actualSha256,
    priorStateArtifactPath: relativePriorStatePath,
    priorStateSha256,
    decisions: [...decisions.values()],
    bindings,
  });
  if (receipt !== expectedReceipt) throw new Error(`${ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT}: receipt is not the exact reciprocal provenance receipt`);
  return {
    artifactPath,
    sha256: actualSha256,
    decisions,
    priorStateArtifactPath,
    priorStateSha256,
    priorState,
    receiptPath: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
    receiptSha256: sha256(receipt),
    receiptBindings: bindings,
  };
}

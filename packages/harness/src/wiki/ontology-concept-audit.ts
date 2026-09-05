import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  deriveOntologyVNextMembershipId,
  parseOntologyVNext,
  renderOntologyVNextDocuments,
  type ObservationReviewStatus,
  type OntologyVNextAxis,
  type OntologyVNextConcept,
  type OntologyVNextMembership,
} from "./ontology-vnext.js";

const INPUT_FILES = ["axes.jsonl", "concepts.jsonl", "memberships.jsonl", "proposed-concepts.jsonl"] as const;
const RECEIPT_FILE = "receipt.json";
const SOURCE_OMISSION_ARTIFACT_RE = /^split-membership-reviews\/sha256-([a-f0-9]{64})-source-omissions\.jsonl$/u;
const SOURCE_OMISSION_ZERO_RESULT_ARTIFACT_RE = /^split-membership-reviews\/sha256-([a-f0-9]{64})-source-omission-zero-results\.jsonl$/u;

type AuditAxis = OntologyVNextAxis & { definition: string };
type AuditAxisDecision = {
  target_key: string;
  kind: "axis_decision";
  legacy_family: string;
  decision: "ratify" | "retype" | "merge" | "retire";
  rationale: string;
  vnext: AuditAxis | null;
};
type AuditConcept = Omit<OntologyVNextConcept, "schema_version"> & { schema_version?: 1 };
type AuditConceptDecision = {
  target_key: string;
  kind: "concept_decision";
  legacy_family: string;
  legacy_label: string;
  decision: "ratify" | "retype" | "split" | "merge" | "retire";
  rationale: string;
  split_targets: AuditConcept[];
  vnext: AuditConcept | null;
};
type AuditProposedConcept = {
  proposal_key: string;
  kind: "proposed_concept";
  decision: "ratify";
  rationale: string;
  vnext: AuditConcept;
};
type AuditMembershipDecision = {
  target_key: string;
  kind: "membership_decision";
  observation_id: string;
  review_status: "accepted" | "rejected";
  decision: "keep" | "move" | "add" | "drop" | "split";
  rationale: string;
  vnext_axis_id: string | null;
  vnext_concept_id: string | null;
  vnext_membership_id: string | null;
  replacement_membership_ids?: string[];
  reviewed_proposal_membership_ids?: string[];
};

export type OntologyConceptAudit = {
  axes: AuditAxisDecision[];
  concepts: AuditConceptDecision[];
  memberships: AuditMembershipDecision[];
  proposals: AuditProposedConcept[];
  receipt: {
    audit_snapshot: string;
    baseline_commit: string;
    exact_denominator: Record<string, number>;
    canonical_vnext_counts: { axes: number; concepts: number; memberships: number };
    checks: Record<string, boolean | number>;
    artifacts: Record<string, { sha256: string; bytes: number; rows: number }>;
  };
};

export type OntologyVNextMembershipProposal = {
  target_key: string;
  source_target_key: string;
  observation_id: string;
  concept_id: string;
  membership_id: string;
};

function sha256(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

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

function canonicalMembershipAssignmentBasis(
  rationale: string,
  concepts: readonly AuditConceptDecision[],
) {
  let basis = rationale;
  for (const concept of concepts) {
    basis = basis.replaceAll(
      `${concept.legacy_family}::${concept.legacy_label}`,
      "the retired pre-cut assignment",
    );
  }
  basis = basis.replace(/\bfeature(?:_candidate)?_[a-z0-9_]+\b/gu, "the retired pre-cut assignment");
  basis = basis.replace(/\b[a-z0-9_]+::[a-z0-9_]+\b/gu, "the retired pre-cut assignment");
  return basis;
}

function parseCanonicalJsonl<T>(path: string) {
  const content = readFileSync(path, "utf8");
  if (content === "") return [];
  if (!content.endsWith("\n") || content.includes("\r") || content.endsWith("\n\n")) {
    throw new Error(`${path}: concept-audit JSONL is not canonical.`);
  }
  return content
    .slice(0, -1)
    .split("\n")
    .map((line, index) => {
      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch (error) {
        throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (canonicalJson(value) !== line) throw new Error(`${path}:${index + 1}: non-canonical JSON object.`);
      return value as T;
    });
}

function assertUnique(rows: readonly Record<string, unknown>[], field: string, file: string) {
  const values = rows.map((row) => row[field]);
  if (values.some((value) => typeof value !== "string" || value.length === 0)) {
    throw new Error(`${file}: every row requires ${field}.`);
  }
  if (new Set(values).size !== values.length) throw new Error(`${file}: duplicate ${field}.`);
}

function receiptArtifactProblem(directory: string, file: string, descriptor: { sha256: string; bytes: number; rows: number }) {
  const content = readFileSync(join(directory, file));
  const rows = content.toString("utf8").split("\n").filter(Boolean).length;
  if (sha256(content) !== descriptor.sha256) return `${file}: receipt SHA-256 mismatch`;
  if (content.byteLength !== descriptor.bytes) return `${file}: receipt byte count mismatch`;
  if (rows !== descriptor.rows) return `${file}: receipt row count mismatch`;
  return null;
}

type AuditSourceRef = {
  source_path: string;
  stephanus_span: string;
  start_marker: string;
  end_marker: string;
  start_char: number;
  end_char: number;
  text_sha256: string;
};

function validateAuditGreekSourceEvidence({
  repoRoot,
  dialogue,
  sourceRef,
  greekTerms,
  label,
}: {
  repoRoot: string;
  dialogue: unknown;
  sourceRef: unknown;
  greekTerms?: unknown;
  label: string;
}) {
  if (typeof dialogue !== "string" || !/^[a-z0-9-]+$/u.test(dialogue)) {
    throw new Error(`${label}: source evidence requires one canonical dialogue slug.`);
  }
  if (sourceRef === null || typeof sourceRef !== "object" || Array.isArray(sourceRef)) {
    throw new Error(`${label}: source evidence requires one canonical Greek source_ref.`);
  }
  const ref = sourceRef as Partial<AuditSourceRef>;
  const expectedPath = `raw/plato/greek/${dialogue}.txt`;
  const span = typeof ref.stephanus_span === "string"
    ? ref.stephanus_span.trim().replace(/[–—]/gu, "-").replace(/\s+/gu, "")
    : "";
  const spanMatch = /^(\d+[a-e])(?:-(\d+[a-e]))?$/u.exec(span);
  if (
    ref.source_path !== expectedPath
    || !spanMatch
    || ref.stephanus_span !== span
    || ref.start_marker !== spanMatch[1]
    || ref.end_marker !== (spanMatch[2] ?? spanMatch[1])
    || !Number.isSafeInteger(ref.start_char)
    || !Number.isSafeInteger(ref.end_char)
    || (ref.start_char ?? -1) < 0
    || (ref.end_char ?? -1) <= (ref.start_char ?? -1)
    || typeof ref.text_sha256 !== "string"
    || !/^[a-f0-9]{64}$/u.test(ref.text_sha256)
  ) {
    throw new Error(`${label}: source_ref path, markers, range, or hash is not canonical Greek evidence.`);
  }
  let source: string;
  try {
    source = readFileSync(join(repoRoot, expectedPath), "utf8");
  } catch {
    throw new Error(`${label}: canonical Greek source ${expectedPath} cannot be read.`);
  }
  const markers = [...source.matchAll(/\{(\d+[a-e])\}/gu)].map((match) => ({
    marker: match[1]!,
    index: match.index,
  }));
  const startIndex = markers.findIndex((marker) => marker.marker === ref.start_marker);
  const endIndex = markers.findIndex((marker) => marker.marker === ref.end_marker);
  const expectedStart = markers[startIndex]?.index;
  const expectedEnd = markers[endIndex + 1]?.index ?? source.length;
  if (
    startIndex < 0
    || endIndex < startIndex
    || ref.start_char !== expectedStart
    || ref.end_char !== expectedEnd
    || ref.end_char > source.length
  ) {
    throw new Error(`${label}: source_ref range is not the canonical Stephanus interval in ${expectedPath}.`);
  }
  const sourceSlice = source.slice(ref.start_char, ref.end_char);
  if (sha256(sourceSlice) !== ref.text_sha256) {
    throw new Error(`${label}: source_ref hash differs from the canonical Greek bytes.`);
  }
  if (greekTerms !== undefined) {
    if (
      !Array.isArray(greekTerms)
      || greekTerms.some((term) => typeof term !== "string" || term.trim().length === 0 || !sourceSlice.includes(term))
    ) {
      throw new Error(`${label}: greek_terms must be non-empty strings present in the canonical Greek source interval.`);
    }
  }
}

export function readOntologyConceptAudit(
  directory: string,
  { allowIncompleteAllDroppedResolution = false, repoRoot }: {
    allowIncompleteAllDroppedResolution?: boolean;
    repoRoot?: string;
  } = {},
): OntologyConceptAudit {
  const receipt = JSON.parse(readFileSync(join(directory, RECEIPT_FILE), "utf8")) as OntologyConceptAudit["receipt"];
  for (const [file, descriptor] of Object.entries(receipt.artifacts ?? {})) {
    if (file.startsWith("/") || file.split(/[\\/]/u).includes("..")) {
      throw new Error(`${RECEIPT_FILE}: unsafe artifact path ${file}.`);
    }
    const problem = receiptArtifactProblem(directory, file, descriptor);
    if (problem) throw new Error(problem);
  }
  for (const file of INPUT_FILES) {
    const descriptor = receipt.artifacts?.[file];
    if (!descriptor) throw new Error(`${RECEIPT_FILE}: missing artifact descriptor for ${file}.`);
  }
  const axes = parseCanonicalJsonl<AuditAxisDecision>(join(directory, "axes.jsonl"));
  const concepts = parseCanonicalJsonl<AuditConceptDecision>(join(directory, "concepts.jsonl"));
  const memberships = parseCanonicalJsonl<AuditMembershipDecision>(join(directory, "memberships.jsonl"));
  const proposals = parseCanonicalJsonl<AuditProposedConcept>(join(directory, "proposed-concepts.jsonl"));
  assertUnique(axes as unknown as Record<string, unknown>[], "target_key", "axes.jsonl");
  assertUnique(concepts as unknown as Record<string, unknown>[], "target_key", "concepts.jsonl");
  assertUnique(memberships as unknown as Record<string, unknown>[], "target_key", "memberships.jsonl");
  assertUnique(proposals as unknown as Record<string, unknown>[], "proposal_key", "proposed-concepts.jsonl");
  if (axes.some((row) => row.kind !== "axis_decision" || row.rationale.trim().length < 20)) {
    throw new Error("axes.jsonl: invalid or unsupported decision row.");
  }
  if (concepts.some((row) => row.kind !== "concept_decision" || row.rationale.trim().length < 20)) {
    throw new Error("concepts.jsonl: invalid or unsupported decision row.");
  }
  if (memberships.some((row) => row.kind !== "membership_decision" || row.rationale.trim().length < 20)) {
    throw new Error("memberships.jsonl: invalid or unsupported decision row.");
  }
  for (const row of memberships) {
    if (!["keep", "move", "add", "drop", "split"].includes(row.decision)) {
      throw new Error(`${row.target_key}: unsupported membership decision ${String(row.decision)}.`);
    }
    if (row.review_status !== "accepted" && row.review_status !== "rejected") {
      throw new Error(`${row.target_key}: unsupported membership review status ${String(row.review_status)}.`);
    }
    const targetIsProposal = row.target_key.startsWith("membership:vnext:");
    const targetIsAddition = row.target_key.startsWith("membership:addition:");
    const identityFields = [row.vnext_axis_id, row.vnext_concept_id, row.vnext_membership_id];
    const identityFieldCount = identityFields.filter((value) => value !== null).length;
    const reviewedProposals = row.reviewed_proposal_membership_ids ?? [];
    const dropRetainsProposalLineage = row.decision === "drop" && reviewedProposals.length > 0;
    if (targetIsProposal || targetIsAddition || row.decision !== "drop" || dropRetainsProposalLineage) {
      if (identityFieldCount !== identityFields.length || !row.vnext_concept_id || !row.vnext_membership_id) {
        throw new Error(`${row.target_key}: retained or proposed membership requires one complete vNext identity.`);
      }
      const derived = deriveOntologyVNextMembershipId(row.observation_id, row.vnext_concept_id);
      if (row.vnext_membership_id !== derived) {
        throw new Error(`${row.target_key}: vNext membership id is not derived from observation plus concept.`);
      }
    } else if (identityFieldCount !== 0) {
      throw new Error(`${row.target_key}: retired frozen membership carries only part of a vNext identity.`);
    }
    if (targetIsProposal) {
      if (row.target_key !== `membership:vnext:${row.vnext_membership_id}`) {
        throw new Error(`${row.target_key}: split-child proposal target does not bind its membership id.`);
      }
      if (row.review_status !== "accepted" || !["add", "drop"].includes(row.decision)) {
        throw new Error(`${row.target_key}: split-child proposal must be an accepted observation reviewed as add or drop.`);
      }
    } else if (targetIsAddition) {
      if (row.target_key !== `membership:addition:${row.vnext_membership_id}`) {
        throw new Error(`${row.target_key}: source-omission addition does not bind its membership id.`);
      }
      if (row.review_status !== "accepted" || row.decision !== "add") {
        throw new Error(`${row.target_key}: source-omission addition must be an accepted observation reviewed as add.`);
      }
    } else if (!row.target_key.startsWith("membership:observation:")) {
      throw new Error(`${row.target_key}: frozen membership target has an unsupported identity.`);
    }
    if (row.review_status === "rejected" && row.decision !== "drop") {
      throw new Error(`${row.target_key}: rejected observation membership must be dropped.`);
    }
    const replacements = row.replacement_membership_ids ?? [];
    if (
      new Set(replacements).size !== replacements.length
      || replacements.some((membershipId) => !/^membership_sha256_[a-f0-9]{64}$/u.test(membershipId))
    ) {
      throw new Error(`${row.target_key}: replacement membership ids are invalid or duplicated.`);
    }
    if (row.decision === "split" && replacements.length === 0) {
      throw new Error(`${row.target_key}: split membership decision requires explicit replacement membership ids.`);
    }
    if (row.decision !== "split" && replacements.length > 0) {
      throw new Error(`${row.target_key}: only split membership decisions may carry replacement membership ids.`);
    }
    if (
      new Set(reviewedProposals).size !== reviewedProposals.length
      || reviewedProposals.some((membershipId) => !/^membership_sha256_[a-f0-9]{64}$/u.test(membershipId))
    ) {
      throw new Error(`${row.target_key}: reviewed proposal membership ids are invalid or duplicated.`);
    }
    if (reviewedProposals.length > 0 && ((targetIsProposal || targetIsAddition) || !["split", "drop"].includes(row.decision))) {
      throw new Error(`${row.target_key}: only split or dropped parent memberships may bind reviewed child proposals.`);
    }
    if (row.decision === "split" && replacements.some((membershipId) => !reviewedProposals.includes(membershipId))) {
      throw new Error(`${row.target_key}: split replacements are not a subset of reviewed child proposals.`);
    }
  }
  const sourceOmissionArtifactFiles = Object.keys(receipt.artifacts ?? {})
    .filter((file) => SOURCE_OMISSION_ARTIFACT_RE.test(file))
    .sort(compareStrings);
  const sourceOmissionAdditions = memberships.filter((row) => row.target_key.startsWith("membership:addition:"));
  let sourceOmissionRows: Array<{
    defect_id: string;
    replaced_concept_id: string;
    replaced_parent_observation_id: string;
    replaces_membership_ids: string[];
  }> = [];
  if (sourceOmissionArtifactFiles.length > 1) {
    throw new Error("receipt.json: competing source-omission artifacts are not allowed for one frozen snapshot.");
  }
  if (sourceOmissionAdditions.length > 0 && sourceOmissionArtifactFiles.length !== 1) {
    throw new Error("memberships.jsonl: source-omission additions require one content-addressed source-omission artifact.");
  }
  if (sourceOmissionArtifactFiles.length === 1) {
    const file = sourceOmissionArtifactFiles[0]!;
    const expectedHash = SOURCE_OMISSION_ARTIFACT_RE.exec(file)![1]!;
    const content = readFileSync(join(directory, file), "utf8");
    if (sha256(content) !== expectedHash) {
      throw new Error(`${file}: source-omission artifact filename does not bind its bytes.`);
    }
    const omissionRows = parseCanonicalJsonl<{
      adjudication: string;
      defect_id: string;
      defect_class: string;
      observation_id: string;
      concept_id: string;
      dialogue: string;
      greek_terms?: unknown;
      independent_pass_disposition: string;
      missing_fact: string;
      primary_pass_disposition: string;
      proposed_membership_decision: string;
      rationale: string;
      replaced_concept_id: string;
      replaced_parent_observation_id: string;
      replaces_membership_ids: string[];
      reviewer: string;
      source_ref?: unknown;
    }>(join(directory, file));
    sourceOmissionRows = omissionRows;
    assertUnique(omissionRows as unknown as Record<string, unknown>[], "defect_id", file);
    const expectedAdditionTargets = omissionRows.map((row) => {
      if (
        row.defect_class !== "source_omission"
        || typeof row.observation_id !== "string"
        || typeof row.concept_id !== "string"
        || row.proposed_membership_decision !== "add"
        || typeof row.replaced_concept_id !== "string"
        || typeof row.replaced_parent_observation_id !== "string"
        || !Array.isArray(row.replaces_membership_ids)
        || row.replaces_membership_ids.length === 0
        || new Set(row.replaces_membership_ids).size !== row.replaces_membership_ids.length
        || row.replaces_membership_ids.some((membershipId) => !/^membership_sha256_[a-f0-9]{64}$/u.test(membershipId))
        || [
          row.adjudication,
          row.independent_pass_disposition,
          row.missing_fact,
          row.primary_pass_disposition,
          row.rationale,
        ].some((value) => typeof value !== "string" || value.trim().length < 80)
        || typeof row.reviewer !== "string"
        || row.reviewer.trim().length < 3
      ) {
        throw new Error(`${file}: every source omission must bind complete two-pass review and adjudication evidence to one identified membership addition.`);
      }
      if (repoRoot !== undefined) {
        validateAuditGreekSourceEvidence({
          repoRoot,
          dialogue: row.dialogue,
          sourceRef: row.source_ref,
          greekTerms: row.greek_terms,
          label: row.defect_id,
        });
      }
      return `membership:addition:${deriveOntologyVNextMembershipId(row.observation_id, row.concept_id)}`;
    }).sort(compareStrings);
    const actualAdditionTargets = sourceOmissionAdditions.map((row) => row.target_key).sort(compareStrings);
    if (canonicalJson(expectedAdditionTargets) !== canonicalJson(actualAdditionTargets)) {
      throw new Error("memberships.jsonl: source-omission additions do not exactly equal the content-addressed omission ledger.");
    }
    if (
      omissionRows.some((row) => {
        const membershipId = deriveOntologyVNextMembershipId(row.observation_id, row.concept_id);
        const addition = sourceOmissionAdditions.find((entry) => entry.target_key === `membership:addition:${membershipId}`);
        return !addition
          || addition.observation_id !== row.observation_id
          || addition.vnext_concept_id !== row.concept_id
          || addition.vnext_membership_id !== membershipId;
      })
    ) {
      throw new Error("memberships.jsonl: a source-omission addition differs from its reviewed observation or concept identity.");
    }
  }
  const receiptSourceOmissionObservations = receipt.exact_denominator.source_omission_observations;
  const receiptSourceOmissionAdditions = receipt.exact_denominator.source_omission_membership_additions;
  if (
    sourceOmissionArtifactFiles.length > 0
    && (receiptSourceOmissionObservations === undefined || receiptSourceOmissionAdditions === undefined)
  ) {
    throw new Error(
      "receipt.json: content-addressed source-omission evidence requires explicit observation and membership denominators.",
    );
  }
  if (sourceOmissionAdditions.length > 0 && receiptSourceOmissionAdditions === undefined) {
    throw new Error("receipt.json: source-omission additions require an explicit membership denominator.");
  }
  if (
    receiptSourceOmissionObservations !== undefined
    && receiptSourceOmissionObservations !== sourceOmissionRows.length
  ) {
    throw new Error("receipt.json: source-omission observation denominator differs from its artifact.");
  }
  if (
    receiptSourceOmissionAdditions !== undefined
    && receiptSourceOmissionAdditions !== sourceOmissionAdditions.length
  ) {
    throw new Error("receipt.json: source-omission membership denominator differs from memberships.jsonl.");
  }
  const zeroResultArtifactFiles = Object.keys(receipt.artifacts ?? {})
    .filter((file) => SOURCE_OMISSION_ZERO_RESULT_ARTIFACT_RE.test(file))
    .sort(compareStrings);
  if (zeroResultArtifactFiles.length > 1) {
    throw new Error("receipt.json: competing source-omission zero-result artifacts are not allowed for one frozen snapshot.");
  }
  const zeroResultRows = zeroResultArtifactFiles.length === 1
    ? (() => {
        const file = zeroResultArtifactFiles[0]!;
        const expectedHash = SOURCE_OMISSION_ZERO_RESULT_ARTIFACT_RE.exec(file)![1]!;
        const content = readFileSync(join(directory, file), "utf8");
        if (sha256(content) !== expectedHash) {
          throw new Error(`${file}: source-omission zero-result artifact filename does not bind its bytes.`);
        }
        const rows = parseCanonicalJsonl<{
          adjudication: string;
          concept_id: string;
          defect_class: string;
          defect_id: string;
          dialogue: string;
          independent_pass_disposition: string;
          preserved_observation_ids: string[];
          primary_pass_disposition: string;
          rationale: string;
          replaced_parent_observation_id: string;
          reviewed_membership_ids: string[];
          reviewer: string;
          source_refs: unknown[];
        }>(join(directory, file));
        assertUnique(rows as unknown as Record<string, unknown>[], "defect_id", file);
        for (const row of rows) {
          if (
            row.adjudication !== "no_replacement_required"
            || row.defect_class !== "source_omission_zero_result"
            || !/^source_omission_zero_result_[a-z0-9_]+$/u.test(row.defect_id)
            || !Array.isArray(row.preserved_observation_ids)
            || row.preserved_observation_ids.length === 0
            || new Set(row.preserved_observation_ids).size !== row.preserved_observation_ids.length
            || !Array.isArray(row.reviewed_membership_ids)
            || row.reviewed_membership_ids.length === 0
            || new Set(row.reviewed_membership_ids).size !== row.reviewed_membership_ids.length
            || !Array.isArray(row.source_refs)
            || row.source_refs.length === 0
            || [row.independent_pass_disposition, row.primary_pass_disposition, row.rationale]
              .some((value) => typeof value !== "string" || value.trim().length < 80)
            || typeof row.reviewer !== "string"
            || row.reviewer.trim().length < 3
          ) {
            throw new Error(`${file}: every source-omission zero result must bind complete two-pass evidence and an exact all-dropped parent assignment.`);
          }
          if (repoRoot !== undefined) {
            for (const [sourceIndex, sourceRef] of row.source_refs.entries()) {
              validateAuditGreekSourceEvidence({
                repoRoot,
                dialogue: row.dialogue,
                sourceRef,
                label: `${row.defect_id}:source_ref:${sourceIndex}`,
              });
            }
          }
        }
        return rows;
      })()
    : [];
  const receiptZeroResults = receipt.exact_denominator.source_omission_zero_results;
  if (zeroResultArtifactFiles.length > 0 && receiptZeroResults === undefined) {
    throw new Error("receipt.json: content-addressed source-omission zero results require an explicit denominator.");
  }
  if (receiptZeroResults !== undefined && receiptZeroResults !== zeroResultRows.length) {
    throw new Error("receipt.json: source-omission zero-result denominator differs from its artifact.");
  }
  const proposalMembershipsById = new Map(
    memberships
      .filter((row) => row.target_key.startsWith("membership:vnext:") && row.vnext_membership_id !== null)
      .map((row) => [row.vnext_membership_id!, row]),
  );
  const allDroppedParents = memberships.filter((row) =>
    row.target_key.startsWith("membership:observation:")
    && row.decision === "drop"
    && (row.reviewed_proposal_membership_ids?.length ?? 0) > 0
  );
  const resolvedAllDroppedDenominator = receipt.checks.all_dropped_parent_assignments_resolved;
  if (!allowIncompleteAllDroppedResolution) {
    if (allDroppedParents.length > 0 && resolvedAllDroppedDenominator === undefined) {
      throw new Error(
        "receipt.json: all-dropped parent assignments require checks.all_dropped_parent_assignments_resolved.",
      );
    }
    if (
      resolvedAllDroppedDenominator !== undefined
      && resolvedAllDroppedDenominator !== allDroppedParents.length
    ) {
      throw new Error("receipt.json: resolved all-dropped parent denominator differs from memberships.jsonl.");
    }
    for (const parent of allDroppedParents) {
      const parentObservationId = parent.target_key.slice("membership:observation:".length);
      const reviewedMembershipIds = [...(parent.reviewed_proposal_membership_ids ?? [])].sort(compareStrings);
      const omissionMatches = sourceOmissionRows.filter((row) =>
        row.replaced_parent_observation_id === parentObservationId
        && row.replaced_concept_id === parent.vnext_concept_id
      );
      const zeroMatches = zeroResultRows.filter((row) =>
        row.replaced_parent_observation_id === parentObservationId
        && row.concept_id === parent.vnext_concept_id
      );
      if (omissionMatches.length + zeroMatches.length !== 1) {
        throw new Error(`${parent.target_key}: every all-dropped parent assignment requires exactly one source-omission replacement or explicit zero result.`);
      }
      if (
        omissionMatches.length === 1
        && canonicalJson([...omissionMatches[0]!.replaces_membership_ids].sort(compareStrings)) !== canonicalJson(reviewedMembershipIds)
      ) {
        throw new Error(`${parent.target_key}: source-omission replacement does not bind every dropped child proposal.`);
      }
      if (zeroMatches.length === 1) {
        const zero = zeroMatches[0]!;
        const preservedObservationIds = reviewedMembershipIds
          .map((membershipId) => proposalMembershipsById.get(membershipId)?.observation_id ?? "")
          .sort(compareStrings);
        if (
          canonicalJson([...zero.reviewed_membership_ids].sort(compareStrings)) !== canonicalJson(reviewedMembershipIds)
          || canonicalJson([...zero.preserved_observation_ids].sort(compareStrings)) !== canonicalJson(preservedObservationIds)
        ) {
          throw new Error(`${parent.target_key}: source-omission zero result does not bind the exact dropped child denominator.`);
        }
      }
    }
    for (const zero of zeroResultRows) {
      if (!allDroppedParents.some((parent) =>
        parent.target_key === `membership:observation:${zero.replaced_parent_observation_id}`
        && parent.vnext_concept_id === zero.concept_id
      )) {
        throw new Error(`${zero.defect_id}: source-omission zero result does not bind an all-dropped parent assignment.`);
      }
    }
  }
  const frozenMemberships = memberships.filter((row) => row.target_key.startsWith("membership:observation:"));
  const splitProposalMemberships = memberships.filter((row) => row.target_key.startsWith("membership:vnext:"));
  const splitProposalAdds = splitProposalMemberships.filter((row) => row.decision === "add").length;
  const splitProposalDrops = splitProposalMemberships.filter((row) => row.decision === "drop").length;
  if (!allowIncompleteAllDroppedResolution && splitProposalMemberships.length > 0) {
    const requiredSplitCounts = [
      ["exact_denominator.frozen_memberships", receipt.exact_denominator.frozen_memberships],
      ["exact_denominator.split_child_membership_proposals", receipt.exact_denominator.split_child_membership_proposals],
      ["checks.split_child_memberships_reviewed", receipt.checks.split_child_memberships_reviewed],
      ["checks.split_child_memberships_added", receipt.checks.split_child_memberships_added],
      ["checks.split_child_memberships_dropped", receipt.checks.split_child_memberships_dropped],
    ] as const;
    const missing = requiredSplitCounts
      .filter(([, value]) => value === undefined)
      .map(([field]) => field);
    if (missing.length > 0) {
      throw new Error(
        `receipt.json: terminal split-child decisions require explicit count fields: ${missing.join(", ")}.`,
      );
    }
  }
  const countBindings: Array<{
    actual: number;
    claimed: boolean | number | undefined;
    field: string;
  }> = [
    {
      actual: frozenMemberships.length,
      claimed: receipt.exact_denominator.frozen_memberships,
      field: "exact_denominator.frozen_memberships",
    },
    {
      actual: splitProposalMemberships.length,
      claimed: receipt.exact_denominator.split_child_membership_proposals,
      field: "exact_denominator.split_child_membership_proposals",
    },
    {
      actual: splitProposalMemberships.length,
      claimed: receipt.checks.split_child_memberships_reviewed,
      field: "checks.split_child_memberships_reviewed",
    },
    {
      actual: splitProposalAdds,
      claimed: receipt.checks.split_child_memberships_added,
      field: "checks.split_child_memberships_added",
    },
    {
      actual: splitProposalDrops,
      claimed: receipt.checks.split_child_memberships_dropped,
      field: "checks.split_child_memberships_dropped",
    },
    {
      actual: sourceOmissionRows.length,
      claimed: receipt.checks.source_omission_observations_added,
      field: "checks.source_omission_observations_added",
    },
    {
      actual: sourceOmissionAdditions.length,
      claimed: receipt.checks.source_omission_memberships_added,
      field: "checks.source_omission_memberships_added",
    },
    {
      actual: zeroResultRows.length,
      claimed: receipt.checks.source_omission_parent_zero_results,
      field: "checks.source_omission_parent_zero_results",
    },
  ];
  for (const binding of countBindings) {
    if (binding.claimed !== undefined && binding.claimed !== binding.actual) {
      throw new Error(`receipt.json: ${binding.field} differs from the explicit concept-audit rows.`);
    }
  }
  if (proposals.some((row) => row.kind !== "proposed_concept" || row.rationale.trim().length < 20)) {
    throw new Error("proposed-concepts.jsonl: invalid proposal row.");
  }
  if (
    axes.length !== receipt.exact_denominator.axes ||
    concepts.length !== receipt.exact_denominator.concepts ||
    memberships.length !== receipt.exact_denominator.memberships ||
    proposals.length !== receipt.exact_denominator.proposed_concepts
  ) {
    throw new Error("Concept-audit decisions do not equal their frozen denominator.");
  }
  return { axes, concepts, memberships, proposals, receipt };
}

function uniqueBy<T>(rows: readonly T[], identity: (row: T) => string) {
  const values = new Map<string, T>();
  for (const row of rows) values.set(identity(row), row);
  return [...values.values()];
}

export function buildOntologyVNextMembershipProposals({
  audit,
  observationReviewStatuses,
  splitMembershipProposalObservationIds,
}: {
  audit: OntologyConceptAudit;
  observationReviewStatuses: ReadonlyMap<string, ObservationReviewStatus>;
  splitMembershipProposalObservationIds: ReadonlyMap<string, readonly string[]>;
}): OntologyVNextMembershipProposal[] {
  return uniqueBy(
    audit.memberships
      .filter((row) => row.target_key.startsWith("membership:observation:"))
      .flatMap((row): OntologyVNextMembershipProposal[] => {
        if (!row.vnext_concept_id || !row.vnext_membership_id) return [];
        if (observationReviewStatuses.get(row.observation_id) === "accepted") return [];
        return [...(splitMembershipProposalObservationIds.get(row.observation_id) ?? [])]
          .filter((observationId) => observationReviewStatuses.get(observationId) === "accepted")
          .map((observationId) => {
            const membershipId = deriveOntologyVNextMembershipId(observationId, row.vnext_concept_id!);
            return {
              target_key: `membership:vnext:${membershipId}`,
              source_target_key: row.target_key,
              observation_id: observationId,
              concept_id: row.vnext_concept_id!,
              membership_id: membershipId,
            };
          });
      }),
    (proposal) => proposal.membership_id,
  ).sort((left, right) => compareStrings(left.membership_id, right.membership_id));
}

export function buildOntologyVNextFromConceptAudit({
  audit,
  observationReviewStatuses,
  splitMembershipProposalObservationIds = new Map<string, readonly string[]>(),
}: {
  audit: OntologyConceptAudit;
  observationReviewStatuses: ReadonlyMap<string, ObservationReviewStatus>;
  splitMembershipProposalObservationIds?: ReadonlyMap<string, readonly string[]>;
}) {
  const axes = uniqueBy(
    audit.axes.flatMap((row): OntologyVNextAxis[] =>
      row.vnext
        ? [{
            schema_version: 1,
            axis_id: row.vnext.axis_id,
            axis_key: row.vnext.axis_key,
            dimension: row.vnext.dimension,
            comparison_question: row.vnext.comparison_question,
          }]
        : [],
    ),
    (axis) => axis.axis_id,
  ).sort((left, right) => compareStrings(left.axis_id, right.axis_id));
  const concepts = uniqueBy(
    [
      ...audit.concepts.flatMap((row) => [row.vnext, ...row.split_targets].filter((value): value is AuditConcept => value !== null)),
      ...audit.proposals.map((row) => row.vnext),
    ].map((concept): OntologyVNextConcept => ({
      schema_version: 1,
      concept_id: concept.concept_id,
      axis_id: concept.axis_id,
      concept_key: concept.concept_key,
      definition: concept.definition,
      comparison_question: concept.comparison_question,
    })),
    (concept) => concept.concept_id,
  ).sort((left, right) => compareStrings(left.concept_id, right.concept_id));
  const proposals = buildOntologyVNextMembershipProposals({
    audit,
    observationReviewStatuses,
    splitMembershipProposalObservationIds,
  });
  const proposalIdsBySourceTarget = new Map<string, string[]>();
  for (const proposal of proposals) {
    const bucket = proposalIdsBySourceTarget.get(proposal.source_target_key) ?? [];
    bucket.push(proposal.membership_id);
    proposalIdsBySourceTarget.set(proposal.source_target_key, bucket);
  }
  for (const row of audit.memberships.filter((entry) => entry.target_key.startsWith("membership:observation:"))) {
    const expected = (proposalIdsBySourceTarget.get(row.target_key) ?? []).sort();
    const reviewed = [...(row.reviewed_proposal_membership_ids ?? [])].sort();
    if (canonicalJson(expected) !== canonicalJson(reviewed)) {
      throw new Error(`${row.target_key}: reviewed child proposal ids do not exactly equal the derived proposal set.`);
    }
  }
  const proposalsByTarget = new Map(proposals.map((row) => [row.target_key, row]));
  const reviewedProposals = audit.memberships.filter((row) => row.target_key.startsWith("membership:vnext:"));
  if (
    reviewedProposals.length !== proposals.length
    || reviewedProposals.some((row) => !proposalsByTarget.has(row.target_key))
  ) {
    throw new Error(
      `memberships.jsonl: explicit split-child decisions do not exactly equal the ${proposals.length}-item proposal denominator.`,
    );
  }
  for (const row of reviewedProposals) {
    const proposal = proposalsByTarget.get(row.target_key)!;
    if (
      row.observation_id !== proposal.observation_id
      || row.vnext_concept_id !== proposal.concept_id
      || row.vnext_membership_id !== proposal.membership_id
    ) {
      throw new Error(`${row.target_key}: split-child decision does not bind its derived proposal identity.`);
    }
  }
  const memberships = uniqueBy(
    audit.memberships.flatMap((row): OntologyVNextMembership[] => {
      if (row.decision === "drop" || row.decision === "split") return [];
      if (!row.vnext_concept_id || !row.vnext_membership_id) return [];
      const status = observationReviewStatuses.get(row.observation_id);
      if (status !== "accepted") return [];
      return [{
        schema_version: 1,
        membership_id: deriveOntologyVNextMembershipId(row.observation_id, row.vnext_concept_id),
        observation_id: row.observation_id,
        concept_id: row.vnext_concept_id!,
        assignment_basis: canonicalMembershipAssignmentBasis(row.rationale, audit.concepts),
      }];
    }),
    (membership) => membership.membership_id,
  ).sort((left, right) => compareStrings(left.membership_id, right.membership_id));
  const documents = renderOntologyVNextDocuments({ axes, concepts, memberships });
  const model = parseOntologyVNext(documents, { observationReviewStatuses });
  const expectedCounts = audit.receipt.canonical_vnext_counts;
  if (
    model.axes.length !== expectedCounts.axes
    || model.concepts.length !== expectedCounts.concepts
    || model.memberships.length !== expectedCounts.memberships
  ) {
    throw new Error(
      `receipt.json: canonical_vnext_counts does not match the explicit projection (${model.axes.length} axes, ${model.concepts.length} concepts, ${model.memberships.length} memberships).`,
    );
  }
  return { axes: [...model.axes], concepts: [...model.concepts], memberships: [...model.memberships], documents };
}

export function persistOntologyConceptAudit({
  sourceDirectory,
  packagePath,
  repoRoot = getRepoRoot(),
}: {
  sourceDirectory: string;
  packagePath: string;
  repoRoot?: string;
}) {
  const audit = readOntologyConceptAudit(sourceDirectory, { repoRoot });
  const relativeInputDirectory = "review-inputs/concept-first";
  const destinationDirectory = join(packagePath, relativeInputDirectory);
  mkdirSync(destinationDirectory, { recursive: true });
  const artifactFiles = Object.keys(audit.receipt.artifacts).sort(compareStrings);
  for (const file of artifactFiles) {
    if (file.startsWith("/") || file.split(/[\\/]/u).includes("..")) {
      throw new Error(`${RECEIPT_FILE}: unsafe artifact path ${file}.`);
    }
    mkdirSync(dirname(join(destinationDirectory, file)), { recursive: true });
    writeFileSync(join(destinationDirectory, file), readFileSync(join(sourceDirectory, file)));
  }
  writeFileSync(join(destinationDirectory, RECEIPT_FILE), readFileSync(join(sourceDirectory, RECEIPT_FILE)));
  const receiptPath = "wiki/review/2026-08-30-ontology-vnext-concept-audit.md";
  const frozenMemberships = audit.receipt.exact_denominator.frozen_memberships
    ?? audit.receipt.exact_denominator.memberships;
  const splitMembershipProposals = audit.receipt.exact_denominator.split_child_membership_proposals ?? 0;
  const receiptContent = [
    "# Ontology vNext concept-first audit receipt",
    "",
    `- snapshot: ${audit.receipt.audit_snapshot}`,
    `- baseline commit: ${audit.receipt.baseline_commit}`,
    "- source policy: frozen audit records, canonical observation records, and canonical Greek source references only; no translations read",
    `- denominator: ${audit.receipt.exact_denominator.axes} axes, ${audit.receipt.exact_denominator.concepts} concepts, ${frozenMemberships} frozen observation assignments, and ${splitMembershipProposals} split-child membership proposals`,
    "- each axis states one precise cross-dialogue comparison question",
    "- every concept, frozen membership, and split-child proposal has an item-level terminal decision and meaningful rationale",
    `- canonical vNext projection: ${audit.receipt.canonical_vnext_counts.axes} axes, ${audit.receipt.canonical_vnext_counts.concepts} concepts, ${audit.receipt.canonical_vnext_counts.memberships} memberships`,
    "- hard cut: no compatibility aliases, automatic split-child inheritance, or rejected-observation memberships",
    `- raw decision package: ${relativeInputDirectory}`,
    `- raw receipt SHA-256: ${sha256(readFileSync(join(sourceDirectory, RECEIPT_FILE)))}`,
    ...[...artifactFiles, RECEIPT_FILE].map((file) => {
      const artifactPath = join(packagePath, relativeInputDirectory, file).split("\\").join("/");
      return `- artifact: \`${artifactPath}\`; sha256: \`${sha256(readFileSync(join(sourceDirectory, file)))}\``;
    }),
    "",
  ].join("\n");
  mkdirSync(dirname(join(repoRoot, receiptPath)), { recursive: true });
  writeFileSync(join(repoRoot, receiptPath), receiptContent, "utf8");
  return { audit, receiptPath, relativeInputDirectory };
}

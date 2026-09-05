import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { getRepoRoot } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  fencedYamlRecordBlocks,
  replaceFencedYamlRecordBlocks,
  serializeCanonicalYamlRecord,
  type CanonicalYamlRecord,
  type CanonicalYamlValue,
} from "./fenced-record.js";
import { listOntologyAuditPackagePaths, type OntologyAuditFinding, type OntologyAuditSourceUnit } from "./ontology-audit.js";

type SemanticLane = "observation" | "claim" | "relation" | "commentary" | "voice";

type MutableLedgerRecord = {
  key: string;
  lane: SemanticLane;
  id: string;
  dialogue: string;
  path: string;
  ordinal: number;
  record: Record<string, CanonicalYamlValue>;
};

export type LegacyCommentaryQualityAuditRetirement = {
  dialogue: string;
  source_path: string;
  archive_path: string;
  sha256: string;
  disposition: "retire_stale_peer_acceptance";
  rationale: string;
};

export type SemanticRemediationPlan = {
  files: Array<{ path: string; content: string }>;
  splitOverlay: { content: string; sha256: string; sourcePath: string };
  omissionOverlay: { content: string; sha256: string; sourcePath: string };
  relationOverlay: { content: string; sha256: string; sourcePath: string };
  commentaryAuditRetirements: LegacyCommentaryQualityAuditRetirement[];
  replacementTargets: Map<string, string[]>;
  findingResolutions: Map<string, string>;
  additions: Array<{ key: string; reason: string; findingIds: string[] }>;
  decisions: Array<{
    target_key: string;
    action: string;
    rationale: string;
    finding_ids: string[];
    replacement_target_keys: string[];
  }>;
  counts: {
    records: number;
    findings: number;
    greekTermsRemoved: number;
    claimsLinked: number;
    claimsRejectedWithoutEvidence: number;
    recordsRejected: number;
    recordsSplit: number;
    splitReplacements: number;
    omissionObservationsAdded: number;
    claimEvidenceObservationsAdded: number;
    commentaryCitationsAdded: number;
    commentaryCitationsRemapped: number;
    commentaryKindsRetyped: number;
    commentaryQualityAuditsRetired: number;
    commentaryRejectedWithoutCitation: number;
    relationDependenciesReviewed: number;
    relationsRevisedForReplacementClaims: number;
    relationsRejectedForInvalidEndpoints: number;
    relationsRejectedForInvalidResolution: number;
    claimObservationLinksPruned: number;
    observationClaimLinksRebuilt: number;
    claimsRejectedAfterEvidenceClosure: number;
    rejectedRecordProseReferencesRewritten: number;
    recordingsWithdrawnForRejectedChapters: number;
    recordingRejectedChapterTargets: number;
    sourceSpanCorrections: number;
    claimKindCorrections: number;
    claimStatusCorrections: number;
  };
};

type AtomicSplitReplacement = {
  text: string;
  stephanus_span: string;
  textual_basis?: string;
  limits?: string;
  claim_metadata?: AtomicSplitClaimMetadata;
};

type AtomicSplitStanceEvent = {
  kind: string;
  stephanus_span: string;
};

type AtomicSplitSpeakerSourceRef = {
  source_path: string;
  start_char: number;
  end_char: number;
  text_sha256: string;
};

export type AtomicSplitClaimMetadata = {
  speaker: string;
  claim_kind: string;
  stance_events: AtomicSplitStanceEvent[];
  speaker_source_ref: AtomicSplitSpeakerSourceRef | null;
};

type AtomicSplitOverlayRow = {
  target_key: string;
  lane: "observation" | "claim";
  rationale: string;
  replacements: AtomicSplitReplacement[];
  existing_replacement_targets?: string[];
};

type SourceOmissionObservation = {
  text: string;
  stephanus_span: string;
  textual_basis?: string;
  limits?: string;
};

type SourceOmissionOverlayRow = {
  finding_ids: string[];
  retain_split_finding_ids: string[];
  source_unit_keys: string[];
  rationale: string;
  observations: SourceOmissionObservation[];
};

type RelationDependencyReplacement = {
  claim_a: string;
  claim_b: string;
  relation_kind: string;
  resolution: string;
  basis: string;
  limits: string;
};

type RelationDependencyOverlayRow = {
  relation_id: string;
  decision: "revise" | "reject";
  rationale: string;
  replacements: RelationDependencyReplacement[];
};

const LANE_CONFIG: Record<SemanticLane, { directory: string; idField: string }> = {
  observation: { directory: "wiki/observations", idField: "observation_id" },
  claim: { directory: "wiki/claims", idField: "claim_id" },
  relation: { directory: "wiki/relations", idField: "relation_id" },
  commentary: { directory: "wiki/commentary", idField: "commentary_id" },
  voice: { directory: "wiki/voices", idField: "voice_id" },
};

const REJECT_OBSERVATION_DEFECTS = new Set([
  "interpretive_irony_observation",
  "interpretive_irony_in_extraction",
  "non_neutral_observation",
  "observation_non_neutral",
  "observation_overstates_source",
  "projection_identity_conflict",
  "projection_identity_duplicate",
  "source_contradiction",
  "source_exceeds_cited_inference",
  "source_overstatement",
  "unsupported_observation",
]);
const REJECT_CLAIM_DEFECTS = new Set([
  "claim_limits_contradict_adjacent_source",
  "claim_source_anchor_mismatch",
  "claim_stance_event_overstates_source",
  "non_neutral_claim",
  "source_contradiction",
  "source_exceeds_cited_inference",
  "unsupported_claim",
]);
const REJECT_RELATION_PATTERN = /(?:accepted_non_relation|compatible_claims_mislabeled_tension|compatible_levels_mislabeled_tension|compatibility_not_semantic_relation|different_frameworks_mislabeled_tension|false_relation|hypothetical_premise_not_semantic_tension|inferred_pressure_not_textual_relation|lexical_overlap_not_semantic_relation|lexical_pseudo_relation|non_relation|rejected_review|relation_basis_mismatch|relation_kind|relation_resolution_mismatch|schema_compliance_non_relation|topic_overlap_not_semantic_relation|unsupported_semantic_relation)/u;
const CLAIM_KIND_VALUES = new Set(["definition", "thesis", "method_rule", "report"]);
const CLAIM_FINAL_STATUS_BY_STANCE = new Map([
  ["asserted", "left_standing"],
  ["reaffirmed", "left_standing"],
  ["reported", "left_standing"],
  ["posed_for_examination", "posed_only"],
  ["challenged", "unresolved_challenge"],
  ["refuted_conceded", "refuted"],
  ["revised", "revised"],
  ["withdrawn", "withdrawn"],
]);

const SOURCE_SPAN_OVERRIDES = new Map<string, string>([
  ["record:claim:claim_crito_0034", "51a-51b"],
  ["record:claim:claim_crito_0051", "54d"],
  ["record:claim:claim_euthyphro_0002", "4e"],
  ["record:claim:claim_euthyphro_0003", "5a-5c"],
  ["record:claim:claim_euthyphro_0004", "5c"],
  ["record:claim:claim_euthyphro_0012", "6d-6e"],
  ["record:claim:claim_ion_0004", "531c-531d"],
  ["record:claim:claim_lesser-hippias_0015", "376a"],
  ["record:claim:claim_menexenus_0028", "247b"],
  ["record:commentary:comm_menexenus_0002", "235d-236c"],
  ["record:commentary:comm_menexenus_0003", "236d-237c"],
  ["record:observation:obs_critias_0084", "119b"],
  ["record:observation:obs_critias_0085", "119b"],
  ["record:observation:obs_critias_0086", "119c"],
  ["record:observation:obs_lesser-hippias_0075", "375d"],
  ["record:observation:obs_lesser-hippias_0076", "375d"],
  ["record:observation:obs_menexenus_0018", "236d-237a"],
]);

const SOURCE_SPAN_DECISION_RATIONALES = new Map<string, string>([
  [
    "record:commentary:comm_menexenus_0002",
    "Shortened the preceding section to 236c so the 236d source unit belongs exactly once to the audited section where the embedded funeral oration begins; this removes the section overlap without changing the historical commentary body or implying textual absence.",
  ],
]);

const REJECTED_EMPTY_CROSSREF_RETYPES = new Map<string, { from: string; to: string; rationale: string }>([
  [
    "record:commentary:comm_symposium_0046",
    {
      from: "crossref",
      to: "argument",
      rationale: "Retyped the rejected presentation block as an argument after its sole claim citation was terminally rejected and removed; the body remains rejected review provenance, while an invalid empty cross-reference block cannot survive the hard cut.",
    },
  ],
]);

const CLAIM_KIND_OVERRIDES = new Map<string, string>([
  ["record:claim:claim_crito_0052", "thesis"],
  ["record:claim:claim_menexenus_0019", "report"],
  ["record:claim:claim_menexenus_0023", "report"],
]);

const CLAIM_STATUS_OVERRIDES = new Map<string, { kind: string; span: string; finalStatus: string }>([
  ["record:claim:claim_euthyphro_0007", { kind: "refuted_conceded", span: "6d", finalStatus: "refuted" }],
  ["record:claim:claim_euthyphro_0014", { kind: "refuted_conceded", span: "8a", finalStatus: "refuted" }],
  ["record:claim:claim_euthyphro_0024", { kind: "refuted_conceded", span: "10d-11a", finalStatus: "refuted" }],
  ["record:claim:claim_euthyphro_0035", { kind: "revised", span: "13d", finalStatus: "revised" }],
  ["record:claim:claim_euthyphro_0042", { kind: "refuted_conceded", span: "15b-15c", finalStatus: "refuted" }],
  ["record:claim:claim_euthyphro_0043", { kind: "refuted_conceded", span: "15b-15c", finalStatus: "refuted" }],
  ["record:claim:claim_euthyphro_0045", { kind: "withdrawn", span: "15b", finalStatus: "withdrawn" }],
  ["record:claim:claim_euthyphro_0050", { kind: "refuted_conceded", span: "15b-15c", finalStatus: "refuted" }],
  ["record:claim:claim_euthyphro_0051", { kind: "refuted_conceded", span: "15b-15c", finalStatus: "refuted" }],
  ["record:claim:claim_meno_0004", { kind: "challenged", span: "72a", finalStatus: "unresolved_challenge" }],
  ["record:claim:claim_meno_0026", { kind: "refuted_conceded", span: "79a-79e", finalStatus: "refuted" }],
  ["record:claim:claim_meno_0035", { kind: "refuted_conceded", span: "79a-79e", finalStatus: "refuted" }],
  ["record:claim:claim_meno_0047", { kind: "withdrawn", span: "98b", finalStatus: "withdrawn" }],
]);

const DUPLICATE_REPLACEMENTS = new Map<string, string[]>([
  ["record:claim:claim_crito_0012", ["record:claim:claim_crito_0013"]],
  ["record:observation:obs_menexenus_0088", ["record:voice:voice_menexenus_0026"]],
  ["record:observation:obs_menexenus_0089", ["record:voice:voice_menexenus_0029"]],
  ["record:observation:obs_menexenus_0097", ["record:voice:voice_menexenus_0029"]],
]);

const REJECTED_RECORD_PROSE_OVERRIDES = new Map<string, {
  field: "limits";
  expectedSha256: string;
  rejectedIds: readonly string[];
  value: string;
  rationale: string;
}>([
  ["record:observation:obs_charmides_0140", {
    field: "limits",
    expectedSha256: "8087e7b64fec460d16d7b641367ab71bd2937bb16abab948c8bca7ff1ec2ed9c",
    rejectedIds: ["obs_charmides_0141"],
    value: "This does not establish the answer as correct; the accusation and master-craft distinction that follow are outside this observation's scope.",
    rationale: "Revised the scope statement to name the adjacent source topics directly instead of treating a rejected peer observation as reader-visible evidence.",
  }],
  ["record:observation:obs_critias_0001", {
    field: "limits",
    expectedSha256: "3536c9f8235434d498499f8348d7315fe0efbaae3fc7196cfba375496e5af595",
    rejectedIds: ["obs_critias_0002"],
    value: "This observation records only the turn-transition relief marker and handoff formula. It does not address the prayer content or Critias's mirrored indulgence request.",
    rationale: "Revised the scope statement to describe excluded source content directly instead of citing a split and rejected peer observation.",
  }],
  ["record:observation:obs_critias_0017", {
    field: "limits",
    expectedSha256: "451e38bb8868dee82e526766000618650002ad6f166a5d68071246df9e222e24",
    rejectedIds: ["obs_critias_0018"],
    value: "This observation records only the no-strife divine allotment mechanism. It does not address the Hephaestus and Athena pairing or the shepherd and steering governance images.",
    rationale: "Revised the scope statement to describe excluded source images directly instead of citing a split and rejected peer observation.",
  }],
  ["record:observation:obs_critias_0083", {
    field: "limits",
    expectedSha256: "77b1fa9357e21a8794cc750e7c26b7641a21ee469ced3459d891269632fe8c29",
    rejectedIds: ["obs_critias_0084"],
    value: "This records only the fractional chariot quota. It does not assess military realism or symbolic number patterning, and it does not cover the broader unit catalogue that follows.",
    rationale: "Revised the scope statement to delimit the cited quota directly instead of treating a rejected overbroad peer observation as reader-visible evidence.",
  }],
]);

const REJECT_COMMENTARY_DEFECTS = new Set([
  "commentary_source_mismatch",
  "commentary_source_overreach",
]);

function isRecord(value: CanonicalYamlValue | undefined): value is CanonicalYamlRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function scalar(record: CanonicalYamlRecord, field: string) {
  const value = record[field];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";
}

function number(record: CanonicalYamlRecord, field: string) {
  const value = Number(scalar(record, field));
  return Number.isInteger(value) ? value : undefined;
}

function cloneRecord(record: CanonicalYamlRecord): Record<string, CanonicalYamlValue> {
  return JSON.parse(JSON.stringify(record)) as Record<string, CanonicalYamlValue>;
}

function applySourceSpan(record: MutableLedgerRecord, span: string) {
  const resolution = resolveSourceSpan(record.dialogue, span);
  record.record.stephanus_span = resolution.source_ref.stephanus_span;
  record.record.source_ref = resolution.source_ref as unknown as CanonicalYamlValue;
}

function appendClaimStatusEvent(
  record: MutableLedgerRecord,
  override: { kind: string; span: string; finalStatus: string },
) {
  const resolution = resolveSourceSpan(record.dialogue, override.span);
  const events = Array.isArray(record.record.stance_events)
    ? [...record.record.stance_events]
    : [];
  const alreadyPresent = events.some((value) =>
    isRecord(value)
    && scalar(value, "kind") === override.kind
    && scalar(value, "stephanus_span") === resolution.source_ref.stephanus_span
  );
  if (!alreadyPresent) {
    events.push({
      kind: override.kind,
      stephanus_span: resolution.source_ref.stephanus_span,
      source_ref: resolution.source_ref as unknown as CanonicalYamlValue,
    });
  }
  record.record.stance_events = events;
  record.record.final_status = override.finalStatus;
}

/**
 * A split claim is a new semantic record, not a prose-only clone. Replace its
 * owner, kind, stance trajectory, terminal state, and optional exact ownership
 * range together so no parent attribution can leak into an atomic child.
 */
export function applyAtomicClaimMetadata(
  record: Record<string, CanonicalYamlValue>,
  dialogue: string,
  metadata: AtomicSplitClaimMetadata,
) {
  record.speaker = metadata.speaker;
  record.claim_kind = metadata.claim_kind;
  record.stance_events = metadata.stance_events.map((event) => {
    const resolution = resolveSourceSpan(dialogue, event.stephanus_span);
    return {
      kind: event.kind,
      stephanus_span: resolution.source_ref.stephanus_span,
      source_ref: resolution.source_ref as unknown as CanonicalYamlValue,
    };
  });
  record.final_status = CLAIM_FINAL_STATUS_BY_STANCE.get(metadata.stance_events.at(-1)!.kind)!;
  if (metadata.speaker_source_ref === null) delete record.speaker_source_ref;
  else record.speaker_source_ref = cloneRecord(metadata.speaker_source_ref as unknown as CanonicalYamlRecord);
}

function canonicalFence(record: CanonicalYamlRecord) {
  return `\`\`\`yaml\n${serializeCanonicalYamlRecord(record).trimEnd()}\n\`\`\``;
}

function markdownPaths(repoRoot: string, directory: string) {
  const absolute = join(repoRoot, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(absolute, entry.name))
    .sort();
}

function parseLedgers(repoRoot: string) {
  const records: MutableLedgerRecord[] = [];
  const originalByPath = new Map<string, string>();
  for (const [lane, config] of Object.entries(LANE_CONFIG) as Array<[SemanticLane, (typeof LANE_CONFIG)[SemanticLane]]>) {
    for (const absolutePath of markdownPaths(repoRoot, config.directory)) {
      const path = relative(repoRoot, absolutePath);
      const dialogue = /\/([^/]+)\.md$/u.exec(absolutePath)?.[1] ?? "";
      const content = readFileSync(absolutePath, "utf8");
      originalByPath.set(path, content);
      for (const block of fencedYamlRecordBlocks(content)) {
        const id = scalar(block.record, config.idField);
        if (!id) throw new Error(`${path}: block ${block.index + 1} has no ${config.idField}.`);
        records.push({
          key: `record:${lane}:${id}`,
          lane,
          id,
          dialogue,
          path,
          ordinal: block.index,
          record: cloneRecord(block.record),
        });
      }
    }
  }
  return { records, originalByPath };
}

function readJsonl<T>(path: string): T[] {
  const content = readFileSync(path, "utf8");
  return content.split(/\r?\n/u).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line) as T;
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function assertExactObjectKeys(value: unknown, allowed: readonly string[], context: string) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context}: expected a JSON object.`);
  }
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(value).filter((key) => !allowedSet.has(key)).sort();
  if (unknown.length > 0) throw new Error(`${context}: unknown field(s): ${unknown.join(", ")}.`);
}

function sourceRef(record: CanonicalYamlRecord) {
  const value = record.source_ref;
  if (!isRecord(value)) return undefined;
  const sourcePath = scalar(value, "source_path");
  const startChar = number(value, "start_char");
  const endChar = number(value, "end_char");
  if (!sourcePath || startChar === undefined || endChar === undefined || endChar <= startChar) return undefined;
  return { sourcePath, startChar, endChar };
}

function sanitizeGreekTerms(record: MutableLedgerRecord, repoRoot: string) {
  const terms = record.record.greek_terms;
  const ref = sourceRef(record.record);
  if (terms === "" || terms === null) {
    record.record.greek_terms = [];
    return 0;
  }
  if (terms !== undefined && !Array.isArray(terms)) {
    throw new Error(`${record.key}: greek_terms must be a canonical list, not ${typeof terms}.`);
  }
  if (!Array.isArray(terms) || !ref) return 0;
  const source = readFileSync(join(repoRoot, ref.sourcePath), "utf8").slice(ref.startChar, ref.endChar);
  const retained = terms.filter((term) => typeof term === "string" && source.includes(term));
  record.record.greek_terms = retained;
  return terms.length - retained.length;
}

function nextIds(records: readonly MutableLedgerRecord[]) {
  const next = new Map<string, number>();
  for (const record of records) {
    const match = /_(\d{4})$/u.exec(record.id);
    if (!match) continue;
    const key = `${record.lane}:${record.dialogue}`;
    next.set(key, Math.max(next.get(key) ?? 0, Number(match[1])));
  }
  return (lane: SemanticLane, dialogue: string) => {
    const key = `${lane}:${dialogue}`;
    const value = (next.get(key) ?? 0) + 1;
    next.set(key, value);
    const prefix = lane === "observation" ? "obs" : lane;
    return `${prefix}_${dialogue}_${String(value).padStart(4, "0")}`;
  };
}

function readAtomicSplitOverlay(
  path: string,
  expected: ReadonlyMap<string, MutableLedgerRecord>,
  allRecords: ReadonlyMap<string, MutableLedgerRecord>,
  repoRoot: string,
) {
  if (!existsSync(path)) {
    if (expected.size === 0) return { rows: new Map<string, AtomicSplitOverlayRow>(), content: "", sha256: createHash("sha256").update("").digest("hex") };
    throw new Error(`Missing exhaustive Greek-source atomic split overlay: ${path}`);
  }
  const parsed = readJsonl<AtomicSplitOverlayRow>(path);
  const rows = new Map<string, AtomicSplitOverlayRow>();
  for (const [rowIndex, row] of parsed.entries()) {
    assertExactObjectKeys(
      row,
      ["target_key", "lane", "rationale", "replacements", "existing_replacement_targets"],
      `${path}:${rowIndex + 1}`,
    );
    const target = expected.get(row.target_key);
    if (!target) throw new Error(`${path}: unexpected or ineligible split target ${row.target_key}.`);
    if (rows.has(row.target_key)) throw new Error(`${path}: duplicate split target ${row.target_key}.`);
    if (row.lane !== target.lane) throw new Error(`${path}: ${row.target_key} declares lane ${row.lane}, expected ${target.lane}.`);
    if (typeof row.rationale !== "string" || row.rationale.trim().length < 20) {
      throw new Error(`${path}: ${row.target_key} requires a meaningful source-bound rationale.`);
    }
    if (!Array.isArray(row.replacements) || row.replacements.length < 2) {
      throw new Error(`${path}: ${row.target_key} requires at least two atomic replacements.`);
    }
    const existingReplacementTargets = row.existing_replacement_targets ?? [];
    if (!Array.isArray(existingReplacementTargets)) {
      throw new Error(`${path}: ${row.target_key} existing_replacement_targets must be an array.`);
    }
    if (new Set(existingReplacementTargets).size !== existingReplacementTargets.length) {
      throw new Error(`${path}: ${row.target_key} repeats an existing replacement target.`);
    }
    for (const replacementTarget of existingReplacementTargets) {
      if (typeof replacementTarget !== "string" || replacementTarget === row.target_key) {
        throw new Error(`${path}: ${row.target_key} has an invalid existing replacement target.`);
      }
      const replacementRecord = allRecords.get(replacementTarget);
      if (!replacementRecord || replacementRecord.lane !== target.lane || !accepted(replacementRecord)) {
        throw new Error(`${path}: ${row.target_key} existing replacement ${replacementTarget} is not an accepted ${target.lane} record.`);
      }
      const parentRef = sourceRef(target.record);
      const replacementRef = sourceRef(replacementRecord.record);
      if (
        !parentRef
        || !replacementRef
        || parentRef.sourcePath !== replacementRef.sourcePath
        || replacementRef.startChar < parentRef.startChar
        || replacementRef.endChar > parentRef.endChar
      ) {
        throw new Error(`${path}: ${row.target_key} existing replacement ${replacementTarget} is not contained in the cited parent evidence interval.`);
      }
    }
    const texts = new Set<string>();
    for (const [index, replacement] of row.replacements.entries()) {
      assertExactObjectKeys(
        replacement,
        ["text", "stephanus_span", "textual_basis", "limits", "claim_metadata"],
        `${path}:${rowIndex + 1}: replacement ${index + 1}`,
      );
      if (typeof replacement.text !== "string" || replacement.text.trim().length < 20) {
        throw new Error(`${path}: ${row.target_key} replacement ${index + 1} has no meaningful neutral textual fact.`);
      }
      if (texts.has(replacement.text.trim())) {
        throw new Error(`${path}: ${row.target_key} repeats replacement text ${index + 1}.`);
      }
      texts.add(replacement.text.trim());
      if (typeof replacement.stephanus_span !== "string" || !/^\d+[a-e](?:-\d*[a-e])?$/u.test(replacement.stephanus_span)) {
        throw new Error(`${path}: ${row.target_key} replacement ${index + 1} requires an explicit valid Stephanus span.`);
      }
      if (target.lane === "observation") {
        if (replacement.claim_metadata !== undefined) {
          throw new Error(`${path}: ${row.target_key} replacement ${index + 1} must not carry claim metadata.`);
        }
        continue;
      }

      const metadata = replacement.claim_metadata;
      const context = `${path}: ${row.target_key} replacement ${index + 1}`;
      if (metadata === undefined) throw new Error(`${context} requires explicit claim_metadata.`);
      assertExactObjectKeys(metadata, ["speaker", "claim_kind", "stance_events", "speaker_source_ref"], `${context} claim_metadata`);
      if (typeof metadata.speaker !== "string" || metadata.speaker.trim().length === 0) {
        throw new Error(`${context} requires an explicit Greek-source claim speaker.`);
      }
      if (typeof metadata.claim_kind !== "string" || !CLAIM_KIND_VALUES.has(metadata.claim_kind)) {
        throw new Error(`${context} has invalid claim_kind ${String(metadata.claim_kind)}.`);
      }
      if (!Array.isArray(metadata.stance_events) || metadata.stance_events.length === 0) {
        throw new Error(`${context} requires at least one explicit stance event.`);
      }
      let previousStart = -1;
      for (const [eventIndex, event] of metadata.stance_events.entries()) {
        assertExactObjectKeys(event, ["kind", "stephanus_span"], `${context} stance event ${eventIndex + 1}`);
        if (typeof event.kind !== "string" || !CLAIM_FINAL_STATUS_BY_STANCE.has(event.kind)) {
          throw new Error(`${context} stance event ${eventIndex + 1} has invalid kind ${String(event.kind)}.`);
        }
        if (typeof event.stephanus_span !== "string" || !/^\d+[a-e](?:-\d*[a-e])?$/u.test(event.stephanus_span)) {
          throw new Error(`${context} stance event ${eventIndex + 1} requires an explicit valid Stephanus span.`);
        }
        const eventRef = resolveSourceSpan(target.dialogue, event.stephanus_span).source_ref;
        if (eventRef.start_char < previousStart) throw new Error(`${context} stance events are not in source order.`);
        previousStart = eventRef.start_char;
      }
      if (!Object.hasOwn(metadata, "speaker_source_ref")) {
        throw new Error(`${context} must explicitly set speaker_source_ref to exact evidence or null.`);
      }
      if (metadata.speaker_source_ref !== null) {
        const speakerRef = metadata.speaker_source_ref;
        assertExactObjectKeys(
          speakerRef,
          ["source_path", "start_char", "end_char", "text_sha256"],
          `${context} speaker_source_ref`,
        );
        const claimRef = resolveSourceSpan(target.dialogue, replacement.stephanus_span).source_ref;
        const expectedSourcePath = `raw/plato/greek/${target.dialogue}.txt`;
        if (
          speakerRef.source_path !== expectedSourcePath
          || !Number.isInteger(speakerRef.start_char)
          || !Number.isInteger(speakerRef.end_char)
          || speakerRef.start_char < claimRef.start_char
          || speakerRef.end_char <= speakerRef.start_char
          || speakerRef.end_char > claimRef.end_char
          || !/^[a-f0-9]{64}$/u.test(speakerRef.text_sha256)
        ) {
          throw new Error(`${context} speaker_source_ref is not an exact contained canonical Greek range.`);
        }
        const source = readFileSync(join(repoRoot, speakerRef.source_path), "utf8");
        const actualHash = createHash("sha256")
          .update(source.slice(speakerRef.start_char, speakerRef.end_char))
          .digest("hex");
        if (actualHash !== speakerRef.text_sha256) {
          throw new Error(`${context} speaker_source_ref hash does not match canonical Greek bytes.`);
        }
      }
    }
    rows.set(row.target_key, {
      ...row,
      ...(existingReplacementTargets.length === 0
        ? {}
        : { existing_replacement_targets: [...existingReplacementTargets].sort() }),
    });
  }
  const missing = [...expected.keys()].filter((key) => !rows.has(key)).sort();
  if (missing.length > 0) {
    throw new Error(`${path}: atomic split overlay omits ${missing.length} target(s): ${missing.slice(0, 10).join(", ")}`);
  }
  const content = parsed.length === 0
    ? ""
    : `${[...parsed].sort((left, right) => left.target_key.localeCompare(right.target_key)).map(canonicalJson).join("\n")}\n`;
  return { rows, content, sha256: createHash("sha256").update(content).digest("hex") };
}

function isSourceOmissionFinding(finding: OntologyAuditFinding) {
  return (
    (finding.proposed_action === "add" || /(?:missing|omitted)_source_bound_observation/u.test(finding.defect_class))
    && !finding.target_keys.some((target) => target.startsWith("record:claim:"))
  );
}

function canBeSourceOmissionFinding(finding: OntologyAuditFinding) {
  return (
    isSourceOmissionFinding(finding)
    || /(?:source.*omission|semantic_omission|source_fact_omission)/u.test(finding.defect_class)
  );
}

function readSourceOmissionOverlay(
  path: string,
  findings: readonly OntologyAuditFinding[],
  sourceByKey: ReadonlyMap<string, OntologyAuditSourceUnit>,
) {
  const required = new Map(findings.filter(isSourceOmissionFinding).map((finding) => [finding.finding_id, finding]));
  const candidates = new Map(findings.filter(canBeSourceOmissionFinding).map((finding) => [finding.finding_id, finding]));
  if (!existsSync(path)) {
    if (required.size === 0) {
      return {
        rows: [] as SourceOmissionOverlayRow[],
        content: "",
        sha256: createHash("sha256").update("").digest("hex"),
        claimedFindingIds: new Set<string>(),
        retainedSplitFindingIds: new Set<string>(),
      };
    }
    throw new Error(`Missing exhaustive Greek-source omission overlay: ${path}`);
  }
  const parsed = readJsonl<SourceOmissionOverlayRow>(path);
  const seenFindings = new Set<string>();
  const retainedSplitFindingIds = new Set<string>();
  const rows = parsed.map((raw, rowIndex): SourceOmissionOverlayRow => {
    assertExactObjectKeys(
      raw,
      ["finding_ids", "retain_split_finding_ids", "source_unit_keys", "rationale", "observations"],
      `${path}:${rowIndex + 1}`,
    );
    if (!Array.isArray(raw.finding_ids) || raw.finding_ids.length === 0) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row requires finding_ids.`);
    }
    const findingIds = [...new Set(raw.finding_ids)].sort();
    if (findingIds.length !== raw.finding_ids.length) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row repeats a finding id.`);
    }
    const rowFindings = findingIds.map((findingId) => {
      const finding = candidates.get(findingId);
      if (!finding) throw new Error(`${path}:${rowIndex + 1}: unexpected source omission finding ${findingId}.`);
      if (seenFindings.has(findingId)) throw new Error(`${path}:${rowIndex + 1}: duplicate source omission finding ${findingId}.`);
      seenFindings.add(findingId);
      return finding;
    });
    if (!Array.isArray(raw.retain_split_finding_ids)) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row requires retain_split_finding_ids (use [] when none).`);
    }
    const retainSplitFindingIds = [...new Set(raw.retain_split_finding_ids)].sort();
    if (retainSplitFindingIds.length !== raw.retain_split_finding_ids.length) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row repeats a retained split finding id.`);
    }
    for (const findingId of retainSplitFindingIds) {
      if (!findingIds.includes(findingId)) {
        throw new Error(`${path}:${rowIndex + 1}: retained split finding ${findingId} is absent from finding_ids.`);
      }
      const finding = candidates.get(findingId)!;
      if (finding.proposed_action !== "split") {
        throw new Error(`${path}:${rowIndex + 1}: ${findingId} is not a split finding.`);
      }
      retainedSplitFindingIds.add(findingId);
    }
    if (typeof raw.rationale !== "string" || raw.rationale.trim().length < 20) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row requires a meaningful rationale.`);
    }
    if (!Array.isArray(raw.observations) || raw.observations.length === 0) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row requires at least one observation.`);
    }
    if (!Array.isArray(raw.source_unit_keys) || raw.source_unit_keys.length === 0) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row requires explicit source_unit_keys.`);
    }
    const sourceUnitKeys = [...new Set(raw.source_unit_keys)].sort();
    if (sourceUnitKeys.length !== raw.source_unit_keys.length) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row repeats a source unit key.`);
    }
    const units = sourceUnitKeys.map((key) => {
      const unit = sourceByKey.get(key);
      if (!unit) throw new Error(`${path}:${rowIndex + 1}: unknown source unit ${key}.`);
      return unit;
    });
    if (units.length === 0) throw new Error(`${path}:${rowIndex + 1}: source omission row has no resolvable source units.`);
    const dialogues = new Set(units.map((unit) => unit.dialogue));
    const findingDialogues = new Set(
      rowFindings
        .flatMap((finding) => finding.source_unit_keys.map((key) => sourceByKey.get(key)?.dialogue))
        .filter((value): value is string => Boolean(value)),
    );
    const sourcePaths = new Set(units.map((unit) => unit.source_path));
    if (dialogues.size !== 1 || findingDialogues.size !== 1 || [...dialogues][0] !== [...findingDialogues][0] || sourcePaths.size !== 1) {
      throw new Error(`${path}:${rowIndex + 1}: source omission row crosses dialogue or source boundaries.`);
    }
    const dialogue = units[0]!.dialogue;
    const sourcePath = units[0]!.source_path;
    const minimumStart = Math.min(...units.map((unit) => unit.start_char));
    const maximumEnd = Math.max(...units.map((unit) => unit.end_char));
    const texts = new Set<string>();
    const observations = raw.observations.map((observation, observationIndex): SourceOmissionObservation => {
      assertExactObjectKeys(
        observation,
        ["text", "stephanus_span", "textual_basis", "limits"],
        `${path}:${rowIndex + 1}: observation ${observationIndex + 1}`,
      );
      if (typeof observation.text !== "string" || observation.text.trim().length < 20) {
        throw new Error(`${path}:${rowIndex + 1}: observation ${observationIndex + 1} has no meaningful neutral textual fact.`);
      }
      if (texts.has(observation.text.trim())) {
        throw new Error(`${path}:${rowIndex + 1}: observation ${observationIndex + 1} repeats a textual fact.`);
      }
      texts.add(observation.text.trim());
      if (typeof observation.stephanus_span !== "string" || !/^\d+[a-e](?:-\d*[a-e])?$/u.test(observation.stephanus_span)) {
        throw new Error(`${path}:${rowIndex + 1}: observation ${observationIndex + 1} requires an explicit valid Stephanus span.`);
      }
      const resolution = resolveSourceSpan(dialogue, observation.stephanus_span);
      const ref = resolution.source_ref;
      if (ref.source_path !== sourcePath || ref.start_char < minimumStart || ref.end_char > maximumEnd) {
        throw new Error(`${path}:${rowIndex + 1}: observation ${observationIndex + 1} span ${observation.stephanus_span} falls outside its audited source units.`);
      }
      return {
        text: observation.text.trim(),
        stephanus_span: observation.stephanus_span,
        ...(observation.textual_basis === undefined ? {} : { textual_basis: observation.textual_basis.trim() }),
        ...(observation.limits === undefined ? {} : { limits: observation.limits.trim() }),
      };
    });
    return {
      finding_ids: findingIds,
      retain_split_finding_ids: retainSplitFindingIds,
      source_unit_keys: sourceUnitKeys,
      rationale: raw.rationale.trim(),
      observations,
    };
  });
  const missing = [...required.keys()].filter((findingId) => !seenFindings.has(findingId)).sort();
  if (missing.length > 0) {
    throw new Error(`${path}: source omission overlay omits ${missing.length} finding(s): ${missing.slice(0, 10).join(", ")}`);
  }
  rows.sort((left, right) => left.finding_ids[0]!.localeCompare(right.finding_ids[0]!));
  const content = rows.length === 0 ? "" : `${rows.map(canonicalJson).join("\n")}\n`;
  return {
    rows,
    content,
    sha256: createHash("sha256").update(content).digest("hex"),
    claimedFindingIds: seenFindings,
    retainedSplitFindingIds,
  };
}

function readRelationDependencyOverlay(
  path: string,
  expected: ReadonlyMap<string, MutableLedgerRecord>,
) {
  if (!existsSync(path)) {
    if (expected.size === 0) {
      return {
        rows: new Map<string, RelationDependencyOverlayRow>(),
        content: "",
        sha256: createHash("sha256").update("").digest("hex"),
      };
    }
    throw new Error(`Missing exhaustive split-claim relation dependency overlay: ${path}`);
  }
  const parsed = readJsonl<RelationDependencyOverlayRow>(path);
  const rows = new Map<string, RelationDependencyOverlayRow>();
  for (const [rowIndex, row] of parsed.entries()) {
    const context = `${path}:${rowIndex + 1}`;
    assertExactObjectKeys(row, ["relation_id", "decision", "rationale", "replacements"], context);
    const relation = expected.get(row.relation_id);
    if (!relation) throw new Error(`${context}: unexpected relation dependency ${row.relation_id}.`);
    if (rows.has(row.relation_id)) throw new Error(`${context}: duplicate relation dependency ${row.relation_id}.`);
    if (row.decision !== "revise" && row.decision !== "reject") {
      throw new Error(`${context}: decision must be revise or reject.`);
    }
    if (typeof row.rationale !== "string" || row.rationale.trim().length < 20) {
      throw new Error(`${context}: relation dependency requires a meaningful item-level rationale.`);
    }
    if (!Array.isArray(row.replacements) || row.replacements.length !== (row.decision === "revise" ? 1 : 0)) {
      throw new Error(`${context}: revise requires exactly one replacement and reject requires none.`);
    }
    const replacements = row.replacements.map((replacement, replacementIndex): RelationDependencyReplacement => {
      const replacementContext = `${context}: replacement ${replacementIndex + 1}`;
      assertExactObjectKeys(
        replacement,
        ["claim_a", "claim_b", "relation_kind", "resolution", "basis", "limits"],
        replacementContext,
      );
      for (const field of ["claim_a", "claim_b", "relation_kind", "resolution", "basis", "limits"] as const) {
        if (typeof replacement[field] !== "string" || replacement[field].trim().length === 0) {
          throw new Error(`${replacementContext}: ${field} must be a non-empty string.`);
        }
      }
      if (replacement.claim_a === replacement.claim_b) {
        throw new Error(`${replacementContext}: a semantic relation cannot be a self-loop.`);
      }
      if (replacement.basis.trim().length < 40 || replacement.limits.trim().length < 20) {
        throw new Error(`${replacementContext}: basis and limits must record substantive bounded adjudication.`);
      }
      return {
        claim_a: replacement.claim_a.trim(),
        claim_b: replacement.claim_b.trim(),
        relation_kind: replacement.relation_kind.trim(),
        resolution: replacement.resolution.trim(),
        basis: replacement.basis.trim(),
        limits: replacement.limits.trim(),
      };
    });
    rows.set(row.relation_id, {
      relation_id: row.relation_id,
      decision: row.decision,
      rationale: row.rationale.trim(),
      replacements,
    });
  }
  const missing = [...expected.keys()].filter((relationId) => !rows.has(relationId)).sort();
  if (missing.length > 0) {
    throw new Error(`${path}: relation dependency overlay omits ${missing.length} relation(s): ${missing.slice(0, 10).join(", ")}`);
  }
  const normalized = [...rows.values()].sort((left, right) => left.relation_id.localeCompare(right.relation_id));
  const content = normalized.length === 0 ? "" : `${normalized.map(canonicalJson).join("\n")}\n`;
  return { rows, content, sha256: createHash("sha256").update(content).digest("hex") };
}

function shouldReject(record: MutableLedgerRecord, findings: readonly OntologyAuditFinding[]) {
  if (findings.some((finding) => finding.proposed_action === "reject" || finding.proposed_action === "retire")) {
    return record.lane !== "voice";
  }
  if (record.lane === "relation") {
    return findings.some((finding) =>
      finding.proposed_action === "reject"
      || finding.proposed_action === "retire"
      || (finding.proposed_action === "retype" && REJECT_RELATION_PATTERN.test(finding.defect_class))
      || REJECT_RELATION_PATTERN.test(finding.defect_class)
    );
  }
  if (record.lane === "observation") {
    return findings.some((finding) => finding.proposed_action === "reject" || REJECT_OBSERVATION_DEFECTS.has(finding.defect_class));
  }
  if (record.lane === "claim") {
    return findings.some((finding) => finding.proposed_action === "reject" || REJECT_CLAIM_DEFECTS.has(finding.defect_class));
  }
  if (record.lane === "commentary") {
    return findings.some((finding) => finding.proposed_action === "reject" || REJECT_COMMENTARY_DEFECTS.has(finding.defect_class));
  }
  return false;
}

const DETERMINISTIC_GLOBAL_REPAIR_DEFECTS = new Set([
  "accepted_commentary_missing_citations",
  "citationless_accepted_commentary",
  "claim_missing_observation_and_speaker_provenance",
  "claim_missing_observation_linkage",
  "claim_missing_observation_provenance",
  "empty_observation_link",
  "false_unresolved_voice",
  "feature_axis_overloading",
  "feature_membership_identity_error",
  "feature_type_mismatch",
  "greek_term_not_in_cited_span",
  "greek_term_outside_source_slice",
  "malformed_fenced_yaml",
  "missing_citation",
  "missing_nested_voice_linkage",
  "missing_nested_voice_record",
  "missing_observation_linkage",
  "missing_speaker_attribution",
  "missing_terminal_voice_resolution",
  "nested_voice_attribution",
  "nested_voice_projection_loss",
  "nested_voice_resolution_failure",
  "observation_feature_type_mismatch",
  "observation_speaker_attribution_error",
  "resolvable_voice_marked_unresolved",
  "semantic_speaker_mismatch",
  "source_anchor_includes_markup_preamble",
  "span_speaker_atomicity_mismatch",
  "speaker_assent_overstatement",
  "speaker_atomicity_mismatch",
  "speaker_attribution_error",
  "speaker_position_conflation",
  "speaker_qualification_lost",
  "voice_resolution_mismatch",
]);

function deterministicGlobalRepair(defectClass: string) {
  return DETERMINISTIC_GLOBAL_REPAIR_DEFECTS.has(defectClass);
}

export function requiresFailClosedDispositionBeforeEvidence(
  findings: readonly Pick<OntologyAuditFinding, "finding_id" | "defect_class">[],
  resolvedFindingIds: ReadonlySet<string>,
) {
  return findings.some((finding) =>
    !resolvedFindingIds.has(finding.finding_id)
    && !deterministicGlobalRepair(finding.defect_class)
  );
}

function sourceWorkTitle(dialogue: string) {
  return dialogue.split("-").map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`).join(" ");
}

function sourceObservationFromOmission(
  dialogue: string,
  observationId: string,
  replacement: SourceOmissionObservation,
) {
  const resolution = resolveSourceSpan(dialogue, replacement.stephanus_span);
  return {
    observation_id: observationId,
    source_work: sourceWorkTitle(dialogue),
    stephanus_span: resolution.source_ref.stephanus_span,
    source_ref: resolution.source_ref as unknown as CanonicalYamlValue,
    greek_terms: [],
    english_gloss: "",
    observation: replacement.text,
    textual_basis: replacement.textual_basis?.trim()
      || "The exact cited Greek interval explicitly supplies this single textual fact.",
    limits: replacement.limits?.trim()
      || "This observation records only the explicit source statement; it does not infer endorsement, absence, counterevidence, or a general doctrine.",
    review_status: "accepted",
  } satisfies Record<string, CanonicalYamlValue>;
}

function sourceObservationFromRecord(sourceRecord: MutableLedgerRecord, observationId: string) {
  const ref = sourceRef(sourceRecord.record);
  if (!ref) throw new Error(`${sourceRecord.key} cannot supply an exact observation source reference.`);
  const sourceRefValue = sourceRecord.record.source_ref;
  if (!isRecord(sourceRefValue)) throw new Error(`${sourceRecord.key} has no canonical source_ref.`);
  const stephanusSpan = scalar(sourceRecord.record, "stephanus_span") || scalar(sourceRefValue, "stephanus_span");
  const content = scalar(sourceRecord.record, sourceRecord.lane === "claim" ? "content" : "observation");
  return {
    observation_id: observationId,
    source_work: scalar(sourceRecord.record, "source_work") || sourceRecord.dialogue,
    stephanus_span: stephanusSpan,
    source_ref: cloneRecord(sourceRefValue),
    greek_terms: [],
    english_gloss: "",
    observation: `The cited passage explicitly states: ${content}`,
    textual_basis: "The exact cited Greek interval explicitly supplies this attributed proposition.",
    limits: "This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.",
    supports_claim_ids: [sourceRecord.id],
    review_status: "accepted",
  } satisfies Record<string, CanonicalYamlValue>;
}

function overlap(left: MutableLedgerRecord, right: MutableLedgerRecord) {
  const a = sourceRef(left.record);
  const b = sourceRef(right.record);
  return Boolean(a && b && a.sourcePath === b.sourcePath && a.startChar < b.endChar && b.startChar < a.endChar);
}

function listStrings(value: CanonicalYamlValue | undefined) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

const PUBLIC_RECORD_ID_PATTERN = /\b(?:obs|claim|rel|comm|voice)_[a-z0-9-]+_\d{4}\b/gu;

export function nonAcceptedRecordIdReferences(
  text: string,
  reviewStatuses: ReadonlyMap<string, string>,
) {
  return [...new Set(
    [...text.matchAll(PUBLIC_RECORD_ID_PATTERN)]
      .map((match) => match[0])
      .filter((id) => reviewStatuses.get(id) !== "accepted"),
  )].sort();
}

export function assertRejectedRecordProseOverride({
  key,
  current,
  expectedSha256,
  rejectedIds,
  reviewStatuses,
}: {
  key: string;
  current: string;
  expectedSha256: string;
  rejectedIds: readonly string[];
  reviewStatuses: ReadonlyMap<string, string>;
}) {
  const actualSha256 = createHash("sha256").update(current).digest("hex");
  if (actualSha256 !== expectedSha256) {
    throw new Error(`${key}: rejected-record prose override input drifted (${actualSha256} != ${expectedSha256}).`);
  }
  for (const rejectedId of rejectedIds) {
    if (reviewStatuses.get(rejectedId) !== "rejected") {
      throw new Error(`${key}: prose override target ${rejectedId} is not a rejected canonical record.`);
    }
    if (!current.includes(rejectedId)) {
      throw new Error(`${key}: expected rejected reference ${rejectedId} is absent.`);
    }
  }
}

function accepted(record: MutableLedgerRecord) {
  return scalar(record.record, "review_status") === "accepted";
}

/**
 * Commentary citations are evidence-set references, not semantic graph edges.
 * When a cited composite record is retired, preserve its evidence coverage by
 * replacing it with every accepted same-lane terminal successor. Rejected
 * records without such a successor disappear from the citation set. This is
 * deliberately not used for relations, whose endpoints require item-level
 * semantic adjudication rather than mechanical fan-out.
 */
export function rewriteCommentaryCitationIds(
  ids: readonly string[],
  lane: "observation" | "claim" | "relation",
  recordsByKey: ReadonlyMap<string, { reviewStatus: string }>,
  replacementTargets: ReadonlyMap<string, readonly string[]>,
) {
  const prefix = `record:${lane}:`;
  const resolve = (key: string, active: ReadonlySet<string>): string[] => {
    if (active.has(key)) throw new Error(`Cyclic semantic replacement chain at ${key}.`);
    const record = recordsByKey.get(key);
    if (!record) throw new Error(`Commentary citation references missing canonical record ${key}.`);
    if (record.reviewStatus === "accepted") return key.startsWith(prefix) ? [key] : [];
    const successors = replacementTargets.get(key) ?? [];
    const nextActive = new Set(active).add(key);
    return successors.flatMap((successor) => resolve(successor, nextActive));
  };
  return [...new Set(ids.flatMap((id) => resolve(`${prefix}${id}`, new Set())))]
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length))
    .sort();
}

export function retypeRejectedEmptyCrossref(
  key: string,
  record: Record<string, CanonicalYamlValue>,
) {
  const override = REJECTED_EMPTY_CROSSREF_RETYPES.get(key);
  if (!override) return undefined;
  if (scalar(record, "review_status") !== "rejected") {
    throw new Error(`${key}: empty-crossref retype requires rejected review provenance.`);
  }
  if (scalar(record, "block_kind") !== override.from) {
    throw new Error(`${key}: empty-crossref retype expected block_kind=${override.from}.`);
  }
  const cites = isRecord(record.cites) ? record.cites : {};
  const citationCount = ["observations", "claims", "relations", "dossiers"]
    .reduce((count, lane) => count + listStrings(cites[lane]).length, 0);
  const crossrefCount = Array.isArray(record.crossrefs) ? record.crossrefs.length : 0;
  if (citationCount !== 0 || crossrefCount !== 0) {
    throw new Error(`${key}: empty-crossref retype requires zero surviving citations and crossrefs.`);
  }
  record.block_kind = override.to;
  return override.rationale;
}

export function planLegacyCommentaryQualityAuditRetirements(
  repoRoot: string,
): LegacyCommentaryQualityAuditRetirement[] {
  const directory = join(repoRoot, "wiki/commentary-audits");
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^[a-z0-9-]+\.json$/u.test(entry.name))
    .map((entry) => {
      const dialogue = entry.name.slice(0, -".json".length);
      const sourcePath = `wiki/commentary-audits/${entry.name}`;
      const content = readFileSync(join(repoRoot, sourcePath));
      const sha256 = createHash("sha256").update(content).digest("hex");
      return {
        dialogue,
        source_path: sourcePath,
        archive_path: `wiki/commentary-audits/history/${dialogue}/${sha256}.json`,
        sha256,
        disposition: "retire_stale_peer_acceptance" as const,
        rationale: "The ontology vNext hard cut changed the commentary ledger and its accepted-ID set, so the earlier ledger-bound quality acceptance cannot remain current. Preserve its exact bytes as historical review provenance; a future prose release requires a fresh independently accepted quality audit.",
      };
    })
    .sort((left, right) => left.dialogue.localeCompare(right.dialogue));
}

export function applyLegacyCommentaryQualityAuditRetirements(
  repoRoot: string,
  retirements: readonly LegacyCommentaryQualityAuditRetirement[],
) {
  for (const retirement of retirements) {
    const source = join(repoRoot, retirement.source_path);
    if (!existsSync(source)) throw new Error(`Missing commentary quality audit selected for retirement: ${retirement.source_path}`);
    const content = readFileSync(source);
    const actualSha256 = createHash("sha256").update(content).digest("hex");
    if (actualSha256 !== retirement.sha256) {
      throw new Error(`${retirement.source_path}: commentary quality-audit bytes drifted before retirement.`);
    }
    const archive = join(repoRoot, retirement.archive_path);
    mkdirSync(dirname(archive), { recursive: true });
    if (existsSync(archive)) {
      if (!readFileSync(archive).equals(content)) {
        throw new Error(`${retirement.archive_path}: historical commentary quality-audit hash collision.`);
      }
      unlinkSync(source);
    } else {
      renameSync(source, archive);
    }
  }
}

export function materializeLegacyCommentaryQualityAuditRetirements({
  repoRoot,
  packagePath,
  retirements,
}: {
  repoRoot: string;
  packagePath: string;
  retirements: readonly LegacyCommentaryQualityAuditRetirement[];
}) {
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const packageRelativePath = relative(repoRoot, absolutePackagePath).split("\\").join("/");
  const content = retirements.length === 0
    ? ""
    : `${retirements.map((retirement) => canonicalJson(retirement)).join("\n")}\n`;
  const sha256 = createHash("sha256").update(content).digest("hex");
  const relativeToPackage =
    `review-inputs/semantic-remediation/sha256-${sha256}-commentary-quality-audit-retirements.jsonl`;
  const absolutePath = join(absolutePackagePath, relativeToPackage);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const competingArtifacts = readdirSync(dirname(absolutePath), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-commentary-quality-audit-retirements\.jsonl$/u.test(entry.name))
    .map((entry) => entry.name)
    .filter((name) => name !== relativeToPackage.split("/").at(-1));
  if (competingArtifacts.length > 0) {
    throw new Error("Refusing to create competing commentary quality-audit retirement artifacts for one frozen audit snapshot.");
  }
  if (existsSync(absolutePath) && readFileSync(absolutePath, "utf8") !== content) {
    throw new Error(`Refusing to overwrite content-addressed commentary quality-audit retirements: ${absolutePath}`);
  }
  writeFileSync(absolutePath, content, "utf8");
  applyLegacyCommentaryQualityAuditRetirements(repoRoot, retirements);
  return {
    count: retirements.length,
    content,
    sha256,
    artifactPath: `${packageRelativePath}/${relativeToPackage}`,
  };
}

export function planSemanticRemediation({
  repoRoot = getRepoRoot(),
  packagePath,
  atomicSplitOverlayPath = join(repoRoot, "../work/semantic-overlays/non-atomic-splits.jsonl"),
  sourceOmissionOverlayPath = join(repoRoot, "../work/semantic-overlays/source-omissions.jsonl"),
  relationDependencyOverlayPath = join(repoRoot, "../work/semantic-overlays/relation-dependencies.jsonl"),
}: {
  repoRoot?: string;
  packagePath?: string;
  atomicSplitOverlayPath?: string;
  sourceOmissionOverlayPath?: string;
  relationDependencyOverlayPath?: string;
} = {}): SemanticRemediationPlan {
  const resolvedPackagePath = packagePath ?? listOntologyAuditPackagePaths(repoRoot)[0];
  if (!resolvedPackagePath) throw new Error("Missing ontology audit package.");
  const absolutePackagePath = resolvedPackagePath.startsWith("/") ? resolvedPackagePath : join(repoRoot, resolvedPackagePath);
  const findings = readJsonl<OntologyAuditFinding>(join(absolutePackagePath, "findings.jsonl"));
  const sourceUnits = readJsonl<OntologyAuditSourceUnit>(join(absolutePackagePath, "source-units.jsonl"));
  const sourceByKey = new Map(sourceUnits.map((unit) => [unit.key, unit]));
  const { records, originalByPath } = parseLedgers(repoRoot);
  const originalRecordByKey = new Map(records.map((record) => [record.key, cloneRecord(record.record)]));
  const recordByKey = new Map(records.map((record) => [record.key, record]));
  const findingsByTarget = new Map<string, OntologyAuditFinding[]>();
  for (const finding of findings) {
    for (const target of finding.target_keys) {
      const bucket = findingsByTarget.get(target) ?? [];
      bucket.push(finding);
      findingsByTarget.set(target, bucket);
    }
  }
  const omissionOverlay = readSourceOmissionOverlay(sourceOmissionOverlayPath, findings, sourceByKey);
  const splitCandidates = new Map(
    records
      .filter((record) =>
        accepted(record)
        && (record.lane === "observation" || record.lane === "claim")
        && (findingsByTarget.get(record.key) ?? []).some((finding) =>
          finding.proposed_action === "split"
          && (
            !omissionOverlay.claimedFindingIds.has(finding.finding_id)
            || omissionOverlay.retainedSplitFindingIds.has(finding.finding_id)
          )
        )
      )
      .map((record) => [record.key, record]),
  );
  const splitOverlay = readAtomicSplitOverlay(atomicSplitOverlayPath, splitCandidates, recordByKey, repoRoot);
  const allocateId = nextIds(records);
  const additionsByPath = new Map<string, MutableLedgerRecord[]>();
  const replacementTargets = new Map<string, string[]>();
  const commentaryReplacementTargets = new Map<string, string[]>();
  const findingResolutions = new Map<string, string>();
  const terminalActionOverrides = new Map<string, string>();
  const decisionRationaleOverrides = new Map<string, string>();
  const additions: SemanticRemediationPlan["additions"] = [];
  let greekTermsRemoved = 0;
  let recordsRejected = 0;
  let recordsSplit = 0;
  let splitReplacements = 0;
  let sourceSpanCorrections = 0;
  let claimKindCorrections = 0;
  let claimStatusCorrections = 0;

  for (const record of records) greekTermsRemoved += sanitizeGreekTerms(record, repoRoot);

  for (const record of records) {
    const sourceSpan = SOURCE_SPAN_OVERRIDES.get(record.key);
    if (sourceSpan) {
      applySourceSpan(record, sourceSpan);
      sourceSpanCorrections += 1;
      const rationale = SOURCE_SPAN_DECISION_RATIONALES.get(record.key);
      if (rationale) {
        terminalActionOverrides.set(record.key, "revise");
        decisionRationaleOverrides.set(record.key, rationale);
      }
    }
    const claimKind = CLAIM_KIND_OVERRIDES.get(record.key);
    if (claimKind) {
      record.record.claim_kind = claimKind;
      claimKindCorrections += 1;
    }
    const status = CLAIM_STATUS_OVERRIDES.get(record.key);
    if (status) {
      appendClaimStatusEvent(record, status);
      claimStatusCorrections += 1;
    }
  }

  const critoProjection = recordByKey.get("record:observation:obs_crito_0013");
  if (critoProjection) {
    DUPLICATE_REPLACEMENTS.set(
      critoProjection.key,
      records
        .filter((record) => record.lane === "voice" && record.dialogue === "crito" && accepted(record) && overlap(critoProjection, record))
        .map((record) => record.key)
        .sort(),
    );
  }

  for (const [target, replacements] of DUPLICATE_REPLACEMENTS) {
    const record = recordByKey.get(target);
    if (!record) continue;
    if (scalar(record.record, "review_status") !== "rejected") recordsRejected += 1;
    record.record.review_status = "rejected";
    replacementTargets.set(target, replacements);
    for (const finding of findingsByTarget.get(target) ?? []) {
      findingResolutions.set(finding.finding_id, `merged duplicate projection into ${replacements.join(", ")}`);
    }
  }

  for (const record of records) {
    const targetFindings = findingsByTarget.get(record.key) ?? [];
    const splitFindings = targetFindings.filter((finding) =>
      finding.proposed_action === "split"
      && (
        !omissionOverlay.claimedFindingIds.has(finding.finding_id)
        || omissionOverlay.retainedSplitFindingIds.has(finding.finding_id)
      )
    );
    const overlay = splitOverlay.rows.get(record.key);
    if (!overlay) {
      if (shouldReject(record, targetFindings) && scalar(record.record, "review_status") !== "rejected") {
        record.record.review_status = "rejected";
        recordsRejected += 1;
        for (const finding of targetFindings) findingResolutions.set(finding.finding_id, "rejected unsupported or non-neutral semantic record");
      }
      continue;
    }
    const textField = record.lane === "observation" ? "observation" : "content";
    record.record.review_status = "rejected";
    recordsRejected += 1;
    recordsSplit += 1;
    const replacementKeys: string[] = [...(overlay.existing_replacement_targets ?? [])];
    const originalSource = sourceRef(record.record);
    for (const fragment of overlay.replacements) {
      const id = allocateId(record.lane, record.dialogue);
      const replacement = cloneRecord(record.record);
      replacement[LANE_CONFIG[record.lane].idField] = id;
      replacement[textField] = fragment.text.trim();
      replacement.review_status = "accepted";
      replacement.limits = fragment.limits?.trim()
        || "This split record preserves only one explicit proposition from the cited Greek source span and does not infer endorsement, absence, counterevidence, or a general doctrine.";
      if (record.lane === "observation") {
        // The parent gloss may cite the parent's wider Stephanus interval. It
        // is not source authority and cannot be inherited by an atomic child.
        replacement.english_gloss = "";
        replacement.textual_basis = fragment.textual_basis?.trim()
          || "The exact cited Greek interval explicitly supplies this single textual fact.";
      }
      if (record.lane === "claim") {
        const metadata = fragment.claim_metadata!;
        applyAtomicClaimMetadata(replacement, record.dialogue, metadata);
        replacement.observation_ids = [];
      }
      const added: MutableLedgerRecord = {
        key: `record:${record.lane}:${id}`,
        lane: record.lane,
        id,
        dialogue: record.dialogue,
        path: record.path,
        ordinal: Number.MAX_SAFE_INTEGER,
        record: replacement,
      };
      const before = originalSource;
      applySourceSpan(added, fragment.stephanus_span);
      const after = sourceRef(added.record);
      if (!before || !after || before.sourcePath !== after.sourcePath || after.startChar < before.startChar || after.endChar > before.endChar) {
        throw new Error(`${record.key}: replacement span ${fragment.stephanus_span} falls outside the audited source interval.`);
      }
      greekTermsRemoved += sanitizeGreekTerms(added, repoRoot);
      records.push(added);
      recordByKey.set(added.key, added);
      const bucket = additionsByPath.get(record.path) ?? [];
      bucket.push(added);
      additionsByPath.set(record.path, bucket);
      replacementKeys.push(added.key);
      additions.push({ key: added.key, reason: `atomic replacement for ${record.key}`, findingIds: splitFindings.map((finding) => finding.finding_id) });
      splitReplacements += 1;
    }
    replacementTargets.set(record.key, replacementKeys);
    commentaryReplacementTargets.set(record.key, replacementKeys);
    for (const finding of targetFindings) {
      if (
        omissionOverlay.claimedFindingIds.has(finding.finding_id)
        && !omissionOverlay.retainedSplitFindingIds.has(finding.finding_id)
      ) continue;
      findingResolutions.set(finding.finding_id, `split into ${replacementKeys.join(", ")} under the Greek-source rationale: ${overlay.rationale.trim()}`);
    }
  }

  let omissionObservationsAdded = 0;
  for (const row of omissionOverlay.rows) {
    const rowFindings = row.finding_ids.map((findingId) => findings.find((finding) => finding.finding_id === findingId)!);
    const units = row.source_unit_keys
      .map((key) => sourceByKey.get(key))
      .filter((unit): unit is OntologyAuditSourceUnit => Boolean(unit));
    const dialogue = units[0]?.dialogue;
    if (!dialogue) throw new Error(`${row.finding_ids[0]} has no resolvable source unit.`);
    const acceptedClaimIds = [...new Set(
      rowFindings
        .flatMap((finding) => finding.target_keys)
        .filter((targetKey) => targetKey.startsWith("record:claim:"))
        .map((targetKey) => recordByKey.get(targetKey))
        .filter((target): target is MutableLedgerRecord => Boolean(target && accepted(target)))
        .map((target) => target.id),
    )].sort();
    const replacementKeys: string[] = [];
    for (const replacement of row.observations) {
      const id = allocateId("observation", dialogue);
      const record: Record<string, CanonicalYamlValue> = sourceObservationFromOmission(dialogue, id, replacement);
      if (acceptedClaimIds.length > 0) record.supports_claim_ids = acceptedClaimIds;
      const path = `wiki/observations/${dialogue}.md`;
      const added: MutableLedgerRecord = {
        key: `record:observation:${id}`,
        lane: "observation",
        id,
        dialogue,
        path,
        ordinal: Number.MAX_SAFE_INTEGER,
        record,
      };
      records.push(added);
      recordByKey.set(added.key, added);
      const bucket = additionsByPath.get(path) ?? [];
      bucket.push(added);
      additionsByPath.set(path, bucket);
      additions.push({ key: added.key, reason: `source-first omission repair: ${row.rationale}`, findingIds: row.finding_ids });
      replacementKeys.push(added.key);
      omissionObservationsAdded += 1;
    }
    for (const findingId of row.finding_ids) {
      const additionResolution = `added ${replacementKeys.join(", ")} under the Greek-source rationale: ${row.rationale}`;
      const existing = findingResolutions.get(findingId);
      findingResolutions.set(findingId, existing ? `${existing}; ${additionResolution}` : additionResolution);
    }
    for (const targetKey of [...new Set(rowFindings.flatMap((finding) => finding.target_keys))]) {
      const targetFindings = findingsByTarget.get(targetKey) ?? [];
      const targetRecord = recordByKey.get(targetKey);
      if (targetRecord?.lane === "claim" && accepted(targetRecord)) {
        targetRecord.record.observation_ids = [...new Set([
          ...listStrings(targetRecord.record.observation_ids),
          ...replacementKeys.map((key) => key.slice("record:observation:".length)),
        ])].sort();
      }
      replacementTargets.set(
        targetKey,
        [...new Set([...(replacementTargets.get(targetKey) ?? []), ...replacementKeys])].sort(),
      );
      if (
        recordByKey.has(targetKey)
        && targetFindings.length > 0
        && targetFindings.every((finding) => omissionOverlay.claimedFindingIds.has(finding.finding_id))
        && targetFindings.every((finding) => !omissionOverlay.retainedSplitFindingIds.has(finding.finding_id))
      ) {
        terminalActionOverrides.set(targetKey, "valid_as_is");
      }
    }
  }

  // Do not manufacture accepted evidence for a claim whose still-unresolved
  // item-level findings already require a fail-closed terminal rejection. The
  // later status pass records that rejection and its rationale; this predicate
  // only prevents a rejected peer record from leaving an accepted derivative.
  const resolvedBeforeEvidence = new Set(findingResolutions.keys());
  const rejectsBeforeEvidence = (record: MutableLedgerRecord) =>
    requiresFailClosedDispositionBeforeEvidence(
      findingsByTarget.get(record.key) ?? [],
      resolvedBeforeEvidence,
    );

  const omissionGroups = new Map<string, OntologyAuditFinding[]>();
  for (const finding of findings) {
    if (finding.proposed_action !== "add" && !/(?:missing|omitted)_source_bound_observation/u.test(finding.defect_class)) continue;
    const claimTarget = finding.target_keys.find((target) => target.startsWith("record:claim:"));
    if (!claimTarget) continue;
    const key = `claim\u0000${claimTarget}`;
    const bucket = omissionGroups.get(key) ?? [];
    bucket.push(finding);
    omissionGroups.set(key, bucket);
  }
  for (const group of omissionGroups.values()) {
    const finding = group[0]!;
    const units = finding.source_unit_keys.map((key) => sourceByKey.get(key)).filter((unit): unit is OntologyAuditSourceUnit => Boolean(unit));
    if (units.length === 0) throw new Error(`${finding.finding_id} has no resolvable source unit.`);
    const dialogue = units[0]!.dialogue;
    const id = allocateId("observation", dialogue);
    const claimTarget = finding.target_keys.find((target) => target.startsWith("record:claim:"));
    const claim = claimTarget ? recordByKey.get(claimTarget) : undefined;
    if (!claim) throw new Error(`${finding.finding_id} claim-targeted omission has no canonical claim.`);
    if (!accepted(claim) || rejectsBeforeEvidence(claim)) continue;
    const record = sourceObservationFromRecord(claim, id);
    const path = `wiki/observations/${dialogue}.md`;
    const added: MutableLedgerRecord = {
      key: `record:observation:${id}`,
      lane: "observation",
      id,
      dialogue,
      path,
      ordinal: Number.MAX_SAFE_INTEGER,
      record,
    };
    records.push(added);
    recordByKey.set(added.key, added);
    const bucket = additionsByPath.get(path) ?? [];
    bucket.push(added);
    additionsByPath.set(path, bucket);
    const findingIds = group.map((entry) => entry.finding_id);
    additions.push({ key: added.key, reason: "source-first omission repair", findingIds });
    for (const findingId of findingIds) findingResolutions.set(findingId, `added ${added.key}`);
    claim.record.observation_ids = [id];
    omissionObservationsAdded += 1;
  }

  let claimsLinked = 0;
  let claimEvidenceObservationsAdded = 0;
  let claimsRejectedWithoutEvidence = 0;
  for (const claim of records.filter((record) =>
    record.lane === "claim"
    && accepted(record)
    && !rejectsBeforeEvidence(record)
  )) {
    const currentObservationIds = listStrings(claim.record.observation_ids);
    let observations = currentObservationIds
      .map((id) => recordByKey.get(`record:observation:${id}`))
      .filter((record): record is MutableLedgerRecord => Boolean(record && accepted(record) && overlap(claim, record)));
    if (observations.length !== currentObservationIds.length) observations = [];
    if (observations.length === 0) {
      const ref = sourceRef(claim.record);
      if (!ref) {
        claim.record.review_status = "rejected";
        recordsRejected += 1;
        claimsRejectedWithoutEvidence += 1;
        continue;
      }
      const sourceUnit = sourceUnits.find((unit) =>
        unit.source_path === ref.sourcePath && unit.start_char < ref.endChar && ref.startChar < unit.end_char
      );
      if (!sourceUnit) {
        claim.record.review_status = "rejected";
        recordsRejected += 1;
        claimsRejectedWithoutEvidence += 1;
        continue;
      }
      const id = allocateId("observation", claim.dialogue);
      const record = sourceObservationFromRecord(claim, id);
      const path = `wiki/observations/${claim.dialogue}.md`;
      const added: MutableLedgerRecord = {
        key: `record:observation:${id}`,
        lane: "observation",
        id,
        dialogue: claim.dialogue,
        path,
        ordinal: Number.MAX_SAFE_INTEGER,
        record,
      };
      records.push(added);
      recordByKey.set(added.key, added);
      const bucket = additionsByPath.get(path) ?? [];
      bucket.push(added);
      additionsByPath.set(path, bucket);
      additions.push({ key: added.key, reason: `observation provenance for ${claim.key}`, findingIds: [] });
      observations = [added];
      claimEvidenceObservationsAdded += 1;
    }
    claim.record.observation_ids = [...new Set(observations.map((observation) => observation.id))].sort();
    claimsLinked += 1;
  }

  // Establish terminal record statuses before rebuilding dependent relations
  // and commentary citations. Dependency rewrites must never observe an
  // intermediate record that a later fail-closed pass will reject.
  for (const finding of findings) {
    if (findingResolutions.has(finding.finding_id)) continue;
    const targets = finding.target_keys.map((key) => recordByKey.get(key)).filter((record): record is MutableLedgerRecord => Boolean(record));
    if (targets.length === 0) continue;
    if (deterministicGlobalRepair(finding.defect_class)) {
      for (const target of targets) {
        if (!terminalActionOverrides.has(target.key)) terminalActionOverrides.set(target.key, "revise");
      }
      const resolution = /feature/u.test(finding.defect_class)
        ? "resolved by the concept-first vNext axis, concept, and many-to-many membership hard cut"
        : /(?:speaker|voice)/u.test(finding.defect_class)
          ? "resolved by the Greek-byte-bound voice authority and claim-speaker cutover"
          : /malformed_fenced_yaml/u.test(finding.defect_class)
            ? "resolved by the strict canonical fenced-YAML migration and parser validation"
            : "resolved by the deterministic source, linkage, term, or citation repair recorded in this change set";
      findingResolutions.set(finding.finding_id, resolution);
      continue;
    }
    for (const target of targets) {
      const originallyAccepted = scalar(originalRecordByKey.get(target.key) ?? {}, "review_status") === "accepted";
      if (accepted(target)) {
        target.record.review_status = "rejected";
        recordsRejected += 1;
        terminalActionOverrides.set(target.key, "reject");
      } else {
        terminalActionOverrides.set(target.key, originallyAccepted ? "reject" : "retire");
      }
    }
    findingResolutions.set(
      finding.finding_id,
      `fail-closed terminal disposition for ${finding.defect_class}: the defective peer record remains review provenance only and is excluded from accepted readers without implying textual absence or counterevidence`,
    );
  }

  for (const finding of findings) {
    if (findingResolutions.has(finding.finding_id)) continue;
    if (finding.defect_class === "greek_term_not_in_cited_span") {
      findingResolutions.set(finding.finding_id, "removed Greek term absent from the exact cited bytes");
    } else if (/(?:empty_observation_link|missing_observation_linkage|claim_missing_observation)/u.test(finding.defect_class)) {
      findingResolutions.set(finding.finding_id, "populated claim observation_ids from accepted overlapping source intervals");
    } else {
      findingResolutions.set(finding.finding_id, "retained for item-level adjudication after deterministic global repairs");
    }
  }

  let claimObservationLinksPruned = 0;
  let claimsRejectedAfterEvidenceClosure = 0;
  for (const claim of records.filter((record) => record.lane === "claim" && accepted(record))) {
    const originalIds = listStrings(claim.record.observation_ids);
    const acceptedIds = originalIds.filter((observationId) => {
      const observation = recordByKey.get(`record:observation:${observationId}`);
      return Boolean(observation && accepted(observation) && overlap(claim, observation));
    });
    claimObservationLinksPruned += originalIds.length - acceptedIds.length;
    if (acceptedIds.length === 0) {
      claim.record.review_status = "rejected";
      recordsRejected += 1;
      claimsRejectedAfterEvidenceClosure += 1;
      terminalActionOverrides.set(claim.key, "reject");
      decisionRationaleOverrides.set(
        claim.key,
        "Rejected during terminal dependency closure because none of its cited observation records remained accepted and source-overlapping. Rejection is not textual absence or counterevidence.",
      );
      continue;
    }
    claim.record.observation_ids = [...new Set(acceptedIds)].sort();
  }

  const expectedClaimsByObservation = new Map<string, string[]>();
  for (const claim of records.filter((record) => record.lane === "claim" && accepted(record))) {
    for (const observationId of listStrings(claim.record.observation_ids)) {
      const bucket = expectedClaimsByObservation.get(observationId) ?? [];
      bucket.push(claim.id);
      expectedClaimsByObservation.set(observationId, bucket);
    }
  }
  let observationClaimLinksRebuilt = 0;
  for (const observation of records.filter((record) => record.lane === "observation" && accepted(record))) {
    const originalIds = listStrings(observation.record.supports_claim_ids).sort();
    const expectedIds = [...new Set(expectedClaimsByObservation.get(observation.id) ?? [])].sort();
    if (originalIds.join("\u0000") === expectedIds.join("\u0000")) continue;
    if (expectedIds.length === 0) delete observation.record.supports_claim_ids;
    else observation.record.supports_claim_ids = expectedIds;
    observationClaimLinksRebuilt += 1;
  }

  const splitClaimKeys = new Set(
    [...replacementTargets.entries()]
      .filter(([target, replacements]) =>
        target.startsWith("record:claim:")
        && replacements.some((replacement) => replacement.startsWith("record:claim:"))
      )
      .map(([target]) => target),
  );
  const expectedRelationDependencies = new Map(
    records
      .filter((record) => {
        if (record.lane !== "relation") return false;
        const original = originalRecordByKey.get(record.key);
        if (!original || scalar(original, "review_status") !== "accepted") return false;
        return splitClaimKeys.has(`record:claim:${scalar(original, "claim_a")}`)
          || splitClaimKeys.has(`record:claim:${scalar(original, "claim_b")}`);
      })
      .map((record) => [record.id, record]),
  );
  const relationOverlay = readRelationDependencyOverlay(
    relationDependencyOverlayPath,
    expectedRelationDependencies,
  );
  const relationRecordIndex = new Map(
    records.map((record) => [record.key, { reviewStatus: scalar(record.record, "review_status") }]),
  );
  let relationsRevisedForReplacementClaims = 0;
  for (const row of relationOverlay.rows.values()) {
    const relation = expectedRelationDependencies.get(row.relation_id)!;
    decisionRationaleOverrides.set(relation.key, row.rationale);
    if (row.decision === "reject") {
      if (accepted(relation)) {
        relation.record.review_status = "rejected";
        recordsRejected += 1;
      }
      terminalActionOverrides.set(relation.key, "reject");
      continue;
    }
    if (!accepted(relation)) {
      throw new Error(`${row.relation_id}: dependency overlay cannot resurrect a relation rejected by its own item-level audit.`);
    }
    const replacement = row.replacements[0]!;
    const original = originalRecordByKey.get(relation.key)!;
    const allowedA = rewriteCommentaryCitationIds(
      [scalar(original, "claim_a")],
      "claim",
      relationRecordIndex,
      replacementTargets,
    );
    const allowedB = rewriteCommentaryCitationIds(
      [scalar(original, "claim_b")],
      "claim",
      relationRecordIndex,
      replacementTargets,
    );
    if (!allowedA.includes(replacement.claim_a) || !allowedB.includes(replacement.claim_b)) {
      throw new Error(`${row.relation_id}: revised endpoints are not accepted terminal successors of the original claims.`);
    }
    for (const claimId of [replacement.claim_a, replacement.claim_b]) {
      const claim = recordByKey.get(`record:claim:${claimId}`);
      if (!claim || !accepted(claim)) throw new Error(`${row.relation_id}: replacement endpoint ${claimId} is not accepted.`);
    }
    relation.record.claim_a = replacement.claim_a;
    relation.record.claim_b = replacement.claim_b;
    relation.record.relation_kind = replacement.relation_kind;
    relation.record.resolution = replacement.resolution;
    relation.record.basis = replacement.basis;
    relation.record.limits = replacement.limits;
    terminalActionOverrides.set(relation.key, "revise");
    relationsRevisedForReplacementClaims += 1;
  }

  let relationsRejectedForInvalidEndpoints = 0;
  for (const relation of records.filter((record) => record.lane === "relation" && accepted(record))) {
    const claimIds = [scalar(relation.record, "claim_a"), scalar(relation.record, "claim_b")];
    const invalid = claimIds.filter((claimId) => {
      const claim = recordByKey.get(`record:claim:${claimId}`);
      return !claim || !accepted(claim);
    });
    if (invalid.length === 0) continue;
    relation.record.review_status = "rejected";
    recordsRejected += 1;
    relationsRejectedForInvalidEndpoints += 1;
    terminalActionOverrides.set(relation.key, "reject");
    decisionRationaleOverrides.set(
      relation.key,
      `Rejected because the terminal claim audit rejected endpoint${invalid.length === 1 ? "" : "s"} ${invalid.join(", ")} without an item-level accepted successor selected for this edge. An accepted semantic relation cannot outlive its endpoint; this dependency rejection is not textual absence or counterevidence.`,
    );
  }

  let relationsRejectedForInvalidResolution = 0;
  for (const relation of records.filter((record) => record.lane === "relation" && accepted(record))) {
    if (scalar(relation.record, "resolution") !== "standing") continue;
    const claimA = recordByKey.get(`record:claim:${scalar(relation.record, "claim_a")}`)!;
    const claimB = recordByKey.get(`record:claim:${scalar(relation.record, "claim_b")}`)!;
    const statusA = scalar(claimA.record, "final_status");
    const statusB = scalar(claimB.record, "final_status");
    if (statusA === "left_standing" && statusB === "left_standing") continue;
    relation.record.review_status = "rejected";
    recordsRejected += 1;
    relationsRejectedForInvalidResolution += 1;
    terminalActionOverrides.set(relation.key, "reject");
    decisionRationaleOverrides.set(
      relation.key,
      `Rejected because resolution=standing is false after terminal claim-trajectory adjudication: ${claimA.id} is ${statusA} and ${claimB.id} is ${statusB}. No source-bound resolution event was supplied in this edge, so the migration cannot invent refuted_resolved or superseded evidence.`,
    );
  }

  let commentaryCitationsAdded = 0;
  let commentaryCitationsRemapped = 0;
  let commentaryKindsRetyped = 0;
  let commentaryRejectedWithoutCitation = 0;
  const citationRecordIndex = new Map(
    records.map((record) => [record.key, { reviewStatus: scalar(record.record, "review_status") }]),
  );
  for (const commentary of records.filter((record) => record.lane === "commentary")) {
    const current = isRecord(commentary.record.cites) ? cloneRecord(commentary.record.cites) : {};
    const originalObservationIds = listStrings(current.observations);
    const originalClaimIds = listStrings(current.claims);
    const originalRelationIds = listStrings(current.relations);
    const observationIds = rewriteCommentaryCitationIds(
      originalObservationIds,
      "observation",
      citationRecordIndex,
      commentaryReplacementTargets,
    );
    const claimIds = rewriteCommentaryCitationIds(
      originalClaimIds,
      "claim",
      citationRecordIndex,
      commentaryReplacementTargets,
    );
    const relationIds = rewriteCommentaryCitationIds(
      originalRelationIds,
      "relation",
      citationRecordIndex,
      commentaryReplacementTargets,
    );
    if (
      observationIds.join("\u0000") !== originalObservationIds.join("\u0000")
      || claimIds.join("\u0000") !== originalClaimIds.join("\u0000")
      || relationIds.join("\u0000") !== originalRelationIds.join("\u0000")
    ) {
      current.observations = observationIds;
      current.claims = claimIds;
      current.relations = relationIds;
      commentary.record.cites = current;
      commentaryCitationsRemapped += 1;
    }
    const retypeRationale = retypeRejectedEmptyCrossref(commentary.key, commentary.record);
    if (retypeRationale) {
      commentaryKindsRetyped += 1;
      terminalActionOverrides.set(commentary.key, "retype");
      decisionRationaleOverrides.set(commentary.key, retypeRationale);
    }
    if (!accepted(commentary)) continue;
    const dossierIds = listStrings(current.dossiers);
    const needsCitation = observationIds.length + claimIds.length + relationIds.length + dossierIds.length === 0
      || (findingsByTarget.get(commentary.key) ?? []).some((finding) =>
        /(?:citationless|missing_citation)/u.test(finding.defect_class)
      );
    if (!needsCitation) continue;
    commentary.record.review_status = "rejected";
    recordsRejected += 1;
    terminalActionOverrides.set(commentary.key, "reject");
    commentaryRejectedWithoutCitation += 1;
    for (const finding of findingsByTarget.get(commentary.key) ?? []) {
      if (/(?:citationless|missing_citation)/u.test(finding.defect_class)) {
        findingResolutions.set(
          finding.finding_id,
          "rejected accepted commentary because no item-level canonical citation was recorded; interval overlap is not evidence",
        );
      }
    }
  }

  const publicProseFields = [
    "basis",
    "body",
    "content",
    "english_gloss",
    "limits",
    "observation",
    "textual_basis",
  ] as const;
  let rejectedRecordProseReferencesRewritten = 0;
  const reviewStatusesById = new Map(
    records.map((record) => [record.id, scalar(record.record, "review_status")]),
  );
  for (const [key, override] of REJECTED_RECORD_PROSE_OVERRIDES) {
    const record = recordByKey.get(key);
    if (!record || !accepted(record)) throw new Error(`${key}: rejected-record prose override target is not accepted.`);
    const current = record.record[override.field];
    if (typeof current !== "string") throw new Error(`${key}.${override.field}: prose override target is not text.`);
    assertRejectedRecordProseOverride({
      key: `${key}.${override.field}`,
      current,
      expectedSha256: override.expectedSha256,
      rejectedIds: override.rejectedIds,
      reviewStatuses: reviewStatusesById,
    });
    record.record[override.field] = override.value;
    terminalActionOverrides.set(key, "revise");
    decisionRationaleOverrides.set(key, override.rationale);
    rejectedRecordProseReferencesRewritten += override.rejectedIds.length;
  }
  for (const record of records.filter(accepted)) {
    for (const field of publicProseFields) {
      const value = record.record[field];
      if (typeof value !== "string") continue;
      const invalid = nonAcceptedRecordIdReferences(value, reviewStatusesById);
      if (invalid.length > 0) {
        throw new Error(`${record.key}.${field}: accepted reader prose references non-accepted records ${invalid.join(", ")}; add an item-level prose override.`);
      }
    }
  }

  for (const claim of records.filter((record) => record.lane === "claim" && accepted(record))) {
    for (const observationId of listStrings(claim.record.observation_ids)) {
      const observation = recordByKey.get(`record:observation:${observationId}`);
      if (!observation || !accepted(observation) || !listStrings(observation.record.supports_claim_ids).includes(claim.id)) {
        throw new Error(`${claim.key}: accepted claim lacks an accepted reciprocal observation link to ${observationId}.`);
      }
    }
  }
  for (const observation of records.filter((record) => record.lane === "observation" && accepted(record))) {
    for (const claimId of listStrings(observation.record.supports_claim_ids)) {
      const claim = recordByKey.get(`record:claim:${claimId}`);
      if (!claim || !accepted(claim) || !listStrings(claim.record.observation_ids).includes(observation.id)) {
        throw new Error(`${observation.key}: accepted observation leaks a non-reciprocal or rejected claim link to ${claimId}.`);
      }
    }
  }
  for (const relation of records.filter((record) => record.lane === "relation" && accepted(record))) {
    for (const claimId of [scalar(relation.record, "claim_a"), scalar(relation.record, "claim_b")]) {
      const claim = recordByKey.get(`record:claim:${claimId}`);
      if (!claim || !accepted(claim)) throw new Error(`${relation.key}: accepted relation leaks rejected claim ${claimId}.`);
    }
  }
  for (const commentary of records.filter((record) => record.lane === "commentary")) {
    const cites = isRecord(commentary.record.cites) ? commentary.record.cites : {};
    for (const [field, lane] of [
      ["observations", "observation"],
      ["claims", "claim"],
      ["relations", "relation"],
    ] as const) {
      for (const id of listStrings(cites[field])) {
        const cited = recordByKey.get(`record:${lane}:${id}`);
        if (!cited || !accepted(cited)) throw new Error(`${commentary.key}: accepted commentary leaks rejected ${lane} ${id}.`);
      }
    }
  }

  const files: SemanticRemediationPlan["files"] = [];
  for (const [path, original] of originalByPath) {
    const recordsForPath = records.filter((record) => record.path === path && record.ordinal !== Number.MAX_SAFE_INTEGER);
    const byId = new Map(recordsForPath.map((record) => [record.id, record]));
    const idField = LANE_CONFIG[recordsForPath[0]?.lane ?? "observation"].idField;
    let content = replaceFencedYamlRecordBlocks(original, (block) => {
      const id = scalar(block.record, idField);
      const record = byId.get(id);
      if (!record) throw new Error(`${path}: cannot resolve ${idField} ${id} during remediation.`);
      return canonicalFence(record.record);
    });
    const pathAdditions = additionsByPath.get(path) ?? [];
    if (pathAdditions.length > 0) {
      content = `${content.trimEnd()}\n\n${pathAdditions.sort((a, b) => a.id.localeCompare(b.id)).map((record) => canonicalFence(record.record)).join("\n\n")}\n`;
    }
    files.push({ path, content });
  }

  const acceptedCommentaryIds = new Set(
    records
      .filter((record) => record.lane === "commentary" && accepted(record))
      .map((record) => record.id),
  );
  let recordingsWithdrawnForRejectedChapters = 0;
  let recordingRejectedChapterTargets = 0;
  const recordingsDirectory = join(repoRoot, "wiki/recordings");
  if (existsSync(recordingsDirectory)) {
    for (const entry of readdirSync(recordingsDirectory, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const path = `wiki/recordings/${entry.name}`;
      const content = readFileSync(join(repoRoot, path), "utf8");
      const manifest = JSON.parse(content) as Record<string, unknown>;
      if (!Array.isArray(manifest.chapters)) continue;
      const rejectedTargets = manifest.chapters.filter((chapter) => {
        if (chapter === null || typeof chapter !== "object" || Array.isArray(chapter)) return false;
        const commentaryId = (chapter as Record<string, unknown>).commentary_id;
        return typeof commentaryId === "string" && !acceptedCommentaryIds.has(commentaryId);
      });
      if (rejectedTargets.length === 0) continue;
      manifest.status = "withdrawn";
      const provenance = Array.isArray(manifest.provenance) ? [...manifest.provenance] : [];
      provenance.push({
        label: "Ontology vNext withdrawal",
        value: `Withdrawn because ${rejectedTargets.length} chapter target(s) were rejected by the snapshot-bound commentary audit; historical chapter timing is retained as provenance and is not reader-visible.`,
      });
      manifest.provenance = provenance;
      recordingsWithdrawnForRejectedChapters += 1;
      recordingRejectedChapterTargets += rejectedTargets.length;
      files.push({ path, content: `${JSON.stringify(manifest, null, 2)}\n` });
    }
  }

  const recordDecisions = records.map((record) => {
    const targetFindings = findingsByTarget.get(record.key) ?? [];
    const findingIds = targetFindings.map((finding) => finding.finding_id).sort();
    const replacements = replacementTargets.get(record.key) ?? [];
    const original = originalRecordByKey.get(record.key);
    const changed = original === undefined
      || serializeCanonicalYamlRecord(original) !== serializeCanonicalYamlRecord(record.record);
    const wasAccepted = original ? scalar(original, "review_status") === "accepted" : false;
    const nowRejected = scalar(record.record, "review_status") === "rejected";
    let action = "valid_as_is";
    if (!original) action = "add";
    else if (terminalActionOverrides.has(record.key)) action = terminalActionOverrides.get(record.key)!;
    else if (replacements.length > 0 && targetFindings.some((finding) => finding.proposed_action === "split")) action = "split";
    else if (replacements.length > 0 && targetFindings.some((finding) => finding.proposed_action === "merge_duplicate")) action = "merge_duplicate";
    else if (replacements.length > 0 && targetFindings.some((finding) => finding.proposed_action === "retype")) action = "retype";
    else if (wasAccepted && nowRejected) action = "reject";
    else if (CLAIM_KIND_OVERRIDES.has(record.key)) action = "retype";
    else if (changed) action = "revise";
    else if (targetFindings.some((finding) => finding.proposed_action === "retire")) action = "retire";
    else if (targetFindings.some((finding) => finding.proposed_action === "retype")) action = "retype";
    else if (targetFindings.length > 0) action = "revise";
    const resolutions = [...new Set(findingIds.map((findingId) => findingResolutions.get(findingId)).filter(Boolean))];
    const rationaleOverride = decisionRationaleOverrides.get(record.key);
    const rationale = rationaleOverride
      ? `${rationaleOverride} Final action: ${action}.`
      : resolutions.length > 0
        ? `${resolutions.join("; ")}. Final action: ${action}.`
        : original
          ? changed
            ? `The snapshot-bound migration changed ${record.key} only through deterministic source, status, citation, identity, or provenance repair; final action: ${action}.`
            : `Both complete source passes re-observed ${record.key}; its terminal item-level disposition is ${action} with no canonical byte change required.`
          : `Added ${record.key} as an explicit source-bound replacement or omission repair with a unique stable identity; final action: add.`;
    return {
      target_key: record.key,
      action,
      rationale,
      finding_ids: findingIds,
      replacement_target_keys: replacements,
    };
  });
  const sourceDecisions = [...replacementTargets.entries()]
    .filter(([targetKey]) => targetKey.startsWith("source:"))
    .map(([targetKey, replacements]) => {
      const targetFindings = findingsByTarget.get(targetKey) ?? [];
      return {
        target_key: targetKey,
        action: "add",
        rationale: `${[...new Set(targetFindings.map((finding) => findingResolutions.get(finding.finding_id)).filter(Boolean))].join("; ")}. Final action: add.`,
        finding_ids: targetFindings.map((finding) => finding.finding_id).sort(),
        replacement_target_keys: replacements,
      };
    });
  const decisions = [...recordDecisions, ...sourceDecisions]
    .sort((left, right) => left.target_key.localeCompare(right.target_key));
  const commentaryAuditRetirements = planLegacyCommentaryQualityAuditRetirements(repoRoot);

  return {
    files,
    splitOverlay: { content: splitOverlay.content, sha256: splitOverlay.sha256, sourcePath: atomicSplitOverlayPath },
    omissionOverlay: { content: omissionOverlay.content, sha256: omissionOverlay.sha256, sourcePath: sourceOmissionOverlayPath },
    relationOverlay: { content: relationOverlay.content, sha256: relationOverlay.sha256, sourcePath: relationDependencyOverlayPath },
    commentaryAuditRetirements,
    replacementTargets,
    findingResolutions,
    additions,
    decisions,
    counts: {
      records: records.length,
      findings: findings.length,
      greekTermsRemoved,
      claimsLinked,
      claimsRejectedWithoutEvidence,
      recordsRejected,
      recordsSplit,
      splitReplacements,
      omissionObservationsAdded,
      claimEvidenceObservationsAdded,
      commentaryCitationsAdded,
      commentaryCitationsRemapped,
      commentaryKindsRetyped,
      commentaryQualityAuditsRetired: commentaryAuditRetirements.length,
      commentaryRejectedWithoutCitation,
      relationDependenciesReviewed: relationOverlay.rows.size,
      relationsRevisedForReplacementClaims,
      relationsRejectedForInvalidEndpoints,
      relationsRejectedForInvalidResolution,
      claimObservationLinksPruned,
      observationClaimLinksRebuilt,
      claimsRejectedAfterEvidenceClosure,
      rejectedRecordProseReferencesRewritten,
      recordingsWithdrawnForRejectedChapters,
      recordingRejectedChapterTargets,
      sourceSpanCorrections,
      claimKindCorrections,
      claimStatusCorrections,
    },
  };
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

function receipt(
  plan: SemanticRemediationPlan,
  decisionArtifactPath: string,
  decisionArtifactSha256: string,
  splitOverlayArtifactPath: string,
  omissionOverlayArtifactPath: string,
  relationOverlayArtifactPath: string,
  commentaryAuditRetirementArtifactPath: string,
  commentaryAuditRetirementArtifactSha256: string,
) {
  return [
    "# Ontology vNext semantic remediation receipt",
    "",
    "- source policy: canonical Greek source spans only; no translations used",
    `- normalized findings considered: ${plan.counts.findings}`,
    `- invalid Greek terms removed: ${plan.counts.greekTermsRemoved}`,
    `- accepted claims linked to accepted observations: ${plan.counts.claimsLinked}`,
    `- claims rejected for absent resolvable evidence: ${plan.counts.claimsRejectedWithoutEvidence}`,
    `- semantic records rejected: ${plan.counts.recordsRejected}`,
    `- non-atomic records split: ${plan.counts.recordsSplit}`,
    `- atomic replacements added: ${plan.counts.splitReplacements}`,
    `- source-first omission observations added: ${plan.counts.omissionObservationsAdded}`,
    `- claim-provenance observations added: ${plan.counts.claimEvidenceObservationsAdded}`,
    `- accepted commentary citations added: ${plan.counts.commentaryCitationsAdded}`,
    `- accepted commentary records with replacement citations remapped: ${plan.counts.commentaryCitationsRemapped}`,
    `- rejected empty cross-reference presentation blocks retyped: ${plan.counts.commentaryKindsRetyped}`,
    `- stale ledger-bound commentary quality-audit acceptances retired to content-addressed history: ${plan.counts.commentaryQualityAuditsRetired}`,
    `- commentary rejected for absent resolvable citation: ${plan.counts.commentaryRejectedWithoutCitation}`,
    `- split-claim relation dependencies reviewed: ${plan.counts.relationDependenciesReviewed}`,
    `- relations revised to an accepted atomic claim successor: ${plan.counts.relationsRevisedForReplacementClaims}`,
    `- accepted relations rejected for terminal invalid endpoints: ${plan.counts.relationsRejectedForInvalidEndpoints}`,
    `- accepted standing relations rejected for terminal resolution mismatch: ${plan.counts.relationsRejectedForInvalidResolution}`,
    `- invalid claim-to-observation links pruned: ${plan.counts.claimObservationLinksPruned}`,
    `- accepted observation reciprocal claim-link sets rebuilt: ${plan.counts.observationClaimLinksRebuilt}`,
    `- claims rejected after terminal evidence closure: ${plan.counts.claimsRejectedAfterEvidenceClosure}`,
    `- rejected peer-record references removed or remapped in accepted reader prose: ${plan.counts.rejectedRecordProseReferencesRewritten}`,
    `- recordings withdrawn because a chapter target was rejected: ${plan.counts.recordingsWithdrawnForRejectedChapters}`,
    `- rejected commentary chapter targets retained only in withdrawn recording provenance: ${plan.counts.recordingRejectedChapterTargets}`,
    `- exact source-span corrections: ${plan.counts.sourceSpanCorrections}`,
    `- claim-kind corrections: ${plan.counts.claimKindCorrections}`,
    `- claim-trajectory corrections: ${plan.counts.claimStatusCorrections}`,
    "- reader policy: rejected records remain review provenance and are excluded from semantic output",
    "- counterevidence policy: rejection is not absence or counterevidence",
    `- artifact: \`${decisionArtifactPath}\`; sha256: \`${decisionArtifactSha256}\``,
    `- atomic split overlay: \`${splitOverlayArtifactPath}\`; sha256: \`${plan.splitOverlay.sha256}\``,
    `- source omission overlay: \`${omissionOverlayArtifactPath}\`; sha256: \`${plan.omissionOverlay.sha256}\``,
    `- relation dependency overlay: \`${relationOverlayArtifactPath}\`; sha256: \`${plan.relationOverlay.sha256}\``,
    `- commentary quality-audit retirement ledger: \`${commentaryAuditRetirementArtifactPath}\`; sha256: \`${commentaryAuditRetirementArtifactSha256}\``,
    "",
  ].join("\n");
}

export function applySemanticRemediation(options: {
  repoRoot?: string;
  packagePath?: string;
  atomicSplitOverlayPath?: string;
  sourceOmissionOverlayPath?: string;
  relationDependencyOverlayPath?: string;
} = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot();
  const plan = planSemanticRemediation({ ...options, repoRoot });
  for (const file of plan.files) writeFileSync(join(repoRoot, file.path), file.content, "utf8");
  const packagePath = options.packagePath ?? listOntologyAuditPackagePaths(repoRoot)[0];
  if (!packagePath) throw new Error("Missing ontology audit package for semantic-remediation provenance.");
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const decisionContent = plan.decisions.length === 0
    ? ""
    : `${plan.decisions.map((decision) => canonicalJson(decision)).join("\n")}\n`;
  const decisionSha256 = createHash("sha256").update(decisionContent).digest("hex");
  const decisionRelativeToPackage = `review-inputs/semantic-remediation/sha256-${decisionSha256}-decisions.jsonl`;
  const decisionAbsolutePath = join(absolutePackagePath, decisionRelativeToPackage);
  mkdirSync(dirname(decisionAbsolutePath), { recursive: true });
  const existingDecisionArtifacts = readdirSync(dirname(decisionAbsolutePath), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-decisions\.jsonl$/u.test(entry.name))
    .map((entry) => entry.name);
  if (existingDecisionArtifacts.some((name) => name !== decisionRelativeToPackage.split("/").at(-1))) {
    throw new Error("Refusing to create competing semantic decision artifacts for one frozen audit snapshot.");
  }
  if (existsSync(decisionAbsolutePath) && readFileSync(decisionAbsolutePath, "utf8") !== decisionContent) {
    throw new Error(`Refusing to overwrite content-addressed semantic decisions: ${decisionAbsolutePath}`);
  }
  writeFileSync(decisionAbsolutePath, decisionContent, "utf8");
  const packageRelativePath = relative(repoRoot, absolutePackagePath).split("\\").join("/");
  const decisionArtifactPath = `${packageRelativePath}/${decisionRelativeToPackage}`;
  const splitOverlayRelativeToPackage = `review-inputs/semantic-remediation/sha256-${plan.splitOverlay.sha256}-atomic-splits.jsonl`;
  const splitOverlayAbsolutePath = join(absolutePackagePath, splitOverlayRelativeToPackage);
  const existingSplitArtifacts = readdirSync(dirname(splitOverlayAbsolutePath), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-atomic-splits\.jsonl$/u.test(entry.name))
    .map((entry) => entry.name);
  if (existingSplitArtifacts.some((name) => name !== splitOverlayRelativeToPackage.split("/").at(-1))) {
    throw new Error("Refusing to create competing atomic split artifacts for one frozen audit snapshot.");
  }
  if (existsSync(splitOverlayAbsolutePath) && readFileSync(splitOverlayAbsolutePath, "utf8") !== plan.splitOverlay.content) {
    throw new Error(`Refusing to overwrite content-addressed atomic split overlay: ${splitOverlayAbsolutePath}`);
  }
  writeFileSync(splitOverlayAbsolutePath, plan.splitOverlay.content, "utf8");
  const splitOverlayArtifactPath = `${packageRelativePath}/${splitOverlayRelativeToPackage}`;
  const omissionOverlayRelativeToPackage = `review-inputs/semantic-remediation/sha256-${plan.omissionOverlay.sha256}-source-omissions.jsonl`;
  const omissionOverlayAbsolutePath = join(absolutePackagePath, omissionOverlayRelativeToPackage);
  const existingOmissionArtifacts = readdirSync(dirname(omissionOverlayAbsolutePath), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-source-omissions\.jsonl$/u.test(entry.name))
    .map((entry) => entry.name);
  if (existingOmissionArtifacts.some((name) => name !== omissionOverlayRelativeToPackage.split("/").at(-1))) {
    throw new Error("Refusing to create competing source omission artifacts for one frozen audit snapshot.");
  }
  if (existsSync(omissionOverlayAbsolutePath) && readFileSync(omissionOverlayAbsolutePath, "utf8") !== plan.omissionOverlay.content) {
    throw new Error(`Refusing to overwrite content-addressed source omission overlay: ${omissionOverlayAbsolutePath}`);
  }
  writeFileSync(omissionOverlayAbsolutePath, plan.omissionOverlay.content, "utf8");
  const omissionOverlayArtifactPath = `${packageRelativePath}/${omissionOverlayRelativeToPackage}`;
  const relationOverlayRelativeToPackage = `review-inputs/semantic-remediation/sha256-${plan.relationOverlay.sha256}-relation-dependencies.jsonl`;
  const relationOverlayAbsolutePath = join(absolutePackagePath, relationOverlayRelativeToPackage);
  const existingRelationArtifacts = readdirSync(dirname(relationOverlayAbsolutePath), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-relation-dependencies\.jsonl$/u.test(entry.name))
    .map((entry) => entry.name);
  if (existingRelationArtifacts.some((name) => name !== relationOverlayRelativeToPackage.split("/").at(-1))) {
    throw new Error("Refusing to create competing relation dependency artifacts for one frozen audit snapshot.");
  }
  if (existsSync(relationOverlayAbsolutePath) && readFileSync(relationOverlayAbsolutePath, "utf8") !== plan.relationOverlay.content) {
    throw new Error(`Refusing to overwrite content-addressed relation dependency overlay: ${relationOverlayAbsolutePath}`);
  }
  writeFileSync(relationOverlayAbsolutePath, plan.relationOverlay.content, "utf8");
  const relationOverlayArtifactPath = `${packageRelativePath}/${relationOverlayRelativeToPackage}`;
  const commentaryAuditRetirement = materializeLegacyCommentaryQualityAuditRetirements({
    repoRoot,
    packagePath: absolutePackagePath,
    retirements: plan.commentaryAuditRetirements,
  });
  const commentaryAuditRetirementArtifactPath = commentaryAuditRetirement.artifactPath;
  const commentaryAuditRetirementSha256 = commentaryAuditRetirement.sha256;
  const receiptPath = "wiki/review/2026-08-30-ontology-vnext-semantic-remediation.md";
  writeFileSync(
    join(repoRoot, receiptPath),
    receipt(
      plan,
      decisionArtifactPath,
      decisionSha256,
      splitOverlayArtifactPath,
      omissionOverlayArtifactPath,
      relationOverlayArtifactPath,
      commentaryAuditRetirementArtifactPath,
      commentaryAuditRetirementSha256,
    ),
    "utf8",
  );
  return {
    plan,
    receiptPath,
    decisionArtifactPath,
    splitOverlayArtifactPath,
    omissionOverlayArtifactPath,
    relationOverlayArtifactPath,
    commentaryAuditRetirementArtifactPath,
  };
}

export function semanticRemediationObservationIds(record: CanonicalYamlRecord) {
  return listStrings(record.observation_ids);
}

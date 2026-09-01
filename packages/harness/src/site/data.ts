import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { validateClusterArtifacts, type ObservationCluster } from "../clusters.js";
import { buildCoverageReport, type DialogueCoverage } from "../coverage.js";
import {
  parseObservationTurnJoinToon,
  type ObservationTurnJoinIndex,
} from "../derived/joins.js";
import { buildStephanusIndex } from "../derived/stephanus.js";
import { getRepoRoot } from "../paths.js";
import { createSourceSpanResolver, type SourceSpanResolver } from "../source.js";
import {
  apparatusYamlBlocks,
  dialogueFromApparatusPath,
  listApparatusLedgerPaths,
} from "../wiki/apparatus-ledger.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "../wiki/claim-ledger.js";
import {
  commentaryYamlBlocks,
  dialogueFromCommentaryPath,
  listCommentaryLedgerPaths,
} from "../wiki/commentary-ledger.js";
import { commentaryCites, commentaryCrossrefs } from "../wiki/commentary-validator.js";
import {
  dialogueFromObservationId,
  fieldValue,
  fieldValueOrEmpty,
  listFieldValue,
  listObservationLedgerPaths,
  nestedFieldValueInParent,
  observationYamlBlocks,
} from "../wiki/observation-ledger.js";
import { readOntologyVNextRepository } from "../wiki/ontology-vnext-repository.js";
import type {
  OntologyVNextAxis,
  OntologyVNextConcept,
  OntologyVNextMembership,
  OntologyVNextModel,
} from "../wiki/ontology-vnext.js";
import { validateDossierArtifacts } from "../dossiers.js";
import { titleCase } from "./layout.js";
import { discoverSiteRecordings, type SiteRecording } from "./recordings.js";

export type SiteSourceRef = {
  sourcePath: string;
  stephanusSpan: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  textSha256: string;
};

export type SiteObservation = {
  observationId: string;
  dialogue: string;
  sourceWork: string;
  stephanusSpan: string;
  sourceRef: SiteSourceRef;
  greekTerms: string[];
  englishGloss: string;
  concepts: SiteConceptAssignment[];
  observation: string;
  textualBasis: string;
  limits: string;
  reviewStatus: string;
  greekExcerpt: string;
};

export type SiteConceptAssignment = {
  axisId: string;
  axisKey: string;
  dimension: string;
  conceptId: string;
  conceptKey: string;
  comparisonQuestion: string;
  definition: string;
};

export type SiteClaim = {
  claimId: string;
  dialogue: string;
  sourceWork: string;
  stephanusSpan: string;
  sourceRef: SiteSourceRef;
  speaker: string;
  claimKind: string;
  content: string;
  greekTerms: string[];
  finalStatus: string;
  limits: string;
  reviewStatus: string;
  stanceEvents: Array<{ kind: string; stephanusSpan: string }>;
};

export type SiteRelation = {
  relationId: string;
  dialogue: string;
  claimA: string;
  claimB: string;
  relationKind: string;
  resolution: string;
  basis: string;
  limits: string;
  reviewStatus: string;
};

export type SiteCluster = ObservationCluster & {
  path: string;
};

export type DossierInstance = {
  observationId: string;
  dialogue: string;
  stephanusSpan: string;
  speakers: string[];
  turnCount: number;
};

export type DossierPresence = {
  dialogue: string;
  acceptedObservations: number;
};

export type DossierCooccurrence = {
  axisId: string;
  axisKey: string;
  conceptId: string;
  conceptKey: string;
  overlappingObservations: number;
};

export type SiteDossier = {
  dossierId: string;
  axisId: string;
  axisKey: string;
  dimension: string;
  conceptId: string;
  conceptKey: string;
  comparisonQuestion: string;
  path: string;
  pagePath: string;
  acceptedObservations: number;
  dialogues: number;
  instanceIds: string[];
  instances: DossierInstance[];
  presence: DossierPresence[];
  cooccurrence: DossierCooccurrence[];
};

export type SiteCommentaryBlock = {
  commentaryId: string;
  dialogue: string;
  sourceWork: string;
  blockKind: string;
  placement: string;
  title: string;
  stephanusSpan: string;
  sourceRef: SiteSourceRef;
  body: string;
  cites: { observations: string[]; claims: string[]; relations: string[]; dossiers: string[] };
  crossrefs: Array<{ sourceWork: string; stephanusSpan: string; note: string }>;
  author: string;
  reviewStatus: string;
};

export type CommentarySpineRow = {
  marker: string;
  startChar: number;
  greek: string;
  english: string | undefined;
};

export type SiteCommentaryDialogue = {
  dialogue: string;
  blocks: SiteCommentaryBlock[];
  spine: CommentarySpineRow[];
};

export type SiteApparatusRecord = {
  apparatusId: string;
  dialogue: string;
  kind: "surface_tension" | "structural_marker" | "address_shift";
  stephanusSpan: string;
  sourceRef: SiteSourceRef;
  note: string;
  cites: { observations: string[]; claims: string[]; relations: string[]; dossiers: string[] };
};

export type ToonRow = Record<string, string>;

export type StephanusMarker = {
  marker: string;
  startChar: number;
  endChar: number;
};

export type DialogueDerived = {
  turns: ToonRow[];
  speakers: ToonRow[];
  anchors: ToonRow[];
  procedure: ToonRow[];
  assent: ToonRow[];
};

export type ObservationShard = {
  dialogue: string;
  key: string;
  path: string;
  observations: SiteObservation[];
};

export type RelationShard = {
  dialogue: string;
  part: number;
  partCount: number;
  path: string;
  relations: SiteRelation[];
};

export type ClaimShard = {
  dialogue: string;
  part: number;
  partCount: number;
  path: string;
  claims: SiteClaim[];
};

export type TurnShard = {
  dialogue: string;
  part: number;
  partCount: number;
  path: string;
  turns: ToonRow[];
};

export type ObservationTurnMaps = {
  turnIdsByObservationId: Map<string, string[]>;
  observationIdsByTurnId: Map<string, string[]>;
};

export type ReviewLayer = "observations" | "claims" | "relations";

export type ReviewStatusSummary = {
  total: number;
  statuses: Record<string, number>;
};

export type LayerReviewCounts = Record<ReviewLayer, ReviewStatusSummary>;

export type OntologyAxisRow = {
  axisId: string;
  axisKey: string;
  dimension: string;
  comparisonQuestion: string;
  conceptCount: number;
  membershipCount: number;
  observationCount: number;
  dialogueCount: number;
};

export type OntologyQualitySummary = {
  axes: number;
  concepts: number;
  memberships: number;
  acceptedObservations: number;
  acceptedObservationsWithMemberships: number;
  singletonConcepts: number;
  crossDialogueConcepts: number;
  axisRows: OntologyAxisRow[];
};

export type SiteData = {
  observations: SiteObservation[];
  observationsById: Map<string, SiteObservation>;
  ontology: OntologyVNextModel;
  axes: readonly Readonly<OntologyVNextAxis>[];
  concepts: readonly Readonly<OntologyVNextConcept>[];
  memberships: readonly Readonly<OntologyVNextMembership>[];
  axesById: Map<string, Readonly<OntologyVNextAxis>>;
  conceptsById: Map<string, Readonly<OntologyVNextConcept>>;
  conceptsByObservationId: Map<string, SiteConceptAssignment[]>;
  observationsByConceptId: Map<string, SiteObservation[]>;
  ontologyQuality: OntologyQualitySummary;
  clusters: SiteCluster[];
  claims: SiteClaim[];
  claimsById: Map<string, SiteClaim>;
  claimShards: ClaimShard[];
  claimPageById: Map<string, string>;
  relations: SiteRelation[];
  relationsByClaimId: Map<string, SiteRelation[]>;
  stephanusByDialogue: Map<string, StephanusMarker[]>;
  dossiers: SiteDossier[];
  commentaryByDialogue: Map<string, SiteCommentaryDialogue>;
  apparatusByDialogue: Map<string, SiteApparatusRecord[]>;
  derivedByDialogue: Map<string, DialogueDerived>;
  observationTurnJoinsByDialogue: Map<string, ObservationTurnJoinIndex>;
  turnIdsByObservationId: Map<string, string[]>;
  observationIdsByTurnId: Map<string, string[]>;
  turnShards: TurnShard[];
  turnPageById: Map<string, string>;
  shards: ObservationShard[];
  observationPageById: Map<string, string>;
  relationShards: RelationShard[];
  relationPageById: Map<string, string>;
  commentaryPageById: Map<string, string>;
  dossierPageByConceptId: Map<string, string>;
  recordingsByDialogue: Map<string, SiteRecording>;
  sourceResolver: SourceSpanResolver;
  sourceAttribution: string;
  coverage: DialogueCoverage[];
  reviewStatusCounts: LayerReviewCounts;
  unattributedDialogues: string[];
  rawCoverageMarkdown: string;
};

function numberField(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sourceRefFromBlock(block: string): SiteSourceRef {
  return {
    sourcePath: nestedFieldValueInParent(block, "source_ref", "source_path"),
    stephanusSpan: nestedFieldValueInParent(block, "source_ref", "stephanus_span"),
    startMarker: nestedFieldValueInParent(block, "source_ref", "start_marker"),
    endMarker: nestedFieldValueInParent(block, "source_ref", "end_marker"),
    startChar: numberField(nestedFieldValueInParent(block, "source_ref", "start_char")),
    endChar: numberField(nestedFieldValueInParent(block, "source_ref", "end_char")),
    textSha256: nestedFieldValueInParent(block, "source_ref", "text_sha256"),
  };
}

export function groupBy<T>(items: readonly T[], key: (item: T) => string) {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const value = key(item);
    const entries = grouped.get(value) ?? [];
    entries.push(item);
    grouped.set(value, entries);
  }
  return grouped;
}

// Fail closed if a record body ever reads as a bare block-scalar indicator
// again: that means the ledger loader dropped the field's indented body, and
// the reading margin would render "|" as the record's lead.
function guardedBody(recordId: string, field: string, value: string) {
  if (/^[|>][+-]?$/u.test(value.trim()) && value.trim() !== "") {
    throw new Error(
      `${recordId} ${field} parsed as a bare block-scalar indicator (${value.trim()}) — ledger loader dropped the body.`,
    );
  }
  return value.trimEnd();
}

export function parseObservationLedger(
  content: string,
  sourceResolver: SourceSpanResolver = createSourceSpanResolver(),
): SiteObservation[] {
  const observations: SiteObservation[] = [];

  for (const block of observationYamlBlocks(content)) {
    const observationId = fieldValueOrEmpty(block, "observation_id");
    if (!observationId) continue;

    const dialogue = dialogueFromObservationId(observationId, "unknown");
    const stephanusSpan = fieldValueOrEmpty(block, "stephanus_span");
    const sourceRef = sourceRefFromBlock(block);
    const greekExcerpt = sourceResolver.resolveSourceSpan(dialogue, stephanusSpan).text;

    observations.push({
      observationId,
      dialogue,
      sourceWork: fieldValueOrEmpty(block, "source_work") || titleCase(dialogue),
      stephanusSpan,
      sourceRef,
      greekTerms: listFieldValue(block, "greek_terms"),
      englishGloss: fieldValueOrEmpty(block, "english_gloss"),
      concepts: [],
      observation: guardedBody(observationId, "observation", fieldValueOrEmpty(block, "observation")),
      textualBasis: guardedBody(observationId, "textual_basis", fieldValueOrEmpty(block, "textual_basis")),
      limits: fieldValueOrEmpty(block, "limits"),
      reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
      greekExcerpt,
    });
  }

  return observations;
}

function readObservationsFromDisk(sourceResolver: SourceSpanResolver) {
  return listObservationLedgerPaths({ absolute: true })
    .flatMap((path) => parseObservationLedger(readFileSync(path, "utf8"), sourceResolver))
    .sort((a, b) => a.observationId.localeCompare(b.observationId));
}

function parseStanceEvents(block: string) {
  const eventsMatch = /^stance_events:\s*$([\s\S]*?)(?=^\S|$)/mu.exec(block);
  if (!eventsMatch?.[1]) return [];

  const events: Array<{ kind: string; stephanusSpan: string }> = [];
  for (const chunk of eventsMatch[1].split(/\n\s+- /u).filter((entry) => entry.trim().length > 0)) {
    const kind = /^\s*kind:\s*(.*)$/mu.exec(chunk)?.[1]?.trim().replace(/^["']|["']$/gu, "") ?? "";
    const stephanusSpan = /^\s*stephanus_span:\s*(.*)$/mu.exec(chunk)?.[1]?.trim().replace(/^["']|["']$/gu, "") ?? "";
    if (kind || stephanusSpan) events.push({ kind, stephanusSpan });
  }
  return events;
}

function dialogueFromClaimId(claimId: string, fallback: string) {
  return /^claim_([a-z0-9-]+)_\d+$/u.exec(claimId)?.[1] ?? fallback;
}

export function parseClaimLedger(content: string, dialogueFallback = "unknown") {
  const claims: SiteClaim[] = [];
  for (const block of claimYamlBlocks(content)) {
    const claimId = fieldValueOrEmpty(block, "claim_id");
    if (!claimId) continue;

    const dialogue = dialogueFromClaimId(claimId, dialogueFallback);
    claims.push({
      claimId,
      dialogue,
      sourceWork: fieldValueOrEmpty(block, "source_work") || titleCase(dialogue),
      stephanusSpan: fieldValueOrEmpty(block, "stephanus_span"),
      sourceRef: sourceRefFromBlock(block),
      speaker: fieldValueOrEmpty(block, "speaker"),
      claimKind: fieldValueOrEmpty(block, "claim_kind"),
      content: guardedBody(claimId, "content", fieldValueOrEmpty(block, "content")),
      greekTerms: listFieldValue(block, "greek_terms"),
      finalStatus: fieldValueOrEmpty(block, "final_status"),
      limits: fieldValueOrEmpty(block, "limits"),
      reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
      stanceEvents: parseStanceEvents(block),
    });
  }
  return claims;
}

function readClaimsFromDisk() {
  return listClaimLedgerPaths({ absolute: true })
    .flatMap((path) => parseClaimLedger(readFileSync(path, "utf8"), basename(path, ".md")))
    .sort((a, b) => a.claimId.localeCompare(b.claimId));
}

function parseRelationBlocks(content: string, dialogueFallback: string) {
  const blocks = [...content.matchAll(/```yaml\n([\s\S]*?)\n```/gu)].map((match) => match[1] ?? "");
  return blocks
    .map((block): SiteRelation | undefined => {
      const relationId = fieldValueOrEmpty(block, "relation_id");
      if (!relationId) return undefined;
      const idDialogue = /^rel_([a-z0-9-]+)_\d+$/u.exec(relationId)?.[1];
      return {
        relationId,
        dialogue: idDialogue ?? dialogueFallback,
        claimA: fieldValueOrEmpty(block, "claim_a"),
        claimB: fieldValueOrEmpty(block, "claim_b"),
        relationKind: fieldValueOrEmpty(block, "relation_kind"),
        resolution: fieldValueOrEmpty(block, "resolution"),
        basis: fieldValueOrEmpty(block, "basis"),
        limits: fieldValueOrEmpty(block, "limits"),
        reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
      };
    })
    .filter((relation): relation is SiteRelation => relation !== undefined);
}

function readRelationsFromDisk() {
  const relationDir = join(getRepoRoot(), "wiki/relations");
  if (!existsSync(relationDir)) return [];
  return readdirSync(relationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .flatMap((entry) => parseRelationBlocks(readFileSync(join(relationDir, entry.name), "utf8"), basename(entry.name, ".md")))
    .filter((relation) => relation.reviewStatus === "accepted")
    .sort((a, b) => a.relationId.localeCompare(b.relationId));
}

function parseCommentaryLedger(content: string, dialogue: string): SiteCommentaryBlock[] {
  const blocks: SiteCommentaryBlock[] = [];
  for (const block of commentaryYamlBlocks(content)) {
    const commentaryId = fieldValueOrEmpty(block, "commentary_id");
    if (!commentaryId) continue;

    blocks.push({
      commentaryId,
      dialogue,
      sourceWork: fieldValueOrEmpty(block, "source_work") || titleCase(dialogue),
      blockKind: fieldValueOrEmpty(block, "block_kind"),
      placement: fieldValueOrEmpty(block, "placement") || "before",
      title: fieldValueOrEmpty(block, "title"),
      stephanusSpan: fieldValueOrEmpty(block, "stephanus_span"),
      sourceRef: sourceRefFromBlock(block),
      body: fieldValueOrEmpty(block, "body"),
      cites: commentaryCites(block),
      crossrefs: commentaryCrossrefs(block),
      author: fieldValueOrEmpty(block, "author"),
      reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
    });
  }

  const placementOrder = (placement: string) => (placement === "after" ? 1 : 0);
  return blocks.sort(
    (a, b) =>
      a.sourceRef.startChar - b.sourceRef.startChar ||
      placementOrder(a.placement) - placementOrder(b.placement) ||
      a.commentaryId.localeCompare(b.commentaryId),
  );
}

function commentarySpine(dialogue: string, sourceResolver: SourceSpanResolver): CommentarySpineRow[] {
  const englishExists = existsSync(join(getRepoRoot(), `raw/plato/english/${dialogue}.txt`));

  return buildStephanusIndex(dialogue).markers.map((marker) => {
    let english: string | undefined;
    if (englishExists) {
      try {
        english = sourceResolver.resolveEnglishSpan(dialogue, marker.marker).text;
      } catch {
        english = undefined;
      }
    }

    return {
      marker: marker.marker,
      startChar: marker.startChar,
      greek: sourceResolver.resolveSourceSpan(dialogue, marker.marker).text,
      english,
    };
  });
}

function readCommentaryFromDisk(sourceResolver: SourceSpanResolver) {
  const byDialogue = new Map<string, SiteCommentaryDialogue>();
  for (const relativePath of listCommentaryLedgerPaths()) {
    const dialogue = dialogueFromCommentaryPath(relativePath);
    if (!dialogue) continue;

    const blocks = parseCommentaryLedger(readFileSync(join(getRepoRoot(), relativePath), "utf8"), dialogue);
    if (blocks.length === 0) continue;
    byDialogue.set(dialogue, { dialogue, blocks, spine: commentarySpine(dialogue, sourceResolver) });
  }

  return byDialogue;
}

const APPARATUS_KINDS = new Set(["surface_tension", "structural_marker", "address_shift"]);

function parseApparatusLedger(content: string, dialogue: string): SiteApparatusRecord[] {
  const records: SiteApparatusRecord[] = [];
  for (const block of apparatusYamlBlocks(content)) {
    const apparatusId = fieldValueOrEmpty(block, "apparatus_id");
    const kind = fieldValueOrEmpty(block, "kind");
    // The site renders accepted records only; the validator guards well-formedness.
    if (!apparatusId || fieldValueOrEmpty(block, "review_status") !== "accepted") continue;
    if (!APPARATUS_KINDS.has(kind)) continue;
    records.push({
      apparatusId,
      dialogue,
      kind: kind as SiteApparatusRecord["kind"],
      stephanusSpan: fieldValueOrEmpty(block, "stephanus_span"),
      sourceRef: sourceRefFromBlock(block),
      note: fieldValueOrEmpty(block, "note"),
      cites: commentaryCites(block),
    });
  }
  return records.sort(
    (a, b) => a.sourceRef.startChar - b.sourceRef.startChar || a.apparatusId.localeCompare(b.apparatusId),
  );
}

function readApparatusFromDisk() {
  const byDialogue = new Map<string, SiteApparatusRecord[]>();
  for (const relativePath of listApparatusLedgerPaths()) {
    const dialogue = dialogueFromApparatusPath(relativePath);
    if (!dialogue) continue;
    const records = parseApparatusLedger(readFileSync(join(getRepoRoot(), relativePath), "utf8"), dialogue);
    if (records.length === 0) continue;
    byDialogue.set(dialogue, records);
  }
  return byDialogue;
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!plainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareStableText(left, right))
      .map(([key, entry]) => [key, canonicalValue(entry)]),
  );
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], context: string) {
  const actual = Object.keys(value).sort(compareStableText);
  const expected = [...keys].sort(compareStableText);
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${context}: expected fields ${expected.join(", ")}; found ${actual.join(", ")}.`);
  }
}

function requiredProjectionString(value: unknown, context: string) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${context}: expected non-empty string.`);
  return value;
}

function requiredProjectionInteger(value: unknown, context: string) {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${context}: expected non-negative integer.`);
  return Number(value);
}

function requiredProjectionStrings(value: unknown, context: string) {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && entry.trim() !== "")) {
    throw new Error(`${context}: expected string array.`);
  }
  return value as string[];
}

export function parseClusterFile(path: string, content: string): SiteCluster[] {
  if (content === "" || !content.endsWith("\n") || content.endsWith("\n\n") || content.includes("\r")) {
    throw new Error(`${path}: cluster JSONL must contain canonical LF-terminated rows.`);
  }
  return content
    .slice(0, -1)
    .split("\n")
    .map((line, index) => {
      const context = `${path}:${index + 1}`;
      let parsed: unknown;
      try {
        parsed = JSON.parse(line) as unknown;
      } catch (error) {
        throw new Error(`${context}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (!plainObject(parsed)) throw new Error(`${context}: expected one JSON object.`);
      if (JSON.stringify(canonicalValue(parsed)) !== line) throw new Error(`${context}: non-canonical JSON.`);
      exactKeys(parsed, [
        "schema_version", "projection_kind", "axis_id", "axis_key", "dimension", "concept_id",
        "concept_key", "comparison_question", "observation_ids", "dialogues", "spans",
      ], context);
      if (parsed.schema_version !== 1 || parsed.projection_kind !== "observation_cluster") {
        throw new Error(`${context}: unsupported cluster projection.`);
      }
      const observationIds = requiredProjectionStrings(parsed.observation_ids, `${context}/observation_ids`);
      const dialogues = requiredProjectionStrings(parsed.dialogues, `${context}/dialogues`);
      if (!plainObject(parsed.spans)) throw new Error(`${context}/spans: expected object.`);
      const spans = parsed.spans;
      exactKeys(spans, observationIds, `${context}/spans`);
      const observations = observationIds.map((observationId) => ({
        observationId,
        dialogue: dialogueFromObservationId(observationId),
        stephanusSpan: requiredProjectionString(spans[observationId], `${context}/spans/${observationId}`),
      }));
      return {
        axisId: requiredProjectionString(parsed.axis_id, `${context}/axis_id`),
        axisKey: requiredProjectionString(parsed.axis_key, `${context}/axis_key`),
        dimension: requiredProjectionString(parsed.dimension, `${context}/dimension`),
        conceptId: requiredProjectionString(parsed.concept_id, `${context}/concept_id`),
        conceptKey: requiredProjectionString(parsed.concept_key, `${context}/concept_key`),
        comparisonQuestion: requiredProjectionString(parsed.comparison_question, `${context}/comparison_question`),
        observations,
        dialogues,
        path,
      };
    });
}

function readClustersFromDisk() {
  const failures = validateClusterArtifacts();
  if (failures.length > 0) throw new Error(`Invalid cluster projections:\n${failures.join("\n")}`);
  const clusterDir = join(getRepoRoot(), "wiki/clusters");
  if (!existsSync(clusterDir)) throw new Error("wiki/clusters is required for the site build.");
  return readdirSync(clusterDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl"))
    .flatMap((entry) => parseClusterFile(
      `wiki/clusters/${entry.name}`,
      readFileSync(join(clusterDir, entry.name), "utf8"),
    ))
    .sort((left, right) => compareStableText(left.axisId, right.axisId) || compareStableText(left.conceptId, right.conceptId));
}

export function parseDossierFile(filePath: string, content: string): SiteDossier {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!plainObject(parsed)) throw new Error(`${filePath}: expected one JSON object.`);
  if (`${JSON.stringify(canonicalValue(parsed), null, 2)}\n` !== content) {
    throw new Error(`${filePath}: non-canonical JSON.`);
  }
  exactKeys(parsed, [
    "schema_version", "projection_kind", "projection_id", "axis_id", "axis_key", "dimension",
    "concept_id", "concept_key", "comparison_question", "accepted_observations", "dialogues",
    "instance_ids", "instances", "presence", "cooccurrence",
  ], filePath);
  if (parsed.schema_version !== 1 || parsed.projection_kind !== "concept_dossier") {
    throw new Error(`${filePath}: unsupported dossier projection.`);
  }
  const instancesRaw = parsed.instances;
  if (!Array.isArray(instancesRaw)) throw new Error(`${filePath}/instances: expected array.`);
  const instances = instancesRaw.map((entry, index): DossierInstance => {
    const context = `${filePath}/instances/${index}`;
    if (!plainObject(entry)) throw new Error(`${context}: expected object.`);
    exactKeys(entry, ["observationId", "dialogue", "stephanusSpan", "speakers", "turnCount"], context);
    return {
      observationId: requiredProjectionString(entry.observationId, `${context}/observationId`),
      dialogue: requiredProjectionString(entry.dialogue, `${context}/dialogue`),
      stephanusSpan: requiredProjectionString(entry.stephanusSpan, `${context}/stephanusSpan`),
      speakers: requiredProjectionStrings(entry.speakers, `${context}/speakers`),
      turnCount: requiredProjectionInteger(entry.turnCount, `${context}/turnCount`),
    };
  });
  if (!Array.isArray(parsed.presence)) throw new Error(`${filePath}/presence: expected array.`);
  const presence = parsed.presence.map((entry, index): DossierPresence => {
    const context = `${filePath}/presence/${index}`;
    if (!plainObject(entry)) throw new Error(`${context}: expected object.`);
    exactKeys(entry, ["dialogue", "acceptedObservations"], context);
    return {
      dialogue: requiredProjectionString(entry.dialogue, `${context}/dialogue`),
      acceptedObservations: requiredProjectionInteger(entry.acceptedObservations, `${context}/acceptedObservations`),
    };
  });
  if (!Array.isArray(parsed.cooccurrence)) throw new Error(`${filePath}/cooccurrence: expected array.`);
  const cooccurrence = parsed.cooccurrence.map((entry, index): DossierCooccurrence => {
    const context = `${filePath}/cooccurrence/${index}`;
    if (!plainObject(entry)) throw new Error(`${context}: expected object.`);
    exactKeys(entry, ["axisId", "axisKey", "conceptId", "conceptKey", "overlappingObservations"], context);
    return {
      axisId: requiredProjectionString(entry.axisId, `${context}/axisId`),
      axisKey: requiredProjectionString(entry.axisKey, `${context}/axisKey`),
      conceptId: requiredProjectionString(entry.conceptId, `${context}/conceptId`),
      conceptKey: requiredProjectionString(entry.conceptKey, `${context}/conceptKey`),
      overlappingObservations: requiredProjectionInteger(entry.overlappingObservations, `${context}/overlappingObservations`),
    };
  });
  const axisKey = requiredProjectionString(parsed.axis_key, `${filePath}/axis_key`);
  const conceptKey = requiredProjectionString(parsed.concept_key, `${filePath}/concept_key`);
  const conceptId = requiredProjectionString(parsed.concept_id, `${filePath}/concept_id`);
  const dossierId = requiredProjectionString(parsed.projection_id, `${filePath}/projection_id`);
  if (dossierId !== `dossier:${conceptId}`) throw new Error(`${filePath}: projection_id does not match concept_id.`);
  const instanceIds = requiredProjectionStrings(parsed.instance_ids, `${filePath}/instance_ids`);
  if (instanceIds.length !== instances.length || instanceIds.some((id, index) => id !== instances[index]?.observationId)) {
    throw new Error(`${filePath}: instance_ids do not exactly match instances.`);
  }
  return {
    dossierId,
    axisId: requiredProjectionString(parsed.axis_id, `${filePath}/axis_id`),
    axisKey,
    dimension: requiredProjectionString(parsed.dimension, `${filePath}/dimension`),
    conceptId,
    conceptKey,
    comparisonQuestion: requiredProjectionString(parsed.comparison_question, `${filePath}/comparison_question`),
    path: relative(getRepoRoot(), filePath),
    pagePath: `dossiers/${axisKey}/${conceptKey}.html`,
    acceptedObservations: requiredProjectionInteger(parsed.accepted_observations, `${filePath}/accepted_observations`),
    dialogues: requiredProjectionInteger(parsed.dialogues, `${filePath}/dialogues`),
    instanceIds,
    instances,
    presence,
    cooccurrence,
  };
}

function readDossiersFromDisk() {
  const failures = validateDossierArtifacts();
  if (failures.length > 0) throw new Error(`Invalid dossier projections:\n${failures.join("\n")}`);
  const dossierDir = join(getRepoRoot(), "wiki/dossiers");
  if (!existsSync(dossierDir)) throw new Error("wiki/dossiers is required for the site build.");
  const dossiers: SiteDossier[] = [];
  for (const axisEntry of readdirSync(dossierDir, { withFileTypes: true }).sort((a, b) => compareStableText(a.name, b.name))) {
    if (!axisEntry.isDirectory()) continue;
    const axisDir = join(dossierDir, axisEntry.name);
    for (const fileEntry of readdirSync(axisDir, { withFileTypes: true }).sort((a, b) => compareStableText(a.name, b.name))) {
      if (!fileEntry.isFile() || !fileEntry.name.endsWith(".json")) continue;
      const path = join(axisDir, fileEntry.name);
      dossiers.push(parseDossierFile(path, readFileSync(path, "utf8")));
    }
  }
  return dossiers.sort((left, right) => compareStableText(left.axisId, right.axisId) || compareStableText(left.conceptId, right.conceptId));
}

export function parseToonTable(content: string, section: string, path = "<inline>"): ToonRow[] {
  const lines = content.split(/\r?\n/u);
  const escapedSection = section.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const sectionPattern = new RegExp(`^${escapedSection}\\[(\\d+)\\]:\\s*$`, "u");
  const tablePattern = /^[a-z_][a-z0-9_]*\[\d+\]:\s*$/u;
  const declarations = lines.flatMap((line, index) => {
    const match = sectionPattern.exec(line);
    return match ? [{ index, count: Number(match[1]) }] : [];
  });
  const label = `${path} [${section}]`;

  if (declarations.length === 0) {
    throw new Error(`Malformed TOON table ${label}: missing declaration.`);
  }
  if (declarations.length > 1) {
    throw new Error(`Malformed TOON table ${label}: duplicate declarations.`);
  }

  const declaration = declarations[0]!;
  let headerIndex = declaration.index + 1;
  while (headerIndex < lines.length && !lines[headerIndex]?.trim()) headerIndex += 1;
  const headerLine = lines[headerIndex];
  if (!headerLine || tablePattern.test(headerLine) || !headerLine.includes("|")) {
    throw new Error(`Malformed TOON table ${label}: missing column header.`);
  }

  const headers = headerLine.split("|").map((part) => part.trim());
  if (headers.length < 2 || headers.some((header) => !header) || new Set(headers).size !== headers.length) {
    throw new Error(`Malformed TOON table ${label}: invalid column header.`);
  }

  const rows: ToonRow[] = [];
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (tablePattern.test(line)) break;
    if (!line.trim()) continue;

    const cells = line.split("|").map((part) => part.trim());
    if (cells.length !== headers.length) {
      throw new Error(
        `Malformed TOON table ${label}: row ${index + 1} has ${cells.length} cells; expected ${headers.length}.`,
      );
    }

    const row: ToonRow = {};
    for (const [cellIndex, header] of headers.entries()) row[header] = cells[cellIndex] ?? "";
    rows.push(row);
  }

  if (rows.length !== declaration.count) {
    throw new Error(
      `Malformed TOON table ${label}: declared ${declaration.count} rows; found ${rows.length}.`,
    );
  }
  return rows;
}

function readToonRows(path: string, section: string) {
  return existsSync(path) ? parseToonTable(readFileSync(path, "utf8"), section, path) : [];
}

function readSiteSpeakerRows(path: string) {
  return readToonRows(path, "speakers").map((row) =>
    row.speaker === "(none)" ? { ...row, speaker: "(unattributed)" } : row,
  );
}

function readSiteTurnRows(dialogue: string) {
  const canonicalPath = join(getRepoRoot(), `derived/plato/turns/${dialogue}.toon`);
  const metricsPath = join(getRepoRoot(), `derived/plato/metrics/turn-lengths/${dialogue}.toon`);
  const canonical = readToonRows(canonicalPath, "turns");
  const metrics = readToonRows(metricsPath, "turns");
  if (metrics.length === 0) return canonical;

  const canonicalIds = new Set(canonical.map((row) => row.turn_id));
  const metricsById = new Map<string, ToonRow>();
  for (const row of metrics) {
    const turnId = row.turn_id;
    if (!turnId || !canonicalIds.has(turnId)) {
      throw new Error(`Turn metrics ${metricsPath} reference unknown turn ${turnId || "(missing)"}.`);
    }
    if (metricsById.has(turnId)) throw new Error(`Turn metrics ${metricsPath} duplicate turn ${turnId}.`);
    metricsById.set(turnId, row);
  }
  const missing = canonical.find((row) => !metricsById.has(row.turn_id ?? ""));
  if (missing) throw new Error(`Turn metrics ${metricsPath} omit canonical turn ${missing.turn_id ?? "(missing)"}.`);

  const sharedFields = ["speaker", "start_marker", "end_marker", "start_char", "end_char", "greek_char_count"];
  return canonical.map((row) => {
    const metric = metricsById.get(row.turn_id!)!;
    for (const field of sharedFields) {
      if (row[field] !== undefined && metric[field] !== undefined && row[field] !== metric[field]) {
        throw new Error(`Turn metrics ${metricsPath} disagree with ${row.turn_id} on ${field}.`);
      }
    }
    return { ...row, ...metric };
  });
}

// Persisted Stephanus marker table per dialogue (derived/plato/stephanus/<d>.toon).
// The record map draws its character-position axis and page gridlines from these
// rows; parse the persisted derivative rather than recompute from source.
function readStephanusByDialogue(dialogues: string[]) {
  const result = new Map<string, StephanusMarker[]>();
  for (const dialogue of dialogues) {
    const path = join(getRepoRoot(), `derived/plato/stephanus/${dialogue}.toon`);
    if (!existsSync(path)) continue;
    const rows = parseToonTable(readFileSync(path, "utf8"), "markers", path).map((row) => ({
      marker: row.marker ?? "",
      startChar: numberField(row.start_char ?? ""),
      endChar: numberField(row.end_char ?? ""),
    }));
    result.set(dialogue, rows);
  }
  return result;
}

// Relations indexed by the ids of the two claims they join. The per-dialogue
// records page selects a dialogue's corpus links by CLAIM MEMBERSHIP, not by
// relation.dialogue — every cross-dialogue relation files under "cross-dialogue",
// so relation.dialogue silently hides them (apology shows zero otherwise).
export function buildRelationsByClaimId(relations: readonly SiteRelation[]) {
  const index = new Map<string, SiteRelation[]>();
  for (const relation of relations) {
    if (relation.reviewStatus !== "accepted") continue;
    for (const claimId of [relation.claimA, relation.claimB]) {
      if (!claimId) continue;
      const list = index.get(claimId) ?? [];
      list.push(relation);
      index.set(claimId, list);
    }
  }
  return index;
}

function listGreekDialoguesFromDisk() {
  const greekDir = join(getRepoRoot(), "raw/plato/greek");
  if (!existsSync(greekDir)) return [];
  return readdirSync(greekDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => basename(entry.name, ".txt"))
    .sort();
}

function readDerivedByDialogue(dialogues: string[]) {
  const result = new Map<string, DialogueDerived>();
  for (const dialogue of dialogues) {
    result.set(dialogue, {
      turns: readSiteTurnRows(dialogue),
      speakers: readSiteSpeakerRows(join(getRepoRoot(), `derived/plato/metrics/turn-lengths/${dialogue}.toon`)),
      anchors: readToonRows(join(getRepoRoot(), `derived/plato/anchors/${dialogue}.toon`), "anchors"),
      procedure: readToonRows(join(getRepoRoot(), `derived/plato/metrics/procedure/${dialogue}.toon`), "candidates"),
      assent: readToonRows(join(getRepoRoot(), `derived/plato/metrics/assent/${dialogue}.toon`), "stretches"),
    });
  }
  return result;
}

function compareStableText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function assertTurnIdForDialogue(turnId: string | undefined, dialogue: string) {
  const prefix = `turn_${dialogue}_`;
  if (!turnId || !turnId.startsWith(prefix) || !/^\d{4}$/u.test(turnId.slice(prefix.length))) {
    throw new Error(`Malformed turn ID in ${dialogue}: ${turnId || "(missing)"}.`);
  }
  return turnId;
}

function readObservationTurnJoinsFromDisk() {
  const directory = join(getRepoRoot(), "derived/plato/joins");
  const joins = new Map<string, ObservationTurnJoinIndex>();
  if (!existsSync(directory)) return joins;

  for (const entry of readdirSync(directory, { withFileTypes: true })
    .filter((candidate) => candidate.isFile() && candidate.name.endsWith(".toon"))
    .sort((a, b) => compareStableText(a.name, b.name))) {
    const path = join(directory, entry.name);
    let parsed: ObservationTurnJoinIndex;
    try {
      parsed = parseObservationTurnJoinToon(readFileSync(path, "utf8"));
    } catch (error) {
      throw new Error(
        `Failed to parse observation-turn join ${relative(getRepoRoot(), path)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    const filenameDialogue = basename(entry.name, ".toon");
    if (
      parsed.dialogue !== filenameDialogue ||
      parsed.ledgerPath !== `wiki/observations/${parsed.dialogue}.md` ||
      parsed.turnIndexPath !== `derived/plato/turns/${parsed.dialogue}.toon`
    ) {
      throw new Error(`Observation-turn join metadata does not match ${relative(getRepoRoot(), path)}.`);
    }
    if (joins.has(parsed.dialogue)) {
      throw new Error(`Duplicate observation-turn join for ${parsed.dialogue}.`);
    }
    joins.set(parsed.dialogue, parsed);
  }
  return joins;
}

export function buildObservationTurnMaps(
  joinsByDialogue: ReadonlyMap<string, ObservationTurnJoinIndex>,
  observationsById: ReadonlyMap<string, SiteObservation>,
  derivedByDialogue: ReadonlyMap<string, DialogueDerived>,
): ObservationTurnMaps {
  const turnIdsByObservationId = new Map<string, string[]>(
    [...observationsById.keys()].sort(compareStableText).map((observationId) => [observationId, []]),
  );
  const observationIdsByTurnId = new Map<string, string[]>();
  const turnDialogueById = new Map<string, string>();
  const turnRankById = new Map<string, number>();

  for (const [dialogue, derived] of [...derivedByDialogue.entries()].sort(([a], [b]) => compareStableText(a, b))) {
    const orderedTurns = [...derived.turns].sort((a, b) => compareStableText(a.turn_id ?? "", b.turn_id ?? ""));
    for (const [index, turn] of orderedTurns.entries()) {
      const turnId = assertTurnIdForDialogue(turn.turn_id, dialogue);
      if (turnDialogueById.has(turnId)) throw new Error(`Duplicate derived turn ID: ${turnId}.`);
      turnDialogueById.set(turnId, dialogue);
      turnRankById.set(turnId, index);
      observationIdsByTurnId.set(turnId, []);
    }
  }

  const joinedObservationIds = new Set<string>();
  for (const [dialogue, joinIndex] of [...joinsByDialogue.entries()].sort(([a], [b]) => compareStableText(a, b))) {
    if (joinIndex.dialogue !== dialogue) {
      throw new Error(`Observation-turn join map key ${dialogue} does not match payload ${joinIndex.dialogue}.`);
    }
    for (const row of [...joinIndex.rows].sort((a, b) => compareStableText(a.observationId, b.observationId))) {
      const observation = observationsById.get(row.observationId);
      if (!observation) {
        throw new Error(`Observation-turn join ${dialogue} references unknown observation ${row.observationId}.`);
      }
      if (observation.dialogue !== dialogue) {
        throw new Error(
          `Observation-turn join ${dialogue} references observation ${row.observationId} from ${observation.dialogue}.`,
        );
      }
      if (joinedObservationIds.has(row.observationId)) {
        throw new Error(`Observation-turn join contains duplicate observation ${row.observationId}.`);
      }
      joinedObservationIds.add(row.observationId);

      const uniqueTurnIds = new Set<string>();
      for (const turnId of row.turnIds) {
        if (uniqueTurnIds.has(turnId)) {
          throw new Error(`Observation-turn join ${row.observationId} contains duplicate turn ${turnId}.`);
        }
        uniqueTurnIds.add(turnId);
        const turnDialogue = turnDialogueById.get(turnId);
        if (!turnDialogue) {
          throw new Error(`Observation-turn join ${dialogue} references unknown turn ${turnId}.`);
        }
        if (turnDialogue !== dialogue) {
          throw new Error(`Observation-turn join ${dialogue} references turn ${turnId} from ${turnDialogue}.`);
        }
      }

      const orderedTurnIds = [...uniqueTurnIds].sort(
        (a, b) => (turnRankById.get(a) ?? Number.MAX_SAFE_INTEGER) - (turnRankById.get(b) ?? Number.MAX_SAFE_INTEGER),
      );
      turnIdsByObservationId.set(row.observationId, orderedTurnIds);
      for (const turnId of orderedTurnIds) observationIdsByTurnId.get(turnId)!.push(row.observationId);
    }
  }

  for (const observationIds of observationIdsByTurnId.values()) observationIds.sort(compareStableText);
  return { turnIdsByObservationId, observationIdsByTurnId };
}

function bookRanges(dialogue: string) {
  if (dialogue !== "laws" && dialogue !== "republic") return [];
  const path = join(getRepoRoot(), `raw/plato/greek/${dialogue}.txt`);
  if (!existsSync(path)) return [];

  const content = readFileSync(path, "utf8");
  const starts = [...content.matchAll(/\{b(\d+)\}/gu)].map((match) => ({
    book: match[1] ?? "unknown",
    start: match.index ?? 0,
  }));

  return starts.map((entry, index) => ({
    key: `book-${entry.book}`,
    start: entry.start,
    end: starts[index + 1]?.start ?? content.length + 1,
  }));
}

function shardKeyForObservation(observation: SiteObservation, indexInDialogue: number) {
  const ranges = bookRanges(observation.dialogue);
  const range = ranges.find((entry) => entry.start <= observation.sourceRef.startChar && observation.sourceRef.startChar < entry.end);
  if (range) return range.key;
  return `part-${Math.floor(indexInDialogue / 200) + 1}`;
}

function buildObservationShards(observations: SiteObservation[]) {
  const shards: ObservationShard[] = [];
  const pageById = new Map<string, string>();
  const byDialogue = groupBy(observations, (observation) => observation.dialogue);

  for (const [dialogue, entries] of [...byDialogue.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const byKey = new Map<string, SiteObservation[]>();
    for (const [index, observation] of entries.entries()) {
      const key = shardKeyForObservation(observation, index);
      const keyEntries = byKey.get(key) ?? [];
      keyEntries.push(observation);
      byKey.set(key, keyEntries);
    }
    for (const [key, shardEntries] of [...byKey.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))) {
      const path = `dialogues/${dialogue}/records-${key}.html`;
      shards.push({ dialogue, key, path, observations: shardEntries });
      for (const observation of shardEntries) pageById.set(observation.observationId, `${path}#${observation.observationId}`);
    }
  }

  return { shards, pageById };
}

export function buildRelationShards(relations: SiteRelation[], chunkSize = 400) {
  const shards: RelationShard[] = [];
  const pageById = new Map<string, string>();
  const byDialogue = groupBy(
    relations.filter((relation) => relation.reviewStatus === "accepted"),
    (relation) => relation.dialogue,
  );

  for (const [dialogue, entries] of [...byDialogue.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const shard of buildNumberedShards(
      [...entries].sort((a, b) => a.relationId.localeCompare(b.relationId)),
      chunkSize,
      (part) => (part === 1 ? `dialogues/${dialogue}/relations.html` : `dialogues/${dialogue}/relations-${part}.html`),
    )) {
      shards.push({ dialogue, ...shard, relations: shard.items });
      for (const relation of shard.items) pageById.set(relation.relationId, `${shard.path}#${relation.relationId}`);
    }
  }

  return { shards, pageById };
}

function buildNumberedShards<T>(entries: T[], chunkSize: number, pathForPart: (part: number) => string) {
  if (!Number.isSafeInteger(chunkSize) || chunkSize <= 0) throw new Error("Shard size must be a positive integer.");
  const partCount = Math.ceil(entries.length / chunkSize);
  return Array.from({ length: partCount }, (_, index) => {
    const part = index + 1;
    return {
      part,
      partCount,
      path: pathForPart(part),
      items: entries.slice(index * chunkSize, part * chunkSize),
    };
  });
}

export function buildTurnShards(
  derivedByDialogue: ReadonlyMap<string, DialogueDerived>,
  chunkSize = 250,
) {
  const shards: TurnShard[] = [];
  const pageById = new Map<string, string>();
  const seenTurnIds = new Set<string>();

  for (const [dialogue, derived] of [...derivedByDialogue.entries()].sort(([a], [b]) => compareStableText(a, b))) {
    const turns = [...derived.turns].sort((a, b) => compareStableText(a.turn_id ?? "", b.turn_id ?? ""));
    for (const turn of turns) {
      const turnId = assertTurnIdForDialogue(turn.turn_id, dialogue);
      if (seenTurnIds.has(turnId)) throw new Error(`Duplicate derived turn ID: ${turnId}.`);
      seenTurnIds.add(turnId);
    }
    for (const shard of buildNumberedShards(
      turns,
      chunkSize,
      (part) => (part === 1 ? `dialogues/${dialogue}/turns.html` : `dialogues/${dialogue}/turns-${part}.html`),
    )) {
      shards.push({ dialogue, ...shard, turns: shard.items });
      for (const turn of shard.items) {
        const turnId = turn.turn_id!;
        pageById.set(turnId, `${shard.path}#${turnId}`);
      }
    }
  }

  return { shards, pageById };
}

export function buildClaimShards(claims: SiteClaim[], chunkSize = 250) {
  const shards: ClaimShard[] = [];
  const pageById = new Map<string, string>();
  const byDialogue = groupBy(claims, (claim) => claim.dialogue);

  for (const [dialogue, entries] of [...byDialogue.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const shard of buildNumberedShards(
      [...entries].sort((a, b) => a.claimId.localeCompare(b.claimId)),
      chunkSize,
      (part) => (part === 1 ? `dialogues/${dialogue}/claims.html` : `dialogues/${dialogue}/claims-${part}.html`),
    )) {
      shards.push({ dialogue, ...shard, claims: shard.items });
      for (const claim of shard.items) pageById.set(claim.claimId, `${shard.path}#${claim.claimId}`);
    }
  }

  return { shards, pageById };
}

function readOptionalMarkdown(repoPath: string) {
  const path = join(getRepoRoot(), repoPath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function reviewStatusSummary(items: readonly { reviewStatus: string }[]): ReviewStatusSummary {
  const statuses = Object.fromEntries(
    [...groupBy(items, (item) => item.reviewStatus).entries()]
      .sort(([a], [b]) => compareStableText(a, b))
      .map(([status, entries]) => [status, entries.length]),
  );
  return { total: items.length, statuses };
}

function readSourceAttribution() {
  const content = readOptionalMarkdown("raw/plato/SOURCES.md");
  const upstream = /## Upstream[\s\S]*?(?=\n## |$)/u.exec(content)?.[0] ?? content.slice(0, 2000);
  return upstream.replace(/https?:\/\/\S+/gu, "(external URL omitted)");
}

function conceptAssignment(
  axis: Readonly<OntologyVNextAxis>,
  concept: Readonly<OntologyVNextConcept>,
): SiteConceptAssignment {
  return {
    axisId: axis.axis_id,
    axisKey: axis.axis_key,
    dimension: axis.dimension,
    conceptId: concept.concept_id,
    conceptKey: concept.concept_key,
    comparisonQuestion: concept.comparison_question,
    definition: concept.definition,
  };
}

function buildOntologySiteIndexes(
  ontology: OntologyVNextModel,
  observations: SiteObservation[],
) {
  const axesById = new Map(ontology.axes.map((axis) => [axis.axis_id, axis]));
  const conceptsById = new Map(ontology.concepts.map((concept) => [concept.concept_id, concept]));
  const observationsById = new Map(observations.map((observation) => [observation.observationId, observation]));
  const conceptsByObservationId = new Map<string, SiteConceptAssignment[]>();
  const observationsByConceptId = new Map<string, SiteObservation[]>();

  for (const membership of ontology.memberships) {
    const observation = observationsById.get(membership.observation_id);
    const concept = conceptsById.get(membership.concept_id);
    if (!observation || !concept) throw new Error(`Ontology membership ${membership.membership_id} has an unresolved target.`);
    const axis = axesById.get(concept.axis_id);
    if (!axis) throw new Error(`Ontology concept ${concept.concept_id} has an unresolved axis.`);
    const assignment = conceptAssignment(axis, concept);
    const assignments = conceptsByObservationId.get(observation.observationId) ?? [];
    assignments.push(assignment);
    conceptsByObservationId.set(observation.observationId, assignments);
    const conceptObservations = observationsByConceptId.get(concept.concept_id) ?? [];
    conceptObservations.push(observation);
    observationsByConceptId.set(concept.concept_id, conceptObservations);
  }
  for (const observation of observations) {
    observation.concepts = [...(conceptsByObservationId.get(observation.observationId) ?? [])].sort(
      (left, right) => compareStableText(left.axisId, right.axisId) || compareStableText(left.conceptId, right.conceptId),
    );
  }
  for (const entries of observationsByConceptId.values()) {
    entries.sort((left, right) => compareStableText(left.observationId, right.observationId));
  }

  const conceptsByAxis = groupBy(ontology.concepts, (concept) => concept.axis_id);
  const membershipsByConcept = groupBy(ontology.memberships, (membership) => membership.concept_id);
  const axisRows = ontology.axes.map((axis): OntologyAxisRow => {
    const concepts = conceptsByAxis.get(axis.axis_id) ?? [];
    const conceptIds = new Set(concepts.map((concept) => concept.concept_id));
    const memberships = ontology.memberships.filter((membership) => conceptIds.has(membership.concept_id));
    const observationIds = new Set(memberships.map((membership) => membership.observation_id));
    const dialogues = new Set(
      [...observationIds].map((observationId) => observationsById.get(observationId)?.dialogue).filter((value): value is string => Boolean(value)),
    );
    return {
      axisId: axis.axis_id,
      axisKey: axis.axis_key,
      dimension: axis.dimension,
      comparisonQuestion: axis.comparison_question,
      conceptCount: concepts.length,
      membershipCount: memberships.length,
      observationCount: observationIds.size,
      dialogueCount: dialogues.size,
    };
  });
  const acceptedObservations = observations.filter((observation) => observation.reviewStatus === "accepted");
  const ontologyQuality: OntologyQualitySummary = {
    axes: ontology.axes.length,
    concepts: ontology.concepts.length,
    memberships: ontology.memberships.length,
    acceptedObservations: acceptedObservations.length,
    acceptedObservationsWithMemberships: acceptedObservations.filter((observation) => observation.concepts.length > 0).length,
    singletonConcepts: ontology.concepts.filter((concept) => (membershipsByConcept.get(concept.concept_id)?.length ?? 0) === 1).length,
    crossDialogueConcepts: ontology.concepts.filter((concept) => {
      const dialogueSet = new Set(
        (observationsByConceptId.get(concept.concept_id) ?? []).map((observation) => observation.dialogue),
      );
      return dialogueSet.size >= 2;
    }).length,
    axisRows,
  };
  return {
    axesById,
    conceptsById,
    conceptsByObservationId,
    observationsByConceptId,
    ontologyQuality,
  };
}

export function dossierConceptKey(conceptId: string) {
  return conceptId;
}

export function buildDossierPageByConceptId(dossiers: readonly SiteDossier[]) {
  const pageByConceptId = new Map<string, string>();
  for (const dossier of [...dossiers].sort((left, right) => compareStableText(left.conceptId, right.conceptId))) {
    if (pageByConceptId.has(dossier.conceptId)) throw new Error(`Duplicate dossier concept target: ${dossier.conceptId}.`);
    pageByConceptId.set(dossier.conceptId, `${dossier.pagePath}#${dossier.dossierId}`);
  }
  return pageByConceptId;
}

export function readSiteData({
  includeDraftRecordings = false,
  sourceResolver = createSourceSpanResolver(),
}: {
  includeDraftRecordings?: boolean;
  sourceResolver?: SourceSpanResolver;
} = {}): SiteData {
  const allObservations = readObservationsFromDisk(sourceResolver);
  const rejectedObservationIds = new Set(
    allObservations
      .filter((observation) => observation.reviewStatus === "rejected")
      .map((observation) => observation.observationId),
  );
  const observations = allObservations.filter((observation) => observation.reviewStatus !== "rejected");
  const observationsById = new Map(observations.map((observation) => [observation.observationId, observation]));
  const ontology = readOntologyVNextRepository();
  const ontologyIndexes = buildOntologySiteIndexes(ontology, observations);
  const clusters = readClustersFromDisk();
  const allClaims = readClaimsFromDisk();
  const claims = allClaims.filter((claim) => claim.reviewStatus !== "rejected");
  const claimsById = new Map(claims.map((claim) => [claim.claimId, claim]));
  const relations = readRelationsFromDisk();
  const dossiers = readDossiersFromDisk();
  const commentaryByDialogue = readCommentaryFromDisk(sourceResolver);
  const apparatusByDialogue = readApparatusFromDisk();
  // Fail loud: an accepted apparatus record must have a reading page to surface
  // its sign (mirrors the recording→reading-page presence check below).
  for (const dialogue of apparatusByDialogue.keys()) {
    const commentary = commentaryByDialogue.get(dialogue);
    const hasVisibleCommentary = commentary?.blocks.some(
      (block) => block.reviewStatus === "accepted" || block.reviewStatus === "unreviewed",
    );
    if (!hasVisibleCommentary) {
      throw new Error(`Apparatus records for ${dialogue} have no reading page target.`);
    }
  }
  const relationsByClaimId = buildRelationsByClaimId(relations);
  const dialogues = [...new Set([...listGreekDialoguesFromDisk(), ...observations.map((observation) => observation.dialogue)])].sort();
  const derivedByDialogue = readDerivedByDialogue(dialogues);
  const stephanusByDialogue = readStephanusByDialogue(dialogues);
  const observationTurnJoinsByDialogue = new Map(
    [...readObservationTurnJoinsFromDisk()].map(([dialogue, index]) => [
      dialogue,
      {
        ...index,
        rows: index.rows.filter((row) => !rejectedObservationIds.has(row.observationId)),
      },
    ]),
  );
  const { turnIdsByObservationId, observationIdsByTurnId } = buildObservationTurnMaps(
    observationTurnJoinsByDialogue,
    observationsById,
    derivedByDialogue,
  );
  const { shards: turnShards, pageById: turnPageById } = buildTurnShards(derivedByDialogue);
  const { shards, pageById } = buildObservationShards(observations);
  const { shards: claimShards, pageById: claimPageById } = buildClaimShards(claims);
  const { shards: relationShards, pageById: relationPageById } = buildRelationShards(relations);
  const dossierPageByConceptId = buildDossierPageByConceptId(dossiers);
  const recordingsByDialogue = discoverSiteRecordings({ includeDraftRecordings });
  for (const dialogue of recordingsByDialogue.keys()) {
    if (!derivedByDialogue.has(dialogue)) {
      throw new Error(`Playable recording references missing dialogue target ${dialogue}.`);
    }
    if (!commentaryByDialogue.has(dialogue)) {
      throw new Error(`Playable recording references missing reading target for ${dialogue}.`);
    }
  }
  const coverage = buildCoverageReport();
  const reviewStatusCounts: LayerReviewCounts = {
    observations: reviewStatusSummary(allObservations),
    claims: reviewStatusSummary(allClaims),
    relations: reviewStatusSummary(relations),
  };
  const unattributedDialogues = [...derivedByDialogue.entries()]
    .filter(([, derived]) =>
      derived.speakers.length > 0 && derived.speakers.every((row) => row.speaker === "(unattributed)"),
    )
    .map(([dialogue]) => dialogue)
    .sort(compareStableText);
  const commentaryPageById = new Map<string, string>();
  for (const commentary of commentaryByDialogue.values()) {
    for (const block of commentary.blocks) {
      if (block.reviewStatus !== "accepted" && block.reviewStatus !== "unreviewed") continue;
      commentaryPageById.set(
        block.commentaryId,
        `dialogues/${commentary.dialogue}/reading.html#${block.commentaryId}`,
      );
    }
  }

  return {
    observations,
    observationsById,
    ontology,
    axes: ontology.axes,
    concepts: ontology.concepts,
    memberships: ontology.memberships,
    ...ontologyIndexes,
    clusters,
    claims,
    claimsById,
    claimShards,
    claimPageById,
    relations,
    relationsByClaimId,
    stephanusByDialogue,
    dossiers,
    commentaryByDialogue,
    apparatusByDialogue,
    derivedByDialogue,
    observationTurnJoinsByDialogue,
    turnIdsByObservationId,
    observationIdsByTurnId,
    turnShards,
    turnPageById,
    shards,
    observationPageById: pageById,
    relationShards,
    relationPageById,
    commentaryPageById,
    dossierPageByConceptId,
    recordingsByDialogue,
    sourceResolver,
    sourceAttribution: readSourceAttribution(),
    coverage,
    reviewStatusCounts,
    unattributedDialogues,
    rawCoverageMarkdown: readOptionalMarkdown("wiki/coverage-gaps.md"),
  };
}

export function existingSiteSize(outDir: string) {
  if (!existsSync(outDir)) return 0;
  const walk = (dir: string): number =>
    readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
      const path = join(dir, entry.name);
      return total + (entry.isDirectory() ? walk(path) : statSync(path).size);
    }, 0);
  return walk(outDir);
}

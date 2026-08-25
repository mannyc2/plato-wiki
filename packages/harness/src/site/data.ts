import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { buildClusters, type ObservationCluster } from "../clusters.js";
import { buildCoverageReport, type DialogueCoverage } from "../coverage.js";
import {
  parseObservationTurnJoinToon,
  type ObservationTurnJoinIndex,
} from "../derived/joins.js";
import { collectLabelQuality, type LabelQualityReport } from "../labels-report.js";
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
import {
  parseFeatureEntries,
  SEED_FEATURE_FAMILIES,
  type FeatureRegistryEntry,
} from "../wiki/observation-feature-index.js";
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
  featureFamily: string;
  featureId: string;
  featureLabel: string;
  observation: string;
  textualBasis: string;
  limits: string;
  reviewStatus: string;
  greekExcerpt: string;
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
  id: string;
  dialogue: string;
  span: string;
  speakers: string;
  turnCount: number;
};

export type DossierPresence = {
  dialogue: string;
  acceptedObservations: number;
};

export type DossierCooccurrence = {
  family: string;
  label: string;
  overlappingObservations: number;
};

export type SiteDossier = {
  dossierId: string;
  family: string;
  label: string;
  path: string;
  pagePath: string;
  acceptedObservations: number;
  dialogues: number;
  counterRecords: number;
  instanceIds: string[];
  counterIds: string[];
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

export type RegistryShard = {
  part: number;
  partCount: number;
  path: string;
  entries: FeatureRegistryEntry[];
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

export const SINGLETON_ADJUDICATIONS = [
  "keep_distinct_function",
  "merge_candidate",
  "passage_summary_relabel",
  "topic_registry",
] as const;

export type SingletonAdjudication = (typeof SINGLETON_ADJUDICATIONS)[number];

export type SingletonAdjudicationSummary = {
  path: string;
  universeSize: number;
  sampleSize: number;
  composition: Array<{
    adjudication: SingletonAdjudication;
    count: number;
    sampleShare: number;
    weightedShare: number;
  }>;
};

export type ReviewLayer = "observations" | "claims" | "relations";

export type ReviewStatusSummary = {
  total: number;
  statuses: Record<string, number>;
};

export type LayerReviewCounts = Record<ReviewLayer, ReviewStatusSummary>;

export type SiteData = {
  observations: SiteObservation[];
  observationsById: Map<string, SiteObservation>;
  registry: FeatureRegistryEntry[];
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
  registryShards: RegistryShard[];
  registryPageById: Map<string, string>;
  commentaryPageById: Map<string, string>;
  dossierPageByFamilyLabel: Map<string, string>;
  recordingsByDialogue: Map<string, SiteRecording>;
  sourceResolver: SourceSpanResolver;
  sourceAttribution: string;
  labelQuality: LabelQualityReport;
  coverage: DialogueCoverage[];
  singletonAdjudication: SingletonAdjudicationSummary | undefined;
  reviewStatusCounts: LayerReviewCounts;
  unattributedDialogues: string[];
  rawCoverageMarkdown: string;
  rawLabelQualityMarkdown: string;
  rawSingletonMemoMarkdown: string;
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
  return value;
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
      featureFamily: fieldValueOrEmpty(block, "feature_family"),
      featureId: fieldValueOrEmpty(block, "feature_id"),
      featureLabel: fieldValueOrEmpty(block, "feature_label"),
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

function parseClusterFile(path: string, content: string): SiteCluster[] {
  return observationYamlBlocks(content).map((block) => {
    const family = fieldValueOrEmpty(block, "feature_family");
    const label = fieldValueOrEmpty(block, "feature_label");
    const observationIds = listFieldValue(block, "observation_ids");
    const dialogues = listFieldValue(block, "dialogues");
    const spans = new Map<string, string>();
    const spansMatch = /^spans:\s*$(?<body>[\s\S]*)/mu.exec(block);
    if (spansMatch?.groups?.body) {
      for (const line of spansMatch.groups.body.split("\n")) {
        const parsed = /^\s+(obs_[a-z0-9-]+_\d{4}):\s*(\S+)\s*$/u.exec(line);
        if (parsed) spans.set(parsed[1]!, parsed[2]!);
      }
    }

    return {
      family,
      label,
      observations: observationIds.map((observationId) => ({
        observationId,
        dialogue: dialogueFromObservationId(observationId),
        stephanusSpan: spans.get(observationId) ?? "",
        featureId: "",
        featureFamily: family,
        featureLabel: label,
        reviewStatus: "accepted",
      })),
      dialogues,
      preConvergence: false,
      path,
    };
  });
}

function readClustersFromDisk() {
  const clusterDir = join(getRepoRoot(), "wiki/clusters");
  if (!existsSync(clusterDir)) {
    return buildClusters().map((cluster) => ({ ...cluster, path: `wiki/clusters/${cluster.family}.md` }));
  }

  return readdirSync(clusterDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .flatMap((entry) =>
      parseClusterFile(`wiki/clusters/${entry.name}`, readFileSync(join(clusterDir, entry.name), "utf8")),
    )
    .sort((a, b) => a.family.localeCompare(b.family) || a.label.localeCompare(b.label));
}

function readRegistryEntries() {
  const path = join(getRepoRoot(), "wiki/features-so-far.md");
  return existsSync(path) ? parseFeatureEntries(readFileSync(path, "utf8")) : [];
}

function cleanInlineValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/gu, "") ?? "";
}

function parseSemicolonFields(line: string) {
  const fields = new Map<string, string>();
  for (const part of line.replace(/^\s*-\s*/u, "").split(/;\s*/u)) {
    const parsed = /^([^:]+):\s*(.*)$/u.exec(part.trim());
    if (parsed) fields.set(parsed[1]!.trim(), cleanInlineValue(parsed[2]));
  }
  return fields;
}

function parseYamlListSection(content: string, heading: string) {
  const match = new RegExp(`## ${heading}\\n\\n\`\`\`yaml\\n([\\s\\S]*?)\\n\`\`\``, "u").exec(content);
  return match?.[1]?.split("\n").filter((line) => line.trim().startsWith("- ")) ?? [];
}

function parseDossierFile(filePath: string, content: string): SiteDossier | undefined {
  const firstBlock = /```yaml\n([\s\S]*?)\n```/u.exec(content)?.[1];
  if (!firstBlock) return undefined;

  const family = fieldValueOrEmpty(firstBlock, "feature_family");
  const label = fieldValueOrEmpty(firstBlock, "feature_label");
  if (!family || !label) return undefined;

  const instances = parseYamlListSection(content, "Instances").map((line) => {
    const fields = parseSemicolonFields(line);
    return {
      id: fields.get("id") ?? "",
      dialogue: fields.get("dialogue") ?? "",
      span: fields.get("span") ?? "",
      speakers: fields.get("speakers") ?? "",
      turnCount: numberField(fields.get("turn_count") ?? "0"),
    };
  });
  const presence = parseYamlListSection(content, "Presence").map((line) => {
    const fields = parseSemicolonFields(line);
    return {
      dialogue: fields.get("dialogue") ?? "",
      acceptedObservations: numberField(fields.get("accepted_observations") ?? "0"),
    };
  });
  const cooccurrence = parseYamlListSection(content, "Co-occurrence").map((line) => {
    const fields = parseSemicolonFields(line);
    return {
      family: fields.get("family") ?? "",
      label: fields.get("label") ?? "",
      overlappingObservations: numberField(fields.get("overlapping_observations") ?? "0"),
    };
  });

  return {
    dossierId: fieldValueOrEmpty(firstBlock, "dossier_id"),
    family,
    label,
    path: relative(getRepoRoot(), filePath),
    pagePath: `dossiers/${family}/${label}.html`,
    acceptedObservations: numberField(fieldValue(firstBlock, "accepted_observations") ?? "0"),
    dialogues: numberField(fieldValue(firstBlock, "dialogues") ?? "0"),
    counterRecords: numberField(fieldValue(firstBlock, "counter_records") ?? "0"),
    instanceIds: listFieldValue(firstBlock, "instance_ids"),
    counterIds: listFieldValue(firstBlock, "counter_ids"),
    instances,
    presence,
    cooccurrence,
  };
}

function readDossiersFromDisk() {
  const dossierDir = join(getRepoRoot(), "wiki/dossiers");
  if (!existsSync(dossierDir)) {
    throw new Error("wiki/dossiers is required for the v2 site build.");
  }

  const dossiers: SiteDossier[] = [];
  for (const familyEntry of readdirSync(dossierDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!familyEntry.isDirectory()) continue;
    const familyDir = join(dossierDir, familyEntry.name);
    for (const fileEntry of readdirSync(familyDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!fileEntry.isFile() || !fileEntry.name.endsWith(".md")) continue;
      const parsed = parseDossierFile(join(familyDir, fileEntry.name), readFileSync(join(familyDir, fileEntry.name), "utf8"));
      if (parsed) dossiers.push(parsed);
    }
  }
  return dossiers.sort((a, b) => a.family.localeCompare(b.family) || a.label.localeCompare(b.label));
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
  const byDialogue = groupBy(relations, (relation) => relation.dialogue);

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

export function dossierFamilyLabelKey(family: string, label: string) {
  return `${family}/${label}`;
}

export function buildDossierPageByFamilyLabel(dossiers: readonly SiteDossier[]) {
  const pageByFamilyLabel = new Map<string, string>();
  for (const dossier of [...dossiers].sort((a, b) =>
    compareStableText(dossierFamilyLabelKey(a.family, a.label), dossierFamilyLabelKey(b.family, b.label)),
  )) {
    const key = dossierFamilyLabelKey(dossier.family, dossier.label);
    if (pageByFamilyLabel.has(key)) throw new Error(`Duplicate dossier family/label target: ${key}.`);
    pageByFamilyLabel.set(key, `${dossier.pagePath}#${dossier.dossierId}`);
  }
  return pageByFamilyLabel;
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

export function buildRegistryShards(entries: FeatureRegistryEntry[], chunkSize = 500) {
  const pageById = new Map<string, string>();
  const shards = buildNumberedShards(
    [...entries].sort((a, b) => a.id.localeCompare(b.id)),
    chunkSize,
    (part) => `registry/part-${part}.html`,
  ).map((shard): RegistryShard => ({ ...shard, entries: shard.items }));
  for (const shard of shards) {
    for (const entry of shard.entries) pageById.set(entry.id, `${shard.path}#${entry.id}`);
  }
  return { shards, pageById };
}

function readOptionalMarkdown(repoPath: string) {
  const path = join(getRepoRoot(), repoPath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const SINGLETON_SAMPLE_PATH = "wiki/review/2026-07-singleton-adjudication/sample.json";
const TARGET_REQUIRED_ADJUDICATIONS = new Set<SingletonAdjudication>([
  "merge_candidate",
  "passage_summary_relabel",
]);
const TARGET_FORBIDDEN_ADJUDICATIONS = new Set<SingletonAdjudication>([
  "keep_distinct_function",
  "topic_registry",
]);

function recordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function singletonSampleError(detail: string): never {
  throw new Error(`Malformed singleton adjudication sample ${SINGLETON_SAMPLE_PATH}: ${detail}`);
}

function positiveInteger(value: unknown, field: string) {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    singletonSampleError(`${field} must be a positive integer.`);
  }
  return Number(value);
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    singletonSampleError(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function isSingletonAdjudication(value: string): value is SingletonAdjudication {
  return (SINGLETON_ADJUDICATIONS as readonly string[]).includes(value);
}

export function readSingletonAdjudicationSummary(): SingletonAdjudicationSummary | undefined {
  const absolutePath = join(getRepoRoot(), SINGLETON_SAMPLE_PATH);
  if (!existsSync(absolutePath)) return undefined;

  let sample: unknown;
  try {
    sample = JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    singletonSampleError(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!recordValue(sample)) singletonSampleError("root must be an object.");
  if (sample.version !== 1) singletonSampleError("version must be 1.");
  const universeSize = positiveInteger(sample.universeSize, "universeSize");
  const sampleStrata = sample.strata;
  if (!recordValue(sampleStrata) || Object.keys(sampleStrata).length === 0) {
    singletonSampleError("strata must be a non-empty object.");
  }
  const sampleEntries = sample.entries;
  if (!Array.isArray(sampleEntries) || sampleEntries.length === 0) {
    singletonSampleError("entries must be a non-empty array.");
  }

  const strata = new Map<string, { population: number; drawn: number }>();
  for (const [name, value] of Object.entries(sampleStrata)) {
    if (!recordValue(value)) singletonSampleError(`strata.${name} must be an object.`);
    const population = positiveInteger(value.population, `strata.${name}.population`);
    const drawn = positiveInteger(value.drawn, `strata.${name}.drawn`);
    if (drawn > population) singletonSampleError(`strata.${name}.drawn must not exceed its population.`);
    strata.set(name, { population, drawn });
  }

  const populationTotal = [...strata.values()].reduce((sum, stratum) => sum + stratum.population, 0);
  if (populationTotal !== universeSize) {
    singletonSampleError(`strata populations total ${populationTotal}; expected universeSize ${universeSize}.`);
  }
  const drawnTotal = [...strata.values()].reduce((sum, stratum) => sum + stratum.drawn, 0);
  if (sampleEntries.length !== drawnTotal) {
    singletonSampleError(`entries contains ${sampleEntries.length} rows; strata drawn totals ${drawnTotal}.`);
  }

  const stratumCounts = new Map<string, number>();
  const compositionByStratum = new Map<string, Record<SingletonAdjudication, number>>();
  const totals = Object.fromEntries(SINGLETON_ADJUDICATIONS.map((value) => [value, 0])) as Record<
    SingletonAdjudication,
    number
  >;
  for (const name of strata.keys()) {
    compositionByStratum.set(
      name,
      Object.fromEntries(SINGLETON_ADJUDICATIONS.map((value) => [value, 0])) as Record<
        SingletonAdjudication,
        number
      >,
    );
  }

  for (const [index, value] of sampleEntries.entries()) {
    if (!recordValue(value)) singletonSampleError(`entries[${index}] must be an object.`);
    requiredString(value.family, `entries[${index}].family`);
    const sourceLabel = requiredString(value.label, `entries[${index}].label`);
    requiredString(value.observation_id, `entries[${index}].observation_id`);
    const stratum = requiredString(value.stratum, `entries[${index}].stratum`);
    if (!strata.has(stratum)) singletonSampleError(`entries[${index}].stratum names unknown stratum ${stratum}.`);
    const adjudication = requiredString(value.adjudication, `entries[${index}].adjudication`);
    if (!isSingletonAdjudication(adjudication)) {
      singletonSampleError(`entries[${index}].adjudication has unsupported value ${adjudication}.`);
    }

    if (TARGET_REQUIRED_ADJUDICATIONS.has(adjudication)) {
      if (!recordValue(value.target)) {
        singletonSampleError(`entries[${index}].target is required for ${adjudication}.`);
      }
      const targetLabel = requiredString(value.target.label, `entries[${index}].target.label`);
      if (targetLabel === sourceLabel) singletonSampleError(`entries[${index}].target.label must differ from its source label.`);
    } else if (TARGET_FORBIDDEN_ADJUDICATIONS.has(adjudication) && value.target !== null) {
      singletonSampleError(`entries[${index}].target must be null for ${adjudication}.`);
    }

    stratumCounts.set(stratum, (stratumCounts.get(stratum) ?? 0) + 1);
    compositionByStratum.get(stratum)![adjudication] += 1;
    totals[adjudication] += 1;
  }

  for (const [name, header] of strata) {
    const count = stratumCounts.get(name) ?? 0;
    if (count !== header.drawn) {
      singletonSampleError(`strata.${name}.drawn is ${header.drawn}; entries contain ${count} rows.`);
    }
  }

  const composition = SINGLETON_ADJUDICATIONS.map((adjudication) => {
    const count = totals[adjudication];
    const sampleShare = count / sampleEntries.length;
    const weightedShare = [...strata.entries()].reduce((sum, [name, header]) => {
      const stratumCount = compositionByStratum.get(name)![adjudication];
      return sum + (header.population / universeSize) * (stratumCount / header.drawn);
    }, 0);
    return { adjudication, count, sampleShare, weightedShare };
  });
  for (const entry of composition) {
    for (const [field, value] of [
      ["sampleShare", entry.sampleShare],
      ["weightedShare", entry.weightedShare],
    ] as const) {
      if (!Number.isFinite(value) || value < 0 || value > 1) {
        singletonSampleError(`${entry.adjudication}.${field} must be a finite share from 0 to 1.`);
      }
    }
  }

  return {
    path: SINGLETON_SAMPLE_PATH,
    universeSize,
    sampleSize: sampleEntries.length,
    composition,
  };
}

function dashboardDataError(detail: string): never {
  throw new Error(`Invalid structure-quality dashboard data: ${detail}`);
}

function assertDashboardShare(path: string, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    dashboardDataError(`${path} must be a finite share from 0 to 1; found ${String(value)}.`);
  }
}

export function validateDashboardTargets({
  labelQuality,
  coverage,
  knownDialogues,
  knownFamilies,
}: {
  labelQuality: LabelQualityReport;
  coverage: DialogueCoverage[];
  knownDialogues: ReadonlySet<string>;
  knownFamilies: ReadonlySet<string>;
}) {
  assertDashboardShare("allRecords.reuseMass.nonSingletonShare", labelQuality.allRecords.reuseMass.nonSingletonShare);
  assertDashboardShare("allRecords.reuseMass.crossDialogueShare", labelQuality.allRecords.reuseMass.crossDialogueShare);
  assertDashboardShare("acceptedOnly.reuseMass.nonSingletonShare", labelQuality.acceptedOnly.reuseMass.nonSingletonShare);
  assertDashboardShare("acceptedOnly.reuseMass.crossDialogueShare", labelQuality.acceptedOnly.reuseMass.crossDialogueShare);

  const requireDialogue = (path: string, dialogue: string) => {
    if (!knownDialogues.has(dialogue)) dashboardDataError(`${path} references missing dialogue target ${dialogue}.`);
  };
  const requireFamily = (path: string, family: string) => {
    if (!knownFamilies.has(family)) dashboardDataError(`${path} references missing family target ${family}.`);
  };

  for (const [index, entry] of labelQuality.perDialogueParticipation.entries()) {
    requireDialogue(`perDialogueParticipation[${index}]`, entry.dialogue);
    assertDashboardShare(`perDialogueParticipation[${index}].crossDialogueObservationShare`, entry.crossDialogueObservationShare);
  }
  for (const [index, entry] of coverage.entries()) {
    requireDialogue(`coverage[${index}]`, entry.dialogue);
    assertDashboardShare(`coverage[${index}].coverageRatio`, entry.coverageRatio);
  }
  for (const [index, entry] of labelQuality.familyProfiles.entries()) {
    requireFamily(`familyProfiles[${index}]`, entry.family);
  }
  for (const [index, entry] of labelQuality.dispositionCoverage.topUncoveredSingletonFamilies.entries()) {
    requireFamily(`dispositionCoverage.topUncoveredSingletonFamilies[${index}]`, entry.family);
  }
  for (const [index, entry] of labelQuality.labelNameShape.longestLabels.entries()) {
    requireFamily(`labelNameShape.longestLabels[${index}]`, entry.family);
  }
  for (const [lensName, lens] of [
    ["allRecords", labelQuality.allRecords],
    ["acceptedOnly", labelQuality.acceptedOnly],
  ] as const) {
    for (const [index, entry] of lens.entries.entries()) {
      requireFamily(`${lensName}.entries[${index}]`, entry.family);
      for (const dialogue of entry.dialogues) requireDialogue(`${lensName}.entries[${index}]`, dialogue);
    }
  }
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

export function familyRows(observations: SiteObservation[], registry: FeatureRegistryEntry[]) {
  const observationsByFamily = groupBy(observations, (observation) => observation.featureFamily);
  const registryByFamily = groupBy(registry, (entry) => entry.family);
  const seedFamilies = new Set<string>(SEED_FEATURE_FAMILIES);
  const families = new Set([...observationsByFamily.keys(), ...registryByFamily.keys()]);

  return [...families]
    .sort((a, b) => a.localeCompare(b))
    .map((family) => ({
      family,
      kind: seedFamilies.has(family) ? "seed" : "passthrough",
      observationCount: observationsByFamily.get(family)?.length ?? 0,
      acceptedCount: observationsByFamily.get(family)?.filter((observation) => observation.reviewStatus === "accepted").length ?? 0,
      featureCandidateCount: registryByFamily.get(family)?.length ?? 0,
    }));
}

export function crossDialogueLabelCount(observations: SiteObservation[]) {
  return [
    ...groupBy(observations, (observation) => `${observation.featureFamily}::${observation.featureLabel}`).values(),
  ].filter((entries) => new Set(entries.map((entry) => entry.dialogue)).size >= 2).length;
}

export function readSiteData({
  includeDraftRecordings = false,
  sourceResolver = createSourceSpanResolver(),
}: {
  includeDraftRecordings?: boolean;
  sourceResolver?: SourceSpanResolver;
} = {}): SiteData {
  const observations = readObservationsFromDisk(sourceResolver);
  const observationsById = new Map(observations.map((observation) => [observation.observationId, observation]));
  const registry = readRegistryEntries();
  const clusters = readClustersFromDisk();
  const claims = readClaimsFromDisk();
  const claimsById = new Map(claims.map((claim) => [claim.claimId, claim]));
  const relations = readRelationsFromDisk();
  const dossiers = readDossiersFromDisk();
  const commentaryByDialogue = readCommentaryFromDisk(sourceResolver);
  const apparatusByDialogue = readApparatusFromDisk();
  // Fail loud: an accepted apparatus record must have a reading page to surface
  // its sign (mirrors the recording→reading-page presence check below).
  for (const dialogue of apparatusByDialogue.keys()) {
    if (!commentaryByDialogue.has(dialogue)) {
      throw new Error(`Apparatus records for ${dialogue} have no reading page target.`);
    }
  }
  const relationsByClaimId = buildRelationsByClaimId(relations);
  const dialogues = [...new Set([...listGreekDialoguesFromDisk(), ...observations.map((observation) => observation.dialogue)])].sort();
  const derivedByDialogue = readDerivedByDialogue(dialogues);
  const stephanusByDialogue = readStephanusByDialogue(dialogues);
  const observationTurnJoinsByDialogue = readObservationTurnJoinsFromDisk();
  const { turnIdsByObservationId, observationIdsByTurnId } = buildObservationTurnMaps(
    observationTurnJoinsByDialogue,
    observationsById,
    derivedByDialogue,
  );
  const { shards: turnShards, pageById: turnPageById } = buildTurnShards(derivedByDialogue);
  const { shards, pageById } = buildObservationShards(observations);
  const { shards: claimShards, pageById: claimPageById } = buildClaimShards(claims);
  const { shards: relationShards, pageById: relationPageById } = buildRelationShards(relations);
  const { shards: registryShards, pageById: registryPageById } = buildRegistryShards(registry);
  const dossierPageByFamilyLabel = buildDossierPageByFamilyLabel(dossiers);
  const recordingsByDialogue = discoverSiteRecordings({ includeDraftRecordings });
  for (const dialogue of recordingsByDialogue.keys()) {
    if (!derivedByDialogue.has(dialogue)) {
      throw new Error(`Playable recording references missing dialogue target ${dialogue}.`);
    }
    if (!commentaryByDialogue.has(dialogue)) {
      throw new Error(`Playable recording references missing reading target for ${dialogue}.`);
    }
  }
  const labelQuality = collectLabelQuality();
  const coverage = buildCoverageReport();
  validateDashboardTargets({
    labelQuality,
    coverage,
    knownDialogues: new Set(derivedByDialogue.keys()),
    knownFamilies: new Set(observations.map((observation) => observation.featureFamily)),
  });
  const singletonAdjudication = readSingletonAdjudicationSummary();
  const reviewStatusCounts: LayerReviewCounts = {
    observations: reviewStatusSummary(observations),
    claims: reviewStatusSummary(claims),
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
    registry,
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
    registryShards,
    registryPageById,
    commentaryPageById,
    dossierPageByFamilyLabel,
    recordingsByDialogue,
    sourceResolver,
    sourceAttribution: readSourceAttribution(),
    labelQuality,
    coverage,
    singletonAdjudication,
    reviewStatusCounts,
    unattributedDialogues,
    rawCoverageMarkdown: readOptionalMarkdown("wiki/coverage-gaps.md"),
    rawLabelQualityMarkdown: readOptionalMarkdown("wiki/label-quality.md"),
    rawSingletonMemoMarkdown: readOptionalMarkdown("docs/singleton-adjudication-memo-2026-07.md"),
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

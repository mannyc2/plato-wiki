import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  fencedYamlRecordBlocks,
  replaceFencedYamlRecordBlocks,
  serializeCanonicalYamlRecord,
  type CanonicalYamlRecord,
  type CanonicalYamlValue,
} from "./fenced-record.js";
import {
  ONTOLOGY_VNEXT_FILES,
  parseOntologyVNext,
  renderOntologyVNextDocuments,
  type OntologyVNextAxis,
  type OntologyVNextConcept,
  type OntologyVNextDimension,
  type OntologyVNextMembership,
} from "./ontology-vnext.js";
import { buildOntologyVNextFromConceptAudit, readOntologyConceptAudit } from "./ontology-concept-audit.js";

export type LegacyObservationIdentity = {
  path: string;
  ordinal: number;
  observationId: string;
  reviewStatus: string;
  legacyFeatureId: string | null;
  legacyFamily: string | null;
  legacyLabel: string | null;
  observation: string;
};

export type OntologyVNextMigrationPlan = {
  axes: OntologyVNextAxis[];
  concepts: OntologyVNextConcept[];
  memberships: OntologyVNextMembership[];
  observationStatuses: Map<string, "unreviewed" | "accepted" | "rejected" | "needs_split">;
  rewrittenLedgers: Array<{ path: string; content: string }>;
  rewrittenCommentaryLedgers: Array<{ path: string; content: string }>;
  identities: LegacyObservationIdentity[];
  counts: {
    observations: number;
    acceptedObservations: number;
    rejectedOrPendingObservations: number;
    legacyFamilies: number;
    legacyFeatureIds: number;
    legacyPairs: number;
    activeAxes: number;
    activeConcepts: number;
    activeMemberships: number;
    featureIdConflicts: number;
    pairConflicts: number;
    removedGreekTerms: number;
    dossierReferencesMigrated: number;
    dossierReferencesDropped: number;
    commentaryRejectedAfterDossierMigration: number;
  };
};

const DISCOURSE_PATTERNS = [
  /argument/u,
  /assent/u,
  /classification/u,
  /closure/u,
  /criterion/u,
  /definition/u,
  /dialectic/u,
  /diaires/u,
  /distinction/u,
  /elench/u,
  /inference/u,
  /method/u,
  /proof/u,
  /question/u,
  /reasoning/u,
  /sequence/u,
  /structure/u,
  /transition/u,
  /turn_/u,
];
const PRESENTATION_PATTERNS = [
  /allusion/u,
  /analogy/u,
  /citation/u,
  /exempl/u,
  /genre/u,
  /image/u,
  /metaphor/u,
  /myth/u,
  /narrative/u,
  /parable/u,
  /poet/u,
  /proverb/u,
  /quotation/u,
  /register/u,
  /simile/u,
  /speech/u,
];
const DRAMATIC_PATTERNS = [
  /audience/u,
  /character/u,
  /dramatic/u,
  /interlocutor/u,
  /narrator/u,
  /prosopograph/u,
  /setting/u,
  /speaker/u,
  /voice/u,
];
const LEXICAL_PATTERNS = [
  /etymolog/u,
  /lexic/u,
  /name/u,
  /naming/u,
  /terminolog/u,
  /vocabular/u,
  /word/u,
];
const TEXTUAL_FUNCTION_PATTERNS = [
  /appeal/u,
  /attribution/u,
  /challenge/u,
  /contrast/u,
  /disavowal/u,
  /framing/u,
  /invocation/u,
  /irony/u,
  /marker/u,
  /reversal/u,
  /self_disclosure/u,
];

function isRecord(value: CanonicalYamlValue | undefined): value is CanonicalYamlRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function scalar(record: CanonicalYamlRecord, field: string) {
  const value = record[field];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";
}

function compareStrings(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function humanize(slug: string) {
  return slug.replace(/_/gu, " ");
}

export function ontologyVNextDimensionForAxis(axisKey: string): OntologyVNextDimension {
  if (LEXICAL_PATTERNS.some((pattern) => pattern.test(axisKey))) return "lexical_form";
  if (DRAMATIC_PATTERNS.some((pattern) => pattern.test(axisKey))) return "dramatic_context";
  if (PRESENTATION_PATTERNS.some((pattern) => pattern.test(axisKey))) return "presentation_form";
  if (DISCOURSE_PATTERNS.some((pattern) => pattern.test(axisKey))) return "discourse_structure";
  if (TEXTUAL_FUNCTION_PATTERNS.some((pattern) => pattern.test(axisKey))) return "textual_function";
  return "subject_matter";
}

function axisQuestion(axisKey: string, dimension: OntologyVNextDimension) {
  const phrase = humanize(axisKey);
  switch (dimension) {
    case "textual_function":
      return `How does ${phrase} function in the cited Greek passages across dialogues?`;
    case "presentation_form":
      return `How is ${phrase} used to present material in the cited Greek passages across dialogues?`;
    case "dramatic_context":
      return `How does ${phrase} shape the explicitly reported dramatic situation across dialogues?`;
    case "discourse_structure":
      return `How does ${phrase} organize an exchange or argument in the cited Greek passages across dialogues?`;
    case "lexical_form":
      return `How does the Greek text explicitly use or analyze ${phrase} across dialogues?`;
    case "subject_matter":
      return `What does each dialogue explicitly state about ${phrase} in the cited Greek passages?`;
  }
}

function conceptQuestion(conceptKey: string, dimension: OntologyVNextDimension) {
  const phrase = humanize(conceptKey);
  switch (dimension) {
    case "textual_function":
      return `Where does an accepted observation record ${phrase} as a textual operation, and what does it do there?`;
    case "presentation_form":
      return `Where is material explicitly presented as ${phrase}, and what material does that form carry?`;
    case "dramatic_context":
      return `Where does ${phrase} occur in the dramatic situation, and which explicitly named participants or setting are involved?`;
    case "discourse_structure":
      return `Where does ${phrase} organize an exchange or argument, and what transition or constraint does it mark?`;
    case "lexical_form":
      return `Where does the Greek text explicitly use or analyze ${phrase}, and what cited wording supports the observation?`;
    case "subject_matter":
      return `Where does an accepted source-bound observation explicitly state ${phrase}, and what exactly is stated?`;
  }
}

function conceptDefinition(conceptKey: string, dimension: OntologyVNextDimension) {
  const phrase = humanize(conceptKey);
  switch (dimension) {
    case "textual_function":
      return `A cited passage in which the text explicitly performs or attributes ${phrase}.`;
    case "presentation_form":
      return `A cited passage that explicitly presents material through ${phrase}.`;
    case "dramatic_context":
      return `A cited passage that explicitly reports ${phrase} as part of the dramatic situation.`;
    case "discourse_structure":
      return `A cited passage in which ${phrase} explicitly structures an exchange or stated argument.`;
    case "lexical_form":
      return `A cited passage whose Greek wording explicitly instantiates or analyzes ${phrase}.`;
    case "subject_matter":
      return `A cited passage containing an explicit source-bound statement of ${phrase}.`;
  }
}

function valuesByKey<T>(rows: readonly T[], left: (row: T) => string, right: (row: T) => string) {
  const values = new Map<string, Set<string>>();
  for (const row of rows) {
    const key = left(row);
    const bucket = values.get(key) ?? new Set<string>();
    bucket.add(right(row));
    values.set(key, bucket);
  }
  return values;
}

function conflictCount(values: ReadonlyMap<string, ReadonlySet<string>>) {
  return [...values.values()].filter((entries) => entries.size > 1).length;
}

function canonicalFence(record: CanonicalYamlRecord) {
  return `\`\`\`yaml\n${serializeCanonicalYamlRecord(record).trimEnd()}\n\`\`\``;
}

function sanitizeObservationRecord(
  record: CanonicalYamlRecord,
  repoRoot: string,
): { record: CanonicalYamlRecord; removedGreekTerms: number } {
  const next = Object.fromEntries(
    Object.entries(record).filter(([field]) => !["feature_id", "feature_family", "feature_label"].includes(field)),
  ) as Record<string, CanonicalYamlValue>;
  const sourceRef = isRecord(record.source_ref) ? record.source_ref : undefined;
  const sourcePath = sourceRef ? scalar(sourceRef, "source_path") : "";
  const startChar = sourceRef ? Number(scalar(sourceRef, "start_char")) : Number.NaN;
  const endChar = sourceRef ? Number(scalar(sourceRef, "end_char")) : Number.NaN;
  const greekTerms = Array.isArray(record.greek_terms)
    ? record.greek_terms.filter((term): term is string => typeof term === "string")
    : [];
  let retained = greekTerms;
  if (sourcePath && Number.isInteger(startChar) && Number.isInteger(endChar) && endChar > startChar) {
    const source = readFileSync(join(repoRoot, sourcePath), "utf8").slice(startChar, endChar);
    retained = greekTerms.filter((term) => source.includes(term));
  }
  if (Array.isArray(record.greek_terms)) next.greek_terms = retained;
  return { record: next, removedGreekTerms: greekTerms.length - retained.length };
}

function observationPaths(repoRoot: string) {
  const directory = join(repoRoot, "wiki/observations");
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(directory, entry.name))
    .sort(compareStrings);
}

function commentaryPaths(repoRoot: string) {
  const directory = join(repoRoot, "wiki/commentary");
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(directory, entry.name))
    .sort(compareStrings);
}

function stringList(value: CanonicalYamlValue | undefined, context: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${context} must be a list of strings.`);
  }
  return value as readonly string[];
}

function defaultConceptAuditDirectory(repoRoot: string) {
  const auditRoot = join(repoRoot, "wiki/ontology-audits");
  const candidates = existsSync(auditRoot)
    ? readdirSync(auditRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(auditRoot, entry.name, "review-inputs/concept-first"))
        .filter((path) => existsSync(join(path, "receipt.json")))
        .sort(compareStrings)
    : [];
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one snapshot-bound concept-first audit package, found ${candidates.length}.`);
  }
  return candidates[0]!;
}

export function planOntologyVNextMigration({
  repoRoot = getRepoRoot(),
  conceptAuditDirectory,
  splitMembershipProposalObservationIds,
}: {
  repoRoot?: string;
  conceptAuditDirectory?: string;
  splitMembershipProposalObservationIds?: ReadonlyMap<string, readonly string[]>;
} = {}): OntologyVNextMigrationPlan {
  const identities: LegacyObservationIdentity[] = [];
  const rewrittenLedgers: OntologyVNextMigrationPlan["rewrittenLedgers"] = [];
  const rewrittenCommentaryLedgers: OntologyVNextMigrationPlan["rewrittenCommentaryLedgers"] = [];
  const observationRecords = new Map<string, CanonicalYamlRecord>();
  let removedGreekTerms = 0;

  for (const absolutePath of observationPaths(repoRoot)) {
    const path = relative(repoRoot, absolutePath);
    const content = readFileSync(absolutePath, "utf8");
    for (const block of fencedYamlRecordBlocks(content)) {
      const observationId = scalar(block.record, "observation_id");
      const reviewStatus = scalar(block.record, "review_status");
      const legacyFeatureId = scalar(block.record, "feature_id");
      const legacyFamily = scalar(block.record, "feature_family");
      const legacyLabel = scalar(block.record, "feature_label");
      const observation = scalar(block.record, "observation");
      if (!observationId || !reviewStatus || !observation) {
        throw new Error(`${path}: observation block ${block.index + 1} lacks an id, status, or observation.`);
      }
      const legacyIdentityFieldCount = [legacyFeatureId, legacyFamily, legacyLabel].filter(Boolean).length;
      if (legacyIdentityFieldCount !== 0 && legacyIdentityFieldCount !== 3) {
        throw new Error(`${path}: observation block ${block.index + 1} has only part of a legacy identity.`);
      }
      if (observationRecords.has(observationId)) throw new Error(`Duplicate observation id ${observationId}.`);
      identities.push({
        path,
        ordinal: block.index,
        observationId,
        reviewStatus,
        legacyFeatureId: legacyFeatureId || null,
        legacyFamily: legacyFamily || null,
        legacyLabel: legacyLabel || null,
        observation,
      });
      observationRecords.set(observationId, block.record);
    }
    const rewritten = replaceFencedYamlRecordBlocks(content, (block) => {
      const sanitized = sanitizeObservationRecord(block.record, repoRoot);
      removedGreekTerms += sanitized.removedGreekTerms;
      return canonicalFence(sanitized.record);
    });
    rewrittenLedgers.push({ path, content: rewritten });
  }

  const accepted = identities.filter((identity) => identity.reviewStatus === "accepted");
  const assignedAccepted = accepted.filter((identity): identity is LegacyObservationIdentity & {
    legacyFeatureId: string;
    legacyFamily: string;
    legacyLabel: string;
  } => Boolean(identity.legacyFeatureId && identity.legacyFamily && identity.legacyLabel));
  const observationStatuses = new Map(
    identities.map((identity) => {
      const status = identity.reviewStatus;
      if (status !== "accepted" && status !== "rejected" && status !== "unreviewed" && status !== "needs_split") {
        throw new Error(`${identity.observationId} has unsupported review status ${status}.`);
      }
      return [identity.observationId, status] as const;
    }),
  );
  const conceptAudit = readOntologyConceptAudit(
    conceptAuditDirectory ?? defaultConceptAuditDirectory(repoRoot),
    { repoRoot },
  );
  const audited = buildOntologyVNextFromConceptAudit({
    audit: conceptAudit,
    observationReviewStatuses: observationStatuses,
    ...(splitMembershipProposalObservationIds === undefined ? {} : { splitMembershipProposalObservationIds }),
  });
  const parsed = parseOntologyVNext(audited.documents, { observationReviewStatuses: observationStatuses });
  const axes: OntologyVNextAxis[] = [...parsed.axes];
  const concepts: OntologyVNextConcept[] = [...parsed.concepts];
  const memberships: OntologyVNextMembership[] = [...parsed.memberships];
  const conceptsById = new Map(concepts.map((concept) => [concept.concept_id, concept]));
  const membershipCounts = new Map<string, number>();
  for (const membership of memberships) {
    membershipCounts.set(membership.concept_id, (membershipCounts.get(membership.concept_id) ?? 0) + 1);
  }
  const dossierPathByConceptId = new Map(
    concepts
      .filter((concept) => (membershipCounts.get(concept.concept_id) ?? 0) >= 2)
      .map((concept) => {
        const axis = axes.find((candidate) => candidate.axis_id === concept.axis_id);
        if (!axis) throw new Error(`Concept ${concept.concept_id} references missing axis ${concept.axis_id}.`);
        return [concept.concept_id, `${axis.axis_key}/${concept.concept_key}`] as const;
      }),
  );
  const activeDossierPaths = new Set<string>(dossierPathByConceptId.values());
  const legacyDossierTargets = new Map<string, Set<string>>();
  for (const decision of conceptAudit.concepts) {
    const legacyPath = `${decision.legacy_family}/${decision.legacy_label}`;
    const bucket = legacyDossierTargets.get(legacyPath) ?? new Set<string>();
    for (const target of [decision.vnext, ...decision.split_targets]) {
      if (!target || !conceptsById.has(target.concept_id)) continue;
      const dossierPath = dossierPathByConceptId.get(target.concept_id);
      if (dossierPath) bucket.add(dossierPath);
    }
    legacyDossierTargets.set(legacyPath, bucket);
  }
  let dossierReferencesMigrated = 0;
  let dossierReferencesDropped = 0;
  let commentaryRejectedAfterDossierMigration = 0;
  for (const absolutePath of commentaryPaths(repoRoot)) {
    const path = relative(repoRoot, absolutePath);
    const content = readFileSync(absolutePath, "utf8");
    const rewritten = replaceFencedYamlRecordBlocks(content, (block) => {
      const cites = isRecord(block.record.cites) ? block.record.cites : undefined;
      if (!cites) return canonicalFence(block.record);
      const dossierIds = stringList(cites.dossiers, `${path}: commentary block ${block.index + 1} cites.dossiers`);
      const migratedDossiers = new Set<string>();
      for (const dossierId of dossierIds) {
        if (activeDossierPaths.has(dossierId)) {
          migratedDossiers.add(dossierId);
          continue;
        }
        const replacements = legacyDossierTargets.get(dossierId) ?? new Set<string>();
        if (replacements.size === 0) dossierReferencesDropped += 1;
        else dossierReferencesMigrated += 1;
        for (const replacement of replacements) migratedDossiers.add(replacement);
      }
      const nextCites: Record<string, CanonicalYamlValue> = {
        ...cites,
        dossiers: [...migratedDossiers].sort(compareStrings),
      };
      const next: Record<string, CanonicalYamlValue> = { ...block.record, cites: nextCites };
      const accepted = scalar(block.record, "review_status") === "accepted";
      const retainedCitationCount = ["observations", "claims", "relations"]
        .map((field) => stringList(nextCites[field], `${path}: commentary block ${block.index + 1} cites.${field}`).length)
        .reduce((total, count) => total + count, migratedDossiers.size);
      if (accepted && retainedCitationCount === 0) {
        next.review_status = "rejected";
        commentaryRejectedAfterDossierMigration += 1;
      }
      return canonicalFence(next);
    });
    rewrittenCommentaryLedgers.push({ path, content: rewritten });
  }
  const assignedIdentities = identities.filter((identity): identity is LegacyObservationIdentity & {
    legacyFeatureId: string;
    legacyFamily: string;
    legacyLabel: string;
  } => Boolean(identity.legacyFeatureId && identity.legacyFamily && identity.legacyLabel));
  const legacyPairs = new Set(assignedIdentities.map((identity) => `${identity.legacyFamily}\u0000${identity.legacyLabel}`));
  const featureIdToPair = valuesByKey(
    assignedIdentities,
    (identity) => identity.legacyFeatureId,
    (identity) => `${identity.legacyFamily}\u0000${identity.legacyLabel}`,
  );
  const pairToFeatureId = valuesByKey(
    assignedIdentities,
    (identity) => `${identity.legacyFamily}\u0000${identity.legacyLabel}`,
    (identity) => identity.legacyFeatureId,
  );

  return {
    axes,
    concepts,
    memberships,
    observationStatuses,
    rewrittenLedgers,
    rewrittenCommentaryLedgers,
    identities,
    counts: {
      observations: identities.length,
      acceptedObservations: accepted.length,
      rejectedOrPendingObservations: identities.length - accepted.length,
      legacyFamilies: new Set(assignedIdentities.map((identity) => identity.legacyFamily)).size,
      legacyFeatureIds: new Set(assignedIdentities.map((identity) => identity.legacyFeatureId)).size,
      legacyPairs: legacyPairs.size,
      activeAxes: axes.length,
      activeConcepts: concepts.length,
      activeMemberships: memberships.length,
      featureIdConflicts: conflictCount(featureIdToPair),
      pairConflicts: conflictCount(pairToFeatureId),
      removedGreekTerms,
      dossierReferencesMigrated,
      dossierReferencesDropped,
      commentaryRejectedAfterDossierMigration,
    },
  };
}

function migrationReceipt(plan: OntologyVNextMigrationPlan) {
  return [
    "# Ontology vNext hard-cut migration receipt",
    "",
    "- migration: one-way hard cut; no legacy aliases, dual readers, or fallback identities",
    "- source policy: canonical Greek source spans only; no translation inputs",
    `- observations reviewed: ${plan.counts.observations}`,
    `- accepted memberships retained: ${plan.counts.activeMemberships}`,
    `- rejected or pending memberships dropped: ${plan.counts.rejectedOrPendingObservations}`,
    `- active axes: ${plan.counts.activeAxes}`,
    `- active concepts: ${plan.counts.activeConcepts}`,
    `- legacy feature-id conflicts eliminated: ${plan.counts.featureIdConflicts}`,
    `- legacy pair conflicts eliminated: ${plan.counts.pairConflicts}`,
    `- Greek terms removed because absent from exact cited bytes: ${plan.counts.removedGreekTerms}`,
    `- legacy dossier references migrated to vNext axis/concept paths: ${plan.counts.dossierReferencesMigrated}`,
    `- dossier references dropped because no reader-visible vNext projection exists: ${plan.counts.dossierReferencesDropped}`,
    `- accepted commentary rejected after losing its only legacy dossier reference: ${plan.counts.commentaryRejectedAfterDossierMigration}`,
    "- identity rule: axis ids derive from dimension plus axis key; concept ids derive from axis plus concept key; membership ids derive from observation plus concept",
    "- membership rule: only accepted observations may occur in reader-visible memberships",
    "",
  ].join("\n");
}

export function applyOntologyVNextMigration(options: {
  repoRoot?: string;
  conceptAuditDirectory?: string;
  splitMembershipProposalObservationIds?: ReadonlyMap<string, readonly string[]>;
} = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot();
  const plan = planOntologyVNextMigration({ ...options, repoRoot });
  const documents = renderOntologyVNextDocuments(plan);
  const ontologyDirectory = join(repoRoot, "wiki/ontology");
  mkdirSync(ontologyDirectory, { recursive: true });
  writeFileSync(join(ontologyDirectory, ONTOLOGY_VNEXT_FILES.axes), documents.axes, "utf8");
  writeFileSync(join(ontologyDirectory, ONTOLOGY_VNEXT_FILES.concepts), documents.concepts, "utf8");
  writeFileSync(join(ontologyDirectory, ONTOLOGY_VNEXT_FILES.memberships), documents.memberships, "utf8");
  for (const ledger of plan.rewrittenLedgers) writeFileSync(join(repoRoot, ledger.path), ledger.content, "utf8");
  for (const ledger of plan.rewrittenCommentaryLedgers) writeFileSync(join(repoRoot, ledger.path), ledger.content, "utf8");
  const legacyRegistry = join(repoRoot, "wiki/features-so-far.md");
  if (existsSync(legacyRegistry)) unlinkSync(legacyRegistry);
  const receiptPath = "wiki/review/2026-08-30-ontology-vnext-concept-migration.md";
  mkdirSync(dirname(join(repoRoot, receiptPath)), { recursive: true });
  writeFileSync(join(repoRoot, receiptPath), migrationReceipt(plan), "utf8");
  return { plan, receiptPath };
}

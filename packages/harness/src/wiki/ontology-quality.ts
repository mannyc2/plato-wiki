import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { parseOntologyVNext, type OntologyVNextDimension, type OntologyVNextModel } from "./ontology-vnext.js";
import { readObservationReviewStatuses, readOntologyVNextDocuments } from "./ontology-vnext-repository.js";
import { validateObservationLedger } from "./observation-validator.js";

export const ONTOLOGY_QUALITY_REPORT_PATH = "wiki/ontology-quality.md";
const EVIDENCE_LIMIT = 10;

export type OntologyQualityLeaf = {
  scope: string;
  state: "pass" | "fail";
  expected: string;
  observed: string;
  evidence: string[];
  remediation: string;
};

export type OntologyQualityDialogue = OntologyQualityLeaf & {
  scope: string;
  acceptedObservations: number | null;
  memberships: number | null;
  membershipsPerObservation: number | null;
  uncoveredObservations: number | null;
  dispositions: number | null;
  invalidBases: number | null;
  uncoveredObservationIds: string[];
  invalidBasisObservationIds: string[];
};

export type OntologyQualityAxis = {
  axisId: string;
  axisKey: string;
  dimension: OntologyVNextDimension;
  comparisonQuestion: string;
  concepts: number;
  memberships: number;
  acceptedObservations: number;
  dialogues: string[];
  singletonConcepts: number;
  emptyConcepts: number;
  crossDialogueConcepts: number;
  observationIds: string[];
};

export type OntologyQualityConcept = {
  conceptId: string;
  conceptKey: string;
  axisKey: string;
  memberships: number;
  dialogueCount: number;
  keyTokens: number;
  observationIds: string[];
};

export type OntologyQualityDuplicate = {
  normalizedText: string;
  keys: string[];
};

export type OntologyQualityMetrics = {
  acceptedObservations: number;
  classifiedObservations: number;
  uncoveredObservations: number;
  dispositionedObservations: number;
  memberships: number;
  multipleMembershipObservations: number;
  membershipsPerAcceptedObservation: number;
  membershipsPerClassifiedObservation: number;
  invalidBases: number;
  axes: OntologyQualityAxis[];
  concepts: OntologyQualityConcept[];
  dimensions: Array<{ dimension: OntologyVNextDimension; axes: number; concepts: number; memberships: number }>;
  membershipHistogram: Array<{ memberships: number; observations: number }>;
  duplicateQuestions: OntologyQualityDuplicate[];
  duplicateDefinitions: OntologyQualityDuplicate[];
  ratifiedAxisCeiling: null;
  independentSampleObservations: null;
  firstPassRecall: null;
  agreementRate: null;
  recallFloor: null;
};

export type OntologyQualityReport = {
  inputErrors: string[];
  metrics: OntologyQualityMetrics | null;
  gates: { axes: OntologyQualityLeaf; concepts: OntologyQualityLeaf; independence: OntologyQualityLeaf };
  dialogues: OntologyQualityDialogue[];
};

export type OntologyQualityOptions = {
  repoRoot?: string;
  canonicalDialogues?: readonly string[];
};

function compareStrings(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function tokens(text: string): string[] {
  return text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** Mask whole key phrases so underscores, spaces, and punctuation cannot disguise a substituted template. */
export function normalizeOntologyQualityText(text: string, keys: readonly string[]) {
  let words = tokens(text);
  const phrases = keys.map(tokens).filter((phrase) => phrase.length > 0).sort((left, right) => right.length - left.length);
  for (const phrase of phrases) {
    const normalized: string[] = [];
    for (let index = 0; index < words.length;) {
      if (phrase.every((word, offset) => words[index + offset] === word)) {
        normalized.push("<key>");
        index += phrase.length;
      } else {
        normalized.push(words[index]!);
        index += 1;
      }
    }
    words = normalized;
  }
  return words.join(" ");
}

export function invalidOntologyAssignmentBasis(basis: string, axisKey: string, conceptKey: string) {
  const normalized = basis.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ").trim();
  const keyContent = tokens(basis).join(" ");
  return normalized.length === 0 || normalized.includes("the retired pre-cut assignment") ||
    normalized.includes("matches the registry") || keyContent === tokens(axisKey).join(" ") || keyContent === tokens(conceptKey).join(" ");
}

function bounded(values: Iterable<string>) {
  return [...new Set(values)].sort(compareStrings).slice(0, EVIDENCE_LIMIT);
}

function observationDialogue(observationId: string) {
  const match = /^obs_([a-z0-9-]+)_[0-9]{4}$/u.exec(observationId);
  if (!match) throw new Error(`Invalid observation identity ${observationId}.`);
  return match[1]!;
}

function readDispositions(repoRoot: string, accepted: ReadonlySet<string>, ontology: OntologyVNextModel) {
  const path = join(repoRoot, "wiki/ontology/dispositions.jsonl");
  if (!existsSync(path)) return new Set<string>();
  const content = readFileSync(path, "utf8");
  if (content === "") return new Set<string>();
  if (!content.endsWith("\n") || content.endsWith("\n\n") || content.includes("\r")) {
    throw new Error("dispositions.jsonl must use canonical LF-only JSONL with exactly one terminal newline.");
  }
  const dispositions = new Set<string>();
  let previousId = "";
  for (const [index, line] of content.slice(0, -1).split("\n").entries()) {
    const value: unknown = JSON.parse(line);
    const context = `wiki/ontology/dispositions.jsonl:${index + 1}`;
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context}: expected an object.`);
    const record = value as Record<string, unknown>;
    if (Object.keys(record).sort(compareStrings).join(",") !== "basis,disposition,observation_id" ||
      typeof record.observation_id !== "string" || record.disposition !== "no_axis_applies" ||
      typeof record.basis !== "string" || record.basis.trim().length === 0 || record.basis !== record.basis.trim()) {
      throw new Error(`${context}: expected observation_id, disposition: no_axis_applies, and a non-empty basis only.`);
    }
    const { observation_id: observationId, disposition, basis } = record;
    if (JSON.stringify({ basis, disposition, observation_id: observationId }) !== line || observationId <= previousId) {
      throw new Error(`${context}: rows must have canonical JSON and strictly increasing observation_id values.`);
    }
    if (!accepted.has(observationId)) throw new Error(`${context}: ${observationId} is not an accepted observation.`);
    if (ontology.membershipsForObservation(observationId).length > 0) {
      throw new Error(`${context}: ${observationId} cannot have both memberships and a no_axis_applies disposition.`);
    }
    dispositions.add(observationId);
    previousId = observationId;
  }
  return dispositions;
}

function duplicateGroups(rows: Iterable<{ key: string; normalized: string; literal: string; scope?: string }>) {
  const grouped = new Map<string, OntologyQualityDuplicate>();
  for (const row of rows) {
    // A shared sentence may contain just one row's key. Masking alone would
    // make those identical sentences look different, so compare both forms.
    for (const normalized of new Set([row.literal, row.normalized])) {
      const identity = `${row.scope ?? ""}\u0000${normalized}`;
      const group = grouped.get(identity) ?? { normalizedText: normalized, keys: [] };
      group.keys.push(row.key);
      grouped.set(identity, group);
    }
  }
  return [...grouped.values()].filter((group) => group.keys.length > 1)
    .map((group) => ({ ...group, keys: group.keys.sort(compareStrings) }))
    .sort((left, right) => compareStrings(left.keys[0]!, right.keys[0]!));
}

const AXES_EXPECTED = "Ratified axis count ceiling; every axis has an authorship receipt, >= 3 concepts and >= 3 dialogues; unique normalized questions.";
const CONCEPTS_EXPECTED = "Every concept has >= 2 memberships and <= 4 key tokens; unique normalized definitions within each axis.";
const MEMBERSHIP_EXPECTED = "Every accepted observation has a membership or no_axis_applies disposition; memberships per accepted observation > 1; zero invalid bases.";
const INDEPENDENCE_EXPECTED = "Independent stratified sample >= max(600, ceil(5% of accepted observations)); terminal adjudications; published recall and agreement; operator-set recall floor met.";

function inputEvidence(dialogues: readonly string[]) {
  return [
    "docs/ontology-v2-target.md", "wiki/ontology/axes.jsonl", "wiki/ontology/concepts.jsonl",
    "wiki/ontology/memberships.jsonl", "wiki/ontology/dispositions.jsonl",
    ...dialogues.map((scope) => `wiki/observations/${scope}.md`),
    ...dialogues.map((scope) => `raw/plato/greek/${scope}.txt`),
  ];
}

function failedReport(dialogues: readonly string[], error: unknown): OntologyQualityReport {
  const message = error instanceof Error ? error.message : String(error);
  const leaf = (expected: string): OntologyQualityLeaf => ({
    scope: "global", state: "fail", expected, observed: `Canonical inputs are invalid; quality metrics were not computed. ${message}`,
    evidence: inputEvidence(dialogues), remediation: "Repair canonical input validation failures, then regenerate the ontology quality report.",
  });
  return {
    inputErrors: [message], metrics: null,
    gates: { axes: leaf(AXES_EXPECTED), concepts: leaf(CONCEPTS_EXPECTED), independence: leaf(INDEPENDENCE_EXPECTED) },
    dialogues: [...dialogues].sort(compareStrings).map((scope) => ({
      ...leaf(MEMBERSHIP_EXPECTED), scope, acceptedObservations: null, memberships: null,
      membershipsPerObservation: null, uncoveredObservations: null, dispositions: null, invalidBases: null,
      uncoveredObservationIds: [], invalidBasisObservationIds: [],
    })),
  };
}

export function evaluateOntologyQuality(options: OntologyQualityOptions = {}): OntologyQualityReport {
  const repoRoot = options.repoRoot ?? getRepoRoot();
  let dialogueScopes = [...(options.canonicalDialogues ?? [])].sort(compareStrings);
  try {
    const ledgerPaths = readdirSync(join(repoRoot, "wiki/observations"), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => `wiki/observations/${entry.name}`).sort(compareStrings);
    for (const path of ledgerPaths) {
      const issues = validateObservationLedger(path, readFileSync(join(repoRoot, path), "utf8"), repoRoot);
      if (issues.length > 0) throw new Error(`${path}: ${issues.map((issue) => `[${issue.code}] ${issue.message}`).join("; ")}`);
    }
    const statuses = readObservationReviewStatuses(repoRoot);
    const accepted = new Set([...statuses].filter(([, status]) => status === "accepted").map(([id]) => id));
    const observedDialogues = [...new Set([...statuses.keys()].map(observationDialogue))].sort(compareStrings);
    if (options.canonicalDialogues === undefined) dialogueScopes = observedDialogues;
    if (new Set(dialogueScopes).size !== dialogueScopes.length) throw new Error("Canonical dialogue scopes must be unique.");
    const canonical = new Set(dialogueScopes);
    for (const slug of observedDialogues) {
      if (!canonical.has(slug)) throw new Error(`Observation dialogue ${slug} is outside the canonical dialogue set.`);
    }
    const ontology = parseOntologyVNext(readOntologyVNextDocuments(repoRoot), { observationReviewStatuses: statuses });
    const dispositions = readDispositions(repoRoot, accepted, ontology);
    const conceptMembers = new Map<string, string[]>();
    const invalidBasisObservations = new Map<string, string[]>();
    for (const membership of ontology.memberships) {
      const members = conceptMembers.get(membership.concept_id) ?? [];
      members.push(membership.observation_id);
      conceptMembers.set(membership.concept_id, members);
      const concept = ontology.concept(membership.concept_id)!;
      const axis = ontology.axis(concept.axis_id)!;
      if (invalidOntologyAssignmentBasis(membership.assignment_basis, axis.axis_key, concept.concept_key)) {
        const slug = observationDialogue(membership.observation_id);
        const invalid = invalidBasisObservations.get(slug) ?? [];
        invalid.push(membership.observation_id);
        invalidBasisObservations.set(slug, invalid);
      }
    }

    const concepts: OntologyQualityConcept[] = ontology.concepts.map((concept) => {
      const members = conceptMembers.get(concept.concept_id) ?? [];
      return {
        conceptId: concept.concept_id, conceptKey: concept.concept_key, axisKey: ontology.axis(concept.axis_id)!.axis_key,
        memberships: members.length, dialogueCount: new Set(members.map(observationDialogue)).size,
        keyTokens: tokens(concept.concept_key).length, observationIds: bounded(members),
      };
    }).sort((left, right) => compareStrings(left.axisKey, right.axisKey) || compareStrings(left.conceptKey, right.conceptKey));
    const axes: OntologyQualityAxis[] = ontology.axes.map((axis) => {
      const children = concepts.filter((concept) => concept.axisKey === axis.axis_key);
      const members = children.flatMap((concept) => conceptMembers.get(concept.conceptId) ?? []);
      return {
        axisId: axis.axis_id, axisKey: axis.axis_key, dimension: axis.dimension, comparisonQuestion: axis.comparison_question,
        concepts: children.length, memberships: members.length, acceptedObservations: new Set(members).size,
        dialogues: [...new Set(members.map(observationDialogue))].sort(compareStrings),
        singletonConcepts: children.filter((concept) => concept.memberships === 1).length,
        emptyConcepts: children.filter((concept) => concept.memberships === 0).length,
        crossDialogueConcepts: children.filter((concept) => concept.dialogueCount >= 2).length,
        observationIds: bounded(members),
      };
    }).sort((left, right) => compareStrings(left.axisKey, right.axisKey));
    const duplicateQuestions = duplicateGroups(ontology.axes.map((axis) => ({
      key: axis.axis_key, normalized: normalizeOntologyQualityText(axis.comparison_question, [axis.axis_key]),
      literal: normalizeOntologyQualityText(axis.comparison_question, []),
    })));
    const duplicateDefinitions = duplicateGroups(ontology.concepts.map((concept) => ({
      key: `${ontology.axis(concept.axis_id)!.axis_key}/${concept.concept_key}`, scope: concept.axis_id,
      normalized: normalizeOntologyQualityText(concept.definition, [concept.concept_key]),
      literal: normalizeOntologyQualityText(concept.definition, []),
    })));
    const uncovered = [...accepted].filter((id) => ontology.membershipsForObservation(id).length === 0 && !dispositions.has(id));
    const histogram = new Map<number, number>();
    for (const id of accepted) {
      const count = ontology.membershipsForObservation(id).length;
      histogram.set(count, (histogram.get(count) ?? 0) + 1);
    }
    const classified = accepted.size - (histogram.get(0) ?? 0);
    const invalidBases = [...invalidBasisObservations.values()].reduce((sum, ids) => sum + ids.length, 0);
    const sparseConcepts = concepts.filter((concept) => concept.memberships < 2);
    const longConcepts = concepts.filter((concept) => concept.keyTokens > 4);

    // Authorship and independent adjudication are semantic decisions. The legacy audit
    // package cannot stand in for evidence of a new catalog or a second membership pass.
    const gates: OntologyQualityReport["gates"] = {
      axes: {
        scope: "global", state: "fail", expected: AXES_EXPECTED,
        observed: `${axes.length} axes; no ratified ceiling or authored-catalog receipt evidence; ${axes.filter((axis) => axis.concepts < 3).length} axes below 3 concepts; ${axes.filter((axis) => axis.dialogues.length < 3).length} below 3 dialogues; ${duplicateQuestions.length} duplicate normalized question groups.`,
        evidence: inputEvidence(dialogueScopes),
        remediation: "Author and independently review the catalog; record axis authorship and the operator-ratified count in a canonical receipt under wiki/review/. Implement receipt verification with that evidence; preserve the admission floors.",
      },
      concepts: {
        scope: "global",
        state: sparseConcepts.length === 0 && longConcepts.length === 0 && duplicateDefinitions.length === 0 && concepts.length > 0 ? "pass" : "fail",
        expected: CONCEPTS_EXPECTED,
        observed: `${concepts.length} concepts; ${sparseConcepts.length} below 2 memberships; ${longConcepts.length} over 4 key tokens; ${duplicateDefinitions.length} duplicate normalized definition groups.`,
        evidence: inputEvidence(dialogueScopes),
        remediation: "Replace passage paraphrases with authored answer classes; classify accepted observations, then remove or reassign classes below two members and resolve definition templates.",
      },
      independence: {
        scope: "global", state: "fail", expected: INDEPENDENCE_EXPECTED,
        observed: `Required sample: ${Math.max(600, Math.ceil(accepted.size * 0.05))} accepted observations across all dialogue strata. No verified independent membership-pass evidence, adjudications, recall, agreement, or operator-set floor.`,
        evidence: inputEvidence(dialogueScopes),
        remediation: "After the full membership pass, independently review a stratified sample, adjudicate every disagreement in the cutover receipt, publish measured recall and agreement, and obtain the operator's recall floor. Add verification for the canonical receipt evidence.",
      },
    };
    const dialogues = dialogueScopes.map((scope): OntologyQualityDialogue => {
      const ids = [...accepted].filter((id) => observationDialogue(id) === scope);
      const missing = uncovered.filter((id) => observationDialogue(id) === scope);
      const invalid = invalidBasisObservations.get(scope) ?? [];
      const membershipCount = ids.reduce((sum, id) => sum + ontology.membershipsForObservation(id).length, 0);
      const ratio = ids.length > 0 ? membershipCount / ids.length : 0;
      const dispositionCount = ids.filter((id) => dispositions.has(id)).length;
      return {
        scope, state: ids.length > 0 && missing.length === 0 && ratio > 1 && invalid.length === 0 ? "pass" : "fail",
        expected: MEMBERSHIP_EXPECTED,
        observed: `${ids.length} accepted observations; ${membershipCount} memberships (${ratio.toFixed(6)} per accepted observation); ${missing.length} uncovered; ${dispositionCount} dispositions; ${invalid.length} invalid bases.`,
        evidence: inputEvidence([scope]),
        remediation: "After catalog ratification, classify every accepted observation against the whole catalog; add all supported memberships with textual bases, or an explicit no_axis_applies disposition, without changing observation records.",
        acceptedObservations: ids.length, memberships: membershipCount, membershipsPerObservation: ratio,
        uncoveredObservations: missing.length, dispositions: dispositionCount, invalidBases: invalid.length,
        uncoveredObservationIds: bounded(missing), invalidBasisObservationIds: bounded(invalid),
      };
    });
    const metrics: OntologyQualityMetrics = {
      acceptedObservations: accepted.size, classifiedObservations: classified, uncoveredObservations: uncovered.length,
      dispositionedObservations: dispositions.size, memberships: ontology.memberships.length,
      multipleMembershipObservations: [...histogram].filter(([count]) => count > 1).reduce((sum, [, count]) => sum + count, 0),
      membershipsPerAcceptedObservation: accepted.size > 0 ? ontology.memberships.length / accepted.size : 0,
      membershipsPerClassifiedObservation: classified > 0 ? ontology.memberships.length / classified : 0,
      invalidBases, axes, concepts, duplicateQuestions, duplicateDefinitions,
      dimensions: [...new Set(axes.map((axis) => axis.dimension))].sort(compareStrings).map((dimension) => {
        const matching = axes.filter((axis) => axis.dimension === dimension);
        return { dimension, axes: matching.length, concepts: matching.reduce((sum, axis) => sum + axis.concepts, 0), memberships: matching.reduce((sum, axis) => sum + axis.memberships, 0) };
      }),
      membershipHistogram: [...histogram].sort(([left], [right]) => left - right).map(([memberships, observations]) => ({ memberships, observations })),
      ratifiedAxisCeiling: null, independentSampleObservations: null, firstPassRecall: null, agreementRate: null, recallFloor: null,
    };
    return { inputErrors: [], metrics, gates, dialogues };
  } catch (error) {
    return failedReport(dialogueScopes, error);
  }
}

function cell(value: string | number | null) {
  return String(value ?? "unavailable").replace(/\|/gu, "\\|").replace(/[\r\n]+/gu, " ");
}

export function renderOntologyQualityReport(report: OntologyQualityReport) {
  const lines = [
    "# Ontology quality", "", "Generated deterministically from validated canonical ontology JSONL and observation ledgers with Greek source references. This report is a projection, not classification or review authority.", "",
    "The current assessment measures O1–O4. Authored-catalog ratification and independent membership-review evidence are not yet verified by this phase-0 implementation; O1 and O4 fail closed. Legacy audit receipts do not establish those decisions.", "",
    "## Completeness gates", "", "| Gate | State | Observed |", "| --- | --- | --- |",
    ...([['O1 axes', report.gates.axes], ['O2 concepts', report.gates.concepts], ['O4 independence', report.gates.independence]] as const)
      .map(([name, gate]) => `| ${name} | ${gate.state.toUpperCase()} | ${cell(gate.observed)} |`), "",
  ];
  if (report.inputErrors.length > 0 || report.metrics === null) {
    lines.push("## Invalid inputs", "", "No quality counts are published for invalid canonical inputs.", "", ...report.inputErrors.map((error) => `- ${cell(error)}`), "");
    return lines.join("\n");
  }
  const metrics = report.metrics;
  const largestAxes = [...metrics.axes].sort((left, right) => right.memberships - left.memberships || compareStrings(left.axisKey, right.axisKey)).slice(0, 11);
  lines.push(
    "## Corpus measurements", "", "| Measure | Count |", "| --- | ---: |",
    `| Axes | ${metrics.axes.length} |`, `| Concepts | ${metrics.concepts.length} |`, `| Memberships | ${metrics.memberships} |`,
    `| Accepted observations | ${metrics.acceptedObservations} |`, `| Classified observations | ${metrics.classifiedObservations} |`,
    `| Accepted observations without membership or disposition | ${metrics.uncoveredObservations} |`,
    `| Explicit no_axis_applies dispositions | ${metrics.dispositionedObservations} |`,
    `| Observations with multiple memberships | ${metrics.multipleMembershipObservations} |`,
    `| Memberships per accepted observation | ${metrics.membershipsPerAcceptedObservation.toFixed(6)} |`,
    `| Memberships per classified observation | ${metrics.membershipsPerClassifiedObservation.toFixed(6)} |`,
    `| Invalid assignment bases | ${metrics.invalidBases} |`,
    `| Axes with one concept | ${metrics.axes.filter((axis) => axis.concepts === 1).length} |`,
    `| Axes with one membership | ${metrics.axes.filter((axis) => axis.memberships === 1).length} |`,
    `| Axes represented in one dialogue | ${metrics.axes.filter((axis) => axis.dialogues.length === 1).length} |`,
    `| Axes represented in fewer than three dialogues | ${metrics.axes.filter((axis) => axis.dialogues.length < 3).length} |`,
    `| Memberships in the eleven largest axes | ${largestAxes.reduce((sum, axis) => sum + axis.memberships, 0)} |`,
    `| Concepts with zero memberships | ${metrics.concepts.filter((concept) => concept.memberships === 0).length} |`,
    `| Concepts with one membership | ${metrics.concepts.filter((concept) => concept.memberships === 1).length} |`,
    `| Concepts with members in multiple dialogues | ${metrics.concepts.filter((concept) => concept.dialogueCount >= 2).length} |`,
    `| Concept keys over four tokens | ${metrics.concepts.filter((concept) => concept.keyTokens > 4).length} |`,
    `| Duplicate normalized question groups | ${metrics.duplicateQuestions.length} |`,
    `| Duplicate normalized definition groups within axes | ${metrics.duplicateDefinitions.length} |`, "",
    "## Independent evidence", "", "Ratified axis ceiling, independent sample size, first-pass recall, agreement rate, and operator-set recall floor: **unavailable**. No values are inferred from the current one-pass membership distribution.", "",
    "## Dimensions", "", "| Dimension | Axes | Concepts | Memberships |", "| --- | ---: | ---: | ---: |",
    ...metrics.dimensions.map((dimension) => `| ${dimension.dimension} | ${dimension.axes} | ${dimension.concepts} | ${dimension.memberships} |`), "",
    "## Membership distribution", "", "| Memberships per observation | Accepted observations |", "| ---: | ---: |",
    ...metrics.membershipHistogram.map((row) => `| ${row.memberships} | ${row.observations} |`), "",
    "## Dialogue membership gates (O3)", "", "| Dialogue | State | Accepted | Memberships | Ratio | Uncovered | Dispositions | Invalid bases |", "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...report.dialogues.map((dialogue) => `| ${dialogue.scope} | ${dialogue.state.toUpperCase()} | ${cell(dialogue.acceptedObservations)} | ${cell(dialogue.memberships)} | ${dialogue.membershipsPerObservation?.toFixed(6) ?? "unavailable"} | ${cell(dialogue.uncoveredObservations)} | ${cell(dialogue.dispositions)} | ${cell(dialogue.invalidBases)} |`), "",
    "## Bounded membership evidence", "", `At most ${EVIDENCE_LIMIT} uncovered and ${EVIDENCE_LIMIT} invalid-basis observation IDs are shown per dialogue; all records contribute to the counts.`, "",
    ...report.dialogues.filter((dialogue) => dialogue.state === "fail").map((dialogue) => `- **${dialogue.scope}**: uncovered: ${dialogue.uncoveredObservationIds.map((id) => `\`${id}\``).join(", ") || "none"}; invalid bases: ${dialogue.invalidBasisObservationIds.map((id) => `\`${id}\``).join(", ") || "none"}.`), "",
    "## Normalized-text collisions", "", "Normalization lowercases Unicode text and tokenizes words. Equality is checked both before and after replacing each complete key phrase (including its space-separated spelling) with one placeholder. Definition equality is tested within an axis.", "",
    ...metrics.duplicateQuestions.map((group) => `- Question: \`${cell(group.normalizedText)}\` — ${group.keys.length} axes; examples: ${bounded(group.keys).map((key) => `\`${key}\``).join(", ")}.`),
    ...metrics.duplicateDefinitions.map((group) => `- Definition: \`${cell(group.normalizedText)}\` — ${group.keys.length} concepts; examples: ${bounded(group.keys).map((key) => `\`${key}\``).join(", ")}.`), "",
    "## Concept findings", "", "| Finding | Count | Bounded concept and observation examples |", "| --- | ---: | --- |",
  );
  for (const [name, concepts] of [
    ["Fewer than two memberships", metrics.concepts.filter((concept) => concept.memberships < 2)],
    ["Key over four tokens", metrics.concepts.filter((concept) => concept.keyTokens > 4)],
  ] as const) {
    lines.push(`| ${name} | ${concepts.length} | ${concepts.slice(0, EVIDENCE_LIMIT).map((concept) => `${concept.axisKey}/${concept.conceptKey}: ${concept.observationIds.join(", ") || "no members"}`).join("; ")} |`);
  }
  lines.push(
    "", "## Axis inventory", "", "Every canonical axis appears with its exact comparison question. Observation examples are bounded; dialogue and membership counts use the full canonical set.", "",
    "| Axis | Dimension | Exact question | Concepts | Memberships | Accepted observations | Dialogues | Singleton concepts | Empty concepts | Cross-dialogue concepts | Observation examples |",
    "| --- | --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |",
    ...metrics.axes.map((axis) => `| ${axis.axisKey} | ${axis.dimension} | ${cell(axis.comparisonQuestion)} | ${axis.concepts} | ${axis.memberships} | ${axis.acceptedObservations} | ${axis.dialogues.join(", ")} | ${axis.singletonConcepts} | ${axis.emptyConcepts} | ${axis.crossDialogueConcepts} | ${axis.observationIds.join(", ")} |`), "",
  );
  return lines.join("\n");
}

export function writeOntologyQualityReport(report: OntologyQualityReport, repoRoot = getRepoRoot()) {
  const path = join(repoRoot, ONTOLOGY_QUALITY_REPORT_PATH);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, renderOntologyQualityReport(report), "utf8");
  return path;
}

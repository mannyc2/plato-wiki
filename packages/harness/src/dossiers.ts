import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { observationTurnJoinPath, parseObservationTurnJoinToon, type ObservationTurnJoinRow } from "./derived/joins.js";
import { listGreekDialogues } from "./derived/stephanus.js";
import { getRepoRoot } from "./paths.js";
import {
  dialogueFromObservationId,
  fieldValue,
  listObservationLedgerPaths,
  nestedFieldValueInParent,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";
import { readOntologyVNextRepository } from "./wiki/ontology-vnext-repository.js";

export type DossierObservation = {
  observationId: string;
  dialogue: string;
  stephanusSpan: string;
  startChar: number;
  endChar: number;
};

export type DossierCooccurrence = {
  axisId: string;
  axisKey: string;
  conceptId: string;
  conceptKey: string;
  overlappingObservations: number;
};

export type PatternDossier = {
  axisId: string;
  axisKey: string;
  dimension: string;
  conceptId: string;
  conceptKey: string;
  comparisonQuestion: string;
  instances: Array<{
    observationId: string;
    dialogue: string;
    stephanusSpan: string;
    speakers: string[];
    turnCount: number;
  }>;
  presence: Array<{ dialogue: string; acceptedObservations: number }>;
  cooccurrence: DossierCooccurrence[];
};

export type WrittenDossierArtifact = {
  path: string;
  dossierCount: number;
};

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
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

function dossierPath(axisKey: string, conceptKey: string) {
  return `wiki/dossiers/${axisKey}/${conceptKey}.json`;
}

function parseObservationRecords() {
  const observations = new Map<string, DossierObservation>();
  for (const path of listObservationLedgerPaths({ absolute: true })) {
    const content = readFileSync(path, "utf8");
    for (const block of observationYamlBlocks(content)) {
      const observationId = fieldValue(block, "observation_id");
      const stephanusSpan = fieldValue(block, "stephanus_span");
      const startChar = Number(nestedFieldValueInParent(block, "source_ref", "start_char"));
      const endChar = Number(nestedFieldValueInParent(block, "source_ref", "end_char"));
      if (
        !observationId ||
        !stephanusSpan ||
        !Number.isInteger(startChar) ||
        !Number.isInteger(endChar) ||
        endChar < startChar
      ) {
        throw new Error(`Malformed observation record for dossier generation: ${observationId ?? "(missing id)"}`);
      }
      observations.set(observationId, {
        observationId,
        dialogue: dialogueFromObservationId(observationId),
        stephanusSpan,
        startChar,
        endChar,
      });
    }
  }
  return observations;
}

function readJoinRows(dialogues: string[]) {
  const rows = new Map<string, ObservationTurnJoinRow>();
  for (const dialogue of dialogues) {
    const path = observationTurnJoinPath(dialogue);
    const absolutePath = join(getRepoRoot(), path);
    if (!existsSync(absolutePath)) throw new Error(`Missing observation-turn join: ${path}`);
    const index = parseObservationTurnJoinToon(readFileSync(absolutePath, "utf8"));
    for (const row of index.rows) rows.set(row.observationId, row);
  }
  return rows;
}

function overlaps(left: DossierObservation, right: DossierObservation) {
  return left.dialogue === right.dialogue && left.startChar < right.endChar && right.startChar < left.endChar;
}

export function buildDossiers(): PatternDossier[] {
  const ontology = readOntologyVNextRepository();
  const observations = parseObservationRecords();
  const observationIdsByConcept = new Map<string, string[]>();
  const conceptIdsByObservation = new Map<string, string[]>();
  for (const membership of ontology.memberships) {
    const byConcept = observationIdsByConcept.get(membership.concept_id) ?? [];
    byConcept.push(membership.observation_id);
    observationIdsByConcept.set(membership.concept_id, byConcept);
    const byObservation = conceptIdsByObservation.get(membership.observation_id) ?? [];
    byObservation.push(membership.concept_id);
    conceptIdsByObservation.set(membership.observation_id, byObservation);
  }
  const acceptedObservations = [...conceptIdsByObservation.keys()].map((observationId) => {
    const observation = observations.get(observationId);
    if (!observation) throw new Error(`Ontology membership references missing observation ${observationId}.`);
    return observation;
  });
  const joinRows = readJoinRows([...new Set(acceptedObservations.map((observation) => observation.dialogue))].sort(compareStrings));
  const dialogues = listGreekDialogues();

  return ontology.concepts
    .flatMap((concept): PatternDossier[] => {
      const instanceObservations = (observationIdsByConcept.get(concept.concept_id) ?? [])
        .map((observationId) => observations.get(observationId)!)
        .sort((left, right) => compareStrings(left.observationId, right.observationId));
      if (instanceObservations.length < 2) return [];
      const axis = ontology.axis(concept.axis_id)!;
      const cooccurrenceObservationIds = new Map<string, Set<string>>();
      for (const instance of instanceObservations) {
        for (const other of acceptedObservations) {
          if (!overlaps(instance, other)) continue;
          for (const otherConceptId of conceptIdsByObservation.get(other.observationId) ?? []) {
            if (otherConceptId === concept.concept_id) continue;
            const ids = cooccurrenceObservationIds.get(otherConceptId) ?? new Set<string>();
            ids.add(other.observationId);
            cooccurrenceObservationIds.set(otherConceptId, ids);
          }
        }
      }

      return [{
        axisId: axis.axis_id,
        axisKey: axis.axis_key,
        dimension: axis.dimension,
        conceptId: concept.concept_id,
        conceptKey: concept.concept_key,
        comparisonQuestion: concept.comparison_question,
        instances: instanceObservations.map((observation) => {
          const turnJoin = joinRows.get(observation.observationId);
          if (!turnJoin) throw new Error(`Missing join row for ${observation.observationId}`);
          return {
            observationId: observation.observationId,
            dialogue: observation.dialogue,
            stephanusSpan: observation.stephanusSpan,
            speakers: turnJoin.attributed ? turnJoin.speakers : ["(unattributed)"],
            turnCount: turnJoin.turnIds.length,
          };
        }),
        presence: dialogues.map((dialogue) => ({
          dialogue,
          acceptedObservations: instanceObservations.filter((observation) => observation.dialogue === dialogue).length,
        })),
        cooccurrence: [...cooccurrenceObservationIds.entries()]
          .map(([otherConceptId, ids]) => {
            const otherConcept = ontology.concept(otherConceptId)!;
            const otherAxis = ontology.axis(otherConcept.axis_id)!;
            return {
              axisId: otherAxis.axis_id,
              axisKey: otherAxis.axis_key,
              conceptId: otherConcept.concept_id,
              conceptKey: otherConcept.concept_key,
              overlappingObservations: ids.size,
            };
          })
          .sort(
            (left, right) =>
              right.overlappingObservations - left.overlappingObservations ||
              compareStrings(left.axisId, right.axisId) ||
              compareStrings(left.conceptId, right.conceptId),
          )
          .slice(0, 15),
      }];
    })
    .sort((left, right) => compareStrings(left.axisId, right.axisId) || compareStrings(left.conceptId, right.conceptId));
}

export function formatDossierJson(dossier: PatternDossier) {
  return canonicalJson({
    schema_version: 1,
    projection_kind: "concept_dossier",
    projection_id: `dossier:${dossier.conceptId}`,
    axis_id: dossier.axisId,
    axis_key: dossier.axisKey,
    dimension: dossier.dimension,
    concept_id: dossier.conceptId,
    concept_key: dossier.conceptKey,
    comparison_question: dossier.comparisonQuestion,
    accepted_observations: dossier.instances.length,
    dialogues: dossier.presence.filter((entry) => entry.acceptedObservations > 0).length,
    instance_ids: dossier.instances.map((instance) => instance.observationId),
    instances: dossier.instances,
    presence: dossier.presence,
    cooccurrence: dossier.cooccurrence,
  });
}

function formatDossierIndexJson(dossiers: PatternDossier[]) {
  return canonicalJson({
    schema_version: 1,
    projection_kind: "concept_dossier_index",
    dossiers: dossiers.map((dossier) => ({
      axis_id: dossier.axisId,
      axis_key: dossier.axisKey,
      concept_id: dossier.conceptId,
      concept_key: dossier.conceptKey,
      accepted_observations: dossier.instances.length,
      dialogues: dossier.presence.filter((entry) => entry.acceptedObservations > 0).length,
      path: dossierPath(dossier.axisKey, dossier.conceptKey),
    })),
  });
}

function expectedDossierArtifacts() {
  const dossiers = buildDossiers();
  return {
    dossiers,
    files: new Map([
      ...dossiers.map((dossier): [string, string] => [
        dossierPath(dossier.axisKey, dossier.conceptKey),
        formatDossierJson(dossier),
      ]),
      ["wiki/dossiers/index.json", formatDossierIndexJson(dossiers)] as [string, string],
    ]),
  };
}

export function writeDossierArtifacts(): WrittenDossierArtifact[] {
  const { dossiers, files } = expectedDossierArtifacts();
  const repoRoot = getRepoRoot();
  const dossierDir = join(repoRoot, "wiki/dossiers");
  rmSync(dossierDir, { recursive: true, force: true });
  mkdirSync(dossierDir, { recursive: true });

  const written: WrittenDossierArtifact[] = [];
  for (const [relativePath, content] of [...files].sort(([left], [right]) => compareStrings(left, right))) {
    const absolutePath = join(repoRoot, relativePath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content, "utf8");
    written.push({
      path: relative(repoRoot, absolutePath),
      dossierCount: relativePath === "wiki/dossiers/index.json" ? dossiers.length : 1,
    });
  }
  return written;
}

function listDossierFiles(dir: string, prefix = "wiki/dossiers"): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const childPath = join(dir, entry.name);
    const relativePath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) return listDossierFiles(childPath, relativePath);
    return entry.isFile() ? [relativePath] : [];
  });
}

export function validateDossierArtifacts() {
  const repoRoot = getRepoRoot();
  const dossierDir = join(repoRoot, "wiki/dossiers");
  const expected = expectedDossierArtifacts().files;
  const actual = new Set(listDossierFiles(dossierDir));
  const failures: string[] = [];
  for (const path of expected.keys()) if (!actual.has(path)) failures.push(`${path}: missing dossier artifact`);
  for (const path of actual) if (!expected.has(path)) failures.push(`${path}: stale dossier artifact`);
  for (const [path, content] of expected) {
    if (actual.has(path) && readFileSync(join(repoRoot, path), "utf8") !== content) {
      failures.push(`${path}: dossier artifact does not equal its canonical ontology projection`);
    }
  }
  return failures.sort(compareStrings);
}

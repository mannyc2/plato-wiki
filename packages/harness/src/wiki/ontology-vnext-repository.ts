import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fencedYamlRecordBlocks } from "./fenced-record.js";
import {
  ONTOLOGY_VNEXT_FILES,
  parseOntologyVNext,
  validateOntologyVNext,
  type ObservationReviewStatus,
  type OntologyVNextDocuments,
} from "./ontology-vnext.js";

function scalar(value: unknown) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
}

export function readObservationReviewStatuses(repoRoot = getRepoRoot()) {
  const directory = join(repoRoot, "wiki/observations");
  const statuses = new Map<string, ObservationReviewStatus>();
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const path = join(directory, entry.name);
    for (const block of fencedYamlRecordBlocks(readFileSync(path, "utf8"))) {
      const observationId = scalar(block.record.observation_id);
      const reviewStatus = scalar(block.record.review_status);
      if (!observationId) throw new Error(`${path}: observation block ${block.index + 1} has no observation_id.`);
      if (statuses.has(observationId)) throw new Error(`Duplicate observation id ${observationId}.`);
      if (reviewStatus !== "accepted" && reviewStatus !== "rejected" && reviewStatus !== "unreviewed" && reviewStatus !== "needs_split") {
        throw new Error(`${path}: ${observationId} has invalid review_status ${reviewStatus}.`);
      }
      statuses.set(observationId, reviewStatus);
    }
  }
  return statuses;
}

export function readOntologyVNextDocuments(repoRoot = getRepoRoot()): OntologyVNextDocuments {
  const directory = join(repoRoot, "wiki/ontology");
  return {
    axes: readFileSync(join(directory, ONTOLOGY_VNEXT_FILES.axes), "utf8"),
    concepts: readFileSync(join(directory, ONTOLOGY_VNEXT_FILES.concepts), "utf8"),
    memberships: readFileSync(join(directory, ONTOLOGY_VNEXT_FILES.memberships), "utf8"),
  };
}

export function validateOntologyVNextRepository(repoRoot = getRepoRoot()) {
  return validateOntologyVNext(readOntologyVNextDocuments(repoRoot), {
    observationReviewStatuses: readObservationReviewStatuses(repoRoot),
  });
}

export function readOntologyVNextRepository(repoRoot = getRepoRoot()) {
  return parseOntologyVNext(readOntologyVNextDocuments(repoRoot), {
    observationReviewStatuses: readObservationReviewStatuses(repoRoot),
  });
}

export type ObservationOntologyConceptRef = {
  axisId: string;
  axisKey: string;
  conceptId: string;
  conceptKey: string;
};

export function ontologyConceptRefsByObservation(repoRoot = getRepoRoot()) {
  const ontology = readOntologyVNextRepository(repoRoot);
  const result = new Map<string, ObservationOntologyConceptRef[]>();
  for (const membership of ontology.memberships) {
    const concept = ontology.concept(membership.concept_id);
    if (!concept) throw new Error(`Missing ontology concept ${membership.concept_id}.`);
    const axis = ontology.axis(concept.axis_id);
    if (!axis) throw new Error(`Missing ontology axis ${concept.axis_id}.`);
    const refs = result.get(membership.observation_id) ?? [];
    refs.push({
      axisId: axis.axis_id,
      axisKey: axis.axis_key,
      conceptId: concept.concept_id,
      conceptKey: concept.concept_key,
    });
    result.set(membership.observation_id, refs);
  }
  for (const refs of result.values()) {
    refs.sort((left, right) =>
      left.axisKey.localeCompare(right.axisKey) || left.conceptKey.localeCompare(right.conceptKey)
    );
  }
  return result;
}

export function ontologyDossierPathsByObservation(repoRoot = getRepoRoot()) {
  return new Map(
    [...ontologyConceptRefsByObservation(repoRoot)].map(([observationId, refs]) => [
      observationId,
      refs.map(({ axisKey, conceptKey }) => `wiki/dossiers/${axisKey}/${conceptKey}.json`),
    ]),
  );
}

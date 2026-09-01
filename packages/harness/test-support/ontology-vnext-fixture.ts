import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fieldValue, observationYamlBlocks } from "../src/wiki/observation-ledger.js";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  renderOntologyVNextDocuments,
} from "../src/wiki/ontology-vnext.js";

export function writeOntologyVNextFixture(repoRoot: string) {
  const axisId = deriveOntologyVNextAxisId("presentation_form", "reported_frame_structure");
  const conceptId = deriveOntologyVNextConceptId(axisId, "reported_dialogue_frame");
  const observationDir = join(repoRoot, "wiki/observations");
  const acceptedIds = existsSync(observationDir)
    ? readdirSync(observationDir)
        .filter((name) => name.endsWith(".md"))
        .flatMap((name) => observationYamlBlocks(readFileSync(join(observationDir, name), "utf8")))
        .filter((block) => fieldValue(block, "review_status") === "accepted")
        .map((block) => fieldValue(block, "observation_id"))
        .filter((id): id is string => id !== undefined)
        .sort()
    : [];
  const documents = renderOntologyVNextDocuments({
    axes: [{
      schema_version: 1,
      axis_id: axisId,
      axis_key: "reported_frame_structure",
      dimension: "presentation_form",
      comparison_question: "How does the text present a reported dialogue frame?",
    }],
    concepts: [{
      schema_version: 1,
      concept_id: conceptId,
      axis_id: axisId,
      concept_key: "reported_dialogue_frame",
      definition: "The passage presents dialogue through an explicit report or transmission frame.",
      comparison_question: "Where does the text present a reported dialogue frame?",
    }],
    memberships: acceptedIds.map((observationId) => ({
      schema_version: 1 as const,
      membership_id: deriveOntologyVNextMembershipId(observationId, conceptId),
      observation_id: observationId,
      concept_id: conceptId,
      assignment_basis: "The accepted observation explicitly records a reported dialogue frame.",
    })),
  });
  const ontologyDir = join(repoRoot, "wiki/ontology");
  mkdirSync(ontologyDir, { recursive: true });
  writeFileSync(join(ontologyDir, "axes.jsonl"), documents.axes, "utf8");
  writeFileSync(join(ontologyDir, "concepts.jsonl"), documents.concepts, "utf8");
  writeFileSync(join(ontologyDir, "memberships.jsonl"), documents.memberships, "utf8");
  const dossierDir = join(repoRoot, "wiki/dossiers/reported_frame_structure");
  mkdirSync(dossierDir, { recursive: true });
  writeFileSync(join(dossierDir, "reported_dialogue_frame.json"), "{}\n", "utf8");
}

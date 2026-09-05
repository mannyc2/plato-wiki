import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildClusters, validateClusterArtifacts, writeClusterArtifacts } from "./clusters.js";
import { setRepoRootForTesting } from "./paths.js";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  renderOntologyVNextDocuments,
  type OntologyVNextConcept,
} from "./wiki/ontology-vnext.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function record(observationId: string, status = "accepted") {
  return `\`\`\`yaml
observation_id: ${observationId}
stephanus_span: 2a-2b
review_status: ${status}
\`\`\``;
}

function writeLedger(fileName: string, observationIds: string[]) {
  writeFileSync(
    join(root, "wiki/observations", fileName),
    observationIds.map((observationId) => record(observationId)).join("\n\n"),
    "utf8",
  );
}

function writeOntology(assignments: Array<{ conceptKey: string; observationIds: string[] }>) {
  const axisId = deriveOntologyVNextAxisId("textual_function", "argument_move");
  const concepts: OntologyVNextConcept[] = assignments.map(({ conceptKey }) => ({
    schema_version: 1,
    concept_id: deriveOntologyVNextConceptId(axisId, conceptKey),
    axis_id: axisId,
    concept_key: conceptKey,
    definition: `The cited span performs the ${conceptKey} textual function.`,
    comparison_question: "What argumentative move does the cited span perform?",
  }));
  const conceptByKey = new Map(concepts.map((concept) => [concept.concept_key, concept]));
  const memberships = assignments.flatMap(({ conceptKey, observationIds }) =>
    observationIds.map((observationId) => {
      const conceptId = conceptByKey.get(conceptKey)!.concept_id;
      return {
        schema_version: 1 as const,
        membership_id: deriveOntologyVNextMembershipId(observationId, conceptId),
        observation_id: observationId,
        concept_id: conceptId,
        assignment_basis: "The cited Greek span instantiates this comparison category.",
      };
    }),
  );
  const documents = renderOntologyVNextDocuments({
    axes: [
      {
        schema_version: 1,
        axis_id: axisId,
        axis_key: "argument_move",
        dimension: "textual_function",
        comparison_question: "What argumentative move does the cited span perform?",
      },
    ],
    concepts,
    memberships,
  });
  writeFileSync(join(root, "wiki/ontology/axes.jsonl"), documents.axes);
  writeFileSync(join(root, "wiki/ontology/concepts.jsonl"), documents.concepts);
  writeFileSync(join(root, "wiki/ontology/memberships.jsonl"), documents.memberships);
}

describe("ontology cluster projections", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "clusters-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "wiki/observations"), { recursive: true });
    mkdirSync(join(root, "wiki/ontology"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("groups accepted observations by canonical concept id across dialogues", () => {
    writeLedger("meno.md", ["obs_meno_0001", "obs_meno_0002"]);
    writeLedger("crito.md", ["obs_crito_0001", "obs_crito_0002"]);
    writeOntology([
      { conceptKey: "assent_chain", observationIds: ["obs_meno_0001", "obs_meno_0002", "obs_crito_0001"] },
      { conceptKey: "craft_example", observationIds: ["obs_crito_0002"] },
    ]);

    const clusters = buildClusters();
    const assent = clusters.find((cluster) => cluster.conceptKey === "assent_chain")!;
    expect(clusters).toHaveLength(2);
    expect(assent.axisKey).toBe("argument_move");
    expect(assent.dialogues).toEqual(["crito", "meno"]);
    expect(assent.observations.map((observation) => observation.observationId)).toEqual([
      "obs_crito_0001",
      "obs_meno_0001",
      "obs_meno_0002",
    ]);
  });

  it("refuses to write before the concept convergence gate passes", () => {
    writeLedger("meno.md", ["obs_meno_0001"]);
    writeOntology([{ conceptKey: "assent_chain", observationIds: ["obs_meno_0001"] }]);
    expect(() => writeClusterArtifacts()).toThrow("Cluster convergence gate is not met.");
  });

  it("writes deterministic strict JSONL projections after convergence", () => {
    const meno = Array.from({ length: 10 }, (_, index) => `obs_meno_${String(index + 1).padStart(4, "0")}`);
    const crito = Array.from({ length: 10 }, (_, index) => `obs_crito_${String(index + 1).padStart(4, "0")}`);
    writeLedger("meno.md", meno);
    writeLedger("crito.md", crito);
    writeOntology(
      meno.map((observationId, index) => ({
        conceptKey: `shared_move_${String(index + 1).padStart(2, "0")}`,
        observationIds: [observationId, crito[index]!],
      })),
    );

    const written = writeClusterArtifacts();
    const path = join(root, written[0]!.path);
    const first = readFileSync(path, "utf8");
    writeClusterArtifacts();
    const second = readFileSync(path, "utf8");

    expect(written).toHaveLength(1);
    expect(written[0]).toMatchObject({ axisKey: "argument_move", path: "wiki/clusters/argument_move.jsonl", clusterCount: 10 });
    expect(first).toBe(second);
    expect(first).toContain('"concept_key":"shared_move_01"');
    expect(first).toContain('"observation_ids":["obs_crito_0001","obs_meno_0001"]');
    expect(validateClusterArtifacts()).toEqual([]);
  });

  it("detects any byte that is not the canonical ontology projection", () => {
    const meno = Array.from({ length: 10 }, (_, index) => `obs_meno_${String(index + 1).padStart(4, "0")}`);
    const crito = Array.from({ length: 10 }, (_, index) => `obs_crito_${String(index + 1).padStart(4, "0")}`);
    writeLedger("meno.md", meno);
    writeLedger("crito.md", crito);
    writeOntology(
      meno.map((observationId, index) => ({
        conceptKey: `shared_move_${String(index + 1).padStart(2, "0")}`,
        observationIds: [observationId, crito[index]!],
      })),
    );
    writeClusterArtifacts();
    const path = join(root, "wiki/clusters/argument_move.jsonl");
    writeFileSync(path, readFileSync(path, "utf8").replace("obs_crito_0001", "obs_crito_9999"), "utf8");
    expect(validateClusterArtifacts()).toEqual([
      "wiki/clusters/argument_move.jsonl: cluster artifact does not equal its canonical ontology projection",
    ]);
  });
});

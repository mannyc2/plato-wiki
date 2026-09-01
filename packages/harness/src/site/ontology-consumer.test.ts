import { describe, expect, it } from "bun:test";
import { parseClusterFile, parseDossierFile } from "./data.js";

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => [key, canonicalValue(entry)]),
  );
}

function jsonl(value: unknown) {
  return `${JSON.stringify(canonicalValue(value))}\n`;
}

function json(value: unknown) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

const cluster = {
  schema_version: 1,
  projection_kind: "observation_cluster",
  axis_id: "axis_sha256_a",
  axis_key: "argument_form",
  dimension: "textual_function",
  concept_id: "concept_sha256_b",
  concept_key: "definition_proposed",
  comparison_question: "Where does the text propose a definition?",
  observation_ids: ["obs_meno_0001"],
  dialogues: ["meno"],
  spans: { obs_meno_0001: "70a" },
};

const dossier = {
  schema_version: 1,
  projection_kind: "concept_dossier",
  projection_id: "dossier:concept_sha256_b",
  axis_id: "axis_sha256_a",
  axis_key: "argument_form",
  dimension: "textual_function",
  concept_id: "concept_sha256_b",
  concept_key: "definition_proposed",
  comparison_question: "Where does the text propose a definition?",
  accepted_observations: 1,
  dialogues: 1,
  instance_ids: ["obs_meno_0001"],
  instances: [{
    observationId: "obs_meno_0001",
    dialogue: "meno",
    stephanusSpan: "70a",
    speakers: ["ΣΩ."],
    turnCount: 1,
  }],
  presence: [{ dialogue: "meno", acceptedObservations: 1 }],
  cooccurrence: [{
    axisId: "axis_sha256_c",
    axisKey: "subject_matter",
    conceptId: "concept_sha256_d",
    conceptKey: "virtue",
    overlappingObservations: 1,
  }],
};

describe("ontology vNext site projection readers", () => {
  it("reads canonical cluster JSONL without legacy observation identity", () => {
    const [parsed] = parseClusterFile("wiki/clusters/argument_form.jsonl", jsonl(cluster));
    expect(parsed?.axisKey).toBe("argument_form");
    expect(parsed?.conceptKey).toBe("definition_proposed");
    expect(parsed?.observations).toEqual([
      { observationId: "obs_meno_0001", dialogue: "meno", stephanusSpan: "70a" },
    ]);
  });

  it("fails closed on non-canonical or legacy cluster fields", () => {
    expect(() => parseClusterFile("wiki/clusters/x.jsonl", `${JSON.stringify(cluster)}\n`)).toThrow(/non-canonical/u);
    expect(() => parseClusterFile(
      "wiki/clusters/x.jsonl",
      jsonl({ ...cluster, feature_family: "argument_form" }),
    )).toThrow(/expected fields/u);
  });

  it("reads canonical dossier JSON and binds the projection identity", () => {
    const parsed = parseDossierFile("/tmp/argument_form/definition_proposed.json", json(dossier));
    expect(parsed.dossierId).toBe("dossier:concept_sha256_b");
    expect(parsed.axisKey).toBe("argument_form");
    expect(parsed.instances[0]?.observationId).toBe("obs_meno_0001");
    expect(parsed.cooccurrence[0]?.conceptKey).toBe("virtue");
  });

  it("rejects mismatched dossier identities and unexpected aliases", () => {
    expect(() => parseDossierFile(
      "/tmp/dossier.json",
      json({ ...dossier, projection_id: "dossier:wrong" }),
    )).toThrow(/does not match concept_id/u);
    expect(() => parseDossierFile(
      "/tmp/dossier.json",
      json({ ...dossier, family: "argument_form" }),
    )).toThrow(/expected fields/u);
  });
});

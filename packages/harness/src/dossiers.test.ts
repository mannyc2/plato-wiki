import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildDossiers, validateDossierArtifacts, writeDossierArtifacts } from "./dossiers.js";
import { writeObservationTurnJoin } from "./derived/joins.js";
import { setRepoRootForTesting } from "./paths.js";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  renderOntologyVNextDocuments,
} from "./wiki/ontology-vnext.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

const HASH = "b".repeat(64);

function record({
  id,
  dialogue,
  startChar,
  endChar,
  reviewStatus = "accepted",
}: {
  id: string;
  dialogue: string;
  startChar: number;
  endChar: number;
  reviewStatus?: string;
}) {
  return `\`\`\`yaml
observation_id: ${id}
stephanus_span: 1a
source_ref:
  source_path: raw/plato/greek/${dialogue}.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: ${startChar}
  end_char: ${endChar}
  text_sha256: ${HASH}
review_status: ${reviewStatus}
\`\`\``;
}

function writeGreek(dialogues: string[]) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  for (const dialogue of dialogues) {
    writeFileSync(join(root, "raw/plato/greek", `${dialogue}.txt`), "{1a} fixture", "utf8");
  }
}

function writeLedger(dialogue: string, records: string[]) {
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(join(root, "wiki/observations", `${dialogue}.md`), records.join("\n\n"), "utf8");
}

function writeTurnIndex(dialogue: string, speaker: string) {
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/turns", `${dialogue}.toon`),
    [
      `dialogue: ${dialogue}`,
      `source_path: raw/plato/greek/${dialogue}.txt`,
      `source_sha256: ${HASH}`,
      "sigla_path: derived/plato/turns/sigla.toml",
      `sigla_sha256: ${HASH}`,
      "turns[1]:",
      "  turn_id        | speaker | start_marker | end_marker | start_char | end_char | text_sha256                                                      | greek_char_count",
      `  ${`turn_${dialogue}_0001`.padEnd(14)} | ${speaker.padEnd(7)} | 1a           | 1a         | 0          | 100      | ${HASH} | 0`,
      "",
    ].join("\n"),
    "utf8",
  );
}

function writeOntology() {
  mkdirSync(join(root, "wiki/ontology"), { recursive: true });
  const axisId = deriveOntologyVNextAxisId("textual_function", "argument_move");
  const sharedId = deriveOntologyVNextConceptId(axisId, "shared_move");
  const singletonId = deriveOntologyVNextConceptId(axisId, "singleton_move");
  const overlapId = deriveOntologyVNextConceptId(axisId, "overlap_marker");
  const concepts = [
    [sharedId, "shared_move"],
    [singletonId, "singleton_move"],
    [overlapId, "overlap_marker"],
  ].map(([conceptId, conceptKey]) => ({
    schema_version: 1 as const,
    concept_id: conceptId!,
    axis_id: axisId,
    concept_key: conceptKey!,
    definition: `The cited span performs the ${conceptKey} textual function.`,
    comparison_question: "What argumentative move does the cited span perform?",
  }));
  const assignments: Array<[string, string]> = [
    ["obs_meno_0001", sharedId],
    ["obs_crito_0001", sharedId],
    ["obs_meno_0002", singletonId],
    ["obs_meno_0003", overlapId],
  ];
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
    memberships: assignments.map(([observationId, conceptId]) => ({
      schema_version: 1,
      membership_id: deriveOntologyVNextMembershipId(observationId, conceptId),
      observation_id: observationId,
      concept_id: conceptId,
      assignment_basis: "The cited Greek span instantiates this comparison category.",
    })),
  });
  writeFileSync(join(root, "wiki/ontology/axes.jsonl"), documents.axes);
  writeFileSync(join(root, "wiki/ontology/concepts.jsonl"), documents.concepts);
  writeFileSync(join(root, "wiki/ontology/memberships.jsonl"), documents.memberships);
}

function writeFixtureCorpus() {
  writeGreek(["crito", "laws", "meno"]);
  writeLedger("meno", [
    record({ id: "obs_meno_0001", dialogue: "meno", startChar: 0, endChar: 10 }),
    record({ id: "obs_meno_0002", dialogue: "meno", startChar: 20, endChar: 30 }),
    record({ id: "obs_meno_0003", dialogue: "meno", startChar: 5, endChar: 15 }),
    record({
      id: "obs_meno_0004",
      dialogue: "meno",
      startChar: 40,
      endChar: 50,
      reviewStatus: "rejected",
    }),
  ]);
  writeLedger("crito", [record({ id: "obs_crito_0001", dialogue: "crito", startChar: 0, endChar: 10 })]);
  writeOntology();
  writeTurnIndex("meno", "A.");
  writeTurnIndex("crito", "B.");
  writeObservationTurnJoin("meno");
  writeObservationTurnJoin("crito");
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "dossiers-test-"));
  restoreRepoRoot = setRepoRootForTesting(root);
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("concept dossier projections", () => {
  it("builds recurring-concept dossiers without treating rejected reviews as counterevidence", () => {
    writeFixtureCorpus();

    const dossiers = buildDossiers();
    expect(dossiers).toHaveLength(1);
    const dossier = dossiers[0]!;
    expect(dossier.axisKey).toBe("argument_move");
    expect(dossier.conceptKey).toBe("shared_move");
    expect(dossier.instances.map((entry) => entry.observationId)).toEqual(["obs_crito_0001", "obs_meno_0001"]);
    expect(dossier.presence.find((entry) => entry.dialogue === "laws")?.acceptedObservations).toBe(0);
    expect(dossier.cooccurrence).toMatchObject([
      { axisKey: "argument_move", conceptKey: "overlap_marker", overlappingObservations: 1 },
    ]);
    expect("counterevidence" in dossier).toBe(false);
  });

  it("writes byte-stable strict JSON and validates exact projection equality", () => {
    writeFixtureCorpus();
    writeDossierArtifacts();
    const path = join(root, "wiki/dossiers/argument_move/shared_move.json");
    const first = readFileSync(path, "utf8");
    writeDossierArtifacts();
    const second = readFileSync(path, "utf8");

    expect(first).toBe(second);
    expect(first).not.toMatch(/counter_(?:records|ids)|Counterevidence/u);
    expect(() => JSON.parse(first)).not.toThrow();
    expect(validateDossierArtifacts()).toEqual([]);
  });

  it("detects stale files and any byte that is not the canonical projection", () => {
    writeFixtureCorpus();
    writeDossierArtifacts();
    writeFileSync(join(root, "wiki/dossiers/stale.json"), "{}", "utf8");
    expect(validateDossierArtifacts()).toContain("wiki/dossiers/stale.json: stale dossier artifact");

    rmSync(join(root, "wiki/dossiers/stale.json"));
    const path = join(root, "wiki/dossiers/argument_move/shared_move.json");
    writeFileSync(path, readFileSync(path, "utf8").replace("obs_crito_0001", "obs_crito_9999"), "utf8");
    expect(validateDossierArtifacts()).toEqual([
      "wiki/dossiers/argument_move/shared_move.json: dossier artifact does not equal its canonical ontology projection",
    ]);
  });
});

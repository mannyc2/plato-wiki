import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildDossiers, validateDossierArtifacts, writeDossierArtifacts } from "./dossiers.js";
import { writeObservationTurnJoin } from "./derived/joins.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

const HASH = "b".repeat(64);

function record({
  id,
  dialogue,
  family,
  label,
  startChar,
  endChar,
  reviewStatus = "accepted",
}: {
  id: string;
  dialogue: string;
  family: string;
  label: string;
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
feature_family: ${family}
feature_label: ${label}
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

function writeFixtureCorpus() {
  writeGreek(["crito", "laws", "meno"]);
  writeLedger("meno", [
    record({
      id: "obs_meno_0001",
      dialogue: "meno",
      family: "elenchus",
      label: "shared_move",
      startChar: 0,
      endChar: 10,
    }),
    record({
      id: "obs_meno_0002",
      dialogue: "meno",
      family: "craft_analogy",
      label: "singleton_move",
      startChar: 20,
      endChar: 30,
    }),
    record({
      id: "obs_meno_0003",
      dialogue: "meno",
      family: "irony_marker",
      label: "overlap_marker",
      startChar: 5,
      endChar: 15,
    }),
    record({
      id: "obs_meno_0004",
      dialogue: "meno",
      family: "elenchus",
      label: "shared_move",
      startChar: 40,
      endChar: 50,
      reviewStatus: "rejected",
    }),
  ]);
  writeLedger("crito", [
    record({
      id: "obs_crito_0001",
      dialogue: "crito",
      family: "elenchus",
      label: "shared_move",
      startChar: 0,
      endChar: 10,
    }),
  ]);
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

describe("pattern dossiers", () => {
  it("builds recurring-label dossiers with zero cells, co-occurrence, and counterevidence", () => {
    writeFixtureCorpus();

    const dossiers = buildDossiers();

    expect(dossiers).toHaveLength(1);
    const dossier = dossiers[0]!;
    expect(dossier.family).toBe("elenchus");
    expect(dossier.label).toBe("shared_move");
    expect(dossier.instances.map((entry) => entry.observationId)).toEqual(["obs_crito_0001", "obs_meno_0001"]);
    expect(dossier.presence.find((entry) => entry.dialogue === "laws")?.acceptedObservations).toBe(0);
    expect(dossier.cooccurrence).toEqual([
      { family: "irony_marker", label: "overlap_marker", overlappingObservations: 1 },
    ]);
    expect(dossier.counterevidence).toEqual([
      {
        observationId: "obs_meno_0004",
        dialogue: "meno",
        stephanusSpan: "1a",
        reviewStatus: "rejected",
      },
    ]);
  });

  it("writes byte-stable dossiers and validates generated artifacts", () => {
    writeFixtureCorpus();

    writeDossierArtifacts();
    const first = readFileSync(join(root, "wiki/dossiers/elenchus/shared_move.md"), "utf8");
    writeDossierArtifacts();
    const second = readFileSync(join(root, "wiki/dossiers/elenchus/shared_move.md"), "utf8");

    expect(first).toBe(second);
    expect(validateDossierArtifacts()).toEqual([]);
  });

  it("reports stale files and invalid instance ids", () => {
    writeFixtureCorpus();
    writeDossierArtifacts();
    writeFileSync(join(root, "wiki/dossiers/stale.md"), "stale", "utf8");

    expect(validateDossierArtifacts()).toContain("wiki/dossiers/stale.md: stale dossier artifact");

    rmSync(join(root, "wiki/dossiers/stale.md"));
    const path = join(root, "wiki/dossiers/elenchus/shared_move.md");
    writeFileSync(
      path,
      readFileSync(path, "utf8").replace("instance_ids: [obs_crito_0001, obs_meno_0001]", "instance_ids: [obs_meno_0004]"),
      "utf8",
    );

    expect(validateDossierArtifacts().join("\n")).toContain("instance references missing or non-accepted observation obs_meno_0004");
  });
});

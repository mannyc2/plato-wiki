import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import type { ToonRow } from "./data.js";
import {
  DIALOGUE_EPIGRAPHS,
  DIALOGUE_SPECIMEN_IDS,
  DIALOGUE_TAGS,
  dialogueEpigraph,
  dialogueSpecimenId,
  dialogueTags,
  ENGLISH_SPEAKER_LABELS,
  englishSpeakerLabels,
  FAMILY_GUIDE,
  familyGuide,
  fingerprintOpacity,
  GREEK_SPEAKER_NAMES,
  greekSpeakerName,
  greekSpeakerNames,
  LAYER_GUIDE,
  STANDING_SPECIMEN_IDS,
  structureStripSvg,
  TAG_ROW_BUDGET,
  topPatternDossiers,
} from "./curation.js";
import { parseToonTable, type SiteDossier } from "./data.js";

function turn(turnId: string, speaker: string, tokens: number): ToonRow {
  return {
    turn_id: turnId,
    speaker,
    token_count: String(tokens),
    greek_char_count: "0",
    start_marker: "a",
    end_marker: "a",
  };
}

function speakerRow(speaker: string, tokens: number): ToonRow {
  return { speaker, total_tokens: String(tokens) };
}

const emptyInput = {
  turnPageById: new Map<string, string>(),
  observationCountByTurnId: new Map<string, number>(),
  pagePath: "dialogues/x/index.html",
};

describe("curation", () => {
  it("provides an epigraph for every dialogue and throws for unknown slugs", () => {
    expect(Object.keys(DIALOGUE_EPIGRAPHS)).toHaveLength(27);
    expect(dialogueEpigraph("meno")).toContain("Can virtue be taught?");
    expect(() => dialogueEpigraph("not-a-dialogue")).toThrow(/No curated epigraph/u);
  });

  it("curates English speaker labels for every commentary dialogue in the repo", () => {
    const commentaryDir = join(getRepoRoot(), "wiki/commentary");
    const dialogues = existsSync(commentaryDir)
      ? readdirSync(commentaryDir)
          .filter((name) => name.endsWith(".md"))
          .map((name) => basename(name, ".md"))
      : [];
    for (const dialogue of dialogues) {
      // Fail-closed accessor: a reading dialogue without an entry must throw.
      expect(() => englishSpeakerLabels(dialogue)).not.toThrow();
    }
    expect(() => englishSpeakerLabels("not-a-dialogue")).toThrow(/No curated English speaker labels/u);

    // Every curated abbreviation must actually open a line in the pinned
    // translation, and every display name must be non-empty — the map is a
    // claim about the printed source, not free copy.
    for (const [dialogue, labels] of Object.entries(ENGLISH_SPEAKER_LABELS)) {
      const englishPath = join(getRepoRoot(), `raw/plato/english/${dialogue}.txt`);
      if (!existsSync(englishPath)) continue;
      const lines = readFileSync(englishPath, "utf8").split("\n");
      for (const [form, display] of Object.entries(labels)) {
        expect(display.length).toBeGreaterThan(0);
        const opensALine = lines.some((line) => {
          const bodyStart = /^(?:\s|\{[^}]*\})*/u.exec(line)?.[0]?.length ?? 0;
          const after = line.charAt(bodyStart + form.length);
          return line.startsWith(form, bodyStart) && (after === "" || /\s/u.test(after));
        });
        expect(`${dialogue}:${form}:${opensALine}`).toBe(`${dialogue}:${form}:true`);
      }
    }
  });

  it("colors speakers deterministically with Socrates in slot 0", () => {
    const input = {
      dialogue: "sample",
      turns: [turn("turn_sample_0001", "ΣΩ.", 10), turn("turn_sample_0002", "ΑΛΛ.", 100)],
      speakers: [speakerRow("ΣΩ.", 10), speakerRow("ΑΛΛ.", 100)],
      ...emptyInput,
    };
    const svg = structureStripSvg(input);
    // Socrates is pulled to slot 0 even though he is not the token leader.
    expect(svg).toContain('fill="#2e63a4"><title>ΣΩ.');
    expect(svg).toContain('fill="#96530e"><title>ΑΛΛ.');
    // Pure function: byte-identical on repeat.
    expect(structureStripSvg(input)).toBe(svg);
  });

  it("merges consecutive same-speaker runs beyond the merge threshold", () => {
    const turns: ToonRow[] = [];
    for (let index = 0; index < 700; index += 1) {
      const speaker = index < 350 ? "A." : "B.";
      turns.push(turn(`turn_run_${String(index + 1).padStart(4, "0")}`, speaker, 5));
    }
    const svg = structureStripSvg({
      dialogue: "run",
      turns,
      speakers: [speakerRow("A.", 1750), speakerRow("B.", 1750)],
      ...emptyInput,
    });
    const bandRects = (svg.match(/height="36"/gu) ?? []).length;
    expect(bandRects).toBeGreaterThan(0);
    expect(bandRects).toBeLessThanOrEqual(600);
    // Two long runs collapse to two segments.
    expect(bandRects).toBe(2);
  });

  it("renders the unattributed fallback band", () => {
    const svg = structureStripSvg({
      dialogue: "apology",
      turns: [turn("turn_apology_0001", "(unattributed)", 100)],
      speakers: [speakerRow("(unattributed)", 100)],
      ...emptyInput,
    });
    expect(svg).toContain('fill="#8a8375"');
    expect(svg).toContain("single unattributed turn");
  });

  it("draws density ticks only for turns with joined observations", () => {
    const svg = structureStripSvg({
      dialogue: "sample",
      turns: [turn("turn_sample_0001", "ΣΩ.", 10), turn("turn_sample_0002", "ΑΛΛ.", 10)],
      speakers: [speakerRow("ΣΩ.", 10), speakerRow("ΑΛΛ.", 10)],
      turnPageById: new Map<string, string>(),
      observationCountByTurnId: new Map([["turn_sample_0001", 2]]),
      pagePath: "dialogues/sample/index.html",
    });
    expect((svg.match(/y="40"/gu) ?? []).length).toBe(1);
    expect(svg).toContain("2 accepted observations");
  });

  it("scales fingerprint opacity on a shared square-root curve", () => {
    expect(fingerprintOpacity(0)).toBe(0);
    expect(fingerprintOpacity(1)).toBe(0.32);
    expect(fingerprintOpacity(9)).toBe(0.6);
    expect(fingerprintOpacity(38)).toBe(1);
  });

  it("orders top pattern dossiers by dialogues, then accepted, then key", () => {
    const make = (family: string, label: string, dialogues: number, accepted: number): SiteDossier => ({
      dossierId: `dossier_${family}_${label}`,
      family,
      label,
      path: `wiki/dossiers/${family}/${label}.md`,
      pagePath: `dossiers/${family}/${label}.html`,
      acceptedObservations: accepted,
      dialogues,
      counterRecords: 0,
      instanceIds: [],
      counterIds: [],
      instances: [],
      presence: [],
      cooccurrence: [],
    });
    const dossiers = [
      make("b", "low", 5, 5),
      make("a", "high", 5, 20),
      make("a", "most", 9, 1),
    ];
    const ordered = topPatternDossiers(dossiers, 12).map((dossier) => `${dossier.family}/${dossier.label}`);
    expect(ordered).toEqual(["a/most", "a/high", "b/low"]);
  });
});

describe("curated dialogue tags", () => {
  function tagDossier(family: string, label: string, presence: Array<[string, number]>): SiteDossier {
    return {
      dossierId: `dossier_${family}_${label}`,
      family,
      label,
      path: `wiki/dossiers/${family}/${label}.md`,
      pagePath: `dossiers/${family}/${label}.html`,
      acceptedObservations: presence.reduce((sum, [, count]) => sum + count, 0),
      dialogues: presence.length,
      counterRecords: 0,
      instanceIds: [],
      counterIds: [],
      instances: [],
      presence: presence.map(([dialogue, acceptedObservations]) => ({ dialogue, acceptedObservations })),
      cooccurrence: [],
    };
  }

  it("covers exactly the epigraph dialogues", () => {
    expect(Object.keys(DIALOGUE_TAGS).sort()).toEqual(Object.keys(DIALOGUE_EPIGRAPHS).sort());
    for (const keys of Object.values(DIALOGUE_TAGS)) {
      expect(keys.length).toBeGreaterThanOrEqual(2);
      expect(keys.length).toBeLessThanOrEqual(3);
    }
  });

  it("keeps every curated row inside the one-line budget by title-cased length", () => {
    for (const [dialogue, keys] of Object.entries(DIALOGUE_TAGS)) {
      const budget = keys
        .map((key) => key.split("/")[1] ?? "")
        .map((label) => label.split(/[_-]+/u).join(" ").length)
        .reduce((sum, length) => sum + length, 0);
      expect(`${dialogue}:${budget <= TAG_ROW_BUDGET}`).toBe(`${dialogue}:true`);
    }
  });

  it("throws for an uncurated dialogue", () => {
    expect(() => dialogueTags("zzz", [])).toThrow(/No curated tags/u);
  });

  it("skips keys with no dossier but validates support of resolved ones", () => {
    const tags = dialogueTags("meno", [
      tagDossier("irony_marker", "knowledge_disavowal", [
        ["meno", 2],
        ["apology", 3],
      ]),
    ]);
    expect(tags).toEqual([
      {
        family: "irony_marker",
        label: "knowledge_disavowal",
        display: "Knowledge Disavowal",
        count: 2,
        corpus: 5,
      },
    ]);
    expect(() =>
      dialogueTags("meno", [tagDossier("irony_marker", "knowledge_disavowal", [["meno", 1]])]),
    ).toThrow(/needs 2/u);
  });

  it("enforces the one-line budget on resolved tags", () => {
    const longLabel = "a_label_with_an_exorbitantly_long_name_that_cannot_possibly_fit_one_line_of_chips";
    DIALOGUE_TAGS.zzz_budget_fixture = [`elenchus/${longLabel}`];
    try {
      expect(() =>
        dialogueTags("zzz_budget_fixture", [tagDossier("elenchus", longLabel, [["zzz_budget_fixture", 2]])]),
      ).toThrow(/budget/u);
    } finally {
      delete DIALOGUE_TAGS.zzz_budget_fixture;
    }
  });

  it("ships specimen ids and full layer descriptions", () => {
    expect(STANDING_SPECIMEN_IDS.length).toBeGreaterThan(0);
    expect(LAYER_GUIDE.length).toBe(7);
    for (const layer of LAYER_GUIDE) {
      expect(layer.description.length).toBeGreaterThan(40);
      expect(layer.path.endsWith(".html")).toBe(true);
    }
  });
});

// --- the dialogue-pages v3.3 rollout curated invariants against live ledgers ---------------------

// Lightweight per-block parse (id / family / status only) — the full loader
// resolves a Greek excerpt per record, which is far too slow for a unit test.
type AcceptedObs = { observationId: string; featureFamily: string; dialogue: string };
function acceptedObservationsByDialogue() {
  const dir = join(getRepoRoot(), "wiki/observations");
  const byDialogue = new Map<string, AcceptedObs[]>();
  if (!existsSync(dir)) return byDialogue;
  for (const name of readdirSync(dir).filter((entry) => entry.endsWith(".md"))) {
    const dialogue = basename(name, ".md");
    const blocks = readFileSync(join(dir, name), "utf8").split(/```yaml\n/u).slice(1);
    const observations: AcceptedObs[] = [];
    for (const raw of blocks) {
      const body = raw.split(/\n```/u)[0] ?? "";
      const observationId = /^observation_id:\s*(\S+)/mu.exec(body)?.[1];
      if (!observationId || !/^review_status:\s*accepted\s*$/mu.test(body)) continue;
      observations.push({
        observationId,
        featureFamily: /^feature_family:\s*(\S+)/mu.exec(body)?.[1] ?? "",
        dialogue,
      });
    }
    byDialogue.set(dialogue, observations);
  }
  return byDialogue;
}

describe("curated Greek speaker names (the dialogue-pages v3.3 rollout)", () => {
  it("covers all 27 dialogues and fails closed on an unknown slug", () => {
    expect(Object.keys(GREEK_SPEAKER_NAMES)).toHaveLength(27);
    expect(Object.keys(GREEK_SPEAKER_NAMES).sort()).toEqual(Object.keys(DIALOGUE_EPIGRAPHS).sort());
    expect(() => greekSpeakerNames("not-a-dialogue")).toThrow(/No curated Greek speaker names/u);
    expect(greekSpeakerName("meno", "(unattributed)")).toBe("");
  });

  it("names every derived turn siglum, exempting only the unattributed frame", () => {
    for (const [dialogue, names] of Object.entries(GREEK_SPEAKER_NAMES)) {
      const path = join(getRepoRoot(), `derived/plato/metrics/turn-lengths/${dialogue}.toon`);
      if (!existsSync(path)) continue;
      const speakers = parseToonTable(readFileSync(path, "utf8"), "speakers", path)
        .map((row) => (row.speaker === "(none)" ? "(unattributed)" : (row.speaker ?? "")))
        .filter((speaker) => speaker && speaker !== "(unattributed)");
      for (const siglum of speakers) {
        // Fail-loud accessor: every real siglum must resolve to a non-empty name.
        expect(`${dialogue}:${siglum}:${greekSpeakerName(dialogue, siglum).length > 0}`).toBe(
          `${dialogue}:${siglum}:true`,
        );
      }
      // No curated name may be blank.
      for (const value of Object.values(names)) expect(value.length).toBeGreaterThan(0);
    }
  });
});

describe("curated family guide (the dialogue-pages v3.3 rollout)", () => {
  it("describes every family that can render unfolded on a dialogue overview", () => {
    const byDialogue = acceptedObservationsByDialogue();
    const unfoldedUnion = new Set<string>();
    for (const observations of byDialogue.values()) {
      const counts = new Map<string, number>();
      for (const observation of observations) {
        counts.set(observation.featureFamily, (counts.get(observation.featureFamily) ?? 0) + 1);
      }
      const top8 = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
        .slice(0, 8);
      for (const [family] of top8) unfoldedUnion.add(family);
    }
    // The census is small and bounded; every member has an operator line.
    for (const family of unfoldedUnion) expect(() => familyGuide(family)).not.toThrow();
    expect(() => familyGuide("definitely_not_a_family")).toThrow(/No curated FAMILY_GUIDE/u);
    // Every shipped line is real descriptive copy, not a placeholder.
    for (const line of Object.values(FAMILY_GUIDE)) expect(line.length).toBeGreaterThan(40);
  });
});

describe("curated dialogue specimens (the dialogue-pages v3.3 rollout)", () => {
  it("pins one accepted observation of each dialogue", () => {
    expect(Object.keys(DIALOGUE_SPECIMEN_IDS)).toHaveLength(27);
    expect(Object.keys(DIALOGUE_SPECIMEN_IDS).sort()).toEqual(Object.keys(DIALOGUE_EPIGRAPHS).sort());
    expect(() => dialogueSpecimenId("not-a-dialogue")).toThrow(/No curated specimen/u);

    const byDialogue = acceptedObservationsByDialogue();
    for (const [dialogue, specimenId] of Object.entries(DIALOGUE_SPECIMEN_IDS)) {
      const accepted = byDialogue.get(dialogue) ?? [];
      const match = accepted.find((observation) => observation.observationId === specimenId);
      // exists, accepted, and of this dialogue.
      expect(`${dialogue}:${specimenId}:${Boolean(match)}`).toBe(`${dialogue}:${specimenId}:true`);
      expect(match?.dialogue).toBe(dialogue);
    }
  });
});

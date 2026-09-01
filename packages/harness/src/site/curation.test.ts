import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import type { ToonRow } from "./data.js";
import {
  DIALOGUE_EPIGRAPHS,
  dialogueEpigraph,
  dialogueTags,
  ENGLISH_SPEAKER_LABELS,
  englishSpeakerLabels,
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
    const make = (axisKey: string, conceptKey: string, dialogues: number, accepted: number): SiteDossier => ({
      dossierId: `dossier:concept_${axisKey}_${conceptKey}`,
      axisId: `axis_${axisKey}`,
      axisKey,
      dimension: "textual_function",
      conceptId: `concept_${axisKey}_${conceptKey}`,
      conceptKey,
      comparisonQuestion: "Where does this occur?",
      path: `wiki/dossiers/${axisKey}/${conceptKey}.json`,
      pagePath: `dossiers/${axisKey}/${conceptKey}.html`,
      acceptedObservations: accepted,
      dialogues,
      instanceIds: [],
      instances: [],
      presence: [],
      cooccurrence: [],
    });
    const dossiers = [
      make("b", "low", 5, 5),
      make("a", "high", 5, 20),
      make("a", "most", 9, 1),
    ];
    const ordered = topPatternDossiers(dossiers, 12).map((dossier) => `${dossier.axisKey}/${dossier.conceptKey}`);
    expect(ordered).toEqual(["a/most", "a/high", "b/low"]);
  });
});

describe("curated dialogue tags", () => {
  function tagDossier(axisKey: string, conceptKey: string, presence: Array<[string, number]>): SiteDossier {
    return {
      dossierId: `dossier:concept_${axisKey}_${conceptKey}`,
      axisId: `axis_${axisKey}`,
      axisKey,
      dimension: "textual_function",
      conceptId: `concept_${axisKey}_${conceptKey}`,
      conceptKey,
      comparisonQuestion: "Where does this occur?",
      path: `wiki/dossiers/${axisKey}/${conceptKey}.json`,
      pagePath: `dossiers/${axisKey}/${conceptKey}.html`,
      acceptedObservations: presence.reduce((sum, [, count]) => sum + count, 0),
      dialogues: presence.length,
      instanceIds: [],
      instances: [],
      presence: presence.map(([dialogue, acceptedObservations]) => ({ dialogue, acceptedObservations })),
      cooccurrence: [],
    };
  }

  it("throws for an uncurated dialogue", () => {
    expect(() => dialogueTags("zzz", [])).toThrow(/No curated epigraph/u);
  });

  it("selects supported tags from canonical dossier counts and ignores unsupported concepts", () => {
    const tags = dialogueTags("meno", [
      tagDossier("irony_marker", "knowledge_disavowal", [
        ["meno", 2],
        ["apology", 3],
      ]),
      tagDossier("elenchus", "unsupported", [["meno", 1]]),
    ]);
    expect(tags).toEqual([
      {
        axisId: "axis_irony_marker",
        axisKey: "irony_marker",
        conceptId: "concept_irony_marker_knowledge_disavowal",
        conceptKey: "knowledge_disavowal",
        display: "Knowledge Disavowal",
        count: 2,
        corpus: 5,
      },
    ]);
    expect(dialogueTags("meno", [tagDossier("irony_marker", "knowledge_disavowal", [["meno", 1]])]))
      .toEqual([]);
  });

  it("selects at most three deterministic tags inside the one-line budget", () => {
    const longLabel = "a_label_with_an_exorbitantly_long_name_that_cannot_possibly_fit_one_line_of_chips";
    const dossiers = [
      tagDossier("elenchus", longLabel, [["meno", 9]]),
      tagDossier("axis_b", "short_b", [["meno", 4]]),
      tagDossier("axis_a", "short_a", [["meno", 4]]),
      tagDossier("axis_c", "short_c", [["meno", 3]]),
      tagDossier("axis_d", "short_d", [["meno", 2]]),
    ];
    const tags = dialogueTags("meno", dossiers);
    expect(tags.map((tag) => tag.conceptKey)).toEqual(["short_a", "short_b", "short_c"]);
    expect(tags.reduce((sum, tag) => sum + tag.display.length, 0)).toBeLessThanOrEqual(TAG_ROW_BUDGET);
    expect(dialogueTags("meno", [...dossiers].reverse())).toEqual(tags);
  });

  it("ships standing relation specimens and full layer descriptions", () => {
    expect(STANDING_SPECIMEN_IDS.length).toBeGreaterThan(0);
    expect(LAYER_GUIDE.length).toBe(7);
    for (const layer of LAYER_GUIDE) {
      expect(layer.description.length).toBeGreaterThan(40);
      expect(layer.path.endsWith(".html")).toBe(true);
    }
  });
});

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

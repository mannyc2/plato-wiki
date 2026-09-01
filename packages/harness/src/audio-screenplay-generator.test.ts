import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildScreenplayGenerationReport,
  writeDraftScreenplay,
  writeProductionScreenplay,
} from "./audio-screenplay-generator.js";
import { validateAudioScriptArtifact } from "./audio-production.js";
import { CAST_ACCEPTANCE_GATES } from "./audio-catalog.js";
import { writeEnglishStephanusIndex } from "./derived/stephanus.js";
import { setRepoRootForTesting } from "./paths.js";
import { projectStephanusSpansToMarkers, resolveSourceSpan } from "./source.js";
import { writeAcceptedCommentaryQualityAuditFixture } from "../test-support/audio-production-fixture.js";
import { driftedCommentaryProtocolFixture } from "../test-support/commentary-protocol-fixture.js";

const DIALOGUE = "fixture";
const HASH = "a".repeat(64);
const ENGLISH = "{1a} Speaker. Hello Socrates.\n{1b} Speaker. Goodbye Socrates.\n";

type TestAudioInsertion = {
  attribution_path: string;
  attribution_sha256: string;
  english_sha256: string;
  turn_id: string;
  edge: "before" | "after";
  char_offset?: number;
};

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function writeJson(path: string, value: unknown) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function voice(characterId: string, displayName: string) {
  return {
    characterId,
    displayName,
    status: "selected",
    engine: "dots.tts-soar",
    model: {
      repository: "rednote-hilab/dots.tts-soar",
      revision: "e3520f75254d0020a0406db31c51a79d00d22d55",
    },
    mode: "continuation-voice-cloning",
    seed: 1,
    reference: {
      sourceUrl: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
      sourceRegistryPath: "audio/reference-sources.json",
      sourceRegistrySha256: HASH,
      sourceDialogue: DIALOGUE,
      sourceVideoId: "AAAAAAAAAAA",
      sourceCharacterId: characterId,
      videoStartSeconds: 1,
      videoEndSeconds: 7,
      localDurationSeconds: 6,
      localSha256: HASH,
      promptText: "Reference prompt.",
      referenceAsr: {
        decision: "primary-zero-error",
        primaryExpectedWords: 8,
        primaryOrdinaryWordErrors: 0,
        primaryOrdinaryWordErrorRate: 0,
        primaryEvidencePath: "artifacts/evidence/reference-asr.json",
        primaryEvidenceSha256: HASH,
      },
      speakerPurityEvidencePath: "artifacts/evidence/speaker-purity.json",
      speakerPurityEvidenceSha256: HASH,
      speakerPurityProofRecordId: "existing-socrates-selection",
      speakerPuritySourceAgreementSha256: HASH,
      speakerPurityMethod: "jowett-caption-turn-alignment-v1",
      dominantSpeakerCoverage: 1,
      competingSpeakerCoverage: 0,
      uncoveredSpeakerCoverage: 0,
    },
    generation: {
      numSteps: 24,
      guidanceScale: 1.2,
      speakerScale: 1.5,
      language: "EN",
      precision: "bfloat16",
    },
    audition: {
      relativePath: `artifacts/auditions/${characterId}.wav`,
      sha256: HASH,
      durationSeconds: 20,
      expectedWords: 40,
      ordinaryWordErrors: 0,
      ordinaryWordErrorRate: 0,
      asrEvidencePath: "artifacts/evidence/speaker-asr.json",
      asrEvidenceSha256: HASH,
      meanSpeakerCosineSimilarity: 0.9,
      minimumWindowSpeakerCosineSimilarity: 0.88,
      acousticEvidencePath: "artifacts/evidence/speaker-acoustic.json",
      acousticEvidenceSha256: HASH,
      clippedSamples: 0,
      truePeakDbtp: -1,
      peakAmplitude: 0.9,
    },
    selection: {
      basis: "operator-authorized-deterministic-gates",
      policy: "cast-auto-accept-v1",
      acceptedAt: "2026-07-13",
      label: `${characterId}-seed-1`,
      allGatesPassed: true,
      candidateSelection: "highest-ranked-passing",
      evaluatedCandidateCount: 1,
      passingCandidateCount: 1,
      selectedRank: 1,
      decisionPath: `audio/cast-decisions/${characterId}.json`,
      decisionSha256: HASH,
      sourceAssignment: {
        kind: "same-character",
        authorizedBy: "operator",
        reason: "The source character matches the voice owner.",
      },
    },
  };
}

function commentarySections(
  sections: Array<{ id?: string; span: string; title: string; body: string; audioInsertion?: TestAudioInsertion }>,
  status = "accepted",
) {
  return [
    "# Fixture commentary",
    "",
    ...sections.flatMap((section, index) => {
      const sourceRef = resolveSourceSpan(DIALOGUE, section.span).source_ref;
      return [
        "```yaml",
        `commentary_id: ${section.id ?? `comm_fixture_${String(index + 1).padStart(4, "0")}`}`,
        "source_work: Fixture",
        "block_kind: section",
        "placement: before",
        `title: "${section.title}"`,
        `stephanus_span: ${section.span}`,
        "source_ref:",
        `  source_path: ${sourceRef.source_path}`,
        `  stephanus_span: ${sourceRef.stephanus_span}`,
        `  start_marker: ${sourceRef.start_marker}`,
        `  end_marker: ${sourceRef.end_marker}`,
        `  start_char: ${sourceRef.start_char}`,
        `  end_char: ${sourceRef.end_char}`,
        `  text_sha256: "${sourceRef.text_sha256}"`,
        ...(section.audioInsertion ? audioInsertionLines(section.audioInsertion) : []),
        `body: "${section.body}"`,
        "cites:",
        "  observations: []",
        "  claims: []",
        "  relations: []",
        "  dossiers: []",
        "crossrefs: []",
        "author: model",
        `review_status: ${status}`,
        "```",
        "",
      ];
    }),
  ].join("\n");
}

function commentary(status = "accepted") {
  return commentarySections(
    [{ span: "1a-1b", title: "Opening", body: "The opening commentary." }],
    status,
  );
}

function insertCommentaryBlock({
  id,
  placement,
  span,
  body,
  audioInsertion,
  status = "accepted",
}: {
  id: string;
  placement: "before" | "after";
  span: string;
  body: string;
  audioInsertion?: TestAudioInsertion;
  status?: "accepted" | "unreviewed" | "needs_split" | "rejected";
}) {
  const sourceRef = resolveSourceSpan(DIALOGUE, span).source_ref;
  return [
    "```yaml",
    `commentary_id: ${id}`,
    "source_work: Fixture",
    "block_kind: context",
    `placement: ${placement}`,
    `stephanus_span: ${span}`,
    "source_ref:",
    `  source_path: ${sourceRef.source_path}`,
    `  stephanus_span: ${sourceRef.stephanus_span}`,
    `  start_marker: ${sourceRef.start_marker}`,
    `  end_marker: ${sourceRef.end_marker}`,
    `  start_char: ${sourceRef.start_char}`,
    `  end_char: ${sourceRef.end_char}`,
    `  text_sha256: "${sourceRef.text_sha256}"`,
    ...(audioInsertion ? audioInsertionLines(audioInsertion) : []),
    `body: "${body}"`,
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: model",
    `review_status: ${status}`,
    "```",
    "",
  ].join("\n");
}

function audioInsertionLines(boundary: TestAudioInsertion) {
  return [
    "audio_insertion:",
    `  attribution_path: ${boundary.attribution_path}`,
    `  attribution_sha256: "${boundary.attribution_sha256}"`,
    `  english_sha256: "${boundary.english_sha256}"`,
    `  turn_id: ${boundary.turn_id}`,
    `  edge: ${boundary.edge}`,
    ...(boundary.char_offset === undefined ? [] : [`  char_offset: ${boundary.char_offset}`]),
  ];
}

function currentAudioInsertion(
  turnId: string,
  edge: "before" | "after",
  charOffset?: number,
): TestAudioInsertion {
  const attributionPath = `audio/speaker-attributions/${DIALOGUE}.json`;
  const englishPath = `raw/plato/english/${DIALOGUE}.txt`;
  return {
    attribution_path: attributionPath,
    attribution_sha256: sha256(readFileSync(join(root, attributionPath), "utf8")),
    english_sha256: sha256(readFileSync(join(root, englishPath), "utf8")),
    turn_id: turnId,
    edge,
    ...(charOffset === undefined ? {} : { char_offset: charOffset }),
  };
}

function writeCast({ commentator = true }: { commentator?: boolean } = {}) {
  const voices = [voice("speaker", "Speaker"), ...(commentator ? [voice("commentator", "Commentator")] : [])];
  writeJson("audio/cast.json", {
    schemaVersion: 3,
    status: commentator ? "complete" : "partial",
    updatedAt: "2026-07-13",
    enginePolicy: {
      defaultEngine: "dots.tts-soar",
      exceptionsRequireRecordedQaFailure: true,
      implicitFallbackVoice: false,
      voiceOwnership: "one-voice-per-character",
      reportedSpeech: "inherit-active-character",
      acceptancePolicy: "operator-authorized-deterministic-v1",
      manualListeningRequired: false,
      acceptanceGates: CAST_ACCEPTANCE_GATES,
    },
    voices,
  });
}

function writeAttribution(overrides: Record<string, unknown> = {}) {
  const firstEnd = ENGLISH.indexOf("\n") + 1;
  writeJson(`audio/speaker-attributions/${DIALOGUE}.json`, {
    schema_version: 2,
    dialogue: DIALOGUE,
    english_sha256: sha256(ENGLISH),
    voice_policy: "reported-speech-inherits-active-character-v1",
    status: "accepted",
    reviewer: "fixture-editor",
    reviewed_at: "2026-07-13",
    commentary_character_id: "commentator",
    segments: [
      { id: "turn-0001", start_char: 0, end_char: firstEnd, character_id: "speaker" },
      { id: "turn-0002", start_char: firstEnd, end_char: ENGLISH.length, character_id: "speaker" },
    ],
    ...overrides,
  });
}

function writeFixture() {
  write(`raw/plato/greek/${DIALOGUE}.txt`, "{1a} alpha {1b} beta");
  write(`raw/plato/english/${DIALOGUE}.txt`, ENGLISH);
  writeEnglishStephanusIndex(DIALOGUE);
  write(`wiki/commentary/${DIALOGUE}.md`, commentary());
  writeAttribution();
  writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
  writeJson("audio/characters.json", {
    schemaVersion: 3,
    status: "complete",
    updatedAt: "2026-07-13",
    source: { path: "audio/english-tei-speaker-census.json", sha256: HASH },
    dialogues: [
      {
        dialogue: DIALOGUE,
        editorialStatus: "resolved",
        sourceParticipantCount: 1,
        sourceSaidElementCount: 2,
        sourceAnomalyCount: 0,
        characterIds: ["speaker", "commentator"],
      },
    ],
    characters: [
      {
        characterId: "speaker",
        displayName: "Speaker",
        identityStatus: "resolved",
        aliases: ["Speaker"],
        appearances: [
          {
            dialogue: DIALOGUE,
            editorialStatus: "resolved",
            performanceRole: "voice-owner",
            roleFlags: ["source-speaker"],
            sourceLabels: ["Speaker"],
            sourceAliases: ["Speaker"],
            sourceAttributions: ["#Speaker"],
          },
        ],
      },
      {
        characterId: "commentator",
        displayName: "Commentator",
        identityStatus: "resolved",
        aliases: ["Commentator"],
        appearances: [
          {
            dialogue: DIALOGUE,
            editorialStatus: "resolved",
            performanceRole: "voice-owner",
            roleFlags: ["commentary-narrator"],
            sourceLabels: [],
            sourceAliases: [],
            sourceAttributions: [],
            editorialNote: "Fixture commentary narration role.",
          },
        ],
      },
    ],
  });
  writeJson("audio/english-tei-speaker-census.json", { schema_version: 1, dialogues: [] });
  writeCast();
  writeAttribution();
}

function rewriteChapterFixture({
  english,
  greek,
  sections,
  segments,
}: {
  english: string;
  greek: string;
  sections: Array<{ id?: string; span: string; title: string; body: string }>;
  segments: Array<{ id: string; start_char: number; end_char: number; character_id: string }>;
}) {
  write(`raw/plato/greek/${DIALOGUE}.txt`, greek);
  write(`raw/plato/english/${DIALOGUE}.txt`, english);
  writeEnglishStephanusIndex(DIALOGUE);
  write(`wiki/commentary/${DIALOGUE}.md`, commentarySections(sections));
  writeAttribution({ english_sha256: sha256(english), segments });
  writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
}

function appendCharacter(character: Record<string, unknown>, sourceParticipantDelta = 0) {
  const path = "audio/characters.json";
  const catalog = JSON.parse(readFileSync(join(root, path), "utf8")) as {
    dialogues: Array<{ characterIds: string[]; sourceParticipantCount: number }>;
    characters: Array<Record<string, unknown>>;
  };
  const characterId = character.characterId;
  if (typeof characterId !== "string") throw new Error("fixture characterId must be a string");
  catalog.dialogues[0]!.characterIds.push(characterId);
  catalog.dialogues[0]!.sourceParticipantCount += sourceParticipantDelta;
  catalog.characters.push(character);
  writeJson(path, catalog);
}

function addReportedOnlyCharacter() {
  appendCharacter({
    characterId: "dream-woman",
    displayName: "Dream Woman",
    identityStatus: "resolved",
    aliases: ["Dream Woman"],
    appearances: [
      {
        dialogue: DIALOGUE,
        editorialStatus: "resolved",
        performanceRole: "reported-only",
        roleFlags: ["reported-speaker", "dream-figure"],
        sourceLabels: [],
        sourceAliases: [],
        sourceAttributions: [],
        editorialNote: "A figure quoted inside Speaker's report; Speaker remains the active voice owner.",
      },
    ],
  });
}

function addReviewRequiredCharacter() {
  appendCharacter(
    {
      characterId: "ambiguous-speaker",
      displayName: "Ambiguous Speaker",
      identityStatus: "resolved",
      aliases: ["Ambiguous Speaker", "Ambiguous"],
      appearances: [
        {
          dialogue: DIALOGUE,
          editorialStatus: "resolved",
          performanceRole: "review-required",
          roleFlags: ["source-speaker"],
          sourceLabels: ["Ambiguous"],
          sourceAliases: [],
          sourceAttributions: ["#Ambiguous"],
        },
      ],
    },
    1,
  );
  const cast = JSON.parse(readFileSync(join(root, "audio/cast.json"), "utf8")) as { status: string };
  cast.status = "partial";
  writeJson("audio/cast.json", cast);
}

describe("deterministic audio screenplay generator", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "screenplay-generator-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("builds a byte-exact, stable screenplay only from accepted span evidence", () => {
    const first = buildScreenplayGenerationReport(DIALOGUE);
    const second = buildScreenplayGenerationReport(DIALOGUE);

    expect(first).toEqual(second);
    expect(first.screenplay_status).toBe("production-contract-valid");
    expect(first.production_eligible).toBe(true);
    expect(first.counts_as_production_screenplay).toBe(false);
    expect(first.blockers).toEqual([]);
    expect(first.structural_validation_issues).toEqual([]);
    expect(first.repository_validation_issues).toEqual([]);
    expect(first.commentary.quality_audit_accepted).toBe(true);
    expect(first.prospective_screenplay?.schema_version).toBe(2);
    expect(first.prospective_screenplay?.commentary_quality_audit_sha256).toBe(
      sha256(readFileSync(join(root, `wiki/commentary-audits/${DIALOGUE}.json`), "utf8")),
    );
    expect(first.prospective_screenplay?.generator_version).toBe(
      `screenplay-generator-v3+attribution.${sha256(
        readFileSync(join(root, `audio/speaker-attributions/${DIALOGUE}.json`), "utf8"),
      )}`,
    );
    expect(first.prospective_screenplay?.entries.map((entry) => entry.id)).toEqual([
      "fixture-heading-comm-fixture-0001",
      "fixture-commentary-comm-fixture-0001",
      "fixture-source-turn-0001",
      "fixture-source-turn-0002",
    ]);
    expect(
      first.prospective_screenplay?.entries
        .filter((entry) => entry.kind === "source")
        .map((entry) => entry.text)
        .join(" "),
    ).toBe("Hello Socrates. Goodbye Socrates.");

    expect(existsSync(join(root, `audio/scripts/${DIALOGUE}.json`))).toBe(false);
    expect(writeProductionScreenplay(first)).toBe(`audio/scripts/${DIALOGUE}.json`);
    expect(JSON.parse(readFileSync(join(root, `audio/scripts/${DIALOGUE}.json`), "utf8"))).toEqual(
      first.prospective_screenplay,
    );
  });

  it("projects a Greek-valid section endpoint that is missing from the English marker inventory", () => {
    const projection = projectStephanusSpansToMarkers(
      [
        { marker: "1a", startChar: 0, endChar: 20 },
        { marker: "1c", startChar: 20, endChar: 40 },
      ],
      [
        { id: "chapter-first", span: "1a-1b" },
        { id: "chapter-second", span: "1c" },
      ],
    );

    expect(projection.map((chapter) => chapter.markers.map((marker) => marker.marker))).toEqual([
      ["1a"],
      ["1c"],
    ]);
  });

  it("projects a missing English endpoint and omits structural newline fragments end to end", () => {
    const english = "{1a} Speaker. First answer.\n{1c} Speaker. Second answer.\n";
    const prefixStart = english.indexOf("\n");
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta {1c} gamma",
      sections: [
        { span: "1a-1b", title: "First", body: "Commentary for the first chapter." },
        { span: "1c", title: "Second", body: "Commentary for the second chapter." },
      ],
      segments: [
        { id: "turn-0001", start_char: 0, end_char: prefixStart, character_id: "speaker" },
        { id: "turn-0002", start_char: prefixStart, end_char: english.length, character_id: "speaker" },
      ],
    });

    const report = buildScreenplayGenerationReport(DIALOGUE);
    const source = report.prospective_screenplay?.entries.filter((entry) => entry.kind === "source");

    expect(report.blockers).toEqual([]);
    expect(report.screenplay_status).toBe("production-contract-valid");
    expect(source).toEqual([
      expect.objectContaining({
        id: "fixture-source-turn-0001",
        chapter_id: "chapter-fixture_0001",
        text: "First answer.",
        anchor: { stephanus: "1a" },
      }),
      expect.objectContaining({
        id: "fixture-source-turn-0002",
        chapter_id: "chapter-fixture_0002",
        text: "Second answer.",
        anchor: { stephanus: "1c" },
      }),
    ]);
  });

  it("omits a chapter-boundary fragment containing only newline and book-separator markup", () => {
    const english = "{1a} Speaker. First {1b} answer.\n{b2}{1c} Speaker. Second answer.\n";
    const prefixStart = english.indexOf("\n");
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta {1c} gamma",
      sections: [
        { span: "1a-1b", title: "First", body: "Commentary for the first chapter." },
        { span: "1c", title: "Second", body: "Commentary for the second chapter." },
      ],
      segments: [
        { id: "turn-0001", start_char: 0, end_char: prefixStart, character_id: "speaker" },
        { id: "turn-0002", start_char: prefixStart, end_char: english.length, character_id: "speaker" },
      ],
    });

    const report = buildScreenplayGenerationReport(DIALOGUE);
    const source = report.prospective_screenplay?.entries.filter((entry) => entry.kind === "source");

    expect(report.blockers).toEqual([]);
    expect(source?.map((entry) => [entry.id, entry.chapter_id, entry.text])).toEqual([
      ["fixture-source-turn-0001", "chapter-fixture_0001", "First answer."],
      ["fixture-source-turn-0002", "chapter-fixture_0002", "Second answer."],
    ]);
  });

  it("splits genuine spoken content across chapters with deterministic derived ids", () => {
    const english = "{1a} Speaker. First {1b} answer.\n{1c} Speaker. Second answer.\n";
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta {1c} gamma",
      sections: [
        { span: "1a-1b", title: "First", body: "Commentary for the first chapter." },
        { span: "1c", title: "Second", body: "Commentary for the second chapter." },
      ],
      segments: [{ id: "turn-0001", start_char: 0, end_char: english.length, character_id: "speaker" }],
    });

    const report = buildScreenplayGenerationReport(DIALOGUE);
    const source = report.prospective_screenplay?.entries.filter((entry) => entry.kind === "source");

    expect(report.blockers).toEqual([]);
    expect(source?.map((entry) => [entry.id, entry.chapter_id, entry.text])).toEqual([
      ["fixture-source-turn-0001-part-001", "chapter-fixture_0001", "First answer."],
      ["fixture-source-turn-0001-part-002", "chapter-fixture_0002", "Second answer."],
    ]);
    expect(source?.map((entry) => entry.text).join(" ")).toBe("First answer. Second answer.");
  });

  it("uses an exact interior section audio boundary and derives stable source part ids", () => {
    const english = "{1a} Speaker. First answer. {1b} Speaker. Second answer.";
    const sentenceBoundary = english.indexOf("First answer.") + "First answer.".length;
    const plainSections = [
      { span: "1a", title: "First", body: "Commentary for the first chapter." },
      { span: "1b", title: "Second", body: "Commentary for the second chapter." },
    ];
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta",
      sections: plainSections,
      segments: [{ id: "turn-0001", start_char: 0, end_char: english.length, character_id: "speaker" }],
    });
    const sections = [
      plainSections[0]!,
      {
        ...plainSections[1]!,
        audioInsertion: currentAudioInsertion("turn-0001", "after", sentenceBoundary),
      },
    ];
    write(`wiki/commentary/${DIALOGUE}.md`, commentarySections(sections));
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });

    const report = buildScreenplayGenerationReport(DIALOGUE);
    const source = report.prospective_screenplay?.entries.filter((entry) => entry.kind === "source");

    expect(report.blockers).toEqual([]);
    expect(source?.map((entry) => [entry.id, entry.chapter_id, entry.text])).toEqual([
      ["fixture-source-turn-0001-part-001", "chapter-fixture_0001", "First answer."],
      ["fixture-source-turn-0001-part-002", "chapter-fixture_0002", "Second answer."],
    ]);
  });

  it("fails audit construction before production for stale, absent-turn, and non-sentence explicit section boundaries", () => {
    const english = "{1a} Speaker. First answer. {1b} Speaker. Second answer.";
    const plainSections = [
      { span: "1a", title: "First", body: "Commentary for the first chapter." },
      { span: "1b", title: "Second", body: "Commentary for the second chapter." },
    ];
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta",
      sections: plainSections,
      segments: [{ id: "turn-0001", start_char: 0, end_char: english.length, character_id: "speaker" }],
    });
    const valid = currentAudioInsertion(
      "turn-0001",
      "after",
      english.indexOf("First answer.") + "First answer.".length,
    );
    const auditRejectedBoundaries: TestAudioInsertion[] = [
      { ...valid, attribution_sha256: "0".repeat(64) },
      { ...valid, turn_id: "turn-missing" },
    ];

    for (const boundary of auditRejectedBoundaries) {
      write(
        `wiki/commentary/${DIALOGUE}.md`,
        commentarySections([
          plainSections[0]!,
          { ...plainSections[1]!, audioInsertion: boundary },
        ]),
      );
      expect(() => writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE })).toThrow(
        /audio_insertion/u,
      );
    }

    write(
      `wiki/commentary/${DIALOGUE}.md`,
      commentarySections([
        plainSections[0]!,
        { ...plainSections[1]!, audioInsertion: { ...valid, char_offset: english.indexOf("First answer.") + 3 } },
      ]),
    );
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
    const report = buildScreenplayGenerationReport(DIALOGUE);
    expect(report.screenplay_status).toBe("blocked");
    expect(report.blockers.length).toBeGreaterThan(0);
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("places after commentary at the end marker and advances through sentence endings to a source-turn boundary", () => {
    const english =
      "{1a} Speaker. Opening.\n" +
      "{1b} Speaker. The sentence starts {1c} across the next page {1d} and reaches a sentence. It finishes the turn here.\n" +
      "{1e} Speaker. Following turn.\n";
    const firstEnd = english.indexOf("\n") + 1;
    const thirdStart = english.indexOf("{1c}");
    const fourthStart = english.indexOf("{1d}");
    const fifthStart = english.indexOf(" It finishes");
    const fourthEnd = english.indexOf("\n", fourthStart) + 1;
    const sections = [
      { span: "1a-1e", title: "Whole fixture", body: "Commentary for the whole fixture." },
    ];
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta {1c} gamma {1d} delta {1e} epsilon",
      sections,
      segments: [
        { id: "turn-0001", start_char: 0, end_char: firstEnd, character_id: "speaker" },
        { id: "turn-0002", start_char: firstEnd, end_char: thirdStart, character_id: "speaker" },
        { id: "turn-0003", start_char: thirdStart, end_char: fourthStart, character_id: "speaker" },
        { id: "turn-0004", start_char: fourthStart, end_char: fifthStart, character_id: "speaker" },
        { id: "turn-0005", start_char: fifthStart, end_char: fourthEnd, character_id: "speaker" },
        { id: "turn-0006", start_char: fourthEnd, end_char: english.length, character_id: "speaker" },
      ],
    });
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      `${commentarySections(sections)}\n${insertCommentaryBlock({
        id: "comm_fixture_0002",
        placement: "after",
        span: "1b-1c",
        body: "The sentence is now complete.",
      })}`,
    );
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });

    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.blockers).toEqual([]);
    expect(report.prospective_screenplay?.entries.map((entry) => entry.id)).toEqual([
      "fixture-heading-comm-fixture-0001",
      "fixture-commentary-comm-fixture-0001",
      "fixture-source-turn-0001",
      "fixture-source-turn-0002",
      "fixture-source-turn-0003",
      "fixture-source-turn-0004",
      "fixture-source-turn-0005",
      "fixture-commentary-comm-fixture-0002",
      "fixture-source-turn-0006",
    ]);
  });

  it("retreats before commentary to the start of the source turn containing its start marker", () => {
    const english =
      "{1a} Speaker. Opening.\n" +
      "{1b} Speaker. The sentence starts {1c} across the next page {1d} and finishes here.\n" +
      "{1e} Speaker. Following turn.\n";
    const firstEnd = english.indexOf("\n") + 1;
    const thirdStart = english.indexOf("{1c}");
    const fourthStart = english.indexOf("{1d}");
    const fourthEnd = english.indexOf("\n", fourthStart) + 1;
    const sections = [
      { span: "1a-1e", title: "Whole fixture", body: "Commentary for the whole fixture." },
    ];
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta {1c} gamma {1d} delta {1e} epsilon",
      sections,
      segments: [
        { id: "turn-0001", start_char: 0, end_char: firstEnd, character_id: "speaker" },
        { id: "turn-0002", start_char: firstEnd, end_char: thirdStart, character_id: "speaker" },
        { id: "turn-0003", start_char: thirdStart, end_char: fourthStart, character_id: "speaker" },
        { id: "turn-0004", start_char: fourthStart, end_char: fourthEnd, character_id: "speaker" },
        { id: "turn-0005", start_char: fourthEnd, end_char: english.length, character_id: "speaker" },
      ],
    });
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      `${commentarySections(sections)}\n${insertCommentaryBlock({
        id: "comm_fixture_0002",
        placement: "before",
        span: "1c-1d",
        body: "Listen for the sentence that follows.",
      })}`,
    );
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });

    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.blockers).toEqual([]);
    expect(report.prospective_screenplay?.entries.map((entry) => entry.id)).toEqual([
      "fixture-heading-comm-fixture-0001",
      "fixture-commentary-comm-fixture-0001",
      "fixture-source-turn-0001",
      "fixture-commentary-comm-fixture-0002",
      "fixture-source-turn-0002",
      "fixture-source-turn-0003",
      "fixture-source-turn-0004",
      "fixture-source-turn-0005",
    ]);
  });

  it("snaps the Crito 44b chapter transition and after 43d-44a commentary to the complete source turn", () => {
    const english =
      "{43a} Speaker. Opening turn.\n" +
      "Speaker. The arrival report {43d} ends here.\n" +
      "Speaker. I do not think {44a} it comes today.\n" +
      "Speaker. I dreamed a woman called me " +
      "{44b} and said the third day would bring me home.\n" +
      "Speaker. A strange dream.\n" +
      "{46a} Speaker. Later material.\n";
    const firstEnd = english.indexOf("\n") + 1;
    const secondEnd = english.indexOf("\n", firstEnd) + 1;
    const thirdEnd = english.indexOf("\n", secondEnd) + 1;
    const turn27Start = english.indexOf("{44b}");
    const turn27End = english.indexOf("\n", turn27Start) + 1;
    const turn28End = english.indexOf("\n", turn27End) + 1;
    const sections = [
      {
        id: "comm_fixture_0001",
        span: "43a-44a",
        title: "Before the dream",
        body: "The opening section commentary.",
      },
      {
        id: "comm_fixture_0003",
        span: "44b-46a",
        title: "After the dream",
        body: "The second section commentary.",
      },
    ];
    rewriteChapterFixture({
      english,
      greek: "{43a} alpha {43d} beta {44a} gamma {44b} delta {46a} epsilon",
      sections,
      segments: [
        { id: "turn-000001", start_char: 0, end_char: firstEnd, character_id: "speaker" },
        { id: "turn-000017", start_char: firstEnd, end_char: secondEnd, character_id: "speaker" },
        { id: "turn-000020", start_char: secondEnd, end_char: thirdEnd, character_id: "speaker" },
        { id: "turn-000026", start_char: thirdEnd, end_char: turn27Start, character_id: "speaker" },
        { id: "turn-000027", start_char: turn27Start, end_char: turn27End, character_id: "speaker" },
        { id: "turn-000028", start_char: turn27End, end_char: turn28End, character_id: "speaker" },
        { id: "turn-000029", start_char: turn28End, end_char: english.length, character_id: "speaker" },
      ],
    });
    const sectionLedger = commentarySections(sections);
    const secondSectionStart = sectionLedger.indexOf(
      "```yaml",
      sectionLedger.indexOf("```yaml") + 1,
    );
    const insertBlock = insertCommentaryBlock({
        id: "comm_fixture_0002",
        placement: "after",
        span: "43d-44a",
        body: "The dream turn is now complete.",
      });
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      `${sectionLedger.slice(0, secondSectionStart)}${insertBlock}\n${sectionLedger.slice(secondSectionStart)}`,
    );
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });

    const report = buildScreenplayGenerationReport(DIALOGUE);
    const entries = report.prospective_screenplay?.entries ?? [];
    const turn26Index = entries.findIndex((entry) => entry.id === "fixture-source-turn-000026");
    const turn27Index = entries.findIndex((entry) => entry.id === "fixture-source-turn-000027");
    const turn28Index = entries.findIndex((entry) => entry.id === "fixture-source-turn-000028");
    const insertIndex = entries.findIndex(
      (entry) => entry.id === "fixture-commentary-comm-fixture-0002",
    );
    const secondHeadingIndex = entries.findIndex(
      (entry) => entry.id === "fixture-heading-comm-fixture-0003",
    );

    expect(report.blockers).toEqual([]);
    expect(entries[turn26Index]?.chapter_id).toBe("chapter-fixture_0001");
    expect(entries[turn27Index]?.chapter_id).toBe("chapter-fixture_0001");
    expect(entries.slice(turn26Index + 1, turn27Index).filter((entry) => entry.kind !== "source")).toEqual([]);
    expect(turn26Index).toBeLessThan(turn27Index);
    expect(entries[insertIndex]?.chapter_id).toBe("chapter-fixture_0001");
    expect(turn27Index).toBeLessThan(insertIndex);
    expect(insertIndex).toBeLessThan(secondHeadingIndex);
    expect(insertIndex).toBeLessThan(turn28Index);

    const unsafe = structuredClone(report.prospective_screenplay!);
    const continuation = unsafe.entries.find((entry) => entry.id === "fixture-source-turn-000027")!;
    continuation.chapter_id = "chapter-fixture_0003";
    unsafe.entries = unsafe.entries.filter((entry) => entry !== continuation);
    const secondCommentaryIndex = unsafe.entries.findIndex(
      (entry) => entry.id === "fixture-commentary-comm-fixture-0003",
    );
    unsafe.entries.splice(secondCommentaryIndex + 1, 0, continuation);
    expect(
      validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(unsafe)),
    ).toContainEqual(
      expect.objectContaining({
        code: "invalid_reference",
        message: expect.stringContaining("source-turn boundary"),
      }),
    );
  });

  it("fails closed when section spans do not cover every English marker", () => {
    const english = "{1a} Speaker. First.\n{1b} Speaker. Middle.\n{1c} Speaker. Last.\n";
    rewriteChapterFixture({
      english,
      greek: "{1a} alpha {1b} beta {1c} gamma",
      sections: [
        { span: "1a", title: "First", body: "Commentary for the first chapter." },
        { span: "1c", title: "Last", body: "Commentary for the last chapter." },
      ],
      segments: [{ id: "turn-0001", start_char: 0, end_char: english.length, character_id: "speaker" }],
    });

    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.blockers).toContainEqual(
      expect.objectContaining({
        code: "chapter_mapping_failure",
        message: expect.stringContaining("1 English marker(s) have non-unique coverage"),
      }),
    );
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("uses full-source label boundaries when an attribution starts after a Stephanus token", () => {
    const changedEnglish =
      "{1a} Speaker. Hello Socrates.\n{1b} Speaker. Socrates. Goodbye Socrates.\n";
    const secondStart = changedEnglish.indexOf("{1b}") + "{1b}".length;
    write(`raw/plato/english/${DIALOGUE}.txt`, changedEnglish);
    writeEnglishStephanusIndex(DIALOGUE);
    writeAttribution({
      english_sha256: sha256(changedEnglish),
      segments: [
        { id: "turn-0001", start_char: 0, end_char: secondStart, character_id: "speaker" },
        {
          id: "turn-0002",
          start_char: secondStart,
          end_char: changedEnglish.length,
          character_id: "speaker",
        },
      ],
    });
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });

    const report = buildScreenplayGenerationReport(DIALOGUE);
    expect(report.blockers.map((blocker) => blocker.code)).not.toContain("incomplete_attribution");
    expect(report.screenplay_status).toBe("production-contract-valid");
    expect(
      report.prospective_screenplay?.entries
        .filter((entry) => entry.kind === "source")
        .map((entry) => entry.text),
    ).toEqual(["Hello Socrates.", "Socrates. Goodbye Socrates."]);
  });

  it("allows an explicitly named scratch draft but refuses production with an incomplete cast", () => {
    writeCast({ commentator: false });
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("draft-ready");
    expect(report.production_eligible).toBe(false);
    expect(report.characters.missing_cast_character_ids).toEqual(["commentator"]);
    expect(report.prospective_screenplay).toBeDefined();
    expect(() => writeProductionScreenplay(report)).toThrow("full repository contract is not valid");
    expect(writeDraftScreenplay(report)).toBe(`scratch/audio-screenplays/${DIALOGUE}.draft.json`);
    expect(existsSync(join(root, `audio/scripts/${DIALOGUE}.json`))).toBe(false);
    expect(existsSync(join(root, `scratch/audio-screenplays/${DIALOGUE}.draft.json`))).toBe(true);
  });

  it("invalidates a generated screenplay when its accepted attribution evidence changes", () => {
    const report = buildScreenplayGenerationReport(DIALOGUE);
    expect(report.production_eligible).toBe(true);
    const planPath = join(root, `audio/speaker-attributions/${DIALOGUE}.json`);
    const plan = JSON.parse(readFileSync(planPath, "utf8")) as Record<string, unknown>;
    plan.reviewer = "different-editor";
    writeJson(`audio/speaker-attributions/${DIALOGUE}.json`, plan);

    expect(() => writeProductionScreenplay(report)).toThrow("validation issue");
    expect(existsSync(join(root, `audio/scripts/${DIALOGUE}.json`))).toBe(false);
  });

  it("blocks rather than using unreviewed commentary", () => {
    write(`wiki/commentary/${DIALOGUE}.md`, commentary("unreviewed"));
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.commentary.fully_accepted).toBe(false);
    expect(report.blockers.map((blocker) => blocker.code)).toContain("commentary_not_accepted");
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("hash-binds rejected commentary as ledger provenance but excludes it from pending counts and playback", () => {
    const retiredInsertion = {
      ...currentAudioInsertion("turn-0001", "after"),
      attribution_sha256: "0".repeat(64),
    };
    const rejected = insertCommentaryBlock({
      id: "comm_fixture_0002",
      placement: "after",
      span: "1a",
      body: "This rejected prose must never be spoken.",
      audioInsertion: retiredInsertion,
      status: "rejected",
    });
    const ledger = `${commentary()}\n${rejected}`;
    write(`wiki/commentary/${DIALOGUE}.md`, ledger);
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });

    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.blockers).toEqual([]);
    expect(report.screenplay_status).toBe("production-contract-valid");
    expect(report.commentary).toMatchObject({
      block_count: 1,
      accepted_block_count: 1,
      fully_accepted: true,
    });
    expect(report.prospective_screenplay?.commentary_sha256).toBe(sha256(ledger));
    expect(
      report.prospective_screenplay?.entries.some(
        (entry) =>
          entry.kind === "commentary" &&
          (entry.anchor as { commentary_id?: string }).commentary_id === "comm_fixture_0002",
      ),
    ).toBe(false);
    expect(report.prospective_screenplay?.entries.map((entry) => entry.text)).not.toContain(
      "This rejected prose must never be spoken.",
    );

    write(
      `wiki/commentary/${DIALOGUE}.md`,
      ledger.replace("review_status: rejected", "review_status: needs_split"),
    );
    const pending = buildScreenplayGenerationReport(DIALOGUE);
    expect(pending.commentary).toMatchObject({
      block_count: 2,
      accepted_block_count: 1,
      fully_accepted: false,
    });
    expect(pending.blockers.map((blocker) => blocker.code)).toContain("commentary_not_accepted");
    expect(pending.prospective_screenplay).toBeUndefined();
  });

  it("refuses every screenplay write when the canonical commentary quality audit is missing", () => {
    unlinkSync(join(root, `wiki/commentary-audits/${DIALOGUE}.json`));
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.blockers.map((blocker) => blocker.code)).toContain("missing_commentary_quality_audit");
    expect(report.prospective_screenplay).toBeUndefined();
    expect(() => writeDraftScreenplay(report)).toThrow();
    expect(() => writeProductionScreenplay(report)).toThrow();
    expect(existsSync(join(root, `scratch/audio-screenplays/${DIALOGUE}.draft.json`))).toBe(false);
    expect(existsSync(join(root, `audio/scripts/${DIALOGUE}.json`))).toBe(false);
  });

  it("refuses screenplay generation while a current commentary quality audit awaits operator-delegated Luna sample acceptance", () => {
    const auditPath = join(root, `wiki/commentary-audits/${DIALOGUE}.json`);
    const audit = JSON.parse(readFileSync(auditPath, "utf8")) as Record<string, unknown>;
    audit.acceptance = {
      decision: "pending",
      reviewer: null,
      reviewed_on: null,
      rationale: null,
      sampled_commentary_ids: [],
      review_note: null,
    };
    writeJson(`wiki/commentary-audits/${DIALOGUE}.json`, audit);
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.commentary.quality_audit_accepted).toBe(false);
    expect(report.blockers.map((blocker) => blocker.code)).toContain(
      "commentary_quality_audit_not_accepted",
    );
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("refuses a stale canonical commentary quality audit", () => {
    write("docs/commentary-protocol.md", driftedCommentaryProtocolFixture("Changed after acceptance."));
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.blockers.map((blocker) => blocker.code)).toContain(
      "invalid_commentary_quality_audit",
    );
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("reports missing span evidence and never inherits or guesses unlabeled/quoted speech", () => {
    unlinkSync(join(root, `audio/speaker-attributions/${DIALOGUE}.json`));
    const source = "{1a} Speaker. Explicit words.\n{1b} Narration without a label {q} quoted words {/q}\n";
    write(`raw/plato/english/${DIALOGUE}.txt`, source);
    writeEnglishStephanusIndex(DIALOGUE);
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.blockers.map((blocker) => blocker.code)).toContain("missing_attribution_plan");
    expect(report.source_diagnostics.explicit_label_line_count).toBe(1);
    expect(report.source_diagnostics.embedded_quote_line_count).toBe(1);
    expect(report.source_diagnostics.unresolved_lines).toEqual([
      expect.objectContaining({ line: 2, reason: "no_explicit_source_label" }),
    ]);
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("rejects stale hashes and non-partitioning attribution instead of repairing them implicitly", () => {
    writeAttribution({ english_sha256: "f".repeat(64) });
    const stale = buildScreenplayGenerationReport(DIALOGUE);
    expect(stale.blockers.map((blocker) => blocker.code)).toContain("invalid_attribution_plan");

    writeAttribution({
      segments: [{ id: "turn-0001", start_char: 1, end_char: ENGLISH.length, character_id: "speaker" }],
    });
    const gap = buildScreenplayGenerationReport(DIALOGUE);
    expect(gap.blockers.map((blocker) => blocker.code)).toContain("incomplete_attribution");
    expect(gap.prospective_screenplay).toBeUndefined();
  });

  it("hard-cuts attribution v1 and plans without the reported-speech voice policy", () => {
    writeAttribution({ schema_version: 1 });
    const legacy = buildScreenplayGenerationReport(DIALOGUE);

    expect(legacy.blockers).toContainEqual(
      expect.objectContaining({
        code: "invalid_attribution_plan",
        message: expect.stringContaining("schema_version must be 2"),
      }),
    );

    writeAttribution({ voice_policy: undefined });
    const policyless = buildScreenplayGenerationReport(DIALOGUE);

    expect(policyless.blockers).toContainEqual(
      expect.objectContaining({
        code: "invalid_attribution_plan",
        message: expect.stringContaining(
          "voice_policy must be reported-speech-inherits-active-character-v1",
        ),
      }),
    );
  });

  it("keeps a reported character in the textual roster while Speaker owns the reported speech", () => {
    addReportedOnlyCharacter();
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("production-contract-valid");
    expect(report.characters).toMatchObject({
      roster_character_ids: ["speaker", "commentator", "dream-woman"],
      voice_owner_character_ids: ["commentator", "speaker"],
      reported_only_character_ids: ["dream-woman"],
      review_required_voice_character_ids: [],
      attributed_character_ids: ["speaker"],
      missing_cast_character_ids: [],
    });
    expect(
      report.prospective_screenplay?.entries
        .filter((entry) => entry.kind === "source")
        .map((entry) => entry.character_id),
    ).toEqual(["speaker", "speaker"]);
  });

  it("rejects a reported-only identity as a segment voice owner without requesting a cast voice", () => {
    addReportedOnlyCharacter();
    const firstEnd = ENGLISH.indexOf("\n") + 1;
    writeAttribution({
      segments: [
        { id: "turn-0001", start_char: 0, end_char: firstEnd, character_id: "dream-woman" },
        { id: "turn-0002", start_char: firstEnd, end_char: ENGLISH.length, character_id: "speaker" },
      ],
    });
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.characters.missing_cast_character_ids).toEqual([]);
    expect(report.blockers).toContainEqual(
      expect.objectContaining({
        code: "reported_only_voice_owner",
        character_ids: ["dream-woman"],
      }),
    );
    expect(report.prospective_screenplay).toBeUndefined();
  });

  it("blocks generation while any source appearance still requires voice-ownership review", () => {
    addReviewRequiredCharacter();
    const report = buildScreenplayGenerationReport(DIALOGUE);

    expect(report.screenplay_status).toBe("blocked");
    expect(report.characters).toMatchObject({
      voice_owner_character_ids: ["commentator", "speaker"],
      review_required_voice_character_ids: ["ambiguous-speaker"],
      missing_cast_character_ids: [],
    });
    expect(report.blockers).toContainEqual(
      expect.objectContaining({
        code: "review_required_voice_owner",
        character_ids: ["ambiguous-speaker"],
      }),
    );
    expect(report.prospective_screenplay).toBeUndefined();
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  canonicalSpokenEnglish,
  canonicalSpokenEnglishSegments,
  characterNamesForDialogue,
  listAudioQaPaths,
  listAudioScriptPaths,
  parseAudioQa,
  parseAudioScript,
  validateAudioProductionArtifacts,
  validateAudioQa,
  validateAudioQaArtifact,
  validateAudioScript,
  validateAudioScriptArtifact,
  type AudioQaReport,
  type AudioScript,
} from "./audio-production.js";
import { CAST_ACCEPTANCE_GATES, parseCharacterCatalog } from "./audio-catalog.js";
import { writeEnglishStephanusIndex } from "./derived/stephanus.js";
import { setRepoRootForTesting } from "./paths.js";
import { resolveSourceSpan } from "./source.js";
import { writeAcceptedCommentaryQualityAuditFixture } from "../test-support/audio-production-fixture.js";
import {
  COMMENTARY_PROTOCOL_FIXTURE,
  driftedCommentaryProtocolFixture,
} from "../test-support/commentary-protocol-fixture.js";

const DIALOGUE = "fixture";
const HASH = "a".repeat(64);
const COMMENTARY_ID = "comm_fixture_0001";
const CHAPTER_ID = "chapter-1";
const ENGLISH = "{1a} Speaker. Hello {place} Socrates {/place} .";
const COMMENTARY_BODY = "A concise note.";
const CORPUS_ROOT = join(import.meta.dir, "../../..");
const SOURCE_GLOBAL_REGRESSION_DIALOGUES = [
  "euthyphro",
  "laws",
  "meno",
  "parmenides",
  "phaedo",
  "phaedrus",
  "philebus",
  "republic",
  "sophist",
  "symposium",
  "theaetetus",
] as const;

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function write(path: string, content: string) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function writeJson(path: string, value: unknown) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function commentaryLedger() {
  const sourceRef = resolveSourceSpan(DIALOGUE, "1a").source_ref;
  return `# Fixture Commentary

\`\`\`yaml
commentary_id: ${COMMENTARY_ID}
source_work: Fixture
block_kind: section
placement: before
title: "Fixture section"
stephanus_span: 1a
source_ref:
  source_path: raw/plato/greek/fixture.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: ${sourceRef.start_char}
  end_char: ${sourceRef.end_char}
  text_sha256: "${sourceRef.text_sha256}"
body: "${COMMENTARY_BODY}"
cites:
  observations: []
  claims: []
  relations: []
  dossiers: []
crossrefs: []
author: model
review_status: accepted
\`\`\`
`;
}

function characters() {
  return {
    schemaVersion: 3,
    status: "complete",
    updatedAt: "2026-07-13",
    source: { path: "audio/english-tei-speaker-census.json", sha256: HASH },
    dialogues: [
      {
        dialogue: DIALOGUE,
        editorialStatus: "resolved",
        sourceParticipantCount: 1,
        sourceSaidElementCount: 1,
        sourceAnomalyCount: 0,
        characterIds: ["speaker"],
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
    ],
  };
}

function cast() {
  return {
    schemaVersion: 3,
    status: "complete",
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
    voices: [
      {
        characterId: "speaker",
        displayName: "Speaker",
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
          sourceCharacterId: "speaker",
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
          relativePath: "artifacts/auditions/speaker.wav",
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
          label: "speaker-seed-1",
          allGatesPassed: true,
          candidateSelection: "highest-ranked-passing",
          evaluatedCandidateCount: 1,
          passingCandidateCount: 1,
          selectedRank: 1,
          decisionPath: "audio/cast-decisions/speaker.json",
          decisionSha256: HASH,
          sourceAssignment: {
            kind: "same-character",
            authorizedBy: "operator",
            reason: "The source character matches the voice owner.",
          },
        },
      },
    ],
  };
}

function writeDependencies() {
  write(`raw/plato/greek/${DIALOGUE}.txt`, "{1a} λόγος");
  write(`raw/plato/english/${DIALOGUE}.txt`, ENGLISH);
  writeEnglishStephanusIndex(DIALOGUE);
  write(`wiki/commentary/${DIALOGUE}.md`, commentaryLedger());
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  writeJson(`audio/speaker-attributions/${DIALOGUE}.json`, {
    schema_version: 2,
    voice_policy: "reported-speech-inherits-active-character-v1",
    dialogue: DIALOGUE,
    english_sha256: sha256(ENGLISH),
    status: "accepted",
    reviewer: "fixture-reviewer",
    reviewed_at: "2026-07-13",
    commentary_character_id: "speaker",
    segments: [{ id: "turn-0001", start_char: 0, end_char: ENGLISH.length, character_id: "speaker" }],
  });
  writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
  writeJson("audio/characters.json", characters());
  writeJson("audio/cast.json", cast());
}

function script(): AudioScript {
  return {
    schema_version: 2,
    dialogue: DIALOGUE,
    source_hashes: {
      english: sha256(read(`raw/plato/english/${DIALOGUE}.txt`)),
      stephanus: sha256(read(`derived/plato/stephanus-english/${DIALOGUE}.toon`)),
    },
    commentary_sha256: sha256(read(`wiki/commentary/${DIALOGUE}.md`)),
    commentary_quality_audit_sha256: sha256(read(`wiki/commentary-audits/${DIALOGUE}.json`)),
    cast_sha256: sha256(read("audio/cast.json")),
    generator_version: `screenplay-generator-v3+attribution.${sha256(read(`audio/speaker-attributions/${DIALOGUE}.json`))}`,
    chapters: [{ id: CHAPTER_ID, commentary_id: COMMENTARY_ID, title: "Fixture section" }],
    entries: [
      {
        id: "fixture-commentary-0001",
        chapter_id: CHAPTER_ID,
        kind: "commentary",
        character_id: "speaker",
        text: COMMENTARY_BODY,
        anchor: { commentary_id: COMMENTARY_ID },
        cadence_intent: "commentary",
      },
      {
        id: "fixture-source-0001",
        chapter_id: CHAPTER_ID,
        kind: "source",
        character_id: "speaker",
        text: "Hello Socrates.",
        anchor: { stephanus: "1a" },
        cadence_intent: "exchange",
      },
    ],
    repairs: [],
    coverage: {
      source_words: 2,
      source_words_covered: 2,
      source_words_uncovered: 0,
      source_words_duplicated: 0,
      commentary_blocks_expected: 1,
      commentary_blocks_covered: 1,
      commentary_blocks_missing: 0,
      commentary_blocks_duplicated: 0,
    },
  };
}

function qa(scriptContent: string): AudioQaReport {
  return {
    schema_version: 2,
    dialogue: DIALOGUE,
    status: "accepted",
    generated_at: "2026-07-13T04:00:00Z",
    script_sha256: sha256(scriptContent),
    cast_sha256: sha256(read("audio/cast.json")),
    source_coverage: {
      passed: true,
      expected_words: 2,
      covered_words: 2,
      uncovered_words: 0,
      duplicated_words: 0,
      repairs_verified: true,
    },
    commentary_coverage: {
      passed: true,
      expected_ids: [COMMENTARY_ID],
      covered_ids: [COMMENTARY_ID],
      missing_ids: [],
      duplicate_ids: [],
    },
    asr: {
      passed: true,
      model_repository: "openai/whisper-small.en",
      model_revision: "c".repeat(40),
      max_word_error_rate: 0.02,
      max_ordinary_word_errors: 0,
      expected_words: 5,
      recognized_words: 5,
      word_errors: 0,
      ordinary_word_errors: 0,
      word_error_rate: 0,
      transcript_sha256: HASH,
      exceptions: [],
    },
    audio: {
      master_path: "artifacts/recordings/fixture/master.wav",
      master_sha256: HASH,
      mime_type: "audio/wav",
      duration_seconds: 10,
      sample_rate_hz: 48_000,
      channels: 1,
      sample_format: "PCM_24",
      target_lufs: -19,
      tolerance_lu: 1,
      integrated_lufs: -19.2,
      true_peak_dbtp: -1.1,
      clipped_samples: 0,
      silence: { max_allowed_ms: 800, max_observed_ms: 600, unexpected_segments: [] },
    },
    cast_consistency: {
      passed: true,
      script_character_ids: ["speaker"],
      selected_character_ids: ["speaker"],
      unresolved_character_ids: [],
      mismatched_character_ids: [],
      recurring_voice_change_character_ids: [],
    },
    listening_review: {
      status: "performed",
      passed: true,
      reviewer: "fixture-reviewer",
      reviewed_at: "2026-07-13",
      scope: "complete-master",
      chapter_ids: [CHAPTER_ID],
      disposition: "accepted",
      findings: [],
    },
    production_acceptance: {
      passed: true,
      basis: "complete-master-human-listening",
      authorized_by: "fixture-reviewer",
      authorized_at: "2026-07-13",
      rationale: "The fixture reviewer completed the exact master review.",
      handoff_evidence_sha256: HASH,
      working_master_sha256: HASH,
      chapter_ids: [CHAPTER_ID],
      disposition: "accepted",
      findings: [],
    },
    chapters: [
      {
        chapter_id: CHAPTER_ID,
        audio_path: "artifacts/recordings/fixture/chapter-1.wav",
        audio_sha256: HASH,
        duration_seconds: 9,
        source_words_expected: 2,
        source_words_covered: 2,
        source_words_uncovered: 0,
        source_words_duplicated: 0,
        commentary_ids_expected: [COMMENTARY_ID],
        commentary_ids_covered: [COMMENTARY_ID],
        asr_expected_words: 5,
        asr_word_errors: 0,
        asr_ordinary_word_errors: 0,
        asr_word_error_rate: 0,
        max_silence_ms: 600,
        integrated_lufs: -19.2,
        true_peak_dbtp: -1.1,
        clipped_samples: 0,
        cast_character_ids: ["speaker"],
        unresolved_character_ids: [],
        mismatched_character_ids: [],
        listening_disposition: "accepted",
        source_coverage_passed: true,
        commentary_coverage_passed: true,
        asr_passed: true,
        silence_passed: true,
        clipping_passed: true,
        loudness_passed: true,
        cast_consistency_passed: true,
        listening_passed: true,
      },
    ],
  };
}

function codes(issues: Array<{ code: string }>) {
  return issues.map((issue) => issue.code);
}

function sourceEntry(value: AudioScript) {
  return value.entries.find((entry) => entry.kind === "source")!;
}

function commentaryEntry(value: AudioScript) {
  return value.entries.find((entry) => entry.kind === "commentary")!;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "audio-production-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  writeDependencies();
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("audio screenplay and QA hard-cutover contracts", () => {
  it("treats absent production directories as honest coverage gaps", () => {
    expect(listAudioScriptPaths()).toEqual([]);
    expect(listAudioQaPaths()).toEqual([]);
    expect(validateAudioProductionArtifacts()).toEqual([]);
  });

  it("accepts a strict, repository-pinned screenplay", () => {
    const content = JSON.stringify(script());
    expect(validateAudioScript(`audio/scripts/${DIALOGUE}.json`, content)).toEqual([]);
    expect(validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, content)).toEqual([]);
    expect(parseAudioScript(`audio/scripts/${DIALOGUE}.json`, content).entries).toHaveLength(2);
  });

  it("hard-rejects legacy screenplay schema v1 and an omitted quality-audit binding", () => {
    const legacy = structuredClone(script()) as unknown as Record<string, unknown>;
    legacy.schema_version = 1;
    delete legacy.commentary_quality_audit_sha256;

    const result = validateAudioScript(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(legacy));
    expect(codes(result)).toContain("invalid_schema_version");
    expect(codes(result)).toContain("invalid_shape");
  });

  it("requires the exact present canonical commentary quality-audit bytes", () => {
    const missingValue = script();
    unlinkSync(join(root, `wiki/commentary-audits/${DIALOGUE}.json`));
    expect(
      codes(
        validateAudioScriptArtifact(
          `audio/scripts/${DIALOGUE}.json`,
          JSON.stringify(missingValue),
        ),
      ),
    ).toContain("missing_dependency");

    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
    const mismatchedValue = script();
    mismatchedValue.commentary_quality_audit_sha256 = HASH;
    expect(
      codes(
        validateAudioScriptArtifact(
          `audio/scripts/${DIALOGUE}.json`,
          JSON.stringify(mismatchedValue),
        ),
      ),
    ).toContain("hash_mismatch");
  });

  it("requires a current operator-delegated Luna-sample-accepted commentary quality audit", () => {
    const auditPath = `wiki/commentary-audits/${DIALOGUE}.json`;
    const pending = JSON.parse(read(auditPath)) as Record<string, unknown>;
    pending.acceptance = {
      decision: "pending",
      reviewer: null,
      reviewed_on: null,
      rationale: null,
      sampled_commentary_ids: [],
      review_note: null,
    };
    writeJson(auditPath, pending);
    expect(
      codes(
        validateAudioScriptArtifact(
          `audio/scripts/${DIALOGUE}.json`,
          JSON.stringify(script()),
        ),
      ),
    ).toContain("acceptance_gate_failure");

    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
    write("docs/commentary-protocol.md", driftedCommentaryProtocolFixture("Changed after acceptance."));
    expect(
      codes(
        validateAudioScriptArtifact(
          `audio/scripts/${DIALOGUE}.json`,
          JSON.stringify(script()),
        ),
      ),
    ).toContain("invalid_reference");
  });

  it("retains the exact accepted speaker-attribution byte binding", () => {
    const value = script();
    const attributionPath = `audio/speaker-attributions/${DIALOGUE}.json`;
    const attribution = JSON.parse(read(attributionPath)) as Record<string, unknown>;
    attribution.reviewer = "different-reviewer";
    writeJson(attributionPath, attribution);

    expect(
      codes(
        validateAudioScriptArtifact(
          `audio/scripts/${DIALOGUE}.json`,
          JSON.stringify(value),
        ),
      ),
    ).toContain("hash_mismatch");
  });

  it("rejects accepted attribution that allows a reported character to switch voices", () => {
    const attributionPath = `audio/speaker-attributions/${DIALOGUE}.json`;
    const attribution = JSON.parse(read(attributionPath)) as Record<string, unknown>;
    attribution.voice_policy = "reported-character-switches-voice";
    writeJson(attributionPath, attribution);
    const value = script();

    expect(
      codes(
        validateAudioScriptArtifact(
          `audio/scripts/${DIALOGUE}.json`,
          JSON.stringify(value),
        ),
      ),
    ).toContain("invalid_reference");
  });

  it("rejects unknown fields, noncanonical paths, duplicate ids, and implicit anchor shapes", () => {
    const value = script() as AudioScript & { fallback_voice?: string };
    value.fallback_voice = "speaker";
    value.entries[1]!.id = value.entries[0]!.id;
    sourceEntry(value).anchor = { commentary_id: COMMENTARY_ID };
    const unknownResult = validateAudioScript("audio/scripts/not-fixture.json", JSON.stringify(value));
    delete value.fallback_voice;
    const semanticResult = validateAudioScript("audio/scripts/not-fixture.json", JSON.stringify(value));

    expect(codes(unknownResult)).toContain("unknown_field");
    expect(codes(semanticResult)).toContain("dialogue_mismatch");
    expect(codes(semanticResult)).toContain("duplicate_id");
    expect(codes(semanticResult)).toContain("invalid_reference");
  });

  it("cross-checks source, commentary, cast, anchors, and deterministic coverage", () => {
    const value = script();
    value.source_hashes.english = HASH;
    value.commentary_sha256 = HASH;
    sourceEntry(value).anchor = { stephanus: "9z" };
    sourceEntry(value).character_id = "uncast-role";
    commentaryEntry(value).text = "Changed commentary.";
    value.coverage.source_words = 99;
    const result = validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value));

    expect(codes(result)).toContain("hash_mismatch");
    expect(codes(result)).toContain("invalid_reference");
    expect(codes(result)).toContain("cast_resolution_failure");
    expect(codes(result)).toContain("commentary_coverage_failure");
    expect(codes(result)).toContain("source_coverage_failure");
  });

  it("forbids reported-only characters from owning a screenplay voice", () => {
    const catalog = characters();
    catalog.dialogues[0]!.characterIds.push("quoted-person");
    catalog.characters.push({
      characterId: "quoted-person",
      displayName: "Quoted Person",
      identityStatus: "resolved",
      aliases: ["Quoted Person"],
      appearances: [
        {
          dialogue: DIALOGUE,
          editorialStatus: "resolved",
          performanceRole: "reported-only",
          roleFlags: ["reported-speaker"],
          sourceLabels: [],
          sourceAliases: [],
          sourceAttributions: [],
          editorialNote: "Quoted inside the active character's turn.",
        },
      ],
    });
    writeJson("audio/characters.json", catalog);
    const value = script();
    sourceEntry(value).character_id = "quoted-person";

    const result = validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value));
    expect(codes(result)).toContain("cast_resolution_failure");
    expect(result.some((issue) => issue.message.includes("must inherit the active character's voice"))).toBe(true);
  });

  it("binds ordered source entries to every normalized canonical English character", () => {
    const variants = [
      { label: "omission", text: "Hello.", sourceWords: 1 },
      { label: "duplication", text: "Hello Socrates. Socrates.", sourceWords: 3 },
      { label: "reordering", text: "Socrates Hello.", sourceWords: 2 },
      { label: "invention", text: "Hello Plato.", sourceWords: 2 },
    ];

    for (const variant of variants) {
      const value = script();
      sourceEntry(value).text = variant.text;
      value.coverage.source_words = variant.sourceWords;
      value.coverage.source_words_covered = variant.sourceWords;
      const result = validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value));
      expect(codes(result), variant.label).toContain("source_coverage_failure");
      expect(result.some((issue) => issue.message.includes("Ordered source entries must equal")), variant.label).toBe(true);
    }
  });

  it("applies a verified repair once before exact source reconstruction", () => {
    const value = script();
    sourceEntry(value).text = "Hullo Socrates.";
    value.repairs = [
      { id: "repair-1", old_text: "Hello", new_text: "Hullo", reason: "Pinned source repair", occurrence_count: 1 },
    ];

    expect(validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value))).toEqual([]);
  });

  it("does not erase repeated reply prose while removing a catalog-backed speaker label", () => {
    const changedEnglish = "{1a} Speaker. Hello Socrates.\n{p} By all means.\n{p} By all means.\n";
    write(`raw/plato/english/${DIALOGUE}.txt`, changedEnglish);
    writeEnglishStephanusIndex(DIALOGUE);
    writeAcceptedCommentaryQualityAuditFixture({ root, dialogue: DIALOGUE });
    writeJson(`audio/speaker-attributions/${DIALOGUE}.json`, {
      schema_version: 2,
      voice_policy: "reported-speech-inherits-active-character-v1",
      dialogue: DIALOGUE,
      english_sha256: sha256(changedEnglish),
      status: "accepted",
      reviewer: "fixture-reviewer",
      reviewed_at: "2026-07-13",
      commentary_character_id: "speaker",
      segments: [
        {
          id: "turn-0001",
          start_char: 0,
          end_char: changedEnglish.length,
          character_id: "speaker",
        },
      ],
    });
    const value = script();
    sourceEntry(value).text = "Hello Socrates. By all means. By all means.";
    value.coverage.source_words = 8;
    value.coverage.source_words_covered = 8;

    expect(validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value))).toEqual([]);
  });

  it("uses full-source label context without erasing prose at a segment boundary", () => {
    const content = [
      "{1a} Speaker. Ask Socrates. Socrates. Continue.",
      "{1b} Clin. First answer.",
      "{1c} Clin.Second answer.",
    ].join("\n");
    const proseBoundary = content.indexOf("Socrates. Continue.");
    const firstMarkerEnd = content.indexOf("{1b}") + "{1b}".length;
    const secondMarkerEnd = content.indexOf("{1c}") + "{1c}".length;
    const segments = [
      { start_char: 0, end_char: proseBoundary },
      { start_char: proseBoundary, end_char: firstMarkerEnd },
      { start_char: firstMarkerEnd, end_char: secondMarkerEnd },
      { start_char: secondMarkerEnd, end_char: content.length },
    ];
    const issues: Parameters<typeof canonicalSpokenEnglishSegments>[4] = [];
    const spoken = canonicalSpokenEnglishSegments(
      content,
      segments,
      ["Clinias", "Socrates", "Speaker"],
      "raw/plato/english/fixture.txt",
      issues,
    );

    expect(issues).toEqual([]);
    expect(spoken).toEqual(["Ask Socrates.", "Socrates. Continue.", "First answer.", "Second answer."]);
    expect(spoken?.join(" ")).toBe("Ask Socrates. Socrates. Continue. First answer. Second answer.");
  });

  it("reconstructs the 11 accepted corpus plans that failed slice-local source preflight", () => {
    const characterPath = join(CORPUS_ROOT, "audio/characters.json");
    const characters = parseCharacterCatalog(characterPath, readFileSync(characterPath, "utf8"));

    for (const dialogue of SOURCE_GLOBAL_REGRESSION_DIALOGUES) {
      const englishPath = join(CORPUS_ROOT, `raw/plato/english/${dialogue}.txt`);
      const attributionPath = join(CORPUS_ROOT, `audio/speaker-attributions/${dialogue}.json`);
      const content = readFileSync(englishPath, "utf8");
      const plan = JSON.parse(readFileSync(attributionPath, "utf8")) as {
        segments: Array<{ start_char: number; end_char: number }>;
      };
      const characterNames = characterNamesForDialogue(characters, dialogue);
      const expectedIssues: Parameters<typeof canonicalSpokenEnglish>[4] = [];
      const segmentIssues: Parameters<typeof canonicalSpokenEnglishSegments>[4] = [];
      const expected = canonicalSpokenEnglish(content, [], characterNames, englishPath, expectedIssues);
      const spoken = canonicalSpokenEnglishSegments(
        content,
        plan.segments,
        characterNames,
        attributionPath,
        segmentIssues,
      );

      expect(expectedIssues, dialogue).toEqual([]);
      expect(segmentIssues, dialogue).toEqual([]);
      expect(spoken, dialogue).toBeDefined();
      expect(spoken?.join(" "), dialogue).toBe(expected);
    }
  });

  it("rejects overlapping repairs instead of relying on array order", () => {
    const value = script();
    value.repairs = [
      {
        id: "repair-phrase",
        old_text: "Socrates",
        new_text: "Sokrates",
        reason: "Pinned phrase repair",
        occurrence_count: 1,
      },
      {
        id: "repair-name",
        old_text: "rates",
        new_text: "rates!",
        reason: "Pinned name repair",
        occurrence_count: 1,
      },
    ];

    const result = validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value));
    expect(codes(result)).toContain("source_coverage_failure");
    expect(result.some((issue) => issue.message.includes("overlap"))).toBe(true);
  });

  it("fails closed on unknown canonical English brace metadata", () => {
    write(`raw/plato/english/${DIALOGUE}.txt`, "{1a} Speaker. Hello {mystery} Socrates.\n");
    writeEnglishStephanusIndex(DIALOGUE);
    const value = script();

    const result = validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value));
    expect(codes(result)).toContain("source_coverage_failure");
    expect(result.some((issue) => issue.message.includes("unsupported brace metadata"))).toBe(true);
  });

  it("verifies every enumerated transcription repair occurrence", () => {
    const value = script();
    value.repairs = [
      { id: "repair-1", old_text: "Hello", new_text: "Hullo", reason: "Pinned source repair", occurrence_count: 2 },
    ];

    expect(codes(validateAudioScriptArtifact(`audio/scripts/${DIALOGUE}.json`, JSON.stringify(value)))).toContain(
      "source_coverage_failure",
    );
  });

  it("accepts QA only when all production evidence and explicit acceptance pass", () => {
    const scriptContent = `${JSON.stringify(script(), null, 2)}\n`;
    write(`audio/scripts/${DIALOGUE}.json`, scriptContent);
    const report = qa(scriptContent);
    const content = JSON.stringify(report);

    expect(validateAudioQa(`audio/qa/${DIALOGUE}.json`, content)).toEqual([]);
    expect(validateAudioQaArtifact(`audio/qa/${DIALOGUE}.json`, content)).toEqual([]);
    expect(parseAudioQa(`audio/qa/${DIALOGUE}.json`, content).status).toBe("accepted");
  });

  it("accepts an explicit operator waiver without claiming listening occurred", () => {
    const scriptContent = `${JSON.stringify(script(), null, 2)}\n`;
    write(`audio/scripts/${DIALOGUE}.json`, scriptContent);
    const report = qa(scriptContent);
    report.listening_review = {
      status: "not-performed",
      passed: false,
      reviewer: null,
      reviewed_at: null,
      scope: "none",
      chapter_ids: [],
      disposition: "not-performed",
      findings: [],
    };
    report.production_acceptance = {
      ...report.production_acceptance,
      basis: "operator-authorized-mechanical-and-asr-waiver",
      authorized_by: "cjpher",
      rationale: "The operator accepts this mechanically and ASR passing production without complete-master listening.",
      disposition: "accepted-with-listening-waiver",
    };
    report.chapters[0]!.listening_disposition = "not-performed";
    report.chapters[0]!.listening_passed = false;

    expect(validateAudioQa(`audio/qa/${DIALOGUE}.json`, JSON.stringify(report))).toEqual([]);
    expect(validateAudioQaArtifact(`audio/qa/${DIALOGUE}.json`, JSON.stringify(report))).toEqual([]);

    const contradictory = structuredClone(report);
    contradictory.listening_review.passed = true;
    expect(codes(validateAudioQa(`audio/qa/${DIALOGUE}.json`, JSON.stringify(contradictory)))).toContain(
      "invalid_shape",
    );

    const failedMechanicalGate = structuredClone(report);
    failedMechanicalGate.audio.clipped_samples = 1;
    failedMechanicalGate.chapters[0]!.clipped_samples = 1;
    failedMechanicalGate.chapters[0]!.clipping_passed = false;
    expect(codes(validateAudioQa(`audio/qa/${DIALOGUE}.json`, JSON.stringify(failedMechanicalGate)))).toContain(
      "acceptance_gate_failure",
    );
  });

  it("makes accepted QA conjunctive across every required gate", () => {
    const scriptContent = `${JSON.stringify(script(), null, 2)}\n`;
    const base = qa(scriptContent);
    const variants: AudioQaReport[] = [];

    const source = structuredClone(base);
    source.source_coverage.passed = false;
    source.source_coverage.covered_words = 1;
    source.source_coverage.uncovered_words = 1;
    source.chapters[0]!.source_words_covered = 1;
    source.chapters[0]!.source_words_uncovered = 1;
    source.chapters[0]!.source_coverage_passed = false;
    variants.push(source);

    const commentary = structuredClone(base);
    commentary.commentary_coverage.passed = false;
    commentary.commentary_coverage.covered_ids = [];
    commentary.commentary_coverage.missing_ids = [COMMENTARY_ID];
    commentary.chapters[0]!.commentary_ids_covered = [];
    commentary.chapters[0]!.commentary_coverage_passed = false;
    variants.push(commentary);

    const asr = structuredClone(base);
    asr.asr.passed = false;
    asr.asr.word_errors = 1;
    asr.asr.word_error_rate = 0.2;
    asr.asr.exceptions = [
      { expected: "Socrates", recognized: "Socrates'", occurrences: 1, classification: "proper-name", reviewed: true },
    ];
    asr.chapters[0]!.asr_word_errors = 1;
    asr.chapters[0]!.asr_word_error_rate = 0.2;
    asr.chapters[0]!.asr_passed = false;
    variants.push(asr);

    const silence = structuredClone(base);
    silence.audio.silence.max_observed_ms = 900;
    silence.audio.silence.unexpected_segments = [
      { chapter_id: CHAPTER_ID, start_seconds: 1, end_seconds: 2, reason: "Unexpected gap" },
    ];
    silence.chapters[0]!.max_silence_ms = 900;
    silence.chapters[0]!.silence_passed = false;
    variants.push(silence);

    const clipping = structuredClone(base);
    clipping.audio.clipped_samples = 1;
    clipping.chapters[0]!.clipped_samples = 1;
    clipping.chapters[0]!.clipping_passed = false;
    variants.push(clipping);

    const loudness = structuredClone(base);
    loudness.audio.integrated_lufs = -17;
    loudness.chapters[0]!.integrated_lufs = -17;
    loudness.chapters[0]!.loudness_passed = false;
    variants.push(loudness);

    const cast = structuredClone(base);
    cast.cast_consistency.passed = false;
    cast.cast_consistency.selected_character_ids = [];
    cast.cast_consistency.unresolved_character_ids = ["speaker"];
    cast.chapters[0]!.unresolved_character_ids = ["speaker"];
    cast.chapters[0]!.cast_consistency_passed = false;
    variants.push(cast);

    const listening = structuredClone(base);
    listening.listening_review.passed = false;
    listening.listening_review.disposition = "rerender-required";
    listening.listening_review.findings = [
      { code: "cadence", severity: "failure", description: "Turn boundary is too long.", chapter_id: CHAPTER_ID },
    ];
    listening.chapters[0]!.listening_disposition = "rerender-required";
    listening.chapters[0]!.listening_passed = false;
    variants.push(listening);

    for (const report of variants) {
      expect(codes(validateAudioQa(`audio/qa/${DIALOGUE}.json`, JSON.stringify(report)))).toContain(
        "acceptance_gate_failure",
      );
    }
  });

  it("allows a rejected report to retain truthful failure measurements", () => {
    const report = qa("unused");
    report.status = "rejected";
    report.audio.clipped_samples = 4;
    report.listening_review.passed = false;
    report.listening_review.disposition = "rerender-required";
    report.listening_review.findings = [
      { code: "clipping", severity: "failure", description: "Four clipped samples." },
    ];
    report.chapters[0]!.clipping_passed = false;
    report.chapters[0]!.listening_passed = false;
    report.chapters[0]!.clipped_samples = 4;
    report.chapters[0]!.listening_disposition = "rerender-required";
    report.production_acceptance.passed = false;

    expect(validateAudioQa(`audio/qa/${DIALOGUE}.json`, JSON.stringify(report))).toEqual([]);
  });

  it("cross-checks QA screenplay, cast, chapter, character, commentary, and word evidence", () => {
    const scriptContent = `${JSON.stringify(script(), null, 2)}\n`;
    write(`audio/scripts/${DIALOGUE}.json`, scriptContent);
    const report = qa(scriptContent);
    report.script_sha256 = HASH;
    report.cast_sha256 = HASH;
    report.chapters[0]!.chapter_id = "unknown";
    report.listening_review.chapter_ids = ["unknown"];
    report.asr.expected_words = 6;
    const result = validateAudioQaArtifact(`audio/qa/${DIALOGUE}.json`, JSON.stringify(report));

    expect(codes(result)).toContain("hash_mismatch");
    expect(codes(result)).toContain("invalid_reference");
    expect(codes(result)).toContain("invalid_metric");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildAudioCoverageReport,
  renderAudioCoverageReport,
  validateAudioCoverageReport,
  writeAudioCoverageReport,
} from "./audio-coverage.js";
import { CAST_ACCEPTANCE_GATES } from "./audio-catalog.js";
import { buildCommentaryAuditBriefs } from "./commentary-audit.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_STAGE_EFFORT,
} from "./commentary-authoring.js";
import { writeEnglishStephanusIndex } from "./derived/stephanus.js";
import { setRepoRootForTesting } from "./paths.js";
import { writeMasteringEvidenceFixture } from "../test-support/mastering-evidence-fixture.js";
import {
  COMMENTARY_PROTOCOL_FIXTURE,
  driftedCommentaryProtocolFixture,
} from "../test-support/commentary-protocol-fixture.js";

const DIALOGUE = "fixture";
const RECORDING_ID = "recording_fixture_v1";
const HASH = "a".repeat(64);
const GREEK = "{1a} A short source.";

let root = "";
let restoreRepoRoot: (() => void) | undefined;
let previousArtifactRoot: string | undefined;

function write(path: string, content: string | Buffer) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content);
}

function writeJson(path: string, value: unknown) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function fileSha256(path: string) {
  return sha256(readFileSync(join(root, path), "utf8"));
}

function mp3Fixture(frameCount = 400) {
  const frameBytes = Math.floor((144 * 96_000) / 48_000);
  const frame = Buffer.alloc(frameBytes);
  frame.set([0xff, 0xfb, 0x74, 0xc0]);
  const bytes = Buffer.concat(Array.from({ length: frameCount }, () => frame));
  return { bytes, durationSeconds: (frameCount * 1152) / 48_000 };
}

function writeAcceptedCommentary() {
  write(
    `wiki/commentary/${DIALOGUE}.md`,
    `# Fixture Commentary

\`\`\`yaml
commentary_id: comm_fixture_0001
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
  start_char: 0
  end_char: ${GREEK.length}
  text_sha256: "${sha256(GREEK)}"
body: "A concise fixture note."
cites:
  observations: []
  claims: []
  relations: []
  dossiers: []
crossrefs: []
author: model
review_status: accepted
\`\`\`
`,
  );
}

function writeAcceptedQualityAudit() {
  const englishContent = readFileSync(join(root, `raw/plato/english/${DIALOGUE}.txt`), "utf8");
  writeJson(`audio/speaker-attributions/${DIALOGUE}.json`, {
    schema_version: 2,
    dialogue: DIALOGUE,
    english_sha256: sha256(englishContent),
    status: "accepted",
    segments: [{ id: "turn-0001", start_char: 0, end_char: englishContent.length, character_id: "speaker" }],
  });
  const [brief] = buildCommentaryAuditBriefs(DIALOGUE);
  if (!brief) throw new Error("fixture commentary audit brief missing");
  const output = {
    schema_version: 3,
    dialogue: DIALOGUE,
    unit_key: brief.unitKey,
    section_id: brief.sectionId,
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    unit_verdict: "pass",
    blocks: [
      {
        commentary_id: "comm_fixture_0001",
        disposition: "pass",
        issue_codes: [],
        checks: {
          evidence: { verdict: "pass" },
          placement: {
            verdict: "pass",
            hazard_codes: [],
          },
          listening: { verdict: "pass" },
        },
        rationale: "The concise section orientation earns its place in the recording.",
      },
    ],
  };
  const outputContent = `${JSON.stringify(output, null, 2)}\n`;
  const rationale = "The complete one-block Luna sample supports acceptance and the interruption improves orientation.";
  const notePath = "wiki/review/2026-07-13-commentary-quality-fixture.md";
  const note = [
    "# Fixture commentary quality acceptance",
    "",
    `dialogue: ${DIALOGUE}`,
    "decision: accepted",
    "reviewer: cjpher-delegated-luna-reviewer-fixture",
    "reviewed_on: 2026-07-13",
    `rationale: ${rationale}`,
    "review_basis: operator-delegated independent Luna sample review",
    "human_listening_or_review: none claimed",
    "sampled_commentary_ids:",
    "- comm_fixture_0001",
    "",
  ].join("\n");
  write(notePath, note);
  writeJson(`wiki/commentary-audits/${DIALOGUE}.json`, {
    schema_version: 1,
    dialogue: DIALOGUE,
    ledger: {
      path: `wiki/commentary/${DIALOGUE}.md`,
      sha256: fileSha256(`wiki/commentary/${DIALOGUE}.md`),
    },
    protocol: {
      path: "docs/commentary-protocol.md",
      sha256: fileSha256("docs/commentary-protocol.md"),
    },
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    units: [
      {
        unit_key: brief.unitKey,
        section_id: brief.sectionId,
        audit_brief_sha256: brief.sha256,
        output_path: `scratch/commentary/audits/${DIALOGUE}/${brief.unitKey}.json`,
        output_sha256: sha256(outputContent),
        output,
      },
    ],
    acceptance: {
      decision: "accepted",
      reviewer: "cjpher-delegated-luna-reviewer-fixture",
      reviewed_on: "2026-07-13",
      rationale,
      sampled_commentary_ids: ["comm_fixture_0001"],
      review_note: { path: notePath, sha256: sha256(note) },
    },
  });
}

function writeCompleteAudioEdition() {
  const publication = mp3Fixture();
  const publicationSha256 = createHash("sha256").update(publication.bytes).digest("hex");
  writeAcceptedQualityAudit();
  const census = {
    dialogues: [
      {
        dialogue: DIALOGUE,
        counts: { participants: 1, said_elements: 1, anomaly_records: 0 },
        participants: [{ labels: [{ raw_label: "Speaker" }] }],
        said_attributions: [{ raw_who: "#Speaker" }],
      },
      {
        dialogue: "unresolved-provenance",
        counts: { participants: 0, said_elements: 0, anomaly_records: 0 },
        participants: [],
        said_attributions: [],
      },
    ],
  };
  const censusContent = `${JSON.stringify(census, null, 2)}\n`;
  write("audio/english-tei-speaker-census.json", censusContent);
  writeJson("audio/characters.json", {
    schemaVersion: 3,
    // Keep the corpus catalog honestly partial while proving that this
    // dialogue's inventory and the globally required voice-owner cast can be
    // complete. The unresolved non-source identity needs no voice and keeps
    // this isolated fixture outside the repository's corpus-wide accepted
    // active-speaker policy.
    status: "partial",
    updatedAt: "2026-07-12",
    source: {
      path: "audio/english-tei-speaker-census.json",
      sha256: sha256(censusContent),
    },
    dialogues: [
      {
        dialogue: DIALOGUE,
        editorialStatus: "resolved",
        sourceParticipantCount: 1,
        sourceSaidElementCount: 1,
        sourceAnomalyCount: 0,
        characterIds: ["speaker"],
      },
      {
        dialogue: "unresolved-provenance",
        editorialStatus: "required",
        sourceParticipantCount: 0,
        sourceSaidElementCount: 0,
        sourceAnomalyCount: 0,
        characterIds: ["unresolved-figure"],
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
        characterId: "unresolved-figure",
        displayName: "Unresolved Figure",
        identityStatus: "editorial-required",
        aliases: ["Unresolved Figure"],
        appearances: [
          {
            dialogue: "unresolved-provenance",
            editorialStatus: "required",
            performanceRole: "reported-only",
            roleFlags: ["reported-speaker", "dream-figure"],
            sourceLabels: [],
            sourceAliases: [],
            sourceAttributions: [],
            editorialNote:
              "A deliberately unresolved non-source identity used to keep the isolated corpus fixture partial.",
          },
        ],
      },
    ],
  });
  writeJson("audio/reference-sources.json", {
    schemaVersion: 2,
    status: "source-pool",
    selectionPolicy: {
      automaticSelection: true,
      acceptancePolicy: "operator-authorized-deterministic-v1",
    },
    dialogues: [
      {
        dialogue: DIALOGUE,
        videos: [
          {
            videoId: "AAAAAAAAAAA",
            title: "Fixture reference",
            durationSeconds: 60,
            url: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
          },
        ],
      },
    ],
  });
  const referenceSourcesSha256 = fileSha256("audio/reference-sources.json");
  writeJson("audio/cast.json", {
    schemaVersion: 3,
    status: "complete",
    updatedAt: "2026-07-12",
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
          sourceRegistrySha256: referenceSourcesSha256,
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
          acceptedAt: "2026-07-12",
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
  });
  const castWithDecision = JSON.parse(
    readFileSync(join(root, "audio/cast.json"), "utf8"),
  ) as {
    voices: Array<{
      characterId: string;
      seed: number;
      reference: Record<string, unknown>;
      selection: {
        acceptedAt: string;
        candidateSelection: string;
        selectedRank: number;
        decisionPath: string;
        decisionSha256: string;
      };
    }>;
  };
  const castVoice = castWithDecision.voices[0]!;
  writeJson(castVoice.selection.decisionPath, {
    schemaVersion: 1,
    status: "accepted-deterministic-cast-decision",
    policy: "cast-auto-accept-v1",
    acceptedAt: castVoice.selection.acceptedAt,
    characterId: castVoice.characterId,
    sourceCharacterId: castVoice.reference.sourceCharacterId,
    candidateSelection: castVoice.selection.candidateSelection,
    rankingPolicy: "fixture-ranking",
    inputs: {},
    reference: castVoice.reference,
    gates: CAST_ACCEPTANCE_GATES,
    candidates: [],
    selectedSeed: castVoice.seed,
    selectedPassingRank: castVoice.selection.selectedRank,
    decisionContentSha256: HASH,
  });
  castVoice.selection.decisionSha256 = fileSha256(
    castVoice.selection.decisionPath,
  );
  writeJson("audio/cast.json", castWithDecision);
  const englishContent = readFileSync(join(root, `raw/plato/english/${DIALOGUE}.txt`), "utf8");
  const attributionPath = `audio/speaker-attributions/${DIALOGUE}.json`;
  writeJson(attributionPath, {
    schema_version: 2,
    dialogue: DIALOGUE,
    english_sha256: sha256(englishContent),
    voice_policy: "reported-speech-inherits-active-character-v1",
    status: "accepted",
    reviewer: "fixture-reviewer",
    reviewed_at: "2026-07-13",
    commentary_character_id: "speaker",
    segments: [
      {
        id: "turn-0001",
        start_char: 0,
        end_char: englishContent.length,
        character_id: "speaker",
      },
    ],
  });
  const screenplay = {
    schema_version: 2,
    dialogue: DIALOGUE,
    source_hashes: {
      english: fileSha256(`raw/plato/english/${DIALOGUE}.txt`),
      stephanus: fileSha256(`derived/plato/stephanus-english/${DIALOGUE}.toon`),
    },
    commentary_sha256: fileSha256(`wiki/commentary/${DIALOGUE}.md`),
    commentary_quality_audit_sha256: fileSha256(`wiki/commentary-audits/${DIALOGUE}.json`),
    cast_sha256: fileSha256("audio/cast.json"),
    generator_version: `screenplay-generator-v3+attribution.${fileSha256(attributionPath)}`,
    chapters: [{ id: "chapter-1", commentary_id: "comm_fixture_0001" }],
    entries: [
      {
        id: "fixture_0002",
        chapter_id: "chapter-1",
        character_id: "speaker",
        kind: "commentary",
        text: "A concise fixture note.",
        anchor: { commentary_id: "comm_fixture_0001" },
        cadence_intent: "commentary",
      },
      {
        id: "fixture_0001",
        chapter_id: "chapter-1",
        character_id: "speaker",
        kind: "source",
        text: "An English source.",
        anchor: { stephanus: "1a" },
        cadence_intent: "exchange",
      },
    ],
    repairs: [],
    coverage: {
      source_words: 3,
      source_words_covered: 3,
      source_words_uncovered: 0,
      source_words_duplicated: 0,
      commentary_blocks_expected: 1,
      commentary_blocks_covered: 1,
      commentary_blocks_missing: 0,
      commentary_blocks_duplicated: 0,
    },
  };
  writeJson(`audio/scripts/${DIALOGUE}.json`, screenplay);
  writeJson(`audio/qa/${DIALOGUE}.json`, {
    schema_version: 2,
    dialogue: DIALOGUE,
    status: "accepted",
    generated_at: "2026-07-13T04:00:00Z",
    script_sha256: fileSha256(`audio/scripts/${DIALOGUE}.json`),
    cast_sha256: fileSha256("audio/cast.json"),
    source_coverage: {
      passed: true,
      expected_words: 3,
      covered_words: 3,
      uncovered_words: 0,
      duplicated_words: 0,
      repairs_verified: true,
    },
    commentary_coverage: {
      passed: true,
      expected_ids: ["comm_fixture_0001"],
      covered_ids: ["comm_fixture_0001"],
      missing_ids: [],
      duplicate_ids: [],
    },
    asr: {
      passed: true,
      model_repository: "openai/whisper-small.en",
      model_revision: "c".repeat(40),
      max_word_error_rate: 0.02,
      max_ordinary_word_errors: 0,
      expected_words: 7,
      recognized_words: 7,
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
      duration_seconds: publication.durationSeconds,
      sample_rate_hz: 48000,
      channels: 1,
      sample_format: "PCM_24",
      target_lufs: -19,
      tolerance_lu: 1,
      integrated_lufs: -19,
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
      chapter_ids: ["chapter-1"],
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
      chapter_ids: ["chapter-1"],
      disposition: "accepted",
      findings: [],
    },
    chapters: [
      {
        chapter_id: "chapter-1",
        audio_path: "artifacts/recordings/fixture/chapter-1.wav",
        audio_sha256: HASH,
        duration_seconds: publication.durationSeconds,
        source_words_expected: 3,
        source_words_covered: 3,
        source_words_uncovered: 0,
        source_words_duplicated: 0,
        commentary_ids_expected: ["comm_fixture_0001"],
        commentary_ids_covered: ["comm_fixture_0001"],
        asr_expected_words: 7,
        asr_word_errors: 0,
        asr_ordinary_word_errors: 0,
        asr_word_error_rate: 0,
        max_silence_ms: 600,
        integrated_lufs: -19,
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
  });
  const artifactRoot = join(root, "recording-artifact-store");
  const evidence = writeMasteringEvidenceFixture({
    repoRoot: root,
    artifactRoot,
    dialogue: DIALOGUE,
    publicationBytes: publication.bytes,
    publicationDurationSeconds: publication.durationSeconds,
  });
  process.env.PLATO_RECORDING_ARTIFACT_ROOT = artifactRoot;
  writeJson(`wiki/recordings/${DIALOGUE}.json`, {
    schema_version: 2,
    recording_id: RECORDING_ID,
    dialogue: DIALOGUE,
    status: "accepted",
    production: evidence.production,
    audio: evidence.audio,
    chapters: evidence.chapters,
  });
  write(`site/assets/recordings/${DIALOGUE}/complete.mp3`, publication.bytes);
  write(
    `site/dialogues/${DIALOGUE}/reading.html`,
    `<section data-recording-player data-recording-acceptance-status="accepted" data-recording-id="${RECORDING_ID}" data-audio-sha256="${publicationSha256}">
  <p>Production recording</p>
  <p id="recording-status" role="status" aria-live="polite" data-recording-status>Ready.</p>
  <audio id="recording-audio" controls preload="metadata" data-recording-audio aria-describedby="recording-status"><source src="../../assets/recordings/fixture/complete.mp3" type="audio/mpeg"></audio>
  <div role="group" aria-label="Recording chapters"><button type="button" data-recording-chapter data-chapter-id="chapter-1" data-chapter-frame="0" data-chapter-seconds="0" data-chapter-target="comm_fixture_0001" aria-controls="recording-audio">Chapter</button></div>
</section>
<section id="comm_fixture_0001">Reading unit</section>`,
  );
}

function appendCharacter(character: Record<string, unknown>, sourceParticipantDelta = 0) {
  const path = "audio/characters.json";
  const catalog = JSON.parse(readFileSync(join(root, path), "utf8")) as {
    source: { sha256: string };
    dialogues: Array<{
      characterIds: string[];
      sourceParticipantCount: number;
      sourceSaidElementCount: number;
    }>;
    characters: Array<Record<string, unknown>>;
  };
  const characterId = character.characterId;
  if (typeof characterId !== "string") throw new Error("fixture characterId must be a string");
  catalog.dialogues[0]!.characterIds.push(characterId);
  catalog.dialogues[0]!.sourceParticipantCount += sourceParticipantDelta;
  if (sourceParticipantDelta > 0) {
    const [appearance] = character.appearances as Array<{
      sourceLabels: string[];
      sourceAttributions: string[];
    }>;
    if (!appearance) throw new Error("source participant fixture appearance missing");
    const censusPath = "audio/english-tei-speaker-census.json";
    const census = JSON.parse(readFileSync(join(root, censusPath), "utf8")) as {
      dialogues: Array<{
        dialogue: string;
        counts: { participants: number; said_elements: number };
        participants: Array<{ labels: Array<{ raw_label: string }> }>;
        said_attributions: Array<{ raw_who: string | null }>;
      }>;
    };
    const row = census.dialogues.find((entry) => entry.dialogue === DIALOGUE);
    if (!row) throw new Error("fixture census dialogue missing");
    row.counts.participants += sourceParticipantDelta;
    row.counts.said_elements += appearance.sourceAttributions.length;
    row.participants.push({
      labels: appearance.sourceLabels.map((raw_label) => ({ raw_label })),
    });
    row.said_attributions.push(
      ...appearance.sourceAttributions.map((raw_who) => ({ raw_who })),
    );
    const censusContent = `${JSON.stringify(census, null, 2)}\n`;
    write(censusPath, censusContent);
    catalog.source.sha256 = sha256(censusContent);
    catalog.dialogues[0]!.sourceSaidElementCount += appearance.sourceAttributions.length;
  }
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

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "audio-coverage-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  previousArtifactRoot = process.env.PLATO_RECORDING_ARTIFACT_ROOT;
  delete process.env.PLATO_RECORDING_ARTIFACT_ROOT;
  write(`raw/plato/greek/${DIALOGUE}.txt`, GREEK);
  write(`raw/plato/english/${DIALOGUE}.txt`, "{1a} An English source.");
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  writeEnglishStephanusIndex(DIALOGUE);
});

afterEach(() => {
  restoreRepoRoot?.();
  if (previousArtifactRoot === undefined) delete process.env.PLATO_RECORDING_ARTIFACT_ROOT;
  else process.env.PLATO_RECORDING_ARTIFACT_ROOT = previousArtifactRoot;
  rmSync(root, { recursive: true, force: true });
});

describe("audio edition coverage", () => {
  it("counts unknown character and cast requirements as missing", () => {
    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;

    expect(report.summary).toMatchObject({
      dialogues: 1,
      englishSpines: 1,
      acceptedCommentaryLedgers: 0,
      commentaryQualityAuditsPassed: 0,
      completeCharacterInventories: 0,
      unknownCharacterRequirements: 1,
      unknownCastRequirements: 1,
      missing: 8,
    });
    expect(dialogue?.characters).toMatchObject({ unknownRequirement: true, complete: false });
    expect(dialogue?.cast).toMatchObject({ unknownRequirement: true, complete: false });
  });

  it("reports rejected commentary separately without counting it as pending production work", () => {
    writeAcceptedCommentary();
    const ledgerPath = `wiki/commentary/${DIALOGUE}.md`;
    const ledger = readFileSync(join(root, ledgerPath), "utf8");
    write(
      ledgerPath,
      `${ledger}
\`\`\`yaml
commentary_id: comm_fixture_0002
source_work: Fixture
block_kind: notice
placement: after
stephanus_span: 1a
source_ref:
  source_path: raw/plato/greek/fixture.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: 0
  end_char: ${GREEK.length}
  text_sha256: "${sha256(GREEK)}"
audio_insertion:
  attribution_path: audio/speaker-attributions/fixture.json
  attribution_sha256: "${"0".repeat(64)}"
  english_sha256: "${"0".repeat(64)}"
  turn_id: retired-turn
  edge: after
body: "Rejected historical prose retained only for provenance."
cites:
  observations: []
  claims: []
  relations: []
  dossiers: []
crossrefs: []
author: model
review_status: rejected
\`\`\`
`,
    );

    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;
    expect(dialogue?.commentary).toMatchObject({
      blockCount: 2,
      statuses: { accepted: 1, rejected: 1, unreviewed: 0, needsSplit: 0, other: 0 },
      validationIssueCount: 0,
      accepted: true,
    });
    expect(report.summary.acceptedCommentaryLedgers).toBe(1);
    expect(renderAudioCoverageReport(report)).toContain("1/1 active; 1 rejected");
  });

  it("requires the English index hash to match the exact source", () => {
    write(`raw/plato/english/${DIALOGUE}.txt`, "{1a} Changed after indexing.");

    const [dialogue] = buildAudioCoverageReport().dialogues;

    expect(dialogue?.english).toMatchObject({ sourcePresent: true, indexPresent: true, indexMatchesSource: false, complete: false });
  });

  it("reports a fully evidenced dialogue with no missing cells", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();

    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;

    expect(report.summary).toEqual({
      dialogues: 1,
      englishSpines: 1,
      acceptedCommentaryLedgers: 1,
      commentaryQualityAuditsPassed: 1,
      completeCharacterInventories: 1,
      unknownCharacterRequirements: 0,
      unresolvedCharacters: 0,
      completeCasts: 1,
      unknownCastRequirements: 0,
      unselectedCastRoles: 0,
      screenplays: 1,
      audioQaPassed: 1,
      productionRecordings: 1,
      websiteAudioLinks: 1,
      missing: 0,
    });
    expect(dialogue?.missing).toEqual([]);
    expect(dialogue?.commentary).toMatchObject({ blockCount: 1, validationIssueCount: 0, accepted: true });
    expect(dialogue?.qualityAudit).toMatchObject({ acceptanceDecision: "accepted", validationIssueCount: 0, passed: true });
    expect(dialogue?.screenplay).toMatchObject({ validationIssueCount: 0, complete: true });
    expect(dialogue?.qa).toMatchObject({ validationIssueCount: 0, passed: true });
    expect(dialogue?.recording).toMatchObject({ validationIssueCount: 0, accepted: true });
    expect(dialogue?.website.linked).toBe(true);
  });

  it("keeps an accepted commentary ledger out of production-ready writing until its delegated Luna sample audit passes", () => {
    writeAcceptedCommentary();

    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;

    expect(report.summary).toMatchObject({
      acceptedCommentaryLedgers: 1,
      commentaryQualityAuditsPassed: 0,
    });
    expect(dialogue?.commentary.accepted).toBe(true);
    expect(dialogue?.qualityAudit).toMatchObject({ present: false, passed: false });
    expect(dialogue?.missing).toContain("quality_audit");
  });

  it("revokes writing-audit credit when its bound protocol hash becomes stale", () => {
    writeAcceptedCommentary();
    writeAcceptedQualityAudit();
    write("docs/commentary-protocol.md", driftedCommentaryProtocolFixture("Changed after human acceptance."));

    const [dialogue] = buildAudioCoverageReport().dialogues;

    expect(dialogue?.commentary.accepted).toBe(true);
    expect(dialogue?.qualityAudit).toMatchObject({ present: true, passed: false });
    expect(dialogue?.qualityAudit.validationIssueCount).toBeGreaterThan(0);
    expect(dialogue?.missing).toContain("quality_audit");
  });

  it("does not grant publication credit when the manifest is detached from accepted QA", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();
    const path = `wiki/recordings/${DIALOGUE}.json`;
    const manifest = JSON.parse(readFileSync(join(root, path), "utf8")) as {
      production: { qa_sha256: string };
    };
    manifest.production.qa_sha256 = "f".repeat(64);
    writeJson(path, manifest);

    const [dialogue] = buildAudioCoverageReport().dialogues;
    expect(dialogue?.qa.passed).toBe(true);
    expect(dialogue?.recording).toMatchObject({ accepted: false });
    expect(dialogue?.recording.validationIssueCount).toBeGreaterThan(0);
  });

  it("does not grant website credit to stale player metadata or stale generated MP3 bytes", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();
    const readingPath = `site/dialogues/${DIALOGUE}/reading.html`;
    const reading = readFileSync(join(root, readingPath), "utf8");
    write(readingPath, reading.replace(/data-audio-sha256="[a-f0-9]{64}"/u, `data-audio-sha256="${"f".repeat(64)}"`));

    let report = buildAudioCoverageReport();
    expect(report.summary).toMatchObject({ productionRecordings: 1, websiteAudioLinks: 0 });
    expect(report.dialogues[0]?.website).toMatchObject({ strictValidationPassed: false, linked: false });
    expect(report.dialogues[0]?.missing).toContain("website");

    write(readingPath, reading);
    write(`site/assets/recordings/${DIALOGUE}/complete.mp3`, Buffer.from("stale generated bytes"));
    report = buildAudioCoverageReport();
    expect(report.summary).toMatchObject({ productionRecordings: 1, websiteAudioLinks: 0 });
    expect(report.dialogues[0]?.website.strictValidationPassed).toBe(false);
  });

  it("does not grant completion credit to invalid character or cast catalogs", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();
    const characters = JSON.parse(readFileSync(join(root, "audio/characters.json"), "utf8")) as Record<string, unknown>;
    characters.source = { path: "audio/english-tei-speaker-census.json", sha256: "invalid" };
    writeJson("audio/characters.json", characters);

    const [dialogue] = buildAudioCoverageReport().dialogues;

    expect(dialogue?.characters.validationIssueCount).toBeGreaterThan(0);
    expect(dialogue?.characters.complete).toBe(false);
    expect(dialogue?.cast.complete).toBe(false);
  });

  it("keeps unresolved reported-only appearances in character coverage without invalidating the selected cast", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();
    addReportedOnlyCharacter();
    const characters = JSON.parse(readFileSync(join(root, "audio/characters.json"), "utf8")) as {
      status: string;
      dialogues: Array<{ editorialStatus: string }>;
      characters: Array<{
        characterId: string;
        appearances: Array<{ editorialStatus: string }>;
      }>;
    };
    characters.status = "partial";
    characters.dialogues[0]!.editorialStatus = "required";
    const reportedOnly = characters.characters.find(
      (character) => character.characterId === "dream-woman",
    );
    if (!reportedOnly) throw new Error("reported-only fixture character missing");
    reportedOnly.appearances[0]!.editorialStatus = "required";
    writeJson("audio/characters.json", characters);

    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;

    expect(dialogue?.characters).toMatchObject({
      validationIssueCount: 0,
      canonicalCount: 2,
      unresolvedCharacterIds: ["dream-woman"],
      complete: false,
    });
    expect(dialogue?.cast).toMatchObject({
      validationIssueCount: 0,
      selectedRoleCount: 1,
      unselectedCharacterIds: [],
      reportedOnlyCharacterIds: ["dream-woman"],
      complete: true,
    });
    expect(report.summary).toMatchObject({
      completeCharacterInventories: 0,
      unresolvedCharacters: 1,
      completeCasts: 1,
    });
  });

  it("keeps reported-only identities in the textual inventory but out of cast and screenplay requirements", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();
    addReportedOnlyCharacter();

    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;

    expect(dialogue?.characters).toMatchObject({ canonicalCount: 2, complete: true });
    expect(dialogue?.cast).toMatchObject({
      requiredRoleCount: 1,
      selectedRoleCount: 1,
      unselectedCharacterIds: [],
      reportedOnlyCharacterIds: ["dream-woman"],
      reviewRequiredCharacterIds: [],
      unknownRequirement: false,
      complete: true,
    });
    expect(dialogue?.screenplay).toMatchObject({
      characterIds: ["speaker"],
      nonVoiceOwnerCharacterIds: [],
      complete: true,
    });
    expect(report.summary).toMatchObject({ completeCasts: 1, unselectedCastRoles: 0 });
  });

  it("makes cast scope unknown while a source identity requires voice-ownership review", () => {
    writeAcceptedCommentary();
    writeCompleteAudioEdition();
    addReviewRequiredCharacter();

    const report = buildAudioCoverageReport();
    const [dialogue] = report.dialogues;

    expect(dialogue?.characters).toMatchObject({ canonicalCount: 2, complete: true });
    expect(dialogue?.cast).toMatchObject({
      requiredRoleCount: null,
      selectedRoleCount: 1,
      unselectedCharacterIds: [],
      reportedOnlyCharacterIds: [],
      reviewRequiredCharacterIds: ["ambiguous-speaker"],
      unknownRequirement: true,
      complete: false,
    });
    expect(report.summary).toMatchObject({
      completeCasts: 0,
      unknownCastRequirements: 1,
      unselectedCastRoles: 0,
    });
    expect(renderAudioCoverageReport(report)).toContain("1 voice ownership review required");
  });

  it("never grants completion credit to scratch prototypes", () => {
    writeJson("scratch/fixture-audio/script.json", [{ speaker: "Speaker", text: "Hello." }]);
    write("scratch/fixture-audio/fixture-complete.mp3", "prototype");

    const [dialogue] = buildAudioCoverageReport().dialogues;

    expect(dialogue?.screenplay.present).toBe(false);
    expect(dialogue?.recording.present).toBe(false);
    expect(dialogue?.qa.present).toBe(false);
  });

  it("renders and writes deterministic Markdown only when requested", () => {
    const before = buildAudioCoverageReport();
    expect(readFileSync(join(root, "raw/plato/greek/fixture.txt"), "utf8")).toBe(GREEK);
    expect(() => readFileSync(join(root, "audio/coverage.md"), "utf8")).toThrow();

    const written = writeAudioCoverageReport();
    const content = readFileSync(join(root, written.path), "utf8");

    expect(written.path).toBe("audio/coverage.md");
    expect(content).toBe(renderAudioCoverageReport(before));
    expect(content).toContain("missing: 8");
    expect(content).toContain("commentary_quality_audits_passed: 0");
    expect(content).toContain("Scratch prototypes are intentionally excluded.");
    expect(validateAudioCoverageReport()).toEqual([]);

    write("audio/coverage.md", `${content}\nStale manual edit.\n`);
    expect(validateAudioCoverageReport()).toEqual([
      {
        path: "audio/coverage.md",
        message: "Audio coverage report is stale; regenerate it with `bun run harness audio coverage --write`.",
      },
    ]);
  });
});

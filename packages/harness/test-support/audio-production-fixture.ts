import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CAST_ACCEPTANCE_GATES } from "../src/audio-catalog.js";
import { buildCommentaryAuditSampleJob } from "../src/commentary-audit-sample-campaign.js";
import {
  COMMENTARY_CODEX_CLI_VERSION,
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_MODEL_CATALOG_PATH,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "../src/commentary-authoring.js";
import { buildCommentaryCampaignManifest } from "../src/commentary-campaign.js";
import { writeEnglishStephanusIndex } from "../src/derived/stephanus.js";
import { commentaryMarkdownBlocks } from "../src/wiki/commentary-ledger.js";
import { applyCommentaryQualityAuditAcceptance } from "../src/wiki/commentary-quality-audit-acceptance.js";
import { writeCommentaryQualityAuditManifestPreview } from "../src/wiki/commentary-quality-audit.js";
import { fieldValue } from "../src/wiki/observation-ledger.js";
import { COMMENTARY_PROTOCOL_FIXTURE } from "./commentary-protocol-fixture.js";

const HASH = "a".repeat(64);

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function wordCount(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function writeText(root: string, path: string, content: string) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function writeJson(root: string, path: string, value: unknown) {
  writeText(root, path, `${JSON.stringify(value, null, 2)}\n`);
}

function passingAuditChecks() {
  return {
    evidence: { verdict: "pass" },
    placement: {
      verdict: "pass",
      hazard_codes: [],
    },
    listening: { verdict: "pass" },
  };
}

function codexSuccessJsonl(structuredOutput: unknown, usage: Record<string, number>) {
  return [
    JSON.stringify({ type: "thread.started", thread_id: "thread_audio_production_fixture" }),
    JSON.stringify({ type: "turn.started" }),
    JSON.stringify({
      type: "item.completed",
      item: { id: "item_audio_production_fixture", type: "agent_message", text: JSON.stringify(structuredOutput) },
    }),
    JSON.stringify({ type: "turn.completed", usage }),
  ].join("\n");
}

function clearAcceptedCommentaryQualityAuditFixture(root: string, dialogue: string) {
  for (const path of [
    `wiki/commentary-audits/${dialogue}.json`,
    `wiki/review/2026-07-13-commentary-quality-${dialogue}-luna-sample.md`,
    `wiki/submissions/commentary-audit-sample/${dialogue}`,
  ]) {
    rmSync(join(root, path), { recursive: true, force: true });
  }
}

export function writeAcceptedCommentaryQualityAuditFixture({
  root,
  dialogue,
  auditRationaleByCommentaryId = {},
}: {
  root: string;
  dialogue: string;
  auditRationaleByCommentaryId?: Readonly<Record<string, string>>;
}) {
  const protocolPath = "docs/commentary-protocol.md";
  const protocolAbsolutePath = join(root, protocolPath);
  if (!existsSync(protocolAbsolutePath)) {
    mkdirSync(join(protocolAbsolutePath, ".."), { recursive: true });
    writeFileSync(protocolAbsolutePath, COMMENTARY_PROTOCOL_FIXTURE, "utf8");
  }
  const modelCatalogAbsolutePath = join(root, COMMENTARY_MODEL_CATALOG_PATH);
  mkdirSync(join(modelCatalogAbsolutePath, ".."), { recursive: true });
  writeFileSync(
    modelCatalogAbsolutePath,
    readFileSync(join(import.meta.dir, "../src/commentary-luna-model-catalog.json"), "utf8"),
    "utf8",
  );
  const auditJobs = buildCommentaryCampaignManifest({ dialogue, stage: "audit" }).jobs;
  if (auditJobs.length === 0) throw new Error(`Fixture quality audit for ${dialogue} requires at least one section.`);
  for (const job of auditJobs) {
    if (!job.unit_key || !job.section_id || !job.commentary_ids || job.commentary_ids.length === 0) {
      throw new Error(`Fixture quality-audit job ${job.job_id} lacks one exact audit unit.`);
    }
    const output = {
      schema_version: 3,
      dialogue,
      unit_key: job.unit_key,
      section_id: job.section_id,
      authoring: {
        model: COMMENTARY_AUTHORING_MODEL,
        effort: COMMENTARY_STAGE_EFFORT.audit,
      },
      unit_verdict: "pass",
      blocks: job.commentary_ids.map((commentaryId) => ({
        commentary_id: commentaryId,
        disposition: "pass",
        issue_codes: [],
        checks: passingAuditChecks(),
        rationale: auditRationaleByCommentaryId[commentaryId] ??
          "The block earns its place in the listening sequence.",
      })),
    };
    const outputContent = `${JSON.stringify(output, null, 2)}\n`;
    writeText(root, job.output_path, outputContent);
    writeJson(root, job.state_path, {
      schema_version: 3,
      job_id: job.job_id,
      stage: "audit",
      input_sha256: job.input_sha256,
      output_schema_sha256: job.output_schema_sha256,
      model_argument: COMMENTARY_MODEL_ARGUMENT,
      codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
      model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
      model_catalog_sha256: job.model_catalog_sha256,
      authoring_model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
      permission_mode: COMMENTARY_PERMISSION_MODE,
      output_path: job.output_path,
      output_sha256: sha256(outputContent),
    });
  }
  const pending = writeCommentaryQualityAuditManifestPreview(dialogue);
  const pendingManifestContent = `${JSON.stringify(pending.manifest, null, 2)}\n`;
  const sampleJob = buildCommentaryAuditSampleJob({
    manifest: pending.manifest,
    pendingManifestContent,
  });
  const rationale = "The required fixture sample supports acceptance of the bounded audit output.";
  const review = {
    schema_version: 1,
    dialogue,
    reviewer: {
      id: sampleJob.reviewer_id,
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    pending_manifest_sha256: sampleJob.pending_manifest_sha256,
    sample_packet_sha256: sampleJob.packet_sha256,
    sampled_commentary_ids: [...sampleJob.sampled_commentary_ids],
    sample_verdict: "pass",
    blocks: sampleJob.sampled_commentary_ids.map((commentaryId) => ({
      commentary_id: commentaryId,
      verdict: "pass",
      rationale: "The exact source, evidence, placement, and spoken-audio checks pass.",
    })),
    rationale,
  } as const;
  const outputContent = `${JSON.stringify(review, null, 2)}\n`;
  const usage = {
    input_tokens: 120,
    cached_input_tokens: 80,
    cache_write_input_tokens: 4,
    output_tokens: 30,
    reasoning_output_tokens: 12,
  };
  const executionContent = codexSuccessJsonl(review, usage);
  writeJson(root, sampleJob.output_schema_path, sampleJob.output_schema);
  writeText(root, sampleJob.packet_path, sampleJob.packet_content);
  writeText(root, sampleJob.output_path, outputContent);
  writeText(root, sampleJob.execution_path, executionContent);
  writeJson(root, sampleJob.state_path, {
    schema_version: 1,
    campaign: "plato-commentary-independent-luna-sample",
    job_id: sampleJob.job_id,
    dialogue: sampleJob.dialogue,
    reviewer_id: sampleJob.reviewer_id,
    input_sha256: sampleJob.input_sha256,
    pending_manifest_sha256: sampleJob.pending_manifest_sha256,
    pending_manifest_path: sampleJob.pending_manifest_path,
    sample_packet_path: sampleJob.packet_path,
    sample_packet_sha256: sampleJob.packet_sha256,
    output_schema_path: sampleJob.output_schema_path,
    output_schema_sha256: sampleJob.output_schema_sha256,
    model_catalog_path: sampleJob.model_catalog_path,
    model_catalog_sha256: sampleJob.model_catalog_sha256,
    prompt_sha256: sampleJob.prompt_sha256,
    model: COMMENTARY_AUTHORING_MODEL,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    output_path: sampleJob.output_path,
    output_sha256: sha256(outputContent),
    execution_path: sampleJob.execution_path,
    execution_sha256: sha256(executionContent),
    sample_verdict: "pass",
    usage,
  });
  clearAcceptedCommentaryQualityAuditFixture(root, dialogue);
  const applied = applyCommentaryQualityAuditAcceptance({
    dialogue,
    reviewer: sampleJob.reviewer_id,
    reviewedOn: "2026-07-13",
    rationale,
    sampledCommentaryIds: [...sampleJob.sampled_commentary_ids],
    sampleOutputPath: sampleJob.output_path,
  });
  return {
    path: applied.manifestPath,
    sha256: sha256(readFileSync(join(root, applied.manifestPath), "utf8")),
  };
}

export function writeAcceptedAudioProductionFixture({
  root,
  dialogue,
  marker,
  sourceText,
  durationSeconds,
}: {
  root: string;
  dialogue: string;
  marker: string;
  sourceText: string;
  durationSeconds: number;
}) {
  writeEnglishStephanusIndex(dialogue);
  const commentaryPath = `wiki/commentary/${dialogue}.md`;
  const commentaryContent = readFileSync(join(root, commentaryPath), "utf8");
  const commentary = commentaryMarkdownBlocks(commentaryContent).map((block) => ({
    id: fieldValue(block.content, "commentary_id") ?? "",
    kind: fieldValue(block.content, "block_kind") ?? "",
    placement: fieldValue(block.content, "placement") ?? "",
    title: fieldValue(block.content, "title") ?? "",
    body: fieldValue(block.content, "body") ?? "",
    status: fieldValue(block.content, "review_status") ?? "",
  }));
  const pendingCommentary = commentary.filter(
    (block) => block.status !== "accepted" && block.status !== "rejected",
  );
  const acceptedCommentary = commentary.filter((block) => block.status === "accepted");
  if (
    acceptedCommentary.length === 0 ||
    pendingCommentary.length > 0 ||
    commentary.some((block) => !block.id || !block.kind || !block.body)
  ) {
    throw new Error(
      `Fixture commentary for ${dialogue} must contain accepted blocks, allow only terminal rejected exclusions, and have no pending blocks.`,
    );
  }

  const commentaryForPlayback = acceptedCommentary;
  const sections = commentaryForPlayback.filter((block) => block.kind === "section");
  if (sections.length !== 1) {
    throw new Error(`Fixture production helper currently requires exactly one section for ${dialogue}.`);
  }
  const chapterId = "chapter-1";
  const commentaryIds = commentaryForPlayback.map((block) => block.id).sort((a, b) => a.localeCompare(b));
  const sourceWords = wordCount(sourceText);
  const commentaryWords = commentaryForPlayback.reduce((sum, block) => sum + wordCount(block.body), 0);
  const commentaryQualityAudit = writeAcceptedCommentaryQualityAuditFixture({ root, dialogue });

  writeJson(root, "audio/characters.json", {
    schemaVersion: 3,
    status: "complete",
    updatedAt: "2026-07-13",
    source: { path: "audio/english-tei-speaker-census.json", sha256: HASH },
    dialogues: [
      {
        dialogue,
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
            dialogue,
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
  });
  writeJson(root, "audio/reference-sources.json", {
    schemaVersion: 2,
    status: "source-pool",
    selectionPolicy: {
      automaticSelection: true,
      acceptancePolicy: "operator-authorized-deterministic-v1",
    },
    dialogues: [
      {
        dialogue,
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
  const referenceSourcesSha256 = sha256(
    readFileSync(join(root, "audio/reference-sources.json"), "utf8"),
  );
  writeJson(root, "audio/cast.json", {
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
          sourceRegistrySha256: referenceSourcesSha256,
          sourceDialogue: dialogue,
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
  });

  const screenplayPath = `audio/scripts/${dialogue}.json`;
  const englishContent = readFileSync(join(root, `raw/plato/english/${dialogue}.txt`), "utf8");
  const attributionPath = `audio/speaker-attributions/${dialogue}.json`;
  writeJson(root, attributionPath, {
    schema_version: 2,
    dialogue,
    english_sha256: sha256(englishContent),
    voice_policy: "reported-speech-inherits-active-character-v1",
    status: "accepted",
    reviewer: "fixture-reviewer",
    reviewed_at: "2026-07-13",
    commentary_character_id: "speaker",
    segments: [{ id: "turn-0001", start_char: 0, end_char: englishContent.length, character_id: "speaker" }],
  });
  const attributionSha256 = sha256(readFileSync(join(root, attributionPath), "utf8"));
  const commentaryEntries = commentaryForPlayback.map((block, index) => ({
    placement: block.placement,
    entry: {
      id: `${dialogue}_commentary_${String(index + 1).padStart(4, "0")}`,
      chapter_id: chapterId,
      kind: "commentary",
      character_id: "speaker",
      text: block.body,
      anchor: { commentary_id: block.id },
      cadence_intent: "commentary",
    },
  }));
  const screenplay = {
    schema_version: 2,
    dialogue,
    source_hashes: {
      english: sha256(readFileSync(join(root, `raw/plato/english/${dialogue}.txt`), "utf8")),
      stephanus: sha256(
        readFileSync(join(root, `derived/plato/stephanus-english/${dialogue}.toon`), "utf8"),
      ),
    },
    commentary_sha256: sha256(commentaryContent),
    commentary_quality_audit_sha256: commentaryQualityAudit.sha256,
    cast_sha256: sha256(readFileSync(join(root, "audio/cast.json"), "utf8")),
    generator_version: `screenplay-generator-v3+attribution.${attributionSha256}`,
    chapters: [
      {
        id: chapterId,
        commentary_id: sections[0]!.id,
        ...(sections[0]!.title ? { title: sections[0]!.title } : {}),
      },
    ],
    entries: [
      ...commentaryEntries
        .filter(({ placement }) => placement !== "after")
        .map(({ entry }) => entry),
      {
        id: `${dialogue}_source_0001`,
        chapter_id: chapterId,
        kind: "source",
        character_id: "speaker",
        text: sourceText,
        anchor: { stephanus: marker },
        cadence_intent: "exchange",
      },
      ...commentaryEntries
        .filter(({ placement }) => placement === "after")
        .map(({ entry }) => entry),
    ],
    repairs: [],
    coverage: {
      source_words: sourceWords,
      source_words_covered: sourceWords,
      source_words_uncovered: 0,
      source_words_duplicated: 0,
      commentary_blocks_expected: commentaryForPlayback.length,
      commentary_blocks_covered: commentaryForPlayback.length,
      commentary_blocks_missing: 0,
      commentary_blocks_duplicated: 0,
    },
  };
  writeJson(root, screenplayPath, screenplay);
  const screenplaySha256 = sha256(readFileSync(join(root, screenplayPath), "utf8"));
  const qaPath = `audio/qa/${dialogue}.json`;
  writeJson(root, qaPath, {
    schema_version: 2,
    dialogue,
    status: "accepted",
    generated_at: "2026-07-13T04:00:00Z",
    script_sha256: screenplaySha256,
    cast_sha256: sha256(readFileSync(join(root, "audio/cast.json"), "utf8")),
    source_coverage: {
      passed: true,
      expected_words: sourceWords,
      covered_words: sourceWords,
      uncovered_words: 0,
      duplicated_words: 0,
      repairs_verified: true,
    },
    commentary_coverage: {
      passed: true,
      expected_ids: commentaryIds,
      covered_ids: commentaryIds,
      missing_ids: [],
      duplicate_ids: [],
    },
    asr: {
      passed: true,
      model_repository: "openai/whisper-small.en",
      model_revision: "c".repeat(40),
      max_word_error_rate: 0.02,
      max_ordinary_word_errors: 0,
      expected_words: sourceWords + commentaryWords,
      recognized_words: sourceWords + commentaryWords,
      word_errors: 0,
      ordinary_word_errors: 0,
      word_error_rate: 0,
      transcript_sha256: HASH,
      exceptions: [],
    },
    audio: {
      master_path: `artifacts/recordings/${dialogue}/master.wav`,
      master_sha256: HASH,
      mime_type: "audio/wav",
      duration_seconds: durationSeconds,
      sample_rate_hz: 48_000,
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
      chapter_ids: [chapterId],
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
      chapter_ids: [chapterId],
      disposition: "accepted",
      findings: [],
    },
    chapters: [
      {
        chapter_id: chapterId,
        audio_path: `artifacts/recordings/${dialogue}/chapter-1.wav`,
        audio_sha256: HASH,
        duration_seconds: durationSeconds,
        source_words_expected: sourceWords,
        source_words_covered: sourceWords,
        source_words_uncovered: 0,
        source_words_duplicated: 0,
        commentary_ids_expected: commentaryIds,
        commentary_ids_covered: commentaryIds,
        asr_expected_words: sourceWords + commentaryWords,
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
  return {
    screenplaySha256,
    qaSha256: sha256(readFileSync(join(root, qaPath), "utf8")),
    qaMasterSha256: HASH,
  };
}

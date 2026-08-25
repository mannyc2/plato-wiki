import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function hash(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

function write(root: string, path: string, content: string | Buffer) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content);
}

function writeJson(root: string, path: string, value: unknown) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  write(root, path, content);
  return hash(content);
}

function fixtureHash(label: string) {
  return hash(`mastering fixture:${label}`);
}

function silentPcm24Wav(frames: number) {
  const dataBytes = frames * 3;
  const wav = Buffer.alloc(104 + dataBytes + (dataBytes & 1));
  wav.write("RF64", 0, "ascii");
  wav.writeUInt32LE(0xffff_ffff, 4);
  wav.write("WAVE", 8, "ascii");
  wav.write("ds64", 12, "ascii");
  wav.writeUInt32LE(28, 16);
  wav.writeBigUInt64LE(BigInt(wav.length - 8), 20);
  wav.writeBigUInt64LE(BigInt(dataBytes), 28);
  wav.writeBigUInt64LE(BigInt(frames), 36);
  wav.writeUInt32LE(0, 44);
  wav.write("fmt ", 48, "ascii");
  wav.writeUInt32LE(40, 52);
  wav.writeUInt16LE(0xfffe, 56);
  wav.writeUInt16LE(1, 58);
  wav.writeUInt32LE(48_000, 60);
  wav.writeUInt32LE(144_000, 64);
  wav.writeUInt16LE(3, 68);
  wav.writeUInt16LE(24, 70);
  wav.writeUInt16LE(22, 72);
  wav.writeUInt16LE(24, 74);
  wav.writeUInt32LE(4, 76);
  Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71]).copy(wav, 80);
  wav.write("data", 96, "ascii");
  wav.writeUInt32LE(0xffff_ffff, 100);
  return wav;
}

export function writeMasteringEvidenceFixture({
  repoRoot,
  artifactRoot,
  dialogue,
  publicationBytes,
  publicationDurationSeconds,
}: {
  repoRoot: string;
  artifactRoot: string;
  dialogue: string;
  publicationBytes: Buffer;
  publicationDurationSeconds: number;
}) {
  const screenplayPath = `audio/scripts/${dialogue}.json`;
  const qaPath = `audio/qa/${dialogue}.json`;
  const screenplayContent = readFileSync(join(repoRoot, screenplayPath), "utf8");
  const screenplay = JSON.parse(screenplayContent) as {
    chapters: Array<{ id: string; commentary_id: string; title?: string }>;
  };
  if (!Array.isArray(screenplay.chapters) || screenplay.chapters.length === 0) {
    throw new Error("Mastering evidence fixture requires screenplay chapters.");
  }
  const totalFrames = Math.round(publicationDurationSeconds * 48_000);
  if (totalFrames <= screenplay.chapters.length) throw new Error("Fixture duration is too short for its chapters.");
  const workingBytes = silentPcm24Wav(totalFrames);
  const workingMasterSha256 = hash(workingBytes);
  const publicationSha256 = hash(publicationBytes);
  const planSha256 = fixtureHash(`${dialogue}:${publicationSha256}:plan`);
  const planPath = `plans/${planSha256}.json`;
  const resultPath = `artifacts/${planSha256}/mastering.json`;
  const mechanicalQaPath = `artifacts/${planSha256}/mechanical-qa.json`;
  const workingMasterPath = `artifacts/${planSha256}/master.wav`;
  const publicationPath = `artifacts/${planSha256}/publication.mp3`;

  let cursor = 0;
  const rendererChapters = screenplay.chapters.map((chapter, index) => {
    const remaining = totalFrames - cursor;
    const chaptersRemaining = screenplay.chapters.length - index;
    const frames = index === screenplay.chapters.length - 1 ? remaining : Math.floor(remaining / chaptersRemaining);
    const evidence = {
      chapter_id: chapter.id,
      input_sha256: fixtureHash(`${dialogue}:${chapter.id}:input`),
      audio_sha256: fixtureHash(`${dialogue}:${chapter.id}:audio`),
      frames,
      timing_sha256: fixtureHash(`${dialogue}:${chapter.id}:timing`),
      sidecar_sha256: fixtureHash(`${dialogue}:${chapter.id}:sidecar`),
      duration_seconds: frames / 48_000,
    };
    cursor += frames;
    return evidence;
  });
  cursor = 0;
  const timeline = rendererChapters.map((chapter) => {
    const startFrame = cursor;
    const endFrame = startFrame + chapter.frames;
    cursor = endFrame;
    const { duration_seconds: _duration, ...evidence } = chapter;
    return {
      ...evidence,
      start_frame: startFrame,
      end_frame: endFrame,
      start_seconds: startFrame / 48_000,
      end_seconds: endFrame / 48_000,
    };
  });
  const chapterTimelineSha256 = fixtureHash(`${dialogue}:chapter-timeline`);
  const renderer = {
    dialogue,
    render_plan_sha256: fixtureHash(`${dialogue}:render-plan`),
    render_plan_artifact_sha256: fixtureHash(`${dialogue}:render-plan-artifact`),
    chapters: rendererChapters,
    complete: {
      input_sha256: fixtureHash(`${dialogue}:complete-input`),
      audio_sha256: fixtureHash(`${dialogue}:complete-audio`),
      frames: totalFrames,
      duration_seconds: totalFrames / 48_000,
      timing_sha256: fixtureHash(`${dialogue}:complete-timing`),
      sidecar_sha256: fixtureHash(`${dialogue}:complete-sidecar`),
      chapter_starts_sha256: fixtureHash(`${dialogue}:chapter-starts`),
      container_profile: "rf64-pcm24",
    },
  };
  const implementation = { name: "plato-master-audio", version: 6, code_sha256: fixtureHash("script") };
  const analysisRuntime = {
    name: "numpy",
    version: "2.2.6",
    distribution_root: "/fixture/site-packages",
    module_origin: "/fixture/site-packages/numpy/__init__.py",
    module_origin_sha256: fixtureHash("numpy-origin"),
    record_sha256: fixtureHash("numpy-record"),
    inventory_sha256: fixtureHash("numpy-inventory"),
    file_count: 876,
    binary_file_count: 19,
    total_bytes: 123_456,
  };
  const tools = {
    ffmpeg: { name: "ffmpeg", path: "/fixture/ffmpeg", sha256: fixtureHash("ffmpeg"), version: "ffmpeg version fixture" },
    ffprobe: { name: "ffprobe", path: "/fixture/ffprobe", sha256: fixtureHash("ffprobe"), version: "ffprobe version fixture" },
  };
  const commands = { fixture: ["fixture"] };
  const plan = {
    schema_version: 5,
    status: "full-dialogue-mastering-plan",
    plan_sha256: planSha256,
    implementation,
    analysis_runtime: analysisRuntime,
    dialogue,
    renderer,
    chapter_timeline: timeline,
    chapter_timeline_sha256: chapterTimelineSha256,
    tools,
    policy: { fixture: true },
    source_probe: { fixture: true },
    first_pass: { fixture: true },
    boundaries: [],
    boundaries_sha256: fixtureHash(`${dialogue}:boundaries`),
    commands,
  };
  const masteringPlanArtifactSha256 = writeJson(artifactRoot, planPath, plan);

  const outputs = {
    working_master: {
      filename: "master.wav",
      sha256: workingMasterSha256,
      probe: {
        format_name: "wav",
        container_profile: "rf64-pcm24-v1",
        rf64: {
          profile: "rf64-pcm24-v1",
          riff_size_bytes: workingBytes.length - 8,
          data_size_bytes: totalFrames * 3,
          sample_count: totalFrames,
          data_offset_bytes: 104,
          fmt_chunk_size_bytes: 40,
          format_tag: "extensible-pcm",
          chunk_ids: ["ds64", "fmt ", "data"],
        },
        duration_seconds: totalFrames / 48_000,
        size_bytes: workingBytes.length,
        codec_name: "pcm_s24le",
        sample_format: "s32",
        sample_rate: 48_000,
        channels: 1,
        bits_per_sample: 24,
        bit_rate: 1_152_000,
      },
      pcm: {
        frames: totalFrames,
        duration_seconds: totalFrames / 48_000,
        sample_peak_dbfs: -12,
        clipped_samples: 0,
      },
    },
    publication: {
      filename: "publication.mp3",
      sha256: publicationSha256,
      probe: {
        format_name: "mp3",
        container_profile: "mp3-cbr-96k-v1",
        rf64: null,
        duration_seconds: publicationDurationSeconds,
        size_bytes: publicationBytes.length,
        codec_name: "mp3",
        sample_format: "fltp",
        sample_rate: 48_000,
        channels: 1,
        bits_per_sample: 0,
        bit_rate: 96_000,
      },
      duration_delta_seconds: Math.abs(publicationDurationSeconds - totalFrames / 48_000),
    },
  };
  const mechanicalQa = {
    schema_version: 5,
    status: "mechanical-pass-unaccepted",
    evidence_sha256: fixtureHash(`${dialogue}:mechanical-evidence`),
    implementation,
    analysis_runtime: analysisRuntime,
    dialogue,
    mastering_plan_sha256: planSha256,
    renderer,
    chapter_timeline: timeline,
    chapter_timeline_sha256: chapterTimelineSha256,
    chapters: rendererChapters,
    measurements: { fixture: true },
    gates: {
      loudness_passed: true,
      clipping_passed: true,
      duration_passed: true,
      silence_passed: true,
      mechanical_passed: true,
    },
    acceptance: {
      accepted: false,
      reason: "mechanical evidence only; accepted production requires separate ASR and explicit production authorization",
    },
    asr: { status: "not-performed" },
    listening: { status: "not-performed" },
    outputs,
  };
  const mechanicalQaSha256 = writeJson(artifactRoot, mechanicalQaPath, mechanicalQa);
  const result = {
    schema_version: 5,
    status: "mastered-mechanical-evidence-only",
    implementation,
    analysis_runtime: analysisRuntime,
    dialogue,
    mastering_plan_sha256: planSha256,
    renderer,
    chapter_timeline: timeline,
    chapter_timeline_sha256: chapterTimelineSha256,
    tools,
    commands,
    outputs,
    mechanical_qa_sha256: mechanicalQaSha256,
    mechanical_passed: true,
    accepted: false,
  };
  const masteringResultSha256 = writeJson(artifactRoot, resultPath, result);
  write(artifactRoot, workingMasterPath, workingBytes);
  write(artifactRoot, publicationPath, publicationBytes);

  const qa = JSON.parse(readFileSync(join(repoRoot, qaPath), "utf8")) as {
    audio: { master_path: string; master_sha256: string; duration_seconds: number };
    production_acceptance?: { working_master_sha256: string };
  };
  qa.audio.master_path = workingMasterPath;
  qa.audio.master_sha256 = workingMasterSha256;
  qa.audio.duration_seconds = totalFrames / 48_000;
  if (qa.production_acceptance) {
    qa.production_acceptance.working_master_sha256 = workingMasterSha256;
  }
  const qaSha256 = writeJson(repoRoot, qaPath, qa);

  return {
    production: {
      screenplay_sha256: hash(screenplayContent),
      qa_sha256: qaSha256,
      mastering_plan_path: planPath,
      mastering_plan_artifact_sha256: masteringPlanArtifactSha256,
      mastering_plan_sha256: planSha256,
      mastering_result_path: resultPath,
      mastering_result_sha256: masteringResultSha256,
      mechanical_qa_path: mechanicalQaPath,
      mechanical_qa_sha256: mechanicalQaSha256,
      working_master_path: workingMasterPath,
      working_master_sha256: workingMasterSha256,
      publication_path: publicationPath,
      publication_sha256: publicationSha256,
    },
    chapters: screenplay.chapters.map((chapter, index) => ({
      chapter_id: chapter.id,
      commentary_id: chapter.commentary_id,
      start_frame: timeline[index]!.start_frame,
      ...(chapter.title ? { title: chapter.title } : {}),
    })),
    audio: {
      path: publicationPath,
      mime_type: "audio/mpeg",
      duration_seconds: publicationDurationSeconds,
      sha256: publicationSha256,
    },
    paths: { planPath, resultPath, mechanicalQaPath, workingMasterPath, publicationPath },
  };
}

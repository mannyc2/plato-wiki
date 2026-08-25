import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeAcceptedAudioProductionFixture } from "../../test-support/audio-production-fixture.js";
import { writeMasteringEvidenceFixture } from "../../test-support/mastering-evidence-fixture.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  discoverSiteRecordings,
  inspectMp3File,
  materializeSiteRecordings,
  streamFileSha256,
} from "./recordings.js";

let root = "";
let artifactRoot = "";
let restoreRepoRoot: (() => void) | undefined;
const MASTERING_INTEROP_FIXTURE = fileURLToPath(
  new URL("../../../../tests/emit_mastering_interop_fixture.py", import.meta.url),
);

function write(path: string, content: string | Buffer) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content);
}

function hash(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

function mp3Fixture(frameCount = 40, withId3v2 = false) {
  const frameBytes = Math.floor((144 * 96_000) / 48_000);
  const frame = Buffer.alloc(frameBytes);
  frame.set([0xff, 0xfb, 0x74, 0xc0]);
  const audio = Buffer.concat(Array.from({ length: frameCount }, () => frame));
  const id3v2 = withId3v2 ? Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0, 0, 0, 0]) : Buffer.alloc(0);
  return {
    bytes: Buffer.concat([id3v2, audio]),
    durationSeconds: (frameCount * 1152) / 48_000,
  };
}

function writeManifest({
  status = "accepted",
  audioBytes = mp3Fixture().bytes,
  sha256,
  mimeType = "audio/mpeg",
  durationSeconds = 120,
}: {
  status?: "accepted" | "draft" | "withdrawn";
  audioBytes?: Buffer;
  sha256?: string;
  mimeType?: string;
  durationSeconds?: number;
}) {
  const repoProduction =
    status === "accepted"
      ? writeAcceptedAudioProductionFixture({
          root,
          dialogue: "fixture",
          marker: "1a",
          sourceText: "A short source.",
          durationSeconds,
        })
      : undefined;
  const evidence = repoProduction
    ? writeMasteringEvidenceFixture({
        repoRoot: root,
        artifactRoot,
        dialogue: "fixture",
        publicationBytes: audioBytes,
        publicationDurationSeconds: durationSeconds,
      })
    : undefined;
  const publicationSha256 = sha256 ?? hash(audioBytes);
  const production = evidence
    ? { ...evidence.production, publication_sha256: publicationSha256 }
    : undefined;
  write(
    "wiki/recordings/fixture.json",
    JSON.stringify({
      schema_version: 2,
      recording_id: "recording_fixture_v1",
      dialogue: "fixture",
      status,
      ...(production
        ? {
            production,
          }
        : {}),
      audio: {
        path: production?.publication_path ?? "artifacts/draft/publication.mp3",
        mime_type: mimeType,
        duration_seconds: durationSeconds,
        sha256: publicationSha256,
      },
      chapters: evidence?.chapters ?? [{ chapter_id: "chapter-1", commentary_id: "comm_fixture_0001", start_frame: 0 }],
    }),
  );
  return evidence;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "site-recordings-"));
  artifactRoot = join(root, "external-artifact-store");
  mkdirSync(artifactRoot, { recursive: true });
  restoreRepoRoot = setRepoRootForTesting(root);
  write("raw/plato/greek/fixture.txt", "{1a} A short source.");
  write("raw/plato/english/fixture.txt", "{1a} A short source.");
  const sourceRef = resolveSourceSpan("fixture", "1a").source_ref;
  write(
    "wiki/commentary/fixture.md",
    [
      "# Fixture commentary",
      "",
      "```yaml",
      "commentary_id: comm_fixture_0001",
      "source_work: Fixture",
      "block_kind: section",
      "placement: before",
      'title: "Fixture section"',
      "stephanus_span: 1a",
      "source_ref:",
      `  source_path: ${sourceRef.source_path}`,
      `  stephanus_span: ${sourceRef.stephanus_span}`,
      `  start_marker: ${sourceRef.start_marker}`,
      `  end_marker: ${sourceRef.end_marker}`,
      `  start_char: ${sourceRef.start_char}`,
      `  end_char: ${sourceRef.end_char}`,
      `  text_sha256: "${sourceRef.text_sha256}"`,
      'body: "Fixture commentary."',
      "cites:",
      "  observations: []",
      "  claims: []",
      "  relations: []",
      "  dossiers: []",
      "crossrefs: []",
      "author: model",
      "review_status: accepted",
      "```",
      "",
    ].join("\n"),
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("MP3 inspection", () => {
  it("accepts a complete Layer III stream and rejects garbage, truncation, and duration drift", () => {
    const path = join(root, "fixture.mp3");
    const fixture = mp3Fixture();
    writeFileSync(path, fixture.bytes);
    expect(inspectMp3File(path, fixture.durationSeconds)).toMatchObject({
      bytes: fixture.bytes.length,
      frameCount: 40,
      sha256: hash(fixture.bytes),
    });

    writeFileSync(path, "not MPEG Layer III");
    expect(() => inspectMp3File(path, 1)).toThrow(/Invalid MP3/u);

    const truncated = fixture.bytes.subarray(0, fixture.bytes.length - 3);
    writeFileSync(path, truncated);
    expect(() => inspectMp3File(path, fixture.durationSeconds)).toThrow(/truncated final MPEG Layer III frame/u);

    writeFileSync(path, fixture.bytes);
    expect(() => inspectMp3File(path, fixture.durationSeconds + 1)).toThrow(/MP3 duration mismatch/u);

    const tagged = mp3Fixture(40, true);
    writeFileSync(path, tagged.bytes);
    expect(() => inspectMp3File(path, tagged.durationSeconds)).toThrow(/metadata byte/u);
  });
});

describe("published recording materialization", () => {
  it("accepts an actual master_audio.py v6 artifact without recomputing Python semantic digests", () => {
    writeAcceptedAudioProductionFixture({
      root,
      dialogue: "fixture",
      marker: "1a",
      sourceText: "A short source.",
      durationSeconds: 1,
    });
    const pinnedPython = process.env.MASTERING_INTEROP_PYTHON;
    const generated = Bun.spawnSync({
      cmd: pinnedPython
        ? [pinnedPython, MASTERING_INTEROP_FIXTURE, artifactRoot, "fixture", "chapter-1"]
        : [
            "uv",
            "run",
            "--with",
            "numpy==2.2.6",
            "python",
            MASTERING_INTEROP_FIXTURE,
            artifactRoot,
            "fixture",
            "chapter-1",
          ],
      stdout: "pipe",
      stderr: "pipe",
    });
    if (generated.exitCode !== 0) {
      throw new Error(
        `mastering interop fixture failed:\nstdout:\n${generated.stdout.toString()}\nstderr:\n${generated.stderr.toString()}`,
      );
    }
    const receipt = JSON.parse(readFileSync(join(artifactRoot, "interop-receipt.json"), "utf8")) as {
      plan_sha256: string;
      plan_path: string;
      result_dir: string;
    };
    const resultPath = `${receipt.result_dir}/mastering.json`;
    const mechanicalQaPath = `${receipt.result_dir}/mechanical-qa.json`;
    const workingMasterPath = `${receipt.result_dir}/master.wav`;
    const publicationPath = `${receipt.result_dir}/publication.mp3`;
    const result = JSON.parse(readFileSync(join(artifactRoot, resultPath), "utf8")) as any;
    const qaPath = join(root, "audio/qa/fixture.json");
    const acceptedQa = JSON.parse(readFileSync(qaPath, "utf8")) as any;
    acceptedQa.audio.master_path = workingMasterPath;
    acceptedQa.audio.master_sha256 = result.outputs.working_master.sha256;
    acceptedQa.production_acceptance.working_master_sha256 = result.outputs.working_master.sha256;
    acceptedQa.audio.duration_seconds = result.outputs.working_master.probe.duration_seconds;
    acceptedQa.chapters[0].duration_seconds = result.outputs.working_master.probe.duration_seconds;
    const qaContent = `${JSON.stringify(acceptedQa, null, 2)}\n`;
    writeFileSync(qaPath, qaContent);
    const publication = readFileSync(join(artifactRoot, publicationPath));
    write(
      "wiki/recordings/fixture.json",
      JSON.stringify({
        schema_version: 2,
        recording_id: "recording_fixture_python_v5",
        dialogue: "fixture",
        status: "accepted",
        production: {
          screenplay_sha256: hash(readFileSync(join(root, "audio/scripts/fixture.json"))),
          qa_sha256: hash(qaContent),
          mastering_plan_path: receipt.plan_path,
          mastering_plan_artifact_sha256: hash(readFileSync(join(artifactRoot, receipt.plan_path))),
          mastering_plan_sha256: receipt.plan_sha256,
          mastering_result_path: resultPath,
          mastering_result_sha256: hash(readFileSync(join(artifactRoot, resultPath))),
          mechanical_qa_path: mechanicalQaPath,
          mechanical_qa_sha256: hash(readFileSync(join(artifactRoot, mechanicalQaPath))),
          working_master_path: workingMasterPath,
          working_master_sha256: result.outputs.working_master.sha256,
          publication_path: publicationPath,
          publication_sha256: result.outputs.publication.sha256,
        },
        audio: {
          path: publicationPath,
          mime_type: "audio/mpeg",
          duration_seconds: result.outputs.publication.probe.duration_seconds,
          sha256: result.outputs.publication.sha256,
        },
        chapters: [{ chapter_id: "chapter-1", commentary_id: "comm_fixture_0001", start_frame: 0 }],
      }),
    );

    const outDir = join(root, "site-python-interop");
    const assets = materializeSiteRecordings({
      recordings: discoverSiteRecordings(),
      artifactRoot,
      outDir,
    });
    expect(assets).toEqual([
      {
        dialogue: "fixture",
        status: "accepted",
        path: "assets/recordings/fixture/complete.mp3",
        sha256: result.outputs.publication.sha256,
        bytes: publication.length,
      },
    ]);
  });

  it("discovers only accepted manifests and chunk-copies a hash-verified artifact", () => {
    const { bytes, durationSeconds } = mp3Fixture(2_600);
    const sha256 = hash(bytes);
    const evidence = writeManifest({ audioBytes: bytes, durationSeconds });
    const source = join(artifactRoot, evidence!.paths.publicationPath);
    const workingMaster = join(artifactRoot, evidence!.paths.workingMasterPath);
    expect(readFileSync(workingMaster).subarray(0, 4).toString("ascii")).toBe("RF64");

    const recordings = discoverSiteRecordings();
    expect(recordings.get("fixture")).toMatchObject({
      recordingId: "recording_fixture_v1",
      status: "accepted",
      siteAssetPath: "assets/recordings/fixture/complete.mp3",
      audioSha256: sha256,
    });
    expect(streamFileSha256(source)).toBe(sha256);

    const outDir = join(root, "site");
    const assets = materializeSiteRecordings({ recordings, artifactRoot, outDir });
    const destination = join(outDir, "assets/recordings/fixture/complete.mp3");
    expect(assets).toEqual([
      { dialogue: "fixture", status: "accepted", path: "assets/recordings/fixture/complete.mp3", sha256, bytes: bytes.length },
    ]);
    expect(readFileSync(destination)).toEqual(bytes);
    expect(streamFileSha256(destination)).toBe(sha256);
    expect(inspectMp3File(destination, durationSeconds)).toMatchObject({
      bytes: bytes.length,
      frameCount: 2_600,
      sha256,
    });
  });

  it("requires an explicit absolute artifact root for accepted publication records", () => {
    writeManifest({});
    const recordings = discoverSiteRecordings();

    expect(() => materializeSiteRecordings({ recordings, artifactRoot: undefined, outDir: join(root, "site") }))
      .toThrow(/explicit recordingArtifactRoot or PLATO_RECORDING_ARTIFACT_ROOT/u);
    expect(() => materializeSiteRecordings({ recordings, artifactRoot: "relative", outDir: join(root, "site") }))
      .toThrow(/must be an absolute path/u);
  });

  it("does not publish missing or corrupt artifacts", () => {
    const fixture = mp3Fixture();
    const evidence = writeManifest({ audioBytes: fixture.bytes, durationSeconds: fixture.durationSeconds });
    const recordings = discoverSiteRecordings();
    const outDir = join(root, "site");
    const source = join(artifactRoot, evidence!.paths.publicationPath);
    rmSync(source);

    expect(() => materializeSiteRecordings({ recordings, artifactRoot, outDir }))
      .toThrow(/Publication derivative is missing/u);

    writeFileSync(source, "corrupt bytes");
    expect(() => materializeSiteRecordings({ recordings, artifactRoot, outDir }))
      .toThrow(/Publication derivative hash mismatch/u);
    expect(existsSync(join(outDir, "assets/recordings/fixture/complete.mp3"))).toBe(false);
  });

  it("requires every plan, result, mechanical-QA, and working-master artifact before publication", () => {
    const cases = [
      ["planPath", /Mastering plan is missing/u],
      ["resultPath", /Mastering result is missing/u],
      ["mechanicalQaPath", /Mechanical QA is missing/u],
      ["workingMasterPath", /Working master is missing/u],
    ] as const;
    for (const [field, expected] of cases) {
      const evidence = writeManifest({})!;
      rmSync(join(artifactRoot, evidence.paths[field]));
      expect(() =>
        materializeSiteRecordings({
          recordings: discoverSiteRecordings(),
          artifactRoot,
          outDir: join(root, `site-missing-${field}`),
        }),
      ).toThrow(expected);
    }
  });

  it("rejects coherently rehashed non-WAV working-master bytes", () => {
    const evidence = writeManifest({})!;
    const fakeMaster = Buffer.from("coherently rehashed, but not RF64 PCM24");
    const fakeMasterSha256 = hash(fakeMaster);
    writeFileSync(join(artifactRoot, evidence.paths.workingMasterPath), fakeMaster);

    const acceptedQaPath = join(root, "audio/qa/fixture.json");
    const acceptedQa = JSON.parse(readFileSync(acceptedQaPath, "utf8")) as any;
    acceptedQa.audio.master_sha256 = fakeMasterSha256;
    acceptedQa.production_acceptance.working_master_sha256 = fakeMasterSha256;
    const acceptedQaContent = `${JSON.stringify(acceptedQa, null, 2)}\n`;
    writeFileSync(acceptedQaPath, acceptedQaContent);

    const mechanicalQaPath = join(artifactRoot, evidence.paths.mechanicalQaPath);
    const mechanicalQa = JSON.parse(readFileSync(mechanicalQaPath, "utf8")) as any;
    mechanicalQa.outputs.working_master.sha256 = fakeMasterSha256;
    mechanicalQa.outputs.working_master.probe.size_bytes = fakeMaster.length;
    const mechanicalQaContent = `${JSON.stringify(mechanicalQa, null, 2)}\n`;
    writeFileSync(mechanicalQaPath, mechanicalQaContent);

    const resultPath = join(artifactRoot, evidence.paths.resultPath);
    const result = JSON.parse(readFileSync(resultPath, "utf8")) as any;
    result.outputs.working_master.sha256 = fakeMasterSha256;
    result.outputs.working_master.probe.size_bytes = fakeMaster.length;
    result.mechanical_qa_sha256 = hash(mechanicalQaContent);
    const resultContent = `${JSON.stringify(result, null, 2)}\n`;
    writeFileSync(resultPath, resultContent);

    const manifestPath = join(root, "wiki/recordings/fixture.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as any;
    manifest.production.qa_sha256 = hash(acceptedQaContent);
    manifest.production.working_master_sha256 = fakeMasterSha256;
    manifest.production.mechanical_qa_sha256 = hash(mechanicalQaContent);
    manifest.production.mastering_result_sha256 = hash(resultContent);
    writeFileSync(manifestPath, JSON.stringify(manifest));

    expect(() =>
      materializeSiteRecordings({
        recordings: discoverSiteRecordings(),
        artifactRoot,
        outDir: join(root, "site-fake-master"),
      }),
    ).toThrow(/not a complete RIFF or RF64 WAVE file/u);
  });

  it("rejects a matching hash for non-MP3 bytes, truncated frames, or inconsistent duration", () => {
    const outDir = join(root, "site");

    const garbage = Buffer.from("hash-correct bytes that are not MPEG Layer III");
    let evidence = writeManifest({ audioBytes: garbage, durationSeconds: 1 });
    expect(() => materializeSiteRecordings({ recordings: discoverSiteRecordings(), artifactRoot, outDir }))
      .toThrow(/Invalid MP3 recording artifact/u);

    const fixture = mp3Fixture();
    const truncated = fixture.bytes.subarray(0, fixture.bytes.length - 3);
    evidence = writeManifest({ audioBytes: truncated, durationSeconds: fixture.durationSeconds });
    expect(() => materializeSiteRecordings({ recordings: discoverSiteRecordings(), artifactRoot, outDir }))
      .toThrow(/truncated final MPEG Layer III frame/u);

    evidence = writeManifest({ audioBytes: fixture.bytes, durationSeconds: fixture.durationSeconds + 1 });
    expect(() => materializeSiteRecordings({ recordings: discoverSiteRecordings(), artifactRoot, outDir }))
      .toThrow(/MP3 duration mismatch/u);
  });

  it("rejects an artifact symlink that resolves outside the configured root", () => {
    const fixture = mp3Fixture();
    const evidence = writeManifest({ audioBytes: fixture.bytes, durationSeconds: fixture.durationSeconds });
    const outside = join(root, "outside-complete.mp3");
    writeFileSync(outside, fixture.bytes);
    const source = join(artifactRoot, evidence!.paths.publicationPath);
    rmSync(source);
    symlinkSync(outside, source);

    expect(() =>
      materializeSiteRecordings({
        recordings: discoverSiteRecordings(),
        artifactRoot,
        outDir: join(root, "site"),
      }),
    ).toThrow(/must be a regular non-symlink file/u);
  });

  it("treats valid draft or withdrawn manifests as unpublished without requiring artifacts", () => {
    writeManifest({ status: "draft", sha256: "a".repeat(64) });
    expect(discoverSiteRecordings().size).toBe(0);
    expect(materializeSiteRecordings({ recordings: discoverSiteRecordings(), artifactRoot: undefined, outDir: join(root, "site") })).toEqual([]);

    writeManifest({ status: "withdrawn", sha256: "a".repeat(64) });
    expect(discoverSiteRecordings().size).toBe(0);
  });

  it("includes and materializes a draft only through the explicit review-candidate lane", () => {
    const fixture = mp3Fixture(80);
    writeManifest({
      status: "draft",
      audioBytes: fixture.bytes,
      durationSeconds: fixture.durationSeconds,
    });
    const draftPath = join(artifactRoot, "artifacts/draft/publication.mp3");
    mkdirSync(join(draftPath, ".."), { recursive: true });
    writeFileSync(draftPath, fixture.bytes);

    expect(discoverSiteRecordings().size).toBe(0);
    const recordings = discoverSiteRecordings({ includeDraftRecordings: true });
    expect(recordings.get("fixture")).toMatchObject({
      status: "draft",
      sourceArtifactPath: "artifacts/draft/publication.mp3",
      siteAssetPath: "assets/recordings/fixture/complete.mp3",
    });

    const outDir = join(root, "draft-review-site");
    expect(materializeSiteRecordings({ recordings, artifactRoot, outDir })).toEqual([
      {
        dialogue: "fixture",
        status: "draft",
        path: "assets/recordings/fixture/complete.mp3",
        sha256: hash(fixture.bytes),
        bytes: fixture.bytes.length,
      },
    ]);
    expect(readFileSync(join(outDir, "assets/recordings/fixture/complete.mp3"))).toEqual(fixture.bytes);
  });

  it("fails closed on a missing, symlinked, or hash-mismatched draft artifact", () => {
    const fixture = mp3Fixture(80);
    writeManifest({
      status: "draft",
      audioBytes: fixture.bytes,
      durationSeconds: fixture.durationSeconds,
    });
    const recordings = discoverSiteRecordings({ includeDraftRecordings: true });
    const draftPath = join(artifactRoot, "artifacts/draft/publication.mp3");

    expect(() =>
      materializeSiteRecordings({ recordings, artifactRoot, outDir: join(root, "draft-missing") }),
    ).toThrow(/Review candidate audio is missing/u);

    mkdirSync(join(draftPath, ".."), { recursive: true });
    writeFileSync(draftPath, mp3Fixture(81).bytes);
    expect(() =>
      materializeSiteRecordings({ recordings, artifactRoot, outDir: join(root, "draft-wrong-hash") }),
    ).toThrow(/Recording artifact hash mismatch/u);

    const outside = join(root, "outside-draft.mp3");
    writeFileSync(outside, fixture.bytes);
    rmSync(draftPath);
    symlinkSync(outside, draftPath);
    expect(() =>
      materializeSiteRecordings({ recordings, artifactRoot, outDir: join(root, "draft-symlink") }),
    ).toThrow(/Review candidate audio must be a regular non-symlink file/u);
  });

  it("rejects malformed publication metadata and non-MP3 accepted records", () => {
    writeManifest({ status: "draft", sha256: "not-a-hash" });
    expect(() => discoverSiteRecordings()).toThrow(/invalid_audio_sha256/u);

    writeManifest({ sha256: "a".repeat(64), mimeType: "audio/wav" });
    expect(() => discoverSiteRecordings()).toThrow(/must use audio\/mpeg/u);

    writeManifest({ status: "draft", sha256: "a".repeat(64), mimeType: "audio/wav" });
    expect(discoverSiteRecordings().size).toBe(0);
    expect(() => discoverSiteRecordings({ includeDraftRecordings: true })).toThrow(
      /Review candidate .* must use audio\/mpeg/u,
    );
  });
});

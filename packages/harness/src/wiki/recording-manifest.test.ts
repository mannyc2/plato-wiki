import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  listRecordingManifestPaths,
  parseRecordingManifest,
  validateRecordingManifest,
  validateRecordingManifests,
} from "./recording-manifest.js";

const MANIFEST_PATH = "wiki/recordings/fixture.json";
const HASH = "a".repeat(64);

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeCommentarySections(ids = ["comm_fixture_0001"]) {
  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  writeFileSync(
    join(root, "wiki/commentary/fixture.md"),
    ids
      .map(
        (id) => `\`\`\`yaml
commentary_id: ${id}
block_kind: section
review_status: accepted
\`\`\``,
      )
      .join("\n\n"),
    "utf8",
  );
}

function recording(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: 2,
    recording_id: "recording_fixture_2026-07-12_a",
    dialogue: "fixture",
    status: "draft",
    production: {
      screenplay_sha256: HASH,
      qa_sha256: HASH,
      mastering_plan_path: `plans/${HASH}.json`,
      mastering_plan_artifact_sha256: HASH,
      mastering_plan_sha256: HASH,
      mastering_result_path: `artifacts/${HASH}/mastering.json`,
      mastering_result_sha256: HASH,
      mechanical_qa_path: `artifacts/${HASH}/mechanical-qa.json`,
      mechanical_qa_sha256: HASH,
      working_master_path: `artifacts/${HASH}/master.wav`,
      working_master_sha256: HASH,
      publication_path: `artifacts/${HASH}/publication.mp3`,
      publication_sha256: HASH,
    },
    audio: {
      path: `artifacts/${HASH}/publication.mp3`,
      mime_type: "audio/mpeg",
      duration_seconds: 120.5,
      sha256: HASH,
    },
    chapters: [{ chapter_id: "chapter-1", commentary_id: "comm_fixture_0001", start_frame: 0 }],
    ...overrides,
  };
}

function issueCodes(content: string) {
  return validateRecordingManifest(MANIFEST_PATH, content).map((issue) => issue.code);
}

describe("recording manifests", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "recording-manifest-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeCommentarySections();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("parses a valid typed manifest", () => {
    const content = JSON.stringify(
      recording({
        cast: [{ character_id: "socrates", name: "Socrates", voice: "Dots seed 44" }],
        provenance: [{ label: "Text", value: "Fowler translation" }],
      }),
    );

    expect(validateRecordingManifest(MANIFEST_PATH, content)).toEqual([]);
    expect(parseRecordingManifest(MANIFEST_PATH, content)).toMatchObject({
      schema_version: 2,
      recording_id: "recording_fixture_2026-07-12_a",
      production: { screenplay_sha256: HASH, qa_sha256: HASH, mastering_plan_sha256: HASH },
      audio: { duration_seconds: 120.5 },
      chapters: [{ chapter_id: "chapter-1", commentary_id: "comm_fixture_0001", start_frame: 0 }],
    });
  });

  it("rejects malformed JSON and malformed required fields", () => {
    expect(issueCodes("{ nope")).toContain("malformed_json");
    expect(issueCodes(JSON.stringify({ dialogue: "fixture" }))).toContain("invalid_manifest_shape");
    expect(issueCodes(JSON.stringify(recording({ schema_version: 1 })))).toContain("invalid_schema_version");
    expect(issueCodes(JSON.stringify(recording({ unexpected: true })))).toContain("unknown_field");
  });

  it("rejects a dialogue that disagrees with the manifest filename", () => {
    expect(issueCodes(JSON.stringify(recording({ dialogue: "crito" })))).toContain("dialogue_mismatch");
  });

  it("does not accept a publication without its screenplay and QA evidence", () => {
    expect(issueCodes(JSON.stringify(recording({ status: "accepted" })))).toContain(
      "missing_production_dependency",
    );
  });

  it("rejects an invalid hash and treats audio.path only as artifact-root-relative", () => {
    expect(
      issueCodes(
        JSON.stringify(
          recording({
            audio: {
              path: `artifacts/${HASH}/publication.mp3`,
              mime_type: "audio/mpeg",
              duration_seconds: 120.5,
              sha256: "not-a-sha256",
            },
          }),
        ),
      ),
    ).toContain("invalid_audio_sha256");

    mkdirSync(join(root, "artifacts/recordings/fixture"), { recursive: true });
    writeFileSync(join(root, "artifacts/recordings/fixture/complete.mp3"), "audio bytes", "utf8");
    expect(issueCodes(JSON.stringify(recording()))).toEqual([]);
    expect(
      issueCodes(
        JSON.stringify(
          recording({
            audio: {
              path: "../outside.mp3",
              mime_type: "audio/mpeg",
              duration_seconds: 120.5,
              sha256: HASH,
            },
          }),
        ),
      ),
    ).toContain("invalid_audio_path");
  });

  it("rejects non-monotonic chapter starts", () => {
    writeCommentarySections(["comm_fixture_0001", "comm_fixture_0002"]);
    const chapters = [
      { chapter_id: "chapter-1", commentary_id: "comm_fixture_0001", start_frame: 480_000 },
      { chapter_id: "chapter-2", commentary_id: "comm_fixture_0002", start_frame: 240_000 },
    ];

    expect(issueCodes(JSON.stringify(recording({ chapters })))).toContain("non_monotonic_chapters");
  });

  it("requires complete chapter coverage to begin at zero", () => {
    const chapters = [{ chapter_id: "chapter-1", commentary_id: "comm_fixture_0001", start_frame: 48_000 }];

    expect(issueCodes(JSON.stringify(recording({ chapters })))).toContain("first_chapter_not_zero");
  });

  it("rejects a chapter without an accepted section commentary target", () => {
    const chapters = [{ chapter_id: "chapter-1", commentary_id: "comm_fixture_9999", start_frame: 0 }];

    expect(issueCodes(JSON.stringify(recording({ chapters })))).toContain("missing_section_target");
  });

  it("treats the recordings directory as optional and detects duplicate recording ids", () => {
    expect(listRecordingManifestPaths()).toEqual([]);
    expect(validateRecordingManifests()).toEqual([]);

    mkdirSync(join(root, "wiki/recordings"), { recursive: true });
    writeFileSync(join(root, "wiki/recordings/fixture.json"), JSON.stringify(recording()), "utf8");
    writeFileSync(
      join(root, "wiki/commentary/other.md"),
      "```yaml\ncommentary_id: comm_other_0001\nblock_kind: section\nreview_status: accepted\n```\n",
      "utf8",
    );
    writeFileSync(
      join(root, "wiki/recordings/other.json"),
      JSON.stringify(
        recording({
          dialogue: "other",
          chapters: [{ chapter_id: "chapter-1", commentary_id: "comm_other_0001", start_frame: 0 }],
        }),
      ),
      "utf8",
    );

    expect(validateRecordingManifests().map((issue) => issue.code)).toContain("duplicate_recording_id");
  });
});

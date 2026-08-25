import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCommentaryCampaignManifest } from "../commentary-campaign.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_STAGE_EFFORT,
} from "../commentary-authoring.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { COMMENTARY_PROTOCOL_FIXTURE } from "../../test-support/commentary-protocol-fixture.js";
import { writeCommentaryQualityAuditManifestPreview, validateCommentaryQualityAuditManifest } from "./commentary-quality-audit.js";
import {
  applyCommentaryQualityAuditAcceptance,
  applyCommentaryQualityAuditAcceptanceSupersede,
  previewCommentaryQualityAuditAcceptance,
  previewCommentaryQualityAuditAcceptanceSupersede,
  validateCommentaryQualityAuditAcceptanceSample,
} from "./commentary-quality-audit-acceptance.js";

const DIALOGUE = "fixture";
const ID = "comm_fixture_0001";
const GREEK = "{2a} alpha {2b} beta";
const ENGLISH = "{2a} first {2b} second";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function writeFixtureLedger() {
  const ref = resolveSourceSpan(DIALOGUE, "2a-2b").source_ref;
  write(
    `wiki/commentary/${DIALOGUE}.md`,
    [
      "# Fixture Commentary",
      "",
      "```yaml",
      `commentary_id: ${ID}`,
      "source_work: Fixture",
      "block_kind: section",
      "placement: before",
      'title: "Fixture unit"',
      "stephanus_span: 2a-2b",
      "source_ref:",
      `  source_path: ${ref.source_path}`,
      `  stephanus_span: ${ref.stephanus_span}`,
      `  start_marker: ${ref.start_marker}`,
      `  end_marker: ${ref.end_marker}`,
      `  start_char: ${ref.start_char}`,
      `  end_char: ${ref.end_char}`,
      `  text_sha256: \"${ref.text_sha256}\"`,
      'body: "A concise orientation."',
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
}

function writeCompletedAudit() {
  const [job] = buildCommentaryCampaignManifest({ dialogue: DIALOGUE, stage: "audit" }).jobs;
  if (!job) throw new Error("fixture audit job missing");
  const output = {
    schema_version: 3,
    dialogue: DIALOGUE,
    unit_key: job.unit_key!,
    section_id: job.section_id!,
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
    unit_verdict: "pass",
    blocks: [{
      commentary_id: ID,
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
      rationale: "This block earns its place in the listening sequence.",
    }],
  };
  const outputContent = `${JSON.stringify(output, null, 2)}\n`;
  write(job.output_path, outputContent);
  write(
    job.state_path,
    `${JSON.stringify({
      schema_version: 3,
      job_id: job.job_id,
      stage: "audit",
      input_sha256: job.input_sha256,
      output_schema_sha256: job.output_schema_sha256,
      model_argument: COMMENTARY_MODEL_ARGUMENT,
      codex_cli_version: job.codex_cli_version,
      model_catalog_path: job.model_catalog_path,
      model_catalog_sha256: job.model_catalog_sha256,
      authoring_model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
      permission_mode: COMMENTARY_PERMISSION_MODE,
      output_path: job.output_path,
      output_sha256: sha256(outputContent),
    }, null, 2)}\n`,
  );
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-quality-audit-acceptance-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  write(`raw/plato/greek/${DIALOGUE}.txt`, GREEK);
  write(`raw/plato/english/${DIALOGUE}.txt`, ENGLISH);
  write(
    `audio/speaker-attributions/${DIALOGUE}.json`,
    `${JSON.stringify({
      schema_version: 2,
      dialogue: DIALOGUE,
      english_sha256: sha256(ENGLISH),
      status: "accepted",
      segments: [{ id: "turn_fixture_0001", start_char: 0, end_char: ENGLISH.length, character_id: "fixture" }],
    }, null, 2)}\n`,
  );
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  write(
    "packages/harness/src/commentary-luna-model-catalog.json",
    readFileSync(join(import.meta.dir, "../commentary-luna-model-catalog.json"), "utf8"),
  );
  writeFixtureLedger();
  writeCompletedAudit();
  writeCommentaryQualityAuditManifestPreview(DIALOGUE);
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

const validInput = {
  dialogue: DIALOGUE,
  reviewer: "cjpher-delegated-luna-reviewer-fixture",
  reviewedOn: "2026-08-21",
  rationale: "The independent Luna sample supports acceptance of the bounded audit output.",
  sampledCommentaryIds: [ID],
};

describe("commentary quality-audit acceptance lane", () => {
  it("requires truthful delegated-Luna metadata and never infers acceptance inputs", () => {
    expect(() => previewCommentaryQualityAuditAcceptance({ ...validInput, reviewer: "human-reviewer" })).toThrow(
      "operator-delegated Luna reviewer",
    );
    expect(() => previewCommentaryQualityAuditAcceptance({ ...validInput, rationale: "I listened to the sample." })).toThrow(
      "must not claim human listening",
    );
    expect(() => previewCommentaryQualityAuditAcceptance({ ...validInput, sampledCommentaryIds: [] })).toThrow(
      "explicitly provided",
    );
  });

  it("rejects missing, short, duplicate, out-of-order, and unknown samples", () => {
    const activeIds = ["comm_fixture_0001", "comm_fixture_0002", "comm_fixture_0003"];
    expect(() => validateCommentaryQualityAuditAcceptanceSample([], activeIds)).toThrow("at least 3");
    expect(() => validateCommentaryQualityAuditAcceptanceSample([activeIds[0]!], activeIds)).toThrow("at least 3");
    expect(() => validateCommentaryQualityAuditAcceptanceSample([activeIds[0]!, activeIds[0]!, activeIds[2]!], activeIds)).toThrow(
      "unique",
    );
    expect(() => validateCommentaryQualityAuditAcceptanceSample([activeIds[1]!, activeIds[0]!, activeIds[2]!], activeIds)).toThrow(
      "canonical ledger order",
    );
    expect(() => validateCommentaryQualityAuditAcceptanceSample([activeIds[0]!, "comm_fixture_9999", activeIds[2]!], activeIds)).toThrow(
      "only active IDs",
    );
  });

  it("previews without writing and applies only after exact pending-state validation", () => {
    const preview = previewCommentaryQualityAuditAcceptance(validInput);
    expect(preview.applied).toBe(false);
    expect(existsSync(join(root, preview.manifestPath))).toBe(false);
    expect(existsSync(join(root, preview.reviewNotePath))).toBe(false);
    expect(preview.manifest.acceptance).toMatchObject({ decision: "accepted", sampled_commentary_ids: [ID] });

    const applied = applyCommentaryQualityAuditAcceptance(validInput);
    expect(applied.applied).toBe(true);
    expect(readFileSync(join(root, applied.manifestPath), "utf8")).toBe(`${JSON.stringify(applied.manifest, null, 2)}\n`);
    expect(validateCommentaryQualityAuditManifest(applied.manifestPath, readFileSync(join(root, applied.manifestPath), "utf8"))).toEqual([]);
    expect(() => applyCommentaryQualityAuditAcceptance(validInput)).toThrow("Refusing to overwrite");
  });

  it("rejects a pending preview when the canonical ledger changes after preview", () => {
    const pendingPath = join(root, "wiki/commentary/fixture.md");
    writeFileSync(pendingPath, `${readFileSync(pendingPath, "utf8")}\n`, "utf8");
    expect(() => previewCommentaryQualityAuditAcceptance(validInput)).toThrow("is stale");
  });

  it("supersedes a changed-ledger acceptance with content-addressed predecessor history", () => {
    const initial = applyCommentaryQualityAuditAcceptance(validInput);
    const oldManifest = readFileSync(join(root, initial.manifestPath), "utf8");
    const oldReviewNote = readFileSync(join(root, initial.reviewNotePath), "utf8");

    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A concise orientation.",
        "A materially revised orientation.",
      ),
    );
    writeCompletedAudit();
    writeCommentaryQualityAuditManifestPreview(DIALOGUE);

    const nextInput = {
      ...validInput,
      reviewer: "cjpher-delegated-luna-reviewer-fixture-round2",
      reviewedOn: "2026-08-22",
      rationale: "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    };
    const preview = previewCommentaryQualityAuditAcceptanceSupersede(nextInput);
    expect(preview.applied).toBe(false);
    expect(readFileSync(join(root, initial.manifestPath), "utf8")).toBe(oldManifest);
    expect(readFileSync(join(root, initial.reviewNotePath), "utf8")).toBe(oldReviewNote);
    expect(existsSync(join(root, preview.predecessorManifestHistoryPath))).toBe(false);
    expect(existsSync(join(root, preview.predecessorReviewNoteHistoryPath))).toBe(false);
    expect(preview.reviewNote).toContain(`predecessor_manifest_sha256: ${sha256(oldManifest)}`);
    expect(preview.reviewNote).toContain(`predecessor_review_note_sha256: ${sha256(oldReviewNote)}`);

    const applied = applyCommentaryQualityAuditAcceptanceSupersede(nextInput);
    expect(applied.applied).toBe(true);
    expect(readFileSync(join(root, applied.predecessorManifestHistoryPath), "utf8")).toBe(oldManifest);
    expect(readFileSync(join(root, applied.predecessorReviewNoteHistoryPath), "utf8")).toBe(oldReviewNote);
    expect(readFileSync(join(root, initial.reviewNotePath), "utf8")).toBe(oldReviewNote);
    expect(validateCommentaryQualityAuditManifest(applied.manifestPath, readFileSync(join(root, applied.manifestPath), "utf8"))).toEqual([]);
    expect(() => applyCommentaryQualityAuditAcceptanceSupersede(nextInput)).toThrow("unchanged");
  });

  it("supersedes a predecessor whose historical audit-unit order differs from its receipt sample order", () => {
    const initial = applyCommentaryQualityAuditAcceptance(validInput);
    const manifestAbsolutePath = join(root, initial.manifestPath);
    const predecessor = JSON.parse(readFileSync(manifestAbsolutePath, "utf8")) as {
      acceptance: {
        sampled_commentary_ids: string[];
        review_note: { path: string; sha256: string };
      };
      units: Array<{ output: { blocks: Array<Record<string, unknown>> } }>;
    };
    const historicalIds = [ID, "comm_fixture_0002", "comm_fixture_0003"];
    const firstBlock = predecessor.units[0]!.output.blocks[0]!;
    predecessor.units[0]!.output.blocks = [
      { ...firstBlock, commentary_id: historicalIds[1] },
      { ...firstBlock, commentary_id: historicalIds[0] },
      { ...firstBlock, commentary_id: historicalIds[2] },
    ];
    const historicalOutput = `${JSON.stringify(predecessor.units[0]!.output, null, 2)}\n`;
    (predecessor.units[0] as { output_sha256?: string }).output_sha256 = sha256(historicalOutput);
    predecessor.acceptance.sampled_commentary_ids = historicalIds;
    const reviewNoteAbsolutePath = join(root, predecessor.acceptance.review_note.path);
    const historicalReviewNote = readFileSync(reviewNoteAbsolutePath, "utf8").replace(
      `- ${ID}`,
      historicalIds.map((id) => `- ${id}`).join("\n"),
    );
    writeFileSync(reviewNoteAbsolutePath, historicalReviewNote, "utf8");
    predecessor.acceptance.review_note.sha256 = sha256(historicalReviewNote);
    writeFileSync(manifestAbsolutePath, `${JSON.stringify(predecessor, null, 2)}\n`, "utf8");

    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A concise orientation.",
        "A materially revised orientation.",
      ),
    );
    writeCompletedAudit();
    writeCommentaryQualityAuditManifestPreview(DIALOGUE);

    const preview = previewCommentaryQualityAuditAcceptanceSupersede({
      ...validInput,
      reviewer: "cjpher-delegated-luna-reviewer-fixture-round2",
      reviewedOn: "2026-08-22",
      rationale: "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    });
    expect(preview.predecessorManifestSha256).toBe(sha256(readFileSync(manifestAbsolutePath, "utf8")));
  });

  it("rejects a predecessor when its receipt changes the accepted historical sample order", () => {
    const initial = applyCommentaryQualityAuditAcceptance(validInput);
    const manifestAbsolutePath = join(root, initial.manifestPath);
    const predecessor = JSON.parse(readFileSync(manifestAbsolutePath, "utf8")) as {
      acceptance: {
        sampled_commentary_ids: string[];
        review_note: { path: string; sha256: string };
      };
      units: Array<{ output: { blocks: Array<Record<string, unknown>> } }>;
    };
    const historicalIds = [ID, "comm_fixture_0002", "comm_fixture_0003"];
    const firstBlock = predecessor.units[0]!.output.blocks[0]!;
    predecessor.units[0]!.output.blocks = historicalIds.map((commentary_id) => ({ ...firstBlock, commentary_id }));
    const historicalOutput = `${JSON.stringify(predecessor.units[0]!.output, null, 2)}\n`;
    (predecessor.units[0] as { output_sha256?: string }).output_sha256 = sha256(historicalOutput);
    predecessor.acceptance.sampled_commentary_ids = historicalIds;
    const reviewNoteAbsolutePath = join(root, predecessor.acceptance.review_note.path);
    const mismatchedReviewNote = readFileSync(reviewNoteAbsolutePath, "utf8").replace(
      `- ${ID}`,
      [historicalIds[1], historicalIds[0], historicalIds[2]].map((id) => `- ${id}`).join("\n"),
    );
    writeFileSync(reviewNoteAbsolutePath, mismatchedReviewNote, "utf8");
    predecessor.acceptance.review_note.sha256 = sha256(mismatchedReviewNote);
    writeFileSync(manifestAbsolutePath, `${JSON.stringify(predecessor, null, 2)}\n`, "utf8");

    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A concise orientation.",
        "A materially revised orientation.",
      ),
    );
    writeCompletedAudit();
    writeCommentaryQualityAuditManifestPreview(DIALOGUE);

    expect(() => previewCommentaryQualityAuditAcceptanceSupersede({
      ...validInput,
      reviewer: "cjpher-delegated-luna-reviewer-fixture-round2",
      reviewedOn: "2026-08-22",
      rationale: "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    })).toThrow("invalid predecessor review receipt");
  });

  it("rejects malformed embedded predecessor units and out-of-policy historical rationale", () => {
    const initial = applyCommentaryQualityAuditAcceptance(validInput);
    const manifestAbsolutePath = join(root, initial.manifestPath);
    const originalManifest = readFileSync(manifestAbsolutePath, "utf8");
    const malformedUnit = JSON.parse(originalManifest) as {
      units: Array<Record<string, unknown>>;
    };
    malformedUnit.units[0]!.unexpected = true;
    writeFileSync(manifestAbsolutePath, `${JSON.stringify(malformedUnit, null, 2)}\n`, "utf8");
    expect(() => previewCommentaryQualityAuditAcceptanceSupersede({
      ...validInput,
      reviewer: "cjpher-delegated-luna-reviewer-fixture-round2",
      reviewedOn: "2026-08-22",
    })).toThrow("malformed bindings");

    const longRationale = JSON.parse(originalManifest) as {
      acceptance: { rationale: string; review_note: { path: string; sha256: string } };
    };
    longRationale.acceptance.rationale = "x".repeat(301);
    const reviewNoteAbsolutePath = join(root, longRationale.acceptance.review_note.path);
    const longRationaleReviewNote = readFileSync(reviewNoteAbsolutePath, "utf8").replace(
      `rationale: ${validInput.rationale}`,
      `rationale: ${longRationale.acceptance.rationale}`,
    );
    writeFileSync(reviewNoteAbsolutePath, longRationaleReviewNote, "utf8");
    longRationale.acceptance.review_note.sha256 = sha256(longRationaleReviewNote);
    writeFileSync(manifestAbsolutePath, `${JSON.stringify(longRationale, null, 2)}\n`, "utf8");
    expect(() => previewCommentaryQualityAuditAcceptanceSupersede({
      ...validInput,
      reviewer: "cjpher-delegated-luna-reviewer-fixture-round2",
      reviewedOn: "2026-08-22",
    })).toThrow("accepted Luna provenance is malformed");
  });

  it("refuses weak, colliding, and stale supersede candidates", () => {
    applyCommentaryQualityAuditAcceptance(validInput);
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A concise orientation.",
        "A materially revised orientation.",
      ),
    );
    writeCompletedAudit();
    writeCommentaryQualityAuditManifestPreview(DIALOGUE);
    const nextInput = {
      ...validInput,
      reviewer: "cjpher-delegated-luna-reviewer-fixture-round2",
      reviewedOn: "2026-08-22",
      rationale: "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    };
    expect(() => previewCommentaryQualityAuditAcceptanceSupersede({ ...nextInput, sampledCommentaryIds: [] })).toThrow(
      "explicitly provided",
    );
    const preview = previewCommentaryQualityAuditAcceptanceSupersede(nextInput);
    write(preview.predecessorManifestHistoryPath, "collision");
    expect(() => previewCommentaryQualityAuditAcceptanceSupersede(nextInput)).toThrow("path collision");

    rmSync(join(root, preview.predecessorManifestHistoryPath), { force: true });
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A materially revised orientation.",
        "A second materially revised orientation.",
      ),
    );
    writeCompletedAudit();
    expect(() => applyCommentaryQualityAuditAcceptanceSupersede(nextInput)).toThrow("stale");
  });
});

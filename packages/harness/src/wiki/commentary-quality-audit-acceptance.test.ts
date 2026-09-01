import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCommentaryCampaignManifest } from "../commentary-campaign.js";
import {
  assertCommentaryAuditSampleEvidenceReplay,
  buildCommentaryAuditSampleJob,
} from "../commentary-audit-sample-campaign.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_CODEX_CLI_VERSION,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_STAGE_EFFORT,
} from "../commentary-authoring.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { COMMENTARY_PROTOCOL_FIXTURE } from "../../test-support/commentary-protocol-fixture.js";
import {
  buildCommentaryQualityAuditManifestPreview,
  writeCommentaryQualityAuditManifestPreview,
  validateCommentaryQualityAuditManifest,
} from "./commentary-quality-audit.js";
import {
  applyCommentaryQualityAuditAcceptance,
  applyCommentaryQualityAuditAcceptanceSupersede,
  previewCommentaryQualityAuditAcceptance,
  previewCommentaryQualityAuditAcceptanceSupersede,
  validateCommentaryQualityAuditAcceptanceSample,
  type CommentaryQualityAuditAcceptanceInput,
} from "./commentary-quality-audit-acceptance.js";

const DIALOGUE = "fixture";
const ID = "comm_fixture_0001";
const GREEK = "{2a} alpha {2b} beta";
const ENGLISH = "{2a} first {2b} second";

let root = "";
let restoreRepoRoot: (() => void) | undefined;
let validInput: CommentaryQualityAuditAcceptanceInput;

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function codexSuccessJsonl(structuredOutput: unknown, usage: Record<string, number>) {
  return [
    JSON.stringify({ type: "thread.started", thread_id: "thread_fixture" }),
    JSON.stringify({ type: "turn.started" }),
    JSON.stringify({
      type: "item.completed",
      item: { id: "item_fixture", type: "agent_message", text: JSON.stringify(structuredOutput) },
    }),
    JSON.stringify({ type: "turn.completed", usage }),
  ].join("\n");
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

function writePassingSample(
  reviewedOn: string,
  rationale: string,
  options: { includeExecution?: boolean } = {},
): CommentaryQualityAuditAcceptanceInput {
  const manifest = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
  const pendingManifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
  const job = buildCommentaryAuditSampleJob({ manifest, pendingManifestContent });
  const review = {
    schema_version: 1 as const,
    dialogue: DIALOGUE,
    reviewer: {
      id: job.reviewer_id,
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    pending_manifest_sha256: job.pending_manifest_sha256,
    sample_packet_sha256: job.packet_sha256,
    sampled_commentary_ids: [...job.sampled_commentary_ids],
    sample_verdict: "pass" as const,
    blocks: job.sampled_commentary_ids.map((commentaryId) => ({
      commentary_id: commentaryId,
      verdict: "pass" as const,
      rationale: "The exact source, evidence, placement, and spoken-audio checks pass.",
    })),
    rationale,
  };
  const outputContent = `${JSON.stringify(review, null, 2)}\n`;
  const usage = {
    input_tokens: 120,
    cached_input_tokens: 80,
    cache_write_input_tokens: 4,
    output_tokens: 30,
    reasoning_output_tokens: 12,
  };
  const executionContent = codexSuccessJsonl(review, usage);
  const stateContent = `${JSON.stringify({
    schema_version: 1,
    campaign: "plato-commentary-independent-luna-sample",
    job_id: job.job_id,
    dialogue: job.dialogue,
    reviewer_id: job.reviewer_id,
    input_sha256: job.input_sha256,
    pending_manifest_sha256: job.pending_manifest_sha256,
    pending_manifest_path: job.pending_manifest_path,
    sample_packet_path: job.packet_path,
    sample_packet_sha256: job.packet_sha256,
    output_schema_path: job.output_schema_path,
    output_schema_sha256: job.output_schema_sha256,
    model_catalog_path: job.model_catalog_path,
    model_catalog_sha256: job.model_catalog_sha256,
    prompt_sha256: job.prompt_sha256,
    model: COMMENTARY_AUTHORING_MODEL,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    output_path: job.output_path,
    output_sha256: sha256(outputContent),
    execution_path: job.execution_path,
    execution_sha256: sha256(executionContent),
    sample_verdict: "pass",
    usage,
  }, null, 2)}\n`;
  write(job.pending_manifest_path, pendingManifestContent);
  write(job.packet_path, job.packet_content);
  write(job.output_schema_path, `${JSON.stringify(job.output_schema, null, 2)}\n`);
  write(job.output_path, outputContent);
  write(job.state_path, stateContent);
  if (options.includeExecution ?? true) write(job.execution_path, executionContent);
  return {
    dialogue: DIALOGUE,
    reviewer: job.reviewer_id,
    reviewedOn,
    rationale,
    sampledCommentaryIds: [...job.sampled_commentary_ids],
    sampleOutputPath: job.output_path,
  };
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
  validInput = writePassingSample(
    "2026-08-21",
    "The independent Luna sample supports acceptance of the bounded audit output.",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

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

  it("rejects hand-written pass output and state without the exact raw Codex execution", () => {
    rmSync(join(root, validInput.sampleOutputPath.replace("audit-sample-reviews", "audit-sample-executions").replace(/\.json$/u, ".jsonl")));
    expect(() => previewCommentaryQualityAuditAcceptance(validInput)).toThrow(
      "sample output, state, and raw Codex execution must either all exist or all be absent",
    );
  });

  it("recomputes the durable job identity instead of trusting copied evidence hashes", () => {
    const preview = previewCommentaryQualityAuditAcceptance(validInput);
    const evidence = JSON.parse(preview.sampleEvidence) as Parameters<
      typeof assertCommentaryAuditSampleEvidenceReplay
    >[0]["evidence"];
    evidence.job_id = "sample:fixture:forged0000000000";
    const pending = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(() => assertCommentaryAuditSampleEvidenceReplay({
      evidence,
      pendingManifestContent: `${JSON.stringify(pending, null, 2)}\n`,
      activeCommentaryIds: [ID],
    })).toThrow("durable job identity is stale or forged");

    const forgedInvocation = JSON.parse(preview.sampleEvidence) as Parameters<
      typeof assertCommentaryAuditSampleEvidenceReplay
    >[0]["evidence"];
    forgedInvocation.invocation.model_argument = "forged-model" as typeof forgedInvocation.invocation.model_argument;
    expect(() => assertCommentaryAuditSampleEvidenceReplay({
      evidence: forgedInvocation,
      pendingManifestContent: `${JSON.stringify(pending, null, 2)}\n`,
      activeCommentaryIds: [ID],
    })).toThrow("durable invocation does not replay exactly");
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
    expect(existsSync(join(root, preview.sampleEvidencePath))).toBe(false);
    expect(preview.manifest.acceptance).toMatchObject({ decision: "accepted", sampled_commentary_ids: [ID] });

    const applied = applyCommentaryQualityAuditAcceptance(validInput);
    expect(applied.applied).toBe(true);
    expect(sha256(readFileSync(join(root, applied.sampleEvidencePath), "utf8"))).toBe(applied.sampleEvidenceSha256);
    expect(applied.reviewNote).toContain(`sample_evidence_path: ${applied.sampleEvidencePath}`);
    expect(applied.reviewNote).toContain(`sample_evidence_sha256: ${applied.sampleEvidenceSha256}`);
    expect(readFileSync(join(root, applied.manifestPath), "utf8")).toBe(`${JSON.stringify(applied.manifest, null, 2)}\n`);
    expect(validateCommentaryQualityAuditManifest(applied.manifestPath, readFileSync(join(root, applied.manifestPath), "utf8"))).toEqual([]);
    expect(() => applyCommentaryQualityAuditAcceptance(validInput)).toThrow("Refusing to overwrite");

    write(applied.sampleEvidencePath, `${applied.sampleEvidence.trimEnd()} \n`);
    expect(
      validateCommentaryQualityAuditManifest(
        applied.manifestPath,
        readFileSync(join(root, applied.manifestPath), "utf8"),
      ).map((issue) => issue.code),
    ).toContain("invalid_review_note");
  });

  it("rejects a pending preview when the canonical ledger changes after preview", () => {
    const pendingPath = join(root, "wiki/commentary/fixture.md");
    writeFileSync(pendingPath, `${readFileSync(pendingPath, "utf8")}\n`, "utf8");
    expect(() => previewCommentaryQualityAuditAcceptance(validInput)).toThrow("is stale");
  });

  it("rejects a symlinked scratch sample output even when the target bytes are valid", () => {
    const outputAbsolutePath = join(root, validInput.sampleOutputPath);
    const content = readFileSync(outputAbsolutePath, "utf8");
    const aliasTarget = join(root, "outside-scratch/sample.json");
    mkdirSync(join(aliasTarget, ".."), { recursive: true });
    writeFileSync(aliasTarget, content, "utf8");
    rmSync(outputAbsolutePath);
    symlinkSync(aliasTarget, outputAbsolutePath);
    expect(() => previewCommentaryQualityAuditAcceptance(validInput)).toThrow(
      "canonical regular non-symlink file",
    );
  });

  it("rejects a symlinked canonical evidence parent before any acceptance write", () => {
    const canonicalParent = join(root, "wiki/submissions/commentary-audit-sample");
    const aliasTarget = join(root, "outside-canonical-evidence");
    mkdirSync(join(canonicalParent, ".."), { recursive: true });
    mkdirSync(aliasTarget, { recursive: true });
    symlinkSync(aliasTarget, canonicalParent, "dir");
    expect(() => applyCommentaryQualityAuditAcceptance(validInput)).toThrow(
      "traverses a symlink or realpath alias",
    );
    expect(existsSync(join(root, "wiki/commentary-audits/fixture.json"))).toBe(false);
  });

  it("supersedes a changed-ledger acceptance with content-addressed predecessor history", () => {
    const initial = applyCommentaryQualityAuditAcceptance(validInput);
    const oldManifest = readFileSync(join(root, initial.manifestPath), "utf8");
    const oldReviewNote = readFileSync(join(root, initial.reviewNotePath), "utf8");
    const oldLedger = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8");

    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A concise orientation.",
        "A materially revised orientation.",
      ),
    );
    writeCompletedAudit();
    writeCommentaryQualityAuditManifestPreview(DIALOGUE);

    const nextInput = writePassingSample(
      "2026-08-22",
      "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    );
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
    expect(readFileSync(join(root, applied.predecessorLedgerHistoryPath), "utf8")).toBe(oldLedger);
    expect(readFileSync(join(root, initial.reviewNotePath), "utf8")).toBe(oldReviewNote);
    expect(validateCommentaryQualityAuditManifest(applied.manifestPath, readFileSync(join(root, applied.manifestPath), "utf8"))).toEqual([]);
    expect(() => applyCommentaryQualityAuditAcceptanceSupersede(nextInput)).toThrow("unchanged");

    writeFileSync(join(root, applied.predecessorManifestHistoryPath), `${oldManifest.trimEnd()} \n`, "utf8");
    expect(
      validateCommentaryQualityAuditManifest(
        applied.manifestPath,
        readFileSync(join(root, applied.manifestPath), "utf8"),
      ).map((issue) => issue.code),
    ).toContain("invalid_review_note");
    writeFileSync(join(root, applied.predecessorManifestHistoryPath), oldManifest, "utf8");
    rmSync(join(root, applied.predecessorLedgerHistoryPath));
    expect(
      validateCommentaryQualityAuditManifest(
        applied.manifestPath,
        readFileSync(join(root, applied.manifestPath), "utf8"),
      ).map((issue) => issue.code),
    ).toContain("invalid_review_note");
  });

  it("rejects a predecessor whose embedded audit bytes drift from its durable sample evidence", () => {
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

    const nextInput = writePassingSample(
      "2026-08-22",
      "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    );
    expect(() => previewCommentaryQualityAuditAcceptanceSupersede(nextInput)).toThrow(
      "preserved ledger and embedded audit coverage differ",
    );
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
    const nextInput = writePassingSample(
      "2026-08-22",
      "A fresh independent Luna sample supports the changed-ledger audit acceptance.",
    );
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

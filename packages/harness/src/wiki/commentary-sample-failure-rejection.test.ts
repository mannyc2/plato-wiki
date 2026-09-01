import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COMMENTARY_PROTOCOL_FIXTURE } from "../../test-support/commentary-protocol-fixture.js";
import { buildCommentaryAuditSampleJob } from "../commentary-audit-sample-campaign.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_CODEX_CLI_VERSION,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "../commentary-authoring.js";
import { buildCommentaryCampaignManifest } from "../commentary-campaign.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  buildCommentaryQualityAuditManifestPreview,
  writeCommentaryQualityAuditManifestPreview,
} from "./commentary-quality-audit.js";
import {
  applyCommentarySampleFailureRejection,
  previewCommentarySampleFailureRejection,
  verifyCommentarySampleFailureRejection,
  type CommentarySampleFailureRejectionInput,
} from "./commentary-sample-failure-rejection.js";
import { validateCommentaryLedger } from "./commentary-validator.js";

const DIALOGUE = "fixture";
const IDS = ["comm_fixture_0001", "comm_fixture_0002", "comm_fixture_0003"];
const FAILED_IDS = [IDS[0]!, IDS[2]!];
const GREEK = "{2a} alpha {2b} beta {2c} gamma {2d} delta {2e} epsilon {3a} zeta";
const ENGLISH = "{2a} first {2b} second {2c} third {2d} fourth {2e} fifth {3a} sixth";

let root = "";
let restoreRepoRoot: (() => void) | undefined;
let input: CommentarySampleFailureRejectionInput;

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function ledgerBlock(id: string, span: string, title: string) {
  const ref = resolveSourceSpan(DIALOGUE, span).source_ref;
  return [
    "```yaml",
    `commentary_id: ${id}`,
    "source_work: Fixture",
    "block_kind: section",
    "placement: before",
    `title: ${JSON.stringify(title)}`,
    `stephanus_span: ${span}`,
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: "${ref.text_sha256}"`,
    `body: ${JSON.stringify(`${title} orientation remains concise.`)}`,
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: model",
    "review_status: accepted",
    "```",
  ].join("\n");
}

function writeLedger() {
  write(
    `wiki/commentary/${DIALOGUE}.md`,
    [
      "# Fixture Commentary",
      "",
      ledgerBlock(IDS[0]!, "2a-2b", "First"),
      "",
      ledgerBlock(IDS[1]!, "2c-2d", "Second"),
      "",
      ledgerBlock(IDS[2]!, "2e-3a", "Third"),
      "",
    ].join("\n"),
  );
}

function writeCompletedAudits() {
  const jobs = buildCommentaryCampaignManifest({ dialogue: DIALOGUE, stage: "audit" }).jobs;
  expect(jobs).toHaveLength(3);
  for (const job of jobs) {
    const id = job.section_id!;
    const output = {
      schema_version: 3,
      dialogue: DIALOGUE,
      unit_key: job.unit_key!,
      section_id: id,
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      unit_verdict: "pass",
      blocks: [{
        commentary_id: id,
        disposition: "pass",
        issue_codes: [],
        checks: {
          evidence: { verdict: "pass" },
          placement: { verdict: "pass", hazard_codes: [] },
          listening: { verdict: "pass" },
        },
        rationale: "The block earns its place in the listening sequence.",
      }],
    };
    const outputContent = `${JSON.stringify(output, null, 2)}\n`;
    write(job.output_path, outputContent);
    write(job.state_path, `${JSON.stringify({
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
    }, null, 2)}\n`);
  }
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

function writeFailedSample(): CommentarySampleFailureRejectionInput {
  const manifest = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
  const pendingManifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
  const job = buildCommentaryAuditSampleJob({ manifest, pendingManifestContent });
  expect(job.sampled_commentary_ids).toEqual(IDS);
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
    sample_verdict: "fail" as const,
    blocks: job.sampled_commentary_ids.map((commentaryId) => ({
      commentary_id: commentaryId,
      verdict: FAILED_IDS.includes(commentaryId) ? "fail" as const : "pass" as const,
      rationale: FAILED_IDS.includes(commentaryId)
        ? `Concrete independent defect in ${commentaryId}.`
        : "The block remains source-bound and earns its listening place.",
    })),
    rationale: "Two sampled blocks have concrete defects and cannot remain accepted.",
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
    sample_verdict: "fail",
    usage,
  }, null, 2)}\n`;
  write(job.pending_manifest_path, pendingManifestContent);
  write(job.packet_path, job.packet_content);
  write(job.output_schema_path, `${JSON.stringify(job.output_schema, null, 2)}\n`);
  write(job.output_path, outputContent);
  write(job.state_path, stateContent);
  write(job.execution_path, executionContent);
  return {
    dialogue: DIALOGUE,
    reviewedOn: "2026-09-01",
    expectedLedgerSha256: manifest.ledger.sha256,
    failedCommentaryIds: [...FAILED_IDS],
    sampleOutputPath: job.output_path,
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-sample-rejection-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  write(`raw/plato/greek/${DIALOGUE}.txt`, GREEK);
  write(`raw/plato/english/${DIALOGUE}.txt`, ENGLISH);
  write(`audio/speaker-attributions/${DIALOGUE}.json`, `${JSON.stringify({
    schema_version: 2,
    dialogue: DIALOGUE,
    english_sha256: sha256(ENGLISH),
    status: "accepted",
    segments: [{ id: "turn_fixture_0001", start_char: 0, end_char: ENGLISH.length, character_id: "fixture" }],
  }, null, 2)}\n`);
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  write(
    "packages/harness/src/commentary-luna-model-catalog.json",
    readFileSync(join(import.meta.dir, "../commentary-luna-model-catalog.json"), "utf8"),
  );
  writeLedger();
  const ledgerPath = `wiki/commentary/${DIALOGUE}.md`;
  const ledgerIssues = validateCommentaryLedger(ledgerPath, readFileSync(join(root, ledgerPath), "utf8"));
  if (ledgerIssues.length > 0) throw new Error(JSON.stringify(ledgerIssues, null, 2));
  writeCompletedAudits();
  writeCommentaryQualityAuditManifestPreview(DIALOGUE);
  input = writeFailedSample();
});

afterEach(() => {
  restoreRepoRoot?.();
  restoreRepoRoot = undefined;
  rmSync(root, { recursive: true, force: true });
});

describe("commentary independent-sample failure rejection lane", () => {
  it("previews dry and atomically preserves exact failed evidence, item rationales, receipt, and submission", () => {
    const before = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8");
    const preview = previewCommentarySampleFailureRejection(input);
    expect(preview.applied).toBe(false);
    expect(preview.failedBlocks.map((block) => block.commentary_id)).toEqual(FAILED_IDS);
    expect(preview.receipt).toContain("sample_verdict: fail");
    expect(preview.receipt).toContain(`rationale_sha256: ${sha256(preview.failedBlocks[0]!.rationale)}`);
    expect(existsSync(join(root, preview.sampleEvidencePath))).toBe(false);
    expect(existsSync(join(root, preview.receiptPath))).toBe(false);
    expect(existsSync(join(root, preview.submissionPath))).toBe(false);
    expect(readFileSync(join(root, preview.ledgerPath), "utf8")).toBe(before);

    const applied = applyCommentarySampleFailureRejection(input);
    expect(applied.applied).toBe(true);
    expect(sha256(readFileSync(join(root, applied.sampleEvidencePath)))).toBe(applied.sampleEvidenceSha256);
    expect(sha256(readFileSync(join(root, applied.receiptPath)))).toBe(applied.receiptSha256);
    expect(sha256(readFileSync(join(root, applied.submissionPath)))).toBe(applied.submissionSha256);
    const after = readFileSync(join(root, applied.ledgerPath), "utf8");
    expect(after.match(/review_status: rejected/gu)?.length).toBe(2);
    expect(after.match(/review_status: accepted/gu)?.length).toBe(1);
    expect(after.replace(/review_status: (?:accepted|rejected)/gu, "review_status: status")).toBe(
      before.replace(/review_status: accepted/gu, "review_status: status"),
    );
    expect(verifyCommentarySampleFailureRejection(applied.submissionPath).failedCommentaryIds).toEqual(FAILED_IDS);
  });

  it("replays committed evidence, receipt, submission, and exact status-only ledger transition", () => {
    const applied = applyCommentarySampleFailureRejection(input);
    const receipt = readFileSync(join(root, applied.receiptPath), "utf8");
    writeFileSync(join(root, applied.receiptPath), `${receipt.trimEnd()} \n`, "utf8");
    expect(() => verifyCommentarySampleFailureRejection(applied.submissionPath)).toThrow(/receipt/u);
    writeFileSync(join(root, applied.receiptPath), receipt, "utf8");

    const evidence = readFileSync(join(root, applied.sampleEvidencePath), "utf8");
    writeFileSync(join(root, applied.sampleEvidencePath), `${evidence.trimEnd()} \n`, "utf8");
    expect(() => verifyCommentarySampleFailureRejection(applied.submissionPath)).toThrow(/evidence hash/u);
    writeFileSync(join(root, applied.sampleEvidencePath), evidence, "utf8");

    const ledger = readFileSync(join(root, applied.ledgerPath), "utf8");
    writeFileSync(join(root, applied.ledgerPath), `${ledger}\n`, "utf8");
    expect(() => verifyCommentarySampleFailureRejection(applied.submissionPath)).toThrow(/current commentary ledger/iu);
  });

  it("rejects forged output and missing or tampered state/execution provenance", () => {
    const output = join(root, input.sampleOutputPath);
    writeFileSync(output, readFileSync(output, "utf8").replace("Concrete independent defect", "Forged defect"), "utf8");
    expect(() => previewCommentarySampleFailureRejection(input)).toThrow(/state bindings|raw Codex execution/u);

    input = writeFailedSample();
    const statePath = input.sampleOutputPath.replace("audit-sample-reviews", "audit-sample-state");
    rmSync(join(root, statePath));
    expect(() => previewCommentarySampleFailureRejection(input)).toThrow("must either all exist or all be absent");

    input = writeFailedSample();
    const executionPath = input.sampleOutputPath
      .replace("audit-sample-reviews", "audit-sample-executions")
      .replace(/\.json$/u, ".jsonl");
    writeFileSync(join(root, executionPath), `${readFileSync(join(root, executionPath), "utf8")}\n`, "utf8");
    expect(() => previewCommentarySampleFailureRejection(input)).toThrow(/execution|state/u);
  });

  it("requires the complete failed set in canonical sampled order and a fail verdict for every named id", () => {
    expect(() => previewCommentarySampleFailureRejection({
      ...input,
      failedCommentaryIds: [...FAILED_IDS].reverse(),
    })).toThrow("canonical sampled order");
    expect(() => previewCommentarySampleFailureRejection({
      ...input,
      failedCommentaryIds: [IDS[1]!],
    })).toThrow("every failed sample block");
    expect(() => previewCommentarySampleFailureRejection({
      ...input,
      failedCommentaryIds: [FAILED_IDS[0]!],
    })).toThrow("every failed sample block");
  });

  it("fails closed on a stale ledger and symlinked scratch or canonical paths", () => {
    const ledgerPath = join(root, `wiki/commentary/${DIALOGUE}.md`);
    writeFileSync(ledgerPath, `${readFileSync(ledgerPath, "utf8")}\n`, "utf8");
    expect(() => previewCommentarySampleFailureRejection(input)).toThrow(/stale|current pending|Current independent sample output/u);

    writeLedger();
    const outputPath = join(root, input.sampleOutputPath);
    const output = readFileSync(outputPath, "utf8");
    const aliasTarget = join(root, "outside/sample.json");
    mkdirSync(join(aliasTarget, ".."), { recursive: true });
    writeFileSync(aliasTarget, output, "utf8");
    rmSync(outputPath);
    symlinkSync(aliasTarget, outputPath);
    expect(() => previewCommentarySampleFailureRejection(input)).toThrow("canonical regular non-symlink file");

    rmSync(outputPath);
    writeFileSync(outputPath, output, "utf8");
    const canonicalParent = join(root, "wiki/submissions/commentary-sample-failure-rejection");
    const outside = join(root, "outside-canonical");
    mkdirSync(join(canonicalParent, ".."), { recursive: true });
    mkdirSync(outside, { recursive: true });
    symlinkSync(outside, canonicalParent, "dir");
    const before = readFileSync(ledgerPath, "utf8");
    expect(() => applyCommentarySampleFailureRejection(input)).toThrow("traverses a symlink or realpath alias");
    expect(readFileSync(ledgerPath, "utf8")).toBe(before);
  });

  it("refuses overwrite collisions and rolls every artifact and status back after a commit-stage fault", () => {
    const preview = previewCommentarySampleFailureRejection(input);
    write(preview.receiptPath, "collision\n");
    const before = readFileSync(join(root, preview.ledgerPath), "utf8");
    expect(() => applyCommentarySampleFailureRejection(input)).toThrow("Refusing to overwrite");
    expect(readFileSync(join(root, preview.ledgerPath), "utf8")).toBe(before);
    expect(existsSync(join(root, preview.sampleEvidencePath))).toBe(false);
    expect(existsSync(join(root, preview.submissionPath))).toBe(false);

    rmSync(join(root, preview.receiptPath));
    expect(() => applyCommentarySampleFailureRejection(input, {
      faultInjector: (stage) => {
        if (stage === "after_ledger") throw new Error("injected post-ledger fault");
      },
    })).toThrow("injected post-ledger fault");
    expect(readFileSync(join(root, preview.ledgerPath), "utf8")).toBe(before);
    expect(existsSync(join(root, preview.sampleEvidencePath))).toBe(false);
    expect(existsSync(join(root, preview.receiptPath))).toBe(false);
    expect(existsSync(join(root, preview.submissionPath))).toBe(false);
  });
});

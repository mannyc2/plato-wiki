import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { buildCommentaryCampaignPlan } from "../commentary-campaign.js";
import { writeCommentaryAuditBriefs } from "../commentary-audit.js";
import { COMMENTARY_PROTOCOL_FIXTURE } from "../../test-support/commentary-protocol-fixture.js";
import {
  applyCommentaryStructuralRemediation,
  previewCommentaryStructuralRemediation,
  type CommentaryStructuralRemediationInput,
} from "./commentary-structural-remediation.js";

const DIALOGUE = "fixture";
const ID = "comm_fixture_0001";
const ID2 = "comm_fixture_0002";
const UNIT = "01-2a-2b";
const SECTION = ID;
const AUDIT_PATH = `scratch/commentary/audits/${DIALOGUE}/${UNIT}.json`;

let root = "";
let restoreRoot: (() => void) | undefined;

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function sourceRef(span: string) {
  const ref = resolveSourceSpan(DIALOGUE, span).source_ref;
  return [
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: \"${ref.text_sha256}\"`,
  ].join("\n");
}

function block(id: string, span: string, title: string, status = "accepted") {
  return [
    "```yaml",
    `commentary_id: ${id}`,
    "source_work: Fixture",
    "block_kind: section",
    "placement: before",
    `title: \"${title}\"`,
    `stephanus_span: ${span}`,
    sourceRef(span),
    'body: "A concise orientation for the listener."',
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

function ledger(twoBlocks = false, secondStatus = "accepted") {
  return `# Fixture commentary\n\n${block(ID, "2a-2b", "Opening")}${twoBlocks ? block(ID2, "3a", "Second", secondStatus) : ""}`;
}

function writeAudit(options: { twoBlocks?: boolean; auditOnlyFirst?: boolean; firstDisposition?: "remove" | "rewrite" | "pass" | "split"; secondDisposition?: "remove" | "rewrite" | "pass" | "split"; placementVerdict?: "fail" | "pass"; evidenceVerdict?: "pass" | "fail"; listeningVerdict?: "pass" | "fail" }) {
  const placementVerdict = options.placementVerdict ?? "fail";
  const evidenceVerdict = options.evidenceVerdict ?? "pass";
  const listeningVerdict = options.listeningVerdict ?? "pass";
  const removeBlock = (commentaryId: string, disposition: "remove" | "rewrite" | "pass" | "split") => ({
    commentary_id: commentaryId,
    disposition,
    issue_codes: disposition === "pass" ? [] : [
      ...(placementVerdict === "fail" ? ["interrupts_dramatic_flow"] : []),
      ...(evidenceVerdict === "fail" ? ["source_misreading"] : []),
      ...(listeningVerdict === "fail" ? ["hard_to_follow_aloud"] : []),
    ],
    checks: {
      evidence: { verdict: disposition === "pass" ? "pass" : evidenceVerdict },
      placement: { verdict: disposition === "pass" ? "pass" : placementVerdict, hazard_codes: disposition === "pass" || placementVerdict === "pass" ? [] : ["sentence_or_clause_split"] },
      listening: { verdict: disposition === "pass" ? "pass" : listeningVerdict },
    },
    rationale: disposition === "pass" ? "This block earns its place in the listening sequence." : "The finding requires structural adjudication.",
  });
  const firstDisposition = options.firstDisposition ?? "remove";
  const secondDisposition = options.secondDisposition ?? "remove";
  const output = {
    schema_version: 3,
    dialogue: DIALOGUE,
    unit_key: UNIT,
    section_id: SECTION,
    authoring: { model: "gpt-5.6-luna", effort: "medium" },
    unit_verdict: firstDisposition === "pass" && (!options.twoBlocks || secondDisposition === "pass") ? "pass" : "fail",
    blocks: [
      removeBlock(ID, firstDisposition),
      ...(options.twoBlocks && !options.auditOnlyFirst ? [removeBlock(ID2, secondDisposition)] : []),
    ],
  };
  const content = `${JSON.stringify(output, null, 2)}\n`;
  write(AUDIT_PATH, content);
  return { content, output };
}

function prepare(options: { twoBlocks?: boolean; auditOnlyFirst?: boolean; firstDisposition?: "remove" | "rewrite" | "pass" | "split"; secondDisposition?: "remove" | "rewrite" | "pass" | "split"; placementVerdict?: "fail" | "pass"; evidenceVerdict?: "pass" | "fail"; listeningVerdict?: "pass" | "fail" } = {}) {
  const english = "{2a} Alpha asks. {2b} Beta answers.\n{3a} Gamma replies.";
  const attribution = `${JSON.stringify({
    schema_version: 2,
    dialogue: DIALOGUE,
    english_sha256: sha256(english),
    status: "accepted",
    segments: [{ id: "turn_fixture_audio_0001", start_char: 0, end_char: english.length, character_id: "socrates" }],
  }, null, 2)}\n`;
  write("raw/plato/greek/fixture.txt", "{2a} alpha {2b} beta {3a} gamma");
  write("raw/plato/english/fixture.txt", english);
  write("audio/speaker-attributions/fixture.json", attribution);
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  const before = ledger(options.twoBlocks);
  write(`wiki/commentary/${DIALOGUE}.md`, before);
  const audit = writeAudit(options);
  write("packages/harness/src/commentary-luna-model-catalog.json", readFileSync(join(import.meta.dir, "../commentary-luna-model-catalog.json"), "utf8"));
  writeCommentaryAuditBriefs(DIALOGUE);
  const plan = buildCommentaryCampaignPlan({ dialogue: DIALOGUE, stage: "audit" });
  const job = plan.manifest.jobs.find((candidate) => candidate.unit_key === UNIT);
  if (!job) throw new Error("fixture audit job missing");
  const stateContent = `${JSON.stringify({
    schema_version: 3,
    job_id: job.job_id,
    stage: job.stage,
    input_sha256: job.input_sha256,
    output_schema_sha256: job.output_schema_sha256,
    model_argument: job.model_argument,
    codex_cli_version: job.codex_cli_version,
    model_catalog_path: job.model_catalog_path,
    model_catalog_sha256: job.model_catalog_sha256,
    authoring_model: job.authoring_model,
    effort: job.effort,
    permission_mode: job.permission_mode,
    output_path: job.output_path,
    output_sha256: sha256(audit.content),
  }, null, 2)}\n`;
  write(job.state_path, stateContent);
  write(job.state_path.replace(/\.json$/u, ".usage.json"), `${JSON.stringify({
    schema_version: 1,
    campaign: "plato-commentary-quality",
    attempt_id: "fixture-attempt",
    job_id: job.job_id,
    dialogue: DIALOGUE,
    stage: "audit",
    unit_key: UNIT,
    input_sha256: job.input_sha256,
    outcome: "generated",
    exit_code: 0,
  })}\n`);
  return {
    before,
    audit,
    input: (overrides: Partial<CommentaryStructuralRemediationInput> = {}): CommentaryStructuralRemediationInput => ({
      dialogue: DIALOGUE,
      unitKey: UNIT,
      sectionId: SECTION,
      auditOutputPath: AUDIT_PATH,
      auditOutputSha256: sha256(audit.content),
      expectedLedgerSha256: sha256(before),
      expectedAttributionSha256: sha256(attribution),
      expectedEnglishSha256: sha256(english),
      operations: [{
        operation: "reanchor",
        commentaryId: ID,
        audioInsertion: {
          attribution_path: "audio/speaker-attributions/fixture.json",
          attribution_sha256: sha256(attribution),
          english_sha256: sha256(english),
          turn_id: "turn_fixture_audio_0001",
          edge: "before",
        },
      }],
      reviewer: "operator-delegated-luna-reviewer-structural-fixture",
      reviewedOn: "2026-08-23",
      rationale: "Independent Luna review binds the structural boundary to current source hashes.",
      ...overrides,
    }),
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-structural-remediation-"));
  restoreRoot = setRepoRootForTesting(root);
});

afterEach(() => {
  restoreRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("commentary structural remediation", () => {
  it("previews a placement-only reanchor without writing", () => {
    const fixture = prepare();
    const preview = previewCommentaryStructuralRemediation(fixture.input());
    expect(preview.applied).toBe(false);
    expect(preview.prospectiveLedger).toContain("audio_insertion:");
    expect(readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8")).toBe(fixture.before);
    expect(existsSync(join(root, "wiki/review"))).toBe(false);
    expect(existsSync(join(root, "wiki/submissions"))).toBe(false);
  });

  it("applies a reanchor with a submission record and canonical receipt", () => {
    const fixture = prepare();
    const result = applyCommentaryStructuralRemediation(fixture.input());
    expect(result.applied).toBe(true);
    expect(readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8")).toBe(result.prospectiveLedger);
    expect(result.submissionRecordPath).toMatch(/^wiki\/submissions\/commentary\/fixture\/\d{4}-structural-remediation-01-2a-2b\.json$/u);
    const record = JSON.parse(readFileSync(join(root, result.submissionRecordPath), "utf8")) as Record<string, unknown>;
    expect(record.target_sha256_before).toBe(sha256(fixture.before));
    expect(record.target_sha256_after).toBe(sha256(result.prospectiveLedger));
    expect(readFileSync(join(root, result.receiptPath), "utf8")).toContain(`submission_record_path: ${result.submissionRecordPath}`);
  });

  it("removes an accepted block by terminally rejecting it", () => {
    const fixture = prepare({ twoBlocks: true, auditOnlyFirst: true, secondDisposition: "pass" });
    const result = applyCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID }],
    }));
    expect(result.prospectiveLedger).toContain("review_status: rejected");
    expect(result.prospectiveLedger).not.toContain("audio_insertion:");
  });

  it("fails closed when remediation would reject the final accepted block", () => {
    const fixture = prepare();
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID }],
    }))).toThrow("must retain at least one accepted commentary block");
    expect(readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8")).toBe(fixture.before);
    expect(existsSync(join(root, "wiki/review"))).toBe(false);
    expect(existsSync(join(root, "wiki/submissions"))).toBe(false);
  });

  it("requires canonical ledger order for multiple operations", () => {
    const fixture = prepare({ twoBlocks: true, auditOnlyFirst: true });
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID2 }, { operation: "remove", commentaryId: ID }],
    }))).toThrow("canonical current-ledger order");
  });

  it("fails closed for unsupported split and non-remove findings", () => {
    const fixture = prepare();
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "split", commentaryId: ID }],
    }))).toThrow("explicitly unsupported");
    const pass = prepare({ firstDisposition: "pass", placementVerdict: "pass" });
    expect(() => previewCommentaryStructuralRemediation(pass.input())).toThrow("not a semantic-fail audit");
  });

  it("requires an exact split-to-reject override for split findings", () => {
    const fixture = prepare({ firstDisposition: "split", placementVerdict: "pass", listeningVerdict: "fail" });
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID }],
    }))).toThrow("split finding requires remove with splitResolution reject-original");
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID, splitResolution: "accept-original" as "reject-original" }],
    }))).toThrow("splitResolution");
  });

  it("explicitly resolves a split finding by rejecting the original and records the resolution", () => {
    const fixture = prepare({ twoBlocks: true, auditOnlyFirst: true, secondDisposition: "pass", firstDisposition: "split", placementVerdict: "pass", listeningVerdict: "fail" });
    const result = applyCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID, splitResolution: "reject-original" }],
    }));
    expect(result.prospectiveLedger).toContain("review_status: rejected");
    expect(result.auditFindings).toEqual([{ commentaryId: ID, disposition: "split", splitResolution: "reject-original" }]);
    expect(result.receipt).toContain("audited_disposition: split");
    expect(result.receipt).toContain("split_resolution: reject-original");
    const record = JSON.parse(readFileSync(join(root, result.submissionRecordPath), "utf8")) as { submission: { audit_findings: unknown } };
    expect(record.submission.audit_findings).toEqual([{ commentaryId: ID, disposition: "split", splitResolution: "reject-original" }]);
  });

  it("requires an exact rewrite-to-reject override for rewrite findings", () => {
    const fixture = prepare({ firstDisposition: "rewrite", placementVerdict: "pass", evidenceVerdict: "fail" });
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID }],
    }))).toThrow("rewrite finding requires remove with rewriteResolution reject-original");
    expect(() => previewCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID, rewriteResolution: "accept-original" as "reject-original" }],
    }))).toThrow("rewriteResolution");
  });

  it("explicitly resolves a rewrite finding by rejecting the original and records the resolution", () => {
    const fixture = prepare({ twoBlocks: true, auditOnlyFirst: true, secondDisposition: "pass", firstDisposition: "rewrite", placementVerdict: "pass", evidenceVerdict: "fail" });
    const result = applyCommentaryStructuralRemediation(fixture.input({
      operations: [{ operation: "remove", commentaryId: ID, rewriteResolution: "reject-original" }],
    }));
    expect(result.prospectiveLedger).toContain("review_status: rejected");
    expect(result.auditFindings).toEqual([{ commentaryId: ID, disposition: "rewrite", rewriteResolution: "reject-original" }]);
    expect(result.receipt).toContain("audited_disposition: rewrite");
    expect(result.receipt).toContain("rewrite_resolution: reject-original");
    expect(readFileSync(join(root, result.receiptPath), "utf8")).toContain("rewrite_resolution: reject-original");
    const record = JSON.parse(readFileSync(join(root, result.submissionRecordPath), "utf8")) as { submission: { audit_findings: unknown } };
    expect(record.submission.audit_findings).toEqual([{ commentaryId: ID, disposition: "rewrite", rewriteResolution: "reject-original" }]);
  });

  it("forbids rewrite resolution on non-rewrite findings and non-remove operations", () => {
    const removeFixture = prepare();
    expect(() => previewCommentaryStructuralRemediation(removeFixture.input({
      operations: [{ operation: "remove", commentaryId: ID, rewriteResolution: "reject-original" }],
    }))).toThrow("rewriteResolution reject-original is only valid for rewrite findings");

    const reanchorFixture = prepare();
    expect(() => previewCommentaryStructuralRemediation(reanchorFixture.input({
      operations: [{
        operation: "reanchor",
        commentaryId: ID,
        rewriteResolution: "reject-original",
        audioInsertion: reanchorFixture.input().operations[0]!.audioInsertion,
      }],
    }))).toThrow("rewriteResolution is only allowed on remove operation");

    const splitFixture = prepare({ firstDisposition: "split", placementVerdict: "pass", listeningVerdict: "fail" });
    expect(() => previewCommentaryStructuralRemediation(splitFixture.input({
      operations: [{ operation: "remove", commentaryId: ID, rewriteResolution: "reject-original" }],
    }))).toThrow("rewriteResolution reject-original is only valid for rewrite findings");
  });

  it("requires evidence and listening to pass for reanchor", () => {
    const fixture = prepare({ listeningVerdict: "fail" });
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow("evidence/listening pass");
  });

  it("rejects stale ledger, source, output, and invalid reviewer bindings", () => {
    const fixture = prepare();
    expect(() => previewCommentaryStructuralRemediation(fixture.input({ expectedLedgerSha256: "0".repeat(64) }))).toThrow("ledger hash");
    expect(() => previewCommentaryStructuralRemediation(fixture.input({ expectedAttributionSha256: "0".repeat(64) }))).toThrow("attribution hash");
    expect(() => previewCommentaryStructuralRemediation(fixture.input({ auditOutputSha256: "0".repeat(64) }))).toThrow("audit output hash");
    expect(() => previewCommentaryStructuralRemediation(fixture.input({ reviewer: "human-reviewer" }))).toThrow("delegated Luna");
  });

  it("does not overwrite a receipt or leave a ledger mutation on a collision", () => {
    const fixture = prepare();
    const preview = previewCommentaryStructuralRemediation(fixture.input());
    write(preview.receiptPath, "existing\n");
    expect(() => applyCommentaryStructuralRemediation(fixture.input())).toThrow("Refusing to overwrite");
    expect(readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8")).toBe(fixture.before);
  });

  it("rejects a sibling or target ledger change after the audit artifact was produced", () => {
    const fixture = prepare();
    write("wiki/commentary/fixture.md", `${fixture.before}${block(ID2, "3a", "New sibling")}`);
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/current audit (state|brief)|ledger hash/u);
  });

  it("rejects brief drift, state mismatch, and missing telemetry", () => {
    let fixture = prepare();
    const briefPath = "scratch/commentary/audit-briefs/fixture/01-2a-2b.md";
    write(briefPath, `${readFileSync(join(root, briefPath), "utf8")}drift\n`);
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/brief/u);

    fixture = prepare();
    const statePath = "scratch/commentary/campaign-state/fixture/audit-01-2a-2b.json";
    const state = JSON.parse(readFileSync(join(root, statePath), "utf8")) as Record<string, unknown>;
    state.input_sha256 = "0".repeat(64);
    write(statePath, `${JSON.stringify(state)}\n`);
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/state/u);

    fixture = prepare();
    unlinkSync(join(root, statePath.replace(/\.json$/u, ".usage.json")));
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/telemetry/u);

    fixture = prepare();
    unlinkSync(join(root, statePath));
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/state/u);
  });

  it("rejects source and protocol drift even when the candidate ledger hash is unchanged", () => {
    let fixture = prepare();
    write("raw/plato/english/fixture.txt", "{2a} Altered asks. {2b} Beta answers.\n{3a} Gamma replies.");
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/current audit (state|brief)|stale/u);

    fixture = prepare();
    write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE.replace("Use accepted citations", "Protocol drift replaces accepted citations"));
    expect(() => previewCommentaryStructuralRemediation(fixture.input())).toThrow(/current audit (state|brief)|stale/u);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildCommentaryCampaignManifest,
} from "./commentary-campaign.js";
import {
  buildCommentaryAuditBriefs,
  buildCommentaryRewriteEvidenceSupplement,
  buildCommentaryRewriteEvidenceContext,
  writeCommentaryAuditBriefs,
  writeCommentaryRewriteEvidenceSupplement,
} from "./commentary-audit.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "./commentary-authoring.js";
import { setRepoRootForTesting } from "./paths.js";
import { resolveSourceSpan } from "./source.js";
import { COMMENTARY_PROTOCOL_FIXTURE } from "../test-support/commentary-protocol-fixture.js";
import { writeOntologyVNextFixture } from "../test-support/ontology-vnext-fixture.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function sourceRef(dialogue: string, span: string) {
  const ref = resolveSourceSpan(dialogue, span).source_ref;
  return [
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: ${ref.text_sha256}`,
  ].join("\n");
}

function setup() {
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  write(
    "packages/harness/src/commentary-luna-model-catalog.json",
    readFileSync(join(import.meta.dir, "commentary-luna-model-catalog.json"), "utf8"),
  );
  write("raw/plato/greek/fixture.txt", "{1e} before question {2a} alpha {2b} beta {3a} gamma {3b} after answer");
  const english = "{1e} Before question?\n{2a} Alpha. {2b} Beta. {3a} Gamma {3b} continues after.\n";
  write("raw/plato/english/fixture.txt", english);
  write("audio/speaker-attributions/fixture.json", `${JSON.stringify({
    schema_version: 2,
    dialogue: "fixture",
    english_sha256: createHash("sha256").update(english).digest("hex"),
    status: "accepted",
    segments: [{ id: "turn-fixture-0001", start_char: 0, end_char: english.length, character_id: "speaker" }],
  }, null, 2)}\n`);
  write("wiki/observations/fixture.md", [
    "```yaml",
    "observation_id: obs_fixture_0001",
    "source_work: Fixture",
    sourceRef("fixture", "2a-2b"),
    'observation: "Accepted evidence for this exact unit."',
    "review_status: accepted",
    "```",
    "",
  ].join("\n"));
  writeOntologyVNextFixture(root);
  write("wiki/commentary/fixture.md", [
    "# fixture",
    "",
    "```yaml",
    "commentary_id: comm_fixture_0001",
    "source_work: Fixture",
    "block_kind: section",
    "placement: before",
    'title: "Fixture unit"',
    "stephanus_span: 2a-3a",
    sourceRef("fixture", "2a-3a"),
    'body: "A unit with no current evidence citations."',
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
  ].join("\n"));
}

function writeFailedAudit() {
  const audit = {
    schema_version: 3,
    dialogue: "fixture",
    unit_key: "01-2a-3a",
    section_id: "comm_fixture_0001",
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
    unit_verdict: "fail",
    blocks: [{
      commentary_id: "comm_fixture_0001",
      disposition: "rewrite",
      issue_codes: ["unsupported_or_miscited_claim"],
      checks: {
        evidence: { verdict: "fail" },
        placement: {
          verdict: "pass",
          hazard_codes: [],
        },
        listening: { verdict: "pass" },
      },
      rationale: "The section makes a checkable assertion without accepted evidence.",
    }],
  };
  const auditJob = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "audit" }).jobs[0]!;
  const content = `${JSON.stringify(audit, null, 2)}\n`;
  const digest = createHash("sha256").update(content).digest("hex");
  write(auditJob.output_path, content);
  write(auditJob.state_path, `${JSON.stringify({
    schema_version: 3,
    job_id: auditJob.job_id,
    stage: auditJob.stage,
    input_sha256: auditJob.input_sha256,
    output_schema_sha256: auditJob.output_schema_sha256,
    model_argument: auditJob.model_argument,
    codex_cli_version: auditJob.codex_cli_version,
    model_catalog_path: auditJob.model_catalog_path,
    model_catalog_sha256: auditJob.model_catalog_sha256,
    authoring_model: auditJob.authoring_model,
    effort: auditJob.effort,
    permission_mode: auditJob.permission_mode,
    output_path: auditJob.output_path,
    output_sha256: digest,
  }, null, 2)}\n`);
}

describe("commentary rewrite evidence supplements", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-rewrite-evidence-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    setup();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("adds overlap candidates for an uncited failed section without changing its audit brief", () => {
    const before = buildCommentaryAuditBriefs("fixture")[0]!;
    expect(before.content).toContain("#### Exact English playback insertion edge");
    expect(before.content).toContain("placement authority: this deterministic English playback edge");
    expect(before.content).toContain("requested before anchor edge:");
    expect(before.content).toContain("anchor_to_playback_shift_chars:");
    expect(before.content).toContain("boundary_matches_anchor_edge:");
    expect(before.content).toContain("left_terminal: question");
    expect(before.content).toContain("right_starts_sentence: yes");
    expect(before.content).toContain("mechanical_complete_sentence_edge: yes");
    expect(before.content).toContain("{1e} Before question?");
    expect(before.content).toContain("{2a} Alpha.");
    expect(before.content).not.toContain("local_overlap_uncited");
    expect(before.content).not.toContain("observation_id: obs_fixture_0001");
    const supplement = buildCommentaryRewriteEvidenceSupplement("fixture", before, ["comm_fixture_0001"]);
    expect(supplement).toBeDefined();
    expect(supplement?.content).toContain("obs_fixture_0001");
    expect(supplement?.content).toContain("exact source_ref overlap");
    expect(supplement?.path).toContain(supplement?.sha256);
    writeCommentaryRewriteEvidenceSupplement(supplement!);
    expect(readFileSync(join(root, supplement!.path), "utf8")).toBe(supplement!.content);

    const after = buildCommentaryAuditBriefs("fixture")[0]!;
    expect(after.content).toBe(before.content);
    expect(after.sha256).toBe(before.sha256);
  });

  it("keeps the audit stable but rebinds rewrite retrieval when uncited local evidence changes", () => {
    writeCommentaryAuditBriefs("fixture");
    writeFailedAudit();
    const auditBefore = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "audit" }).jobs[0]!;
    const rewriteBefore = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "rewrite" }).jobs[0]!;
    expect(rewriteBefore.input_files.some((entry) => entry.path.includes("rewrite-evidence/fixture/"))).toBe(true);
    const evidencePath = rewriteBefore.input_files.find((entry) => entry.path.includes("rewrite-evidence/fixture/"))?.path;
    expect(rewriteBefore.prompt).toContain(evidencePath!);
    expect(rewriteBefore.prompt).toContain("Never invent, repair, infer, or autocomplete a citation id");
    expect(rewriteBefore.prompt).toContain("audit brief or rewrite evidence supplement");

    const observationPath = join(root, "wiki/observations/fixture.md");
    writeFileSync(observationPath, readFileSync(observationPath, "utf8").replace("Accepted evidence", "Changed evidence"), "utf8");
    const auditAfter = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "audit" }).jobs[0]!;
    const rewriteAfter = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "rewrite" });

    expect(auditAfter.input_sha256).toBe(auditBefore.input_sha256);
    expect(auditAfter.audit_brief_sha256).toBe(auditBefore.audit_brief_sha256);
    expect(rewriteAfter.jobs).toHaveLength(1);
    expect(rewriteAfter.jobs[0]?.input_sha256).not.toBe(rewriteBefore.input_sha256);
  });

  it("does not add a supplement when a failed block already has accepted evidence", () => {
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    writeFileSync(
      ledgerPath,
      readFileSync(ledgerPath, "utf8").replace("observations: []", "observations: [obs_fixture_0001]"),
      "utf8",
    );
    const brief = buildCommentaryAuditBriefs("fixture")[0]!;
    expect(buildCommentaryRewriteEvidenceSupplement("fixture", brief, ["comm_fixture_0001"])).toBeUndefined();
  });

  it("adds local candidates when the current accepted citation belongs to another passage", () => {
    write("raw/plato/greek/other.txt", "{1a} elsewhere {1b} done");
    write("raw/plato/english/other.txt", "{1a} Elsewhere. {1b} Done.");
    write("wiki/observations/other.md", [
      "```yaml",
      "observation_id: obs_other_0001",
      "source_work: Other",
      sourceRef("other", "1a-1b"),
      'observation: "Accepted evidence from another passage."',
      "review_status: accepted",
      "```",
      "",
    ].join("\n"));
    writeOntologyVNextFixture(root);
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    writeFileSync(
      ledgerPath,
      readFileSync(ledgerPath, "utf8").replace("observations: []", "observations: [obs_other_0001]"),
      "utf8",
    );
    const brief = buildCommentaryAuditBriefs("fixture")[0]!;
    const supplement = buildCommentaryRewriteEvidenceSupplement("fixture", brief, ["comm_fixture_0001"]);

    expect(supplement?.content).toContain("obs_fixture_0001");
    expect(supplement?.content).not.toContain("obs_other_0001");
  });

  it("reuses one immutable evidence context across rewrite units", () => {
    const brief = buildCommentaryAuditBriefs("fixture")[0]!;
    const context = buildCommentaryRewriteEvidenceContext("fixture");
    const first = buildCommentaryRewriteEvidenceSupplement("fixture", brief, ["comm_fixture_0001"], context);
    const second = buildCommentaryRewriteEvidenceSupplement("fixture", brief, ["comm_fixture_0001"], context);

    expect(second).toEqual(first);
    expect(() => buildCommentaryRewriteEvidenceSupplement("other", brief, ["comm_fixture_0001"], context))
      .toThrow("Rewrite evidence context for fixture cannot be used for other");
  });
});

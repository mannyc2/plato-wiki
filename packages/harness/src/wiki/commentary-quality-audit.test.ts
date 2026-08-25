import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCommentaryCampaignManifest } from "../commentary-campaign.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "../commentary-authoring.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  COMMENTARY_PROTOCOL_FIXTURE,
  driftedCommentaryProtocolFixture,
} from "../../test-support/commentary-protocol-fixture.js";
import {
  applyCommentaryQualityAuditManifestRefresh,
  buildCommentaryQualityAuditManifestPreview,
  listCommentaryQualityAuditManifestPaths,
  parseCommentaryQualityAuditManifest,
  previewCommentaryQualityAuditManifestRefresh,
  validateCommentaryQualityAuditManifest,
  validateCommentaryQualityAuditManifests,
  writeCommentaryQualityAuditManifestPreview,
  type CommentaryQualityAuditManifest,
} from "./commentary-quality-audit.js";

const DIALOGUE = "fixture";
const GREEK = "{2a} alpha {2b} beta {3a} gamma {3b} delta";
const ENGLISH = "{2a} first {2b} second {3a} third {3b} fourth";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function write(path: string, content: string) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function writeJson(path: string, value: unknown) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(content: string | Buffer) {
  return createHash("sha256").update(content).digest("hex");
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

function sourceRefLines(span: string) {
  const ref = resolveSourceSpan(DIALOGUE, span).source_ref;
  return [
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: "${ref.text_sha256}"`,
  ].join("\n");
}

function commentaryBlock(
  id: string,
  kind: "section" | "notice",
  span: string,
  status: "accepted" | "unreviewed" | "needs_split" | "rejected" = "accepted",
) {
  return [
    "```yaml",
    `commentary_id: ${id}`,
    "source_work: Fixture",
    `block_kind: ${kind}`,
    `placement: ${kind === "section" ? "before" : "after"}`,
    ...(kind === "section" ? ['title: "Fixture unit"'] : []),
    `stephanus_span: ${span}`,
    sourceRefLines(span),
    `body: "${kind === "section" ? "A concise orientation." : "A focused listening note."}"`,
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: model",
    `review_status: ${status}`,
    "```",
  ].join("\n");
}

function writeAcceptedLedger() {
  write(
    `wiki/commentary/${DIALOGUE}.md`,
    [
      "# Fixture Commentary",
      "",
      commentaryBlock("comm_fixture_0001", "section", "2a-3b"),
      "",
      commentaryBlock("comm_fixture_0002", "notice", "2a"),
      "",
    ].join("\n"),
  );
}

function passOutput(
  commentaryIds = ["comm_fixture_0001", "comm_fixture_0002"],
) {
  return {
    schema_version: 3,
    dialogue: DIALOGUE,
    unit_key: "01-2a-3b",
    section_id: "comm_fixture_0001",
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
    unit_verdict: "pass",
    blocks: commentaryIds.map((commentaryId) => ({
        commentary_id: commentaryId,
        disposition: "pass",
        issue_codes: [],
        checks: passingAuditChecks(),
        rationale: "This block earns its place in the listening sequence.",
      })),
  };
}

function writeCompletedScratchAudit(output = passOutput()) {
  const [job] = buildCommentaryCampaignManifest({ dialogue: DIALOGUE, stage: "audit" }).jobs;
  if (!job) throw new Error("fixture audit job missing");
  const outputContent = `${JSON.stringify(output, null, 2)}\n`;
  write(job.output_path, outputContent);
  writeJson(job.state_path, {
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
  });
  return job;
}

function writeAllCompletedScratchAudits() {
  const jobs = buildCommentaryCampaignManifest({ dialogue: DIALOGUE, stage: "audit" }).jobs;
  for (const job of jobs) {
    const output = {
      schema_version: 3,
      dialogue: DIALOGUE,
      unit_key: job.unit_key!,
      section_id: job.section_id!,
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      unit_verdict: "pass",
      blocks: (job.commentary_ids ?? []).map((commentaryId) => ({
        commentary_id: commentaryId,
        disposition: "pass",
        issue_codes: [],
        checks: passingAuditChecks(),
        rationale: "This block earns its place in the listening sequence.",
      })),
    };
    const outputContent = `${JSON.stringify(output, null, 2)}\n`;
    write(job.output_path, outputContent);
    writeJson(job.state_path, {
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
    });
  }
  return jobs;
}

function acceptedManifest(preview: CommentaryQualityAuditManifest) {
  const manifest = structuredClone(preview) as CommentaryQualityAuditManifest;
  const notePath = "wiki/review/2026-07-13-commentary-quality-fixture.md";
  const rationale = "The required hand sample confirms that both interruptions earn their place in audio.";
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
    "- comm_fixture_0002",
    "",
  ].join("\n");
  write(notePath, note);
  manifest.acceptance = {
    decision: "accepted",
    reviewer: "cjpher-delegated-luna-reviewer-fixture",
    reviewed_on: "2026-07-13",
    rationale,
    sampled_commentary_ids: ["comm_fixture_0001", "comm_fixture_0002"],
    review_note: { path: notePath, sha256: sha256(note) },
  };
  return manifest;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-quality-audit-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  write(`raw/plato/greek/${DIALOGUE}.txt`, GREEK);
  write(`raw/plato/english/${DIALOGUE}.txt`, ENGLISH);
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  write(
    "packages/harness/src/commentary-luna-model-catalog.json",
    readFileSync(join(import.meta.dir, "../commentary-luna-model-catalog.json"), "utf8"),
  );
  writeAcceptedLedger();
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("canonical commentary quality-audit manifests", () => {
  it("builds only a deterministic pending scratch handoff from exact completed Luna medium-effort outputs", () => {
    const job = writeCompletedScratchAudit();
    const ledgerPath = join(root, `wiki/commentary/${DIALOGUE}.md`);
    const ledgerBefore = readFileSync(ledgerPath, "utf8");

    const first = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    const second = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(second).toEqual(first);
    expect(first).toMatchObject({
      dialogue: DIALOGUE,
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      acceptance: {
        decision: "pending",
        reviewer: null,
        reviewed_on: null,
        rationale: null,
        sampled_commentary_ids: [],
        review_note: null,
      },
    });
    expect(first.units).toHaveLength(1);
    expect(first.units[0]).toMatchObject({
      unit_key: "01-2a-3b",
      section_id: "comm_fixture_0001",
      output_path: job.output_path,
      output: { unit_verdict: "pass" },
    });
    expect(validateCommentaryQualityAuditManifest(`wiki/commentary-audits/${DIALOGUE}.json`, JSON.stringify(first))).toEqual([]);

    const written = writeCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(written.path).toBe(`scratch/commentary/audit-manifests/${DIALOGUE}.json`);
    expect(readFileSync(join(root, written.path), "utf8")).toBe(`${JSON.stringify(first, null, 2)}\n`);
    expect(existsSync(join(root, `wiki/commentary-audits/${DIALOGUE}.json`))).toBe(false);
    expect(readFileSync(ledgerPath, "utf8")).toBe(ledgerBefore);
  });

  it("binds the full append-only ledger while auditing only active accepted blocks", () => {
    const ledgerPath = `wiki/commentary/${DIALOGUE}.md`;
    const ledger = [
      "# Fixture Commentary",
      "",
      commentaryBlock("comm_fixture_0001", "section", "2a-3b"),
      "",
      commentaryBlock("comm_fixture_0002", "notice", "2a"),
      "",
      commentaryBlock("comm_fixture_0003", "notice", "3a", "rejected"),
      "",
    ].join("\n");
    write(ledgerPath, ledger);
    const job = writeCompletedScratchAudit();

    expect(job.commentary_ids).toEqual(["comm_fixture_0001", "comm_fixture_0002"]);
    const preview = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(preview.ledger.sha256).toBe(sha256(ledger));
    expect(preview.units.flatMap((unit) => unit.output.blocks.map((block) => block.commentary_id))).toEqual([
      "comm_fixture_0001",
      "comm_fixture_0002",
    ]);
    expect(
      validateCommentaryQualityAuditManifest(
        `wiki/commentary-audits/${DIALOGUE}.json`,
        JSON.stringify(preview),
      ),
    ).toEqual([]);

    const pendingLedger = ledger.replace("review_status: rejected", "review_status: needs_split");
    write(ledgerPath, pendingLedger);
    preview.ledger.sha256 = sha256(pendingLedger);
    expect(
      validateCommentaryQualityAuditManifest(
        `wiki/commentary-audits/${DIALOGUE}.json`,
        JSON.stringify(preview),
      ).map((issue) => issue.code),
    ).toContain("ledger_not_accepted");
  });

  it("accepts unit-grouped audit coverage when append-only ledger order stores sections before later inserts", () => {
    const commentaryIds = [
      "comm_fixture_0001",
      "comm_fixture_0002",
      "comm_fixture_0003",
      "comm_fixture_0004",
    ];
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      [
        "# Fixture Commentary",
        "",
        commentaryBlock(commentaryIds[0]!, "section", "2a-2b"),
        "",
        commentaryBlock(commentaryIds[1]!, "section", "3a-3b"),
        "",
        commentaryBlock(commentaryIds[2]!, "notice", "2a"),
        "",
        commentaryBlock(commentaryIds[3]!, "notice", "3a"),
        "",
      ].join("\n"),
    );

    const jobs = writeAllCompletedScratchAudits();
    expect(jobs.map((job) => job.commentary_ids)).toEqual([
      ["comm_fixture_0001", "comm_fixture_0003"],
      ["comm_fixture_0002", "comm_fixture_0004"],
    ]);

    const preview = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(preview.units.flatMap((unit) => unit.output.blocks.map((block) => block.commentary_id))).toEqual([
      "comm_fixture_0001",
      "comm_fixture_0003",
      "comm_fixture_0002",
      "comm_fixture_0004",
    ]);
    expect(
      validateCommentaryQualityAuditManifest(
        `wiki/commentary-audits/${DIALOGUE}.json`,
        JSON.stringify(preview),
      ),
    ).toEqual([]);
  });

  it("accepts only an all-pass manifest with an exhaustive ordered hand sample and hash-bound review note", () => {
    writeCompletedScratchAudit();
    const manifest = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    const content = `${JSON.stringify(manifest, null, 2)}\n`;

    expect(validateCommentaryQualityAuditManifest(path, content)).toEqual([]);
    expect(parseCommentaryQualityAuditManifest(path, content).acceptance.decision).toBe("accepted");
    write(path, content);
    expect(listCommentaryQualityAuditManifestPaths()).toEqual([path]);
    expect(validateCommentaryQualityAuditManifests()).toEqual([]);
  });

  it("rebuilds the batch evidence snapshot on the next validation invocation", () => {
    const ledgerPath = `wiki/commentary/${DIALOGUE}.md`;
    write(
      ledgerPath,
      readFileSync(join(root, ledgerPath), "utf8").replace(
        "  observations: []",
        '  observations: ["obs_fixture_0001"]',
      ),
    );
    const observationPath = "wiki/observations/fixture.md";
    write(
      observationPath,
      [
        "```yaml",
        "observation_id: obs_fixture_0001",
        "source_work: Fixture",
        "feature_family: frame_depth",
        "feature_label: reported_dialogue_frame",
        "review_status: accepted",
        "```",
        "",
      ].join("\n"),
    );
    writeCompletedScratchAudit();
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    writeJson(path, acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE)));
    expect(validateCommentaryQualityAuditManifests()).toEqual([]);

    write(
      observationPath,
      readFileSync(join(root, observationPath), "utf8").replace(
        "feature_label: reported_dialogue_frame",
        "feature_label: changed_after_first_validation",
      ),
    );
    const content = readFileSync(join(root, path), "utf8");
    const standalone = validateCommentaryQualityAuditManifest(path, content);
    const batch = validateCommentaryQualityAuditManifests();
    expect(standalone.map((issue) => issue.code)).toContain("audit_brief_mismatch");
    expect(batch).toEqual(standalone);
  });

  it("reuses an exact canonical unit when only its scratch campaign state is stale", () => {
    const job = writeCompletedScratchAudit();
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    const accepted = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    writeJson(path, accepted);

    const state = JSON.parse(readFileSync(join(root, job.state_path), "utf8")) as Record<string, unknown>;
    state.input_sha256 = "f".repeat(64);
    writeJson(job.state_path, state);

    const preview = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(preview.units).toEqual(accepted.units);
    expect(preview.acceptance.decision).toBe("pending");
  });

  it("rebuilds a multi-unit preview from one operation-scoped canonical snapshot", () => {
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      [
        "# Fixture Commentary",
        "",
        commentaryBlock("comm_fixture_0001", "section", "2a-2b"),
        "",
        commentaryBlock("comm_fixture_0002", "section", "3a-3b"),
        "",
      ].join("\n"),
    );
    const jobs = writeAllCompletedScratchAudits();
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    const accepted = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    writeJson(path, accepted);

    for (const job of jobs) {
      const state = JSON.parse(readFileSync(join(root, job.state_path), "utf8")) as Record<string, unknown>;
      state.input_sha256 = "f".repeat(64);
      writeJson(job.state_path, state);
    }

    const preview = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    expect(preview.units).toEqual(accepted.units);
    expect(preview.acceptance.decision).toBe("pending");
  });

  it("refreshes invalid embedded audit evidence without repeating an unchanged acceptance sample", () => {
    const job = writeCompletedScratchAudit();
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    const accepted = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    const oldNote = accepted.acceptance.decision === "accepted"
      ? readFileSync(join(root, accepted.acceptance.review_note.path), "utf8")
      : "";
    accepted.units[0]!.output.blocks[0]!.rationale = "This rationale was clipped mid-sentence";
    accepted.units[0]!.output_sha256 = sha256(`${JSON.stringify(accepted.units[0]!.output, null, 2)}\n`);
    writeJson(path, accepted);

    writeCompletedScratchAudit();
    const preview = previewCommentaryQualityAuditManifestRefresh(DIALOGUE);
    expect(preview.applied).toBe(false);
    expect(preview.manifest.acceptance).toEqual(accepted.acceptance);
    expect(preview.manifest.units[0]!.output.blocks[0]!.rationale).toBe(
      "This block earns its place in the listening sequence.",
    );
    expect(validateCommentaryQualityAuditManifest(path, `${JSON.stringify(preview.manifest, null, 2)}\n`)).toEqual([]);

    const applied = applyCommentaryQualityAuditManifestRefresh(DIALOGUE);
    expect(applied.applied).toBe(true);
    expect(parseCommentaryQualityAuditManifest(path, readFileSync(join(root, path), "utf8")).acceptance).toEqual(
      accepted.acceptance,
    );
    if (accepted.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    expect(readFileSync(join(root, accepted.acceptance.review_note.path), "utf8")).toBe(oldNote);
    expect(readFileSync(join(root, job.output_path), "utf8")).toContain(
      "This block earns its place in the listening sequence.",
    );
  });

  it("refuses to preserve an acceptance sample after commentary bytes change", () => {
    writeCompletedScratchAudit();
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    writeJson(path, acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE)));
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
        "A focused listening note.",
        "A materially changed listening note.",
      ),
    );

    expect(() => previewCommentaryQualityAuditManifestRefresh(DIALOGUE)).toThrow(
      "commentary ledger changed after the accepted sample",
    );
  });

  it("rejects hand-edited reviewer, rationale, and review-note claims at the canonical validator", () => {
    writeCompletedScratchAudit();
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;

    const invalidReviewer = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    if (invalidReviewer.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    invalidReviewer.acceptance.reviewer = "fixture-editor";
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(invalidReviewer)).map((issue) => issue.code)).toContain(
      "invalid_acceptance",
    );

    const invalidRationale = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    if (invalidRationale.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    invalidRationale.acceptance.rationale = "A human listened to the sample and accepted it.";
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(invalidRationale)).map((issue) => issue.code)).toContain(
      "invalid_acceptance",
    );

    const invalidNote = acceptedManifest(buildCommentaryQualityAuditManifestPreview(DIALOGUE));
    if (invalidNote.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    const notePath = invalidNote.acceptance.review_note.path;
    const noteWithHumanClaim = readFileSync(join(root, notePath), "utf8").replace(
      "human_listening_or_review: none claimed",
      "human_listening_or_review: human listening completed",
    );
    write(notePath, noteWithHumanClaim);
    invalidNote.acceptance.review_note.sha256 = sha256(noteWithHumanClaim);
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(invalidNote)).map((issue) => issue.code)).toContain(
      "invalid_review_note",
    );
  });

  it("rejects legacy Fable-low manifest provenance", () => {
    writeCompletedScratchAudit();
    const manifest = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    const legacyAuthoring = manifest.authoring as { model: string; effort: string };
    legacyAuthoring.model = "claude-fable-5";
    legacyAuthoring.effort = "low";

    expect(
      validateCommentaryQualityAuditManifest(
        `wiki/commentary-audits/${DIALOGUE}.json`,
        JSON.stringify(manifest),
      ).map((issue) => issue.code),
    ).toContain("invalid_authoring");
  });

  it("requires at least fifteen ordered unique hand-sampled IDs for a longer ledger", () => {
    const commentaryIds = Array.from({ length: 16 }, (_, index) => `comm_fixture_${String(index + 1).padStart(4, "0")}`);
    write(
      `wiki/commentary/${DIALOGUE}.md`,
      [
        "# Fixture Commentary",
        "",
        commentaryBlock(commentaryIds[0]!, "section", "2a-3b"),
        ...commentaryIds.slice(1).flatMap((id) => ["", commentaryBlock(id, "notice", "2a")]),
        "",
      ].join("\n"),
    );
    writeCompletedScratchAudit(passOutput(commentaryIds));
    const preview = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    const sample = commentaryIds.slice(0, 15);
    const rationale = "The required fifteen-block sample supports acceptance of the bounded audit output.";
    const notePath = "wiki/review/2026-07-13-commentary-quality-long-fixture.md";
    const note = [
      "# Long fixture commentary quality acceptance",
      "",
      `dialogue: ${DIALOGUE}`,
      "decision: accepted",
      "reviewer: cjpher-delegated-luna-reviewer-fixture",
      "reviewed_on: 2026-07-13",
      `rationale: ${rationale}`,
      "review_basis: operator-delegated independent Luna sample review",
      "human_listening_or_review: none claimed",
      "sampled_commentary_ids:",
      ...sample.map((id) => `- ${id}`),
      "",
    ].join("\n");
    write(notePath, note);
    preview.acceptance = {
      decision: "accepted",
      reviewer: "cjpher-delegated-luna-reviewer-fixture",
      reviewed_on: "2026-07-13",
      rationale,
      sampled_commentary_ids: sample,
      review_note: { path: notePath, sha256: sha256(note) },
    };
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(preview))).toEqual([]);

    preview.acceptance.sampled_commentary_ids = sample.slice(0, 14);
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(preview)).map((issue) => issue.code)).toContain(
      "invalid_acceptance_sample",
    );
  });

  it("fails closed on incomplete or stale scratch state and on any failed unit", () => {
    const job = writeCompletedScratchAudit();
    rmSync(join(root, job.state_path));
    expect(() => buildCommentaryQualityAuditManifestPreview(DIALOGUE)).toThrow("output and state are both required");

    writeCompletedScratchAudit();
    const state = JSON.parse(readFileSync(join(root, job.state_path), "utf8")) as Record<string, unknown>;
    state.input_sha256 = "f".repeat(64);
    writeJson(job.state_path, state);
    expect(() => buildCommentaryQualityAuditManifestPreview(DIALOGUE)).toThrow("is stale at input_sha256");

    writeCompletedScratchAudit();
    const failed = passOutput();
    failed.unit_verdict = "fail";
    failed.blocks[1]!.disposition = "rewrite";
    failed.blocks[1]!.issue_codes = ["source_misreading"];
    failed.blocks[1]!.checks.evidence = {
      verdict: "fail",
    };
    failed.blocks[1]!.rationale = "The block misconstrues what the exact source passage says.";
    const failedContent = `${JSON.stringify(failed, null, 2)}\n`;
    write(job.output_path, failedContent);
    const freshState = JSON.parse(readFileSync(join(root, job.state_path), "utf8")) as Record<string, unknown>;
    freshState.output_sha256 = sha256(failedContent);
    writeJson(job.state_path, freshState);
    expect(() => buildCommentaryQualityAuditManifestPreview(DIALOGUE)).toThrow("did not pass");
  });

  it("invalidates stale inputs, partial ID coverage, failed dispositions, weak samples, and stale review notes", () => {
    writeCompletedScratchAudit();
    const pending = buildCommentaryQualityAuditManifestPreview(DIALOGUE);
    const path = `wiki/commentary-audits/${DIALOGUE}.json`;

    const partial = structuredClone(pending) as CommentaryQualityAuditManifest;
    partial.units[0]!.output.blocks = partial.units[0]!.output.blocks.slice(0, 1);
    partial.units[0]!.output_sha256 = sha256(`${JSON.stringify(partial.units[0]!.output, null, 2)}\n`);
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(partial)).map((issue) => issue.code)).toContain(
      "invalid_audit_output",
    );

    const failed = structuredClone(pending) as CommentaryQualityAuditManifest;
    failed.units[0]!.output.unit_verdict = "fail";
    failed.units[0]!.output.blocks[1]!.disposition = "rewrite";
    failed.units[0]!.output.blocks[1]!.issue_codes = ["unsupported_or_miscited_claim"];
    failed.units[0]!.output.blocks[1]!.checks.evidence = {
      verdict: "fail",
    };
    failed.units[0]!.output.blocks[1]!.rationale = "A checkable assertion lacks matching accepted evidence.";
    failed.units[0]!.output_sha256 = sha256(`${JSON.stringify(failed.units[0]!.output, null, 2)}\n`);
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(failed)).map((issue) => issue.code)).toContain(
      "audit_output_failed",
    );

    const weakSample = acceptedManifest(pending);
    if (weakSample.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    weakSample.acceptance.sampled_commentary_ids = ["comm_fixture_0001"];
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(weakSample)).map((issue) => issue.code)).toContain(
      "invalid_acceptance_sample",
    );

    const reorderedSample = acceptedManifest(pending);
    if (reorderedSample.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    reorderedSample.acceptance.sampled_commentary_ids.reverse();
    expect(
      validateCommentaryQualityAuditManifest(path, JSON.stringify(reorderedSample)).map((issue) => issue.code),
    ).toContain("invalid_acceptance_sample");

    const duplicateSample = acceptedManifest(pending);
    if (duplicateSample.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    duplicateSample.acceptance.sampled_commentary_ids = ["comm_fixture_0001", "comm_fixture_0001"];
    expect(
      validateCommentaryQualityAuditManifest(path, JSON.stringify(duplicateSample)).map((issue) => issue.code),
    ).toContain("invalid_acceptance_sample");

    const outOfBoundsSample = acceptedManifest(pending);
    if (outOfBoundsSample.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    outOfBoundsSample.acceptance.sampled_commentary_ids = ["comm_fixture_0001", "comm_fixture_9999"];
    expect(
      validateCommentaryQualityAuditManifest(path, JSON.stringify(outOfBoundsSample)).map((issue) => issue.code),
    ).toContain("invalid_acceptance_sample");

    const staleNote = acceptedManifest(pending);
    if (staleNote.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    staleNote.acceptance.review_note.sha256 = "f".repeat(64);
    expect(validateCommentaryQualityAuditManifest(path, JSON.stringify(staleNote)).map((issue) => issue.code)).toContain(
      "review_note_hash_mismatch",
    );

    const wrongDecisionNote = acceptedManifest(pending);
    if (wrongDecisionNote.acceptance.decision !== "accepted") throw new Error("fixture acceptance missing");
    const wrongDecisionPath = wrongDecisionNote.acceptance.review_note.path;
    const wrongDecisionContent = readFileSync(join(root, wrongDecisionPath), "utf8").replace(
      "decision: accepted",
      "decision: pending",
    );
    write(wrongDecisionPath, wrongDecisionContent);
    wrongDecisionNote.acceptance.review_note.sha256 = sha256(wrongDecisionContent);
    expect(
      validateCommentaryQualityAuditManifest(path, JSON.stringify(wrongDecisionNote)).map((issue) => issue.code),
    ).toContain("invalid_review_note");

    write("docs/commentary-protocol.md", driftedCommentaryProtocolFixture("Changed after audit."));
    const staleProtocolCodes = validateCommentaryQualityAuditManifest(path, JSON.stringify(pending)).map(
      (issue) => issue.code,
    );
    expect(staleProtocolCodes).toContain("protocol_hash_mismatch");
    expect(staleProtocolCodes).toContain("audit_brief_mismatch");
  });
});

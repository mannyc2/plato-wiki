import { afterEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  applyCommentaryRewriteAcceptance,
  previewCommentaryRewriteAcceptance,
} from "./commentary-rewrite-review.js";

const DIALOGUE = "fixture";
const ID = "comm_fixture_0001";
const ID2 = "comm_fixture_0002";
const SUBMISSION = "wiki/submissions/commentary/fixture/0001-rewrite-unit.json";

let root = "";
let restoreRoot: (() => void) | undefined;

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function ledger(status: "accepted" | "unreviewed", body = "A concise orientation.", ids = [ID]) {
  return [
    "# Fixture Commentary",
    "",
    ...ids.flatMap((commentaryId, index) => {
      const span = index === 0 ? "2a-2b" : "3a-3b";
      const ref = resolveSourceSpan(DIALOGUE, span).source_ref;
      return [
        "```yaml",
        `commentary_id: ${commentaryId}`,
        "source_work: Fixture",
        "block_kind: section",
        "placement: before",
        `title: \"Fixture unit ${index + 1}\"`,
        `stephanus_span: ${span}`,
        "source_ref:",
        `  source_path: ${ref.source_path}`,
        `  stephanus_span: ${ref.stephanus_span}`,
        `  start_marker: ${ref.start_marker}`,
        `  end_marker: ${ref.end_marker}`,
        `  start_char: ${ref.start_char}`,
        `  end_char: ${ref.end_char}`,
        `  text_sha256: \"${ref.text_sha256}\"`,
        `body: \"${body}\"`,
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
      ];
    }),
  ].join("\n");
}

function prepare() {
  restoreRoot?.();
  if (root) rmSync(root, { recursive: true, force: true });
  root = mkdtempSync(join(tmpdir(), "commentary-rewrite-review-"));
  restoreRoot = setRepoRootForTesting(root);
  write("raw/plato/greek/fixture.txt", "{2a} alpha {2b} beta");
  write("raw/plato/english/fixture.txt", "{2a} first {2b} second");
  const before = ledger("accepted");
  const after = ledger("unreviewed", "A repaired orientation.");
  write(`wiki/commentary/${DIALOGUE}.md`, after);
  const record = {
    schema_version: 1,
    submission_id: "0001-rewrite-unit",
    lane: "commentary",
    kind: "rewrite",
    scope: DIALOGUE,
    unit_key: "unit",
    source_path: "scratch/commentary/rewrites/fixture/unit.json",
    source_sha256: sha256("rewrite artifact"),
    target_path: `wiki/commentary/${DIALOGUE}.md`,
    target_sha256_before: sha256(before),
    target_sha256_after: sha256(after),
    applied_at: "2026-08-21T00:00:00.000Z",
    applied_ids: [ID],
    submission: { schema_version: 1, dialogue: DIALOGUE, revisions: [{ commentary_id: ID }] },
    superseded: [{ commentary_id: ID, body: "old block" }],
  };
  write(SUBMISSION, `${JSON.stringify(record, null, 2)}\n`);
  return { before, after, submissionSha256: sha256(`${JSON.stringify(record, null, 2)}\n`) };
}

function validInput(snapshot: ReturnType<typeof prepare>) {
  return {
    dialogue: DIALOGUE,
    submissionRecordPath: SUBMISSION,
    submissionRecordSha256: snapshot.submissionSha256,
    targetSha256Before: sha256(snapshot.before),
    targetSha256After: sha256(snapshot.after),
    appliedIds: [ID],
    postRewriteLedgerSha256: sha256(snapshot.after),
    postRewriteStatuses: [{ commentaryId: ID, reviewStatus: "unreviewed" }],
    reviewer: "cjpher-delegated-luna-reviewer-fixture",
    reviewedOn: "2026-08-21",
    rationale: "The bounded Luna review supports accepting the repaired commentary block.",
  } as const;
}

function preparePartial() {
  restoreRoot?.();
  if (root) rmSync(root, { recursive: true, force: true });
  root = mkdtempSync(join(tmpdir(), "commentary-rewrite-review-partial-"));
  restoreRoot = setRepoRootForTesting(root);
  write("raw/plato/greek/fixture.txt", "{2a} alpha {2b} beta {3a} gamma {3b} delta");
  write("raw/plato/english/fixture.txt", "{2a} first {2b} second {3a} third {3b} fourth");
  const before = ledger("accepted", "A repaired orientation.", [ID, ID2]);
  const after = ledger("unreviewed", "A repaired orientation.", [ID, ID2]);
  write(`wiki/commentary/${DIALOGUE}.md`, after);
  const record = {
    schema_version: 1,
    submission_id: "0002-rewrite-batch",
    lane: "commentary",
    kind: "rewrite-batch",
    scope: DIALOGUE,
    unit_key: "unit",
    source_path: "scratch/commentary/rewrites/fixture/unit.json",
    source_sha256: sha256("rewrite artifact"),
    target_path: `wiki/commentary/${DIALOGUE}.md`,
    target_sha256_before: sha256(before),
    target_sha256_after: sha256(after),
    applied_at: "2026-08-21T00:00:00.000Z",
    applied_ids: [ID, ID2],
    submission: { schema_version: 1, dialogue: DIALOGUE, revisions: [{ commentary_id: ID }, { commentary_id: ID2 }] },
    superseded: [{ commentary_id: ID, body: "old block" }, { commentary_id: ID2, body: "old block" }],
  };
  const recordContent = `${JSON.stringify(record, null, 2)}\n`;
  const submissionPath = SUBMISSION.replace("0001-rewrite-unit", "0002-rewrite-batch");
  write(submissionPath, recordContent);
  return { before, after, submissionSha256: sha256(recordContent), submissionPath };
}

function partialInput(snapshot: ReturnType<typeof preparePartial>) {
  return {
    dialogue: DIALOGUE,
    submissionRecordPath: snapshot.submissionPath,
    submissionRecordSha256: snapshot.submissionSha256,
    targetSha256Before: sha256(snapshot.before),
    targetSha256After: sha256(snapshot.after),
    appliedIds: [ID],
    postRewriteLedgerSha256: sha256(snapshot.after),
    postRewriteStatuses: [{ commentaryId: ID, reviewStatus: "unreviewed" }],
    reviewer: "cjpher-delegated-luna-reviewer-fixture",
    reviewedOn: "2026-08-21",
    rationale: "The bounded Luna review supports accepting only the repaired block IDs it covered.",
  } as const;
}

afterEach(() => {
  restoreRoot?.();
  rmSync(root, { recursive: true, force: true });
  root = "";
});

describe("commentary rewrite acceptance", () => {
  it("previews an exact tracked rewrite without writing", () => {
    const snapshot = prepare();
    const result = previewCommentaryRewriteAcceptance(validInput(snapshot));

    expect(result.applied).toBe(false);
    expect(result.appliedIds).toEqual([ID]);
    expect(result.prospectiveLedger).toContain("review_status: accepted");
    expect(readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8")).toBe(snapshot.after);
    expect(existsSync(join(root, result.receiptPath))).toBe(false);
  });

  it("applies the status cutover and writes a non-overwriting receipt under one lock", () => {
    const snapshot = prepare();
    const input = validInput(snapshot);
    const result = applyCommentaryRewriteAcceptance(input);

    expect(result.applied).toBe(true);
    expect(readFileSync(join(root, result.ledgerPath), "utf8")).toBe(result.prospectiveLedger);
    expect(readFileSync(join(root, result.receiptPath), "utf8")).toBe(result.receipt);
    expect(result.receipt).toContain(`submission_record_sha256: ${snapshot.submissionSha256}`);
    expect(() => applyCommentaryRewriteAcceptance(input)).toThrow("Refusing to overwrite existing canonical receipt");
  });

  it("accepts a rewrite-batch record through the same exact-ID contract", () => {
    const snapshot = prepare();
    const batchPath = SUBMISSION.replace("rewrite-unit", "rewrite-batch");
    const batchContent = readFileSync(join(root, SUBMISSION), "utf8")
      .replaceAll("0001-rewrite-unit", "0001-rewrite-batch")
      .replace('"kind": "rewrite"', '"kind": "rewrite-batch"');
    rmSync(join(root, SUBMISSION));
    write(batchPath, batchContent);
    const input = { ...validInput(snapshot), submissionRecordPath: batchPath, submissionRecordSha256: sha256(batchContent) };
    expect(applyCommentaryRewriteAcceptance(input).applied).toBe(true);
  });

  it("accepts a canonical subset and records the applied IDs left unaccepted", () => {
    const snapshot = preparePartial();
    const result = applyCommentaryRewriteAcceptance(partialInput(snapshot));

    expect(result.applied).toBe(true);
    expect(result.appliedIds).toEqual([ID]);
    expect(result.unacceptedAppliedIds).toEqual([ID2]);
    expect(result.receipt).toContain("unaccepted_applied_ids:\n- comm_fixture_0002");
    const acceptedLedger = readFileSync(join(root, result.ledgerPath), "utf8");
    expect(acceptedLedger.match(/review_status: accepted/g)?.length).toBe(1);
    expect(acceptedLedger.match(/review_status: unreviewed/g)?.length).toBe(1);
  });

  it("bridges an unrelated canonical block-review receipt chain while preserving its status", () => {
    const snapshot = preparePartial();
    const submissionRecord = JSON.parse(readFileSync(join(root, snapshot.submissionPath), "utf8")) as Record<string, unknown>;
    submissionRecord.applied_ids = [ID];
    const submissionContent = `${JSON.stringify(submissionRecord, null, 2)}\n`;
    write(snapshot.submissionPath, submissionContent);

    const beforeBlockReview = snapshot.after;
    const afterBlockReview = ledger("unreviewed", "A repaired orientation.", [ID, ID2]).replace(
      new RegExp(`(commentary_id: ${ID2}[\\s\\S]*?^review_status: )unreviewed`, "mu"),
      "$1rejected",
    );
    write(`wiki/commentary/${DIALOGUE}.md`, afterBlockReview);
    write(
      `wiki/review/2026-08-21-commentary-block-review-fixture-rejected-${sha256(`rejected\n${ID2}`).slice(0, 12)}.md`,
      [
        "# Commentary block review",
        "",
        `dialogue: ${DIALOGUE}`,
        "decision: rejected",
        `ledger_path: wiki/commentary/${DIALOGUE}.md`,
        `ledger_sha256_before: ${sha256(beforeBlockReview)}`,
        `ledger_sha256_after: ${sha256(afterBlockReview)}`,
        "reviewer: cjpher-delegated-luna-reviewer-fixture",
        "reviewed_on: 2026-08-21",
        "rationale: The independent Luna reconsideration supports this bounded decision.",
        "review_basis: operator-delegated independent Luna block review",
        "human_listening_or_review: none claimed",
        "reviewed_commentary_ids:",
        `- ${ID2}`,
        "",
      ].join("\n"),
    );

    const input = {
      dialogue: DIALOGUE,
      submissionRecordPath: snapshot.submissionPath,
      submissionRecordSha256: sha256(submissionContent),
      targetSha256Before: sha256(snapshot.before),
      targetSha256After: sha256(snapshot.after),
      appliedIds: [ID],
      postRewriteLedgerSha256: sha256(afterBlockReview),
      postRewriteStatuses: [{ commentaryId: ID, reviewStatus: "unreviewed" }],
      reviewer: "cjpher-delegated-luna-reviewer-fixture",
      reviewedOn: "2026-08-21",
      rationale: "The bounded Luna review supports accepting the repaired commentary block.",
    } as const;
    const result = applyCommentaryRewriteAcceptance(input);
    const finalLedger = readFileSync(join(root, result.ledgerPath), "utf8");
    expect(finalLedger).toContain(`${ID}\nsource_work: Fixture`);
    expect(finalLedger).toContain("review_status: accepted");
    expect(finalLedger).toContain(`${ID2}\nsource_work: Fixture`);
    expect(finalLedger).toContain("review_status: rejected");
  });

  it("rejects empty, duplicate, unknown, and noncanonical reviewed ID lists", () => {
    const empty = preparePartial();
    expect(() => previewCommentaryRewriteAcceptance({ ...partialInput(empty), appliedIds: [] })).toThrow(
      "appliedIds must be explicitly provided and non-empty",
    );

    const duplicate = preparePartial();
    expect(() => previewCommentaryRewriteAcceptance({ ...partialInput(duplicate), appliedIds: [ID, ID] })).toThrow(
      "appliedIds must be unique",
    );

    const unknown = preparePartial();
    expect(() => previewCommentaryRewriteAcceptance({
      ...partialInput(unknown),
      appliedIds: ["comm_fixture_9999"],
      postRewriteStatuses: [{ commentaryId: "comm_fixture_9999", reviewStatus: "unreviewed" }],
    })).toThrow("reviewed IDs must be present in the canonical submission applied_ids");

    const reversed = preparePartial();
    expect(() => previewCommentaryRewriteAcceptance({
      ...partialInput(reversed),
      appliedIds: [ID2, ID],
      postRewriteStatuses: [
        { commentaryId: ID2, reviewStatus: "unreviewed" },
        { commentaryId: ID, reviewStatus: "unreviewed" },
      ],
    })).toThrow("reviewed IDs must use canonical submission order");
  });

  it("fails closed on record tampering, ledger drift, status drift, and human claims", () => {
    const snapshot = prepare();
    const input = validInput(snapshot);
    writeFileSync(join(root, SUBMISSION), readFileSync(join(root, SUBMISSION), "utf8").replace("0001-rewrite-unit", "0001-rewrite-tampered"), "utf8");
    expect(() => previewCommentaryRewriteAcceptance(input)).toThrow("submission record hash mismatch");

    const fresh = prepare();
    write(`wiki/commentary/${DIALOGUE}.md`, `${fresh.after}\n`);
    expect(() => previewCommentaryRewriteAcceptance(validInput(fresh))).toThrow("ledger hash drifted");

    const statusDrift = prepare();
    write(`wiki/commentary/${DIALOGUE}.md`, ledger("accepted", "A repaired orientation."));
    expect(() => previewCommentaryRewriteAcceptance(validInput(statusDrift))).toThrow("ledger hash drifted");

    const human = prepare();
    expect(() => previewCommentaryRewriteAcceptance({ ...validInput(human), rationale: "A human listened to it." })).toThrow(
      "must not claim human listening",
    );
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  applyCommentaryBlockReview,
  previewCommentaryBlockReview,
  type CommentaryBlockReviewInput,
} from "./commentary-block-review.js";

const DIALOGUE = "fixture";
const ID = "comm_fixture_0001";
const ID2 = "comm_fixture_0002";
let root = "";
let restoreRoot: (() => void) | undefined;

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function ledger(status: string, ids = [ID, ID2]) {
  return [
    "# Fixture Commentary",
    "",
    ...ids.flatMap((id, index) => {
      const span = index === 0 ? "2a-2b" : "3a-3b";
      const ref = resolveSourceSpan(DIALOGUE, span).source_ref;
      return [
        "```yaml",
        `commentary_id: ${id}`,
        "source_work: Fixture",
        "block_kind: section",
        "placement: before",
        `title: \"Fixture ${index + 1}\"`,
        `stephanus_span: ${span}`,
        "source_ref:",
        `  source_path: ${ref.source_path}`,
        `  stephanus_span: ${ref.stephanus_span}`,
        `  start_marker: ${ref.start_marker}`,
        `  end_marker: ${ref.end_marker}`,
        `  start_char: ${ref.start_char}`,
        `  end_char: ${ref.end_char}`,
        `  text_sha256: \"${ref.text_sha256}\"`,
        'body: "A bounded orientation."',
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

function input(overrides: Partial<CommentaryBlockReviewInput> = {}): CommentaryBlockReviewInput {
  return {
    dialogue: DIALOGUE,
    decision: "accepted",
    reviewer: "cjpher-delegated-luna-reviewer-fixture",
    reviewedOn: "2026-08-21",
    rationale: "The independent Luna reconsideration supports this bounded decision.",
    reviewedIds: [ID],
    ...overrides,
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-block-review-"));
  restoreRoot = setRepoRootForTesting(root);
  write("raw/plato/greek/fixture.txt", "{2a} alpha {2b} beta {3a} gamma {3b} delta");
  write("raw/plato/english/fixture.txt", "{2a} first {2b} second {3a} third {3b} fourth");
  write("wiki/commentary/fixture.md", ledger("unreviewed"));
});

afterEach(() => {
  restoreRoot?.();
  rmSync(root, { recursive: true, force: true });
  root = "";
});

describe("commentary block review", () => {
  it("previews and applies accepted and rejected decisions with exact receipt bindings", () => {
    const accepted = applyCommentaryBlockReview(input());
    expect(accepted.applied).toBe(true);
    expect(readFileSync(join(root, accepted.ledgerPath), "utf8")).toBe(accepted.prospectiveLedger);
    expect(accepted.receipt).toContain(`ledger_sha256_before: ${accepted.ledgerSha256Before}`);
    expect(accepted.receipt).toContain(`ledger_sha256_after: ${accepted.ledgerSha256After}`);
    expect(accepted.receipt).toContain("human_listening_or_review: none claimed");
    expect(() => applyCommentaryBlockReview(input())).toThrow("currently be unreviewed");

    write("wiki/commentary/fixture.md", ledger("unreviewed"));
    const rejected = applyCommentaryBlockReview(input({ decision: "rejected", reviewedOn: "2026-08-22", reviewedIds: [ID2] }));
    expect(rejected.prospectiveLedger).toContain("review_status: rejected");
  });

  it("previews without writing and fails closed on IDs, status, decision, reviewer, and human claims", () => {
    const preview = previewCommentaryBlockReview(input());
    expect(preview.applied).toBe(false);
    expect(existsSync(join(root, preview.receiptPath))).toBe(false);
    expect(readFileSync(join(root, preview.ledgerPath), "utf8")).toContain("review_status: unreviewed");
    expect(() => previewCommentaryBlockReview(input({ decision: "nope" as never }))).toThrow("accepted or rejected");
    expect(() => previewCommentaryBlockReview(input({ reviewer: "human-reviewer" }))).toThrow("delegated Luna");
    expect(() => previewCommentaryBlockReview(input({ rationale: "A human listened to this." }))).toThrow("human listening");
    expect(() => previewCommentaryBlockReview(input({ reviewedIds: [ID2, ID] }))).toThrow("canonical ledger order");
    expect(() => previewCommentaryBlockReview(input({ reviewedIds: [ID, ID] }))).toThrow("unique");
    expect(() => previewCommentaryBlockReview(input({ reviewedIds: ["comm_fixture_9999"] }))).toThrow("current ledger");

    write("wiki/commentary/fixture.md", ledger("accepted"));
    expect(() => previewCommentaryBlockReview(input())).toThrow("currently be unreviewed");
  });

  it("rejects ledger drift after a preview", () => {
    const preview = previewCommentaryBlockReview(input());
    write("wiki/commentary/fixture.md", `${preview.prospectiveLedger}\n`);
    expect(() => applyCommentaryBlockReview(input())).toThrow("currently be unreviewed");
  });

  it("uses distinct hash-bound receipt paths for repeated same-day reviews of a repaired block", () => {
    const first = applyCommentaryBlockReview(input({ decision: "rejected" }));
    const repaired = ledger("unreviewed").replace("A bounded orientation.", "A repaired bounded orientation.");
    write("wiki/commentary/fixture.md", repaired);
    const second = applyCommentaryBlockReview(input({ decision: "rejected" }));

    expect(second.receiptPath).not.toBe(first.receiptPath);
    expect(existsSync(join(root, first.receiptPath))).toBe(true);
    expect(existsSync(join(root, second.receiptPath))).toBe(true);
  });
});

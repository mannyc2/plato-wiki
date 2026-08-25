import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "../commentary-authoring.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { applyCommentaryRewriteAcceptance, previewCommentaryRewriteAcceptance } from "./commentary-rewrite-review.js";
import { applyCommentaryBlockReview } from "./commentary-block-review.js";
import {
  applyCommentaryRewriteRepair,
  previewCommentaryRewriteRepair,
  type CommentaryRewriteRepairCandidate,
} from "./commentary-rewrite-repair.js";

const DIALOGUE = "fixture";
const IDS = ["comm_fixture_0001", "comm_fixture_0002", "comm_fixture_0003"];
const CANDIDATE_PATH = "scratch/commentary/rewrite-repairs/fixture/rejected-rewrites.json";
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

function ledger(statuses: string[], bodyPrefix: string) {
  return [
    "# Fixture Commentary",
    "",
    ...IDS.flatMap((id, index) => {
      const start = index + 2;
      const span = `${start}a-${start}b`;
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
        `body: \"${bodyPrefix} ${index + 1}.\"`,
        "cites:",
        "  observations: []",
        "  claims: []",
        "  relations: []",
        "  dossiers: []",
        "crossrefs: []",
        "author: model",
        `review_status: ${statuses[index]}`,
        "```",
        "",
      ];
    }),
  ].join("\n");
}

function trackedSubmission(path: string, kind: string, before: string, after: string, appliedIds: string[], submission: unknown) {
  const submissionId = path.split("/").at(-1)!.replace(/\.json$/u, "");
  const value = {
    schema_version: 1,
    submission_id: submissionId,
    lane: "commentary",
    kind,
    scope: DIALOGUE,
    source_path: "scratch/commentary/rewrites/fixture/unit.json",
    source_sha256: sha256("source"),
    target_path: `wiki/commentary/${DIALOGUE}.md`,
    target_sha256_before: sha256(before),
    target_sha256_after: sha256(after),
    applied_at: "2026-08-21T00:00:00.000Z",
    applied_ids: appliedIds,
    submission,
  };
  write(path, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

function establishPriorReview() {
  const original = ledger(["accepted", "accepted", "accepted"], "Original");
  const rewritten = ledger(["unreviewed", "unreviewed", "unreviewed"], "Rejected rewrite");
  write(`wiki/commentary/${DIALOGUE}.md`, rewritten);
  const submissionPath = "wiki/submissions/commentary/fixture/0001-rewrite-batch.json";
  const record = trackedSubmission(submissionPath, "rewrite-batch", original, rewritten, IDS, { revisions: IDS });
  const recordBytes = readFileSync(join(root, submissionPath));
  const review = applyCommentaryRewriteAcceptance({
    dialogue: DIALOGUE,
    submissionRecordPath: submissionPath,
    submissionRecordSha256: sha256(recordBytes),
    targetSha256Before: record.target_sha256_before,
    targetSha256After: record.target_sha256_after,
    appliedIds: [IDS[0]!],
    postRewriteLedgerSha256: record.target_sha256_after,
    postRewriteStatuses: [{ commentaryId: IDS[0]!, reviewStatus: "unreviewed" }],
    reviewer: "cjpher-delegated-luna-reviewer-prior",
    reviewedOn: "2026-08-21",
    rationale: "The independent Luna review accepts one rewrite and leaves two findings unresolved.",
  });
  return {
    submissionPath,
    submissionSha256: sha256(recordBytes),
    receiptPath: review.receiptPath,
    receiptSha256: sha256(readFileSync(join(root, review.receiptPath))),
  };
}

function establishRejectedPriorReview() {
  const original = ledger(["accepted", "accepted", "accepted"], "Original");
  const rewritten = ledger(["unreviewed", "unreviewed", "unreviewed"], "Rejected rewrite");
  write(`wiki/commentary/${DIALOGUE}.md`, rewritten);
  const submissionPath = "wiki/submissions/commentary/fixture/0001-rewrite-batch.json";
  trackedSubmission(submissionPath, "rewrite-batch", original, rewritten, IDS, { revisions: IDS });
  const receipt = applyCommentaryBlockReview({
    dialogue: DIALOGUE,
    decision: "rejected",
    reviewer: "cjpher-delegated-luna-reviewer-prior",
    reviewedOn: "2026-08-21",
    rationale: "The independent Luna review rejects every applied rewrite for bounded source defects.",
    reviewedIds: IDS,
  });
  return {
    submissionPath,
    submissionSha256: sha256(readFileSync(join(root, submissionPath))),
    receiptPath: receipt.receiptPath,
    receiptSha256: sha256(readFileSync(join(root, receipt.receiptPath))),
  };
}

function establishPartiallyAcceptedAndRejectedReview() {
  const original = ledger(["accepted", "accepted", "accepted"], "Original");
  const rewritten = ledger(["unreviewed", "unreviewed", "unreviewed"], "Rejected rewrite");
  write(`wiki/commentary/${DIALOGUE}.md`, rewritten);
  const submissionPath = "wiki/submissions/commentary/fixture/0001-rewrite-batch.json";
  const record = trackedSubmission(submissionPath, "rewrite-batch", original, rewritten, IDS, { revisions: IDS });
  const recordBytes = readFileSync(join(root, submissionPath));
  const acceptance = applyCommentaryRewriteAcceptance({
    dialogue: DIALOGUE,
    submissionRecordPath: submissionPath,
    submissionRecordSha256: sha256(recordBytes),
    targetSha256Before: record.target_sha256_before,
    targetSha256After: record.target_sha256_after,
    appliedIds: [IDS[0]!, IDS[2]!],
    postRewriteLedgerSha256: record.target_sha256_after,
    postRewriteStatuses: [
      { commentaryId: IDS[0]!, reviewStatus: "unreviewed" },
      { commentaryId: IDS[2]!, reviewStatus: "unreviewed" },
    ],
    reviewer: "cjpher-delegated-luna-reviewer-prior",
    reviewedOn: "2026-08-21",
    rationale: "The independent Luna review accepts two rewrites and leaves one bounded finding unresolved.",
  });
  applyCommentaryBlockReview({
    dialogue: DIALOGUE,
    decision: "rejected",
    reviewer: "cjpher-delegated-luna-reviewer-prior",
    reviewedOn: "2026-08-21",
    rationale: "The independent Luna review rejects the remaining rewrite for a bounded source defect.",
    reviewedIds: [IDS[1]!],
  });
  return {
    submissionPath,
    submissionSha256: sha256(recordBytes),
    receiptPath: acceptance.receiptPath,
    receiptSha256: sha256(readFileSync(join(root, acceptance.receiptPath))),
  };
}

function revision(id: string, label: string) {
  const index = IDS.indexOf(id) + 1;
  return {
    commentary_id: id,
    title: `Repair ${index}`,
    body: `${label} ${index}.`,
    cites: { observations: [], claims: [], relations: [], dossiers: [] },
    crossrefs: [],
  };
}

function candidate(
  prior: ReturnType<typeof establishPriorReview>,
  targetIds = [IDS[1]!],
  overrides: Partial<CommentaryRewriteRepairCandidate> = {},
): CommentaryRewriteRepairCandidate {
  const currentLedger = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8");
  return {
    schema_version: 1,
    dialogue: DIALOGUE,
    ledger: { path: `wiki/commentary/${DIALOGUE}.md`, sha256: sha256(currentLedger) },
    prior_submission: { path: prior.submissionPath, sha256: prior.submissionSha256 },
    acceptance_receipt: { path: prior.receiptPath, sha256: prior.receiptSha256 },
    prior_review: {
      reviewer: "cjpher-delegated-luna-reviewer-prior",
      reviewed_on: "2026-08-21",
      rejection_findings: targetIds.map((id) => ({ commentary_id: id, finding: `The prior rewrite for ${id} retained the bounded defect.` })),
    },
    repair_author: "cjpher-delegated-luna-repair-author-primary",
    human_listening_or_review: "none claimed",
    target_commentary_ids: targetIds,
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.rewrite },
    revisions: targetIds.map((id) => revision(id, "Repaired rewrite")),
    ...overrides,
  };
}

function writeCandidate(value: CommentaryRewriteRepairCandidate, path = CANDIDATE_PATH) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function acceptRepair(
  repair: ReturnType<typeof applyCommentaryRewriteRepair>,
  acceptedIds: string[],
  reviewer = "cjpher-delegated-luna-reviewer-final",
) {
  const bytes = readFileSync(join(root, repair.submissionPath));
  return applyCommentaryRewriteAcceptance({
    dialogue: DIALOGUE,
    submissionRecordPath: repair.submissionPath,
    submissionRecordSha256: sha256(bytes),
    targetSha256Before: repair.submission.target_sha256_before,
    targetSha256After: repair.submission.target_sha256_after,
    appliedIds: acceptedIds,
    postRewriteLedgerSha256: repair.submission.target_sha256_after,
    postRewriteStatuses: acceptedIds.map((commentaryId) => ({ commentaryId, reviewStatus: "unreviewed" })),
    reviewer,
    reviewedOn: "2026-08-22",
    rationale: "A separate independent Luna review accepts only the repaired IDs it verified.",
  });
}

function resetFixture() {
  restoreRoot?.();
  if (root) rmSync(root, { recursive: true, force: true });
  root = mkdtempSync(join(tmpdir(), "commentary-rewrite-repair-"));
  restoreRoot = setRepoRootForTesting(root);
  write("raw/plato/greek/fixture.txt", "{2a} a {2b} b {3a} c {3b} d {4a} e {4b} f");
  write("raw/plato/english/fixture.txt", "{2a} one {2b} two {3a} three {3b} four {4a} five {4b} six");
}

beforeEach(resetFixture);

afterEach(() => {
  restoreRoot?.();
  rmSync(root, { recursive: true, force: true });
  root = "";
});

describe("commentary rewrite repair", () => {
  it("previews without writing and applies a tracked unreviewed repair", () => {
    const prior = establishPriorReview();
    writeCandidate(candidate(prior));
    const before = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8");
    const preview = previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(preview.applied).toBe(false);
    expect(preview.changedBlockIds).toEqual([IDS[1]]);
    expect(readFileSync(join(root, preview.ledgerPath), "utf8")).toBe(before);

    const applied = applyCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(applied.submissionPath).toBe("wiki/submissions/commentary/fixture/0002-rewrite-repair.json");
    expect(applied.submission.kind).toBe("rewrite-repair");
    expect(applied.submission.applied_ids).toEqual([IDS[1]]);
    expect(applied.prospectiveLedger).toContain("Repaired rewrite 2.");
    expect(applied.prospectiveLedger.match(/review_status: unreviewed/g)?.length).toBe(2);
  });

  it("chains from a partially accepted rewrite-repair receipt", () => {
    const prior = establishPriorReview();
    writeCandidate(candidate(prior, [IDS[1]!, IDS[2]!]));
    const firstRepair = applyCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    const firstAcceptance = acceptRepair(firstRepair, [IDS[1]!], "cjpher-delegated-luna-reviewer-second-prior");
    const nextPrior = {
      submissionPath: firstRepair.submissionPath,
      submissionSha256: sha256(readFileSync(join(root, firstRepair.submissionPath))),
      receiptPath: firstAcceptance.receiptPath,
      receiptSha256: sha256(readFileSync(join(root, firstAcceptance.receiptPath))),
    };
    const secondPath = "scratch/commentary/rewrite-repairs/fixture/second-repair.json";
    const next = candidate(nextPrior, [IDS[2]!], {
      prior_review: {
        reviewer: "cjpher-delegated-luna-reviewer-second-prior",
        reviewed_on: "2026-08-22",
        rejection_findings: [{ commentary_id: IDS[2]!, finding: "The remaining rewrite still carries the exact rejected defect." }],
      },
      repair_author: "cjpher-delegated-luna-repair-author-secondary",
      revisions: [revision(IDS[2]!, "Second repair")],
    });
    writeCandidate(next, secondPath);
    const secondRepair = applyCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: secondPath });
    expect(secondRepair.submissionPath).toBe("wiki/submissions/commentary/fixture/0003-rewrite-repair.json");
    expect(secondRepair.changedBlockIds).toEqual([IDS[2]]);
    expect(secondRepair.prospectiveLedger).toContain("Second repair 3.");
  });

  it("repairs a rewrite batch that an independent block review rejected in full", () => {
    const prior = establishRejectedPriorReview();
    writeCandidate(candidate(prior, [IDS[1]!]));
    const preview = previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(preview.changedBlockIds).toEqual([IDS[1]]);
    const applied = applyCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(applied.prospectiveLedger).toContain("Repaired rewrite 2.");
    expect(applied.prospectiveLedger.match(/review_status: rejected/g)?.length).toBe(2);
    expect(applied.prospectiveLedger.match(/review_status: unreviewed/g)?.length).toBe(1);
  });

  it("bridges an unrelated rewrite acceptance applied after the bound block rejection", () => {
    const original = ledger(["accepted", "accepted", "accepted"], "Original");
    const rewritten = original.replace(
      new RegExp(`(commentary_id: ${IDS[1]}[\\s\\S]*?review_status: )accepted`, "mu"),
      "$1unreviewed",
    );
    write(`wiki/commentary/${DIALOGUE}.md`, rewritten);
    const priorPath = "wiki/submissions/commentary/fixture/0001-rewrite-batch.json";
    trackedSubmission(priorPath, "rewrite-batch", original, rewritten, [IDS[1]!], { revisions: [IDS[1]!] });
    const unrelatedBefore = rewritten;
    const unrelatedAfter = unrelatedBefore.replace(
      new RegExp(`(commentary_id: ${IDS[0]}[\\s\\S]*?review_status: )accepted`, "mu"),
      "$1unreviewed",
    );
    write(`wiki/commentary/${DIALOGUE}.md`, unrelatedAfter);
    const unrelatedPath = "wiki/submissions/commentary/fixture/0002-rewrite-batch.json";
    const unrelated = trackedSubmission(
      unrelatedPath,
      "rewrite-batch",
      unrelatedBefore,
      unrelatedAfter,
      [IDS[0]!],
      { revisions: [IDS[0]!] },
    );
    const rejection = applyCommentaryBlockReview({
      dialogue: DIALOGUE,
      decision: "rejected",
      reviewer: "cjpher-delegated-luna-reviewer-prior",
      reviewedOn: "2026-08-21",
      rationale: "The independent Luna review rejects the bounded unsupported rewrite.",
      reviewedIds: [IDS[1]!],
    });
    const unrelatedBytes = readFileSync(join(root, unrelatedPath));
    applyCommentaryRewriteAcceptance({
      dialogue: DIALOGUE,
      submissionRecordPath: unrelatedPath,
      submissionRecordSha256: sha256(unrelatedBytes),
      targetSha256Before: unrelated.target_sha256_before,
      targetSha256After: unrelated.target_sha256_after,
      appliedIds: [IDS[0]!],
      postRewriteLedgerSha256: sha256(readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`))),
      postRewriteStatuses: [{ commentaryId: IDS[0]!, reviewStatus: "unreviewed" }],
      reviewer: "cjpher-delegated-luna-reviewer-unrelated",
      reviewedOn: "2026-08-22",
      rationale: "The independent Luna review accepts the unrelated bounded rewrite.",
    });

    const prior = {
      submissionPath: priorPath,
      submissionSha256: sha256(readFileSync(join(root, priorPath))),
      receiptPath: rejection.receiptPath,
      receiptSha256: sha256(readFileSync(join(root, rejection.receiptPath))),
    };
    writeCandidate(candidate(prior, [IDS[1]!]));
    const preview = previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(preview.changedBlockIds).toEqual([IDS[1]]);
    expect(preview.prospectiveLedger.match(/review_status: accepted/g)?.length).toBe(2);
    expect(preview.prospectiveLedger.match(/review_status: unreviewed/g)?.length).toBe(1);
  });

  it("repairs an unaccepted rewrite after a partial acceptance and canonical block rejection", () => {
    const prior = establishPartiallyAcceptedAndRejectedReview();
    writeCandidate(candidate(prior, [IDS[1]!]));
    const preview = previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(preview.changedBlockIds).toEqual([IDS[1]]);
    const applied = applyCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(applied.prospectiveLedger).toContain("Repaired rewrite 2.");
    expect(applied.prospectiveLedger.match(/review_status: accepted/g)?.length).toBe(2);
    expect(applied.prospectiveLedger.match(/review_status: unreviewed/g)?.length).toBe(1);
  });

  it("requires acceptance separation and fails closed on tampering, invalid paths, and status drift", () => {
    const prior = establishPriorReview();
    const base = candidate(prior);
    writeCandidate(base);
    const repair = applyCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    const recordBytes = readFileSync(join(root, repair.submissionPath));
    const acceptance = {
      dialogue: DIALOGUE,
      submissionRecordPath: repair.submissionPath,
      submissionRecordSha256: sha256(recordBytes),
      targetSha256Before: repair.submission.target_sha256_before,
      targetSha256After: repair.submission.target_sha256_after,
      appliedIds: [IDS[1]!],
      postRewriteLedgerSha256: repair.submission.target_sha256_after,
      postRewriteStatuses: [{ commentaryId: IDS[1]!, reviewStatus: "unreviewed" }],
      reviewer: "cjpher-delegated-luna-reviewer-final",
      reviewedOn: "2026-08-22",
      rationale: "A separate independent Luna review accepts the repaired ID.",
    } as const;
    expect(() => previewCommentaryRewriteAcceptance({ ...acceptance, reviewer: base.repair_author })).toThrow("delegated Luna reviewer");
    expect(() => previewCommentaryRewriteAcceptance({ ...acceptance, reviewer: base.prior_review.reviewer })).toThrow("separate delegated Luna");

    resetFixture();
    const freshPrior = establishPriorReview();
    const invalidIds = candidate(freshPrior, [IDS[0]!]);
    writeCandidate(invalidIds);
    expect(() => previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("unaccepted_applied_ids");

    const tampered = candidate(freshPrior);
    writeCandidate({ ...tampered, prior_submission: { ...tampered.prior_submission, sha256: "0".repeat(64) } });
    expect(() => previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("submission SHA mismatch");
    writeCandidate({ ...tampered, acceptance_receipt: { ...tampered.acceptance_receipt, sha256: "0".repeat(64) } });
    expect(() => previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("receipt SHA mismatch");
    writeCandidate({ ...tampered, repair_author: tampered.prior_review.reviewer });
    expect(() => previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("repair_author");
    expect(() => previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: "scratch/commentary/rewrite-repairs/other/x.json" })).toThrow("directly inside");

    const driftedLedger = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8").replace(
      new RegExp(`(commentary_id: ${IDS[1]}[\\s\\S]*?review_status: )unreviewed`, "mu"),
      "$1accepted",
    );
    write(`wiki/commentary/${DIALOGUE}.md`, driftedLedger);
    const drifted = candidate(freshPrior);
    writeCandidate(drifted);
    expect(() => previewCommentaryRewriteRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow(/cannot be reversed|currently be unreviewed/u);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "../commentary-authoring.js";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { applyCommentaryRewriteAcceptance, previewCommentaryRewriteAcceptance } from "./commentary-rewrite-review.js";
import {
  applyCommentarySampleRepair,
  previewCommentarySampleRepair,
  type CommentarySampleRepairCandidate,
} from "./commentary-sample-repair.js";

const DIALOGUE = "fixture";
const ID = "comm_fixture_0001";
const ID2 = "comm_fixture_0002";
const CANDIDATE_PATH = "scratch/commentary/sample-repairs/fixture/final-sample.json";
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

function ledger(statuses: [string, string] = ["accepted", "accepted"]) {
  return [
    "# Fixture Commentary",
    "",
    ...[ID, ID2].flatMap((id, index) => {
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
        `body: \"Original ${index + 1}.\"`,
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

function candidate(overrides: Partial<CommentarySampleRepairCandidate> = {}): CommentarySampleRepairCandidate {
  const currentLedger = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8");
  return {
    schema_version: 1,
    dialogue: DIALOGUE,
    ledger: { path: `wiki/commentary/${DIALOGUE}.md`, sha256: sha256(currentLedger) },
    sample_review: {
      reviewer: "cjpher-delegated-luna-reviewer-sampler",
      reviewed_on: "2026-08-21",
      rationale: "The independent Luna final sample found one bounded prose defect.",
      human_listening_or_review: "none claimed",
      sampled_commentary_ids: [ID, ID2],
      failed_commentary_ids: [ID2],
    },
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.rewrite },
    revisions: [{
      commentary_id: ID2,
      title: "Repaired fixture 2",
      body: "A bounded repaired orientation.",
      cites: { observations: [], claims: [], relations: [], dossiers: [] },
      crossrefs: [],
    }],
    ...overrides,
  };
}

function writeCandidate(value = candidate(), path = CANDIDATE_PATH) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-sample-repair-"));
  restoreRoot = setRepoRootForTesting(root);
  write("raw/plato/greek/fixture.txt", "{2a} alpha {2b} beta {3a} gamma {3b} delta");
  write("raw/plato/english/fixture.txt", "{2a} first {2b} second {3a} third {3b} fourth");
  write(`wiki/commentary/${DIALOGUE}.md`, ledger());
});

afterEach(() => {
  restoreRoot?.();
  rmSync(root, { recursive: true, force: true });
  root = "";
});

describe("commentary final-sample repair", () => {
  it("previews without writing, applies unreviewed prose, and records exact sample provenance", () => {
    writeCandidate();
    const before = readFileSync(join(root, `wiki/commentary/${DIALOGUE}.md`), "utf8");
    const preview = previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(preview.applied).toBe(false);
    expect(preview.changedBlockIds).toEqual([ID2]);
    expect(readFileSync(join(root, preview.ledgerPath), "utf8")).toBe(before);
    expect(existsSync(join(root, "wiki/submissions/commentary/fixture"))).toBe(false);

    const applied = applyCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    expect(applied.submissionPath).toBe("wiki/submissions/commentary/fixture/0001-sample-repair.json");
    expect(applied.submission.kind).toBe("sample-repair");
    expect(applied.submission.applied_ids).toEqual([ID2]);
    expect(applied.submission.target_sha256_before).toBe(sha256(before));
    expect(applied.submission.target_sha256_after).toBe(applied.ledgerSha256After);
    expect(readFileSync(join(root, applied.ledgerPath), "utf8")).toContain("review_status: unreviewed");
  });

  it("allows a separate delegated Luna reviewer to accept a sample-repair submission", () => {
    const base = candidate();
    writeCandidate({
      ...base,
      sample_review: { ...base.sample_review, failed_commentary_ids: [ID, ID2] },
      revisions: [
        {
          commentary_id: ID,
          title: "Repaired fixture 1",
          body: "A first bounded repaired orientation.",
          cites: { observations: [], claims: [], relations: [], dossiers: [] },
          crossrefs: [],
        },
        ...base.revisions,
      ],
    });
    const repair = applyCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH });
    const recordBytes = readFileSync(join(root, repair.submissionPath));
    const acceptanceInput = {
      dialogue: DIALOGUE,
      submissionRecordPath: repair.submissionPath,
      submissionRecordSha256: sha256(recordBytes),
      targetSha256Before: repair.submission.target_sha256_before,
      targetSha256After: repair.submission.target_sha256_after,
      appliedIds: [ID2],
      postRewriteLedgerSha256: repair.submission.target_sha256_after,
      postRewriteStatuses: [{ commentaryId: ID2, reviewStatus: "unreviewed" }],
      reviewer: "cjpher-delegated-luna-reviewer-acceptor",
      reviewedOn: "2026-08-21",
      rationale: "A separate independent Luna review accepts the bounded sample repair.",
    } as const;
    expect(() => previewCommentaryRewriteAcceptance({
      ...acceptanceInput,
      reviewer: "cjpher-delegated-luna-reviewer-sampler",
    })).toThrow("requires a separate");
    const accepted = applyCommentaryRewriteAcceptance(acceptanceInput);
    expect(accepted.unacceptedAppliedIds).toEqual([ID]);
    const finalLedger = readFileSync(join(root, accepted.ledgerPath), "utf8");
    expect(finalLedger.match(/review_status: accepted/g)?.length).toBe(1);
    expect(finalLedger.match(/review_status: unreviewed/g)?.length).toBe(1);
  });

  it("fails closed on weak samples, bad subsets, revision mismatch, reviewer claims, drift, and path tampering", () => {
    const base = candidate();
    writeCandidate({ ...base, sample_review: { ...base.sample_review, sampled_commentary_ids: [ID] } });
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("at least 2");

    writeCandidate({ ...base, sample_review: { ...base.sample_review, sampled_commentary_ids: [ID2, ID] } });
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("canonical ledger order");

    writeCandidate({ ...base, sample_review: { ...base.sample_review, failed_commentary_ids: [ID] } });
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("candidate.revisions");

    writeCandidate({ ...base, sample_review: { ...base.sample_review, reviewer: "ordinary-reviewer" } });
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("delegated Luna");

    writeCandidate({ ...base, sample_review: { ...base.sample_review, rationale: "A human listened to this." } });
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("must not claim human");

    writeCandidate(base);
    write(`wiki/commentary/${DIALOGUE}.md`, `${ledger()}\n`);
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: CANDIDATE_PATH })).toThrow("SHA drifted");
    expect(() => previewCommentarySampleRepair({ dialogue: DIALOGUE, candidatePath: "scratch/commentary/sample-repairs/other/final-sample.json" })).toThrow("directly inside");
  });
});

import { describe, expect, it } from "bun:test";
import {
  COMMENTARY_PLACEMENT_HAZARD_CODES,
  COMMENTARY_QUALITY_ISSUE_CODES,
  COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
  parseCommentaryQualityAudit,
} from "./commentary-audit.js";

function validAudit() {
  return {
    schema_version: 3,
    dialogue: "fixture",
    unit_key: "01-2a-2b",
    section_id: "comm_fixture_0001",
    authoring: { model: "gpt-5.6-luna", effort: "medium" },
    unit_verdict: "pass",
    blocks: [
      {
        commentary_id: "comm_fixture_0001",
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
        rationale: "The block earns its place in the listening sequence.",
      },
    ],
  };
}

describe("commentary quality-audit authoring policy", () => {
  it("accepts only exact Luna medium-effort audit provenance", () => {
    expect(COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA.properties.authoring.properties).toEqual({
      model: { type: "string", const: "gpt-5.6-luna" },
      effort: { type: "string", const: "medium" },
    });
    expect(parseCommentaryQualityAudit(validAudit()).authoring).toEqual({
      model: "gpt-5.6-luna",
      effort: "medium",
    });

    const legacyAudit = validAudit();
    legacyAudit.schema_version = 2;
    expect(() => parseCommentaryQualityAudit(legacyAudit)).toThrow("schema_version must be 3");

    const oldModel = validAudit();
    oldModel.authoring.model = "claude-opus-4-8";
    expect(() => parseCommentaryQualityAudit(oldModel)).toThrow(
      "authoring must record model gpt-5.6-luna and effort medium",
    );

    const wrongEffort = validAudit();
    wrongEffort.authoring.effort = "high";
    expect(() => parseCommentaryQualityAudit(wrongEffort)).toThrow(
      "authoring must record model gpt-5.6-luna and effort medium",
    );
  });

  it("rejects visibly clipped or malformed rationales instead of accepting schema-bound garbage", () => {
    for (const rationale of [
      "The rationale is clipped mid-word",
      `${"A".repeat(239)}`,
      "The rationale contains an invisible\u200b character.",
      "The rationale contains a replacement character �.",
      "The rationale contains unrelated glyphs 可.",
    ]) {
      const audit = validAudit();
      audit.blocks[0]!.rationale = rationale;
      expect(() => parseCommentaryQualityAudit(audit)).toThrow(
        "is visibly truncated or malformed",
      );
    }

    const completeAtSchemaBoundary = validAudit();
    completeAtSchemaBoundary.blocks[0]!.rationale = `${"A".repeat(239)}.`;
    expect(parseCommentaryQualityAudit(completeAtSchemaBoundary).blocks[0]?.rationale).toHaveLength(240);

    const greekTerm = validAudit();
    greekTerm.blocks[0]!.rationale = "The close reading of τορνεύων is specific and complete.";
    expect(parseCommentaryQualityAudit(greekTerm).blocks[0]?.rationale).toContain("τορνεύων");
  });

  it("requires explicit evidence, placement, and listening checks to agree with issue codes and disposition", () => {
    const missingChecks = validAudit() as Record<string, unknown> & { blocks: Array<Record<string, unknown>> };
    delete missingChecks.blocks[0]!.checks;
    expect(() => parseCommentaryQualityAudit(missingChecks)).toThrow("blocks[0].checks is required");

    const unsafeRewrite = validAudit();
    unsafeRewrite.unit_verdict = "fail";
    unsafeRewrite.blocks[0]!.disposition = "rewrite";
    unsafeRewrite.blocks[0]!.issue_codes = ["interrupts_dramatic_flow"];
    unsafeRewrite.blocks[0]!.checks.placement.verdict = "fail";
    unsafeRewrite.blocks[0]!.checks.placement.hazard_codes = ["question_answer_split"];
    unsafeRewrite.blocks[0]!.rationale = "The insertion separates a question from its direct answer.";
    expect(() => parseCommentaryQualityAudit(unsafeRewrite)).toThrow("unsafe placement requires disposition remove");

    const uncodedEvidenceFailure = validAudit();
    uncodedEvidenceFailure.unit_verdict = "fail";
    uncodedEvidenceFailure.blocks[0]!.disposition = "rewrite";
    uncodedEvidenceFailure.blocks[0]!.issue_codes = ["source_recap"];
    uncodedEvidenceFailure.blocks[0]!.checks.evidence.verdict = "fail";
    uncodedEvidenceFailure.blocks[0]!.checks.listening.verdict = "fail";
    uncodedEvidenceFailure.blocks[0]!.rationale = "A checkable assertion lacks evidence and the block merely repeats the source.";
    expect(() => parseCommentaryQualityAudit(uncodedEvidenceFailure)).toThrow("matching evidence code");
  });

  it("rejects a placement pass that marks a question-answer split", () => {
    expect(COMMENTARY_PLACEMENT_HAZARD_CODES).toContain("question_answer_split");
    const contradictory = validAudit();
    contradictory.blocks[0]!.checks.placement.hazard_codes = ["question_answer_split"];
    contradictory.blocks[0]!.rationale = "Before is a complete question and after is its immediate answer.";

    expect(() => parseCommentaryQualityAudit(contradictory)).toThrow(
      "placement.verdict must fail exactly when hazard_codes is non-empty",
    );
  });

  it("classifies duplicate explanatory jobs separately from repeated diction", () => {
    expect(COMMENTARY_QUALITY_ISSUE_CODES).toContain("redundant_within_unit");

    const duplicateJob = validAudit();
    duplicateJob.unit_verdict = "fail";
    duplicateJob.blocks[0]!.disposition = "remove";
    duplicateJob.blocks[0]!.issue_codes = ["redundant_within_unit"];
    duplicateJob.blocks[0]!.checks.listening.verdict = "fail";
    duplicateJob.blocks[0]!.rationale = "A second block in the unit performs the same explanatory job.";

    expect(parseCommentaryQualityAudit(duplicateJob).blocks[0]?.issue_codes).toEqual([
      "redundant_within_unit",
    ]);
  });
});

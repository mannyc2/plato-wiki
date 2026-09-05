import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CanonicalYamlValue } from "./fenced-record.js";
import {
  applyAtomicClaimMetadata,
  assertRejectedRecordProseOverride,
  materializeLegacyCommentaryQualityAuditRetirements,
  nonAcceptedRecordIdReferences,
  planLegacyCommentaryQualityAuditRetirements,
  retypeRejectedEmptyCrossref,
  requiresFailClosedDispositionBeforeEvidence,
  rewriteCommentaryCitationIds,
} from "./semantic-remediation.js";

describe("claim evidence synthesis", () => {
  test("does not synthesize evidence when any unresolved finding requires fail-closed rejection", () => {
    const findings = [
      { finding_id: "finding_missing", defect_class: "missing_observation_linkage" },
      { finding_id: "finding_epistemic", defect_class: "epistemic_qualification_lost" },
    ];

    expect(requiresFailClosedDispositionBeforeEvidence(findings, new Set())).toBe(true);
    expect(requiresFailClosedDispositionBeforeEvidence(
      findings,
      new Set(["finding_epistemic"]),
    )).toBe(false);
  });

  test("allows the deterministic source-link repair when it is the only unresolved finding", () => {
    expect(requiresFailClosedDispositionBeforeEvidence(
      [{ finding_id: "finding_missing", defect_class: "claim_missing_observation_linkage" }],
      new Set(),
    )).toBe(false);
  });

  test("fails closed on unknown compound classes instead of matching repairable substrings", () => {
    for (const defectClass of [
      "epistemic_voice_mismatch",
      "malformed_fenced_yaml_and_content_fabrication",
      "missing_observation_linkage_and_source_overstatement",
    ]) {
      expect(requiresFailClosedDispositionBeforeEvidence(
        [{ finding_id: `finding_${defectClass}`, defect_class: defectClass }],
        new Set(),
      )).toBe(true);
    }
  });
});

describe("legacy commentary quality-audit hard cut", () => {
  test("moves every stale active acceptance to exact content-addressed history", () => {
    const root = mkdtempSync(join(tmpdir(), "plato-commentary-audit-retirement-"));
    try {
      const directory = join(root, "wiki/commentary-audits");
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, "meno.json"), "{\"dialogue\":\"meno\"}\n");
      writeFileSync(join(directory, "symposium.json"), "{\"dialogue\":\"symposium\"}\n");
      const packagePath = join(root, "wiki/ontology-audits", `sha256-${"a".repeat(64)}`);
      mkdirSync(packagePath, { recursive: true });

      const retirements = planLegacyCommentaryQualityAuditRetirements(root);
      expect(retirements.map((retirement) => retirement.dialogue)).toEqual(["meno", "symposium"]);
      const artifact = materializeLegacyCommentaryQualityAuditRetirements({
        repoRoot: root,
        packagePath,
        retirements,
      });

      expect(artifact.count).toBe(2);
      expect(artifact.content.trim().split("\n")).toHaveLength(2);
      expect(createHash("sha256").update(readFileSync(join(root, artifact.artifactPath))).digest("hex"))
        .toBe(artifact.sha256);

      for (const retirement of retirements) {
        expect(existsSync(join(root, retirement.source_path))).toBe(false);
        expect(createHash("sha256").update(readFileSync(join(root, retirement.archive_path))).digest("hex"))
          .toBe(retirement.sha256);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("atomic claim remediation", () => {
  test("replaces inherited owner and stance metadata as one hard cut", () => {
    const record: Record<string, CanonicalYamlValue> = {
      speaker: "ΣΩ.",
      claim_kind: "thesis",
      stance_events: [{ kind: "revised", stephanus_span: "541a-541b" }],
      final_status: "revised",
      speaker_source_ref: {
        source_path: "raw/plato/greek/meno.txt",
        start_char: 4804,
        end_char: 4811,
        text_sha256: "f52eecacfdb70aa709cf21e5da1b965c2092349eeaeaf4276c3306638cfef355",
      },
    };

    applyAtomicClaimMetadata(record, "meno", {
      speaker: "ΜΕΝ.",
      claim_kind: "method_rule",
      stance_events: [{ kind: "asserted", stephanus_span: "72e" }],
      speaker_source_ref: null,
    });

    expect(record.speaker).toBe("ΜΕΝ.");
    expect(record.claim_kind).toBe("method_rule");
    expect(record.final_status).toBe("left_standing");
    expect(record.speaker_source_ref).toBeUndefined();
    expect(record.stance_events).toEqual([
      {
        kind: "asserted",
        stephanus_span: "72e",
        source_ref: expect.objectContaining({
          source_path: "raw/plato/greek/meno.txt",
          stephanus_span: "72e",
        }),
      },
    ]);
  });
});

describe("commentary replacement citations", () => {
  test("expands split evidence, follows replacement chains, and drops rejected cross-lane projections", () => {
    const records = new Map([
      ["record:observation:obs_parent", { reviewStatus: "rejected" }],
      ["record:observation:obs_child_a", { reviewStatus: "accepted" }],
      ["record:observation:obs_child_b", { reviewStatus: "rejected" }],
      ["record:observation:obs_child_c", { reviewStatus: "accepted" }],
      ["record:observation:obs_projection", { reviewStatus: "rejected" }],
      ["record:voice:voice_projection", { reviewStatus: "accepted" }],
    ]);
    const replacements = new Map<string, readonly string[]>([
      ["record:observation:obs_parent", ["record:observation:obs_child_a", "record:observation:obs_child_b"]],
      ["record:observation:obs_child_b", ["record:observation:obs_child_c"]],
      ["record:observation:obs_projection", ["record:voice:voice_projection"]],
    ]);

    expect(rewriteCommentaryCitationIds(
      ["obs_projection", "obs_parent"],
      "observation",
      records,
      replacements,
    )).toEqual(["obs_child_a", "obs_child_c"]);
  });

  test("fails closed on replacement cycles and missing citation targets", () => {
    const records = new Map([
      ["record:claim:claim_a", { reviewStatus: "rejected" }],
      ["record:claim:claim_b", { reviewStatus: "rejected" }],
    ]);
    const replacements = new Map<string, readonly string[]>([
      ["record:claim:claim_a", ["record:claim:claim_b"]],
      ["record:claim:claim_b", ["record:claim:claim_a"]],
    ]);

    expect(() => rewriteCommentaryCitationIds(["claim_a"], "claim", records, replacements))
      .toThrow("Cyclic semantic replacement chain");
    expect(() => rewriteCommentaryCitationIds(["claim_missing"], "claim", records, replacements))
      .toThrow("missing canonical record");
  });

  test("does not widen commentary evidence with source-omission additions", () => {
    const records = new Map([
      ["record:observation:obs_rejected", { reviewStatus: "rejected" }],
      ["record:observation:obs_omission_elsewhere", { reviewStatus: "accepted" }],
    ]);
    const generalMigrationReplacements = new Map<string, readonly string[]>([
      ["record:observation:obs_rejected", ["record:observation:obs_omission_elsewhere"]],
    ]);
    const commentarySafeAtomicReplacements = new Map<string, readonly string[]>();

    expect(generalMigrationReplacements.get("record:observation:obs_rejected")).toEqual([
      "record:observation:obs_omission_elsewhere",
    ]);
    expect(rewriteCommentaryCitationIds(
      ["obs_rejected"],
      "observation",
      records,
      commentarySafeAtomicReplacements,
    )).toEqual([]);
  });

  test("retypes the exact rejected cross-reference whose citation set becomes empty", () => {
    const record: Record<string, CanonicalYamlValue> = {
      review_status: "rejected",
      block_kind: "crossref",
      cites: { observations: [], claims: [], relations: [], dossiers: [] },
      crossrefs: [],
    };

    expect(retypeRejectedEmptyCrossref("record:commentary:comm_symposium_0046", record))
      .toContain("invalid empty cross-reference block");
    expect(record.block_kind).toBe("argument");
  });

  test("fails closed if the exact rejected cross-reference still has evidence", () => {
    const record: Record<string, CanonicalYamlValue> = {
      review_status: "rejected",
      block_kind: "crossref",
      cites: { observations: [], claims: ["claim_symposium_0081"], relations: [], dossiers: [] },
      crossrefs: [],
    };

    expect(() => retypeRejectedEmptyCrossref("record:commentary:comm_symposium_0046", record))
      .toThrow("requires zero surviving citations and crossrefs");
  });
});

describe("accepted reader prose", () => {
  test("fails closed on rejected and unknown peer ids while allowing accepted ids", () => {
    const statuses = new Map([
      ["obs_fixture_0001", "rejected"],
      ["obs_fixture_0003", "accepted"],
    ]);

    expect(nonAcceptedRecordIdReferences(
      "Compare obs_fixture_0001 with obs_fixture_0002 and obs_fixture_0003; obs_fixture_0001 is repeated.",
      statuses,
    )).toEqual(["obs_fixture_0001", "obs_fixture_0002"]);
  });

  test("binds every item-level override to exact old bytes and a rejected target", () => {
    const current = "This limit previously cited obs_fixture_0001.";
    const expectedSha256 = createHash("sha256").update(current).digest("hex");
    const options = {
      key: "record:observation:obs_fixture_0002.limits",
      current,
      expectedSha256,
      rejectedIds: ["obs_fixture_0001"],
      reviewStatuses: new Map([["obs_fixture_0001", "rejected"]]),
    };

    expect(() => assertRejectedRecordProseOverride(options)).not.toThrow();
    expect(() => assertRejectedRecordProseOverride({ ...options, current: `${current} drift` }))
      .toThrow("override input drifted");
    expect(() => assertRejectedRecordProseOverride({
      ...options,
      reviewStatuses: new Map([["obs_fixture_0001", "accepted"]]),
    })).toThrow("is not a rejected canonical record");
  });
});

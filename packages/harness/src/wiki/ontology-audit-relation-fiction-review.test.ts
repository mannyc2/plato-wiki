import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fencedYamlRecordBlocks } from "./fenced-record.js";
import {
  ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
  ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT,
  ontologyAuditAdjudicationSha256,
  ontologyAuditFinalPointerSha256,
  ontologyAuditRelationFictionEdgeRationale,
  ontologyAuditRelationFictionReviewArtifactName,
  readOntologyAuditRelationFictionReviewEvidence,
  renderOntologyAuditRelationFictionReviewEvidence,
  verifyOntologyAuditRelationFictionFinalAdjustments,
  type OntologyAuditFinalAdjustment,
  type OntologyAuditFinalAdjustmentPriorState,
  type OntologyAuditRelationFictionReviewEntry,
  type OntologyAuditRelationFictionReviewEvidence,
} from "./ontology-audit-final-adjustments.js";
import { mergeOntologyAuditPartition } from "./ontology-audit-finalization.js";
import type { OntologyAuditGraphUnit } from "./ontology-audit.js";

const PACKAGE = "wiki/ontology-audits/sha256-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const EVIDENCE_DIRECTORY = `${PACKAGE}/review-inputs/final-adjustment-evidence`;

let root = "";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

const fixtures = [
  {
    relationId: "rel_cross-dialogue_0638",
    ledgerPath: "wiki/relations/cross-dialogue.md",
    claimA: "claim_laws_0246",
    claimB: "claim_republic_0777",
    resolution: "standing",
    basis: "The shared term soul does not indicate a shared thesis; the claims neither contradict nor restate each other.",
    limits: "The claims address different questions.",
    field: "basis" as const,
    rule: "shared_term_no_shared_thesis" as const,
  },
  {
    relationId: "rel_republic_0024",
    ledgerPath: "wiki/relations/republic.md",
    claimA: "claim_republic_0088",
    claimB: "claim_republic_0247",
    resolution: "verbal_only",
    basis: "The claims use the same term in distinct argumentative contexts.",
    limits: "The shared term alone does not create a substantive tension.",
    field: "limits" as const,
    rule: "declared_kind_denial" as const,
  },
  {
    relationId: "rel_timaeus_0050",
    ledgerPath: "wiki/relations/timaeus.md",
    claimA: "claim_timaeus_0216",
    claimB: "claim_timaeus_0226",
    resolution: "standing",
    basis: "The claims are thematically linked by breath but address different bodily processes.",
    limits: "The claims do not conflict. The relation is limited to the shared substance term breath across different explanatory contexts.",
    field: "basis+limits" as const,
    rule: "lexical_only_standing_tension" as const,
  },
] as const;

function rejectedBlock(fixture: (typeof fixtures)[number]) {
  return [
    "```yaml",
    `relation_id: ${fixture.relationId}`,
    `pair_id: pair_${fixture.relationId.slice(4).replace(/_0/u, "_00")}`,
    `claim_a: ${fixture.claimA}`,
    `claim_b: ${fixture.claimB}`,
    "relation_kind: tension",
    `resolution: ${fixture.resolution}`,
    `basis: ${fixture.basis}`,
    `limits: ${fixture.limits}`,
    "review_status: rejected",
    "```",
  ].join("\n");
}

function entry(fixture: (typeof fixtures)[number], denialRule = fixture.rule): OntologyAuditRelationFictionReviewEntry {
  const finalBlock = rejectedBlock(fixture);
  const priorBlock = finalBlock.replace("review_status: rejected", "review_status: accepted");
  const priorFinal = {
    path: fixture.ledgerPath,
    ordinal: 0,
    canonical_sha256: sha256(priorBlock),
  };
  const expectedFinal = {
    path: fixture.ledgerPath,
    ordinal: 0,
    canonical_sha256: sha256(finalBlock),
    review_status: "rejected",
  };
  const supersededAdjudication = fixtureAdjudication(fixture.relationId);
  return {
    action: "reject",
    claim_a: fixture.claimA,
    claim_b: fixture.claimB,
    denial_field: fixture.field,
    denial_rule: denialRule,
    expected_final_full_match_sha256: sha256(finalBlock),
    expected_final_pointer_sha256: ontologyAuditFinalPointerSha256(expectedFinal)!,
    expected_review_status: "rejected",
    graph_disposition: "retire_accepted_semantic_edge_preserve_baseline_provenance",
    ledger_path: fixture.ledgerPath,
    ordinal: 0,
    prior_full_match_sha256: sha256(priorBlock),
    prior_final_pointer_sha256: ontologyAuditFinalPointerSha256(priorFinal)!,
    prior_review_status: "accepted",
    rationale: `The accepted ${fixture.relationId} record denies the typed tension it declares, so reject it while retaining raw provenance.`,
    relation_id: fixture.relationId,
    relation_kind: "tension",
    replacement_target_keys: [],
    resolution: fixture.resolution,
    superseded_adjudication_sha256: ontologyAuditAdjudicationSha256(supersededAdjudication)!,
    target_key: `record:relation:${fixture.relationId}`,
  };
}

function fixtureAdjudication(relationId: string) {
  return {
    adjudication_id: `adjudication:${relationId}`,
    target_key: `record:relation:${relationId}`,
    target_kind: "record",
    state: "complete",
    action: "valid_as_is",
    rationale: "The frozen audit had previously ratified this accepted relation record as valid as is.",
    finding_ids: [],
    replacement_target_keys: [],
    receipt_path: "wiki/review/prior.md",
  };
}

function fixtureEdgeAdjudication(relationId: string) {
  return {
    adjudication_id: `adjudication:edge:${relationId}`,
    target_key: `edge:relation:${relationId}`,
    target_kind: "edge",
    state: "complete",
    action: "valid_as_is",
    rationale: "The frozen audit had previously ratified this accepted semantic relation edge as valid as is.",
    finding_ids: [],
    replacement_target_keys: [],
    receipt_path: "wiki/review/prior.md",
  };
}

function materializeEvidence(overrides: { timaeusRule?: OntologyAuditRelationFictionReviewEntry["denial_rule"] } = {}) {
  for (const fixture of fixtures) write(fixture.ledgerPath, `${rejectedBlock(fixture)}\n`);
  const entries = fixtures.map((fixture) =>
    entry(fixture, fixture.relationId === "rel_timaeus_0050" && overrides.timaeusRule
      ? overrides.timaeusRule
      : fixture.rule)
  );
  write(`${PACKAGE}/record-units.jsonl`, `${entries.map((value) => JSON.stringify({
    key: value.target_key,
    final: {
      path: value.ledger_path,
      ordinal: value.ordinal,
      canonical_sha256: value.prior_full_match_sha256,
    },
  })).join("\n")}\n`);
  write(`${PACKAGE}/adjudications.jsonl`, `${fixtures.map((fixture) =>
    JSON.stringify(fixtureAdjudication(fixture.relationId))
  ).join("\n")}\n`);
  const evidence: OntologyAuditRelationFictionReviewEvidence = {
    schema_version: 1,
    kind: "accepted_relation_semantic_fiction_review",
    reviewer: "ontology-vnext-relation-gate-independent-review",
    reviewed_on: "2026-09-01",
    source_policy: "Canonical typed relation records only; no translation was consulted.",
    graph_policy: "Retire accepted semantic edges; rejected records and immutable baseline pointers retain review provenance.",
    receipt_path: ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT,
    entries,
  };
  const content = renderOntologyAuditRelationFictionReviewEvidence(evidence);
  const artifactName = ontologyAuditRelationFictionReviewArtifactName(content);
  const artifactPath = `${EVIDENCE_DIRECTORY}/${artifactName}`;
  write(artifactPath, content);
  const digest = sha256(content);
  const receipt = [
    "# Relation semantic-edge rejection review",
    "",
    "reviewer: ontology-vnext-relation-gate-independent-review",
    "reviewed_on: 2026-09-01",
    "review_transition: accepted -> rejected",
    "record_outcome: rejected; provenance retained",
    "graph_outcome: accepted semantic edge retired; baseline edge provenance retained",
    "replacement_policy: no replacement targets",
    `evidence_path: ${artifactPath}`,
    `evidence_sha256: ${digest}`,
    "validation_relation_ledgers: pass",
    "validation_semantic_defects: 0 accepted_relation_denial",
    "validation_replay: pass",
    "",
    "reviewed_relation_ids:",
    ...entries.map((value) => `- ${value.relation_id}`),
    "",
    "decisions:",
    ...entries.map((value) =>
      `- ${value.relation_id} | endpoints: ${value.claim_a} -> ${value.claim_b} | rule: ${value.denial_rule} | outcome: rejected | reason: ${value.rationale}`
    ),
    "",
    "evidence_artifacts:",
    `- artifact: \`${artifactPath}\`; sha256: \`${digest}\``,
    "",
  ].join("\n");
  write(ONTOLOGY_AUDIT_RELATION_FICTION_REVIEW_RECEIPT, receipt);
  return artifactPath;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "plato-relation-fiction-evidence-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("relation-fiction final-adjustment evidence", () => {
  test("retains a retired relation edge only through its immutable baseline pointer", () => {
    const legacyFinalWithoutRequiredStatus = JSON.parse(JSON.stringify({
      path: "wiki/relations/fixture.md",
      ordinal: 0,
      canonical_sha256: "a".repeat(64),
    })) as NonNullable<OntologyAuditGraphUnit["final"]>;
    const baseline: OntologyAuditGraphUnit = {
      key: "edge:relation:rel_fixture_0001",
      kind: "edge",
      edge_kind: "relation",
      owner_key: "record:relation:rel_fixture_0001",
      from_key: "record:claim:claim_fixture_0001",
      to_key: "record:claim:claim_fixture_0002",
      external_target: null,
      ordinal: 0,
      baseline: {
        path: "wiki/relations/fixture.md",
        ordinal: 0,
        raw_sha256: "a".repeat(64),
        review_status: "accepted",
      },
      final: legacyFinalWithoutRequiredStatus,
      change: "unchanged",
      audit_state: "complete",
    };
    const removed = mergeOntologyAuditPartition([baseline], []);
    expect(removed[0]!.final).toBeNull();
    expect(removed[0]!.baseline).toEqual(baseline.baseline);
    expect(removed[0]!.change).toBe("removed");
    expect(mergeOntologyAuditPartition([], [])).toEqual([]);
  });

  test("replays exactly three accepted denials into rejected records", () => {
    materializeEvidence();
    const result = readOntologyAuditRelationFictionReviewEvidence({ repoRoot: root, packagePath: join(root, PACKAGE) });
    expect([...result!.entries.keys()]).toEqual(fixtures.map((fixture) => `record:relation:${fixture.relationId}`));
    expect(result!.entries.get("record:relation:rel_timaeus_0050")?.graph_disposition)
      .toBe("retire_accepted_semantic_edge_preserve_baseline_provenance");
  });

  test("keeps replay evidence readable after live audit partitions are rebound", () => {
    materializeEvidence();
    write(`${PACKAGE}/record-units.jsonl`, "");
    write(`${PACKAGE}/adjudications.jsonl`, "");
    const result = readOntologyAuditRelationFictionReviewEvidence({ repoRoot: root, packagePath: join(root, PACKAGE) });
    expect(result?.entries.size).toBe(3);
  });

  test("binds each final-adjustment pointer and superseded adjudication to preserved prior state", () => {
    materializeEvidence();
    const packagePath = join(root, PACKAGE);
    const result = readOntologyAuditRelationFictionReviewEvidence({ repoRoot: root, packagePath })!;
    const edgePrior = (value: OntologyAuditRelationFictionReviewEntry) => ({
      path: value.ledger_path,
      ordinal: 0,
      canonical_sha256: "b".repeat(64),
    });
    const decisions: OntologyAuditFinalAdjustment[] = [...result.entries.values()].flatMap((value) => {
      const edgePriorSha256 = ontologyAuditFinalPointerSha256(edgePrior(value));
      return [{
        target_key: value.target_key,
        action: "reject" as const,
        prior_final_pointer_sha256: value.prior_final_pointer_sha256,
        expected_final_pointer_sha256: value.expected_final_pointer_sha256,
        superseded_adjudication_sha256: value.superseded_adjudication_sha256,
        rationale: value.rationale,
        receipt_path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
        provenance_chain: [{
          kind: "relation_semantic_fiction" as const,
          action: "reject" as const,
          prior_final_pointer_sha256: value.prior_final_pointer_sha256,
          expected_final_pointer_sha256: value.expected_final_pointer_sha256,
          source_receipt_path: result.receiptPath,
          evidence_artifacts: [result.artifact],
        }],
      }, {
        target_key: `edge:relation:${value.relation_id}`,
        action: "retire" as const,
        prior_final_pointer_sha256: edgePriorSha256,
        expected_final_pointer_sha256: null,
        superseded_adjudication_sha256: ontologyAuditAdjudicationSha256(
          fixtureEdgeAdjudication(value.relation_id),
        ),
        rationale: ontologyAuditRelationFictionEdgeRationale(value),
        receipt_path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
        provenance_chain: [{
          kind: "relation_semantic_fiction" as const,
          action: "retire" as const,
          prior_final_pointer_sha256: edgePriorSha256,
          expected_final_pointer_sha256: null,
          source_receipt_path: result.receiptPath,
          evidence_artifacts: [result.artifact],
        }],
      }];
    });
    const priorState: OntologyAuditFinalAdjustmentPriorState = {
      schema_version: 1,
      acceptance: { path: `${PACKAGE}/acceptance.json`, sha256: "a".repeat(64), text: "fixture" },
      partitions: [],
      targets: [...result.entries.values()].flatMap((value) => [{
        target_key: value.target_key,
        prior_final: {
          path: value.ledger_path,
          ordinal: value.ordinal,
          canonical_sha256: value.prior_full_match_sha256,
        },
        superseded_adjudication: fixtureAdjudication(value.relation_id),
      }, {
        target_key: `edge:relation:${value.relation_id}`,
        prior_final: edgePrior(value),
        superseded_adjudication: fixtureEdgeAdjudication(value.relation_id),
      }]),
    };
    expect(() => verifyOntologyAuditRelationFictionFinalAdjustments(root, packagePath, decisions, priorState))
      .not.toThrow();
    const missingEdgeRetirement = decisions.filter((decision) =>
      decision.target_key !== "edge:relation:rel_cross-dialogue_0638"
    );
    expect(() => verifyOntologyAuditRelationFictionFinalAdjustments(
      root,
      packagePath,
      missingEdgeRetirement,
      priorState,
    )).toThrow("Relation-fiction review evidence target set differs from final-adjustment decisions");
    const drifted = decisions.map((decision, index) => index === 0
      ? { ...decision, expected_final_pointer_sha256: "f".repeat(64) }
      : decision);
    expect(() => verifyOntologyAuditRelationFictionFinalAdjustments(root, packagePath, drifted, priorState))
      .toThrow("final adjustment does not bind the exact accepted-to-rejected relation record");
  });

  test("rejects a content-addressed artifact whose declared detector rule does not replay", () => {
    materializeEvidence({ timaeusRule: "declared_kind_denial" });
    expect(() => readOntologyAuditRelationFictionReviewEvidence({ repoRoot: root, packagePath: join(root, PACKAGE) }))
      .toThrow("typed semantic-denial replay differs from the recorded rule");
  });

  test("rejects canonical-ledger drift after the reviewed final hash", () => {
    materializeEvidence();
    const path = join(root, fixtures[0].ledgerPath);
    writeFileSync(path, readFileSync(path, "utf8").replace("different questions", "unrelated questions"), "utf8");
    expect(() => readOntologyAuditRelationFictionReviewEvidence({ repoRoot: root, packagePath: join(root, PACKAGE) }))
      .toThrow("current rejected relation identity or exact bytes differ from reviewed evidence");
  });

  test("uses strict fenced YAML replay rather than regex-only status evidence", () => {
    const artifactPath = materializeEvidence();
    const ledgerPath = join(root, fixtures[1].ledgerPath);
    writeFileSync(ledgerPath, readFileSync(ledgerPath, "utf8").replace(
      "review_status: rejected",
      "review_status: rejected\nreview_status: rejected",
    ), "utf8");
    expect(fencedYamlRecordBlocks).toBeFunction();
    expect(() => readOntologyAuditRelationFictionReviewEvidence({ repoRoot: root, packagePath: join(root, PACKAGE) }))
      .toThrow();
    expect(artifactPath).toContain("sha256-");
  });
});

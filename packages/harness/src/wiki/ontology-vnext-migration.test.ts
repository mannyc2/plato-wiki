import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  parseOntologyVNext,
  renderOntologyVNextDocuments,
} from "./ontology-vnext.js";
import {
  buildOntologyVNextFromConceptAudit,
  readOntologyConceptAudit,
  type OntologyConceptAudit,
} from "./ontology-concept-audit.js";
import { ontologyVNextDimensionForAxis, planOntologyVNextMigration } from "./ontology-vnext-migration.js";

const roots: string[] = [];

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function observation({
  id,
  status,
  featureId,
  family,
  label,
  terms,
}: {
  id: string;
  status: string;
  featureId: string;
  family: string;
  label: string;
  terms: string[];
}) {
  return [
    "```yaml",
    `observation_id: ${id}`,
    "source_work: Fixture",
    "stephanus_span: 1a",
    `feature_id: ${featureId}`,
    `feature_family: ${family}`,
    `feature_label: ${label}`,
    `observation: A speaker explicitly performs ${label.replace(/_/gu, " ")}.`,
    `greek_terms: [${terms.join(", ")}]`,
    "textual_basis: The cited source bytes contain the stated act.",
    "limits: The record does not infer a doctrine.",
    `review_status: ${status}`,
    "source_ref:",
    "  source_path: raw/plato/greek/fixture.txt",
    "  stephanus_span: 1a",
    "  start_marker: 1a",
    "  end_marker: 1a",
    "  start_char: 0",
    "  end_char: 9",
    `  text_sha256: ${"a".repeat(64)}`,
    "```",
  ].join("\n");
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalValue(entry)]),
  );
}

function jsonl(rows: readonly unknown[]) {
  return rows.length === 0 ? "" : `${rows.map((row) => JSON.stringify(canonicalValue(row))).join("\n")}\n`;
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function writeGreekFixture(root: string) {
  const content = "{1a}λόγος καὶ πρᾶγμα.\n";
  write(join(root, "raw/plato/greek/fixture.txt"), content);
  return {
    content,
    sourceRef: {
      source_path: "raw/plato/greek/fixture.txt",
      stephanus_span: "1a",
      start_marker: "1a",
      end_marker: "1a",
      start_char: 0,
      end_char: content.length,
      text_sha256: sha256(content),
    },
  };
}

function writeConceptAudit(root: string) {
  const directory = join(root, "concept-audit");
  const axisId = deriveOntologyVNextAxisId("discourse_structure", "definition_ladder");
  const conceptId = deriveOntologyVNextConceptId(axisId, "definition_by_example");
  const axis = {
    schema_version: 1 as const,
    axis_id: axisId,
    axis_key: "definition_ladder",
    dimension: "discourse_structure" as const,
    comparison_question: "How does definition by example organize the cited exchanges across dialogues?",
  };
  const concept = {
    concept_id: conceptId,
    axis_id: axisId,
    concept_key: "definition_by_example",
    definition: "A cited passage in which an example is explicitly used to advance a definition.",
    comparison_question: "Where does definition by example organize an exchange, and what role does it play?",
  };
  const artifacts: Record<string, string> = {
    "axes.jsonl": jsonl([
      {
        target_key: "axis:legacy-family:definition_ladder",
        kind: "axis_decision",
        legacy_family: "definition_ladder",
        decision: "retype",
        rationale: "Retype the overloaded legacy family as one independent discourse-structure comparison axis.",
        vnext: { ...axis, definition: "An independent discourse-structure axis for definition sequences." },
      },
    ]),
    "concepts.jsonl": jsonl([
      {
        target_key: "concept:registry:0000:feature_candidate_001",
        kind: "concept_decision",
        legacy_family: "definition_ladder",
        legacy_label: "definition_by_example",
        decision: "retype",
        rationale: "Retype the legacy concept under the dimension-bound axis with a source-neutral definition.",
        split_targets: [],
        vnext: concept,
      },
    ]),
    "memberships.jsonl": jsonl([
      {
        target_key: "membership:observation:obs_fixture_0001",
        kind: "membership_decision",
        observation_id: "obs_fixture_0001",
        review_status: "accepted",
        decision: "keep",
        rationale: "The accepted cited source span explicitly uses an example to advance the stated definition under definition_ladder::definition_by_example and replaces feature_candidate_001.",
        vnext_axis_id: axisId,
        vnext_concept_id: conceptId,
        vnext_membership_id: deriveOntologyVNextMembershipId("obs_fixture_0001", conceptId),
      },
      {
        target_key: "membership:observation:obs_fixture_0002",
        kind: "membership_decision",
        observation_id: "obs_fixture_0002",
        review_status: "rejected",
        decision: "drop",
        rationale: "The rejected observation is review provenance and cannot produce a reader-visible ontology membership.",
        vnext_axis_id: null,
        vnext_concept_id: null,
        vnext_membership_id: null,
      },
      {
        target_key: "membership:observation:obs_fixture_0003",
        kind: "membership_decision",
        observation_id: "obs_fixture_0003",
        review_status: "accepted",
        decision: "keep",
        rationale: "A second accepted cited source span explicitly uses an example to advance the stated definition.",
        vnext_axis_id: axisId,
        vnext_concept_id: conceptId,
        vnext_membership_id: deriveOntologyVNextMembershipId("obs_fixture_0003", conceptId),
      },
    ]),
    "proposed-concepts.jsonl": "",
  };
  for (const [file, content] of Object.entries(artifacts)) write(join(directory, file), content);
  const receiptArtifacts = Object.fromEntries(
    Object.entries(artifacts).map(([file, content]) => [
      file,
      { sha256: sha256(content), bytes: Buffer.byteLength(content), rows: content.split("\n").filter(Boolean).length },
    ]),
  );
  write(
    join(directory, "receipt.json"),
    JSON.stringify({
      audit_snapshot: `sha256-${"a".repeat(64)}`,
      baseline_commit: "b".repeat(40),
      exact_denominator: { axes: 1, concepts: 1, memberships: 3, proposed_concepts: 0 },
      canonical_vnext_counts: { axes: 1, concepts: 1, memberships: 2 },
      checks: { exact_set_equality: true },
      artifacts: receiptArtifacts,
    }),
  );
  return directory;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("ontology vNext migration", () => {
  test("verifies every content-addressed concept-audit artifact declared by the receipt", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-vnext-extra-artifact-"));
    roots.push(root);
    const directory = writeConceptAudit(root);
    const extra = "{\"state\":\"complete\"}\n";
    write(join(directory, "reviews/pass.jsonl"), extra);
    const receiptPath = join(directory, "receipt.json");
    const receipt = JSON.parse(readFileSync(receiptPath, "utf8")) as {
      artifacts: Record<string, { sha256: string; bytes: number; rows: number }>;
    };
    receipt.artifacts["reviews/pass.jsonl"] = {
      sha256: sha256(extra),
      bytes: Buffer.byteLength(extra),
      rows: 1,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(readOntologyConceptAudit(directory).receipt.artifacts["reviews/pass.jsonl"]).toBeDefined();
    write(join(directory, "reviews/pass.jsonl"), "{\"state\":\"tampered\"}\n");
    expect(() => readOntologyConceptAudit(directory)).toThrow("receipt SHA-256 mismatch");
  });

  test("requires source-omission additions to bind one accepted derived membership", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-vnext-source-omission-"));
    roots.push(root);
    const greek = writeGreekFixture(root);
    const directory = writeConceptAudit(root);
    const axisId = deriveOntologyVNextAxisId("discourse_structure", "definition_ladder");
    const conceptId = deriveOntologyVNextConceptId(axisId, "definition_by_example");
    const membershipId = deriveOntologyVNextMembershipId("obs_fixture_0004", conceptId);
    const membershipPath = join(directory, "memberships.jsonl");
    const rows = readFileSync(membershipPath, "utf8").trimEnd().split("\n").map((line) => JSON.parse(line));
    rows.push({
      target_key: `membership:addition:${membershipId}`,
      kind: "membership_decision",
      observation_id: "obs_fixture_0004",
      review_status: "accepted",
      decision: "add",
      rationale: "Two complete source passes and tracked reconciliation identify this explicit source fact as a missing atomic observation with one direct concept assignment.",
      vnext_axis_id: axisId,
      vnext_concept_id: conceptId,
      vnext_membership_id: membershipId,
      replacement_membership_ids: [],
      reviewed_proposal_membership_ids: [],
    });
    const content = jsonl(rows);
    write(membershipPath, content);
    const receiptPath = join(directory, "receipt.json");
    const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
    const omissionContent = jsonl([{
      adjudication: "Reconciliation accepts one neutral source-bound replacement observation and one direct comparison membership while preserving every superseded proposal as review provenance.",
      defect_class: "source_omission",
      defect_id: "source_omission_fixture_0004",
      observation_id: "obs_fixture_0004",
      concept_id: conceptId,
      dialogue: "fixture",
      greek_terms: ["λόγος"],
      independent_pass_disposition: "The independent complete source pass identified an explicit textual fact that no accepted atomic record preserved after the compound source record was split.",
      missing_fact: "The cited source span explicitly states the fixture fact, but the accepted atomic replacement set contains no observation that records that fact as its own neutral proposition.",
      primary_pass_disposition: "The complete primary source pass marked the compound source record for splitting but did not preserve this explicit fact as an accepted atomic replacement observation.",
      proposed_membership_decision: "add",
      rationale: "The accepted neutral replacement directly answers the ratified comparison question, while inherited child memberships would attach the concept to observations that do not state it.",
      replaced_concept_id: conceptId,
      replaced_parent_observation_id: "obs_fixture_0001",
      replaces_membership_ids: [`membership_sha256_${"a".repeat(64)}`],
      reviewer: "fixture-reconciler",
      source_ref: greek.sourceRef,
    }]);
    const omissionFile = `split-membership-reviews/sha256-${sha256(omissionContent)}-source-omissions.jsonl`;
    write(join(directory, omissionFile), omissionContent);
    receipt.exact_denominator.memberships = 4;
    receipt.artifacts["memberships.jsonl"] = {
      sha256: sha256(content),
      bytes: Buffer.byteLength(content),
      rows: 4,
    };
    receipt.artifacts[omissionFile] = {
      sha256: sha256(omissionContent),
      bytes: Buffer.byteLength(omissionContent),
      rows: 1,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "content-addressed source-omission evidence requires explicit observation and membership denominators",
    );
    receipt.exact_denominator.source_omission_observations = 1;
    receipt.exact_denominator.source_omission_membership_additions = 1;
    write(receiptPath, JSON.stringify(receipt));
    expect(readOntologyConceptAudit(directory, { repoRoot: root }).memberships.at(-1)?.target_key).toBe(
      `membership:addition:${membershipId}`,
    );

    const omissionDescriptor = receipt.artifacts[omissionFile];
    const tamperedHashContent = jsonl([{
      ...JSON.parse(omissionContent),
      source_ref: { ...greek.sourceRef, text_sha256: "0".repeat(64) },
    }]);
    const tamperedHashFile = `split-membership-reviews/sha256-${sha256(tamperedHashContent)}-source-omissions.jsonl`;
    write(join(directory, tamperedHashFile), tamperedHashContent);
    delete receipt.artifacts[omissionFile];
    receipt.artifacts[tamperedHashFile] = {
      sha256: sha256(tamperedHashContent),
      bytes: Buffer.byteLength(tamperedHashContent),
      rows: 1,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory, { repoRoot: root })).toThrow(
      "source_ref hash differs from the canonical Greek bytes",
    );
    delete receipt.artifacts[tamperedHashFile];
    receipt.artifacts[omissionFile] = omissionDescriptor;

    const tamperedTermContent = jsonl([{
      ...JSON.parse(omissionContent),
      greek_terms: ["ἄφαντος"],
    }]);
    const tamperedTermFile = `split-membership-reviews/sha256-${sha256(tamperedTermContent)}-source-omissions.jsonl`;
    write(join(directory, tamperedTermFile), tamperedTermContent);
    delete receipt.artifacts[omissionFile];
    receipt.artifacts[tamperedTermFile] = {
      sha256: sha256(tamperedTermContent),
      bytes: Buffer.byteLength(tamperedTermContent),
      rows: 1,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory, { repoRoot: root })).toThrow(
      "greek_terms must be non-empty strings present in the canonical Greek source interval",
    );
    delete receipt.artifacts[tamperedTermFile];
    receipt.artifacts[omissionFile] = omissionDescriptor;

    delete receipt.artifacts[omissionFile];
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "source-omission additions require one content-addressed source-omission artifact",
    );
    receipt.artifacts[omissionFile] = omissionDescriptor;
    write(receiptPath, JSON.stringify(receipt));

    rows.at(-1)!.target_key = `membership:addition:${"0".repeat(64)}`;
    const invalid = jsonl(rows);
    write(membershipPath, invalid);
    receipt.artifacts["memberships.jsonl"] = {
      sha256: sha256(invalid),
      bytes: Buffer.byteLength(invalid),
      rows: 4,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow("source-omission addition does not bind its membership id");
  });

  test("requires every all-dropped parent assignment to bind a replacement or explicit zero result", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-vnext-zero-result-"));
    roots.push(root);
    const greek = writeGreekFixture(root);
    const directory = writeConceptAudit(root);
    const receiptPath = join(directory, "receipt.json");
    const membershipPath = join(directory, "memberships.jsonl");
    const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
    const rows = readFileSync(membershipPath, "utf8").trimEnd().split("\n").map((line) => JSON.parse(line));
    const parent = rows[0]!;
    const conceptId = parent.vnext_concept_id as string;
    const childIds = ["obs_fixture_0004", "obs_fixture_0005"];
    const childMembershipIds = childIds.map((observationId) => deriveOntologyVNextMembershipId(observationId, conceptId));
    parent.decision = "drop";
    parent.rationale = "Complete source-first review drops every proposed child assignment because none states the comparison fact; the source facts remain accepted atomic observations pending explicit omission reconciliation.";
    parent.replacement_membership_ids = [];
    parent.reviewed_proposal_membership_ids = [...childMembershipIds].sort();
    rows.push(...childIds.map((observationId, index) => ({
      target_key: `membership:vnext:${childMembershipIds[index]}`,
      kind: "membership_decision",
      observation_id: observationId,
      review_status: "accepted",
      decision: "drop",
      rationale: "The exact reviewed source proposition does not state the target comparison fact, so this inherited child assignment terminates as a drop.",
      vnext_axis_id: parent.vnext_axis_id,
      vnext_concept_id: conceptId,
      vnext_membership_id: childMembershipIds[index],
      replacement_membership_ids: [],
      reviewed_proposal_membership_ids: [],
    })));
    const membershipContent = jsonl(rows);
    write(membershipPath, membershipContent);
    receipt.exact_denominator.memberships = rows.length;
    receipt.artifacts["memberships.jsonl"] = {
      sha256: sha256(membershipContent),
      bytes: Buffer.byteLength(membershipContent),
      rows: rows.length,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "all-dropped parent assignments require checks.all_dropped_parent_assignments_resolved",
    );
    expect(() => readOntologyConceptAudit(directory, {
      allowIncompleteAllDroppedResolution: true,
    })).not.toThrow();
    receipt.exact_denominator.frozen_memberships = 3;
    receipt.exact_denominator.split_child_membership_proposals = 2;
    receipt.checks.all_dropped_parent_assignments_resolved = 1;
    receipt.checks.split_child_memberships_reviewed = 2;
    receipt.checks.split_child_memberships_added = 0;
    receipt.checks.split_child_memberships_dropped = 2;
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "every all-dropped parent assignment requires exactly one source-omission replacement or explicit zero result",
    );

    const zeroResultContent = jsonl([{
      adjudication: "no_replacement_required",
      concept_id: conceptId,
      defect_class: "source_omission_zero_result",
      defect_id: "source_omission_zero_result_fixture_0001",
      dialogue: "fixture",
      independent_pass_disposition: "The independent complete source pass confirms that both accepted child observations preserve their propositions while neither answers the target comparison question.",
      preserved_observation_ids: [...childIds].sort(),
      primary_pass_disposition: "The complete primary pass preserved both atomic propositions but inherited the parent concept assignment across children that do not independently state the comparison fact.",
      rationale: "Parent-level reconciliation records an explicit zero result: the accepted children preserve every source proposition, none states the target fact, and therefore no replacement observation or membership is warranted.",
      replaced_parent_observation_id: "obs_fixture_0001",
      reviewed_membership_ids: [...childMembershipIds].sort(),
      reviewer: "fixture-reconciler",
      source_refs: [greek.sourceRef],
    }]);
    const zeroResultFile = `split-membership-reviews/sha256-${sha256(zeroResultContent)}-source-omission-zero-results.jsonl`;
    write(join(directory, zeroResultFile), zeroResultContent);
    receipt.artifacts[zeroResultFile] = {
      sha256: sha256(zeroResultContent),
      bytes: Buffer.byteLength(zeroResultContent),
      rows: 1,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "content-addressed source-omission zero results require an explicit denominator",
    );
    receipt.exact_denominator.source_omission_zero_results = 1;
    write(receiptPath, JSON.stringify(receipt));
    expect(readOntologyConceptAudit(directory, { repoRoot: root }).receipt.exact_denominator.source_omission_zero_results).toBe(1);

    const zeroResultDescriptor = receipt.artifacts[zeroResultFile];
    const tamperedRangeContent = jsonl([{
      ...JSON.parse(zeroResultContent),
      source_refs: [{ ...greek.sourceRef, start_char: 1 }],
    }]);
    const tamperedRangeFile = `split-membership-reviews/sha256-${sha256(tamperedRangeContent)}-source-omission-zero-results.jsonl`;
    write(join(directory, tamperedRangeFile), tamperedRangeContent);
    delete receipt.artifacts[zeroResultFile];
    receipt.artifacts[tamperedRangeFile] = {
      sha256: sha256(tamperedRangeContent),
      bytes: Buffer.byteLength(tamperedRangeContent),
      rows: 1,
    };
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory, { repoRoot: root })).toThrow(
      "source_ref range is not the canonical Stephanus interval",
    );
    delete receipt.artifacts[tamperedRangeFile];
    receipt.artifacts[zeroResultFile] = zeroResultDescriptor;

    delete receipt.checks.split_child_memberships_added;
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "terminal split-child decisions require explicit count fields: checks.split_child_memberships_added",
    );
    receipt.checks.split_child_memberships_added = 0;

    receipt.exact_denominator.split_child_membership_proposals = 1;
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "exact_denominator.split_child_membership_proposals differs from the explicit concept-audit rows",
    );
    receipt.exact_denominator.split_child_membership_proposals = 2;
    receipt.checks.split_child_memberships_dropped = 1;
    write(receiptPath, JSON.stringify(receipt));
    expect(() => readOntologyConceptAudit(directory)).toThrow(
      "checks.split_child_memberships_dropped differs from the explicit concept-audit rows",
    );
  });

  test("requires explicit review of every split-child membership proposal", () => {
    const axisId = deriveOntologyVNextAxisId("subject_matter", "fixture_axis");
    const conceptId = deriveOntologyVNextConceptId(axisId, "fixture_fact");
    const childKeepId = deriveOntologyVNextMembershipId("obs_fixture_0002", conceptId);
    const childDropId = deriveOntologyVNextMembershipId("obs_fixture_0003", conceptId);
    const sourceOmissionAdditionId = deriveOntologyVNextMembershipId("obs_fixture_0004", conceptId);
    const membership = (
      observationId: string,
      decision: "keep" | "add" | "drop",
      membershipId: string,
      targetKey = `membership:vnext:${membershipId}`,
    ) => ({
      target_key: targetKey,
      kind: "membership_decision" as const,
      observation_id: observationId,
      review_status: "accepted" as const,
      decision,
      rationale: decision !== "drop"
        ? "The exact Greek source span explicitly states the proposed fixture fact."
        : "The exact Greek source span does not state the proposed fixture fact, so the inherited assignment is dropped.",
      vnext_axis_id: axisId,
      vnext_concept_id: conceptId,
      vnext_membership_id: membershipId,
    });
    const audit = {
      axes: [{
        target_key: "axis:legacy-family:fixture_axis",
        kind: "axis_decision",
        legacy_family: "fixture_axis",
        decision: "retype",
        rationale: "Retype the fixture axis into one independent comparison dimension.",
        vnext: {
          axis_id: axisId,
          axis_key: "fixture_axis",
          dimension: "subject_matter",
          comparison_question: "What does each source explicitly state about the fixture fact?",
          definition: "An independent fixture comparison axis.",
        },
      }],
      concepts: [{
        target_key: "concept:registry:0000:fixture",
        kind: "concept_decision",
        legacy_family: "fixture_axis",
        legacy_label: "fixture_fact",
        decision: "ratify",
        rationale: "Ratify the source-bound fixture fact under the independent comparison axis.",
        split_targets: [],
        vnext: {
          concept_id: conceptId,
          axis_id: axisId,
          concept_key: "fixture_fact",
          definition: "A source-bound fixture fact.",
          comparison_question: "Where does the source explicitly state the fixture fact?",
        },
      }],
      memberships: [
        {
          ...membership(
            "obs_fixture_0001",
            "keep",
            deriveOntologyVNextMembershipId("obs_fixture_0001", conceptId),
            "membership:observation:obs_fixture_0001",
          ),
          decision: "split",
          replacement_membership_ids: [childKeepId],
          reviewed_proposal_membership_ids: [childDropId, childKeepId].sort(),
        },
        membership("obs_fixture_0002", "add", childKeepId),
        membership("obs_fixture_0003", "drop", childDropId),
        membership(
          "obs_fixture_0004",
          "add",
          sourceOmissionAdditionId,
          `membership:addition:${sourceOmissionAdditionId}`,
        ),
      ],
      proposals: [],
      receipt: {
        audit_snapshot: `sha256-${"a".repeat(64)}`,
        baseline_commit: "b".repeat(40),
        exact_denominator: { axes: 1, concepts: 1, memberships: 4, proposed_concepts: 0 },
        canonical_vnext_counts: { axes: 1, concepts: 1, memberships: 2 },
        checks: {},
        artifacts: {},
      },
    } as OntologyConceptAudit;
    const statuses = new Map([
      ["obs_fixture_0001", "rejected"],
      ["obs_fixture_0002", "accepted"],
      ["obs_fixture_0003", "accepted"],
      ["obs_fixture_0004", "accepted"],
    ] as const);
    const splitMembershipProposalObservationIds = new Map([
      ["obs_fixture_0001", ["obs_fixture_0002", "obs_fixture_0003"]],
    ]);

    const built = buildOntologyVNextFromConceptAudit({
      audit,
      observationReviewStatuses: statuses,
      splitMembershipProposalObservationIds,
    });
    expect(built.memberships[0]!.assignment_basis).not.toContain("definition_ladder::definition_by_example");
    expect(built.memberships[0]!.assignment_basis).not.toContain("feature_candidate_");
    expect(built.memberships).toEqual(expect.arrayContaining([
      expect.objectContaining({
        membership_id: childKeepId,
        observation_id: "obs_fixture_0002",
        concept_id: conceptId,
      }),
      expect.objectContaining({
        membership_id: sourceOmissionAdditionId,
        observation_id: "obs_fixture_0004",
        concept_id: conceptId,
      }),
    ]));
    expect(built.memberships).toHaveLength(2);

    expect(() => buildOntologyVNextFromConceptAudit({
      audit: {
        ...audit,
        memberships: audit.memberships.filter((row) => row.target_key !== `membership:vnext:${childDropId}`),
      },
      observationReviewStatuses: statuses,
      splitMembershipProposalObservationIds,
    })).toThrow("explicit split-child decisions do not exactly equal the 2-item proposal denominator");
  });

  test("hard-cuts overloaded identities and drops rejected reader memberships", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-vnext-migration-"));
    roots.push(root);
    write(join(root, "raw/plato/greek/fixture.txt"), "λόγοςabc");
    write(
      join(root, "wiki/observations/fixture.md"),
      [
        "# Fixture observations",
        "",
        observation({
          id: "obs_fixture_0001",
          status: "accepted",
          featureId: "feature_candidate_001",
          family: "definition_ladder",
          label: "definition_by_example",
          terms: ["λόγος", "absent"],
        }),
        "",
        observation({
          id: "obs_fixture_0002",
          status: "rejected",
          featureId: "feature_candidate_999",
          family: "irony_marker",
          label: "interpretive_irony",
          terms: [],
        }),
        "",
        observation({
          id: "obs_fixture_0003",
          status: "accepted",
          featureId: "feature_candidate_001",
          family: "definition_ladder",
          label: "definition_by_example",
          terms: ["λόγος"],
        }),
        "",
      ].join("\n"),
    );
    write(
      join(root, "wiki/commentary/fixture.md"),
      [
        "```yaml",
        "commentary_id: comm_fixture_0001",
        "block_kind: argument",
        "review_status: accepted",
        "cites:",
        "  observations: []",
        "  claims: []",
        "  relations: []",
        "  dossiers: [definition_ladder/definition_by_example]",
        "```",
        "",
        "```yaml",
        "commentary_id: comm_fixture_0002",
        "block_kind: question",
        "review_status: accepted",
        "cites:",
        "  observations: []",
        "  claims: []",
        "  relations: []",
        "  dossiers: [retired_family/retired_concept]",
        "```",
        "",
      ].join("\n"),
    );

    const plan = planOntologyVNextMigration({ repoRoot: root, conceptAuditDirectory: writeConceptAudit(root) });
    expect(plan.counts).toMatchObject({
      observations: 3,
      acceptedObservations: 2,
      rejectedOrPendingObservations: 1,
      activeAxes: 1,
      activeConcepts: 1,
      activeMemberships: 2,
      removedGreekTerms: 1,
      dossierReferencesMigrated: 0,
      dossierReferencesDropped: 1,
      commentaryRejectedAfterDossierMigration: 1,
    });
    expect(plan.rewrittenLedgers[0]?.content).not.toContain("feature_");
    expect(plan.rewrittenLedgers[0]?.content).toContain("greek_terms:\n  - λόγος");
    expect(plan.rewrittenLedgers[0]?.content).not.toContain("absent");

    const model = parseOntologyVNext(renderOntologyVNextDocuments(plan), {
      observationReviewStatuses: plan.observationStatuses,
    });
    expect(model.memberships.map((membership) => membership.observation_id)).toEqual([
      "obs_fixture_0001",
      "obs_fixture_0003",
    ]);
    expect(model.concepts[0]?.schema_version).toBe(1);
    expect(model.axes[0]?.dimension).toBe("discourse_structure");
    const commentary = plan.rewrittenCommentaryLedgers[0]?.content ?? "";
    expect(commentary).toContain("dossiers:\n    - definition_ladder/definition_by_example");
    expect(commentary).not.toContain("retired_family/retired_concept");
    expect(commentary.match(/review_status: rejected/gu)?.length).toBe(1);
  });

  test("separates lexical, dramatic, presentation, discourse, function, and subject axes", () => {
    expect(ontologyVNextDimensionForAxis("etymological_method")).toBe("lexical_form");
    expect(ontologyVNextDimensionForAxis("speaker_role")).toBe("dramatic_context");
    expect(ontologyVNextDimensionForAxis("myth_demarcation")).toBe("presentation_form");
    expect(ontologyVNextDimensionForAxis("argument_structure")).toBe("discourse_structure");
    expect(ontologyVNextDimensionForAxis("authority_appeal")).toBe("textual_function");
    expect(ontologyVNextDimensionForAxis("civic_education")).toBe("subject_matter");
  });
});

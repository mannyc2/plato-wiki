import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ONTOLOGY_VNEXT_FILES,
  OntologyVNextValidationError,
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  parseOntologyVNext,
  readOntologyVNextDirectory,
  renderOntologyVNextDocuments,
  validateOntologyVNext,
  type ObservationReviewStatus,
  type OntologyVNextAxis,
  type OntologyVNextConcept,
  type OntologyVNextDocuments,
  type OntologyVNextIssue,
  type OntologyVNextMembership,
} from "./ontology-vnext.js";

const definitionAxisId = deriveOntologyVNextAxisId("textual_function", "definition_response_form");
const exampleConceptId = deriveOntologyVNextConceptId(definitionAxisId, "definition_by_example");
const formulaConceptId = deriveOntologyVNextConceptId(definitionAxisId, "definition_by_general_formula");

function axis(overrides: Partial<OntologyVNextAxis> = {}): OntologyVNextAxis {
  return {
    schema_version: 1,
    axis_id: definitionAxisId,
    axis_key: "definition_response_form",
    dimension: "textual_function",
    comparison_question: "What form does a proposed definition take in each dialogue?",
    ...overrides,
  };
}

function concept(
  conceptKey = "definition_by_example",
  conceptId = exampleConceptId,
  overrides: Partial<OntologyVNextConcept> = {},
): OntologyVNextConcept {
  return {
    schema_version: 1,
    concept_id: conceptId,
    axis_id: definitionAxisId,
    concept_key: conceptKey,
    definition: "The speaker supplies one or more instances in place of a general account.",
    comparison_question: "Where does a speaker answer a definition request by giving instances?",
    ...overrides,
  };
}

function membership(
  observationId: string,
  conceptId = exampleConceptId,
  overrides: Partial<OntologyVNextMembership> = {},
): OntologyVNextMembership {
  return {
    schema_version: 1,
    membership_id: deriveOntologyVNextMembershipId(observationId, conceptId),
    observation_id: observationId,
    concept_id: conceptId,
    assignment_basis: "The accepted observation records the speaker supplying instances as the answer.",
    ...overrides,
  };
}

function accepted(...observationIds: string[]) {
  return new Map<string, ObservationReviewStatus>(observationIds.map((observationId) => [observationId, "accepted"]));
}

function documents(
  axes: OntologyVNextAxis[],
  concepts: OntologyVNextConcept[],
  memberships: OntologyVNextMembership[],
) {
  return renderOntologyVNextDocuments({ axes, concepts, memberships });
}

function issueCodes(issues: readonly OntologyVNextIssue[]) {
  return issues.map((issue) => issue.code);
}

function replaceRow(document: string, transform: (row: Record<string, unknown>) => Record<string, unknown>) {
  const row = transform(JSON.parse(document.trim()) as Record<string, unknown>);
  const sorted = Object.fromEntries(Object.entries(row).sort(([left], [right]) => left.localeCompare(right)));
  return `${JSON.stringify(sorted)}\n`;
}

describe("ontology vNext semantic identities", () => {
  it("derives stable ids only from semantic identity fields", () => {
    expect(deriveOntologyVNextAxisId("textual_function", "definition_response_form")).toBe(definitionAxisId);
    expect(deriveOntologyVNextAxisId("subject_matter", "definition_response_form")).not.toBe(definitionAxisId);
    expect(deriveOntologyVNextConceptId(definitionAxisId, "definition_by_example")).toBe(exampleConceptId);
    expect(deriveOntologyVNextConceptId(definitionAxisId, "definition_by_general_formula")).not.toBe(exampleConceptId);
    expect(deriveOntologyVNextMembershipId("obs_euthyphro_0001", exampleConceptId)).toBe(
      deriveOntologyVNextMembershipId("obs_euthyphro_0001", exampleConceptId),
    );
  });

  it("rejects ids not derived from the declared identities", () => {
    const badAxis = axis({ axis_key: "different_axis" });
    const badConcept = concept("definition_by_example", exampleConceptId, { concept_key: "different_concept" });
    const badMembership = membership("obs_euthyphro_0001", exampleConceptId, {
      observation_id: "obs_meno_0001",
    });
    const issues = validateOntologyVNext(
      documents([badAxis], [badConcept], [badMembership]),
      { observationReviewStatuses: accepted("obs_meno_0001") },
    );

    expect(issueCodes(issues)).toContain("invalid_axis_id");
    expect(issueCodes(issues)).toContain("invalid_concept_id");
    expect(issueCodes(issues)).toContain("invalid_membership_id");
  });
});

describe("ontology vNext canonical JSONL", () => {
  it("round-trips axes, concepts, and many-to-many memberships through the strict reader", () => {
    const rows = documents(
      [axis()],
      [
        concept(),
        concept("definition_by_general_formula", formulaConceptId, {
          definition: "The speaker gives one account intended to cover every instance.",
          comparison_question: "Where does a speaker propose one account meant to cover every instance?",
        }),
      ],
      [
        membership("obs_euthyphro_0001"),
        membership("obs_meno_0001"),
        membership("obs_meno_0001", formulaConceptId, {
          assignment_basis: "The accepted observation also records a formula offered for all instances.",
        }),
      ],
    );
    const model = parseOntologyVNext(rows, {
      observationReviewStatuses: accepted("obs_euthyphro_0001", "obs_meno_0001"),
    });

    expect(model.axes).toHaveLength(1);
    expect(model.concepts).toHaveLength(2);
    expect(model.memberships).toHaveLength(3);
    expect(model.membershipsForObservation("obs_meno_0001")).toHaveLength(2);
    expect(model.conceptsForObservation("obs_meno_0001").map((entry) => entry.concept_id).sort()).toEqual(
      [exampleConceptId, formulaConceptId].sort(),
    );
    expect(renderOntologyVNextDocuments(model)).toEqual(rows);
  });

  it("rejects non-canonical whitespace, unknown fields, and explicit legacy aliases", () => {
    const valid = documents([axis()], [], []);
    const whitespace: OntologyVNextDocuments = { ...valid, axes: valid.axes.replace("{", "{ ") };
    expect(issueCodes(validateOntologyVNext(whitespace, { observationReviewStatuses: accepted() }))).toContain(
      "non_canonical_json",
    );

    const legacy: OntologyVNextDocuments = {
      ...valid,
      axes: replaceRow(valid.axes, (row) => ({ ...row, feature_id: "feature_candidate_001" })),
    };
    const legacyIssues = validateOntologyVNext(legacy, { observationReviewStatuses: accepted() });
    expect(issueCodes(legacyIssues)).toContain("legacy_alias");
    expect(issueCodes(legacyIssues)).toContain("schema");
  });

  it("requires sorted rows, LF-only lines, and one terminal newline", () => {
    const first = axis();
    const secondAxisKey = "speaker_turn_shape";
    const second = axis({
      axis_id: deriveOntologyVNextAxisId("discourse_structure", secondAxisKey),
      axis_key: secondAxisKey,
      dimension: "discourse_structure",
      comparison_question: "How are speaker turns arranged in the cited exchange?",
    });
    const canonical = documents([first, second], [], []);
    const reversed = `${canonical.axes.trim().split("\n").reverse().join("\n")}\n`;
    expect(issueCodes(validateOntologyVNext({ ...canonical, axes: reversed }, { observationReviewStatuses: accepted() })))
      .toContain("non_canonical_jsonl");
    expect(issueCodes(validateOntologyVNext({ ...canonical, axes: canonical.axes.trimEnd() }, { observationReviewStatuses: accepted() })))
      .toContain("non_canonical_jsonl");
  });
});

describe("ontology vNext graph invariants", () => {
  it("rejects duplicate ids, concept identities, and observation-concept pairs", () => {
    const oneConcept = concept();
    const oneMembership = membership("obs_euthyphro_0001");
    const issues = validateOntologyVNext(
      documents([axis(), axis()], [oneConcept, oneConcept], [oneMembership, oneMembership]),
      { observationReviewStatuses: accepted("obs_euthyphro_0001") },
    );

    expect(issueCodes(issues)).toContain("duplicate_axis_id");
    expect(issueCodes(issues)).toContain("duplicate_axis_key");
    expect(issueCodes(issues)).toContain("duplicate_concept_id");
    expect(issueCodes(issues)).toContain("duplicate_concept_identity");
    expect(issueCodes(issues)).toContain("duplicate_membership_id");
    expect(issueCodes(issues)).toContain("duplicate_membership_pair");
  });

  it("rejects missing axis, concept, and observation references", () => {
    const unknownAxisId = deriveOntologyVNextAxisId("subject_matter", "unknown_axis");
    const orphanConcept = concept("definition_by_example", deriveOntologyVNextConceptId(unknownAxisId, "definition_by_example"), {
      axis_id: unknownAxisId,
    });
    const unknownConceptId = deriveOntologyVNextConceptId(definitionAxisId, "unknown_concept");
    const orphanMembership = membership("obs_missing_0001", unknownConceptId);
    const issues = validateOntologyVNext(
      documents([axis()], [orphanConcept], [orphanMembership]),
      { observationReviewStatuses: accepted() },
    );

    expect(issueCodes(issues)).toContain("missing_axis_ref");
    expect(issueCodes(issues)).toContain("missing_concept_ref");
    expect(issueCodes(issues)).toContain("missing_observation_ref");
  });

  it("requires precise questions, definitions, and membership bases", () => {
    const issues = validateOntologyVNext(
      documents(
        [axis({ comparison_question: "   " })],
        [concept("definition_by_example", exampleConceptId, { definition: "", comparison_question: "Not a question" })],
        [membership("obs_euthyphro_0001", exampleConceptId, { assignment_basis: " " })],
      ),
      { observationReviewStatuses: accepted("obs_euthyphro_0001") },
    );

    expect(issueCodes(issues)).toContain("empty_question");
    expect(issueCodes(issues)).toContain("empty_definition");
    expect(issueCodes(issues)).toContain("empty_assignment_basis");
  });

  it("forbids legacy feature identities even when their shape is otherwise valid", () => {
    const legacyAxisKey = "feature_candidate_001";
    const legacyConceptKey = "feature_candidate_002";
    const legacyAxisId = deriveOntologyVNextAxisId("textual_function", legacyAxisKey);
    const legacyConceptId = deriveOntologyVNextConceptId(legacyAxisId, legacyConceptKey);
    const issues = validateOntologyVNext(
      documents(
        [axis({ axis_id: legacyAxisId, axis_key: legacyAxisKey })],
        [concept(legacyConceptKey, legacyConceptId, { axis_id: legacyAxisId })],
        [],
      ),
      { observationReviewStatuses: accepted() },
    );

    expect(issueCodes(issues).filter((code) => code === "legacy_alias")).toHaveLength(2);
  });

  it("forbids retired feature identities inside membership assignment prose", () => {
    const documents = renderOntologyVNextDocuments({
      axes: [axis()],
      concepts: [concept()],
      memberships: [
        membership("obs_euthyphro_0001", exampleConceptId, {
          assignment_basis: "The frozen definition_ladder::definition_by_example assignment came from feature_candidate_001.",
        }),
      ],
    });
    expect(issueCodes(validateOntologyVNext(documents, {
      observationReviewStatuses: accepted("obs_euthyphro_0001"),
    }))).toContain("legacy_alias");
  });
});

describe("ontology vNext reader acceptance boundary", () => {
  it("fails closed before a rejected observation can reach reader output", () => {
    const rows = documents([axis()], [concept()], [membership("obs_euthyphro_0001")]);
    const issues = validateOntologyVNext(rows, {
      observationReviewStatuses: new Map([["obs_euthyphro_0001", "rejected"]]),
    });

    expect(issueCodes(issues)).toContain("observation_not_accepted");
    expect(() =>
      parseOntologyVNext(rows, {
        observationReviewStatuses: new Map([["obs_euthyphro_0001", "rejected"]]),
      }),
    ).toThrow(OntologyVNextValidationError);
  });

  it("reads the three canonical files and exposes only validated memberships", () => {
    const directory = mkdtempSync(join(tmpdir(), "ontology-vnext-"));
    try {
      mkdirSync(directory, { recursive: true });
      const rows = documents([axis()], [concept()], [membership("obs_euthyphro_0001")]);
      writeFileSync(join(directory, ONTOLOGY_VNEXT_FILES.axes), rows.axes);
      writeFileSync(join(directory, ONTOLOGY_VNEXT_FILES.concepts), rows.concepts);
      writeFileSync(join(directory, ONTOLOGY_VNEXT_FILES.memberships), rows.memberships);

      const model = readOntologyVNextDirectory(directory, {
        observationReviewStatuses: accepted("obs_euthyphro_0001"),
      });
      expect(model.membershipsForObservation("obs_euthyphro_0001")[0]?.concept_id).toBe(exampleConceptId);
      expect(model.membershipsForObservation("obs_rejected_0001")).toEqual([]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

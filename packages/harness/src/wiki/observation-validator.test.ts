import { describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveSourceSpan } from "../source.js";
import {
  formatObservationLedgerValidationError,
  readSourceCached,
  validateObservationLedger,
  type ObservationLedgerValidationIssue,
} from "./observation-validator.js";

function sourceRefYaml(span: string) {
  const { source_ref } = resolveSourceSpan("euthyphro", span);

  return [
    "source_ref:",
    `  source_path: ${source_ref.source_path}`,
    `  stephanus_span: ${source_ref.stephanus_span}`,
    `  start_marker: ${source_ref.start_marker}`,
    `  end_marker: ${source_ref.end_marker}`,
    `  start_char: ${source_ref.start_char}`,
    `  end_char: ${source_ref.end_char}`,
    `  text_sha256: "${source_ref.text_sha256}"`,
  ].join("\n");
}

function ledger(body: string) {
  return [
    "# Euthyphro - Observation Ledger",
    "",
    "```yaml",
    body.trim(),
    "```",
    "",
  ].join("\n");
}

function issueCodes(issues: ObservationLedgerValidationIssue[]) {
  return issues.map((issue) => issue.code);
}

describe("validateObservationLedger", () => {
  it("accepts records that store source refs and keep Greek in greek_terms", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος, ἰδέα]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a, where Socrates contrasts examples with the requested form.
limits: This records the request, not a successful definition.
review_status: unreviewed
`);

    expect(validateObservationLedger("wiki/observations/euthyphro.md", content)).toEqual([]);
  });

  it("accepts Greek terms formatted as a YAML list", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms:
  - εἶδος
  - ἰδέα
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a, where Socrates contrasts examples with the requested form.
limits: This records the request, not a successful definition.
review_status: unreviewed
`);

    expect(validateObservationLedger("wiki/observations/euthyphro.md", content)).toEqual([]);
  });

  it("rejects copied Greek outside greek_terms and out-of-span citations", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος, ἰδέα]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: At 6d-e Socrates says "οὐ τοῦτό σοι διεκελευόμην", which is outside the selected span.
limits: This records the request, not a successful definition.
review_status: unreviewed
`);

    const issues = validateObservationLedger("wiki/observations/euthyphro.md", content);
    expect(issueCodes(issues)).toContain("greek_outside_terms");
    expect(issues.find((issue) => issue.code === "greek_outside_terms")?.message).toContain(
      "in `textual_basis`",
    );
    expect(issueCodes(issues)).toContain("out_of_span_reference");
  });

  it("rejects incomplete source_ref objects", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
source_ref:
  source_path: raw/plato/greek/euthyphro.txt
  stephanus_span: 5d-6a
  start_char: 0
  end_char: 10
  text_sha256: "not-a-hash"
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: unreviewed
`);

    const issues = validateObservationLedger("wiki/observations/euthyphro.md", content);
    expect(issueCodes(issues)).toContain("missing_field");
    expect(formatObservationLedgerValidationError(issues)).toContain("Copy the complete source_ref object");
  });

  it("rejects unnormalized feature families", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: Definition Ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: unreviewed
`);

    const issues = validateObservationLedger("wiki/observations/euthyphro.md", content);
    expect(issueCodes(issues)).toContain("invalid_feature_family");
  });

  it("accepts reviewed status values", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: accepted
`);

    expect(validateObservationLedger("wiki/observations/euthyphro.md", content)).toEqual([]);
  });

  it("keeps unreviewed valid before a review pass", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: unreviewed
`);

    expect(validateObservationLedger("wiki/observations/euthyphro.md", content)).toEqual([]);
  });

  it("rejects invalid review_status values", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: maybe
`);

    expect(issueCodes(validateObservationLedger("wiki/observations/euthyphro.md", content))).toContain(
      "invalid_review_status",
    );
  });

  it("rejects binary bytes and orphan observation fields outside fenced records", () => {
    const content = `${ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: accepted
`)}\u0000
observation_id: obs_euthyphro_orphan
feature_label: stale_alias
review_status: unreviewed
`;

    const codes = issueCodes(validateObservationLedger("wiki/observations/euthyphro.md", content));
    expect(codes).toContain("nul_byte");
    expect(codes).toContain("observation_count_mismatch");
    expect(codes).toContain("orphan_ledger_field");
  });

  it("rejects duplicate critical fields inside one fenced record", () => {
    const content = ledger(`
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος]
english_gloss: "Socrates asks for one form by which holy things are holy."
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: one_form_request
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The observation is stated within 5d-6a.
limits: This records the request, not a successful definition.
review_status: accepted
feature_label: stale_alias
`);

    expect(issueCodes(validateObservationLedger("wiki/observations/euthyphro.md", content))).toContain(
      "duplicate_field",
    );
  });
});

describe("readSourceCached", () => {
  it("reuses a cached source text value for repeated reads", () => {
    const root = mkdtempSync(join(tmpdir(), "source-cache-"));
    const path = join(root, "fixture.txt");
    const cache = new Map<string, string | undefined>();

    try {
      writeFileSync(path, "first", "utf8");
      expect(readSourceCached(cache, path)).toBe("first");
      writeFileSync(path, "second", "utf8");
      expect(readSourceCached(cache, path)).toBe("first");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

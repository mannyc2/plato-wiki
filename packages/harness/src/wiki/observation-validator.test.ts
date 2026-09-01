import { describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveSourceSpan } from "../source.js";
import {
  formatObservationLedgerValidationError,
  readSourceCached,
  validateObservationLedger,
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

function record(extra = "", status = "unreviewed") {
  return `# Euthyphro - Observation Ledger

\`\`\`yaml
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
greek_terms: [εἶδος, ἰδέα]
english_gloss: Socrates asks for one form.
observation: Socrates asks for a single form rather than a list of examples.
textual_basis: The request and contrast occur within 5d-6a.
limits: This records the request, not a successful definition.
review_status: ${status}
${extra}\`\`\`
`;
}

describe("validateObservationLedger", () => {
  it("accepts an unclassified source-bound record", () => {
    expect(validateObservationLedger("wiki/observations/euthyphro.md", record())).toEqual([]);
    expect(validateObservationLedger("wiki/observations/euthyphro.md", record("", "accepted"))).toEqual([]);
  });

  it("rejects every stale observation-local ontology alias", () => {
    for (const alias of ["feature_id", "feature_family", "feature_label"]) {
      const issues = validateObservationLedger(
        "wiki/observations/euthyphro.md",
        record(`${alias}: stale_value\n`),
      );
      expect(issues.some((issue) => issue.code === "stale_ontology_alias" && issue.message.includes(alias))).toBe(true);
    }
  });

  it("rejects copied Greek outside greek_terms and out-of-span citations", () => {
    const content = record().replace(
      "The request and contrast occur within 5d-6a.",
      'At 6d-e Socrates says "οὐ τοῦτό", outside the selected span.',
    );
    const codes = validateObservationLedger("wiki/observations/euthyphro.md", content).map(({ code }) => code);
    expect(codes).toContain("greek_outside_terms");
    expect(codes).toContain("out_of_span_reference");
  });

  it("rejects incomplete source refs and invalid review status", () => {
    const incomplete = record().replace(/  start_marker:.*\n/u, "");
    const issues = validateObservationLedger("wiki/observations/euthyphro.md", incomplete);
    expect(issues.some(({ code }) => code === "missing_field")).toBe(true);
    expect(formatObservationLedgerValidationError(issues)).toContain("Copy the complete source_ref object");
    expect(validateObservationLedger("wiki/observations/euthyphro.md", record("", "maybe")).some(
      ({ code }) => code === "invalid_review_status",
    )).toBe(true);
  });
});

describe("readSourceCached", () => {
  it("reuses a cached source text value", () => {
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

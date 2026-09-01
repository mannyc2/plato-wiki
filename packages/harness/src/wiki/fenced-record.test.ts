import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Type } from "typebox";
import { claimMarkdownBlocks } from "./claim-ledger.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import {
  CanonicalYamlRecordError,
  fencedYamlRecordBlocks,
  fieldValue,
  listFieldValue,
  nestedFieldValue,
  nestedFieldValueInParent,
  nestedFieldValueInPath,
  parseCanonicalYamlRecord,
  serializeCanonicalYamlRecord,
} from "./fenced-record.js";
import {
  canonicalizeLegacyFencedRecord,
  migrateFencedRecordMarkdown,
  planFencedRecordMigration,
} from "./fenced-record-migration.js";
import { observationMarkdownBlocks } from "./observation-ledger.js";
import { relationMarkdownBlocks } from "./relation-ledger.js";

describe("strict fenced YAML records", () => {
  it("parses colons, quoted phrases, block scalars, nested maps, and lists as YAML values", () => {
    const source = [
      "record_id: record_0001",
      'summary: "Socrates asks: \\"What is it?\\""',
      "body: |-",
      "  First line: still prose.",
      "  Second line.",
      "source_ref:",
      "  source_path: raw/plato/greek/euthyphro.txt",
      "  start_char: 12",
      "tags:",
      "  - one",
      '  - "two: quoted"',
    ].join("\n");

    expect(fieldValue(source, "summary")).toBe('Socrates asks: "What is it?"');
    expect(fieldValue(source, "body")).toBe("First line: still prose.\nSecond line.");
    expect(nestedFieldValue(source, "start_char")).toBe("12");
    expect(nestedFieldValueInParent(source, "source_ref", "source_path")).toBe(
      "raw/plato/greek/euthyphro.txt",
    );
    expect(
      nestedFieldValueInPath(
        "resolution_ref:\n  source_ref:\n    source_path: raw/plato/greek/euthyphro.txt",
        ["resolution_ref", "source_ref"],
        "source_path",
      ),
    ).toBe("raw/plato/greek/euthyphro.txt");
    expect(listFieldValue(source, "tags")).toEqual(["one", "two: quoted"]);
  });

  it("serializes deterministically and round-trips the parsed record", () => {
    const parsed = parseCanonicalYamlRecord("id: x\nnested:\n  values: [a, b]\nbody: |-\n  line one\n  line two");
    const first = serializeCanonicalYamlRecord(parsed);
    const second = serializeCanonicalYamlRecord(parseCanonicalYamlRecord(first));

    expect(second).toBe(first);
    expect(parseCanonicalYamlRecord(second)).toEqual(parsed);
  });

  it("rejects duplicate keys, multiple documents, malformed YAML, and non-object roots", () => {
    expect(() => parseCanonicalYamlRecord("id: one\nid: two")).toThrow("Map keys must be unique");
    expect(() => parseCanonicalYamlRecord("id: one\n---\nid: two")).toThrow("one strict YAML 1.2 document");
    expect(() => parseCanonicalYamlRecord("summary: a claim: with a colon")).toThrow(CanonicalYamlRecordError);
    expect(() => parseCanonicalYamlRecord("[one, two]")).toThrow("root must be a plain mapping object");
    expect(() => parseCanonicalYamlRecord("just text")).toThrow("root must be a plain mapping object");
  });

  it("rejects unknown tags and unknown fields under a supplied TypeBox schema", () => {
    expect(() => parseCanonicalYamlRecord("id: !unknown value")).toThrow("Unresolved tag");
    const schema = Type.Object({ id: Type.String() }, { additionalProperties: false });
    expect(() => parseCanonicalYamlRecord("id: ok\nextra: no", { schema })).toThrow("does not match its TypeBox schema");
  });

  it("discovers all four canonical ledger kinds through one fenced parser", () => {
    const markdown = "# Ledger\n\n```yaml\nrecord_id: fixture\nobservation_id: obs_fixture_0001\nclaim_id: claim_fixture_0001\nrelation_id: rel_fixture_0001\ncommentary_id: comm_fixture_0001\n```\n";

    expect(fencedYamlRecordBlocks(markdown)[0]?.startLine).toBe(3);
    expect(observationMarkdownBlocks(markdown)[0]?.observationId).toBe("obs_fixture_0001");
    expect(claimMarkdownBlocks(markdown)[0]?.claimId).toBe("claim_fixture_0001");
    expect(relationMarkdownBlocks(markdown)[0]?.relationId).toBe("rel_fixture_0001");
    expect(commentaryMarkdownBlocks(markdown)[0]?.commentaryId).toBe("comm_fixture_0001");
  });

  it("rejects unterminated fences instead of silently omitting a record", () => {
    expect(() => fencedYamlRecordBlocks("```yaml\nid: fixture\n")).toThrow("Unterminated yaml fence");
  });
});

describe("fenced-record migration", () => {
  it("canonically repairs legacy colons, quoted phrases, and trailing document separators", () => {
    const legacy = [
      "record_id: record_0001",
      "summary: A claim: with a colon",
      'gloss: "let go" and "do not let go"',
      "source_ref:",
      "  start_char: 12",
      "items: [one, two]",
      "---",
    ].join("\n");
    const migrated = canonicalizeLegacyFencedRecord(legacy);

    expect(fieldValue(migrated, "summary")).toBe("A claim: with a colon");
    expect(fieldValue(migrated, "gloss")).toBe('"let go" and "do not let go"');
    expect(nestedFieldValueInParent(migrated, "source_ref", "start_char")).toBe("12");
    expect(listFieldValue(migrated, "items")).toEqual(["one", "two"]);
    expect(migrated).not.toContain("\n---");
    expect(canonicalizeLegacyFencedRecord(migrated)).toBe(migrated);
  });

  it("rewrites fenced markdown deterministically without changing surrounding prose", () => {
    const markdown = "# Heading\n\nBefore.\n\n```yaml\nid: record_1\nsummary: Text: detail\n```\n\nAfter.\n";
    const first = migrateFencedRecordMarkdown(markdown);
    const second = migrateFencedRecordMarkdown(first.content);

    expect(first.changed).toBe(true);
    expect(first.content.startsWith("# Heading\n\nBefore.\n\n```yaml\n")).toBe(true);
    expect(first.content.endsWith("```\n\nAfter.\n")).toBe(true);
    expect(second.content).toBe(first.content);
    expect(second.changed).toBe(false);
  });

  it("refuses ambiguous duplicate-key legacy records", () => {
    expect(() => canonicalizeLegacyFencedRecord("id: one\nid: two")).toThrow("Map keys must be unique");
  });

  it("repairs indented prose below empty prose fields without retyping nested structures", () => {
    const migrated = canonicalizeLegacyFencedRecord([
      "observation_id: obs_fixture_0001",
      "source_ref:",
      "  source_path: raw/plato/greek/fixture.txt",
      "observation:",
      "  The first wrapped line",
      "  continues on the second line.",
      "limits:",
      "  This is a separate prose field.",
      "review_status: accepted",
    ].join("\n"));

    expect(fieldValue(migrated, "observation")).toBe("The first wrapped line continues on the second line.");
    expect(fieldValue(migrated, "limits")).toBe("This is a separate prose field.");
    expect(nestedFieldValueInParent(migrated, "source_ref", "source_path")).toBe(
      "raw/plato/greek/fixture.txt",
    );
  });

  it("reattaches unindented block-scalar continuations and stops at the next field", () => {
    const migrated = canonicalizeLegacyFencedRecord([
      "observation_id: obs_fixture_0001",
      "observation: >-",
      "  The first line is indented but the next",
      "line lost its indentation during legacy wrapping.",
      "textual_basis: >-",
      "  The cited mechanism begins here and",
      "continues here without indentation.",
      "limits: The boundary field must remain independent.",
      "review_status: accepted",
    ].join("\n"));

    expect(fieldValue(migrated, "observation")).toBe(
      "The first line is indented but the next line lost its indentation during legacy wrapping.",
    );
    expect(fieldValue(migrated, "textual_basis")).toBe(
      "The cited mechanism begins here and continues here without indentation.",
    );
    expect(fieldValue(migrated, "limits")).toBe("The boundary field must remain independent.");
  });

  it("does not reinterpret a stray token after an identity field as prose", () => {
    expect(() => canonicalizeLegacyFencedRecord("observation_id: obs_fixture_0001\ntemp\nsource_work: Fixture"))
      .toThrow("Implicit keys need to be on a single line");
  });

  it("reports every ambiguous record with exact excerpts and field interpretations", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "fenced-record-report-"));
    try {
      mkdirSync(join(repoRoot, "wiki/observations"), { recursive: true });
      writeFileSync(join(repoRoot, "wiki/observations/fixture.md"), [
        "```yaml",
        "observation_id: obs_fixture_0001",
        "temp",
        "source_work: Fixture",
        "```",
        "",
        "```yaml",
        "observation_id: obs_fixture_0002",
        "greek_terms:",
        "  - λόγος",
        "greek_terms: []",
        "```",
        "",
      ].join("\n"));

      const plan = planFencedRecordMigration({ repoRoot });
      const defects = plan.entries[0]?.defects ?? [];
      expect(defects.map((defect) => [defect.recordId, defect.code])).toEqual([
        ["obs_fixture_0001", "unkeyed_scalar"],
        ["obs_fixture_0002", "duplicate_top_level_key"],
      ]);
      expect(defects[0]?.originalExcerpt).toContain("2: temp");
      expect(defects[0]?.fieldInterpretations).toEqual(["unkeyed scalar: temp"]);
      expect(defects[1]?.field).toBe("greek_terms");
      expect(defects[1]?.fieldInterpretations).toEqual(["greek_terms:\n  - λόγος", "greek_terms: []"]);
      expect(defects[1]?.recommendedRepair).toContain("source_ref.source_path");
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

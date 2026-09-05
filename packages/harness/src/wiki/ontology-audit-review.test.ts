import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  canonicalizeOntologySourceReviewArtifacts,
  importOntologySourceReview,
} from "./ontology-audit-review.js";

const HASH = "a".repeat(64);
const roots: string[] = [];

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "ontology-audit-review-"));
  roots.push(root);
  const packagePath = join(root, "wiki/ontology-audits/snapshot");
  mkdirSync(packagePath, { recursive: true });
  write(join(root, "packages/harness/src/wiki/ontology-audit.ts"), "fixture implementation\n");
  write(join(root, "docs/ontology-audit-protocol.md"), "fixture protocol\n");
  write(
    join(packagePath, "manifest.json"),
    `${JSON.stringify({ baseline: { counts: {} }, partitions: {}, schema: {}, protocol: {} }, null, 2)}\n`,
  );
  write(
    join(packagePath, "acceptance.json"),
    `${JSON.stringify({ manifest: {}, partitions: {}, closure: { unresolved_adjudications: 0 } }, null, 2)}\n`,
  );
  write(join(packagePath, "adjudications.jsonl"), "");
  return { root, packagePath };
}

function sourceUnit(key: string) {
  return {
    key,
    kind: "source_unit",
    dialogue: "fixture",
    source_path: "raw/plato/greek/fixture.txt",
    source_sha256: HASH,
    marker: "1a",
    start_char: 0,
    end_char: 1,
    text_sha256: HASH,
    overlapping_record_keys: [],
    overlapping_record_key_set_sha256: HASH,
    primary: {
      state: "pending",
      reviewer: null,
      reviewed_input_sha256: HASH,
      outcome: null,
      finding_ids: [],
    },
    independent: {
      state: "pending",
      reviewer: null,
      reviewed_input_sha256: HASH,
      outcome: null,
      finding_ids: [],
    },
    reconciliation: { state: "pending", rationale: null, adjudication_ids: [] },
  };
}

function reviewRow(key: string) {
  return {
    key,
    dialogue: "fixture",
    reviewer: "reviewer-a",
    reviewed_input_sha256: HASH,
    text_sha256: HASH,
    outcome: "findings",
    finding_ids: ["finding:fixture:1"],
    findings: [{
      finding_id: "finding:fixture:1",
      defect_class: "source_overstatement",
      proposed_action: "revise",
      rationale: "The record asserts more than the cited Greek source unit supports.",
      record_key: key,
    }],
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("importOntologySourceReview", () => {
  test("binds an exact completed pass, normalized findings, and an immutable receipt", () => {
    const { root, packagePath } = fixture();
    const key = "source:fixture:0-1";
    write(join(packagePath, "source-units.jsonl"), `${JSON.stringify(sourceUnit(key))}\n`);
    const inputPath = join(root, "work/review.jsonl");
    write(inputPath, `${JSON.stringify(reviewRow(key))}\n\n`);

    const result = importOntologySourceReview({
      repoRoot: root,
      packagePath,
      pass: "primary",
      inputPaths: [inputPath],
      receiptPath: "wiki/review/fixture-primary.md",
    });

    expect(result).toMatchObject({ pass: "primary", sourceUnits: 1, findings: 1 });
    const imported = JSON.parse(readFileSync(join(packagePath, "source-units.jsonl"), "utf8")) as {
      primary: { state: string; receipt_path: string; receipt_sha256: string };
    };
    expect(imported.primary).toMatchObject({ state: "complete", receipt_path: "wiki/review/fixture-primary.md" });
    expect(imported.primary.receipt_sha256).toHaveLength(64);
    expect(readFileSync(join(packagePath, "findings.jsonl"), "utf8")).toContain("finding:fixture:1");
    const storedInputPath = join(packagePath, "review-inputs/primary", `${result.inputs[0]!.sha256}-review.jsonl`);
    expect(existsSync(storedInputPath)).toBe(true);
    expect(readFileSync(storedInputPath, "utf8")).toBe(`${JSON.stringify(reviewRow(key))}\n`);
    expect(readFileSync(join(root, "wiki/review/fixture-primary.md"), "utf8")).toContain("- artifact: `wiki/ontology-audits/snapshot/review-inputs/primary/");
  });

  test("hard-renames legacy blank-line artifacts and rebinds their receipts", () => {
    const { root, packagePath } = fixture();
    const key = "source:fixture:0-1";
    write(join(packagePath, "source-units.jsonl"), `${JSON.stringify(sourceUnit(key))}\n`);
    const inputPath = join(root, "work/review.jsonl");
    write(inputPath, `${JSON.stringify(reviewRow(key))}\n`);
    const imported = importOntologySourceReview({
      repoRoot: root,
      packagePath,
      pass: "primary",
      inputPaths: [inputPath],
      receiptPath: "wiki/review/fixture-primary.md",
    });

    const canonicalPath = join(packagePath, "review-inputs/primary", `${imported.inputs[0]!.sha256}-review.jsonl`);
    const legacyContent = `${readFileSync(canonicalPath, "utf8")}\n`;
    const legacySha256 = sha256(legacyContent);
    const legacyPath = join(packagePath, "review-inputs/primary", `${legacySha256}-review.jsonl`);
    renameSync(canonicalPath, legacyPath);
    writeFileSync(legacyPath, legacyContent, "utf8");

    const receiptPath = join(root, "wiki/review/fixture-primary.md");
    const receipt = readFileSync(receiptPath, "utf8").replaceAll(imported.inputs[0]!.sha256, legacySha256);
    writeFileSync(receiptPath, receipt, "utf8");
    const sourcePath = join(packagePath, "source-units.jsonl");
    const source = JSON.parse(readFileSync(sourcePath, "utf8")) as ReturnType<typeof sourceUnit> & {
      primary: ReturnType<typeof sourceUnit>["primary"] & { receipt_sha256: string };
    };
    source.primary.receipt_sha256 = sha256(receipt);
    writeFileSync(sourcePath, `${JSON.stringify(source)}\n`, "utf8");

    const result = canonicalizeOntologySourceReviewArtifacts({ repoRoot: root, packagePath });

    expect(result).toMatchObject({
      artifactsChanged: 1,
      receiptsChanged: 1,
      sourceUnitsRebound: 1,
      mappingArtifacts: [{ path: expect.stringContaining("source-review-canonicalization/sha256-") }],
    });
    expect(existsSync(legacyPath)).toBe(false);
    expect(existsSync(canonicalPath)).toBe(true);
    expect(readFileSync(canonicalPath, "utf8")).toBe(`${JSON.stringify(reviewRow(key))}\n`);
    const rebound = JSON.parse(readFileSync(sourcePath, "utf8")) as {
      primary: { receipt_sha256: string };
    };
    expect(rebound.primary.receipt_sha256).toBe(sha256(readFileSync(receiptPath)));
    expect(canonicalizeOntologySourceReviewArtifacts({ repoRoot: root, packagePath })).toMatchObject({
      artifactsChanged: 0,
      receiptsChanged: 0,
      sourceUnitsRebound: 0,
      mappingArtifacts: [],
    });
  });

  test("refuses to migrate a hash-mismatched stored review input", () => {
    const { root, packagePath } = fixture();
    const key = "source:fixture:0-1";
    write(join(packagePath, "source-units.jsonl"), `${JSON.stringify(sourceUnit(key))}\n`);
    const inputPath = join(root, "work/review.jsonl");
    write(inputPath, `${JSON.stringify(reviewRow(key))}\n`);
    const imported = importOntologySourceReview({
      repoRoot: root,
      packagePath,
      pass: "primary",
      inputPaths: [inputPath],
      receiptPath: "wiki/review/fixture-primary.md",
    });
    const storedPath = join(packagePath, "review-inputs/primary", `${imported.inputs[0]!.sha256}-review.jsonl`);
    writeFileSync(storedPath, "{}\n", "utf8");

    expect(() => canonicalizeOntologySourceReviewArtifacts({ repoRoot: root, packagePath }))
      .toThrow("missing or hash-mismatched artifact");
  });

  test("canonicalizes legacy finding identifiers at the audit import boundary", () => {
    const { root, packagePath } = fixture();
    const key = "source:fixture:0-1";
    write(join(packagePath, "source-units.jsonl"), `${JSON.stringify(sourceUnit(key))}\n`);
    const inputPath = join(root, "work/review.jsonl");
    const row = reviewRow(key);
    row.finding_ids = ["finding-legacy-fixture"];
    row.findings[0]!.finding_id = "finding-legacy-fixture";
    write(inputPath, `${JSON.stringify(row)}\n`);

    importOntologySourceReview({
      repoRoot: root,
      packagePath,
      pass: "primary",
      inputPaths: [inputPath],
      receiptPath: "wiki/review/fixture-legacy-id.md",
    });

    const importedSource = JSON.parse(readFileSync(join(packagePath, "source-units.jsonl"), "utf8")) as {
      primary: { finding_ids: string[] };
    };
    expect(importedSource.primary.finding_ids).toEqual(["finding:legacy-fixture"]);
    const importedFinding = JSON.parse(readFileSync(join(packagePath, "findings.jsonl"), "utf8")) as {
      finding_id: string;
    };
    expect(importedFinding.finding_id).toBe("finding:legacy-fixture");
  });

  test("rejects a selected dialogue unless every frozen unit occurs exactly once", () => {
    const { root, packagePath } = fixture();
    const first = sourceUnit("source:fixture:0-1");
    const second = { ...sourceUnit("source:fixture:1-2"), start_char: 1, end_char: 2 };
    write(join(packagePath, "source-units.jsonl"), `${JSON.stringify(first)}\n${JSON.stringify(second)}\n`);
    const inputPath = join(root, "work/review.jsonl");
    write(inputPath, `${JSON.stringify(reviewRow(first.key))}\n`);

    expect(() => importOntologySourceReview({
      repoRoot: root,
      packagePath,
      pass: "primary",
      inputPaths: [inputPath],
      receiptPath: "wiki/review/incomplete.md",
    })).toThrow("is not exact for selected dialogues");
  });

  test("rejects review rows bound to a different frozen input", () => {
    const { root, packagePath } = fixture();
    const key = "source:fixture:0-1";
    write(join(packagePath, "source-units.jsonl"), `${JSON.stringify(sourceUnit(key))}\n`);
    const inputPath = join(root, "work/review.jsonl");
    const row = { ...reviewRow(key), reviewed_input_sha256: "b".repeat(64) };
    write(inputPath, `${JSON.stringify(row)}\n`);

    expect(() => importOntologySourceReview({
      repoRoot: root,
      packagePath,
      pass: "primary",
      inputPaths: [inputPath],
      receiptPath: "wiki/review/wrong-input.md",
    })).toThrow("review input hash mismatch");
  });
});

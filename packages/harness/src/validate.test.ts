import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeEnglishStephanusIndex, writeStephanusIndex } from "./derived/stephanus.js";
import { setRepoRootForTesting } from "./paths.js";
import { collectReportedTurnScopeFailures } from "./reported-turn-scopes.js";
import {
  collectOntologySummary,
  collectReviewCoverage,
  validateEnglishSpines,
  validateHarnessInstructionContract,
  verifySha256Manifest,
} from "./validate.js";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  renderOntologyVNextDocuments,
} from "./wiki/ontology-vnext.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeLedger(fileName: string, records: string[]) {
  writeFileSync(
    join(root, "wiki/observations", fileName),
    `# Test Observations

${records.join("\n\n")}
`,
    "utf8",
  );
}

function record({
  observationId,
  reviewStatus = "unreviewed",
}: {
  observationId: string;
  reviewStatus?: string;
}) {
  return `\`\`\`yaml
observation_id: ${observationId}
review_status: ${reviewStatus}
\`\`\``;
}

describe("collectOntologySummary", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "validate-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "wiki/observations"), { recursive: true });
    mkdirSync(join(root, "wiki/ontology"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  function writeOntology() {
    const axisId = deriveOntologyVNextAxisId("textual_function", "argument_move");
    const assentId = deriveOntologyVNextConceptId(axisId, "assent_chain");
    const exampleId = deriveOntologyVNextConceptId(axisId, "craft_example");
    const memberships = [
      ["obs_meno_0001", assentId],
      ["obs_crito_0003", assentId],
      ["obs_meno_0002", exampleId],
    ].map(([observationId, conceptId]) => ({
      schema_version: 1 as const,
      membership_id: deriveOntologyVNextMembershipId(observationId!, conceptId!),
      observation_id: observationId!,
      concept_id: conceptId!,
      assignment_basis: "The cited Greek span instantiates the comparison category.",
    }));
    const documents = renderOntologyVNextDocuments({
      axes: [
        {
          schema_version: 1,
          axis_id: axisId,
          axis_key: "argument_move",
          dimension: "textual_function",
          comparison_question: "What argumentative move does the cited span perform?",
        },
      ],
      concepts: [
        {
          schema_version: 1,
          concept_id: assentId,
          axis_id: axisId,
          concept_key: "assent_chain",
          definition: "A sequence of short assents advances the exchange.",
          comparison_question: "What argumentative move does the cited span perform?",
        },
        {
          schema_version: 1,
          concept_id: exampleId,
          axis_id: axisId,
          concept_key: "craft_example",
          definition: "A craft example supplies the comparison case.",
          comparison_question: "What argumentative move does the cited span perform?",
        },
      ],
      memberships,
    });
    writeFileSync(join(root, "wiki/ontology/axes.jsonl"), documents.axes);
    writeFileSync(join(root, "wiki/ontology/concepts.jsonl"), documents.concepts);
    writeFileSync(join(root, "wiki/ontology/memberships.jsonl"), documents.memberships);
  }

  it("counts singleton and cross-dialogue concepts", () => {
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        reviewStatus: "accepted",
      }),
      record({
        observationId: "obs_meno_0002",
        reviewStatus: "accepted",
      }),
    ]);
    writeLedger("crito.md", [
      record({
        observationId: "obs_crito_0003",
        reviewStatus: "accepted",
      }),
    ]);
    writeOntology();

    const report = collectOntologySummary();

    expect(report.axisCount).toBe(1);
    expect(report.conceptCount).toBe(2);
    expect(report.membershipCount).toBe(3);
    expect(report.singletonConceptCount).toBe(1);
    expect(report.crossDialogueConceptCount).toBe(1);
    expect(report.axes).toMatchObject([
      {
        axisKey: "argument_move",
        conceptCount: 2,
        membershipCount: 3,
      },
    ]);
  });

  it("counts review coverage by ledger", () => {
    writeLedger("crito.md", [
      record({
        observationId: "obs_crito_0001",
        reviewStatus: "accepted",
      }),
      record({
        observationId: "obs_crito_0002",
        reviewStatus: "needs_split",
      }),
    ]);
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        reviewStatus: "unreviewed",
      }),
      record({
        observationId: "obs_meno_0002",
        reviewStatus: "rejected",
      }),
    ]);

    expect(collectReviewCoverage()).toEqual([
      {
        path: "wiki/observations/crito.md",
        unreviewed: 0,
        accepted: 1,
        rejected: 0,
        needsSplit: 1,
      },
      {
        path: "wiki/observations/meno.md",
        unreviewed: 1,
        accepted: 0,
        rejected: 1,
        needsSplit: 0,
      },
    ]);
  });
});

describe("verifySha256Manifest", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "manifest-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "raw/plato"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  function sha256(content: string) {
    return createHash("sha256").update(content).digest("hex");
  }

  it("accepts a correct manifest entry", () => {
    writeFileSync(join(root, "fixture.txt"), "abc", "utf8");
    writeFileSync(join(root, "raw/plato/MANIFEST.sha256"), `${sha256("abc")}  fixture.txt\n`, "utf8");

    expect(verifySha256Manifest("raw/plato/MANIFEST.sha256")).toEqual([]);
  });

  it("reports tampered file content", () => {
    writeFileSync(join(root, "fixture.txt"), "changed", "utf8");
    writeFileSync(join(root, "raw/plato/MANIFEST.sha256"), `${sha256("original")}  fixture.txt\n`, "utf8");

    expect(verifySha256Manifest("raw/plato/MANIFEST.sha256")[0]).toContain("fixture.txt");
  });

  it("reports missing files", () => {
    writeFileSync(join(root, "raw/plato/MANIFEST.sha256"), `${sha256("abc")}  missing.txt\n`, "utf8");

    expect(verifySha256Manifest("raw/plato/MANIFEST.sha256")).toEqual(["missing.txt: missing file"]);
  });

  it("reports malformed manifest lines", () => {
    writeFileSync(join(root, "raw/plato/MANIFEST.sha256"), "not a manifest line\n", "utf8");

    expect(verifySha256Manifest("raw/plato/MANIFEST.sha256")).toEqual([
      "raw/plato/MANIFEST.sha256:1: malformed manifest line",
    ]);
  });
});

describe("validateEnglishSpines", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "english-spine-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  function writeCommentaryLedger() {
    mkdirSync(join(root, "wiki/commentary"), { recursive: true });
    writeFileSync(join(root, "wiki/commentary/fixture.md"), "# fixture commentary\n", "utf8");
  }

  function writeGreek(content = "{2a} alpha {2b} beta {3a} gamma") {
    mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
    writeFileSync(join(root, "raw/plato/greek/fixture.txt"), content, "utf8");
  }

  function writeEnglish(content = "{2a} first {3a} second") {
    mkdirSync(join(root, "raw/plato/english"), { recursive: true });
    writeFileSync(join(root, "raw/plato/english/fixture.txt"), content, "utf8");
  }

  it("passes with no commentary ledgers and with a fresh subset spine", () => {
    expect(validateEnglishSpines()).toEqual([]);

    writeGreek();
    writeEnglish();
    writeCommentaryLedger();
    writeStephanusIndex("fixture");
    writeEnglishStephanusIndex("fixture");

    expect(validateEnglishSpines()).toEqual([]);
  });

  it("ignores dialogues without an English source", () => {
    writeGreek();
    writeCommentaryLedger();

    expect(validateEnglishSpines()).toEqual([]);
  });

  it("fails when the English index is missing", () => {
    writeGreek();
    writeEnglish();
    writeCommentaryLedger();
    writeStephanusIndex("fixture");

    const failures = validateEnglishSpines();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("missing English Stephanus index");
  });

  it("fails when the English index is stale", () => {
    writeGreek();
    writeEnglish();
    writeCommentaryLedger();
    writeStephanusIndex("fixture");
    writeEnglishStephanusIndex("fixture");
    writeEnglish("{2a} first {3a} second edited");

    const failures = validateEnglishSpines();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("stale English Stephanus index");
  });

  it("fails when an English marker is not an order-preserving subset of the Greek", () => {
    writeGreek("{2a} alpha {2b} beta {3a} gamma");
    writeEnglish("{2a} first {4a} stray");
    writeCommentaryLedger();
    writeStephanusIndex("fixture");
    writeEnglishStephanusIndex("fixture");

    const failures = validateEnglishSpines();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("marker 4a");
  });
});

describe("validateHarnessInstructionContract", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "instruction-contract-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "docs"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  function writeInstructionContract({ omitHardCut = false } = {}) {
    writeFileSync(
      join(root, "docs/ontology-vnext.md"),
      [
        "# Ontology vNext",
        "## Canonical model",
        "Source-bound observations do not own classification identity",
        "Rejected observations have no memberships",
        omitHardCut ? "" : "Hard cut only",
        "Question-driven projections",
      ].join("\n"),
      "utf8",
    );
  }

  it("accepts the vNext ontology contract", () => {
    writeInstructionContract();

    expect(validateHarnessInstructionContract()).toEqual([]);
  });

  it("reports missing contract phrases", () => {
    writeInstructionContract({ omitHardCut: true });

    expect(validateHarnessInstructionContract()).toContain(
      'docs/ontology-vnext.md: missing required contract phrase "Hard cut only"',
    );
  });
});

describe("reported-turn scope manifest gate", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "reported-turn-scope-gate-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "wiki"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("fails a tree whose manifest is missing, so absence cannot pass as a zero result", () => {
    expect(collectReportedTurnScopeFailures()).toEqual([
      "wiki/reported-turn-scopes.json manifest: expected wiki/reported-turn-scopes.json exists; got missing",
    ]);
  });

  it("fails a malformed manifest without waiting for the completeness report", () => {
    writeFileSync(join(root, "wiki/reported-turn-scopes.json"), "{ nope", "utf8");
    const failures = collectReportedTurnScopeFailures();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("expected valid JSON");
  });

  it("names the dialogues an incomplete manifest fails to cover", () => {
    writeFileSync(
      join(root, "wiki/reported-turn-scopes.json"),
      JSON.stringify({ schemaVersion: 1, dialogues: [] }),
      "utf8",
    );
    expect(collectReportedTurnScopeFailures().join("\n")).toContain("missing: apology");
  });
});

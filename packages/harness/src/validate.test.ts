import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeEnglishStephanusIndex, writeStephanusIndex } from "./derived/stephanus.js";
import { setRepoRootForTesting } from "./paths.js";
import { collectReportedTurnScopeFailures } from "./reported-turn-scopes.js";
import {
  collectLabelDriftReport,
  collectReviewCoverage,
  validateEnglishSpines,
  validateHarnessInstructionContract,
  verifySha256Manifest,
} from "./validate.js";

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
  family,
  label,
  featureId,
  reviewStatus = "unreviewed",
}: {
  observationId: string;
  family: string;
  label: string;
  featureId: string;
  reviewStatus?: string;
}) {
  return `\`\`\`yaml
observation_id: ${observationId}
feature_id: ${featureId}
feature_family: ${family}
feature_label: ${label}
review_status: ${reviewStatus}
\`\`\``;
}

describe("collectLabelDriftReport", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "validate-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "wiki/observations"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("counts singleton and cross-dialogue labels", () => {
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "elenchus",
        label: "assent_chain",
        featureId: "feature_candidate_001",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "craft_analogy",
        label: "craft_example",
        featureId: "feature_candidate_002",
      }),
    ]);
    writeLedger("crito.md", [
      record({
        observationId: "obs_crito_0003",
        family: "elenchus",
        label: "assent_chain",
        featureId: "feature_candidate_001",
      }),
    ]);

    const report = collectLabelDriftReport();

    expect(report.totalLabels).toBe(2);
    expect(report.singletonLabels).toBe(1);
    expect(report.crossDialogueLabels).toBe(1);
    expect(report.singletonExamples).toMatchObject([
      {
        family: "craft_analogy",
        label: "craft_example",
        observationIds: ["obs_meno_0002"],
        dialogues: ["meno"],
      },
    ]);
  });

  it("derives dialogue slugs from observation ids", () => {
    writeLedger("mixed.md", [
      record({
        observationId: "obs_meno_0001",
        family: "definition_ladder",
        label: "definition_revision",
        featureId: "feature_candidate_003",
      }),
      record({
        observationId: "obs_crito_0003",
        family: "definition_ladder",
        label: "definition_revision",
        featureId: "feature_candidate_003",
      }),
    ]);

    expect(collectLabelDriftReport().crossDialogueLabels).toBe(1);
  });

  it("counts review coverage by ledger", () => {
    writeLedger("crito.md", [
      record({
        observationId: "obs_crito_0001",
        family: "elenchus",
        label: "assent_chain",
        featureId: "feature_candidate_001",
        reviewStatus: "accepted",
      }),
      record({
        observationId: "obs_crito_0002",
        family: "elenchus",
        label: "assent_chain",
        featureId: "feature_candidate_001",
        reviewStatus: "needs_split",
      }),
    ]);
    writeLedger("meno.md", [
      record({
        observationId: "obs_meno_0001",
        family: "craft_analogy",
        label: "craft_example",
        featureId: "feature_candidate_002",
        reviewStatus: "unreviewed",
      }),
      record({
        observationId: "obs_meno_0002",
        family: "craft_analogy",
        label: "craft_example",
        featureId: "feature_candidate_002",
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
    mkdirSync(join(root, ".pi/skills/plato-label-normalization"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  function writeInstructionContract({ omitSkillStop = false } = {}) {
    writeFileSync(
      join(root, "docs/label-normalization-standards.md"),
      [
        "# Label Normalization Standards",
        "## Reusable Agent And Harness Contract",
        "Function before topic",
        "Hard cutover after acceptance",
        "The reusable output is the merge map",
        "bun run harness labels validate",
      ].join("\n"),
      "utf8",
    );
    writeFileSync(
      join(root, ".pi/skills/plato-label-normalization/SKILL.md"),
      [
        "# Plato Label Normalization",
        "## Reusable Contract",
        "load the standards document and this skill before proposing merge-map entries",
        "persist decisions only in the merge map",
        omitSkillStop ? "" : "stop before apply when validation fails",
      ].join("\n"),
      "utf8",
    );
  }

  it("accepts the reusable standards and skill contract", () => {
    writeInstructionContract();

    expect(validateHarnessInstructionContract()).toEqual([]);
  });

  it("reports missing contract phrases", () => {
    writeInstructionContract({ omitSkillStop: true });

    expect(validateHarnessInstructionContract()).toContain(
      '.pi/skills/plato-label-normalization/SKILL.md: missing required contract phrase "stop before apply when validation fails"',
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

import { createHash } from "node:crypto";
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { terminalOntologyAuditManifest } from "./ontology-audit-finalization.js";
import {
  assertOntologyClosureEvidenceProof,
  recomputeOntologyClosureEvidence,
  verifyOntologyClosureEvidenceFile,
} from "./ontology-closure-evidence.js";
import {
  validateOntologyAcceptedMachineEvidence,
  validateOntologyAuditReviewEvidence,
  ontologyAuditChangeKind,
  type OntologyAuditAcceptance,
  type OntologyAuditAdjudication,
  type OntologyAuditFinding,
  type OntologyAuditManifest,
  type OntologyAuditSourceUnit,
} from "./ontology-audit.js";

const HASH = "a".repeat(64);
const roots: string[] = [];

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "ontology-audit-integrity-"));
  roots.push(root);
  const artifactPath = "wiki/ontology-audits/snapshot/review-inputs/evidence.jsonl";
  write(join(root, artifactPath), "{\"state\":\"complete\"}\n");
  const receiptPath = "wiki/review/audit-evidence.md";
  write(
    join(root, receiptPath),
    `# Review evidence\n\n- artifact: \`${artifactPath}\`; sha256: \`${sha256(readFileSync(join(root, artifactPath)))}\`\n`,
  );
  const base = {
    key: "source:fixture:0-1",
    kind: "source_unit" as const,
    dialogue: "fixture",
    source_path: "raw/plato/greek/fixture.txt",
    source_sha256: HASH,
    marker: "1a",
    start_char: 0,
    end_char: 1,
    text_sha256: HASH,
    overlapping_record_keys: ["record:observation:fixture"],
    overlapping_record_key_set_sha256: HASH,
  };
  const reviewedInputSha256 = sha256(canonicalJson(base));
  const receiptSha256 = sha256(readFileSync(join(root, receiptPath)));
  const source: OntologyAuditSourceUnit = {
    ...base,
    primary: {
      state: "complete",
      reviewer: "primary-reviewer",
      reviewed_input_sha256: reviewedInputSha256,
      outcome: "findings",
      finding_ids: ["finding:fixture:1"],
      receipt_path: receiptPath,
      receipt_sha256: receiptSha256,
    },
    independent: {
      state: "complete",
      reviewer: "independent-reviewer",
      reviewed_input_sha256: reviewedInputSha256,
      outcome: "zero_result",
      finding_ids: [],
      receipt_path: receiptPath,
      receipt_sha256: receiptSha256,
    },
    reconciliation: {
      state: "adjudicated",
      reviewer: "reconciliation-reviewer",
      rationale: "The independent pass did not report the primary pass defect, so the item was adjudicated.",
      adjudication_ids: ["adjudication:fixture"],
      receipt_path: receiptPath,
      receipt_sha256: receiptSha256,
    },
  };
  const finding: OntologyAuditFinding = {
    finding_id: "finding:fixture:1",
    pass: "primary",
    reviewer: "primary-reviewer",
    source_unit_keys: [source.key],
    target_keys: ["record:observation:fixture"],
    defect_class: "source_overstatement",
    proposed_action: "revise",
    rationale: "The observation asserts more than the exact Greek source unit supports.",
  };
  const adjudication: OntologyAuditAdjudication = {
    adjudication_id: "adjudication:fixture",
    target_key: "record:observation:fixture",
    target_kind: "record",
    state: "complete",
    action: "revise",
    rationale: "The item was revised to match the source-bound finding.",
    finding_ids: [finding.finding_id],
    replacement_target_keys: [],
    receipt_path: receiptPath,
  };
  return { root, receiptPath, source, finding, adjudication };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("ontology audit evidence integrity", () => {
  test("accepts exact source-pass, finding, adjudication, receipt, and acceptance bindings", () => {
    const { root, receiptPath, source, finding, adjudication } = fixture();
    const issues = validateOntologyAuditReviewEvidence({
      repoRoot: root,
      sources: [source],
      findings: [finding],
      adjudications: [adjudication],
      acceptedReceiptArtifacts: new Map([[receiptPath, sha256(readFileSync(join(root, receiptPath)))]]),
    });
    expect(issues).toEqual([]);
  });

  test("rejects a correctly hash-bound review artifact with noncanonical JSONL transport", () => {
    const { root, receiptPath, source, finding, adjudication } = fixture();
    const artifactPath = "wiki/ontology-audits/snapshot/review-inputs/evidence.jsonl";
    write(join(root, artifactPath), "{\"state\":\"complete\"}\n\n");
    write(
      join(root, receiptPath),
      `# Review evidence\n\n- artifact: \`${artifactPath}\`; sha256: \`${sha256(readFileSync(join(root, artifactPath)))}\`\n`,
    );
    const receiptSha256 = sha256(readFileSync(join(root, receiptPath)));
    const rebound = {
      ...source,
      primary: { ...source.primary, receipt_sha256: receiptSha256 },
      independent: { ...source.independent, receipt_sha256: receiptSha256 },
      reconciliation: { ...source.reconciliation, receipt_sha256: receiptSha256 },
    };

    const issues = validateOntologyAuditReviewEvidence({
      repoRoot: root,
      sources: [rebound],
      findings: [finding],
      adjudications: [adjudication],
    });
    expect(issues.some((entry) => entry.message.includes("review artifact is not canonical JSONL"))).toBe(true);
  });

  test("rejects a finding absent from its declared source pass", () => {
    const { root, source, finding, adjudication } = fixture();
    const missing = {
      ...source,
      primary: { ...source.primary, outcome: "zero_result" as const, finding_ids: [] },
    };
    const issues = validateOntologyAuditReviewEvidence({
      repoRoot: root,
      sources: [missing],
      findings: [finding],
      adjudications: [adjudication],
    });
    expect(issues.some((entry) => entry.message.includes("is not referenced by any declared primary source pass"))).toBe(true);
  });

  test("rejects unknown, mismatched, or uncovered adjudication findings", () => {
    const { root, source, finding, adjudication } = fixture();
    const wrongTarget: OntologyAuditFinding = {
      ...finding,
      finding_id: "finding:fixture:wrong-target",
      target_keys: ["record:observation:another"],
    };
    const invalid = {
      ...adjudication,
      finding_ids: ["finding:missing", wrongTarget.finding_id],
    };
    const issues = validateOntologyAuditReviewEvidence({
      repoRoot: root,
      sources: [source],
      findings: [finding, wrongTarget],
      adjudications: [invalid],
    });
    expect(issues.some((entry) => entry.message.includes("references unknown finding finding:missing"))).toBe(true);
    expect(issues.some((entry) => entry.message.includes("does not target the adjudicated item"))).toBe(true);
    expect(issues.some((entry) => entry.message.includes("is not cited by the adjudication"))).toBe(true);
  });

  test("rejects missing adjudication receipts and missing acceptance hash bindings", () => {
    const { root, source, finding, adjudication } = fixture();
    const missingReceipt = { ...adjudication, receipt_path: "wiki/review/missing.md" };
    const receiptIssues = validateOntologyAuditReviewEvidence({
      repoRoot: root,
      sources: [source],
      findings: [finding],
      adjudications: [missingReceipt],
    });
    expect(receiptIssues.some((entry) => entry.message.includes("receipt is missing"))).toBe(true);

    const bindingIssues = validateOntologyAuditReviewEvidence({
      repoRoot: root,
      sources: [source],
      findings: [finding],
      adjudications: [adjudication],
      acceptedReceiptArtifacts: new Map(),
    });
    expect(bindingIssues.some((entry) => entry.message.includes("is not hash-bound by the acceptance receipt"))).toBe(true);
  });
});

test("accepted manifests leave no contradictory pending lane state", () => {
  const manifest = {
    audit_state: "pending",
    lane_states: [
      { lane: "observation", count: 10, state: "pending" },
      { lane: "apparatus", count: 0, state: "zero_result" },
    ],
  } as OntologyAuditManifest;
  expect(terminalOntologyAuditManifest(manifest)).toMatchObject({
    audit_state: "accepted",
    lane_states: [
      { lane: "observation", count: 10, state: "complete" },
      { lane: "apparatus", count: 0, state: "zero_result" },
    ],
  });
});

test("audit change classification is fully determined by baseline and final pointers", () => {
  const baseline = { path: "wiki/input.md", ordinal: 0, raw_sha256: HASH, review_status: "accepted" };
  const unchanged = { path: "wiki/input.md", ordinal: 1, canonical_sha256: HASH, review_status: "accepted" };
  const modified = { path: "wiki/input.md", ordinal: 1, canonical_sha256: "b".repeat(64), review_status: "rejected" };

  expect(ontologyAuditChangeKind(null, null)).toBeNull();
  expect(ontologyAuditChangeKind(null, unchanged)).toBe("added");
  expect(ontologyAuditChangeKind(baseline, null)).toBe("removed");
  expect(ontologyAuditChangeKind(baseline, unchanged)).toBe("unchanged");
  expect(ontologyAuditChangeKind(baseline, modified)).toBe("modified");
});

function machineEvidenceFixture() {
  const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-audit-machine-evidence-")));
  roots.push(root);
  const packageRelativePath = `wiki/ontology-audits/sha256-${HASH}`;
  const packagePath = join(root, packageRelativePath);
  const siteDirectory = join(root, "current-site");
  const canonicalGeneratedPath = join(root, "derived/plato/joins/fixture.toon");
  for (const directory of [
    "derived/plato/voices",
    "wiki/clusters",
    "wiki/dossiers",
  ]) mkdirSync(join(root, directory), { recursive: true });
  write(canonicalGeneratedPath, "x");
  write(join(root, "audio/coverage.md"), "audio");
  write(join(root, "wiki/completeness.md"), "complete");
  write(join(siteDirectory, "index.html"), "<!doctype html><title>Original edition</title>\n");
  const historical = recomputeOntologyClosureEvidence({ repoRoot: root, siteDirectory });
  const artifacts = [
    { path: "derived/plato/joins/fixture.toon", bytes: 1, sha256: sha256("x") },
    { path: "audio/coverage.md", bytes: 5, sha256: sha256("audio") },
    { path: "wiki/completeness.md", bytes: 8, sha256: sha256("complete") },
    ...historical.site_artifacts.map((entry) => ({ ...entry, path: `site/${entry.path}` })),
  ];
  const digest = sha256(canonicalJson([...artifacts].sort((left, right) => left.path.localeCompare(right.path))));
  const regenerationPath = join(packagePath, "regeneration.json");
  const evidencePath = join(packagePath, "closure-evidence.json");
  const evidenceContent = historical.content;
  write(evidencePath, evidenceContent);
  write(regenerationPath, `${JSON.stringify({
    schema_version: 1,
    state: "complete",
    regeneration_one_sha256: digest,
    regeneration_two_sha256: digest,
    closure_evidence_one_sha256: sha256(evidenceContent),
    closure_evidence_two_sha256: sha256(evidenceContent),
    closure_evidence_sha256: sha256(evidenceContent),
    closure_evidence_site_tree_sha256: historical.site_tree_sha256,
    closure_evidence_bytes: Buffer.byteLength(evidenceContent),
    artifact_count: artifacts.length,
    artifacts,
  }, null, 2)}\n`);
  const bindings = new Map([
    [`${packageRelativePath}/regeneration.json`, sha256(readFileSync(regenerationPath))],
    [`${packageRelativePath}/closure-evidence.json`, sha256(readFileSync(evidencePath))],
  ]);
  const acceptance = {
    closure: {
      regeneration_one_sha256: digest,
      regeneration_two_sha256: digest,
    },
  } as OntologyAuditAcceptance;
  const validateHistorical = () => validateOntologyAcceptedMachineEvidence({
    repoRoot: root,
    packagePath,
    acceptance,
    receiptArtifacts: bindings,
  });
  const currentPaths = { repoRoot: root, packagePath, siteDirectory };
  return {
    root,
    packageRelativePath,
    regenerationPath,
    evidencePath,
    evidenceContent,
    bindings,
    currentPaths,
    historical,
    validateHistorical,
  };
}

describe("historical ontology machine evidence", () => {
  test("preserves acceptance when current reports and site presentation change without changing semantic closure", () => {
    const fixture = machineEvidenceFixture();
    const originalRegeneration = readFileSync(fixture.regenerationPath, "utf8");
    expect(fixture.validateHistorical()).toEqual([]);
    const originalProof = verifyOntologyClosureEvidenceFile(fixture.currentPaths);

    write(join(fixture.root, "audio/coverage.md"), "updated audio coverage\n");
    write(join(fixture.root, "wiki/completeness.md"), "updated edition completeness\n");
    write(join(fixture.currentPaths.siteDirectory, "index.html"), "<!doctype html><title>Current edition</title>\n");
    write(join(fixture.currentPaths.siteDirectory, "style.css"), "body { color: #222; }\n");

    expect(() => assertOntologyClosureEvidenceProof(originalProof, fixture.currentPaths)).toThrow("proof is stale");
    const currentProof = verifyOntologyClosureEvidenceFile(fixture.currentPaths);
    expect(currentProof.site_tree_sha256).not.toBe(fixture.historical.site_tree_sha256);
    expect(currentProof.evidence).toEqual(fixture.historical.evidence);
    expect(fixture.validateHistorical()).toEqual([]);
    expect(readFileSync(fixture.regenerationPath, "utf8")).toBe(originalRegeneration);
    expect(readFileSync(fixture.evidencePath, "utf8")).toBe(fixture.evidenceContent);
  });

  test("rejects altered historical files and missing receipt bindings", () => {
    const fixture = machineEvidenceFixture();
    write(fixture.regenerationPath, `${readFileSync(fixture.regenerationPath, "utf8")}\n`);
    expect(fixture.validateHistorical().some((entry) => entry.message.includes("is not hash-bound by the acceptance receipt"))).toBe(true);
    fixture.bindings.delete(`${fixture.packageRelativePath}/closure-evidence.json`);
    expect(fixture.validateHistorical().filter((entry) => entry.message.includes("is not hash-bound by the acceptance receipt"))).toHaveLength(2);
  });

  test("rejects internally inconsistent regeneration even when its changed bytes are rebound", () => {
    const fixture = machineEvidenceFixture();
    const originalRegeneration = readFileSync(fixture.regenerationPath, "utf8");
    const mutations: Array<{ field: string; value: unknown; message: string }> = [
      { field: "closure_evidence_two_sha256", value: "b".repeat(64), message: "byte-identical pass-one/pass-two closure evidence" },
      { field: "regeneration_two_sha256", value: "b".repeat(64), message: "regeneration hashes do not bind" },
      { field: "closure_evidence_site_tree_sha256", value: "b".repeat(64), message: "site-tree hash does not bind" },
      { field: "artifacts", value: [], message: "regeneration receipt has an invalid shape" },
    ];
    for (const mutation of mutations) {
      const changed = JSON.parse(originalRegeneration) as Record<string, unknown>;
      changed[mutation.field] = mutation.value;
      write(fixture.regenerationPath, `${JSON.stringify(changed, null, 2)}\n`);
      fixture.bindings.set(`${fixture.packageRelativePath}/regeneration.json`, sha256(readFileSync(fixture.regenerationPath)));
      expect(fixture.validateHistorical().some((entry) => entry.message.includes(mutation.message))).toBe(true);
    }
  });

  test("rejects nonzero archived semantic evidence even when its file hash is rebound", () => {
    const fixture = machineEvidenceFixture();
    const failedEvidence = JSON.parse(fixture.evidenceContent) as Record<string, unknown>;
    failedEvidence.rejectedReaderLeaks = ["record:observation:rejected"];
    write(fixture.evidencePath, `${JSON.stringify(failedEvidence, null, 2)}\n`);
    fixture.bindings.set(`${fixture.packageRelativePath}/closure-evidence.json`, sha256(readFileSync(fixture.evidencePath)));
    expect(fixture.validateHistorical().some((entry) => entry.message === "rejectedReaderLeaks is not empty")).toBe(true);
  });

  test("historical acceptance cannot satisfy a failing current semantic closure proof", () => {
    const fixture = machineEvidenceFixture();
    write(join(fixture.root, "wiki/claims/fixture.md"), `\`\`\`yaml\nclaim_id: claim_fixture_0001\nobservation_ids: []\nreview_status: accepted\n\`\`\`\n`);
    expect(fixture.validateHistorical()).toEqual([]);
    expect(() => verifyOntologyClosureEvidenceFile(fixture.currentPaths)).toThrow("differs from deterministic recomputation");
  });
});

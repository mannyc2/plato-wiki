import { createHash } from "node:crypto";
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import {
  ontologyBaselineEvidenceContract,
  validateOntologyBaselineEvidence,
  type OntologyAuditConceptUnit,
  type OntologyAuditManifest,
  type OntologyBaselineEvidence,
} from "./ontology-audit.js";

const HASH = "a".repeat(64);
const COMMIT = "b".repeat(40);
const TREE = "c".repeat(40);
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

function keySetSha256(keys: readonly string[]) {
  const sorted = [...keys].sort();
  return sha256(sorted.length === 0 ? "" : `${sorted.join("\n")}\n`);
}

function write(path: string, content: string | Uint8Array) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "ontology-baseline-evidence-test-"));
  roots.push(root);
  const packagePath = join(root, `wiki/ontology-audits/sha256-${HASH}`);
  const packageLogicalPath = relative(root, packagePath).split("\\").join("/");
  const projectionContent = "projection\n";
  const projection = {
    path: "wiki/clusters/fixture.md",
    sha256: sha256(projectionContent),
    bytes: Buffer.byteLength(projectionContent),
    projection: "clusters",
    generator_id: "clusters" as const,
  };
  const support = {
    path: "derived/plato/turns/sigla.toml",
    sha256: HASH,
    bytes: 1,
    role: "generator_input" as const,
  };
  const manifest = {
    schema_version: 1,
    snapshot_id: `sha256-${HASH}`,
    audit_state: "pending",
    baseline: {
      git_commit: COMMIT,
      git_tree: TREE,
      corpus_digest: HASH,
      canonical_inputs: [],
      greek_sources: [],
      support_inputs: [support],
      counts: {},
      owned_key_count: 0,
      owned_key_set_sha256: HASH,
    },
    schema: { implementation_path: "fixture", implementation_sha256: HASH },
    protocol: { path: "fixture", sha256: HASH },
    projections: [projection],
    baseline_evidence: null,
    partitions: {},
    lane_states: [],
    acceptance_path: "acceptance.json",
  } as unknown as OntologyAuditManifest;
  const baselinePointer = { path: "wiki/features-so-far.md", ordinal: 0, raw_sha256: HASH, review_status: null };
  const membershipKey = "membership:observation:obs_fixture_0001";
  const conceptKey = "concept:registry:0000:feature_fixture";
  const concepts: OntologyAuditConceptUnit[] = [
    {
      key: conceptKey,
      kind: "concept",
      concept_id: "feature_fixture",
      axis_key: "axis:legacy-family:fixture",
      legacy_family: "fixture",
      legacy_label: "fixture",
      comparison_question: null,
      registry_membership_key_set_sha256: keySetSha256([membershipKey]),
      baseline: baselinePointer,
      final: null,
      change: "removed",
      audit_state: "complete",
    },
    {
      key: membershipKey,
      kind: "membership",
      observation_key: "record:observation:obs_fixture_0001",
      concept_key: conceptKey,
      legacy_family: "fixture",
      legacy_label: "fixture",
      baseline: baselinePointer,
      final: null,
      change: "removed",
      audit_state: "complete",
    },
  ];
  const commandEvidence = (
    prefix: string,
    commands: readonly { id: string; argv: readonly string[] }[],
  ) => commands.map(({ id, argv }) => {
    const stdoutPath = `${packageLogicalPath}/baseline-evidence/${prefix}-${id}.stdout.log`;
    const stderrPath = `${packageLogicalPath}/baseline-evidence/${prefix}-${id}.stderr.log`;
    write(join(root, stdoutPath), "");
    write(join(root, stderrPath), "");
    return {
      id,
      argv: [...argv],
      exit_code: 0,
      outcome: "passed" as const,
      stdout: { path: stdoutPath, sha256: sha256(""), bytes: 0 },
      stderr: { path: stderrPath, sha256: sha256(""), bytes: 0 },
    };
  });
  const contract = ontologyBaselineEvidenceContract();
  const runDigest = sha256(canonicalJson([{
    path: projection.path,
    sha256: projection.sha256,
    bytes: projection.bytes,
  }]));
  const evidence: OntologyBaselineEvidence = {
    schema_version: 1,
    state: "complete",
    snapshot_id: manifest.snapshot_id,
    baseline: {
      git_commit: COMMIT,
      git_tree: TREE,
      corpus_digest: HASH,
      bun_version: "1.3.9",
      bun_lock_sha256: HASH,
      platform: "fixture",
      arch: "fixture",
    },
    support_inputs: [support],
    registry_projection: { concepts_checked: 1, memberships_checked: 1, mismatches: 0 },
    validation: {
      all_passed: true,
      commands: commandEvidence("validation", contract.validationCommands),
    },
    projection_replay: {
      artifact_count: 1,
      path_set_sha256: keySetSha256([projection.path]),
      run_one_sha256: runDigest,
      run_two_sha256: runDigest,
      byte_stable: true,
      exact_snapshot_match: true,
      run_one_commands: commandEvidence("projection-one", contract.projectionGenerators),
      run_two_commands: commandEvidence("projection-two", contract.projectionGenerators),
      artifacts: [{
        path: projection.path,
        generator_id: projection.generator_id,
        bytes: projection.bytes,
        expected_sha256: projection.sha256,
        run_one_sha256: projection.sha256,
        run_two_sha256: projection.sha256,
      }],
    },
  };
  const evidencePath = join(packagePath, "baseline-evidence.json");
  const persist = () => {
    write(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    manifest.baseline_evidence = { path: "baseline-evidence.json", sha256: sha256(readFileSync(evidencePath)) };
  };
  persist();
  return { root, packagePath, manifest, concepts, evidence, persist, support };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("snapshot-bound baseline evidence", () => {
  test("orders projection generators by their declared derived-data dependencies", () => {
    const ids = ontologyBaselineEvidenceContract().projectionGenerators.map((entry) => entry.id);
    expect(ids.indexOf("stephanus")).toBeLessThan(ids.indexOf("turns"));
    expect(ids.indexOf("turns")).toBeLessThan(ids.indexOf("tokens"));
    expect(ids.indexOf("tokens")).toBeLessThan(ids.indexOf("anchors"));
    expect(ids.indexOf("anchors")).toBeLessThan(ids.indexOf("anchors-report"));
    expect(ids.indexOf("tokens")).toBeLessThan(ids.indexOf("metrics"));
  });

  test("accepts exact validation logs, registry membership equality, and two projection replays", () => {
    const value = fixture();
    expect(validateOntologyBaselineEvidence({
      repoRoot: value.root,
      packagePath: value.packagePath,
      manifest: value.manifest,
      concepts: value.concepts,
      baselineLockSha256: HASH,
    })).toEqual([]);
  });

  test("records a terminal baseline validation failure without converting it into a projection failure", () => {
    const value = fixture();
    value.evidence.validation.commands[0]!.exit_code = 1;
    value.evidence.validation.commands[0]!.outcome = "failed";
    value.evidence.validation.all_passed = false;
    value.persist();
    expect(validateOntologyBaselineEvidence({
      repoRoot: value.root,
      packagePath: value.packagePath,
      manifest: value.manifest,
      concepts: value.concepts,
      baselineLockSha256: HASH,
    })).toEqual([]);
  });

  test("rejects registry drift and replay bytes that differ from the frozen projection", () => {
    const value = fixture();
    const concept = value.concepts[0] as Extract<OntologyAuditConceptUnit, { kind: "concept" }>;
    concept.registry_membership_key_set_sha256 = HASH;
    value.evidence.projection_replay.artifacts[0]!.run_two_sha256 = HASH;
    value.persist();
    const issues = validateOntologyBaselineEvidence({
      repoRoot: value.root,
      packagePath: value.packagePath,
      manifest: value.manifest,
      concepts: value.concepts,
      baselineLockSha256: HASH,
    });
    expect(issues.some((entry) => entry.message.includes("registry membership list differs"))).toBe(true);
    expect(issues.some((entry) => entry.message.includes("replay bytes differ"))).toBe(true);
  });

  test("rejects static support material falsely classified as a projection", () => {
    const value = fixture();
    value.manifest.projections.push({
      path: value.support.path,
      sha256: value.support.sha256,
      bytes: value.support.bytes,
      projection: "derived/plato/turns/sigla.toml",
      generator_id: "turns",
    });
    const issues = validateOntologyBaselineEvidence({
      repoRoot: value.root,
      packagePath: value.packagePath,
      manifest: value.manifest,
      concepts: value.concepts,
      baselineLockSha256: HASH,
    });
    expect(issues.some((entry) => entry.message.includes("both support material and a claimed projection"))).toBe(true);
  });
});

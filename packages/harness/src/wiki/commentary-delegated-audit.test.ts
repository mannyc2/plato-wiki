import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "../commentary-authoring.js";
import { applyCommentaryDelegatedAudit, parseCommentaryDelegatedAuditCandidate, previewCommentaryDelegatedAudit, readCurrentCommentaryDelegatedAudit, validateCommentaryDelegatedAuditSubmission } from "./commentary-delegated-audit.js";
import type { CommentaryCampaignJob } from "../commentary-campaign.js";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const briefPath = "scratch/commentary/audit-briefs/fixture/01.json";
const briefContent = "brief\n";
let root = "";
let restore: (() => void) | undefined;

function job(): CommentaryCampaignJob {
  return {
    schema_version: 3, job_id: "audit:fixture:01", stage: "audit", dialogue: "fixture", unit_key: "01", section_id: "comm_fixture_0001",
    commentary_ids: ["comm_fixture_0001"], audit_brief_path: briefPath, audit_brief_sha256: sha256(briefContent),
    model_argument: COMMENTARY_AUTHORING_MODEL, codex_cli_version: "0.147.0", model_catalog_path: "packages/harness/src/commentary-luna-model-catalog.json", model_catalog_sha256: "b".repeat(64),
    authoring_model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit, permission_mode: "read-only", session_name: "fixture",
    input_files: [], prompt: "fixture", prompt_sha256: "c".repeat(64), output_schema_sha256: "d".repeat(64), input_sha256: "e".repeat(64),
    output_path: "scratch/commentary/audits/fixture/01.json", state_path: "scratch/commentary/campaign-state/fixture/audit-01.json",
    command: { executable: "codex", args: [] }, serial_handoff: [],
  };
}

function output() {
  return {
    schema_version: 3, dialogue: "fixture", unit_key: "01", section_id: "comm_fixture_0001",
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit }, unit_verdict: "pass",
    blocks: [{ commentary_id: "comm_fixture_0001", disposition: "pass", issue_codes: [],
      checks: { evidence: { verdict: "pass" }, placement: { verdict: "pass", hazard_codes: [] }, listening: { verdict: "pass" } },
      rationale: "This block earns its place in the listening sequence." }],
  };
}

function candidate() {
  const value = output();
  return {
    schema_version: 1, dialogue: "fixture", unit_key: "01",
    job: { job_id: "audit:fixture:01", input_sha256: "e".repeat(64), audit_brief_path: briefPath, audit_brief_sha256: sha256(briefContent), output_path: "scratch/commentary/audits/fixture/01.json", output_schema_sha256: "d".repeat(64) },
    output: value, output_sha256: sha256(JSON.stringify(value, null, 2) + "\n"),
    provenance: { auditor: "fixture-delegated-luna-auditor-test", model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit, source: "operator-delegated", human_listening_or_review: "none claimed" },
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "delegated-audit-"));
  restore = setRepoRootForTesting(root);
  mkdirSync(join(root, "scratch/commentary/audit-briefs/fixture"), { recursive: true });
  writeFileSync(join(root, briefPath), briefContent);
});
afterEach(() => { restore?.(); rmSync(root, { recursive: true, force: true }); });

describe("delegated commentary audit import", () => {
  function applyFixture() {
    const path = "scratch/commentary/delegated-audits/fixture/01.json";
    mkdirSync(join(root, "scratch/commentary/delegated-audits/fixture"), { recursive: true });
    writeFileSync(join(root, path), JSON.stringify(candidate(), null, 2) + "\n");
    return { path, result: applyCommentaryDelegatedAudit({ job: job(), candidatePath: path }) };
  }

  it("parses an exact current candidate and preview writes nothing", () => {
    const path = "scratch/commentary/delegated-audits/fixture/01.json";
    mkdirSync(join(root, "scratch/commentary/delegated-audits/fixture"), { recursive: true });
    writeFileSync(join(root, path), JSON.stringify(candidate(), null, 2) + "\n");
    const result = previewCommentaryDelegatedAudit({ job: job(), candidatePath: path });
    expect(result.applied).toBe(false);
    expect(existsSync(join(root, "wiki/submissions"))).toBe(false);
    expect(existsSync(join(root, "scratch/commentary/campaign-state"))).toBe(false);
  });

  it("rejects unknown fields, stale hashes, and human claims", () => {
    const value = candidate() as Record<string, unknown>;
    value.extra = true;
    expect(() => parseCommentaryDelegatedAuditCandidate(value, job())).toThrow("exactly");
    const stale = candidate() as Record<string, any>;
    stale.job.input_sha256 = "f".repeat(64);
    expect(() => parseCommentaryDelegatedAuditCandidate(stale, job())).toThrow("stale");
    const human = candidate() as Record<string, any>;
    human.provenance.human_listening_or_review = "human listened";
    expect(() => parseCommentaryDelegatedAuditCandidate(human, job())).toThrow("none claimed");
    const unidentified = candidate() as Record<string, any>;
    unidentified.provenance.auditor = "anonymous";
    expect(() => parseCommentaryDelegatedAuditCandidate(unidentified, job())).toThrow("Luna auditor");
  });

  it("applies one durable output and reuses it without state or usage artifacts", () => {
    const { path, result } = applyFixture();
    expect(result.applied).toBe(true);
    expect(existsSync(join(root, result.durableOutputPath))).toBe(true);
    expect(existsSync(join(root, result.submissionRecordPath))).toBe(true);
    expect(readCurrentCommentaryDelegatedAudit(job())?.source).toBe("delegated_import");
    expect(existsSync(join(root, "scratch/commentary/campaign-state"))).toBe(false);
    expect(existsSync(join(root, "scratch/commentary/audits"))).toBe(false);
    expect(existsSync(join(root, "scratch/commentary", result.unitKey + ".usage.json"))).toBe(false);
    expect(() => applyCommentaryDelegatedAudit({ job: job(), candidatePath: path })).toThrow("overwrite");
    rmSync(join(root, path));
    rmSync(join(root, briefPath));
    expect(readCurrentCommentaryDelegatedAudit(job())?.source).toBe("delegated_import");
  });

  it("requires exact normalized candidate bytes at apply time", () => {
    const path = "scratch/commentary/delegated-audits/fixture/01.json";
    mkdirSync(join(root, "scratch/commentary/delegated-audits/fixture"), { recursive: true });
    writeFileSync(join(root, path), JSON.stringify(candidate()));
    expect(() => previewCommentaryDelegatedAudit({ job: job(), candidatePath: path })).toThrow("normalized");
  });

  it("rejects mutated outer, source, cross-unit, and traversal receipt bindings", () => {
    const { result } = applyFixture();
    const recordPath = join(root, result.submissionRecordPath);
    const original = readFileSync(recordPath, "utf8");
    const mutations = [
      (value: Record<string, any>) => { value.target_sha256_after = "0".repeat(64); },
      (value: Record<string, any>) => { value.source_sha256 = "0".repeat(64); },
      (value: Record<string, any>) => { value.submission.unit_key = "other"; },
      (value: Record<string, any>) => { value.source_path = "scratch/commentary/delegated-audits/fixture/../other.json"; },
    ];
    for (const mutate of mutations) {
      const value = JSON.parse(original) as Record<string, any>;
      mutate(value);
      writeFileSync(recordPath, JSON.stringify(value, null, 2) + "\n");
      expect(readCurrentCommentaryDelegatedAudit(job())).toBeUndefined();
    }
    writeFileSync(recordPath, original);
    expect(() => validateCommentaryDelegatedAuditSubmission({
      recordPath: "wiki/submissions/commentary-audit/fixture/./0001-delegated-audit-01.json",
      job: job(),
    })).toThrow("traversal");
  });
});

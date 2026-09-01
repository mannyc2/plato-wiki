import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { buildSemanticDefectsReport, renderSemanticDefectsReport } from "./semantic-defects-report.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "semantic-defects-report-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  mkdirSync(join(root, "wiki/relations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/observations/cratylus.md"),
    "```yaml\nobservation_id: obs_cratylus_0001\nreview_status: accepted\n```\n",
    "utf8",
  );
  writeFileSync(
    join(root, "wiki/commentary/cratylus.md"),
    [
      "```yaml",
      "commentary_id: comm_cratylus_0001",
      "block_kind: argument",
      "review_status: accepted",
      "cites:",
      "  observations: []",
      "  claims: []",
      "  relations: []",
      "  dossiers: []",
      "```",
      "",
      "```yaml",
      "commentary_id: comm_cratylus_0002",
      "block_kind: argument",
      "review_status: rejected",
      "cites:",
      "  observations: []",
      "  claims: []",
      "  relations: []",
      "  dossiers: []",
      "```",
      "",
      "```yaml",
      "commentary_id: comm_cratylus_0003",
      "block_kind: argument",
      "review_status: accepted",
      "cites:",
      "  observations: [obs_cratylus_0001]",
      "  claims: []",
      "  relations: []",
      "  dossiers: []",
      "```",
    ].join("\n"),
    "utf8",
  );
  writeFileSync(
    join(root, "wiki/relations/cross-dialogue.md"),
    [
      "```yaml",
      "relation_id: rel_cross-dialogue_0011",
      "basis: No substantive relation connects the frameworks; this was filed as a restatement for schema compliance.",
      "limits: Effectively a non-relation.",
      "review_status: accepted",
      "```",
      "",
      "```yaml",
      "relation_id: rel_cross-dialogue_0012",
      "basis: No substantive relation is asserted.",
      "limits: Rejected decision retained as provenance.",
      "review_status: rejected",
      "```",
    ].join("\n"),
    "utf8",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("semantic defects report", () => {
  it("lists each affected canonical id and path in stable order", () => {
    const report = buildSemanticDefectsReport();

    expect(report).toEqual({
      version: 1,
      total: 2,
      counts: {
        accepted_commentary_missing_citation: 1,
        accepted_relation_denial: 1,
        accepted_claim_missing_observation: 0,
        accepted_claim_invalid_observation: 0,
      },
      entries: [
        {
          kind: "accepted_commentary_missing_citation",
          id: "comm_cratylus_0001",
          path: "wiki/commentary/cratylus.md",
          reason: "accepted commentary has no resolving canonical observation, claim, relation, or dossier citation",
        },
        {
          kind: "accepted_relation_denial",
          id: "rel_cross-dialogue_0011",
          path: "wiki/relations/cross-dialogue.md",
          reason: "basis explicitly denies the semantic edge (schema_compliance)",
        },
      ],
    });
    expect(renderSemanticDefectsReport(report)).toBe(
      [
        "semantic_defects_version=1",
        "semantic_defects_total=2",
        "accepted_commentary_missing_citation=1",
        "accepted_relation_denial=1",
        "accepted_claim_missing_observation=0",
        "accepted_claim_invalid_observation=0",
        "records:",
        "- accepted_commentary_missing_citation\tcomm_cratylus_0001\twiki/commentary/cratylus.md\taccepted commentary has no resolving canonical observation, claim, relation, or dossier citation",
        "- accepted_relation_denial\trel_cross-dialogue_0011\twiki/relations/cross-dialogue.md\tbasis explicitly denies the semantic edge (schema_compliance)",
      ].join("\n"),
    );
  });
});

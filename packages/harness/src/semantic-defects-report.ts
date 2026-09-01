import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { claimMarkdownBlocks, listClaimLedgerPaths } from "./wiki/claim-ledger.js";
import { commentaryMarkdownBlocks, listCommentaryLedgerPaths } from "./wiki/commentary-ledger.js";
import {
  acceptedCommentaryMissingCanonicalCitation,
  buildCommentaryCitationIndex,
} from "./wiki/commentary-validator.js";
import { listRelationLedgerPaths, relationMarkdownBlocks } from "./wiki/relation-ledger.js";
import { acceptedRelationDenial } from "./wiki/relation-validator.js";
import { fieldValue, listFieldValue, listObservationLedgerPaths, observationYamlBlocks } from "./wiki/observation-ledger.js";

export const SEMANTIC_DEFECT_KINDS = [
  "accepted_commentary_missing_citation",
  "accepted_relation_denial",
  "accepted_claim_missing_observation",
  "accepted_claim_invalid_observation",
] as const;

export type SemanticDefectKind = (typeof SEMANTIC_DEFECT_KINDS)[number];

export type SemanticDefectEntry = {
  kind: SemanticDefectKind;
  id: string;
  path: string;
  reason: string;
};

export type SemanticDefectsReport = {
  version: 1;
  total: number;
  counts: Record<SemanticDefectKind, number>;
  entries: SemanticDefectEntry[];
};

function compareEntries(a: SemanticDefectEntry, b: SemanticDefectEntry) {
  return (
    SEMANTIC_DEFECT_KINDS.indexOf(a.kind) - SEMANTIC_DEFECT_KINDS.indexOf(b.kind) ||
    a.path.localeCompare(b.path) ||
    a.id.localeCompare(b.id)
  );
}

export function buildSemanticDefectsReport(): SemanticDefectsReport {
  const repoRoot = getRepoRoot();
  const entries: SemanticDefectEntry[] = [];
  const citationIndex = buildCommentaryCitationIndex();
  const observationStatuses = new Map<string, string>();
  for (const path of listObservationLedgerPaths().sort()) {
    const content = readFileSync(join(repoRoot, path), "utf8");
    for (const block of observationYamlBlocks(content)) {
      const observationId = fieldValue(block, "observation_id");
      const reviewStatus = fieldValue(block, "review_status");
      if (observationId && reviewStatus) observationStatuses.set(observationId, reviewStatus);
    }
  }

  for (const path of listClaimLedgerPaths().sort()) {
    const content = readFileSync(join(repoRoot, path), "utf8");
    for (const block of claimMarkdownBlocks(content)) {
      if (!block.claimId || fieldValue(block.content, "review_status") !== "accepted") continue;
      const observationIds = listFieldValue(block.content, "observation_ids");
      if (observationIds.length === 0) {
        entries.push({
          kind: "accepted_claim_missing_observation",
          id: block.claimId,
          path,
          reason: "accepted claim has no source-bound observation linkage",
        });
        continue;
      }
      const invalid = observationIds.filter((observationId) => observationStatuses.get(observationId) !== "accepted");
      if (invalid.length > 0) {
        entries.push({
          kind: "accepted_claim_invalid_observation",
          id: block.claimId,
          path,
          reason: `accepted claim cites missing or non-accepted observations: ${invalid.join(", ")}`,
        });
      }
    }
  }

  for (const path of listCommentaryLedgerPaths().sort()) {
    const content = readFileSync(join(repoRoot, path), "utf8");
    for (const block of commentaryMarkdownBlocks(content)) {
      if (!block.commentaryId) continue;
      if (!acceptedCommentaryMissingCanonicalCitation(block.content, citationIndex)) continue;
      entries.push({
        kind: "accepted_commentary_missing_citation",
        id: block.commentaryId,
        path,
        reason: "accepted commentary has no resolving canonical observation, claim, relation, or dossier citation",
      });
    }
  }

  for (const path of listRelationLedgerPaths().sort()) {
    const content = readFileSync(join(repoRoot, path), "utf8");
    for (const block of relationMarkdownBlocks(content)) {
      if (!block.relationId) continue;
      const denial = acceptedRelationDenial(block.content);
      if (!denial) continue;
      entries.push({
        kind: "accepted_relation_denial",
        id: block.relationId,
        path,
        reason: `${denial.field} explicitly denies the semantic edge (${denial.rule})`,
      });
    }
  }

  entries.sort(compareEntries);
  const counts: Record<SemanticDefectKind, number> = {
    accepted_commentary_missing_citation: 0,
    accepted_relation_denial: 0,
    accepted_claim_missing_observation: 0,
    accepted_claim_invalid_observation: 0,
  };
  for (const entry of entries) counts[entry.kind] += 1;
  return { version: 1, total: entries.length, counts, entries };
}

export function renderSemanticDefectsReport(report: SemanticDefectsReport) {
  return [
    `semantic_defects_version=${report.version}`,
    `semantic_defects_total=${report.total}`,
    ...SEMANTIC_DEFECT_KINDS.map((kind) => `${kind}=${report.counts[kind]}`),
    "records:",
    ...(report.entries.length === 0
      ? ["- none"]
      : report.entries.map((entry) => `- ${entry.kind}\t${entry.id}\t${entry.path}\t${entry.reason}`)),
  ].join("\n");
}

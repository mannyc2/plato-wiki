import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { normalizeGreekToken } from "./derived/tokens.js";
import { getRepoRoot } from "./paths.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./wiki/claim-ledger.js";
import { fieldValue, listFieldValue, nestedFieldValue } from "./wiki/observation-ledger.js";
import { relationYamlBlocks } from "./wiki/relation-ledger.js";

export type RelationClaim = {
  claimId: string;
  dialogue: string;
  claimKind: string;
  speaker: string;
  content: string;
  greekTerms: string[];
  normalizedTerms: string[];
  finalStatus: string;
  reviewStatus: string;
  startChar: number | undefined;
  endChar: number | undefined;
};

export type RelationCandidate = {
  candidate_key: string;
  pair_id: string;
  scope: string;
  claim_a: string;
  claim_b: string;
  shared_terms: string[];
};

export type RelationCandidateReport = {
  params: {
    intra_kinds: string[];
    cross_kinds: string[];
    cross_final_statuses: string[];
  };
  counts: {
    total: number;
    by_scope: Record<string, number>;
  };
  entries: RelationCandidate[];
};

export type RelationClaimRecord = RelationClaim & {
  stephanusSpan: string;
  sourceWork: string;
  block: string;
};

export type SegmentedRelationBatch = {
  scope: string;
  index: number;
  targets: RelationCandidateTarget[];
  candidateKeys: string[];
  diagnosticPairIds: string[];
  summary: string;
};

export type RelationCandidateTarget = {
  candidateKey: string;
  claimA: string;
  claimB: string;
  diagnosticPairId: string;
};

export type RelationReviewTarget = {
  relationId: string;
  pairId: string;
  claimA: string;
  claimB: string;
  relationKind: string;
  resolution: string;
  reviewStatus: string;
  block: string;
};

export type SegmentedRelationReviewBatch = {
  scope: string;
  index: number;
  relationIds: string[];
  summary: string;
};

const INTRA_KIND_PAIRS = new Set([
  "definition::definition",
  "definition::thesis",
  "method_rule::method_rule",
  "thesis::definition",
  "thesis::thesis",
]);
const CROSS_KINDS = new Set(["definition", "thesis"]);
const CROSS_FINAL_STATUSES = new Set(["left_standing", "revised"]);

function numberField(value: string | undefined) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function normalizeTerms(terms: string[]) {
  return [...new Set(terms.map((term) => normalizeGreekToken(term)).filter(Boolean))].sort();
}

function sharedTerms(a: RelationClaim, b: RelationClaim) {
  const bTerms = new Set(b.normalizedTerms);
  return a.normalizedTerms.filter((term) => bTerms.has(term)).sort();
}

export function loadAcceptedRelationClaims(): RelationClaim[] {
  const claims: RelationClaim[] = [];
  for (const path of listClaimLedgerPaths({ absolute: true })) {
    const dialogue = basename(path, ".md");
    for (const block of claimYamlBlocks(readFileSync(path, "utf8"))) {
      const claimId = fieldValue(block, "claim_id");
      const reviewStatus = fieldValue(block, "review_status") || "unreviewed";
      if (!claimId || reviewStatus !== "accepted") continue;

      const greekTerms = listFieldValue(block, "greek_terms");
      claims.push({
        claimId,
        dialogue,
        claimKind: fieldValue(block, "claim_kind") ?? "",
        speaker: fieldValue(block, "speaker") ?? "",
        content: fieldValue(block, "content") ?? "",
        greekTerms,
        normalizedTerms: normalizeTerms(greekTerms),
        finalStatus: fieldValue(block, "final_status") ?? "",
        reviewStatus,
        startChar: numberField(nestedFieldValue(block, "start_char")),
        endChar: numberField(nestedFieldValue(block, "end_char")),
      });
    }
  }
  return claims.sort((a, b) => a.dialogue.localeCompare(b.dialogue) || a.claimId.localeCompare(b.claimId));
}

export function loadAcceptedRelationClaimRecords(): Map<string, RelationClaimRecord> {
  const claims = new Map<string, RelationClaimRecord>();
  for (const path of listClaimLedgerPaths({ absolute: true })) {
    const dialogue = basename(path, ".md");
    for (const block of claimYamlBlocks(readFileSync(path, "utf8"))) {
      const claimId = fieldValue(block, "claim_id");
      const reviewStatus = fieldValue(block, "review_status") || "unreviewed";
      if (!claimId || reviewStatus !== "accepted") continue;

      const greekTerms = listFieldValue(block, "greek_terms");
      claims.set(claimId, {
        claimId,
        dialogue,
        claimKind: fieldValue(block, "claim_kind") ?? "",
        speaker: fieldValue(block, "speaker") ?? "",
        content: fieldValue(block, "content") ?? "",
        greekTerms,
        normalizedTerms: normalizeTerms(greekTerms),
        finalStatus: fieldValue(block, "final_status") ?? "",
        reviewStatus,
        startChar: numberField(nestedFieldValue(block, "start_char")),
        endChar: numberField(nestedFieldValue(block, "end_char")),
        stephanusSpan: fieldValue(block, "stephanus_span") ?? "",
        sourceWork: fieldValue(block, "source_work") ?? "",
        block,
      });
    }
  }
  return new Map([...claims.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function shouldConsiderIntra(a: RelationClaim, b: RelationClaim) {
  return INTRA_KIND_PAIRS.has(`${a.claimKind}::${b.claimKind}`) && sharedTerms(a, b).length > 0;
}

function shouldConsiderCross(a: RelationClaim, b: RelationClaim) {
  return (
    CROSS_KINDS.has(a.claimKind) &&
    CROSS_KINDS.has(b.claimKind) &&
    CROSS_FINAL_STATUSES.has(a.finalStatus) &&
    CROSS_FINAL_STATUSES.has(b.finalStatus) &&
    sharedTerms(a, b).length > 0
  );
}

function pairId(scope: string, index: number) {
  const normalizedScope = scope.replace(/[^a-z0-9-]/gu, "-");
  return `pair_${normalizedScope}_${String(index).padStart(5, "0")}`;
}

/**
 * The immutable identity of a relation candidate. `pair_id` is an ordinal
 * diagnostic label and changes when an earlier candidate is inserted.
 */
export function relationCandidateKey(scope: string, claimA: string, claimB: string) {
  const [left, right] = claimA.localeCompare(claimB) <= 0 ? [claimA, claimB] : [claimB, claimA];
  return `${scope}::${left}::${right}`;
}

export function buildRelationCandidates(claims = loadAcceptedRelationClaims()): RelationCandidateReport {
  const entries: RelationCandidate[] = [];
  const byScope = new Map<string, RelationCandidate[]>();

  const addCandidate = (scope: string, claimA: RelationClaim, claimB: RelationClaim) => {
    const scopeEntries = byScope.get(scope) ?? [];
    const ordered = claimA.claimId.localeCompare(claimB.claimId) <= 0 ? [claimA, claimB] : [claimB, claimA];
    const next: RelationCandidate = {
      candidate_key: relationCandidateKey(scope, ordered[0]!.claimId, ordered[1]!.claimId),
      pair_id: pairId(scope, scopeEntries.length + 1),
      scope,
      claim_a: ordered[0]!.claimId,
      claim_b: ordered[1]!.claimId,
      shared_terms: sharedTerms(ordered[0]!, ordered[1]!),
    };
    scopeEntries.push(next);
    byScope.set(scope, scopeEntries);
  };

  for (const [dialogue, dialogueClaims] of [...new Map([...new Set(claims.map((claim) => claim.dialogue))].map((dialogue) => [dialogue, claims.filter((claim) => claim.dialogue === dialogue)] as const)).entries()].sort()) {
    for (let i = 0; i < dialogueClaims.length; i += 1) {
      for (let j = i + 1; j < dialogueClaims.length; j += 1) {
        const claimA = dialogueClaims[i]!;
        const claimB = dialogueClaims[j]!;
        if (shouldConsiderIntra(claimA, claimB)) addCandidate(dialogue, claimA, claimB);
      }
    }
  }

  const crossClaims = claims.filter((claim) => CROSS_KINDS.has(claim.claimKind) && CROSS_FINAL_STATUSES.has(claim.finalStatus));
  for (let i = 0; i < crossClaims.length; i += 1) {
    for (let j = i + 1; j < crossClaims.length; j += 1) {
      const claimA = crossClaims[i]!;
      const claimB = crossClaims[j]!;
      if (claimA.dialogue === claimB.dialogue) continue;
      if (shouldConsiderCross(claimA, claimB)) addCandidate("cross-dialogue", claimA, claimB);
    }
  }

  for (const [, scopeEntries] of [...byScope.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    entries.push(...scopeEntries);
  }

  return {
    params: {
      intra_kinds: [...INTRA_KIND_PAIRS].sort(),
      cross_kinds: [...CROSS_KINDS].sort(),
      cross_final_statuses: [...CROSS_FINAL_STATUSES].sort(),
    },
    counts: {
      total: entries.length,
      by_scope: Object.fromEntries([...byScope.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([scope, scopeEntries]) => [scope, scopeEntries.length])),
    },
    entries,
  };
}

export function relationCandidateReportPath(date = new Date().toISOString().slice(0, 10)) {
  return `wiki/review/${date}-relation-candidates/candidates.json`;
}

export function writeRelationCandidates(report = buildRelationCandidates(), path = relationCandidateReportPath()) {
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return { path, report };
}

function relationLedgerPath(scope: string) {
  return join(getRepoRoot(), "wiki/relations", `${scope}.md`);
}

function assertCandidateKeysForScope(scope: string, candidateKeys: readonly string[]) {
  for (const candidateKey of candidateKeys) {
    const parts = candidateKey.split("::");
    const [keyScope, claimA, claimB] = parts;
    if (
      parts.length !== 3 ||
      keyScope !== scope ||
      !claimA ||
      !claimB ||
      candidateKey !== relationCandidateKey(scope, claimA, claimB)
    ) {
      throw new Error(`Invalid relation candidate key for ${scope}: ${candidateKey}. Use scope::ordered_claim_a::claim_b.`);
    }
  }
}

function relationCandidateKeyCounts(scope: string) {
  const path = relationLedgerPath(scope);
  if (!existsSync(path)) return new Map<string, number>();

  const counts = new Map<string, number>();
  for (const block of relationYamlBlocks(readFileSync(path, "utf8"))) {
    const claimA = fieldValue(block, "claim_a");
    const claimB = fieldValue(block, "claim_b");
    if (!claimA || !claimB) continue;

    const candidateKey = relationCandidateKey(scope, claimA, claimB);
    counts.set(candidateKey, (counts.get(candidateKey) ?? 0) + 1);
  }

  return counts;
}

function relationCandidateKeys(scope: string) {
  return new Set(relationCandidateKeyCounts(scope).keys());
}

function relationRecords(scope: string): RelationReviewTarget[] {
  const path = relationLedgerPath(scope);
  if (!existsSync(path)) return [];

  return relationYamlBlocks(readFileSync(path, "utf8"))
    .map((block) => ({
      relationId: fieldValue(block, "relation_id") ?? "",
      pairId: fieldValue(block, "pair_id") ?? "",
      claimA: fieldValue(block, "claim_a") ?? "",
      claimB: fieldValue(block, "claim_b") ?? "",
      relationKind: fieldValue(block, "relation_kind") ?? "",
      resolution: fieldValue(block, "resolution") ?? "",
      reviewStatus: fieldValue(block, "review_status") || "unreviewed",
      block,
    }))
    .filter((target) => target.relationId)
    .sort((a, b) => a.relationId.localeCompare(b.relationId));
}

function candidateSummary(candidate: RelationCandidate, claims: Map<string, RelationClaimRecord>) {
  const claimA = claims.get(candidate.claim_a);
  const claimB = claims.get(candidate.claim_b);
  if (!claimA || !claimB) {
    throw new Error(`Missing accepted claim record for relation candidate ${candidate.candidate_key}`);
  }

  return [
    `--- ${candidate.candidate_key}`,
    `scope=${candidate.scope}; candidate_key=${candidate.candidate_key}; diagnostic_pair_id=${candidate.pair_id}; shared_terms=${candidate.shared_terms.join(", ") || "(none)"}`,
    `claim_a=${candidate.claim_a}; claim_b=${candidate.claim_b}`,
    "",
    `claim_a_record:`,
    "```yaml",
    claimA.block.trim(),
    "```",
    "",
    `claim_b_record:`,
    "```yaml",
    claimB.block.trim(),
    "```",
  ].join("\n");
}

export function planSegmentedRelations(
  scope: string,
  targetPairs = 20,
  onlyCandidateKeys?: readonly string[],
): SegmentedRelationBatch[] {
  if (!Number.isInteger(targetPairs) || targetPairs <= 0) {
    throw new Error("targetPairs must be a positive integer");
  }

  const claims = loadAcceptedRelationClaimRecords();
  const coveredCandidateKeys = relationCandidateKeys(scope);
  if (onlyCandidateKeys !== undefined) assertCandidateKeysForScope(scope, onlyCandidateKeys);
  const pinnedCandidateKeys = onlyCandidateKeys === undefined ? undefined : new Set(onlyCandidateKeys);
  const candidates = buildRelationCandidates([...claims.values()])
    .entries
    .filter(
      (candidate) =>
        candidate.scope === scope &&
        !coveredCandidateKeys.has(candidate.candidate_key) &&
        (pinnedCandidateKeys === undefined || pinnedCandidateKeys.has(candidate.candidate_key)),
    );
  const batches: SegmentedRelationBatch[] = [];

  for (let start = 0; start < candidates.length; start += targetPairs) {
    const batch = candidates.slice(start, start + targetPairs);
    batches.push({
      scope,
      index: batches.length + 1,
      targets: batch.map((candidate) => ({
        candidateKey: candidate.candidate_key,
        claimA: candidate.claim_a,
        claimB: candidate.claim_b,
        diagnosticPairId: candidate.pair_id,
      })),
      candidateKeys: batch.map((candidate) => candidate.candidate_key),
      diagnosticPairIds: batch.map((candidate) => candidate.pair_id),
      summary: batch.map((candidate) => candidateSummary(candidate, claims)).join("\n\n"),
    });
  }

  return batches;
}

export function relationCandidateKeysComplete(scope: string, candidateKeys: readonly string[]) {
  assertCandidateKeysForScope(scope, candidateKeys);
  const counts = relationCandidateKeyCounts(scope);
  return candidateKeys.every((candidateKey) => counts.get(candidateKey) === 1);
}

export function relationReviewTargets(scope: string): RelationReviewTarget[] {
  return relationRecords(scope);
}

export function relationReviewTargetIdsComplete(scope: string, relationIds: string[]) {
  const byId = new Map(relationRecords(scope).map((target) => [target.relationId, target]));
  return relationIds.every((relationId) => {
    const target = byId.get(relationId);
    return target !== undefined && target.reviewStatus !== "unreviewed";
  });
}

export function planSegmentedRelationReview(
  scope: string,
  targetRelations = 20,
  onlyRelationIds?: readonly string[],
): SegmentedRelationReviewBatch[] {
  if (!Number.isInteger(targetRelations) || targetRelations <= 0) {
    throw new Error("targetRelations must be a positive integer");
  }

  const pinnedRelationIds = onlyRelationIds === undefined ? undefined : new Set(onlyRelationIds);
  const pending = relationRecords(scope).filter(
    (target) =>
      target.reviewStatus === "unreviewed" &&
      (pinnedRelationIds === undefined || pinnedRelationIds.has(target.relationId)),
  );
  const batches: SegmentedRelationReviewBatch[] = [];

  for (let start = 0; start < pending.length; start += targetRelations) {
    const targets = pending.slice(start, start + targetRelations);
    batches.push({
      scope,
      index: batches.length + 1,
      relationIds: targets.map((target) => target.relationId),
      summary: targets
        .map(
          (target) =>
            [
              `--- ${target.relationId}`,
              `pair_id=${target.pairId}; claim_a=${target.claimA}; claim_b=${target.claimB}; kind=${target.relationKind}; resolution=${target.resolution}`,
              "",
              "```yaml",
              target.block.trim(),
              "```",
            ].join("\n"),
        )
        .join("\n\n"),
    });
  }

  return batches;
}

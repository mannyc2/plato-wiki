import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { relationCandidateKey } from "../relations.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./claim-ledger.js";
import {
  fieldValue,
  fieldValueOrEmpty,
  nestedFieldValueInParent,
} from "./observation-ledger.js";
import { relationMarkdownBlocks, type RelationMarkdownBlock } from "./relation-ledger.js";

const RELATION_KINDS = new Set(["contradiction", "tension", "revision", "restatement"]);
const RESOLUTIONS = new Set(["refuted_resolved", "standing", "verbal_only", "superseded"]);
const REVIEW_STATUSES = new Set(["unreviewed", "accepted", "rejected", "needs_split"]);
const REFUTING_FINAL_STATUSES = new Set(["refuted", "withdrawn", "revised"]);
const RELATION_ID_RE = /^rel_([a-z0-9-]+)_\d{4}$/u;
const PAIR_ID_RE = /^pair_([a-z0-9-]+)_\d{5}$/u;
const CRITICAL_TOP_LEVEL_FIELDS = [
  "relation_id",
  "pair_id",
  "claim_a",
  "claim_b",
  "relation_kind",
  "resolution",
  "basis",
  "limits",
  "review_status",
] as const;

export type RelationLedgerValidationIssue = {
  code:
    | "missing_record"
    | "missing_field"
    | "duplicate_id"
    | "duplicate_pair_id"
    | "duplicate_candidate"
    | "invalid_id"
    | "invalid_pair_id"
    | "invalid_enum"
    | "unknown_claim"
    | "nonaccepted_claim"
    | "dialogue_mismatch"
    | "invalid_resolution"
    | "missing_resolution_ref"
    | "invalid_source_ref"
    | "missing_limits"
    | "duplicate_field";
  relationId?: string | undefined;
  line?: number | undefined;
  message: string;
  fix: string;
};

type ClaimSummary = {
  claimId: string;
  dialogue: string;
  reviewStatus: string;
  finalStatus: string;
};

type SourceRef = {
  sourcePath: string;
  stephanusSpan: string;
  startChar: number | undefined;
  endChar: number | undefined;
  textSha256: string;
};

function relationDialogueFromPath(path: string) {
  return basename(path, ".md");
}

function claimDialogue(claimId: string) {
  return /^claim_([a-z0-9-]+)_\d{4}$/u.exec(claimId)?.[1];
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function numberField(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function resolutionSourceRef(block: string): SourceRef {
  return {
    sourcePath: nestedFieldValueInParent(block, "resolution_ref", "source_path"),
    stephanusSpan: nestedFieldValueInParent(block, "resolution_ref", "stephanus_span"),
    startChar: numberField(nestedFieldValueInParent(block, "resolution_ref", "start_char")),
    endChar: numberField(nestedFieldValueInParent(block, "resolution_ref", "end_char")),
    textSha256: nestedFieldValueInParent(block, "resolution_ref", "text_sha256"),
  };
}

/**
 * Every relation ledger is validated against every claim in the corpus, so the
 * 25 ledgers each re-parsed ~6MB of claims. Cache on the exact bytes: a stale
 * summary would let a relation cite a claim whose review status has moved.
 */
let claimSummaryCache: { stamp: string; claims: Map<string, ClaimSummary> } | undefined;

function claimLedgerStamp(paths: string[]) {
  return paths
    .map((path) => {
      if (!existsSync(path)) return `${path}:absent`;
      const stats = statSync(path, { bigint: true });
      return `${path}:${stats.size}:${stats.mtimeNs}`;
    })
    .join("|");
}

function readClaimSummaries() {
  const ledgerPaths = listClaimLedgerPaths({ absolute: true });
  const stamp = claimLedgerStamp(ledgerPaths);
  if (claimSummaryCache?.stamp === stamp) return claimSummaryCache.claims;

  const claims = new Map<string, ClaimSummary>();
  for (const path of ledgerPaths) {
    const dialogue = basename(path, ".md");
    for (const block of claimYamlBlocks(readFileSync(path, "utf8"))) {
      const claimId = fieldValue(block, "claim_id");
      if (!claimId) continue;
      claims.set(claimId, {
        claimId,
        dialogue,
        reviewStatus: fieldValueOrEmpty(block, "review_status") || "unreviewed",
        finalStatus: fieldValueOrEmpty(block, "final_status"),
      });
    }
  }
  claimSummaryCache = { stamp, claims };
  return claims;
}

function addIssue(issues: RelationLedgerValidationIssue[], issue: RelationLedgerValidationIssue) {
  issues.push(issue);
}

function requireField(block: RelationMarkdownBlock, field: string, issues: RelationLedgerValidationIssue[]) {
  const value = fieldValue(block.content, field);
  if (value === undefined || value.trim().length === 0) {
    addIssue(issues, {
      code: "missing_field",
      relationId: block.relationId,
      line: block.startLine,
      message: `Relation is missing required field \`${field}\`.`,
      fix: `Add \`${field}\` to the relation record.`,
    });
  }
}

function validateDuplicateCriticalFields(block: RelationMarkdownBlock, issues: RelationLedgerValidationIssue[]) {
  for (const field of CRITICAL_TOP_LEVEL_FIELDS) {
    const matches = block.content.match(new RegExp(`^${field}:\\s*`, "gmu")) ?? [];
    if (matches.length > 1) {
      addIssue(issues, {
        code: "duplicate_field",
        relationId: block.relationId,
        line: block.startLine,
        message: `Relation block contains ${matches.length} top-level \`${field}\` fields.`,
        fix: "Keep exactly one relation record in each fenced yaml block.",
      });
    }
  }
}

function validateSourceRef(
  block: RelationMarkdownBlock,
  sourceRef: SourceRef,
  issues: RelationLedgerValidationIssue[],
  sourceCache: Map<string, string | undefined>,
) {
  if (!sourceRef.sourcePath || sourceRef.startChar === undefined || sourceRef.endChar === undefined || !sourceRef.textSha256) {
    addIssue(issues, {
      code: "invalid_source_ref",
      relationId: block.relationId,
      line: block.startLine,
      message: "resolution_ref.source_ref is incomplete.",
      fix: "Copy a complete source_ref object from wiki_source_span for the cited resolution span.",
    });
    return;
  }

  let sourceText = sourceCache.get(sourceRef.sourcePath);
  if (!sourceCache.has(sourceRef.sourcePath)) {
    const absolutePath = join(getRepoRoot(), sourceRef.sourcePath);
    sourceText = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : undefined;
    sourceCache.set(sourceRef.sourcePath, sourceText);
  }
  if (sourceText === undefined) {
    addIssue(issues, {
      code: "invalid_source_ref",
      relationId: block.relationId,
      line: block.startLine,
      message: `resolution_ref source path does not exist: ${sourceRef.sourcePath}`,
      fix: "Use the canonical raw/plato/greek source path returned by wiki_source_span.",
    });
    return;
  }

  const slice = sourceText.slice(sourceRef.startChar, sourceRef.endChar);
  const actualHash = sha256(slice);
  if (actualHash !== sourceRef.textSha256) {
    addIssue(issues, {
      code: "invalid_source_ref",
      relationId: block.relationId,
      line: block.startLine,
      message: `resolution_ref hash mismatch for ${sourceRef.sourcePath}:${sourceRef.stephanusSpan}.`,
      fix: "Replace the resolution_ref with a fresh wiki_source_span result.",
    });
  }
}

function validateRelationId(path: string, block: RelationMarkdownBlock, seen: Set<string>, issues: RelationLedgerValidationIssue[]) {
  const relationId = block.relationId;
  const dialogue = relationDialogueFromPath(path);
  if (!relationId) return;

  const match = RELATION_ID_RE.exec(relationId);
  if (!match) {
    addIssue(issues, {
      code: "invalid_id",
      relationId,
      line: block.startLine,
      message: `relation_id \`${relationId}\` must match rel_<dialogue>_NNNN.`,
      fix: "Use the persisted relation id assigned for this ledger.",
    });
    return;
  }
  if (match[1] !== dialogue) {
    addIssue(issues, {
      code: "invalid_id",
      relationId,
      line: block.startLine,
      message: `relation_id dialogue \`${match[1]}\` does not match wiki/relations/${dialogue}.md.`,
      fix: "Move the record to the matching ledger or assign the correct relation id.",
    });
  }
  if (seen.has(relationId)) {
    addIssue(issues, {
      code: "duplicate_id",
      relationId,
      line: block.startLine,
      message: `Duplicate relation_id \`${relationId}\`.`,
      fix: "Keep each relation id unique within the ledger.",
    });
  }
  seen.add(relationId);
}

function validatePairId(path: string, block: RelationMarkdownBlock, seen: Set<string>, issues: RelationLedgerValidationIssue[]) {
  const pairId = fieldValue(block.content, "pair_id");
  const dialogue = relationDialogueFromPath(path);
  if (!pairId) return;

  const match = PAIR_ID_RE.exec(pairId);
  if (!match) {
    addIssue(issues, {
      code: "invalid_pair_id",
      relationId: block.relationId,
      line: block.startLine,
      message: `pair_id \`${pairId}\` must match pair_<scope>_NNNNN.`,
      fix: "Let the canonical relation writer assign a unique pair_id.",
    });
    return;
  }
  if (match[1] !== dialogue) {
    addIssue(issues, {
      code: "invalid_pair_id",
      relationId: block.relationId,
      line: block.startLine,
      message: `pair_id scope \`${match[1]}\` does not match wiki/relations/${dialogue}.md.`,
      fix: "Move the record to the matching ledger or let the canonical relation writer assign pair_id.",
    });
  }
  if (seen.has(pairId)) {
    addIssue(issues, {
      code: "duplicate_pair_id",
      relationId: block.relationId,
      line: block.startLine,
      message: `Duplicate pair_id \`${pairId}\`.`,
      fix: "Keep one relation decision per candidate pair.",
    });
  }
  seen.add(pairId);
}

function validateCandidateIdentity(
  path: string,
  block: RelationMarkdownBlock,
  seen: Set<string>,
  issues: RelationLedgerValidationIssue[],
) {
  const claimA = fieldValue(block.content, "claim_a");
  const claimB = fieldValue(block.content, "claim_b");
  if (!claimA || !claimB) return;

  const candidateKey = relationCandidateKey(relationDialogueFromPath(path), claimA, claimB);
  if (seen.has(candidateKey)) {
    addIssue(issues, {
      code: "duplicate_candidate",
      relationId: block.relationId,
      line: block.startLine,
      message: `Duplicate relation candidate \`${candidateKey}\`.`,
      fix: "Keep exactly one relation decision for each ordered claim pair.",
    });
  }
  seen.add(candidateKey);
}

function validateClaimLinks(
  path: string,
  block: RelationMarkdownBlock,
  claims: Map<string, ClaimSummary>,
  issues: RelationLedgerValidationIssue[],
) {
  const dialogue = relationDialogueFromPath(path);
  const claimAId = fieldValueOrEmpty(block.content, "claim_a");
  const claimBId = fieldValueOrEmpty(block.content, "claim_b");
  const claimA = claims.get(claimAId);
  const claimB = claims.get(claimBId);
  const relationReviewStatus = fieldValueOrEmpty(block.content, "review_status");

  for (const [claimId, claim] of [
    [claimAId, claimA],
    [claimBId, claimB],
  ] as const) {
    if (!claimId) continue;
    if (!claim) {
      addIssue(issues, {
        code: "unknown_claim",
        relationId: block.relationId,
        line: block.startLine,
        message: `Unknown claim id \`${claimId}\`.`,
        fix: "Reference an existing accepted claim id.",
      });
      continue;
    }
    if (claim.reviewStatus !== "accepted" && relationReviewStatus !== "rejected") {
      addIssue(issues, {
        code: "nonaccepted_claim",
        relationId: block.relationId,
        line: block.startLine,
        message: `Claim \`${claimId}\` is ${claim.reviewStatus}, not accepted.`,
        fix: "Only rejected relations may preserve references to existing non-accepted claims.",
      });
    }
    if (dialogue !== "cross-dialogue" && claim.dialogue !== dialogue) {
      addIssue(issues, {
        code: "dialogue_mismatch",
        relationId: block.relationId,
        line: block.startLine,
        message: `Intra-dialogue relation ${dialogue} references ${claimId}.`,
        fix: "Use only same-dialogue claims in an intra-dialogue ledger, or move the record to cross-dialogue.",
      });
    }
  }

  const resolution = fieldValueOrEmpty(block.content, "resolution");
  const relationKind = fieldValueOrEmpty(block.content, "relation_kind");
  if (resolution === "standing" && claimA && claimB && (claimA.finalStatus !== "left_standing" || claimB.finalStatus !== "left_standing")) {
    addIssue(issues, {
      code: "invalid_resolution",
      relationId: block.relationId,
      line: block.startLine,
      message: "resolution=standing requires both claims to be left_standing.",
      fix: "Use standing only for accepted claim pairs whose final_status is left_standing.",
    });
  }
  if (
    resolution === "refuted_resolved" &&
    claimA &&
    claimB &&
    !REFUTING_FINAL_STATUSES.has(claimA.finalStatus) &&
    !REFUTING_FINAL_STATUSES.has(claimB.finalStatus)
  ) {
    addIssue(issues, {
      code: "invalid_resolution",
      relationId: block.relationId,
      line: block.startLine,
      message: "resolution=refuted_resolved requires at least one claim to be refuted, withdrawn, or revised.",
      fix: "Use refuted_resolved only when a linked claim's final_status supports it.",
    });
  }
  if (relationKind === "restatement" && resolution === "refuted_resolved") {
    addIssue(issues, {
      code: "invalid_resolution",
      relationId: block.relationId,
      line: block.startLine,
      message: "relation_kind=restatement may not use resolution=refuted_resolved.",
      fix: "Use a compatible resolution for restatement relations.",
    });
  }
}

function validateEnums(block: RelationMarkdownBlock, issues: RelationLedgerValidationIssue[]) {
  const relationKind = fieldValue(block.content, "relation_kind");
  if (relationKind && !RELATION_KINDS.has(relationKind)) {
    addIssue(issues, {
      code: "invalid_enum",
      relationId: block.relationId,
      line: block.startLine,
      message: `relation_kind \`${relationKind}\` is invalid.`,
      fix: "Use contradiction, tension, revision, or restatement.",
    });
  }

  const resolution = fieldValue(block.content, "resolution");
  if (resolution && !RESOLUTIONS.has(resolution)) {
    addIssue(issues, {
      code: "invalid_enum",
      relationId: block.relationId,
      line: block.startLine,
      message: `resolution \`${resolution}\` is invalid.`,
      fix: "Use refuted_resolved, standing, verbal_only, or superseded.",
    });
  }

  const reviewStatus = fieldValue(block.content, "review_status");
  if (reviewStatus && !REVIEW_STATUSES.has(reviewStatus)) {
    addIssue(issues, {
      code: "invalid_enum",
      relationId: block.relationId,
      line: block.startLine,
      message: `review_status \`${reviewStatus}\` is invalid.`,
      fix: "Use unreviewed, accepted, rejected, or needs_split.",
    });
  }
}

function validateResolutionFields(block: RelationMarkdownBlock, issues: RelationLedgerValidationIssue[], sourceCache: Map<string, string | undefined>) {
  const resolution = fieldValueOrEmpty(block.content, "resolution");
  const resolutionRefRequired = resolution === "refuted_resolved" || resolution === "verbal_only";
  const hasResolutionRef = /^resolution_ref:\s*$/mu.test(block.content);

  if (resolutionRefRequired && !hasResolutionRef) {
    addIssue(issues, {
      code: "missing_resolution_ref",
      relationId: block.relationId,
      line: block.startLine,
      message: `resolution=${resolution} requires resolution_ref.`,
      fix: "Add a resolution_ref with a verified source_ref for the resolving span.",
    });
  }
  if (hasResolutionRef) {
    validateSourceRef(block, resolutionSourceRef(block.content), issues, sourceCache);
  }
  if (resolution === "standing" && fieldValueOrEmpty(block.content, "limits").trim().length === 0) {
    addIssue(issues, {
      code: "missing_limits",
      relationId: block.relationId,
      line: block.startLine,
      message: "resolution=standing requires a checked-scope limits field.",
      fix: "State the dialogue/corpus scope checked for the standing relation.",
    });
  }
}

export function validateRelationLedger(path: string, content: string) {
  const issues: RelationLedgerValidationIssue[] = [];
  const blocks = relationMarkdownBlocks(content);
  const claims = readClaimSummaries();
  const seen = new Set<string>();
  const seenPairs = new Set<string>();
  const seenCandidates = new Set<string>();
  const sourceCache = new Map<string, string | undefined>();

  if (blocks.length === 0) {
    addIssue(issues, {
      code: "missing_record",
      message: "No fenced yaml relation records found.",
      fix: "Write relations as fenced yaml blocks.",
    });
    return issues;
  }

  for (const block of blocks) {
    validateDuplicateCriticalFields(block, issues);
    for (const field of CRITICAL_TOP_LEVEL_FIELDS) {
      requireField(block, field, issues);
    }
    validateRelationId(path, block, seen, issues);
    validatePairId(path, block, seenPairs, issues);
    validateCandidateIdentity(path, block, seenCandidates, issues);
    validateEnums(block, issues);
    validateClaimLinks(path, block, claims, issues);
    validateResolutionFields(block, issues, sourceCache);

    const claimAId = fieldValueOrEmpty(block.content, "claim_a");
    const claimBId = fieldValueOrEmpty(block.content, "claim_b");
    if (claimAId && claimBId && claimAId === claimBId) {
      addIssue(issues, {
        code: "invalid_resolution",
        relationId: block.relationId,
        line: block.startLine,
        message: "A relation cannot link a claim to itself.",
        fix: "Use two distinct claim ids.",
      });
    }
    if (claimAId && claimBId && claimAId > claimBId && relationDialogueFromPath(path) !== "cross-dialogue") {
      addIssue(issues, {
        code: "invalid_resolution",
        relationId: block.relationId,
        line: block.startLine,
        message: "Intra-dialogue relation claim ids must be ordered claim_a < claim_b.",
        fix: "Swap claim_a and claim_b to keep deterministic ordering.",
      });
    }
  }

  return issues;
}

export function formatRelationLedgerValidationError(issues: RelationLedgerValidationIssue[], toolName = "wiki_write_relations") {
  const counts = new Map<string, number>();
  for (const issue of issues) counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shownIssues = issues.slice(0, 8);
  const lines = [
    `Relation ledger rejected by ${toolName}.`,
    `Fix the markdown and call ${toolName} again.`,
    `Issue counts: ${countSummary}`,
    ...shownIssues.map((issue) => {
      const location = [issue.relationId, issue.line ? `line ${issue.line}` : undefined].filter(Boolean).join(" ");
      return `- ${location || "ledger"}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];
  if (issues.length > shownIssues.length) lines.push(`- ${issues.length - shownIssues.length} more issue(s) omitted.`);
  return lines.join("\n");
}

export function assertRelationLedgerContent(path: string, content: string) {
  const issues = validateRelationLedger(path, content);
  if (issues.length > 0) {
    throw new Error(formatRelationLedgerValidationError(issues));
  }
}

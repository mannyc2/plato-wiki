import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  inspectAudioInsertionBlock,
  resolveCommentaryPlaybackBoundary,
} from "./audio-insertion.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "./commentary-authoring.js";
import { getRepoRoot } from "./paths.js";
import { resolveEnglishSpan, resolveSourceSpan } from "./source.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./wiki/claim-ledger.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import {
  fieldValue,
  listObservationLedgerPaths,
  nestedFieldValueInParent,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";
import { listRelationLedgerPaths, relationYamlBlocks } from "./wiki/relation-ledger.js";
import { ontologyDossierPathsByObservation } from "./wiki/ontology-vnext-repository.js";

const AUDIT_SCHEMA_VERSION = 3 as const;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const DIALOGUE = /^[a-z0-9-]+$/u;
const UNIT_KEY = /^[a-z0-9][a-z0-9-]*$/u;
const COMMENTARY_QUALITY_AUDIT_RATIONALE_MAX_LENGTH = 240 as const;
export const COMMENTARY_QUALITY_AUDIT_RATIONALE_TARGET_MAX_LENGTH = 180 as const;
const COMMENTARY_AUDIT_PLAYBACK_EDGE_CHARS = 400 as const;
const COMPLETE_RATIONALE_END = /[.!?](?:["'”’)\]}]*)$/u;
const MALFORMED_RATIONALE_CHARACTER =
  /[\p{Cc}\p{Cf}\p{Cs}\p{No}\p{So}\p{Sk}]|[^\p{Script=Latin}\p{Script=Greek}\p{Script=Common}\p{Script=Inherited}\p{Number}\p{Separator}]/u;

export const COMMENTARY_QUALITY_ISSUE_CODES = [
  "source_recap",
  "source_misreading",
  "generic_or_reusable",
  "multiple_jobs",
  "certainty_exceeds_evidence",
  "unsupported_or_miscited_claim",
  "repetitive_throat_clearing",
  "redundant_within_unit",
  "hard_to_follow_aloud",
  "interrupts_dramatic_flow",
  "excessive_unit_interruptions",
] as const;

export const COMMENTARY_PLACEMENT_HAZARD_CODES = [
  "sentence_or_clause_split",
  "question_answer_split",
  "prompt_reply_split",
  "semantic_anchor_displacement",
  "other_dramatic_flow_damage",
] as const;

export type CommentaryQualityIssueCode = (typeof COMMENTARY_QUALITY_ISSUE_CODES)[number];
export type CommentaryPlacementHazardCode = (typeof COMMENTARY_PLACEMENT_HAZARD_CODES)[number];
export type CommentaryQualityDisposition = "pass" | "rewrite" | "remove" | "split";
export type CommentaryQualityCheckVerdict = "pass" | "fail";

const COMMENTARY_QUALITY_CHECK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["pass", "fail"] },
  },
  required: ["verdict"],
} as const;

const COMMENTARY_QUALITY_PLACEMENT_CHECK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["pass", "fail"] },
    hazard_codes: {
      type: "array",
      items: { type: "string", enum: COMMENTARY_PLACEMENT_HAZARD_CODES },
    },
  },
  required: ["verdict", "hazard_codes"],
} as const;

export const COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    schema_version: { type: "integer", const: AUDIT_SCHEMA_VERSION },
    dialogue: { type: "string", pattern: "^[a-z0-9-]+$" },
    unit_key: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
    section_id: { type: "string", pattern: "^comm_[a-z0-9-]+_\\d{4}$" },
    authoring: {
      type: "object",
      additionalProperties: false,
      properties: {
        model: { type: "string", const: COMMENTARY_AUTHORING_MODEL },
        effort: { type: "string", const: COMMENTARY_STAGE_EFFORT.audit },
      },
      required: ["model", "effort"],
    },
    unit_verdict: { type: "string", enum: ["pass", "fail"] },
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          commentary_id: { type: "string", pattern: "^comm_[a-z0-9-]+_\\d{4}$" },
          disposition: { type: "string", enum: ["pass", "rewrite", "remove", "split"] },
          issue_codes: {
            type: "array",
            items: { type: "string", enum: COMMENTARY_QUALITY_ISSUE_CODES },
          },
          checks: {
            type: "object",
            additionalProperties: false,
            properties: {
              evidence: COMMENTARY_QUALITY_CHECK_JSON_SCHEMA,
              placement: COMMENTARY_QUALITY_PLACEMENT_CHECK_JSON_SCHEMA,
              listening: COMMENTARY_QUALITY_CHECK_JSON_SCHEMA,
            },
            required: ["evidence", "placement", "listening"],
          },
          rationale: { type: "string", minLength: 1, maxLength: COMMENTARY_QUALITY_AUDIT_RATIONALE_MAX_LENGTH },
        },
        required: ["commentary_id", "disposition", "issue_codes", "checks", "rationale"],
      },
    },
  },
  required: ["schema_version", "dialogue", "unit_key", "section_id", "authoring", "unit_verdict", "blocks"],
} as const;

export type CommentaryQualityAudit = {
  schema_version: 3;
  dialogue: string;
  unit_key: string;
  section_id: string;
  authoring: {
    model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: (typeof COMMENTARY_STAGE_EFFORT)["audit"];
  };
  unit_verdict: "pass" | "fail";
  blocks: Array<{
    commentary_id: string;
    disposition: CommentaryQualityDisposition;
    issue_codes: CommentaryQualityIssueCode[];
    checks: {
      evidence: { verdict: CommentaryQualityCheckVerdict };
      placement: {
        verdict: CommentaryQualityCheckVerdict;
        hazard_codes: CommentaryPlacementHazardCode[];
      };
      listening: { verdict: CommentaryQualityCheckVerdict };
    };
    rationale: string;
  }>;
};

export type CommentaryAuditBrief = {
  dialogue: string;
  unitKey: string;
  sectionId: string;
  sectionSpan: string;
  commentaryIds: string[];
  inputPaths: string[];
  /**
   * Canonical files whose whole-file hashes participate in the provider job
   * identity. The commentary ledger is intentionally excluded: the exact
   * normalized unit bytes are already bound by `auditedContentSha256`.
   */
  hashInputPaths: string[];
  auditedContentSha256: string;
  content: string;
  sha256: string;
  path: string;
};

export type WrittenCommentaryAuditBrief = Omit<CommentaryAuditBrief, "content">;

export type CommentaryRewriteEvidenceSupplement = {
  path: string;
  content: string;
  sha256: string;
};

const REWRITE_EVIDENCE_MAX_OBSERVATIONS = 8;
const REWRITE_EVIDENCE_MAX_CLAIMS = 8;
const REWRITE_EVIDENCE_MAX_RELATIONS = 8;
const REWRITE_EVIDENCE_MAX_DOSSIERS = 3;
const REWRITE_EVIDENCE_MAX_DOSSIER_CHARS = 8_000;

type EvidenceRecord = { path: string; block: string };
export type CommentaryAuditEvidenceSnapshot = {
  readonly observations: ReadonlyMap<string, EvidenceRecord>;
  readonly claims: ReadonlyMap<string, EvidenceRecord>;
  readonly relations: ReadonlyMap<string, EvidenceRecord>;
};

export type CommentaryAuditBriefInputSnapshot = {
  readonly ledgerContent: string;
  readonly protocolContent: string;
  readonly evidence: CommentaryAuditEvidenceSnapshot;
};

type CommentaryBlock = {
  id: string;
  kind: string;
  span: string;
  status: string;
  content: string;
  index: number;
  startChar: number;
  endChar: number;
};

export type CommentaryRewriteEvidenceContext = {
  dialogue: string;
  blocks: CommentaryBlock[];
  observations: ReadonlyMap<string, EvidenceRecord>;
  claims: ReadonlyMap<string, EvidenceRecord>;
  dialogueRelations: Map<string, EvidenceRecord>;
  anchoredObservations: AnchoredEvidenceRecord[];
  anchoredClaims: AnchoredEvidenceRecord[];
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function objectValue(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(record: Record<string, unknown>, allowed: readonly string[], path: string) {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(record)) {
    if (!allowedSet.has(key)) throw new Error(`${path}.${key} is not allowed`);
  }
  for (const key of allowed) {
    if (!(key in record)) throw new Error(`${path}.${key} is required`);
  }
}

function nonEmptyString(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${path} must be a non-empty string`);
  return value.trim();
}

function auditRationale(value: unknown, path: string) {
  const rationale = nonEmptyString(value, path);
  if (rationale.length > COMMENTARY_QUALITY_AUDIT_RATIONALE_MAX_LENGTH) {
    throw new Error(`${path} must be at most ${COMMENTARY_QUALITY_AUDIT_RATIONALE_MAX_LENGTH} characters`);
  }
  if (
    rationale !== value ||
    MALFORMED_RATIONALE_CHARACTER.test(rationale) ||
    !COMPLETE_RATIONALE_END.test(rationale)
  ) {
    throw new Error(`${path} is visibly truncated or malformed; use a complete, normally punctuated rationale`);
  }
  return rationale;
}

function cleanYamlScalar(value: string) {
  return value.trim().replace(/^['"]|['"]$/gu, "");
}

function inlineList(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const body = trimmed.slice(1, -1).trim();
  if (!body) return [];
  return body.split(/,\s*/u).map(cleanYamlScalar).filter(Boolean);
}

function commentaryCites(block: string) {
  const result = { observations: [] as string[], claims: [] as string[], relations: [] as string[], dossiers: [] as string[] };
  const lines = block.split("\n");
  const start = lines.findIndex((line) => /^cites:\s*$/u.test(line));
  if (start === -1) return result;
  let current: keyof typeof result | undefined;
  for (const line of lines.slice(start + 1)) {
    if (/^\S/u.test(line)) break;
    const field = /^\s{2}(observations|claims|relations|dossiers):\s*(.*)$/u.exec(line);
    if (field) {
      current = field[1] as keyof typeof result;
      result[current].push(...inlineList(field[2] ?? ""));
      continue;
    }
    const item = /^\s{4}-\s*(.+)$/u.exec(line)?.[1];
    if (item && current) result[current].push(cleanYamlScalar(item));
  }
  return result;
}

function acceptedEvidence(
  paths: string[],
  parser: (content: string) => string[],
  idField: string,
) {
  const repoRoot = getRepoRoot();
  const records = new Map<string, EvidenceRecord>();
  for (const path of paths) {
    for (const block of parser(readFileSync(join(repoRoot, path), "utf8"))) {
      const id = fieldValue(block, idField);
      if (!id || fieldValue(block, "review_status") !== "accepted") continue;
      records.set(id, { path, block });
    }
  }
  return records;
}

function commentaryBlocks(dialogue: string, content: string) {
  return commentaryMarkdownBlocks(content).map((block): CommentaryBlock => {
    const id = fieldValue(block.content, "commentary_id") ?? "";
    const kind = fieldValue(block.content, "block_kind") ?? "";
    const span = fieldValue(block.content, "stephanus_span") ?? "";
    if (!COMMENTARY_ID.test(id) || !kind || !span) {
      throw new Error(`Commentary audit requires a validated id, block_kind, and span in wiki/commentary/${dialogue}.md`);
    }
    const resolution = resolveSourceSpan(dialogue, span);
    return {
      id,
      kind,
      span: resolution.source_ref.stephanus_span,
      status: fieldValue(block.content, "review_status") ?? "",
      content: block.content,
      index: block.index,
      startChar: resolution.source_ref.start_char,
      endChar: resolution.source_ref.end_char,
    };
  });
}

const AUDITED_STATUS_PLACEHOLDER = "<audited>";

/**
 * The quality-bearing portion of the protocol. Everything after the record
 * contract is operator or validator procedure and must not invalidate a model
 * verdict. Keeping this extraction here makes the brief and runner share one
 * fail-closed contract boundary.
 */
export function commentaryAuditContract(protocolContent: string) {
  const startMarker = "## What commentary is\n";
  const endMarker = "\n## The record contract";
  const start = protocolContent.indexOf(startMarker);
  const end = protocolContent.indexOf(endMarker, start);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(
      "docs/commentary-protocol.md is missing the canonical commentary quality contract boundaries",
    );
  }
  return `${protocolContent.slice(start, end).trimEnd()}\n`;
}

/** Review bookkeeping is not part of the prose or placement being judged. */
function auditedBlockContent(content: string) {
  return content.replace(
    /^review_status:.*$/mu,
    `review_status: ${AUDITED_STATUS_PLACEHOLDER}`,
  );
}

/**
 * Exact source offsets are already present once in the unit source and playback
 * edge. Retain every evidence-bearing field while dropping repeated source_ref
 * maps from accepted records.
 */
function projectedEvidenceBlock(block: string) {
  const kept: string[] = [];
  let droppingSourceRef = false;
  for (const line of block.split("\n")) {
    const topLevel = /^([a-z_]+):/u.exec(line)?.[1];
    if (topLevel) {
      droppingSourceRef = topLevel === "source_ref";
      if (droppingSourceRef) continue;
    } else if (droppingSourceRef) {
      continue;
    }
    kept.push(line);
  }
  return kept.join("\n");
}

function sourceLines(dialogue: string, span: string, heading: string) {
  const greek = resolveSourceSpan(dialogue, span);
  const english = resolveEnglishSpan(dialogue, span);
  return [
    `### ${heading}`,
    "",
    `- span: ${greek.source_ref.stephanus_span}`,
    `- Greek: ${greek.source_ref.source_path} chars ${greek.source_ref.start_char}-${greek.source_ref.end_char} sha256 ${greek.source_ref.text_sha256}`,
    `- English: ${english.source_ref.source_path} chars ${english.source_ref.start_char}-${english.source_ref.end_char} sha256 ${english.source_ref.text_sha256}`,
    "",
    "#### Exact Greek text",
    "",
    "```text",
    greek.text,
    "```",
    "",
    "#### Exact English text",
    "",
    "```text",
    english.text,
    "```",
    "",
  ];
}

function playbackBoundaryLines(dialogue: string, englishContent: string, block: CommentaryBlock) {
  const english = resolveEnglishSpan(dialogue, block.span).source_ref;
  const inspectedAudioInsertion = inspectAudioInsertionBlock(block.content);
  if (inspectedAudioInsertion.errors.length > 0) {
    throw new Error(`Commentary ${block.id} has invalid audio_insertion: ${inspectedAudioInsertion.errors.join("; ")}`);
  }
  const placement = fieldValue(block.content, "placement");
  if (placement !== "before" && placement !== "after") {
    throw new Error(`Commentary ${block.id} requires placement before or after for playback audit`);
  }
  const resolved = resolveCommentaryPlaybackBoundary({
    dialogue,
    englishContent,
    blockKind: block.kind,
    placement,
    englishStartChar: english.start_char,
    englishEndChar: english.end_char,
    ...(inspectedAudioInsertion.value ? { audioInsertion: inspectedAudioInsertion.value } : {}),
  });
  const leftStart = Math.max(0, resolved.boundaryChar - COMMENTARY_AUDIT_PLAYBACK_EDGE_CHARS);
  const rightEnd = Math.min(englishContent.length, resolved.boundaryChar + COMMENTARY_AUDIT_PLAYBACK_EDGE_CHARS);
  const left = englishContent.slice(leftStart, resolved.boundaryChar);
  const right = englishContent.slice(resolved.boundaryChar, rightEnd);
  const spokenLeft = left.replace(/\{[^{}]*\}/gu, "").trimEnd();
  const spokenRight = right.replace(/^\s*(?:\{[^{}]*\}\s*)*/u, "").trimStart();
  const terminal = /([.!?])["'’”»)}\]]*$/u.exec(spokenLeft)?.[1];
  const leftTerminal = terminal === "?" ? "question" : terminal === "!" ? "exclamation" : terminal === "." ? "period" : "none";
  const rightStartsSentence = /^["'“‘(\[]*[\p{Lu}\p{Lt}]/u.test(spokenRight);
  const mechanicalSentenceBoundary = terminal !== undefined && rightStartsSentence;
  const requestedAnchorBoundary = placement === "before" ? english.start_char : english.end_char;
  const anchorToPlaybackShift = resolved.boundaryChar - requestedAnchorBoundary;
  return {
    inputPaths: [
      `audio/speaker-attributions/${dialogue}.json`,
      ...(inspectedAudioInsertion.value ? [inspectedAudioInsertion.value.attribution_path] : []),
    ],
    lines: [
      "#### Exact English playback insertion edge",
      "",
      `- resolution: ${resolved.method}`,
      `- source_ref English chars: ${english.start_char}-${english.end_char}`,
      `- playback boundary: ${english.source_path} char ${resolved.boundaryChar}`,
      `- requested ${placement} anchor edge: ${english.source_path} char ${requestedAnchorBoundary}`,
      `- anchor_to_playback_shift_chars: ${anchorToPlaybackShift >= 0 ? "+" : ""}${anchorToPlaybackShift}`,
      `- boundary_matches_anchor_edge: ${anchorToPlaybackShift === 0 ? "yes" : "no"}`,
      `- displayed edge: chars ${leftStart}-${resolved.boundaryChar}-${rightEnd}; at most ${COMMENTARY_AUDIT_PLAYBACK_EDGE_CHARS} characters per side`,
      `- left_sha256: ${sha256(left)}`,
      `- right_sha256: ${sha256(right)}`,
      `- left_terminal: ${leftTerminal}`,
      `- right_starts_sentence: ${rightStartsSentence ? "yes" : "no"}`,
      `- mechanical_complete_sentence_edge: ${mechanicalSentenceBoundary ? "yes" : "no"}`,
      "- placement authority: this deterministic English playback edge, not the raw Greek or English marker boundary",
      "",
      "##### Heard immediately before commentary",
      "",
      "```text",
      left || "(start of source)",
      "```",
      "",
      "##### Heard immediately after commentary",
      "",
      "```text",
      right || "(end of source)",
      "```",
      "",
    ],
  };
}

function exactEvidenceLines(
  label: string,
  ids: string[],
  records: ReadonlyMap<string, EvidenceRecord>,
  inputPaths: Set<string>,
) {
  const selectedIds = [...new Set(ids)].sort();
  const lines = [`## Accepted ${label} cited by this unit`, ""];
  if (selectedIds.length === 0) return [...lines, "(none)", ""];
  for (const id of selectedIds) {
    const record = records.get(id);
    if (!record) throw new Error(`Commentary audit cannot resolve accepted ${label} evidence ${id}`);
    inputPaths.add(record.path);
    lines.push(
      `### ${id}`,
      "",
      `- source: ${record.path}`,
      "",
      "```yaml",
      projectedEvidenceBlock(record.block),
      "```",
      "",
    );
  }
  return lines;
}

type AnchoredEvidenceRecord = EvidenceRecord & {
  id: string;
  startChar: number;
  endChar: number;
};

function anchoredEvidenceRecords(records: ReadonlyMap<string, EvidenceRecord>, dialogue: string) {
  const sourcePath = `raw/plato/greek/${dialogue}.txt`;
  return [...records.entries()]
    .map(([id, record]): AnchoredEvidenceRecord | undefined => {
      if (nestedFieldValueInParent(record.block, "source_ref", "source_path") !== sourcePath) return undefined;
      const startChar = Number(nestedFieldValueInParent(record.block, "source_ref", "start_char"));
      const endChar = Number(nestedFieldValueInParent(record.block, "source_ref", "end_char"));
      if (!Number.isInteger(startChar) || !Number.isInteger(endChar) || endChar <= startChar) return undefined;
      return { ...record, id, startChar, endChar };
    })
    .filter((record): record is AnchoredEvidenceRecord => record !== undefined);
}

function overlappingEvidenceIds(
  records: ReadonlyMap<string, EvidenceRecord>,
  dialogue: string,
  range: { startChar: number; endChar: number },
) {
  return anchoredEvidenceRecords(records, dialogue)
    .filter((record) => rangesOverlap(record, range))
    .map((record) => record.id);
}

function rangesOverlap(a: { startChar: number; endChar: number }, b: { startChar: number; endChar: number }) {
  return a.startChar < b.endChar && a.endChar > b.startChar;
}

function selectAnchoredEvidence(
  records: AnchoredEvidenceRecord[],
  ranges: Array<{ startChar: number; endChar: number }>,
  cap: number,
) {
  return records
    .map((record) => {
      const exactIndex = ranges.findIndex((range) => rangesOverlap(record, range));
      return { record, exactIndex };
    })
    .filter(({ exactIndex }) => exactIndex !== -1)
    .sort((a, b) =>
      a.exactIndex - b.exactIndex ||
      a.record.startChar - b.record.startChar ||
      a.record.endChar - b.record.endChar ||
      a.record.id.localeCompare(b.record.id),
    )
    .slice(0, cap)
    .map(({ record }) => record);
}

function supplementRecordLines(label: string, records: AnchoredEvidenceRecord[]) {
  const lines = [`## Candidate accepted ${label}`, ""];
  if (records.length === 0) return [...lines, "(none)", ""];
  for (const record of records) {
    lines.push(`### ${record.id}`, "", `- source: ${record.path}`, "", "```yaml", record.block, "```", "");
  }
  return lines;
}

function citedAcceptedLocalEvidenceExists(
  failedBlocks: CommentaryBlock[],
  dialogue: string,
  observations: ReadonlyMap<string, EvidenceRecord>,
  claims: ReadonlyMap<string, EvidenceRecord>,
) {
  const sourcePath = `raw/plato/greek/${dialogue}.txt`;
  const overlapsBlock = (record: EvidenceRecord | undefined, block: CommentaryBlock) => {
    if (!record || nestedFieldValueInParent(record.block, "source_ref", "source_path") !== sourcePath) return false;
    const startChar = Number(nestedFieldValueInParent(record.block, "source_ref", "start_char"));
    const endChar = Number(nestedFieldValueInParent(record.block, "source_ref", "end_char"));
    return Number.isInteger(startChar) && Number.isInteger(endChar) && rangesOverlap(
      { startChar, endChar },
      block,
    );
  };
  return failedBlocks.every((block) => {
    const cites = commentaryCites(block.content);
    return cites.observations.some((id) => overlapsBlock(observations.get(id), block)) ||
      cites.claims.some((id) => overlapsBlock(claims.get(id), block));
  });
}

export function buildCommentaryAuditEvidenceSnapshot(): CommentaryAuditEvidenceSnapshot {
  return Object.freeze({
    observations: acceptedEvidence(listObservationLedgerPaths(), observationYamlBlocks, "observation_id"),
    claims: acceptedEvidence(listClaimLedgerPaths(), claimYamlBlocks, "claim_id"),
    relations: acceptedEvidence(listRelationLedgerPaths(), relationYamlBlocks, "relation_id"),
  });
}

export function buildCommentaryRewriteEvidenceContext(
  dialogue: string,
  evidence = buildCommentaryAuditEvidenceSnapshot(),
): CommentaryRewriteEvidenceContext {
  const repoRoot = getRepoRoot();
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const ledgerContent = readFileSync(join(repoRoot, ledgerPath), "utf8");
  const observations = evidence.observations;
  const claims = evidence.claims;
  return {
    dialogue,
    blocks: commentaryBlocks(dialogue, ledgerContent),
    observations,
    claims,
    dialogueRelations: new Map(
      [...evidence.relations].filter(([_, record]) => record.path === `wiki/relations/${dialogue}.md`),
    ),
    anchoredObservations: anchoredEvidenceRecords(observations, dialogue),
    anchoredClaims: anchoredEvidenceRecords(claims, dialogue),
  };
}

/**
 * Build a small rewrite-only evidence handoff. Audit briefs intentionally stay
 * exhaustive and content-addressed; this supplement is created only for a
 * failed packet whose failed blocks have no accepted citable record in that
 * brief.
 */
export function buildCommentaryRewriteEvidenceSupplement(
  dialogue: string,
  brief: CommentaryAuditBrief,
  failedIds: string[],
  context = buildCommentaryRewriteEvidenceContext(dialogue),
): CommentaryRewriteEvidenceSupplement | undefined {
  const repoRoot = getRepoRoot();
  const dossierPathsByObservation = ontologyDossierPathsByObservation(repoRoot);
  if (context.dialogue !== dialogue) {
    throw new Error(`Rewrite evidence context for ${context.dialogue} cannot be used for ${dialogue}`);
  }
  const failedBlocks = failedIds
    .map((id) => context.blocks.find((block) => block.id === id))
    .filter((block): block is CommentaryBlock => block !== undefined);
  if (failedBlocks.length !== failedIds.length) {
    throw new Error(`Cannot build rewrite evidence for missing failed commentary block in ${dialogue}`);
  }

  if (citedAcceptedLocalEvidenceExists(
    failedBlocks,
    dialogue,
    context.observations,
    context.claims,
  )) return undefined;

  const ranges = failedBlocks.length > 0
    ? failedBlocks.map(({ startChar, endChar }) => ({ startChar, endChar }))
    : [{
        startChar: resolveSourceSpan(dialogue, brief.sectionSpan).source_ref.start_char,
        endChar: resolveSourceSpan(dialogue, brief.sectionSpan).source_ref.end_char,
      }];
  const selectedObservations = selectAnchoredEvidence(
    context.anchoredObservations,
    ranges,
    REWRITE_EVIDENCE_MAX_OBSERVATIONS,
  );
  const selectedClaims = selectAnchoredEvidence(
    context.anchoredClaims,
    ranges,
    REWRITE_EVIDENCE_MAX_CLAIMS,
  );
  const selectedClaimIds = new Set(selectedClaims.map((record) => record.id));
  const selectedRelations = [...context.dialogueRelations.values()]
    .map((record) => ({ record, id: fieldValue(record.block, "relation_id") ?? "" }))
    .filter(({ record, id }) => {
      if (!id) return false;
      const claimA = fieldValue(record.block, "claim_a") ?? "";
      const claimB = fieldValue(record.block, "claim_b") ?? "";
      return selectedClaimIds.has(claimA) || selectedClaimIds.has(claimB);
    })
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, REWRITE_EVIDENCE_MAX_RELATIONS)
    .map(({ record, id }) => ({ ...record, id }));

  const dossierPaths = [...new Set(selectedObservations
    .flatMap((record) => dossierPathsByObservation.get(record.id) ?? [])
    .map((path) => existsSync(join(repoRoot, path)) ? path : undefined)
    .filter((path): path is string => path !== undefined))]
    .sort()
    .slice(0, REWRITE_EVIDENCE_MAX_DOSSIERS);

  const lines: string[] = [
    `# Commentary rewrite evidence supplement: ${dialogue} / ${brief.unitKey}`,
    "",
    `- dialogue: ${dialogue}`,
    `- unit_key: ${brief.unitKey}`,
    `- failed_commentary_ids: ${failedIds.join(", ")}`,
    "- selection: exact source_ref overlap with failed block spans; records are dialogue-local and ordered by failed-block order, source start, source end, then ID",
    `- caps: observations=${REWRITE_EVIDENCE_MAX_OBSERVATIONS}, claims=${REWRITE_EVIDENCE_MAX_CLAIMS}, relations=${REWRITE_EVIDENCE_MAX_RELATIONS}, dossiers=${REWRITE_EVIDENCE_MAX_DOSSIERS}`,
    "",
    "Use these accepted records only as candidate citations. The supplement is bounded and is not permission to infer unsupported claims.",
    "",
    ...supplementRecordLines("observations", selectedObservations),
    ...supplementRecordLines("claims", selectedClaims),
    "## Candidate accepted relations",
    "",
    ...(selectedRelations.length === 0 ? ["(none)", ""] : selectedRelations.flatMap((record) => [
      `### ${record.id}`,
      "",
      `- source: ${record.path}`,
      "",
      "```yaml",
      record.block,
      "```",
      "",
    ])),
    "## Candidate accepted dossiers",
    "",
    ...(dossierPaths.length === 0 ? ["(none)", ""] : dossierPaths.flatMap((path) => {
      const dossier = readFileSync(join(repoRoot, path), "utf8").trimEnd();
      const bounded = dossier.length > REWRITE_EVIDENCE_MAX_DOSSIER_CHARS
        ? `${dossier.slice(0, REWRITE_EVIDENCE_MAX_DOSSIER_CHARS)}\n[bounded supplement truncation]`
        : dossier;
      return [`### ${path}`, "", "```markdown", bounded, "```", ""];
    })),
  ];
  const content = `${lines.join("\n").trimEnd()}\n`;
  const digest = sha256(content);
  return {
    path: `scratch/commentary/rewrite-evidence/${dialogue}/${brief.unitKey}-${digest}.md`,
    content,
    sha256: digest,
  };
}

export function writeCommentaryRewriteEvidenceSupplement(supplement: CommentaryRewriteEvidenceSupplement) {
  const absolutePath = join(getRepoRoot(), supplement.path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, supplement.content, "utf8");
}

export function buildCommentaryAuditBriefs(
  dialogue: string,
  evidence = buildCommentaryAuditEvidenceSnapshot(),
  unitKeys?: ReadonlySet<string>,
): CommentaryAuditBrief[] {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const repoRoot = getRepoRoot();
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const protocolPath = "docs/commentary-protocol.md";
  const greekPath = `raw/plato/greek/${dialogue}.txt`;
  const englishPath = `raw/plato/english/${dialogue}.txt`;
  for (const path of [ledgerPath, protocolPath, greekPath, englishPath]) {
    if (!existsSync(join(repoRoot, path))) throw new Error(`Commentary audit input does not exist: ${path}`);
  }

  return buildCommentaryAuditBriefsFromSnapshot(dialogue, {
    ledgerContent: readFileSync(join(repoRoot, ledgerPath), "utf8"),
    protocolContent: readFileSync(join(repoRoot, protocolPath), "utf8"),
    evidence,
  }, unitKeys);
}

/**
 * Rebuild deterministic unit contracts from bytes already frozen by a caller.
 * This keeps a batch operation from rereading the same ledger and protocol for
 * every unit while preserving the exact brief construction used by fresh jobs.
 */
export function buildCommentaryAuditBriefsFromSnapshot(
  dialogue: string,
  snapshot: CommentaryAuditBriefInputSnapshot,
  unitKeys?: ReadonlySet<string>,
): CommentaryAuditBrief[] {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const repoRoot = getRepoRoot();
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const protocolPath = "docs/commentary-protocol.md";
  const greekPath = `raw/plato/greek/${dialogue}.txt`;
  const englishPath = `raw/plato/english/${dialogue}.txt`;
  for (const path of [greekPath, englishPath]) {
    if (!existsSync(join(repoRoot, path))) throw new Error(`Commentary audit input does not exist: ${path}`);
  }
  const englishContent = readFileSync(join(repoRoot, englishPath), "utf8");

  const ledgerContent = snapshot.ledgerContent;
  const evidence = snapshot.evidence;
  const blocks = commentaryBlocks(dialogue, ledgerContent);
  // Sections are the structural scaffold for audit units. Keep rejected
  // sections in this ordering so a structural removal cannot renumber later
  // unit keys or move their section identity. Rejected blocks themselves are
  // never auditable content; active non-section blocks may still belong to a
  // rejected section and must remain in that section's unit.
  const sections = blocks.filter((block) => block.kind === "section").sort((a, b) => a.startChar - b.startChar);
  const nonSections = blocks.filter((block) => block.kind !== "section" && block.status !== "rejected");
  if (sections.length === 0) return [];

  const assignments = new Map<string, CommentaryBlock[]>();
  for (const section of sections) assignments.set(section.id, []);
  for (const block of nonSections) {
    const owners = sections.filter((section) => block.startChar >= section.startChar && block.endChar <= section.endChar);
    if (owners.length !== 1) {
      throw new Error(`Commentary block ${block.id} must belong to exactly one section for quality audit; found ${owners.length}`);
    }
    assignments.get(owners[0]!.id)!.push(block);
  }

  const auditContract = commentaryAuditContract(snapshot.protocolContent);
  const auditContractSha = sha256(auditContract);
  return sections.flatMap((section, index) => {
    const sectionRef = resolveSourceSpan(dialogue, section.span).source_ref;
    const unitKey = `${String(index + 1).padStart(2, "0")}-${sectionRef.start_marker}-${sectionRef.end_marker}`;
    if (unitKeys && !unitKeys.has(unitKey)) return [];
    const contained = [
      ...(section.status === "rejected" ? [] : [section]),
      ...(assignments.get(section.id) ?? []).sort((a, b) => a.index - b.index),
    ];
    const commentaryIds = contained.map((block) => block.id);
    const inputPaths = new Set([protocolPath, ledgerPath, greekPath, englishPath]);
    const cites = contained.map((block) => commentaryCites(block.content));
    const observationIds = cites.flatMap((entry) => entry.observations);
    const claimIds = cites.flatMap((entry) => entry.claims);
    const relationIds = cites.flatMap((entry) => entry.relations);
    const dossierPaths = [...new Set(cites.flatMap((entry) => entry.dossiers).map((entry) => `wiki/dossiers/${entry}.json`))].sort();
    const evidenceForHash = [
      ...new Set([
        ...observationIds,
        ...claimIds,
        ...relationIds,
      ]),
    ].sort().map((id) => {
      const record = evidence.observations.get(id) ?? evidence.claims.get(id) ?? evidence.relations.get(id);
      if (!record) throw new Error(`Commentary audit cannot resolve accepted evidence ${id}`);
      return `${id}\n${projectedEvidenceBlock(record.block)}`;
    });
    const dossierContents = new Map<string, string>();
    for (const path of dossierPaths) {
      const absolutePath = join(repoRoot, path);
      if (!existsSync(absolutePath)) throw new Error(`Commentary audit cannot resolve cited dossier ${path}`);
      dossierContents.set(path, readFileSync(absolutePath, "utf8").trimEnd());
    }
    const sectionGreek = resolveSourceSpan(dialogue, section.span);
    const sectionEnglish = resolveEnglishSpan(dialogue, section.span);
    const auditedContentSha256 = sha256([
      `contract:${auditContractSha}`,
      `unit:${unitKey}`,
      `section:${section.id}`,
      `span:${section.span}`,
      `greek:${sectionGreek.source_ref.text_sha256}`,
      `english:${sectionEnglish.source_ref.text_sha256}`,
      ...contained.map((block) => `${block.id}\n${auditedBlockContent(block.content)}`),
      ...evidenceForHash,
      ...[...dossierContents].map(([path, dossier]) => `${path}\n${dossier}`),
    ].join("\n---\n"));

    const lines: string[] = [
      "# Commentary quality-audit contract",
      "",
      `- quality_protocol: ${protocolPath}`,
      `- audit_contract_sha256: ${auditContractSha}`,
      "",
      `Extracted verbatim from ${protocolPath}. This is the complete quality-bearing contract; operator and validator workflow outside this excerpt does not govern the verdict.`,
      "",
      auditContract.trimEnd(),
      "",
      `# Commentary quality-audit unit: ${dialogue} / ${unitKey}`,
      "",
      `- dialogue: ${dialogue}`,
      `- unit_key: ${unitKey}`,
      `- section: ${section.id}`,
      `- section_span: ${section.span}`,
      `- commentary_ids: ${commentaryIds.join(", ")}`,
      `- non_section_interruptions: ${contained.filter((block) => block.kind !== "section").length}`,
      `- canonical_ledger: ${ledgerPath}`,
      `- audited_content_sha256: ${auditedContentSha256}`,
      "",
      "The listed commentary IDs are exhaustive for this unit. The audit output must assess each exactly once.",
      "",
      "## Exact section source",
      "",
      ...sourceLines(dialogue, section.span, `${section.id} source`),
      "## Exact canonical commentary blocks",
      "",
      "The exact unit source appears once above. Each block's source_ref selects its evidence anchor; its separately resolved English playback edge is the only placement authority.",
      "",
    ];

    for (const block of contained) {
      const body = fieldValue(block.content, "body") ?? "";
      const playback = playbackBoundaryLines(dialogue, englishContent, block);
      for (const path of playback.inputPaths) inputPaths.add(path);
      lines.push(
        `### ${block.id} (${block.kind})`,
        "",
        `- spoken_words: ${body.trim().length === 0 ? 0 : body.trim().split(/\s+/u).length}`,
        "",
        ...playback.lines,
        "```yaml",
        auditedBlockContent(block.content),
        "```",
        "",
      );
    }

    lines.push(
      ...exactEvidenceLines("observations", observationIds, evidence.observations, inputPaths),
      ...exactEvidenceLines("claims", claimIds, evidence.claims, inputPaths),
      ...exactEvidenceLines("relations", relationIds, evidence.relations, inputPaths),
      "## Accepted dossiers cited by this unit",
      "",
    );
    if (dossierPaths.length === 0) {
      lines.push("(none)", "");
    } else {
      for (const path of dossierPaths) {
        inputPaths.add(path);
        lines.push(`### ${path}`, "", "```markdown", dossierContents.get(path)!, "```", "");
      }
    }

    const content = `${lines.join("\n").trimEnd()}\n`;
    return [{
      dialogue,
      unitKey,
      sectionId: section.id,
      sectionSpan: section.span,
      commentaryIds,
      inputPaths: [...inputPaths].sort(),
      // The content-addressed brief embeds every quality-bearing byte. Hashing
      // aggregate source, evidence, or ledger files here would reopen sibling
      // units for unrelated edits.
      hashInputPaths: [],
      auditedContentSha256,
      content,
      sha256: sha256(content),
      path: `scratch/commentary/audit-briefs/${dialogue}/${unitKey}.md`,
    }];
  });
}

export function writeCommentaryAuditBriefs(dialogue: string): WrittenCommentaryAuditBrief[] {
  const repoRoot = getRepoRoot();
  return buildCommentaryAuditBriefs(dialogue).map(({ content, ...brief }) => {
    const absolutePath = join(repoRoot, brief.path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content, "utf8");
    return brief;
  });
}

export function parseCommentaryQualityAudit(
  value: unknown,
  options: { path?: string; expectedCommentaryIds?: string[] } = {},
): CommentaryQualityAudit {
  const path = options.path ?? "quality audit";
  const record = objectValue(value, path);
  exactKeys(record, ["schema_version", "dialogue", "unit_key", "section_id", "authoring", "unit_verdict", "blocks"], path);
  if (record.schema_version !== AUDIT_SCHEMA_VERSION) throw new Error(`${path}.schema_version must be 3`);
  const dialogue = nonEmptyString(record.dialogue, `${path}.dialogue`);
  const unitKey = nonEmptyString(record.unit_key, `${path}.unit_key`);
  const sectionId = nonEmptyString(record.section_id, `${path}.section_id`);
  if (!DIALOGUE.test(dialogue) || !UNIT_KEY.test(unitKey) || !COMMENTARY_ID.test(sectionId)) {
    throw new Error(`${path} has an invalid audit identity`);
  }
  const authoring = objectValue(record.authoring, `${path}.authoring`);
  exactKeys(authoring, ["model", "effort"], `${path}.authoring`);
  if (
    authoring.model !== COMMENTARY_AUTHORING_MODEL ||
    authoring.effort !== COMMENTARY_STAGE_EFFORT.audit
  ) {
    throw new Error(
      `${path}.authoring must record model ${COMMENTARY_AUTHORING_MODEL} and effort ${COMMENTARY_STAGE_EFFORT.audit}`,
    );
  }
  if (record.unit_verdict !== "pass" && record.unit_verdict !== "fail") {
    throw new Error(`${path}.unit_verdict must be pass or fail`);
  }
  if (!Array.isArray(record.blocks)) throw new Error(`${path}.blocks must be an array`);
  if (record.blocks.length === 0 && options.expectedCommentaryIds?.length !== 0) {
    throw new Error(`${path}.blocks must be non-empty unless the expected commentary set is empty`);
  }

  const seen = new Set<string>();
  const blocks = record.blocks.map((value, index) => {
    const blockPath = `${path}.blocks[${index}]`;
    const block = objectValue(value, blockPath);
    exactKeys(block, ["commentary_id", "disposition", "issue_codes", "checks", "rationale"], blockPath);
    const commentaryId = nonEmptyString(block.commentary_id, `${blockPath}.commentary_id`);
    if (!COMMENTARY_ID.test(commentaryId)) throw new Error(`${blockPath}.commentary_id is invalid`);
    if (seen.has(commentaryId)) throw new Error(`${blockPath}.commentary_id duplicates ${commentaryId}`);
    seen.add(commentaryId);
    if (!(["pass", "rewrite", "remove", "split"] as const).includes(block.disposition as CommentaryQualityDisposition)) {
      throw new Error(`${blockPath}.disposition is invalid`);
    }
    if (!Array.isArray(block.issue_codes)) throw new Error(`${blockPath}.issue_codes must be an array`);
    const issueCodes = block.issue_codes.map((code, issueIndex) => {
      if (!COMMENTARY_QUALITY_ISSUE_CODES.includes(code as CommentaryQualityIssueCode)) {
        throw new Error(`${blockPath}.issue_codes[${issueIndex}] is not in the closed listening-quality code set`);
      }
      return code as CommentaryQualityIssueCode;
    });
    if (new Set(issueCodes).size !== issueCodes.length) throw new Error(`${blockPath}.issue_codes must be unique`);
    const disposition = block.disposition as CommentaryQualityDisposition;
    const checksRecord = objectValue(block.checks, `${blockPath}.checks`);
    exactKeys(checksRecord, ["evidence", "placement", "listening"], `${blockPath}.checks`);
    const check = (name: "evidence" | "listening") => {
      const checkPath = `${blockPath}.checks.${name}`;
      const value = objectValue(checksRecord[name], checkPath);
      exactKeys(value, ["verdict"], checkPath);
      if (value.verdict !== "pass" && value.verdict !== "fail") {
        throw new Error(`${checkPath}.verdict must be pass or fail`);
      }
      return { verdict: value.verdict as CommentaryQualityCheckVerdict };
    };
    const placementPath = `${blockPath}.checks.placement`;
    const placementValue = objectValue(checksRecord.placement, placementPath);
    exactKeys(placementValue, ["verdict", "hazard_codes"], placementPath);
    if (placementValue.verdict !== "pass" && placementValue.verdict !== "fail") {
      throw new Error(`${placementPath}.verdict must be pass or fail`);
    }
    if (!Array.isArray(placementValue.hazard_codes)) {
      throw new Error(`${placementPath}.hazard_codes must be an array`);
    }
    const hazardCodes = placementValue.hazard_codes.map((code, hazardIndex) => {
      if (!COMMENTARY_PLACEMENT_HAZARD_CODES.includes(code as CommentaryPlacementHazardCode)) {
        throw new Error(`${placementPath}.hazard_codes[${hazardIndex}] is not in the closed placement-hazard code set`);
      }
      return code as CommentaryPlacementHazardCode;
    });
    if (new Set(hazardCodes).size !== hazardCodes.length) {
      throw new Error(`${placementPath}.hazard_codes must be unique`);
    }
    const placementVerdict = placementValue.verdict as CommentaryQualityCheckVerdict;
    if ((placementVerdict === "fail") !== (hazardCodes.length > 0)) {
      throw new Error(`${placementPath}.verdict must fail exactly when hazard_codes is non-empty`);
    }
    const checks = {
      evidence: check("evidence"),
      placement: {
        verdict: placementVerdict,
        hazard_codes: hazardCodes,
      },
      listening: check("listening"),
    };
    const allChecksPass = Object.values(checks).every(({ verdict }) => verdict === "pass");
    if ((disposition === "pass") !== allChecksPass || (issueCodes.length === 0) !== allChecksPass) {
      throw new Error(
        `${blockPath} pass requires all three checks to pass with no issue codes; every non-pass requires a failed check and at least one issue code`,
      );
    }
    const evidenceCodes = new Set<CommentaryQualityIssueCode>([
      "source_misreading",
      "certainty_exceeds_evidence",
      "unsupported_or_miscited_claim",
    ]);
    const placementCodes = new Set<CommentaryQualityIssueCode>(["interrupts_dramatic_flow"]);
    const listeningCodes = new Set<CommentaryQualityIssueCode>([
      "source_recap",
      "generic_or_reusable",
      "multiple_jobs",
      "repetitive_throat_clearing",
      "redundant_within_unit",
      "hard_to_follow_aloud",
      "excessive_unit_interruptions",
    ]);
    const requireMatchingDimension = (
      name: "evidence" | "placement" | "listening",
      codes: ReadonlySet<CommentaryQualityIssueCode>,
    ) => {
      const hasCode = issueCodes.some((code) => codes.has(code));
      if ((checks[name].verdict === "fail") !== hasCode) {
        throw new Error(`${blockPath}.checks.${name}.verdict must fail exactly when issue_codes contains a matching ${name} code`);
      }
    };
    requireMatchingDimension("evidence", evidenceCodes);
    requireMatchingDimension("placement", placementCodes);
    requireMatchingDimension("listening", listeningCodes);
    if (checks.placement.verdict === "fail" && disposition !== "remove") {
      throw new Error(`${blockPath} unsafe placement requires disposition remove because prose-only rewriting preserves the insertion edge`);
    }
    const rationale = auditRationale(block.rationale, `${blockPath}.rationale`);
    return { commentary_id: commentaryId, disposition, issue_codes: issueCodes, checks, rationale };
  });

  if (options.expectedCommentaryIds) {
    const expected = options.expectedCommentaryIds;
    const expectedSet = new Set(expected);
    const unknown = blocks.map((block) => block.commentary_id).filter((id) => !expectedSet.has(id));
    const omitted = expected.filter((id) => !seen.has(id));
    if (unknown.length > 0 || omitted.length > 0 || blocks.length !== expected.length) {
      throw new Error(`${path} must cover every commentary_id exactly once; unknown=[${unknown.join(", ")}] omitted=[${omitted.join(", ")}]`);
    }
    blocks.sort((a, b) => expected.indexOf(a.commentary_id) - expected.indexOf(b.commentary_id));
  }

  const allPass = blocks.every((block) => block.disposition === "pass");
  if ((record.unit_verdict === "pass") !== allPass) {
    throw new Error(`${path}.unit_verdict must be pass exactly when every commentary block passes`);
  }
  return {
    schema_version: AUDIT_SCHEMA_VERSION,
    dialogue,
    unit_key: unitKey,
    section_id: sectionId,
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
    unit_verdict: record.unit_verdict,
    blocks,
  };
}

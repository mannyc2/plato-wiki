import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  inspectAudioInsertionBlock,
  resolveAudioInsertionBoundary,
} from "../audio-insertion.js";
import { inspectCommentaryListenerProse } from "../commentary-listener-prose.js";
import { getRepoRoot } from "../paths.js";
import { listGreekDialogues } from "../derived/stephanus.js";
import { resolveSourceSpan } from "../source.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./claim-ledger.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { fieldValue, listObservationLedgerPaths, observationYamlBlocks } from "./observation-ledger.js";
import { relationYamlBlocks, listRelationLedgerPaths } from "./relation-ledger.js";

export type CommentaryLedgerValidationIssue = {
  code:
    | "missing_field"
    | "unknown_field"
    | "id_format"
    | "id_sequence"
    | "source_work_mismatch"
    | "span_invalid"
    | "source_ref_mismatch"
    | "block_kind_invalid"
    | "placement_invalid"
    | "audio_insertion_invalid"
    | "section_title"
    | "section_order"
    | "section_overlap"
    | "orphan_block"
    | "crossref_empty"
    | "crossref_work_unknown"
    | "crossref_ref_mismatch"
    | "cite_unknown_id"
    | "cite_not_accepted"
    | "cite_dossier_missing"
    | "accepted_citation_required"
    | "body_empty"
    | "body_internal_id"
    | "body_incomplete_sentence"
    | "body_greek_run"
    | "title_internal_id"
    | "author_invalid"
    | "review_status_invalid";
  message: string;
  fix: string;
  commentaryId?: string;
  line?: number;
};

export type CommentaryCitationIndex = {
  observations: Map<string, string>;
  claims: Map<string, string>;
  relations: Map<string, string>;
};

type ParsedSourceRef = {
  source_path: string | undefined;
  stephanus_span: string | undefined;
  start_marker: string | undefined;
  end_marker: string | undefined;
  start_char: number | undefined;
  end_char: number | undefined;
  text_sha256: string | undefined;
};

type ParsedCrossref = {
  index: number;
  line: number;
  sourceWork: string | undefined;
  stephanusSpan: string | undefined;
  note: string | undefined;
  sourceRef: ParsedSourceRef;
  hasSourceRef: boolean;
};

type ParsedCites = {
  observations: string[];
  claims: string[];
  relations: string[];
  dossiers: string[];
};

type CommentaryBlock = {
  content: string;
  startLine: number;
  index: number;
  commentaryId: string;
};

export const COMMENTARY_GREEK_RUN_MAX = 80;

const GREEK_RUN_RE = /[Ͱ-Ͽἀ-῿](?:[Ͱ-Ͽἀ-῿\s'’ʼ,.;·()—–-]*[Ͱ-Ͽἀ-῿])?/gu;
const TOP_LEVEL_FIELD_RE = /^([a-z_]+):\s*(.*)$/u;
const BLOCK_KIND_VALUES = new Set(["section", "context", "argument", "notice", "crossref", "question"]);
const PLACEMENT_VALUES = new Set(["before", "after"]);
const AUTHOR_VALUES = new Set(["operator", "model"]);
const REVIEW_STATUSES = new Set(["unreviewed", "accepted", "rejected", "needs_split"]);
const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  "commentary_id",
  "source_work",
  "block_kind",
  "placement",
  "title",
  "stephanus_span",
  "source_ref",
  "audio_insertion",
  "body",
  "cites",
  "crossrefs",
  "author",
  "review_status",
]);
const CITE_LIST_FIELDS = ["observations", "claims", "relations", "dossiers"] as const;

function cleanScalar(rawValue: string | undefined) {
  return rawValue?.trim().replace(/^["']|["']$/gu, "");
}

function lineIndent(line: string) {
  return /^\s*/u.exec(line)?.[0].length ?? 0;
}

function parseNumber(value: string | undefined) {
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function workNameToSlug(workName: string) {
  return workName
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/gu, "-");
}

function extractCommentaryBlocks(content: string): CommentaryBlock[] {
  return commentaryMarkdownBlocks(content).map((block) => ({
    content: block.content,
    startLine: block.startLine,
    index: block.index,
    commentaryId: block.commentaryId ?? `comm_${String(block.index + 1).padStart(4, "0")}`,
  }));
}

function indentedSection(lines: string[], startIndex: number, parentIndent: number) {
  const section: Array<{ line: string; offset: number }> = [];
  for (const [offset, line] of lines.slice(startIndex + 1).entries()) {
    if (line.trim().length > 0 && lineIndent(line) <= parentIndent) break;
    section.push({ line, offset: startIndex + 1 + offset });
  }

  return section;
}

function sourceRefFromLines(lines: string[]): ParsedSourceRef {
  const nested = (field: string) => {
    for (const line of lines) {
      const match = new RegExp(`^\\s+${field}:\\s*(.*)$`, "u").exec(line);
      if (match) return cleanScalar(match[1]);
    }
    return undefined;
  };

  return {
    source_path: nested("source_path"),
    stephanus_span: nested("stephanus_span"),
    start_marker: nested("start_marker"),
    end_marker: nested("end_marker"),
    start_char: parseNumber(nested("start_char")),
    end_char: parseNumber(nested("end_char")),
    text_sha256: nested("text_sha256"),
  };
}

function sourceRefFromFlowMap(flow: string): ParsedSourceRef {
  const entries = new Map<string, string>();
  for (const pair of flow.split(",")) {
    const match = /^\s*([a-z_]+):\s*(.*?)\s*$/u.exec(pair);
    if (match) entries.set(match[1]!, cleanScalar(match[2]) ?? "");
  }

  return {
    source_path: entries.get("source_path"),
    stephanus_span: entries.get("stephanus_span"),
    start_marker: entries.get("start_marker"),
    end_marker: entries.get("end_marker"),
    start_char: parseNumber(entries.get("start_char")),
    end_char: parseNumber(entries.get("end_char")),
    text_sha256: entries.get("text_sha256"),
  };
}

function topLevelSourceRef(block: string): { sourceRef: ParsedSourceRef; present: boolean } {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => /^source_ref:/u.test(line));
  if (startIndex === -1) return { sourceRef: sourceRefFromLines([]), present: false };

  const inline = /^source_ref:\s*\{(.*)\}\s*$/u.exec(lines[startIndex]!);
  if (inline) return { sourceRef: sourceRefFromFlowMap(inline[1]!), present: true };

  const section = indentedSection(lines, startIndex, 0);
  return { sourceRef: sourceRefFromLines(section.map((entry) => entry.line)), present: true };
}

function listItemsFromValue(rawValue: string | undefined, sectionLines: string[]): string[] {
  const value = rawValue?.trim() ?? "";
  if (value.startsWith("[")) {
    const body = value.replace(/^\[/u, "").replace(/\]$/u, "").trim();
    if (!body) return [];
    return body
      .split(/,\s*/u)
      .map((entry) => cleanScalar(entry) ?? "")
      .filter(Boolean);
  }

  return sectionLines
    .map((line) => /^\s+-\s+(.*)$/u.exec(line)?.[1])
    .filter((entry): entry is string => entry !== undefined)
    .map((entry) => cleanScalar(entry) ?? "")
    .filter(Boolean);
}

function parseCites(block: string): { cites: ParsedCites; present: boolean; unknownFields: string[] } {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => /^cites:/u.test(line));
  const cites: ParsedCites = { observations: [], claims: [], relations: [], dossiers: [] };
  if (startIndex === -1) return { cites, present: false, unknownFields: [] };

  const section = indentedSection(lines, startIndex, 0);
  const unknownFields: string[] = [];
  for (const [position, entry] of section.entries()) {
    const match = /^\s+([a-z_]+):\s*(.*)$/u.exec(entry.line);
    if (!match || lineIndent(entry.line) !== 2) continue;

    const field = match[1]!;
    if (!CITE_LIST_FIELDS.includes(field as (typeof CITE_LIST_FIELDS)[number])) {
      unknownFields.push(field);
      continue;
    }

    const remainder = section.slice(position + 1).map((subEntry) => subEntry.line);
    const itemLines: string[] = [];
    for (const line of remainder) {
      if (line.trim().length > 0 && lineIndent(line) <= 2) break;
      itemLines.push(line);
    }

    cites[field as (typeof CITE_LIST_FIELDS)[number]] = listItemsFromValue(match[2], itemLines);
  }

  return { cites, present: true, unknownFields };
}

function parseCrossrefs(block: string, startLine: number): { crossrefs: ParsedCrossref[]; present: boolean } {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => /^crossrefs:/u.test(line));
  if (startIndex === -1) return { crossrefs: [], present: false };

  const inlineValue = /^crossrefs:\s*(\S.*)$/u.exec(lines[startIndex]!)?.[1]?.trim();
  if (inlineValue === "[]") return { crossrefs: [], present: true };

  const section = indentedSection(lines, startIndex, 0);
  const entries: Array<Array<{ line: string; offset: number }>> = [];
  let current: Array<{ line: string; offset: number }> | undefined;
  for (const entry of section) {
    if (/^\s+-\s*/u.test(entry.line) && lineIndent(entry.line) === 2) {
      current = [{ line: entry.line.replace(/^(\s+)-\s?/u, "$1  "), offset: entry.offset }];
      entries.push(current);
      continue;
    }
    current?.push(entry);
  }

  const crossrefs = entries.map((entryLines, index) => {
    const text = entryLines.map((entry) => entry.line).join("\n");
    const nested = (field: string) => cleanScalar(new RegExp(`^\\s+${field}:\\s*(.*)$`, "mu").exec(text)?.[1]);
    const flowMatch = /^\s+source_ref:\s*\{(.*)\}\s*$/mu.exec(text);
    const hasSourceRef = /^\s+source_ref:/mu.test(text);
    const sourceRef = flowMatch
      ? sourceRefFromFlowMap(flowMatch[1]!)
      : sourceRefFromLines(
          (() => {
            const entryRaw = entryLines.map((entry) => entry.line);
            const refIndex = entryRaw.findIndex((line) => /^\s+source_ref:\s*$/u.test(line));
            if (refIndex === -1) return [];
            const refIndent = lineIndent(entryRaw[refIndex]!);
            const nestedLines: string[] = [];
            for (const line of entryRaw.slice(refIndex + 1)) {
              if (line.trim().length > 0 && lineIndent(line) <= refIndent) break;
              nestedLines.push(line);
            }
            return nestedLines;
          })(),
        );

    return {
      index,
      line: startLine + (entryLines[0]?.offset ?? 0),
      sourceWork: nested("source_work"),
      stephanusSpan: nested("stephanus_span"),
      note: nested("note"),
      sourceRef,
      hasSourceRef,
    };
  });

  return { crossrefs, present: true };
}

function normalizeSpanText(span: string) {
  return span.trim().replace(/[–—]/gu, "-").replace(/\s+/gu, "");
}

function parseSpanShape(span: string) {
  const normalized = normalizeSpanText(span);
  const match = /^(\d+[a-e])(?:-(\d+[a-e]))?$/u.exec(normalized);
  if (!match) return undefined;

  return { start: match[1]!, end: match[2] ?? match[1]!, normalized };
}

function resolveSpanOrUndefined(slug: string, span: string) {
  try {
    return resolveSourceSpan(slug, span);
  } catch {
    return undefined;
  }
}

function sourceRefsEqual(stated: ParsedSourceRef, resolved: ParsedSourceRef) {
  return (
    stated.source_path === resolved.source_path &&
    stated.stephanus_span !== undefined &&
    resolved.stephanus_span !== undefined &&
    normalizeSpanText(stated.stephanus_span) === normalizeSpanText(resolved.stephanus_span) &&
    stated.start_marker === resolved.start_marker &&
    stated.end_marker === resolved.end_marker &&
    stated.start_char === resolved.start_char &&
    stated.end_char === resolved.end_char &&
    stated.text_sha256 === resolved.text_sha256
  );
}

function statusMapFromLedgers(paths: string[], blocksOf: (content: string) => string[], idField: string) {
  const repoRoot = getRepoRoot();
  const statuses = new Map<string, string>();

  for (const relativePath of paths) {
    const absolutePath = join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) continue;
    for (const block of blocksOf(readFileSync(absolutePath, "utf8"))) {
      const id = fieldValue(block, idField);
      if (!id) continue;
      statuses.set(id, fieldValue(block, "review_status") ?? "unreviewed");
    }
  }

  return statuses;
}

/**
 * Parsing every observation, claim and relation ledger costs seconds and yields
 * the same index for every caller. Callers that validate one ledger at a time —
 * `validate`, the apparatus validator, the audio coverage report — used to pay
 * it once per ledger. Cache on the exact bytes the filesystem reports, so an
 * edit between two calls still rebuilds; a stale index would let a commentary
 * block cite a record that is no longer accepted.
 */
let commentaryCitationIndexCache: { stamp: string; index: CommentaryCitationIndex } | undefined;

function citationIndexStamp(pathGroups: string[][]) {
  const repoRoot = getRepoRoot();
  return [
    repoRoot,
    ...pathGroups.flat().map((relativePath) => {
      const absolutePath = join(repoRoot, relativePath);
      if (!existsSync(absolutePath)) return `${relativePath}:absent`;
      const stats = statSync(absolutePath);
      return `${relativePath}:${stats.size}:${stats.mtimeMs}`;
    }),
  ].join("|");
}

export function buildCommentaryCitationIndex(): CommentaryCitationIndex {
  const observationPaths = listObservationLedgerPaths();
  const claimPaths = listClaimLedgerPaths();
  const relationPaths = listRelationLedgerPaths();
  const stamp = citationIndexStamp([observationPaths, claimPaths, relationPaths]);
  if (commentaryCitationIndexCache?.stamp === stamp) return commentaryCitationIndexCache.index;

  const index: CommentaryCitationIndex = {
    observations: statusMapFromLedgers(observationPaths, observationYamlBlocks, "observation_id"),
    claims: statusMapFromLedgers(claimPaths, claimYamlBlocks, "claim_id"),
    relations: statusMapFromLedgers(relationPaths, relationYamlBlocks, "relation_id"),
  };
  commentaryCitationIndexCache = { stamp, index };
  return index;
}

function validateCiteList(
  block: CommentaryBlock,
  family: "observations" | "claims" | "relations",
  ids: string[],
  citationIndex: CommentaryCitationIndex,
  issues: CommentaryLedgerValidationIssue[],
) {
  for (const id of ids) {
    const status = citationIndex[family].get(id);
    if (status === undefined) {
      issues.push({
        code: "cite_unknown_id",
        commentaryId: block.commentaryId,
        message: `cites.${family} id \`${id}\` does not exist in any ${family} ledger.`,
        fix: "Cite only record ids copied from the ledgers; remove or correct the id.",
      });
      continue;
    }
    if (status !== "accepted") {
      issues.push({
        code: "cite_not_accepted",
        commentaryId: block.commentaryId,
        message: `cites.${family} id \`${id}\` has review_status \`${status}\`; only accepted records may be cited.`,
        fix: "Cite accepted records only, or drop the citation until the record is accepted.",
      });
    }
  }
}

function dossierCitePath(entry: string) {
  const match = /^([a-z0-9_-]+)\/([a-z0-9_-]+)$/u.exec(entry);
  return match ? join(getRepoRoot(), "wiki/dossiers", match[1]!, `${match[2]}.json`) : undefined;
}

function validateDossierCites(block: CommentaryBlock, dossiers: string[], issues: CommentaryLedgerValidationIssue[]) {
  for (const entry of dossiers) {
    const path = dossierCitePath(entry);
    if (!path || !existsSync(path)) {
      issues.push({
        code: "cite_dossier_missing",
        commentaryId: block.commentaryId,
        message: `cites.dossiers entry \`${entry}\` does not resolve to a wiki/dossiers/<axis_key>/<concept_key>.json file.`,
        fix: "Use the <axis_key>/<concept_key> path of an existing vNext dossier projection.",
      });
    }
  }
}

function hasCanonicalCitation(parsedCites: ParsedCites, citationIndex: CommentaryCitationIndex) {
  return (
    parsedCites.observations.some((id) => citationIndex.observations.get(id) === "accepted") ||
    parsedCites.claims.some((id) => citationIndex.claims.get(id) === "accepted") ||
    parsedCites.relations.some((id) => citationIndex.relations.get(id) === "accepted") ||
    parsedCites.dossiers.some((entry) => {
      const path = dossierCitePath(entry);
      return path !== undefined && existsSync(path);
    })
  );
}

function requiresSemanticCitation(blockKind: string | undefined) {
  return blockKind === "argument" || blockKind === "question";
}

export function acceptedCommentaryMissingCanonicalCitation(
  block: string,
  citationIndex: CommentaryCitationIndex = buildCommentaryCitationIndex(),
) {
  return (
    fieldValue(block, "review_status") === "accepted" &&
    requiresSemanticCitation(fieldValue(block, "block_kind")) &&
    !hasCanonicalCitation(parseCites(block).cites, citationIndex)
  );
}

function firstLongGreekRun(text: string) {
  for (const match of text.matchAll(GREEK_RUN_RE)) {
    if ((match[0]?.length ?? 0) > COMMENTARY_GREEK_RUN_MAX) return match[0];
  }

  return undefined;
}

export function commentaryCites(block: string) {
  return parseCites(block).cites;
}

export function commentaryCrossrefs(block: string) {
  return parseCrossrefs(block, 0).crossrefs.map((crossref) => ({
    sourceWork: crossref.sourceWork ?? "",
    stephanusSpan: crossref.stephanusSpan ?? "",
    note: crossref.note ?? "",
  }));
}

export function validateCommentaryLedger(
  path: string,
  content: string,
  citationIndex?: CommentaryCitationIndex,
): CommentaryLedgerValidationIssue[] {
  const issues: CommentaryLedgerValidationIssue[] = [];
  const slug = /^wiki\/commentary\/(.+)\.md$/u.exec(path)?.[1];
  const blocks = extractCommentaryBlocks(content);
  const greekDialogues = new Set(listGreekDialogues());
  const cites = citationIndex ?? buildCommentaryCitationIndex();
  const sections: Array<{ commentaryId: string; startChar: number; endChar: number }> = [];
  const nonSections: Array<{ commentaryId: string; startChar: number | undefined }> = [];

  for (const block of blocks) {
    const lines = block.content.split("\n");
    for (const [lineOffset, line] of lines.entries()) {
      const match = TOP_LEVEL_FIELD_RE.exec(line);
      if (match && !ALLOWED_TOP_LEVEL_FIELDS.has(match[1]!)) {
        issues.push({
          code: "unknown_field",
          commentaryId: block.commentaryId,
          line: block.startLine + lineOffset,
          message: `Unknown top-level commentary field \`${match[1]}\`.`,
          fix: "Use only the fields of the commentary record contract (docs/commentary-protocol.md).",
        });
      }
    }

    const requiredScalars = ["commentary_id", "source_work", "block_kind", "placement", "stephanus_span", "author", "review_status"];
    for (const field of requiredScalars) {
      const value = fieldValue(block.content, field);
      if (value === undefined || value === "") {
        issues.push({
          code: "missing_field",
          commentaryId: block.commentaryId,
          message: `Missing required commentary field \`${field}\`.`,
          fix: `Add a non-empty \`${field}\` field to the commentary block.`,
        });
      }
    }

    const commentaryId = fieldValue(block.content, "commentary_id");
    if (commentaryId && !/^comm_[a-z0-9-]+_\d{4}$/u.test(commentaryId)) {
      issues.push({
        code: "id_format",
        commentaryId: block.commentaryId,
        message: `commentary_id \`${commentaryId}\` must match comm_<slug>_NNNN.`,
        fix: "Use comm_<dialogue-slug>_ followed by a 4-digit sequence number.",
      });
    }
    const expectedId = slug ? `comm_${slug}_${String(block.index + 1).padStart(4, "0")}` : undefined;
    if (commentaryId && expectedId && commentaryId !== expectedId && /^comm_[a-z0-9-]+_\d{4}$/u.test(commentaryId)) {
      issues.push({
        code: "id_sequence",
        commentaryId: block.commentaryId,
        message: `commentary_id \`${commentaryId}\` must be \`${expectedId}\` (strictly sequential in file order).`,
        fix: "Number blocks sequentially from 0001 in file order; append new blocks at the end of the file.",
      });
    }

    const sourceWork = fieldValue(block.content, "source_work");
    if (sourceWork && slug && workNameToSlug(sourceWork) !== slug) {
      issues.push({
        code: "source_work_mismatch",
        commentaryId: block.commentaryId,
        message: `source_work \`${sourceWork}\` does not match the ledger slug \`${slug}\`.`,
        fix: "Set source_work to the dialogue this ledger file covers.",
      });
    }

    const blockKind = fieldValue(block.content, "block_kind");
    if (blockKind && !BLOCK_KIND_VALUES.has(blockKind)) {
      issues.push({
        code: "block_kind_invalid",
        commentaryId: block.commentaryId,
        message: `block_kind \`${blockKind}\` must be section, context, argument, notice, crossref, or question.`,
        fix: "Use one of the six commentary block kinds.",
      });
    }

    const placement = fieldValue(block.content, "placement");
    if (placement && !PLACEMENT_VALUES.has(placement)) {
      issues.push({
        code: "placement_invalid",
        commentaryId: block.commentaryId,
        message: `placement \`${placement}\` must be before or after.`,
        fix: "Set placement to before or after relative to the anchored spine text.",
      });
    } else if (blockKind === "section" && placement === "after") {
      issues.push({
        code: "placement_invalid",
        commentaryId: block.commentaryId,
        message: "section blocks must use placement: before.",
        fix: "Section headers introduce their unit; set placement to before.",
      });
    }

    const reviewStatus = fieldValue(block.content, "review_status");
    if (reviewStatus !== "rejected") {
      const audioInsertion = inspectAudioInsertionBlock(block.content);
      for (const error of audioInsertion.errors) {
        issues.push({
          code: "audio_insertion_invalid",
          commentaryId: block.commentaryId,
          message: error,
          fix: "Use the exact current accepted English attribution, turn id, and source hashes.",
        });
      }
      if (audioInsertion.value && slug) {
        try {
          resolveAudioInsertionBoundary(
            slug,
            audioInsertion.value,
            blockKind === "section" ? undefined : placement === "before" || placement === "after" ? placement : undefined,
          );
        } catch (error) {
          issues.push({
            code: "audio_insertion_invalid",
            commentaryId: block.commentaryId,
            message: error instanceof Error ? error.message : String(error),
            fix: "Rebind audio_insertion to the exact accepted attribution and an explicit turn or sentence boundary.",
          });
        }
      }
    }

    const title = fieldValue(block.content, "title");
    const hasTitle = title !== undefined && title.trim().length > 0;
    if (blockKind === "section" && !hasTitle) {
      issues.push({
        code: "section_title",
        commentaryId: block.commentaryId,
        message: "section blocks require a non-empty title.",
        fix: "Name the teaching unit in the title field.",
      });
    } else if (blockKind && blockKind !== "section" && hasTitle) {
      issues.push({
        code: "section_title",
        commentaryId: block.commentaryId,
        message: `title is only allowed on section blocks, not \`${blockKind}\`.`,
        fix: "Remove the title or leave it empty on non-section blocks.",
      });
    }
    if (reviewStatus !== "rejected" && hasTitle) {
      for (const issue of inspectCommentaryListenerProse(title, { requireCompleteSentence: false })) {
        if (issue.code !== "internal_record_id") continue;
        issues.push({
          code: "title_internal_id",
          commentaryId: block.commentaryId,
          message: `title ${issue.message}`,
          fix: "Remove internal record IDs from the listener-facing title; keep provenance in cites.",
        });
      }
    }

    const body = fieldValue(block.content, "body");
    if (body === undefined) {
      issues.push({
        code: "missing_field",
        commentaryId: block.commentaryId,
        message: "Missing required commentary field `body`.",
        fix: "Add the teaching prose body.",
      });
    } else if (body.trim().length === 0) {
      issues.push({
        code: "body_empty",
        commentaryId: block.commentaryId,
        message: "body must be non-empty English teaching prose.",
        fix: "Write the block's teaching prose in the body field.",
      });
    } else if (reviewStatus !== "rejected") {
      for (const issue of inspectCommentaryListenerProse(body)) {
        issues.push(issue.code === "internal_record_id"
          ? {
              code: "body_internal_id",
              commentaryId: block.commentaryId,
              message: `body ${issue.message}`,
              fix: "Remove internal record IDs from listener-facing prose; keep provenance in cites.",
            }
          : {
              code: "body_incomplete_sentence",
              commentaryId: block.commentaryId,
              message: `body ${issue.message}`,
              fix: "Finish the body at a complete sentence boundary before semantic review.",
            });
      }
    }

    const longRun = firstLongGreekRun(block.content);
    if (longRun) {
      issues.push({
        code: "body_greek_run",
        commentaryId: block.commentaryId,
        message: `Commentary contains a contiguous Greek run of ${longRun.length} chars (max ${COMMENTARY_GREEK_RUN_MAX}).`,
        fix: "Do not duplicate source passages; the spine shows the text. Keep inline Greek short.",
      });
    }

    const author = fieldValue(block.content, "author");
    if (author && !AUTHOR_VALUES.has(author)) {
      issues.push({
        code: "author_invalid",
        commentaryId: block.commentaryId,
        message: `author \`${author}\` must be operator or model.`,
        fix: "Record who drafted the body: operator or model.",
      });
    }

    if (reviewStatus && !REVIEW_STATUSES.has(reviewStatus)) {
      issues.push({
        code: "review_status_invalid",
        commentaryId: block.commentaryId,
        message: `review_status \`${reviewStatus}\` must be one of unreviewed, accepted, rejected, needs_split.`,
        fix: "Use the house review-status vocabulary.",
      });
    }

    const span = fieldValue(block.content, "stephanus_span");
    const { sourceRef, present: sourceRefPresent } = topLevelSourceRef(block.content);
    if (!sourceRefPresent) {
      issues.push({
        code: "missing_field",
        commentaryId: block.commentaryId,
        message: "Missing required commentary field `source_ref`.",
        fix: "Anchor the block: resolve the span and copy the source_ref object unchanged.",
      });
    }

    let resolvedStartChar: number | undefined;
    let resolvedEndChar: number | undefined;
    if (span && slug) {
      const shape = parseSpanShape(span);
      const resolution = shape ? resolveSpanOrUndefined(slug, span) : undefined;
      if (!shape || !resolution) {
        issues.push({
          code: "span_invalid",
          commentaryId: block.commentaryId,
          message: `stephanus_span \`${span}\` is not a valid span in ${slug}.`,
          fix: "Use NNNx or NNNx-NNNx with markers that exist in the dialogue's Stephanus index.",
        });
      } else {
        resolvedStartChar = resolution.source_ref.start_char;
        resolvedEndChar = resolution.source_ref.end_char;
        if (sourceRefPresent && !sourceRefsEqual(sourceRef, resolution.source_ref)) {
          issues.push({
            code: "source_ref_mismatch",
            commentaryId: block.commentaryId,
            message: "source_ref does not match the recomputed resolution of stephanus_span.",
            fix: "Re-resolve the span and copy all seven source_ref fields unchanged.",
          });
        }
      }
    }

    const { cites: parsedCites, present: citesPresent, unknownFields: citeUnknownFields } = parseCites(block.content);
    if (!citesPresent) {
      issues.push({
        code: "missing_field",
        commentaryId: block.commentaryId,
        message: "Missing required commentary field `cites`.",
        fix: "Add a cites map; accepted blocks require at least one resolving observation, claim, relation, or dossier target.",
      });
    }
    for (const field of citeUnknownFields) {
      issues.push({
        code: "unknown_field",
        commentaryId: block.commentaryId,
        message: `Unknown cites list \`${field}\`.`,
        fix: "cites may list observations, claims, relations, and dossiers only.",
      });
    }
    validateCiteList(block, "observations", parsedCites.observations, cites, issues);
    validateCiteList(block, "claims", parsedCites.claims, cites, issues);
    validateCiteList(block, "relations", parsedCites.relations, cites, issues);
    validateDossierCites(block, parsedCites.dossiers, issues);
    if (
      reviewStatus === "accepted" &&
      requiresSemanticCitation(blockKind) &&
      !hasCanonicalCitation(parsedCites, cites)
    ) {
      issues.push({
        code: "accepted_citation_required",
        commentaryId: block.commentaryId,
        message: "Accepted argument or question commentary must cite at least one canonical accepted observation, claim, relation, or dossier target.",
        fix: "Add a resolving canonical citation, or keep the semantic commentary non-accepted until evidence is linked.",
      });
    }

    const { crossrefs } = parseCrossrefs(block.content, block.startLine);
    for (const crossref of crossrefs) {
      if (!crossref.sourceWork || !crossref.stephanusSpan || !crossref.hasSourceRef) {
        issues.push({
          code: "missing_field",
          commentaryId: block.commentaryId,
          line: crossref.line,
          message: `crossrefs[${crossref.index}] must carry source_work, stephanus_span, and source_ref.`,
          fix: "Complete the crossref entry or remove it.",
        });
        continue;
      }

      const targetSlug = workNameToSlug(crossref.sourceWork);
      if (!greekDialogues.has(targetSlug)) {
        issues.push({
          code: "crossref_work_unknown",
          commentaryId: block.commentaryId,
          line: crossref.line,
          message: `crossrefs[${crossref.index}] source_work \`${crossref.sourceWork}\` is not a canonical dialogue.`,
          fix: "Point crossrefs at one of the dialogues under raw/plato/greek/.",
        });
        continue;
      }

      const resolution = parseSpanShape(crossref.stephanusSpan)
        ? resolveSpanOrUndefined(targetSlug, crossref.stephanusSpan)
        : undefined;
      if (!resolution || !sourceRefsEqual(crossref.sourceRef, resolution.source_ref)) {
        issues.push({
          code: "crossref_ref_mismatch",
          commentaryId: block.commentaryId,
          line: crossref.line,
          message: `crossrefs[${crossref.index}] source_ref does not match the recomputed span in ${targetSlug}.`,
          fix: "Resolve the crossref span against the target dialogue and copy its source_ref unchanged.",
        });
      }
    }

    const blockKindIsCrossref = blockKind === "crossref";
    if (blockKindIsCrossref) {
      const hasCites =
        parsedCites.observations.length > 0 ||
        parsedCites.claims.length > 0 ||
        parsedCites.relations.length > 0 ||
        parsedCites.dossiers.length > 0;
      if (crossrefs.length === 0 && !hasCites) {
        issues.push({
          code: "crossref_empty",
          commentaryId: block.commentaryId,
          message: "crossref blocks must carry at least one crossrefs entry or one non-empty cites list.",
          fix: "Add the cross-reference target, or use a different block kind.",
        });
      }
    }

    const statedStartChar = sourceRef.start_char ?? resolvedStartChar;
    const statedEndChar = sourceRef.end_char ?? resolvedEndChar;
    if (blockKind === "section") {
      if (statedStartChar !== undefined && statedEndChar !== undefined) {
        sections.push({ commentaryId: block.commentaryId, startChar: statedStartChar, endChar: statedEndChar });
      }
    } else if (blockKind && BLOCK_KIND_VALUES.has(blockKind)) {
      nonSections.push({ commentaryId: block.commentaryId, startChar: statedStartChar });
    }
  }

  const orderedSections = [...sections].sort((a, b) => a.startChar - b.startChar || a.endChar - b.endChar);
  for (const [index, section] of orderedSections.entries()) {
    const previous = orderedSections[index - 1];
    if (!previous) continue;
    if (section.startChar <= previous.startChar) {
      issues.push({
        code: "section_order",
        commentaryId: section.commentaryId,
        message: `Section spans must be strictly ascending; \`${section.commentaryId}\` does not start after \`${previous.commentaryId}\`.`,
        fix: "Give each section a distinct, ascending Stephanus span.",
      });
    }
    if (section.startChar < previous.endChar) {
      issues.push({
        code: "section_overlap",
        commentaryId: section.commentaryId,
        message: `Section \`${section.commentaryId}\` overlaps \`${previous.commentaryId}\`.`,
        fix: "Adjust section boundaries so teaching units do not overlap.",
      });
    }
  }

  for (const block of nonSections) {
    if (block.startChar === undefined) continue;
    const startChar = block.startChar;
    const inSection = sections.some((section) => startChar >= section.startChar && startChar < section.endChar);
    if (!inSection) {
      issues.push({
        code: "orphan_block",
        commentaryId: block.commentaryId,
        message: `Block \`${block.commentaryId}\` anchors outside every section span.`,
        fix: "Anchor non-section blocks inside a section's span, or add the covering section first.",
      });
    }
  }

  return issues;
}

export function formatCommentaryLedgerValidationError(issues: CommentaryLedgerValidationIssue[]) {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  }

  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shownIssues = issues.slice(0, 8);
  const lines = [
    "Commentary ledger validation failed.",
    `Issue counts: ${countSummary}`,
    ...shownIssues.map((issue) => {
      const location = [issue.commentaryId, issue.line ? `line ${issue.line}` : undefined].filter(Boolean).join(" ");
      return `- ${location || "ledger"}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];

  if (issues.length > shownIssues.length) {
    lines.push(`- ${issues.length - shownIssues.length} more issue(s) omitted.`);
  }

  return lines.join("\n");
}

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { apparatusMarkdownBlocks } from "./apparatus-ledger.js";
import {
  buildCommentaryCitationIndex,
  COMMENTARY_GREEK_RUN_MAX,
  type CommentaryCitationIndex,
  workNameToSlug,
} from "./commentary-validator.js";
import { fieldValue } from "./observation-ledger.js";

export const APPARATUS_NOTE_MAX = 600;
export const APPARATUS_KINDS = new Set(["surface_tension", "structural_marker", "address_shift"]);

export type ApparatusLedgerValidationIssue = {
  code:
    | "missing_field"
    | "unknown_field"
    | "id_format"
    | "id_sequence"
    | "source_work_mismatch"
    | "kind_invalid"
    | "span_invalid"
    | "source_ref_mismatch"
    | "note_empty"
    | "note_too_long"
    | "note_greek_run"
    | "cites_empty"
    | "cite_unknown_id"
    | "cite_not_accepted"
    | "cite_dossier_missing"
    | "author_invalid"
    | "review_status_invalid";
  message: string;
  fix: string;
  apparatusId?: string;
  line?: number;
};

const GREEK_RUN_RE = /[Ͱ-Ͽἀ-῿](?:[Ͱ-Ͽἀ-῿\s'’ʼ,.;·()—–-]*[Ͱ-Ͽἀ-῿])?/gu;
const TOP_LEVEL_FIELD_RE = /^([a-z_]+):\s*(.*)$/u;
const AUTHOR_VALUES = new Set(["operator", "model"]);
const REVIEW_STATUSES = new Set(["unreviewed", "accepted", "rejected", "needs_split"]);
const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  "apparatus_id",
  "source_work",
  "kind",
  "stephanus_span",
  "source_ref",
  "note",
  "cites",
  "author",
  "review_status",
]);
const CITE_LIST_FIELDS = ["observations", "claims", "relations", "dossiers"] as const;

type ParsedSourceRef = {
  source_path: string | undefined;
  stephanus_span: string | undefined;
  start_marker: string | undefined;
  end_marker: string | undefined;
  start_char: number | undefined;
  end_char: number | undefined;
  text_sha256: string | undefined;
};

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

function sourceRefFromContent(block: string): { sourceRef: ParsedSourceRef; present: boolean } {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => /^source_ref:/u.test(line));
  if (startIndex === -1) {
    return {
      sourceRef: {
        source_path: undefined,
        stephanus_span: undefined,
        start_marker: undefined,
        end_marker: undefined,
        start_char: undefined,
        end_char: undefined,
        text_sha256: undefined,
      },
      present: false,
    };
  }
  const nested: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().length > 0 && lineIndent(line) <= 0) break;
    nested.push(line);
  }
  const field = (name: string) => {
    for (const line of nested) {
      const match = new RegExp(`^\\s+${name}:\\s*(.*)$`, "u").exec(line);
      if (match) return cleanScalar(match[1]);
    }
    return undefined;
  };
  return {
    sourceRef: {
      source_path: field("source_path"),
      stephanus_span: field("stephanus_span"),
      start_marker: field("start_marker"),
      end_marker: field("end_marker"),
      start_char: parseNumber(field("start_char")),
      end_char: parseNumber(field("end_char")),
      text_sha256: field("text_sha256"),
    },
    present: true,
  };
}

type ParsedCites = { observations: string[]; claims: string[]; relations: string[]; dossiers: string[] };

function parseCites(block: string): { cites: ParsedCites; present: boolean; unknownFields: string[] } {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => /^cites:/u.test(line));
  const cites: ParsedCites = { observations: [], claims: [], relations: [], dossiers: [] };
  if (startIndex === -1) return { cites, present: false, unknownFields: [] };

  const section: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().length > 0 && lineIndent(line) <= 0) break;
    section.push(line);
  }
  const unknownFields: string[] = [];
  for (const line of section) {
    const match = /^\s{2}([a-z_]+):\s*(.*)$/u.exec(line);
    if (!match || lineIndent(line) !== 2) continue;
    const field = match[1]!;
    if (!CITE_LIST_FIELDS.includes(field as (typeof CITE_LIST_FIELDS)[number])) {
      unknownFields.push(field);
      continue;
    }
    const inline = (match[2] ?? "").trim();
    if (inline.startsWith("[")) {
      const body = inline.replace(/^\[/u, "").replace(/\]$/u, "").trim();
      cites[field as (typeof CITE_LIST_FIELDS)[number]] = body
        ? body
            .split(/,\s*/u)
            .map((entry) => cleanScalar(entry) ?? "")
            .filter(Boolean)
        : [];
    }
  }
  return { cites, present: true, unknownFields };
}

function normalizeSpanText(span: string) {
  return span.trim().replace(/[–—]/gu, "-").replace(/\s+/gu, "");
}

function parseSpanShape(span: string) {
  const match = /^(\d+[a-e])(?:-(\d+[a-e]))?$/u.exec(normalizeSpanText(span));
  return match ? { start: match[1]!, end: match[2] ?? match[1]! } : undefined;
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

function firstLongGreekRun(text: string) {
  for (const match of text.matchAll(GREEK_RUN_RE)) {
    if ((match[0]?.length ?? 0) > COMMENTARY_GREEK_RUN_MAX) return match[0];
  }
  return undefined;
}

export function validateApparatusLedger(
  path: string,
  content: string,
  citationIndex?: CommentaryCitationIndex,
): ApparatusLedgerValidationIssue[] {
  const issues: ApparatusLedgerValidationIssue[] = [];
  const slug = /^wiki\/apparatus\/(.+)\.md$/u.exec(path)?.[1];
  const repoRoot = getRepoRoot();
  const cites = citationIndex ?? buildCommentaryCitationIndex();
  const blocks = apparatusMarkdownBlocks(content);

  for (const block of blocks) {
    const apparatusId = block.apparatusId ?? `apx_${String(block.index + 1).padStart(4, "0")}`;
    const push = (issue: Omit<ApparatusLedgerValidationIssue, "apparatusId">) =>
      issues.push({ ...issue, apparatusId });

    for (const [lineOffset, line] of block.content.split("\n").entries()) {
      const match = TOP_LEVEL_FIELD_RE.exec(line);
      if (match && !ALLOWED_TOP_LEVEL_FIELDS.has(match[1]!)) {
        push({
          code: "unknown_field",
          line: block.startLine + lineOffset,
          message: `Unknown top-level apparatus field \`${match[1]}\`.`,
          fix: "Use only the fields of the apparatus record contract (docs/apparatus-protocol.md).",
        });
      }
    }

    for (const field of ["apparatus_id", "source_work", "kind", "stephanus_span", "note", "author", "review_status"]) {
      const value = fieldValue(block.content, field);
      if (value === undefined || value === "") {
        push({
          code: "missing_field",
          message: `Missing required apparatus field \`${field}\`.`,
          fix: `Add a non-empty \`${field}\` field to the apparatus block.`,
        });
      }
    }

    const idValue = fieldValue(block.content, "apparatus_id");
    if (idValue && !/^apx_[a-z0-9-]+_\d{4}$/u.test(idValue)) {
      push({
        code: "id_format",
        message: `apparatus_id \`${idValue}\` must match apx_<slug>_NNNN.`,
        fix: "Use apx_<dialogue-slug>_ followed by a 4-digit sequence number.",
      });
    }
    const expectedId = slug ? `apx_${slug}_${String(block.index + 1).padStart(4, "0")}` : undefined;
    if (idValue && expectedId && idValue !== expectedId && /^apx_[a-z0-9-]+_\d{4}$/u.test(idValue)) {
      push({
        code: "id_sequence",
        message: `apparatus_id \`${idValue}\` must be \`${expectedId}\` (strictly sequential in file order).`,
        fix: "Number blocks sequentially from 0001 in file order; append new blocks at the end.",
      });
    }

    const sourceWork = fieldValue(block.content, "source_work");
    if (sourceWork && slug && workNameToSlug(sourceWork) !== slug) {
      push({
        code: "source_work_mismatch",
        message: `source_work \`${sourceWork}\` does not match the ledger slug \`${slug}\`.`,
        fix: "Set source_work to the dialogue this ledger file covers.",
      });
    }

    const kind = fieldValue(block.content, "kind");
    if (kind && !APPARATUS_KINDS.has(kind)) {
      push({
        code: "kind_invalid",
        message: `kind \`${kind}\` must be surface_tension, structural_marker, or address_shift.`,
        fix: "Use one of the three closed apparatus kinds.",
      });
    }

    const note = fieldValue(block.content, "note");
    if (note !== undefined && note.trim().length === 0) {
      push({ code: "note_empty", message: "note must be non-empty English prose.", fix: "Write the reading note." });
    }
    if (note !== undefined && note.length > APPARATUS_NOTE_MAX) {
      push({
        code: "note_too_long",
        message: `note is ${note.length} chars (max ${APPARATUS_NOTE_MAX}).`,
        fix: "Tighten the note to a single paragraph under the limit.",
      });
    }
    const longRun = firstLongGreekRun(block.content);
    if (longRun) {
      push({
        code: "note_greek_run",
        message: `Apparatus contains a contiguous Greek run of ${longRun.length} chars (max ${COMMENTARY_GREEK_RUN_MAX}).`,
        fix: "The spine shows the text; keep any inline Greek short.",
      });
    }

    const author = fieldValue(block.content, "author");
    if (author && !AUTHOR_VALUES.has(author)) {
      push({ code: "author_invalid", message: `author \`${author}\` must be operator or model.`, fix: "Record who drafted the note." });
    }
    const reviewStatus = fieldValue(block.content, "review_status");
    if (reviewStatus && !REVIEW_STATUSES.has(reviewStatus)) {
      push({
        code: "review_status_invalid",
        message: `review_status \`${reviewStatus}\` must be one of unreviewed, accepted, rejected, needs_split.`,
        fix: "Use the house review-status vocabulary.",
      });
    }

    const span = fieldValue(block.content, "stephanus_span");
    const { sourceRef, present: sourceRefPresent } = sourceRefFromContent(block.content);
    if (!sourceRefPresent) {
      push({
        code: "missing_field",
        message: "Missing required apparatus field `source_ref`.",
        fix: "Anchor the block: resolve the span and copy the source_ref object unchanged.",
      });
    }
    if (span && slug) {
      const shape = parseSpanShape(span);
      const resolution = shape ? resolveSpanOrUndefined(slug, span) : undefined;
      if (!shape || !resolution) {
        push({
          code: "span_invalid",
          message: `stephanus_span \`${span}\` is not a valid span in ${slug}.`,
          fix: "Use NNNx or NNNx-NNNx with markers that exist in the dialogue's Stephanus index.",
        });
      } else if (sourceRefPresent && !sourceRefsEqual(sourceRef, resolution.source_ref)) {
        push({
          code: "source_ref_mismatch",
          message: "source_ref does not match the recomputed resolution of stephanus_span.",
          fix: "Re-resolve the span and copy all seven source_ref fields unchanged.",
        });
      }
    }

    const { cites: parsedCites, present: citesPresent, unknownFields } = parseCites(block.content);
    if (!citesPresent) {
      push({
        code: "missing_field",
        message: "Missing required apparatus field `cites`.",
        fix: "Add a cites map with observations, claims, relations, and dossiers lists.",
      });
    }
    for (const field of unknownFields) {
      push({ code: "unknown_field", message: `Unknown cites list \`${field}\`.`, fix: "cites may list observations, claims, relations, and dossiers only." });
    }
    const totalCites =
      parsedCites.observations.length +
      parsedCites.claims.length +
      parsedCites.relations.length +
      parsedCites.dossiers.length;
    if (citesPresent && totalCites === 0) {
      push({
        code: "cites_empty",
        message: "cites must name at least one accepted record across the four lists.",
        fix: "Cite the accepted observation, claim, relation, or dossier that makes this note checkable.",
      });
    }
    for (const family of ["observations", "claims", "relations"] as const) {
      for (const id of parsedCites[family]) {
        const status = cites[family].get(id);
        if (status === undefined) {
          push({
            code: "cite_unknown_id",
            message: `cites.${family} id \`${id}\` does not exist in any ${family} ledger.`,
            fix: "Cite only record ids copied from the ledgers.",
          });
        } else if (status !== "accepted") {
          push({
            code: "cite_not_accepted",
            message: `cites.${family} id \`${id}\` has review_status \`${status}\`; only accepted records may be cited.`,
            fix: "Cite accepted records only.",
          });
        }
      }
    }
    for (const entry of parsedCites.dossiers) {
      const match = /^([a-z0-9_-]+)\/([a-z0-9_-]+)$/u.exec(entry);
      const dossierPath = match ? join(repoRoot, "wiki/dossiers", match[1]!, `${match[2]}.md`) : undefined;
      if (!dossierPath || !existsSync(dossierPath)) {
        push({
          code: "cite_dossier_missing",
          message: `cites.dossiers entry \`${entry}\` does not resolve to a wiki/dossiers/<family>/<label>.md file.`,
          fix: "Use the <family>/<label> path of an existing dossier file.",
        });
      }
    }
  }

  return issues;
}

export function formatApparatusLedgerValidationError(issues: ApparatusLedgerValidationIssue[]) {
  const counts = new Map<string, number>();
  for (const issue of issues) counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shown = issues.slice(0, 8);
  const lines = [
    "Apparatus ledger validation failed.",
    `Issue counts: ${countSummary}`,
    ...shown.map((issue) => {
      const location = [issue.apparatusId, issue.line ? `line ${issue.line}` : undefined].filter(Boolean).join(" ");
      return `- ${location || "ledger"}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];
  if (issues.length > shown.length) lines.push(`- ${issues.length - shown.length} more issue(s) omitted.`);
  return lines.join("\n");
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  fieldValue,
  nestedFieldValue,
  observationMarkdownBlocks,
} from "./observation-ledger.js";

export type ObservationLedgerValidationIssue = {
  code:
    | "missing_record"
    | "missing_field"
    | "source_ref_mismatch"
    | "source_ref_hash_mismatch"
    | "greek_outside_terms"
    | "invalid_feature_family"
    | "invalid_review_status"
    | "nul_byte"
    | "observation_count_mismatch"
    | "orphan_ledger_field"
    | "duplicate_field"
    | "out_of_span_reference"
    | "unbounded_reference";
  message: string;
  fix: string;
  observationId?: string;
  line?: number;
};

type ObservationBlock = {
  content: string;
  startLine: number;
  observationId: string;
};

type ParsedSpan = {
  start: string;
  end: string;
  normalized: string;
  startOrder: number;
  endOrder: number;
};

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/u;
const TOP_LEVEL_FIELD_RE = /^([a-z_]+):\s*(.*)$/u;
const CRITICAL_TOP_LEVEL_FIELDS = [
  "observation_id",
  "feature_id",
  "feature_family",
  "feature_label",
  "observation",
  "textual_basis",
  "limits",
  "review_status",
] as const;
const ORPHAN_LEDGER_FIELD_RE = /^(observation_id|feature_id|feature_family|feature_label|review_status):\s*/u;
const FEATURE_FAMILY_RE = /^[a-z][a-z0-9_]*$/u;
const REVIEW_STATUSES = new Set(["unreviewed", "accepted", "rejected", "needs_split"]);
const STEPHANUS_REF_RE = /\b(\d+)([a-e])(?:\s*[-–—]\s*(?:(\d+)([a-e])|([a-e])))?(\s*ff\.?)?/gu;
const LETTER_ORDERS = new Map([
  ["a", 0],
  ["b", 1],
  ["c", 2],
  ["d", 3],
  ["e", 4],
]);

function normalizeSpanText(span: string) {
  return span.trim().replace(/[–—]/gu, "-").replace(/\s+/gu, "");
}

function markerOrder(marker: string) {
  const match = /^(\d+)([a-e])$/u.exec(marker);
  if (!match) return undefined;

  const page = Number(match[1]);
  const letterOrder = LETTER_ORDERS.get(match[2]!);
  if (!Number.isFinite(page) || letterOrder === undefined) return undefined;

  return page * 5 + letterOrder;
}

function parseSpan(span: string): ParsedSpan | undefined {
  const normalized = normalizeSpanText(span);
  const match = /^(\d+[a-e])(?:-(\d+[a-e]))?$/u.exec(normalized);
  if (!match) return undefined;

  const start = match[1]!;
  const end = match[2] ?? start;
  const startOrder = markerOrder(start);
  const endOrder = markerOrder(end);
  if (startOrder === undefined || endOrder === undefined || startOrder > endOrder) return undefined;

  return {
    start,
    end,
    normalized: start === end ? start : `${start}-${end}`,
    startOrder,
    endOrder,
  };
}

function parseStephanusReference(raw: string): ParsedSpan | undefined {
  const match = /^(\d+)([a-e])(?:\s*[-–—]\s*(?:(\d+)([a-e])|([a-e])))?/u.exec(raw);
  if (!match) return undefined;

  const start = `${match[1]}${match[2]}`;
  const endPage = match[3] ?? match[1];
  const endLetter = match[4] ?? match[5] ?? match[2];
  return parseSpan(`${start}-${endPage}${endLetter}`);
}

function parseNumberField(block: string, field: string) {
  const rawValue = fieldValue(block, field);
  if (rawValue === undefined) return undefined;

  const parsed = Number(rawValue);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function readSourceCached(cache: Map<string, string | undefined>, absolutePath: string) {
  if (!cache.has(absolutePath)) {
    cache.set(absolutePath, existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : undefined);
  }
  return cache.get(absolutePath);
}

function extractObservationBlocks(content: string): ObservationBlock[] {
  return observationMarkdownBlocks(content).map((block) => ({
    content: block.content,
    startLine: block.startLine,
    observationId: block.observationId ?? `observation_${String(block.index + 1).padStart(4, "0")}`,
  }));
}

function extractEvidenceLines(block: ObservationBlock) {
  const includedFields = new Set(["english_gloss", "observation", "textual_basis", "limits"]);
  const lines = block.content.split("\n");
  const evidenceLines: Array<{ line: number; text: string }> = [];
  let currentField: string | undefined;

  lines.forEach((line, index) => {
    const topLevelMatch = TOP_LEVEL_FIELD_RE.exec(line);
    if (topLevelMatch) {
      currentField = includedFields.has(topLevelMatch[1]!) ? topLevelMatch[1] : undefined;
      if (currentField) {
        evidenceLines.push({ line: block.startLine + index, text: topLevelMatch[2] ?? "" });
      }
      return;
    }

    if (currentField && /^\s+/u.test(line)) {
      evidenceLines.push({ line: block.startLine + index, text: line.trim() });
    }
  });

  return evidenceLines;
}

function firstGreekOutsideTerms(block: ObservationBlock) {
  const lines = block.content.split("\n");
  let currentField: string | undefined;

  for (const [index, line] of lines.entries()) {
    const topLevelMatch = TOP_LEVEL_FIELD_RE.exec(line);
    if (topLevelMatch) {
      currentField = topLevelMatch[1];
    }

    if (currentField === "greek_terms") continue;
    if (GREEK_RE.test(line)) {
      return {
        field: currentField ?? "unknown",
        line: block.startLine + index,
        text: line.trim(),
      };
    }
  }

  return undefined;
}

function validateSourceRef(
  path: string,
  block: ObservationBlock,
  issues: ObservationLedgerValidationIssue[],
  sourceTextCache: Map<string, string | undefined>,
) {
  const pathMatch = /^wiki\/observations\/(.+)\.md$/u.exec(path);
  const dialogue = pathMatch?.[1];
  const observationSpan = fieldValue(block.content, "stephanus_span");
  const sourcePath = nestedFieldValue(block.content, "source_path");
  const sourceSpan = nestedFieldValue(block.content, "stephanus_span");
  const startMarker = nestedFieldValue(block.content, "start_marker");
  const endMarker = nestedFieldValue(block.content, "end_marker");
  const startChar = Number(nestedFieldValue(block.content, "start_char"));
  const endChar = Number(nestedFieldValue(block.content, "end_char"));
  const textSha256 = nestedFieldValue(block.content, "text_sha256");
  const parsedStartChar = Number.isInteger(startChar) ? startChar : undefined;
  const parsedEndChar = Number.isInteger(endChar) ? endChar : undefined;

  const requiredFields = [
    ["stephanus_span", observationSpan],
    ["source_path", sourcePath],
    ["start_marker", startMarker],
    ["end_marker", endMarker],
    ["start_char", parsedStartChar],
    ["end_char", parsedEndChar],
    ["text_sha256", textSha256],
  ] as const;

  for (const [field, value] of requiredFields) {
    if (value === undefined || value === "") {
      issues.push({
        code: "missing_field",
        observationId: block.observationId,
        message: `Missing required source field \`${field}\`.`,
        fix: "Copy the complete source_ref object returned by wiki_source_span.",
      });
    }
  }

  if (
    !dialogue ||
    !observationSpan ||
    !sourcePath ||
    !startMarker ||
    !endMarker ||
    parsedStartChar === undefined ||
    parsedEndChar === undefined ||
    !textSha256
  ) {
    return;
  }

  const expectedSourcePath = `raw/plato/greek/${dialogue}.txt`;
  const parsedObservationSpan = parseSpan(observationSpan);
  const parsedSourceSpan = parseSpan(sourceSpan ?? "");

  if (
    !parsedObservationSpan ||
    !parsedSourceSpan ||
    sourcePath !== expectedSourcePath ||
    parsedObservationSpan.normalized !== parsedSourceSpan.normalized ||
    parsedObservationSpan.start !== startMarker ||
    parsedObservationSpan.end !== endMarker
  ) {
    issues.push({
      code: "source_ref_mismatch",
      observationId: block.observationId,
      message: "source_ref does not match the observation path and stephanus_span.",
      fix: "Call wiki_source_span with the final observation span and copy its source_ref unchanged.",
    });
  }

  const absoluteSourcePath = join(getRepoRoot(), sourcePath);
  const sourceText = readSourceCached(sourceTextCache, absoluteSourcePath);
  if (sourceText === undefined || parsedStartChar < 0 || parsedEndChar <= parsedStartChar) {
    issues.push({
      code: "source_ref_mismatch",
      observationId: block.observationId,
      message: "source_ref points to a missing source file or invalid character range.",
      fix: "Call wiki_source_span again for this observation span.",
    });
    return;
  }

  const actualHash = createHash("sha256").update(sourceText.slice(parsedStartChar, parsedEndChar)).digest("hex");
  if (actualHash !== textSha256) {
    issues.push({
      code: "source_ref_hash_mismatch",
      observationId: block.observationId,
      message: "source_ref text_sha256 does not match the raw source slice.",
      fix: "Do not edit source_ref fields manually; copy the tool result.",
    });
  }
}

function validateRequiredFields(block: ObservationBlock, issues: ObservationLedgerValidationIssue[]) {
  const requiredFields = [
    "observation_id",
    "source_work",
    "stephanus_span",
    "feature_id",
    "feature_family",
    "feature_label",
    "observation",
    "textual_basis",
    "limits",
    "review_status",
  ];

  for (const field of requiredFields) {
    const value = fieldValue(block.content, field);
    if (value === undefined || value === "") {
      issues.push({
        code: "missing_field",
        observationId: block.observationId,
        message: `Missing required observation field \`${field}\`.`,
        fix:
          field === "feature_id"
            ? "Let the wiki observation tool assign feature_id from feature_label; do not remove the assigned field after tool feedback."
            : `Add a non-empty \`${field}\` field to the observation record.`,
      });
    }
  }
}

function validateDuplicateCriticalFields(block: ObservationBlock, issues: ObservationLedgerValidationIssue[]) {
  const fieldLines = new Map<string, number[]>();

  block.content.split("\n").forEach((line, index) => {
    const match = TOP_LEVEL_FIELD_RE.exec(line);
    if (!match) return;

    const field = match[1]!;
    if (!CRITICAL_TOP_LEVEL_FIELDS.includes(field as (typeof CRITICAL_TOP_LEVEL_FIELDS)[number])) return;

    const lines = fieldLines.get(field) ?? [];
    lines.push(block.startLine + index);
    fieldLines.set(field, lines);
  });

  for (const [field, lines] of fieldLines.entries()) {
    if (lines.length <= 1) continue;
    const duplicateLine = lines[1];
    if (duplicateLine === undefined) continue;
    issues.push({
      code: "duplicate_field",
      observationId: block.observationId,
      line: duplicateLine,
      message: `Observation record has duplicate top-level \`${field}\` fields.`,
      fix: "Split embedded observations into separate fenced yaml blocks, or remove stale duplicate fields.",
    });
  }
}

function validateFeatureFamily(block: ObservationBlock, issues: ObservationLedgerValidationIssue[]) {
  const featureFamily = fieldValue(block.content, "feature_family");
  if (!featureFamily || FEATURE_FAMILY_RE.test(featureFamily)) return;

  issues.push({
    code: "invalid_feature_family",
    observationId: block.observationId,
    message: `feature_family \`${featureFamily}\` must be a lowercase snake_case slug.`,
    fix: "Use a seed family such as definition_ladder, or a normalized passthrough family such as legal_oath_formula.",
  });
}

function validateReviewStatus(block: ObservationBlock, issues: ObservationLedgerValidationIssue[]) {
  const reviewStatus = fieldValue(block.content, "review_status");
  if (!reviewStatus || REVIEW_STATUSES.has(reviewStatus)) return;

  issues.push({
    code: "invalid_review_status",
    observationId: block.observationId,
    message: `review_status \`${reviewStatus}\` must be one of unreviewed, accepted, rejected, needs_split.`,
    fix: "Use accepted for locally supported records, rejected for unsupported records, or needs_split for records that must be divided.",
  });
}

function validateGreekPlacement(block: ObservationBlock, issues: ObservationLedgerValidationIssue[]) {
  const firstOffense = firstGreekOutsideTerms(block);
  if (!firstOffense) return;

  issues.push({
    code: "greek_outside_terms",
    observationId: block.observationId,
    line: firstOffense.line,
    message: `Greek text appears outside greek_terms in \`${firstOffense.field}\`: ${formatIssueSnippet(firstOffense.text)}`,
    fix: `Remove Greek script from \`${firstOffense.field}\`; keep short Greek tokens only in greek_terms and write prose fields in English using Stephanus refs.`,
  });
}

function formatIssueSnippet(text: string) {
  const singleLine = text.replace(/\s+/gu, " ");
  return singleLine.length > 100 ? `${singleLine.slice(0, 97)}...` : singleLine;
}

function validateStephanusLocality(block: ObservationBlock, issues: ObservationLedgerValidationIssue[]) {
  const observationSpan = parseSpan(fieldValue(block.content, "stephanus_span") ?? "");
  if (!observationSpan) return;

  for (const evidenceLine of extractEvidenceLines(block)) {
    for (const match of evidenceLine.text.matchAll(STEPHANUS_REF_RE)) {
      const rawReference = match[0]!;
      const parsedReference = parseStephanusReference(rawReference);
      if (!parsedReference) continue;

      if (match[6]) {
        issues.push({
          code: "unbounded_reference",
          observationId: block.observationId,
          line: evidenceLine.line,
          message: `Unbounded Stephanus reference \`${rawReference.trim()}\` is not allowed in an observation.`,
          fix: "Use an exact bounded span and regenerate source_ref for the final span.",
        });
      }

      if (
        parsedReference.startOrder < observationSpan.startOrder ||
        parsedReference.endOrder > observationSpan.endOrder
      ) {
        issues.push({
          code: "out_of_span_reference",
          observationId: block.observationId,
          line: evidenceLine.line,
          message: `Reference \`${rawReference.trim()}\` is outside observation span \`${observationSpan.normalized}\`.`,
          fix: "Remove the out-of-span claim or widen stephanus_span and source_ref to cover all cited text.",
        });
      }
    }
  }
}

export function validateObservationLedger(path: string, content: string) {
  const issues: ObservationLedgerValidationIssue[] = [];
  const blocks = extractObservationBlocks(content);
  const sourceTextCache = new Map<string, string | undefined>();

  if (content.includes("\0")) {
    issues.push({
      code: "nul_byte",
      message: "Observation ledger contains a NUL byte.",
      fix: "Remove the binary byte and restore any corrupted text from the cited Greek source.",
    });
  }

  const rawObservationIds = [...content.matchAll(/^observation_id:\s*/gmu)];
  if (rawObservationIds.length !== blocks.length) {
    issues.push({
      code: "observation_count_mismatch",
      message: `Raw observation_id count (${rawObservationIds.length}) does not match fenced yaml block count (${blocks.length}).`,
      fix: "Ensure every observation record is exactly one fenced yaml block and no observation_id appears outside or twice inside a block.",
    });
  }

  let insideYamlBlock = false;
  content.split("\n").forEach((line, index) => {
    if (/^```yaml\s*$/u.test(line)) {
      insideYamlBlock = true;
      return;
    }
    if (insideYamlBlock && /^```\s*$/u.test(line)) {
      insideYamlBlock = false;
      return;
    }
    if (insideYamlBlock || !ORPHAN_LEDGER_FIELD_RE.test(line)) return;

    issues.push({
      code: "orphan_ledger_field",
      line: index + 1,
      message: `Ledger field appears outside a fenced yaml observation block: ${formatIssueSnippet(line)}`,
      fix: "Move the field into its observation block or remove stale orphan metadata.",
    });
  });

  if (blocks.length === 0) {
    issues.push({
      code: "missing_record",
      message: "No fenced yaml observation records found.",
      fix: "Write observations as fenced yaml blocks.",
    });
    return issues;
  }

  for (const block of blocks) {
    validateRequiredFields(block, issues);
    validateDuplicateCriticalFields(block, issues);
    validateFeatureFamily(block, issues);
    validateReviewStatus(block, issues);
    validateSourceRef(path, block, issues, sourceTextCache);
    validateGreekPlacement(block, issues);
    validateStephanusLocality(block, issues);
  }

  return issues;
}

export function formatObservationLedgerValidationError(
  issues: ObservationLedgerValidationIssue[],
  toolName = "wiki_write_observation",
) {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  }

  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shownIssues = issues.slice(0, 8);
  const lines = [
    `Observation ledger rejected by ${toolName}.`,
    `Fix the markdown and call ${toolName} again.`,
    `Issue counts: ${countSummary}`,
    ...shownIssues.map((issue) => {
      const location = [issue.observationId, issue.line ? `line ${issue.line}` : undefined].filter(Boolean).join(" ");
      return `- ${location || "ledger"}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];

  if (issues.length > shownIssues.length) {
    lines.push(`- ${issues.length - shownIssues.length} more issue(s) omitted.`);
  }

  return lines.join("\n");
}

export function assertObservationLedgerContent(path: string, content: string) {
  const issues = validateObservationLedger(path, content);
  if (issues.length > 0) {
    throw new Error(formatObservationLedgerValidationError(issues));
  }
}

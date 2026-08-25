import { createHash } from "node:crypto";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { readSiglaRegistry } from "../derived/turns.js";
import { isVoiceCutoverActive } from "../derived/voice-cutovers.js";
import { claimMarkdownBlocks } from "./claim-ledger.js";
import { readVoiceSiglaRegistry } from "./voices-ledger.js";
import { fieldValue } from "./observation-ledger.js";
import { readSourceCached } from "./observation-validator.js";

export type ClaimLedgerValidationIssue = {
  code:
    | "missing_record"
    | "missing_field"
    | "invalid_claim_id"
    | "invalid_speaker"
    | "invalid_claim_kind"
    | "invalid_stance_kind"
    | "invalid_final_status"
    | "invalid_review_status"
    | "source_ref_mismatch"
    | "source_ref_hash_mismatch"
    | "event_order_violation"
    | "greek_outside_terms"
    | "empty_content"
    | "missing_limits"
    | "claim_count_mismatch"
    | "orphan_ledger_field"
    | "duplicate_field"
    | "nul_byte";
  message: string;
  fix: string;
  claimId?: string;
  line?: number;
};

type ClaimBlock = {
  content: string;
  startLine: number;
  index: number;
  claimId: string;
};

type ParsedSpan = {
  start: string;
  end: string;
  normalized: string;
  startOrder: number;
  endOrder: number;
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

type ParsedStanceEvent = {
  index: number;
  line: number;
  kind: string | undefined;
  stephanusSpan: string | undefined;
  sourceRef: ParsedSourceRef;
};

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/u;
const TOP_LEVEL_FIELD_RE = /^([a-z_]+):\s*(.*)$/u;
const CLAIM_KIND_VALUES = new Set(["definition", "thesis", "method_rule", "report"]);
const STANCE_KIND_VALUES = new Set([
  "asserted",
  "posed_for_examination",
  "reported",
  "challenged",
  "refuted_conceded",
  "revised",
  "withdrawn",
  "reaffirmed",
]);
const FINAL_STATUS_BY_LAST_EVENT = new Map([
  ["asserted", "left_standing"],
  ["reaffirmed", "left_standing"],
  ["reported", "left_standing"],
  ["posed_for_examination", "posed_only"],
  ["challenged", "unresolved_challenge"],
  ["refuted_conceded", "refuted"],
  ["revised", "revised"],
  ["withdrawn", "withdrawn"],
]);
const FINAL_STATUS_VALUES = new Set(FINAL_STATUS_BY_LAST_EVENT.values());
const REVIEW_STATUSES = new Set(["unreviewed", "accepted", "rejected", "needs_split"]);
const CRITICAL_TOP_LEVEL_FIELDS = [
  "claim_id",
  "speaker",
  "claim_kind",
  "content",
  "stance_events",
  "final_status",
  "limits",
  "review_status",
] as const;
const ORPHAN_LEDGER_FIELD_RE = /^(claim_id|claim_kind|final_status|review_status):\s*/u;
const LETTER_ORDERS = new Map([
  ["a", 0],
  ["b", 1],
  ["c", 2],
  ["d", 3],
  ["e", 4],
]);

function cleanScalar(rawValue: string | undefined) {
  return rawValue?.trim().replace(/^["']|["']$/gu, "");
}

function lineIndent(line: string) {
  return /^\s*/u.exec(line)?.[0].length ?? 0;
}

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

function parseNumber(value: string | undefined) {
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function nestedValue(lines: string[], field: string) {
  for (const line of lines) {
    const match = new RegExp(`^\\s+${field}:\\s*(.*)$`, "u").exec(line);
    if (match) return cleanScalar(match[1]);
  }

  return undefined;
}

function sourceRefFromLines(lines: string[]): ParsedSourceRef {
  return {
    source_path: nestedValue(lines, "source_path"),
    stephanus_span: nestedValue(lines, "stephanus_span"),
    start_marker: nestedValue(lines, "start_marker"),
    end_marker: nestedValue(lines, "end_marker"),
    start_char: parseNumber(nestedValue(lines, "start_char")),
    end_char: parseNumber(nestedValue(lines, "end_char")),
    text_sha256: nestedValue(lines, "text_sha256"),
  };
}

function topLevelSourceRef(block: string) {
  const lines = block.split("\n");
  const startIndex = lines.findIndex((line) => /^source_ref:\s*$/u.test(line));
  if (startIndex === -1) return sourceRefFromLines([]);

  const section: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().length > 0 && lineIndent(line) === 0) break;
    section.push(line);
  }

  return sourceRefFromLines(section);
}

function sourceRefFromIndentedLines(lines: string[]) {
  const startIndex = lines.findIndex((line) => /^\s+source_ref:\s*$/u.test(line));
  if (startIndex === -1) return sourceRefFromLines([]);

  const parentIndent = lineIndent(lines[startIndex]!);
  const section: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().length > 0 && lineIndent(line) <= parentIndent) break;
    section.push(line);
  }

  return sourceRefFromLines(section);
}

function extractClaimBlocks(content: string): ClaimBlock[] {
  return claimMarkdownBlocks(content).map((block) => ({
    content: block.content,
    startLine: block.startLine,
    index: block.index,
    claimId: block.claimId ?? `claim_${String(block.index + 1).padStart(4, "0")}`,
  }));
}

function parseStanceEvents(block: ClaimBlock): ParsedStanceEvent[] {
  const lines = block.content.split("\n");
  const startIndex = lines.findIndex((line) => /^stance_events:\s*$/u.test(line));
  if (startIndex === -1) return [];

  const section: Array<{ line: string; lineNumber: number }> = [];
  for (const [offset, line] of lines.slice(startIndex + 1).entries()) {
    if (line.trim().length > 0 && lineIndent(line) === 0) break;
    section.push({ line, lineNumber: block.startLine + startIndex + offset + 1 });
  }

  const events: Array<{ lines: Array<{ line: string; lineNumber: number }> }> = [];
  let current: Array<{ line: string; lineNumber: number }> | undefined;
  for (const entry of section) {
    if (/^\s+-\s*/u.test(entry.line)) {
      current = [entry];
      events.push({ lines: current });
      continue;
    }
    current?.push(entry);
  }

  return events.map((event, index) => {
    const firstLine = event.lines[0];
    const firstKind = cleanScalar(/^\s+-\s+kind:\s*(.*)$/u.exec(firstLine?.line ?? "")?.[1]);
    const kind = firstKind ?? cleanScalar(event.lines.map((entry) => entry.line).join("\n").match(/^\s+kind:\s*(.*)$/mu)?.[1]);
    const stephanusSpan = cleanScalar(
      event.lines.map((entry) => entry.line).join("\n").match(/^\s+stephanus_span:\s*(.*)$/mu)?.[1],
    );

    return {
      index,
      line: firstLine?.lineNumber ?? block.startLine,
      kind,
      stephanusSpan,
      sourceRef: sourceRefFromIndentedLines(event.lines.map((entry) => entry.line)),
    };
  });
}

function expectedClaimId(dialogue: string | undefined, index: number) {
  return dialogue ? `claim_${dialogue}_${String(index + 1).padStart(4, "0")}` : undefined;
}

function dialogueFromClaimPath(path: string) {
  return /^wiki\/claims\/(.+)\.md$/u.exec(path)?.[1];
}

/**
 * Every siglum a claim in this dialogue may name as its speaker.
 *
 * Turn sigla are recorded AS PRINTED in the Greek source, so narrated dialogues
 * print no siglum for the in-scene speakers who own reported discourse. Those
 * owners are registered separately (the reported-speech voice attribution rollout); a claim speaker is valid if
 * either reviewed registry licenses it.
 *
 * The voice registry is deliberately a pre-registered SUPERSET — an entry earns
 * no attribution — so it may license a speaker only once the dialogue's cutover
 * is ACTIVE. That is exactly the point at which validation also begins enforcing
 * that every accepted claim's speaker EQUALS its resolved owner. Widening the
 * set without that pairing would let a hand-edited speaker cite a registered
 * voice no record licenses, in a dialogue where nothing yet checks owners: five
 * of protagoras's eight registered voices own no span at all.
 *
 * The trigger used to be the presence of a compiled index, which meant a
 * dialogue could not hold standalone reported-turn data without silently
 * widening its own claim schema. The voice activation contract moved it to the registry.
 */
export function licensedClaimSpeakers(dialogue: string | undefined) {
  if (!dialogue) return undefined;

  const sigla = readSiglaRegistry().dialogues.get(dialogue);
  if (!sigla) return undefined;
  const voiceSigla = isVoiceCutoverActive(dialogue)
    ? (readVoiceSiglaRegistry().get(dialogue) ?? new Set<string>())
    : new Set<string>();
  const printed = sigla.length === 0 ? ["(unattributed)"] : sigla;
  return new Set([...printed, ...voiceSigla]);
}

function formatIssueSnippet(text: string) {
  const singleLine = text.replace(/\s+/gu, " ");
  return singleLine.length > 100 ? `${singleLine.slice(0, 97)}...` : singleLine;
}

function firstGreekOutsideTerms(block: ClaimBlock) {
  const lines = block.content.split("\n");
  let currentField: string | undefined;

  for (const [index, line] of lines.entries()) {
    const topLevelMatch = TOP_LEVEL_FIELD_RE.exec(line);
    if (topLevelMatch) {
      currentField = topLevelMatch[1];
    }

    if (currentField === "greek_terms" || currentField === "speaker") continue;
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

function validateRequiredFields(block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
  const requiredFields = [
    "claim_id",
    "source_work",
    "stephanus_span",
    "speaker",
    "claim_kind",
    "content",
    "greek_terms",
    "stance_events",
    "final_status",
    "observation_ids",
    "limits",
    "review_status",
  ];

  for (const field of requiredFields) {
    const value = fieldValue(block.content, field);
    if (value === undefined || value === "") {
      issues.push({
        code: "missing_field",
        claimId: block.claimId,
        message: `Missing required claim field \`${field}\`.`,
        fix: `Add a non-empty \`${field}\` field to the claim record.`,
      });
    }
  }
}

function validateDuplicateCriticalFields(block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
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
      claimId: block.claimId,
      line: duplicateLine,
      message: `Claim record has duplicate top-level \`${field}\` fields.`,
      fix: "Split embedded claims into separate fenced yaml blocks, or remove stale duplicate fields.",
    });
  }
}

function validateSourceRef(
  path: string,
  block: ClaimBlock,
  sourceRef: ParsedSourceRef,
  span: string | undefined,
  issues: ClaimLedgerValidationIssue[],
  sourceTextCache: Map<string, string | undefined>,
  context: string,
) {
  const dialogue = dialogueFromClaimPath(path);
  const requiredFields = [
    ["source_path", sourceRef.source_path],
    ["stephanus_span", sourceRef.stephanus_span],
    ["start_marker", sourceRef.start_marker],
    ["end_marker", sourceRef.end_marker],
    ["start_char", sourceRef.start_char],
    ["end_char", sourceRef.end_char],
    ["text_sha256", sourceRef.text_sha256],
  ] as const;

  for (const [field, value] of requiredFields) {
    if (value === undefined || value === "") {
      issues.push({
        code: "missing_field",
        claimId: block.claimId,
        message: `Missing required ${context} source field \`${field}\`.`,
        fix: "Copy the complete source_ref object returned by wiki_source_span.",
      });
    }
  }

  if (
    !dialogue ||
    !span ||
    !sourceRef.source_path ||
    !sourceRef.stephanus_span ||
    !sourceRef.start_marker ||
    !sourceRef.end_marker ||
    sourceRef.start_char === undefined ||
    sourceRef.end_char === undefined ||
    !sourceRef.text_sha256
  ) {
    return;
  }

  const expectedSourcePath = `raw/plato/greek/${dialogue}.txt`;
  const parsedClaimSpan = parseSpan(span);
  const parsedSourceSpan = parseSpan(sourceRef.stephanus_span);

  if (
    !parsedClaimSpan ||
    !parsedSourceSpan ||
    sourceRef.source_path !== expectedSourcePath ||
    parsedClaimSpan.normalized !== parsedSourceSpan.normalized ||
    parsedClaimSpan.start !== sourceRef.start_marker ||
    parsedClaimSpan.end !== sourceRef.end_marker
  ) {
    issues.push({
      code: "source_ref_mismatch",
      claimId: block.claimId,
      message: `${context} source_ref does not match the claim path and stephanus_span.`,
      fix: "Call wiki_source_span with the final claim or event span and copy its source_ref unchanged.",
    });
  }

  const absoluteSourcePath = join(getRepoRoot(), sourceRef.source_path);
  const sourceText = readSourceCached(sourceTextCache, absoluteSourcePath);
  if (sourceText === undefined || sourceRef.start_char < 0 || sourceRef.end_char <= sourceRef.start_char) {
    issues.push({
      code: "source_ref_mismatch",
      claimId: block.claimId,
      message: `${context} source_ref points to a missing source file or invalid character range.`,
      fix: "Call wiki_source_span again for this span.",
    });
    return;
  }

  const actualHash = createHash("sha256")
    .update(sourceText.slice(sourceRef.start_char, sourceRef.end_char))
    .digest("hex");
  if (actualHash !== sourceRef.text_sha256) {
    issues.push({
      code: "source_ref_hash_mismatch",
      claimId: block.claimId,
      message: `${context} source_ref text_sha256 does not match the raw source slice.`,
      fix: "Do not edit source_ref fields manually; copy the tool result.",
    });
  }
}

function validateClaimId(path: string, block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
  const dialogue = dialogueFromClaimPath(path);
  const claimId = fieldValue(block.content, "claim_id");
  const expected = expectedClaimId(dialogue, block.index);
  if (!claimId || !expected || claimId === expected) return;

  issues.push({
    code: "invalid_claim_id",
    claimId: block.claimId,
    message: `claim_id \`${claimId}\` must be \`${expected}\`.`,
    fix: "Let the claim append tool assign sequential claim ids; do not preserve model draft ids.",
  });
}

function validateSpeaker(path: string, block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
  const speaker = fieldValue(block.content, "speaker");
  const valid = licensedClaimSpeakers(dialogueFromClaimPath(path));
  if (!speaker || !valid || valid.has(speaker)) return;

  issues.push({
    code: "invalid_speaker",
    claimId: block.claimId,
    message: `speaker \`${speaker}\` is not allowed for this dialogue.`,
    fix: "Use a siglum from derived/plato/turns/sigla.toml or derived/plato/voices/sigla.toml, or \"(unattributed)\" for sigla-less dialogues.",
  });
}

function validateEnums(block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
  const claimKind = fieldValue(block.content, "claim_kind");
  if (claimKind && !CLAIM_KIND_VALUES.has(claimKind)) {
    issues.push({
      code: "invalid_claim_kind",
      claimId: block.claimId,
      message: `claim_kind \`${claimKind}\` must be definition, thesis, method_rule, or report.`,
      fix: "Use the narrow enum value that matches the claim's textual function.",
    });
  }

  const finalStatus = fieldValue(block.content, "final_status");
  if (finalStatus && !FINAL_STATUS_VALUES.has(finalStatus)) {
    issues.push({
      code: "invalid_final_status",
      claimId: block.claimId,
      message: `final_status \`${finalStatus}\` is not a claim final-status value.`,
      fix: "Set final_status from the last stance event, not from interpretation.",
    });
  }

  const reviewStatus = fieldValue(block.content, "review_status");
  if (reviewStatus && !REVIEW_STATUSES.has(reviewStatus)) {
    issues.push({
      code: "invalid_review_status",
      claimId: block.claimId,
      message: `review_status \`${reviewStatus}\` must be one of unreviewed, accepted, rejected, needs_split.`,
      fix: "Use accepted for locally supported records, rejected for unsupported records, or needs_split for records that must be divided.",
    });
  }
}

function validateContentAndLimits(block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
  const content = fieldValue(block.content, "content");
  if (content !== undefined && content.trim().length === 0) {
    issues.push({
      code: "empty_content",
      claimId: block.claimId,
      message: "content must be a non-empty English sentence.",
      fix: "Restate the claim in one checkable English sentence.",
    });
  }

  const finalStatus = fieldValue(block.content, "final_status");
  const limits = fieldValue(block.content, "limits");
  if (finalStatus === "left_standing" && (!limits || limits.trim().length === 0)) {
    issues.push({
      code: "missing_limits",
      claimId: block.claimId,
      message: "left_standing claims must state the checked scope in limits.",
      fix: "State what coverage was checked and what the record does not establish.",
    });
  }
}

function validateGreekPlacement(block: ClaimBlock, issues: ClaimLedgerValidationIssue[]) {
  const firstOffense = firstGreekOutsideTerms(block);
  if (!firstOffense) return;

  issues.push({
    code: "greek_outside_terms",
    claimId: block.claimId,
    line: firstOffense.line,
    message: `Greek text appears outside greek_terms in \`${firstOffense.field}\`: ${formatIssueSnippet(firstOffense.text)}`,
    fix: `Remove Greek script from \`${firstOffense.field}\`; keep short Greek tokens only in greek_terms and write prose fields in English using Stephanus refs.`,
  });
}

function validateStanceEvents(
  path: string,
  block: ClaimBlock,
  issues: ClaimLedgerValidationIssue[],
  sourceTextCache: Map<string, string | undefined>,
) {
  const events = parseStanceEvents(block);
  if (events.length === 0) {
    issues.push({
      code: "missing_field",
      claimId: block.claimId,
      message: "stance_events must contain at least one event.",
      fix: "Add ordered stance events with kind, stephanus_span, and source_ref.",
    });
    return;
  }

  let previousStartChar: number | undefined;
  for (const event of events) {
    if (!event.kind || !STANCE_KIND_VALUES.has(event.kind)) {
      issues.push({
        code: "invalid_stance_kind",
        claimId: block.claimId,
        line: event.line,
        message: `stance_events[${event.index}] kind \`${event.kind ?? "(missing)"}\` is not allowed.`,
        fix: "Use asserted, posed_for_examination, reported, challenged, refuted_conceded, revised, withdrawn, or reaffirmed.",
      });
    }

    if (!event.stephanusSpan) {
      issues.push({
        code: "missing_field",
        claimId: block.claimId,
        line: event.line,
        message: `stance_events[${event.index}] is missing stephanus_span.`,
        fix: "Add the event span and copy the matching source_ref from wiki_source_span.",
      });
    }

    validateSourceRef(
      path,
      block,
      event.sourceRef,
      event.stephanusSpan,
      issues,
      sourceTextCache,
      `stance_events[${event.index}]`,
    );

    if (event.sourceRef.start_char !== undefined) {
      if (previousStartChar !== undefined && event.sourceRef.start_char < previousStartChar) {
        issues.push({
          code: "event_order_violation",
          claimId: block.claimId,
          line: event.line,
          message: "stance_events must be ordered by non-decreasing source_ref.start_char.",
          fix: "Sort stance events in textual order.",
        });
      }
      previousStartChar = event.sourceRef.start_char;
    }
  }

  const lastKind = events.at(-1)?.kind;
  const expectedFinalStatus = lastKind ? FINAL_STATUS_BY_LAST_EVENT.get(lastKind) : undefined;
  const finalStatus = fieldValue(block.content, "final_status");
  if (expectedFinalStatus && finalStatus && finalStatus !== expectedFinalStatus) {
    issues.push({
      code: "invalid_final_status",
      claimId: block.claimId,
      message: `final_status \`${finalStatus}\` must be \`${expectedFinalStatus}\` from the last stance event \`${lastKind}\`.`,
      fix: "Do not editorialize final_status; set it mechanically from the last stance event.",
    });
  }
}

export function validateClaimLedger(path: string, content: string) {
  const issues: ClaimLedgerValidationIssue[] = [];
  const blocks = extractClaimBlocks(content);
  const sourceTextCache = new Map<string, string | undefined>();

  if (content.includes("\0")) {
    issues.push({
      code: "nul_byte",
      message: "Claim ledger contains a NUL byte.",
      fix: "Remove the binary byte and restore any corrupted text from the cited Greek source.",
    });
  }

  const rawClaimIds = [...content.matchAll(/^claim_id:\s*/gmu)];
  if (rawClaimIds.length !== blocks.length) {
    issues.push({
      code: "claim_count_mismatch",
      message: `Raw claim_id count (${rawClaimIds.length}) does not match fenced yaml block count (${blocks.length}).`,
      fix: "Ensure every claim record is exactly one fenced yaml block and no claim_id appears outside or twice inside a block.",
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
      message: `Ledger field appears outside a fenced yaml claim block: ${formatIssueSnippet(line)}`,
      fix: "Move the field into its claim block or remove stale orphan metadata.",
    });
  });

  if (blocks.length === 0) {
    issues.push({
      code: "missing_record",
      message: "No fenced yaml claim records found.",
      fix: "Write claims as fenced yaml blocks.",
    });
    return issues;
  }

  for (const block of blocks) {
    validateRequiredFields(block, issues);
    validateDuplicateCriticalFields(block, issues);
    validateClaimId(path, block, issues);
    validateSpeaker(path, block, issues);
    validateEnums(block, issues);
    validateContentAndLimits(block, issues);
    validateSourceRef(path, block, topLevelSourceRef(block.content), fieldValue(block.content, "stephanus_span"), issues, sourceTextCache, "claim");
    validateStanceEvents(path, block, issues, sourceTextCache);
    validateGreekPlacement(block, issues);
  }

  return issues;
}

export function formatClaimLedgerValidationError(issues: ClaimLedgerValidationIssue[], toolName = "wiki_write_claims") {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  }

  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shownIssues = issues.slice(0, 8);
  const lines = [
    `Claim ledger rejected by ${toolName}.`,
    `Fix the markdown and call ${toolName} again.`,
    `Issue counts: ${countSummary}`,
    ...shownIssues.map((issue) => {
      const location = [issue.claimId, issue.line ? `line ${issue.line}` : undefined].filter(Boolean).join(" ");
      return `- ${location || "ledger"}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];

  if (issues.length > shownIssues.length) {
    lines.push(`- ${issues.length - shownIssues.length} more issue(s) omitted.`);
  }

  return lines.join("\n");
}

export function assertClaimLedgerContent(path: string, content: string) {
  const issues = validateClaimLedger(path, content);
  if (issues.length > 0) {
    throw new Error(formatClaimLedgerValidationError(issues));
  }
}

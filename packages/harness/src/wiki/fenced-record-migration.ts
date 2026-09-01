import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { stringify } from "yaml";
import { getRepoRoot } from "../paths.js";
import {
  parseCanonicalYamlRecord,
  rawFencedYamlBlocks,
  serializeCanonicalYamlRecord,
  type RawFencedYamlBlock,
} from "./fenced-record.js";

const LEDGER_LANES = ["observations", "claims", "relations", "commentary", "voices"] as const;
const BLOCK_SCALAR = /^[|>][+-]?[1-9]?$/u;
const MAP_ENTRY = /^(\s*)(-\s+)?([A-Za-z_][A-Za-z0-9_-]*):(?:[\t ]*(.*))?$/u;
const SEQUENCE_ENTRY = /^(\s*-\s+)(.*)$/u;
const PROSE_FIELDS = new Set([
  "basis",
  "body",
  "content",
  "english_gloss",
  "limits",
  "note",
  "observation",
  "textual_basis",
  "title",
]);

export type FencedRecordMigrationEntry = {
  path: string;
  blockCount: number;
  changed: boolean;
  beforeSha256: string;
  afterSha256: string;
  content?: string;
  error?: string;
  defects?: FencedRecordMigrationDefect[];
};

export type FencedRecordMigrationDefect = {
  blockIndex: number;
  startLine: number;
  recordId: string | undefined;
  code: "duplicate_top_level_key" | "unkeyed_scalar" | "ambiguous_yaml";
  field: string | undefined;
  originalExcerpt: string;
  fieldInterpretations: string[];
  error: string;
  recommendedRepair: string;
};

export type FencedRecordMigrationPlan = {
  entries: FencedRecordMigrationEntry[];
  changedFiles: number;
  failedFiles: number;
  blockCount: number;
};

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function stripTrailingDocumentSeparators(source: string) {
  const lines = source.replace(/\r\n?/gu, "\n").split("\n");
  while (lines.at(-1)?.trim() === "") lines.pop();
  while (lines.at(-1)?.trim() === "---" || lines.at(-1)?.trim() === "...") {
    lines.pop();
    while (lines.at(-1)?.trim() === "") lines.pop();
  }
  return lines.join("\n");
}

function canonicalInlineValue(raw: string) {
  const value = raw.trim();
  if (value === "") return "";
  try {
    const parsed = parseCanonicalYamlRecord(`value: ${value}`).value;
    if (parsed !== undefined && !(typeof parsed === "object" && !value.startsWith("[") && !value.startsWith("{"))) {
      return stringify(parsed, {
        aliasDuplicateObjects: false,
        collectionStyle: "flow",
        lineWidth: 0,
        schema: "core",
        version: "1.2",
      }).trim();
    }
  } catch {
    // The legacy scalar is quoted below as data. Canonical readers never use this recovery path.
  }
  return JSON.stringify(value);
}

/**
 * A bounded repair for two mechanically identifiable legacy wrapping defects:
 * prose indented below an empty prose key, and continuation lines that lost
 * the indentation of an explicit block scalar. Structural map/list children
 * and non-prose empty fields are never reinterpreted.
 */
function repairLegacyProseContinuations(source: string) {
  const lines = source.split("\n");
  const repaired: string[] = [];
  let blockScalarIndent: number | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const indent = /^\s*/u.exec(line)?.[0].length ?? 0;
    const mapping = MAP_ENTRY.exec(line);

    if (blockScalarIndent !== undefined) {
      if (line.trim() === "" || indent > blockScalarIndent) {
        repaired.push(line);
        continue;
      }
      if (!mapping || mapping[2] !== undefined || (mapping[1]?.length ?? 0) > blockScalarIndent) {
        repaired.push(`${" ".repeat(blockScalarIndent + 2)}${line.trimStart()}`);
        continue;
      }
      blockScalarIndent = undefined;
    }

    if (!mapping) {
      repaired.push(line);
      continue;
    }

    const prefix = `${mapping[1] ?? ""}${mapping[2] ?? ""}${mapping[3]}:`;
    const rawValue = mapping[4] ?? "";
    const mappingIndent = (mapping[1]?.length ?? 0) + (mapping[2]?.length ?? 0);
    if (BLOCK_SCALAR.test(rawValue.trim())) {
      repaired.push(`${prefix} ${rawValue.trim()}`);
      blockScalarIndent = mappingIndent;
      continue;
    }

    if (rawValue === "" && PROSE_FIELDS.has(mapping[3]!)) {
      const nextNonblank = lines.slice(index + 1).find((candidate) => candidate.trim() !== "");
      if (nextNonblank !== undefined) {
        const nextIndent = /^\s*/u.exec(nextNonblank)?.[0].length ?? 0;
        const nextMapping = MAP_ENTRY.exec(nextNonblank);
        const nextSequence = SEQUENCE_ENTRY.exec(nextNonblank);
        const isStructuralChild =
          nextIndent > mappingIndent &&
          ((nextMapping !== null && (nextMapping[1]?.length ?? 0) >= nextIndent) || nextSequence !== null);
        if (nextIndent > mappingIndent && !isStructuralChild) {
          repaired.push(`${prefix} >-`);
          blockScalarIndent = mappingIndent;
          continue;
        }
      }
    }

    repaired.push(line);
  }

  return repaired.join("\n");
}

function quoteLegacyPlainScalars(source: string) {
  const lines = source.split("\n");
  let blockScalarIndent: number | undefined;
  return lines.map((line) => {
    const indent = /^\s*/u.exec(line)?.[0].length ?? 0;
    if (blockScalarIndent !== undefined) {
      if (line.trim() === "" || indent > blockScalarIndent) return line;
      blockScalarIndent = undefined;
    }

    const mapping = MAP_ENTRY.exec(line);
    if (mapping) {
      const prefix = `${mapping[1] ?? ""}${mapping[2] ?? ""}${mapping[3]}:`;
      const rawValue = mapping[4] ?? "";
      if (rawValue === "") return prefix;
      if (BLOCK_SCALAR.test(rawValue.trim())) {
        blockScalarIndent = (mapping[1]?.length ?? 0) + (mapping[2]?.length ?? 0);
        return `${prefix} ${rawValue.trim()}`;
      }
      return `${prefix} ${canonicalInlineValue(rawValue)}`;
    }

    const sequence = SEQUENCE_ENTRY.exec(line);
    if (sequence && sequence[2] !== "") {
      return `${sequence[1]}${canonicalInlineValue(sequence[2]!)}`;
    }
    return line;
  }).join("\n");
}

export function canonicalizeLegacyFencedRecord(source: string) {
  const withoutSeparators = stripTrailingDocumentSeparators(source);
  try {
    return serializeCanonicalYamlRecord(parseCanonicalYamlRecord(withoutSeparators));
  } catch {
    const repaired = quoteLegacyPlainScalars(repairLegacyProseContinuations(withoutSeparators));
    return serializeCanonicalYamlRecord(parseCanonicalYamlRecord(repaired, { context: "legacy fenced record" }));
  }
}

function replaceRawBlocks(content: string, blocks: RawFencedYamlBlock[]) {
  let cursor = 0;
  let result = "";
  for (const block of blocks) {
    result += content.slice(cursor, block.startOffset);
    result += `\`\`\`yaml\n${canonicalizeLegacyFencedRecord(block.content)}\`\`\``;
    cursor = block.endOffset;
  }
  return result + content.slice(cursor);
}

export function migrateFencedRecordMarkdown(content: string) {
  const blocks = rawFencedYamlBlocks(content);
  const migrated = replaceRawBlocks(content, blocks);
  return { content: migrated, blockCount: blocks.length, changed: migrated !== content };
}

function recordIdFromLegacyBlock(content: string) {
  for (const line of content.split("\n")) {
    const mapping = MAP_ENTRY.exec(line);
    if (
      mapping &&
      (mapping[3] === "observation_id" || mapping[3] === "claim_id" || mapping[3] === "relation_id" || mapping[3] === "commentary_id")
    ) {
      return (mapping[4] ?? "").trim().replace(/^["']|["']$/gu, "");
    }
  }
  return undefined;
}

function duplicateTopLevelFields(lines: string[]) {
  const occurrences = new Map<string, number[]>();
  for (const [index, line] of lines.entries()) {
    const mapping = MAP_ENTRY.exec(line);
    if (!mapping || mapping[2] !== undefined || (mapping[1]?.length ?? 0) !== 0) continue;
    const indexes = occurrences.get(mapping[3]!) ?? [];
    indexes.push(index);
    occurrences.set(mapping[3]!, indexes);
  }
  return [...occurrences.entries()].filter(([, indexes]) => indexes.length > 1);
}

function topLevelFieldSection(lines: string[], start: number) {
  let end = start + 1;
  while (end < lines.length) {
    const mapping = MAP_ENTRY.exec(lines[end]!);
    if (mapping && mapping[2] === undefined && (mapping[1]?.length ?? 0) === 0) break;
    end += 1;
  }
  return lines.slice(start, end).join("\n");
}

function migrationDefect(block: RawFencedYamlBlock, error: unknown): FencedRecordMigrationDefect {
  const message = error instanceof Error ? error.message : String(error);
  const lines = block.content.split("\n");
  const duplicates = duplicateTopLevelFields(lines);
  const errorLine = Number(/ at line (\d+), column/iu.exec(message)?.[1] ?? 1);
  const excerptStart = Math.max(0, errorLine - 5);
  const excerptEnd = Math.min(lines.length, errorLine + 2);
  const originalExcerpt = lines
    .slice(excerptStart, excerptEnd)
    .map((line, offset) => `${excerptStart + offset + 1}: ${line}`)
    .join("\n");

  if (duplicates.length > 0) {
    const [field, indexes] = duplicates[0]!;
    return {
      blockIndex: block.index,
      startLine: block.startLine,
      recordId: recordIdFromLegacyBlock(block.content),
      code: "duplicate_top_level_key",
      field,
      originalExcerpt,
      fieldInterpretations: indexes.map((index) => topLevelFieldSection(lines, index)),
      error: message,
      recommendedRepair:
        `Compare each candidate ${field} value with source_ref.source_path and its [start_char,end_char) span; retain one exact source-bound value and delete the conflicting duplicate.`,
    };
  }

  const offendingLine = lines[errorLine - 1]?.trim();
  const unkeyedScalar = offendingLine !== undefined && offendingLine !== "" && MAP_ENTRY.exec(lines[errorLine - 1]!) === null;
  return {
    blockIndex: block.index,
    startLine: block.startLine,
    recordId: recordIdFromLegacyBlock(block.content),
    code: unkeyedScalar ? "unkeyed_scalar" : "ambiguous_yaml",
    field: undefined,
    originalExcerpt,
    fieldInterpretations: unkeyedScalar ? [`unkeyed scalar: ${offendingLine}`] : [],
    error: message,
    recommendedRepair: unkeyedScalar
      ? "Verify the unkeyed token against the record's cited Greek source span; delete it only if it carries no source-bound fact, otherwise assign it to an explicit canonical field."
      : "Adjudicate the malformed block against its cited Greek source span before assigning canonical YAML structure.",
  };
}

function inspectMigrationDefects(content: string) {
  const defects: FencedRecordMigrationDefect[] = [];
  for (const block of rawFencedYamlBlocks(content)) {
    try {
      canonicalizeLegacyFencedRecord(block.content);
    } catch (error) {
      defects.push(migrationDefect(block, error));
    }
  }
  return defects;
}

function canonicalLedgerPaths(repoRoot: string) {
  return LEDGER_LANES.flatMap((lane) => {
    const directory = join(repoRoot, "wiki", lane);
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => join(directory, entry.name));
  }).sort();
}

function resolveRequestedPaths(repoRoot: string, paths: string[] | undefined) {
  if (!paths || paths.length === 0) return canonicalLedgerPaths(repoRoot);
  const allowedRoots = LEDGER_LANES.map((lane) => `${resolve(repoRoot, "wiki", lane)}/`);
  return [...new Set(paths.map((path) => resolve(repoRoot, path)))].sort().map((path) => {
    if (!allowedRoots.some((root) => path.startsWith(root)) || !path.endsWith(".md")) {
      throw new Error(`Migration path is outside canonical fenced-record ledgers: ${relative(repoRoot, path)}`);
    }
    if (!existsSync(path)) throw new Error(`Migration path does not exist: ${relative(repoRoot, path)}`);
    return path;
  });
}

export function planFencedRecordMigration(
  options: { repoRoot?: string; paths?: string[]; includeContent?: boolean } = {},
): FencedRecordMigrationPlan {
  const repoRoot = options.repoRoot ?? getRepoRoot();
  const entries = resolveRequestedPaths(repoRoot, options.paths).map((absolutePath): FencedRecordMigrationEntry => {
    const path = relative(repoRoot, absolutePath);
    const before = readFileSync(absolutePath, "utf8");
    try {
      const migrated = migrateFencedRecordMarkdown(before);
      return {
        path,
        blockCount: migrated.blockCount,
        changed: migrated.changed,
        beforeSha256: sha256(before),
        afterSha256: sha256(migrated.content),
        ...(options.includeContent ? { content: migrated.content } : {}),
      };
    } catch (error) {
      const defects = inspectMigrationDefects(before);
      return {
        path,
        blockCount: rawFencedYamlBlocks(before).length,
        changed: false,
        beforeSha256: sha256(before),
        afterSha256: sha256(before),
        error: error instanceof Error ? error.message : String(error),
        defects,
      };
    }
  });
  return {
    entries,
    changedFiles: entries.filter((entry) => entry.changed).length,
    failedFiles: entries.filter((entry) => entry.error).length,
    blockCount: entries.reduce((total, entry) => total + entry.blockCount, 0),
  };
}

export function applyFencedRecordMigration(options: { repoRoot?: string; paths?: string[] } = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot();
  const plan = planFencedRecordMigration({ ...options, repoRoot, includeContent: true });
  if (plan.failedFiles > 0) {
    throw new Error(`Refusing fenced-record migration: ${plan.failedFiles} file(s) require manual adjudication.`);
  }
  for (const entry of plan.entries) {
    if (!entry.changed || entry.content === undefined) continue;
    const path = join(repoRoot, entry.path);
    const temporaryPath = join(dirname(path), `.${path.split("/").at(-1)}.canonical-yaml.tmp`);
    writeFileSync(temporaryPath, entry.content, "utf8");
    renameSync(temporaryPath, path);
  }
  return plan;
}

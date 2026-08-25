import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;

export type ObservationMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  observationId: string | undefined;
};

function cleanScalar(rawValue: string | undefined) {
  return rawValue?.trim().replace(/^["']|["']$/gu, "");
}

function countLinesBefore(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

// A field line ending in a block-scalar indicator ("observation: |") carries
// its value on the indented lines that follow. Reading only the field line
// leaked the indicator itself as the value — 760 record bodies rendered as a
// bare "|" or ">-" before this handled them.
const BLOCK_SCALAR_INDICATOR = /^[|>][+-]?$/u;

function blockScalarValue(block: string, fieldLineEnd: number, indicator: string) {
  const collected: string[] = [];
  for (const line of block.slice(fieldLineEnd).split("\n").slice(1)) {
    if (line.trim() === "") {
      collected.push("");
      continue;
    }
    if (/^\S/u.test(line)) break;
    collected.push(line);
  }
  while (collected.length > 0 && collected.at(-1) === "") collected.pop();
  const indents = collected.filter((line) => line !== "").map((line) => /^\s*/u.exec(line)![0].length);
  const indent = indents.length > 0 ? Math.min(...indents) : 0;
  const dedented = collected.map((line) => (line === "" ? "" : line.slice(indent)));
  if (indicator.startsWith("|")) return dedented.join("\n").trimEnd();
  let folded = "";
  for (const line of dedented) {
    if (line === "") folded += "\n";
    else folded += (folded === "" || folded.endsWith("\n") ? "" : " ") + line;
  }
  return folded.trimEnd();
}

export function fieldValue(block: string, field: string) {
  const match = new RegExp(`^${field}:\\s*(.*)$`, "mu").exec(block);
  if (!match) return undefined;
  const raw = (match[1] ?? "").trim();
  if (BLOCK_SCALAR_INDICATOR.test(raw)) {
    return blockScalarValue(block, (match.index ?? 0) + match[0].length, raw);
  }
  return cleanScalar(match[1]);
}

export function fieldValueOrEmpty(block: string, field: string) {
  return fieldValue(block, field) ?? "";
}

export function nestedFieldValue(block: string, field: string) {
  return cleanScalar(new RegExp(`^\\s+${field}:\\s*(.*)$`, "mu").exec(block)?.[1]);
}

export function nestedFieldValueInParent(block: string, parent: string, field: string) {
  const parentMatch = new RegExp(`^${parent}:\\s*$`, "mu").exec(block);
  if (!parentMatch) return "";

  const afterParent = block.slice((parentMatch.index ?? 0) + parentMatch[0].length);
  const nestedLines: string[] = [];
  for (const line of afterParent.split("\n")) {
    if (/^\S/u.test(line)) break;
    nestedLines.push(line);
  }

  return nestedFieldValue(nestedLines.join("\n"), field) ?? "";
}

export function listFieldValue(block: string, field: string) {
  const scalar = fieldValue(block, field);
  if (!scalar) return [];

  if (scalar.startsWith("[") && scalar.endsWith("]")) {
    const body = scalar.slice(1, -1).trim();
    if (!body) return [];
    return body
      .split(/,\s*/u)
      .map((value) => value.trim().replace(/^["']|["']$/gu, ""))
      .filter(Boolean);
  }

  return scalar
    .split(/,\s*/u)
    .map((value) => value.trim().replace(/^["']|["']$/gu, ""))
    .filter(Boolean);
}

export function observationMarkdownBlocks(content: string): ObservationMarkdownBlock[] {
  return [...content.matchAll(YAML_BLOCK_RE)].map((match, index) => {
    const block = match[1] ?? "";
    return {
      content: block,
      fullMatch: match[0],
      startLine: countLinesBefore(content, match.index ?? 0) + 1,
      index,
      observationId: fieldValue(block, "observation_id"),
    };
  });
}

export function observationYamlBlocks(content: string) {
  return observationMarkdownBlocks(content).map((block) => block.content);
}

export function replaceObservationYamlBlocks(
  content: string,
  replacer: (block: string, fullMatch: string) => string,
) {
  return content.replace(YAML_BLOCK_RE, (fullMatch, block: string) => replacer(block, fullMatch));
}

export function dialogueFromObservationId(observationId: string, fallback = "(unknown)") {
  return /^obs_([a-z0-9-]+)_\d+$/u.exec(observationId)?.[1] ?? fallback;
}

export function listObservationLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const observationDir = join(getRepoRoot(), "wiki/observations");
  if (!existsSync(observationDir)) return [];

  return readdirSync(observationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(observationDir, entry.name) : `wiki/observations/${entry.name}`))
    .sort();
}

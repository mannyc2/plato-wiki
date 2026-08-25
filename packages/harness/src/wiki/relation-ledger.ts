import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;

export type RelationMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  relationId: string | undefined;
};

function countLinesBefore(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

export function relationMarkdownBlocks(content: string): RelationMarkdownBlock[] {
  return [...content.matchAll(YAML_BLOCK_RE)].map((match, index) => {
    const block = match[1] ?? "";
    return {
      content: block,
      fullMatch: match[0],
      startLine: countLinesBefore(content, match.index ?? 0) + 1,
      index,
      relationId: fieldValue(block, "relation_id"),
    };
  });
}

export function relationYamlBlocks(content: string) {
  return relationMarkdownBlocks(content).map((block) => block.content);
}

export function replaceRelationYamlBlocks(content: string, replacer: (block: string, fullMatch: string) => string) {
  return content.replace(YAML_BLOCK_RE, (fullMatch, block: string) => replacer(block, fullMatch));
}

export function listRelationLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const relationDir = join(getRepoRoot(), "wiki/relations");
  if (!existsSync(relationDir)) return [];

  return readdirSync(relationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(relationDir, entry.name) : `wiki/relations/${entry.name}`))
    .sort();
}

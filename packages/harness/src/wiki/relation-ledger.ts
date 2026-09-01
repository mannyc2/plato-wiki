import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";
import { fencedYamlRecordBlocks, replaceFencedYamlRecordBlocks } from "./fenced-record.js";

export type RelationMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  relationId: string | undefined;
};

export function relationMarkdownBlocks(content: string): RelationMarkdownBlock[] {
  return fencedYamlRecordBlocks(content).map((block) => {
    return {
      content: block.content,
      fullMatch: block.fullMatch,
      startLine: block.startLine,
      index: block.index,
      relationId: fieldValue(block.content, "relation_id"),
    };
  });
}

export function relationYamlBlocks(content: string) {
  return relationMarkdownBlocks(content).map((block) => block.content);
}

export function replaceRelationYamlBlocks(content: string, replacer: (block: string, fullMatch: string) => string) {
  return replaceFencedYamlRecordBlocks(content, (block) => replacer(block.content, block.fullMatch));
}

export function listRelationLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const relationDir = join(getRepoRoot(), "wiki/relations");
  if (!existsSync(relationDir)) return [];

  return readdirSync(relationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(relationDir, entry.name) : `wiki/relations/${entry.name}`))
    .sort();
}

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";
import { fencedYamlRecordBlocks, replaceFencedYamlRecordBlocks } from "./fenced-record.js";

export type ClaimMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  claimId: string | undefined;
};

export function claimMarkdownBlocks(content: string): ClaimMarkdownBlock[] {
  return fencedYamlRecordBlocks(content).map((block) => {
    return {
      content: block.content,
      fullMatch: block.fullMatch,
      startLine: block.startLine,
      index: block.index,
      claimId: fieldValue(block.content, "claim_id"),
    };
  });
}

export function claimYamlBlocks(content: string) {
  return claimMarkdownBlocks(content).map((block) => block.content);
}

export function replaceClaimYamlBlocks(content: string, replacer: (block: string, fullMatch: string) => string) {
  return replaceFencedYamlRecordBlocks(content, (block) => replacer(block.content, block.fullMatch));
}

export function listClaimLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const claimDir = join(getRepoRoot(), "wiki/claims");
  if (!existsSync(claimDir)) return [];

  return readdirSync(claimDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(claimDir, entry.name) : `wiki/claims/${entry.name}`))
    .sort();
}

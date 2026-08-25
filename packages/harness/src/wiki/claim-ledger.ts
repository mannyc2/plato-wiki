import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;

export type ClaimMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  claimId: string | undefined;
};

function countLinesBefore(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

export function claimMarkdownBlocks(content: string): ClaimMarkdownBlock[] {
  return [...content.matchAll(YAML_BLOCK_RE)].map((match, index) => {
    const block = match[1] ?? "";
    return {
      content: block,
      fullMatch: match[0],
      startLine: countLinesBefore(content, match.index ?? 0) + 1,
      index,
      claimId: fieldValue(block, "claim_id"),
    };
  });
}

export function claimYamlBlocks(content: string) {
  return claimMarkdownBlocks(content).map((block) => block.content);
}

export function replaceClaimYamlBlocks(content: string, replacer: (block: string, fullMatch: string) => string) {
  return content.replace(YAML_BLOCK_RE, (fullMatch, block: string) => replacer(block, fullMatch));
}

export function listClaimLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const claimDir = join(getRepoRoot(), "wiki/claims");
  if (!existsSync(claimDir)) return [];

  return readdirSync(claimDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(claimDir, entry.name) : `wiki/claims/${entry.name}`))
    .sort();
}

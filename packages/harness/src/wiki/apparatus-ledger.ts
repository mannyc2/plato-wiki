import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;

export type ApparatusMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  apparatusId: string | undefined;
};

function countLinesBefore(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

export function apparatusMarkdownBlocks(content: string): ApparatusMarkdownBlock[] {
  return [...content.matchAll(YAML_BLOCK_RE)].map((match, index) => {
    const block = match[1] ?? "";
    return {
      content: block,
      fullMatch: match[0],
      startLine: countLinesBefore(content, match.index ?? 0) + 1,
      index,
      apparatusId: fieldValue(block, "apparatus_id"),
    };
  });
}

export function apparatusYamlBlocks(content: string) {
  return apparatusMarkdownBlocks(content).map((block) => block.content);
}

export function listApparatusLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const apparatusDir = join(getRepoRoot(), "wiki/apparatus");
  if (!existsSync(apparatusDir)) return [];

  return readdirSync(apparatusDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(apparatusDir, entry.name) : `wiki/apparatus/${entry.name}`))
    .sort();
}

export function dialogueFromApparatusPath(path: string) {
  return /^wiki\/apparatus\/(.+)\.md$/u.exec(path)?.[1];
}

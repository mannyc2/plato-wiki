import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;

export type CommentaryMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  commentaryId: string | undefined;
};

function countLinesBefore(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

export function commentaryMarkdownBlocks(content: string): CommentaryMarkdownBlock[] {
  return [...content.matchAll(YAML_BLOCK_RE)].map((match, index) => {
    const block = match[1] ?? "";
    return {
      content: block,
      fullMatch: match[0],
      startLine: countLinesBefore(content, match.index ?? 0) + 1,
      index,
      commentaryId: fieldValue(block, "commentary_id"),
    };
  });
}

export function commentaryYamlBlocks(content: string) {
  return commentaryMarkdownBlocks(content).map((block) => block.content);
}

export function listCommentaryLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const commentaryDir = join(getRepoRoot(), "wiki/commentary");
  if (!existsSync(commentaryDir)) return [];

  return readdirSync(commentaryDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(commentaryDir, entry.name) : `wiki/commentary/${entry.name}`))
    .sort();
}

export function dialogueFromCommentaryPath(path: string) {
  return /^wiki\/commentary\/(.+)\.md$/u.exec(path)?.[1];
}

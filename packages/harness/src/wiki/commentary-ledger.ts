import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue } from "./observation-ledger.js";
import { fencedYamlRecordBlocks } from "./fenced-record.js";

export type CommentaryMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  commentaryId: string | undefined;
};

export function commentaryMarkdownBlocks(content: string): CommentaryMarkdownBlock[] {
  return fencedYamlRecordBlocks(content).map((block) => {
    return {
      content: block.content,
      fullMatch: block.fullMatch,
      startLine: block.startLine,
      index: block.index,
      commentaryId: fieldValue(block.content, "commentary_id"),
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

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  fencedYamlRecordBlocks,
  fieldValue,
  fieldValueOrEmpty,
  listFieldValue,
  nestedFieldValue,
  nestedFieldValueInParent,
  nestedFieldValueInPath,
  replaceFencedYamlRecordBlocks,
} from "./fenced-record.js";

export {
  fieldValue,
  fieldValueOrEmpty,
  listFieldValue,
  nestedFieldValue,
  nestedFieldValueInParent,
  nestedFieldValueInPath,
};

export type ObservationMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  observationId: string | undefined;
};

export function observationMarkdownBlocks(content: string): ObservationMarkdownBlock[] {
  return fencedYamlRecordBlocks(content).map((block) => {
    return {
      content: block.content,
      fullMatch: block.fullMatch,
      startLine: block.startLine,
      index: block.index,
      observationId: fieldValue(block.content, "observation_id"),
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
  return replaceFencedYamlRecordBlocks(content, (block) => replacer(block.content, block.fullMatch));
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

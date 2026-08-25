import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { buildStephanusIndex, listGreekDialogues, markerForOffset } from "./stephanus.js";
import { parseTokenIndexToon, tokenIndexPath, tokenizeGreekText, type TokenIndex } from "./tokens.js";

declare const Bun: { TOML: { parse(content: string): unknown } };

export { markerForOffset };

export type AnchorLexiconGroup = {
  name: string;
  forms: string[];
};

export type AnchorLexicon = {
  path: string;
  sha256: string;
  groups: AnchorLexiconGroup[];
};

export type AnchorOccurrence = {
  group: string;
  form: string;
  startChar: number;
  endChar: number;
  marker: string;
  turnId: string;
  tokenIds: string[];
};

export type AnchorIndex = {
  dialogue: string;
  sourcePath: string;
  sourceSha256: string;
  lexiconPath: string;
  lexiconSha256: string;
  occurrences: AnchorOccurrence[];
};

type ParsedAnchorLexicon = {
  groups?: Array<{
    name?: unknown;
    forms?: unknown;
  }>;
};

function assertDialogueSlug(dialogue: string) {
  if (!/^[a-z0-9-]+$/u.test(dialogue)) {
    throw new Error(`Dialogue slug must use lowercase letters, numbers, and hyphens: ${dialogue}`);
  }
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function pad(value: string, width: number) {
  return value.padEnd(width, " ");
}

function normalizeLexicon(parsed: ParsedAnchorLexicon): AnchorLexiconGroup[] {
  if (!Array.isArray(parsed.groups)) {
    throw new Error("Anchor lexicon must define [[groups]].");
  }

  return parsed.groups.map((group, index) => {
    if (typeof group.name !== "string" || !/^[a-z0-9_]+$/u.test(group.name)) {
      throw new Error(`Anchor lexicon group ${index + 1} has an invalid name.`);
    }
    if (!Array.isArray(group.forms) || group.forms.some((form) => typeof form !== "string" || form.length === 0)) {
      throw new Error(`Anchor lexicon group ${group.name} must have non-empty string forms.`);
    }

    const forms = group.forms as string[];
    if (new Set(forms).size !== forms.length) {
      throw new Error(`Anchor lexicon group ${group.name} has duplicate forms.`);
    }

    return { name: group.name, forms };
  });
}

export function anchorLexiconPath() {
  return "derived/plato/anchors/lexicon.toml";
}

export function anchorIndexPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/anchors/${dialogue}.toon`;
}

export function readAnchorLexicon(): AnchorLexicon {
  const path = anchorLexiconPath();
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing anchor lexicon: ${path}`);
  }

  const content = readFileSync(absolutePath, "utf8");
  const parsed = Bun.TOML.parse(content) as ParsedAnchorLexicon;
  return {
    path,
    sha256: sha256(content),
    groups: normalizeLexicon(parsed),
  };
}

function readGeneratedTokenIndex(dialogue: string): { path: string; sha256: string; index: TokenIndex } {
  const path = tokenIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing generated token index for ${dialogue}: run bun run harness derive tokens ${dialogue}`);
  }

  const content = readFileSync(absolutePath, "utf8");
  return { path, sha256: sha256(content), index: parseTokenIndexToon(content) };
}

function normalizedFormTokens(form: string) {
  return tokenizeGreekText(form).map((token) => token.normalized);
}

function scanOccurrences(tokenIndex: TokenIndex, lexicon: AnchorLexicon) {
  const occurrences: AnchorOccurrence[] = [];
  for (const group of lexicon.groups) {
    for (const form of group.forms) {
      const normalizedTokens = normalizedFormTokens(form);
      if (normalizedTokens.length === 0) continue;

      for (let index = 0; index <= tokenIndex.tokens.length - normalizedTokens.length; index += 1) {
        const tokens = tokenIndex.tokens.slice(index, index + normalizedTokens.length);
        if (tokens.some((token, offset) => token.normalized !== normalizedTokens[offset])) continue;
        if (new Set(tokens.map((token) => token.turnId)).size !== 1) continue;

        occurrences.push({
          group: group.name,
          form,
          startChar: tokens[0]!.startChar,
          endChar: tokens.at(-1)!.endChar,
          marker: tokens[0]!.marker,
          turnId: tokens[0]!.turnId,
          tokenIds: tokens.map((token) => token.tokenId),
        });
      }
    }
  }

  return occurrences.sort(
    (a, b) =>
      a.startChar - b.startChar ||
      a.group.localeCompare(b.group) ||
      a.form.localeCompare(b.form) ||
      a.endChar - b.endChar,
  );
}

export function buildAnchorIndex(dialogue: string): AnchorIndex {
  assertDialogueSlug(dialogue);
  const stephanus = buildStephanusIndex(dialogue);
  const lexicon = readAnchorLexicon();
  const tokenIndex = readGeneratedTokenIndex(dialogue);
  if (tokenIndex.index.sourceSha256 !== stephanus.sourceSha256) {
    throw new Error(`Stale token index for ${dialogue}: source hash does not match ${stephanus.sourcePath}`);
  }

  return {
    dialogue,
    sourcePath: stephanus.sourcePath,
    sourceSha256: stephanus.sourceSha256,
    lexiconPath: lexicon.path,
    lexiconSha256: lexicon.sha256,
    occurrences: scanOccurrences(tokenIndex.index, lexicon),
  };
}

export function formatAnchorIndexToon(index: AnchorIndex) {
  const groupWidth = Math.max("group".length, ...index.occurrences.map((entry) => entry.group.length));
  const formWidth = Math.max("form".length, ...index.occurrences.map((entry) => entry.form.length));
  const startWidth = Math.max("start_char".length, ...index.occurrences.map((entry) => String(entry.startChar).length));
  const endWidth = Math.max("end_char".length, ...index.occurrences.map((entry) => String(entry.endChar).length));
  const markerWidth = Math.max("marker".length, ...index.occurrences.map((entry) => entry.marker.length));
  const turnIdWidth = Math.max("turn_id".length, ...index.occurrences.map((entry) => entry.turnId.length));
  const tokenIdsWidth = Math.max("token_ids".length, ...index.occurrences.map((entry) => entry.tokenIds.join(",").length));
  const rows = [
    `  ${pad("group", groupWidth)} | ${pad("form", formWidth)} | ${pad("start_char", startWidth)} | ${pad("end_char", endWidth)} | ${pad("marker", markerWidth)} | ${pad("turn_id", turnIdWidth)} | ${pad("token_ids", tokenIdsWidth)}`,
    ...index.occurrences.map(
      (entry) =>
        `  ${pad(entry.group, groupWidth)} | ${pad(entry.form, formWidth)} | ${pad(String(entry.startChar), startWidth)} | ${pad(String(entry.endChar), endWidth)} | ${pad(entry.marker, markerWidth)} | ${pad(entry.turnId, turnIdWidth)} | ${pad(entry.tokenIds.join(","), tokenIdsWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${index.dialogue}`,
    `source_path: ${index.sourcePath}`,
    `source_sha256: ${index.sourceSha256}`,
    `lexicon_path: ${index.lexiconPath}`,
    `lexicon_sha256: ${index.lexiconSha256}`,
    `anchors[${index.occurrences.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function writeAnchorIndex(dialogue: string) {
  const index = buildAnchorIndex(dialogue);
  const path = anchorIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatAnchorIndexToon(index), "utf8");
  return { path, occurrenceCount: index.occurrences.length };
}

export function writeAnchorIndexes(dialogue?: string | undefined) {
  const dialogues = dialogue ? [dialogue] : listGreekDialogues();
  return dialogues.map((entry) => writeAnchorIndex(entry));
}

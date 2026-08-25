import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { buildStephanusIndex, listGreekDialogues, markerForOffset } from "./stephanus.js";
import { parseTurnIndexToon, turnIndexPath, type TurnIndex, type TurnRecord } from "./turns.js";

export type TokenRecord = {
  tokenId: string;
  turnId: string;
  surface: string;
  normalized: string;
  startChar: number;
  endChar: number;
  marker: string;
};

export type TokenIndex = {
  dialogue: string;
  sourcePath: string;
  sourceSha256: string;
  turnIndexPath: string;
  turnIndexSha256: string;
  tokens: TokenRecord[];
};

export type GreekTokenSpan = {
  surface: string;
  normalized: string;
  startChar: number;
  endChar: number;
};

const GREEK_TOKEN = /[Ͱ-Ͽἀ-῿]+/gu;
const COMBINING_MARK = /\p{M}/gu;

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

export function normalizeGreekToken(surface: string) {
  return surface
    .normalize("NFD")
    .replace(COMBINING_MARK, "")
    .toLocaleLowerCase("el-GR")
    .replace(/ς/gu, "σ")
    .normalize("NFC");
}

export function tokenizeGreekText(content: string): GreekTokenSpan[] {
  return [...content.matchAll(GREEK_TOKEN)].map((match) => {
    const surface = match[0];
    const startChar = match.index ?? 0;
    return {
      surface,
      normalized: normalizeGreekToken(surface),
      startChar,
      endChar: startChar + surface.length,
    };
  });
}

function readGeneratedTurnIndex(dialogue: string): { path: string; sha256: string; index: TurnIndex } {
  const path = turnIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing generated turn index for ${dialogue}: run bun run harness derive turns ${dialogue}`);
  }

  const content = readFileSync(absolutePath, "utf8");
  return { path, sha256: sha256(content), index: parseTurnIndexToon(content) };
}

function turnForOffset(turns: TurnRecord[], offset: number): TurnRecord | undefined {
  return turns.find((turn) => turn.startChar <= offset && offset < turn.endChar);
}

export function tokenIndexPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/tokens/${dialogue}.toon`;
}

export function buildTokenIndex(dialogue: string): TokenIndex {
  assertDialogueSlug(dialogue);
  const turnIndex = readGeneratedTurnIndex(dialogue);
  const absoluteSourcePath = join(getRepoRoot(), turnIndex.index.sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    throw new Error(`Missing Greek text for dialogue: ${dialogue}`);
  }

  const content = readFileSync(absoluteSourcePath, "utf8");
  const sourceSha256 = sha256(content);
  if (sourceSha256 !== turnIndex.index.sourceSha256) {
    throw new Error(`Stale turn index for ${dialogue}: source hash does not match ${turnIndex.path}`);
  }
  const stephanus = buildStephanusIndex(dialogue);

  const tokens = tokenizeGreekText(content).map((token, index) => {
    const turn = turnForOffset(turnIndex.index.turns, token.startChar);
    if (!turn) {
      throw new Error(`Token at char ${token.startChar} in ${dialogue} is outside the generated turn index.`);
    }
    if (index + 1 > 999999) {
      throw new Error(`Dialogue ${dialogue} exceeds the 999999-token id limit.`);
    }

    return {
      tokenId: `tok_${dialogue}_${String(index + 1).padStart(6, "0")}`,
      turnId: turn.turnId,
      surface: token.surface,
      normalized: token.normalized,
      startChar: token.startChar,
      endChar: token.endChar,
      marker: markerForOffset(stephanus.markers, token.startChar),
    };
  });

  return {
    dialogue,
    sourcePath: turnIndex.index.sourcePath,
    sourceSha256,
    turnIndexPath: turnIndex.path,
    turnIndexSha256: turnIndex.sha256,
    tokens,
  };
}

export function formatTokenIndexToon(index: TokenIndex) {
  const tokenIdWidth = Math.max("token_id".length, ...index.tokens.map((entry) => entry.tokenId.length));
  const turnIdWidth = Math.max("turn_id".length, ...index.tokens.map((entry) => entry.turnId.length));
  const surfaceWidth = Math.max("surface".length, ...index.tokens.map((entry) => entry.surface.length));
  const normalizedWidth = Math.max("normalized".length, ...index.tokens.map((entry) => entry.normalized.length));
  const startWidth = Math.max("start_char".length, ...index.tokens.map((entry) => String(entry.startChar).length));
  const endWidth = Math.max("end_char".length, ...index.tokens.map((entry) => String(entry.endChar).length));
  const markerWidth = Math.max("marker".length, ...index.tokens.map((entry) => entry.marker.length));
  const rows = [
    `  ${pad("token_id", tokenIdWidth)} | ${pad("turn_id", turnIdWidth)} | ${pad("surface", surfaceWidth)} | ${pad("normalized", normalizedWidth)} | ${pad("start_char", startWidth)} | ${pad("end_char", endWidth)} | ${pad("marker", markerWidth)}`,
    ...index.tokens.map(
      (entry) =>
        `  ${pad(entry.tokenId, tokenIdWidth)} | ${pad(entry.turnId, turnIdWidth)} | ${pad(entry.surface, surfaceWidth)} | ${pad(entry.normalized, normalizedWidth)} | ${pad(String(entry.startChar), startWidth)} | ${pad(String(entry.endChar), endWidth)} | ${pad(entry.marker, markerWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${index.dialogue}`,
    `source_path: ${index.sourcePath}`,
    `source_sha256: ${index.sourceSha256}`,
    `turn_index_path: ${index.turnIndexPath}`,
    `turn_index_sha256: ${index.turnIndexSha256}`,
    `tokens[${index.tokens.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function parseTokenIndexToon(content: string): TokenIndex {
  const lines = content.trimEnd().split(/\r?\n/u);
  const dialogue = /^dialogue:\s+([a-z0-9-]+)$/u.exec(lines[0] ?? "")?.[1];
  const sourcePath = /^source_path:\s+(raw\/plato\/greek\/[a-z0-9-]+\.txt)$/u.exec(lines[1] ?? "")?.[1];
  const sourceSha256 = /^source_sha256:\s+([a-f0-9]{64})$/u.exec(lines[2] ?? "")?.[1];
  const turnPath = /^turn_index_path:\s+(derived\/plato\/turns\/[a-z0-9-]+\.toon)$/u.exec(lines[3] ?? "")?.[1];
  const turnSha256 = /^turn_index_sha256:\s+([a-f0-9]{64})$/u.exec(lines[4] ?? "")?.[1];
  const tokenCount = /^tokens\[(\d+)\]:$/u.exec(lines[5] ?? "")?.[1];
  const header = lines[6]?.split("|").map((column) => column.trim()).join(" | ");

  if (
    !dialogue ||
    !sourcePath ||
    !sourceSha256 ||
    !turnPath ||
    !turnSha256 ||
    tokenCount === undefined ||
    header !== "token_id | turn_id | surface | normalized | start_char | end_char | marker"
  ) {
    throw new Error("Malformed token index header.");
  }

  const tokens = lines.slice(7).map((line) => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== 7) {
      throw new Error(`Malformed token row: ${line}`);
    }

    const [tokenId, turnId, surface, normalized, startCharRaw, endCharRaw, marker] = columns;
    const startChar = Number(startCharRaw);
    const endChar = Number(endCharRaw);
    if (
      !tokenId ||
      !new RegExp(`^tok_${dialogue}_\\d{6}$`, "u").test(tokenId) ||
      !turnId ||
      !new RegExp(`^turn_${dialogue}_\\d{4}$`, "u").test(turnId) ||
      !surface ||
      !normalized ||
      !Number.isInteger(startChar) ||
      !Number.isInteger(endChar) ||
      endChar <= startChar ||
      !marker
    ) {
      throw new Error(`Malformed token row values: ${line}`);
    }

    return { tokenId, turnId, surface, normalized, startChar, endChar, marker };
  });

  if (tokens.length !== Number(tokenCount)) {
    throw new Error(`Token index count mismatch: expected ${tokenCount}, found ${tokens.length}`);
  }

  return {
    dialogue,
    sourcePath,
    sourceSha256,
    turnIndexPath: turnPath,
    turnIndexSha256: turnSha256,
    tokens,
  };
}

export function writeTokenIndex(dialogue: string) {
  const index = buildTokenIndex(dialogue);
  const path = tokenIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatTokenIndexToon(index), "utf8");
  return { path, tokenCount: index.tokens.length };
}

export function writeTokenIndexes(dialogue?: string | undefined) {
  const dialogues = dialogue ? [dialogue] : listGreekDialogues();
  return dialogues.map((entry) => writeTokenIndex(entry));
}

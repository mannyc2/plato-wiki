import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { buildStephanusIndex, listGreekDialogues, markerForOffset } from "./stephanus.js";

declare const Bun: { TOML: { parse(content: string): unknown } };

export type TurnRecord = {
  turnId: string;
  speaker: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  textSha256: string;
  greekCharCount: number;
};

export type TurnIndex = {
  dialogue: string;
  sourcePath: string;
  sourceSha256: string;
  siglaPath: string;
  siglaSha256: string;
  turns: TurnRecord[];
};

type ParsedSiglaRegistry = {
  dialogues?: Array<{
    slug?: unknown;
    sigla?: unknown;
  }>;
};

type TurnStart = {
  boundary: number;
  siglumStart: number;
  siglumEnd: number;
  speaker: string;
};

const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/gu;
const GREEK_LETTER_SINGLE = /[Ͱ-Ͽἀ-῿]/u;
const SIGLUM_PATTERN = /^[Α-ΩΪΫ]{2,8}\.( [Α-ΩΪΫ]{2,8}\.)?/u;
const SIGLUM_EXACT_PATTERN = /^[Α-ΩΪΫ]{2,8}\.( [Α-ΩΪΫ]{2,8}\.)?$/u;
const MARKUP_TOKEN_PATTERN = /^\{[^}]*\}$/u;

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

function greekCharCount(content: string) {
  return [...content.matchAll(GREEK_LETTER)].length;
}

function readGreekFileSlugs() {
  const greekDir = join(getRepoRoot(), "raw/plato/greek");
  if (!existsSync(greekDir)) return [];

  return readdirSync(greekDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => basename(entry.name, ".txt"))
    .sort();
}

function normalizeRegistry(parsed: ParsedSiglaRegistry): Map<string, string[]> {
  if (!Array.isArray(parsed.dialogues)) {
    throw new Error("Speaker sigla registry must define [[dialogues]].");
  }

  const dialogues = new Map<string, string[]>();
  for (const [index, entry] of parsed.dialogues.entries()) {
    if (typeof entry.slug !== "string" || !/^[a-z0-9-]+$/u.test(entry.slug)) {
      throw new Error(`Speaker sigla registry entry ${index + 1} has an invalid slug.`);
    }
    if (dialogues.has(entry.slug)) {
      throw new Error(`Speaker sigla registry has duplicate dialogue: ${entry.slug}`);
    }
    if (!Array.isArray(entry.sigla) || entry.sigla.some((siglum) => typeof siglum !== "string")) {
      throw new Error(`Speaker sigla registry entry ${entry.slug} must define sigla as a string array.`);
    }

    const sigla = entry.sigla as string[];
    if (sigla.some((siglum) => siglum.length === 0 || !SIGLUM_EXACT_PATTERN.test(siglum))) {
      throw new Error(`Speaker sigla registry entry ${entry.slug} has an invalid siglum.`);
    }
    if (new Set(sigla).size !== sigla.length) {
      throw new Error(`Speaker sigla registry entry ${entry.slug} has duplicate sigla.`);
    }

    dialogues.set(entry.slug, sigla);
  }

  return dialogues;
}

function isCandidatePosition(content: string, offset: number) {
  let cursor = offset;
  while (cursor > 0 && content[cursor - 1] === " ") {
    cursor -= 1;
  }

  return cursor === 0 || content[cursor - 1] === "\n" || content[cursor - 1] === "}";
}

function markupTokenStartEndingAt(content: string, end: number) {
  if (end <= 0 || content[end - 1] !== "}") return undefined;

  const start = content.lastIndexOf("{", end - 1);
  if (start === -1) return undefined;

  const token = content.slice(start, end);
  return MARKUP_TOKEN_PATTERN.test(token) ? start : undefined;
}

function turnBoundaryForSiglum(content: string, siglumStart: number) {
  let cursor = siglumStart;
  while (cursor > 0 && content[cursor - 1] === " ") {
    cursor -= 1;
  }

  let earliestTokenStart: number | undefined;
  while (true) {
    const tokenStart = markupTokenStartEndingAt(content, cursor);
    if (tokenStart === undefined) {
      if (cursor === 0) return 0;
      return content[cursor - 1] === "\n" ? cursor : (earliestTokenStart ?? siglumStart);
    }

    cursor = tokenStart;
    earliestTokenStart = tokenStart;

    let beforeSpaces = cursor;
    while (beforeSpaces > 0 && content[beforeSpaces - 1] === " ") {
      beforeSpaces -= 1;
    }

    if (beforeSpaces === 0) return 0;
    if (content[beforeSpaces - 1] === "\n") return beforeSpaces;
    if (content[beforeSpaces - 1] === "}") {
      cursor = beforeSpaces;
      continue;
    }

    return earliestTokenStart;
  }
}

function matchKnownSiglum(content: string, offset: number, sigla: string[]) {
  for (const siglum of sigla) {
    if (!content.startsWith(siglum, offset)) continue;

    // Laws has a few allowlisted line-start labels with no following space.
    // Candidate position plus the curated registry is the stronger guard.
    return siglum;
  }

  return undefined;
}

function findTurnStarts(content: string, sourcePath: string, sigla: string[]) {
  const sortedSigla = [...sigla].sort((a, b) => b.length - a.length || a.localeCompare(b));
  const starts: TurnStart[] = [];

  for (let offset = 0; offset < content.length; offset += 1) {
    if (!isCandidatePosition(content, offset)) continue;

    const siglum = matchKnownSiglum(content, offset, sortedSigla);
    if (siglum) {
      starts.push({
        boundary: turnBoundaryForSiglum(content, offset),
        siglumStart: offset,
        siglumEnd: offset + siglum.length,
        speaker: siglum,
      });
      offset += siglum.length - 1;
      continue;
    }

    const unknown = SIGLUM_PATTERN.exec(content.slice(offset))?.[0];
    if (unknown) {
      throw new Error(
        `Unknown siglum "${unknown}" at char ${offset} in ${sourcePath}. Add it to derived/plato/turns/sigla.toml or fix the source.`,
      );
    }
  }

  return starts.sort((a, b) => a.boundary - b.boundary || a.siglumStart - b.siglumStart);
}

function assertNoStraySigla(content: string, dialogue: string, sigla: string[], matchedSpans: Array<{ start: number; end: number }>) {
  for (const siglum of sigla) {
    let start = content.indexOf(siglum);
    while (start !== -1) {
      const end = start + siglum.length;
      const insideMatchedSpan = matchedSpans.some((span) => span.start <= start && end <= span.end);
      const embeddedInGreekWord =
        (start > 0 && GREEK_LETTER_SINGLE.test(content[start - 1]!)) ||
        (end < content.length && GREEK_LETTER_SINGLE.test(content[end]!));
      if (!insideMatchedSpan && !embeddedInGreekWord) {
        throw new Error(`Stray siglum "${siglum}" at char ${start} in ${dialogue}.`);
      }
      start = content.indexOf(siglum, start + 1);
    }
  }
}

function buildTurnRecord(
  dialogue: string,
  index: number,
  speaker: string,
  content: string,
  markers: Array<{ marker: string; startChar: number; endChar: number }>,
  startChar: number,
  endChar: number,
): TurnRecord {
  if (index > 9999) {
    throw new Error(`Dialogue ${dialogue} exceeds the 9999-turn id limit.`);
  }

  const text = content.slice(startChar, endChar);
  return {
    turnId: `turn_${dialogue}_${String(index).padStart(4, "0")}`,
    speaker,
    startMarker: markerForOffset(markers, startChar),
    endMarker: markerForOffset(markers, Math.max(startChar, endChar - 1)),
    startChar,
    endChar,
    textSha256: sha256(text),
    // The siglum is part of the source region, so its letters count too.
    greekCharCount: greekCharCount(text),
  };
}

function createTurnRecords(
  dialogue: string,
  content: string,
  markers: Array<{ marker: string; startChar: number; endChar: number }>,
  starts: TurnStart[],
) {
  if (starts.length === 0) {
    return [buildTurnRecord(dialogue, 1, "(none)", content, markers, 0, content.length)];
  }

  const records: TurnRecord[] = [];
  const first = { ...starts[0]! };
  if (first.boundary > 0) {
    const lead = content.slice(0, first.boundary);
    if (greekCharCount(lead) > 0) {
      records.push(buildTurnRecord(dialogue, records.length + 1, "(none)", content, markers, 0, first.boundary));
    } else {
      first.boundary = 0;
    }
  }

  const adjustedStarts = [first, ...starts.slice(1)];
  for (const [index, start] of adjustedStarts.entries()) {
    const next = adjustedStarts[index + 1];
    records.push(
      buildTurnRecord(dialogue, records.length + 1, start.speaker, content, markers, start.boundary, next?.boundary ?? content.length),
    );
  }

  return records;
}

export function siglaRegistryPath() {
  return "derived/plato/turns/sigla.toml";
}

export function turnIndexPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/turns/${dialogue}.toon`;
}

export function readSiglaRegistry() {
  const path = siglaRegistryPath();
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing speaker sigla registry: ${path}`);
  }

  const content = readFileSync(absolutePath, "utf8");
  return {
    path,
    sha256: sha256(content),
    dialogues: normalizeRegistry(Bun.TOML.parse(content) as ParsedSiglaRegistry),
  };
}

export function buildTurnIndex(dialogue: string): TurnIndex {
  assertDialogueSlug(dialogue);
  const registry = readSiglaRegistry();
  const sigla = registry.dialogues.get(dialogue);
  if (!sigla) {
    throw new Error(`Missing speaker sigla registry entry for dialogue: ${dialogue}`);
  }

  const stephanus = buildStephanusIndex(dialogue);
  const content = readFileSync(join(getRepoRoot(), stephanus.sourcePath), "utf8");
  const starts = sigla.length === 0 ? [] : findTurnStarts(content, stephanus.sourcePath, sigla);
  assertNoStraySigla(
    content,
    dialogue,
    sigla,
    starts.map((start) => ({ start: start.siglumStart, end: start.siglumEnd })),
  );

  return {
    dialogue,
    sourcePath: stephanus.sourcePath,
    sourceSha256: stephanus.sourceSha256,
    siglaPath: registry.path,
    siglaSha256: registry.sha256,
    turns: createTurnRecords(dialogue, content, stephanus.markers, starts),
  };
}

export function formatTurnIndexToon(index: TurnIndex) {
  const turnIdWidth = Math.max("turn_id".length, ...index.turns.map((entry) => entry.turnId.length));
  const speakerWidth = Math.max("speaker".length, ...index.turns.map((entry) => entry.speaker.length));
  const startMarkerWidth = Math.max("start_marker".length, ...index.turns.map((entry) => entry.startMarker.length));
  const endMarkerWidth = Math.max("end_marker".length, ...index.turns.map((entry) => entry.endMarker.length));
  const startWidth = Math.max("start_char".length, ...index.turns.map((entry) => String(entry.startChar).length));
  const endWidth = Math.max("end_char".length, ...index.turns.map((entry) => String(entry.endChar).length));
  const hashWidth = Math.max("text_sha256".length, ...index.turns.map((entry) => entry.textSha256.length));
  const countWidth = Math.max("greek_char_count".length, ...index.turns.map((entry) => String(entry.greekCharCount).length));
  const rows = [
    `  ${pad("turn_id", turnIdWidth)} | ${pad("speaker", speakerWidth)} | ${pad("start_marker", startMarkerWidth)} | ${pad("end_marker", endMarkerWidth)} | ${pad("start_char", startWidth)} | ${pad("end_char", endWidth)} | ${pad("text_sha256", hashWidth)} | ${pad("greek_char_count", countWidth)}`,
    ...index.turns.map(
      (entry) =>
        `  ${pad(entry.turnId, turnIdWidth)} | ${pad(entry.speaker, speakerWidth)} | ${pad(entry.startMarker, startMarkerWidth)} | ${pad(entry.endMarker, endMarkerWidth)} | ${pad(String(entry.startChar), startWidth)} | ${pad(String(entry.endChar), endWidth)} | ${pad(entry.textSha256, hashWidth)} | ${pad(String(entry.greekCharCount), countWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${index.dialogue}`,
    `source_path: ${index.sourcePath}`,
    `source_sha256: ${index.sourceSha256}`,
    `sigla_path: ${index.siglaPath}`,
    `sigla_sha256: ${index.siglaSha256}`,
    `turns[${index.turns.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function parseTurnIndexToon(content: string): TurnIndex {
  const lines = content.trimEnd().split(/\r?\n/u);
  const dialogue = /^dialogue:\s+([a-z0-9-]+)$/u.exec(lines[0] ?? "")?.[1];
  const sourcePath = /^source_path:\s+(raw\/plato\/greek\/[a-z0-9-]+\.txt)$/u.exec(lines[1] ?? "")?.[1];
  const sourceSha256 = /^source_sha256:\s+([a-f0-9]{64})$/u.exec(lines[2] ?? "")?.[1];
  const siglaPath = /^sigla_path:\s+(derived\/plato\/turns\/sigla\.toml)$/u.exec(lines[3] ?? "")?.[1];
  const siglaSha256 = /^sigla_sha256:\s+([a-f0-9]{64})$/u.exec(lines[4] ?? "")?.[1];
  const turnCount = /^turns\[(\d+)\]:$/u.exec(lines[5] ?? "")?.[1];
  const header = lines[6]?.split("|").map((column) => column.trim()).join(" | ");

  if (
    !dialogue ||
    !sourcePath ||
    !sourceSha256 ||
    !siglaPath ||
    !siglaSha256 ||
    turnCount === undefined ||
    header !== "turn_id | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count"
  ) {
    throw new Error("Malformed turn index header.");
  }

  const turns = lines.slice(7).map((line) => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== 8) {
      throw new Error(`Malformed turn row: ${line}`);
    }

    const [turnId, speaker, startMarker, endMarker, startCharRaw, endCharRaw, textSha256, greekCharCountRaw] = columns;
    const startChar = Number(startCharRaw);
    const endChar = Number(endCharRaw);
    const greekCharCount = Number(greekCharCountRaw);
    if (
      !turnId ||
      !new RegExp(`^turn_${dialogue}_\\d{4}$`, "u").test(turnId) ||
      !speaker ||
      !startMarker ||
      !endMarker ||
      !Number.isInteger(startChar) ||
      !Number.isInteger(endChar) ||
      endChar < startChar ||
      !textSha256 ||
      !/^[a-f0-9]{64}$/u.test(textSha256) ||
      !Number.isInteger(greekCharCount) ||
      greekCharCount < 0
    ) {
      throw new Error(`Malformed turn row values: ${line}`);
    }

    return {
      turnId,
      speaker,
      startMarker,
      endMarker,
      startChar,
      endChar,
      textSha256,
      greekCharCount,
    };
  });

  if (turns.length !== Number(turnCount)) {
    throw new Error(`Turn index count mismatch: expected ${turnCount}, found ${turns.length}`);
  }

  return {
    dialogue,
    sourcePath,
    sourceSha256,
    siglaPath,
    siglaSha256,
    turns,
  };
}

export function writeTurnIndex(dialogue: string) {
  const index = buildTurnIndex(dialogue);
  const path = turnIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatTurnIndexToon(index), "utf8");
  return { path, turnCount: index.turns.length };
}

export function writeTurnIndexes(dialogue?: string | undefined) {
  if (dialogue) {
    return [writeTurnIndex(dialogue)];
  }

  const registry = readSiglaRegistry();
  const fileDialogues = readGreekFileSlugs();
  const registryDialogues = [...registry.dialogues.keys()].sort();
  const missingRegistry = fileDialogues.filter((entry) => !registry.dialogues.has(entry));
  const missingFiles = registryDialogues.filter((entry) => !fileDialogues.includes(entry));
  if (missingRegistry.length > 0 || missingFiles.length > 0) {
    throw new Error(
      `Speaker sigla registry must match raw/plato/greek. Missing registry: ${missingRegistry.join(", ") || "(none)"}; missing files: ${missingFiles.join(", ") || "(none)"}.`,
    );
  }

  return listGreekDialogues().map((entry) => writeTurnIndex(entry));
}

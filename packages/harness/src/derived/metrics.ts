import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { readAnchorLexicon } from "./anchors.js";
import { listGreekDialogues } from "./stephanus.js";
import {
  parseTokenIndexToon,
  tokenizeGreekText,
  tokenIndexPath,
  type TokenIndex,
  type TokenRecord,
} from "./tokens.js";
import { parseTurnIndexToon, turnIndexPath, type TurnIndex, type TurnRecord } from "./turns.js";

declare const Bun: { TOML: { parse(content: string): unknown } };

export type TurnLengthMetricRow = {
  turnId: string;
  speaker: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  greekCharCount: number;
  tokenCount: number;
  dialogueLongTurn: boolean;
  speakerLongTurn: boolean;
};

export type TurnLengthSpeakerSummary = {
  speaker: string;
  turnCount: number;
  totalTokens: number;
  medianTokens: number;
  p90Tokens: number;
  maxTokens: number;
  longTurns: number;
};

export type TurnLengthMetrics = {
  dialogue: string;
  turnIndexPath: string;
  turnIndexSha256: string;
  tokenIndexPath: string;
  tokenIndexSha256: string;
  speakers: TurnLengthSpeakerSummary[];
  turns: TurnLengthMetricRow[];
};

export type AssentTurnMetricRow = {
  turnId: string;
  speaker: string;
  tokenCount: number;
  assentOccurrences: number;
  assentTokenCount: number;
  assentTokenIds: string[];
  shortAssent: boolean;
};

export type AssentSpeakerSummary = {
  speaker: string;
  turnCount: number;
  assentOccurrences: number;
  assentTokenCount: number;
  assentTurns: number;
  shortAssentTurns: number;
};

export type AssentStretch = {
  stretchId: string;
  speaker: string;
  startTurnId: string;
  endTurnId: string;
  turnCount: number;
  assentTokenIds: string[];
};

export type AssentMetrics = {
  dialogue: string;
  anchorLexiconPath: string;
  anchorLexiconSha256: string;
  tokenIndexPath: string;
  tokenIndexSha256: string;
  speakers: AssentSpeakerSummary[];
  turns: AssentTurnMetricRow[];
  stretches: AssentStretch[];
};

export type ProcedureCandidate = {
  candidateId: string;
  group: string;
  form: string;
  turnId: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  tokenIds: string[];
};

export type ProcedureMetrics = {
  dialogue: string;
  registryPath: string;
  registrySha256: string;
  tokenIndexPath: string;
  tokenIndexSha256: string;
  candidates: ProcedureCandidate[];
};

type GeneratedInputs = {
  turnPath: string;
  turnSha256: string;
  turnIndex: TurnIndex;
  tokenPath: string;
  tokenSha256: string;
  tokenIndex: TokenIndex;
};

type ParsedProcedureRegistry = {
  groups?: Array<{ name?: unknown; forms?: unknown }>;
};

type ProcedureRegistryGroup = {
  name: string;
  forms: string[];
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

function yesNo(value: boolean) {
  return value ? "yes" : "no";
}

function csv(values: string[]) {
  return values.join(",");
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/u, "").replace(/\.$/u, "");
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function quantile(values: number[], q: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * q)]!;
}

function longThreshold(values: number[]) {
  if (values.length < 4) return Number.POSITIVE_INFINITY;
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  return q3 + 1.5 * (q3 - q1);
}

function fileContent(path: string) {
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing generated artifact: ${path}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function readGeneratedInputs(dialogue: string): GeneratedInputs {
  assertDialogueSlug(dialogue);
  const turnPath = turnIndexPath(dialogue);
  const turnContent = fileContent(turnPath);
  const turnSha256 = sha256(turnContent);
  const turnIndex = parseTurnIndexToon(turnContent);

  const tokenPath = tokenIndexPath(dialogue);
  const tokenContent = fileContent(tokenPath);
  const tokenSha256 = sha256(tokenContent);
  const tokenIndex = parseTokenIndexToon(tokenContent);

  if (tokenIndex.turnIndexPath !== turnPath || tokenIndex.turnIndexSha256 !== turnSha256) {
    throw new Error(`Stale token index for ${dialogue}: turn index hash does not match ${turnPath}`);
  }
  if (tokenIndex.sourceSha256 !== turnIndex.sourceSha256) {
    throw new Error(`Stale token index for ${dialogue}: source hash does not match ${turnPath}`);
  }

  return { turnPath, turnSha256, turnIndex, tokenPath, tokenSha256, tokenIndex };
}

function tokensByTurn(tokens: TokenRecord[]) {
  const byTurn = new Map<string, TokenRecord[]>();
  for (const token of tokens) {
    byTurn.set(token.turnId, [...(byTurn.get(token.turnId) ?? []), token]);
  }
  return byTurn;
}

export function turnLengthMetricsPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/metrics/turn-lengths/${dialogue}.toon`;
}

export function assentMetricsPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/metrics/assent/${dialogue}.toon`;
}

export function procedureMetricsPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/metrics/procedure/${dialogue}.toon`;
}

export function procedureAnchorRegistryPath() {
  return "derived/plato/metrics/procedure/anchors.toml";
}

export function buildTurnLengthMetrics(dialogue: string): TurnLengthMetrics {
  const input = readGeneratedInputs(dialogue);
  const byTurn = tokensByTurn(input.tokenIndex.tokens);
  const tokenCounts = input.turnIndex.turns.map((turn) => byTurn.get(turn.turnId)?.length ?? 0);
  const dialogueThreshold = longThreshold(tokenCounts);
  const speakerThresholds = new Map<string, number>();
  for (const speaker of [...new Set(input.turnIndex.turns.map((turn) => turn.speaker))].sort()) {
    const speakerCounts = input.turnIndex.turns
      .filter((turn) => turn.speaker === speaker)
      .map((turn) => byTurn.get(turn.turnId)?.length ?? 0);
    speakerThresholds.set(speaker, longThreshold(speakerCounts));
  }

  const turns = input.turnIndex.turns.map((turn) => {
    const tokenCount = byTurn.get(turn.turnId)?.length ?? 0;
    return {
      turnId: turn.turnId,
      speaker: turn.speaker,
      startMarker: turn.startMarker,
      endMarker: turn.endMarker,
      startChar: turn.startChar,
      endChar: turn.endChar,
      greekCharCount: turn.greekCharCount,
      tokenCount,
      dialogueLongTurn: tokenCount > dialogueThreshold,
      speakerLongTurn: tokenCount > (speakerThresholds.get(turn.speaker) ?? Number.POSITIVE_INFINITY),
    };
  });

  const speakers = [...new Set(turns.map((turn) => turn.speaker))]
    .sort()
    .map((speaker) => {
      const rows = turns.filter((turn) => turn.speaker === speaker);
      const counts = rows.map((turn) => turn.tokenCount);
      return {
        speaker,
        turnCount: rows.length,
        totalTokens: counts.reduce((sum, count) => sum + count, 0),
        medianTokens: median(counts),
        p90Tokens: quantile(counts, 0.9),
        maxTokens: Math.max(...counts),
        longTurns: rows.filter((turn) => turn.speakerLongTurn).length,
      };
    });

  return {
    dialogue,
    turnIndexPath: input.turnPath,
    turnIndexSha256: input.turnSha256,
    tokenIndexPath: input.tokenPath,
    tokenIndexSha256: input.tokenSha256,
    speakers,
    turns,
  };
}

function normalizedFormTokens(form: string) {
  return tokenizeGreekText(form).map((token) => token.normalized);
}

function matchTokenSequences(tokens: TokenRecord[], forms: Array<{ group: string; form: string; normalizedTokens: string[] }>) {
  const matches: Array<{ group: string; form: string; tokens: TokenRecord[] }> = [];
  for (const form of forms) {
    if (form.normalizedTokens.length === 0) continue;
    for (let index = 0; index <= tokens.length - form.normalizedTokens.length; index += 1) {
      const window = tokens.slice(index, index + form.normalizedTokens.length);
      if (window.some((token, offset) => token.normalized !== form.normalizedTokens[offset])) continue;
      matches.push({ group: form.group, form: form.form, tokens: window });
    }
  }

  return matches.sort(
    (a, b) =>
      a.tokens[0]!.startChar - b.tokens[0]!.startChar ||
      a.group.localeCompare(b.group) ||
      a.form.localeCompare(b.form),
  );
}

export function buildAssentMetrics(dialogue: string): AssentMetrics {
  const input = readGeneratedInputs(dialogue);
  const lexicon = readAnchorLexicon();
  const group = lexicon.groups.find((entry) => entry.name === "assent_concession");
  if (!group) {
    throw new Error("Anchor lexicon must include assent_concession for assent metrics.");
  }

  const forms = group.forms.map((form) => ({ group: group.name, form, normalizedTokens: normalizedFormTokens(form) }));
  const matches = matchTokenSequences(input.tokenIndex.tokens, forms);
  const byTurn = tokensByTurn(input.tokenIndex.tokens);
  const matchesByTurn = new Map<string, typeof matches>();
  for (const match of matches) {
    const turnIds = new Set(match.tokens.map((token) => token.turnId));
    if (turnIds.size !== 1) continue;
    const turnId = match.tokens[0]!.turnId;
    matchesByTurn.set(turnId, [...(matchesByTurn.get(turnId) ?? []), match]);
  }

  const turns = input.turnIndex.turns.map((turn) => {
    const turnMatches = matchesByTurn.get(turn.turnId) ?? [];
    const assentTokenIds = [...new Set(turnMatches.flatMap((match) => match.tokens.map((token) => token.tokenId)))];
    const tokenCount = byTurn.get(turn.turnId)?.length ?? 0;
    return {
      turnId: turn.turnId,
      speaker: turn.speaker,
      tokenCount,
      assentOccurrences: turnMatches.length,
      assentTokenCount: assentTokenIds.length,
      assentTokenIds,
      shortAssent: tokenCount <= 4 && turnMatches.length > 0,
    };
  });

  const speakers = [...new Set(turns.map((turn) => turn.speaker))]
    .sort()
    .map((speaker) => {
      const rows = turns.filter((turn) => turn.speaker === speaker);
      return {
        speaker,
        turnCount: rows.length,
        assentOccurrences: rows.reduce((sum, row) => sum + row.assentOccurrences, 0),
        assentTokenCount: rows.reduce((sum, row) => sum + row.assentTokenCount, 0),
        assentTurns: rows.filter((row) => row.assentOccurrences > 0).length,
        shortAssentTurns: rows.filter((row) => row.shortAssent).length,
      };
    });

  const stretches: AssentStretch[] = [];
  for (const speaker of [...new Set(turns.map((turn) => turn.speaker))].sort()) {
    const indexedRows = turns.map((turn, index) => ({ turn, index })).filter((entry) => entry.turn.speaker === speaker && entry.turn.shortAssent);
    let run: typeof indexedRows = [];
    for (const entry of indexedRows) {
      const previous = run.at(-1);
      if (!previous || entry.index - previous.index <= 2) {
        run.push(entry);
      } else {
        if (run.length >= 3) {
          stretches.push({
            stretchId: `assent_${dialogue}_${String(stretches.length + 1).padStart(4, "0")}`,
            speaker,
            startTurnId: run[0]!.turn.turnId,
            endTurnId: run.at(-1)!.turn.turnId,
            turnCount: run.length,
            assentTokenIds: run.flatMap((item) => item.turn.assentTokenIds),
          });
        }
        run = [entry];
      }
    }
    if (run.length >= 3) {
      stretches.push({
        stretchId: `assent_${dialogue}_${String(stretches.length + 1).padStart(4, "0")}`,
        speaker,
        startTurnId: run[0]!.turn.turnId,
        endTurnId: run.at(-1)!.turn.turnId,
        turnCount: run.length,
        assentTokenIds: run.flatMap((item) => item.turn.assentTokenIds),
      });
    }
  }

  return {
    dialogue,
    anchorLexiconPath: lexicon.path,
    anchorLexiconSha256: lexicon.sha256,
    tokenIndexPath: input.tokenPath,
    tokenIndexSha256: input.tokenSha256,
    speakers,
    turns,
    stretches,
  };
}

function readProcedureRegistry() {
  const path = procedureAnchorRegistryPath();
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing procedure anchor registry: ${path}`);
  }
  const content = readFileSync(absolutePath, "utf8");
  const parsed = Bun.TOML.parse(content) as ParsedProcedureRegistry;
  if (!Array.isArray(parsed.groups)) {
    throw new Error("Procedure anchor registry must define [[groups]].");
  }

  const groups: ProcedureRegistryGroup[] = parsed.groups.map((group, index) => {
    if (typeof group.name !== "string" || !/^[a-z0-9_]+$/u.test(group.name)) {
      throw new Error(`Procedure anchor registry group ${index + 1} has an invalid name.`);
    }
    if (!Array.isArray(group.forms) || group.forms.some((form) => typeof form !== "string" || form.length === 0)) {
      throw new Error(`Procedure anchor registry group ${group.name} must have non-empty string forms.`);
    }
    return { name: group.name, forms: group.forms as string[] };
  });

  return { path, sha256: sha256(content), groups };
}

export function buildProcedureMetrics(dialogue: string): ProcedureMetrics {
  const input = readGeneratedInputs(dialogue);
  const registry = readProcedureRegistry();
  const forms = registry.groups.flatMap((group) =>
    group.forms.map((form) => ({ group: group.name, form, normalizedTokens: normalizedFormTokens(form) })),
  );
  const matches = matchTokenSequences(input.tokenIndex.tokens, forms).filter(
    (match) => new Set(match.tokens.map((token) => token.turnId)).size === 1,
  );

  const candidates = matches.map((match, index) => ({
    candidateId: `proc_${dialogue}_${String(index + 1).padStart(4, "0")}`,
    group: match.group,
    form: match.form,
    turnId: match.tokens[0]!.turnId,
    startMarker: match.tokens[0]!.marker,
    endMarker: match.tokens.at(-1)!.marker,
    startChar: match.tokens[0]!.startChar,
    endChar: match.tokens.at(-1)!.endChar,
    tokenIds: match.tokens.map((token) => token.tokenId),
  }));

  return {
    dialogue,
    registryPath: registry.path,
    registrySha256: registry.sha256,
    tokenIndexPath: input.tokenPath,
    tokenIndexSha256: input.tokenSha256,
    candidates,
  };
}

export function formatTurnLengthMetricsToon(metrics: TurnLengthMetrics) {
  const speakerWidth = Math.max("speaker".length, ...metrics.speakers.map((entry) => entry.speaker.length));
  const speakerRows = [
    `  ${pad("speaker", speakerWidth)} | turns | total_tokens | median_tokens | p90_tokens | max_tokens | long_turns`,
    ...metrics.speakers.map(
      (entry) =>
        `  ${pad(entry.speaker, speakerWidth)} | ${entry.turnCount} | ${entry.totalTokens} | ${formatNumber(entry.medianTokens)} | ${formatNumber(entry.p90Tokens)} | ${entry.maxTokens} | ${entry.longTurns}`,
    ),
  ].map((line) => line.trimEnd());

  const turnIdWidth = Math.max("turn_id".length, ...metrics.turns.map((entry) => entry.turnId.length));
  const turnSpeakerWidth = Math.max("speaker".length, ...metrics.turns.map((entry) => entry.speaker.length));
  const startMarkerWidth = Math.max("start_marker".length, ...metrics.turns.map((entry) => entry.startMarker.length));
  const endMarkerWidth = Math.max("end_marker".length, ...metrics.turns.map((entry) => entry.endMarker.length));
  const turnRows = [
    `  ${pad("turn_id", turnIdWidth)} | ${pad("speaker", turnSpeakerWidth)} | ${pad("start_marker", startMarkerWidth)} | ${pad("end_marker", endMarkerWidth)} | start_char | end_char | greek_char_count | token_count | dialogue_long_turn | speaker_long_turn`,
    ...metrics.turns.map(
      (entry) =>
        `  ${pad(entry.turnId, turnIdWidth)} | ${pad(entry.speaker, turnSpeakerWidth)} | ${pad(entry.startMarker, startMarkerWidth)} | ${pad(entry.endMarker, endMarkerWidth)} | ${entry.startChar} | ${entry.endChar} | ${entry.greekCharCount} | ${entry.tokenCount} | ${yesNo(entry.dialogueLongTurn)} | ${yesNo(entry.speakerLongTurn)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${metrics.dialogue}`,
    `turn_index_path: ${metrics.turnIndexPath}`,
    `turn_index_sha256: ${metrics.turnIndexSha256}`,
    `token_index_path: ${metrics.tokenIndexPath}`,
    `token_index_sha256: ${metrics.tokenIndexSha256}`,
    `speakers[${metrics.speakers.length}]:`,
    ...speakerRows,
    `turns[${metrics.turns.length}]:`,
    ...turnRows,
    "",
  ].join("\n");
}

export function formatAssentMetricsToon(metrics: AssentMetrics) {
  const speakerWidth = Math.max("speaker".length, ...metrics.speakers.map((entry) => entry.speaker.length));
  const speakerRows = [
    `  ${pad("speaker", speakerWidth)} | turns | assent_occurrences | assent_token_count | assent_turns | short_assent_turns`,
    ...metrics.speakers.map(
      (entry) =>
        `  ${pad(entry.speaker, speakerWidth)} | ${entry.turnCount} | ${entry.assentOccurrences} | ${entry.assentTokenCount} | ${entry.assentTurns} | ${entry.shortAssentTurns}`,
    ),
  ].map((line) => line.trimEnd());

  const turnIdWidth = Math.max("turn_id".length, ...metrics.turns.map((entry) => entry.turnId.length));
  const turnSpeakerWidth = Math.max("speaker".length, ...metrics.turns.map((entry) => entry.speaker.length));
  const tokenIdsWidth = Math.max("assent_token_ids".length, ...metrics.turns.map((entry) => csv(entry.assentTokenIds).length));
  const turnRows = [
    `  ${pad("turn_id", turnIdWidth)} | ${pad("speaker", turnSpeakerWidth)} | token_count | assent_occurrences | assent_token_count | ${pad("assent_token_ids", tokenIdsWidth)} | short_assent`,
    ...metrics.turns.map(
      (entry) =>
        `  ${pad(entry.turnId, turnIdWidth)} | ${pad(entry.speaker, turnSpeakerWidth)} | ${entry.tokenCount} | ${entry.assentOccurrences} | ${entry.assentTokenCount} | ${pad(csv(entry.assentTokenIds), tokenIdsWidth)} | ${yesNo(entry.shortAssent)}`,
    ),
  ].map((line) => line.trimEnd());

  const stretchIdWidth = Math.max("stretch_id".length, ...metrics.stretches.map((entry) => entry.stretchId.length));
  const stretchSpeakerWidth = Math.max("speaker".length, ...metrics.stretches.map((entry) => entry.speaker.length));
  const stretchTokenIdsWidth = Math.max("assent_token_ids".length, ...metrics.stretches.map((entry) => csv(entry.assentTokenIds).length));
  const stretchRows = [
    `  ${pad("stretch_id", stretchIdWidth)} | ${pad("speaker", stretchSpeakerWidth)} | start_turn_id | end_turn_id | turn_count | ${pad("assent_token_ids", stretchTokenIdsWidth)}`,
    ...metrics.stretches.map(
      (entry) =>
        `  ${pad(entry.stretchId, stretchIdWidth)} | ${pad(entry.speaker, stretchSpeakerWidth)} | ${entry.startTurnId} | ${entry.endTurnId} | ${entry.turnCount} | ${pad(csv(entry.assentTokenIds), stretchTokenIdsWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${metrics.dialogue}`,
    `anchor_lexicon_path: ${metrics.anchorLexiconPath}`,
    `anchor_lexicon_sha256: ${metrics.anchorLexiconSha256}`,
    `token_index_path: ${metrics.tokenIndexPath}`,
    `token_index_sha256: ${metrics.tokenIndexSha256}`,
    `speakers[${metrics.speakers.length}]:`,
    ...speakerRows,
    `turns[${metrics.turns.length}]:`,
    ...turnRows,
    `stretches[${metrics.stretches.length}]:`,
    ...stretchRows,
    "",
  ].join("\n");
}

export function formatProcedureMetricsToon(metrics: ProcedureMetrics) {
  const candidateIdWidth = Math.max("candidate_id".length, ...metrics.candidates.map((entry) => entry.candidateId.length));
  const groupWidth = Math.max("group".length, ...metrics.candidates.map((entry) => entry.group.length));
  const formWidth = Math.max("form".length, ...metrics.candidates.map((entry) => entry.form.length));
  const turnIdWidth = Math.max("turn_id".length, ...metrics.candidates.map((entry) => entry.turnId.length));
  const startMarkerWidth = Math.max("start_marker".length, ...metrics.candidates.map((entry) => entry.startMarker.length));
  const endMarkerWidth = Math.max("end_marker".length, ...metrics.candidates.map((entry) => entry.endMarker.length));
  const tokenIdsWidth = Math.max("token_ids".length, ...metrics.candidates.map((entry) => csv(entry.tokenIds).length));
  const rows = [
    `  ${pad("candidate_id", candidateIdWidth)} | ${pad("group", groupWidth)} | ${pad("form", formWidth)} | ${pad("turn_id", turnIdWidth)} | ${pad("start_marker", startMarkerWidth)} | ${pad("end_marker", endMarkerWidth)} | start_char | end_char | ${pad("token_ids", tokenIdsWidth)}`,
    ...metrics.candidates.map(
      (entry) =>
        `  ${pad(entry.candidateId, candidateIdWidth)} | ${pad(entry.group, groupWidth)} | ${pad(entry.form, formWidth)} | ${pad(entry.turnId, turnIdWidth)} | ${pad(entry.startMarker, startMarkerWidth)} | ${pad(entry.endMarker, endMarkerWidth)} | ${entry.startChar} | ${entry.endChar} | ${pad(csv(entry.tokenIds), tokenIdsWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${metrics.dialogue}`,
    `registry_path: ${metrics.registryPath}`,
    `registry_sha256: ${metrics.registrySha256}`,
    `token_index_path: ${metrics.tokenIndexPath}`,
    `token_index_sha256: ${metrics.tokenIndexSha256}`,
    `candidates[${metrics.candidates.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function writeTurnLengthMetrics(dialogue: string) {
  const metrics = buildTurnLengthMetrics(dialogue);
  const path = turnLengthMetricsPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatTurnLengthMetricsToon(metrics), "utf8");
  return { path, turnCount: metrics.turns.length };
}

export function writeAssentMetrics(dialogue: string) {
  const metrics = buildAssentMetrics(dialogue);
  const path = assentMetricsPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatAssentMetricsToon(metrics), "utf8");
  return { path, turnCount: metrics.turns.length, stretchCount: metrics.stretches.length };
}

export function writeProcedureMetrics(dialogue: string) {
  const metrics = buildProcedureMetrics(dialogue);
  const path = procedureMetricsPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatProcedureMetricsToon(metrics), "utf8");
  return { path, candidateCount: metrics.candidates.length };
}

export function writeDerivedMetrics(dialogue?: string | undefined) {
  const dialogues = dialogue ? [dialogue] : listGreekDialogues();
  return dialogues.map((entry) => ({
    dialogue: entry,
    turnLengths: writeTurnLengthMetrics(entry),
    assent: writeAssentMetrics(entry),
    procedure: writeProcedureMetrics(entry),
  }));
}

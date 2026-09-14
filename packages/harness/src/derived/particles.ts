import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { readMetricInputs } from "./metric-inputs.js";
import { listGreekDialogues } from "./stephanus.js";
import { normalizeGreekToken, type TokenRecord } from "./tokens.js";

export const PARTICLE_FORMS = ["μήν", "τοίνυν", "καίτοι", "γάρ", "οὖν", "δή"] as const;
export type ParticleForm = typeof PARTICLE_FORMS[number];
export type ParticleCounts = Record<ParticleForm, number>;
export type ParticleSummary = { id: string; tokenCount: number; counts: ParticleCounts };
export type ParticleMetrics = {
  dialogue: string;
  sourcePath: string;
  sourceSha256: string;
  tokenIndexPath: string;
  tokenIndexSha256: string;
  turnIndexPath: string;
  turnIndexSha256: string;
  indexedTokenCount: number;
  excludedSiglumTokenCount: number;
  total: ParticleSummary;
  speakers: ParticleSummary[];
  turns: ParticleSummary[];
  markers: ParticleSummary[];
  occurrences: Array<{ particle: ParticleForm; token: TokenRecord }>;
};

const DIRECTORY = "derived/plato/metrics/particles";
const REPORT_PATH = `${DIRECTORY}/report.md`;
const FORMS_BY_NORMALIZED = new Map(PARTICLE_FORMS.map((form) => [normalizeGreekToken(form), form]));

function summary(id: string): ParticleSummary {
  return { id, tokenCount: 0, counts: { μήν: 0, τοίνυν: 0, καίτοι: 0, γάρ: 0, οὖν: 0, δή: 0 } };
}

function count(row: ParticleSummary, particle: ParticleForm | undefined) {
  row.tokenCount += 1;
  if (particle) row.counts[particle] += 1;
}

export function particleMetricsPath(dialogue: string) {
  if (!/^[a-z0-9-]+$/u.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  return `${DIRECTORY}/${dialogue}.toon`;
}

export function buildParticleMetrics(dialogue: string): ParticleMetrics {
  const input = readMetricInputs(dialogue);
  const turns = new Map(input.turnIndex.turns.map((turn) => [turn.turnId, summary(turn.turnId)]));
  const speakers = new Map(input.turnIndex.turns.map((turn) => [turn.speaker, summary(turn.speaker)]));
  const markers = new Map<string, ParticleSummary>();
  const turnRecords = new Map(input.turnIndex.turns.map((turn) => [turn.turnId, turn]));
  const siglumEnds = new Map<string, number>();

  for (const turn of input.turnIndex.turns) {
    if (turn.speaker === "(none)") continue;
    const text = input.source.slice(turn.startChar, turn.endChar);
    const prefix = /^(?:\s|\{[^{}]*\})*/u.exec(text)![0];
    if (!text.startsWith(turn.speaker, prefix.length)) {
      throw new Error(`Cannot locate printed speaker label for ${turn.turnId}.`);
    }
    // The canonical index deliberately includes printed labels. Exclude their
    // full spans here: ΝΕ. ΣΩ. has two tokens and some labels touch speech.
    siglumEnds.set(turn.turnId, turn.startChar + prefix.length + turn.speaker.length);
  }

  const total = summary(dialogue);
  const occurrences: ParticleMetrics["occurrences"] = [];
  let excludedSiglumTokenCount = 0;
  for (const token of input.tokenIndex.tokens) {
    const turn = turnRecords.get(token.turnId);
    if (!turn || token.startChar < turn.startChar || token.endChar > turn.endChar
      || input.source.slice(token.startChar, token.endChar) !== token.surface
      || normalizeGreekToken(token.surface) !== token.normalized) {
      throw new Error(`Invalid source or turn binding for ${token.tokenId}.`);
    }
    if (token.endChar <= (siglumEnds.get(token.turnId) ?? -1)) {
      excludedSiglumTokenCount += 1;
      continue;
    }
    const particle = FORMS_BY_NORMALIZED.get(token.normalized);
    const marker = markers.get(token.marker) ?? summary(token.marker);
    markers.set(token.marker, marker);
    count(total, particle);
    count(turns.get(token.turnId)!, particle);
    count(speakers.get(turn.speaker)!, particle);
    count(marker, particle);
    if (particle) occurrences.push({ particle, token });
  }

  return {
    dialogue,
    sourcePath: input.tokenIndex.sourcePath,
    sourceSha256: input.tokenIndex.sourceSha256,
    tokenIndexPath: input.tokenPath,
    tokenIndexSha256: input.tokenSha256,
    turnIndexPath: input.turnPath,
    turnIndexSha256: input.turnSha256,
    indexedTokenCount: input.tokenIndex.tokens.length,
    excludedSiglumTokenCount,
    total,
    speakers: [...speakers.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    turns: [...turns.values()],
    markers: [...markers.values()],
    occurrences,
  };
}

function formatSummaries(name: string, rows: ParticleSummary[]) {
  return [
    `${name}[${rows.length}]:`,
    `  id | token_count | ${PARTICLE_FORMS.join(" | ")}`,
    ...rows.map((row) => `  ${row.id} | ${row.tokenCount} | ${PARTICLE_FORMS.map((form) => row.counts[form]).join(" | ")}`),
  ];
}

export function formatParticleMetricsToon(metrics: ParticleMetrics) {
  return [
    "schema_version: 1",
    `dialogue: ${metrics.dialogue}`,
    `source_path: ${metrics.sourcePath}`,
    `source_sha256: ${metrics.sourceSha256}`,
    `token_index_path: ${metrics.tokenIndexPath}`,
    `token_index_sha256: ${metrics.tokenIndexSha256}`,
    `turn_index_path: ${metrics.turnIndexPath}`,
    `turn_index_sha256: ${metrics.turnIndexSha256}`,
    "matching: whole_normalized_tokens_without_grammatical_disambiguation",
    "denominator: indexed_greek_tokens_excluding_printed_speaker_labels",
    "speaker_scope: outer_printed_turn_labels",
    `indexed_token_count: ${metrics.indexedTokenCount}`,
    `excluded_siglum_token_count: ${metrics.excludedSiglumTokenCount}`,
    ...formatSummaries("dialogue_totals", [metrics.total]),
    ...formatSummaries("speakers", metrics.speakers),
    ...formatSummaries("turns", metrics.turns),
    ...formatSummaries("markers", metrics.markers),
    `occurrences[${metrics.occurrences.length}]:`,
    "  token_id | form | surface | turn_id | marker | start_char | end_char",
    ...metrics.occurrences.map(({ particle, token }) =>
      `  ${token.tokenId} | ${particle} | ${token.surface} | ${token.turnId} | ${token.marker} | ${token.startChar} | ${token.endChar}`),
    "",
  ].join("\n");
}

function writeArtifact(path: string, content: string) {
  const absolute = join(getRepoRoot(), path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

export function writeParticleMetrics(dialogue: string) {
  const metrics = buildParticleMetrics(dialogue);
  const path = particleMetricsPath(dialogue);
  writeArtifact(path, formatParticleMetricsToon(metrics));
  return { path, occurrenceCount: metrics.occurrences.length, tokenCount: metrics.total.tokenCount };
}

export function buildParticleReport(metrics = listGreekDialogues().map(buildParticleMetrics)) {
  const total = summary("Total");
  for (const entry of metrics) {
    total.tokenCount += entry.total.tokenCount;
    for (const form of PARTICLE_FORMS) total.counts[form] += entry.total.counts[form];
  }
  const rows = [...metrics.map((entry) => entry.total), total];
  return [
    "# Greek particle form census",
    "",
    "Generated by `bun run harness derive metrics`. Counts use whole normalized",
    "Greek tokens for μήν, τοίνυν, καίτοι, γάρ, οὖν, and δή. Normalization folds",
    "case, diacritics, and final sigma using the canonical token index. These are",
    "form matches without grammatical disambiguation, lemmatization, or chronology claims.",
    "",
    "The denominator excludes printed speaker-label tokens, including compound",
    "labels. Speaker rows follow outer printed turns; `(none)` retains unattributed",
    "or narrated text and does not reconstruct embedded speakers. Passage rows",
    "group tokens by their starting Stephanus marker. Token IDs, original forms,",
    "offsets, and source/index hashes are recorded in each dialogue's TOON file.",
    "",
    `Scope: ${metrics.length} dialogues; ${metrics.reduce((sum, entry) => sum + entry.occurrences.length, 0)} matches; ${total.tokenCount} denominator tokens; ${metrics.reduce((sum, entry) => sum + entry.excludedSiglumTokenCount, 0)} excluded speaker-label tokens.`,
    "",
    `| Dialogue | Tokens | ${PARTICLE_FORMS.join(" | ")} |`,
    `| --- | ---: | ${PARTICLE_FORMS.map(() => "---:").join(" | ")} |`,
    ...rows.map((row) => `| ${row.id === "Total" ? "**Total**" : `[${row.id}](${row.id}.toon)`} | ${row.tokenCount} | ${PARTICLE_FORMS.map((form) => row.counts[form]).join(" | ")} |`),
    "",
    "## Matches per 1,000 denominator tokens",
    "",
    `| Dialogue | ${PARTICLE_FORMS.join(" | ")} |`,
    `| --- | ${PARTICLE_FORMS.map(() => "---:").join(" | ")} |`,
    ...rows.map((row) => `| ${row.id} | ${PARTICLE_FORMS.map((form) => row.tokenCount === 0 ? "0.000" : (row.counts[form] * 1000 / row.tokenCount).toFixed(3)).join(" | ")} |`),
    "",
  ].join("\n");
}

export function writeParticleReport() {
  writeArtifact(REPORT_PATH, buildParticleReport());
}

export function validateParticleMetricsArtifacts() {
  const failures: string[] = [];
  const dialogues = listGreekDialogues();
  const expectedNames = new Set([...dialogues.map((dialogue) => `${dialogue}.toon`), "report.md"]);
  const directory = join(getRepoRoot(), DIRECTORY);
  if (existsSync(directory)) {
    for (const name of readdirSync(directory)) {
      if (!expectedNames.has(name)) failures.push(`${DIRECTORY}/${name}: unexpected particle artifact`);
    }
  }
  function verify(path: string, expected: () => string) {
    try {
      const absolute = join(getRepoRoot(), path);
      if (!existsSync(absolute)) failures.push(`${path}: missing particle artifact; run bun run harness derive metrics`);
      else if (readFileSync(absolute, "utf8") !== expected()) failures.push(`${path}: stale or altered particle artifact; run bun run harness derive metrics`);
    } catch (error) {
      failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const metrics: ParticleMetrics[] = [];
  for (const dialogue of dialogues) {
    verify(particleMetricsPath(dialogue), () => {
      const entry = buildParticleMetrics(dialogue);
      metrics.push(entry);
      return formatParticleMetricsToon(entry);
    });
  }
  if (metrics.length === dialogues.length) verify(REPORT_PATH, () => buildParticleReport(metrics));
  return failures;
}

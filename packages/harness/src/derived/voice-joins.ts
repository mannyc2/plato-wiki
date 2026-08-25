import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue, nestedFieldValueInParent, observationYamlBlocks } from "../wiki/observation-ledger.js";
import { buildClaimSupport, type ClaimSupport } from "./claim-support.js";
import { activeVoiceCutoverSlugs, isVoiceCutoverActive, voiceCutoverRegistryPath } from "./voice-cutovers.js";
import { parseTurnIndexToon, type TurnRecord, turnIndexPath } from "./turns.js";
import { readVoiceIndex, readVoiceIndexSha256, type VoiceIndex, type VoiceIndexRecord } from "./voices.js";

/**
 * Why a record does or does not have a licensed owner.
 *
 * - `resolved`        every cited range lands on one resolved voice.
 * - `turn_level`      the outer turn carries no voice records; the printed turn
 *                     siglum is the owner.
 * - `cross_voice`     cited ranges land on more than one terminal voice.
 * - `unresolved_span` the covering span exists but licenses no owner.
 * - `needs_anchor`    a term is missing, no terms exist for a cross-voice
 *                     window, or choosing among repeated-term occurrences
 *                     changes the attribution outcome. This is a request for
 *                     better anchoring, NOT a judgment that the claim is
 *                     cross-voice.
 * - `no_coverage`     a cited range falls outside every span in a voiced turn.
 */
export type VoiceAttributionStatus =
  | "resolved"
  | "turn_level"
  | "cross_voice"
  | "unresolved_span"
  | "needs_anchor"
  | "no_coverage";

export type VoiceJoinRow = {
  recordId: string;
  recordKind: "observation" | "claim";
  reviewStatus: string;
  outerTurnSpeaker: string;
  owner: string;
  ownerChain: string[];
  status: VoiceAttributionStatus;
  attributed: boolean;
  /** Terms with exactly one byte-verified occurrence in the claim window. */
  supportUniqueRanges: number;
  /** Total occurrence ranges enumerated for terms that occur more than once. */
  supportCandidateRanges: number;
  /** Possible Cartesian occurrence selections; zero when no term is ambiguous. */
  supportCandidateChoices: number;
  evidence: string;
  /** Resolved voices that participate as owner or stance actor. */
  trajectory: string[];
  /**
   * False when the owner or any stance actor resolved to no voice.
   *
   * Without this an all-unresolved claim rendered as `(single)` — the column
   * said "one voice throughout" about a record where not one voice was
   * identified. `(single)` is now reserved for a trajectory that is genuinely
   * complete AND genuinely one voice.
   */
  trajectoryComplete: boolean;
};

export type StanceVoiceRow = {
  claimId: string;
  eventIndex: number;
  eventKind: string;
  actor: string;
  actorChain: string[];
  status: VoiceAttributionStatus;
  evidence: string;
};

export type VoiceJoinIndex = {
  dialogue: string;
  observationLedgerPath: string;
  observationLedgerSha256: string;
  claimLedgerPath: string;
  claimLedgerSha256: string;
  voiceIndexPath: string;
  voiceIndexSha256: string;
  rows: VoiceJoinRow[];
  stanceRows: StanceVoiceRow[];
};

export type WrittenVoiceJoin = {
  dialogue: string;
  path: string;
  rowCount: number;
  stanceRowCount: number;
};

type CitedRange = { startChar: number; endChar: number };

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

/**
 * Voice joins live one directory down from the observation-turn joins on purpose:
 * `packages/harness/src/site/data.ts` scans `derived/plato/joins/*.toon`
 * indiscriminately and parses every file as an observation-turn join. A sibling
 * file would break the site build; a subdirectory is skipped by its isFile()
 * filter.
 */
export function voiceJoinPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/joins/voices/${dialogue}.toon`;
}

type TerminalSegment = { startChar: number; endChar: number; record: VoiceIndexRecord };

function buildTerminalSegments(index: VoiceIndex): TerminalSegment[] {
  const boundaries = new Set<number>();
  for (const record of index.records) {
    boundaries.add(record.startChar);
    boundaries.add(record.endChar);
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const segments: TerminalSegment[] = [];
  for (let position = 0; position < points.length - 1; position += 1) {
    const startChar = points[position]!;
    const endChar = points[position + 1]!;
    let best: VoiceIndexRecord | undefined;
    for (const record of index.records) {
      if (record.startChar <= startChar && endChar <= record.endChar && (!best || record.depth > best.depth)) {
        best = record;
      }
    }
    if (!best) continue;
    const previous = segments.at(-1);
    if (previous && previous.endChar === startChar && previous.record.voiceId === best.voiceId) {
      previous.endChar = endChar;
      continue;
    }
    segments.push({ startChar, endChar, record: best });
  }
  return segments;
}

/**
 * Terminal voices over a set of ranges, grouped by OWNER rather than by record.
 *
 * Two ranges landing in two different spans of the same voice are not a
 * cross-voice record — that is the ordinary shape of a claim resting on two
 * utterances by one speaker with an interlocutor's question between them
 * (claim_symposium_0106). Grouping by record id instead of by chain reported
 * those as cross-voice, which is exactly the over-rejection this lane must not
 * do. Unresolved spans group separately from resolved ones even when their
 * chains match, since an unresolved span names no owner.
 */
function terminalVoicesOver(segments: TerminalSegment[], ranges: CitedRange[]) {
  const found = new Map<string, VoiceIndexRecord>();
  const voiceIds = new Set<string>();
  let hasGap = false;
  for (const range of ranges) {
    let covered = 0;
    for (const segment of segments) {
      const start = Math.max(segment.startChar, range.startChar);
      const end = Math.min(segment.endChar, range.endChar);
      if (start >= end) continue;
      const key = `${segment.record.resolution}:${segment.record.voiceChain.join(">")}`;
      if (!found.has(key)) found.set(key, segment.record);
      voiceIds.add(segment.record.voiceId);
      covered += end - start;
    }
    if (covered < range.endChar - range.startChar) hasGap = true;
  }
  return { records: [...found.values()], hasGap, voiceIds: [...voiceIds] };
}

/** Longest chain shared by every terminal a set of ranges touches. */
function commonChainPrefix(chains: string[][]) {
  if (chains.length === 0) return [];
  const prefix: string[] = [];
  const shortest = Math.min(...chains.map((chain) => chain.length));
  for (let position = 0; position < shortest; position += 1) {
    const candidate = chains[0]![position]!;
    if (!chains.every((chain) => chain[position] === candidate)) break;
    prefix.push(candidate);
  }
  return prefix;
}

type Resolution = { owner: string; chain: string[]; status: VoiceAttributionStatus; evidence: string };

/** Resolve a set of exact ranges to a single owner, or say precisely why not. */
function resolveRanges(segments: TerminalSegment[], ranges: CitedRange[]): Resolution {
  const { records, hasGap, voiceIds } = terminalVoicesOver(segments, ranges);
  if (hasGap) {
    return {
      owner: "(unattributed)",
      chain: [],
      status: "no_coverage",
      evidence: "range outside every voice span",
    };
  }
  if (records.length === 0) {
    return { owner: "(unattributed)", chain: [], status: "no_coverage", evidence: "no covering span" };
  }
  if (records.length > 1) {
    return {
      owner: "(unattributed)",
      chain: commonChainPrefix(records.map((record) => record.voiceChain)),
      status: "cross_voice",
      evidence: voiceIds.join(","),
    };
  }
  const only = records[0]!;
  if (only.resolution !== "resolved") {
    return {
      owner: "(unattributed)",
      chain: only.voiceChain,
      status: "unresolved_span",
      evidence: only.voiceId,
    };
  }
  return {
    owner: only.voiceChain.at(-1) ?? "(unattributed)",
    chain: only.voiceChain,
    status: "resolved",
    evidence: voiceIds.join(","),
  };
}

function turnsOver(turns: TurnRecord[], ranges: CitedRange[]) {
  const seen = new Map<string, TurnRecord>();
  for (const range of ranges) {
    for (const turn of turns) {
      if (range.startChar < turn.endChar && turn.startChar < range.endChar) seen.set(turn.turnId, turn);
    }
  }
  return [...seen.values()];
}

function uniqueInOrder(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

/**
 * The authoritative join reads the STORED voice index — it never recompiles
 * authority from the ledger on the fly.
 *
 * Rebuilding here made the derived artifact decorative: an operator could edit
 * `wiki/voices/<dialogue>.md` and the join (and the migration behind it) would
 * silently follow, with no accepted cohort ever committed. `readVoiceIndex`
 * loads the artifact and proves it is non-empty, unstale, unforged, and not
 * orphaned before a single claim is attributed from it.
 */
export function buildVoiceJoin(dialogue: string): VoiceJoinIndex {
  return buildVoiceJoinFromIndex(dialogue, readVoiceIndex(dialogue), readVoiceIndexSha256(dialogue));
}

/**
 * The join itself, over whichever index it is handed. `buildVoiceJoin` supplies
 * the stored authoritative index; the review preview supplies an as-if-accepted
 * one so the same geometry answers both questions.
 *
 * `voiceIndexSha256` is passed in rather than derived here. The join used to
 * fall back to hashing its own in-memory index when no file existed on disk,
 * which let a preview-shaped join write provenance indistinguishable from an
 * authoritative one.
 */
export function buildVoiceJoinFromIndex(
  dialogue: string,
  voiceIndex: VoiceIndex,
  voiceIndexSha256: string,
): VoiceJoinIndex {
  assertDialogueSlug(dialogue);
  const repoRoot = getRepoRoot();
  const turnContent = readFileSync(join(repoRoot, turnIndexPath(dialogue)), "utf8");
  const turnIndex = parseTurnIndexToon(turnContent);
  const segments = buildTerminalSegments(voiceIndex);

  // A turn is "voiced" if the compiled INDEX carries a record for it. The index
  // is the accepted artifact; the ledger is a working file that may hold
  // unreviewed spans, and reading it here made the join's answer depend on
  // uncommitted review state rather than on authority.
  //
  // This is safe precisely because `collectAcceptedProjectionFailures` refuses
  // to emit an index while any turn the ledger speaks about lacks an accepted
  // tiling — so on the authoritative path the two sets are equal by
  // construction. Where they can differ is a preview over a partial index, and
  // there the index is the only thing the caller actually handed us.
  const turnsWithVoices = new Set(voiceIndex.records.map((record) => record.outerTurnId));

  const observationRelative = `wiki/observations/${dialogue}.md`;
  const observationContent = readFileSync(join(repoRoot, observationRelative), "utf8");
  const claimRelative = `wiki/claims/${dialogue}.md`;
  const claimContent = existsSync(join(repoRoot, claimRelative))
    ? readFileSync(join(repoRoot, claimRelative), "utf8")
    : "";

  const rows: VoiceJoinRow[] = [];
  const stanceRows: StanceVoiceRow[] = [];

  /** Records in turns that carry no voice records keep their printed turn siglum. */
  function turnLevel(ranges: CitedRange[]): Resolution | undefined {
    const overlapping = turnsOver(turnIndex.turns, ranges);
    if (overlapping.some((turn) => turnsWithVoices.has(turn.turnId))) return undefined;
    if (overlapping.length === 1) {
      const speaker = overlapping[0]!.speaker;
      return { owner: speaker, chain: [speaker], status: "turn_level", evidence: overlapping[0]!.turnId };
    }
    return {
      owner: "(unattributed)",
      chain: [],
      status: "cross_voice",
      evidence: overlapping.map((turn) => turn.turnId).join(","),
    };
  }

  // --- Observations: span records, joined on their cited span. ---------------
  // An observation describes a stretch of text, so a broad span that genuinely
  // covers several voices is correctly cross_voice — that is a true fact about
  // the observation, not a defect to anchor away.
  for (const block of observationYamlBlocks(observationContent)) {
    const recordId = fieldValue(block, "observation_id");
    if (!recordId) continue;
    const startChar = Number(nestedFieldValueInParent(block, "source_ref", "start_char"));
    const endChar = Number(nestedFieldValueInParent(block, "source_ref", "end_char"));
    if (!Number.isInteger(startChar) || !Number.isInteger(endChar) || endChar <= startChar) continue;
    const ranges = [{ startChar, endChar }];
    const resolution = turnLevel(ranges) ?? resolveRanges(segments, ranges);
    const outerTurnSpeaker =
      uniqueInOrder(turnsOver(turnIndex.turns, ranges).map((turn) => turn.speaker)).join(",") || "(none)";
    rows.push({
      recordId,
      recordKind: "observation",
      reviewStatus: fieldValue(block, "review_status") ?? "unreviewed",
      outerTurnSpeaker,
      owner: resolution.owner,
      ownerChain: resolution.chain,
      status: resolution.status,
      attributed: resolution.status === "resolved" || resolution.status === "turn_level",
      supportUniqueRanges: 0,
      supportCandidateRanges: 0,
      supportCandidateChoices: 0,
      evidence: resolution.evidence,
      trajectory: resolution.owner === "(unattributed)" ? [] : [resolution.owner],
      trajectoryComplete: resolution.owner !== "(unattributed)",
    });
  }

  // --- Claims: owner from exact support ranges; actors joined separately. ----
  const supports = claimContent.length > 0 ? buildClaimSupport(dialogue) : [];
  for (const support of supports) {
    const contextRange = [{ startChar: support.contextStartChar, endChar: support.contextEndChar }];
    const outerTurnSpeaker =
      uniqueInOrder(turnsOver(turnIndex.turns, contextRange).map((turn) => turn.speaker)).join(",") || "(none)";

    const ownerResolution = resolveClaimOwner(segments, support, turnLevel);

    // Every stance event resolves on its own. A claim asserted by Diotima and
    // later challenged by Socrates has two actors and one owner; folding them
    // together would make the claim look cross-voice when it is not.
    const actors: string[] = [];
    for (const event of support.stanceEvents) {
      const eventRanges = [{ startChar: event.startChar, endChar: event.endChar }];
      const eventResolution = turnLevel(eventRanges) ?? resolveRanges(segments, eventRanges);
      actors.push(eventResolution.owner);
      stanceRows.push({
        claimId: support.claimId,
        eventIndex: event.index,
        eventKind: event.kind,
        actor: eventResolution.owner,
        actorChain: eventResolution.chain,
        status: eventResolution.status,
        evidence: eventResolution.evidence,
      });
    }

    const everyone = [ownerResolution.owner, ...actors];
    const participating = uniqueInOrder(everyone).filter((voice) => voice !== "(unattributed)");

    rows.push({
      recordId: support.claimId,
      recordKind: "claim",
      reviewStatus: support.reviewStatus,
      outerTurnSpeaker,
      owner: ownerResolution.owner,
      ownerChain: ownerResolution.chain,
      status: ownerResolution.status,
      attributed: ownerResolution.status === "resolved" || ownerResolution.status === "turn_level",
      supportUniqueRanges: support.ranges.length,
      supportCandidateRanges: support.candidates.reduce(
        (total, candidate) => total + candidate.occurrences.length,
        0,
      ),
      supportCandidateChoices:
        support.candidates.length === 0
          ? 0
          : support.candidates.reduce((total, candidate) => total * candidate.occurrences.length, 1),
      evidence: ownerResolution.evidence,
      trajectory: participating,
      trajectoryComplete: everyone.every((voice) => voice !== "(unattributed)"),
    });
  }

  rows.sort((a, b) => a.recordId.localeCompare(b.recordId));
  stanceRows.sort((a, b) => a.claimId.localeCompare(b.claimId) || a.eventIndex - b.eventIndex);

  return {
    dialogue,
    observationLedgerPath: observationRelative,
    observationLedgerSha256: sha256(observationContent),
    claimLedgerPath: claimRelative,
    claimLedgerSha256: sha256(claimContent),
    voiceIndexPath: `derived/plato/voices/${dialogue}.toon`,
    voiceIndexSha256,
    rows,
    stanceRows,
  };
}

/**
 * A claim's owner comes from its exact support ranges, never from its context
 * window. A window that crosses voices is NOT grounds for cross_voice when the
 * support ranges all land on one owner — that is the whole point of anchoring.
 */
function resolveClaimOwner(
  segments: TerminalSegment[],
  support: ClaimSupport,
  turnLevel: (ranges: CitedRange[]) => Resolution | undefined,
): Resolution {
  const contextRange = [{ startChar: support.contextStartChar, endChar: support.contextEndChar }];
  const atTurnLevel = turnLevel(contextRange);
  if (atTurnLevel) return atTurnLevel;

  // A context window that already sits inside a single voice needs no anchoring:
  // every word of it, quoted or not, belongs to that owner. Anchoring exists to
  // rescue windows that cross voices, not to add a hurdle where none exists.
  const windowResolution = resolveRanges(segments, contextRange);
  if (windowResolution.status === "resolved") {
    return { ...windowResolution, evidence: `${windowResolution.evidence} (single-voiced context window)` };
  }

  const gapDetail = () => support.anchorGaps.map((gap) => `${JSON.stringify(gap.term)} missing`).join("; ");

  // A term absent from its own window is unverifiable evidence. Fail closed
  // regardless of what the located terms say: the missing term could sit in the
  // other voice, and treating its silence as assent is exactly the guess this
  // lane forbids.
  if (support.anchorGaps.length > 0) {
    return {
      owner: "(unattributed)",
      chain: windowResolution.chain,
      status: "needs_anchor",
      evidence: `${support.anchorGaps.length} of ${support.terms.length} term(s) absent from a cross-voice window: ${gapDetail()}`,
    };
  }

  if (support.ranges.length === 0 && support.candidates.length === 0) {
    return {
      owner: "(unattributed)",
      chain: windowResolution.chain,
      status: "needs_anchor",
      evidence: "context window crosses voices and the claim has no greek_terms to anchor",
    };
  }

  if (support.candidates.length === 0) return resolveRanges(segments, support.ranges);

  // An ambiguous term contributes ONE occurrence to an interpretation of the
  // claim's evidence. Evaluate the Cartesian product: one occurrence from each
  // ambiguous term, plus every unique term. Collapsing every occurrence into a
  // single range set was subtly wrong. It turned an invariant cross_voice or
  // unresolved_span result into needs_anchor merely because a term repeated,
  // even when no possible choice could change that result.
  let selections: CitedRange[][] = [[]];
  for (const candidate of support.candidates) {
    selections = selections.flatMap((selection) =>
      candidate.occurrences.map((occurrence) => [
        ...selection,
        { startChar: occurrence.startChar, endChar: occurrence.endChar },
      ]),
    );
  }

  const outcomes = selections.map((selection) => resolveRanges(segments, [...support.ranges, ...selection]));
  const grouped = new Map<string, { resolution: Resolution; count: number; evidence: Set<string> }>();
  for (const outcome of outcomes) {
    const key = JSON.stringify([outcome.status, outcome.owner, outcome.chain]);
    const group = grouped.get(key) ?? { resolution: outcome, count: 0, evidence: new Set<string>() };
    group.count += 1;
    if (outcome.evidence) group.evidence.add(outcome.evidence);
    grouped.set(key, group);
  }

  const candidateDetail = support.candidates
    .map((candidate) => `${JSON.stringify(candidate.term)} x${candidate.occurrences.length}`)
    .join("; ");
  if (grouped.size === 1) {
    const invariant = [...grouped.values()][0]!;
    const evidence = [...invariant.evidence].join(",");
    return {
      ...invariant.resolution,
      evidence:
        `${candidateDetail}; all ${selections.length} occurrence choice(s) yield ` +
        `${invariant.resolution.status}:${invariant.resolution.owner}` +
        (evidence ? ` (${evidence})` : ""),
    };
  }

  const outcomeDetail = [...grouped.values()]
    .map(({ resolution, count }) => `${count}x ${resolution.status}:${resolution.owner}`)
    .join("; ");
  return {
    owner: "(unattributed)",
    chain: commonChainPrefix(outcomes.map((outcome) => outcome.chain)),
    status: "needs_anchor",
    evidence:
      `${candidateDetail}; ${selections.length} occurrence choice(s) produce different outcomes: ${outcomeDetail}`,
  };
}

const JOIN_COLUMNS = [
  "record_id",
  "record_kind",
  "review_status",
  "outer_turn_speaker",
  "owner",
  "owner_chain",
  "status",
  "attributed",
  "support_unique_ranges",
  "support_candidate_ranges",
  "support_candidate_choices",
  "evidence",
  "trajectory",
] as const;

const STANCE_COLUMNS = ["claim_id", "event_index", "event_kind", "actor", "actor_chain", "status", "evidence"] as const;

/** Marker for a participant the join could not resolve to any voice. */
export const TRAJECTORY_UNRESOLVED = "(unresolved)";

/**
 * `(single)` is an assertion that one voice owns the record and speaks every
 * stance event on it. It is therefore only legal when nothing was left
 * unresolved. An unresolved or cross-voice record renders its known
 * participants followed by `(unresolved)`, or just `(unresolved)` when none is
 * known — never `(single)`, which previously reported "one voice throughout"
 * about records where no voice had been identified at all.
 */
export function formatTrajectory(row: Pick<VoiceJoinRow, "trajectory" | "trajectoryComplete">) {
  const parts = [...row.trajectory];
  if (!row.trajectoryComplete) parts.push(TRAJECTORY_UNRESOLVED);
  if (parts.length === 0) return TRAJECTORY_UNRESOLVED;
  if (parts.length === 1 && row.trajectoryComplete) return "(single)";
  return parts.join(">");
}

function joinCells(row: VoiceJoinRow) {
  return [
    row.recordId,
    row.recordKind,
    row.reviewStatus,
    row.outerTurnSpeaker,
    row.owner,
    row.ownerChain.join(">"),
    row.status,
    String(row.attributed),
    String(row.supportUniqueRanges),
    String(row.supportCandidateRanges),
    String(row.supportCandidateChoices),
    row.evidence,
    formatTrajectory(row),
  ];
}

function stanceCells(row: StanceVoiceRow) {
  return [
    row.claimId,
    String(row.eventIndex),
    row.eventKind,
    row.actor,
    row.actorChain.join(">"),
    row.status,
    row.evidence,
  ];
}

function table(columns: readonly string[], cells: string[][]) {
  const widths = columns.map((column, position) =>
    Math.max(column.length, ...cells.map((row) => row[position]!.length)),
  );
  return [
    `  ${columns.map((column, position) => pad(column, widths[position]!)).join(" | ")}`,
    ...cells.map((row) => `  ${row.map((cell, position) => pad(cell, widths[position]!)).join(" | ")}`),
  ].map((line) => line.trimEnd());
}

export function formatVoiceJoinToon(index: VoiceJoinIndex) {
  return [
    `dialogue: ${index.dialogue}`,
    `observation_ledger_path: ${index.observationLedgerPath}`,
    `observation_ledger_sha256: ${index.observationLedgerSha256}`,
    `claim_ledger_path: ${index.claimLedgerPath}`,
    `claim_ledger_sha256: ${index.claimLedgerSha256}`,
    `voice_index_path: ${index.voiceIndexPath}`,
    `voice_index_sha256: ${index.voiceIndexSha256}`,
    `voice_joins[${index.rows.length}]:`,
    ...table(JOIN_COLUMNS, index.rows.map((row) => joinCells(row))),
    `stance_voices[${index.stanceRows.length}]:`,
    ...table(STANCE_COLUMNS, index.stanceRows.map((row) => stanceCells(row))),
    "",
  ].join("\n");
}

export function parseVoiceJoinToon(content: string): VoiceJoinIndex {
  const lines = content.trimEnd().split(/\r?\n/u);
  const header = (pattern: RegExp, line: number) => pattern.exec(lines[line] ?? "")?.[1];
  const dialogue = header(/^dialogue:\s+([a-z0-9-]+)$/u, 0);
  const observationLedgerPath = header(/^observation_ledger_path:\s+(wiki\/observations\/[a-z0-9-]+\.md)$/u, 1);
  const observationLedgerSha256 = header(/^observation_ledger_sha256:\s+([a-f0-9]{64})$/u, 2);
  const claimLedgerPath = header(/^claim_ledger_path:\s+(wiki\/claims\/[a-z0-9-]+\.md)$/u, 3);
  const claimLedgerSha256 = header(/^claim_ledger_sha256:\s+([a-f0-9]{64})$/u, 4);
  const voiceIndexPathValue = header(/^voice_index_path:\s+(derived\/plato\/voices\/[a-z0-9-]+\.toon)$/u, 5);
  const voiceIndexSha256 = header(/^voice_index_sha256:\s+([a-f0-9]{64})$/u, 6);
  const rowCount = header(/^voice_joins\[(\d+)\]:$/u, 7);
  if (
    !dialogue ||
    !observationLedgerPath ||
    !observationLedgerSha256 ||
    !claimLedgerPath ||
    !claimLedgerSha256 ||
    !voiceIndexPathValue ||
    !voiceIndexSha256 ||
    rowCount === undefined ||
    lines[8]?.split("|").map((column) => column.trim()).join(" | ") !== JOIN_COLUMNS.join(" | ")
  ) {
    throw new Error("Malformed voice join header.");
  }

  const joinStart = 9;
  const joinEnd = joinStart + Number(rowCount);
  const rows = lines.slice(joinStart, joinEnd).map((line): VoiceJoinRow => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== JOIN_COLUMNS.length) throw new Error(`Malformed voice join row: ${line}`);
    const [
      recordId,
      recordKind,
      reviewStatus,
      outerTurnSpeaker,
      owner,
      chainRaw,
      status,
      attributedRaw,
      uniqueRangesRaw,
      candidateRangesRaw,
      candidateChoicesRaw,
      evidence,
      trajectoryRaw,
    ] = columns;
    const attributed = attributedRaw === "true" ? true : attributedRaw === "false" ? false : undefined;
    const supportUniqueRanges = Number(uniqueRangesRaw);
    const supportCandidateRanges = Number(candidateRangesRaw);
    const supportCandidateChoices = Number(candidateChoicesRaw);
    if (
      !recordId ||
      (recordKind !== "observation" && recordKind !== "claim") ||
      !reviewStatus ||
      !owner ||
      attributed === undefined ||
      !status ||
      !Number.isInteger(supportUniqueRanges) ||
      supportUniqueRanges < 0 ||
      !Number.isInteger(supportCandidateRanges) ||
      supportCandidateRanges < 0 ||
      !Number.isInteger(supportCandidateChoices) ||
      supportCandidateChoices < 0
    ) {
      throw new Error(`Malformed voice join row values: ${line}`);
    }
    return {
      recordId,
      recordKind,
      reviewStatus,
      outerTurnSpeaker: outerTurnSpeaker ?? "",
      owner,
      ownerChain: chainRaw?.split(">").filter(Boolean) ?? [],
      status: status as VoiceAttributionStatus,
      attributed,
      supportUniqueRanges,
      supportCandidateRanges,
      supportCandidateChoices,
      evidence: evidence ?? "",
      trajectory:
        trajectoryRaw === "(single)"
          ? [owner]
          : (trajectoryRaw?.split(">").filter((part) => part && part !== TRAJECTORY_UNRESOLVED) ?? []),
      trajectoryComplete: trajectoryRaw === "(single)" || !trajectoryRaw?.includes(TRAJECTORY_UNRESOLVED),
    };
  });

  const stanceCountRaw = /^stance_voices\[(\d+)\]:$/u.exec(lines[joinEnd] ?? "")?.[1];
  if (
    stanceCountRaw === undefined ||
    lines[joinEnd + 1]?.split("|").map((column) => column.trim()).join(" | ") !== STANCE_COLUMNS.join(" | ")
  ) {
    throw new Error("Malformed stance-voice header.");
  }
  const stanceStart = joinEnd + 2;
  const stanceRows = lines.slice(stanceStart, stanceStart + Number(stanceCountRaw)).map((line): StanceVoiceRow => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== STANCE_COLUMNS.length) throw new Error(`Malformed stance-voice row: ${line}`);
    const [claimId, indexRaw, eventKind, actor, chainRaw, status, evidence] = columns;
    if (!claimId || !actor || !status) throw new Error(`Malformed stance-voice row values: ${line}`);
    return {
      claimId,
      eventIndex: Number(indexRaw),
      eventKind: eventKind ?? "",
      actor,
      actorChain: chainRaw?.split(">").filter(Boolean) ?? [],
      status: status as VoiceAttributionStatus,
      evidence: evidence ?? "",
    };
  });

  if (rows.length !== Number(rowCount)) {
    throw new Error(`Voice join count mismatch: expected ${rowCount}, found ${rows.length}`);
  }
  if (stanceRows.length !== Number(stanceCountRaw)) {
    throw new Error(`Stance-voice count mismatch: expected ${stanceCountRaw}, found ${stanceRows.length}`);
  }

  return {
    dialogue,
    observationLedgerPath,
    observationLedgerSha256,
    claimLedgerPath,
    claimLedgerSha256,
    voiceIndexPath: voiceIndexPathValue,
    voiceIndexSha256,
    rows,
    stanceRows,
  };
}

/**
 * Materialize the authoritative join — the artifact that carries reported-turn
 * ownership into claim attribution.
 *
 * Writing one is the consumer step, so it requires an explicit activation entry
 * (the voice activation contract). A dialogue may hold an accepted, compiled, fully validated voice
 * index and still have no stored join at all; that is the ordinary state of
 * standalone reported-turn data.
 */
export function writeVoiceJoin(dialogue: string): WrittenVoiceJoin {
  assertDialogueSlug(dialogue);
  if (!isVoiceCutoverActive(dialogue)) {
    throw new Error(
      `Refusing to write a voice join for "${dialogue}": it is not activated in ${voiceCutoverRegistryPath()}. ` +
        "A stored join carries reported-turn ownership into claim attribution, which is a separate, reviewed " +
        `decision from accepting the data. Add an entry citing its review note to ${voiceCutoverRegistryPath()} ` +
        "in the same commit as the migrated claim speakers, or leave the dialogue's reported turns standalone.",
    );
  }
  const index = buildVoiceJoin(dialogue);
  const path = voiceJoinPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatVoiceJoinToon(index), "utf8");
  return { dialogue, path, rowCount: index.rows.length, stanceRowCount: index.stanceRows.length };
}

/**
 * The all-dialogues form enumerates ACTIVE registry entries, not every ledger.
 * Iterating ledgers would re-create the coupling from the other end: accepting
 * a dialogue's reported turns would silently enlist it in the next bulk write.
 */
export function writeVoiceJoins(dialogue?: string | undefined) {
  return (dialogue ? [dialogue] : activeVoiceCutoverSlugs()).map((entry) => writeVoiceJoin(entry));
}

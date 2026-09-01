import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { listVoicesLedgerPaths, parseVoiceLedger, type VoiceRecord } from "../wiki/voices-ledger.js";
import { formatVoicesLedgerValidationError, validateVoicesLedger } from "../wiki/voices-validator.js";
import { listGreekDialogues } from "./stephanus.js";
import { parseTurnIndexToon, semanticTurnStartChar, type TurnIndex, turnIndexPath } from "./turns.js";

export type VoiceIndexRecord = {
  voiceId: string;
  outerTurnId: string;
  startChar: number;
  endChar: number;
  depth: number;
  voiceChain: string[];
  resolution: string;
  evidenceKinds: string[];
  evidenceCount: number;
  /**
   * `reviewed_discourse` when the ledger record resolved by adjudication rather
   * than by cited bytes; absent otherwise (the Phaedo discourse attribution review).
   *
   * A reviewed resolution must not compile to a bare `resolved` row with zero
   * evidence — that would be indistinguishable from a bug, and a consumer could
   * not tell an adjudicated owner from a formula-licensed one. Keeping the
   * distinction in the derived layer is what lets later work audit how much of
   * the corpus rests on judgment.
   */
  resolutionBasis?: "reviewed_discourse";
};

export type VoiceIndex = {
  dialogue: string;
  ledgerPath: string;
  ledgerSha256: string;
  sourcePath: string;
  sourceSha256: string;
  turnIndexPath: string;
  turnIndexSha256: string;
  records: VoiceIndexRecord[];
};

export type WrittenVoiceIndex = {
  dialogue: string;
  path: string;
  recordCount: number;
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

export function voicesLedgerPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `wiki/voices/${dialogue}.md`;
}

export function voiceIndexPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/voices/${dialogue}.toon`;
}

/**
 * Only accepted records compile. An unreviewed or rejected voice record has no
 * authority over any claim's speaker, so the derived layer must not see it —
 * this is what keeps the migration fail-closed before operator review.
 */
export function isCompilableVoiceRecord(record: VoiceRecord) {
  return record.reviewStatus === "accepted";
}

function usable(record: VoiceRecord) {
  return (
    Number.isInteger(record.startChar) && Number.isInteger(record.endChar) && record.startChar < record.endChar
  );
}

/**
 * A rejected record is a TOMBSTONE: it is excluded from live geometry (the
 * validator's overlap/nesting/coverage checks) precisely so that an accepted
 * replacement may occupy the same range without tripping `overlap_same_depth`.
 * The compiler pays for that exemption by demanding COMPLETE re-coverage of the
 * tombstoned interval — see `uncoveredIntervals`.
 */
export function isLiveVoiceRecord(record: VoiceRecord) {
  return record.reviewStatus !== "rejected";
}

/**
 * The sub-intervals of [startChar, endChar) that no record in `covers` occupies.
 * Used for both the turn-tiling check and the replacement check, so "covered"
 * means the same thing in both.
 */
function uncoveredIntervals(
  startChar: number,
  endChar: number,
  covers: VoiceRecord[],
): Array<{ startChar: number; endChar: number }> {
  const sorted = [...covers].sort((a, b) => a.startChar - b.startChar);
  const gaps: Array<{ startChar: number; endChar: number }> = [];
  let cursor = startChar;
  for (const record of sorted) {
    if (record.startChar > cursor) {
      gaps.push({ startChar: cursor, endChar: Math.min(record.startChar, endChar) });
    }
    cursor = Math.max(cursor, record.endChar);
    if (cursor >= endChar) break;
  }
  if (cursor < endChar) gaps.push({ startChar: cursor, endChar });
  return gaps.filter((gap) => gap.startChar < gap.endChar);
}

/**
 * Compilation is atomic per voiced turn, and authority is all-or-nothing across
 * the dialogue.
 *
 * Accepting a parent span without its deeper children would silently hand the
 * children's characters back to the parent — for the Symposium that means the
 * Diotima region reverting to Socrates, which is the exact class of error this
 * lane exists to prevent. So a partially reviewed turn compiles to nothing at
 * all rather than to a plausible-looking projection.
 *
 * Four conditions must hold for every turn that carries ANY voice record —
 * accepted or not. Checking only the turns that already carry accepted records
 * was the fail-open hole: a wholly unreviewed voiced turn passed silently, and
 * the join then handed its claims back to the printed turn siglum as
 * `turn_level`, which is the original defect wearing a new name.
 *
 *   0. the turn has at least one accepted record (no voiced turn may be
 *      unreviewed while the dialogue claims authority);
 *   1. the accepted records tile the turn (no gap inherits an owner);
 *   2. every non-accepted record's interval is COMPLETELY re-covered by
 *      accepted records at least as deep as it. Partial overlap is not
 *      replacement: a one-character accepted span used to satisfy this check
 *      while the rest of a rejected child's range fell back to its parent;
 *   3. every accepted deep record has an accepted parent.
 */
export function collectAcceptedProjectionFailures(
  records: VoiceRecord[],
  turnIndex: TurnIndex,
  sourceText: string,
): string[] {
  const failures: string[] = [];
  const all = records.filter((record) => usable(record));
  if (all.length === 0) return failures;
  const accepted = all.filter((record) => isCompilableVoiceRecord(record));

  // Every turn the ledger speaks about, not just the ones with accepted records.
  const turnsWithAnyRecord = new Set(all.map((record) => record.outerTurnId));

  for (const turn of turnIndex.turns) {
    if (!turnsWithAnyRecord.has(turn.turnId)) continue;
    const acceptedHere = accepted.filter((record) => record.outerTurnId === turn.turnId);
    const allHere = all.filter((record) => record.outerTurnId === turn.turnId);

    // 0. A voiced turn with no accepted record has no projection at all. It must
    //    not silently fall through to the printed turn siglum.
    if (acceptedHere.length === 0) {
      const statuses = [...new Set(allHere.map((record) => record.reviewStatus))].sort().join(", ");
      failures.push(
        `${turn.turnId}: ${allHere.length} voice record(s) (${statuses}) but none accepted. ` +
          `A voiced turn with no accepted projection would hand its claims back to "${turn.speaker}" as turn_level, ` +
          "which is the collapse this lane exists to prevent. Review the whole turn or remove its records.",
      );
      continue;
    }

    // 1. Accepted records must tile the turn at their shallowest depth.
    const minDepth = Math.min(...acceptedHere.map((record) => record.depth));
    const base = acceptedHere.filter((record) => record.depth === minDepth);
    for (const gap of uncoveredIntervals(semanticTurnStartChar(turn, sourceText), turn.endChar, base)) {
      failures.push(
        `${turn.turnId}: accepted records leave [${gap.startChar}, ${gap.endChar}) uncovered at depth ${minDepth}.`,
      );
    }

    // 2. Every non-accepted record must be COMPLETELY replaced by accepted
    //    records at least as deep as it.
    for (const pending of allHere.filter((record) => !isCompilableVoiceRecord(record))) {
      const replacements = acceptedHere.filter((record) => record.depth >= pending.depth);
      const gaps = uncoveredIntervals(pending.startChar, pending.endChar, replacements);
      if (gaps.length === 0) continue;
      const fallback =
        acceptedHere
          .filter((record) => record.startChar <= gaps[0]!.startChar && gaps[0]!.startChar < record.endChar)
          .sort((a, b) => b.depth - a.depth)[0]?.voiceChain.at(-1) ?? "the enclosing voice";
      failures.push(
        `${turn.turnId}: ${pending.voiceId} (${pending.reviewStatus}, depth ${pending.depth}, ` +
          `[${pending.startChar}, ${pending.endChar})) is not completely replaced by accepted records of depth ` +
          `>= ${pending.depth}; ${gaps.length} interval(s) uncovered, first [${gaps[0]!.startChar}, ${gaps[0]!.endChar}). ` +
          `Those characters would fall back to "${fallback}". A rejected or pending child must be replaced across ` +
          "its WHOLE range by an accepted record — resolved or unresolved.",
      );
    }

    // 3. Accepted records must nest inside accepted parents.
    for (const record of acceptedHere) {
      if (record.depth <= 1) continue;
      const parent = acceptedHere.find(
        (candidate) =>
          candidate.depth === record.depth - 1 &&
          candidate.startChar <= record.startChar &&
          record.endChar <= candidate.endChar,
      );
      if (!parent) {
        failures.push(
          `${turn.turnId}: accepted ${record.voiceId} (depth ${record.depth}) has no accepted depth-${record.depth - 1} parent.`,
        );
      }
    }
  }

  return failures;
}

/**
 * Compile the ledger AS IF every record were accepted.
 *
 * Review needs the numbers before acceptance — coverage, which claims resolve,
 * whether a fixture holds — and the real compiler correctly refuses to produce
 * them. This exists for that, and only that. It is never written to derived/ and
 * never feeds the migration: `buildVoiceIndex` remains the only path to
 * authoritative output, and it still requires an atomic accepted cohort.
 */
export function buildPreviewVoiceIndex(dialogue: string): VoiceIndex {
  return buildVoiceIndexInternal(dialogue, { preview: true });
}

export function buildVoiceIndex(dialogue: string): VoiceIndex {
  return buildVoiceIndexInternal(dialogue, { preview: false });
}

function buildVoiceIndexInternal(dialogue: string, { preview }: { preview: boolean }): VoiceIndex {
  assertDialogueSlug(dialogue);
  const repoRoot = getRepoRoot();

  const ledgerPath = voicesLedgerPath(dialogue);
  const absoluteLedgerPath = join(repoRoot, ledgerPath);
  if (!existsSync(absoluteLedgerPath)) {
    throw new Error(`Missing voice ledger: ${ledgerPath}`);
  }

  const sourcePath = `raw/plato/greek/${dialogue}.txt`;
  const absoluteSourcePath = join(repoRoot, sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    throw new Error(`Missing Greek source: ${sourcePath}`);
  }

  const turnPath = turnIndexPath(dialogue);
  const absoluteTurnPath = join(repoRoot, turnPath);
  if (!existsSync(absoluteTurnPath)) {
    throw new Error(`Missing turn index: ${turnPath}`);
  }

  const ledgerContent = readFileSync(absoluteLedgerPath, "utf8");
  const sourceContent = readFileSync(absoluteSourcePath, "utf8");
  const turnContent = readFileSync(absoluteTurnPath, "utf8");
  const turnIndex = parseTurnIndexToon(turnContent);

  if (turnIndex.sourceSha256 !== sha256(sourceContent)) {
    throw new Error(
      `Stale turn index for ${dialogue}: ${turnPath} does not match ${sourcePath}. Regenerate with \`bun run harness derive turns ${dialogue}\`.`,
    );
  }

  const ledger = parseVoiceLedger(ledgerContent);

  // The full ledger validator runs INSIDE authoritative compilation. Compiling
  // from a ledger that `bun run validate` would reject means the derived layer
  // can be authoritative and invalid at the same time; the per-record byte
  // checks below are not a substitute for the geometry and evidence invariants.
  if (!preview) {
    const issues = validateVoicesLedger(ledgerPath, ledgerContent);
    if (issues.length > 0) {
      throw new Error(
        `Refusing to compile authoritative voices for ${dialogue} from a ledger that fails validation.\n` +
          formatVoicesLedgerValidationError(issues),
      );
    }
  }

  const projectionFailures = preview ? [] : collectAcceptedProjectionFailures(ledger, turnIndex, sourceContent);
  if (projectionFailures.length > 0) {
    throw new Error(
      `Incomplete review cohort for ${dialogue}; deriving nothing rather than a partial projection.\n` +
        `${projectionFailures.map((failure) => `- ${failure}`).join("\n")}\n` +
        "Accept, reject-and-replace, or leave the whole voiced turn unreviewed.",
    );
  }

  const records = ledger
    .filter((record) => preview || isCompilableVoiceRecord(record))
    .map((record) => {
      if (record.sourceSha256 !== sha256(sourceContent)) {
        throw new Error(
          `Voice record ${record.voiceId} cites source_sha256 ${record.sourceSha256}, which does not match ${sourcePath}.`,
        );
      }
      if (record.spanSha256 !== sha256(sourceContent.slice(record.startChar, record.endChar))) {
        throw new Error(`Voice record ${record.voiceId} span_sha256 does not match the bytes it cites.`);
      }
      for (const ref of record.evidenceRefs) {
        if (sourceContent.slice(ref.startChar, ref.endChar) !== ref.text) {
          throw new Error(`Voice record ${record.voiceId} cites evidence that does not match the source bytes.`);
        }
      }
      if (record.reviewedAttribution) {
        const context = sourceContent.slice(
          record.reviewedAttribution.contextStartChar,
          record.reviewedAttribution.contextEndChar,
        );
        if (sha256(context) !== record.reviewedAttribution.contextSha256) {
          throw new Error(
            `Voice record ${record.voiceId} cites a reviewed_attribution context that does not match the source bytes.`,
          );
        }
      }
      return {
        voiceId: record.voiceId,
        outerTurnId: record.outerTurnId,
        startChar: record.startChar,
        endChar: record.endChar,
        depth: record.depth,
        voiceChain: record.voiceChain,
        resolution: record.resolution,
        evidenceKinds: [...new Set(record.evidenceRefs.map((ref) => ref.kind))].sort(),
        evidenceCount: record.evidenceRefs.length,
        ...(record.reviewedAttribution ? { resolutionBasis: "reviewed_discourse" as const } : {}),
      };
    })
    // Depth-major ordering keeps enclosing spans ahead of the spans they
    // contain, so a consumer can walk the file once and always know the parent.
    .sort((a, b) => a.depth - b.depth || a.startChar - b.startChar || a.voiceId.localeCompare(b.voiceId)) as VoiceIndexRecord[];

  // A zero-record authoritative index is not "no opinion", it is the assertion
  // that the dialogue has no embedded voices — which the join reads as licence
  // to hand every claim back to the printed turn siglum. Authority requires at
  // least one accepted record; anything less must fail, not compile to empty.
  if (!preview && records.length === 0) {
    throw new Error(
      `Refusing to write a zero-record authoritative voice index for ${dialogue}: ` +
        `${ledger.length} ledger record(s), none accepted. An empty index would read as ` +
        `"this dialogue has no embedded voices" and return every claim to its printed turn siglum.`,
    );
  }

  return {
    dialogue,
    ledgerPath,
    ledgerSha256: sha256(ledgerContent),
    sourcePath,
    sourceSha256: sha256(sourceContent),
    turnIndexPath: turnPath,
    turnIndexSha256: sha256(turnContent),
    records,
  };
}

const VOICE_COLUMNS = [
  "voice_id",
  "outer_turn_id",
  "start_char",
  "end_char",
  "depth",
  "voice_chain",
  "resolution",
  "evidence_kinds",
  "evidence_count",
] as const;

/**
 * `resolution_basis` is a TRAILING OPTIONAL column, present only in indexes that
 * actually contain a reviewed-discourse record.
 *
 * Making it unconditional would rewrite every existing artifact to add a column
 * of `(none)`, and the Symposium index is live authority whose hash the stored
 * join binds — an unrelated Phaedo change must not force that churn. So a
 * dialogue resolved entirely by cited bytes serializes exactly as before, and
 * one that used adjudication says so on every row.
 */
const VOICE_RESOLUTION_BASIS_COLUMN = "resolution_basis";

/**
 * Trailing optional columns, in order. Each appears only in an index that
 * actually uses it, for the reason recorded above: making one unconditional
 * rewrites every existing artifact to add a column of `(none)`, and the
 * Symposium index is live authority whose hash the stored join binds.
 */
const OPTIONAL_VOICE_COLUMNS = [VOICE_RESOLUTION_BASIS_COLUMN] as const;

function optionalColumnsFor(index: VoiceIndex): readonly string[] {
  const used: string[] = [];
  if (index.records.some((record) => record.resolutionBasis)) used.push(VOICE_RESOLUTION_BASIS_COLUMN);
  return used;
}

function indexColumns(index: VoiceIndex): readonly string[] {
  return [...VOICE_COLUMNS, ...optionalColumnsFor(index)];
}

function voiceCells(record: VoiceIndexRecord, optional: readonly string[]) {
  const cells = [
    record.voiceId,
    record.outerTurnId,
    String(record.startChar),
    String(record.endChar),
    String(record.depth),
    record.voiceChain.join(">"),
    record.resolution,
    record.evidenceKinds.join(",") || "(none)",
    String(record.evidenceCount),
  ];
  for (const column of optional) {
    if (column === VOICE_RESOLUTION_BASIS_COLUMN) cells.push(record.resolutionBasis ?? "(none)");
  }
  return cells;
}

export function formatVoiceIndexToon(index: VoiceIndex) {
  const columns = indexColumns(index);
  const optional = optionalColumnsFor(index);
  const cells = index.records.map((record) => voiceCells(record, optional));
  const widths = columns.map((column, position) =>
    Math.max(column.length, ...cells.map((row) => row[position]!.length)),
  );
  const rows = [
    `  ${columns.map((column, position) => pad(column, widths[position]!)).join(" | ")}`,
    ...cells.map((row) => `  ${row.map((cell, position) => pad(cell, widths[position]!)).join(" | ")}`),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${index.dialogue}`,
    `ledger_path: ${index.ledgerPath}`,
    `ledger_sha256: ${index.ledgerSha256}`,
    `source_path: ${index.sourcePath}`,
    `source_sha256: ${index.sourceSha256}`,
    `turn_index_path: ${index.turnIndexPath}`,
    `turn_index_sha256: ${index.turnIndexSha256}`,
    `voices[${index.records.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function parseVoiceIndexToon(content: string): VoiceIndex {
  const lines = content.trimEnd().split(/\r?\n/u);
  const dialogue = /^dialogue:\s+([a-z0-9-]+)$/u.exec(lines[0] ?? "")?.[1];
  const ledgerPath = /^ledger_path:\s+(wiki\/voices\/[a-z0-9-]+\.md)$/u.exec(lines[1] ?? "")?.[1];
  const ledgerSha256 = /^ledger_sha256:\s+([a-f0-9]{64})$/u.exec(lines[2] ?? "")?.[1];
  const sourcePath = /^source_path:\s+(raw\/plato\/greek\/[a-z0-9-]+\.txt)$/u.exec(lines[3] ?? "")?.[1];
  const sourceSha256 = /^source_sha256:\s+([a-f0-9]{64})$/u.exec(lines[4] ?? "")?.[1];
  const turnIndexPathValue = /^turn_index_path:\s+(derived\/plato\/turns\/[a-z0-9-]+\.toon)$/u.exec(lines[5] ?? "")?.[1];
  const turnIndexSha256 = /^turn_index_sha256:\s+([a-f0-9]{64})$/u.exec(lines[6] ?? "")?.[1];
  const recordCount = /^voices\[(\d+)\]:$/u.exec(lines[7] ?? "")?.[1];
  // Header-driven rather than matched against a fixed set of permitted headers:
  // with more than one trailing optional column, enumerating the combinations
  // is how a parser silently stops accepting a legal artifact.
  const headerCells = lines[8]?.split("|").map((column) => column.trim()) ?? [];
  const fixed = headerCells.slice(0, VOICE_COLUMNS.length);
  const optional = headerCells.slice(VOICE_COLUMNS.length);
  const optionalIsOrderedSubset =
    optional.every((column) => (OPTIONAL_VOICE_COLUMNS as readonly string[]).includes(column)) &&
    optional.every(
      (column, position) =>
        position === 0 ||
        OPTIONAL_VOICE_COLUMNS.indexOf(column as (typeof OPTIONAL_VOICE_COLUMNS)[number]) >
          OPTIONAL_VOICE_COLUMNS.indexOf(optional[position - 1] as (typeof OPTIONAL_VOICE_COLUMNS)[number]),
    );
  const headerValid = fixed.join(" | ") === VOICE_COLUMNS.join(" | ") && optionalIsOrderedSubset;
  const basisAt = optional.indexOf(VOICE_RESOLUTION_BASIS_COLUMN);
  if (
    !dialogue ||
    !ledgerPath ||
    !ledgerSha256 ||
    !sourcePath ||
    !sourceSha256 ||
    !turnIndexPathValue ||
    !turnIndexSha256 ||
    recordCount === undefined ||
    !headerValid
  ) {
    throw new Error("Malformed voice index header.");
  }
  const expectedColumns = VOICE_COLUMNS.length + optional.length;

  const recordLines = lines.slice(9);

  const records = recordLines.map((line) => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== expectedColumns) {
      throw new Error(`Malformed voice index row: ${line}`);
    }
    const [voiceId, outerTurnId, startRaw, endRaw, depthRaw, chainRaw, resolution, kindsRaw, countRaw] = columns;
    const optionalCells = columns.slice(VOICE_COLUMNS.length);
    const basisRaw = basisAt === -1 ? undefined : optionalCells[basisAt];
    if (basisRaw !== undefined && basisRaw !== "reviewed_discourse" && basisRaw !== "(none)") {
      throw new Error(`Malformed voice index resolution_basis: ${line}`);
    }
    const voiceChain = chainRaw?.split(">").filter(Boolean) ?? [];
    const startChar = Number(startRaw);
    const endChar = Number(endRaw);
    const depth = Number(depthRaw);
    if (
      !voiceId ||
      !new RegExp(`^voice_${dialogue}_\\d{4}$`, "u").test(voiceId) ||
      !outerTurnId ||
      !new RegExp(`^turn_${dialogue}_\\d{4}$`, "u").test(outerTurnId) ||
      !Number.isInteger(startChar) ||
      !Number.isInteger(endChar) ||
      startChar >= endChar ||
      !Number.isInteger(depth) ||
      depth !== (resolution === "unresolved" ? voiceChain.length + 1 : voiceChain.length) ||
      !resolution
    ) {
      throw new Error(`Malformed voice index row values: ${line}`);
    }
    return {
      voiceId,
      outerTurnId,
      startChar,
      endChar,
      depth,
      voiceChain,
      resolution,
      evidenceKinds: kindsRaw === "(none)" ? [] : (kindsRaw?.split(",").filter(Boolean) ?? []),
      evidenceCount: Number(countRaw),
      ...(basisRaw === "reviewed_discourse" ? { resolutionBasis: "reviewed_discourse" as const } : {}),
    };
  });

  if (records.length !== Number(recordCount)) {
    throw new Error(`Voice index count mismatch: expected ${recordCount}, found ${records.length}`);
  }

  return {
    dialogue,
    ledgerPath,
    ledgerSha256,
    sourcePath,
    sourceSha256,
    turnIndexPath: turnIndexPathValue,
    turnIndexSha256,
    records,
  };
}

/**
 * The deepest record covering an offset. Nesting is validated, so "deepest" is
 * unambiguous: at most one record per depth can contain a given character.
 */
export function terminalVoiceAt(index: VoiceIndex, offset: number): VoiceIndexRecord | undefined {
  let best: VoiceIndexRecord | undefined;
  for (const record of index.records) {
    if (record.startChar <= offset && offset < record.endChar) {
      if (!best || record.depth > best.depth) best = record;
    }
  }
  return best;
}

/**
 * Load the STORED authoritative index and prove it is the artifact the current
 * ledger compiles to.
 *
 * Consumers used to rebuild authority from the ledger on the fly, which meant
 * the derived file was decorative: an operator could edit the ledger and the
 * migration would quietly follow, with no accepted cohort ever written down.
 * Reading the stored artifact makes the review boundary real, but only if the
 * artifact is checked. Four ways it can lie, all rejected here:
 *
 *   orphaned  the index exists but its ledger does not;
 *   empty     zero records, which the join would read as "no embedded voices";
 *   stale     the ledger, source, or turn index has moved underneath it;
 *   forged    the bytes were hand-written and do not match what the ledger
 *             deterministically compiles to.
 */
export function readVoiceIndex(dialogue: string): VoiceIndex {
  assertDialogueSlug(dialogue);
  const repoRoot = getRepoRoot();
  const relativePath = voiceIndexPath(dialogue);
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(
      `Missing authoritative voice index ${relativePath}. The ledger has not been accepted and compiled; ` +
        `run \`bun run harness derive voices ${dialogue}\` after review.`,
    );
  }

  const storedContent = readFileSync(absolutePath, "utf8");
  const stored = parseVoiceIndexToon(storedContent);

  if (stored.dialogue !== dialogue) {
    throw new Error(`${relativePath} declares dialogue "${stored.dialogue}"; expected "${dialogue}".`);
  }
  if (stored.records.length === 0) {
    throw new Error(
      `${relativePath} contains zero voice records. An empty index reads as an assertion that the dialogue has ` +
        "no embedded voices, and would return every claim to its printed turn siglum. " +
        "Delete it or compile a real accepted cohort.",
    );
  }

  const ledgerAbsolute = join(repoRoot, voicesLedgerPath(dialogue));
  if (!existsSync(ledgerAbsolute)) {
    throw new Error(
      `${relativePath} is orphaned: its ledger ${voicesLedgerPath(dialogue)} does not exist. ` +
        "Restore the ledger or delete the derived index.",
    );
  }

  const checks: Array<{ label: string; path: string; recorded: string }> = [
    { label: "ledger", path: voicesLedgerPath(dialogue), recorded: stored.ledgerSha256 },
    { label: "Greek source", path: `raw/plato/greek/${dialogue}.txt`, recorded: stored.sourceSha256 },
    { label: "turn index", path: turnIndexPath(dialogue), recorded: stored.turnIndexSha256 },
  ];
  for (const check of checks) {
    const absolute = join(repoRoot, check.path);
    if (!existsSync(absolute)) {
      throw new Error(`${relativePath} cites ${check.label} ${check.path}, which does not exist.`);
    }
    const actual = sha256(readFileSync(absolute, "utf8"));
    if (actual !== check.recorded) {
      throw new Error(
        `${relativePath} is stale: it records ${check.label} sha256 ${check.recorded} but ${check.path} hashes to ` +
          `${actual}. Regenerate with \`bun run harness derive voices ${dialogue}\`.`,
      );
    }
  }

  // Forgery check: the stored bytes must be exactly what the ledger compiles to.
  // This also re-runs the validator and the atomic-cohort projection, so a
  // hand-written index over an unreviewed ledger cannot be used as authority.
  const recompiled = formatVoiceIndexToon(buildVoiceIndex(dialogue));
  if (recompiled !== storedContent) {
    throw new Error(
      `${relativePath} does not match what ${voicesLedgerPath(dialogue)} deterministically compiles to ` +
        `(stored ${sha256(storedContent)}, recompiled ${sha256(recompiled)}). ` +
        "The artifact was edited by hand or generated by a different compiler. Regenerate it.",
    );
  }

  return stored;
}

/** sha256 of the stored authoritative index, for provenance in the join. */
export function readVoiceIndexSha256(dialogue: string) {
  return sha256(readFileSync(join(getRepoRoot(), voiceIndexPath(dialogue)), "utf8"));
}

export function writeVoiceIndex(dialogue: string): WrittenVoiceIndex {
  const index = buildVoiceIndex(dialogue);
  const path = voiceIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatVoiceIndexToon(index), "utf8");
  return { dialogue, path, recordCount: index.records.length };
}

function voiceLedgerDialogues() {
  const ledgers = new Set(listVoicesLedgerPaths().map((path) => basename(path, ".md").replace(/^.*\//u, "")));
  return listGreekDialogues().filter((dialogue) => ledgers.has(dialogue));
}

export function writeVoiceIndexes(dialogue?: string | undefined) {
  return (dialogue ? [dialogue] : voiceLedgerDialogues()).map((entry) => writeVoiceIndex(entry));
}

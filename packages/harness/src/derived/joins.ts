import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  fieldValue,
  listObservationLedgerPaths,
  nestedFieldValueInParent,
  observationYamlBlocks,
} from "../wiki/observation-ledger.js";
import { listGreekDialogues } from "./stephanus.js";
import { parseTurnIndexToon, turnIndexPath } from "./turns.js";

export type ObservationTurnJoinRow = {
  observationId: string;
  reviewStatus: string;
  turnIds: string[];
  speakers: string[];
  attributed: boolean;
};

export type ObservationTurnJoinIndex = {
  dialogue: string;
  ledgerPath: string;
  ledgerSha256: string;
  turnIndexPath: string;
  turnIndexSha256: string;
  rows: ObservationTurnJoinRow[];
};

export type WrittenObservationTurnJoin = {
  dialogue: string;
  path: string;
  rowCount: number;
};

type ObservationSpan = {
  observationId: string;
  reviewStatus: string;
  startChar: number;
  endChar: number;
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

function observationLedgerPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `wiki/observations/${dialogue}.md`;
}

export function observationTurnJoinPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/joins/${dialogue}.toon`;
}

function parseObservationSpans(content: string): ObservationSpan[] {
  return observationYamlBlocks(content)
    .map((block) => {
      const observationId = fieldValue(block, "observation_id");
      const reviewStatus = fieldValue(block, "review_status") ?? "unreviewed";
      const startChar = Number(nestedFieldValueInParent(block, "source_ref", "start_char"));
      const endChar = Number(nestedFieldValueInParent(block, "source_ref", "end_char"));
      if (!observationId || !Number.isInteger(startChar) || !Number.isInteger(endChar) || endChar < startChar) {
        throw new Error(`Malformed observation source_ref for ${observationId ?? "(missing id)"}.`);
      }
      return { observationId, reviewStatus, startChar, endChar };
    })
    .sort((a, b) => a.observationId.localeCompare(b.observationId));
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

function isUnattributedWholeDialogue(turns: Array<{ speaker: string; startChar: number; endChar: number }>) {
  return turns.length === 1 && turns[0]?.speaker === "(none)" && turns[0].startChar === 0;
}

export function buildObservationTurnJoin(dialogue: string): ObservationTurnJoinIndex {
  assertDialogueSlug(dialogue);
  const repoRoot = getRepoRoot();
  const ledgerPath = observationLedgerPath(dialogue);
  const absoluteLedgerPath = join(repoRoot, ledgerPath);
  if (!existsSync(absoluteLedgerPath)) {
    throw new Error(`Missing observation ledger: ${ledgerPath}`);
  }

  const turnPath = turnIndexPath(dialogue);
  const absoluteTurnPath = join(repoRoot, turnPath);
  if (!existsSync(absoluteTurnPath)) {
    throw new Error(`Missing turn index: ${turnPath}`);
  }

  const ledgerContent = readFileSync(absoluteLedgerPath, "utf8");
  const turnContent = readFileSync(absoluteTurnPath, "utf8");
  const turnIndex = parseTurnIndexToon(turnContent);
  const attributed = !isUnattributedWholeDialogue(turnIndex.turns);

  const rows = parseObservationSpans(ledgerContent).map((observation) => {
    const overlaps = turnIndex.turns.filter(
      (turn) => observation.startChar < turn.endChar && turn.startChar < observation.endChar,
    );
    if (overlaps.length === 0) {
      throw new Error(`Observation ${observation.observationId} overlaps zero turns in ${dialogue}.`);
    }

    return {
      observationId: observation.observationId,
      reviewStatus: observation.reviewStatus,
      turnIds: overlaps.map((turn) => turn.turnId),
      speakers: attributed ? uniqueInOrder(overlaps.map((turn) => turn.speaker)) : ["(unattributed)"],
      attributed,
    };
  });

  return {
    dialogue,
    ledgerPath,
    ledgerSha256: sha256(ledgerContent),
    turnIndexPath: turnPath,
    turnIndexSha256: sha256(turnContent),
    rows,
  };
}

export function formatObservationTurnJoinToon(index: ObservationTurnJoinIndex) {
  const observationWidth = Math.max("observation_id".length, ...index.rows.map((row) => row.observationId.length));
  const statusWidth = Math.max("review_status".length, ...index.rows.map((row) => row.reviewStatus.length));
  const turnWidth = Math.max("turn_ids".length, ...index.rows.map((row) => row.turnIds.join(",").length));
  const speakerWidth = Math.max("speakers".length, ...index.rows.map((row) => row.speakers.join(",").length));
  const attributedWidth = Math.max("attributed".length, ...index.rows.map((row) => String(row.attributed).length));
  const rows = [
    `  ${pad("observation_id", observationWidth)} | ${pad("review_status", statusWidth)} | ${pad("turn_ids", turnWidth)} | ${pad("speakers", speakerWidth)} | ${pad("attributed", attributedWidth)}`,
    ...index.rows.map(
      (row) =>
        `  ${pad(row.observationId, observationWidth)} | ${pad(row.reviewStatus, statusWidth)} | ${pad(row.turnIds.join(","), turnWidth)} | ${pad(row.speakers.join(","), speakerWidth)} | ${pad(String(row.attributed), attributedWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${index.dialogue}`,
    `ledger_path: ${index.ledgerPath}`,
    `ledger_sha256: ${index.ledgerSha256}`,
    `turn_index_path: ${index.turnIndexPath}`,
    `turn_index_sha256: ${index.turnIndexSha256}`,
    `joins[${index.rows.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function parseObservationTurnJoinToon(content: string): ObservationTurnJoinIndex {
  const lines = content.trimEnd().split(/\r?\n/u);
  const dialogue = /^dialogue:\s+([a-z0-9-]+)$/u.exec(lines[0] ?? "")?.[1];
  const ledgerPath = /^ledger_path:\s+(wiki\/observations\/[a-z0-9-]+\.md)$/u.exec(lines[1] ?? "")?.[1];
  const ledgerSha256 = /^ledger_sha256:\s+([a-f0-9]{64})$/u.exec(lines[2] ?? "")?.[1];
  const turnIndexPathValue = /^turn_index_path:\s+(derived\/plato\/turns\/[a-z0-9-]+\.toon)$/u.exec(lines[3] ?? "")?.[1];
  const turnIndexSha256 = /^turn_index_sha256:\s+([a-f0-9]{64})$/u.exec(lines[4] ?? "")?.[1];
  const rowCount = /^joins\[(\d+)\]:$/u.exec(lines[5] ?? "")?.[1];
  const header = lines[6]?.split("|").map((column) => column.trim()).join(" | ");
  if (
    !dialogue ||
    !ledgerPath ||
    !ledgerSha256 ||
    !turnIndexPathValue ||
    !turnIndexSha256 ||
    rowCount === undefined ||
    header !== "observation_id | review_status | turn_ids | speakers | attributed"
  ) {
    throw new Error("Malformed observation-turn join header.");
  }

  const rows = lines.slice(7).map((line) => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== 5) {
      throw new Error(`Malformed observation-turn join row: ${line}`);
    }
    const [observationId, reviewStatus, turnIdsRaw, speakersRaw, attributedRaw] = columns;
    const turnIds = turnIdsRaw?.split(",").filter(Boolean) ?? [];
    const speakers = speakersRaw?.split(",").filter(Boolean) ?? [];
    const attributed = attributedRaw === "true" ? true : attributedRaw === "false" ? false : undefined;
    if (
      !observationId ||
      !/^obs_[a-z0-9-]+_\d{4}$/u.test(observationId) ||
      !reviewStatus ||
      turnIds.length === 0 ||
      turnIds.some((turnId) => !new RegExp(`^turn_${dialogue}_\\d{4}$`, "u").test(turnId)) ||
      speakers.length === 0 ||
      attributed === undefined
    ) {
      throw new Error(`Malformed observation-turn join row values: ${line}`);
    }
    return { observationId, reviewStatus, turnIds, speakers, attributed };
  });

  if (rows.length !== Number(rowCount)) {
    throw new Error(`Observation-turn join count mismatch: expected ${rowCount}, found ${rows.length}`);
  }

  return {
    dialogue,
    ledgerPath,
    ledgerSha256,
    turnIndexPath: turnIndexPathValue,
    turnIndexSha256,
    rows,
  };
}

export function writeObservationTurnJoin(dialogue: string): WrittenObservationTurnJoin {
  const index = buildObservationTurnJoin(dialogue);
  const path = observationTurnJoinPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatObservationTurnJoinToon(index), "utf8");
  return { dialogue, path, rowCount: index.rows.length };
}

function observationLedgerDialogues() {
  const ledgers = new Set(
    listObservationLedgerPaths().map((path) => basename(path, ".md").replace(/^.*\//u, "")),
  );
  return listGreekDialogues().filter((dialogue) => ledgers.has(dialogue));
}

export function writeObservationTurnJoins(dialogue?: string | undefined) {
  return (dialogue ? [dialogue] : observationLedgerDialogues()).map((entry) => writeObservationTurnJoin(entry));
}

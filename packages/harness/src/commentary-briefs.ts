import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildStephanusIndex } from "./derived/stephanus.js";
import { parseTurnIndexToon, turnIndexPath } from "./derived/turns.js";
import { getRepoRoot } from "./paths.js";
import { resolveEnglishSpan, resolveSourceSpan } from "./source.js";
import { claimYamlBlocks } from "./wiki/claim-ledger.js";
import { commentaryYamlBlocks } from "./wiki/commentary-ledger.js";
import { relationYamlBlocks, listRelationLedgerPaths } from "./wiki/relation-ledger.js";
import { fieldValue, fieldValueOrEmpty, nestedFieldValueInParent, observationYamlBlocks } from "./wiki/observation-ledger.js";
import {
  ontologyConceptRefsByObservation,
  ontologyDossierPathsByObservation,
} from "./wiki/ontology-vnext-repository.js";

export type CommentaryBriefResult = {
  path: string;
  sectionId: string;
  span: string;
};

type SectionUnit = {
  sectionId: string;
  title: string;
  body: string;
  span: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
};

type AnchoredRecord = {
  block: string;
  startChar: number;
  endChar: number;
};

function overlaps(record: { startChar: number; endChar: number }, unit: { startChar: number; endChar: number }) {
  return record.startChar < unit.endChar && record.endChar > unit.startChar;
}

function anchoredRecords(blocks: string[]): AnchoredRecord[] {
  return blocks
    .map((block) => ({
      block,
      startChar: Number(nestedFieldValueInParent(block, "source_ref", "start_char")),
      endChar: Number(nestedFieldValueInParent(block, "source_ref", "end_char")),
    }))
    .filter((record) => Number.isInteger(record.startChar) && Number.isInteger(record.endChar));
}

function sectionUnits(dialogue: string, ledgerContent: string): SectionUnit[] {
  const units: SectionUnit[] = [];
  for (const block of commentaryYamlBlocks(ledgerContent)) {
    if (fieldValue(block, "block_kind") !== "section") continue;
    if (fieldValue(block, "review_status") === "rejected") continue;

    const span = fieldValue(block, "stephanus_span");
    if (!span) continue;
    const resolution = resolveSourceSpan(dialogue, span);
    units.push({
      sectionId: fieldValueOrEmpty(block, "commentary_id"),
      title: fieldValueOrEmpty(block, "title"),
      body: fieldValueOrEmpty(block, "body"),
      span: resolution.source_ref.stephanus_span,
      startMarker: resolution.source_ref.start_marker,
      endMarker: resolution.source_ref.end_marker,
      startChar: resolution.source_ref.start_char,
      endChar: resolution.source_ref.end_char,
    });
  }

  return units.sort((a, b) => a.startChar - b.startChar || a.endChar - b.endChar);
}

function spineLines(dialogue: string, unit: SectionUnit, markers: string[], englishExists: boolean) {
  const greek: string[] = ["## Greek spine", ""];
  const english: string[] = ["## English spine", ""];

  for (const marker of markers) {
    greek.push(`### {${marker}}`, "", resolveSourceSpan(dialogue, marker).text.trim(), "");
    if (!englishExists) continue;
    try {
      english.push(`### {${marker}}`, "", resolveEnglishSpan(dialogue, marker).text.trim(), "");
    } catch {
      english.push(`### {${marker}}`, "", "(no English marker; covered by the previous slice)", "");
    }
  }

  if (!englishExists) {
    english.push("(no English source imported for this dialogue)", "");
  }

  return [...greek, ...english];
}

export function writeCommentaryBriefs(dialogue: string): CommentaryBriefResult[] {
  const repoRoot = getRepoRoot();
  const conceptRefsByObservation = ontologyConceptRefsByObservation(repoRoot);
  const dossierPathsByObservation = ontologyDossierPathsByObservation(repoRoot);
  const ledgerPath = join(repoRoot, `wiki/commentary/${dialogue}.md`);
  if (!existsSync(ledgerPath)) {
    throw new Error(`No commentary ledger for ${dialogue}: wiki/commentary/${dialogue}.md does not exist.`);
  }

  const units = sectionUnits(dialogue, readFileSync(ledgerPath, "utf8"));
  if (units.length === 0) {
    throw new Error(`Commentary ledger for ${dialogue} has no section blocks yet; draft the unit skeleton first.`);
  }

  const index = buildStephanusIndex(dialogue);
  const englishExists = existsSync(join(repoRoot, `raw/plato/english/${dialogue}.txt`));

  const observationLedgerPath = join(repoRoot, `wiki/observations/${dialogue}.md`);
  const observations = existsSync(observationLedgerPath)
    ? anchoredRecords(
        observationYamlBlocks(readFileSync(observationLedgerPath, "utf8")).filter(
          (block) => fieldValue(block, "review_status") === "accepted",
        ),
      )
    : [];

  const claimLedgerPath = join(repoRoot, `wiki/claims/${dialogue}.md`);
  const claims = existsSync(claimLedgerPath)
    ? anchoredRecords(
        claimYamlBlocks(readFileSync(claimLedgerPath, "utf8")).filter(
          (block) => fieldValue(block, "review_status") === "accepted",
        ),
      )
    : [];

  const relationBlocks = listRelationLedgerPaths().flatMap((relativePath) =>
    relationYamlBlocks(readFileSync(join(repoRoot, relativePath), "utf8")).filter(
      (block) => fieldValue(block, "review_status") === "accepted",
    ),
  );

  const turnRows = (() => {
    const path = join(repoRoot, turnIndexPath(dialogue));
    if (!existsSync(path)) return [];
    return parseTurnIndexToon(readFileSync(path, "utf8")).turns;
  })();

  const outputDir = join(repoRoot, "scratch/commentary/briefs", dialogue);
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  return units.map((unit, unitIndex) => {
    const markers = index.markers
      .filter((entry) => entry.startChar >= unit.startChar && entry.startChar < unit.endChar)
      .map((entry) => entry.marker);

    const unitObservations = observations.filter((record) => overlaps(record, unit));
    const unitClaims = claims.filter((record) => overlaps(record, unit));
    const unitClaimIds = new Set(unitClaims.map((record) => fieldValueOrEmpty(record.block, "claim_id")));
    const unitRelations = relationBlocks.filter((block) => {
      const claimA = fieldValueOrEmpty(block, "claim_a");
      const claimB = fieldValueOrEmpty(block, "claim_b");
      return unitClaimIds.has(claimA) || unitClaimIds.has(claimB);
    });

    const dossierPaths = [
      ...new Set(
        unitObservations
          .flatMap((record) =>
            dossierPathsByObservation.get(fieldValueOrEmpty(record.block, "observation_id")) ?? []
          )
          .map((relativePath) => existsSync(join(repoRoot, relativePath)) ? relativePath : undefined)
          .filter((path): path is string => path !== undefined),
      ),
    ].sort();

    const unitTurns = turnRows.filter((turn) => overlaps(turn, unit));

    const lines: string[] = [
      `# Brief ${String(unitIndex + 1).padStart(2, "0")}: ${unit.title}`,
      "",
      `- section: ${unit.sectionId}`,
      `- span: ${unit.span}`,
      "",
      "## Existing section commentary",
      "",
      `### ${unit.title}`,
      "",
      unit.body,
      "",
      ...spineLines(dialogue, unit, markers, englishExists),
      "## Accepted observations overlapping the span",
      "",
      ...(unitObservations.length === 0 ? ["(none)", ""] : []),
      ...unitObservations.flatMap((record) => {
        const observationId = fieldValueOrEmpty(record.block, "observation_id");
        const concepts = (conceptRefsByObservation.get(observationId) ?? [])
          .map(({ axisKey, conceptKey }) => `${axisKey}/${conceptKey}`)
          .join(", ");
        return [
          `### ${observationId}${concepts ? ` (${concepts})` : ""}`,
          "",
          `- observation: ${fieldValueOrEmpty(record.block, "observation")}`,
          `- limits: ${fieldValueOrEmpty(record.block, "limits")}`,
          "",
        ];
      }),
      "## Accepted claims overlapping the span",
      "",
      ...(unitClaims.length === 0 ? ["(none)", ""] : []),
      ...unitClaims.flatMap((record) => [
        `### ${fieldValueOrEmpty(record.block, "claim_id")} (${fieldValueOrEmpty(record.block, "claim_kind")}, ${fieldValueOrEmpty(record.block, "speaker")}, ${fieldValueOrEmpty(record.block, "final_status")})`,
        "",
        `- content: ${fieldValueOrEmpty(record.block, "content")}`,
        "",
      ]),
      "## Accepted relations among the overlapping claims",
      "",
      ...(unitRelations.length === 0 ? ["(none)", ""] : []),
      ...unitRelations.flatMap((block) => [
        `### ${fieldValueOrEmpty(block, "relation_id")} (${fieldValueOrEmpty(block, "relation_kind")}, ${fieldValueOrEmpty(block, "resolution")})`,
        "",
        `- claims: ${fieldValueOrEmpty(block, "claim_a")} / ${fieldValueOrEmpty(block, "claim_b")}`,
        `- basis: ${fieldValueOrEmpty(block, "basis")}`,
        "",
      ]),
      "## Dossiers for the overlapping observations",
      "",
      ...(dossierPaths.length === 0 ? ["(none)", ""] : dossierPaths.map((path) => `- ${path}`).concat([""])),
      "## Turn rows intersecting the span",
      "",
      ...(unitTurns.length === 0 ? ["(none)", ""] : []),
      ...unitTurns.map(
        (turn) =>
          `- ${turn.turnId} ${turn.speaker} ${turn.startMarker}-${turn.endMarker} chars ${turn.startChar}-${turn.endChar}`,
      ),
    ];

    const fileName = `${String(unitIndex + 1).padStart(2, "0")}-${unit.startMarker}-${unit.endMarker}.md`;
    const relativePath = `scratch/commentary/briefs/${dialogue}/${fileName}`;
    writeFileSync(join(repoRoot, relativePath), `${lines.join("\n").trimEnd()}\n`, "utf8");

    return { path: relativePath, sectionId: unit.sectionId, span: unit.span };
  });
}

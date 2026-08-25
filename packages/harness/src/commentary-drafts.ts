import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "./commentary-authoring.js";
import { readFreshCommentaryTurnIndex } from "./commentary-turn-index.js";
import {
  inspectAudioInsertionValue,
  renderAudioInsertionLines,
  resolveAudioInsertionBoundary,
  type AudioInsertionBoundary,
} from "./audio-insertion.js";
import { withRepoWriteLock } from "./file-lock.js";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";
import { resolveSourceSpan } from "./source.js";
import { recordSubmission, submissionDirectory } from "./submissions.js";
import type { SourceRef } from "./types.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import {
  formatCommentaryLedgerValidationError,
  validateCommentaryLedger,
  workNameToSlug,
} from "./wiki/commentary-validator.js";
import { fieldValue } from "./wiki/observation-ledger.js";
import { validateCommentaryListenerProse } from "./commentary-listener-prose.js";

const BLOCK_KINDS = ["context", "argument", "notice", "crossref", "question"] as const;
const PLACEMENTS = ["before", "after"] as const;
const CITE_FAMILIES = ["observations", "claims", "relations", "dossiers"] as const;

export type CommentaryDraftBlockKind = (typeof BLOCK_KINDS)[number];
export type CommentaryDraftPlacement = (typeof PLACEMENTS)[number];

export type CommentaryDraftCites = {
  observations: string[];
  claims: string[];
  relations: string[];
  dossiers: string[];
};

export type CommentaryDraftCrossref = {
  source_work: string;
  stephanus_span: string;
  note?: string;
};

export type CommentaryDraftBlock = {
  block_kind: CommentaryDraftBlockKind;
  placement: CommentaryDraftPlacement;
  stephanus_span: string;
  audio_insertion?: AudioInsertionBoundary;
  body: string;
  cites: CommentaryDraftCites;
  crossrefs: CommentaryDraftCrossref[];
};

export type CommentaryUnitDraft = {
  schema_version: 1;
  dialogue: string;
  unit_key: string;
  section_id: string;
  authoring: {
    model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: (typeof COMMENTARY_STAGE_EFFORT)["draft"];
  };
  blocks: CommentaryDraftBlock[];
};

export type CommentaryDraftImportOptions = {
  dialogue: string;
  draftPath: string;
  apply?: boolean;
};

export type CommentaryDraftImportResult = {
  dialogue: string;
  draftPath: string;
  ledgerPath: string;
  unitKey: string;
  sectionId: string;
  applied: boolean;
  replayed: boolean;
  draftSha256: string;
  blockIds: string[];
  importMarker: string;
  renderedBlocks: string;
  prospectiveLedger: string;
};

export type CommentaryDraftBatchImportOptions = {
  dialogue: string;
  draftPaths: string[];
  apply?: boolean;
};

export type CommentaryDraftBatchImportResult = {
  dialogue: string;
  ledgerPath: string;
  applied: boolean;
  imports: CommentaryDraftImportResult[];
  prospectiveLedger: string;
};

function draftError(path: string, message: string): never {
  throw new Error(`Invalid commentary unit draft at ${path}: ${message}`);
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function atomicWrite(path: string, content: string) {
  const temporary = `${path}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  try {
    writeFileSync(temporary, content, "utf8");
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

function recordValue(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return draftError(path, "must be an object");
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  record: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  required: readonly string[] = allowed,
) {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(record)) {
    if (!allowedSet.has(key)) draftError(path, `${key} is not allowed`);
  }
  for (const key of required) {
    if (!(key in record)) draftError(path, `${key} is required`);
  }
}

function nonEmptyString(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim().length === 0) draftError(path, "must be a non-empty string");
  return value.trim();
}

function stringList(value: unknown, path: string) {
  if (!Array.isArray(value)) draftError(path, "must be an array");
  return value.map((entry, index) => nonEmptyString(entry, `${path}[${index}]`));
}

function parseCites(value: unknown, path: string): CommentaryDraftCites {
  const record = recordValue(value, path);
  exactKeys(record, CITE_FAMILIES, path);
  return {
    observations: stringList(record.observations, `${path}.observations`),
    claims: stringList(record.claims, `${path}.claims`),
    relations: stringList(record.relations, `${path}.relations`),
    dossiers: stringList(record.dossiers, `${path}.dossiers`),
  };
}

function parseCrossref(value: unknown, path: string): CommentaryDraftCrossref {
  const record = recordValue(value, path);
  const allowed = ["source_work", "stephanus_span", "note"] as const;
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key as (typeof allowed)[number])) draftError(path, `${key} is not allowed`);
  }
  if (!("source_work" in record)) draftError(path, "source_work is required");
  if (!("stephanus_span" in record)) draftError(path, "stephanus_span is required");

  const note = record.note === undefined ? undefined : nonEmptyString(record.note, `${path}.note`);
  return {
    source_work: nonEmptyString(record.source_work, `${path}.source_work`),
    stephanus_span: nonEmptyString(record.stephanus_span, `${path}.stephanus_span`),
    ...(note ? { note } : {}),
  };
}

function enumValue<const Values extends readonly string[]>(value: unknown, values: Values, path: string): Values[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    draftError(path, `must be one of ${values.join(", ")}`);
  }
  return value as Values[number];
}

function parseBlock(value: unknown, index: number): CommentaryDraftBlock {
  const path = `blocks[${index}]`;
  const record = recordValue(value, path);
  const required = ["block_kind", "placement", "stephanus_span", "body", "cites", "crossrefs"] as const;
  exactKeys(record, [...required, "audio_insertion"], path, required);
  if (!Array.isArray(record.crossrefs)) draftError(`${path}.crossrefs`, "must be an array");
  const insertion = record.audio_insertion === undefined
    ? undefined
    : inspectAudioInsertionValue(record.audio_insertion);
  if (insertion && (insertion.errors.length > 0 || !insertion.value)) {
    draftError(`${path}.audio_insertion`, insertion.errors.join("; "));
  }

  return {
    block_kind: enumValue(record.block_kind, BLOCK_KINDS, `${path}.block_kind`),
    placement: enumValue(record.placement, PLACEMENTS, `${path}.placement`),
    stephanus_span: nonEmptyString(record.stephanus_span, `${path}.stephanus_span`),
    ...(insertion?.value ? { audio_insertion: insertion.value } : {}),
    body: validateCommentaryListenerProse(
      nonEmptyString(record.body, `${path}.body`),
      `${path}.body`,
    ),
    cites: parseCites(record.cites, `${path}.cites`),
    crossrefs: record.crossrefs.map((entry, crossrefIndex) =>
      parseCrossref(entry, `${path}.crossrefs[${crossrefIndex}]`),
    ),
  };
}

export function parseCommentaryUnitDraft(value: unknown, path = "draft"): CommentaryUnitDraft {
  const record = recordValue(value, path);
  exactKeys(record, ["schema_version", "dialogue", "unit_key", "section_id", "authoring", "blocks"], path);
  if (record.schema_version !== 1) draftError(path, "schema_version must be 1");

  const dialogue = nonEmptyString(record.dialogue, "dialogue");
  if (!/^[a-z0-9-]+$/u.test(dialogue)) draftError("dialogue", "must be a canonical lowercase slug");
  const unitKey = nonEmptyString(record.unit_key, "unit_key");
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(unitKey)) draftError("unit_key", "must use lowercase letters, numbers, and hyphens");
  const sectionId = nonEmptyString(record.section_id, "section_id");
  if (!/^comm_[a-z0-9-]+_\d{4}$/u.test(sectionId)) draftError("section_id", "must be a commentary id");

  const authoring = recordValue(record.authoring, "authoring");
  exactKeys(authoring, ["model", "effort"], "authoring");
  if (authoring.model !== COMMENTARY_AUTHORING_MODEL) {
    draftError("authoring", `authoring.model must be ${COMMENTARY_AUTHORING_MODEL}`);
  }
  if (authoring.effort !== COMMENTARY_STAGE_EFFORT.draft) {
    draftError("authoring", `authoring.effort must be ${COMMENTARY_STAGE_EFFORT.draft}`);
  }
  if (!Array.isArray(record.blocks)) draftError("blocks", "must be an array");
  if (record.blocks.length > 3) draftError("blocks", "must contain at most three blocks");

  return {
    schema_version: 1,
    dialogue,
    unit_key: unitKey,
    section_id: sectionId,
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.draft },
    blocks: record.blocks.map(parseBlock),
  };
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function sourceRefLines(ref: SourceRef, indent = "") {
  return [
    `${indent}source_ref:`,
    `${indent}  source_path: ${ref.source_path}`,
    `${indent}  stephanus_span: ${ref.stephanus_span}`,
    `${indent}  start_marker: ${ref.start_marker}`,
    `${indent}  end_marker: ${ref.end_marker}`,
    `${indent}  start_char: ${ref.start_char}`,
    `${indent}  end_char: ${ref.end_char}`,
    `${indent}  text_sha256: ${yamlString(ref.text_sha256)}`,
  ];
}

function yamlList(values: string[]) {
  return `[${values.map(yamlString).join(", ")}]`;
}

function renderCrossrefs(crossrefs: CommentaryDraftCrossref[]) {
  if (crossrefs.length === 0) return ["crossrefs: []"];
  return [
    "crossrefs:",
    ...crossrefs.flatMap((crossref) => {
      const slug = workNameToSlug(crossref.source_work);
      const ref = resolveSourceSpan(slug, crossref.stephanus_span).source_ref;
      return [
        `  - source_work: ${yamlString(crossref.source_work)}`,
        `    stephanus_span: ${ref.stephanus_span}`,
        ...sourceRefLines(ref, "    "),
        ...(crossref.note ? [`    note: ${yamlString(crossref.note)}`] : []),
      ];
    }),
  ];
}

function renderBlock(dialogue: string, sourceWork: string, id: string, block: CommentaryDraftBlock) {
  const ref = resolveSourceSpan(dialogue, block.stephanus_span).source_ref;
  return [
    "```yaml",
    `commentary_id: ${id}`,
    `source_work: ${sourceWork}`,
    `block_kind: ${block.block_kind}`,
    `placement: ${block.placement}`,
    `stephanus_span: ${ref.stephanus_span}`,
    ...sourceRefLines(ref),
    ...(block.audio_insertion ? renderAudioInsertionLines(block.audio_insertion) : []),
    `body: ${yamlString(block.body)}`,
    "cites:",
    `  observations: ${yamlList(block.cites.observations)}`,
    `  claims: ${yamlList(block.cites.claims)}`,
    `  relations: ${yamlList(block.cites.relations)}`,
    `  dossiers: ${yamlList(block.cites.dossiers)}`,
    ...renderCrossrefs(block.crossrefs),
    "author: model",
    "review_status: unreviewed",
    "```",
  ].join("\n");
}

/**
 * Every commentary apply gate — draft, outline, rewrite — writes the same ledger
 * and the same submissions directory. They must therefore lock the same targets,
 * which distinct per-gate labels never did.
 */
export function commentaryApplyLockScope(dialogue: string, label: string) {
  return {
    paths: [`wiki/commentary/${dialogue}.md`, submissionDirectory("commentary", dialogue)],
    label: `${label}:${dialogue}`,
  };
}

function loadDraft(dialogue: string, draftPath: string) {
  if (!/^[a-z0-9-]+$/u.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const normalized = normalizeRepoPath(draftPath);
  const expectedDir = `scratch/commentary/drafts/${dialogue}`;
  if (dirname(normalized.relativePath) !== expectedDir) {
    throw new Error(`Draft path must be inside ${expectedDir}: ${normalized.relativePath}`);
  }
  if (!normalized.relativePath.endsWith(".json")) throw new Error(`Draft path must end in .json: ${normalized.relativePath}`);
  if (!existsSync(normalized.absolutePath)) throw new Error(`Commentary draft does not exist: ${normalized.relativePath}`);

  let value: unknown;
  let content: string;
  try {
    content = readFileSync(normalized.absolutePath, "utf8");
    value = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in commentary draft ${normalized.relativePath}: ${String(error)}`);
  }
  const draft = parseCommentaryUnitDraft(value, normalized.relativePath);
  if (draft.dialogue !== dialogue) {
    throw new Error(`Draft dialogue ${draft.dialogue} does not match requested dialogue ${dialogue}`);
  }
  if (basename(normalized.relativePath) !== `${draft.unit_key}.json`) {
    throw new Error(`Draft filename must match unit_key: expected ${draft.unit_key}.json`);
  }
  return { draft, relativePath: normalized.relativePath, draftSha256: sha256(content) };
}

type DraftImportMarker = {
  dialogue: string;
  unitKey: string;
  draftSha256: string;
  blockIds: string[];
  fullMatch: string;
};

const DRAFT_IMPORT_MARKER =
  /<!-- commentary-draft-import v1 dialogue=([a-z0-9-]+) unit=([a-z0-9][a-z0-9-]*) sha256=([0-9a-f]{64}) block_ids=(none|comm_[a-z0-9_-]+(?:,comm_[a-z0-9_-]+)*) -->/gu;

function draftImportMarkers(content: string): DraftImportMarker[] {
  return [...content.matchAll(DRAFT_IMPORT_MARKER)].map((match) => ({
    dialogue: match[1]!,
    unitKey: match[2]!,
    draftSha256: match[3]!,
    blockIds: match[4] === "none" ? [] : match[4]!.split(","),
    fullMatch: match[0],
  }));
}

function renderDraftImportMarker(
  dialogue: string,
  unitKey: string,
  draftSha256: string,
  blockIds: string[],
) {
  return `<!-- commentary-draft-import v1 dialogue=${dialogue} unit=${unitKey} sha256=${draftSha256} block_ids=${blockIds.length > 0 ? blockIds.join(",") : "none"} -->`;
}

function blockFingerprint(content: string) {
  return content.replace(/^commentary_id: comm_[a-z0-9_-]+\n/u, "");
}

function matchLegacyImportedBlocks(currentLedger: string, renderedBlocks: string) {
  const currentBlocks = commentaryMarkdownBlocks(currentLedger);
  const expectedBlocks = commentaryMarkdownBlocks(renderedBlocks);
  const available = currentBlocks.map((block) => ({
    id: block.commentaryId,
    fingerprint: blockFingerprint(block.content),
    used: false,
  }));
  const matchedIds: string[] = [];
  for (const expected of expectedBlocks) {
    const fingerprint = blockFingerprint(expected.content);
    const match = available.find((candidate) => !candidate.used && candidate.fingerprint === fingerprint);
    if (!match?.id) continue;
    match.used = true;
    matchedIds.push(match.id);
  }
  return { expectedCount: expectedBlocks.length, matchedIds };
}

function appendLedgerContent(currentLedger: string, additions: string[]) {
  const content = additions.filter((addition) => addition.length > 0).join("\n\n");
  if (content.length === 0) return currentLedger;
  const separator = currentLedger.endsWith("\n\n") ? "" : currentLedger.endsWith("\n") ? "\n" : "\n\n";
  return `${currentLedger}${separator}${content}\n`;
}

function validateProspectiveLedger(ledgerPath: string, prospectiveLedger: string) {
  const issues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
}

function buildImport(
  dialogue: string,
  draftPath: string,
  ledgerContent?: string,
): Omit<CommentaryDraftImportResult, "applied"> {
  const repoRoot = getRepoRoot();
  const loaded = loadDraft(dialogue, draftPath);
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const absoluteLedgerPath = join(repoRoot, ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`No commentary ledger for ${dialogue}: ${ledgerPath}`);

  const currentLedger = ledgerContent ?? readFileSync(absoluteLedgerPath, "utf8");
  const currentBlocks = commentaryMarkdownBlocks(currentLedger);
  const section = currentBlocks.find((block) => block.commentaryId === loaded.draft.section_id);
  if (!section || fieldValue(section.content, "block_kind") !== "section") {
    throw new Error(`Draft section_id does not name an existing section block: ${loaded.draft.section_id}`);
  }
  const sectionSpan = fieldValue(section.content, "stephanus_span");
  if (!sectionSpan) throw new Error(`Section ${loaded.draft.section_id} has no stephanus_span`);
  const sectionRef = resolveSourceSpan(dialogue, sectionSpan).source_ref;
  const turns = readFreshCommentaryTurnIndex(dialogue).turns;
  for (const [index, block] of loaded.draft.blocks.entries()) {
    const blockRef = resolveSourceSpan(dialogue, block.stephanus_span).source_ref;
    if (blockRef.start_char < sectionRef.start_char || blockRef.end_char > sectionRef.end_char) {
      throw new Error(`Draft blocks[${index}] anchors outside section ${loaded.draft.section_id}`);
    }
    if (block.audio_insertion) {
      resolveAudioInsertionBoundary(dialogue, block.audio_insertion, block.placement);
    } else {
      const insertionBoundary = block.placement === "before" ? blockRef.start_char : blockRef.end_char;
      const crossing = turns.find(
        (turn) => turn.startChar < insertionBoundary && insertionBoundary < turn.endChar,
      );
      if (crossing) {
        throw new Error(
          `Draft blocks[${index}] ${block.placement} ${block.stephanus_span} insertion boundary at char ${insertionBoundary} splits ${crossing.turnId} (${crossing.startMarker}-${crossing.endMarker}, chars ${crossing.startChar}-${crossing.endChar}); provide an exact audio_insertion bound to the current accepted English attribution or choose a turn-safe marker boundary`,
        );
      }
    }
  }

  const sourceWork = fieldValue(currentBlocks[0]?.content ?? "", "source_work");
  if (!sourceWork) throw new Error(`Commentary ledger for ${dialogue} has no source_work to preserve`);

  const matchingMarkers = draftImportMarkers(currentLedger).filter(
    (marker) => marker.dialogue === dialogue && marker.unitKey === loaded.draft.unit_key,
  );
  if (matchingMarkers.length > 1) {
    throw new Error(`Commentary draft ${dialogue}/${loaded.draft.unit_key} has duplicate import markers`);
  }
  const existingMarker = matchingMarkers[0];
  if (existingMarker) {
    if (existingMarker.draftSha256 !== loaded.draftSha256) {
      throw new Error(
        `Commentary draft ${dialogue}/${loaded.draft.unit_key} was already imported with a different sha256`,
      );
    }
    if (existingMarker.blockIds.length !== loaded.draft.blocks.length) {
      throw new Error(
        `Commentary draft import marker for ${dialogue}/${loaded.draft.unit_key} records ${existingMarker.blockIds.length} block(s), expected ${loaded.draft.blocks.length}`,
      );
    }
    if (new Set(existingMarker.blockIds).size !== existingMarker.blockIds.length) {
      throw new Error(`Commentary draft import marker for ${dialogue}/${loaded.draft.unit_key} contains duplicate block ids`);
    }
    const existingIds = new Set(currentBlocks.map((block) => block.commentaryId).filter((id) => id !== undefined));
    const missingIds = existingMarker.blockIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      throw new Error(
        `Commentary draft import marker for ${dialogue}/${loaded.draft.unit_key} references missing block ids: ${missingIds.join(", ")}`,
      );
    }
    const renderedBlocks = loaded.draft.blocks
      .map((block, index) => renderBlock(dialogue, sourceWork, existingMarker.blockIds[index]!, block))
      .join("\n\n");
    validateProspectiveLedger(ledgerPath, currentLedger);
    return {
      dialogue,
      draftPath: loaded.relativePath,
      ledgerPath,
      unitKey: loaded.draft.unit_key,
      sectionId: loaded.draft.section_id,
      replayed: true,
      draftSha256: loaded.draftSha256,
      blockIds: existingMarker.blockIds,
      importMarker: existingMarker.fullMatch,
      renderedBlocks,
      prospectiveLedger: currentLedger,
    };
  }

  const tentativeBlockIds = loaded.draft.blocks.map(
    (_, index) => `comm_${dialogue}_${String(currentBlocks.length + index + 1).padStart(4, "0")}`,
  );
  const tentativeRenderedBlocks = loaded.draft.blocks
    .map((block, index) => renderBlock(dialogue, sourceWork, tentativeBlockIds[index]!, block))
    .join("\n\n");
  const legacyMatch = matchLegacyImportedBlocks(currentLedger, tentativeRenderedBlocks);
  if (legacyMatch.matchedIds.length > 0 && legacyMatch.matchedIds.length < legacyMatch.expectedCount) {
    throw new Error(
      `Commentary draft ${dialogue}/${loaded.draft.unit_key} partially matches ${legacyMatch.matchedIds.length} of ${legacyMatch.expectedCount} legacy block(s); refusing a mixed replay`,
    );
  }

  const replayed = legacyMatch.expectedCount > 0 && legacyMatch.matchedIds.length === legacyMatch.expectedCount;
  const blockIds = replayed ? legacyMatch.matchedIds : tentativeBlockIds;
  const renderedBlocks = loaded.draft.blocks
    .map((block, index) => renderBlock(dialogue, sourceWork, blockIds[index]!, block))
    .join("\n\n");
  const importMarker = renderDraftImportMarker(
    dialogue,
    loaded.draft.unit_key,
    loaded.draftSha256,
    blockIds,
  );
  const prospectiveLedger = appendLedgerContent(
    currentLedger,
    replayed ? [importMarker] : [importMarker, renderedBlocks],
  );
  validateProspectiveLedger(ledgerPath, prospectiveLedger);

  return {
    dialogue,
    draftPath: loaded.relativePath,
    ledgerPath,
    unitKey: loaded.draft.unit_key,
    sectionId: loaded.draft.section_id,
    replayed,
    draftSha256: loaded.draftSha256,
    blockIds,
    importMarker,
    renderedBlocks,
    prospectiveLedger,
  };
}

export function importCommentaryDraft(options: CommentaryDraftImportOptions): CommentaryDraftImportResult {
  const apply = options.apply ?? false;
  if (!apply) return { ...buildImport(options.dialogue, options.draftPath), applied: false };

  return withRepoWriteLock(commentaryApplyLockScope(options.dialogue, "commentary-draft"), () => {
    const result = buildImport(options.dialogue, options.draftPath);
    const absoluteLedgerPath = join(getRepoRoot(), result.ledgerPath);
    const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
    if (result.prospectiveLedger !== currentLedger) {
      atomicWrite(absoluteLedgerPath, result.prospectiveLedger);
    }
    recordSubmission({
      lane: "commentary",
      kind: "draft",
      scope: options.dialogue,
      unitKey: result.unitKey,
      sourcePath: result.draftPath,
      targetPath: result.ledgerPath,
      targetContentBefore: currentLedger,
      targetContentAfter: result.prospectiveLedger,
      appliedIds: result.blockIds,
      submission: loadDraft(options.dialogue, result.draftPath).draft,
    });
    return { ...result, applied: true };
  });
}

function buildBatchImport(
  dialogue: string,
  draftPaths: string[],
): Omit<CommentaryDraftBatchImportResult, "applied"> {
  if (draftPaths.length === 0) throw new Error("Commentary draft batch must contain at least one draft path");
  const orderedPaths = draftPaths
    .map((draftPath) => normalizeRepoPath(draftPath).relativePath)
    .sort((left, right) => left.localeCompare(right));
  if (new Set(orderedPaths).size !== orderedPaths.length) {
    throw new Error("Commentary draft batch contains duplicate or aliased draft paths");
  }

  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  if (!existsSync(absoluteLedgerPath)) throw new Error(`No commentary ledger for ${dialogue}: ${ledgerPath}`);
  let prospectiveLedger = readFileSync(absoluteLedgerPath, "utf8");
  const imports: CommentaryDraftImportResult[] = [];
  for (const draftPath of orderedPaths) {
    const result = buildImport(dialogue, draftPath, prospectiveLedger);
    prospectiveLedger = result.prospectiveLedger;
    imports.push({ ...result, applied: false });
  }
  return { dialogue, ledgerPath, imports, prospectiveLedger };
}

export function importCommentaryDraftBatch(
  options: CommentaryDraftBatchImportOptions,
): CommentaryDraftBatchImportResult {
  const apply = options.apply ?? false;
  if (!apply) return { ...buildBatchImport(options.dialogue, options.draftPaths), applied: false };

  return withRepoWriteLock(commentaryApplyLockScope(options.dialogue, "commentary-draft-batch"), () => {
    const result = buildBatchImport(options.dialogue, options.draftPaths);
    const currentLedger = readFileSync(join(getRepoRoot(), result.ledgerPath), "utf8");
    if (result.prospectiveLedger !== currentLedger) {
      atomicWrite(join(getRepoRoot(), result.ledgerPath), result.prospectiveLedger);
    }
    let before = currentLedger;
    for (const entry of result.imports) {
      recordSubmission({
        lane: "commentary",
        kind: "draft",
        scope: options.dialogue,
        unitKey: entry.unitKey,
        sourcePath: entry.draftPath,
        targetPath: result.ledgerPath,
        targetContentBefore: before,
        targetContentAfter: entry.prospectiveLedger,
        appliedIds: entry.blockIds,
        submission: loadDraft(options.dialogue, entry.draftPath).draft,
      });
      before = entry.prospectiveLedger;
    }
    return {
      ...result,
      imports: result.imports.map((entry) => ({ ...entry, applied: true })),
      applied: true,
    };
  });
}

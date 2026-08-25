#!/usr/bin/env bun

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  buildCommentaryAuditBriefs,
  parseCommentaryQualityAudit,
  type CommentaryAuditBrief,
} from "../../packages/harness/src/commentary-audit.js";
import { buildCommentaryCampaignPlan, type CommentaryCampaignJob } from "../../packages/harness/src/commentary-campaign.js";
import {
  applyCommentaryStructuralRemediation,
  previewCommentaryStructuralRemediation,
  type CommentaryStructuralRemediationInput,
} from "../../packages/harness/src/wiki/commentary-structural-remediation.js";
import { isDelegatedLunaReviewer } from "../../packages/harness/src/wiki/commentary-quality-audit.js";
import { getRepoRoot } from "../../packages/harness/src/paths.js";

const DIALOGUE = /^[a-z0-9-]+$/u;
const UNIT_KEY = /^[a-z0-9][a-z0-9-]*$/u;

export type StructuralRemediationBatchOptions = {
  dialogues: readonly string[];
  maxUnits?: number;
  reviewer: string;
  reviewedOn: string;
  rationale: string;
  execute?: boolean;
};

export type StructuralRemediationBatchCandidate = {
  candidatePath: string;
  input: CommentaryStructuralRemediationInput;
  sectionOrder: number;
};

export type StructuralRemediationBatchResult = {
  applied: boolean;
  candidates: StructuralRemediationBatchCandidate[];
  appliedCandidates: string[];
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function currentSourceHashes(dialogue: string) {
  const attributionPath = `audio/speaker-attributions/${dialogue}.json`;
  const englishPath = `raw/plato/english/${dialogue}.txt`;
  const attribution = join(getRepoRoot(), attributionPath);
  const english = join(getRepoRoot(), englishPath);
  if (!existsSync(attribution) || !existsSync(english)) {
    throw new Error(`Missing current source bindings for ${dialogue}`);
  }
  return {
    attributionSha256: sha256(readFileSync(attribution)),
    englishSha256: sha256(readFileSync(english)),
  };
}

function currentLedger(dialogue: string) {
  const path = `wiki/commentary/${dialogue}.md`;
  const absolute = join(getRepoRoot(), path);
  if (!existsSync(absolute)) throw new Error(`Missing current commentary ledger ${path}`);
  const content = readFileSync(absolute, "utf8");
  return { path, content, sha256: sha256(content) };
}

function auditOutputPath(dialogue: string, unitKey: string) {
  return `scratch/commentary/audits/${dialogue}/${unitKey}.json`;
}

function loadCurrentAudit(dialogue: string, brief: CommentaryAuditBrief, job: CommentaryCampaignJob) {
  const outputPath = auditOutputPath(dialogue, brief.unitKey);
  if (job.stage !== "audit" || job.output_path !== outputPath || job.audit_brief_sha256 !== brief.sha256) {
    throw new Error(`Noncurrent audit job binding for ${dialogue}/${brief.unitKey}`);
  }
  const absolute = join(getRepoRoot(), outputPath);
  if (!existsSync(absolute)) throw new Error(`Missing current audit output ${outputPath}`);
  const content = readFileSync(absolute);
  let value: unknown;
  try {
    value = JSON.parse(content.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed audit output ${outputPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const audit = parseCommentaryQualityAudit(value, {
    path: outputPath,
    expectedCommentaryIds: brief.commentaryIds,
  });
  if (audit.dialogue !== dialogue || audit.unit_key !== brief.unitKey || audit.section_id !== brief.sectionId) {
    throw new Error(`Noncurrent audit output identity: ${outputPath}`);
  }
  const stateAbsolute = join(getRepoRoot(), job.state_path);
  if (!existsSync(stateAbsolute)) throw new Error(`Missing current audit state ${job.state_path}`);
  let state: unknown;
  try {
    state = JSON.parse(readFileSync(stateAbsolute, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Malformed current audit state ${job.state_path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (
    typeof state !== "object" || state === null || Array.isArray(state) ||
    (state as Record<string, unknown>).input_sha256 !== job.input_sha256 ||
    (state as Record<string, unknown>).output_sha256 !== sha256(content)
  ) {
    throw new Error(`Noncurrent audit state binding: ${job.state_path}`);
  }
  return { outputPath, content, outputSha256: sha256(content), audit };
}

function assertNoUnexpectedAuditOutputs(dialogue: string, briefs: readonly CommentaryAuditBrief[]) {
  const directory = join(getRepoRoot(), `scratch/commentary/audits/${dialogue}`);
  if (!existsSync(directory)) return;
  const expected = new Set(briefs.map((brief) => `${brief.unitKey}.json`));
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    if (!expected.has(entry.name)) {
      throw new Error(`Noncurrent audit output in selected dialogue: scratch/commentary/audits/${dialogue}/${entry.name}`);
    }
  }
}

export function planStructuralOperations(
  brief: Pick<CommentaryAuditBrief, "commentaryIds">,
  audit: Pick<ReturnType<typeof parseCommentaryQualityAudit>, "blocks">,
) {
  const byId = new Map(audit.blocks.map((block) => [block.commentary_id, block]));
  return brief.commentaryIds.flatMap((commentaryId) => {
    const block = byId.get(commentaryId);
    if (!block) throw new Error(`Current audit is missing ${commentaryId} in ${brief.path}`);
    if (block.disposition === "remove") return [{ operation: "remove" as const, commentaryId }];
    if (block.disposition === "split") {
      return [{ operation: "remove" as const, commentaryId, splitResolution: "reject-original" as const }];
    }
    return [];
  });
}

function candidatePath(dialogue: string, unitKey: string) {
  return `scratch/commentary/structural-remediation/${dialogue}/${unitKey}.json`;
}

function candidateFor(dialogue: string, brief: CommentaryAuditBrief, job: CommentaryCampaignJob, reviewer: string, reviewedOn: string, rationale: string) {
  const audit = loadCurrentAudit(dialogue, brief, job);
  const operations = planStructuralOperations(brief, audit.audit);
  if (operations.length === 0) return undefined;
  const ledger = currentLedger(dialogue);
  const sources = currentSourceHashes(dialogue);
  const input: CommentaryStructuralRemediationInput = {
    dialogue,
    unitKey: brief.unitKey,
    sectionId: brief.sectionId,
    auditOutputPath: audit.outputPath,
    auditOutputSha256: audit.outputSha256,
    expectedLedgerSha256: ledger.sha256,
    expectedAttributionSha256: sources.attributionSha256,
    expectedEnglishSha256: sources.englishSha256,
    operations,
    reviewer,
    reviewedOn,
    rationale,
  };
  // Preview is deliberately part of planning: malformed, stale, or otherwise
  // unapplicable findings never become candidate files.
  const preview = previewCommentaryStructuralRemediation(input);
  if (existsSync(join(getRepoRoot(), preview.receiptPath))) {
    throw new Error(`Existing structural-remediation receipt collision: ${preview.receiptPath}`);
  }
  return {
    candidatePath: candidatePath(dialogue, brief.unitKey),
    input,
    sectionOrder: Number(brief.unitKey.split("-")[0]),
  } satisfies StructuralRemediationBatchCandidate;
}

export function planStructuralRemediationBatch(options: Omit<StructuralRemediationBatchOptions, "execute">) {
  if (options.dialogues.length === 0) throw new Error("At least one --dialogue is required");
  if (new Set(options.dialogues).size !== options.dialogues.length) throw new Error("Duplicate --dialogue selection");
  for (const dialogue of options.dialogues) {
    if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  }
  if (!isDelegatedLunaReviewer(options.reviewer)) throw new Error("reviewer must identify an operator-delegated Luna reviewer");
  if (!options.reviewedOn || !options.rationale) throw new Error("reviewedOn and rationale are required");
  if (options.maxUnits !== undefined && (!Number.isInteger(options.maxUnits) || options.maxUnits < 1)) {
    throw new Error("maxUnits must be a positive integer");
  }

  const candidates: StructuralRemediationBatchCandidate[] = [];
  for (const dialogue of options.dialogues) {
    const briefs = buildCommentaryAuditBriefs(dialogue);
    const jobs = buildCommentaryCampaignPlan({ dialogue, stage: "audit" }).manifest.jobs;
    const jobsByUnit = new Map(jobs.map((job) => [job.unit_key ?? "", job]));
    if (briefs.length === 0) throw new Error(`No current commentary audit units for ${dialogue}`);
    assertNoUnexpectedAuditOutputs(dialogue, briefs);
    for (const [sectionOrder, brief] of briefs.entries()) {
      const job = jobsByUnit.get(brief.unitKey);
      if (!job) throw new Error(`Missing current audit job for ${dialogue}/${brief.unitKey}`);
      const candidate = candidateFor(dialogue, brief, job, options.reviewer, options.reviewedOn, options.rationale);
      if (candidate) candidates.push({ ...candidate, sectionOrder });
    }
  }
  if (options.maxUnits !== undefined && candidates.length > options.maxUnits) {
    candidates.splice(options.maxUnits);
  }
  if (candidates.length === 0) throw new Error("Structural remediation selection is empty");
  return candidates;
}

function writeCandidate(candidate: StructuralRemediationBatchCandidate) {
  const absolute = join(getRepoRoot(), candidate.candidatePath);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(candidate.input, null, 2)}\n`, "utf8");
}

function refreshCandidate(candidate: StructuralRemediationBatchCandidate) {
  const ledger = currentLedger(candidate.input.dialogue);
  const sources = currentSourceHashes(candidate.input.dialogue);
  return {
    ...candidate,
    input: {
      ...candidate.input,
      expectedLedgerSha256: ledger.sha256,
      expectedAttributionSha256: sources.attributionSha256,
      expectedEnglishSha256: sources.englishSha256,
    },
  } satisfies StructuralRemediationBatchCandidate;
}

export function runStructuralRemediationBatch(options: StructuralRemediationBatchOptions): StructuralRemediationBatchResult {
  const planned = planStructuralRemediationBatch(options);
  for (const candidate of planned) writeCandidate(candidate);
  if (!options.execute) return { applied: false, candidates: planned, appliedCandidates: [] };

  // Reverse section order keeps earlier unit keys stable when applying a
  // terminal rejection removes a section from the active ledger.
  const executionOrder = [...planned].sort((a, b) =>
    a.input.dialogue.localeCompare(b.input.dialogue) || b.sectionOrder - a.sectionOrder,
  );
  const appliedCandidates: string[] = [];
  for (const original of executionOrder) {
    const candidate = refreshCandidate(original);
    writeCandidate(candidate);
    applyCommentaryStructuralRemediation(candidate.input);
    appliedCandidates.push(candidate.candidatePath);
  }
  return { applied: true, candidates: planned, appliedCandidates };
}

function valueAfter(args: string[], flag: string) {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function parseArgs(args: string[]): StructuralRemediationBatchOptions {
  const dialogues: string[] = [];
  let execute = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === "--execute") {
      if (execute) throw new Error("Duplicate option: --execute");
      execute = true;
    } else if (argument === "--dialogue") {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("--dialogue requires a value");
      dialogues.push(value);
    } else if (["--max-units", "--reviewer", "--reviewed-on", "--rationale"].includes(argument)) {
      index += 1;
      if (!args[index] || args[index]!.startsWith("--")) throw new Error(`${argument} requires a value`);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  const maxUnits = valueAfter(args, "--max-units");
  const parsedMaxUnits = maxUnits === undefined ? undefined : Number(maxUnits);
  if (maxUnits !== undefined && (!Number.isInteger(parsedMaxUnits) || parsedMaxUnits < 1)) {
    throw new Error("--max-units must be a positive integer");
  }
  const reviewer = valueAfter(args, "--reviewer");
  const reviewedOn = valueAfter(args, "--reviewed-on");
  const rationale = valueAfter(args, "--rationale");
  if (!reviewer || !reviewedOn || !rationale) {
    throw new Error("--reviewer, --reviewed-on, and --rationale are required");
  }
  return { dialogues, ...(parsedMaxUnits === undefined ? {} : { maxUnits: parsedMaxUnits }), reviewer, reviewedOn, rationale, execute };
}

function usage(): never {
  throw new Error(
    "Usage: bun scripts/commentary/structural-remediation-batch.ts [--dialogue <slug>]... [--max-units <n>] --reviewer <operator-delegated-luna-reviewer-id> --reviewed-on <YYYY-MM-DD> --rationale <text> [--execute]",
  );
}

export async function main(args = process.argv.slice(2)) {
  if (args.length === 0) usage();
  const result = runStructuralRemediationBatch(parseArgs(args));
  process.stdout.write(`${JSON.stringify({
    applied: result.applied,
    candidates: result.candidates.map((candidate) => candidate.candidatePath),
    applied_candidates: result.appliedCandidates,
    next: result.applied ? "Run bun run validate after the audit units are refreshed." : "Preview only; rerun with --execute to apply sequentially.",
  }, null, 2)}\n`);
}

if (import.meta.main) await main();

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  buildCommentaryAuditEvidenceSnapshot,
  buildCommentaryAuditBriefs,
  parseCommentaryQualityAudit,
  type CommentaryAuditEvidenceSnapshot,
  type CommentaryQualityAudit,
} from "../commentary-audit.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_JOB_STATE_SCHEMA_VERSION,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "../commentary-authoring.js";
import {
  buildCommentaryCampaignPlan,
  createReusableCanonicalAuditOutputResolver,
  reusableCanonicalAuditOutput,
  type CommentaryCampaignJob,
  type ReusableCanonicalAuditOutputResolver,
} from "../commentary-campaign.js";
import { withRepoWriteLock } from "../file-lock.js";
import { getRepoRoot } from "../paths.js";
import { commentaryMarkdownBlocks } from "./commentary-ledger.js";
import { fieldValue } from "./observation-ledger.js";
import { validateCommentaryLedger } from "./commentary-validator.js";
import { validateAcceptedCommentaryQualityAuditProvenance } from "./commentary-quality-audit-provenance.js";
import {
  readCurrentCommentaryDelegatedAudit,
  validateCommentaryDelegatedAuditSubmission,
} from "./commentary-delegated-audit.js";

export {
  COMMENTARY_QUALITY_AUDIT_NO_HUMAN_LISTENING,
  COMMENTARY_QUALITY_AUDIT_REVIEW_BASIS,
  containsHumanListeningOrReviewClaim,
  isDelegatedLunaReviewer,
} from "./commentary-quality-audit-provenance.js";

const SCHEMA_VERSION = 1 as const;
const SHA256 = /^[a-f0-9]{64}$/u;
const DIALOGUE = /^[a-z0-9-]+$/u;

export type CommentaryQualityAuditAcceptance =
  | {
      decision: "pending";
      reviewer: null;
      reviewed_on: null;
      rationale: null;
      sampled_commentary_ids: [];
      review_note: null;
    }
  | {
      decision: "accepted";
      reviewer: string;
      reviewed_on: string;
      rationale: string;
      sampled_commentary_ids: string[];
      review_note: { path: string; sha256: string };
    };

export type CommentaryQualityAuditManifestUnit = {
  unit_key: string;
  section_id: string;
  audit_brief_sha256: string;
  output_path: string;
  output_sha256: string;
  output: CommentaryQualityAudit;
  provenance?: { path: string; sha256: string };
};

export type CommentaryQualityAuditManifest = {
  schema_version: 1;
  dialogue: string;
  ledger: { path: string; sha256: string };
  protocol: { path: "docs/commentary-protocol.md"; sha256: string };
  authoring: {
    model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: (typeof COMMENTARY_STAGE_EFFORT)["audit"];
  };
  units: CommentaryQualityAuditManifestUnit[];
  acceptance: CommentaryQualityAuditAcceptance;
};

export type CommentaryQualityAuditManifestIssue = {
  code:
    | "malformed_json"
    | "invalid_manifest_path"
    | "invalid_manifest_shape"
    | "unknown_field"
    | "invalid_schema_version"
    | "dialogue_mismatch"
    | "invalid_authoring"
    | "invalid_hash"
    | "missing_dependency"
    | "ledger_hash_mismatch"
    | "protocol_hash_mismatch"
    | "ledger_not_accepted"
    | "ledger_validation_failure"
    | "audit_brief_mismatch"
    | "unit_coverage_mismatch"
    | "audit_output_path_mismatch"
    | "audit_output_hash_mismatch"
    | "invalid_audit_output"
    | "audit_output_failed"
    | "commentary_id_coverage_mismatch"
    | "invalid_acceptance"
    | "invalid_acceptance_sample"
    | "invalid_review_note"
    | "review_note_hash_mismatch";
  path: string;
  message: string;
};

export type WrittenCommentaryQualityAuditManifestPreview = {
  path: string;
  manifest: CommentaryQualityAuditManifest;
};

type InspectedManifest = {
  manifest?: CommentaryQualityAuditManifest;
  issues: CommentaryQualityAuditManifestIssue[];
};

const TOP_LEVEL_FIELDS = new Set([
  "schema_version",
  "dialogue",
  "ledger",
  "protocol",
  "authoring",
  "units",
  "acceptance",
]);
const RESOURCE_FIELDS = new Set(["path", "sha256"]);
const AUTHORING_FIELDS = new Set(["model", "effort"]);
const UNIT_FIELDS = new Set([
  "unit_key",
  "section_id",
  "audit_brief_sha256",
  "output_path",
  "output_sha256",
  "output",
  "provenance",
]);
const ACCEPTANCE_FIELDS = new Set([
  "decision",
  "reviewer",
  "reviewed_on",
  "rationale",
  "sampled_commentary_ids",
  "review_note",
]);
const REVIEW_NOTE_FIELDS = new Set(["path", "sha256"]);
const JOB_STATE_FIELDS = new Set([
  "schema_version",
  "job_id",
  "stage",
  "input_sha256",
  "output_schema_sha256",
  "model_argument",
  "codex_cli_version",
  "model_catalog_path",
  "model_catalog_sha256",
  "authoring_model",
  "effort",
  "permission_mode",
  "output_path",
  "output_sha256",
]);

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function addIssue(
  issues: CommentaryQualityAuditManifestIssue[],
  path: string,
  code: CommentaryQualityAuditManifestIssue["code"],
  message: string,
) {
  issues.push({ code, path, message });
}

function unknownFields(
  value: Record<string, unknown>,
  allowed: Set<string>,
  location: string,
  path: string,
  issues: CommentaryQualityAuditManifestIssue[],
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) addIssue(issues, path, "unknown_field", `${location} contains unknown field \`${key}\`.`);
  }
}

function resourceValue(
  value: unknown,
  field: "ledger" | "protocol",
  path: string,
  issues: CommentaryQualityAuditManifestIssue[],
) {
  if (!isRecord(value)) {
    addIssue(issues, path, "invalid_manifest_shape", `\`${field}\` must be an object.`);
    return undefined;
  }
  unknownFields(value, RESOURCE_FIELDS, field, path, issues);
  if (!nonEmptyString(value.path) || !nonEmptyString(value.sha256)) {
    addIssue(issues, path, "invalid_manifest_shape", `\`${field}\` requires non-empty path and sha256 fields.`);
    return undefined;
  }
  return { path: value.path, sha256: value.sha256 };
}

function inspectCommentaryQualityAuditManifest(path: string, content: string): InspectedManifest {
  const issues: CommentaryQualityAuditManifestIssue[] = [];
  let value: unknown;
  try {
    value = JSON.parse(content) as unknown;
  } catch (error) {
    addIssue(
      issues,
      path,
      "malformed_json",
      `Malformed JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { issues };
  }
  if (!isRecord(value)) {
    addIssue(issues, path, "invalid_manifest_shape", "Commentary quality-audit manifest must be a JSON object.");
    return { issues };
  }
  unknownFields(value, TOP_LEVEL_FIELDS, "manifest", path, issues);
  if (typeof value.schema_version !== "number" || !nonEmptyString(value.dialogue)) {
    addIssue(issues, path, "invalid_manifest_shape", "Manifest requires numeric schema_version and a non-empty dialogue.");
    return { issues };
  }
  const ledger = resourceValue(value.ledger, "ledger", path, issues);
  const protocol = resourceValue(value.protocol, "protocol", path, issues);
  if (!isRecord(value.authoring)) {
    addIssue(issues, path, "invalid_manifest_shape", "`authoring` must be an object.");
    return { issues };
  }
  unknownFields(value.authoring, AUTHORING_FIELDS, "authoring", path, issues);
  if (!nonEmptyString(value.authoring.model) || !nonEmptyString(value.authoring.effort)) {
    addIssue(issues, path, "invalid_manifest_shape", "`authoring` requires non-empty model and effort fields.");
    return { issues };
  }
  if (!Array.isArray(value.units) || value.units.length === 0) {
    addIssue(issues, path, "invalid_manifest_shape", "`units` must be a non-empty array.");
    return { issues };
  }
  const units: CommentaryQualityAuditManifestUnit[] = [];
  for (const [index, entry] of value.units.entries()) {
    if (!isRecord(entry)) {
      addIssue(issues, path, "invalid_manifest_shape", `units[${index}] must be an object.`);
      continue;
    }
    unknownFields(entry, UNIT_FIELDS, `units[${index}]`, path, issues);
    if (
      !nonEmptyString(entry.unit_key) ||
      !nonEmptyString(entry.section_id) ||
      !nonEmptyString(entry.audit_brief_sha256) ||
      !nonEmptyString(entry.output_path) ||
      !nonEmptyString(entry.output_sha256) ||
      !isRecord(entry.output)
    ) {
      addIssue(issues, path, "invalid_manifest_shape", `units[${index}] has missing or invalid required fields.`);
      continue;
    }
   const provenance = entry.provenance === undefined ? undefined : (() => {
     if (!isRecord(entry.provenance) || !nonEmptyString(entry.provenance.path) || !nonEmptyString(entry.provenance.sha256)) {
       addIssue(issues, path, "invalid_manifest_shape", `units[${index}].provenance must contain path and sha256.`);
       return undefined;
     }
     unknownFields(entry.provenance, new Set(["path", "sha256"]), `units[${index}].provenance`, path, issues);
     return { path: entry.provenance.path, sha256: entry.provenance.sha256 };
   })();
   units.push({
     unit_key: entry.unit_key,
     section_id: entry.section_id,
     audit_brief_sha256: entry.audit_brief_sha256,
     output_path: entry.output_path,
     output_sha256: entry.output_sha256,
     output: entry.output as CommentaryQualityAudit,
     ...(provenance ? { provenance } : {}),
   });
  }
  if (!isRecord(value.acceptance)) {
    addIssue(issues, path, "invalid_manifest_shape", "`acceptance` must be an object.");
    return { issues };
  }
  unknownFields(value.acceptance, ACCEPTANCE_FIELDS, "acceptance", path, issues);
  const decision = value.acceptance.decision;
  const reviewer = value.acceptance.reviewer;
  const reviewedOn = value.acceptance.reviewed_on;
  const rationale = value.acceptance.rationale;
  const sampledCommentaryIds = value.acceptance.sampled_commentary_ids;
  const reviewNoteValue = value.acceptance.review_note;
  if (decision !== "pending" && decision !== "accepted") {
    addIssue(issues, path, "invalid_manifest_shape", "acceptance.decision must be pending or accepted.");
    return { issues };
  }
  if (
    (reviewer !== null && typeof reviewer !== "string") ||
    (reviewedOn !== null && typeof reviewedOn !== "string") ||
    (rationale !== null && typeof rationale !== "string") ||
    !Array.isArray(sampledCommentaryIds) ||
    sampledCommentaryIds.some((id) => typeof id !== "string")
  ) {
    addIssue(issues, path, "invalid_manifest_shape", "acceptance fields have invalid types.");
    return { issues };
  }
  let reviewNote: { path: string; sha256: string } | null = null;
  if (reviewNoteValue !== null) {
    if (!isRecord(reviewNoteValue)) {
      addIssue(issues, path, "invalid_manifest_shape", "acceptance.review_note must be an object or null.");
      return { issues };
    }
    unknownFields(reviewNoteValue, REVIEW_NOTE_FIELDS, "acceptance.review_note", path, issues);
    if (!nonEmptyString(reviewNoteValue.path) || !nonEmptyString(reviewNoteValue.sha256)) {
      addIssue(issues, path, "invalid_manifest_shape", "acceptance.review_note requires non-empty path and sha256 fields.");
      return { issues };
    }
    reviewNote = { path: reviewNoteValue.path, sha256: reviewNoteValue.sha256 };
  }
  const acceptance = {
    decision,
    reviewer,
    reviewed_on: reviewedOn,
    rationale,
    sampled_commentary_ids: sampledCommentaryIds as string[],
    review_note: reviewNote,
  } as CommentaryQualityAuditAcceptance;
  if (!ledger || !protocol || units.length !== value.units.length) return { issues };
  return {
    manifest: {
      schema_version: value.schema_version as 1,
      dialogue: value.dialogue,
      ledger,
      protocol: protocol as CommentaryQualityAuditManifest["protocol"],
      authoring: value.authoring as CommentaryQualityAuditManifest["authoring"],
      units,
      acceptance,
    },
    issues,
  };
}

function validateCommentaryQualityAuditManifestWithEvidence(
  path: string,
  content: string,
  evidence?: CommentaryAuditEvidenceSnapshot,
) {
  const inspected = inspectCommentaryQualityAuditManifest(path, content);
  const { issues, manifest } = inspected;
  if (!manifest) return issues;

  const fileDialogue = /^wiki\/commentary-audits\/([a-z0-9-]+)\.json$/u.exec(path)?.[1];
  if (!fileDialogue) {
    addIssue(issues, path, "invalid_manifest_path", "Manifest path must match wiki/commentary-audits/<dialogue>.json.");
  } else if (manifest.dialogue !== fileDialogue) {
    addIssue(
      issues,
      path,
      "dialogue_mismatch",
      `Manifest dialogue \`${manifest.dialogue}\` does not match filename dialogue \`${fileDialogue}\`.`,
    );
  }
  if (manifest.schema_version !== SCHEMA_VERSION) {
    addIssue(issues, path, "invalid_schema_version", `Unsupported schema_version \`${manifest.schema_version}\`; expected 1.`);
  }
  if (!DIALOGUE.test(manifest.dialogue)) {
    addIssue(issues, path, "dialogue_mismatch", "dialogue must be a canonical lowercase slug.");
  }
  if (
    manifest.authoring.model !== COMMENTARY_AUTHORING_MODEL ||
    manifest.authoring.effort !== COMMENTARY_STAGE_EFFORT.audit
  ) {
    addIssue(
      issues,
      path,
      "invalid_authoring",
      `authoring must record model ${COMMENTARY_AUTHORING_MODEL} and effort ${COMMENTARY_STAGE_EFFORT.audit}.`,
    );
  }
  for (const [label, digest] of [
    ["ledger.sha256", manifest.ledger.sha256],
    ["protocol.sha256", manifest.protocol.sha256],
    ...manifest.units.flatMap((unit, index) => [
      [`units[${index}].audit_brief_sha256`, unit.audit_brief_sha256],
      [`units[${index}].output_sha256`, unit.output_sha256],
    ]),
  ] as Array<[string, string]>) {
    if (!SHA256.test(digest)) addIssue(issues, path, "invalid_hash", `${label} must be a lowercase SHA-256 digest.`);
  }

  const expectedLedgerPath = `wiki/commentary/${manifest.dialogue}.md`;
  const protocolPath = "docs/commentary-protocol.md" as const;
  if (manifest.ledger.path !== expectedLedgerPath) {
    addIssue(issues, path, "ledger_hash_mismatch", `ledger.path must be ${expectedLedgerPath}.`);
  }
  if (manifest.protocol.path !== protocolPath) {
    addIssue(issues, path, "protocol_hash_mismatch", `protocol.path must be ${protocolPath}.`);
  }
  const ledgerAbsolutePath = join(getRepoRoot(), expectedLedgerPath);
  const protocolAbsolutePath = join(getRepoRoot(), protocolPath);
  if (!existsSync(ledgerAbsolutePath)) addIssue(issues, path, "missing_dependency", `Missing ${expectedLedgerPath}.`);
  if (!existsSync(protocolAbsolutePath)) addIssue(issues, path, "missing_dependency", `Missing ${protocolPath}.`);

  let ledgerIds: string[] = [];
  if (existsSync(ledgerAbsolutePath)) {
    const ledgerContent = readFileSync(ledgerAbsolutePath, "utf8");
    if (sha256(ledgerContent) !== manifest.ledger.sha256) {
      addIssue(issues, path, "ledger_hash_mismatch", `ledger.sha256 does not match the exact bytes of ${expectedLedgerPath}.`);
    }
    try {
      const ledgerIssues = validateCommentaryLedger(expectedLedgerPath, ledgerContent);
      if (ledgerIssues.length > 0) {
        addIssue(
          issues,
          path,
          "ledger_validation_failure",
          `${expectedLedgerPath} has ${ledgerIssues.length} validation issue(s).`,
        );
      }
      const blocks = commentaryMarkdownBlocks(ledgerContent);
      const acceptedBlocks = blocks.filter((block) => fieldValue(block.content, "review_status") === "accepted");
      const pendingBlocks = blocks.filter((block) => {
        const status = fieldValue(block.content, "review_status");
        return status !== "accepted" && status !== "rejected";
      });
      ledgerIds = acceptedBlocks.map((block) => fieldValue(block.content, "commentary_id") ?? "");
      if (acceptedBlocks.length === 0 || pendingBlocks.length > 0) {
        addIssue(
          issues,
          path,
          "ledger_not_accepted",
          `Quality acceptance requires at least one accepted commentary block and no active pending blocks; ${pendingBlocks.length} block(s) remain pending. Rejected blocks are terminal and excluded from the auditable set.`,
        );
      }
    } catch (error) {
      addIssue(
        issues,
        path,
        "ledger_validation_failure",
        `${expectedLedgerPath} could not be validated: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (existsSync(protocolAbsolutePath) && sha256(readFileSync(protocolAbsolutePath)) !== manifest.protocol.sha256) {
    addIssue(issues, path, "protocol_hash_mismatch", `protocol.sha256 does not match the exact bytes of ${protocolPath}.`);
  }

  let expectedBriefs: ReturnType<typeof buildCommentaryAuditBriefs> = [];
  try {
    expectedBriefs = buildCommentaryAuditBriefs(
      manifest.dialogue,
      evidence ?? buildCommentaryAuditEvidenceSnapshot(),
    );
  } catch (error) {
    addIssue(
      issues,
      path,
      "missing_dependency",
      `Could not rebuild deterministic audit briefs: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (expectedBriefs.length === 0 || manifest.units.length !== expectedBriefs.length) {
    addIssue(
      issues,
      path,
      "unit_coverage_mismatch",
      `Manifest has ${manifest.units.length} unit(s); current ledger requires ${expectedBriefs.length}.`,
    );
  }

  const currentAuditJobs = new Map<string, CommentaryCampaignJob>();
  try {
    const currentPlan = buildCommentaryCampaignPlan({ dialogue: manifest.dialogue, stage: "audit" });
    for (const job of currentPlan.manifest.jobs) {
      if (job.stage === "audit" && job.unit_key) currentAuditJobs.set(job.unit_key, job);
    }
  } catch (error) {
    if (manifest.units.some((unit) => unit.provenance !== undefined)) {
      addIssue(
        issues,
        path,
        "missing_dependency",
        `Could not rebuild current audit jobs for delegated provenance: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const auditedIds: string[] = [];
  const seenUnits = new Set<string>();
  for (const [index, unit] of manifest.units.entries()) {
    if (seenUnits.has(unit.unit_key)) {
      addIssue(issues, path, "unit_coverage_mismatch", `Duplicate unit_key \`${unit.unit_key}\`.`);
    }
    seenUnits.add(unit.unit_key);
    const expected = expectedBriefs[index];
    if (!expected || unit.unit_key !== expected.unitKey || unit.section_id !== expected.sectionId) {
      addIssue(issues, path, "unit_coverage_mismatch", `units[${index}] does not match the current section order and identity.`);
      continue;
    }
    if (unit.audit_brief_sha256 !== expected.sha256) {
      addIssue(issues, path, "audit_brief_mismatch", `units[${index}].audit_brief_sha256 is stale.`);
    }
    const expectedOutputPath = `scratch/commentary/audits/${manifest.dialogue}/${expected.unitKey}.json`;
    if (unit.output_path !== expectedOutputPath) {
      addIssue(issues, path, "audit_output_path_mismatch", `units[${index}].output_path must be ${expectedOutputPath}.`);
    }
    if (unit.provenance) {
      const provenancePath = unit.provenance.path;
      const currentJob = currentAuditJobs.get(expected.unitKey);
      if (!currentJob) {
        addIssue(issues, path, "missing_dependency", `No current audit job exists to validate delegated provenance for ${expected.unitKey}.`);
      } else {
        try {
          const delegated = validateCommentaryDelegatedAuditSubmission({ recordPath: provenancePath, job: currentJob });
          if (
            delegated.manifestPath !== provenancePath ||
            delegated.recordSha256 !== unit.provenance.sha256 ||
            delegated.outputSha256 !== unit.output_sha256
          ) {
            addIssue(issues, path, "invalid_manifest_shape", `units[${index}].provenance does not bind this unit's durable delegated output.`);
          }
        } catch (error) {
          addIssue(
            issues,
            path,
            "invalid_manifest_shape",
            `units[${index}].provenance is not a current full delegated submission: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } else {
      const currentJob = currentAuditJobs.get(expected.unitKey);
      if (currentJob) {
        try {
          const delegated = readCurrentCommentaryDelegatedAudit(currentJob);
          if (delegated && delegated.outputSha256 === unit.output_sha256) {
            addIssue(
              issues,
              path,
              "invalid_manifest_shape",
              `units[${index}] is backed by a delegated durable output and must carry its provenance pointer.`,
            );
          }
        } catch {
          // A malformed delegated receipt is reported by the dedicated import
          // path; absence of a valid receipt leaves this unit runner-bound.
        }
      }
    }
    if (sha256(prettyJson(unit.output)) !== unit.output_sha256) {
      addIssue(issues, path, "audit_output_hash_mismatch", `units[${index}].output_sha256 does not bind the embedded output.`);
    }
    try {
      const output = parseCommentaryQualityAudit(unit.output, {
        path: `units[${index}].output`,
        expectedCommentaryIds: expected.commentaryIds,
      });
      if (
        output.dialogue !== manifest.dialogue ||
        output.unit_key !== expected.unitKey ||
        output.section_id !== expected.sectionId
      ) {
        addIssue(issues, path, "invalid_audit_output", `units[${index}].output identity does not match its unit.`);
      }
      auditedIds.push(...output.blocks.map((block) => block.commentary_id));
      if (output.unit_verdict !== "pass" || output.blocks.some((block) => block.disposition !== "pass")) {
        addIssue(
          issues,
          path,
          "audit_output_failed",
          `units[${index}] is not an all-pass ${COMMENTARY_AUTHORING_MODEL} ${COMMENTARY_STAGE_EFFORT.audit}-effort audit output.`,
        );
      }
    } catch (error) {
      addIssue(
        issues,
        path,
        "invalid_audit_output",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  const uniqueAuditedIds = new Set(auditedIds);
  if (
    auditedIds.length !== ledgerIds.length ||
    uniqueAuditedIds.size !== auditedIds.length ||
    ledgerIds.some((id) => !uniqueAuditedIds.has(id))
  ) {
    addIssue(
      issues,
      path,
      "commentary_id_coverage_mismatch",
      "Embedded unit outputs must cover every active accepted commentary_id exactly once; rejected IDs are terminal and excluded, and each output must preserve deterministic unit-local order.",
    );
  }

  if (manifest.acceptance.decision === "pending") {
    if (
      manifest.acceptance.reviewer !== null ||
      manifest.acceptance.reviewed_on !== null ||
      manifest.acceptance.rationale !== null ||
      manifest.acceptance.sampled_commentary_ids.length !== 0 ||
      manifest.acceptance.review_note !== null
    ) {
      addIssue(
        issues,
        path,
        "invalid_acceptance",
        "Pending acceptance must leave reviewer, reviewed_on, rationale, and review_note null and sampled_commentary_ids empty.",
      );
    }
  } else {
    for (const issue of validateAcceptedCommentaryQualityAuditProvenance({
      dialogue: manifest.dialogue,
      reviewer: manifest.acceptance.reviewer,
      reviewedOn: manifest.acceptance.reviewed_on,
      rationale: manifest.acceptance.rationale,
      sampledCommentaryIds: manifest.acceptance.sampled_commentary_ids,
      reviewNote: manifest.acceptance.review_note,
      activeCommentaryIds: ledgerIds,
    })) {
      addIssue(issues, path, issue.code, issue.message);
    }
  }
  return issues;
}

export function validateCommentaryQualityAuditManifest(path: string, content: string) {
  return validateCommentaryQualityAuditManifestWithEvidence(path, content);
}

export function formatCommentaryQualityAuditManifestIssues(issues: CommentaryQualityAuditManifestIssue[]) {
  return issues.map((issue) => `- [${issue.code}] ${issue.message}`).join("\n");
}

export function parseCommentaryQualityAuditManifest(path: string, content: string): CommentaryQualityAuditManifest {
  const issues = validateCommentaryQualityAuditManifest(path, content);
  if (issues.length > 0) {
    throw new Error(
      `Commentary quality-audit manifest validation failed for ${path}:\n${formatCommentaryQualityAuditManifestIssues(issues)}`,
    );
  }
  return inspectCommentaryQualityAuditManifest(path, content).manifest!;
}

export function listCommentaryQualityAuditManifestPaths() {
  const directory = join(getRepoRoot(), "wiki/commentary-audits");
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => `wiki/commentary-audits/${entry.name}`)
    .sort();
}

export function validateCommentaryQualityAuditManifests() {
  const paths = listCommentaryQualityAuditManifestPaths();
  if (paths.length === 0) return [];
  const evidence = buildCommentaryAuditEvidenceSnapshot();
  return paths.flatMap((path) =>
    validateCommentaryQualityAuditManifestWithEvidence(
      path,
      readFileSync(join(getRepoRoot(), path), "utf8"),
      evidence,
    ),
  );
}

class CurrentAuditDidNotPassError extends Error {}

function completedScratchOutputFromState(job: CommentaryCampaignJob) {
  const repoRoot = getRepoRoot();
  const outputAbsolutePath = join(repoRoot, job.output_path);
  const stateAbsolutePath = join(repoRoot, job.state_path);
  if (!existsSync(outputAbsolutePath) || !existsSync(stateAbsolutePath)) {
    throw new Error(`Quality-audit job ${job.job_id} is incomplete: output and state are both required.`);
  }
  const outputContent = readFileSync(outputAbsolutePath, "utf8");
  const output = parseCommentaryQualityAudit(JSON.parse(outputContent) as unknown, {
    path: job.output_path,
    expectedCommentaryIds: job.commentary_ids ?? [],
  });
  if (output.dialogue !== job.dialogue || output.unit_key !== job.unit_key || output.section_id !== job.section_id) {
    throw new Error(`Quality-audit output identity does not match ${job.job_id}.`);
  }
  if (outputContent !== prettyJson(output)) {
    throw new Error(`Quality-audit output ${job.output_path} is not the exact normalized runner artifact.`);
  }
  if (output.unit_verdict !== "pass" || output.blocks.some((block) => block.disposition !== "pass")) {
    throw new CurrentAuditDidNotPassError(
      `Quality-audit output ${job.output_path} did not pass; no acceptance candidate can be built.`,
    );
  }

  const state = JSON.parse(readFileSync(stateAbsolutePath, "utf8")) as unknown;
  if (
    !isRecord(state) ||
    Object.keys(state).some((key) => !JOB_STATE_FIELDS.has(key)) ||
    Object.keys(state).length !== JOB_STATE_FIELDS.size
  ) {
    throw new Error(`Quality-audit state ${job.state_path} is malformed.`);
  }
  const expectedState: Record<string, unknown> = {
    schema_version: COMMENTARY_JOB_STATE_SCHEMA_VERSION,
    job_id: job.job_id,
    stage: "audit",
    input_sha256: job.input_sha256,
    output_schema_sha256: job.output_schema_sha256,
    model_argument: COMMENTARY_MODEL_ARGUMENT,
    codex_cli_version: job.codex_cli_version,
    model_catalog_path: job.model_catalog_path,
    model_catalog_sha256: job.model_catalog_sha256,
    authoring_model: COMMENTARY_AUTHORING_MODEL,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    output_path: job.output_path,
    output_sha256: sha256(outputContent),
  };
  for (const [field, expected] of Object.entries(expectedState)) {
    if (state[field] !== expected) throw new Error(`Quality-audit state ${job.state_path} is stale at ${field}.`);
  }
  return { output, outputSha256: sha256(outputContent) };
}

function completedScratchOutput(
  job: CommentaryCampaignJob,
  canonicalAuditReuse: ReusableCanonicalAuditOutputResolver = reusableCanonicalAuditOutput,
) {
  try {
    return completedScratchOutputFromState(job);
  } catch (error) {
    if (error instanceof CurrentAuditDidNotPassError) throw error;
    const reusable = canonicalAuditReuse(job);
    if (reusable) {
      return { output: reusable.output, outputSha256: reusable.outputSha256 };
    }
    throw error;
  }
}

export function buildCommentaryQualityAuditManifestPreview(dialogue: string): CommentaryQualityAuditManifest {
  const plan = buildCommentaryCampaignPlan({ dialogue, stage: "audit" });
  const jobs = plan.manifest.jobs;
  if (jobs.length === 0) throw new Error(`No quality-audit units are required or ready for ${dialogue}.`);
  const canonicalAuditReuse = createReusableCanonicalAuditOutputResolver({
    ...(plan.auditEvidence ? { auditEvidence: plan.auditEvidence } : {}),
  });
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const protocolPath = "docs/commentary-protocol.md" as const;
  const manifest: CommentaryQualityAuditManifest = {
    schema_version: SCHEMA_VERSION,
    dialogue,
    ledger: { path: ledgerPath, sha256: sha256(readFileSync(join(getRepoRoot(), ledgerPath))) },
    protocol: { path: protocolPath, sha256: sha256(readFileSync(join(getRepoRoot(), protocolPath))) },
    authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
    units: jobs.map((job) => {
      const { output, outputSha256 } = completedScratchOutput(job, canonicalAuditReuse);
      const delegated = !existsSync(join(getRepoRoot(), job.output_path)) && !existsSync(join(getRepoRoot(), job.state_path))
        ? canonicalAuditReuse(job)
        : undefined;
      return {
        unit_key: job.unit_key!,
        section_id: job.section_id!,
        audit_brief_sha256: job.audit_brief_sha256!,
        output_path: job.output_path,
        output_sha256: outputSha256,
        output,
        ...(delegated?.source === "delegated_import" ? {
          provenance: { path: delegated.manifestPath, sha256: sha256(readFileSync(join(getRepoRoot(), delegated.manifestPath))) },
        } : {}),
      };
    }),
    acceptance: {
      decision: "pending",
      reviewer: null,
      reviewed_on: null,
      rationale: null,
      sampled_commentary_ids: [],
      review_note: null,
    },
  };
  const canonicalPath = `wiki/commentary-audits/${dialogue}.json`;
  const issues = validateCommentaryQualityAuditManifest(canonicalPath, prettyJson(manifest));
  if (issues.length > 0) {
    throw new Error(`Refusing invalid quality-audit preview:\n${formatCommentaryQualityAuditManifestIssues(issues)}`);
  }
  return manifest;
}

export function writeCommentaryQualityAuditManifestPreview(
  dialogue: string,
): WrittenCommentaryQualityAuditManifestPreview {
  const manifest = buildCommentaryQualityAuditManifestPreview(dialogue);
  const path = `scratch/commentary/audit-manifests/${dialogue}.json`;
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, prettyJson(manifest), "utf8");
  return { path, manifest };
}

export type CommentaryQualityAuditManifestRefreshPreview = {
  applied: false;
  manifestPath: string;
  manifestSha256Before: string;
  manifestSha256After: string;
  preservedReviewNotePath: string;
  manifest: CommentaryQualityAuditManifest;
};

export type CommentaryQualityAuditManifestRefreshApply =
  Omit<CommentaryQualityAuditManifestRefreshPreview, "applied"> & { applied: true };

function buildCommentaryQualityAuditManifestRefresh(
  dialogue: string,
): CommentaryQualityAuditManifestRefreshPreview {
  const manifestPath = `wiki/commentary-audits/${dialogue}.json`;
  const manifestAbsolutePath = join(getRepoRoot(), manifestPath);
  if (!existsSync(manifestAbsolutePath)) {
    throw new Error(`Cannot refresh missing accepted commentary quality-audit manifest ${manifestPath}`);
  }
  const existingContent = readFileSync(manifestAbsolutePath, "utf8");
  const existing = inspectCommentaryQualityAuditManifest(manifestPath, existingContent).manifest;
  if (!existing || existing.acceptance.decision !== "accepted") {
    throw new Error(`Cannot refresh ${manifestPath} without an existing accepted Luna sample`);
  }

  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const currentLedgerSha256 = sha256(readFileSync(join(getRepoRoot(), ledgerPath)));
  if (existing.ledger.path !== ledgerPath || existing.ledger.sha256 !== currentLedgerSha256) {
    throw new Error(
      `Cannot refresh ${manifestPath}: commentary ledger changed after the accepted sample; a fresh independent sample is required`,
    );
  }

  const pending = buildCommentaryQualityAuditManifestPreview(dialogue);
  const manifest: CommentaryQualityAuditManifest = {
    ...pending,
    acceptance: existing.acceptance,
  };
  const refreshedContent = prettyJson(manifest);
  const issues = validateCommentaryQualityAuditManifest(manifestPath, refreshedContent);
  if (issues.length > 0) {
    throw new Error(
      `Refusing invalid accepted quality-audit refresh:\n${formatCommentaryQualityAuditManifestIssues(issues)}`,
    );
  }
  return {
    applied: false,
    manifestPath,
    manifestSha256Before: sha256(existingContent),
    manifestSha256After: sha256(refreshedContent),
    preservedReviewNotePath: existing.acceptance.review_note.path,
    manifest,
  };
}

/**
 * Preview a manifest-only evidence refresh while preserving the prior sample.
 * This is allowed only when the commentary ledger is byte-identical to the one
 * that sample accepted. Changed prose still requires a fresh independent
 * review; stricter parsing or regenerated audit rationales do not.
 */
export function previewCommentaryQualityAuditManifestRefresh(dialogue: string) {
  return buildCommentaryQualityAuditManifestRefresh(dialogue);
}

export function applyCommentaryQualityAuditManifestRefresh(
  dialogue: string,
): CommentaryQualityAuditManifestRefreshApply {
  const manifestPath = `wiki/commentary-audits/${dialogue}.json`;
  return withRepoWriteLock(
    { paths: [manifestPath], label: `commentary-quality-audit-refresh:${dialogue}` },
    () => {
      const preview = buildCommentaryQualityAuditManifestRefresh(dialogue);
      const manifestAbsolutePath = join(getRepoRoot(), manifestPath);
      const tempPath = `${manifestAbsolutePath}.tmp-${process.pid}`;
      try {
        writeFileSync(tempPath, prettyJson(preview.manifest), "utf8");
        renameSync(tempPath, manifestAbsolutePath);
      } catch (error) {
        rmSync(tempPath, { force: true });
        throw error;
      }
      return { ...preview, applied: true };
    },
  );
}

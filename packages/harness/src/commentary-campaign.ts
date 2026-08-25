import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { buildEnglishStephanusIndex, buildStephanusIndex, listGreekDialogues } from "./derived/stephanus.js";
import { turnIndexPath } from "./derived/turns.js";
import {
  inspectAudioInsertionBlock,
  inspectAudioInsertionValue,
  renderAudioInsertionLines,
  resolveAudioInsertionBoundary,
  sourceTurnBoundaryAtOrAfter,
  type AudioInsertionBoundary,
} from "./audio-insertion.js";
import { withRepoWriteLock } from "./file-lock.js";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";
import { resolveSourceSpan } from "./source.js";
import { recordSubmission } from "./submissions.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_CAMPAIGN_ID,
  COMMENTARY_CAMPAIGN_SCHEMA_VERSION,
  COMMENTARY_CODEX_CLI_VERSION,
  COMMENTARY_JOB_STATE_SCHEMA_VERSION,
  COMMENTARY_MODEL_CATALOG_PATH,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
  type CommentaryEffort,
} from "./commentary-authoring.js";
import { commentaryApplyLockScope, parseCommentaryUnitDraft } from "./commentary-drafts.js";
import { validateCommentaryListenerProse } from "./commentary-listener-prose.js";
import {
  commentaryCampaignTelemetryPath,
  CodexExecOperationalError,
  parseCodexExecResult,
  recordCommentaryCampaignAttempt,
  type CommentaryCampaignAttemptOutcome,
  type CommentaryCampaignTokenUsage,
} from "./commentary-campaign-telemetry.js";
import { readFreshCommentaryTurnIndex } from "./commentary-turn-index.js";
import {
  buildCommentaryAuditEvidenceSnapshot,
  buildCommentaryAuditBriefs,
  buildCommentaryAuditBriefsFromSnapshot,
  buildCommentaryRewriteEvidenceContext,
  buildCommentaryRewriteEvidenceSupplement,
  COMMENTARY_PLACEMENT_HAZARD_CODES,
  COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
  COMMENTARY_QUALITY_AUDIT_RATIONALE_TARGET_MAX_LENGTH,
  COMMENTARY_QUALITY_ISSUE_CODES,
  parseCommentaryQualityAudit,
  type CommentaryAuditBrief,
  type CommentaryAuditEvidenceSnapshot,
  type CommentaryQualityAudit,
  type CommentaryRewriteEvidenceSupplement,
} from "./commentary-audit.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import { validateAcceptedCommentaryQualityAuditProvenance } from "./wiki/commentary-quality-audit-provenance.js";
import { readCurrentCommentaryDelegatedAudit } from "./wiki/commentary-delegated-audit.js";
import {
  buildCommentaryCitationIndex,
  formatCommentaryLedgerValidationError,
  validateCommentaryLedger,
  workNameToSlug,
  type CommentaryCitationIndex,
} from "./wiki/commentary-validator.js";
import { fieldValue, observationYamlBlocks } from "./wiki/observation-ledger.js";

const CAMPAIGN_SCHEMA_VERSION = COMMENTARY_CAMPAIGN_SCHEMA_VERSION;
const OUTLINE_SCHEMA_VERSION = 1 as const;
const JOB_STATE_SCHEMA_VERSION = COMMENTARY_JOB_STATE_SCHEMA_VERSION;
const DEFAULT_CONCURRENCY = 2;
const MAX_CONCURRENCY = 40;
export const COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS = 4_000;
const PROVIDER_BLOCK_SCHEMA_VERSION = 2 as const;
const PROVIDER_BLOCK_PATH = "scratch/commentary/luna-provider-block.json" as const;
const SHA256 = /^[a-f0-9]{64}$/u;
const UNIT_KEY = /^[a-z0-9][a-z0-9-]*$/u;
const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_CODEX_ISOLATION_CONFIG = [
  "project_doc_max_bytes=0",
  "include_permissions_instructions=false",
  "include_apps_instructions=false",
  "include_collaboration_mode_instructions=false",
  "include_environment_context=false",
  "skills.include_instructions=false",
  "features.shell_tool=false",
  "features.unified_exec=false",
  "features.multi_agent=false",
  "features.goals=false",
  "features.apps=false",
  "features.plugins=false",
  "features.image_generation=false",
  "features.in_app_browser=false",
  "features.browser_use=false",
  "features.computer_use=false",
  "features.workspace_dependencies=false",
] as const;

const CITE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    observations: { type: "array", items: { type: "string", minLength: 1 } },
    claims: { type: "array", items: { type: "string", minLength: 1 } },
    relations: { type: "array", items: { type: "string", minLength: 1 } },
    dossiers: { type: "array", items: { type: "string", minLength: 1 } },
  },
  required: ["observations", "claims", "relations", "dossiers"],
} as const;

const CROSSREF_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      source_work: { type: "string", minLength: 1 },
      stephanus_span: { type: "string", pattern: "^\\d+[a-e](?:-\\d+[a-e])?$" },
      note: { type: "string", minLength: 1 },
    },
    required: ["source_work", "stephanus_span", "note"],
  },
} as const;

const AUDIO_INSERTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    attribution_path: { type: "string", pattern: "^audio/speaker-attributions/[a-z0-9-]+\\.json$" },
    attribution_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
    english_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
    turn_id: { type: "string", pattern: "^[a-z0-9][a-z0-9_-]*$" },
    edge: { type: "string", enum: ["before", "after"] },
    char_offset: { type: "integer", minimum: 0 },
  },
  required: ["attribution_path", "attribution_sha256", "english_sha256", "turn_id", "edge"],
} as const;

export const COMMENTARY_OUTLINE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    schema_version: { type: "integer", const: OUTLINE_SCHEMA_VERSION },
    dialogue: { type: "string", pattern: "^[a-z0-9-]+$" },
    authoring: {
      type: "object",
      additionalProperties: false,
      properties: {
        model: { type: "string", const: COMMENTARY_AUTHORING_MODEL },
        effort: { type: "string", const: COMMENTARY_STAGE_EFFORT.outline },
      },
      required: ["model", "effort"],
    },
    sections: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          unit_key: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
          title: { type: "string", minLength: 1 },
          stephanus_span: { type: "string", pattern: "^\\d+[a-e](?:-\\d+[a-e])?$" },
          audio_insertion: AUDIO_INSERTION_SCHEMA,
          body: { type: "string", minLength: 1 },
          cites: CITE_SCHEMA,
        },
        required: ["unit_key", "title", "stephanus_span", "body", "cites"],
      },
    },
  },
  required: ["schema_version", "dialogue", "authoring", "sections"],
} as const;

export const COMMENTARY_UNIT_DRAFT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    schema_version: { type: "integer", const: 1 },
    dialogue: { type: "string", pattern: "^[a-z0-9-]+$" },
    unit_key: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
    section_id: { type: "string", pattern: "^comm_[a-z0-9-]+_\\d{4}$" },
    authoring: {
      type: "object",
      additionalProperties: false,
      properties: {
        model: { type: "string", const: COMMENTARY_AUTHORING_MODEL },
        effort: { type: "string", const: COMMENTARY_STAGE_EFFORT.draft },
      },
      required: ["model", "effort"],
    },
    blocks: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          block_kind: { type: "string", enum: ["context", "argument", "notice", "crossref", "question"] },
          placement: { type: "string", enum: ["before", "after"] },
          stephanus_span: { type: "string", pattern: "^\\d+[a-e](?:-\\d+[a-e])?$" },
          audio_insertion: AUDIO_INSERTION_SCHEMA,
          body: { type: "string", minLength: 1 },
          cites: CITE_SCHEMA,
          crossrefs: CROSSREF_SCHEMA,
        },
        required: ["block_kind", "placement", "stephanus_span", "body", "cites", "crossrefs"],
      },
    },
  },
  required: ["schema_version", "dialogue", "unit_key", "section_id", "authoring", "blocks"],
} as const;

export const COMMENTARY_REWRITE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    schema_version: { type: "integer", const: 1 },
    dialogue: { type: "string", pattern: "^[a-z0-9-]+$" },
    unit_key: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
    section_id: { type: "string", pattern: "^comm_[a-z0-9-]+_\\d{4}$" },
    audit_output: {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string", minLength: 1 },
        sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
      },
      required: ["path", "sha256"],
    },
    authoring: {
      type: "object",
      additionalProperties: false,
      properties: {
        model: { type: "string", const: COMMENTARY_AUTHORING_MODEL },
        effort: { type: "string", const: COMMENTARY_STAGE_EFFORT.rewrite },
      },
      required: ["model", "effort"],
    },
    revisions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          commentary_id: { type: "string", pattern: "^comm_[a-z0-9-]+_\\d{4}$" },
          title: { type: "string" },
          body: { type: "string", minLength: 1 },
          cites: CITE_SCHEMA,
          crossrefs: CROSSREF_SCHEMA,
        },
        required: ["commentary_id", "title", "body", "cites", "crossrefs"],
      },
    },
  },
  required: ["schema_version", "dialogue", "unit_key", "section_id", "audit_output", "authoring", "revisions"],
} as const;

export type CommentaryRewriteTitleConstraint = {
  commentary_id: string;
  block_kind: "section" | "non-section";
};

export type CommentaryRewriteExactConstraint = {
  commentary_id: string;
  title?: string;
  body?: string;
  cites?: CommentaryOutlineCites;
  crossrefs?: CommentaryRewriteCrossref[];
};

/**
 * Guided rewrite jobs use one conditional object branch per failed block. The
 * parser still enforces canonical ordering and identity, while the provider
 * schema makes the title invariant explicit before generation.
 */
export function commentaryRewriteOutputSchema(
  constraints: readonly CommentaryRewriteTitleConstraint[] = [],
  exactConstraints: readonly CommentaryRewriteExactConstraint[] = [],
) {
  if (constraints.length === 0) return COMMENTARY_REWRITE_JSON_SCHEMA;
  const exactById = new Map(exactConstraints.map((constraint) => [constraint.commentary_id, constraint]));
  const baseRevisionProperties = {
    body: { type: "string", minLength: 1 },
    cites: CITE_SCHEMA,
    crossrefs: CROSSREF_SCHEMA,
  } as const;
  const revisionBranches = constraints.map((constraint) => {
    const exact = exactById.get(constraint.commentary_id);
    return {
      type: "object" as const,
      additionalProperties: false as const,
      properties: {
        commentary_id: { type: "string" as const, const: constraint.commentary_id },
        ...baseRevisionProperties,
        title: exact?.title !== undefined
          ? { type: "string" as const, const: exact.title }
          : constraint.block_kind === "section"
            ? { type: "string" as const, minLength: 1 }
            : { type: "string" as const, const: "" },
        body: exact?.body !== undefined
          ? { type: "string" as const, const: exact.body }
          : baseRevisionProperties.body,
        cites: exact?.cites !== undefined
          ? { const: exact.cites }
          : baseRevisionProperties.cites,
        crossrefs: exact?.crossrefs !== undefined
          ? { const: exact.crossrefs }
          : baseRevisionProperties.crossrefs,
      },
      required: ["commentary_id", "title", "body", "cites", "crossrefs"] as const,
    };
  });
  return {
    ...COMMENTARY_REWRITE_JSON_SCHEMA,
    properties: {
      ...COMMENTARY_REWRITE_JSON_SCHEMA.properties,
      revisions: {
        type: "array",
        minItems: constraints.length,
        maxItems: constraints.length,
        items: { anyOf: revisionBranches },
      },
    },
  };
}

export type CommentaryOutlineCites = {
  observations: string[];
  claims: string[];
  relations: string[];
  dossiers: string[];
};

export type CommentaryOutline = {
  schema_version: 1;
  dialogue: string;
  authoring: {
    model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: typeof COMMENTARY_STAGE_EFFORT.outline;
  };
  sections: Array<{
    unit_key: string;
    title: string;
    stephanus_span: string;
    audio_insertion?: AudioInsertionBoundary;
    body: string;
    cites: CommentaryOutlineCites;
  }>;
};

export type CommentaryRewriteCrossref = {
  source_work: string;
  stephanus_span: string;
  note?: string;
};

export type CommentaryRewrite = {
  schema_version: 1;
  dialogue: string;
  unit_key: string;
  section_id: string;
  audit_output: { path: string; sha256: string };
  authoring: {
    model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: typeof COMMENTARY_STAGE_EFFORT.rewrite;
  };
  revisions: Array<{
    commentary_id: string;
    title: string;
    body: string;
    cites: CommentaryOutlineCites;
    crossrefs: CommentaryRewriteCrossref[];
  }>;
};

export type CommentaryRevision = CommentaryRewrite["revisions"][number];

export type CommentaryCampaignStage = keyof typeof COMMENTARY_STAGE_EFFORT;

export type CommentaryCampaignJob = {
  schema_version: 3;
  job_id: string;
  stage: CommentaryCampaignStage;
  dialogue: string;
  unit_key?: string;
  section_id?: string;
  outline_replacement?: true;
  commentary_ids?: string[];
  audit_brief_sha256?: string;
  audit_brief_path?: string;
  failed_commentary_ids?: string[];
  audit_output_path?: string;
  audit_output_sha256?: string;
  rewrite_title_constraints?: CommentaryRewriteTitleConstraint[];
  rewrite_exact_constraints?: CommentaryRewriteExactConstraint[];
  model_argument: typeof COMMENTARY_MODEL_ARGUMENT;
  codex_cli_version: typeof COMMENTARY_CODEX_CLI_VERSION;
  model_catalog_path: typeof COMMENTARY_MODEL_CATALOG_PATH;
  model_catalog_sha256: string;
  authoring_model: typeof COMMENTARY_AUTHORING_MODEL;
  effort: CommentaryEffort;
  permission_mode: typeof COMMENTARY_PERMISSION_MODE;
  session_name: string;
  input_files: Array<{ path: string; sha256: string }>;
  prompt: string;
  prompt_sha256: string;
  output_schema_sha256: string;
  input_sha256: string;
  output_path: string;
  state_path: string;
  command: { executable: string; args: string[] };
  serial_handoff: string[];
};

export type CommentaryCampaignManifest = {
  schema_version: 3;
  campaign: typeof COMMENTARY_CAMPAIGN_ID;
  dry_run_default: true;
  max_concurrency: 40;
  authoring: {
    model_argument: typeof COMMENTARY_MODEL_ARGUMENT;
    codex_cli_version: typeof COMMENTARY_CODEX_CLI_VERSION;
    model_catalog_path: typeof COMMENTARY_MODEL_CATALOG_PATH;
    model_catalog_sha256: string;
    recorded_model: typeof COMMENTARY_AUTHORING_MODEL;
    effort_by_stage: typeof COMMENTARY_STAGE_EFFORT;
    permission_mode: typeof COMMENTARY_PERMISSION_MODE;
  };
  jobs: CommentaryCampaignJob[];
};

export type CommentaryCampaignBuildOptions = {
  dialogue?: string;
  stage?: CommentaryCampaignStage | "all";
  codexExecutable?: string;
  reviseOutline?: boolean;
};

export type CommentaryCampaignJobSelectionOptions = {
  dialogue: string;
  stage: "audit";
  unitKeys: readonly string[];
};

export type CommentaryCampaignPlan = {
  manifest: CommentaryCampaignManifest;
  auditEvidence?: CommentaryAuditEvidenceSnapshot;
  generatedInputs: CommentaryRewriteEvidenceSupplement[];
};

export type LunaAuthStatus = {
  logged_in: boolean;
  auth_method: string;
  api_provider: string;
};

export type LunaProviderAccessStatus = {
  status: "auth_blocked" | "auth_ready" | "provider_quota_blocked" | "provider_block_stale";
  reason:
    | "not_logged_in"
    | "no_provider_quota_block_observed"
    | "monthly_spend_limit"
    | "auth_context_changed"
    | "failed_job_missing"
    | "failed_job_input_changed"
    | "failed_job_artifact_not_pending";
  evidence_path?: typeof PROVIDER_BLOCK_PATH;
  observed_at?: string;
  job_id?: string;
  input_sha256?: string;
  response_sha256?: string;
  diagnostic?: string;
};

type LunaProviderBlockEvidence = {
  schema_version: 2;
  campaign: typeof COMMENTARY_CAMPAIGN_ID;
  kind: "monthly_spend_limit";
  observed_at: string;
  auth_method: string;
  api_provider: string;
  job_id: string;
  stage: CommentaryCampaignStage;
  input_sha256: string;
  output_schema_sha256: string;
  exit_code: number;
  response_sha256: string;
  diagnostic: string;
};

export type CommentaryCampaignDialogueStatus = {
  dialogue: string;
  stage:
    | "accepted"
    | "outline_pending"
    | "briefs_pending"
    | "unit_briefs_ready"
    | "unit_drafting_partial"
    | "unit_drafts_ready_for_import"
    | "serial_review_pending";
  ledger: "missing" | "no_sections" | "section_skeleton" | "drafted" | "accepted";
  section_count: number;
  non_section_block_count: number;
  accepted_block_count: number;
  brief_count: number;
  outline_job_count: number;
  draft_job_count: number;
  rewrite_job_count: number;
  completed_job_count: number;
  execution:
    | "complete"
    | "auth_blocked"
    | "auth_ready"
    | "provider_quota_blocked"
    | "provider_block_stale"
    | "stale_output";
  quality_audit_status: "not_required" | "pending" | "completed" | "failed";
  quality_audit_required_count: number;
  quality_audit_job_count: number;
  quality_audit_passed_count: number;
  quality_audit_failed_count: number;
  quality_audit_execution:
    | "not_required"
    | "complete"
    | "auth_blocked"
    | "auth_ready"
    | "provider_quota_blocked"
    | "provider_block_stale"
    | "stale_output";
};

export type CommentaryCampaignStatusReport = {
  schema_version: 3;
  campaign: typeof COMMENTARY_CAMPAIGN_ID;
  expected_dialogues: number;
  actual_dialogues: number;
  authoring: CommentaryCampaignManifest["authoring"];
  auth: LunaAuthStatus;
  provider_access: LunaProviderAccessStatus;
  totals: {
    accepted: number;
    outline_pending: number;
    briefs_pending: number;
    unit_briefs_ready: number;
    unit_drafting_partial: number;
    unit_drafts_ready_for_import: number;
    serial_review_pending: number;
    quality_audit_pending: number;
    quality_audit_completed: number;
    quality_audit_failed: number;
    outline_jobs: number;
    draft_jobs: number;
    audit_jobs: number;
    rewrite_jobs: number;
    completed_jobs: number;
  };
  dialogues: CommentaryCampaignDialogueStatus[];
};

export type CommentaryCampaignPreflightClassification =
  | "current"
  | "missing"
  | "stale"
  | "malformed"
  | "mechanical_fail"
  | "semantic_fail";

export type CommentaryCampaignPreflightEntry = {
  job_id: string;
  dialogue: string;
  stage: CommentaryCampaignStage;
  unit_key: string | null;
  classification: CommentaryCampaignPreflightClassification;
  source: "scratch" | "canonical_manifest" | "delegated_import" | "none";
  action: "reuse_scratch" | "reuse_canonical" | "reuse_delegated" | "execute" | "retry" | "repair" | "rewrite";
  blocks_execution: boolean;
  requires_paid_execution: boolean;
  requires_retry: boolean;
  next_action: string | null;
  detail: string;
};

export type CommentaryCampaignPreflightReport = {
  schema_version: 1;
  campaign: typeof COMMENTARY_CAMPAIGN_ID;
  job_count: number;
  ok_to_execute: boolean;
  paid_job_count: number;
  totals: Record<CommentaryCampaignPreflightClassification, number>;
  jobs: CommentaryCampaignPreflightEntry[];
};

export type CommentaryOutlineImportResult = {
  dialogue: string;
  outlinePath: string;
  ledgerPath: string;
  applied: boolean;
  sectionIds: string[];
  prospectiveLedger: string;
};

export type CommentaryRewriteImportResult = {
  dialogue: string;
  rewritePath: string;
  ledgerPath: string;
  unitKey: string;
  sectionId: string;
  applied: boolean;
  changedBlockIds: string[];
  prospectiveLedger: string;
};

export type CommentaryRewriteBatchImportResult = {
  dialogue: string;
  rewritePaths: string[];
  ledgerPath: string;
  applied: boolean;
  changedBlockIds: string[];
  prospectiveLedger: string;
};

export type CommentaryCampaignRetryResult = {
  dialogue: string;
  stage: CommentaryCampaignStage;
  unitKey: string | null;
  outputPath: string;
  statePath: string;
  telemetryPath: string;
  outputArchivePath?: string;
  stateArchivePath?: string;
  telemetryArchivePath?: string;
  rerunCommand: string;
};

export type CommentaryCampaignCommandResult = { exitCode: number; stdout: string; stderr: string };

export type CommentaryCampaignCommandRunner = (
  executable: string,
  args: string[],
  cwd: string,
  env?: NodeJS.ProcessEnv,
  stdin?: string,
) => Promise<CommentaryCampaignCommandResult>;

type BunWritableSink = {
  write(content: string): number;
  end(): number;
};

type BunSubprocess = {
  exited: Promise<number>;
  stdin?: BunWritableSink;
  stdout: ReadableStream<Uint8Array>;
  stderr: ReadableStream<Uint8Array>;
};

type BunRuntime = {
  spawn(
    command: string[],
    options: {
      cwd: string;
      env: NodeJS.ProcessEnv;
      stdin: "ignore" | "pipe";
      stdout: "pipe";
      stderr: "pipe";
    },
  ): BunSubprocess;
};

export type RunCommentaryCampaignOptions = {
  execute?: boolean;
  concurrency?: number;
  maxNewJobs?: number;
  codexExecutable?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  jobs?: CommentaryCampaignJob[];
  commandRunner?: CommentaryCampaignCommandRunner;
};

export type CommentaryCampaignJobResult = {
  job_id: string;
  output_path: string;
  status: "planned" | "generated" | "resumed" | "reused_canonical" | "deferred";
  telemetry_path?: string;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
}

function stableJson(value: unknown) {
  return JSON.stringify(stableValue(value));
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

type CommentaryCampaignInputIdentity = Pick<
  CommentaryCampaignJob,
  | "stage"
  | "dialogue"
  | "unit_key"
  | "section_id"
  | "outline_replacement"
  | "commentary_ids"
  | "audit_brief_sha256"
  | "audit_brief_path"
  | "failed_commentary_ids"
  | "audit_output_path"
  | "audit_output_sha256"
  | "rewrite_title_constraints"
  | "rewrite_exact_constraints"
  | "model_argument"
  | "codex_cli_version"
  | "model_catalog_path"
  | "model_catalog_sha256"
  | "authoring_model"
  | "effort"
  | "permission_mode"
  | "input_files"
  | "prompt_sha256"
  | "output_schema_sha256"
>;

function commentaryCampaignInputSha256(input: CommentaryCampaignInputIdentity) {
  return sha256(stableJson({
    schema_version: CAMPAIGN_SCHEMA_VERSION,
    stage: input.stage,
    dialogue: input.dialogue,
    unit_key: input.unit_key,
    section_id: input.section_id,
    outline_replacement: input.outline_replacement === true,
    commentary_ids: input.commentary_ids,
    audit_brief_sha256: input.audit_brief_sha256,
    audit_brief_path: input.audit_brief_path,
    failed_commentary_ids: input.failed_commentary_ids,
    audit_output_path: input.audit_output_path,
    audit_output_sha256: input.audit_output_sha256,
    rewrite_title_constraints: input.rewrite_title_constraints,
    rewrite_exact_constraints: input.rewrite_exact_constraints,
    model_argument: input.model_argument,
    codex_cli_version: input.codex_cli_version,
    model_catalog_path: input.model_catalog_path,
    model_catalog_sha256: input.model_catalog_sha256,
    authoring_model: input.authoring_model,
    effort: input.effort,
    permission_mode: input.permission_mode,
    input_files: input.input_files,
    prompt_sha256: input.prompt_sha256,
    output_schema_sha256: input.output_schema_sha256,
  }));
}

type CommentaryModelCatalog = {
  absolutePath: string;
  sha256: string;
};

type CommentaryCampaignBuildContext = {
  modelCatalog: CommentaryModelCatalog;
  inputSha256ByPath: Map<string, string>;
  generatedInputContentByPath: Map<string, string>;
};

function readCommentaryModelCatalog(): CommentaryModelCatalog {
  const absolutePath = join(getRepoRoot(), COMMENTARY_MODEL_CATALOG_PATH);
  if (!existsSync(absolutePath)) {
    throw new Error(`Commentary model catalog is missing: ${COMMENTARY_MODEL_CATALOG_PATH}`);
  }
  const content = readFileSync(absolutePath);
  let value: unknown;
  try {
    value = JSON.parse(content.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`Commentary model catalog is invalid JSON: ${String(error)}`);
  }
  const record = objectValue(value, COMMENTARY_MODEL_CATALOG_PATH);
  if (!Array.isArray(record.models) || record.models.length !== 1) {
    throw new Error(`${COMMENTARY_MODEL_CATALOG_PATH}.models must contain exactly one model`);
  }
  const model = objectValue(record.models[0], `${COMMENTARY_MODEL_CATALOG_PATH}.models[0]`);
  if (model.slug !== COMMENTARY_MODEL_ARGUMENT) {
    throw new Error(`${COMMENTARY_MODEL_CATALOG_PATH} must pin ${COMMENTARY_MODEL_ARGUMENT}`);
  }
  if (
    model.supports_parallel_tool_calls !== false ||
    model.shell_type !== "disabled" ||
    model.apply_patch_tool_type !== null ||
    model.tool_mode !== "direct" ||
    model.multi_agent_version !== null
  ) {
    throw new Error(`${COMMENTARY_MODEL_CATALOG_PATH} must disable agent tools for isolated inference`);
  }
  if (
    model.include_skills_usage_instructions !== false ||
    model.include_plugin_usage_instructions !== false ||
    model.include_apps_usage_instructions !== false
  ) {
    throw new Error(`${COMMENTARY_MODEL_CATALOG_PATH} must disable skills, plugin, and app injection`);
  }
  return { absolutePath, sha256: sha256(content) };
}

function objectValue(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object`);
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
    if (!allowedSet.has(key)) throw new Error(`${path}.${key} is not allowed`);
  }
  for (const key of required) {
    if (!(key in record)) throw new Error(`${path}.${key} is required`);
  }
}

function nonEmptyString(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${path} must be a non-empty string`);
  return value.trim();
}

function stringList(value: unknown, path: string) {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  return value.map((entry, index) => nonEmptyString(entry, `${path}[${index}]`));
}

function parseOutlineCites(value: unknown, path: string): CommentaryOutlineCites {
  const record = objectValue(value, path);
  exactKeys(record, ["observations", "claims", "relations", "dossiers"], path);
  return {
    observations: stringList(record.observations, `${path}.observations`),
    claims: stringList(record.claims, `${path}.claims`),
    relations: stringList(record.relations, `${path}.relations`),
    dossiers: stringList(record.dossiers, `${path}.dossiers`),
  };
}

export function parseCommentaryOutline(value: unknown, path = "outline"): CommentaryOutline {
  const record = objectValue(value, path);
  exactKeys(record, ["schema_version", "dialogue", "authoring", "sections"], path);
  if (record.schema_version !== OUTLINE_SCHEMA_VERSION) throw new Error(`${path}.schema_version must be 1`);
  const dialogue = nonEmptyString(record.dialogue, `${path}.dialogue`);
  if (!DIALOGUE.test(dialogue)) throw new Error(`${path}.dialogue must be a canonical lowercase slug`);

  const authoring = objectValue(record.authoring, `${path}.authoring`);
  exactKeys(authoring, ["model", "effort"], `${path}.authoring`);
  if (
    authoring.model !== COMMENTARY_AUTHORING_MODEL ||
    authoring.effort !== COMMENTARY_STAGE_EFFORT.outline
  ) {
    throw new Error(
      `${path}.authoring must record model ${COMMENTARY_AUTHORING_MODEL} and effort ${COMMENTARY_STAGE_EFFORT.outline}`,
    );
  }
  if (!Array.isArray(record.sections) || record.sections.length === 0) {
    throw new Error(`${path}.sections must be a non-empty array`);
  }

  const seen = new Set<string>();
  const sections = record.sections.map((value, index) => {
    const sectionPath = `${path}.sections[${index}]`;
    const section = objectValue(value, sectionPath);
    const required = ["unit_key", "title", "stephanus_span", "body", "cites"] as const;
    exactKeys(section, [...required, "audio_insertion"], sectionPath, required);
    const unitKey = nonEmptyString(section.unit_key, `${sectionPath}.unit_key`);
    if (!UNIT_KEY.test(unitKey)) throw new Error(`${sectionPath}.unit_key must use lowercase letters, numbers, and hyphens`);
    if (seen.has(unitKey)) throw new Error(`${sectionPath}.unit_key duplicates ${unitKey}`);
    seen.add(unitKey);
    const insertion = section.audio_insertion === undefined
      ? undefined
      : inspectAudioInsertionValue(section.audio_insertion);
    if (insertion && (insertion.errors.length > 0 || !insertion.value)) {
      throw new Error(`${sectionPath}.audio_insertion is invalid: ${insertion.errors.join("; ")}`);
    }
    return {
      unit_key: unitKey,
      title: nonEmptyString(section.title, `${sectionPath}.title`),
      stephanus_span: nonEmptyString(section.stephanus_span, `${sectionPath}.stephanus_span`),
      ...(insertion?.value ? { audio_insertion: insertion.value } : {}),
      body: validateCommentaryListenerProse(
        nonEmptyString(section.body, `${sectionPath}.body`),
        `${sectionPath}.body`,
      ),
      cites: parseOutlineCites(section.cites, `${sectionPath}.cites`),
    };
  });

  return {
    schema_version: OUTLINE_SCHEMA_VERSION,
    dialogue,
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.outline,
    },
    sections,
  };
}

function parseRewriteCrossrefs(value: unknown, path: string): CommentaryRewriteCrossref[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  return value.map((entry, index) => {
    const entryPath = `${path}[${index}]`;
    const record = objectValue(entry, entryPath);
    const allowed = ["source_work", "stephanus_span", "note"] as const;
    for (const key of Object.keys(record)) {
      if (!allowed.includes(key as (typeof allowed)[number])) throw new Error(`${entryPath}.${key} is not allowed`);
    }
    if (!("source_work" in record) || !("stephanus_span" in record)) {
      throw new Error(`${entryPath} requires source_work and stephanus_span`);
    }
    const note = record.note === undefined ? undefined : nonEmptyString(record.note, `${entryPath}.note`);
    return {
      source_work: nonEmptyString(record.source_work, `${entryPath}.source_work`),
      stephanus_span: nonEmptyString(record.stephanus_span, `${entryPath}.stephanus_span`),
      ...(note ? { note } : {}),
    };
  });
}

export function parseCommentaryRevisions(
  value: unknown,
  options: { path?: string; expectedCommentaryIds?: string[] } = {},
): CommentaryRevision[] {
  const path = options.path ?? "revisions";
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  const revisions = value.map((entry, index) => {
    const revisionPath = `${path}[${index}]`;
    const revision = objectValue(entry, revisionPath);
    exactKeys(revision, ["commentary_id", "title", "body", "cites", "crossrefs"], revisionPath);
    if (typeof revision.title !== "string") throw new Error(`${revisionPath}.title must be a string`);
    return {
      commentary_id: nonEmptyString(revision.commentary_id, `${revisionPath}.commentary_id`),
      title: revision.title.trim(),
      body: validateCommentaryListenerProse(
        nonEmptyString(revision.body, `${revisionPath}.body`),
        `${revisionPath}.body`,
      ),
      cites: parseOutlineCites(revision.cites, `${revisionPath}.cites`),
      crossrefs: parseRewriteCrossrefs(revision.crossrefs, `${revisionPath}.crossrefs`),
    };
  });
  const ids = revisions.map((revision) => revision.commentary_id);
  const expected = options.expectedCommentaryIds;
  if (new Set(ids).size !== ids.length || (expected &&
      (ids.length !== expected.length || ids.some((id, index) => id !== expected[index])))) {
    throw new Error(
      `${path} must cover every failed commentary_id exactly once and in canonical order; expected=[${expected?.join(", ") ?? "unique IDs"}], received=[${ids.join(", ")}]`,
    );
  }
  return revisions;
}

export function parseCommentaryRewrite(
  value: unknown,
  options: {
    path?: string;
    expectedFailedCommentaryIds?: string[];
    expectedAuditOutput?: { path: string; sha256: string };
  } = {},
): CommentaryRewrite {
  const path = options.path ?? "rewrite";
  const record = objectValue(value, path);
  exactKeys(
    record,
    ["schema_version", "dialogue", "unit_key", "section_id", "audit_output", "authoring", "revisions"],
    path,
  );
  if (record.schema_version !== 1) throw new Error(`${path}.schema_version must be 1`);
  const dialogue = nonEmptyString(record.dialogue, `${path}.dialogue`);
  if (!DIALOGUE.test(dialogue)) throw new Error(`${path}.dialogue must be a canonical lowercase slug`);
  const unitKey = nonEmptyString(record.unit_key, `${path}.unit_key`);
  if (!UNIT_KEY.test(unitKey)) throw new Error(`${path}.unit_key must use lowercase letters, numbers, and hyphens`);
  const sectionId = nonEmptyString(record.section_id, `${path}.section_id`);
  if (!/^comm_[a-z0-9-]+_\d{4}$/u.test(sectionId)) throw new Error(`${path}.section_id must be a commentary id`);

  const auditOutput = objectValue(record.audit_output, `${path}.audit_output`);
  exactKeys(auditOutput, ["path", "sha256"], `${path}.audit_output`);
  const auditPath = nonEmptyString(auditOutput.path, `${path}.audit_output.path`);
  const auditSha = nonEmptyString(auditOutput.sha256, `${path}.audit_output.sha256`);
  if (!SHA256.test(auditSha)) throw new Error(`${path}.audit_output.sha256 must be a lowercase SHA-256 digest`);
  if (
    options.expectedAuditOutput &&
    (auditPath !== options.expectedAuditOutput.path || auditSha !== options.expectedAuditOutput.sha256)
  ) {
    throw new Error(`${path}.audit_output does not bind the failed quality-audit artifact`);
  }

  const authoring = objectValue(record.authoring, `${path}.authoring`);
  exactKeys(authoring, ["model", "effort"], `${path}.authoring`);
  if (
    authoring.model !== COMMENTARY_AUTHORING_MODEL ||
    authoring.effort !== COMMENTARY_STAGE_EFFORT.rewrite
  ) {
    throw new Error(
      `${path}.authoring must record model ${COMMENTARY_AUTHORING_MODEL} and effort ${COMMENTARY_STAGE_EFFORT.rewrite}`,
    );
  }
  const revisions = parseCommentaryRevisions(record.revisions, {
    path: `${path}.revisions`,
    ...(options.expectedFailedCommentaryIds
      ? { expectedCommentaryIds: options.expectedFailedCommentaryIds }
      : {}),
  });

  return {
    schema_version: 1,
    dialogue,
    unit_key: unitKey,
    section_id: sectionId,
    audit_output: { path: auditPath, sha256: auditSha },
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.rewrite,
    },
    revisions,
  };
}

function readJson(path: string) {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON at ${path}: ${String(error)}`);
  }
}

const UNSUPPORTED_CODEX_OUTPUT_SCHEMA_KEYWORDS = new Set([
  "uniqueItems",
  "allOf",
  "not",
  "dependentRequired",
  "dependentSchemas",
  "if",
  "then",
  "else",
]);

/** Fail before provider work when a schema uses a known-unsupported strict keyword. */
export function assertCommentaryStructuredOutputSchemaCompatible(
  schema: unknown,
  path = "output schema",
): void {
  if (Array.isArray(schema)) {
    schema.forEach((value, index) =>
      assertCommentaryStructuredOutputSchemaCompatible(value, `${path}[${index}]`)
    );
    return;
  }
  if (!schema || typeof schema !== "object") return;
  for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
    if (UNSUPPORTED_CODEX_OUTPUT_SCHEMA_KEYWORDS.has(key)) {
      throw new Error(`${path}.${key} is not supported by Codex strict structured outputs`);
    }
    if ((key === "properties" || key === "$defs") && value && typeof value === "object" && !Array.isArray(value)) {
      for (const [name, child] of Object.entries(value as Record<string, unknown>)) {
        assertCommentaryStructuredOutputSchemaCompatible(child, `${path}.${key}.${name}`);
      }
      continue;
    }
    assertCommentaryStructuredOutputSchemaCompatible(value, `${path}.${key}`);
  }
}

function fileSnapshot(paths: string[], context: CommentaryCampaignBuildContext) {
  const repoRoot = getRepoRoot();
  return [...new Set(paths)].sort().map((path) => {
    const absolutePath = join(repoRoot, path);
    const generatedContent = context.generatedInputContentByPath.get(path);
    if (generatedContent === undefined && !existsSync(absolutePath)) {
      throw new Error(`Campaign input does not exist: ${path}`);
    }
    let digest = context.inputSha256ByPath.get(path);
    if (!digest) {
      digest = generatedContent === undefined ? sha256(readFileSync(absolutePath)) : sha256(generatedContent);
      context.inputSha256ByPath.set(path, digest);
    }
    return { path, sha256: digest };
  });
}

function sourceWorkFor(dialogue: string) {
  const path = join(getRepoRoot(), `wiki/observations/${dialogue}.md`);
  if (existsSync(path)) {
    const first = /```yaml\n([\s\S]*?)\n```/u.exec(readFileSync(path, "utf8"))?.[1];
    const value = first ? fieldValue(first, "source_work") : undefined;
    if (value && workNameToSlug(value) === dialogue) return value;
  }
  return dialogue
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function relevantDossierPaths(dialogue: string) {
  const path = join(getRepoRoot(), `wiki/observations/${dialogue}.md`);
  if (!existsSync(path)) return [];
  const repoRoot = getRepoRoot();
  return [
    ...new Set(
      observationYamlBlocks(readFileSync(path, "utf8"))
        .filter((block) => fieldValue(block, "review_status") === "accepted")
        .map((block) => {
          const family = fieldValue(block, "feature_family");
          const label = fieldValue(block, "feature_label");
          if (!family || !label) return undefined;
          const dossierPath = `wiki/dossiers/${family}/${label}.md`;
          return existsSync(join(repoRoot, dossierPath)) ? dossierPath : undefined;
        })
        .filter((value): value is string => value !== undefined),
    ),
  ].sort();
}

function audioInsertionContract(dialogue: string) {
  const root = getRepoRoot();
  const attributionPath = `audio/speaker-attributions/${dialogue}.json`;
  const englishPath = `raw/plato/english/${dialogue}.txt`;
  if (!existsSync(join(root, attributionPath)) || !existsSync(join(root, englishPath))) {
    return {
      inputPaths: [] as string[],
      promptLines: [
        `- Do not return audio_insertion: the accepted English attribution inputs for ${dialogue} are unavailable. Use a turn-safe marker boundary or return silence.`,
      ],
    };
  }
  const attributionSha = sha256(readFileSync(join(root, attributionPath)));
  const englishSha = sha256(readFileSync(join(root, englishPath)));
  return {
    inputPaths: [englishPath, attributionPath],
    promptLines: [
      "- audio_insertion is optional. Omit it when the marker-derived boundary is already safe and exact.",
      `- If the desired marker anchor is editorially right but its default boundary is unsafe, audio_insertion must bind exactly to ${attributionPath}: attribution_path=${attributionPath}, attribution_sha256=${attributionSha}, english_sha256=${englishSha}. Never guess or alter either digest.`,
      "- Name an exact accepted turn_id. Without char_offset, edge before means that turn's exact start and edge after means its exact end. For a non-section block, edge must equal placement.",
      "- An interior char_offset is allowed only with edge after, strictly inside that accepted turn, and exactly at an explicit sentence ending or speaker-label boundary. It is never snapped or approximated.",
    ],
  };
}

function outlineInputPaths(dialogue: string) {
  const repoRoot = getRepoRoot();
  const turnsPath = turnIndexPath(dialogue);
  readFreshCommentaryTurnIndex(dialogue);
  const guidancePath = `scratch/commentary/outline-guidance/${dialogue}.md`;
  const baselinePointerPath = `scratch/commentary/outline-guidance/${dialogue}.baseline`;
  const revisionBaselinePointerPath = `scratch/commentary/outline-guidance/${dialogue}.revision-baseline`;
  const revisionPaths: string[] = [];
  if (existsSync(join(repoRoot, guidancePath))) revisionPaths.push(guidancePath);
  if (existsSync(join(repoRoot, baselinePointerPath))) {
    if (!revisionPaths.includes(guidancePath)) {
      throw new Error(`${baselinePointerPath} requires ${guidancePath}`);
    }
    const baselineValue = nonEmptyString(readFileSync(join(repoRoot, baselinePointerPath), "utf8"), baselinePointerPath);
    const baseline = normalizeRepoPath(baselineValue);
    const expectedDirectory = `scratch/commentary/outlines/${dialogue}`;
    if (
      dirname(baseline.relativePath) !== expectedDirectory ||
      !/^outline-[a-f0-9]{16}\.json$/u.test(basename(baseline.relativePath))
    ) {
      throw new Error(`${baselinePointerPath} must name a hashed outline directly inside ${expectedDirectory}`);
    }
    if (!existsSync(baseline.absolutePath)) {
      throw new Error(`${baselinePointerPath} names a missing outline: ${baseline.relativePath}`);
    }
    revisionPaths.push(baselinePointerPath, baseline.relativePath);
  }
  if (existsSync(join(repoRoot, revisionBaselinePointerPath))) {
    if (!revisionPaths.includes(guidancePath)) {
      throw new Error(`${revisionBaselinePointerPath} requires ${guidancePath}`);
    }
    const revisionBaselineValue = nonEmptyString(
      readFileSync(join(repoRoot, revisionBaselinePointerPath), "utf8"),
      revisionBaselinePointerPath,
    );
    const revisionBaseline = normalizeRepoPath(revisionBaselineValue);
    const expectedDirectory = `scratch/commentary/outlines/${dialogue}`;
    if (
      dirname(revisionBaseline.relativePath) !== expectedDirectory ||
      !/^outline-[a-f0-9]{16}\.json$/u.test(basename(revisionBaseline.relativePath))
    ) {
      throw new Error(`${revisionBaselinePointerPath} must name a hashed outline directly inside ${expectedDirectory}`);
    }
    if (!existsSync(revisionBaseline.absolutePath)) {
      throw new Error(`${revisionBaselinePointerPath} names a missing outline: ${revisionBaseline.relativePath}`);
    }
    revisionPaths.push(revisionBaselinePointerPath, revisionBaseline.relativePath);
  }
  const candidates = [
    "docs/commentary-protocol.md",
    ...revisionPaths,
    `raw/plato/greek/${dialogue}.txt`,
    `raw/plato/english/${dialogue}.txt`,
    `audio/speaker-attributions/${dialogue}.json`,
    turnsPath,
    `wiki/observations/${dialogue}.md`,
    `wiki/claims/${dialogue}.md`,
    `wiki/relations/${dialogue}.md`,
    "wiki/relations/cross-dialogue.md",
    ...relevantDossierPaths(dialogue),
  ];
  return candidates.filter((path) => existsSync(join(repoRoot, path)));
}

function outlinePrompt(dialogue: string, sourceWork: string, inputPaths: string[]) {
  const audioContract = audioInsertionContract(dialogue);
  return [
    `You are the isolated ${COMMENTARY_AUTHORING_MODEL} high-effort outline author for Plato's ${sourceWork} (${dialogue}).`,
    "Your only task is to propose the section skeleton for the validated commentary lane. Do not edit any file.",
    "Return only the structured JSON requested by the supplied JSON Schema.",
    "",
    "Files you must read before answering:",
    ...inputPaths.map((path) => `- ${path}`),
    "",
    "Contract:",
    "- Follow docs/commentary-protocol.md exactly.",
    "- Use the exact Luna model and stage effort stated here for invocation and provenance; all editorial and content rules in the protocol remain binding.",
    "- If a scratch/commentary/outline-guidance file is listed, treat it as binding serial editorial feedback and return a complete corrected outline, not a patch.",
    "- If a .baseline pointer and its referenced outline are listed, preserve the baseline's section count, unit keys, spans, titles, bodies, and citations verbatim except where the guidance explicitly requires a correction. Do not resegment or polish unrelated prose.",
    "- If a .revision-baseline pointer and its referenced outline are listed, use that newer rejected candidate as the immediate correction baseline. Preserve it verbatim except for the guidance's explicit corrections; it supersedes the older canonical .baseline as the prose starting point.",
    `- Set schema_version to 1, dialogue to ${dialogue}, authoring.model to ${COMMENTARY_AUTHORING_MODEL}, and authoring.effort to ${COMMENTARY_STAGE_EFFORT.outline}.`,
    "- Produce only section units. The lead, not you, assigns commentary IDs and exact source_ref fields.",
    "- Cover every canonical Stephanus marker exactly once with strictly ascending, adjacent, non-overlapping section spans.",
    "- By default, every internal section boundary must fall between turns. Never split a speaker's continuous turn or sentence across two sections.",
    "- A section's audio_insertion, when present, defines that section chapter's exact English start boundary; resolved section starts must begin at source char 0 and increase strictly.",
    ...audioContract.promptLines,
    "- A mechanically turn-safe boundary must also preserve exchange coherence: never separate a question from its immediate answer, a prompt from its response, or another inseparable turn pair.",
    "- Give every unit a unique lowercase-hyphen unit_key, an original teaching title, and a concise original section body.",
    "- Never copy a long Greek passage; the reading spine supplies the source text.",
    "- Every checkable statement must cite only an ID or dossier path that is present in the listed files and accepted there.",
    "- Never invent, repair, infer, or autocomplete a citation ID. If support is absent, omit the assertion and leave that cite list empty.",
    "- Dossier citations use family/label only and must correspond to a listed wiki/dossiers/<family>/<label>.md file.",
    "- Do not assign review_status, author, source_ref, commentary_id, crossrefs, or non-section blocks.",
  ].join("\n");
}

type DraftCorrectionInputs = {
  guidancePath: string;
  baselinePointerPath: string;
  baselineOutputPath: string;
  baselineStatePath: string;
};

function draftPrompt(
  dialogue: string,
  sourceWork: string,
  briefPath: string,
  unitKey: string,
  sectionId: string,
  correction?: DraftCorrectionInputs,
) {
  const audioContract = audioInsertionContract(dialogue);
  return [
    `You are one isolated ${COMMENTARY_AUTHORING_MODEL} medium-effort unit-writing subagent for Plato's ${sourceWork} (${dialogue}).`,
    "Your only task is to draft candidate non-section commentary blocks for this single unit. Do not edit any file.",
    "Return only the structured JSON requested by the supplied JSON Schema.",
    "",
    "The only files you may read:",
    "- docs/commentary-protocol.md",
    `- ${briefPath}`,
    ...audioContract.inputPaths.map((path) => `- ${path}`),
    ...(correction ? [
      `- ${correction.guidancePath}`,
      `- ${correction.baselineOutputPath}`,
    ] : []),
    ...(correction ? [
      "",
      "Correction provenance (hash-bound campaign inputs; do not treat these as editorial content):",
      `- ${correction.baselinePointerPath}`,
      `- ${correction.baselineStatePath}`,
    ] : []),
    "",
    "Canonical Greek source provenance already embedded in the brief (name this for traceability, but do not open it separately):",
    `- raw/plato/greek/${dialogue}.txt`,
    "",
    "Contract:",
    "- Follow docs/commentary-protocol.md exactly and stay inside the brief's named section span.",
    "- Use the exact Luna model and stage effort stated here for invocation and provenance; all editorial and content rules in the protocol remain binding.",
    ...(correction ? [
      `- Treat ${correction.guidancePath} as binding serial editorial feedback. Directly correct every listed issue and return a complete replacement candidate under the supplied schema, not a patch or commentary about the correction.`,
      `- ${correction.baselineOutputPath} is the rejected, noncanonical baseline named by the paired pointer. Use it only to understand and correct the feedback; preserve only material that the guidance explicitly authorizes, and do not repeat a rejected defect.`,
      "- The archived state and pointer establish provenance only. They do not make the rejected baseline canonical or override the unit brief, protocol, guidance, schema, or this contract.",
    ] : []),
    `- Set schema_version to 1, dialogue to ${dialogue}, unit_key to ${unitKey}, and section_id to ${sectionId}.`,
    `- Set authoring.model to ${COMMENTARY_AUTHORING_MODEL} and authoring.effort to ${COMMENTARY_STAGE_EFFORT.draft}.`,
    "- Use only block_kind context, argument, notice, crossref, or question, with placement before or after.",
    "- Do not create a section block and do not assign commentary_id, source_ref, author, review_status, or title.",
    "- Return zero to three blocks. Return an empty blocks array when no interruption would improve the listening experience.",
    "- One block is the normal ceiling. Return two or three only when each performs a distinct, indispensable job that cannot be combined without harming clarity.",
    "- Each block must do one job, add value beyond recap, and be understandable in one hearing; target 45-130 spoken words.",
    "- The brief includes the existing section commentary. Do not restate, expand, or paraphrase it; a new block must contribute a distinct listening value that the section does not already provide.",
    "- Avoid reusable school-commentary openings such as repeated 'notice', 'watch', 'keep in mind', or 'ask yourself'.",
    "- Do not inventory the unit. Preserve dramatic flow and prefer silence to a redundant or generic block.",
    "- Do not assign a speaker's motive, telegraph a later result as inevitable, or phrase a leading question whose answer the prose has already decided.",
    "- Every insertion boundary must be exact and turn-safe. By default placement before uses the start of the anchor marker and placement after uses the end of the anchor marker.",
    ...audioContract.promptLines,
    "- Every checkable assertion must cite only an exact accepted record ID printed in this unit brief.",
    "- Never invent, repair, infer, or autocomplete a citation ID. Authorial framing is not evidence: it cannot introduce unsupported historical, biographical, chronological, comparative, motive, dialogue-global, or forward-looking facts. If the printed source and accepted records do not support a checkable assertion, omit it.",
    "- Crossrefs must name a canonical work and exact span that the brief actually supports; otherwise return no crossref.",
    "- Do not duplicate source text, pad the unit, or repeat another block's point.",
    "- This JSON is an isolated candidate. Never read or write wiki/commentary/<dialogue>.md.",
  ].join("\n");
}

function auditPrompt(_brief: CommentaryAuditBrief, _sourceWork: string) {
  return [
    `You are one isolated independent ${COMMENTARY_AUTHORING_MODEL} ${COMMENTARY_STAGE_EFFORT.audit}-effort commentary quality auditor for a single section of Plato.`,
    "Your only task is to judge the existing commentary in this single section as spoken audio commentary. Do not edit any file.",
    "Return only the structured JSON requested by the supplied JSON Schema.",
    "The exact hash-bound audit brief and complete quality contract are appended as one input packet.",
    "Judge only from that packet. Do not use tools or read workspace files.",
    "",
    "Contract:",
    "- Set schema_version to 3 and copy dialogue, unit_key, section_id, and the exhaustive commentary_id order exactly from the audit brief.",
    `- Set authoring.model to ${COMMENTARY_AUTHORING_MODEL} and authoring.effort to ${COMMENTARY_STAGE_EFFORT.audit}.`,
    "- Assess every listed commentary_id exactly once and in that order.",
    "- Apply the embedded quality contract in full. Check evidence, exact playback placement, and listening quality independently; continue after the first defect and finish with the required cross-block pass.",
    "- For evidence, inventory every checkable assertion internally and test actor, object, scope, modality, quantifier, time, grammatical referent, and cited support against only the printed source and accepted evidence.",
    "- For placement, use only each block's Exact English playback insertion edge. Compare what is printed immediately before and after it; never substitute a raw Greek or marker boundary.",
    `- Set checks.placement.hazard_codes to a unique array using only: ${COMMENTARY_PLACEMENT_HAZARD_CODES.join(", ")}. Placement verdict must be fail exactly when this array is non-empty; use an empty array only when placement passes.`,
    "- Any failed placement check requires disposition remove because the serial rewrite lane preserves the anchor and placement; do not claim prose-only rewriting can repair an unsafe edge.",
    "- Give each block exactly one disposition: pass, rewrite, remove, or split. Pass only when evidence, placement, and listening all pass. Every failed check must have a matching issue code, and every issue code must correspond to a failed check.",
    `- Use only these closed issue codes: ${COMMENTARY_QUALITY_ISSUE_CODES.join(", ")}.`,
    "- Set unit_verdict to pass exactly when every listed block passes; otherwise set it to fail.",
    `- Write exactly one concrete summary rationale per block, at or below ${COMMENTARY_QUALITY_AUDIT_RATIONALE_TARGET_MAX_LENGTH} characters. It must cover every failure and, for placement, name both sides of the edge. End cleanly; never output clipped or malformed prose.`,
    "- Do not write replacement prose, propose revised sentences, add fields, change review_status, or write to wiki/commentary.",
    "- Existing acceptance is provenance, not a quality presumption.",
    "- This must be one exhaustive audit, not a retry-to-green loop. A current semantic failure proceeds to rewrite; it is not re-audited unchanged.",
    "- The audit brief is content-addressed and exhaustive for this unit.",
  ].join("\n");
}

function rewritePrompt(
  brief: CommentaryAuditBrief,
  sourceWork: string,
  auditJob: CommentaryCampaignJob,
  auditOutputSha256: string,
  audit: CommentaryQualityAudit,
  failedIds: string[],
  rewriteEvidencePath?: string,
  rewriteGuidancePath?: string,
  rewriteConstraintsPath?: string,
) {
  const findings = audit.blocks
    .filter((block) => failedIds.includes(block.commentary_id))
    .map(
      (block) =>
        `- ${block.commentary_id}: disposition=${block.disposition}; issues=${block.issue_codes.join(",")}; evidence=${block.checks.evidence.verdict}; placement=${block.checks.placement.verdict}; listening=${block.checks.listening.verdict}; summary=${block.rationale}`,
    );
  return [
    `You are one isolated ${COMMENTARY_AUTHORING_MODEL} high-effort commentary rewrite subagent for Plato's ${sourceWork} (${brief.dialogue}).`,
    "Your only task is to propose bounded replacement prose for the failed commentary blocks in this single audited section. Do not edit any file.",
    "Return only the structured JSON requested by the supplied JSON Schema.",
    "",
    "The only files you may read:",
    "- docs/commentary-protocol.md",
    `- ${brief.path}`,
    `- ${auditJob.output_path}`,
    ...(rewriteEvidencePath ? [`- ${rewriteEvidencePath}`] : []),
    ...(rewriteGuidancePath ? [`- ${rewriteGuidancePath}`] : []),
    ...(rewriteConstraintsPath ? [`- ${rewriteConstraintsPath}`] : []),
    "",
    "Failed audit findings:",
    ...findings,
    "",
    "Contract:",
    "- Use the exact Luna model and stage effort stated here for invocation and provenance; all editorial and content rules in the protocol remain binding.",
    `- Set schema_version to 1, dialogue to ${brief.dialogue}, unit_key to ${brief.unitKey}, and section_id to ${brief.sectionId}.`,
    `- Bind audit_output.path to ${auditJob.output_path} and audit_output.sha256 to ${auditOutputSha256}.`,
    `- Set authoring.model to ${COMMENTARY_AUTHORING_MODEL} and authoring.effort to ${COMMENTARY_STAGE_EFFORT.rewrite}.`,
    `- Return exactly these failed commentary ids, once each and in this order: ${failedIds.join(", ")}.`,
    "- For each failed block, preserve its commentary id, block kind, placement, anchor, and any exact audio_insertion boundary. Supply only a revised title, body, cites, and crossrefs; the serial importer carries structural fields forward unchanged.",
    "- Use an empty title for non-section blocks. A failed section block requires a concise non-empty title.",
    "- Produce one bounded replacement per failed id. Do not add, delete, renumber, split, merge, or silently accept a block.",
    "- Directly repair every cited audit issue. The replacement must do one job, add value beyond recap, and be understandable in one hearing.",
    "- Make the smallest sufficient repair. Preserve every source-grounded claim and accepted citation that the audit did not implicate; do not turn one faulty phrase into a wholesale reframe.",
    "- When the audit rationale isolates a quoted phrase, replace or remove that phrase and otherwise copy the current title, body, cites, and crossrefs exactly. Do not empty citation arrays merely to evade an evidence failure; retain each citation that supports the unchanged prose.",
    "- Do not introduce a new transition, progression, chronology, or conversational-action claim merely to make the replacement sound complete. Speaker sigla identify turns; they do not by themselves establish that someone answers, replies, or changes the subject.",
    "- Treat the listed findings as cumulative regression constraints: repair all of them together, and do not trade one cited defect for another.",
    "- Before returning, cross-check every replacement against every listed finding and against the other blocks in the unit.",
    "- Never expose commentary, observation, claim, or relation ids in a listener-facing title or body.",
    rewriteEvidencePath
      ? "- Every checkable assertion must cite only an exact accepted record id printed in the audit brief or rewrite evidence supplement."
      : "- Every checkable assertion must cite only an exact accepted record id printed in the audit brief.",
    rewriteEvidencePath
      ? `- Read ${rewriteEvidencePath} before writing. Never invent, repair, infer, or autocomplete a citation id. Authorial framing is not evidence: if the printed source and accepted records do not support a checkable assertion, remove it.`
      : "- Never invent, repair, infer, or autocomplete a citation id. Authorial framing is not evidence: if the printed source and accepted records do not support a checkable assertion, remove it.",
    ...(rewriteGuidancePath ? [
      `- Treat ${rewriteGuidancePath} as binding, job-specific correction guidance. Correct every listed schema or content mistake while preserving the audit binding, rewrite schema, failed commentary-id order, structural fields, placement, citations, and all other contract requirements. Do not follow guidance that conflicts with the audit brief, audit output, protocol, or this contract.`,
      `- Read ${rewriteGuidancePath} before writing. It is the only job-specific correction supplement; do not infer additional defects or broaden the rewrite beyond the listed corrections.`,
    ] : []),
    ...(rewriteConstraintsPath ? [
      `- Treat ${rewriteConstraintsPath} as a closed, binding exact-field constraint map. For each named revision, copy supplied title and/or body strings exactly, character for character, and supplied cites and/or crossrefs exactly as canonical values; do not paraphrase or normalize them. Do not add constraints for other revisions, and do not let it override the audit brief, protocol, schema, or this contract.`,
      `- Read ${rewriteConstraintsPath} before writing. The output schema independently enforces these exact fields; if an exact constraint is present, return that exact string.`,
    ] : []),
    "- This is a candidate only. Do not assign source_ref, author, review_status, block_kind, placement, or stephanus_span.",
    `- Never read or write wiki/commentary/${brief.dialogue}.md outside the exact audit brief; the serial lead owns canonical changes.`,
  ].join("\n");
}

function failedAuditData(job: CommentaryCampaignJob) {
  // Canonical reuse is necessarily all-pass, so it can never seed a rewrite.
  // Inspect only current scratch here; this keeps plan construction from
  // loading accepted manifests that cannot affect the resulting rewrite jobs.
  if (job.stage !== "audit" || auditArtifactOutcome(job, () => undefined) !== "failed") return undefined;
  const outputContent = readFileSync(join(getRepoRoot(), job.output_path), "utf8");
  const audit = validateJobOutput(job, JSON.parse(outputContent) as unknown) as CommentaryQualityAudit;
  const failedIds = audit.blocks
    .filter((block) => block.disposition === "rewrite")
    .map((block) => block.commentary_id);
  if (failedIds.length === 0) return undefined;
  return { audit, failedIds, outputSha256: sha256(outputContent) };
}

function rewriteTitleConstraintsFor(
  dialogue: string,
  failedIds: readonly string[],
): CommentaryRewriteTitleConstraint[] {
  const ledgerPath = join(getRepoRoot(), `wiki/commentary/${dialogue}.md`);
  const blocksById = new Map(
    commentaryMarkdownBlocks(readFileSync(ledgerPath, "utf8")).map((block) => [
      fieldValue(block.content, "commentary_id") ?? "",
      block,
    ]),
  );
  return failedIds.map((commentaryId) => {
    const block = blocksById.get(commentaryId);
    if (!block) throw new Error(`Rewrite target is not a current block: ${dialogue}/${commentaryId}`);
    return {
      commentary_id: commentaryId,
      block_kind: fieldValue(block.content, "block_kind") === "section" ? "section" : "non-section",
    };
  });
}

function codexArgs(job: {
  stage: CommentaryCampaignStage;
  prompt: string;
  schemaPath: string;
  modelCatalogPath: string;
}) {
  const effort = COMMENTARY_STAGE_EFFORT[job.stage];
  return [
    "exec",
    "--model",
    COMMENTARY_MODEL_ARGUMENT,
    "-c",
    `model_reasoning_effort=${effort}`,
    "--sandbox",
    "read-only",
    "--ephemeral",
    "--json",
    "--output-schema",
    job.schemaPath,
    "-c",
    `model_catalog_json=${JSON.stringify(job.modelCatalogPath)}`,
    ...COMMENTARY_CODEX_ISOLATION_CONFIG.flatMap((entry) => ["-c", entry]),
    "--ignore-user-config",
    "--ignore-rules",
    "--strict-config",
    job.prompt,
  ];
}

function commentaryCampaignSchemaPath(
  dialogue: string,
  stage: CommentaryCampaignStage,
  unitKey?: string,
) {
  return `scratch/commentary/schemas/${dialogue}-${stage}-${unitKey ?? "outline"}.json`;
}

function buildJob(base: {
  stage: CommentaryCampaignStage;
  dialogue: string;
  unitKey?: string;
  sectionId?: string;
  inputPaths: string[];
  prompt: string;
  schema: unknown;
  codexExecutable: string;
  auditBrief?: CommentaryAuditBrief;
  rewriteAudit?: {
    auditJob: CommentaryCampaignJob;
    audit: CommentaryQualityAudit;
    failedIds: string[];
    outputSha256: string;
  };
  rewriteTitleConstraints?: CommentaryRewriteTitleConstraint[];
  rewriteExactConstraints?: CommentaryRewriteExactConstraint[];
  outlineReplacement?: boolean;
}, context: CommentaryCampaignBuildContext): CommentaryCampaignJob {
  const effort = COMMENTARY_STAGE_EFFORT[base.stage];
  const modelCatalog = context.modelCatalog;
  const inputFiles = fileSnapshot([...base.inputPaths, COMMENTARY_MODEL_CATALOG_PATH], context);
  const outputSchema = base.stage === "rewrite" && base.rewriteTitleConstraints
    ? commentaryRewriteOutputSchema(base.rewriteTitleConstraints, base.rewriteExactConstraints ?? [])
    : base.schema;
  assertCommentaryStructuredOutputSchemaCompatible(outputSchema, `${base.stage} output schema`);
  const outputSchemaSha256 = sha256(stableJson(outputSchema));
  const promptSha256 = sha256(base.prompt);
  const inputSha256 = commentaryCampaignInputSha256({
    stage: base.stage,
    dialogue: base.dialogue,
    ...(base.unitKey ? { unit_key: base.unitKey } : {}),
    ...(base.sectionId ? { section_id: base.sectionId } : {}),
    ...(base.outlineReplacement ? { outline_replacement: true } : {}),
    ...(base.auditBrief ? {
      commentary_ids: base.auditBrief.commentaryIds,
      audit_brief_sha256: base.auditBrief.sha256,
      audit_brief_path: base.auditBrief.path,
    } : {}),
    ...(base.rewriteAudit ? {
      failed_commentary_ids: base.rewriteAudit.failedIds,
      audit_output_path: base.rewriteAudit.auditJob.output_path,
      audit_output_sha256: base.rewriteAudit.outputSha256,
    } : {}),
    ...(base.rewriteTitleConstraints ? { rewrite_title_constraints: base.rewriteTitleConstraints } : {}),
    ...(base.rewriteExactConstraints ? { rewrite_exact_constraints: base.rewriteExactConstraints } : {}),
    model_argument: COMMENTARY_MODEL_ARGUMENT,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: modelCatalog.sha256,
    authoring_model: COMMENTARY_AUTHORING_MODEL,
    effort,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    input_files: inputFiles,
    prompt_sha256: promptSha256,
    output_schema_sha256: outputSchemaSha256,
  });
  const shortHash = inputSha256.slice(0, 16);
  const jobId = base.stage === "outline"
    ? `outline:${base.dialogue}:${shortHash}`
    : `${base.stage}:${base.dialogue}:${base.unitKey}`;
  const outputPath = base.stage === "outline"
    ? `scratch/commentary/outlines/${base.dialogue}/outline-${shortHash}.json`
    : base.stage === "audit"
      ? `scratch/commentary/audits/${base.dialogue}/${base.unitKey}.json`
      : base.stage === "rewrite"
        ? `scratch/commentary/rewrites/${base.dialogue}/${base.unitKey}.json`
        : `scratch/commentary/drafts/${base.dialogue}/${base.unitKey}.json`;
  const statePath = base.stage === "outline"
    ? `scratch/commentary/campaign-state/${base.dialogue}/outline-${shortHash}.json`
    : `scratch/commentary/campaign-state/${base.dialogue}/${base.stage}-${base.unitKey}.json`;
  const schemaPath = commentaryCampaignSchemaPath(base.dialogue, base.stage, base.unitKey);
  const args = codexArgs({
    stage: base.stage,
    prompt: base.prompt,
    schemaPath,
    modelCatalogPath: modelCatalog.absolutePath,
  });
  const serialHandoff = base.stage === "outline"
      ? [
          `bun scripts/commentary/commentary-campaign.ts ${base.outlineReplacement ? "outline-replace-preview" : "outline-preview"} ${base.dialogue} ${outputPath}`,
          `bun scripts/commentary/commentary-campaign.ts ${base.outlineReplacement ? "outline-replace-apply" : "outline-apply"} ${base.dialogue} ${outputPath}`,
          `bun run harness commentary briefs ${base.dialogue}`,
        ]
      : base.stage === "audit"
        ? [
            "No canonical apply command: audit JSON records findings only.",
            "bun scripts/commentary/commentary-campaign.ts status --write",
            `If an operator-delegated Luna result is supplied, validate it with bun run harness commentary delegated-audit-preview ${base.dialogue} ${base.unitKey} <candidate-path>, then use delegated-audit-apply after preview approval.`,
          ]
        : base.stage === "rewrite"
          ? [
              `bun scripts/commentary/commentary-campaign.ts rewrite-preview ${base.dialogue} ${outputPath}`,
              `bun scripts/commentary/commentary-campaign.ts rewrite-apply ${base.dialogue} ${outputPath}`,
              "Record review-status provenance, then run bun run validate before the next audit.",
            ]
        : [
          `bun run harness commentary draft-preview ${base.dialogue} ${outputPath}`,
          `bun run harness commentary draft-apply ${base.dialogue} ${outputPath}`,
          "bun run validate",
        ];

  return {
    schema_version: CAMPAIGN_SCHEMA_VERSION,
    job_id: jobId,
    stage: base.stage,
    dialogue: base.dialogue,
    ...(base.unitKey ? { unit_key: base.unitKey } : {}),
    ...(base.sectionId ? { section_id: base.sectionId } : {}),
    ...(base.outlineReplacement ? { outline_replacement: true as const } : {}),
    ...(base.auditBrief ? {
      commentary_ids: base.auditBrief.commentaryIds,
      audit_brief_sha256: base.auditBrief.sha256,
      audit_brief_path: base.auditBrief.path,
    } : {}),
    ...(base.rewriteAudit ? {
      failed_commentary_ids: base.rewriteAudit.failedIds,
      audit_output_path: base.rewriteAudit.auditJob.output_path,
      audit_output_sha256: base.rewriteAudit.outputSha256,
    } : {}),
    ...(base.rewriteTitleConstraints ? { rewrite_title_constraints: base.rewriteTitleConstraints } : {}),
    ...(base.rewriteExactConstraints ? { rewrite_exact_constraints: base.rewriteExactConstraints } : {}),
    model_argument: COMMENTARY_MODEL_ARGUMENT,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: modelCatalog.sha256,
    authoring_model: COMMENTARY_AUTHORING_MODEL,
    effort,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    session_name: `plato-commentary-${base.dialogue}-${base.stage === "outline" ? "outline" : base.stage === "audit" ? `audit-${base.unitKey}` : base.stage === "rewrite" ? `rewrite-${base.unitKey}` : base.unitKey}`,
    input_files: inputFiles,
    prompt: base.prompt,
    prompt_sha256: promptSha256,
    output_schema_sha256: outputSchemaSha256,
    input_sha256: inputSha256,
    output_path: outputPath,
    state_path: statePath,
    command: { executable: base.codexExecutable, args },
    serial_handoff: serialHandoff,
  };
}

type LedgerSnapshot = {
  exists: boolean;
  sections: Array<{ id: string; span: string }>;
  sectionScaffoldCount: number;
  blockCount: number;
  nonSectionCount: number;
  acceptedCount: number;
  accepted: boolean;
};

function ledgerSnapshot(dialogue: string): LedgerSnapshot {
  const path = join(getRepoRoot(), `wiki/commentary/${dialogue}.md`);
  if (!existsSync(path)) {
    return {
      exists: false,
      sections: [],
      sectionScaffoldCount: 0,
      blockCount: 0,
      nonSectionCount: 0,
      acceptedCount: 0,
      accepted: false,
    };
  }
  const blocks = commentaryMarkdownBlocks(readFileSync(path, "utf8"));
  const activeBlocks = blocks.filter((block) => fieldValue(block.content, "review_status") !== "rejected");
  const sectionScaffoldCount = blocks.filter((block) => fieldValue(block.content, "block_kind") === "section").length;
  // Rejected section prose remains a deterministic unit scaffold for audit
  // grouping even though the rejected block itself is excluded from the
  // active listener-facing content.
  const sections = blocks
    .filter((block) => fieldValue(block.content, "block_kind") === "section")
    .map((block) => ({
      id: fieldValue(block.content, "commentary_id") ?? "",
      span: fieldValue(block.content, "stephanus_span") ?? "",
    }));
  const acceptedCount = activeBlocks.filter((block) => fieldValue(block.content, "review_status") === "accepted").length;
  const nonSectionCount = activeBlocks.filter(
    (block) => fieldValue(block.content, "block_kind") !== "section",
  ).length;
  return {
    exists: true,
    sections,
    sectionScaffoldCount,
    blockCount: activeBlocks.length,
    nonSectionCount,
    acceptedCount,
    accepted: activeBlocks.length > 0 && acceptedCount === activeBlocks.length,
  };
}

type BriefSnapshot = { path: string; unitKey: string; sectionId: string };

function dialogueBriefs(dialogue: string, ledger: LedgerSnapshot): BriefSnapshot[] {
  const directory = join(getRepoRoot(), `scratch/commentary/briefs/${dialogue}`);
  if (!existsSync(directory)) return [];
  const sectionIds = new Set(ledger.sections.map((section) => section.id));
  const seen = new Set<string>();
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => {
      const path = `scratch/commentary/briefs/${dialogue}/${entry.name}`;
      const content = readFileSync(join(getRepoRoot(), path), "utf8");
      const sectionId = /^- section:\s*(\S+)\s*$/mu.exec(content)?.[1];
      if (!sectionId || !sectionIds.has(sectionId)) {
        throw new Error(`Brief ${path} does not name a current section in wiki/commentary/${dialogue}.md`);
      }
      if (seen.has(sectionId)) throw new Error(`Multiple briefs name section ${sectionId} for ${dialogue}`);
      seen.add(sectionId);
      return { path, unitKey: basename(entry.name, ".md"), sectionId };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function draftCorrectionInputs(
  dialogue: string,
  unitKey: string,
  sectionId: string,
): DraftCorrectionInputs | undefined {
  const repoRoot = getRepoRoot();
  const guidancePath = `scratch/commentary/draft-guidance/${dialogue}/${unitKey}.md`;
  const baselinePointerPath = `scratch/commentary/draft-guidance/${dialogue}/${unitKey}.baseline`;
  const guidanceExists = existsSync(join(repoRoot, guidancePath));
  const baselinePointerExists = existsSync(join(repoRoot, baselinePointerPath));
  if (guidanceExists !== baselinePointerExists) {
    throw new Error(`Draft correction requires paired ${guidancePath} and ${baselinePointerPath}`);
  }
  if (!guidanceExists) return undefined;

  nonEmptyString(readFileSync(join(repoRoot, guidancePath), "utf8"), guidancePath);
  const baselineOutput = normalizeRepoPath(
    nonEmptyString(readFileSync(join(repoRoot, baselinePointerPath), "utf8"), baselinePointerPath),
  );
  const expectedDirectory = `scratch/commentary/campaign-history/${dialogue}`;
  const expectedPrefix = `draft-${unitKey}-`;
  const outputName = basename(baselineOutput.relativePath);
  const archiveMatch = outputName.startsWith(expectedPrefix)
    ? /^([a-f0-9]{16})-retry-([0-9]{4})\.output\.json$/u.exec(outputName.slice(expectedPrefix.length))
    : null;
  if (dirname(baselineOutput.relativePath) !== expectedDirectory || !archiveMatch) {
    throw new Error(
      `${baselinePointerPath} must name a draft retry output for ${dialogue}/${unitKey} directly inside ${expectedDirectory}`,
    );
  }
  if (!existsSync(baselineOutput.absolutePath)) {
    throw new Error(`${baselinePointerPath} names a missing archived output: ${baselineOutput.relativePath}`);
  }
  const baselineStatePath = baselineOutput.relativePath.replace(/\.output\.json$/u, ".state.json");
  const baselineStateAbsolutePath = join(repoRoot, baselineStatePath);
  if (!existsSync(baselineStateAbsolutePath)) {
    throw new Error(`${baselinePointerPath} requires matching archived state: ${baselineStatePath}`);
  }

  const outputContent = readFileSync(baselineOutput.absolutePath, "utf8");
  const stateContent = readFileSync(baselineStateAbsolutePath, "utf8");
  const draft = parseCommentaryUnitDraft(readJson(baselineOutput.absolutePath), baselineOutput.relativePath);
  if (draft.dialogue !== dialogue || draft.unit_key !== unitKey || draft.section_id !== sectionId) {
    throw new Error(`${baselinePointerPath} archived draft identity does not match ${dialogue}/${unitKey}/${sectionId}`);
  }
  const state = parseJobState(readJson(baselineStateAbsolutePath), baselineStatePath);
  const expectedState = {
    job_id: `draft:${dialogue}:${unitKey}`,
    stage: "draft" as const,
    output_schema_sha256: sha256(stableJson(COMMENTARY_UNIT_DRAFT_JSON_SCHEMA)),
    model_argument: COMMENTARY_MODEL_ARGUMENT,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: readCommentaryModelCatalog().sha256,
    authoring_model: COMMENTARY_AUTHORING_MODEL,
    effort: COMMENTARY_STAGE_EFFORT.draft,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    output_path: `scratch/commentary/drafts/${dialogue}/${unitKey}.json`,
    output_sha256: sha256(outputContent),
  };
  for (const [field, expectedValue] of Object.entries(expectedState)) {
    if (state[field as keyof JobState] !== expectedValue) {
      throw new Error(`${baselinePointerPath} archived state.${field} does not match its rejected draft`);
    }
  }
  const pairHash = sha256(
    stableJson({
      output_exists: true,
      output_sha256: sha256(outputContent),
      state_exists: true,
      state_sha256: sha256(stateContent),
    }),
  ).slice(0, 16);
  if (archiveMatch[1] !== pairHash) {
    throw new Error(`${baselinePointerPath} archived output/state pair hash does not match its retry filename`);
  }

  return {
    guidancePath,
    baselinePointerPath,
    baselineOutputPath: baselineOutput.relativePath,
    baselineStatePath,
  };
}

function validateDraftCorrectionDirectory(dialogue: string, briefs: BriefSnapshot[]) {
  const relativeDirectory = `scratch/commentary/draft-guidance/${dialogue}`;
  const absoluteDirectory = join(getRepoRoot(), relativeDirectory);
  if (!existsSync(absoluteDirectory)) return;
  const currentUnits = new Set(briefs.map((brief) => brief.unitKey));
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    if (!entry.isFile()) {
      throw new Error(`Draft correction directory contains a non-file artifact: ${relativeDirectory}/${entry.name}`);
    }
    const unitKey = entry.name.endsWith(".baseline")
      ? entry.name.slice(0, -".baseline".length)
      : entry.name.endsWith(".md")
        ? entry.name.slice(0, -".md".length)
        : "";
    if (!UNIT_KEY.test(unitKey) || !currentUnits.has(unitKey)) {
      throw new Error(`Draft correction artifact does not name a current unit: ${relativeDirectory}/${entry.name}`);
    }
  }
}

type RewriteGuidance = {
  path?: string;
  constraintsPath?: string;
  exactConstraints: CommentaryRewriteExactConstraint[];
};

function readRewriteGuidance(path: string): RewriteGuidance {
  const absolutePath = join(getRepoRoot(), path);
  const content = readFileSync(absolutePath, "utf8");
  if (content.includes("\0")) {
    throw new Error(`${path} must be valid UTF-8 Markdown without NUL characters`);
  }
  const normalized = nonEmptyString(content, path);
  if (normalized.length > COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS) {
    throw new Error(
      `${path} exceeds the ${COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS}-character rewrite-guidance limit`,
    );
  }
  return { path, exactConstraints: [] };
}

function readRewriteExactConstraints(
  path: string,
  currentBlockById: ReadonlyMap<string, { content: string }>,
): CommentaryRewriteExactConstraint[] {
  const record = objectValue(readJson(join(getRepoRoot(), path)), path);
  exactKeys(record, ["schema_version", "constraints"], path);
  if (record.schema_version !== 1) throw new Error(`${path}.schema_version must be 1`);
  const constraintsRecord = objectValue(record.constraints, `${path}.constraints`);
  const entries = Object.entries(constraintsRecord);
  if (entries.length === 0) throw new Error(`${path}.constraints must contain at least one commentary id`);
  return entries.map(([commentaryId, value]) => {
    const entryPath = `${path}.constraints.${commentaryId}`;
    const current = currentBlockById.get(commentaryId);
    if (!current) throw new Error(`${entryPath} names an unknown current commentary id`);
    const constraint = objectValue(value, entryPath);
    exactKeys(constraint, ["title", "body", "cites", "crossrefs"], entryPath, []);
    if (!("title" in constraint) && !("body" in constraint) && !("cites" in constraint) && !("crossrefs" in constraint)) {
      throw new Error(`${entryPath} must constrain title, body, cites, and/or crossrefs`);
    }
    const title = "title" in constraint
      ? (() => {
          if (typeof constraint.title !== "string") throw new Error(`${entryPath}.title must be a string`);
          if (constraint.title.length > COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS) {
            throw new Error(`${entryPath}.title exceeds the ${COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS}-character limit`);
          }
          const kind = fieldValue(current.content, "block_kind");
          if (kind === "section" && constraint.title.trim().length === 0) {
            throw new Error(`${entryPath}.title must be non-empty for a section block`);
          }
          if (kind !== "section" && constraint.title !== "") {
            throw new Error(`${entryPath}.title must be exactly empty for a non-section block`);
          }
          return constraint.title;
        })()
      : undefined;
    const body = "body" in constraint
      ? (() => {
          if (typeof constraint.body !== "string" || constraint.body.trim().length === 0) {
            throw new Error(`${entryPath}.body must be a non-empty string`);
          }
          if (constraint.body.length > COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS) {
            throw new Error(`${entryPath}.body exceeds the ${COMMENTARY_REWRITE_GUIDANCE_MAX_CHARS}-character limit`);
          }
          return constraint.body;
        })()
      : undefined;
    const cites = "cites" in constraint
      ? parseOutlineCites(constraint.cites, `${entryPath}.cites`)
      : undefined;
    const crossrefs = "crossrefs" in constraint
      ? parseRewriteCrossrefs(constraint.crossrefs, `${entryPath}.crossrefs`)
      : undefined;
    return {
      commentary_id: commentaryId,
      ...(title !== undefined ? { title } : {}),
      ...(body !== undefined ? { body } : {}),
      ...(cites !== undefined ? { cites } : {}),
      ...(crossrefs !== undefined ? { crossrefs } : {}),
    };
  });
}

function validateRewriteGuidanceDirectory(dialogue: string, briefs: readonly BriefSnapshot[]) {
  const relativeDirectory = `scratch/commentary/rewrite-guidance/${dialogue}`;
  const absoluteDirectory = join(getRepoRoot(), relativeDirectory);
  if (!existsSync(absoluteDirectory)) return new Map<string, RewriteGuidance>();
  const currentUnits = new Set(briefs.map((brief) => brief.unitKey));
  const currentBlockById = new Map(
    commentaryMarkdownBlocks(readFileSync(join(getRepoRoot(), `wiki/commentary/${dialogue}.md`), "utf8")).map((block) => [
      fieldValue(block.content, "commentary_id") ?? "",
      block,
    ]),
  );
  const currentCommentaryIds = new Set(currentBlockById.keys());
  const guidance = new Map<string, RewriteGuidance>();
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    if (!entry.isFile()) {
      throw new Error(`Rewrite guidance directory contains a non-file artifact: ${relativeDirectory}/${entry.name}`);
    }
    const isMarkdown = entry.name.endsWith(".md");
    const isConstraints = entry.name.endsWith(".constraints.json");
    if (!isMarkdown && !isConstraints) {
      throw new Error(`Rewrite guidance artifact must be Markdown or constraints JSON: ${relativeDirectory}/${entry.name}`);
    }
    const unitKey = isMarkdown
      ? basename(entry.name, ".md")
      : basename(entry.name, ".constraints.json");
    if (!UNIT_KEY.test(unitKey) || !currentUnits.has(unitKey)) {
      throw new Error(`Rewrite guidance artifact does not name a current unit: ${relativeDirectory}/${entry.name}`);
    }
    const current = guidance.get(unitKey) ?? { exactConstraints: [] };
    if (isMarkdown) {
      if (current.path) throw new Error(`Rewrite guidance duplicates ${relativeDirectory}/${unitKey}.md`);
      current.path = `${relativeDirectory}/${entry.name}`;
      readRewriteGuidance(current.path);
    } else {
      if (current.constraintsPath) {
        throw new Error(`Rewrite constraints duplicate ${relativeDirectory}/${unitKey}.constraints.json`);
      }
      current.constraintsPath = `${relativeDirectory}/${entry.name}`;
      current.exactConstraints = readRewriteExactConstraints(current.constraintsPath, currentBlockById);
      for (const constraint of current.exactConstraints) {
        if (!currentCommentaryIds.has(constraint.commentary_id)) {
          throw new Error(`${current.constraintsPath} names a commentary id outside the current audit units: ${constraint.commentary_id}`);
        }
      }
    }
    guidance.set(unitKey, current);
  }
  return guidance;
}

function activeDraftArtifactPaths(dialogue: string) {
  return [
    `scratch/commentary/drafts/${dialogue}`,
    `scratch/commentary/campaign-state/${dialogue}`,
  ].flatMap((relativeDirectory) => {
    const absoluteDirectory = join(getRepoRoot(), relativeDirectory);
    if (!existsSync(absoluteDirectory)) return [];
    return readdirSync(absoluteDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && (
        relativeDirectory.includes("/drafts/")
          ? entry.name.endsWith(".json")
          : entry.name.startsWith("draft-") && entry.name.endsWith(".json")
      ))
      .map((entry) => `${relativeDirectory}/${entry.name}`);
  });
}

export function buildCommentaryCampaignPlan(
  options: CommentaryCampaignBuildOptions = {},
): CommentaryCampaignPlan {
  if (options.reviseOutline && (!options.dialogue || options.stage !== "outline")) {
    throw new Error("reviseOutline requires one --dialogue and --stage outline");
  }
  const dialogues = options.dialogue ? [options.dialogue] : listGreekDialogues();
  const stage = options.stage ?? "all";
  const codexExecutable = options.codexExecutable ?? "codex";
  const modelCatalog = readCommentaryModelCatalog();
  const buildContext: CommentaryCampaignBuildContext = {
    modelCatalog,
    inputSha256ByPath: new Map([[COMMENTARY_MODEL_CATALOG_PATH, modelCatalog.sha256]]),
    generatedInputContentByPath: new Map(),
  };
  const jobs: CommentaryCampaignJob[] = [];
  let auditEvidence: CommentaryAuditEvidenceSnapshot | undefined;

  for (const dialogue of dialogues) {
    if (!DIALOGUE.test(dialogue) || !listGreekDialogues().includes(dialogue)) {
      throw new Error(`Unknown canonical dialogue: ${dialogue}`);
    }
    const ledger = ledgerSnapshot(dialogue);
    const sourceWork = sourceWorkFor(dialogue);
    if (options.reviseOutline) {
      const ledgerPath = `wiki/commentary/${dialogue}.md`;
      if (!ledger.exists || ledger.blockCount === 0 || ledger.nonSectionCount > 0) {
        throw new Error(`Outline revision requires a section-only commentary skeleton at ${ledgerPath}`);
      }
      const activeDrafts = activeDraftArtifactPaths(dialogue);
      if (activeDrafts.length > 0) {
        throw new Error(
          `Outline revision requires all active draft artifacts to be archived first: ${activeDrafts.join(", ")}`,
        );
      }
      const ledgerBlocks = commentaryMarkdownBlocks(readFileSync(join(getRepoRoot(), ledgerPath), "utf8"));
      if (
        ledgerBlocks.some(
          (block) =>
            fieldValue(block.content, "review_status") !== "unreviewed" ||
            fieldValue(block.content, "author") !== "model",
        )
      ) {
        throw new Error(`Outline revision requires every current section in ${ledgerPath} to remain unreviewed model output`);
      }
      const guidancePath = `scratch/commentary/outline-guidance/${dialogue}.md`;
      const baselinePointerPath = `scratch/commentary/outline-guidance/${dialogue}.baseline`;
      if (!existsSync(join(getRepoRoot(), guidancePath)) || !existsSync(join(getRepoRoot(), baselinePointerPath))) {
        throw new Error(`Outline revision requires ${guidancePath} and ${baselinePointerPath}`);
      }
      const baselinePath = normalizeRepoPath(
        nonEmptyString(readFileSync(join(getRepoRoot(), baselinePointerPath), "utf8"), baselinePointerPath),
      );
      const baseline = parseCommentaryOutline(readJson(baselinePath.absolutePath), baselinePath.relativePath);
      const baselineBlocks = baseline.sections.map((section, index) =>
        commentaryMarkdownBlocks(
          renderOutlineSection(dialogue, sourceWork, `comm_${dialogue}_${String(index + 1).padStart(4, "0")}`, section),
        )[0]!.content.trim()
      );
      if (stableJson(baselineBlocks) !== stableJson(ledgerBlocks.map((block) => block.content.trim()))) {
        throw new Error(`${baselinePointerPath} does not reproduce the current section skeleton in ${ledgerPath}`);
      }
      const inputPaths = [...outlineInputPaths(dialogue), ledgerPath];
      const prompt = outlinePrompt(dialogue, sourceWork, inputPaths);
      jobs.push(
        buildJob({
          stage: "outline",
          dialogue,
          inputPaths,
          prompt,
          schema: COMMENTARY_OUTLINE_JSON_SCHEMA,
          codexExecutable,
          outlineReplacement: true,
        }, buildContext),
      );
      continue;
    }
    if (
      ledger.sectionScaffoldCount > 0 &&
      (ledger.accepted || ledger.nonSectionCount > 0) &&
      stage !== "outline" &&
      stage !== "draft"
    ) {
      let rewriteEvidenceContext: ReturnType<typeof buildCommentaryRewriteEvidenceContext> | undefined;
      auditEvidence ??= buildCommentaryAuditEvidenceSnapshot();
      const auditBriefs = buildCommentaryAuditBriefs(dialogue, auditEvidence);
      const rewriteGuidance = stage === "all" || stage === "rewrite"
        ? validateRewriteGuidanceDirectory(dialogue, auditBriefs)
        : new Map<string, RewriteGuidance>();
      for (const brief of auditBriefs) {
        const prompt = auditPrompt(brief, sourceWork);
        const auditJob = buildJob({
          stage: "audit",
          dialogue,
          unitKey: brief.unitKey,
          sectionId: brief.sectionId,
          // The generated brief embeds every quality-bearing byte. Aggregate
          // ledger/source/evidence hashes would make unrelated edits reopen
          // sibling units even though their brief bytes are unchanged.
          inputPaths: brief.hashInputPaths,
          prompt,
          schema: COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
          codexExecutable,
          auditBrief: brief,
        }, buildContext);
        if (stage === "all" || stage === "audit") jobs.push(auditJob);
        if (stage === "all" || stage === "rewrite") {
          const failed = failedAuditData(auditJob);
          if (failed) {
            if (!brief.path || !existsSync(join(getRepoRoot(), brief.path))) {
              throw new Error(
                `Failed audit ${auditJob.job_id} is ready for rewrite but its exact audit brief is missing; run bun run harness commentary audit-briefs ${dialogue}`,
              );
            }
            const evidenceSupplement = buildCommentaryRewriteEvidenceSupplement(
              dialogue,
              brief,
              failed.failedIds,
              rewriteEvidenceContext ??= buildCommentaryRewriteEvidenceContext(dialogue, auditEvidence),
            );
            if (evidenceSupplement) {
              const previous = buildContext.generatedInputContentByPath.get(evidenceSupplement.path);
              if (previous !== undefined && previous !== evidenceSupplement.content) {
                throw new Error(`Conflicting generated campaign input: ${evidenceSupplement.path}`);
              }
              buildContext.generatedInputContentByPath.set(evidenceSupplement.path, evidenceSupplement.content);
            }
            const guidance = rewriteGuidance.get(brief.unitKey);
            const failedIdSet = new Set(failed.failedIds);
            for (const constraint of guidance?.exactConstraints ?? []) {
              if (!failedIdSet.has(constraint.commentary_id)) {
                throw new Error(
                  `${guidance?.constraintsPath ?? "rewrite constraints"} names ${constraint.commentary_id}, which is not a failed rewrite target in ${dialogue}/${brief.unitKey}`,
                );
              }
            }
            const rewriteGuidancePath = guidance?.path;
            const rewriteConstraintsPath = guidance?.constraintsPath;
            const rewrite = rewritePrompt(
              brief,
              sourceWork,
              auditJob,
              failed.outputSha256,
              failed.audit,
              failed.failedIds,
              evidenceSupplement?.path,
              rewriteGuidancePath,
              rewriteConstraintsPath,
            );
            jobs.push(
              buildJob({
                stage: "rewrite",
                dialogue,
                unitKey: brief.unitKey,
                sectionId: brief.sectionId,
                inputPaths: [
                  "docs/commentary-protocol.md",
                  brief.path,
                  auditJob.output_path,
                  ...(evidenceSupplement ? [evidenceSupplement.path] : []),
                  ...(rewriteGuidancePath ? [rewriteGuidancePath] : []),
                  ...(rewriteConstraintsPath ? [rewriteConstraintsPath] : []),
                ],
                prompt: rewrite,
                schema: COMMENTARY_REWRITE_JSON_SCHEMA,
                codexExecutable,
                rewriteAudit: {
                  auditJob,
                  audit: failed.audit,
                  failedIds: failed.failedIds,
                  outputSha256: failed.outputSha256,
                },
                ...((rewriteGuidancePath || rewriteConstraintsPath)
                  ? {
                      rewriteTitleConstraints: rewriteTitleConstraintsFor(dialogue, failed.failedIds),
                      ...(guidance?.exactConstraints.length
                        ? { rewriteExactConstraints: guidance.exactConstraints }
                        : {}),
                    }
                  : {}),
              }, buildContext),
            );
          }
        }
      }
    }
    // Once prose is present, the independent audit/rewrite lane owns quality.
    // Re-running draft jobs would duplicate already imported units and make the
    // serial importer reject their changed content-addressed provenance.
    if (ledger.accepted || ledger.nonSectionCount > 0) continue;
    if (ledger.sections.length === 0) {
      if (stage === "draft" || stage === "audit" || stage === "rewrite") continue;
      const inputPaths = outlineInputPaths(dialogue);
      const prompt = outlinePrompt(dialogue, sourceWork, inputPaths);
      jobs.push(
        buildJob({
          stage: "outline",
          dialogue,
          inputPaths,
          prompt,
          schema: COMMENTARY_OUTLINE_JSON_SCHEMA,
          codexExecutable,
        }, buildContext),
      );
      continue;
    }
    if (stage === "outline" || stage === "audit" || stage === "rewrite") continue;
    const briefs = dialogueBriefs(dialogue, ledger);
    validateDraftCorrectionDirectory(dialogue, briefs);
    for (const brief of briefs) {
      const correction = draftCorrectionInputs(dialogue, brief.unitKey, brief.sectionId);
      const prompt = draftPrompt(dialogue, sourceWork, brief.path, brief.unitKey, brief.sectionId, correction);
      jobs.push(
        buildJob({
          stage: "draft",
          dialogue,
          unitKey: brief.unitKey,
          sectionId: brief.sectionId,
          inputPaths: [
            "docs/commentary-protocol.md",
            brief.path,
            `raw/plato/greek/${dialogue}.txt`,
            `raw/plato/english/${dialogue}.txt`,
            ...audioInsertionContract(dialogue).inputPaths,
            ...(correction ? [
              correction.guidancePath,
              correction.baselinePointerPath,
              correction.baselineOutputPath,
              correction.baselineStatePath,
            ] : []),
          ],
          prompt,
          schema: COMMENTARY_UNIT_DRAFT_JSON_SCHEMA,
          codexExecutable,
        }, buildContext),
      );
    }
  }

  jobs.sort((a, b) => a.dialogue.localeCompare(b.dialogue) || a.stage.localeCompare(b.stage) || a.job_id.localeCompare(b.job_id));
  const manifest: CommentaryCampaignManifest = {
    schema_version: CAMPAIGN_SCHEMA_VERSION,
    campaign: COMMENTARY_CAMPAIGN_ID,
    dry_run_default: true,
    max_concurrency: MAX_CONCURRENCY,
    authoring: {
      model_argument: COMMENTARY_MODEL_ARGUMENT,
      codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
      model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
      model_catalog_sha256: modelCatalog.sha256,
      recorded_model: COMMENTARY_AUTHORING_MODEL,
      effort_by_stage: COMMENTARY_STAGE_EFFORT,
      permission_mode: COMMENTARY_PERMISSION_MODE,
    },
    jobs,
  };
  return {
    manifest,
    ...(auditEvidence ? { auditEvidence } : {}),
    generatedInputs: [...buildContext.generatedInputContentByPath]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, content]) => ({ path, content, sha256: sha256(content) })),
  };
}

export function buildCommentaryCampaignManifest(
  options: CommentaryCampaignBuildOptions = {},
): CommentaryCampaignManifest {
  return buildCommentaryCampaignPlan(options).manifest;
}

/**
 * Select an exact, single-dialogue quality-audit batch in canonical manifest
 * order. Unit keys are dialogue-local, so accepting them without both an
 * explicit dialogue and audit stage would make a seemingly narrow selector
 * fan out across unrelated campaign jobs.
 */
export function selectCommentaryCampaignJobs(
  manifest: CommentaryCampaignManifest,
  options: CommentaryCampaignJobSelectionOptions,
): CommentaryCampaignJob[] {
  if (!DIALOGUE.test(options.dialogue)) throw new Error(`Invalid dialogue slug: ${options.dialogue}`);
  if (options.stage !== "audit") {
    throw new Error("Explicit commentary unit selection is limited to --stage audit");
  }
  if (options.unitKeys.length === 0) {
    throw new Error("Explicit commentary unit selection requires at least one --unit-key");
  }
  if (new Set(options.unitKeys).size !== options.unitKeys.length) {
    throw new Error("Explicit commentary unit keys must be unique");
  }
  for (const unitKey of options.unitKeys) {
    if (!UNIT_KEY.test(unitKey)) throw new Error(`Invalid commentary unit key: ${unitKey}`);
  }

  const requested = new Set(options.unitKeys);
  const matches = manifest.jobs.filter(
    (job) => job.dialogue === options.dialogue && job.stage === options.stage &&
      job.unit_key !== undefined && requested.has(job.unit_key),
  );
  for (const unitKey of options.unitKeys) {
    const expectedJobId = `audit:${options.dialogue}:${unitKey}`;
    const unitMatches = matches.filter((job) => job.unit_key === unitKey);
    if (unitMatches.length === 0) {
      throw new Error(`No current audit job for ${options.dialogue}/${unitKey}`);
    }
    if (unitMatches.length !== 1 || unitMatches[0]!.job_id !== expectedJobId) {
      throw new Error(`Expected exactly one canonical audit job ${expectedJobId}`);
    }
  }
  return matches;
}

function runCommand(
  executable: string,
  args: string[],
  cwd: string,
  env?: NodeJS.ProcessEnv,
  stdin?: string,
): Promise<CommentaryCampaignCommandResult> {
  const bun = (globalThis as unknown as { Bun?: BunRuntime }).Bun;
  if (bun) {
    const child = bun.spawn([executable, ...args], {
      cwd,
      env: env ?? process.env,
      stdin: stdin === undefined ? "ignore" : "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    if (stdin !== undefined) {
      if (!child.stdin) throw new Error(`Could not open stdin for ${executable}`);
      child.stdin.write(stdin);
      child.stdin.end();
    }
    const readStream = async (stream: ReadableStream<Uint8Array>) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        result += decoder.decode(chunk.value, { stream: true });
      }
      return `${result}${decoder.decode()}`;
    };
    return Promise.all([readStream(child.stdout), readStream(child.stderr), child.exited]).then(
      ([stdout, stderr, exitCode]) => ({ exitCode, stdout, stderr }),
    );
  }
  return new Promise((resolve, reject) => {
    const child = execFile(
      executable,
      args,
      {
        cwd,
        env: env ?? process.env,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error && typeof error.code !== "number") {
          reject(error);
          return;
        }
        resolve({
          exitCode: error && typeof error.code === "number" ? error.code : 0,
          stdout,
          stderr,
        });
      },
    );
    if (stdin !== undefined) child.stdin?.end(stdin);
  });
}

function formatLunaCommandFailure(result: CommentaryCampaignCommandResult) {
  const payload = [result.stdout, result.stderr]
    .map((channel) => channel.trim())
    .filter((channel) => channel.length > 0)
    .join("\n");
  try {
    const parsed = JSON.parse(payload) as unknown;
    const events = Array.isArray(parsed) ? parsed : [parsed];
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const value = events[index];
      if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
      const event = value as Record<string, unknown>;
      if (event.type !== "result") continue;
      const status = typeof event.api_error_status === "number"
        ? `API ${event.api_error_status}`
        : `exit ${result.exitCode}`;
      const terminalReason = typeof event.terminal_reason === "string"
        ? `, ${event.terminal_reason}`
        : "";
      const message = typeof event.result === "string" && event.result.trim().length > 0
        ? event.result.trim()
        : "Codex returned no result text.";
      return `${status}${terminalReason}: ${message}`;
    }
  } catch {
    // Fall through to a bounded plain-text diagnostic.
  }
  const normalized = payload.replaceAll(/\s+/gu, " ").trim();
  if (normalized.length === 0) return `exit ${result.exitCode}: no output`;
  const maximumLength = 2_000;
  return normalized.length <= maximumLength
    ? `exit ${result.exitCode}: ${normalized}`
    : `exit ${result.exitCode}: ${normalized.slice(0, 800)}… [diagnostic truncated] …${normalized.slice(-1_200)}`;
}

class LunaProviderQuotaError extends Error {}

/**
 * A provider response was received, but it could not be accepted as the
 * current job's artifact. This is recoverable at campaign scope: the job is
 * left pending for a later retry, while unrelated jobs may still run.
 */
class CommentaryCampaignInvalidOutputError extends Error {
  readonly outcome = "invalid_output" as const;

  constructor(message: string) {
    super(message);
    this.name = "CommentaryCampaignInvalidOutputError";
  }
}

function monthlySpendLimitEvidence(
  job: CommentaryCampaignJob,
  auth: LunaAuthStatus,
  result: CommentaryCampaignCommandResult,
): LunaProviderBlockEvidence | undefined {
  const responseEnvelope = stableJson({
    exit_code: result.exitCode,
    stderr: result.stderr,
    stdout: result.stdout,
  });
  if (!/monthly\s+spend\s+limit/iu.test(responseEnvelope)) return undefined;
  if (result.exitCode === 0) {
    const terminalQuotaError = [result.stdout, result.stderr].some((channel) => {
      const payload = channel.trim();
      if (!/monthly\s+spend\s+limit/iu.test(payload)) return false;
      try {
        const parsed = JSON.parse(payload) as unknown;
        const events = Array.isArray(parsed) ? parsed : [parsed];
        const terminal = [...events].reverse().find(
          (value) => typeof value === "object" && value !== null && !Array.isArray(value) &&
            (value as Record<string, unknown>).type === "result",
        ) as Record<string, unknown> | undefined;
        const terminalReason = typeof terminal?.terminal_reason === "string" ? terminal.terminal_reason : "";
        const subtype = typeof terminal?.subtype === "string" ? terminal.subtype : "";
        return terminal?.is_error === true ||
          /error|billing|quota/iu.test(terminalReason) ||
          /error|failure/iu.test(subtype);
      } catch {
        return false;
      }
    });
    if (!terminalQuotaError) return undefined;
  }
  return {
    schema_version: PROVIDER_BLOCK_SCHEMA_VERSION,
    campaign: COMMENTARY_CAMPAIGN_ID,
    kind: "monthly_spend_limit",
    observed_at: new Date().toISOString(),
    auth_method: auth.auth_method,
    api_provider: auth.api_provider,
    job_id: job.job_id,
    stage: job.stage,
    input_sha256: job.input_sha256,
    output_schema_sha256: job.output_schema_sha256,
    exit_code: result.exitCode,
    response_sha256: sha256(responseEnvelope),
    diagnostic: `Codex provider reported a monthly spend limit (exit ${result.exitCode}).`,
  };
}

function writeLunaProviderBlock(evidence: LunaProviderBlockEvidence) {
  atomicWrite(join(getRepoRoot(), PROVIDER_BLOCK_PATH), prettyJson(evidence));
}

function readLunaProviderBlockSnapshot() {
  const path = join(getRepoRoot(), PROVIDER_BLOCK_PATH);
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

function clearLunaProviderBlock(snapshot: string | undefined) {
  const path = join(getRepoRoot(), PROVIDER_BLOCK_PATH);
  if (snapshot === undefined || !existsSync(path)) return;
  if (readFileSync(path, "utf8") !== snapshot) return;
  rmSync(path, { force: true });
}

function authStatusFromResult(result: CommentaryCampaignCommandResult): LunaAuthStatus {
  const payload = result.stdout.trim().length > 0 ? result.stdout : result.stderr;
  if (result.exitCode !== 0) {
    throw new Error(`Codex login preflight failed (exit ${result.exitCode}): ${payload || "no output"}`);
  }

  let loggedIn: boolean | undefined;
  try {
    const parsed = JSON.parse(payload) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const record = parsed as Record<string, unknown>;
      for (const key of ["logged_in", "loggedIn", "is_logged_in", "isLoggedIn"] as const) {
        if (typeof record[key] === "boolean") loggedIn = record[key];
      }
      const status = [record.status, record.message, record.detail]
        .filter((value): value is string => typeof value === "string")
        .join(" ");
      if (loggedIn === undefined && status.length > 0) {
        loggedIn = /not\s+logged\s+in|logged\s+out|unauthenticated|no\s+active\s+login/iu.test(status)
          ? false
          : /logged\s+in/iu.test(status)
            ? true
            : undefined;
      }
    }
  } catch {
    // Codex currently reports this status as human-readable text; JSON is
    // accepted as a stable alternative for wrappers around the CLI.
  }
  if (loggedIn === undefined) {
    const negative = /not\s+logged\s+in|logged\s+out|unauthenticated|no\s+active\s+login/iu.test(payload);
    loggedIn = !negative && /logged\s+in/iu.test(payload);
  }
  return {
    logged_in: loggedIn,
    auth_method: "codex",
    api_provider: "openai",
  };
}

export async function readLunaAuthStatus(
  options: {
    codexExecutable?: string;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    commandRunner?: CommentaryCampaignCommandRunner;
  } = {},
): Promise<LunaAuthStatus> {
  const executable = options.codexExecutable ?? "codex";
  const cwd = options.cwd ?? getRepoRoot();
  const result = await (options.commandRunner ?? runCommand)(executable, ["login", "status"], cwd, options.env);
  return authStatusFromResult(result);
}

function codexVersionFromResult(result: CommentaryCampaignCommandResult): string {
  const payload = result.stdout.trim().length > 0 ? result.stdout : result.stderr;
  if (result.exitCode !== 0) {
    throw new Error(`Codex CLI version preflight failed (exit ${result.exitCode}): ${payload || "no output"}`);
  }
  const match = /codex-cli\s+(\d+\.\d+\.\d+)/iu.exec(payload);
  if (!match) throw new Error(`Codex CLI version preflight failed: unrecognized output ${payload || "no output"}`);
  return match[1]!;
}

async function assertCommentaryCodexVersion(options: {
  codexExecutable: string;
  cwd: string;
  env?: NodeJS.ProcessEnv;
  commandRunner?: CommentaryCampaignCommandRunner;
}) {
  const result = await (options.commandRunner ?? runCommand)(
    options.codexExecutable,
    ["--version"],
    options.cwd,
    options.env,
  );
  const actual = codexVersionFromResult(result);
  if (actual !== COMMENTARY_CODEX_CLI_VERSION) {
    throw new Error(
      `Commentary campaign requires codex-cli ${COMMENTARY_CODEX_CLI_VERSION}; found ${actual}`,
    );
  }
}

function parseLunaProviderBlockEvidence(value: unknown, path: string): LunaProviderBlockEvidence {
  const record = objectValue(value, path);
  exactKeys(
    record,
    [
      "schema_version",
      "campaign",
      "kind",
      "observed_at",
      "auth_method",
      "api_provider",
      "job_id",
      "stage",
      "input_sha256",
      "output_schema_sha256",
      "exit_code",
      "response_sha256",
      "diagnostic",
    ],
    path,
  );
  if (record.schema_version !== PROVIDER_BLOCK_SCHEMA_VERSION) {
    throw new Error(`${path}.schema_version must be ${PROVIDER_BLOCK_SCHEMA_VERSION}`);
  }
  if (record.campaign !== COMMENTARY_CAMPAIGN_ID) {
    throw new Error(`${path}.campaign must be ${COMMENTARY_CAMPAIGN_ID}`);
  }
  if (record.kind !== "monthly_spend_limit") throw new Error(`${path}.kind must be monthly_spend_limit`);
  const observedAt = nonEmptyString(record.observed_at, `${path}.observed_at`);
  if (Number.isNaN(Date.parse(observedAt)) || new Date(observedAt).toISOString() !== observedAt) {
    throw new Error(`${path}.observed_at must be an exact ISO timestamp`);
  }
  const stage = record.stage;
  if (stage !== "outline" && stage !== "draft" && stage !== "audit" && stage !== "rewrite") {
    throw new Error(`${path}.stage is invalid`);
  }
  if (!SHA256.test(String(record.input_sha256))) throw new Error(`${path}.input_sha256 must be SHA-256`);
  if (!SHA256.test(String(record.output_schema_sha256))) throw new Error(`${path}.output_schema_sha256 must be SHA-256`);
  if (!SHA256.test(String(record.response_sha256))) throw new Error(`${path}.response_sha256 must be SHA-256`);
  if (typeof record.exit_code !== "number" || !Number.isInteger(record.exit_code) || record.exit_code < 0) {
    throw new Error(`${path}.exit_code must be a nonnegative integer`);
  }
  return {
    schema_version: PROVIDER_BLOCK_SCHEMA_VERSION,
    campaign: COMMENTARY_CAMPAIGN_ID,
    kind: "monthly_spend_limit",
    observed_at: observedAt,
    auth_method: nonEmptyString(record.auth_method, `${path}.auth_method`),
    api_provider: nonEmptyString(record.api_provider, `${path}.api_provider`),
    job_id: nonEmptyString(record.job_id, `${path}.job_id`),
    stage,
    input_sha256: String(record.input_sha256),
    output_schema_sha256: String(record.output_schema_sha256),
    exit_code: Number(record.exit_code),
    response_sha256: String(record.response_sha256),
    diagnostic: nonEmptyString(record.diagnostic, `${path}.diagnostic`),
  };
}

function providerAccessFromEvidence(
  status: "provider_quota_blocked" | "provider_block_stale",
  reason: LunaProviderAccessStatus["reason"],
  evidence: LunaProviderBlockEvidence,
): LunaProviderAccessStatus {
  return {
    status,
    reason,
    evidence_path: PROVIDER_BLOCK_PATH,
    observed_at: evidence.observed_at,
    job_id: evidence.job_id,
    input_sha256: evidence.input_sha256,
    response_sha256: evidence.response_sha256,
    diagnostic: evidence.diagnostic,
  };
}

export function readLunaProviderAccessStatus(options: {
  auth: LunaAuthStatus;
  manifest: CommentaryCampaignManifest;
  canonicalAuditReuse?: ReusableCanonicalAuditOutputResolver;
}): LunaProviderAccessStatus {
  if (!options.auth.logged_in) return { status: "auth_blocked", reason: "not_logged_in" };
  const absolutePath = join(getRepoRoot(), PROVIDER_BLOCK_PATH);
  if (!existsSync(absolutePath)) {
    return { status: "auth_ready", reason: "no_provider_quota_block_observed" };
  }
  const evidence = parseLunaProviderBlockEvidence(readJson(absolutePath), PROVIDER_BLOCK_PATH);
  if (evidence.auth_method !== options.auth.auth_method || evidence.api_provider !== options.auth.api_provider) {
    return providerAccessFromEvidence("provider_block_stale", "auth_context_changed", evidence);
  }
  const job = options.manifest.jobs.find((candidate) => candidate.job_id === evidence.job_id);
  if (!job) return providerAccessFromEvidence("provider_block_stale", "failed_job_missing", evidence);
  if (
    job.stage !== evidence.stage ||
    job.input_sha256 !== evidence.input_sha256 ||
    job.output_schema_sha256 !== evidence.output_schema_sha256
  ) {
    return providerAccessFromEvidence("provider_block_stale", "failed_job_input_changed", evidence);
  }
  if (jobArtifactStatus(job, options.canonicalAuditReuse) !== "pending") {
    return providerAccessFromEvidence("provider_block_stale", "failed_job_artifact_not_pending", evidence);
  }
  return providerAccessFromEvidence("provider_quota_blocked", "monthly_spend_limit", evidence);
}

function summarizeLunaResponse(payload: string) {
  try {
    let value = JSON.parse(payload) as unknown;
    const topLevel = Array.isArray(value) ? "array" : typeof value;
    if (Array.isArray(value)) {
      value = [...value].reverse().find(
        (event) => typeof event === "object" && event !== null && !Array.isArray(event) &&
          (event as Record<string, unknown>).type === "result",
      );
    }
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return `top_level=${topLevel}; terminal_result=missing`;
    }
    const record = value as Record<string, unknown>;
    const summary: Record<string, unknown> = {
      top_level: topLevel,
      structured_output_type: Array.isArray(record.structured_output)
        ? "array"
        : record.structured_output === null
          ? "null"
          : typeof record.structured_output,
    };
    for (const field of ["type", "subtype", "is_error", "api_error_status", "terminal_reason"] as const) {
      if (record[field] !== undefined) summary[field] = record[field];
    }
    if (typeof record.result === "string") {
      summary.result_preview = record.result.replaceAll(/\s+/gu, " ").trim().slice(0, 500);
    } else if (record.result !== undefined) {
      summary.result_type = Array.isArray(record.result) ? "array" : record.result === null ? "null" : typeof record.result;
    }
    return stableJson(summary).trim();
  } catch {
    return payload.replaceAll(/\s+/gu, " ").trim().slice(0, 1_000);
  }
}

function validateJobOutput(job: CommentaryCampaignJob, value: unknown) {
  if (job.stage === "outline") {
    const outline = parseCommentaryOutline(value, job.output_path);
    if (outline.dialogue !== job.dialogue) throw new Error(`Outline dialogue does not match job ${job.job_id}`);
    buildOutlineImport(job.dialogue, job.output_path, outline, job.outline_replacement === true, false);
    return outline;
  }
  if (job.stage === "audit") {
    const audit = parseCommentaryQualityAudit(value, {
      path: job.output_path,
      expectedCommentaryIds: job.commentary_ids ?? [],
    });
    if (audit.dialogue !== job.dialogue || audit.unit_key !== job.unit_key || audit.section_id !== job.section_id) {
      throw new Error(`Quality-audit identity does not match job ${job.job_id}`);
    }
    return audit;
  }
  if (job.stage === "rewrite") {
    const rewrite = parseCommentaryRewrite(value, {
      path: job.output_path,
      expectedFailedCommentaryIds: job.failed_commentary_ids ?? [],
      expectedAuditOutput: {
        path: job.audit_output_path ?? "",
        sha256: job.audit_output_sha256 ?? "",
      },
    });
    if (rewrite.dialogue !== job.dialogue || rewrite.unit_key !== job.unit_key || rewrite.section_id !== job.section_id) {
      throw new Error(`Rewrite identity does not match job ${job.job_id}`);
    }
    const ledgerPath = `wiki/commentary/${job.dialogue}.md`;
    const currentBlocks = commentaryMarkdownBlocks(readFileSync(join(getRepoRoot(), ledgerPath), "utf8"));
    const currentBlockById = new Map(
      currentBlocks.map((block) => [fieldValue(block.content, "commentary_id") ?? "", block]),
    );
    for (const revision of rewrite.revisions) {
      const current = currentBlockById.get(revision.commentary_id);
      if (!current) throw new Error(`Rewrite names an unknown current block: ${revision.commentary_id}`);
      const kind = fieldValue(current.content, "block_kind");
      if (kind === "section" && revision.title.length === 0) {
        throw new Error(`Rewrite for section ${revision.commentary_id} requires a non-empty title`);
      }
      if (kind !== "section" && revision.title.length > 0) {
        throw new Error(`Rewrite for non-section ${revision.commentary_id} must use an empty title`);
      }
    }
    return rewrite;
  }
  const draft = parseCommentaryUnitDraft(value, job.output_path);
  if (draft.dialogue !== job.dialogue || draft.unit_key !== job.unit_key || draft.section_id !== job.section_id) {
    throw new Error(`Draft identity does not match job ${job.job_id}`);
  }
  return draft;
}

export type ReusableCanonicalAuditOutput = {
  manifestPath: string;
  output: CommentaryQualityAudit;
  outputSha256: string;
  source?: "canonical_manifest" | "delegated_import";
};

export type ReusableCanonicalAuditOutputResolver = (
  job: CommentaryCampaignJob,
) => ReusableCanonicalAuditOutput | undefined;

type ReusableCanonicalAuditManifestUnit = {
  unitKey: string;
  sectionId: string;
  auditBriefSha256: string;
  outputPath: string;
  outputSha256: string;
  output: Record<string, unknown>;
  provenance?: { path: string; sha256: string };
};

type ReusableCanonicalAuditManifest = {
  ledger: { path: string; sha256: string };
  protocol: { path: string; sha256: string };
  units: ReusableCanonicalAuditManifestUnit[];
  acceptance: {
    reviewer: string;
    reviewedOn: string;
    rationale: string;
    sampledCommentaryIds: string[];
    reviewNote: { path: string; sha256: string };
  };
};

type ReusableCanonicalAuditDialogueSnapshot = {
  manifestPath: string;
  unitsByKey: ReadonlyMap<string, ReusableCanonicalAuditManifestUnit>;
  briefsByKey: ReadonlyMap<string, CommentaryAuditBrief>;
};

function manifestString(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${path} must be a non-empty string`);
  }
  return value;
}

function reusableCanonicalAuditResource(value: unknown, path: string) {
  const resource = objectValue(value, path);
  exactKeys(resource, ["path", "sha256"], path);
  const resourcePath = manifestString(resource.path, `${path}.path`);
  const digest = manifestString(resource.sha256, `${path}.sha256`);
  if (!SHA256.test(digest)) throw new Error(`${path}.sha256 must be a lowercase SHA-256 digest`);
  return { path: resourcePath, sha256: digest };
}

/**
 * Decode only the canonical manifest structure shared by every unit. Embedded
 * output records deliberately remain opaque here: each requested unit is
 * parsed against its own current job contract after this shared snapshot has
 * passed, so a malformed sibling output cannot invalidate a sound target.
 */
function parseReusableCanonicalAuditManifest(
  value: unknown,
  manifestPath: string,
  dialogue: string,
): ReusableCanonicalAuditManifest {
  const manifest = objectValue(value, manifestPath);
  exactKeys(
    manifest,
    ["schema_version", "dialogue", "ledger", "protocol", "authoring", "units", "acceptance"],
    manifestPath,
  );
  if (manifest.schema_version !== 1) throw new Error(`${manifestPath}.schema_version must be 1`);
  if (manifestString(manifest.dialogue, `${manifestPath}.dialogue`) !== dialogue) {
    throw new Error(`${manifestPath}.dialogue must be ${dialogue}`);
  }

  const ledger = reusableCanonicalAuditResource(manifest.ledger, `${manifestPath}.ledger`);
  const protocol = reusableCanonicalAuditResource(manifest.protocol, `${manifestPath}.protocol`);
  const authoring = objectValue(manifest.authoring, `${manifestPath}.authoring`);
  exactKeys(authoring, ["model", "effort"], `${manifestPath}.authoring`);
  if (
    authoring.model !== COMMENTARY_AUTHORING_MODEL ||
    authoring.effort !== COMMENTARY_STAGE_EFFORT.audit
  ) {
    throw new Error(`${manifestPath}.authoring does not match the canonical audit authoring contract`);
  }

  if (!Array.isArray(manifest.units) || manifest.units.length === 0) {
    throw new Error(`${manifestPath}.units must be a non-empty array`);
  }
  const units = manifest.units.map((value, index): ReusableCanonicalAuditManifestUnit => {
    const path = `${manifestPath}.units[${index}]`;
    const unit = objectValue(value, path);
    exactKeys(
      unit,
      [
        "unit_key",
        "section_id",
        "audit_brief_sha256",
        "output_path",
        "output_sha256",
        "output",
        ...(unit.provenance === undefined ? [] : ["provenance"]),
      ],
      path,
    );
    const unitKey = manifestString(unit.unit_key, `${path}.unit_key`);
    const sectionId = manifestString(unit.section_id, `${path}.section_id`);
    const auditBriefSha256 = manifestString(unit.audit_brief_sha256, `${path}.audit_brief_sha256`);
    const outputPath = manifestString(unit.output_path, `${path}.output_path`);
    const outputSha256 = manifestString(unit.output_sha256, `${path}.output_sha256`);
    const provenance = unit.provenance === undefined ? undefined : objectValue(unit.provenance, `${path}.provenance`);
    if (provenance) {
      exactKeys(provenance, ["path", "sha256"], `${path}.provenance`);
      if (!SHA256.test(manifestString(provenance.sha256, `${path}.provenance.sha256`))) throw new Error(`${path}.provenance.sha256 is invalid`);
    }
    if (!UNIT_KEY.test(unitKey) || !/^comm_[a-z0-9-]+_\d{4}$/u.test(sectionId)) {
      throw new Error(`${path} has an invalid unit identity`);
    }
    if (!SHA256.test(auditBriefSha256) || !SHA256.test(outputSha256)) {
      throw new Error(`${path} contains an invalid SHA-256 digest`);
    }
    return {
      unitKey,
      sectionId,
      auditBriefSha256,
      outputPath,
      outputSha256,
      output: objectValue(unit.output, `${path}.output`),
      ...(provenance ? { provenance: { path: manifestString(provenance.path, `${path}.provenance.path`), sha256: manifestString(provenance.sha256, `${path}.provenance.sha256`) } } : {}),
    };
  });

  const acceptance = objectValue(manifest.acceptance, `${manifestPath}.acceptance`);
  exactKeys(
    acceptance,
    ["decision", "reviewer", "reviewed_on", "rationale", "sampled_commentary_ids", "review_note"],
    `${manifestPath}.acceptance`,
  );
  if (acceptance.decision !== "accepted") {
    throw new Error(`${manifestPath}.acceptance.decision must be accepted`);
  }
  if (!Array.isArray(acceptance.sampled_commentary_ids)) {
    throw new Error(`${manifestPath}.acceptance.sampled_commentary_ids must be an array`);
  }
  const reviewNote = reusableCanonicalAuditResource(
    acceptance.review_note,
    `${manifestPath}.acceptance.review_note`,
  );
  return {
    ledger,
    protocol,
    units,
    acceptance: {
      reviewer: manifestString(acceptance.reviewer, `${manifestPath}.acceptance.reviewer`),
      reviewedOn: manifestString(acceptance.reviewed_on, `${manifestPath}.acceptance.reviewed_on`),
      rationale: manifestString(acceptance.rationale, `${manifestPath}.acceptance.rationale`),
      sampledCommentaryIds: acceptance.sampled_commentary_ids.map((id, index) =>
        manifestString(id, `${manifestPath}.acceptance.sampled_commentary_ids[${index}]`)
      ),
      reviewNote,
    },
  };
}

function readReusableCanonicalAuditDialogueSnapshot(
  dialogue: string,
  auditEvidence: () => CommentaryAuditEvidenceSnapshot,
  citationIndex: () => CommentaryCitationIndex,
): ReusableCanonicalAuditDialogueSnapshot | undefined {
  const repoRoot = getRepoRoot();
  const manifestPath = `wiki/commentary-audits/${dialogue}.json`;
  const manifestAbsolutePath = join(repoRoot, manifestPath);
  if (!existsSync(manifestAbsolutePath)) return undefined;
  const manifest = parseReusableCanonicalAuditManifest(
    JSON.parse(readFileSync(manifestAbsolutePath, "utf8")) as unknown,
    manifestPath,
    dialogue,
  );

  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const ledgerAbsolutePath = join(repoRoot, ledgerPath);
  if (manifest.ledger.path !== ledgerPath || !existsSync(ledgerAbsolutePath)) return undefined;
  const ledgerContent = readFileSync(ledgerAbsolutePath, "utf8");
  if (validateCommentaryLedger(ledgerPath, ledgerContent, citationIndex()).length > 0) return undefined;

  const ledgerBlocks = commentaryMarkdownBlocks(ledgerContent);
  const activeCommentaryIds = ledgerBlocks
    .filter((block) => fieldValue(block.content, "review_status") === "accepted")
    .map((block) => fieldValue(block.content, "commentary_id") ?? "");
  if (
    activeCommentaryIds.length === 0 ||
    ledgerBlocks.some((block) => {
      const status = fieldValue(block.content, "review_status");
      return status !== "accepted" && status !== "rejected";
    })
  ) return undefined;

  const protocolPath = "docs/commentary-protocol.md";
  const protocolAbsolutePath = join(repoRoot, protocolPath);
  if (manifest.protocol.path !== protocolPath || !existsSync(protocolAbsolutePath)) return undefined;
  const protocolContent = readFileSync(protocolAbsolutePath, "utf8");

  if (validateAcceptedCommentaryQualityAuditProvenance({
    dialogue,
    reviewer: manifest.acceptance.reviewer,
    reviewedOn: manifest.acceptance.reviewedOn,
    rationale: manifest.acceptance.rationale,
    sampledCommentaryIds: manifest.acceptance.sampledCommentaryIds,
    reviewNote: manifest.acceptance.reviewNote,
    activeCommentaryIds,
  }).length > 0) return undefined;

  const briefs = buildCommentaryAuditBriefsFromSnapshot(dialogue, {
    ledgerContent,
    protocolContent,
    evidence: auditEvidence(),
  });
  if (briefs.length === 0 || manifest.units.length !== briefs.length) return undefined;

  const unitsByKey = new Map<string, ReusableCanonicalAuditManifestUnit>();
  const briefsByKey = new Map<string, CommentaryAuditBrief>();
  for (const [index, unit] of manifest.units.entries()) {
    const brief = briefs[index];
    if (
      !brief ||
      unitsByKey.has(unit.unitKey) ||
      unit.unitKey !== brief.unitKey ||
      unit.sectionId !== brief.sectionId
    ) return undefined;
    unitsByKey.set(unit.unitKey, unit);
    briefsByKey.set(brief.unitKey, brief);
  }
  return { manifestPath, unitsByKey, briefsByKey };
}

function reusableCanonicalAuditOutputFromSnapshot(
  job: CommentaryCampaignJob,
  snapshot: ReusableCanonicalAuditDialogueSnapshot,
): ReusableCanonicalAuditOutput | undefined {
  if (job.stage !== "audit" || !job.unit_key || !job.section_id || !job.audit_brief_sha256) return undefined;
  try {
    const unit = snapshot.unitsByKey.get(job.unit_key);
    const brief = snapshot.briefsByKey.get(job.unit_key);
    if (
      !unit ||
      !brief ||
      job.section_id !== brief.sectionId ||
      job.audit_brief_sha256 !== brief.sha256 ||
      job.audit_brief_path !== brief.path ||
      job.output_path !== `scratch/commentary/audits/${job.dialogue}/${brief.unitKey}.json` ||
      job.commentary_ids?.length !== brief.commentaryIds.length ||
      job.commentary_ids.some((id, index) => id !== brief.commentaryIds[index]) ||
      unit.sectionId !== brief.sectionId ||
      unit.auditBriefSha256 !== brief.sha256 ||
      unit.outputPath !== job.output_path
    ) return undefined;

    const output = validateJobOutput(job, unit.output) as CommentaryQualityAudit;
    if (output.unit_verdict !== "pass" || output.blocks.some((block) => block.disposition !== "pass")) {
      return undefined;
    }
    const outputSha256 = sha256(prettyJson(output));
    if (unit.outputSha256 !== outputSha256) return undefined;
    return { manifestPath: snapshot.manifestPath, output, outputSha256 };
  } catch {
    return undefined;
  }
}

/**
 * Recover a still-current unit from its accepted canonical manifest.
 *
 * Campaign state deliberately binds the exact invocation prompt. Tightening
 * only the output wording can therefore make old scratch state stale even when
 * the durable, accepted unit still has the same ledger bytes, audit brief,
 * model, effort, and a result that passes today's stricter parser. Re-running
 * every sibling unit in that case spends model compute without adding a new
 * judgment. The canonical manifest is the durable provenance boundary, so a
 * compatible unit may be reused from it without rewriting scratch state or
 * pretending it was generated by the newer prompt. Whole-ledger and whole-
 * protocol hashes still govern canonical dialogue acceptance, but cache reuse
 * is decided by the rebuilt unit brief so a sibling edit or workflow-only docs
 * edit cannot spend model compute on unchanged quality-bearing bytes.
 */
export function createReusableCanonicalAuditOutputResolver(options: {
  auditEvidence?: CommentaryAuditEvidenceSnapshot;
} = {}): ReusableCanonicalAuditOutputResolver {
  const snapshots = new Map<string, ReusableCanonicalAuditDialogueSnapshot | null>();
  let evidence = options.auditEvidence;
  let citations: CommentaryCitationIndex | undefined;
  return (job) => {
    if (
      job.stage !== "audit" ||
      !DIALOGUE.test(job.dialogue) ||
      !job.unit_key ||
      !job.section_id ||
      !job.audit_brief_sha256
    ) return undefined;
    const canonicalManifestExists = existsSync(join(getRepoRoot(), `wiki/commentary-audits/${job.dialogue}.json`));
    const readCanonicalSnapshot = () => {
      if (snapshots.has(job.dialogue)) return snapshots.get(job.dialogue) ?? undefined;
      try {
        snapshots.set(
          job.dialogue,
          readReusableCanonicalAuditDialogueSnapshot(
            job.dialogue,
            () => evidence ??= buildCommentaryAuditEvidenceSnapshot(),
            () => citations ??= buildCommentaryCitationIndex(),
          ) ?? null,
        );
      } catch {
        snapshots.set(job.dialogue, null);
      }
      return snapshots.get(job.dialogue) ?? undefined;
    };
    // An accepted canonical manifest is the durable authority once it exists.
    // Delegated receipts seed a manifest, but must not shadow a later accepted
    // unit with the same current job identity.
    if (canonicalManifestExists) {
      const snapshot = readCanonicalSnapshot();
      const canonical = snapshot ? reusableCanonicalAuditOutputFromSnapshot(job, snapshot) : undefined;
      if (canonical) return canonical;
      return readCurrentCommentaryDelegatedAudit(job);
    }
    return readCurrentCommentaryDelegatedAudit(job);
  };
}

export function reusableCanonicalAuditOutput(
  job: CommentaryCampaignJob,
): ReusableCanonicalAuditOutput | undefined {
  return createReusableCanonicalAuditOutputResolver()(job);
}

type JobState = {
  schema_version: 3;
  job_id: string;
  stage: CommentaryCampaignStage;
  input_sha256: string;
  output_schema_sha256: string;
  model_argument: typeof COMMENTARY_MODEL_ARGUMENT;
  codex_cli_version: typeof COMMENTARY_CODEX_CLI_VERSION;
  model_catalog_path: typeof COMMENTARY_MODEL_CATALOG_PATH;
  model_catalog_sha256: string;
  authoring_model: typeof COMMENTARY_AUTHORING_MODEL;
  effort: CommentaryEffort;
  permission_mode: typeof COMMENTARY_PERMISSION_MODE;
  output_path: string;
  output_sha256: string;
};

function parseJobState(value: unknown, path: string): JobState {
  const record = objectValue(value, path);
  exactKeys(
    record,
    [
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
    ],
    path,
  );
  if (record.schema_version !== JOB_STATE_SCHEMA_VERSION) {
    throw new Error(`${path}.schema_version must be ${JOB_STATE_SCHEMA_VERSION}`);
  }
  const state = record as unknown as JobState;
  if (
    !SHA256.test(state.input_sha256) ||
    !SHA256.test(state.output_schema_sha256) ||
    !SHA256.test(state.model_catalog_sha256) ||
    !SHA256.test(state.output_sha256)
  ) {
    throw new Error(`${path} contains an invalid SHA-256 digest`);
  }
  return state;
}

function expectedJobState(job: CommentaryCampaignJob, outputContent: string): Omit<JobState, "schema_version"> {
  return {
    job_id: job.job_id,
    stage: job.stage,
    input_sha256: job.input_sha256,
    output_schema_sha256: job.output_schema_sha256,
    model_argument: job.model_argument,
    codex_cli_version: job.codex_cli_version,
    model_catalog_path: job.model_catalog_path,
    model_catalog_sha256: job.model_catalog_sha256,
    authoring_model: job.authoring_model,
    effort: job.effort,
    permission_mode: job.permission_mode,
    output_path: job.output_path,
    output_sha256: sha256(outputContent),
  };
}

export type CurrentCommentaryAuditArtifact = {
  job: CommentaryCampaignJob;
  auditBriefSha256: string;
  outputSha256: string;
};

/**
 * Validate every durable campaign binding needed before a structural audit
 * remediation may mutate a commentary ledger. This intentionally requires the
 * active output/state/telemetry trio; a JSON output plus a matching hash is not
 * sufficient provenance for an applied structural change.
 */
export function validateCurrentCommentaryAuditArtifact(options: {
  dialogue: string;
  unitKey: string;
  outputPath: string;
  outputSha256: string;
}): CurrentCommentaryAuditArtifact {
  const plan = buildCommentaryCampaignPlan({ dialogue: options.dialogue, stage: "audit" });
  const job = plan.manifest.jobs.find((candidate) => candidate.unit_key === options.unitKey);
  if (!job || job.stage !== "audit" || !job.section_id || !job.audit_brief_path || !job.audit_brief_sha256) {
    throw new Error(`No current audit job for ${options.dialogue}/${options.unitKey}`);
  }
  validateCommentaryCampaignJobContract(job);
  if (job.output_path !== options.outputPath) {
    throw new Error(`Structural audit output path is stale for ${job.job_id}`);
  }
  const outputAbsolutePath = join(getRepoRoot(), job.output_path);
  const stateAbsolutePath = join(getRepoRoot(), job.state_path);
  const telemetryRelativePath = commentaryCampaignTelemetryPath(job.state_path);
  const telemetryAbsolutePath = join(getRepoRoot(), telemetryRelativePath);
  if (!existsSync(outputAbsolutePath)) throw new Error(`Missing current audit output ${job.output_path}`);
  if (!existsSync(stateAbsolutePath)) throw new Error(`Missing current audit state ${job.state_path}`);
  if (!existsSync(telemetryAbsolutePath)) throw new Error(`Missing current audit telemetry ${telemetryRelativePath}`);

  const outputContent = readFileSync(outputAbsolutePath, "utf8");
  const outputSha256 = sha256(outputContent);
  if (outputSha256 !== options.outputSha256) {
    throw new Error(`Current audit output hash does not match ${job.job_id}`);
  }
  const output = validateJobOutput(job, readJson(outputAbsolutePath)) as CommentaryQualityAudit;
  if (outputContent !== prettyJson(output)) {
    throw new Error(`Current audit output ${job.output_path} is not the exact normalized runner artifact`);
  }
  if (output.unit_verdict !== "fail" || output.blocks.every((block) => block.disposition === "pass")) {
    throw new Error(`Current audit output ${job.output_path} is not a semantic-fail audit`);
  }

  const auditBrief = buildCommentaryAuditBriefs(
    options.dialogue,
    plan.auditEvidence ?? buildCommentaryAuditEvidenceSnapshot(),
  ).find((brief) => brief.unitKey === options.unitKey);
  if (!auditBrief || auditBrief.path !== job.audit_brief_path || auditBrief.sha256 !== job.audit_brief_sha256) {
    throw new Error(`Current audit brief is stale for ${job.job_id}`);
  }
  const briefAbsolutePath = join(getRepoRoot(), auditBrief.path);
  if (!existsSync(briefAbsolutePath) || readFileSync(briefAbsolutePath, "utf8") !== auditBrief.content) {
    throw new Error(`Current audit brief bytes are stale for ${job.job_id}`);
  }

  const state = parseJobState(readJson(stateAbsolutePath), job.state_path);
  const expected = expectedJobState(job, outputContent);
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (state[field as keyof JobState] !== expectedValue) {
      throw new Error(`Current audit state is stale for ${job.job_id}: state.${field}`);
    }
  }
  const telemetry = readJson(telemetryAbsolutePath) as Record<string, unknown>;
  if (
    telemetry.schema_version !== 1 ||
    telemetry.job_id !== job.job_id ||
    telemetry.dialogue !== job.dialogue ||
    telemetry.stage !== "audit" ||
    telemetry.unit_key !== job.unit_key ||
    telemetry.input_sha256 !== job.input_sha256 ||
    telemetry.outcome !== "generated" ||
    telemetry.exit_code !== 0
  ) {
    throw new Error(`Current audit telemetry is stale for ${job.job_id}`);
  }
  return { job, auditBriefSha256: auditBrief.sha256, outputSha256 };
}

function inspectResume(
  job: CommentaryCampaignJob,
  canonicalAuditReuse: ReusableCanonicalAuditOutputResolver = reusableCanonicalAuditOutput,
): "pending" | "resumed" | "reused_canonical" {
  const outputPath = join(getRepoRoot(), job.output_path);
  const statePath = join(getRepoRoot(), job.state_path);
  const outputExists = existsSync(outputPath);
  const stateExists = existsSync(statePath);
  if (!outputExists && !stateExists) {
    return canonicalAuditReuse(job) ? "reused_canonical" : "pending";
  }
  if (outputExists !== stateExists) {
    if (canonicalAuditReuse(job)) return "reused_canonical";
    throw new Error(`Refusing partial campaign artifact for ${job.job_id}: output and state must both exist`);
  }
  try {
    const outputContent = readFileSync(outputPath, "utf8");
    const output = validateJobOutput(job, readJson(outputPath));
    const state = parseJobState(readJson(statePath), job.state_path);
    const expected = expectedJobState(job, outputContent);
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (state[field as keyof JobState] !== expectedValue) {
        throw new Error(`Refusing stale campaign artifact for ${job.job_id}: state.${field} does not match the job`);
      }
    }
    validateJobOutput(job, output);
    return "resumed";
  } catch (error) {
    if (canonicalAuditReuse(job)) return "reused_canonical";
    throw error;
  }
}

export type CommentaryCampaignRetryOptions = {
  dialogue: string;
  stage: CommentaryCampaignStage;
  unitKeys: string[];
  codexExecutable?: string;
};

function commentaryCampaignRetries(
  options: CommentaryCampaignRetryOptions,
  apply: boolean,
): CommentaryCampaignRetryResult[] {
  if (!DIALOGUE.test(options.dialogue)) throw new Error(`Invalid dialogue slug: ${options.dialogue}`);
  if (options.stage === "outline" && options.unitKeys.length > 0) {
    throw new Error("Outline retry does not accept commentary unit keys");
  }
  if (options.stage !== "outline" && options.unitKeys.length === 0) {
    throw new Error("At least one commentary unit key is required");
  }
  if (new Set(options.unitKeys).size !== options.unitKeys.length) {
    throw new Error("Commentary retry unit keys must be unique");
  }
  for (const unitKey of options.unitKeys) {
    if (!UNIT_KEY.test(unitKey)) throw new Error(`Invalid commentary unit key: ${unitKey}`);
  }
  const inspect = () => {
    const manifest = buildCommentaryCampaignManifest({
      dialogue: options.dialogue,
      stage: options.stage,
      ...(options.codexExecutable ? { codexExecutable: options.codexExecutable } : {}),
    });
    const repoRoot = getRepoRoot();
    const canonicalAuditReuse = createReusableCanonicalAuditOutputResolver();
    const jobs = options.stage === "outline"
      ? manifest.jobs.filter((candidate) => candidate.stage === "outline")
      : options.unitKeys.map((unitKey) => {
      const job = manifest.jobs.find(
        (candidate) => candidate.stage === options.stage && candidate.unit_key === unitKey,
      );
      if (!job) throw new Error(`No current ${options.stage} job for ${options.dialogue}/${unitKey}`);
      if (options.stage === "audit") {
        // Retry archives active scratch artifacts. A valid canonical or
        // delegated fallback must not make a stale/malformed scratch pair
        // impossible to archive, while a current passing scratch result still
        // remains protected from retry.
        const outcome = auditArtifactOutcome(job, () => undefined);
        if (outcome === "passed") {
          throw new Error(`Refusing to retry a passing quality audit for ${options.dialogue}/${unitKey}`);
        }
        if (outcome === "failed") {
          try {
            if (inspectResume(job, () => undefined) === "resumed") {
              throw new Error(
                `Refusing to re-audit unchanged semantic failure for ${options.dialogue}/${unitKey}; run the rewrite stage`,
              );
            }
          } catch (error) {
            if (error instanceof Error && error.message.startsWith("Refusing to re-audit unchanged semantic failure")) {
              throw error;
            }
            // Stale or malformed audit artifacts are valid retry candidates.
          }
        }
      }
      if (!existsSync(join(repoRoot, job.output_path)) && !existsSync(join(repoRoot, job.state_path))) {
        const telemetryPath = commentaryCampaignTelemetryPath(job.state_path);
        if (!existsSync(join(repoRoot, telemetryPath))) {
          throw new Error(`No output, state, or telemetry artifact exists to retry for ${job.job_id}`);
        }
      }
      return job;
    });
    if (options.stage === "outline" && jobs.length !== 1) {
      throw new Error(`Expected one current outline job for ${options.dialogue}, found ${jobs.length}`);
    }

    return jobs.map((job) => {
      const outputAbsolutePath = join(repoRoot, job.output_path);
      const stateAbsolutePath = join(repoRoot, job.state_path);
      const telemetryPath = commentaryCampaignTelemetryPath(job.state_path);
      const telemetryAbsolutePath = join(repoRoot, telemetryPath);
      const outputExists = existsSync(outputAbsolutePath);
      const stateExists = existsSync(stateAbsolutePath);
      const telemetryExists = existsSync(telemetryAbsolutePath);
      const outputContent = outputExists ? readFileSync(outputAbsolutePath) : new Uint8Array();
      const stateContent = stateExists ? readFileSync(stateAbsolutePath) : new Uint8Array();
      const pairHash = sha256(
        stableJson({
          output_exists: outputExists,
          output_sha256: outputExists ? sha256(outputContent) : null,
          state_exists: stateExists,
          state_sha256: stateExists ? sha256(stateContent) : null,
        }),
      ).slice(0, 16);
      const historyDirectory = `scratch/commentary/campaign-history/${options.dialogue}`;
      const historyAbsoluteDirectory = join(repoRoot, historyDirectory);
      if (apply) mkdirSync(historyAbsoluteDirectory, { recursive: true });
      const retryKey = job.unit_key ?? job.input_sha256.slice(0, 16);
      const basePrefix = `${options.stage}-${retryKey}-${pairHash}-retry-`;
      let ordinal = 1;
      while (
        existsSync(join(historyAbsoluteDirectory, `${basePrefix}${String(ordinal).padStart(4, "0")}.output.json`)) ||
        existsSync(join(historyAbsoluteDirectory, `${basePrefix}${String(ordinal).padStart(4, "0")}.state.json`)) ||
        existsSync(join(historyAbsoluteDirectory, `${basePrefix}${String(ordinal).padStart(4, "0")}.usage.json`))
      ) {
        ordinal += 1;
      }
      const suffix = `${basePrefix}${String(ordinal).padStart(4, "0")}`;
      const outputArchivePath = outputExists ? `${historyDirectory}/${suffix}.output.json` : undefined;
      const stateArchivePath = stateExists ? `${historyDirectory}/${suffix}.state.json` : undefined;
      const telemetryArchivePath = telemetryExists ? `${historyDirectory}/${suffix}.usage.json` : undefined;
      if (apply && outputArchivePath) renameSync(outputAbsolutePath, join(repoRoot, outputArchivePath));
      if (apply && stateArchivePath) renameSync(stateAbsolutePath, join(repoRoot, stateArchivePath));
      if (apply && telemetryArchivePath) renameSync(telemetryAbsolutePath, join(repoRoot, telemetryArchivePath));
      return {
        dialogue: options.dialogue,
        stage: options.stage,
        unitKey: job.unit_key ?? null,
        outputPath: job.output_path,
        statePath: job.state_path,
        telemetryPath,
        ...(outputArchivePath ? { outputArchivePath } : {}),
        ...(stateArchivePath ? { stateArchivePath } : {}),
        ...(telemetryArchivePath ? { telemetryArchivePath } : {}),
        rerunCommand: `bun scripts/commentary/commentary-campaign.ts run --execute --dialogue ${options.dialogue} --stage ${options.stage}${job.unit_key ? ` --unit-key ${job.unit_key}` : ""} --max-new-jobs 1 --concurrency 1`,
      };
    });
  };
  if (!apply) return inspect();
  const retryStatePath = `scratch/commentary/campaign-state/${options.dialogue}`;
  return withRepoWriteLock(
    { paths: [retryStatePath], label: `commentary-campaign-retry:${options.dialogue}` },
    inspect,
  );
}

export function previewCommentaryCampaignRetries(
  options: CommentaryCampaignRetryOptions,
): CommentaryCampaignRetryResult[] {
  return commentaryCampaignRetries(options, false);
}

export function prepareCommentaryCampaignRetries(
  options: CommentaryCampaignRetryOptions,
): CommentaryCampaignRetryResult[] {
  return commentaryCampaignRetries(options, true);
}

export function prepareCommentaryCampaignRetry(options: {
  dialogue: string;
  stage: Exclude<CommentaryCampaignStage, "outline">;
  unitKey: string;
  codexExecutable?: string;
}): CommentaryCampaignRetryResult {
  return prepareCommentaryCampaignRetries({
    dialogue: options.dialogue,
    stage: options.stage,
    unitKeys: [options.unitKey],
    ...(options.codexExecutable ? { codexExecutable: options.codexExecutable } : {}),
  })[0]!;
}

function atomicWrite(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const tempPath = `${path}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  writeFileSync(tempPath, content, "utf8");
  renameSync(tempPath, path);
}

function validateAuditBrief(job: CommentaryCampaignJob, brief: CommentaryAuditBrief | undefined) {
  if (
    !brief ||
    brief.sectionId !== job.section_id ||
    brief.path !== job.audit_brief_path ||
    brief.sha256 !== job.audit_brief_sha256 ||
    sha256(brief.content) !== brief.sha256 ||
    stableJson(brief.commentaryIds) !== stableJson(job.commentary_ids)
  ) {
    throw new Error(`Refusing stale quality-audit brief for ${job.job_id}`);
  }
  return brief;
}

function outputSchemaPath(job: CommentaryCampaignJob) {
  const index = job.command.args.indexOf("--output-schema");
  const path = index >= 0 ? job.command.args[index + 1] : undefined;
  if (!path) throw new Error(`Codex job ${job.job_id} is missing --output-schema`);
  return path;
}

function outputSchemaForStage(stage: CommentaryCampaignStage) {
  return stage === "outline"
    ? COMMENTARY_OUTLINE_JSON_SCHEMA
    : stage === "draft"
      ? COMMENTARY_UNIT_DRAFT_JSON_SCHEMA
      : stage === "audit"
        ? COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA
      : COMMENTARY_REWRITE_JSON_SCHEMA;
}

function outputSchemaForJob(job: CommentaryCampaignJob) {
  return job.stage === "rewrite"
    ? commentaryRewriteOutputSchema(job.rewrite_title_constraints ?? [], job.rewrite_exact_constraints ?? [])
    : outputSchemaForStage(job.stage);
}

function validateCommentaryCampaignJobContract(job: CommentaryCampaignJob) {
  if (
    job.model_argument !== COMMENTARY_MODEL_ARGUMENT ||
    job.codex_cli_version !== COMMENTARY_CODEX_CLI_VERSION ||
    job.model_catalog_path !== COMMENTARY_MODEL_CATALOG_PATH ||
    job.authoring_model !== COMMENTARY_AUTHORING_MODEL ||
    job.effort !== COMMENTARY_STAGE_EFFORT[job.stage] ||
    job.permission_mode !== COMMENTARY_PERMISSION_MODE
  ) {
    throw new Error(`Commentary campaign job ${job.job_id} has noncanonical invocation provenance`);
  }
  if (sha256(job.prompt) !== job.prompt_sha256) {
    throw new Error(`Refusing stale campaign prompt for ${job.job_id}`);
  }
  if (sha256(stableJson(outputSchemaForJob(job))) !== job.output_schema_sha256) {
    throw new Error(`Refusing stale campaign output schema for ${job.job_id}`);
  }
  const modelCatalogInput = job.input_files.find((input) => input.path === job.model_catalog_path);
  if (!modelCatalogInput || modelCatalogInput.sha256 !== job.model_catalog_sha256) {
    throw new Error(`Refusing inconsistent model catalog provenance for ${job.job_id}`);
  }
  if (commentaryCampaignInputSha256(job) !== job.input_sha256) {
    throw new Error(`Refusing stale campaign identity for ${job.job_id}`);
  }

  const shortHash = job.input_sha256.slice(0, 16);
  const unitKey = job.unit_key;
  if (job.stage !== "outline" && !unitKey) {
    throw new Error(`Commentary campaign job ${job.job_id} is missing its unit key`);
  }
  const expectedJobId = job.stage === "outline"
    ? `outline:${job.dialogue}:${shortHash}`
    : `${job.stage}:${job.dialogue}:${unitKey}`;
  const expectedOutputPath = job.stage === "outline"
    ? `scratch/commentary/outlines/${job.dialogue}/outline-${shortHash}.json`
    : job.stage === "audit"
      ? `scratch/commentary/audits/${job.dialogue}/${unitKey}.json`
      : job.stage === "rewrite"
        ? `scratch/commentary/rewrites/${job.dialogue}/${unitKey}.json`
        : `scratch/commentary/drafts/${job.dialogue}/${unitKey}.json`;
  const expectedStatePath = job.stage === "outline"
    ? `scratch/commentary/campaign-state/${job.dialogue}/outline-${shortHash}.json`
    : `scratch/commentary/campaign-state/${job.dialogue}/${job.stage}-${unitKey}.json`;
  if (
    job.job_id !== expectedJobId ||
    job.output_path !== expectedOutputPath ||
    job.state_path !== expectedStatePath
  ) {
    throw new Error(`Commentary campaign job ${job.job_id} has noncanonical artifact identity`);
  }

  const schemaPath = commentaryCampaignSchemaPath(job.dialogue, job.stage, unitKey);
  const expectedArgs = codexArgs({
    stage: job.stage,
    prompt: job.prompt,
    schemaPath,
    modelCatalogPath: join(getRepoRoot(), COMMENTARY_MODEL_CATALOG_PATH),
  });
  if (outputSchemaPath(job) !== schemaPath || stableJson(job.command.args) !== stableJson(expectedArgs)) {
    throw new Error(`Commentary campaign job ${job.job_id} has noncanonical Codex arguments`);
  }
}

function snapshotCommentaryCampaignJobs(sourceJobs: CommentaryCampaignJob[]) {
  const jobs = structuredClone(sourceJobs);
  const jobIds = new Set<string>();
  const artifactOwners = new Map<string, string>();
  let executable: string | undefined;
  for (const job of jobs) {
    if (jobIds.has(job.job_id)) throw new Error(`Duplicate commentary campaign job id: ${job.job_id}`);
    jobIds.add(job.job_id);
    for (const [kind, path] of [
      ["output", job.output_path],
      ["state", job.state_path],
      ["schema", outputSchemaPath(job)],
    ] as const) {
      const normalized = normalizeRepoPath(path).relativePath;
      const owner = artifactOwners.get(normalized);
      if (owner) {
        throw new Error(
          `Commentary campaign artifact path collision at ${normalized}: ${owner} and ${job.job_id} ${kind}`,
        );
      }
      artifactOwners.set(normalized, `${job.job_id} ${kind}`);
    }
    validateCommentaryCampaignJobContract(job);
    executable ??= job.command.executable;
    if (job.command.executable !== executable) {
      throw new Error("Commentary campaign jobs must use one Codex executable");
    }
  }
  return jobs;
}

function validateCampaignJobInputs(jobs: CommentaryCampaignJob[]) {
  const expectedByPath = new Map<string, { sha256: string; jobs: string[]; absolutePath: string }>();
  for (const job of jobs) {
    for (const input of job.input_files) {
      if (!SHA256.test(input.sha256)) {
        throw new Error(`Campaign input ${input.path} has an invalid SHA-256 digest for ${job.job_id}`);
      }
      const normalized = normalizeRepoPath(input.path);
      const expected = expectedByPath.get(normalized.relativePath);
      if (expected && expected.sha256 !== input.sha256) {
        throw new Error(
          `Campaign jobs disagree on the expected hash for ${normalized.relativePath}: ${expected.jobs[0]} and ${job.job_id}`,
        );
      }
      if (expected) {
        expected.jobs.push(job.job_id);
      } else {
        expectedByPath.set(normalized.relativePath, {
          sha256: input.sha256,
          jobs: [job.job_id],
          absolutePath: normalized.absolutePath,
        });
      }
    }
  }
  for (const [path, expected] of expectedByPath) {
    if (!existsSync(expected.absolutePath) || sha256(readFileSync(expected.absolutePath)) !== expected.sha256) {
      throw new Error(
        `Refusing stale campaign input ${path} for ${expected.jobs.join(", ")}`,
      );
    }
  }
  for (const job of jobs) validateAuditJobListenerProse(job);
}

function validateAuditJobListenerProse(job: CommentaryCampaignJob) {
  if (job.stage !== "audit") return;
  const ledgerPath = `wiki/commentary/${job.dialogue}.md`;
  const blocks = commentaryMarkdownBlocks(readFileSync(join(getRepoRoot(), ledgerPath), "utf8"));
  const byId = new Map(
    blocks.map((block) => [fieldValue(block.content, "commentary_id") ?? "", block.content]),
  );
  for (const commentaryId of job.commentary_ids ?? []) {
    const content = byId.get(commentaryId);
    if (!content) throw new Error(`${ledgerPath} is missing audit block ${commentaryId}`);
    const body = fieldValue(content, "body");
    if (!body) throw new Error(`${ledgerPath} ${commentaryId} is missing listener-facing body prose`);
    validateCommentaryListenerProse(body, `${ledgerPath} ${commentaryId}.body`);
  }
}

function auditInputPacket(
  job: CommentaryCampaignJob,
  brief: CommentaryAuditBrief,
) {
  if (job.audit_brief_sha256 !== brief.sha256) {
    throw new Error(`Refusing stale quality-audit input packet for ${job.job_id}`);
  }
  return [
    "COMMENTARY_QUALITY_AUDIT_INPUT_V2",
    "<<<COMMENTARY_AUDIT_BRIEF>>>",
    brief.content,
    "<<<END_COMMENTARY_AUDIT_BRIEF>>>",
    "",
    `brief_path: ${brief.path}`,
    `brief_sha256: ${brief.sha256}`,
    `audited_content_sha256: ${brief.auditedContentSha256}`,
    "",
  ].join("\n");
}

function prepareAuditInputPackets(
  jobs: CommentaryCampaignJob[],
  existingEvidence?: CommentaryAuditEvidenceSnapshot,
  packetJobIds = new Set(jobs.map((job) => job.job_id)),
) {
  const auditJobs = jobs.filter((job) => job.stage === "audit");
  const packets = new Map<string, string>();
  if (auditJobs.length === 0) return packets;

  const evidence = existingEvidence ?? buildCommentaryAuditEvidenceSnapshot();
  const briefsByDialogue = new Map<string, ReadonlyMap<string, CommentaryAuditBrief>>();
  const pendingUnitKeysByDialogue = new Map<string, Set<string>>();
  for (const job of auditJobs) {
    if (!job.unit_key) continue;
    const unitKeys = pendingUnitKeysByDialogue.get(job.dialogue) ?? new Set<string>();
    unitKeys.add(job.unit_key);
    pendingUnitKeysByDialogue.set(job.dialogue, unitKeys);
  }
  for (const job of auditJobs) {
    let dialogueBriefs = briefsByDialogue.get(job.dialogue);
    if (!dialogueBriefs) {
      dialogueBriefs = new Map(
        buildCommentaryAuditBriefs(
          job.dialogue,
          evidence,
          pendingUnitKeysByDialogue.get(job.dialogue),
        ).map((brief) => [brief.unitKey, brief]),
      );
      briefsByDialogue.set(job.dialogue, dialogueBriefs);
    }
    const brief = validateAuditBrief(job, dialogueBriefs.get(job.unit_key ?? ""));
    if (!packetJobIds.has(job.job_id)) continue;
    atomicWrite(join(getRepoRoot(), brief.path), brief.content);
    if (packets.has(job.job_id)) throw new Error(`Duplicate commentary campaign job id: ${job.job_id}`);
    packets.set(job.job_id, auditInputPacket(job, brief));
  }
  return packets;
}

async function generateJob(
  job: CommentaryCampaignJob,
  options: RunCommentaryCampaignOptions,
  auth: LunaAuthStatus,
  auditInputPackets: ReadonlyMap<string, string>,
) {
  const stdin = job.stage === "audit" ? auditInputPackets.get(job.job_id) : undefined;
  if (job.stage === "audit" && stdin === undefined) {
    throw new Error(`Quality-audit input packet was not prepared for ${job.job_id}`);
  }
  const schemaPath = outputSchemaPath(job);
  const schemaAbsolutePath = join(getRepoRoot(), schemaPath);
  atomicWrite(schemaAbsolutePath, prettyJson(outputSchemaForJob(job)));
  try {
    const providerBlockBeforeRequest = readLunaProviderBlockSnapshot();
    const executable = options.codexExecutable ?? job.command.executable;
    const startedAt = new Date();
    const startedMs = Date.now();
    let result: CommentaryCampaignCommandResult;
    try {
      result = await (options.commandRunner ?? runCommand)(
        executable,
        job.command.args,
        options.cwd ?? getRepoRoot(),
        options.env,
        stdin,
      );
    } catch (error) {
      recordCommentaryCampaignAttempt({
        campaign: COMMENTARY_CAMPAIGN_ID,
        job,
        startedAt,
        completedAt: new Date(),
        durationMs: Date.now() - startedMs,
        outcome: "transport_error",
        exitCode: null,
        stdout: "",
        stderr: "",
        usage: null,
      });
      throw error;
    }
    const recordAttempt = (
      outcome: CommentaryCampaignAttemptOutcome,
      usage: CommentaryCampaignTokenUsage | null,
    ) =>
      recordCommentaryCampaignAttempt({
        campaign: COMMENTARY_CAMPAIGN_ID,
        job,
        startedAt,
        completedAt: new Date(),
        durationMs: Date.now() - startedMs,
        outcome,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        usage,
      });
    const providerBlock = monthlySpendLimitEvidence(job, auth, result);
    if (providerBlock) {
      writeLunaProviderBlock(providerBlock);
      recordAttempt("provider_quota", null);
      throw new LunaProviderQuotaError(
        `Codex job ${job.job_id} failed: ${providerBlock.diagnostic}`,
      );
    }
    if (result.exitCode !== 0) {
      recordAttempt("command_failed", null);
      throw new Error(`Codex job ${job.job_id} failed: ${formatLunaCommandFailure(result)}`);
    }
    const payload = result.stdout;
    let parsedResult: ReturnType<typeof parseCodexExecResult>;
    try {
      parsedResult = parseCodexExecResult(payload, `Codex job ${job.job_id}`);
    } catch (error) {
      if (error instanceof CodexExecOperationalError) {
        recordAttempt("transport_error", null);
        throw error;
      }
      recordAttempt("invalid_output", null);
      throw new CommentaryCampaignInvalidOutputError(
        `${error instanceof Error ? error.message : String(error)}; Codex response summary: ${summarizeLunaResponse(payload)}`,
      );
    }
    let output: ReturnType<typeof validateJobOutput>;
    try {
      output = validateJobOutput(job, parsedResult.structured_output);
    } catch (error) {
      recordAttempt("invalid_output", parsedResult.usage);
      throw new CommentaryCampaignInvalidOutputError(
        `${error instanceof Error ? error.message : String(error)}; Codex response summary: ${summarizeLunaResponse(payload)}`,
      );
    }
    const outputContent = prettyJson(output);
    const state: JobState = {
      schema_version: JOB_STATE_SCHEMA_VERSION,
      job_id: job.job_id,
      stage: job.stage,
      input_sha256: job.input_sha256,
      output_schema_sha256: job.output_schema_sha256,
      model_argument: job.model_argument,
      codex_cli_version: job.codex_cli_version,
      model_catalog_path: job.model_catalog_path,
      model_catalog_sha256: job.model_catalog_sha256,
      authoring_model: job.authoring_model,
      effort: job.effort,
      permission_mode: job.permission_mode,
      output_path: job.output_path,
      output_sha256: sha256(outputContent),
    };
    atomicWrite(join(getRepoRoot(), job.output_path), outputContent);
    atomicWrite(join(getRepoRoot(), job.state_path), prettyJson(state));
    let telemetryPath: string;
    try {
      telemetryPath = recordAttempt("generated", parsedResult.usage).path;
    } catch (error) {
      rmSync(join(getRepoRoot(), job.output_path), { force: true });
      rmSync(join(getRepoRoot(), job.state_path), { force: true });
      throw error;
    }
    clearLunaProviderBlock(providerBlockBeforeRequest);
    return telemetryPath;
  } finally {
    rmSync(schemaAbsolutePath, { force: true });
  }
}

async function executeCommentaryCampaign(
  manifest: CommentaryCampaignManifest,
  options: RunCommentaryCampaignOptions = {},
  auditEvidence?: CommentaryAuditEvidenceSnapshot,
  generatedInputs: readonly CommentaryRewriteEvidenceSupplement[] = [],
): Promise<CommentaryCampaignJobResult[]> {
  const jobs = snapshotCommentaryCampaignJobs(options.jobs ?? manifest.jobs);
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > MAX_CONCURRENCY) {
    throw new Error(`Commentary campaign concurrency must be an integer from 1 through ${MAX_CONCURRENCY}`);
  }
  const maxNewJobs = options.maxNewJobs ?? Number.POSITIVE_INFINITY;
  if (
    maxNewJobs !== Number.POSITIVE_INFINITY &&
    (!Number.isInteger(maxNewJobs) || maxNewJobs < 1)
  ) {
    throw new Error("Commentary campaign maxNewJobs must be a positive integer");
  }
  if (!(options.execute ?? false)) {
    return jobs.map((job) => ({ job_id: job.job_id, output_path: job.output_path, status: "planned" }));
  }
  if (jobs.length === 0) return [];

  const preflight = buildCommentaryCampaignPreflightReport({
    manifest: { ...manifest, jobs },
    canonicalAuditReuse: createReusableCanonicalAuditOutputResolver({
      ...(auditEvidence ? { auditEvidence } : {}),
    }),
    generatedInputs,
  });
  const blockers = preflight.jobs.filter((job) => job.blocks_execution);
  if (!preflight.ok_to_execute) {
    throw new Error(
      `Commentary campaign preflight blocked paid execution:\n${blockers
        .map((job) => `${job.job_id} [${job.classification}]: ${job.detail}`)
        .join("\n")}`,
    );
  }
  if (preflight.paid_job_count > 1 && !Number.isFinite(maxNewJobs)) {
    throw new Error(
      `Commentary campaign paid execution requires finite maxNewJobs when more than one new job is selected; preflight found ${preflight.paid_job_count}`,
    );
  }

  const codexExecutable = options.codexExecutable ?? jobs[0]!.command.executable;
  const cwd = options.cwd ?? getRepoRoot();
  await assertCommentaryCodexVersion({
    codexExecutable,
    cwd,
    ...(options.env ? { env: options.env } : {}),
    ...(options.commandRunner ? { commandRunner: options.commandRunner } : {}),
  });

  const auth = await readLunaAuthStatus({
    codexExecutable,
    cwd,
    ...(options.env ? { env: options.env } : {}),
    ...(options.commandRunner ? { commandRunner: options.commandRunner } : {}),
  });
  if (!auth.logged_in) {
    throw new Error(
      `Codex auth preflight failed (loggedIn=false); run codex login before --execute`,
    );
  }

  const selectedInputPaths = new Set(jobs.flatMap((job) => job.input_files.map((input) => input.path)));
  for (const generated of generatedInputs) {
    if (!selectedInputPaths.has(generated.path)) continue;
    if (sha256(generated.content) !== generated.sha256) {
      throw new Error(`Generated campaign input hash mismatch: ${generated.path}`);
    }
    const absolutePath = join(getRepoRoot(), generated.path);
    if (existsSync(absolutePath)) {
      if (sha256(readFileSync(absolutePath)) !== generated.sha256) {
        throw new Error(`Refusing to overwrite stale generated campaign input: ${generated.path}`);
      }
      continue;
    }
    atomicWrite(absolutePath, generated.content);
  }

  validateCampaignJobInputs(jobs);
  const canonicalAuditReuse = createReusableCanonicalAuditOutputResolver({
    ...(auditEvidence ? { auditEvidence } : {}),
  });
  const decisions = jobs.map((job) => ({ job, resume: inspectResume(job, canonicalAuditReuse) }));
  const results = new Map<string, CommentaryCampaignJobResult>();
  for (const decision of decisions) {
    if (decision.resume === "resumed") {
      results.set(decision.job.job_id, {
        job_id: decision.job.job_id,
        output_path: decision.job.output_path,
        status: "resumed",
      });
    } else if (decision.resume === "reused_canonical") {
      results.set(decision.job.job_id, {
        job_id: decision.job.job_id,
        output_path: decision.job.output_path,
        status: "reused_canonical",
      });
    }
  }
  const allPending = decisions.filter((decision) => decision.resume === "pending").map((decision) => decision.job);
  const pending = allPending.slice(0, maxNewJobs);
  for (const job of allPending.slice(pending.length)) {
    results.set(job.job_id, {
      job_id: job.job_id,
      output_path: job.output_path,
      status: "deferred",
    });
  }
  const jobsRequiringFreshAuditBrief = decisions
    .filter((decision) => decision.resume !== "reused_canonical")
    .map((decision) => decision.job);
  const auditInputPackets = prepareAuditInputPackets(
    jobsRequiringFreshAuditBrief,
    auditEvidence,
    new Set(pending.map((job) => job.job_id)),
  );
  let cursor = 0;
  let stopScheduling = false;
  const failures: string[] = [];
  const workers = Array.from({ length: Math.min(concurrency, pending.length) }, async () => {
    while (!stopScheduling && cursor < pending.length) {
      const index = cursor++;
      const job = pending[index]!;
      try {
        const telemetryPath = await generateJob(job, options, auth, auditInputPackets);
        results.set(job.job_id, {
          job_id: job.job_id,
          output_path: job.output_path,
          status: "generated",
          telemetry_path: telemetryPath,
        });
      } catch (error) {
        const recoverableInvalidOutput = error instanceof CommentaryCampaignInvalidOutputError;
        if (!recoverableInvalidOutput) stopScheduling = true;
        failures.push(
          `${job.job_id}${recoverableInvalidOutput ? " [invalid_output]" : ""}: ${String(error)}`,
        );
      }
    }
  });
  await Promise.all(workers);
  if (failures.length > 0) throw new Error(`Commentary campaign job failures:\n${failures.join("\n")}`);
  return jobs.map((job) => results.get(job.job_id)!);
}

export function runCommentaryCampaign(
  manifest: CommentaryCampaignManifest,
  options: RunCommentaryCampaignOptions = {},
): Promise<CommentaryCampaignJobResult[]> {
  return executeCommentaryCampaign(manifest, options);
}

export function runCommentaryCampaignPlan(
  plan: CommentaryCampaignPlan,
  options: RunCommentaryCampaignOptions = {},
): Promise<CommentaryCampaignJobResult[]> {
  return executeCommentaryCampaign(
    plan.manifest,
    options,
    plan.auditEvidence,
    plan.generatedInputs,
  );
}

function boundedPreflightDetail(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  return detail.replaceAll(/\s+/gu, " ").trim().slice(0, 500);
}

function preflightNextAction(
  job: CommentaryCampaignJob,
  classification: CommentaryCampaignPreflightClassification,
) {
  if (classification === "current") return null;
  if (classification === "mechanical_fail") return "Repair the canonical listener-facing prose, then rebuild the preflight report.";
  if (classification === "semantic_fail") {
    return `bun scripts/commentary/commentary-campaign.ts run --execute --dialogue ${job.dialogue} --stage rewrite --unit-key ${job.unit_key} --max-new-jobs 1 --concurrency 1`;
  }
  if (classification === "stale" || classification === "malformed") {
    return `bun scripts/commentary/commentary-campaign.ts retry ${job.dialogue} ${job.stage}${job.unit_key ? ` ${job.unit_key}` : ""} --execute`;
  }
  return `bun scripts/commentary/commentary-campaign.ts run --execute --dialogue ${job.dialogue} --stage ${job.stage}${job.unit_key ? ` --unit-key ${job.unit_key}` : ""} --max-new-jobs 1 --concurrency 1`;
}

function preflightEntry(
  job: CommentaryCampaignJob,
  canonicalAuditReuse: ReusableCanonicalAuditOutputResolver,
  generatedInputs: ReadonlyMap<string, CommentaryRewriteEvidenceSupplement>,
): CommentaryCampaignPreflightEntry {
  const entry = (
    classification: CommentaryCampaignPreflightClassification,
    source: CommentaryCampaignPreflightEntry["source"],
    detail: string,
  ): CommentaryCampaignPreflightEntry => {
    const blocksExecution = classification === "stale" ||
      classification === "malformed" ||
      classification === "mechanical_fail";
   const action: CommentaryCampaignPreflightEntry["action"] = classification === "current"
      ? source === "canonical_manifest" ? "reuse_canonical" : source === "delegated_import" ? "reuse_delegated" : "reuse_scratch"
      : classification === "missing"
        ? "execute"
        : classification === "semantic_fail"
          ? "rewrite"
          : classification === "mechanical_fail"
            ? "repair"
            : "retry";
    return {
      job_id: job.job_id,
      dialogue: job.dialogue,
      stage: job.stage,
      unit_key: job.unit_key ?? null,
      classification,
      source,
      action,
      blocks_execution: blocksExecution,
      requires_paid_execution: classification === "missing",
      requires_retry: action === "retry",
      next_action: preflightNextAction(job, classification),
      detail,
    };
  };
  const canonicalFallback = () => {
    const reusable = canonicalAuditReuse(job);
    if (!reusable) return undefined;
    const delegated = reusable.source === "delegated_import";
    return entry(
      "current",
      delegated ? "delegated_import" : "canonical_manifest",
      (delegated ? "Current operator-delegated audit import from " : "Current accepted audit from ") + reusable.manifestPath + ".",
    );
  };

  for (const input of job.input_files) {
    const normalized = normalizeRepoPath(input.path);
    if (!existsSync(normalized.absolutePath)) {
      const generated = generatedInputs.get(normalized.relativePath);
      if (generated && generated.sha256 === input.sha256 && sha256(generated.content) === input.sha256) {
        continue;
      }
      return entry("stale", "none", `Input is missing: ${normalized.relativePath}.`);
    }
    if (sha256(readFileSync(normalized.absolutePath)) !== input.sha256) {
      return entry("stale", "none", `Input hash changed: ${normalized.relativePath}.`);
    }
  }
  try {
    validateAuditJobListenerProse(job);
  } catch (error) {
    return entry("mechanical_fail", "none", boundedPreflightDetail(error));
  }

  const outputPath = join(getRepoRoot(), job.output_path);
  const statePath = join(getRepoRoot(), job.state_path);
  const telemetryPath = join(getRepoRoot(), commentaryCampaignTelemetryPath(job.state_path));
  const outputExists = existsSync(outputPath);
  const stateExists = existsSync(statePath);
  const telemetryExists = existsSync(telemetryPath);
  if (!outputExists && !stateExists) {
    if (telemetryExists) {
      return entry(
        "malformed",
        "scratch",
        "A prior provider attempt has telemetry but no accepted output/state pair; archive it with retry before another paid call.",
      );
    }
    try {
      return canonicalFallback() ?? entry("missing", "none", "No output or state artifact exists.");
    } catch (error) {
      return entry("malformed", "canonical_manifest", boundedPreflightDetail(error));
    }
  }
  if (outputExists !== stateExists) {
    return entry("malformed", "scratch", "Output and state artifacts must exist as a pair.");
  }

  try {
    const outputContent = readFileSync(outputPath, "utf8");
    const output = validateJobOutput(job, readJson(outputPath));
    const state = parseJobState(readJson(statePath), job.state_path);
    const expected = expectedJobState(job, outputContent);
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (state[field as keyof JobState] !== expectedValue) {
        return entry(
          "stale",
          "scratch",
          `state.${field} does not match the current job.`,
        );
      }
    }
    if (job.stage === "audit" && (output as CommentaryQualityAudit).unit_verdict === "fail") {
      return entry("semantic_fail", "scratch", "The current exhaustive unit audit found one or more semantic quality failures.");
    }
    return entry("current", "scratch", "Output and state match the current job identity.");
  } catch (error) {
    return entry("malformed", "scratch", boundedPreflightDetail(error));
  }
}

export function buildCommentaryCampaignPreflightReport(options: {
  manifest: CommentaryCampaignManifest;
  canonicalAuditReuse?: ReusableCanonicalAuditOutputResolver;
  generatedInputs?: readonly CommentaryRewriteEvidenceSupplement[];
}): CommentaryCampaignPreflightReport {
  const jobs = snapshotCommentaryCampaignJobs(options.manifest.jobs);
  const canonicalAuditReuse = options.canonicalAuditReuse ?? createReusableCanonicalAuditOutputResolver();
  const generatedInputs = new Map(
    (options.generatedInputs ?? []).map((input) => [input.path, input] as const),
  );
  const entries = jobs.map((job) => preflightEntry(job, canonicalAuditReuse, generatedInputs));
  const totals: CommentaryCampaignPreflightReport["totals"] = {
    current: 0,
    missing: 0,
    stale: 0,
    malformed: 0,
    mechanical_fail: 0,
    semantic_fail: 0,
  };
  for (const item of entries) totals[item.classification] += 1;
  return {
    schema_version: 1,
    campaign: COMMENTARY_CAMPAIGN_ID,
    job_count: entries.length,
    ok_to_execute: entries.every((entry) => !entry.blocks_execution),
    paid_job_count: entries.filter((entry) => entry.requires_paid_execution).length,
    totals,
    jobs: entries,
  };
}

function jobArtifactStatus(
  job: CommentaryCampaignJob,
  canonicalAuditReuse = createReusableCanonicalAuditOutputResolver(),
): "pending" | "completed" | "stale" {
  try {
    return inspectResume(job, canonicalAuditReuse) === "pending" ? "pending" : "completed";
  } catch {
    return "stale";
  }
}

function auditArtifactOutcome(
  job: CommentaryCampaignJob,
  canonicalAuditReuse = createReusableCanonicalAuditOutputResolver(),
): "pending" | "passed" | "failed" | "stale" {
  try {
    const resume = inspectResume(job, canonicalAuditReuse);
    if (resume === "pending") return "pending";
    const audit = resume === "reused_canonical"
      ? canonicalAuditReuse(job)!.output
      : validateJobOutput(job, readJson(join(getRepoRoot(), job.output_path))) as CommentaryQualityAudit;
    return audit.unit_verdict === "pass" ? "passed" : "failed";
  } catch {
    return "stale";
  }
}

function pendingProviderExecution(
  providerAccess: LunaProviderAccessStatus,
): Extract<
  CommentaryCampaignDialogueStatus["execution"],
  "auth_blocked" | "auth_ready" | "provider_quota_blocked" | "provider_block_stale"
> {
  return providerAccess.status;
}

export function buildCommentaryCampaignStatusReport(options: {
  manifest?: CommentaryCampaignManifest;
  auth: LunaAuthStatus;
  providerAccess?: LunaProviderAccessStatus;
  expectedDialogues?: number;
  canonicalAuditReuse?: ReusableCanonicalAuditOutputResolver;
}): CommentaryCampaignStatusReport {
  const manifest = options.manifest ?? buildCommentaryCampaignManifest();
  const canonicalAuditReuse = options.canonicalAuditReuse ?? createReusableCanonicalAuditOutputResolver();
  const providerAccess = (options.providerAccess ?? (
    options.auth.logged_in
      ? { status: "auth_ready", reason: "no_provider_quota_block_observed" }
      : { status: "auth_blocked", reason: "not_logged_in" }
  )) satisfies LunaProviderAccessStatus;
  const pendingExecution = pendingProviderExecution(providerAccess);
  const dialogues = listGreekDialogues();
  const rows: CommentaryCampaignDialogueStatus[] = dialogues.map((dialogue) => {
    const ledger = ledgerSnapshot(dialogue);
    const briefs = ledger.sections.length > 0 ? dialogueBriefs(dialogue, ledger) : [];
    const jobs = manifest.jobs.filter((job) => job.dialogue === dialogue);
    const contentJobs = jobs.filter((job) => job.stage !== "audit");
    const auditJobs = jobs.filter((job) => job.stage === "audit");
    const contentStatuses = contentJobs.map((job) => jobArtifactStatus(job, canonicalAuditReuse));
    const completeContent = contentStatuses.filter((status) => status === "completed").length;
    const stale = contentStatuses.includes("stale");
    const auditOutcomes = auditJobs.map((job) => auditArtifactOutcome(job, canonicalAuditReuse));
    const complete = completeContent + auditOutcomes.filter((status) => status === "passed" || status === "failed").length;
    const auditPassed = auditOutcomes.filter((status) => status === "passed").length;
    const auditFailed = auditOutcomes.filter((status) => status === "failed").length;
    const auditStale = auditOutcomes.includes("stale");
    const auditRequired = ledger.accepted || ledger.nonSectionCount > 0 ? ledger.sectionScaffoldCount : 0;
    const qualityAuditStatus: CommentaryCampaignDialogueStatus["quality_audit_status"] =
      auditRequired === 0
        ? "not_required"
        : auditFailed > 0
          ? "failed"
          : auditPassed === auditRequired && auditJobs.length === auditRequired
            ? "completed"
            : "pending";
    const qualityAuditExecution: CommentaryCampaignDialogueStatus["quality_audit_execution"] =
      auditRequired === 0
        ? "not_required"
        : auditStale
          ? "stale_output"
          : auditOutcomes.length === auditRequired && auditOutcomes.every((status) => status === "passed" || status === "failed")
            ? "complete"
            : pendingExecution;
    let stage: CommentaryCampaignDialogueStatus["stage"];
    let ledgerStatus: CommentaryCampaignDialogueStatus["ledger"];
    if (ledger.accepted) {
      stage = "accepted";
      ledgerStatus = "accepted";
    } else if (ledger.sectionScaffoldCount === 0) {
      stage = "outline_pending";
      ledgerStatus = ledger.exists ? "no_sections" : "missing";
    } else if (ledger.nonSectionCount > 0) {
      stage = "serial_review_pending";
      ledgerStatus = "drafted";
    } else if (briefs.length < ledger.sections.length) {
      stage = "briefs_pending";
      ledgerStatus = "section_skeleton";
    } else if (completeContent === 0) {
      stage = "unit_briefs_ready";
      ledgerStatus = "section_skeleton";
    } else if (completeContent < contentJobs.filter((job) => job.stage === "draft").length) {
      stage = "unit_drafting_partial";
      ledgerStatus = "section_skeleton";
    } else {
      stage = "unit_drafts_ready_for_import";
      ledgerStatus = "section_skeleton";
    }
    return {
      dialogue,
      stage,
      ledger: ledgerStatus,
      section_count: ledger.sections.length,
      non_section_block_count: ledger.nonSectionCount,
      accepted_block_count: ledger.acceptedCount,
      brief_count: briefs.length,
      outline_job_count: jobs.filter((job) => job.stage === "outline").length,
      draft_job_count: jobs.filter((job) => job.stage === "draft").length,
      rewrite_job_count: jobs.filter((job) => job.stage === "rewrite").length,
      completed_job_count: complete,
      execution: ledger.accepted ? "complete" : stale ? "stale_output" : pendingExecution,
      quality_audit_status: qualityAuditStatus,
      quality_audit_required_count: auditRequired,
      quality_audit_job_count: auditJobs.length,
      quality_audit_passed_count: auditPassed,
      quality_audit_failed_count: auditFailed,
      quality_audit_execution: qualityAuditExecution,
    };
  });

  const countStage = (stage: CommentaryCampaignDialogueStatus["stage"]) =>
    rows.filter((row) => row.stage === stage).length;
  return {
    schema_version: CAMPAIGN_SCHEMA_VERSION,
    campaign: COMMENTARY_CAMPAIGN_ID,
    expected_dialogues: options.expectedDialogues ?? dialogues.length,
    actual_dialogues: dialogues.length,
    authoring: manifest.authoring,
    auth: options.auth,
    provider_access: providerAccess,
    totals: {
      accepted: countStage("accepted"),
      outline_pending: countStage("outline_pending"),
      briefs_pending: countStage("briefs_pending"),
      unit_briefs_ready: countStage("unit_briefs_ready"),
      unit_drafting_partial: countStage("unit_drafting_partial"),
      unit_drafts_ready_for_import: countStage("unit_drafts_ready_for_import"),
      serial_review_pending: countStage("serial_review_pending"),
      quality_audit_pending: rows.filter((row) => row.quality_audit_status === "pending").length,
      quality_audit_completed: rows.filter((row) => row.quality_audit_status === "completed").length,
      quality_audit_failed: rows.filter((row) => row.quality_audit_status === "failed").length,
      outline_jobs: manifest.jobs.filter((job) => job.stage === "outline").length,
      draft_jobs: manifest.jobs.filter((job) => job.stage === "draft").length,
      audit_jobs: manifest.jobs.filter((job) => job.stage === "audit").length,
      rewrite_jobs: manifest.jobs.filter((job) => job.stage === "rewrite").length,
      completed_jobs: rows.reduce((total, row) => total + row.completed_job_count, 0),
    },
    dialogues: rows,
  };
}

export function writeCommentaryCampaignStatusReport(report: CommentaryCampaignStatusReport) {
  const path = "scratch/commentary/campaign-status.json";
  atomicWrite(join(getRepoRoot(), path), prettyJson(report));
  return path;
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function yamlList(values: string[]) {
  return `[${values.map(yamlString).join(", ")}]`;
}

function renderOutlineSection(dialogue: string, sourceWork: string, id: string, section: CommentaryOutline["sections"][number]) {
  const ref = resolveSourceSpan(dialogue, section.stephanus_span).source_ref;
  return [
    "```yaml",
    `commentary_id: ${id}`,
    `source_work: ${sourceWork}`,
    "block_kind: section",
    "placement: before",
    `title: ${yamlString(section.title)}`,
    `stephanus_span: ${ref.stephanus_span}`,
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: ${yamlString(ref.text_sha256)}`,
    ...(section.audio_insertion ? renderAudioInsertionLines(section.audio_insertion) : []),
    `body: ${yamlString(section.body)}`,
    "cites:",
    `  observations: ${yamlList(section.cites.observations)}`,
    `  claims: ${yamlList(section.cites.claims)}`,
    `  relations: ${yamlList(section.cites.relations)}`,
    `  dossiers: ${yamlList(section.cites.dossiers)}`,
    "crossrefs: []",
    "author: model",
    "review_status: unreviewed",
    "```",
  ].join("\n");
}

function buildOutlineImport(
  dialogue: string,
  outlinePath: string,
  suppliedOutline?: CommentaryOutline,
  replaceSectionSkeleton = false,
  requireBoundReplacementArtifact = true,
) {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const normalized = normalizeRepoPath(outlinePath);
  const expectedDirectory = `scratch/commentary/outlines/${dialogue}`;
  if (dirname(normalized.relativePath) !== expectedDirectory || !/^outline-[a-f0-9]{16}\.json$/u.test(basename(normalized.relativePath))) {
    throw new Error(`Outline path must be a hashed JSON file directly inside ${expectedDirectory}`);
  }
  const outline = suppliedOutline ?? parseCommentaryOutline(readJson(normalized.absolutePath), normalized.relativePath);
  if (outline.dialogue !== dialogue) throw new Error(`Outline dialogue ${outline.dialogue} does not match ${dialogue}`);

  const index = buildStephanusIndex(dialogue);
  const resolutions = outline.sections.map((section) => resolveSourceSpan(dialogue, section.stephanus_span).source_ref);
  for (const [position, ref] of resolutions.entries()) {
    if (position === 0 && ref.start_char !== index.markers[0]?.startChar) {
      throw new Error(`Outline for ${dialogue} must begin at ${index.markers[0]?.marker}`);
    }
    const previous = resolutions[position - 1];
    if (previous && previous.end_char !== ref.start_char) {
      throw new Error(`Outline for ${dialogue} has a gap or overlap before ${outline.sections[position]!.unit_key}`);
    }
  }
  if (resolutions.at(-1)?.end_char !== readFileSync(join(getRepoRoot(), `raw/plato/greek/${dialogue}.txt`), "utf8").length) {
    throw new Error(`Outline for ${dialogue} must cover through the final Stephanus marker`);
  }
  const turns = readFreshCommentaryTurnIndex(dialogue).turns;
  for (const [position, ref] of resolutions.slice(0, -1).entries()) {
    const nextSection = outline.sections[position + 1]!;
    if (nextSection.audio_insertion) {
      resolveAudioInsertionBoundary(dialogue, nextSection.audio_insertion);
      continue;
    }
    const crossing = turns.find((turn) => turn.startChar < ref.end_char && ref.end_char < turn.endChar);
    if (crossing) {
      throw new Error(
        `Outline for ${dialogue} splits ${crossing.turnId} (${crossing.startMarker}-${crossing.endMarker}) after ${outline.sections[position]!.unit_key}`,
      );
    }
  }
  const englishIndex = buildEnglishStephanusIndex(dialogue);
  const englishContent = readFileSync(join(getRepoRoot(), englishIndex.sourcePath), "utf8");
  const sectionAudioStarts = outline.sections.map((section, position) => {
    if (section.audio_insertion) return resolveAudioInsertionBoundary(dialogue, section.audio_insertion).boundaryChar;
    const marker = englishIndex.markers.find((entry) => entry.marker === resolutions[position]!.start_marker);
    if (!marker) throw new Error(`Outline section ${section.unit_key} cannot project ${resolutions[position]!.start_marker} into English`);
    return sourceTurnBoundaryAtOrAfter(englishContent, marker.startChar);
  });
  if (
    sectionAudioStarts[0] !== 0 ||
    sectionAudioStarts.some(
      (start, position) =>
        start >= englishContent.length ||
        (position > 0 && start <= sectionAudioStarts[position - 1]!),
    )
  ) {
    throw new Error(
      `Outline for ${dialogue} must resolve to strictly increasing English chapter starts beginning at source char 0; received ${sectionAudioStarts.join(", ")}`,
    );
  }

  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const absoluteLedger = join(getRepoRoot(), ledgerPath);
  let prefix: string;
  if (existsSync(absoluteLedger)) {
    const current = readFileSync(absoluteLedger, "utf8");
    const currentBlocks = commentaryMarkdownBlocks(current);
    if (currentBlocks.length > 0) {
      if (!replaceSectionSkeleton) {
        throw new Error(`Refusing to replace existing commentary blocks in ${ledgerPath}`);
      }
      if (
        currentBlocks.some(
          (block) =>
            fieldValue(block.content, "block_kind") !== "section" ||
            fieldValue(block.content, "review_status") !== "unreviewed" ||
            fieldValue(block.content, "author") !== "model",
        )
      ) {
        throw new Error(`Refusing to replace anything except an entirely unreviewed section-only skeleton in ${ledgerPath}`);
      }
      const activeDrafts = activeDraftArtifactPaths(dialogue);
      if (activeDrafts.length > 0) {
        throw new Error(
          `Refusing to replace ${ledgerPath} while active draft artifacts exist: ${activeDrafts.join(", ")}; archive them with the campaign retry command first`,
        );
      }
      if (requireBoundReplacementArtifact) {
        const currentJob = buildCommentaryCampaignManifest({
          dialogue,
          stage: "outline",
          reviseOutline: true,
        }).jobs.find((job) => job.output_path === normalized.relativePath);
        if (!currentJob) {
          throw new Error(`Outline replacement is not the current content-addressed revision job for ${ledgerPath}`);
        }
        if (inspectResume(currentJob) !== "resumed") {
          throw new Error(`Outline replacement job is not complete for ${ledgerPath}`);
        }
      }
      const firstBlock = current.indexOf("```yaml");
      if (firstBlock < 0) throw new Error(`Could not locate the section skeleton body in ${ledgerPath}`);
      prefix = current.slice(0, firstBlock).trimEnd();
    } else {
      prefix = current.trimEnd();
    }
  } else {
    if (replaceSectionSkeleton) {
      throw new Error(`Cannot replace missing commentary skeleton ${ledgerPath}`);
    }
    prefix = [
      `# ${sourceWorkFor(dialogue)} Commentary`,
      "",
      "Authored teaching material for the reading view. Lane contract:",
      "`docs/commentary-protocol.md`. Section units were drafted in the isolated",
      `${COMMENTARY_AUTHORING_MODEL} campaign. Block-level review status and provenance are recorded`,
      "in each block and under `wiki/review/`.",
    ].join("\n");
  }
  const sourceWork = sourceWorkFor(dialogue);
  const sectionIds = outline.sections.map((_, index) => `comm_${dialogue}_${String(index + 1).padStart(4, "0")}`);
  const rendered = outline.sections
    .map((section, index) => renderOutlineSection(dialogue, sourceWork, sectionIds[index]!, section))
    .join("\n\n");
  const prospectiveLedger = `${prefix}\n\n${rendered}\n`;
  const issues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  return {
    dialogue,
    outlinePath: normalized.relativePath,
    ledgerPath,
    sectionIds,
    prospectiveLedger,
  };
}

export function importCommentaryOutline(options: {
  dialogue: string;
  outlinePath: string;
  apply?: boolean;
  replaceSectionSkeleton?: boolean;
}): CommentaryOutlineImportResult {
  if (!(options.apply ?? false)) {
    return {
      ...buildOutlineImport(
        options.dialogue,
        options.outlinePath,
        undefined,
        options.replaceSectionSkeleton ?? false,
      ),
      applied: false,
    };
  }
  return withRepoWriteLock(commentaryApplyLockScope(options.dialogue, "commentary-outline"), () => {
    const result = buildOutlineImport(
      options.dialogue,
      options.outlinePath,
      undefined,
      options.replaceSectionSkeleton ?? false,
    );
    if (options.replaceSectionSkeleton) {
      rmSync(join(getRepoRoot(), `scratch/commentary/briefs/${options.dialogue}`), { recursive: true, force: true });
    }
    const absoluteLedgerPath = join(getRepoRoot(), result.ledgerPath);
    const currentLedger = existsSync(absoluteLedgerPath) ? readFileSync(absoluteLedgerPath, "utf8") : "";
    atomicWrite(absoluteLedgerPath, result.prospectiveLedger);
    recordSubmission({
      lane: "commentary",
      kind: options.replaceSectionSkeleton ? "outline-replace" : "outline",
      scope: options.dialogue,
      sourcePath: result.outlinePath,
      targetPath: result.ledgerPath,
      targetContentBefore: currentLedger,
      targetContentAfter: result.prospectiveLedger,
      appliedIds: result.sectionIds,
      submission: readJson(join(getRepoRoot(), result.outlinePath)),
    });
    return { ...result, applied: true };
  });
}

function renderRewriteCrossrefs(crossrefs: CommentaryRewriteCrossref[]) {
  if (crossrefs.length === 0) return ["crossrefs: []"];
  return [
    "crossrefs:",
    ...crossrefs.flatMap((crossref) => {
      const ref = resolveSourceSpan(workNameToSlug(crossref.source_work), crossref.stephanus_span).source_ref;
      return [
        `  - source_work: ${yamlString(crossref.source_work)}`,
        `    stephanus_span: ${ref.stephanus_span}`,
        "    source_ref:",
        `      source_path: ${ref.source_path}`,
        `      stephanus_span: ${ref.stephanus_span}`,
        `      start_marker: ${ref.start_marker}`,
        `      end_marker: ${ref.end_marker}`,
        `      start_char: ${ref.start_char}`,
        `      end_char: ${ref.end_char}`,
        `      text_sha256: ${yamlString(ref.text_sha256)}`,
        ...(crossref.note ? [`    note: ${yamlString(crossref.note)}`] : []),
      ];
    }),
  ];
}

function renderRewriteBlock(
  dialogue: string,
  existing: ReturnType<typeof commentaryMarkdownBlocks>[number],
  revision: CommentaryRewrite["revisions"][number],
) {
  const sourceWork = fieldValue(existing.content, "source_work");
  const kind = fieldValue(existing.content, "block_kind");
  const placement = fieldValue(existing.content, "placement");
  const span = fieldValue(existing.content, "stephanus_span");
  if (!sourceWork || !kind || !placement || !span) {
    throw new Error(`Cannot rewrite malformed commentary block ${revision.commentary_id}`);
  }
  if (kind === "section" && revision.title.length === 0) {
    throw new Error(`Rewrite for section ${revision.commentary_id} requires a non-empty title`);
  }
  if (kind !== "section" && revision.title.length > 0) {
    throw new Error(`Rewrite for non-section ${revision.commentary_id} must use an empty title`);
  }
  const ref = resolveSourceSpan(dialogue, span).source_ref;
  const insertion = inspectAudioInsertionBlock(existing.content);
  if (insertion.errors.length > 0 || (insertion.present && !insertion.value)) {
    throw new Error(
      `Cannot preserve malformed audio_insertion on ${revision.commentary_id}: ${insertion.errors.join("; ")}`,
    );
  }
  if (insertion.value) {
    resolveAudioInsertionBoundary(
      dialogue,
      insertion.value,
      kind === "section" ? undefined : placement as "before" | "after",
    );
  }
  return [
    "```yaml",
    `commentary_id: ${revision.commentary_id}`,
    `source_work: ${sourceWork}`,
    `block_kind: ${kind}`,
    `placement: ${placement}`,
    ...(kind === "section" ? [`title: ${yamlString(revision.title)}`] : []),
    `stephanus_span: ${ref.stephanus_span}`,
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: ${yamlString(ref.text_sha256)}`,
    ...(insertion.value ? renderAudioInsertionLines(insertion.value) : []),
    `body: ${yamlString(revision.body)}`,
    "cites:",
    `  observations: ${yamlList(revision.cites.observations)}`,
    `  claims: ${yamlList(revision.cites.claims)}`,
    `  relations: ${yamlList(revision.cites.relations)}`,
    `  dossiers: ${yamlList(revision.cites.dossiers)}`,
    ...renderRewriteCrossrefs(revision.crossrefs),
    "author: model",
    "review_status: unreviewed",
    "```",
  ].join("\n");
}

export function buildCommentaryRevisionLedger(
  dialogue: string,
  currentLedger: string,
  revisions: CommentaryRevision[],
) {
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const blocks = commentaryMarkdownBlocks(currentLedger);
  const blockById = new Map(blocks.map((block) => [block.commentaryId, block]));
  const revisionIds = revisions.map((revision) => revision.commentary_id);
  if (new Set(revisionIds).size !== revisionIds.length) throw new Error("Commentary revisions contain duplicate IDs");
  let prospectiveLedger = currentLedger;
  for (const revision of revisions) {
    const existing = blockById.get(revision.commentary_id);
    if (!existing) throw new Error(`Rewrite names an unknown current block: ${revision.commentary_id}`);
    const rendered = renderRewriteBlock(dialogue, existing, revision);
    const occurrenceCount = prospectiveLedger.split(existing.fullMatch).length - 1;
    if (occurrenceCount !== 1) {
      throw new Error(`Cannot replace ${revision.commentary_id}: expected one exact canonical block, found ${occurrenceCount}`);
    }
    prospectiveLedger = prospectiveLedger.replace(existing.fullMatch, rendered);
  }
  const issues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  const wanted = new Set(revisionIds);
  return {
    prospectiveLedger,
    changedBlockIds: blocks
      .map((block) => block.commentaryId)
      .filter((id): id is string => id !== undefined && wanted.has(id)),
  };
}

/**
 * Bodies a rewrite is about to replace. Kept with the submission so a pre/post
 * pair survives in one tracked artifact; the drafts that produced them live in
 * gitignored scratch and symposium's are already gone.
 */
export function commentarySupersededBlocks(ledgerContent: string, blockIds: string[]) {
  const wanted = new Set(blockIds);
  return commentaryMarkdownBlocks(ledgerContent)
    .filter((block) => block.commentaryId !== undefined && wanted.has(block.commentaryId))
    .map((block) => ({ commentary_id: block.commentaryId, body: block.fullMatch }));
}

function buildRewriteImport(dialogue: string, rewritePath: string): Omit<CommentaryRewriteImportResult, "applied"> {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  const normalized = normalizeRepoPath(rewritePath);
  const expectedDirectory = `scratch/commentary/rewrites/${dialogue}`;
  if (dirname(normalized.relativePath) !== expectedDirectory || !UNIT_KEY.test(basename(normalized.relativePath, ".json"))) {
    throw new Error(`Rewrite path must be a unit-key JSON file directly inside ${expectedDirectory}`);
  }
  if (!normalized.relativePath.endsWith(".json") || !existsSync(normalized.absolutePath)) {
    throw new Error(`Commentary rewrite does not exist: ${normalized.relativePath}`);
  }

  const manifest = buildCommentaryCampaignManifest({ dialogue, stage: "rewrite" });
  const job = manifest.jobs.find((candidate) => candidate.output_path === normalized.relativePath);
  if (!job) {
    throw new Error(`Rewrite artifact is not bound to a current failed audit: ${normalized.relativePath}`);
  }
  const rewrite = validateJobOutput(job, readJson(normalized.absolutePath)) as CommentaryRewrite;
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const absoluteLedgerPath = join(getRepoRoot(), ledgerPath);
  const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
  const blocks = commentaryMarkdownBlocks(currentLedger);
  const blockById = new Map(blocks.map((block) => [block.commentaryId, block]));
  const changedIdSet = new Set(rewrite.revisions.map((revision) => revision.commentary_id));
  let prospectiveLedger = currentLedger;
  for (const revision of rewrite.revisions) {
    const existing = blockById.get(revision.commentary_id);
    if (!existing) throw new Error(`Rewrite names an unknown current block: ${revision.commentary_id}`);
    const rendered = renderRewriteBlock(dialogue, existing, revision);
    const occurrenceCount = prospectiveLedger.split(existing.fullMatch).length - 1;
    if (occurrenceCount !== 1) {
      throw new Error(`Cannot replace ${revision.commentary_id}: expected one exact canonical block, found ${occurrenceCount}`);
    }
    prospectiveLedger = prospectiveLedger.replace(existing.fullMatch, rendered);
  }
  const issues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  return {
    dialogue,
    rewritePath: normalized.relativePath,
    ledgerPath,
    unitKey: rewrite.unit_key,
    sectionId: rewrite.section_id,
    changedBlockIds: blocks
      .map((block) => block.commentaryId)
      .filter((id): id is string => id !== undefined && changedIdSet.has(id)),
    prospectiveLedger,
  };
}

export function importCommentaryRewrite(options: {
  dialogue: string;
  rewritePath: string;
  apply?: boolean;
}): CommentaryRewriteImportResult {
  if (!(options.apply ?? false)) return { ...buildRewriteImport(options.dialogue, options.rewritePath), applied: false };
  return withRepoWriteLock(commentaryApplyLockScope(options.dialogue, "commentary-rewrite"), () => {
    const result = buildRewriteImport(options.dialogue, options.rewritePath);
    const absoluteLedgerPath = join(getRepoRoot(), result.ledgerPath);
    const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
    atomicWrite(absoluteLedgerPath, result.prospectiveLedger);
    recordSubmission({
      lane: "commentary",
      kind: "rewrite",
      scope: options.dialogue,
      unitKey: result.unitKey,
      sourcePath: result.rewritePath,
      targetPath: result.ledgerPath,
      targetContentBefore: currentLedger,
      targetContentAfter: result.prospectiveLedger,
      appliedIds: result.changedBlockIds,
      submission: readJson(join(getRepoRoot(), result.rewritePath)),
      superseded: commentarySupersededBlocks(currentLedger, result.changedBlockIds),
    });
    return { ...result, applied: true };
  });
}

function buildRewriteBatchImport(
  dialogue: string,
  rewritePaths: string[],
): Omit<CommentaryRewriteBatchImportResult, "applied"> {
  if (!DIALOGUE.test(dialogue)) throw new Error(`Invalid dialogue slug: ${dialogue}`);
  if (rewritePaths.length === 0) throw new Error("Commentary rewrite batch requires at least one rewrite path");
  const normalizedPaths = rewritePaths.map((rewritePath) => {
    const normalized = normalizeRepoPath(rewritePath);
    const expectedDirectory = `scratch/commentary/rewrites/${dialogue}`;
    if (
      dirname(normalized.relativePath) !== expectedDirectory ||
      !normalized.relativePath.endsWith(".json") ||
      !UNIT_KEY.test(basename(normalized.relativePath, ".json"))
    ) {
      throw new Error(`Rewrite path must be a unit-key JSON file directly inside ${expectedDirectory}`);
    }
    if (!existsSync(normalized.absolutePath)) {
      throw new Error(`Commentary rewrite does not exist: ${normalized.relativePath}`);
    }
    return normalized;
  });
  if (new Set(normalizedPaths.map((entry) => entry.relativePath)).size !== normalizedPaths.length) {
    throw new Error("Commentary rewrite batch contains duplicate paths");
  }

  const manifest = buildCommentaryCampaignManifest({ dialogue, stage: "rewrite" });
  const jobByOutputPath = new Map(manifest.jobs.map((job) => [job.output_path, job]));
  const rewrites = normalizedPaths.map((normalized) => {
    const job = jobByOutputPath.get(normalized.relativePath);
    if (!job) {
      throw new Error(`Rewrite artifact is not bound to the current failed-audit wave: ${normalized.relativePath}`);
    }
    if (inspectResume(job) !== "resumed") {
      throw new Error(`Rewrite artifact is incomplete for the current failed-audit wave: ${normalized.relativePath}`);
    }
    return validateJobOutput(job, readJson(normalized.absolutePath)) as CommentaryRewrite;
  });

  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const currentLedger = readFileSync(join(getRepoRoot(), ledgerPath), "utf8");
  const blocks = commentaryMarkdownBlocks(currentLedger);
  const blockById = new Map(blocks.map((block) => [block.commentaryId, block]));
  const requestedChangedBlockIds = rewrites.flatMap((rewrite) =>
    rewrite.revisions.map((revision) => revision.commentary_id)
  );
  if (new Set(requestedChangedBlockIds).size !== requestedChangedBlockIds.length) {
    throw new Error("Commentary rewrite batch attempts to change one block more than once");
  }
  const changedIdSet = new Set(requestedChangedBlockIds);
  const changedBlockIds = blocks
    .map((block) => block.commentaryId)
    .filter((id): id is string => id !== undefined && changedIdSet.has(id));

  let prospectiveLedger = currentLedger;
  for (const rewrite of rewrites) {
    for (const revision of rewrite.revisions) {
      const existing = blockById.get(revision.commentary_id);
      if (!existing) throw new Error(`Rewrite names an unknown current block: ${revision.commentary_id}`);
      const rendered = renderRewriteBlock(dialogue, existing, revision);
      const occurrenceCount = prospectiveLedger.split(existing.fullMatch).length - 1;
      if (occurrenceCount !== 1) {
        throw new Error(`Cannot replace ${revision.commentary_id}: expected one exact canonical block, found ${occurrenceCount}`);
      }
      prospectiveLedger = prospectiveLedger.replace(existing.fullMatch, rendered);
    }
  }
  const issues = validateCommentaryLedger(ledgerPath, prospectiveLedger);
  if (issues.length > 0) throw new Error(formatCommentaryLedgerValidationError(issues));
  return {
    dialogue,
    rewritePaths: normalizedPaths.map((entry) => entry.relativePath),
    ledgerPath,
    changedBlockIds,
    prospectiveLedger,
  };
}

export function importCommentaryRewriteBatch(options: {
  dialogue: string;
  rewritePaths: string[];
  apply?: boolean;
}): CommentaryRewriteBatchImportResult {
  if (!(options.apply ?? false)) {
    return { ...buildRewriteBatchImport(options.dialogue, options.rewritePaths), applied: false };
  }
  return withRepoWriteLock(commentaryApplyLockScope(options.dialogue, "commentary-rewrite-batch"), () => {
    const result = buildRewriteBatchImport(options.dialogue, options.rewritePaths);
    const absoluteLedgerPath = join(getRepoRoot(), result.ledgerPath);
    const currentLedger = readFileSync(absoluteLedgerPath, "utf8");
    atomicWrite(absoluteLedgerPath, result.prospectiveLedger);
    recordSubmission({
      lane: "commentary",
      kind: "rewrite-batch",
      scope: options.dialogue,
      sourcePath: result.rewritePaths[0]!,
      targetPath: result.ledgerPath,
      targetContentBefore: currentLedger,
      targetContentAfter: result.prospectiveLedger,
      appliedIds: result.changedBlockIds,
      submission: result.rewritePaths.map((path) => readJson(join(getRepoRoot(), path))),
      superseded: commentarySupersededBlocks(currentLedger, result.changedBlockIds),
    });
    return { ...result, applied: true };
  });
}

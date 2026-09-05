import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import {
  buildCommentaryAuditEvidenceSnapshot,
  buildCommentaryAuditBriefs,
  type CommentaryAuditBrief,
  type CommentaryAuditEvidenceSnapshot,
} from "./commentary-audit.js";
import {
  COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG,
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_CODEX_CLI_VERSION,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_MODEL_CATALOG_PATH,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "./commentary-authoring.js";
import {
  assertCommentaryStructuredOutputSchemaCompatible,
  readLunaAuthStatus,
  type CommentaryCampaignCommandResult,
  type CommentaryCampaignCommandRunner,
} from "./commentary-campaign.js";
import { parseCodexExecResult, type CommentaryCampaignTokenUsage } from "./commentary-campaign-telemetry.js";
import { listGreekDialogues } from "./derived/stephanus.js";
import { getRepoRoot } from "./paths.js";
import {
  assertCanonicalRepoFileParent,
  canonicalRepoFileForRead,
  canonicalRepoFileForWrite,
} from "./repo-artifact-path.js";
import { commentaryMarkdownBlocks } from "./wiki/commentary-ledger.js";
import { fieldValue } from "./wiki/observation-ledger.js";
import {
  buildCommentaryQualityAuditManifestPreview,
  containsHumanListeningOrReviewClaim,
  type CommentaryQualityAuditManifest,
  type CommentaryQualityAuditManifestUnit,
} from "./wiki/commentary-quality-audit.js";

const CAMPAIGN_ID = "plato-commentary-independent-luna-sample" as const;
const SCHEMA_VERSION = 1 as const;
const SAMPLE_SIZE = 15;
const MAX_CONCURRENCY = 4;
const EXPECTED_DIALOGUE_COUNT = 27;
const DIALOGUE = /^[a-z0-9-]+$/u;
const COMMENTARY_ID = /^comm_[a-z0-9-]+_\d{4}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const AUDIT_UNIT_MARKER = "# Commentary quality-audit unit:";

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

export type CommentaryAuditSampleBlockReview = {
  commentary_id: string;
  verdict: "pass" | "fail";
  rationale: string;
};

export type CommentaryAuditSampleReview = {
  schema_version: 1;
  dialogue: string;
  reviewer: {
    id: string;
    model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: (typeof COMMENTARY_STAGE_EFFORT)["audit"];
  };
  pending_manifest_sha256: string;
  sample_packet_sha256: string;
  sampled_commentary_ids: string[];
  sample_verdict: "pass" | "fail";
  blocks: CommentaryAuditSampleBlockReview[];
  rationale: string;
};

export type CommentaryAuditSampleJob = {
  schema_version: 1;
  job_id: string;
  dialogue: string;
  reviewer_id: string;
  pending_manifest_path: string;
  pending_manifest_sha256: string;
  pending_manifest_content: string;
  sampled_commentary_ids: string[];
  packet_path: string;
  packet_sha256: string;
  packet_content: string;
  output_schema_path: string;
  output_schema_sha256: string;
  output_schema: Record<string, unknown>;
  model_catalog_path: string;
  model_catalog_sha256: string;
  prompt_sha256: string;
  output_path: string;
  state_path: string;
  execution_path: string;
  input_sha256: string;
  command: { executable: string; args: string[] };
};

export type CommentaryAuditSampleBlockedDialogue = {
  dialogue: string;
  status: "blocked";
  detail: string;
  next_action: string;
};

export type CommentaryAuditSampleJobInspection = {
  dialogue: string;
  status: "pending" | "current_pass" | "current_fail" | "malformed";
  detail: string;
  job: CommentaryAuditSampleJob;
  review?: CommentaryAuditSampleReview;
};

export type CommentaryAuditSamplePlan = {
  schema_version: 1;
  campaign: typeof CAMPAIGN_ID;
  dry_run_default: true;
  max_concurrency: 4;
  sample_size: 15;
  dialogues: string[];
  blocked: CommentaryAuditSampleBlockedDialogue[];
  jobs: CommentaryAuditSampleJobInspection[];
};

export type CommentaryAuditSampleRunResult = {
  dialogue: string;
  status: "planned" | "generated_pass" | "generated_fail" | "resumed_pass" | "resumed_fail" | "deferred";
  output_path: string;
  acceptance_handoff: null | {
    reviewer: string;
    rationale: string;
    sampled_commentary_ids: string[];
    preview_argv: string[];
    apply_argv: string[];
  };
};

export type RunCommentaryAuditSampleOptions = {
  execute?: boolean;
  concurrency?: number;
  maxNewJobs?: number;
  codexExecutable?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  commandRunner?: CommentaryCampaignCommandRunner;
  currentJobResolver?: (job: CommentaryAuditSampleJob) => CommentaryAuditSampleJob;
};

export type CommentaryAuditSampleEvidenceResource = {
  path: string;
  sha256: string;
  content: string;
};

export type CommentaryAuditSampleEvidenceRecord = {
  schema_version: 1;
  campaign: typeof CAMPAIGN_ID;
  dialogue: string;
  job_id: string;
  reviewer_id: string;
  input_sha256: string;
  invocation: {
    executable: "codex";
    codex_cli_version: typeof COMMENTARY_CODEX_CLI_VERSION;
    model_argument: typeof COMMENTARY_MODEL_ARGUMENT;
    authoring_model: typeof COMMENTARY_AUTHORING_MODEL;
    effort: (typeof COMMENTARY_STAGE_EFFORT)["audit"];
    permission_mode: typeof COMMENTARY_PERMISSION_MODE;
    isolation_config: string[];
  };
  pending_manifest: CommentaryAuditSampleEvidenceResource;
  commentary_ledger: CommentaryAuditSampleEvidenceResource;
  sample_packet: CommentaryAuditSampleEvidenceResource;
  output_schema: CommentaryAuditSampleEvidenceResource;
  model_catalog: CommentaryAuditSampleEvidenceResource;
  prompt: { sha256: string; content: string };
  sample_output: CommentaryAuditSampleEvidenceResource;
  sample_state: CommentaryAuditSampleEvidenceResource;
  codex_execution: CommentaryAuditSampleEvidenceResource;
};

export type CommentaryAuditSampleEvidenceBundle = {
  path: string;
  sha256: string;
  content: string;
  record: CommentaryAuditSampleEvidenceRecord;
  review: CommentaryAuditSampleReview;
};

export type CommentaryAuditSampleRequiredVerdict = CommentaryAuditSampleReview["sample_verdict"];

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
}

function stableJson(value: unknown) {
  return JSON.stringify(stableValue(value));
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], path: string) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${path} must contain exactly: ${expected.join(", ")}`);
  }
}

function exactString(value: unknown, expected: string, path: string) {
  if (value !== expected) throw new Error(`${path} must be ${expected}`);
  return expected;
}

function rationale(value: unknown, path: string, maximumLength: number) {
  if (
    typeof value !== "string" || value.length === 0 || value.length > maximumLength ||
    value.trim() !== value || /[\r\n]/u.test(value)
  ) {
    throw new Error(`${path} must be one trimmed non-empty line of at most ${maximumLength} characters`);
  }
  return value;
}

function tokenUsage(value: unknown, path: string): CommentaryCampaignTokenUsage {
  const usage = record(value, path);
  const fields = [
    "input_tokens",
    "cached_input_tokens",
    "cache_write_input_tokens",
    "output_tokens",
    "reasoning_output_tokens",
  ] as const;
  exactKeys(usage, fields, path);
  const values = Object.fromEntries(fields.map((field) => {
    const count = usage[field];
    if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
      throw new Error(`${path}.${field} must be a nonnegative safe integer`);
    }
    return [field, count];
  })) as CommentaryCampaignTokenUsage;
  if (values.cached_input_tokens > values.input_tokens) {
    throw new Error(`${path}.cached_input_tokens exceeds input_tokens`);
  }
  return values;
}

function atomicWrite(relativePath: string, content: string) {
  const absolutePath = canonicalRepoFileForWrite(relativePath, "independent sample artifact");
  mkdirSync(dirname(absolutePath), { recursive: true });
  assertCanonicalRepoFileParent(relativePath, "independent sample artifact");
  if (existsSync(absolutePath)) {
    if (readFileSync(absolutePath, "utf8") !== content) {
      throw new Error(`Refusing to overwrite stale scratch artifact ${relativePath}`);
    }
    return;
  }
  const temporaryRelativePath = `${relativePath}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  const temporaryPath = canonicalRepoFileForWrite(
    temporaryRelativePath,
    "independent sample temporary artifact",
  );
  try {
    writeFileSync(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    canonicalRepoFileForRead(temporaryRelativePath, "independent sample temporary artifact");
    const currentTarget = canonicalRepoFileForWrite(relativePath, "independent sample artifact");
    assertCanonicalRepoFileParent(relativePath, "independent sample artifact");
    if (existsSync(currentTarget)) {
      throw new Error(`Refusing concurrently created scratch artifact ${relativePath}`);
    }
    renameSync(temporaryPath, currentTarget);
  } catch (error) {
    try {
      if (existsSync(temporaryPath)) {
        rmSync(canonicalRepoFileForRead(temporaryRelativePath, "independent sample temporary artifact"), { force: true });
      }
    } catch {
      // Refuse to follow an aliased cleanup path; leave it for explicit inspection.
    }
    throw error;
  }
}

function preserveFailedSampleExecution(input: {
  job: CommentaryAuditSampleJob;
  result: CommentaryCampaignCommandResult;
  error: unknown;
}) {
  const record = {
    schema_version: SCHEMA_VERSION,
    campaign: CAMPAIGN_ID,
    job_id: input.job.job_id,
    dialogue: input.job.dialogue,
    input_sha256: input.job.input_sha256,
    exit_code: input.result.exitCode,
    stdout: {
      sha256: sha256(input.result.stdout),
      content: input.result.stdout,
    },
    stderr: {
      sha256: sha256(input.result.stderr),
      content: input.result.stderr,
    },
    validation_error: input.error instanceof Error ? input.error.message : String(input.error),
  };
  const content = prettyJson(record);
  const digest = sha256(content);
  const path = `scratch/commentary/audit-sample-failures/${input.job.dialogue}/${digest}.json`;
  atomicWrite(path, content);
  return { path, sha256: digest };
}

function assertSafeJob(job: CommentaryAuditSampleJob) {
  if (!DIALOGUE.test(job.dialogue)) throw new Error(`Unsafe independent sample dialogue: ${job.dialogue}`);
  if (!SHA256.test(job.input_sha256)) throw new Error(`Unsafe independent sample input hash for ${job.dialogue}`);
  const identity = job.input_sha256.slice(0, 16);
  const expectedPaths = {
    pending_manifest_path: `scratch/commentary/audit-manifests/${job.dialogue}.json`,
    packet_path: `scratch/commentary/audit-sample-packets/${job.dialogue}/${identity}.md`,
    output_schema_path: `scratch/commentary/audit-sample-schemas/${job.dialogue}/${identity}.json`,
    output_path: `scratch/commentary/audit-sample-reviews/${job.dialogue}/${identity}.json`,
    state_path: `scratch/commentary/audit-sample-state/${job.dialogue}/${identity}.json`,
    execution_path: `scratch/commentary/audit-sample-executions/${job.dialogue}/${identity}.jsonl`,
  } as const;
  for (const [field, expected] of Object.entries(expectedPaths)) {
    if (job[field as keyof typeof expectedPaths] !== expected) {
      throw new Error(`Unsafe independent sample ${field} for ${job.dialogue}`);
    }
  }
  if (job.job_id !== `sample:${job.dialogue}:${identity}`) {
    throw new Error(`Unsafe independent sample job id for ${job.dialogue}`);
  }
  if (
    job.reviewer_id !==
      `commentary-audit-delegated-luna-reviewer-${job.dialogue}-${job.pending_manifest_sha256.slice(0, 12)}`
  ) {
    throw new Error(`Unsafe independent sample reviewer id for ${job.dialogue}`);
  }
  if (
    !SHA256.test(job.pending_manifest_sha256) || sha256(job.pending_manifest_content) !== job.pending_manifest_sha256 ||
    !SHA256.test(job.packet_sha256) || sha256(job.packet_content) !== job.packet_sha256 ||
    !SHA256.test(job.output_schema_sha256) || sha256(prettyJson(job.output_schema)) !== job.output_schema_sha256 ||
    job.model_catalog_path !== COMMENTARY_MODEL_CATALOG_PATH || !SHA256.test(job.model_catalog_sha256) ||
    sha256(readFileSync(canonicalRepoFileForRead(job.model_catalog_path, "independent sample model catalog"))) !==
      job.model_catalog_sha256 ||
    !SHA256.test(job.prompt_sha256)
  ) {
    throw new Error(`Unsafe or stale independent sample hash binding for ${job.dialogue}`);
  }
  const prompt = job.command.args.at(-1);
  if (typeof prompt !== "string" || sha256(prompt) !== job.prompt_sha256) {
    throw new Error(`Unsafe independent sample prompt binding for ${job.dialogue}`);
  }
  const expectedArgs = commentaryAuditSampleCodexArgs(
    prompt,
    job.output_schema_path,
    canonicalRepoFileForRead(COMMENTARY_MODEL_CATALOG_PATH, "Luna model catalog"),
  );
  if (JSON.stringify(job.command.args) !== JSON.stringify(expectedArgs)) {
    throw new Error(`Unsafe independent sample Codex invocation for ${job.dialogue}`);
  }
  if (typeof job.command.executable !== "string" || job.command.executable.trim().length === 0) {
    throw new Error(`Unsafe independent sample Codex executable for ${job.dialogue}`);
  }
}

function rebuildCurrentJob(job: CommentaryAuditSampleJob, options: RunCommentaryAuditSampleOptions) {
  const resolved = options.currentJobResolver ? options.currentJobResolver(job) : (() => {
    const auditEvidence = buildCommentaryAuditEvidenceSnapshot();
    return buildCommentaryAuditSampleJob({
      manifest: buildCommentaryQualityAuditManifestPreview(job.dialogue, { auditEvidence }),
      codexExecutable: job.command.executable,
      auditEvidence,
    });
  })();
  assertSafeJob(resolved);
  if (stableJson(resolved) !== stableJson(job)) {
    throw new Error(`Independent sample job ${job.job_id} became stale before provider execution`);
  }
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
      { cwd, env: env ?? process.env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
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

export function selectCommentaryAuditSampleIds(activeIds: readonly string[]) {
  if (activeIds.length === 0) throw new Error("Independent commentary sample requires at least one active accepted block");
  if (new Set(activeIds).size !== activeIds.length) throw new Error("Active commentary ids must be unique");
  if (activeIds.some((id) => !COMMENTARY_ID.test(id))) throw new Error("Active commentary ids are malformed");
  if (activeIds.length <= SAMPLE_SIZE) return [...activeIds];
  return Array.from({ length: SAMPLE_SIZE }, (_, index) =>
    activeIds[Math.floor(index * (activeIds.length - 1) / (SAMPLE_SIZE - 1))]!
  );
}

function activeLedgerIds(manifest: CommentaryQualityAuditManifest) {
  const content = readFileSync(canonicalRepoFileForRead(manifest.ledger.path, "commentary ledger"), "utf8");
  const ids = commentaryMarkdownBlocks(content).flatMap((block) => {
    if (fieldValue(block.content, "review_status") !== "accepted") return [];
    const id = fieldValue(block.content, "commentary_id");
    return id ? [id] : [];
  });
  const embeddedIds = manifest.units.flatMap((unit) => unit.output.blocks.map((block) => block.commentary_id));
  if (
    ids.length !== embeddedIds.length || new Set(ids).size !== ids.length ||
    ids.some((id) => !embeddedIds.includes(id))
  ) {
    throw new Error(`Pending manifest ${manifest.dialogue} does not exactly cover active ledger ids`);
  }
  return ids;
}

function splitAuditBrief(brief: CommentaryAuditBrief) {
  const markerIndex = brief.content.indexOf(`\n${AUDIT_UNIT_MARKER}`);
  if (markerIndex < 0) throw new Error(`Audit brief ${brief.path} is missing its unit marker`);
  return {
    contract: `${brief.content.slice(0, markerIndex).trimEnd()}\n`,
    unit: `${brief.content.slice(markerIndex + 1).trimEnd()}\n`,
  };
}

export function selectCommentaryAuditSampleUnits(
  manifest: CommentaryQualityAuditManifest,
  sampledIds: readonly string[],
) {
  const selected = new Set(sampledIds);
  if (selected.size !== sampledIds.length) {
    throw new Error(`Sampled ids for ${manifest.dialogue} must be unique`);
  }
  const units = manifest.units.filter((unit) => unit.output.blocks.some((block) => selected.has(block.commentary_id)));
  const covered = units.flatMap((unit) => unit.output.blocks.map((block) => block.commentary_id)).filter((id) => selected.has(id));
  const coveredSet = new Set(covered);
  if (
    covered.length !== sampledIds.length || coveredSet.size !== covered.length ||
    sampledIds.some((id) => !coveredSet.has(id))
  ) {
    throw new Error(`Sampled ids for ${manifest.dialogue} must have exact unique manifest-unit coverage`);
  }
  return units;
}

function buildSamplePacket(
  manifest: CommentaryQualityAuditManifest,
  manifestSha256: string,
  sampledIds: readonly string[],
  units: readonly CommentaryQualityAuditManifestUnit[],
  evidence?: CommentaryAuditEvidenceSnapshot,
) {
  const unitKeys = new Set(units.map((unit) => unit.unit_key));
  const briefs = buildCommentaryAuditBriefs(manifest.dialogue, evidence, unitKeys);
  const briefsByUnit = new Map(briefs.map((brief) => [brief.unitKey, brief]));
  let sharedContract: string | undefined;
  const unitPackets = units.map((unit) => {
    const brief = briefsByUnit.get(unit.unit_key);
    if (!brief) throw new Error(`Missing deterministic audit brief for ${manifest.dialogue}/${unit.unit_key}`);
    if (brief.sha256 !== unit.audit_brief_sha256) {
      throw new Error(`Audit brief hash drift for ${manifest.dialogue}/${unit.unit_key}`);
    }
    const split = splitAuditBrief(brief);
    if (sharedContract === undefined) sharedContract = split.contract;
    else if (sharedContract !== split.contract) {
      throw new Error(`Quality contract differs across sampled units for ${manifest.dialogue}`);
    }
    const outputContent = prettyJson(unit.output);
    if (sha256(outputContent) !== unit.output_sha256) {
      throw new Error(`Embedded audit output hash drift for ${manifest.dialogue}/${unit.unit_key}`);
    }
    return [
      `<<<FULL_UNIT_SOURCE_EVIDENCE_PACKET path=${brief.path} sha256=${brief.sha256}>>>`,
      split.unit.trimEnd(),
      `<<<END_FULL_UNIT_SOURCE_EVIDENCE_PACKET path=${brief.path}>>>`,
      "",
      `<<<CURRENT_ALL_PASS_AUDIT_OUTPUT path=${unit.output_path} sha256=${unit.output_sha256}>>>`,
      outputContent.trimEnd(),
      `<<<END_CURRENT_ALL_PASS_AUDIT_OUTPUT path=${unit.output_path}>>>`,
    ].join("\n");
  });
  if (!sharedContract) throw new Error(`No sampled audit units for ${manifest.dialogue}`);
  return [
    "COMMENTARY_QUALITY_AUDIT_INDEPENDENT_SAMPLE_INPUT_V1",
    `dialogue: ${manifest.dialogue}`,
    `pending_manifest_path: scratch/commentary/audit-manifests/${manifest.dialogue}.json`,
    `pending_manifest_sha256: ${manifestSha256}`,
    `ledger_path: ${manifest.ledger.path}`,
    `ledger_sha256: ${manifest.ledger.sha256}`,
    `protocol_path: ${manifest.protocol.path}`,
    `protocol_sha256: ${manifest.protocol.sha256}`,
    "sampled_commentary_ids:",
    ...sampledIds.map((id) => `- ${id}`),
    "",
    "The quality contract below is exact and shared by every selected unit. Each selected unit then appears with its complete source, playback, commentary, and accepted-evidence packet plus the current all-pass audit output.",
    "",
    "<<<FULL_SHARED_QUALITY_CONTRACT>>>",
    sharedContract.trimEnd(),
    "<<<END_FULL_SHARED_QUALITY_CONTRACT>>>",
    "",
    ...unitPackets.flatMap((packet) => [packet, ""]),
  ].join("\n");
}

function sampleOutputSchema(job: {
  dialogue: string;
  reviewerId: string;
  manifestSha256: string;
  packetSha256: string;
  sampledIds: readonly string[];
}) {
  const blockSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      commentary_id: { type: "string", enum: [...job.sampledIds] },
      verdict: { type: "string", enum: ["pass", "fail"] },
      rationale: { type: "string", minLength: 1, maxLength: 300 },
    },
    required: ["commentary_id", "verdict", "rationale"],
  } as const;
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      schema_version: { type: "integer", const: SCHEMA_VERSION },
      dialogue: { type: "string", const: job.dialogue },
      reviewer: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", const: job.reviewerId },
          model: { type: "string", const: COMMENTARY_AUTHORING_MODEL },
          effort: { type: "string", const: COMMENTARY_STAGE_EFFORT.audit },
        },
        required: ["id", "model", "effort"],
      },
      pending_manifest_sha256: { type: "string", const: job.manifestSha256 },
      sample_packet_sha256: { type: "string", const: job.packetSha256 },
      sampled_commentary_ids: {
        type: "array",
        items: { type: "string", enum: [...job.sampledIds] },
        minItems: job.sampledIds.length,
        maxItems: job.sampledIds.length,
      },
      sample_verdict: { type: "string", enum: ["pass", "fail"] },
      blocks: {
        type: "array",
        items: blockSchema,
        minItems: job.sampledIds.length,
        maxItems: job.sampledIds.length,
      },
      rationale: { type: "string", minLength: 1, maxLength: 300 },
    },
    required: [
      "schema_version",
      "dialogue",
      "reviewer",
      "pending_manifest_sha256",
      "sample_packet_sha256",
      "sampled_commentary_ids",
      "sample_verdict",
      "blocks",
      "rationale",
    ],
  } as Record<string, unknown>;
}

function samplePrompt(job: {
  dialogue: string;
  reviewerId: string;
  manifestSha256: string;
  packetSha256: string;
  sampledIds: readonly string[];
}) {
  return [
    `You are one fresh, isolated, independent ${COMMENTARY_AUTHORING_MODEL} medium-effort final commentary audit sampler for Plato's ${job.dialogue}.`,
    "Do not edit files or call tools. Return only the structured JSON required by the supplied schema.",
    "The complete hash-bound sample packet is supplied on stdin. Judge only from that packet.",
    "",
    "Contract:",
    `- Copy reviewer.id exactly as ${job.reviewerId}, model as ${COMMENTARY_AUTHORING_MODEL}, and effort as medium.`,
    `- Copy pending_manifest_sha256 exactly as ${job.manifestSha256} and sample_packet_sha256 exactly as ${job.packetSha256}.`,
    `- Review exactly these sampled commentary ids once each and in this order: ${job.sampledIds.join(", ")}.`,
    "- Independently verify each sampled block against the complete quality contract, exact source, playback edge, commentary prose, accepted evidence, and current audit output in the packet.",
    "- Pass a block only when the current all-pass audit judgment is independently supported in evidence, placement, and spoken-audio quality. Otherwise fail it and state the concrete defect.",
    "- Set sample_verdict to pass exactly when every sampled block passes; otherwise set it to fail.",
    "- Give every block one concrete, single-line rationale. Give the overall sample one concrete, single-line rationale of at most 300 characters.",
    "- No block or overall rationale may claim a human, person, listening, hearing, or audition review. This is an isolated Luna review only.",
    "- This result is scratch evidence only. Do not claim to accept a canonical manifest, write a review note, or change any canonical status.",
  ].join("\n");
}

export function commentaryAuditSampleCodexArgs(prompt: string, schemaPath: string, modelCatalogPath: string) {
  return [
    "exec",
    "--model",
    COMMENTARY_MODEL_ARGUMENT,
    "-c",
    `model_reasoning_effort=${COMMENTARY_STAGE_EFFORT.audit}`,
    "--sandbox",
    COMMENTARY_PERMISSION_MODE,
    "--ephemeral",
    "--json",
    "--output-schema",
    schemaPath,
    "-c",
    `model_catalog_json=${JSON.stringify(modelCatalogPath)}`,
    ...COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG.flatMap((entry) => ["-c", entry]),
    "--ignore-user-config",
    "--ignore-rules",
    "--strict-config",
    prompt,
  ];
}

export function buildCommentaryAuditSampleJob(options: {
  manifest: CommentaryQualityAuditManifest;
  pendingManifestContent?: string;
  codexExecutable?: string;
  auditEvidence?: CommentaryAuditEvidenceSnapshot;
}): CommentaryAuditSampleJob {
  const manifest = options.manifest;
  if (!DIALOGUE.test(manifest.dialogue)) throw new Error(`Invalid dialogue slug: ${manifest.dialogue}`);
  if (manifest.acceptance.decision !== "pending") throw new Error(`${manifest.dialogue} sample requires a pending manifest`);
  const pendingManifestContent = options.pendingManifestContent ?? prettyJson(manifest);
  if (pendingManifestContent !== prettyJson(manifest)) {
    throw new Error(`${manifest.dialogue} pending manifest content is not canonical JSON`);
  }
  const manifestSha256 = sha256(pendingManifestContent);
  const activeIds = activeLedgerIds(manifest);
  const sampledIds = selectCommentaryAuditSampleIds(activeIds);
  const units = selectCommentaryAuditSampleUnits(manifest, sampledIds);
  const packetContent = buildSamplePacket(manifest, manifestSha256, sampledIds, units, options.auditEvidence);
  const packetSha256 = sha256(packetContent);
  const reviewerId = `commentary-audit-delegated-luna-reviewer-${manifest.dialogue}-${manifestSha256.slice(0, 12)}`;
  const outputSchema = sampleOutputSchema({
    dialogue: manifest.dialogue,
    reviewerId,
    manifestSha256,
    packetSha256,
    sampledIds,
  });
  assertCommentaryStructuredOutputSchemaCompatible(outputSchema, `${manifest.dialogue} sample output schema`);
  const outputSchemaSha256 = sha256(prettyJson(outputSchema));
  const modelCatalogPath = canonicalRepoFileForRead(COMMENTARY_MODEL_CATALOG_PATH, "Luna model catalog");
  const modelCatalogSha256 = sha256(readFileSync(modelCatalogPath));
  const prompt = samplePrompt({
    dialogue: manifest.dialogue,
    reviewerId,
    manifestSha256,
    packetSha256,
    sampledIds,
  });
  const promptSha256 = sha256(prompt);
  const inputSha256 = sha256(stableJson({
    schema_version: SCHEMA_VERSION,
    dialogue: manifest.dialogue,
    reviewer_id: reviewerId,
    pending_manifest_sha256: manifestSha256,
    sample_packet_sha256: packetSha256,
    sampled_commentary_ids: sampledIds,
    output_schema_sha256: outputSchemaSha256,
    prompt_sha256: promptSha256,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: modelCatalogSha256,
    model: COMMENTARY_MODEL_ARGUMENT,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    isolation_config: COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG,
  }));
  const identity = inputSha256.slice(0, 16);
  const pendingManifestPath = `scratch/commentary/audit-manifests/${manifest.dialogue}.json`;
  const packetPath = `scratch/commentary/audit-sample-packets/${manifest.dialogue}/${identity}.md`;
  const outputSchemaPath = `scratch/commentary/audit-sample-schemas/${manifest.dialogue}/${identity}.json`;
  const outputPath = `scratch/commentary/audit-sample-reviews/${manifest.dialogue}/${identity}.json`;
  const statePath = `scratch/commentary/audit-sample-state/${manifest.dialogue}/${identity}.json`;
  const executionPath = `scratch/commentary/audit-sample-executions/${manifest.dialogue}/${identity}.jsonl`;
  return {
    schema_version: SCHEMA_VERSION,
    job_id: `sample:${manifest.dialogue}:${identity}`,
    dialogue: manifest.dialogue,
    reviewer_id: reviewerId,
    pending_manifest_path: pendingManifestPath,
    pending_manifest_sha256: manifestSha256,
    pending_manifest_content: pendingManifestContent,
    sampled_commentary_ids: sampledIds,
    packet_path: packetPath,
    packet_sha256: packetSha256,
    packet_content: packetContent,
    output_schema_path: outputSchemaPath,
    output_schema_sha256: outputSchemaSha256,
    output_schema: outputSchema,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: modelCatalogSha256,
    prompt_sha256: promptSha256,
    output_path: outputPath,
    state_path: statePath,
    execution_path: executionPath,
    input_sha256: inputSha256,
    command: {
      executable: options.codexExecutable ?? "codex",
      args: commentaryAuditSampleCodexArgs(prompt, outputSchemaPath, modelCatalogPath),
    },
  };
}

export function parseCommentaryAuditSampleReview(
  value: unknown,
  job: CommentaryAuditSampleJob,
): CommentaryAuditSampleReview {
  const root = record(value, "sample review");
  exactKeys(root, [
    "schema_version",
    "dialogue",
    "reviewer",
    "pending_manifest_sha256",
    "sample_packet_sha256",
    "sampled_commentary_ids",
    "sample_verdict",
    "blocks",
    "rationale",
  ], "sample review");
  if (root.schema_version !== SCHEMA_VERSION) throw new Error("sample review.schema_version must be 1");
  exactString(root.dialogue, job.dialogue, "sample review.dialogue");
  exactString(root.pending_manifest_sha256, job.pending_manifest_sha256, "sample review.pending_manifest_sha256");
  exactString(root.sample_packet_sha256, job.packet_sha256, "sample review.sample_packet_sha256");
  const reviewer = record(root.reviewer, "sample review.reviewer");
  exactKeys(reviewer, ["id", "model", "effort"], "sample review.reviewer");
  exactString(reviewer.id, job.reviewer_id, "sample review.reviewer.id");
  exactString(reviewer.model, COMMENTARY_AUTHORING_MODEL, "sample review.reviewer.model");
  exactString(reviewer.effort, COMMENTARY_STAGE_EFFORT.audit, "sample review.reviewer.effort");
  if (!Array.isArray(root.sampled_commentary_ids)) throw new Error("sample review.sampled_commentary_ids must be an array");
  const sampledIds = root.sampled_commentary_ids.map((id, index) =>
    exactString(id, job.sampled_commentary_ids[index] ?? "", `sample review.sampled_commentary_ids[${index}]`)
  );
  if (sampledIds.length !== job.sampled_commentary_ids.length) {
    throw new Error("sample review.sampled_commentary_ids must preserve the exact sample order");
  }
  if (root.sample_verdict !== "pass" && root.sample_verdict !== "fail") {
    throw new Error("sample review.sample_verdict must be pass or fail");
  }
  if (!Array.isArray(root.blocks) || root.blocks.length !== sampledIds.length) {
    throw new Error("sample review.blocks must cover every sampled id exactly once");
  }
  const blocks = root.blocks.map((entry, index) => {
    const block = record(entry, `sample review.blocks[${index}]`);
    exactKeys(block, ["commentary_id", "verdict", "rationale"], `sample review.blocks[${index}]`);
    const commentaryId = exactString(
      block.commentary_id,
      sampledIds[index]!,
      `sample review.blocks[${index}].commentary_id`,
    );
    if (block.verdict !== "pass" && block.verdict !== "fail") {
      throw new Error(`sample review.blocks[${index}].verdict must be pass or fail`);
    }
    const verdict: "pass" | "fail" = block.verdict;
    const blockRationale = rationale(block.rationale, `sample review.blocks[${index}].rationale`, 300);
    if (containsHumanListeningOrReviewClaim(blockRationale)) {
      throw new Error(`sample review.blocks[${index}].rationale must not claim human listening or review`);
    }
    return {
      commentary_id: commentaryId,
      verdict,
      rationale: blockRationale,
    };
  });
  const allPass = blocks.every((block) => block.verdict === "pass");
  if ((root.sample_verdict === "pass") !== allPass) {
    throw new Error("sample review.sample_verdict must pass exactly when every sampled block passes");
  }
  const overallRationale = rationale(root.rationale, "sample review.rationale", 300);
  if (containsHumanListeningOrReviewClaim(overallRationale)) {
    throw new Error("sample review.rationale must not claim human listening or review");
  }
  return {
    schema_version: SCHEMA_VERSION,
    dialogue: job.dialogue,
    reviewer: {
      id: job.reviewer_id,
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    pending_manifest_sha256: job.pending_manifest_sha256,
    sample_packet_sha256: job.packet_sha256,
    sampled_commentary_ids: sampledIds,
    sample_verdict: root.sample_verdict,
    blocks,
    rationale: overallRationale,
  };
}

function expectedState(
  job: CommentaryAuditSampleJob,
  review: CommentaryAuditSampleReview,
  outputSha256: string,
  executionSha256: string,
  usage: CommentaryCampaignTokenUsage,
) {
  return {
    schema_version: SCHEMA_VERSION,
    campaign: CAMPAIGN_ID,
    job_id: job.job_id,
    dialogue: job.dialogue,
    reviewer_id: job.reviewer_id,
    input_sha256: job.input_sha256,
    pending_manifest_sha256: job.pending_manifest_sha256,
    pending_manifest_path: job.pending_manifest_path,
    sample_packet_path: job.packet_path,
    sample_packet_sha256: job.packet_sha256,
    output_schema_path: job.output_schema_path,
    output_schema_sha256: job.output_schema_sha256,
    model_catalog_path: job.model_catalog_path,
    model_catalog_sha256: job.model_catalog_sha256,
    prompt_sha256: job.prompt_sha256,
    model: COMMENTARY_AUTHORING_MODEL,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    output_path: job.output_path,
    output_sha256: outputSha256,
    execution_path: job.execution_path,
    execution_sha256: executionSha256,
    sample_verdict: review.sample_verdict,
    usage,
  };
}

function inspectJob(job: CommentaryAuditSampleJob): CommentaryAuditSampleJobInspection {
  const outputAbsolutePath = canonicalRepoFileForWrite(job.output_path, "independent sample output");
  const stateAbsolutePath = canonicalRepoFileForWrite(job.state_path, "independent sample state");
  const executionAbsolutePath = canonicalRepoFileForWrite(job.execution_path, "independent sample execution");
  const outputExists = existsSync(outputAbsolutePath);
  const stateExists = existsSync(stateAbsolutePath);
  const executionExists = existsSync(executionAbsolutePath);
  if (!outputExists && !stateExists && !executionExists) {
    return { dialogue: job.dialogue, status: "pending", detail: "fresh independent Luna sample required", job };
  }
  if (!outputExists || !stateExists || !executionExists) {
    return {
      dialogue: job.dialogue,
      status: "malformed",
      detail: "sample output, state, and raw Codex execution must either all exist or all be absent",
      job,
    };
  }
  try {
    const exactResources = [
      [job.pending_manifest_path, job.pending_manifest_content, job.pending_manifest_sha256],
      [job.packet_path, job.packet_content, job.packet_sha256],
      [job.output_schema_path, prettyJson(job.output_schema), job.output_schema_sha256],
    ] as const;
    for (const [path, expectedContent, expectedSha256] of exactResources) {
      const absolutePath = canonicalRepoFileForRead(path, "hash-bound independent sample resource");
      const content = readFileSync(absolutePath, "utf8");
      if (content !== expectedContent || sha256(content) !== expectedSha256) {
        throw new Error(`stale hash-bound sample resource ${path}`);
      }
    }
    const outputContent = readFileSync(canonicalRepoFileForRead(job.output_path, "independent sample output"), "utf8");
    const review = parseCommentaryAuditSampleReview(JSON.parse(outputContent) as unknown, job);
    if (outputContent !== prettyJson(review)) throw new Error("sample output is not normalized JSON");
    const executionContent = readFileSync(
      canonicalRepoFileForRead(job.execution_path, "independent sample raw Codex execution"),
      "utf8",
    );
    const execution = parseCodexExecResult(executionContent, `Codex sample job ${job.job_id}`);
    const executionReview = parseCommentaryAuditSampleReview(execution.structured_output, job);
    if (prettyJson(executionReview) !== outputContent) {
      throw new Error("sample output does not match the raw Codex execution result");
    }
    const state = record(
      JSON.parse(readFileSync(canonicalRepoFileForRead(job.state_path, "independent sample state"), "utf8")) as unknown,
      "sample state",
    );
    const usage = tokenUsage(state.usage, "sample state.usage");
    if (stableJson(usage) !== stableJson(execution.usage)) {
      throw new Error("sample state usage does not match the raw Codex execution result");
    }
    const expected = expectedState(job, review, sha256(outputContent), sha256(executionContent), usage);
    if (prettyJson(state) !== prettyJson(expected)) throw new Error("sample state bindings are stale or malformed");
    return {
      dialogue: job.dialogue,
      status: review.sample_verdict === "pass" ? "current_pass" : "current_fail",
      detail: review.sample_verdict === "pass" ? "current independent sample passed" : "current independent sample found a defect",
      job,
      review,
    };
  } catch (error) {
    return {
      dialogue: job.dialogue,
      status: "malformed",
      detail: error instanceof Error ? error.message : String(error),
      job,
    };
  }
}

function evidenceResource(path: string, expectedSha256: string): CommentaryAuditSampleEvidenceResource {
  const content = readFileSync(canonicalRepoFileForRead(path, "independent sample evidence resource"), "utf8");
  const digest = sha256(content);
  if (digest !== expectedSha256) throw new Error(`Stale independent sample evidence resource ${path}`);
  return { path, sha256: digest, content };
}

export function buildCommentaryAuditSampleEvidenceBundle(input: {
  dialogue: string;
  sampleOutputPath: string;
  /** Acceptance remains the default; rejection callers must explicitly require failure. */
  requiredVerdict?: CommentaryAuditSampleRequiredVerdict;
}): CommentaryAuditSampleEvidenceBundle {
  const requiredVerdict = input.requiredVerdict ?? "pass";
  const auditEvidence = buildCommentaryAuditEvidenceSnapshot();
  const manifest = buildCommentaryQualityAuditManifestPreview(input.dialogue, { auditEvidence });
  const pendingManifestContent = prettyJson(manifest);
  const job = buildCommentaryAuditSampleJob({ manifest, pendingManifestContent, auditEvidence });
  assertSafeJob(job);
  if (job.command.executable !== "codex") {
    throw new Error("Canonical independent sample evidence requires the codex executable");
  }
  if (input.sampleOutputPath !== job.output_path) {
    throw new Error(`Current independent sample output must be ${job.output_path}`);
  }
  const inspection = inspectJob(job);
  const expectedStatus = requiredVerdict === "pass" ? "current_pass" : "current_fail";
  if (inspection.status !== expectedStatus || !inspection.review) {
    throw new Error(
      `Independent sample evidence for ${input.dialogue} must be a current ${requiredVerdict} result: ${inspection.detail}`,
    );
  }
  const prompt = job.command.args.at(-1);
  if (typeof prompt !== "string" || sha256(prompt) !== job.prompt_sha256) {
    throw new Error(`Independent sample prompt binding is stale for ${input.dialogue}`);
  }
  const outputContent = readFileSync(canonicalRepoFileForRead(job.output_path, "independent sample output"), "utf8");
  const stateContent = readFileSync(canonicalRepoFileForRead(job.state_path, "independent sample state"), "utf8");
  const executionContent = readFileSync(
    canonicalRepoFileForRead(job.execution_path, "independent sample raw Codex execution"),
    "utf8",
  );
  const record: CommentaryAuditSampleEvidenceRecord = {
    schema_version: SCHEMA_VERSION,
    campaign: CAMPAIGN_ID,
    dialogue: input.dialogue,
    job_id: job.job_id,
    reviewer_id: job.reviewer_id,
    input_sha256: job.input_sha256,
    invocation: {
      executable: "codex",
      codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
      model_argument: COMMENTARY_MODEL_ARGUMENT,
      authoring_model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
      permission_mode: COMMENTARY_PERMISSION_MODE,
      isolation_config: [...COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG],
    },
    pending_manifest: evidenceResource(job.pending_manifest_path, job.pending_manifest_sha256),
    commentary_ledger: evidenceResource(manifest.ledger.path, manifest.ledger.sha256),
    sample_packet: evidenceResource(job.packet_path, job.packet_sha256),
    output_schema: evidenceResource(job.output_schema_path, job.output_schema_sha256),
    model_catalog: evidenceResource(job.model_catalog_path, job.model_catalog_sha256),
    prompt: { sha256: job.prompt_sha256, content: prompt },
    sample_output: { path: job.output_path, sha256: sha256(outputContent), content: outputContent },
    sample_state: { path: job.state_path, sha256: sha256(stateContent), content: stateContent },
    codex_execution: { path: job.execution_path, sha256: sha256(executionContent), content: executionContent },
  };
  const content = prettyJson(record);
  const digest = sha256(content);
  assertCommentaryAuditSampleEvidenceReplay({
    evidence: record,
    pendingManifestContent,
    activeCommentaryIds: activeLedgerIds(manifest),
    requiredVerdict,
  });
  return {
    path: `wiki/submissions/commentary-audit-sample/${input.dialogue}/${digest}.json`,
    sha256: digest,
    content,
    record,
    review: inspection.review,
  };
}

function historicalReplayJob(
  evidence: CommentaryAuditSampleEvidenceRecord,
  manifest: CommentaryQualityAuditManifest,
  activeIds: readonly string[],
) {
  const pendingManifestContent = evidence.pending_manifest.content;
  const manifestSha256 = sha256(pendingManifestContent);
  const sampledIds = selectCommentaryAuditSampleIds(activeIds);
  const reviewerId = `commentary-audit-delegated-luna-reviewer-${manifest.dialogue}-${manifestSha256.slice(0, 12)}`;
  const packetSha256 = evidence.sample_packet.sha256;
  const outputSchema = sampleOutputSchema({
    dialogue: manifest.dialogue,
    reviewerId,
    manifestSha256,
    packetSha256,
    sampledIds,
  });
  assertCommentaryStructuredOutputSchemaCompatible(outputSchema, `${manifest.dialogue} historical sample output schema`);
  const outputSchemaSha256 = sha256(prettyJson(outputSchema));
  const prompt = samplePrompt({
    dialogue: manifest.dialogue,
    reviewerId,
    manifestSha256,
    packetSha256,
    sampledIds,
  });
  const promptSha256 = sha256(prompt);
  const inputSha256 = sha256(stableJson({
    schema_version: SCHEMA_VERSION,
    dialogue: manifest.dialogue,
    reviewer_id: reviewerId,
    pending_manifest_sha256: manifestSha256,
    sample_packet_sha256: packetSha256,
    sampled_commentary_ids: sampledIds,
    output_schema_sha256: outputSchemaSha256,
    prompt_sha256: promptSha256,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: evidence.model_catalog.sha256,
    model: COMMENTARY_MODEL_ARGUMENT,
    effort: COMMENTARY_STAGE_EFFORT.audit,
    permission_mode: COMMENTARY_PERMISSION_MODE,
    codex_cli_version: COMMENTARY_CODEX_CLI_VERSION,
    isolation_config: COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG,
  }));
  const identity = inputSha256.slice(0, 16);
  const outputSchemaPath = `scratch/commentary/audit-sample-schemas/${manifest.dialogue}/${identity}.json`;
  return {
    schema_version: SCHEMA_VERSION,
    job_id: `sample:${manifest.dialogue}:${identity}`,
    dialogue: manifest.dialogue,
    reviewer_id: reviewerId,
    pending_manifest_path: `scratch/commentary/audit-manifests/${manifest.dialogue}.json`,
    pending_manifest_sha256: manifestSha256,
    pending_manifest_content: pendingManifestContent,
    sampled_commentary_ids: sampledIds,
    packet_path: `scratch/commentary/audit-sample-packets/${manifest.dialogue}/${identity}.md`,
    packet_sha256: packetSha256,
    packet_content: evidence.sample_packet.content,
    output_schema_path: outputSchemaPath,
    output_schema_sha256: outputSchemaSha256,
    output_schema: outputSchema,
    model_catalog_path: COMMENTARY_MODEL_CATALOG_PATH,
    model_catalog_sha256: evidence.model_catalog.sha256,
    prompt_sha256: promptSha256,
    output_path: `scratch/commentary/audit-sample-reviews/${manifest.dialogue}/${identity}.json`,
    state_path: `scratch/commentary/audit-sample-state/${manifest.dialogue}/${identity}.json`,
    execution_path: `scratch/commentary/audit-sample-executions/${manifest.dialogue}/${identity}.jsonl`,
    input_sha256: inputSha256,
    command: {
      executable: "codex",
      args: commentaryAuditSampleCodexArgs(
        prompt,
        outputSchemaPath,
        canonicalRepoFileForRead(COMMENTARY_MODEL_CATALOG_PATH, "Luna model catalog"),
      ),
    },
  } satisfies CommentaryAuditSampleJob;
}

/** Replay every durable sample claim without trusting copied hashes or runner state. */
export function assertCommentaryAuditSampleEvidenceReplay(input: {
  evidence: CommentaryAuditSampleEvidenceRecord;
  pendingManifestContent: string;
  activeCommentaryIds: string[];
  historical?: boolean;
  /** Acceptance remains the default; rejection callers must explicitly require failure. */
  requiredVerdict?: CommentaryAuditSampleRequiredVerdict;
}) {
  const requiredVerdict = input.requiredVerdict ?? "pass";
  const evidence = record(input.evidence as unknown, "independent sample durable evidence");
  exactKeys(evidence, [
    "schema_version",
    "campaign",
    "dialogue",
    "job_id",
    "reviewer_id",
    "input_sha256",
    "invocation",
    "pending_manifest",
    "commentary_ledger",
    "sample_packet",
    "output_schema",
    "model_catalog",
    "prompt",
    "sample_output",
    "sample_state",
    "codex_execution",
  ], "independent sample durable evidence");
  if (evidence.schema_version !== SCHEMA_VERSION || evidence.campaign !== CAMPAIGN_ID) {
    throw new Error("Independent sample durable evidence has invalid schema or campaign identity");
  }
  const invocation = record(evidence.invocation, "independent sample durable invocation");
  exactKeys(invocation, [
    "executable",
    "codex_cli_version",
    "model_argument",
    "authoring_model",
    "effort",
    "permission_mode",
    "isolation_config",
  ], "independent sample durable invocation");
  if (
    invocation.executable !== "codex" || invocation.codex_cli_version !== COMMENTARY_CODEX_CLI_VERSION ||
    invocation.model_argument !== COMMENTARY_MODEL_ARGUMENT || invocation.authoring_model !== COMMENTARY_AUTHORING_MODEL ||
    invocation.effort !== COMMENTARY_STAGE_EFFORT.audit || invocation.permission_mode !== COMMENTARY_PERMISSION_MODE ||
    !Array.isArray(invocation.isolation_config) ||
    invocation.isolation_config.length !== COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG.length ||
    invocation.isolation_config.some((entry, index) => entry !== COMMENTARY_AUDIT_SAMPLE_ISOLATION_CONFIG[index])
  ) {
    throw new Error("Independent sample durable invocation does not replay exactly");
  }
  for (const [name, resource] of [
    ["pending_manifest", evidence.pending_manifest],
    ["commentary_ledger", evidence.commentary_ledger],
    ["sample_packet", evidence.sample_packet],
    ["output_schema", evidence.output_schema],
    ["model_catalog", evidence.model_catalog],
    ["sample_output", evidence.sample_output],
    ["sample_state", evidence.sample_state],
    ["codex_execution", evidence.codex_execution],
  ] as const) {
    const binding = record(resource, `independent sample durable ${name}`);
    exactKeys(binding, ["path", "sha256", "content"], `independent sample durable ${name}`);
    if (
      typeof binding.path !== "string" || typeof binding.sha256 !== "string" || !SHA256.test(binding.sha256) ||
      typeof binding.content !== "string" || sha256(binding.content) !== binding.sha256
    ) {
      throw new Error(`Independent sample durable ${name} binding is malformed or hash-mismatched`);
    }
  }
  const durablePrompt = record(evidence.prompt, "independent sample durable prompt");
  exactKeys(durablePrompt, ["sha256", "content"], "independent sample durable prompt");
  if (
    typeof durablePrompt.sha256 !== "string" || !SHA256.test(durablePrompt.sha256) ||
    typeof durablePrompt.content !== "string" || sha256(durablePrompt.content) !== durablePrompt.sha256
  ) {
    throw new Error("Independent sample durable prompt binding is malformed or hash-mismatched");
  }
  let manifest: CommentaryQualityAuditManifest;
  try {
    manifest = JSON.parse(input.pendingManifestContent) as CommentaryQualityAuditManifest;
  } catch (error) {
    throw new Error(`Independent sample pending manifest is malformed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (
    manifest.schema_version !== 1 || manifest.dialogue !== input.evidence.dialogue ||
    manifest.acceptance.decision !== "pending" || prettyJson(manifest) !== input.pendingManifestContent
  ) {
    throw new Error("Independent sample pending manifest is not the exact canonical pending manifest");
  }
  const expectedJob = input.historical
    ? historicalReplayJob(input.evidence, manifest, input.activeCommentaryIds)
    : buildCommentaryAuditSampleJob({ manifest, pendingManifestContent: input.pendingManifestContent });
  assertSafeJob(expectedJob);
  if (
    expectedJob.job_id !== input.evidence.job_id || expectedJob.reviewer_id !== input.evidence.reviewer_id ||
    expectedJob.input_sha256 !== input.evidence.input_sha256
  ) {
    throw new Error("Independent sample durable job identity is stale or forged");
  }
  const exactResources = [
    [input.evidence.pending_manifest, expectedJob.pending_manifest_path, expectedJob.pending_manifest_sha256, expectedJob.pending_manifest_content],
    [input.evidence.commentary_ledger, manifest.ledger.path, manifest.ledger.sha256, input.evidence.commentary_ledger.content],
    [input.evidence.sample_packet, expectedJob.packet_path, expectedJob.packet_sha256, expectedJob.packet_content],
    [input.evidence.output_schema, expectedJob.output_schema_path, expectedJob.output_schema_sha256, prettyJson(expectedJob.output_schema)],
    [input.evidence.model_catalog, expectedJob.model_catalog_path, expectedJob.model_catalog_sha256,
      readFileSync(canonicalRepoFileForRead(expectedJob.model_catalog_path, "Luna model catalog"), "utf8")],
  ] as const;
  for (const [resource, path, digest, content] of exactResources) {
    if (resource.path !== path || resource.sha256 !== digest || resource.content !== content || sha256(resource.content) !== digest) {
      throw new Error(`Independent sample durable resource does not replay exactly: ${path}`);
    }
  }
  if (sha256(input.evidence.commentary_ledger.content) !== manifest.ledger.sha256) {
    throw new Error("Independent sample durable commentary ledger does not bind the pending manifest");
  }
  const prompt = expectedJob.command.args.at(-1);
  if (
    typeof prompt !== "string" || input.evidence.prompt.sha256 !== expectedJob.prompt_sha256 ||
    input.evidence.prompt.content !== prompt || sha256(prompt) !== expectedJob.prompt_sha256
  ) {
    throw new Error("Independent sample durable prompt does not replay exactly");
  }
  const review = parseCommentaryAuditSampleReview(JSON.parse(input.evidence.sample_output.content) as unknown, expectedJob);
  if (review.sample_verdict !== requiredVerdict || input.evidence.sample_output.content !== prettyJson(review)) {
    throw new Error(`Independent sample durable output is not the exact normalized ${requiredVerdict} review`);
  }
  if (
    input.evidence.sample_output.path !== expectedJob.output_path ||
    sha256(input.evidence.sample_output.content) !== input.evidence.sample_output.sha256 ||
    input.evidence.sample_state.path !== expectedJob.state_path ||
    sha256(input.evidence.sample_state.content) !== input.evidence.sample_state.sha256 ||
    input.evidence.codex_execution.path !== expectedJob.execution_path ||
    sha256(input.evidence.codex_execution.content) !== input.evidence.codex_execution.sha256
  ) {
    throw new Error("Independent sample durable output/state/execution paths or hashes are stale");
  }
  const execution = parseCodexExecResult(
    input.evidence.codex_execution.content,
    `Durable Codex sample job ${expectedJob.job_id}`,
  );
  const executionReview = parseCommentaryAuditSampleReview(execution.structured_output, expectedJob);
  if (prettyJson(executionReview) !== input.evidence.sample_output.content) {
    throw new Error("Independent sample durable output does not match the raw Codex execution");
  }
  const state = record(JSON.parse(input.evidence.sample_state.content) as unknown, "durable sample state");
  const usage = tokenUsage(state.usage, "durable sample state.usage");
  if (stableJson(usage) !== stableJson(execution.usage)) {
    throw new Error("Independent sample durable usage does not match the raw Codex execution");
  }
  const expected = expectedState(
    expectedJob,
    review,
    input.evidence.sample_output.sha256,
    input.evidence.codex_execution.sha256,
    usage,
  );
  if (prettyJson(state) !== prettyJson(expected)) {
    throw new Error("Independent sample durable state does not replay exactly");
  }
  return { job: expectedJob, review };
}

export function buildCommentaryAuditSamplePlan(options: {
  dialogues?: readonly string[];
  codexExecutable?: string;
} = {}): CommentaryAuditSamplePlan {
  const dialogues = [...(options.dialogues ?? listGreekDialogues())];
  if (dialogues.length === 0) throw new Error("No Greek dialogues found for independent commentary sampling");
  if (options.dialogues === undefined && dialogues.length !== EXPECTED_DIALOGUE_COUNT) {
    throw new Error(
      `Full independent commentary sampling requires exactly ${EXPECTED_DIALOGUE_COUNT} Greek dialogues; found ${dialogues.length}`,
    );
  }
  if (new Set(dialogues).size !== dialogues.length) throw new Error("Independent sample dialogues must be unique");
  if (dialogues.some((dialogue) => !DIALOGUE.test(dialogue))) throw new Error("Independent sample dialogue slug is malformed");
  dialogues.sort();
  // One immutable evidence snapshot serves this synchronous plan build. Live
  // execution takes a fresh snapshot at every asynchronous provider boundary.
  const auditEvidence = buildCommentaryAuditEvidenceSnapshot();
  const blocked: CommentaryAuditSampleBlockedDialogue[] = [];
  const jobs: CommentaryAuditSampleJobInspection[] = [];
  for (const dialogue of dialogues) {
    try {
      const manifest = buildCommentaryQualityAuditManifestPreview(dialogue, { auditEvidence });
      const manifestContent = prettyJson(manifest);
      const pendingPath = `scratch/commentary/audit-manifests/${dialogue}.json`;
      const pendingAbsolutePath = canonicalRepoFileForWrite(pendingPath, "pending commentary audit manifest");
      if (existsSync(pendingAbsolutePath) && readFileSync(
        canonicalRepoFileForRead(pendingPath, "pending commentary audit manifest"),
        "utf8",
      ) !== manifestContent) {
        throw new Error(`stale pending manifest ${pendingPath}; regenerate it with bun run harness commentary audit-manifest-preview ${dialogue}`);
      }
      jobs.push(inspectJob(buildCommentaryAuditSampleJob({
        manifest,
        pendingManifestContent: manifestContent,
        auditEvidence,
        ...(options.codexExecutable ? { codexExecutable: options.codexExecutable } : {}),
      })));
    } catch (error) {
      blocked.push({
        dialogue,
        status: "blocked",
        detail: error instanceof Error ? error.message : String(error),
        next_action: `Complete all-pass current audit artifacts, then run bun run harness commentary audit-manifest-preview ${dialogue}`,
      });
    }
  }
  return {
    schema_version: SCHEMA_VERSION,
    campaign: CAMPAIGN_ID,
    dry_run_default: true,
    max_concurrency: MAX_CONCURRENCY,
    sample_size: SAMPLE_SIZE,
    dialogues,
    blocked,
    jobs,
  };
}

function acceptanceHandoff(job: CommentaryAuditSampleJob, review: CommentaryAuditSampleReview) {
  if (review.sample_verdict !== "pass") return null;
  const common = [
    job.dialogue,
    "--reviewer",
    review.reviewer.id,
    "--reviewed-on",
    "<YYYY-MM-DD>",
    "--rationale",
    review.rationale,
    "--sampled-ids",
    review.sampled_commentary_ids.join(","),
    "--sample-output",
    job.output_path,
  ];
  return {
    reviewer: review.reviewer.id,
    rationale: review.rationale,
    sampled_commentary_ids: [...review.sampled_commentary_ids],
    preview_argv: ["bun", "run", "harness", "commentary", "audit-manifest-accept-preview", ...common],
    apply_argv: ["bun", "run", "harness", "commentary", "audit-manifest-accept-apply", ...common],
  };
}

async function assertCodexReady(options: RunCommentaryAuditSampleOptions, jobs: readonly CommentaryAuditSampleJob[]) {
  if (jobs.length === 0) return;
  const executable = options.codexExecutable ?? jobs[0]!.command.executable;
  const cwd = options.cwd ?? getRepoRoot();
  const runner = options.commandRunner ?? runCommand;
  const version = await runner(executable, ["--version"], cwd, options.env);
  const match = /codex-cli\s+(\d+\.\d+\.\d+)/iu.exec(version.stdout || version.stderr);
  if (version.exitCode !== 0 || match?.[1] !== COMMENTARY_CODEX_CLI_VERSION) {
    throw new Error(`Independent sample campaign requires codex-cli ${COMMENTARY_CODEX_CLI_VERSION}`);
  }
  const auth = await readLunaAuthStatus({
    codexExecutable: executable,
    cwd,
    ...(options.env ? { env: options.env } : {}),
    commandRunner: runner,
  });
  if (!auth.logged_in) throw new Error("Independent sample campaign requires a logged-in Codex account");
}

async function generateReview(job: CommentaryAuditSampleJob, options: RunCommentaryAuditSampleOptions) {
  const cwd = options.cwd ?? getRepoRoot();
  const runner = options.commandRunner ?? runCommand;
  rebuildCurrentJob(job, options);
  atomicWrite(job.packet_path, job.packet_content);
  atomicWrite(job.output_schema_path, prettyJson(job.output_schema));
  const result = await runner(
    options.codexExecutable ?? job.command.executable,
    job.command.args,
    cwd,
    options.env,
    job.packet_content,
  );
  try {
    if (result.exitCode !== 0) {
      const diagnostic = [result.stdout, result.stderr].filter((entry) => entry.trim().length > 0).join("\n");
      throw new Error(
        `Codex sample job ${job.job_id} failed with exit ${result.exitCode}: ${diagnostic.slice(0, 2_000)}`,
      );
    }
    rebuildCurrentJob(job, options);
    const parsed = parseCodexExecResult(result.stdout, `Codex sample job ${job.job_id}`);
    const review = parseCommentaryAuditSampleReview(parsed.structured_output, job);
    const outputContent = prettyJson(review);
    const state = expectedState(job, review, sha256(outputContent), sha256(result.stdout), parsed.usage);
    atomicWrite(job.pending_manifest_path, job.pending_manifest_content);
    atomicWrite(job.execution_path, result.stdout);
    atomicWrite(job.output_path, outputContent);
    atomicWrite(job.state_path, prettyJson(state));
    return review;
  } catch (error) {
    const preserved = preserveFailedSampleExecution({ job, result, error });
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}; exact failed provider result preserved at ${preserved.path} (sha256 ${preserved.sha256})`,
    );
  }
}

export async function runCommentaryAuditSamplePlan(
  plan: CommentaryAuditSamplePlan,
  options: RunCommentaryAuditSampleOptions = {},
): Promise<CommentaryAuditSampleRunResult[]> {
  const concurrency = options.concurrency ?? 2;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > MAX_CONCURRENCY) {
    throw new Error(`Independent sample concurrency must be an integer from 1 through ${MAX_CONCURRENCY}`);
  }
  const maxNewJobs = options.maxNewJobs ?? Number.POSITIVE_INFINITY;
  if (maxNewJobs !== Number.POSITIVE_INFINITY && (!Number.isInteger(maxNewJobs) || maxNewJobs < 1)) {
    throw new Error("Independent sample maxNewJobs must be a positive integer");
  }
  for (const entry of plan.jobs) assertSafeJob(entry.job);
  if (!(options.execute ?? false)) {
    return plan.jobs.map((entry) => ({
      dialogue: entry.dialogue,
      status: entry.status === "pending"
        ? "planned"
        : entry.status === "current_pass"
          ? "resumed_pass"
          : entry.status === "current_fail"
            ? "resumed_fail"
            : "planned",
      output_path: entry.job.output_path,
      acceptance_handoff: entry.review ? acceptanceHandoff(entry.job, entry.review) : null,
    }));
  }
  if (plan.blocked.length > 0) {
    throw new Error(
      `Independent sample campaign is blocked:\n${plan.blocked.map((entry) => `${entry.dialogue}: ${entry.detail}`).join("\n")}`,
    );
  }
  const currentEntries = plan.jobs.map((entry) => {
    const current = inspectJob(entry.job);
    if (current.status === "current_pass" || current.status === "current_fail") {
      rebuildCurrentJob(entry.job, options);
    }
    return current;
  });
  const malformed = currentEntries.filter((entry) => entry.status === "malformed");
  if (malformed.length > 0) {
    throw new Error(
      `Independent sample campaign has malformed scratch artifacts:\n${malformed.map((entry) => `${entry.dialogue}: ${entry.detail}`).join("\n")}`,
    );
  }
  const pending = currentEntries.filter((entry) => entry.status === "pending");
  if (pending.length > 1 && !Number.isFinite(maxNewJobs)) {
    throw new Error(`Independent sample paid execution requires --max-new-jobs; ${pending.length} fresh reviews are pending`);
  }
  const scheduled = pending.slice(0, maxNewJobs);
  await assertCodexReady(options, scheduled.map((entry) => entry.job));
  const generated = new Map<string, CommentaryAuditSampleReview>();
  let cursor = 0;
  let stopScheduling = false;
  const failures: string[] = [];
  const workers = Array.from({ length: Math.min(concurrency, scheduled.length) }, async () => {
    while (!stopScheduling && cursor < scheduled.length) {
      const entry = scheduled[cursor++]!;
      try {
        generated.set(entry.dialogue, await generateReview(entry.job, options));
      } catch (error) {
        stopScheduling = true;
        failures.push(`${entry.dialogue}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });
  await Promise.all(workers);
  if (failures.length > 0) throw new Error(`Independent sample job failures:\n${failures.join("\n")}`);
  const scheduledDialogues = new Set(scheduled.map((entry) => entry.dialogue));
  return currentEntries.map((entry) => {
    const review = generated.get(entry.dialogue) ?? entry.review;
    const status: CommentaryAuditSampleRunResult["status"] = generated.has(entry.dialogue)
      ? review!.sample_verdict === "pass" ? "generated_pass" : "generated_fail"
      : entry.status === "current_pass"
        ? "resumed_pass"
        : entry.status === "current_fail"
          ? "resumed_fail"
          : scheduledDialogues.has(entry.dialogue)
            ? "planned"
            : "deferred";
    return {
      dialogue: entry.dialogue,
      status,
      output_path: entry.job.output_path,
      acceptance_handoff: review ? acceptanceHandoff(entry.job, review) : null,
    };
  });
}

#!/usr/bin/env bun

import {
  buildCommentaryAuditSamplePlan,
  runCommentaryAuditSamplePlan,
  type CommentaryAuditSamplePlan,
} from "../../packages/harness/src/commentary-audit-sample-campaign.js";

const argv = process.argv.slice(2);
const command = argv[0] ?? "help";

type OptionKind = "boolean" | "value" | "repeatable";

function parseOptions(args: string[], specification: Record<string, OptionKind>) {
  const flags = new Set<string>();
  const values = new Map<string, string[]>();
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index]!;
    const kind = specification[option];
    if (!kind) throw new Error(option.startsWith("--") ? `Unknown option: ${option}` : `Unexpected argument: ${option}`);
    if (kind === "boolean") {
      if (flags.has(option)) throw new Error(`Duplicate option: ${option}`);
      flags.add(option);
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${option} requires a value`);
    if (kind === "value" && values.has(option)) throw new Error(`Duplicate option: ${option}`);
    values.set(option, [...(values.get(option) ?? []), value]);
    index += 1;
  }
  return { flags, values };
}

function positiveInteger(value: string | undefined, option: string, maximum?: number) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || (maximum !== undefined && parsed > maximum)) {
    throw new Error(`${option} must be an integer from 1${maximum === undefined ? "" : ` through ${maximum}`}`);
  }
  return parsed;
}

function summarizePlan(plan: CommentaryAuditSamplePlan) {
  const packetBytes = plan.jobs.map((entry) => Buffer.byteLength(entry.job.packet_content, "utf8"));
  return {
    schema_version: plan.schema_version,
    campaign: plan.campaign,
    dry_run_default: plan.dry_run_default,
    max_concurrency: plan.max_concurrency,
    sample_size: plan.sample_size,
    dialogue_count: plan.dialogues.length,
    blocked_count: plan.blocked.length,
    ready_count: plan.jobs.length,
    totals: {
      pending: plan.jobs.filter((entry) => entry.status === "pending").length,
      current_pass: plan.jobs.filter((entry) => entry.status === "current_pass").length,
      current_fail: plan.jobs.filter((entry) => entry.status === "current_fail").length,
      malformed: plan.jobs.filter((entry) => entry.status === "malformed").length,
      packet_bytes: packetBytes.reduce((sum, bytes) => sum + bytes, 0),
      maximum_packet_bytes: Math.max(0, ...packetBytes),
    },
    blocked: plan.blocked,
    jobs: plan.jobs.map((entry) => ({
      dialogue: entry.dialogue,
      status: entry.status,
      detail: entry.detail,
      reviewer_id: entry.job.reviewer_id,
      pending_manifest_path: entry.job.pending_manifest_path,
      pending_manifest_sha256: entry.job.pending_manifest_sha256,
      sampled_commentary_ids: entry.job.sampled_commentary_ids,
      packet_path: entry.job.packet_path,
      packet_sha256: entry.job.packet_sha256,
      packet_bytes: Buffer.byteLength(entry.job.packet_content, "utf8"),
      output_schema_path: entry.job.output_schema_path,
      output_path: entry.job.output_path,
      state_path: entry.job.state_path,
      execution_path: entry.job.execution_path,
      input_sha256: entry.job.input_sha256,
    })),
  };
}

function usage(): never {
  throw new Error([
    "Usage:",
    "  bun scripts/commentary/commentary-audit-sample-campaign.ts plan [--dialogue <slug>]...",
    "  bun scripts/commentary/commentary-audit-sample-campaign.ts run [--execute] [--dialogue <slug>]... [--concurrency 1-4] [--max-new-jobs <n>]",
    "",
    "The runner is dry by default. --execute is required for provider calls and scratch writes.",
    "It never writes wiki/commentary-audits/ or wiki/review/. Acceptance remains a separate deliberate operator action.",
  ].join("\n"));
}

async function main() {
  if (command !== "plan" && command !== "run") usage();
  const options = parseOptions(argv.slice(1), {
    "--execute": "boolean",
    "--dialogue": "repeatable",
    "--concurrency": "value",
    "--max-new-jobs": "value",
  });
  if (command === "plan" && (options.flags.size > 0 || options.values.has("--concurrency") || options.values.has("--max-new-jobs"))) {
    throw new Error("plan accepts only repeatable --dialogue selections");
  }
  const dialogues = options.values.get("--dialogue");
  const plan = buildCommentaryAuditSamplePlan({ ...(dialogues ? { dialogues } : {}) });
  if (command === "plan") {
    process.stdout.write(`${JSON.stringify(summarizePlan(plan), null, 2)}\n`);
    return;
  }
  const execute = options.flags.has("--execute");
  const concurrency = positiveInteger(options.values.get("--concurrency")?.[0], "--concurrency", 4);
  const maxNewJobs = positiveInteger(options.values.get("--max-new-jobs")?.[0], "--max-new-jobs");
  const results = await runCommentaryAuditSamplePlan(plan, {
    execute,
    ...(concurrency === undefined ? {} : { concurrency }),
    ...(maxNewJobs === undefined ? {} : { maxNewJobs }),
  });
  process.stdout.write(`${JSON.stringify({
    dry_run: !execute,
    concurrency: concurrency ?? 2,
    max_new_jobs: maxNewJobs ?? null,
    plan: summarizePlan(plan),
    results,
  }, null, 2)}\n`);
}

if (import.meta.main) await main();

#!/usr/bin/env bun

import { execFileSync } from "node:child_process";
import {
  buildCommentaryCampaignManifest,
  buildCommentaryCampaignPlan,
  buildCommentaryCampaignPreflightReport,
  buildCommentaryCampaignStatusReport,
  createReusableCanonicalAuditOutputResolver,
  importCommentaryOutline,
  importCommentaryRewrite,
  importCommentaryRewriteBatch,
  prepareCommentaryCampaignRetries,
  previewCommentaryCampaignRetries,
  readLunaAuthStatus,
  readLunaProviderAccessStatus,
  runCommentaryCampaignPlan,
  selectCommentaryCampaignJobs,
  writeCommentaryCampaignStatusReport,
  type CommentaryCampaignStage,
} from "../../packages/harness/src/commentary-campaign.js";
import { getRepoRoot } from "../../packages/harness/src/paths.js";
import { buildCommentaryCampaignUsageReport } from "../../packages/harness/src/commentary-campaign-telemetry.js";

const argv = process.argv.slice(2);
const command = argv[0] ?? "help";

function valueAfter(flag: string) {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function stageFlag(): CommentaryCampaignStage | "all" {
  const value = valueAfter("--stage") ?? "all";
  if (value !== "all" && value !== "outline" && value !== "draft" && value !== "audit" && value !== "rewrite") {
    throw new Error("--stage must be all, outline, draft, audit, or rewrite");
  }
  return value;
}

type StrictOptionKind = "boolean" | "value" | "repeatable";

function parseStrictOptions(args: string[], specification: Record<string, StrictOptionKind>) {
  const flags = new Set<string>();
  const values = new Map<string, string[]>();
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index]!;
    const kind = specification[option];
    if (!kind) {
      throw new Error(option.startsWith("--") ? `Unknown option: ${option}` : `Unexpected positional argument: ${option}`);
    }
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

function strictValue(options: ReturnType<typeof parseStrictOptions>, flag: string) {
  return options.values.get(flag)?.[0];
}

function strictValues(options: ReturnType<typeof parseStrictOptions>, flag: string) {
  return options.values.get(flag) ?? [];
}

function parsedStage(value: string | undefined, fallback: CommentaryCampaignStage | "all"):
  CommentaryCampaignStage | "all" {
  const stage = value ?? fallback;
  if (stage !== "all" && stage !== "outline" && stage !== "draft" && stage !== "audit" && stage !== "rewrite") {
    throw new Error("--stage must be all, outline, draft, audit, or rewrite");
  }
  return stage;
}

function parsedPositiveInteger(value: string | undefined, flag: string) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${flag} must be a positive integer`);
  return parsed;
}

function parsedConcurrency(value: string | undefined) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 40) {
    throw new Error("--concurrency must be an integer from 1 through 40");
  }
  return parsed;
}

export function runCommentaryCampaignRetryCommand(args: string[], codexExecutable = "codex") {
  const positionals: string[] = [];
  let execute = false;
  let reachedOptions = false;
  for (const argument of args) {
    if (argument === "--execute") {
      if (execute) throw new Error("Duplicate option: --execute");
      execute = true;
      reachedOptions = true;
      continue;
    }
    if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
    if (reachedOptions) throw new Error(`Unexpected positional argument after --execute: ${argument}`);
    positionals.push(argument);
  }

  const dialogue = positionals[0];
  const retryStage = positionals[1];
  const unitKeys = positionals.slice(2);
  if (!dialogue) throw new Error("Commentary retry requires a dialogue");
  if (retryStage !== "outline" && retryStage !== "draft" && retryStage !== "audit" && retryStage !== "rewrite") {
    throw new Error("Commentary retry stage must be outline, draft, audit, or rewrite");
  }
  if (retryStage === "outline" ? unitKeys.length !== 0 : unitKeys.length === 0) {
    throw new Error(
      retryStage === "outline"
        ? "Outline retry does not accept commentary unit keys"
        : "Commentary retry requires at least one unit key",
    );
  }

  const retryOptions = { dialogue, stage: retryStage, unitKeys, codexExecutable } as const;
  const retries = execute
    ? prepareCommentaryCampaignRetries(retryOptions)
    : previewCommentaryCampaignRetries(retryOptions);
  const aggregateAuditCommand = retryStage === "audit"
    ? [
      "bun scripts/commentary/commentary-campaign.ts run --execute",
      `--dialogue ${dialogue}`,
      "--stage audit",
      ...unitKeys.map((unitKey) => `--unit-key ${unitKey}`),
      `--max-new-jobs ${unitKeys.length}`,
      "--concurrency 1",
    ].join(" ")
    : undefined;
  return {
    dry_run: !execute,
    archived: execute,
    retries,
    next_run: aggregateAuditCommand ?? (retries.length === 1 ? retries[0]!.rerunCommand : null),
    next_run_commands: retries.map((retry) => retry.rerunCommand),
  };
}

function print(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usage(): never {
  throw new Error(
    [
      "Usage:",
      "  bun scripts/commentary/commentary-campaign.ts manifest [--dialogue <slug>] [--stage all|outline|draft|audit|rewrite] [--revise-outline]",
      "  bun scripts/commentary/commentary-campaign.ts run [--execute] [--dialogue <slug>] [--stage all|outline|draft|audit|rewrite] [--revise-outline] [--unit-key <key>]... [--concurrency 1-40] [--max-new-jobs <n>]",
      "  bun scripts/commentary/commentary-campaign.ts status [--write]",
      "  bun scripts/commentary/commentary-campaign.ts preflight [--dialogue <slug>] [--stage all|outline|draft|audit|rewrite] [--unit-key <key>]...",
      "  bun scripts/commentary/commentary-campaign.ts usage [--dialogue <slug>] [--stage all|outline|draft|audit|rewrite]",
      "  bun scripts/commentary/commentary-campaign.ts outline-preview <dialogue> <outline-path>",
      "  bun scripts/commentary/commentary-campaign.ts outline-apply <dialogue> <outline-path>",
      "  bun scripts/commentary/commentary-campaign.ts outline-replace-preview <dialogue> <outline-path>",
      "  bun scripts/commentary/commentary-campaign.ts outline-replace-apply <dialogue> <outline-path>",
      "  bun scripts/commentary/commentary-campaign.ts rewrite-preview <dialogue> <rewrite-path>",
      "  bun scripts/commentary/commentary-campaign.ts rewrite-apply <dialogue> <rewrite-path>",
      "  bun scripts/commentary/commentary-campaign.ts rewrite-batch-preview <dialogue> <rewrite-path>...",
      "  bun scripts/commentary/commentary-campaign.ts rewrite-batch-apply <dialogue> <rewrite-path>...",
      "  bun scripts/commentary/commentary-campaign.ts retry <dialogue> outline [--execute]",
      "  bun scripts/commentary/commentary-campaign.ts retry <dialogue> <draft|audit|rewrite> <unit-key>... [--execute]",
      "",
      "`run` is a dry run unless --execute is explicit. The live path first requires `codex login status` to report a logged-in account.",
      "Repeatable --unit-key selection requires one explicit --dialogue and --stage audit.",
      "Concurrency changes wall time and in-flight calls only; it does not reduce selected jobs or expected token budget. Use --max-new-jobs to cap paid calls.",
      "`status` distinguishes authentication readiness from an exact, hash-bound monthly-spend provider block observed by `run --execute`.",
    ].join("\n"),
  );
}

async function main() {
  const codexExecutable = "codex";
  if (command === "manifest") {
    print(
      buildCommentaryCampaignManifest({
        ...(valueAfter("--dialogue") ? { dialogue: valueAfter("--dialogue") } : {}),
        stage: stageFlag(),
        codexExecutable,
        ...(argv.includes("--revise-outline") ? { reviseOutline: true } : {}),
      }),
    );
    return;
  }

  if (command === "run") {
    const options = parseStrictOptions(argv.slice(1), {
      "--execute": "boolean",
      "--dialogue": "value",
      "--stage": "value",
      "--revise-outline": "boolean",
      "--unit-key": "repeatable",
      "--concurrency": "value",
      "--max-new-jobs": "value",
    });
    const dialogue = strictValue(options, "--dialogue");
    const requestedStage = parsedStage(strictValue(options, "--stage"), "all");
    const unitKeys = strictValues(options, "--unit-key");
    if (unitKeys.length > 0 && (!dialogue || requestedStage === "all" || requestedStage === "outline")) {
      throw new Error("--unit-key selection requires one explicit --dialogue and a unit campaign stage");
    }
    if (unitKeys.length > 1 && requestedStage !== "audit") {
      throw new Error("Repeatable --unit-key selection is limited to --stage audit");
    }
    const plan = buildCommentaryCampaignPlan({
      ...(dialogue ? { dialogue } : {}),
      stage: requestedStage,
      codexExecutable,
      ...(options.flags.has("--revise-outline") ? { reviseOutline: true } : {}),
    });
    const manifest = plan.manifest;
    const concurrency = parsedConcurrency(strictValue(options, "--concurrency"));
    const maxNewJobs = parsedPositiveInteger(strictValue(options, "--max-new-jobs"), "--max-new-jobs");
    const jobs = unitKeys.length === 0
      ? manifest.jobs
      : requestedStage === "audit"
        ? selectCommentaryCampaignJobs(manifest, { dialogue: dialogue!, stage: "audit", unitKeys })
        : manifest.jobs.filter(
          (job) => job.dialogue === dialogue && job.stage === requestedStage && job.unit_key === unitKeys[0],
        );
    if (unitKeys.length === 1 && requestedStage !== "audit" && jobs.length !== 1) {
      throw new Error(`Expected exactly one current ${requestedStage} job for ${dialogue}/${unitKeys[0]}`);
    }
    const preflight = buildCommentaryCampaignPreflightReport({
      manifest: { ...manifest, jobs },
      canonicalAuditReuse: createReusableCanonicalAuditOutputResolver({
        ...(plan.auditEvidence ? { auditEvidence: plan.auditEvidence } : {}),
      }),
      generatedInputs: plan.generatedInputs,
    });
    const execute = options.flags.has("--execute");
    const results = await runCommentaryCampaignPlan(plan, {
      execute,
      codexExecutable,
      jobs,
      ...(concurrency === undefined ? {} : { concurrency }),
      ...(maxNewJobs === undefined ? {} : { maxNewJobs }),
    });
    const paidJobsScheduled = Math.min(preflight.paid_job_count, maxNewJobs ?? preflight.paid_job_count);
    print({
      dry_run: !execute,
      concurrency: concurrency ?? 2,
      concurrency_semantics: "wall_clock_only",
      concurrency_note: "Concurrency changes wall time and in-flight calls only; use --max-new-jobs to cap paid calls.",
      max_new_jobs: maxNewJobs ?? null,
      selected_job_count: jobs.length,
      selected_job_ids: jobs.map((job) => job.job_id),
      selected_unit_keys: jobs.flatMap((job) => job.unit_key ? [job.unit_key] : []),
      paid_job_count: preflight.paid_job_count,
      paid_jobs_scheduled: paidJobsScheduled,
      paid_jobs_deferred: preflight.paid_job_count - paidJobsScheduled,
      preflight,
      jobs: results,
    });
    return;
  }

  if (command === "status") {
    const auth = await readLunaAuthStatus({ codexExecutable });
    const manifest = buildCommentaryCampaignManifest({ codexExecutable });
    const canonicalAuditReuse = createReusableCanonicalAuditOutputResolver();
    const providerAccess = readLunaProviderAccessStatus({ auth, manifest, canonicalAuditReuse });
    const report = buildCommentaryCampaignStatusReport({
      manifest,
      auth,
      providerAccess,
      expectedDialogues: 27,
      canonicalAuditReuse,
    });
    if (report.actual_dialogues !== report.expected_dialogues) {
      throw new Error(
        `Canonical dialogue count mismatch: expected ${report.expected_dialogues}, found ${report.actual_dialogues}`,
      );
    }
    const path = argv.includes("--write") ? writeCommentaryCampaignStatusReport(report) : undefined;
    print(path ? { path, report } : report);
    return;
  }

  if (command === "preflight") {
    const options = parseStrictOptions(argv.slice(1), {
      "--dialogue": "value",
      "--stage": "value",
      "--unit-key": "repeatable",
    });
    const dialogue = strictValue(options, "--dialogue");
    const requestedStage = parsedStage(strictValue(options, "--stage"), "audit");
    const unitKeys = strictValues(options, "--unit-key");
    if (unitKeys.length > 0 && (!dialogue || requestedStage === "all" || requestedStage === "outline")) {
      throw new Error("--unit-key selection requires one explicit --dialogue and a unit campaign stage");
    }
    if (unitKeys.length > 1 && requestedStage !== "audit") {
      throw new Error("Repeatable --unit-key selection is limited to --stage audit");
    }
    const plan = buildCommentaryCampaignPlan({
      ...(dialogue ? { dialogue } : {}),
      stage: requestedStage,
      codexExecutable,
    });
    const jobs = unitKeys.length === 0
      ? plan.manifest.jobs
      : requestedStage === "audit"
        ? selectCommentaryCampaignJobs(plan.manifest, { dialogue: dialogue!, stage: "audit", unitKeys })
        : plan.manifest.jobs.filter(
          (job) => job.dialogue === dialogue && job.stage === requestedStage && job.unit_key === unitKeys[0],
        );
    if (unitKeys.length === 1 && requestedStage !== "audit" && jobs.length !== 1) {
      throw new Error(`Expected exactly one current ${requestedStage} job for ${dialogue}/${unitKeys[0]}`);
    }
    const report = buildCommentaryCampaignPreflightReport({
      manifest: { ...plan.manifest, jobs },
      canonicalAuditReuse: createReusableCanonicalAuditOutputResolver({
        ...(plan.auditEvidence ? { auditEvidence: plan.auditEvidence } : {}),
      }),
      generatedInputs: plan.generatedInputs,
    });
    print({
      ...report,
      selection: {
        dialogue: dialogue ?? null,
        stage: requestedStage,
        unit_keys: jobs.flatMap((job) => job.unit_key ? [job.unit_key] : []),
        job_ids: jobs.map((job) => job.job_id),
      },
    });
    return;
  }

  if (command === "usage") {
    const stage = stageFlag();
    print(buildCommentaryCampaignUsageReport({
      ...(valueAfter("--dialogue") ? { dialogue: valueAfter("--dialogue") } : {}),
      ...(stage === "all" ? {} : { stage }),
    }));
    return;
  }

  if (
    command === "outline-preview" ||
    command === "outline-apply" ||
    command === "outline-replace-preview" ||
    command === "outline-replace-apply"
  ) {
    const dialogue = argv[1];
    const outlinePath = argv[2];
    if (!dialogue || !outlinePath) usage();
    const replaceSectionSkeleton = command.startsWith("outline-replace-");
    const apply = command === "outline-apply" || command === "outline-replace-apply";
    const result = importCommentaryOutline({
      dialogue,
      outlinePath,
      apply,
      replaceSectionSkeleton,
    });
    if (result.applied) {
      if (replaceSectionSkeleton) {
        execFileSync("bun", ["run", "harness", "commentary", "briefs", dialogue], {
          cwd: getRepoRoot(),
          stdio: "inherit",
        });
      }
      execFileSync("bun", ["run", "harness", "audio", "coverage", "--write"], {
        cwd: getRepoRoot(),
        stdio: "inherit",
      });
      execFileSync("bun", ["run", "validate"], { cwd: getRepoRoot(), stdio: "inherit" });
    }
    print({
      applied: result.applied,
      outline_path: result.outlinePath,
      ledger_path: result.ledgerPath,
      section_ids: result.sectionIds,
      ...(result.applied ? {} : { prospective_ledger: result.prospectiveLedger }),
    });
    return;
  }

  if (command === "rewrite-preview" || command === "rewrite-apply") {
    const dialogue = argv[1];
    const rewritePath = argv[2];
    if (!dialogue || !rewritePath) usage();
    const result = importCommentaryRewrite({
      dialogue,
      rewritePath,
      apply: command === "rewrite-apply",
    });
    print({
      applied: result.applied,
      rewrite_path: result.rewritePath,
      ledger_path: result.ledgerPath,
      changed_block_ids: result.changedBlockIds,
      ...(result.applied ? {
        next: "Record the accepted-to-unreviewed review-status changes in wiki/ingest-log.md and wiki/review/, then run bun run validate.",
      } : { prospective_ledger: result.prospectiveLedger }),
    });
    return;
  }

  if (command === "rewrite-batch-preview" || command === "rewrite-batch-apply") {
    const dialogue = argv[1];
    const rewritePaths = argv.slice(2);
    if (!dialogue || rewritePaths.length === 0) usage();
    const result = importCommentaryRewriteBatch({
      dialogue,
      rewritePaths,
      apply: command === "rewrite-batch-apply",
    });
    print({
      applied: result.applied,
      rewrite_paths: result.rewritePaths,
      ledger_path: result.ledgerPath,
      changed_block_ids: result.changedBlockIds,
      ...(result.applied ? {
        next: "Record the accepted-to-unreviewed review-status changes in wiki/ingest-log.md and wiki/review/, then run bun run validate.",
      } : { prospective_ledger: result.prospectiveLedger }),
    });
    return;
  }

  if (command === "retry") {
    print(runCommentaryCampaignRetryCommand(argv.slice(1), codexExecutable));
    return;
  }

  usage();
}

if (import.meta.main) await main();

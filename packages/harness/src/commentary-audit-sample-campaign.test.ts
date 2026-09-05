import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  commentaryAuditSampleCodexArgs,
  parseCommentaryAuditSampleReview,
  runCommentaryAuditSamplePlan,
  selectCommentaryAuditSampleIds,
  selectCommentaryAuditSampleUnits,
  type CommentaryAuditSampleJob,
  type CommentaryAuditSamplePlan,
  type CommentaryAuditSampleReview,
} from "./commentary-audit-sample-campaign.js";
import { COMMENTARY_AUTHORING_MODEL, COMMENTARY_STAGE_EFFORT } from "./commentary-authoring.js";
import type { CommentaryCampaignCommandRunner } from "./commentary-campaign.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function write(path: string, content: string) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function sampleJob(dialogue: string, ids: string[]): CommentaryAuditSampleJob {
  const inputSha256 = sha256(`sample input ${dialogue}`);
  const identity = inputSha256.slice(0, 16);
  const pendingManifestContent = `{"dialogue":"${dialogue}"}\n`;
  const pendingManifestSha256 = sha256(pendingManifestContent);
  const packetContent = `full packet for ${dialogue}\n`;
  const packetSha256 = sha256(packetContent);
  const outputSchema = { type: "object" };
  const outputSchemaSha256 = sha256(prettyJson(outputSchema));
  const modelCatalogPath = "packages/harness/src/commentary-luna-model-catalog.json";
  const modelCatalogContent = "{\"models\":[]}\n";
  write(modelCatalogPath, modelCatalogContent);
  const reviewerId = `commentary-audit-delegated-luna-reviewer-${dialogue}-${pendingManifestSha256.slice(0, 12)}`;
  const prompt = [reviewerId, pendingManifestSha256, packetSha256, ...ids].join("\n");
  const outputSchemaPath = `scratch/commentary/audit-sample-schemas/${dialogue}/${identity}.json`;
  return {
    schema_version: 1,
    job_id: `sample:${dialogue}:${identity}`,
    dialogue,
    reviewer_id: reviewerId,
    pending_manifest_path: `scratch/commentary/audit-manifests/${dialogue}.json`,
    pending_manifest_sha256: pendingManifestSha256,
    pending_manifest_content: pendingManifestContent,
    sampled_commentary_ids: ids,
    packet_path: `scratch/commentary/audit-sample-packets/${dialogue}/${identity}.md`,
    packet_sha256: packetSha256,
    packet_content: packetContent,
    output_schema_path: outputSchemaPath,
    output_schema_sha256: outputSchemaSha256,
    output_schema: outputSchema,
    model_catalog_path: modelCatalogPath,
    model_catalog_sha256: sha256(modelCatalogContent),
    prompt_sha256: sha256(prompt),
    output_path: `scratch/commentary/audit-sample-reviews/${dialogue}/${identity}.json`,
    state_path: `scratch/commentary/audit-sample-state/${dialogue}/${identity}.json`,
    execution_path: `scratch/commentary/audit-sample-executions/${dialogue}/${identity}.jsonl`,
    input_sha256: inputSha256,
    command: {
      executable: "codex",
      args: commentaryAuditSampleCodexArgs(prompt, outputSchemaPath, join(root, modelCatalogPath)),
    },
  };
}

function sampleReview(job: CommentaryAuditSampleJob, failedId?: string): CommentaryAuditSampleReview {
  const blocks = job.sampled_commentary_ids.map((commentaryId) => ({
    commentary_id: commentaryId,
    verdict: commentaryId === failedId ? "fail" as const : "pass" as const,
    rationale: commentaryId === failedId
      ? "The sampled block exceeds its exact evidence."
      : "The sampled block is supported, well placed, and clear in spoken audio.",
  }));
  const allPass = blocks.every((block) => block.verdict === "pass");
  return {
    schema_version: 1,
    dialogue: job.dialogue,
    reviewer: {
      id: job.reviewer_id,
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    pending_manifest_sha256: job.pending_manifest_sha256,
    sample_packet_sha256: job.packet_sha256,
    sampled_commentary_ids: [...job.sampled_commentary_ids],
    sample_verdict: allPass ? "pass" : "fail",
    blocks,
    rationale: allPass
      ? "Independent Luna review passed every sampled block against exact source, evidence, placement, and spoken-audio requirements."
      : "Independent Luna review found a concrete defect in the bounded sample.",
  };
}

function codexSuccessJsonl(structuredOutput: unknown) {
  return [
    JSON.stringify({ type: "thread.started", thread_id: "thread_fixture" }),
    JSON.stringify({ type: "turn.started" }),
    JSON.stringify({
      type: "item.completed",
      item: { id: "item_fixture", type: "agent_message", text: JSON.stringify(structuredOutput) },
    }),
    JSON.stringify({
      type: "turn.completed",
      usage: {
        input_tokens: 120,
        cached_input_tokens: 80,
        cache_write_input_tokens: 4,
        output_tokens: 30,
        reasoning_output_tokens: 12,
      },
    }),
  ].join("\n");
}

function plan(jobs: CommentaryAuditSampleJob[]): CommentaryAuditSamplePlan {
  return {
    schema_version: 1,
    campaign: "plato-commentary-independent-luna-sample",
    dry_run_default: true,
    max_concurrency: 4,
    sample_size: 15,
    dialogues: jobs.map((job) => job.dialogue),
    blocked: [],
    jobs: jobs.map((job) => ({
      dialogue: job.dialogue,
      status: "pending",
      detail: "fresh independent Luna sample required",
      job,
    })),
  };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "commentary-audit-sample-"));
  restoreRepoRoot = setRepoRootForTesting(root);
});

afterEach(() => {
  restoreRepoRoot?.();
  restoreRepoRoot = undefined;
  rmSync(root, { recursive: true, force: true });
});

describe("commentary independent Luna sample campaign", () => {
  it("selects all small-ledger ids and exactly fifteen evenly distributed large-ledger ids in ledger order", () => {
    const small = Array.from({ length: 9 }, (_, index) => `comm_fixture_${String(index + 1).padStart(4, "0")}`);
    expect(selectCommentaryAuditSampleIds(small)).toEqual(small);

    const large = Array.from({ length: 30 }, (_, index) => `comm_fixture_${String(index + 1).padStart(4, "0")}`);
    const sample = selectCommentaryAuditSampleIds(large);
    expect(sample).toHaveLength(15);
    expect(sample[0]).toBe(large[0]);
    expect(sample.at(-1)).toBe(large.at(-1));
    expect(new Set(sample).size).toBe(15);
    expect(sample.map((id) => large.indexOf(id))).toEqual([...sample].map((id) => large.indexOf(id)).sort((a, b) => a - b));
  });

  it("keeps append-only ledger sample order while selecting deterministic manifest-order unit packets", () => {
    const ledgerOrder = [
      "comm_fixture_0001",
      "comm_fixture_0002",
      "comm_fixture_0010",
      "comm_fixture_0011",
    ];
    const manifest = {
      dialogue: "fixture",
      units: [
        {
          unit_key: "01-1a-1b",
          output: {
            blocks: [
              { commentary_id: "comm_fixture_0001" },
              { commentary_id: "comm_fixture_0010" },
            ],
          },
        },
        {
          unit_key: "02-1c-1d",
          output: {
            blocks: [
              { commentary_id: "comm_fixture_0002" },
              { commentary_id: "comm_fixture_0011" },
            ],
          },
        },
      ],
    } as unknown as Parameters<typeof selectCommentaryAuditSampleUnits>[0];

    const units = selectCommentaryAuditSampleUnits(manifest, ledgerOrder);
    expect(units.map((unit) => unit.unit_key)).toEqual(["01-1a-1b", "02-1c-1d"]);
    expect(ledgerOrder).toEqual([
      "comm_fixture_0001",
      "comm_fixture_0002",
      "comm_fixture_0010",
      "comm_fixture_0011",
    ]);

    const duplicateCoverage = structuredClone(manifest);
    duplicateCoverage.units[1]!.output.blocks[1]!.commentary_id = "comm_fixture_0010";
    expect(() => selectCommentaryAuditSampleUnits(duplicateCoverage, ledgerOrder)).toThrow(
      "exact unique manifest-unit coverage",
    );
  });

  it("pins Luna medium, read-only isolation, structured output, and disabled tools", () => {
    const args = commentaryAuditSampleCodexArgs(
      "sample prompt",
      "scratch/commentary/sample.schema.json",
      "/repo/packages/harness/src/commentary-luna-model-catalog.json",
    );
    expect(args).toContain("gpt-5.6-luna");
    expect(args).toContain("model_reasoning_effort=medium");
    expect(args).toContain("read-only");
    expect(args).toContain("--output-schema");
    expect(args).toContain("features.shell_tool=false");
    expect(args).toContain("features.multi_agent=false");
    expect(args).toContain("--strict-config");
  });

  it("rejects reordered, internally inconsistent, or human-claiming sample results", () => {
    const job = sampleJob("fixture", ["comm_fixture_0001", "comm_fixture_0002"]);
    const valid = sampleReview(job);
    expect(parseCommentaryAuditSampleReview(valid, job)).toEqual(valid);

    const reordered = structuredClone(valid);
    reordered.sampled_commentary_ids.reverse();
    expect(() => parseCommentaryAuditSampleReview(reordered, job)).toThrow("must be comm_fixture_0001");

    const inconsistent = structuredClone(valid);
    inconsistent.blocks[0]!.verdict = "fail";
    expect(() => parseCommentaryAuditSampleReview(inconsistent, job)).toThrow(
      "sample_verdict must pass exactly when every sampled block passes",
    );

    const humanClaim = structuredClone(valid);
    humanClaim.rationale = "A human listening review passed the sample.";
    expect(() => parseCommentaryAuditSampleReview(humanClaim, job)).toThrow(
      "must not claim human listening or review",
    );

    const humanBlockClaim = structuredClone(valid);
    humanBlockClaim.blocks[0]!.rationale = "A person listened to this sampled block and approved it.";
    expect(() => parseCommentaryAuditSampleReview(humanBlockClaim, job)).toThrow(
      "sample review.blocks[0].rationale must not claim human listening or review",
    );

    const ordinaryListeningQuality = structuredClone(valid);
    ordinaryListeningQuality.blocks[0]!.rationale =
      "The block is concise, well placed, and clear in the listening sequence.";
    expect(parseCommentaryAuditSampleReview(ordinaryListeningQuality, job)).toEqual(ordinaryListeningQuality);

    const humanContentTerms = structuredClone(valid);
    humanContentTerms.blocks[0]!.rationale =
      "The block accurately preserves the human-wisdom conclusion without overstatement.";
    humanContentTerms.blocks[1]!.rationale =
      "The block marks the human-opinion boundary and remains source-bound.";
    expect(parseCommentaryAuditSampleReview(humanContentTerms, job)).toEqual(humanContentTerms);

    const passiveHumanClaim = structuredClone(valid);
    passiveHumanClaim.rationale = "This sample was reviewed by a human.";
    expect(() => parseCommentaryAuditSampleReview(passiveHumanClaim, job)).toThrow(
      "must not claim human listening or review",
    );
  });

  it("preserves an exact content-addressed provider result when output validation fails", async () => {
    const job = sampleJob("fixture", ["comm_fixture_0001"]);
    const invalid = sampleReview(job);
    invalid.blocks[0]!.rationale = "A person listened to this block and approved it.";
    const raw = codexSuccessJsonl(invalid);
    const runner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      return { exitCode: 0, stdout: raw, stderr: "provider diagnostic" };
    };
    await expect(runCommentaryAuditSamplePlan(plan([job]), {
      execute: true,
      maxNewJobs: 1,
      commandRunner: runner,
      currentJobResolver: (current) => current,
    })).rejects.toThrow("exact failed provider result preserved at");
    const failureDirectory = join(root, "scratch/commentary/audit-sample-failures/fixture");
    const names = readdirSync(failureDirectory);
    expect(names).toHaveLength(1);
    const content = readFileSync(join(failureDirectory, names[0]!), "utf8");
    expect(sha256(content)).toBe(names[0]!.replace(/\.json$/u, ""));
    const record = JSON.parse(content) as {
      stdout: { sha256: string; content: string };
      stderr: { content: string };
      validation_error: string;
    };
    expect(record.stdout).toEqual({ sha256: sha256(raw), content: raw });
    expect(record.stderr.content).toBe("provider diagnostic");
    expect(record.validation_error).toContain("must not claim human listening or review");
    expect(() => readFileSync(join(root, job.output_path), "utf8")).toThrow();
    expect(() => readFileSync(join(root, job.state_path), "utf8")).toThrow();
    expect(() => readFileSync(join(root, job.execution_path), "utf8")).toThrow();
  });

  it("rejects any plan that redirects a generated artifact outside the bounded scratch roots", async () => {
    const job = sampleJob("fixture", ["comm_fixture_0001"]);
    job.output_path = "wiki/commentary-audits/fixture.json";
    await expect(runCommentaryAuditSamplePlan(plan([job]))).rejects.toThrow(
      "Unsafe independent sample output_path",
    );
  });

  it("rejects symlinked scratch parents before invoking the provider", async () => {
    const job = sampleJob("fixture", ["comm_fixture_0001"]);
    const aliasTarget = join(root, "outside-scratch-packets");
    mkdirSync(join(root, "scratch/commentary"), { recursive: true });
    mkdirSync(aliasTarget, { recursive: true });
    symlinkSync(aliasTarget, join(root, "scratch/commentary/audit-sample-packets"), "dir");
    let providerCalls = 0;
    const runner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      providerCalls += 1;
      return { exitCode: 1, stdout: "", stderr: "unexpected" };
    };
    await expect(runCommentaryAuditSamplePlan(plan([job]), {
      execute: true,
      maxNewJobs: 1,
      commandRunner: runner,
      currentJobResolver: (current) => current,
    })).rejects.toThrow("traverses a symlink or realpath alias");
    expect(providerCalls).toBe(0);
  });

  it("is dry by default and executes only scratch writes with a hard concurrency ceiling of four", async () => {
    const first = sampleJob("alpha", ["comm_alpha_0001"]);
    const second = sampleJob("beta", ["comm_beta_0001"]);
    const campaign = plan([first, second]);
    let providerCalls = 0;
    let active = 0;
    let peak = 0;
    const runner: CommentaryCampaignCommandRunner = async (_executable, args, _cwd, _env, stdin) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      providerCalls += 1;
      active += 1;
      peak = Math.max(peak, active);
      const prompt = args.at(-1)!;
      const dialogue = prompt.includes(first.reviewer_id) ? "alpha" : "beta";
      const job = dialogue === "alpha" ? first : second;
      expect(stdin).toBe(job.packet_content);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return { exitCode: 0, stdout: codexSuccessJsonl(sampleReview(job)), stderr: "" };
    };

    const currentJobResolver = (job: CommentaryAuditSampleJob) => job;
    const dry = await runCommentaryAuditSamplePlan(campaign, {
      commandRunner: runner,
      concurrency: 4,
      currentJobResolver,
    });
    expect(dry.map((entry) => entry.status)).toEqual(["planned", "planned"]);
    expect(providerCalls).toBe(0);
    expect(() => readFileSync(join(root, first.packet_path), "utf8")).toThrow();

    await expect(
      runCommentaryAuditSamplePlan(campaign, {
        execute: true,
        commandRunner: runner,
        concurrency: 5,
        maxNewJobs: 2,
        currentJobResolver,
      }),
    ).rejects.toThrow("from 1 through 4");

    const executed = await runCommentaryAuditSamplePlan(campaign, {
      execute: true,
      commandRunner: runner,
      concurrency: 4,
      maxNewJobs: 2,
      currentJobResolver,
    });
    expect(executed.map((entry) => entry.status)).toEqual(["generated_pass", "generated_pass"]);
    expect(providerCalls).toBe(2);
    expect(peak).toBe(2);
    expect(readFileSync(join(root, first.packet_path), "utf8")).toBe(first.packet_content);
    expect(readFileSync(join(root, first.output_path), "utf8")).toContain('"sample_verdict": "pass"');
    expect(readFileSync(join(root, first.state_path), "utf8")).toContain('"permission_mode": "read-only"');
    expect(() => readFileSync(join(root, "wiki/commentary-audits/alpha.json"), "utf8")).toThrow();
    expect(() => readFileSync(join(root, "wiki/review/alpha.md"), "utf8")).toThrow();
    expect(executed[0]!.acceptance_handoff?.preview_argv).toContain("audit-manifest-accept-preview");
    expect(executed[0]!.acceptance_handoff?.apply_argv).toContain("--sample-output");
    expect(executed[0]!.acceptance_handoff?.apply_argv).toContain(first.output_path);

    write(first.packet_path, "tampered packet\n");
    const staleResume = plan([first]);
    staleResume.jobs[0] = {
      dialogue: first.dialogue,
      status: "current_pass",
      detail: "claimed current sample",
      job: first,
      review: sampleReview(first),
    };
    await expect(runCommentaryAuditSamplePlan(staleResume, {
      execute: true,
      commandRunner: runner,
      concurrency: 4,
      maxNewJobs: 1,
      currentJobResolver,
    })).rejects.toThrow("stale hash-bound sample resource");
  });
});

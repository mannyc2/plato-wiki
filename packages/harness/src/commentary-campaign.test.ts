import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertCommentaryStructuredOutputSchemaCompatible,
  buildCommentaryCampaignManifest,
  buildCommentaryCampaignPlan,
  buildCommentaryCampaignPreflightReport,
  commentaryRewriteOutputSchema,
  buildCommentaryCampaignStatusReport,
  createReusableCanonicalAuditOutputResolver,
  importCommentaryRewriteBatch,
  importCommentaryRewrite,
  importCommentaryOutline,
  parseCommentaryOutline,
  prepareCommentaryCampaignRetries,
  prepareCommentaryCampaignRetry,
  previewCommentaryCampaignRetries,
  readLunaProviderAccessStatus,
  reusableCanonicalAuditOutput,
  runCommentaryCampaign,
  runCommentaryCampaignPlan,
  selectCommentaryCampaignJobs,
  type CommentaryCampaignCommandRunner,
} from "./commentary-campaign.js";
import {
  buildCommentaryAuditEvidenceSnapshot,
  buildCommentaryAuditBriefs,
  buildCommentaryAuditBriefsFromSnapshot,
  COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
  parseCommentaryQualityAudit,
  writeCommentaryAuditBriefs,
} from "./commentary-audit.js";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_STAGE_EFFORT,
} from "./commentary-authoring.js";
import { applyCommentaryDelegatedAudit } from "./wiki/commentary-delegated-audit.js";
import { validateCommentaryQualityAuditManifest } from "./wiki/commentary-quality-audit.js";
import { setRepoRootForTesting } from "./paths.js";
import { formatTurnIndexToon, turnIndexPath } from "./derived/turns.js";
import { resolveSourceSpan } from "./source.js";
import { runCommentaryCampaignRetryCommand } from "../../../scripts/commentary/commentary-campaign.js";
import {
  COMMENTARY_PROTOCOL_FIXTURE,
  driftedCommentaryProtocolFixture,
} from "../test-support/commentary-protocol-fixture.js";
import { writeAcceptedCommentaryQualityAuditFixture } from "../test-support/audio-production-fixture.js";
import { writeOntologyVNextFixture } from "../test-support/ontology-vnext-fixture.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function write(path: string, content: string) {
  const absolutePath = join(root, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function sourceRefLines(dialogue: string, span: string) {
  const ref = resolveSourceSpan(dialogue, span).source_ref;
  return [
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: "${ref.text_sha256}"`,
  ].join("\n");
}

function sectionBlock(dialogue: string, id: string, span: string, status = "unreviewed") {
  const work = dialogue.slice(0, 1).toUpperCase() + dialogue.slice(1);
  return [
    "```yaml",
    `commentary_id: ${id}`,
    `source_work: ${work}`,
    "block_kind: section",
    "placement: before",
    'title: "A unit"',
    `stephanus_span: ${span}`,
    sourceRefLines(dialogue, span),
    'body: "A concise unit description."',
    "cites:",
    `  observations: ["obs_${dialogue}_0001"]`,
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: model",
    `review_status: ${status}`,
    "```",
  ].join("\n");
}

function noticeBlock(dialogue: string, id: string, span: string, status = "accepted") {
  const work = dialogue.slice(0, 1).toUpperCase() + dialogue.slice(1);
  return [
    "```yaml",
    `commentary_id: ${id}`,
    `source_work: ${work}`,
    "block_kind: notice",
    "placement: after",
    `stephanus_span: ${span}`,
    sourceRefLines(dialogue, span),
    'body: "Notice the structure of this exchange."',
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: model",
    `review_status: ${status}`,
    "```",
  ].join("\n");
}

function writeDialogue(dialogue: string) {
  const source = "{2a} alpha {2b} beta {3a} gamma {3b} delta";
  const english = "{2a} first. {2b} second.\n{3a} third. {3b} fourth.";
  write(`raw/plato/greek/${dialogue}.txt`, source);
  write(`raw/plato/english/${dialogue}.txt`, english);
  const boundary = source.indexOf("{3a}");
  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  const englishBoundary = english.indexOf("{3a}");
  const attribution = {
    schema_version: 2,
    dialogue,
    english_sha256: digest(english),
    status: "accepted",
    segments: [
      { id: `turn_${dialogue}_audio_0001`, start_char: 0, end_char: englishBoundary, character_id: "socrates" },
      { id: `turn_${dialogue}_audio_0002`, start_char: englishBoundary, end_char: english.length, character_id: "interlocutor" },
    ],
  };
  write(`audio/speaker-attributions/${dialogue}.json`, `${JSON.stringify(attribution, null, 2)}\n`);
  const sigla = "fixture sigla registry\n";
  write("derived/plato/turns/sigla.toml", sigla);
  write(
    turnIndexPath(dialogue),
    formatTurnIndexToon({
      dialogue,
      sourcePath: `raw/plato/greek/${dialogue}.txt`,
      sourceSha256: digest(source),
      siglaPath: "derived/plato/turns/sigla.toml",
      siglaSha256: digest(sigla),
      turns: [
        {
          turnId: `turn_${dialogue}_0001`,
          speaker: "A.",
          startMarker: "2a",
          endMarker: "2b",
          startChar: 0,
          endChar: boundary,
          textSha256: digest(source.slice(0, boundary)),
          greekCharCount: 0,
        },
        {
          turnId: `turn_${dialogue}_0002`,
          speaker: "B.",
          startMarker: "3a",
          endMarker: "3b",
          startChar: boundary,
          endChar: source.length,
          textSha256: digest(source.slice(boundary)),
          greekCharCount: 0,
        },
      ],
    }),
  );
  const work = dialogue.slice(0, 1).toUpperCase() + dialogue.slice(1);
  write(
    `wiki/observations/${dialogue}.md`,
    [
      "```yaml",
      `observation_id: obs_${dialogue}_0001`,
      `source_work: ${work}`,
      "observation: A reported dialogue frame is present.",
      "review_status: accepted",
      "```",
      "",
    ].join("\n"),
  );
  writeOntologyVNextFixture(root);
}

function acceptedAudioInsertion(dialogue: string, turnId: string, edge: "before" | "after") {
  const attributionPath = `audio/speaker-attributions/${dialogue}.json`;
  const englishPath = `raw/plato/english/${dialogue}.txt`;
  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  return {
    attribution_path: attributionPath,
    attribution_sha256: digest(readFileSync(join(root, attributionPath), "utf8")),
    english_sha256: digest(readFileSync(join(root, englishPath), "utf8")),
    turn_id: turnId,
    edge,
  };
}

function audioInsertionLines(boundary: ReturnType<typeof acceptedAudioInsertion>) {
  return [
    "audio_insertion:",
    `  attribution_path: ${boundary.attribution_path}`,
    `  attribution_sha256: "${boundary.attribution_sha256}"`,
    `  english_sha256: "${boundary.english_sha256}"`,
    `  turn_id: ${boundary.turn_id}`,
    `  edge: ${boundary.edge}`,
  ].join("\n");
}

function writeProtocol() {
  write("docs/commentary-protocol.md", COMMENTARY_PROTOCOL_FIXTURE);
  write(
    "packages/harness/src/commentary-luna-model-catalog.json",
    readFileSync(join(import.meta.dir, "commentary-luna-model-catalog.json"), "utf8"),
  );
}

function writeSkeleton(dialogue: string) {
  write(
    `wiki/commentary/${dialogue}.md`,
    `# ${dialogue}\n\n${sectionBlock(dialogue, `comm_${dialogue}_0001`, "2a-3b")}\n`,
  );
  write(
    `scratch/commentary/briefs/${dialogue}/01-2a-3b.md`,
    [
      "# Brief 01: A unit",
      "",
      `- section: comm_${dialogue}_0001`,
      "- span: 2a-3b",
      "",
      "## Greek spine",
      "",
      "{2a} alpha {2b} beta {3a} gamma {3b} delta",
      "",
      "## Accepted observations overlapping the span",
      "",
      `### obs_${dialogue}_0001`,
      "",
    ].join("\n"),
  );
}

function writeTwoUnitSkeleton(dialogue: string) {
  write(
    `wiki/commentary/${dialogue}.md`,
    [
      `# ${dialogue}`,
      "",
      sectionBlock(dialogue, `comm_${dialogue}_0001`, "2a-2b"),
      "",
      sectionBlock(dialogue, `comm_${dialogue}_0002`, "3a-3b"),
      "",
    ].join("\n"),
  );
  for (const [unitKey, sectionId, span, source] of [
    ["01-2a-2b", `comm_${dialogue}_0001`, "2a-2b", "{2a} first {2b} second"],
    ["02-3a-3b", `comm_${dialogue}_0002`, "3a-3b", "{3a} third {3b} fourth"],
  ] as const) {
    write(
      `scratch/commentary/briefs/${dialogue}/${unitKey}.md`,
      [
        `# Brief ${unitKey}`,
        "",
        `- section: ${sectionId}`,
        `- span: ${span}`,
        "",
        "## English reading spine",
        "",
        source,
        "",
        "## Accepted observations overlapping the span",
        "",
        `### obs_${dialogue}_0001`,
        "",
      ].join("\n"),
    );
  }
}

function writeAcceptedLedger(dialogue: string) {
  write(
    `wiki/commentary/${dialogue}.md`,
    `# ${dialogue}\n\n${sectionBlock(dialogue, `comm_${dialogue}_0001`, "2a-3b", "accepted")}\n\n${noticeBlock(dialogue, `comm_${dialogue}_0002`, "2a")}\n`,
  );
}

function writeAcceptedTwoUnitLedger(dialogue: string) {
  write(
    `wiki/commentary/${dialogue}.md`,
    [
      `# ${dialogue}`,
      "",
      sectionBlock(dialogue, `comm_${dialogue}_0001`, "2a-2b", "accepted"),
      "",
      noticeBlock(dialogue, `comm_${dialogue}_0002`, "2a"),
      "",
      sectionBlock(dialogue, `comm_${dialogue}_0003`, "3a-3b", "accepted"),
      "",
      noticeBlock(dialogue, `comm_${dialogue}_0004`, "3a"),
      "",
    ].join("\n"),
  );
}

function fakeCodex() {
  const path = join(root, "bin/fake-codex");
  write(
    "bin/fake-codex",
    [
      "#!/usr/bin/env node",
      'const fs = require("node:fs");',
      "const args = process.argv.slice(2);",
      'if (args[0] === "--version") { console.log("codex-cli 0.147.0"); process.exit(0); }',
      'fs.appendFileSync(process.env.FAKE_CODEX_LOG, `${args.join(" ")}\\n`, "utf8");',
      'if (args[0] === "login" && args[1] === "status") console.log(process.env.FAKE_CODEX_AUTH_OUTPUT);',
      'else process.stdout.write(process.env.FAKE_CODEX_RESPONSE_JSON);',
      "",
    ].join("\n"),
  );
  chmodSync(path, 0o755);
  return path;
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

function fakeEnvironment(auth: object, response: object) {
  const logPath = join(root, "fake-codex.log");
  return {
    ...process.env,
    FAKE_CODEX_AUTH_OUTPUT: typeof auth === "string" ? auth : (auth as { loggedIn?: boolean }).loggedIn ? "Logged in" : "Authentication required",
    FAKE_CODEX_RESPONSE_JSON: codexSuccessJsonl(
      (response as { structured_output?: unknown }).structured_output ?? response,
    ),
    FAKE_CODEX_LOG: logPath,
  };
}

const fakeCommandRunner: CommentaryCampaignCommandRunner = async (executable, args, cwd, env) => {
  execFileSync(executable, args, { cwd, env, stdio: "ignore" });
  return {
    exitCode: 0,
    stdout: args[0] === "--version"
      ? "codex-cli 0.147.0"
      : args[0] === "login"
        ? env?.FAKE_CODEX_AUTH_OUTPUT ?? ""
        : env?.FAKE_CODEX_RESPONSE_JSON ?? "",
    stderr: "",
  };
};

function validDraft(
  dialogue: string,
  options: { unitKey?: string; sectionId?: string; anchor?: string } = {},
) {
  const unitKey = options.unitKey ?? "01-2a-3b";
  const sectionId = options.sectionId ?? `comm_${dialogue}_0001`;
  return {
    schema_version: 1,
    dialogue,
    unit_key: unitKey,
    section_id: sectionId,
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.draft,
    },
    blocks: [
      {
        block_kind: "notice",
        placement: "after",
        stephanus_span: options.anchor ?? "2a",
        body: "Notice how the opening establishes the question.",
        cites: { observations: [`obs_${dialogue}_0001`], claims: [], relations: [], dossiers: [] },
        crossrefs: [],
      },
    ],
  };
}

function validOutline(dialogue: string) {
  return {
    schema_version: 1,
    dialogue,
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.outline,
    },
    sections: [
      {
        unit_key: "opening",
        title: "Opening unit",
        stephanus_span: "2a-2b",
        body: "The first unit establishes the setting.",
        cites: { observations: [], claims: [], relations: [], dossiers: [] },
      },
      {
        unit_key: "closing",
        title: "Closing unit",
        stephanus_span: "3a-3b",
        body: "The second unit completes the exchange.",
        cites: { observations: [], claims: [], relations: [], dossiers: [] },
      },
    ],
  };
}

function auditChecks(issueCodes: readonly string[] = []) {
  const evidenceFail = issueCodes.some((code) => [
    "source_misreading",
    "certainty_exceeds_evidence",
    "unsupported_or_miscited_claim",
  ].includes(code));
  const placementFail = issueCodes.includes("interrupts_dramatic_flow");
  const listeningFail = issueCodes.some((code) => [
    "source_recap",
    "generic_or_reusable",
    "multiple_jobs",
    "repetitive_throat_clearing",
    "redundant_within_unit",
    "hard_to_follow_aloud",
    "excessive_unit_interruptions",
  ].includes(code));
  return {
    evidence: { verdict: evidenceFail ? "fail" : "pass" },
    placement: {
      verdict: placementFail ? "fail" : "pass",
      hazard_codes: placementFail ? ["question_answer_split"] : [],
    },
    listening: { verdict: listeningFail ? "fail" : "pass" },
  };
}

function validAudit(dialogue: string, disposition: "pass" | "rewrite" = "pass") {
  const issueCodes = disposition === "pass" ? [] : ["source_recap"];
  return {
    schema_version: 3,
    dialogue,
    unit_key: "01-2a-3b",
    section_id: `comm_${dialogue}_0001`,
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.audit,
    },
    unit_verdict: disposition === "pass" ? "pass" : "fail",
    blocks: [
      {
        commentary_id: `comm_${dialogue}_0001`,
        disposition: "pass",
        issue_codes: [],
        checks: auditChecks(),
        rationale: "The section orients the listener concisely without crowding the dialogue.",
      },
      {
        commentary_id: `comm_${dialogue}_0002`,
        disposition,
        issue_codes: issueCodes,
        checks: auditChecks(issueCodes),
        rationale: disposition === "pass"
          ? "The interruption adds one concrete listening cue and remains easy to follow aloud."
          : "The interruption only repeats what the listener has just heard.",
      },
    ],
  };
}

function validRewrite(dialogue: string, auditOutputPath: string, auditOutputSha256: string) {
  return {
    schema_version: 1,
    dialogue,
    unit_key: "01-2a-3b",
    section_id: `comm_${dialogue}_0001`,
    audit_output: {
      path: auditOutputPath,
      sha256: auditOutputSha256,
    },
    authoring: {
      model: COMMENTARY_AUTHORING_MODEL,
      effort: COMMENTARY_STAGE_EFFORT.rewrite,
    },
    revisions: [
      {
        commentary_id: `comm_${dialogue}_0002`,
        title: "",
        body: "The exchange turns on a concrete structural contrast rather than repeating the source.",
        cites: { observations: [`obs_${dialogue}_0001`], claims: [], relations: [], dossiers: [] },
        crossrefs: [],
      },
    ],
  };
}

function historicalFableLowDraft(dialogue: string) {
  return {
    ...validDraft(dialogue),
    authoring: { model: "historical-fable-low", effort: "low" },
  };
}

describe("Codex gpt-5.6-luna commentary campaign", () => {
  it("rejects provider-incompatible strict JSON Schema keywords before execution", () => {
    expect(() => assertCommentaryStructuredOutputSchemaCompatible({
      type: "array",
      uniqueItems: true,
      items: { type: "string" },
    })).toThrow("uniqueItems is not supported by Codex strict structured outputs");
    expect(() => assertCommentaryStructuredOutputSchemaCompatible(
      COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
    )).not.toThrow();
  });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-campaign-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeProtocol();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("builds deterministic v3 jobs with stage-specific Luna effort and isolated handoffs", () => {
    writeDialogue("pending");
    writeDialogue("ready");
    writeSkeleton("ready");

    const first = buildCommentaryCampaignManifest();
    const second = buildCommentaryCampaignManifest();
    const plan = buildCommentaryCampaignPlan();
    expect(second).toEqual(first);
    expect(plan.manifest).toEqual(first);
    expect(first).toMatchObject({
      schema_version: 3,
      campaign: "plato-commentary-gpt-5-6-luna",
      authoring: {
        model_argument: "gpt-5.6-luna",
        codex_cli_version: "0.147.0",
        model_catalog_path: "packages/harness/src/commentary-luna-model-catalog.json",
        model_catalog_sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        recorded_model: "gpt-5.6-luna",
        effort_by_stage: {
          outline: "high",
          draft: "medium",
          audit: "medium",
          rewrite: "high",
        },
        permission_mode: "read-only",
      },
    });
    expect(first.jobs.map((job) => job.job_id)).toEqual([
      expect.stringMatching(/^outline:pending:[a-f0-9]{16}$/),
      "draft:ready:01-2a-3b",
    ]);
    expect(first.jobs.map((job) => [job.stage, job.schema_version, job.effort])).toEqual([
      ["outline", 3, "high"],
      ["draft", 3, "medium"],
    ]);

    for (const job of first.jobs) {
      expect(job.model_argument).toBe("gpt-5.6-luna");
      expect(job.authoring_model).toBe("gpt-5.6-luna");
      expect(job.permission_mode).toBe("read-only");
      expect(job.codex_cli_version).toBe("0.147.0");
      expect(job.model_catalog_path).toBe("packages/harness/src/commentary-luna-model-catalog.json");
      expect(job.model_catalog_sha256).toMatch(/^[a-f0-9]{64}$/u);
      expect(job.input_files).toContainEqual({
        path: "packages/harness/src/commentary-luna-model-catalog.json",
        sha256: job.model_catalog_sha256,
      });
      expect(job.session_name).toStartWith(`plato-commentary-${job.dialogue}-`);
      expect(job.command.args.slice(0, 10)).toEqual([
        "exec", "--model", "gpt-5.6-luna", "-c", `model_reasoning_effort=${job.effort}`,
        "--sandbox", "read-only", "--ephemeral", "--json", "--output-schema",
      ]);
      expect(job.command.args).toContain("--output-schema");
      expect(job.command.args).toContain("--json");
      expect(job.command.args).toContain(
        `model_catalog_json=${JSON.stringify(join(root, "packages/harness/src/commentary-luna-model-catalog.json"))}`,
      );
      expect(job.command.args).toContain("--ignore-user-config");
      expect(job.command.args).toContain("--ignore-rules");
      expect(job.prompt).toContain("docs/commentary-protocol.md");
      expect(job.prompt).toContain("Use the exact Luna model and stage effort stated here");
      expect(job.prompt).toContain(`raw/plato/greek/${job.dialogue}.txt`);
      expect(job.prompt).toContain("Never invent, repair, infer, or autocomplete a citation ID");
      if (job.stage === "outline") {
        expect(job.prompt).toContain("Never split a speaker's continuous turn or sentence");
        expect(job.prompt).toContain("never separate a question from its immediate answer");
      }
      expect(job.serial_handoff.at(-1)).toContain(job.stage === "outline" ? "commentary briefs" : "validate");
    }

    const outline = first.jobs.find((job) => job.stage === "outline")!;
    const draft = first.jobs.find((job) => job.stage === "draft")!;
    expect(outline.command.args.slice(0, 7)).toEqual(["exec", "--model", "gpt-5.6-luna", "-c", "model_reasoning_effort=high", "--sandbox", "read-only"]);
    expect(draft.command.args.slice(0, 7)).toEqual(["exec", "--model", "gpt-5.6-luna", "-c", "model_reasoning_effort=medium", "--sandbox", "read-only"]);
    expect(outline.serial_handoff[0]).toStartWith(
      "bun scripts/commentary/commentary-campaign.ts outline-preview pending ",
    );
    expect(draft.output_path).toBe("scratch/commentary/drafts/ready/01-2a-3b.json");
    expect(draft.prompt).toContain("scratch/commentary/briefs/ready/01-2a-3b.md");
    expect(draft.prompt).toContain("The only files you may read");
    expect(draft.prompt).toContain("Return zero to three blocks");
    expect(draft.prompt).toContain("One block is the normal ceiling");
    expect(draft.prompt).toContain("The brief includes the existing section commentary");
    expect(draft.prompt).toContain("Authorial framing is not evidence");
    expect(draft.prompt).toContain("Every insertion boundary must be exact and turn-safe");
    expect(draft.prompt).toContain("audio_insertion must bind exactly to audio/speaker-attributions/ready.json");
    expect(draft.prompt).toContain("An interior char_offset is allowed only with edge after");
    expect(draft.input_files.map((entry) => entry.path)).toContain("audio/speaker-attributions/ready.json");
    expect(draft.prompt).toContain("telegraph a later result as inevitable");
    expect(draft.prompt).toContain("prefer silence to a redundant or generic block");
    expect(draft.prompt).toContain("Never read or write wiki/commentary/<dialogue>.md");
  });

  it("binds rewrite guidance only to its named rewrite job", () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const auditManifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    for (const job of auditManifest.jobs) {
      const output = {
        schema_version: 3,
        dialogue: job.dialogue,
        unit_key: job.unit_key,
        section_id: job.section_id,
        authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
        unit_verdict: "fail",
        blocks: job.commentary_ids!.map((commentaryId, index) => ({
          commentary_id: commentaryId,
          disposition: "rewrite",
          issue_codes: ["source_recap"],
          checks: auditChecks(["source_recap"]),
          rationale: index === 0
            ? "The section repeats the source rather than adding a distinct listening value."
            : "The interruption only repeats what the listener has just heard.",
        })),
      };
      write(job.output_path, `${JSON.stringify(output, null, 2)}\n`);
      write(job.state_path, `${JSON.stringify({
        schema_version: 3,
        job_id: job.job_id,
        stage: job.stage,
        input_sha256: job.input_sha256,
        output_schema_sha256: job.output_schema_sha256,
        model_argument: COMMENTARY_AUTHORING_MODEL,
        codex_cli_version: "0.147.0",
        model_catalog_path: "packages/harness/src/commentary-luna-model-catalog.json",
        model_catalog_sha256: job.model_catalog_sha256,
        authoring_model: COMMENTARY_AUTHORING_MODEL,
        effort: COMMENTARY_STAGE_EFFORT.audit,
        permission_mode: "read-only",
        output_path: job.output_path,
        output_sha256: createHash("sha256").update(`${JSON.stringify(output, null, 2)}\n`).digest("hex"),
      }, null, 2)}\n`);
    }
    for (const brief of buildCommentaryAuditBriefs("accepted")) write(brief.path, brief.content);

    const baseline = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" });
    const guidedUnit = baseline.jobs[0]!.unit_key!;
    const guidancePath = `scratch/commentary/rewrite-guidance/accepted/${guidedUnit}.md`;
    write(guidancePath, "- Replace the recap sentence with a concrete structural contrast.\n");
    const constraintsPath = `scratch/commentary/rewrite-guidance/accepted/${guidedUnit}.constraints.json`;
    write(constraintsPath, `${JSON.stringify({
      schema_version: 1,
      constraints: {
        comm_accepted_0001: {
          title: "Exact section title",
          cites: {
            observations: [" obs_accepted_0001 "],
            claims: [],
            relations: [],
            dossiers: [],
          },
        },
        comm_accepted_0002: {
          body: "Exact non-section body.",
          crossrefs: [{ source_work: " Phaedo ", stephanus_span: " 117a ", note: " Exact cross-reference. " }],
        },
      },
    }, null, 2)}\n`);
    const guided = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" });
    const guidedJob = guided.jobs.find((job) => job.unit_key === guidedUnit)!;
    const siblingJob = guided.jobs.find((job) => job.unit_key !== guidedUnit)!;
    const baselineSibling = baseline.jobs.find((job) => job.unit_key !== guidedUnit)!;
    expect(guidedJob.input_sha256).not.toBe(baseline.jobs.find((job) => job.unit_key === guidedUnit)!.input_sha256);
    expect(guidedJob.rewrite_title_constraints).toEqual([
      { commentary_id: "comm_accepted_0001", block_kind: "section" },
      { commentary_id: "comm_accepted_0002", block_kind: "non-section" },
    ]);
    expect(guidedJob.prompt).toContain(guidancePath);
    expect(guidedJob.prompt).toContain(constraintsPath);
    expect(guidedJob.input_files.map((input) => input.path)).toContain(guidancePath);
    expect(guidedJob.input_files.map((input) => input.path)).toContain(constraintsPath);
    expect(guidedJob.rewrite_exact_constraints).toEqual([
      {
        commentary_id: "comm_accepted_0001",
        title: "Exact section title",
        cites: { observations: ["obs_accepted_0001"], claims: [], relations: [], dossiers: [] },
      },
      {
        commentary_id: "comm_accepted_0002",
        body: "Exact non-section body.",
        crossrefs: [{ source_work: "Phaedo", stephanus_span: "117a", note: "Exact cross-reference." }],
      },
    ]);
    const guidedSchema = commentaryRewriteOutputSchema(
      guidedJob.rewrite_title_constraints,
      guidedJob.rewrite_exact_constraints,
    ) as {
      properties: {
        revisions: { items: { anyOf: Array<{ properties: Record<string, Record<string, unknown>> }> } };
      };
    };
    expect(guidedSchema.properties.revisions.items.anyOf[0]?.properties.title).toEqual({
      type: "string",
      const: "Exact section title",
    });
    expect(guidedSchema.properties.revisions.items.anyOf[1]?.properties.body).toEqual({
      type: "string",
      const: "Exact non-section body.",
    });
    expect(guidedSchema.properties.revisions.items.anyOf[0]?.properties.cites).toEqual({
      const: { observations: ["obs_accepted_0001"], claims: [], relations: [], dossiers: [] },
    });
    expect(guidedSchema.properties.revisions.items.anyOf[1]?.properties.crossrefs).toEqual({
      const: [{ source_work: "Phaedo", stephanus_span: "117a", note: "Exact cross-reference." }],
    });
    expect(siblingJob.input_sha256).toBe(baselineSibling.input_sha256);
    expect(siblingJob.prompt).toBe(baselineSibling.prompt);
    expect(siblingJob.output_schema_sha256).toBe(baselineSibling.output_schema_sha256);
  });

  it("constrains each guided revision title by its current block kind", () => {
    const schema = commentaryRewriteOutputSchema([
      { commentary_id: "comm_fixture_0001", block_kind: "section" },
      { commentary_id: "comm_fixture_0002", block_kind: "non-section" },
    ]) as {
      properties: {
        revisions: {
          items: { anyOf: Array<{ properties: { commentary_id: { const: string }; title: Record<string, unknown> } }> };
        };
      };
    };
    expect(schema.properties.revisions.items.anyOf).toHaveLength(2);
    expect(schema.properties.revisions.items.anyOf[0]?.properties).toMatchObject({
      commentary_id: { const: "comm_fixture_0001" },
      title: { type: "string", minLength: 1 },
    });
    expect(schema.properties.revisions.items.anyOf[1]?.properties).toMatchObject({
      commentary_id: { const: "comm_fixture_0002" },
      title: { type: "string", const: "" },
    });
  });

  it("fails closed for empty, oversized, and unknown-unit rewrite guidance", () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const directory = "scratch/commentary/rewrite-guidance/accepted";
    write(`${directory}/01-2a-3b.md`, "   \n");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("non-empty string");

    write(`${directory}/01-2a-3b.md`, `${"x".repeat(4_001)}\n`);
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("rewrite-guidance limit");

    unlinkSync(join(root, `${directory}/01-2a-3b.md`));
    write(`${directory}/99-unknown.md`, "- This unit does not exist.\n");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("does not name a current unit");
  });

  it("fails closed for malformed rewrite exact-constraint sidecars and illegal titles", () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const directory = "scratch/commentary/rewrite-guidance/accepted";
    const path = `${directory}/01-2a-3b.constraints.json`;
    write(path, JSON.stringify({ schema_version: 1, constraints: { comm_missing_0001: { body: "Nope." } } }));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("unknown current commentary id");

    write(path, JSON.stringify({ schema_version: 1, constraints: { comm_accepted_0002: { body: "" } } }));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("body must be a non-empty string");

    write(path, JSON.stringify({ schema_version: 1, constraints: { comm_accepted_0002: { title: "Illegal title" } } }));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("exactly empty for a non-section");

    write(path, JSON.stringify({ schema_version: 1, constraints: { comm_accepted_0001: { title: "" } } }));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("non-empty for a section");

    write(path, JSON.stringify({ schema_version: 1, constraints: { comm_accepted_0001: { body: "Okay." } }, extra: true }));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("extra is not allowed");

    write(path, JSON.stringify({ schema_version: 1, constraints: {
      comm_accepted_0001: {
        cites: { observations: [], claims: [], relations: [], dossiers: [], extra: [] },
      },
    }}));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("cites.extra is not allowed");

    write(path, JSON.stringify({ schema_version: 1, constraints: {
      comm_accepted_0001: { cites: [] },
    }}));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("cites must be an object");

    write(path, JSON.stringify({ schema_version: 1, constraints: {
      comm_accepted_0001: { crossrefs: [{ source_work: 123, stephanus_span: "117a" }] },
    }}));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "rewrite" })).toThrow("crossrefs[0].source_work must be a non-empty string");
  });

  it("content-addresses serial outline guidance without overwriting the rejected artifact", () => {
    writeDialogue("pending");
    const first = buildCommentaryCampaignManifest({ dialogue: "pending", stage: "outline" });
    const baselinePath = "scratch/commentary/outlines/pending/outline-aaaaaaaaaaaaaaaa.json";
    write(baselinePath, "{}\n");
    write(
      "scratch/commentary/outline-guidance/pending.md",
      "# Serial editorial guidance\n\nCorrect the named attribution and return the complete outline.\n",
    );
    write("scratch/commentary/outline-guidance/pending.baseline", `${baselinePath}\n`);

    const corrected = buildCommentaryCampaignManifest({ dialogue: "pending", stage: "outline" });
    expect(corrected.jobs[0]!.job_id).not.toBe(first.jobs[0]!.job_id);
    expect(corrected.jobs[0]!.output_path).not.toBe(first.jobs[0]!.output_path);
    expect(corrected.jobs[0]!.input_files).toContainEqual({
      path: "scratch/commentary/outline-guidance/pending.md",
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(corrected.jobs[0]!.input_files.map((entry) => entry.path)).toEqual(
      expect.arrayContaining([
        "scratch/commentary/outline-guidance/pending.baseline",
        baselinePath,
      ]),
    );
    expect(corrected.jobs[0]!.prompt).toContain(
      "treat it as binding serial editorial feedback and return a complete corrected outline",
    );
    expect(corrected.jobs[0]!.prompt).toContain(
      "preserve the baseline's section count, unit keys, spans, titles, bodies, and citations verbatim",
    );

    const revisionBaselinePath = "scratch/commentary/outlines/pending/outline-bbbbbbbbbbbbbbbb.json";
    write(revisionBaselinePath, "{}\n");
    write("scratch/commentary/outline-guidance/pending.revision-baseline", `${revisionBaselinePath}\n`);
    const revision = buildCommentaryCampaignManifest({ dialogue: "pending", stage: "outline" });
    expect(revision.jobs[0]!.job_id).not.toBe(corrected.jobs[0]!.job_id);
    expect(revision.jobs[0]!.input_files.map((entry) => entry.path)).toEqual(
      expect.arrayContaining([
        "scratch/commentary/outline-guidance/pending.revision-baseline",
        revisionBaselinePath,
      ]),
    );
    expect(revision.jobs[0]!.prompt).toContain("newer rejected candidate as the immediate correction baseline");
  });

  it("generates and safely replaces only an unreviewed section skeleton", async () => {
    writeDialogue("fixture");
    writeSkeleton("fixture");
    const baselinePath = "scratch/commentary/outlines/fixture/outline-aaaaaaaaaaaaaaaa.json";
    const baseline = {
      ...validOutline("fixture"),
      sections: [{
        unit_key: "whole-dialogue",
        title: "A unit",
        stephanus_span: "2a-3b",
        body: "A concise unit description.",
        cites: { observations: ["obs_fixture_0001"], claims: [], relations: [], dossiers: [] },
      }],
    };
    write(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    write("scratch/commentary/outline-guidance/fixture.md", "# Revision\n\nResegment at complete turns.\n");
    write("scratch/commentary/outline-guidance/fixture.baseline", `${baselinePath}\n`);
    write("scratch/commentary/drafts/fixture/01-stale.json", "{}\n");
    expect(() => buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "outline",
      reviseOutline: true,
    })).toThrow("active draft artifacts");
    rmSync(join(root, "scratch/commentary/drafts/fixture/01-stale.json"));
    write("scratch/commentary/campaign-state/fixture/draft-01-stale.json", "{}\n");
    expect(() => buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "outline",
      reviseOutline: true,
    })).toThrow("active draft artifacts");
    rmSync(join(root, "scratch/commentary/campaign-state/fixture/draft-01-stale.json"));
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validOutline("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "outline",
      codexExecutable: executable,
      reviseOutline: true,
    });
    const job = manifest.jobs[0]!;
    expect(job.outline_replacement).toBe(true);
    expect(job.input_files.map((entry) => entry.path)).toContain("wiki/commentary/fixture.md");
    expect(job.serial_handoff[0]).toContain("outline-replace-preview");

    await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(() => importCommentaryOutline({ dialogue: "fixture", outlinePath: job.output_path })).toThrow(
      "Refusing to replace existing commentary blocks",
    );
    const preview = importCommentaryOutline({
      dialogue: "fixture",
      outlinePath: job.output_path,
      replaceSectionSkeleton: true,
    });
    expect(preview.applied).toBe(false);
    expect(preview.sectionIds).toEqual(["comm_fixture_0001", "comm_fixture_0002"]);

    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const ledgerBefore = readFileSync(ledgerPath, "utf8");
    writeFileSync(ledgerPath, `${ledgerBefore}\n`, "utf8");
    expect(() => importCommentaryOutline({
      dialogue: "fixture",
      outlinePath: job.output_path,
      replaceSectionSkeleton: true,
    })).toThrow("not the current content-addressed revision job");
    writeFileSync(ledgerPath, ledgerBefore, "utf8");

    const turnsPath = join(root, turnIndexPath("fixture"));
    const turnsBefore = readFileSync(turnsPath, "utf8");
    writeFileSync(turnsPath, `${turnsBefore}\n`, "utf8");
    expect(() => importCommentaryOutline({
      dialogue: "fixture",
      outlinePath: job.output_path,
      replaceSectionSkeleton: true,
    })).toThrow("not the current content-addressed revision job");
    writeFileSync(turnsPath, turnsBefore, "utf8");

    write("scratch/commentary/drafts/fixture/01-stale.json", "{}\n");
    expect(() => importCommentaryOutline({
      dialogue: "fixture",
      outlinePath: job.output_path,
      replaceSectionSkeleton: true,
    })).toThrow("active draft artifacts exist");
    rmSync(join(root, "scratch/commentary/drafts/fixture/01-stale.json"));

    const applied = importCommentaryOutline({
      dialogue: "fixture",
      outlinePath: job.output_path,
      replaceSectionSkeleton: true,
      apply: true,
    });
    expect(applied.applied).toBe(true);
    expect(readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8")).toBe(preview.prospectiveLedger);
    expect(existsSync(join(root, "scratch/commentary/briefs/fixture"))).toBe(false);
  });

  it("builds one deterministic read-only quality-audit job per accepted-ledger section", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    const canonicalBefore = readFileSync(ledgerPath, "utf8");

    const [brief] = buildCommentaryAuditBriefs("accepted");
    expect(brief).toMatchObject({
      unitKey: "01-2a-3b",
      sectionId: "comm_accepted_0001",
      commentaryIds: ["comm_accepted_0001", "comm_accepted_0002"],
      inputPaths: expect.arrayContaining([
        "docs/commentary-protocol.md",
        "wiki/observations/accepted.md",
        "raw/plato/greek/accepted.txt",
        "raw/plato/english/accepted.txt",
      ]),
    });
    expect(brief?.content).toContain("audited_content_sha256:");
    expect(brief?.content).toContain("audit_contract_sha256:");
    expect(brief?.content).toContain("# Commentary quality-audit contract");
    expect(brief?.content).toContain("{2a} alpha {2b} beta {3a} gamma {3b} delta");
    expect(brief?.content).toContain("{2a} first. {2b} second.\n{3a} third. {3b} fourth.");
    expect(brief?.content).toContain("observation_id: obs_accepted_0001");
    expect(brief?.content).toContain("commentary_id: comm_accepted_0002");

    const written = writeCommentaryAuditBriefs("accepted");
    expect(written).toHaveLength(1);
    expect(readFileSync(join(root, written[0]!.path), "utf8")).toBe(brief?.content);
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);

    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    expect(manifest.jobs).toHaveLength(1);
    const [job] = manifest.jobs;
    expect(job).toMatchObject({
      schema_version: 3,
      job_id: "audit:accepted:01-2a-3b",
      stage: "audit",
      model_argument: "gpt-5.6-luna",
      authoring_model: "gpt-5.6-luna",
      effort: "medium",
      commentary_ids: ["comm_accepted_0001", "comm_accepted_0002"],
      audit_brief_sha256: brief?.sha256,
      audit_brief_path: "scratch/commentary/audit-briefs/accepted/01-2a-3b.md",
      output_path: "scratch/commentary/audits/accepted/01-2a-3b.json",
      state_path: "scratch/commentary/campaign-state/accepted/audit-01-2a-3b.json",
    });
    expect(job?.command.args.slice(0, 10)).toEqual([
      "exec", "--model", "gpt-5.6-luna", "-c", "model_reasoning_effort=medium",
      "--sandbox", "read-only", "--ephemeral", "--json", "--output-schema",
    ]);
    expect(job?.prompt).toContain("Existing acceptance is provenance, not a quality presumption");
    expect(job?.prompt).toContain("Set schema_version to 3");
    expect(job?.prompt).toContain("Check evidence, exact playback placement, and listening quality independently");
    expect(job?.prompt).toContain("actor, object, scope, modality, quantifier, time, grammatical referent");
    expect(job?.prompt).toContain("use only each block's Exact English playback insertion edge");
    expect(job?.prompt).toContain("checks.placement.hazard_codes");
    expect(job?.prompt).toContain("question_answer_split");
    expect(job?.prompt).toContain("semantic_anchor_displacement");
    expect(job?.prompt).toContain("requires disposition remove");
    expect(job?.prompt).toContain("exactly one concrete summary rationale per block, at or below 180 characters");
    expect(job?.prompt).toContain("never output clipped or malformed prose");
    expect(job?.prompt).toContain("Do not write replacement prose");
    expect(job?.serial_handoff[0]).toContain("No canonical apply command");
    expect(job?.serial_handoff[1]).toBe(
      "bun scripts/commentary/commentary-campaign.ts status --write",
    );
    expect(job?.serial_handoff[2]).toContain("delegated-audit-preview");

    const planned = await runCommentaryCampaign(manifest);
    expect(planned[0]?.status).toBe("planned");
    expect(existsSync(join(root, job!.output_path))).toBe(false);
    expect(existsSync(join(root, job!.state_path))).toBe(false);
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);
  });

  it("builds byte-identical briefs from one operation-scoped evidence snapshot", () => {
    for (const dialogue of ["first", "second"]) {
      writeDialogue(dialogue);
      writeAcceptedLedger(dialogue);
    }
    const evidence = buildCommentaryAuditEvidenceSnapshot();

    for (const dialogue of ["first", "second"]) {
      const expected = buildCommentaryAuditBriefs(dialogue, evidence);
      expect(expected).toEqual(buildCommentaryAuditBriefs(dialogue));
      expect(buildCommentaryAuditBriefsFromSnapshot(dialogue, {
        ledgerContent: readFileSync(join(root, `wiki/commentary/${dialogue}.md`), "utf8"),
        protocolContent: readFileSync(join(root, "docs/commentary-protocol.md"), "utf8"),
        evidence,
      })).toEqual(expected);
    }
  });

  it("skips audit context for mature ledgers when audit and rewrite stages are excluded", () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");

    for (const stage of ["outline", "draft"] as const) {
      const plan = buildCommentaryCampaignPlan({ dialogue: "accepted", stage });
      expect(plan.manifest.jobs).toEqual([]);
      expect(plan.auditEvidence).toBeUndefined();
    }
  });

  it("retains rejected ledger blocks as provenance but excludes them from campaign acceptance and audits", () => {
    writeDialogue("accepted");
    const rejectedBody = "Notice the structure of this exchange.";
    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-3b", "accepted"),
        "",
        noticeBlock("accepted", "comm_accepted_0002", "2a", "accepted"),
        "",
        noticeBlock("accepted", "comm_accepted_0003", "3a", "rejected").replace(
          rejectedBody,
          "Rejected provenance that must not enter an audit handoff.",
        ),
        "",
      ].join("\n"),
    );

    const [brief] = buildCommentaryAuditBriefs("accepted");
    expect(brief?.commentaryIds).toEqual(["comm_accepted_0001", "comm_accepted_0002"]);
    expect(brief?.content).not.toContain("comm_accepted_0003");
    expect(brief?.content).not.toContain("Rejected provenance that must not enter an audit handoff.");

    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    expect(manifest.jobs).toHaveLength(1);
    expect(manifest.jobs[0]?.commentary_ids).toEqual(["comm_accepted_0001", "comm_accepted_0002"]);
    const report = buildCommentaryCampaignStatusReport({
      manifest,
      auth: { logged_in: false, auth_method: "none", api_provider: "openai" },
      expectedDialogues: 1,
    });
    expect(report.dialogues[0]).toMatchObject({
      ledger: "accepted",
      stage: "accepted",
      quality_audit_required_count: 1,
    });
  });

  it("keeps rejected sections in the audit scaffold while excluding their content", () => {
    writeDialogue("accepted");
    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-2a", "rejected").replace(
          "A concise unit description.",
          "Rejected first-section prose must not enter the audit handoff.",
        ),
        "",
        sectionBlock("accepted", "comm_accepted_0002", "2b-3a", "rejected").replace(
          "A concise unit description.",
          "Rejected middle-section prose must not enter the audit handoff.",
        ),
        "",
        sectionBlock("accepted", "comm_accepted_0003", "3b-3b", "accepted"),
        "",
        noticeBlock("accepted", "comm_accepted_0004", "2a"),
        "",
        noticeBlock("accepted", "comm_accepted_0005", "2b"),
        "",
      ].join("\n"),
    );

    const briefs = buildCommentaryAuditBriefs("accepted");
    expect(briefs.map((brief) => [brief.unitKey, brief.sectionId, brief.commentaryIds])).toEqual([
      ["01-2a-2a", "comm_accepted_0001", ["comm_accepted_0004"]],
      ["02-2b-3a", "comm_accepted_0002", ["comm_accepted_0005"]],
      ["03-3b-3b", "comm_accepted_0003", ["comm_accepted_0003"]],
    ]);
    expect(briefs[0]?.content).not.toContain("Rejected first-section prose must not enter the audit handoff.");
    expect(briefs[1]?.content).not.toContain("Rejected middle-section prose must not enter the audit handoff.");
    expect(briefs[0]?.content).toContain("Notice the structure of this exchange.");
    expect(briefs[1]?.content).toContain("Notice the structure of this exchange.");

    write(
      "scratch/commentary/briefs/accepted/01-2a-2a.md",
      "# Brief 1\n\n- section: comm_accepted_0001\n- span: 2a-2a\n",
    );
    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    const report = buildCommentaryCampaignStatusReport({
      manifest,
      auth: { logged_in: false, auth_method: "none", api_provider: "openai" },
      expectedDialogues: 1,
    });
    expect(report.dialogues[0]).toMatchObject({
      stage: "accepted",
      section_count: 3,
      quality_audit_required_count: 3,
    });
  });

  it("keeps an audit job for active non-section prose under an all-rejected section scaffold", () => {
    writeDialogue("accepted");
    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-3b", "rejected"),
        "",
        noticeBlock("accepted", "comm_accepted_0002", "2a", "accepted"),
        "",
      ].join("\n"),
    );

    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    expect(manifest.jobs).toHaveLength(1);
    expect(manifest.jobs[0]).toMatchObject({
      job_id: "audit:accepted:01-2a-3b",
      commentary_ids: ["comm_accepted_0002"],
      section_id: "comm_accepted_0001",
    });
  });

  it("preserves sibling audit jobs when a section is structurally removed", () => {
    writeDialogue("accepted");
    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-2b", "accepted"),
        "",
        sectionBlock("accepted", "comm_accepted_0002", "3a-3b", "accepted"),
        "",
      ].join("\n"),
    );
    const before = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    const beforeSibling = before.jobs.find((job) => job.unit_key === "02-3a-3b");
    expect(beforeSibling).toBeDefined();

    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-2b", "rejected"),
        "",
        sectionBlock("accepted", "comm_accepted_0002", "3a-3b", "accepted"),
        "",
      ].join("\n"),
    );
    const after = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    const afterSibling = after.jobs.find((job) => job.unit_key === "02-3a-3b");
    expect(afterSibling).toMatchObject({
      job_id: beforeSibling?.job_id,
      unit_key: "02-3a-3b",
      input_sha256: beforeSibling?.input_sha256,
      audit_brief_sha256: beforeSibling?.audit_brief_sha256,
      commentary_ids: ["comm_accepted_0002"],
    });
  });

  it("accepts an exhaustive zero-block pass for an empty structural unit", () => {
    writeDialogue("accepted");
    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-2b", "rejected"),
        "",
        sectionBlock("accepted", "comm_accepted_0002", "3a-3b", "accepted"),
        "",
      ].join("\n"),
    );
    const [emptyBrief] = buildCommentaryAuditBriefs("accepted");
    expect(emptyBrief?.commentaryIds).toEqual([]);
    expect(parseCommentaryQualityAudit({
      schema_version: 3,
      dialogue: "accepted",
      unit_key: emptyBrief?.unitKey,
      section_id: emptyBrief?.sectionId,
      authoring: {
        model: COMMENTARY_AUTHORING_MODEL,
        effort: COMMENTARY_STAGE_EFFORT.audit,
      },
      unit_verdict: "pass",
      blocks: [],
    }, { expectedCommentaryIds: [] }).blocks).toEqual([]);
  });

  it("audits every section when only some sections contain non-section interruptions", () => {
    writeDialogue("accepted");
    write(
      "wiki/commentary/accepted.md",
      [
        "# accepted",
        "",
        sectionBlock("accepted", "comm_accepted_0001", "2a-2b", "accepted"),
        "",
        sectionBlock("accepted", "comm_accepted_0002", "3a-3b", "accepted"),
        "",
        noticeBlock("accepted", "comm_accepted_0003", "2a"),
        "",
      ].join("\n"),
    );

    const briefs = buildCommentaryAuditBriefs("accepted");
    expect(briefs.map((brief) => [brief.unitKey, brief.commentaryIds])).toEqual([
      ["01-2a-2b", ["comm_accepted_0001", "comm_accepted_0003"]],
      ["02-3a-3b", ["comm_accepted_0002"]],
    ]);
    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    expect(manifest.jobs.map((job) => job.job_id)).toEqual([
      "audit:accepted:01-2a-2b",
      "audit:accepted:02-3a-3b",
    ]);
    const allStages = buildCommentaryCampaignManifest({ dialogue: "accepted" });
    expect(allStages.jobs.map((job) => [job.stage, job.job_id])).toEqual([
      ["audit", "audit:accepted:01-2a-2b"],
      ["audit", "audit:accepted:02-3a-3b"],
    ]);
  });

  it("selects an exact single-dialogue audit batch in canonical manifest order", () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });

    const selected = selectCommentaryCampaignJobs(manifest, {
      dialogue: "accepted",
      stage: "audit",
      unitKeys: ["02-3a-3b", "01-2a-2b"],
    });
    expect(selected.map((job) => job.job_id)).toEqual([
      "audit:accepted:01-2a-2b",
      "audit:accepted:02-3a-3b",
    ]);
    expect(() => selectCommentaryCampaignJobs(manifest, {
      dialogue: "accepted",
      stage: "audit",
      unitKeys: ["01-2a-2b", "01-2a-2b"],
    })).toThrow("must be unique");
    expect(() => selectCommentaryCampaignJobs(manifest, {
      dialogue: "accepted",
      stage: "audit",
      unitKeys: ["03-4a-4b"],
    })).toThrow("No current audit job for accepted/03-4a-4b");
  });

  it("is dry-run by default and never probes auth or writes", async () => {
    writeDialogue("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: false, authMethod: "none", apiProvider: "openai" },
      { structured_output: validOutline("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });

    const results = await runCommentaryCampaign(manifest, { codexExecutable: executable, env });

    expect(results).toEqual([
      {
        job_id: manifest.jobs[0]!.job_id,
        output_path: manifest.jobs[0]!.output_path,
        status: "planned",
      },
    ]);
    expect(existsSync(join(root, "fake-codex.log"))).toBe(false);
    expect(existsSync(join(root, manifest.jobs[0]!.output_path))).toBe(false);
    expect(existsSync(join(root, "scratch/commentary/campaign-state"))).toBe(false);
  });

  it("preflights every selected unit without failing fast or calling the provider", async () => {
    writeDialogue("fixture");
    writeAcceptedLedger("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true },
      { structured_output: validAudit("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "audit",
      codexExecutable: executable,
    });
    const job = manifest.jobs[0]!;

    expect(buildCommentaryCampaignPreflightReport({ manifest })).toMatchObject({
      job_count: 1,
      totals: { current: 0, missing: 1, stale: 0, malformed: 0, mechanical_fail: 0, semantic_fail: 0 },
      jobs: [{ classification: "missing", requires_paid_execution: true, requires_retry: false }],
    });
    expect(existsSync(join(root, "fake-codex.log"))).toBe(false);

    await runCommentaryCampaign(manifest, {
      execute: true,
      concurrency: 1,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(buildCommentaryCampaignPreflightReport({ manifest }).jobs[0]).toMatchObject({
      classification: "current",
      source: "scratch",
      requires_paid_execution: false,
    });

    const statePath = join(root, job.state_path);
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    write(job.state_path, `${JSON.stringify({ ...state, input_sha256: "b".repeat(64) }, null, 2)}\n`);
    expect(buildCommentaryCampaignPreflightReport({ manifest }).jobs[0]).toMatchObject({
      classification: "stale",
      requires_retry: true,
    });

    write(job.state_path, `${JSON.stringify(state, null, 2)}\n`);
    write(job.output_path, "{}\n");
    expect(buildCommentaryCampaignPreflightReport({ manifest }).jobs[0]).toMatchObject({
      classification: "malformed",
      requires_retry: true,
    });

    const archived = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "audit",
      unitKey: job.unit_key!,
      codexExecutable: executable,
    });
    expect(archived.outputArchivePath).toBeDefined();
    expect(archived.stateArchivePath).toBeDefined();
    expect(archived.telemetryArchivePath).toBeDefined();
    env.FAKE_CODEX_RESPONSE_JSON = codexSuccessJsonl(validAudit("fixture", "rewrite"));
    await runCommentaryCampaign(manifest, {
      execute: true,
      concurrency: 1,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(buildCommentaryCampaignPreflightReport({ manifest }).jobs[0]).toMatchObject({
      classification: "semantic_fail",
      requires_paid_execution: false,
      next_action: expect.stringContaining("--stage rewrite"),
    });
  });

  it("blocks paid audit work when deterministic listener-prose checks fail", async () => {
    writeDialogue("fixture");
    writeAcceptedLedger("fixture");
    const ledgerPath = "wiki/commentary/fixture.md";
    write(
      ledgerPath,
      readFileSync(join(root, ledgerPath), "utf8").replace(
        "Notice the structure of this exchange.",
        "The internal claim claim_fixture_0001 proves this point.",
      ),
    );
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "audit" });
    expect(buildCommentaryCampaignPreflightReport({ manifest }).jobs[0]).toMatchObject({
      classification: "mechanical_fail",
      requires_paid_execution: false,
      detail: expect.stringContaining("claim_fixture_0001"),
    });

    const calls: string[] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      calls.push(args[0]!);
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      throw new Error("unexpected paid provider call");
    };
    await expect(runCommentaryCampaign(manifest, {
      execute: true,
      concurrency: 1,
      commandRunner,
    })).rejects.toThrow("exposes internal record ids");
    expect(calls).toEqual([]);
  });

  it("fails auth before generation or filesystem writes", async () => {
    writeDialogue("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: false, authMethod: "none", apiProvider: "openai" },
      { structured_output: validOutline("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });

    await expect(
      runCommentaryCampaign(manifest, { execute: true, codexExecutable: executable, env, commandRunner: fakeCommandRunner }),
    ).rejects.toThrow("Codex auth preflight failed");

    expect(readFileSync(join(root, "fake-codex.log"), "utf8").trim()).toBe("login status");
    expect(existsSync(join(root, manifest.jobs[0]!.output_path))).toBe(false);
    expect(existsSync(join(root, manifest.jobs[0]!.state_path))).toBe(false);
  });

  it("requires a finite paid-job cap for multi-job execution before version or auth", async () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    const calls: string[][] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      calls.push(args);
      throw new Error("unexpected Codex call");
    };

    await expect(runCommentaryCampaign(manifest, {
      execute: true,
      concurrency: 2,
      commandRunner,
    })).rejects.toThrow("requires finite maxNewJobs");
    expect(calls).toEqual([]);
    for (const job of manifest.jobs) {
      expect(existsSync(join(root, job.output_path))).toBe(false);
      expect(existsSync(join(root, job.state_path))).toBe(false);
    }
  });

  it("fails closed on a Codex CLI version mismatch before auth or generation", async () => {
    writeDialogue("fixture");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" });
    const calls: string[][] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      calls.push(args);
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.146.0", stderr: "" };
      throw new Error("unexpected post-version call");
    };

    await expect(
      runCommentaryCampaign(manifest, { execute: true, concurrency: 1, commandRunner }),
    ).rejects.toThrow("requires codex-cli 0.147.0; found 0.146.0");
    expect(calls).toEqual([["--version"]]);
    expect(existsSync(join(root, manifest.jobs[0]!.output_path))).toBe(false);
    expect(existsSync(join(root, manifest.jobs[0]!.state_path))).toBe(false);
  });

  it("rejects aliased campaign artifacts before auth or provider work", async () => {
    writeDialogue("fixture");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" });
    const original = manifest.jobs[0]!;
    const alias = structuredClone(original);
    alias.job_id = `${original.job_id}:alias`;
    let commandCalls = 0;
    const commandRunner: CommentaryCampaignCommandRunner = async () => {
      commandCalls += 1;
      throw new Error("unexpected command");
    };

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        jobs: [original, alias],
        commandRunner,
      }),
    ).rejects.toThrow("artifact path collision");

    expect(commandCalls).toBe(0);
  });

  it("rejects altered Codex arguments before auth or provider work", async () => {
    writeDialogue("fixture");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" });
    const altered = structuredClone(manifest.jobs[0]!);
    altered.command.args[altered.command.args.length - 1] = "A substituted prompt.";
    let commandCalls = 0;
    const commandRunner: CommentaryCampaignCommandRunner = async () => {
      commandCalls += 1;
      throw new Error("unexpected command");
    };

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        jobs: [altered],
        commandRunner,
      }),
    ).rejects.toThrow("noncanonical Codex arguments");

    expect(commandCalls).toBe(0);
  });

  it("revalidates every selected input after auth and before provider work", async () => {
    writeDialogue("fixture");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" });
    const calls: string[] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      calls.push(args[0]!);
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") {
        write(
          "packages/harness/src/commentary-luna-model-catalog.json",
          `${readFileSync(join(root, "packages/harness/src/commentary-luna-model-catalog.json"), "utf8")}\n`,
        );
        return { exitCode: 0, stdout: "Logged in", stderr: "" };
      }
      throw new Error("unexpected provider execution");
    };

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        concurrency: 1,
        commandRunner,
      }),
    ).rejects.toThrow("Refusing stale campaign input packages/harness/src/commentary-luna-model-catalog.json");

    expect(calls).toEqual(["--version", "login"]);
  });

  it("rebuilds a pending unit after auth and rejects canonical commentary drift before provider work", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const plan = buildCommentaryCampaignPlan({ dialogue: "accepted", stage: "audit" });
    const calls: string[] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      calls.push(args[0]!);
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") {
        const ledgerPath = "wiki/commentary/accepted.md";
        write(
          ledgerPath,
          readFileSync(join(root, ledgerPath), "utf8").replace(
            "A concise unit description.",
            "A changed unit description.",
          ),
        );
        return { exitCode: 0, stdout: "Logged in", stderr: "" };
      }
      throw new Error("unexpected provider execution");
    };

    await expect(
      runCommentaryCampaignPlan(plan, {
        execute: true,
        concurrency: 1,
        commandRunner,
      }),
    ).rejects.toThrow("Refusing stale quality-audit brief");

    expect(calls).toEqual(["--version", "login"]);
  });

  it("records an exact monthly-spend block without touching job artifacts and invalidates it after drift or success", async () => {
    writeDialogue("fixture");
    writeSkeleton("fixture");
    const executable = fakeCodex();
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    const job = manifest.jobs[0]!;
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const ledgerBefore = readFileSync(ledgerPath, "utf8");
    const auth = { logged_in: true, auth_method: "codex", api_provider: "openai" };
    const authResult = {
      exitCode: 0,
      stdout: "Logged in",
      stderr: "",
    };
    const quotaPayload = JSON.stringify([
      { type: "system", subtype: "init", session_id: "not-provider-evidence" },
      {
        type: "result",
        subtype: "error_during_execution",
        is_error: true,
        terminal_reason: "billing_error",
        result: "You've hit your monthly spend limit. request credential private-token",
      },
    ]);
    const quotaRunner: CommentaryCampaignCommandRunner = async (_executable, args) => (
      args[0] === "--version"
        ? { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" }
        : args[0] === "login"
        ? authResult
        : { exitCode: 0, stdout: quotaPayload, stderr: "non-JSON CLI warning" }
    );

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        concurrency: 1,
        codexExecutable: executable,
        commandRunner: quotaRunner,
      }),
    ).rejects.toThrow("monthly spend limit");

    expect(existsSync(join(root, job.output_path))).toBe(false);
    expect(existsSync(join(root, job.state_path))).toBe(false);
    expect(readFileSync(ledgerPath, "utf8")).toBe(ledgerBefore);
    const blockPath = join(root, "scratch/commentary/luna-provider-block.json");
    const blockContent = readFileSync(blockPath, "utf8");
    expect(blockContent).not.toContain("private-token");
    expect(JSON.parse(blockContent)).toMatchObject({
      schema_version: 2,
      campaign: "plato-commentary-gpt-5-6-luna",
      kind: "monthly_spend_limit",
      auth_method: "codex",
      api_provider: "openai",
      job_id: job.job_id,
      stage: "draft",
      input_sha256: job.input_sha256,
      output_schema_sha256: job.output_schema_sha256,
      exit_code: 0,
      response_sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      diagnostic: expect.stringContaining("monthly spend limit"),
    });

    const blocked = readLunaProviderAccessStatus({ auth, manifest });
    expect(blocked).toMatchObject({
      status: "provider_quota_blocked",
      reason: "monthly_spend_limit",
      evidence_path: "scratch/commentary/luna-provider-block.json",
      job_id: job.job_id,
      input_sha256: job.input_sha256,
    });
    const blockedReport = buildCommentaryCampaignStatusReport({
      manifest,
      auth,
      providerAccess: blocked,
      expectedDialogues: 1,
    });
    expect(blockedReport.provider_access.status).toBe("provider_quota_blocked");
    expect(blockedReport.dialogues[0]?.execution).toBe("provider_quota_blocked");

    write(
      "scratch/commentary/briefs/fixture/01-2a-3b.md",
      `${readFileSync(join(root, "scratch/commentary/briefs/fixture/01-2a-3b.md"), "utf8")}A revised brief.\n`,
    );
    const changedManifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    expect(readLunaProviderAccessStatus({ auth, manifest: changedManifest })).toMatchObject({
      status: "provider_block_stale",
      reason: "failed_job_input_changed",
      job_id: job.job_id,
    });

    const malformedRunner: CommentaryCampaignCommandRunner = async (_executable, args) => (
      args[0] === "--version"
        ? { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" }
        : args[0] === "login"
        ? authResult
        : { exitCode: 0, stdout: codexSuccessJsonl([]), stderr: "" }
    );
    const archivedQuotaAttempt = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "draft",
      unitKey: changedManifest.jobs[0]!.unit_key!,
      codexExecutable: executable,
    });
    expect(archivedQuotaAttempt.telemetryArchivePath).toBeDefined();
    await expect(
      runCommentaryCampaign(changedManifest, {
        execute: true,
        concurrency: 1,
        codexExecutable: executable,
        commandRunner: malformedRunner,
      }),
    ).rejects.toThrow("must be an object");
    expect(existsSync(blockPath)).toBe(true);
    expect(existsSync(join(root, changedManifest.jobs[0]!.output_path))).toBe(false);
    expect(existsSync(join(root, changedManifest.jobs[0]!.state_path))).toBe(false);

    const archivedMalformedAttempt = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "draft",
      unitKey: changedManifest.jobs[0]!.unit_key!,
      codexExecutable: executable,
    });
    expect(archivedMalformedAttempt.telemetryArchivePath).toBeDefined();

    const successRunner: CommentaryCampaignCommandRunner = async (_executable, args) => (
      args[0] === "--version"
        ? { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" }
        : args[0] === "login"
        ? authResult
        : {
            exitCode: 0,
            stdout: codexSuccessJsonl(validDraft("fixture")),
            stderr: "",
          }
    );
    const [generated] = await runCommentaryCampaign(changedManifest, {
      execute: true,
      concurrency: 1,
      codexExecutable: executable,
      commandRunner: successRunner,
    });
    expect(generated?.status).toBe("generated");
    expect(existsSync(blockPath)).toBe(false);
    expect(readLunaProviderAccessStatus({ auth, manifest: changedManifest })).toEqual({
      status: "auth_ready",
      reason: "no_provider_quota_block_observed",
    });
  });

  it("preserves a concurrent quota marker and stops scheduling new work after detection", async () => {
    for (const dialogue of ["a", "b", "c"]) writeDialogue(dialogue);
    const executable = fakeCodex();
    const manifest = buildCommentaryCampaignManifest({ stage: "outline", codexExecutable: executable });
    const auth = { logged_in: true, auth_method: "codex", api_provider: "openai" };
    const authResult = {
      exitCode: 0,
      stdout: "Logged in",
      stderr: "",
    };
    const quotaPayload = JSON.stringify([
      {
        type: "result",
        subtype: "error_during_execution",
        is_error: true,
        terminal_reason: "billing_error",
        result: "You've hit your monthly spend limit.",
      },
    ]);
    const blockPath = join(root, "scratch/commentary/luna-provider-block.json");
    const generationCalls: string[] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_command, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return authResult;
      const job = manifest.jobs.find((candidate) =>
        candidate.command.args.length === args.length &&
        candidate.command.args.every((argument, index) => argument === args[index])
      )!;
      generationCalls.push(job.dialogue);
      if (job.dialogue === "a") return { exitCode: 0, stdout: "", stderr: quotaPayload };
      for (let attempt = 0; attempt < 100 && !existsSync(blockPath); attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      if (!existsSync(blockPath)) throw new Error("quota marker was not recorded before the sibling completed");
      return {
        exitCode: 0,
        stdout: codexSuccessJsonl(validOutline(job.dialogue)),
        stderr: "",
      };
    };

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        concurrency: 2,
        maxNewJobs: 3,
        codexExecutable: executable,
        commandRunner,
      }),
    ).rejects.toThrow("monthly spend limit");

    expect(generationCalls).toEqual(["a", "b"]);
    const [a, b, c] = manifest.jobs;
    expect(existsSync(join(root, a!.output_path))).toBe(false);
    expect(existsSync(join(root, a!.state_path))).toBe(false);
    expect(existsSync(join(root, b!.output_path))).toBe(true);
    expect(existsSync(join(root, b!.state_path))).toBe(true);
    expect(existsSync(join(root, c!.output_path))).toBe(false);
    expect(existsSync(join(root, c!.state_path))).toBe(false);
    expect(readLunaProviderAccessStatus({ auth, manifest })).toMatchObject({
      status: "provider_quota_blocked",
      reason: "monthly_spend_limit",
      job_id: a!.job_id,
    });
  });

  it("reports a bounded Codex API failure without dumping initialization events", async () => {
    writeDialogue("fixture");
    const executable = fakeCodex();
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") {
        return {
          exitCode: 0,
          stdout: "Logged in",
          stderr: "",
        };
      }
      return {
        exitCode: 1,
        stdout: "",
        stderr: JSON.stringify([
          { type: "system", subtype: "init", noisy: "x".repeat(4_000) },
          {
            type: "result",
            api_error_status: 529,
            terminal_reason: "api_error",
            result: "API Error: 529 Overloaded.",
          },
        ]),
      };
    };

    let failureMessage = "";
    try {
      await runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        commandRunner,
      });
    } catch (error) {
      failureMessage = String(error);
    }
    expect(failureMessage).toContain("Codex job outline:fixture:");
    expect(failureMessage).toContain(
      "API 529, api_error: API Error: 529 Overloaded.",
    );
    expect(failureMessage).not.toContain("noisy");
  });

  it("accepts strict Codex JSONL and summarizes malformed structured agent output", async () => {
    writeDialogue("fixture");
    const executable = fakeCodex();
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "outline",
      codexExecutable: executable,
    });
    const authResponse = {
      exitCode: 0,
      stdout: "Logged in",
      stderr: "",
    };
    let response = codexSuccessJsonl(validOutline("fixture"));
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => (
      args[0] === "--version"
        ? { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" }
        : args[0] === "login"
        ? authResponse
        : { exitCode: 0, stdout: response, stderr: "" }
    );

    const [generated] = await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      commandRunner,
    });
    expect(generated?.status).toBe("generated");

    writeDialogue("malformed");
    const malformedManifest = buildCommentaryCampaignManifest({
      dialogue: "malformed",
      stage: "outline",
      codexExecutable: executable,
    });
    response = codexSuccessJsonl([]);
    let failureMessage = "";
    try {
      await runCommentaryCampaign(malformedManifest, {
        execute: true,
        codexExecutable: executable,
        commandRunner,
      });
    } catch (error) {
      failureMessage = String(error);
    }
    expect(failureMessage).toContain("must be an object");
    expect(failureMessage).toContain('"type":"thread.started"');
    expect(failureMessage).toContain('"type":"turn.completed"');
  });

  it("auth-blocks accepted-ledger audits before creating audit artifacts", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    const canonicalBefore = readFileSync(ledgerPath, "utf8");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: false, authMethod: "none", apiProvider: "openai" },
      { structured_output: validAudit("accepted") },
    );
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    const [job] = manifest.jobs;

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("Codex auth preflight failed");

    expect(readFileSync(join(root, "fake-codex.log"), "utf8").trim()).toBe("login status");
    expect(existsSync(join(root, job!.output_path))).toBe(false);
    expect(existsSync(join(root, job!.state_path))).toBe(false);
    expect(existsSync(join(root, job!.audit_brief_path!))).toBe(false);
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);
  });

  it("generates a schema-bound unit draft, resumes exactly, and refuses stale inputs", async () => {
    writeDialogue("fixture");
    writeSkeleton("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validDraft("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    const job = manifest.jobs[0]!;

    const generated = await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      concurrency: 1,
      commandRunner: fakeCommandRunner,
    });
    expect(generated[0]?.status).toBe("generated");
    expect(JSON.parse(readFileSync(join(root, job.output_path), "utf8"))).toEqual(validDraft("fixture"));
    const state = JSON.parse(readFileSync(join(root, job.state_path), "utf8"));
    expect(state).toMatchObject({
      schema_version: 3,
      job_id: job.job_id,
      input_sha256: job.input_sha256,
      output_schema_sha256: job.output_schema_sha256,
      model_argument: "gpt-5.6-luna",
      codex_cli_version: job.codex_cli_version,
      model_catalog_path: job.model_catalog_path,
      model_catalog_sha256: job.model_catalog_sha256,
      authoring_model: "gpt-5.6-luna",
      effort: "medium",
      permission_mode: "read-only",
    });

    const resumed = await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(resumed[0]?.status).toBe("resumed");
    const logAfterResume = readFileSync(join(root, "fake-codex.log"), "utf8");
    expect(logAfterResume.match(/login status/gu)?.length).toBe(2);
    expect(logAfterResume.match(/--model gpt-5\.6-luna/gu)?.length).toBe(1);
    expect(logAfterResume).toContain("-c model_reasoning_effort=medium --sandbox read-only --ephemeral --json");

    const historicalFableLowState = {
      ...state,
      schema_version: 1,
      model_argument: "fable",
      authoring_model: "historical-fable-low",
      effort: "low",
    };
    write(job.state_path, `${JSON.stringify(historicalFableLowState, null, 2)}\n`);
    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("schema_version must be 3");
    write(job.state_path, `${JSON.stringify(state, null, 2)}\n`);

    write(
      "scratch/commentary/briefs/fixture/01-2a-3b.md",
      `${readFileSync(join(root, "scratch/commentary/briefs/fixture/01-2a-3b.md"), "utf8")}changed\n`,
    );
    const changedManifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    await expect(
      runCommentaryCampaign(changedManifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("state.input_sha256 does not match the current job");
    expect(readFileSync(join(root, job.output_path), "utf8")).toBe(`${JSON.stringify(validDraft("fixture"), null, 2)}\n`);
    expect(readFileSync(join(root, "fake-codex.log"), "utf8").match(/--model gpt-5.6-luna/gu)?.length).toBe(1);
  });

  it("archives a stale draft pair deterministically and regenerates without manual deletion", async () => {
    writeDialogue("fixture");
    writeSkeleton("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validDraft("fixture") },
    );
    const originalManifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    const originalJob = originalManifest.jobs[0]!;
    await runCommentaryCampaign(originalManifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    const originalOutput = readFileSync(join(root, originalJob.output_path), "utf8");
    const originalState = readFileSync(join(root, originalJob.state_path), "utf8");

    write(
      "scratch/commentary/briefs/fixture/01-2a-3b.md",
      `${readFileSync(join(root, "scratch/commentary/briefs/fixture/01-2a-3b.md"), "utf8")}A revised brief.\n`,
    );
    const changedManifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    await expect(
      runCommentaryCampaign(changedManifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("state.input_sha256 does not match the current job");

    const archived = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "draft",
      unitKey: "01-2a-3b",
      codexExecutable: executable,
    });
    expect(archived.outputArchivePath).toMatch(
      /^scratch\/commentary\/campaign-history\/fixture\/draft-01-2a-3b-[a-f0-9]{16}-retry-0001\.output\.json$/,
    );
    expect(archived.stateArchivePath).toMatch(
      /^scratch\/commentary\/campaign-history\/fixture\/draft-01-2a-3b-[a-f0-9]{16}-retry-0001\.state\.json$/,
    );
    expect(readFileSync(join(root, archived.outputArchivePath!), "utf8")).toBe(originalOutput);
    expect(readFileSync(join(root, archived.stateArchivePath!), "utf8")).toBe(originalState);
    expect(existsSync(join(root, originalJob.output_path))).toBe(false);
    expect(existsSync(join(root, originalJob.state_path))).toBe(false);

    const regenerated = await runCommentaryCampaign(changedManifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(regenerated[0]?.status).toBe("generated");
    expect(JSON.parse(readFileSync(join(root, changedManifest.jobs[0]!.state_path), "utf8"))).toMatchObject({
      input_sha256: changedManifest.jobs[0]!.input_sha256,
    });
  });

  it("keeps multi-unit retry execution archive-only", async () => {
    writeDialogue("fixture");
    writeTwoUnitSkeleton("fixture");
    const executable = fakeCodex();
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft", codexExecutable: executable });
    for (const job of manifest.jobs) {
      const env = fakeEnvironment(
        { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
        { structured_output: validDraft("fixture", {
          unitKey: job.unit_key,
          sectionId: job.section_id,
          anchor: job.unit_key === "01-2a-2b" ? "2b" : "3b",
        }) },
      );
      await runCommentaryCampaign(manifest, {
        execute: true,
        jobs: [job],
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      });
    }

    const codexCallsBefore = readFileSync(join(root, "fake-codex.log"), "utf8");
    const retry = runCommentaryCampaignRetryCommand([
      "fixture",
      "draft",
      "01-2a-2b",
      "02-3a-3b",
      "--execute",
    ], executable);
    const archived = retry.retries;

    expect(retry.archived).toBe(true);
    expect(retry.dry_run).toBe(false);
    expect(retry).not.toHaveProperty("jobs");
    expect(readFileSync(join(root, "fake-codex.log"), "utf8")).toBe(codexCallsBefore);
    expect(archived.map((entry) => entry.unitKey)).toEqual(["01-2a-2b", "02-3a-3b"]);
    for (const [index, result] of archived.entries()) {
      expect(result.outputArchivePath).toBeDefined();
      expect(result.stateArchivePath).toBeDefined();
      expect(existsSync(join(root, manifest.jobs[index]!.output_path))).toBe(false);
      expect(existsSync(join(root, manifest.jobs[index]!.state_path))).toBe(false);
    }
  });

  it("binds serial draft corrections only to their target unit and makes guidance edits require retry", async () => {
    writeDialogue("fixture");
    writeTwoUnitSkeleton("fixture");
    const executable = fakeCodex();
    const draft = validDraft("fixture", {
      unitKey: "01-2a-2b",
      sectionId: "comm_fixture_0001",
      anchor: "2b",
    });
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: draft },
    );
    const originalManifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    const originalTarget = originalManifest.jobs.find((job) => job.unit_key === "01-2a-2b")!;
    const originalSibling = originalManifest.jobs.find((job) => job.unit_key === "02-3a-3b")!;
    await runCommentaryCampaign(originalManifest, {
      execute: true,
      jobs: [originalTarget],
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    const firstRetry = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "draft",
      unitKey: "01-2a-2b",
      codexExecutable: executable,
    });
    expect(firstRetry.rerunCommand).toBe(
      "bun scripts/commentary/commentary-campaign.ts run --execute --dialogue fixture --stage draft --unit-key 01-2a-2b --max-new-jobs 1 --concurrency 1",
    );
    write(
      "scratch/commentary/draft-guidance/fixture/01-2a-2b.md",
      "# Binding correction\n\nKeep one useful distinction and remove the rejected recap.\n",
    );
    write(
      "scratch/commentary/draft-guidance/fixture/01-2a-2b.baseline",
      `${firstRetry.outputArchivePath!}\n`,
    );

    const correctedManifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    const correctedTarget = correctedManifest.jobs.find((job) => job.unit_key === "01-2a-2b")!;
    const correctedSibling = correctedManifest.jobs.find((job) => job.unit_key === "02-3a-3b")!;
    expect(correctedTarget.input_sha256).not.toBe(originalTarget.input_sha256);
    expect(correctedTarget.prompt).toContain("binding serial editorial feedback");
    expect(correctedTarget.prompt).toContain("rejected, noncanonical baseline");
    expect(correctedTarget.input_files.map((input) => input.path)).toEqual(expect.arrayContaining([
      "scratch/commentary/draft-guidance/fixture/01-2a-2b.md",
      "scratch/commentary/draft-guidance/fixture/01-2a-2b.baseline",
      firstRetry.outputArchivePath!,
      firstRetry.stateArchivePath!,
    ]));
    expect(correctedSibling.input_sha256).toBe(originalSibling.input_sha256);
    expect(correctedSibling.prompt_sha256).toBe(originalSibling.prompt_sha256);
    expect(correctedSibling.input_files).toEqual(originalSibling.input_files);

    await runCommentaryCampaign(correctedManifest, {
      execute: true,
      jobs: [correctedTarget],
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    write(
      "scratch/commentary/draft-guidance/fixture/01-2a-2b.md",
      "# Binding correction\n\nKeep the distinction, remove recap, and use fewer than eighty words.\n",
    );
    const editedManifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "draft",
      codexExecutable: executable,
    });
    const editedTarget = editedManifest.jobs.find((job) => job.unit_key === "01-2a-2b")!;
    const editedSibling = editedManifest.jobs.find((job) => job.unit_key === "02-3a-3b")!;
    expect(editedTarget.input_sha256).not.toBe(correctedTarget.input_sha256);
    expect(editedSibling.input_sha256).toBe(originalSibling.input_sha256);
    await expect(
      runCommentaryCampaign(editedManifest, {
        execute: true,
        jobs: [editedTarget],
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("state.input_sha256 does not match the current job");

    const secondRetry = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "draft",
      unitKey: "01-2a-2b",
      codexExecutable: executable,
    });
    expect(secondRetry.outputArchivePath).toBeDefined();
    expect(secondRetry.stateArchivePath).toBeDefined();
    const regenerated = await runCommentaryCampaign(editedManifest, {
      execute: true,
      jobs: [editedTarget],
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(regenerated[0]?.status).toBe("generated");
  });

  it("fails closed on unpaired or unverifiable draft-correction provenance", async () => {
    writeDialogue("fixture");
    writeSkeleton("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validDraft("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft", codexExecutable: executable });
    await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    const archived = prepareCommentaryCampaignRetry({
      dialogue: "fixture",
      stage: "draft",
      unitKey: "01-2a-3b",
      codexExecutable: executable,
    });
    const guidancePath = "scratch/commentary/draft-guidance/fixture/01-2a-3b.md";
    const pointerPath = "scratch/commentary/draft-guidance/fixture/01-2a-3b.baseline";
    write(guidancePath, "# Correct the rejected candidate.\n");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" })).toThrow(
      `Draft correction requires paired ${guidancePath} and ${pointerPath}`,
    );

    write(pointerPath, "scratch/commentary/drafts/fixture/01-2a-3b.json\n");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" })).toThrow(
      "must name a draft retry output",
    );
    write(pointerPath, `${archived.outputArchivePath!}\n`);
    const archivedState = readFileSync(join(root, archived.stateArchivePath!), "utf8");
    unlinkSync(join(root, archived.stateArchivePath!));
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" })).toThrow(
      "requires matching archived state",
    );

    write(archived.stateArchivePath!, archivedState);
    const tamperedState = JSON.parse(archivedState) as { input_sha256: string };
    tamperedState.input_sha256 = "a".repeat(64);
    write(archived.stateArchivePath!, `${JSON.stringify(tamperedState, null, 2)}\n`);
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" })).toThrow(
      "archived output/state pair hash does not match its retry filename",
    );

    write(archived.stateArchivePath!, archivedState);
    const archivedOutput = readFileSync(join(root, archived.outputArchivePath!), "utf8");
    write(archived.outputArchivePath!, `${archivedOutput}\n`);
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" })).toThrow(
      "archived state.output_sha256 does not match its rejected draft",
    );

    write(archived.outputArchivePath!, archivedOutput);
    expect(buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" }).jobs).toHaveLength(1);
    write("scratch/commentary/draft-guidance/fixture/not-a-current-unit.md", "# Orphan guidance\n");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "draft" })).toThrow(
      "Draft correction artifact does not name a current unit",
    );
  });

  it("generates and resumes a schema-bound audit, then refuses stale canonical hashes", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    const canonicalBefore = readFileSync(ledgerPath, "utf8");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validAudit("accepted") },
    );
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    const [job] = manifest.jobs;

    const generated = await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      concurrency: 1,
      commandRunner: fakeCommandRunner,
    });
    expect(generated[0]?.status).toBe("generated");
    expect(JSON.parse(readFileSync(join(root, job!.output_path), "utf8"))).toEqual(validAudit("accepted"));
    expect(readFileSync(join(root, job!.audit_brief_path!), "utf8")).toBe(buildCommentaryAuditBriefs("accepted")[0]!.content);
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);

    const resumed = await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(resumed[0]?.status).toBe("resumed");

    write(
      "wiki/commentary/accepted.md",
      canonicalBefore.replace("A concise unit description.", "A changed unit description."),
    );
    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("Refusing stale quality-audit brief");
    write("wiki/commentary/accepted.md", canonicalBefore);

    write(
      "docs/commentary-protocol.md",
      driftedCommentaryProtocolFixture("A stricter listening-quality bar."),
    );
    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("Refusing stale quality-audit brief");

    const changedManifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    await expect(
      runCommentaryCampaign(changedManifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("state.input_sha256 does not match the current job");
    expect(readFileSync(join(root, job!.output_path), "utf8")).toBe(`${JSON.stringify(validAudit("accepted"), null, 2)}\n`);
    expect(readFileSync(join(root, "fake-codex.log"), "utf8").match(/--model gpt-5.6-luna/gu)?.length).toBe(1);
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);
  });

  it("requires valid acceptance for unit-scoped canonical reuse and refuses later evidence drift", async () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const plan = buildCommentaryCampaignPlan({ dialogue: "accepted", stage: "audit" });
    const job = plan.manifest.jobs[0]!;
    const sibling = plan.manifest.jobs[1]!;
    const sampledCommentaryIds = plan.manifest.jobs.flatMap((candidate) => candidate.commentary_ids ?? []);
    const output = {
      schema_version: 3,
      dialogue: "accepted",
      unit_key: job.unit_key,
      section_id: job.section_id,
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      unit_verdict: "pass",
      blocks: job.commentary_ids!.map((commentaryId) => ({
        commentary_id: commentaryId,
        disposition: "pass",
        issue_codes: [],
        checks: auditChecks(),
        rationale: "The block earns its place in the listening sequence.",
      })),
    };
    const outputContent = `${JSON.stringify(output, null, 2)}\n`;
    const invalidSiblingOutput = { invalid: "sibling output" };
    const invalidSiblingOutputContent = `${JSON.stringify(invalidSiblingOutput, null, 2)}\n`;
    const digest = (content: string) => createHash("sha256").update(content).digest("hex");
    const reviewNotePath = "wiki/review/2026-07-13-commentary-quality-accepted-luna-sample.md";
    const ledgerPath = "wiki/commentary/accepted.md";
    const protocolPath = "docs/commentary-protocol.md";
    let canonicalManifest: Record<string, any> = {
      schema_version: 1,
      dialogue: "accepted",
      ledger: { path: ledgerPath, sha256: digest(readFileSync(join(root, ledgerPath), "utf8")) },
      protocol: { path: protocolPath, sha256: digest(readFileSync(join(root, protocolPath), "utf8")) },
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      units: [{
        unit_key: job.unit_key,
        section_id: job.section_id,
        audit_brief_sha256: job.audit_brief_sha256,
        output_path: job.output_path,
        output_sha256: digest(outputContent),
        output,
      }, {
        unit_key: sibling.unit_key,
        section_id: sibling.section_id,
        audit_brief_sha256: sibling.audit_brief_sha256,
        output_path: sibling.output_path,
        output_sha256: digest(invalidSiblingOutputContent),
        output: invalidSiblingOutput,
      }],
      acceptance: {
        decision: "accepted",
        review_note: { path: reviewNotePath, sha256: digest("# Invalid note\n") },
      } as Record<string, unknown>,
    };
    write(reviewNotePath, "# Invalid note\n");
    write("wiki/commentary-audits/accepted.json", `${JSON.stringify(canonicalManifest, null, 2)}\n`);
    expect(reusableCanonicalAuditOutput(job)).toBeUndefined();

    writeAcceptedCommentaryQualityAuditFixture({
      root,
      dialogue: "accepted",
      auditRationaleByCommentaryId: Object.fromEntries(
        sampledCommentaryIds.map((commentaryId) => [
          commentaryId,
          "The block earns its place in the listening sequence.",
        ]),
      ),
    });
    canonicalManifest = JSON.parse(
      readFileSync(join(root, "wiki/commentary-audits/accepted.json"), "utf8"),
    ) as Record<string, any>;
    for (const candidate of [job, sibling]) {
      rmSync(join(root, candidate.output_path), { force: true });
      rmSync(join(root, candidate.state_path), { force: true });
    }
    expect(reusableCanonicalAuditOutput(job)?.output).toEqual(output);
    expect(reusableCanonicalAuditOutput(sibling)?.output).toEqual(canonicalManifest.units[1]!.output);

    write(
      "wiki/commentary-audits/accepted.json",
      `${JSON.stringify({ ...canonicalManifest, legacy_manifest_alias: true }, null, 2)}\n`,
    );
    expect(reusableCanonicalAuditOutput(job)).toBeUndefined();

    const duplicateTargetManifest = structuredClone(canonicalManifest);
    duplicateTargetManifest.units[1] = structuredClone(duplicateTargetManifest.units[0]!);
    write("wiki/commentary-audits/accepted.json", `${JSON.stringify(duplicateTargetManifest, null, 2)}\n`);
    expect(reusableCanonicalAuditOutput(job)).toBeUndefined();

    const ledgerBeforeMalformedCheck = readFileSync(join(root, ledgerPath), "utf8");
    const malformedRejectedProvenance = noticeBlock(
      "accepted",
      "comm_accepted_0005",
      "3b",
      "rejected",
    ).replace("author: model", "legacy_alias: forbidden\nauthor: model");
    const malformedLedger = `${ledgerBeforeMalformedCheck.trimEnd()}\n\n${malformedRejectedProvenance}\n`;
    write(ledgerPath, malformedLedger);
    const malformedLedgerManifest = structuredClone(canonicalManifest);
    malformedLedgerManifest.ledger.sha256 = digest(malformedLedger);
    write("wiki/commentary-audits/accepted.json", `${JSON.stringify(malformedLedgerManifest, null, 2)}\n`);
    expect(reusableCanonicalAuditOutput(job)).toBeUndefined();
    write(ledgerPath, ledgerBeforeMalformedCheck);

    const siblingOutput = {
      schema_version: 3,
      dialogue: "accepted",
      unit_key: sibling.unit_key,
      section_id: sibling.section_id,
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      unit_verdict: "pass",
      blocks: sibling.commentary_ids!.map((commentaryId) => ({
        commentary_id: commentaryId,
        disposition: "pass",
        issue_codes: [],
        checks: auditChecks(),
        rationale: "The block earns its place in the listening sequence.",
      })),
    };
    const siblingOutputContent = `${JSON.stringify(siblingOutput, null, 2)}\n`;
    canonicalManifest.units[1]!.output = siblingOutput;
    canonicalManifest.units[1]!.output_sha256 = digest(siblingOutputContent);
    write("wiki/commentary-audits/accepted.json", `${JSON.stringify(canonicalManifest, null, 2)}\n`);

    const status = buildCommentaryCampaignStatusReport({
      manifest: plan.manifest,
      auth: { logged_in: false, auth_method: "none", api_provider: "openai" },
      expectedDialogues: 1,
    });
    expect(status.dialogues[0]).toMatchObject({
      quality_audit_status: "completed",
      quality_audit_passed_count: 2,
      completed_job_count: 2,
    });

    const mutationCases: Array<{
      path: string;
      mutate: (content: string) => string;
      invalidatesFreshReuse: boolean;
    }> = [
      {
        path: "wiki/commentary-audits/accepted.json",
        mutate: (content) => content.replace('"schema_version": 1', '"schema_version": 2'),
        invalidatesFreshReuse: true,
      },
      { path: ledgerPath, mutate: (content) => `${content}\n`, invalidatesFreshReuse: false },
      { path: protocolPath, mutate: (content) => `${content}\n`, invalidatesFreshReuse: false },
      { path: reviewNotePath, mutate: (content) => `${content}\n`, invalidatesFreshReuse: true },
    ];
    for (const mutation of mutationCases) {
      const before = readFileSync(join(root, mutation.path), "utf8");
      const operationReuse = createReusableCanonicalAuditOutputResolver();
      expect(operationReuse(job)?.output).toEqual(output);
      write(mutation.path, mutation.mutate(before));
      expect(operationReuse(sibling)?.output).toEqual(siblingOutput);
      const freshReuse = createReusableCanonicalAuditOutputResolver()(sibling);
      if (mutation.invalidatesFreshReuse) expect(freshReuse).toBeUndefined();
      else expect(freshReuse?.output).toEqual(siblingOutput);
      write(mutation.path, before);
    }

    write(protocolPath, driftedCommentaryProtocolFixture("Quality contract changed."));
    expect(createReusableCanonicalAuditOutputResolver()(job)).toBeUndefined();
    write(protocolPath, COMMENTARY_PROTOCOL_FIXTURE);

    let providerCalls = 0;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      providerCalls += 1;
      throw new Error("unexpected provider call");
    };

    const reused = await runCommentaryCampaignPlan(plan, { execute: true, jobs: [job, sibling], commandRunner });
    expect(reused.map((result) => result.status)).toEqual(["reused_canonical", "reused_canonical"]);

    const observationPath = "wiki/observations/accepted.md";
    write(observationPath, `${readFileSync(join(root, observationPath), "utf8")}\n`);
    const afterNonsemanticEvidenceWhitespace = await runCommentaryCampaignPlan(plan, {
      execute: true,
      jobs: [job],
      commandRunner,
    });
    expect(afterNonsemanticEvidenceWhitespace[0]?.status).toBe("reused_canonical");
    expect(providerCalls).toBe(0);
  });

  it("gives a current accepted canonical unit precedence over an older delegated receipt", () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const plan = buildCommentaryCampaignPlan({ dialogue: "accepted", stage: "audit" });
    const job = plan.manifest.jobs[0]!;
    const output = {
      schema_version: 3,
      dialogue: "accepted",
      unit_key: job.unit_key,
      section_id: job.section_id,
      authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
      unit_verdict: "pass",
      blocks: job.commentary_ids!.map((commentaryId) => ({
        commentary_id: commentaryId,
        disposition: "pass",
        issue_codes: [],
        checks: auditChecks(),
        rationale: "The older delegated receipt records this complete listening judgment.",
      })),
    };
    const canonicalOutput = structuredClone(output);
    canonicalOutput.blocks[0]!.rationale = "The accepted canonical unit records this newer judgment.";
    writeCommentaryAuditBriefs("accepted");
    const delegatedCandidatePath = "scratch/commentary/delegated-audits/accepted/01-2a-2b.json";
    write(delegatedCandidatePath, `${JSON.stringify({
      schema_version: 1,
      dialogue: "accepted",
      unit_key: job.unit_key,
      job: {
        job_id: job.job_id,
        input_sha256: job.input_sha256,
        audit_brief_path: job.audit_brief_path,
        audit_brief_sha256: job.audit_brief_sha256,
        output_path: job.output_path,
        output_schema_sha256: job.output_schema_sha256,
      },
      output,
      output_sha256: createHash("sha256").update(`${JSON.stringify(output, null, 2)}\n`).digest("hex"),
      provenance: {
        auditor: "fixture-delegated-luna-auditor-precedence",
        model: COMMENTARY_AUTHORING_MODEL,
        effort: COMMENTARY_STAGE_EFFORT.audit,
        source: "operator-delegated",
        human_listening_or_review: "none claimed",
      },
    }, null, 2)}\n`);
    const delegated = applyCommentaryDelegatedAudit({ job, candidatePath: delegatedCandidatePath });

    const digest = (content: string) => createHash("sha256").update(content).digest("hex");
    const manifestPath = "wiki/commentary-audits/accepted.json";
    const sibling = plan.manifest.jobs[1]!;
    writeAcceptedCommentaryQualityAuditFixture({
      root,
      dialogue: "accepted",
      auditRationaleByCommentaryId: Object.fromEntries([
        ...job.commentary_ids!.map((commentaryId, index) => [
          commentaryId,
          canonicalOutput.blocks[index]!.rationale,
        ]),
        ...sibling.commentary_ids!.map((commentaryId) => [
          commentaryId,
          canonicalOutput.blocks[0]!.rationale,
        ]),
      ]),
    });
    const accepted = JSON.parse(readFileSync(join(root, manifestPath), "utf8")) as Record<string, any>;
    expect(reusableCanonicalAuditOutput(job)?.output).toEqual(canonicalOutput);

    const omittedPointer = structuredClone(accepted);
    omittedPointer.units[0]!.output = output;
    omittedPointer.units[0]!.output_sha256 = digest(`${JSON.stringify(output, null, 2)}\n`);
    delete omittedPointer.units[0]!.provenance;
    expect(validateCommentaryQualityAuditManifest(manifestPath, JSON.stringify(omittedPointer)).map((issue) => issue.code)).toContain(
      "invalid_manifest_shape",
    );
    const mutatedPointer = structuredClone(accepted);
    mutatedPointer.units[0]!.output = output;
    mutatedPointer.units[0]!.output_sha256 = digest(`${JSON.stringify(output, null, 2)}\n`);
    mutatedPointer.units[0]!.provenance = {
      path: delegated.submissionRecordPath,
      sha256: "0".repeat(64),
    };
    expect(validateCommentaryQualityAuditManifest(manifestPath, JSON.stringify(mutatedPointer)).map((issue) => issue.code)).toContain(
      "invalid_manifest_shape",
    );

    write(job.output_path, "{}\n");
    write(job.state_path, "{}\n");
    const retryPreview = previewCommentaryCampaignRetries({
      dialogue: "accepted",
      stage: "audit",
      unitKeys: [job.unit_key!],
    });
    expect(retryPreview[0]?.outputArchivePath).toContain("campaign-history/accepted/audit-01-2a-2b-");
    const retry = prepareCommentaryCampaignRetry({
      dialogue: "accepted",
      stage: "audit",
      unitKey: job.unit_key!,
    });
    expect(existsSync(join(root, job.output_path))).toBe(false);
    expect(existsSync(join(root, job.state_path))).toBe(false);
    expect(existsSync(join(root, retry.outputArchivePath!))).toBe(true);
    expect(existsSync(join(root, retry.stateArchivePath!))).toBe(true);
  });

  it("injects the hash-bound quality excerpt and exact brief without file-read turns", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const manifest = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    const [job] = manifest.jobs;
    const brief = buildCommentaryAuditBriefs("accepted")[0]!;
    const calls: Array<{ args: string[]; stdin?: string }> = [];
    const response = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validAudit("accepted") },
    ).FAKE_CODEX_RESPONSE_JSON!;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args, _cwd, _env, stdin) => {
      calls.push({ args, ...(stdin === undefined ? {} : { stdin }) });
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      return { exitCode: 0, stdout: response, stderr: "" };
    };

    await runCommentaryCampaign(manifest, { execute: true, concurrency: 1, commandRunner });

    const execution = calls.find((call) => call.args[0] === "exec")!;
    expect(execution.stdin).toContain("COMMENTARY_QUALITY_AUDIT_INPUT_V2");
    expect(execution.stdin).toContain("## What commentary is\n\nUse accepted citations and apply the listening-quality bar.");
    expect(execution.stdin).not.toContain("Fixture record rules.");
    expect(execution.stdin).toContain(`brief_path: ${brief.path}`);
    expect(execution.stdin).toContain(`brief_sha256: ${brief.sha256}`);
    expect(execution.stdin?.match(/## What commentary is/gu)).toHaveLength(1);
    expect(execution.stdin).toContain(brief.content);
    expect(job!.prompt).toContain("Do not use tools or read workspace files");
    expect(job!.prompt).not.toContain("The only files you may read:");
    expect(execution.args).toContain("--output-schema");
  });

  it("materializes only the selected pending audit brief from the campaign plan", async () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const plan = buildCommentaryCampaignPlan({ dialogue: "accepted", stage: "audit" });
    const [first, second] = plan.manifest.jobs;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      const output = {
        schema_version: 3,
        dialogue: second!.dialogue,
        unit_key: second!.unit_key,
        section_id: second!.section_id,
        authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
        unit_verdict: "pass",
        blocks: second!.commentary_ids!.map((commentaryId) => ({
          commentary_id: commentaryId,
          disposition: "pass",
          issue_codes: [],
          checks: auditChecks(),
          rationale: "The block earns its place in the listening sequence.",
        })),
      };
      return {
        exitCode: 0,
        stdout: fakeEnvironment(
          { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
          { structured_output: output },
        ).FAKE_CODEX_RESPONSE_JSON!,
        stderr: "",
      };
    };

    const results = await runCommentaryCampaignPlan(plan, {
      execute: true,
      concurrency: 1,
      jobs: [second!],
      commandRunner,
    });

    expect(results[0]?.status).toBe("generated");
    expect(existsSync(join(root, first!.audit_brief_path!))).toBe(false);
    expect(existsSync(join(root, second!.audit_brief_path!))).toBe(true);
  });

  it("freezes every pending audit packet before launching the first provider process", async () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const plan = buildCommentaryCampaignPlan({ dialogue: "accepted", stage: "audit" });
    const manifest = plan.manifest;
    const expectedJobs = structuredClone(manifest.jobs);
    const expectedBriefs = buildCommentaryAuditBriefs("accepted");
    const packets: string[] = [];
    let generationCalls = 0;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args, _cwd, _env, stdin) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };

      const job = expectedJobs[generationCalls]!;
      generationCalls += 1;
      packets.push(stdin ?? "");
      if (generationCalls === 1) {
        manifest.jobs[1]!.job_id = manifest.jobs[0]!.job_id;
        manifest.jobs[1]!.output_path = manifest.jobs[0]!.output_path;
        manifest.jobs[1]!.command.args = manifest.jobs[0]!.command.args;
        const observationPath = "wiki/observations/accepted.md";
        write(
          observationPath,
          readFileSync(join(root, observationPath), "utf8").replace(
            "observation: A reported dialogue frame is present.",
            "observation: This changed after execution started.",
          ),
        );
      }
      const output = {
        schema_version: 3,
        dialogue: job.dialogue,
        unit_key: job.unit_key,
        section_id: job.section_id,
        authoring: { model: COMMENTARY_AUTHORING_MODEL, effort: COMMENTARY_STAGE_EFFORT.audit },
        unit_verdict: "pass",
        blocks: (job.commentary_ids ?? []).map((commentaryId) => ({
          commentary_id: commentaryId,
          disposition: "pass",
          issue_codes: [],
          checks: auditChecks(),
          rationale: "The block earns its place in the listening sequence.",
        })),
      };
      return {
        exitCode: 0,
        stdout: fakeEnvironment(
          { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
          { structured_output: output },
        ).FAKE_CODEX_RESPONSE_JSON!,
        stderr: "",
      };
    };

    const results = await runCommentaryCampaignPlan(plan, {
      execute: true,
      concurrency: 1,
      maxNewJobs: 2,
      commandRunner,
    });

    expect(results.map((result) => result.status)).toEqual(["generated", "generated"]);
    expect(generationCalls).toBe(2);
    expect(packets).toHaveLength(2);
    expect(packets.every((packet) => packet.includes("observation: A reported dialogue frame is present."))).toBe(true);
    expect(packets.some((packet) => packet.includes("This changed after execution started."))).toBe(false);
    expect(packets[0]).toContain(`brief_path: ${expectedBriefs[0]!.path}`);
    expect(packets[0]).toContain(expectedBriefs[0]!.commentaryIds.join(", "));
    expect(packets[1]).toContain(`brief_path: ${expectedBriefs[1]!.path}`);
    expect(packets[1]).toContain(expectedBriefs[1]!.commentaryIds.join(", "));
  });

  it("invalidates only the audit unit whose canonical commentary changed", () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const before = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    expect(before.jobs).toHaveLength(2);
    expect(before.jobs.every((job) =>
      job.input_files.every((entry) => entry.path !== "wiki/commentary/accepted.md")
    )).toBe(true);
    expect(new Set(before.jobs.map((job) => job.prompt)).size).toBe(1);

    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    const ledger = readFileSync(ledgerPath, "utf8");
    writeFileSync(
      ledgerPath,
      ledger.replace("A concise unit description.", "A revised first-unit description."),
      "utf8",
    );
    const after = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });

    expect(after.jobs[0]!.input_sha256).not.toBe(before.jobs[0]!.input_sha256);
    expect(after.jobs[0]!.audit_brief_sha256).not.toBe(before.jobs[0]!.audit_brief_sha256);
    expect(after.jobs[1]!.input_sha256).toBe(before.jobs[1]!.input_sha256);
    expect(after.jobs[1]!.audit_brief_sha256).toBe(before.jobs[1]!.audit_brief_sha256);
  });

  it("does not invalidate an audit when review bookkeeping flips", () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const before = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });
    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    writeFileSync(
      ledgerPath,
      readFileSync(ledgerPath, "utf8").replaceAll("review_status: accepted", "review_status: unreviewed"),
      "utf8",
    );
    const after = buildCommentaryCampaignManifest({ dialogue: "accepted", stage: "audit" });

    expect(after.jobs.map((job) => job.audit_brief_sha256)).toEqual(
      before.jobs.map((job) => job.audit_brief_sha256),
    );
    expect(after.jobs.map((job) => job.input_sha256)).toEqual(
      before.jobs.map((job) => job.input_sha256),
    );
  });

  it("turns a failed accepted-ledger audit into an isolated Luna-high rewrite with serial preview and apply", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    const originalNotice = noticeBlock("accepted", "comm_accepted_0002", "2a");
    const insertion = acceptedAudioInsertion("accepted", "turn_accepted_audio_0001", "after");
    const noticeWithInsertion = originalNotice.replace(
      `${sourceRefLines("accepted", "2a")}\n`,
      `${sourceRefLines("accepted", "2a")}\n${audioInsertionLines(insertion)}\n`,
    );
    writeFileSync(
      ledgerPath,
      readFileSync(ledgerPath, "utf8").replace(originalNotice, noticeWithInsertion),
      "utf8",
    );
    const canonicalBefore = readFileSync(ledgerPath, "utf8");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validAudit("accepted", "rewrite") },
    );
    const auditManifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    await runCommentaryCampaign(auditManifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    const auditJob = auditManifest.jobs[0]!;
    const auditState = JSON.parse(readFileSync(join(root, auditJob.state_path), "utf8")) as { output_sha256: string };

    const rewritePlan = buildCommentaryCampaignPlan({
      dialogue: "accepted",
      stage: "rewrite",
      codexExecutable: executable,
    });
    const rewriteManifest = rewritePlan.manifest;
    expect(rewriteManifest.jobs).toHaveLength(1);
    const rewriteJob = rewriteManifest.jobs[0]!;
    expect(rewriteJob).toMatchObject({
      schema_version: 3,
      job_id: "rewrite:accepted:01-2a-3b",
      stage: "rewrite",
      model_argument: "gpt-5.6-luna",
      authoring_model: "gpt-5.6-luna",
      effort: "high",
      failed_commentary_ids: ["comm_accepted_0002"],
      audit_output_path: auditJob.output_path,
      audit_output_sha256: auditState.output_sha256,
      output_path: "scratch/commentary/rewrites/accepted/01-2a-3b.json",
      state_path: "scratch/commentary/campaign-state/accepted/rewrite-01-2a-3b.json",
    });
    expect(rewriteJob.prompt).toContain("comm_accepted_0002");
    expect(rewriteJob.prompt).toContain("Use the exact Luna model and stage effort stated here");
    expect(rewriteJob.prompt).toContain("preserve its commentary id, block kind, placement, anchor, and any exact audio_insertion boundary");
    expect(rewriteJob.prompt).toContain("Make the smallest sufficient repair");
    expect(rewriteJob.prompt).toContain("otherwise copy the current title, body, cites, and crossrefs exactly");
    expect(rewriteJob.prompt).toContain("Speaker sigla identify turns");
    expect(rewriteJob.command.args.slice(0, 10)).toEqual([
      "exec", "--model", "gpt-5.6-luna", "-c", "model_reasoning_effort=high",
      "--sandbox", "read-only", "--ephemeral", "--json", "--output-schema",
    ]);
    expect(rewriteJob.serial_handoff[0]).toStartWith(
      "bun scripts/commentary/commentary-campaign.ts rewrite-preview accepted ",
    );

    env.FAKE_CODEX_RESPONSE_JSON = codexSuccessJsonl(
      validRewrite("accepted", auditJob.output_path, auditState.output_sha256),
    );
    const generated = await runCommentaryCampaignPlan(rewritePlan, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(generated[0]?.status).toBe("generated");
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);

    const preview = importCommentaryRewrite({
      dialogue: "accepted",
      rewritePath: rewriteJob.output_path,
    });
    expect(preview.applied).toBe(false);
    expect(preview.changedBlockIds).toEqual(["comm_accepted_0002"]);
    expect(preview.prospectiveLedger).toContain("The exchange turns on a concrete structural contrast");
    expect(preview.prospectiveLedger).toContain("commentary_id: comm_accepted_0002");
    expect(preview.prospectiveLedger).toContain("block_kind: notice");
    expect(preview.prospectiveLedger).toContain("turn_id: turn_accepted_audio_0001");
    expect(preview.prospectiveLedger).toContain(`attribution_sha256: "${insertion.attribution_sha256}"`);
    expect(preview.prospectiveLedger).toContain("review_status: unreviewed");
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);

    const applied = importCommentaryRewrite({
      dialogue: "accepted",
      rewritePath: rewriteJob.output_path,
      apply: true,
    });
    expect(applied.applied).toBe(true);
    expect(readFileSync(ledgerPath, "utf8")).toBe(preview.prospectiveLedger);
  });

  it("rejects a section rewrite with an empty title before writing campaign artifacts", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const executable = fakeCodex();
    const sectionAudit = validAudit("accepted");
    sectionAudit.unit_verdict = "fail";
    sectionAudit.blocks[0]!.disposition = "rewrite";
    sectionAudit.blocks[0]!.issue_codes = ["source_recap"];
    sectionAudit.blocks[0]!.checks = auditChecks(["source_recap"]);
    sectionAudit.blocks[0]!.rationale = "The section only repeats what the listener has just heard.";
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: sectionAudit },
    );
    const auditManifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    await runCommentaryCampaign(auditManifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    const auditJob = auditManifest.jobs[0]!;
    const auditState = JSON.parse(readFileSync(join(root, auditJob.state_path), "utf8")) as { output_sha256: string };
    const rewritePlan = buildCommentaryCampaignPlan({
      dialogue: "accepted",
      stage: "rewrite",
      codexExecutable: executable,
    });
    const invalidRewrite = validRewrite("accepted", auditJob.output_path, auditState.output_sha256);
    invalidRewrite.revisions = [{
      commentary_id: "comm_accepted_0001",
      title: "",
      body: "A replacement section body.",
      cites: { observations: ["obs_accepted_0001"], claims: [], relations: [], dossiers: [] },
      crossrefs: [],
    }];
    env.FAKE_CODEX_RESPONSE_JSON = codexSuccessJsonl(invalidRewrite);

    await expect(runCommentaryCampaignPlan(rewritePlan, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    })).rejects.toThrow("Rewrite for section comm_accepted_0001 requires a non-empty title");
    expect(existsSync(join(root, rewritePlan.manifest.jobs[0]!.output_path))).toBe(false);
  });

  it("exposes failed-audit rewrites before first ledger acceptance", async () => {
    writeDialogue("drafted");
    write(
      "wiki/commentary/drafted.md",
      `# drafted\n\n${sectionBlock("drafted", "comm_drafted_0001", "2a-3b")}\n\n${noticeBlock("drafted", "comm_drafted_0002", "2a", "unreviewed")}\n`,
    );
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validAudit("drafted", "rewrite") },
    );
    const auditManifest = buildCommentaryCampaignManifest({
      dialogue: "drafted",
      stage: "audit",
      codexExecutable: executable,
    });
    await runCommentaryCampaign(auditManifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });

    const rewriteManifest = buildCommentaryCampaignManifest({
      dialogue: "drafted",
      stage: "rewrite",
      codexExecutable: executable,
    });
    expect(rewriteManifest.jobs).toHaveLength(1);
    expect(rewriteManifest.jobs[0]).toMatchObject({
      job_id: "rewrite:drafted:01-2a-3b",
      failed_commentary_ids: ["comm_drafted_0002"],
    });
  });

  it("applies a multi-section rewrite wave atomically against one accepted-ledger snapshot", async () => {
    writeDialogue("accepted");
    writeAcceptedTwoUnitLedger("accepted");
    const ledgerPath = join(root, "wiki/commentary/accepted.md");
    const canonicalBefore = readFileSync(ledgerPath, "utf8");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      {},
    );
    const auditManifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    expect(auditManifest.jobs).toHaveLength(2);
    for (const job of auditManifest.jobs) {
      const failedId = job.commentary_ids!.find((id) => id !== job.section_id)!;
      env.FAKE_CODEX_RESPONSE_JSON = codexSuccessJsonl({
          schema_version: 3,
          dialogue: "accepted",
          unit_key: job.unit_key,
          section_id: job.section_id,
          authoring: {
            model: COMMENTARY_AUTHORING_MODEL,
            effort: COMMENTARY_STAGE_EFFORT.audit,
          },
          unit_verdict: "fail",
          blocks: job.commentary_ids!.map((commentaryId) => ({
            commentary_id: commentaryId,
            disposition: commentaryId === failedId ? "rewrite" : "pass",
            issue_codes: commentaryId === failedId ? ["source_recap"] : [],
            checks: auditChecks(commentaryId === failedId ? ["source_recap"] : []),
            rationale: commentaryId === failedId
              ? "The interruption repeats the source instead of adding a listening cue."
              : "The section gives the listener a concise orientation.",
          })),
      });
      await runCommentaryCampaign(auditManifest, {
        execute: true,
        jobs: [job],
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      });
    }

    const rewritePlan = buildCommentaryCampaignPlan({
      dialogue: "accepted",
      stage: "rewrite",
      codexExecutable: executable,
    });
    const rewriteManifest = rewritePlan.manifest;
    expect(rewriteManifest.jobs).toHaveLength(2);
    for (const job of rewriteManifest.jobs) {
      const failedId = job.failed_commentary_ids![0]!;
      env.FAKE_CODEX_RESPONSE_JSON = codexSuccessJsonl({
          schema_version: 1,
          dialogue: "accepted",
          unit_key: job.unit_key,
          section_id: job.section_id,
          audit_output: {
            path: job.audit_output_path,
            sha256: job.audit_output_sha256,
          },
          authoring: {
            model: COMMENTARY_AUTHORING_MODEL,
            effort: COMMENTARY_STAGE_EFFORT.rewrite,
          },
          revisions: [{
            commentary_id: failedId,
            title: "",
            body: `Replacement prose for the ${job.unit_key === "01-2a-2b" ? "opening" : "closing"} unit adds one concrete listening distinction.`,
            cites: { observations: ["obs_accepted_0001"], claims: [], relations: [], dossiers: [] },
            crossrefs: [],
          }],
      });
      await runCommentaryCampaignPlan(rewritePlan, {
        execute: true,
        jobs: [job],
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      });
    }

    const rewritePaths = rewriteManifest.jobs.map((job) => job.output_path).reverse();
    const preview = importCommentaryRewriteBatch({ dialogue: "accepted", rewritePaths });
    expect(preview.applied).toBe(false);
    expect(preview.changedBlockIds).toEqual(["comm_accepted_0002", "comm_accepted_0004"]);
    expect(preview.prospectiveLedger).toContain("Replacement prose for the opening unit");
    expect(preview.prospectiveLedger).toContain("Replacement prose for the closing unit");
    expect(readFileSync(ledgerPath, "utf8")).toBe(canonicalBefore);

    const applied = importCommentaryRewriteBatch({ dialogue: "accepted", rewritePaths, apply: true });
    expect(applied.applied).toBe(true);
    expect(readFileSync(ledgerPath, "utf8")).toBe(preview.prospectiveLedger);
  });

  it("refuses retrying current semantic audits and rejects rewrite artifacts that omit failed ids", async () => {
    writeDialogue("passing");
    writeAcceptedLedger("passing");
    const executable = fakeCodex();
    const passingEnv = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validAudit("passing") },
    );
    const passingManifest = buildCommentaryCampaignManifest({
      dialogue: "passing",
      stage: "audit",
      codexExecutable: executable,
    });
    await runCommentaryCampaign(passingManifest, {
      execute: true,
      codexExecutable: executable,
      env: passingEnv,
      commandRunner: fakeCommandRunner,
    });
    expect(() =>
      prepareCommentaryCampaignRetry({
        dialogue: "passing",
        stage: "audit",
        unitKey: "01-2a-3b",
        codexExecutable: executable,
      }),
    ).toThrow("Refusing to retry a passing quality audit");

    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validAudit("accepted", "rewrite") },
    );
    const failedManifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    await runCommentaryCampaign(failedManifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(() =>
      prepareCommentaryCampaignRetry({
        dialogue: "accepted",
        stage: "audit",
        unitKey: "01-2a-3b",
        codexExecutable: executable,
      }),
    ).toThrow("Refusing to re-audit unchanged semantic failure");

    const failedAuditJob = failedManifest.jobs[0]!;
    const state = JSON.parse(readFileSync(join(root, failedAuditJob.state_path), "utf8")) as { output_sha256: string };
    const rewritePlan = buildCommentaryCampaignPlan({
      dialogue: "accepted",
      stage: "rewrite",
      codexExecutable: executable,
    });
    const rewriteManifest = rewritePlan.manifest;
    const bad = validRewrite("accepted", failedAuditJob.output_path, state.output_sha256);
    bad.revisions = [];
    env.FAKE_CODEX_RESPONSE_JSON = codexSuccessJsonl(bad);
    await expect(
      runCommentaryCampaignPlan(rewritePlan, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("must cover every failed commentary_id exactly once");
    expect(existsSync(join(root, rewriteManifest.jobs[0]!.output_path))).toBe(false);
  });

  it("rejects omitted, unknown, duplicate, and prose-bearing audit decisions", async () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    const expectedCommentaryIds = ["comm_accepted_0001", "comm_accepted_0002"];
    const omitted = validAudit("accepted");
    omitted.blocks = omitted.blocks.slice(0, 1);
    expect(() => parseCommentaryQualityAudit(omitted, { expectedCommentaryIds })).toThrow("omitted=[comm_accepted_0002]");

    const unknown = validAudit("accepted");
    unknown.blocks[1]!.commentary_id = "comm_accepted_9999";
    expect(() => parseCommentaryQualityAudit(unknown, { expectedCommentaryIds })).toThrow("unknown=[comm_accepted_9999]");

    const duplicate = validAudit("accepted");
    duplicate.blocks[1]!.commentary_id = "comm_accepted_0001";
    expect(() => parseCommentaryQualityAudit(duplicate, { expectedCommentaryIds })).toThrow("duplicates comm_accepted_0001");

    const replacement = validAudit("accepted") as ReturnType<typeof validAudit> & {
      blocks: Array<ReturnType<typeof validAudit>["blocks"][number] & { replacement_prose?: string }>;
    };
    replacement.blocks[1]!.replacement_prose = "Forbidden replacement prose.";
    expect(() => parseCommentaryQualityAudit(replacement, { expectedCommentaryIds })).toThrow("replacement_prose is not allowed");

    const inventedIssue = validAudit("accepted", "rewrite");
    inventedIssue.blocks[1]!.issue_codes = ["invented_quality_issue"];
    expect(() => parseCommentaryQualityAudit(inventedIssue, { expectedCommentaryIds })).toThrow("closed listening-quality code set");

    const sourceMisreading = validAudit("accepted", "rewrite");
    sourceMisreading.blocks[1]!.issue_codes = ["source_misreading"];
    sourceMisreading.blocks[1]!.checks = auditChecks(["source_misreading"]);
    expect(parseCommentaryQualityAudit(sourceMisreading, { expectedCommentaryIds }).blocks[1]?.issue_codes).toEqual([
      "source_misreading",
    ]);

    const unsupportedClaim = validAudit("accepted", "rewrite");
    unsupportedClaim.blocks[1]!.issue_codes = ["unsupported_or_miscited_claim"];
    unsupportedClaim.blocks[1]!.checks = auditChecks(["unsupported_or_miscited_claim"]);
    expect(parseCommentaryQualityAudit(unsupportedClaim, { expectedCommentaryIds }).blocks[1]?.issue_codes).toEqual([
      "unsupported_or_miscited_claim",
    ]);

    const inconsistentVerdict = validAudit("accepted");
    inconsistentVerdict.unit_verdict = "fail";
    expect(() => parseCommentaryQualityAudit(inconsistentVerdict, { expectedCommentaryIds })).toThrow(
      "unit_verdict must be pass exactly when every commentary block passes",
    );

    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: omitted },
    );
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "accepted",
      stage: "audit",
      codexExecutable: executable,
    });
    const canonicalBefore = readFileSync(join(root, "wiki/commentary/accepted.md"), "utf8");
    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("must cover every commentary_id exactly once");
    expect(existsSync(join(root, manifest.jobs[0]!.output_path))).toBe(false);
    expect(readFileSync(join(root, "wiki/commentary/accepted.md"), "utf8")).toBe(canonicalBefore);
  });

  it("rejects partial resume state and out-of-bounds concurrency before any generation", async () => {
    writeDialogue("fixture");
    writeSkeleton("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validDraft("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    const job = manifest.jobs[0]!;
    write(job.output_path, `${JSON.stringify(validDraft("fixture"), null, 2)}\n`);

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("Output and state artifacts must exist as a pair");
    expect(existsSync(join(root, "fake-codex.log"))).toBe(false);

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        concurrency: 41,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("concurrency must be an integer from 1 through 40");
    expect(existsSync(join(root, "fake-codex.log"))).toBe(false);
  });

  it("previews outline retry without mutation and archives its failed attempt only on apply", async () => {
    writeDialogue("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: {} },
    );
    const manifest = buildCommentaryCampaignManifest({
      dialogue: "fixture",
      stage: "outline",
      codexExecutable: executable,
    });
    const job = manifest.jobs[0]!;

    await expect(runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    })).rejects.toThrow(".schema_version is required");

    const telemetryPath = job.state_path.replace(/\.json$/u, ".usage.json");
    expect(existsSync(join(root, telemetryPath))).toBe(true);
    const preview = previewCommentaryCampaignRetries({
      dialogue: "fixture",
      stage: "outline",
      unitKeys: [],
      codexExecutable: executable,
    })[0]!;
    expect(preview.unitKey).toBeNull();
    expect(preview.rerunCommand).not.toContain("--unit-key");
    expect(existsSync(join(root, telemetryPath))).toBe(true);
    expect(existsSync(join(root, preview.telemetryArchivePath!))).toBe(false);

    const applied = prepareCommentaryCampaignRetries({
      dialogue: "fixture",
      stage: "outline",
      unitKeys: [],
      codexExecutable: executable,
    })[0]!;
    expect(applied.telemetryArchivePath).toBe(preview.telemetryArchivePath);
    expect(existsSync(join(root, telemetryPath))).toBe(false);
    expect(existsSync(join(root, applied.telemetryArchivePath!))).toBe(true);
  });

  it("bounds paid jobs independently from concurrency", async () => {
    for (const dialogue of ["a", "b", "c"]) writeDialogue(dialogue);
    const manifest = buildCommentaryCampaignManifest({ stage: "outline" });
    const generated: string[] = [];
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      const job = manifest.jobs.find((candidate) =>
        candidate.command.args.length === args.length &&
        candidate.command.args.every((argument, index) => argument === args[index])
      )!;
      generated.push(job.dialogue);
      return {
        exitCode: 0,
        stdout: codexSuccessJsonl(validOutline(job.dialogue)),
        stderr: "",
      };
    };

    const results = await runCommentaryCampaign(manifest, {
      execute: true,
      concurrency: 40,
      maxNewJobs: 1,
      commandRunner,
    });
    expect(generated).toEqual(["a"]);
    expect(results.map((result) => result.status)).toEqual(["generated", "deferred", "deferred"]);
  });

  it("changes only max in-flight work when concurrency changes, preserving selected calls and prompts", async () => {
    const dialogues = ["a", "b", "c", "d"];
    for (const dialogue of dialogues) {
      writeDialogue(dialogue);
      writeSkeleton(dialogue);
    }
    const manifest = buildCommentaryCampaignManifest({ stage: "draft" });

    const runAt = async (concurrency: 1 | 40) => {
      let inFlight = 0;
      let maxInFlight = 0;
      const selected: Array<{ jobId: string; args: string[]; prompt: string }> = [];
      const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
        if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
        if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
        const job = manifest.jobs.find((candidate) =>
          candidate.command.args.length === args.length &&
          candidate.command.args.every((argument, index) => argument === args[index])
        )!;
        selected.push({ jobId: job.job_id, args: [...args], prompt: job.prompt });
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return { exitCode: 0, stdout: codexSuccessJsonl(validDraft(job.dialogue)), stderr: "" };
      };

      const results = await runCommentaryCampaign(manifest, {
        execute: true,
        concurrency,
        maxNewJobs: manifest.jobs.length,
        commandRunner,
      });
      return {
        maxInFlight,
        results,
        selected: selected.sort((left, right) => left.jobId.localeCompare(right.jobId)),
      };
    };

    const serial = await runAt(1);
    expect(serial.maxInFlight).toBe(1);
    expect(serial.results.every((result) => result.status === "generated")).toBe(true);

    for (const dialogue of dialogues) {
      const archived = prepareCommentaryCampaignRetry({
        dialogue,
        stage: "draft",
        unitKey: "01-2a-3b",
      });
      expect(archived.outputArchivePath).toBeDefined();
      expect(archived.stateArchivePath).toBeDefined();
      expect(archived.telemetryArchivePath).toBeDefined();
    }

    const parallel = await runAt(40);
    expect(parallel.maxInFlight).toBe(4);
    expect(parallel.results.every((result) => result.status === "generated")).toBe(true);
    expect(parallel.selected).toEqual(serial.selected);
  });

  it("continues scheduling after recoverable invalid output and reports a nonzero campaign result", async () => {
    for (const dialogue of ["a", "b", "c"]) writeDialogue(dialogue);
    const manifest = buildCommentaryCampaignManifest({ stage: "outline" });
    const jobs = manifest.jobs;
    let executionCalls = 0;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      const job = jobs[executionCalls]!;
      executionCalls += 1;
      if (executionCalls === 1) {
        return {
          exitCode: 0,
          stdout: fakeEnvironment(
            { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
            { structured_output: {} },
          ).FAKE_CODEX_RESPONSE_JSON!,
          stderr: "",
        };
      }
      return {
        exitCode: 0,
        stdout: codexSuccessJsonl(validOutline(job!.dialogue)),
        stderr: "",
      };
    };

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        concurrency: 1,
        maxNewJobs: jobs.length,
        jobs,
        commandRunner,
      }),
    ).rejects.toThrow("invalid_output");
    expect(executionCalls).toBe(jobs.length);
    expect(existsSync(join(root, jobs[0]!.output_path))).toBe(false);
    expect(existsSync(join(root, jobs[1]!.output_path))).toBe(true);
    expect(existsSync(join(root, jobs[2]!.output_path))).toBe(true);
  });

  it("fails stop on an exit-zero top-level Codex error event", async () => {
    for (const dialogue of ["a", "b", "c"]) writeDialogue(dialogue);
    const manifest = buildCommentaryCampaignManifest({ stage: "outline" });
    let providerCalls = 0;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      providerCalls += 1;
      return {
        exitCode: 0,
        stdout: [
          JSON.stringify({ type: "thread.started", thread_id: "thread_provider_error" }),
          JSON.stringify({ type: "turn.started" }),
          JSON.stringify({ type: "error", message: "reconnect failed: HTTP 403" }),
        ].join("\n"),
        stderr: "",
      };
    };

    await expect(runCommentaryCampaign(manifest, {
      execute: true,
      concurrency: 1,
      maxNewJobs: manifest.jobs.length,
      jobs: manifest.jobs,
      commandRunner,
    })).rejects.toThrow("Codex error event");
    expect(providerCalls).toBe(1);
    expect(existsSync(join(root, manifest.jobs[0]!.output_path))).toBe(false);
    expect(existsSync(join(root, manifest.jobs[1]!.output_path))).toBe(false);
  });

  it("stops scheduling untouched jobs after the first operational generation failure", async () => {
    for (const dialogue of ["a", "b", "c"]) writeDialogue(dialogue);
    const manifest = buildCommentaryCampaignManifest({ stage: "outline" });
    const jobs = manifest.jobs;
    const validResponse = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validOutline("b") },
    ).FAKE_CODEX_RESPONSE_JSON!;
    const commandFailure = { exitCode: 1, stdout: "", stderr: "provider unavailable" };
    let executionCalls = 0;
    let releaseFirst: ((result: { exitCode: number; stdout: string; stderr: string }) => void) | undefined;
    const commandRunner: CommentaryCampaignCommandRunner = async (_executable, args) => {
      if (args[0] === "--version") return { exitCode: 0, stdout: "codex-cli 0.147.0", stderr: "" };
      if (args[0] === "login") return { exitCode: 0, stdout: "Logged in", stderr: "" };
      executionCalls += 1;
      if (executionCalls === 1) {
        return await new Promise((resolve) => {
          releaseFirst = resolve;
        });
      }
      if (executionCalls === 2) {
        releaseFirst!({ exitCode: 0, stdout: validResponse, stderr: "" });
        return commandFailure;
      }
      return { exitCode: 0, stdout: validResponse, stderr: "" };
    };

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        concurrency: 2,
        maxNewJobs: jobs.length,
        jobs,
        commandRunner,
      }),
    ).rejects.toThrow("Commentary campaign job failures");
    expect(executionCalls).toBe(2);
    expect(existsSync(join(root, jobs[2]!.output_path))).toBe(false);
  });

  it("validates generated outlines before writing and imports them only through the serial handoff", async () => {
    writeDialogue("fixture");
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validOutline("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    const job = manifest.jobs[0]!;

    await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    expect(parseCommentaryOutline(JSON.parse(readFileSync(join(root, job.output_path), "utf8"))).sections).toHaveLength(2);
    expect(existsSync(join(root, "wiki/commentary/fixture.md"))).toBe(false);

    const preview = importCommentaryOutline({ dialogue: "fixture", outlinePath: job.output_path });
    expect(preview.applied).toBe(false);
    expect(preview.sectionIds).toEqual(["comm_fixture_0001", "comm_fixture_0002"]);
    expect(preview.prospectiveLedger).toContain("author: model");
    expect(preview.prospectiveLedger).toContain("review_status: unreviewed");
    expect(existsSync(join(root, "wiki/commentary/fixture.md"))).toBe(false);

    const applied = importCommentaryOutline({ dialogue: "fixture", outlinePath: job.output_path, apply: true });
    expect(applied.applied).toBe(true);
    expect(readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8")).toBe(preview.prospectiveLedger);
  });

  it("rejects an invented outline citation before creating an output file", async () => {
    writeDialogue("fixture");
    const bad = validOutline("fixture");
    bad.sections[0]!.cites.observations = ["obs_fixture_9999"];
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: bad },
    );
    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    const job = manifest.jobs[0]!;

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("cite_unknown_id");
    expect(existsSync(join(root, job.output_path))).toBe(false);
    expect(existsSync(join(root, job.state_path))).toBe(false);
  });

  it("rejects an outline boundary that splits a continuous turn before writing output", async () => {
    writeDialogue("fixture");
    const source = readFileSync(join(root, "raw/plato/greek/fixture.txt"), "utf8");
    const digest = (value: string) => createHash("sha256").update(value).digest("hex");
    write(
      turnIndexPath("fixture"),
      formatTurnIndexToon({
        dialogue: "fixture",
        sourcePath: "raw/plato/greek/fixture.txt",
        sourceSha256: digest(source),
        siglaPath: "derived/plato/turns/sigla.toml",
        siglaSha256: digest(readFileSync(join(root, "derived/plato/turns/sigla.toml"), "utf8")),
        turns: [{
          turnId: "turn_fixture_0001",
          speaker: "ΣΩ.",
          startMarker: "2a",
          endMarker: "3b",
          startChar: 0,
          endChar: source.length,
          textSha256: digest(source),
          greekCharCount: 0,
        }],
      }),
    );
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: validOutline("fixture") },
    );
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline", codexExecutable: executable });
    expect(manifest.jobs[0]!.input_files.map((entry) => entry.path)).toContain(turnIndexPath("fixture"));

    await expect(
      runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      }),
    ).rejects.toThrow("splits turn_fixture_0001");
    expect(existsSync(join(root, manifest.jobs[0]!.output_path))).toBe(false);
  });

  it("accepts a Greek-crossing section marker only with a current exact English chapter boundary", async () => {
    writeDialogue("fixture");
    const source = readFileSync(join(root, "raw/plato/greek/fixture.txt"), "utf8");
    const digest = (value: string) => createHash("sha256").update(value).digest("hex");
    write(
      turnIndexPath("fixture"),
      formatTurnIndexToon({
        dialogue: "fixture",
        sourcePath: "raw/plato/greek/fixture.txt",
        sourceSha256: digest(source),
        siglaPath: "derived/plato/turns/sigla.toml",
        siglaSha256: digest(readFileSync(join(root, "derived/plato/turns/sigla.toml"), "utf8")),
        turns: [{
          turnId: "turn_fixture_0001",
          speaker: "ΣΩ.",
          startMarker: "2a",
          endMarker: "3b",
          startChar: 0,
          endChar: source.length,
          textSha256: digest(source),
          greekCharCount: 0,
        }],
      }),
    );
    const outline = validOutline("fixture");
    (outline.sections[1] as Record<string, unknown>).audio_insertion = acceptedAudioInsertion(
      "fixture",
      "turn_fixture_audio_0002",
      "before",
    );
    const executable = fakeCodex();
    const env = fakeEnvironment(
      { loggedIn: true, authMethod: "codex", apiProvider: "openai" },
      { structured_output: outline },
    );
    const manifest = buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline", codexExecutable: executable });

    await runCommentaryCampaign(manifest, {
      execute: true,
      codexExecutable: executable,
      env,
      commandRunner: fakeCommandRunner,
    });
    const preview = importCommentaryOutline({ dialogue: "fixture", outlinePath: manifest.jobs[0]!.output_path });
    expect(preview.prospectiveLedger).toContain("audio_insertion:");
    expect(preview.prospectiveLedger).toContain("turn_id: turn_fixture_audio_0002");
    expect(preview.prospectiveLedger).toContain("edge: before");
  });

  it("requires a fresh source- and sigla-bound turn index before planning an outline", () => {
    writeDialogue("fixture");
    const indexPath = join(root, turnIndexPath("fixture"));
    unlinkSync(indexPath);
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" })).toThrow(
      "Missing required commentary turn index",
    );

    writeDialogue("fixture");
    write("raw/plato/greek/fixture.txt", "{2a} changed {2b} beta {3a} gamma {3b} delta");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" })).toThrow(
      "Stale or mismatched commentary turn index",
    );

    writeDialogue("fixture");
    write("derived/plato/turns/sigla.toml", "changed sigla registry\n");
    expect(() => buildCommentaryCampaignManifest({ dialogue: "fixture", stage: "outline" })).toThrow(
      "turn-index sigla provenance",
    );
  });

  it("reports quality-audit pending, completed, and failed independently from ledger acceptance", async () => {
    for (const dialogue of ["pending", "passed", "failed"]) {
      writeDialogue(dialogue);
      writeAcceptedLedger(dialogue);
    }
    const executable = fakeCodex();
    const auth = { loggedIn: true, authMethod: "codex", apiProvider: "openai" };
    for (const [dialogue, disposition] of [["passed", "pass"], ["failed", "rewrite"]] as const) {
      const env = fakeEnvironment(auth, { structured_output: validAudit(dialogue, disposition) });
      const manifest = buildCommentaryCampaignManifest({ dialogue, stage: "audit", codexExecutable: executable });
      await runCommentaryCampaign(manifest, {
        execute: true,
        codexExecutable: executable,
        env,
        commandRunner: fakeCommandRunner,
      });
    }

    const manifest = buildCommentaryCampaignManifest({ codexExecutable: executable });
    const report = buildCommentaryCampaignStatusReport({
      manifest,
      auth: { logged_in: false, auth_method: "none", api_provider: "openai" },
      expectedDialogues: 3,
    });

    expect(report.totals).toMatchObject({
      accepted: 3,
      quality_audit_pending: 1,
      quality_audit_completed: 1,
      quality_audit_failed: 1,
      audit_jobs: 3,
      completed_jobs: 2,
    });
    expect(report.dialogues.find((row) => row.dialogue === "pending")).toMatchObject({
      ledger: "accepted",
      stage: "accepted",
      quality_audit_status: "pending",
      quality_audit_required_count: 1,
      quality_audit_passed_count: 0,
      quality_audit_failed_count: 0,
      quality_audit_execution: "auth_blocked",
    });
    expect(report.dialogues.find((row) => row.dialogue === "passed")).toMatchObject({
      ledger: "accepted",
      quality_audit_status: "completed",
      quality_audit_passed_count: 1,
      quality_audit_execution: "complete",
    });
    expect(report.dialogues.find((row) => row.dialogue === "failed")).toMatchObject({
      ledger: "accepted",
      quality_audit_status: "failed",
      quality_audit_failed_count: 1,
      quality_audit_execution: "complete",
    });
  });

  it("reports accepted, brief-ready/auth-blocked, and outline-pending coverage without prose generation", () => {
    writeDialogue("accepted");
    writeAcceptedLedger("accepted");
    writeDialogue("ready");
    writeSkeleton("ready");
    writeDialogue("pending");

    const manifest = buildCommentaryCampaignManifest();
    const report = buildCommentaryCampaignStatusReport({
      manifest,
      auth: { logged_in: false, auth_method: "none", api_provider: "openai" },
      expectedDialogues: 3,
    });

    expect(report.totals).toMatchObject({
      accepted: 1,
      outline_pending: 1,
      unit_briefs_ready: 1,
      outline_jobs: 1,
      draft_jobs: 1,
      audit_jobs: 1,
      completed_jobs: 0,
      quality_audit_pending: 1,
    });
    expect(report.dialogues.find((row) => row.dialogue === "accepted")).toMatchObject({
      stage: "accepted",
      execution: "complete",
      quality_audit_status: "pending",
      quality_audit_required_count: 1,
      quality_audit_job_count: 1,
      quality_audit_execution: "auth_blocked",
    });
    expect(report.dialogues.find((row) => row.dialogue === "ready")).toMatchObject({
      stage: "unit_briefs_ready",
      execution: "auth_blocked",
      brief_count: 1,
      draft_job_count: 1,
    });
    expect(report.dialogues.find((row) => row.dialogue === "pending")).toMatchObject({
      stage: "outline_pending",
      execution: "auth_blocked",
      outline_job_count: 1,
    });
  });
});

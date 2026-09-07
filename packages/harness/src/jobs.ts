import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  COMPLETENESS_TARGETS,
  type CompletenessFamilyId,
  type CompletenessReport,
  type CompletenessTarget,
} from "./completeness.js";
import { getRepoRoot } from "./paths.js";

/**
 * The completeness report already says what is missing, leaf by leaf, with the
 * remediation attached. Nothing consumed it: its only importers were the report
 * renderer and the release gate, so turning 276 failing leaves into dispatchable
 * work was done by hand in frozen markdown work packages.
 *
 * This module is the missing half. It reads the report a lane at a time and
 * emits one job per failing leaf, each carrying the inputs to read, what to do,
 * and the command that lands the result — the shape the commentary campaign
 * already proved, generalized off the completeness leaf rather than bound to
 * one lane.
 */
export const JOB_SCHEMA_VERSION = 3;

export const JOB_MANIFEST_PATH = ".cache/jobs/manifest.json";

export type JobLane =
  | "source"
  | "english"
  | "observations"
  | "claims"
  | "relations"
  | "derived"
  | "reported-turns"
  | "comparison"
  | "ontology"
  | "site"
  | "commentary"
  | "commentary-audit"
  | "audio";

export type JobInput = {
  path: string;
  exists: boolean;
  sha256: string;
};

export type Job = {
  schema_version: typeof JOB_SCHEMA_VERSION;
  job_id: string;
  lane: JobLane;
  family: CompletenessFamilyId;
  scope: string;
  /** Whether a harness command runs this lane end to end, or a human drives it. */
  automation: "harness" | "campaign" | "manual";
  expected: string;
  observed: string;
  remediation: string;
  inputs: JobInput[];
  input_sha256: string;
  instructions: string[];
  submit: string[];
  blocked_by: string[];
};

export type JobManifest = {
  schema_version: typeof JOB_SCHEMA_VERSION;
  target: CompletenessTarget;
  generated_from: "completeness";
  generated_at: string;
  counts: {
    jobs: number;
    ready: number;
    blocked: number;
    by_lane: Record<string, number>;
  };
  jobs: Job[];
};

type LaneDefinition = {
  lane: JobLane;
  automation: Job["automation"];
  instructions: (scope: string) => string[];
  submit: (scope: string) => string[];
  /** Families in the same scope that must close first. */
  dependsOn?: CompletenessFamilyId[];
};

const REVIEW_RECEIPT_RULE =
  "Any review_status change must land in the same commit as an added or modified receipt under wiki/review/ (AGENTS.md); bun run validate enforces this.";

const AUDIO_LANE = (family: string, stage: string): LaneDefinition => ({
  lane: "audio",
  automation: "manual",
  instructions: (scope) => [
    `Close ${family} for ${scope}: ${stage}.`,
    "Follow docs/audio-edition-protocol.md; the production scripts are under scripts/audio/ and are driven by hand, not by a harness runner.",
    "Casting is already operator-authorized-deterministic-v1 with manualListeningRequired=false; listening may be recorded not-performed where the protocol allows it.",
  ],
  submit: () => [
    "bun run harness audio coverage --write",
    "bun run completeness -- --target audio-edition --allow-incomplete",
  ],
  dependsOn: ["CMP-READINGS", "CMP-WRITING-AUDIT"],
});

const LANES: Partial<Record<CompletenessFamilyId, LaneDefinition>> = {
  "CMP-SOURCE": {
    lane: "source",
    automation: "manual",
    instructions: (scope) => [
      `Add the canonical Greek source for ${scope} under raw/plato/greek/ and its provenance row.`,
      "raw/plato/SOURCES.md carries per-file provenance and the licensing posture; update it when adding sources.",
    ],
    submit: () => ["bun run validate"],
  },
  "CMP-ENGLISH": {
    lane: "english",
    automation: "harness",
    instructions: (scope) => [
      `Add the English source for ${scope} under raw/plato/english/ and rebuild its Stephanus index.`,
      "English is a rendering and commentary source only. Never read it during extraction (AGENTS.md).",
    ],
    submit: (scope) => [`bun run harness derive stephanus-english ${scope}`, "bun run validate"],
  },
  "CMP-OBSERVATIONS": {
    lane: "observations",
    automation: "manual",
    instructions: (scope) => [
      `Curate and terminally review the observation scope for ${scope} directly from raw/plato/greek/${scope}.txt.`,
      "Read docs/plato-wiki-extraction-protocol.md. Extract records, not readings; keep source-bound extraction unclassified.",
      "Use a bounded independent agent review where needed, then land the accepted canonical ledger and one decision receipt.",
      "Inspect wiki tool schemas with bun run harness wiki ingest. Submit a JSON array of {name, arguments} calls; stage drafts, then stage and commit the accepted ledger in the same invocation.",
      "The deterministic 30,000-byte segment planner and appendSegmentCoverage library function retain exact coverage and explicit no_observations receipts for empty segments.",
      REVIEW_RECEIPT_RULE,
    ],
    submit: (scope) => [
      `bun run harness derive segments ${scope}`,
      "bun run harness wiki ingest <calls.json>",
      "bun run harness wiki review <calls.json>",
      "bun run validate",
    ],
  },
  "CMP-CLAIMS": {
    lane: "claims",
    automation: "manual",
    instructions: (scope) => [
      `Curate the claim ledger for ${scope} directly from its Greek source, close segment scope, and terminally review every claim.`,
      "Split needs_split records into atomic claims and record the accepted decision under wiki/review/.",
      "Use the deterministic planSegmentedClaims and planSegmentedClaimReview library functions for bounded scope; appendClaimSegmentCoverage records explicit coverage.",
      "Inspect tool schemas with bun run harness wiki claims-segmented. Submit a JSON array of {name, arguments} calls for validated appends or review updates.",
      REVIEW_RECEIPT_RULE,
    ],
    submit: () => [
      "bun run harness wiki claims-segmented <calls.json>",
      "bun run harness wiki claims-review-segmented <calls.json>",
      "bun run validate",
    ],
  },
  "CMP-RELATIONS": {
    lane: "relations",
    automation: "manual",
    instructions: (scope) => [
      `Repair the strict canonical relation ledger and vNext audit evidence for ${scope}.`,
      "Accepted relations are substantive semantic edges; rejected relation decisions remain review provenance and never become reader output.",
      "The shared-term candidate command is discovery-only. It does not define the canonical relation set, prove absence, or authorize automatic rejection.",
      REVIEW_RECEIPT_RULE,
    ],
    submit: () => [
      "bun run harness ontology-audit verify",
      "bun run validate",
      "bun run completeness -- --target knowledge-base --allow-incomplete",
    ],
    dependsOn: ["CMP-CLAIMS"],
  },
  "CMP-DERIVED": {
    lane: "derived",
    automation: "harness",
    instructions: (scope) => [
      `Regenerate the byte-current derived artifacts for ${scope}.`,
      "These are deterministic. Do not ask a model to produce them.",
    ],
    submit: (scope) => [
      `bun run harness derive stephanus ${scope}`,
      `bun run harness derive turns ${scope}`,
      `bun run harness derive tokens ${scope}`,
      `bun run harness derive anchors ${scope}`,
      `bun run harness derive metrics ${scope}`,
      `bun run harness derive joins ${scope}`,
    ],
  },
  "CMP-REPORTED-TURNS": {
    lane: "reported-turns",
    automation: "manual",
    instructions: (scope) => [
      `Extract, review, and accept every required outer-turn cohort for ${scope}, then compile the standalone index.`,
      "No harness runner exists for this lane. The ledger is wiki/voices/<scope>.md and the required scopes are in wiki/reported-turn-scopes.json.",
      "Attribution comes from the text's own speech machinery, never from content, doctrine, style, or turn alternation (docs/voices-protocol.md).",
      "Two authority shapes, never both: byte-cited evidence_refs, or a reviewed_attribution exposing context span, candidate set, rationale, and provenance.",
      "Retained ambiguity is a real answer and must be a real candidate set.",
      REVIEW_RECEIPT_RULE,
    ],
    submit: (scope) => [
      `bun run harness derive voices ${scope}`,
      `bun run harness derive voice-joins ${scope}`,
      "bun run validate",
    ],
  },
  "CMP-COMPARISON": {
    lane: "comparison",
    automation: "harness",
    instructions: () => ["Rebuild the cross-dialogue comparison artifacts."],
    submit: () => ["bun run harness clusters --write", "bun run harness dossiers --write"],
  },
  "CMP-ONTOLOGY-AXES": {
    lane: "ontology",
    automation: "manual",
    instructions: () => [
      "Read docs/ontology-v2-target.md and follow its fixed phase order. Author no catalog until phase 0 is merged.",
      "Write each comparison question before its closed answer set; name at least three classes and candidate observation IDs from at least three dialogues.",
      "Record admitted and rejected candidates, rationale, independent overlap review, and resulting catalog count in one canonical phase-1 receipt under wiki/review/; obtain operator ratification of the count before classification.",
      "The ratified count is a regression ceiling, not a target. Every live axis needs its authorship receipt reference, at least three classes, at least three represented dialogues, and a unique normalized question.",
      "Keep the candidate catalog outside the live ontology until the single hard cutover. Do not change observation fields or review statuses.",
    ],
    submit: () => ["bun run harness ontology quality --write", "bun run validate", "bun run ci"],
  },
  "CMP-ONTOLOGY-CONCEPTS": {
    lane: "ontology",
    automation: "manual",
    instructions: () => [
      "Read docs/ontology-v2-target.md. Enumerate answer classes during catalog authoring, then prune after classification and independent review in the prescribed order.",
      "Admit only answer classes with keys of at most four tokens and distinct normalized definitions within their axis. At cutover every concept must have at least two memberships.",
      "A new concept after catalog freeze must remain inside an admitted axis, name two candidate observations, and be accepted by the integrating agent.",
      "Remove undersupported classes at cutover; reassign their observations on textual evidence or record explicit no_axis_applies dispositions. Record the decision in the canonical cutover receipt.",
    ],
    submit: () => ["bun run harness ontology quality --write", "bun run validate", "bun run ci"],
  },
  "CMP-ONTOLOGY-MEMBERSHIP": {
    lane: "ontology",
    automation: "manual",
    instructions: (scope) => [
      `Classify every accepted observation in ${scope} against the entire ratified catalog, following docs/ontology-v2-target.md phase 3.`,
      "Begin only after catalog count ratification and installation of the ontology stage/commit writer and bounded brief command in phase 2.",
      "Read observation, greek_terms, stephanus_span, and limits as the classification input. Never edit observation fields or review statuses; do not read raw/plato/english/.",
      "Record every applicable answer class. Each assignment basis names the actual textual term, speaker act, or stated provision that warrants it; no registry templates or legacy references.",
      "Each accepted observation requires membership or a no_axis_applies disposition with a basis. Memberships divided by all accepted observations must exceed 1.0; this threshold does not replace exhaustive classification.",
      "Stage candidate results outside the live ontology; the integrating agent owns the single whole-ontology commit and cutover receipt. Propose no axes.",
    ],
    submit: () => ["bun run harness ontology quality --write", "bun run validate", "bun run ci"],
  },
  "CMP-ONTOLOGY-INDEPENDENCE": {
    lane: "ontology",
    automation: "manual",
    instructions: () => [
      "Read docs/ontology-v2-target.md. After the initial membership pass, independently classify a stratified sample covering at least 5% of accepted observations and at least 600 records.",
      "Use an independent reader and preserve item-level disagreements with terminal accepted decisions in the canonical cutover receipt; the integrating agent owns canonical writes.",
      "Publish measured first-pass recall, missed memberships, and agreement in the deterministic quality report. Present the measurements to the operator for the recall-floor decision; do not invent a threshold or silently rerun unchanged inputs.",
      "Keep temporary packets outside the repository; the receipt records source references, stable IDs, accepted dispositions, independent-review outcome, and final validation.",
    ],
    submit: () => ["bun run harness ontology quality --write", "bun run validate", "bun run ci"],
  },
  "CMP-SITE": {
    lane: "site",
    automation: "harness",
    instructions: () => [
      "Rebuild the static site and clear its size, accessibility, identifier, link, fragment, search, and recording checks.",
    ],
    submit: () => ["bun run harness site", "bun run validate"],
  },
  "CMP-READINGS": {
    lane: "commentary",
    automation: "campaign",
    instructions: (scope) => [
      `Produce and accept the guided reading ledger for ${scope} at wiki/commentary/${scope}.md.`,
      "The campaign runner drafts in parallel with content-addressed resume; run the outline stage first when the ledger has no sections.",
      "Draft artifacts land in gitignored scratch. The apply gate copies them into wiki/submissions/commentary/<scope>/, so submit through the gate rather than editing the ledger by hand.",
      "Preview before applying: the preview and apply paths validate identically, so a failed preview is a draft to fix, not a merge to force.",
      REVIEW_RECEIPT_RULE,
    ],
    submit: (scope) => [
      `bun scripts/commentary/commentary-campaign.ts run --execute --dialogue ${scope} --stage outline`,
      `bun scripts/commentary/commentary-campaign.ts run --execute --dialogue ${scope} --stage draft --max-new-jobs 4 --concurrency 2`,
      `bun run harness commentary draft-preview ${scope} <draft-path>`,
      `bun run harness commentary draft-apply ${scope} <draft-path>`,
    ],
  },
  "CMP-WRITING-AUDIT": {
    lane: "commentary-audit",
    automation: "campaign",
    instructions: (scope) => [
      `Produce the operator-delegated Luna-accepted quality-audit manifest for ${scope} at wiki/commentary-audits/${scope}.json.`,
      "The manifest requires a fully accepted ledger, so CMP-READINGS for this scope must close first.",
      "Audit briefs bind their own unit, not the whole ledger, so accepting a ledger no longer invalidates the audit that justified it and a rewrite reopens only its own unit.",
      "Per-block disposition and issue_codes in the manifest are the corpus's only surviving defect labels; producing it closes this family and accumulates them.",
    ],
    submit: (scope) => [
      `bun run harness commentary audit-briefs ${scope}`,
      `bun scripts/commentary/commentary-campaign.ts run --execute --dialogue ${scope} --stage audit --max-new-jobs 4 --concurrency 2`,
      `bun run harness commentary audit-manifest-preview ${scope}`,
    ],
    dependsOn: ["CMP-READINGS"],
  },
  "CMP-AUDIO-TRUTH": AUDIO_LANE("CMP-AUDIO-TRUTH", "the audio truth set"),
  "CMP-AUDIO-ATTRIBUTION": AUDIO_LANE("CMP-AUDIO-ATTRIBUTION", "speaker attribution"),
  "CMP-AUDIO-SCREENPLAY": {
    lane: "audio",
    automation: "harness",
    instructions: (scope) => [
      `Generate and accept the production screenplay for ${scope}.`,
      "The screenplay requires an accepted commentary ledger and an accepted quality-audit manifest, so both must close first.",
    ],
    submit: (scope) => [`bun run harness audio screenplay ${scope} --write-production`],
    dependsOn: ["CMP-READINGS", "CMP-WRITING-AUDIT"],
  },
  "CMP-AUDIO-RENDER": AUDIO_LANE("CMP-AUDIO-RENDER", "render the cast audio"),
  "CMP-AUDIO-MASTERING": AUDIO_LANE("CMP-AUDIO-MASTERING", "master the rendered audio"),
  "CMP-AUDIO-MECHANICAL-QA": AUDIO_LANE("CMP-AUDIO-MECHANICAL-QA", "mechanical QA over the master"),
  "CMP-AUDIO-ACCEPTANCE": AUDIO_LANE("CMP-AUDIO-ACCEPTANCE", "acceptance of the master"),
  "CMP-AUDIO-RECORDING": AUDIO_LANE("CMP-AUDIO-RECORDING", "the accepted recording manifest"),
  "CMP-AUDIO-WEBSITE": AUDIO_LANE("CMP-AUDIO-WEBSITE", "site exposure of the accepted recording"),
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
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

export function jobIdFor(family: CompletenessFamilyId, scope: string) {
  return `${family.replace(/^CMP-/u, "").toLowerCase()}/${scope}`;
}

function jobInputs(paths: string[]): JobInput[] {
  return paths.map((path) => {
    const absolute = join(getRepoRoot(), path);
    if (!existsSync(absolute)) return { path, exists: false, sha256: "" };
    // Evidence is sometimes a directory (raw/plato/greek); hash only regular files.
    if (!statSync(absolute).isFile()) return { path, exists: true, sha256: "" };
    return { path, exists: true, sha256: sha256(readFileSync(absolute)) };
  });
}

export type BuildJobManifestOptions = {
  target: CompletenessTarget;
  report: CompletenessReport;
  generatedAt: string;
  lane?: string;
  family?: string;
  scope?: string;
};

export function buildJobManifest(options: BuildJobManifestOptions): JobManifest {
  const required = new Set<CompletenessFamilyId>(COMPLETENESS_TARGETS[options.target]);
  const failingByFamily = new Map<CompletenessFamilyId, Set<string>>();
  for (const family of options.report.families) {
    if (!required.has(family.id)) continue;
    failingByFamily.set(
      family.id,
      new Set(family.leaves.filter((leaf) => leaf.state === "fail").map((leaf) => leaf.scope)),
    );
  }

  const jobs: Job[] = [];
  for (const family of options.report.families) {
    if (!required.has(family.id)) continue;

    const definition = LANES[family.id];
    if (!definition) continue;
    if (options.family && family.id !== options.family) continue;
    if (options.lane && definition.lane !== options.lane) continue;

    for (const leaf of family.leaves) {
      if (leaf.state !== "fail") continue;
      if (options.scope && leaf.scope !== options.scope) continue;

      const inputs = jobInputs(leaf.evidence);
      const blockedBy = (definition.dependsOn ?? [])
        .filter((dependency) => failingByFamily.get(dependency)?.has(leaf.scope) ?? false)
        .map((dependency) => jobIdFor(dependency, leaf.scope));

      jobs.push({
        schema_version: JOB_SCHEMA_VERSION,
        job_id: jobIdFor(family.id, leaf.scope),
        lane: definition.lane,
        family: family.id,
        scope: leaf.scope,
        automation: definition.automation,
        expected: leaf.expected,
        observed: leaf.observed,
        remediation: leaf.remediation ?? "",
        inputs,
        input_sha256: hashInputs(inputs),
        instructions: definition.instructions(leaf.scope),
        submit: definition.submit(leaf.scope),
        blocked_by: blockedBy,
      });
    }
  }

  jobs.sort((left, right) => left.job_id.localeCompare(right.job_id));

  const byLane: Record<string, number> = {};
  for (const job of jobs) byLane[job.lane] = (byLane[job.lane] ?? 0) + 1;

  return {
    schema_version: JOB_SCHEMA_VERSION,
    target: options.target,
    generated_from: "completeness",
    generated_at: options.generatedAt,
    counts: {
      jobs: jobs.length,
      ready: jobs.filter((job) => job.blocked_by.length === 0).length,
      blocked: jobs.filter((job) => job.blocked_by.length > 0).length,
      by_lane: byLane,
    },
    jobs,
  };
}

export function writeJobManifest(manifest: JobManifest, path = JOB_MANIFEST_PATH) {
  const absolute = join(getRepoRoot(), path);
  mkdirSync(dirname(absolute), { recursive: true });
  atomicWrite(absolute, prettyJson(manifest));
  return path;
}

export function readJobManifest(path = JOB_MANIFEST_PATH): JobManifest {
  const absolute = join(getRepoRoot(), path);
  if (!existsSync(absolute)) {
    throw new Error(`No job manifest at ${path}. Run: bun run harness job manifest --write`);
  }

  const manifest = JSON.parse(readFileSync(absolute, "utf8")) as JobManifest;
  if (manifest.schema_version !== JOB_SCHEMA_VERSION) {
    throw new Error(
      `Job manifest at ${path} is schema ${manifest.schema_version}, expected ${JOB_SCHEMA_VERSION}. Regenerate it.`,
    );
  }

  return manifest;
}

export function findJob(manifest: JobManifest, jobId: string) {
  const job = manifest.jobs.find((candidate) => candidate.job_id === jobId);
  if (job) return job;

  const near = manifest.jobs
    .filter((candidate) => candidate.job_id.includes(jobId) || candidate.scope === jobId)
    .map((candidate) => candidate.job_id)
    .slice(0, 8);
  throw new Error(
    near.length > 0
      ? `No job ${jobId}. Did you mean: ${near.join(", ")}`
      : `No job ${jobId} in the manifest. Run: bun run harness job list`,
  );
}

function hashInputs(inputs: JobInput[]) {
  return sha256(inputs.map((input) => `${input.path}\0${input.sha256}`).join("\n"));
}

/** Staleness check for a job a runner already dispatched: have its inputs moved? */
export function jobInputsChanged(job: Job) {
  return hashInputs(jobInputs(job.inputs.map((input) => input.path))) !== job.input_sha256;
}

export function renderJobList(manifest: JobManifest) {
  const lines = [
    `# Jobs for ${manifest.target}`,
    "",
    `${manifest.counts.jobs} open (${manifest.counts.ready} ready, ${manifest.counts.blocked} blocked) from ${manifest.generated_from}, generated ${manifest.generated_at}.`,
    "",
    "| job | lane | automation | blocked by | observed |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const job of manifest.jobs) {
    lines.push(
      `| ${job.job_id} | ${job.lane} | ${job.automation} | ${job.blocked_by.join(", ") || "-"} | ${job.observed} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function renderJob(job: Job) {
  const lines = [
    `# ${job.job_id}`,
    "",
    `- lane: ${job.lane}`,
    `- family: ${job.family}`,
    `- scope: ${job.scope}`,
    `- automation: ${job.automation}`,
    `- input_sha256: ${job.input_sha256}`,
    job.blocked_by.length > 0 ? `- blocked_by: ${job.blocked_by.join(", ")}` : "- blocked_by: none",
    "",
    "## Expected",
    "",
    job.expected,
    "",
    "## Observed",
    "",
    job.observed,
    "",
    "## Remediation",
    "",
    job.remediation,
    "",
    "## Inputs",
    "",
  ];
  for (const input of job.inputs) {
    lines.push(`- ${input.path}${input.exists ? "" : " (missing)"}`);
  }
  lines.push("", "## Instructions", "");
  for (const instruction of job.instructions) lines.push(`- ${instruction}`);
  lines.push("", "## Submit", "", "```bash");
  for (const command of job.submit) lines.push(command);
  lines.push("```");

  if (job.blocked_by.length > 0) {
    lines.push(
      "",
      `This job is blocked. Close ${job.blocked_by.join(" and ")} first; its inputs do not exist yet.`,
    );
  }

  return `${lines.join("\n")}\n`;
}

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AgentHarness,
  JsonlSessionRepo,
  formatSkillsForSystemPrompt,
  loadSourcedPromptTemplates,
  loadSourcedSkills,
} from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { readConfig } from "./config.js";
import {
  appendClaimSegmentCoverage,
  claimReviewTargetIdsComplete,
  planClaimReviewForIds,
  planSegmentedClaimReview,
  planSegmentedClaims,
  type SegmentedClaimSegment,
  type SegmentedClaimReviewBatch,
} from "./claims-segments.js";
import { parseTurnIndexToon, readSiglaRegistry, turnIndexPath } from "./derived/turns.js";
import { ensureProvidersRegistered, getModelApiKey, selectModel, type ModelSelection } from "./models.js";
import { withRepoWriteLock } from "./file-lock.js";
import { getRepoRoot } from "./paths.js";
import { planSegmentedReview, reviewTargetIdsComplete, type SegmentedReviewBatch } from "./review-segments.js";
import {
  planSegmentedRelationReview,
  planSegmentedRelations,
  relationCandidateKeysComplete,
  relationReviewTargetIdsComplete,
  type SegmentedRelationBatch,
  type SegmentedRelationReviewBatch,
} from "./relations.js";
import { appendSegmentCoverage, planGapIngest, planSegmentedIngest, type SegmentedIngestSegment } from "./segments.js";
import { createTranscript, summarizeEvent, type TranscriptWriter } from "./transcript.js";
import type { HarnessConfig, HarnessRunCommand, HarnessRunOptions, HarnessRunResult } from "./types.js";
import { assistantText } from "./usage.js";
import { assertLedgerAppendPath, prepareLedgerAppend } from "./wiki/guards.js";
import { claimYamlBlocks } from "./wiki/claim-ledger.js";
import { formatIngestLogEntry, ingestLogCountsFromLinks } from "./wiki/ingest-log.js";
import { SEED_FEATURE_FAMILIES, extractObservationFeatureLinks } from "./wiki/observation-feature-index.js";
import { fieldValue } from "./wiki/observation-ledger.js";
import { relationYamlBlocks } from "./wiki/relation-ledger.js";
import { createWikiTools, type WikiToolOptions } from "./wiki/tools.js";

type Source = { type: "project"; dir: string };

const DEFAULT_SEGMENT_TARGET_BYTES = 30_000;
const DEFAULT_CLAIM_SEGMENT_TARGET_BYTES = 10_000;
const DEFAULT_REVIEW_TARGET_OBSERVATIONS = 8;
const DEFAULT_CLAIM_REVIEW_TARGET_CLAIMS = 8;
const DEFAULT_RELATION_TARGET_PAIRS = 20;
const DEFAULT_RELATION_REVIEW_TARGET_RELATIONS = 20;

function isIngestCommand(command: HarnessRunCommand) {
  return command === "ingest" || command === "ingest-segmented";
}

function isReviewCommand(command: HarnessRunCommand) {
  return command === "review" || command === "review-segmented";
}

function isClaimExtractionCommand(command: HarnessRunCommand) {
  return command === "claims-segmented";
}

function isClaimReviewCommand(command: HarnessRunCommand) {
  return command === "claims-review-segmented";
}

function isClaimCommand(command: HarnessRunCommand) {
  return isClaimExtractionCommand(command) || isClaimReviewCommand(command);
}

function isRelationAdjudicationCommand(command: HarnessRunCommand) {
  return command === "relations-segmented";
}

function isRelationReviewCommand(command: HarnessRunCommand) {
  return command === "relations-review-segmented";
}

function isRelationCommand(command: HarnessRunCommand) {
  return isRelationAdjudicationCommand(command) || isRelationReviewCommand(command);
}

function isPromptInjectedLedgerCommand(command: HarnessRunCommand) {
  return isClaimCommand(command) || isRelationCommand(command);
}

function promptTemplateName(command: HarnessRunCommand) {
  if (command === "relations-review-segmented") return "review-plato-relations";
  if (command === "relations-segmented") return "adjudicate-plato-relations";
  if (command === "claims-review-segmented") return "review-plato-claims-segment";
  if (command === "claims-segmented") return "extract-plato-claims-segment";
  if (command === "review-segmented") return "review-plato-segment";
  if (command === "review") return "review-plato-features";
  if (command === "ingest-segmented") return "ingest-plato-segment";
  return "ingest-plato-dialogue";
}

function planSelectedGapSegments(dialogue: string, options: HarnessRunOptions) {
  const segments = planGapIngest(dialogue);
  const hasStart = options.gapStartChar !== undefined;
  const hasEnd = options.gapEndChar !== undefined;
  if (!hasStart && !hasEnd) return segments;
  if (!hasStart || !hasEnd) {
    throw new Error("--gap-start-char and --gap-end-char must be provided together");
  }

  const selected = segments.filter(
    (segment) => segment.startChar === options.gapStartChar && segment.endChar === options.gapEndChar,
  );
  if (selected.length === 0) {
    throw new Error(`No coverage gap matches start_char=${options.gapStartChar} end_char=${options.gapEndChar}`);
  }

  return selected;
}

function readContextFile(relativePath: string, required: boolean) {
  const path = join(getRepoRoot(), relativePath);
  if (!existsSync(path)) {
    if (required) {
      throw new Error(`Missing required context file: ${relativePath}`);
    }
    return "";
  }

  return readFileSync(path, "utf8");
}

function readFeatureRegistry() {
  return readContextFile("wiki/features-so-far.md", false);
}

function featureCandidateIds(content: string) {
  return new Set([...content.matchAll(/^###\s+(feature_candidate_\d+)\s*$/gmu)].map((match) => match[1]!));
}

function sortedSetDifference(after: Set<string>, before: Set<string>) {
  return [...after].filter((id) => !before.has(id)).sort();
}

function stephanusRangeEnd(span: string) {
  const [start, end] = span.split("-").map((part) => part.trim());
  if (!end) return start || span;
  if (/^\d/u.test(end)) return end;

  const startPage = /^\d+/u.exec(start ?? "")?.[0];
  return startPage ? `${startPage}${end}` : end;
}

function ledgerSpanRange(content: string) {
  const spans = [...content.matchAll(/^stephanus_span:\s*["']?([^"'\n]+)["']?\s*$/gmu)].map((match) =>
    match[1]!.trim(),
  );
  if (spans.length === 0) return undefined;

  const first = spans[0]!;
  const last = spans[spans.length - 1]!;
  if (first === last) return first;

  const firstStart = first.split("-")[0]?.trim() || first;
  const lastEnd = stephanusRangeEnd(last);
  return `${firstStart}-${lastEnd}`;
}

function speakerTurnTableForSegment(
  dialogue: string,
  segment: Pick<SegmentedClaimReviewBatch, "dialogue"> & {
    startChar: number;
    endChar: number;
    startMarker: string;
    endMarker: string;
  },
) {
  const path = turnIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing turn index for ${dialogue}: ${path}. Regenerate with \`bun run harness derive turns ${dialogue}\`.`);
  }

  const registry = readSiglaRegistry();
  const sigla = registry.dialogues.get(dialogue);
  if (!sigla) {
    throw new Error(`Missing speaker sigla registry entry for dialogue: ${dialogue}`);
  }

  const index = parseTurnIndexToon(readFileSync(absolutePath, "utf8"));
  const rows = index.turns
    .filter((turn) => turn.startChar < segment.endChar && turn.endChar > segment.startChar)
    .map((turn) => {
      const speaker = sigla.length === 0 ? "(unattributed)" : turn.speaker;
      return `${turn.turnId} | ${speaker} | ${turn.startMarker} | ${turn.endMarker}`;
    });
  const note =
    sigla.length === 0
      ? [
          `Segment ${segment.startMarker}-${segment.endMarker} speaker-turn table.`,
          `This dialogue has no speaker sigla; write speaker: "(unattributed)" for every claim.`,
        ]
      : [`Segment ${segment.startMarker}-${segment.endMarker} speaker-turn table.`];

  return [...note, "turn_id | speaker | start_marker | end_marker", ...(rows.length > 0 ? rows : ["(no overlapping turn rows)"])].join("\n");
}

export function claimSegmentSourceSection(dialogue: string, segment: SegmentedClaimSegment) {
  const sourcePath = `raw/plato/greek/${dialogue}.txt`;
  const absolutePath = join(getRepoRoot(), sourcePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing Greek text for dialogue: ${dialogue}`);
  }

  const content = readFileSync(absolutePath, "utf8");
  if (segment.startChar < 0 || segment.endChar < segment.startChar || segment.endChar > content.length) {
    throw new Error(
      `Invalid claim segment offsets for ${dialogue} ${segment.span}: start_char=${segment.startChar} end_char=${segment.endChar}`,
    );
  }

  const allowedMarkers = [...content.slice(segment.startChar, segment.endChar).matchAll(/\{(\d+[a-e])\}/gu)].map((match) => match[1]!);

  return [
    `Source path: ${sourcePath}`,
    `Segment: ${segment.span}`,
    `Start marker: ${segment.startMarker}`,
    `End marker: ${segment.endMarker}`,
    `Start char: ${segment.startChar}`,
    `End char: ${segment.endChar}`,
    "",
    "Allowed citation markers for this segment. Claim and stance-event stephanus_span values must be either one listed marker or a contiguous start-end range from this ordered marker list. Include a source_ref key for every cited span; wiki_append_claims canonicalizes source_ref fields from stephanus_span and rejects source refs outside this segment before writing.",
    JSON.stringify(
      {
        source_path: sourcePath,
        allowed_markers: allowedMarkers,
      },
      null,
      2,
    ),
    "",
    "Segment source text:",
    content.slice(segment.startChar, segment.endChar),
  ].join("\n");
}

export function reviewLedgerComplete(dialogue: string) {
  const observationPath = join(getRepoRoot(), "wiki/observations", `${dialogue}.md`);
  if (!existsSync(observationPath)) return false;

  const statuses = [...readFileSync(observationPath, "utf8").matchAll(/^review_status:\s*(\S+)\s*$/gmu)].map(
    (match) => match[1],
  );
  return statuses.length > 0 && statuses.every((status) => status !== "unreviewed");
}

export function featureRegistrySystemSection(content: string) {
  const compactIndex = compactFeatureRegistryIndex(content);
  return [
    ["## Current features-so-far compact index", compactIndex || "(none yet)"].join("\n\n"),
    existingLabelsByFamilySection(content),
  ].join("\n\n");
}

export function existingLabelsByFamilySection(content: string) {
  const labelsByFamily = new Map<string, Set<string>>();
  let current: { family?: string; proposedName?: string } | undefined;

  const flush = () => {
    if (!current?.family || !current.proposedName) return;
    const labels = labelsByFamily.get(current.family) ?? new Set<string>();
    labels.add(current.proposedName);
    labelsByFamily.set(current.family, labels);
  };

  for (const line of content.split(/\r?\n/u)) {
    if (/^###\s+\S+\s*$/u.test(line)) {
      flush();
      current = {};
      continue;
    }

    if (!current) continue;

    const field = /^-\s+\*\*(family|proposed_name):\*\*\s*(.*)$/u.exec(line);
    if (!field) continue;

    const value = field[2]?.trim() ?? "";
    if (field[1] === "family") {
      current.family = value;
    } else {
      current.proposedName = value;
    }
  }

  flush();

  const lines = [...labelsByFamily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, labels]) => `- ${family}: ${[...labels].sort().join(", ")}`);

  return [
    "## Existing feature labels by family (reuse these before creating new ones)",
    lines.length > 0 ? lines.join("\n") : "(none yet)",
  ].join("\n\n");
}

function compactFeatureRegistryIndex(content: string) {
  const entries: string[] = [];
  let current:
    | {
        id: string;
        proposedName?: string;
        family?: string;
        status?: string;
        observationCount?: number;
      }
    | undefined;

  const flush = () => {
    if (!current) return;
    entries.push(
      `- ${current.id}: family=${current.family ?? "(missing family)"}; proposed_name=${current.proposedName ?? "(missing proposed_name)"}; status=${current.status ?? "(missing status)"}; observations=${current.observationCount ?? 0}`,
    );
  };

  for (const line of content.split(/\r?\n/u)) {
    const heading = /^###\s+(\S+)\s*$/u.exec(line);
    if (heading) {
      flush();
      current = { id: heading[1]! };
      continue;
    }

    if (!current) continue;

    const field = /^-\s+\*\*(family|proposed_name|status|observations):\*\*\s*(.*)$/u.exec(line);
    if (!field) continue;

    const value = field[2]?.trim() ?? "";
    if (field[1] === "family") {
      current.family = value;
    } else if (field[1] === "proposed_name") {
      current.proposedName = value;
    } else if (field[1] === "status") {
      current.status = value;
    } else {
      current.observationCount = value.match(/\bobs_[a-z0-9-]+_\d{4}\b/gu)?.length ?? 0;
    }
  }

  flush();
  return entries.join("\n");
}

async function buildHarness(
  config: HarnessConfig,
  selection: ModelSelection,
  transcript: TranscriptWriter,
  command: HarnessRunCommand,
  sessionId = transcript.runId,
  toolOptions: WikiToolOptions = {},
) {
  const repoRoot = getRepoRoot();
  const env = new NodeExecutionEnv({ cwd: repoRoot });
  const source = (dir: string) => ({ path: dir, source: { type: "project", dir } satisfies Source });

  const { skills, diagnostics: skillDiagnostics } = await loadSourcedSkills<Source>(
    env,
    [source(join(repoRoot, ".pi/skills"))],
  );
  const { promptTemplates, diagnostics: promptDiagnostics } = await loadSourcedPromptTemplates<Source>(
    env,
    [source(join(repoRoot, ".pi/prompts"))],
  );

  const diagnostics = [...skillDiagnostics, ...promptDiagnostics];
  if (diagnostics.length > 0) {
    const message = diagnostics.map((diagnostic) => `${diagnostic.path}: ${diagnostic.message}`).join("\n");
    throw new Error(`Resource loading diagnostics:\n${message}`);
  }

  const sessionRepo = new JsonlSessionRepo({
    fs: env,
    sessionsRoot: join(repoRoot, config.transcriptsDir, "sessions"),
  });
  const session = await sessionRepo.create({
    id: sessionId,
    cwd: repoRoot,
  });
  const sessionMetadata = await session.getMetadata();

  await session.appendCustomMessageEntry(
    "harness_audit",
    `Harness run ${transcript.runId} initialized`,
    false,
    {
      runId: transcript.runId,
      sessionId,
      runDir: transcript.runDir,
      eventsPath: transcript.eventsPath,
      profile: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
    },
  );
  await session.appendCustomEntry("plato_run_initialized", {
    runId: transcript.runId,
    sessionId,
    runDir: transcript.runDir,
    eventsPath: transcript.eventsPath,
    profile: selection.profileName,
    provider: selection.model.provider,
    model: selection.model.id,
  });

  transcript.write("resources_loaded", {
    skills: skills.map(({ skill }) => ({ name: skill.name, filePath: skill.filePath })),
    promptTemplates: promptTemplates.map(({ promptTemplate }) => promptTemplate.name),
    sessionPath: sessionMetadata.path,
  });

  const protocolContext = readContextFile("docs/plato-wiki-extraction-protocol.md", true);

  transcript.write("system_context_loaded", {
    protocolPath: "docs/plato-wiki-extraction-protocol.md",
    protocolBytes: Buffer.byteLength(protocolContext),
  });

  const agent = new AgentHarness({
    env,
    session,
    tools: createWikiTools(transcript, command, toolOptions),
    model: selection.model,
    thinkingLevel: selection.profile?.disableReasoning ? "off" : "high",
    resources: {
      skills: skills.map(({ skill }) => skill),
      promptTemplates: promptTemplates.map(({ promptTemplate }) => promptTemplate),
    },
    getApiKeyAndHeaders: async () => {
      const apiKey = getModelApiKey(selection);
      if (!apiKey) return undefined;

      if (selection.profile?.apiKeyHeader) {
        return {
          apiKey,
          headers: { [selection.profile.apiKeyHeader]: apiKey },
        };
      }

      return { apiKey };
    },
    systemPrompt: ({ env: harnessEnv, resources }) =>
      [
        isRelationCommand(command)
          ? "You maintain Plato relation ledgers over reviewed claims."
          : isClaimCommand(command)
          ? "You maintain a Plato claim ledger."
          : "You maintain a Plato textual observation wiki.",
        "Extract records, not readings.",
        "Read canonical Greek from raw/plato/greek. Do not read translation files.",
        "Never ask the model to find esotericism or generate hypotheses.",
        isPromptInjectedLedgerCommand(command)
          ? "The extraction protocol is provided in this system prompt. The run prompt injects the exact records and context for the current batch."
          : "The extraction protocol is provided in this system prompt. The current feature registry is injected at run start and refreshed if it changes during a run.",
        command === "claims-segmented"
          ? "Use only the prompt-injected segment text, prompt-injected allowed marker list, prompt-injected turn table, and wiki_append_claims; claim extraction exposes no repository read or source-span tools."
          : command === "claims-review-segmented"
          ? "Use only the prompt-injected target claim records, wiki_source_span, and wiki_update_claim_review_statuses. Do not use shell commands, grep, file listing, repository reads, or scans outside the target records."
          : command === "relations-segmented"
          ? "Use only the prompt-injected candidate pairs, prompt-injected claim records, wiki_source_span for required resolution refs, and wiki_append_relations. Do not use shell commands, grep, file listing, repository reads, or scans outside the target pairs."
          : command === "relations-review-segmented"
          ? "Use only the prompt-injected target relation records, wiki_source_span, and wiki_update_relation_review_statuses. Do not use shell commands, grep, file listing, repository reads, or scans outside the target records."
          : isClaimCommand(command)
          ? "Use only the prompt-injected turn table and wiki_source_span; no claim command exposes repository file reads."
          : "Use wiki_read_file before using source text or observation files not included in this system prompt.",
        command === "claims-segmented"
          ? "Use only stephanus_span values allowed by the prompt-injected marker list. Include a source_ref key for every cited span; wiki_append_claims canonicalizes source_ref fields and rejects citations outside the current segment."
          : isRelationCommand(command)
          ? "Use wiki_source_span for each required resolution_ref.source_ref; do not calculate offsets yourself."
          : isClaimCommand(command)
          ? "Use wiki_source_span for every claim source_ref and every stance event source_ref; do not calculate offsets yourself."
          : "Use wiki_source_span for every observation source_ref; do not calculate offsets yourself.",
        isRelationCommand(command)
          ? "Relation records store claim ids, writer-assigned ledger pair ids, resolution refs, and concise English basis/limits fields. Do not persist source excerpts."
          : isClaimCommand(command)
          ? "Claim records store references, not source snippets. Keep Greek only in greek_terms; write content and limits in English with Stephanus refs."
          : "Observation records store references, not source snippets. Keep Greek only in greek_terms; write observation, textual_basis, limits, and gloss fields in English with Stephanus refs.",
        isRelationCommand(command)
          ? "Relations classify textual compatibility between two reviewed claim records. Do not infer speaker intent or use school vocabulary."
          : isClaimCommand(command)
          ? "Claims restate what is asserted, reported, posed, challenged, revised, withdrawn, reaffirmed, or refuted at cited spans. Do not infer hidden intent."
          : `Every observation must include feature_family. Prefer these seed families: ${SEED_FEATURE_FAMILIES.join(", ")}. If no seed family fits, use a narrow lowercase snake_case passthrough family.`,
        isRelationCommand(command)
          ? "resolution is constrained by the linked claims' final_status values and any cited resolving span."
          : isClaimCommand(command)
          ? "final_status is mechanical: derive it only from the last stance event kind."
          : "feature_label names a RECURRING textual phenomenon, not the content of one passage. Reuse an existing label from the labels-by-family list whenever the phenomenon matches. Put passage-specific content in the observation field, not the label. Create a new label only when no existing label names the phenomenon.",
        command === "claims-segmented"
          ? "If wiki_append_claims rejects a segment delta, fix the concise validation feedback and call it again."
          : command === "claims-review-segmented"
          ? "If wiki_update_claim_review_statuses rejects a batch, fix the concise validation feedback and call it again."
          : command === "relations-segmented"
          ? "If wiki_append_relations rejects a batch, fix the concise validation feedback and call it again."
          : command === "relations-review-segmented"
          ? "If wiki_update_relation_review_statuses rejects a batch, fix the concise validation feedback and call it again."
          : command === "ingest-segmented"
          ? "If wiki_append_observations rejects a segment delta, fix the concise validation feedback and call it again."
          : command === "ingest"
          ? "If wiki_stage_observation rejects a ledger, fix the concise validation feedback and call it again."
          : "If wiki_write_observation rejects a ledger, fix the concise validation feedback and call it again.",
        command === "claims-segmented"
          ? "For greek_outside_terms feedback, do not read the source again. Rewrite the same claim records with Greek script only in greek_terms, then call wiki_append_claims again."
          : command === "ingest-segmented"
          ? "For greek_outside_terms feedback, do not read the source again. Rewrite the same records with Greek script only in greek_terms, then call wiki_append_observations again."
          : "",
        command === "claims-segmented"
          ? "During segmented claim extraction, write only new claim records for the current segment with wiki_append_claims. If the segment has no extractable claims, call wiki_append_claims with empty content."
          : command === "claims-review-segmented"
          ? "During segmented claim review, persist only review_status changes with wiki_update_claim_review_statuses. Leave non-target claim statuses unchanged."
          : command === "relations-segmented"
          ? "During relation adjudication, write exactly one relation decision for each target candidate key with wiki_append_relations; the canonical writer assigns pair_id."
          : command === "relations-review-segmented"
          ? "During segmented relation review, persist only review_status changes with wiki_update_relation_review_statuses. Leave non-target relation statuses unchanged."
          : command === "ingest-segmented"
          ? "During segmented ingest, write only new observation records for the current segment with wiki_append_observations. Do not call wiki_stage_observation or wiki_commit_observation."
          : command === "ingest"
          ? "During ingest, validate drafts with wiki_stage_observation, then persist the final accepted staged ledger exactly once with wiki_commit_observation. The harness normalizes feature_family and feature_label, then assigns feature_id."
          : "During review, persist observation ledgers with wiki_write_observation. The harness normalizes feature_family and feature_label, then assigns feature_id.",
        command === "claims-review-segmented"
          ? "A segmented claim review batch is complete only when every target claim id in the batch is no longer unreviewed."
          : command === "relations-segmented"
          ? "A relation adjudication batch is complete only when every target candidate key has exactly one relation record for its ordered claim pair."
          : command === "relations-review-segmented"
          ? "A segmented relation review batch is complete only when every target relation id in the batch is no longer unreviewed."
          : command === "review"
          ? "A review run is complete only when no observation in the ledger remains unreviewed. Set each observation to accepted, rejected, or needs_split based on local textual support before writing the final ledger."
          : command === "review-segmented"
            ? "A segmented review batch is complete only when every target observation id in the batch is no longer unreviewed. Leave non-target observation statuses unchanged."
          : "",
        isRelationCommand(command)
          ? "Relation commands do not synchronize wiki/features-so-far.md and must not edit claim or observation ledgers."
          : isClaimCommand(command)
          ? "Claim commands do not synchronize wiki/features-so-far.md and must not edit observation ledgers."
          : command === "ingest-segmented"
          ? "During segmented ingest, only wiki_append_observations synchronizes wiki/features-so-far.md. Do not write the feature registry yourself."
          : command === "ingest"
          ? "During ingest, only wiki_commit_observation synchronizes wiki/features-so-far.md. Do not write the feature registry yourself."
          : "During review, persist feature registry changes by writing the full updated wiki/features-so-far.md with wiki_write_feature_registry.",
        "The harness writes the ingest-log entry automatically; do not write run history yourself.",
        isReviewCommand(command)
          ? "If wiki_write_feature_registry rejects the registry, fix the concise validation feedback and call it again."
          : "",
        "Do not say that a file was created or updated unless the corresponding tool call succeeded.",
        formatSkillsForSystemPrompt(resources.skills ?? []),
        "## Plato Wiki Extraction Protocol",
        protocolContext.trim(),
        `Wiki directory: ${join(harnessEnv.cwd, "wiki")}`,
        `Greek text directory: ${join(harnessEnv.cwd, "raw/plato/greek")}`,
      ]
        .filter((part) => part.length > 0)
        .join("\n\n"),
  });

  let lastFeatureContextContent = "";

  agent.on("before_agent_start", (event) => {
    if (isPromptInjectedLedgerCommand(command)) return undefined;

    const featuresContext = readFeatureRegistry();
    lastFeatureContextContent = featuresContext;
    const featureRegistrySection = featureRegistrySystemSection(featuresContext);
    transcript.write("features_system_context_refreshed", {
      path: "wiki/features-so-far.md",
      bytes: Buffer.byteLength(featuresContext),
      messageBytes: Buffer.byteLength(featureRegistrySection),
    });

    return {
      systemPrompt: [event.systemPrompt, featureRegistrySection].join("\n\n"),
    };
  });

  agent.on("context", (event) => {
    if (isPromptInjectedLedgerCommand(command)) return undefined;

    const featuresContext = readFeatureRegistry();
    if (featuresContext === lastFeatureContextContent) return undefined;

    lastFeatureContextContent = featuresContext;
    const compactIndex = compactFeatureRegistryIndex(featuresContext);
    const text = ["## Current features-so-far compact index", compactIndex || "(none yet)"].join("\n\n");

    transcript.write("features_context_index_injected", {
      path: "wiki/features-so-far.md",
      sourceBytes: Buffer.byteLength(featuresContext),
      messageBytes: Buffer.byteLength(text),
    });

    return {
      messages: [
        {
          role: "user" as const,
          content: [{ type: "text" as const, text }],
          timestamp: Date.now(),
        },
        ...event.messages,
      ],
    };
  });

  agent.on("before_provider_payload", (event) => {
    let payload = event.payload;
    let changed = false;
    let disabledReasoning = false;

    if (selection.profile?.disableReasoning) {
      const result = disableDeepSeekThinkingPayload(payload);
      payload = result.payload;
      disabledReasoning = result.changed;
      changed ||= result.changed;
    }

    if (command === "ingest-segmented" || command === "claims-segmented" || command === "relations-segmented") {
      const result = requireToolChoicePayload(payload);
      payload = result.payload;
      if (result.changed) {
        transcript.write("provider_payload_tool_choice_required", {
          provider: event.model.provider,
          model: event.model.id,
        });
      }
      changed ||= result.changed;
    }

    if (disabledReasoning) {
      transcript.write("provider_payload_reasoning_disabled", {
        provider: event.model.provider,
        model: event.model.id,
      });
    }

    return changed ? { payload } : undefined;
  });

  agent.on("tool_result", (event) => {
    const text = event.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    if (event.toolName === "wiki_source_span" && event.isError && text.includes("Claim source-span call limit exceeded")) {
      transcript.write("claim_source_span_limit_terminated", {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
      });

      return {
        terminate: true,
      };
    }

    if (event.toolName === "wiki_source_span" && event.isError && text.includes("Relation source-span call limit exceeded")) {
      transcript.write("relation_source_span_limit_terminated", {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
      });

      return {
        terminate: true,
      };
    }

    if (event.toolName !== "wiki_write_feature_registry" || !event.isError) return undefined;

    if (!text.includes("Repeated feature registry rejection threshold reached.")) return undefined;

    transcript.write("feature_registry_repeated_rejection_terminated", {
      toolCallId: event.toolCallId,
      toolName: event.toolName,
    });

    return {
      terminate: true,
    };
  });

  agent.subscribe((event) => {
    transcript.write("agent_event", {
      eventType: event.type,
      ...summarizeEvent(event),
    });

    if (event.type === "message_end" && event.message.role === "assistant") {
      transcript.recordAssistantUsage(event.message);
    }
  });

  return {
    agent,
    session,
    sessionPath: sessionMetadata.path,
    skillCount: skills.length,
    promptCount: promptTemplates.length,
  };
}

function writeRunSummary(
  transcript: TranscriptWriter,
  command: HarnessRunCommand,
  subject: string,
  dryRun: boolean,
  selection: ModelSelection,
  sessionPath: string,
) {
  const repoRoot = getRepoRoot();
  transcript.writeSummary(`# Harness Run

- Run: \`${transcript.runId}\`
- Command: \`${command}\`
- Subject: \`${subject}\`
- Dry run: \`${dryRun}\`
- Profile: \`${selection.profileName}\`
- Provider: \`${selection.model.provider}\`
- Model: \`${selection.model.id}\`
- Session JSONL: \`${relative(repoRoot, sessionPath)}\`
- Events JSONL: \`${relative(repoRoot, transcript.eventsPath)}\`
- Response: \`${relative(repoRoot, transcript.responsePath)}\`
- Usage JSON: \`${relative(repoRoot, transcript.usagePath)}\`
- Usage Markdown: \`${relative(repoRoot, transcript.usageMarkdownPath)}\`
`);
}

function formatSegmentPlan(segments: SegmentedIngestSegment[]) {
  const lines = [`segments: ${segments.length}`];
  for (const [index, segment] of segments.entries()) {
    const status = segment.completed ? `skip existing=${segment.existingObservationIds.join(",")}` : "pending";
    lines.push(
      `- ${index + 1}. ${segment.dialogue}: ${segment.span} markers=${segment.markerCount} bytes=${segment.sourceBytes} ${status}`,
    );
  }
  return lines.join("\n");
}

function formatClaimSegmentPlan(segments: ReturnType<typeof planSegmentedClaims>) {
  const lines = [`claim_segments: ${segments.length}`];
  for (const [index, segment] of segments.entries()) {
    const status = segment.completed ? `skip existing=${segment.existingClaimIds.join(",")}` : "pending";
    lines.push(
      `- ${index + 1}. ${segment.dialogue}: ${segment.span} markers=${segment.markerCount} bytes=${segment.sourceBytes} ${status}`,
    );
  }
  return lines.join("\n");
}

function formatReviewBatchPlan(batches: SegmentedReviewBatch[]) {
  const lines = [`review_batches: ${batches.length}`];
  for (const batch of batches) {
    lines.push(`- ${batch.index}. ${batch.dialogue}: ${batch.observationIds.join(", ")}`);
  }
  return lines.join("\n");
}

function formatClaimReviewBatchPlan(batches: SegmentedClaimReviewBatch[]) {
  const lines = [`claim_review_batches: ${batches.length}`];
  for (const batch of batches) {
    lines.push(`- ${batch.index}. ${batch.dialogue}: ${batch.claimIds.join(", ")}`);
  }
  return lines.join("\n");
}

function formatRelationBatchPlan(batches: SegmentedRelationBatch[]) {
  const lines = [`relation_batches: ${batches.length}`];
  for (const batch of batches) {
    lines.push(`- ${batch.index}. ${batch.scope}: ${batch.candidateKeys.join(", ")}`);
  }
  return lines.join("\n");
}

function formatRelationReviewBatchPlan(batches: SegmentedRelationReviewBatch[]) {
  const lines = [`relation_review_batches: ${batches.length}`];
  for (const batch of batches) {
    lines.push(`- ${batch.index}. ${batch.scope}: ${batch.relationIds.join(", ")}`);
  }
  return lines.join("\n");
}

function appendHarnessIngestLog(
  command: HarnessRunCommand,
  dialogue: string,
  transcript: TranscriptWriter,
  selection: ModelSelection,
  beforeFeatureIds: Set<string>,
) {
  const repoRoot = getRepoRoot();
  const observationPath = join(repoRoot, "wiki/observations", `${dialogue}.md`);
  const observationContent = existsSync(observationPath) ? readFileSync(observationPath, "utf8") : "";
  const links = extractObservationFeatureLinks(observationContent);
  const { observationCount, familyCounts } = ingestLogCountsFromLinks(links);
  const afterFeatureIds = featureCandidateIds(readFeatureRegistry());
  const spanRange = ledgerSpanRange(observationContent);
  const entry = formatIngestLogEntry({
    command,
    dialogue,
    runId: transcript.runId,
    timestamp: new Date().toISOString(),
    provider: selection.model.provider,
    model: selection.model.id,
    profile: selection.profileName,
    observationCount,
    familyCounts,
    newFeatureIds: sortedSetDifference(afterFeatureIds, beforeFeatureIds),
    ...(spanRange ? { spanRange } : {}),
  });
  const relativePath = "wiki/ingest-log.md";
  assertLedgerAppendPath(relativePath);
  const content = prepareLedgerAppend(entry);
  withRepoWriteLock({ paths: [relativePath], label: `ingest_log:${dialogue}` }, () => {
    appendFileSync(join(repoRoot, relativePath), content, "utf8");
  });
  transcript.write("harness_ingest_log_appended", {
    path: relativePath,
    bytes: Buffer.byteLength(content),
  });
}

function claimStatusCounts(content: string) {
  const counts = new Map<string, number>();
  for (const block of claimYamlBlocks(content)) {
    const status = fieldValue(block, "review_status") || "unreviewed";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function appendHarnessClaimLog(
  command: HarnessRunCommand,
  dialogue: string,
  transcript: TranscriptWriter,
  selection: ModelSelection,
) {
  const repoRoot = getRepoRoot();
  const claimPath = join(repoRoot, "wiki/claims", `${dialogue}.md`);
  const claimContent = existsSync(claimPath) ? readFileSync(claimPath, "utf8") : "";
  const claimCount = claimYamlBlocks(claimContent).length;
  const statuses = claimStatusCounts(claimContent)
    .map(([status, count]) => `${status}=${count}`)
    .join(", ") || "(none)";
  const spanRange = ledgerSpanRange(claimContent);
  const entry = [
    `## ${new Date().toISOString()} ${command} ${dialogue}`,
    "",
    `- run_id: ${transcript.runId}`,
    `- provider/model: ${selection.model.provider}/${selection.model.id} (profile ${selection.profileName})`,
    `- claims: ${claimCount}`,
    `- span_range: ${spanRange ?? "n/a"}`,
    `- review_statuses: ${statuses}`,
  ].join("\n");
  const relativePath = "wiki/ingest-log.md";
  assertLedgerAppendPath(relativePath);
  const content = prepareLedgerAppend(entry);
  withRepoWriteLock({ paths: [relativePath], label: `claim_log:${dialogue}` }, () => {
    appendFileSync(join(repoRoot, relativePath), content, "utf8");
  });
  transcript.write("harness_ingest_log_appended", {
    path: relativePath,
    bytes: Buffer.byteLength(content),
  });
}

function relationStatusCounts(content: string) {
  const counts = new Map<string, number>();
  for (const block of relationYamlBlocks(content)) {
    const status = fieldValue(block, "review_status") || "unreviewed";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function appendHarnessRelationLog(
  command: HarnessRunCommand,
  scope: string,
  transcript: TranscriptWriter,
  selection: ModelSelection,
) {
  const repoRoot = getRepoRoot();
  const relationPath = join(repoRoot, "wiki/relations", `${scope}.md`);
  const relationContent = existsSync(relationPath) ? readFileSync(relationPath, "utf8") : "";
  const relationCount = relationYamlBlocks(relationContent).length;
  const statuses = relationStatusCounts(relationContent)
    .map(([status, count]) => `${status}=${count}`)
    .join(", ") || "(none)";
  const entry = [
    `## ${new Date().toISOString()} ${command} ${scope}`,
    "",
    `- run_id: ${transcript.runId}`,
    `- provider/model: ${selection.model.provider}/${selection.model.id} (profile ${selection.profileName})`,
    `- relations: ${relationCount}`,
    `- review_statuses: ${statuses}`,
  ].join("\n");
  const relativePath = "wiki/ingest-log.md";
  assertLedgerAppendPath(relativePath);
  const content = prepareLedgerAppend(entry);
  withRepoWriteLock({ paths: [relativePath], label: `relation_log:${scope}` }, () => {
    appendFileSync(join(repoRoot, relativePath), content, "utf8");
  });
  transcript.write("harness_ingest_log_appended", {
    path: relativePath,
    bytes: Buffer.byteLength(content),
  });
}

export function assertObservationWriteOccurred(writeCountBefore: number, writeCountAfter: number, context: string) {
  if (writeCountAfter > writeCountBefore) return;

  throw new Error(`${context} completed without writing observations; refusing to continue.`);
}

export function assertNoRejectedAppendWithoutWrite(
  writeCountBefore: number,
  writeCountAfter: number,
  rejectCountBefore: number,
  rejectCountAfter: number,
  context: string,
) {
  if (writeCountAfter > writeCountBefore) return;
  if (rejectCountAfter === rejectCountBefore) return;

  throw new Error(
    `${context} had rejected append attempts but no accepted observations; refusing to mark no_observations.`,
  );
}

export function assertAssistantSucceeded(
  response: { stopReason?: string; errorMessage?: string | undefined },
  context: string,
) {
  if (response.stopReason !== "error" && response.stopReason !== "aborted") return;

  const reason = response.errorMessage ? `: ${response.errorMessage}` : "";
  throw new Error(`${context} failed with stopReason=${response.stopReason}${reason}`);
}

export function disableDeepSeekThinkingPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { payload, changed: false };
  }

  const current = payload as Record<string, unknown>;
  const currentThinking = current.thinking;
  const alreadyDisabled =
    currentThinking &&
    typeof currentThinking === "object" &&
    !Array.isArray(currentThinking) &&
    (currentThinking as Record<string, unknown>).type === "disabled" &&
    current.reasoning_effort === undefined;

  if (alreadyDisabled) {
    return { payload, changed: false };
  }

  const next: Record<string, unknown> = {
    ...current,
    thinking: { type: "disabled" },
  };
  delete next.reasoning_effort;

  return { payload: next, changed: true };
}

export function requireToolChoicePayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { payload, changed: false };
  }

  const current = payload as Record<string, unknown>;
  const hasTools = Array.isArray(current.tools) && current.tools.length > 0;
  if (!hasTools || current.tool_choice === "required") {
    return { payload, changed: false };
  }

  return {
    payload: {
      ...current,
      tool_choice: "required",
    },
    changed: true,
  };
}

export async function runHarnessCommand(
  command: HarnessRunCommand,
  dialogue: string,
  options: HarnessRunOptions,
): Promise<HarnessRunResult> {
  if (
    command === "relations-segmented" &&
    Object.prototype.hasOwnProperty.call(options as object, "pairIds")
  ) {
    throw new Error("Relation pairIds was removed; use candidateKeys.");
  }

  const repoRoot = getRepoRoot();
  const sourcePath = join(repoRoot, "raw/plato/greek", `${dialogue}.txt`);
  if (!isRelationCommand(command) && !existsSync(sourcePath)) {
    throw new Error(`Missing Greek text for dialogue: ${dialogue}`);
  }

  ensureProvidersRegistered();

  const config = readConfig();
  const selection = selectModel(config, options);
  const transcript = createTranscript(config, command, dialogue, options.dryRun);
  const templateName = promptTemplateName(command);

  if (command === "review" && !options.dryRun && reviewLedgerComplete(dialogue)) {
    writeRunSummary(transcript, command, dialogue, false, selection, "(review already complete)");
    const beforeFeatureIds = featureCandidateIds(readFeatureRegistry());
    const responseText = `Review already complete for ${dialogue}; no observations remain unreviewed.\n`;
    transcript.write("review_already_complete", {
      command,
      dialogue,
      templateName,
    });
    transcript.writeResponse(responseText);
    appendHarnessIngestLog(command, dialogue, transcript, selection, beforeFeatureIds);
    transcript.write("run_completed", {
      command,
      dialogue,
      responsePath: transcript.responsePath,
      sessionPath: "(review already complete)",
    });

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount: 0,
      promptCount: 0,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: "(review already complete)",
      responseText,
    };
  }

  if (command === "review-segmented") {
    const allBatches = planSegmentedReview(dialogue, options.targetObservations ?? DEFAULT_REVIEW_TARGET_OBSERVATIONS);
    const batches = options.limit ? allBatches.slice(0, options.limit) : allBatches;
    writeRunSummary(transcript, command, dialogue, options.dryRun, selection, "(per-review-batch sessions)");

    if (options.dryRun) {
      const responseText = `Dry run prepared for segmented review ${dialogue}.\n${formatReviewBatchPlan(batches)}\n`;
      transcript.write("segmented_review_plan_prepared", {
        command,
        dialogue,
        batchCount: batches.length,
        pendingBatchCount: allBatches.length,
        targetObservations: options.targetObservations ?? DEFAULT_REVIEW_TARGET_OBSERVATIONS,
        limit: options.limit,
      });
      transcript.writeResponse(responseText);

      return {
        command,
        dialogue,
        dryRun: true,
        profileName: selection.profileName,
        provider: selection.model.provider,
        model: selection.model.id,
        skillCount: 0,
        promptCount: 0,
        templateName,
        transcriptDir: transcript.runDir,
        sessionPath: "(per-review-batch sessions)",
        responseText,
        segmentCount: batches.length,
        pendingSegmentCount: batches.length,
      };
    }

    if (batches.length > 0 && !getModelApiKey(selection)) {
      throw new Error(
        `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
          (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
      );
    }

    const beforeFeatureIds = featureCandidateIds(readFeatureRegistry());
    let firstSessionPath = "";
    let skillCount = 0;
    let promptCount = 0;
    const responses: string[] = [];

    for (const batch of batches) {
      const sessionId = `${transcript.runId}-review-${String(batch.index).padStart(3, "0")}`;
      const built = await buildHarness(config, selection, transcript, command, sessionId);
      firstSessionPath ||= built.sessionPath;
      skillCount = built.skillCount;
      promptCount = built.promptCount;

      writeRunSummary(transcript, command, `${dialogue} batch ${batch.index}`, false, selection, built.sessionPath);
      await built.session.appendCustomMessageEntry(
        "harness_audit",
        `Prepared segmented review for ${dialogue} batch ${batch.index}`,
        false,
        {
          command,
          dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          observationIds: batch.observationIds,
        },
      );
      await built.session.appendCustomEntry("plato_review_batch_prepared", {
        runId: transcript.runId,
        command,
        dialogue,
        batchIndex: batch.index,
        batchCount: batches.length,
        observationIds: batch.observationIds,
        transcriptDir: transcript.runDir,
      });

      try {
        const response = await built.agent.promptFromTemplate(templateName, [
          dialogue,
          batch.observationIds.join(", "),
          batch.summary,
        ]);
        assertAssistantSucceeded(response, `Segmented review ${dialogue} batch ${batch.index}`);
        const responseText = assistantText(response);
        if (!reviewTargetIdsComplete(dialogue, batch.observationIds)) {
          throw new Error(
            `Segmented review batch ${batch.index} did not complete target observations: ${batch.observationIds.join(", ")}`,
          );
        }

        responses.push(`## Batch ${batch.index}: ${batch.observationIds.join(", ")}\n\n${responseText}`);
        transcript.write("segmented_review_batch_completed", {
          dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          observationIds: batch.observationIds,
          stopReason: response.stopReason,
          sessionPath: built.sessionPath,
        });
        await built.session.appendCustomEntry("plato_review_batch_completed", {
          runId: transcript.runId,
          command,
          dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          observationIds: batch.observationIds,
          stopReason: response.stopReason,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transcript.write("run_failed", {
          command,
          dialogue,
          batchIndex: batch.index,
          observationIds: batch.observationIds,
          error: message,
        });
        transcript.writeResponse(`Run failed: ${message}\n`);
        await built.session.appendCustomEntry("plato_review_batch_failed", {
          runId: transcript.runId,
          command,
          dialogue,
          batchIndex: batch.index,
          observationIds: batch.observationIds,
          error: message,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
        throw error;
      }
    }

    const responseText = responses.join("\n\n") || `No pending review batches for ${dialogue}.\n`;
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      command,
      dialogue,
      batchCount: batches.length,
      responsePath: transcript.responsePath,
      sessionPath: firstSessionPath,
    });
    appendHarnessIngestLog(command, dialogue, transcript, selection, beforeFeatureIds);

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: firstSessionPath,
      responseText,
      segmentCount: batches.length,
      pendingSegmentCount: batches.length,
    };
  }

  if (command === "relations-review-segmented") {
    const allBatches = planSegmentedRelationReview(
      dialogue,
      options.targetRelations ?? DEFAULT_RELATION_REVIEW_TARGET_RELATIONS,
      options.relationIds,
    );
    const batches = options.limit ? allBatches.slice(0, options.limit) : allBatches;
    writeRunSummary(transcript, command, dialogue, options.dryRun, selection, "(per-relation-review-batch sessions)");

    if (options.dryRun) {
      const responseText = `Dry run prepared for segmented relation review ${dialogue}.\n${formatRelationReviewBatchPlan(batches)}\n`;
      transcript.write("segmented_relation_review_plan_prepared", {
        command,
        scope: dialogue,
        batchCount: batches.length,
        pendingBatchCount: allBatches.length,
        targetRelations: options.targetRelations ?? DEFAULT_RELATION_REVIEW_TARGET_RELATIONS,
        limit: options.limit,
      });
      transcript.writeResponse(responseText);

      return {
        command,
        dialogue,
        dryRun: true,
        profileName: selection.profileName,
        provider: selection.model.provider,
        model: selection.model.id,
        skillCount: 0,
        promptCount: 0,
        templateName,
        transcriptDir: transcript.runDir,
        sessionPath: "(per-relation-review-batch sessions)",
        responseText,
        segmentCount: batches.length,
        pendingSegmentCount: batches.length,
      };
    }

    if (batches.length > 0 && !getModelApiKey(selection)) {
      throw new Error(
        `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
          (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
      );
    }

    let firstSessionPath = "";
    let skillCount = 0;
    let promptCount = 0;
    const responses: string[] = [];

    for (const batch of batches) {
      const sessionId = `${transcript.runId}-relation-review-${String(batch.index).padStart(3, "0")}`;
      const built = await buildHarness(config, selection, transcript, command, sessionId);
      firstSessionPath ||= built.sessionPath;
      skillCount = built.skillCount;
      promptCount = built.promptCount;

      writeRunSummary(transcript, command, `${dialogue} relation batch ${batch.index}`, false, selection, built.sessionPath);
      await built.session.appendCustomMessageEntry(
        "harness_audit",
        `Prepared segmented relation review for ${dialogue} batch ${batch.index}`,
        false,
        {
          command,
          scope: dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          relationIds: batch.relationIds,
        },
      );
      await built.session.appendCustomEntry("plato_relation_review_batch_prepared", {
        runId: transcript.runId,
        command,
        scope: dialogue,
        batchIndex: batch.index,
        batchCount: batches.length,
        relationIds: batch.relationIds,
        transcriptDir: transcript.runDir,
      });

      try {
        const response = await built.agent.promptFromTemplate(templateName, [
          dialogue,
          batch.relationIds.join(", "),
          batch.summary,
        ]);
        assertAssistantSucceeded(response, `Segmented relation review ${dialogue} batch ${batch.index}`);
        const responseText = assistantText(response);
        if (!relationReviewTargetIdsComplete(dialogue, batch.relationIds)) {
          throw new Error(`Segmented relation review batch ${batch.index} did not complete target relations: ${batch.relationIds.join(", ")}`);
        }

        responses.push(`## Relation Review Batch ${batch.index}: ${batch.relationIds.join(", ")}\n\n${responseText}`);
        transcript.write("segmented_relation_review_batch_completed", {
          scope: dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          relationIds: batch.relationIds,
          stopReason: response.stopReason,
          sessionPath: built.sessionPath,
        });
        await built.session.appendCustomEntry("plato_relation_review_batch_completed", {
          runId: transcript.runId,
          command,
          scope: dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          relationIds: batch.relationIds,
          stopReason: response.stopReason,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transcript.write("run_failed", {
          command,
          scope: dialogue,
          batchIndex: batch.index,
          relationIds: batch.relationIds,
          error: message,
        });
        transcript.writeResponse(`Run failed: ${message}\n`);
        await built.session.appendCustomEntry("plato_relation_review_batch_failed", {
          runId: transcript.runId,
          command,
          scope: dialogue,
          batchIndex: batch.index,
          relationIds: batch.relationIds,
          error: message,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
        throw error;
      }
    }

    const responseText = responses.join("\n\n") || `No pending relation review batches for ${dialogue}.\n`;
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      command,
      scope: dialogue,
      batchCount: batches.length,
      responsePath: transcript.responsePath,
      sessionPath: firstSessionPath,
    });
    appendHarnessRelationLog(command, dialogue, transcript, selection);

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: firstSessionPath,
      responseText,
      segmentCount: batches.length,
      pendingSegmentCount: batches.length,
    };
  }

  if (command === "relations-segmented") {
    const allBatches = planSegmentedRelations(
      dialogue,
      options.targetPairs ?? DEFAULT_RELATION_TARGET_PAIRS,
      options.candidateKeys,
    );
    const batches = options.limit ? allBatches.slice(0, options.limit) : allBatches;
    writeRunSummary(transcript, command, dialogue, options.dryRun, selection, "(per-relation-batch sessions)");

    if (options.dryRun) {
      const responseText = `Dry run prepared for relation adjudication ${dialogue}.\n${formatRelationBatchPlan(batches)}\n`;
      transcript.write("segmented_relation_plan_prepared", {
        command,
        scope: dialogue,
        batchCount: batches.length,
        pendingBatchCount: allBatches.length,
        targetPairs: options.targetPairs ?? DEFAULT_RELATION_TARGET_PAIRS,
        limit: options.limit,
      });
      transcript.writeResponse(responseText);

      return {
        command,
        dialogue,
        dryRun: true,
        profileName: selection.profileName,
        provider: selection.model.provider,
        model: selection.model.id,
        skillCount: 0,
        promptCount: 0,
        templateName,
        transcriptDir: transcript.runDir,
        sessionPath: "(per-relation-batch sessions)",
        responseText,
        segmentCount: batches.length,
        pendingSegmentCount: batches.length,
      };
    }

    if (batches.length > 0 && !getModelApiKey(selection)) {
      throw new Error(
        `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
          (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
      );
    }

    let firstSessionPath = "";
    let skillCount = 0;
    let promptCount = 0;
    const responses: string[] = [];

    for (const batch of batches) {
      const sessionId = `${transcript.runId}-relation-${String(batch.index).padStart(3, "0")}`;
      const built = await buildHarness(config, selection, transcript, command, sessionId, {
        relationTargets: batch.targets,
      });
      firstSessionPath ||= built.sessionPath;
      skillCount = built.skillCount;
      promptCount = built.promptCount;

      writeRunSummary(transcript, command, `${dialogue} relation batch ${batch.index}`, false, selection, built.sessionPath);
      await built.session.appendCustomMessageEntry(
        "harness_audit",
        `Prepared relation adjudication for ${dialogue} batch ${batch.index}`,
        false,
        {
          command,
          scope: dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          candidateKeys: batch.candidateKeys,
          diagnosticPairIds: batch.diagnosticPairIds,
        },
      );
      await built.session.appendCustomEntry("plato_relation_batch_prepared", {
        runId: transcript.runId,
        command,
        scope: dialogue,
        batchIndex: batch.index,
        batchCount: batches.length,
        candidateKeys: batch.candidateKeys,
        diagnosticPairIds: batch.diagnosticPairIds,
        transcriptDir: transcript.runDir,
      });

      try {
        const appendCountBefore = transcript.eventCount("wiki_tool_append_relations");
        const appendRejectCountBefore = transcript.eventCount("wiki_tool_append_relations_rejected");
        const response = await built.agent.promptFromTemplate(templateName, [
          dialogue,
          batch.candidateKeys.join(", "),
          batch.summary,
        ]);
        assertAssistantSucceeded(response, `Relation adjudication ${dialogue} batch ${batch.index}`);
        const responseText = assistantText(response);
        const appendCountAfter = transcript.eventCount("wiki_tool_append_relations");
        const appendRejectCountAfter = transcript.eventCount("wiki_tool_append_relations_rejected");
        if (appendCountAfter === appendCountBefore) {
          if (appendRejectCountAfter > appendRejectCountBefore) {
            throw new Error(`Relation adjudication ${dialogue} batch ${batch.index} had rejected append attempts but no accepted relation append.`);
          }
          throw new Error(`Relation adjudication ${dialogue} batch ${batch.index} completed without calling wiki_append_relations.`);
        }
        if (!relationCandidateKeysComplete(dialogue, batch.candidateKeys)) {
          throw new Error(`Relation adjudication batch ${batch.index} did not cover target candidates: ${batch.candidateKeys.join(", ")}`);
        }

        responses.push(`## Relation Batch ${batch.index}: ${batch.candidateKeys.join(", ")}\n\n${responseText}`);
        transcript.write("segmented_relation_batch_completed", {
          scope: dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          candidateKeys: batch.candidateKeys,
          diagnosticPairIds: batch.diagnosticPairIds,
          stopReason: response.stopReason,
          sessionPath: built.sessionPath,
        });
        await built.session.appendCustomEntry("plato_relation_batch_completed", {
          runId: transcript.runId,
          command,
          scope: dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          candidateKeys: batch.candidateKeys,
          diagnosticPairIds: batch.diagnosticPairIds,
          stopReason: response.stopReason,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transcript.write("run_failed", { command, scope: dialogue, batchIndex: batch.index, candidateKeys: batch.candidateKeys, error: message });
        transcript.writeResponse(`Run failed: ${message}\n`);
        await built.session.appendCustomEntry("plato_relation_batch_failed", {
          runId: transcript.runId,
          command,
          scope: dialogue,
          batchIndex: batch.index,
          candidateKeys: batch.candidateKeys,
          diagnosticPairIds: batch.diagnosticPairIds,
          error: message,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
        throw error;
      }
    }

    const responseText = responses.join("\n\n") || `No pending relation batches for ${dialogue}.\n`;
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      command,
      scope: dialogue,
      batchCount: batches.length,
      responsePath: transcript.responsePath,
      sessionPath: firstSessionPath,
    });
    appendHarnessRelationLog(command, dialogue, transcript, selection);

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: firstSessionPath,
      responseText,
      segmentCount: batches.length,
      pendingSegmentCount: batches.length,
    };
  }

  if (command === "claims-review-segmented") {
    const allBatches = options.claimIds
      ? planClaimReviewForIds(dialogue, options.claimIds)
      : planSegmentedClaimReview(dialogue, options.targetClaims ?? DEFAULT_CLAIM_REVIEW_TARGET_CLAIMS);
    const batches = options.limit ? allBatches.slice(0, options.limit) : allBatches;
    writeRunSummary(transcript, command, dialogue, options.dryRun, selection, "(per-claim-review-batch sessions)");

    if (options.dryRun) {
      const responseText = `Dry run prepared for segmented claim review ${dialogue}.\n${formatClaimReviewBatchPlan(batches)}\n`;
      transcript.write("segmented_claim_review_plan_prepared", {
        command,
        dialogue,
        batchCount: batches.length,
        pendingBatchCount: allBatches.length,
        targetClaims: options.targetClaims ?? DEFAULT_CLAIM_REVIEW_TARGET_CLAIMS,
        claimIds: options.claimIds,
        limit: options.limit,
      });
      transcript.writeResponse(responseText);

      return {
        command,
        dialogue,
        dryRun: true,
        profileName: selection.profileName,
        provider: selection.model.provider,
        model: selection.model.id,
        skillCount: 0,
        promptCount: 0,
        templateName,
        transcriptDir: transcript.runDir,
        sessionPath: "(per-claim-review-batch sessions)",
        responseText,
        segmentCount: batches.length,
        pendingSegmentCount: batches.length,
      };
    }

    if (batches.length > 0 && !getModelApiKey(selection)) {
      throw new Error(
        `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
          (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
      );
    }

    let firstSessionPath = "";
    let skillCount = 0;
    let promptCount = 0;
    const responses: string[] = [];

    for (const batch of batches) {
      const sessionId = `${transcript.runId}-claim-review-${String(batch.index).padStart(3, "0")}`;
      const built = await buildHarness(config, selection, transcript, command, sessionId);
      firstSessionPath ||= built.sessionPath;
      skillCount = built.skillCount;
      promptCount = built.promptCount;

      writeRunSummary(transcript, command, `${dialogue} claim batch ${batch.index}`, false, selection, built.sessionPath);
      await built.session.appendCustomMessageEntry(
        "harness_audit",
        `Prepared segmented claim review for ${dialogue} batch ${batch.index}`,
        false,
        {
          command,
          dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          claimIds: batch.claimIds,
        },
      );
      await built.session.appendCustomEntry("plato_claim_review_batch_prepared", {
        runId: transcript.runId,
        command,
        dialogue,
        batchIndex: batch.index,
        batchCount: batches.length,
        claimIds: batch.claimIds,
        transcriptDir: transcript.runDir,
      });

      try {
        const response = await built.agent.promptFromTemplate(templateName, [
          dialogue,
          batch.claimIds.join(", "),
          batch.summary,
        ]);
        assertAssistantSucceeded(response, `Segmented claim review ${dialogue} batch ${batch.index}`);
        const responseText = assistantText(response);
        if (!claimReviewTargetIdsComplete(dialogue, batch.claimIds)) {
          throw new Error(`Segmented claim review batch ${batch.index} did not complete target claims: ${batch.claimIds.join(", ")}`);
        }

        responses.push(`## Claim Batch ${batch.index}: ${batch.claimIds.join(", ")}\n\n${responseText}`);
        transcript.write("segmented_claim_review_batch_completed", {
          dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          claimIds: batch.claimIds,
          stopReason: response.stopReason,
          sessionPath: built.sessionPath,
        });
        await built.session.appendCustomEntry("plato_claim_review_batch_completed", {
          runId: transcript.runId,
          command,
          dialogue,
          batchIndex: batch.index,
          batchCount: batches.length,
          claimIds: batch.claimIds,
          stopReason: response.stopReason,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transcript.write("run_failed", {
          command,
          dialogue,
          batchIndex: batch.index,
          claimIds: batch.claimIds,
          error: message,
        });
        transcript.writeResponse(`Run failed: ${message}\n`);
        await built.session.appendCustomEntry("plato_claim_review_batch_failed", {
          runId: transcript.runId,
          command,
          dialogue,
          batchIndex: batch.index,
          claimIds: batch.claimIds,
          error: message,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
        throw error;
      }
    }

    const responseText = responses.join("\n\n") || `No pending claim review batches for ${dialogue}.\n`;
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      command,
      dialogue,
      batchCount: batches.length,
      responsePath: transcript.responsePath,
      sessionPath: firstSessionPath,
    });
    appendHarnessClaimLog(command, dialogue, transcript, selection);

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: firstSessionPath,
      responseText,
      segmentCount: batches.length,
      pendingSegmentCount: batches.length,
    };
  }

  if (command === "claims-segmented") {
    if (options.gaps) {
      throw new Error("claims-segmented does not support --gaps; use explicit --from-marker/--to-marker or queue planning");
    }

    const targetBytes = options.targetBytes ?? DEFAULT_CLAIM_SEGMENT_TARGET_BYTES;
    const segments = planSegmentedClaims(dialogue, targetBytes, {
      fromMarker: options.fromMarker,
      toMarker: options.toMarker,
    });
    const pendingSegments = segments.filter((segment) => !segment.completed);
    writeRunSummary(transcript, command, dialogue, options.dryRun, selection, "(per-claim-segment sessions)");

    if (options.dryRun) {
      const responseText = `Dry run prepared for segmented claim extraction ${dialogue}.\n${formatClaimSegmentPlan(segments)}\n`;
      transcript.write("segmented_claim_plan_prepared", {
        command,
        dialogue,
        segmentCount: segments.length,
        pendingSegmentCount: pendingSegments.length,
        targetBytes,
        fromMarker: options.fromMarker,
        toMarker: options.toMarker,
      });
      transcript.writeResponse(responseText);

      return {
        command,
        dialogue,
        dryRun: true,
        profileName: selection.profileName,
        provider: selection.model.provider,
        model: selection.model.id,
        skillCount: 0,
        promptCount: 0,
        templateName,
        transcriptDir: transcript.runDir,
        sessionPath: "(per-claim-segment sessions)",
        responseText,
        segmentCount: segments.length,
        pendingSegmentCount: pendingSegments.length,
      };
    }

    if (pendingSegments.length > 0 && !getModelApiKey(selection)) {
      throw new Error(
        `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
          (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
      );
    }

    let firstSessionPath = "";
    let skillCount = 0;
    let promptCount = 0;
    const responses: string[] = [];

    for (const [index, segment] of segments.entries()) {
      if (segment.completed) {
        transcript.write("segmented_claim_segment_skipped", {
          dialogue,
          segmentIndex: index + 1,
          span: segment.span,
          existingClaimIds: segment.existingClaimIds,
        });
        continue;
      }

      const sessionId = `${transcript.runId}-claim-segment-${String(index + 1).padStart(3, "0")}`;
      const built = await buildHarness(config, selection, transcript, command, sessionId, {
        claimSegmentBounds: {
          dialogue,
          span: segment.span,
          startChar: segment.startChar,
          endChar: segment.endChar,
        },
      });
      firstSessionPath ||= built.sessionPath;
      skillCount = built.skillCount;
      promptCount = built.promptCount;

      writeRunSummary(transcript, command, `${dialogue} claims ${segment.span}`, false, selection, built.sessionPath);
      await built.session.appendCustomMessageEntry(
        "harness_audit",
        `Prepared segmented claim extraction for ${dialogue} ${segment.span}`,
        false,
        {
          command,
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
        },
      );
      await built.session.appendCustomEntry("plato_claim_segment_run_prepared", {
        runId: transcript.runId,
        command,
        dialogue,
        segmentIndex: index + 1,
        segmentCount: segments.length,
        span: segment.span,
        transcriptDir: transcript.runDir,
      });

      try {
        const appendCountBefore = transcript.eventCount("wiki_tool_append_claims");
        const emptyAppendCountBefore = transcript.eventCount("wiki_tool_append_claims_empty");
        const appendRejectCountBefore = transcript.eventCount("wiki_tool_append_claims_rejected");
        const response = await built.agent.promptFromTemplate(templateName, [
          dialogue,
          segment.span,
          speakerTurnTableForSegment(dialogue, segment),
          claimSegmentSourceSection(dialogue, segment),
        ]);
        assertAssistantSucceeded(response, `Segmented claim extraction ${dialogue} segment ${index + 1} (${segment.span})`);
        const responseText = assistantText(response);
        const appendCountAfter = transcript.eventCount("wiki_tool_append_claims");
        const emptyAppendCountAfter = transcript.eventCount("wiki_tool_append_claims_empty");
        const appendRejectCountAfter = transcript.eventCount("wiki_tool_append_claims_rejected");
        if (appendCountAfter === appendCountBefore && emptyAppendCountAfter === emptyAppendCountBefore) {
          if (appendRejectCountAfter > appendRejectCountBefore) {
            throw new Error(
              `Segmented claim extraction ${dialogue} segment ${index + 1} (${segment.span}) had rejected append attempts but no accepted claim append.`,
            );
          }
          throw new Error(
            `Segmented claim extraction ${dialogue} segment ${index + 1} (${segment.span}) completed without calling wiki_append_claims.`,
          );
        }
        const coverageStatus = appendCountAfter === appendCountBefore ? "no_claims" : "processed";
        const coverageAppended = appendClaimSegmentCoverage(
          {
            dialogue,
            span: segment.span,
            startMarker: segment.startMarker,
            endMarker: segment.endMarker,
            startChar: segment.startChar,
            endChar: segment.endChar,
            runId: transcript.runId,
            segmentIndex: index + 1,
          },
          coverageStatus,
        );
        transcript.write("segmented_claim_segment_coverage", {
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
          status: coverageStatus,
          coverageAppended,
        });
        responses.push(`## Claim Segment ${index + 1}: ${segment.span}\n\n${responseText}`);
        transcript.write("segmented_claim_segment_completed", {
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
          stopReason: response.stopReason,
          sessionPath: built.sessionPath,
        });
        await built.session.appendCustomEntry("plato_claim_segment_run_completed", {
          runId: transcript.runId,
          command,
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
          stopReason: response.stopReason,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transcript.write("run_failed", { command, dialogue, segmentIndex: index + 1, span: segment.span, error: message });
        transcript.writeResponse(`Run failed: ${message}\n`);
        await built.session.appendCustomEntry("plato_claim_segment_run_failed", {
          runId: transcript.runId,
          command,
          dialogue,
          segmentIndex: index + 1,
          span: segment.span,
          error: message,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
        throw error;
      }
    }

    const responseText = responses.join("\n\n") || `No pending claim segments for ${dialogue}.\n`;
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      command,
      dialogue,
      segmentCount: segments.length,
      pendingSegmentCount: pendingSegments.length,
      fromMarker: options.fromMarker,
      toMarker: options.toMarker,
      responsePath: transcript.responsePath,
      sessionPath: firstSessionPath,
    });
    appendHarnessClaimLog(command, dialogue, transcript, selection);

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: firstSessionPath,
      responseText,
      segmentCount: segments.length,
      pendingSegmentCount: pendingSegments.length,
    };
  }

  if (command === "ingest-segmented") {
    if (options.gaps && (options.fromMarker || options.toMarker)) {
      throw new Error("--gaps derives its own ranges; do not combine it with --from-marker or --to-marker");
    }

    const segments = options.gaps
      ? planSelectedGapSegments(dialogue, options)
      : planSegmentedIngest(dialogue, options.targetBytes ?? DEFAULT_SEGMENT_TARGET_BYTES, {
          fromMarker: options.fromMarker,
          toMarker: options.toMarker,
        });
    const pendingSegments = segments.filter((segment) => !segment.completed);
    writeRunSummary(transcript, command, dialogue, options.dryRun, selection, "(per-segment sessions)");

    if (options.dryRun) {
      const responseText = `Dry run prepared for segmented ingest ${dialogue}.\n${formatSegmentPlan(segments)}\n`;
      transcript.write("segmented_ingest_plan_prepared", {
        command,
        dialogue,
        segmentCount: segments.length,
        pendingSegmentCount: pendingSegments.length,
        targetBytes: options.targetBytes ?? DEFAULT_SEGMENT_TARGET_BYTES,
        fromMarker: options.fromMarker,
        toMarker: options.toMarker,
        gaps: options.gaps ?? false,
      });
      transcript.writeResponse(responseText);

      return {
        command,
        dialogue,
        dryRun: true,
        profileName: selection.profileName,
        provider: selection.model.provider,
        model: selection.model.id,
        skillCount: 0,
        promptCount: 0,
        templateName,
        transcriptDir: transcript.runDir,
        sessionPath: "(per-segment sessions)",
        responseText,
        segmentCount: segments.length,
        pendingSegmentCount: pendingSegments.length,
      };
    }

    if (pendingSegments.length > 0 && !getModelApiKey(selection)) {
      throw new Error(
        `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
          (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
      );
    }

    const beforeFeatureIds = featureCandidateIds(readFeatureRegistry());
    let firstSessionPath = "";
    let skillCount = 0;
    let promptCount = 0;
    const responses: string[] = [];

    for (const [index, segment] of segments.entries()) {
      if (segment.completed) {
        transcript.write("segmented_ingest_segment_skipped", {
          dialogue,
          segmentIndex: index + 1,
          span: segment.span,
          existingObservationIds: segment.existingObservationIds,
        });
        continue;
      }

      const sessionId = `${transcript.runId}-segment-${String(index + 1).padStart(3, "0")}`;
      const built = await buildHarness(config, selection, transcript, command, sessionId);
      firstSessionPath ||= built.sessionPath;
      skillCount = built.skillCount;
      promptCount = built.promptCount;

      writeRunSummary(transcript, command, `${dialogue} ${segment.span}`, false, selection, built.sessionPath);
      await built.session.appendCustomMessageEntry(
        "harness_audit",
        `Prepared segmented ingest for ${dialogue} ${segment.span}`,
        false,
        {
          command,
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
        },
      );
      await built.session.appendCustomEntry("plato_segment_run_prepared", {
        runId: transcript.runId,
        command,
        dialogue,
        segmentIndex: index + 1,
        segmentCount: segments.length,
        span: segment.span,
        transcriptDir: transcript.runDir,
      });

      try {
        const appendCountBefore = transcript.eventCount("wiki_tool_append_observations");
        const appendRejectCountBefore = transcript.eventCount("wiki_tool_append_observations_rejected");
        const response = await built.agent.promptFromTemplate(templateName, [
          dialogue,
          segment.startMarker,
          segment.endMarker,
          segment.span,
        ]);
        assertAssistantSucceeded(response, `Segmented ingest ${dialogue} segment ${index + 1} (${segment.span})`);
        const responseText = assistantText(response);
        const appendCountAfter = transcript.eventCount("wiki_tool_append_observations");
        const appendRejectCountAfter = transcript.eventCount("wiki_tool_append_observations_rejected");
        assertNoRejectedAppendWithoutWrite(
          appendCountBefore,
          appendCountAfter,
          appendRejectCountBefore,
          appendRejectCountAfter,
          `Segmented ingest ${dialogue} segment ${index + 1} (${segment.span})`,
        );
        const coverageStatus = appendCountAfter === appendCountBefore ? "no_observations" : "processed";
        const coverageAppended = appendSegmentCoverage(
          {
            dialogue,
            span: segment.span,
            startMarker: segment.startMarker,
            endMarker: segment.endMarker,
            startChar: segment.startChar,
            endChar: segment.endChar,
            runId: transcript.runId,
            segmentIndex: index + 1,
          },
          coverageStatus,
        );
        transcript.write("segmented_ingest_segment_coverage", {
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
          status: coverageStatus,
          coverageAppended,
        });
        responses.push(`## Segment ${index + 1}: ${segment.span}\n\n${responseText}`);
        transcript.write("segmented_ingest_segment_completed", {
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
          stopReason: response.stopReason,
          sessionPath: built.sessionPath,
        });
        await built.session.appendCustomEntry("plato_segment_run_completed", {
          runId: transcript.runId,
          command,
          dialogue,
          segmentIndex: index + 1,
          segmentCount: segments.length,
          span: segment.span,
          stopReason: response.stopReason,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transcript.write("run_failed", { command, dialogue, segmentIndex: index + 1, span: segment.span, error: message });
        transcript.writeResponse(`Run failed: ${message}\n`);
        await built.session.appendCustomEntry("plato_segment_run_failed", {
          runId: transcript.runId,
          command,
          dialogue,
          segmentIndex: index + 1,
          span: segment.span,
          error: message,
          transcriptDir: transcript.runDir,
          sessionPath: built.sessionPath,
        });
        throw error;
      }
    }

    const responseText = responses.join("\n\n") || `No pending segments for ${dialogue}.\n`;
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      command,
      dialogue,
      segmentCount: segments.length,
      pendingSegmentCount: pendingSegments.length,
      fromMarker: options.fromMarker,
      toMarker: options.toMarker,
      gaps: options.gaps ?? false,
      responsePath: transcript.responsePath,
      sessionPath: firstSessionPath,
    });
    appendHarnessIngestLog(command, dialogue, transcript, selection, beforeFeatureIds);

    return {
      command,
      dialogue,
      dryRun: false,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath: firstSessionPath,
      responseText,
      segmentCount: segments.length,
      pendingSegmentCount: pendingSegments.length,
    };
  }

  const { agent, session, sessionPath, skillCount, promptCount } = await buildHarness(config, selection, transcript, command);

  writeRunSummary(transcript, command, dialogue, options.dryRun, selection, sessionPath);
  await session.appendCustomMessageEntry(
    "harness_audit",
    `Prepared ${command} for ${dialogue}`,
    false,
    {
      command,
      dialogue,
      dryRun: options.dryRun,
      templateName,
    },
  );
  await session.appendCustomEntry("plato_run_prepared", {
    runId: transcript.runId,
    command,
    dialogue,
    dryRun: options.dryRun,
    templateName,
    transcriptDir: transcript.runDir,
  });

  if (options.dryRun) {
    transcript.write("dry_run_prepared", {
      command,
      dialogue,
      profile: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      templateName,
      sessionPath,
    });
    await session.appendCustomEntry("plato_run_dry_run", {
      runId: transcript.runId,
      command,
      dialogue,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath,
    });
    transcript.writeResponse(`Dry run prepared for ${command} ${dialogue}.
`);

    return {
      command,
      dialogue,
      dryRun: true,
      profileName: selection.profileName,
      provider: selection.model.provider,
      model: selection.model.id,
      skillCount,
      promptCount,
      templateName,
      transcriptDir: transcript.runDir,
      sessionPath,
    };
  }

  if (!getModelApiKey(selection)) {
    throw new Error(
      `Missing API key for ${selection.model.provider}. Set PI_API_KEY` +
        (selection.apiKeyEnv ? ` or ${selection.apiKeyEnv}.` : "."),
    );
  }

  const beforeFeatureIds = featureCandidateIds(readFeatureRegistry());
  let responseText: string;
  try {
    const commitCountBefore = transcript.eventCount("wiki_tool_commit_observation");
    const response = await agent.promptFromTemplate(templateName, [dialogue]);
    assertAssistantSucceeded(response, `${command} ${dialogue}`);
    responseText = assistantText(response);
    if (command === "ingest") {
      assertObservationWriteOccurred(
        commitCountBefore,
        transcript.eventCount("wiki_tool_commit_observation"),
        `Ingest ${dialogue}`,
      );
    }
    transcript.writeResponse(responseText);
    transcript.write("run_completed", {
      stopReason: response.stopReason,
      responsePath: transcript.responsePath,
      sessionPath,
    });
    await session.appendCustomEntry("plato_run_completed", {
      runId: transcript.runId,
      command,
      dialogue,
      stopReason: response.stopReason,
      responsePath: transcript.responsePath,
      transcriptDir: transcript.runDir,
      sessionPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    transcript.write("run_failed", { command, dialogue, error: message });
    transcript.writeResponse(`Run failed: ${message}\n`);
    await session.appendCustomEntry("plato_run_failed", {
      runId: transcript.runId,
      command,
      dialogue,
      error: message,
      transcriptDir: transcript.runDir,
      sessionPath,
    });
    throw error;
  }

  appendHarnessIngestLog(command, dialogue, transcript, selection, beforeFeatureIds);

  return {
    command,
    dialogue,
    dryRun: false,
    profileName: selection.profileName,
    provider: selection.model.provider,
    model: selection.model.id,
    skillCount,
    promptCount,
    templateName,
    transcriptDir: transcript.runDir,
    sessionPath,
    responseText,
  };
}

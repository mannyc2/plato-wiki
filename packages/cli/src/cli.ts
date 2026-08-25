import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  auditCompletenessFacts,
  buildAudioCoverageReport,
  buildCompletenessReport,
  buildJobManifest,
  buildPublicReleaseFacts,
  buildPublicReleaseReport,
  buildScreenplayGenerationReport,
  buildAnchorsReport,
  buildAdjudicationSample,
  buildClusters,
  buildCoverageReport,
  buildDossiers,
  buildRelationCandidates,
  clusterGateReport,
  collectLabelAudit,
  collectLabelQuality,
  listModels,
  listGreekDialogues,
  planSegmentedIngest,
  planSegmentedReview,
  planStephanusSegments,
  buildStaticSite,
  listProfiles,
  listProviders,
  listTranscripts,
  getRepoRoot,
  applyLabelMergeMap,
  runClaimQueue,
  runClaimReviewQueue,
  runRelationQueue,
  runRelationReviewQueue,
  runSegmentedIngestQueue,
  runSegmentedReviewQueue,
  runHarnessCommand,
  planLabelMergeMap,
  summarizeTranscriptTrace,
  validateLabelMergeMap,
  validateRepo,
  renderAnchorsReportText,
  renderAudioCoverageReport,
  renderCompletenessReport,
  renderPublicReleaseReport,
  writeLabelAudit,
  writeAdjudicationSample,
  writeLabelQuality,
  writeAnchorIndex,
  writeDossierArtifacts,
  writeObservationTurnJoins,
  writeVoiceIndexes,
  writeVoiceJoins,
  writeRelationCandidates,
  writeTokenIndexes,
  writeTurnIndexes,
  writeAnchorsReport,
  writeAudioCoverageReport,
  writeCompletenessReport,
  writePublicReleaseReport,
  writeDraftScreenplay,
  writeClusterArtifacts,
  writeCoverageReport,
  writeDerivedMetrics,
  writeCommentaryBriefs,
  writeCommentaryAuditBriefs,
  writeCommentaryQualityAuditManifestPreview,
  applyCommentaryQualityAuditManifestRefresh,
  applyCommentaryQualityAuditAcceptance,
  applyCommentaryQualityAuditAcceptanceSupersede,
  applyCommentaryRewriteAcceptance,
  applyCommentaryBlockReview,
  applyCommentarySampleRepair,
  applyCommentaryRewriteRepair,
 applyCommentaryStructuralRemediation,
  applyCommentaryDelegatedAudit,
  buildCommentaryCampaignManifest,
  previewCommentaryQualityAuditAcceptance,
  previewCommentaryQualityAuditAcceptanceSupersede,
  previewCommentaryQualityAuditManifestRefresh,
  previewCommentaryRewriteAcceptance,
  previewCommentaryBlockReview,
  previewCommentarySampleRepair,
  previewCommentaryRewriteRepair,
 previewCommentaryStructuralRemediation,
  previewCommentaryDelegatedAudit,
  importCommentaryDraft,
  importCommentaryDraftBatch,
  importCommentaryRewrite,
  importCommentaryRewriteBatch,
  writeEnglishStephanusIndex,
  writeProductionScreenplay,
  writeStephanusIndex,
  writeTranscriptUsageArtifacts,
  listEnglishDialogues,
  type ClaimQueueEvent,
  type ClaimReviewQueueEvent,
  type HarnessRunCommand,
  type RelationQueueEvent,
  type RelationReviewQueueEvent,
  type SegmentedIngestQueueEvent,
  type SegmentedReviewQueueEvent,
  type TranscriptTraceSummary,
  findJob,
  readJobManifest,
  renderJob,
  renderJobList,
  writeJobManifest,
  type JobManifest,
  type ValidationReport,
  type TranscriptUsageSummary,
  type CommentaryRewriteReviewInput,
  type CommentaryBlockReviewDecision,
  type CommentaryStructuralRemediationInput,
} from "@plato-observation-wiki/harness";
import { parseReportArgs, reportExitCode } from "./report-args.js";

type Command =
  | HarnessRunCommand
  | "ingest-queue"
  | "review-queue"
  | "claims-queue"
  | "claims-review-queue"
  | "relations-queue"
  | "relations-review-queue"
  | "completeness"
  | "job"
  | "release:audit"
  | "validate"
  | "derive"
  | "commentary"
  | "audio"
  | "anchors"
  | "clusters"
  | "coverage"
  | "relations"
  | "dossiers"
  | "labels"
  | "site"
  | "profiles"
  | "providers"
  | "models"
  | "transcripts"
  | "trace"
  | "usage"
  | "help";

type ParsedArgs = {
  command: Command;
  subject: string | undefined;
  dryRun: boolean;
  profileName: string | undefined;
  provider: string | undefined;
  model: string | undefined;
  targetBytes: number | undefined;
  targetObservations: number | undefined;
  targetClaims: number | undefined;
  claimIds: string[] | undefined;
  targetPairs: number | undefined;
  candidateKeys: string[] | undefined;
  targetRelations: number | undefined;
  relationIds: string[] | undefined;
  limit: number | undefined;
  retries: number | undefined;
  timeoutSeconds: number | undefined;
  fromMarker: string | undefined;
  toMarker: string | undefined;
  gaps: boolean;
  gapStartChar: number | undefined;
  gapEndChar: number | undefined;
  outDir: string | undefined;
  recordingArtifactRoot: string | undefined;
  includeDraftRecordings: boolean;
  family: string | undefined;
  validateEach: boolean;
  validateFinal: boolean;
};

function printHelp() {
  console.log(`Plato wiki harness CLI

Usage:
  bun run harness ingest <dialogue> [--dry-run] [--profile <name>]
  bun run harness ingest-segmented <dialogue> [--gaps] [--dry-run] [--target-bytes <n>] [--from-marker <ref>] [--to-marker <ref>] [--profile <name>]
  bun run harness ingest-queue <dialogue> [--gaps] [--dry-run] [--target-bytes <n>] [--limit <n>] [--retries <n>] [--timeout-seconds <n>] [--from-marker <ref>] [--to-marker <ref>] [--profile <name>] [--validate-each] [--no-final-validate]
  bun run harness review <dialogue> [--dry-run] [--profile <name>]
  bun run harness review-segmented <dialogue> [--dry-run] [--target-observations <n>] [--limit <n>] [--profile <name>]
  bun run harness review-queue <dialogue> [--dry-run] [--target-observations <n>] [--limit <n>] [--retries <n>] [--timeout-seconds <n>] [--profile <name>] [--validate-each]
  bun run harness claims-segmented <dialogue> [--dry-run] [--target-bytes <n>] [--from-marker <ref>] [--to-marker <ref>] [--profile <name>]
  bun run harness claims-queue <dialogue> [--dry-run] [--target-bytes <n>] [--limit <n>] [--retries <n>] [--timeout-seconds <n>] [--from-marker <ref>] [--to-marker <ref>] [--profile <name>] [--validate-each] [--no-final-validate]
  bun run harness claims-review-segmented <dialogue> [--dry-run] [--target-claims <n>] [--claim-ids <id,id,...>] [--limit <n>] [--profile <name>]
  bun run harness claims-review-queue <dialogue> [--dry-run] [--target-claims <n>] [--limit <n>] [--retries <n>] [--timeout-seconds <n>] [--profile <name>] [--validate-each]
  bun run harness relations-segmented <scope> [--dry-run] [--target-pairs <n>] [--candidate-keys <key,key,...>] [--limit <n>] [--profile <name>]
  bun run harness relations-queue <scope> [--dry-run] [--target-pairs <n>] [--candidate-keys <key,key,...>] [--limit <n>] [--retries <n>] [--timeout-seconds <n>] [--profile <name>] [--validate-each] [--no-final-validate]
  bun run harness relations-review-segmented <scope> [--dry-run] [--target-relations <n>] [--relation-ids <id,id,...>] [--limit <n>] [--profile <name>]
  bun run harness relations-review-queue <scope> [--dry-run] [--target-relations <n>] [--relation-ids <id,id,...>] [--limit <n>] [--retries <n>] [--timeout-seconds <n>] [--profile <name>] [--validate-each]
  bun run harness derive stephanus [dialogue]
  bun run harness derive stephanus-english [dialogue]
  bun run harness derive anchors [dialogue]
  bun run harness derive turns [dialogue]
  bun run harness derive tokens [dialogue]
  bun run harness derive metrics [dialogue]
  bun run harness derive joins [dialogue]
  bun run harness derive voices [dialogue]
  bun run harness derive voice-joins [dialogue]
  bun run harness derive segments <dialogue> [--target-bytes <n>] [--from-marker <ref>] [--to-marker <ref>]
  bun run harness commentary briefs <dialogue>
  bun run harness commentary audit-briefs <dialogue>
  bun run harness commentary delegated-audit-preview <dialogue> [<unit-key>] <candidate-path>
  bun run harness commentary delegated-audit-apply <dialogue> [<unit-key>] <candidate-path>
  bun run harness commentary audit-manifest-preview <dialogue>
  bun run harness commentary audit-manifest-refresh-preview <dialogue>
  bun run harness commentary audit-manifest-refresh-apply <dialogue>
  bun run harness commentary audit-manifest-accept-preview <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...>
  bun run harness commentary audit-manifest-accept-apply <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...>
  bun run harness commentary audit-manifest-supersede-preview <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...>
  bun run harness commentary audit-manifest-supersede-apply <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...>
  bun run harness commentary draft-preview <dialogue> <draft-path>
  bun run harness commentary draft-apply <dialogue> <draft-path>
  bun run harness commentary draft-batch-preview <dialogue> <draft-path>...
  bun run harness commentary draft-batch-apply <dialogue> <draft-path>...
  bun run harness commentary rewrite-preview <dialogue> <rewrite-path>
  bun run harness commentary rewrite-apply <dialogue> <rewrite-path>
  bun run harness commentary rewrite-batch-preview <dialogue> <rewrite-path>...
  bun run harness commentary rewrite-batch-apply <dialogue> <rewrite-path>...
  bun run harness commentary rewrite-review-preview <dialogue> <submission-path> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...>
  bun run harness commentary rewrite-review-apply <dialogue> <submission-path> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...>
  bun run harness commentary block-review-preview <dialogue> --decision <accepted|rejected> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...>
  bun run harness commentary block-review-apply <dialogue> --decision <accepted|rejected> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...>
  bun run harness commentary sample-repair-preview <dialogue> <candidate-path>
  bun run harness commentary sample-repair-apply <dialogue> <candidate-path>
  bun run harness commentary rewrite-repair-preview <dialogue> <candidate-path>
  bun run harness commentary rewrite-repair-apply <dialogue> <candidate-path>
  bun run harness commentary structural-remediation-preview <candidate-path>
  bun run harness commentary structural-remediation-apply <candidate-path>
  bun run harness audio coverage [--write]
  bun run harness audio screenplay <dialogue> [--write-draft | --write-production]
  bun run harness anchors [--write] [dialogue]
  bun run harness clusters [--include-unreviewed]
  bun run harness clusters --write
  bun run harness dossiers [--write]
  bun run harness coverage [--write] [dialogue]
  bun run harness relations candidates [--write]
  bun run harness labels audit [--write]
  bun run harness labels report [--write]
  bun run harness labels sample [--write]
  bun run harness labels plan <path>
  bun run harness labels validate <path> [--family <feature_family>]
  bun run harness labels apply <path> [--family <feature_family>]
  bun run harness site [--out-dir <path>] [--recording-artifact-root <absolute-path>] [--include-draft-recordings]
  bun run harness job manifest [--target corpus|knowledge-base|audio-edition] [--write] [--json]
  bun run harness job list [--target <t>] [--lane <lane>] [--family <CMP-*>] [--scope <slug>] [--refresh] [--json]
  bun run harness job show <job-id> [--target <t>] [--refresh] [--json]
  bun run completeness -- --target corpus|knowledge-base|audio-edition [--write] [--json] [--allow-incomplete]
  bun run release:audit -- --target knowledge-base|audio-edition [--write] [--json] [--allow-incomplete] [--public-tree <dir>] [--export-manifest <file>]
  bun run harness profiles
  bun run harness providers
  bun run harness models [provider]
  bun run harness transcripts
  bun run harness trace [run-name]
  bun run harness usage [run-name]
  bun run validate

Provider selection:
  --profile <name>     Use a named profile from harness.config.json
  --provider <id>      Override selected profile provider
  --model <id>         Override selected profile model
  PI_PROFILE           Default profile override
  PI_PROVIDER          Provider override
  PI_MODEL             Model override
  PI_API_KEY           API key override for any provider

Examples:
  bun run harness profiles
  bun run harness models deepseek
  bun run harness trace
  bun run harness usage
  bun run harness ingest euthyphro --dry-run --profile deepseek-flash
  bun run harness review euthyphro --dry-run --provider anthropic --model claude-sonnet-4-5`);
}

function optionValue(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;

  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }

  return value;
}

function optionNumber(argv: string[], name: string): number | undefined {
  const value = optionValue(argv, name);
  if (value === undefined) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function optionList(argv: string[], name: string): string[] | undefined {
  const value = optionValue(argv, name);
  if (value === undefined) return undefined;

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length === 0) {
    throw new Error(`${name} must include at least one value`);
  }

  return items;
}

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function commentaryStructuralRemediationInput(candidatePath: string): CommentaryStructuralRemediationInput {
  const absoluteCandidatePath = join(getRepoRoot(), candidatePath);
  if (!existsSync(absoluteCandidatePath)) throw new Error(`Missing structural remediation candidate ${candidatePath}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(absoluteCandidatePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Structural remediation candidate is malformed JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Structural remediation candidate must be a JSON object");
  }
  return parsed as CommentaryStructuralRemediationInput;
}

function commentaryRewriteAcceptanceInput(
  dialogue: string,
  submissionRecordPath: string,
): CommentaryRewriteReviewInput {
  const reviewer = optionValue(process.argv, "--reviewer");
  const reviewedOn = optionValue(process.argv, "--reviewed-on");
  const rationale = optionValue(process.argv, "--rationale");
  const appliedIds = optionList(process.argv, "--reviewed-ids");
  if (!reviewer || !reviewedOn || !rationale || !appliedIds) {
    throw new Error("rewrite review acceptance requires --reviewer, --reviewed-on, --rationale, and --reviewed-ids");
  }

  const absoluteRecordPath = join(getRepoRoot(), submissionRecordPath);
  if (!existsSync(absoluteRecordPath)) throw new Error(`Missing canonical submission record ${submissionRecordPath}`);
  const recordBytes = readFileSync(absoluteRecordPath);
  let record: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(recordBytes.toString("utf8"));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    record = parsed as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Canonical submission record is malformed JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const ledger = readFileSync(join(getRepoRoot(), ledgerPath), "utf8");
  const statuses = [...ledger.matchAll(/^commentary_id:\s*(comm_[a-z0-9-]+_\d{4})[\s\S]*?^review_status:\s*(\S+)\s*$/gmu)].map(
    (match) => ({ commentaryId: match[1]!, reviewStatus: match[2]! }),
  );
  const statusById = new Map(statuses.map((entry) => [entry.commentaryId, entry.reviewStatus]));
  return {
    dialogue,
    submissionRecordPath,
    submissionRecordSha256: sha256(recordBytes),
    targetSha256Before: String(record.target_sha256_before ?? ""),
    targetSha256After: String(record.target_sha256_after ?? ""),
    appliedIds,
    postRewriteLedgerSha256: sha256(ledger),
    postRewriteStatuses: appliedIds.map((commentaryId) => ({ commentaryId, reviewStatus: statusById.get(commentaryId) ?? "" })),
    reviewer,
    reviewedOn,
    rationale,
  };
}

function optionNonnegativeNumber(argv: string[], name: string): number | undefined {
  const value = optionValue(argv, name);
  if (value === undefined) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a nonnegative integer`);
  }

  return parsed;
}

function parseCommand(argv: string[]): ParsedArgs {
  if (argv.some((argument) => argument === "--pair-ids" || argument.startsWith("--pair-ids="))) {
    throw new Error("--pair-ids was removed; use --candidate-keys.");
  }

  const rawCommand = argv[2];
  const subject = argv[3]?.startsWith("--") ? undefined : argv[3];
  const dryRun = argv.includes("--dry-run");
  const profileName = optionValue(argv, "--profile") ?? process.env.PI_PROFILE;
  const provider = optionValue(argv, "--provider") ?? process.env.PI_PROVIDER;
  const model = optionValue(argv, "--model") ?? process.env.PI_MODEL;
  const targetBytes = optionNumber(argv, "--target-bytes");
  const targetObservations = optionNumber(argv, "--target-observations");
  const targetClaims = optionNumber(argv, "--target-claims");
  const claimIds = optionList(argv, "--claim-ids");
  const targetPairs = optionNumber(argv, "--target-pairs");
  const candidateKeys = optionList(argv, "--candidate-keys");
  const targetRelations = optionNumber(argv, "--target-relations");
  const relationIds = optionList(argv, "--relation-ids");
  const limit = optionNumber(argv, "--limit");
  const retries = optionNumber(argv, "--retries");
  const timeoutSeconds = optionNumber(argv, "--timeout-seconds");
  const fromMarker = optionValue(argv, "--from-marker");
  const toMarker = optionValue(argv, "--to-marker");
  const gaps = argv.includes("--gaps");
  const gapStartChar = optionNonnegativeNumber(argv, "--gap-start-char");
  const gapEndChar = optionNonnegativeNumber(argv, "--gap-end-char");
  const outDir = optionValue(argv, "--out-dir");
  const recordingArtifactRoot = optionValue(argv, "--recording-artifact-root");
  const includeDraftRecordings = argv.includes("--include-draft-recordings");
  const family = optionValue(argv, "--family");
  const validateEach = argv.includes("--validate-each");
  const validateFinal = !argv.includes("--no-final-validate");

  if (!rawCommand || rawCommand === "help" || rawCommand === "--help" || rawCommand === "-h") {
    return {
      command: "help",
      subject: undefined,
      dryRun,
      profileName,
      provider,
      model,
      targetBytes,
      targetObservations,
      targetClaims,
      claimIds,
      targetPairs,
      candidateKeys,
      targetRelations,
      relationIds,
      limit,
      retries,
      timeoutSeconds,
      fromMarker,
      toMarker,
      gaps,
      gapStartChar,
      gapEndChar,
      outDir,
      recordingArtifactRoot,
      includeDraftRecordings,
      family,
      validateEach,
      validateFinal,
    };
  }

  const command = rawCommand as Command;
  if (
    command !== "ingest" &&
    command !== "ingest-segmented" &&
    command !== "ingest-queue" &&
    command !== "review" &&
    command !== "review-segmented" &&
    command !== "review-queue" &&
    command !== "claims-segmented" &&
    command !== "claims-queue" &&
    command !== "claims-review-segmented" &&
    command !== "claims-review-queue" &&
    command !== "relations-segmented" &&
    command !== "relations-queue" &&
    command !== "relations-review-segmented" &&
    command !== "relations-review-queue" &&
    command !== "completeness" &&
    command !== "job" &&
    command !== "release:audit" &&
    command !== "validate" &&
    command !== "derive" &&
    command !== "commentary" &&
    command !== "audio" &&
    command !== "anchors" &&
    command !== "clusters" &&
    command !== "dossiers" &&
    command !== "coverage" &&
    command !== "relations" &&
    command !== "labels" &&
    command !== "site" &&
    command !== "profiles" &&
    command !== "providers" &&
    command !== "models" &&
    command !== "transcripts" &&
    command !== "trace" &&
    command !== "usage"
  ) {
    throw new Error(`Unknown command: ${command}`);
  }

  return {
    command,
    subject,
    dryRun,
    profileName,
    provider,
    model,
    targetBytes,
    targetObservations,
    targetClaims,
    claimIds,
    targetPairs,
    candidateKeys,
    targetRelations,
    relationIds,
    limit,
    retries,
    timeoutSeconds,
    fromMarker,
    toMarker,
    gaps,
    gapStartChar,
    gapEndChar,
    outDir,
    recordingArtifactRoot,
    includeDraftRecordings,
    family,
    validateEach,
    validateFinal,
  };
}

function requireDialogue(command: Command, dialogue: string | undefined): string {
  if (!dialogue) {
    throw new Error(`Missing dialogue slug for ${command}`);
  }

  if (!/^[a-z0-9-]+$/.test(dialogue)) {
    throw new Error(`Dialogue slug must use lowercase letters, numbers, and hyphens: ${dialogue}`);
  }

  return dialogue;
}

function printProfiles() {
  for (const profile of listProfiles()) {
    const keyStatus = profile.hasKey ? "key:present" : "key:missing";
    const marker = profile.isDefault ? "*" : " ";
    console.log(`${marker} ${profile.name} ${profile.provider}/${profile.model} ${profile.apiKeyEnv ?? "no-key-env"} ${keyStatus}`);
  }
}

function printProviders() {
  for (const provider of listProviders()) {
    const marker = provider.isProfileProvider ? "*" : " ";
    console.log(`${marker} ${provider.provider}`);
  }
}

function printModels(provider: string | undefined) {
  for (const model of listModels(provider)) {
    console.log(`${model.id}\t${model.name}\tcontext=${model.contextWindow}\tmax=${model.maxTokens}`);
  }
}

function printTranscripts() {
  const repoRoot = getRepoRoot();
  const transcripts = listTranscripts();
  if (transcripts.length === 0) {
    console.log("No transcripts yet.");
    return;
  }

  for (const transcript of transcripts) {
    console.log(`${transcript.name}\t${relative(repoRoot, transcript.path)}`);
  }
}

function printUsage(summary: TranscriptUsageSummary) {
  const repoRoot = getRepoRoot();
  console.log(`Run: ${summary.runName}`);
  console.log(`Requests: ${summary.requestCount}`);
  console.log(`Input tokens: ${summary.totals.input}`);
  console.log(`Output tokens: ${summary.totals.output}`);
  console.log(`Cache read tokens: ${summary.totals.cacheRead}`);
  console.log(`Cache write tokens: ${summary.totals.cacheWrite}`);
  console.log(`Total tokens: ${summary.totals.totalTokens}`);
  console.log(`Estimated cost: $${summary.totals.cost.total.toFixed(6)}`);
  console.log(`Usage: ${relative(repoRoot, `${summary.runPath}/usage.md`)}`);
}

function printValidationReport(report: ValidationReport) {
  console.log("Harness prerequisites are present.");
  console.log(`Observation ledgers validated: ${report.observationLedgerCount}`);
  console.log(`Claim ledgers validated: ${report.claimLedgerCount}`);
  console.log(`Relation ledgers validated: ${report.relationLedgerCount}`);
  console.log(`Commentary ledgers validated: ${report.commentaryLedgerCount}`);
  console.log(`Apparatus ledgers validated: ${report.apparatusLedgerCount}`);
  console.log(`Voice ledgers validated: ${report.voicesLedgerCount}`);
  console.log(`Commentary quality-audit manifests validated: ${report.commentaryQualityAuditManifestCount}`);
  console.log("Feature families:");

  if (report.featureFamilies.length === 0) {
    console.log("- none");
  } else {
    for (const family of report.featureFamilies) {
      const samples =
        family.sampleObservationIds.length > 0 ? `; examples=${family.sampleObservationIds.join(", ")}` : "";
      console.log(
        `- ${family.family}: ${family.kind}; observations=${family.observationCount}; candidates=${family.featureCandidateCount}${samples}`,
      );
    }
  }

  console.log("Label drift:");
  console.log(`- total labels: ${report.labelDrift.totalLabels}`);
  console.log(`- singleton labels (1 observation): ${report.labelDrift.singletonLabels}`);
  console.log(`- cross-dialogue labels: ${report.labelDrift.crossDialogueLabels}`);
  console.log("- example singletons:");
  if (report.labelDrift.singletonExamples.length === 0) {
    console.log("  - none");
  } else {
    for (const entry of report.labelDrift.singletonExamples) {
      console.log(`  - ${entry.family} / ${entry.label}: ${entry.observationIds.join(", ")}`);
    }
  }

  console.log("Review coverage:");
  if (report.reviewCoverage.length === 0) {
    console.log("- none");
  } else {
    for (const entry of report.reviewCoverage) {
      console.log(
        `- ${entry.path}: unreviewed=${entry.unreviewed} accepted=${entry.accepted} rejected=${entry.rejected} needs_split=${entry.needsSplit}`,
      );
    }
  }
}

function printKeyValueLines(values: Record<string, number>) {
  for (const [key, value] of Object.entries(values).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`${key}: ${value}`);
  }
}

function printTrace(summary: TranscriptTraceSummary) {
  const repoRoot = getRepoRoot();
  console.log(`trace: ${summary.runName}`);
  console.log(`path: ${relative(repoRoot, summary.runPath)}`);
  console.log(`events: ${summary.eventCount}`);
  if (summary.parseErrorCount > 0) {
    console.log(`parse_errors: ${summary.parseErrorCount}`);
  }

  if (summary.usage) {
    console.log("usage:");
    console.log(`  requests: ${summary.usage.requestCount}`);
    console.log(`  input: ${summary.usage.totals.input}`);
    console.log(`  output: ${summary.usage.totals.output}`);
    console.log(`  cache_read: ${summary.usage.totals.cacheRead}`);
    console.log(`  cache_write: ${summary.usage.totals.cacheWrite}`);
    console.log(`  total_tokens: ${summary.usage.totals.totalTokens}`);
    console.log(`  cost_usd: ${summary.usage.totals.cost.total.toFixed(6)}`);
  }

  console.log("event_types:");
  printKeyValueLines(summary.eventTypes);

  console.log("agent_event_types:");
  printKeyValueLines(summary.agentEventTypes);

  console.log("wiki_events:");
  printKeyValueLines(summary.wikiEventCounts);

  console.log("tool_executions:");
  printKeyValueLines(summary.toolExecutionCounts);

  console.log(`rejections[${summary.rejections.length}]:`);
  for (const rejection of summary.rejections) {
    const issueCodes = rejection.issueCodes.map((issue) => `${issue.code}:${issue.count}`).join(",");
    console.log(
      `- ts=${rejection.ts} type=${rejection.type} path=${rejection.path ?? ""} issues=${rejection.issueCount ?? 0} codes=${issueCodes || "none"}`,
    );
  }

  console.log(`assistant_errors[${summary.assistantErrors.length}]:`);
  for (const error of summary.assistantErrors) {
    console.log(
      `- ts=${error.ts} provider=${error.provider ?? ""} model=${error.model ?? ""} stop=${error.stopReason ?? ""} message=${error.errorMessage ?? ""}`,
    );
  }

  console.log(`writes[${summary.writes.length}]:`);
  for (const write of summary.writes) {
    const observations = write.observationCount === undefined ? "" : ` observations=${write.observationCount}`;
    const claims = write.claimCount === undefined ? "" : ` claims=${write.claimCount}`;
    const relations = write.relationCount === undefined ? "" : ` relations=${write.relationCount}`;
    const assigned = write.assignedFeatureCount === undefined ? "" : ` features=${write.assignedFeatureCount}`;
    console.log(
      `- ts=${write.ts} type=${write.type} path=${write.path ?? ""} bytes=${write.bytes ?? 0}${observations}${claims}${relations}${assigned}`,
    );
  }

  if (summary.responseText) {
    console.log("response_md:");
    for (const line of summary.responseText.split(/\r?\n/u)) {
      console.log(`  ${line}`);
    }
  }
}

function printQueueEvent(event: SegmentedIngestQueueEvent) {
  if (event.type === "queue_start") {
    console.log(
      `queue: dialogue=${event.dialogue} pending=${event.plannedSegmentCount} target_bytes=${event.targetBytes} limit=${event.limit} retries=${event.retries} timeout=${event.timeoutSeconds}s gaps=${event.gaps}`,
    );
    return;
  }

  if (event.type === "segment_attempt") {
    console.log(`attempt: ${event.segment.span} ${event.attempt}/${event.maxAttempts}`);
    return;
  }

  if (event.type === "segment_success") {
    console.log(`completed: ${event.segment.span} attempt=${event.attempt} transcript=${relative(getRepoRoot(), event.transcriptDir)}`);
    if (event.validation) {
      const republic = event.validation.reviewCoverage.find((entry) => entry.path.endsWith("/republic.md"));
      console.log(
        `validated: ledgers=${event.validation.observationLedgerCount}${republic ? ` republic_unreviewed=${republic.unreviewed}` : ""}`,
      );
    }
    return;
  }

  if (event.type === "segment_failure") {
    console.log(`failed: ${event.segment.span} attempt=${event.attempt} error=${event.error}`);
    return;
  }

  const republic = event.validation.reviewCoverage.find((entry) => entry.path.endsWith("/republic.md"));
  console.log(
    `final validation: ledgers=${event.validation.observationLedgerCount}${republic ? ` republic_unreviewed=${republic.unreviewed}` : ""}`,
  );
}

function printClaimQueueEvent(event: ClaimQueueEvent) {
  if (event.type === "queue_start") {
    console.log(
      `claims queue: dialogue=${event.dialogue} pending=${event.plannedSegmentCount} target_bytes=${event.targetBytes} limit=${event.limit} retries=${event.retries} timeout=${event.timeoutSeconds}s`,
    );
    return;
  }

  if (event.type === "segment_attempt") {
    console.log(`claims attempt: ${event.segment.span} ${event.attempt}/${event.maxAttempts}`);
    return;
  }

  if (event.type === "segment_success") {
    console.log(`claims completed: ${event.segment.span} attempt=${event.attempt} transcript=${relative(getRepoRoot(), event.transcriptDir)}`);
    if (event.validation) {
      console.log(`validated: observation_ledgers=${event.validation.observationLedgerCount} claim_ledgers=${event.validation.claimLedgerCount}`);
    }
    return;
  }

  if (event.type === "segment_failure") {
    console.log(`claims failed: ${event.segment.span} attempt=${event.attempt} error=${event.error}`);
    return;
  }

  console.log(`final validation: observation_ledgers=${event.validation.observationLedgerCount} claim_ledgers=${event.validation.claimLedgerCount}`);
}

function printReviewQueueEvent(event: SegmentedReviewQueueEvent) {
  if (event.type === "queue_start") {
    console.log(
      `review queue: dialogue=${event.dialogue} pending=${event.plannedBatchCount} target_observations=${event.targetObservations} limit=${event.limit} retries=${event.retries} timeout=${event.timeoutSeconds}s`,
    );
    return;
  }

  if (event.type === "batch_attempt") {
    console.log(
      `review attempt: batch=${event.batch.index} observations=${event.batch.observationIds[0]}..${event.batch.observationIds.at(-1)} ${event.attempt}/${event.maxAttempts}`,
    );
    return;
  }

  if (event.type === "batch_success") {
    console.log(
      `reviewed: batch=${event.batch.index} count=${event.batch.observationIds.length} attempt=${event.attempt} transcript=${relative(getRepoRoot(), event.transcriptDir)}`,
    );
    if (event.validation) {
      const coverage = event.validation.reviewCoverage.find((entry) => entry.path.endsWith(`/${event.batch.dialogue}.md`));
      console.log(
        `validated: ledgers=${event.validation.observationLedgerCount}${coverage ? ` ${event.batch.dialogue}_unreviewed=${coverage.unreviewed}` : ""}`,
      );
    }
    return;
  }

  if (event.type === "batch_failure") {
    console.log(`review failed: batch=${event.batch.index} attempt=${event.attempt} error=${event.error}`);
    return;
  }

  console.log(`final validation: ledgers=${event.validation.observationLedgerCount}`);
  for (const entry of event.validation.reviewCoverage.filter((coverage) => coverage.unreviewed > 0)) {
    console.log(`- ${entry.path}: unreviewed=${entry.unreviewed}`);
  }
}

function printClaimReviewQueueEvent(event: ClaimReviewQueueEvent) {
  if (event.type === "queue_start") {
    console.log(
      `claims review queue: dialogue=${event.dialogue} pending=${event.plannedBatchCount} target_claims=${event.targetClaims} limit=${event.limit} retries=${event.retries} timeout=${event.timeoutSeconds}s`,
    );
    return;
  }

  if (event.type === "batch_attempt") {
    console.log(
      `claims review attempt: batch=${event.batch.index} claims=${event.batch.claimIds[0]}..${event.batch.claimIds.at(-1)} ${event.attempt}/${event.maxAttempts}`,
    );
    return;
  }

  if (event.type === "batch_success") {
    console.log(
      `claims reviewed: batch=${event.batch.index} count=${event.batch.claimIds.length} attempt=${event.attempt} transcript=${relative(getRepoRoot(), event.transcriptDir)}`,
    );
    if (event.validation) {
      const coverage = event.validation.reviewCoverage.find(
        (entry) => entry.path.includes("/claims/") && entry.path.endsWith(`/${event.batch.dialogue}.md`),
      );
      console.log(
        `validated: claim_ledgers=${event.validation.claimLedgerCount}${coverage ? ` ${event.batch.dialogue}_unreviewed=${coverage.unreviewed}` : ""}`,
      );
    }
    return;
  }

  if (event.type === "batch_failure") {
    console.log(`claims review failed: batch=${event.batch.index} attempt=${event.attempt} error=${event.error}`);
    return;
  }

  console.log(`claims review final validation: claim_ledgers=${event.validation.claimLedgerCount}`);
  for (const entry of event.validation.reviewCoverage.filter((coverage) => coverage.path.includes("/claims/") && coverage.unreviewed > 0)) {
    console.log(`- ${entry.path}: unreviewed=${entry.unreviewed}`);
  }
}

function printRelationQueueEvent(event: RelationQueueEvent) {
  if (event.type === "queue_start") {
    console.log(
      `relations queue: scope=${event.scope} pending=${event.plannedBatchCount} target_pairs=${event.targetPairs} limit=${event.limit} retries=${event.retries} timeout=${event.timeoutSeconds}s`,
    );
    return;
  }

  if (event.type === "batch_attempt") {
    console.log(
      `relations attempt: batch=${event.batch.index} candidates=${event.batch.candidateKeys[0]}..${event.batch.candidateKeys.at(-1)} ${event.attempt}/${event.maxAttempts}`,
    );
    return;
  }

  if (event.type === "batch_success") {
    console.log(
      `relations completed: batch=${event.batch.index} count=${event.batch.candidateKeys.length} attempt=${event.attempt} transcript=${relative(getRepoRoot(), event.transcriptDir)}`,
    );
    if (event.validation) {
      console.log(`validated: relation_ledgers=${event.validation.relationLedgerCount}`);
    }
    return;
  }

  if (event.type === "batch_failure") {
    console.log(`relations failed: batch=${event.batch.index} attempt=${event.attempt} error=${event.error}`);
    return;
  }

  console.log(`relations final validation: relation_ledgers=${event.validation.relationLedgerCount}`);
}

function printRelationReviewQueueEvent(event: RelationReviewQueueEvent) {
  if (event.type === "queue_start") {
    console.log(
      `relations review queue: scope=${event.scope} pending=${event.plannedBatchCount} target_relations=${event.targetRelations} limit=${event.limit} retries=${event.retries} timeout=${event.timeoutSeconds}s`,
    );
    return;
  }

  if (event.type === "batch_attempt") {
    console.log(
      `relations review attempt: batch=${event.batch.index} relations=${event.batch.relationIds[0]}..${event.batch.relationIds.at(-1)} ${event.attempt}/${event.maxAttempts}`,
    );
    return;
  }

  if (event.type === "batch_success") {
    console.log(
      `relations reviewed: batch=${event.batch.index} count=${event.batch.relationIds.length} attempt=${event.attempt} transcript=${relative(getRepoRoot(), event.transcriptDir)}`,
    );
    if (event.validation) {
      const coverage = event.validation.reviewCoverage.find(
        (entry) => entry.path.includes("/relations/") && entry.path.endsWith(`/${event.batch.scope}.md`),
      );
      console.log(
        `validated: relation_ledgers=${event.validation.relationLedgerCount}${coverage ? ` ${event.batch.scope}_unreviewed=${coverage.unreviewed}` : ""}`,
      );
    }
    return;
  }

  if (event.type === "batch_failure") {
    console.log(`relations review failed: batch=${event.batch.index} attempt=${event.attempt} error=${event.error}`);
    return;
  }

  console.log(`relations review final validation: relation_ledgers=${event.validation.relationLedgerCount}`);
  for (const entry of event.validation.reviewCoverage.filter((coverage) => coverage.path.includes("/relations/") && coverage.unreviewed > 0)) {
    console.log(`- ${entry.path}: unreviewed=${entry.unreviewed}`);
  }
}

async function main() {
  const args = parseCommand(process.argv);

  if (args.command === "help") {
    printHelp();
    return;
  }

  if (args.command === "completeness") {
    const reportArgs = parseReportArgs("completeness", process.argv.slice(3));
    const facts = auditCompletenessFacts();
    const report = buildCompletenessReport(facts);
    const selected = report.targets[reportArgs.target];
    if (reportArgs.json) {
      console.log(JSON.stringify({ selectedTarget: reportArgs.target, selected, report }, null, 2));
    } else if (reportArgs.write) {
      const written = writeCompletenessReport(report);
      console.log(`${written.path}: ${reportArgs.target} ${selected.ready ? "ready" : "incomplete"}`);
    } else {
      console.log(renderCompletenessReport(report));
    }
    process.exitCode = reportExitCode(selected.ready, reportArgs.allowIncomplete);
    return;
  }

  if (args.command === "job") {
    const argv = process.argv.slice(3);
    const usage = [
      "Usage:",
      "  bun run harness job manifest [--target <t>] [--write] [--json]",
      "  bun run harness job list [--target <t>] [--lane <lane>] [--family <CMP-*>] [--scope <slug>] [--refresh] [--json]",
      "  bun run harness job show <job-id> [--target <t>] [--refresh] [--json]",
    ].join("\n");
    const subcommand = args.subject;
    if (subcommand !== "manifest" && subcommand !== "list" && subcommand !== "show") throw new Error(usage);

    const json = argv.includes("--json");
    const write = argv.includes("--write");
    const refresh = argv.includes("--refresh");
    const lane = optionValue(argv, "--lane");
    const scope = optionValue(argv, "--scope");
    const rawTarget = optionValue(argv, "--target") ?? "knowledge-base";
    if (rawTarget !== "corpus" && rawTarget !== "knowledge-base" && rawTarget !== "audio-edition") {
      throw new Error(`Unknown completeness target: ${rawTarget}`);
    }

    // The manifest is always built whole so one cache answers every query; the
    // lane, family, and scope filters apply to the view, never to what is stored.
    const buildFresh = () =>
      buildJobManifest({
        target: rawTarget,
        report: buildCompletenessReport(auditCompletenessFacts()),
        generatedAt: new Date().toISOString(),
      });

    if (subcommand === "manifest") {
      const manifest = buildFresh();
      const written = write ? writeJobManifest(manifest) : undefined;
      if (json) console.log(JSON.stringify(manifest, null, 2));
      else if (written) console.log(`${written}: ${manifest.counts.jobs} open jobs for ${manifest.target}`);
      else console.log(renderJobList(manifest));
      return;
    }

    // `list` and `show` read the cache so that N dispatched subagents do not each
    // pay for a whole-corpus completeness pass. The first call fills it.
    let manifest: JobManifest;
    if (refresh) {
      manifest = buildFresh();
      writeJobManifest(manifest);
    } else {
      let cached: JobManifest | undefined;
      try {
        cached = readJobManifest();
      } catch {
        cached = undefined;
      }
      manifest = cached && cached.target === rawTarget ? cached : buildFresh();
      if (manifest !== cached) writeJobManifest(manifest);
    }

    if (subcommand === "show") {
      const jobId = argv[1];
      if (!jobId || jobId.startsWith("--")) throw new Error(usage);
      const job = findJob(manifest, jobId);
      console.log(json ? JSON.stringify(job, null, 2) : renderJob(job));
      return;
    }

    const filtered = manifest.jobs.filter(
      (job) =>
        (!lane || job.lane === lane) && (!args.family || job.family === args.family) && (!scope || job.scope === scope),
    );
    const view: JobManifest = {
      ...manifest,
      counts: {
        ...manifest.counts,
        jobs: filtered.length,
        ready: filtered.filter((job) => job.blocked_by.length === 0).length,
        blocked: filtered.filter((job) => job.blocked_by.length > 0).length,
      },
      jobs: filtered,
    };
    console.log(json ? JSON.stringify(view, null, 2) : renderJobList(view));
    return;
  }

  if (args.command === "release:audit") {
    const reportArgs = parseReportArgs("release", process.argv.slice(3));
    const facts = auditCompletenessFacts();
    const completeness = buildCompletenessReport(facts);
    const releaseFacts = buildPublicReleaseFacts({
      ...(reportArgs.publicTree ? { publicTree: reportArgs.publicTree } : {}),
      ...(reportArgs.exportManifest ? { exportManifest: reportArgs.exportManifest } : {}),
    });
    const report = buildPublicReleaseReport(facts, completeness, reportArgs.target, releaseFacts);
    if (reportArgs.json) {
      console.log(JSON.stringify(report, null, 2));
    } else if (reportArgs.write) {
      const written = writePublicReleaseReport(report);
      console.log(`${written.path}: ${reportArgs.target} ${report.ready ? "ready" : "incomplete"}`);
    } else {
      console.log(renderPublicReleaseReport(report));
    }
    process.exitCode = reportExitCode(report.ready, reportArgs.allowIncomplete);
    return;
  }

  if (args.command === "validate") {
    printValidationReport(validateRepo());
    return;
  }

  if (args.command === "claims-queue") {
    const result = await runClaimQueue(requireDialogue(args.command, args.subject), {
      dryRun: args.dryRun,
      ...(args.profileName ? { profileName: args.profileName } : {}),
      ...(args.provider ? { provider: args.provider } : {}),
      ...(args.model ? { model: args.model } : {}),
      ...(args.targetBytes ? { targetBytes: args.targetBytes } : {}),
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.retries ? { retries: args.retries } : {}),
      ...(args.timeoutSeconds ? { timeoutSeconds: args.timeoutSeconds } : {}),
      ...(args.fromMarker ? { fromMarker: args.fromMarker } : {}),
      ...(args.toMarker ? { toMarker: args.toMarker } : {}),
      validateEach: args.validateEach,
      validateFinal: args.validateFinal,
      onEvent: printClaimQueueEvent,
    });

    if (result.dryRun) {
      console.log(`dry-run claim segments=${result.plannedSegments.length}`);
      for (const segment of result.plannedSegments) {
        console.log(`- ${segment.span} markers=${segment.markerCount} bytes=${segment.sourceBytes}`);
      }
      return;
    }

    console.log(`claims queue complete: completed=${result.completedSegments.length}/${result.plannedSegments.length}`);
    if (result.failedSegment) {
      console.log(`claims queue stopped: ${result.failedSegment.span} error=${result.failedSegment.error ?? "unknown"}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.command === "claims-review-queue") {
    const result = await runClaimReviewQueue(requireDialogue(args.command, args.subject), {
      dryRun: args.dryRun,
      ...(args.profileName ? { profileName: args.profileName } : {}),
      ...(args.provider ? { provider: args.provider } : {}),
      ...(args.model ? { model: args.model } : {}),
      ...(args.targetClaims ? { targetClaims: args.targetClaims } : {}),
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.retries ? { retries: args.retries } : {}),
      ...(args.timeoutSeconds ? { timeoutSeconds: args.timeoutSeconds } : {}),
      validateEach: args.validateEach,
      validateFinal: args.validateFinal,
      onEvent: printClaimReviewQueueEvent,
    });

    if (result.dryRun) {
      console.log(`dry-run claim review batches=${result.plannedBatches.length}`);
      for (const batch of result.plannedBatches) {
        console.log(
          `- batch=${batch.index} claims=${batch.claimIds[0]}..${batch.claimIds.at(-1)} count=${batch.claimIds.length}`,
        );
      }
      return;
    }

    console.log(`claims review queue complete: completed=${result.completedBatches.length}/${result.plannedBatches.length}`);
    if (result.failedBatch) {
      const first = result.failedBatch.claimIds[0] ?? "(none)";
      const last = result.failedBatch.claimIds.at(-1) ?? first;
      console.log(`claims review queue stopped: claims=${first}..${last} error=${result.failedBatch.error ?? "unknown"}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.command === "relations-queue") {
    const result = await runRelationQueue(requireDialogue(args.command, args.subject), {
      dryRun: args.dryRun,
      ...(args.profileName ? { profileName: args.profileName } : {}),
      ...(args.provider ? { provider: args.provider } : {}),
      ...(args.model ? { model: args.model } : {}),
      ...(args.targetPairs ? { targetPairs: args.targetPairs } : {}),
      ...(args.candidateKeys ? { candidateKeys: args.candidateKeys } : {}),
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.retries ? { retries: args.retries } : {}),
      ...(args.timeoutSeconds ? { timeoutSeconds: args.timeoutSeconds } : {}),
      validateEach: args.validateEach,
      validateFinal: args.validateFinal,
      onEvent: printRelationQueueEvent,
    });

    if (result.dryRun) {
      console.log(`dry-run relation batches=${result.plannedBatches.length}`);
      for (const batch of result.plannedBatches) {
        console.log(
          `- batch=${batch.index} candidates=${batch.candidateKeys[0]}..${batch.candidateKeys.at(-1)} count=${batch.candidateKeys.length}`,
        );
      }
      return;
    }

    console.log(`relations queue complete: completed=${result.completedBatches.length}/${result.plannedBatches.length}`);
    if (result.failedBatch) {
      const first = result.failedBatch.candidateKeys[0] ?? "(none)";
      const last = result.failedBatch.candidateKeys.at(-1) ?? first;
      console.log(`relations queue stopped: candidates=${first}..${last} error=${result.failedBatch.error ?? "unknown"}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.command === "relations-review-queue") {
    const result = await runRelationReviewQueue(requireDialogue(args.command, args.subject), {
      dryRun: args.dryRun,
      ...(args.profileName ? { profileName: args.profileName } : {}),
      ...(args.provider ? { provider: args.provider } : {}),
      ...(args.model ? { model: args.model } : {}),
      ...(args.targetRelations ? { targetRelations: args.targetRelations } : {}),
      ...(args.relationIds ? { relationIds: args.relationIds } : {}),
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.retries ? { retries: args.retries } : {}),
      ...(args.timeoutSeconds ? { timeoutSeconds: args.timeoutSeconds } : {}),
      validateEach: args.validateEach,
      validateFinal: args.validateFinal,
      onEvent: printRelationReviewQueueEvent,
    });

    if (result.dryRun) {
      console.log(`dry-run relation review batches=${result.plannedBatches.length}`);
      for (const batch of result.plannedBatches) {
        console.log(
          `- batch=${batch.index} relations=${batch.relationIds[0]}..${batch.relationIds.at(-1)} count=${batch.relationIds.length}`,
        );
      }
      return;
    }

    console.log(`relations review queue complete: completed=${result.completedBatches.length}/${result.plannedBatches.length}`);
    if (result.failedBatch) {
      const first = result.failedBatch.relationIds[0] ?? "(none)";
      const last = result.failedBatch.relationIds.at(-1) ?? first;
      console.log(`relations review queue stopped: relations=${first}..${last} error=${result.failedBatch.error ?? "unknown"}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.command === "ingest-queue") {
    const result = await runSegmentedIngestQueue(requireDialogue(args.command, args.subject), {
      dryRun: args.dryRun,
      ...(args.profileName ? { profileName: args.profileName } : {}),
      ...(args.provider ? { provider: args.provider } : {}),
      ...(args.model ? { model: args.model } : {}),
      ...(args.targetBytes ? { targetBytes: args.targetBytes } : {}),
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.retries ? { retries: args.retries } : {}),
      ...(args.timeoutSeconds ? { timeoutSeconds: args.timeoutSeconds } : {}),
      ...(args.fromMarker ? { fromMarker: args.fromMarker } : {}),
      ...(args.toMarker ? { toMarker: args.toMarker } : {}),
      gaps: args.gaps,
      validateEach: args.validateEach,
      validateFinal: args.validateFinal,
      onEvent: printQueueEvent,
    });

    if (result.dryRun) {
      console.log(`dry-run segments=${result.plannedSegments.length}`);
      for (const segment of result.plannedSegments) {
        console.log(`- ${segment.span} markers=${segment.markerCount} bytes=${segment.sourceBytes}`);
      }
      return;
    }

    console.log(`queue complete: completed=${result.completedSegments.length}/${result.plannedSegments.length}`);
    if (result.failedSegment) {
      console.log(`queue stopped: ${result.failedSegment.span} error=${result.failedSegment.error ?? "unknown"}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.command === "review-queue") {
    const result = await runSegmentedReviewQueue(requireDialogue(args.command, args.subject), {
      dryRun: args.dryRun,
      ...(args.profileName ? { profileName: args.profileName } : {}),
      ...(args.provider ? { provider: args.provider } : {}),
      ...(args.model ? { model: args.model } : {}),
      ...(args.targetObservations ? { targetObservations: args.targetObservations } : {}),
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.retries ? { retries: args.retries } : {}),
      ...(args.timeoutSeconds ? { timeoutSeconds: args.timeoutSeconds } : {}),
      validateEach: args.validateEach,
      onEvent: printReviewQueueEvent,
    });

    if (result.dryRun) {
      console.log(`dry-run review batches=${result.plannedBatches.length}`);
      for (const batch of result.plannedBatches) {
        console.log(
          `- batch=${batch.index} observations=${batch.observationIds[0]}..${batch.observationIds.at(-1)} count=${batch.observationIds.length}`,
        );
      }
      return;
    }

    console.log(`review queue complete: completed=${result.completedBatches.length}/${result.plannedBatches.length}`);
    if (result.failedBatch) {
      const first = result.failedBatch.observationIds[0] ?? "(none)";
      const last = result.failedBatch.observationIds.at(-1) ?? first;
      console.log(`review queue stopped: observations=${first}..${last} error=${result.failedBatch.error ?? "unknown"}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.command === "derive") {
    if (args.subject === "segments") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      for (const segment of planSegmentedIngest(dialogue, args.targetBytes, {
        fromMarker: args.fromMarker,
        toMarker: args.toMarker,
      })) {
        console.log(
          `${segment.dialogue}: ${segment.span} markers=${segment.markerCount} bytes=${segment.sourceBytes} status=${segment.completed ? `skip existing=${segment.existingObservationIds.join(",")}` : "pending"}`,
        );
      }
      return;
    }

    if (args.subject === "review") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      for (const batch of planSegmentedReview(dialogue, args.targetObservations)) {
        console.log(`${batch.dialogue}: batch=${batch.index} observations=${batch.observationIds.join(",")}`);
      }
      return;
    }

    if (args.subject === "anchors") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const dialogues = dialogueArg ? [requireDialogue(args.command, dialogueArg)] : listGreekDialogues();
      for (const dialogue of dialogues) {
        const { path, occurrenceCount } = writeAnchorIndex(dialogue);
        console.log(`${dialogue}: ${occurrenceCount} anchors -> ${path}`);
      }
      return;
    }

    if (args.subject === "turns") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const results = writeTurnIndexes(dialogueArg ? requireDialogue(args.command, dialogueArg) : undefined);
      for (const result of results) {
        const dialogue = /^derived\/plato\/turns\/([a-z0-9-]+)\.toon$/u.exec(result.path)?.[1] ?? "(unknown)";
        console.log(`${dialogue}: ${result.turnCount} turns -> ${result.path}`);
      }
      return;
    }

    if (args.subject === "tokens") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const results = writeTokenIndexes(dialogueArg ? requireDialogue(args.command, dialogueArg) : undefined);
      for (const result of results) {
        const dialogue = /^derived\/plato\/tokens\/([a-z0-9-]+)\.toon$/u.exec(result.path)?.[1] ?? "(unknown)";
        console.log(`${dialogue}: ${result.tokenCount} tokens -> ${result.path}`);
      }
      return;
    }

    if (args.subject === "metrics") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const results = writeDerivedMetrics(dialogueArg ? requireDialogue(args.command, dialogueArg) : undefined);
      for (const result of results) {
        console.log(
          `${result.dialogue}: turn_lengths=${result.turnLengths.turnCount} assent_turns=${result.assent.turnCount} assent_stretches=${result.assent.stretchCount} procedure_candidates=${result.procedure.candidateCount}`,
        );
      }
      return;
    }

    if (args.subject === "joins") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const results = writeObservationTurnJoins(dialogueArg ? requireDialogue(args.command, dialogueArg) : undefined);
      for (const result of results) {
        console.log(`${result.dialogue}: ${result.rowCount} joins -> ${result.path}`);
      }
      return;
    }

    if (args.subject === "voices") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const results = writeVoiceIndexes(dialogueArg ? requireDialogue(args.command, dialogueArg) : undefined);
      for (const result of results) {
        console.log(`${result.dialogue}: ${result.recordCount} accepted voices -> ${result.path}`);
      }
      return;
    }

    if (args.subject === "voice-joins") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const results = writeVoiceJoins(dialogueArg ? requireDialogue(args.command, dialogueArg) : undefined);
      for (const result of results) {
        console.log(`${result.dialogue}: ${result.rowCount} voice joins -> ${result.path}`);
      }
      return;
    }

    if (args.subject === "stephanus-english") {
      const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
      const dialogues = dialogueArg ? [requireDialogue(args.command, dialogueArg)] : listEnglishDialogues();
      for (const dialogue of dialogues) {
        const { path, markerCount } = writeEnglishStephanusIndex(dialogue);
        console.log(`${dialogue}: ${markerCount} markers -> ${path}`);
      }
      return;
    }

    if (args.subject !== "stephanus") {
      throw new Error("Usage: bun run harness derive stephanus [dialogue] | derive stephanus-english [dialogue] | derive anchors [dialogue] | derive turns [dialogue] | derive tokens [dialogue] | derive metrics [dialogue] | derive joins [dialogue] | derive segments <dialogue> | derive review <dialogue>");
    }

    const dialogueArg = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
    const dialogues = dialogueArg ? [requireDialogue(args.command, dialogueArg)] : listGreekDialogues();
    for (const dialogue of dialogues) {
      const { path, markerCount } = writeStephanusIndex(dialogue);
      console.log(`${dialogue}: ${markerCount} markers -> ${path}`);
    }
    return;
  }

  if (args.command === "commentary") {
    const usage = "Usage: bun run harness commentary briefs <dialogue> | commentary audit-briefs <dialogue> | commentary delegated-audit-preview <dialogue> [<unit-key>] <candidate-path> | commentary delegated-audit-apply <dialogue> [<unit-key>] <candidate-path> | commentary audit-manifest-preview <dialogue> | commentary audit-manifest-refresh-preview <dialogue> | commentary audit-manifest-refresh-apply <dialogue> | commentary audit-manifest-accept-preview <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...> | commentary audit-manifest-accept-apply <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...> | commentary audit-manifest-supersede-preview <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...> | commentary audit-manifest-supersede-apply <dialogue> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --sampled-ids <id,id,...> | commentary draft-preview <dialogue> <draft-path> | commentary draft-apply <dialogue> <draft-path> | commentary draft-batch-preview <dialogue> <draft-path>... | commentary draft-batch-apply <dialogue> <draft-path>... | commentary rewrite-preview <dialogue> <rewrite-path> | commentary rewrite-apply <dialogue> <rewrite-path> | commentary rewrite-batch-preview <dialogue> <rewrite-path>... | commentary rewrite-batch-apply <dialogue> <rewrite-path>... | commentary rewrite-review-preview <dialogue> <submission-path> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...> | commentary rewrite-review-apply <dialogue> <submission-path> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...> | commentary block-review-preview <dialogue> --decision <accepted|rejected> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...> | commentary block-review-apply <dialogue> --decision <accepted|rejected> --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> --reviewed-ids <id,id,...> | commentary sample-repair-preview <dialogue> <candidate-path> | commentary sample-repair-apply <dialogue> <candidate-path> | commentary rewrite-repair-preview <dialogue> <candidate-path> | commentary rewrite-repair-apply <dialogue> <candidate-path> | commentary structural-remediation-preview <candidate-path> | commentary structural-remediation-apply <candidate-path>";
    if (args.subject === "briefs") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      for (const brief of writeCommentaryBriefs(dialogue)) {
        console.log(`${brief.sectionId}: ${brief.span} -> ${brief.path}`);
      }
      return;
    }
    if (args.subject === "audit-briefs") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      for (const brief of writeCommentaryAuditBriefs(dialogue)) {
        console.log(`${brief.sectionId}: ${brief.sectionSpan} ids=${brief.commentaryIds.length} sha256=${brief.sha256} -> ${brief.path}`);
      }
      return;
    }
    if (args.subject === "delegated-audit-preview" || args.subject === "delegated-audit-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]);
      const explicitUnitKey = process.argv[5] && !process.argv[5]!.includes("/") && !process.argv[5]!.endsWith(".json")
        ? process.argv[5]
        : undefined;
      const candidatePath = explicitUnitKey ? process.argv[6] : process.argv[5];
      if (!candidatePath || candidatePath.startsWith("--") || process.argv.slice(6).some((value) => value.startsWith("--"))) {
        throw new Error(usage);
      }
      const unitKey = explicitUnitKey ?? candidatePath.split("/").at(-1)?.replace(/\.json$/u, "");
      const currentJob = buildCommentaryCampaignManifest({ dialogue, stage: "audit" }).jobs.find(
        (candidate) => candidate.unit_key === unitKey,
      );
      if (!currentJob) throw new Error("No current audit job matches candidate unit key " + unitKey);
      const result = args.subject === "delegated-audit-apply"
        ? applyCommentaryDelegatedAudit({ job: currentJob, candidatePath })
        : previewCommentaryDelegatedAudit({ job: currentJob, candidatePath });
      console.log((result.applied ? "applied" : "preview") + ": " + result.candidatePath);
      console.log("durable output: " + result.durableOutputPath);
      if (result.applied) console.log("submission: " + result.submissionRecordPath);
      else console.log("No durable output or submission record was written.");
      return;
    }
    if (args.subject === "audit-manifest-preview") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const result = writeCommentaryQualityAuditManifestPreview(dialogue);
      console.log(`pending operator-delegated Luna sample acceptance: ${result.path}`);
      console.log(`units: ${result.manifest.units.length}`);
      console.log("No canonical manifest or commentary ledger was written.");
      return;
    }
    if (args.subject === "audit-manifest-refresh-preview" || args.subject === "audit-manifest-refresh-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const result = args.subject === "audit-manifest-refresh-apply"
        ? applyCommentaryQualityAuditManifestRefresh(dialogue)
        : previewCommentaryQualityAuditManifestRefresh(dialogue);
      console.log(`${result.applied ? "applied" : "preview"}: ${result.manifestPath}`);
      console.log(`preserved sample note: ${result.preservedReviewNotePath}`);
      console.log(`manifest sha256: ${result.manifestSha256Before} -> ${result.manifestSha256After}`);
      if (!result.applied) console.log("No canonical manifest or review note was written.");
      return;
    }
    if (args.subject === "audit-manifest-accept-preview" || args.subject === "audit-manifest-accept-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const reviewer = optionValue(process.argv, "--reviewer");
      const reviewedOn = optionValue(process.argv, "--reviewed-on");
      const rationale = optionValue(process.argv, "--rationale");
      const sampledCommentaryIds = optionList(process.argv, "--sampled-ids");
      if (!reviewer || !reviewedOn || !rationale || !sampledCommentaryIds) throw new Error(usage);
      const input = { dialogue, reviewer, reviewedOn, rationale, sampledCommentaryIds };
      const result = args.subject === "audit-manifest-accept-apply"
        ? applyCommentaryQualityAuditAcceptance(input)
        : previewCommentaryQualityAuditAcceptance(input);
      console.log(`${result.applied ? "applied" : "preview"}: ${result.manifestPath}`);
      console.log(`review note: ${result.reviewNotePath}`);
      if (!result.applied) console.log("No canonical manifest or review note was written.");
      return;
    }
    if (args.subject === "audit-manifest-supersede-preview" || args.subject === "audit-manifest-supersede-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const reviewer = optionValue(process.argv, "--reviewer");
      const reviewedOn = optionValue(process.argv, "--reviewed-on");
      const rationale = optionValue(process.argv, "--rationale");
      const sampledCommentaryIds = optionList(process.argv, "--sampled-ids");
      if (!reviewer || !reviewedOn || !rationale || !sampledCommentaryIds) throw new Error(usage);
      const input = { dialogue, reviewer, reviewedOn, rationale, sampledCommentaryIds };
      const result = args.subject === "audit-manifest-supersede-apply"
        ? applyCommentaryQualityAuditAcceptanceSupersede(input)
        : previewCommentaryQualityAuditAcceptanceSupersede(input);
      console.log(`${result.applied ? "applied" : "preview"}: ${result.manifestPath}`);
      console.log(`review note: ${result.reviewNotePath}`);
      console.log(`predecessor manifest history: ${result.predecessorManifestHistoryPath}`);
      console.log(`predecessor review history: ${result.predecessorReviewNoteHistoryPath}`);
      if (!result.applied) console.log("No canonical manifest, review note, or predecessor history was written.");
      return;
    }
    if (args.subject === "structural-remediation-preview" || args.subject === "structural-remediation-apply") {
      const candidatePath = process.argv[4];
      if (!candidatePath || candidatePath.startsWith("--") || process.argv.slice(5).some((value) => value.startsWith("--"))) {
        throw new Error(usage);
      }
      const input = commentaryStructuralRemediationInput(candidatePath);
      const result = args.subject === "structural-remediation-apply"
        ? applyCommentaryStructuralRemediation(input)
        : previewCommentaryStructuralRemediation(input);
      console.log(`${result.applied ? "applied" : "preview"}: ${result.ledgerPath}`);
      console.log(`audit output: ${result.auditOutputPath}`);
      console.log(`remediated ids: ${result.operations.map((operation) => operation.commentaryId).join(", ")}`);
      console.log(`review receipt: ${result.receiptPath}`);
      if (result.applied) console.log(`submission: ${result.submissionRecordPath}`);
      else console.log("No canonical ledger, submission record, or review receipt was written.");
      return;
    }
    if (args.subject === "rewrite-preview" || args.subject === "rewrite-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const rewriteArguments = process.argv.slice(5);
      if (rewriteArguments.length !== 1 || rewriteArguments[0]!.startsWith("--")) throw new Error(usage);
      const result = importCommentaryRewrite({
        dialogue,
        rewritePath: rewriteArguments[0]!,
        apply: args.subject === "rewrite-apply",
      });
      console.log(`${result.applied ? "applied" : "preview"}: ${result.rewritePath} -> ${result.ledgerPath}`);
      console.log(`blocks: ${result.changedBlockIds.join(", ")}`);
      return;
    }
    if (args.subject === "rewrite-batch-preview" || args.subject === "rewrite-batch-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const rewritePaths = process.argv.slice(5);
      if (rewritePaths.length === 0 || rewritePaths.some((value) => value.startsWith("--"))) throw new Error(usage);
      const result = importCommentaryRewriteBatch({
        dialogue,
        rewritePaths,
        apply: args.subject === "rewrite-batch-apply",
      });
      console.log(`${result.applied ? "applied" : "preview"}: ${result.rewritePaths.join(", ")} -> ${result.ledgerPath}`);
      console.log(`blocks: ${result.changedBlockIds.join(", ")}`);
      return;
    }
    if (args.subject === "rewrite-review-preview" || args.subject === "rewrite-review-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const submissionPath = process.argv[5];
      if (!submissionPath || submissionPath.startsWith("--")) throw new Error(usage);
      const input = commentaryRewriteAcceptanceInput(dialogue, submissionPath);
      const result = args.subject === "rewrite-review-apply"
        ? applyCommentaryRewriteAcceptance(input)
        : previewCommentaryRewriteAcceptance(input);
      console.log(`${result.applied ? "applied" : "preview"}: ${result.ledgerPath}`);
      console.log(`review receipt: ${result.receiptPath}`);
      console.log(`reviewed ids: ${result.appliedIds.join(", ")}`);
      if (!result.applied) console.log("No canonical ledger or review receipt was written.");
      return;
    }
    if (args.subject === "block-review-preview" || args.subject === "block-review-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const decision = optionValue(process.argv, "--decision");
      const reviewer = optionValue(process.argv, "--reviewer");
      const reviewedOn = optionValue(process.argv, "--reviewed-on");
      const rationale = optionValue(process.argv, "--rationale");
      const reviewedIds = optionList(process.argv, "--reviewed-ids");
      if (!decision || !reviewer || !reviewedOn || !rationale || !reviewedIds) throw new Error(usage);
      if (decision !== "accepted" && decision !== "rejected") throw new Error("--decision must be accepted or rejected");
      const result = args.subject === "block-review-apply"
        ? applyCommentaryBlockReview({ dialogue, decision: decision as CommentaryBlockReviewDecision, reviewer, reviewedOn, rationale, reviewedIds })
        : previewCommentaryBlockReview({ dialogue, decision: decision as CommentaryBlockReviewDecision, reviewer, reviewedOn, rationale, reviewedIds });
      console.log(`${result.applied ? "applied" : "preview"}: ${result.ledgerPath}`);
      console.log(`review receipt: ${result.receiptPath}`);
      console.log(`reviewed ids: ${result.reviewedIds.join(", ")}`);
      if (!result.applied) console.log("No canonical ledger or review receipt was written.");
      return;
    }
    if (args.subject === "sample-repair-preview" || args.subject === "sample-repair-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const candidateArguments = process.argv.slice(5);
      if (candidateArguments.length !== 1 || candidateArguments[0]!.startsWith("--")) throw new Error(usage);
      const candidatePath = candidateArguments[0]!;
      const result = args.subject === "sample-repair-apply"
        ? applyCommentarySampleRepair({ dialogue, candidatePath })
        : previewCommentarySampleRepair({ dialogue, candidatePath });
      console.log(`${result.applied ? "applied" : "preview"}: ${result.candidatePath} -> ${result.ledgerPath}`);
      console.log(`repair ids: ${result.changedBlockIds.join(", ")}`);
      if (result.applied) console.log(`submission: ${result.submissionPath}`);
      else console.log("No canonical ledger or submission record was written.");
      return;
    }
    if (args.subject === "rewrite-repair-preview" || args.subject === "rewrite-repair-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const candidateArguments = process.argv.slice(5);
      if (candidateArguments.length !== 1 || candidateArguments[0]!.startsWith("--")) throw new Error(usage);
      const candidatePath = candidateArguments[0]!;
      const result = args.subject === "rewrite-repair-apply"
        ? applyCommentaryRewriteRepair({ dialogue, candidatePath })
        : previewCommentaryRewriteRepair({ dialogue, candidatePath });
      console.log(`${result.applied ? "applied" : "preview"}: ${result.candidatePath} -> ${result.ledgerPath}`);
      console.log(`repair ids: ${result.changedBlockIds.join(", ")}`);
      if (result.applied) console.log(`submission: ${result.submissionPath}`);
      else console.log("No canonical ledger or submission record was written.");
      return;
    }
    if (args.subject === "draft-preview" || args.subject === "draft-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const draftArguments = process.argv.slice(5);
      if (draftArguments.length !== 1 || draftArguments.some((value) => value.startsWith("--"))) {
        throw new Error(usage);
      }
      const draftPath = draftArguments[0]!;
      const result = importCommentaryDraft({
        dialogue,
        draftPath,
        apply: args.subject === "draft-apply",
      });
      console.log(`${result.replayed ? "replayed" : result.applied ? "applied" : "preview"}: ${result.draftPath} -> ${result.ledgerPath}`);
      console.log(`blocks: ${result.blockIds.join(", ")}`);
      if (!result.applied && !result.replayed) console.log(result.renderedBlocks);
      if (result.applied) {
        const coverage = writeAudioCoverageReport();
        console.log(`audio coverage: ${coverage.path}`);
        printValidationReport(validateRepo());
      }
      return;
    }
    if (args.subject === "draft-batch-preview" || args.subject === "draft-batch-apply") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const draftPaths = process.argv.slice(5);
      if (draftPaths.length === 0 || draftPaths.some((value) => value.startsWith("--"))) throw new Error(usage);
      const result = importCommentaryDraftBatch({
        dialogue,
        draftPaths,
        apply: args.subject === "draft-batch-apply",
      });
      for (const entry of result.imports) {
        console.log(`${entry.replayed ? "replayed" : result.applied ? "applied" : "preview"}: ${entry.draftPath} -> ${entry.ledgerPath}`);
        console.log(`blocks: ${entry.blockIds.join(", ")}`);
        if (!result.applied && !entry.replayed) console.log(entry.renderedBlocks);
      }
      if (result.applied) {
        const coverage = writeAudioCoverageReport();
        console.log(`audio coverage: ${coverage.path}`);
        printValidationReport(validateRepo());
      }
      return;
    }
    throw new Error(usage);
  }

  if (args.command === "audio") {
    const usage = "Usage: bun run harness audio coverage [--write] | audio screenplay <dialogue> [--write-draft | --write-production]";
    if (args.subject === "screenplay") {
      const dialogue = requireDialogue(args.command, process.argv[4]?.startsWith("--") ? undefined : process.argv[4]);
      const writeDraft = process.argv.includes("--write-draft");
      const writeProduction = process.argv.includes("--write-production");
      if (writeDraft && writeProduction) throw new Error(usage);
      const report = buildScreenplayGenerationReport(dialogue);
      console.log(JSON.stringify(report, null, 2));
      if (writeDraft) console.log(`scratch screenplay: ${writeDraftScreenplay(report)}`);
      if (writeProduction) console.log(`production screenplay: ${writeProductionScreenplay(report)}`);
      return;
    }
    if (args.subject !== "coverage") throw new Error(usage);
    const result = process.argv.includes("--write")
      ? writeAudioCoverageReport()
      : { path: undefined, report: buildAudioCoverageReport() };
    console.log(renderAudioCoverageReport(result.report));
    if (result.path) console.log(`audio coverage: ${result.path}`);
    return;
  }

  if (args.command === "anchors") {
    const dialogue = process.argv.slice(3).find((arg) => !arg.startsWith("--"));
    const result = process.argv.includes("--write")
      ? writeAnchorsReport({ dialogue })
      : { path: undefined, report: buildAnchorsReport({ dialogue }) };
    console.log(renderAnchorsReportText(result.report));
    if (result.path) {
      console.log(`anchors: ${result.path}`);
    }
    return;
  }

  if (args.command === "clusters") {
    const includeUnreviewed = process.argv.includes("--include-unreviewed");
    const write = process.argv.includes("--write");
    if (write) {
      const written = writeClusterArtifacts({ includeUnreviewed });
      const gate = clusterGateReport();
      console.log(
        `wrote ${written.length} cluster file(s); gate accepted=${gate.acceptedObservations} cross_dialogue=${gate.crossDialogueLabels} median_non_singleton=${gate.medianNonSingletonObservations}`,
      );
      for (const artifact of written) {
        console.log(`- ${artifact.path}: clusters=${artifact.clusterCount}`);
      }
      return;
    }

    const clusters = buildClusters({ includeUnreviewed });
    if (includeUnreviewed) {
      console.log("PRE-CONVERGENCE PREVIEW - not meaningful until labels recur and observations are accepted.");
    }
    console.log(`clusters: ${clusters.length}`);
    for (const cluster of clusters.slice(0, 25)) {
      console.log(
        `- ${cluster.family}/${cluster.label}: observations=${cluster.observations.length} dialogues=${cluster.dialogues.join(",") || "none"}`,
      );
    }
    return;
  }

  if (args.command === "dossiers") {
    if (process.argv.includes("--write")) {
      const written = writeDossierArtifacts();
      const dossierCount = Math.max(0, written.length - 1);
      console.log(`wrote ${written.length} dossier artifact(s); dossiers=${dossierCount}`);
      return;
    }

    const dossiers = buildDossiers();
    console.log(`dossiers=${dossiers.length} labels_covered=${dossiers.length}`);
    for (const dossier of dossiers.slice(0, 25)) {
      console.log(
        `- ${dossier.family}/${dossier.label}: accepted_obs=${dossier.instances.length} dialogues=${dossier.presence.filter((entry) => entry.acceptedObservations > 0).length} counter_records=${dossier.counterevidence.length}`,
      );
    }
    return;
  }

  if (args.command === "coverage") {
    const dialogue = process.argv.slice(3).find((arg) => !arg.startsWith("--"));
    const result = process.argv.includes("--write")
      ? writeCoverageReport({ dialogue })
      : { path: undefined, report: buildCoverageReport({ dialogue }) };
    const sorted = [...result.report].sort((a, b) => a.coverageRatio - b.coverageRatio || a.dialogue.localeCompare(b.dialogue));
    for (const entry of sorted) {
      const biggestGapChars = Math.max(0, ...entry.gaps.map((gap) => gap.endChar - gap.startChar));
      console.log(
        `${entry.dialogue}: coverage=${(entry.coverageRatio * 100).toFixed(1)}% gaps=${entry.gaps.length} biggest_gap_chars=${biggestGapChars}`,
      );
    }
    if (result.path) {
      console.log(`coverage: ${result.path}`);
    }
    return;
  }

  if (args.command === "relations") {
    if (args.subject !== "candidates") {
      throw new Error("Usage: bun run harness relations candidates [--write]");
    }

    const result = process.argv.includes("--write")
      ? writeRelationCandidates()
      : { path: undefined, report: buildRelationCandidates() };
    console.log(`relation candidates: total=${result.report.counts.total}`);
    for (const [scope, count] of Object.entries(result.report.counts.by_scope).sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`- ${scope}: ${count}`);
    }
    if (result.path) {
      console.log(`relations candidates: ${result.path}`);
    }
    return;
  }

  if (args.command === "labels") {
    if (args.subject === "audit") {
      const result = process.argv.includes("--write")
        ? writeLabelAudit()
        : { path: "(dry run)", report: collectLabelAudit() };
      console.log(
        `labels=${result.report.totalLabels} observations=${result.report.totalObservations} singletons=${result.report.singletonLabels} cross_dialogue=${result.report.crossDialogueLabels}`,
      );
      console.log(`audit: ${result.path}`);
      return;
    }

    if (args.subject === "report") {
      const result = process.argv.includes("--write")
        ? writeLabelQuality()
        : { path: "(dry run)", report: collectLabelQuality() };
      console.log(
        `labels=${result.report.allRecords.totalLabels} uncovered_singletons=${result.report.dispositionCoverage.uncoveredSingletons} reuse_mass_accepted=${(result.report.acceptedOnly.reuseMass.nonSingletonShare * 100).toFixed(1)}%`,
      );
      console.log(`report: ${result.path}`);
      return;
    }

    if (args.subject === "sample") {
      const result = process.argv.includes("--write")
        ? writeAdjudicationSample()
        : { path: "(dry run)", sample: buildAdjudicationSample() };
      console.log(`sample=${result.sample.entries.length} universe=${result.sample.universeSize} seed=${result.sample.seed}`);
      console.log(`sample: ${result.path}`);
      return;
    }

    const path = process.argv[4]?.startsWith("--") ? undefined : process.argv[4];
    if (!path) {
      throw new Error("Usage: bun run harness labels audit [--write] | labels report [--write] | labels sample [--write] | labels plan <path> | labels validate <path> | labels apply <path> [--family <feature_family>]");
    }

    if (args.subject === "plan") {
      const result = planLabelMergeMap(path);
      console.log(`merge-map: ${result.path}`);
      console.log(`labels=${result.map.sourceMetrics.totalLabels} todos=${result.todoCount}`);
      return;
    }

    if (args.subject === "validate") {
      const result = validateLabelMergeMap(path, args.family ? { family: args.family } : {});
      if (result.failures.length > 0) {
        const visibleFailures = result.failures.slice(0, 25);
        const omitted = result.failures.length - visibleFailures.length;
        throw new Error(
          [
            `Label merge map validation failed: ${result.failures.length} failure(s)`,
            ...visibleFailures,
            omitted > 0 ? `... ${omitted} more failure(s)` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
      console.log(
        `merge-map valid: dispositions=${result.dispositionCount} keeps=${result.keepCount} merges=${result.mergeCount}${args.family ? ` family=${args.family}` : ""}`,
      );
      return;
    }

    if (args.subject === "apply") {
      const result = applyLabelMergeMap(path, args.family ? { family: args.family } : {});
      console.log(
        `merge-map applied: changed_observations=${result.changedObservations} updated_ledgers=${result.updatedLedgers.length} updated_commentary_ledgers=${result.updatedCommentaryLedgers.length}`,
      );
      console.log(
        `derived: label_audit=${result.labelAuditPath ?? "(skipped)"} label_quality=${result.labelQualityPath ?? "(skipped)"} clusters=${result.clusterFiles ?? "(skipped)"} dossiers=${result.dossierFiles ?? "(skipped)"} site_pages=${result.sitePages ?? "(skipped)"}`,
      );
      return;
    }

    throw new Error("Usage: bun run harness labels audit [--write] | labels report [--write] | labels sample [--write] | labels plan <path> | labels validate <path> | labels apply <path> [--family <feature_family>]");
  }

  if (args.command === "site") {
    const result = buildStaticSite({
      ...(args.outDir ? { outDir: args.outDir } : {}),
      ...(args.recordingArtifactRoot
        ? { recordingArtifactRoot: args.recordingArtifactRoot }
        : {}),
      includeDraftRecordings: args.includeDraftRecordings,
    });
    console.log(`wrote ${result.pages.length} site file(s) to ${relative(getRepoRoot(), result.outDir)}`);
    console.log(`observations=${result.observationCount} registry_entries=${result.registryEntryCount} clusters=${result.clusterCount}`);
    console.log(
      `recordings accepted=${result.acceptedRecordingCount} review_candidates=${result.reviewCandidateRecordingCount}`,
    );
    console.log(
      `site_validation html_files=${result.validation.htmlFiles} links=${result.validation.links} homepage_bytes=${result.validation.homepageBytes} max_html_bytes=${result.validation.maxHtmlBytes} max_id_shard_bytes=${result.validation.maxIdIndexShardBytes} max_search_shard_bytes=${result.validation.maxSearchIndexShardBytes} core_total_bytes=${result.validation.coreTotalBytes} duplicate_ids=${result.validation.duplicateIds} broken_paths=${result.validation.brokenPaths} broken_fragments=${result.validation.brokenFragments} allowed_external_urls=${result.validation.externalUrls}`,
    );
    return;
  }

  if (args.command === "profiles") {
    printProfiles();
    return;
  }

  if (args.command === "providers") {
    printProviders();
    return;
  }

  if (args.command === "models") {
    printModels(args.subject ?? args.provider);
    return;
  }

  if (args.command === "transcripts") {
    printTranscripts();
    return;
  }

  if (args.command === "trace") {
    printTrace(await summarizeTranscriptTrace(args.subject));
    return;
  }

  if (args.command === "usage") {
    printUsage(await writeTranscriptUsageArtifacts(args.subject));
    return;
  }

  const result = await runHarnessCommand(args.command, requireDialogue(args.command, args.subject), {
    dryRun: args.dryRun,
    profileName: args.profileName,
    provider: args.provider,
    model: args.model,
    targetBytes: args.targetBytes,
    targetObservations: args.targetObservations,
    targetClaims: args.targetClaims,
    claimIds: args.claimIds,
    targetPairs: args.targetPairs,
    candidateKeys: args.candidateKeys,
    targetRelations: args.targetRelations,
    relationIds: args.relationIds,
    limit: args.limit,
    fromMarker: args.fromMarker,
    toMarker: args.toMarker,
    gaps: args.gaps,
    gapStartChar: args.gapStartChar,
    gapEndChar: args.gapEndChar,
  });

  if (result.responseText) {
    const repoRoot = getRepoRoot();
    console.log(result.responseText);
    console.log(`\nTranscript: ${relative(repoRoot, result.transcriptDir)}`);
    return;
  }

  const repoRoot = getRepoRoot();
  console.log(`Prepared ${result.command} for ${result.dialogue}.`);
  console.log(`Profile: ${result.profileName}`);
  console.log(`Model: ${result.provider}/${result.model}`);
  console.log(`Loaded resources: ${result.skillCount} skill(s), ${result.promptCount} prompt(s).`);
  console.log(`Prompt template: ${result.templateName}`);
  console.log(`Transcript: ${relative(repoRoot, result.transcriptDir)}`);
  console.log(`Session: ${relative(repoRoot, result.sessionPath)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

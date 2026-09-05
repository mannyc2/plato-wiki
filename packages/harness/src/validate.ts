import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { formatAudioCatalogValidationError, validateAudioCatalogArtifacts } from "./audio-catalog.js";
import { buildAudioCoverageReport, validateAudioCoverageReport } from "./audio-coverage.js";
import {
  auditCompletenessFacts,
  buildCompletenessReport,
  validateCompletenessReport,
} from "./completeness.js";
import {
  formatAudioReferenceSourceIssues,
  validateAudioReferenceSourceArtifacts,
} from "./audio-reference-sources.js";
import { formatAudioProductionIssues, validateAudioProductionArtifacts } from "./audio-production.js";
import { validateClusterArtifacts } from "./clusters.js";
import { validateDossierArtifacts } from "./dossiers.js";
import { englishStephanusIndexPath, parseStephanusIndexToon, stephanusIndexPath } from "./derived/stephanus.js";
import { getRepoRoot } from "./paths.js";
import { validatePublicReleaseReport } from "./public-release.js";
import { collectReportedTurnScopeFailures } from "./reported-turn-scopes.js";
import { collectReviewProvenanceFailures } from "./review-provenance.js";
import { collectChangedCorpusWorkflowFailures } from "./workflow-policy.js";
import { discoverSiteRecordings, validateSiteRecordingEvidence } from "./site/recordings.js";
import type {
  OntologySummary,
  ReviewCoverageEntry,
  ValidationReport,
} from "./types.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./wiki/claim-ledger.js";
import { formatClaimLedgerValidationError, validateClaimLedger } from "./wiki/claim-validator.js";
import { listApparatusLedgerPaths } from "./wiki/apparatus-ledger.js";
import { formatApparatusLedgerValidationError, validateApparatusLedger } from "./wiki/apparatus-validator.js";
import { dialogueFromVoicesPath, listVoicesLedgerPaths } from "./wiki/voices-ledger.js";
import {
  collectOrphanVoiceDerivedFailures,
  collectStaleVoiceDerivedFailures,
  collectVoiceClaimConsistencyFailures,
  formatVoicesLedgerValidationError,
  validateVoicesLedger,
} from "./wiki/voices-validator.js";
import { collectVoiceCutoverRegistryFailures } from "./derived/voice-cutovers.js";
import { commentaryYamlBlocks, dialogueFromCommentaryPath, listCommentaryLedgerPaths } from "./wiki/commentary-ledger.js";
import {
  buildCommentaryCitationIndex,
  formatCommentaryLedgerValidationError,
  validateCommentaryLedger,
} from "./wiki/commentary-validator.js";
import { relationYamlBlocks, listRelationLedgerPaths } from "./wiki/relation-ledger.js";
import { formatRelationLedgerValidationError, validateRelationLedger } from "./wiki/relation-validator.js";
import {
  dialogueFromObservationId,
  fieldValue,
  listFieldValue,
  listObservationLedgerPaths,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";
import { formatObservationLedgerValidationError, validateObservationLedger } from "./wiki/observation-validator.js";
import { collectOntologyAuditFailures } from "./wiki/ontology-audit.js";
import {
  readOntologyVNextRepository,
  readObservationReviewStatuses,
  validateOntologyVNextRepository,
} from "./wiki/ontology-vnext-repository.js";
import {
  formatRecordingManifestValidationError,
  validateRecordingManifests,
} from "./wiki/recording-manifest.js";
import {
  formatCommentaryQualityAuditManifestIssues,
  listCommentaryQualityAuditManifestPaths,
  validateCommentaryQualityAuditManifests,
} from "./wiki/commentary-quality-audit.js";

export function verifySha256Manifest(manifestRelativePath: string) {
  const repoRoot = getRepoRoot();
  const manifestPath = join(repoRoot, manifestRelativePath);
  const failures: string[] = [];
  const content = readFileSync(manifestPath, "utf8");

  for (const [index, line] of content.split(/\r?\n/u).entries()) {
    if (line.trim().length === 0) continue;

    const parsed = /^([0-9a-f]{64})\s+\*?(.+)$/iu.exec(line);
    if (!parsed) {
      failures.push(`${manifestRelativePath}:${index + 1}: malformed manifest line`);
      continue;
    }

    const expectedHash = parsed[1]!.toLowerCase();
    const relativePath = parsed[2]!;
    const absolutePath = join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`${relativePath}: missing file`);
      continue;
    }

    const actualHash = createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
    if (actualHash !== expectedHash) {
      failures.push(`${relativePath}: expected ${expectedHash}, got ${actualHash}`);
    }
  }

  return failures;
}

function scanForBannedInstructionText() {
  const repoRoot = getRepoRoot();
  const banned = [
    "pilot",
    "milestone",
    "provisional",
    "source layer",
    "source-index",
    "SOURCE.md",
    "upstream",
    "jtauber",
  ];
  const files = [
    ".pi/skills/plato-observation-extraction/SKILL.md",
    ".pi/prompts/ingest-plato-dialogue.md",
    ".pi/prompts/ingest-plato-segment.md",
    ".pi/prompts/extract-plato-claims-segment.md",
    ".pi/prompts/adjudicate-plato-relations.md",
    ".pi/prompts/review-plato-segment.md",
    ".pi/prompts/review-plato-claims-segment.md",
    ".pi/prompts/review-plato-relations.md",
    "docs/ontology-vnext.md",
    "docs/ontology-audit-protocol.md",
    "docs/plato-wiki-extraction-protocol.md",
    "docs/pi-agent-core-wiki-runner.md",
  ];

  const failures: string[] = [];
  for (const file of files) {
    const path = join(repoRoot, file);
    const content = readFileSync(path, "utf8");
    const lowerContent = content.toLowerCase();

    for (const phrase of banned) {
      if (lowerContent.includes(phrase.toLowerCase())) {
        failures.push(`${file}: contains "${phrase}"`);
      }
    }
  }

  return failures;
}

export function validateHarnessInstructionContract() {
  const repoRoot = getRepoRoot();
  const requiredPhrases = [
    {
      file: "docs/ontology-vnext.md",
      phrases: [
        "## Canonical model",
        "Source-bound observations do not own classification identity",
        "Rejected observations have no memberships",
        "Hard cut only",
        "Question-driven projections",
      ],
    },
  ];

  const failures: string[] = [];
  for (const { file, phrases } of requiredPhrases) {
    const path = join(repoRoot, file);
    if (!existsSync(path)) {
      failures.push(`${file}: missing instruction contract file`);
      continue;
    }

    const content = readFileSync(path, "utf8");
    for (const phrase of phrases) {
      if (!content.includes(phrase)) {
        failures.push(`${file}: missing required contract phrase "${phrase}"`);
      }
    }
  }

  return failures;
}

function observationLedgerPaths() {
  return listObservationLedgerPaths();
}

function claimLedgerPaths() {
  return listClaimLedgerPaths();
}

function relationLedgerPaths() {
  return listRelationLedgerPaths();
}

function validateObservationLedgers() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const paths = observationLedgerPaths();

  for (const relativePath of paths) {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const issues = validateObservationLedger(relativePath, content);
    if (issues.length > 0) {
      failures.push(`${relativePath}\n${formatObservationLedgerValidationError(issues)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Observation ledger validation failed:\n\n${failures.join("\n\n")}`);
  }

  return paths.length;
}

function validateClaimLedgers() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const paths = claimLedgerPaths();
  const observationReviewStatuses = readObservationReviewStatuses();
  const observationSupportedClaims = new Map<string, string[]>();
  for (const observationPath of listObservationLedgerPaths({ absolute: true })) {
    for (const block of observationYamlBlocks(readFileSync(observationPath, "utf8"))) {
      const observationId = fieldValue(block, "observation_id");
      if (observationId) observationSupportedClaims.set(observationId, listFieldValue(block, "supports_claim_ids"));
    }
  }

  for (const relativePath of paths) {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const issues = validateClaimLedger(relativePath, content, { observationReviewStatuses, observationSupportedClaims });
    if (issues.length > 0) {
      failures.push(`${relativePath}\n${formatClaimLedgerValidationError(issues)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Claim ledger validation failed:\n\n${failures.join("\n\n")}`);
  }

  return paths.length;
}

function validateRelationLedgers() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const paths = relationLedgerPaths();

  for (const relativePath of paths) {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const issues = validateRelationLedger(relativePath, content);
    if (issues.length > 0) {
      failures.push(`${relativePath}\n${formatRelationLedgerValidationError(issues)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Relation ledger validation failed:\n\n${failures.join("\n\n")}`);
  }

  return paths.length;
}

function validateCommentaryLedgers() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const paths = listCommentaryLedgerPaths();
  if (paths.length === 0) return 0;

  const citationIndex = buildCommentaryCitationIndex();
  for (const relativePath of paths) {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const issues = validateCommentaryLedger(relativePath, content, citationIndex);
    if (issues.length > 0) {
      failures.push(`${relativePath}\n${formatCommentaryLedgerValidationError(issues)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Commentary ledger validation failed:\n\n${failures.join("\n\n")}`);
  }

  return paths.length;
}

function validateApparatusLedgers() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const paths = listApparatusLedgerPaths();
  if (paths.length === 0) return 0;

  const citationIndex = buildCommentaryCitationIndex();
  for (const relativePath of paths) {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const issues = validateApparatusLedger(relativePath, content, citationIndex);
    if (issues.length > 0) {
      failures.push(`${relativePath}\n${formatApparatusLedgerValidationError(issues)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Apparatus ledger validation failed:\n\n${failures.join("\n\n")}`);
  }

  return paths.length;
}

function validateVoicesLedgers() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const paths = listVoicesLedgerPaths();

  // The activation registry is checked first and fatally: every check below asks
  // it whether a dialogue is activated, and an unreadable registry must produce
  // one clear diagnostic rather than the same parse error once per ledger.
  const registryFailures = collectVoiceCutoverRegistryFailures();
  if (registryFailures.length > 0) {
    throw new Error(`Voice cutover registry validation failed:\n\n${registryFailures.join("\n\n")}`);
  }

  // Scan from derived artifacts as well as ledgers. Starting only from the
  // ledger list makes an index/join invisible at the exact moment its ledger is
  // deleted, which is when it most needs to fail closed.
  failures.push(...collectOrphanVoiceDerivedFailures());

  for (const relativePath of paths) {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const issues = validateVoicesLedger(relativePath, content);
    if (issues.length > 0) {
      failures.push(`${relativePath}\n${formatVoicesLedgerValidationError(issues)}`);
    }
    const dialogue = dialogueFromVoicesPath(relativePath);
    if (!dialogue) continue;
    failures.push(...collectStaleVoiceDerivedFailures(dialogue, content));

    // Post-cutover consistency, only for dialogues an operator has explicitly
    // activated. Accepted-but-unactivated reported turns say nothing about any
    // claim's speaker, so there is nothing here to be consistent with.
    failures.push(...collectVoiceClaimConsistencyFailures(dialogue));
  }

  if (failures.length > 0) {
    throw new Error(`Voice ledger validation failed:\n\n${failures.join("\n\n")}`);
  }

  return paths.length;
}

function sha256Hex(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function validateEnglishSpines() {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];

  for (const relativePath of listCommentaryLedgerPaths()) {
    const slug = dialogueFromCommentaryPath(relativePath);
    if (!slug) continue;

    const englishRelativePath = `raw/plato/english/${slug}.txt`;
    const englishPath = join(repoRoot, englishRelativePath);
    if (!existsSync(englishPath)) continue;

    const indexRelativePath = englishStephanusIndexPath(slug);
    const indexPath = join(repoRoot, indexRelativePath);
    if (!existsSync(indexPath)) {
      failures.push(
        `${indexRelativePath}: missing English Stephanus index; run \`bun run harness derive stephanus-english ${slug}\``,
      );
      continue;
    }

    const englishIndex = parseStephanusIndexToon(readFileSync(indexPath, "utf8"));
    if (englishIndex.sourceSha256 !== sha256Hex(readFileSync(englishPath, "utf8"))) {
      failures.push(
        `${indexRelativePath}: stale English Stephanus index; run \`bun run harness derive stephanus-english ${slug}\``,
      );
      continue;
    }

    const greekIndexPath = join(repoRoot, stephanusIndexPath(slug));
    if (!existsSync(greekIndexPath)) {
      failures.push(`${stephanusIndexPath(slug)}: missing Greek Stephanus index for English spine check`);
      continue;
    }

    const greekMarkers = parseStephanusIndexToon(readFileSync(greekIndexPath, "utf8")).markers.map(
      (entry) => entry.marker,
    );
    let greekCursor = 0;
    for (const entry of englishIndex.markers) {
      const found = greekMarkers.indexOf(entry.marker, greekCursor);
      if (found === -1) {
        failures.push(
          `${englishRelativePath}: marker ${entry.marker} is not an order-preserving subset of the Greek index for ${slug}`,
        );
        break;
      }
      greekCursor = found + 1;
    }
  }

  return failures;
}

export function collectOntologySummary(): OntologySummary {
  const ontology = readOntologyVNextRepository();
  const conceptById = new Map(ontology.concepts.map((concept) => [concept.concept_id, concept]));
  const conceptsByAxis = new Map<string, number>();
  const membershipsByAxis = new Map<string, number>();
  const membershipCountByConcept = new Map<string, number>();
  const dialoguesByConcept = new Map<string, Set<string>>();

  for (const concept of ontology.concepts) {
    conceptsByAxis.set(concept.axis_id, (conceptsByAxis.get(concept.axis_id) ?? 0) + 1);
  }
  for (const membership of ontology.memberships) {
    const concept = conceptById.get(membership.concept_id)!;
    membershipsByAxis.set(concept.axis_id, (membershipsByAxis.get(concept.axis_id) ?? 0) + 1);
    membershipCountByConcept.set(concept.concept_id, (membershipCountByConcept.get(concept.concept_id) ?? 0) + 1);
    const dialogues = dialoguesByConcept.get(concept.concept_id) ?? new Set<string>();
    dialogues.add(dialogueFromObservationId(membership.observation_id));
    dialoguesByConcept.set(concept.concept_id, dialogues);
  }

  return {
    axisCount: ontology.axes.length,
    conceptCount: ontology.concepts.length,
    membershipCount: ontology.memberships.length,
    singletonConceptCount: ontology.concepts.filter(
      (concept) => (membershipCountByConcept.get(concept.concept_id) ?? 0) === 1,
    ).length,
    crossDialogueConceptCount: ontology.concepts.filter(
      (concept) => (dialoguesByConcept.get(concept.concept_id)?.size ?? 0) >= 2,
    ).length,
    axes: ontology.axes.map((axis) => ({
      axisId: axis.axis_id,
      axisKey: axis.axis_key,
      dimension: axis.dimension,
      conceptCount: conceptsByAxis.get(axis.axis_id) ?? 0,
      membershipCount: membershipsByAxis.get(axis.axis_id) ?? 0,
    })),
  };
}

export function collectReviewCoverage(): ReviewCoverageEntry[] {
  const repoRoot = getRepoRoot();

  const observationCoverage = observationLedgerPaths().map((relativePath) => {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const coverage: ReviewCoverageEntry = {
      path: relativePath,
      unreviewed: 0,
      accepted: 0,
      rejected: 0,
      needsSplit: 0,
    };

    for (const block of observationYamlBlocks(content)) {
      const status = fieldValue(block, "review_status");
      if (status === "accepted") {
        coverage.accepted += 1;
      } else if (status === "rejected") {
        coverage.rejected += 1;
      } else if (status === "needs_split") {
        coverage.needsSplit += 1;
      } else if (status === "unreviewed") {
        coverage.unreviewed += 1;
      }
    }

    return coverage;
  });

  const claimCoverage = claimLedgerPaths().map((relativePath) => {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const coverage: ReviewCoverageEntry = {
      path: relativePath,
      unreviewed: 0,
      accepted: 0,
      rejected: 0,
      needsSplit: 0,
    };

    for (const block of claimYamlBlocks(content)) {
      const status = fieldValue(block, "review_status");
      if (status === "accepted") {
        coverage.accepted += 1;
      } else if (status === "rejected") {
        coverage.rejected += 1;
      } else if (status === "needs_split") {
        coverage.needsSplit += 1;
      } else if (status === "unreviewed") {
        coverage.unreviewed += 1;
      }
    }

    return coverage;
  });

  const relationCoverage = relationLedgerPaths().map((relativePath) => {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const coverage: ReviewCoverageEntry = {
      path: relativePath,
      unreviewed: 0,
      accepted: 0,
      rejected: 0,
      needsSplit: 0,
    };

    for (const block of relationYamlBlocks(content)) {
      const status = fieldValue(block, "review_status");
      if (status === "accepted") {
        coverage.accepted += 1;
      } else if (status === "rejected") {
        coverage.rejected += 1;
      } else if (status === "needs_split") {
        coverage.needsSplit += 1;
      } else if (status === "unreviewed") {
        coverage.unreviewed += 1;
      }
    }

    return coverage;
  });

  const commentaryCoverage = listCommentaryLedgerPaths().map((relativePath) => {
    const content = readFileSync(join(repoRoot, relativePath), "utf8");
    const coverage: ReviewCoverageEntry = {
      path: relativePath,
      unreviewed: 0,
      accepted: 0,
      rejected: 0,
      needsSplit: 0,
    };

    for (const block of commentaryYamlBlocks(content)) {
      const status = fieldValue(block, "review_status");
      if (status === "accepted") {
        coverage.accepted += 1;
      } else if (status === "rejected") {
        coverage.rejected += 1;
      } else if (status === "needs_split") {
        coverage.needsSplit += 1;
      } else if (status === "unreviewed") {
        coverage.unreviewed += 1;
      }
    }

    return coverage;
  });

  return [...observationCoverage, ...claimCoverage, ...relationCoverage, ...commentaryCoverage];
}

export function validateRepo(): ValidationReport {
  const repoRoot = getRepoRoot();
  const requiredPaths = [
    ".env.example",
    "harness.config.json",
    "raw/plato/MANIFEST.sha256",
    "raw/plato/greek/euthyphro.txt",
    "raw/plato/greek/apology.txt",
    "raw/plato/greek/republic.txt",
    "wiki/ontology/axes.jsonl",
    "wiki/ontology/concepts.jsonl",
    "wiki/ontology/memberships.jsonl",
    "wiki/ingest-log.md",
    "docs/ontology-vnext.md",
    "docs/ontology-audit-protocol.md",
    "docs/plato-wiki-extraction-protocol.md",
    "docs/commentary-protocol.md",
    "docs/audio-edition-protocol.md",
    "docs/completeness-target.md",
    "audio/coverage.md",
    "wiki/completeness.md",
    ".pi/skills/plato-observation-extraction/SKILL.md",
    ".pi/prompts/ingest-plato-dialogue.md",
    ".pi/prompts/ingest-plato-segment.md",
    ".pi/prompts/extract-plato-claims-segment.md",
    ".pi/prompts/adjudicate-plato-relations.md",
    ".pi/prompts/review-plato-segment.md",
    ".pi/prompts/review-plato-claims-segment.md",
    ".pi/prompts/review-plato-relations.md",
  ];

  for (const relativePath of requiredPaths) {
    const path = join(repoRoot, relativePath);
    if (!existsSync(path)) {
      throw new Error(`Missing required file: ${relativePath}`);
    }
  }

  const workflowPolicyFailures = collectChangedCorpusWorkflowFailures();
  if (workflowPolicyFailures.length > 0) {
    throw new Error(`Corpus workflow policy failed:\n${workflowPolicyFailures.join("\n")}`);
  }

  const manifestFailures = verifySha256Manifest("raw/plato/MANIFEST.sha256");
  if (manifestFailures.length > 0) {
    throw new Error(`Source manifest verification failed:\n${manifestFailures.join("\n")}`);
  }

  const bannedTextFailures = scanForBannedInstructionText();
  if (bannedTextFailures.length > 0) {
    throw new Error(`Harness-facing instruction text failed scan:\n${bannedTextFailures.join("\n")}`);
  }

  const instructionContractFailures = validateHarnessInstructionContract();
  if (instructionContractFailures.length > 0) {
    throw new Error(`Harness-facing instruction contract failed scan:\n${instructionContractFailures.join("\n")}`);
  }

  const ontologyIssues = validateOntologyVNextRepository();
  if (ontologyIssues.length > 0) {
    throw new Error(
      `Ontology vNext validation failed:\n${ontologyIssues
        .map((issue) => `${issue.path}: [${issue.code}] ${issue.message}`)
        .join("\n")}`,
    );
  }

  // The reported-turn scope manifest is reviewed editorial input, so a stale or
  // malformed one must fail here rather than wait for someone to run the
  // completeness report. Its bindings are what make a census go stale when the
  // Greek source or the outer-turn index moves.
  const reportedTurnScopeFailures = collectReportedTurnScopeFailures();
  if (reportedTurnScopeFailures.length > 0) {
    throw new Error(`Reported-turn scope manifest validation failed:\n${reportedTurnScopeFailures.join("\n")}`);
  }

  const observationLedgerCount = validateObservationLedgers();
  const claimLedgerCount = validateClaimLedgers();
  const relationLedgerCount = validateRelationLedgers();
  const commentaryLedgerCount = validateCommentaryLedgers();
  const apparatusLedgerCount = validateApparatusLedgers();
  const voicesLedgerCount = validateVoicesLedgers();
  const commentaryQualityAuditIssues = validateCommentaryQualityAuditManifests();
  if (commentaryQualityAuditIssues.length > 0) {
    throw new Error(
      `Commentary quality-audit manifest validation failed:\n${formatCommentaryQualityAuditManifestIssues(commentaryQualityAuditIssues)}`,
    );
  }
  const commentaryQualityAuditManifestCount = listCommentaryQualityAuditManifestPaths().length;
  const recordingManifestIssues = validateRecordingManifests();
  if (recordingManifestIssues.length > 0) {
    throw new Error(
      `Recording manifest validation failed:\n${formatRecordingManifestValidationError(recordingManifestIssues)}`,
    );
  }
  validateSiteRecordingEvidence({
    recordings: discoverSiteRecordings(),
    artifactRoot: process.env.PLATO_RECORDING_ARTIFACT_ROOT,
  });
  const audioCatalogIssues = validateAudioCatalogArtifacts();
  if (audioCatalogIssues.length > 0) {
    throw new Error(`Audio catalog validation failed:\n${formatAudioCatalogValidationError(audioCatalogIssues)}`);
  }
  const audioReferenceSourceIssues = validateAudioReferenceSourceArtifacts();
  if (audioReferenceSourceIssues.length > 0) {
    throw new Error(
      `Audio reference source validation failed:\n${formatAudioReferenceSourceIssues(audioReferenceSourceIssues)}`,
    );
  }
  const audioProductionIssues = validateAudioProductionArtifacts();
  if (audioProductionIssues.length > 0) {
    throw new Error(`Audio production validation failed:\n${formatAudioProductionIssues(audioProductionIssues)}`);
  }
  const audioCoverageReport = buildAudioCoverageReport();
  const audioCoverageIssues = validateAudioCoverageReport("audio/coverage.md", audioCoverageReport);
  if (audioCoverageIssues.length > 0) {
    throw new Error(
      `Audio coverage report validation failed:\n${audioCoverageIssues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  const completenessFacts = auditCompletenessFacts({ audioCoverage: audioCoverageReport });
  const completenessReport = buildCompletenessReport(completenessFacts);
  const completenessIssues = validateCompletenessReport("wiki/completeness.md", completenessReport);
  if (completenessIssues.length > 0) {
    throw new Error(
      `Edition completeness report validation failed:\n${completenessIssues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  const publicReleaseIssues = validatePublicReleaseReport(completenessFacts, completenessReport);
  if (publicReleaseIssues.length > 0) {
    throw new Error(
      `Public-release readiness report validation failed:\n${publicReleaseIssues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  const englishSpineFailures = validateEnglishSpines();
  if (englishSpineFailures.length > 0) {
    throw new Error(`English spine validation failed:\n${englishSpineFailures.join("\n")}`);
  }

  const provenanceFailures = collectReviewProvenanceFailures();
  if (provenanceFailures.length > 0) {
    throw new Error(`Review-status provenance check failed:\n${provenanceFailures.join("\n")}`);
  }

  const clusterFailures = validateClusterArtifacts();
  if (clusterFailures.length > 0) {
    throw new Error(`Cluster artifact validation failed:\n${clusterFailures.join("\n")}`);
  }

  const dossierFailures = validateDossierArtifacts();
  if (dossierFailures.length > 0) {
    throw new Error(`Dossier artifact validation failed:\n${dossierFailures.join("\n")}`);
  }

  const ontologyAuditFailures = collectOntologyAuditFailures();
  if (ontologyAuditFailures.length > 0) {
    throw new Error(`Ontology audit package validation failed:\n${ontologyAuditFailures.join("\n")}`);
  }

  return {
    observationLedgerCount,
    claimLedgerCount,
    relationLedgerCount,
    commentaryLedgerCount,
    apparatusLedgerCount,
    voicesLedgerCount,
    commentaryQualityAuditManifestCount,
    ontology: collectOntologySummary(),
    reviewCoverage: collectReviewCoverage(),
  };
}

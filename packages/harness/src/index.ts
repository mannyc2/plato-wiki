export { getRepoRoot } from "./paths.js";
export {
  fencedYamlRecordBlocks,
  fieldValue,
  fieldValueOrEmpty,
  listFieldValue,
  nestedFieldValue,
  nestedFieldValueInParent,
  parseCanonicalYamlRecord,
  rawFencedYamlBlocks,
  replaceFencedYamlRecordBlocks,
  serializeCanonicalYamlRecord,
  type CanonicalYamlRecord,
  type CanonicalYamlValue,
  type FencedYamlRecordBlock,
} from "./wiki/fenced-record.js";
export {
  applyFencedRecordMigration,
  canonicalizeLegacyFencedRecord,
  migrateFencedRecordMarkdown,
  planFencedRecordMigration,
  type FencedRecordMigrationEntry,
  type FencedRecordMigrationPlan,
} from "./wiki/fenced-record-migration.js";
export {
  collectOntologyAuditFailures,
  formatOntologyAuditIssues,
  generateOntologyAuditPackage,
  listOntologyAuditPackagePaths,
  ontologyBaselineEvidenceContract,
  ONTOLOGY_AUDIT_PARTITION_FILES,
  refreshOntologyAuditBaselineDefinitions,
  validateOntologyBaselineEvidence,
  verifyOntologyAuditPackage,
  writeOntologyBaselineEvidence,
  type OntologyBaselineEvidence,
  type OntologyAuditAcceptance,
  type OntologyAuditAdjudication,
  type OntologyAuditConceptUnit,
  type OntologyAuditGraphUnit,
  type OntologyAuditIssue,
  type OntologyAuditManifest,
  type OntologyAuditRecordUnit,
  type OntologyAuditSourceUnit,
} from "./wiki/ontology-audit.js";
export {
  canonicalizeOntologySourceReviewArtifacts,
  importOntologySourceReview,
  normalizeOntologyAuditFindingIds,
} from "./wiki/ontology-audit-review.js";
export { reconcileOntologySourceReviews } from "./wiki/ontology-audit-reconciliation.js";
export {
  acceptOntologyAuditClosure,
  bindOntologyAuditFinalState,
} from "./wiki/ontology-audit-finalization.js";
export { applyOntologyVNextHardCut } from "./wiki/ontology-vnext-hard-cut.js";
export {
  collectOntologyClosureEvidence,
  closeOntologyVNextAudit,
  ontologyRegenerationDigest,
  regenerateOntologyArtifactsTwice,
} from "./wiki/ontology-vnext-closure.js";
export { applyOntologyVNextMigration, planOntologyVNextMigration } from "./wiki/ontology-vnext-migration.js";
export { applySemanticRemediation, planSemanticRemediation } from "./wiki/semantic-remediation.js";
export {
  applyAcceptedActiveSpeakerPolicy,
  buildCharacterCatalogFromSpeakerCensus,
  formatAudioCatalogValidationError,
  parseCastCatalog,
  parseCharacterCatalog,
  validateAudioCatalogArtifacts,
  validateCastCatalog,
  validateCharacterCatalog,
} from "./audio-catalog.js";
export {
  formatAudioReferenceSourceIssues,
  validateAudioReferenceSourceArtifacts,
  validateReferenceSourceCatalog,
  type AudioReferenceSourceIssue,
} from "./audio-reference-sources.js";
export {
  audioWordCount,
  canonicalSpokenEnglish,
  characterNamesForDialogue,
  formatAudioProductionIssues,
  listAudioQaPaths,
  listAudioScriptPaths,
  parseAudioQa,
  parseAudioScript,
  validateAudioProductionArtifacts,
  validateAudioQa,
  validateAudioQaArtifact,
  validateAudioScript,
  validateAudioScriptArtifact,
} from "./audio-production.js";
export {
  buildScreenplayGenerationReport,
  writeDraftScreenplay,
  writeProductionScreenplay,
} from "./audio-screenplay-generator.js";
export {
  inspectAudioInsertionBlock,
  inspectAudioInsertionValue,
  renderAudioInsertionLines,
  resolveCommentaryPlaybackBoundary,
  resolveAudioInsertionBoundary,
  sourceTurnBoundaryAtOrAfter,
  sourceTurnBoundaryAtOrBefore,
  type AudioInsertionBoundary,
  type AudioInsertionResolution,
} from "./audio-insertion.js";
export {
  buildAudioCoverageReport,
  renderAudioCoverageReport,
  validateAudioCoverageReport,
  writeAudioCoverageReport,
} from "./audio-coverage.js";
export {
  buildAnchorsReport,
  renderAnchorsReportText,
  writeAnchorsReport,
} from "./anchors-report.js";
export { planClaimQueue, planClaimReviewQueue, runClaimQueue, runClaimReviewQueue } from "./claims-queue.js";
export {
  appendClaimSegmentCoverage,
  claimReviewTargetIdsComplete,
  planClaimReviewForIds,
  planSegmentedClaimReview,
  planSegmentedClaims,
} from "./claims-segments.js";
export { buildClusters, clusterGateReport, validateClusterArtifacts, writeClusterArtifacts } from "./clusters.js";
export { buildDossiers, validateDossierArtifacts, writeDossierArtifacts } from "./dossiers.js";
export { buildCoverageReport, renderCoverageReport, writeCoverageReport } from "./coverage.js";
export {
  auditCompletenessFacts,
  buildCompletenessFacts,
  buildCompletenessReport,
  CANONICAL_DIALOGUES,
  COMPLETENESS_TARGETS,
  renderCompletenessReport,
  validateCanonicalDialogueSet,
  validateCompletenessReport,
  writeCompletenessReport,
} from "./completeness.js";
export type {
  CompletenessFacts,
  CompletenessFamily,
  CompletenessFamilyId,
  CompletenessReport,
  CompletenessState,
  CompletenessTarget,
  DialogueCompletenessFacts,
} from "./completeness.js";
export { writeCommentaryBriefs } from "./commentary-briefs.js";
export {
  buildCommentaryAuditBriefs,
  buildCommentaryAuditBriefsFromSnapshot,
  COMMENTARY_QUALITY_AUDIT_JSON_SCHEMA,
  COMMENTARY_QUALITY_ISSUE_CODES,
  parseCommentaryQualityAudit,
  writeCommentaryAuditBriefs,
} from "./commentary-audit.js";
export {
  applyCommentaryStructuralRemediation,
  previewCommentaryStructuralRemediation,
} from "./wiki/commentary-structural-remediation.js";
export type {
  CommentaryStructuralRemediationApply,
  CommentaryStructuralAuditFinding,
  CommentaryStructuralRemediationInput,
  CommentaryStructuralRemediationOperation,
  CommentaryStructuralRemediationPreview,
} from "./wiki/commentary-structural-remediation.js";
export {
  importCommentaryDraft,
  importCommentaryDraftBatch,
  parseCommentaryUnitDraft,
} from "./commentary-drafts.js";
export {
  buildCommentaryCampaignManifest,
  buildCommentaryCampaignPlan,
  buildCommentaryCampaignPreflightReport,
  buildCommentaryCampaignStatusReport,
  createReusableCanonicalAuditOutputResolver,
  COMMENTARY_OUTLINE_JSON_SCHEMA,
  COMMENTARY_REWRITE_JSON_SCHEMA,
  COMMENTARY_UNIT_DRAFT_JSON_SCHEMA,
  importCommentaryOutline,
  importCommentaryRewrite,
  importCommentaryRewriteBatch,
  parseCommentaryOutline,
  parseCommentaryRewrite,
  prepareCommentaryCampaignRetries,
  prepareCommentaryCampaignRetry,
  previewCommentaryCampaignRetries,
  readLunaAuthStatus,
  readLunaProviderAccessStatus,
  runCommentaryCampaign,
  runCommentaryCampaignPlan,
  selectCommentaryCampaignJobs,
  validateCurrentCommentaryAuditArtifact,
  writeCommentaryCampaignStatusReport,
} from "./commentary-campaign.js";
export {
 applyCommentaryDelegatedAudit,
  COMMENTARY_DELEGATED_AUDIT_CANDIDATE_JSON_SCHEMA,
 parseCommentaryDelegatedAuditCandidate,
 previewCommentaryDelegatedAudit,
 readCommentaryDelegatedAuditCandidate,
 readCurrentCommentaryDelegatedAudit,
  validateCommentaryDelegatedAuditSubmission,
} from "./wiki/commentary-delegated-audit.js";
export type {
  CommentaryDelegatedAuditApply,
  CommentaryDelegatedAuditCandidate,
  CommentaryDelegatedAuditJobBinding,
  CommentaryDelegatedAuditPreview,
  CommentaryDelegatedAuditProvenance,
  ValidatedCommentaryDelegatedAuditSubmission,
} from "./wiki/commentary-delegated-audit.js";

export type {
  CommentaryAuditBrief,
  CommentaryAuditBriefInputSnapshot,
  CommentaryQualityAudit,
  CommentaryQualityDisposition,
  CommentaryQualityIssueCode,
  WrittenCommentaryAuditBrief,
} from "./commentary-audit.js";
export type {
  CommentaryCampaignPreflightClassification,
  CommentaryCampaignPreflightEntry,
  CommentaryCampaignPreflightReport,
  CommentaryCampaignJobSelectionOptions,
  CommentaryCampaignRetryOptions,
  CommentaryCampaignRetryResult,
  ReusableCanonicalAuditOutputResolver,
  CurrentCommentaryAuditArtifact,
} from "./commentary-campaign.js";
export type {
  CommentaryCampaignAttempt,
  CommentaryCampaignTokenUsage,
  CommentaryCampaignUsageReport,
  ParsedCodexExecResult,
} from "./commentary-campaign-telemetry.js";
export {
  buildCommentaryCampaignUsageReport,
  commentaryCampaignTelemetryPath,
  CodexExecOperationalError,
  parseCodexExecResult,
} from "./commentary-campaign-telemetry.js";
export { readConfig } from "./config.js";
export { planSegmentedIngestQueue, runSegmentedIngestQueue } from "./ingest-queue.js";
export {
  buildJobManifest,
  findJob,
  JOB_MANIFEST_PATH,
  JOB_SCHEMA_VERSION,
  jobIdFor,
  jobInputsChanged,
  readJobManifest,
  renderJob,
  renderJobList,
  writeJobManifest,
} from "./jobs.js";
export type { Job, JobInput, JobLane, JobManifest } from "./jobs.js";
export {
  listSubmissionScopes,
  readSubmissions,
  recordSubmission,
  submissionDirectory,
  SUBMISSIONS_ROOT,
} from "./submissions.js";
export type { SubmissionRecord } from "./submissions.js";
export { listModels, listProfiles, listProviders } from "./models.js";
export { buildAnchorIndex, writeAnchorIndex, writeAnchorIndexes } from "./derived/anchors.js";
export { buildObservationTurnJoin, writeObservationTurnJoin, writeObservationTurnJoins } from "./derived/joins.js";
export { buildVoiceIndex, readVoiceIndex, writeVoiceIndex, writeVoiceIndexes } from "./derived/voices.js";
export { buildVoiceJoin, writeVoiceJoin, writeVoiceJoins } from "./derived/voice-joins.js";
export { buildAssentMetrics, buildProcedureMetrics, buildTurnLengthMetrics, writeDerivedMetrics } from "./derived/metrics.js";
export {
  listEnglishDialogues,
  listGreekDialogues,
  planStephanusSegments,
  writeEnglishStephanusIndex,
  writeStephanusIndex,
} from "./derived/stephanus.js";
export { buildTokenIndex, writeTokenIndex, writeTokenIndexes } from "./derived/tokens.js";
export { buildTurnIndex, writeTurnIndex, writeTurnIndexes } from "./derived/turns.js";
export { planSegmentedReviewQueue, runSegmentedReviewQueue } from "./review-queue.js";
export { planSegmentedReview } from "./review-segments.js";
export { planRelationQueue, planRelationReviewQueue, runRelationQueue, runRelationReviewQueue } from "./relations-queue.js";
export {
  buildRelationCandidates,
  loadAcceptedRelationClaims,
  planSegmentedRelationReview,
  planSegmentedRelations,
  relationCandidateKey,
  relationCandidateKeysComplete,
  relationReviewTargetIdsComplete,
  writeRelationCandidates,
} from "./relations.js";
export { planGapIngest, planSegmentedIngest } from "./segments.js";
export { buildStaticSite, parseObservationLedger } from "./site/index.js";
export { validateGeneratedSite } from "./site/validate.js";
export { resolveEnglishSpan, resolveSourceSpan } from "./source.js";
export { listTranscripts, summarizeTranscriptTrace, summarizeTranscriptUsage, writeTranscriptUsageArtifacts } from "./transcript.js";
export { validateRepo } from "./validate.js";
export {
  buildPublicReleaseFacts,
  buildPublicReleaseReport,
  renderPublicReleaseReport,
  validatePublicReleaseReport,
  writePublicReleaseReport,
} from "./public-release.js";
export {
  buildReplayProvenanceReceipt,
  publicEditorialArtifactPaths,
  validateReleaseProvenanceReceipts,
} from "./release-provenance.js";
export type {
  PublicReleaseCheckId,
  PublicReleaseFact,
  PublicReleaseFacts,
  PublicReleaseReport,
  PublicReleaseTarget,
} from "./public-release.js";
export {
  formatRecordingManifestValidationError,
  listRecordingManifestPaths,
  parseRecordingManifest,
  validateRecordingManifest,
  validateRecordingManifests,
} from "./wiki/recording-manifest.js";
export {
  applyCommentaryQualityAuditManifestRefresh,
  buildCommentaryQualityAuditManifestPreview,
  formatCommentaryQualityAuditManifestIssues,
  listCommentaryQualityAuditManifestPaths,
  parseCommentaryQualityAuditManifest,
  previewCommentaryQualityAuditManifestRefresh,
  validateCommentaryQualityAuditManifest,
  validateCommentaryQualityAuditManifests,
  writeCommentaryQualityAuditManifestPreview,
} from "./wiki/commentary-quality-audit.js";
export type {
  CommentaryQualityAuditManifestRefreshApply,
  CommentaryQualityAuditManifestRefreshPreview,
} from "./wiki/commentary-quality-audit.js";
export {
  applyCommentaryQualityAuditAcceptance,
  applyCommentaryQualityAuditAcceptanceReplacement,
  applyCommentaryQualityAuditAcceptanceSupersede,
  previewCommentaryQualityAuditAcceptance,
  previewCommentaryQualityAuditAcceptanceReplacement,
  previewCommentaryQualityAuditAcceptanceSupersede,
  validateCommentaryQualityAuditAcceptanceSample,
} from "./wiki/commentary-quality-audit-acceptance.js";
export type {
  CommentaryQualityAuditAcceptanceApply,
  CommentaryQualityAuditAcceptanceInput,
  CommentaryQualityAuditAcceptancePreview,
  CommentaryQualityAuditAcceptanceSupersedeApply,
  CommentaryQualityAuditAcceptanceSupersedeInput,
  CommentaryQualityAuditAcceptanceSupersedePreview,
} from "./wiki/commentary-quality-audit-acceptance.js";
export {
  applyCommentaryRewriteAcceptance,
  previewCommentaryRewriteAcceptance,
} from "./wiki/commentary-rewrite-review.js";
export type {
  CommentaryRewriteAcceptanceApply,
  CommentaryRewriteAcceptancePreview,
  CommentaryRewriteReviewInput,
  CommentaryRewriteStatusSnapshot,
} from "./wiki/commentary-rewrite-review.js";
export {
  applyCommentaryBlockReview,
  previewCommentaryBlockReview,
} from "./wiki/commentary-block-review.js";
export type {
  CommentaryBlockReviewApply,
  CommentaryBlockReviewDecision,
  CommentaryBlockReviewInput,
  CommentaryBlockReviewPreview,
} from "./wiki/commentary-block-review.js";
export {
  applyCommentarySampleRepair,
  previewCommentarySampleRepair,
} from "./wiki/commentary-sample-repair.js";
export type {
  CommentarySampleRepairApply,
  CommentarySampleRepairCandidate,
  CommentarySampleRepairPreview,
} from "./wiki/commentary-sample-repair.js";
export {
  applyCommentaryRewriteRepair,
  previewCommentaryRewriteRepair,
} from "./wiki/commentary-rewrite-repair.js";
export type {
  CommentaryRewriteRepairApply,
  CommentaryRewriteRepairCandidate,
  CommentaryRewriteRepairFinding,
  CommentaryRewriteRepairPreview,
} from "./wiki/commentary-rewrite-repair.js";
export { runHarnessCommand } from "./run.js";

export type {
  AudioCoverageReport,
  AudioCoverageStatusCounts,
  AudioCoverageSummary,
  DialogueAudioCoverage,
  WrittenAudioCoverageReport,
} from "./audio-coverage.js";

export type {
  AudioCatalogValidationIssue,
  AudioCharacter,
  CastCatalog,
  CharacterAppearance,
  CharacterCatalog,
  CharacterIdentityStatus,
  CharacterRoleFlag,
  DialogueCharacterRoster,
  DotsVoice,
  EditorialStatus,
} from "./audio-catalog.js";

export type {
  AudioCadenceIntent,
  AudioProductionValidationIssue,
  AudioQaChapter,
  AudioQaReport,
  AudioQaStatus,
  AudioScript,
  AudioScriptChapter,
  AudioScriptCoverage,
  AudioScriptEntry,
  AudioScriptEntryKind,
  AudioScriptRepair,
} from "./audio-production.js";

export type {
  ScreenplayGenerationBlocker,
  ScreenplayGenerationReport,
  SourceAttributionDiagnostic,
  SpeakerAttributionPlan,
  SpeakerAttributionSegment,
} from "./audio-screenplay-generator.js";

export type {
  HarnessConfig,
  HarnessRunCommand,
  HarnessRunOptions,
  HarnessRunResult,
  OntologyAxisSummary,
  OntologySummary,
  ModelInfo,
  ProfileInfo,
  ProviderInfo,
  ProviderProfile,
  ReviewCoverageEntry,
  SourceRef,
  SourceSpanResolution,
  TranscriptInfo,
  TranscriptTraceSummary,
  TranscriptUsageSummary,
  UsageRecord,
  ValidationReport,
} from "./types.js";

export type {
  RecordingAudio,
  RecordingCastDisplay,
  RecordingChapter,
  RecordingManifest,
  RecordingManifestValidationIssue,
  RecordingProvenanceDisplay,
  RecordingStatus,
} from "./wiki/recording-manifest.js";

export type {
  CommentaryQualityAuditAcceptance,
  CommentaryQualityAuditManifest,
  CommentaryQualityAuditManifestIssue,
  CommentaryQualityAuditManifestUnit,
  WrittenCommentaryQualityAuditManifestPreview,
} from "./wiki/commentary-quality-audit.js";

export type {
  CommentaryDraftBlock,
  CommentaryDraftBlockKind,
  CommentaryDraftCites,
  CommentaryDraftCrossref,
  CommentaryDraftImportOptions,
  CommentaryDraftImportResult,
  CommentaryDraftPlacement,
  CommentaryUnitDraft,
} from "./commentary-drafts.js";

export type {
  LunaAuthStatus,
  LunaProviderAccessStatus,
  CommentaryCampaignCommandResult,
  CommentaryCampaignCommandRunner,
  CommentaryCampaignDialogueStatus,
  CommentaryCampaignJob,
  CommentaryCampaignJobResult,
  CommentaryCampaignManifest,
  CommentaryCampaignStage,
  CommentaryCampaignStatusReport,
  CommentaryOutline,
  CommentaryOutlineCites,
  CommentaryOutlineImportResult,
  CommentaryRewrite,
  CommentaryRewriteCrossref,
  CommentaryRewriteImportResult,
  RunCommentaryCampaignOptions,
} from "./commentary-campaign.js";

export type {
  SegmentedIngestQueueEvent,
  SegmentedIngestQueueOptions,
  SegmentedIngestQueueResult,
  SegmentedIngestQueueSegmentResult,
} from "./ingest-queue.js";

export type {
  ClaimQueueEvent,
  ClaimQueueOptions,
  ClaimQueueResult,
  ClaimQueueSegmentResult,
  ClaimReviewQueueBatchResult,
  ClaimReviewQueueEvent,
  ClaimReviewQueueOptions,
  ClaimReviewQueueResult,
} from "./claims-queue.js";

export type {
  RelationQueueBatchResult,
  RelationQueueEvent,
  RelationQueueOptions,
  RelationQueueResult,
  RelationReviewQueueBatchResult,
  RelationReviewQueueEvent,
  RelationReviewQueueOptions,
  RelationReviewQueueResult,
} from "./relations-queue.js";

export type {
  SegmentedClaimReviewBatch,
  SegmentedClaimSegment,
} from "./claims-segments.js";

export type {
  SegmentedRelationBatch,
  SegmentedRelationReviewBatch,
} from "./relations.js";

export type {
  SegmentedReviewQueueBatchResult,
  SegmentedReviewQueueEvent,
  SegmentedReviewQueueOptions,
  SegmentedReviewQueueResult,
} from "./review-queue.js";

export type Usage = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };
};

export type UsageRecord = {
  timestamp: number;
  api: string;
  provider: string;
  model: string;
  responseId: string | undefined;
  stopReason: string;
  usage: Usage;
};

export type TranscriptUsageSummary = {
  runName: string;
  runPath: string;
  requestCount: number;
  totals: Usage;
  records: UsageRecord[];
};

export type SourceRef = {
  source_path: string;
  stephanus_span: string;
  start_marker: string;
  end_marker: string;
  start_char: number;
  end_char: number;
  text_sha256: string;
};

export type SourceSpanResolution = {
  source_ref: SourceRef;
  text: string;
};

export type OntologyAxisSummary = {
  axisId: string;
  axisKey: string;
  dimension: string;
  conceptCount: number;
  membershipCount: number;
};

export type OntologySummary = {
  axisCount: number;
  conceptCount: number;
  membershipCount: number;
  singletonConceptCount: number;
  crossDialogueConceptCount: number;
  axes: OntologyAxisSummary[];
};

export type ReviewCoverageEntry = {
  path: string;
  unreviewed: number;
  accepted: number;
  rejected: number;
  needsSplit: number;
};

export type ValidationReport = {
  observationLedgerCount: number;
  claimLedgerCount: number;
  relationLedgerCount: number;
  commentaryLedgerCount: number;
  apparatusLedgerCount: number;
  voicesLedgerCount: number;
  commentaryQualityAuditManifestCount: number;
  ontology: OntologySummary;
  reviewCoverage: ReviewCoverageEntry[];
};

export type TranscriptInfo = {
  name: string;
  path: string;
};

export type TranscriptTraceIssue = {
  code: string;
  count: number;
};

export type TranscriptTraceRejection = {
  ts: string;
  type: string;
  path: string | undefined;
  issueCount: number | undefined;
  issueCodes: TranscriptTraceIssue[];
};

export type TranscriptTraceWrite = {
  ts: string;
  type: string;
  path: string | undefined;
  bytes: number | undefined;
  observationCount?: number | undefined;
  claimCount?: number | undefined;
  relationCount?: number | undefined;
  assignedFeatureCount?: number | undefined;
};

export type TranscriptTraceAssistantError = {
  ts: string;
  provider: string | undefined;
  model: string | undefined;
  stopReason: string | undefined;
  errorMessage: string | undefined;
};

export type TranscriptTraceSummary = {
  runName: string;
  runPath: string;
  eventCount: number;
  parseErrorCount: number;
  eventTypes: Record<string, number>;
  agentEventTypes: Record<string, number>;
  toolExecutionCounts: Record<string, number>;
  wikiEventCounts: Record<string, number>;
  rejections: TranscriptTraceRejection[];
  writes: TranscriptTraceWrite[];
  assistantErrors: TranscriptTraceAssistantError[];
  usage:
    | {
        requestCount: number;
        totals: TranscriptUsageSummary["totals"];
      }
    | undefined;
  responseText: string | undefined;
};

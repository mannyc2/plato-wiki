import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { buildAudioCoverageReport, type AudioCoverageReport, type DialogueAudioCoverage } from "./audio-coverage.js";
import { ensureCanonicalOntologyWorkRoot } from "./wiki/ontology-audit-package-path.js";
import { validateClusterArtifacts } from "./clusters.js";
import { validateDossierArtifacts } from "./dossiers.js";
import {
  anchorIndexPath,
  buildAnchorIndex,
  formatAnchorIndexToon,
} from "./derived/anchors.js";
import {
  buildObservationTurnJoin,
  formatObservationTurnJoinToon,
  observationTurnJoinPath,
} from "./derived/joins.js";
import {
  assentMetricsPath,
  buildAssentMetrics,
  buildProcedureMetrics,
  buildTurnLengthMetrics,
  formatAssentMetricsToon,
  formatProcedureMetricsToon,
  formatTurnLengthMetricsToon,
  procedureMetricsPath,
  turnLengthMetricsPath,
} from "./derived/metrics.js";
import {
  buildEnglishStephanusIndex,
  buildStephanusIndex,
  englishStephanusIndexPath,
  formatStephanusIndexToon,
  listEnglishDialogues,
  listGreekDialogues,
  stephanusIndexPath,
} from "./derived/stephanus.js";
import { buildTokenIndex, formatTokenIndexToon, tokenIndexPath } from "./derived/tokens.js";
import { buildTurnIndex, formatTurnIndexToon, parseTurnIndexToon, turnIndexPath } from "./derived/turns.js";
import { buildVoiceIndex, collectAcceptedProjectionFailures, formatVoiceIndexToon, voiceIndexPath } from "./derived/voices.js";
import { getRepoRoot, setRepoRootForTesting } from "./paths.js";
import { planSegmentedClaims } from "./claims-segments.js";
import { planSegmentedIngest } from "./segments.js";
import { buildStaticSite } from "./site/index.js";
import {
  discoverSiteRecordings,
  validateSiteRecordingEvidence,
} from "./site/recordings.js";
import { validateGeneratedSite } from "./site/validate.js";
import { claimYamlBlocks } from "./wiki/claim-ledger.js";
import { validateClaimLedger } from "./wiki/claim-validator.js";
import { fieldValue, observationYamlBlocks } from "./wiki/observation-ledger.js";
import { validateObservationLedger } from "./wiki/observation-validator.js";
import { relationYamlBlocks } from "./wiki/relation-ledger.js";
import { validateRelationLedger } from "./wiki/relation-validator.js";
import {
  listOntologyAuditPackagePaths,
  verifyOntologyAuditSemanticPreacceptance,
} from "./wiki/ontology-audit.js";
import {
  assertOntologyClosureEvidenceProof,
  verifyOntologyClosureEvidenceFile,
  type VerifiedOntologyClosureEvidenceProof,
} from "./wiki/ontology-closure-evidence.js";
import { parseVoiceLedger, voiceYamlBlocks, type VoiceRecord } from "./wiki/voices-ledger.js";
import { validateVoicesLedger } from "./wiki/voices-validator.js";
import {
  formatReportedTurnScopeIssue,
  readReportedTurnScopes,
  reportedTurnScopesPath,
  type ReportedTurnScopeEntry,
} from "./reported-turn-scopes.js";

export const CANONICAL_DIALOGUES = [
  "apology",
  "charmides",
  "cratylus",
  "critias",
  "crito",
  "euthydemus",
  "euthyphro",
  "gorgias",
  "greater-hippias",
  "ion",
  "laches",
  "laws",
  "lesser-hippias",
  "lysis",
  "menexenus",
  "meno",
  "parmenides",
  "phaedo",
  "phaedrus",
  "philebus",
  "protagoras",
  "republic",
  "sophist",
  "statesman",
  "symposium",
  "theaetetus",
  "timaeus",
] as const;

export type CompletenessTarget = "corpus" | "knowledge-base" | "audio-edition";
export type CompletenessState = "pass" | "fail" | "not_applicable" | "contract_pending";
export type CompletenessFamilyId =
  | "CMP-SOURCE"
  | "CMP-OBSERVATIONS"
  | "CMP-CLAIMS"
  | "CMP-RELATIONS"
  | "CMP-DERIVED"
  | "CMP-REPORTED-TURNS"
  | "CMP-COMPARISON"
  | "CMP-SITE"
  | "CMP-ENGLISH"
  | "CMP-READINGS"
  | "CMP-WRITING-AUDIT"
  | "CMP-AUDIO-TRUTH"
  | "CMP-AUDIO-ATTRIBUTION"
  | "CMP-AUDIO-SCREENPLAY"
  | "CMP-AUDIO-RENDER"
  | "CMP-AUDIO-MASTERING"
  | "CMP-AUDIO-MECHANICAL-QA"
  | "CMP-AUDIO-ACCEPTANCE"
  | "CMP-AUDIO-RECORDING"
  | "CMP-AUDIO-WEBSITE"
  | "CMP-APPARATUS";

export const COMPLETENESS_TARGETS: Record<CompletenessTarget, readonly CompletenessFamilyId[]> = {
  corpus: [
    "CMP-SOURCE",
    "CMP-OBSERVATIONS",
    "CMP-CLAIMS",
    "CMP-RELATIONS",
    "CMP-DERIVED",
    "CMP-REPORTED-TURNS",
    "CMP-COMPARISON",
    "CMP-SITE",
  ],
  "knowledge-base": [
    "CMP-SOURCE",
    "CMP-OBSERVATIONS",
    "CMP-CLAIMS",
    "CMP-RELATIONS",
    "CMP-DERIVED",
    "CMP-REPORTED-TURNS",
    "CMP-COMPARISON",
    "CMP-SITE",
    "CMP-ENGLISH",
    "CMP-READINGS",
    "CMP-WRITING-AUDIT",
    "CMP-AUDIO-TRUTH",
  ],
  "audio-edition": [
    "CMP-SOURCE",
    "CMP-OBSERVATIONS",
    "CMP-CLAIMS",
    "CMP-RELATIONS",
    "CMP-DERIVED",
    "CMP-REPORTED-TURNS",
    "CMP-COMPARISON",
    "CMP-SITE",
    "CMP-ENGLISH",
    "CMP-READINGS",
    "CMP-WRITING-AUDIT",
    "CMP-AUDIO-TRUTH",
    "CMP-AUDIO-ATTRIBUTION",
    "CMP-AUDIO-SCREENPLAY",
    "CMP-AUDIO-RENDER",
    "CMP-AUDIO-MASTERING",
    "CMP-AUDIO-MECHANICAL-QA",
    "CMP-AUDIO-ACCEPTANCE",
    "CMP-AUDIO-RECORDING",
    "CMP-AUDIO-WEBSITE",
  ],
};

export type ReviewCounts = {
  accepted: number;
  rejected: number;
  unreviewed: number;
  needsSplit: number;
};

export type RelationScopeCompletenessFacts = {
  ledger: boolean;
  valid: boolean;
  records: number;
  auditedRecords: number;
  acceptedEdges: number;
  auditedAcceptedEdges: number;
  review: ReviewCounts;
};

export type RelationAuditCompletenessFacts = {
  packagePath: string | null;
  semanticProofVerified: boolean;
  closureEvidenceValid: boolean;
  rejectedReaderLeaks: number;
  acceptedRelationFictionIssues: number;
};

/**
 * What `CMP-REPORTED-TURNS` needs to know about one dialogue's nested reported
 * turns (the reported-turn scope census).
 *
 * `scope` comes from the reviewed manifest, never from disk: `unscoped` means
 * no reviewed census exists, which is a failure and not a zero. Everything
 * below it describes the ledger and its compiled projection, and deliberately
 * says nothing about claim joins, cutover activation, or audio — a dialogue's
 * reported turns can be complete for years without any consumer reading them.
 */
export type ReportedTurnCompletenessFacts = {
  scope: "required" | "none" | "unscoped";
  /** Manifest and receipt problems for this dialogue, already formatted. */
  scopeIssues: string[];
  manifestTurnIds: string[];
  ledger: boolean;
  ledgerValid: boolean;
  /** Outer turns the ledger speaks about at all, whatever each record's status. */
  representedTurnIds: string[];
  review: ReviewCounts;
  /** The compiler's atomic-cohort contract: tiling, replacement, nesting. */
  atomicCohort: boolean;
  compiledIndexCurrent: boolean;
  acceptedRecords: number;
  resolvedExplicit: number;
  resolvedReviewedDiscourse: number;
  acceptedUnresolved: number;
};

export type DialogueCompletenessFacts = {
  dialogue: string;
  greekSource: boolean;
  greekProvenance: boolean;
  englishSource: boolean;
  englishProvenance: boolean;
  observations: { ledger: boolean; valid: boolean; scopeClosed: boolean; review: ReviewCounts };
  claims: { ledger: boolean; valid: boolean; scopeClosed: boolean; review: ReviewCounts };
  relations: RelationScopeCompletenessFacts;
  derived: Record<"stephanus" | "turns" | "tokens" | "anchors" | "turnLengths" | "assent" | "procedure" | "joins", boolean>;
  englishIndexCurrent: boolean;
  commentary: { ledger: boolean; accepted: boolean; auditAccepted: boolean; readingPage: boolean };
  audio: {
    exposed: boolean;
    exposedAccepted: boolean;
    attribution: boolean;
    screenplay: boolean;
    render: boolean;
    mastering: boolean;
    mechanicalQa: boolean;
    acceptance: boolean;
    recording: boolean;
    website: boolean;
  };
  reportedTurns: ReportedTurnCompletenessFacts;
  warnings: string[];
};

export type CompletenessFacts = {
  schemaVersion: 1;
  canonicalDialogues: readonly string[];
  discoveredGreek: string[];
  discoveredEnglish: string[];
  sourceManifestValid: boolean;
  comparisonValid: boolean;
  siteValid: boolean;
  siteEvidence: string;
  relationAudit: RelationAuditCompletenessFacts;
  dialogues: DialogueCompletenessFacts[];
  crossDialogueRelations: RelationScopeCompletenessFacts;
  /** Manifest-level scope problems that belong to no single dialogue. */
  reportedTurnScopeIssues: string[];
  apparatus: {
    infrastructureImplemented: boolean;
    state: "contract_pending";
    required: false;
    evidence: string[];
  };
};

export type CompletenessLeaf = {
  scope: string;
  state: CompletenessState;
  expected: string;
  observed: string;
  evidence: string[];
  remediation?: string;
};

export type CompletenessFamily = {
  id: CompletenessFamilyId;
  state: CompletenessState;
  requiredBy: CompletenessTarget[];
  leaves: CompletenessLeaf[];
};

export type CompletenessTargetResult = {
  target: CompletenessTarget;
  ready: boolean;
  requiredFamilies: CompletenessFamilyId[];
  blockers: CompletenessFamilyId[];
};

export type CompletenessReport = {
  schemaVersion: 1;
  artifactKind: "plato-edition-completeness";
  canonicalDialogues: readonly string[];
  families: CompletenessFamily[];
  targets: Record<CompletenessTarget, CompletenessTargetResult>;
  warnings: string[];
};

export type SiteCompletenessSummary = { valid: boolean; pages: string[]; evidence: string };

const SITE_CONTENT_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";

function generatedSiteFiles(root: string, directory = root): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Generated site must not contain symlinks: ${relative(root, path)}`);
      }
      if (entry.isDirectory()) return generatedSiteFiles(root, path);
      if (!entry.isFile()) throw new Error(`Generated site contains a non-regular entry: ${relative(root, path)}`);
      return [relative(root, path).split(sep).join("/")];
    })
    .sort((left, right) => left.localeCompare(right));
}

function generatedSiteManifestPages(siteDirectory: string) {
  const root = resolve(siteDirectory);
  if (!existsSync(root) || lstatSync(root).isSymbolicLink() || !statSync(root).isDirectory()) {
    throw new Error(`Generated site output must be a real directory: ${siteDirectory}`);
  }
  const manifestPath = join(root, "manifest.txt");
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() || !statSync(manifestPath).isFile()) {
    throw new Error(`Generated site output is missing a regular manifest.txt: ${siteDirectory}`);
  }
  const manifest = readFileSync(manifestPath, "utf8");
  if (manifest.length === 0 || !manifest.endsWith("\n")) {
    throw new Error("Generated site manifest.txt must be nonempty and newline-terminated");
  }

  const pages: string[] = [];
  const seen = new Set<string>();
  for (const [index, line] of manifest.slice(0, -1).split("\n").entries()) {
    const match = /^([^\t\r\n]+)\tsite\/([^\t\r\n]+)$/u.exec(line);
    if (!match || match[1] !== match[2]) {
      throw new Error(`Generated site manifest.txt line ${index + 1} must bind one path to the identical site/ path`);
    }
    const page = match[1]!;
    const absolute = resolve(root, page);
    const canonical = relative(root, absolute).split(sep).join("/");
    if (
      isAbsolute(page)
      || page.includes("\\")
      || canonical !== page
      || canonical === "manifest.txt"
      || canonical === ".."
      || canonical.startsWith("../")
      || seen.has(canonical)
    ) {
      throw new Error(`Generated site manifest.txt line ${index + 1} has an unsafe or duplicate path: ${page}`);
    }
    seen.add(canonical);
    pages.push(canonical);
  }

  const completePages = [...pages, "manifest.txt"];
  const actualFiles = generatedSiteFiles(root);
  const expectedFiles = [...completePages].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    const actual = new Set(actualFiles);
    const expected = new Set(expectedFiles);
    const missing = expectedFiles.filter((path) => !actual.has(path));
    const extra = actualFiles.filter((path) => !expected.has(path));
    throw new Error(
      `Generated site manifest.txt does not exactly inventory the output tree; missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}`,
    );
  }
  return completePages;
}

/**
 * Re-observe a static site built by an earlier isolated phase. This performs
 * the same generated-site and recording checks as `buildStaticSite`, while
 * requiring `manifest.txt` to be an exact, duplicate-free inventory. It never
 * trusts a caller-supplied boolean or page count.
 */
export function auditPrebuiltStaticSite(siteDirectory: string): SiteCompletenessSummary {
  const recordings = discoverSiteRecordings();
  validateSiteRecordingEvidence({
    recordings,
    artifactRoot: process.env.PLATO_RECORDING_ARTIFACT_ROOT,
    outDir: siteDirectory,
  });
  const validation = validateGeneratedSite(siteDirectory, {
    allowedExternalUrls: new Set([SITE_CONTENT_LICENSE_URL]),
    recordings: [...recordings.values()].map((recording) => ({
      dialogue: recording.dialogue,
      recordingId: recording.recordingId,
      audioSha256: recording.audioSha256,
      durationSeconds: recording.durationSeconds,
      status: recording.status,
      assetPath: recording.siteAssetPath,
      chapterTargets: recording.chapters.map((chapter) => chapter.commentary_id),
      chapterIds: recording.chapters.map((chapter) => chapter.chapter_id),
      chapterStartFrames: recording.chapters.map((chapter) => chapter.start_frame),
      chapterStartSeconds: recording.chapters.map((chapter) => chapter.start_frame / 48_000),
    })),
  });
  const pages = generatedSiteManifestPages(siteDirectory);
  return {
    valid:
      validation.brokenPaths === 0
      && validation.brokenFragments === 0
      && validation.duplicateIds === 0
      && validation.recordingHashMismatches === 0,
    pages,
    evidence: `${pages.length} pages; broken_paths=${validation.brokenPaths}; broken_fragments=${validation.brokenFragments}; duplicate_ids=${validation.duplicateIds}`,
  };
}

export function validateCanonicalDialogueSet(actual: readonly string[]) {
  const duplicates = actual.filter((value, index) => actual.indexOf(value) !== index);
  const unique = [...new Set(actual)].sort();
  const expected = [...CANONICAL_DIALOGUES];
  return {
    valid: duplicates.length === 0 && JSON.stringify(unique) === JSON.stringify(expected),
    missing: expected.filter((dialogue) => !unique.includes(dialogue)),
    extra: unique.filter((dialogue) => !expected.includes(dialogue as (typeof CANONICAL_DIALOGUES)[number])),
    duplicates: [...new Set(duplicates)].sort(),
  };
}

function withRepoRoot<T>(root: string, operation: () => T): T {
  if (root === getRepoRoot()) return operation();
  const restore = setRepoRootForTesting(root);
  try {
    return operation();
  } finally {
    restore();
  }
}

function file(path: string) {
  return existsSync(path) && readFileSync(path).byteLength > 0;
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function manifestValid(root: string) {
  const path = join(root, "raw/plato/MANIFEST.sha256");
  if (!file(path)) return false;
  return readFileSync(path, "utf8")
    .split(/\r?\n/u)
    .filter(Boolean)
    .every((line) => {
      const parsed = /^([a-f0-9]{64})\s+\*?(.+)$/u.exec(line);
      if (!parsed) return false;
      const target = join(root, parsed[2]!);
      return file(target) && sha256(readFileSync(target)) === parsed[1];
    });
}

function statuses(blocks: string[]): ReviewCounts {
  const counts: ReviewCounts = { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 };
  for (const block of blocks) {
    const status = fieldValue(block, "review_status") ?? "unreviewed";
    if (status === "accepted") counts.accepted += 1;
    else if (status === "rejected") counts.rejected += 1;
    else if (status === "needs_split") counts.needsSplit += 1;
    else counts.unreviewed += 1;
  }
  return counts;
}

export function voiceReviewCounts(content: string): ReviewCounts {
  return statuses(voiceYamlBlocks(content));
}

function terminal(counts: ReviewCounts) {
  return counts.unreviewed === 0 && counts.needsSplit === 0;
}

function blocksAt(root: string, path: string, parser: (content: string) => string[]) {
  const absolute = join(root, path);
  if (!file(absolute)) return [];
  try {
    return parser(readFileSync(absolute, "utf8"));
  } catch {
    return [];
  }
}

function ledgerValid(
  root: string,
  path: string,
  validator: (path: string, content: string) => readonly unknown[],
) {
  const absolute = join(root, path);
  if (!file(absolute)) return false;
  try {
    return validator(path, readFileSync(absolute, "utf8")).length === 0;
  } catch {
    return false;
  }
}

/**
 * `expected()` rebuilds and re-serialises a derived artifact so it can be
 * compared byte for byte — the token index for Laws alone is 15MB, and validate
 * does this for eight artifacts across 27 dialogues. The comparison is worth
 * keeping: it is what catches a builder whose output drifted from what is on
 * disk while the inputs stayed put. It just should not be repeated for inputs
 * that were already verified.
 *
 * An entry records "these exact artifact bytes were confirmed equal to what the
 * builder produces", keyed by the artifact's dependency digests AND a digest of
 * the harness source that builds it. Edit the artifact, its inputs, or the
 * builder, and the key changes and the full rebuild runs again.
 */
const VERIFICATION_CACHE_PATH = ".cache/derived-artifact-verification.json";

let harnessSourceDigest: string | undefined;
let verificationCache: Map<string, string> | undefined;
let verificationCacheRoot: string | undefined;
let verificationCacheDirty = false;

function digestOfHarnessSource() {
  if (harnessSourceDigest !== undefined) return harnessSourceDigest;
  const sourceRoot = join(getRepoRoot(), "packages/harness/src");
  const hash = createHash("sha256");
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.name.endsWith(".ts")) hash.update(entry.name).update(readFileSync(entryPath));
    }
  };
  try {
    walk(sourceRoot);
  } catch {
    // No harness source to bind (a test fixture root): fall back to a constant
    // that never matches a real repository's digest.
    return (harnessSourceDigest = "no-harness-source");
  }
  return (harnessSourceDigest = hash.digest("hex"));
}

function loadVerificationCache(root: string) {
  if (verificationCache && verificationCacheRoot === root) return verificationCache;
  verificationCacheRoot = root;
  verificationCacheDirty = false;
  try {
    const parsed: unknown = JSON.parse(readFileSync(join(root, VERIFICATION_CACHE_PATH), "utf8"));
    verificationCache = new Map(
      typeof parsed === "object" && parsed !== null
        ? Object.entries(parsed as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          )
        : [],
    );
  } catch {
    verificationCache = new Map();
  }
  return verificationCache;
}

function flushVerificationCache() {
  if (!verificationCacheDirty || !verificationCache || !verificationCacheRoot) return;
  try {
    const absolute = join(verificationCacheRoot, VERIFICATION_CACHE_PATH);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, `${JSON.stringify(Object.fromEntries(verificationCache), null, 0)}\n`, "utf8");
    verificationCacheDirty = false;
  } catch {
    // A read-only or missing tree just means no caching; never fail a report.
  }
}

process.on("exit", flushVerificationCache);

function currentArtifact(root: string, path: string, expected: () => string) {
  const absolute = join(root, path);
  try {
    if (!file(absolute)) return false;
    const actual = readFileSync(absolute, "utf8");
    const lines = actual.split(/\r?\n/u);
    let dependencyCount = 0;
    for (let index = 0; index < lines.length; index += 1) {
      const pathField = /^([a-z_]+)_path:\s+(.+)$/u.exec(lines[index] ?? "");
      if (!pathField) continue;
      const hashField = new RegExp(`^${pathField[1]}_sha256:\\s+([a-f0-9]{64})$`, "u").exec(lines[index + 1] ?? "");
      if (!hashField) continue;
      dependencyCount += 1;
      const dependency = join(root, pathField[2]!);
      if (!file(dependency) || sha256(readFileSync(dependency)) !== hashField[1]) return false;
    }
    // Canonical derived artifacts always bind at least one input. Missing
    // dependency headers are malformed and must not trigger an expensive build.
    if (dependencyCount === 0) return false;

    const cache = loadVerificationCache(root);
    // Dependency drift already returned false above, so the artifact's own bytes
    // plus the builder identity are the whole key.
    const key = `${path}|${digestOfHarnessSource()}`;
    const actualDigest = sha256(actual);
    if (cache.get(key) === actualDigest) return true;

    const current = actual === expected();
    if (current) {
      cache.set(key, actualDigest);
      verificationCacheDirty = true;
    }
    return current;
  } catch {
    return false;
  }
}

function currentJoinArtifact(root: string, dialogue: string) {
  const path = observationTurnJoinPath(dialogue);
  const absolute = join(root, path);
  const ledger = join(root, `wiki/observations/${dialogue}.md`);
  const turns = join(root, turnIndexPath(dialogue));
  if (!file(absolute) || !file(ledger) || !file(turns)) return false;
  const actual = readFileSync(absolute, "utf8");
  const recordedLedgerHash = /^ledger_sha256:\s+([a-f0-9]{64})$/mu.exec(actual)?.[1];
  const recordedTurnHash = /^turn_index_sha256:\s+([a-f0-9]{64})$/mu.exec(actual)?.[1];
  // Most stale joins can be rejected from their canonical dependency bindings
  // without paying the quadratic span/turn rebuild cost. If the bindings are
  // current, retain the stronger exact-byte comparison.
  if (recordedLedgerHash !== sha256(readFileSync(ledger)) || recordedTurnHash !== sha256(readFileSync(turns))) return false;
  try {
    return actual === formatObservationTurnJoinToon(buildObservationTurnJoin(dialogue));
  } catch {
    return false;
  }
}

function acceptedAttributions(root: string) {
  const path = join(root, "audio/speaker-attribution-acceptance.json");
  const accepted = new Set<string>();
  if (!file(path)) return accepted;
  try {
    const value = JSON.parse(readFileSync(path, "utf8")) as {
      dialogues?: Array<{ dialogue?: unknown; outputPath?: unknown; outputSha256?: unknown }>;
    };
    for (const entry of value.dialogues ?? []) {
      if (typeof entry.dialogue !== "string" || typeof entry.outputPath !== "string" || typeof entry.outputSha256 !== "string") continue;
      const output = join(root, entry.outputPath);
      if (file(output) && sha256(readFileSync(output)) === entry.outputSha256) accepted.add(entry.dialogue);
    }
  } catch {
    return accepted;
  }
  return accepted;
}

function audioFacts(coverage: DialogueAudioCoverage, attribution: boolean) {
  const exposed = coverage.website.hasAudioElement || coverage.website.hasAudioSource;
  const recording = coverage.recording.accepted;
  return {
    exposed,
    exposedAccepted: !exposed || (recording && coverage.website.linked),
    attribution,
    screenplay: coverage.screenplay.complete,
    // The existing production validator makes accepted QA/recording dependent on
    // completed render and mastering evidence. Keep the stages separate here even
    // though the older coverage API exposes them through those stronger receipts.
    render: coverage.qa.passed || recording,
    mastering: recording,
    mechanicalQa: coverage.qa.passed,
    acceptance: recording,
    recording,
    website: coverage.website.linked,
  };
}

function listSlugs(root: string, dir: string) {
  const path = join(root, dir);
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((name) => name.endsWith(".txt"))
    .map((name) => name.slice(0, -4))
    .sort();
}

type RelationAuditEvidence = RelationAuditCompletenessFacts & {
  auditedRecordIds: ReadonlySet<string>;
  auditedAcceptedEdgeIds: ReadonlySet<string>;
};

/**
 * Visit a JSONL file without retaining its complete text and split-line array.
 * The accepted ontology audit's adjudication partition is currently tens of
 * megabytes; `readFileSync(..., "utf8").split(...)` kept two complete copies
 * live immediately before the full package verifier parsed it again.
 */
function visitJsonlObjects(path: string, visit: (row: Record<string, unknown>) => void) {
  const descriptor = openSync(path, "r");
  const scratch = Buffer.allocUnsafe(1024 * 1024);
  let pending = Buffer.alloc(0);
  try {
    while (true) {
      const bytesRead = readSync(descriptor, scratch, 0, scratch.byteLength, null);
      if (bytesRead === 0) break;
      const chunk = pending.byteLength === 0
        ? scratch.subarray(0, bytesRead)
        : Buffer.concat([pending, scratch.subarray(0, bytesRead)]);
      let lineStart = 0;
      while (true) {
        const lineEnd = chunk.indexOf(0x0a, lineStart);
        if (lineEnd === -1) break;
        const end = lineEnd > lineStart && chunk[lineEnd - 1] === 0x0d ? lineEnd - 1 : lineEnd;
        if (end > lineStart) visit(JSON.parse(chunk.subarray(lineStart, end).toString("utf8")) as Record<string, unknown>);
        lineStart = lineEnd + 1;
      }
      pending = Buffer.from(chunk.subarray(lineStart));
    }
    if (pending.byteLength > 0) {
      const end = pending[pending.byteLength - 1] === 0x0d ? pending.byteLength - 1 : pending.byteLength;
      if (end > 0) visit(JSON.parse(pending.subarray(0, end).toString("utf8")) as Record<string, unknown>);
    }
  } finally {
    closeSync(descriptor);
  }
}

/**
 * Relation completeness is bound to the terminal semantic proof that precedes
 * deterministic regeneration and global release acceptance, not to the
 * shared-term candidate generator. Candidate generation remains a useful
 * discovery command, but its output is neither the canonical relation set nor
 * evidence that a relation is absent.
 */
function relationAuditEvidence(
  repoRoot: string,
  siteDirectory?: string,
  suppliedProof?: VerifiedOntologyClosureEvidenceProof,
): RelationAuditEvidence {
  const packages = listOntologyAuditPackagePaths(repoRoot);
  const packagePath = packages.length === 1 ? packages[0]! : null;
  const empty = {
    packagePath,
    semanticProofVerified: false,
    closureEvidenceValid: false,
    rejectedReaderLeaks: -1,
    acceptedRelationFictionIssues: -1,
    auditedRecordIds: new Set<string>(),
    auditedAcceptedEdgeIds: new Set<string>(),
  } satisfies RelationAuditEvidence;
  if (!packagePath) return empty;

  const absolutePackagePath = join(repoRoot, packagePath);
  if (!siteDirectory) return empty;
  let proof: VerifiedOntologyClosureEvidenceProof;
  try {
    proof = suppliedProof
      ? assertOntologyClosureEvidenceProof(suppliedProof, {
          repoRoot,
          packagePath: absolutePackagePath,
          siteDirectory,
        })
      : verifyOntologyClosureEvidenceFile({
          repoRoot,
          packagePath: absolutePackagePath,
          siteDirectory,
        });
  } catch {
    return empty;
  }
  const closureEvidenceValid = true;

  const auditedRecordIds = new Set<string>();
  const auditedAcceptedEdgeIds = new Set<string>();
  try {
    visitJsonlObjects(join(absolutePackagePath, "adjudications.jsonl"), (row) => {
      if (row.state !== "complete" || typeof row.target_key !== "string") return;
      if (row.target_key.startsWith("record:relation:")) {
        auditedRecordIds.add(row.target_key.slice("record:relation:".length));
      }
      if (
        row.target_key.startsWith("edge:relation:")
        && row.action !== "reject"
        && row.action !== "retire"
      ) {
        auditedAcceptedEdgeIds.add(row.target_key.slice("edge:relation:".length));
      }
    });
  } catch {
    return { ...empty, closureEvidenceValid };
  }

  const semanticProofVerified = verifyOntologyAuditSemanticPreacceptance({
    repoRoot,
    packagePath,
    siteDirectory,
    closureEvidenceProof: proof,
  }).length === 0;
  return {
    packagePath,
    semanticProofVerified,
    closureEvidenceValid,
    rejectedReaderLeaks: proof.evidence.rejectedReaderLeaks.length,
    acceptedRelationFictionIssues: proof.evidence.acceptedRelationFictionIssues.length,
    auditedRecordIds,
    auditedAcceptedEdgeIds,
  };
}

function relationScopeFacts({
  repoRoot,
  path,
  blocks,
  audit,
}: {
  repoRoot: string;
  path: string;
  blocks: readonly string[];
  audit: RelationAuditEvidence;
}): RelationScopeCompletenessFacts {
  const relationIds = blocks
    .map((block) => fieldValue(block, "relation_id"))
    .filter((value): value is string => value !== undefined);
  const acceptedIds = blocks
    .filter((block) => fieldValue(block, "review_status") === "accepted")
    .map((block) => fieldValue(block, "relation_id"))
    .filter((value): value is string => value !== undefined);
  return {
    ledger: file(join(repoRoot, path)),
    valid: ledgerValid(repoRoot, path, validateRelationLedger),
    records: relationIds.length,
    auditedRecords: relationIds.filter((id) => audit.auditedRecordIds.has(id)).length,
    acceptedEdges: acceptedIds.length,
    auditedAcceptedEdges: acceptedIds.filter((id) => audit.auditedAcceptedEdgeIds.has(id)).length,
    review: statuses([...blocks]),
  };
}

function safeSegmentScopeClosed(planner: () => Array<{ completed: boolean }>) {
  try {
    const segments = planner();
    return segments.length > 0 && segments.every((entry) => entry.completed);
  } catch {
    return false;
  }
}

/**
 * Collect one dialogue's reported-turn facts.
 *
 * Everything here reuses the lane's own parsers and validators rather than
 * reading the ledger a second way: `validateVoicesLedger` for validity,
 * `collectAcceptedProjectionFailures` for the atomic-cohort contract, and a
 * byte comparison against `formatVoiceIndexToon(buildVoiceIndex(…))` for the
 * compiled projection — which is the same forgery check the join relies on, and
 * therefore also re-runs the validator and the projection contract inside it.
 */
function reportedTurnFacts(
  root: string,
  dialogue: string,
  entry: ReportedTurnScopeEntry | undefined,
  scopeIssues: string[],
): ReportedTurnCompletenessFacts {
  const empty: ReportedTurnCompletenessFacts = {
    scope: entry ? entry.disposition : "unscoped",
    scopeIssues,
    manifestTurnIds: entry ? [...entry.outerTurnIds] : [],
    ledger: false,
    ledgerValid: false,
    representedTurnIds: [],
    review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 },
    atomicCohort: true,
    compiledIndexCurrent: false,
    acceptedRecords: 0,
    resolvedExplicit: 0,
    resolvedReviewedDiscourse: 0,
    acceptedUnresolved: 0,
  };

  const ledgerRelative = `wiki/voices/${dialogue}.md`;
  const ledgerAbsolute = join(root, ledgerRelative);
  if (!file(ledgerAbsolute)) return empty;

  const content = readFileSync(ledgerAbsolute, "utf8");
  let records: VoiceRecord[] = [];
  try {
    records = parseVoiceLedger(content);
  } catch {
    return { ...empty, ledger: true };
  }

  const accepted = records.filter((record) => record.reviewStatus === "accepted");
  const unresolvedAccepted = accepted.filter((record) => record.resolution === "unresolved");
  const turnIndexAbsolute = join(root, turnIndexPath(dialogue));
  let atomicCohort = false;
  if (file(turnIndexAbsolute)) {
    try {
      atomicCohort = collectAcceptedProjectionFailures(
        records,
        parseTurnIndexToon(readFileSync(turnIndexAbsolute, "utf8")),
        readFileSync(join(root, `raw/plato/greek/${dialogue}.txt`), "utf8"),
      ).length === 0;
    } catch {
      atomicCohort = false;
    }
  }

  return {
    ...empty,
    ledger: true,
    ledgerValid: ledgerValid(root, ledgerRelative, validateVoicesLedger),
    representedTurnIds: [...new Set(records.map((record) => record.outerTurnId))].sort(),
    review: voiceReviewCounts(content),
    atomicCohort,
    compiledIndexCurrent: currentVoiceIndex(root, dialogue),
    acceptedRecords: accepted.length,
    resolvedExplicit: accepted.filter((record) => record.resolution === "resolved" && !record.reviewedAttribution).length,
    resolvedReviewedDiscourse: accepted.filter((record) => record.resolution === "resolved" && record.reviewedAttribution !== undefined).length,
    acceptedUnresolved: unresolvedAccepted.length,
  };
}

/**
 * The stored compiled index must be present, nonempty, and byte-identical to
 * what the current ledger deterministically compiles to. Rebuilding is the only
 * check that catches a hand-edited row whose headers still hash correctly.
 */
function currentVoiceIndex(root: string, dialogue: string) {
  if (!file(join(root, voiceIndexPath(dialogue)))) return false;
  try {
    return readFileSync(join(root, voiceIndexPath(dialogue)), "utf8") === formatVoiceIndexToon(buildVoiceIndex(dialogue));
  } catch {
    return false;
  }
}

function comparisonArtifactsValid(root: string) {
  if (!existsSync(join(root, "wiki/clusters")) || !existsSync(join(root, "wiki/dossiers"))) return false;
  try {
    return validateClusterArtifacts().length === 0 && validateDossierArtifacts().length === 0;
  } catch {
    return false;
  }
}

export function buildCompletenessFacts({
  repoRoot = getRepoRoot(),
  site,
  siteDirectory,
  closureEvidenceProof,
  audioCoverage,
}: {
  repoRoot?: string;
  site?: SiteCompletenessSummary;
  siteDirectory?: string;
  closureEvidenceProof?: VerifiedOntologyClosureEvidenceProof;
  audioCoverage?: AudioCoverageReport;
} = {}): CompletenessFacts {
  return withRepoRoot(repoRoot, () => {
    const discoveredGreek = listGreekDialogues();
    const discoveredEnglish = listEnglishDialogues();
    const sourceNotesPath = join(repoRoot, "raw/plato/SOURCES.md");
    const sourceNotes = file(sourceNotesPath) ? readFileSync(sourceNotesPath, "utf8") : "";
    const relationAudit = relationAuditEvidence(repoRoot, siteDirectory, closureEvidenceProof);
    const scopes = readReportedTurnScopes({ repoRoot });
    const scopeEntries = new Map(scopes.entries.map((entry) => [entry.dialogue, entry]));
    const scopeIssuesByDialogue = new Map<string, string[]>();
    const globalScopeIssues: string[] = [];
    for (const issue of scopes.issues) {
      const formatted = formatReportedTurnScopeIssue(issue);
      if (issue.dialogue === undefined) globalScopeIssues.push(formatted);
      else scopeIssuesByDialogue.set(issue.dialogue, [...(scopeIssuesByDialogue.get(issue.dialogue) ?? []), formatted]);
    }
    const audioByDialogue = new Map((audioCoverage ?? buildAudioCoverageReport()).dialogues.map((entry) => [entry.dialogue, entry]));
    const attributions = acceptedAttributions(repoRoot);
    const sitePages = new Set(site?.pages ?? []);

    const dialogues = CANONICAL_DIALOGUES.map((dialogue): DialogueCompletenessFacts => {
      const observationPath = `wiki/observations/${dialogue}.md`;
      const claimPath = `wiki/claims/${dialogue}.md`;
      const relationPath = `wiki/relations/${dialogue}.md`;
      const commentaryPath = `wiki/commentary/${dialogue}.md`;
      const observationBlocks = blocksAt(repoRoot, observationPath, observationYamlBlocks);
      const claimBlocks = blocksAt(repoRoot, claimPath, claimYamlBlocks);
      const relationBlocks = blocksAt(repoRoot, relationPath, relationYamlBlocks);
      const observationReview = statuses(observationBlocks);
      const claimReview = statuses(claimBlocks);
      const audio = audioByDialogue.get(dialogue);
      const turns = currentArtifact(repoRoot, turnIndexPath(dialogue), () => formatTurnIndexToon(buildTurnIndex(dialogue)));
      const warnings: string[] = [];
      if (turns) {
        const turnText = readFileSync(join(repoRoot, turnIndexPath(dialogue)), "utf8");
        if (/\| \(none\)\s+\|/u.test(turnText)) warnings.push("current turn index contains explicit unattributed `(none)` turns");
      }
      const reportedTurns = reportedTurnFacts(repoRoot, dialogue, scopeEntries.get(dialogue), scopeIssuesByDialogue.get(dialogue) ?? []);
      return {
        dialogue,
        greekSource: file(join(repoRoot, `raw/plato/greek/${dialogue}.txt`)),
        greekProvenance: sourceNotes.includes(`| greek/${dialogue}.txt |`),
        englishSource: file(join(repoRoot, `raw/plato/english/${dialogue}.txt`)),
        englishProvenance: sourceNotes.includes(`| english/${dialogue}.txt |`),
        observations: {
          ledger: file(join(repoRoot, observationPath)),
          valid: ledgerValid(repoRoot, observationPath, validateObservationLedger),
          scopeClosed: safeSegmentScopeClosed(() => planSegmentedIngest(dialogue, 30_000)),
          review: observationReview,
        },
        claims: {
          ledger: file(join(repoRoot, claimPath)),
          valid: ledgerValid(repoRoot, claimPath, validateClaimLedger),
          scopeClosed: safeSegmentScopeClosed(() => planSegmentedClaims(dialogue, 30_000)),
          review: claimReview,
        },
        relations: relationScopeFacts({ repoRoot, path: relationPath, blocks: relationBlocks, audit: relationAudit }),
        derived: {
          stephanus: currentArtifact(repoRoot, stephanusIndexPath(dialogue), () => formatStephanusIndexToon(buildStephanusIndex(dialogue))),
          turns,
          tokens: currentArtifact(repoRoot, tokenIndexPath(dialogue), () => formatTokenIndexToon(buildTokenIndex(dialogue))),
          anchors: currentArtifact(repoRoot, anchorIndexPath(dialogue), () => formatAnchorIndexToon(buildAnchorIndex(dialogue))),
          turnLengths: currentArtifact(repoRoot, turnLengthMetricsPath(dialogue), () => formatTurnLengthMetricsToon(buildTurnLengthMetrics(dialogue))),
          assent: currentArtifact(repoRoot, assentMetricsPath(dialogue), () => formatAssentMetricsToon(buildAssentMetrics(dialogue))),
          procedure: currentArtifact(repoRoot, procedureMetricsPath(dialogue), () => formatProcedureMetricsToon(buildProcedureMetrics(dialogue))),
          joins: currentJoinArtifact(repoRoot, dialogue),
        },
        englishIndexCurrent: currentArtifact(repoRoot, englishStephanusIndexPath(dialogue), () => formatStephanusIndexToon(buildEnglishStephanusIndex(dialogue))),
        commentary: {
          ledger: file(join(repoRoot, commentaryPath)),
          accepted: audio?.commentary.accepted ?? false,
          auditAccepted: audio?.qualityAudit.passed ?? false,
          readingPage: sitePages.has(`dialogues/${dialogue}/reading.html`),
        },
        audio: audio
          ? audioFacts(audio, attributions.has(dialogue))
          : {
              exposed: false,
              exposedAccepted: true,
              attribution: false,
              screenplay: false,
              render: false,
              mastering: false,
              mechanicalQa: false,
              acceptance: false,
              recording: false,
              website: false,
            },
        reportedTurns,
        warnings,
      };
    });

    const crossRelationPath = "wiki/relations/cross-dialogue.md";
    const crossRelationBlocks = blocksAt(repoRoot, crossRelationPath, relationYamlBlocks);
    return {
      schemaVersion: 1,
      canonicalDialogues: CANONICAL_DIALOGUES,
      discoveredGreek,
      discoveredEnglish,
      sourceManifestValid: manifestValid(repoRoot),
      comparisonValid: comparisonArtifactsValid(repoRoot),
      siteValid: site?.valid ?? false,
      siteEvidence: site?.evidence ?? "site validation summary was not supplied",
      relationAudit: {
        packagePath: relationAudit.packagePath,
        semanticProofVerified: relationAudit.semanticProofVerified,
        closureEvidenceValid: relationAudit.closureEvidenceValid,
        rejectedReaderLeaks: relationAudit.rejectedReaderLeaks,
        acceptedRelationFictionIssues: relationAudit.acceptedRelationFictionIssues,
      },
      dialogues,
      crossDialogueRelations: relationScopeFacts({
        repoRoot,
        path: crossRelationPath,
        blocks: crossRelationBlocks,
        audit: relationAudit,
      }),
      reportedTurnScopeIssues: globalScopeIssues,
      apparatus: {
        infrastructureImplemented:
          file(join(repoRoot, "docs/apparatus-protocol.md")) &&
          file(join(repoRoot, "packages/harness/src/wiki/apparatus-validator.ts")),
        state: "contract_pending",
        required: false,
        evidence: ["docs/apparatus-protocol.md", "packages/harness/src/wiki/apparatus-validator.ts"],
      },
    };
  });
}

function requiredBy(id: CompletenessFamilyId) {
  return (Object.keys(COMPLETENESS_TARGETS) as CompletenessTarget[]).filter((target) =>
    COMPLETENESS_TARGETS[target].includes(id),
  );
}

function leaf(dialogue: string, passed: boolean, expected: string, observed: string, evidence: string[], remediation: string): CompletenessLeaf {
  return { scope: dialogue, state: passed ? "pass" : "fail", expected, observed, evidence, ...(passed ? {} : { remediation }) };
}

function canonicalRelationLeaf(
  scope: string,
  relation: RelationScopeCompletenessFacts,
  path: string,
  auditVerified: boolean,
): CompletenessLeaf {
  if (relation.records === 0) {
    const evidencedZero = auditVerified && !relation.ledger && relation.auditedRecords === 0;
    if (evidencedZero) {
      return {
        scope,
        state: "not_applicable",
        expected: "the verified vNext audit contains no canonical relation record for this scope",
        observed: "0 canonical records; no relation ledger",
        evidence: [path, "verified snapshot-bound ontology audit"],
      };
    }
    return leaf(
      scope,
      false,
      "a verified audited zero or a nonempty strict canonical relation ledger",
      `audit_verified=${auditVerified}; ledger=${relation.ledger}; valid=${relation.valid}; records=0`,
      [path, "verified snapshot-bound ontology audit"],
      "repair the canonical ledger or its snapshot-bound relation adjudication evidence",
    );
  }

  return leaf(
    scope,
    auditVerified
      && relation.ledger
      && relation.valid
      && terminal(relation.review)
      && relation.auditedRecords === relation.records
      && relation.auditedAcceptedEdges === relation.acceptedEdges,
    "a valid terminal relation ledger whose records and accepted semantic edges are bound by the verified vNext audit",
    [
      `audit_verified=${auditVerified}`,
      `ledger=${relation.ledger}`,
      `valid=${relation.valid}`,
      `records=${relation.auditedRecords}/${relation.records} audited`,
      `accepted_edges=${relation.auditedAcceptedEdges}/${relation.acceptedEdges} audited`,
      `unreviewed=${relation.review.unreviewed}`,
      `needs_split=${relation.review.needsSplit}`,
    ].join("; "),
    [path, "verified snapshot-bound ontology audit"],
    "repair the canonical relation ledger and its item-level audit adjudications without inferring from discovery candidates",
  );
}

function sameTurnSet(actual: readonly string[], expected: readonly string[]) {
  const left = [...new Set(actual)].sort();
  const right = [...new Set(expected)].sort();
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * One dialogue's `CMP-REPORTED-TURNS` leaf.
 *
 * Three states, and the middle one is the point: a `none` disposition with a
 * current receipt is `not_applicable` on explicit exhausted-scope evidence,
 * while a dialogue nobody censused is `fail`. Absence of a ledger never means
 * "nothing to find" here.
 *
 * Claim joins, cutover activation, and audio attribution are deliberately
 * absent from every condition below.
 */
function reportedTurnLeaf(entry: DialogueCompletenessFacts): CompletenessLeaf {
  const facts = entry.reportedTurns;
  const evidence = [reportedTurnScopesPath(), `wiki/voices/${entry.dialogue}.md`, `derived/plato/voices/${entry.dialogue}.toon`];

  if (facts.scope === "unscoped" || facts.scopeIssues.length > 0) {
    return leaf(
      entry.dialogue,
      false,
      "a current, valid scope entry and review receipt",
      facts.scope === "unscoped" && facts.scopeIssues.length === 0
        ? "no reviewed scope entry; absence of a ledger is not evidence of zero nested reported turns"
        : facts.scopeIssues.join("; "),
      evidence,
      `census the Greek source and record a reviewed disposition in ${reportedTurnScopesPath()}`,
    );
  }

  if (facts.scope === "none") {
    return {
      scope: entry.dialogue,
      state: "not_applicable",
      expected: "an exhausted Greek census finding no nested reported turn",
      observed: "reviewed none disposition with a current receipt",
      evidence: [reportedTurnScopesPath()],
    };
  }

  const cohortMatches = sameTurnSet(facts.representedTurnIds, facts.manifestTurnIds);
  const passed =
    facts.ledger &&
    facts.ledgerValid &&
    cohortMatches &&
    terminal(facts.review) &&
    facts.atomicCohort &&
    facts.compiledIndexCurrent &&
    facts.acceptedRecords > 0;

  // Name the turns, but do not paste 52 identifiers into a tracked report: the
  // manifest is the authority for the full cohort, and this line is a pointer.
  const sample = (turnIds: string[]) =>
    turnIds.length <= 5 ? turnIds.join(", ") : `${turnIds.slice(0, 5).join(", ")}, +${turnIds.length - 5} more`;
  const missingTurns = facts.manifestTurnIds.filter((turnId) => !facts.representedTurnIds.includes(turnId));
  const extraTurns = facts.representedTurnIds.filter((turnId) => !facts.manifestTurnIds.includes(turnId));
  return leaf(
    entry.dialogue,
    passed,
    `an accepted atomic cohort for all ${facts.manifestTurnIds.length} required outer turn(s) with a current compiled index`,
    [
      `ledger=${facts.ledger}`,
      `valid=${facts.ledgerValid}`,
      `cohorts=${facts.representedTurnIds.length}/${facts.manifestTurnIds.length}`,
      ...(missingTurns.length > 0 ? [`missing: ${sample(missingTurns)}`] : []),
      ...(extraTurns.length > 0 ? [`extra: ${sample(extraTurns)}`] : []),
      `unreviewed=${facts.review.unreviewed}`,
      `needs_split=${facts.review.needsSplit}`,
      `atomic=${facts.atomicCohort}`,
      `compiled_index=${facts.compiledIndexCurrent}`,
      `accepted=${facts.acceptedRecords}`,
      `unresolved=${facts.acceptedUnresolved}`,
    ].join("; "),
    evidence,
    "extract, review, and accept every required outer-turn cohort, then compile the standalone index",
  );
}

function family(id: CompletenessFamilyId, leaves: CompletenessLeaf[], state?: CompletenessState): CompletenessFamily {
  const aggregate = state ?? (leaves.every((entry) => entry.state === "pass" || (entry.state === "not_applicable" && entry.evidence.length > 0)) ? "pass" : "fail");
  if (requiredBy(id).length > 0 && aggregate !== "pass" && aggregate !== "fail") {
    throw new Error(`Required completeness family ${id} cannot aggregate to ${aggregate}`);
  }
  return { id, state: aggregate, requiredBy: requiredBy(id), leaves };
}

export function buildCompletenessReport(facts: CompletenessFacts): CompletenessReport {
  const exactGreek = validateCanonicalDialogueSet(facts.discoveredGreek);
  const exactEnglish = validateCanonicalDialogueSet(facts.discoveredEnglish);
  const perDialogue = facts.dialogues;
  const families: CompletenessFamily[] = [
    family("CMP-SOURCE", [
      leaf("global", exactGreek.valid && facts.sourceManifestValid, "exact 27 Greek sources and valid manifest", `${facts.discoveredGreek.length} sources; manifest=${facts.sourceManifestValid}`, ["raw/plato/greek", "raw/plato/MANIFEST.sha256"], "restore the fixed source set and regenerate the manifest"),
      ...perDialogue.map((entry) => leaf(entry.dialogue, entry.greekSource && entry.greekProvenance, "source and provenance row", `source=${entry.greekSource}; provenance=${entry.greekProvenance}`, [`raw/plato/greek/${entry.dialogue}.txt`, "raw/plato/SOURCES.md"], "restore source/provenance")),
    ]),
    family("CMP-OBSERVATIONS", perDialogue.map((entry) => leaf(entry.dialogue, entry.observations.ledger && entry.observations.valid && entry.observations.scopeClosed && terminal(entry.observations.review), "valid ledger, exhausted 30k segments, terminal review", `ledger=${entry.observations.ledger}; valid=${entry.observations.valid}; scope=${entry.observations.scopeClosed}; unreviewed=${entry.observations.review.unreviewed}; needs_split=${entry.observations.review.needsSplit}`, [`wiki/observations/${entry.dialogue}.md`, "wiki/observations/segment-coverage.jsonl"], "repair the ledger, close scope, and terminally review every record"))),
    family("CMP-CLAIMS", perDialogue.map((entry) => leaf(entry.dialogue, entry.claims.ledger && entry.claims.valid && entry.claims.scopeClosed && terminal(entry.claims.review), "valid ledger, exhausted 30k segments, terminal review", `ledger=${entry.claims.ledger}; valid=${entry.claims.valid}; scope=${entry.claims.scopeClosed}; unreviewed=${entry.claims.review.unreviewed}; needs_split=${entry.claims.review.needsSplit}`, [`wiki/claims/${entry.dialogue}.md`, "wiki/claims/segment-coverage.jsonl"], "repair the ledger, close scope, and terminally review every claim"))),
    family("CMP-RELATIONS", [
      leaf(
        "global",
        facts.relationAudit.semanticProofVerified
          && facts.relationAudit.closureEvidenceValid
          && facts.relationAudit.rejectedReaderLeaks === 0
          && facts.relationAudit.acceptedRelationFictionIssues === 0,
        "one verified preacceptance semantic proof with zero rejected-reader leaks and zero accepted relation fictions",
        [
          `package=${facts.relationAudit.packagePath ?? "missing"}`,
          `semantic_proof_verified=${facts.relationAudit.semanticProofVerified}`,
          `closure_evidence=${facts.relationAudit.closureEvidenceValid}`,
          `rejected_reader_leaks=${facts.relationAudit.rejectedReaderLeaks}`,
          `accepted_relation_fictions=${facts.relationAudit.acceptedRelationFictionIssues}`,
        ].join("; "),
        [facts.relationAudit.packagePath ?? "wiki/ontology-audits", "docs/ontology-vnext.md"],
        "repair and re-close the snapshot-bound vNext audit; do not manufacture relation decisions from discovery candidates",
      ),
      ...perDialogue.map((entry) => canonicalRelationLeaf(
        entry.dialogue,
        entry.relations,
        `wiki/relations/${entry.dialogue}.md`,
        facts.relationAudit.semanticProofVerified,
      )),
      canonicalRelationLeaf(
        "cross-dialogue",
        facts.crossDialogueRelations,
        "wiki/relations/cross-dialogue.md",
        facts.relationAudit.semanticProofVerified,
      ),
    ]),
    family("CMP-DERIVED", perDialogue.map((entry) => {
      const stale = Object.entries(entry.derived).filter(([, current]) => !current).map(([name]) => name);
      return leaf(entry.dialogue, stale.length === 0, "all eight deterministic artifact families byte-current", stale.length === 0 ? "8/8 current" : `stale/missing: ${stale.join(", ")}`, ["derived/plato"], "regenerate deterministic artifacts");
    })),
    family("CMP-REPORTED-TURNS", (() => {
      const leaves = perDialogue.map((entry) => reportedTurnLeaf(entry));
      const required = perDialogue.filter((entry) => entry.reportedTurns.scope === "required");
      const none = perDialogue.filter((entry) => entry.reportedTurns.scope === "none");
      const blocking = perDialogue
        .filter((entry) => leaves.find((candidate) => candidate.scope === entry.dialogue)!.state === "fail")
        .map((entry) => entry.dialogue);
      const total = (pick: (value: ReportedTurnCompletenessFacts) => number) =>
        perDialogue.reduce((sum, entry) => sum + pick(entry.reportedTurns), 0);
      // Counts, never a percentage, and accepted ambiguity is reported as its
      // own number rather than folded in with missing data.
      const observed = [
        `required=${required.length}`,
        `none=${none.length}`,
        `cohorts=${required.reduce((sum, entry) => sum + entry.reportedTurns.manifestTurnIds.length, 0)}`,
        `accepted=${total((value) => value.acceptedRecords)}`,
        `explicit=${total((value) => value.resolvedExplicit)}`,
        `reviewed_discourse=${total((value) => value.resolvedReviewedDiscourse)}`,
        `unresolved=${total((value) => value.acceptedUnresolved)}`,
        `blocked: ${blocking.length > 0 ? blocking.join(", ") : "none"}`,
      ].join("; ");
      return [
        leaf(
          "global",
          facts.reportedTurnScopeIssues.length === 0 && required.length + none.length === CANONICAL_DIALOGUES.length,
          `a valid scope manifest covering all ${CANONICAL_DIALOGUES.length} canonical dialogues`,
          facts.reportedTurnScopeIssues.length > 0 ? `${observed}; ${facts.reportedTurnScopeIssues.join("; ")}` : observed,
          [reportedTurnScopesPath(), "wiki/review"],
          `repair ${reportedTurnScopesPath()} so every canonical dialogue carries one current disposition and receipt`,
        ),
        ...leaves,
      ];
    })()),
    family("CMP-COMPARISON", [leaf("global", facts.comparisonValid, "clusters and dossiers validate", `valid=${facts.comparisonValid}`, ["wiki/clusters", "wiki/dossiers"], "regenerate comparison artifacts")]),
    family("CMP-SITE", [leaf("global", facts.siteValid, "generated site passes validators", facts.siteEvidence, ["temporary generated site"], "fix site validation failures")]),
    family("CMP-ENGLISH", [
      leaf("global", exactEnglish.valid, "exact 27 English sources", `${facts.discoveredEnglish.length} sources`, ["raw/plato/english"], "restore the fixed English source set"),
      ...perDialogue.map((entry) => leaf(entry.dialogue, entry.englishSource && entry.englishProvenance && entry.englishIndexCurrent, "source, provenance, current English index", `source=${entry.englishSource}; provenance=${entry.englishProvenance}; index=${entry.englishIndexCurrent}`, [`raw/plato/english/${entry.dialogue}.txt`, `derived/plato/stephanus-english/${entry.dialogue}.toon`], "restore the English spine and regenerate its index")),
    ]),
    family("CMP-READINGS", perDialogue.map((entry) => leaf(entry.dialogue, entry.commentary.ledger && entry.commentary.accepted && entry.commentary.readingPage, "accepted complete ledger and reading page", `ledger=${entry.commentary.ledger}; accepted=${entry.commentary.accepted}; page=${entry.commentary.readingPage}`, [`wiki/commentary/${entry.dialogue}.md`, `dialogues/${entry.dialogue}/reading.html`], "finish and accept the guided reading"))),
    family("CMP-WRITING-AUDIT", perDialogue.map((entry) => leaf(entry.dialogue, entry.commentary.auditAccepted, "current operator-delegated Luna-accepted quality audit", `accepted=${entry.commentary.auditAccepted}`, [`wiki/commentary-audits/${entry.dialogue}.json`], "complete and accept the writing audit"))),
    family("CMP-AUDIO-TRUTH", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.exposedAccepted, "no exposed draft audio", entry.audio.exposed ? `exposed; accepted=${entry.audio.exposedAccepted}` : "no audio exposed", ["wiki/recordings", "generated site"], "remove draft exposure or complete production acceptance"))),
    family("CMP-AUDIO-ATTRIBUTION", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.attribution, "accepted attribution", `accepted=${entry.audio.attribution}`, ["audio/speaker-attribution-acceptance.json"], "accept the current attribution plan"))),
    family("CMP-AUDIO-SCREENPLAY", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.screenplay, "production screenplay", `complete=${entry.audio.screenplay}`, [`audio/scripts/${entry.dialogue}.json`], "produce a valid screenplay"))),
    family("CMP-AUDIO-RENDER", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.render, "complete render evidence", `complete=${entry.audio.render}`, ["audio production evidence"], "complete the render"))),
    family("CMP-AUDIO-MASTERING", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.mastering, "complete mastering evidence", `complete=${entry.audio.mastering}`, ["audio production evidence"], "complete mastering"))),
    family("CMP-AUDIO-MECHANICAL-QA", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.mechanicalQa, "mechanical/ASR QA passed", `passed=${entry.audio.mechanicalQa}`, [`audio/qa/${entry.dialogue}.json`], "pass mechanical and ASR QA"))),
    family("CMP-AUDIO-ACCEPTANCE", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.acceptance, "explicit listening/production acceptance", `accepted=${entry.audio.acceptance}`, [`wiki/recordings/${entry.dialogue}.json`], "record final production acceptance"))),
    family("CMP-AUDIO-RECORDING", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.recording, "accepted manifest and publication MP3", `accepted=${entry.audio.recording}`, [`wiki/recordings/${entry.dialogue}.json`], "materialize and accept the publication recording"))),
    family("CMP-AUDIO-WEBSITE", perDialogue.map((entry) => leaf(entry.dialogue, entry.audio.website, "validated player, chapters, hashes, and links", `linked=${entry.audio.website}`, ["generated site"], "publish the accepted recording on the site"))),
    family("CMP-APPARATUS", [{ scope: "global", state: "contract_pending", expected: "ratified candidate universe and zero-result semantics", observed: `infrastructure=${facts.apparatus.infrastructureImplemented}; production contract pending`, evidence: facts.apparatus.evidence }], "contract_pending"),
  ];

  const byId = new Map(families.map((entry) => [entry.id, entry]));
  const targets = Object.fromEntries((Object.keys(COMPLETENESS_TARGETS) as CompletenessTarget[]).map((target) => {
    const requiredFamilies = [...COMPLETENESS_TARGETS[target]];
    const blockers = requiredFamilies.filter((id) => byId.get(id)?.state !== "pass");
    return [target, { target, ready: blockers.length === 0, requiredFamilies, blockers } satisfies CompletenessTargetResult];
  })) as Record<CompletenessTarget, CompletenessTargetResult>;
  return {
    schemaVersion: 1,
    artifactKind: "plato-edition-completeness",
    canonicalDialogues: CANONICAL_DIALOGUES,
    families,
    targets,
    warnings: perDialogue
      .flatMap((entry) => [
        ...entry.warnings,
        // Genuine ambiguity is a result, not missing data. It passes the family
        // and is reported as its own count, so the matrix never reads as if the
        // text had been fully resolved.
        ...(entry.reportedTurns.acceptedUnresolved > 0
          ? [`${entry.reportedTurns.acceptedUnresolved} accepted reported-turn record(s) record genuine ambiguity`]
          : []),
      ].map((warning) => `${entry.dialogue}: ${warning}`))
      .sort(),
  };
}

function stateMark(state: CompletenessState) {
  return state === "pass" ? "pass" : state === "fail" ? "FAIL" : state === "not_applicable" ? "n/a" : "contract pending";
}

export function renderCompletenessReport(report: CompletenessReport) {
  const families = new Map(report.families.map((entry) => [entry.id, entry]));
  const familyRows = report.families.map((entry) => `| ${entry.id} | ${stateMark(entry.state)} | ${entry.requiredBy.join(", ") || "none"} | ${entry.leaves.filter((leaf) => leaf.state === "pass" || leaf.state === "not_applicable").length}/${entry.leaves.length} |`);
  const dialogueRows = CANONICAL_DIALOGUES.map((dialogue) => {
    const cell = (id: CompletenessFamilyId) => stateMark(families.get(id)!.leaves.find((entry) => entry.scope === dialogue)?.state ?? "fail");
    return `| ${dialogue} | ${cell("CMP-SOURCE")} | ${cell("CMP-OBSERVATIONS")} | ${cell("CMP-CLAIMS")} | ${cell("CMP-RELATIONS")} | ${cell("CMP-DERIVED")} | ${cell("CMP-REPORTED-TURNS")} | ${cell("CMP-ENGLISH")} | ${cell("CMP-READINGS")} | ${cell("CMP-WRITING-AUDIT")} | ${cell("CMP-AUDIO-RECORDING")} |`;
  });
  const reportedTurns = families.get("CMP-REPORTED-TURNS")!.leaves.find((entry) => entry.scope === "global")!;
  const blockers = report.families.flatMap((entry) => entry.leaves.filter((leaf) => leaf.state === "fail").map((leaf) => `- **${entry.id} / ${leaf.scope}**: ${leaf.observed}. ${leaf.remediation ?? ""}`));
  return [
    "# Edition Completeness",
    "",
    "Generated by `bun run completeness -- --target knowledge-base --write`. The signed target contract controls meaning; this report controls current status.",
    "",
    "Completeness is conjunctive. There is deliberately no aggregate percentage.",
    "",
    "## Targets",
    "",
    ...(["corpus", "knowledge-base", "audio-edition"] as CompletenessTarget[]).map((target) => `- **${target}**: ${report.targets[target].ready ? "READY" : "INCOMPLETE"}${report.targets[target].blockers.length ? ` — ${report.targets[target].blockers.join(", ")}` : ""}`),
    "",
    "## Family summary",
    "",
    "| family | state | required by | closed leaves |",
    "| --- | --- | --- | ---: |",
    ...familyRows,
    "",
    "## Dialogue matrix",
    "",
    "| dialogue | source | observations | claims | relations | derived | reported turns | English | reading | audit | recording |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...dialogueRows,
    "",
    "## Reported turns",
    "",
    "Nested reported turns are counted as standalone structural data. Claim joins, `derived/plato/voices/cutovers.toml` membership, and audio attribution are deliberately irrelevant to this family; accepted genuine ambiguity passes and is counted, never treated as missing data.",
    "",
    `- ${reportedTurns.observed}`,
    "",
    "## Apparatus",
    "",
    "Capability implemented; content scope `contract_pending`; required by current targets: false. See `docs/apparatus-protocol.md`.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers : ["- none"]),
    "",
    "## Quality warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- none"]),
    "",
    "Detailed production diagnostics remain in `audio/coverage.md`.",
    "",
  ].join("\n");
}

function atomicWrite(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content, "utf8");
  renameSync(temporary, path);
}

export function writeCompletenessReport(report: CompletenessReport, path = "wiki/completeness.md") {
  const absolute = join(getRepoRoot(), path);
  atomicWrite(absolute, renderCompletenessReport(report));
  return { path: relative(getRepoRoot(), absolute), report };
}

export type CompletenessAuditOptions = {
  audioCoverage?: AudioCoverageReport;
  /** Existing output from a separately isolated `buildStaticSite` phase. */
  siteDirectory?: string;
  /** Exact durable closure evidence already verified against `siteDirectory`. */
  closureEvidenceProof?: VerifiedOntologyClosureEvidenceProof;
};

export function auditCompletenessFacts({
  audioCoverage,
  siteDirectory,
  closureEvidenceProof,
}: CompletenessAuditOptions = {}): CompletenessFacts {
  const root = getRepoRoot();
  if (closureEvidenceProof && siteDirectory === undefined) {
    throw new Error("A verified closure-evidence proof requires its exact prebuilt site directory.");
  }
  if (siteDirectory !== undefined) {
    return buildCompletenessFacts({
      repoRoot: root,
      ...(audioCoverage ? { audioCoverage } : {}),
      siteDirectory,
      ...(closureEvidenceProof ? { closureEvidenceProof } : {}),
      site: auditPrebuiltStaticSite(siteDirectory),
    });
  }
  const outDir = mkdtempSync(join(ensureCanonicalOntologyWorkRoot(root), "plato-completeness-site-"));
  try {
    const built = buildStaticSite({ outDir });
    return buildCompletenessFacts({
      repoRoot: root,
      ...(audioCoverage ? { audioCoverage } : {}),
      siteDirectory: outDir,
      site: {
        valid: built.validation.brokenPaths === 0 && built.validation.brokenFragments === 0 && built.validation.duplicateIds === 0 && built.validation.recordingHashMismatches === 0,
        pages: built.pages,
        evidence: `${built.pages.length} pages; broken_paths=${built.validation.brokenPaths}; broken_fragments=${built.validation.brokenFragments}; duplicate_ids=${built.validation.duplicateIds}`,
      },
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

export function validateCompletenessReport(
  path = "wiki/completeness.md",
  report?: CompletenessReport,
  auditOptions: CompletenessAuditOptions = {},
) {
  const absolute = join(getRepoRoot(), path);
  if (!file(absolute)) return [{ path, message: "Completeness report is missing or empty." }];
  const expected = renderCompletenessReport(report ?? buildCompletenessReport(auditCompletenessFacts(auditOptions)));
  return readFileSync(absolute, "utf8") === expected
    ? []
    : [{ path, message: "Completeness report is stale; regenerate it with `bun run completeness -- --target knowledge-base --write`." }];
}

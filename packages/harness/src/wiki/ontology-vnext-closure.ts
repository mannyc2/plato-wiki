import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateAudioCoverageReport, writeAudioCoverageReport } from "../audio-coverage.js";
import { writeClusterArtifacts, validateClusterArtifacts } from "../clusters.js";
import {
  auditCompletenessFacts,
  buildCompletenessReport,
  validateCompletenessReport,
  writeCompletenessReport,
} from "../completeness.js";
import { writeDossierArtifacts, validateDossierArtifacts } from "../dossiers.js";
import { writeObservationTurnJoins } from "../derived/joins.js";
import { writeVoiceJoins } from "../derived/voice-joins.js";
import { writeVoiceIndexes } from "../derived/voices.js";
import { getRepoRoot } from "../paths.js";
import { buildStaticSite } from "../site/index.js";
import {
  formatOntologyAuditIssues,
  listOntologyAuditPackagePaths,
  verifyOntologyAuditSemanticPreacceptance,
} from "./ontology-audit.js";
import {
  acceptOntologyAuditClosure,
  beginOntologyAuditFinalizationTransition,
  bindOntologyAuditFinalState,
} from "./ontology-audit-finalization.js";
import { readOntologyAuditFinalAdjustments } from "./ontology-audit-final-adjustments.js";
import {
  assertCanonicalOntologyRegenerationWorkerPaths,
  createCanonicalOntologyRegenerationWorkspace,
  ensureCanonicalOntologyWorkRoot,
  resolveCanonicalOntologyAuditPackage,
  resolveCanonicalOntologyRepoFileWriteTarget,
} from "./ontology-audit-package-path.js";
import {
  assertOntologyClosureEvidenceIsZero,
  recomputeOntologyClosureEvidence,
  verifyOntologyClosureEvidenceFile,
  type OntologyClosureEvidence,
  type VerifiedOntologyClosureEvidenceProof,
} from "./ontology-closure-evidence.js";
import {
  assertOntologyRegenerationFixedWriteTargets,
  cleanOntologyGeneratedProjectionRoots,
  collectOntologyRegenerationArtifacts,
  ontologyRegenerationArtifactsEqual,
  ontologyRegenerationDigest,
  type OntologyRegenerationArtifact,
} from "./ontology-regeneration-tree.js";

export {
  assertOntologyClosureEvidenceIsZero,
  assertOntologyClosureEvidenceProof,
  collectAcceptedRelationFictionIssues,
  forbiddenOntologyAliasPaths,
  ontologyReaderProjectionPaths,
  recomputeOntologyClosureEvidence,
  rejectedRecordIdsInReaderFiles,
  renderOntologyClosureEvidence,
  verifyOntologyClosureEvidenceFile,
  type OntologyClosureEvidence,
  type VerifiedOntologyClosureEvidenceProof,
} from "./ontology-closure-evidence.js";

export {
  assertOntologyRegenerationFixedWriteTargets,
  cleanOntologyGeneratedProjectionRoots,
  collectOntologyCanonicalRegenerationArtifacts,
  collectOntologyRegenerationArtifacts,
  ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES,
  ontologyRegenerationArtifact,
  ontologyRegenerationArtifactsEqual,
  ontologyRegenerationDigest,
  type OntologyRegenerationArtifact,
} from "./ontology-regeneration-tree.js";

export type OntologyRegenerationRun = {
  artifacts: OntologyRegenerationArtifact[];
  digest: string;
  closure_evidence: OntologyRegenerationArtifact;
};

export function ontologyRegenerationRunsEqual(
  first: OntologyRegenerationRun,
  second: OntologyRegenerationRun,
) {
  return first.digest === second.digest
    && ontologyRegenerationArtifactsEqual(first.artifacts, second.artifacts)
    && ontologyRegenerationArtifactsEqual([first.closure_evidence], [second.closure_evidence]);
}

export function ontologyRegenerationBindsClosureEvidenceSite(
  artifacts: readonly OntologyRegenerationArtifact[],
  siteArtifacts: readonly OntologyRegenerationArtifact[],
) {
  return ontologyRegenerationArtifactsEqual(
    artifacts.filter((entry) => entry.path.startsWith("site/")),
    siteArtifacts.map((entry) => ({ ...entry, path: `site/${entry.path}` })),
  );
}

type OntologyRegenerationWorkerManifest = OntologyRegenerationRun & {
  schema_version: 1;
  artifact_count: number;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function atomicWriteFile(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`;
  try {
    writeFileSync(temporary, content, { encoding: "utf8", flag: "wx" });
    const temporaryDescriptor = openSync(temporary, "r");
    try {
      fsyncSync(temporaryDescriptor);
    } finally {
      closeSync(temporaryDescriptor);
    }
    renameSync(temporary, path);
    const parentDescriptor = openSync(dirname(path), "r");
    try {
      fsyncSync(parentDescriptor);
    } finally {
      closeSync(parentDescriptor);
    }
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

function resolveOntologyAuditPackage(repoRoot: string, packagePath?: string) {
  const packages = packagePath ? [packagePath] : listOntologyAuditPackagePaths(repoRoot);
  if (packages.length !== 1) throw new Error(`Expected exactly one ontology audit package; found ${packages.length}.`);
  return resolveCanonicalOntologyAuditPackage({
    repoRoot,
    packagePath: packages[0]!,
  });
}

function assertOntologySemanticPreacceptance(
  repoRoot: string,
  packagePath: string,
  siteDirectory: string,
  closureEvidenceProof: VerifiedOntologyClosureEvidenceProof,
) {
  const issues = verifyOntologyAuditSemanticPreacceptance({
    repoRoot,
    packagePath,
    siteDirectory,
    closureEvidenceProof,
  });
  if (issues.length > 0) {
    throw new Error(
      `Ontology semantic preacceptance failed before regeneration:\n${formatOntologyAuditIssues(issues)}`,
    );
  }
}

function verifyOntologySemanticPreacceptanceForSite(
  repoRoot: string,
  packagePath: string,
  siteDirectory: string,
): VerifiedOntologyClosureEvidenceProof {
  const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  const proof = verifyOntologyClosureEvidenceFile({
    repoRoot,
    packagePath: auditPackage.absolute,
    siteDirectory,
  });
  assertOntologyClosureEvidenceIsZero(proof.evidence);
  assertOntologySemanticPreacceptance(
    repoRoot,
    auditPackage.absolute,
    siteDirectory,
    proof,
  );
  return proof;
}

export function collectOntologyClosureEvidence({
  repoRoot = getRepoRoot(),
  siteDirectory,
}: {
  repoRoot?: string;
  siteDirectory?: string;
} = {}): OntologyClosureEvidence {
  if (repoRoot !== getRepoRoot()) {
    throw new Error("Closure evidence must be collected from the active canonical repository.");
  }
  if (siteDirectory) {
    return recomputeOntologyClosureEvidence({ repoRoot, siteDirectory }).evidence;
  }
  const workRoot = ensureCanonicalOntologyWorkRoot(repoRoot);
  const temporary = mkdtempSync(join(workRoot, "ontology-reader-leak-"));
  try {
    buildStaticSite({ outDir: temporary });
    return recomputeOntologyClosureEvidence({ repoRoot, siteDirectory: temporary }).evidence;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

export const ONTOLOGY_REGENERATION_PHASES = [
  "projections",
  "write-audio",
  "site",
  "write-closure-evidence",
  "validate-semantic-preacceptance",
  "write-completeness",
  "validate-clusters",
  "validate-dossiers",
  "validate-audio",
  "validate-completeness",
] as const;
type OntologyRegenerationPhase = typeof ONTOLOGY_REGENERATION_PHASES[number];

const REGENERATION_WORKER_FLAG = "--ontology-regeneration-worker";
const REGENERATION_PHASE_WORKER_FLAG = "--ontology-regeneration-phase-worker";
const ONTOLOGY_CLOSURE_RECEIPT_PATH = "wiki/review/2026-08-30-ontology-vnext-closure.md";

function runRegenerationPhase(
  phase: OntologyRegenerationPhase,
  repoRoot: string,
  siteDirectory: string,
  packagePath: string,
) {
  if (phase === "projections") {
    cleanOntologyGeneratedProjectionRoots(repoRoot);
    writeObservationTurnJoins();
    writeVoiceIndexes();
    writeVoiceJoins();
    writeClusterArtifacts();
    writeDossierArtifacts();
    return;
  }
  if (phase === "write-audio") {
    assertOntologyRegenerationFixedWriteTargets(repoRoot);
    writeAudioCoverageReport();
    return;
  }
  if (phase === "write-completeness") {
    const closureEvidenceProof = verifyOntologySemanticPreacceptanceForSite(
      repoRoot,
      packagePath,
      siteDirectory,
    );
    const report = buildCompletenessReport(auditCompletenessFacts({
      siteDirectory,
      closureEvidenceProof,
    }));
    assertOntologyRegenerationFixedWriteTargets(repoRoot);
    writeCompletenessReport(report);
    return;
  }
  if (phase === "site") {
    buildStaticSite({ outDir: siteDirectory });
    return;
  }
  if (phase === "write-closure-evidence") {
    const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
    const evidence = recomputeOntologyClosureEvidence({ repoRoot, siteDirectory });
    atomicWriteFile(
      join(auditPackage.absolute, "closure-evidence.json"),
      evidence.content,
    );
    return;
  }
  if (phase === "validate-semantic-preacceptance") {
    verifyOntologySemanticPreacceptanceForSite(repoRoot, packagePath, siteDirectory);
    return;
  }
  if (phase === "validate-completeness") {
    const closureEvidenceProof = verifyOntologySemanticPreacceptanceForSite(
      repoRoot,
      packagePath,
      siteDirectory,
    );
    const validationFailures = validateCompletenessReport(
      "wiki/completeness.md",
      undefined,
      { siteDirectory, closureEvidenceProof },
    ).map((issue) => issue.message);
    if (validationFailures.length > 0) {
      throw new Error(`Generated ontology projections failed validation:\n${validationFailures.join("\n")}`);
    }
    return;
  }
  const validationFailures = phase === "validate-clusters"
    ? validateClusterArtifacts()
    : phase === "validate-dossiers"
      ? validateDossierArtifacts()
      : validateAudioCoverageReport().map((issue) => issue.message);
  if (validationFailures.length > 0) {
    throw new Error(`Generated ontology projections failed validation:\n${validationFailures.join("\n")}`);
  }
}

function runRegenerationPhaseWorker(
  phase: OntologyRegenerationPhase,
  repoRoot: string,
  siteDirectory: string,
  packagePath: string,
) {
  assertCanonicalOntologyRegenerationWorkerPaths({ repoRoot, siteDirectory });
  const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(import.meta.url),
      REGENERATION_PHASE_WORKER_FLAG,
      phase,
      repoRoot,
      siteDirectory,
      auditPackage.logical,
    ],
    {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const suffix = result.signal ? ` (signal ${result.signal})` : "";
    throw new Error(
      `Ontology regeneration ${phase} phase failed with status ${String(result.status)}${suffix}.`,
    );
  }
}

function regenerateOnce(
  repoRoot: string,
  siteDirectory: string,
  packagePath: string,
): OntologyRegenerationRun {
  // Each phase gets a fresh JavaScript heap. This is an execution boundary,
  // not a second representation: the only inter-phase state is the generated
  // filesystem projection that the final content manifest hashes and binds.
  for (const phase of ONTOLOGY_REGENERATION_PHASES) {
    runRegenerationPhaseWorker(phase, repoRoot, siteDirectory, packagePath);
  }
  const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  const artifacts = collectOntologyRegenerationArtifacts(repoRoot, siteDirectory);
  const closureEvidenceProof = verifyOntologyClosureEvidenceFile({
    repoRoot,
    packagePath: auditPackage.absolute,
    siteDirectory,
  });
  assertOntologyClosureEvidenceIsZero(closureEvidenceProof.evidence);
  if (!ontologyRegenerationBindsClosureEvidenceSite(artifacts, closureEvidenceProof.site_artifacts)) {
    throw new Error("Ontology regeneration artifacts do not exactly bind the verified closure-evidence site tree.");
  }
  return {
    artifacts,
    digest: ontologyRegenerationDigest(artifacts),
    closure_evidence: {
      path: `${auditPackage.logical}/closure-evidence.json`,
      bytes: Buffer.byteLength(closureEvidenceProof.content),
      sha256: closureEvidenceProof.sha256,
    },
  };
}

function isOntologyRegenerationArtifact(value: unknown): value is OntologyRegenerationArtifact {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as Partial<OntologyRegenerationArtifact>;
  return typeof candidate.path === "string" && candidate.path.length > 0
    && typeof candidate.bytes === "number" && Number.isSafeInteger(candidate.bytes) && candidate.bytes >= 0
    && typeof candidate.sha256 === "string" && /^[a-f0-9]{64}$/u.test(candidate.sha256);
}

function readRegenerationWorkerManifest(path: string): OntologyRegenerationRun {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<OntologyRegenerationWorkerManifest>;
  if (parsed.schema_version !== 1 || !Array.isArray(parsed.artifacts)
    || !parsed.artifacts.every(isOntologyRegenerationArtifact)
    || new Set(parsed.artifacts.map((entry) => entry.path)).size !== parsed.artifacts.length
    || parsed.artifact_count !== parsed.artifacts.length
    || !isOntologyRegenerationArtifact(parsed.closure_evidence)
    || typeof parsed.digest !== "string" || !/^[a-f0-9]{64}$/u.test(parsed.digest)) {
    throw new Error(`Malformed ontology regeneration worker manifest: ${path}`);
  }
  const digest = ontologyRegenerationDigest(parsed.artifacts);
  if (digest !== parsed.digest) {
    throw new Error(`Ontology regeneration worker manifest digest mismatch: ${path}`);
  }
  return { artifacts: parsed.artifacts, digest, closure_evidence: parsed.closure_evidence };
}

function runRegenerationWorker({
  repoRoot,
  siteDirectory,
  manifestPath,
  packagePath,
}: {
  repoRoot: string;
  siteDirectory: string;
  manifestPath: string;
  packagePath: string;
}): OntologyRegenerationRun {
  assertCanonicalOntologyRegenerationWorkerPaths({ repoRoot, siteDirectory, manifestPath });
  const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(import.meta.url),
      REGENERATION_WORKER_FLAG,
      repoRoot,
      siteDirectory,
      manifestPath,
      auditPackage.logical,
    ],
    {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const suffix = result.signal ? ` (signal ${result.signal})` : "";
    throw new Error(`Ontology regeneration worker failed with status ${String(result.status)}${suffix}.`);
  }
  const run = readRegenerationWorkerManifest(manifestPath);
  const expectedEvidencePath = `${auditPackage.logical}/closure-evidence.json`;
  if (run.closure_evidence.path !== expectedEvidencePath) {
    throw new Error(
      `Ontology regeneration worker bound the wrong closure evidence path: ${run.closure_evidence.path} != ${expectedEvidencePath}.`,
    );
  }
  return run;
}

function runRegenerationWorkerEntryPoint() {
  const scriptPath = process.argv[1];
  if (!scriptPath || pathToFileURL(scriptPath).href !== import.meta.url) return;
  if (process.argv[2] === REGENERATION_PHASE_WORKER_FLAG) {
    const [rawPhase, repoRoot, siteDirectory, packagePath] = process.argv.slice(3);
    if (!rawPhase || !ONTOLOGY_REGENERATION_PHASES.includes(rawPhase as OntologyRegenerationPhase)
      || !repoRoot || !siteDirectory || !packagePath) {
      throw new Error(
        `Ontology regeneration phase worker requires one of ${ONTOLOGY_REGENERATION_PHASES.join(", ")}, repo root, site directory, and package path.`,
      );
    }
    if (repoRoot !== getRepoRoot()) {
      throw new Error(`Ontology regeneration phase worker must use the active canonical repository root ${getRepoRoot()}.`);
    }
    assertCanonicalOntologyRegenerationWorkerPaths({ repoRoot, siteDirectory });
    const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
    runRegenerationPhase(
      rawPhase as OntologyRegenerationPhase,
      repoRoot,
      siteDirectory,
      auditPackage.logical,
    );
    const usage = process.resourceUsage();
    console.error(
      `ontology_regeneration_phase=${rawPhase} max_rss_bytes=${usage.maxRSS} user_cpu_us=${usage.userCPUTime} system_cpu_us=${usage.systemCPUTime}`,
    );
    return;
  }
  if (process.argv[2] !== REGENERATION_WORKER_FLAG) return;
  const [repoRoot, siteDirectory, manifestPath, packagePath] = process.argv.slice(3);
  if (!repoRoot || !siteDirectory || !manifestPath || !packagePath) {
    throw new Error("Ontology regeneration worker requires repo root, site directory, manifest path, and package path.");
  }
  if (repoRoot !== getRepoRoot()) {
    throw new Error(`Ontology regeneration worker must use the active canonical repository root ${getRepoRoot()}.`);
  }
  assertCanonicalOntologyRegenerationWorkerPaths({ repoRoot, siteDirectory, manifestPath });
  const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  const run = regenerateOnce(repoRoot, siteDirectory, auditPackage.logical);
  const manifest: OntologyRegenerationWorkerManifest = {
    schema_version: 1,
    artifact_count: run.artifacts.length,
    ...run,
  };
  assertCanonicalOntologyRegenerationWorkerPaths({ repoRoot, siteDirectory, manifestPath });
  atomicWriteFile(manifestPath, `${JSON.stringify(manifest)}\n`);
}

function regenerateOntologyArtifactsTwiceAfterPendingTransition({
  repoRoot,
  auditPackage,
  preserveFinalSiteForAcceptance = false,
}: {
  repoRoot: string;
  auditPackage: ReturnType<typeof resolveOntologyAuditPackage>;
  preserveFinalSiteForAcceptance?: boolean;
}) {
  // Reject a symlinked/misplaced scratch root before changing the durable
  // acceptance authority marker.
  ensureCanonicalOntologyWorkRoot(repoRoot);
  // Idempotently reassert the fail-closed authority boundary immediately
  // before the first canonical generator mutation.
  beginOntologyAuditFinalizationTransition({ repoRoot, packagePath: auditPackage.absolute });
  const workspace = createCanonicalOntologyRegenerationWorkspace(repoRoot);
  const temporary = workspace.temporaryRoot;
  let removeTemporary = true;
  try {
    const finalSiteDirectory = workspace.siteTwo;
    const first = runRegenerationWorker({
      repoRoot,
      siteDirectory: workspace.siteOne,
      manifestPath: workspace.manifestOne,
      packagePath: auditPackage.logical,
    });
    const second = runRegenerationWorker({
      repoRoot,
      siteDirectory: finalSiteDirectory,
      manifestPath: workspace.manifestTwo,
      packagePath: auditPackage.logical,
    });
    if (!ontologyRegenerationRunsEqual(first, second)) {
      throw new Error(
        `Ontology regeneration is not byte-stable: artifacts ${first.digest} != ${second.digest}; closure evidence ${first.closure_evidence.sha256} != ${second.closure_evidence.sha256}.`,
      );
    }
    const observedArtifacts = collectOntologyRegenerationArtifacts(repoRoot, finalSiteDirectory);
    const observedDigest = ontologyRegenerationDigest(observedArtifacts);
    const observedClosureProof = verifyOntologyClosureEvidenceFile({
      repoRoot,
      packagePath: auditPackage.absolute,
      siteDirectory: finalSiteDirectory,
    });
    assertOntologyClosureEvidenceIsZero(observedClosureProof.evidence);
    const observedClosureEvidence: OntologyRegenerationArtifact = {
      path: `${auditPackage.logical}/closure-evidence.json`,
      bytes: Buffer.byteLength(observedClosureProof.content),
      sha256: observedClosureProof.sha256,
    };
    if (
      !ontologyRegenerationArtifactsEqual(second.artifacts, observedArtifacts)
      || !ontologyRegenerationArtifactsEqual([second.closure_evidence], [observedClosureEvidence])
      || !ontologyRegenerationBindsClosureEvidenceSite(
        observedArtifacts,
        observedClosureProof.site_artifacts,
      )
      || second.digest !== observedDigest
    ) {
      throw new Error(
        `Final ontology artifacts changed after the second worker manifest: ${second.digest} != ${observedDigest}.`,
      );
    }
    const receipt = {
      schema_version: 1,
      state: "complete",
      clean_state_policy: "Each run rejects symlinks and non-regular entries, removes the complete generated joins, voices, clusters, and dossiers scopes while preserving only voice cutovers.toml and sigla.toml, then rebuilds and re-enumerates the exact regular-file path set.",
      generators: [
        "writeObservationTurnJoins",
        "writeVoiceIndexes",
        "writeVoiceJoins",
        "writeClusterArtifacts",
        "writeDossierArtifacts",
        "writeAudioCoverageReport",
        "buildStaticSite",
        "writeCompletenessReport",
      ],
      regeneration_one_sha256: first.digest,
      regeneration_two_sha256: second.digest,
      closure_evidence_one_sha256: first.closure_evidence.sha256,
      closure_evidence_two_sha256: second.closure_evidence.sha256,
      closure_evidence_sha256: observedClosureProof.sha256,
      closure_evidence_site_tree_sha256: observedClosureProof.site_tree_sha256,
      closure_evidence_bytes: observedClosureEvidence.bytes,
      artifact_count: observedArtifacts.length,
      artifacts: observedArtifacts,
    };
    const receiptPath = join(auditPackage.absolute, "regeneration.json");
    atomicWriteFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    const result = {
      receiptPath: relative(repoRoot, receiptPath).split("\\").join("/"),
      regenerationOneSha256: first.digest,
      regenerationTwoSha256: second.digest,
      artifacts: observedArtifacts,
      closureEvidenceArtifact: observedClosureEvidence,
    };
    if (!preserveFinalSiteForAcceptance) return result;
    removeTemporary = false;
    let cleaned = false;
    return {
      ...result,
      finalSiteDirectory,
      closureEvidenceProof: observedClosureProof,
      cleanup: () => {
        if (cleaned) return;
        cleaned = true;
        rmSync(temporary, { recursive: true, force: true });
      },
    };
  } finally {
    if (removeTemporary) rmSync(temporary, { recursive: true, force: true });
  }
}

export function regenerateOntologyArtifactsTwice({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath?: string;
} = {}) {
  const canonicalRoot = getRepoRoot();
  if (repoRoot !== canonicalRoot) {
    throw new Error(`Regeneration must run against the active canonical repository root ${canonicalRoot}.`);
  }
  const auditPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  return regenerateOntologyArtifactsTwiceAfterPendingTransition({
    repoRoot,
    auditPackage,
  });
}

runRegenerationWorkerEntryPoint();

export function closeOntologyVNextAudit({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath?: string;
} = {}) {
  const canonicalRoot = getRepoRoot();
  if (repoRoot !== canonicalRoot) {
    throw new Error(`Ontology closure must run against the active canonical repository root ${canonicalRoot}.`);
  }
  const initialPackage = resolveOntologyAuditPackage(repoRoot, packagePath);
  ensureCanonicalOntologyWorkRoot(repoRoot);
  resolveCanonicalOntologyRepoFileWriteTarget({
    repoRoot,
    relativePath: ONTOLOGY_CLOSURE_RECEIPT_PATH,
    label: "Ontology closure receipt",
  });
  // Demote global authority before binding partitions or writing any derived
  // closure artifact. Every failure from this point leaves an explicit pending
  // marker, never a stale accepted label over partially changed bytes.
  beginOntologyAuditFinalizationTransition({ repoRoot, packagePath: initialPackage.absolute });
  const bound = bindOntologyAuditFinalState({
    repoRoot,
    packagePath: initialPackage.absolute,
  });
  const auditPackage = resolveOntologyAuditPackage(repoRoot, bound.packagePath);
  const regeneration = regenerateOntologyArtifactsTwiceAfterPendingTransition({
    repoRoot,
    auditPackage,
    preserveFinalSiteForAcceptance: true,
  });
  if (!("cleanup" in regeneration)) {
    throw new Error("Ontology closure lost its verified final-site handoff.");
  }
  try {
    const packageAbsolute = join(repoRoot, bound.packagePath);
    const evidenceRelativePath = `${bound.packagePath}/closure-evidence.json`;
    const finalClosureEvidenceProof = verifyOntologyClosureEvidenceFile({
      repoRoot,
      packagePath: packageAbsolute,
      siteDirectory: regeneration.finalSiteDirectory,
    });
    const evidence = finalClosureEvidenceProof.evidence;
    assertOntologyClosureEvidenceIsZero(evidence);
    const reboundEvidence: OntologyRegenerationArtifact = {
      path: evidenceRelativePath,
      bytes: Buffer.byteLength(finalClosureEvidenceProof.content),
      sha256: finalClosureEvidenceProof.sha256,
    };
    if (!ontologyRegenerationArtifactsEqual([regeneration.closureEvidenceArtifact], [reboundEvidence])) {
      throw new Error("Final ontology closure evidence changed after deterministic regeneration.");
    }
    if (!bound.manifest.baseline_evidence) {
      throw new Error("Cannot close ontology audit without snapshot-bound baseline evidence.");
    }
    const baselineEvidenceRelativePath = `${bound.packagePath}/${bound.manifest.baseline_evidence.path}`;
    const finalAdjustmentArtifact = readOntologyAuditFinalAdjustments({
      repoRoot,
      packagePath: packageAbsolute,
    });
    const closureArtifactPaths = [...new Set([
      baselineEvidenceRelativePath,
      regeneration.receiptPath,
      evidenceRelativePath,
      ...(finalAdjustmentArtifact
        ? [
          finalAdjustmentArtifact.receiptPath,
          ...finalAdjustmentArtifact.receiptBindings.keys(),
        ]
        : []),
      ...bound.rows.adjudications
        .map((row) => row.receipt_path)
        .filter((path): path is string => path !== null),
    ])].sort();
    const closureArtifactBindings = closureArtifactPaths.map((path) => {
      const absolute = join(repoRoot, path);
      if (!existsSync(absolute)) throw new Error(`Closure artifact is missing: ${path}`);
      return `- artifact: \`${path}\`; sha256: \`${sha256(readFileSync(absolute))}\``;
    });
    const receiptPath = ONTOLOGY_CLOSURE_RECEIPT_PATH;
    const receipt = [
      "# Ontology vNext full-corpus closure receipt",
      "",
      `- frozen baseline: \`${bound.manifest.baseline.git_commit}\``,
      `- audit snapshot: \`${bound.manifest.snapshot_id}\``,
      "- final corpus digest: bound after this receipt in the snapshot acceptance record, avoiding a self-referential receipt hash",
      `- final record units: ${bound.rows.records.length}`,
      `- final concept/membership union units: ${bound.rows.concepts.length}`,
      `- final graph union units: ${bound.rows.graphs.length}`,
      `- terminal adjudications: ${bound.rows.adjudications.length}`,
      "- source-first coverage: primary and independent dispositions complete for every frozen Greek source unit; all disagreements reconciled",
      "- record-first coverage: every frozen and final record, edge, concept, and membership occurs exactly once in its required partition with a terminal item-level adjudication",
      "- alias policy: zero legacy feature identity fields, feature_candidate ids, family::label aliases, compatibility aliases, dual readers, or fallback identities in canonical records and public projections",
      "- reader policy: zero rejected observation, claim, relation, commentary, or voice ids in generated joins, public ontology projections, or site output",
      "- semantic gates: zero pending review status, empty accepted-claim observation linkage, citationless accepted commentary, or accepted non-relation fiction",
      `- regeneration one sha256: \`${regeneration.regenerationOneSha256}\``,
      `- regeneration two sha256: \`${regeneration.regenerationTwoSha256}\``,
      `- regeneration artifacts: ${regeneration.artifacts.length}`,
      `- machine evidence: \`${evidenceRelativePath}\``,
      `- baseline evidence: \`${baselineEvidenceRelativePath}\``,
      ...closureArtifactBindings,
      "- required validation commands: `bun run test`, `bun run typecheck`, `bun run validate`, `git diff --check`, and `bun run harness ontology-audit verify`",
      "",
    ].join("\n");
    const receiptAbsolute = resolveCanonicalOntologyRepoFileWriteTarget({
      repoRoot,
      relativePath: receiptPath,
      label: "Ontology closure receipt",
    });
    atomicWriteFile(receiptAbsolute, receipt);
    const accepted = acceptOntologyAuditClosure({
      repoRoot,
      packagePath: packageAbsolute,
      regenerationOneSha256: regeneration.regenerationOneSha256,
      regenerationTwoSha256: regeneration.regenerationTwoSha256,
      staleAliases: evidence.staleAliasIssues.length,
      rejectedReaderLeaks: evidence.rejectedReaderLeaks.length,
      receiptPath,
      siteDirectory: regeneration.finalSiteDirectory,
      closureEvidenceProof: finalClosureEvidenceProof,
    });
    // acceptOntologyAuditClosure already performs both a full candidate
    // verification while authority is pending and a full verification after
    // publishing the accepted marker. Repeating that whole-corpus verifier a
    // third time here retains another complete audit graph in this long-lived
    // orchestration process and can exhaust the host after two clean
    // regenerations without adding a distinct proof obligation.
    const publicRegeneration = {
      receiptPath: regeneration.receiptPath,
      regenerationOneSha256: regeneration.regenerationOneSha256,
      regenerationTwoSha256: regeneration.regenerationTwoSha256,
      artifacts: regeneration.artifacts,
      closureEvidenceArtifact: regeneration.closureEvidenceArtifact,
    };
    return { regeneration: publicRegeneration, evidence, bound, accepted, receiptPath };
  } finally {
    regeneration.cleanup();
  }
}

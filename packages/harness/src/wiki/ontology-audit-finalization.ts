import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  listOntologyAuditPackagePaths,
  ontologyAuditChangeKind,
  observeOntologyAuditLiveState,
  reconcileOntologyAuditFinalAdjustmentState,
  formatOntologyAuditIssues,
  verifyOntologyAuditAcceptanceCandidate,
  verifyOntologyAuditFinalBinding,
  type OntologyAuditAcceptance,
  type OntologyAuditAdjudication,
  type OntologyAuditConceptUnit,
  type OntologyAuditFinding,
  type OntologyAuditGraphUnit,
  type OntologyAuditManifest,
  type OntologyAuditRecordUnit,
  type OntologyAuditRows,
} from "./ontology-audit.js";
import { resolveCanonicalOntologyAuditPackage } from "./ontology-audit-package-path.js";
import { readOntologyConceptAudit } from "./ontology-concept-audit.js";
import {
  expectedOntologyAuditFinalAdjustmentAction,
  ontologyAuditAdjudicationSha256,
  ontologyAuditFinalPointerSha256,
  readOntologyAuditFinalAdjustments,
  type OntologyAuditFinalAdjustment,
  type OntologyAuditFinalAdjustmentPriorTarget,
} from "./ontology-audit-final-adjustments.js";
import type { VerifiedOntologyClosureEvidenceProof } from "./ontology-closure-evidence.js";

const SEMANTIC_RECEIPT = "wiki/review/2026-08-30-ontology-vnext-semantic-remediation.md";
const CONCEPT_RECEIPT = "wiki/review/2026-08-30-ontology-vnext-concept-audit.md";
const CLOSURE_RECEIPT = "wiki/review/2026-08-30-ontology-vnext-closure.md";

const FINALIZATION_PARTITION_FILES = [
  "source-units.jsonl",
  "record-units.jsonl",
  "concept-membership-units.jsonl",
  "graph-units.jsonl",
  "findings.jsonl",
  "adjudications.jsonl",
] as const;
type FinalizationPartitionFile = typeof FINALIZATION_PARTITION_FILES[number];

const BIND_PUBLICATION_FILES = [
  "record-units.jsonl",
  "concept-membership-units.jsonl",
  "graph-units.jsonl",
  "adjudications.jsonl",
  "manifest.json",
] as const;

export type OntologyAuditFinalizationPublicationStep =
  | "before_transition_acceptance"
  | "after_transition_acceptance"
  | `after_payload:${string}`
  | "before_candidate_verification"
  | "after_candidate_verification"
  | "before_final_acceptance"
  | "after_final_acceptance"
  | "before_post_publish_verification";

let finalizationFailureInjector: ((step: OntologyAuditFinalizationPublicationStep) => void) | undefined;

export function setOntologyAuditFinalizationFailureInjectorForTesting(
  injector: ((step: OntologyAuditFinalizationPublicationStep) => void) | undefined,
) {
  const prior = finalizationFailureInjector;
  finalizationFailureInjector = injector;
  return () => {
    finalizationFailureInjector = prior;
  };
}

export type SemanticDecision = {
  target_key: string;
  action: string;
  rationale: string;
  finding_ids: string[];
  replacement_target_keys: string[];
};

type AuditedUnit = OntologyAuditRecordUnit | OntologyAuditConceptUnit | OntologyAuditGraphUnit;

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

const ONTOLOGY_PUBLISHED_BINDING_HASH_CHUNK_BYTES = 1024 * 1024;

function sha256RegularFile(path: string) {
  const pathStat = lstatSync(path);
  if (!pathStat.isFile() || pathStat.isSymbolicLink()) {
    throw new Error(`Published ontology binding must be a regular non-symlink file: ${path}`);
  }
  const descriptor = openSync(path, "r");
  try {
    if (!fstatSync(descriptor).isFile()) {
      throw new Error(`Published ontology binding changed away from a regular file: ${path}`);
    }
    const digest = createHash("sha256");
    const chunk = Buffer.allocUnsafe(ONTOLOGY_PUBLISHED_BINDING_HASH_CHUNK_BYTES);
    while (true) {
      const bytesRead = readSync(descriptor, chunk, 0, chunk.byteLength, null);
      if (bytesRead === 0) break;
      digest.update(chunk.subarray(0, bytesRead));
    }
    return digest.digest("hex");
  } finally {
    closeSync(descriptor);
  }
}

export function verifyOntologyAuditPublishedFileBindings(
  bindings: readonly { path: string; sha256: string }[],
) {
  const seen = new Set<string>();
  for (const binding of bindings) {
    if (seen.has(binding.path)) {
      throw new Error(`Duplicate published ontology binding: ${binding.path}`);
    }
    seen.add(binding.path);
    if (!/^[a-f0-9]{64}$/u.test(binding.sha256)) {
      throw new Error(`Published ontology binding has an invalid SHA-256 digest: ${binding.path}`);
    }
    const observed = sha256RegularFile(binding.path);
    if (observed !== binding.sha256) {
      throw new Error(
        `Published ontology binding changed after full candidate verification: ${binding.path} (${binding.sha256} != ${observed}).`,
      );
    }
  }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function renderJsonl(rows: readonly unknown[]) {
  return rows.length === 0 ? "" : `${rows.map(canonicalJson).join("\n")}\n`;
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function keySetSha256(keys: readonly string[]) {
  const sorted = [...keys].sort();
  return sha256(sorted.length === 0 ? "" : `${sorted.join("\n")}\n`);
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split(/\r?\n/u).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line) as T;
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function absolutePackagePath(repoRoot: string, packagePath?: string) {
  const resolved = packagePath ?? listOntologyAuditPackagePaths(repoRoot)[0];
  if (!resolved) throw new Error("Missing ontology audit package.");
  return resolveCanonicalOntologyAuditPackage({ repoRoot, packagePath: resolved }).absolute;
}

function pendingOntologyAuditManifest(manifest: OntologyAuditManifest): OntologyAuditManifest {
  return {
    ...manifest,
    audit_state: "pending",
    lane_states: manifest.lane_states.map((lane) => ({
      ...lane,
      state: lane.count === 0 ? "zero_result" : "pending",
    })),
  };
}

function pendingOntologyAuditAcceptance(acceptance: OntologyAuditAcceptance): OntologyAuditAcceptance {
  return {
    ...acceptance,
    state: "pending",
    final_corpus_digest: null,
    receipt: null,
    closure: {
      baseline_set_equal: true,
      final_set_equal: true,
      source_passes_complete: false,
      reconciliations_complete: false,
      adjudications_complete: false,
      unresolved_adjudications: acceptance.closure.unresolved_adjudications,
      stale_aliases: 0,
      rejected_reader_leaks: 0,
      regeneration_one_sha256: null,
      regeneration_two_sha256: null,
    },
  };
}

function writeDurableSibling(targetPath: string, content: string, label: string) {
  const path = join(
    dirname(targetPath),
    `.${basename(targetPath)}.${label}-${process.pid}-${randomUUID()}`,
  );
  writeFileSync(path, content, { encoding: "utf8", flag: "wx" });
  const descriptor = openSync(path, "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  return path;
}

function fsyncParentDirectory(path: string) {
  const descriptor = openSync(dirname(path), "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function durableSiblingRename(stagedPath: string, targetPath: string) {
  if (dirname(stagedPath) !== dirname(targetPath)) {
    throw new Error(`Finalization rename must stay within one directory: ${stagedPath} -> ${targetPath}`);
  }
  renameSync(stagedPath, targetPath);
  fsyncParentDirectory(targetPath);
}

function atomicReplaceText(targetPath: string, content: string, label: string) {
  const staged = writeDurableSibling(targetPath, content, label);
  try {
    durableSiblingRename(staged, targetPath);
  } finally {
    rmSync(staged, { force: true });
  }
}

function publicationCheckpoint(step: OntologyAuditFinalizationPublicationStep) {
  finalizationFailureInjector?.(step);
}

export type OntologyAuditFinalizationStagedFile = {
  logicalName: string;
  stagedPath: string;
  targetPath: string;
};

function validateRequiredFinalAdjustmentArtifactBindings({
  absolute,
  state,
  artifact,
}: {
  absolute: string;
  state: ReturnType<typeof reconcileOntologyAuditFinalAdjustmentState>;
  artifact: ReturnType<typeof readOntologyAuditFinalAdjustments>;
}) {
  if (!state.required) return;
  if (!artifact) {
    throw new Error("Ontology audit requires its bound final-adjustment artifact; refusing an unproved transition.");
  }
  const decisionPath = relative(absolute, artifact.artifactPath).split("\\").join("/");
  const priorStatePath = relative(absolute, artifact.priorStateArtifactPath).split("\\").join("/");
  if (
    state.decision_artifact?.path !== decisionPath ||
    state.decision_artifact.sha256 !== artifact.sha256 ||
    state.prior_state_artifact?.path !== priorStatePath ||
    state.prior_state_artifact.sha256 !== artifact.priorStateSha256 ||
    state.receipt?.path !== artifact.receiptPath ||
    state.receipt.sha256 !== artifact.receiptSha256
  ) {
    throw new Error("Ontology audit final-adjustment binding differs from the durable artifact or reciprocal receipt.");
  }
}

/**
 * Publish a fully staged and prevalidated finalization candidate.
 *
 * The first rename removes any accepted authority marker. Payload renames may
 * then be interrupted safely because acceptance remains explicitly pending.
 * The final acceptance rename is the only commit marker. A synchronous failure
 * after that rename immediately demotes the package again before it escapes.
 */
export function publishOntologyAuditFinalizationCandidate({
  acceptancePath,
  transitionAcceptanceContent,
  payloads,
  finalAcceptance,
  verifyCandidate,
  verifyPublished,
}: {
  acceptancePath: string;
  transitionAcceptanceContent: string;
  payloads: readonly OntologyAuditFinalizationStagedFile[];
  finalAcceptance: OntologyAuditFinalizationStagedFile;
  verifyCandidate: () => string;
  verifyPublished: () => void;
}) {
  let transitionPublished = false;
  const stagedPaths = [...payloads.map((entry) => entry.stagedPath), finalAcceptance.stagedPath];
  try {
    publicationCheckpoint("before_transition_acceptance");
    atomicReplaceText(acceptancePath, transitionAcceptanceContent, "transition");
    transitionPublished = true;
    publicationCheckpoint("after_transition_acceptance");
    for (const payload of payloads) {
      durableSiblingRename(payload.stagedPath, payload.targetPath);
      publicationCheckpoint(`after_payload:${payload.logicalName}`);
    }
    publicationCheckpoint("before_candidate_verification");
    const verifiedAcceptanceSha256 = verifyCandidate();
    if (!/^[a-f0-9]{64}$/u.test(verifiedAcceptanceSha256)) {
      throw new Error("Ontology audit candidate verifier did not return an acceptance SHA-256 digest.");
    }
    publicationCheckpoint("after_candidate_verification");
    publicationCheckpoint("before_final_acceptance");
    const commitAcceptanceSha256 = sha256(readFileSync(finalAcceptance.stagedPath));
    if (commitAcceptanceSha256 !== verifiedAcceptanceSha256) {
      throw new Error(
        `Staged ontology acceptance changed after full verification: ${verifiedAcceptanceSha256} != ${commitAcceptanceSha256}.`,
      );
    }
    durableSiblingRename(finalAcceptance.stagedPath, finalAcceptance.targetPath);
    publicationCheckpoint("after_final_acceptance");
    publicationCheckpoint("before_post_publish_verification");
    verifyPublished();
  } catch (error) {
    if (transitionPublished) {
      try {
        atomicReplaceText(acceptancePath, transitionAcceptanceContent, "recovery-pending");
      } catch (recoveryError) {
        throw new AggregateError(
          [error, recoveryError],
          "Ontology audit finalization failed and its accepted marker could not be demoted.",
        );
      }
    }
    throw error;
  } finally {
    for (const path of stagedPaths) rmSync(path, { force: true });
  }
}

/**
 * Enter the fail-closed state before regeneration or any other closure write.
 * This operation is idempotent; an already-pending package is left untouched.
 */
export function beginOntologyAuditFinalizationTransition({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath?: string;
} = {}) {
  const absolute = absolutePackagePath(repoRoot, packagePath);
  const acceptancePath = join(absolute, "acceptance.json");
  const acceptance = JSON.parse(readFileSync(acceptancePath, "utf8")) as OntologyAuditAcceptance;
  const manifest = JSON.parse(readFileSync(join(absolute, "manifest.json"), "utf8")) as OntologyAuditManifest;
  const finalAdjustmentState = reconcileOntologyAuditFinalAdjustmentState(
    acceptance.final_adjustments,
    manifest.final_adjustments,
  );
  // Reading the package validates the complete content-addressed adjustment
  // bundle, including its embedded prior acceptance and partition replay.
  const finalAdjustmentArtifact = readOntologyAuditFinalAdjustments({ repoRoot, packagePath: absolute });
  validateRequiredFinalAdjustmentArtifactBindings({
    absolute,
    state: finalAdjustmentState,
    artifact: finalAdjustmentArtifact,
  });
  if (acceptance.state !== "accepted") {
    return {
      packagePath: relative(repoRoot, absolute).split("\\").join("/"),
      changed: false,
      acceptance,
    };
  }
  const pending = pendingOntologyAuditAcceptance(acceptance);
  atomicReplaceText(acceptancePath, prettyJson(pending), "begin-pending");
  return {
    packagePath: relative(repoRoot, absolute).split("\\").join("/"),
    changed: true,
    acceptance: pending,
  };
}

export function terminalOntologyAuditManifest(manifest: OntologyAuditManifest): OntologyAuditManifest {
  return {
    ...manifest,
    audit_state: "accepted",
    lane_states: manifest.lane_states.map((lane) => ({
      ...lane,
      state: lane.count === 0 ? "zero_result" : "complete",
    })),
  };
}

type FinalizationPartitionContents = Record<FinalizationPartitionFile, string>;

type OntologyAuditFinalizationCandidate = {
  acceptance: OntologyAuditAcceptance;
  acceptanceContent: string;
  manifest: OntologyAuditManifest;
  manifestContent: string;
  partitions: FinalizationPartitionContents;
};

function partitionKeyField(file: FinalizationPartitionFile): "key" | "finding_id" | "target_key" {
  return file === "adjudications.jsonl"
    ? "target_key"
    : file === "findings.jsonl"
      ? "finding_id"
      : "key";
}

function parsedJsonlContent(path: string, content: string): Array<Record<string, unknown>> {
  return content.split(/\r?\n/u).filter(Boolean).map((line, index) => {
    try {
      const parsed = JSON.parse(line) as unknown;
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("row must be an object");
      }
      return parsed as Record<string, unknown>;
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function partitionDescriptors(
  manifest: OntologyAuditManifest,
  contents: FinalizationPartitionContents,
): OntologyAuditManifest["partitions"] {
  return Object.fromEntries(FINALIZATION_PARTITION_FILES.map((file) => {
    const rows = parsedJsonlContent(file, contents[file]);
    const keyField = partitionKeyField(file);
    if (manifest.partitions[file].key_field !== keyField) {
      throw new Error(`${file}: manifest key field must remain ${keyField}.`);
    }
    const keys = rows.map((row, index) => {
      const key = row[keyField];
      if (typeof key !== "string" || key.length === 0) {
        throw new Error(`${file}:${index + 1}: missing ${keyField}.`);
      }
      return key;
    });
    if (new Set(keys).size !== keys.length) throw new Error(`${file}: duplicate partition key.`);
    return [file, {
      path: file,
      sha256: sha256(contents[file]),
      rows: rows.length,
      key_field: keyField,
      key_set_sha256: keySetSha256(keys),
    }];
  })) as OntologyAuditManifest["partitions"];
}

function readFinalizationPartitionContents(absolute: string): FinalizationPartitionContents {
  return Object.fromEntries(FINALIZATION_PARTITION_FILES.map((file) => [
    file,
    readFileSync(join(absolute, file), "utf8"),
  ])) as FinalizationPartitionContents;
}

function refreshFinalizationCandidate({
  repoRoot,
  manifest,
  acceptance,
  partitions,
}: {
  repoRoot: string;
  manifest: OntologyAuditManifest;
  acceptance: OntologyAuditAcceptance;
  partitions: FinalizationPartitionContents;
}): OntologyAuditFinalizationCandidate {
  const refreshedManifest = structuredClone(manifest);
  refreshedManifest.baseline.counts.findings ??= 0;
  refreshedManifest.partitions = partitionDescriptors(refreshedManifest, partitions);
  refreshedManifest.schema = {
    implementation_path: refreshedManifest.schema.implementation_path,
    implementation_sha256: sha256(readFileSync(join(repoRoot, refreshedManifest.schema.implementation_path))),
  };
  refreshedManifest.protocol = {
    path: refreshedManifest.protocol.path,
    sha256: sha256(readFileSync(join(repoRoot, refreshedManifest.protocol.path))),
  };
  const manifestContent = prettyJson(refreshedManifest);
  const refreshedAcceptance = structuredClone(acceptance);
  refreshedAcceptance.manifest = { path: "manifest.json", sha256: sha256(manifestContent) };
  refreshedAcceptance.partitions = Object.fromEntries(FINALIZATION_PARTITION_FILES.map((file) => [file, {
    sha256: refreshedManifest.partitions[file].sha256,
    rows: refreshedManifest.partitions[file].rows,
    key_set_sha256: refreshedManifest.partitions[file].key_set_sha256,
  }])) as OntologyAuditAcceptance["partitions"];
  refreshedAcceptance.closure.unresolved_adjudications = parsedJsonlContent(
    "adjudications.jsonl",
    partitions["adjudications.jsonl"],
  ).filter((row) => row.state === "pending").length;
  return {
    acceptance: refreshedAcceptance,
    acceptanceContent: prettyJson(refreshedAcceptance),
    manifest: refreshedManifest,
    manifestContent,
    partitions,
  };
}

function equalKeySets(left: readonly string[], right: readonly string[]) {
  return canonicalJson([...new Set(left)].sort()) === canonicalJson([...new Set(right)].sort());
}

function validateCandidateLiveFinal(
  candidate: OntologyAuditFinalizationCandidate,
  live: ReturnType<typeof observeOntologyAuditLiveState>,
) {
  const comparisons: Array<[
    string,
    Array<{ key: string; final: unknown | null }>,
    Array<{ key: string; final: unknown | null }>,
  ]> = [
    ["records", parsedJsonlContent("record-units.jsonl", candidate.partitions["record-units.jsonl"]) as Array<{ key: string; final: unknown | null }>, live.rows.records],
    ["concept memberships", parsedJsonlContent("concept-membership-units.jsonl", candidate.partitions["concept-membership-units.jsonl"]) as Array<{ key: string; final: unknown | null }>, live.rows.concepts],
    ["graphs", parsedJsonlContent("graph-units.jsonl", candidate.partitions["graph-units.jsonl"]) as Array<{ key: string; final: unknown | null }>, live.rows.graphs],
  ];
  for (const [name, packageRows, liveRows] of comparisons) {
    const finalRows = packageRows.filter((row) => row.final !== null);
    if (!equalKeySets(finalRows.map((row) => row.key), liveRows.map((row) => row.key))) {
      throw new Error(`Staged ontology ${name} final key set differs from the live canonical set.`);
    }
    const liveByKey = new Map(liveRows.map((row) => [row.key, row.final]));
    for (const row of finalRows) {
      if (canonicalJson(row.final) !== canonicalJson(liveByKey.get(row.key))) {
        throw new Error(`Staged ontology ${row.key} final pointer differs from live canonical bytes.`);
      }
    }
  }
  const sources = parsedJsonlContent("source-units.jsonl", candidate.partitions["source-units.jsonl"]);
  if (!equalKeySets(
    sources.map((row) => String(row.key ?? "")),
    live.rows.sources.map((row) => row.key),
  )) {
    throw new Error("Staged ontology source-unit set differs from the live Greek source-unit set.");
  }
}

function validateFinalizationCandidate(
  candidate: OntologyAuditFinalizationCandidate,
  live: ReturnType<typeof observeOntologyAuditLiveState>,
) {
  const expectedDescriptors = partitionDescriptors(candidate.manifest, candidate.partitions);
  if (canonicalJson(candidate.manifest.partitions) !== canonicalJson(expectedDescriptors)) {
    throw new Error("Staged ontology manifest does not exactly describe its partition bytes.");
  }
  if (candidate.acceptance.snapshot_id !== candidate.manifest.snapshot_id) {
    throw new Error("Staged ontology acceptance snapshot differs from its manifest.");
  }
  if (candidate.acceptance.manifest.path !== "manifest.json" ||
    candidate.acceptance.manifest.sha256 !== sha256(candidate.manifestContent)) {
    throw new Error("Staged ontology acceptance does not bind its exact manifest bytes.");
  }
  for (const file of FINALIZATION_PARTITION_FILES) {
    const accepted = candidate.acceptance.partitions[file];
    const described = expectedDescriptors[file];
    if (accepted.sha256 !== described.sha256 || accepted.rows !== described.rows ||
      accepted.key_set_sha256 !== described.key_set_sha256) {
      throw new Error(`Staged ontology acceptance does not bind ${file}.`);
    }
  }
  validateCandidateLiveFinal(candidate, live);
  const adjudications = parsedJsonlContent("adjudications.jsonl", candidate.partitions["adjudications.jsonl"]);
  if (candidate.acceptance.closure.unresolved_adjudications !==
    adjudications.filter((row) => row.state === "pending").length) {
    throw new Error("Staged ontology unresolved-adjudication count is not derived from the partition.");
  }
  if (candidate.acceptance.state === "accepted") {
    if (candidate.manifest.audit_state !== "accepted" ||
      candidate.manifest.lane_states.some((lane) => lane.state !== (lane.count === 0 ? "zero_result" : "complete"))) {
      throw new Error("Staged accepted ontology retains a nonterminal manifest state.");
    }
    if (candidate.acceptance.final_corpus_digest !== live.corpusDigest) {
      throw new Error("Staged accepted ontology does not bind the independently observed live corpus digest.");
    }
    const closure = candidate.acceptance.closure;
    if (!candidate.acceptance.receipt || !closure.baseline_set_equal || !closure.final_set_equal ||
      !closure.source_passes_complete || !closure.reconciliations_complete || !closure.adjudications_complete ||
      closure.unresolved_adjudications !== 0 || closure.stale_aliases !== 0 || closure.rejected_reader_leaks !== 0 ||
      !closure.regeneration_one_sha256 || closure.regeneration_one_sha256 !== closure.regeneration_two_sha256) {
      throw new Error("Staged accepted ontology does not carry complete, zero-issue closure evidence.");
    }
    const sources = parsedJsonlContent("source-units.jsonl", candidate.partitions["source-units.jsonl"]);
    if (adjudications.some((row) => row.state !== "complete") || sources.some((row) => {
      const primary = row.primary as { state?: unknown } | undefined;
      const independent = row.independent as { state?: unknown } | undefined;
      const reconciliation = row.reconciliation as { state?: unknown } | undefined;
      return primary?.state !== "complete" || independent?.state !== "complete" || reconciliation?.state === "pending";
    })) {
      throw new Error("Staged accepted ontology retains incomplete review work.");
    }
  } else if (candidate.manifest.audit_state !== "pending" || candidate.acceptance.receipt !== null ||
    candidate.acceptance.final_corpus_digest !== null) {
    throw new Error("Staged pending ontology falsely claims terminal acceptance evidence.");
  }
}

function stageFinalizationCandidate({
  absolute,
  candidate,
  live,
  publicationFiles,
}: {
  absolute: string;
  candidate: OntologyAuditFinalizationCandidate;
  live: ReturnType<typeof observeOntologyAuditLiveState>;
  publicationFiles: readonly (FinalizationPartitionFile | "manifest.json")[];
}) {
  const contents = (name: FinalizationPartitionFile | "manifest.json" | "acceptance.json") =>
    name === "manifest.json"
      ? candidate.manifestContent
      : name === "acceptance.json"
        ? candidate.acceptanceContent
        : candidate.partitions[name];
  const staged = new Map<string, OntologyAuditFinalizationStagedFile>();
  try {
    for (const logicalName of [...publicationFiles, "acceptance.json" as const]) {
      const targetPath = join(absolute, logicalName);
      staged.set(logicalName, {
        logicalName,
        targetPath,
        stagedPath: writeDurableSibling(targetPath, contents(logicalName), "candidate"),
      });
    }
    const stagedPartitions = { ...candidate.partitions };
    for (const file of FINALIZATION_PARTITION_FILES) {
      const entry = staged.get(file);
      if (entry) stagedPartitions[file] = readFileSync(entry.stagedPath, "utf8");
    }
    const manifestEntry = staged.get("manifest.json");
    const acceptanceEntry = staged.get("acceptance.json")!;
    const stagedCandidate: OntologyAuditFinalizationCandidate = {
      partitions: stagedPartitions,
      manifestContent: manifestEntry ? readFileSync(manifestEntry.stagedPath, "utf8") : candidate.manifestContent,
      acceptanceContent: readFileSync(acceptanceEntry.stagedPath, "utf8"),
      manifest: JSON.parse(manifestEntry ? readFileSync(manifestEntry.stagedPath, "utf8") : candidate.manifestContent) as OntologyAuditManifest,
      acceptance: JSON.parse(readFileSync(acceptanceEntry.stagedPath, "utf8")) as OntologyAuditAcceptance,
    };
    validateFinalizationCandidate(stagedCandidate, live);
    return staged;
  } catch (error) {
    for (const entry of staged.values()) rmSync(entry.stagedPath, { force: true });
    throw error;
  }
}

export function mergeOntologyAuditPartition<T extends AuditedUnit>(
  baselineRows: readonly T[],
  liveRows: readonly T[],
): T[] {
  // A rebound package is already a baseline/final union. Only rows carrying a
  // frozen baseline pointer belong to the immutable side of the next union;
  // prior final-only rows must remain additions (or disappear if no longer
  // live), never become a synthetic baseline.
  const baselineByKey = new Map(
    baselineRows.filter((row) => row.baseline !== null).map((row) => [row.key, row]),
  );
  const liveByKey = new Map(liveRows.map((row) => [row.key, row]));
  return [...new Set([...baselineByKey.keys(), ...liveByKey.keys()])]
    .sort()
    .map((key) => {
      const baseline = baselineByKey.get(key);
      const live = liveByKey.get(key);
      const shape = live ?? baseline;
      if (!shape) throw new Error(`Cannot merge audit unit ${key}.`);
      const baselinePointer = baseline?.baseline ?? null;
      // The immutable baseline pointer preserves historical provenance. A key
      // absent from the live canonical set must have a null final pointer;
      // otherwise the audit package would manufacture a final record or edge
      // that the canonical corpus does not contain.
      const finalPointer = live?.final ?? null;
      const change = ontologyAuditChangeKind(baselinePointer, finalPointer);
      if (change === null) throw new Error(`Cannot classify audit unit ${key} without a baseline or final pointer.`);
      return {
        ...shape,
        baseline: baselinePointer,
        final: finalPointer,
        change,
        audit_state: "complete",
      } as T;
    });
}

function targetKind(row: AuditedUnit): OntologyAuditAdjudication["target_kind"] {
  if (row.kind === "record") return "record";
  if (row.kind === "edge") return "edge";
  return row.kind;
}

function adjudicationId(targetKey: string) {
  return `adjudication:${sha256(targetKey).slice(0, 24)}`;
}

function findingsByTarget(findings: readonly OntologyAuditFinding[]) {
  const result = new Map<string, OntologyAuditFinding[]>();
  for (const finding of findings) {
    for (const target of finding.target_keys) {
      const bucket = result.get(target) ?? [];
      bucket.push(finding);
      result.set(target, bucket);
    }
  }
  return result;
}

function readSemanticDecisions(packagePath: string) {
  const directory = join(packagePath, "review-inputs/semantic-remediation");
  const candidates = existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-decisions\.jsonl$/u.test(entry.name))
        .map((entry) => join(directory, entry.name))
        .sort()
    : [];
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one content-addressed semantic decision artifact, found ${candidates.length}.`);
  }
  const path = candidates[0]!;
  const decisions = new Map<string, SemanticDecision>();
  for (const row of readJsonl<SemanticDecision>(path)) {
    if (decisions.has(row.target_key)) throw new Error(`${path}: duplicate semantic decision for ${row.target_key}.`);
    decisions.set(row.target_key, row);
  }
  return decisions;
}

function vnextAxisKey(axisId: string) {
  return `axis:vnext:${axisId}`;
}

function vnextConceptKey(conceptId: string) {
  return `concept:vnext:${conceptId}`;
}

function vnextMembershipKey(membershipId: string) {
  return `membership:vnext:${membershipId}`;
}

export function finalMembershipReplacementKeys(
  finalMemberships: readonly { key: string; concept_key: string; observation_key: string }[],
  conceptKey: string,
  observationKey: string,
  semanticReplacementTargetKeys: readonly string[],
) {
  const candidateObservations = new Set([
    observationKey,
    ...semanticReplacementTargetKeys.filter((key) => key.startsWith("record:observation:")),
  ]);
  return finalMemberships
    .filter((entry) => entry.concept_key === conceptKey && candidateObservations.has(entry.observation_key))
    .map((entry) => entry.key)
    .sort();
}

function conceptDecisions(
  repoRoot: string,
  packagePath: string,
  finalConcepts: readonly OntologyAuditConceptUnit[],
  semantic: ReadonlyMap<string, SemanticDecision>,
) {
  const audit = readOntologyConceptAudit(join(packagePath, "review-inputs/concept-first"), { repoRoot });
  const result = new Map<string, { action: string; rationale: string; replacements: string[] }>();
  for (const row of audit.axes) {
    result.set(row.target_key, {
      action: row.decision,
      rationale: row.rationale,
      replacements: row.vnext ? [vnextAxisKey(row.vnext.axis_id)] : [],
    });
  }
  for (const row of audit.concepts) {
    result.set(row.target_key, {
      action: row.decision,
      rationale: row.rationale,
      replacements: [row.vnext, ...row.split_targets]
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .map((entry) => vnextConceptKey(entry.concept_id)),
    });
  }
  const finalMemberships = finalConcepts.filter((row): row is Extract<OntologyAuditConceptUnit, {
    kind: "membership";
    ontology_version: "vnext";
  }> => row.kind === "membership" && "ontology_version" in row);
  for (const row of audit.memberships) {
    const observationKey = `record:observation:${row.observation_id}`;
    const derivedReplacements = row.vnext_concept_id
      ? finalMembershipReplacementKeys(
          finalMemberships,
          vnextConceptKey(row.vnext_concept_id),
          observationKey,
          semantic.get(observationKey)?.replacement_target_keys ?? [],
        )
      : [];
    const explicitSplitReplacements = (row.replacement_membership_ids ?? [])
      .map((membershipId) => vnextMembershipKey(membershipId))
      .sort();
    if (
      row.decision === "split"
      && canonicalJson(explicitSplitReplacements) !== canonicalJson(derivedReplacements)
    ) {
      throw new Error(`${row.target_key}: explicit split replacements differ from live retained child memberships.`);
    }
    const replacements = row.decision === "split"
      ? explicitSplitReplacements
      : row.decision === "keep" || row.decision === "move"
        ? derivedReplacements
        : [];
    const action = row.decision;
    result.set(row.target_key, { action, rationale: row.rationale, replacements });
  }
  return result;
}

function strongestAction(
  findings: readonly OntologyAuditFinding[],
  change: NonNullable<ReturnType<typeof ontologyAuditChangeKind>>,
  finalStatus: string | null,
) {
  const proposed = new Set(findings.map((finding) => finding.proposed_action));
  if (finalStatus === "rejected") return "reject";
  if (change === "removed") return "retire";
  for (const action of ["reject", "retire", "split", "merge_duplicate", "retype", "revise"] as const) {
    if (proposed.has(action)) return action;
  }
  return change === "added" ? "add" : change === "modified" ? "revise" : "valid_as_is";
}

export function finalReviewStatus(row: AuditedUnit) {
  return row.kind === "record" && row.final ? row.final.review_status ?? null : null;
}

export function validateFinalAdjustmentCoverage({
  priorRows,
  rows,
  previous,
  finalAdjustments,
  preservedPriorTargets,
}: {
  priorRows: Pick<OntologyAuditRows, "records" | "graphs">;
  rows: Pick<OntologyAuditRows, "records" | "graphs">;
  previous: readonly OntologyAuditAdjudication[];
  finalAdjustments: ReadonlyMap<string, OntologyAuditFinalAdjustment>;
  preservedPriorTargets: ReadonlyMap<string, OntologyAuditFinalAdjustmentPriorTarget> | null;
}) {
  const priorUnits = new Map(
    [...priorRows.records, ...priorRows.graphs].map((row) => [row.key, row]),
  );
  const finalUnits = new Map(
    [...rows.records, ...rows.graphs].map((row) => [row.key, row]),
  );
  const priorAdjudications = new Map(previous.map((row) => [row.target_key, row]));
  const keys = [...new Set([...priorUnits.keys(), ...finalUnits.keys()])].sort();
  const consumed = new Set<string>();
  let preStateAdjustments = 0;
  let alreadyAppliedAdjustments = 0;

  for (const key of keys) {
    const prior = priorUnits.get(key);
    const final = finalUnits.get(key);
    const shape = final ?? prior;
    if (!shape || (shape.kind !== "record" && shape.kind !== "edge")) {
      throw new Error(`${key}: final adjustment coverage encountered a non-record/edge unit.`);
    }
    const priorFinal = prior?.final ?? null;
    const expectedFinal = final?.final ?? null;
    const expectedAction = expectedOntologyAuditFinalAdjustmentAction({
      kind: shape.kind,
      priorFinal,
      expectedFinal,
    });
    const adjustment = finalAdjustments.get(key);
    const priorAdjudication = priorAdjudications.get(key) ?? null;
    const preservedPrior = preservedPriorTargets?.get(key);
    const preservedAdjudication = preservedPrior?.superseded_adjudication !== null &&
      typeof preservedPrior?.superseded_adjudication === "object" &&
      !Array.isArray(preservedPrior.superseded_adjudication)
      ? preservedPrior.superseded_adjudication as OntologyAuditAdjudication
      : null;
    const expectedAdjudicationId = preservedAdjudication?.adjudication_id ?? adjudicationId(key);
    const expectedFindingIds = preservedAdjudication?.finding_ids ?? [];
    const preservedPriorMatches = adjustment !== undefined && preservedPrior !== undefined &&
      ontologyAuditFinalPointerSha256(preservedPrior.prior_final) === adjustment.prior_final_pointer_sha256 &&
      ontologyAuditAdjudicationSha256(preservedPrior.superseded_adjudication) === adjustment.superseded_adjudication_sha256;
    const alreadyApplied = adjustment !== undefined &&
      preservedPriorMatches &&
      ontologyAuditFinalPointerSha256(priorFinal) === adjustment.expected_final_pointer_sha256 &&
      ontologyAuditFinalPointerSha256(expectedFinal) === adjustment.expected_final_pointer_sha256 &&
      priorAdjudication?.target_key === key &&
      priorAdjudication.target_kind === shape.kind &&
      priorAdjudication.state === "complete" &&
      priorAdjudication.adjudication_id === expectedAdjudicationId &&
      canonicalJson(priorAdjudication.finding_ids) === canonicalJson(expectedFindingIds) &&
      priorAdjudication?.action === adjustment.action &&
      priorAdjudication.rationale === adjustment.rationale &&
      priorAdjudication.receipt_path === adjustment.receipt_path &&
      priorAdjudication.replacement_target_keys.length === 0;
    if (expectedAction === null) {
      if (adjustment && !alreadyApplied) {
        throw new Error(`${key}: unchanged prior/final core pointer has an unauthorized final adjustment.`);
      }
      if (alreadyApplied) {
        consumed.add(key);
        alreadyAppliedAdjustments += 1;
      }
      continue;
    }
    consumed.add(key);
    preStateAdjustments += 1;
    if (!adjustment) {
      throw new Error(`${key}: ${expectedAction} record/edge delta lacks an exact final adjustment.`);
    }
    if (!preservedPriorMatches) {
      throw new Error(`${key}: preserved prior pointer/adjudication does not prove the final adjustment.`);
    }
    if (adjustment.action !== expectedAction) {
      throw new Error(`${key}: final adjustment action ${adjustment.action} must be ${expectedAction}.`);
    }
    const priorPointerSha256 = ontologyAuditFinalPointerSha256(priorFinal);
    if (adjustment.prior_final_pointer_sha256 !== priorPointerSha256) {
      throw new Error(`${key}: prior final pointer hash drifted from the final adjustment.`);
    }
    const expectedPointerSha256 = ontologyAuditFinalPointerSha256(expectedFinal);
    if (adjustment.expected_final_pointer_sha256 !== expectedPointerSha256) {
      throw new Error(`${key}: expected final pointer hash drifted from the final adjustment.`);
    }
    const supersededAdjudicationSha256 = ontologyAuditAdjudicationSha256(
      priorAdjudication,
    );
    if (adjustment.superseded_adjudication_sha256 !== supersededAdjudicationSha256) {
      throw new Error(`${key}: superseded adjudication hash drifted from the final adjustment.`);
    }
  }

  const unrelated = [...finalAdjustments.keys()].filter((key) => !consumed.has(key)).sort();
  if (unrelated.length > 0) {
    throw new Error(`Final adjustments contain unchanged or unknown targets: ${unrelated.join(", ")}`);
  }
  if (preStateAdjustments > 0 && alreadyAppliedAdjustments > 0) {
    throw new Error("Final adjustments are partially applied; bind requires the exact pre-state or exact already-applied state.");
  }
  return {
    mode: preStateAdjustments > 0 ? "pre" : alreadyAppliedAdjustments > 0 ? "applied" : "none",
    adjustments: preStateAdjustments + alreadyAppliedAdjustments,
  } as const;
}

function validateFinalAdjustmentPriorPackageBindings({
  repoRoot,
  artifact,
}: {
  repoRoot: string;
  artifact: NonNullable<ReturnType<typeof readOntologyAuditFinalAdjustments>>;
}) {
  const acceptancePath = join(repoRoot, artifact.priorState.acceptance.path);
  const currentAcceptance = existsSync(acceptancePath) ? readFileSync(acceptancePath, "utf8") : null;
  const currentIsPreserved = currentAcceptance !== null &&
    sha256(currentAcceptance) === artifact.priorState.acceptance.sha256;
  const currentIsPendingTransition = currentAcceptance !== null && (() => {
    try {
      return (JSON.parse(currentAcceptance) as { state?: unknown }).state === "pending";
    } catch {
      return false;
    }
  })();
  const embeddedPriorIsValid = sha256(artifact.priorState.acceptance.text) ===
    artifact.priorState.acceptance.sha256 && (() => {
      try {
        return (JSON.parse(artifact.priorState.acceptance.text) as { state?: unknown }).state === "accepted";
      } catch {
        return false;
      }
    })();
  if (!currentIsPreserved && !(currentIsPendingTransition && embeddedPriorIsValid)) {
    throw new Error("Final-adjustment pre-bind acceptance.json differs from both the preserved accepted state and an explicit pending finalization transition.");
  }
  for (const partition of artifact.priorState.partitions) {
    const path = join(repoRoot, partition.source_path);
    if (!existsSync(path) || sha256(readFileSync(path)) !== partition.uncompressed_sha256) {
      throw new Error(`Final-adjustment pre-bind partition differs from preserved accepted state: ${partition.source_path}`);
    }
  }
}

function genericRationale(
  row: AuditedUnit,
  action: string,
  findings: readonly OntologyAuditFinding[],
) {
  const classes = [...new Set(findings.map((finding) => finding.defect_class))].sort();
  if (findings.length > 0) {
    return `${action} resolves ${findings.length} item-level finding(s) (${classes.join(", ")}) against the frozen source-first and record-first audit; the final pointer records the resulting canonical bytes or explicit retirement.`;
  }
  if (row.change === "added") {
    return "Added by the snapshot-bound hard-cut migration and re-observed in the final canonical set with one deterministic identity and no legacy alias.";
  }
  if (row.change === "removed") {
    return "Retired by the snapshot-bound hard cut; the baseline pointer remains as provenance and the final canonical set contains no stale peer representation.";
  }
  if (row.change === "modified") {
    return "Revised in the hard-cut migration and independently rebound to the final canonical bytes; no unresolved item-level finding remains.";
  }
  return "Re-observed byte-for-byte in the frozen and final canonical sets; both source passes and record-first review found no status-changing defect for this item.";
}

export function terminalAdjudications({
  priorRows,
  rows,
  previous,
  findings,
  semantic,
  concepts,
  finalAdjustments,
  requireFinalAdjustmentCoverage,
  preservedPriorTargets,
}: {
  priorRows: Pick<OntologyAuditRows, "records" | "graphs">;
  rows: OntologyAuditRows;
  previous: readonly OntologyAuditAdjudication[];
  findings: readonly OntologyAuditFinding[];
  semantic: ReadonlyMap<string, SemanticDecision>;
  concepts: ReadonlyMap<string, { action: string; rationale: string; replacements: string[] }>;
  finalAdjustments: ReadonlyMap<string, OntologyAuditFinalAdjustment>;
  requireFinalAdjustmentCoverage: boolean;
  preservedPriorTargets: ReadonlyMap<string, OntologyAuditFinalAdjustmentPriorTarget> | null;
}) {
  if (requireFinalAdjustmentCoverage || finalAdjustments.size > 0) {
    validateFinalAdjustmentCoverage({ priorRows, rows, previous, finalAdjustments, preservedPriorTargets });
  }
  const byTarget = findingsByTarget(findings);
  const previousByTarget = new Map(previous.map((row) => [row.target_key, row]));
  const units = [...rows.records, ...rows.concepts, ...rows.graphs];
  const unitKeys = new Set(units.map((row) => row.key));
  const finalUnitKeys = new Set(units.filter((row) => row.final !== null).map((row) => row.key));
  const consumedFinalAdjustments = new Set<string>();
  const decisions = units.map((row): OntologyAuditAdjudication => {
    const targetFindings = byTarget.get(row.key) ?? [];
    const semanticDecision = semantic.get(row.key);
    const conceptDecision = concepts.get(row.key);
    const finalAdjustment = finalAdjustments.get(row.key);
    const prior = previousByTarget.get(row.key);
    let action: string;
    let rationale: string;
    let replacements: string[];
    let receiptPath: string;

    if (finalAdjustment) {
      if (row.kind !== "record" && row.kind !== "edge") {
        throw new Error(`${row.key}: final adjustment does not target a record or edge.`);
      }
      action = finalAdjustment.action;
      rationale = finalAdjustment.rationale;
      replacements = [];
      receiptPath = finalAdjustment.receipt_path;
      consumedFinalAdjustments.add(row.key);
    } else if (conceptDecision) {
      action = conceptDecision.action;
      rationale = conceptDecision.rationale;
      replacements = conceptDecision.replacements;
      receiptPath = CONCEPT_RECEIPT;
    } else if (row.kind !== "record" && row.kind !== "edge" && "ontology_version" in row) {
      action = "add";
      rationale = genericRationale(row, action, targetFindings);
      replacements = [];
      receiptPath = CONCEPT_RECEIPT;
    } else if (semanticDecision) {
      action = semanticDecision.action;
      rationale = semanticDecision.rationale;
      replacements = semanticDecision.replacement_target_keys;
      receiptPath = SEMANTIC_RECEIPT;
    } else {
      action = strongestAction(targetFindings, row.change, finalReviewStatus(row));
      rationale = genericRationale(row, action, targetFindings);
      replacements = [];
      receiptPath = row.kind === "axis" || row.kind === "concept" || row.kind === "membership"
        ? CONCEPT_RECEIPT
        : SEMANTIC_RECEIPT;
    }

    if (["split", "merge_duplicate", "retype", "merge", "move"].includes(action) && replacements.length === 0) {
      if (row.final) replacements = [row.key];
      else throw new Error(`${row.key}: ${action} has no replacement target.`);
    }
    for (const replacement of replacements) {
      if (!unitKeys.has(replacement)) throw new Error(`${row.key}: replacement ${replacement} is absent from the final audit union.`);
      if (!finalUnitKeys.has(replacement)) {
        throw new Error(`${row.key}: replacement ${replacement} is a retired baseline item, not a live canonical target.`);
      }
    }

    return {
      adjudication_id: prior?.adjudication_id ?? adjudicationId(row.key),
      target_key: row.key,
      target_kind: targetKind(row),
      state: "complete",
      action,
      rationale,
      finding_ids: finalAdjustment
        ? [...(prior?.finding_ids ?? [])]
        : [...new Set([...targetFindings.map((finding) => finding.finding_id), ...(semanticDecision?.finding_ids ?? [])])].sort(),
      replacement_target_keys: [...new Set(replacements)].sort(),
      receipt_path: receiptPath,
    };
  });

  const unusedFinalAdjustments = [...finalAdjustments.keys()].filter((key) => !consumedFinalAdjustments.has(key));
  if (unusedFinalAdjustments.length > 0) {
    throw new Error(`Final adjustments reference unknown terminal targets: ${unusedFinalAdjustments.join(", ")}`);
  }

  // Reconciliation may add source-target adjudications. They are not part of
  // the required record/edge partitions, but their immutable ids are cited by
  // source-unit reconciliation and therefore remain first-class decisions.
  const sourceDecisions = previous
    .filter((row) => row.target_kind === "source")
    .map((row): OntologyAuditAdjudication => {
      if (row.state === "complete") return row;
      const targetFindings = byTarget.get(row.target_key) ?? [];
      const semanticDecision = semantic.get(row.target_key);
      const action = semanticDecision?.action
        ?? (targetFindings.some((finding) => finding.proposed_action === "add") ? "add" : "revise");
      const replacements = [...new Set(semanticDecision?.replacement_target_keys ?? [])].sort();
      for (const replacement of replacements) {
        if (!unitKeys.has(replacement) || !finalUnitKeys.has(replacement)) {
          throw new Error(`${row.target_key}: source remediation replacement ${replacement} is not a live canonical target.`);
        }
      }
      return {
        ...row,
        state: "complete",
        action,
        rationale: semanticDecision?.rationale ?? genericRationale(
          {
            key: row.target_key,
            kind: "record",
            lane: "source",
            stable_id: row.target_key,
            source: null,
            references: [],
            baseline: null,
            final: null,
            change: "modified",
            audit_state: "complete",
          },
          action,
          targetFindings,
        ),
        finding_ids: [...new Set([
          ...targetFindings.map((finding) => finding.finding_id),
          ...(semanticDecision?.finding_ids ?? []),
        ])].sort(),
        replacement_target_keys: replacements,
        receipt_path: SEMANTIC_RECEIPT,
      };
    });
  return [...decisions, ...sourceDecisions].sort((left, right) => left.target_key.localeCompare(right.target_key));
}

export function bindOntologyAuditFinalState({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath?: string;
} = {}) {
  const absolute = absolutePackagePath(repoRoot, packagePath);
  const baseline: OntologyAuditRows = {
    sources: readJsonl(join(absolute, "source-units.jsonl")),
    records: readJsonl(join(absolute, "record-units.jsonl")),
    concepts: readJsonl(join(absolute, "concept-membership-units.jsonl")),
    graphs: readJsonl(join(absolute, "graph-units.jsonl")),
    findings: readJsonl(join(absolute, "findings.jsonl")),
    adjudications: readJsonl(join(absolute, "adjudications.jsonl")),
  };
  const priorAcceptance = JSON.parse(
    readFileSync(join(absolute, "acceptance.json"), "utf8"),
  ) as OntologyAuditAcceptance;
  const priorManifest = JSON.parse(
    readFileSync(join(absolute, "manifest.json"), "utf8"),
  ) as OntologyAuditManifest;
  const finalAdjustmentArtifact = readOntologyAuditFinalAdjustments({ repoRoot, packagePath: absolute });
  const live = observeOntologyAuditLiveState(repoRoot);
  const rows: OntologyAuditRows = {
    sources: baseline.sources,
    records: mergeOntologyAuditPartition(baseline.records, live.rows.records),
    concepts: mergeOntologyAuditPartition(baseline.concepts, live.rows.concepts),
    graphs: mergeOntologyAuditPartition(baseline.graphs, live.rows.graphs),
    findings: baseline.findings,
    adjudications: [],
  };
  const semantic = readSemanticDecisions(absolute);
  const priorFinalAdjustmentState = reconcileOntologyAuditFinalAdjustmentState(
    priorAcceptance.final_adjustments,
    priorManifest.final_adjustments,
  );
  validateRequiredFinalAdjustmentArtifactBindings({
    absolute,
    state: priorFinalAdjustmentState,
    artifact: finalAdjustmentArtifact,
  });
  const finalAdjustments = finalAdjustmentArtifact?.decisions ?? new Map();
  const preservedPriorTargets = finalAdjustmentArtifact
    ? new Map(finalAdjustmentArtifact.priorState.targets.map((target) => [target.target_key, target]))
    : null;
  if (priorFinalAdjustmentState.required || finalAdjustments.size > 0) {
    const coverage = validateFinalAdjustmentCoverage({
      priorRows: baseline,
      rows,
      previous: baseline.adjudications,
      finalAdjustments,
      preservedPriorTargets,
    });
    if (coverage.mode === "pre") {
      if (!finalAdjustmentArtifact) throw new Error("Final-adjustment coverage cannot enter pre-bind mode without its durable artifact.");
      validateFinalAdjustmentPriorPackageBindings({ repoRoot, artifact: finalAdjustmentArtifact });
    }
  }
  rows.adjudications = terminalAdjudications({
    priorRows: baseline,
    rows,
    previous: baseline.adjudications,
    findings: rows.findings,
    semantic,
    finalAdjustments,
    requireFinalAdjustmentCoverage: priorFinalAdjustmentState.required,
    preservedPriorTargets,
    concepts: conceptDecisions(
      repoRoot,
      absolute,
      rows.concepts.filter((row) => row.final !== null),
      semantic,
    ),
  });

  const finalAdjustmentState = finalAdjustmentArtifact
    ? {
      required: true,
      decision_artifact: {
        path: relative(absolute, finalAdjustmentArtifact.artifactPath).split("\\").join("/"),
        sha256: finalAdjustmentArtifact.sha256,
      },
      prior_state_artifact: {
        path: relative(absolute, finalAdjustmentArtifact.priorStateArtifactPath).split("\\").join("/"),
        sha256: finalAdjustmentArtifact.priorStateSha256,
      },
      receipt: { path: finalAdjustmentArtifact.receiptPath, sha256: finalAdjustmentArtifact.receiptSha256 },
    }
    : priorFinalAdjustmentState;
  const partitions = readFinalizationPartitionContents(absolute);
  partitions["record-units.jsonl"] = renderJsonl(rows.records);
  partitions["concept-membership-units.jsonl"] = renderJsonl(rows.concepts);
  partitions["graph-units.jsonl"] = renderJsonl(rows.graphs);
  partitions["adjudications.jsonl"] = renderJsonl(rows.adjudications);
  const candidate = refreshFinalizationCandidate({
    repoRoot,
    manifest: pendingOntologyAuditManifest({ ...priorManifest, final_adjustments: finalAdjustmentState }),
    acceptance: pendingOntologyAuditAcceptance({ ...priorAcceptance, final_adjustments: finalAdjustmentState }),
    partitions,
  });
  validateFinalizationCandidate(candidate, live);
  const staged = stageFinalizationCandidate({
    absolute,
    candidate,
    live,
    publicationFiles: BIND_PUBLICATION_FILES,
  });
  const transitionAcceptance = pendingOntologyAuditAcceptance(priorAcceptance);
  publishOntologyAuditFinalizationCandidate({
    acceptancePath: join(absolute, "acceptance.json"),
    transitionAcceptanceContent: prettyJson(transitionAcceptance),
    payloads: BIND_PUBLICATION_FILES.map((file) => staged.get(file)!),
    finalAcceptance: staged.get("acceptance.json")!,
    // Binding commits only a pending marker. Its staged structural/live checks
    // above are the authority boundary; full accepted proof belongs to accept.
    verifyCandidate: () => sha256(readFileSync(staged.get("acceptance.json")!.stagedPath)),
    verifyPublished: () => {
      const issues = verifyOntologyAuditFinalBinding({ repoRoot, packagePath: absolute });
      if (issues.length > 0) {
        throw new Error(`Staged ontology final-state binding failed canonical verification:\n${formatOntologyAuditIssues(issues)}`);
      }
    },
  });
  return {
    packagePath: relative(repoRoot, absolute).split("\\").join("/"),
    live,
    rows,
    manifest: candidate.manifest,
    acceptance: candidate.acceptance,
  };
}

export function acceptOntologyAuditClosure({
  repoRoot = getRepoRoot(),
  packagePath,
  regenerationOneSha256,
  regenerationTwoSha256,
  staleAliases,
  rejectedReaderLeaks,
  receiptPath = CLOSURE_RECEIPT,
  siteDirectory,
  closureEvidenceProof,
}: {
  repoRoot?: string;
  packagePath?: string;
  regenerationOneSha256: string;
  regenerationTwoSha256: string;
  staleAliases: number;
  rejectedReaderLeaks: number;
  receiptPath?: string;
  siteDirectory?: string;
  closureEvidenceProof?: VerifiedOntologyClosureEvidenceProof;
}) {
  if (!/^[a-f0-9]{64}$/u.test(regenerationOneSha256) || !/^[a-f0-9]{64}$/u.test(regenerationTwoSha256)) {
    throw new Error("Regeneration digests must be SHA-256 values.");
  }
  if (regenerationOneSha256 !== regenerationTwoSha256) {
    throw new Error("Cannot accept ontology audit closure: deterministic regenerations differ.");
  }
  if (staleAliases !== 0 || rejectedReaderLeaks !== 0) {
    throw new Error("Cannot accept ontology audit closure with stale aliases or rejected-reader leakage.");
  }
  const absolute = absolutePackagePath(repoRoot, packagePath);
  const priorManifest = JSON.parse(readFileSync(join(absolute, "manifest.json"), "utf8")) as OntologyAuditManifest;
  const priorAcceptance = JSON.parse(readFileSync(join(absolute, "acceptance.json"), "utf8")) as OntologyAuditAcceptance;
  const partitions = readFinalizationPartitionContents(absolute);
  const rows = parsedJsonlContent("adjudications.jsonl", partitions["adjudications.jsonl"]);
  const sources = parsedJsonlContent("source-units.jsonl", partitions["source-units.jsonl"]);
  const unresolved = rows.filter((row) => row.state !== "complete").length;
  if (unresolved > 0) throw new Error(`Cannot accept ontology audit closure: ${unresolved} adjudications remain pending.`);
  if (sources.some((row) =>
    (row.primary as { state?: unknown } | undefined)?.state !== "complete" ||
    (row.independent as { state?: unknown } | undefined)?.state !== "complete"
  )) {
    throw new Error("Cannot accept ontology audit closure: source passes remain pending.");
  }
  if (sources.some((row) => (row.reconciliation as { state?: unknown } | undefined)?.state === "pending")) {
    throw new Error("Cannot accept ontology audit closure: source reconciliations remain pending.");
  }
  const receiptAbsolute = join(repoRoot, receiptPath);
  if (!existsSync(receiptAbsolute)) throw new Error(`Closure receipt is missing: ${receiptPath}`);
  const live = observeOntologyAuditLiveState(repoRoot);
  const terminalManifest = terminalOntologyAuditManifest(priorManifest);
  const acceptance = structuredClone(priorAcceptance);
  acceptance.state = "accepted";
  acceptance.final_corpus_digest = live.corpusDigest;
  acceptance.receipt = { path: receiptPath, sha256: sha256(readFileSync(receiptAbsolute)) };
  acceptance.closure = {
    baseline_set_equal: true,
    final_set_equal: true,
    source_passes_complete: true,
    reconciliations_complete: true,
    adjudications_complete: true,
    unresolved_adjudications: 0,
    stale_aliases: staleAliases,
    rejected_reader_leaks: rejectedReaderLeaks,
    regeneration_one_sha256: regenerationOneSha256,
    regeneration_two_sha256: regenerationTwoSha256,
  };
  const candidate = refreshFinalizationCandidate({
    repoRoot,
    manifest: terminalManifest,
    acceptance,
    partitions,
  });
  validateFinalizationCandidate(candidate, live);
  const staged = stageFinalizationCandidate({
    absolute,
    candidate,
    live,
    publicationFiles: ["manifest.json"],
  });
  const acceptedReceipt = candidate.acceptance.receipt;
  if (!acceptedReceipt) {
    throw new Error("Accepted ontology closure candidate lost its receipt binding.");
  }
  const publishedBindings = [
    {
      path: join(absolute, "acceptance.json"),
      sha256: sha256(candidate.acceptanceContent),
    },
    {
      path: join(absolute, candidate.acceptance.manifest.path),
      sha256: candidate.acceptance.manifest.sha256,
    },
    ...FINALIZATION_PARTITION_FILES.map((file) => ({
      path: join(absolute, file),
      sha256: candidate.acceptance.partitions[file].sha256,
    })),
    {
      path: join(repoRoot, acceptedReceipt.path),
      sha256: acceptedReceipt.sha256,
    },
  ];
  publishOntologyAuditFinalizationCandidate({
    acceptancePath: join(absolute, "acceptance.json"),
    transitionAcceptanceContent: prettyJson(pendingOntologyAuditAcceptance(priorAcceptance)),
    payloads: [staged.get("manifest.json")!],
    finalAcceptance: staged.get("acceptance.json")!,
    verifyCandidate: () => {
      const stagedAcceptanceContent = readFileSync(staged.get("acceptance.json")!.stagedPath, "utf8");
      const issues = verifyOntologyAuditAcceptanceCandidate({
        repoRoot,
        packagePath: absolute,
        acceptanceContent: stagedAcceptanceContent,
        ...(siteDirectory === undefined ? {} : { siteDirectory }),
        ...(closureEvidenceProof === undefined ? {} : { closureEvidenceProof }),
      });
      if (issues.length > 0) {
        throw new Error(`Accepted ontology closure candidate failed canonical verification:\n${formatOntologyAuditIssues(issues)}`);
      }
      return sha256(stagedAcceptanceContent);
    },
    verifyPublished: () => {
      // The exact staged acceptance bytes and every semantic dependency were
      // fully verified while the durable authority marker was pending. After
      // its atomic rename, bounded streaming readback proves that the published
      // marker and all files it directly binds are still those verified bytes;
      // reparsing the whole corpus here would repeat the same semantic proof in
      // an allocator-saturated process without strengthening the commit point.
      verifyOntologyAuditPublishedFileBindings(publishedBindings);
    },
  });
  return { acceptance: candidate.acceptance, live };
}

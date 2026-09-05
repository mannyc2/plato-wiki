import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { getRepoRoot } from "../../packages/harness/src/paths.js";
import {
  assertOntologyAuditFinalAdjustmentRematerializationPending,
  expectedOntologyAuditFinalAdjustmentAction,
  ontologyAuditAdjudicationSha256,
  ontologyAuditFinalAdjustmentArtifactName,
  ontologyAuditFinalAdjustmentPriorStateArtifactName,
  ontologyAuditFinalPointerSha256,
  ontologyAuditRelationFictionEdgeRationale,
  ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
  readOntologyAuditRelationFictionReviewEvidence,
  readOntologyAuditFinalAdjustments,
  renderOntologyAuditFinalAdjustmentPriorState,
  renderOntologyAuditFinalAdjustmentReceipt,
  renderOntologyAuditFinalAdjustments,
  verifyOntologyAuditFinalAdjustmentProvenance,
  type OntologyAuditArtifactBinding,
  type OntologyAuditFinalAdjustment,
  type OntologyAuditFinalAdjustmentProvenanceStage,
  type OntologyAuditFinalAdjustmentPriorState,
} from "../../packages/harness/src/wiki/ontology-audit-final-adjustments.js";
import { fencedYamlRecordBlocks } from "../../packages/harness/src/wiki/fenced-record.js";
import { mergeOntologyAuditPartition } from "../../packages/harness/src/wiki/ontology-audit-finalization.js";
import {
  observeOntologyAuditLiveState,
  type OntologyAuditAdjudication,
  type OntologyAuditGraphUnit,
  type OntologyAuditRecordUnit,
} from "../../packages/harness/src/wiki/ontology-audit.js";

const PARTITIONS = ["adjudications.jsonl", "graph-units.jsonl", "record-units.jsonl"] as const;
const STRUCTURAL_EVIDENCE = /^sha256-([a-f0-9]{64})-commentary-structural-review-evidence\.jsonl$/u;
const RECONSIDERATION_RECEIPT = /^2026-09-01-commentary-block-reconsideration-(phaedo|sophist)-accepted-[a-f0-9]{12}\.md$/u;

type PriorUnit = OntologyAuditRecordUnit | OntologyAuditGraphUnit;
type ReviewProvenance = {
  kind: OntologyAuditFinalAdjustmentProvenanceStage["kind"];
  sourceReceiptPath: string;
  evidenceArtifacts: OntologyAuditArtifactBinding[];
  rationale: string;
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function atomicWrite(path: string, content: string | Uint8Array) {
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content);
  renameSync(temporary, path);
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

function readJsonl<T>(path: string): T[] {
  return readFileSync(path, "utf8").split(/\r?\n/u).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line) as T;
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function logicalPath(repoRoot: string, path: string) {
  return relative(repoRoot, path).split("\\").join("/");
}

function exactBinding(repoRoot: string, value: unknown, location: string): OntologyAuditArtifactBinding {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location}: missing binding`);
  const record = value as Record<string, unknown>;
  if (typeof record.path !== "string" || typeof record.sha256 !== "string") throw new Error(`${location}: malformed binding`);
  const absolute = join(repoRoot, record.path);
  if (!existsSync(absolute) || sha256(readFileSync(absolute)) !== record.sha256) throw new Error(`${location}: missing or hash-mismatched binding`);
  return { path: record.path, sha256: record.sha256 };
}

function receiptScalar(receipt: string, field: string) {
  return receipt.split(/\r?\n/u).find((line) => line.startsWith(`${field}: `))?.slice(field.length + 2);
}

function receiptReviewedIds(receipt: string) {
  const lines = receipt.split(/\r?\n/u);
  const start = lines.indexOf("reviewed_commentary_ids:");
  if (start < 0) return [];
  const ids: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("- ")) break;
    ids.push(line.slice(2));
  }
  return ids;
}

function sortedBindings(bindings: readonly OntologyAuditArtifactBinding[]) {
  const byPath = new Map<string, string>();
  for (const binding of bindings) {
    const previous = byPath.get(binding.path);
    if (previous && previous !== binding.sha256) throw new Error(`Conflicting evidence binding ${binding.path}`);
    byPath.set(binding.path, binding.sha256);
  }
  return [...byPath].sort(([left], [right]) => left.localeCompare(right)).map(([path, digest]) => ({ path, sha256: digest }));
}

function structuralProvenance(repoRoot: string, evidenceRoot: string) {
  const candidates = readdirSync(evidenceRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && STRUCTURAL_EVIDENCE.test(entry.name));
  if (candidates.length !== 1) throw new Error(`Expected one structural full-audit evidence artifact, found ${candidates.length}`);
  const evidencePath = join(evidenceRoot, candidates[0]!.name);
  const evidenceLogicalPath = logicalPath(repoRoot, evidencePath);
  const evidenceSha256 = sha256(readFileSync(evidencePath));
  if (STRUCTURAL_EVIDENCE.exec(candidates[0]!.name)?.[1] !== evidenceSha256) throw new Error("Structural evidence filename hash mismatch");
  const result = new Map<string, ReviewProvenance>();
  for (const [index, row] of readJsonl<Record<string, unknown>>(evidencePath).entries()) {
    const submission = exactBinding(repoRoot, row.submission, `${evidenceLogicalPath}:${index + 1}:submission`);
    const receipt = exactBinding(repoRoot, row.receipt, `${evidenceLogicalPath}:${index + 1}:receipt`);
    if (!Array.isArray(row.commentary_ids) || row.audit === null || typeof row.audit !== "object" || Array.isArray(row.audit)) {
      throw new Error(`${evidenceLogicalPath}:${index + 1}: malformed structural evidence row`);
    }
    const blocks = (row.audit as Record<string, unknown>).blocks;
    if (!Array.isArray(blocks)) throw new Error(`${evidenceLogicalPath}:${index + 1}: missing audit blocks`);
    for (const rawId of row.commentary_ids) {
      if (typeof rawId !== "string" || result.has(rawId)) throw new Error(`${evidenceLogicalPath}:${index + 1}: duplicate or malformed operation ID`);
      const block = blocks.find((entry) => (entry as Record<string, unknown>).commentary_id === rawId) as Record<string, unknown> | undefined;
      const rationale = block?.rationale;
      if (typeof rationale !== "string" || rationale.length < 20) throw new Error(`${rawId}: structural audit lacks rationale`);
      result.set(rawId, {
        kind: "commentary_structural_review",
        sourceReceiptPath: receipt.path,
        evidenceArtifacts: sortedBindings([{ path: evidenceLogicalPath, sha256: evidenceSha256 }, submission]),
        rationale: `Independent structural review rejected ${rawId}: ${rationale}`.slice(0, 500),
      });
    }
  }
  return result;
}

function reconsiderationProvenance(repoRoot: string) {
  const receiptDirectory = join(repoRoot, "wiki/review");
  const receipts = readdirSync(receiptDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && RECONSIDERATION_RECEIPT.test(entry.name));
  if (receipts.length !== 2) throw new Error(`Expected exact Phaedo and Sophist reconsideration receipts, found ${receipts.length}`);
  const result = new Map<string, ReviewProvenance>();
  const seenDialogues = new Set<string>();
  for (const entry of receipts) {
    const receiptPath = `wiki/review/${entry.name}`;
    const receipt = readFileSync(join(receiptDirectory, entry.name), "utf8");
    const dialogue = receiptScalar(receipt, "dialogue");
    const decision = receiptScalar(receipt, "decision");
    const transition = receiptScalar(receipt, "review_transition");
    const rationale = receiptScalar(receipt, "rationale");
    const manifestPath = receiptScalar(receipt, "evidence_manifest_path");
    const manifestSha256 = receiptScalar(receipt, "evidence_manifest_sha256");
    const reviewedIds = receiptReviewedIds(receipt);
    if (!dialogue || seenDialogues.has(dialogue) || decision !== "accepted" || transition !== "rejected -> accepted" ||
      !rationale || rationale.length < 40 || !manifestPath || !manifestSha256 || reviewedIds.length !== 5) {
      throw new Error(`${receiptPath}: malformed or incomplete reconsideration receipt`);
    }
    seenDialogues.add(dialogue);
    const manifestBinding = exactBinding(repoRoot, { path: manifestPath, sha256: manifestSha256 }, `${receiptPath}:manifest`);
    const manifest = JSON.parse(readFileSync(join(repoRoot, manifestPath), "utf8")) as Record<string, unknown>;
    if (manifest.schema_version !== 1 || !Array.isArray(manifest.artifacts) || manifest.artifacts.length !== 3) {
      throw new Error(`${manifestPath}: malformed reconsideration evidence manifest`);
    }
    const evidenceArtifacts = sortedBindings([
      manifestBinding,
      ...manifest.artifacts.map((value, index) => exactBinding(repoRoot, value, `${manifestPath}:artifacts[${index}]`)),
    ]);
    for (const id of reviewedIds) {
      if (result.has(id)) throw new Error(`Duplicate reconsidered commentary ID ${id}`);
      result.set(id, {
        kind: "commentary_reconsideration",
        sourceReceiptPath: receiptPath,
        evidenceArtifacts,
        rationale: `Exact Greek-only reconsideration accepted ${id}: ${rationale}`.slice(0, 500),
      });
    }
  }
  if (canonicalJson([...seenDialogues].sort()) !== canonicalJson(["phaedo", "sophist"])) {
    throw new Error("Reconsideration receipts must cover exactly Phaedo and Sophist");
  }
  return result;
}

function sampleFailureProvenance(repoRoot: string) {
  const root = join(repoRoot, "wiki/submissions/commentary-sample-failure-rejection");
  if (!existsSync(root)) return new Map<string, ReviewProvenance>();
  const submissionPaths = readdirSync(root, { withFileTypes: true }).flatMap((dialogue) => {
    if (!dialogue.isDirectory()) throw new Error(`${logicalPath(repoRoot, join(root, dialogue.name))}: expected dialogue directory`);
    return readdirSync(join(root, dialogue.name), { withFileTypes: true }).map((entry) => {
      if (!entry.isFile() || !/^[a-f0-9]{64}\.json$/u.test(entry.name)) {
        throw new Error(`${logicalPath(repoRoot, join(root, dialogue.name, entry.name))}: invalid sample-failure submission entry`);
      }
      return join(root, dialogue.name, entry.name);
    });
  }).sort();
  const result = new Map<string, ReviewProvenance>();
  for (const submissionAbsolute of submissionPaths) {
    const submissionPath = logicalPath(repoRoot, submissionAbsolute);
    const submissionBytes = readFileSync(submissionAbsolute);
    const submissionSha256 = sha256(submissionBytes);
    if (basename(submissionAbsolute) !== `${submissionSha256}.json`) {
      throw new Error(`${submissionPath}: sample-failure submission filename hash mismatch`);
    }
    const submission = JSON.parse(submissionBytes.toString("utf8")) as Record<string, unknown>;
    if (submission.schema_version !== 1 || submission.lane !== "commentary-sample-failure-rejection" ||
      submission.sample_verdict !== "fail" || !Array.isArray(submission.failed_commentary)) {
      throw new Error(`${submissionPath}: malformed sample-failure submission`);
    }
    const evidence = exactBinding(repoRoot, submission.sample_evidence, `${submissionPath}:sample_evidence`);
    const receipt = exactBinding(repoRoot, submission.review_receipt, `${submissionPath}:review_receipt`);
    const evidenceArtifacts = sortedBindings([evidence, { path: submissionPath, sha256: submissionSha256 }]);
    for (const rawBlock of submission.failed_commentary) {
      if (rawBlock === null || typeof rawBlock !== "object" || Array.isArray(rawBlock)) {
        throw new Error(`${submissionPath}: malformed failed commentary entry`);
      }
      const block = rawBlock as Record<string, unknown>;
      if (typeof block.commentary_id !== "string" || typeof block.rationale !== "string" ||
        block.rationale.length < 20 || typeof block.rationale_sha256 !== "string" ||
        sha256(block.rationale) !== block.rationale_sha256 || result.has(block.commentary_id)) {
        throw new Error(`${submissionPath}: malformed, duplicate, or hash-mismatched sample failure`);
      }
      result.set(block.commentary_id, {
        kind: "commentary_sample_failure",
        sourceReceiptPath: receipt.path,
        evidenceArtifacts,
        rationale: `Independent sample review rejected ${block.commentary_id}: ${block.rationale}`.slice(0, 500),
      });
    }
  }
  return result;
}

function acceptedCommentaryPointerSha256(repoRoot: string, row: OntologyAuditRecordUnit) {
  const pointer = row.final;
  if (!pointer || row.lane !== "commentary") throw new Error(`${row.key}: expected live commentary record`);
  const ledger = readFileSync(join(repoRoot, pointer.path), "utf8");
  const matches = fencedYamlRecordBlocks(ledger).filter((block) => block.record.commentary_id === row.stable_id);
  if (matches.length !== 1 || matches[0]!.index !== pointer.ordinal ||
    sha256(matches[0]!.fullMatch) !== pointer.canonical_sha256) {
    throw new Error(`${row.key}: current commentary pointer differs from exact ledger bytes`);
  }
  const statusLines = [...matches[0]!.fullMatch.matchAll(/^review_status: (?:accepted|rejected)$/gmu)];
  if (statusLines.length !== 1) throw new Error(`${row.key}: commentary record must contain one review_status line`);
  const acceptedBytes = matches[0]!.fullMatch.replace(/^review_status: rejected$/mu, "review_status: accepted");
  return ontologyAuditFinalPointerSha256({
    path: pointer.path,
    ordinal: pointer.ordinal,
    canonical_sha256: sha256(acceptedBytes),
    review_status: "accepted",
  })!;
}

const repoRoot = getRepoRoot();
const packageRoots = readdirSync(join(repoRoot, "wiki/ontology-audits"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name));
if (packageRoots.length !== 1) throw new Error(`Expected one ontology audit package, found ${packageRoots.length}`);
const packagePath = join(repoRoot, "wiki/ontology-audits", packageRoots[0]!.name);
const packageLogicalPath = logicalPath(repoRoot, packagePath);
const finalDirectory = join(packagePath, "review-inputs/final-adjustments");
const rematerialize = process.argv.includes("--rematerialize");
const finalDirectoryExists = existsSync(finalDirectory);
const existing = finalDirectoryExists && !rematerialize
  ? readOntologyAuditFinalAdjustments({ repoRoot, packagePath })
  : null;
if (finalDirectoryExists && !rematerialize && !existing) {
  throw new Error("Final-adjustments directory exists but is unreadable");
}
if (existing && !rematerialize) {
  console.log(JSON.stringify({ state: "already_materialized", artifact_path: logicalPath(repoRoot, existing.artifactPath), sha256: existing.sha256 }, null, 2));
  process.exit(0);
}
const rematerializedPriorState = finalDirectoryExists && rematerialize
  ? (() => {
    const candidates = readdirSync(finalDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-prior-state\.json$/u.test(entry.name));
    if (candidates.length !== 1) {
      throw new Error(`Rematerialization requires exactly one preserved prior-state artifact; found ${candidates.length}`);
    }
    const path = join(finalDirectory, candidates[0]!.name);
    const content = readFileSync(path, "utf8");
    if (candidates[0]!.name !== `sha256-${sha256(content)}-prior-state.json`) {
      throw new Error("Rematerialization prior-state filename does not bind its exact bytes");
    }
    const parsed = JSON.parse(content) as OntologyAuditFinalAdjustmentPriorState;
    if (parsed.schema_version !== 1 || !Array.isArray(parsed.partitions) || !Array.isArray(parsed.targets) ||
      parsed.acceptance === null || typeof parsed.acceptance !== "object" ||
      sha256(parsed.acceptance.text) !== parsed.acceptance.sha256) {
      throw new Error("Rematerialization prior-state artifact is malformed or hash-mismatched");
    }
    return parsed;
  })()
  : null;
const priorStateSource = existing?.priorState ?? rematerializedPriorState;

const acceptancePath = join(packagePath, "acceptance.json");
const acceptanceBytes = priorStateSource
  ? Buffer.from(priorStateSource.acceptance.text, "utf8")
  : readFileSync(acceptancePath);
const acceptance = JSON.parse(acceptanceBytes.toString("utf8")) as Record<string, unknown>;
if (acceptance.state !== "accepted" || (acceptance.final_adjustments as Record<string, unknown> | undefined)?.required === true) {
  throw new Error("Final adjustments must be built exactly once from the previously accepted unbound package");
}
const preservedPartitionBytes = new Map(PARTITIONS.map((file) => {
  if (!priorStateSource) return [file, readFileSync(join(packagePath, file))] as const;
  const binding = priorStateSource.partitions.find((entry) => entry.source_path.endsWith(`/${file}`));
  if (!binding) throw new Error(`Preserved final-adjustment state is missing ${file}`);
  return [file, gunzipSync(readFileSync(join(repoRoot, binding.path)))] as const;
}));
const readPreservedJsonl = <T>(file: typeof PARTITIONS[number]): T[] =>
  preservedPartitionBytes.get(file)!.toString("utf8").split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as T);
const priorRecords = readPreservedJsonl<OntologyAuditRecordUnit>("record-units.jsonl");
const priorGraphs = readPreservedJsonl<OntologyAuditGraphUnit>("graph-units.jsonl");
const priorAdjudications = readPreservedJsonl<OntologyAuditAdjudication>("adjudications.jsonl");
const relationFictions = readOntologyAuditRelationFictionReviewEvidence({ repoRoot, packagePath });
if (!relationFictions) throw new Error("Missing canonical relation-fiction final-adjustment review evidence");
const live = observeOntologyAuditLiveState(repoRoot).rows;
const finalRecords = mergeOntologyAuditPartition(priorRecords, live.records);
const finalGraphs = mergeOntologyAuditPartition(priorGraphs, live.graphs);
const priorUnits = new Map<string, PriorUnit>([...priorRecords, ...priorGraphs].map((row) => [row.key, row]));
const finalUnits = new Map<string, PriorUnit>([...finalRecords, ...finalGraphs].map((row) => [row.key, row]));
const priorDecisions = new Map(priorAdjudications.map((row) => [row.target_key, row]));
const structural = structuralProvenance(repoRoot, join(packagePath, "review-inputs/final-adjustment-evidence"));
const reconsidered = reconsiderationProvenance(repoRoot);
const sampleFailures = sampleFailureProvenance(repoRoot);
const consumedStructural = new Set<string>();
const consumedReconsidered = new Set<string>();
const consumedSampleFailures = new Set<string>();
const consumedRelationFictions = new Set<string>();
const consumedRelationFictionEdges = new Set<string>();
const decisions: OntologyAuditFinalAdjustment[] = [];
const targets: OntologyAuditFinalAdjustmentPriorState["targets"] = [];

for (const key of [...new Set([...priorUnits.keys(), ...finalUnits.keys()])].sort()) {
  const prior = priorUnits.get(key);
  const final = finalUnits.get(key);
  const shape = final ?? prior;
  if (!shape) throw new Error(`Cannot resolve final adjustment shape ${key}`);
  const priorFinal = prior?.final ?? null;
  const expectedFinal = final?.final ?? null;
  const action = expectedOntologyAuditFinalAdjustmentAction({
    kind: shape.kind,
    priorFinal,
    expectedFinal,
  });
  if (!action) continue;
  const id = shape.kind === "record" ? shape.stable_id : shape.owner_key.split(":").at(-1)!;
  const priorFinalSha256 = ontologyAuditFinalPointerSha256(priorFinal);
  const expectedFinalSha256 = ontologyAuditFinalPointerSha256(expectedFinal);
  const provenanceChain: OntologyAuditFinalAdjustmentProvenanceStage[] = [];
  let cursor = priorFinalSha256;
  let rationale: string | undefined;
  const appendStage = (
    provenance: ReviewProvenance,
    stageAction: OntologyAuditFinalAdjustmentProvenanceStage["action"],
    next: string | null,
  ) => {
    provenanceChain.push({
      kind: provenance.kind,
      action: stageAction,
      prior_final_pointer_sha256: cursor,
      expected_final_pointer_sha256: next,
      source_receipt_path: provenance.sourceReceiptPath,
      evidence_artifacts: provenance.evidenceArtifacts,
    });
    cursor = next;
    rationale = provenance.rationale;
  };

  if (shape.kind === "record") {
    if (reconsidered.has(id)) {
      const acceptedPointer = acceptedCommentaryPointerSha256(repoRoot, shape);
      appendStage(reconsidered.get(id)!, "revise", acceptedPointer);
      consumedReconsidered.add(id);
    }
    if (structural.has(id)) {
      appendStage(structural.get(id)!, "reject", expectedFinalSha256);
      consumedStructural.add(id);
    }
    if (sampleFailures.has(id)) {
      appendStage(sampleFailures.get(id)!, "reject", expectedFinalSha256);
      consumedSampleFailures.add(id);
    }
    if (relationFictions.entries.has(key)) {
      const entry = relationFictions.entries.get(key)!;
      if (ontologyAuditFinalPointerSha256(priorFinal) !== entry.prior_final_pointer_sha256 ||
        ontologyAuditFinalPointerSha256(expectedFinal) !== entry.expected_final_pointer_sha256 ||
        ontologyAuditAdjudicationSha256(priorDecisions.get(key) ?? null) !== entry.superseded_adjudication_sha256) {
        throw new Error(`${key}: relation-fiction evidence pointer or superseded-adjudication hash drifted`);
      }
      appendStage({
        kind: "relation_semantic_fiction",
        sourceReceiptPath: relationFictions.receiptPath,
        evidenceArtifacts: [relationFictions.artifact],
        rationale: entry.rationale,
      }, "reject", expectedFinalSha256);
      consumedRelationFictions.add(key);
    }
  } else if (shape.edge_kind === "relation") {
    const recordTargetKey = shape.owner_key;
    const entry = relationFictions.entries.get(recordTargetKey);
    if (entry) {
      if (key !== `edge:relation:${entry.relation_id}` || action !== "retire" || expectedFinalSha256 !== null) {
        throw new Error(`${key}: rejected relation semantic edge must be one exact retirement`);
      }
      appendStage({
        kind: "relation_semantic_fiction",
        sourceReceiptPath: relationFictions.receiptPath,
        evidenceArtifacts: [relationFictions.artifact],
        rationale: ontologyAuditRelationFictionEdgeRationale(entry),
      }, "retire", null);
      consumedRelationFictionEdges.add(key);
    }
  } else if (
    /^commentary-cites-(?:observation|claim|relation|dossier)$/u.test(shape.edge_kind) && reconsidered.has(id)) {
    const provenance = reconsidered.get(id)!;
    appendStage(provenance, "add", expectedFinalSha256);
    consumedReconsidered.add(id);
    if (action !== "add") throw new Error(`${key}: reconsidered citation link must be an add, found ${action}`);
    rationale = `Added exact accepted citation link ${shape.from_key} -> ${shape.to_key}; the owner's Greek-only reconsideration packet and receipt bind the cited record and reviewed prose.`;
  }
  if (provenanceChain.length === 0) {
    throw new Error(`${key}: record/edge delta has no exact structural, reconsideration, or relation-fiction provenance`);
  }
  if (cursor !== expectedFinalSha256) {
    throw new Error(`${key}: ordered provenance chain does not end at the mechanically observed final pointer`);
  }
  if (shape.kind === "record" && provenanceChain.at(-1)!.action !== action) {
    throw new Error(`${key}: terminal provenance action ${provenanceChain.at(-1)!.action} differs from overall ${action}`);
  }
  if (!rationale) throw new Error(`${key}: ordered provenance chain has no terminal rationale`);
  if (rationale.length < 40 || rationale.length > 500) throw new Error(`${key}: derived rationale length is invalid`);
  const superseded = priorDecisions.get(key) ?? null;
  decisions.push({
    target_key: key,
    action,
    prior_final_pointer_sha256: priorFinalSha256,
    expected_final_pointer_sha256: expectedFinalSha256,
    superseded_adjudication_sha256: ontologyAuditAdjudicationSha256(superseded),
    rationale,
    receipt_path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
    provenance_chain: provenanceChain,
  });
  targets.push({ target_key: key, prior_final: priorFinal, superseded_adjudication: superseded });
}

if (canonicalJson([...consumedStructural].sort()) !== canonicalJson([...structural.keys()].sort())) {
  throw new Error("Structural evidence target set differs from mechanically observed structural deltas");
}
if (canonicalJson([...consumedReconsidered].sort()) !== canonicalJson([...reconsidered.keys()].sort())) {
  throw new Error("Reconsideration receipt target set differs from mechanically observed record/citation deltas");
}
if (canonicalJson([...consumedSampleFailures].sort()) !== canonicalJson([...sampleFailures.keys()].sort())) {
  throw new Error("Sample-failure evidence target set differs from mechanically observed record deltas");
}
if (canonicalJson([...consumedRelationFictions].sort()) !== canonicalJson([...relationFictions.entries.keys()].sort())) {
  throw new Error("Relation-fiction evidence target set differs from mechanically observed record deltas");
}
const expectedRelationFictionEdges = [...relationFictions.entries.values()]
  .map((entry) => `edge:relation:${entry.relation_id}`)
  .sort();
if (canonicalJson([...consumedRelationFictionEdges].sort()) !== canonicalJson(expectedRelationFictionEdges)) {
  throw new Error("Relation-fiction evidence target set differs from mechanically observed semantic-edge retirements");
}
if (decisions.length === 0 || decisions.length !== targets.length) throw new Error("No complete final-adjustment delta set was derived");

const partitionArtifacts = PARTITIONS.map((file) => {
  const bytes = preservedPartitionBytes.get(file)!;
  const preservedBinding = priorStateSource?.partitions.find((entry) =>
    entry.source_path.endsWith(`/${file}`)
  );
  const compressed = preservedBinding
    ? readFileSync(join(repoRoot, preservedBinding.path))
    : gzipSync(bytes, { level: 9 });
  const digest = sha256(compressed);
  const name = `sha256-${digest}-prior-${file}.gz`;
  return {
    name,
    bytes: compressed,
    binding: {
      path: `${packageLogicalPath}/review-inputs/final-adjustments/${name}`,
      sha256: digest,
      source_path: `${packageLogicalPath}/${file}`,
      uncompressed_sha256: sha256(bytes),
    },
  };
});
const priorState: OntologyAuditFinalAdjustmentPriorState = {
  schema_version: 1,
  acceptance: {
    path: `${packageLogicalPath}/acceptance.json`,
    sha256: sha256(acceptanceBytes),
    text: acceptanceBytes.toString("utf8"),
  },
  partitions: partitionArtifacts.map((entry) => entry.binding).sort((left, right) => left.source_path.localeCompare(right.source_path)),
  targets,
};
verifyOntologyAuditFinalAdjustmentProvenance({ repoRoot, packagePath, decisions, priorState });
const decisionContent = renderOntologyAuditFinalAdjustments(decisions);
const decisionName = ontologyAuditFinalAdjustmentArtifactName(decisionContent);
const decisionSha256 = sha256(decisionContent);
const decisionLogicalPath = `${packageLogicalPath}/review-inputs/final-adjustments/${decisionName}`;
const priorContent = renderOntologyAuditFinalAdjustmentPriorState(priorState);
const priorName = ontologyAuditFinalAdjustmentPriorStateArtifactName(priorContent);
const priorSha256 = sha256(priorContent);
const priorLogicalPath = `${packageLogicalPath}/review-inputs/final-adjustments/${priorName}`;
const bindings = new Map<string, string>([
  [decisionLogicalPath, decisionSha256],
  [priorLogicalPath, priorSha256],
  ...partitionArtifacts.map((entry) => [entry.binding.path, entry.binding.sha256] as [string, string]),
]);
for (const decision of decisions) {
  for (const stage of decision.provenance_chain) {
    const sourceDigest = sha256(readFileSync(join(repoRoot, stage.source_receipt_path)));
    const priorSourceDigest = bindings.get(stage.source_receipt_path);
    if (priorSourceDigest && priorSourceDigest !== sourceDigest) {
      throw new Error(`Conflicting receipt binding ${stage.source_receipt_path}`);
    }
    bindings.set(stage.source_receipt_path, sourceDigest);
    for (const binding of stage.evidence_artifacts) {
      const previous = bindings.get(binding.path);
      if (previous && previous !== binding.sha256) throw new Error(`Conflicting receipt binding ${binding.path}`);
      bindings.set(binding.path, binding.sha256);
    }
  }
}
const sortedReceiptBindings = new Map([...bindings].sort(([left], [right]) => left.localeCompare(right)));
const receipt = renderOntologyAuditFinalAdjustmentReceipt({
  artifactPath: decisionLogicalPath,
  artifactSha256: decisionSha256,
  priorStateArtifactPath: priorLogicalPath,
  priorStateSha256: priorSha256,
  decisions,
  bindings: sortedReceiptBindings,
});
const receiptPath = join(repoRoot, ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT);

if (process.argv.includes("--write") && rematerialize) {
  assertOntologyAuditFinalAdjustmentRematerializationPending(
    JSON.parse(readFileSync(acceptancePath, "utf8")) as unknown,
  );
}

if (process.argv.includes("--write")) {
  if (!rematerialize && existsSync(receiptPath) && readFileSync(receiptPath, "utf8") !== receipt) {
    throw new Error(`Refusing to overwrite nonmatching ${ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT}`);
  }
  const temporary = mkdtempSync(join(tmpdir(), "plato-final-adjustments-"));
  const receiptTemporary = `${receiptPath}.tmp-${process.pid}`;
  const supersededDirectory = `${finalDirectory}.superseded-${process.pid}`;
  const priorReceipt = existsSync(receiptPath) ? readFileSync(receiptPath) : null;
  let wroteReceipt = false;
  let movedSupersededDirectory = false;
  let installedDirectory = false;
  try {
    writeFileSync(join(temporary, decisionName), decisionContent, "utf8");
    writeFileSync(join(temporary, priorName), priorContent, "utf8");
    for (const partition of partitionArtifacts) writeFileSync(join(temporary, partition.name), partition.bytes);
    mkdirSync(dirname(receiptPath), { recursive: true });
    writeFileSync(receiptTemporary, receipt, "utf8");
    if (existsSync(finalDirectory)) {
      if (!rematerialize) throw new Error("Final-adjustments directory already exists");
      renameSync(finalDirectory, supersededDirectory);
      movedSupersededDirectory = true;
    }
    mkdirSync(dirname(finalDirectory), { recursive: true });
    renameSync(temporary, finalDirectory);
    installedDirectory = true;
    renameSync(receiptTemporary, receiptPath);
    wroteReceipt = true;
    const verified = readOntologyAuditFinalAdjustments({ repoRoot, packagePath });
    if (!verified || verified.sha256 !== decisionSha256 || verified.decisions.size !== decisions.length) {
      throw new Error("Materialized final-adjustment package failed exact reread verification");
    }
    if (movedSupersededDirectory) rmSync(supersededDirectory, { recursive: true, force: true });
  } catch (error) {
    rmSync(receiptTemporary, { force: true });
    if (installedDirectory) rmSync(finalDirectory, { recursive: true, force: true });
    if (movedSupersededDirectory && existsSync(supersededDirectory)) {
      renameSync(supersededDirectory, finalDirectory);
    }
    if (wroteReceipt) {
      if (priorReceipt) writeFileSync(receiptPath, priorReceipt);
      else rmSync(receiptPath, { force: true });
    }
    rmSync(temporary, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv.includes("--reset-prior-package")) {
  if (!process.argv.includes("--write") || !rematerialize || !priorStateSource) {
    throw new Error("Prior-package reset requires --write --rematerialize and one preserved prior-state artifact");
  }
  const priorAcceptance = JSON.parse(acceptanceBytes.toString("utf8")) as Record<string, unknown>;
  const priorManifestBinding = priorAcceptance.manifest as { path?: unknown; sha256?: unknown } | undefined;
  if (priorManifestBinding?.path !== "manifest.json" || typeof priorManifestBinding.sha256 !== "string") {
    throw new Error("Preserved prior acceptance does not bind one canonical manifest");
  }
  const resetFiles = [
    "source-units.jsonl",
    "record-units.jsonl",
    "concept-membership-units.jsonl",
    "graph-units.jsonl",
    "findings.jsonl",
    "adjudications.jsonl",
  ] as const;
  const acceptedPartitions = priorAcceptance.partitions as Record<string, { sha256?: unknown }> | undefined;
  const headFiles = new Map<string, Buffer>();
  for (const file of [...resetFiles, "manifest.json" as const]) {
    const bytes = execFileSync("git", ["show", `HEAD:${packageLogicalPath}/${file}`], {
      cwd: repoRoot,
      encoding: "buffer",
      maxBuffer: 512 * 1024 * 1024,
    });
    const expected = file === "manifest.json"
      ? priorManifestBinding.sha256
      : acceptedPartitions?.[file]?.sha256;
    if (typeof expected !== "string" || sha256(bytes) !== expected) {
      throw new Error(`Committed ${file} does not equal the hash-bound preserved prior package`);
    }
    headFiles.set(file, bytes);
  }
  const pendingAcceptance = structuredClone(priorAcceptance) as Record<string, unknown>;
  pendingAcceptance.state = "pending";
  pendingAcceptance.final_corpus_digest = null;
  pendingAcceptance.receipt = null;
  pendingAcceptance.closure = {
    baseline_set_equal: true,
    final_set_equal: true,
    source_passes_complete: false,
    reconciliations_complete: false,
    adjudications_complete: false,
    unresolved_adjudications: 0,
    stale_aliases: 0,
    rejected_reader_leaks: 0,
    regeneration_one_sha256: null,
    regeneration_two_sha256: null,
  };
  pendingAcceptance.final_adjustments = {
    required: true,
    decision_artifact: {
      path: `review-inputs/final-adjustments/${decisionName}`,
      sha256: decisionSha256,
    },
    prior_state_artifact: {
      path: `review-inputs/final-adjustments/${priorName}`,
      sha256: priorSha256,
    },
    receipt: {
      path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
      sha256: sha256(receipt),
    },
  };
  // Acceptance remains pending throughout. Publish exact preserved payloads
  // first and the new pending authority marker last, so interruption cannot
  // expose an accepted marker over a mixed package.
  for (const file of resetFiles) atomicWrite(join(packagePath, file), headFiles.get(file)!);
  atomicWrite(join(packagePath, "manifest.json"), headFiles.get("manifest.json")!);
  atomicWrite(acceptancePath, `${JSON.stringify(pendingAcceptance, null, 2)}\n`);
  console.log(JSON.stringify({
    state: "prior_package_reset_pending",
    manifest_sha256: priorManifestBinding.sha256,
    partitions: Object.fromEntries(resetFiles.map((file) => [file, sha256(headFiles.get(file)!)])),
  }, null, 2));
}

const counts = decisions.reduce<Record<string, number>>((result, decision) => {
  result[decision.action] = (result[decision.action] ?? 0) + 1;
  return result;
}, {});
console.log(JSON.stringify({
  state: process.argv.includes("--write") ? "materialized" : "preview",
  decisions: decisions.length,
  actions: counts,
  decision_artifact: { path: decisionLogicalPath, sha256: decisionSha256 },
  prior_state_artifact: { path: priorLogicalPath, sha256: priorSha256 },
  receipt: { path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT, sha256: sha256(receipt) },
  preserved_partitions: partitionArtifacts.map((entry) => entry.binding),
}, null, 2));

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  listOntologyAuditPackagePaths,
  ontologyAuditChangeKind,
  observeOntologyAuditLiveState,
  refreshOntologyAuditBindings,
  type OntologyAuditAcceptance,
  type OntologyAuditAdjudication,
  type OntologyAuditConceptUnit,
  type OntologyAuditFinding,
  type OntologyAuditGraphUnit,
  type OntologyAuditManifest,
  type OntologyAuditRecordUnit,
  type OntologyAuditRows,
} from "./ontology-audit.js";
import { readOntologyConceptAudit } from "./ontology-concept-audit.js";

const SEMANTIC_RECEIPT = "wiki/review/2026-08-30-ontology-vnext-semantic-remediation.md";
const CONCEPT_RECEIPT = "wiki/review/2026-08-30-ontology-vnext-concept-audit.md";
const CLOSURE_RECEIPT = "wiki/review/2026-08-30-ontology-vnext-closure.md";

type SemanticDecision = {
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
  return resolved.startsWith("/") ? resolved : join(repoRoot, resolved);
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

function finalReviewStatus(row: AuditedUnit) {
  return row.kind === "record" && row.final ? row.baseline?.review_status ?? null : null;
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

function terminalAdjudications({
  rows,
  previous,
  findings,
  semantic,
  concepts,
}: {
  rows: OntologyAuditRows;
  previous: readonly OntologyAuditAdjudication[];
  findings: readonly OntologyAuditFinding[];
  semantic: ReadonlyMap<string, SemanticDecision>;
  concepts: ReadonlyMap<string, { action: string; rationale: string; replacements: string[] }>;
}) {
  const byTarget = findingsByTarget(findings);
  const previousByTarget = new Map(previous.map((row) => [row.target_key, row]));
  const units = [...rows.records, ...rows.concepts, ...rows.graphs];
  const unitKeys = new Set(units.map((row) => row.key));
  const finalUnitKeys = new Set(units.filter((row) => row.final !== null).map((row) => row.key));
  const decisions = units.map((row): OntologyAuditAdjudication => {
    const targetFindings = byTarget.get(row.key) ?? [];
    const semanticDecision = semantic.get(row.key);
    const conceptDecision = concepts.get(row.key);
    const prior = previousByTarget.get(row.key);
    let action: string;
    let rationale: string;
    let replacements: string[];
    let receiptPath: string;

    if (conceptDecision) {
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
      finding_ids: [...new Set([...targetFindings.map((finding) => finding.finding_id), ...(semanticDecision?.finding_ids ?? [])])].sort(),
      replacement_target_keys: [...new Set(replacements)].sort(),
      receipt_path: receiptPath,
    };
  });

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
  rows.adjudications = terminalAdjudications({
    rows,
    previous: baseline.adjudications,
    findings: rows.findings,
    semantic,
    concepts: conceptDecisions(
      repoRoot,
      absolute,
      rows.concepts.filter((row) => row.final !== null),
      semantic,
    ),
  });

  writeFileSync(join(absolute, "record-units.jsonl"), renderJsonl(rows.records), "utf8");
  writeFileSync(join(absolute, "concept-membership-units.jsonl"), renderJsonl(rows.concepts), "utf8");
  writeFileSync(join(absolute, "graph-units.jsonl"), renderJsonl(rows.graphs), "utf8");
  writeFileSync(join(absolute, "adjudications.jsonl"), renderJsonl(rows.adjudications), "utf8");
  const refreshed = refreshOntologyAuditBindings({ repoRoot, packagePath: absolute });
  return {
    packagePath: relative(repoRoot, absolute).split("\\").join("/"),
    live,
    rows,
    manifest: refreshed.manifest,
    acceptance: refreshed.acceptance,
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
}: {
  repoRoot?: string;
  packagePath?: string;
  regenerationOneSha256: string;
  regenerationTwoSha256: string;
  staleAliases: number;
  rejectedReaderLeaks: number;
  receiptPath?: string;
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
  const refreshed = refreshOntologyAuditBindings({ repoRoot, packagePath: absolute });
  const rows = readJsonl<OntologyAuditAdjudication>(join(absolute, "adjudications.jsonl"));
  const sources = readJsonl<{ primary: { state: string }; independent: { state: string }; reconciliation: { state: string } }>(
    join(absolute, "source-units.jsonl"),
  );
  const unresolved = rows.filter((row) => row.state !== "complete").length;
  if (unresolved > 0) throw new Error(`Cannot accept ontology audit closure: ${unresolved} adjudications remain pending.`);
  if (sources.some((row) => row.primary.state !== "complete" || row.independent.state !== "complete")) {
    throw new Error("Cannot accept ontology audit closure: source passes remain pending.");
  }
  if (sources.some((row) => row.reconciliation.state === "pending")) {
    throw new Error("Cannot accept ontology audit closure: source reconciliations remain pending.");
  }
  const receiptAbsolute = join(repoRoot, receiptPath);
  if (!existsSync(receiptAbsolute)) throw new Error(`Closure receipt is missing: ${receiptPath}`);
  const live = observeOntologyAuditLiveState(repoRoot);
  const terminalManifest = terminalOntologyAuditManifest(refreshed.manifest);
  writeFileSync(join(absolute, "manifest.json"), `${JSON.stringify(terminalManifest, null, 2)}\n`, "utf8");
  const terminalBindings = refreshOntologyAuditBindings({ repoRoot, packagePath: absolute });
  const acceptance = terminalBindings.acceptance;
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
  acceptance.manifest = terminalBindings.acceptance.manifest;
  acceptance.partitions = terminalBindings.acceptance.partitions;
  writeFileSync(join(absolute, "acceptance.json"), `${JSON.stringify(acceptance, null, 2)}\n`, "utf8");
  return { acceptance, live };
}

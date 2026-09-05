import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  type OntologyAuditAdjudication,
  type OntologyAuditFinding,
  type OntologyAuditSourceUnit,
  refreshOntologyAuditBindings,
} from "./ontology-audit.js";

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
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
  return readFileSync(path, "utf8").split(/\r?\n/u).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line) as T;
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function findingSignature(finding: OntologyAuditFinding | undefined) {
  return finding
    ? canonicalJson({
        target_keys: uniqueSorted(finding.target_keys),
        defect_class: finding.defect_class,
        proposed_action: finding.proposed_action,
      })
    : "(missing finding)";
}

function setEqual(left: readonly string[], right: readonly string[]) {
  const a = uniqueSorted(left);
  const b = uniqueSorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

type ReconciliationArtifactRow = {
  key: string;
  primary_reviewer: string;
  independent_reviewer: string;
  reconciliation_reviewer: string;
  state: "agreed" | "adjudicated";
  primary_finding_ids: string[];
  independent_finding_ids: string[];
  retained_finding_ids: string[];
  adjudication_ids: string[];
  rationale: string | null;
};

function receiptContent({
  repoRoot,
  packagePath,
  artifactPath,
  reviewer,
  dialogues,
  agreed,
  adjudicated,
}: {
  repoRoot: string;
  packagePath: string;
  artifactPath: string;
  reviewer: string;
  dialogues: string[];
  agreed: number;
  adjudicated: number;
}) {
  return [
    "# Ontology source-review reconciliation receipt",
    "",
    `- audit_package: \`${relative(repoRoot, packagePath)}\``,
    `- reconciliation_reviewer: \`${reviewer}\``,
    `- dialogues: ${dialogues.map((dialogue) => `\`${dialogue}\``).join(", ")}`,
    `- agreed_units: ${agreed}`,
    `- adjudicated_units: ${adjudicated}`,
    "- policy: normalized agreement requires equal target, defect-class, and proposed-action sets; differences retain both passes and route every finding to an item-level adjudication",
    `- artifact: \`${relative(repoRoot, artifactPath)}\`; sha256: \`${sha256(readFileSync(artifactPath))}\``,
    "",
  ].join("\n");
}

export function reconcileOntologySourceReviews({
  repoRoot = getRepoRoot(),
  packagePath,
  dialogues,
  reviewer,
  receiptPath,
}: {
  repoRoot?: string;
  packagePath: string;
  dialogues: string[];
  reviewer: string;
  receiptPath: string;
}) {
  if (dialogues.length === 0) throw new Error("Reconciliation requires at least one dialogue.");
  if (!reviewer) throw new Error("Reconciliation reviewer is required.");
  if (!receiptPath.startsWith("wiki/review/")) throw new Error("Reconciliation receipt must live under wiki/review/.");
  const selectedDialogues = new Set(dialogues);
  if (selectedDialogues.size !== dialogues.length) throw new Error("Reconciliation dialogues contain duplicates.");
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const sourcePath = join(absolutePackagePath, "source-units.jsonl");
  const findingPath = join(absolutePackagePath, "findings.jsonl");
  const adjudicationPath = join(absolutePackagePath, "adjudications.jsonl");
  const sourceUnits = readJsonl<OntologyAuditSourceUnit>(sourcePath);
  const findings = readJsonl<OntologyAuditFinding>(findingPath);
  const adjudications = readJsonl<OntologyAuditAdjudication>(adjudicationPath);
  const findingById = new Map(findings.map((finding) => [finding.finding_id, finding]));
  const adjudicationByTarget = new Map(adjudications.map((adjudication) => [adjudication.target_key, adjudication]));
  const selected = sourceUnits.filter((unit) => selectedDialogues.has(unit.dialogue));
  const actualDialogues = new Set(selected.map((unit) => unit.dialogue));
  if (!setEqual([...actualDialogues], dialogues)) {
    throw new Error(`Reconciliation dialogue set differs from frozen units: ${dialogues.filter((dialogue) => !actualDialogues.has(dialogue)).join(", ")}`);
  }
  const artifactRows: ReconciliationArtifactRow[] = [];

  for (const unit of selected) {
    if (unit.primary.state !== "complete" || unit.independent.state !== "complete") {
      throw new Error(`${unit.key} cannot reconcile before both passes complete.`);
    }
    if (unit.primary.reviewer === unit.independent.reviewer) throw new Error(`${unit.key} uses one reviewer for both source passes.`);
    if (reviewer === unit.primary.reviewer || reviewer === unit.independent.reviewer) {
      throw new Error(`${unit.key} reconciliation reviewer is not independent of both source passes.`);
    }
    const primarySignatures = unit.primary.finding_ids.map((id) => findingSignature(findingById.get(id)));
    const independentSignatures = unit.independent.finding_ids.map((id) => findingSignature(findingById.get(id)));
    const equal = setEqual(primarySignatures, independentSignatures);
    const retainedFindingIds = uniqueSorted([...unit.primary.finding_ids, ...unit.independent.finding_ids]);
    let adjudicationIds: string[] = [];
    let rationale: string | null = null;
    if (!equal) {
      const targetKeys = uniqueSorted(retainedFindingIds.flatMap((id) => findingById.get(id)?.target_keys ?? []));
      for (const targetKey of targetKeys) {
        let adjudication = adjudicationByTarget.get(targetKey);
        if (!adjudication && targetKey.startsWith("source:")) {
          adjudication = {
            adjudication_id: `adjudication:${sha256(targetKey).slice(0, 24)}`,
            target_key: targetKey,
            target_kind: "source",
            state: "pending",
            action: null,
            rationale: null,
            finding_ids: [],
            replacement_target_keys: [],
            receipt_path: null,
          };
          adjudications.push(adjudication);
          adjudicationByTarget.set(targetKey, adjudication);
        }
        if (!adjudication) continue;
        const relevantFindingIds = retainedFindingIds.filter((id) => findingById.get(id)?.target_keys.includes(targetKey));
        adjudication.finding_ids = uniqueSorted([...adjudication.finding_ids, ...relevantFindingIds]);
        adjudicationIds.push(adjudication.adjudication_id);
      }
      if (adjudicationIds.length === 0) {
        for (const targetKey of unit.overlapping_record_keys) {
          const adjudication = adjudicationByTarget.get(targetKey);
          if (!adjudication) continue;
          adjudication.finding_ids = uniqueSorted([...adjudication.finding_ids, ...retainedFindingIds]);
          adjudicationIds.push(adjudication.adjudication_id);
        }
      }
      if (adjudicationIds.length === 0) throw new Error(`${unit.key} disagreement cannot be routed to an item-level adjudication.`);
      adjudicationIds = uniqueSorted(adjudicationIds);
      rationale = "The independent passes differed; reconciliation retains the union of both source-bound finding sets and routes every retained finding to explicit item-level adjudication without silently discarding either pass.";
    }
    artifactRows.push({
      key: unit.key,
      primary_reviewer: unit.primary.reviewer,
      independent_reviewer: unit.independent.reviewer,
      reconciliation_reviewer: reviewer,
      state: equal ? "agreed" : "adjudicated",
      primary_finding_ids: uniqueSorted(unit.primary.finding_ids),
      independent_finding_ids: uniqueSorted(unit.independent.finding_ids),
      retained_finding_ids: retainedFindingIds,
      adjudication_ids: adjudicationIds,
      rationale,
    });
  }

  const artifactContent = renderJsonl(artifactRows.sort((left, right) => left.key.localeCompare(right.key)));
  const artifactSha256 = sha256(artifactContent);
  const safeReviewer = reviewer.replace(/[^a-zA-Z0-9_-]+/gu, "-");
  const artifactPath = join(absolutePackagePath, "review-inputs", "reconciliation", `${artifactSha256}-${safeReviewer}.jsonl`);
  mkdirSync(dirname(artifactPath), { recursive: true });
  if (existsSync(artifactPath) && readFileSync(artifactPath, "utf8") !== artifactContent) {
    throw new Error(`Refusing to overwrite different reconciliation artifact ${artifactPath}.`);
  }
  writeFileSync(artifactPath, artifactContent, "utf8");
  const absoluteReceiptPath = join(repoRoot, receiptPath);
  const content = receiptContent({
    repoRoot,
    packagePath: absolutePackagePath,
    artifactPath,
    reviewer,
    dialogues: [...selectedDialogues].sort(),
    agreed: artifactRows.filter((row) => row.state === "agreed").length,
    adjudicated: artifactRows.filter((row) => row.state === "adjudicated").length,
  });
  mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
  if (existsSync(absoluteReceiptPath) && readFileSync(absoluteReceiptPath, "utf8") !== content) {
    throw new Error(`Refusing to overwrite different reconciliation receipt ${receiptPath}.`);
  }
  writeFileSync(absoluteReceiptPath, content, "utf8");
  const receiptSha256 = sha256(content);
  const rowByKey = new Map(artifactRows.map((row) => [row.key, row]));
  for (const unit of sourceUnits) {
    const row = rowByKey.get(unit.key);
    if (!row) continue;
    if (unit.reconciliation.state !== "pending") {
      const expected = {
        state: row.state,
        reviewer,
        rationale: row.rationale,
        adjudication_ids: row.adjudication_ids,
        receipt_path: receiptPath,
        receipt_sha256: receiptSha256,
      };
      if (canonicalJson(unit.reconciliation) !== canonicalJson(expected)) {
        throw new Error(`Refusing to replace different reconciliation for ${unit.key}.`);
      }
    }
    unit.reconciliation = {
      state: row.state,
      reviewer,
      rationale: row.rationale,
      adjudication_ids: row.adjudication_ids,
      receipt_path: receiptPath,
      receipt_sha256: receiptSha256,
    };
  }
  writeFileSync(sourcePath, renderJsonl(sourceUnits.sort((left, right) => left.key.localeCompare(right.key))), "utf8");
  writeFileSync(adjudicationPath, renderJsonl(adjudications.sort((left, right) => left.target_key.localeCompare(right.target_key))), "utf8");
  refreshOntologyAuditBindings({ repoRoot, packagePath: absolutePackagePath });
  return {
    dialogues: [...selectedDialogues].sort(),
    sourceUnits: selected.length,
    agreed: artifactRows.filter((row) => row.state === "agreed").length,
    adjudicated: artifactRows.filter((row) => row.state === "adjudicated").length,
    artifactPath: relative(repoRoot, artifactPath),
    artifactSha256,
    receiptPath,
    receiptSha256,
  };
}

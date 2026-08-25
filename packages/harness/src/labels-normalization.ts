import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { writeClusterArtifacts } from "./clusters.js";
import { writeDossierArtifacts } from "./dossiers.js";
import { collectLabelAudit, writeLabelAudit, type LabelAuditReport } from "./labels.js";
import { writeLabelQuality } from "./labels-report.js";
import { getRepoRoot } from "./paths.js";
import { buildStaticSite } from "./site/index.js";
import { listCommentaryLedgerPaths } from "./wiki/commentary-ledger.js";
import {
  fieldValue,
  listObservationLedgerPaths,
  replaceObservationYamlBlocks,
} from "./wiki/observation-ledger.js";
import {
  normalizeFeatureFamily,
  normalizeFeatureLabel,
  parseFeatureEntries,
  reconcileFeatureRegistryContent,
  type ObservationFeatureLink,
} from "./wiki/observation-feature-index.js";

export const LABEL_NORMALIZATION_STANDARD = "docs/label-normalization-standards.md";
export const LABEL_AUDIT_PATH = "wiki/label-audit.md";

export type LabelMergeTarget = {
  family: string;
  label: string;
};

export type LabelMergeDisposition = {
  family: string;
  label: string;
  action: "todo" | "keep" | "merge";
  reason: string;
  to?: LabelMergeTarget;
  familyChange?: boolean;
};

export type LabelMergeMapMetrics = {
  totalLabels: number;
  totalObservations: number;
  singletonLabels: number;
  crossDialogueLabels: number;
};

export type LabelMergeMap = {
  version: 1;
  standard: string;
  sourceAudit: string;
  sourceMetrics: LabelMergeMapMetrics;
  createdLabels?: LabelMergeTarget[];
  dispositions: LabelMergeDisposition[];
};

export type WrittenLabelMergeMap = {
  path: string;
  map: LabelMergeMap;
  todoCount: number;
};

export type LabelMergeMapValidationResult = {
  path: string;
  dispositionCount: number;
  mergeCount: number;
  keepCount: number;
  todoCount: number;
  failures: string[];
};

export type AppliedLabelMergeMap = {
  path: string;
  updatedLedgers: string[];
  updatedCommentaryLedgers: string[];
  changedObservations: number;
  labelAuditPath: string | undefined;
  labelQualityPath: string | undefined;
  clusterFiles: number | undefined;
  dossierFiles: number | undefined;
  sitePages: number | undefined;
};

type LabelDependentArtifactWriters = {
  audit: () => { path: string };
  quality: () => { path: string };
  clusters: () => unknown[];
  dossiers: () => unknown[];
  site: () => { pages: unknown[] };
};

type ApplyOptions = {
  family?: string;
  writeDerived?: boolean;
};

type ValidationOptions = {
  family?: string;
};

function labelKey(family: string, label: string) {
  return `${normalizeFeatureFamily(family)}::${normalizeFeatureLabel(label)}`;
}

function splitLabelKey(key: string): LabelMergeTarget {
  const [family, label] = key.split("::");
  return { family: family ?? "", label: label ?? "" };
}

function metricsFromReport(report: LabelAuditReport): LabelMergeMapMetrics {
  return {
    totalLabels: report.totalLabels,
    totalObservations: report.totalObservations,
    singletonLabels: report.singletonLabels,
    crossDialogueLabels: report.crossDialogueLabels,
  };
}

function compareMetrics(a: LabelMergeMapMetrics, b: LabelMergeMapMetrics) {
  return (
    a.totalLabels === b.totalLabels &&
    a.totalObservations === b.totalObservations &&
    a.singletonLabels === b.singletonLabels &&
    a.crossDialogueLabels === b.crossDialogueLabels
  );
}

export function writeLabelDependentArtifacts(
  writers: LabelDependentArtifactWriters = {
    audit: writeLabelAudit,
    quality: writeLabelQuality,
    clusters: writeClusterArtifacts,
    dossiers: writeDossierArtifacts,
    site: buildStaticSite,
  },
) {
  const labelAudit = writers.audit();
  const labelQuality = writers.quality();
  const clusters = writers.clusters();
  const dossiers = writers.dossiers();
  const site = writers.site();

  return {
    labelAuditPath: labelAudit.path,
    labelQualityPath: labelQuality.path,
    clusterFiles: clusters.length,
    dossierFiles: dossiers.length,
    sitePages: site.pages.length,
  };
}

function auditMetricsFromMarkdown(content: string): LabelMergeMapMetrics | undefined {
  const metric = (name: string) => {
    const value = new RegExp(`^${name}:\\s*(\\d+)\\s*$`, "mu").exec(content)?.[1];
    return value === undefined ? undefined : Number(value);
  };

  const totalLabels = metric("total_labels");
  const totalObservations = metric("total_observations");
  const singletonLabels = metric("singleton_labels");
  const crossDialogueLabels = metric("cross_dialogue_labels");
  if (
    totalLabels === undefined ||
    totalObservations === undefined ||
    singletonLabels === undefined ||
    crossDialogueLabels === undefined
  ) {
    return undefined;
  }

  return { totalLabels, totalObservations, singletonLabels, crossDialogueLabels };
}

function currentLabelKeys(report = collectLabelAudit()) {
  return new Set(report.families.flatMap((family) => family.entries.map((entry) => labelKey(entry.family, entry.label))));
}

function normalizeTarget(target: LabelMergeTarget): LabelMergeTarget {
  return {
    family: normalizeFeatureFamily(target.family),
    label: normalizeFeatureLabel(target.label),
  };
}

function normalizeDisposition(disposition: LabelMergeDisposition): LabelMergeDisposition {
  return {
    ...disposition,
    family: normalizeFeatureFamily(disposition.family),
    label: normalizeFeatureLabel(disposition.label),
    ...(disposition.to ? { to: normalizeTarget(disposition.to) } : {}),
  };
}

function validateFunctionalReason(action: "keep" | "merge", reason: string) {
  const trimmed = reason.trim();
  const lower = trimmed.toLowerCase();
  if (trimmed.length < 24) return "reason is too short to justify the disposition";
  if (/\b(both|same|all)\b.*\b(topic|character|person|scene|section|doctrine|wording)\b/u.test(lower)) {
    return "reason is topic-only or identity-only, not a textual-function rationale";
  }
  if (/\b(both are about|same topic|same character|similar wording|same section)\b/u.test(lower)) {
    return "reason is topic-only or identity-only, not a textual-function rationale";
  }

  const functionalMarker =
    /\b(textual function|function|role|move|pattern|procedure|speech act|frame device|argument step|method step|comparison question|cluster|analogy|definition|refutation|closure|myth|turn)\b/u;
  if (action === "merge" && !functionalMarker.test(lower)) {
    return "merge reason must state the shared textual function";
  }

  const keepMarker =
    /\b(distinct|structural|function|insufficient|sparse|split|needs_split|speech act|argument role|method step|frame device|comparison|cluster)\b/u;
  if (action === "keep" && !keepMarker.test(lower)) {
    return "keep reason must explain structural distinctness or insufficient evidence";
  }

  return undefined;
}

export function planLabelMergeMap(path: string): WrittenLabelMergeMap {
  const audit = writeLabelAudit();
  const dispositions: LabelMergeDisposition[] = audit.report.families.flatMap((family) =>
    family.entries.map((entry) => {
      if (entry.status === "singleton") {
        return {
          family: entry.family,
          label: entry.label,
          action: "todo",
          reason: "",
        };
      }

      return {
        family: entry.family,
        label: entry.label,
        action: "keep",
        reason:
          "Already reused in the current corpus; revisit only if review identifies a sharper shared textual function.",
      };
    }),
  );

  const map: LabelMergeMap = {
    version: 1,
    standard: LABEL_NORMALIZATION_STANDARD,
    sourceAudit: audit.path,
    sourceMetrics: metricsFromReport(audit.report),
    dispositions,
  };

  const repoRoot = getRepoRoot();
  const absolutePath = join(repoRoot, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(map, null, 2)}\n`, "utf8");

  return {
    path: relative(repoRoot, absolutePath),
    map,
    todoCount: dispositions.filter((disposition) => disposition.action === "todo").length,
  };
}

export function readLabelMergeMap(path: string): LabelMergeMap {
  return JSON.parse(readFileSync(join(getRepoRoot(), path), "utf8")) as LabelMergeMap;
}

export function validateLabelMergeMap(path: string, options: ValidationOptions = {}): LabelMergeMapValidationResult {
  const repoRoot = getRepoRoot();
  const map = readLabelMergeMap(path);
  const failures: string[] = [];
  const report = collectLabelAudit();
  const currentMetrics = metricsFromReport(report);
  const familyFilter = options.family ? normalizeFeatureFamily(options.family) : undefined;

  if (map.version !== 1) failures.push("version must be 1");
  if (map.standard !== LABEL_NORMALIZATION_STANDARD) {
    failures.push(`standard must be ${LABEL_NORMALIZATION_STANDARD}`);
  }
  if (map.sourceAudit !== LABEL_AUDIT_PATH) {
    failures.push(`sourceAudit must be ${LABEL_AUDIT_PATH}`);
  }

  const auditPath = join(repoRoot, map.sourceAudit ?? "");
  if (!existsSync(auditPath)) {
    failures.push(`${map.sourceAudit}: source audit does not exist`);
  } else {
    const diskMetrics = auditMetricsFromMarkdown(readFileSync(auditPath, "utf8"));
    if (!diskMetrics) {
      failures.push(`${map.sourceAudit}: cannot read audit metrics`);
    } else if (!compareMetrics(map.sourceMetrics, diskMetrics)) {
      failures.push(`${map.sourceAudit}: metrics do not match merge-map sourceMetrics`);
    }
  }

  if (!compareMetrics(map.sourceMetrics, currentMetrics)) {
    failures.push("current label audit metrics do not match merge-map sourceMetrics");
  }

  if (!Array.isArray(map.dispositions)) {
    failures.push("dispositions must be an array");
  }

  const currentKeys = currentLabelKeys(report);
  const createdKeys = new Set((map.createdLabels ?? []).map((target) => labelKey(target.family, target.label)));
  const seen = new Set<string>();
  const mergeEdges = new Map<string, string>();
  let mergeCount = 0;
  let keepCount = 0;
  let todoCount = 0;

  for (const [index, rawDisposition] of (map.dispositions ?? []).entries()) {
    const disposition = normalizeDisposition(rawDisposition);
    const key = labelKey(disposition.family, disposition.label);
    const labelName = `${disposition.family}/${disposition.label}`;
    const inScope = !familyFilter || disposition.family === familyFilter;

    if (rawDisposition.family !== disposition.family || rawDisposition.label !== disposition.label) {
      failures.push(`${labelName}: family and label must already be normalized`);
    }
    if (seen.has(key)) {
      failures.push(`${labelName}: duplicate disposition`);
    }
    seen.add(key);

    if (!currentKeys.has(key)) {
      failures.push(`${labelName}: disposition does not match a current label`);
    }

    if (disposition.action === "todo") {
      todoCount += 1;
      if (inScope) {
        failures.push(`${labelName}: action must be merge or keep, not todo`);
      }
      continue;
    }

    if (disposition.action === "keep") {
      keepCount += 1;
      const reasonFailure = validateFunctionalReason("keep", disposition.reason ?? "");
      if (reasonFailure) failures.push(`${labelName}: ${reasonFailure}`);
      continue;
    }

    if (disposition.action !== "merge") {
      failures.push(`${labelName}: action must be merge or keep`);
      continue;
    }

    mergeCount += 1;
    if (!disposition.to) {
      failures.push(`${labelName}: merge disposition requires to`);
      continue;
    }

    const target = normalizeTarget(disposition.to);
    const targetKey = labelKey(target.family, target.label);
    if (rawDisposition.to?.family !== target.family || rawDisposition.to?.label !== target.label) {
      failures.push(`${labelName}: merge target must already be normalized`);
    }
    if (!currentKeys.has(targetKey) && !createdKeys.has(targetKey)) {
      failures.push(`${labelName}: merge target ${target.family}/${target.label} is not current or created by map`);
    }
    if (target.family !== disposition.family && disposition.familyChange !== true) {
      failures.push(`${labelName}: family-changing merge to ${target.family}/${target.label} requires familyChange=true`);
    }
    if (target.family !== disposition.family && !/\bfamily\b/u.test((disposition.reason ?? "").toLowerCase())) {
      failures.push(`${labelName}: family-changing merge reason must explicitly justify the family change`);
    }
    if (target.family === disposition.family && disposition.familyChange === true) {
      failures.push(`${labelName}: familyChange=true is only allowed when the target family differs`);
    }

    const reasonFailure = validateFunctionalReason("merge", disposition.reason ?? "");
    if (reasonFailure) failures.push(`${labelName}: ${reasonFailure}`);
    mergeEdges.set(key, targetKey);
  }

  for (const key of currentKeys) {
    const label = splitLabelKey(key);
    if (!seen.has(key) && (!familyFilter || label.family === familyFilter)) {
      failures.push(`${label.family}/${label.label}: missing disposition`);
    }
  }

  for (const key of seen) {
    const visited = new Set<string>();
    let current = key;
    while (mergeEdges.has(current)) {
      if (visited.has(current)) {
        failures.push(`${splitLabelKey(key).family}/${splitLabelKey(key).label}: merge graph contains a cycle`);
        break;
      }
      visited.add(current);
      current = mergeEdges.get(current) ?? current;
    }
  }

  return {
    path,
    dispositionCount: map.dispositions?.length ?? 0,
    mergeCount,
    keepCount,
    todoCount,
    failures: [...new Set(failures)].sort(),
  };
}

export function assertLabelMergeMapValid(path: string, options: ValidationOptions = {}): LabelMergeMapValidationResult {
  const result = validateLabelMergeMap(path, options);
  if (result.failures.length > 0) {
    throw new Error(`Label merge map validation failed:\n${result.failures.join("\n")}`);
  }
  return result;
}

function topLevelFieldLineIndex(lines: string[], field: string) {
  return lines.findIndex((line) => new RegExp(`^${field}:\\s*`, "u").test(line));
}

function upsertScalarField(block: string, field: string, value: string, beforeField?: string) {
  const lines = block.split("\n");
  const nextLine = `${field}: ${value}`;
  const existingIndex = topLevelFieldLineIndex(lines, field);
  if (existingIndex >= 0) {
    lines[existingIndex] = nextLine;
    return lines.join("\n");
  }

  const beforeIndex = beforeField ? topLevelFieldLineIndex(lines, beforeField) : -1;
  if (beforeIndex >= 0) {
    lines.splice(beforeIndex, 0, nextLine);
    return lines.join("\n");
  }

  lines.push(nextLine);
  return lines.join("\n");
}

function createFeatureIdAssigner(registryContent: string) {
  const featureIdByKey = new Map<string, string>();
  let maxCandidateNumber = 0;

  for (const entry of parseFeatureEntries(registryContent)) {
    const key = labelKey(entry.family, entry.proposedName);
    if (entry.family && entry.proposedName && !featureIdByKey.has(key)) {
      featureIdByKey.set(key, entry.id);
    }
    const match = /^feature_candidate_(\d+)$/u.exec(entry.id);
    if (match) maxCandidateNumber = Math.max(maxCandidateNumber, Number(match[1]));
  }

  let nextNumber = maxCandidateNumber + 1;
  return (target: LabelMergeTarget) => {
    const normalized = normalizeTarget(target);
    const key = labelKey(normalized.family, normalized.label);
    const existing = featureIdByKey.get(key);
    if (existing) return { ...normalized, featureId: existing };

    const featureId = `feature_candidate_${String(nextNumber).padStart(3, "0")}`;
    nextNumber += 1;
    featureIdByKey.set(key, featureId);
    return { ...normalized, featureId };
  };
}

function targetResolver(map: LabelMergeMap) {
  const dispositionsByKey = new Map(
    map.dispositions.map((rawDisposition) => {
      const disposition = normalizeDisposition(rawDisposition);
      return [labelKey(disposition.family, disposition.label), disposition] as const;
    }),
  );

  return (source: LabelMergeTarget): LabelMergeTarget => {
    let current = normalizeTarget(source);
    const visited = new Set<string>();
    while (true) {
      const key = labelKey(current.family, current.label);
      if (visited.has(key)) return current;
      visited.add(key);

      const disposition = dispositionsByKey.get(key);
      if (!disposition || disposition.action !== "merge" || !disposition.to) return current;
      current = normalizeTarget(disposition.to);
    }
  };
}

export function rewriteCommentaryDossierReferences(
  content: string,
  map: LabelMergeMap,
  family?: string,
) {
  const resolveTarget = targetResolver(map);
  const normalizedFamilyFilter = family ? normalizeFeatureFamily(family) : undefined;
  let changed = false;
  const nextContent = content
    .split("\n")
    .map((line) => {
      const match = /^(\s+dossiers:\s*)\[([^\]]*)\](\s*)$/u.exec(line);
      if (!match) return line;

      const references = (match[2] ?? "")
        .split(",")
        .map((reference) => reference.trim())
        .filter(Boolean);
      const rewritten: string[] = [];
      const seen = new Set<string>();
      let lineChanged = false;
      for (const rawReference of references) {
        const quote =
          rawReference.length >= 2 &&
          ((rawReference.startsWith('"') && rawReference.endsWith('"')) ||
            (rawReference.startsWith("'") && rawReference.endsWith("'")))
            ? rawReference[0]!
            : "";
        const reference = quote ? rawReference.slice(1, -1) : rawReference;
        const separator = reference.indexOf("/");
        if (separator < 1 || separator === reference.length - 1) {
          if (seen.has(reference)) {
            lineChanged = true;
            continue;
          }
          seen.add(reference);
          rewritten.push(rawReference);
          continue;
        }

        const source = normalizeTarget({
          family: reference.slice(0, separator),
          label: reference.slice(separator + 1),
        });
        const target =
          normalizedFamilyFilter && source.family !== normalizedFamilyFilter
            ? source
            : resolveTarget(source);
        const nextReference = `${target.family}/${target.label}`;
        if (seen.has(nextReference)) {
          lineChanged = true;
          continue;
        }
        seen.add(nextReference);
        if (nextReference === `${source.family}/${source.label}`) {
          rewritten.push(rawReference);
          continue;
        }
        lineChanged = true;
        rewritten.push(quote ? `${quote}${nextReference}${quote}` : nextReference);
      }

      if (!lineChanged) return line;
      const nextLine = `${match[1]}[${rewritten.join(", ")}]${match[3] ?? ""}`;
      if (nextLine !== line) changed = true;
      return nextLine;
    })
    .join("\n");

  return { content: nextContent, changed };
}

export function applyLabelMergeMap(path: string, options: ApplyOptions = {}): AppliedLabelMergeMap {
  assertLabelMergeMapValid(path, options.family ? { family: options.family } : {});

  const repoRoot = getRepoRoot();
  const map = readLabelMergeMap(path);
  const resolveTarget = targetResolver(map);
  const registryPath = join(repoRoot, "wiki/features-so-far.md");
  const registryContent = readFileSync(registryPath, "utf8");
  const assignFeatureId = createFeatureIdAssigner(registryContent);
  const normalizedFamilyFilter = options.family ? normalizeFeatureFamily(options.family) : undefined;
  const updatedLedgers: string[] = [];
  const updatedCommentaryLedgers: string[] = [];
  const links: ObservationFeatureLink[] = [];
  let changedObservations = 0;

  for (const relativePath of listObservationLedgerPaths()) {
    const absolutePath = join(repoRoot, relativePath);
    const content = readFileSync(absolutePath, "utf8");
    let changedLedger = false;
    const nextContent = replaceObservationYamlBlocks(content, (block, fullMatch) => {
      const observationId = fieldValue(block, "observation_id");
      const family = normalizeFeatureFamily(fieldValue(block, "feature_family"));
      const label = normalizeFeatureLabel(fieldValue(block, "feature_label") ?? "");
      const existingFeatureId = fieldValue(block, "feature_id");
      if (!observationId || !family || !label) return fullMatch;

      const target = normalizedFamilyFilter && family !== normalizedFamilyFilter ? { family, label } : resolveTarget({ family, label });
      const targetKey = labelKey(target.family, target.label);
      const sourceKey = labelKey(family, label);
      const shouldChange = sourceKey !== targetKey;
      const feature = shouldChange ? assignFeatureId(target) : { family, label, featureId: existingFeatureId ?? "" };

      links.push({
        observationId,
        featureId: feature.featureId,
        featureFamily: feature.family,
        featureLabel: feature.label,
      });

      if (!shouldChange) return fullMatch;

      changedLedger = true;
      changedObservations += 1;
      let nextBlock = upsertScalarField(block, "feature_family", feature.family, "feature_id");
      nextBlock = upsertScalarField(nextBlock, "feature_id", feature.featureId, "feature_label");
      nextBlock = upsertScalarField(nextBlock, "feature_label", feature.label, "observation");
      return `\`\`\`yaml\n${nextBlock}\n\`\`\``;
    });

    if (changedLedger) {
      writeFileSync(absolutePath, nextContent, "utf8");
      updatedLedgers.push(relative(repoRoot, absolutePath));
    }
  }

  for (const relativePath of listCommentaryLedgerPaths()) {
    const absolutePath = join(repoRoot, relativePath);
    const content = readFileSync(absolutePath, "utf8");
    const rewritten = rewriteCommentaryDossierReferences(content, map, normalizedFamilyFilter);
    if (!rewritten.changed) continue;

    writeFileSync(absolutePath, rewritten.content, "utf8");
    updatedCommentaryLedgers.push(relative(repoRoot, absolutePath));
  }

  writeFileSync(registryPath, reconcileFeatureRegistryContent(registryContent, links), "utf8");

  if (options.writeDerived === false) {
    return {
      path,
      updatedLedgers,
      updatedCommentaryLedgers,
      changedObservations,
      labelAuditPath: undefined,
      labelQualityPath: undefined,
      clusterFiles: undefined,
      dossierFiles: undefined,
      sitePages: undefined,
    };
  }

  const derived = writeLabelDependentArtifacts();

  return {
    path,
    updatedLedgers,
    updatedCommentaryLedgers,
    changedObservations,
    ...derived,
  };
}

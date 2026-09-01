import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  type OntologyAuditAdjudication,
  type OntologyAuditFinding,
  type OntologyAuditSourceUnit,
  normalizeOntologyAuditJsonl,
  refreshOntologyAuditBindings,
} from "./ontology-audit.js";

type ReviewPass = "primary" | "independent";

type RawFinding = {
  finding_id?: unknown;
  defect_class?: unknown;
  action?: unknown;
  proposed_action?: unknown;
  rationale?: unknown;
  record_key?: unknown;
  record_keys?: unknown;
  related_source_unit_keys?: unknown;
  owner_source_unit_key?: unknown;
};

type RawReviewRow = {
  key?: unknown;
  dialogue?: unknown;
  reviewer?: unknown;
  reviewed_input_sha256?: unknown;
  outcome?: unknown;
  finding_ids?: unknown;
  findings?: unknown;
  text_sha256?: unknown;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function renderJsonl(rows: readonly unknown[]) {
  return rows.length === 0 ? "" : `${rows.map(canonicalJson).join("\n")}\n`;
}

function string(value: unknown, context: string) {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${context} must be a nonempty string`);
  return value;
}

function stringArray(value: unknown, context: string) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    throw new Error(`${context} must be an array of nonempty strings`);
  }
  const entries = value as string[];
  if (new Set(entries).size !== entries.length) throw new Error(`${context} contains duplicates`);
  return entries;
}

function parseJsonl(path: string) {
  const content = normalizeOntologyAuditJsonl(readFileSync(path, "utf8"), path);
  return (content === "" ? [] : content.slice(0, -1).split("\n"))
    .map((line, index) => {
      try {
        return JSON.parse(line) as RawReviewRow;
      } catch (error) {
        throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
}

function canonicalJsonl(path: string) {
  return normalizeOntologyAuditJsonl(readFileSync(path, "utf8"), path);
}

function repositoryPath(repoRoot: string, logicalPath: string) {
  const root = resolve(repoRoot);
  const absolute = resolve(root, logicalPath);
  if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) {
    throw new Error(`Review artifact path escapes the repository: ${logicalPath}`);
  }
  return absolute;
}

function sortedUnique(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function canonicalFindingId(value: string) {
  if (value.startsWith("finding:")) return value;
  if (value.startsWith("finding-") && value.length > "finding-".length) {
    return `finding:${value.slice("finding-".length)}`;
  }
  throw new Error(`Finding id ${value} is not canonicalizable; expected finding:... or finding-...`);
}

function normalizeFinding(
  raw: RawFinding,
  pass: ReviewPass,
  reviewer: string,
  sourceUnitKey: string,
): OntologyAuditFinding {
  const findingId = canonicalFindingId(string(raw.finding_id, `${sourceUnitKey} finding_id`));
  const rawRecordKeys = Array.isArray(raw.record_keys)
    ? stringArray(raw.record_keys, `${findingId} record_keys`)
    : typeof raw.record_key === "string" && raw.record_key.length > 0
      ? [raw.record_key]
      : [];
  const recordKeys = rawRecordKeys.filter((key) => !key.includes(":(missing:"));
  const related = Array.isArray(raw.related_source_unit_keys)
    ? stringArray(raw.related_source_unit_keys, `${findingId} related_source_unit_keys`)
    : [];
  const owner = typeof raw.owner_source_unit_key === "string" && raw.owner_source_unit_key.length > 0
    ? [raw.owner_source_unit_key]
    : [];
  return {
    finding_id: findingId,
    pass,
    reviewer,
    source_unit_keys: sortedUnique([sourceUnitKey, ...related, ...owner]),
    target_keys: sortedUnique(recordKeys.length > 0 ? recordKeys : [sourceUnitKey]),
    defect_class: string(raw.defect_class, `${findingId} defect_class`),
    proposed_action: string(raw.action ?? raw.proposed_action, `${findingId} proposed action`),
    rationale: string(raw.rationale, `${findingId} rationale`),
  };
}

function mergeFinding(existing: OntologyAuditFinding | undefined, incoming: OntologyAuditFinding) {
  if (!existing) return incoming;
  const existingTargetsArePreCanonical = existing.target_keys.length === 0
    || existing.target_keys.every((key) => key.includes(":(missing:"));
  const upgradedExisting = existingTargetsArePreCanonical
    ? { ...existing, target_keys: incoming.target_keys }
    : existing;
  const stableExisting = { ...upgradedExisting, source_unit_keys: [] as string[] };
  const stableIncoming = { ...incoming, source_unit_keys: [] as string[] };
  if (canonicalJson(stableExisting) !== canonicalJson(stableIncoming)) {
    throw new Error(`Finding ${incoming.finding_id} has conflicting normalized content`);
  }
  return {
    ...upgradedExisting,
    source_unit_keys: sortedUnique([...existing.source_unit_keys, ...incoming.source_unit_keys]),
  };
}

function receiptContent({
  repoRoot,
  packagePath,
  pass,
  inputPaths,
  rows,
  findings,
}: {
  repoRoot: string;
  packagePath: string;
  pass: ReviewPass;
  inputPaths: string[];
  rows: RawReviewRow[];
  findings: OntologyAuditFinding[];
}) {
  const reviewers = sortedUnique(rows.map((row) => string(row.reviewer, "reviewer")));
  const dialogues = sortedUnique(rows.map((row) => string(row.dialogue, "dialogue")));
  return [
    `# Ontology ${pass} source review receipt`,
    "",
    `- audit_package: \`${relative(repoRoot, packagePath)}\``,
    `- pass: \`${pass}\``,
    `- reviewers: ${reviewers.map((reviewer) => `\`${reviewer}\``).join(", ")}`,
    `- dialogues: ${dialogues.map((dialogue) => `\`${dialogue}\``).join(", ")}`,
    `- source_units: ${rows.length}`,
    `- normalized_findings: ${findings.length}`,
    "- source_policy: canonical Greek only; no translation paths",
    "- coverage: exact equality with the selected frozen source-unit key set; one explicit zero-result or findings outcome per unit",
    "",
    "## Imported review artifacts",
    "",
    ...inputPaths.sort().map((path) => `- artifact: \`${relative(repoRoot, path)}\`; sha256: \`${sha256(readFileSync(path))}\``),
    "",
  ].join("\n");
}

export function importOntologySourceReview({
  repoRoot = getRepoRoot(),
  packagePath,
  pass,
  inputPaths,
  receiptPath,
}: {
  repoRoot?: string;
  packagePath: string;
  pass: ReviewPass;
  inputPaths: string[];
  receiptPath: string;
}) {
  if (inputPaths.length === 0) throw new Error("Source review import requires at least one JSONL input");
  if (!receiptPath.startsWith("wiki/review/")) throw new Error("Source review receipt must live under wiki/review/");
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const absoluteInputs = inputPaths.map((path) => path.startsWith("/") ? path : join(repoRoot, path));
  for (const path of absoluteInputs) if (!existsSync(path)) throw new Error(`Missing source review input ${path}`);
  const sourcePath = join(absolutePackagePath, "source-units.jsonl");
  const findingPath = join(absolutePackagePath, "findings.jsonl");
  const sourceUnits = parseJsonl(sourcePath) as unknown as OntologyAuditSourceUnit[];
  const sourceByKey = new Map(sourceUnits.map((row) => [row.key, row]));
  const rawRows = absoluteInputs.flatMap(parseJsonl);
  const seenKeys = new Set<string>();
  const importedDialogues = new Set<string>();
  const findingsById = new Map<string, OntologyAuditFinding>();

  for (const raw of rawRows) {
    const key = string(raw.key, "source review key");
    if (seenKeys.has(key)) throw new Error(`Duplicate imported source review key ${key}`);
    seenKeys.add(key);
    const sourceUnit = sourceByKey.get(key);
    if (!sourceUnit) throw new Error(`Unknown frozen source unit ${key}`);
    const dialogue = string(raw.dialogue, `${key} dialogue`);
    if (dialogue !== sourceUnit.dialogue) throw new Error(`${key} dialogue differs from frozen unit`);
    importedDialogues.add(dialogue);
    const reviewer = string(raw.reviewer, `${key} reviewer`);
    const reviewedInputSha256 = string(raw.reviewed_input_sha256, `${key} reviewed_input_sha256`);
    if (reviewedInputSha256 !== sourceUnit[pass].reviewed_input_sha256) throw new Error(`${key} review input hash mismatch`);
    if (typeof raw.text_sha256 === "string" && raw.text_sha256 !== sourceUnit.text_sha256) throw new Error(`${key} source text hash mismatch`);
    const outcome = string(raw.outcome, `${key} outcome`);
    if (outcome !== "zero_result" && outcome !== "findings") throw new Error(`${key} has invalid outcome ${outcome}`);
    const findingIds = stringArray(raw.finding_ids ?? [], `${key} finding_ids`);
    const rawFindings = Array.isArray(raw.findings) ? raw.findings as RawFinding[] : [];
    const objectFindingIds = rawFindings.map((finding) => string(finding.finding_id, `${key} finding_id`));
    if (canonicalJson(sortedUnique(findingIds)) !== canonicalJson(sortedUnique(objectFindingIds))) {
      throw new Error(`${key} finding_ids do not equal embedded finding objects`);
    }
    if (outcome === "zero_result" && findingIds.length !== 0) throw new Error(`${key} zero_result carries findings`);
    if (outcome === "findings" && findingIds.length === 0) throw new Error(`${key} findings outcome is empty`);
    for (const finding of rawFindings) {
      const normalized = normalizeFinding(finding, pass, reviewer, key);
      findingsById.set(normalized.finding_id, mergeFinding(findingsById.get(normalized.finding_id), normalized));
    }
  }

  const expectedKeys = sourceUnits.filter((row) => importedDialogues.has(row.dialogue)).map((row) => row.key);
  if (canonicalJson(sortedUnique(expectedKeys)) !== canonicalJson(sortedUnique([...seenKeys]))) {
    const missing = expectedKeys.filter((key) => !seenKeys.has(key));
    throw new Error(`Imported ${pass} pass is not exact for selected dialogues; missing ${missing.slice(0, 12).join(", ")}`);
  }

  const normalizedFindings = [...findingsById.values()].sort((a, b) => a.finding_id.localeCompare(b.finding_id));
  const storedInputPaths = absoluteInputs.map((inputPath) => {
    const content = Buffer.from(canonicalJsonl(inputPath), "utf8");
    const contentSha256 = sha256(content);
    const storedPath = join(absolutePackagePath, "review-inputs", pass, `${contentSha256}-${basename(inputPath)}`);
    if (existsSync(storedPath) && sha256(readFileSync(storedPath)) !== contentSha256) {
      throw new Error(`Refusing to replace different stored review input ${storedPath}`);
    }
    mkdirSync(dirname(storedPath), { recursive: true });
    writeFileSync(storedPath, content);
    return storedPath;
  });
  const absoluteReceiptPath = join(repoRoot, receiptPath);
  const content = receiptContent({
    repoRoot,
    packagePath: absolutePackagePath,
    pass,
    inputPaths: storedInputPaths,
    rows: rawRows,
    findings: normalizedFindings,
  });
  if (existsSync(absoluteReceiptPath) && readFileSync(absoluteReceiptPath, "utf8") !== content) {
    throw new Error(`Refusing to overwrite different source review receipt ${receiptPath}`);
  }
  mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
  writeFileSync(absoluteReceiptPath, content, "utf8");
  const receiptSha256 = sha256(content);

  const rawByKey = new Map(rawRows.map((row) => [string(row.key, "source review key"), row]));
  for (const sourceUnit of sourceUnits) {
    const raw = rawByKey.get(sourceUnit.key);
    if (!raw) continue;
    const next = {
      state: "complete" as const,
      reviewer: string(raw.reviewer, `${sourceUnit.key} reviewer`),
      reviewed_input_sha256: string(raw.reviewed_input_sha256, `${sourceUnit.key} input hash`),
      outcome: string(raw.outcome, `${sourceUnit.key} outcome`) as "zero_result" | "findings",
      finding_ids: sortedUnique(stringArray(raw.finding_ids ?? [], `${sourceUnit.key} finding_ids`).map(canonicalFindingId)),
      receipt_path: receiptPath,
      receipt_sha256: receiptSha256,
    };
    const existing = sourceUnit[pass];
    if (existing.state === "complete" && canonicalJson(existing) !== canonicalJson(next)) {
      throw new Error(`Refusing to replace a different completed ${pass} pass for ${sourceUnit.key}`);
    }
    sourceUnit[pass] = next;
  }

  const existingFindings = existsSync(findingPath)
    ? parseJsonl(findingPath) as unknown as OntologyAuditFinding[]
    : [];
  const allFindings = new Map(existingFindings.map((finding) => [finding.finding_id, finding]));
  for (const finding of normalizedFindings) {
    allFindings.set(finding.finding_id, mergeFinding(allFindings.get(finding.finding_id), finding));
  }
  writeFileSync(sourcePath, renderJsonl(sourceUnits.sort((a, b) => a.key.localeCompare(b.key))), "utf8");
  writeFileSync(findingPath, renderJsonl([...allFindings.values()].sort((a, b) => a.finding_id.localeCompare(b.finding_id))), "utf8");
  refreshOntologyAuditBindings({ repoRoot, packagePath: absolutePackagePath });
  return {
    pass,
    dialogues: sortedUnique([...importedDialogues]),
    sourceUnits: rawRows.length,
    findings: normalizedFindings.length,
    receiptPath,
    receiptSha256,
    inputs: storedInputPaths.map((path) => ({ path: relative(repoRoot, path), sha256: sha256(readFileSync(path)) })),
  };
}

/**
 * Canonicalize legacy source-review inputs that preserved blank JSONL lines.
 *
 * Review inputs are immutable, content-addressed evidence, so normalization is
 * a hard rename: write canonical bytes under their new digest, rewrite the
 * receipt binding, rebind every completed source pass to the new receipt hash,
 * and only then remove the superseded artifact.
 */
export function canonicalizeOntologySourceReviewArtifacts({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath: string;
}) {
  const absolutePackagePath = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const packageLogicalPath = relative(repoRoot, absolutePackagePath).split("\\").join("/");
  if (packageLogicalPath.startsWith("../") || packageLogicalPath === "..") {
    throw new Error(`Ontology audit package escapes the repository: ${packagePath}`);
  }
  const sourcePath = join(absolutePackagePath, "source-units.jsonl");
  const sourceUnits = parseJsonl(sourcePath) as unknown as OntologyAuditSourceUnit[];
  const receiptPasses = new Map<string, Set<ReviewPass>>();
  for (const sourceUnit of sourceUnits) {
    for (const passName of ["primary", "independent"] as const) {
      const pass = sourceUnit[passName];
      if (pass.state !== "complete") continue;
      const passes = receiptPasses.get(pass.receipt_path) ?? new Set<ReviewPass>();
      passes.add(passName);
      receiptPasses.set(pass.receipt_path, passes);
    }
  }

  const nextReceiptHashes = new Map<string, string>();
  const supersededArtifacts = new Set<string>();
  const mappingArtifacts: Array<{ path: string; sha256: string }> = [];
  let artifactsChanged = 0;
  let receiptsChanged = 0;

  for (const [receiptPath, passes] of [...receiptPasses].sort(([left], [right]) => left.localeCompare(right))) {
    if (passes.size !== 1) {
      throw new Error(`${receiptPath} is shared across different source-review passes`);
    }
    const passName = [...passes][0]!;
    const receiptAbsolute = repositoryPath(repoRoot, receiptPath);
    if (!existsSync(receiptAbsolute)) throw new Error(`Missing source-review receipt ${receiptPath}`);
    const receiptBytes = readFileSync(receiptAbsolute);
    const receiptSha256 = sha256(receiptBytes);
    const boundReceiptHashes = new Set(sourceUnits.flatMap((sourceUnit) => {
      const pass = sourceUnit[passName];
      return pass.state === "complete" && pass.receipt_path === receiptPath ? [pass.receipt_sha256] : [];
    }));
    if (boundReceiptHashes.size !== 1 || !boundReceiptHashes.has(receiptSha256)) {
      throw new Error(`${receiptPath} is not bound consistently by completed ${passName} passes`);
    }

    let nextReceipt = receiptBytes.toString("utf8");
    let boundReviewInputs = 0;
    const receiptMappings: Array<{
      kind: "source_review_input_transport_normalization";
      pass: ReviewPass;
      receipt_path: string;
      old_path: string;
      old_sha256: string;
      new_path: string;
      new_sha256: string;
      transformation: "lf_no_blank_rows_exactly_one_final_lf";
    }> = [];
    const artifactPattern = /^- artifact: `([^`]+)`; sha256: `([a-f0-9]{64})`$/gmu;
    for (const binding of [...nextReceipt.matchAll(artifactPattern)]) {
      const artifactPath = binding[1]!;
      const artifactSha256 = binding[2]!;
      const expectedPrefix = `${packageLogicalPath}/review-inputs/${passName}/`;
      if (!artifactPath.startsWith(expectedPrefix)) continue;
      boundReviewInputs += 1;
      const artifactAbsolute = repositoryPath(repoRoot, artifactPath);
      if (!existsSync(artifactAbsolute) || sha256(readFileSync(artifactAbsolute)) !== artifactSha256) {
        throw new Error(`${receiptPath} binds a missing or hash-mismatched artifact: ${artifactPath}`);
      }
      const artifactName = basename(artifactPath);
      if (!artifactName.startsWith(`${artifactSha256}-`) || !artifactName.endsWith(".jsonl")) {
        throw new Error(`${artifactPath} is not named by its bound content digest`);
      }
      const canonicalContent = canonicalJsonl(artifactAbsolute);
      const canonicalSha256 = sha256(canonicalContent);
      const canonicalName = `${canonicalSha256}-${artifactName.slice(65)}`;
      const canonicalPath = `${expectedPrefix}${canonicalName}`;
      if (canonicalPath === artifactPath && canonicalSha256 === artifactSha256) continue;

      const canonicalAbsolute = repositoryPath(repoRoot, canonicalPath);
      if (existsSync(canonicalAbsolute) && readFileSync(canonicalAbsolute, "utf8") !== canonicalContent) {
        throw new Error(`Refusing to replace different canonical review input ${canonicalPath}`);
      }
      mkdirSync(dirname(canonicalAbsolute), { recursive: true });
      writeFileSync(canonicalAbsolute, canonicalContent, "utf8");
      nextReceipt = nextReceipt.replace(
        binding[0],
        `- artifact: \`${canonicalPath}\`; sha256: \`${canonicalSha256}\``,
      );
      supersededArtifacts.add(artifactAbsolute);
      receiptMappings.push({
        kind: "source_review_input_transport_normalization",
        pass: passName,
        receipt_path: receiptPath,
        old_path: artifactPath,
        old_sha256: artifactSha256,
        new_path: canonicalPath,
        new_sha256: canonicalSha256,
        transformation: "lf_no_blank_rows_exactly_one_final_lf",
      });
      artifactsChanged += 1;
    }
    if (boundReviewInputs === 0) {
      throw new Error(`${receiptPath} does not bind any ${passName} source-review inputs`);
    }
    if (receiptMappings.length > 0) {
      const mappingContent = renderJsonl(receiptMappings.sort((left, right) => left.old_path.localeCompare(right.old_path)));
      const mappingSha256 = sha256(mappingContent);
      const receiptSlug = basename(receiptPath).replace(/\.md$/u, "");
      const mappingPath = `${packageLogicalPath}/review-inputs/source-review-canonicalization/sha256-${mappingSha256}-${passName}-${receiptSlug}.jsonl`;
      const mappingAbsolute = repositoryPath(repoRoot, mappingPath);
      if (existsSync(mappingAbsolute) && readFileSync(mappingAbsolute, "utf8") !== mappingContent) {
        throw new Error(`Refusing to replace different source-review normalization mapping ${mappingPath}`);
      }
      mkdirSync(dirname(mappingAbsolute), { recursive: true });
      writeFileSync(mappingAbsolute, mappingContent, "utf8");
      nextReceipt = `${nextReceipt.trimEnd()}\n- artifact: \`${mappingPath}\`; sha256: \`${mappingSha256}\`\n`;
      mappingArtifacts.push({ path: mappingPath, sha256: mappingSha256 });
    }
    if (nextReceipt !== receiptBytes.toString("utf8")) {
      writeFileSync(receiptAbsolute, nextReceipt, "utf8");
      receiptsChanged += 1;
    }
    nextReceiptHashes.set(receiptPath, sha256(nextReceipt));
  }

  let sourceUnitsRebound = 0;
  for (const sourceUnit of sourceUnits) {
    for (const passName of ["primary", "independent"] as const) {
      const pass = sourceUnit[passName];
      if (pass.state !== "complete") continue;
      const nextReceiptSha256 = nextReceiptHashes.get(pass.receipt_path);
      if (!nextReceiptSha256 || pass.receipt_sha256 === nextReceiptSha256) continue;
      pass.receipt_sha256 = nextReceiptSha256;
      sourceUnitsRebound += 1;
    }
  }
  if (sourceUnitsRebound > 0) {
    writeFileSync(sourcePath, renderJsonl(sourceUnits.sort((left, right) => left.key.localeCompare(right.key))), "utf8");
  }
  for (const artifactPath of supersededArtifacts) {
    if (existsSync(artifactPath)) unlinkSync(artifactPath);
  }
  const bindings = refreshOntologyAuditBindings({ repoRoot, packagePath: absolutePackagePath });
  return {
    artifactsChanged,
    receiptsChanged,
    sourceUnitsRebound,
    mappingArtifacts,
    manifest: bindings.manifest,
    acceptance: bindings.acceptance,
  };
}

export function normalizeOntologyAuditFindingIds({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath: string;
}) {
  const absolute = packagePath.startsWith("/") ? packagePath : join(repoRoot, packagePath);
  const findingPath = join(absolute, "findings.jsonl");
  const sourcePath = join(absolute, "source-units.jsonl");
  const adjudicationPath = join(absolute, "adjudications.jsonl");
  const findings = parseJsonl(findingPath) as unknown as OntologyAuditFinding[];
  const sources = parseJsonl(sourcePath) as unknown as OntologyAuditSourceUnit[];
  const adjudications = parseJsonl(adjudicationPath) as unknown as OntologyAuditAdjudication[];
  const mapping = new Map(findings.map((finding) => [finding.finding_id, canonicalFindingId(finding.finding_id)]));
  if (new Set(mapping.values()).size !== mapping.size) throw new Error("Finding-id normalization would collide.");
  const mapId = (id: string) => mapping.get(id) ?? canonicalFindingId(id);
  for (const finding of findings) finding.finding_id = mapId(finding.finding_id);
  for (const source of sources) {
    if (source.primary.state === "complete") source.primary.finding_ids = sortedUnique(source.primary.finding_ids.map(mapId));
    if (source.independent.state === "complete") source.independent.finding_ids = sortedUnique(source.independent.finding_ids.map(mapId));
  }
  for (const adjudication of adjudications) adjudication.finding_ids = sortedUnique(adjudication.finding_ids.map(mapId));
  writeFileSync(findingPath, renderJsonl(findings.sort((left, right) => left.finding_id.localeCompare(right.finding_id))), "utf8");
  writeFileSync(sourcePath, renderJsonl(sources.sort((left, right) => left.key.localeCompare(right.key))), "utf8");
  writeFileSync(adjudicationPath, renderJsonl(adjudications.sort((left, right) => left.target_key.localeCompare(right.target_key))), "utf8");
  refreshOntologyAuditBindings({ repoRoot, packagePath: absolute });
  return {
    findings: findings.length,
    changed: [...mapping].filter(([before, after]) => before !== after).length,
  };
}

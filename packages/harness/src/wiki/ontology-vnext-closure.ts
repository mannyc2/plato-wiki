import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
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
  verifyOntologyAuditPackage,
} from "./ontology-audit.js";
import { acceptOntologyAuditClosure, bindOntologyAuditFinalState } from "./ontology-audit-finalization.js";
import { fencedYamlRecordBlocks, type CanonicalYamlRecord, type CanonicalYamlValue } from "./fenced-record.js";

export type OntologyRegenerationArtifact = {
  path: string;
  bytes: number;
  sha256: string;
};

export type OntologyClosureEvidence = {
  staleAliasIssues: string[];
  rejectedReaderLeaks: string[];
  terminalStateIssues: string[];
  acceptedClaimLinkIssues: string[];
  acceptedCommentaryCitationIssues: string[];
  acceptedRelationFictionIssues: string[];
};

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

function filesRecursively(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesRecursively(path) : entry.isFile() ? [path] : [];
    })
    .sort();
}

function isRecord(value: CanonicalYamlValue | undefined): value is CanonicalYamlRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function scalar(record: CanonicalYamlRecord, field: string) {
  const value = record[field];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";
}

function strings(value: CanonicalYamlValue | undefined) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function semanticLedgers(repoRoot: string) {
  const lanes = [
    ["observation", "wiki/observations", "observation_id"],
    ["claim", "wiki/claims", "claim_id"],
    ["relation", "wiki/relations", "relation_id"],
    ["commentary", "wiki/commentary", "commentary_id"],
    ["voice", "wiki/voices", "voice_id"],
  ] as const;
  return lanes.flatMap(([lane, directory, idField]) =>
    filesRecursively(join(repoRoot, directory))
      .filter((path) => path.endsWith(".md"))
      .flatMap((path) => fencedYamlRecordBlocks(readFileSync(path, "utf8")).map((block) => ({
        lane,
        path: relative(repoRoot, path).split("\\").join("/"),
        id: scalar(block.record, idField),
        record: block.record,
      })))
  );
}

const LEGACY_ALIAS_VALUE_RE = /(?:\bfeature(?:_candidate)?_[a-z0-9_]+\b|\b[a-z0-9_]+::[a-z0-9_]+\b)/gu;

export function forbiddenOntologyAliasPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return [...new Set([...value.matchAll(LEGACY_ALIAS_VALUE_RE)].map((match) => `${prefix}:value=${match[0]}`))];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => forbiddenOntologyAliasPaths(entry, `${prefix}[${index}]`));
  }
  if (value === null || typeof value !== "object") return [];
  const issues: string[] = [];
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (["feature_id", "feature_family", "feature_label", "legacy_family", "legacy_label"].includes(key)) issues.push(path);
    issues.push(...forbiddenOntologyAliasPaths(entry, path));
  }
  return issues;
}

function forbiddenAliasTokens(content: string) {
  const pattern = /\b(feature_id|feature_family|feature_label|legacy_family|legacy_label|feature(?:_candidate)?_[a-z0-9_]+|[a-z0-9_]+::[a-z0-9_]+)\b/gu;
  return [...new Set([...content.matchAll(pattern)].map((match) => match[1]!))].sort();
}

function parsedJsonLines(path: string) {
  const content = readFileSync(path, "utf8");
  if (path.endsWith(".jsonl")) return content.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as unknown);
  return [JSON.parse(content) as unknown];
}

function publicProjectionPaths(repoRoot: string) {
  return ["wiki/ontology", "wiki/clusters", "wiki/dossiers"].flatMap((root) =>
    filesRecursively(join(repoRoot, root)).filter((path) => path.endsWith(".json") || path.endsWith(".jsonl"))
  );
}

export function ontologyReaderProjectionPaths(repoRoot: string) {
  return [
    ...publicProjectionPaths(repoRoot),
    ...["derived/plato/joins", "derived/plato/voices"].flatMap((root) =>
      filesRecursively(join(repoRoot, root)).filter((path) => path.endsWith(".toon"))
    ),
  ].sort();
}

function recordIdsInReaderFiles(paths: readonly string[]) {
  const ids = new Set<string>();
  const pattern = /\b(?:obs|claim|rel|comm|voice)_[a-z0-9-]+_\d{4}\b/gu;
  for (const path of paths) {
    const content = readFileSync(path, "utf8");
    for (const match of content.matchAll(pattern)) ids.add(match[0]!);
  }
  return ids;
}

export function rejectedRecordIdsInReaderFiles(
  paths: readonly string[],
  rejectedRecordIds: ReadonlySet<string>,
) {
  const readerIds = recordIdsInReaderFiles(paths);
  return [...rejectedRecordIds].filter((id) => readerIds.has(id)).sort();
}

export function collectOntologyClosureEvidence({ repoRoot = getRepoRoot() }: { repoRoot?: string } = {}): OntologyClosureEvidence {
  if (repoRoot !== getRepoRoot()) throw new Error("Closure evidence must be collected from the active canonical repository.");
  const ledgers = semanticLedgers(repoRoot);
  const staleAliasIssues = ledgers.flatMap((entry) =>
    forbiddenOntologyAliasPaths(entry.record).map((field) => `${entry.path}:${entry.id}:${field}`)
  );
  for (const path of publicProjectionPaths(repoRoot)) {
    for (const [index, value] of parsedJsonLines(path).entries()) {
      for (const field of forbiddenOntologyAliasPaths(value)) {
        staleAliasIssues.push(`${relative(repoRoot, path).split("\\").join("/")}:${index + 1}:${field}`);
      }
    }
  }
  for (const path of ontologyReaderProjectionPaths(repoRoot).filter((entry) => entry.endsWith(".toon"))) {
    for (const field of forbiddenAliasTokens(readFileSync(path, "utf8"))) {
      staleAliasIssues.push(`${relative(repoRoot, path).split("\\").join("/")}:${field}`);
    }
  }

  const terminalStateIssues = ledgers.flatMap((entry) => {
    const status = scalar(entry.record, "review_status");
    return status === "unreviewed" || status === "needs_split" || /\b(?:todo|tbd)\b/iu.test(status)
      ? [`${entry.path}:${entry.id}:review_status=${status}`]
      : [];
  });
  const observationsById = new Map(
    ledgers.filter((entry) => entry.lane === "observation").map((entry) => [entry.id, entry]),
  );
  const claimsById = new Map(
    ledgers.filter((entry) => entry.lane === "claim").map((entry) => [entry.id, entry]),
  );
  const acceptedClaimLinkIssues: string[] = [];
  for (const claim of claimsById.values()) {
    if (scalar(claim.record, "review_status") !== "accepted") continue;
    const observationIds = strings(claim.record.observation_ids);
    if (observationIds.length === 0) acceptedClaimLinkIssues.push(`${claim.path}:${claim.id}:missing observation_ids`);
    for (const observationId of observationIds) {
      const observation = observationsById.get(observationId);
      if (!observation || scalar(observation.record, "review_status") !== "accepted") {
        acceptedClaimLinkIssues.push(`${claim.path}:${claim.id}:non-accepted observation ${observationId}`);
      } else if (!strings(observation.record.supports_claim_ids).includes(claim.id)) {
        acceptedClaimLinkIssues.push(`${claim.path}:${claim.id}:non-reciprocal observation ${observationId}`);
      }
    }
  }
  for (const observation of observationsById.values()) {
    if (scalar(observation.record, "review_status") !== "accepted") continue;
    for (const claimId of strings(observation.record.supports_claim_ids)) {
      const claim = claimsById.get(claimId);
      if (!claim || scalar(claim.record, "review_status") !== "accepted") {
        acceptedClaimLinkIssues.push(`${observation.path}:${observation.id}:non-accepted supported claim ${claimId}`);
      } else if (!strings(claim.record.observation_ids).includes(observation.id)) {
        acceptedClaimLinkIssues.push(`${observation.path}:${observation.id}:non-reciprocal supported claim ${claimId}`);
      }
    }
  }
  const acceptedCommentaryCitationIssues = ledgers
    .filter((entry) => entry.lane === "commentary" && scalar(entry.record, "review_status") === "accepted")
    .filter((entry) => {
      const cites = isRecord(entry.record.cites) ? entry.record.cites : {};
      return ["observations", "claims", "relations", "concepts", "dossiers"]
        .reduce((count, field) => count + strings(cites[field]).length, 0) === 0;
    })
    .map((entry) => `${entry.path}:${entry.id}`);
  const acceptedRelationFictionIssues = ledgers
    .filter((entry) => entry.lane === "relation" && scalar(entry.record, "review_status") === "accepted")
    .filter((entry) => /(?:no substantive relation|does not establish (?:a )?(?:semantic )?relation|mere (?:lexical |topic )?overlap|lexical overlap alone)/iu.test(
      [scalar(entry.record, "basis"), scalar(entry.record, "resolution")].join(" "),
    ))
    .map((entry) => `${entry.path}:${entry.id}`);

  const rejected = new Set(
    ledgers
      .filter((entry) => scalar(entry.record, "review_status") === "rejected")
      .map((entry) => entry.id)
      .filter(Boolean),
  );
  const workRoot = join(repoRoot, "../work");
  mkdirSync(workRoot, { recursive: true });
  const temporary = mkdtempSync(join(workRoot, "ontology-reader-leak-"));
  let rejectedReaderLeaks: string[];
  try {
    buildStaticSite({ outDir: temporary });
    const siteFiles = filesRecursively(temporary).filter((path) => /\.(?:html|json|js|css|xml|txt)$/u.test(path));
    rejectedReaderLeaks = rejectedRecordIdsInReaderFiles(
      [...ontologyReaderProjectionPaths(repoRoot), ...siteFiles],
      rejected,
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  return {
    staleAliasIssues: [...new Set(staleAliasIssues)].sort(),
    rejectedReaderLeaks,
    terminalStateIssues: [...new Set(terminalStateIssues)].sort(),
    acceptedClaimLinkIssues: [...new Set(acceptedClaimLinkIssues)].sort(),
    acceptedCommentaryCitationIssues: acceptedCommentaryCitationIssues.sort(),
    acceptedRelationFictionIssues: acceptedRelationFictionIssues.sort(),
  };
}

function removeToonFiles(directory: string) {
  for (const path of filesRecursively(directory)) if (path.endsWith(".toon")) unlinkSync(path);
}

function artifact(path: string, logicalPath: string): OntologyRegenerationArtifact {
  const content = readFileSync(path);
  return { path: logicalPath, bytes: content.byteLength, sha256: sha256(content) };
}

export function ontologyRegenerationDigest(artifacts: readonly OntologyRegenerationArtifact[]) {
  return sha256(canonicalJson([...artifacts].sort((left, right) => left.path.localeCompare(right.path))));
}

function generatedArtifacts(repoRoot: string, siteDirectory: string): OntologyRegenerationArtifact[] {
  const canonicalRoots = [
    "derived/plato/joins",
    "derived/plato/voices",
    "wiki/clusters",
    "wiki/dossiers",
  ];
  const canonical = canonicalRoots.flatMap((root) =>
    filesRecursively(join(repoRoot, root))
      .filter((path) => !path.endsWith(".toml"))
      .map((path) => artifact(path, relative(repoRoot, path).split("\\").join("/")))
  );
  canonical.push(artifact(join(repoRoot, "audio/coverage.md"), "audio/coverage.md"));
  canonical.push(artifact(join(repoRoot, "wiki/completeness.md"), "wiki/completeness.md"));
  const site = filesRecursively(siteDirectory).map((path) =>
    artifact(path, `site/${relative(siteDirectory, path).split("\\").join("/")}`)
  );
  return [...canonical, ...site].sort((left, right) => left.path.localeCompare(right.path));
}

function regenerateOnce(repoRoot: string, siteDirectory: string) {
  removeToonFiles(join(repoRoot, "derived/plato/joins"));
  removeToonFiles(join(repoRoot, "derived/plato/voices"));
  writeObservationTurnJoins();
  writeVoiceIndexes();
  writeVoiceJoins();
  writeClusterArtifacts();
  writeDossierArtifacts();
  writeAudioCoverageReport();
  writeCompletenessReport(buildCompletenessReport(auditCompletenessFacts()));
  buildStaticSite({ outDir: siteDirectory });
  const validationFailures = [
    ...validateClusterArtifacts(),
    ...validateDossierArtifacts(),
    ...validateAudioCoverageReport().map((issue) => issue.message),
    ...validateCompletenessReport().map((issue) => issue.message),
  ];
  if (validationFailures.length > 0) {
    throw new Error(`Generated ontology projections failed validation:\n${validationFailures.join("\n")}`);
  }
  const artifacts = generatedArtifacts(repoRoot, siteDirectory);
  return { artifacts, digest: ontologyRegenerationDigest(artifacts) };
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
  const packages = packagePath ? [packagePath] : listOntologyAuditPackagePaths(repoRoot);
  if (packages.length !== 1) throw new Error(`Expected exactly one ontology audit package; found ${packages.length}.`);
  const absolutePackage = packages[0]!.startsWith("/") ? packages[0]! : join(repoRoot, packages[0]!);
  const workRoot = join(repoRoot, "../work");
  mkdirSync(workRoot, { recursive: true });
  const temporary = mkdtempSync(join(workRoot, "ontology-regeneration-"));
  try {
    const first = regenerateOnce(repoRoot, join(temporary, "site-one"));
    const second = regenerateOnce(repoRoot, join(temporary, "site-two"));
    if (canonicalJson(first.artifacts) !== canonicalJson(second.artifacts) || first.digest !== second.digest) {
      throw new Error(`Ontology regeneration is not byte-stable: ${first.digest} != ${second.digest}.`);
    }
    const receipt = {
      schema_version: 1,
      state: "complete",
      clean_state_policy: "Each run removes every generated TOON table before rebuilding joins and voice indexes; cluster, dossier, and site writers replace their output trees.",
      generators: [
        "writeObservationTurnJoins",
        "writeVoiceIndexes",
        "writeVoiceJoins",
        "writeClusterArtifacts",
        "writeDossierArtifacts",
        "buildStaticSite",
      ],
      regeneration_one_sha256: first.digest,
      regeneration_two_sha256: second.digest,
      artifact_count: second.artifacts.length,
      artifacts: second.artifacts,
    };
    const receiptPath = join(absolutePackage, "regeneration.json");
    mkdirSync(dirname(receiptPath), { recursive: true });
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    return {
      receiptPath: relative(repoRoot, receiptPath).split("\\").join("/"),
      regenerationOneSha256: first.digest,
      regenerationTwoSha256: second.digest,
      artifacts: second.artifacts,
    };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

export function closeOntologyVNextAudit({
  repoRoot = getRepoRoot(),
  packagePath,
}: {
  repoRoot?: string;
  packagePath?: string;
} = {}) {
  const regeneration = regenerateOntologyArtifactsTwice({
    repoRoot,
    ...(packagePath === undefined ? {} : { packagePath }),
  });
  const evidence = collectOntologyClosureEvidence({ repoRoot });
  const evidenceGroups: Array<[string, readonly string[]]> = [
    ["stale ontology aliases", evidence.staleAliasIssues],
    ["rejected reader leaks", evidence.rejectedReaderLeaks],
    ["non-terminal semantic records", evidence.terminalStateIssues],
    ["accepted claims without observations", evidence.acceptedClaimLinkIssues],
    ["accepted commentary without citations", evidence.acceptedCommentaryCitationIssues],
    ["accepted schema-compliance non-relations", evidence.acceptedRelationFictionIssues],
  ];
  const failed = evidenceGroups.filter(([, issues]) => issues.length > 0);
  if (failed.length > 0) {
    throw new Error(
      `Ontology closure evidence failed:\n${failed.flatMap(([label, issues]) => [
        `${label}: ${issues.length}`,
        ...issues.slice(0, 20).map((issue) => `  ${issue}`),
      ]).join("\n")}`,
    );
  }
  const bound = bindOntologyAuditFinalState({
    repoRoot,
    ...(packagePath === undefined ? {} : { packagePath }),
  });
  const packageAbsolute = join(repoRoot, bound.packagePath);
  const evidencePath = join(packageAbsolute, "closure-evidence.json");
  writeFileSync(evidencePath, `${JSON.stringify({ schema_version: 1, state: "complete", ...evidence }, null, 2)}\n`, "utf8");
  const evidenceRelativePath = relative(repoRoot, evidencePath).split("\\").join("/");
  if (!bound.manifest.baseline_evidence) {
    throw new Error("Cannot close ontology audit without snapshot-bound baseline evidence.");
  }
  const baselineEvidenceRelativePath = `${bound.packagePath}/${bound.manifest.baseline_evidence.path}`;
  const closureArtifactPaths = [...new Set([
    baselineEvidenceRelativePath,
    regeneration.receiptPath,
    evidenceRelativePath,
    ...bound.rows.adjudications
      .map((row) => row.receipt_path)
      .filter((path): path is string => path !== null),
  ])].sort();
  const closureArtifactBindings = closureArtifactPaths.map((path) => {
    const absolute = join(repoRoot, path);
    if (!existsSync(absolute)) throw new Error(`Closure artifact is missing: ${path}`);
    return `- artifact: \`${path}\`; sha256: \`${sha256(readFileSync(absolute))}\``;
  });
  const receiptPath = "wiki/review/2026-08-30-ontology-vnext-closure.md";
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
  writeFileSync(join(repoRoot, receiptPath), receipt, "utf8");
  const accepted = acceptOntologyAuditClosure({
    repoRoot,
    ...(packagePath === undefined ? {} : { packagePath }),
    regenerationOneSha256: regeneration.regenerationOneSha256,
    regenerationTwoSha256: regeneration.regenerationTwoSha256,
    staleAliases: evidence.staleAliasIssues.length,
    rejectedReaderLeaks: evidence.rejectedReaderLeaks.length,
    receiptPath,
  });
  const verificationIssues = verifyOntologyAuditPackage({
    repoRoot,
    packagePath: packageAbsolute,
    verifyLiveFinal: true,
  });
  if (verificationIssues.length > 0) {
    throw new Error(`Closed ontology audit failed verification:\n${formatOntologyAuditIssues(verificationIssues)}`);
  }
  return { regeneration, evidence, bound, accepted, receiptPath };
}

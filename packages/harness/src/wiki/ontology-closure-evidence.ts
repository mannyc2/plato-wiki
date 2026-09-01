import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  fencedYamlRecordBlocks,
  type CanonicalYamlRecord,
  type CanonicalYamlValue,
} from "./fenced-record.js";
import { acceptedRelationDenialFromFields } from "./relation-validator.js";
import { resolveCanonicalOntologyAuditPackage } from "./ontology-audit-package-path.js";

export type OntologyClosureEvidence = {
  staleAliasIssues: string[];
  rejectedReaderLeaks: string[];
  terminalStateIssues: string[];
  acceptedClaimLinkIssues: string[];
  acceptedCommentaryCitationIssues: string[];
  acceptedRelationFictionIssues: string[];
};

export const ONTOLOGY_CLOSURE_EVIDENCE_FIELDS = [
  "staleAliasIssues",
  "rejectedReaderLeaks",
  "terminalStateIssues",
  "acceptedClaimLinkIssues",
  "acceptedCommentaryCitationIssues",
  "acceptedRelationFictionIssues",
] as const satisfies readonly (keyof OntologyClosureEvidence)[];

export type RecomputedOntologyClosureEvidence = Readonly<{
  evidence: OntologyClosureEvidence;
  content: string;
  sha256: string;
  site_tree_sha256: string;
  site_artifacts: readonly OntologyClosureEvidenceSiteArtifact[];
}>;

export type VerifiedOntologyClosureEvidenceProof = Readonly<{
  evidence: OntologyClosureEvidence;
  content: string;
  sha256: string;
  site_tree_sha256: string;
  site_artifacts: readonly OntologyClosureEvidenceSiteArtifact[];
  repoRoot: string;
  packagePath: string;
  siteDirectory: string;
}>;

const verifiedProofs = new WeakSet<object>();

export type OntologyClosureEvidenceSiteArtifact = Readonly<{
  path: string;
  bytes: number;
  sha256: string;
}>;

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

function canonicalDirectory(path: string, label: string) {
  const lexical = resolve(path);
  if (!existsSync(lexical)) throw new Error(`${label} is missing: ${lexical}`);
  const stat = lstatSync(lexical);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`${label} must be one real directory: ${lexical}`);
  }
  const real = realpathSync(lexical);
  if (real !== lexical) {
    throw new Error(`${label} must use its exact real path with no symlinked parent component: ${lexical} != ${real}`);
  }
  return lexical;
}

function filesRecursively(directory: string, required = false): string[] {
  const lexical = resolve(directory);
  if (!existsSync(lexical)) {
    if (required) throw new Error(`Required evidence directory is missing: ${lexical}`);
    return [];
  }
  const root = lstatSync(lexical);
  if (root.isSymbolicLink() || !root.isDirectory()) {
    throw new Error(`Expected a regular directory tree, found non-directory root: ${lexical}`);
  }
  const real = realpathSync(lexical);
  if (real !== lexical) {
    throw new Error(`Evidence tree must have no symlinked parent component: ${lexical} != ${real}`);
  }
  return readdirSync(lexical, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(lexical, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
        throw new Error(`Generated/audited trees may contain only regular files and directories: ${path}`);
      }
      return stat.isDirectory() ? filesRecursively(path, true) : [path];
    })
    .sort((left, right) => left.localeCompare(right));
}

function siteArtifacts(siteDirectory: string, files: readonly string[]) {
  return Object.freeze(files.map((path) => Object.freeze({
    path: relative(siteDirectory, path).split("\\").join("/"),
    bytes: statSync(path).size,
    sha256: sha256(readFileSync(path)),
  })));
}

export function ontologyClosureEvidenceSiteTreeSha256(
  artifacts: readonly OntologyClosureEvidenceSiteArtifact[],
) {
  return sha256(canonicalJson(artifacts));
}

/**
 * Bind the exact site tree used to recompute semantic closure evidence to the
 * site descriptors recorded by deterministic regeneration.  Callers must
 * first assert the proof against its repository/package/site identity; this
 * helper deliberately accepts only proofs minted by this module so a plain
 * caller-supplied object cannot stand in for a verified site observation.
 */
export function assertOntologyClosureEvidenceRegenerationBinding(
  proof: VerifiedOntologyClosureEvidenceProof,
  {
    closureEvidenceSha256,
    siteTreeSha256,
    siteArtifacts: observedSiteArtifacts,
  }: {
    closureEvidenceSha256: string;
    siteTreeSha256: string;
    siteArtifacts: readonly OntologyClosureEvidenceSiteArtifact[];
  },
) {
  if (!verifiedProofs.has(proof)) {
    throw new Error("Ontology closure evidence regeneration binding requires an exact verified proof.");
  }
  const normalized = [...observedSiteArtifacts]
    .map((entry) => ({ ...entry }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const expected = [...proof.site_artifacts]
    .map((entry) => ({ ...entry }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const observedTreeSha256 = ontologyClosureEvidenceSiteTreeSha256(normalized);
  if (
    closureEvidenceSha256 !== proof.sha256
    || siteTreeSha256 !== proof.site_tree_sha256
    || observedTreeSha256 !== siteTreeSha256
    || canonicalJson(normalized) !== canonicalJson(expected)
  ) {
    throw new Error(
      "Regeneration receipt site descriptors do not exactly match the site tree used for closure-evidence proof.",
    );
  }
  return proof;
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

function acceptedRelationFictionIssuesFromLedgers(ledgers: ReturnType<typeof semanticLedgers>) {
  return ledgers
    .filter((entry) => entry.lane === "relation")
    .flatMap((entry) => {
      const denial = acceptedRelationDenialFromFields({
        reviewStatus: scalar(entry.record, "review_status"),
        relationKind: scalar(entry.record, "relation_kind"),
        resolution: scalar(entry.record, "resolution"),
        basis: scalar(entry.record, "basis"),
        limits: scalar(entry.record, "limits"),
      });
      return denial ? [`${entry.path}:${entry.id}:${denial.rule}`] : [];
    })
    .sort();
}

export function collectAcceptedRelationFictionIssues(repoRoot: string) {
  return acceptedRelationFictionIssuesFromLedgers(semanticLedgers(canonicalDirectory(repoRoot, "Repository root")));
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
  const absolute = canonicalDirectory(repoRoot, "Repository root");
  return [
    ...publicProjectionPaths(absolute),
    ...["derived/plato/joins", "derived/plato/voices"].flatMap((root) =>
      filesRecursively(join(absolute, root)).filter((path) => path.endsWith(".toon"))
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

function frozenEvidence(evidence: OntologyClosureEvidence): OntologyClosureEvidence {
  const result = {} as OntologyClosureEvidence;
  for (const field of ONTOLOGY_CLOSURE_EVIDENCE_FIELDS) {
    result[field] = Object.freeze([...evidence[field]]) as string[];
  }
  return Object.freeze(result);
}

export function renderOntologyClosureEvidence(evidence: OntologyClosureEvidence) {
  return `${JSON.stringify({ schema_version: 1, state: "complete", ...evidence }, null, 2)}\n`;
}

export function recomputeOntologyClosureEvidence({
  repoRoot,
  siteDirectory,
}: {
  repoRoot: string;
  siteDirectory: string;
}): RecomputedOntologyClosureEvidence {
  const root = canonicalDirectory(repoRoot, "Repository root");
  const site = canonicalDirectory(siteDirectory, "Prebuilt site directory");
  const siteFiles = filesRecursively(site, true);
  const ledgers = semanticLedgers(root);
  const staleAliasIssues = ledgers.flatMap((entry) =>
    forbiddenOntologyAliasPaths(entry.record).map((field) => `${entry.path}:${entry.id}:${field}`)
  );
  for (const path of publicProjectionPaths(root)) {
    for (const [index, value] of parsedJsonLines(path).entries()) {
      for (const field of forbiddenOntologyAliasPaths(value)) {
        staleAliasIssues.push(`${relative(root, path).split("\\").join("/")}:${index + 1}:${field}`);
      }
    }
  }
  for (const path of ontologyReaderProjectionPaths(root).filter((entry) => entry.endsWith(".toon"))) {
    for (const field of forbiddenAliasTokens(readFileSync(path, "utf8"))) {
      staleAliasIssues.push(`${relative(root, path).split("\\").join("/")}:${field}`);
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
  const acceptedRelationFictionIssues = acceptedRelationFictionIssuesFromLedgers(ledgers);
  const rejected = new Set(
    ledgers
      .filter((entry) => scalar(entry.record, "review_status") === "rejected")
      .map((entry) => entry.id)
      .filter(Boolean),
  );
  const readableSiteFiles = siteFiles.filter((path) => /\.(?:html|json|js|css|xml|txt)$/u.test(path));
  const evidence = frozenEvidence({
    staleAliasIssues: [...new Set(staleAliasIssues)].sort(),
    rejectedReaderLeaks: rejectedRecordIdsInReaderFiles(
      [...ontologyReaderProjectionPaths(root), ...readableSiteFiles],
      rejected,
    ),
    terminalStateIssues: [...new Set(terminalStateIssues)].sort(),
    acceptedClaimLinkIssues: [...new Set(acceptedClaimLinkIssues)].sort(),
    acceptedCommentaryCitationIssues: acceptedCommentaryCitationIssues.sort(),
    acceptedRelationFictionIssues: acceptedRelationFictionIssues.sort(),
  });
  const content = renderOntologyClosureEvidence(evidence);
  const exactSiteArtifacts = siteArtifacts(site, siteFiles);
  return Object.freeze({
    evidence,
    content,
    sha256: sha256(content),
    site_tree_sha256: ontologyClosureEvidenceSiteTreeSha256(exactSiteArtifacts),
    site_artifacts: exactSiteArtifacts,
  });
}

export function verifyOntologyClosureEvidenceFile({
  repoRoot,
  packagePath,
  siteDirectory,
}: {
  repoRoot: string;
  packagePath: string;
  siteDirectory: string;
}): VerifiedOntologyClosureEvidenceProof {
  const resolvedPackage = resolveCanonicalOntologyAuditPackage({ repoRoot, packagePath });
  const root = resolvedPackage.repoRoot;
  const auditPackage = resolvedPackage.absolute;
  const site = canonicalDirectory(siteDirectory, "Prebuilt site directory");
  const evidencePath = join(auditPackage, "closure-evidence.json");
  if (!existsSync(evidencePath)) throw new Error(`Ontology closure evidence is missing: ${evidencePath}`);
  const evidenceStat = lstatSync(evidencePath);
  if (evidenceStat.isSymbolicLink() || !evidenceStat.isFile()) {
    throw new Error(`Ontology closure evidence must be a regular file: ${evidencePath}`);
  }
  const recomputed = recomputeOntologyClosureEvidence({ repoRoot: root, siteDirectory: site });
  const actual = readFileSync(evidencePath, "utf8");
  if (actual !== recomputed.content) {
    throw new Error(
      `Ontology closure evidence differs from deterministic recomputation: expected ${recomputed.sha256}, observed ${sha256(actual)}.`,
    );
  }
  const proof = Object.freeze({
    ...recomputed,
    repoRoot: root,
    packagePath: auditPackage,
    siteDirectory: site,
  });
  verifiedProofs.add(proof);
  return proof;
}

export function assertOntologyClosureEvidenceProof(
  proof: VerifiedOntologyClosureEvidenceProof,
  {
    repoRoot,
    packagePath,
    siteDirectory,
  }: {
    repoRoot: string;
    packagePath: string;
    siteDirectory: string;
  },
) {
  if (!verifiedProofs.has(proof)) throw new Error("Ontology closure evidence proof was not produced by exact verification.");
  const resolvedPackage = resolveCanonicalOntologyAuditPackage({ repoRoot, packagePath });
  const expectedRoot = resolvedPackage.repoRoot;
  const expectedPackage = resolvedPackage.absolute;
  const expectedSite = canonicalDirectory(siteDirectory, "Prebuilt site directory");
  if (proof.repoRoot !== expectedRoot || proof.packagePath !== expectedPackage || proof.siteDirectory !== expectedSite) {
    throw new Error("Ontology closure evidence proof belongs to a different repository, package, or prebuilt site.");
  }
  const evidencePath = join(expectedPackage, "closure-evidence.json");
  if (!existsSync(evidencePath) || lstatSync(evidencePath).isSymbolicLink() || !lstatSync(evidencePath).isFile()) {
    throw new Error(`Ontology closure evidence proof target is no longer a regular file: ${evidencePath}`);
  }
  const recomputed = recomputeOntologyClosureEvidence({
    repoRoot: expectedRoot,
    siteDirectory: expectedSite,
  });
  const currentContent = readFileSync(evidencePath, "utf8");
  if (currentContent !== proof.content || currentContent !== recomputed.content ||
    proof.sha256 !== recomputed.sha256 || proof.site_tree_sha256 !== recomputed.site_tree_sha256 ||
    canonicalJson(proof.site_artifacts) !== canonicalJson(recomputed.site_artifacts)) {
    throw new Error("Ontology closure evidence proof is stale after evidence, ledger, projection, or site mutation.");
  }
  return proof;
}

export function assertOntologyClosureEvidenceIsZero(evidence: OntologyClosureEvidence) {
  const labels: Record<keyof OntologyClosureEvidence, string> = {
    staleAliasIssues: "stale ontology aliases",
    rejectedReaderLeaks: "rejected reader leaks",
    terminalStateIssues: "non-terminal semantic records",
    acceptedClaimLinkIssues: "accepted claims without observations",
    acceptedCommentaryCitationIssues: "accepted commentary without citations",
    acceptedRelationFictionIssues: "accepted schema-compliance non-relations",
  };
  const failed = ONTOLOGY_CLOSURE_EVIDENCE_FIELDS
    .filter((field) => evidence[field].length > 0)
    .map((field) => [labels[field], evidence[field]] as const);
  if (failed.length > 0) {
    throw new Error(
      `Ontology closure evidence failed:\n${failed.flatMap(([label, issues]) => [
        `${label}: ${issues.length}`,
        ...issues.slice(0, 20).map((issue) => `  ${issue}`),
      ]).join("\n")}`,
    );
  }
}

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { parseCommentaryQualityAudit } from "../../packages/harness/src/commentary-audit.js";
import { getRepoRoot } from "../../packages/harness/src/paths.js";

type Binding = { path: string; sha256: string };
type EvidenceRow = {
  schema_version: 1;
  dialogue: string;
  unit_key: string;
  section_id: string;
  commentary_ids: string[];
  audit_output: Binding;
  audit: Record<string, unknown>;
  submission: Binding;
  receipt: Binding;
};

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

function filesRecursively(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesRecursively(path) : entry.isFile() ? [path] : [];
  }).sort();
}

function relativePath(repoRoot: string, path: string) {
  return relative(repoRoot, path).split("\\").join("/");
}

function parseJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function reviewedAuditBytes(repoRoot: string, declaredPath: string, expectedSha256: string) {
  const current = join(repoRoot, declaredPath);
  if (existsSync(current)) {
    const bytes = readFileSync(current);
    if (sha256(bytes) === expectedSha256) return bytes;
  }
  const historical = filesRecursively(join(repoRoot, "scratch/commentary/campaign-history"))
    .filter((path) => path.endsWith(".output.json"))
    .filter((path) => sha256(readFileSync(path)) === expectedSha256);
  if (historical.length !== 1) {
    throw new Error(`${declaredPath}: expected one live or immutable historical reviewed output for ${expectedSha256}, found ${historical.length}`);
  }
  return readFileSync(historical[0]!);
}

function exactBinding(repoRoot: string, value: unknown, label: string): Binding {
  if (value === null || typeof value !== "object") throw new Error(`${label}: expected binding`);
  const binding = value as Record<string, unknown>;
  if (typeof binding.path !== "string" || typeof binding.sha256 !== "string") {
    throw new Error(`${label}: malformed binding`);
  }
  if (sha256(readFileSync(join(repoRoot, binding.path))) !== binding.sha256) {
    throw new Error(`${label}: binding hash mismatch`);
  }
  return { path: binding.path, sha256: binding.sha256 };
}

// The output schema fixes this order. This reconstructs the exact reviewed JSON
// even when a later sequential batch has reused the same scratch path.
function orderedAudit(value: unknown): Record<string, unknown> {
  const audit = parseCommentaryQualityAudit(value, { path: "embedded structural audit" });
  return {
    schema_version: audit.schema_version,
    dialogue: audit.dialogue,
    unit_key: audit.unit_key,
    section_id: audit.section_id,
    authoring: { model: audit.authoring.model, effort: audit.authoring.effort },
    unit_verdict: audit.unit_verdict,
    blocks: audit.blocks.map((block) => ({
      commentary_id: block.commentary_id,
      disposition: block.disposition,
      issue_codes: block.issue_codes,
      checks: {
        evidence: { verdict: block.checks.evidence.verdict },
        placement: {
          verdict: block.checks.placement.verdict,
          hazard_codes: block.checks.placement.hazard_codes,
        },
        listening: { verdict: block.checks.listening.verdict },
      },
      rationale: block.rationale,
    })),
  };
}

function replayBytes(value: unknown) {
  return `${JSON.stringify(orderedAudit(value), null, 2)}\n`;
}

function canonicalEvidenceRow(row: EvidenceRow) {
  // The top-level lane is canonical while the embedded audit retains the
  // output-schema property order needed to replay its exact reviewed bytes.
  return `{"audit":${JSON.stringify(row.audit)},"audit_output":${canonicalJson(row.audit_output)},"commentary_ids":${canonicalJson(row.commentary_ids)},"dialogue":${JSON.stringify(row.dialogue)},"receipt":${canonicalJson(row.receipt)},"schema_version":1,"section_id":${JSON.stringify(row.section_id)},"submission":${canonicalJson(row.submission)},"unit_key":${JSON.stringify(row.unit_key)}}`;
}

function parseEvidenceFile(path: string): EvidenceRow[] {
  const bytes = readFileSync(path, "utf8");
  const namedHash = /^sha256-([a-f0-9]{64})-commentary-structural-review-evidence\.jsonl$/u.exec(basename(path))?.[1];
  if (!namedHash || sha256(bytes) !== namedHash) throw new Error(`${path}: invalid content address`);
  return bytes.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as EvidenceRow);
}

function ids(rows: readonly EvidenceRow[]) {
  return new Set(rows.flatMap((row) => row.commentary_ids));
}

function replayLaterSampleLedgerTransitions(repoRoot: string, dialogue: string, structuralFinalHash: string) {
  const directory = join(repoRoot, "wiki/submissions/commentary-sample-failure-rejection", dialogue);
  const transitions = existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true }).map((entry) => {
        if (!entry.isFile() || !/^[a-f0-9]{64}\.json$/u.test(entry.name)) {
          throw new Error(`${relativePath(repoRoot, join(directory, entry.name))}: invalid sample-rejection submission`);
        }
        const value = parseJson(join(directory, entry.name));
        const ledger = value.ledger as Record<string, unknown> | undefined;
        if (ledger?.path !== `wiki/commentary/${dialogue}.md` || typeof ledger.sha256_before !== "string" ||
          typeof ledger.sha256_after !== "string") {
          throw new Error(`${relativePath(repoRoot, join(directory, entry.name))}: invalid sample ledger transition`);
        }
        return { before: ledger.sha256_before, after: ledger.sha256_after };
      })
    : [];
  let cursor = structuralFinalHash;
  const remaining = [...transitions];
  while (remaining.length > 0) {
    const matches = remaining.flatMap((entry, index) => entry.before === cursor ? [{ entry, index }] : []);
    if (matches.length !== 1) throw new Error(`${dialogue}: later sample ledger transitions do not continue uniquely`);
    cursor = matches[0]!.entry.after;
    remaining.splice(matches[0]!.index, 1);
  }
  return cursor;
}

const repoRoot = getRepoRoot();
const packageRoots = readdirSync(join(repoRoot, "wiki/ontology-audits"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name));
if (packageRoots.length !== 1) throw new Error(`Expected one ontology audit package, found ${packageRoots.length}`);
const evidenceDirectory = join(
  repoRoot,
  "wiki/ontology-audits",
  packageRoots[0]!.name,
  "review-inputs/final-adjustment-evidence",
);
const evidenceFiles = existsSync(evidenceDirectory)
  ? readdirSync(evidenceDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-commentary-structural-review-evidence\.jsonl$/u.test(entry.name))
      .map((entry) => join(evidenceDirectory, entry.name))
  : [];
const bases = evidenceFiles.map((path) => ({ path, rows: parseEvidenceFile(path) }))
  .sort((left, right) => ids(right.rows).size - ids(left.rows).size);
if (bases.length > 1 && ids(bases[0]!.rows).size === ids(bases[1]!.rows).size) {
  throw new Error("Multiple maximal structural evidence bases");
}

const rows: EvidenceRow[] = [];
const seenIds = new Set<string>();
const seenSubmissions = new Set<string>();
const seenReceipts = new Set<string>();
for (const prior of bases[0]?.rows ?? []) {
  const submission = exactBinding(repoRoot, prior.submission, `${prior.dialogue}/${prior.unit_key} submission`);
  const receipt = exactBinding(repoRoot, prior.receipt, `${prior.dialogue}/${prior.unit_key} receipt`);
  const audit = orderedAudit(prior.audit);
  if (sha256(replayBytes(audit)) !== prior.audit_output.sha256) {
    throw new Error(`${prior.dialogue}/${prior.unit_key}: embedded audit does not replay reviewed bytes`);
  }
  const parsed = parseCommentaryQualityAudit(audit, { path: `${prior.dialogue}/${prior.unit_key}` });
  for (const id of prior.commentary_ids) {
    const block = parsed.blocks.find((entry) => entry.commentary_id === id);
    if (!block || block.disposition === "pass") throw new Error(`${id}: missing non-pass audit block`);
    if (seenIds.has(id)) throw new Error(`Duplicate operation ${id}`);
    seenIds.add(id);
  }
  seenSubmissions.add(submission.path);
  seenReceipts.add(receipt.path);
  rows.push({ ...prior, audit, submission, receipt });
}

const submissionPaths = filesRecursively(join(repoRoot, "wiki/submissions/commentary"))
  .filter((path) => path.endsWith("-structural-remediation-batch.json"));
const receiptPaths = readdirSync(join(repoRoot, "wiki/review"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && /^2026-09-01-commentary-structural-remediation-batch-.+\.md$/u.test(entry.name))
  .map((entry) => join(repoRoot, "wiki/review", entry.name))
  .sort();
if (submissionPaths.length === 0 || submissionPaths.length !== receiptPaths.length) {
  throw new Error(`Expected one receipt per non-empty structural submission; found ${submissionPaths.length}/${receiptPaths.length}`);
}
const submissions = submissionPaths.map((path) => ({ path, value: parseJson(path) }));
const exactOperationIds = new Set(submissions.flatMap(({ path, value }) => {
  if (!Array.isArray(value.applied_ids) || value.applied_ids.length === 0 ||
    value.applied_ids.some((id) => typeof id !== "string")) {
    throw new Error(`${relativePath(repoRoot, path)}: applied_ids must be a non-empty string list`);
  }
  return value.applied_ids as string[];
}));
if (exactOperationIds.size !== submissions.reduce((count, entry) =>
  count + (entry.value.applied_ids as string[]).length, 0)) {
  throw new Error("Structural submissions contain duplicate operation IDs");
}
const candidatePaths = filesRecursively(join(repoRoot, "scratch/commentary/structural-remediation"))
  .filter((path) => basename(path) === "audit-failures-batch.json");

for (const candidatePath of candidatePaths) {
  const candidateBytes = readFileSync(candidatePath);
  const candidate = JSON.parse(candidateBytes.toString("utf8")) as Record<string, unknown>;
  if (typeof candidate.dialogue !== "string" || !Array.isArray(candidate.auditUnits)) {
    throw new Error(`${candidatePath}: malformed candidate`);
  }
  const candidateIds = candidate.auditUnits.flatMap((rawUnit) => {
    const operations = (rawUnit as Record<string, unknown>).operations;
    if (!Array.isArray(operations)) throw new Error(`${candidatePath}: malformed operations`);
    return operations.map((rawOperation) => {
      const id = (rawOperation as Record<string, unknown>).commentaryId;
      if (typeof id !== "string") throw new Error(`${candidatePath}: malformed operation`);
      return id;
    });
  });
  if (candidateIds.every((id) => seenIds.has(id))) continue;
  if (candidateIds.some((id) => seenIds.has(id))) throw new Error(`${candidatePath}: partially represented batch`);

  const matches = submissions.filter(({ value }) =>
    value.kind === "structural-remediation-batch" &&
    value.scope === candidate.dialogue &&
    value.source_sha256 === sha256(candidateBytes));
  if (matches.length !== 1) throw new Error(`${candidatePath}: expected one exact submission, found ${matches.length}`);
  const submissionEntry = matches[0]!;
  const submissionPath = relativePath(repoRoot, submissionEntry.path);
  if (canonicalJson((submissionEntry.value.submission as Record<string, unknown>)?.candidate) !== canonicalJson(candidate)) {
    throw new Error(`${submissionPath}: embedded candidate differs`);
  }
  const receiptMatches = receiptPaths.filter((path) =>
    readFileSync(path, "utf8").split(/\r?\n/u).includes(`submission_record_path: ${submissionPath}`));
  if (receiptMatches.length !== 1) throw new Error(`${submissionPath}: expected one receipt, found ${receiptMatches.length}`);
  const submission = { path: submissionPath, sha256: sha256(readFileSync(submissionEntry.path)) };
  const receipt = { path: relativePath(repoRoot, receiptMatches[0]!), sha256: sha256(readFileSync(receiptMatches[0]!)) };
  const appliedIds: string[] = [];

  for (const rawUnit of candidate.auditUnits) {
    const unit = rawUnit as Record<string, unknown>;
    if (!Array.isArray(unit.operations) || unit.operations.length === 0) continue;
    if (typeof unit.auditOutputPath !== "string" || typeof unit.auditOutputSha256 !== "string" ||
      typeof unit.unitKey !== "string" || typeof unit.sectionId !== "string") {
      throw new Error(`${candidate.dialogue}: malformed audit unit`);
    }
    const bytes = reviewedAuditBytes(repoRoot, unit.auditOutputPath, unit.auditOutputSha256);
    const rawAudit = JSON.parse(bytes.toString("utf8"));
    const audit = orderedAudit(rawAudit);
    if (sha256(replayBytes(audit)) !== unit.auditOutputSha256) {
      throw new Error(`${unit.auditOutputPath}: parsed audit does not replay exact bytes`);
    }
    const parsed = parseCommentaryQualityAudit(audit, { path: unit.auditOutputPath });
    if (parsed.dialogue !== candidate.dialogue || parsed.unit_key !== unit.unitKey || parsed.section_id !== unit.sectionId) {
      throw new Error(`${unit.auditOutputPath}: identity differs from candidate`);
    }
    const commentaryIds = unit.operations.map((rawOperation) => {
      const id = (rawOperation as Record<string, unknown>).commentaryId;
      if (typeof id !== "string") throw new Error(`${unit.auditOutputPath}: malformed operation`);
      const block = parsed.blocks.find((entry) => entry.commentary_id === id);
      if (!block || block.disposition === "pass") throw new Error(`${unit.auditOutputPath}: ${id} lacks non-pass finding`);
      if (seenIds.has(id)) throw new Error(`Duplicate operation ${id}`);
      seenIds.add(id);
      appliedIds.push(id);
      return id;
    }).sort();
    rows.push({
      schema_version: 1,
      dialogue: candidate.dialogue,
      unit_key: unit.unitKey,
      section_id: unit.sectionId,
      commentary_ids: commentaryIds,
      audit_output: { path: unit.auditOutputPath, sha256: unit.auditOutputSha256 },
      audit,
      submission,
      receipt,
    });
  }
  if (canonicalJson([...appliedIds].sort()) !== canonicalJson([...(submissionEntry.value.applied_ids as string[])].sort())) {
    throw new Error(`${submissionPath}: applied IDs differ from candidate operations`);
  }
  seenSubmissions.add(submission.path);
  seenReceipts.add(receipt.path);
}

if (canonicalJson([...seenIds].sort()) !== canonicalJson([...exactOperationIds].sort())) {
  throw new Error(`Structural evidence operation set differs from ${exactOperationIds.size} exact submitted operations`);
}
const exactSubmissions = submissionPaths.map((path) => relativePath(repoRoot, path)).sort();
const exactReceipts = receiptPaths.map((path) => relativePath(repoRoot, path)).sort();
if (canonicalJson([...seenSubmissions].sort()) !== canonicalJson(exactSubmissions) ||
  canonicalJson([...seenReceipts].sort()) !== canonicalJson(exactReceipts)) {
  throw new Error("Evidence does not cover the exact submission/receipt set");
}

const byDialogue = new Map<string, Array<{ path: string; value: Record<string, unknown> }>>();
for (const entry of submissions) {
  if (typeof entry.value.scope !== "string") throw new Error(`${entry.path}: missing scope`);
  const entries = byDialogue.get(entry.value.scope) ?? [];
  entries.push(entry);
  byDialogue.set(entry.value.scope, entries);
}
for (const [dialogue, entries] of byDialogue) {
  entries.sort((left, right) => left.path.localeCompare(right.path));
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1]!.value.target_sha256_after !== entries[index]!.value.target_sha256_before) {
      throw new Error(`${dialogue}: sequential ledger hashes do not chain`);
    }
  }
  const finalHash = entries.at(-1)!.value.target_sha256_after;
  if (typeof finalHash !== "string" ||
    sha256(readFileSync(join(repoRoot, `wiki/commentary/${dialogue}.md`))) !==
      replayLaterSampleLedgerTransitions(repoRoot, dialogue, finalHash)) {
    throw new Error(`${dialogue}: final ledger hash differs from current canonical ledger`);
  }
}

rows.sort((left, right) => left.dialogue.localeCompare(right.dialogue) ||
  left.unit_key.localeCompare(right.unit_key) || left.submission.path.localeCompare(right.submission.path));
const content = `${rows.map(canonicalEvidenceRow).join("\n")}\n`;
const digest = sha256(content);
const outputPath = join(evidenceDirectory, `sha256-${digest}-commentary-structural-review-evidence.jsonl`);
if (process.argv.includes("--write")) {
  mkdirSync(dirname(outputPath), { recursive: true });
  if (existsSync(outputPath) && readFileSync(outputPath, "utf8") !== content) throw new Error(`Collision at ${outputPath}`);
  writeFileSync(outputPath, content, "utf8");
  for (const priorPath of evidenceFiles) {
    if (priorPath !== outputPath) rmSync(priorPath);
  }
}
console.log(JSON.stringify({
  path: relativePath(repoRoot, outputPath),
  sha256: digest,
  rows: rows.length,
  commentary_ids: seenIds.size,
  submissions: seenSubmissions.size,
  receipts: seenReceipts.size,
  base_artifact: bases[0] ? relativePath(repoRoot, bases[0].path) : null,
  written: process.argv.includes("--write"),
}, null, 2));

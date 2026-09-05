import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import {
  buildOntologyVNextFromConceptAudit,
  buildOntologyVNextMembershipProposals,
  readOntologyConceptAudit,
} from "../../packages/harness/src/wiki/ontology-concept-audit.js";
import {
  fencedYamlRecordBlocks,
  replaceFencedYamlRecordBlocks,
  serializeCanonicalYamlRecord,
  type CanonicalYamlRecord,
  type CanonicalYamlValue,
} from "../../packages/harness/src/wiki/fenced-record.js";
import { readObservationReviewStatuses } from "../../packages/harness/src/wiki/ontology-vnext-repository.js";
import { deriveOntologyVNextMembershipId } from "../../packages/harness/src/wiki/ontology-vnext.js";
import { validateObservationLedger } from "../../packages/harness/src/wiki/observation-validator.js";
import { resolveSourceSpan } from "../../packages/harness/src/source.js";

type JsonObject = Record<string, unknown>;

type ReviewRow = {
  membership_id: string;
  observation_id: string;
  concept_id: string;
  decision: "keep" | "drop";
  rationale: string;
  source_ref: {
    source_path: string;
    stephanus_span: string;
    start_char: number;
    end_char: number;
    text_sha256?: string;
  };
};

type CanonicalSourceRef = {
  source_path: string;
  stephanus_span: string;
  start_marker: string;
  end_marker: string;
  start_char: number;
  end_char: number;
  text_sha256: string;
};

type AnchorCorrectionRow = {
  observation_id: string;
  current_source_ref: CanonicalSourceRef;
  corrected_source_ref: CanonicalSourceRef;
  corrected_observation: string;
  corrected_textual_basis: string;
  corrected_limits: string;
  rationale: string;
  membership_decision: "keep" | "drop";
};

type KnownFalseMembershipRow = {
  membership_id: string;
  observation_id: string;
  concept_id: string;
  reason: string;
};

type MembershipDisagreementRow = {
  membership_id: string;
  observation_id: string;
  concept_id: string;
  primary_decision: "keep" | "drop";
  independent_decision: "keep" | "drop";
  final_decision: "keep" | "drop";
  rationale: string;
  source_ref: CanonicalSourceRef;
  reviewer: string;
};

type SourceOmissionRow = {
  adjudication: string;
  concept_id: string;
  defect_class: "source_omission";
  defect_id: string;
  dialogue: string;
  greek_terms: string[];
  independent_pass_disposition: string;
  limits: string;
  missing_fact: string;
  observation_id: string;
  primary_pass_disposition: string;
  proposed_membership_decision: "add";
  proposed_observation: string;
  rationale: string;
  replaced_concept_id: string;
  replaced_parent_observation_id: string;
  replaces_membership_ids: string[];
  reviewer: string;
  source_ref: CanonicalSourceRef;
  source_work: string;
  textual_basis: string;
};

type SourceOmissionZeroResultRow = {
  adjudication: "no_replacement_required";
  concept_id: string;
  defect_class: "source_omission_zero_result";
  defect_id: string;
  dialogue: string;
  independent_pass_disposition: string;
  preserved_observation_ids: string[];
  primary_pass_disposition: string;
  rationale: string;
  replaced_parent_observation_id: string;
  reviewed_membership_ids: string[];
  reviewer: string;
  source_refs: CanonicalSourceRef[];
};

const repoRoot = process.cwd();
const args = process.argv.slice(2);

function option(name: string) {
  const index = args.indexOf(name);
  if (index === -1 || !args[index + 1]) throw new Error(`Missing ${name} <path>.`);
  return args[index + 1]!;
}

function optionPaths(name: string) {
  const paths = option(name).split(",").map((path) => path.trim()).filter(Boolean);
  if (paths.length === 0) throw new Error(`${name} requires at least one path.`);
  return paths;
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as JsonObject)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalValue(entry)]),
  );
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalValue(value));
}

function jsonl(rows: readonly unknown[]) {
  return rows.length === 0 ? "" : `${rows.map(canonicalJson).join("\n")}\n`;
}

function readJsonl<T>(path: string): T[] {
  const content = readFileSync(path, "utf8");
  if (content === "") return [];
  return content.trimEnd().split("\n").map((line, index) => {
    try {
      return JSON.parse(line) as T;
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

function dialogueOf(observationId: string) {
  const match = /^obs_([a-z0-9-]+)_[0-9]{4}$/u.exec(observationId);
  if (!match) throw new Error(`Invalid observation id ${observationId}.`);
  return match[1]!;
}

function scalar(record: JsonObject, key: string) {
  const value = record[key];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";
}

function sourceRef(record: JsonObject) {
  const value = record.source_ref;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${scalar(record, "observation_id")}: missing source_ref.`);
  }
  const source = value as JsonObject;
  return {
    source_path: scalar(source, "source_path"),
    stephanus_span: scalar(source, "stephanus_span"),
    start_char: Number(scalar(source, "start_char")),
    end_char: Number(scalar(source, "end_char")),
    text_sha256: scalar(source, "text_sha256"),
  };
}

function exactKeys(value: JsonObject, expected: readonly string[], context: string) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (canonicalJson(actual) !== canonicalJson(wanted)) {
    throw new Error(`${context}: expected keys ${wanted.join(", ")}; found ${actual.join(", ")}.`);
  }
}

function canonicalSourceRef(value: unknown, context: string): CanonicalSourceRef {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context}: source_ref must be an object.`);
  }
  const record = value as JsonObject;
  exactKeys(record, [
    "source_path",
    "stephanus_span",
    "start_marker",
    "end_marker",
    "start_char",
    "end_char",
    "text_sha256",
  ], context);
  const result = {
    source_path: scalar(record, "source_path"),
    stephanus_span: scalar(record, "stephanus_span"),
    start_marker: scalar(record, "start_marker"),
    end_marker: scalar(record, "end_marker"),
    start_char: Number(record.start_char),
    end_char: Number(record.end_char),
    text_sha256: scalar(record, "text_sha256"),
  };
  if (
    !result.source_path.startsWith("raw/plato/greek/")
    || !/^\d+[a-e](?:-\d+[a-e])?$/u.test(result.stephanus_span)
    || !/^\d+[a-e]$/u.test(result.start_marker)
    || !/^\d+[a-e]$/u.test(result.end_marker)
    || !Number.isSafeInteger(result.start_char)
    || !Number.isSafeInteger(result.end_char)
    || result.start_char < 0
    || result.end_char <= result.start_char
    || !/^[a-f0-9]{64}$/u.test(result.text_sha256)
  ) {
    throw new Error(`${context}: source_ref fields are invalid.`);
  }
  return result;
}

function canonicalFence(record: CanonicalYamlRecord) {
  return `\`\`\`yaml\n${serializeCanonicalYamlRecord(record).trimEnd()}\n\`\`\``;
}

function observationRecords() {
  const result = new Map<string, JsonObject>();
  const directory = join(repoRoot, "wiki/observations");
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    for (const block of fencedYamlRecordBlocks(readFileSync(join(directory, entry.name), "utf8"))) {
      const id = scalar(block.record, "observation_id");
      if (!id) continue;
      if (result.has(id)) throw new Error(`Duplicate observation ${id}.`);
      result.set(id, block.record);
    }
  }
  return result;
}

function applySourceOmissions(
  path: string,
  concepts: ReadonlyMap<string, { axis_id: string; concept_id: string }>,
  proposalsById: ReadonlyMap<string, { concept_id: string; source_target_key: string }>,
  sourceObservationByTarget: ReadonlyMap<string, string>,
) {
  const rows = readJsonl<SourceOmissionRow>(path);
  const normalized: SourceOmissionRow[] = [];
  const defectIds = new Set<string>();
  const observationIds = new Set<string>();
  const membershipIds = new Set<string>();
  for (const row of rows) {
    exactKeys(row as unknown as JsonObject, [
      "adjudication",
      "concept_id",
      "defect_class",
      "defect_id",
      "dialogue",
      "greek_terms",
      "independent_pass_disposition",
      "limits",
      "missing_fact",
      "observation_id",
      "primary_pass_disposition",
      "proposed_membership_decision",
      "proposed_observation",
      "rationale",
      "replaced_concept_id",
      "replaced_parent_observation_id",
      "replaces_membership_ids",
      "reviewer",
      "source_ref",
      "source_work",
      "textual_basis",
    ], row.defect_id || "source omission");
    if (
      row.defect_class !== "source_omission"
      || row.proposed_membership_decision !== "add"
      || !/^source_omission_[a-z0-9_]+$/u.test(row.defect_id)
      || dialogueOf(row.observation_id) !== row.dialogue
      || !concepts.has(row.concept_id)
      || !concepts.has(row.replaced_concept_id)
      || defectIds.has(row.defect_id)
      || observationIds.has(row.observation_id)
    ) {
      throw new Error(`${row.defect_id || "source omission"}: invalid or duplicated source-omission identity.`);
    }
    const source = canonicalSourceRef(row.source_ref, `${row.defect_id}: source_ref`);
    if (source.source_path !== `raw/plato/greek/${row.dialogue}.txt`) {
      throw new Error(`${row.defect_id}: source omission does not use its dialogue's canonical Greek source.`);
    }
    const resolved = resolveSourceSpan(row.dialogue, source.stephanus_span).source_ref;
    if (canonicalJson(resolved) !== canonicalJson(source)) {
      throw new Error(`${row.defect_id}: source_ref is not the canonical resolver output.`);
    }
    const greek = readFileSync(join(repoRoot, source.source_path), "utf8").slice(source.start_char, source.end_char);
    if (sha256(greek) !== source.text_sha256) {
      throw new Error(`${row.defect_id}: canonical Greek source slice hash differs.`);
    }
    if (
      !Array.isArray(row.greek_terms)
      || row.greek_terms.length === 0
      || new Set(row.greek_terms).size !== row.greek_terms.length
      || row.greek_terms.some((term) => typeof term !== "string" || term.trim().length < 2 || !greek.includes(term))
    ) {
      throw new Error(`${row.defect_id}: Greek terms are absent, duplicated, or unsupported by the cited span.`);
    }
    if (
      !Array.isArray(row.replaces_membership_ids)
      || row.replaces_membership_ids.length === 0
      || new Set(row.replaces_membership_ids).size !== row.replaces_membership_ids.length
      || row.replaces_membership_ids.some((membershipId) => {
        const proposal = proposalsById.get(membershipId);
        return !proposal
          || proposal.concept_id !== row.replaced_concept_id
          || sourceObservationByTarget.get(proposal.source_target_key) !== row.replaced_parent_observation_id;
      })
    ) {
      throw new Error(`${row.defect_id}: replaced memberships are not a unique non-empty subset of the exact proposal denominator.`);
    }
    const prose = [
      row.adjudication,
      row.independent_pass_disposition,
      row.limits,
      row.missing_fact,
      row.primary_pass_disposition,
      row.proposed_observation,
      row.rationale,
      row.textual_basis,
    ];
    if (prose.some((value) => typeof value !== "string" || value.trim().length < 80) || row.reviewer.trim().length < 3) {
      throw new Error(`${row.defect_id}: source-omission review prose is not meaningful enough.`);
    }
    const membershipId = deriveOntologyVNextMembershipId(row.observation_id, row.concept_id);
    if (membershipIds.has(membershipId)) throw new Error(`${row.defect_id}: duplicate source-omission membership identity.`);
    defectIds.add(row.defect_id);
    observationIds.add(row.observation_id);
    membershipIds.add(membershipId);
    normalized.push({
      ...row,
      adjudication: row.adjudication.trim(),
      greek_terms: row.greek_terms.map((term) => term.trim()),
      independent_pass_disposition: row.independent_pass_disposition.trim(),
      limits: row.limits.trim(),
      missing_fact: row.missing_fact.trim(),
      primary_pass_disposition: row.primary_pass_disposition.trim(),
      proposed_observation: row.proposed_observation.trim(),
      rationale: row.rationale.trim(),
      replaces_membership_ids: [...row.replaces_membership_ids].sort(),
      reviewer: row.reviewer.trim(),
      source_ref: source,
      source_work: row.source_work.trim(),
      textual_basis: row.textual_basis.trim(),
    });
  }

  const existing = observationRecords();
  for (const row of normalized) {
    const expected: CanonicalYamlRecord = {
      observation_id: row.observation_id,
      source_work: row.source_work,
      stephanus_span: row.source_ref.stephanus_span,
      source_ref: row.source_ref as unknown as CanonicalYamlValue,
      greek_terms: row.greek_terms,
      english_gloss: "",
      observation: row.proposed_observation,
      textual_basis: row.textual_basis,
      limits: row.limits,
      review_status: "accepted",
    };
    const present = existing.get(row.observation_id);
    if (present) {
      if (canonicalJson(present) !== canonicalJson(expected)) {
        throw new Error(`${row.observation_id}: existing source-omission observation differs from its reviewed record.`);
      }
      continue;
    }
    const observationPath = join(repoRoot, "wiki/observations", `${row.dialogue}.md`);
    const original = readFileSync(observationPath, "utf8");
    const next = `${original.trimEnd()}\n\n${canonicalFence(expected)}\n`;
    writeFileSync(observationPath, next, "utf8");
    existing.set(row.observation_id, expected as unknown as JsonObject);
  }
  normalized.sort((left, right) => left.defect_id.localeCompare(right.defect_id));
  return { rows: normalized, content: jsonl(normalized) };
}

function readSourceOmissionZeroResults(path: string) {
  const rows = readJsonl<SourceOmissionZeroResultRow>(path);
  const normalized: SourceOmissionZeroResultRow[] = [];
  const defectIds = new Set<string>();
  const parentConceptKeys = new Set<string>();
  for (const row of rows) {
    exactKeys(row as unknown as JsonObject, [
      "adjudication",
      "concept_id",
      "defect_class",
      "defect_id",
      "dialogue",
      "independent_pass_disposition",
      "preserved_observation_ids",
      "primary_pass_disposition",
      "rationale",
      "replaced_parent_observation_id",
      "reviewed_membership_ids",
      "reviewer",
      "source_refs",
    ], row.defect_id || "source omission zero result");
    const parentConceptKey = `${row.replaced_parent_observation_id}|${row.concept_id}`;
    if (
      row.adjudication !== "no_replacement_required"
      || row.defect_class !== "source_omission_zero_result"
      || !/^source_omission_zero_result_[a-z0-9_]+$/u.test(row.defect_id)
      || dialogueOf(row.replaced_parent_observation_id) !== row.dialogue
      || defectIds.has(row.defect_id)
      || parentConceptKeys.has(parentConceptKey)
      || !Array.isArray(row.preserved_observation_ids)
      || row.preserved_observation_ids.length === 0
      || new Set(row.preserved_observation_ids).size !== row.preserved_observation_ids.length
      || row.preserved_observation_ids.some((observationId) => dialogueOf(observationId) !== row.dialogue)
      || !Array.isArray(row.reviewed_membership_ids)
      || row.reviewed_membership_ids.length === 0
      || new Set(row.reviewed_membership_ids).size !== row.reviewed_membership_ids.length
      || row.reviewed_membership_ids.some((membershipId) => !/^membership_sha256_[a-f0-9]{64}$/u.test(membershipId))
      || !Array.isArray(row.source_refs)
      || row.source_refs.length === 0
    ) {
      throw new Error(`${row.defect_id || "source omission zero result"}: invalid or duplicated zero-result identity.`);
    }
    const sourceRefs = row.source_refs.map((sourceRefValue, index) => {
      const source = canonicalSourceRef(sourceRefValue, `${row.defect_id}: source_refs[${index}]`);
      if (source.source_path !== `raw/plato/greek/${row.dialogue}.txt`) {
        throw new Error(`${row.defect_id}: zero-result source does not use canonical Greek for its dialogue.`);
      }
      const resolved = resolveSourceSpan(row.dialogue, source.stephanus_span).source_ref;
      const greek = readFileSync(join(repoRoot, source.source_path), "utf8");
      if (
        canonicalJson(resolved) !== canonicalJson(source)
        || sha256(greek.slice(source.start_char, source.end_char)) !== source.text_sha256
      ) {
        throw new Error(`${row.defect_id}: zero-result source_ref is not the canonical resolver output and byte hash.`);
      }
      return source;
    });
    if (new Set(sourceRefs.map(canonicalJson)).size !== sourceRefs.length) {
      throw new Error(`${row.defect_id}: zero-result source_refs are duplicated.`);
    }
    if (
      [row.independent_pass_disposition, row.primary_pass_disposition, row.rationale]
        .some((value) => typeof value !== "string" || value.trim().length < 80)
      || row.reviewer.trim().length < 3
    ) {
      throw new Error(`${row.defect_id}: zero-result review prose is not meaningful enough.`);
    }
    defectIds.add(row.defect_id);
    parentConceptKeys.add(parentConceptKey);
    normalized.push({
      ...row,
      independent_pass_disposition: row.independent_pass_disposition.trim(),
      preserved_observation_ids: [...row.preserved_observation_ids].sort(),
      primary_pass_disposition: row.primary_pass_disposition.trim(),
      rationale: row.rationale.trim(),
      reviewed_membership_ids: [...row.reviewed_membership_ids].sort(),
      reviewer: row.reviewer.trim(),
      source_refs: sourceRefs.sort((left, right) => canonicalJson(left).localeCompare(canonicalJson(right))),
    });
  }
  normalized.sort((left, right) => left.defect_id.localeCompare(right.defect_id));
  return { rows: normalized, content: jsonl(normalized) };
}

function applyAnchorCorrections(paths: readonly string[]) {
  const rows: AnchorCorrectionRow[] = [];
  for (const path of paths) {
    const parsed = readJsonl<AnchorCorrectionRow>(path);
    rows.push(...parsed);
  }
  const byId = new Map<string, AnchorCorrectionRow>();
  for (const row of rows) {
    exactKeys(row as unknown as JsonObject, [
      "observation_id",
      "current_source_ref",
      "corrected_source_ref",
      "corrected_observation",
      "corrected_textual_basis",
      "corrected_limits",
      "rationale",
      "membership_decision",
    ], row.observation_id || "anchor correction");
    if (byId.has(row.observation_id)) throw new Error(`Duplicate anchor correction ${row.observation_id}.`);
    const dialogue = dialogueOf(row.observation_id);
    const current = canonicalSourceRef(row.current_source_ref, `${row.observation_id}: current_source_ref`);
    const corrected = canonicalSourceRef(row.corrected_source_ref, `${row.observation_id}: corrected_source_ref`);
    const expectedPath = `raw/plato/greek/${dialogue}.txt`;
    if (current.source_path !== expectedPath || corrected.source_path !== expectedPath) {
      throw new Error(`${row.observation_id}: correction must remain in ${expectedPath}.`);
    }
    const resolved = resolveSourceSpan(dialogue, corrected.stephanus_span).source_ref;
    if (canonicalJson(resolved) !== canonicalJson(corrected)) {
      throw new Error(`${row.observation_id}: corrected_source_ref is not the canonical resolver output.`);
    }
    const greek = readFileSync(join(repoRoot, corrected.source_path), "utf8");
    if (sha256(greek.slice(corrected.start_char, corrected.end_char)) !== corrected.text_sha256) {
      throw new Error(`${row.observation_id}: corrected Greek source slice hash differs.`);
    }
    if (
      row.corrected_observation.trim().length < 20
      || row.corrected_textual_basis.trim().length < 20
      || row.corrected_limits.trim().length < 20
      || row.rationale.trim().length < 80
      || !["keep", "drop"].includes(row.membership_decision)
    ) {
      throw new Error(`${row.observation_id}: correction prose or membership decision is invalid.`);
    }
    byId.set(row.observation_id, {
      ...row,
      current_source_ref: current,
      corrected_source_ref: corrected,
      corrected_observation: row.corrected_observation.trim(),
      corrected_textual_basis: row.corrected_textual_basis.trim(),
      corrected_limits: row.corrected_limits.trim(),
      rationale: row.rationale.trim(),
    });
  }

  const applied = new Set<string>();
  for (const entry of readdirSync(join(repoRoot, "wiki/observations"), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const path = join(repoRoot, "wiki/observations", entry.name);
    const original = readFileSync(path, "utf8");
    const rewritten = replaceFencedYamlRecordBlocks(original, (block) => {
      const id = scalar(block.record as unknown as JsonObject, "observation_id");
      const correction = byId.get(id);
      if (!correction) return block.fullMatch;
      const current = canonicalSourceRef(block.record.source_ref, `${id}: canonical source_ref`);
      if (
        canonicalJson(current) !== canonicalJson(correction.current_source_ref)
        && canonicalJson(current) !== canonicalJson(correction.corrected_source_ref)
      ) {
        throw new Error(`${id}: canonical source_ref matches neither the reviewed current nor corrected anchor.`);
      }
      const next: Record<string, CanonicalYamlValue> = {
        ...block.record,
        stephanus_span: correction.corrected_source_ref.stephanus_span,
        source_ref: correction.corrected_source_ref as unknown as CanonicalYamlValue,
        observation: correction.corrected_observation,
        textual_basis: correction.corrected_textual_basis,
        limits: correction.corrected_limits,
      };
      applied.add(id);
      return canonicalFence(next);
    });
    if (rewritten !== original) writeFileSync(path, rewritten, "utf8");
  }
  const missing = [...byId.keys()].filter((id) => !applied.has(id)).sort();
  if (missing.length > 0) throw new Error(`Anchor corrections omit canonical observation records: ${missing.join(", ")}.`);
  const normalized = [...byId.values()].sort((left, right) => left.observation_id.localeCompare(right.observation_id));
  return { rows: normalized, content: jsonl(normalized) };
}

function semanticSplitMap(packagePath: string) {
  const directory = join(packagePath, "review-inputs/semantic-remediation");
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-decisions\.jsonl$/u.test(entry.name))
    .map((entry) => join(directory, entry.name))
    .sort();
  if (files.length !== 1) throw new Error(`Expected one semantic decision artifact, found ${files.length}.`);
  const result = new Map<string, readonly string[]>();
  for (const row of readJsonl<{ target_key: string; replacement_target_keys: string[] }>(files[0]!)) {
    if (!row.target_key.startsWith("record:observation:")) continue;
    const replacements = row.replacement_target_keys
      .filter((key) => key.startsWith("record:observation:"))
      .map((key) => key.slice("record:observation:".length));
    if (replacements.length > 0) {
      result.set(row.target_key.slice("record:observation:".length), [...new Set(replacements)].sort());
    }
  }
  return result;
}

function artifactDescriptor(content: string) {
  return {
    sha256: sha256(content),
    bytes: Buffer.byteLength(content),
    rows: content.split("\n").filter(Boolean).length,
  };
}

const MANAGED_REVIEW_ARTIFACT_RE = /^split-membership-reviews\/sha256-[a-f0-9]{64}-(?:pass-[ab]|primary-pass-[ab]|source-anchor-corrections|source-omissions|source-omission-zero-results|known-false-memberships|disagreement-adjudications)\.jsonl$/u;

function refreshManagedReviewArtifactDescriptors(receiptPath: string, conceptDirectory: string) {
  const receipt = JSON.parse(readFileSync(receiptPath, "utf8")) as JsonObject;
  const artifacts = { ...(receipt.artifacts as Record<string, { sha256: string; bytes: number; rows: number }>) };
  for (const file of Object.keys(artifacts)) if (MANAGED_REVIEW_ARTIFACT_RE.test(file)) delete artifacts[file];
  const reviewDirectory = join(conceptDirectory, "split-membership-reviews");
  if (existsSync(reviewDirectory)) {
    for (const entry of readdirSync(reviewDirectory, { withFileTypes: true })) {
      const file = `split-membership-reviews/${entry.name}`;
      if (!entry.isFile() || !MANAGED_REVIEW_ARTIFACT_RE.test(file)) continue;
      artifacts[file] = artifactDescriptor(readFileSync(join(reviewDirectory, entry.name), "utf8"));
    }
  }
  receipt.artifacts = Object.fromEntries(Object.entries(artifacts).sort(([left], [right]) => left.localeCompare(right)));
  writeFileSync(receiptPath, `${JSON.stringify(canonicalValue(receipt), null, 2)}\n`, "utf8");
}

function countBy<T>(rows: readonly T[], key: (row: T) => string) {
  const result: Record<string, number> = {};
  for (const row of rows) result[key(row)] = (result[key(row)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(result).sort(([left], [right]) => left.localeCompare(right)));
}

const auditPackages = readdirSync(join(repoRoot, "wiki/ontology-audits"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name))
  .map((entry) => join(repoRoot, "wiki/ontology-audits", entry.name));
if (auditPackages.length !== 1) throw new Error(`Expected one ontology audit package, found ${auditPackages.length}.`);
const packagePath = auditPackages[0]!;
const conceptDirectory = join(packagePath, "review-inputs/concept-first");
const membershipPath = join(conceptDirectory, "memberships.jsonl");
const receiptJsonPath = join(conceptDirectory, "receipt.json");
refreshManagedReviewArtifactDescriptors(receiptJsonPath, conceptDirectory);
const audit = readOntologyConceptAudit(conceptDirectory, {
  allowIncompleteAllDroppedResolution: true,
  repoRoot,
});
const statuses = readObservationReviewStatuses(repoRoot);
const splitMap = semanticSplitMap(packagePath);
const proposals = buildOntologyVNextMembershipProposals({
  audit,
  observationReviewStatuses: statuses,
  splitMembershipProposalObservationIds: splitMap,
});
const proposalsById = new Map(proposals.map((row) => [row.membership_id, row]));
if (proposals.length !== 1_275) {
  throw new Error(`Expected the frozen 1,275 split-child proposal denominator, found ${proposals.length}.`);
}

const concepts = new Map(
  [
    ...audit.concepts.flatMap((row) => [row.vnext, ...row.split_targets]),
    ...audit.proposals.map((row) => row.vnext),
  ]
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .map((row) => [row.concept_id, row]),
);
const anchorCorrections = applyAnchorCorrections(optionPaths("--anchor-corrections"));
const sourceObservationByTarget = new Map(
  audit.memberships
    .filter((row) => row.target_key.startsWith("membership:observation:"))
    .map((row) => [row.target_key, row.observation_id]),
);
const sourceOmissions = applySourceOmissions(
  option("--source-omissions"),
  concepts,
  proposalsById,
  sourceObservationByTarget,
);
const sourceOmissionZeroResults = readSourceOmissionZeroResults(option("--source-omission-zero-results"));
const observations = observationRecords();
const reviewInputs = [
  { lane: "a", reviewer: "concept-membership-review-a", path: option("--review-a") },
  { lane: "b", reviewer: "concept-membership-review-b", path: option("--review-b") },
] as const;
const reviewed = new Map<string, ReviewRow & { lane: "a" | "b"; reviewer: string }>();
const reviewArtifactRows = new Map<string, unknown[]>();

for (const input of reviewInputs) {
  const artifactRows: unknown[] = [];
  for (const row of readJsonl<ReviewRow>(input.path)) {
    if (reviewed.has(row.membership_id)) throw new Error(`Duplicate review for ${row.membership_id}.`);
    const proposal = proposalsById.get(row.membership_id);
    if (!proposal) throw new Error(`${row.membership_id}: review is outside the split-child proposal denominator.`);
    if (row.observation_id !== proposal.observation_id || row.concept_id !== proposal.concept_id) {
      throw new Error(`${row.membership_id}: review identity differs from its derived proposal.`);
    }
    const dialogue = dialogueOf(row.observation_id);
    const expectedLane = dialogue.localeCompare("laws") <= 0 ? "a" : "b";
    if (input.lane !== expectedLane) throw new Error(`${row.membership_id}: dialogue ${dialogue} is in review lane ${expectedLane}.`);
    if (row.decision !== "keep" && row.decision !== "drop") {
      throw new Error(`${row.membership_id}: decision must be keep or drop.`);
    }
    const rationale = row.rationale.trim();
    if (rationale.length < 80) throw new Error(`${row.membership_id}: rationale is not meaningful enough.`);
    if (/fully reviewed concept assignment|preserves one explicit source-bound component/iu.test(rationale)) {
      throw new Error(`${row.membership_id}: rationale repeats the prohibited inheritance boilerplate.`);
    }
    const observation = observations.get(row.observation_id);
    const concept = concepts.get(row.concept_id);
    if (!observation || !concept) throw new Error(`${row.membership_id}: observation or concept is absent.`);
    const canonicalSourceRef = sourceRef(observation);
    const comparableReviewRef = {
      source_path: row.source_ref.source_path,
      stephanus_span: row.source_ref.stephanus_span,
      start_char: row.source_ref.start_char,
      end_char: row.source_ref.end_char,
    };
    const comparableCanonicalRef = {
      source_path: canonicalSourceRef.source_path,
      stephanus_span: canonicalSourceRef.stephanus_span,
      start_char: canonicalSourceRef.start_char,
      end_char: canonicalSourceRef.end_char,
    };
    if (canonicalJson(comparableReviewRef) !== canonicalJson(comparableCanonicalRef)) {
      throw new Error(`${row.membership_id}: reviewed source_ref differs from the canonical observation anchor.`);
    }
    if (!canonicalSourceRef.source_path.startsWith("raw/plato/greek/")) {
      throw new Error(`${row.membership_id}: source is not canonical Greek.`);
    }
    const source = readFileSync(join(repoRoot, canonicalSourceRef.source_path), "utf8");
    const sourceTextSha256 = sha256(source.slice(canonicalSourceRef.start_char, canonicalSourceRef.end_char));
    if (sourceTextSha256 !== canonicalSourceRef.text_sha256) {
      throw new Error(`${row.membership_id}: canonical Greek source hash differs from the observation anchor.`);
    }
    const reviewedInput = {
      proposal,
      observation: scalar(observation, "observation"),
      textual_basis: scalar(observation, "textual_basis"),
      limits: scalar(observation, "limits"),
      source_ref: canonicalSourceRef,
      source_text_sha256: sourceTextSha256,
      concept: {
        concept_id: concept.concept_id,
        concept_key: concept.concept_key,
        definition: concept.definition,
        comparison_question: concept.comparison_question,
      },
    };
    const terminal = { ...row, rationale, lane: input.lane, reviewer: input.reviewer };
    reviewed.set(row.membership_id, terminal);
    artifactRows.push({
      ...reviewedInput,
      decision: row.decision,
      rationale,
      reviewed_input_sha256: sha256(canonicalJson(reviewedInput)),
      reviewer: input.reviewer,
      state: "complete",
    });
  }
  reviewArtifactRows.set(input.lane, artifactRows.sort((left, right) =>
    String((left as JsonObject).reviewed_input_sha256).localeCompare(String((right as JsonObject).reviewed_input_sha256))
  ));
}

const missing = proposals.filter((proposal) => !reviewed.has(proposal.membership_id));
if (missing.length > 0 || reviewed.size !== proposals.length) {
  throw new Error(`Split-child review does not exactly cover the proposal set: missing=${missing.length}, reviewed=${reviewed.size}.`);
}
for (const omission of sourceOmissions.rows) {
  const nonDropped = omission.replaces_membership_ids.filter((membershipId) =>
    reviewed.get(membershipId)?.decision !== "drop"
  );
  if (nonDropped.length > 0) {
    throw new Error(
      `${omission.defect_id}: replacement observation may only supersede terminally dropped proposal memberships: ${nonDropped.join(", ")}.`,
    );
  }
}
const proposalsByParentConcept = new Map<string, typeof proposals>();
for (const proposal of proposals) {
  const key = `${proposal.source_target_key}|${proposal.concept_id}`;
  const bucket = proposalsByParentConcept.get(key) ?? [];
  bucket.push(proposal);
  proposalsByParentConcept.set(key, bucket);
}
const zeroResultKeys = new Set<string>();
for (const zeroResult of sourceOmissionZeroResults.rows) {
  const key = `membership:observation:${zeroResult.replaced_parent_observation_id}|${zeroResult.concept_id}`;
  const group = proposalsByParentConcept.get(key) ?? [];
  const expectedMembershipIds = group.map((proposal) => proposal.membership_id).sort();
  const expectedObservationIds = group.map((proposal) => proposal.observation_id).sort();
  const expectedSourceRefs = [...new Set(group.map((proposal) => {
    const observation = observations.get(proposal.observation_id)!;
    return canonicalJson(canonicalSourceRef(
      observation.source_ref,
      `${proposal.observation_id}: zero-result canonical source_ref`,
    ));
  }))].sort();
  const actualSourceRefs = zeroResult.source_refs.map(canonicalJson).sort();
  if (
    group.length === 0
    || group.some((proposal) => reviewed.get(proposal.membership_id)?.decision !== "drop")
    || canonicalJson(zeroResult.reviewed_membership_ids) !== canonicalJson(expectedMembershipIds)
    || canonicalJson(zeroResult.preserved_observation_ids) !== canonicalJson(expectedObservationIds)
    || canonicalJson(actualSourceRefs) !== canonicalJson(expectedSourceRefs)
  ) {
    throw new Error(`${zeroResult.defect_id}: zero result does not bind one complete all-dropped parent/concept proposal group and its exact source evidence.`);
  }
  zeroResultKeys.add(key);
}
const sourceOmissionKeys = new Map<string, SourceOmissionRow[]>();
for (const omission of sourceOmissions.rows) {
  const key = `membership:observation:${omission.replaced_parent_observation_id}|${omission.replaced_concept_id}`;
  const bucket = sourceOmissionKeys.get(key) ?? [];
  bucket.push(omission);
  sourceOmissionKeys.set(key, bucket);
}
const allDroppedGroups = [...proposalsByParentConcept.entries()].filter(([, group]) =>
  group.length > 0 && group.every((proposal) => reviewed.get(proposal.membership_id)?.decision === "drop")
);
for (const [key, group] of allDroppedGroups) {
  const omissions = sourceOmissionKeys.get(key) ?? [];
  const hasZeroResult = zeroResultKeys.has(key);
  if (omissions.length + Number(hasZeroResult) !== 1) {
    throw new Error(`${key}: every all-dropped parent assignment requires exactly one replacement omission or explicit zero result.`);
  }
  if (omissions.length === 1) {
    const expectedMembershipIds = group.map((proposal) => proposal.membership_id).sort();
    if (canonicalJson(omissions[0]!.replaces_membership_ids) !== canonicalJson(expectedMembershipIds)) {
      throw new Error(`${omissions[0]!.defect_id}: an all-dropped parent replacement must bind every reviewed proposal membership.`);
    }
  }
}
for (const key of zeroResultKeys) {
  if (!allDroppedGroups.some(([allDroppedKey]) => allDroppedKey === key)) {
    throw new Error(`${key}: source-omission zero results are allowed only for an exact all-dropped parent assignment.`);
  }
}
const knownFalseRows = readJsonl<KnownFalseMembershipRow>(option("--known-false"));
const knownFalseIds = new Set<string>();
for (const row of knownFalseRows) {
  exactKeys(row as unknown as JsonObject, ["membership_id", "observation_id", "concept_id", "reason"], row.membership_id);
  if (knownFalseIds.has(row.membership_id)) throw new Error(`Duplicate known-false membership ${row.membership_id}.`);
  const proposal = proposalsById.get(row.membership_id);
  if (!proposal || proposal.observation_id !== row.observation_id || proposal.concept_id !== row.concept_id) {
    throw new Error(`${row.membership_id}: known-false identity differs from the exact proposal denominator.`);
  }
  if (row.reason.trim().length < 80 || reviewed.get(row.membership_id)?.decision !== "drop") {
    throw new Error(`${row.membership_id}: known-false membership lacks rationale or a terminal drop decision.`);
  }
  knownFalseIds.add(row.membership_id);
}
const knownFalseContent = jsonl([...knownFalseRows].sort((left, right) => left.membership_id.localeCompare(right.membership_id)));
const primaryInputs = [
  { lane: "a", path: option("--primary-a") },
  { lane: "b", path: option("--primary-b") },
] as const;
const primaryRows = primaryInputs.flatMap((input) =>
  readJsonl<ReviewRow>(input.path).map((row) => ({ ...row, lane: input.lane }))
);
const primaryById = new Map(primaryRows.map((row) => [row.membership_id, row]));
if (primaryById.size !== proposals.length || primaryRows.length !== proposals.length) {
  throw new Error(`Primary membership passes do not exactly cover the ${proposals.length}-proposal denominator.`);
}
const disagreementRows = readJsonl<MembershipDisagreementRow>(option("--adjudications"));
const disagreementById = new Map<string, MembershipDisagreementRow>();
for (const row of disagreementRows) {
  exactKeys(row as unknown as JsonObject, [
    "membership_id",
    "observation_id",
    "concept_id",
    "primary_decision",
    "independent_decision",
    "final_decision",
    "rationale",
    "source_ref",
    "reviewer",
  ], row.membership_id);
  if (disagreementById.has(row.membership_id)) throw new Error(`Duplicate membership disagreement ${row.membership_id}.`);
  const proposal = proposalsById.get(row.membership_id);
  const primary = primaryById.get(row.membership_id);
  const final = reviewed.get(row.membership_id);
  const adjudicatedRef = canonicalSourceRef(row.source_ref, `${row.membership_id}: disagreement source_ref`);
  if (
    !proposal
    || !primary
    || !final
    || row.observation_id !== proposal.observation_id
    || row.concept_id !== proposal.concept_id
    || row.primary_decision !== primary.decision
    || row.final_decision !== final.decision
    || row.primary_decision === row.independent_decision
    || row.rationale.trim().length < 80
    || row.reviewer.trim().length < 3
    || canonicalJson(adjudicatedRef) !== canonicalJson(final.source_ref)
  ) {
    throw new Error(`${row.membership_id}: disagreement adjudication does not bind primary, independent, and final evidence.`);
  }
  disagreementById.set(row.membership_id, { ...row, source_ref: adjudicatedRef, rationale: row.rationale.trim() });
}
const changedPrimaryIds = proposals
  .filter((proposal) => primaryById.get(proposal.membership_id)!.decision
    !== reviewed.get(proposal.membership_id)!.decision)
  .map((proposal) => proposal.membership_id)
  .sort();
const unadjudicatedChanges = changedPrimaryIds.filter((membershipId) => !disagreementById.has(membershipId));
if (unadjudicatedChanges.length > 0) {
  throw new Error(
    `Disagreement ledger omits ${unadjudicatedChanges.length} changed primary decisions: ${unadjudicatedChanges.join(", ")}.`,
  );
}
const disagreementContent = jsonl([...disagreementById.values()].sort((left, right) =>
  left.membership_id.localeCompare(right.membership_id)
));
for (const correction of anchorCorrections.rows) {
  const decisions = [...reviewed.values()]
    .filter((row) => row.observation_id === correction.observation_id)
    .map((row) => row.decision);
  if (decisions.length === 0 || decisions.some((decision) => decision !== correction.membership_decision)) {
    throw new Error(
      `${correction.observation_id}: anchor correction membership decision does not match every reviewed proposal.`,
    );
  }
}
const touchedObservationDialogues = new Set([
  ...anchorCorrections.rows.map((row) => dialogueOf(row.observation_id)),
  ...sourceOmissions.rows.map((row) => row.dialogue),
]);
const touchedObservationIssues = [...touchedObservationDialogues]
  .sort()
  .flatMap((dialogue) => {
    const relativePath = `wiki/observations/${dialogue}.md`;
    return validateObservationLedger(relativePath, readFileSync(join(repoRoot, relativePath), "utf8"));
  });
if (touchedObservationIssues.length > 0) {
  throw new Error(
    `Reconciled observation ledgers failed strict validation:\n${touchedObservationIssues
      .map((issue) => `${issue.code}:${issue.observationId ?? "ledger"}: ${issue.message}`)
      .join("\n")}`,
  );
}

const reviewDirectory = join(conceptDirectory, "split-membership-reviews");
mkdirSync(reviewDirectory, { recursive: true });
for (const entry of readdirSync(reviewDirectory, { withFileTypes: true })) {
  if (
    entry.isFile()
    && /^sha256-[a-f0-9]{64}-(?:pass-[ab]|primary-pass-[ab]|source-anchor-corrections|source-omissions|source-omission-zero-results|known-false-memberships|disagreement-adjudications)\.jsonl$/u.test(entry.name)
  ) {
    unlinkSync(join(reviewDirectory, entry.name));
  }
}
const reviewArtifactFiles: string[] = [];
const anchorCorrectionName = `sha256-${sha256(anchorCorrections.content)}-source-anchor-corrections.jsonl`;
writeFileSync(join(reviewDirectory, anchorCorrectionName), anchorCorrections.content, "utf8");
reviewArtifactFiles.push(`split-membership-reviews/${anchorCorrectionName}`);
const sourceOmissionName = `sha256-${sha256(sourceOmissions.content)}-source-omissions.jsonl`;
writeFileSync(join(reviewDirectory, sourceOmissionName), sourceOmissions.content, "utf8");
reviewArtifactFiles.push(`split-membership-reviews/${sourceOmissionName}`);
const sourceOmissionZeroResultName = `sha256-${sha256(sourceOmissionZeroResults.content)}-source-omission-zero-results.jsonl`;
writeFileSync(join(reviewDirectory, sourceOmissionZeroResultName), sourceOmissionZeroResults.content, "utf8");
reviewArtifactFiles.push(`split-membership-reviews/${sourceOmissionZeroResultName}`);
const knownFalseName = `sha256-${sha256(knownFalseContent)}-known-false-memberships.jsonl`;
writeFileSync(join(reviewDirectory, knownFalseName), knownFalseContent, "utf8");
reviewArtifactFiles.push(`split-membership-reviews/${knownFalseName}`);
for (const input of primaryInputs) {
  const content = jsonl(primaryRows
    .filter((row) => row.lane === input.lane)
    .map(({ lane: _lane, ...row }) => row)
    .sort((left, right) => left.membership_id.localeCompare(right.membership_id)));
  const name = `sha256-${sha256(content)}-primary-pass-${input.lane}.jsonl`;
  writeFileSync(join(reviewDirectory, name), content, "utf8");
  reviewArtifactFiles.push(`split-membership-reviews/${name}`);
}
const disagreementName = `sha256-${sha256(disagreementContent)}-disagreement-adjudications.jsonl`;
writeFileSync(join(reviewDirectory, disagreementName), disagreementContent, "utf8");
reviewArtifactFiles.push(`split-membership-reviews/${disagreementName}`);
for (const input of reviewInputs) {
  const content = jsonl(reviewArtifactRows.get(input.lane) ?? []);
  const name = `sha256-${sha256(content)}-pass-${input.lane}.jsonl`;
  writeFileSync(join(reviewDirectory, name), content, "utf8");
  reviewArtifactFiles.push(`split-membership-reviews/${name}`);
}

const frozenRows = audit.memberships.filter((row) => row.target_key.startsWith("membership:observation:"));
if (frozenRows.length !== 7_470) throw new Error(`Frozen membership denominator drifted to ${frozenRows.length}.`);
const proposalsBySourceTarget = new Map<string, typeof proposals>();
for (const proposal of proposals) {
  const bucket = proposalsBySourceTarget.get(proposal.source_target_key) ?? [];
  bucket.push(proposal);
  proposalsBySourceTarget.set(proposal.source_target_key, bucket);
}
let splitParentMemberships = 0;
let droppedParentMemberships = 0;
const updatedFrozenRows = frozenRows.map((row) => {
  if (row.vnext_membership_id === null || statuses.get(row.observation_id) === "accepted") return row;
  const childProposals = proposalsBySourceTarget.get(row.target_key) ?? [];
  const retainedChildren = childProposals
    .filter((proposal) => reviewed.get(proposal.membership_id)?.decision === "keep")
    .map((proposal) => proposal.membership_id)
    .sort();
  const reviewedChildren = childProposals.map((proposal) => proposal.membership_id).sort();
  if (retainedChildren.length > 0) {
    splitParentMemberships += 1;
    return {
      ...row,
      decision: "split",
      rationale: `${row.observation_id}'s frozen assignment was reviewed before the observation was retired as a compound source record. Explicit Greek-source review of all ${childProposals.length} derived child proposals retained ${retainedChildren.length} assignment(s) and dropped ${childProposals.length - retainedChildren.length}; the listed replacement membership ids are the complete live continuation of this parent assignment.`,
      replacement_membership_ids: retainedChildren,
      reviewed_proposal_membership_ids: reviewedChildren,
    };
  }
  droppedParentMemberships += 1;
  if (childProposals.length > 0) {
    return {
      ...row,
      decision: "drop",
      rationale: `${row.observation_id}'s frozen assignment was reviewed before the observation was retired as a compound source record. Explicit Greek-source review dropped all ${childProposals.length} derived child proposals because none independently states concept ${row.vnext_concept_id}; the parent and all proposed children remain provenance only.`,
      replacement_membership_ids: [],
      reviewed_proposal_membership_ids: reviewedChildren,
    };
  }
  return {
    ...row,
    decision: "drop",
    rationale: `${row.observation_id}'s frozen assignment cannot survive the hard cut because the parent observation is not accepted in the final corpus and explicit Greek-source review retained no child assignment to concept ${row.vnext_concept_id}. The rejected parent remains provenance only and is not counterevidence or textual absence.`,
    replacement_membership_ids: [],
    reviewed_proposal_membership_ids: [],
    vnext_axis_id: null,
    vnext_concept_id: null,
    vnext_membership_id: null,
  };
});
const proposalDecisionRows = proposals.map((proposal) => {
  const review = reviewed.get(proposal.membership_id)!;
  const concept = concepts.get(proposal.concept_id)!;
  const observation = observations.get(proposal.observation_id)!;
  return {
    decision: review.decision === "keep" ? "add" : "drop",
    kind: "membership_decision",
    observation_id: proposal.observation_id,
    rationale: review.rationale,
    review_status: "accepted",
    source_ref: sourceRef(observation),
    target_key: proposal.target_key,
    vnext_axis_id: concept.axis_id,
    vnext_concept_id: proposal.concept_id,
    vnext_membership_id: proposal.membership_id,
    replacement_membership_ids: [],
    reviewed_proposal_membership_ids: [],
  };
});
const sourceOmissionDecisionRows = sourceOmissions.rows.map((omission) => {
  const concept = concepts.get(omission.concept_id)!;
  const observation = observations.get(omission.observation_id);
  if (!observation) throw new Error(`${omission.observation_id}: source-omission observation was not persisted.`);
  const membershipId = deriveOntologyVNextMembershipId(omission.observation_id, omission.concept_id);
  return {
    decision: "add" as const,
    kind: "membership_decision" as const,
    observation_id: omission.observation_id,
    rationale: `${omission.rationale} ${omission.adjudication}`,
    review_status: "accepted" as const,
    source_ref: sourceRef(observation),
    target_key: `membership:addition:${membershipId}`,
    vnext_axis_id: concept.axis_id,
    vnext_concept_id: omission.concept_id,
    vnext_membership_id: membershipId,
    replacement_membership_ids: [],
    reviewed_proposal_membership_ids: [],
  };
});
const membershipRows = [...updatedFrozenRows, ...proposalDecisionRows, ...sourceOmissionDecisionRows]
  .sort((left, right) => left.target_key.localeCompare(right.target_key));
const membershipContent = jsonl(membershipRows);
writeFileSync(membershipPath, membershipContent, "utf8");

const receipt = JSON.parse(readFileSync(receiptJsonPath, "utf8")) as JsonObject;
const artifacts = { ...(receipt.artifacts as Record<string, { sha256: string; bytes: number; rows: number }>) };
for (const file of Object.keys(artifacts)) if (MANAGED_REVIEW_ARTIFACT_RE.test(file)) delete artifacts[file];
artifacts["memberships.jsonl"] = artifactDescriptor(membershipContent);
for (const file of reviewArtifactFiles) artifacts[file] = artifactDescriptor(readFileSync(join(conceptDirectory, file), "utf8"));
receipt.exact_denominator = {
  ...(receipt.exact_denominator as JsonObject),
  memberships: membershipRows.length,
  frozen_memberships: frozenRows.length,
  split_child_membership_proposals: proposals.length,
  source_anchor_corrections: anchorCorrections.rows.length,
  source_omission_observations: sourceOmissions.rows.length,
  source_omission_membership_additions: sourceOmissionDecisionRows.length,
  source_omission_zero_results: sourceOmissionZeroResults.rows.length,
  independently_identified_false_memberships: knownFalseRows.length,
  membership_disagreements: disagreementRows.length,
};
receipt.decision_counts = {
  ...(receipt.decision_counts as JsonObject),
  memberships: countBy(membershipRows, (row) => row.decision),
};
const keptMemberships = membershipRows.filter((row) =>
  ["keep", "move", "add"].includes(row.decision)
  && row.vnext_membership_id !== null
  && statuses.get(row.observation_id) === "accepted"
);
receipt.canonical_vnext_counts = {
  ...(receipt.canonical_vnext_counts as JsonObject),
  memberships: keptMemberships.length,
};
receipt.checks = {
  ...(receipt.checks as JsonObject),
  exact_membership_key_equality: true,
  split_child_proposal_key_equality: true,
  split_child_memberships_reviewed: proposals.length,
  split_child_memberships_added: proposalDecisionRows.filter((row) => row.decision === "add").length,
  split_child_memberships_dropped: proposalDecisionRows.filter((row) => row.decision === "drop").length,
  source_anchor_corrections_applied: anchorCorrections.rows.length,
  source_omission_observations_added: sourceOmissions.rows.length,
  source_omission_memberships_added: sourceOmissionDecisionRows.length,
  source_omission_parent_zero_results: sourceOmissionZeroResults.rows.length,
  all_dropped_parent_assignments_resolved: allDroppedGroups.length,
  independently_identified_false_memberships_dropped: knownFalseRows.length,
  membership_disagreements_reconciled: disagreementRows.length,
  split_parent_memberships: splitParentMemberships,
  dropped_parent_memberships: droppedParentMemberships,
  unreviewed_items: 0,
};
receipt.artifacts = Object.fromEntries(Object.entries(artifacts).sort(([left], [right]) => left.localeCompare(right)));
const receiptContent = `${JSON.stringify(canonicalValue(receipt), null, 2)}\n`;
writeFileSync(receiptJsonPath, receiptContent, "utf8");

const rebuiltAudit = readOntologyConceptAudit(conceptDirectory, { repoRoot });
const rebuilt = buildOntologyVNextFromConceptAudit({
  audit: rebuiltAudit,
  observationReviewStatuses: statuses,
  splitMembershipProposalObservationIds: splitMap,
});
if (rebuilt.memberships.length !== keptMemberships.length) {
  throw new Error(`Explicit projection count mismatch: rebuilt=${rebuilt.memberships.length}, expected=${keptMemberships.length}.`);
}

const packageRelative = relative(repoRoot, packagePath).split("\\").join("/");
const receiptPath = join(repoRoot, "wiki/review/2026-08-30-ontology-vnext-concept-audit.md");
const receiptArtifacts = [
  ...Object.entries(rebuiltAudit.receipt.artifacts).map(([file, descriptor]) => ({
    path: `${packageRelative}/review-inputs/concept-first/${file}`,
    sha256: descriptor.sha256,
  })),
  { path: `${packageRelative}/review-inputs/concept-first/receipt.json`, sha256: sha256(receiptContent) },
].sort((left, right) => left.path.localeCompare(right.path));
const markdown = [
  "# Ontology vNext concept-first audit receipt",
  "",
  `- snapshot: ${rebuiltAudit.receipt.audit_snapshot}`,
  `- baseline commit: ${rebuiltAudit.receipt.baseline_commit}`,
  "- source policy: frozen audit records, canonical observation records, and canonical Greek source references only; no translations read",
  `- denominator: ${rebuiltAudit.receipt.exact_denominator.axes} axes, ${rebuiltAudit.receipt.exact_denominator.concepts} concepts, ${frozenRows.length} frozen observation assignments, and ${proposals.length} split-child membership proposals`,
  `- atomic source-anchor repairs: ${anchorCorrections.rows.length} item-level corrections re-resolved against canonical Greek bytes`,
  `- source-omission repairs: ${sourceOmissions.rows.length} accepted neutral observation(s) with ${sourceOmissionDecisionRows.length} direct reviewed membership addition(s); ${sourceOmissionZeroResults.rows.length} explicit parent-level zero result(s)`,
  `- independent false-fanout register: ${knownFalseRows.length} proposal memberships, all terminally dropped`,
  `- reconciled membership disagreements: ${disagreementRows.length}, with primary and independent decisions preserved in content-addressed artifacts`,
  "- each axis states one precise cross-dialogue comparison question",
  "- every concept, frozen membership, and split-child proposal has an item-level terminal decision and meaningful rationale",
  `- canonical vNext projection: ${rebuiltAudit.receipt.canonical_vnext_counts.axes} axes, ${rebuiltAudit.receipt.canonical_vnext_counts.concepts} concepts, ${rebuiltAudit.receipt.canonical_vnext_counts.memberships} memberships`,
  `- split-child dispositions: ${proposalDecisionRows.filter((row) => row.decision === "add").length} added; ${proposalDecisionRows.filter((row) => row.decision === "drop").length} dropped`,
  `- retired parent dispositions: ${splitParentMemberships} split to retained children; ${droppedParentMemberships} dropped with no live child assignment`,
  "- hard cut: no compatibility aliases, automatic split-child inheritance, or rejected-observation memberships",
  `- raw decision package: ${packageRelative}/review-inputs/concept-first`,
  `- raw receipt SHA-256: ${sha256(receiptContent)}`,
  ...receiptArtifacts.map((artifact) => `- artifact: \`${artifact.path}\`; sha256: \`${artifact.sha256}\``),
  "",
].join("\n");
mkdirSync(dirname(receiptPath), { recursive: true });
writeFileSync(receiptPath, markdown, "utf8");

console.log(`package=${packageRelative}`);
console.log(`proposals=${proposals.length}`);
console.log(`added=${proposalDecisionRows.filter((row) => row.decision === "add").length}`);
console.log(`dropped=${proposalDecisionRows.filter((row) => row.decision === "drop").length}`);
console.log(`source_omission_additions=${sourceOmissionDecisionRows.length}`);
console.log(`source_omission_zero_results=${sourceOmissionZeroResults.rows.length}`);
console.log(`split_parents=${splitParentMemberships}`);
console.log(`dropped_parents=${droppedParentMemberships}`);
console.log(`canonical_memberships=${rebuilt.memberships.length}`);
console.log(`receipt=${relative(repoRoot, receiptPath).split("\\").join("/")}`);
console.log(`review_artifacts=${reviewArtifactFiles.map((file) => basename(file)).join(",")}`);

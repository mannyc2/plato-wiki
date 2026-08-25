import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CANONICAL_DIALOGUES } from "./completeness.js";
import { parseTurnIndexToon, turnIndexPath } from "./derived/turns.js";
import { getRepoRoot } from "./paths.js";

/**
 * The hand-reviewed scope manifest for nested reported turns (the reported-turn scope census).
 *
 * It answers one question per canonical dialogue: did a reviewer exhaust the
 * Greek source looking for nested reported turns, and if so, in which outer
 * turns are they? It is editorial input, never generated output — deriving
 * scope from whichever ledgers happen to exist is precisely the fail-open hole
 * `CMP-REPORTED-TURNS` exists to close, because a dialogue nobody has looked at
 * is indistinguishable from a dialogue with nothing to find.
 *
 * Every entry binds the exact bytes it was reviewed against. When the Greek
 * source or the outer-turn index moves, the binding goes stale and completeness
 * fails until a reviewer recertifies — that is machine-readable, so nobody has
 * to parse the receipt's prose to know a census is out of date.
 */
export type ReportedTurnDisposition = "required" | "none";

export type ReportedTurnScopeInputs = {
  greekSourcePath: string;
  greekSourceSha256: string;
  outerTurnIndexPath: string;
  outerTurnIndexSha256: string;
};

export type ReportedTurnScopeReceipt = {
  path: string;
  sha256: string;
};

export type ReportedTurnScopeEntry = {
  dialogue: string;
  disposition: ReportedTurnDisposition;
  outerTurnIds: string[];
  inputs: ReportedTurnScopeInputs;
  reviewReceipt: ReportedTurnScopeReceipt;
};

export type ReportedTurnScopeIssue = {
  /** Absent for manifest-level problems that belong to no single dialogue. */
  dialogue?: string;
  field: string;
  expected: string;
  actual: string;
};

export type ReportedTurnScopes = {
  entries: ReportedTurnScopeEntry[];
  issues: ReportedTurnScopeIssue[];
};

const SCHEMA_VERSION = 1;
const MANIFEST_KEYS = new Set(["schemaVersion", "dialogues"]);
const ENTRY_KEYS = new Set(["dialogue", "disposition", "outerTurnIds", "inputs", "reviewReceipt"]);
const INPUT_KEYS = ["greekSourcePath", "greekSourceSha256", "outerTurnIndexPath", "outerTurnIndexSha256"] as const;
const RECEIPT_KEYS = ["path", "sha256"] as const;
const DISPOSITIONS = new Set<ReportedTurnDisposition>(["required", "none"]);

/**
 * The receipt's prose is a reviewer's, but four things in it are load-bearing
 * enough to check mechanically: the two input hashes it claims to have been
 * written against, a named reviewer, and the explicit statement that no
 * translation, doctrine, or style evidence was used. Without the last one a
 * census could rest on an English text and nothing in the tree would say so.
 */
const RECEIPT_EVIDENCE_SENTENCE = "No translation, doctrine, or style evidence was used.";
const RECEIPT_REVIEWER_PATTERN = /^\*\*Reviewers?\*\*:/mu;
const RECEIPT_METHOD_PATTERN = /^##+\s+Method\s*$/mu;

export function reportedTurnScopesPath() {
  return "wiki/reported-turn-scopes.json";
}

export function greekSourcePathFor(dialogue: string) {
  return `raw/plato/greek/${dialogue}.txt`;
}

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function issue(field: string, expected: string, actual: string, dialogue?: string): ReportedTurnScopeIssue {
  return { ...(dialogue === undefined ? {} : { dialogue }), field, expected, actual };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

/**
 * Turn IDs that exist in the dialogue's CURRENT outer-turn index. A manifest
 * naming a turn the index does not have is not a typo to tolerate: it means the
 * census was taken against different segmentation than the one in the tree.
 */
function currentTurnIds(repoRoot: string, dialogue: string) {
  const path = join(repoRoot, turnIndexPath(dialogue));
  if (!existsSync(path)) return undefined;
  try {
    return new Set(parseTurnIndexToon(readFileSync(path, "utf8")).turns.map((turn) => turn.turnId));
  } catch {
    return undefined;
  }
}

function validateInputs(
  repoRoot: string,
  dialogue: string,
  raw: unknown,
  issues: ReportedTurnScopeIssue[],
): ReportedTurnScopeInputs | undefined {
  if (!isRecord(raw)) {
    issues.push(issue("inputs", "an object with exactly four fields", typeof raw, dialogue));
    return undefined;
  }
  const keys = Object.keys(raw).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...INPUT_KEYS].sort())) {
    issues.push(issue("inputs", [...INPUT_KEYS].sort().join(", "), keys.join(", ") || "(none)", dialogue));
    return undefined;
  }
  const values = Object.fromEntries(INPUT_KEYS.map((key) => [key, stringField(raw[key])])) as Record<
    (typeof INPUT_KEYS)[number],
    string | undefined
  >;
  for (const key of INPUT_KEYS) {
    if (values[key] === undefined) {
      issues.push(issue(`inputs.${key}`, "string", typeof raw[key], dialogue));
      return undefined;
    }
  }

  const expectedSourcePath = greekSourcePathFor(dialogue);
  const expectedTurnPath = turnIndexPath(dialogue);
  if (values.greekSourcePath !== expectedSourcePath) {
    issues.push(issue("inputs.greekSourcePath", expectedSourcePath, values.greekSourcePath!, dialogue));
  }
  if (values.outerTurnIndexPath !== expectedTurnPath) {
    issues.push(issue("inputs.outerTurnIndexPath", expectedTurnPath, values.outerTurnIndexPath!, dialogue));
  }

  for (const [pathKey, hashKey] of [
    ["greekSourcePath", "greekSourceSha256"],
    ["outerTurnIndexPath", "outerTurnIndexSha256"],
  ] as const) {
    const relative = values[pathKey]!;
    const absolute = join(repoRoot, relative);
    if (!existsSync(absolute)) {
      issues.push(issue(`inputs.${pathKey}`, "an existing file", `${relative} does not exist`, dialogue));
      continue;
    }
    const actual = sha256(readFileSync(absolute));
    if (actual !== values[hashKey]) {
      issues.push(issue(`inputs.${hashKey}`, actual, values[hashKey]!, dialogue));
    }
  }

  return {
    greekSourcePath: values.greekSourcePath!,
    greekSourceSha256: values.greekSourceSha256!,
    outerTurnIndexPath: values.outerTurnIndexPath!,
    outerTurnIndexSha256: values.outerTurnIndexSha256!,
  };
}

function validateReceipt(
  repoRoot: string,
  dialogue: string,
  raw: unknown,
  inputs: ReportedTurnScopeInputs | undefined,
  issues: ReportedTurnScopeIssue[],
): ReportedTurnScopeReceipt | undefined {
  if (!isRecord(raw)) {
    issues.push(issue("reviewReceipt", "an object with exactly two fields", typeof raw, dialogue));
    return undefined;
  }
  const keys = Object.keys(raw).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...RECEIPT_KEYS].sort())) {
    issues.push(issue("reviewReceipt", [...RECEIPT_KEYS].sort().join(", "), keys.join(", ") || "(none)", dialogue));
    return undefined;
  }
  const path = stringField(raw.path);
  const hash = stringField(raw.sha256);
  if (path === undefined || hash === undefined) {
    issues.push(issue("reviewReceipt", "string path and sha256", `${typeof raw.path}, ${typeof raw.sha256}`, dialogue));
    return undefined;
  }
  if (!/^wiki\/review\/[A-Za-z0-9._\-/]+\.md$/u.test(path) || path.includes("..")) {
    issues.push(issue("reviewReceipt.path", "a repository-relative path under wiki/review/", path, dialogue));
    return { path, sha256: hash };
  }

  const absolute = join(repoRoot, path);
  if (!existsSync(absolute)) {
    issues.push(issue("reviewReceipt.path", "an existing file", `${path} does not exist`, dialogue));
    return { path, sha256: hash };
  }
  const content = readFileSync(absolute, "utf8");
  if (content.trim().length === 0) {
    issues.push(issue("reviewReceipt.path", "a nonempty receipt", `${path} is empty`, dialogue));
    return { path, sha256: hash };
  }
  const actual = sha256(readFileSync(absolute));
  if (actual !== hash) {
    issues.push(issue("reviewReceipt.sha256", actual, hash, dialogue));
  }
  if (inputs) {
    if (!content.includes(inputs.greekSourceSha256)) {
      issues.push(issue("reviewReceipt.content", `repeats greekSourceSha256 ${inputs.greekSourceSha256}`, `${path} does not`, dialogue));
    }
    if (!content.includes(inputs.outerTurnIndexSha256)) {
      issues.push(issue("reviewReceipt.content", `repeats outerTurnIndexSha256 ${inputs.outerTurnIndexSha256}`, `${path} does not`, dialogue));
    }
  }
  if (!RECEIPT_METHOD_PATTERN.test(content)) {
    issues.push(issue("reviewReceipt.content", "a `## Method` section", `${path} has none`, dialogue));
  }
  if (!RECEIPT_REVIEWER_PATTERN.test(content)) {
    issues.push(issue("reviewReceipt.content", "a `**Reviewers**:` line", `${path} has none`, dialogue));
  }
  if (!content.includes(RECEIPT_EVIDENCE_SENTENCE)) {
    issues.push(issue("reviewReceipt.content", `the sentence "${RECEIPT_EVIDENCE_SENTENCE}"`, `${path} does not carry it`, dialogue));
  }
  return { path, sha256: hash };
}

function validateEntry(repoRoot: string, raw: unknown, issues: ReportedTurnScopeIssue[]): ReportedTurnScopeEntry | undefined {
  if (!isRecord(raw)) {
    issues.push(issue("dialogues[]", "an object", Array.isArray(raw) ? "array" : typeof raw));
    return undefined;
  }
  const dialogue = stringField(raw.dialogue);
  if (dialogue === undefined) {
    issues.push(issue("dialogues[].dialogue", "a canonical dialogue slug", typeof raw.dialogue));
    return undefined;
  }
  const unknownKeys = Object.keys(raw).filter((key) => !ENTRY_KEYS.has(key)).sort();
  if (unknownKeys.length > 0) {
    issues.push(issue("dialogues[]", [...ENTRY_KEYS].sort().join(", "), `unknown key(s): ${unknownKeys.join(", ")}`, dialogue));
  }

  const disposition = stringField(raw.disposition);
  if (disposition === undefined || !DISPOSITIONS.has(disposition as ReportedTurnDisposition)) {
    issues.push(issue("disposition", "required or none", String(raw.disposition), dialogue));
    return undefined;
  }

  const turnIdsRaw = raw.outerTurnIds;
  if (!Array.isArray(turnIdsRaw) || turnIdsRaw.some((value) => typeof value !== "string")) {
    issues.push(issue("outerTurnIds", "an array of turn IDs", Array.isArray(turnIdsRaw) ? "non-string members" : typeof turnIdsRaw, dialogue));
    return undefined;
  }
  const outerTurnIds = turnIdsRaw as string[];

  if (disposition === "none" && outerTurnIds.length > 0) {
    issues.push(issue("outerTurnIds", "empty for disposition none", `${outerTurnIds.length} turn(s)`, dialogue));
  }
  if (disposition === "required") {
    if (outerTurnIds.length === 0) {
      issues.push(issue("outerTurnIds", "at least one turn for disposition required", "empty", dialogue));
    }
    const duplicates = [...new Set(outerTurnIds.filter((value, index) => outerTurnIds.indexOf(value) !== index))].sort();
    if (duplicates.length > 0) {
      issues.push(issue("outerTurnIds", "unique turn IDs", `duplicated: ${duplicates.join(", ")}`, dialogue));
    }
    const sorted = [...outerTurnIds].sort();
    if (JSON.stringify(sorted) !== JSON.stringify(outerTurnIds)) {
      issues.push(issue("outerTurnIds", "sorted ascending", outerTurnIds.join(", "), dialogue));
    }
    const known = currentTurnIds(repoRoot, dialogue);
    if (known === undefined) {
      issues.push(issue("outerTurnIds", `a readable ${turnIndexPath(dialogue)}`, "missing or unparsable turn index", dialogue));
    } else {
      const unknownTurns = [...new Set(outerTurnIds.filter((turnId) => !known.has(turnId)))].sort();
      if (unknownTurns.length > 0) {
        issues.push(issue("outerTurnIds", "turn IDs present in the current outer-turn index", `absent: ${unknownTurns.join(", ")}`, dialogue));
      }
    }
  }

  const inputs = validateInputs(repoRoot, dialogue, raw.inputs, issues);
  const reviewReceipt = validateReceipt(repoRoot, dialogue, raw.reviewReceipt, inputs, issues);
  if (!inputs || !reviewReceipt) return undefined;

  return { dialogue, disposition: disposition as ReportedTurnDisposition, outerTurnIds, inputs, reviewReceipt };
}

export function parseReportedTurnScopes(content: string, { repoRoot = getRepoRoot() }: { repoRoot?: string } = {}): ReportedTurnScopes {
  const issues: ReportedTurnScopeIssue[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return { entries: [], issues: [issue("manifest", "valid JSON", error instanceof Error ? error.message : String(error))] };
  }
  if (!isRecord(parsed)) {
    return { entries: [], issues: [issue("manifest", "a JSON object", Array.isArray(parsed) ? "array" : typeof parsed)] };
  }

  // A second canonical-dialogue array in the manifest would be a competing
  // authority nobody reads; refuse the shape rather than pick one.
  const unknownKeys = Object.keys(parsed).filter((key) => !MANIFEST_KEYS.has(key)).sort();
  if (unknownKeys.length > 0) {
    issues.push(issue("manifest", [...MANIFEST_KEYS].sort().join(", "), `unknown key(s): ${unknownKeys.join(", ")}`));
  }
  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    issues.push(issue("schemaVersion", String(SCHEMA_VERSION), String(parsed.schemaVersion)));
  }
  if (!Array.isArray(parsed.dialogues)) {
    issues.push(issue("dialogues", "an array", typeof parsed.dialogues));
    return { entries: [], issues };
  }

  const entries: ReportedTurnScopeEntry[] = [];
  for (const raw of parsed.dialogues) {
    const entry = validateEntry(repoRoot, raw, issues);
    if (entry) entries.push(entry);
  }

  const slugs = (parsed.dialogues as unknown[])
    .map((raw) => (isRecord(raw) ? stringField(raw.dialogue) : undefined))
    .filter((value): value is string => value !== undefined);
  const duplicates = [...new Set(slugs.filter((value, index) => slugs.indexOf(value) !== index))].sort();
  if (duplicates.length > 0) {
    issues.push(issue("dialogues", "each canonical dialogue exactly once", `duplicated: ${duplicates.join(", ")}`));
  }
  const canonical = new Set<string>(CANONICAL_DIALOGUES);
  const missing = [...canonical].filter((dialogue) => !slugs.includes(dialogue)).sort();
  if (missing.length > 0) {
    issues.push(issue("dialogues", "every canonical dialogue", `missing: ${missing.join(", ")}`));
  }
  const extra = [...new Set(slugs.filter((slug) => !canonical.has(slug)))].sort();
  if (extra.length > 0) {
    issues.push(issue("dialogues", "only canonical dialogue slugs", `unknown: ${extra.join(", ")}`));
  }

  return { entries, issues };
}

export function readReportedTurnScopes({ repoRoot = getRepoRoot() }: { repoRoot?: string } = {}): ReportedTurnScopes {
  const absolute = join(repoRoot, reportedTurnScopesPath());
  if (!existsSync(absolute)) {
    return {
      entries: [],
      issues: [issue("manifest", `${reportedTurnScopesPath()} exists`, "missing")],
    };
  }
  return parseReportedTurnScopes(readFileSync(absolute, "utf8"), { repoRoot });
}

export function formatReportedTurnScopeIssue(entry: ReportedTurnScopeIssue) {
  const scope = entry.dialogue ? `${reportedTurnScopesPath()} [${entry.dialogue}]` : reportedTurnScopesPath();
  return `${scope} ${entry.field}: expected ${entry.expected}; got ${entry.actual}`;
}

/**
 * Wired into `bun run validate` so a stale or malformed manifest cannot sit in a
 * tree whose completeness report nobody happened to run.
 */
export function collectReportedTurnScopeFailures({ repoRoot = getRepoRoot() }: { repoRoot?: string } = {}) {
  return readReportedTurnScopes({ repoRoot }).issues.map((entry) => formatReportedTurnScopeIssue(entry));
}

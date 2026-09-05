import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { apparatusYamlBlocks, listApparatusLedgerPaths } from "./wiki/apparatus-ledger.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./wiki/claim-ledger.js";
import { commentaryYamlBlocks, listCommentaryLedgerPaths } from "./wiki/commentary-ledger.js";
import { fieldValue, fieldValueOrEmpty, listObservationLedgerPaths, observationYamlBlocks } from "./wiki/observation-ledger.js";
import { relationYamlBlocks, listRelationLedgerPaths } from "./wiki/relation-ledger.js";
import { listVoicesLedgerPaths, voiceYamlBlocks } from "./wiki/voices-ledger.js";

type StatusMap = Map<string, string>;

const REVIEW_PROVENANCE_LANES = new Set([
  "observation",
  "claim",
  "relation",
  "commentary",
  "apparatus",
  "voice",
]);

export type ReviewProvenanceGitRunner = (
  args: string[],
  options?: { trim?: boolean },
) => string | undefined;

export interface ReviewProvenanceOptions {
  gitOutput?: ReviewProvenanceGitRunner;
}

function gitOutput(args: string[], { trim = true }: { trim?: boolean } = {}) {
  try {
    const output = execFileSync("git", args, {
      cwd: getRepoRoot(),
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return trim ? output.trimEnd() : output;
  } catch {
    return undefined;
  }
}

function requiredGitOutput(
  runGit: ReviewProvenanceGitRunner,
  args: string[],
  options?: { trim?: boolean },
) {
  const output = runGit(args, options);
  if (output === undefined) {
    throw new Error(
      `Git command failed after work-tree detection: git ${args.join(" ")}`,
    );
  }
  return output;
}

function isGitWorkTree(runGit: ReviewProvenanceGitRunner) {
  if (runGit(["rev-parse", "--is-inside-work-tree"]) !== "true") return false;
  requiredGitOutput(runGit, ["rev-parse", "HEAD"]);
  return true;
}

function readHeadFile(relativePath: string, runGit: ReviewProvenanceGitRunner) {
  const headPath = requiredGitOutput(runGit, [
    "ls-tree",
    "--name-only",
    "HEAD",
    "--",
    relativePath,
  ]);
  if (!headPath.split("\n").includes(relativePath)) return "";
  return requiredGitOutput(runGit, ["show", `HEAD:${relativePath}`], {
    trim: false,
  });
}

function statusMapFromBlocks(blocks: string[], idField: string): StatusMap {
  const statuses: StatusMap = new Map();

  for (const block of blocks) {
    const id = fieldValue(block, idField);
    if (!id) continue;
    statuses.set(id, fieldValueOrEmpty(block, "review_status") || "unreviewed");
  }

  return statuses;
}

function statusMapFromContent(relativePath: string, content: string): StatusMap {
  if (relativePath.startsWith("wiki/claims/")) {
    return statusMapFromBlocks(claimYamlBlocks(content), "claim_id");
  }
  if (relativePath.startsWith("wiki/relations/")) {
    return statusMapFromBlocks(relationYamlBlocks(content), "relation_id");
  }
  if (relativePath.startsWith("wiki/commentary/")) {
    return statusMapFromBlocks(commentaryYamlBlocks(content), "commentary_id");
  }
  if (relativePath.startsWith("wiki/apparatus/")) {
    return statusMapFromBlocks(apparatusYamlBlocks(content), "apparatus_id");
  }
  if (relativePath.startsWith("wiki/voices/")) {
    return statusMapFromBlocks(voiceYamlBlocks(content), "voice_id");
  }

  return statusMapFromBlocks(observationYamlBlocks(content), "observation_id");
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function snapshotAuditBaselineStatuses(repoRoot: string, headCommit: string): StatusMap | undefined {
  const auditRoot = join(repoRoot, "wiki/ontology-audits");
  if (!existsSync(auditRoot)) return undefined;

  const packageNames = readdirSync(auditRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (packageNames.length === 0) return undefined;
  if (packageNames.length !== 1) {
    throw new Error(`Expected exactly one snapshot-bound ontology audit package; found ${packageNames.length}.`);
  }

  const packagePath = join(auditRoot, packageNames[0]!);
  const manifest = JSON.parse(readFileSync(join(packagePath, "manifest.json"), "utf8")) as {
    snapshot_id?: unknown;
    baseline?: { git_commit?: unknown };
  };
  if (manifest.baseline?.git_commit !== headCommit) return undefined;
  if (manifest.snapshot_id !== basename(packagePath)) {
    throw new Error("Ontology audit manifest snapshot_id does not match its content-addressed package path.");
  }

  const acceptance = JSON.parse(readFileSync(join(packagePath, "acceptance.json"), "utf8")) as {
    snapshot_id?: unknown;
    partitions?: Record<string, { sha256?: unknown; rows?: unknown }>;
  };
  if (acceptance.snapshot_id !== manifest.snapshot_id) {
    throw new Error("Ontology audit acceptance snapshot_id does not match the manifest.");
  }

  const recordUnitsContent = readFileSync(join(packagePath, "record-units.jsonl"), "utf8");
  const binding = acceptance.partitions?.["record-units.jsonl"];
  if (binding?.sha256 !== sha256(recordUnitsContent)) {
    throw new Error("Ontology audit record-units partition does not match its acceptance hash binding.");
  }

  const statuses: StatusMap = new Map();
  let rowCount = 0;
  for (const [index, line] of recordUnitsContent.split(/\r?\n/u).entries()) {
    if (line.length === 0) continue;
    rowCount += 1;
    const row = JSON.parse(line) as {
      lane?: unknown;
      stable_id?: unknown;
      baseline?: { review_status?: unknown } | null;
    };
    if (typeof row.lane !== "string" || !REVIEW_PROVENANCE_LANES.has(row.lane)) continue;
    if (typeof row.stable_id !== "string" || row.stable_id.length === 0) {
      throw new Error(`Ontology audit record-units line ${index + 1} has no stable_id.`);
    }
    if (row.baseline === null || row.baseline === undefined) continue;
    const reviewStatus = row.baseline.review_status;
    if (reviewStatus !== null && typeof reviewStatus !== "string") {
      throw new Error(`Ontology audit record-units line ${index + 1} has an invalid baseline review_status.`);
    }
    if (statuses.has(row.stable_id)) {
      throw new Error(`Ontology audit record-units contains duplicate stable_id ${row.stable_id}.`);
    }
    statuses.set(row.stable_id, reviewStatus ?? "unreviewed");
  }
  if (binding.rows !== rowCount) {
    throw new Error(`Ontology audit record-units row count is ${rowCount}; acceptance binds ${String(binding.rows)}.`);
  }
  return statuses;
}

function changedReviewStatusIds(runGit: ReviewProvenanceGitRunner) {
  const repoRoot = getRepoRoot();
  const changed: string[] = [];
  const headCommit = requiredGitOutput(runGit, ["rev-parse", "HEAD"]);
  const auditedBaselineStatuses = snapshotAuditBaselineStatuses(repoRoot, headCommit);
  const workingTreeStatuses: StatusMap = new Map();

  for (const relativePath of [
    ...listObservationLedgerPaths(),
    ...listClaimLedgerPaths(),
    ...listRelationLedgerPaths(),
    ...listCommentaryLedgerPaths(),
    ...listApparatusLedgerPaths(),
    ...listVoicesLedgerPaths(),
  ].sort()) {
    const workingTreeContent = readFileSync(join(repoRoot, relativePath), "utf8");
    const pathWorkingTreeStatuses = statusMapFromContent(relativePath, workingTreeContent);
    for (const [recordId, status] of pathWorkingTreeStatuses) {
      if (workingTreeStatuses.has(recordId)) throw new Error(`Duplicate semantic record ID ${recordId}.`);
      workingTreeStatuses.set(recordId, status);
    }

    if (auditedBaselineStatuses !== undefined) continue;
    const headStatuses = statusMapFromContent(relativePath, readHeadFile(relativePath, runGit));

    for (const [recordId, status] of pathWorkingTreeStatuses) {
      const headStatus = headStatuses.get(recordId);
      if (headStatus !== undefined && headStatus !== status) {
        changed.push(recordId);
      } else if (headStatus === undefined && status !== "unreviewed") {
        changed.push(recordId);
      }
    }

    // DELETION is a review action too. Only additions and in-place changes were
    // tracked, so removing a record that had already been reviewed — the exact
    // move a "reject and replace" makes — left no provenance trail at all. The
    // rule mirrors the addition rule above: a record that was never reviewed
    // carries no decision, so regenerating an all-unreviewed ledger stays quiet.
    for (const [recordId, headStatus] of headStatuses) {
      if (pathWorkingTreeStatuses.has(recordId)) continue;
      if (headStatus !== "unreviewed") changed.push(recordId);
    }
  }

  if (auditedBaselineStatuses !== undefined) {
    for (const [recordId, status] of workingTreeStatuses) {
      const baselineStatus = auditedBaselineStatuses.get(recordId);
      if (baselineStatus !== undefined && baselineStatus !== status) {
        changed.push(recordId);
      } else if (baselineStatus === undefined && status !== "unreviewed") {
        changed.push(recordId);
      }
    }
    for (const [recordId, baselineStatus] of auditedBaselineStatuses) {
      if (workingTreeStatuses.has(recordId)) continue;
      if (baselineStatus !== "unreviewed") changed.push(recordId);
    }
  }

  return [...new Set(changed)].sort();
}

function reviewReceiptWasAddedOrModified(runGit: ReviewProvenanceGitRunner) {
  const status = requiredGitOutput(runGit, [
    "status",
    "--porcelain",
    "--",
    "wiki/review/",
  ]);
  return status
    .split("\n")
    .filter(Boolean)
    .some((line) => line.startsWith("??") || /[AM]/u.test(line.slice(0, 2)));
}

function formatChangedIds(changedIds: string[]) {
  const sample = changedIds.slice(0, 5).join(", ");
  const suffix = changedIds.length > 5 ? ", ..." : "";
  return `${changedIds.length} review_status change(s): ${sample}${suffix}`;
}

export function collectReviewProvenanceFailures({
  gitOutput: runGit = gitOutput,
}: ReviewProvenanceOptions = {}): string[] {
  try {
    if (!isGitWorkTree(runGit)) return [];

    const changedIds = changedReviewStatusIds(runGit);
    if (changedIds.length === 0) return [];

    const changedSummary = formatChangedIds(changedIds);
    if (!reviewReceiptWasAddedOrModified(runGit)) {
      return [`${changedSummary}; wiki/review/ must include an added or modified review receipt`];
    }

    return [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [`review provenance snapshot failed safely: ${message}`];
  }
}

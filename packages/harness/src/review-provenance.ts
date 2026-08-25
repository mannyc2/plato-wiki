import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { apparatusYamlBlocks, listApparatusLedgerPaths } from "./wiki/apparatus-ledger.js";
import { claimYamlBlocks, listClaimLedgerPaths } from "./wiki/claim-ledger.js";
import { commentaryYamlBlocks, listCommentaryLedgerPaths } from "./wiki/commentary-ledger.js";
import { fieldValue, fieldValueOrEmpty, listObservationLedgerPaths, observationYamlBlocks } from "./wiki/observation-ledger.js";
import { relationYamlBlocks, listRelationLedgerPaths } from "./wiki/relation-ledger.js";
import { listVoicesLedgerPaths, voiceYamlBlocks } from "./wiki/voices-ledger.js";

type StatusMap = Map<string, string>;

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

function changedReviewStatusIds(runGit: ReviewProvenanceGitRunner) {
  const repoRoot = getRepoRoot();
  const changed: string[] = [];

  for (const relativePath of [
    ...listObservationLedgerPaths(),
    ...listClaimLedgerPaths(),
    ...listRelationLedgerPaths(),
    ...listCommentaryLedgerPaths(),
    ...listApparatusLedgerPaths(),
    ...listVoicesLedgerPaths(),
  ].sort()) {
    const workingTreeContent = readFileSync(join(repoRoot, relativePath), "utf8");
    const workingTreeStatuses = statusMapFromContent(relativePath, workingTreeContent);
    const headStatuses = statusMapFromContent(relativePath, readHeadFile(relativePath, runGit));

    for (const [recordId, status] of workingTreeStatuses) {
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
      if (workingTreeStatuses.has(recordId)) continue;
      if (headStatus !== "unreviewed") changed.push(recordId);
    }
  }

  return changed.sort();
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

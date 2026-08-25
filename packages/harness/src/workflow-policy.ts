import { execFileSync } from "node:child_process";
import { getRepoRoot } from "./paths.js";

type ForbiddenPathRule = {
  pattern: RegExp;
  reason: string;
};

const FORBIDDEN_TRACKED_PATHS: ForbiddenPathRule[] = [
  {
    pattern: /^\.wave2-scratch\//u,
    reason: "coordination scratch must remain ignored and disposable",
  },
  {
    pattern: /^scripts\/one-off-/u,
    reason: "durable scripts must name a recurring corpus operation, not a one-time campaign",
  },
  {
    pattern: /^plans\/.*(?:-frozen|-work-package|-disagreement-packets)\.md$/u,
    reason: "review dispatch and intermediate reviewer state are not canonical evidence",
  },
  {
    pattern: /^wiki\/review\/.*(?:framework|packet-freeze|dry-run|early-abort|manifest-assembler).*\.md$/u,
    reason: "review receipts must record accepted decisions, not coordination machinery",
  },
];

export function findCorpusWorkflowPathFailures(paths: string[]) {
  const failures: string[] = [];

  for (const path of paths) {
    for (const rule of FORBIDDEN_TRACKED_PATHS) {
      if (rule.pattern.test(path)) {
        failures.push(`${path}: ${rule.reason}`);
        break;
      }
    }
  }

  return failures.sort();
}

function gitPaths(repoRoot: string, args: string[]) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
}

export function collectChangedCorpusWorkflowFailures(repoRoot = getRepoRoot()) {
  try {
    // A developer validates the current worktree before committing. Hosted CI
    // validates the checked-out commit as well; on PR merge refs, first-parent
    // diffing covers the complete proposed change without scanning legacy
    // coordination artifacts that predate this hard cutover.
    const lastCommitPaths = process.env.CI
      ? gitPaths(repoRoot, [
          "diff-tree",
          "--first-parent",
          "--no-commit-id",
          "--name-only",
          "--diff-filter=ACMR",
          "-r",
          "-z",
          "HEAD",
        ])
      : [];
    const workingPaths = gitPaths(repoRoot, [
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      "-z",
      "HEAD",
      "--",
    ]);
    const untrackedPaths = gitPaths(repoRoot, ["ls-files", "--others", "--exclude-standard", "-z"]);
    return findCorpusWorkflowPathFailures([...new Set([...lastCommitPaths, ...workingPaths, ...untrackedPaths])]);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return [`unable to inspect changed repository paths: ${detail}`];
  }
}

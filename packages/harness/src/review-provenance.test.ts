import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import {
  collectReviewProvenanceFailures,
  type ReviewProvenanceGitRunner,
} from "./review-provenance.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;
let isWorkTree = false;
let headFiles = new Map<string, string>();
let reviewStatusOutput = "";

const snapshotGitOutput: ReviewProvenanceGitRunner = (
  args,
  { trim = true } = {},
) => {
  let output: string | undefined;
  if (args[0] === "rev-parse" && args[1] === "--is-inside-work-tree") {
    output = isWorkTree ? "true\n" : undefined;
  } else if (args[0] === "rev-parse" && args[1] === "HEAD") {
    output = isWorkTree ? "fixture-head\n" : undefined;
  } else if (args[0] === "ls-tree" && args[1] === "--name-only") {
    const relativePath = args[4];
    output =
      relativePath !== undefined && headFiles.has(relativePath)
        ? `${relativePath}\n`
        : "";
  } else if (args[0] === "show" && args[1]?.startsWith("HEAD:")) {
    output = headFiles.get(args[1].slice("HEAD:".length));
  } else if (
    args.join("\0") ===
    ["status", "--porcelain", "--", "wiki/review/"].join("\0")
  ) {
    output = reviewStatusOutput;
  } else {
    throw new Error(`unexpected snapshot Git command: ${args.join(" ")}`);
  }
  return output === undefined || !trim ? output : output.trimEnd();
};

function collectFailures() {
  return collectReviewProvenanceFailures({ gitOutput: snapshotGitOutput });
}

function record({
  id = "obs_fixture_0001",
  status = "unreviewed",
}: {
  id?: string;
  status?: string;
} = {}) {
  return `\`\`\`yaml
observation_id: ${id}
review_status: ${status}
source_ref:
  start_char: 0
  end_char: 10
\`\`\``;
}

function writeLedger(dialogue: string, records: string[]) {
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(join(root, "wiki/observations", `${dialogue}.md`), records.join("\n\n"), "utf8");
}

function claimRecord({
  id = "claim_fixture_0001",
  status = "unreviewed",
}: {
  id?: string;
  status?: string;
} = {}) {
  return `\`\`\`yaml
claim_id: ${id}
review_status: ${status}
source_ref:
  start_char: 0
  end_char: 10
\`\`\``;
}

function writeClaimLedger(dialogue: string, records: string[]) {
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(join(root, "wiki/claims", `${dialogue}.md`), records.join("\n\n"), "utf8");
}

function writeBaseFiles() {
  mkdirSync(join(root, "wiki/review"), { recursive: true });
  writeFileSync(join(root, "wiki/ingest-log.md"), "base log\n", "utf8");
  writeLedger("fixture", [record()]);
}

function initSnapshotFixture() {
  writeBaseFiles();
  isWorkTree = true;
  headFiles = new Map([
    ["wiki/ingest-log.md", "base log\n"],
    ["wiki/observations/fixture.md", record()],
  ]);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "review-provenance-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  isWorkTree = false;
  headFiles = new Map();
  reviewStatusOutput = "";
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("review provenance", () => {
  it("returns no failures outside a git work tree", () => {
    writeBaseFiles();

    expect(collectFailures()).toEqual([]);
  });

  it("returns no failures when the working files match the HEAD snapshot", () => {
    initSnapshotFixture();

    expect(collectFailures()).toEqual([]);
  });

  it("requires a changed review receipt when review_status changes", () => {
    initSnapshotFixture();
    writeLedger("fixture", [record({ status: "accepted" })]);

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("obs_fixture_0001");
    expect(failures[0]).toContain("wiki/review/");
  });

  it("passes when review_status changes with a new review receipt", () => {
    initSnapshotFixture();
    writeLedger("fixture", [record({ status: "accepted" })]);
    writeFileSync(join(root, "wiki/review/provenance.md"), "Accepted fixture record.\n", "utf8");
    reviewStatusOutput = "?? wiki/review/provenance.md\n";

    expect(collectFailures()).toEqual([]);
  });

  it("passes when review_status changes with a modified tracked review receipt", () => {
    initSnapshotFixture();
    writeLedger("fixture", [record({ status: "accepted" })]);
    writeFileSync(join(root, "wiki/review/provenance.md"), "Accepted fixture record.\n", "utf8");
    headFiles.set("wiki/review/provenance.md", "Earlier review receipt.\n");
    reviewStatusOutput = " M wiki/review/provenance.md\n";

    expect(collectFailures()).toEqual([]);
  });

  it("does not accept an unchanged review receipt", () => {
    initSnapshotFixture();
    writeLedger("fixture", [record({ status: "accepted" })]);
    writeFileSync(join(root, "wiki/review/provenance.md"), "Earlier review receipt.\n", "utf8");
    headFiles.set("wiki/review/provenance.md", "Earlier review receipt.\n");

    expect(collectFailures()).toHaveLength(1);
  });

  it("exempts a new ledger whose records are all unreviewed", () => {
    initSnapshotFixture();
    writeLedger("new", [record({ id: "obs_new_0001", status: "unreviewed" })]);

    expect(collectFailures()).toEqual([]);
  });

  it("requires provenance for a new ledger containing a reviewed record", () => {
    initSnapshotFixture();
    writeLedger("new", [record({ id: "obs_new_0001", status: "accepted" })]);

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures.join("\n")).toContain("obs_new_0001");
  });

  it("requires provenance for claim review_status changes", () => {
    initSnapshotFixture();
    writeClaimLedger("fixture", [claimRecord({ status: "accepted" })]);

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures.join("\n")).toContain("claim_fixture_0001");
  });

  it("requires provenance for commentary review_status changes", () => {
    initSnapshotFixture();
    mkdirSync(join(root, "wiki/commentary"), { recursive: true });
    writeFileSync(
      join(root, "wiki/commentary/fixture.md"),
      "```yaml\ncommentary_id: comm_fixture_0001\nreview_status: accepted\n```\n",
      "utf8",
    );

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures.join("\n")).toContain("comm_fixture_0001");
  });

  it("requires provenance for apparatus review_status changes", () => {
    initSnapshotFixture();
    mkdirSync(join(root, "wiki/apparatus"), { recursive: true });
    writeFileSync(
      join(root, "wiki/apparatus/fixture.md"),
      "```yaml\napparatus_id: apx_fixture_0001\nreview_status: accepted\n```\n",
      "utf8",
    );

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures.join("\n")).toContain("apx_fixture_0001");
  });

  it("requires the same provenance when commentary is terminally rejected", () => {
    initSnapshotFixture();
    mkdirSync(join(root, "wiki/commentary"), { recursive: true });
    writeFileSync(
      join(root, "wiki/commentary/fixture.md"),
      "```yaml\ncommentary_id: comm_fixture_0001\nreview_status: rejected\n```\n",
      "utf8",
    );

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures.join("\n")).toContain("comm_fixture_0001");
  });

  it("does not treat an ingest-log append as a review receipt", () => {
    initSnapshotFixture();
    writeLedger("fixture", [record({ status: "accepted" })]);
    writeFileSync(join(root, "wiki/ingest-log.md"), "base log\nreview pass\n", "utf8");

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("wiki/review/");
  });

  it("polices review_status changes in the voices lane", () => {
    initSnapshotFixture();
    const voiceRecord = (status: string) =>
      `\`\`\`yaml\nvoice_id: voice_fixture_0001\nreview_status: ${status}\n\`\`\``;
    mkdirSync(join(root, "wiki/voices"), { recursive: true });
    writeFileSync(join(root, "wiki/voices/fixture.md"), voiceRecord("accepted"), "utf8");
    headFiles.set("wiki/voices/fixture.md", voiceRecord("unreviewed"));

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("voice_fixture_0001");
    expect(failures[0]).toContain("wiki/review/");
  });

  it("polices the DELETION of a reviewed voice record", () => {
    // Reject-and-replace removes a record outright. Tracking only additions and
    // in-place edits let a reviewed record vanish with no provenance at all.
    initSnapshotFixture();
    const voiceRecord = (id: string, status: string) =>
      `\`\`\`yaml\nvoice_id: ${id}\nreview_status: ${status}\n\`\`\``;
    mkdirSync(join(root, "wiki/voices"), { recursive: true });
    writeFileSync(join(root, "wiki/voices/fixture.md"), voiceRecord("voice_fixture_0001", "accepted"), "utf8");
    headFiles.set(
      "wiki/voices/fixture.md",
      `${voiceRecord("voice_fixture_0001", "accepted")}\n${voiceRecord("voice_fixture_0002", "rejected")}`,
    );

    const failures = collectFailures();

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("voice_fixture_0002");
  });

  it("does not flag the deletion of a record that was never reviewed", () => {
    // Regenerating an all-unreviewed ledger renumbers and drops records; no
    // review decision is being erased, so it needs no rationale note.
    initSnapshotFixture();
    const voiceRecord = (id: string) => `\`\`\`yaml\nvoice_id: ${id}\nreview_status: unreviewed\n\`\`\``;
    mkdirSync(join(root, "wiki/voices"), { recursive: true });
    writeFileSync(join(root, "wiki/voices/fixture.md"), voiceRecord("voice_fixture_0001"), "utf8");
    headFiles.set(
      "wiki/voices/fixture.md",
      `${voiceRecord("voice_fixture_0001")}\n${voiceRecord("voice_fixture_0002")}`,
    );

    expect(collectFailures()).toEqual([]);
  });

  it("does not flag an unreviewed voice ledger that HEAD has never seen", () => {
    initSnapshotFixture();
    mkdirSync(join(root, "wiki/voices"), { recursive: true });
    writeFileSync(
      join(root, "wiki/voices/fixture.md"),
      "```yaml\nvoice_id: voice_fixture_0001\nreview_status: unreviewed\n```",
      "utf8",
    );

    expect(collectFailures()).toEqual([]);
  });

  it("fails safely when an injected snapshot runner throws", () => {
    const failures = collectReviewProvenanceFailures({
      gitOutput: () => {
        throw new Error("fixture runner failed");
      },
    });

    expect(failures).toEqual([
      "review provenance snapshot failed safely: fixture runner failed",
    ]);
  });

  it("fails closed when the production-style runner loses Git after work-tree detection", () => {
    const failures = collectReviewProvenanceFailures({
      gitOutput: (args) =>
        args[0] === "rev-parse" && args[1] === "--is-inside-work-tree"
          ? "true"
          : undefined,
    });

    expect(failures).toEqual([
      "review provenance snapshot failed safely: Git command failed after work-tree detection: git rev-parse HEAD",
    ]);
  });
});

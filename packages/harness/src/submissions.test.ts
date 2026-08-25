import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import {
  listSubmissionScopes,
  readSubmissions,
  recordSubmission,
  submissionDirectory,
  SUBMISSIONS_ROOT,
} from "./submissions.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function writeSource(relativePath: string, value: unknown) {
  const absolute = join(root, relativePath);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return relativePath;
}

function record(overrides: Partial<Parameters<typeof recordSubmission>[0]> = {}) {
  return recordSubmission({
    lane: "commentary",
    kind: "draft",
    scope: "crito",
    unitKey: "01",
    sourcePath: writeSource("scratch/commentary/drafts/crito/01.json", { unit_key: "01" }),
    targetPath: "wiki/commentary/crito.md",
    targetContentBefore: "before\n",
    targetContentAfter: "after\n",
    appliedIds: ["comm_crito_0001"],
    submission: { unit_key: "01" },
    ...overrides,
  });
}

describe("recordSubmission", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "submissions-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("writes outside scratch so the artifact survives the ledger merge", () => {
    const written = record();

    expect(written.path).toBe(`${SUBMISSIONS_ROOT}/commentary/crito/0001-draft-01.json`);
    expect(written.path.startsWith("scratch/")).toBe(false);
    expect(existsSync(join(root, written.path))).toBe(true);
  });

  it("hashes the source artifact and both sides of the target", () => {
    const written = record();

    expect(written.record.source_sha256).toHaveLength(64);
    expect(written.record.target_sha256_before).not.toBe(written.record.target_sha256_after);
    expect(written.record.applied_ids).toEqual(["comm_crito_0001"]);
  });

  it("allocates monotonic ordinals per scope", () => {
    record();
    record({ kind: "rewrite" });
    record({ scope: "meno", sourcePath: writeSource("scratch/commentary/drafts/meno/01.json", {}) });

    expect(readSubmissions("commentary", "crito").map((entry) => entry.submission_id)).toEqual([
      "0001-draft-01",
      "0002-rewrite-01",
    ]);
    expect(readSubmissions("commentary", "meno").map((entry) => entry.submission_id)).toEqual(["0001-draft-01"]);
  });

  it("keeps the superseded bodies a rewrite replaced", () => {
    const written = record({ kind: "rewrite", superseded: [{ commentary_id: "comm_crito_0001", body: "old" }] });

    expect(readSubmissions("commentary", "crito")[0]!.superseded).toEqual(written.record.superseded!);
  });

  it("omits superseded when nothing was replaced", () => {
    record();

    expect(Object.hasOwn(readSubmissions("commentary", "crito")[0]!, "superseded")).toBe(false);
  });

  it("omits unit_key for scope-wide submissions", () => {
    const written = record({ kind: "outline", unitKey: undefined });

    expect(written.path).toBe(`${SUBMISSIONS_ROOT}/commentary/crito/0001-outline.json`);
    expect(Object.hasOwn(written.record, "unit_key")).toBe(false);
  });

  it("records an empty source hash when the artifact is already gone", () => {
    const written = record({ sourcePath: "scratch/commentary/drafts/crito/missing.json" });

    expect(written.record.source_sha256).toBe("");
  });

  it("rejects lanes, scopes, and kinds that are not slugs", () => {
    expect(() => submissionDirectory("../escape", "crito")).toThrow("Invalid submission lane");
    expect(() => submissionDirectory("commentary", "../escape")).toThrow("Invalid submission scope");
    expect(() => record({ kind: "../escape" })).toThrow("Invalid submission kind");
  });

  it("lists scopes that have submissions", () => {
    expect(listSubmissionScopes("commentary")).toEqual([]);

    record();
    record({ scope: "meno", sourcePath: writeSource("scratch/commentary/drafts/meno/01.json", {}) });

    expect(listSubmissionScopes("commentary")).toEqual(["crito", "meno"]);
  });

  it("returns no submissions for an unrecorded scope", () => {
    expect(readSubmissions("commentary", "apology")).toEqual([]);
  });
});

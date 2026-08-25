import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CompletenessFamily, CompletenessLeaf, CompletenessReport } from "./completeness.js";
import {
  buildJobManifest,
  findJob,
  JOB_MANIFEST_PATH,
  jobIdFor,
  jobInputsChanged,
  readJobManifest,
  renderJob,
  renderJobList,
  writeJobManifest,
} from "./jobs.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function leaf(scope: string, state: CompletenessLeaf["state"], evidence: string[] = []): CompletenessLeaf {
  return {
    scope,
    state,
    expected: `expected ${scope}`,
    observed: `observed ${scope}`,
    evidence,
    remediation: `remediate ${scope}`,
  };
}

function report(families: Array<Pick<CompletenessFamily, "id" | "leaves">>): CompletenessReport {
  return {
    schemaVersion: 1,
    artifactKind: "plato-edition-completeness",
    canonicalDialogues: ["crito", "meno"],
    families: families.map((family) => ({
      id: family.id,
      state: family.leaves.some((entry) => entry.state === "fail") ? "fail" : "pass",
      requiredBy: ["knowledge-base"],
      leaves: family.leaves,
    })),
    targets: {
      corpus: { target: "corpus", ready: false, requiredFamilies: [], blockers: [] },
      "knowledge-base": { target: "knowledge-base", ready: false, requiredFamilies: [], blockers: [] },
      "audio-edition": { target: "audio-edition", ready: false, requiredFamilies: [], blockers: [] },
    },
    warnings: [],
  };
}

function build(families: Array<Pick<CompletenessFamily, "id" | "leaves">>, overrides = {}) {
  return buildJobManifest({
    target: "knowledge-base",
    report: report(families),
    generatedAt: "2026-08-16T00:00:00.000Z",
    ...overrides,
  });
}

describe("buildJobManifest", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "jobs-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("emits one job per failing leaf and none for closed ones", () => {
    const manifest = build([
      { id: "CMP-CLAIMS", leaves: [leaf("crito", "fail"), leaf("meno", "pass"), leaf("ion", "not_applicable")] },
    ]);

    expect(manifest.jobs.map((job) => job.job_id)).toEqual(["claims/crito"]);
    expect(manifest.counts).toMatchObject({ jobs: 1, ready: 1, blocked: 0, by_lane: { claims: 1 } });
  });

  it("carries the leaf's own expected, observed, and remediation into the job", () => {
    const [job] = build([{ id: "CMP-CLAIMS", leaves: [leaf("crito", "fail")] }]).jobs;

    expect(job!.expected).toBe("expected crito");
    expect(job!.observed).toBe("observed crito");
    expect(job!.remediation).toBe("remediate crito");
  });

  it("skips families the selected target does not require", () => {
    const audioOnly = [{ id: "CMP-AUDIO-RENDER" as const, leaves: [leaf("crito", "fail")] }];

    expect(build(audioOnly).jobs).toEqual([]);
    expect(build(audioOnly, { target: "audio-edition" }).jobs).toHaveLength(1);
  });

  it("derives a stable job id from the family and scope", () => {
    expect(jobIdFor("CMP-REPORTED-TURNS", "republic")).toBe("reported-turns/republic");
    expect(jobIdFor("CMP-WRITING-AUDIT", "crito")).toBe("writing-audit/crito");
  });

  it("blocks a job only when its dependency is failing in the same scope", () => {
    const manifest = build([
      { id: "CMP-READINGS", leaves: [leaf("crito", "fail"), leaf("meno", "pass")] },
      { id: "CMP-WRITING-AUDIT", leaves: [leaf("crito", "fail"), leaf("meno", "fail")] },
    ]);

    expect(findJob(manifest, "writing-audit/crito").blocked_by).toEqual(["readings/crito"]);
    expect(findJob(manifest, "writing-audit/meno").blocked_by).toEqual([]);
    expect(manifest.counts).toMatchObject({ ready: 2, blocked: 1 });
  });

  it("does not block on a dependency the target does not require", () => {
    const manifest = build(
      [
        { id: "CMP-READINGS", leaves: [leaf("crito", "fail")] },
        { id: "CMP-WRITING-AUDIT", leaves: [leaf("crito", "fail")] },
      ],
      { target: "corpus" },
    );

    expect(manifest.jobs).toEqual([]);
  });

  it("hashes the leaf's evidence and marks what is missing", () => {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(join(root, "wiki/claims/crito.md"), "ledger\n", "utf8");

    const [job] = build([
      { id: "CMP-CLAIMS", leaves: [leaf("crito", "fail", ["wiki/claims/crito.md", "wiki/claims/gone.md"])] },
    ]).jobs;

    expect(job!.inputs[0]).toMatchObject({ path: "wiki/claims/crito.md", exists: true });
    expect(job!.inputs[0]!.sha256).toHaveLength(64);
    expect(job!.inputs[1]).toEqual({ path: "wiki/claims/gone.md", exists: false, sha256: "" });
    expect(job!.input_sha256).toHaveLength(64);
  });

  it("hashes a directory as evidence without reading it as a file", () => {
    mkdirSync(join(root, "raw/plato/greek"), { recursive: true });

    const [job] = build([
      { id: "CMP-CLAIMS", leaves: [leaf("crito", "fail", ["raw/plato/greek"])] },
    ]).jobs;

    expect(job!.inputs[0]).toEqual({ path: "raw/plato/greek", exists: true, sha256: "" });
  });

  it("detects that a job's inputs moved after dispatch", () => {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(join(root, "wiki/claims/crito.md"), "ledger\n", "utf8");
    const [job] = build([
      { id: "CMP-CLAIMS", leaves: [leaf("crito", "fail", ["wiki/claims/crito.md"])] },
    ]).jobs;

    expect(jobInputsChanged(job!)).toBe(false);

    writeFileSync(join(root, "wiki/claims/crito.md"), "ledger edited\n", "utf8");

    expect(jobInputsChanged(job!)).toBe(true);
  });

  it("filters by lane, family, and scope", () => {
    const families = [
      { id: "CMP-CLAIMS" as const, leaves: [leaf("crito", "fail"), leaf("meno", "fail")] },
      { id: "CMP-READINGS" as const, leaves: [leaf("crito", "fail")] },
    ];

    expect(build(families, { lane: "claims" }).jobs.map((job) => job.job_id)).toEqual([
      "claims/crito",
      "claims/meno",
    ]);
    expect(build(families, { family: "CMP-READINGS" }).jobs.map((job) => job.job_id)).toEqual(["readings/crito"]);
    expect(build(families, { scope: "meno" }).jobs.map((job) => job.job_id)).toEqual(["claims/meno"]);
  });

  it("sorts jobs by id so dispatch order is stable", () => {
    const manifest = build([
      { id: "CMP-READINGS", leaves: [leaf("meno", "fail"), leaf("crito", "fail")] },
      { id: "CMP-CLAIMS", leaves: [leaf("meno", "fail")] },
    ]);

    expect(manifest.jobs.map((job) => job.job_id)).toEqual(["claims/meno", "readings/crito", "readings/meno"]);
  });
});

describe("job manifest persistence", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "jobs-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("round-trips through the cache", () => {
    const manifest = build([{ id: "CMP-CLAIMS", leaves: [leaf("crito", "fail")] }]);

    expect(writeJobManifest(manifest)).toBe(JOB_MANIFEST_PATH);
    expect(readJobManifest()).toEqual(manifest);
  });

  it("names the command that fills an absent cache", () => {
    expect(() => readJobManifest()).toThrow("bun run harness job manifest --write");
  });

  it("refuses a manifest written by another schema version", () => {
    const manifest = build([{ id: "CMP-CLAIMS", leaves: [leaf("crito", "fail")] }]);
    writeJobManifest(manifest);
    const absolute = join(root, JOB_MANIFEST_PATH);
    writeFileSync(absolute, JSON.stringify({ ...manifest, schema_version: 99 }), "utf8");

    expect(() => readJobManifest()).toThrow("is schema 99, expected 1");
  });

  it("suggests near matches for an unknown job id", () => {
    const manifest = build([{ id: "CMP-CLAIMS", leaves: [leaf("crito", "fail")] }]);

    expect(() => findJob(manifest, "crito")).toThrow("Did you mean: claims/crito");
    expect(() => findJob(manifest, "nothing")).toThrow("bun run harness job list");
  });
});

describe("job rendering", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "jobs-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("renders a brief an agent can act on", () => {
    const manifest = build([
      { id: "CMP-READINGS", leaves: [leaf("crito", "fail", ["wiki/commentary/crito.md"])] },
    ]);
    const rendered = renderJob(manifest.jobs[0]!);

    expect(rendered).toContain("# readings/crito");
    expect(rendered).toContain("## Instructions");
    expect(rendered).toContain("## Submit");
    expect(rendered).toContain("wiki/commentary/crito.md (missing)");
    expect(rendered).toContain("commentary-campaign.ts run --execute --dialogue crito");
  });

  it("says why a blocked job cannot start yet", () => {
    const manifest = build([
      { id: "CMP-READINGS", leaves: [leaf("crito", "fail")] },
      { id: "CMP-WRITING-AUDIT", leaves: [leaf("crito", "fail")] },
    ]);

    expect(renderJob(findJob(manifest, "writing-audit/crito"))).toContain("This job is blocked. Close readings/crito");
  });

  it("renders the list with counts and blockers", () => {
    const rendered = renderJobList(
      build([
        { id: "CMP-READINGS", leaves: [leaf("crito", "fail")] },
        { id: "CMP-WRITING-AUDIT", leaves: [leaf("crito", "fail")] },
      ]),
    );

    expect(rendered).toContain("2 open (1 ready, 1 blocked)");
    expect(rendered).toContain("| writing-audit/crito | commentary-audit | campaign | readings/crito |");
  });
});

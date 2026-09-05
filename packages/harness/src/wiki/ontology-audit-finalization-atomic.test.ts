import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  beginOntologyAuditFinalizationTransition,
  publishOntologyAuditFinalizationCandidate,
  setOntologyAuditFinalizationFailureInjectorForTesting,
  terminalAdjudications,
  verifyOntologyAuditPublishedFileBindings,
  type OntologyAuditFinalizationPublicationStep,
  type OntologyAuditFinalizationStagedFile,
} from "./ontology-audit-finalization.js";
import type {
  OntologyAuditAcceptance,
  OntologyAuditManifest,
  OntologyAuditRecordUnit,
} from "./ontology-audit.js";

describe("published ontology acceptance readback", () => {
  test("streams every committed binding and rejects drift or symlink substitution", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-published-binding-"));
    try {
      const large = join(root, "large.jsonl");
      const receipt = join(root, "receipt.md");
      const largeBytes = Buffer.alloc((2 * 1024 * 1024) + 17, 0x61);
      writeFileSync(large, largeBytes);
      writeFileSync(receipt, "receipt\n", "utf8");
      const bindings = [
        { path: large, sha256: createHash("sha256").update(largeBytes).digest("hex") },
        { path: receipt, sha256: createHash("sha256").update("receipt\n").digest("hex") },
      ];

      expect(() => verifyOntologyAuditPublishedFileBindings(bindings)).not.toThrow();
      writeFileSync(receipt, "changed\n", "utf8");
      expect(() => verifyOntologyAuditPublishedFileBindings(bindings)).toThrow(
        "changed after full candidate verification",
      );

      const alias = join(root, "alias.jsonl");
      symlinkSync(large, alias, "file");
      expect(() => verifyOntologyAuditPublishedFileBindings([{
        path: alias,
        sha256: bindings[0]!.sha256,
      }])).toThrow("regular non-symlink file");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

type PublicationFixture = {
  root: string;
  acceptancePath: string;
  transitionAcceptanceContent: string;
  payloads: OntologyAuditFinalizationStagedFile[];
  finalAcceptance: OntologyAuditFinalizationStagedFile;
};

function publicationFixture(): PublicationFixture {
  const root = mkdtempSync(join(tmpdir(), "ontology-finalization-publication-"));
  const acceptancePath = join(root, "acceptance.json");
  const payloads = ["record-units.jsonl", "manifest.json"].map((logicalName) => {
    const targetPath = join(root, logicalName);
    const stagedPath = join(root, `.${logicalName}.candidate`);
    writeFileSync(targetPath, `old:${logicalName}\n`, "utf8");
    writeFileSync(stagedPath, `new:${logicalName}\n`, "utf8");
    return { logicalName, stagedPath, targetPath };
  });
  writeFileSync(acceptancePath, `${JSON.stringify({ state: "accepted", marker: "old" })}\n`, "utf8");
  const finalAcceptance = {
    logicalName: "acceptance.json",
    stagedPath: join(root, ".acceptance.json.candidate"),
    targetPath: acceptancePath,
  };
  writeFileSync(
    finalAcceptance.stagedPath,
    `${JSON.stringify({ state: "accepted", marker: "new" })}\n`,
    "utf8",
  );
  return {
    root,
    acceptancePath,
    transitionAcceptanceContent: `${JSON.stringify({ state: "pending", marker: "transition" })}\n`,
    payloads,
    finalAcceptance,
  };
}

function publishFixture(
  fixture: PublicationFixture,
  {
    verifyCandidate,
    verifyPublished = () => undefined,
  }: {
    verifyCandidate?: () => string;
    verifyPublished?: () => void;
  } = {},
) {
  publishOntologyAuditFinalizationCandidate({
    acceptancePath: fixture.acceptancePath,
    transitionAcceptanceContent: fixture.transitionAcceptanceContent,
    payloads: fixture.payloads,
    finalAcceptance: fixture.finalAcceptance,
    verifyCandidate: verifyCandidate ?? (() =>
      createHash("sha256").update(readFileSync(fixture.finalAcceptance.stagedPath)).digest("hex")),
    verifyPublished,
  });
}

function acceptanceState(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as { state: string; marker?: string };
}

function noStagedFiles(root: string) {
  return readdirSync(root).every((name) => !name.includes("candidate"));
}

describe("atomic ontology audit finalization publication", () => {
  test("publishes the accepted marker last and verifies the fully published candidate", () => {
    const fixture = publicationFixture();
    let candidateVerified = false;
    try {
      publishFixture(fixture, {
        verifyCandidate: () => {
          expect(acceptanceState(fixture.acceptancePath)).toEqual({ state: "pending", marker: "transition" });
          for (const payload of fixture.payloads) {
            expect(readFileSync(payload.targetPath, "utf8")).toBe(`new:${payload.logicalName}\n`);
          }
          candidateVerified = true;
          return createHash("sha256")
            .update(readFileSync(fixture.finalAcceptance.stagedPath))
            .digest("hex");
        },
        verifyPublished: () => {
          expect(candidateVerified).toBeTrue();
          expect(acceptanceState(fixture.acceptancePath)).toEqual({ state: "accepted", marker: "new" });
          for (const payload of fixture.payloads) {
            expect(readFileSync(payload.targetPath, "utf8")).toBe(`new:${payload.logicalName}\n`);
          }
        },
      });
      expect(acceptanceState(fixture.acceptancePath)).toEqual({ state: "accepted", marker: "new" });
      expect(noStagedFiles(fixture.root)).toBeTrue();
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  test("every interruption after transition leaves an explicit pending marker", () => {
    const checkpoints: OntologyAuditFinalizationPublicationStep[] = [
      "before_transition_acceptance",
      "after_transition_acceptance",
      "after_payload:record-units.jsonl",
      "after_payload:manifest.json",
      "before_candidate_verification",
      "after_candidate_verification",
      "before_final_acceptance",
      "after_final_acceptance",
      "before_post_publish_verification",
    ];
    for (const checkpoint of checkpoints) {
      const fixture = publicationFixture();
      const restore = setOntologyAuditFinalizationFailureInjectorForTesting((step) => {
        if (step === checkpoint) throw new Error(`injected:${checkpoint}`);
      });
      try {
        expect(() => publishFixture(fixture)).toThrow(`injected:${checkpoint}`);
        const acceptance = acceptanceState(fixture.acceptancePath);
        if (checkpoint === "before_transition_acceptance") {
          expect(acceptance).toEqual({ state: "accepted", marker: "old" });
          for (const payload of fixture.payloads) {
            expect(readFileSync(payload.targetPath, "utf8")).toBe(`old:${payload.logicalName}\n`);
          }
        } else {
          expect(acceptance).toEqual({ state: "pending", marker: "transition" });
        }
        expect(noStagedFiles(fixture.root)).toBeTrue();
      } finally {
        restore();
        rmSync(fixture.root, { recursive: true, force: true });
      }
    }
  });

  test("a post-publication verifier failure atomically demotes acceptance", () => {
    const fixture = publicationFixture();
    try {
      expect(() => publishFixture(fixture, {
        verifyPublished: () => {
          expect(acceptanceState(fixture.acceptancePath).state).toBe("accepted");
          throw new Error("canonical verifier rejected candidate");
        },
      })).toThrow("canonical verifier rejected candidate");
      expect(acceptanceState(fixture.acceptancePath)).toEqual({
        state: "pending",
        marker: "transition",
      });
      expect(noStagedFiles(fixture.root)).toBeTrue();
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  test("never renames accepted authority when full candidate verification fails", () => {
    const fixture = publicationFixture();
    try {
      expect(() => publishFixture(fixture, {
        verifyCandidate: () => {
          expect(acceptanceState(fixture.acceptancePath).state).toBe("pending");
          throw new Error("full candidate verifier rejected staged acceptance");
        },
        verifyPublished: () => {
          throw new Error("post-commit verifier must not run");
        },
      })).toThrow("full candidate verifier rejected staged acceptance");
      expect(acceptanceState(fixture.acceptancePath)).toEqual({
        state: "pending",
        marker: "transition",
      });
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  test("full candidate verification observes the exact staged acceptance bytes", () => {
    const fixture = publicationFixture();
    const restore = setOntologyAuditFinalizationFailureInjectorForTesting((step) => {
      if (step === "before_candidate_verification") {
        writeFileSync(
          fixture.finalAcceptance.stagedPath,
          `${JSON.stringify({ state: "accepted", marker: "tampered-after-staging" })}\n`,
          "utf8",
        );
      }
    });
    try {
      expect(() => publishFixture(fixture, {
        verifyCandidate: () => {
          const staged = acceptanceState(fixture.finalAcceptance.stagedPath);
          if (staged.marker !== "new") throw new Error("full verifier observed tampered staged acceptance");
          return createHash("sha256")
            .update(readFileSync(fixture.finalAcceptance.stagedPath))
            .digest("hex");
        },
      })).toThrow("full verifier observed tampered staged acceptance");
      expect(acceptanceState(fixture.acceptancePath).state).toBe("pending");
    } finally {
      restore();
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  test("refuses staged acceptance bytes mutated after full verification", () => {
    const fixture = publicationFixture();
    const restore = setOntologyAuditFinalizationFailureInjectorForTesting((step) => {
      if (step === "after_candidate_verification") {
        writeFileSync(
          fixture.finalAcceptance.stagedPath,
          `${JSON.stringify({ state: "accepted", marker: "tampered-after-verification" })}\n`,
          "utf8",
        );
      }
    });
    try {
      expect(() => publishFixture(fixture)).toThrow("changed after full verification");
      expect(acceptanceState(fixture.acceptancePath).state).toBe("pending");
    } finally {
      restore();
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
});

const EMPTY_FINAL_ADJUSTMENTS = {
  required: false as const,
  decision_artifact: null,
  prior_state_artifact: null,
  receipt: null,
};

function transitionAcceptance(finalAdjustments = EMPTY_FINAL_ADJUSTMENTS): OntologyAuditAcceptance {
  const sha = "a".repeat(64);
  return {
    schema_version: 1,
    snapshot_id: `sha256-${sha}`,
    state: "accepted",
    manifest: { path: "manifest.json", sha256: sha },
    partitions: {} as OntologyAuditAcceptance["partitions"],
    final_adjustments: finalAdjustments,
    final_corpus_digest: sha,
    receipt: { path: "wiki/review/fixture.md", sha256: sha },
    closure: {
      baseline_set_equal: true,
      final_set_equal: true,
      source_passes_complete: true,
      reconciliations_complete: true,
      adjudications_complete: true,
      unresolved_adjudications: 0,
      stale_aliases: 0,
      rejected_reader_leaks: 0,
      regeneration_one_sha256: sha,
      regeneration_two_sha256: sha,
    },
  };
}

function transitionManifest(finalAdjustments = EMPTY_FINAL_ADJUSTMENTS) {
  return { final_adjustments: finalAdjustments } as OntologyAuditManifest;
}

describe("ontology audit finalization transition", () => {
  test("durably and idempotently demotes accepted closure authority before mutation", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-finalization-transition-")));
    const packagePath = join(root, `wiki/ontology-audits/sha256-${"a".repeat(64)}`);
    mkdirSync(packagePath, { recursive: true });
    writeFileSync(
      join(packagePath, "acceptance.json"),
      `${JSON.stringify(transitionAcceptance(), null, 2)}\n`,
      "utf8",
    );
    writeFileSync(
      join(packagePath, "manifest.json"),
      `${JSON.stringify(transitionManifest(), null, 2)}\n`,
      "utf8",
    );
    try {
      const first = beginOntologyAuditFinalizationTransition({ repoRoot: root, packagePath });
      expect(first.changed).toBeTrue();
      expect(first.packagePath).toBe(`wiki/ontology-audits/sha256-${"a".repeat(64)}`);
      expect(first.acceptance).toMatchObject({
        state: "pending",
        final_corpus_digest: null,
        receipt: null,
        final_adjustments: EMPTY_FINAL_ADJUSTMENTS,
        closure: {
          source_passes_complete: false,
          reconciliations_complete: false,
          adjudications_complete: false,
          regeneration_one_sha256: null,
          regeneration_two_sha256: null,
        },
      });
      const pendingBytes = readFileSync(join(packagePath, "acceptance.json"), "utf8");
      const second = beginOntologyAuditFinalizationTransition({ repoRoot: root, packagePath });
      expect(second.changed).toBeFalse();
      expect(readFileSync(join(packagePath, "acceptance.json"), "utf8")).toBe(pendingBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("refuses to demote a required final-adjustment binding with no durable artifact", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-finalization-transition-binding-")));
    const packagePath = join(root, `wiki/ontology-audits/sha256-${"a".repeat(64)}`);
    const sha = "b".repeat(64);
    const required = {
      required: true as const,
      decision_artifact: { path: "review-inputs/final-adjustments/decisions.jsonl", sha256: sha },
      prior_state_artifact: { path: "review-inputs/final-adjustments/prior.json", sha256: sha },
      receipt: { path: "wiki/review/final-adjustments.md", sha256: sha },
    };
    mkdirSync(packagePath, { recursive: true });
    const acceptedBytes = `${JSON.stringify(transitionAcceptance(required), null, 2)}\n`;
    writeFileSync(join(packagePath, "acceptance.json"), acceptedBytes, "utf8");
    writeFileSync(
      join(packagePath, "manifest.json"),
      `${JSON.stringify(transitionManifest(required), null, 2)}\n`,
      "utf8",
    );
    try {
      expect(() => beginOntologyAuditFinalizationTransition({ repoRoot: root, packagePath }))
        .toThrow("requires its bound final-adjustment artifact");
      expect(readFileSync(join(packagePath, "acceptance.json"), "utf8")).toBe(acceptedBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects a symlinked audit-package parent before changing an outside acceptance marker", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-finalization-parent-symlink-")));
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-finalization-outside-")));
    const snapshot = `sha256-${"a".repeat(64)}`;
    const outsidePackage = join(outside, "ontology-audits", snapshot);
    mkdirSync(outsidePackage, { recursive: true });
    const acceptedBytes = `${JSON.stringify(transitionAcceptance(), null, 2)}\n`;
    writeFileSync(join(outsidePackage, "acceptance.json"), acceptedBytes, "utf8");
    writeFileSync(
      join(outsidePackage, "manifest.json"),
      `${JSON.stringify(transitionManifest(), null, 2)}\n`,
      "utf8",
    );
    mkdirSync(join(root, "wiki"), { recursive: true });
    symlinkSync(join(outside, "ontology-audits"), join(root, "wiki/ontology-audits"), "dir");
    try {
      expect(() => beginOntologyAuditFinalizationTransition({
        repoRoot: root,
        packagePath: join(root, "wiki/ontology-audits", snapshot),
      })).toThrow("no symlinked parent component");
      expect(readFileSync(join(outsidePackage, "acceptance.json"), "utf8")).toBe(acceptedBytes);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("pending state does not disable durable final-adjustment coverage", () => {
    const pointer = (character: string) => ({
      path: "wiki/commentary/fixture.md",
      ordinal: 0,
      canonical_sha256: character.repeat(64),
      review_status: "accepted" as const,
    });
    const prior: OntologyAuditRecordUnit = {
      key: "record:commentary:comm_fixture_0001",
      kind: "record",
      lane: "commentary",
      stable_id: "comm_fixture_0001",
      source: null,
      references: [],
      baseline: null,
      final: pointer("a"),
      change: "added",
      audit_state: "complete",
    };
    const final = { ...prior, final: pointer("b") };
    const durableFinalAdjustments = { required: true };
    const transientAcceptance = { state: "pending" };
    expect(transientAcceptance.state).toBe("pending");
    expect(() => terminalAdjudications({
      priorRows: { records: [prior], graphs: [] },
      rows: {
        sources: [],
        records: [final],
        concepts: [],
        graphs: [],
        findings: [],
        adjudications: [],
      },
      previous: [],
      findings: [],
      semantic: new Map(),
      concepts: new Map(),
      finalAdjustments: new Map(),
      requireFinalAdjustmentCoverage: durableFinalAdjustments.required,
      preservedPriorTargets: null,
    })).toThrow("lacks an exact final adjustment");
  });
});

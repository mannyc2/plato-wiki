import { describe, expect, it } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildPublicReplayProvenanceReceipt,
  buildPublicSourceAcquisitionReceipt,
  buildReplayProvenanceReceipt,
  type SourceAcquisitionReceipt,
  validateReleaseProvenanceReceipts,
} from "./release-provenance.js";
import { writePublicReplayProvenance } from "../../../scripts/release/generate-provenance.js";

function write(root: string, path: string, content: string) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content, "utf8");
}

describe("release provenance", () => {
  it("refuses an accepted artifact without review evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "release-provenance-"));
    try {
      write(root, "wiki/claims/apology.md", "claim\n");
      mkdirSync(join(root, "wiki/review"), { recursive: true });
      expect(() => buildReplayProvenanceReceipt({ repoRoot: root, corpusSourceCommit: "a".repeat(40) })).toThrow("lacks replay/editorial evidence");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports missing receipts instead of accepting nonempty placeholders", () => {
    const root = mkdtempSync(join(tmpdir(), "release-provenance-"));
    try {
      write(root, "release/private/replay-provenance.json", "{}\n");
      write(root, "release/private/source-acquisition-receipts.json", "{}\n");
      const issues = validateReleaseProvenanceReceipts(root);
      expect(issues).toContain("release/private/replay-provenance.json has invalid release identity");
      expect(issues).toContain("release/private/source-acquisition-receipts.json has invalid release identity");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("builds public receipts without private Git history identifiers", () => {
    const root = mkdtempSync(join(tmpdir(), "release-provenance-"));
    try {
      const replay = buildPublicReplayProvenanceReceipt(root);
      expect(replay).toEqual({
        schema_version: 2,
        artifact_kind: "plato-public-replay-provenance",
        release_version: "2.0.0",
        artifacts: [],
      });
      expect("corpus_source_commit" in replay).toBe(false);

      const privateSource = {
        schema_version: 1,
        artifact_kind: "plato-source-acquisition-receipts",
        release_version: "2.0.0",
        verifier: { path: "verifier.py", sha256: "a".repeat(64) },
        importer: { path: "importer.py", sha256: "b".repeat(64) },
        sources_record: { path: "SOURCES.md", sha256: "c".repeat(64) },
        sources: [],
      } satisfies SourceAcquisitionReceipt;
      expect(buildPublicSourceAcquisitionReceipt(privateSource)).toEqual({
        ...privateSource,
        schema_version: 2,
        artifact_kind: "plato-public-source-acquisition-receipts",
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("selects public receipt paths when private receipts are absent", () => {
    const root = mkdtempSync(join(tmpdir(), "release-provenance-"));
    try {
      write(root, "release/public/replay-provenance.json", "{}\n");
      write(root, "release/public/source-acquisition-receipts.json", "{}\n");
      const issues = validateReleaseProvenanceReceipts(root);
      expect(issues).toContain("release/public/replay-provenance.json has invalid release identity");
      expect(issues).toContain("release/public/source-acquisition-receipts.json has invalid release identity");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not publish or leave a temporary receipt when candidate validation fails", () => {
    const root = mkdtempSync(join(tmpdir(), "release-provenance-"));
    try {
      const prior = "prior receipt bytes\n";
      write(root, "release/public/replay-provenance.json", prior);

      expect(() => writePublicReplayProvenance(root)).toThrow(
        "release/public/source-acquisition-receipts.json is missing or malformed",
      );
      expect(readFileSync(join(root, "release/public/replay-provenance.json"), "utf8")).toBe(prior);
      expect(readdirSync(join(root, "release/public"))).toEqual(["replay-provenance.json"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

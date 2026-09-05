import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CANONICAL_DIALOGUES, buildCompletenessReport, type CompletenessFacts, type DialogueCompletenessFacts } from "./completeness.js";
import { buildPublicReleaseFacts, buildPublicReleaseReport, type PublicReleaseFacts } from "./public-release.js";

function dialogue(dialogue: string): DialogueCompletenessFacts {
  const review = { accepted: 1, rejected: 0, unreviewed: 0, needsSplit: 0 };
  return {
    dialogue,
    greekSource: true, greekProvenance: true, englishSource: true, englishProvenance: true,
    observations: { ledger: true, valid: true, scopeClosed: true, review: { ...review } },
    claims: { ledger: true, valid: true, scopeClosed: true, review: { ...review } },
    relations: { ledger: false, valid: false, records: 0, auditedRecords: 0, acceptedEdges: 0, auditedAcceptedEdges: 0, review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 } },
    derived: { stephanus: true, turns: true, tokens: true, anchors: true, turnLengths: true, assent: true, procedure: true, joins: true },
    englishIndexCurrent: true,
    commentary: { ledger: true, accepted: true, auditAccepted: true, readingPage: true },
    audio: { exposed: false, exposedAccepted: true, attribution: false, screenplay: false, render: false, mastering: false, mechanicalQa: false, acceptance: false, recording: false, website: false },
    reportedTurns: {
      scope: "none", scopeIssues: [], manifestTurnIds: [], ledger: false, ledgerValid: false, representedTurnIds: [],
      review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 }, atomicCohort: true, compiledIndexCurrent: false,
      acceptedRecords: 0, resolvedExplicit: 0, resolvedReviewedDiscourse: 0, acceptedUnresolved: 0,
    },
    warnings: [],
  };
}

function facts(): CompletenessFacts {
  return {
    schemaVersion: 1,
    canonicalDialogues: CANONICAL_DIALOGUES,
    discoveredGreek: [...CANONICAL_DIALOGUES],
    discoveredEnglish: [...CANONICAL_DIALOGUES],
    sourceManifestValid: true,
    comparisonValid: true,
    siteValid: true,
    siteEvidence: "valid",
    relationAudit: {
      packagePath: "wiki/ontology-audits/fixture",
      semanticProofVerified: true,
      closureEvidenceValid: true,
      rejectedReaderLeaks: 0,
      acceptedRelationFictionIssues: 0,
    },
    dialogues: CANONICAL_DIALOGUES.map(dialogue),
    crossDialogueRelations: { ledger: false, valid: false, records: 0, auditedRecords: 0, acceptedEdges: 0, auditedAcceptedEdges: 0, review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 } },
    reportedTurnScopeIssues: [],
    apparatus: { infrastructureImplemented: true, state: "contract_pending", required: false, evidence: [] },
  };
}

const greenOverlay: PublicReleaseFacts = {
  provenance: { valid: true, evidence: "valid" },
  tree: { valid: true, manifestPresent: true, manifestHash: "a", inventoryHash: "b", evidence: "valid" },
  license: { valid: true, evidence: "valid" },
  ci: { valid: true, evidence: "valid" },
};

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function writeFixtureFile(root: string, path: string, content: string) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content, "utf8");
}

function writeManifest(root: string, files: Array<{ path: string; sha256: string }>, extra: Record<string, unknown> = {}) {
  writeFixtureFile(root, "release/private/manifest.json", `${JSON.stringify({ files, ...extra })}\n`);
}

describe("overlay", () => {
  it("can fail release even when the selected edition is complete", () => {
    const input = facts();
    const completeness = buildCompletenessReport(input);
    const report = buildPublicReleaseReport(input, completeness, "knowledge-base", { ...greenOverlay, tree: { ...greenOverlay.tree, valid: false } });
    expect(completeness.targets["knowledge-base"].ready).toBe(true);
    expect(report.ready).toBe(false);
    expect(report.checks.find((entry) => entry.id === "PUB-TREE")?.state).toBe("fail");
  });

  it("cannot pass with an incomplete selected edition", () => {
    const input = facts();
    input.dialogues[0]!.commentary.accepted = false;
    const report = buildPublicReleaseReport(input, buildCompletenessReport(input), "knowledge-base", greenOverlay);
    expect(report.ready).toBe(false);
    expect(report.checks.find((entry) => entry.id === "PUB-TARGET")?.state).toBe("fail");
  });

  describe("PUB-CI static contract", () => {
    function ciFixture(files: Record<string, string>) {
      const root = mkdtempSync(join(tmpdir(), "public-release-ci-"));
      for (const [path, content] of Object.entries(files)) writeFixtureFile(root, path, content);
      return root;
    }

    const DRIVER = [
      'const STAGES = [',
      '  { name: "test", command: "bun run test" },',
      '  { name: "typecheck", command: "bun run typecheck" },',
      '  { name: "validate", command: "bun run validate" },',
      '];',
      'if (failed) process.exit(1);',
    ].join("\n");

    it("accepts a workflow that runs the gates directly", () => {
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run test\nrun: bun run typecheck\nrun: bun run validate\n",
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(true);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("follows a `bun run ci` entry point to the driver the manifest resolves", () => {
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run ci\n",
        "package.json": JSON.stringify({ scripts: { ci: "bun scripts/ci.ts" } }),
        "scripts/ci.ts": DRIVER,
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(true);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("accepts an entry point that chains the gates inline, with no driver file", () => {
      // `&&` aborts at the first failing gate, so a chained script satisfies the
      // contract without a driver to read. Requiring one would fail a correct
      // setup for its file layout.
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run ci\n",
        "package.json": JSON.stringify({
          scripts: { ci: "bun run test && bun run typecheck && bun run validate" },
        }),
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(true);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("rejects an entry point that chains only some of the gates", () => {
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run ci\n",
        "package.json": JSON.stringify({ scripts: { ci: "bun run test && bun run typecheck" } }),
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(false);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("rejects an entry point whose driver skips a gate", () => {
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run ci\n",
        "package.json": JSON.stringify({ scripts: { ci: "bun scripts/ci.ts" } }),
        "scripts/ci.ts": DRIVER.replace('{ name: "validate", command: "bun run validate" },', ""),
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(false);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("rejects an entry point whose driver does not abort on a failed stage", () => {
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run ci\n",
        "package.json": JSON.stringify({ scripts: { ci: "bun scripts/ci.ts" } }),
        "scripts/ci.ts": DRIVER.replace("if (failed) process.exit(1);", "console.log(failed);"),
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(false);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("rejects a secret-bearing driver even when every gate runs", () => {
      const root = ciFixture({
        ".github/workflows/ci.yml": "run: bun run ci\n",
        "package.json": JSON.stringify({ scripts: { ci: "bun scripts/ci.ts" } }),
        "scripts/ci.ts": `${DRIVER}\nconst key = process.env.PI_API_KEY;`,
      });
      try {
        expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "m.json" }).ci.valid).toBe(false);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  });

  it("accepts a sorted typed manifest whose materialized tree has exact content hashes", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "release/public-files.toml", "paths = [\"index.html\"]\n");
      writeFixtureFile(root, "public/index.html", "index\n");
      writeManifest(root, [{ path: "index.html", sha256: sha256("index\n") }], { publicFilesSha256: sha256("paths = [\"index.html\"]\n") });
      const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json", publicTree: "public" });
      expect(result.tree.valid).toBe(true);
      expect(result.tree.evidence).toContain("paths and content hashes");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("binds a declared public-files digest to release/public-files.toml", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "release/public-files.toml", "paths = [\"index.html\"]\n");
      writeFixtureFile(root, "index.html", "index\n");
      writeManifest(root, [{ path: "index.html", sha256: sha256("index\n") }], { allowlistSha256: sha256("different\n") });
      const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json" });
      expect(result.tree.valid).toBe(false);
      expect(result.tree.evidence).toContain("content hash differs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects tampered materialized content even when its path matches", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "public/index.html", "tampered\n");
      writeManifest(root, [{ path: "index.html", sha256: sha256("expected\n") }]);
      const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json", publicTree: "public" });
      expect(result.tree.valid).toBe(false);
      expect(result.tree.evidence).toContain("differs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects traversal, absolute, and backslash manifest paths", () => {
    const unsafePaths = [
      "../secret.txt",
      "/tmp/secret.txt",
      "C:/secret.txt",
      "private\\secret.txt",
      "plans/secret.md",
      "release/private/secret.json",
    ];
    for (const unsafePath of unsafePaths) {
      const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
      try {
        writeManifest(root, [{ path: unsafePath, sha256: sha256("secret") }]);
        const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json" });
        expect(result.tree.valid).toBe(false);
        expect(result.tree.evidence).toContain("unsafe");
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it("rejects path-only manifest entries without a content digest", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(
        root,
        "release/private/manifest.json",
        `${JSON.stringify({ files: [{ path: "index.html" }] })}\n`,
      );
      const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json" });
      expect(result.tree.valid).toBe(false);
      expect(result.tree.evidence).toContain("path and sha256");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects duplicate and unsorted manifest paths", () => {
    const fixtures = [
      [
        { path: "index.html", sha256: sha256("index") },
        { path: "index.html", sha256: sha256("index") },
      ],
      [
        { path: "z.html", sha256: sha256("z") },
        { path: "a.html", sha256: sha256("a") },
      ],
    ];
    for (const files of fixtures) {
      const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
      try {
        writeManifest(root, files);
        const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json" });
        expect(result.tree.valid).toBe(false);
        expect(result.tree.evidence).toMatch(/duplicate|sorted/u);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it("verifies a canonical manifest against repoRoot when no public tree is supplied", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "index.html", "canonical\n");
      writeManifest(root, [{ path: "index.html", sha256: sha256("canonical\n") }]);
      expect(buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json" }).tree.valid).toBe(true);
      writeFixtureFile(root, "index.html", "tampered\n");
      const tampered = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json" });
      expect(tampered.tree.valid).toBe(false);
      expect(tampered.tree.evidence).toContain("content hash differs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects symlinks in a materialized tree", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "target.html", "target\n");
      mkdirSync(join(root, "public"), { recursive: true });
      symlinkSync(join(root, "target.html"), join(root, "public/index.html"));
      writeManifest(root, [{ path: "index.html", sha256: sha256("target\n") }]);
      const result = buildPublicReleaseFacts({ repoRoot: root, exportManifest: "release/private/manifest.json", publicTree: "public" });
      expect(result.tree.valid).toBe(false);
      expect(result.tree.evidence).toContain("symlink");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("requires the complete code, content, notice, provenance, and publication-license set", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "LICENSE", "code license\n");
      writeFixtureFile(root, "LICENSE-CONTENT", "content license\n");
      writeFixtureFile(root, "raw/plato/SOURCES.md", "# Sources\n");
      writeFixtureFile(root, "docs/publication-license.md", "# Publication license\n");
      expect(buildPublicReleaseFacts({ repoRoot: root }).license.valid).toBe(false);
      writeFixtureFile(root, "NOTICE", "notices\n");
      expect(buildPublicReleaseFacts({ repoRoot: root }).license.valid).toBe(true);
      for (const [path, content] of [
        ["LICENSE", "code license\n"],
        ["LICENSE-CONTENT", "content license\n"],
        ["NOTICE", "notices\n"],
        ["raw/plato/SOURCES.md", "# Sources\n"],
        ["docs/publication-license.md", "# Publication license\n"],
      ] as const) {
        unlinkSync(join(root, path));
        expect(buildPublicReleaseFacts({ repoRoot: root }).license.valid).toBe(false);
        writeFixtureFile(root, path, content);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("accepts the ordinary ci.yml workflow name", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, ".github/workflows/ci.yml", "steps:\n  - run: bun run test\n  - run: bun run typecheck\n  - run: bun run validate\n");
      expect(buildPublicReleaseFacts({ repoRoot: root }).ci.valid).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects nonempty provenance placeholders", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "release/private/replay-provenance.json", "{}\n");
      writeFixtureFile(root, "release/private/source-acquisition-receipts.json", "{}\n");
      const result = buildPublicReleaseFacts({ repoRoot: root });
      expect(result.provenance.valid).toBe(false);
      expect(result.provenance.evidence).toContain("invalid release identity");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("uses public provenance receipts in a clean public tree", () => {
    const root = mkdtempSync(join(tmpdir(), "public-release-fixture-"));
    try {
      writeFixtureFile(root, "release/public/replay-provenance.json", "{}\n");
      writeFixtureFile(root, "release/public/source-acquisition-receipts.json", "{}\n");
      const result = buildPublicReleaseFacts({ repoRoot: root });
      expect(result.provenance.valid).toBe(false);
      expect(result.provenance.evidencePath).toBe("release/public");
      expect(result.provenance.evidence).toContain("release/public/replay-provenance.json");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

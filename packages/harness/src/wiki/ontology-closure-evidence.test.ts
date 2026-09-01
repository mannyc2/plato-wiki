import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import {
  assertOntologyClosureEvidenceProof,
  assertOntologyClosureEvidenceRegenerationBinding,
  recomputeOntologyClosureEvidence,
  renderOntologyClosureEvidence,
  verifyOntologyClosureEvidenceFile,
  type OntologyClosureEvidence,
} from "./ontology-closure-evidence.js";

const EMPTY_EVIDENCE: OntologyClosureEvidence = {
  staleAliasIssues: [],
  rejectedReaderLeaks: [],
  terminalStateIssues: [],
  acceptedClaimLinkIssues: [],
  acceptedCommentaryCitationIssues: [],
  acceptedRelationFictionIssues: [],
};

function fixture() {
  const repoRoot = mkdtempSync(join(realpathSync(tmpdir()), "ontology-closure-evidence-"));
  const packagePath = join(repoRoot, `wiki/ontology-audits/sha256-${"a".repeat(64)}`);
  const siteDirectory = join(repoRoot, "prebuilt-site");
  mkdirSync(packagePath, { recursive: true });
  mkdirSync(siteDirectory, { recursive: true });
  writeFileSync(join(siteDirectory, "index.html"), "<!doctype html><title>fixture</title>\n", "utf8");
  return { repoRoot, packagePath, siteDirectory };
}

describe("deterministic ontology closure evidence", () => {
  test("rejects forged zero arrays when current canonical ledgers contain a defect", () => {
    const paths = fixture();
    try {
      mkdirSync(join(paths.repoRoot, "wiki/claims"), { recursive: true });
      writeFileSync(join(paths.repoRoot, "wiki/claims/fixture.md"), `\`\`\`yaml
claim_id: claim_fixture_0001
observation_ids: []
review_status: accepted
\`\`\`
`, "utf8");
      writeFileSync(
        join(paths.packagePath, "closure-evidence.json"),
        renderOntologyClosureEvidence(EMPTY_EVIDENCE),
        "utf8",
      );

      const recomputed = recomputeOntologyClosureEvidence(paths);
      expect(recomputed.evidence.acceptedClaimLinkIssues).toEqual([
        "wiki/claims/fixture.md:claim_fixture_0001:missing observation_ids",
      ]);
      expect(() => verifyOntologyClosureEvidenceFile(paths))
        .toThrow("differs from deterministic recomputation");
    } finally {
      rmSync(paths.repoRoot, { recursive: true, force: true });
    }
  });

  test("accepts only exact canonical bytes and returns an identity-bound proof", () => {
    const paths = fixture();
    try {
      const recomputed = recomputeOntologyClosureEvidence(paths);
      expect(recomputed.evidence).toEqual(EMPTY_EVIDENCE);
      writeFileSync(join(paths.packagePath, "closure-evidence.json"), recomputed.content, "utf8");

      const proof = verifyOntologyClosureEvidenceFile(paths);
      expect(proof.content).toBe(recomputed.content);
      expect(proof.sha256).toBe(recomputed.sha256);
      expect(proof.site_tree_sha256).toBe(recomputed.site_tree_sha256);
      expect(assertOntologyClosureEvidenceProof(proof, paths)).toBe(proof);
      expect(() => assertOntologyClosureEvidenceProof(
        { ...proof },
        paths,
      )).toThrow("was not produced by exact verification");
      mkdirSync(join(paths.repoRoot, "different-site"));
      expect(() => assertOntologyClosureEvidenceProof(proof, {
        ...paths,
        siteDirectory: join(paths.repoRoot, "different-site"),
      })).toThrow("belongs to a different repository, package, or prebuilt site");
    } finally {
      rmSync(paths.repoRoot, { recursive: true, force: true });
    }
  });

  test("rejects a repository path with a symlinked parent component", () => {
    const paths = fixture();
    const aliasHolder = mkdtempSync(join(realpathSync(tmpdir()), "ontology-closure-evidence-alias-"));
    const parentAlias = join(aliasHolder, "parent-alias");
    symlinkSync(dirname(paths.repoRoot), parentAlias, "dir");
    const aliasedRoot = join(parentAlias, basename(paths.repoRoot));
    try {
      expect(() => recomputeOntologyClosureEvidence({
        repoRoot: aliasedRoot,
        siteDirectory: join(aliasedRoot, "prebuilt-site"),
      })).toThrow("no symlinked parent component");
    } finally {
      rmSync(aliasHolder, { recursive: true, force: true });
      rmSync(paths.repoRoot, { recursive: true, force: true });
    }
  });

  test("rejects a symlinked parent inside an expected projection tree", () => {
    const paths = fixture();
    const outside = mkdtempSync(join(realpathSync(tmpdir()), "ontology-closure-evidence-derived-"));
    mkdirSync(join(outside, "plato/joins"), { recursive: true });
    mkdirSync(join(outside, "plato/voices"), { recursive: true });
    symlinkSync(outside, join(paths.repoRoot, "derived"), "dir");
    try {
      expect(() => recomputeOntologyClosureEvidence(paths))
        .toThrow("Evidence tree must have no symlinked parent component");
    } finally {
      rmSync(outside, { recursive: true, force: true });
      rmSync(paths.repoRoot, { recursive: true, force: true });
    }
  });

  test("invalidates a proof after evidence, site, or ledger mutation", () => {
    const mutate = [
      (paths: ReturnType<typeof fixture>) => {
        writeFileSync(join(paths.packagePath, "closure-evidence.json"), "{}\n", "utf8");
      },
      (paths: ReturnType<typeof fixture>) => {
        writeFileSync(join(paths.siteDirectory, "index.html"), "changed site\n", "utf8");
      },
      (paths: ReturnType<typeof fixture>) => {
        mkdirSync(join(paths.repoRoot, "wiki/claims"), { recursive: true });
        writeFileSync(join(paths.repoRoot, "wiki/claims/new.md"), `\`\`\`yaml
claim_id: claim_fixture_0002
observation_ids: []
review_status: accepted
\`\`\`
`, "utf8");
      },
    ];
    for (const mutateFixture of mutate) {
      const paths = fixture();
      try {
        const recomputed = recomputeOntologyClosureEvidence(paths);
        writeFileSync(join(paths.packagePath, "closure-evidence.json"), recomputed.content, "utf8");
        const proof = verifyOntologyClosureEvidenceFile(paths);
        mutateFixture(paths);
        expect(() => assertOntologyClosureEvidenceProof(proof, paths))
          .toThrow("proof is stale");
      } finally {
        rmSync(paths.repoRoot, { recursive: true, force: true });
      }
    }
  });

  test("rejects regeneration descriptors from site A with a closure proof for site B", () => {
    const paths = fixture();
    try {
      const siteA = recomputeOntologyClosureEvidence(paths);
      writeFileSync(join(paths.packagePath, "closure-evidence.json"), siteA.content, "utf8");

      const siteBDirectory = join(paths.repoRoot, "different-site");
      mkdirSync(siteBDirectory);
      writeFileSync(join(siteBDirectory, "index.html"), "different site bytes\n", "utf8");
      const siteBProof = verifyOntologyClosureEvidenceFile({
        repoRoot: paths.repoRoot,
        packagePath: paths.packagePath,
        siteDirectory: siteBDirectory,
      });

      expect(() => assertOntologyClosureEvidenceRegenerationBinding(siteBProof, {
        closureEvidenceSha256: siteBProof.sha256,
        siteTreeSha256: siteBProof.site_tree_sha256,
        siteArtifacts: siteA.site_artifacts,
      })).toThrow("do not exactly match the site tree");
      expect(assertOntologyClosureEvidenceRegenerationBinding(siteBProof, {
        closureEvidenceSha256: siteBProof.sha256,
        siteTreeSha256: siteBProof.site_tree_sha256,
        siteArtifacts: siteBProof.site_artifacts,
      })).toBe(siteBProof);
    } finally {
      rmSync(paths.repoRoot, { recursive: true, force: true });
    }
  });
});

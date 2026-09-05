import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import {
  finalMembershipReplacementKeys,
  mergeOntologyAuditPartition,
} from "./ontology-audit-finalization.js";
import type { OntologyAuditRecordUnit } from "./ontology-audit.js";
import {
  cleanOntologyGeneratedProjectionRoots,
  collectOntologyCanonicalRegenerationArtifacts,
  collectOntologyRegenerationArtifacts,
  collectAcceptedRelationFictionIssues,
  forbiddenOntologyAliasPaths,
  ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES,
  ONTOLOGY_REGENERATION_PHASES,
  ontologyReaderProjectionPaths,
  ontologyRegenerationArtifact,
  ontologyRegenerationArtifactsEqual,
  ontologyRegenerationBindsClosureEvidenceSite,
  ontologyRegenerationDigest,
  ontologyRegenerationRunsEqual,
  rejectedRecordIdsInReaderFiles,
  type OntologyRegenerationArtifact,
} from "./ontology-vnext-closure.js";

describe("accepted semantic relation closure evidence", () => {
  test("finds the three corpus-shaped accepted non-relations without flagging legitimate nuance", () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "ontology-relation-fiction-")));
    try {
      mkdirSync(join(root, "wiki/relations"), { recursive: true });
      writeFileSync(join(root, "wiki/relations/republic.md"), `\`\`\`yaml
relation_id: rel_republic_0024
relation_kind: tension
resolution: verbal_only
basis: Both claims share the term ἀμαθία but deploy it in different argumentative frames and with different scope.
limits: The shared term alone does not create a contradiction or substantive tension.
review_status: accepted
\`\`\`\n`, "utf8");
      writeFileSync(join(root, "wiki/relations/cross-dialogue.md"), `\`\`\`yaml
relation_id: rel_cross-dialogue_0638
relation_kind: tension
resolution: standing
basis: The shared term ψυχήν does not indicate a shared thesis; one is a political ranking of goods, the other is a metaphysical argument. They neither contradict nor restate each other.
limits: The claims address distinct questions.
review_status: accepted
\`\`\`\n`, "utf8");
      writeFileSync(join(root, "wiki/relations/timaeus.md"), `\`\`\`yaml
relation_id: rel_timaeus_0050
relation_kind: tension
resolution: standing
basis: These are thematically linked by πνεῦμα but address different bodily processes.
limits: The claims do not conflict. The relation is limited to the shared substance-term πνεῦμα across different explanatory contexts.
review_status: accepted
\`\`\`\n`, "utf8");
      writeFileSync(join(root, "wiki/relations/meno.md"), `\`\`\`yaml
relation_id: rel_meno_0001
relation_kind: tension
resolution: standing
basis: The claims are not formally contradictory, but they pull against each other because one makes knowledge sufficient while the other identifies a further condition.
limits: The tension is substantive even though both claims can remain left standing.
review_status: accepted
\`\`\`\n`, "utf8");

      expect(collectAcceptedRelationFictionIssues(root)).toEqual([
        "wiki/relations/cross-dialogue.md:rel_cross-dialogue_0638:shared_term_no_shared_thesis",
        "wiki/relations/republic.md:rel_republic_0024:declared_kind_denial",
        "wiki/relations/timaeus.md:rel_timaeus_0050:lexical_only_standing_tension",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("split membership finalization", () => {
  test("uses structured semantic replacements instead of parsing public assignment prose", () => {
    const conceptKey = `concept:vnext:concept_sha256_${"a".repeat(64)}`;
    const finalMemberships = [
      {
        key: "membership:vnext:child-a",
        concept_key: conceptKey,
        observation_key: "record:observation:obs_fixture_0101",
      },
      {
        key: "membership:vnext:child-b",
        concept_key: conceptKey,
        observation_key: "record:observation:obs_fixture_0102",
      },
      {
        key: "membership:vnext:unrelated",
        concept_key: conceptKey,
        observation_key: "record:observation:obs_fixture_0999",
      },
    ];

    expect(finalMembershipReplacementKeys(
      finalMemberships,
      conceptKey,
      "record:observation:obs_fixture_0001",
      [
        "record:observation:obs_fixture_0102",
        "record:claim:claim_fixture_0101",
        "record:observation:obs_fixture_0101",
      ],
    )).toEqual([
      "membership:vnext:child-a",
      "membership:vnext:child-b",
    ]);
  });
});

describe("ontology audit final-state binding", () => {
  const HASH_A = "a".repeat(64);
  const HASH_B = "b".repeat(64);

  function record(
    key: string,
    baseline: OntologyAuditRecordUnit["baseline"],
    final: OntologyAuditRecordUnit["final"],
  ): OntologyAuditRecordUnit {
    return {
      key,
      kind: "record",
      lane: "observation",
      stable_id: key.split(":").at(-1)!,
      source: null,
      references: [],
      baseline,
      final,
      change: baseline === null ? "added" : final === null ? "removed" : "modified",
      audit_state: "complete",
    };
  }

  test("is idempotent and never promotes a prior final-only row into the baseline", () => {
    const frozen = record(
      "record:observation:frozen",
      { path: "wiki/observations/frozen.md", ordinal: 0, raw_sha256: HASH_A, review_status: "accepted" },
      { path: "wiki/observations/frozen.md", ordinal: 0, canonical_sha256: HASH_A, review_status: "accepted" },
    );
    const liveFrozen = record(
      frozen.key,
      null,
      { path: "wiki/observations/frozen.md", ordinal: 0, canonical_sha256: HASH_B, review_status: "accepted" },
    );
    const liveAdded = record(
      "record:observation:added",
      null,
      { path: "wiki/observations/added.md", ordinal: 1, canonical_sha256: HASH_B, review_status: "accepted" },
    );

    const first = mergeOntologyAuditPartition([frozen], [liveFrozen, liveAdded]);
    const second = mergeOntologyAuditPartition(first, [liveFrozen, liveAdded]);
    expect(second).toEqual(first);
    expect(second.find((row) => row.key === liveAdded.key)).toMatchObject({
      baseline: null,
      change: "added",
    });
    expect(second.find((row) => row.key === frozen.key)).toMatchObject({
      change: "modified",
    });

    const withoutAdded = mergeOntologyAuditPartition(second, [liveFrozen]);
    expect(withoutAdded.map((row) => row.key)).toEqual([frozen.key]);
  });
});

describe("ontology vNext regeneration receipt", () => {
  const artifacts: OntologyRegenerationArtifact[] = [
    { path: "site/index.html", bytes: 5, sha256: "a".repeat(64) },
    { path: "wiki/clusters/example.jsonl", bytes: 7, sha256: "b".repeat(64) },
  ];

  test("is ordering-independent and byte-sensitive", () => {
    expect(ontologyRegenerationDigest(artifacts)).toBe(ontologyRegenerationDigest([...artifacts].reverse()));
    expect(ontologyRegenerationDigest(artifacts)).not.toBe(
      ontologyRegenerationDigest([{ ...artifacts[0]!, bytes: 6 }, artifacts[1]!]),
    );
    expect(ontologyRegenerationArtifactsEqual(artifacts, [...artifacts].reverse())).toBe(true);
    expect(ontologyRegenerationArtifactsEqual(artifacts, [{ ...artifacts[0]!, bytes: 6 }, artifacts[1]!])).toBe(false);
    expect(ontologyRegenerationArtifactsEqual(artifacts, [
      ...artifacts,
      { path: "site/stale-extra.html", bytes: 0, sha256: "c".repeat(64) },
    ])).toBe(false);
    expect(ontologyRegenerationArtifactsEqual(
      [artifacts[0]!, artifacts[0]!],
      [artifacts[0]!, artifacts[0]!],
    )).toBe(false);
    expect(() => ontologyRegenerationDigest([artifacts[0]!, artifacts[0]!])).toThrow("duplicate logical paths");
  });

  test("preserves the canonical whole-array digest without constructing the whole-array string", () => {
    const canonical = `[${artifacts
      .map((entry) => `{"bytes":${entry.bytes},"path":${JSON.stringify(entry.path)},"sha256":${JSON.stringify(entry.sha256)}}`)
      .join(",")}]`;
    const legacyDigest = createHash("sha256").update(canonical).digest("hex");
    expect(ontologyRegenerationDigest(artifacts)).toBe(legacyDigest);
  });

  test("makes byte-identical closure evidence part of pass equality", () => {
    const closureEvidence = {
      path: "wiki/ontology-audits/snapshot/closure-evidence.json",
      bytes: 10,
      sha256: "c".repeat(64),
    };
    const run = {
      artifacts,
      digest: ontologyRegenerationDigest(artifacts),
      closure_evidence: closureEvidence,
    };
    expect(ontologyRegenerationRunsEqual(run, {
      artifacts: [...artifacts].reverse(),
      digest: run.digest,
      closure_evidence: { ...closureEvidence },
    })).toBe(true);
    expect(ontologyRegenerationRunsEqual(run, {
      ...run,
      closure_evidence: { ...closureEvidence, sha256: "d".repeat(64) },
    })).toBe(false);
  });

  test("binds closure evidence to the exact regenerated site descriptor set", () => {
    const siteArtifacts = [{ path: "index.html", bytes: 5, sha256: "a".repeat(64) }];
    expect(ontologyRegenerationBindsClosureEvidenceSite(artifacts, siteArtifacts)).toBe(true);
    expect(ontologyRegenerationBindsClosureEvidenceSite(artifacts, [
      ...siteArtifacts,
      { path: "stale.html", bytes: 1, sha256: "c".repeat(64) },
    ])).toBe(false);
    expect(ontologyRegenerationBindsClosureEvidenceSite(artifacts, [
      { ...siteArtifacts[0]!, sha256: "d".repeat(64) },
    ])).toBe(false);
  });

  test("hashes artifacts correctly across fixed-size streaming chunk boundaries", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-regeneration-artifact-"));
    try {
      const path = join(root, "large-artifact.bin");
      const content = Buffer.alloc(ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES * 3 + 17);
      for (let index = 0; index < content.length; index += 1) content[index] = index % 251;
      writeFileSync(path, content);

      expect(ontologyRegenerationArtifact(path, "site/large-artifact.bin")).toEqual({
        path: "site/large-artifact.bin",
        bytes: content.length,
        sha256: createHash("sha256").update(content).digest("hex"),
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects symlink artifacts instead of following them", () => {
    const root = mkdtempSync(join(tmpdir(), "ontology-regeneration-symlink-"));
    try {
      const target = join(root, "target.bin");
      const link = join(root, "artifact.bin");
      writeFileSync(target, "target", "utf8");
      symlinkSync(target, link);
      expect(() => ontologyRegenerationArtifact(link, "site/artifact.bin")).toThrow(
        "Ontology regeneration artifacts must be regular files",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("keeps high-water generators and validators in separate process phases", () => {
    expect(ONTOLOGY_REGENERATION_PHASES).toEqual([
      "projections",
      "write-audio",
      "site",
      "write-closure-evidence",
      "validate-semantic-preacceptance",
      "write-completeness",
      "validate-clusters",
      "validate-dossiers",
      "validate-audio",
      "validate-completeness",
    ]);
    expect(new Set(ONTOLOGY_REGENERATION_PHASES).size).toBe(ONTOLOGY_REGENERATION_PHASES.length);
  });
});

describe("ontology regeneration exact generated trees", () => {
  function createProjectionRoots(root: string) {
    for (const path of [
      "derived/plato/joins",
      "derived/plato/voices",
      "wiki/clusters",
      "wiki/dossiers",
    ]) mkdirSync(join(root, path), { recursive: true });
  }

  test("removes every stale generated entry while preserving only canonical voice configuration", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-clean-")));
    try {
      createProjectionRoots(root);
      mkdirSync(join(root, "derived/plato/joins/nested"), { recursive: true });
      writeFileSync(join(root, "derived/plato/joins/nested/old.toon"), "old", "utf8");
      writeFileSync(join(root, "derived/plato/joins/stale.txt"), "stale", "utf8");
      writeFileSync(join(root, "derived/plato/voices/cutovers.toml"), "cutovers = true\n", "utf8");
      writeFileSync(join(root, "derived/plato/voices/sigla.toml"), "sigla = true\n", "utf8");
      writeFileSync(join(root, "derived/plato/voices/stale.md"), "stale", "utf8");
      writeFileSync(join(root, "wiki/clusters/old.jsonl"), "{}\n", "utf8");
      writeFileSync(join(root, "wiki/clusters/stale.txt"), "stale", "utf8");
      writeFileSync(join(root, "wiki/dossiers/old.json"), "{}\n", "utf8");
      writeFileSync(join(root, "wiki/dossiers/stale.md"), "stale", "utf8");

      cleanOntologyGeneratedProjectionRoots(root);

      expect(readdirSync(join(root, "derived/plato/joins"))).toEqual([]);
      expect(readdirSync(join(root, "wiki/clusters"))).toEqual([]);
      expect(readdirSync(join(root, "wiki/dossiers"))).toEqual([]);
      expect(readdirSync(join(root, "derived/plato/voices")).sort()).toEqual([
        "cutovers.toml",
        "sigla.toml",
      ]);
      expect(readFileSync(join(root, "derived/plato/voices/cutovers.toml"), "utf8")).toBe("cutovers = true\n");
      expect(readFileSync(join(root, "derived/plato/voices/sigla.toml"), "utf8")).toBe("sigla = true\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects a symlink anywhere before cleaning any projection root", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-tree-symlink-")));
    try {
      createProjectionRoots(root);
      const untouched = join(root, "derived/plato/joins/must-remain.toon");
      const target = join(root, "outside.txt");
      writeFileSync(untouched, "keep", "utf8");
      writeFileSync(target, "outside", "utf8");
      symlinkSync(target, join(root, "derived/plato/voices/forbidden.toon"));

      expect(() => cleanOntologyGeneratedProjectionRoots(root)).toThrow(
        "Generated trees may contain only regular files and directories",
      );
      expect(readFileSync(untouched, "utf8")).toBe("keep");
      expect(readFileSync(target, "utf8")).toBe("outside");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects a dangling symlink used as a generated projection root", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-root-symlink-")));
    try {
      mkdirSync(join(root, "derived/plato"), { recursive: true });
      symlinkSync(join(root, "missing-joins"), join(root, "derived/plato/joins"));
      expect(() => cleanOntologyGeneratedProjectionRoots(root)).toThrow(
        "Expected a regular generated directory tree",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects a symlinked generated-root parent before deleting outside or in-repo files", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-parent-symlink-")));
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-outside-")));
    try {
      mkdirSync(join(outside, "plato/joins"), { recursive: true });
      mkdirSync(join(outside, "plato/voices"), { recursive: true });
      const outsideSentinel = join(outside, "plato/joins/must-remain.toon");
      writeFileSync(outsideSentinel, "outside must remain\n", "utf8");
      mkdirSync(join(root, "wiki/clusters"), { recursive: true });
      mkdirSync(join(root, "wiki/dossiers"), { recursive: true });
      const inRepoSentinel = join(root, "wiki/clusters/must-remain.jsonl");
      writeFileSync(inRepoSentinel, "{}\n", "utf8");
      symlinkSync(outside, join(root, "derived"), "dir");

      expect(() => cleanOntologyGeneratedProjectionRoots(root)).toThrow(
        "Expected a regular generated directory tree",
      );
      expect(readFileSync(outsideSentinel, "utf8")).toBe("outside must remain\n");
      expect(readFileSync(inRepoSentinel, "utf8")).toBe("{}\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("rejects a symlinked fixed-output parent before deleting or writing any artifact", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-fixed-parent-")));
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-fixed-outside-")));
    try {
      createProjectionRoots(root);
      const projectionSentinel = join(root, "derived/plato/joins/must-remain.toon");
      writeFileSync(projectionSentinel, "projection must remain\n", "utf8");
      const outsideCoverage = join(outside, "coverage.md");
      writeFileSync(outsideCoverage, "outside must remain\n", "utf8");
      symlinkSync(outside, join(root, "audio"), "dir");

      expect(() => cleanOntologyGeneratedProjectionRoots(root)).toThrow(
        "Expected a regular generated directory tree",
      );
      expect(readFileSync(outsideCoverage, "utf8")).toBe("outside must remain\n");
      expect(readFileSync(projectionSentinel, "utf8")).toBe("projection must remain\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("rejects an existing symlink fixed-output target before deleting any projection", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-fixed-target-")));
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-fixed-target-outside-")));
    try {
      createProjectionRoots(root);
      mkdirSync(join(root, "audio"), { recursive: true });
      const projectionSentinel = join(root, "derived/plato/joins/must-remain.toon");
      writeFileSync(projectionSentinel, "projection must remain\n", "utf8");
      const outsideCompleteness = join(outside, "completeness.md");
      writeFileSync(outsideCompleteness, "outside must remain\n", "utf8");
      symlinkSync(outsideCompleteness, join(root, "wiki/completeness.md"));

      expect(() => cleanOntologyGeneratedProjectionRoots(root)).toThrow(
        "fixed output must be a regular non-symlink file",
      );
      expect(readFileSync(outsideCompleteness, "utf8")).toBe("outside must remain\n");
      expect(readFileSync(projectionSentinel, "utf8")).toBe("projection must remain\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("rejects a fixed-output parent alias while collecting accepted regeneration bytes", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-fixed-read-")));
    const outside = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-fixed-read-outside-")));
    try {
      createProjectionRoots(root);
      writeFileSync(join(root, "wiki/completeness.md"), "complete\n", "utf8");
      const outsideCoverage = join(outside, "coverage.md");
      writeFileSync(outsideCoverage, "outside must remain\n", "utf8");
      symlinkSync(outside, join(root, "audio"), "dir");

      expect(() => collectOntologyCanonicalRegenerationArtifacts(root)).toThrow(
        "Expected a regular generated directory tree",
      );
      expect(readFileSync(outsideCoverage, "utf8")).toBe("outside must remain\n");
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test("rejects unexpected regular files from the exact post-generation tree", () => {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "ontology-regeneration-exact-tree-")));
    const site = join(root, "site");
    try {
      createProjectionRoots(root);
      mkdirSync(site, { recursive: true });
      mkdirSync(join(root, "audio"), { recursive: true });
      writeFileSync(join(root, "audio/coverage.md"), "coverage\n", "utf8");
      writeFileSync(join(root, "wiki/completeness.md"), "completeness\n", "utf8");
      writeFileSync(join(root, "wiki/clusters/stale-extra.txt"), "stale", "utf8");
      writeFileSync(join(site, "index.html"), "site", "utf8");

      expect(() => collectOntologyRegenerationArtifacts(root, site)).toThrow(
        "Unexpected file in generated ontology projection wiki/clusters: stale-extra.txt",
      );
      expect(existsSync(join(root, "wiki/clusters/stale-extra.txt"))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("ontology reader leak evidence", () => {
  test("finds legacy identities embedded in canonical string values", () => {
    expect(forbiddenOntologyAliasPaths({
      assignment_basis: "Inherited dramatic_case_setup::scene_setting from feature_candidate_123.",
    })).toEqual([
      "assignment_basis:value=dramatic_case_setup::scene_setting",
      "assignment_basis:value=feature_candidate_123",
    ]);
  });

  test("includes derived join tables when detecting rejected records", () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "ontology-reader-projections-")));
    try {
      const observationJoin = join(root, "derived/plato/joins/fixture.toon");
      const voiceJoin = join(root, "derived/plato/joins/voices/fixture.toon");
      const voiceIndex = join(root, "derived/plato/voices/fixture.toon");
      mkdirSync(join(root, "derived/plato/joins/voices"), { recursive: true });
      mkdirSync(join(root, "derived/plato/voices"), { recursive: true });
      writeFileSync(observationJoin, "obs_fixture_0001\nobs_fixture_0002\n", "utf8");
      writeFileSync(voiceJoin, "claim_fixture_0002\n", "utf8");
      writeFileSync(voiceIndex, "voice_fixture_0001\n", "utf8");

      const paths = ontologyReaderProjectionPaths(root);
      expect(paths.map((path) => relative(root, path))).toEqual([
        "derived/plato/joins/fixture.toon",
        "derived/plato/joins/voices/fixture.toon",
        "derived/plato/voices/fixture.toon",
      ]);
      expect(rejectedRecordIdsInReaderFiles(
        paths,
        new Set(["obs_fixture_0002", "claim_fixture_0002"]),
      )).toEqual(["claim_fixture_0002", "obs_fixture_0002"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

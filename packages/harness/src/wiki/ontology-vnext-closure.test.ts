import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import {
  finalMembershipReplacementKeys,
  mergeOntologyAuditPartition,
} from "./ontology-audit-finalization.js";
import type { OntologyAuditRecordUnit } from "./ontology-audit.js";
import {
  forbiddenOntologyAliasPaths,
  ontologyReaderProjectionPaths,
  ontologyRegenerationDigest,
  rejectedRecordIdsInReaderFiles,
  type OntologyRegenerationArtifact,
} from "./ontology-vnext-closure.js";

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
      { path: "wiki/observations/frozen.md", ordinal: 0, canonical_sha256: HASH_A },
    );
    const liveFrozen = record(
      frozen.key,
      null,
      { path: "wiki/observations/frozen.md", ordinal: 0, canonical_sha256: HASH_B },
    );
    const liveAdded = record(
      "record:observation:added",
      null,
      { path: "wiki/observations/added.md", ordinal: 1, canonical_sha256: HASH_B },
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
    const root = mkdtempSync(join(tmpdir(), "ontology-reader-projections-"));
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

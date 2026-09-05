import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeAcceptedAudioProductionFixture } from "../test-support/audio-production-fixture.js";
import { writeMasteringEvidenceFixture } from "../test-support/mastering-evidence-fixture.js";
import { buildClusters, formatClusterAxisJsonl } from "./clusters.js";
import { buildCoverageReport } from "./coverage.js";
import { writeDossierArtifacts } from "./dossiers.js";
import { setRepoRootForTesting } from "./paths.js";
import {
  buildClaimShards,
  buildRelationShards,
  buildTurnShards,
  parseToonTable,
  readSiteData,
  type DialogueDerived,
  type SiteClaim,
  type SiteRelation,
} from "./site/data.js";
import { buildConceptDirectoryShards, buildStaticSite, parseObservationLedger } from "./site/index.js";
import { contrastRatio, filterStatusText, idJumpStatusText, siteCss, siteJs, titleCase } from "./site/layout.js";
import {
  parseExactIdManifest,
  parseExactIdShard,
  parseSearchManifest,
  parseSearchShard,
} from "./site/search.js";
import { validateGeneratedSite } from "./site/validate.js";
import { resolveSourceSpan } from "./source.js";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  renderOntologyVNextDocuments,
  type OntologyVNextMembership,
} from "./wiki/ontology-vnext.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function listFiles(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(dir, entry.name);
      return entry.isDirectory() ? listFiles(absolutePath, relativePath) : [relativePath];
    })
    .sort();
}

function readExactTargets(outDir: string) {
  const manifest = parseExactIdManifest(
    readFileSync(join(outDir, "assets/index/manifest.json"), "utf8"),
    "assets/index/manifest.json",
  );
  return new Map(
    manifest.shards.flatMap((descriptor) => {
      const shard = parseExactIdShard(readFileSync(join(outDir, descriptor.path), "utf8"), descriptor.path);
      expect(shard).toMatchObject({ kind: descriptor.kind, scope: descriptor.scope });
      expect(shard.records).toHaveLength(descriptor.count);
      return shard.records.map((record) => [record.id, record.target] as const);
    }),
  );
}

function mp3Fixture(frameCount = 40) {
  const frameBytes = Math.floor((144 * 96_000) / 48_000);
  const frame = Buffer.alloc(frameBytes);
  frame.set([0xff, 0xfb, 0x74, 0xc0]);
  return {
    bytes: Buffer.concat(Array.from({ length: frameCount }, () => frame)),
    durationSeconds: (frameCount * 1152) / 48_000,
  };
}

const DEFAULT_MP3_FIXTURE = mp3Fixture();

const TEST_AXIS_KEY = "elenchus";
const TEST_CONCEPT_KEY = "bounded_test";
const TEST_AXIS_ID = deriveOntologyVNextAxisId("textual_function", TEST_AXIS_KEY);
const TEST_CONCEPT_ID = deriveOntologyVNextConceptId(TEST_AXIS_ID, TEST_CONCEPT_KEY);

function ledgerRecord({
  observationId,
  span,
  text = "A bounded observation is recorded.",
}: {
  observationId: string;
  span: string;
  text?: string;
}) {
  const dialogue = /^obs_([a-z0-9-]+)_/u.exec(observationId)?.[1] ?? "testdialogue";
  return `\`\`\`yaml
observation_id: ${observationId}
source_work: ${dialogue}
stephanus_span: ${span}
source_ref:
  source_path: raw/plato/greek/${dialogue}.txt
  stephanus_span: ${span}
  start_marker: ${span}
  end_marker: ${span}
  start_char: 0
  end_char: 32
  text_sha256: abcdef1234567890
greek_terms: ["λόγος"]
english_gloss: Test gloss.
observation: ${text}
textual_basis: The cited span contains local support.
limits: The record does not add synthesis.
review_status: accepted
\`\`\``;
}

function writeOntologyFixture(
  extraMemberships: readonly OntologyVNextMembership[] = [],
  observationIds: readonly string[] = ["obs_crito_0001", "obs_meno_0001"],
) {
  const documents = renderOntologyVNextDocuments({
    axes: [{
      schema_version: 1,
      axis_id: TEST_AXIS_ID,
      axis_key: TEST_AXIS_KEY,
      dimension: "textual_function",
      comparison_question: "How does question-and-answer testing proceed in this span?",
    }],
    concepts: [{
      schema_version: 1,
      concept_id: TEST_CONCEPT_ID,
      axis_id: TEST_AXIS_ID,
      concept_key: TEST_CONCEPT_KEY,
      definition: "A bounded question-and-answer test recorded in the cited span.",
      comparison_question: "How does question-and-answer testing proceed in this span?",
    }],
    memberships: observationIds.map((observationId) => ({
      schema_version: 1 as const,
      membership_id: deriveOntologyVNextMembershipId(observationId, TEST_CONCEPT_ID),
      observation_id: observationId,
      concept_id: TEST_CONCEPT_ID,
      assignment_basis: "The accepted observation records the comparison concept directly.",
    })).concat(extraMemberships),
  });
  mkdirSync(join(root, "wiki/ontology"), { recursive: true });
  writeFileSync(join(root, "wiki/ontology/axes.jsonl"), documents.axes, "utf8");
  writeFileSync(join(root, "wiki/ontology/concepts.jsonl"), documents.concepts, "utf8");
  writeFileSync(join(root, "wiki/ontology/memberships.jsonl"), documents.memberships, "utf8");
}

function syncProjectionFixtures() {
  const byAxis = new Map<string, ReturnType<typeof buildClusters>>();
  for (const cluster of buildClusters()) {
    const clusters = byAxis.get(cluster.axisId) ?? [];
    clusters.push(cluster);
    byAxis.set(cluster.axisId, clusters);
  }
  rmSync(join(root, "wiki/clusters"), { recursive: true, force: true });
  mkdirSync(join(root, "wiki/clusters"), { recursive: true });
  for (const clusters of byAxis.values()) {
    writeFileSync(
      join(root, `wiki/clusters/${clusters[0]!.axisKey}.jsonl`),
      formatClusterAxisJsonl(clusters),
      "utf8",
    );
  }
  writeDossierArtifacts();
}

function writeMenoDerivedFixtures(root: string) {
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  mkdirSync(join(root, "derived/plato/metrics/turn-lengths"), { recursive: true });
  mkdirSync(join(root, "derived/plato/anchors"), { recursive: true });
  mkdirSync(join(root, "derived/plato/metrics/procedure"), { recursive: true });
  mkdirSync(join(root, "derived/plato/metrics/assent"), { recursive: true });

  writeFileSync(
    join(root, "derived/plato/turns/meno.toon"),
    `dialogue: meno
turns[2]:
  turn_id        | speaker | start_marker | end_marker | start_char | end_char | text_sha256                                                      | greek_char_count
  turn_meno_0001 | ΜΕΝ.    | 70a          | 70a        | 0          | 20       | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | 18
  turn_meno_0002 | ΣΩ.     | 70a          | 70b        | 20         | 48       | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | 24
`,
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/turns/apology.toon"),
    `dialogue: apology
turns[1]:
  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256                                                      | greek_char_count
  turn_apology_0001 | (none)  | 17a          | 17b        | 0          | 24       | cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc | 20
`,
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/metrics/turn-lengths/meno.toon"),
    `dialogue: meno
speakers[2]:
  speaker | turns | total_tokens | median_tokens | p90_tokens | max_tokens | long_turns
  ΜΕΝ.    | 1     | 11           | 11            | 11         | 11         | 0
  ΣΩ.     | 1     | 17           | 17            | 17         | 17         | 1
turns[2]:
  turn_id        | speaker | start_marker | end_marker | start_char | end_char | greek_char_count | token_count | dialogue_long_turn | speaker_long_turn
  turn_meno_0001 | ΜΕΝ.    | 70a          | 70a        | 0          | 20       | 18               | 11          | no                 | no
  turn_meno_0002 | ΣΩ.     | 70a          | 70b        | 20         | 48       | 24               | 17          | yes                | yes
`,
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/metrics/turn-lengths/apology.toon"),
    `dialogue: apology
speakers[1]:
  speaker | turns | total_tokens | median_tokens | p90_tokens | max_tokens | long_turns
  (none)  | 1     | 8            | 8             | 8          | 8          | 0
turns[1]:
  turn_id           | speaker | start_marker | end_marker | start_char | end_char | greek_char_count | token_count | dialogue_long_turn | speaker_long_turn
  turn_apology_0001 | (none)  | 17a          | 17b        | 0          | 24       | 20               | 8           | no                 | no
`,
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/anchors/meno.toon"),
    `dialogue: meno
anchors[2]:
  group             | form  | start_char | end_char | marker | turn_id        | token_ids
  definition_prompt | εἶδος | 4          | 9        | 70a    | turn_meno_0001 | tok_meno_000001
  assent_concession | ναί   | 30         | 33       | 70b    | turn_meno_0002 | tok_meno_000002
`,
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/metrics/procedure/meno.toon"),
    `dialogue: meno
candidates[2]:
  candidate_id   | group           | form         | turn_id        | start_marker | end_marker | start_char | end_char | token_ids
  proc_meno_0001 | answer_demand   | ἀποκρίνεσθαι | turn_meno_0001 | 70a          | 70a        | 4          | 16       | tok_meno_000001
  proc_meno_0002 | question_method | ἐρωτᾶν       | turn_meno_0002 | 70b          | 70b        | 30         | 36       | tok_meno_000002
`,
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/metrics/assent/meno.toon"),
    `dialogue: meno
speakers[2]:
  speaker | assent_tokens | qualified_tokens | total_tokens | assent_rate
  ΜΕΝ.    | 1             | 0                | 11           | 0.0909
  ΣΩ.     | 0             | 0                | 17           | 0
turns[2]:
  turn_id        | speaker | token_count | assent_tokens | qualified_tokens | assent_token_ids | qualified_token_ids
  turn_meno_0001 | ΜΕΝ.    | 11          | 1             | 0                | tok_meno_000001 |
  turn_meno_0002 | ΣΩ.     | 17          | 0             | 0                |                 |
stretches[2]:
  stretch_id       | speaker | start_turn_id | end_turn_id   | turn_count | assent_token_ids
  assent_meno_0001 | ΜΕΝ.    | turn_meno_0001 | turn_meno_0001 | 1          | tok_meno_000001
  assent_meno_0002 | ΣΩ.     | turn_meno_0002 | turn_meno_0002 | 1          | tok_meno_000002
`,
    "utf8",
  );
}

function writeMenoJoin(
  root: string,
  rows: Array<{ observationId: string; turnIds: string[]; speakers?: string[] }>,
) {
  mkdirSync(join(root, "derived/plato/joins"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/joins/meno.toon"),
    [
      "dialogue: meno",
      "ledger_path: wiki/observations/meno.md",
      `ledger_sha256: ${"a".repeat(64)}`,
      "turn_index_path: derived/plato/turns/meno.toon",
      `turn_index_sha256: ${"b".repeat(64)}`,
      `joins[${rows.length}]:`,
      "  observation_id | review_status | turn_ids | speakers | attributed",
      ...rows.map(
        (row) =>
          `  ${row.observationId} | accepted | ${row.turnIds.join(",")} | ${(row.speakers ?? ["ΜΕΝ."]).join(",")} | true`,
      ),
      "",
    ].join("\n"),
    "utf8",
  );
}

function writeCritoJoin(root: string) {
  mkdirSync(join(root, "derived/plato/joins"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/joins/crito.toon"),
    [
      "dialogue: crito",
      "ledger_path: wiki/observations/crito.md",
      `ledger_sha256: ${"c".repeat(64)}`,
      "turn_index_path: derived/plato/turns/crito.toon",
      `turn_index_sha256: ${"d".repeat(64)}`,
      "joins[1]:",
      "  observation_id | review_status | turn_ids | speakers | attributed",
      "  obs_crito_0001 | accepted | turn_crito_0001 | ΚΡ. | true",
      "",
    ].join("\n"),
    "utf8",
  );
}

function writeMenoTurnTables(root: string, count: number) {
  const canonicalRows = Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(4, "0");
    const speaker = index % 2 === 0 ? "ΜΕΝ." : "ΣΩ.";
    return `  turn_meno_${number} | ${speaker} | 70a | 70b | ${index * 10} | ${(index + 1) * 10} | ${"a".repeat(64)} | 10`;
  });
  writeFileSync(
    join(root, "derived/plato/turns/meno.toon"),
    [
      "dialogue: meno",
      `turns[${count}]:`,
      "  turn_id | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
      ...canonicalRows,
      "",
    ].join("\n"),
    "utf8",
  );

  const metricRows = Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(4, "0");
    const speaker = index % 2 === 0 ? "ΜΕΝ." : "ΣΩ.";
    return `  turn_meno_${number} | ${speaker} | 70a | 70b | ${index * 10} | ${(index + 1) * 10} | 10 | ${index + 1} | ${index === count - 1 ? "yes" : "no"} | no`;
  });
  writeFileSync(
    join(root, "derived/plato/metrics/turn-lengths/meno.toon"),
    [
      "dialogue: meno",
      "speakers[2]:",
      "  speaker | turns | total_tokens | median_tokens | p90_tokens | max_tokens | long_turns",
      `  ΜΕΝ. | ${Math.ceil(count / 2)} | 0 | 0 | 0 | 0 | 0`,
      `  ΣΩ. | ${Math.floor(count / 2)} | 0 | 0 | 0 | 0 | 0`,
      `turns[${count}]:`,
      "  turn_id | speaker | start_marker | end_marker | start_char | end_char | greek_char_count | token_count | dialogue_long_turn | speaker_long_turn",
      ...metricRows,
      "",
    ].join("\n"),
    "utf8",
  );
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "site-test-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/meno.txt"), "{70a} Μένων λέγει. {70b} Σωκράτης ἀποκρίνεται.", "utf8");
  writeFileSync(join(root, "raw/plato/greek/crito.txt"), "{44a} Κρίτων λέγει. {44b} Σωκράτης ἀποκρίνεται.", "utf8");
  writeFileSync(join(root, "raw/plato/greek/apology.txt"), "{17a} Σωκράτης λέγει. {17b} Καὶ τάδε.", "utf8");
  writeFileSync(
    join(root, "wiki/observations/meno.md"),
    `# Meno Observations\n\n${ledgerRecord({
      observationId: "obs_meno_0001",
      span: "70a",
      text: "Meno asks a <bounded> question.",
    })}\n`,
    "utf8",
  );
  writeFileSync(
    join(root, "wiki/observations/crito.md"),
    `# Crito Observations\n\n${ledgerRecord({
      observationId: "obs_crito_0001",
      span: "44a",
    })}\n`,
    "utf8",
  );
  writeMenoDerivedFixtures(root);
  writeFileSync(
    join(root, "derived/plato/turns/crito.toon"),
    `dialogue: crito
turns[1]:
  turn_id        | speaker | start_marker | end_marker | start_char | end_char | text_sha256                                                      | greek_char_count
  turn_crito_0001 | ΚΡ.    | 44a          | 44b        | 0          | 48       | ${"d".repeat(64)} | 24
`,
    "utf8",
  );
  writeOntologyFixture();
  writeMenoJoin(root, [{ observationId: "obs_meno_0001", turnIds: ["turn_meno_0001", "turn_meno_0002"], speakers: ["ΜΕΝ.", "ΣΩ."] }]);
  writeCritoJoin(root);
  syncProjectionFixtures();
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

function commentaryRefLines(dialogue: string, span: string) {
  const ref = resolveSourceSpan(dialogue, span).source_ref;
  return [
    "source_ref:",
    `  source_path: ${ref.source_path}`,
    `  stephanus_span: ${ref.stephanus_span}`,
    `  start_marker: ${ref.start_marker}`,
    `  end_marker: ${ref.end_marker}`,
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `  text_sha256: "${ref.text_sha256}"`,
  ].join("\n");
}

function commentaryBlock({
  id,
  kind,
  span,
  placement = "before",
  title,
  body = "Teaching prose with <angles> to escape.",
  review = "unreviewed",
  cites = "cites:\n  observations: []\n  claims: []\n  relations: []\n  dossiers: []",
}: {
  id: string;
  kind: string;
  span: string;
  placement?: string;
  title?: string;
  body?: string;
  review?: string;
  cites?: string;
}) {
  return [
    "```yaml",
    `commentary_id: ${id}`,
    "source_work: Meno",
    `block_kind: ${kind}`,
    `placement: ${placement}`,
    ...(title ? [`title: "${title}"`] : []),
    `stephanus_span: ${span}`,
    commentaryRefLines("meno", span),
    `body: "${body}"`,
    cites,
    "crossrefs: []",
    "author: model",
    `review_status: ${review}`,
    "```",
  ].join("\n");
}

function writeMenoCommentary(root: string) {
  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  mkdirSync(join(root, "raw/plato/english"), { recursive: true });
  // English lacks {70b}: its text joins into the {70a} slice.
  writeFileSync(join(root, "raw/plato/english/meno.txt"), "{70a} Meno speaks. Socrates replies.", "utf8");
  writeFileSync(
    join(root, "wiki/commentary/meno.md"),
    `# Meno commentary\n\n${commentaryBlock({
      id: "comm_meno_0001",
      kind: "section",
      span: "70a-70b",
      title: "The opening question",
      body: "The unit in one sentence.",
    })}\n\n${commentaryBlock({
      id: "comm_meno_0002",
      kind: "context",
      span: "70a",
      placement: "before",
      cites: `cites:\n  observations: [obs_meno_0001]\n  claims: []\n  relations: []\n  dossiers: [${TEST_CONCEPT_ID}]`,
    })}\n\n${commentaryBlock({
      id: "comm_meno_0003",
      kind: "question",
      span: "70b",
      placement: "after",
      body: "What does Meno assume?",
      cites: "cites:\n  observations: [obs_meno_0001]\n  claims: []\n  relations: []\n  dossiers: []",
    })}\n\n${commentaryBlock({
      id: "comm_meno_0004",
      kind: "notice",
      span: "70a",
      review: "rejected",
      body: "A rejected block that must not render.",
    })}\n`,
    "utf8",
  );
}

function writeMenoRejectedSectionCommentary(root: string) {
  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  mkdirSync(join(root, "raw/plato/english"), { recursive: true });
  writeFileSync(join(root, "raw/plato/english/meno.txt"), "{70a} Meno speaks. {70b} Socrates replies.", "utf8");
  writeFileSync(
    join(root, "wiki/commentary/meno.md"),
    `# Meno commentary\n\n${commentaryBlock({
      id: "comm_meno_0001",
      kind: "section",
      span: "70a",
      title: "Rejected opening",
      review: "rejected",
    })}\n\n${commentaryBlock({
      id: "comm_meno_0002",
      kind: "section",
      span: "70b",
      title: "Visible reply",
      review: "accepted",
    })}\n\n${commentaryBlock({
      id: "comm_meno_0005",
      kind: "context",
      span: "70a",
      placement: "before",
      review: "accepted",
      body: "A visible note whose section was rejected.",
    })}\n\n${commentaryBlock({
      id: "comm_meno_0006",
      kind: "argument",
      span: "70a",
      placement: "after",
      review: "accepted",
      body: "A second visible note whose section was rejected.",
      cites: "cites:\n  observations: [obs_meno_0001]\n  claims: []\n  relations: []\n  dossiers: []",
    })}\n`,
    "utf8",
  );
}

function acceptMenoCommentary(root: string) {
  writeMenoCommentary(root);
  const path = join(root, "wiki/commentary/meno.md");
  writeFileSync(
    path,
    readFileSync(path, "utf8").replaceAll("review_status: unreviewed", "review_status: accepted"),
    "utf8",
  );
}

function writeMenoRecording({
  status = "accepted",
  artifactBytes = DEFAULT_MP3_FIXTURE.bytes,
  manifestSha256,
  durationSeconds = DEFAULT_MP3_FIXTURE.durationSeconds,
}: {
  status?: "accepted" | "draft" | "withdrawn";
  artifactBytes?: Buffer;
  manifestSha256?: string;
  durationSeconds?: number;
} = {}) {
  let repoProduction:
    | { screenplaySha256: string; qaSha256: string; qaMasterSha256: string }
    | undefined;
  if (status === "accepted") {
    const commentaryPath = join(root, "wiki/commentary/meno.md");
    writeFileSync(
      commentaryPath,
      readFileSync(commentaryPath, "utf8")
        .replaceAll("review_status: rejected", "review_status: accepted")
        .replace(new RegExp(`dossiers: \\[${TEST_CONCEPT_ID}\\]`, "u"), "dossiers: []"),
      "utf8",
    );
    // Production evidence requires every audited commentary span to resolve in
    // the exact English spine. The separate reading-view fixture intentionally
    // exercises a missing-marker join, but an accepted recording cannot.
    writeFileSync(
      join(root, "raw/plato/english/meno.txt"),
      "{70a} Meno speaks. {70b} Socrates replies.",
      "utf8",
    );
    repoProduction = writeAcceptedAudioProductionFixture({
      root,
      dialogue: "meno",
      marker: "70a",
      sourceText: "Meno speaks. Socrates replies.",
      durationSeconds,
    });
  }
  const artifactRoot = join(root, "recording-artifact-store");
  const evidence = repoProduction
    ? writeMasteringEvidenceFixture({
        repoRoot: root,
        artifactRoot,
        dialogue: "meno",
        publicationBytes: artifactBytes,
        publicationDurationSeconds: durationSeconds,
      })
    : undefined;
  const sha256 = manifestSha256 ?? createHash("sha256").update(artifactBytes).digest("hex");
  const production = evidence ? { ...evidence.production, publication_sha256: sha256 } : undefined;
  if (status === "draft") {
    const draftPath = join(artifactRoot, "artifacts/draft/publication.mp3");
    mkdirSync(join(draftPath, ".."), { recursive: true });
    writeFileSync(draftPath, artifactBytes);
  }
  mkdirSync(join(root, "wiki/recordings"), { recursive: true });
  writeFileSync(
    join(root, "wiki/recordings/meno.json"),
    JSON.stringify(
      {
        schema_version: 2,
        recording_id: "recording_meno_fixture_v1",
        dialogue: "meno",
        status,
        ...(production
          ? {
              production,
            }
          : {}),
        audio: {
          path: production?.publication_path ?? "artifacts/draft/publication.mp3",
          mime_type: "audio/mpeg",
          duration_seconds: durationSeconds,
          sha256,
        },
        chapters: evidence?.chapters.map((chapter) => ({ ...chapter, title: "The opening question" })) ?? [
          { chapter_id: "chapter-1", commentary_id: "comm_meno_0001", start_frame: 0, title: "The opening question" },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );
  return { artifactRoot, artifactBytes, sha256 };
}

describe("relation shards", () => {
  function relation(relationId: string, reviewStatus = "accepted"): SiteRelation {
    return {
      relationId,
      dialogue: /^rel_([a-z0-9-]+)_\d+$/u.exec(relationId)?.[1] ?? "unknown",
      claimA: "claim_meno_0001",
      claimB: "claim_crito_0001",
      relationKind: "restatement",
      resolution: "standing",
      basis: "Shared basis.",
      limits: "Limits.",
      reviewStatus,
    };
  }

  it("shards large relation sets and maps every id to its page", () => {
    const relations = [
      relation("rel_cross-dialogue_0001"),
      relation("rel_cross-dialogue_0002"),
      relation("rel_cross-dialogue_0003"),
      relation("rel_meno_0001"),
      relation("rel_meno_0002", "rejected"),
    ];

    const { shards, pageById } = buildRelationShards(relations, 2);
    expect(shards.map((shard) => shard.path)).toEqual([
      "dialogues/cross-dialogue/relations.html",
      "dialogues/cross-dialogue/relations-2.html",
      "dialogues/meno/relations.html",
    ]);
    expect(shards[0]?.partCount).toBe(2);
    expect(pageById.get("rel_cross-dialogue_0003")).toBe(
      "dialogues/cross-dialogue/relations-2.html#rel_cross-dialogue_0003",
    );
    expect(pageById.get("rel_meno_0001")).toBe("dialogues/meno/relations.html#rel_meno_0001");
    expect(pageById.has("rel_meno_0002")).toBe(false);
    expect(shards.flatMap((shard) => shard.relations).every((entry) => entry.reviewStatus === "accepted")).toBe(true);
  });

  it("renders only accepted relations in pages, navigation, and search", () => {
    mkdirSync(join(root, "wiki/relations"), { recursive: true });
    writeFileSync(
      join(root, "wiki/relations/cross-dialogue.md"),
      [
        "# Cross-dialogue relations",
        "",
        "```yaml",
        "relation_id: rel_cross-dialogue_0001",
        "claim_a: claim_meno_0001",
        "claim_b: claim_crito_0001",
        "relation_kind: restatement",
        "resolution: standing",
        'basis: "Shared basis."',
        'limits: "Limits."',
        "review_status: accepted",
        "```",
        "",
        "```yaml",
        "relation_id: rel_cross-dialogue_0002",
        "claim_a: claim_meno_0001",
        "claim_b: claim_crito_0001",
        "relation_kind: restatement",
        "resolution: standing",
        'basis: "Rejected candidate."',
        'limits: "Limits."',
        "review_status: rejected",
        "```",
      ].join("\n"),
      "utf8",
    );

    const data = readSiteData();
    expect(data.relations.map((entry) => entry.relationId)).toEqual(["rel_cross-dialogue_0001"]);
    expect(data.relationPageById.has("rel_cross-dialogue_0002")).toBe(false);
    expect(
      [...data.relationsByClaimId.values()].flat().some((entry) => entry.relationId === "rel_cross-dialogue_0002"),
    ).toBe(false);

    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    const page = readFileSync(join(outDir, "dialogues/cross-dialogue/relations.html"), "utf8");
    expect(page).toContain('id="rel_cross-dialogue_0001"');
    expect(page).not.toContain("rel_cross-dialogue_0002");
    expect(page).toContain('href="../../index.html">Index</a>');

    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("rel_cross-dialogue_0001")).toBe(
      "dialogues/cross-dialogue/relations.html#rel_cross-dialogue_0001",
    );
    expect(exactTargets.has("rel_cross-dialogue_0002")).toBe(false);
    const publicOutput = listFiles(outDir)
      .filter((path) => path.endsWith(".html") || path.endsWith(".json"))
      .map((path) => readFileSync(join(outDir, path), "utf8"))
      .join("\n");
    expect(publicOutput).not.toContain("rel_cross-dialogue_0002");
  });

  it("does not publish rejected claims", () => {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      [
        "```yaml",
        "claim_id: claim_meno_0009",
        "source_work: Meno",
        "stephanus_span: 70a",
        commentaryRefLines("meno", "70a"),
        "speaker: ΜΕΝ.",
        "claim_kind: thesis",
        'content: "Rejected fixture content."',
        "greek_terms: []",
        "final_status: left_standing",
        'limits: "Fixture."',
        "review_status: rejected",
        "stance_events: []",
        "```",
      ].join("\n"),
      "utf8",
    );

    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const publicOutput = listFiles(outDir)
      .filter((path) => path.endsWith(".html") || path.endsWith(".json"))
      .map((path) => readFileSync(join(outDir, path), "utf8"))
      .join("\n");
    expect(publicOutput).not.toContain("claim_meno_0009");
    expect(publicOutput).not.toContain("Rejected fixture content.");
    expect(readExactTargets(outDir).has("claim_meno_0009")).toBe(false);
  });
});

describe("bounded collection shards", () => {
  function claim(claimId: string): SiteClaim {
    return {
      claimId,
      dialogue: /^claim_([a-z0-9-]+)_\d+$/u.exec(claimId)?.[1] ?? "unknown",
      sourceWork: "Test",
      stephanusSpan: "1a",
      sourceRef: {
        sourcePath: "raw/plato/greek/test.txt",
        stephanusSpan: "1a",
        startMarker: "1a",
        endMarker: "1a",
        startChar: 0,
        endChar: 1,
        textSha256: "a".repeat(64),
      },
      speaker: "TEST",
      claimKind: "thesis",
      content: "Test claim.",
      greekTerms: [],
      finalStatus: "standing",
      limits: "Fixture.",
      reviewStatus: "accepted",
      stanceEvents: [],
    };
  }

  it("shards 251 dialogue claims without changing the first public path", () => {
    const claims = Array.from({ length: 251 }, (_, index) => claim(`claim_laws_${String(index + 1).padStart(4, "0")}`)).reverse();
    const { shards, pageById } = buildClaimShards(claims);

    expect(shards).toHaveLength(2);
    expect(shards.map((shard) => [shard.path, shard.claims.length])).toEqual([
      ["dialogues/laws/claims.html", 250],
      ["dialogues/laws/claims-2.html", 1],
    ]);
    expect(pageById.get("claim_laws_0001")).toBe("dialogues/laws/claims.html#claim_laws_0001");
    expect(pageById.get("claim_laws_0251")).toBe("dialogues/laws/claims-2.html#claim_laws_0251");
  });

  it("shards the concept directory with exact set equality and stable paths", () => {
    const concepts = Array.from({ length: 501 }, (_, index) => ({
      concept_id: `concept_${String(index + 1).padStart(4, "0")}`,
    })).reverse();
    const shards = buildConceptDirectoryShards(concepts);

    expect(shards.map((shard) => [shard.path, shard.concepts.length])).toEqual([
      ["concepts/index.html", 500],
      ["concepts/index-2.html", 1],
    ]);
    const ids = shards.flatMap((shard) => shard.concepts.map((concept) => concept.concept_id));
    expect(ids).toEqual([...ids].sort());
    expect(ids).toEqual(concepts.map((concept) => concept.concept_id).sort());
    expect(new Set(ids).size).toBe(concepts.length);
  });

});

describe("turn evidence model", () => {
  function derivedTurns(count: number): ReadonlyMap<string, DialogueDerived> {
    return new Map([
      [
        "meno",
        {
          turns: Array.from({ length: count }, (_, index) => ({
            turn_id: `turn_meno_${String(index + 1).padStart(4, "0")}`,
            speaker: index % 2 === 0 ? "ΜΕΝ." : "ΣΩ.",
          })).reverse(),
          speakers: [],
          anchors: [],
          procedure: [],
          assent: [],
        },
      ],
    ]);
  }

  it("shards 250/251 turns at stable paths and maps every turn fragment", () => {
    const atBoundary = buildTurnShards(derivedTurns(250));
    expect(atBoundary.shards).toHaveLength(1);
    expect(atBoundary.shards[0]).toMatchObject({
      dialogue: "meno",
      part: 1,
      partCount: 1,
      path: "dialogues/meno/turns.html",
    });
    expect(atBoundary.shards[0]?.turns).toHaveLength(250);

    const overBoundary = buildTurnShards(derivedTurns(251));
    expect(overBoundary.shards.map((shard) => [shard.path, shard.turns.length])).toEqual([
      ["dialogues/meno/turns.html", 250],
      ["dialogues/meno/turns-2.html", 1],
    ]);
    expect(overBoundary.shards[0]?.turns[0]?.turn_id).toBe("turn_meno_0001");
    expect(overBoundary.pageById.get("turn_meno_0001")).toBe(
      "dialogues/meno/turns.html#turn_meno_0001",
    );
    expect(overBoundary.pageById.get("turn_meno_0251")).toBe(
      "dialogues/meno/turns-2.html#turn_meno_0251",
    );
  });

  it("loads single/multi-turn joins into deterministic bidirectional maps", () => {
    const observationPath = join(root, "wiki/observations/meno.md");
    writeFileSync(
      observationPath,
      `${readFileSync(observationPath, "utf8")}\n${ledgerRecord({
        observationId: "obs_meno_0002",
        span: "70b",
      })}\n`,
      "utf8",
    );
    writeMenoJoin(root, [
      {
        observationId: "obs_meno_0002",
        turnIds: ["turn_meno_0002", "turn_meno_0001"],
        speakers: ["ΣΩ.", "ΜΕΝ."],
      },
      { observationId: "obs_meno_0001", turnIds: ["turn_meno_0002"], speakers: ["ΣΩ."] },
    ]);
    syncProjectionFixtures();

    const data = readSiteData();
    expect(data.observationTurnJoinsByDialogue.get("meno")?.rows).toHaveLength(2);
    expect(data.turnIdsByObservationId.get("obs_meno_0001")).toEqual(["turn_meno_0002"]);
    expect(data.turnIdsByObservationId.get("obs_meno_0002")).toEqual([
      "turn_meno_0001",
      "turn_meno_0002",
    ]);
    expect(data.observationIdsByTurnId.get("turn_meno_0001")).toEqual(["obs_meno_0002"]);
    expect(data.observationIdsByTurnId.get("turn_meno_0002")).toEqual([
      "obs_meno_0001",
      "obs_meno_0002",
    ]);
    expect(data.observationIdsByTurnId.get("turn_apology_0001")).toEqual([]);
    expect(data.turnPageById.get("turn_meno_0001")).toBe(
      "dialogues/meno/turns.html#turn_meno_0001",
    );
    expect(data.dossierPageByConceptId.get(TEST_CONCEPT_ID)).toBe(
      `dossiers/elenchus/bounded_test.html#dossier:${TEST_CONCEPT_ID}`,
    );
  });

  it("rejects join rows with unknown observation or turn endpoints", () => {
    writeOntologyFixture([], ["obs_crito_0001"]);
    syncProjectionFixtures();
    writeMenoJoin(root, [{ observationId: "obs_meno_9999", turnIds: ["turn_meno_0001"] }]);
    expect(() => readSiteData()).toThrow(
      /Observation-turn join meno references unknown observation obs_meno_9999/u,
    );

    writeMenoJoin(root, [{ observationId: "obs_meno_0001", turnIds: ["turn_meno_9999"] }]);
    expect(() => readSiteData()).toThrow(
      /Observation-turn join meno references unknown turn turn_meno_9999/u,
    );
  });

  it("strictly merges canonical per-turn metrics and rejects unknown or duplicate metric rows", () => {
    const data = readSiteData();
    expect(data.derivedByDialogue.get("meno")?.turns[0]).toMatchObject({
      turn_id: "turn_meno_0001",
      greek_char_count: "18",
      token_count: "11",
      dialogue_long_turn: "no",
      speaker_long_turn: "no",
    });
    expect(data.derivedByDialogue.get("meno")?.turns[1]).toMatchObject({
      token_count: "17",
      dialogue_long_turn: "yes",
      speaker_long_turn: "yes",
    });

    const metricsPath = join(root, "derived/plato/metrics/turn-lengths/meno.toon");
    const original = readFileSync(metricsPath, "utf8");
    const unknownRow =
      "  turn_meno_9999 | ΣΩ. | 70b | 70b | 48 | 50 | 2 | 1 | no | no\n";
    writeFileSync(
      metricsPath,
      original.replace("turns[2]:", "turns[3]:").replace(/\n$/u, `\n${unknownRow}`),
      "utf8",
    );
    expect(() => readSiteData()).toThrow(/reference unknown turn turn_meno_9999/u);

    const duplicateRow =
      "  turn_meno_0001 | ΜΕΝ. | 70a | 70a | 0 | 20 | 18 | 11 | no | no\n";
    writeFileSync(
      metricsPath,
      original.replace("turns[2]:", "turns[3]:").replace(/\n$/u, `\n${duplicateRow}`),
      "utf8",
    );
    expect(() => readSiteData()).toThrow(/duplicate turn turn_meno_0001/u);
  });
});

describe("turn and dossier evidence rendering", () => {
  it("renders linked turn shards, summaries, joins, anchors, assent, and neutral catalogs", () => {
    writeMenoJoin(root, [
      {
        observationId: "obs_meno_0001",
        turnIds: ["turn_meno_0001", "turn_meno_0002"],
        speakers: ["ΜΕΝ.", "ΣΩ."],
      },
    ]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    const turns = readFileSync(join(outDir, "dialogues/meno/turns.html"), "utf8");
    expect(turns).toContain('id="turn_meno_0001"');
    expect(turns).toContain('id="turn_meno_0002"');
    expect(turns).toContain("<dt>characters</dt><dd>18</dd>");
    expect(turns).toContain("<dt>tokens</dt><dd>11</dd>");
    expect(turns).toContain("dialogue long turn");
    expect(turns).toContain("speaker long turn");
    expect(turns).toContain('../../dialogues/meno/records-part-1.html#obs_meno_0001');
    expect(turns).toContain('../../anchors/definition_prompt.html');
    expect(readFileSync(join(outDir, "dialogues/apology/turns.html"), "utf8")).toContain(
      "one whole-dialogue unattributed turn; no speaker is inferred",
    );

    const records = readFileSync(join(outDir, "dialogues/meno/records.html"), "utf8");
    expect(records).toContain('../../dialogues/meno/turns.html">Turns &amp; structure</a><b class="lgr-n">2</b>');
    const structure = readFileSync(join(outDir, "dialogues/meno/structure.html"), "utf8");
    expect(structure).toContain('../../dialogues/meno/turns.html#turn_meno_0002');
    expect(structure).toContain("1 long turn.");
    expect(structure).toContain("Assent Stretches");
    expect(structure).toContain('../../dialogues/meno/turns.html#turn_meno_0001');
    expect(structure).toContain("tok_meno_000001");
    expect(structure).not.toMatch(/href="[^"]*tok_meno/u);

    const observations = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    expect(observations).toContain('class="dialog-turns"');
    expect(observations).toContain('../../dialogues/meno/turns.html#turn_meno_0001');
    expect(observations).toContain('../../dialogues/meno/turns.html#turn_meno_0002');
    const anchorPage = readFileSync(join(outDir, "anchors/definition_prompt.html"), "utf8");
    expect(anchorPage).toContain('../dialogues/meno/turns.html#turn_meno_0001');
    expect(anchorPage).toContain("tok_meno_000001");
    expect(anchorPage).not.toMatch(/href="[^"]*tok_meno/u);

    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("turn_meno_0001")).toBe("dialogues/meno/turns.html#turn_meno_0001");
    expect(exactTargets.get("turn_meno_0002")).toBe("dialogues/meno/turns.html#turn_meno_0002");
    const searchManifest = parseSearchManifest(
      readFileSync(join(outDir, "assets/search/manifest.json"), "utf8"),
      "assets/search/manifest.json",
    );
    const turnSearchRecords = searchManifest.shards
      .filter((descriptor) => descriptor.kind === "turn")
      .flatMap((descriptor) =>
        parseSearchShard(readFileSync(join(outDir, descriptor.path), "utf8"), descriptor.path).records,
      );
    expect(turnSearchRecords).toHaveLength(4);
    expect(turnSearchRecords.find((record) => record.id === "turn_meno_0001")).toEqual({
      id: "turn_meno_0001",
      target: "dialogues/meno/turns.html#turn_meno_0001",
      kind: "turn",
      dialogue: "meno",
      stephanusSpan: "70a",
      speaker: "ΜΕΝ.",
      title: "Meno turn by ΜΕΝ.",
    });
    const turnSearchJson = searchManifest.shards
      .filter((descriptor) => descriptor.kind === "turn")
      .map((descriptor) => readFileSync(join(outDir, descriptor.path), "utf8"))
      .join("\n");
    expect(turnSearchJson).not.toMatch(/token|text_sha|greek_char|token_ids/iu);
  });

  it("bounds multi-turn observation context to five direct links plus the full browser", () => {
    writeMenoTurnTables(root, 6);
    writeMenoJoin(root, [
      {
        observationId: "obs_meno_0001",
        turnIds: Array.from({ length: 6 }, (_, index) => `turn_meno_${String(index + 1).padStart(4, "0")}`),
      },
    ]);
    syncProjectionFixtures();
    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    const page = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    const article = /<article class="record" id="obs_meno_0001"[\s\S]*?<\/article>/u.exec(page)?.[0] ?? "";
    for (let index = 1; index <= 5; index += 1) {
      expect(article).toContain(`turn_meno_${String(index).padStart(4, "0")}`);
    }
    expect(article).not.toContain("turn_meno_0006");
    expect(article).toContain("1 more in Turns");
    expect(article).toContain('../../dialogues/meno/turns.html">1 more in Turns</a>');
  });

  it("links canonical dossier targets without manufacturing counterevidence", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dossiers/elenchus/bounded_test.html"), "utf8");
    expect(page).toContain(`id="dossier:${TEST_CONCEPT_ID}"`);
    expect(page).toContain(`../../concepts/elenchus/bounded_test.html`);
    expect(page).not.toContain("Counterevidence");
    expect(page).not.toMatch(/family|feature_label|feature_id/iu);
  });
});

describe("reading view", () => {
  it("renders the interleaved reading page only when commentary exists", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    expect(existsSync(join(outDir, "dialogues/meno/reading.html"))).toBe(false);

    writeMenoCommentary(root);
    buildStaticSite({ outDir });
    expect(existsSync(join(outDir, "dialogues/meno/reading.html"))).toBe(true);
    expect(existsSync(join(outDir, "dialogues/crito/reading.html"))).toBe(false);

    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");

    // Fragments for every rendered block; rejected block omitted.
    expect(page).toContain('id="comm_meno_0001"');
    expect(page.match(/id="comm_meno_0001"/gu)).toHaveLength(1);
    expect(page).toContain('id="comm_meno_0002"');
    expect(page).toContain('id="comm_meno_0003"');
    expect(page).not.toContain("comm_meno_0004");
    expect(page).not.toContain("A rejected block that must not render.");

    // Rail anchors for every marker in the section. English lacking {70b}
    // simply flows through — no join placeholder splits the sentence.
    expect(page).toContain('id="loc-70a"');
    expect(page).toContain('id="loc-70b"');
    expect(page).toContain("Meno speaks. Socrates replies.");
    expect(page).not.toContain("joined with the previous English passage");
    // The Greek mid-line marker renders as an inline milestone.
    expect(page).toContain('<a class="milestone" href="#loc-70b">70b</a>');
    // The reading hero restates the curated epigraph instead of metric tiles.
    expect(page).toContain('class="epigraph"');
    expect(page).not.toContain('class="metrics"');

    // Placement: notes are slot-grouped margin entries right of the rail —
    // the before-note leads the verse's margin cell, the after-note trails it.
    expect(page.indexOf('id="comm_meno_0002"')).toBeGreaterThan(page.indexOf('id="loc-70a"'));
    expect(page.indexOf('id="comm_meno_0002"')).toBeLessThan(page.indexOf('id="comm_meno_0003"'));
    expect(page).toContain('<div class="slot-group for-comm">');
    // The section head renders twice (margin + mobile copy) with one id total,
    // and its title is the clickable entry.
    expect((page.match(/class="sec-head sec-desktop"/gu) ?? []).length).toBe(1);
    expect((page.match(/class="sec-head sec-mobile"/gu) ?? []).length).toBe(1);
    expect(page).toContain('<span class="mark mark-commentary"></span>');
    expect(page).toContain('name="margin-comm_meno_0001"');

    // Escaping and authorship attribution.
    expect(page).toContain("Teaching prose with &lt;angles&gt; to escape.");
    expect(page).toContain("Model commentary");

    // Cites links resolve to record pages.
    expect(page).toContain("records-part-1.html#obs_meno_0001");
    expect(page).toContain("dossiers/elenchus/bounded_test.html");

    // Dialogue index gains a Reading link; the exact-ID shards carry visible commentary ids.
    const dialogueIndex = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    expect(dialogueIndex).toContain("reading.html");
    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("comm_meno_0001")).toBe("dialogues/meno/reading.html#comm_meno_0001");
    expect(exactTargets.get("comm_meno_0004")).toBeUndefined();

    // No external URLs on the reading page; byte-stable rebuild.
    expect(page).not.toMatch(/https?:\/\//u);
    buildStaticSite({ outDir });
    expect(readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8")).toBe(page);
  });

  it("treats a rejected-only commentary lane as absent from every reader surface", () => {
    writeMenoCommentary(root);
    const commentaryPath = join(root, "wiki/commentary/meno.md");
    writeFileSync(
      commentaryPath,
      readFileSync(commentaryPath, "utf8").replaceAll(
        /review_status: (?:accepted|unreviewed)/gu,
        "review_status: rejected",
      ),
      "utf8",
    );

    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    expect(existsSync(join(outDir, "dialogues/meno/reading.html"))).toBe(false);
    expect(readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8")).not.toContain("reading.html");
    expect(readFileSync(join(outDir, "dialogues/meno/records.html"), "utf8")).not.toContain("reading.html");
    expect(readFileSync(join(outDir, "dialogues/index.html"), "utf8")).not.toContain("dialogues/meno/reading.html");
    expect(readFileSync(join(outDir, "readings/index.html"), "utf8")).not.toContain("dialogues/meno/reading.html");
    expect(readFileSync(join(outDir, "audio/index.html"), "utf8")).not.toContain("dialogues/meno/reading.html");

    const publicOutput = listFiles(outDir)
      .filter((path) => path.endsWith(".html") || path.endsWith(".json"))
      .map((path) => readFileSync(join(outDir, path), "utf8"))
      .join("\n");
    for (const commentaryId of ["comm_meno_0001", "comm_meno_0002", "comm_meno_0003", "comm_meno_0004"]) {
      expect(publicOutput).not.toContain(commentaryId);
      expect(readExactTargets(outDir).has(commentaryId)).toBe(false);
    }
  });

  it("places visible notes under the next visible section when their section is rejected", () => {
    writeMenoRejectedSectionCommentary(root);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    const visibleUnit = page.match(/<section class="unit" id="comm_meno_0002">[\s\S]*?<\/section>/u)?.[0] ?? "";
    expect(page).not.toContain('class="unit" id="comm_meno_0001"');
    for (const id of ["comm_meno_0005", "comm_meno_0006"]) {
      expect(page.match(new RegExp(`id="${id}"`, "gu"))).toHaveLength(1);
      expect(visibleUnit).toContain(`id="${id}"`);
    }
    expect(readExactTargets(outDir).get("comm_meno_0005")).toBe("dialogues/meno/reading.html#comm_meno_0005");
    expect(readExactTargets(outDir).get("comm_meno_0006")).toBe("dialogues/meno/reading.html#comm_meno_0006");
  });

  it("shards large guided readings at section boundaries and preserves exact commentary targets", () => {
    mkdirSync(join(root, "wiki/commentary"), { recursive: true });
    mkdirSync(join(root, "raw/plato/english"), { recursive: true });
    writeFileSync(
      join(root, "raw/plato/english/meno.txt"),
      "{70a} Meno speaks. {70b} Socrates replies.",
      "utf8",
    );
    writeFileSync(
      join(root, "wiki/commentary/meno.md"),
      `# Meno commentary\n\n${commentaryBlock({
        id: "comm_meno_0001",
        kind: "section",
        span: "70a",
        title: "First unit",
      })}\n\n${commentaryBlock({
        id: "comm_meno_0002",
        kind: "section",
        span: "70b",
        title: "Second unit",
      })}\n`,
      "utf8",
    );

    const outDir = join(root, "site");
    const result = buildStaticSite({ outDir, readingPageTargetBytes: 1 });
    const first = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    const second = readFileSync(join(outDir, "dialogues/meno/reading-2.html"), "utf8");
    expect(result.pages).toContain("dialogues/meno/reading-2.html");
    expect(first).toContain('aria-label="Reading pages"');
    expect(first).toContain('<strong aria-current="page">1</strong>');
    expect(first).toContain('href="../../dialogues/meno/reading-2.html">2</a>');
    expect(second).toContain('href="../../dialogues/meno/reading.html">1</a>');
    expect(first).toContain('id="comm_meno_0001"');
    expect(first).not.toContain('id="comm_meno_0002"');
    expect(second).toContain('id="comm_meno_0002"');
    expect(second).not.toContain('id="comm_meno_0001"');
    expect(Buffer.byteLength(first)).toBeLessThan(2 * 1024 * 1024);
    expect(Buffer.byteLength(second)).toBeLessThan(2 * 1024 * 1024);

    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("comm_meno_0001")).toBe("dialogues/meno/reading.html#comm_meno_0001");
    expect(exactTargets.get("comm_meno_0002")).toBe("dialogues/meno/reading-2.html#comm_meno_0002");
  });
});

describe("static recording publication", () => {
  it("materializes a verified master and renders an accessible deterministic player", () => {
    acceptMenoCommentary(root);
    const { artifactRoot, artifactBytes, sha256 } = writeMenoRecording();
    const outDir = join(root, "site");
    const first = buildStaticSite({ outDir, recordingArtifactRoot: artifactRoot });

    const assetPath = join(outDir, "assets/recordings/meno/complete.mp3");
    expect(readFileSync(assetPath)).toEqual(artifactBytes);
    expect(first.pages).toContain("assets/recordings/meno/complete.mp3");
    expect(first.validation).toMatchObject({
      recordingAssets: 1,
      recordingBytes: artifactBytes.length,
      recordingHashMismatches: 0,
    });
    expect(first.validation.coreTotalBytes).toBe(first.validation.totalBytes - artifactBytes.length);

    const landing = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    // v3.3 removed the Listen door; the overview's Read door notes the audio
    // edition, and the recording surfaces on the reading page + audio catalog.
    expect(landing).toContain('href="../../dialogues/meno/reading.html">Read</a>');
    expect(landing).toContain("The audio edition plays here when published.");
    expect(landing).not.toContain("#recording-player");

    const audioEditions = readFileSync(join(outDir, "audio/index.html"), "utf8");
    expect(audioEditions).toContain('data-dialogue="meno" data-status="available"');
    expect(audioEditions).toContain('href="../dialogues/meno/reading.html#recording-player"');
    expect(audioEditions).toContain('data-recording-resume-link data-recording-id="recording_meno_fixture_v1"');
    expect(audioEditions).toContain(`data-audio-sha256="${sha256}"`);
    expect(audioEditions).toContain('data-recording-duration="0.96"');
    expect(audioEditions).toContain("Checking saved position…");
    expect(audioEditions).toContain("Published");

    const readingPath = join(outDir, "dialogues/meno/reading.html");
    const reading = readFileSync(readingPath, "utf8");
    expect(reading).toContain('id="recording-player" data-recording-player');
    expect(reading).toContain('data-recording-id="recording_meno_fixture_v1"');
    expect(reading).toContain(`data-audio-sha256="${sha256}"`);
    expect(reading).toContain('<audio id="recording-audio-meno" controls preload="metadata" data-recording-audio');
    expect(reading).toContain('<source src="../../assets/recordings/meno/complete.mp3" type="audio/mpeg">');
    expect(reading).not.toContain("autoplay");
    expect(reading).toContain('role="status" aria-live="polite" data-recording-status');
    expect(reading).toContain("Loading recording metadata…");
    expect(reading).toContain('role="group" aria-label="Recording chapters"');
    expect(reading).toContain('type="button" class="chapter-button" data-recording-chapter');
    expect(reading).toContain('data-chapter-id="chapter-1" data-chapter-frame="0" data-chapter-seconds="0" data-chapter-target="comm_meno_0001"');
    expect(reading).toContain('data-chapter-href="../../dialogues/meno/reading.html#comm_meno_0001"');
    expect(reading).toContain('aria-controls="recording-audio-meno"');
    expect(reading).toContain('id="comm_meno_0001"');

    const browserJs = siteJs();
    expect(browserJs).toContain("plato-recording-resume:v1:");
    expect(browserJs).toContain('audio.addEventListener("loadedmetadata", restoreProgress)');
    expect(browserJs).toContain('audio.addEventListener("timeupdate", () => persistProgress(false))');
    expect(browserJs).toContain('audio.addEventListener("pause"');
    expect(browserJs).toContain('window.addEventListener("pagehide"');
    expect(browserJs).toContain("audio.currentTime = seconds");
    expect(browserJs).toContain("localStorage.removeItem(resumeKey)");
    expect(browserJs).not.toContain("audio.play(");

    const firstReading = reading;
    const firstManifest = readFileSync(join(outDir, "manifest.txt"), "utf8");
    buildStaticSite({ outDir, recordingArtifactRoot: artifactRoot });
    expect(readFileSync(readingPath, "utf8")).toBe(firstReading);
    expect(readFileSync(join(outDir, "manifest.txt"), "utf8")).toBe(firstManifest);
    expect(readFileSync(assetPath)).toEqual(artifactBytes);
  });

  it("renders honest unavailable states for absent, draft, or withdrawn recordings", () => {
    acceptMenoCommentary(root);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    let reading = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    let landing = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    expect(reading).toContain("Production recording unavailable.");
    expect(landing).not.toContain("#recording-player");
    expect(reading).not.toContain("<audio");
    expect(reading).not.toContain("<source");
    let audioEditions = readFileSync(join(outDir, "audio/index.html"), "utf8");
    expect(audioEditions).toContain('data-dialogue="meno" data-status="unavailable"');
    expect(audioEditions).toContain("Audio not yet published.");
    expect(audioEditions).not.toContain("data-recording-resume-link");

    writeMenoRecording({ status: "draft" });
    buildStaticSite({ outDir });
    reading = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    landing = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    expect(reading).toContain("Production recording unavailable.");
    expect(landing).not.toContain("#recording-player");
    expect(existsSync(join(outDir, "assets/recordings/meno/complete.mp3"))).toBe(false);
    audioEditions = readFileSync(join(outDir, "audio/index.html"), "utf8");
    expect(audioEditions).not.toContain("Published</span>");

    writeMenoRecording({ status: "withdrawn" });
    buildStaticSite({ outDir });
    expect(readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8")).not.toContain("<audio");
  });

  it("renders an explicitly included draft as a truthful playable Review candidate", () => {
    acceptMenoCommentary(root);
    const { artifactRoot, artifactBytes, sha256 } = writeMenoRecording({ status: "draft" });
    const outDir = join(root, "draft-review-site");
    const result = buildStaticSite({
      outDir,
      recordingArtifactRoot: artifactRoot,
      includeDraftRecordings: true,
    });

    expect(result).toMatchObject({ acceptedRecordingCount: 0, reviewCandidateRecordingCount: 1 });
    expect(result.validation).toMatchObject({
      recordingAssets: 1,
      recordingBytes: artifactBytes.length,
      recordingHashMismatches: 0,
    });
    expect(readFileSync(join(outDir, "assets/recordings/meno/complete.mp3"))).toEqual(artifactBytes);

    const reading = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    const player = reading.match(/<section\b[^>]*data-recording-player[\s\S]*?<\/section>/u)?.[0] ?? "";
    expect(player).toContain('data-recording-acceptance-status="draft"');
    expect(player).toContain("Review candidate");
    expect(player).toContain("has not passed final production acceptance");
    expect(player).toContain(`data-audio-sha256="${sha256}"`);
    expect(player).not.toMatch(/Production recording|Published/u);

    const landing = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    // v3.3 removed the Listen door; the review-candidate state is carried by the
    // reading player (above) and the audio catalog (below), not the overview.
    expect(landing).not.toContain("#recording-player");
    expect(landing).not.toMatch(/Production recording|Review candidate|Published/u);

    const catalog = readFileSync(join(outDir, "audio/index.html"), "utf8");
    const row = catalog.match(/<tr\b[^>]*data-dialogue="meno"[\s\S]*?<\/tr>/u)?.[0] ?? "";
    expect(catalog).toContain("review candidates</span><strong>1</strong>");
    expect(catalog).toContain("published recordings</span><strong>0</strong>");
    expect(row).toContain('data-status="review-candidate"');
    expect(row).toContain("Review candidate");
    expect(row).toContain("has not passed final production acceptance");
    expect(row).toContain("Listen for review");
    expect(row).not.toMatch(/Production recording|Published/u);
  });

  it("keeps the previous site intact when an included draft fails its hash gate", () => {
    acceptMenoCommentary(root);
    const expectedSha256 = createHash("sha256").update(DEFAULT_MP3_FIXTURE.bytes).digest("hex");
    const corrupt = mp3Fixture(41);
    const { artifactRoot } = writeMenoRecording({
      status: "draft",
      artifactBytes: corrupt.bytes,
      manifestSha256: expectedSha256,
      durationSeconds: corrupt.durationSeconds,
    });
    const outDir = join(root, "draft-review-site");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "previous-good-build.txt"), "preserve", "utf8");

    expect(() =>
      buildStaticSite({ outDir, recordingArtifactRoot: artifactRoot, includeDraftRecordings: true }),
    ).toThrow(/Recording artifact hash mismatch/u);
    expect(readFileSync(join(outDir, "previous-good-build.txt"), "utf8")).toBe("preserve");
  });

  it("fails accepted publication when the artifact root is missing or the source hash is corrupt", () => {
    acceptMenoCommentary(root);
    const expected = createHash("sha256").update("expected bytes").digest("hex");
    const { artifactRoot } = writeMenoRecording({
      artifactBytes: Buffer.from("corrupt bytes"),
      manifestSha256: expected,
    });
    const outDir = join(root, "site");

    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "previous-good-build.txt"), "keep until corpus preflight passes", "utf8");

    expect(() => buildStaticSite({ outDir })).toThrow(
      /explicit recordingArtifactRoot or PLATO_RECORDING_ARTIFACT_ROOT/u,
    );
    expect(readFileSync(join(outDir, "previous-good-build.txt"), "utf8")).toBe(
      "keep until corpus preflight passes",
    );
    expect(() => buildStaticSite({ outDir, recordingArtifactRoot: artifactRoot })).toThrow(
      /Publication derivative hash mismatch/u,
    );
    expect(readFileSync(join(outDir, "previous-good-build.txt"), "utf8")).toBe(
      "keep until corpus preflight passes",
    );
    expect(existsSync(join(outDir, "assets/recordings/meno/complete.mp3"))).toBe(false);
    expect(existsSync(join(outDir, "dialogues/meno/reading.html"))).toBe(false);
  });

  it("rejects an output tree that overlaps accepted recording artifacts before deletion", () => {
    acceptMenoCommentary(root);
    const { artifactRoot } = writeMenoRecording();
    const sentinel = join(artifactRoot, "previous-good-artifact.txt");
    writeFileSync(sentinel, "preserve accepted recording evidence", "utf8");

    expect(() => buildStaticSite({ outDir: artifactRoot, recordingArtifactRoot: artifactRoot })).toThrow(
      /must not overlap the recording artifact root/u,
    );
    expect(readFileSync(sentinel, "utf8")).toBe("preserve accepted recording evidence");
  });

  it("rejects artifact-root overlap before deletion when a draft is excluded by default", () => {
    acceptMenoCommentary(root);
    const { artifactRoot } = writeMenoRecording({ status: "draft" });
    const sentinel = join(artifactRoot, "default-excluded-draft-sentinel.txt");
    writeFileSync(sentinel, "preserve excluded draft evidence", "utf8");

    expect(() =>
      buildStaticSite({ outDir: artifactRoot, recordingArtifactRoot: artifactRoot }),
    ).toThrow(/must not overlap the recording artifact root/u);
    expect(readFileSync(sentinel, "utf8")).toBe("preserve excluded draft evidence");
  });
});

describe("ontology quality dashboard", () => {
  it("reads and renders only canonical axes, concepts, and memberships", () => {
    const data = readSiteData();
    expect(data.ontologyQuality).toMatchObject({
      axes: 1,
      concepts: 1,
      memberships: 2,
      acceptedObservations: 2,
      acceptedObservationsWithMemberships: 2,
      crossDialogueConcepts: 1,
      singletonConcepts: 0,
    });
    expect(data.coverage).toEqual(buildCoverageReport());

    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const quality = readFileSync(join(outDir, "quality.html"), "utf8");
    expect(quality).toContain("Every row is computed from the validated axes, concepts, and many-to-many membership files.");
    expect(quality).toContain("<span>axes</span><strong>1</strong>");
    expect(quality).toContain("<span>concepts</span><strong>1</strong>");
    expect(quality).toContain("<span>memberships</span><strong>2</strong>");
    expect(quality).toContain("<span>accepted observation membership coverage</span><strong>100.0%</strong>");
    expect(quality).not.toMatch(/feature|registry|family|label quality/iu);
  });
});

describe("static site", () => {
  it("emits syntactically valid browser JavaScript", () => {
    expect(() => new Function(siteJs())).not.toThrow();
  });

  it("provides deterministic filter and ID-jump status text", () => {
    expect(filterStatusText(12, 12)).toBe("12 of 12 records.");
    expect(filterStatusText(3, 12)).toBe("3 of 12 records.");
    expect(filterStatusText(0, 12)).toBe("No matching records. 0 of 12 records.");
    expect(idJumpStatusText("initial")).toBe("Enter an exact record ID.");
    expect(idJumpStatusText("no-match")).toBe("No matching record ID.");
    expect(idJumpStatusText("load-error")).toBe("Record ID index unavailable.");
    const browserJs = siteJs();
    expect(browserJs).toContain('output.textContent = "No matching records. 0 of " + total + " records."');
    expect(browserJs).not.toContain("id-index.json");
    expect(browserJs).toContain('jumpForm.dataset.indexManifest || "assets/index/manifest.json"');
    expect(browserJs).toContain('corpusSearch.dataset.manifestSrc || "assets/search/manifest.json"');
    const corpusAdapter = browserJs.slice(browserJs.indexOf('const corpusSearch ='));
    expect(corpusAdapter.indexOf("if (!normalizedQuery)")).toBeLessThan(
      corpusAdapter.indexOf("const manifest = await loadSearchManifest()"),
    );
    expect(corpusAdapter).toContain("const resultCap = 50;");
  });

  it("keeps instrument-and-specimen token contrast above accessibility floors", () => {
    const css = siteCss();
    const readVar = (name: string) => {
      const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`, "u").exec(css);
      if (!match?.[1]) throw new Error(`missing --${name} in siteCss`);
      return match[1];
    };
    const ground = readVar("ground");
    const panel = readVar("panel");
    const ink = readVar("ink");
    const muted = readVar("muted");
    const accent = readVar("accent");
    expect(contrastRatio(accent, ground)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accent, panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(ink, ground)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(muted, panel)).toBeGreaterThanOrEqual(4.5);
    expect(css).not.toMatch(/\.zero\s*\{[^}]*opacity/gu);
    expect(css).toContain(".zero a { color: var(--accent);");
  });

  it("validates a clean multi-page generated site", () => {
    const outDir = join(root, "validator-clean");
    mkdirSync(join(outDir, "nested"), { recursive: true });
    writeFileSync(
      join(outDir, "index.html"),
      '<main id="home"><a href="nested/page.html#target">Open</a></main>',
      "utf8",
    );
    writeFileSync(join(outDir, "nested/page.html"), '<article id="target">Target</article>', "utf8");
    writeFileSync(join(outDir, "asset.txt"), "asset", "utf8");

    expect(validateGeneratedSite(outDir)).toMatchObject({
      htmlFiles: 2,
      links: 1,
      duplicateIds: 0,
      brokenPaths: 0,
      brokenFragments: 0,
      externalUrls: 0,
      assetReferences: 0,
      externalAssetUrls: 0,
      homepageBytes: expect.any(Number),
      maxIdIndexShardBytes: 0,
      maxSearchIndexShardBytes: 0,
      coreTotalBytes: expect.any(Number),
    });
  });

  it("verifies recording asset hashes and chapter targets as generated-site invariants", () => {
    const outDir = join(root, "validator-recording");
    const readingDir = join(outDir, "dialogues/fixture");
    const assetPath = join(outDir, "assets/recordings/fixture/complete.mp3");
    const { bytes, durationSeconds } = mp3Fixture();
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    mkdirSync(readingDir, { recursive: true });
    mkdirSync(join(assetPath, ".."), { recursive: true });
    writeFileSync(assetPath, bytes);
    writeFileSync(
      join(readingDir, "reading.html"),
      `<section data-recording-player data-recording-acceptance-status="accepted" data-recording-id="recording_fixture_v1" data-audio-sha256="${sha256}">
  <p>Production recording</p>
  <p id="recording-status" role="status" aria-live="polite" data-recording-status>Ready.</p>
  <audio id="recording-audio" controls preload="metadata" data-recording-audio aria-describedby="recording-status"><source src="../../assets/recordings/fixture/complete.mp3" type="audio/mpeg"></audio>
  <div role="group" aria-label="Recording chapters"><button type="button" data-recording-chapter data-chapter-id="chapter-1" data-chapter-frame="0" data-chapter-seconds="0" data-chapter-target="comm_fixture_0001" aria-controls="recording-audio">Chapter</button></div>
</section>
<section id="comm_fixture_0001">Reading unit</section>`,
      "utf8",
    );
    const validReading = readFileSync(join(readingDir, "reading.html"), "utf8");
    const recording = {
      dialogue: "fixture",
      recordingId: "recording_fixture_v1",
      status: "accepted",
      audioSha256: sha256,
      durationSeconds,
      assetPath: "assets/recordings/fixture/complete.mp3",
      chapterTargets: ["comm_fixture_0001"],
      chapterIds: ["chapter-1"],
      chapterStartFrames: [0],
      chapterStartSeconds: [0],
    } as const;

    expect(validateGeneratedSite(outDir, { recordings: [recording] })).toMatchObject({
      recordingAssets: 1,
      recordingBytes: bytes.length,
      recordingHashMismatches: 0,
      coreTotalBytes: expect.any(Number),
    });

    writeFileSync(assetPath, "corrupt", "utf8");
    expect(() => validateGeneratedSite(outDir, { recordings: [recording] })).toThrow(
      /recording hash mismatch for recording_fixture_v1/u,
    );

    writeFileSync(assetPath, bytes);
    expect(() =>
      validateGeneratedSite(outDir, {
        recordings: [{ ...recording, durationSeconds: recording.durationSeconds + 1 }],
      }),
    ).toThrow(/MP3 duration mismatch/u);

    const readingPath = join(readingDir, "reading.html");
    writeFileSync(
      readingPath,
      readFileSync(readingPath, "utf8").replaceAll("comm_fixture_0001", "comm_fixture_missing"),
      "utf8",
    );
    expect(() => validateGeneratedSite(outDir, { recordings: [recording] })).toThrow(
      /missing recording chapter target #comm_fixture_0001/u,
    );

    writeFileSync(readingPath, validReading.replace('data-chapter-seconds="0"', 'data-chapter-seconds="0.5"'), "utf8");
    expect(() => validateGeneratedSite(outDir, { recordings: [recording] })).toThrow(
      /recording chapter control 1 has invalid seek/u,
    );

    writeFileSync(readingPath, validReading.replace('data-chapter-frame="0"', 'data-chapter-frame="1"'), "utf8");
    expect(() => validateGeneratedSite(outDir, { recordings: [recording] })).toThrow(
      /recording chapter control 1 has invalid seek/u,
    );

    writeFileSync(
      readingPath,
      validReading.replace(
        /<audio\b[\s\S]*?<\/audio>/u,
        '<img src="../../assets/recordings/fixture/complete.mp3" alt="not an audio player">',
      ),
      "utf8",
    );
    expect(() => validateGeneratedSite(outDir, { recordings: [recording] })).toThrow(
      /must contain one native audio control/u,
    );
  });

  it("validates chapter targets that cross guided-reading page boundaries", () => {
    const outDir = join(root, "validator-reading-chapter");
    const readingDir = join(outDir, "dialogues/fixture");
    mkdirSync(readingDir, { recursive: true });
    writeFileSync(
      join(readingDir, "reading.html"),
      '<button data-chapter-target="comm_fixture_0002" data-chapter-href="reading-2.html#comm_fixture_0002">Next chapter</button>',
      "utf8",
    );
    writeFileSync(
      join(readingDir, "reading-2.html"),
      '<section id="comm_fixture_0002">Second reading unit</section>',
      "utf8",
    );
    expect(validateGeneratedSite(outDir)).toMatchObject({ brokenPaths: 0, brokenFragments: 0 });

    writeFileSync(
      join(readingDir, "reading.html"),
      '<button data-chapter-target="comm_fixture_missing" data-chapter-href="reading-2.html#comm_fixture_missing">Broken chapter</button>',
      "utf8",
    );
    expect(() => validateGeneratedSite(outDir)).toThrow(
      /missing chapter target #comm_fixture_missing in dialogues\/fixture\/reading-2\.html/u,
    );
  });

  it("rejects broken paths, fragments, duplicate ids, escapes, and external URLs", () => {
    const cases = [
      {
        name: "missing-path",
        html: '<a href="missing.html">Missing</a>',
        expected: /index\.html: missing target missing\.html/u,
      },
      {
        name: "missing-fragment",
        html: '<a href="target.html#absent">Missing fragment</a>',
        target: '<p id="present">Present</p>',
        expected: /index\.html: missing fragment #absent in target\.html/u,
      },
      {
        name: "duplicate-id",
        html: '<p id="same"></p><p id="same"></p>',
        expected: /index\.html: duplicate id #same/u,
      },
      {
        name: "outside-root",
        html: '<a href="../outside.html">Outside</a>',
        expected: /index\.html: target escapes output root: \.\.\/outside\.html/u,
      },
      {
        name: "external-url",
        html: '<a href="https://example.com/">External</a>',
        expected: /index\.html: external URL https:\/\/example\.com\//u,
      },
      {
        name: "missing-asset",
        html: '<script src="missing.js"></script>',
        expected: /index\.html: missing asset target missing\.js/u,
      },
      {
        name: "external-asset",
        html: '<audio src="https://media.example/test.mp3"></audio>',
        expected: /index\.html: external asset URL https:\/\/media\.example\/test\.mp3/u,
      },
    ];

    for (const fixture of cases) {
      const outDir = join(root, `validator-${fixture.name}`);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, "index.html"), fixture.html, "utf8");
      if (fixture.target) writeFileSync(join(outDir, "target.html"), fixture.target, "utf8");
      expect(() => validateGeneratedSite(outDir)).toThrow(fixture.expected);
    }
  });

  it("enforces configurable fixture size limits and an explicit external-link allowlist", () => {
    const htmlDir = join(root, "validator-html-size");
    mkdirSync(htmlDir, { recursive: true });
    writeFileSync(join(htmlDir, "index.html"), "<p>1234567890</p>", "utf8");
    expect(() => validateGeneratedSite(htmlDir, { maxHtmlBytes: 10 })).toThrow(/index\.html: HTML size .* exceeds 10 bytes/u);

    const totalDir = join(root, "validator-total-size");
    mkdirSync(totalDir, { recursive: true });
    writeFileSync(join(totalDir, "index.html"), "<p>ok</p>", "utf8");
    writeFileSync(join(totalDir, "asset.txt"), "1234567890", "utf8");
    expect(() => validateGeneratedSite(totalDir, { maxTotalBytes: 12 })).toThrow(/total output size .* exceeds 12 bytes/u);

    const homepageDir = join(root, "validator-homepage-size");
    mkdirSync(homepageDir, { recursive: true });
    writeFileSync(join(homepageDir, "index.html"), "<main>too large</main>", "utf8");
    expect(() => validateGeneratedSite(homepageDir, { maxHomepageBytes: 10 })).toThrow(
      /index\.html: homepage size .* must be below 10 bytes/u,
    );

    const shardDir = join(root, "validator-shard-size");
    mkdirSync(join(shardDir, "assets/index"), { recursive: true });
    mkdirSync(join(shardDir, "assets/search"), { recursive: true });
    writeFileSync(join(shardDir, "index.html"), "<main></main>", "utf8");
    writeFileSync(join(shardDir, "assets/index/ids-claim-meno.json"), "1234567890", "utf8");
    writeFileSync(join(shardDir, "assets/search/search-claim-meno.json"), "123456789", "utf8");
    expect(() => validateGeneratedSite(shardDir, { maxIndexShardBytes: 10 })).toThrow(
      /ID-index shard size 10 bytes must be below 10 bytes/u,
    );
    const shardSummary = validateGeneratedSite(shardDir, { maxIndexShardBytes: 11 });
    expect(shardSummary).toMatchObject({
      homepageBytes: 13,
      maxIdIndexShardBytes: 10,
      maxSearchIndexShardBytes: 9,
      coreTotalBytes: shardSummary.totalBytes,
    });

    const allowedDir = join(root, "validator-allowed-external");
    mkdirSync(allowedDir, { recursive: true });
    writeFileSync(join(allowedDir, "index.html"), '<a href="https://example.com/license">License</a>', "utf8");
    expect(
      validateGeneratedSite(allowedDir, { allowedExternalUrls: new Set(["https://example.com/license"]) }),
    ).toMatchObject({ externalUrls: 1, links: 1 });

    const allowedAssetDir = join(root, "validator-allowed-asset");
    mkdirSync(allowedAssetDir, { recursive: true });
    writeFileSync(join(allowedAssetDir, "index.html"), '<audio src="https://media.example/test.mp3"></audio>', "utf8");
    expect(
      validateGeneratedSite(allowedAssetDir, {
        allowedExternalAssetUrls: new Set(["https://media.example/test.mp3"]),
      }),
    ).toMatchObject({ assetReferences: 1, externalAssetUrls: 1 });
  });

  it("parses adjacent counted TOON tables without crossing their boundaries", () => {
    const content = `first[2]:
  key | value
  a   | one
  b   | two
second[1]:
  key | value
  c   | three
`;

    expect(parseToonTable(content, "first", "fixture.toon")).toEqual([
      { key: "a", value: "one" },
      { key: "b", value: "two" },
    ]);
    expect(parseToonTable(content, "second", "fixture.toon")).toEqual([{ key: "c", value: "three" }]);
    expect(parseToonTable("empty[0]:\n  key | value\n", "empty", "fixture.toon")).toEqual([]);
  });

  it("rejects malformed present TOON tables with path and section context", () => {
    expect(() => parseToonTable("first[1]:\n  key | value\n  only-one-cell\n", "first", "bad-row.toon"))
      .toThrow(/bad-row\.toon \[first\].*1 cells; expected 2/u);
    expect(() => parseToonTable("first[2]:\n  key | value\n  a | one\n", "first", "bad-count.toon"))
      .toThrow(/bad-count\.toon \[first\].*declared 2 rows; found 1/u);
    expect(() => parseToonTable("other[0]:\n  key | value\n", "first", "missing.toon"))
      .toThrow(/missing\.toon \[first\].*missing declaration/u);
  });

  it("loads every derived table and renders representative structural data", () => {
    const derived = readSiteData().derivedByDialogue.get("meno");
    expect(derived?.turns).toHaveLength(2);
    expect(derived?.speakers).toHaveLength(2);
    expect(derived?.anchors).toHaveLength(2);
    expect(derived?.procedure).toHaveLength(2);
    expect(derived?.assent).toHaveLength(2);
    expect(derived?.turns[1]?.turn_id).toBe("turn_meno_0002");
    expect(derived?.speakers[1]?.speaker).toBe("ΣΩ.");
    expect(derived?.anchors[0]?.group).toBe("definition_prompt");
    expect(derived?.procedure[1]?.candidate_id).toBe("proc_meno_0002");
    expect(derived?.assent[0]?.stretch_id).toBe("assent_meno_0001");
    expect(readSiteData().derivedByDialogue.get("crito")?.turns).toHaveLength(1);
    expect(readSiteData().derivedByDialogue.get("apology")?.speakers).toEqual([
      {
        speaker: "(unattributed)",
        turns: "1",
        total_tokens: "8",
        median_tokens: "8",
        p90_tokens: "8",
        max_tokens: "8",
        long_turns: "0",
      },
    ]);

    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const overview = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    const structure = readFileSync(join(outDir, "dialogues/meno/structure.html"), "utf8");
    const anchors = readFileSync(join(outDir, "anchors/index.html"), "utf8");
    const weakSpots = readFileSync(join(outDir, "weak-spots.html"), "utf8");
    expect(overview).toContain("ΜΕΝ.");
    // Anchor groups moved to the records page's Verbal formulae section.
    const records = readFileSync(join(outDir, "dialogues/meno/records.html"), "utf8");
    expect(records).toContain("definition_prompt");
    expect(structure).toContain("proc_meno_0002");
    expect(anchors).toContain("assent_concession");
    expect(weakSpots).toContain("apology");
  });

  it("renders an unassigned observation without inventing ontology links", () => {
    const path = join(root, "wiki/observations/meno.md");
    writeFileSync(
      path,
      `${readFileSync(path, "utf8")}\n${ledgerRecord({
        observationId: "obs_meno_0002",
        span: "70b",
      })}\n`,
      "utf8",
    );

    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const records = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    const unassigned = /<article class="record" id="obs_meno_0002"[\s\S]*?<\/article>/u.exec(records)?.[0] ?? "";
    expect(unassigned).toContain('data-axis=""');
    expect(unassigned).toContain('data-concept=""');
    expect(unassigned).not.toContain("../../axes/");
    expect(unassigned).not.toContain("../../concepts/");
  });

  it("renders stable record permalinks as navigable card headings", () => {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    mkdirSync(join(root, "wiki/relations"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      [
        "# Meno claims",
        "",
        "```yaml",
        "claim_id: claim_meno_0001",
        "source_work: Meno",
        "stephanus_span: 70a",
        commentaryRefLines("meno", "70a"),
        "speaker: ΜΕΝ.",
        "claim_kind: thesis",
        'content: "Virtue is teachable."',
        'greek_terms: ["ἀρετή"]',
        "final_status: left_standing",
        'limits: "A fixture claim."',
        "review_status: accepted",
        "stance_events:",
        "  - kind: asserted",
        "    stephanus_span: 70a",
        "```",
      ].join("\n"),
      "utf8",
    );
    writeFileSync(
      join(root, "wiki/relations/meno.md"),
      [
        "# Meno relations",
        "",
        "```yaml",
        "relation_id: rel_meno_0001",
        "claim_a: claim_meno_0001",
        "claim_b: claim_meno_0001",
        "relation_kind: restatement",
        "resolution: standing",
        'basis: "The claim restates itself for this fixture."',
        'limits: "A fixture relation."',
        "review_status: accepted",
        "```",
      ].join("\n"),
      "utf8",
    );

    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const pages = [
      [readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8"), "obs_meno_0001"],
      [readFileSync(join(outDir, "dialogues/meno/claims.html"), "utf8"), "claim_meno_0001"],
      [readFileSync(join(outDir, "dialogues/meno/relations.html"), "utf8"), "rel_meno_0001"],
    ] as const;
    for (const [page, id] of pages) {
      const article = new RegExp(`<article class="record" id="${id}"[\\s\\S]*?<\\/article>`, "u").exec(page)?.[0] ?? "";
      // The permalink is now the eyebrow anchor; the id attribute is unchanged.
      expect(article).toContain(`<a class="record-anchor" href="#${id}">`);
    }
    const claimPage = pages[1][0];
    expect(claimPage.indexOf('class="record-lead"')).toBeLessThan(claimPage.indexOf('class="source-open"'));
    expect(pages[0][0]).toContain('<span class="badge" lang="grc">λόγος</span>');
    expect(pages[0][0]).toContain('<blockquote class="greek-excerpt" lang="grc">');
    expect(claimPage).toContain('<span class="badge" lang="grc">ἀρετή</span>');
    expect(pages[0][0]).toContain('role="status" aria-live="polite" data-filter-status');
    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("obs_meno_0001")).toBe(
      "dialogues/meno/records-part-1.html#obs_meno_0001",
    );
    expect(exactTargets.get("claim_meno_0001")).toBe(
      "dialogues/meno/claims.html#claim_meno_0001",
    );
    expect(exactTargets.get("rel_meno_0001")).toBe(
      "dialogues/meno/relations.html#rel_meno_0001",
    );
  });

  it("parses observation ledgers with source refs and terms", () => {
    const observations = parseObservationLedger(readFileSync(join(root, "wiki/observations/meno.md"), "utf8"));

    expect(observations).toHaveLength(1);
    expect(observations[0]).toMatchObject({
      observationId: "obs_meno_0001",
      dialogue: "meno",
      concepts: [],
      reviewStatus: "accepted",
    });
    expect(observations[0]?.sourceRef.sourcePath).toBe("raw/plato/greek/meno.txt");
    expect(observations[0]?.greekTerms).toEqual(["λόγος"]);
    expect(observations[0]?.greekExcerpt).toContain("Μένων");
  });

  it("reads block-scalar record bodies instead of leaking the indicator", () => {
    const ledger = [
      "```yaml",
      "observation_id: obs_meno_0009",
      "stephanus_span: 70a",
      "observation: |",
      "  A first indented line",
      "  and a second line.",
      "textual_basis: >-",
      "  Folded lines join",
      "  with spaces.",
      "limits: inline stays inline",
      "review_status: accepted",
      "```",
    ].join("\n");
    const [parsed] = parseObservationLedger(ledger);
    expect(parsed?.observation).toBe("A first indented line\nand a second line.");
    expect(parsed?.textualBasis).toBe("Folded lines join with spaces.");
    expect(parsed?.limits).toBe("inline stays inline");

    // A body that still parses to a bare indicator fails the build outright.
    const leaked = ledger.replace(/observation: \|\n(  .*\n)+/u, 'observation: "|"\n');
    expect(() => parseObservationLedger(leaked)).toThrow(/block-scalar indicator/u);
  });

  it("writes filterable ontology pages and canonical projection back-links", () => {
    const outDir = join(root, "site");
    const result = buildStaticSite({ outDir });

    expect(result.observationCount).toBe(2);
    expect(result.ontologyConceptCount).toBe(1);
    expect(result.clusterCount).toBe(1);
    expect(result.validation).toMatchObject({
      duplicateIds: 0,
      brokenPaths: 0,
      brokenFragments: 0,
      externalUrls: 1,
    });
    expect(existsSync(join(outDir, "index.html"))).toBe(true);
    expect(existsSync(join(outDir, "dialogues/meno/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "dialogues/meno/records-part-1.html"))).toBe(true);
    expect(existsSync(join(outDir, "axes/elenchus.html"))).toBe(true);
    expect(existsSync(join(outDir, "concepts/elenchus/bounded_test.html"))).toBe(true);
    expect(existsSync(join(outDir, "families/elenchus.html"))).toBe(false);
    expect(existsSync(join(outDir, "registry.html"))).toBe(false);
    expect(existsSync(join(outDir, "dialogues/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "axes/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "concepts/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "claims/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "relations/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "readings/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "audio/index.html"))).toBe(true);
    expect(existsSync(join(outDir, "search.html"))).toBe(true);
    expect(existsSync(join(outDir, "clusters/elenchus.html"))).toBe(true);
    expect(existsSync(join(outDir, "dossiers/elenchus/bounded_test.html"))).toBe(true);
    expect(existsSync(join(outDir, "assets/index/manifest.json"))).toBe(true);
    expect(existsSync(join(outDir, "assets/search/manifest.json"))).toBe(true);
    expect(existsSync(join(outDir, "assets/id-index.json"))).toBe(false);
    expect(existsSync(join(outDir, "license.html"))).toBe(true);

    const index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).toContain('href="search.html"');
    expect(index).not.toContain("<datalist");
    expect(index).not.toContain("<option value=");
    expect(index).not.toContain("data-id-jump");
    expect(index).not.toContain("Meno asks a &lt;bounded&gt; question.");

    const search = readFileSync(join(outDir, "search.html"), "utf8");
    expect(search).toContain('data-index-manifest="assets/index/manifest.json"');
    expect(search).toContain('role="status" aria-live="polite" data-id-jump-status');
    expect(search).toContain("Enter an exact record ID.");

    const dialogueHub = readFileSync(join(outDir, "dialogues/index.html"), "utf8");
    expect(dialogueHub).toContain("Apology");
    expect(dialogueHub).toContain('href="../dialogues/index.html" aria-current="page"');

    const conceptsHub = readFileSync(join(outDir, "concepts/index.html"), "utf8");
    expect(conceptsHub).toContain('href="../concepts/elenchus/bounded_test.html"');
    expect(conceptsHub).not.toContain("A bounded question-and-answer test recorded in the cited span.");

    const recordShard = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    expect(recordShard).toContain('data-filter="axis"');
    expect(recordShard).toContain('data-filter="concept"');
    expect(recordShard).toContain('data-filter="status"');
    expect(recordShard).toContain("Meno asks a &lt;bounded&gt; question.");

    const clusterPage = readFileSync(join(outDir, "clusters/elenchus.html"), "utf8");
    expect(clusterPage).toContain("../dialogues/meno/records-part-1.html#obs_meno_0001");
    expect(clusterPage).toContain("raw/plato/greek/meno.txt:70a");

    const dossierPage = readFileSync(join(outDir, "dossiers/elenchus/bounded_test.html"), "utf8");
    expect(dossierPage).toContain("../../dialogues/meno/records-part-1.html#obs_meno_0001");

    const licensePage = readFileSync(join(outDir, "license.html"), "utf8");
    expect(licensePage).toContain("https://creativecommons.org/licenses/by-sa/4.0/");
    expect(licensePage).toContain("modified, generated rendering");

    const searchPage = readFileSync(join(outDir, "search.html"), "utf8");
    expect(searchPage).toContain('data-corpus-search data-manifest-src="assets/search/manifest.json"');
    expect(searchPage).toContain('data-search-filter="kind"');
    expect(searchPage).toContain('data-search-filter="dialogue"');
    expect(searchPage).toContain('data-search-filter="axis"');
    expect(searchPage).toContain('data-search-filter="concept"');
    expect(searchPage).toContain('data-search-filter="status"');
    expect(searchPage).toContain('role="status" aria-live="polite" data-search-status');
    expect(searchPage).toContain('href="search.html" aria-current="page"');

    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("obs_meno_0001")).toBe(
      "dialogues/meno/records-part-1.html#obs_meno_0001",
    );
    expect(exactTargets.get(TEST_AXIS_ID)).toBe(`axes/elenchus.html#${TEST_AXIS_ID}`);
    expect(exactTargets.get(TEST_CONCEPT_ID)).toBe(`concepts/elenchus/bounded_test.html#${TEST_CONCEPT_ID}`);
    expect(exactTargets.get(`dossier:${TEST_CONCEPT_ID}`)).toBe(
      `dossiers/elenchus/bounded_test.html#dossier:${TEST_CONCEPT_ID}`,
    );

    const searchManifest = parseSearchManifest(
      readFileSync(join(outDir, "assets/search/manifest.json"), "utf8"),
      "assets/search/manifest.json",
    );
    const searchRecords = searchManifest.shards.flatMap((descriptor) => {
      const shard = parseSearchShard(readFileSync(join(outDir, descriptor.path), "utf8"), descriptor.path);
      expect(shard).toMatchObject({ kind: descriptor.kind, scope: descriptor.scope });
      expect(shard.records).toHaveLength(descriptor.count);
      return shard.records;
    });
    expect(searchRecords.find((record) => record.id === "obs_meno_0001")).toMatchObject({
      target: "dialogues/meno/records-part-1.html#obs_meno_0001",
      kind: "observation",
      dialogue: "meno",
      axis: "elenchus",
      concept: "bounded_test",
      status: "accepted",
    });
    const searchJson = searchManifest.shards
      .map((descriptor) => readFileSync(join(outDir, descriptor.path), "utf8"))
      .join("\n");
    expect(searchJson).not.toContain("greekExcerpt");
    expect(searchJson).not.toContain("textSha256");
    expect(searchJson).not.toContain("tokenIds");
    expect(searchJson).not.toContain("audio");

    expect(readdirSync(join(outDir, "assets")).sort()).toEqual(["index", "search", "site.css", "site.js"]);
    for (const file of listFiles(outDir).filter((path) => path.endsWith(".html"))) {
      if (file === "license.html") continue;
      expect(readFileSync(join(outDir, file), "utf8")).not.toMatch(/https?:\/\//u);
    }
    expect(listFiles(outDir).some((path) => path.includes("tokens"))).toBe(false);

    const firstManifest = readFileSync(join(outDir, "manifest.txt"), "utf8");
    const firstCatalogs = Object.fromEntries(
      listFiles(join(outDir, "assets"))
        .filter((path) => path.endsWith(".json"))
        .map((path) => [path, readFileSync(join(outDir, "assets", path), "utf8")]),
    );
    buildStaticSite({ outDir });
    expect(readFileSync(join(outDir, "manifest.txt"), "utf8")).toBe(firstManifest);
    const alternateOutDir = join(root, "alternate-site-output");
    buildStaticSite({ outDir: alternateOutDir });
    expect(readFileSync(join(alternateOutDir, "manifest.txt"), "utf8")).toBe(firstManifest);
    expect(
      Object.fromEntries(
        listFiles(join(outDir, "assets"))
          .filter((path) => path.endsWith(".json"))
          .map((path) => [path, readFileSync(join(outDir, "assets", path), "utf8")]),
      ),
    ).toEqual(firstCatalogs);
  });
});

describe("curated site shell (the curated site-shell rollout)", () => {
  function writeMenoClaim(status = "accepted") {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      `\`\`\`yaml
claim_id: claim_meno_0001
source_work: Meno
stephanus_span: 70a
${commentaryRefLines("meno", "70a")}
speaker: ΜΕΝ.
claim_kind: thesis
content: "Fixture claim."
greek_terms: []
final_status: left_standing
limits: "Fixture."
review_status: ${status}
stance_events: []
\`\`\``,
      "utf8",
    );
  }

  it("renders the five-item nav and footer on every page", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    for (const file of ["index.html", "dialogues/meno/index.html"]) {
      const page = readFileSync(join(outDir, file), "utf8");
      const nav = page.slice(page.indexOf("<nav>"), page.indexOf("</nav>"));
      // Three plain anchors and two disclosure panels, in order.
      expect(nav).toContain(">Dialogues</a>");
      expect(nav).toContain(">Listen</a>");
      expect(nav).toContain(">Search</a>");
      const patternsAt = nav.indexOf('aria-label="Patterns menu"');
      const aboutAt = nav.indexOf('aria-label="About menu"');
      expect(patternsAt).toBeGreaterThan(nav.indexOf(">Dialogues</a>"));
      expect(nav.indexOf(">Listen</a>")).toBeGreaterThan(patternsAt);
      expect(nav.indexOf(">Search</a>")).toBeGreaterThan(nav.indexOf(">Listen</a>"));
      expect(aboutAt).toBeGreaterThan(nav.indexOf(">Search</a>"));
      expect((nav.match(/<details class="nav-item"/gu) ?? []).length).toBe(2);
      // Panel rows carry description spans and mono counts.
      expect(nav).toContain("<span>Evidence files per recurring concept</span>");
      expect(nav).toMatch(/Evidence files per recurring concept<\/span><b class="n">1<\/b>/u);
      // Zero-count layers (no claims/relations in the base fixture) are omitted.
      expect(nav).not.toContain("Asserted-content records");
      expect(nav).not.toContain("Support and tension links");
      expect(page).toContain('class="site-footer"');
    }

    const axes = readFileSync(join(outDir, "axes/index.html"), "utf8");
    expect(axes).toContain('<details class="nav-item" data-current>');
  });

  it("homepage is a curated introduction", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    let index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).toContain("Twenty-seven dialogues, read closely");
    expect(index).not.toContain('class="metrics"');
    expect(index).not.toContain("corpus-line");
    // Three SVG-first portals, each with one caption and no prose block.
    expect((index.match(/class="home-portal"/gu) ?? []).length).toBe(3);
    expect((index.match(/<svg viewBox="0 0 180 104"/gu) ?? []).length).toBe(3);
    expect(index).toContain("Read Greek and English with commentary");
    expect(index).toContain("Trace patterns across the dialogues");
    expect(index).toContain("Find passages and records");
    const homePortals = index.match(/<section class="home-portals"[\s\S]*?<\/section>/u)?.[0] ?? "";
    expect((homePortals.match(/<span>/gu) ?? []).length).toBe(3);
    expect(homePortals).not.toContain("<h2>");
    expect(homePortals).not.toContain("<p>");
    // A homepage feature requires complete bilingual, accepted-commentary, and chapter coverage.
    expect(index).not.toContain('class="featured-reading"');

    writeMenoCommentary(root);
    buildStaticSite({ outDir });
    index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).not.toContain('class="featured-reading"');

    acceptMenoCommentary(root);
    const { artifactRoot } = writeMenoRecording({ status: "draft" });
    buildStaticSite({ outDir, includeDraftRecordings: true, recordingArtifactRoot: artifactRoot });
    index = readFileSync(join(outDir, "index.html"), "utf8");
    // The English fixture is missing 70b, so it cannot yet be called complete.
    expect(index).not.toContain('class="featured-reading"');

    writeFileSync(
      join(root, "raw/plato/english/meno.txt"),
      "{70a} Meno speaks. {70b} Socrates replies.",
      "utf8",
    );
    writeFileSync(
      join(root, "wiki/commentary/meno.md"),
      `# Two-section Meno commentary\n\n${commentaryBlock({
        id: "comm_meno_0001",
        kind: "section",
        span: "70a",
        title: "Meno opens",
        review: "accepted",
      })}\n\n${commentaryBlock({
        id: "comm_meno_0002",
        kind: "section",
        span: "70b",
        title: "Socrates replies",
        review: "accepted",
      })}\n`,
      "utf8",
    );
    buildStaticSite({ outDir, includeDraftRecordings: true, recordingArtifactRoot: artifactRoot });
    index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).not.toContain('class="featured-reading"');

    writeMenoRecording({ status: "draft" });
    writeFileSync(
      join(root, "wiki/commentary/meno.md"),
      `# Partial Meno commentary\n\n${commentaryBlock({
        id: "comm_meno_0001",
        kind: "section",
        span: "70a",
        title: "The opening question",
        body: "Only the first marker is covered.",
        review: "accepted",
      })}\n`,
      "utf8",
    );
    buildStaticSite({ outDir, includeDraftRecordings: true, recordingArtifactRoot: artifactRoot });
    index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).not.toContain('class="featured-reading"');

    acceptMenoCommentary(root);
    writeFileSync(
      join(root, "raw/plato/english/meno.txt"),
      "{70a} Meno speaks. {70b} Socrates replies.",
      "utf8",
    );
    buildStaticSite({ outDir, includeDraftRecordings: true, recordingArtifactRoot: artifactRoot });
    index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).toContain('class="featured-reading"');
    expect(index).toContain("One complete dialogue");
    expect(index).toContain("Meno");
    expect(index).toContain("3 accepted model-written commentary notes");
    expect(index).toContain("Open the complete reading");
    expect(index).toContain("Audio is available as a review candidate");

    const rebuilt = join(root, "site-rebuild");
    buildStaticSite({ outDir: rebuilt, includeDraftRecordings: true, recordingArtifactRoot: artifactRoot });
    expect(readFileSync(join(rebuilt, "index.html"), "utf8")).toBe(index);
  });

  it("no digit-adjacent interpuncts anywhere", () => {
    const outDir = join(root, "site");
    writeMenoCommentary(root);
    writeMenoClaim();
    buildStaticSite({ outDir });
    for (const file of listFiles(outDir).filter((path) => path.endsWith(".html"))) {
      expect(readFileSync(join(outDir, file), "utf8")).not.toMatch(/[0-9]\s*·|·\s*[0-9]/u);
    }
  });

  it("patterns hub layers appendix lists only populated layers", () => {
    const outDir = join(root, "site");
    writeMenoClaim();
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "patterns/index.html"), "utf8");
    expect(page).toContain("Browse the layers");
    expect(page).toContain("Everything the text asserts");
    expect(page).not.toContain("Links between claims that support or strain");
  });

  it("search page hosts the exact-ID jump", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const search = readFileSync(join(outDir, "search.html"), "utf8");
    expect(search).toContain("data-id-jump");
    expect(search).toContain('data-index-manifest="assets/index/manifest.json"');
    const index = readFileSync(join(outDir, "index.html"), "utf8");
    expect(index).not.toContain("data-id-jump");
  });
});

describe("content-first record cards (the content-first record-card rollout)", () => {
  function writeMenoAcceptedClaim() {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      [
        "```yaml",
        "claim_id: claim_meno_0001",
        "source_work: Meno",
        "stephanus_span: 70a",
        commentaryRefLines("meno", "70a"),
        "speaker: ΜΕΝ.",
        "claim_kind: thesis",
        'content: "Virtue is teachable."',
        'greek_terms: ["ἀρετή"]',
        "final_status: left_standing",
        'limits: "A fixture claim."',
        "review_status: accepted",
        "stance_events: []",
        "```",
      ].join("\n"),
      "utf8",
    );
  }

  it("observation cards lead with content and humanize their tags", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    const article = /<article class="record" id="obs_meno_0001"[\s\S]*?<\/article>/u.exec(page)?.[0] ?? "";
    expect(article.indexOf("Meno asks a &lt;bounded&gt; question.")).toBeLessThan(article.indexOf("source-dialog"));
    expect(article).toContain('class="record-eyebrow"');
    expect(article).toContain('<span class="ref">meno 70a</span>');
    // Raw snake_case survives in the filter attributes; the chips are humanized.
    expect(article).toContain('data-concept="bounded_test"');
    expect(article).toContain('data-axis="elenchus"');
    expect(article).toContain(">Bounded Test</a>");
    expect(article).toContain('class="badge badge-axis" href="../../axes/elenchus.html">Elenchus</a>');
  });

  it("never emits rejected observations into reader pages or indexes", () => {
    writeFileSync(
      join(root, "wiki/observations/meno.md"),
      `# Meno Observations\n\n${ledgerRecord({
        observationId: "obs_meno_0001",
        span: "70a",
      })}\n\n${ledgerRecord({
        observationId: "obs_meno_0002",
        span: "70a",
      }).replace("review_status: accepted", "review_status: rejected")}\n`,
      "utf8",
    );
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const publicOutput = listFiles(outDir)
      .filter((path) => path.endsWith(".html") || path.endsWith(".json"))
      .map((path) => readFileSync(join(outDir, path), "utf8"))
      .join("\n");
    const page = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    expect(page).not.toContain("status-accepted");
    expect(publicOutput).not.toContain("obs_meno_0002");
    expect(publicOutput).not.toContain("status-rejected");
    expect(readExactTargets(outDir).has("obs_meno_0002")).toBe(false);
  });

  it("claim cards show final status but silence accepted review status", () => {
    writeMenoAcceptedClaim();
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/claims.html"), "utf8");
    expect(page).toContain("Left Standing");
    expect(page).toContain("status-left_standing");
    expect(page).not.toContain("status-accepted");
  });

  it("keeps record permalink fragments stable", () => {
    writeMenoAcceptedClaim();
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const exactTargets = readExactTargets(outDir);
    expect(exactTargets.get("obs_meno_0001")).toBe("dialogues/meno/records-part-1.html#obs_meno_0001");
    expect(exactTargets.get("claim_meno_0001")).toBe("dialogues/meno/claims.html#claim_meno_0001");
    expect(readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8")).toContain(
      'id="obs_meno_0001"',
    );
  });

  it("source dialogs are complete and bookkeeping-free", () => {
    writeMenoCommentary(root);
    writeMenoTurnTables(root, 2);
    writeMenoJoin(root, [{ observationId: "obs_meno_0001", turnIds: ["turn_meno_0001"] }]);
    syncProjectionFixtures();
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    expect((page.match(/<dialog class="source-dialog" id="src-obs_meno_0001"/gu) ?? []).length).toBe(1);
    const dialog = /<dialog class="source-dialog" id="src-obs_meno_0001"[\s\S]*?<\/dialog>/u.exec(page)?.[0] ?? "";
    expect(dialog).toContain('class="greek-excerpt"');
    expect(dialog).toContain('<a href="#obs_meno_0001">obs_meno_0001</a>');
    expect(dialog).toContain("turns.html#turn_meno_0001");
    expect(dialog).toContain("reading.html#loc-70a");
    expect(page).not.toMatch(/text_sha256|feature_candidate_|raw\/plato\/greek/u);
  });

  it("siteJs wires the source dialogs", () => {
    expect(siteJs()).toContain("[data-source-open]");
    expect(siteJs()).toContain("showModal");
  });

  it("builds a records page byte-stably", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const first = readFileSync(join(outDir, "dialogues/meno/records-part-1.html"), "utf8");
    const rebuilt = join(root, "site-rebuild-058");
    buildStaticSite({ outDir: rebuilt });
    expect(readFileSync(join(rebuilt, "dialogues/meno/records-part-1.html"), "utf8")).toBe(first);
  });
});

describe("curated dialogue profiles (the dialogue-profile rollout)", () => {
  it("leads the profile with the curated epigraph and drops the data dump", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    expect(page).toContain('class="epigraph">Can virtue be taught?');
    // v3.3: the sequence strip moved to the records page's Turns & structure.
    const records = readFileSync(join(outDir, "dialogues/meno/records.html"), "utf8");
    expect(records).toContain('class="structure-strip"');
    expect(page).not.toContain('class="structure-strip"');
    expect(page).not.toContain('class="metrics"');
    expect(page).not.toContain("Record Resolver");
  });

  it("fails the build when a dialogue has no curated epigraph", () => {
    // A dialogue with derived turns but no observations reaches the profile
    // renderer without tripping coverage validation (as apology does), so the
    // missing-epigraph guard is what fails the build.
    writeFileSync(join(root, "raw/plato/greek/zzz.txt"), "{1a} Λόγος ἐστίν.", "utf8");
    writeFileSync(
      join(root, "derived/plato/turns/zzz.toon"),
      `dialogue: zzz
turns[1]:
  turn_id       | speaker | start_marker | end_marker | start_char | end_char | text_sha256                                                      | greek_char_count
  turn_zzz_0001 | (none)  | 1a           | 1a         | 0          | 16       | dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd | 12
`,
      "utf8",
    );
    writeFileSync(
      join(root, "derived/plato/metrics/turn-lengths/zzz.toon"),
      `dialogue: zzz
speakers[1]:
  speaker | turns | total_tokens | median_tokens | p90_tokens | max_tokens | long_turns
  (none)  | 1     | 5            | 5             | 5          | 5          | 0
turns[1]:
  turn_id       | speaker | start_marker | end_marker | start_char | end_char | greek_char_count | token_count | dialogue_long_turn | speaker_long_turn
  turn_zzz_0001 | (none)  | 1a           | 1a         | 0          | 16       | 12               | 5           | no                 | no
`,
      "utf8",
    );
    syncProjectionFixtures();
    expect(() => buildStaticSite({ outDir: join(root, "site") })).toThrow(/No curated epigraph/u);
  });

  it("shows one Read action per ledger row and drops the dropdown", () => {
    writeMenoCommentary(root);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const hub = readFileSync(join(outDir, "dialogues/index.html"), "utf8");
    const menoRow = hub.match(/<div class="dlg-row filter-item"[^>]*data-title="meno"[\s\S]*?\n<\/div>/u)?.[0] ?? "";
    expect(menoRow).toContain('dialogues/meno/reading.html">Read</a>');
    expect(menoRow).toContain("Can virtue be taught?");
    // Reading and audio are one page: no Listen action, no em-dash cells.
    const ledgerHtml = hub.slice(hub.indexOf('class="dlg-ledger"'));
    expect(ledgerHtml).not.toContain(">Listen");
    expect(hub).not.toContain("<td>");
    const apologyRow = hub.match(/<div class="dlg-row filter-item"[^>]*data-title="apology"[\s\S]*?\n<\/div>/u)?.[0] ?? "";
    expect(apologyRow).not.toContain(">Read</a>");
    // The dialogue dropdown is gone; sort buttons and type-to-filter remain.
    expect(hub).not.toContain('data-filter="dialogue"');
    expect(hub).toContain('data-sort="title"');
    expect(hub).toContain('data-sort="length"');
    expect(hub).toContain('data-sort="records"');
    expect(hub).toContain("data-filter-search");
    expect(hub).toContain('data-length="');
    expect(hub).toContain('data-records="');
  });
});

describe("reading margin layer (the reading-margin rollout)", () => {
  function writeMenoObservations(records: Array<{ id: string; span: string; status?: string }>) {
    writeFileSync(
      join(root, "wiki/observations/meno.md"),
      `# Meno Observations\n\n${records
        .map((record) => {
          const block = ledgerRecord({
            observationId: record.id,
            span: record.span,
          });
          return record.status ? block.replace("review_status: accepted", `review_status: ${record.status}`) : block;
        })
        .join("\n\n")}\n`,
      "utf8",
    );
  }

  function writeMenoMarginClaim() {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      [
        "```yaml",
        "claim_id: claim_meno_0001",
        "source_work: Meno",
        "stephanus_span: 70a",
        commentaryRefLines("meno", "70a"),
        "speaker: ΜΕΝ.",
        "claim_kind: thesis",
        'content: "Virtue is teachable."',
        "greek_terms: []",
        "final_status: left_standing",
        'limits: "A fixture claim."',
        "review_status: accepted",
        "stance_events: []",
        "```",
      ].join("\n"),
      "utf8",
    );
  }

  it("reading defaults to English with margin records shown", () => {
    writeMenoCommentary(root);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    expect(page).toContain('class="reading lang-english" data-reading');
    expect(page).not.toContain("evidence-off");
    // The language picker is a compact select, not radios.
    expect(page).toContain("data-language-picker");
    expect(page).toContain('<option value="english" selected>English</option>');
    expect(page).toContain('<option value="both">Greek and English</option>');
    // Commentary and margin layers are on by default and toggleable.
    expect(page).toContain("data-commentary-toggle");
    expect(page).toContain("data-margin-toggle");
    expect(page).toContain('class="marks-key"');
    // Both columns are emitted server-side; CSS hides one.
    expect(page).toContain('class="v-greek"');
    expect(page).toContain('class="v-english"');
  });

  it("renders each speaker turn as its own labeled paragraph", () => {
    // Rewrite the raw texts as newline-separated turns with printed speaker
    // forms (Greek sigla, translation abbreviations) BEFORE resolving spans.
    writeFileSync(
      join(root, "raw/plato/greek/meno.txt"),
      "{70a} ΜΕΝ. ἔχεις μοι εἰπεῖν;\nΣΩ. ὦ Μένων, {70b} πειράσομαι.",
      "utf8",
    );
    writeMenoCommentary(root);
    writeFileSync(
      join(root, "raw/plato/english/meno.txt"),
      "{70a} Men. Can you tell me?\nSoc. O Meno, {70b} I will try.",
      "utf8",
    );
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    // Two turn-paired verses, one per exchanged line.
    expect((page.match(/<div class="verse">/gu) ?? []).length).toBe(2);
    // Greek keeps the printed siglum; English expands the curated abbreviation.
    expect(page).toContain('<p lang="grc"><span class="speaker">ΜΕΝ.</span> ἔχεις μοι εἰπεῖν;</p>');
    expect(page).toContain('<span class="speaker">ΣΩ.</span>');
    expect(page).toContain('<p><span class="speaker">Meno</span> Can you tell me?</p>');
    expect(page).toContain('<span class="speaker">Socrates</span>');
    // The mid-turn marker becomes an inline milestone in both languages; the
    // turn is never split at the Stephanus boundary.
    expect((page.match(/<a class="milestone" href="#loc-70b">70b<\/a>/gu) ?? []).length).toBe(2);
    expect(page).toContain('πειράσομαι');
    expect(page).toContain("I will try.");
    // Rail slots anchor each marker once.
    expect((page.match(/id="loc-70a"/gu) ?? []).length).toBe(1);
    expect((page.match(/id="loc-70b"/gu) ?? []).length).toBe(1);
  });

  it("renders accepted records as named margin entries once, on their first slot", () => {
    writeMenoCommentary(root);
    writeMenoObservations([
      { id: "obs_meno_0001", span: "70a" },
      { id: "obs_meno_0002", span: "70a", status: "rejected" },
      { id: "obs_meno_0003", span: "70a-70b" },
    ]);
    writeMenoMarginClaim();
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    // Two accepted observations and the claim, each a collapsed entry in its
    // marker's slot group; the rejected record never renders. The long-span
    // record surfaces only at its FIRST marker: no plain record group opens
    // at 70b (the for-comm group there belongs to the commentary layer).
    expect((page.match(/class="entry rec"/gu) ?? []).length).toBe(3);
    expect(page).toContain('records-part-1.html#obs_meno_0001">Full record</a>');
    expect(page).not.toContain("obs_meno_0002");
    expect(page).toContain('records-part-1.html#obs_meno_0003">Full record</a>');
    expect(page).not.toMatch(/<div class="slot-group">\s*<p class="slot-loc"><a href="#loc-70b">/u);
    // The claim keeps its outlined kind mark; its content opens in the body.
    expect(page).toContain('<span class="mark mark-claim"></span>');
    expect(page).toContain("Virtue is teachable.");
    // Entries share the unit's exclusive-open group; the :target margin-note
    // machinery is gone and bodies float so the dialogue never reflows.
    expect(page).toContain('name="margin-comm_meno_0001"');
    expect(page).not.toContain("margin-note");
    expect(siteCss()).not.toContain(".margin-note:target");
    expect(siteCss()).toContain(".entry[open] > .entry-body { position: absolute;");
    expect(siteCss()).toContain("justify-content: center");
  });

  it("folds margin overflow into a +n link", () => {
    writeMenoCommentary(root);
    writeMenoObservations(
      Array.from({ length: 6 }, (_, index) => ({
        id: `obs_meno_${String(index + 1).padStart(4, "0")}`,
        span: "70a",
      })),
    );
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    // Six records at one marker: three entries render and the rest fold into
    // a link to the records page. The rail slot carries no record marks.
    expect((page.match(/class="entry rec"/gu) ?? []).length).toBe(3);
    expect(page).toContain(">3 more records</a>");
    expect(page).toContain('class="entry-more"');
    expect(page).not.toContain("obs_meno_0004");
    const slot = page.match(/<span class="loc-slot" id="loc-70a">[\s\S]*?<\/span>/u)?.[0] ?? "";
    expect(slot).not.toContain("mark-observation");
  });

  it("drops the picker for Greek-only dialogues", () => {
    writeMenoCommentary(root);
    rmSync(join(root, "raw/plato/english/meno.txt"), { force: true });
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    expect(page).not.toContain("data-language-picker");
    expect(page).toContain('class="reading lang-greek" data-reading');
    expect(page).toContain('data-margin-toggle');
  });

  it("builds the reading page byte-stably", () => {
    writeMenoCommentary(root);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const first = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    const rebuilt = join(root, "site-rebuild-060");
    buildStaticSite({ outDir: rebuilt });
    expect(readFileSync(join(rebuilt, "dialogues/meno/reading.html"), "utf8")).toBe(first);
  });
});

describe("patterns hub (the patterns-hub rollout)", () => {
  function writeStandingContradiction() {
    mkdirSync(join(root, "wiki/claims"), { recursive: true });
    writeFileSync(
      join(root, "wiki/claims/meno.md"),
      [
        "```yaml",
        "claim_id: claim_meno_0001",
        "source_work: Meno",
        "stephanus_span: 70a",
        commentaryRefLines("meno", "70a"),
        "speaker: ΜΕΝ.",
        "claim_kind: thesis",
        'content: "Virtue is teachable."',
        "greek_terms: []",
        "final_status: left_standing",
        'limits: "A fixture claim."',
        "review_status: accepted",
        "stance_events: []",
        "```",
      ].join("\n"),
      "utf8",
    );
    mkdirSync(join(root, "wiki/relations"), { recursive: true });
    writeFileSync(
      join(root, "wiki/relations/meno.md"),
      [
        "```yaml",
        "relation_id: rel_meno_0001",
        "claim_a: claim_meno_0001",
        "claim_b: claim_meno_0001",
        "relation_kind: contradiction",
        "resolution: standing",
        'basis: "A fixture contradiction."',
        'limits: "A fixture."',
        "review_status: accepted",
        "```",
      ].join("\n"),
      "utf8",
    );
  }

  it("leads with recurrence rows, specimens, and the layers appendix", () => {
    writeStandingContradiction();
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "patterns/index.html"), "utf8");
    expect(page).toContain("What recurs, and where");
    expect(page).toContain('class="pat-row"');
    expect(page).toContain("How does question-and-answer testing proceed in this span?");
    // Dialogue names carry evidence links, so match the sentence with tags stripped.
    expect(page.replace(/<[^>]+>/gu, "")).toContain(
      "Strongest in Crito and Meno; attested in 2 of the 3 dialogues.",
    );
    expect(page).toContain("dossiers →");
    expect(page).toContain("Contradictions left standing");
    expect(page).toContain('relations/standing.html">All 1 standing contradiction →</a>');
    // The fixture relation is not a curated specimen, so no cards render.
    expect(page).not.toContain('class="tp-grid"');
    expect(page).toContain("Browse the layers");
    expect(page).toContain("One evidence file per recurring concept");
    // The strip glyphs and the old sections are gone.
    expect(page).not.toContain("Pattern fingerprints");
    expect(page).not.toContain("Recurring functions");
    expect(page).not.toContain("Reference tables");
    expect(page).not.toContain('class="fingerprint"');
    expect(page).not.toContain("<svg");
  });

  it("names strongest dialogues with counts on hover", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "patterns/index.html"), "utf8");
    // bounded_test has one accepted observation in each of crito and meno.
    expect(page).toContain('title="Crito: 1 accepted observation"');
    expect(page).toContain('title="Meno: 1 accepted observation"');
  });

  it("omits the contradictions section when nothing stands", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "patterns/index.html"), "utf8");
    expect(page).not.toContain("Contradictions left standing");
  });

  it("renders curated standing specimens and rejects re-adjudicated ones", () => {
    writeStandingContradiction();
    const specimen = (resolution: string) =>
      [
        "```yaml",
        "relation_id: rel_cross-dialogue_0021",
        "claim_a: claim_meno_0001",
        "claim_b: claim_meno_0001",
        "relation_kind: contradiction",
        `resolution: ${resolution}`,
        'basis: "A curated fixture."',
        'limits: "Both claims are fixtures."',
        "review_status: accepted",
        "```",
      ].join("\n");
    writeFileSync(join(root, "wiki/relations/cross-dialogue.md"), specimen("standing"), "utf8");
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "patterns/index.html"), "utf8");
    expect(page).toContain('class="tp-grid"');
    expect(page).toContain('class="tp-claim">Virtue is teachable.</p>');
    expect(page).toContain('<span class="ref">70a</span>');
    expect(page).toContain("Both claims are fixtures.");
    // A re-adjudicated specimen fails the build instead of lingering.
    writeFileSync(join(root, "wiki/relations/cross-dialogue.md"), specimen("refuted"), "utf8");
    expect(() => buildStaticSite({ outDir: join(root, "site-readjudicated") })).toThrow(
      /no longer an accepted standing contradiction/u,
    );
  });

});

describe("apparatus lane (the apparatus-lane contract)", () => {
  function writeMenoObservationsForMargin(records: Array<{ id: string; span: string; status?: string }>) {
    writeFileSync(
      join(root, "wiki/observations/meno.md"),
      `# Meno Observations\n\n${records
        .map((record) => {
          const yaml = ledgerRecord({ observationId: record.id, span: record.span });
          return record.status ? yaml.replace("review_status: accepted", `review_status: ${record.status}`) : yaml;
        })
        .join("\n\n")}\n`,
      "utf8",
    );
  }

  function writeApparatus(dialogue: string, records: Array<{ id: string; span: string; kind?: string; status?: string; note?: string }>) {
    mkdirSync(join(root, "wiki/apparatus"), { recursive: true });
    writeFileSync(
      join(root, `wiki/apparatus/${dialogue}.md`),
      records
        .map((record) =>
          [
            "```yaml",
            `apparatus_id: ${record.id}`,
            `source_work: ${titleCase(dialogue)}`,
            `kind: ${record.kind ?? "surface_tension"}`,
            `stephanus_span: ${record.span}`,
            commentaryRefLines(dialogue, record.span),
            `note: "${record.note ?? "A careful reader is invited to weigh this span."}"`,
            "cites:",
            "  observations: [obs_meno_0001]",
            "  claims: []",
            "  relations: []",
            "  dossiers: []",
            "author: model",
            `review_status: ${record.status ?? "accepted"}`,
            "```",
          ].join("\n"),
        )
        .join("\n\n"),
      "utf8",
    );
  }

  it("renders signs in the rail while records sit as margin entries", () => {
    writeMenoCommentary(root);
    writeMenoObservationsForMargin([
      { id: "obs_meno_0001", span: "70a" },
      { id: "obs_meno_0002", span: "70a" },
    ]);
    writeApparatus("meno", [{ id: "apx_meno_0001", span: "70a", kind: "surface_tension" }]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    const slot = page.match(/<span class="loc-slot" id="loc-70a">[\s\S]*?<\/span>/u)?.[0] ?? "";
    expect(slot).toContain('class="mark mark-sign" href="#apx_meno_0001"');
    expect(slot).toContain('title="obelus at 70a"');
    // The rail carries locator + sign only; record dots are gone — records
    // are named entries in the margin column.
    expect(slot).not.toContain("mark-observation");
    expect((page.match(/class="entry rec"/gu) ?? []).length).toBe(2);
  });

  it("renders apparatus notes as margin entries with resolving cites", () => {
    writeMenoCommentary(root);
    writeApparatus("meno", [{ id: "apx_meno_0001", span: "70a" }]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    expect(page).toContain('<details class="entry apparatus" name="margin-comm_meno_0001" id="apx_meno_0001"');
    expect(page).toContain('<div class="slot-group for-app">');
    expect(page).toContain("A careful reader is invited to weigh this span.");
    expect(page).toContain("records-part-1.html#obs_meno_0001");
    expect(siteCss()).not.toContain(".apparatus-note:target");
  });

  it("renders only accepted apparatus records", () => {
    writeMenoCommentary(root);
    writeApparatus("meno", [
      { id: "apx_meno_0001", span: "70a", status: "unreviewed" },
      { id: "apx_meno_0002", span: "70a", status: "rejected" },
    ]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    expect(page).not.toContain("mark-sign");
    expect(page).not.toContain("apparatus-note");
  });

  it("keeps the apparatus lane out of every index", () => {
    writeMenoCommentary(root);
    writeApparatus("meno", [{ id: "apx_meno_0001", span: "70a" }]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    for (const file of listFiles(join(outDir, "assets")).filter((path) => path.endsWith(".json"))) {
      expect(readFileSync(join(outDir, "assets", file), "utf8")).not.toContain("apx_");
    }
  });

  it("keeps signs visible under the evidence toggle", () => {
    writeMenoCommentary(root);
    writeApparatus("meno", [{ id: "apx_meno_0001", span: "70a" }]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    // Margin records hides only plain record groups; the apparatus lane
    // (for-app) belongs to neither reader toggle.
    expect(siteCss()).toContain(".reading.marks-off .slot-group:not(.for-comm):not(.for-app) { display: none; }");
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    const slot = page.match(/<span class="loc-slot" id="loc-70a">[\s\S]*?<\/span>/u)?.[0] ?? "";
    expect(slot).toContain("mark-sign");
    expect(slot).toContain('class="loc"');
  });

  it("never names the interpretive tradition in the apparatus rendering", () => {
    writeMenoCommentary(root);
    writeApparatus("meno", [{ id: "apx_meno_0001", span: "70a" }]);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    // about.html carries the extraction protocol's founding-stance disclaimer
    // ("not an esotericism detector") and observation limits fields legitimately
    // renounce the word; the sweep guards that the apparatus layer itself — the
    // signs, notes, and reading pages — never names the tradition.
    for (const file of listFiles(outDir).filter((path) => path.endsWith(".html") && path !== "about.html")) {
      expect(readFileSync(join(outDir, file), "utf8")).not.toMatch(/esoteric|strauss/iu);
    }
  });

  it("is byte-invisible when the lane is empty", () => {
    writeMenoCommentary(root);
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const page = readFileSync(join(outDir, "dialogues/meno/reading.html"), "utf8");
    expect(page).not.toContain("mark-sign");
    expect(page).not.toContain("apparatus-note");
  });

  it("throws when apparatus records have no reading page", () => {
    // crito has no commentary in the fixture, so no reading page exists.
    writeApparatus("crito", [{ id: "apx_crito_0001", span: "44a" }]);
    expect(() => buildStaticSite({ outDir: join(root, "site") })).toThrow(/no reading page target/u);
  });

  it("throws when apparatus records have only rejected commentary targets", () => {
    writeMenoCommentary(root);
    const commentaryPath = join(root, "wiki/commentary/meno.md");
    writeFileSync(
      commentaryPath,
      readFileSync(commentaryPath, "utf8").replaceAll(
        /review_status: (?:accepted|unreviewed)/gu,
        "review_status: rejected",
      ),
      "utf8",
    );
    writeApparatus("meno", [{ id: "apx_meno_0001", span: "70a" }]);
    expect(() => buildStaticSite({ outDir: join(root, "site") })).toThrow(/no reading page target/u);
  });
});

describe("dialogue pages v3.3 (the dialogue-pages v3.3 rollout)", () => {
  it("splits the overview and emits a records page", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });

    // The records page is emitted and carries its own instrument + layer list.
    const records = readFileSync(join(outDir, "dialogues/meno/records.html"), "utf8");
    expect(existsSync(join(outDir, "dialogues/meno/records.html"))).toBe(true);
    expect(records).toContain("<h1>Records &amp; data</h1>");
    expect(records).toContain("What is recorded");
    expect(records).toContain("Observation records");

    // The overview drops the stats tables and the #data link closet.
    const overview = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    expect(overview).not.toContain("<table");
    expect(overview).not.toContain('id="data"');
    expect(overview).not.toContain('href="#data"');
    expect(overview).toContain("<h2>Voices</h2>");
    expect(overview).toContain('class="doors"');
    expect(overview).toContain('dialogues/meno/records.html');
  });

  it("keeps reader-facing part-1 out of the records page text", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const records = readFileSync(join(outDir, "dialogues/meno/records.html"), "utf8");
    // The shard href may carry records-part-1.html, but no visible text does.
    const visible = records.replace(/<[^>]+>/gu, " ");
    expect(visible).not.toContain("part-1");
  });

  it("holds axis and concept chips within the summed display budget", () => {
    const outDir = join(root, "site");
    buildStaticSite({ outDir });
    const overview = readFileSync(join(outDir, "dialogues/meno/index.html"), "utf8");
    const rows = overview.match(/<div class="lgr-row">[\s\S]*?<\/div>\s*<\/div>/gu) ?? [];
    let checkedARow = false;
    for (const row of rows) {
      const tagBlock = /<div class="tags">([\s\S]*?)<\/div>/u.exec(row)?.[1];
      if (!tagBlock) continue;
      const chips = [...tagBlock.matchAll(/<a class="tag(?: more)?"[^>]*>([^<]*)<\/a>/gu)].map((m) => m[1] ?? "");
      // Always at least one chip.
      expect(chips.length).toBeGreaterThan(0);
      // Excluding the "+ N more" closer, the summed display characters fit one line.
      const summed = chips
        .filter((chip) => !/^\+ \d+ more$/u.test(chip))
        .reduce((total, chip) => total + chip.length, 0);
      expect(summed).toBeLessThanOrEqual(72);
      checkedARow = true;
    }
    expect(checkedARow).toBe(true);
  });
});

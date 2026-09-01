import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeCommentaryBriefs } from "./commentary-briefs.js";
import { setRepoRootForTesting } from "./paths.js";
import { resolveSourceSpan } from "./source.js";
import { writeOntologyVNextFixture } from "../test-support/ontology-vnext-fixture.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function refLines(span: string) {
  const ref = resolveSourceSpan("fixture", span).source_ref;
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

function sectionBlock(id: string, title: string, span: string) {
  return [
    "```yaml",
    `commentary_id: ${id}`,
    "source_work: Fixture",
    "block_kind: section",
    "placement: before",
    `title: "${title}"`,
    `stephanus_span: ${span}`,
    refLines(span),
    'body: "Unit prose."',
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: model",
    "review_status: unreviewed",
    "```",
  ].join("\n");
}

function observationBlock(id: string, span: string, status = "accepted") {
  const ref = resolveSourceSpan("fixture", span).source_ref;
  return [
    "```yaml",
    `observation_id: ${id}`,
    'observation: "An observation about the frame."',
    'limits: "Limits text."',
    "source_ref:",
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `review_status: ${status}`,
    "```",
  ].join("\n");
}

function claimBlock(id: string, span: string, status = "accepted") {
  const ref = resolveSourceSpan("fixture", span).source_ref;
  return [
    "```yaml",
    `claim_id: ${id}`,
    "claim_kind: thesis",
    "speaker: SPK.",
    'content: "A claim about the passage."',
    "final_status: left_standing",
    "source_ref:",
    `  start_char: ${ref.start_char}`,
    `  end_char: ${ref.end_char}`,
    `review_status: ${status}`,
    "```",
  ].join("\n");
}

function relationBlock(id: string, claimA: string, claimB: string) {
  return [
    "```yaml",
    `relation_id: ${id}`,
    `claim_a: ${claimA}`,
    `claim_b: ${claimB}`,
    "relation_kind: restatement",
    "resolution: standing",
    'basis: "Both claims restate the frame thesis."',
    "review_status: accepted",
    "```",
  ].join("\n");
}

function writeFixtureRepo({ withEnglish = true } = {}) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), "{2a} alpha {2b} beta {3a} gamma {3b} delta", "utf8");
  if (withEnglish) {
    mkdirSync(join(root, "raw/plato/english"), { recursive: true });
    writeFileSync(join(root, "raw/plato/english/fixture.txt"), "{2a} first {3a} third {3b} fourth", "utf8");
  }

  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  writeFileSync(
    join(root, "wiki/commentary/fixture.md"),
    `# fixture\n\n${sectionBlock("comm_fixture_0001", "One", "2a-2b")}\n\n${sectionBlock("comm_fixture_0002", "Two", "3a-3b")}\n`,
    "utf8",
  );

  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/observations/fixture.md"),
    // The 2b-3a observation straddles the unit boundary and must appear in both briefs.
    `# obs\n\n${observationBlock("obs_fixture_0001", "2b-3a")}\n\n${observationBlock("obs_fixture_0002", "3b", "unreviewed")}\n`,
    "utf8",
  );

  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(join(root, "wiki/claims/fixture.md"), `# claims\n\n${claimBlock("claim_fixture_0001", "2a")}\n`, "utf8");

  mkdirSync(join(root, "wiki/relations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/relations/fixture.md"),
    `# rels\n\n${relationBlock("rel_fixture_0001", "claim_fixture_0001", "claim_fixture_0099")}\n`,
    "utf8",
  );

  writeOntologyVNextFixture(root);
}

describe("commentary briefs", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-briefs-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("writes one deterministic brief per section with spine and record tables", () => {
    writeFixtureRepo();

    const results = writeCommentaryBriefs("fixture");
    expect(results.map((brief) => brief.path)).toEqual([
      "scratch/commentary/briefs/fixture/01-2a-2b.md",
      "scratch/commentary/briefs/fixture/02-3a-3b.md",
    ]);

    const first = readFileSync(join(root, results[0]!.path), "utf8");
    expect(first).toContain("# Brief 01: One");
    expect(first).toContain("## Existing section commentary");
    expect(first).toContain("### One");
    expect(first).toContain("Unit prose.");
    expect(first).toContain("### {2a}");
    expect(first).toContain("{2a} alpha");
    expect(first).toContain("{2a} first");
    expect(first).toContain("obs_fixture_0001");
    expect(first).toContain("claim_fixture_0001 (thesis, SPK., left_standing)");
    expect(first).toContain("rel_fixture_0001 (restatement, standing)");
    expect(first).toContain("- wiki/dossiers/reported_frame_structure/reported_dialogue_frame.json");

    const second = readFileSync(join(root, results[1]!.path), "utf8");
    expect(second).toContain("obs_fixture_0001");
    expect(second).not.toContain("obs_fixture_0002");
    expect(second).not.toContain("claim_fixture_0001 (");
    // English file has no {3a}? It does; the missing-marker join is covered below.

    const firstRun = readFileSync(join(root, results[0]!.path), "utf8");
    const stalePath = join(root, "scratch/commentary/briefs/fixture/99-stale.md");
    writeFileSync(stalePath, "stale\n", "utf8");
    writeCommentaryBriefs("fixture");
    expect(readFileSync(join(root, results[0]!.path), "utf8")).toBe(firstRun);
    expect(existsSync(stalePath)).toBe(false);
  });

  it("tolerates a missing English source and missing English markers", () => {
    writeFixtureRepo({ withEnglish: false });

    const results = writeCommentaryBriefs("fixture");
    const first = readFileSync(join(root, results[0]!.path), "utf8");
    expect(first).toContain("(no English source imported for this dialogue)");

    mkdirSync(join(root, "raw/plato/english"), { recursive: true });
    writeFileSync(join(root, "raw/plato/english/fixture.txt"), "{2a} first {3a} third {3b} fourth", "utf8");
    const withEnglish = readFileSync(
      join(root, writeCommentaryBriefs("fixture")[0]!.path),
      "utf8",
    );
    expect(withEnglish).toContain("### {2b}");
    expect(withEnglish).toContain("(no English marker; covered by the previous slice)");
  });

  it("errors cleanly when the ledger has no section blocks", () => {
    writeFixtureRepo();
    writeFileSync(join(root, "wiki/commentary/fixture.md"), "# fixture\n", "utf8");

    expect(() => writeCommentaryBriefs("fixture")).toThrow(/no section blocks/);
  });

  it("errors cleanly when the ledger does not exist", () => {
    writeFixtureRepo();
    rmSync(join(root, "wiki/commentary/fixture.md"));

    expect(() => writeCommentaryBriefs("fixture")).toThrow(/does not exist/);
  });
});

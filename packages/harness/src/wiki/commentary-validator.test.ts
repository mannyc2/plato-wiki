import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { commentaryMarkdownBlocks, listCommentaryLedgerPaths } from "./commentary-ledger.js";
import { validateCommentaryLedger, workNameToSlug } from "./commentary-validator.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;
let attributionSha = "";
let englishSha = "";

const LEDGER_PATH = "wiki/commentary/fixture.md";

function writeRepoFixture() {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(
    join(root, "raw/plato/greek/fixture.txt"),
    "{2a} alpha ἀρχή {2b} beta {3a} gamma {4a} delta",
    "utf8",
  );
  writeFileSync(join(root, "raw/plato/greek/other.txt"), "{5a} epsilon {5b} zeta", "utf8");
  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  const english = "{2a} Alpha asks. {2b} Beta answers.\n{3a} Gamma replies.\n{4a} Delta closes.";
  englishSha = digest(english);
  mkdirSync(join(root, "raw/plato/english"), { recursive: true });
  writeFileSync(join(root, "raw/plato/english/fixture.txt"), english, "utf8");
  const split = english.indexOf("{3a}");
  const attribution = `${JSON.stringify({
    schema_version: 2,
    dialogue: "fixture",
    english_sha256: englishSha,
    status: "accepted",
    segments: [
      { id: "turn_fixture_audio_0001", start_char: 0, end_char: split, character_id: "socrates" },
      { id: "turn_fixture_audio_0002", start_char: split, end_char: english.length, character_id: "interlocutor" },
    ],
  }, null, 2)}\n`;
  attributionSha = digest(attribution);
  mkdirSync(join(root, "audio/speaker-attributions"), { recursive: true });
  writeFileSync(join(root, "audio/speaker-attributions/fixture.json"), attribution, "utf8");

  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/observations/fixture.md"),
    "```yaml\nobservation_id: obs_fixture_0001\nreview_status: accepted\n```\n\n```yaml\nobservation_id: obs_fixture_0002\nreview_status: unreviewed\n```\n",
    "utf8",
  );
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(
    join(root, "wiki/claims/fixture.md"),
    "```yaml\nclaim_id: claim_fixture_0001\nreview_status: accepted\n```\n",
    "utf8",
  );
  mkdirSync(join(root, "wiki/relations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/relations/fixture.md"),
    "```yaml\nrelation_id: rel_fixture_0001\nreview_status: accepted\n```\n",
    "utf8",
  );
  mkdirSync(join(root, "wiki/dossiers/frame_depth"), { recursive: true });
  writeFileSync(join(root, "wiki/dossiers/frame_depth/reported_dialogue_frame.md"), "# dossier\n", "utf8");
}

function refLines(slug: string, span: string) {
  const ref = resolveSourceSpan(slug, span).source_ref;
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

type BlockOptions = {
  id: string;
  kind?: string;
  placement?: string;
  title?: string;
  span?: string;
  work?: string;
  body?: string;
  cites?: string;
  crossrefs?: string;
  author?: string;
  review?: string;
  sourceRef?: string;
  audioInsertion?: string;
  extraFields?: string;
  omit?: string[];
};

function block(options: BlockOptions) {
  const span = options.span ?? "2a-2b";
  const omit = new Set(options.omit ?? []);
  const lines: string[] = [];
  const push = (field: string, value: string | undefined) => {
    if (omit.has(field) || value === undefined) return;
    lines.push(value);
  };

  push("commentary_id", `commentary_id: ${options.id}`);
  push("source_work", `source_work: ${options.work ?? "Fixture"}`);
  push("block_kind", `block_kind: ${options.kind ?? "context"}`);
  push("placement", `placement: ${options.placement ?? "before"}`);
  if (options.title !== undefined && !omit.has("title")) {
    lines.push(`title: "${options.title}"`);
  }
  push("stephanus_span", `stephanus_span: ${span}`);
  push("source_ref", options.sourceRef ?? refLines("fixture", span));
  push("audio_insertion", options.audioInsertion);
  push("body", `body: "${options.body ?? "Teaching prose for the reader."}"`);
  push(
    "cites",
    options.cites ?? ["cites:", "  observations: []", "  claims: []", "  relations: []", "  dossiers: []"].join("\n"),
  );
  push("crossrefs", options.crossrefs ?? "crossrefs: []");
  push("author", `author: ${options.author ?? "model"}`);
  push("review_status", `review_status: ${options.review ?? "unreviewed"}`);
  if (options.extraFields) {
    lines.push(options.extraFields);
  }

  return "```yaml\n" + lines.join("\n") + "\n```\n";
}

function audioInsertion(turnId: string, edge: "before" | "after", overrides: string[] = []) {
  return [
    "audio_insertion:",
    "  attribution_path: audio/speaker-attributions/fixture.json",
    `  attribution_sha256: "${attributionSha}"`,
    `  english_sha256: "${englishSha}"`,
    `  turn_id: ${turnId}`,
    `  edge: ${edge}`,
    ...overrides,
  ].join("\n");
}

function sections() {
  return [
    block({ id: "comm_fixture_0001", kind: "section", title: "Opening", span: "2a-2b" }),
    block({ id: "comm_fixture_0002", kind: "section", title: "Middle", span: "3a" }),
  ];
}

function ledger(...blocks: string[]) {
  return "# Fixture commentary\n\n" + blocks.join("\n");
}

function codes(content: string) {
  return validateCommentaryLedger(LEDGER_PATH, content).map((issue) => issue.code);
}

describe("commentary validator", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-validator-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeRepoFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("accepts a happy multi-block ledger", () => {
    const crossrefs = [
      "crossrefs:",
      "  - source_work: Other",
      "    stephanus_span: 5a",
      refLines("other", "5a")
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
      '    note: "a related passage"',
    ].join("\n");
    const cites = [
      "cites:",
      "  observations: [obs_fixture_0001]",
      "  claims: [claim_fixture_0001]",
      "  relations: [rel_fixture_0001]",
      "  dossiers: [frame_depth/reported_dialogue_frame]",
    ].join("\n");

    const content = ledger(
      ...sections(),
      block({ id: "comm_fixture_0003", kind: "argument", span: "2a", cites }),
      block({ id: "comm_fixture_0004", kind: "crossref", span: "3a", placement: "after", crossrefs }),
      block({ id: "comm_fixture_0005", kind: "question", span: "2b", body: "What does the frame conceal?" }),
    );

    expect(validateCommentaryLedger(LEDGER_PATH, content)).toEqual([]);
  });

  it("flags missing_field", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", omit: ["author"] })))).toContain(
      "missing_field",
    );
  });

  it("flags unknown_field", () => {
    expect(
      codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", extraFields: "speaker: nobody" }))),
    ).toContain("unknown_field");
  });

  it("flags id_format", () => {
    expect(codes(ledger(block({ id: "comm_fixture_1", kind: "section", title: "Opening" })))).toContain("id_format");
  });

  it("flags id_sequence", () => {
    expect(codes(ledger(block({ id: "comm_fixture_0002", kind: "section", title: "Opening" })))).toContain(
      "id_sequence",
    );
  });

  it("flags source_work_mismatch", () => {
    expect(codes(ledger(block({ id: "comm_fixture_0001", kind: "section", title: "Opening", work: "Republic" })))).toContain(
      "source_work_mismatch",
    );
  });

  it("flags span_invalid", () => {
    const content = ledger(
      ...sections(),
      block({ id: "comm_fixture_0003", span: "9a", sourceRef: refLines("fixture", "2a") }),
    );
    expect(codes(content)).toContain("span_invalid");
  });

  it("flags source_ref_mismatch", () => {
    const tampered = refLines("fixture", "2a").replace(/start_char: \d+/u, "start_char: 999");
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", sourceRef: tampered })))).toContain(
      "source_ref_mismatch",
    );
  });

  it("flags block_kind_invalid", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", kind: "aside" })))).toContain(
      "block_kind_invalid",
    );
  });

  it("flags placement_invalid for bad values and after-sections", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", placement: "middle" })))).toContain(
      "placement_invalid",
    );
    expect(
      codes(ledger(block({ id: "comm_fixture_0001", kind: "section", title: "Opening", placement: "after" }))),
    ).toContain("placement_invalid");
  });

  it("accepts exact audio insertion boundaries on section and non-section blocks", () => {
    const content = ledger(
      block({
        id: "comm_fixture_0001",
        kind: "section",
        title: "Opening",
        span: "2a-2b",
      }),
      block({
        id: "comm_fixture_0002",
        kind: "section",
        title: "Middle",
        span: "3a",
        audioInsertion: audioInsertion("turn_fixture_audio_0002", "before"),
      }),
      block({
        id: "comm_fixture_0003",
        kind: "notice",
        placement: "after",
        span: "2a",
        audioInsertion: audioInsertion("turn_fixture_audio_0001", "after"),
      }),
    );

    expect(validateCommentaryLedger(LEDGER_PATH, content)).toEqual([]);
  });

  it("fails closed on stale hashes, absent turns, and placement-mismatched audio boundaries", () => {
    const stale = audioInsertion("turn_fixture_audio_0001", "after").replace(
      attributionSha,
      "0".repeat(64),
    );
    expect(
      codes(ledger(...sections(), block({ id: "comm_fixture_0003", placement: "after", span: "2a", audioInsertion: stale }))),
    ).toContain("audio_insertion_invalid");
    expect(
      codes(ledger(...sections(), block({
        id: "comm_fixture_0003",
        placement: "after",
        span: "2a",
        audioInsertion: audioInsertion("turn_fixture_missing", "after"),
      }))),
    ).toContain("audio_insertion_invalid");
    expect(
      codes(ledger(...sections(), block({
        id: "comm_fixture_0003",
        placement: "after",
        span: "2a",
        audioInsertion: audioInsertion("turn_fixture_audio_0001", "before"),
      }))),
    ).toContain("audio_insertion_invalid");
  });

  it("keeps rejected provenance terminal while still enforcing audio insertion on active blocks", () => {
    const stale = audioInsertion("turn_fixture_audio_0001", "after").replace(
      attributionSha,
      "0".repeat(64),
    );
    const rejected = ledger(
      ...sections(),
      block({
        id: "comm_fixture_0003",
        placement: "after",
        span: "2a",
        audioInsertion: stale,
        review: "rejected",
      }),
    );
    expect(commentaryMarkdownBlocks(rejected).map((entry) => entry.commentaryId)).toEqual([
      "comm_fixture_0001",
      "comm_fixture_0002",
      "comm_fixture_0003",
    ]);
    expect(codes(rejected)).not.toContain("audio_insertion_invalid");

    const accepted = rejected.replace("review_status: rejected", "review_status: accepted");
    expect(codes(accepted)).toContain("audio_insertion_invalid");
  });

  it("flags section_title both ways", () => {
    expect(codes(ledger(block({ id: "comm_fixture_0001", kind: "section" })))).toContain("section_title");
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", title: "No titles here" })))).toContain(
      "section_title",
    );
  });

  it("flags section_order for non-ascending sections", () => {
    const content = ledger(
      block({ id: "comm_fixture_0001", kind: "section", title: "One", span: "2a-2b" }),
      block({ id: "comm_fixture_0002", kind: "section", title: "Two", span: "2a-2b" }),
    );
    expect(codes(content)).toContain("section_order");
  });

  it("flags section_overlap", () => {
    const content = ledger(
      block({ id: "comm_fixture_0001", kind: "section", title: "One", span: "2a-2b" }),
      block({ id: "comm_fixture_0002", kind: "section", title: "Two", span: "2b-3a" }),
    );
    expect(codes(content)).toContain("section_overlap");
  });

  it("flags orphan_block", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "4a" })))).toContain("orphan_block");
  });

  it("flags crossref_empty", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", kind: "crossref" })))).toContain(
      "crossref_empty",
    );
  });

  it("flags crossref_work_unknown", () => {
    const crossrefs = [
      "crossrefs:",
      "  - source_work: Atlantis",
      "    stephanus_span: 5a",
      refLines("other", "5a")
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
    ].join("\n");
    expect(
      codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", kind: "crossref", crossrefs }))),
    ).toContain("crossref_work_unknown");
  });

  it("flags crossref_ref_mismatch", () => {
    const crossrefs = [
      "crossrefs:",
      "  - source_work: Other",
      "    stephanus_span: 5b",
      refLines("other", "5a")
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
    ].join("\n");
    expect(
      codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", kind: "crossref", crossrefs }))),
    ).toContain("crossref_ref_mismatch");
  });

  it("flags cite_unknown_id", () => {
    const cites = ["cites:", "  observations: [obs_fixture_9999]", "  claims: []", "  relations: []", "  dossiers: []"].join(
      "\n",
    );
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", cites })))).toContain(
      "cite_unknown_id",
    );
  });

  it("flags cite_not_accepted", () => {
    const cites = ["cites:", "  observations: [obs_fixture_0002]", "  claims: []", "  relations: []", "  dossiers: []"].join(
      "\n",
    );
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", cites })))).toContain(
      "cite_not_accepted",
    );
  });

  it("flags cite_dossier_missing", () => {
    const cites = ["cites:", "  observations: []", "  claims: []", "  relations: []", "  dossiers: [frame_depth/missing_label]"].join(
      "\n",
    );
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", cites })))).toContain(
      "cite_dossier_missing",
    );
  });

  it("flags body_empty", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", body: "" })))).toContain(
      "body_empty",
    );
  });

  it("accumulates active listener-prose faults in bodies and titles", () => {
    const content = ledger(
      block({
        id: "comm_fixture_0001",
        kind: "section",
        title: "Opening claim_fixture_0001",
        span: "2a-2b",
      }),
      block({ id: "comm_fixture_0002", kind: "section", title: "Middle", span: "3a" }),
      block({
        id: "comm_fixture_0003",
        span: "2a",
        body: "The observation obs_fixture_0001 remains an internal drafting reference",
      }),
    );
    const listenerIssues = validateCommentaryLedger(LEDGER_PATH, content).filter((issue) =>
      issue.code === "title_internal_id" ||
      issue.code === "body_internal_id" ||
      issue.code === "body_incomplete_sentence"
    );

    expect(listenerIssues.map((issue) => [issue.commentaryId, issue.code])).toEqual([
      ["comm_fixture_0001", "title_internal_id"],
      ["comm_fixture_0003", "body_internal_id"],
      ["comm_fixture_0003", "body_incomplete_sentence"],
    ]);
    expect(listenerIssues[1]?.message).toContain("obs_fixture_0001");
  });

  it("keeps rejected listener prose as terminal provenance", () => {
    const rejected = block({
      id: "comm_fixture_0003",
      span: "2a",
      body: "Draft reference obs_fixture_0001",
      review: "rejected",
    });
    const listenerCodes = codes(ledger(...sections(), rejected)).filter((code) =>
      code === "body_internal_id" || code === "body_incomplete_sentence"
    );

    expect(listenerCodes).toEqual([]);
  });

  it("flags body_greek_run over the 80-char limit but allows short inline Greek", () => {
    const shortGreek = block({ id: "comm_fixture_0003", span: "2a", body: "Note the word ἀρχή here." });
    expect(codes(ledger(...sections(), shortGreek))).toEqual([]);

    const longGreek = block({ id: "comm_fixture_0003", span: "2a", body: `Quoting: ${"ἀλήθεια ".repeat(12)}` });
    expect(codes(ledger(...sections(), longGreek))).toContain("body_greek_run");
  });

  it("flags author_invalid", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", author: "claude" })))).toContain(
      "author_invalid",
    );
  });

  it("flags review_status_invalid", () => {
    expect(codes(ledger(...sections(), block({ id: "comm_fixture_0003", span: "2a", review: "maybe" })))).toContain(
      "review_status_invalid",
    );
  });
});

describe("commentary ledger helpers", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-ledger-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("lists ledger paths and parses block ids", () => {
    expect(listCommentaryLedgerPaths()).toEqual([]);

    mkdirSync(join(root, "wiki/commentary"), { recursive: true });
    writeFileSync(
      join(root, "wiki/commentary/fixture.md"),
      "# x\n\n```yaml\ncommentary_id: comm_fixture_0001\n```\n",
      "utf8",
    );

    expect(listCommentaryLedgerPaths()).toEqual(["wiki/commentary/fixture.md"]);
    const blocks = commentaryMarkdownBlocks("```yaml\ncommentary_id: comm_fixture_0001\n```\n");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.commentaryId).toBe("comm_fixture_0001");
  });

  it("normalizes work names to slugs", () => {
    expect(workNameToSlug("Symposium")).toBe("symposium");
    expect(workNameToSlug("Greater Hippias")).toBe("greater-hippias");
  });
});

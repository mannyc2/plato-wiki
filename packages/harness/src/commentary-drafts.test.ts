import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importCommentaryDraft, importCommentaryDraftBatch } from "./commentary-drafts.js";
import { formatTurnIndexToon } from "./derived/turns.js";
import { setRepoRootForTesting } from "./paths.js";
import { readSubmissions } from "./submissions.js";
import { resolveSourceSpan } from "./source.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function sourceRefLines(dialogue: string, span: string) {
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

function sectionBlock() {
  return [
    "```yaml",
    "commentary_id: comm_fixture_0001",
    "source_work: Fixture",
    "block_kind: section",
    "placement: before",
    'title: "Opening"',
    "stephanus_span: 2a-2b",
    sourceRefLines("fixture", "2a-2b"),
    'body: "The opening unit."',
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "author: operator",
    "review_status: unreviewed",
    "```",
  ].join("\n");
}

function validDraft() {
  return {
    schema_version: 1,
    dialogue: "fixture",
    unit_key: "opening-2a-2b",
    section_id: "comm_fixture_0001",
    authoring: { model: "gpt-5.6-luna", effort: "medium" },
    blocks: [
      {
        block_kind: "context",
        placement: "before",
        stephanus_span: "2a",
        body: "Notice how the opening establishes the frame.",
        cites: {
          observations: ["obs_fixture_0001"],
          claims: [],
          relations: [],
          dossiers: [],
        },
        crossrefs: [],
      },
      {
        block_kind: "crossref",
        placement: "after",
        stephanus_span: "2b",
        body: "Compare the related turn in the other dialogue.",
        cites: { observations: [], claims: [], relations: [], dossiers: [] },
        crossrefs: [{ source_work: "Other", stephanus_span: "5a", note: "A related opening." }],
      },
    ],
  };
}

function writeDraft(value: unknown, fileName = "opening-2a-2b.json") {
  const directory = join(root, "scratch/commentary/drafts/fixture");
  mkdirSync(directory, { recursive: true });
  const path = join(directory, fileName);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return `scratch/commentary/drafts/fixture/${fileName}`;
}

function writeRepoFixture() {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  const source = "{2a} alpha {2b} beta {3a} gamma";
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), source, "utf8");
  writeFileSync(join(root, "raw/plato/greek/other.txt"), "{5a} delta {5b} epsilon", "utf8");

  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  const english = "{2a} Alpha asks. {2b} Beta answers. {3a} Gamma closes.";
  mkdirSync(join(root, "raw/plato/english"), { recursive: true });
  writeFileSync(join(root, "raw/plato/english/fixture.txt"), english, "utf8");
  mkdirSync(join(root, "audio/speaker-attributions"), { recursive: true });
  const englishTurnBoundary = english.indexOf("{3a}");
  const attribution = {
    schema_version: 2,
    dialogue: "fixture",
    english_sha256: digest(english),
    status: "accepted",
    segments: [
      { id: "turn_fixture_audio_0001", start_char: 0, end_char: englishTurnBoundary, character_id: "socrates" },
      { id: "turn_fixture_audio_0002", start_char: englishTurnBoundary, end_char: english.length, character_id: "crito" },
    ],
  };
  writeFileSync(
    join(root, "audio/speaker-attributions/fixture.json"),
    `${JSON.stringify(attribution, null, 2)}\n`,
    "utf8",
  );
  const sigla = "fixture sigla registry\n";
  const turnBoundary = source.indexOf("{3a}");
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(join(root, "derived/plato/turns/sigla.toml"), sigla, "utf8");
  writeFileSync(
    join(root, "derived/plato/turns/fixture.toon"),
    formatTurnIndexToon({
      dialogue: "fixture",
      sourcePath: "raw/plato/greek/fixture.txt",
      sourceSha256: digest(source),
      siglaPath: "derived/plato/turns/sigla.toml",
      siglaSha256: digest(sigla),
      turns: [
        {
          turnId: "turn_fixture_0001",
          speaker: "A.",
          startMarker: "2a",
          endMarker: "2b",
          startChar: 0,
          endChar: turnBoundary,
          textSha256: digest(source.slice(0, turnBoundary)),
          greekCharCount: 0,
        },
        {
          turnId: "turn_fixture_0002",
          speaker: "B.",
          startMarker: "3a",
          endMarker: "3a",
          startChar: turnBoundary,
          endChar: source.length,
          textSha256: digest(source.slice(turnBoundary)),
          greekCharCount: 0,
        },
      ],
    }),
    "utf8",
  );

  mkdirSync(join(root, "wiki/commentary"), { recursive: true });
  writeFileSync(join(root, "wiki/commentary/fixture.md"), `# Fixture commentary\n\n${sectionBlock()}\n`, "utf8");

  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/observations/fixture.md"),
    "```yaml\nobservation_id: obs_fixture_0001\nreview_status: accepted\n```\n",
    "utf8",
  );
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  mkdirSync(join(root, "wiki/relations"), { recursive: true });
}

function acceptedAudioInsertion(edge: "before" | "after" = "after") {
  const attributionPath = "audio/speaker-attributions/fixture.json";
  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  return {
    attribution_path: attributionPath,
    attribution_sha256: digest(readFileSync(join(root, attributionPath), "utf8")),
    english_sha256: digest(readFileSync(join(root, "raw/plato/english/fixture.txt"), "utf8")),
    turn_id: "turn_fixture_audio_0001",
    edge,
  };
}

describe("commentary draft importer", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "commentary-drafts-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeRepoFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("previews deterministic ids and exact source refs without mutating the ledger by default", () => {
    const draftPath = writeDraft(validDraft());
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");

    const result = importCommentaryDraft({ dialogue: "fixture", draftPath });

    expect(result.applied).toBe(false);
    expect(result.blockIds).toEqual(["comm_fixture_0002", "comm_fixture_0003"]);
    expect(result.renderedBlocks).toContain("commentary_id: comm_fixture_0002");
    expect(result.renderedBlocks).toContain("commentary_id: comm_fixture_0003");
    expect(result.renderedBlocks).toContain("start_char: 0");
    expect(result.renderedBlocks).toContain(resolveSourceSpan("fixture", "2a").source_ref.text_sha256);
    expect(result.renderedBlocks).toContain(resolveSourceSpan("other", "5a").source_ref.text_sha256);
    expect(result.renderedBlocks).toContain("author: model");
    expect(result.renderedBlocks).toContain("review_status: unreviewed");
    expect(readFileSync(ledgerPath, "utf8")).toBe(before);
  });

  it("appends the validated preview only when apply is explicit", () => {
    const draftPath = writeDraft(validDraft());
    const before = readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8");

    const result = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const content = readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8");

    expect(result.applied).toBe(true);
    expect(content.startsWith(before)).toBe(true);
    expect(content).toBe(result.prospectiveLedger);
    expect(content.match(/commentary_id:/gu)?.length).toBe(3);
  });

  it("records the applied draft as tracked provenance outside scratch", () => {
    const draft = validDraft();
    const draftPath = writeDraft(draft);
    const before = readFileSync(join(root, "wiki/commentary/fixture.md"), "utf8");

    const result = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const [submission, ...rest] = readSubmissions("commentary", "fixture");

    expect(rest).toEqual([]);
    expect(submission!.submission_id).toBe(`0001-draft-${result.unitKey}`);
    expect(submission!.kind).toBe("draft");
    expect(submission!.source_path).toBe(result.draftPath);
    expect(submission!.source_sha256).toBe(result.draftSha256);
    expect(submission!.target_path).toBe("wiki/commentary/fixture.md");
    expect(submission!.target_sha256_before).toBe(createHash("sha256").update(before).digest("hex"));
    expect(submission!.target_sha256_after).toBe(
      createHash("sha256").update(result.prospectiveLedger).digest("hex"),
    );
    expect(submission!.applied_ids).toEqual(result.blockIds);
    expect(submission!.submission).toEqual(draft);
  });

  it("does not record a submission for a preview", () => {
    importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(validDraft()) });

    expect(readSubmissions("commentary", "fixture")).toEqual([]);
  });

  it("records and replays an explicit zero-block draft without adding YAML blocks", () => {
    const draft = validDraft();
    draft.blocks = [];
    const draftPath = writeDraft(draft);
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");

    const preview = importCommentaryDraft({ dialogue: "fixture", draftPath });
    const applied = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const afterApply = readFileSync(ledgerPath, "utf8");
    const replay = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });

    expect(preview.blockIds).toEqual([]);
    expect(preview.renderedBlocks).toBe("");
    expect(preview.replayed).toBe(false);
    expect(preview.prospectiveLedger).not.toBe(before);
    expect(preview.prospectiveLedger).toContain("block_ids=none");
    expect(applied.applied).toBe(true);
    expect(afterApply).toBe(preview.prospectiveLedger);
    expect(afterApply.match(/commentary_id:/gu)?.length).toBe(1);
    expect(replay.replayed).toBe(true);
    expect(replay.prospectiveLedger).toBe(afterApply);
    expect(readFileSync(ledgerPath, "utf8")).toBe(afterApply);
  });

  it("replays an imported unit by marker without duplicating blocks", () => {
    const draftPath = writeDraft(validDraft());
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const first = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const afterFirst = readFileSync(ledgerPath, "utf8");

    const preview = importCommentaryDraft({ dialogue: "fixture", draftPath });
    const replay = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });

    expect(first.replayed).toBe(false);
    expect(first.importMarker).toContain(`sha256=${first.draftSha256}`);
    expect(afterFirst).toContain(first.importMarker);
    expect(preview.replayed).toBe(true);
    expect(preview.blockIds).toEqual(first.blockIds);
    expect(preview.prospectiveLedger).toBe(afterFirst);
    expect(replay.replayed).toBe(true);
    expect(readFileSync(ledgerPath, "utf8")).toBe(afterFirst);
    expect(afterFirst.match(/commentary_id:/gu)?.length).toBe(3);
  });

  it("rejects a changed draft or a marker that references missing blocks", () => {
    const draftPath = writeDraft(validDraft());
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const imported = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const afterImport = readFileSync(ledgerPath, "utf8");

    const changed = validDraft();
    changed.blocks[0]!.body = "A changed body must not silently replace an imported unit.";
    writeDraft(changed);
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath })).toThrow(
      "already imported with a different sha256",
    );

    writeDraft(validDraft());
    writeFileSync(
      ledgerPath,
      afterImport.replace(imported.blockIds[0]!, "comm_fixture_missing"),
      "utf8",
    );
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath })).toThrow(
      "references missing block ids: comm_fixture_missing",
    );
  });

  it("rejects duplicate import markers for the same unit", () => {
    const draftPath = writeDraft(validDraft());
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const imported = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const afterImport = readFileSync(ledgerPath, "utf8");
    writeFileSync(ledgerPath, `${afterImport}\n${imported.importMarker}\n`, "utf8");

    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath })).toThrow(
      "has duplicate import markers",
    );
  });

  it("backfills a marker for a complete legacy import and then replays it", () => {
    const draftPath = writeDraft(validDraft());
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");
    const initialPreview = importCommentaryDraft({ dialogue: "fixture", draftPath });
    writeFileSync(ledgerPath, `${before}\n${initialPreview.renderedBlocks}\n`, "utf8");
    const legacyLedger = readFileSync(ledgerPath, "utf8");

    const backfill = importCommentaryDraft({ dialogue: "fixture", draftPath });
    expect(backfill.replayed).toBe(true);
    expect(backfill.blockIds).toEqual(initialPreview.blockIds);
    expect(backfill.prospectiveLedger).toContain(backfill.importMarker);
    expect(backfill.prospectiveLedger.match(/commentary_id:/gu)?.length).toBe(3);

    const applied = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    const afterBackfill = readFileSync(ledgerPath, "utf8");
    expect(applied.replayed).toBe(true);
    expect(afterBackfill).not.toBe(legacyLedger);
    expect(afterBackfill.match(/commentary_id:/gu)?.length).toBe(3);

    const replay = importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true });
    expect(replay.replayed).toBe(true);
    expect(readFileSync(ledgerPath, "utf8")).toBe(afterBackfill);
  });

  it("rejects a partial legacy match instead of duplicating the unmatched tail", () => {
    const draftPath = writeDraft(validDraft());
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");
    const preview = importCommentaryDraft({ dialogue: "fixture", draftPath });
    const firstBlock = preview.renderedBlocks.split("\n\n```yaml\n")[0]!;
    writeFileSync(ledgerPath, `${before}\n${firstBlock}\n`, "utf8");
    const partialLedger = readFileSync(ledgerPath, "utf8");

    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true })).toThrow(
      "partially matches 1 of 2 legacy block(s)",
    );
    expect(readFileSync(ledgerPath, "utf8")).toBe(partialLedger);
  });

  it("rejects more than three interruptions in one unit", () => {
    const draft = validDraft();
    draft.blocks = [draft.blocks[0]!, draft.blocks[1]!, draft.blocks[0]!, draft.blocks[1]!];

    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(draft) })).toThrow(
      "must contain at most three blocks",
    );
  });

  it("rejects draft-owned canonical fields and leaves the ledger unchanged", () => {
    const draft = validDraft();
    const firstBlock = draft.blocks[0] as Record<string, unknown>;
    firstBlock.commentary_id = "comm_fixture_9999";
    const draftPath = writeDraft(draft);
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");

    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath, apply: true })).toThrow(
      "commentary_id is not allowed",
    );
    expect(readFileSync(ledgerPath, "utf8")).toBe(before);
  });

  it("rejects the wrong model, effort, unit filename, or dialogue boundary", () => {
    const wrongModel = validDraft();
    wrongModel.authoring.model = "claude-fable-5";
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(wrongModel) })).toThrow(
      "authoring.model must be gpt-5.6-luna",
    );

    const wrongEffort = validDraft();
    wrongEffort.authoring.effort = "low";
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(wrongEffort) })).toThrow(
      "authoring.effort must be medium",
    );

    expect(() =>
      importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(validDraft(), "different-name.json") }),
    ).toThrow("must match unit_key");

    expect(() =>
      importCommentaryDraft({ dialogue: "fixture", draftPath: "scratch/commentary/drafts/other/unit.json" }),
    ).toThrow("must be inside scratch/commentary/drafts/fixture");
  });

  it("rejects anchors outside the named section and invalid citations before writing", () => {
    const outside = validDraft();
    outside.blocks[0]!.stephanus_span = "3a";
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(outside) })).toThrow(
      "anchors outside section comm_fixture_0001",
    );

    const badCitation = validDraft();
    badCitation.blocks[0]!.cites.observations = ["obs_fixture_missing"];
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(badCitation) })).toThrow(
      "cite_unknown_id",
    );
  });

  it("rejects before and after insertion boundaries that split a continuous turn", () => {
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");

    const afterAnchor = validDraft();
    afterAnchor.blocks = [{ ...afterAnchor.blocks[0]!, placement: "after", stephanus_span: "2a" }];
    const afterPath = writeDraft(afterAnchor);
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: afterPath })).toThrow(
      /after 2a insertion boundary at char \d+ splits turn_fixture_0001/u,
    );

    const beforeAnchor = validDraft();
    beforeAnchor.blocks = [{ ...beforeAnchor.blocks[0]!, placement: "before", stephanus_span: "2b" }];
    const beforePath = writeDraft(beforeAnchor);
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: beforePath, apply: true })).toThrow(
      /before 2b insertion boundary at char \d+ splits turn_fixture_0001/u,
    );
    expect(readFileSync(ledgerPath, "utf8")).toBe(before);
  });

  it("imports an unsafe marker anchor only when it carries an exact accepted audio insertion", () => {
    const draft = validDraft();
    draft.blocks = [{ ...draft.blocks[0]!, placement: "after", stephanus_span: "2a" }];
    (draft.blocks[0] as Record<string, unknown>).audio_insertion = acceptedAudioInsertion("after");

    const result = importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(draft) });

    expect(result.renderedBlocks).toContain("audio_insertion:");
    expect(result.renderedBlocks).toContain("turn_id: turn_fixture_audio_0001");
    expect(result.renderedBlocks).toContain("edge: after");
  });

  it("fails closed for stale, mismatched, or malformed audio insertion bindings", () => {
    const stale = validDraft();
    stale.blocks = [{ ...stale.blocks[0]!, placement: "after", stephanus_span: "2a" }];
    (stale.blocks[0] as Record<string, unknown>).audio_insertion = {
      ...acceptedAudioInsertion("after"),
      attribution_sha256: "0".repeat(64),
    };
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(stale) })).toThrow(
      "attribution_sha256 does not match",
    );

    const wrongEdge = validDraft();
    wrongEdge.blocks = [{ ...wrongEdge.blocks[0]!, placement: "after", stephanus_span: "2a" }];
    (wrongEdge.blocks[0] as Record<string, unknown>).audio_insertion = acceptedAudioInsertion("before");
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(wrongEdge) })).toThrow(
      "must match placement after",
    );

    const malformed = validDraft();
    (malformed.blocks[0] as Record<string, unknown>).audio_insertion = {
      ...acceptedAudioInsertion(),
      guessed_boundary: true,
    };
    expect(() => importCommentaryDraft({ dialogue: "fixture", draftPath: writeDraft(malformed) })).toThrow(
      "unknown field guessed_boundary",
    );
  });

  it("imports a sorted draft batch atomically with one deterministic id sequence", () => {
    const first = validDraft();
    const second = validDraft();
    second.unit_key = "second-2a-2b";
    second.blocks = [
      {
        ...second.blocks[0]!,
        body: "A second interruption follows the first unit deterministically.",
      },
    ];
    const firstPath = writeDraft(first);
    const secondPath = writeDraft(second, "second-2a-2b.json");
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");

    const preview = importCommentaryDraftBatch({
      dialogue: "fixture",
      draftPaths: [secondPath, firstPath],
    });
    expect(preview.applied).toBe(false);
    expect(preview.imports.map((entry) => entry.unitKey)).toEqual([
      "opening-2a-2b",
      "second-2a-2b",
    ]);
    expect(preview.imports[0]!.blockIds).toEqual(["comm_fixture_0002", "comm_fixture_0003"]);
    expect(preview.imports[1]!.blockIds).toEqual(["comm_fixture_0004"]);
    expect(readFileSync(ledgerPath, "utf8")).toBe(before);

    const applied = importCommentaryDraftBatch({
      dialogue: "fixture",
      draftPaths: [secondPath, firstPath],
      apply: true,
    });
    expect(applied.applied).toBe(true);
    expect(applied.imports.every((entry) => entry.applied)).toBe(true);
    expect(readFileSync(ledgerPath, "utf8")).toBe(preview.prospectiveLedger);

    const afterApply = readFileSync(ledgerPath, "utf8");
    const replay = importCommentaryDraftBatch({
      dialogue: "fixture",
      draftPaths: [firstPath, secondPath],
      apply: true,
    });
    expect(replay.imports.every((entry) => entry.replayed)).toBe(true);
    expect(readFileSync(ledgerPath, "utf8")).toBe(afterApply);
    expect(afterApply.match(/commentary_id:/gu)?.length).toBe(4);
  });

  it("leaves the ledger untouched when any draft in a batch is invalid", () => {
    const firstPath = writeDraft(validDraft());
    const invalid = validDraft();
    invalid.unit_key = "invalid-2a-2b";
    invalid.blocks[0]!.cites.observations = ["obs_fixture_missing"];
    const invalidPath = writeDraft(invalid, "invalid-2a-2b.json");
    const ledgerPath = join(root, "wiki/commentary/fixture.md");
    const before = readFileSync(ledgerPath, "utf8");

    expect(() =>
      importCommentaryDraftBatch({
        dialogue: "fixture",
        draftPaths: [firstPath, invalidPath],
        apply: true,
      }),
    ).toThrow("cite_unknown_id");
    expect(readFileSync(ledgerPath, "utf8")).toBe(before);
  });

  it("rejects an empty or duplicate draft batch", () => {
    const draftPath = writeDraft(validDraft());
    expect(() => importCommentaryDraftBatch({ dialogue: "fixture", draftPaths: [] })).toThrow(
      "at least one",
    );
    expect(() =>
      importCommentaryDraftBatch({ dialogue: "fixture", draftPaths: [draftPath, draftPath] }),
    ).toThrow("duplicate");
    expect(() =>
      importCommentaryDraftBatch({
        dialogue: "fixture",
        draftPaths: [draftPath, join(root, draftPath)],
      }),
    ).toThrow("duplicate or aliased");
  });
});

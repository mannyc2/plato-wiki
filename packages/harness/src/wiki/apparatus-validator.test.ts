import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import { validateApparatusLedger } from "./apparatus-validator.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

const LEDGER_PATH = "wiki/apparatus/fixture.md";

function writeRepoFixture() {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), "{2a} alpha {2b} beta {3a} gamma {4a} delta", "utf8");
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(
    join(root, "wiki/observations/fixture.md"),
    "```yaml\nobservation_id: obs_fixture_0001\nreview_status: accepted\n```\n\n```yaml\nobservation_id: obs_fixture_0002\nreview_status: unreviewed\n```\n",
    "utf8",
  );
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  writeFileSync(join(root, "wiki/claims/fixture.md"), "```yaml\nclaim_id: claim_fixture_0001\nreview_status: accepted\n```\n", "utf8");
  mkdirSync(join(root, "wiki/relations"), { recursive: true });
  writeFileSync(join(root, "wiki/relations/fixture.md"), "```yaml\nrelation_id: rel_fixture_0001\nreview_status: accepted\n```\n", "utf8");
  mkdirSync(join(root, "wiki/dossiers/elenchus"), { recursive: true });
  writeFileSync(join(root, "wiki/dossiers/elenchus/assent_chain.md"), "# dossier\n", "utf8");
}

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

type BlockOptions = {
  id?: string;
  kind?: string;
  span?: string;
  work?: string;
  note?: string;
  cites?: string;
  author?: string;
  review?: string;
  sourceRef?: string;
};

function block(options: BlockOptions = {}) {
  const span = options.span ?? "2a-2b";
  return `\`\`\`yaml
apparatus_id: ${options.id ?? "apx_fixture_0001"}
source_work: ${options.work ?? "Fixture"}
kind: ${options.kind ?? "surface_tension"}
stephanus_span: ${span}
${options.sourceRef ?? refLines(span)}
note: "${options.note ?? "A careful reader is invited to weigh this span."}"
${options.cites ?? ["cites:", "  observations: [obs_fixture_0001]", "  claims: []", "  relations: []", "  dossiers: []"].join("\n")}
author: ${options.author ?? "model"}
review_status: ${options.review ?? "accepted"}
\`\`\`
`;
}

function codes(content: string) {
  return validateApparatusLedger(LEDGER_PATH, content).map((issue) => issue.code);
}

describe("apparatus validator", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "apparatus-validator-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeRepoFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("accepts a well-formed ledger", () => {
    expect(validateApparatusLedger(LEDGER_PATH, block())).toEqual([]);
  });

  it("rejects a wrong id prefix", () => {
    expect(codes(block({ id: "comm_fixture_0001" }))).toContain("id_format");
  });

  it("rejects an out-of-sequence id", () => {
    expect(codes(block({ id: "apx_fixture_0002" }))).toContain("id_sequence");
  });

  it("rejects an unknown kind", () => {
    expect(codes(block({ kind: "hidden_meaning" }))).toContain("kind_invalid");
  });

  it("rejects empty cites", () => {
    const cites = ["cites:", "  observations: []", "  claims: []", "  relations: []", "  dossiers: []"].join("\n");
    expect(codes(block({ cites }))).toContain("cites_empty");
  });

  it("rejects a cite to a non-accepted observation", () => {
    const cites = ["cites:", "  observations: [obs_fixture_0002]", "  claims: []", "  relations: []", "  dossiers: []"].join("\n");
    expect(codes(block({ cites }))).toContain("cite_not_accepted");
  });

  it("rejects a source_ref that does not match the span", () => {
    const badRef = refLines("2a-2b").replace(/start_char: \d+/u, "start_char: 999");
    expect(codes(block({ sourceRef: badRef }))).toContain("source_ref_mismatch");
  });

  it("rejects a contiguous Greek run over the limit", () => {
    expect(codes(block({ note: `Weigh this: ${"α".repeat(90)}` }))).toContain("note_greek_run");
  });

  it("rejects a note over the length limit", () => {
    expect(codes(block({ note: "a".repeat(601) }))).toContain("note_too_long");
  });

  it("rejects a bad review_status", () => {
    expect(codes(block({ review: "published" }))).toContain("review_status_invalid");
  });
});

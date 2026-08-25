import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { validateVoicesLedger } from "./voices-validator.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

const LEDGER_PATH = "wiki/voices/fixture.md";

// Offsets over the fixture source:
//   0    "{2a} "
//   5    "ΝΑΡΡ. alpha "     narration, printed siglum at [5, 10)
//   17   "ἔφη ΒΗΤΑ. "       named reporting formula at [17, 26)
//   27   "{2b} beta gamma"  the reported speech
const SOURCE = "{2a} ΝΑΡΡ. alpha ἔφη ΒΗΤΑ. {2b} beta gamma";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function writeRepoFixture(fixtureSource = SOURCE) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  writeFileSync(join(root, "raw/plato/greek/fixture.txt"), fixtureSource, "utf8");

  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/turns/fixture.toon"),
    [
      "dialogue: fixture",
      "source_path: raw/plato/greek/fixture.txt",
      `source_sha256: ${sha256(fixtureSource)}`,
      "sigla_path: derived/plato/turns/sigla.toml",
      `sigla_sha256: ${sha256("sigla")}`,
      "turns[1]:",
      "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
      `  turn_fixture_0001 | ΝΑΡΡ.   | 2a           | 2b         | 0          | ${fixtureSource.length}       | ${sha256(fixtureSource)} | 5`,
      "",
    ].join("\n"),
    "utf8",
  );

  mkdirSync(join(root, "derived/plato/voices"), { recursive: true });
  writeFileSync(
    join(root, "derived/plato/voices/sigla.toml"),
    '[[dialogues]]\nslug = "fixture"\nsigla = ["ΝΑΡΡ.", "ΒΗΤΑ.", "ΓΑΜΜΑ."]\n',
    "utf8",
  );
}

type Ref = {
  kind?: string;
  role?: string;
  text?: string;
  start?: number;
  end?: number;
  antecedentText?: string | null;
  antecedentStart?: number;
  antecedentEnd?: number;
};

type BlockOptions = {
  id?: string;
  work?: string;
  turn?: string;
  span?: string;
  start?: number;
  end?: number;
  sourcePath?: string;
  sourceSha?: string;
  spanSha?: string;
  chain?: string[];
  depth?: number;
  resolution?: string;
  refs?: Ref[] | null;
  unresolvedReason?: string;
  limits?: string;
  review?: string;
  sourceText?: string;
  reviewed?: ReviewedAttribution | null;
  candidateOwners?: string[];
};

type ReviewedAttribution = {
  kind?: string | null;
  owners?: string[] | null;
  contextStart?: number;
  contextEnd?: number;
  contextSha?: string;
  rationale?: string | null;
};

function refLines(ref: Ref) {
  const lines = [
    `  - kind: ${ref.kind ?? "printed_siglum"}`,
    ...(ref.role ? [`    role: ${ref.role}`] : []),
    `    text: "${ref.text ?? "ΝΑΡΡ."}"`,
    `    start_char: ${ref.start ?? 5}`,
    `    end_char: ${ref.end ?? 10}`,
  ];
  if (ref.antecedentText !== undefined && ref.antecedentText !== null) {
    lines.push(
      `    antecedent_text: "${ref.antecedentText}"`,
      `    antecedent_start_char: ${ref.antecedentStart}`,
      `    antecedent_end_char: ${ref.antecedentEnd}`,
    );
  }
  return lines;
}

function block(options: BlockOptions = {}) {
  const sourceText = options.sourceText ?? SOURCE;
  const start = options.start ?? 0;
  const end = options.end ?? sourceText.length;
  const chain = options.chain ?? ["ΝΑΡΡ."];
  const resolution = options.resolution ?? "resolved";
  const lines = [
    "```yaml",
    `voice_id: ${options.id ?? "voice_fixture_0001"}`,
    `source_work: ${options.work ?? "Fixture"}`,
    `outer_turn_id: ${options.turn ?? "turn_fixture_0001"}`,
    `stephanus_span: ${options.span ?? "2a-2b"}`,
    "char_span:",
    `  start_char: ${start}`,
    `  end_char: ${end}`,
    `source_path: ${options.sourcePath ?? "raw/plato/greek/fixture.txt"}`,
    `source_sha256: "${options.sourceSha ?? sha256(sourceText)}"`,
    `span_sha256: "${options.spanSha ?? sha256(sourceText.slice(start, end))}"`,
    `voice_chain: [${chain.map((s) => `"${s}"`).join(", ")}]`,
    `depth: ${options.depth ?? (resolution === "unresolved" ? chain.length + 1 : chain.length)}`,
    `resolution: ${resolution}`,
  ];
  const refs = options.refs === undefined ? [{}] : options.refs;
  if (refs && refs.length > 0) {
    lines.push("evidence_refs:");
    for (const ref of refs) lines.push(...refLines(ref));
  }
  if (options.reviewed) {
    const reviewed = options.reviewed;
    const contextStart = reviewed.contextStart ?? start;
    const contextEnd = reviewed.contextEnd ?? end;
    lines.push("reviewed_attribution:");
    if (reviewed.kind !== null) lines.push(`  kind: ${reviewed.kind ?? "discourse_resolution"}`);
    if (reviewed.owners !== null) {
      const owners = reviewed.owners ?? ["ΝΑΡΡ.", "ΒΗΤΑ."];
      lines.push(`  candidate_owners: [${owners.map((s) => `"${s}"`).join(", ")}]`);
    }
    lines.push(
      "  context_span:",
      `    start_char: ${contextStart}`,
      `    end_char: ${contextEnd}`,
      `    text_sha256: "${reviewed.contextSha ?? sha256(sourceText.slice(contextStart, contextEnd))}"`,
    );
    if (reviewed.rationale !== null) {
      lines.push(`  rationale: "${reviewed.rationale ?? "Named handoff; this span answers the named addressee."}"`);
    }
  }
  if (options.candidateOwners) {
    lines.push(`candidate_owners: [${options.candidateOwners.map((s) => `"${s}"`).join(", ")}]`);
  }
  if (options.unresolvedReason !== undefined) lines.push(`unresolved_reason: "${options.unresolvedReason}"`);
  lines.push(`limits: "${options.limits ?? "Structure only; asserts nothing about content."}"`);
  lines.push(`review_status: ${options.review ?? "unreviewed"}`);
  lines.push("```");
  return `${lines.join("\n")}\n`;
}

/** The reported speech [17, 41), licensed by the named formula at [17, 26). */
function innerBlock(overrides: BlockOptions = {}) {
  return block({
    id: "voice_fixture_0002",
    start: 17,
    end: SOURCE.length,
    chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
    refs: [{ kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
    ...overrides,
  });
}

function codes(content: string) {
  return validateVoicesLedger(LEDGER_PATH, content).map((issue) => issue.code);
}

/**
 * The same fixture, but with the turn printed with NO speaker siglum — the shape
 * of apology, charmides, lysis, parmenides and republic. `ΝΑΡΡ.` stays
 * registered because it is the turn's real owner; `(none)` deliberately is not.
 */
function writeUnlabelledFixture(fixtureSource = SOURCE) {
  writeRepoFixture(fixtureSource);
  writeFileSync(
    join(root, "derived/plato/turns/fixture.toon"),
    [
      "dialogue: fixture",
      "source_path: raw/plato/greek/fixture.txt",
      `source_sha256: ${sha256(fixtureSource)}`,
      "sigla_path: derived/plato/turns/sigla.toml",
      `sigla_sha256: ${sha256("sigla")}`,
      "turns[1]:",
      "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
      `  turn_fixture_0001 | (none)  | 2a           | 2b         | 0          | ${fixtureSource.length}       | ${sha256(fixtureSource)} | 5`,
      "",
    ].join("\n"),
    "utf8",
  );
}

const FRAME_REF = { kind: "unlabelled_turn_frame", text: "ΝΑΡΡ.", start: 5, end: 10 };

describe("voices validator", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "voices-validator-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    writeRepoFixture();
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("accepts a well-formed single-record ledger", () => {
    expect(validateVoicesLedger(LEDGER_PATH, block())).toEqual([]);
  });

  it("accepts a nested pair whose deeper span extends the enclosing chain", () => {
    expect(validateVoicesLedger(LEDGER_PATH, `${block()}\n${innerBlock()}`)).toEqual([]);
  });

  describe("identity and schema", () => {
    it("rejects a malformed voice_id", () => {
      expect(codes(block({ id: "obs_fixture_0001" }))).toContain("id_format");
    });

    it("accepts a stable voice_id whose numeric suffix has a gap", () => {
      expect(validateVoicesLedger(LEDGER_PATH, block({ id: "voice_fixture_0002" }))).toEqual([]);
    });

    it("still rejects duplicate voice_ids", () => {
      expect(codes(`${block()}\n${innerBlock({ id: "voice_fixture_0001" })}`)).toContain("id_duplicate");
    });

    it("rejects a source_work that is not the ledger dialogue", () => {
      expect(codes(block({ work: "Meno" }))).toContain("source_work_mismatch");
    });

    it("rejects an unknown top-level field", () => {
      expect(codes(block().replace("limits:", "speaker_guess: ΒΗΤΑ.\nlimits:"))).toContain("unknown_field");
    });

    it("rejects a missing required field", () => {
      expect(codes(block().replace(/^depth: .*$/mu, ""))).toContain("missing_field");
    });

    it("rejects an invalid review_status", () => {
      expect(codes(block({ review: "provisional" }))).toContain("review_status_invalid");
    });

    it("rejects a ledger field written outside a yaml fence", () => {
      expect(codes(`review_status: accepted\n\n${block()}`)).toContain("orphan_ledger_field");
    });

    it("accepts a record without limits prose", () => {
      const withoutLimits = block().replace(/^limits:.*\n/mu, "");
      expect(validateVoicesLedger(LEDGER_PATH, withoutLimits)).toEqual([]);
    });
  });

  describe("source hashes and character ranges", () => {
    it("rejects a source_sha256 that does not hash the Greek source", () => {
      expect(codes(block({ sourceSha: "0".repeat(64) }))).toContain("source_sha256_mismatch");
    });

    it("rejects a span_sha256 that does not hash the cited bytes", () => {
      expect(codes(block({ spanSha: "0".repeat(64) }))).toContain("span_sha256_mismatch");
    });

    it("rejects a source_path that is not the dialogue's Greek file", () => {
      expect(codes(block({ sourcePath: "raw/plato/english/fixture.txt" }))).toContain("source_path_mismatch");
    });

    it("rejects an inverted character range", () => {
      expect(codes(block({ start: 20, end: 5 }))).toContain("char_span_invalid");
    });

    it("rejects a character range past the end of the source", () => {
      expect(codes(block({ end: SOURCE.length + 50 }))).toContain("char_span_out_of_bounds");
    });

    it("rejects a stephanus_span that does not describe the character range", () => {
      expect(codes(block({ span: "4a" }))).toContain("stephanus_span_mismatch");
    });
  });

  describe("evidence", () => {
    it("rejects evidence text that does not match the source bytes at its offsets", () => {
      expect(codes(innerBlock({ refs: [{ kind: "named_reporting_formula", text: "φάναι ΒΗΤΑ.", start: 17, end: 26 }] }))).toContain(
        "evidence_text_mismatch",
      );
    });

    it("rejects evidence offsets that are not a well-formed range", () => {
      expect(codes(innerBlock({ refs: [{ kind: "named_reporting_formula", text: "x", start: 26, end: 17 }] }))).toContain(
        "evidence_offsets_invalid",
      );
    });

    it("rejects an unknown evidence kind", () => {
      expect(codes(block({ refs: [{ kind: "sounds_like_the_character" }] }))).toContain("evidence_kind_invalid");
    });

    // A role description is the naming machinery for the speakers the source
    // never gives a proper name — the doorkeeper, the attendant of the Eleven.
    // It is a separate kind so the record never claims a name was printed.
    it("accepts a role_reporting_formula in the same position as a named one", () => {
      const outer = block({ id: "voice_fixture_0001" });
      const quoted = innerBlock({ refs: [{ kind: "role_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }] });
      expect(validateVoicesLedger(LEDGER_PATH, `${outer}\n${quoted}`)).toEqual([]);
    });

    it("rejects a resolved record with no evidence at all", () => {
      expect(codes(block({ refs: null }))).toContain("evidence_required");
    });

    it("rejects an unresolved record that still cites evidence", () => {
      expect(codes(block({ resolution: "unresolved", unresolvedReason: "none" }))).toContain("evidence_forbidden");
    });

    it("rejects an unresolved record with no reason", () => {
      expect(codes(block({ resolution: "unresolved", refs: null }))).toContain("unresolved_reason_missing");
    });

    it("rejects evidence text containing a pipe, which would corrupt the derived table", () => {
      expect(codes(innerBlock({ refs: [{ kind: "named_reporting_formula", text: "ἔφη | ΒΗΤΑ.", start: 17, end: 28 }] }))).toContain(
        "evidence_unsafe_text",
      );
    });

    it("rejects a formula printed after its span unless it is a closing formula", () => {
      const backwards = block({
        start: 0,
        end: 10,
        span: "2a",
        refs: [{ kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
      });
      expect(codes(backwards)).toContain("evidence_out_of_range");
    });

    it("accepts a closing formula printed just after its span", () => {
      const outer = block({ id: "voice_fixture_0001" });
      const quoted = block({
        id: "voice_fixture_0002",
        start: 11,
        end: 16,
        span: "2a",
        chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
        refs: [{ kind: "closing_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
      });
      expect(validateVoicesLedger(LEDGER_PATH, `${outer}\n${quoted}`)).toEqual([]);
    });

    describe("parenthetical named introductions", () => {
      it("accepts a named cue that strictly straddles the speech start", () => {
        const outer = block({ id: "voice_fixture_0001" });
        // Three placements exercise the reviewed shapes in which the named
        // accusative subject precedes the direct speech and the parenthetical
        // reporting verb follows its first word.
        for (const start of [18, 20, 25]) {
          const inner = innerBlock({
            start,
            refs: [{ kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
          });
          expect(validateVoicesLedger(LEDGER_PATH, `${outer}\n${inner}`)).toEqual([]);
        }
      });

      it("does not extend the exception to anaphoric or person-marked cues", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const anaphoric = innerBlock({
          start: 20,
          refs: [
            {
              kind: "anaphoric_reporting_formula",
              text: "ἔφη ΒΗΤΑ.",
              start: 17,
              end: 26,
              antecedentText: "ΝΑΡΡ.",
              antecedentStart: 5,
              antecedentEnd: 10,
            },
          ],
        });
        const personMarked = innerBlock({
          start: 20,
          refs: [{ kind: "person_marked_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
        });
        expect(codes(`${outer}\n${anaphoric}`)).toContain("evidence_out_of_range");
        expect(codes(`${outer}\n${personMarked}`)).toContain("evidence_out_of_range");
      });

      it("rejects a named ref that crosses the record end instead of its start", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const inner = innerBlock({
          start: 11,
          end: 20,
          span: "2a",
          refs: [{ kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
        });
        expect(codes(`${outer}\n${inner}`)).toContain("evidence_out_of_range");
      });

      it("rejects a named ref that crosses both the record start and end", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const inner = innerBlock({
          start: 20,
          end: 24,
          span: "2a",
          refs: [{ kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
        });
        expect(codes(`${outer}\n${inner}`)).toContain("evidence_out_of_range");
      });

      it("rejects a straddling ref used as an exchange anchor rather than a cue", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const inner = innerBlock({
          start: 20,
          refs: [
            {
              kind: "named_reporting_formula",
              role: "exchange_open",
              text: "ἔφη ΒΗΤΑ.",
              start: 17,
              end: 26,
            },
          ],
        });
        expect(codes(`${outer}\n${inner}`)).toContain("evidence_anchor_side");
      });

      it("rejects a straddling named cue whose start lies beyond the lookback bound", () => {
        const formula = `ΝΑΡΡ. ${"α".repeat(610)} ΒΗΤΑ.`;
        const sourceText = `{2a} ${formula} {2b} beta`;
        const formulaStart = 5;
        const formulaEnd = formulaStart + formula.length;
        const recordStart = formulaStart + 601;
        writeRepoFixture(sourceText);

        const outer = block({ id: "voice_fixture_0001", sourceText });
        const inner = block({
          id: "voice_fixture_0002",
          sourceText,
          start: recordStart,
          end: sourceText.length,
          chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          refs: [
            {
              kind: "named_reporting_formula",
              text: formula,
              start: formulaStart,
              end: formulaEnd,
            },
          ],
        });
        expect(codes(`${outer}\n${inner}`)).toContain("evidence_out_of_range");
      });

      it("rejects a straddling named cue whose end lies beyond the forward bound", () => {
        const formula = `ΝΑΡΡ. ΒΗΤΑ. ${"α".repeat(610)}`;
        const sourceText = `{2a} ${formula} {2b} beta`;
        const formulaStart = 5;
        const formulaEnd = formulaStart + formula.length;
        const recordStart = formulaStart + 10;
        writeRepoFixture(sourceText);

        const outer = block({ id: "voice_fixture_0001", sourceText });
        const inner = block({
          id: "voice_fixture_0002",
          sourceText,
          start: recordStart,
          end: sourceText.length,
          chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          refs: [
            {
              kind: "named_reporting_formula",
              text: formula,
              start: formulaStart,
              end: formulaEnd,
            },
          ],
        });
        expect(formulaEnd - recordStart).toBeGreaterThan(600);
        expect(formulaEnd).toBeLessThanOrEqual(sourceText.length);
        expect(codes(`${outer}\n${inner}`)).toContain("evidence_out_of_range");
      });
    });

    describe("anaphoric formulas", () => {
      it("requires an antecedent", () => {
        expect(codes(innerBlock({ refs: [{ kind: "anaphoric_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }] }))).toContain(
          "evidence_antecedent_missing",
        );
      });

      it("rejects an antecedent whose bytes do not match", () => {
        expect(
          codes(
            innerBlock({
              refs: [
                {
                  kind: "anaphoric_reporting_formula",
                  text: "ἔφη ΒΗΤΑ.",
                  start: 17,
                  end: 26,
                  antecedentText: "ΓΑΜΜΑ.",
                  antecedentStart: 5,
                  antecedentEnd: 10,
                },
              ],
            }),
          ),
        ).toContain("evidence_antecedent_mismatch");
      });

      it("rejects an antecedent that does not precede its formula", () => {
        expect(
          codes(
            block({
              start: 0,
              end: 5,
              span: "2a",
              refs: [
                {
                  kind: "anaphoric_reporting_formula",
                  text: "ΝΑΡΡ.",
                  start: 5,
                  end: 10,
                  antecedentText: "ἔφη ΒΗΤΑ.",
                  antecedentStart: 17,
                  antecedentEnd: 26,
                },
              ],
            }),
          ),
        ).toContain("evidence_antecedent_order");
      });

      it("accepts an antecedent cited before its formula", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const inner = innerBlock({
          refs: [
            {
              kind: "anaphoric_reporting_formula",
              text: "ἔφη ΒΗΤΑ.",
              start: 17,
              end: 26,
              antecedentText: "ΝΑΡΡ.",
              antecedentStart: 5,
              antecedentEnd: 10,
            },
          ],
        });
        expect(validateVoicesLedger(LEDGER_PATH, `${outer}\n${inner}`)).toEqual([]);
      });
    });

    describe("anchored dialogue turns", () => {
      /** span [11, 16) is "alpha"; "ΝΑΡΡ." precedes it, "ἔφη ΒΗΤΑ." follows it. */
      const anchoredTurn = (refs: Ref[]) =>
        block({ id: "voice_fixture_0002", start: 11, end: 16, span: "2a", chain: ["ΝΑΡΡ.", "ΒΗΤΑ."], refs });
      const CUE: Ref = { kind: "anchored_dialogue_turn", role: "cue", text: "alpha", start: 11, end: 16 };
      const OPEN: Ref = { kind: "printed_siglum", role: "exchange_open", text: "ΝΑΡΡ.", start: 5, end: 10 };
      const CLOSE: Ref = {
        kind: "named_reporting_formula",
        role: "exchange_close",
        text: "ἔφη ΒΗΤΑ.",
        start: 17,
        end: 26,
      };

      it("accepts an in-span cue with valid opening and closing exchange anchors", () => {
        const outer = block({ id: "voice_fixture_0001" });
        expect(validateVoicesLedger(LEDGER_PATH, `${outer}\n${anchoredTurn([CUE, OPEN, CLOSE])}`)).toEqual([]);
      });

      it("accepts byte-verified person-marked formulas as genuine exchange bounds", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const personMarkedOpen: Ref = { ...OPEN, kind: "person_marked_reporting_formula" };
        const personMarkedClose: Ref = { ...CLOSE, kind: "person_marked_reporting_formula" };
        expect(
          validateVoicesLedger(
            LEDGER_PATH,
            `${outer}\n${anchoredTurn([CUE, personMarkedOpen, personMarkedClose])}`,
          ),
        ).toEqual([]);
      });

      it("rejects a person-marked exchange bound placed on the wrong side", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const backwardsOpen: Ref = {
          ...CLOSE,
          kind: "person_marked_reporting_formula",
          role: "exchange_open",
        };
        expect(codes(`${outer}\n${anchoredTurn([CUE, backwardsOpen, CLOSE])}`)).toContain(
          "evidence_anchor_side",
        );
      });

      it("rejects a record whose only cue sits outside its own span", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const strayCue: Ref = { ...CUE, text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 };
        const issues = codes(`${outer}\n${anchoredTurn([strayCue, OPEN, CLOSE])}`);
        expect(issues).toContain("evidence_cue_not_in_span");
        expect(issues).toContain("evidence_cue_missing");
      });

      it("rejects the pre-correction shape: flanking refs of the same kind, no in-span cue", () => {
        // Every ref tagged anchored_dialogue_turn with no role, one before and
        // one after the span. The old flanking check counted sides and passed
        // this, even though nothing licensed THIS span's speaker.
        const outer = block({ id: "voice_fixture_0001" });
        const issues = codes(
          `${outer}\n${anchoredTurn([
            { kind: "anchored_dialogue_turn", text: "ΝΑΡΡ.", start: 5, end: 10 },
            { kind: "anchored_dialogue_turn", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 },
          ])}`,
        );
        expect(issues).toContain("evidence_cue_missing");
        expect(issues).toContain("evidence_cue_not_in_span");
        expect(issues).toContain("evidence_not_flanked");
      });

      it("requires both an opening and a closing exchange anchor", () => {
        const outer = block({ id: "voice_fixture_0001" });
        expect(codes(`${outer}\n${anchoredTurn([CUE, OPEN])}`)).toContain("evidence_not_flanked");
        expect(codes(`${outer}\n${anchoredTurn([CUE, CLOSE])}`)).toContain("evidence_not_flanked");
      });

      it("rejects an exchange anchor cited on the wrong side of the span", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const backwards: Ref = { ...OPEN, text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 };
        expect(codes(`${outer}\n${anchoredTurn([CUE, backwards, CLOSE])}`)).toContain("evidence_anchor_side");
      });

      it("rejects an exchange anchor whose kind names no speaker", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const weak: Ref = { ...CLOSE, kind: "anchored_dialogue_turn" };
        expect(codes(`${outer}\n${anchoredTurn([CUE, OPEN, weak])}`)).toContain("evidence_anchor_kind");
      });

      it("rejects an unknown evidence role", () => {
        const outer = block({ id: "voice_fixture_0001" });
        expect(codes(`${outer}\n${anchoredTurn([{ ...CUE, role: "vibe" }, OPEN, CLOSE])}`)).toContain(
          "evidence_role_invalid",
        );
      });
    });

    describe("formula-bounded continuation", () => {
      it("requires same-kind anchors on both sides of the span", () => {
        const outer = block({ id: "voice_fixture_0001" });
        // A formula_bounded_continuation before the span and some OTHER kind
        // after it does not establish that the voice continued.
        const mismatched = block({
          id: "voice_fixture_0002",
          start: 11,
          end: 16,
          span: "2a",
          chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          refs: [
            { kind: "formula_bounded_continuation", text: "ΝΑΡΡ.", start: 5, end: 10 },
            { kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 },
          ],
        });
        expect(codes(`${outer}\n${mismatched}`)).toContain("evidence_not_flanked");
      });

      it("accepts the same kind bracketing the span on both sides", () => {
        const outer = block({ id: "voice_fixture_0001" });
        const bracketed = block({
          id: "voice_fixture_0002",
          start: 11,
          end: 16,
          span: "2a",
          chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
          refs: [
            { kind: "formula_bounded_continuation", text: "ΝΑΡΡ.", start: 5, end: 10 },
            { kind: "formula_bounded_continuation", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 },
          ],
        });
        expect(validateVoicesLedger(LEDGER_PATH, `${outer}\n${bracketed}`)).toEqual([]);
      });
    });

    it("rejects `none` as an evidence kind", () => {
      // Unresolved records carry no evidence_refs at all; "none" made the
      // absence of evidence look like a species of evidence.
      expect(codes(block({ refs: [{ kind: "none", text: "ΝΑΡΡ.", start: 5, end: 10 }] }))).toContain(
        "evidence_kind_invalid",
      );
    });
  });

  describe("chains and sigla", () => {
    it("rejects a siglum missing from the voice sigla registry", () => {
      expect(codes(innerBlock({ chain: ["ΝΑΡΡ.", "ΔΕΛΤΑ."] }))).toContain("chain_siglum_unknown");
    });

    it("rejects a depth that disagrees with the chain length", () => {
      expect(codes(block({ depth: 3 }))).toContain("depth_mismatch");
    });

    it("requires an unresolved span to sit one level below its licensed chain", () => {
      const unresolved = (depth: number) =>
        block({ depth, resolution: "unresolved", refs: null, unresolvedReason: "no cue names an owner" });
      expect(codes(unresolved(1))).toContain("depth_mismatch");
      expect(codes(unresolved(2))).not.toContain("depth_mismatch");
    });

    // Geometry rule 4's one exception: a narrator who also participates reports
    // themselves, so the record's chain ends on an adjacent repeat. The fixture's
    // tokens are synthetic on purpose — the validator checks a cue's kind, role,
    // and placement, never its morphology, which stays an operator-review question.
    const NAMED_REF = { kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 };
    const selfReport = (overrides: BlockOptions = {}) =>
      innerBlock({
        chain: ["ΝΑΡΡ.", "ΝΑΡΡ."],
        refs: [{ kind: "person_marked_reporting_formula", role: "cue", text: "beta", start: 32, end: 36 }],
        ...overrides,
      });

    it("accepts a narrator reporting themselves with an in-span person-marked cue", () => {
      expect(validateVoicesLedger(LEDGER_PATH, `${block()}\n${selfReport()}`)).toEqual([]);
    });

    it("rejects a narrator self-report that cites no in-span person-marked cue", () => {
      expect(codes(`${block()}\n${selfReport({ refs: [NAMED_REF] })}`)).toContain("chain_repeat_unlicensed");
    });

    it("rejects a person-marked cue printed outside the span it would license", () => {
      // Within the lookback bound, so the range check passes — but a cue about
      // this span's own owner has to be inside it.
      const outside = { kind: "person_marked_reporting_formula", role: "cue", text: "alpha", start: 11, end: 16 };
      expect(codes(`${block()}\n${selfReport({ refs: [outside] })}`)).toContain("chain_repeat_unlicensed");
    });

    it("rejects a chain that re-enters a voice after another held the floor", () => {
      expect(codes(innerBlock({ chain: ["ΝΑΡΡ.", "ΒΗΤΑ.", "ΝΑΡΡ."] }))).toContain("chain_repeats_siglum");
    });

    it("rejects a chain that stacks the same voice three deep", () => {
      expect(codes(innerBlock({ chain: ["ΝΑΡΡ.", "ΝΑΡΡ.", "ΝΑΡΡ."] }))).toContain("chain_repeats_siglum");
    });

    it("does not demand a cue on an unresolved record whose licensed prefix ends in a repeat", () => {
      const unresolved = selfReport({
        resolution: "unresolved",
        refs: null,
        unresolvedReason: "no formula names an owner",
      });
      expect(codes(`${block()}\n${unresolved}`)).not.toContain("chain_repeat_unlicensed");
    });

    it("rejects a chain whose outermost element is not the printed turn speaker", () => {
      expect(codes(block({ chain: ["ΒΗΤΑ."] }))).toContain("chain_prefix_mismatch");
    });

    it("rejects a deeper span that does not extend its enclosing span's chain", () => {
      const outer = block({ chain: ["ΝΑΡΡ."] });
      const broken = innerBlock({ chain: ["ΓΑΜΜΑ.", "ΒΗΤΑ."] });
      expect(codes(`${outer}\n${broken}`)).toContain("chain_prefix_mismatch");
    });

    it("rejects an unknown outer_turn_id", () => {
      expect(codes(block({ turn: "turn_fixture_0009" }))).toContain("turn_unknown");
    });
  });

  describe("geometry", () => {
    it("rejects overlapping spans at the same depth", () => {
      const first = block({ id: "voice_fixture_0001", start: 0, end: 30, span: "2a-2b" });
      const second = block({ id: "voice_fixture_0002", start: 20, end: SOURCE.length, span: "2a-2b" });
      expect(codes(`${first}\n${second}`)).toContain("overlap_same_depth");
    });

    it("rejects a deep span with no enclosing span", () => {
      expect(codes(innerBlock({ id: "voice_fixture_0001" }))).toContain("nesting_missing_parent");
    });

    it("rejects a deeper span that straddles an enclosing boundary", () => {
      const outer = block({ id: "voice_fixture_0001", start: 0, end: 20, span: "2a" });
      const outerTwo = block({ id: "voice_fixture_0002", start: 20, end: SOURCE.length, span: "2a-2b" });
      const inner = innerBlock({ id: "voice_fixture_0003", start: 10, end: 30, span: "2a-2b" });
      expect(codes(`${outer}\n${outerTwo}\n${inner}`)).toContain("ambiguous_intersection");
    });

    it("rejects a turn that carries records but is not fully covered", () => {
      expect(codes(block({ start: 5, end: 20, span: "2a" }))).toContain("coverage_gap");
    });
  });

  it("rejects a span that escapes its outer turn", () => {
    writeFileSync(
      join(root, "derived/plato/turns/fixture.toon"),
      [
        "dialogue: fixture",
        "source_path: raw/plato/greek/fixture.txt",
        `source_sha256: ${sha256(SOURCE)}`,
        "sigla_path: derived/plato/turns/sigla.toml",
        `sigla_sha256: ${sha256("sigla")}`,
        "turns[1]:",
        "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
        `  turn_fixture_0001 | ΝΑΡΡ.   | 2a           | 2b         | 0          | 20       | ${sha256(SOURCE.slice(0, 20))} | 5`,
        "",
      ].join("\n"),
      "utf8",
    );
    expect(codes(block())).toContain("span_not_in_turn");
  });

  /**
   * The Phaedo discourse attribution review. Phaedo narrates in direct speech, so most utterances carry a bare
   * `ἔφη` that names nobody. `reviewed_attribution` is the second authority
   * shape: an adjudication over a bounded Greek context, checkable in every
   * respect except the judgment itself — which is what acceptance is for.
   */
  describe("reviewed discourse attribution", () => {
    /** Narration [0, 17) then the reported speech, resolved by adjudication. */
    function reviewedInner(overrides: BlockOptions = {}) {
      return block({
        id: "voice_fixture_0002",
        start: 17,
        end: SOURCE.length,
        chain: ["ΝΑΡΡ.", "ΒΗΤΑ."],
        refs: null,
        reviewed: { contextStart: 0, contextEnd: SOURCE.length },
        ...overrides,
      });
    }

    function ledger(inner: string) {
      return `${block()}\n${inner}`;
    }

    it("accepts a resolved record whose authority is a reviewed adjudication", () => {
      expect(validateVoicesLedger(LEDGER_PATH, ledger(reviewedInner()))).toEqual([]);
    });

    it("still accepts the explicit-evidence shape unchanged", () => {
      expect(validateVoicesLedger(LEDGER_PATH, `${block()}\n${innerBlock()}`)).toEqual([]);
    });

    it("rejects a resolved record carrying both authority shapes", () => {
      const both = reviewedInner({
        refs: [{ kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 }],
      });
      expect(codes(ledger(both))).toContain("authority_shape_conflict");
    });

    it("rejects a resolved record carrying neither", () => {
      expect(codes(ledger(reviewedInner({ reviewed: null })))).toContain("evidence_required");
    });

    it("rejects a reviewed adjudication on an unresolved record", () => {
      const bad = reviewedInner({
        resolution: "unresolved",
        chain: ["ΝΑΡΡ."],
        unresolvedReason: "Both remain locally plausible; no handoff discriminates.",
      });
      expect(codes(ledger(bad))).toContain("reviewed_attribution_forbidden");
    });

    it("rejects an unknown adjudication kind", () => {
      expect(codes(ledger(reviewedInner({ reviewed: { kind: "vibes" } })))).toContain(
        "reviewed_attribution_kind_invalid",
      );
    });

    it("rejects duplicate, unregistered, or too-few candidates", () => {
      expect(codes(ledger(reviewedInner({ reviewed: { owners: ["ΒΗΤΑ.", "ΒΗΤΑ."] } })))).toContain(
        "candidate_owners_duplicate",
      );
      expect(codes(ledger(reviewedInner({ reviewed: { owners: ["ΒΗΤΑ.", "ΞΕΝΟΣ."] } })))).toContain(
        "candidate_owner_unknown",
      );
      expect(codes(ledger(reviewedInner({ reviewed: { owners: ["ΒΗΤΑ."] } })))).toContain("candidate_owners_too_few");
      expect(codes(ledger(reviewedInner({ reviewed: { owners: null } })))).toContain("candidate_owners_missing");
    });

    it("rejects a candidate set that omits the owner actually chosen", () => {
      // The chain resolves to ΒΗΤΑ., so a deliberation between ΝΑΡΡ. and ΓΑΜΜΑ.
      // did not produce this record's answer.
      expect(codes(ledger(reviewedInner({ reviewed: { owners: ["ΝΑΡΡ.", "ΓΑΜΜΑ."] } })))).toContain(
        "candidate_owners_missing_terminal",
      );
    });

    it("rejects a missing or empty rationale", () => {
      expect(codes(ledger(reviewedInner({ reviewed: { rationale: null } })))).toContain(
        "reviewed_attribution_rationale_missing",
      );
      expect(codes(ledger(reviewedInner({ reviewed: { rationale: "   " } })))).toContain(
        "reviewed_attribution_rationale_missing",
      );
    });

    it("rejects a context that does not contain the span it explains", () => {
      expect(codes(ledger(reviewedInner({ reviewed: { contextStart: 0, contextEnd: 17 } })))).toContain(
        "reviewed_attribution_context_excludes_span",
      );
    });

    it("rejects a context whose hash does not match the source bytes", () => {
      expect(codes(ledger(reviewedInner({ reviewed: { contextSha: "0".repeat(64) } })))).toContain(
        "reviewed_attribution_context_sha256_mismatch",
      );
    });

    it("rejects a context that leaves the outer turn", () => {
      writeFileSync(
        join(root, "derived/plato/turns/fixture.toon"),
        [
          "dialogue: fixture",
          "source_path: raw/plato/greek/fixture.txt",
          `source_sha256: ${sha256(SOURCE)}`,
          "sigla_path: derived/plato/turns/sigla.toml",
          `sigla_sha256: ${sha256("sigla")}`,
          "turns[2]:",
          "  turn_id           | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
          `  turn_fixture_0001 | ΝΑΡΡ.   | 2a           | 2a         | 0          | 17       | ${sha256(SOURCE.slice(0, 17))} | 5`,
          `  turn_fixture_0002 | ΒΗΤΑ.   | 2a           | 2b         | 17         | ${SOURCE.length}       | ${sha256(SOURCE.slice(17))} | 5`,
          "",
        ].join("\n"),
        "utf8",
      );
      const bad = reviewedInner({ turn: "turn_fixture_0002", chain: ["ΒΗΤΑ."], depth: 1 });
      expect(codes(`${block({ end: 17, span: "2a" })}\n${bad}`)).toContain(
        "reviewed_attribution_context_outside_turn",
      );
    });

    it("holds an unresolved record's candidate_owners to the same contract", () => {
      const unresolved = reviewedInner({
        resolution: "unresolved",
        chain: ["ΝΑΡΡ."],
        reviewed: null,
        unresolvedReason: "Both remain locally plausible; the exchange has no named handoff.",
        candidateOwners: ["ΒΗΤΑ.", "ΞΕΝΟΣ."],
      });
      expect(codes(ledger(unresolved))).toContain("candidate_owner_unknown");
    });

    it("accepts an unresolved record with a reason and no candidate list", () => {
      const unresolved = reviewedInner({
        resolution: "unresolved",
        chain: ["ΝΑΡΡ."],
        reviewed: null,
        unresolvedReason: "No formula in this span licenses a terminal owner.",
      });
      expect(validateVoicesLedger(LEDGER_PATH, ledger(unresolved))).toEqual([]);
    });

    it("rejects top-level candidate_owners on an explicitly evidenced record", () => {
      expect(codes(ledger(innerBlock({ candidateOwners: ["ΝΑΡΡ.", "ΒΗΤΑ."] })))).toContain(
        "candidate_owners_unexpected",
      );
    });
  });

  /**
   * The operator's 2026-07-30 ruling on the two sealed Symposium packets: the
   * narrator-repeat licence admits `reviewed_attribution`, so a narrator's own
   * bare reply inside their own narration is resolvable when the local Greek
   * settles it. Before the ruling the two rules composed into an impossible
   * state — `authority_shape_conflict` forbids both shapes at once, so the
   * adjudication path could never carry the in-span cue this licence demanded.
   *
   * The ruling widened one route and nothing else. Everything below that was
   * illegal before is still illegal.
   */
  describe("narrator repeats resolved by reviewed adjudication", () => {
    /** The reported speech [17, 41), chain ending on the narrator repeating themselves. */
    const selfReport = (overrides: BlockOptions = {}) =>
      block({ id: "voice_fixture_0002", start: 17, end: SOURCE.length, chain: ["ΝΑΡΡ.", "ΝΑΡΡ."], ...overrides });

    /** The same span, licensed by adjudication over the whole hashed context. */
    const reviewedSelfReport = (overrides: BlockOptions = {}) =>
      selfReport({ refs: null, reviewed: { contextStart: 0, contextEnd: SOURCE.length }, ...overrides });

    const ledger = (inner: string) => `${block()}\n${inner}`;

    it("still fails a repeated terminal that carries neither authority shape", () => {
      const bare = selfReport({ refs: null });
      expect(codes(ledger(bare))).toContain("chain_repeat_unlicensed");
      expect(codes(ledger(bare))).toContain("evidence_required");
    });

    it("accepts a repeated terminal licensed by a valid reviewed_attribution", () => {
      expect(validateVoicesLedger(LEDGER_PATH, ledger(reviewedSelfReport()))).toEqual([]);
    });

    it("keeps the explicit-evidence route unchanged, pronouns excluded", () => {
      // A first-person pronoun is not a reporting formula. Without a
      // `reviewed_attribution`, only an in-span person_marked_reporting_formula
      // licenses the hop — the ruling adds a route, it does not lower this bar.
      const inSpanCue = { kind: "person_marked_reporting_formula", role: "cue", text: "beta", start: 32, end: 36 };
      expect(validateVoicesLedger(LEDGER_PATH, ledger(selfReport({ refs: [inSpanCue] })))).toEqual([]);
      const named = { kind: "named_reporting_formula", text: "ἔφη ΒΗΤΑ.", start: 17, end: 26 };
      expect(codes(ledger(selfReport({ refs: [named] })))).toContain("chain_repeat_unlicensed");
    });

    it("keeps non-adjacent and stacked repeats illegal under either shape", () => {
      const reentry = ["ΝΑΡΡ.", "ΒΗΤΑ.", "ΝΑΡΡ."];
      const stacked = ["ΝΑΡΡ.", "ΝΑΡΡ.", "ΝΑΡΡ."];
      expect(codes(ledger(reviewedSelfReport({ chain: reentry })))).toContain("chain_repeats_siglum");
      expect(codes(ledger(reviewedSelfReport({ chain: stacked })))).toContain("chain_repeats_siglum");
      // The adjudication does not launder either into a clean record. Note the
      // terminal of a stacked chain reports only `chain_repeats_siglum`: it is
      // already an illegal position, so the licence question never arises.
      expect(validateVoicesLedger(LEDGER_PATH, ledger(reviewedSelfReport({ chain: reentry })))).not.toEqual([]);
      expect(validateVoicesLedger(LEDGER_PATH, ledger(reviewedSelfReport({ chain: stacked })))).not.toEqual([]);
    });

    it("keeps both authority shapes on one repeated terminal a conflict", () => {
      const both = reviewedSelfReport({
        refs: [{ kind: "person_marked_reporting_formula", role: "cue", text: "beta", start: 32, end: 36 }],
      });
      expect(codes(ledger(both))).toContain("authority_shape_conflict");
    });

    it("keeps alternation and previous-speaker carry-forward prohibited", () => {
      // Carry-forward relabelled as anaphoric evidence: the formula is real and
      // in-span, but it is not person-marked, so it cannot license the narrator's
      // own hop — "the previous speaker continues" is not "I said".
      const carryForward = {
        kind: "anaphoric_reporting_formula",
        role: "cue",
        text: "beta",
        start: 32,
        end: 36,
        antecedentText: "ΝΑΡΡ.",
        antecedentStart: 5,
        antecedentEnd: 10,
      };
      expect(codes(ledger(selfReport({ refs: [carryForward] })))).toContain("chain_repeat_unlicensed");
      // And an anaphoric formula still has to name the antecedent it carries
      // forward from, which is what stops a bare pronoun standing in for one.
      expect(codes(ledger(selfReport({ refs: [{ ...carryForward, antecedentText: null }] })))).toContain(
        "evidence_antecedent_missing",
      );
      // Alternation: a chain that hands the floor back and forth is not a chain.
      expect(codes(ledger(reviewedSelfReport({ chain: ["ΝΑΡΡ.", "ΒΗΤΑ.", "ΝΑΡΡ."] })))).toContain(
        "chain_repeats_siglum",
      );
    });
  });
  /**
   * Operator ruling, 2026-08-01, the corpus reported-turn completion campaign wave 2. Five required outer turns are
   * printed with no siglum at all, and until `unlabelled_turn_frame` existed no
   * valid depth-1 record could be written for any of them — which blocked every
   * deeper record too, since a deep span needs a depth-1 parent.
   */
  describe("unlabelled turn frames", () => {
    it("accepts a frame whose chain starts with the turn's real owner", () => {
      writeUnlabelledFixture();
      expect(validateVoicesLedger(LEDGER_PATH, block({ refs: [FRAME_REF] }))).toEqual([]);
    });

    it("requires a frame anchor on the depth-1 record of an unlabelled turn", () => {
      writeUnlabelledFixture();
      expect(codes(block())).toContain("frame_evidence_missing");
    });

    it("refuses (none) in the chain, because it is metadata and not a person", () => {
      writeUnlabelledFixture();
      // It is also unregistered, which is the second, independent reason.
      const issues = codes(block({ chain: ["(none)"], refs: [FRAME_REF] }));
      expect(issues).toContain("chain_prefix_mismatch");
      expect(issues).toContain("chain_siglum_unknown");
    });

    it("confines the frame kind to the depth-1 frame of an unlabelled turn", () => {
      writeUnlabelledFixture();
      const deep = innerBlock({ refs: [{ ...FRAME_REF, start: 17, end: 26, text: "\u1f14\u03c6\u03b7 \u0392\u0397\u03a4\u0391." }] });
      expect(codes(`${block({ refs: [FRAME_REF] })}\n${deep}`)).toContain("frame_evidence_unexpected");
    });

    it("refuses the frame kind on a turn that does print a siglum", () => {
      writeRepoFixture();
      expect(codes(block({ refs: [FRAME_REF] }))).toContain("frame_evidence_unexpected");
    });

    it("leaves the printed-speaker rule untouched where a siglum is printed", () => {
      writeRepoFixture();
      expect(codes(block({ chain: ["\u0392\u0397\u03a4\u0391."] }))).toContain("chain_prefix_mismatch");
    });
  });

  describe("context span bounds", () => {
    const WIDE = `${SOURCE}${"\u03b1".repeat(13000)}`;

    it("accepts a wide context when it remains source-bound and inside the outer turn", () => {
      writeRepoFixture(WIDE);
      const wide = block({
        sourceText: WIDE,
        end: WIDE.length,
        span: "2a-2b",
        refs: null,
        reviewed: { contextStart: 0, contextEnd: WIDE.length, contextSha: sha256(WIDE) },
      });
      expect(validateVoicesLedger(LEDGER_PATH, wide)).toEqual([]);
    });
  });
});

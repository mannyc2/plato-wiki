import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildStephanusIndex, formatStephanusIndexToon } from "./derived/stephanus.js";
import { buildTurnIndex, formatTurnIndexToon } from "./derived/turns.js";
import { buildVoiceIndex, formatVoiceIndexToon } from "./derived/voices.js";
import { setRepoRootForTesting } from "./paths.js";
import { relationCandidateKey } from "./relations.js";
import { collectVoiceClaimConsistencyFailures, validateVoicesLedger } from "./wiki/voices-validator.js";
import {
  CANONICAL_DIALOGUES,
  buildCompletenessFacts,
  buildCompletenessReport,
  collectRelationCandidatesSafely,
  exactRelationCandidateKeyCountsMatch,
  exactRelationPairIdSetsMatch,
  renderCompletenessReport,
  validateCanonicalDialogueSet,
  voiceReviewCounts,
  type CompletenessFacts,
  type DialogueCompletenessFacts,
} from "./completeness.js";
import type { AudioCoverageReport, DialogueAudioCoverage } from "./audio-coverage.js";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

it("counts every yaml block in a voice ledger by its review status", () => {
  const ledger = [
    "```yaml",
    "voice_id: voice_fixture_0041",
    "review_status: unreviewed",
    "```",
    "```yaml",
    "voice_id: voice_fixture_0042",
    "review_status: accepted",
    "```",
  ].join("\n");

  expect(voiceReviewCounts(ledger)).toEqual({ accepted: 1, rejected: 0, unreviewed: 1, needsSplit: 0 });
});

function dialogueFacts(dialogue: string): DialogueCompletenessFacts {
  const review = { accepted: 1, rejected: 0, unreviewed: 0, needsSplit: 0 };
  return {
    dialogue,
    greekSource: true,
    greekProvenance: true,
    englishSource: true,
    englishProvenance: true,
    observations: { ledger: true, valid: true, scopeClosed: true, review: { ...review } },
    claims: { ledger: true, valid: true, scopeClosed: true, review: { ...review } },
    relations: { ledger: true, valid: true, candidates: 1, dispositioned: 1, review: { ...review }, candidateKeysMatch: true },
    derived: { stephanus: true, turns: true, tokens: true, anchors: true, turnLengths: true, assent: true, procedure: true, joins: true },
    englishIndexCurrent: true,
    commentary: { ledger: true, accepted: true, auditAccepted: true, readingPage: true },
    audio: { exposed: false, exposedAccepted: true, attribution: true, screenplay: true, render: true, mastering: true, mechanicalQa: true, acceptance: true, recording: true, website: true },
    reportedTurns: {
      scope: "none",
      scopeIssues: [],
      manifestTurnIds: [],
      ledger: false,
      ledgerValid: false,
      representedTurnIds: [],
      review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 },
      atomicCohort: true,
      compiledIndexCurrent: false,
      acceptedRecords: 0,
      resolvedExplicit: 0,
      resolvedReviewedDiscourse: 0,
      acceptedUnresolved: 0,
    },
    warnings: [],
  };
}

/** A dialogue whose one required outer turn holds a complete accepted cohort. */
function requiredReportedTurns(dialogue: string): DialogueCompletenessFacts["reportedTurns"] {
  return {
    scope: "required",
    scopeIssues: [],
    manifestTurnIds: [`turn_${dialogue}_0001`],
    ledger: true,
    ledgerValid: true,
    representedTurnIds: [`turn_${dialogue}_0001`],
    review: { accepted: 4, rejected: 0, unreviewed: 0, needsSplit: 0 },
    atomicCohort: true,
    compiledIndexCurrent: true,
    acceptedRecords: 4,
    resolvedExplicit: 3,
    resolvedReviewedDiscourse: 1,
    acceptedUnresolved: 0,
  };
}

function completeFacts(): CompletenessFacts {
  return {
    schemaVersion: 1,
    canonicalDialogues: CANONICAL_DIALOGUES,
    discoveredGreek: [...CANONICAL_DIALOGUES],
    discoveredEnglish: [...CANONICAL_DIALOGUES],
    sourceManifestValid: true,
    comparisonValid: true,
    siteValid: true,
    siteEvidence: "fixture site valid",
    relationCandidatesValid: true,
    dialogues: CANONICAL_DIALOGUES.map(dialogueFacts),
    crossDialogueRelations: { ledger: false, valid: false, candidates: 0, dispositioned: 0, review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 }, candidateKeysMatch: true },
    reportedTurnScopeIssues: [],
    apparatus: { infrastructureImplemented: true, state: "contract_pending", required: false, evidence: ["docs/apparatus-protocol.md"] },
  };
}

function reportedTurnFamily(facts: CompletenessFacts) {
  return buildCompletenessReport(facts).families.find((family) => family.id === "CMP-REPORTED-TURNS")!;
}

function reportedTurnLeaf(facts: CompletenessFacts, dialogue: string) {
  return reportedTurnFamily(facts).leaves.find((leaf) => leaf.scope === dialogue)!;
}

describe("canonical target", () => {
  it("accepts only the exact immutable 27-dialogue set", () => {
    expect(validateCanonicalDialogueSet(CANONICAL_DIALOGUES).valid).toBe(true);
    expect(validateCanonicalDialogueSet(CANONICAL_DIALOGUES.slice(0, 26)).valid).toBe(false);
    expect(validateCanonicalDialogueSet([...CANONICAL_DIALOGUES, "fake"])).toEqual(expect.objectContaining({ valid: false, extra: ["fake"] }));
    expect(validateCanonicalDialogueSet([...CANONICAL_DIALOGUES, "apology"])).toEqual(expect.objectContaining({ valid: false, duplicates: ["apology"] }));
  });
});

describe("targets", () => {
  it("is conjunctive rather than score-based", () => {
    const facts = completeFacts();
    facts.dialogues[0]!.derived.tokens = false;
    const report = buildCompletenessReport(facts);
    expect(report.targets.corpus.ready).toBe(false);
    expect(report.targets.corpus.blockers).toContain("CMP-DERIVED");
    expect(renderCompletenessReport(report)).not.toContain("%");
  });

  it("accepts an evidenced zero-candidate relation leaf", () => {
    const facts = completeFacts();
    facts.dialogues[0]!.relations = { ledger: false, valid: false, candidates: 0, dispositioned: 0, review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 }, candidateKeysMatch: true };
    const report = buildCompletenessReport(facts);
    const relation = report.families.find((family) => family.id === "CMP-RELATIONS")!;
    expect(relation.leaves.find((leaf) => leaf.scope === "apology")!.state).toBe("not_applicable");
    expect(relation.state).toBe("pass");
  });

  it("rejects an equal-count relation ledger that disposes a different claim pair", () => {
    // pair_id is positional, so equal counts make the id ranges match while the
    // rows are about other pairs entirely. Identity is the claim pair.
    expect(
      exactRelationCandidateKeyCountsMatch(
        new Map([[relationCandidateKey("cross-dialogue", "claim_meno_0013", "claim_symposium_0128"), 1]]),
        new Map([[relationCandidateKey("cross-dialogue", "claim_meno_0013", "claim_symposium_0129"), 1]]),
      ),
    ).toBe(false);
    expect(
      exactRelationCandidateKeyCountsMatch(
        new Map([[relationCandidateKey("cross-dialogue", "claim_meno_0013", "claim_symposium_0128"), 1]]),
        new Map([[relationCandidateKey("cross-dialogue", "claim_meno_0013", "claim_symposium_0128"), 1]]),
      ),
    ).toBe(true);
    expect(
      exactRelationCandidateKeyCountsMatch(
        new Map([[relationCandidateKey("cross-dialogue", "claim_meno_0013", "claim_symposium_0128"), 2]]),
        new Map([[relationCandidateKey("cross-dialogue", "claim_meno_0013", "claim_symposium_0128"), 1]]),
      ),
    ).toBe(false);
    expect(
      exactRelationPairIdSetsMatch(new Set(["pair_stale_00001"]), new Set(["pair_current_00001"])),
    ).toBe(false);
    const facts = completeFacts();
    facts.dialogues[0]!.relations = {
      ledger: true,
      valid: true,
      candidates: 1,
      dispositioned: 1,
      review: { accepted: 1, rejected: 0, unreviewed: 0, needsSplit: 0 },
      candidateKeysMatch: false,
    };
    const relation = buildCompletenessReport(facts).families.find(
      (family) => family.id === "CMP-RELATIONS",
    )!;
    expect(relation.leaves.find((leaf) => leaf.scope === "apology")!.state).toBe("fail");
  });

  it("fails relations globally when candidate generation throws", () => {
    const candidateResult = collectRelationCandidatesSafely(() => {
      throw new Error("fixture generator failure");
    });
    expect(candidateResult.valid).toBe(false);
    expect(candidateResult.report.entries).toEqual([]);

    const facts = completeFacts();
    facts.relationCandidatesValid = false;
    const relation = buildCompletenessReport(facts).families.find(
      (family) => family.id === "CMP-RELATIONS",
    )!;
    expect(relation.leaves[0]).toEqual(expect.objectContaining({ scope: "global", state: "fail" }));
    expect(relation.state).toBe("fail");
  });

  it("does not hide a stale or invalid zero-candidate ledger as N/A", () => {
    const facts = completeFacts();
    facts.dialogues[0]!.relations = {
      ledger: true,
      valid: false,
      candidates: 0,
      dispositioned: 0,
      review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 },
      candidateKeysMatch: true,
    };
    const relation = buildCompletenessReport(facts).families.find(
      (family) => family.id === "CMP-RELATIONS",
    )!;
    expect(relation.leaves.find((leaf) => leaf.scope === "apology")!.state).toBe("fail");
  });

  it("keeps apparatus contract-pending outside implemented targets", () => {
    const report = buildCompletenessReport(completeFacts());
    expect(report.families.find((family) => family.id === "CMP-APPARATUS")).toEqual(expect.objectContaining({ state: "contract_pending", requiredBy: [] }));
    expect(report.targets["audio-edition"].ready).toBe(true);
  });

  it("allows zero audio for knowledge-base but requires every audio stage for audio-edition", () => {
    const facts = completeFacts();
    for (const entry of facts.dialogues) {
      entry.audio = { exposed: false, exposedAccepted: true, attribution: false, screenplay: false, render: false, mastering: false, mechanicalQa: false, acceptance: false, recording: false, website: false };
    }
    const report = buildCompletenessReport(facts);
    expect(report.targets["knowledge-base"].ready).toBe(true);
    expect(report.targets["audio-edition"].ready).toBe(false);
  });

  it("fails knowledge-base when a draft recording is exposed", () => {
    const facts = completeFacts();
    facts.dialogues[0]!.audio.exposed = true;
    facts.dialogues[0]!.audio.exposedAccepted = false;
    const report = buildCompletenessReport(facts);
    expect(report.targets["knowledge-base"].blockers).toContain("CMP-AUDIO-TRUTH");
  });

  it("reports unattributed-turn limitations as warnings without changing readiness", () => {
    const facts = completeFacts();
    facts.dialogues[0]!.warnings.push("current turn index contains explicit unattributed `(none)` turns");
    const report = buildCompletenessReport(facts);
    expect(report.targets.corpus.ready).toBe(true);
    expect(report.warnings).toHaveLength(1);
  });
});

describe("CMP-REPORTED-TURNS", () => {
  it("is required by every target that claims corpus completeness", () => {
    const family = reportedTurnFamily(completeFacts());
    expect(family.requiredBy).toEqual(["corpus", "knowledge-base", "audio-edition"]);
    expect(family.state).toBe("pass");
  });

  it("fails a canonical dialogue that has a valid outer-turn index but no scope entry", () => {
    const facts = completeFacts();
    facts.dialogues[0]!.reportedTurns = {
      ...facts.dialogues[0]!.reportedTurns,
      scope: "unscoped",
      scopeIssues: ["wiki/reported-turn-scopes.json dialogues: expected every canonical dialogue; got missing: apology"],
    };
    expect(facts.dialogues[0]!.derived.turns).toBe(true);
    expect(reportedTurnLeaf(facts, "apology").state).toBe("fail");
    expect(buildCompletenessReport(facts).targets.corpus.blockers).toContain("CMP-REPORTED-TURNS");
  });

  it("fails a none disposition whose receipt is missing or stale", () => {
    const facts = completeFacts();
    facts.dialogues[1]!.reportedTurns.scopeIssues = [
      "wiki/reported-turn-scopes.json [charmides] reviewReceipt.sha256: expected abc; got def",
    ];
    const leaf = reportedTurnLeaf(facts, "charmides");
    expect(leaf.state).toBe("fail");
    expect(leaf.observed).toContain("reviewReceipt.sha256");
  });

  it("treats a valid none disposition as evidenced not_applicable, never as absence", () => {
    const facts = completeFacts();
    const leaf = reportedTurnLeaf(facts, "critias");
    expect(leaf.state).toBe("not_applicable");
    expect(leaf.evidence.length).toBeGreaterThan(0);
    expect(reportedTurnFamily(facts).state).toBe("pass");
  });

  it("fails a required dialogue with no ledger", () => {
    const facts = completeFacts();
    facts.dialogues[2]!.reportedTurns = {
      ...requiredReportedTurns("cratylus"),
      ledger: false,
      ledgerValid: false,
      representedTurnIds: [],
      review: { accepted: 0, rejected: 0, unreviewed: 0, needsSplit: 0 },
      compiledIndexCurrent: false,
      acceptedRecords: 0,
      resolvedExplicit: 0,
      resolvedReviewedDiscourse: 0,
    };
    expect(reportedTurnLeaf(facts, "cratylus").state).toBe("fail");
  });

  it("fails unreviewed, needs_split, and incompletely re-covered rejected records", () => {
    for (const mutate of [
      (entry: DialogueCompletenessFacts["reportedTurns"]) => {
        entry.review = { accepted: 3, rejected: 0, unreviewed: 1, needsSplit: 0 };
      },
      (entry: DialogueCompletenessFacts["reportedTurns"]) => {
        entry.review = { accepted: 3, rejected: 0, unreviewed: 0, needsSplit: 1 };
      },
      (entry: DialogueCompletenessFacts["reportedTurns"]) => {
        entry.review = { accepted: 3, rejected: 1, unreviewed: 0, needsSplit: 0 };
        entry.atomicCohort = false;
      },
    ]) {
      const facts = completeFacts();
      facts.dialogues[3]!.reportedTurns = requiredReportedTurns("critias");
      mutate(facts.dialogues[3]!.reportedTurns);
      expect(reportedTurnLeaf(facts, "critias").state).toBe("fail");
    }
  });

  it("passes an accepted standalone cohort with no cutover entry and no voice join", () => {
    const facts = completeFacts();
    facts.dialogues[4]!.reportedTurns = requiredReportedTurns("crito");
    const leaf = reportedTurnLeaf(facts, "crito");
    expect(leaf.state).toBe("pass");
    expect(JSON.stringify(leaf)).not.toContain("cutover");
    expect(JSON.stringify(leaf)).not.toContain("join");
    expect(reportedTurnFamily(facts).state).toBe("pass");
  });

  it("passes accepted genuine ambiguity and reports it as a warning count", () => {
    const facts = completeFacts();
    facts.dialogues[5]!.reportedTurns = {
      ...requiredReportedTurns("euthydemus"),
      acceptedUnresolved: 3,
      resolvedExplicit: 1,
    };
    const report = buildCompletenessReport(facts);
    expect(report.families.find((family) => family.id === "CMP-REPORTED-TURNS")!.state).toBe("pass");
    expect(report.targets.corpus.ready).toBe(true);
    expect(report.warnings.some((warning) => warning.startsWith("euthydemus:") && warning.includes("3"))).toBe(true);
  });

  it("passes accepted unresolved records with substantive reasons and no candidate owners", () => {
    const facts = completeFacts();
    facts.dialogues[24]!.reportedTurns = {
      ...requiredReportedTurns("symposium"),
      acceptedRecords: 168,
      resolvedExplicit: 94,
      acceptedUnresolved: 74,
    };
    const leaf = reportedTurnLeaf(facts, "symposium");
    expect(leaf.state).toBe("pass");
    expect(leaf.observed).toContain("unresolved=74");
  });

  it("fails a ledger whose represented outer turns are not exactly the manifest cohort", () => {
    for (const represented of [[], ["turn_gorgias_0001", "turn_gorgias_0009"], ["turn_gorgias_0009"]]) {
      const facts = completeFacts();
      facts.dialogues[7]!.reportedTurns = { ...requiredReportedTurns("gorgias"), representedTurnIds: represented };
      expect(reportedTurnLeaf(facts, "gorgias").state).toBe("fail");
    }
  });

  it("fails a stale or absent compiled index even when the ledger is fully accepted", () => {
    const facts = completeFacts();
    facts.dialogues[8]!.reportedTurns = { ...requiredReportedTurns("greater-hippias"), compiledIndexCurrent: false };
    const leaf = reportedTurnLeaf(facts, "greater-hippias");
    expect(leaf.state).toBe("fail");
    expect(leaf.observed).toContain("compiled_index=false");
  });

  it("aggregates over exactly the canonical dialogues and reports the corpus counts", () => {
    const facts = completeFacts();
    facts.dialogues[17]!.reportedTurns = requiredReportedTurns("phaedo");
    facts.dialogues[24]!.reportedTurns = {
      ...requiredReportedTurns("symposium"),
      acceptedRecords: 10,
      resolvedExplicit: 6,
      resolvedReviewedDiscourse: 2,
      acceptedUnresolved: 2,
    };
    const family = reportedTurnFamily(facts);
    expect(family.leaves.filter((leaf) => leaf.scope !== "global")).toHaveLength(27);
    const global = family.leaves.find((leaf) => leaf.scope === "global")!;
    expect(global.observed).toContain("required=2");
    expect(global.observed).toContain("none=25");
    expect(global.observed).toContain("cohorts=2");
    expect(global.observed).toContain("accepted=14");
    expect(global.observed).toContain("explicit=9");
    expect(global.observed).toContain("reviewed_discourse=3");
    expect(global.observed).toContain("unresolved=2");
    expect(renderCompletenessReport(buildCompletenessReport(facts))).toContain("CMP-REPORTED-TURNS");
  });

  it("fails globally when the manifest itself is unreadable, naming the blocked dialogues", () => {
    const facts = completeFacts();
    facts.reportedTurnScopeIssues = ["wiki/reported-turn-scopes.json manifest: expected valid JSON; got Unexpected token"];
    for (const entry of facts.dialogues) {
      entry.reportedTurns = { ...entry.reportedTurns, scope: "unscoped", scopeIssues: ["manifest unreadable"] };
    }
    const family = reportedTurnFamily(facts);
    expect(family.state).toBe("fail");
    expect(family.leaves.find((leaf) => leaf.scope === "global")!.state).toBe("fail");
    expect(buildCompletenessReport(facts).targets["audio-edition"].blockers).toContain("CMP-REPORTED-TURNS");
  });
});

describe("CMP-REPORTED-TURNS consumer independence", () => {
  /**
   * A whole standalone dialogue on disk: reviewed scope, an accepted atomic
   * cohort, and a current compiled index — with NO entry in
   * `derived/plato/voices/cutovers.toml`, no voice join, and no claim ledger at
   * all. This is the state the voice activation contract made expressible and the Phaedo discourse attribution review landed for
   * Phaedo, and the family must pass on it.
   */
  function standaloneFixture() {
    const repoRoot = mkdtempSync(join(tmpdir(), "reported-turn-standalone-"));
    for (const dir of ["raw/plato/greek", "derived/plato/turns", "derived/plato/voices", "wiki/voices", "wiki/review"]) {
      mkdirSync(join(repoRoot, dir), { recursive: true });
    }
    const restore = setRepoRootForTesting(repoRoot);
    try {
      const greek = "{17a} ΚΡ. ἀκούσατε δή.\nΣΩ. καὶ ὁ ἄνθρωπος εἶπεν· χαῖρε, ὦ Κρίτων.\n{17b} ΚΡ. καλῶς λέγεις.\n";
      writeFileSync(join(repoRoot, "raw/plato/greek/crito.txt"), greek);
      writeFileSync(join(repoRoot, "derived/plato/turns/sigla.toml"), '[[dialogues]]\nslug = "crito"\nsigla = ["ΚΡ.", "ΣΩ."]\n');
      writeFileSync(join(repoRoot, "derived/plato/voices/sigla.toml"), '[[dialogues]]\nslug = "crito"\nsigla = ["ΣΩ.", "ΑΝΘ."]\n');
      const turnIndex = buildTurnIndex("crito");
      const turnIndexToon = formatTurnIndexToon(turnIndex);
      writeFileSync(join(repoRoot, "derived/plato/turns/crito.toon"), turnIndexToon);

      const outer = turnIndex.turns[1]!;
      const innerStart = greek.indexOf("χαῖρε");
      const innerEnd = greek.indexOf("Κρίτων.") + "Κρίτων.".length;
      const cueText = "καὶ ὁ ἄνθρωπος εἶπεν";
      const cueStart = greek.indexOf(cueText);
      const block = (body: string) => `\`\`\`yaml\n${body.trim()}\n\`\`\`\n`;
      const ledger = [
        "# Crito reported turns (fixture)\n",
        block(`
voice_id: voice_crito_0001
source_work: Crito
outer_turn_id: ${outer.turnId}
stephanus_span: 17a
char_span:
  start_char: ${outer.startChar}
  end_char: ${outer.endChar}
source_path: raw/plato/greek/crito.txt
source_sha256: "${sha256(greek)}"
span_sha256: "${sha256(greek.slice(outer.startChar, outer.endChar))}"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    role: cue
    text: "ΣΩ."
    start_char: ${outer.startChar}
    end_char: ${outer.startChar + 3}
limits: "Records that the printed siglum opens this turn."
review_status: accepted
`),
        block(`
voice_id: voice_crito_0002
source_work: Crito
outer_turn_id: ${outer.turnId}
stephanus_span: 17a
char_span:
  start_char: ${innerStart}
  end_char: ${innerEnd}
source_path: raw/plato/greek/crito.txt
source_sha256: "${sha256(greek)}"
span_sha256: "${sha256(greek.slice(innerStart, innerEnd))}"
voice_chain: ["ΣΩ.", "ΑΝΘ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    role: cue
    text: "${cueText}"
    start_char: ${cueStart}
    end_char: ${cueStart + cueText.length}
limits: "The man is the nominative subject of the reporting verb."
review_status: accepted
`),
      ].join("\n");
      writeFileSync(join(repoRoot, "wiki/voices/crito.md"), ledger);
      writeFileSync(join(repoRoot, "derived/plato/voices/crito.toon"), formatVoiceIndexToon(buildVoiceIndex("crito")));

      const receiptPath = "wiki/review/2026-07-26-crito-reported-turn-scope-census.md";
      const receipt = [
        "# crito scope census (fixture)",
        "",
        `**Source**: sha256 \`${sha256(greek)}\``,
        `**Turn index**: sha256 \`${sha256(turnIndexToon)}\``,
        "**Reviewers**: fixture",
        "",
        "## Method",
        "",
        "Cue scan over every outer turn, every hit read.",
        "No translation, doctrine, or style evidence was used.",
        "",
      ].join("\n");
      writeFileSync(join(repoRoot, receiptPath), receipt);
      writeFileSync(
        join(repoRoot, "wiki/reported-turn-scopes.json"),
        JSON.stringify({
          schemaVersion: 1,
          dialogues: [
            {
              dialogue: "crito",
              disposition: "required",
              outerTurnIds: [outer.turnId],
              inputs: {
                greekSourcePath: "raw/plato/greek/crito.txt",
                greekSourceSha256: sha256(greek),
                outerTurnIndexPath: "derived/plato/turns/crito.toon",
                outerTurnIndexSha256: sha256(turnIndexToon),
              },
              reviewReceipt: { path: receiptPath, sha256: sha256(receipt) },
            },
          ],
        }),
      );
      return { repoRoot, restore };
    } catch (error) {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
      throw error;
    }
  }

  it("passes a standalone accepted cohort with no cutover entry, no join, and no claims", () => {
    const { repoRoot, restore } = standaloneFixture();
    try {
      expect(existsSync(join(repoRoot, "derived/plato/voices/cutovers.toml"))).toBe(false);
      expect(existsSync(join(repoRoot, "derived/plato/joins/voices/crito.toon"))).toBe(false);
      expect(existsSync(join(repoRoot, "wiki/claims/crito.md"))).toBe(false);

      const facts = buildCompletenessFacts({
        repoRoot,
        audioCoverage: { dialogues: [] } as unknown as AudioCoverageReport,
        site: { valid: true, pages: [], evidence: "fixture" },
      });
      const crito = facts.dialogues.find((entry) => entry.dialogue === "crito")!;
      expect(crito.reportedTurns).toEqual(
        expect.objectContaining({
          scope: "required",
          scopeIssues: [],
          ledger: true,
          ledgerValid: true,
          atomicCohort: true,
          compiledIndexCurrent: true,
          acceptedRecords: 2,
          resolvedExplicit: 2,
          acceptedUnresolved: 0,
        }),
      );
      const leaf = buildCompletenessReport(facts)
        .families.find((family) => family.id === "CMP-REPORTED-TURNS")!
        .leaves.find((entry) => entry.scope === "crito")!;
      expect(leaf.state).toBe("pass");

      // Activation is a separate, later event. Claim-speaker consistency for an
      // activated dialogue belongs to the cutover checks in the voices
      // validator; this family neither reads the registry nor asks for a join.
      expect(collectVoiceClaimConsistencyFailures("crito")).toEqual([]);
    } finally {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("does not change its verdict when the same dialogue is later activated", () => {
    const { repoRoot, restore } = standaloneFixture();
    try {
      const before = buildCompletenessFacts({
        repoRoot,
        audioCoverage: { dialogues: [] } as unknown as AudioCoverageReport,
        site: { valid: true, pages: [], evidence: "fixture" },
      }).dialogues.find((entry) => entry.dialogue === "crito")!.reportedTurns;

      writeFileSync(
        join(repoRoot, "derived/plato/voices/cutovers.toml"),
        'schema_version = 1\n\n[[dialogues]]\nslug = "crito"\nstatus = "active"\ndecision_note = "wiki/review/2026-07-26-crito-reported-turn-scope-census.md"\n',
      );
      const after = buildCompletenessFacts({
        repoRoot,
        audioCoverage: { dialogues: [] } as unknown as AudioCoverageReport,
        site: { valid: true, pages: [], evidence: "fixture" },
      }).dialogues.find((entry) => entry.dialogue === "crito")!.reportedTurns;

      expect(after).toEqual(before);
    } finally {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

/** Drive the unresolved and reviewed-discourse shapes through the real collector. */
describe("CMP-REPORTED-TURNS ambiguity and reviewed-discourse contract", () => {
  const GREEK =
    "{17a} ΚΡ. ἀκούσατε δή.\n" +
    "ΣΩ. καὶ ὁ ἄνθρωπος εἶπεν· χαῖρε, ὦ Κρίτων. καὶ εἶπεν· ἔρρωσο.\n" +
    "{17b} ΚΡ. καλῶς λέγεις.\n";

  const CUE = "καὶ ὁ ἄνθρωπος εἶπεν";
  const NAMED = { start: GREEK.indexOf("χαῖρε"), end: GREEK.indexOf("Κρίτων.") + "Κρίτων.".length };
  const TRAILING = { start: GREEK.indexOf("καὶ εἶπεν· ἔρρωσο."), end: GREEK.indexOf("ἔρρωσο.") + "ἔρρωσο.".length };

  /** How the third, inner span is written: the whole point of the fixture. */
  type Trailing =
    /** Accepted ambiguity recorded by a substantive reason alone. */
    | "reason_only"
    /** The same ambiguity with optional candidate evidence. */
    | "candidates"
    /** A reviewed adjudication. */
    | "reviewed_discourse";

  type Options = {
    trailing: Trailing;
    /** Declare a second required outer turn and represent no records for it. */
    partialCohort?: boolean;
  };

  function fixture(options: Options) {
    const repoRoot = mkdtempSync(join(tmpdir(), "reported-turn-ambiguity-"));
    for (const dir of ["raw/plato/greek", "derived/plato/turns", "derived/plato/voices", "wiki/voices", "wiki/review"]) {
      mkdirSync(join(repoRoot, dir), { recursive: true });
    }
    const restore = setRepoRootForTesting(repoRoot);
    try {
      writeFileSync(join(repoRoot, "raw/plato/greek/crito.txt"), GREEK);
      writeFileSync(join(repoRoot, "derived/plato/turns/sigla.toml"), '[[dialogues]]\nslug = "crito"\nsigla = ["ΚΡ.", "ΣΩ."]\n');
      writeFileSync(join(repoRoot, "derived/plato/voices/sigla.toml"), '[[dialogues]]\nslug = "crito"\nsigla = ["ΣΩ.", "ΑΝΘ."]\n');
      const turnIndex = buildTurnIndex("crito");
      const turnIndexToon = formatTurnIndexToon(turnIndex);
      writeFileSync(join(repoRoot, "derived/plato/turns/crito.toon"), turnIndexToon);

      const outer = turnIndex.turns[1]!;
      const block = (body: string) => `\`\`\`yaml\n${body.trim()}\n\`\`\`\n`;
      const provenance = (start: number, end: number) =>
        [
          "source_path: raw/plato/greek/crito.txt",
          `source_sha256: "${sha256(GREEK)}"`,
          `span_sha256: "${sha256(GREEK.slice(start, end))}"`,
        ].join("\n");

      const trailingBody = () => {
        if (options.trailing === "reason_only") {
          return [
            'voice_chain: ["ΣΩ."]',
            "depth: 2",
            "resolution: unresolved",
            'unresolved_reason: "The bare εἶπεν names no subject, and no vocative identifies the addressee."',
            'limits: "Context makes the man plausible, but no formula licenses him."',
          ].join("\n");
        }
        if (options.trailing === "candidates") {
          return [
            'voice_chain: ["ΣΩ."]',
            "depth: 2",
            "resolution: unresolved",
            'candidate_owners: ["ΣΩ.", "ΑΝΘ."]',
            'unresolved_reason: "The bare εἶπεν names no subject, and no vocative identifies the addressee."',
            'limits: "Context makes the man plausible, but no formula licenses him."',
          ].join("\n");
        }
        return [
          'voice_chain: ["ΣΩ.", "ΑΝΘ."]',
          "depth: 2",
          "resolution: resolved",
          "reviewed_attribution:",
          "  kind: discourse_resolution",
          '  candidate_owners: ["ΣΩ.", "ΑΝΘ."]',
          "  context_span:",
          `    start_char: ${outer.startChar}`,
          `    end_char: ${outer.endChar}`,
          `    text_sha256: "${sha256(GREEK.slice(outer.startChar, outer.endChar))}"`,
          '  rationale: "The man is the nominative subject of the preceding εἶπεν and no handoff intervenes before this second one."',
          'limits: "A reviewed adjudication over the cited context, not a naming formula."',
        ].join("\n");
      };

      const ledger = [
        "# Crito reported turns (fixture)\n",
        block(`
voice_id: voice_crito_0001
source_work: Crito
outer_turn_id: ${outer.turnId}
stephanus_span: 17a
char_span:
  start_char: ${outer.startChar}
  end_char: ${outer.endChar}
${provenance(outer.startChar, outer.endChar)}
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    role: cue
    text: "ΣΩ."
    start_char: ${outer.startChar}
    end_char: ${outer.startChar + 3}
limits: "Records that the printed siglum opens this turn."
review_status: accepted
`),
        block(`
voice_id: voice_crito_0002
source_work: Crito
outer_turn_id: ${outer.turnId}
stephanus_span: 17a
char_span:
  start_char: ${NAMED.start}
  end_char: ${NAMED.end}
${provenance(NAMED.start, NAMED.end)}
voice_chain: ["ΣΩ.", "ΑΝΘ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    role: cue
    text: "${CUE}"
    start_char: ${GREEK.indexOf(CUE)}
    end_char: ${GREEK.indexOf(CUE) + CUE.length}
limits: "The man is the nominative subject of the reporting verb."
review_status: accepted
`),
        block(`
voice_id: voice_crito_0003
source_work: Crito
outer_turn_id: ${outer.turnId}
stephanus_span: 17a
char_span:
  start_char: ${TRAILING.start}
  end_char: ${TRAILING.end}
${provenance(TRAILING.start, TRAILING.end)}
${trailingBody()}
review_status: accepted
`),
      ].join("\n");
      writeFileSync(join(repoRoot, "wiki/voices/crito.md"), ledger);
      writeFileSync(join(repoRoot, "derived/plato/voices/crito.toon"), formatVoiceIndexToon(buildVoiceIndex("crito")));

      const receiptPath = "wiki/review/2026-07-26-crito-reported-turn-scope-census.md";
      const receipt = [
        "# crito scope census (fixture)",
        "",
        `**Source**: sha256 \`${sha256(GREEK)}\``,
        `**Turn index**: sha256 \`${sha256(turnIndexToon)}\``,
        "**Reviewers**: fixture",
        "",
        "## Method",
        "",
        "Cue scan over every outer turn, every hit read.",
        "No translation, doctrine, or style evidence was used.",
        "",
      ].join("\n");
      writeFileSync(join(repoRoot, receiptPath), receipt);
      // The Symposium shape: a manifest cohort the ledger does not represent.
      const outerTurnIds = options.partialCohort
        ? [outer.turnId, turnIndex.turns[2]!.turnId].sort()
        : [outer.turnId];
      writeFileSync(
        join(repoRoot, "wiki/reported-turn-scopes.json"),
        JSON.stringify({
          schemaVersion: 1,
          dialogues: [
            {
              dialogue: "crito",
              disposition: "required",
              outerTurnIds,
              inputs: {
                greekSourcePath: "raw/plato/greek/crito.txt",
                greekSourceSha256: sha256(GREEK),
                outerTurnIndexPath: "derived/plato/turns/crito.toon",
                outerTurnIndexSha256: sha256(turnIndexToon),
              },
              reviewReceipt: { path: receiptPath, sha256: sha256(receipt) },
            },
          ],
        }),
      );
      return { repoRoot, restore, outerTurnIds };
    } catch (error) {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
      throw error;
    }
  }

  function evaluate(repoRoot: string) {
    const facts = buildCompletenessFacts({
      repoRoot,
      audioCoverage: { dialogues: [] } as unknown as AudioCoverageReport,
      site: { valid: true, pages: [], evidence: "fixture" },
    });
    const report = buildCompletenessReport(facts);
    return {
      facts: facts.dialogues.find((entry) => entry.dialogue === "crito")!.reportedTurns,
      leaf: report.families
        .find((family) => family.id === "CMP-REPORTED-TURNS")!
        .leaves.find((entry) => entry.scope === "crito")!,
      report,
    };
  }

  function withFixture(options: Options, assert: (context: ReturnType<typeof evaluate> & { repoRoot: string }) => void) {
    const { repoRoot, restore } = fixture(options);
    try {
      assert({ ...evaluate(repoRoot), repoRoot });
    } finally {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
    }
  }

  it("counts a reasoned unresolved record without candidate owners", () => {
    withFixture({ trailing: "reason_only" }, ({ facts, leaf, report, repoRoot }) => {
      expect(
        validateVoicesLedger("wiki/voices/crito.md", readFileSync(join(repoRoot, "wiki/voices/crito.md"), "utf8")),
      ).toEqual([]);
      expect(facts.ledgerValid).toBe(true);
      expect(facts.acceptedUnresolved).toBe(1);
      expect(leaf.state).toBe("pass");
      expect(report.warnings.some((warning) => warning.startsWith("crito:") && warning.includes("1"))).toBe(true);
    });
  });

  it("passes the same span once it names locally plausible candidates and a reason", () => {
    withFixture({ trailing: "candidates" }, ({ facts, leaf, report }) => {
      expect(facts.acceptedUnresolved).toBe(1);
      expect(leaf.state).toBe("pass");
      // Genuine ambiguity is reported, never treated as missing data.
      expect(report.warnings.some((warning) => warning.startsWith("crito:") && warning.includes("1"))).toBe(true);
    });
  });

  it("counts a reviewed-discourse resolution as resolved and marks the compiled row", () => {
    withFixture({ trailing: "reviewed_discourse" }, ({ facts, leaf, repoRoot }) => {
      expect(facts.resolvedExplicit).toBe(2);
      expect(facts.resolvedReviewedDiscourse).toBe(1);
      expect(facts.acceptedUnresolved).toBe(0);
      expect(leaf.state).toBe("pass");

      // The basis marker is what tells a consumer this owner came from
      // adjudication rather than from bytes it could re-check itself.
      const index = readFileSync(join(repoRoot, "derived/plato/voices/crito.toon"), "utf8");
      expect(index).toContain("resolution_basis");
      expect(index).toContain("reviewed_discourse");
      expect(buildVoiceIndex("crito").records.filter((record) => record.resolutionBasis === "reviewed_discourse")).toHaveLength(1);
    });
  });

  it("fails a required dialogue that represents only one of two manifest cohorts", () => {
    // The live Symposium blocker: 168 accepted records, atomic, compiled and
    // current — for turn_symposium_0005 alone, while turn_symposium_0001 has
    // no records at all. A complete cohort must not mask an absent one.
    withFixture({ trailing: "candidates", partialCohort: true }, ({ facts, leaf }) => {
      expect(facts.manifestTurnIds).toHaveLength(2);
      expect(facts.representedTurnIds).toHaveLength(1);
      expect(facts.atomicCohort).toBe(true);
      expect(facts.compiledIndexCurrent).toBe(true);
      expect(leaf.state).toBe("fail");
      expect(leaf.observed).toContain("cohorts=1/2");
      expect(leaf.observed).toContain("missing: ");
    });
  });
});

function invalidCoverage(dialogue: string) {
  return {
    dialogue,
    commentary: { accepted: false },
    qualityAudit: { passed: false },
    screenplay: { complete: false },
    qa: { passed: false },
    recording: { accepted: false },
    website: {
      hasAudioElement: false,
      hasAudioSource: false,
      linked: false,
    },
  } as unknown as DialogueAudioCoverage;
}

describe("collector isolation", () => {
  it("counts duplicate relation candidate keys as excess dispositions", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "completeness-relation-counts-"));
    try {
      mkdirSync(join(repoRoot, "wiki/claims"), { recursive: true });
      mkdirSync(join(repoRoot, "wiki/relations"), { recursive: true });
      writeFileSync(
        join(repoRoot, "wiki/claims/meno.md"),
        [
          "```yaml\nclaim_id: claim_meno_0001\nclaim_kind: definition\ngreek_terms: [ἀρετή]\nfinal_status: left_standing\nreview_status: accepted\n```",
          "```yaml\nclaim_id: claim_meno_0002\nclaim_kind: thesis\ngreek_terms: [ἀρετή]\nfinal_status: left_standing\nreview_status: accepted\n```",
        ].join("\n\n"),
        "utf8",
      );
      writeFileSync(
        join(repoRoot, "wiki/relations/meno.md"),
        [
          "```yaml\nrelation_id: rel_meno_0001\npair_id: pair_meno_00001\nclaim_a: claim_meno_0001\nclaim_b: claim_meno_0002\nrelation_kind: tension\nresolution: standing\nbasis: The two claim contents pull in different directions.\nlimits: Checked within Meno accepted claim coverage only.\nreview_status: accepted\n```",
          "```yaml\nrelation_id: rel_meno_0002\npair_id: pair_meno_00002\nclaim_a: claim_meno_0001\nclaim_b: claim_meno_0002\nrelation_kind: tension\nresolution: standing\nbasis: The two claim contents pull in different directions.\nlimits: Checked within Meno accepted claim coverage only.\nreview_status: accepted\n```",
        ].join("\n\n"),
        "utf8",
      );

      const facts = buildCompletenessFacts({
        repoRoot,
        audioCoverage: { dialogues: [] } as unknown as AudioCoverageReport,
        site: { valid: true, pages: [], evidence: "fixture" },
      });
      const meno = facts.dialogues.find((entry) => entry.dialogue === "meno")!;
      expect(meno.relations).toEqual(expect.objectContaining({
        candidates: 1,
        dispositioned: 2,
        candidateKeysMatch: false,
      }));
      expect(
        buildCompletenessReport(facts).families
          .find((family) => family.id === "CMP-RELATIONS")!
          .leaves.find((leaf) => leaf.scope === "meno")!.state,
      ).toBe("fail");
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it("uses the injected root and composes canonical ledger and commentary validators", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "completeness-fixture-"));
    try {
      mkdirSync(join(repoRoot, "wiki/commentary"), { recursive: true });
      mkdirSync(join(repoRoot, "wiki/commentary-audits"), { recursive: true });
      for (const family of ["observations", "claims", "relations"]) {
        mkdirSync(join(repoRoot, `wiki/${family}`), { recursive: true });
        writeFileSync(
          join(repoRoot, `wiki/${family}/apology.md`),
          "```yaml\nreview_status: accepted\nreview_status: accepted\n```\n",
        );
      }
      writeFileSync(
        join(repoRoot, "wiki/commentary/apology.md"),
        "```yaml\ncommentary_id: commentary_apology_fixture\nreview_status: accepted\n```\n",
      );
      writeFileSync(
        join(repoRoot, "wiki/commentary-audits/apology.json"),
        JSON.stringify({ acceptance: { decision: "accepted" } }),
      );
      const audioCoverage = {
        dialogues: [invalidCoverage("apology")],
      } as unknown as AudioCoverageReport;

      const facts = buildCompletenessFacts({
        repoRoot,
        audioCoverage,
        site: {
          valid: true,
          pages: ["dialogues/apology/reading.html"],
          evidence: "fixture site",
        },
      });

      expect(facts.discoveredGreek).toEqual([]);
      expect(facts.dialogues[0]).toEqual(expect.objectContaining({
        dialogue: "apology",
        greekSource: false,
        observations: expect.objectContaining({ ledger: true, valid: false, scopeClosed: false }),
        claims: expect.objectContaining({ ledger: true, valid: false, scopeClosed: false }),
        relations: expect.objectContaining({ ledger: true, valid: false, candidates: 0 }),
        commentary: {
          ledger: true,
          accepted: false,
          auditAccepted: false,
          readingPage: true,
        },
      }));
      expect(facts.comparisonValid).toBe(false);
      const report = buildCompletenessReport(facts);
      expect(report.families.find((family) => family.id === "CMP-OBSERVATIONS")!.leaves[0]!.state).toBe("fail");
      expect(report.families.find((family) => family.id === "CMP-CLAIMS")!.leaves[0]!.state).toBe("fail");
      expect(report.families.find((family) => family.id === "CMP-RELATIONS")!.leaves.find((leaf) => leaf.scope === "apology")!.state).toBe("fail");
      expect(report.families.find((family) => family.id === "CMP-READINGS")!.leaves[0]!.state).toBe("fail");
      expect(report.families.find((family) => family.id === "CMP-WRITING-AUDIT")!.leaves[0]!.state).toBe("fail");
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

/**
 * Derived-artifact currency is established by rebuilding the artifact and
 * comparing it byte for byte — for the whole corpus that is 68MB of token index
 * alone, so the result is cached under `.cache/`. The cache is only safe if it
 * is keyed on the artifact's own bytes: a corrupted artifact must not inherit
 * the previous run's verdict.
 */
describe("derived-artifact verification cache", () => {
  function fixture(body: (repoRoot: string) => void) {
    const repoRoot = mkdtempSync(join(tmpdir(), "artifact-cache-"));
    for (const dir of ["raw/plato/greek", "derived/plato/stephanus"]) {
      mkdirSync(join(repoRoot, dir), { recursive: true });
    }
    const restore = setRepoRootForTesting(repoRoot);
    try {
      body(repoRoot);
    } finally {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
    }
  }

  function stephanusCurrency(repoRoot: string) {
    const facts = buildCompletenessFacts({
      repoRoot,
      audioCoverage: { dialogues: [] } as unknown as AudioCoverageReport,
      site: { valid: true, pages: [], evidence: "fixture" },
    });
    return facts.dialogues.find((entry) => entry.dialogue === "crito")!.derived.stephanus;
  }

  it("stops reporting an artifact current once its bytes are corrupted", () => {
    fixture((repoRoot) => {
      writeFileSync(join(repoRoot, "raw/plato/greek/crito.txt"), "{43a} ἀλφα\n{43b} βητα\n", "utf8");
      const indexPath = join(repoRoot, "derived/plato/stephanus/crito.toon");
      writeFileSync(indexPath, formatStephanusIndexToon(buildStephanusIndex("crito")), "utf8");

      // First pass verifies by full rebuild and records the verdict.
      expect(stephanusCurrency(repoRoot)).toBe(true);
      // Second pass may answer from the cache; it must still say current.
      expect(stephanusCurrency(repoRoot)).toBe(true);

      const corrupted = readFileSync(indexPath, "utf8").replace(/43b/gu, "43c");
      writeFileSync(indexPath, corrupted, "utf8");
      expect(stephanusCurrency(repoRoot)).toBe(false);
    });
  });

  it("stops reporting an artifact current once its source moves under it", () => {
    fixture((repoRoot) => {
      const greekPath = join(repoRoot, "raw/plato/greek/crito.txt");
      writeFileSync(greekPath, "{43a} ἀλφα\n{43b} βητα\n", "utf8");
      writeFileSync(
        join(repoRoot, "derived/plato/stephanus/crito.toon"),
        formatStephanusIndexToon(buildStephanusIndex("crito")),
        "utf8",
      );
      expect(stephanusCurrency(repoRoot)).toBe(true);

      writeFileSync(greekPath, "{43a} ἀλφα\n{43b} βητα\n{43c} γαμμα\n", "utf8");
      expect(stephanusCurrency(repoRoot)).toBe(false);
    });
  });
});

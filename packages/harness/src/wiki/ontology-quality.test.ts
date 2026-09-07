import { afterEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  evaluateOntologyQuality,
  invalidOntologyAssignmentBasis,
  normalizeOntologyQualityText,
  renderOntologyQualityReport,
  writeOntologyQualityReport,
} from "./ontology-quality.js";
import {
  deriveOntologyVNextAxisId,
  deriveOntologyVNextConceptId,
  deriveOntologyVNextMembershipId,
  renderOntologyVNextDocuments,
  type OntologyVNextAxis,
  type OntologyVNextConcept,
  type OntologyVNextMembership,
} from "./ontology-vnext.js";

const temporaryRoots: string[] = [];
afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const scopes = ["apology", "crito", "meno"];
const observationIds = scopes.map((slug) => `obs_${slug}_0001`);
const greekSource = "[1a] λόγος.\n";
const sourceHash = createHash("sha256").update(greekSource).digest("hex");

function fixture() {
  const repoRoot = mkdtempSync(join(tmpdir(), "ontology-quality-"));
  temporaryRoots.push(repoRoot);
  mkdirSync(join(repoRoot, "wiki/ontology"), { recursive: true });
  mkdirSync(join(repoRoot, "wiki/observations"), { recursive: true });
  mkdirSync(join(repoRoot, "raw/plato/greek"), { recursive: true });
  for (const [index, scope] of scopes.entries()) {
    writeFileSync(join(repoRoot, `raw/plato/greek/${scope}.txt`), greekSource);
    writeFileSync(join(repoRoot, `wiki/observations/${scope}.md`), observationBlock(observationIds[index]!, "accepted"));
  }
  const axis: OntologyVNextAxis = {
    schema_version: 1,
    axis_id: deriveOntologyVNextAxisId("textual_function", "definition_response"),
    axis_key: "definition_response",
    dimension: "textual_function",
    comparison_question: "How does the speaker answer a request for a definition?",
  };
  const concepts: OntologyVNextConcept[] = [
    ["example", "The speaker supplies an instance of the requested kind."],
    ["general_account", "The answer supplies one account intended to cover every instance."],
    ["refusal", "The respondent declines to provide the requested definition."],
  ].map(([key, definition]) => ({
    schema_version: 1,
    concept_id: deriveOntologyVNextConceptId(axis.axis_id, key!),
    axis_id: axis.axis_id,
    concept_key: key!,
    definition: definition!,
    comparison_question: axis.comparison_question,
  }));
  const memberships: OntologyVNextMembership[] = concepts.flatMap((concept, index) =>
    [observationIds[index]!, observationIds[(index + 1) % observationIds.length]!].map((observationId) => ({
      schema_version: 1,
      membership_id: deriveOntologyVNextMembershipId(observationId, concept.concept_id),
      observation_id: observationId,
      concept_id: concept.concept_id,
      assignment_basis: "The named respondent gives an answer to the explicit request for a definition.",
    }))
  );
  const rows = { axes: [axis], concepts, memberships };
  const save = () => {
    const documents = renderOntologyVNextDocuments(rows);
    for (const [name, content] of Object.entries(documents)) {
      writeFileSync(join(repoRoot, `wiki/ontology/${name}.jsonl`), content);
    }
  };
  save();
  return { repoRoot, rows, save, evaluate: () => evaluateOntologyQuality({ repoRoot, canonicalDialogues: scopes }) };
}

function observationBlock(id: string, status: "accepted" | "rejected") {
  const scope = /^obs_([a-z0-9-]+)_/u.exec(id)?.[1] ?? "apology";
  return `\`\`\`yaml
observation_id: ${id}
source_work: ${scope}
stephanus_span: 1a
source_ref:
  source_path: raw/plato/greek/${scope}.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: 0
  end_char: ${greekSource.length}
  text_sha256: ${sourceHash}
greek_terms: []
english_gloss: account
observation: The respondent names an account.
textual_basis: The cited text contains the named term.
limits: The record does not establish an endorsement.
supports_claim_ids: []
review_status: ${status}
\`\`\`
`;
}

function writeDisposition(repoRoot: string, observationId: string) {
  writeFileSync(join(repoRoot, "wiki/ontology/dispositions.jsonl"), `${JSON.stringify({
    basis: "The observation records an item outside the admitted comparison questions.",
    disposition: "no_axis_applies",
    observation_id: observationId,
  })}\n`);
}

describe("ontology quality normalization", () => {
  it("detects substitutions of whole key phrases without replacing partial words", () => {
    const first = normalizeOntologyQualityText("How does civic_property theory work?", ["civic_property_theory"]);
    const second = normalizeOntologyQualityText("HOW does penalty-grading work?", ["penalty_grading"]);
    expect(first).toBe("how does <key> work");
    expect(second).toBe(first);
    expect(normalizeOntologyQualityText("Is lawful speech a law?", ["law"])).toBe("is lawful speech a <key>");
    expect(normalizeOntologyQualityText("Is law law?", ["law"])).toBe("is <key> <key>");
  });

  it("rejects both scrubbed phrases and a bare classification key", () => {
    for (const basis of [
      "Its frozen the retired pre-cut assignment assignment is preserved.",
      "The assignment MATCHES  THE REGISTRY semantic pair.",
      "definition_response", "definition response", "`example`", "example.", "example", " ",
    ]) {
      expect(invalidOntologyAssignmentBasis(basis, "definition_response", "example")).toBe(true);
    }
    expect(invalidOntologyAssignmentBasis("The speaker gives an example when asked for a definition.", "definition_response", "example")).toBe(false);
  });
});

describe("ontology quality gates", () => {
  it("counts multi-memberships and dialogue support but does not manufacture ratification or independence", () => {
    const subject = fixture();
    const report = subject.evaluate();
    expect(report.inputErrors).toEqual([]);
    expect(report.metrics?.acceptedObservations).toBe(3);
    expect(report.metrics?.memberships).toBe(6);
    expect(report.metrics?.multipleMembershipObservations).toBe(3);
    expect(report.metrics?.membershipHistogram).toEqual([{ memberships: 2, observations: 3 }]);
    expect(report.metrics?.axes[0]?.dialogues).toEqual(scopes);
    expect(report.metrics?.axes[0]?.acceptedObservations).toBe(3);
    expect(report.metrics?.axes[0]?.crossDialogueConcepts).toBe(3);
    expect(report.gates.concepts.state).toBe("pass");
    expect(report.dialogues.every((dialogue) => dialogue.state === "pass")).toBe(true);
    expect(report.gates.axes.state).toBe("fail");
    expect(report.gates.independence.state).toBe("fail");
    expect(report.metrics?.ratifiedAxisCeiling).toBeNull();
    expect(report.metrics?.firstPassRecall).toBeNull();
    expect(report.metrics?.agreementRate).toBeNull();
  });

  it("uses all accepted observations in the ratio denominator and excludes rejected records", () => {
    const subject = fixture();
    writeFileSync(join(subject.repoRoot, "wiki/observations/apology.md"),
      observationBlock("obs_apology_0001", "accepted") + observationBlock("obs_apology_0002", "accepted") + observationBlock("obs_apology_0003", "rejected"));
    const report = subject.evaluate();
    expect(report.metrics?.acceptedObservations).toBe(4);
    expect(report.metrics?.classifiedObservations).toBe(3);
    expect(report.metrics?.uncoveredObservations).toBe(1);
    expect(report.metrics?.membershipsPerAcceptedObservation).toBe(1.5);
    expect(report.metrics?.membershipsPerClassifiedObservation).toBe(2);
    expect(report.dialogues[0]?.membershipsPerObservation).toBe(1);
    expect(report.dialogues[0]?.state).toBe("fail");
    expect(report.dialogues[0]?.uncoveredObservationIds).toContain("obs_apology_0002");
    expect(report.dialogues[0]?.uncoveredObservationIds).not.toContain("obs_apology_0003");
    writeDisposition(subject.repoRoot, "obs_apology_0002");
    const dispositioned = subject.evaluate();
    expect(dispositioned.metrics?.uncoveredObservations).toBe(0);
    expect(dispositioned.metrics?.dispositionedObservations).toBe(1);
    expect(dispositioned.dialogues[0]?.membershipsPerObservation).toBe(1);
    expect(dispositioned.dialogues[0]?.state).toBe("fail");
  });

  it("counts invalid bases as membership rows and identifies affected accepted observations", () => {
    const subject = fixture();
    for (const membership of subject.rows.memberships) {
      if (membership.observation_id === "obs_meno_0001") membership.assignment_basis = "It matches the registry.";
    }
    subject.save();
    const report = subject.evaluate();
    expect(report.metrics?.invalidBases).toBe(2);
    expect(report.dialogues.find((dialogue) => dialogue.scope === "meno")?.invalidBases).toBe(2);
    expect(report.dialogues.find((dialogue) => dialogue.scope === "meno")?.state).toBe("fail");
    expect(report.dialogues.find((dialogue) => dialogue.scope === "meno")?.invalidBasisObservationIds).toContain("obs_meno_0001");
  });

  it("groups definition templates only within an axis and detects question templates across axes", () => {
    const subject = fixture();
    subject.rows.axes[0]!.comparison_question = "How does definition response operate?";
    subject.rows.concepts[0]!.definition = "The passage records example.";
    subject.rows.concepts[1]!.definition = "The passage records general account.";
    const otherAxis: OntologyVNextAxis = {
      ...subject.rows.axes[0]!,
      axis_key: "speaker_answer", axis_id: deriveOntologyVNextAxisId("textual_function", "speaker_answer"),
      comparison_question: "How does speaker answer operate?",
    };
    subject.rows.axes.push(otherAxis);
    subject.rows.concepts.push({
      ...subject.rows.concepts[0]!,
      axis_id: otherAxis.axis_id, concept_id: deriveOntologyVNextConceptId(otherAxis.axis_id, "example"),
    });
    subject.save();
    const report = subject.evaluate();
    expect(report.metrics?.duplicateQuestions).toHaveLength(1);
    expect(report.metrics?.duplicateQuestions[0]?.keys).toEqual(["definition_response", "speaker_answer"]);
    expect(report.metrics?.duplicateDefinitions).toHaveLength(1);
    expect(report.metrics?.duplicateDefinitions[0]?.keys).toEqual(["definition_response/example", "definition_response/general_account"]);
    expect(report.gates.concepts.state).toBe("fail");
  });

  it("fails closed for missing, malformed, conflicting, or noncanonical disposition evidence", () => {
    const subject = fixture();
    writeDisposition(subject.repoRoot, "obs_missing_0001");
    expect(subject.evaluate().metrics).toBeNull();
    writeDisposition(subject.repoRoot, "obs_meno_0001");
    expect(subject.evaluate().inputErrors[0]).toContain("both memberships");
    writeFileSync(join(subject.repoRoot, "wiki/ontology/dispositions.jsonl"), "{}\n");
    expect(subject.evaluate().inputErrors[0]).toContain("expected observation_id");
    writeFileSync(join(subject.repoRoot, "wiki/ontology/dispositions.jsonl"), "{broken\n");
    expect(subject.evaluate().metrics).toBeNull();
  });

  it("detects identical authored text even when masking changes only one row", () => {
    const subject = fixture();
    subject.rows.concepts[0]!.definition = "The speaker supplies an example.";
    subject.rows.concepts[1]!.definition = "The speaker supplies an example.";
    subject.rows.axes[0]!.comparison_question = "What does definition response do for the inquiry?";
    subject.rows.axes.push({
      ...subject.rows.axes[0]!, axis_key: "speaker_answer",
      axis_id: deriveOntologyVNextAxisId("textual_function", "speaker_answer"),
    });
    subject.save();
    const report = subject.evaluate();
    expect(report.metrics?.duplicateQuestions).toHaveLength(1);
    expect(report.metrics?.duplicateDefinitions).toHaveLength(1);
    expect(report.gates.concepts.state).toBe("fail");
  });

  it("never turns invalid or duplicate observation identities into a smaller valid corpus", () => {
    const subject = fixture();
    writeFileSync(join(subject.repoRoot, "wiki/observations/apology.md"), observationBlock("obs_apology_0001", "accepted").repeat(2));
    const duplicate = subject.evaluate();
    expect(duplicate.inputErrors[0]).toContain("Duplicate observation id");
    expect(duplicate.metrics).toBeNull();
    expect(duplicate.dialogues).toHaveLength(3);
    expect(duplicate.dialogues.every((dialogue) => dialogue.state === "fail" && dialogue.acceptedObservations === null)).toBe(true);
    writeFileSync(join(subject.repoRoot, "wiki/observations/apology.md"), observationBlock("invalid", "accepted"));
    expect(subject.evaluate().inputErrors[0]).toContain("Invalid observation identity");
    writeFileSync(join(subject.repoRoot, "wiki/observations/apology.md"), observationBlock("obs_apology_0001", "accepted"));
    writeFileSync(join(subject.repoRoot, "wiki/ontology/axes.jsonl"), "{}\n");
    expect(subject.evaluate().metrics).toBeNull();
    expect(subject.evaluate().gates.concepts.state).toBe("fail");
  });

  it("reports a missing canonical dialogue as a failing leaf", () => {
    const subject = fixture();
    const report = evaluateOntologyQuality({ repoRoot: subject.repoRoot, canonicalDialogues: [...scopes, "laws"] });
    const laws = report.dialogues.find((dialogue) => dialogue.scope === "laws");
    expect(laws?.state).toBe("fail");
    expect(laws?.acceptedObservations).toBe(0);
    expect(laws?.membershipsPerObservation).toBe(0);
  });

  it("rejects a foreign dialogue identity instead of crediting its ledger to multiple dialogues", () => {
    const subject = fixture();
    const path = join(subject.repoRoot, "wiki/observations/apology.md");
    const record = observationBlock("obs_apology_0002", "accepted").replace("obs_apology_0002", "obs_laws_0002");
    writeFileSync(path, observationBlock("obs_apology_0001", "accepted") + record);
    const report = subject.evaluate();
    expect(report.metrics).toBeNull();
    expect(report.inputErrors[0]).toContain("dialogue must match the ledger filename");
    expect(report.dialogues.every((dialogue) => dialogue.state === "fail")).toBe(true);
  });

  it("rejects orphan observations, empty ledgers, malformed YAML, and broken Greek source bindings", () => {
    const subject = fixture();
    const path = join(subject.repoRoot, "wiki/observations/apology.md");
    const valid = observationBlock("obs_apology_0001", "accepted");
    writeFileSync(path, `${valid}\nobservation_id: obs_apology_0002\nreview_status: accepted\n`);
    const orphan = subject.evaluate();
    expect(orphan.metrics).toBeNull();
    expect(orphan.inputErrors[0]).toContain("observation_count_mismatch");
    expect(orphan.inputErrors[0]).toContain("orphan_ledger_field");
    writeFileSync(path, "# No fenced records\n");
    expect(subject.evaluate().inputErrors[0]).toContain("missing_record");
    writeFileSync(path, "```yaml\nobservation_id: [\n```\n");
    expect(subject.evaluate().metrics).toBeNull();
    writeFileSync(path, valid);
    writeFileSync(join(subject.repoRoot, "raw/plato/greek/apology.txt"), "changed source");
    expect(subject.evaluate().inputErrors[0]).toContain("source_ref_hash_mismatch");
  });

  it("uses only canonical paths for job evidence, including currently absent dispositions", () => {
    const report = fixture().evaluate();
    for (const leaf of [...Object.values(report.gates), ...report.dialogues]) {
      expect(leaf.evidence.every((path) => /^(?:wiki|raw|docs)\//u.test(path))).toBe(true);
      expect(leaf.evidence).toContain("wiki/ontology/axes.jsonl");
      expect(leaf.evidence).toContain("wiki/ontology/concepts.jsonl");
      expect(leaf.evidence).toContain("wiki/ontology/dispositions.jsonl");
    }
  });
});

describe("ontology quality report", () => {
  it("renders exact questions and derives byte-stable output without rewriting the canonical ledgers", () => {
    const subject = fixture();
    const canonicalBefore = readFileSync(join(subject.repoRoot, "wiki/ontology/memberships.jsonl"), "utf8");
    const first = renderOntologyQualityReport(subject.evaluate());
    subject.rows.axes.reverse();
    subject.rows.concepts.reverse();
    subject.rows.memberships.reverse();
    subject.save();
    const second = renderOntologyQualityReport(subject.evaluate());
    expect(first).toBe(second);
    expect(first.endsWith("\n\n")).toBe(false);
    expect(first).toContain(subject.rows.axes[0]!.comparison_question);
    expect(first).toContain("**unavailable**");
    const path = writeOntologyQualityReport(subject.evaluate(), subject.repoRoot);
    expect(readFileSync(path, "utf8")).toBe(first);
    expect(readFileSync(join(subject.repoRoot, "wiki/ontology/memberships.jsonl"), "utf8")).toBe(canonicalBefore);
  });

  it("renders errors without publishing invalid inputs as zero counts", () => {
    const report = evaluateOntologyQuality({ repoRoot: "/private/tmp/ontology-quality-path-does-not-exist", canonicalDialogues: scopes });
    expect(report.metrics).toBeNull();
    const rendered = renderOntologyQualityReport(report);
    expect(rendered).toContain("No quality counts are published for invalid canonical inputs");
    expect(rendered).not.toContain("| Axes | 0 |");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import { resolveSourceSpan } from "../source.js";
import {
  formatClaimLedgerValidationError,
  licensedClaimSpeakers,
  validateClaimLedger,
  type ClaimLedgerValidationIssue,
} from "./claim-validator.js";

function sourceRefYaml(span: string, indent = "") {
  const { source_ref } = resolveSourceSpan("euthyphro", span);

  return [
    `${indent}source_ref:`,
    `${indent}  source_path: ${source_ref.source_path}`,
    `${indent}  stephanus_span: ${source_ref.stephanus_span}`,
    `${indent}  start_marker: ${source_ref.start_marker}`,
    `${indent}  end_marker: ${source_ref.end_marker}`,
    `${indent}  start_char: ${source_ref.start_char}`,
    `${indent}  end_char: ${source_ref.end_char}`,
    `${indent}  text_sha256: "${source_ref.text_sha256}"`,
  ].join("\n");
}

function claimRecord({
  claimId = "claim_euthyphro_0001",
  speaker = '"ΣΩ."',
  claimKind = "thesis",
  content = "Socrates asks for one form by which holy things are holy.",
  claimSpan = "5d-6a",
  eventSpan = "5d-6a",
  eventKind = "asserted",
  finalStatus = "left_standing",
  limits = "No later span in this ledger coverage retracts this claim.",
  sourceRef = sourceRefYaml(claimSpan),
  eventSourceRef = sourceRefYaml(eventSpan, "    "),
}: {
  claimId?: string;
  speaker?: string;
  claimKind?: string;
  content?: string;
  claimSpan?: string;
  eventSpan?: string;
  eventKind?: string;
  finalStatus?: string;
  limits?: string;
  sourceRef?: string;
  eventSourceRef?: string;
} = {}) {
  return `claim_id: ${claimId}
source_work: Euthyphro
stephanus_span: ${claimSpan}
${sourceRef}
speaker: ${speaker}
claim_kind: ${claimKind}
content: "${content}"
greek_terms: [εἶδος]
stance_events:
  - kind: ${eventKind}
    stephanus_span: ${eventSpan}
${eventSourceRef}
final_status: ${finalStatus}
observation_ids: []
limits: "${limits}"
review_status: unreviewed`;
}

function ledger(body: string) {
  return [
    "# Euthyphro Claim Ledger",
    "",
    "```yaml",
    body.trim(),
    "```",
    "",
  ].join("\n");
}

function issueCodes(issues: ClaimLedgerValidationIssue[]) {
  return issues.map((issue) => issue.code);
}

describe("validateClaimLedger", () => {
  it("accepts a hash-checked claim with a derived final status", () => {
    expect(validateClaimLedger("wiki/claims/euthyphro.md", ledger(claimRecord()))).toEqual([]);
  });

  it("rejects speakers outside the dialogue sigla", () => {
    const issues = validateClaimLedger("wiki/claims/euthyphro.md", ledger(claimRecord({ speaker: '"ΚΡ."' })));

    expect(issueCodes(issues)).toContain("invalid_speaker");
  });

  it("accepts an in-scene owner registered only in the voice sigla registry", () => {
    // Narrated dialogues print no siglum for the speakers who own reported
    // discourse, so the turn registry alone cannot license them (the reported-speech voice attribution rollout).
    const issues = validateClaimLedger(
      "wiki/claims/symposium.md",
      ledger(claimRecord({ claimId: "claim_symposium_0001", speaker: '"ΔΙΟ."' })),
    );

    expect(issueCodes(issues)).not.toContain("invalid_speaker");
  });

  it("rejects a registered voice for a dialogue with no authoritative voice index", () => {
    // The voice registry is a pre-registered superset, so registration alone
    // earns no attribution. ΠΡΩΤ. is registered for protagoras but that dialogue
    // has no compiled voice index, so nothing yet checks owners against records —
    // and a hand-edited speaker must not slip through on the registry alone.
    const issues = validateClaimLedger(
      "wiki/claims/protagoras.md",
      ledger(claimRecord({ claimId: "claim_protagoras_0001", speaker: '"ΠΡΩΤ."' })),
    );

    expect(issueCodes(issues)).toContain("invalid_speaker");
  });

  it("rejects a speaker absent from both the turn and voice sigla registries", () => {
    const issues = validateClaimLedger(
      "wiki/claims/symposium.md",
      ledger(claimRecord({ claimId: "claim_symposium_0001", speaker: '"ΘΕΑΙ."' })),
    );

    expect(issueCodes(issues)).toContain("invalid_speaker");
  });

  it("rejects invalid enums and final_status mismatches", () => {
    const issues = validateClaimLedger(
      "wiki/claims/euthyphro.md",
      ledger(claimRecord({ claimKind: "topic", eventKind: "challenged", finalStatus: "left_standing" })),
    );

    expect(issueCodes(issues)).toContain("invalid_claim_kind");
    expect(issueCodes(issues)).toContain("invalid_final_status");
  });

  it("rejects stance events out of source order", () => {
    const content = `claim_id: claim_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
${sourceRefYaml("5d-6a")}
speaker: "ΣΩ."
claim_kind: thesis
content: "Socrates asks for one form by which holy things are holy."
greek_terms: [εἶδος]
stance_events:
  - kind: asserted
    stephanus_span: 5d-6a
${sourceRefYaml("5d-6a", "    ")}
  - kind: reaffirmed
    stephanus_span: 5c
${sourceRefYaml("5c", "    ")}
final_status: left_standing
observation_ids: []
limits: "No later span in this ledger coverage retracts this claim."
review_status: unreviewed`;

    expect(issueCodes(validateClaimLedger("wiki/claims/euthyphro.md", ledger(content)))).toContain(
      "event_order_violation",
    );
  });

  it("rejects edited source_ref hashes", () => {
    const brokenSourceRef = sourceRefYaml("5d-6a").replace(/[a-f0-9]{64}/u, "0".repeat(64));
    const issues = validateClaimLedger("wiki/claims/euthyphro.md", ledger(claimRecord({ sourceRef: brokenSourceRef })));

    expect(issueCodes(issues)).toContain("source_ref_hash_mismatch");
    expect(formatClaimLedgerValidationError(issues)).toContain("Do not edit source_ref fields manually");
  });

  it("rejects Greek in content and empty limits for left-standing claims", () => {
    const issues = validateClaimLedger(
      "wiki/claims/euthyphro.md",
      ledger(claimRecord({ content: "Socrates says εἶδος here.", limits: "" })),
    );

    expect(issueCodes(issues)).toContain("greek_outside_terms");
    expect(issueCodes(issues)).toContain("missing_limits");
  });
});

/**
 * The voice sigla registry is a pre-registered SUPERSET, so something must earn
 * it the right to license a claim speaker. Before the voice activation contract that trigger was the
 * mere existence of a compiled index — which meant Phaedo could not hold
 * standalone reported-turn data without silently widening its accepted claim
 * schema. Activation is now the trigger, and only activation.
 */
describe("licensedClaimSpeakers", () => {
  let root = "";
  let restoreRepoRoot: (() => void) | undefined;

  function write(relative: string, content: string) {
    const absolute = join(root, relative);
    mkdirSync(join(absolute, ".."), { recursive: true });
    writeFileSync(absolute, content, "utf8");
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "licensed-speakers-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    write("raw/plato/greek/fixture.txt", "{2a} λόγος");
    write("derived/plato/turns/sigla.toml", '[[dialogues]]\nslug = "fixture"\nsigla = ["ΝΑΡΡ."]\n');
    write("derived/plato/voices/sigla.toml", '[[dialogues]]\nslug = "fixture"\nsigla = ["ΝΑΡΡ.", "ΒΗΤΑ."]\n');
    // A fully compiled, accepted standalone index. Its bytes are irrelevant
    // here: the point is that its PRESENCE must license nothing.
    write("derived/plato/voices/fixture.toon", "dialogue: fixture\n");
    write("wiki/review/2026-07-25-fixture-cutover-execution.md", "# Reviewed\n");
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("does not widen the speaker set for a standalone compiled index", () => {
    expect([...(licensedClaimSpeakers("fixture") ?? [])]).toEqual(["ΝΑΡΡ."]);
  });

  it("licenses registered voice sigla once the dialogue is activated", () => {
    write(
      "derived/plato/voices/cutovers.toml",
      [
        "schema_version = 1",
        "",
        "[[dialogues]]",
        'slug = "fixture"',
        'status = "active"',
        'decision_note = "wiki/review/2026-07-25-fixture-cutover-execution.md"',
        "",
      ].join("\n"),
    );

    expect([...(licensedClaimSpeakers("fixture") ?? [])].sort()).toEqual(["ΒΗΤΑ.", "ΝΑΡΡ."]);
  });
});

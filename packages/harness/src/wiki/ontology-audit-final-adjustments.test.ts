import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import {
  assertOntologyAuditFinalAdjustmentRematerializationPending,
  expectedOntologyAuditFinalAdjustmentAction,
  ontologyAuditAdjudicationSha256,
  ontologyAuditFinalAdjustmentArtifactName,
  ontologyAuditFinalAdjustmentPriorStateArtifactName,
  ontologyAuditFinalPointerSha256,
  ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
  readOntologyAuditFinalAdjustments,
  renderOntologyAuditFinalAdjustmentPriorState,
  renderOntologyAuditFinalAdjustmentReceipt,
  renderOntologyAuditFinalAdjustments,
  verifyOntologyAuditStructuralReviewReplay,
  type OntologyAuditFinalAdjustment,
  type OntologyAuditFinalAdjustmentAction,
} from "./ontology-audit-final-adjustments.js";
import {
  acceptOntologyAuditClosure,
  bindOntologyAuditFinalState,
  finalReviewStatus,
  terminalAdjudications,
  validateFinalAdjustmentCoverage,
  type SemanticDecision,
} from "./ontology-audit-finalization.js";
import {
  generateOntologyAuditPackage,
  ontologyBaselineEvidenceContract,
  refreshOntologyAuditBindings,
  verifyOntologyAuditPackage,
  verifyOntologyAuditSemanticPreacceptance,
  type FinalPointer,
  type OntologyAuditAcceptance,
  type OntologyAuditAdjudication,
  type OntologyAuditGraphUnit,
  type OntologyAuditManifest,
  type OntologyAuditRecordUnit,
  type OntologyAuditRows,
} from "./ontology-audit.js";
import {
  collectOntologyCanonicalRegenerationArtifacts,
  collectOntologyRegenerationArtifacts,
  ontologyRegenerationDigest,
} from "./ontology-regeneration-tree.js";
import { fencedYamlRecordBlocks } from "./fenced-record.js";
import {
  recomputeOntologyClosureEvidence,
  verifyOntologyClosureEvidenceFile,
} from "./ontology-closure-evidence.js";

const TARGET = "record:commentary:comm_fixture_0001";
const RECEIPT = "wiki/review/fixture-reconsideration.md";
const EVIDENCE = "wiki/review/evidence/fixture-review.json";
let root = "";
let packagePath = "";

function write(path: string, content: string) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function pointer(hashCharacter: string, reviewStatus: string | null): FinalPointer {
  return {
    path: "wiki/commentary/fixture.md",
    ordinal: 0,
    canonical_sha256: hashCharacter.repeat(64),
    review_status: reviewStatus,
  };
}

function record({ key = TARGET, final = pointer("b", "accepted") }: {
  key?: string;
  final?: FinalPointer | null;
} = {}): OntologyAuditRecordUnit {
  return {
    key,
    kind: "record",
    lane: "commentary",
    stable_id: key.slice(key.lastIndexOf(":") + 1),
    source: null,
    references: [],
    baseline: null,
    final,
    change: final ? "added" : "removed",
    audit_state: "complete",
  };
}

function edge({ key, final }: { key: string; final: FinalPointer | null }): OntologyAuditGraphUnit {
  return {
    key,
    kind: "edge",
    edge_kind: "citation",
    owner_key: TARGET,
    from_key: TARGET,
    to_key: "record:claim:claim_fixture_0001",
    external_target: null,
    ordinal: 0,
    baseline: null,
    final,
    change: final ? "added" : "removed",
    audit_state: "complete",
  };
}

function adjudication(targetKey = TARGET): OntologyAuditAdjudication {
  return {
    adjudication_id: `adj_${targetKey.replace(/\W/gu, "_")}`,
    target_key: targetKey,
    target_kind: targetKey.startsWith("edge:") ? "edge" : "record",
    state: "complete",
    action: "reject",
    rationale: "The prior accepted audit decision is superseded by exact later review evidence.",
    finding_ids: [],
    replacement_target_keys: [],
    receipt_path: "wiki/review/old.md",
  };
}

function rows({ records = [], graphs = [], adjudications = [] }: {
  records?: OntologyAuditRecordUnit[];
  graphs?: OntologyAuditGraphUnit[];
  adjudications?: OntologyAuditAdjudication[];
} = {}): OntologyAuditRows {
  return { sources: [], records, concepts: [], graphs, findings: [], adjudications };
}

function adjustment({
  targetKey = TARGET,
  action = "revise",
  priorFinal = pointer("a", "rejected"),
  expectedFinal = pointer("b", "accepted"),
  superseded = adjudication(targetKey),
  overrides = {},
}: {
  targetKey?: string;
  action?: OntologyAuditFinalAdjustmentAction;
  priorFinal?: FinalPointer | null;
  expectedFinal?: FinalPointer | null;
  superseded?: OntologyAuditAdjudication | null;
  overrides?: Partial<OntologyAuditFinalAdjustment>;
} = {}): OntologyAuditFinalAdjustment {
  const priorFinalPointerSha256 = ontologyAuditFinalPointerSha256(priorFinal);
  const expectedFinalPointerSha256 = ontologyAuditFinalPointerSha256(expectedFinal);
  const evidenceArtifacts = [{
    path: EVIDENCE,
    sha256: new Bun.CryptoHasher("sha256").update("evidence").digest("hex"),
  }];
  return {
    target_key: targetKey,
    action,
    prior_final_pointer_sha256: priorFinalPointerSha256,
    expected_final_pointer_sha256: expectedFinalPointerSha256,
    superseded_adjudication_sha256: ontologyAuditAdjudicationSha256(superseded),
    rationale: "Reconsidered after exact accepted citations replaced the prior citationless state.",
    receipt_path: ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT,
    provenance_chain: [{
      kind: "ontology_item_review",
      action,
      prior_final_pointer_sha256: priorFinalPointerSha256,
      expected_final_pointer_sha256: expectedFinalPointerSha256,
      source_receipt_path: RECEIPT,
      evidence_artifacts: evidenceArtifacts,
    }],
    ...overrides,
  };
}

function itemReviewReceipt(decision: OntologyAuditFinalAdjustment) {
  const stage = decision.provenance_chain[0]!;
  return [
    "# Ontology item review",
    "",
    `target_key: ${decision.target_key}`,
    `action: ${stage.action}`,
    `prior_final_pointer_sha256: ${stage.prior_final_pointer_sha256 ?? "null"}`,
    `expected_final_pointer_sha256: ${stage.expected_final_pointer_sha256 ?? "null"}`,
    ...stage.evidence_artifacts.map((binding) => `- artifact: \`${binding.path}\`; sha256: \`${binding.sha256}\``),
    "",
  ].join("\n");
}

function preserved(targetKey: string, priorFinal: FinalPointer | null, superseded: OntologyAuditAdjudication | null) {
  return { target_key: targetKey, prior_final: priorFinal, superseded_adjudication: superseded };
}

function writeArtifact(content: string) {
  const name = ontologyAuditFinalAdjustmentArtifactName(content);
  const path = join(packagePath, "review-inputs/final-adjustments", name);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content, "utf8");
  return path;
}

function writeCompleteArtifact(decision = adjustment(), options: {
  acceptancePath?: string;
  partitionSourcePath?: (packageRelative: string, name: string) => string;
  acceptanceText?: string;
  partitionContents?: Record<"adjudications.jsonl" | "graph-units.jsonl" | "record-units.jsonl", string>;
  priorFinal?: FinalPointer;
  superseded?: OntologyAuditAdjudication;
  additionalTargets?: Array<{
    decision: OntologyAuditFinalAdjustment;
    priorFinal: FinalPointer | null;
    superseded: OntologyAuditAdjudication | null;
  }>;
} = {}) {
  const targets = [{
    decision,
    priorFinal: options.priorFinal ?? pointer("a", "rejected"),
    superseded: options.superseded ?? adjudication(decision.target_key),
  }, ...(options.additionalTargets ?? [])].sort((left, right) =>
    left.decision.target_key.localeCompare(right.decision.target_key)
  );
  const decisions = targets.map((target) => target.decision);
  for (const target of targets) {
    for (const stage of target.decision.provenance_chain) {
      if (stage.kind === "ontology_item_review" && stage.source_receipt_path === RECEIPT) {
        write(RECEIPT, itemReviewReceipt(target.decision));
      }
    }
  }
  const content = renderOntologyAuditFinalAdjustments(decisions);
  const artifactPath = writeArtifact(content);
  const packageRelative = relative(root, packagePath).split("\\").join("/");
  const partitionContents = options.partitionContents ?? {
    "adjudications.jsonl": targets.flatMap((target) => target.superseded ? [JSON.stringify(target.superseded)] : []).join("\n") +
      (targets.some((target) => target.superseded) ? "\n" : ""),
    "graph-units.jsonl": targets.flatMap((target) => target.decision.target_key.startsWith("edge:") && target.priorFinal
      ? [JSON.stringify({ key: target.decision.target_key, final: target.priorFinal })]
      : []).join("\n") + (targets.some((target) => target.decision.target_key.startsWith("edge:") && target.priorFinal) ? "\n" : ""),
    "record-units.jsonl": targets.flatMap((target) => target.decision.target_key.startsWith("record:") && target.priorFinal
      ? [JSON.stringify({ key: target.decision.target_key, final: target.priorFinal })]
      : []).join("\n") + (targets.some((target) => target.decision.target_key.startsWith("record:") && target.priorFinal) ? "\n" : ""),
  };
  const partitionHashes = Object.fromEntries(
    Object.entries(partitionContents).map(([name, bytes]) => [
      name,
      new Bun.CryptoHasher("sha256").update(bytes).digest("hex"),
    ]),
  );
  const acceptanceText = options.acceptanceText ?? `${JSON.stringify({ state: "accepted", partitions: Object.fromEntries(
    Object.entries(partitionHashes).map(([name, digest]) => [name, { sha256: digest }]),
  ) }, null, 2)}\n`;
  mkdirSync(packagePath, { recursive: true });
  writeFileSync(join(packagePath, "acceptance.json"), acceptanceText, "utf8");
  for (const [name, bytes] of Object.entries(partitionContents)) {
    writeFileSync(join(packagePath, name), bytes, "utf8");
  }
  const priorState = {
    schema_version: 1 as const,
    acceptance: {
      path: options.acceptancePath ?? `${packageRelative}/acceptance.json`,
      sha256: new Bun.CryptoHasher("sha256").update(acceptanceText).digest("hex"),
      text: acceptanceText,
    },
    partitions: Object.entries(partitionContents).map(([name, bytes]) => {
      const compressed = gzipSync(bytes, { level: 9 });
      const compressedSha256 = new Bun.CryptoHasher("sha256").update(compressed).digest("hex");
      const artifactName = `sha256-${compressedSha256}-prior-${name}.gz`;
      writeFileSync(join(packagePath, "review-inputs/final-adjustments", artifactName), compressed);
      return {
        path: `${packageRelative}/review-inputs/final-adjustments/${artifactName}`,
        sha256: compressedSha256,
        source_path: options.partitionSourcePath?.(packageRelative, name) ?? `${packageRelative}/${name}`,
        uncompressed_sha256: partitionHashes[name]!,
      };
    }),
    targets: targets.map((target) => ({
      target_key: target.decision.target_key,
      prior_final: target.priorFinal,
      superseded_adjudication: target.superseded,
    })),
  };
  const priorContent = renderOntologyAuditFinalAdjustmentPriorState(priorState);
  const priorName = ontologyAuditFinalAdjustmentPriorStateArtifactName(priorContent);
  const priorPath = join(packagePath, "review-inputs/final-adjustments", priorName);
  writeFileSync(priorPath, priorContent, "utf8");
  const artifactRelative = `${packageRelative}/review-inputs/final-adjustments/${artifactPath.split("/").at(-1)!}`;
  const priorRelative = `${packageRelative}/review-inputs/final-adjustments/${priorName}`;
  const provenanceBindings = targets.flatMap(({ decision: targetDecision }) => {
    return targetDecision.provenance_chain.flatMap((stage) => {
      const sourceAbsolute = join(root, stage.source_receipt_path);
      const sourceDigest = existsSync(sourceAbsolute) ? sha256(readFileSync(sourceAbsolute)) : "0".repeat(64);
      return [
        [stage.source_receipt_path, sourceDigest] as [string, string],
        ...stage.evidence_artifacts.map((binding) => [binding.path, binding.sha256] as [string, string]),
      ];
    });
  });
  const bindings = new Map([
    [artifactRelative, new Bun.CryptoHasher("sha256").update(content).digest("hex")],
    [priorRelative, new Bun.CryptoHasher("sha256").update(priorContent).digest("hex")],
    ...provenanceBindings,
    ...priorState.partitions.map((partition) => [partition.path, partition.sha256] as [string, string]),
  ].sort(([left], [right]) => left.localeCompare(right)));
  const receipt = renderOntologyAuditFinalAdjustmentReceipt({
    artifactPath: artifactRelative,
    artifactSha256: bindings.get(artifactRelative)!,
    priorStateArtifactPath: priorRelative,
    priorStateSha256: bindings.get(priorRelative)!,
    decisions,
    bindings,
  });
  write(ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT, receipt);
  return artifactPath;
}

type ReconsiderationCitations = {
  observations: string[];
  claims: string[];
  relations: string[];
  dossiers: string[];
};

function reconsiderationCommentaryBlock(
  dialogue: "phaedo" | "sophist",
  commentaryId: string,
  citations: ReconsiderationCitations,
  reviewStatus: "accepted" | "rejected",
  greekSpanSha256: string,
) {
  const citationLines = (field: keyof ReconsiderationCitations) => [
    `  ${field}:`,
    ...(citations[field].length > 0 ? citations[field].map((target) => `    - ${target}`) : ["    []"]),
  ];
  return [
    "```yaml",
    `commentary_id: ${commentaryId}`,
    `source_work: ${dialogue === "phaedo" ? "Phaedo" : "Sophist"}`,
    "block_kind: section",
    "placement: before",
    "title: Exact reconsideration fixture",
    "stephanus_span: 1a-1b",
    "source_ref:",
    `  source_path: raw/plato/greek/${dialogue}.txt`,
    "  stephanus_span: 1a-1b",
    `  text_sha256: ${greekSpanSha256}`,
    "body: Exact Greek-only reconsideration fixture with mechanically bound citations.",
    "cites:",
    ...citationLines("observations"),
    ...citationLines("claims"),
    ...citationLines("relations"),
    ...citationLines("dossiers"),
    "crossrefs:",
    "  []",
    "author: model",
    `review_status: ${reviewStatus}`,
    "```",
  ].join("\n");
}

type ReconsiderationEvidenceFixtureOptions = {
  failedAttemptIds?: string[];
  omitTerminalPacketIds?: string[];
  rejectedCitationIds?: string[];
  terminalFailIds?: string[];
  wrongEmbeddedPacketHashIds?: string[];
};

function writeReconsiderationEvidence(
  dialogue: "phaedo" | "sophist",
  reviewedIds: string[],
  citationsById: Partial<Record<string, ReconsiderationCitations>> = {},
  options: ReconsiderationEvidenceFixtureOptions = {},
) {
  const aggregateReviewer = `${dialogue}-reconsideration-ensemble-delegated-luna-reviewer-01`;
  const aggregateRationale = "Exact isolated Luna reviews passed every current block, accepted citation, and bound Greek span without translations.";
  const greek = `{1a}\n${dialogue} Greek-only fixture alpha\n{1b}\n${dialogue} Greek-only fixture beta\n{1c}\nend\n`;
  const greekSpan = greek.slice(0, greek.indexOf("{1c}")).trimEnd();
  write(`raw/plato/greek/${dialogue}.txt`, greek);
  const defaultCitations = (id: string): ReconsiderationCitations => ({
    observations: [],
    claims: [],
    relations: [],
    dossiers: [],
  });
  const citations = new Map(reviewedIds.map((id) => [id, citationsById[id] ?? defaultCitations(id)]));
  const rejectedBlocks = new Map(reviewedIds.map((id) => [
    id,
    reconsiderationCommentaryBlock(dialogue, id, citations.get(id)!, "rejected", sha256(greekSpan)),
  ]));
  const acceptedBlocks = reviewedIds.map((id) =>
    reconsiderationCommentaryBlock(dialogue, id, citations.get(id)!, "accepted", sha256(greekSpan))
  );
  const ledgerPath = `wiki/commentary/${dialogue}.md`;
  const ledger = `# ${dialogue} commentary fixture\n\n${acceptedBlocks.join("\n\n")}\n`;
  write(ledgerPath, ledger);
  const acceptedPointerSha256 = new Map(fencedYamlRecordBlocks(ledger).map((block) => [
    block.record.commentary_id as string,
    ontologyAuditFinalPointerSha256({
      path: ledgerPath,
      ordinal: block.index,
      canonical_sha256: sha256(block.fullMatch),
      review_status: "accepted",
    })!,
  ]));

  const citationField = {
    observations: "observation_id",
    claims: "claim_id",
    relations: "relation_id",
  } as const;
  const citationBlocks = new Map<string, string>();
  for (const lane of Object.keys(citationField) as Array<keyof typeof citationField>) {
    const ids = [...new Set(reviewedIds.flatMap((id) => citations.get(id)![lane]))].sort();
    const blocks = ids.map((id) => [
      "```yaml",
      `${citationField[lane]}: ${id}`,
      `source_work: ${dialogue === "phaedo" ? "Phaedo" : "Sophist"}`,
      `review_status: ${options.rejectedCitationIds?.includes(id) ? "rejected" : "accepted"}`,
      "```",
    ].join("\n"));
    write(`wiki/${lane}/${dialogue}.md`, `# ${dialogue} ${lane} fixture\n\n${blocks.join("\n\n")}\n`);
    blocks.forEach((block, index) => citationBlocks.set(`${citationField[lane]}:${ids[index]}`, block));
  }

  const isolatedSchema = (id: string, reviewer: string) => ({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["schema_version", "dialogue", "reviewer", "human_listening_or_review", "verdict", "reviewed_ids", "findings", "rationale"],
    properties: {
      schema_version: { type: "integer", const: 1 },
      dialogue: { type: "string", const: dialogue },
      reviewer: { type: "string", const: reviewer },
      human_listening_or_review: { type: "string", const: "none claimed" },
      verdict: { type: "string", enum: ["pass", "fail"] },
      reviewed_ids: { type: "array", minItems: 1, maxItems: 1, items: { type: "string", const: id } },
      findings: {
        type: "array",
        minItems: 1,
        maxItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["commentary_id", "verdict", "rationale"],
          properties: {
            commentary_id: { type: "string", const: id },
            verdict: { type: "string", enum: ["pass", "fail"] },
            rationale: { type: "string", minLength: 20, maxLength: 300 },
          },
        },
      },
      rationale: { type: "string", minLength: 40, maxLength: 300 },
    },
  });
  const isolatedResult = (id: string, reviewer: string, verdict: "pass" | "fail") => ({
    schema_version: 1,
    dialogue,
    reviewer,
    human_listening_or_review: "none claimed",
    verdict,
    reviewed_ids: [id],
    findings: [{
      commentary_id: id,
      verdict,
      rationale: verdict === "pass"
        ? "The exact Greek span and accepted citations support this bounded block."
        : "The first isolated review found a concrete source-bound defect requiring reconciliation.",
    }],
    rationale: verdict === "pass"
      ? "The exact current block, accepted citations, and canonical Greek span pass this isolated review."
      : "This preserved isolated attempt failed on a concrete source-bound issue and was not used for acceptance.",
  });
  const isolatedPacket = (id: string) => {
    const targetCitations = citations.get(id)!;
    const records = (Object.keys(citationField) as Array<keyof typeof citationField>).flatMap((lane) =>
      targetCitations[lane].map((target) => citationBlocks.get(`${citationField[lane]}:${target}`)!)
    );
    return [
      "Use only this packet. No translation is supplied or permitted.",
      `DIALOGUE: ${dialogue}`,
      `REQUIRED IDS: ${id}`,
      `full_source_sha256=${sha256(greek)}`,
      rejectedBlocks.get(id)!,
      ...records,
      `TARGET ${id}; exact_stephanus_span=1a-1b`,
      greekSpan,
      "",
    ].join("\n");
  };
  type FixtureEntry = {
    commentary_id: string;
    outcome: "terminal_pass" | "superseded_failed_attempt";
    attempt: number | null;
    source_path: string;
    sha256: string;
    content: string;
  };
  const outputs: FixtureEntry[] = [];
  const packets: FixtureEntry[] = [];
  const schemas: FixtureEntry[] = [];
  const terminalResults = new Map<string, ReturnType<typeof isolatedResult>>();
  const addEntry = (
    target: FixtureEntry[],
    id: string,
    outcome: FixtureEntry["outcome"],
    attempt: number | null,
    suffix: "result.json" | "packet.txt" | "schema.json",
    content: string,
  ) => {
    const attemptSuffix = attempt === null ? "" : `-attempt-${String(attempt).padStart(2, "0")}`;
    target.push({
      commentary_id: id,
      outcome,
      attempt,
      source_path: `scratch/commentary/reconsideration/${dialogue}-${id}${attemptSuffix}-${suffix}`,
      sha256: sha256(content),
      content,
    });
  };
  for (const id of reviewedIds) {
    const reviewer = `${dialogue}-reconsideration-${id.slice(-4)}-delegated-luna-reviewer-01`;
    const packet = isolatedPacket(id);
    const schema = `${JSON.stringify(isolatedSchema(id, reviewer), null, 2)}\n`;
    if (options.failedAttemptIds?.includes(id)) {
      addEntry(outputs, id, "superseded_failed_attempt", 1, "result.json", `${JSON.stringify(isolatedResult(id, reviewer, "fail"))}\n`);
      addEntry(packets, id, "superseded_failed_attempt", 1, "packet.txt", packet);
      addEntry(schemas, id, "superseded_failed_attempt", 1, "schema.json", schema);
    }
    const terminalVerdict = options.terminalFailIds?.includes(id) ? "fail" : "pass";
    const terminal = isolatedResult(id, reviewer, terminalVerdict);
    terminalResults.set(id, terminal);
    addEntry(outputs, id, "terminal_pass", null, "result.json", `${JSON.stringify(terminal)}\n`);
    if (!options.omitTerminalPacketIds?.includes(id)) {
      addEntry(packets, id, "terminal_pass", null, "packet.txt", packet);
      if (options.wrongEmbeddedPacketHashIds?.includes(id)) packets.at(-1)!.sha256 = "0".repeat(64);
    }
    addEntry(schemas, id, "terminal_pass", null, "schema.json", schema);
  }
  const output = `${JSON.stringify({
    schema_version: 1,
    mode: "one-block-independent-reviews",
    dialogue,
    aggregate: {
      schema_version: 1,
      dialogue,
      reviewer: aggregateReviewer,
      human_listening_or_review: "none claimed",
      verdict: "pass",
      reviewed_ids: reviewedIds,
      findings: reviewedIds.map((id) => terminalResults.get(id)!.findings[0]),
      rationale: aggregateRationale,
    },
    reviews: outputs,
  }, null, 2)}\n`;
  const packet = `${JSON.stringify({
    schema_version: 1,
    mode: "one-block-independent-reviews",
    dialogue,
    packets,
  }, null, 2)}\n`;
  const schema = `${JSON.stringify({
    schema_version: 1,
    mode: "one-block-independent-reviews",
    dialogue,
    schemas,
  }, null, 2)}\n`;
  const evidenceRoot = `wiki/ontology-audits/snapshot/review-inputs/final-adjustment-evidence`;
  const artifacts = [
    {
      kind: "review_output",
      path: `${evidenceRoot}/sha256-${sha256(output)}-${dialogue}-commentary-reconsideration-review-bundle.json`,
      sha256: sha256(output),
      bytes: output,
    },
    {
      kind: "review_packet",
      path: `${evidenceRoot}/sha256-${sha256(packet)}-${dialogue}-commentary-reconsideration-packet-bundle.json`,
      sha256: sha256(packet),
      bytes: packet,
    },
    {
      kind: "review_schema",
      path: `${evidenceRoot}/sha256-${sha256(schema)}-${dialogue}-commentary-reconsideration-schema-bundle.json`,
      sha256: sha256(schema),
      bytes: schema,
    },
  ] as const;
  for (const artifact of artifacts) write(artifact.path, artifact.bytes);
  const manifest = `${JSON.stringify({
    schema_version: 1,
    artifacts: artifacts.map(({ kind, path, sha256: digest }) => ({ kind, path, sha256: digest })),
  }, null, 2)}\n`;
  const manifestPath = `${evidenceRoot}/sha256-${sha256(manifest)}-commentary-reconsideration-evidence.json`;
  write(manifestPath, manifest);
  const sourceReceiptPath = `wiki/review/2026-09-01-commentary-block-reconsideration-${dialogue}-accepted-${"a".repeat(12)}.md`;
  const receiptBindings = [
    { path: manifestPath, sha256: sha256(manifest) },
    ...artifacts.map(({ path, sha256: digest }) => ({ path, sha256: digest })),
  ];
  write(sourceReceiptPath, [
    "# Commentary block reconsideration",
    "",
    `dialogue: ${dialogue}`,
    "decision: accepted",
    "prior_review_status: rejected",
    "review_transition: rejected -> accepted",
    `ledger_path: wiki/commentary/${dialogue}.md`,
    "ledger_sha256_before: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "ledger_sha256_after: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    `reviewer: ${aggregateReviewer}`,
    "reviewed_on: 2026-09-01",
    `rationale: ${aggregateRationale}`,
    "review_basis: operator-delegated independent Luna reconsideration of terminally rejected blocks",
    "human_listening_or_review: none claimed",
    `evidence_manifest_path: ${manifestPath}`,
    `evidence_manifest_sha256: ${sha256(manifest)}`,
    ...receiptBindings.map((binding) => `- artifact: \`${binding.path}\`; sha256: \`${binding.sha256}\``),
    "reviewed_commentary_ids:",
    ...reviewedIds.map((id) => `- ${id}`),
    "",
  ].join("\n"));
  return {
    sourceReceiptPath,
    evidenceArtifacts: receiptBindings.sort((left, right) => left.path.localeCompare(right.path)),
    acceptedPointerSha256,
  };
}

function sha256(content: string | Uint8Array) {
  return new Bun.CryptoHasher("sha256").update(content).digest("hex");
}

function writeFixtureBaselineEvidence() {
  const packageLogicalPath = relative(root, packagePath).split("\\").join("/");
  const contract = ontologyBaselineEvidenceContract();
  const logDescriptor = (group: string, id: string, stream: "stdout" | "stderr") => {
    const path = `${packageLogicalPath}/baseline-evidence/${group}-${id}.${stream}.log`;
    write(path, "");
    return { path, sha256: sha256(""), bytes: 0 };
  };
  const commands = (
    group: string,
    entries: readonly { id: string; argv: readonly string[] }[],
  ) => entries.map((entry) => ({
    id: entry.id,
    argv: [...entry.argv],
    exit_code: 0,
    outcome: "passed",
    stdout: logDescriptor(group, entry.id, "stdout"),
    stderr: logDescriptor(group, entry.id, "stderr"),
  }));
  const manifestPath = join(packagePath, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as OntologyAuditManifest;
  const evidence = {
    schema_version: 1,
    state: "complete",
    snapshot_id: manifest.snapshot_id,
    baseline: {
      git_commit: manifest.baseline.git_commit,
      git_tree: manifest.baseline.git_tree,
      corpus_digest: manifest.baseline.corpus_digest,
      bun_version: "fixture",
      bun_lock_sha256: sha256("fixture\n"),
      platform: "fixture",
      arch: "fixture",
    },
    support_inputs: manifest.baseline.support_inputs,
    registry_projection: {
      concepts_checked: 0,
      memberships_checked: 0,
      mismatches: 0,
    },
    validation: {
      all_passed: true,
      commands: commands("validation", contract.validationCommands),
    },
    projection_replay: {
      artifact_count: 0,
      path_set_sha256: sha256(""),
      run_one_sha256: sha256("[]"),
      run_two_sha256: sha256("[]"),
      byte_stable: true,
      exact_snapshot_match: true,
      run_one_commands: commands("projection-one", contract.projectionGenerators),
      run_two_commands: commands("projection-two", contract.projectionGenerators),
      artifacts: [],
    },
  };
  const evidencePath = join(packagePath, "baseline-evidence.json");
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  manifest.baseline_evidence = {
    path: "baseline-evidence.json",
    sha256: sha256(readFileSync(evidencePath)),
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  refreshOntologyAuditBindings({ repoRoot: root, packagePath });
}

function writeFixtureClosureEvidence(overrides: Record<string, unknown> = {}) {
  writeFileSync(join(packagePath, "closure-evidence.json"), `${JSON.stringify({
    schema_version: 1,
    state: "complete",
    staleAliasIssues: [],
    rejectedReaderLeaks: [],
    terminalStateIssues: [],
    acceptedClaimLinkIssues: [],
    acceptedCommentaryCitationIssues: [],
    acceptedRelationFictionIssues: [],
    ...overrides,
  }, null, 2)}\n`, "utf8");
}

function writeRecomputedFixtureClosureEvidence(siteDirectory = join(root, "prebuilt-site")) {
  mkdirSync(siteDirectory, { recursive: true });
  writeFileSync(join(siteDirectory, "index.html"), "fixture site\n", "utf8");
  const recomputed = recomputeOntologyClosureEvidence({ repoRoot: root, siteDirectory });
  writeFileSync(join(packagePath, "closure-evidence.json"), recomputed.content, "utf8");
  return {
    siteDirectory,
    proof: verifyOntologyClosureEvidenceFile({ repoRoot: root, packagePath, siteDirectory }),
  };
}

function writeFixtureGlobalAcceptanceEvidence() {
  for (const path of [
    "derived/plato/joins",
    "derived/plato/voices",
    "wiki/clusters",
    "wiki/dossiers",
  ]) mkdirSync(join(root, path), { recursive: true });
  write("audio/coverage.md", "fixture audio coverage\n");
  write("wiki/completeness.md", "fixture completeness\n");
  const closureEvidenceProof = writeRecomputedFixtureClosureEvidence();
  const closureEvidence = readFileSync(join(packagePath, "closure-evidence.json"));
  const artifacts = collectOntologyRegenerationArtifacts(root, closureEvidenceProof.siteDirectory);
  const regenerationDigest = ontologyRegenerationDigest(artifacts);
  writeFileSync(join(packagePath, "regeneration.json"), `${JSON.stringify({
    schema_version: 1,
    state: "complete",
    regeneration_one_sha256: regenerationDigest,
    regeneration_two_sha256: regenerationDigest,
    closure_evidence_one_sha256: sha256(closureEvidence),
    closure_evidence_two_sha256: sha256(closureEvidence),
    closure_evidence_sha256: closureEvidenceProof.proof.sha256,
    closure_evidence_site_tree_sha256: closureEvidenceProof.proof.site_tree_sha256,
    closure_evidence_bytes: closureEvidence.byteLength,
    artifact_count: artifacts.length,
    artifacts,
  }, null, 2)}\n`, "utf8");
  const finalAdjustments = readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath });
  if (!finalAdjustments) throw new Error("Fixture final-adjustment artifact is missing");
  const bindings = new Map<string, string>([
    [
      `${relative(root, packagePath).split("\\").join("/")}/regeneration.json`,
      sha256(readFileSync(join(packagePath, "regeneration.json"))),
    ],
    [
      `${relative(root, packagePath).split("\\").join("/")}/closure-evidence.json`,
      sha256(readFileSync(join(packagePath, "closure-evidence.json"))),
    ],
    ...finalAdjustments.receiptBindings,
    [finalAdjustments.receiptPath, finalAdjustments.receiptSha256],
  ]);
  write("wiki/review/2026-08-30-ontology-vnext-closure.md", [
    "# Fixture closure receipt",
    "",
    ...[...bindings].sort(([left], [right]) => left.localeCompare(right)).map(
      ([path, digest]) => `- artifact: \`${path}\`; sha256: \`${digest}\``,
    ),
    "",
  ].join("\n"));
  return { regenerationDigest, ...closureEvidenceProof };
}

function reconsiderationOverrides(
  provenance: ReturnType<typeof writeReconsiderationEvidence>,
  commentaryId: string,
  priorFinalPointerSha256 = ontologyAuditFinalPointerSha256(pointer("a", "rejected")),
): Partial<OntologyAuditFinalAdjustment> {
  const expectedFinalPointerSha256 = provenance.acceptedPointerSha256.get(commentaryId)!;
  return {
    prior_final_pointer_sha256: priorFinalPointerSha256,
    expected_final_pointer_sha256: expectedFinalPointerSha256,
    provenance_chain: [{
      kind: "commentary_reconsideration",
      action: "revise",
      prior_final_pointer_sha256: priorFinalPointerSha256,
      expected_final_pointer_sha256: expectedFinalPointerSha256,
      source_receipt_path: provenance.sourceReceiptPath,
      evidence_artifacts: provenance.evidenceArtifacts,
    }],
  };
}

function writeEmptyConceptAudit() {
  const directory = join(packagePath, "review-inputs/concept-first");
  mkdirSync(directory, { recursive: true });
  const artifacts: Record<string, { sha256: string; bytes: number; rows: number }> = {};
  for (const name of ["axes.jsonl", "concepts.jsonl", "memberships.jsonl", "proposed-concepts.jsonl"]) {
    writeFileSync(join(directory, name), "", "utf8");
    artifacts[name] = { sha256: sha256(""), bytes: 0, rows: 0 };
  }
  writeFileSync(join(directory, "receipt.json"), `${JSON.stringify({
    audit_snapshot: "fixture",
    baseline_commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    exact_denominator: { axes: 0, concepts: 0, memberships: 0, proposed_concepts: 0 },
    canonical_vnext_counts: { axes: 0, concepts: 0, memberships: 0 },
    checks: {},
    artifacts,
  }, null, 2)}\n`, "utf8");
}

function packageByteDigests(directory = packagePath) {
  const files = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(path, entry.name);
    return entry.isDirectory() ? files(absolute) : entry.isFile() ? [absolute] : [];
  });
  return files(directory).sort().map((path) => [
    relative(directory, path).split("\\").join("/"),
    sha256(readFileSync(path)),
  ]);
}

function prepareFinalAdjustmentLifecycleFixture() {
  write("bun.lock", "fixture\n");
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  for (const path of [
    "derived/plato/README.md",
    "derived/plato/anchors/lexicon.toml",
    "derived/plato/metrics/procedure/anchors.toml",
    "derived/plato/turns/sigla.toml",
    "derived/plato/voices/cutovers.toml",
    "derived/plato/voices/sigla.toml",
  ]) write(path, "fixture\n");
  write("docs/ontology-audit-protocol.md", "# Fixture ontology audit protocol\n");
  write("packages/harness/src/wiki/ontology-audit.ts", "// Fixture ontology schema implementation.\n");
  write("wiki/ontology/axes.jsonl", "");
  write("wiki/ontology/concepts.jsonl", "");
  write("wiki/ontology/memberships.jsonl", "");
  write("wiki/review/2026-08-30-ontology-vnext-closure.md", "# Fixture closure receipt\n");
  write("wiki/commentary/fixture.md", [
    "```yaml",
    `commentary_id: ${TARGET.split(":").at(-1)!}`,
    "body: Fixture commentary retained only in the frozen baseline.",
    "cites:",
    "  observations: []",
    "  claims: []",
    "  relations: []",
    "  dossiers: []",
    "crossrefs: []",
    "review_status: rejected",
    "```",
    "",
  ].join("\n"));

  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", [
    "-c", "user.name=Ontology Fixture",
    "-c", "user.email=ontology-fixture@example.invalid",
    "commit", "-qm", "fixture baseline",
  ], { cwd: root });

  const generated = generateOntologyAuditPackage({ repoRoot: root });
  packagePath = join(root, generated.packagePath);
  const recordRows = readFileSync(join(packagePath, "record-units.jsonl"), "utf8")
    .split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as OntologyAuditRecordUnit);
  const priorRecord = recordRows.find((entry) => entry.key === TARGET);
  if (!priorRecord?.final) throw new Error("Lifecycle fixture did not generate the frozen commentary record");
  const oldRows = readFileSync(join(packagePath, "adjudications.jsonl"), "utf8")
    .split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as OntologyAuditAdjudication);
  const generatedOld = oldRows.find((entry) => entry.target_key === TARGET);
  if (!generatedOld) throw new Error("Lifecycle fixture did not generate the prior adjudication");
  const superseded: OntologyAuditAdjudication = {
    ...generatedOld,
    state: "complete",
    action: "reject",
    rationale: "The frozen fixture record was rejected by the previously accepted item-level review.",
    finding_ids: [],
    replacement_target_keys: [],
    receipt_path: "wiki/review/old.md",
  };
  writeFileSync(join(packagePath, "adjudications.jsonl"), `${JSON.stringify(superseded)}\n`, "utf8");

  const semanticDirectory = join(packagePath, "review-inputs/semantic-remediation");
  mkdirSync(semanticDirectory, { recursive: true });
  writeFileSync(join(semanticDirectory, `sha256-${sha256("")}-decisions.jsonl`), "", "utf8");
  writeEmptyConceptAudit();

  const manifestPath = join(packagePath, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as OntologyAuditManifest;
  manifest.audit_state = "accepted";
  manifest.lane_states = manifest.lane_states.map((lane) => ({
    ...lane,
    state: lane.count === 0 ? "zero_result" : "complete",
  }));
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const acceptancePath = join(packagePath, "acceptance.json");
  const acceptance = JSON.parse(readFileSync(acceptancePath, "utf8")) as OntologyAuditAcceptance;
  acceptance.state = "accepted";
  acceptance.final_corpus_digest = manifest.baseline.corpus_digest;
  acceptance.receipt = { path: "wiki/review/old.md", sha256: sha256(readFileSync(join(root, "wiki/review/old.md"))) };
  acceptance.closure = {
    baseline_set_equal: true,
    final_set_equal: true,
    source_passes_complete: true,
    reconciliations_complete: true,
    adjudications_complete: true,
    unresolved_adjudications: 0,
    stale_aliases: 0,
    rejected_reader_leaks: 0,
    regeneration_one_sha256: "a".repeat(64),
    regeneration_two_sha256: "a".repeat(64),
  };
  writeFileSync(acceptancePath, `${JSON.stringify(acceptance, null, 2)}\n`, "utf8");
  refreshOntologyAuditBindings({ repoRoot: root, packagePath });
  writeFixtureBaselineEvidence();

  const priorPartitions = {
    "adjudications.jsonl": readFileSync(join(packagePath, "adjudications.jsonl"), "utf8"),
    "graph-units.jsonl": readFileSync(join(packagePath, "graph-units.jsonl"), "utf8"),
    "record-units.jsonl": readFileSync(join(packagePath, "record-units.jsonl"), "utf8"),
  };
  const priorAcceptanceText = readFileSync(acceptancePath, "utf8");
  rmSync(join(root, "wiki/commentary/fixture.md"));
  const decision = adjustment({
    action: "retire",
    priorFinal: priorRecord.final,
    expectedFinal: null,
    superseded,
  });
  writeCompleteArtifact(decision, {
    acceptanceText: priorAcceptanceText,
    partitionContents: priorPartitions,
    priorFinal: priorRecord.final,
    superseded,
  });
  return { decision, superseded };
}

function prepareSemanticPreacceptanceFixture() {
  prepareFinalAdjustmentLifecycleFixture();
  bindOntologyAuditFinalState({ repoRoot: root, packagePath });
  const closureEvidence = writeRecomputedFixtureClosureEvidence();
  const issues = verifyOntologyAuditSemanticPreacceptance({
    repoRoot: root,
    packagePath,
    siteDirectory: closureEvidence.siteDirectory,
    closureEvidenceProof: closureEvidence.proof,
  });
  if (issues.length > 0) {
    throw new Error(`Semantic preacceptance fixture is invalid:\n${issues.map((entry) =>
      `[${entry.code}] ${entry.path}: ${entry.message}`
    ).join("\n")}`);
  }
  return closureEvidence;
}

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "ontology-final-adjustments-")));
  packagePath = join(root, "wiki/ontology-audits/snapshot");
  write(RECEIPT, "# Fixture reconsideration\n");
  write(EVIDENCE, "evidence");
  write("wiki/review/old.md", "# Old decision\n");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
  root = "";
  packagePath = "";
});

describe("ontology audit final adjustments", () => {
  test("permits rematerialization only after canonical authority is fail-closed pending", () => {
    expect(() => assertOntologyAuditFinalAdjustmentRematerializationPending({ state: "pending" }))
      .not.toThrow();
    expect(() => assertOntologyAuditFinalAdjustmentRematerializationPending({ state: "accepted" }))
      .toThrow("requires the current canonical acceptance marker to be pending");
    expect(() => assertOntologyAuditFinalAdjustmentRematerializationPending(null))
      .toThrow("requires the current canonical acceptance marker to be pending");
  });

  test("replays the exact parsed structural audit bytes and rejects embedded audit tampering", () => {
    const audit = {
      schema_version: 3,
      dialogue: "fixture",
      unit_key: "01-1a-1b",
      section_id: "comm_fixture_0001",
      authoring: { model: "gpt-5.6-luna", effort: "medium" },
      unit_verdict: "fail",
      blocks: [{
        commentary_id: "comm_fixture_0001",
        disposition: "remove",
        issue_codes: ["interrupts_dramatic_flow"],
        checks: {
          evidence: { verdict: "pass" },
          placement: { verdict: "fail", hazard_codes: ["semantic_anchor_displacement"] },
          listening: { verdict: "pass" },
        },
        rationale: "The exact edge displaces the cited exchange into a different dramatic unit.",
      }],
    };
    const digest = new Bun.CryptoHasher("sha256").update(`${JSON.stringify(audit, null, 2)}\n`).digest("hex");

    expect(() => verifyOntologyAuditStructuralReviewReplay(audit, digest)).not.toThrow();
    expect(() => verifyOntologyAuditStructuralReviewReplay({
      ...audit,
      blocks: [{ ...audit.blocks[0]!, rationale: "Tampered rationale changes the reviewed evidence bytes." }],
    }, digest)).toThrow("does not replay the exact reviewed output hash");
  });

  test("loads one sorted canonical content-addressed artifact with exact receipt and pointer bindings", () => {
    const decision = adjustment();
    const artifactPath = writeCompleteArtifact(decision);
    const loaded = readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath });

    expect(loaded?.artifactPath).toBe(artifactPath);
    expect(loaded?.decisions.get(TARGET)).toEqual(decision);
  });

  test("replays a reconsideration receipt, manifest, output, packet, and exact reviewed target", () => {
    const targetKey = "record:commentary:comm_phaedo_0003";
    const provenance = writeReconsiderationEvidence("phaedo", ["comm_phaedo_0003"]);
    const decision = adjustment({
      targetKey,
      overrides: reconsiderationOverrides(provenance, "comm_phaedo_0003"),
    });
    writeCompleteArtifact(decision);

    expect(readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })?.decisions.get(targetKey)).toEqual(decision);
  });

  test("deeply replays preserved failed attempts before one exact terminal pass", () => {
    const commentaryId = "comm_phaedo_0003";
    const targetKey = `record:commentary:${commentaryId}`;
    const provenance = writeReconsiderationEvidence("phaedo", [commentaryId], {}, {
      failedAttemptIds: [commentaryId],
    });
    const decision = adjustment({
      targetKey,
      overrides: reconsiderationOverrides(provenance, commentaryId),
    });
    writeCompleteArtifact(decision);

    expect(readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })?.decisions.get(targetKey)).toEqual(decision);
  });

  test("rejects incomplete bundle alignment and a failed terminal review", () => {
    const commentaryId = "comm_phaedo_0003";
    const targetKey = `record:commentary:${commentaryId}`;
    const writeCase = (options: ReconsiderationEvidenceFixtureOptions) => {
      rmSync(join(packagePath, "review-inputs/final-adjustments"), { recursive: true, force: true });
      const provenance = writeReconsiderationEvidence("phaedo", [commentaryId], {}, options);
      writeCompleteArtifact(adjustment({
        targetKey,
        overrides: reconsiderationOverrides(provenance, commentaryId),
      }));
    };

    writeCase({ failedAttemptIds: [commentaryId], omitTerminalPacketIds: [commentaryId] });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "output, packet, and schema bundles must align exactly",
    );

    writeCase({ terminalFailIds: [commentaryId] });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "isolated review does not exactly pass its one bound target",
    );
  });

  test("rejects embedded packet hash drift and nonaccepted citation records", () => {
    const commentaryId = "comm_phaedo_0003";
    const claimId = "claim_phaedo_0003";
    const targetKey = `record:commentary:${commentaryId}`;
    const writeCase = (options: ReconsiderationEvidenceFixtureOptions) => {
      rmSync(join(packagePath, "review-inputs/final-adjustments"), { recursive: true, force: true });
      const provenance = writeReconsiderationEvidence("phaedo", [commentaryId], {
        [commentaryId]: {
          observations: [],
          claims: [claimId],
          relations: [],
          dossiers: [],
        },
      }, options);
      writeCompleteArtifact(adjustment({
        targetKey,
        overrides: reconsiderationOverrides(provenance, commentaryId),
      }));
    };

    writeCase({ wrongEmbeddedPacketHashIds: [commentaryId] });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "identity, embedded bytes, or hash is invalid",
    );

    writeCase({ rejectedCitationIds: [claimId] });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      `cited ${claimId} is not one exact accepted canonical record in the packet`,
    );
  });

  test("binds citation-edge additions to the exact reviewed type, ordinal, and target", () => {
    const commentaryId = "comm_phaedo_0003";
    const recordTarget = `record:commentary:${commentaryId}`;
    const provenance = writeReconsiderationEvidence("phaedo", [commentaryId], {
      [commentaryId]: {
        observations: [],
        claims: ["claim_phaedo_0033"],
        relations: [],
        dossiers: [],
      },
    });
    const recordDecision = adjustment({
      targetKey: recordTarget,
      overrides: reconsiderationOverrides(provenance, commentaryId),
    });
    const exactEdgeTarget = `edge:commentary-cites-claim:${commentaryId}:0000:claim_phaedo_0033`;
    const edgeFinal = pointer("c", null);
    const exactEdgeDecision = adjustment({
      targetKey: exactEdgeTarget,
      action: "add",
      priorFinal: null,
      expectedFinal: edgeFinal,
      superseded: null,
      overrides: {
        provenance_chain: [{
          kind: "commentary_reconsideration",
          action: "add",
          prior_final_pointer_sha256: null,
          expected_final_pointer_sha256: ontologyAuditFinalPointerSha256(edgeFinal),
          source_receipt_path: provenance.sourceReceiptPath,
          evidence_artifacts: provenance.evidenceArtifacts,
        }],
      },
    });
    const writeCase = (edgeDecision: OntologyAuditFinalAdjustment) => {
      rmSync(join(packagePath, "review-inputs/final-adjustments"), { recursive: true, force: true });
      writeCompleteArtifact(recordDecision, {
        additionalTargets: [{ decision: edgeDecision, priorFinal: null, superseded: null }],
      });
    };

    writeCase(exactEdgeDecision);
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).not.toThrow();

    writeCase({
      ...exactEdgeDecision,
      target_key: `edge:commentary-cites-claim:${commentaryId}:0000:claim_phaedo_9999`,
    });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "reconsideration edge is not present in the exact reviewed commentary citation set",
    );

    writeCase({
      ...exactEdgeDecision,
      target_key: `edge:commentary-cites-observation:${commentaryId}:0000:claim_phaedo_0033`,
    });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "reconsideration edge is not present in the exact reviewed commentary citation set",
    );
  });

  test("rejects swapped Phaedo evidence assigned to a Sophist target", () => {
    const targetKey = "record:commentary:comm_sophist_0002";
    const provenance = writeReconsiderationEvidence("phaedo", ["comm_phaedo_0003"]);
    writeCompleteArtifact(adjustment({
      targetKey,
      overrides: reconsiderationOverrides(provenance, "comm_phaedo_0003"),
    }));

    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "reconsideration evidence does not review this exact target",
    );
  });

  test("rejects acceptance and preserved-partition path aliases outside the exact audit package", () => {
    writeCompleteArtifact(adjustment(), {
      acceptancePath: "wiki/ontology-audits/other/acceptance.json",
      partitionSourcePath: (_packageRelative, name) => `wiki/ontology-audits/other/${name}`,
    });
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "prior acceptance path must exactly name this audit package acceptance.json",
    );

    rmSync(join(packagePath, "review-inputs/final-adjustments"), { recursive: true, force: true });
    expect(() => writeCompleteArtifact(adjustment(), {
      partitionSourcePath: (packageRelative, name) => `${packageRelative}/./${name}`,
    })).toThrow("source_path must name the accepted record, graph, or adjudication partition");
  });

  test("rejects compressed-partition tampering, extra files, and symlinks in the exact package directory", () => {
    writeCompleteArtifact();
    const directory = join(packagePath, "review-inputs/final-adjustments");
    const compressed = readdirSync(directory).find((name) => name.endsWith(".jsonl.gz"));
    expect(compressed).toBeDefined();
    writeFileSync(join(directory, compressed!), "tampered", "utf8");
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "not bound to its compressed bytes",
    );

    rmSync(directory, { recursive: true, force: true });
    writeCompleteArtifact();
    writeFileSync(join(directory, "unexpected.txt"), "extra", "utf8");
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "with no extras",
    );

    rmSync(directory, { recursive: true, force: true });
    writeCompleteArtifact();
    symlinkSync(join(root, EVIDENCE), join(directory, "unexpected-link"));
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "directories and symlinks are forbidden",
    );
  });

  test("rejects a symlinked adjustment directory and symlink-aliased evidence or source receipts", () => {
    writeCompleteArtifact();
    const directory = join(packagePath, "review-inputs/final-adjustments");
    const movedDirectory = join(root, "aliased-final-adjustments");
    renameSync(directory, movedDirectory);
    symlinkSync(movedDirectory, directory, "dir");
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "no symlink or realpath aliasing",
    );

    rmSync(directory);
    renameSync(movedDirectory, directory);
    const evidenceTarget = join(root, "wiki/review/evidence/fixture-review-target.json");
    renameSync(join(root, EVIDENCE), evidenceTarget);
    symlinkSync(evidenceTarget, join(root, EVIDENCE));
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "bound source artifact is missing",
    );

    rmSync(join(root, EVIDENCE));
    renameSync(evidenceTarget, join(root, EVIDENCE));
    const receiptTarget = join(root, "wiki/review/fixture-reconsideration-target.md");
    renameSync(join(root, RECEIPT), receiptTarget);
    symlinkSync(receiptTarget, join(root, RECEIPT));
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "bound source artifact is missing",
    );

    rmSync(join(root, RECEIPT));
    renameSync(receiptTarget, join(root, RECEIPT));
    const finalReceipt = join(root, ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT);
    const finalReceiptTarget = join(root, "wiki/review/final-adjustment-receipt-target.md");
    renameSync(finalReceipt, finalReceiptTarget);
    symlinkSync(finalReceiptTarget, finalReceipt);
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "Missing or noncanonical final-adjustment receipt",
    );
  });

  test("rejects noncanonical fields, invalid transition shapes, and missing receipt paths", () => {
    expect(() => renderOntologyAuditFinalAdjustments([
      { ...adjustment(), note: "not allowed" } as OntologyAuditFinalAdjustment,
    ])).toThrow(
      "must contain exactly action, expected_final_pointer_sha256",
    );

    expect(() => renderOntologyAuditFinalAdjustments([
      adjustment({ action: "add", priorFinal: pointer("a", "accepted") }),
    ])).toThrow("add requires a null prior pointer");

    const missing = adjustment();
    missing.provenance_chain = [{
      ...missing.provenance_chain[0]!,
      source_receipt_path: "wiki/review/missing.md",
    }];
    expect(() => renderOntologyAuditFinalAdjustments([missing])).not.toThrow();
    writeCompleteArtifact(missing);
    expect(() => readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).toThrow(
      "bound source artifact is missing",
    );
  });

  test("requires an ordered gap-free reconsideration-to-rejection chronology", () => {
    const rejectedPrior = pointer("a", "rejected");
    const acceptedIntermediate = pointer("b", "accepted");
    const rejectedFinal = pointer("c", "rejected");
    const rejectedPriorSha256 = ontologyAuditFinalPointerSha256(rejectedPrior);
    const acceptedIntermediateSha256 = ontologyAuditFinalPointerSha256(acceptedIntermediate);
    const rejectedFinalSha256 = ontologyAuditFinalPointerSha256(rejectedFinal);
    const evidenceArtifacts = [{
      path: EVIDENCE,
      sha256: new Bun.CryptoHasher("sha256").update("evidence").digest("hex"),
    }];
    const decision = adjustment({
      action: "reject",
      priorFinal: rejectedPrior,
      expectedFinal: rejectedFinal,
      overrides: {
        provenance_chain: [{
          kind: "commentary_reconsideration",
          action: "revise",
          prior_final_pointer_sha256: rejectedPriorSha256,
          expected_final_pointer_sha256: acceptedIntermediateSha256,
          source_receipt_path: RECEIPT,
          evidence_artifacts: evidenceArtifacts,
        }, {
          kind: "commentary_structural_review",
          action: "reject",
          prior_final_pointer_sha256: acceptedIntermediateSha256,
          expected_final_pointer_sha256: rejectedFinalSha256,
          source_receipt_path: "wiki/review/fixture-structural.md",
          evidence_artifacts: evidenceArtifacts,
        }],
      },
    });

    expect(() => renderOntologyAuditFinalAdjustments([decision])).not.toThrow();
    expect(() => renderOntologyAuditFinalAdjustments([{
      ...decision,
      provenance_chain: [decision.provenance_chain[1]!],
    }])).toThrow("provenance_chain endpoints must equal the decision pointers");
    expect(() => renderOntologyAuditFinalAdjustments([{
      ...decision,
      provenance_chain: [decision.provenance_chain[1]!, decision.provenance_chain[0]!],
    }])).toThrow("provenance_chain endpoints must equal the decision pointers");
    expect(() => renderOntologyAuditFinalAdjustments([{
      ...decision,
      provenance_chain: [decision.provenance_chain[0]!, {
        ...decision.provenance_chain[1]!,
        prior_final_pointer_sha256: ontologyAuditFinalPointerSha256(pointer("d", "accepted")),
      }],
    }])).toThrow("provenance_chain stage 2 does not continue the prior stage pointer");
    expect(() => renderOntologyAuditFinalAdjustments([{
      ...decision,
      expected_final_pointer_sha256: ontologyAuditFinalPointerSha256(pointer("e", "rejected")),
    }])).toThrow("provenance_chain endpoints must equal the decision pointers");
  });

  test("classifies add, retire, reject, and revise from exact prior/current pointer transitions", () => {
    const addKey = "edge:citation:add";
    const retireKey = "edge:citation:retire";
    const rejectKey = "record:commentary:comm_fixture_0002";
    const reviseKey = TARGET;
    const addFinal = pointer("b", null);
    const retirePrior = pointer("c", null);
    const rejectPrior = pointer("d", "accepted");
    const rejectFinal = pointer("e", "rejected");
    const revisePrior = pointer("f", "rejected");
    const reviseFinal = pointer("0", "accepted");
    const priorAdjudications = [adjudication(retireKey), adjudication(rejectKey), adjudication(reviseKey)];
    const prior = rows({
      records: [record({ key: rejectKey, final: rejectPrior }), record({ key: reviseKey, final: revisePrior })],
      graphs: [edge({ key: retireKey, final: retirePrior })],
      adjudications: priorAdjudications,
    });
    const current = rows({
      records: [record({ key: rejectKey, final: rejectFinal }), record({ key: reviseKey, final: reviseFinal })],
      graphs: [edge({ key: addKey, final: addFinal }), edge({ key: retireKey, final: null })],
    });
    const decisions = [
      adjustment({ targetKey: addKey, action: "add", priorFinal: null, expectedFinal: addFinal, superseded: null }),
      adjustment({ targetKey: retireKey, action: "retire", priorFinal: retirePrior, expectedFinal: null, superseded: priorAdjudications[0] }),
      adjustment({ targetKey: rejectKey, action: "reject", priorFinal: rejectPrior, expectedFinal: rejectFinal, superseded: priorAdjudications[1] }),
      adjustment({ targetKey: reviseKey, action: "revise", priorFinal: revisePrior, expectedFinal: reviseFinal, superseded: priorAdjudications[2] }),
    ];

    expect(() => validateFinalAdjustmentCoverage({
      priorRows: prior,
      rows: current,
      previous: prior.adjudications,
      finalAdjustments: new Map(decisions.map((decision) => [decision.target_key, decision])),
      preservedPriorTargets: new Map([
        [addKey, preserved(addKey, null, null)],
        [retireKey, preserved(retireKey, retirePrior, priorAdjudications[0]!)],
        [rejectKey, preserved(rejectKey, rejectPrior, priorAdjudications[1]!)],
        [reviseKey, preserved(reviseKey, revisePrior, priorAdjudications[2]!)],
      ]),
    })).not.toThrow();
    expect(expectedOntologyAuditFinalAdjustmentAction({
      kind: "record",
      priorFinal: null,
      expectedFinal: pointer("9", "rejected"),
    })).toBe("add");
  });

  test("ignores schema-only and graph-owner-status-only pointer enrichment while binding full pointers for real deltas", () => {
    const legacy = pointer("a", "accepted") as FinalPointer & { review_status?: string | null };
    delete legacy.review_status;
    const enriched = pointer("a", "accepted");
    expect(expectedOntologyAuditFinalAdjustmentAction({
      kind: "record",
      priorFinal: legacy,
      expectedFinal: enriched,
    })).toBeNull();
    expect(ontologyAuditFinalPointerSha256(legacy)).not.toBe(ontologyAuditFinalPointerSha256(enriched));

    expect(() => validateFinalAdjustmentCoverage({
      priorRows: rows({ records: [record({ final: legacy as FinalPointer })] }),
      rows: rows({ records: [record({ final: enriched })] }),
      previous: [adjudication()],
      finalAdjustments: new Map(),
      preservedPriorTargets: null,
    })).not.toThrow();

    const edgePrior = pointer("c", "accepted");
    const edgeAfterOwnerRejection = pointer("c", "rejected");
    expect(expectedOntologyAuditFinalAdjustmentAction({
      kind: "edge",
      priorFinal: edgePrior,
      expectedFinal: edgeAfterOwnerRejection,
    })).toBeNull();
    expect(() => validateFinalAdjustmentCoverage({
      priorRows: rows({ graphs: [edge({ key: "edge:citation:owner-status", final: edgePrior })] }),
      rows: rows({ graphs: [edge({ key: "edge:citation:owner-status", final: edgeAfterOwnerRejection })] }),
      previous: [adjudication("edge:citation:owner-status")],
      finalAdjustments: new Map(),
      preservedPriorTargets: null,
    })).not.toThrow();
  });

  test("fails closed on missing coverage, unchanged overrides, pointer drift, and superseded-decision drift", () => {
    const priorFinal = pointer("a", "rejected");
    const expectedFinal = pointer("b", "accepted");
    const priorDecision = adjudication();
    const prior = rows({ records: [record({ final: priorFinal })], adjudications: [priorDecision] });
    const current = rows({ records: [record({ final: expectedFinal })] });

    expect(() => validateFinalAdjustmentCoverage({
      priorRows: prior,
      rows: current,
      previous: prior.adjudications,
      finalAdjustments: new Map(),
      preservedPriorTargets: null,
    })).toThrow("delta lacks an exact final adjustment");

    const correct = adjustment({ priorFinal, expectedFinal, superseded: priorDecision });
    expect(() => validateFinalAdjustmentCoverage({
      priorRows: prior,
      rows: current,
      previous: prior.adjudications,
      finalAdjustments: new Map([[TARGET, { ...correct, expected_final_pointer_sha256: "f".repeat(64) }]]),
      preservedPriorTargets: new Map([[TARGET, preserved(TARGET, priorFinal, priorDecision)]]),
    })).toThrow("expected final pointer hash drifted");
    expect(() => validateFinalAdjustmentCoverage({
      priorRows: prior,
      rows: current,
      previous: prior.adjudications,
      finalAdjustments: new Map([[TARGET, { ...correct, superseded_adjudication_sha256: null }]]),
      preservedPriorTargets: new Map([[TARGET, preserved(TARGET, priorFinal, priorDecision)]]),
    })).toThrow("preserved prior pointer/adjudication does not prove");
    expect(() => validateFinalAdjustmentCoverage({
      priorRows: current,
      rows: current,
      previous: [],
      finalAdjustments: new Map([[TARGET, correct]]),
      preservedPriorTargets: new Map([[TARGET, preserved(TARGET, priorFinal, priorDecision)]]),
    })).toThrow("unchanged prior/final core pointer");
  });

  test("rejects an all-or-nothing bind state containing both pre-bind and already-applied adjustments", () => {
    const preKey = TARGET;
    const appliedKey = "record:commentary:comm_fixture_0002";
    const prePrior = pointer("a", "rejected");
    const preFinal = pointer("b", "accepted");
    const appliedPrior = pointer("c", "rejected");
    const appliedFinal = pointer("d", "accepted");
    const preOld = adjudication(preKey);
    const appliedOld = adjudication(appliedKey);
    const preDecision = adjustment({ targetKey: preKey, priorFinal: prePrior, expectedFinal: preFinal, superseded: preOld });
    const appliedDecision = adjustment({ targetKey: appliedKey, priorFinal: appliedPrior, expectedFinal: appliedFinal, superseded: appliedOld });
    const appliedTerminal: OntologyAuditAdjudication = {
      adjudication_id: appliedOld.adjudication_id,
      target_key: appliedKey,
      target_kind: "record",
      state: "complete",
      action: appliedDecision.action,
      rationale: appliedDecision.rationale,
      finding_ids: appliedOld.finding_ids,
      replacement_target_keys: [],
      receipt_path: appliedDecision.receipt_path,
    };
    const prior = rows({
      records: [record({ key: preKey, final: prePrior }), record({ key: appliedKey, final: appliedFinal })],
      adjudications: [preOld, appliedTerminal],
    });
    const current = rows({
      records: [record({ key: preKey, final: preFinal }), record({ key: appliedKey, final: appliedFinal })],
    });

    expect(() => validateFinalAdjustmentCoverage({
      priorRows: prior,
      rows: current,
      previous: prior.adjudications,
      finalAdjustments: new Map([[preKey, preDecision], [appliedKey, appliedDecision]]),
      preservedPriorTargets: new Map([
        [preKey, preserved(preKey, prePrior, preOld)],
        [appliedKey, preserved(appliedKey, appliedPrior, appliedOld)],
      ]),
    })).toThrow("Final adjustments are partially applied");
  });

  test("binds a complete final-adjustment package twice with byte-identical output", () => {
    prepareFinalAdjustmentLifecycleFixture();

    const first = bindOntologyAuditFinalState({ repoRoot: root, packagePath });
    expect(first.acceptance.final_adjustments).toMatchObject({ required: true });
    const firstBytes = packageByteDigests();

    const second = bindOntologyAuditFinalState({ repoRoot: root, packagePath });
    expect(second.acceptance.final_adjustments).toEqual(first.acceptance.final_adjustments);
    expect(packageByteDigests()).toEqual(firstBytes);
  });

  describe("semantic preacceptance verification", () => {
    test("fails when a live canonical pointer is stale", () => {
      const closureEvidence = prepareSemanticPreacceptanceFixture();
      write("wiki/commentary/fixture.md", [
        "```yaml",
        `commentary_id: ${TARGET.split(":").at(-1)!}`,
        "body: A reintroduced live record must invalidate the retired final pointer.",
        "cites:",
        "  observations: []",
        "  claims: []",
        "  relations: []",
        "  dossiers: []",
        "crossrefs: []",
        "review_status: rejected",
        "```",
        "",
      ].join("\n"));

      const issues = verifyOntologyAuditSemanticPreacceptance({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
        closureEvidenceProof: closureEvidence.proof,
      });
      expect(issues.some((entry) =>
        entry.code === "final_binding" && entry.message.includes("live canonical key set")
      )).toBe(true);
    });

    test("fails when an adjudication returns to pending", () => {
      const closureEvidence = prepareSemanticPreacceptanceFixture();
      const adjudicationPath = join(packagePath, "adjudications.jsonl");
      const row = JSON.parse(readFileSync(adjudicationPath, "utf8").trim()) as OntologyAuditAdjudication;
      const pending: OntologyAuditAdjudication = {
        ...row,
        state: "pending",
        action: null,
        rationale: null,
        finding_ids: [],
        replacement_target_keys: [],
        receipt_path: null,
      };
      writeFileSync(adjudicationPath, `${JSON.stringify(pending)}\n`, "utf8");
      refreshOntologyAuditBindings({ repoRoot: root, packagePath });

      const issues = verifyOntologyAuditSemanticPreacceptance({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
        closureEvidenceProof: closureEvidence.proof,
      });
      expect(issues.some((entry) => entry.message === "semantic proof has 1 pending adjudication(s)")).toBe(true);
    });

    test("fails when item-level receipt evidence is missing", () => {
      const closureEvidence = prepareSemanticPreacceptanceFixture();
      rmSync(join(root, ONTOLOGY_AUDIT_FINAL_ADJUSTMENT_RECEIPT));

      const issues = verifyOntologyAuditSemanticPreacceptance({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
        closureEvidenceProof: closureEvidence.proof,
      });
      expect(issues.some((entry) =>
        entry.message.includes("receipt is missing") || entry.message.includes("final-adjustment artifact is invalid")
      )).toBe(true);
    });

    test("fails when closure evidence contains a semantic defect", () => {
      const closureEvidence = prepareSemanticPreacceptanceFixture();
      write("wiki/relations/fixture.md", `\`\`\`yaml
relation_id: rel_fixture_0001
relation_kind: tension
resolution: standing
basis: These claims share one term but have no shared thesis and neither contradict nor restate each other.
limits: The shared term alone does not create a substantive tension.
review_status: accepted
\`\`\`
`);
      const recomputed = recomputeOntologyClosureEvidence({
        repoRoot: root,
        siteDirectory: closureEvidence.siteDirectory,
      });
      writeFileSync(join(packagePath, "closure-evidence.json"), recomputed.content, "utf8");
      const defectProof = verifyOntologyClosureEvidenceFile({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
      });

      const issues = verifyOntologyAuditSemanticPreacceptance({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
        closureEvidenceProof: defectProof,
      });
      expect(issues.some((entry) => entry.message === "acceptedRelationFictionIssues is not empty")).toBe(true);
    });

    test("ignores only stale downstream regeneration and global acceptance claims", () => {
      const closureEvidence = prepareSemanticPreacceptanceFixture();
      const acceptancePath = join(packagePath, "acceptance.json");
      const acceptance = JSON.parse(readFileSync(acceptancePath, "utf8")) as OntologyAuditAcceptance;
      acceptance.state = "pending";
      acceptance.receipt = null;
      acceptance.final_corpus_digest = null;
      acceptance.closure = {
        ...acceptance.closure,
        baseline_set_equal: false,
        final_set_equal: false,
        source_passes_complete: false,
        reconciliations_complete: false,
        adjudications_complete: false,
        unresolved_adjudications: 99,
        regeneration_one_sha256: null,
        regeneration_two_sha256: null,
      };
      writeFileSync(acceptancePath, `${JSON.stringify(acceptance, null, 2)}\n`, "utf8");

      expect(verifyOntologyAuditSemanticPreacceptance({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
        closureEvidenceProof: closureEvidence.proof,
      })).toEqual([]);
      expect(verifyOntologyAuditPackage({
        repoRoot: root,
        packagePath,
        siteDirectory: closureEvidence.siteDirectory,
        closureEvidenceProof: closureEvidence.proof,
      }).length).toBeGreaterThan(0);
    });
  });

  test("preserves a required final-adjustment binding through closure and a later rebound", () => {
    prepareFinalAdjustmentLifecycleFixture();
    bindOntologyAuditFinalState({ repoRoot: root, packagePath });
    const regeneration = writeFixtureGlobalAcceptanceEvidence();

    const closed = acceptOntologyAuditClosure({
      repoRoot: root,
      packagePath,
      regenerationOneSha256: regeneration.regenerationDigest,
      regenerationTwoSha256: regeneration.regenerationDigest,
      staleAliases: 0,
      rejectedReaderLeaks: 0,
      siteDirectory: regeneration.siteDirectory,
      closureEvidenceProof: regeneration.proof,
    });
    expect(closed.acceptance).toMatchObject({
      state: "accepted",
      final_adjustments: { required: true },
      closure: {
        regeneration_one_sha256: regeneration.regenerationDigest,
        regeneration_two_sha256: regeneration.regenerationDigest,
      },
    });
    expect(readOntologyAuditFinalAdjustments({ repoRoot: root, packagePath })).not.toBeNull();

    const rebound = bindOntologyAuditFinalState({ repoRoot: root, packagePath });
    expect(rebound.acceptance).toMatchObject({
      state: "pending",
      final_adjustments: closed.acceptance.final_adjustments,
      closure: {
        regeneration_one_sha256: null,
        regeneration_two_sha256: null,
      },
    });
  });

  test("fails closed when a previously bound final-adjustment directory is deleted", () => {
    prepareFinalAdjustmentLifecycleFixture();
    bindOntologyAuditFinalState({ repoRoot: root, packagePath });
    rmSync(join(packagePath, "review-inputs/final-adjustments"), { recursive: true, force: true });

    expect(() => bindOntologyAuditFinalState({ repoRoot: root, packagePath })).toThrow(
      "requires its bound final-adjustment artifact",
    );
  });

  test("keeps a required binding irreversible when only acceptance is downgraded before deletion", () => {
    prepareFinalAdjustmentLifecycleFixture();
    bindOntologyAuditFinalState({ repoRoot: root, packagePath });
    rmSync(join(packagePath, "review-inputs/final-adjustments"), { recursive: true, force: true });
    const acceptancePath = join(packagePath, "acceptance.json");
    const acceptance = JSON.parse(readFileSync(acceptancePath, "utf8")) as OntologyAuditAcceptance;
    acceptance.final_adjustments = {
      required: false,
      decision_artifact: null,
      prior_state_artifact: null,
      receipt: null,
    };
    writeFileSync(acceptancePath, `${JSON.stringify(acceptance, null, 2)}\n`, "utf8");

    expect(() => bindOntologyAuditFinalState({ repoRoot: root, packagePath })).toThrow(
      "requires its bound final-adjustment artifact",
    );
    const manifest = JSON.parse(readFileSync(join(packagePath, "manifest.json"), "utf8")) as OntologyAuditManifest;
    expect(manifest.final_adjustments.required).toBe(true);
  });

  test("uses final status and gives a bound reconsideration precedence over stale semantic decisions", () => {
    const priorFinal = pointer("a", "rejected");
    const expectedFinal = pointer("b", "accepted");
    const priorDecision = adjudication();
    const prior = rows({ records: [record({ final: priorFinal })], adjudications: [priorDecision] });
    const current = rows({ records: [record({ final: expectedFinal })] });
    expect(finalReviewStatus(current.records[0]!)).toBe("accepted");

    const semantic = new Map<string, SemanticDecision>([[TARGET, {
      target_key: TARGET,
      action: "reject",
      rationale: "Old hard-cut rejection retained only as superseded provenance.",
      finding_ids: [],
      replacement_target_keys: [],
    }]]);
    const decision = adjustment({ priorFinal, expectedFinal, superseded: priorDecision });
    const adjudications = terminalAdjudications({
      priorRows: prior,
      rows: current,
      previous: prior.adjudications,
      findings: [],
      semantic,
      concepts: new Map(),
      finalAdjustments: new Map([[TARGET, decision]]),
      requireFinalAdjustmentCoverage: true,
      preservedPriorTargets: new Map([[TARGET, preserved(TARGET, priorFinal, priorDecision)]]),
    });

    expect(adjudications).toHaveLength(1);
    expect(adjudications[0]).toMatchObject({
      target_key: TARGET,
      action: "revise",
      rationale: decision.rationale,
      receipt_path: decision.receipt_path,
    });

    const reboundRows = { ...current, adjudications };
    const second = terminalAdjudications({
      priorRows: reboundRows,
      rows: reboundRows,
      previous: adjudications,
      findings: [],
      semantic,
      concepts: new Map(),
      finalAdjustments: new Map([[TARGET, decision]]),
      requireFinalAdjustmentCoverage: true,
      preservedPriorTargets: new Map([[TARGET, preserved(TARGET, priorFinal, priorDecision)]]),
    });
    expect(second).toEqual(adjudications);

    for (const tampered of [
      { ...adjudications[0]!, adjudication_id: "adjudication:tampered" },
      { ...adjudications[0]!, finding_ids: ["finding:tampered"] },
      { ...adjudications[0]!, replacement_target_keys: [TARGET] },
    ]) {
      const tamperedRows = { ...current, adjudications: [tampered] };
      expect(() => terminalAdjudications({
        priorRows: tamperedRows,
        rows: tamperedRows,
        previous: [tampered],
        findings: [],
        semantic,
        concepts: new Map(),
        finalAdjustments: new Map([[TARGET, decision]]),
        requireFinalAdjustmentCoverage: true,
        preservedPriorTargets: new Map([[TARGET, preserved(TARGET, priorFinal, priorDecision)]]),
      })).toThrow("unauthorized final adjustment");
    }
  });
});

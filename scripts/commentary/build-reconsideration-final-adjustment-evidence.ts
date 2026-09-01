import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { getRepoRoot } from "../../packages/harness/src/paths.js";

const REQUIRED_IDS = {
  phaedo: [
    "comm_phaedo_0003",
    "comm_phaedo_0005",
    "comm_phaedo_0010",
    "comm_phaedo_0013",
    "comm_phaedo_0014",
  ],
  sophist: [
    "comm_sophist_0002",
    "comm_sophist_0004",
    "comm_sophist_0005",
    "comm_sophist_0008",
    "comm_sophist_0009",
  ],
} as const;

type Dialogue = keyof typeof REQUIRED_IDS;
type ReviewResult = {
  schema_version: number;
  dialogue: string;
  reviewer: string;
  human_listening_or_review: string;
  verdict: string;
  reviewed_ids: string[];
  findings: Array<{ commentary_id: string; verdict: string; rationale: string }>;
  rationale: string;
};
type ReviewInput = {
  commentaryIds: string[];
  outcome: "terminal_pass" | "superseded_failed_attempt";
  attempt: number | null;
  packetPath: string;
  packetBytes: Buffer;
  resultPath: string;
  resultBytes: Buffer;
  schemaPath: string;
  schemaBytes: Buffer;
  result: ReviewResult;
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function prettyJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function logicalPath(repoRoot: string, path: string) {
  return relative(repoRoot, path).split("\\").join("/");
}

function fencedBlocks(value: string) {
  return [...value.matchAll(/```yaml\n[\s\S]*?```/gu)].map((match) => match[0]);
}

function blockById(value: string, field: string, id: string) {
  return fencedBlocks(value).find((block) => block.includes(`\n${field}: ${id}\n`));
}

function parseResult(dialogue: Dialogue, path: string, bytes: Buffer): ReviewResult {
  try {
    return JSON.parse(bytes.toString("utf8")) as ReviewResult;
  } catch (error) {
    throw new Error(`${dialogue}: malformed independent result ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validateResult(dialogue: Dialogue, expectedIds: string[], result: ReviewResult) {
  if (result.schema_version !== 1 || result.dialogue !== dialogue ||
    !/^[a-z0-9][a-z0-9-]*-delegated-luna-reviewer-[a-z0-9][a-z0-9-]*$/u.test(result.reviewer) ||
    result.reviewer.length > 120 || result.human_listening_or_review !== "none claimed" || result.verdict !== "pass" ||
    canonicalJson(result.reviewed_ids) !== canonicalJson(expectedIds) ||
    !Array.isArray(result.findings) || result.findings.length !== expectedIds.length ||
    result.findings.some((finding, index) => finding.commentary_id !== expectedIds[index] ||
      finding.verdict !== "pass" || typeof finding.rationale !== "string" ||
      finding.rationale.length < 20 || finding.rationale.length > 300) ||
    typeof result.rationale !== "string" || result.rationale.length < 40 || result.rationale.length > 300) {
    throw new Error(`${dialogue}: independent result is not one exact all-pass review of ${expectedIds.join(", ")}`);
  }
}

function validateFailedAttempt(dialogue: Dialogue, expectedId: string, result: ReviewResult) {
  if (result.schema_version !== 1 || result.dialogue !== dialogue ||
    !/^[a-z0-9][a-z0-9-]*-delegated-luna-reviewer-[a-z0-9][a-z0-9-]*$/u.test(result.reviewer) ||
    result.reviewer.length > 120 || result.human_listening_or_review !== "none claimed" || result.verdict !== "fail" ||
    canonicalJson(result.reviewed_ids) !== canonicalJson([expectedId]) ||
    !Array.isArray(result.findings) || result.findings.length !== 1 ||
    result.findings[0]?.commentary_id !== expectedId || result.findings[0].verdict !== "fail" ||
    typeof result.findings[0].rationale !== "string" || result.findings[0].rationale.length < 20 ||
    result.findings[0].rationale.length > 300 || typeof result.rationale !== "string" ||
    result.rationale.length < 40 || result.rationale.length > 300) {
    throw new Error(`${dialogue}: preserved attempt is not one exact failed review of ${expectedId}`);
  }
}

function citedIds(block: string, lane: "observations" | "claims") {
  const nextLane = lane === "observations" ? "claims" : "relations";
  const match = block.match(new RegExp(`\\n  ${lane}:\\n([\\s\\S]*?)\\n  ${nextLane}:`, "u"));
  if (!match) throw new Error(`Commentary block lacks exact ${lane} citation lane`);
  return [...match[1]!.matchAll(/^    - ([a-z0-9_-]+)$/gmu)].map((entry) => entry[1]!);
}

function stephanusOrdinal(value: string) {
  const match = /^(\d+)([a-e])$/u.exec(value);
  if (!match) throw new Error(`Invalid Stephanus point ${value}`);
  return Number(match[1]) * 5 + "abcde".indexOf(match[2]!);
}

function exactGreekSpan(source: string, span: string) {
  const match = /^(\d+[a-e])(?:-(\d+[a-e]))?$/u.exec(span);
  if (!match) throw new Error(`Invalid Stephanus span ${span}`);
  const start = match[1]!;
  const end = match[2] ?? start;
  const markers = [...source.matchAll(/\{(\d+[a-e])\}/gu)].map((entry) => ({ point: entry[1]!, index: entry.index }));
  const startMarker = markers.find((entry) => entry.point === start);
  if (!startMarker) throw new Error(`Greek source lacks start marker ${start}`);
  const endOrdinal = stephanusOrdinal(end);
  const nextMarker = markers.find((entry) => entry.index > startMarker.index && stephanusOrdinal(entry.point) > endOrdinal);
  return source.slice(startMarker.index, nextMarker?.index ?? source.length).trimEnd();
}

function validatePacket(
  repoRoot: string,
  dialogue: Dialogue,
  ids: string[],
  bytes: Buffer,
  requireCurrentBlock = true,
) {
  const packet = bytes.toString("utf8");
  const ledger = readFileSync(join(repoRoot, `wiki/commentary/${dialogue}.md`), "utf8");
  const expectedCitations = { observations: [] as string[], claims: [] as string[] };
  const greekSource = readFileSync(join(repoRoot, `raw/plato/greek/${dialogue}.txt`), "utf8");
  if (!packet.includes(`full_source_sha256=${sha256(greekSource)}`)) {
    throw new Error(`${dialogue}: packet Greek source hash differs from the canonical source`);
  }
  for (const id of ids) {
    const packetBlock = blockById(packet, "commentary_id", id);
    const currentBlock = blockById(ledger, "commentary_id", id);
    if (!packetBlock || (requireCurrentBlock && packetBlock !== currentBlock) || !packetBlock.includes("\nreview_status: rejected\n")) {
      throw new Error(`${dialogue}: packet commentary bytes/status drifted for ${id}`);
    }
    expectedCitations.observations.push(...citedIds(packetBlock, "observations"));
    expectedCitations.claims.push(...citedIds(packetBlock, "claims"));
    const span = packetBlock.match(/\nstephanus_span: ([^\n]+)\n/u)?.[1];
    if (!span || !packet.includes(`TARGET ${id}; exact_stephanus_span=${span}\n${exactGreekSpan(greekSource, span)}`)) {
      throw new Error(`${dialogue}: packet lacks the exact canonical Greek span for ${id}`);
    }
  }
  let citationCount = 0;
  for (const [lane, field] of [["observations", "observation_id"], ["claims", "claim_id"]] as const) {
    const currentLedger = readFileSync(join(repoRoot, `wiki/${lane}/${dialogue}.md`), "utf8");
    const packetBlocks = fencedBlocks(packet).filter((block) => block.includes(`\n${field}: `));
    const packetIds = packetBlocks.map((block) => block.match(new RegExp(`\\n${field}: ([^\\n]+)\\n`, "u"))?.[1]);
    if (canonicalJson(packetIds) !== canonicalJson(expectedCitations[lane])) {
      throw new Error(`${dialogue}: packet ${lane} citation set/order differs from the current target blocks`);
    }
    citationCount += packetBlocks.length;
    for (const packetBlock of packetBlocks) {
      const id = packetBlock.match(new RegExp(`\\n${field}: ([^\\n]+)\\n`, "u"))?.[1];
      const currentBlock = id ? blockById(currentLedger, field, id) : undefined;
      if (!id || packetBlock !== currentBlock || !packetBlock.includes("\nreview_status: accepted\n")) {
        throw new Error(`${dialogue}: packet ${lane} citation bytes/status drifted for ${id ?? "unknown"}`);
      }
    }
  }
  if (citationCount === 0) throw new Error(`${dialogue}: reconsideration packet contains no accepted citations`);
}

function validateBlockSchema(dialogue: Dialogue, id: string, result: ReviewResult, bytes: Buffer) {
  let schema: unknown;
  try {
    schema = JSON.parse(bytes.toString("utf8")) as unknown;
  } catch {
    throw new Error(`${dialogue}: malformed exact output schema for ${id}`);
  }
  const properties = schema && typeof schema === "object" && !Array.isArray(schema)
    ? (schema as { properties?: Record<string, { const?: unknown; maxLength?: unknown }> }).properties
    : undefined;
  if (properties?.dialogue?.const !== dialogue || properties.reviewer?.const !== result.reviewer ||
    properties.rationale?.maxLength !== 300) {
    throw new Error(`${dialogue}: output schema does not bind exact dialogue/reviewer/length for ${id}`);
  }
}

const dialogue = process.argv[2] as Dialogue | undefined;
if (!dialogue || !(dialogue in REQUIRED_IDS)) throw new Error("Expected dialogue phaedo or sophist");
const repoRoot = getRepoRoot();
const scratchRoot = join(repoRoot, "scratch/commentary/reconsideration");
const requiredIds = [...REQUIRED_IDS[dialogue]];
const blockResultPaths = requiredIds.map((id) => join(scratchRoot, `${dialogue}-${id}-result.json`));
const missingBlockResults = blockResultPaths.filter((path) => !existsSync(path));
if (missingBlockResults.length > 0) {
  throw new Error(`${dialogue}: hard-cut evidence requires every isolated one-block result; missing ${missingBlockResults.join(", ")}`);
}
let reviewInputs: ReviewInput[];
let evidenceInputs: ReviewInput[];
let aggregateResult: ReviewResult;
let outputArtifacts: Array<{ kind: "review_output" | "review_packet" | "review_schema"; bytes: Buffer; path: string }>;

const packageRoots = readdirSync(join(repoRoot, "wiki/ontology-audits"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name));
if (packageRoots.length !== 1) throw new Error(`Expected one ontology audit package, found ${packageRoots.length}`);
const evidenceRoot = join(repoRoot, "wiki/ontology-audits", packageRoots[0]!.name, "review-inputs/final-adjustment-evidence");

const scratchNames = readdirSync(scratchRoot);
  const historicalInputs = requiredIds.flatMap((id) => scratchNames.flatMap((name) => {
    const match = new RegExp(`^${dialogue}-${id}-attempt-(\\d{2})-result\\.json$`, "u").exec(name);
    if (!match) return [];
    const attempt = Number(match[1]);
    const stem = join(scratchRoot, `${dialogue}-${id}-attempt-${match[1]}`);
    const paths = { result: `${stem}-result.json`, packet: `${stem}-packet.txt`, schema: `${stem}-schema.json` };
    for (const [kind, path] of Object.entries(paths)) {
      if (!existsSync(path)) throw new Error(`${dialogue}: incomplete preserved attempt ${attempt} ${kind} for ${id}`);
    }
    const packetBytes = readFileSync(paths.packet);
    const resultBytes = readFileSync(paths.result);
    const schemaBytes = readFileSync(paths.schema);
    const result = parseResult(dialogue, paths.result, resultBytes);
    validateFailedAttempt(dialogue, id, result);
    validatePacket(repoRoot, dialogue, [id], packetBytes, false);
    validateBlockSchema(dialogue, id, result, schemaBytes);
    return [{
      commentaryIds: [id],
      outcome: "superseded_failed_attempt" as const,
      attempt,
      packetPath: paths.packet,
      packetBytes,
      resultPath: paths.result,
      resultBytes,
      schemaPath: paths.schema,
      schemaBytes,
      result,
    }];
  })).sort((left, right) => {
    const idOrder = requiredIds.indexOf(left.commentaryIds[0]!) - requiredIds.indexOf(right.commentaryIds[0]!);
    return idOrder || (left.attempt ?? 0) - (right.attempt ?? 0);
  });
  reviewInputs = requiredIds.map((id) => {
    const paths = {
      packet: join(scratchRoot, `${dialogue}-${id}-packet.txt`),
      result: join(scratchRoot, `${dialogue}-${id}-result.json`),
      schema: join(scratchRoot, `${dialogue}-${id}-schema.json`),
    };
    for (const [kind, path] of Object.entries(paths)) {
      if (!existsSync(path)) throw new Error(`${dialogue}: missing exact one-block ${kind} artifact for ${id}: ${path}`);
    }
    const packetBytes = readFileSync(paths.packet);
    const resultBytes = readFileSync(paths.result);
    const schemaBytes = readFileSync(paths.schema);
    const result = parseResult(dialogue, paths.result, resultBytes);
    validateResult(dialogue, [id], result);
    validatePacket(repoRoot, dialogue, [id], packetBytes);
    validateBlockSchema(dialogue, id, result, schemaBytes);
    return {
      commentaryIds: [id],
      outcome: "terminal_pass" as const,
      attempt: null,
      packetPath: paths.packet,
      packetBytes,
      resultPath: paths.result,
      resultBytes,
      schemaPath: paths.schema,
      schemaBytes,
      result,
    };
  });
  evidenceInputs = requiredIds.flatMap((id) => [
    ...historicalInputs.filter((input) => input.commentaryIds[0] === id),
    reviewInputs.find((input) => input.commentaryIds[0] === id)!,
  ]);
  const aggregateRationale = `Five isolated Luna reviews passed the exact current ${dialogue} blocks, accepted citations, and bound Greek spans; no translation was supplied.`;
  aggregateResult = {
    schema_version: 1,
    dialogue,
    reviewer: `${dialogue}-reconsideration-ensemble-delegated-luna-reviewer-01`,
    human_listening_or_review: "none claimed",
    verdict: "pass",
    reviewed_ids: requiredIds,
    findings: reviewInputs.flatMap((input) => input.result.findings),
    rationale: aggregateRationale,
  };
  validateResult(dialogue, requiredIds, aggregateResult);
  const bundles = {
    review_output: Buffer.from(prettyJson({
      schema_version: 1,
      mode: "one-block-independent-reviews",
      dialogue,
      aggregate: aggregateResult,
      reviews: evidenceInputs.map((input) => ({
        commentary_id: input.commentaryIds[0],
        outcome: input.outcome,
        attempt: input.attempt,
        source_path: logicalPath(repoRoot, input.resultPath),
        sha256: sha256(input.resultBytes),
        content: input.resultBytes.toString("utf8"),
      })),
    })),
    review_packet: Buffer.from(prettyJson({
      schema_version: 1,
      mode: "one-block-independent-reviews",
      dialogue,
      packets: evidenceInputs.map((input) => ({
        commentary_id: input.commentaryIds[0],
        outcome: input.outcome,
        attempt: input.attempt,
        source_path: logicalPath(repoRoot, input.packetPath),
        sha256: sha256(input.packetBytes),
        content: input.packetBytes.toString("utf8"),
      })),
    })),
    review_schema: Buffer.from(prettyJson({
      schema_version: 1,
      mode: "one-block-independent-reviews",
      dialogue,
      schemas: evidenceInputs.map((input) => ({
        commentary_id: input.commentaryIds[0],
        outcome: input.outcome,
        attempt: input.attempt,
        source_path: logicalPath(repoRoot, input.schemaPath),
        sha256: sha256(input.schemaBytes),
        content: input.schemaBytes.toString("utf8"),
      })),
    })),
  };
outputArtifacts = [
  { kind: "review_output", bytes: bundles.review_output, path: join(evidenceRoot, `sha256-${sha256(bundles.review_output)}-${dialogue}-commentary-reconsideration-review-bundle.json`) },
  { kind: "review_packet", bytes: bundles.review_packet, path: join(evidenceRoot, `sha256-${sha256(bundles.review_packet)}-${dialogue}-commentary-reconsideration-packet-bundle.json`) },
  { kind: "review_schema", bytes: bundles.review_schema, path: join(evidenceRoot, `sha256-${sha256(bundles.review_schema)}-${dialogue}-commentary-reconsideration-schema-bundle.json`) },
];

const manifestValue = {
  schema_version: 1,
  artifacts: outputArtifacts.map((artifact) => ({ kind: artifact.kind, path: logicalPath(repoRoot, artifact.path), sha256: sha256(artifact.bytes) })),
};
const manifestBytes = prettyJson(manifestValue);
const manifestPath = join(evidenceRoot, `sha256-${sha256(manifestBytes)}-commentary-reconsideration-evidence.json`);

if (process.argv.includes("--write")) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  for (const artifact of outputArtifacts) {
    if (existsSync(artifact.path) && !readFileSync(artifact.path).equals(artifact.bytes)) throw new Error(`Refusing content-address collision at ${artifact.path}`);
    writeFileSync(artifact.path, artifact.bytes);
  }
  if (existsSync(manifestPath) && readFileSync(manifestPath, "utf8") !== manifestBytes) throw new Error(`Refusing content-address collision at ${manifestPath}`);
  writeFileSync(manifestPath, manifestBytes, "utf8");
}

console.log(JSON.stringify({
  dialogue,
  mode: "one-block-independent-reviews",
  reviewed_ids: requiredIds,
  reviewer: aggregateResult.reviewer,
  rationale: aggregateResult.rationale,
  manifest_path: logicalPath(repoRoot, manifestPath),
  manifest_sha256: sha256(manifestBytes),
  artifacts: manifestValue.artifacts,
  source_reviews: evidenceInputs.map((input) => ({
    ids: input.commentaryIds,
    outcome: input.outcome,
    attempt: input.attempt,
    reviewer: input.result.reviewer,
    result_sha256: sha256(input.resultBytes),
  })),
  written: process.argv.includes("--write"),
}, null, 2));

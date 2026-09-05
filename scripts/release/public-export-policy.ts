import { createHash } from "node:crypto";
import { commentaryAuditContract } from "../../packages/harness/src/commentary-audit.js";

const contentAddressedAuditSample =
  /^wiki\/submissions\/commentary-audit-sample\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([0-9a-f]{64})\.json$/u;
const planReferenceSource = String.raw`(?:plans?\/0[0-9]{2}\b|plan[- _]?0[0-9]{2}\b)`;
const sharedContractStart = "<<<FULL_SHARED_QUALITY_CONTRACT>>>\n";
const sharedContractEnd = "\n<<<END_FULL_SHARED_QUALITY_CONTRACT>>>";

const sha256 = (content: Uint8Array) => createHash("sha256").update(content).digest("hex");
const planLabels = (text: string) => [...text.matchAll(new RegExp(planReferenceSource, "giu"))];

type AuditSampleEnvelope = {
  schema_version?: unknown;
  dialogue?: unknown;
  sample_packet?: { content?: unknown; sha256?: unknown };
  [key: string]: unknown;
};

function expectedSharedContract(protocolContent: string) {
  const auditContract = commentaryAuditContract(protocolContent);
  return [
    "# Commentary quality-audit contract",
    "",
    "- quality_protocol: docs/commentary-protocol.md",
    `- audit_contract_sha256: ${sha256(Buffer.from(auditContract))}`,
    "",
    "Extracted verbatim from docs/commentary-protocol.md. This is the complete quality-bearing contract; operator and validator workflow outside this excerpt does not govern the verdict.",
    "",
    auditContract.trimEnd(),
  ].join("\n");
}

export function isPublicHistoricalCommentaryAuditSample(
  path: string,
  bytes: Uint8Array,
  commentaryProtocolContent: string,
): boolean {
  const match = contentAddressedAuditSample.exec(path);
  if (!match || sha256(bytes) !== match[2]) return false;

  let envelope: AuditSampleEnvelope;
  try {
    envelope = JSON.parse(Buffer.from(bytes).toString("utf8")) as AuditSampleEnvelope;
  } catch {
    return false;
  }
  const packet = envelope.sample_packet?.content;
  const packetSha256 = envelope.sample_packet?.sha256;
  const commentaryProtocolSha256 = sha256(Buffer.from(commentaryProtocolContent));
  if (
    envelope.schema_version !== 1
    || envelope.dialogue !== match[1]
    || typeof packet !== "string"
    || packetSha256 !== sha256(Buffer.from(packet))
    || !packet.includes("protocol_path: docs/commentary-protocol.md\n")
    || !packet.includes(`protocol_sha256: ${commentaryProtocolSha256}\n`)
  ) return false;

  const start = packet.indexOf(sharedContractStart);
  const end = packet.indexOf(sharedContractEnd, start + sharedContractStart.length);
  if (
    start < 0
    || end < 0
    || packet.indexOf(sharedContractStart, start + 1) >= 0
    || packet.indexOf(sharedContractEnd, end + 1) >= 0
    || packet.slice(start + sharedContractStart.length, end) !== expectedSharedContract(commentaryProtocolContent)
  ) return false;

  const packetWithoutContract = `${packet.slice(0, start)}${packet.slice(end + sharedContractEnd.length)}`;
  const envelopeWithoutContract = {
    ...envelope,
    sample_packet: { ...envelope.sample_packet, content: packetWithoutContract },
  };
  return planLabels(JSON.stringify(envelopeWithoutContract)).length === 0;
}

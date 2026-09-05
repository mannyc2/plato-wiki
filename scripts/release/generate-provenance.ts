import { existsSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../../packages/harness/src/paths.js";
import {
  buildPublicReplayProvenanceReceipt,
  validatePublicReplayProvenanceCandidate,
} from "../../packages/harness/src/release-provenance.js";

const receiptPath = "release/public/replay-provenance.json";

export function writePublicReplayProvenance(repoRoot = getRepoRoot()) {
  const absoluteReceiptPath = join(repoRoot, receiptPath);
  const temporaryReceiptPath = `${absoluteReceiptPath}.${process.pid}.tmp`;
  const receipt = buildPublicReplayProvenanceReceipt(repoRoot);
  const issues = validatePublicReplayProvenanceCandidate(receipt, repoRoot);
  if (issues.length > 0) {
    throw new Error(`generated release provenance is invalid:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  }

  try {
    writeFileSync(temporaryReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
    renameSync(temporaryReceiptPath, absoluteReceiptPath);
  } finally {
    if (existsSync(temporaryReceiptPath)) unlinkSync(temporaryReceiptPath);
  }

  return receipt;
}

if (import.meta.main) {
  const receipt = writePublicReplayProvenance();
  console.log(`release provenance: ${receiptPath}; ${receipt.artifacts.length} artifacts`);
}

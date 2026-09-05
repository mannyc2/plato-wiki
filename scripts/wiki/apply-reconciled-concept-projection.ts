import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { applyOntologyVNextMigration } from "../../packages/harness/src/wiki/ontology-vnext-migration.js";

const repoRoot = process.cwd();
const packages = readdirSync(join(repoRoot, "wiki/ontology-audits"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^sha256-[a-f0-9]{64}$/u.test(entry.name))
  .map((entry) => join(repoRoot, "wiki/ontology-audits", entry.name));
if (packages.length !== 1) throw new Error(`Expected one ontology audit package, found ${packages.length}.`);
const packagePath = packages[0]!;
const semanticDirectory = join(packagePath, "review-inputs/semantic-remediation");
const decisionFiles = readdirSync(semanticDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /^sha256-[a-f0-9]{64}-decisions\.jsonl$/u.test(entry.name))
  .map((entry) => join(semanticDirectory, entry.name));
if (decisionFiles.length !== 1) {
  throw new Error(`Expected one content-addressed semantic decision artifact, found ${decisionFiles.length}.`);
}
const decisionPath = decisionFiles[0]!;
const content = readFileSync(decisionPath, "utf8");
const expectedHash = /sha256-([a-f0-9]{64})-decisions\.jsonl$/u.exec(decisionPath)?.[1];
const actualHash = createHash("sha256").update(content).digest("hex");
if (actualHash !== expectedHash) throw new Error("Semantic decision artifact filename does not bind its bytes.");

const splitMembershipProposalObservationIds = new Map<string, readonly string[]>();
for (const [index, line] of content.split(/\r?\n/u).filter(Boolean).entries()) {
  const row = JSON.parse(line) as { target_key?: unknown; replacement_target_keys?: unknown };
  if (typeof row.target_key !== "string" || !row.target_key.startsWith("record:observation:")) continue;
  if (!Array.isArray(row.replacement_target_keys)) {
    throw new Error(`${decisionPath}:${index + 1}: replacement_target_keys must be an array.`);
  }
  const replacements = row.replacement_target_keys
    .filter((key): key is string => typeof key === "string" && key.startsWith("record:observation:"))
    .map((key) => key.slice("record:observation:".length));
  if (replacements.length > 0) {
    splitMembershipProposalObservationIds.set(
      row.target_key.slice("record:observation:".length),
      [...new Set(replacements)].sort(),
    );
  }
}

const result = applyOntologyVNextMigration({
  repoRoot,
  conceptAuditDirectory: join(packagePath, "review-inputs/concept-first"),
  splitMembershipProposalObservationIds,
});
console.log(`package=${relative(repoRoot, packagePath).split("\\").join("/")}`);
console.log(`split_parents=${splitMembershipProposalObservationIds.size}`);
console.log(`axes=${result.plan.counts.activeAxes}`);
console.log(`concepts=${result.plan.counts.activeConcepts}`);
console.log(`memberships=${result.plan.counts.activeMemberships}`);
console.log(`receipt=${result.receiptPath}`);

import {
  applyFencedRecordMigration,
  planFencedRecordMigration,
} from "../../packages/harness/src/wiki/fenced-record-migration.js";

const args = process.argv.slice(2);
const write = args.includes("--write");
const json = args.includes("--json");
const paths = args.filter((argument) => argument !== "--write" && argument !== "--json");
const plan = write
  ? applyFencedRecordMigration({ paths })
  : planFencedRecordMigration({ paths });

if (json) {
  console.log(JSON.stringify(plan, null, 2));
} else {
  console.log(
    `${write ? "applied" : "preview"}: files=${plan.entries.length} blocks=${plan.blockCount} changed=${plan.changedFiles} failed=${plan.failedFiles}`,
  );
  for (const entry of plan.entries.filter((candidate) => candidate.changed || candidate.error)) {
    console.log(
      `${entry.error ? "error" : "change"}: ${entry.path} blocks=${entry.blockCount} ${entry.beforeSha256} -> ${entry.afterSha256}${entry.error ? ` ${entry.error}` : ""}`,
    );
    for (const defect of entry.defects ?? []) {
      console.log(
        `  defect: ${defect.recordId ?? `block-${defect.blockIndex + 1}`} code=${defect.code}${defect.field ? ` field=${defect.field}` : ""} line=${defect.startLine}`,
      );
      console.log(`    repair: ${defect.recommendedRepair}`);
    }
  }
}

if (plan.failedFiles > 0) process.exitCode = 1;

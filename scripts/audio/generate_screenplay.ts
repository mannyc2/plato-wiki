#!/usr/bin/env bun

import {
  buildScreenplayGenerationReport,
  writeDraftScreenplay,
  writeProductionScreenplay,
} from "../../packages/harness/src/audio-screenplay-generator.js";

function usage(): never {
  throw new Error(
    [
      "Usage:",
      "  bun scripts/audio/generate_screenplay.ts <dialogue>",
      "  bun scripts/audio/generate_screenplay.ts <dialogue> --write-draft",
      "  bun scripts/audio/generate_screenplay.ts <dialogue> --write-production",
      "",
      "The default is a read-only dry run. Drafts write only beneath scratch/.",
      "A production write is refused unless accepted commentary, accepted span attribution,",
      "resolved characters, selected voices, and the complete strict screenplay contract all pass.",
    ].join("\n"),
  );
}

const dialogue = process.argv[2];
if (!dialogue || dialogue.startsWith("--")) usage();
const writeDraft = process.argv.includes("--write-draft");
const writeProduction = process.argv.includes("--write-production");
if (writeDraft && writeProduction) throw new Error("Choose only one write mode.");
const unknown = process.argv.slice(3).filter((argument) => !["--write-draft", "--write-production"].includes(argument));
if (unknown.length > 0) usage();

const report = buildScreenplayGenerationReport(dialogue);
const writtenPath = writeDraft
  ? writeDraftScreenplay(report)
  : writeProduction
    ? writeProductionScreenplay(report)
    : undefined;
process.stdout.write(`${JSON.stringify(writtenPath ? { written_path: writtenPath, report } : report, null, 2)}\n`);

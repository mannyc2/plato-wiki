#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { setRepoRootForTesting } from "../../packages/harness/src/paths.js";
import { parseCommentaryQualityAuditManifest } from "../../packages/harness/src/wiki/commentary-quality-audit.js";

const [repoRoot, dialogue] = process.argv.slice(2);
if (!repoRoot || !dialogue || !/^[a-z0-9-]+$/u.test(dialogue)) {
  throw new Error(
    "usage: validate_commentary_quality_audit.ts <repo-root> <dialogue>",
  );
}

const restore = setRepoRootForTesting(repoRoot);
try {
  const relativePath = `wiki/commentary-audits/${dialogue}.json`;
  const manifest = parseCommentaryQualityAuditManifest(
    relativePath,
    readFileSync(join(repoRoot, relativePath), "utf8"),
  );
  if (
    manifest.schema_version !== 1 ||
    manifest.dialogue !== dialogue ||
    manifest.acceptance.decision !== "accepted"
  ) {
    throw new Error(
      `${relativePath} is not an operator-delegated Luna-sample-accepted canonical quality-audit manifest`,
    );
  }
  process.stdout.write(
    `${JSON.stringify({
      schema_version: manifest.schema_version,
      dialogue: manifest.dialogue,
      decision: manifest.acceptance.decision,
    })}\n`,
  );
} finally {
  restore();
}

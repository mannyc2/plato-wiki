#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  formatAudioProductionIssues,
  validateAudioScriptArtifact,
} from "../../packages/harness/src/audio-production.js";
import { setRepoRootForTesting } from "../../packages/harness/src/paths.js";

const [repoRoot, dialogue] = process.argv.slice(2);
if (!repoRoot || !dialogue || !/^[a-z0-9-]+$/u.test(dialogue)) {
  throw new Error("usage: validate_audio_screenplay.ts <repo-root> <dialogue>");
}

const restore = setRepoRootForTesting(repoRoot);
try {
  const relativePath = `audio/scripts/${dialogue}.json`;
  const issues = validateAudioScriptArtifact(
    relativePath,
    readFileSync(join(repoRoot, relativePath), "utf8"),
  );
  if (issues.length > 0) {
    throw new Error(
      `Canonical screenplay validation failed for ${relativePath}:\n${formatAudioProductionIssues(issues)}`,
    );
  }
  process.stdout.write(
    `${JSON.stringify({
      schema_version: 2,
      dialogue,
      valid: true,
    })}\n`,
  );
} finally {
  restore();
}

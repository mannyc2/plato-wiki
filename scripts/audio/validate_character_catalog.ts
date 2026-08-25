#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  formatAudioCatalogValidationError,
  validateAuthoritativeCharacterCatalog,
} from "../../packages/harness/src/audio-catalog.js";
import { setRepoRootForTesting } from "../../packages/harness/src/paths.js";

const path = process.argv[2];
const repoRoot = process.argv[3];
if (!path || !repoRoot || process.argv.length !== 4) {
  throw new Error(
    "Usage: bun scripts/audio/validate_character_catalog.ts <characters-path> <repo-root>",
  );
}

const canonicalPath = resolve(repoRoot, "audio/characters.json");
if (resolve(path) !== canonicalPath) {
  throw new Error(`CharacterCatalog path must be canonical: ${canonicalPath}`);
}

setRepoRootForTesting(repoRoot);
const issues = validateAuthoritativeCharacterCatalog(
  "audio/characters.json",
  readFileSync(canonicalPath, "utf8"),
);
if (issues.length > 0) {
  throw new Error(formatAudioCatalogValidationError(issues));
}

console.log(JSON.stringify({ path: canonicalPath, valid: true }));

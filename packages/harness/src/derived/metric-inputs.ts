import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { parseTokenIndexToon, tokenIndexPath } from "./tokens.js";
import { parseTurnIndexToon, turnIndexPath } from "./turns.js";

export function readMetricInputs(dialogue: string) {
  const turnPath = turnIndexPath(dialogue);
  const turnContent = readFileSync(join(getRepoRoot(), turnPath), "utf8");
  const turnSha256 = createHash("sha256").update(turnContent).digest("hex");
  const turnIndex = parseTurnIndexToon(turnContent);
  const tokenPath = tokenIndexPath(dialogue);
  const tokenContent = readFileSync(join(getRepoRoot(), tokenPath), "utf8");
  const tokenSha256 = createHash("sha256").update(tokenContent).digest("hex");
  const tokenIndex = parseTokenIndexToon(tokenContent);
  const source = readFileSync(join(getRepoRoot(), tokenIndex.sourcePath), "utf8");
  const sourceSha256 = createHash("sha256").update(source).digest("hex");

  // Agreement between two generated headers cannot establish freshness: both
  // may still describe the same obsolete source bytes.
  if (tokenIndex.dialogue !== dialogue || turnIndex.dialogue !== dialogue
    || tokenIndex.sourcePath !== `raw/plato/greek/${dialogue}.txt`
    || turnIndex.sourcePath !== tokenIndex.sourcePath
    || tokenIndex.turnIndexPath !== turnPath || tokenIndex.turnIndexSha256 !== turnSha256
    || tokenIndex.sourceSha256 !== sourceSha256 || turnIndex.sourceSha256 !== sourceSha256) {
    throw new Error(`Stale or mismatched metric inputs for ${dialogue}: regenerate turns and tokens.`);
  }
  const siglaContent = readFileSync(join(getRepoRoot(), turnIndex.siglaPath), "utf8");
  if (createHash("sha256").update(siglaContent).digest("hex") !== turnIndex.siglaSha256) {
    throw new Error(`Stale turn index for ${dialogue}: speaker registry changed.`);
  }

  return { turnPath, turnSha256, turnIndex, tokenPath, tokenSha256, tokenIndex, source };
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseTurnIndexToon, turnIndexPath, type TurnIndex } from "./derived/turns.js";
import { getRepoRoot } from "./paths.js";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Reads a generated turn index only after proving that it still describes the
 * complete current Greek source and current sigla registry.
 */
export function readFreshCommentaryTurnIndex(dialogue: string): TurnIndex {
  const repoRoot = getRepoRoot();
  const path = turnIndexPath(dialogue);
  const absolutePath = join(repoRoot, path);
  if (!existsSync(absolutePath)) throw new Error(`Missing required commentary turn index: ${path}`);

  const index = parseTurnIndexToon(readFileSync(absolutePath, "utf8"));
  const sourcePath = `raw/plato/greek/${dialogue}.txt`;
  const source = readFileSync(join(repoRoot, sourcePath), "utf8");
  const siglaPath = "derived/plato/turns/sigla.toml";
  const absoluteSiglaPath = join(repoRoot, siglaPath);
  if (index.dialogue !== dialogue || index.sourcePath !== sourcePath || index.sourceSha256 !== sha256(source)) {
    throw new Error(`Stale or mismatched commentary turn index: ${path}`);
  }
  if (
    !existsSync(absoluteSiglaPath) ||
    index.siglaPath !== siglaPath ||
    index.siglaSha256 !== sha256(readFileSync(absoluteSiglaPath, "utf8"))
  ) {
    throw new Error(`Stale or mismatched commentary turn-index sigla provenance: ${path}`);
  }
  if (index.turns.length === 0) throw new Error(`Commentary turn index has no turns: ${path}`);

  let cursor = 0;
  for (const turn of index.turns) {
    if (
      turn.startChar !== cursor ||
      turn.endChar <= turn.startChar ||
      turn.endChar > source.length ||
      turn.textSha256 !== sha256(source.slice(turn.startChar, turn.endChar))
    ) {
      throw new Error(`Stale or non-contiguous commentary turn index row ${turn.turnId} in ${path}`);
    }
    cursor = turn.endChar;
  }
  if (cursor !== source.length) throw new Error(`Commentary turn index does not cover the full source: ${path}`);
  return index;
}

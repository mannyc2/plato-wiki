/**
 * Hard cutover of claim `speaker` to the innermost textually
 * licensed owner.
 *
 * FAIL-CLOSED AND ALL-OR-NOTHING.
 *
 * Two gates, both refusing rather than doing part of the job:
 *
 *  1. The migration reads ONLY the derived voices layer, and the compiler puts
 *     nothing there until an operator accepts an atomic cohort of voice records.
 *     While the ledger is unreviewed this script refuses outright.
 *
 *  2. `--apply` refuses unless EVERY accepted claim in scope is resolved to one
 *     owner. Migrating the resolved ones while leaving accepted-but-unresolved
 *     claims behind would leave two meanings of `speaker` in the same ledger:
 *     "innermost licensed owner" for the migrated ones and "outer printed turn
 *     siglum" for the rest. There is no reading of a ledger in that state.
 *     Unresolved claims must first move to a non-accepted status through the
 *     ordinary provenance-backed review lane.
 *
 * `--plan` always reports, including the blocking set, so review has the list.
 * It is the ONLY mode that writes the migration artifact. `--apply` consumes
 * that exact reviewed artifact and refuses if the claims, authority, counts,
 * blockers, or change list have moved underneath it.
 *
 * A claim's owner comes from its own textual support, never from its stance
 * events: a claim asserted by Diotima and later challenged by Socrates has one
 * owner and two actors.
 *
 * Usage:
 *   bun scripts/voices/migrate-claim-speakers.ts <dialogue> --plan
 *   bun scripts/voices/migrate-claim-speakers.ts <dialogue> --apply
 *   bun scripts/voices/migrate-claim-speakers.ts <dialogue> --verify
 *
 * `--plan` writes only the artifact under wiki/review/. `--apply` writes only
 * wiki/claims/<dialogue>.md, by same-directory atomic rename. `--verify` writes
 * nothing.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync, writeSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  buildVoiceJoin,
  formatVoiceJoinToon,
  voiceJoinPath,
} from "../../packages/harness/src/derived/voice-joins.js";
import { setRepoRootForTesting } from "../../packages/harness/src/paths.js";

// VOICES_REPO_ROOT lets the integration tests drive this script — the real
// artifact an operator runs — against a fixture repository. Unset, it is the
// repository this file lives in.
const REPO = process.env.VOICES_REPO_ROOT ?? new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
setRepoRootForTesting(REPO);

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;
const BLOCK_PLACEHOLDER = "␟";

function fail(message: string): never {
  // Bun may discard buffered console output when a subprocess exits
  // immediately. Refusal diagnostics are part of this operator boundary, so
  // write them synchronously before exiting.
  writeSync(2, `migrate-claim-speakers: ${message}\n`);
  process.exit(1);
}

function log(message: string) {
  writeSync(1, `${message}\n`);
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Replace a file by atomic same-directory rename.
 *
 * The target is untouched until the complete postimage exists. Any write or
 * rename failure removes the temporary file and leaves the original target in
 * place. A stale temporary file also fails closed because `wx` never reuses it.
 */
function atomicReplace(path: string, content: string, { simulateAbort = false } = {}) {
  const temporary = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(temporary, content, { encoding: "utf8", flag: "wx" });
    if (simulateAbort) throw new Error("simulated abort after temporary write");
    renameSync(temporary, path);
  } catch (error) {
    if (existsSync(temporary)) {
      try {
        unlinkSync(temporary);
      } catch (cleanupError) {
        throw new Error(
          `${error instanceof Error ? error.message : String(error)}; additionally could not remove ${temporary}: ` +
            `${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
        );
      }
    }
    throw error;
  }
}

const dialogue = process.argv[2];
const mode = process.argv[3];
if (!dialogue || !/^[a-z0-9-]+$/u.test(dialogue) || !["--plan", "--apply", "--verify"].includes(mode ?? "")) {
  fail("usage: bun scripts/voices/migrate-claim-speakers.ts <dialogue> --plan | --apply | --verify");
}

const claimsRelative = `wiki/claims/${dialogue}.md`;
const claimsPath = join(REPO, claimsRelative);
if (!existsSync(claimsPath)) fail(`no claim ledger at ${claimsRelative}`);

const artifactRelative = `wiki/review/2026-07-voices/${dialogue}-speaker-migration.json`;
const artifactPath = join(REPO, artifactRelative);

// --- Gate 1: authoritative voice data must exist. ---------------------------
const voiceIndexRelative = `derived/plato/voices/${dialogue}.toon`;
if (!existsSync(join(REPO, voiceIndexRelative))) {
  fail(
    `${voiceIndexRelative} does not exist. The voice ledger has not been accepted and compiled; ` +
      `run \`bun run harness derive voices ${dialogue}\` after review. Refusing to migrate on unreviewed authority.`,
  );
}

let joined;
try {
  joined = buildVoiceJoin(dialogue);
} catch (error) {
  fail(`could not build the voice join: ${error instanceof Error ? error.message : String(error)}`);
}

const claimRows = joined.rows.filter((row) => row.recordKind === "claim");
if (claimRows.length === 0) fail(`the voice join produced no claim rows for ${dialogue}.`);

// --- Derive the plan --------------------------------------------------------
const claimsBefore = readFileSync(claimsPath, "utf8");
const rowById = new Map(claimRows.map((row) => [row.recordId, row]));
const stanceByClaim = new Map<string, typeof joined.stanceRows>();
for (const row of joined.stanceRows) {
  stanceByClaim.set(row.claimId, [...(stanceByClaim.get(row.claimId) ?? []), row]);
}

type Change = { claimId: string; from: string; to: string; evidence: string };
type Blocker = { claimId: string; reviewStatus: string; speaker: string; status: string; evidence: string };

const changes: Change[] = [];
const unchanged: string[] = [];
const blockers: Blocker[] = [];
const nonAcceptedUnresolved: Blocker[] = [];

for (const match of claimsBefore.matchAll(YAML_BLOCK_RE)) {
  const block = match[1] ?? "";
  const claimId = /^claim_id:\s*(\S+)\s*$/mu.exec(block)?.[1];
  if (!claimId) continue;
  const speaker = (/^speaker:\s*(.*)$/mu.exec(block)?.[1] ?? "").trim().replace(/^"(.*)"$/u, "$1");
  const reviewStatus = (/^review_status:\s*(\S+)\s*$/mu.exec(block)?.[1] ?? "unreviewed").trim();
  const row = rowById.get(claimId);
  if (!row) {
    blockers.push({ claimId, reviewStatus, speaker, status: "missing_join_row", evidence: "no join row" });
    continue;
  }
  const resolved = row.status === "resolved" || row.status === "turn_level";
  if (!resolved) {
    const blocker = { claimId, reviewStatus, speaker, status: row.status, evidence: row.evidence };
    // Only ACCEPTED claims block the cutover. A claim already moved to
    // rejected/needs_split has been dealt with by the review lane.
    if (reviewStatus === "accepted") blockers.push(blocker);
    else nonAcceptedUnresolved.push(blocker);
    continue;
  }
  if (speaker === row.owner) unchanged.push(claimId);
  else changes.push({ claimId, from: speaker, to: row.owner, evidence: row.evidence });
}

const changedIds = new Set(changes.map((change) => change.claimId));

// --- Rewrite, blast-radius checked ------------------------------------------
function rewrite(content: string) {
  return content.replace(YAML_BLOCK_RE, (fullMatch, block: string) => {
    const claimId = /^claim_id:\s*(\S+)\s*$/mu.exec(block)?.[1];
    if (!claimId || !changedIds.has(claimId)) return fullMatch;
    const change = changes.find((candidate) => candidate.claimId === claimId)!;
    const rewritten = block.replace(/^speaker:\s*.*$/mu, `speaker: ${change.to}`);
    if (rewritten === block) fail(`${claimId}: speaker line not found`);
    return `\`\`\`yaml\n${rewritten}\n\`\`\``;
  });
}

const claimsAfter = rewrite(claimsBefore);

/** Everything outside the yaml fences must be byte-identical. */
function outsideBlocks(content: string) {
  return content.replace(YAML_BLOCK_RE, BLOCK_PLACEHOLDER);
}
if (outsideBlocks(claimsBefore) !== outsideBlocks(claimsAfter)) {
  fail("text outside yaml blocks changed; refusing to write");
}

const beforeBlocks = [...claimsBefore.matchAll(YAML_BLOCK_RE)].map((m) => m[1] ?? "");
const afterBlocks = [...claimsAfter.matchAll(YAML_BLOCK_RE)].map((m) => m[1] ?? "");
if (beforeBlocks.length !== afterBlocks.length) fail("block count changed; refusing to write");
for (let index = 0; index < beforeBlocks.length; index += 1) {
  const claimId = /^claim_id:\s*(\S+)\s*$/mu.exec(beforeBlocks[index]!)?.[1];
  const changed = beforeBlocks[index] !== afterBlocks[index];
  if (changed && (!claimId || !changedIds.has(claimId))) {
    fail(`unexpected change in block ${claimId ?? `#${index}`}`);
  }
  if (!changed && claimId && changedIds.has(claimId)) {
    fail(`authorized block ${claimId} was not changed`);
  }
  if (changed) {
    const strip = (block: string) => block.replace(/^speaker:\s*.*$/mu, "speaker: <redacted>");
    if (strip(beforeBlocks[index]!) !== strip(afterBlocks[index]!)) {
      fail(`block ${claimId} changed outside its speaker line`);
    }
  }
}

const artifact = {
  plan: "071",
  dialogue,
  generated_from: {
    voice_index_path: voiceIndexRelative,
    voice_index_sha256: joined.voiceIndexSha256,
    claim_ledger_path: claimsRelative,
    claim_ledger_sha256_before: sha256(claimsBefore),
    claim_ledger_sha256_after: sha256(claimsAfter),
  },
  counts: {
    claims_total: beforeBlocks.length,
    migrated: changes.length,
    already_correct: unchanged.length,
    blocking_accepted: blockers.length,
    unresolved_but_not_accepted: nonAcceptedUnresolved.length,
  },
  changes,
  blocking_accepted: blockers,
  unresolved_but_not_accepted: nonAcceptedUnresolved,
  stance_actors_differing_from_owner: claimRows
    .filter((row) => row.trajectory.length > 1)
    .map((row) => ({
      claimId: row.recordId,
      owner: row.owner,
      actors: (stanceByClaim.get(row.recordId) ?? []).map((event) => ({
        index: event.eventIndex,
        kind: event.eventKind,
        actor: event.actor,
      })),
    })),
};
const artifactContent = `${JSON.stringify(artifact, null, 2)}\n`;

if (mode === "--verify") {
  if (!existsSync(artifactPath)) fail(`no artifact at ${artifactRelative}; run --plan or --apply first`);
  const recorded = JSON.parse(readFileSync(artifactPath, "utf8")) as typeof artifact;

  // The artifact records the exact authority used for the migration. Checking
  // only its changed claims is insufficient: a claim that happened to be
  // already correct was omitted from that list, so a later authority change
  // could silently make it wrong. Refuse before looking at individual rows if
  // the stored voice index is not byte-identical to the one that was applied.
  const currentVoiceIndexSha = sha256(readFileSync(join(REPO, voiceIndexRelative), "utf8"));
  if (currentVoiceIndexSha !== recorded.generated_from.voice_index_sha256) {
    fail(
      `${voiceIndexRelative} changed after the migration ` +
        `(current ${currentVoiceIndexSha}, artifact ${recorded.generated_from.voice_index_sha256}). ` +
        "Re-plan and re-apply against the current accepted authority.",
    );
  }

  // The corrected cutover order regenerates the materialized join after
  // applying claim speakers and before verification. `--verify` therefore
  // requires that artifact and compares every byte with a deterministic rebuild
  // from the current index + ledgers. A stale or hand-edited join is not proof of
  // a completed cutover.
  const joinRelative = voiceJoinPath(dialogue);
  const joinAbsolute = join(REPO, joinRelative);
  if (!existsSync(joinAbsolute)) {
    fail(
      `${joinRelative} does not exist. Regenerate it after --apply with ` +
        `\`bun run harness derive voice-joins ${dialogue}\`, then verify again.`,
    );
  }
  const expectedJoin = formatVoiceJoinToon(joined);
  if (readFileSync(joinAbsolute, "utf8") !== expectedJoin) {
    fail(
      `${joinRelative} is stale or non-deterministic relative to the current voice index, claim ledger, ` +
        `and observation ledger. Regenerate it before verification.`,
    );
  }

  const onDisk = sha256(readFileSync(claimsPath, "utf8"));
  if (onDisk !== recorded.generated_from.claim_ledger_sha256_after) {
    fail(
      `${claimsRelative} does not match the applied migration ` +
        `(disk ${onDisk}, artifact ${recorded.generated_from.claim_ledger_sha256_after})`,
    );
  }
  let acceptedVerified = 0;
  for (const match of claimsBefore.matchAll(YAML_BLOCK_RE)) {
    const block = match[1] ?? "";
    const claimId = /^claim_id:\s*(\S+)\s*$/mu.exec(block)?.[1];
    if (!claimId) continue;
    const reviewStatus = (/^review_status:\s*(\S+)\s*$/mu.exec(block)?.[1] ?? "unreviewed").trim();
    if (reviewStatus !== "accepted") continue;

    const speaker = (/^speaker:\s*(.*)$/mu.exec(block)?.[1] ?? "").trim().replace(/^"(.*)"$/u, "$1");
    const row = rowById.get(claimId);
    if (!row) fail(`${claimId}: accepted claim has no current voice-join row`);
    if (row.status !== "resolved" && row.status !== "turn_level") {
      fail(`${claimId}: accepted claim no longer resolves to one owner (${row.status}: ${row.evidence})`);
    }
    if (speaker !== row.owner) {
      fail(`${claimId}: accepted claim has speaker ${JSON.stringify(speaker)} but current owner is ${JSON.stringify(row.owner)}`);
    }
    acceptedVerified += 1;
  }
  log(
    `migrate-claim-speakers --verify: PASS (${acceptedVerified} accepted claim(s) match the current authority; ` +
      `${recorded.changes.length} speaker(s) migrated)`,
  );
  process.exit(0);
}

if (mode === "--plan") {
  mkdirSync(dirname(artifactPath), { recursive: true });
  try {
    atomicReplace(artifactPath, artifactContent);
  } catch (error) {
    fail(`could not write ${artifactRelative}: ${error instanceof Error ? error.message : String(error)}`);
  }
  log(`migrate-claim-speakers: wrote ${artifactRelative}`);
  log(
    `migrate-claim-speakers: plan = ${changes.length} speaker change(s), ${unchanged.length} already correct, ` +
      `${blockers.length} accepted claim(s) blocking, ${nonAcceptedUnresolved.length} unresolved but not accepted`,
  );
  process.exit(0);
}

if (mode === "--apply") {
  // `--apply` never manufactures or repairs its own authorization. The exact
  // freshly computed plan must already be present, byte for byte, proving that
  // the operator reviewed this claim preimage against this voice-index hash and
  // this complete change/blocker set. This binding is stronger than requiring a
  // clean Git target: intentional reviewed work may be uncommitted, while even
  // committed drift after --plan is rejected.
  if (!existsSync(artifactPath)) {
    fail(`no reviewed plan artifact at ${artifactRelative}; run --plan and review it before --apply`);
  }
  const reviewedPlan = readFileSync(artifactPath, "utf8");
  if (reviewedPlan !== artifactContent) {
    fail(
      `${artifactRelative} does not match the current migration plan. The claim preimage, voice authority, ` +
        `counts, blockers, or change list changed after review. Refusing to replace either the artifact or ` +
        `${claimsRelative}; run --plan again and review the replacement before --apply.`,
    );
  }

  // --- Gate 2: all-or-nothing. ---------------------------------------------
  if (blockers.length > 0) {
    const sample = blockers.slice(0, 5).map((b) => `  - ${b.claimId} (${b.status}): ${b.evidence}`);
    fail(
      `refusing a partial cutover: ${blockers.length} accepted claim(s) resolve to no single owner.\n` +
        `${sample.join("\n")}\n` +
        (blockers.length > sample.length ? `  ... ${blockers.length - sample.length} more\n` : "") +
        `Applying now would leave two meanings of "speaker" in ${claimsRelative}. Either anchor these claims\n` +
        "so they resolve, or move them to a non-accepted status through the review lane (appending\n" +
        "wiki/ingest-log.md and a note under wiki/review/), then re-run --plan.\n" +
      `The full list is in ${artifactRelative}.`,
    );
  }

  try {
    atomicReplace(claimsPath, claimsAfter, {
      // Integration-only fault injection. It is unavailable in an operator run
      // because the real repository does not set VOICES_REPO_ROOT.
      simulateAbort:
        process.env.VOICES_REPO_ROOT !== undefined &&
        process.env.VOICES_MIGRATION_TEST_ABORT_AFTER_TEMP_WRITE === "1",
    });
  } catch (error) {
    fail(
      `could not atomically apply the reviewed migration to ${claimsRelative}: ` +
        `${error instanceof Error ? error.message : String(error)}`,
    );
  }
  log(`migrate-claim-speakers: applied ${changes.length} speaker change(s) to ${claimsRelative}`);
}

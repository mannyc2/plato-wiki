import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { listGreekDialogues } from "./stephanus.js";

declare const Bun: { TOML: { parse(content: string): unknown } };

/**
 * The claim-speaker activation registry.
 *
 * Extracting nested reported turns, accepting them, compiling them, and letting
 * them rewrite claim speakers are four separate events. Before the voice activation contract the
 * repository ran the last one off the presence of a compiled index, so a
 * dialogue could not hold accepted structural data without also migrating every
 * claim that data touched. That is a consumer constraint wearing an extraction
 * constraint's clothes, and it is what made Phaedo look dangerous to extract.
 *
 * This registry is the ONLY authority for the fourth event. It is hand-written
 * and reviewed, like `derived/plato/voices/sigla.toml` — never generated. There
 * is deliberately no `inactive` status and no inferred activation: absence is
 * the non-active state, so rolling a dialogue back means deleting its entry and
 * saying so in a commit.
 */
export type VoiceCutoverEntry = {
  slug: string;
  status: "active";
  /** Repository-relative path, under `wiki/review/`, to the reviewed decision. */
  decisionNote: string;
};

export function voiceCutoverRegistryPath() {
  return "derived/plato/voices/cutovers.toml";
}

type ParsedRegistry = {
  schema_version?: unknown;
  dialogues?: Array<{ slug?: unknown; status?: unknown; decision_note?: unknown }>;
};

/**
 * Parse and fully validate the registry.
 *
 * Absence is not a failure: it is the state of every dialogue in the corpus
 * before its first cutover, and the whole point of this plan is that such a
 * dialogue may still hold accepted reported-turn data.
 */
function parseRegistry(): { entries: VoiceCutoverEntry[]; failures: string[] } {
  const relativePath = voiceCutoverRegistryPath();
  const repoRoot = getRepoRoot();
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return { entries: [], failures: [] };

  const content = readFileSync(absolutePath, "utf8");
  let parsed: ParsedRegistry;
  try {
    parsed = Bun.TOML.parse(content) as ParsedRegistry;
  } catch (error) {
    return {
      entries: [],
      failures: [`${relativePath} cannot be parsed as TOML (${error instanceof Error ? error.message : String(error)}).`],
    };
  }

  const failures: string[] = [];
  if (parsed.schema_version !== 1) {
    failures.push(
      `${relativePath} must declare schema_version = 1 (found ${JSON.stringify(parsed.schema_version ?? null)}).`,
    );
  }

  const canonical = new Set(listGreekDialogues());
  const entries: VoiceCutoverEntry[] = [];
  const seen = new Set<string>();

  for (const [position, entry] of (parsed.dialogues ?? []).entries()) {
    const where = `${relativePath} entry ${position + 1}`;
    const slug = entry.slug;
    if (typeof slug !== "string" || !/^[a-z0-9-]+$/u.test(slug)) {
      failures.push(`${where} has no valid slug (found ${JSON.stringify(slug ?? null)}).`);
      continue;
    }
    if (seen.has(slug)) {
      failures.push(`${relativePath} lists "${slug}" more than once; each dialogue may be activated at most once.`);
      continue;
    }
    seen.add(slug);
    if (!canonical.has(slug)) {
      failures.push(`${where}: "${slug}" is not a canonical dialogue under raw/plato/greek/.`);
      continue;
    }

    // One status, on purpose. An `inactive` row would be a second way to say
    // what absence already says, and the two would eventually disagree.
    if (entry.status !== "active") {
      failures.push(
        `${where} ("${slug}") has status ${JSON.stringify(entry.status ?? null)}; the only allowed status is "active". ` +
          "Remove the entry to deactivate a dialogue.",
      );
      continue;
    }

    const note = entry.decision_note;
    if (typeof note !== "string" || note.trim().length === 0) {
      failures.push(`${where} ("${slug}") has no decision_note naming the reviewed cutover decision.`);
      continue;
    }
    if (isAbsolute(note) || note.split("/").includes("..")) {
      failures.push(
        `${where} ("${slug}") has decision_note "${note}", which must be a repository-relative path with no "..".`,
      );
      continue;
    }
    if (!note.startsWith("wiki/review/")) {
      failures.push(`${where} ("${slug}") has decision_note "${note}", which must be under wiki/review/.`);
      continue;
    }
    const noteAbsolute = join(repoRoot, note);
    if (!existsSync(noteAbsolute)) {
      failures.push(`${where} ("${slug}") cites decision_note "${note}", which does not exist.`);
      continue;
    }
    if (readFileSync(noteAbsolute, "utf8").trim().length === 0) {
      failures.push(`${where} ("${slug}") cites decision_note "${note}", which is empty.`);
      continue;
    }

    entries.push({ slug, status: "active", decisionNote: note });
  }

  return { entries: failures.length > 0 ? [] : entries, failures };
}

/** Registry failures for `bun run validate`, which reports rather than throws. */
export function collectVoiceCutoverRegistryFailures(): string[] {
  return parseRegistry().failures;
}

/** The validated registry. Throws rather than guessing when it does not parse. */
export function readVoiceCutoverRegistry(): VoiceCutoverEntry[] {
  const { entries, failures } = parseRegistry();
  if (failures.length > 0) {
    throw new Error(
      `Refusing to read ${voiceCutoverRegistryPath()} while it is invalid:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
    );
  }
  return entries;
}

export function activeVoiceCutoverSlugs(): string[] {
  return readVoiceCutoverRegistry()
    .map((entry) => entry.slug)
    .sort();
}

/**
 * Whether this dialogue's reported-turn data may drive claim attribution.
 *
 * Fails closed: an unreadable registry throws rather than answering `false`,
 * because "not activated" and "we could not tell" must not look the same to a
 * caller deciding whether to rewrite a speaker.
 */
export function isVoiceCutoverActive(dialogue: string): boolean {
  return readVoiceCutoverRegistry().some((entry) => entry.slug === dialogue);
}

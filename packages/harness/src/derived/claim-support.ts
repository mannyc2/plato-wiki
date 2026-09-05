import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { claimYamlBlocks } from "../wiki/claim-ledger.js";
import { fieldValue } from "../wiki/observation-ledger.js";

/**
 * A claim's canonical `source_ref` is a Stephanus context window. In a narrated
 * dialogue that window routinely spans several utterances by different voices —
 * claim_symposium_0106 cites 202d-202e, which contains a Socrates question
 * between the two Diotima utterances the claim actually rests on.
 *
 * The window is therefore the wrong unit for attribution. This module derives
 * EXACT support ranges instead: it locates the claim's reviewed `greek_terms`
 * inside its own window and records where each one actually sits. Ownership is
 * then decided from those ranges, not from the window.
 *
 * Two rules keep this honest:
 *   - The search never leaves the claim's own canonical window.
 *   - A missing term always yields `needs_anchor`. A repeated term instead
 *     enumerates every possible occurrence so the join can determine whether
 *     choosing among them would actually change the attribution outcome.
 */
export type ClaimSupportRange = {
  term: string;
  startChar: number;
  endChar: number;
};

export type ClaimAnchorGap = {
  term: string;
  reason: "missing";
  occurrences: number;
};

/**
 * A term occurring more than once inside its own window, with EVERY occurrence
 * enumerated.
 *
 * A nonunique term used to be an automatic `needs_anchor`, on the reasoning that
 * picking one occurrence means reading the English to decide which was meant.
 * That reasoning holds for PICKING — but not for the case where the choice makes
 * no difference. The join evaluates one occurrence per ambiguous term and can
 * preserve any invariant result — resolved, cross-voice, or unresolved —
 * without choosing at all.
 *
 * This is deliberately the narrow rule. The rejected wider rule was "resolve
 * when the uniquely located terms agree", which ignores the unlocated ones: the
 * term that could not be pinned down might sit in the other voice, and its
 * silence would be read as assent.
 */
export type ClaimCandidateTerm = {
  term: string;
  occurrences: ClaimSupportRange[];
};

export type ClaimStanceEvent = {
  index: number;
  kind: string;
  startChar: number;
  endChar: number;
};

export type ClaimSupport = {
  claimId: string;
  reviewStatus: string;
  speaker: string;
  contextStartChar: number;
  contextEndChar: number;
  /** Exact source bytes reviewed only to determine the claim's semantic owner. */
  speakerRange?: { startChar: number; endChar: number };
  terms: string[];
  /** Terms located exactly once: one byte-verified range each. */
  ranges: ClaimSupportRange[];
  /** Terms located more than once, with every occurrence enumerated. */
  candidates: ClaimCandidateTerm[];
  /** Terms not present in their own window at all. Always fail-closed. */
  anchorGaps: ClaimAnchorGap[];
  stanceEvents: ClaimStanceEvent[];
};

type YamlRecord = Record<string, unknown>;

function asRecord(value: unknown): YamlRecord | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as YamlRecord)
    : undefined;
}

function parseClaimRecord(block: string): YamlRecord {
  const bun = (
    globalThis as typeof globalThis & {
      Bun?: { YAML: { parse(source: string): unknown } };
    }
  ).Bun;
  if (!bun) throw new Error("Bun.YAML.parse is required to read claim support");
  const parsed = asRecord(bun.YAML.parse(block));
  if (!parsed) throw new Error("claim yaml block must be a mapping");
  return parsed;
}

function parseGreekTerms(record: YamlRecord): string[] {
  const value = record.greek_terms;
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value) || value.some((term) => typeof term !== "string")) {
    throw new Error("greek_terms must be a YAML sequence of strings");
  }
  return value;
}

function charPair(value: unknown): [number, number] | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const start = record.start_char;
  const end = record.end_char;
  return typeof start === "number" && Number.isInteger(start) && typeof end === "number" && Number.isInteger(end)
    ? [start, end]
    : undefined;
}

function parseStanceEvents(record: YamlRecord): ClaimStanceEvent[] {
  if (!Array.isArray(record.stance_events)) return [];
  return record.stance_events.flatMap((value, index) => {
    const event = asRecord(value);
    const pair = charPair(event?.source_ref);
    if (!event || !pair) return [];
    return [{ index, kind: typeof event.kind === "string" ? event.kind : "(unknown)", startChar: pair[0], endChar: pair[1] }];
  });
}

export function buildClaimSupport(dialogue: string): ClaimSupport[] {
  const repoRoot = getRepoRoot();
  const claimPath = join(repoRoot, `wiki/claims/${dialogue}.md`);
  if (!existsSync(claimPath)) return [];
  const sourcePath = join(repoRoot, `raw/plato/greek/${dialogue}.txt`);
  const source = readFileSync(sourcePath, "utf8");

  return claimYamlBlocks(readFileSync(claimPath, "utf8"))
    .map((block): ClaimSupport | undefined => {
      const record = parseClaimRecord(block);
      const claimId = fieldValue(block, "claim_id");
      if (!claimId) return undefined;
      const own = charPair(record.source_ref);
      if (!own) return undefined;
      const [contextStartChar, contextEndChar] = own;
      const window = source.slice(contextStartChar, contextEndChar);

      const terms = parseGreekTerms(record);
      const ranges: ClaimSupportRange[] = [];
      const candidates: ClaimCandidateTerm[] = [];
      const anchorGaps: ClaimAnchorGap[] = [];
      for (const term of terms) {
        const occurrences: ClaimSupportRange[] = [];
        let cursor = window.indexOf(term);
        while (cursor !== -1) {
          const startChar = contextStartChar + cursor;
          occurrences.push({ term, startChar, endChar: startChar + term.length });
          cursor = window.indexOf(term, cursor + 1);
        }
        if (occurrences.length === 1) {
          ranges.push(occurrences[0]!);
        } else if (occurrences.length === 0) {
          // A term that is not in its own window means the claim's cited
          // evidence cannot be verified at all. Never resolvable.
          anchorGaps.push({ term, reason: "missing", occurrences: 0 });
        } else {
          candidates.push({ term, occurrences });
        }
      }

      const stanceEvents = parseStanceEvents(record);
      const speakerRangePair = charPair(record.speaker_source_ref);

      return {
        claimId,
        reviewStatus: fieldValue(block, "review_status") ?? "unreviewed",
        speaker: fieldValue(block, "speaker") ?? "",
        contextStartChar,
        contextEndChar,
        ...(speakerRangePair
          ? { speakerRange: { startChar: speakerRangePair[0], endChar: speakerRangePair[1] } }
          : {}),
        terms,
        ranges: ranges.sort((a, b) => a.startChar - b.startChar),
        candidates,
        anchorGaps,
        stanceEvents,
      };
    })
    .filter((support): support is ClaimSupport => support !== undefined)
    .sort((a, b) => a.claimId.localeCompare(b.claimId));
}

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
  terms: string[];
  /** Terms located exactly once: one byte-verified range each. */
  ranges: ClaimSupportRange[];
  /** Terms located more than once, with every occurrence enumerated. */
  candidates: ClaimCandidateTerm[];
  /** Terms not present in their own window at all. Always fail-closed. */
  anchorGaps: ClaimAnchorGap[];
  stanceEvents: ClaimStanceEvent[];
};

function parseGreekTerms(block: string): string[] {
  const lines = block.split(/\r?\n/u);
  const start = lines.findIndex((line) => /^greek_terms:\s*(?:.*)?$/u.test(line));
  if (start === -1) return [];

  // Parse only this field, not the full claim. Besides keeping this mechanical
  // extractor independent of the rest of the claim schema, this delegates flow
  // punctuation to the YAML grammar itself. In particular, apostrophes in
  // valid unquoted scalars (`πρόσωπα δύ'`, `τὰ δ' Ἀθηναίων πράττω`) are ordinary
  // content, while commas inside quoted scalars stay inside that scalar.
  let end = start + 1;
  if (/^greek_terms:\s*$/u.test(lines[start]!)) {
    while (end < lines.length && (lines[end]!.trim() === "" || /^[ \t]/u.test(lines[end]!))) end += 1;
  }
  const bun = (
    globalThis as typeof globalThis & {
      Bun?: { YAML: { parse(source: string): unknown } };
    }
  ).Bun;
  if (!bun) throw new Error("Bun.YAML.parse is required to read greek_terms");
  const parsed = bun.YAML.parse(lines.slice(start, end).join("\n"));
  if (typeof parsed !== "object" || parsed === null || !("greek_terms" in parsed)) return [];
  const value = (parsed as { greek_terms?: unknown }).greek_terms;
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value) || value.some((term) => typeof term !== "string")) {
    throw new Error("greek_terms must be a YAML sequence of strings");
  }
  return value;
}

/** Every `start_char`/`end_char` pair in order of appearance; the first is the claim's own. */
function parseCharPairs(block: string): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (const match of block.matchAll(/^\s+start_char:\s*(\d+)\s*$\n\s+end_char:\s*(\d+)\s*$/gmu)) {
    pairs.push([Number(match[1]), Number(match[2])]);
  }
  return pairs;
}

function parseStanceEventKinds(block: string): string[] {
  return [...block.matchAll(/^\s+- kind:\s*(\S+)\s*$/gmu)].map((match) => match[1] ?? "");
}

export function buildClaimSupport(dialogue: string): ClaimSupport[] {
  const repoRoot = getRepoRoot();
  const claimPath = join(repoRoot, `wiki/claims/${dialogue}.md`);
  if (!existsSync(claimPath)) return [];
  const sourcePath = join(repoRoot, `raw/plato/greek/${dialogue}.txt`);
  const source = readFileSync(sourcePath, "utf8");

  return claimYamlBlocks(readFileSync(claimPath, "utf8"))
    .map((block): ClaimSupport | undefined => {
      const claimId = fieldValue(block, "claim_id");
      if (!claimId) return undefined;
      const pairs = parseCharPairs(block);
      const own = pairs[0];
      if (!own) return undefined;
      const [contextStartChar, contextEndChar] = own;
      const window = source.slice(contextStartChar, contextEndChar);

      const terms = parseGreekTerms(block);
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

      const kinds = parseStanceEventKinds(block);
      const stanceEvents = pairs.slice(1).map((pair, index) => ({
        index,
        kind: kinds[index] ?? "(unknown)",
        startChar: pair[0],
        endChar: pair[1],
      }));

      return {
        claimId,
        reviewStatus: fieldValue(block, "review_status") ?? "unreviewed",
        speaker: fieldValue(block, "speaker") ?? "",
        contextStartChar,
        contextEndChar,
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

// Who speaks: each speaker's share of a dialogue's Greek letters, the unit the turn index counts
// (docs/cutover/analysis.md, Analytics). A letter counts for the innermost resolved voice of depth 2
// or more, otherwise for its turn's speaker; a resolved depth-1 voice names an unlabelled turn's
// owner. Letters in an unresolved voice count for the innermost resolved speaker above them, as
// quoted by that speaker, when that speaker sits at or below the scene's level; otherwise they are
// not yet attributed. Letters no speaker owns, such as a title, are left out.
//
// Counts stay integers so a rebuild is byte-identical; consumers turn them into percentages.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { parseTurnIndexToon, turnIndexPath, type TurnRecord } from "./turns.js";
import { readVoiceIndex, voicesLedgerPath } from "./voices.js";

// The turn index's Greek letter class, so shares and turn counts measure the same thing.
const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/u;
const UNLABELLED = "(none)";

export type SpeakerVoice = {
  readonly startChar: number;
  readonly endChar: number;
  readonly depth: number;
  readonly voiceChain: ReadonlyArray<string>;
  readonly resolution: string;
};

export type WhoSpeaksShare = {
  readonly speaker: string;
  // The speaker who delivers a voice performed below the scene, such as Socrates giving the Laws'
  // speech in the Crito.
  readonly performer?: string;
  readonly letters: number;
  // Letters of unresolved voices this speaker quotes, included in `letters`.
  readonly quoted: number;
};

export type WhoSpeaks = {
  readonly dialogue: string;
  readonly sceneLevel: number;
  // Every counted letter: the shares plus `notYetAttributed`.
  readonly letters: number;
  readonly shares: ReadonlyArray<WhoSpeaksShare>;
  readonly notYetAttributed: number;
};

type Owner = { speaker: string; performer?: string; quoted: boolean } | "unattributed" | undefined;

export function whoSpeaks(
  dialogue: string,
  source: string,
  turns: ReadonlyArray<TurnRecord>,
  voices: ReadonlyArray<SpeakerVoice>,
  sceneLevel: number,
): WhoSpeaks {
  const owners: Owner[] = new Array<Owner>(source.length);
  for (const turn of turns) {
    for (let at = turn.startChar; at < turn.endChar; at += 1) owners[at] = turn.speaker === UNLABELLED ? undefined : { speaker: turn.speaker, quoted: false };
  }
  // The innermost voice wins, so apply shallow records first. A voice lies inside its outer turn,
  // which the voices ledger validates.
  const ordered = [...voices].sort((a, b) => a.depth - b.depth || a.startChar - b.startChar);
  for (const voice of ordered) {
    const chain = voice.voiceChain;
    let owner: Owner;
    if (voice.resolution === "resolved" && voice.depth === 1) owner = { speaker: chain[0]!, quoted: false };
    else if (voice.resolution === "resolved") {
      const performer = chain.length > sceneLevel ? chain.at(-2) : undefined;
      owner = performer ? { speaker: chain.at(-1)!, performer, quoted: false } : { speaker: chain.at(-1)!, quoted: false };
    } else {
      // The voice chain lists the resolved speakers above an unresolved voice; its last entry is
      // the innermost of them, at depth chain.length.
      const above = chain.at(-1);
      owner = above && chain.length >= sceneLevel ? { speaker: above, quoted: true } : "unattributed";
    }
    owners.fill(owner, voice.startChar, voice.endChar);
  }

  const shares = new Map<string, { speaker: string; performer?: string; letters: number; quoted: number }>();
  let letters = 0;
  let notYetAttributed = 0;
  for (let at = 0; at < source.length; at += 1) {
    const owner = owners[at];
    if (owner === undefined || !GREEK_LETTER.test(source[at]!)) continue;
    letters += 1;
    if (owner === "unattributed") {
      notYetAttributed += 1;
      continue;
    }
    const key = `${owner.speaker}\u0000${owner.performer ?? ""}`;
    const share = shares.get(key) ?? { speaker: owner.speaker, ...(owner.performer ? { performer: owner.performer } : {}), letters: 0, quoted: 0 };
    share.letters += 1;
    if (owner.quoted) share.quoted += 1;
    shares.set(key, share);
  }
  return {
    dialogue,
    sceneLevel,
    letters,
    shares: [...shares.values()].sort((a, b) => b.letters - a.letters || (a.speaker < b.speaker ? -1 : 1)),
    notYetAttributed,
  };
}

// Who speaks over the committed sources: the turn index and the accepted voice index. A dialogue
// with no voices ledger has no voices inside its turns; one with a ledger must have compiled it.
export function readWhoSpeaks(dialogue: string, sceneLevel: number, repoRoot = getRepoRoot()): WhoSpeaks {
  const source = readFileSync(join(repoRoot, "raw/plato/greek", `${dialogue}.txt`), "utf8");
  const turns = parseTurnIndexToon(readFileSync(join(repoRoot, turnIndexPath(dialogue)), "utf8")).turns;
  const voices = existsSync(join(repoRoot, voicesLedgerPath(dialogue))) ? readVoiceIndex(dialogue).records : [];
  return whoSpeaks(dialogue, source, turns, voices, sceneLevel);
}

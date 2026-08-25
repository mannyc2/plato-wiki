import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  buildVoiceJoin,
  formatVoiceJoinToon,
  parseVoiceJoinToon,
  voiceJoinPath,
} from "../derived/voice-joins.js";
import { isVoiceCutoverActive, voiceCutoverRegistryPath } from "../derived/voice-cutovers.js";
import { parseTurnIndexToon, type TurnIndex, turnIndexPath } from "../derived/turns.js";
import { getRepoRoot } from "../paths.js";
import { stephanusMarkers } from "../source.js";
import { claimYamlBlocks } from "./claim-ledger.js";
import {
  dialogueFromVoiceId,
  EXCHANGE_CLOSE_KINDS,
  EXCHANGE_OPEN_KINDS,
  parseVoiceRecord,
  readVoiceSiglaRegistry,
  type VoiceRecord,
  UNLABELLED_TURN_SPEAKER,
  VOICE_EVIDENCE_KINDS,
  VOICE_EVIDENCE_ROLES,
  VOICE_FRAME_EVIDENCE_KINDS,
  VOICE_REVIEWED_ATTRIBUTION_KINDS,
  voiceMarkdownBlocks,
  voiceSiglaRegistryPath,
} from "./voices-ledger.js";

/**
 * How far before a span an introducing formula may sit. The formula that opens a
 * reported speech is sometimes printed inside the span and sometimes in the
 * narration immediately before it. A formula thousands of characters away is not
 * introducing anything; the bound is mechanical so no record can be justified by
 * distant context.
 */
export const VOICE_EVIDENCE_LOOKBACK_MAX = 600;

/**
 * How far after a span its closing formula may sit. A closing formula follows the
 * discourse it closes by definition ("{q} οὐκ ἂν φθάνοις λέγων, {/q} φάναι τὸν
 * Ἀριστοφάνη"), so it is the one non-flanking kind allowed to sit after its span.
 */
export const VOICE_EVIDENCE_LOOKAHEAD_MAX = 200;

export const VOICE_LIMITS_MAX = 600;
export const VOICE_UNRESOLVED_REASON_MAX = 400;

export type VoicesLedgerValidationIssue = {
  code:
    | "missing_field"
    | "unknown_field"
    | "id_format"
    | "id_duplicate"
    | "source_work_mismatch"
    | "source_path_mismatch"
    | "source_missing"
    | "source_sha256_mismatch"
    | "turn_index_missing"
    | "turn_sha256_mismatch"
    | "span_sha256_mismatch"
    | "char_span_invalid"
    | "char_span_out_of_bounds"
    | "stephanus_span_mismatch"
    | "turn_unknown"
    | "span_not_in_turn"
    | "chain_empty"
    | "chain_siglum_unknown"
    | "chain_repeats_siglum"
    | "chain_repeat_unlicensed"
    | "depth_mismatch"
    | "resolution_invalid"
    | "evidence_kind_invalid"
    | "evidence_role_invalid"
    | "evidence_required"
    | "evidence_forbidden"
    | "evidence_offsets_invalid"
    | "evidence_text_mismatch"
    | "evidence_out_of_range"
    | "evidence_cue_not_in_span"
    | "evidence_cue_missing"
    | "evidence_anchor_side"
    | "evidence_anchor_kind"
    | "evidence_unsafe_text"
    | "evidence_antecedent_missing"
    | "evidence_antecedent_mismatch"
    | "evidence_antecedent_order"
    | "evidence_not_flanked"
    | "authority_shape_conflict"
    | "reviewed_attribution_forbidden"
    | "reviewed_attribution_kind_invalid"
    | "reviewed_attribution_rationale_missing"
    | "reviewed_attribution_rationale_too_long"
    | "reviewed_attribution_context_invalid"
    | "reviewed_attribution_context_out_of_bounds"
    | "reviewed_attribution_context_sha256_mismatch"
    | "reviewed_attribution_context_excludes_span"
    | "reviewed_attribution_context_outside_turn"
    | "candidate_owners_missing"
    | "candidate_owners_missing_terminal"
    | "candidate_owners_unexpected"
    | "candidate_owners_too_few"
    | "candidate_owners_duplicate"
    | "candidate_owner_unknown"
    | "unresolved_reason_missing"
    | "unresolved_reason_unexpected"
    | "unresolved_reason_too_long"
    | "limits_too_long"
    | "overlap_same_depth"
    | "ambiguous_intersection"
    | "nesting_missing_parent"
    | "chain_prefix_mismatch"
    | "coverage_gap"
    | "frame_evidence_missing"
    | "frame_evidence_unexpected"
    | "voice_count_mismatch"
    | "orphan_ledger_field"
    | "review_status_invalid";
  message: string;
  fix: string;
  voiceId?: string;
  line?: number;
};

const REVIEW_STATUSES = new Set(["unreviewed", "accepted", "rejected", "needs_split"]);
const RESOLUTIONS = new Set(["resolved", "unresolved"]);
const TOP_LEVEL_FIELD_RE = /^([a-z_]+):\s*(.*)$/u;
const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  "voice_id",
  "source_work",
  "outer_turn_id",
  "stephanus_span",
  "char_span",
  "source_path",
  "source_sha256",
  "span_sha256",
  "voice_chain",
  "depth",
  "resolution",
  "evidence_refs",
  "reviewed_attribution",
  "candidate_owners",
  "unresolved_reason",
  "limits",
  "review_status",
]);
const REQUIRED_TOP_LEVEL_FIELDS = [
  "voice_id",
  "source_work",
  "outer_turn_id",
  "stephanus_span",
  "char_span",
  "source_path",
  "source_sha256",
  "span_sha256",
  "voice_chain",
  "depth",
  "resolution",
  "review_status",
] as const;

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function workNameToSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/gu, "-");
}

function markerSpanForRange(markers: Array<{ marker: string; index: number }>, start: number, end: number) {
  let startMarker = markers[0]?.marker ?? "";
  let endMarker = startMarker;
  for (const marker of markers) {
    if (marker.index <= start) startMarker = marker.marker;
    if (marker.index < end) endMarker = marker.marker;
    else break;
  }
  return startMarker === endMarker ? startMarker : `${startMarker}-${endMarker}`;
}

export function validateVoicesLedger(path: string, content: string): VoicesLedgerValidationIssue[] {
  const issues: VoicesLedgerValidationIssue[] = [];
  const slug = /^wiki\/voices\/(.+)\.md$/u.exec(path)?.[1];
  const repoRoot = getRepoRoot();
  // Every yaml block in the ledger is a voice record. Indexes stay compact for
  // diagnostics and fallback labels; durable voice IDs are independent of file
  // position and may contain gaps.
  const allBlocks = voiceMarkdownBlocks(content);
  const blocks = allBlocks.map((block, index) => ({ ...block, index }));

  const idLineCount = [...content.matchAll(/^voice_id:\s*/gmu)].length;
  if (idLineCount !== blocks.length) {
    issues.push({
      code: "voice_count_mismatch",
      message: `Ledger has ${idLineCount} voice_id line(s) but ${blocks.length} yaml block(s).`,
      fix: "Give every voice record exactly one ```yaml fence and one voice_id line.",
    });
  }
  const blockRanges = allBlocks.map((block) => {
    const start = content.indexOf(block.fullMatch);
    return { start, end: start + block.fullMatch.length };
  });
  for (const match of content.matchAll(/^(voice_chain|char_span|evidence_refs|review_status):/gmu)) {
    const index = match.index ?? 0;
    if (!blockRanges.some((range) => range.start <= index && index < range.end)) {
      issues.push({
        code: "orphan_ledger_field",
        message: `Ledger field "${match[1]}" appears outside a yaml fence at line ${content.slice(0, index).split("\n").length}.`,
        fix: "Move the field inside its record's ```yaml fence.",
      });
    }
  }

  const siglaRegistry = readVoiceSiglaRegistry();
  const allowedSigla = slug ? (siglaRegistry.get(slug) ?? new Set<string>()) : new Set<string>();

  const sourcePath = slug ? `raw/plato/greek/${slug}.txt` : "";
  const sourceAbsolute = join(repoRoot, sourcePath);
  const sourceText = slug && existsSync(sourceAbsolute) ? readFileSync(sourceAbsolute, "utf8") : undefined;
  const sourceSha = sourceText === undefined ? undefined : sha256(sourceText);
  const markers = sourceText === undefined ? [] : stephanusMarkers(sourceText);

  if (slug && sourceText === undefined) {
    issues.push({
      code: "source_missing",
      message: `Greek source ${sourcePath} does not exist.`,
      fix: "Add the source file or remove the voice ledger for this dialogue.",
    });
  }

  let turnIndex: TurnIndex | undefined;
  if (slug) {
    const turnPath = join(repoRoot, turnIndexPath(slug));
    if (!existsSync(turnPath)) {
      issues.push({
        code: "turn_index_missing",
        message: `Turn index ${turnIndexPath(slug)} does not exist.`,
        fix: `Run \`bun run harness derive turns ${slug}\` before validating voices.`,
      });
    } else {
      turnIndex = parseTurnIndexToon(readFileSync(turnPath, "utf8"));
      if (sourceSha !== undefined && turnIndex.sourceSha256 !== sourceSha) {
        issues.push({
          code: "turn_sha256_mismatch",
          message: `Turn index source_sha256 ${turnIndex.sourceSha256} does not match ${sourcePath}.`,
          fix: `Regenerate with \`bun run harness derive turns ${slug}\`.`,
        });
      }
    }
  }

  const records: Array<{ record: VoiceRecord; line: number }> = [];
  const seenIds = new Set<string>();

  for (const block of blocks) {
    const voiceId = block.voiceId ?? `voice_${String(block.index + 1).padStart(4, "0")}`;
    const push = (issue: Omit<VoicesLedgerValidationIssue, "voiceId">) => issues.push({ ...issue, voiceId });
    const record = parseVoiceRecord(block.content);

    for (const line of block.content.split("\n")) {
      const match = TOP_LEVEL_FIELD_RE.exec(line);
      if (match && !ALLOWED_TOP_LEVEL_FIELDS.has(match[1]!)) {
        push({
          code: "unknown_field",
          message: `Unknown top-level field "${match[1]}".`,
          fix: `Remove it. Allowed fields: ${[...ALLOWED_TOP_LEVEL_FIELDS].sort().join(", ")}.`,
          line: block.startLine,
        });
      }
    }
    for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
      if (!new RegExp(`^${field}:`, "mu").test(block.content)) {
        push({
          code: "missing_field",
          message: `Missing required field "${field}".`,
          fix: `Add "${field}" to the record.`,
          line: block.startLine,
        });
      }
    }

    if (!/^voice_[a-z0-9-]+_\d{4}$/u.test(record.voiceId)) {
      push({
        code: "id_format",
        message: `voice_id "${record.voiceId}" is malformed.`,
        fix: "Use voice_<dialogue>_NNNN with a four-digit stable identifier.",
        line: block.startLine,
      });
    } else if (slug && dialogueFromVoiceId(record.voiceId) !== slug) {
      push({
        code: "id_format",
        message: `voice_id "${record.voiceId}" does not match ledger dialogue "${slug}".`,
        fix: `Rename it to voice_${slug}_NNNN.`,
        line: block.startLine,
      });
    }
    if (seenIds.has(record.voiceId)) {
      push({
        code: "id_duplicate",
        message: `Duplicate voice_id "${record.voiceId}".`,
        fix: "Give every voice record a unique id.",
        line: block.startLine,
      });
    }
    seenIds.add(record.voiceId);

    if (slug && workNameToSlug(record.sourceWork) !== slug) {
      push({
        code: "source_work_mismatch",
        message: `source_work "${record.sourceWork}" does not match ledger dialogue "${slug}".`,
        fix: `Set source_work to the work whose slug is "${slug}".`,
        line: block.startLine,
      });
    }
    if (slug && record.sourcePath !== sourcePath) {
      push({
        code: "source_path_mismatch",
        message: `source_path "${record.sourcePath}" is not ${sourcePath}.`,
        fix: `Set source_path to ${sourcePath}.`,
        line: block.startLine,
      });
    }
    if (sourceSha !== undefined && record.sourceSha256 !== sourceSha) {
      push({
        code: "source_sha256_mismatch",
        message: `source_sha256 ${record.sourceSha256 || "(missing)"} does not match ${sourcePath}.`,
        fix: `Set source_sha256 to ${sourceSha}.`,
        line: block.startLine,
      });
    }

    const rangeWellFormed =
      Number.isInteger(record.startChar) && Number.isInteger(record.endChar) && record.startChar < record.endChar;
    if (!rangeWellFormed) {
      push({
        code: "char_span_invalid",
        message: `char_span [${record.startChar}, ${record.endChar}) is not a well-formed non-empty integer range.`,
        fix: "Set char_span.start_char and char_span.end_char to integers with start < end.",
        line: block.startLine,
      });
    } else if (sourceText !== undefined && (record.startChar < 0 || record.endChar > sourceText.length)) {
      push({
        code: "char_span_out_of_bounds",
        message: `char_span [${record.startChar}, ${record.endChar}) falls outside ${sourcePath} (length ${sourceText.length}).`,
        fix: "Recompute the offsets against the current source file.",
        line: block.startLine,
      });
    } else if (sourceText !== undefined) {
      const slice = sourceText.slice(record.startChar, record.endChar);
      if (record.spanSha256 !== sha256(slice)) {
        push({
          code: "span_sha256_mismatch",
          message: `span_sha256 ${record.spanSha256 || "(missing)"} does not hash the bytes at [${record.startChar}, ${record.endChar}).`,
          fix: `Set span_sha256 to ${sha256(slice)}.`,
          line: block.startLine,
        });
      }
      const expectedSpan = markerSpanForRange(markers, record.startChar, record.endChar);
      if (record.stephanusSpan !== expectedSpan) {
        push({
          code: "stephanus_span_mismatch",
          message: `stephanus_span "${record.stephanusSpan}" does not describe [${record.startChar}, ${record.endChar}); expected "${expectedSpan}".`,
          fix: `Set stephanus_span to ${expectedSpan}.`,
          line: block.startLine,
        });
      }
    }

    const turn = turnIndex?.turns.find((candidate) => candidate.turnId === record.outerTurnId);
    if (turnIndex && !turn) {
      push({
        code: "turn_unknown",
        message: `outer_turn_id "${record.outerTurnId}" is not a turn of ${slug}.`,
        fix: "Reference a turn id from the derived turn index.",
        line: block.startLine,
      });
    } else if (turn && rangeWellFormed && (record.startChar < turn.startChar || record.endChar > turn.endChar)) {
      push({
        code: "span_not_in_turn",
        message: `char_span [${record.startChar}, ${record.endChar}) is not contained in ${turn.turnId} [${turn.startChar}, ${turn.endChar}).`,
        fix: "Every voice span must nest inside its outer turn's span.",
        line: block.startLine,
      });
    }
    // The outermost chain element is the printed turn speaker — EXCEPT on a turn
    // the source prints no siglum for, where there is no printed speaker to
    // match and `(none)` is metadata rather than a person. There the chain must
    // start with the turn's actual owner, which `chain_siglum_unknown` still
    // requires to be registered and which the frame record must license by
    // byte-cited anchors (see `validateUnlabelledFrame`).
    const unlabelledTurn = turn !== undefined && turn.speaker === UNLABELLED_TURN_SPEAKER;
    if (
      turn &&
      !unlabelledTurn &&
      record.voiceChain[0] !== undefined &&
      record.voiceChain[0] !== turn.speaker
    ) {
      push({
        code: "chain_prefix_mismatch",
        message: `voice_chain starts with "${record.voiceChain[0]}" but ${turn.turnId} is spoken by "${turn.speaker}".`,
        fix: "The outermost chain element must be the printed turn speaker.",
        line: block.startLine,
      });
    }
    if (unlabelledTurn && record.voiceChain[0] === UNLABELLED_TURN_SPEAKER) {
      push({
        code: "chain_prefix_mismatch",
        message: `voice_chain starts with "${UNLABELLED_TURN_SPEAKER}", which is turn-layer metadata rather than an owner.`,
        fix: `Start the chain with the turn's actual owner and license it with an ${[...VOICE_FRAME_EVIDENCE_KINDS].join("/")} anchor.`,
        line: block.startLine,
      });
    }
    issues.push(...validateUnlabelledFrame(record, unlabelledTurn, block.startLine));

    if (record.voiceChain.length === 0) {
      push({
        code: "chain_empty",
        message: "voice_chain is empty.",
        fix: "Record the narration path from the printed turn speaker inward.",
        line: block.startLine,
      });
    }
    for (const siglum of record.voiceChain) {
      if (!allowedSigla.has(siglum)) {
        push({
          code: "chain_siglum_unknown",
          message: `voice_chain siglum "${siglum}" is not registered for ${slug}.`,
          fix: `Add it to ${voiceSiglaRegistryPath()} in a reviewed commit, or correct the chain.`,
          line: block.startLine,
        });
      }
    }
    issues.push(...validateChainRepeats(record, voiceId, block.startLine));

    // `depth` is the nesting level; `voice_chain` is the licensed narration path.
    // They coincide on a resolved record. On an unresolved record the chain is
    // one shorter, because the innermost hop is precisely what no formula
    // licenses — the span is a level deeper than anything we can name.
    const expectedDepth = record.resolution === "unresolved" ? record.voiceChain.length + 1 : record.voiceChain.length;
    if (RESOLUTIONS.has(record.resolution) && record.depth !== expectedDepth) {
      push({
        code: "depth_mismatch",
        message: `depth ${record.depth} does not equal ${expectedDepth} for a ${record.resolution} record with a ${record.voiceChain.length}-hop chain.`,
        fix:
          record.resolution === "unresolved"
            ? "An unresolved span nests one level below its licensed chain; set depth to chain length + 1."
            : "Set depth to the number of chain elements.",
        line: block.startLine,
      });
    }

    if (!RESOLUTIONS.has(record.resolution)) {
      push({
        code: "resolution_invalid",
        message: `resolution "${record.resolution}" is not one of resolved, unresolved.`,
        fix: "Use resolved when text-internal evidence licenses the innermost owner, unresolved otherwise.",
        line: block.startLine,
      });
    }

    issues.push(...validateEvidenceRefs(record, sourceText, rangeWellFormed, block.startLine));

    issues.push(
      ...validateReviewedAttribution(record, sourceText, turnIndex, rangeWellFormed, block.startLine, slug),
    );

    // Exactly one authority shape per resolved record: byte-checkable explicit
    // evidence, or a reviewed structural adjudication. Both would let a weak
    // adjudication borrow the standing of a formula that licenses something
    // else; neither is an owner asserted from nowhere.
    if (record.resolution === "resolved" && record.evidenceRefs.length === 0 && !record.reviewedAttribution) {
      push({
        code: "evidence_required",
        message: "A resolved voice record carries neither evidence_refs nor reviewed_attribution.",
        fix: "Cite explicit evidence, record a reviewed discourse resolution, or mark the span unresolved.",
        line: block.startLine,
      });
    }
    if (record.resolution === "resolved" && record.evidenceRefs.length > 0 && record.reviewedAttribution) {
      push({
        code: "authority_shape_conflict",
        message: "A resolved voice record carries both evidence_refs and reviewed_attribution.",
        fix: "Keep the explicit evidence and drop reviewed_attribution; explicit text outranks adjudication.",
        line: block.startLine,
      });
    }
    if (record.resolution === "unresolved" && record.reviewedAttribution) {
      push({
        code: "reviewed_attribution_forbidden",
        message: "An unresolved voice record carries a reviewed_attribution.",
        fix: "A reviewed adjudication selects an owner; mark the record resolved or drop the block.",
        line: block.startLine,
      });
    }
    if (record.resolution === "resolved" && record.unresolvedReason.length > 0) {
      push({
        code: "unresolved_reason_unexpected",
        message: "A resolved voice record carries an unresolved_reason.",
        fix: "Clear unresolved_reason on resolved records.",
        line: block.startLine,
      });
    }
    if (record.resolution === "unresolved") {
      if (record.evidenceRefs.length > 0) {
        push({
          code: "evidence_forbidden",
          message: "An unresolved voice record cites evidence.",
          fix: "If evidence licenses the span, mark it resolved; otherwise drop the evidence_refs.",
          line: block.startLine,
        });
      }
      if (record.unresolvedReason.trim().length === 0) {
        push({
          code: "unresolved_reason_missing",
          message: "An unresolved voice record has no unresolved_reason.",
          fix: "State mechanically why no text-internal evidence licenses a terminal owner for this span.",
          line: block.startLine,
        });
      }
      if (record.unresolvedReason.length > VOICE_UNRESOLVED_REASON_MAX) {
        push({
          code: "unresolved_reason_too_long",
          message: `unresolved_reason is ${record.unresolvedReason.length} characters; the maximum is ${VOICE_UNRESOLVED_REASON_MAX}.`,
          fix: "State the missing licensing evidence in one or two sentences.",
          line: block.startLine,
        });
      }
      // A source-bound reason is the required record of genuine ambiguity.
      // Candidate owners are optional supporting evidence; when supplied they
      // are still held to the normal uniqueness and registry contract.
      issues.push(...validateCandidateOwners(record.candidateOwners, slug, block.startLine, "candidate_owners"));
    }
    if (record.resolution === "resolved" && !record.reviewedAttribution && record.candidateOwners.length > 0) {
      push({
        code: "candidate_owners_unexpected",
        message: "An explicitly evidenced record carries top-level candidate_owners.",
        fix: "Candidates belong to reviewed_attribution or to an unresolved record; drop the field.",
        line: block.startLine,
      });
    }

    if (record.limits !== undefined && record.limits.length > VOICE_LIMITS_MAX) {
      push({
        code: "limits_too_long",
        message: `limits is ${record.limits.length} characters; the maximum is ${VOICE_LIMITS_MAX}.`,
        fix: "Shorten limits to a couple of sentences.",
        line: block.startLine,
      });
    }
    if (!REVIEW_STATUSES.has(record.reviewStatus)) {
      push({
        code: "review_status_invalid",
        message: `review_status "${record.reviewStatus}" is not allowed.`,
        fix: `Use one of ${[...REVIEW_STATUSES].sort().join(", ")}.`,
        line: block.startLine,
      });
    }

    records.push({ record, line: block.startLine });
  }

  issues.push(...validateVoiceGeometry(records, turnIndex));
  return issues;
}

/** Per-evidence-ref checks: bytes, offsets, position relative to the span, antecedents. */
/**
 * A candidate list is the locally plausible set, so it has to be a real set:
 * unique, registered, and — for genuine ambiguity — at least two wide. A
 * one-element "ambiguity" is a resolved decision that declined to say so.
 */
/**
 * The frame authority for a turn the source prints no siglum for.
 *
 * Two rules, and both directions matter:
 *
 * 1. A depth-1 record over an unlabelled turn MUST carry at least one
 *    `unlabelled_turn_frame` anchor. Without this the owner of the whole work
 *    would be asserted from nowhere — which is precisely the defect this lane
 *    exists to remove, readmitted at the top of the chain where it would
 *    silently own every claim beneath it.
 * 2. An `unlabelled_turn_frame` anchor may appear NOWHERE ELSE. It is not a
 *    general-purpose licence: it says "this turn prints no speaker and these
 *    bytes identify who is speaking it", which is meaningless on a nested span
 *    whose parent already names an owner, and which would otherwise become a
 *    way to license a deep attribution with no reporting formula at all.
 */
function validateUnlabelledFrame(
  record: VoiceRecord,
  unlabelledTurn: boolean,
  line: number,
): VoicesLedgerValidationIssue[] {
  const issues: VoicesLedgerValidationIssue[] = [];
  const push = (issue: Omit<VoicesLedgerValidationIssue, "voiceId">) =>
    issues.push({ ...issue, voiceId: record.voiceId });
  const frameRefs = record.evidenceRefs.filter((ref) => VOICE_FRAME_EVIDENCE_KINDS.has(ref.kind));

  if (unlabelledTurn && record.depth === 1 && frameRefs.length === 0) {
    push({
      code: "frame_evidence_missing",
      message: `${record.outerTurnId} prints no speaker, so its depth-1 frame record must cite an ${[...VOICE_FRAME_EVIDENCE_KINDS].join("/")} anchor.`,
      fix: "Cite the Greek that identifies who speaks this turn — the narrator's own first-person opening, or a vocative addressing them inside it.",
      line,
    });
  }
  if (frameRefs.length > 0 && !(unlabelledTurn && record.depth === 1)) {
    push({
      code: "frame_evidence_unexpected",
      message: `An ${[...VOICE_FRAME_EVIDENCE_KINDS].join("/")} anchor sits on a depth-${record.depth} record over ${record.outerTurnId}.`,
      fix: "This kind is valid only on the depth-1 frame of a turn the source prints no siglum for. Cite a reporting formula instead.",
      line,
    });
  }
  return issues;
}

function validateCandidateOwners(
  owners: string[],
  dialogue: string | undefined,
  line: number,
  where: string,
): VoicesLedgerValidationIssue[] {
  if (owners.length === 0) return [];
  const issues: VoicesLedgerValidationIssue[] = [];
  const registered = dialogue ? readVoiceSiglaRegistry().get(dialogue) : undefined;

  if (owners.length < 2) {
    issues.push({
      code: "candidate_owners_too_few",
      message: `${where} lists ${owners.length} owner; a candidate set needs at least two.`,
      fix: "List every locally plausible owner, or resolve the record to the single candidate.",
      line,
    });
  }
  if (new Set(owners).size !== owners.length) {
    issues.push({
      code: "candidate_owners_duplicate",
      message: `${where} repeats an owner.`,
      fix: "List each candidate once.",
      line,
    });
  }
  for (const owner of owners) {
    if (registered && !registered.has(owner)) {
      issues.push({
        code: "candidate_owner_unknown",
        message: `${where} lists "${owner}", which is not registered for ${dialogue} in ${voiceSiglaRegistryPath()}.`,
        fix: `Register the speaker in ${voiceSiglaRegistryPath()}, or correct the candidate.`,
        line,
      });
    }
  }
  return issues;
}

/**
 * The reviewed-discourse shape (the Phaedo discourse attribution review).
 *
 * Everything checkable is checked: the kind is closed, the candidates are a real
 * registered set containing the owner actually chosen, the context is bytes that
 * still hash to what the reviewer read, and it sits inside the same outer turn
 * around the span it explains. What the validator cannot check is whether the
 * adjudication is *right* — that is what the accepted review status is for, the
 * same way it works for observations and claims.
 */
function validateReviewedAttribution(
  record: VoiceRecord,
  sourceText: string | undefined,
  turnIndex: TurnIndex | undefined,
  rangeWellFormed: boolean,
  line: number,
  dialogue: string | undefined,
): VoicesLedgerValidationIssue[] {
  const attribution = record.reviewedAttribution;
  if (!attribution) return [];
  const issues: VoicesLedgerValidationIssue[] = [];
  const push = (issue: Omit<VoicesLedgerValidationIssue, "voiceId">) =>
    issues.push({ ...issue, voiceId: record.voiceId });

  if (!VOICE_REVIEWED_ATTRIBUTION_KINDS.has(attribution.kind)) {
    push({
      code: "reviewed_attribution_kind_invalid",
      message: `reviewed_attribution.kind "${attribution.kind}" is not allowed.`,
      fix: `Use one of ${[...VOICE_REVIEWED_ATTRIBUTION_KINDS].sort().join(", ")}.`,
      line,
    });
  }

  issues.push(
    ...validateCandidateOwners(
      attribution.candidateOwners,
      dialogue,
      line,
      "reviewed_attribution.candidate_owners",
    ),
  );
  if (attribution.candidateOwners.length === 0) {
    push({
      code: "candidate_owners_missing",
      message: "reviewed_attribution lists no candidate_owners.",
      fix: "List the locally plausible owners the review chose between.",
      line,
    });
  }

  // The chosen owner has to be one of the options. Otherwise the candidate list
  // documents a deliberation that did not produce this record's answer.
  const terminal = record.voiceChain.at(-1);
  if (terminal && attribution.candidateOwners.length > 0 && !attribution.candidateOwners.includes(terminal)) {
    push({
      code: "candidate_owners_missing_terminal",
      message: `voice_chain resolves to "${terminal}", which is absent from reviewed_attribution.candidate_owners.`,
      fix: "Add the resolved owner to the candidate set, or correct the chain.",
      line,
    });
  }

  if (attribution.rationale.trim().length === 0) {
    push({
      code: "reviewed_attribution_rationale_missing",
      message: "reviewed_attribution has no rationale.",
      fix: "Name the structural grounds: named handoff, addressee, grammatical person, response adjacency, or exchange bounds.",
      line,
    });
  }
  if (attribution.rationale.length > VOICE_LIMITS_MAX) {
    push({
      code: "reviewed_attribution_rationale_too_long",
      message: `reviewed_attribution.rationale is ${attribution.rationale.length} characters; the maximum is ${VOICE_LIMITS_MAX}.`,
      fix: "State the structural grounds in one or two sentences.",
      line,
    });
  }

  const { contextStartChar: start, contextEndChar: end } = attribution;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start >= end) {
    push({
      code: "reviewed_attribution_context_invalid",
      message: `reviewed_attribution.context_span [${start}, ${end}) is not a well-formed range.`,
      fix: "Use integer start_char < end_char.",
      line,
    });
    return issues;
  }

  if (sourceText !== undefined) {
    if (end > sourceText.length) {
      push({
        code: "reviewed_attribution_context_out_of_bounds",
        message: `reviewed_attribution.context_span ends at ${end}, past the ${sourceText.length}-character source.`,
        fix: "Correct the context offsets against the current source.",
        line,
      });
      return issues;
    }
    if (sha256(sourceText.slice(start, end)) !== attribution.contextSha256) {
      push({
        code: "reviewed_attribution_context_sha256_mismatch",
        message: "reviewed_attribution.context_span text_sha256 does not match the bytes it cites.",
        fix: "Recompute the hash; if the source moved, re-review the adjudication rather than rehashing it.",
        line,
      });
    }
  }

  // The context must actually contain what it explains, inside one outer turn.
  // A context that merely sits nearby, or that reaches into another printed
  // turn, is not the bounded local exchange the rationale claims to read.
  if (rangeWellFormed && (start > record.startChar || record.endChar > end)) {
    push({
      code: "reviewed_attribution_context_excludes_span",
      message: `reviewed_attribution.context_span [${start}, ${end}) does not contain the record's span [${record.startChar}, ${record.endChar}).`,
      fix: "Widen the context to enclose the span it resolves.",
      line,
    });
  }
  const turn = turnIndex?.turns.find((entry) => entry.turnId === record.outerTurnId);
  if (turn && (start < turn.startChar || end > turn.endChar)) {
    push({
      code: "reviewed_attribution_context_outside_turn",
      message: `reviewed_attribution.context_span [${start}, ${end}) leaves outer turn ${record.outerTurnId} [${turn.startChar}, ${turn.endChar}).`,
      fix: "Bound the context by the outer turn; a handoff across printed turns is not this record's evidence.",
      line,
    });
  }

  return issues;
}

function validateEvidenceRefs(
  record: VoiceRecord,
  sourceText: string | undefined,
  rangeWellFormed: boolean,
  line: number,
): VoicesLedgerValidationIssue[] {
  const issues: VoicesLedgerValidationIssue[] = [];
  const push = (issue: Omit<VoicesLedgerValidationIssue, "voiceId">) =>
    issues.push({ ...issue, voiceId: record.voiceId });

  let flankingBefore = 0;
  let flankingAfter = 0;

  for (const ref of record.evidenceRefs) {
    if (!VOICE_EVIDENCE_KINDS.has(ref.kind)) {
      push({
        code: "evidence_kind_invalid",
        message: `evidence_refs kind "${ref.kind}" is not an allowed kind.`,
        fix: `Use one of ${[...VOICE_EVIDENCE_KINDS].sort().join(", ")}. Doctrine, style, and translation are never evidence.`,
        line,
      });
      continue;
    }
    if (/[|\n]/u.test(ref.text)) {
      push({
        code: "evidence_unsafe_text",
        message: "evidence_refs text contains a newline or a pipe.",
        fix: "Quote a single-line formula; pipes and newlines corrupt the derived table.",
        line,
      });
    }
    if (!Number.isInteger(ref.startChar) || !Number.isInteger(ref.endChar) || ref.startChar >= ref.endChar) {
      push({
        code: "evidence_offsets_invalid",
        message: `evidence offsets [${ref.startChar}, ${ref.endChar}) are not a well-formed non-empty integer range.`,
        fix: "Set start_char and end_char to integers with start < end.",
        line,
      });
      continue;
    }
    if (sourceText === undefined) continue;
    if (ref.startChar < 0 || ref.endChar > sourceText.length) {
      push({
        code: "evidence_offsets_invalid",
        message: `evidence offsets [${ref.startChar}, ${ref.endChar}) fall outside the source.`,
        fix: "Recompute the offsets against the current source file.",
        line,
      });
      continue;
    }
    if (sourceText.slice(ref.startChar, ref.endChar) !== ref.text) {
      push({
        code: "evidence_text_mismatch",
        message: `evidence text does not match the source bytes at [${ref.startChar}, ${ref.endChar}).`,
        fix: `The bytes there are ${JSON.stringify(sourceText.slice(ref.startChar, ref.endChar).slice(0, 60))}. Fix the quote or the offsets.`,
        line,
      });
    }

    if (ref.kind === "anaphoric_reporting_formula") {
      if (
        ref.antecedentText === undefined ||
        !Number.isInteger(ref.antecedentStartChar) ||
        !Number.isInteger(ref.antecedentEndChar)
      ) {
        push({
          code: "evidence_antecedent_missing",
          message: "An anaphoric reporting formula does not cite its antecedent.",
          fix: "Add antecedent_text, antecedent_start_char and antecedent_end_char.",
          line,
        });
      } else if (
        sourceText.slice(ref.antecedentStartChar!, ref.antecedentEndChar!) !== ref.antecedentText
      ) {
        push({
          code: "evidence_antecedent_mismatch",
          message: `antecedent_text does not match the source bytes at [${ref.antecedentStartChar}, ${ref.antecedentEndChar}).`,
          fix: "Fix the antecedent quote or its offsets.",
          line,
        });
      } else if (ref.antecedentEndChar! > ref.startChar) {
        push({
          code: "evidence_antecedent_order",
          message: `antecedent at [${ref.antecedentStartChar}, ${ref.antecedentEndChar}) does not precede the formula at ${ref.startChar}.`,
          fix: "A pronoun's antecedent must be introduced before the formula that uses it.",
          line,
        });
      }
    }

    if (!VOICE_EVIDENCE_ROLES.has(ref.role)) {
      push({
        code: "evidence_role_invalid",
        message: `evidence_refs role "${ref.role}" is not an allowed role.`,
        fix: `Use one of ${[...VOICE_EVIDENCE_ROLES].sort().join(", ")}.`,
        line,
      });
      continue;
    }

    if (!rangeWellFormed) continue;

    const withinSpan = ref.startChar >= record.startChar && ref.endChar <= record.endChar;
    const before = ref.endChar <= record.startChar;
    const after = ref.startChar >= record.endChar;

    // Exchange anchors bound the conversation the span sits in, so they are
    // checked for SIDE and KIND, not for proximity.
    if (ref.role === "exchange_open") {
      if (!before) {
        push({
          code: "evidence_anchor_side",
          message: `exchange_open anchor at [${ref.startChar}, ${ref.endChar}) does not precede the span [${record.startChar}, ${record.endChar}).`,
          fix: "The formula that opens a bounded exchange must be printed before every span inside it.",
          line,
        });
      } else {
        flankingBefore += 1;
      }
      if (!EXCHANGE_OPEN_KINDS.has(ref.kind)) {
        push({
          code: "evidence_anchor_kind",
          message: `exchange_open anchor has kind "${ref.kind}", which does not name a speaker at the opening of an exchange.`,
          fix: `Use one of ${[...EXCHANGE_OPEN_KINDS].sort().join(", ")}.`,
          line,
        });
      }
      continue;
    }
    if (ref.role === "exchange_close") {
      if (!after) {
        push({
          code: "evidence_anchor_side",
          message: `exchange_close anchor at [${ref.startChar}, ${ref.endChar}) does not follow the span [${record.startChar}, ${record.endChar}).`,
          fix: "The formula that closes a bounded exchange must be printed after every span inside it.",
          line,
        });
      } else {
        flankingAfter += 1;
      }
      if (!EXCHANGE_CLOSE_KINDS.has(ref.kind)) {
        push({
          code: "evidence_anchor_kind",
          message: `exchange_close anchor has kind "${ref.kind}", which does not name a speaker at the close of an exchange.`,
          fix: `Use one of ${[...EXCHANGE_CLOSE_KINDS].sort().join(", ")}.`,
          line,
        });
      }
      continue;
    }

    // From here on the ref is a `cue`: evidence about THIS span's own owner.
    if (ref.kind === "anchored_dialogue_turn") {
      // The whole licence for an anchored dialogue turn is a grammatical cue
      // printed inside the utterance. A cue outside the span is evidence about
      // some other utterance.
      if (!withinSpan) {
        push({
          code: "evidence_cue_not_in_span",
          message: `anchored_dialogue_turn cue at [${ref.startChar}, ${ref.endChar}) does not lie inside the span [${record.startChar}, ${record.endChar}).`,
          fix: "An anchored dialogue turn is licensed by a person-marked verb or vocative printed INSIDE the utterance. If the cue belongs to a neighbouring utterance, this span is unresolved.",
          line,
        });
      }
      continue;
    }
    if (ref.kind === "formula_bounded_continuation") {
      if (before) flankingBefore += 1;
      if (after) flankingAfter += 1;
      continue;
    }

    const withinLookback = before && record.startChar - ref.endChar <= VOICE_EVIDENCE_LOOKBACK_MAX;
    const withinLookahead =
      ref.kind === "closing_formula" && after && ref.startChar - record.endChar <= VOICE_EVIDENCE_LOOKAHEAD_MAX;
    // A parenthetical introducing formula can begin in the enclosing
    // narration, name its accusative subject, and finish just after that
    // speaker's first word. That formula genuinely licenses the speech even
    // though its bytes strictly straddle the speech start. This exception is
    // deliberately narrow: only a cue that names the speaker outright, only
    // across the START boundary, and only within the existing lookback bound.
    // It never licenses a formula that crosses the record end or a different
    // evidence kind whose owner still depends on an antecedent or exchange.
    // A role description identifies its speaker as directly as a name does, and
    // the construction is the same one: `ὁ τῶν ἕνδεκα ὑπηρέτης … , ὦ Σώκρατες,
    // ἔφη`. The exception turns on the cue naming the speaker up front, not on
    // whether the source happened to print a proper noun.
    const straddlingNamedIntroduction =
      ref.role === "cue" &&
      (ref.kind === "named_reporting_formula" || ref.kind === "role_reporting_formula") &&
      ref.startChar < record.startChar &&
      record.startChar < ref.endChar &&
      ref.endChar <= record.endChar &&
      record.startChar - ref.startChar <= VOICE_EVIDENCE_LOOKBACK_MAX &&
      ref.endChar - record.startChar <= VOICE_EVIDENCE_LOOKBACK_MAX;
    if (!withinSpan && !withinLookback && !withinLookahead && !straddlingNamedIntroduction) {
      push({
        code: "evidence_out_of_range",
        message: `evidence at [${ref.startChar}, ${ref.endChar}) neither sits inside the span [${record.startChar}, ${record.endChar}) nor within ${VOICE_EVIDENCE_LOOKBACK_MAX} characters before it.`,
        fix:
          after && ref.kind !== "closing_formula"
            ? "A formula printed after its span is either a closing_formula or an exchange_close anchor; set the kind and role accordingly."
            : "Cite the evidence that actually licenses this span.",
        line,
      });
    }
  }

  issues.push(...validateFlankedRecord(record, flankingBefore, flankingAfter, line));
  return issues;
}

/**
 * Geometry rule 4, with the one exception the corpus forced.
 *
 * A narration path normally may not re-enter the same voice. But a narrator who
 * is also a participant in the conversation they narrate reports themselves:
 * Socrates writes `ἦν δ' ἐγώ` inside his own narration 66 times in Euthydemus and
 * 43 times in Protagoras. The reported utterance nests one level below the
 * narration that reports it — the Symposium ledger already places such spans
 * there — and its owner is the narrator, so its chain necessarily ends on a
 * repeat. Banning that outright made the resolved form unwritable, which is why
 * both wave-2 builders resolved zero spans to the narrator.
 *
 * Two conditions keep the exception from becoming a licence to invent chains:
 *
 *   1. Only ADJACENT repeats are permitted. `[ΣΩ., ΣΩ.]` says "the narrator
 *      speaks inside their own narration". `[ΣΩ., ΚΛΕΙΝ., ΣΩ.]` says a voice
 *      re-enters after someone else held the floor, which no reporting formula
 *      licenses — that is two records, not one chain. Stacking (`[ΣΩ., ΣΩ., ΣΩ.]`)
 *      is banned for the same reason.
 *   2. When the repeat is the record's OWN owner — the terminal position of a
 *      resolved chain — the record must carry one of the two authority shapes
 *      aimed at that hop: a person-marked reporting formula printed INSIDE its
 *      span, or a `reviewed_attribution`. With neither, the utterance is
 *      unresolved, not the narrator's by default.
 *
 * The `reviewed_attribution` half is the operator's 2026-07-30 ruling on the two
 * sealed Symposium disagreement packets. As written, the two rules composed into
 * an impossible state: `authority_shape_conflict` forbids a resolved record from
 * carrying both shapes, so the adjudication path could never supply the in-span
 * cue this licence demanded, and a narrator's own bare reply inside their own
 * narration was unresolvable however conclusive the local Greek. That is a
 * defect in the contract, not a finding about the text — the eleven Socrates
 * replies inside the Diotima report and Alcibiades' `οἶσθα οὖν ἅ μοι δέδοκται;`
 * each sit adjacent to an `ἔφη`/`ἦ δ’ ἥ`/`ἦ δ’ ὅς`-marked turn that identifies
 * the party they are not. `reviewed_attribution` already exists for exactly this
 * work: structural resolution from grammatical person, response adjacency,
 * addressee, and the bounds of a hashed context.
 *
 * What did NOT change: the explicit-evidence path. Without a
 * `reviewed_attribution`, a repeated terminal still requires the in-span
 * `person_marked_reporting_formula`. A first-person PRONOUN is not that formula —
 * `μοι` and `ὡμολόγηκα` belong in the adjudication's hashed context and
 * rationale, never in `evidence_refs` as a reporting formula. Grammatical person
 * remains what separates the narrator speaking from the narrator reporting; the
 * ruling adds a reviewed route to that conclusion, it does not lower the bar on
 * the evidence route.
 *
 * A repeat deeper in the prefix needs no cue here: it was licensed by the
 * ancestor record that terminates on it, and prefix consistency plus nesting
 * already require that record to exist. An `unresolved` record carries neither
 * shape — `reviewed_attribution_forbidden` sees to that — so its chain is the
 * licensed prefix and the same reasoning applies.
 */
function validateChainRepeats(record: VoiceRecord, voiceId: string, line: number): VoicesLedgerValidationIssue[] {
  const issues: VoicesLedgerValidationIssue[] = [];
  const push = (issue: Omit<VoicesLedgerValidationIssue, "voiceId">) => issues.push({ ...issue, voiceId });
  const chain = record.voiceChain;

  const illegal = new Set<number>();
  for (let index = 1; index < chain.length; index += 1) {
    const siglum = chain[index]!;
    if (!chain.slice(0, index).includes(siglum)) continue;
    const adjacentAndOnce = chain[index - 1] === siglum && !chain.slice(0, index - 1).includes(siglum);
    if (adjacentAndOnce) continue;
    illegal.add(index);
    push({
      code: "chain_repeats_siglum",
      message: `voice_chain ${JSON.stringify(chain)} re-enters "${siglum}" at position ${index}, which is not an adjacent self-report.`,
      fix: "Only a narrator reporting themselves may repeat a siglum, and only in one adjacent pair. Split the record instead.",
      line,
    });
  }

  const terminal = chain.length - 1;
  const ownsRepeat =
    record.resolution === "resolved" && terminal > 0 && chain[terminal] === chain[terminal - 1] && !illegal.has(terminal);
  if (ownsRepeat) {
    const hasPersonMarkedCue = record.evidenceRefs.some(
      (ref) =>
        ref.kind === "person_marked_reporting_formula" &&
        ref.role === "cue" &&
        ref.startChar >= record.startChar &&
        ref.endChar <= record.endChar,
    );
    // Either authority shape licenses the hop, never both — `authority_shape_conflict`
    // enforces the exclusivity, and the reviewed shape's own contract (registered
    // candidates containing the terminal, a hashed context enclosing the span inside
    // one outer turn, a structural rationale) is enforced in full elsewhere.
    if (!hasPersonMarkedCue && !record.reviewedAttribution) {
      push({
        code: "chain_repeat_unlicensed",
        message: `voice_chain ${JSON.stringify(chain)} attributes this span to its own narrator "${chain[terminal]}" but carries neither an in-span person_marked_reporting_formula nor a reviewed_attribution.`,
        fix: "Cite the first-person reporting formula printed inside the span (ἦν δ' ἐγώ, ἔφην, εἶπον) with role: cue, or resolve the span by reviewed_attribution over the local exchange. A first-person pronoun is neither; without one of the two, record the span as unresolved.",
        line,
      });
    }
  }

  return issues;
}

/**
 * Record-level requirements for the two flanked kinds.
 *
 * `anchored_dialogue_turn` needs three distinct things, and citing three refs of
 * the same kind used to satisfy a check that only counted sides:
 *   1. a byte-verified grammatical cue INSIDE the span;
 *   2. a valid anchor opening the exchange, before the span;
 *   3. a valid anchor closing it, after the span.
 *
 * `formula_bounded_continuation` asserts that one voice continues across an
 * interruption, so both of its anchors must be the SAME kind — the point is that
 * the same formula brackets the span. Counting any ref on either side let an
 * unrelated formula stand in for the closing bracket.
 */
function validateFlankedRecord(
  record: VoiceRecord,
  flankingBefore: number,
  flankingAfter: number,
  line: number,
): VoicesLedgerValidationIssue[] {
  const issues: VoicesLedgerValidationIssue[] = [];
  const push = (issue: Omit<VoicesLedgerValidationIssue, "voiceId">) =>
    issues.push({ ...issue, voiceId: record.voiceId });

  const kinds = new Set(record.evidenceRefs.map((ref) => ref.kind));

  if (kinds.has("anchored_dialogue_turn")) {
    const cues = record.evidenceRefs.filter(
      (ref) =>
        ref.kind === "anchored_dialogue_turn" &&
        ref.role === "cue" &&
        ref.startChar >= record.startChar &&
        ref.endChar <= record.endChar,
    );
    if (cues.length === 0) {
      push({
        code: "evidence_cue_missing",
        message:
          "An anchored_dialogue_turn record cites no in-span grammatical cue (a role: cue ref inside its own span).",
        fix: "Cite the person-marked reporting verb or vocative printed inside this utterance, with role: cue. Without one the span is unresolved, not anchored.",
        line,
      });
    }
    const opens = record.evidenceRefs.filter((ref) => ref.role === "exchange_open");
    const closes = record.evidenceRefs.filter((ref) => ref.role === "exchange_close");
    if (opens.length === 0 || closes.length === 0) {
      push({
        code: "evidence_not_flanked",
        message: `An anchored_dialogue_turn record must cite the anchors that open AND close its bounded exchange; found ${opens.length} exchange_open and ${closes.length} exchange_close ref(s).`,
        fix: "Add role: exchange_open before the span and role: exchange_close after it, so a reviewer can verify the exchange really is bounded and really is two-party.",
        line,
      });
    }
  }

  if (kinds.has("formula_bounded_continuation")) {
    const sameKind = record.evidenceRefs.filter((ref) => ref.kind === "formula_bounded_continuation");
    const beforeSame = sameKind.filter((ref) => ref.endChar <= record.startChar).length;
    const afterSame = sameKind.filter((ref) => ref.startChar >= record.endChar).length;
    if (beforeSame === 0 || afterSame === 0) {
      push({
        code: "evidence_not_flanked",
        message: `A formula_bounded_continuation record must cite formula_bounded_continuation evidence on BOTH sides of its span; found ${beforeSame} before and ${afterSame} after (${flankingBefore} and ${flankingAfter} refs of any kind).`,
        fix: "Cite the same bracketing formula before and after the span. A ref of some other kind on one side does not establish that the voice continued.",
        line,
      });
    }
  }

  return issues;
}

/**
 * Cross-record geometry: non-overlap within a depth, strict nesting across
 * depths, chain-prefix consistency with the enclosing span, and gapless coverage
 * of any turn that carries records. Without these the join could not be total —
 * a claim could fall in a hole and silently inherit the outer narrator again,
 * which is the defect this lane exists to fix.
 *
 * REJECTED RECORDS ARE TOMBSTONES and are excluded here, because the compiler
 * and the validator must accept the same geometry. A rejected record must be
 * replaced by an accepted record over the same region; if rejected records
 * counted as live, that mandatory replacement would itself trip
 * `overlap_same_depth`, and no ledger containing a rejection could ever be both
 * valid and compilable. The compiler pays for the exemption by requiring the
 * tombstoned interval to be COMPLETELY re-covered — see
 * `collectAcceptedProjectionFailures`.
 */
function validateVoiceGeometry(
  records: Array<{ record: VoiceRecord; line: number }>,
  turnIndex: TurnIndex | undefined,
): VoicesLedgerValidationIssue[] {
  const issues: VoicesLedgerValidationIssue[] = [];
  const usable = records.filter(
    ({ record }) =>
      record.reviewStatus !== "rejected" &&
      Number.isInteger(record.startChar) &&
      Number.isInteger(record.endChar) &&
      record.startChar < record.endChar,
  );

  const byDepth = new Map<number, Array<{ record: VoiceRecord; line: number }>>();
  for (const entry of usable) {
    const list = byDepth.get(entry.record.depth) ?? [];
    list.push(entry);
    byDepth.set(entry.record.depth, list);
  }

  for (const [depth, list] of [...byDepth.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...list].sort((a, b) => a.record.startChar - b.record.startChar);
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1]!.record;
      const current = sorted[index]!.record;
      if (current.startChar < previous.endChar) {
        issues.push({
          code: "overlap_same_depth",
          message: `Voice spans at depth ${depth} overlap: ${previous.voiceId} [${previous.startChar}, ${previous.endChar}) and ${current.voiceId} [${current.startChar}, ${current.endChar}).`,
          fix: "Split or merge the records so same-depth spans are disjoint.",
          voiceId: current.voiceId,
          line: sorted[index]!.line,
        });
      }
    }
  }

  for (const { record, line } of usable) {
    if (record.depth <= 1) continue;
    const candidates = usable.filter(
      ({ record: other }) =>
        other.depth === record.depth - 1 && other.startChar <= record.startChar && record.endChar <= other.endChar,
    );
    if (candidates.length === 0) {
      const straddled = usable.filter(
        ({ record: other }) =>
          other.depth === record.depth - 1 && other.startChar < record.endChar && record.startChar < other.endChar,
      );
      if (straddled.length > 0) {
        issues.push({
          code: "ambiguous_intersection",
          message: `${record.voiceId} [${record.startChar}, ${record.endChar}) partially overlaps ${straddled.length} depth-${record.depth - 1} span(s) without nesting inside any of them.`,
          fix: "Voice spans must nest strictly; split this record at the enclosing span's boundary.",
          voiceId: record.voiceId,
          line,
        });
      } else {
        issues.push({
          code: "nesting_missing_parent",
          message: `${record.voiceId} has depth ${record.depth} but no depth-${record.depth - 1} span contains it.`,
          fix: "Add the enclosing narration span, or lower this record's depth.",
          voiceId: record.voiceId,
          line,
        });
      }
      continue;
    }
    const parent = candidates[0]!.record;
    const expectedPrefix = parent.voiceChain;
    const actualPrefix = record.voiceChain.slice(0, expectedPrefix.length);
    if (JSON.stringify(actualPrefix) !== JSON.stringify(expectedPrefix)) {
      issues.push({
        code: "chain_prefix_mismatch",
        message: `${record.voiceId} chain ${JSON.stringify(record.voiceChain)} does not extend its enclosing span ${parent.voiceId} chain ${JSON.stringify(expectedPrefix)}.`,
        fix: "A deeper span's outer hops must equal its enclosing span's chain.",
        voiceId: record.voiceId,
        line,
      });
    }
  }

  if (turnIndex) {
    const turnsWithRecords = new Set(usable.map(({ record }) => record.outerTurnId));
    for (const turn of turnIndex.turns) {
      if (!turnsWithRecords.has(turn.turnId)) continue;
      const inTurn = usable.filter(({ record }) => record.outerTurnId === turn.turnId);
      const minDepth = Math.min(...inTurn.map(({ record }) => record.depth));
      const base = inTurn
        .filter(({ record }) => record.depth === minDepth)
        .map(({ record }) => record)
        .sort((a, b) => a.startChar - b.startChar);
      let cursor = turn.startChar;
      for (const record of base) {
        if (record.startChar > cursor) {
          issues.push({
            code: "coverage_gap",
            message: `${turn.turnId} has no depth-${minDepth} voice record for [${cursor}, ${record.startChar}).`,
            fix: "Add a record covering the gap; mark it unresolved if no evidence licenses an owner.",
            voiceId: record.voiceId,
          });
        }
        cursor = Math.max(cursor, record.endChar);
      }
      if (cursor < turn.endChar) {
        issues.push({
          code: "coverage_gap",
          message: `${turn.turnId} has no depth-${minDepth} voice record for [${cursor}, ${turn.endChar}).`,
          fix: "Add a record covering the gap; mark it unresolved if no evidence licenses an owner.",
        });
      }
    }
  }

  return issues;
}

/**
 * Derived voice artifacts must not outlive the inputs they were compiled from.
 *
 * A compiled index is checked for freshness and forgery whether or not the
 * dialogue is activated — standalone reported-turn data is still real data, and
 * a stale artifact is a lie about the corpus regardless of who consumes it.
 *
 * What activation controls is the JOIN. An active dialogue must have a current
 * index and a current join: that is the post-cutover state, and an absent,
 * stale, or hand-edited join must fail closed. A non-active dialogue must have
 * no stored join at all, because a stored join is materialized claim
 * attribution that no reviewed decision authorized (the voice activation contract).
 */
export function collectStaleVoiceDerivedFailures(dialogue: string, ledgerContent: string): string[] {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const ledgerSha = sha256(ledgerContent);
  const active = isVoiceCutoverActive(dialogue);

  const indexRelative = `derived/plato/voices/${dialogue}.toon`;
  const indexAbsolute = join(repoRoot, indexRelative);
  const joinRelative = voiceJoinPath(dialogue);
  const joinAbsolute = join(repoRoot, joinRelative);
  if (!existsSync(indexAbsolute)) {
    if (active) {
      failures.push(
        `${dialogue} is activated in ${voiceCutoverRegistryPath()} but ${indexRelative} does not exist. ` +
          "An active dialogue must have accepted, compiled reported-turn data, or its registry entry must be removed.",
      );
    }
    if (existsSync(joinAbsolute)) {
      failures.push(
        `${joinRelative} is orphaned because ${indexRelative} does not exist. ` +
          "Remove the join; no materialized attribution may survive without accepted voice authority.",
      );
    }
    return failures;
  }

  const indexContent = readFileSync(indexAbsolute, "utf8");
  const recordedLedgerSha = /^ledger_sha256:\s+([a-f0-9]{64})$/mu.exec(indexContent)?.[1];
  if (recordedLedgerSha !== ledgerSha) {
    failures.push(
      `${indexRelative} was compiled from a different wiki/voices/${dialogue}.md (recorded ${recordedLedgerSha ?? "nothing"}, current ${ledgerSha}). Regenerate with \`bun run harness derive voices ${dialogue}\`.`,
    );
  }

  // Standalone data stops here. The index above was still checked for staleness;
  // what it does NOT do is oblige anyone to consume it.
  if (!active) {
    if (existsSync(joinAbsolute)) {
      failures.push(
        `${joinRelative} exists but "${dialogue}" is not activated in ${voiceCutoverRegistryPath()}. ` +
          "A stored join is materialized claim attribution, so it may exist only for a dialogue whose cutover " +
          "was separately reviewed. Delete the join, or add a registry entry citing its review note.",
      );
    }
    return failures;
  }

  if (!existsSync(joinAbsolute)) {
    failures.push(
      `${joinRelative} is missing while authoritative ${indexRelative} exists. ` +
        `Complete the cutover and regenerate with \`bun run harness derive voice-joins ${dialogue}\`.`,
    );
    return failures;
  }

  const joinContent = readFileSync(joinAbsolute, "utf8");
  let parsedJoin: ReturnType<typeof parseVoiceJoinToon>;
  try {
    parsedJoin = parseVoiceJoinToon(joinContent);
  } catch (error) {
    failures.push(
      `${joinRelative} is malformed (${error instanceof Error ? error.message : String(error)}). ` +
        `Regenerate with \`bun run harness derive voice-joins ${dialogue}\`.`,
    );
    return failures;
  }

  const observationRelative = `wiki/observations/${dialogue}.md`;
  const claimRelative = `wiki/claims/${dialogue}.md`;
  const observationAbsolute = join(repoRoot, observationRelative);
  const claimAbsolute = join(repoRoot, claimRelative);
  const currentIndexSha = sha256(indexContent);

  if (parsedJoin.voiceIndexPath !== indexRelative || parsedJoin.voiceIndexSha256 !== currentIndexSha) {
    failures.push(
      `${joinRelative} does not name and hash the current ${indexRelative}. ` +
        `Regenerate with \`bun run harness derive voice-joins ${dialogue}\`.`,
    );
  }

  if (!existsSync(observationAbsolute)) {
    failures.push(`${joinRelative} names missing input ${observationRelative}.`);
  } else {
    const currentObservationSha = sha256(readFileSync(observationAbsolute, "utf8"));
    if (
      parsedJoin.observationLedgerPath !== observationRelative ||
      parsedJoin.observationLedgerSha256 !== currentObservationSha
    ) {
      failures.push(
        `${joinRelative} does not name and hash the current ${observationRelative}. ` +
          `Regenerate with \`bun run harness derive voice-joins ${dialogue}\`.`,
      );
    }
  }

  const currentClaimContent = existsSync(claimAbsolute) ? readFileSync(claimAbsolute, "utf8") : "";
  if (parsedJoin.claimLedgerPath !== claimRelative || parsedJoin.claimLedgerSha256 !== sha256(currentClaimContent)) {
    failures.push(
      `${joinRelative} does not name and hash the current ${claimRelative}. ` +
        `Regenerate with \`bun run harness derive voice-joins ${dialogue}\`.`,
    );
  }

  // Hash headers alone do not make the stored rows authoritative: a hand edit
  // can preserve every header. Rebuild from the accepted index and current
  // ledgers and demand byte identity, including row ordering and stance rows.
  try {
    const expected = formatVoiceJoinToon(buildVoiceJoin(dialogue));
    if (joinContent !== expected) {
      failures.push(
        `${joinRelative} does not byte-match its deterministic rebuild from the current voice index and ledgers. ` +
          `Regenerate with \`bun run harness derive voice-joins ${dialogue}\`.`,
      );
    }
  } catch (error) {
    failures.push(
      `${joinRelative} cannot be verified against current authority (${error instanceof Error ? error.message : String(error)}).`,
    );
  }

  return failures;
}

/**
 * Full-repository orphan scan. `validateVoicesLedgers` normally starts from
 * ledger paths, so an artifact whose ledger was deleted would otherwise be
 * invisible and survive validation indefinitely.
 */
export function collectOrphanVoiceDerivedFailures(): string[] {
  const repoRoot = getRepoRoot();
  const failures: string[] = [];
  const indexDirectory = join(repoRoot, "derived/plato/voices");
  const joinDirectory = join(repoRoot, "derived/plato/joins/voices");

  const indexes = existsSync(indexDirectory)
    ? readdirSync(indexDirectory).filter((name) => /^[a-z0-9-]+\.toon$/u.test(name)).sort()
    : [];
  const joins = existsSync(joinDirectory)
    ? readdirSync(joinDirectory).filter((name) => /^[a-z0-9-]+\.toon$/u.test(name)).sort()
    : [];

  for (const filename of indexes) {
    const dialogue = filename.replace(/\.toon$/u, "");
    const ledgerRelative = `wiki/voices/${dialogue}.md`;
    if (!existsSync(join(repoRoot, ledgerRelative))) {
      failures.push(
        `derived/plato/voices/${filename} is orphaned because ${ledgerRelative} does not exist. ` +
          "Remove the artifact or restore and review its ledger.",
      );
    }
  }

  for (const filename of joins) {
    const dialogue = filename.replace(/\.toon$/u, "");
    const indexRelative = `derived/plato/voices/${filename}`;
    const ledgerRelative = `wiki/voices/${dialogue}.md`;
    if (!existsSync(join(repoRoot, indexRelative)) || !existsSync(join(repoRoot, ledgerRelative))) {
      failures.push(
        `derived/plato/joins/voices/${filename} is orphaned because its ` +
          `${!existsSync(join(repoRoot, indexRelative)) ? "voice index" : "voice ledger"} does not exist.`,
      );
    }
  }

  return failures;
}

/**
 * Post-cutover consistency for a dialogue whose cutover has been ACTIVATED.
 *
 * Once a dialogue is activated, `speaker` has exactly one meaning: the innermost
 * licensed owner. Three things must hold, or the ledger has drifted back toward
 * two meanings:
 *   1. every accepted claim resolves to one owner;
 *   2. its materialized `speaker` equals that owner;
 *   3. a stance event spoken by someone else does not disturb either — it is
 *      recorded as an actor, never folded into ownership.
 *
 * Callers must gate this on the registry; `collectVoiceClaimConsistencyFailures`
 * is the entry point that does so.
 */
export function collectClaimSpeakerConsistencyFailures(
  dialogue: string,
  join: {
    rows: Array<{ recordId: string; recordKind: string; reviewStatus: string; owner: string; status: string; evidence: string }>;
    stanceRows: Array<{ claimId: string; actor: string }>;
  },
  claimSpeakers: Map<string, string>,
): string[] {
  const failures: string[] = [];
  for (const row of join.rows) {
    if (row.recordKind !== "claim" || row.reviewStatus !== "accepted") continue;
    const resolved = row.status === "resolved" || row.status === "turn_level";
    if (!resolved) {
      failures.push(
        `${dialogue}: accepted ${row.recordId} resolves to no single owner (${row.status}: ${row.evidence}). ` +
          "An accepted claim in a voiced dialogue must have one licensed owner, or move to a non-accepted status.",
      );
      continue;
    }
    const materialized = claimSpeakers.get(row.recordId);
    if (materialized !== undefined && materialized !== row.owner) {
      failures.push(
        `${dialogue}: ${row.recordId} has speaker "${materialized}" but the voice join resolves its owner to ` +
          `"${row.owner}". Re-run the claim-speaker migration.`,
      );
    }
  }
  return failures;
}

/**
 * The activation-gated entry point for claim-speaker consistency.
 *
 * This is the seam the voice activation contract exists to draw. Before it, the trigger was the mere
 * presence of a compiled index, so accepting a dialogue's reported turns forced
 * every claim those turns touched to migrate in the same breath — 102 accepted
 * Phaedo claims, for data that no consumer had yet been authorized to read.
 * Now: no registry entry, no opinion about any claim's speaker.
 */
export function collectVoiceClaimConsistencyFailures(dialogue: string): string[] {
  if (!isVoiceCutoverActive(dialogue)) return [];

  const claimPath = join(getRepoRoot(), `wiki/claims/${dialogue}.md`);
  const claimSpeakers = new Map<string, string>();
  if (existsSync(claimPath)) {
    for (const block of claimYamlBlocks(readFileSync(claimPath, "utf8"))) {
      const claimId = /^claim_id:\s*(\S+)\s*$/mu.exec(block)?.[1];
      const speaker = (/^speaker:\s*(.*)$/mu.exec(block)?.[1] ?? "").trim().replace(/^"(.*)"$/u, "$1");
      if (claimId) claimSpeakers.set(claimId, speaker);
    }
  }
  return collectClaimSpeakerConsistencyFailures(dialogue, buildVoiceJoin(dialogue), claimSpeakers);
}

export function formatVoicesLedgerValidationError(issues: VoicesLedgerValidationIssue[]) {
  const counts = new Map<string, number>();
  for (const issue of issues) counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  const countSummary = [...counts.entries()].map(([code, count]) => `${code}: ${count}`).join(", ");
  const shown = issues.slice(0, 8);
  const lines = [
    "Voice ledger validation failed.",
    `Issue counts: ${countSummary}`,
    ...shown.map((issue) => {
      const location = [issue.voiceId, issue.line ? `line ${issue.line}` : undefined].filter(Boolean).join(" ");
      return `- ${location || "ledger"}: ${issue.message} Fix: ${issue.fix}`;
    }),
  ];
  if (issues.length > shown.length) lines.push(`- ${issues.length - shown.length} more issue(s) omitted.`);
  return lines.join("\n");
}

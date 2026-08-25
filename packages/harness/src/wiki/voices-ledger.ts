import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { fieldValue, listFieldValue } from "./observation-ledger.js";

declare const Bun: { TOML: { parse(content: string): unknown } };

const YAML_BLOCK_RE = /```yaml\n([\s\S]*?)\n```/gu;

export type VoiceMarkdownBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  voiceId: string | undefined;
};

/**
 * `resolved` means the last chain element is the innermost licensed owner of the
 * whole span. `unresolved` means the chain records the deepest securely licensed
 * narration level and the terminal owner inside the span is NOT licensed. There
 * is no third state: a span is never silently left out.
 */
export type VoiceResolution = "resolved" | "unresolved";

/**
 * Text-internal grammatical evidence kinds. Every one of these is checkable
 * against source bytes. Doctrine, style, translation, commentary, and what a
 * speaker is expected to believe are never evidence and have no kind here.
 *
 * - `printed_siglum`                a speaker siglum printed in the source.
 * - `named_reporting_formula`       a formula naming the speaker outright.
 * - `role_reporting_formula`        the same shape, but its nominative subject
 *                                   is a definite role description rather than
 *                                   a proper name (`ὁ θυρωρός`, `ὁ τῶν ἕνδεκα
 *                                   ὑπηρέτης`). The registry, not the reader,
 *                                   decides which roles are terminal owners;
 *                                   the kind stays distinct so a record never
 *                                   claims the text printed a name it did not.
 * - `person_marked_reporting_formula` a first-/third-person reporting formula
 *                                   whose morphology identifies the narrator.
 * - `anaphoric_reporting_formula`   a formula whose subject is a pronoun; the
 *                                   record must cite the antecedent's bytes.
 * - `closing_formula`               a naming formula printed after its span.
 * - `formula_bounded_continuation`  the same active voice continues across an
 *                                   interruption; the record must cite formula
 *                                   evidence on both sides of the span.
 * - `anchored_dialogue_turn`        a turn inside an explicitly bounded
 *                                   two-party exchange; the record must cite an
 *                                   in-span grammatical cue AND the anchors
 *                                   that open and close the exchange.
 *
 * There is deliberately no `none` kind. An unresolved record names no owner and
 * therefore cites no evidence at all: `evidence_refs` is absent, not populated
 * with a placeholder. A kind called `none` made "no evidence" look like a species
 * of evidence, and let a record carry an entry that no check could ever falsify.
 */
export const VOICE_EVIDENCE_KINDS = new Set([
  "printed_siglum",
  "named_reporting_formula",
  "role_reporting_formula",
  "person_marked_reporting_formula",
  "anaphoric_reporting_formula",
  "closing_formula",
  "formula_bounded_continuation",
  "anchored_dialogue_turn",
  "unlabelled_turn_frame",
]);

/**
 * The turn layer's marker for a turn the source prints no siglum for.
 *
 * It is METADATA, not a person. It never enters `derived/plato/voices/sigla.toml`
 * and never appears in a `voice_chain`: registering it would put a non-owner in
 * front of every claim the frame encloses, and resolving a frame record "to"
 * it would assert that nobody owns the work.
 */
export const UNLABELLED_TURN_SPEAKER = "(none)";

/**
 * Kinds valid ONLY on a depth-1 frame record over an unlabelled turn.
 *
 * Operator ruling, 2026-08-01, the corpus reported-turn completion campaign wave 2. Five required turns — the whole
 * of apology, charmides, lysis, parmenides and republic — are printed with no
 * siglum at all, and until this kind existed no valid depth-1 record could be
 * written for any of them: `printed_siglum` byte-checks against a string the
 * Greek does not contain, `unresolved` would empty the chain, and a
 * `reviewed_attribution` resolving to the frame owner had to manufacture a
 * second candidate to satisfy the two-owner rule. The whole ledger was blocked
 * on its first line for a reason about this file.
 *
 * The kind carries byte-cited Greek anchors like every other kind, so it lowers
 * no evidence bar. What it does NOT do is pretend a narratorial phrase is a
 * reporting formula: `person_marked_reporting_formula` was deliberately not
 * broadened, because Apology's `οὐκ οἶδα` reports no utterance and calling it a
 * reporting formula would corrupt a kind that 800-odd records depend on.
 */
export const VOICE_FRAME_EVIDENCE_KINDS = new Set(["unlabelled_turn_frame"]);

/** Kinds whose record must carry evidence on both sides of its span. */
export const FLANKED_EVIDENCE_KINDS = new Set(["formula_bounded_continuation", "anchored_dialogue_turn"]);

/**
 * What a ref is doing on its record.
 *
 * - `cue`            the grammatical evidence for THIS span's owner. Must lie
 *                    inside the span (or within the lookback/lookahead bounds
 *                    for the introducing kinds).
 * - `exchange_open`  the byte-verified formula that opens the bounded exchange
 *                    the span sits in. Must precede the span.
 * - `exchange_close` the formula that closes it. Must follow the span.
 *
 * Roles exist because the flanking check used to count refs on either side
 * without asking what they were. Three refs all tagged `anchored_dialogue_turn`
 * satisfied it even when none of them was a cue inside the span — so a record
 * could be "anchored" while citing no evidence about its own speaker.
 */
export const VOICE_EVIDENCE_ROLES = new Set(["cue", "exchange_open", "exchange_close"]);

/** Kinds that can validly open a bounded exchange by naming or person-marking a speaker. */
export const EXCHANGE_OPEN_KINDS = new Set([
  "printed_siglum",
  "named_reporting_formula",
  "role_reporting_formula",
  "person_marked_reporting_formula",
  "anaphoric_reporting_formula",
]);

/** Kinds that can validly close one by naming or person-marking the resumed speaker. */
export const EXCHANGE_CLOSE_KINDS = new Set([
  "printed_siglum",
  "named_reporting_formula",
  "role_reporting_formula",
  "person_marked_reporting_formula",
  "closing_formula",
]);

export type VoiceEvidenceRef = {
  kind: string;
  role: string;
  text: string;
  startChar: number;
  endChar: number;
  antecedentText: string | undefined;
  antecedentStartChar: number | undefined;
  antecedentEndChar: number | undefined;
};

/** The only `reviewed_attribution.kind` in schema v1. */
export const VOICE_REVIEWED_ATTRIBUTION_KINDS = new Set(["discourse_resolution"]);

/**
 * A reviewed structural adjudication over a bounded Greek context (the Phaedo discourse attribution review).
 *
 * This is the second of exactly two authority shapes a resolved record may
 * carry, and it is mutually exclusive with `evidence_refs`. It exists because
 * Phaedo narrates in direct speech: most utterances carry a bare `ἔφη` that
 * names nobody, so an evidence-only lane labelled 288 of 350 records unresolved
 * even where the Greek supplies an ordinary, locally bounded question and
 * answer. That measured the extractor, not the text.
 *
 * What it records is an adjudication, not a guess, and it is falsifiable in the
 * ways that matter: the context bytes are hashed, the candidates must be
 * registered, the terminal owner must be among them, and the rationale must
 * name structural grounds. What it does NOT do is let doctrine, style,
 * vocabulary, translation, an editor's label, or blind alternation pick a
 * speaker.
 */
export type VoiceReviewedAttribution = {
  kind: string;
  /** The locally plausible owners BEFORE resolution — not everyone present. */
  candidateOwners: string[];
  contextStartChar: number;
  contextEndChar: number;
  contextSha256: string;
  rationale: string;
};

export type VoiceRecord = {
  voiceId: string;
  sourceWork: string;
  outerTurnId: string;
  stephanusSpan: string;
  startChar: number;
  endChar: number;
  sourcePath: string;
  sourceSha256: string;
  spanSha256: string;
  voiceChain: string[];
  depth: number;
  resolution: VoiceResolution;
  evidenceRefs: VoiceEvidenceRef[];
  reviewedAttribution: VoiceReviewedAttribution | undefined;
  /**
   * Optional locally plausible owners for an unresolved record. The substantive
   * unresolved reason is authoritative; candidates are supporting evidence.
   */
  candidateOwners: string[];
  unresolvedReason: string;
  /** Optional prose about what this record does not establish. */
  limits?: string;
  reviewStatus: string;
};

function countLinesBefore(content: string, index: number) {
  return content.slice(0, index).split("\n").length;
}

export function voiceMarkdownBlocks(content: string): VoiceMarkdownBlock[] {
  return [...content.matchAll(YAML_BLOCK_RE)].map((match, index) => {
    const block = match[1] ?? "";
    return {
      content: block,
      fullMatch: match[0],
      startLine: countLinesBefore(content, match.index ?? 0) + 1,
      index,
      voiceId: fieldValue(block, "voice_id"),
    };
  });
}

export function voiceYamlBlocks(content: string) {
  return voiceMarkdownBlocks(content).map((block) => block.content);
}

export function replaceVoiceYamlBlocks(content: string, replacer: (block: string, fullMatch: string) => string) {
  return content.replace(YAML_BLOCK_RE, (fullMatch, block: string) => replacer(block, fullMatch));
}

function parseNumber(value: string | undefined) {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function unquote(value: string) {
  return value.trim().replace(/^"([\s\S]*)"$/u, "$1").replace(/\\"/gu, '"').replace(/\\\\/gu, "\\");
}

/**
 * Pull the nested block under a top-level `key:` — the indented lines that
 * follow it, stopping at the next unindented line.
 */
function nestedBlock(block: string, key: string) {
  const match = new RegExp(`^${key}:\\s*$`, "mu").exec(block);
  if (!match) return undefined;
  const lines: string[] = [];
  for (const line of block.slice((match.index ?? 0) + match[0].length).split("\n").slice(1)) {
    if (line.trim().length > 0 && /^\S/u.test(line)) break;
    lines.push(line);
  }
  return lines.join("\n");
}

function parseEvidenceRefs(block: string): VoiceEvidenceRef[] {
  const body = nestedBlock(block, "evidence_refs");
  if (body === undefined) return [];
  const entries: string[] = [];
  for (const line of body.split("\n")) {
    if (/^\s+-\s/u.test(line)) entries.push(line.replace(/^\s+-\s/u, "  "));
    else if (entries.length > 0) entries[entries.length - 1] += `\n${line}`;
  }
  const scalar = (entry: string, name: string) => {
    const match = new RegExp(`^\\s*${name}:\\s*(.*)$`, "mu").exec(entry);
    return match ? unquote(match[1] ?? "") : undefined;
  };
  return entries.map((entry) => ({
    kind: scalar(entry, "kind") ?? "",
    // `cue` is the default: a ref that says nothing about its role is evidence
    // for this span's own owner, and is held to the in-span requirement.
    role: scalar(entry, "role") ?? "cue",
    text: scalar(entry, "text") ?? "",
    startChar: parseNumber(scalar(entry, "start_char")) ?? Number.NaN,
    endChar: parseNumber(scalar(entry, "end_char")) ?? Number.NaN,
    antecedentText: scalar(entry, "antecedent_text"),
    antecedentStartChar: parseNumber(scalar(entry, "antecedent_start_char")),
    antecedentEndChar: parseNumber(scalar(entry, "antecedent_end_char")),
  }));
}

/**
 * Parse a block into a record. Field-level validity is the validator's job; this
 * only shapes the text. Missing numerics become NaN so a malformed record fails
 * a range check rather than silently defaulting to 0 — offset 0 is a real
 * position in every source file.
 */
export function parseVoiceRecord(block: string): VoiceRecord {
  const charSpan = nestedBlock(block, "char_span") ?? "";
  const limits = fieldValue(block, "limits");
  const nested = (name: string) => {
    const match = new RegExp(`^\\s*${name}:\\s*(.*)$`, "mu").exec(charSpan);
    return match ? unquote(match[1] ?? "") : undefined;
  };
  return {
    voiceId: fieldValue(block, "voice_id") ?? "",
    sourceWork: fieldValue(block, "source_work") ?? "",
    outerTurnId: fieldValue(block, "outer_turn_id") ?? "",
    stephanusSpan: fieldValue(block, "stephanus_span") ?? "",
    startChar: parseNumber(nested("start_char")) ?? Number.NaN,
    endChar: parseNumber(nested("end_char")) ?? Number.NaN,
    sourcePath: fieldValue(block, "source_path") ?? "",
    sourceSha256: fieldValue(block, "source_sha256") ?? "",
    spanSha256: fieldValue(block, "span_sha256") ?? "",
    voiceChain: listFieldValue(block, "voice_chain"),
    depth: parseNumber(fieldValue(block, "depth")) ?? Number.NaN,
    resolution: (fieldValue(block, "resolution") ?? "") as VoiceResolution,
    evidenceRefs: parseEvidenceRefs(block),
    reviewedAttribution: parseReviewedAttribution(block),
    candidateOwners: listFieldValue(block, "candidate_owners"),
    unresolvedReason: fieldValue(block, "unresolved_reason") ?? "",
    ...(limits === undefined ? {} : { limits }),
    reviewStatus: fieldValue(block, "review_status") ?? "unreviewed",
  };
}

/**
 * Presence is reported structurally: a block that writes `reviewed_attribution:`
 * at all yields an object, however malformed its interior. Returning `undefined`
 * for a broken one would make "the reviewer wrote nonsense here" indistinguishable
 * from "this record carries explicit evidence instead", and the validator could
 * not tell the two apart to complain about the right one.
 */
function parseReviewedAttribution(block: string): VoiceReviewedAttribution | undefined {
  const body = nestedBlock(block, "reviewed_attribution");
  if (body === undefined) return undefined;
  const scalar = (name: string) => {
    const match = new RegExp(`^\\s*${name}:\\s*(.*)$`, "mu").exec(body);
    return match ? unquote(match[1] ?? "") : undefined;
  };
  const contextBody = (() => {
    const match = /^\s*context_span:\s*$/mu.exec(body);
    if (!match) return "";
    const after = body.slice((match.index ?? 0) + match[0].length).split("\n").slice(1);
    const lines: string[] = [];
    for (const line of after) {
      if (line.trim().length > 0 && /^\s{0,2}\S/u.test(line)) break;
      lines.push(line);
    }
    return lines.join("\n");
  })();
  const contextScalar = (name: string) => {
    const match = new RegExp(`^\\s*${name}:\\s*(.*)$`, "mu").exec(contextBody);
    return match ? unquote(match[1] ?? "") : undefined;
  };

  const owners = /^\s*candidate_owners:\s*(.*)$/mu.exec(body)?.[1] ?? "";
  return {
    kind: scalar("kind") ?? "",
    candidateOwners: owners
      .replace(/^\[|\]$/gu, "")
      .split(",")
      .map((entry) => unquote(entry.trim()))
      .filter((entry) => entry.length > 0),
    contextStartChar: parseNumber(contextScalar("start_char")) ?? Number.NaN,
    contextEndChar: parseNumber(contextScalar("end_char")) ?? Number.NaN,
    contextSha256: contextScalar("text_sha256") ?? "",
    rationale: scalar("rationale") ?? "",
  };
}

export function parseVoiceLedger(content: string): VoiceRecord[] {
  return voiceYamlBlocks(content).map((block) => parseVoiceRecord(block));
}

export function listVoicesLedgerPaths({ absolute = false }: { absolute?: boolean } = {}) {
  const voicesDir = join(getRepoRoot(), "wiki/voices");
  if (!existsSync(voicesDir)) return [];

  return readdirSync(voicesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => (absolute ? join(voicesDir, entry.name) : `wiki/voices/${entry.name}`))
    .sort();
}

export function dialogueFromVoicesPath(path: string) {
  return /^wiki\/voices\/(.+)\.md$/u.exec(path)?.[1];
}

export function dialogueFromVoiceId(voiceId: string, fallback = "(unknown)") {
  return /^voice_([a-z0-9-]+)_\d+$/u.exec(voiceId)?.[1] ?? fallback;
}

export function voiceSiglaRegistryPath() {
  return "derived/plato/voices/sigla.toml";
}

export function readVoiceSiglaRegistry(): Map<string, Set<string>> {
  const path = join(getRepoRoot(), voiceSiglaRegistryPath());
  const registry = new Map<string, Set<string>>();
  if (!existsSync(path)) return registry;

  const parsed = Bun.TOML.parse(readFileSync(path, "utf8")) as {
    dialogues?: Array<{ slug?: unknown; sigla?: unknown }>;
  };
  for (const entry of parsed.dialogues ?? []) {
    if (typeof entry.slug !== "string" || !Array.isArray(entry.sigla)) continue;
    registry.set(entry.slug, new Set(entry.sigla.filter((s): s is string => typeof s === "string")));
  }
  return registry;
}

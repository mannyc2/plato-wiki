import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { createSourceSpanResolver } from "../source.js";
import { workNameToSlug } from "../wiki/commentary-validator.js";
import {
  dialogueEpigraph,
  dialogueSpecimenId,
  dialogueTags,
  englishSpeakerLabels,
  FAMILY_GUIDE,
  greekSpeakerName,
  LAYER_GUIDE,
  patternOneliner,
  SPEAKER_OTHER,
  SPEAKER_PALETTE,
  STANDING_SPECIMEN_IDS,
  structureStripSvg,
  topPatternDossiers,
} from "./curation.js";
import {
  crossDialogueLabelCount,
  dossierFamilyLabelKey,
  familyRows,
  groupBy,
  parseObservationLedger,
  readSiteData,
  type ClaimShard,
  type DialogueDerived,
  type ObservationShard,
  type RelationShard,
  type RegistryShard,
  type SiteClaim,
  type SiteCluster,
  type SiteApparatusRecord,
  type SiteCommentaryBlock,
  type SiteCommentaryDialogue,
  type SiteData,
  type SiteDossier,
  type SiteObservation,
  type SiteRelation,
  type StephanusMarker,
  type ToonRow,
  type TurnShard,
} from "./data.js";
import {
  badge,
  escapeHtml,
  filterControls,
  idJumpStatusText,
  layout,
  metric,
  type NavCounts,
  pageLink,
  pathToRoot,
  siteCss,
  siteJs,
  titleCase,
} from "./layout.js";
import { formatRecordingTime } from "./player.js";
import {
  materializeSiteRecordings,
  type SiteRecording,
  validateSiteRecordingEvidence,
} from "./recordings.js";
import {
  buildExactIdIndex,
  buildSearchIndex,
  type ExactIdRecord,
  type SearchRecordInput,
} from "./search.js";
import { validateGeneratedSite, type GeneratedSiteValidationSummary } from "./validate.js";

export { parseObservationLedger };

export type BuiltStaticSite = {
  outDir: string;
  pages: string[];
  observationCount: number;
  registryEntryCount: number;
  clusterCount: number;
  acceptedRecordingCount: number;
  reviewCandidateRecordingCount: number;
  validation: GeneratedSiteValidationSummary;
};

export type BuildStaticSiteOptions = {
  outDir?: string;
  recordingArtifactRoot?: string;
  includeDraftRecordings?: boolean;
  readingPageTargetBytes?: number;
};

const CONTENT_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
const DEFAULT_READING_PAGE_TARGET_BYTES = 1_250_000;

type ReadingUnit = {
  section: SiteCommentaryBlock;
  commentaryIds: string[];
  markers: string[];
  html: string;
};

type ReadingPlacement = {
  block: SiteCommentaryBlock;
  anchorMarker: string | undefined;
};

type ReadingPagePlan = {
  dialogue: string;
  part: number;
  partCount: number;
  path: string;
  commentary: SiteCommentaryDialogue;
  sections: SiteCommentaryBlock[];
  commentaryIds: string[];
  markers: string[];
};

function navState(data: SiteData): NavCounts {
  return {
    dossiers: data.dossiers.length,
    clusters: data.clusters.length,
    families: familyRows(data.observations, data.registry).length,
    anchors: [...data.derivedByDialogue.values()].reduce((sum, row) => sum + row.anchors.length, 0),
    claims: data.claims.length,
    relations: data.relations.length,
    registry: data.registry.length,
    readings: data.commentaryByDialogue.size,
  };
}

function splitTarget(target: string) {
  const index = target.indexOf("#");
  return index === -1
    ? { path: target, hash: "" }
    : { path: target.slice(0, index), hash: target.slice(index) };
}

function idLink(pagePath: string, target: string | undefined, id: string) {
  if (!target) return escapeHtml(id);
  const parsed = splitTarget(target);
  return pageLink(pagePath, parsed.path, id, parsed.hash);
}

function observationLink(pagePath: string, data: SiteData, observation: SiteObservation) {
  return idLink(pagePath, data.observationPageById.get(observation.observationId), observation.observationId);
}

function claimLink(pagePath: string, data: SiteData, claimId: string) {
  return idLink(pagePath, data.claimPageById.get(claimId), claimId);
}

function dossierLink(pagePath: string, dossier: SiteDossier | undefined, label: string) {
  return dossier ? pageLink(pagePath, dossier.pagePath, label, `#${dossier.dossierId}`) : escapeHtml(label);
}

function relationLink(pagePath: string, data: SiteData, relationId: string) {
  return idLink(pagePath, data.relationPageById.get(relationId), relationId);
}

function requiredIdLink(pagePath: string, target: string | undefined, id: string, kind: string) {
  if (!target) throw new Error(`Unknown ${kind} target: ${id}.`);
  return idLink(pagePath, target, id);
}

function turnLink(pagePath: string, data: SiteData, turnId: string) {
  return requiredIdLink(pagePath, data.turnPageById.get(turnId), turnId, "turn");
}

function statusChip(status: string) {
  return status === "accepted" ? "" : badge(titleCase(status), `status-${status}`);
}

// A source-dialog jump may only target a spine marker actually rendered on a
// reading page, and reading pages shard — so it must point at the exact shard
// holding that marker. buildStaticSite populates this map from the reading
// plans (which know the sharding) before any card renders; a marker absent from
// the map has no reading row and gets no jump link. Keyed by the SiteData
// identity, which readSiteData mints fresh per build.
const readingMarkerPathCache = new WeakMap<SiteData, Map<string, string>>();

function markerPathKey(dialogue: string, marker: string) {
  return `${dialogue}::${marker}`;
}

function registerReadingMarkerPaths(data: SiteData, plans: readonly ReadingPagePlan[]) {
  const byMarker = new Map<string, string>();
  for (const plan of plans) {
    for (const marker of plan.markers) {
      byMarker.set(markerPathKey(plan.dialogue, marker), plan.path);
    }
  }
  readingMarkerPathCache.set(data, byMarker);
}

function readingMarkerPath(data: SiteData, dialogue: string, marker: string): string | undefined {
  return readingMarkerPathCache.get(data)?.get(markerPathKey(dialogue, marker));
}

function sourceOpenButton(recordId: string) {
  return `<button class="source-open" data-source-open="src-${escapeHtml(
    recordId,
  )}" aria-haspopup="dialog">Source</button>`;
}

function sourceDialog({
  recordId,
  pagePath,
  data,
  dialogue,
  span,
  startMarker,
  greek,
  turnIds,
}: {
  recordId: string;
  pagePath: string;
  data: SiteData;
  dialogue: string;
  span: string;
  startMarker: string;
  greek: string;
  turnIds: readonly string[];
}) {
  const excerpt = greek.trim()
    ? `<blockquote class="greek-excerpt" lang="grc">${escapeHtml(greek)}</blockquote>`
    : "";
  const reference = `<p class="dialog-ref"><a href="#${escapeHtml(recordId)}">${escapeHtml(recordId)}</a> at ${escapeHtml(
    span,
  )}</p>`;
  const visibleTurnIds = turnIds.slice(0, 5);
  const turnRow = visibleTurnIds.length
    ? `<p class="dialog-turns">${visibleTurnIds.map((turnId) => turnLink(pagePath, data, turnId)).join(", ")}${
        turnIds.length > visibleTurnIds.length
          ? `; ${pageLink(
              pagePath,
              `dialogues/${dialogue}/turns.html`,
              `${turnIds.length - visibleTurnIds.length} more in Turns`,
            )}`
          : ""
      }</p>`
    : "";
  const readingHref = readingMarkerPath(data, dialogue, startMarker);
  const readingTarget = readingHref
    ? `<p class="dialog-reading">${pageLink(
        pagePath,
        readingHref,
        "Open in the reading view",
        `#loc-${startMarker}`,
      )}</p>`
    : "";
  return `<dialog class="source-dialog" id="src-${escapeHtml(recordId)}" aria-label="Source for ${escapeHtml(
    recordId,
  )}">${excerpt}${reference}${turnRow}${readingTarget}<button class="dialog-close" data-dialog-close>Close</button></dialog>`;
}

function observationCard(pagePath: string, data: SiteData, observation: SiteObservation) {
  const familyTag = `<a class="badge badge-family" href="${pathToRoot(pagePath)}families/${escapeHtml(
    observation.featureFamily,
  )}.html">${escapeHtml(titleCase(observation.featureFamily))}</a>`;
  const turnIds = data.turnIdsByObservationId.get(observation.observationId) ?? [];
  return `<article class="record" id="${escapeHtml(observation.observationId)}" data-dialogue="${escapeHtml(
    observation.dialogue,
  )}" data-family="${escapeHtml(observation.featureFamily)}" data-label="${escapeHtml(
    observation.featureLabel,
  )}" data-status="${escapeHtml(observation.reviewStatus)}" data-search="${escapeHtml(
    `${observation.observationId} ${observation.observation} ${observation.textualBasis} ${observation.featureLabel}`.toLowerCase(),
  )}">
  <header class="record-context">
    <p class="record-eyebrow"><a class="record-anchor" href="#${escapeHtml(
      observation.observationId,
    )}"><span class="ref">${escapeHtml(observation.sourceWork)} ${escapeHtml(observation.stephanusSpan)}</span></a></p>
    <div class="badges">
      ${badge(titleCase(observation.featureLabel))}
      ${familyTag}
      ${statusChip(observation.reviewStatus)}
    </div>
  </header>
  <p class="record-lead">${escapeHtml(observation.observation)}</p>
  <p><strong>Basis.</strong> ${escapeHtml(observation.textualBasis)}</p>
  <p><strong>Limits.</strong> ${escapeHtml(observation.limits)}</p>
  <p class="terms">${observation.greekTerms.map((term) => `<span class="badge" lang="grc">${escapeHtml(term)}</span>`).join(" ")}</p>
  ${sourceOpenButton(observation.observationId)}
  ${sourceDialog({
    recordId: observation.observationId,
    pagePath,
    data,
    dialogue: observation.dialogue,
    span: observation.stephanusSpan,
    startMarker: observation.sourceRef.startMarker,
    greek: observation.greekExcerpt,
    turnIds,
  })}
</article>`;
}

function claimCard(pagePath: string, data: SiteData, claim: SiteClaim) {
  const speakerGreek = /\p{Script=Greek}/u.test(claim.speaker);
  const speakerSuffix = claim.speaker
    ? ` · <span${speakerGreek ? ' lang="grc"' : ""}>${escapeHtml(claim.speaker)}</span>`
    : "";
  const stanceLine = claim.stanceEvents.length
    ? `<p class="stance-line">${claim.stanceEvents
        .map((event) => `${escapeHtml(titleCase(event.kind))} at ${escapeHtml(event.stephanusSpan)}`)
        .join("; ")}</p>`
    : "";
  const greek = spineDisplayText(data.sourceResolver.resolveSourceSpan(claim.dialogue, claim.stephanusSpan).text);
  return `<article class="record" id="${escapeHtml(claim.claimId)}" data-dialogue="${escapeHtml(
    claim.dialogue,
  )}" data-status="${escapeHtml(claim.reviewStatus)}" data-search="${escapeHtml(
    `${claim.claimId} ${claim.content} ${claim.claimKind} ${claim.finalStatus}`.toLowerCase(),
  )}">
  <header class="record-context">
    <p class="record-eyebrow"><a class="record-anchor" href="#${escapeHtml(
      claim.claimId,
    )}"><span class="ref">${escapeHtml(claim.sourceWork)} ${escapeHtml(claim.stephanusSpan)}</span></a>${speakerSuffix}</p>
    <div class="badges">
      ${badge(titleCase(claim.claimKind))}
      ${badge(titleCase(claim.finalStatus), `status-${claim.finalStatus}`)}
      ${statusChip(claim.reviewStatus)}
    </div>
  </header>
  <p class="record-lead">${escapeHtml(claim.content)}</p>
  <p><strong>Limits.</strong> ${escapeHtml(claim.limits)}</p>
  <p class="terms">${claim.greekTerms.map((term) => `<span class="badge" lang="grc">${escapeHtml(term)}</span>`).join(" ")}</p>
  ${stanceLine}
  ${sourceOpenButton(claim.claimId)}
  ${sourceDialog({
    recordId: claim.claimId,
    pagePath,
    data,
    dialogue: claim.dialogue,
    span: claim.stephanusSpan,
    startMarker: claim.sourceRef.startMarker,
    greek,
    turnIds: [],
  })}
</article>`;
}

function relationCard(pagePath: string, data: SiteData, relation: SiteRelation) {
  return `<article class="record" id="${escapeHtml(relation.relationId)}" data-dialogue="${escapeHtml(
    relation.dialogue,
  )}" data-status="${escapeHtml(relation.reviewStatus)}" data-search="${escapeHtml(
    `${relation.relationId} ${relation.relationKind} ${relation.resolution} ${relation.basis}`.toLowerCase(),
  )}">
  <header class="record-context">
    <p class="record-eyebrow">${claimLink(pagePath, data, relation.claimA)} ↔ ${claimLink(
      pagePath,
      data,
      relation.claimB,
    )} <a class="record-anchor" href="#${escapeHtml(relation.relationId)}"><span class="ref">${escapeHtml(
      relation.relationId,
    )}</span></a></p>
    <div class="badges">
      ${badge(titleCase(relation.relationKind))}
      ${badge(titleCase(relation.resolution), `status-${relation.resolution}`)}
      ${statusChip(relation.reviewStatus)}
    </div>
  </header>
  <p class="record-lead">${escapeHtml(relation.basis)}</p>
  <p><strong>Limits.</strong> ${escapeHtml(relation.limits)}</p>
</article>`;
}

function spineDisplayText(text: string) {
  return text.replace(/\{[^}]*\}/gu, " ").replace(/\s+/gu, " ").trim();
}

// Claim/relation lookups by id, built once per SiteData so cite labels can
// carry human-readable summaries instead of raw record IDs.
const recordLookupCache = new WeakMap<
  SiteData,
  { claims: Map<string, SiteClaim>; relations: Map<string, SiteRelation> }
>();

function recordLookups(data: SiteData) {
  let lookups = recordLookupCache.get(data);
  if (!lookups) {
    lookups = {
      claims: new Map(data.claims.map((claim) => [claim.claimId, claim])),
      relations: new Map(data.relations.map((relation) => [relation.relationId, relation])),
    };
    recordLookupCache.set(data, lookups);
  }
  return lookups;
}

function targetLink(pagePath: string, target: string, label: string) {
  const parsed = splitTarget(target);
  return pageLink(pagePath, parsed.path, label, parsed.hash);
}

// Cited records fold: a compact count that opens into described links. Raw
// record IDs stay out of the reading surface; the fragments still carry them.
function commentaryCitesFold(pagePath: string, data: SiteData, block: SiteCommentaryBlock) {
  const lookups = recordLookups(data);
  const item = (target: string | undefined, label: string) =>
    `<li>${target ? targetLink(pagePath, target, label) : escapeHtml(label)}</li>`;
  const items = [
    ...block.cites.observations.map((id) => {
      const observation = data.observationsById.get(id);
      if (!observation) return `<li>${escapeHtml(id)}</li>`;
      return item(
        data.observationPageById.get(id),
        `${titleCase(observation.featureLabel)} — ${observation.sourceWork} ${observation.stephanusSpan}`,
      );
    }),
    ...block.cites.claims.map((id) => {
      const claim = lookups.claims.get(id);
      if (!claim) return `<li>${escapeHtml(id)}</li>`;
      return item(
        data.claimPageById.get(id),
        `${titleCase(claim.claimKind)} claim — ${claim.sourceWork} ${claim.stephanusSpan}`,
      );
    }),
    ...block.cites.relations.map((id) => {
      const relation = lookups.relations.get(id);
      if (!relation) return `<li>${escapeHtml(id)}</li>`;
      return item(
        data.relationPageById.get(id),
        `${titleCase(relation.relationKind)} relation — ${titleCase(relation.dialogue)}`,
      );
    }),
    ...block.cites.dossiers.map((entry) => {
      const [family, label] = entry.split("/");
      const dossier = data.dossiers.find((candidate) => candidate.family === family && candidate.label === label);
      const text = `${titleCase(label ?? entry)} dossier`;
      return dossier ? `<li>${pageLink(pagePath, dossier.pagePath, text, `#${dossier.dossierId}`)}</li>` : `<li>${escapeHtml(text)}</li>`;
    }),
  ];
  if (items.length === 0) return "";
  return `<details class="cites"><summary>Cites ${items.length} record${items.length === 1 ? "" : "s"}</summary><ul class="cite-list">${items.join("")}</ul></details>`;
}

function commentaryCrossrefLines(pagePath: string, block: SiteCommentaryBlock) {
  if (block.crossrefs.length === 0) return "";
  const items = block.crossrefs
    .map((crossref) => {
      const slug = workNameToSlug(crossref.sourceWork);
      const link = pageLink(pagePath, `dialogues/${slug}/index.html`, crossref.sourceWork);
      const note = crossref.note ? ` — ${escapeHtml(crossref.note)}` : "";
      return `<li>${link} <span>${escapeHtml(crossref.stephanusSpan)}</span>${note}</li>`;
    })
    .join("");
  return `<ul class="source-list crossrefs">${items}</ul>`;
}

function commentaryAttribution(block: SiteCommentaryBlock) {
  return `<span class="commentary-author">${escapeHtml(titleCase(block.author))} commentary</span>`;
}

// ---------------------------------------------------------------------------
// Margin entries. Every item right of the hairline shares one pattern
// (the two-track reading layout): a small mono Stephanus locator line above, then a clickable
// title row (kind mark + title; records add a right-aligned span), then the
// body inside the details. Exclusive-open per unit rides the native details
// name attribute; cites folds stay OUT of the group — sharing it would close
// the parent entry the moment a reader opened its citations.
// ---------------------------------------------------------------------------

function marginGroupName(section: SiteCommentaryBlock) {
  return `margin-${section.commentaryId}`;
}

function slotGroupHtml(marker: string, entries: readonly string[], cls = "") {
  return `<div class="slot-group${cls}">
  <p class="slot-loc"><a href="#loc-${escapeHtml(marker)}">${escapeHtml(marker)}</a></p>
  ${entries.join("\n  ")}
</div>`;
}

// The section's own commentary: the title IS the entry, the locator carries
// the section's whole Stephanus range, and the byline renders once inside the
// opened body. The unit <section> element keeps the commentary id (chapter
// jumps and exact-ID shards target it); neither sec-head copy may carry it —
// the head renders twice (desktop margin cell + container-query mobile copy).
function sectionEntryHtml(
  pagePath: string,
  data: SiteData,
  section: SiteCommentaryBlock,
  locatorHref: string | undefined,
  variant: "sec-desktop" | "sec-mobile",
) {
  const label = section.title ? section.title : section.stephanusSpan;
  // A section whose span starts on another shard resolves its locator through
  // the marker-path registry, exactly as milestones do; an unresolved marker
  // degrades to a plain span.
  const locator = locatorHref
    ? `<a href="${locatorHref}">${escapeHtml(section.stephanusSpan)}</a>`
    : `<span>${escapeHtml(section.stephanusSpan)}</span>`;
  return `<div class="sec-head ${variant}">
  <p class="slot-loc">${locator}</p>
  <details class="entry commentary" name="${escapeHtml(marginGroupName(section))}">
    <summary><span class="mark mark-commentary"></span><span class="entry-label section-label">${escapeHtml(
      label,
    )}</span></summary>
    <div class="entry-body">
      <p>${escapeHtml(section.body)}</p>
      ${commentaryCitesFold(pagePath, data, section)}
      ${commentaryCrossrefLines(pagePath, section)}
      <p class="entry-attr">${commentaryAttribution(section)}${statusChip(section.reviewStatus)}</p>
    </div>
  </details>
</div>`;
}

// Non-section blocks (notice, argument, crossref …) are slot-grouped entries
// at their anchor marker, labeled by title when authored, kind otherwise.
function noteEntryHtml(pagePath: string, data: SiteData, section: SiteCommentaryBlock, block: SiteCommentaryBlock) {
  const label = block.title ? block.title : titleCase(block.blockKind);
  return `<details class="entry commentary" name="${escapeHtml(marginGroupName(section))}" id="${escapeHtml(
    block.commentaryId,
  )}">
    <summary><span class="mark mark-commentary"></span><span class="entry-label">${escapeHtml(label)}</span></summary>
    <div class="entry-body">
      <p>${escapeHtml(block.body)}</p>
      ${commentaryCitesFold(pagePath, data, block)}
      ${commentaryCrossrefLines(pagePath, block)}
      <p class="entry-attr">${escapeHtml(titleCase(block.blockKind))} — ${commentaryAttribution(block)}${statusChip(
        block.reviewStatus,
      )}</p>
    </div>
  </details>`;
}

type MarginRecord = {
  id: string;
  kind: "observation" | "claim";
  label: string;
  target: string;
  lead: string;
  work: string;
  span: string;
};

type MarginCandidate = MarginRecord & { startChar: number };

// Accepted observations and claims for a dialogue, sorted once so per-row margin
// computation is a bounded slice rather than a full-corpus filter per spine row.
// Keyed by the SiteData identity (readSiteData mints fresh per build).
const marginCandidateCache = new WeakMap<SiteData, Map<string, MarginCandidate[]>>();

function marginCandidates(data: SiteData, dialogue: string): MarginCandidate[] {
  let byDialogue = marginCandidateCache.get(data);
  if (!byDialogue) {
    byDialogue = new Map();
    marginCandidateCache.set(data, byDialogue);
  }
  const cached = byDialogue.get(dialogue);
  if (cached) return cached;
  const candidates: MarginCandidate[] = [];
  for (const observation of data.observations) {
    if (observation.dialogue !== dialogue || observation.reviewStatus !== "accepted") continue;
    const target = data.observationPageById.get(observation.observationId);
    if (!target) continue;
    candidates.push({
      id: observation.observationId,
      kind: "observation",
      label: titleCase(observation.featureLabel),
      target,
      lead: observation.observation,
      work: observation.sourceWork,
      span: observation.stephanusSpan,
      startChar: observation.sourceRef.startChar,
    });
  }
  for (const claim of data.claims) {
    if (claim.dialogue !== dialogue || claim.reviewStatus !== "accepted") continue;
    const target = data.claimPageById.get(claim.claimId);
    if (!target) continue;
    candidates.push({
      id: claim.claimId,
      kind: "claim",
      label: titleCase(claim.claimKind),
      target,
      lead: claim.content,
      work: claim.sourceWork,
      span: claim.stephanusSpan,
      startChar: claim.sourceRef.startChar,
    });
  }
  candidates.sort(
    (a, b) =>
      a.startChar - b.startChar ||
      (a.kind === b.kind ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) : a.kind === "observation" ? -1 : 1),
  );
  byDialogue.set(dialogue, candidates);
  return candidates;
}

// A record surfaces only on the FIRST marker slot it intersects (its startChar
// in [rangeStart, rangeEnd)), so a long span does not repeat down the page.
function marginRecordsForRange(
  data: SiteData,
  dialogue: string,
  rangeStart: number,
  rangeEnd: number,
): MarginRecord[] {
  return marginCandidates(data, dialogue)
    .filter((candidate) => candidate.startChar >= rangeStart && candidate.startChar < rangeEnd)
    .map(({ id, kind, label, target, lead, work, span }) => ({ id, kind, label, target, lead, work, span }));
}

// The critical signs of the Alexandrian grammarians. This kind→sign table is a
// public visual contract once apparatus data ships; changing a glyph re-teaches
// returning readers. An unknown kind is a build error (fail closed).
const APPARATUS_SIGNS: Record<SiteApparatusRecord["kind"], { glyph: string; name: string }> = {
  surface_tension: { glyph: "†", name: "obelus" },
  structural_marker: { glyph: "※", name: "asteriskos" },
  address_shift: { glyph: "»", name: "diple" },
};

function apparatusSign(kind: SiteApparatusRecord["kind"]) {
  const sign = APPARATUS_SIGNS[kind];
  if (!sign) throw new Error(`No apparatus sign for kind ${kind}.`);
  return sign;
}

// ---------------------------------------------------------------------------
// Reading spine: turn-aligned verses.
//
// The raw Greek and English texts are newline-separated speaker turns (or
// narration paragraphs) with inline {marker} tokens. The reading view renders
// those lines as paragraphs — never splitting a turn at a Stephanus boundary —
// and keeps the two languages aligned by pairing lines inside "sync blocks":
// maximal runs after which both languages have consumed the same shared
// markers. Blocks with equal line counts pair turn-by-turn; unequal blocks
// (narrated texts, translator merges) fall back to block-level alignment.
// Stephanus markers live in the margin rail (one anchored slot per marker)
// and as small inline milestones where a marker falls mid-line.
// ---------------------------------------------------------------------------

const MARKER_TOKEN_PATTERN = /\{(\d+[a-e])\}/gu;
const BRACE_TOKEN_PATTERN = /\{[^}]*\}/gu;

// Every {…} token is markup, not text: canonical Stephanus markers become
// milestones (or rail-only anchors when line-initial); all other tokens —
// {place}, {/place}, and whatever else the importer preserved — never render.
type ReadingToken = { marker: string | null; offset: number; length: number; lineInitial: boolean };

type ReadingSpeaker = { start: number; length: number; display: string };

type ReadingLine = {
  text: string;
  startChar: number;
  tokens: ReadingToken[];
  speaker?: ReadingSpeaker;
};

type ReadingVerse = {
  greek: ReadingLine[];
  english: ReadingLine[];
  startChar: number;
  markers: string[];
};

type DialogueReadingLayout = {
  hasEnglish: boolean;
  verses: ReadingVerse[];
  markerRanges: Map<string, { startChar: number; endChar: number }>;
};

function splitReadingLines(stream: string, baseChar: number, canonical: ReadonlySet<string>): ReadingLine[] {
  const lines: ReadingLine[] = [];
  let offset = 0;
  for (const raw of stream.split("\n")) {
    const tokens: ReadingToken[] = [];
    for (const match of raw.matchAll(BRACE_TOKEN_PATTERN)) {
      const markerMatch = /^\{(\d+[a-e])\}$/u.exec(match[0]!);
      const marker = markerMatch?.[1] && canonical.has(markerMatch[1]) ? markerMatch[1] : null;
      const before = raw.slice(0, match.index ?? 0);
      tokens.push({
        marker,
        offset: match.index ?? 0,
        length: match[0]!.length,
        lineInitial: /^(?:\s|\{[^}]*\})*$/u.test(before),
      });
    }
    if (raw.replace(BRACE_TOKEN_PATTERN, "").trim().length > 0 || tokens.some((token) => token.marker !== null)) {
      lines.push({ text: raw, startChar: baseChar + offset, tokens });
    }
    offset += raw.length + 1;
  }
  return lines;
}

// Attach a speaker label when a line opens with a known printed form (a Greek
// siglum, or the translation's abbreviation) after any leading markers.
function matchLineSpeakers(lines: ReadingLine[], labels: ReadonlyMap<string, string>) {
  if (labels.size === 0) return;
  const forms = [...labels.keys()].sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
  for (const line of lines) {
    const bodyStart = /^(?:\s|\{[^}]*\})*/u.exec(line.text)?.[0]?.length ?? 0;
    for (const form of forms) {
      if (!line.text.startsWith(form, bodyStart)) continue;
      const after = line.text.charAt(bodyStart + form.length);
      if (after !== "" && !/\s/u.test(after)) continue;
      line.speaker = { start: bodyStart, length: form.length, display: labels.get(form) ?? form };
      break;
    }
  }
}

// Pair Greek and English lines inside marker-sync blocks. Markers missing from
// the translation do not participate in the sync count.
function alignReadingBlocks(
  greek: readonly ReadingLine[],
  english: readonly ReadingLine[],
  shared: ReadonlySet<string>,
): Array<{ greek: ReadingLine[]; english: ReadingLine[] }> {
  const sharedCount = (line: ReadingLine) =>
    line.tokens.filter((token) => token.marker !== null && shared.has(token.marker)).length;
  const blocks: Array<{ greek: ReadingLine[]; english: ReadingLine[] }> = [];
  let greekIndex = 0;
  let englishIndex = 0;
  let greekConsumed = 0;
  let englishConsumed = 0;
  while (greekIndex < greek.length || englishIndex < english.length) {
    const greekStart = greekIndex;
    const englishStart = englishIndex;
    do {
      if (greekIndex < greek.length && (greekConsumed < englishConsumed || englishIndex >= english.length)) {
        greekConsumed += sharedCount(greek[greekIndex]!);
        greekIndex += 1;
      } else if (englishIndex < english.length && (englishConsumed < greekConsumed || greekIndex >= greek.length)) {
        englishConsumed += sharedCount(english[englishIndex]!);
        englishIndex += 1;
      } else {
        greekConsumed += sharedCount(greek[greekIndex]!);
        greekIndex += 1;
        englishConsumed += sharedCount(english[englishIndex]!);
        englishIndex += 1;
      }
    } while (
      (greekConsumed !== englishConsumed || (greekIndex === greekStart && englishIndex === englishStart)) &&
      (greekIndex < greek.length || englishIndex < english.length)
    );
    blocks.push({ greek: greek.slice(greekStart, greekIndex), english: english.slice(englishStart, englishIndex) });
  }
  return blocks;
}

const readingLayoutCache = new WeakMap<SiteData, Map<string, DialogueReadingLayout>>();

function dialogueReadingLayout(data: SiteData, commentary: SiteCommentaryDialogue): DialogueReadingLayout {
  let byDialogue = readingLayoutCache.get(data);
  if (!byDialogue) {
    byDialogue = new Map();
    readingLayoutCache.set(data, byDialogue);
  }
  const cached = byDialogue.get(commentary.dialogue);
  if (cached) return cached;

  const rows = commentary.spine;
  const canonical = new Set(rows.map((row) => row.marker));
  const baseChar = rows[0]?.startChar ?? 0;
  const greekStream = rows.map((row) => row.greek).join("");
  const hasEnglish = rows.some((row) => row.english !== undefined);
  // Defined English slices are contiguous (a missing marker's text joins the
  // preceding slice), so their concatenation reconstructs the English stream.
  const englishStream = hasEnglish
    ? rows.flatMap((row) => (row.english === undefined ? [] : [row.english])).join("")
    : "";

  const greekLines = splitReadingLines(greekStream, baseChar, canonical);
  const englishLines = hasEnglish ? splitReadingLines(englishStream, 0, canonical) : [];

  const greekSigla = new Map<string, string>();
  for (const speakerRow of data.derivedByDialogue.get(commentary.dialogue)?.speakers ?? []) {
    const siglum = speakerRow.speaker ?? "";
    if (/^\p{Script=Greek}/u.test(siglum)) greekSigla.set(siglum, siglum);
  }
  matchLineSpeakers(greekLines, greekSigla);
  if (hasEnglish) {
    matchLineSpeakers(englishLines, new Map(Object.entries(englishSpeakerLabels(commentary.dialogue))));
  }

  const shared = new Set(
    [...englishStream.matchAll(MARKER_TOKEN_PATTERN)]
      .map((match) => match[1]!)
      .filter((marker) => canonical.has(marker)),
  );
  const blocks = alignReadingBlocks(greekLines, englishLines, shared);

  const verses: ReadingVerse[] = [];
  let cursor = baseChar;
  for (const block of blocks) {
    const paired = block.greek.length > 0 && block.greek.length === block.english.length;
    if (paired) {
      for (const [index, greekLine] of block.greek.entries()) {
        verses.push({
          greek: [greekLine],
          english: [block.english[index]!],
          startChar: greekLine.startChar,
          markers: greekLine.tokens.flatMap((token) => (token.marker === null ? [] : [token.marker])),
        });
      }
    } else {
      verses.push({
        greek: block.greek,
        english: block.english,
        startChar: block.greek[0]?.startChar ?? cursor,
        markers: block.greek.flatMap((line) =>
          line.tokens.flatMap((token) => (token.marker === null ? [] : [token.marker])),
        ),
      });
    }
    const lastGreek = block.greek.at(-1);
    if (lastGreek) cursor = lastGreek.startChar + lastGreek.text.length;
  }

  const markerRanges = new Map<string, { startChar: number; endChar: number }>();
  const lastRow = rows.at(-1);
  const streamEnd = lastRow ? lastRow.startChar + lastRow.greek.length : baseChar;
  for (const [index, row] of rows.entries()) {
    markerRanges.set(row.marker, {
      startChar: row.startChar,
      endChar: rows[index + 1]?.startChar ?? streamEnd,
    });
  }

  const layout: DialogueReadingLayout = { hasEnglish, verses, markerRanges };
  byDialogue.set(commentary.dialogue, layout);
  return layout;
}

// A rejected section must not make accepted commentary disappear with it. The
// source/placement order is the only fallback authority here: a before note
// moves to the next visible section, while an after note moves to the previous
// visible section. Exact marker containment wins when a visible section still
// covers the note's source marker. The note's source_ref is left untouched.
function readingPlacements(
  layout: DialogueReadingLayout,
  sections: readonly SiteCommentaryBlock[],
  others: readonly SiteCommentaryBlock[],
): ReadonlyMap<string, ReadingPlacement[]> {
  const placements = new Map<string, ReadingPlacement[]>(sections.map((section) => [section.commentaryId, []]));
  const markersFor = (section: SiteCommentaryBlock) =>
    layout.verses
      .filter((verse) => verse.startChar >= section.sourceRef.startChar && verse.startChar < section.sourceRef.endChar)
      .flatMap((verse) => verse.markers);
  const sectionMarkers = new Map(sections.map((section) => [section.commentaryId, markersFor(section)]));
  const exactSection = (block: SiteCommentaryBlock, marker: string) =>
    sections.find((section) => sectionMarkers.get(section.commentaryId)?.includes(marker));

  for (const block of others) {
    const sourceMarker = block.placement === "after" ? block.sourceRef.endMarker : block.sourceRef.startMarker;
    let section = exactSection(block, sourceMarker);
    if (!section) {
      section = sections.find(
        (candidate) =>
          candidate.sourceRef.startChar <= block.sourceRef.startChar &&
          candidate.sourceRef.endChar >= block.sourceRef.endChar,
      );
    }
    if (!section) {
      const sourceChar = block.sourceRef.startChar;
      if (block.placement === "after") {
        section = [...sections].reverse().find((candidate) => candidate.sourceRef.endChar <= sourceChar) ?? sections[0];
      } else {
        section = sections.find((candidate) => candidate.sourceRef.startChar >= sourceChar) ?? sections.at(-1);
      }
    }
    if (!section) continue;
    const sectionMarkersForBlock = sectionMarkers.get(section.commentaryId) ?? [];
    const anchorMarker = sectionMarkersForBlock.includes(sourceMarker)
      ? sourceMarker
      : block.placement === "after"
        ? sectionMarkersForBlock.at(-1)
        : sectionMarkersForBlock[0];
    placements.get(section.commentaryId)!.push({ block, anchorMarker });
  }
  return placements;
}

// Render one raw line: escape text, drop line-initial marker tokens (the rail
// carries them), replace mid-line tokens with milestone links, and swap the
// printed speaker form for its label span. A milestone's rail slot can sit on
// another shard (the slot anchors to the GREEK token, and a paired block may
// straddle a page split), so hrefs go through the marker-path resolver; a
// marker with no rendered slot degrades to a plain span.
function readingLineHtml(
  line: ReadingLine,
  lang: "grc" | "en",
  resolveMilestoneHref: (marker: string) => string | undefined,
): string {
  type Segment = { start: number; end: number; html: string };
  const milestone = (marker: string) => {
    const href = resolveMilestoneHref(marker);
    return href
      ? `<a class="milestone" href="${href}">${escapeHtml(marker)}</a>`
      : `<span class="milestone">${escapeHtml(marker)}</span>`;
  };
  const segments: Segment[] = line.tokens.map((token) => ({
    start: token.offset,
    end: token.offset + token.length,
    html: token.marker === null || token.lineInitial ? "" : milestone(token.marker),
  }));
  if (line.speaker) {
    segments.push({
      start: line.speaker.start,
      end: line.speaker.start + line.speaker.length,
      html: `<span class="speaker">${escapeHtml(line.speaker.display)}</span>`,
    });
  }
  segments.sort((a, b) => a.start - b.start);
  let html = "";
  let cursor = 0;
  const emitText = (from: number, to: number) => {
    if (to <= from) return;
    const text = line.text.slice(from, to);
    html += escapeHtml(html === "" ? text.replace(/^\s+/u, "") : text);
  };
  for (const segment of segments) {
    emitText(cursor, segment.start);
    html += segment.html;
    cursor = segment.end;
    // A dropped markup token often sits between a word and its punctuation
    // ("Athens {/place} ,"); swallow the stranded whitespace so punctuation
    // rejoins the word it belongs to.
    if (segment.html === "") {
      const following = /^\s+(?=[,;.:!?·])/u.exec(line.text.slice(cursor));
      if (following) {
        html = html.replace(/\s+$/u, "");
        cursor += following[0].length;
      }
    }
  }
  emitText(cursor, line.text.length);
  if (html.trim() === "") return "";
  return lang === "grc" ? `<p lang="grc">${html}</p>` : `<p>${html}</p>`;
}

function apparatusRecordsForRow(
  data: SiteData,
  dialogue: string,
  rowStart: number,
  rowEnd: number,
): SiteApparatusRecord[] {
  return (data.apparatusByDialogue.get(dialogue) ?? []).filter(
    (record) => record.sourceRef.startChar >= rowStart && record.sourceRef.startChar < rowEnd,
  );
}

// Apparatus notes are margin entries in the shared pattern; their signs stay
// in the rail (they are marks OF the text) and link down to the entry. The
// apparatus lane belongs to neither reader toggle, so its groups carry
// for-app and always render.
function apparatusEntryHtml(
  pagePath: string,
  data: SiteData,
  section: SiteCommentaryBlock,
  record: SiteApparatusRecord,
) {
  const sign = apparatusSign(record.kind);
  const citeLinks = [
    ...record.cites.observations.map((id) => {
      const observation = data.observationsById.get(id);
      return observation ? observationLink(pagePath, data, observation) : escapeHtml(id);
    }),
    ...record.cites.claims.map((id) => claimLink(pagePath, data, id)),
    ...record.cites.relations.map((id) => relationLink(pagePath, data, id)),
    ...record.cites.dossiers.map((entry) => {
      const [family, label] = entry.split("/");
      const dossier = data.dossiers.find((candidate) => candidate.family === family && candidate.label === label);
      return dossierLink(pagePath, dossier, entry);
    }),
  ];
  const cites = citeLinks.length ? `<p class="cites"><strong>Cites.</strong> ${citeLinks.join(", ")}</p>` : "";
  return `<details class="entry apparatus" name="${escapeHtml(marginGroupName(section))}" id="${escapeHtml(
    record.apparatusId,
  )}" lang="en">
    <summary><span class="mark mark-sign">${sign.glyph}</span><span class="entry-label">${escapeHtml(
      titleCase(sign.name),
    )}</span><span class="entry-ref">${escapeHtml(record.stephanusSpan)}</span></summary>
    <div class="entry-body">
      <p>${escapeHtml(record.note)}</p>
      ${cites}
    </div>
  </details>`;
}

function recordingPlayer(data: SiteData, commentary: SiteCommentaryDialogue, pagePath: string) {
  const recording = data.recordingsByDialogue.get(commentary.dialogue);
  if (!recording) {
    return `<p class="dim recording-unavailable">Production recording unavailable.</p>`;
  }

  const audioId = `recording-audio-${recording.dialogue}`;
  const statusId = `recording-player-status-${recording.dialogue}`;
  const assetSource = `${pathToRoot(pagePath)}${recording.siteAssetPath}`;
  const recordingKind = recording.status === "accepted" ? "Accepted recording" : "Review candidate";
  const sectionsById = new Map(
    commentary.blocks
      .filter((block) => block.blockKind === "section" && block.reviewStatus === "accepted")
      .map((block) => [block.commentaryId, block]),
  );
  const chapterButtons = recording.chapters
    .map((chapter, index) => {
      const section = sectionsById.get(chapter.commentary_id);
      if (!section) {
        throw new Error(
          `${recordingKind} ${recording.recordingId} chapter target is not rendered: ${chapter.commentary_id}.`,
        );
      }
      const title = chapter.title ?? section.title ?? `Chapter ${index + 1}`;
      const startSeconds = chapter.start_frame / 48_000;
      const time = formatRecordingTime(startSeconds);
      const target = data.commentaryPageById.get(chapter.commentary_id);
      if (!target) {
        throw new Error(
          `${recordingKind} ${recording.recordingId} chapter target has no generated reading page: ${chapter.commentary_id}.`,
        );
      }
      const targetHref = `${pathToRoot(pagePath)}${target}`;
      return `<button type="button" class="chapter-button" data-recording-chapter data-chapter-id="${escapeHtml(chapter.chapter_id)}" data-chapter-frame="${chapter.start_frame}" data-chapter-seconds="${startSeconds}" data-chapter-target="${escapeHtml(chapter.commentary_id)}" data-chapter-href="${escapeHtml(targetHref)}" aria-controls="${audioId}" aria-label="Seek to ${escapeHtml(title)} at ${time}">
  <span>${escapeHtml(title)}</span><time>${time}</time>
</button>`;
    })
    .join("\n");

  // The recording ID stays in data attributes for resume storage and audits;
  // the reader-facing label is the acceptance status alone.
  const statusBadge =
    recording.status === "accepted"
      ? badge("Production recording", "status-accepted")
      : badge("Review candidate", "status-review-candidate");
  const acceptanceNotice =
    recording.status === "draft"
      ? '<p class="recording-review-notice">This review candidate has not passed final production acceptance.</p>'
      : "";

  return `<section class="panel recording-player" id="recording-player" data-recording-player data-recording-acceptance-status="${recording.status}" data-recording-id="${escapeHtml(recording.recordingId)}" data-recording-dialogue="${escapeHtml(recording.dialogue)}" data-audio-sha256="${recording.audioSha256}" data-recording-asset="${escapeHtml(assetSource)}">
  <div class="recording-heading">
    <div class="recording-title"><h2>Listen</h2>${statusBadge}</div>
    <audio id="${audioId}" controls preload="metadata" data-recording-audio aria-describedby="${statusId}">
      <source src="${escapeHtml(assetSource)}" type="${escapeHtml(recording.mimeType)}">
      Your browser does not support HTML audio.
    </audio>
  </div>
  <p id="${statusId}" class="recording-status" role="status" aria-live="polite" data-recording-status>Loading recording metadata…</p>
  ${acceptanceNotice}
  <details class="chapter-fold">
    <summary>Chapters<b class="n">${recording.chapters.length}</b></summary>
    <div class="recording-chapters" role="group" aria-label="Recording chapters">
    ${chapterButtons}
    </div>
  </details>
</section>`;
}

// A record's margin entry: collapsed to kind mark + label + span; the lead
// and Full record link open in a floating card, so the dialogue never moves.
function recordEntryHtml(pagePath: string, section: SiteCommentaryBlock, record: MarginRecord) {
  return `<details class="entry rec" name="${escapeHtml(marginGroupName(section))}">
    <summary><span class="mark mark-${record.kind}"></span><span class="entry-label">${escapeHtml(
      record.label,
    )}</span><span class="entry-ref">${escapeHtml(record.span)}</span></summary>
    <div class="entry-body">
      <p>${escapeHtml(record.lead)}</p>
      <p class="entry-act">${targetLink(pagePath, record.target, "Full record")}</p>
    </div>
  </details>`;
}

function readingUnit(
  data: SiteData,
  commentary: SiteCommentaryDialogue,
  layout: DialogueReadingLayout,
  section: SiteCommentaryBlock,
  placements: readonly ReadingPlacement[],
  pagePath: string,
): ReadingUnit {
  const commentaryIds = [section.commentaryId];
  const markers: string[] = [];
  const verses = layout.verses.filter(
    (verse) => verse.startChar >= section.sourceRef.startChar && verse.startChar < section.sourceRef.endChar,
  );
  // During the planning pass no marker paths are registered yet and every
  // milestone renders as a local fragment; the final render pass resolves
  // cross-shard targets. Page splitting is decided on the planning sizes, so
  // the output stays deterministic.
  const resolveMilestoneHref = (marker: string): string | undefined => {
    const target = readingMarkerPath(data, commentary.dialogue, marker);
    if (target === undefined) return undefined;
    const local = `#loc-${escapeHtml(marker)}`;
    return target === pagePath ? local : `${pathToRoot(pagePath)}${escapeHtml(target)}${local}`;
  };

  const firstMarker = verses.find((verse) => verse.markers.length > 0)?.markers[0] ?? section.sourceRef.startMarker;
  const sectionLocatorHref = resolveMilestoneHref(firstMarker);
  const noteGroup = (block: SiteCommentaryBlock, marker: string) =>
    slotGroupHtml(marker, [noteEntryHtml(pagePath, data, section, block)], " for-comm");

  const rows: string[] = [];
  let sectionHeadPlaced = false;
  const renderedPlacementIds = new Set<string>();
  for (const verse of verses) {
    markers.push(...verse.markers);
    const before = placements.filter(
      ({ block, anchorMarker }) => block.placement === "before" && anchorMarker !== undefined && verse.markers.includes(anchorMarker),
    );
    const after = placements.filter(
      ({ block, anchorMarker }) => block.placement === "after" && anchorMarker !== undefined && verse.markers.includes(anchorMarker),
    );
    commentaryIds.push(...before.map(({ block }) => block.commentaryId), ...after.map(({ block }) => block.commentaryId));
    for (const { block } of [...before, ...after]) renderedPlacementIds.add(block.commentaryId);

    const slots = verse.markers.map((marker) => {
      const range = layout.markerRanges.get(marker);
      if (!range) throw new Error(`Reading layout for ${commentary.dialogue} lost marker ${marker}.`);
      const records = marginRecordsForRange(data, commentary.dialogue, range.startChar, range.endChar);
      const apparatus = apparatusRecordsForRow(data, commentary.dialogue, range.startChar, range.endChar);
      return { marker, records, rendered: records.length <= 4 ? records : records.slice(0, 3), apparatus };
    });
    // The rail keeps Stephanus locators and critical signs — edition
    // furniture only. Record dots are gone; records are named entries in the
    // margin column.
    const railHtml = slots
      .map(({ marker, apparatus }) => {
        const signMarks = apparatus.map((record) => {
          const sign = apparatusSign(record.kind);
          const title = `${sign.name} at ${record.stephanusSpan}`;
          return `<a class="mark mark-sign" href="#${escapeHtml(record.apparatusId)}" title="${escapeHtml(
            title,
          )}" aria-label="${escapeHtml(title)}">${sign.glyph}</a>`;
        });
        return `<span class="loc-slot" id="loc-${escapeHtml(marker)}"><a class="loc" href="#loc-${escapeHtml(
          marker,
        )}">${escapeHtml(marker)}</a>${signMarks.join("")}</span>`;
      })
      .join("");

    const greekParagraphs = verse.greek
      .map((line) => readingLineHtml(line, "grc", resolveMilestoneHref))
      .filter(Boolean)
      .join("\n");
    const englishParagraphs = verse.english
      .map((line) => readingLineHtml(line, "en", resolveMilestoneHref))
      .filter(Boolean)
      .join("\n");
    if (slots.length === 0 && greekParagraphs === "" && englishParagraphs === "") continue;

    const marginParts: string[] = [];
    if (!sectionHeadPlaced) {
      marginParts.push(sectionEntryHtml(pagePath, data, section, sectionLocatorHref, "sec-desktop"));
      sectionHeadPlaced = true;
    }
    marginParts.push(...before.map(({ block, anchorMarker }) => noteGroup(block, anchorMarker!)));
    for (const { marker, records, rendered } of slots) {
      if (records.length === 0) continue;
      const entries = rendered.map((record) => recordEntryHtml(pagePath, section, record));
      if (records.length > rendered.length) {
        const overflow = records.slice(rendered.length);
        const recordsPage = splitTarget(overflow[0]!.target).path;
        entries.push(
          `<a class="entry-more" href="${pathToRoot(pagePath)}${escapeHtml(recordsPage)}">${overflow.length} more records</a>`,
        );
      }
      marginParts.push(slotGroupHtml(marker, entries));
    }
    for (const { marker, apparatus } of slots) {
      if (apparatus.length === 0) continue;
      marginParts.push(
        slotGroupHtml(marker, apparatus.map((record) => apparatusEntryHtml(pagePath, data, section, record)), " for-app"),
      );
    }
    marginParts.push(...after.map(({ block, anchorMarker }) => noteGroup(block, anchorMarker!)));

    const englishCell = layout.hasEnglish ? `\n    <div class="v-english">${englishParagraphs}</div>` : "";
    rows.push(`<div class="verse">
  <div class="v-margin">${railHtml}</div>
  <div class="v-text">
    <div class="v-greek">${greekParagraphs}</div>${englishCell}
  </div>
  <div class="v-notes">${marginParts.join("\n")}</div>
</div>`);
  }
  const unrendered = placements.filter(({ block }) => !renderedPlacementIds.has(block.commentaryId));
  commentaryIds.push(...unrendered.map(({ block }) => block.commentaryId));
  // A section whose span renders no verse rows still shows its commentary.
  if (!sectionHeadPlaced || unrendered.length > 0) {
    const fallbackNotes = unrendered.map(({ block }) => noteEntryHtml(pagePath, data, section, block));
    rows.push(`<div class="verse">
  <div class="v-margin"></div>
  <div class="v-text"></div>
  <div class="v-notes">${[!sectionHeadPlaced ? sectionEntryHtml(pagePath, data, section, sectionLocatorHref, "sec-desktop") : "", ...fallbackNotes].filter(Boolean).join("\n")}</div>
</div>`);
  }

  return {
    section,
    commentaryIds,
    markers,
    html: `<section class="unit" id="${escapeHtml(section.commentaryId)}">
${sectionEntryHtml(pagePath, data, section, sectionLocatorHref, "sec-mobile")}
${rows.join("\n")}
</section>`,
  };
}

function readingPath(dialogue: string, part: number) {
  return part === 1 ? `dialogues/${dialogue}/reading.html` : `dialogues/${dialogue}/reading-${part}.html`;
}

function planReadingPages(data: SiteData, targetBytes: number) {
  if (!Number.isSafeInteger(targetBytes) || targetBytes <= 0) {
    throw new Error("readingPageTargetBytes must be a positive safe integer.");
  }
  const plans: ReadingPagePlan[] = [];
  for (const commentary of [...data.commentaryByDialogue.values()].sort((a, b) =>
    a.dialogue.localeCompare(b.dialogue),
  )) {
    const visible = commentary.blocks.filter(
      (block) => block.reviewStatus === "accepted" || block.reviewStatus === "unreviewed",
    );
    const sections = visible.filter((block) => block.blockKind === "section");
    const others = visible.filter((block) => block.blockKind !== "section");
    if (sections.length === 0) {
      throw new Error(`Guided reading ${commentary.dialogue} has visible commentary but no section units.`);
    }
    const provisionalPath = readingPath(commentary.dialogue, 1);
    const readingLayout = dialogueReadingLayout(data, commentary);
    const placements = readingPlacements(readingLayout, sections, others);
    const units = sections.map((section) =>
      readingUnit(data, commentary, readingLayout, section, placements.get(section.commentaryId) ?? [], provisionalPath),
    );
    const seenIds = new Set<string>();
    for (const unit of units) {
      for (const commentaryId of unit.commentaryIds) {
        if (seenIds.has(commentaryId)) {
          throw new Error(`Guided reading ${commentary.dialogue} renders commentary ID ${commentaryId} more than once.`);
        }
        seenIds.add(commentaryId);
      }
    }
    const missingIds = visible
      .map((block) => block.commentaryId)
      .filter((commentaryId) => !seenIds.has(commentaryId));
    if (missingIds.length > 0) {
      throw new Error(
        `Guided reading ${commentary.dialogue} does not place visible commentary: ${missingIds.join(", ")}.`,
      );
    }

    const pageUnits: ReadingUnit[][] = [];
    let current: ReadingUnit[] = [];
    let currentBytes = 0;
    for (const unit of units) {
      const bytes = Buffer.byteLength(unit.html);
      if (current.length > 0 && currentBytes + bytes > targetBytes) {
        pageUnits.push(current);
        current = [];
        currentBytes = 0;
      }
      current.push(unit);
      currentBytes += bytes;
    }
    if (current.length > 0) pageUnits.push(current);

    for (const [index, page] of pageUnits.entries()) {
      plans.push({
        dialogue: commentary.dialogue,
        part: index + 1,
        partCount: pageUnits.length,
        path: readingPath(commentary.dialogue, index + 1),
        commentary,
        sections: page.map((unit) => unit.section),
        commentaryIds: page.flatMap((unit) => unit.commentaryIds),
        markers: page.flatMap((unit) => unit.markers),
      });
    }
  }

  data.commentaryPageById.clear();
  for (const plan of plans) {
    for (const commentaryId of plan.commentaryIds) {
      data.commentaryPageById.set(commentaryId, `${plan.path}#${commentaryId}`);
    }
  }
  return plans;
}

const MARKS_KEY = `<details class="marks-key">
  <summary>Key</summary>
  <div class="marks-key-panel">
    <p><span class="mark mark-observation"></span><span>Observation — a labeled feature of the text, anchored at its span. Open the entry for its lead and record link.</span></p>
    <p><span class="mark mark-claim"></span><span>Claim — content asserted in the text, recorded at its span.</span></p>
    <p><span class="mark mark-commentary"></span><span>Model commentary — a section title opens the model&#39;s introduction to that stretch; a note opens at its marker. Authored teaching material; the record layers do not depend on it.</span></p>
    <p><span class="key-sign">†</span><span>Obelus — surface tension noted in the apparatus</span></p>
    <p><span class="key-sign">※</span><span>Asteriskos — a structural marker</span></p>
    <p><span class="key-sign">»</span><span>Diple — a shift of address</span></p>
    <p class="dim">The marginal numbers are Stephanus pages. Opening a margin entry never moves the text.</p>
  </div>
</details>`;

function readingPage(data: SiteData, plan: ReadingPagePlan, dialoguePlans: readonly ReadingPagePlan[]) {
  const { commentary, dialogue, path: pagePath } = plan;
  const visible = commentary.blocks.filter(
    (block) => block.reviewStatus === "accepted" || block.reviewStatus === "unreviewed",
  );
  const others = visible.filter((block) => block.blockKind !== "section");
  const readingLayout = dialogueReadingLayout(data, commentary);
  const sections = visible.filter((block) => block.blockKind === "section");
  const placements = readingPlacements(readingLayout, sections, others);
  const unitsHtml = plan.sections
    .map((section) => readingUnit(data, commentary, readingLayout, section, placements.get(section.commentaryId) ?? [], pagePath).html)
    .join("\n");
  const languageControl = readingLayout.hasEnglish
    ? `<label class="tool-select">Text<select data-language-picker>
      <option value="english" selected>English</option>
      <option value="greek">Greek</option>
      <option value="both">Greek and English</option>
    </select></label>`
    : "";
  const readingTools = `<div class="reading-tools" data-reading-tools>
    ${languageControl}
    <label class="tool-check"><input type="checkbox" data-commentary-toggle checked> Commentary</label>
    <label class="tool-check"><input type="checkbox" data-margin-toggle checked> Margin records</label>
    ${MARKS_KEY}
  </div>`;
  const containerClass = readingLayout.hasEnglish ? "reading lang-english" : "reading lang-greek";
  const partSuffix = plan.partCount > 1 ? ` (part ${plan.part} of ${plan.partCount})` : "";
  const partLinks = plan.partCount > 1
    ? `<nav class="part-nav" aria-label="Reading pages">${dialoguePlans
        .map((entry) => entry.part === plan.part
          ? `<strong aria-current="page">${entry.part}</strong>`
          : pageLink(pagePath, entry.path, String(entry.part)))
        .join(" ")}</nav>`
    : "";

  // The whole page is one centered instrument: hero, Listen, toolbar, and
  // the reading grid share the centered track measure, and the wrapper is the
  // container the mobile stacking queries against.
  return layout(
    pagePath,
    `Reading ${titleCase(dialogue)}${partSuffix}`,
    `<div class="reading-page">
<section class="hero compact">
  <p>${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</p>
  <h1>Reading ${escapeHtml(titleCase(dialogue))}${escapeHtml(partSuffix)}</h1>
  <p class="epigraph">${escapeHtml(dialogueEpigraph(dialogue))}</p>
</section>
${partLinks}
${recordingPlayer(data, commentary, pagePath)}
${readingTools}
<div class="${containerClass}" data-reading>
${unitsHtml}
</div>
</div>`,
    navState(data),
  );
}

function countBy<T>(items: T[], key: (item: T) => string) {
  return [...groupBy(items, key).entries()].sort(([a], [b]) => a.localeCompare(b));
}

function statusCounts<T>(items: T[], key: (item: T) => string) {
  return countBy(items, key)
    .map(([status, entries]) => `${escapeHtml(status)}=${entries.length}`)
    .join(", ");
}

const READ_GLYPH = `<svg viewBox="0 0 180 104" aria-hidden="true" focusable="false">
  <path d="M12 15Q50 8 86 20V92Q50 80 12 88Z" fill="none" stroke="var(--line)" stroke-width="2"/>
  <path d="M168 15Q130 8 94 20V92Q130 80 168 88Z" fill="none" stroke="var(--line)" stroke-width="2"/>
  ${[32, 45, 58, 71]
    .map(
      (y) =>
        `<line x1="28" x2="74" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/><line x1="106" x2="152" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/>`,
    )
    .join("")}
  <rect x="18" y="42" width="6" height="6" rx="1" fill="var(--accent)"/>
  <rect x="18" y="68" width="6" height="6" rx="1" fill="var(--accent)"/>
</svg>`;

const PATTERN_FINGERPRINTS = [
  [0.18, 0, 0.45, 0.18, 0, 0.7, 0.3, 0, 0.18, 0.55, 0, 0.3],
  [0, 0.3, 0.18, 0, 0.55, 0.18, 0, 0.45, 0.3, 0, 0.7, 0.18],
  [0.7, 0.22, 0, 0.55, 0.9, 0, 0.4, 0.75, 0.22, 0, 1, 0.55],
  [0.18, 0, 0.3, 0.55, 0, 0.18, 0.45, 0, 0.7, 0.3, 0.18, 0],
];
const PATTERNS_GLYPH = `<svg viewBox="0 0 180 104" aria-hidden="true" focusable="false">
  ${PATTERN_FINGERPRINTS.flatMap((row, rowIndex) =>
    row.map((opacity, columnIndex) => {
      const x = 19 + columnIndex * 12;
      const y = 16 + rowIndex * 20;
      return opacity === 0
        ? `<rect x="${x}" y="${y}" width="8" height="10" rx="1.5" fill="none" stroke="var(--line)"/>`
        : `<rect x="${x}" y="${y}" width="8" height="10" rx="1.5" fill="var(--accent)" fill-opacity="${opacity}"/>`;
    }),
  ).join("")}
  <rect x="10" y="56" width="4" height="10" rx="2" fill="var(--accent)"/>
</svg>`;

const SEARCH_GLYPH = `<svg viewBox="0 0 180 104" aria-hidden="true" focusable="false">
  <rect x="11" y="12" width="150" height="78" rx="6" fill="none" stroke="var(--line)" stroke-width="2"/>
  ${[29, 46, 63, 80]
    .map(
      (y) => `<line x1="26" x2="142" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/>`,
    )
    .join("")}
  <rect x="43" y="53" width="60" height="20" rx="4" fill="var(--accent)" fill-opacity=".12" stroke="var(--accent)" stroke-width="2"/>
  <circle cx="128" cy="62" r="13" fill="var(--panel)" stroke="var(--accent)" stroke-width="3"/>
  <line x1="138" x2="157" y1="72" y2="91" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
</svg>`;

function isCompleteReading(commentary: SiteCommentaryDialogue, recording: SiteRecording) {
  const activeBlocks = commentary.blocks.filter((block) => block.reviewStatus !== "rejected");
  const acceptedSections = activeBlocks.filter(
    (block) => block.blockKind === "section" && block.reviewStatus === "accepted",
  );
  if (
    activeBlocks.length === 0 ||
    activeBlocks.some((block) => block.reviewStatus !== "accepted") ||
    acceptedSections.length === 0 ||
    commentary.spine.length === 0 ||
    commentary.spine.some((row) => row.greek.trim().length === 0 || !row.english?.trim())
  ) {
    return false;
  }

  const wholeSpineCovered = commentary.spine.every((row) =>
    acceptedSections.some(
      (section) => row.startChar >= section.sourceRef.startChar && row.startChar < section.sourceRef.endChar,
    ),
  );
  if (!wholeSpineCovered) return false;

  const chapterTargets = new Set(recording.chapters.map((chapter) => chapter.commentary_id));
  return (
    chapterTargets.size === acceptedSections.length &&
    acceptedSections.every((section) => chapterTargets.has(section.commentaryId))
  );
}

function homeFeaturedReading(data: SiteData, pagePath: string): string {
  const candidates = [...data.commentaryByDialogue.values()]
    .filter((commentary) => {
      const recording = data.recordingsByDialogue.get(commentary.dialogue);
      return recording !== undefined && isCompleteReading(commentary, recording);
    })
    .sort((a, b) => {
      const aAccepted = data.recordingsByDialogue.get(a.dialogue)?.status === "accepted" ? 0 : 1;
      const bAccepted = data.recordingsByDialogue.get(b.dialogue)?.status === "accepted" ? 0 : 1;
      return aAccepted - bAccepted || a.dialogue.localeCompare(b.dialogue);
    });
  const commentary = candidates[0];
  if (!commentary) return "";
  const recording = data.recordingsByDialogue.get(commentary.dialogue);
  if (!recording) return "";
  const activeBlocks = commentary.blocks.filter((block) => block.reviewStatus !== "rejected");
  const modelWritten = activeBlocks.every((block) => block.author === "model");
  const commentaryDescription = `${activeBlocks.length} accepted ${modelWritten ? "model-written " : ""}commentary notes`;
  const reviewNotice =
    recording.status === "draft"
      ? '<p class="featured-reading-status">Audio is available as a review candidate; final production acceptance remains pending.</p>'
      : '<p class="featured-reading-status">Production recording accepted.</p>';

  return `<section class="featured-reading">
  <div>
    <p class="featured-reading-kicker">One complete dialogue</p>
    <h2>${escapeHtml(titleCase(commentary.dialogue))}</h2>
    <p class="featured-reading-summary">The full Greek and English text, ${commentaryDescription} woven through the reading, and a ${formatRecordingTime(recording.durationSeconds)} chaptered audio edition.</p>
  </div>
  <div class="featured-reading-action">
    ${pageLink(pagePath, `dialogues/${commentary.dialogue}/reading.html`, "Open the complete reading")}
    ${reviewNotice}
  </div>
</section>`;
}

function indexPage(data: SiteData) {
  const pagePath = "index.html";

  return layout(
    pagePath,
    "Home",
    `<section class="hero home">
  <h1>Plato, read with the apparatus on.</h1>
  <p class="lede">Twenty-seven dialogues, read closely and recorded as
  checkable observations. Every entry on this site is anchored to a Stephanus
  span of the Greek text; nothing is asserted that cannot be traced to a
  passage.</p>
</section>
<section class="home-portals" aria-label="Explore the edition">
  <a class="home-portal" href="dialogues/index.html">
    ${READ_GLYPH}
    <span>Read Greek and English with commentary</span>
  </a>
  <a class="home-portal" href="patterns/index.html">
    ${PATTERNS_GLYPH}
    <span>Trace patterns across the dialogues</span>
  </a>
  <a class="home-portal" href="search.html">
    ${SEARCH_GLYPH}
    <span>Find passages and records</span>
  </a>
</section>
${homeFeaturedReading(data, pagePath)}`,
    navState(data),
  );
}

function layerRow(pagePath: string, target: string, label: string, description: string, count: number) {
  return count > 0
    ? `<div class="layer-row"><span>${pageLink(pagePath, target, label)}</span><span class="layer-desc">${escapeHtml(description)}</span><b class="n">${count}</b></div>`
    : "";
}

function oxfordList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function patternRow(pagePath: string, dossier: SiteDossier, dialogueCount: number) {
  const strongest = [...dossier.presence]
    .sort(
      (a, b) =>
        b.acceptedObservations - a.acceptedObservations ||
        (a.dialogue < b.dialogue ? -1 : a.dialogue > b.dialogue ? 1 : 0),
    )
    .slice(0, 3)
    .map((entry) => {
      const tip = `${titleCase(entry.dialogue)}: ${entry.acceptedObservations} accepted observation${entry.acceptedObservations === 1 ? "" : "s"}`;
      return `<a href="${pathToRoot(pagePath)}${dossier.pagePath}#${dossier.dossierId}" title="${escapeHtml(tip)}">${escapeHtml(titleCase(entry.dialogue))}</a>`;
    });
  const attested =
    dossier.dialogues === dialogueCount && dialogueCount > 1
      ? `attested in all ${dialogueCount} dialogues`
      : `attested in ${dossier.dialogues} of the ${dialogueCount} dialogues`;
  return `<div class="pat-row">
  <div class="pat-main">
    <h3>${dossierLink(pagePath, dossier, titleCase(dossier.label))}</h3>
    <p class="pat-liner">${escapeHtml(patternOneliner(dossier.family, dossier.label))}</p>
    <p class="pat-where">Strongest in ${oxfordList(strongest)}; ${attested}.</p>
  </div>
  <b class="n">${dossier.acceptedObservations}</b>
</div>`;
}

// Curated standing-contradiction specimens. A listed id that resolves must
// still be an accepted contradiction left standing — a re-adjudicated record
// fails the build rather than lingering on the page. Ids absent from the data
// entirely (partial fixtures, subset builds) are skipped.
function standingSpecimens(data: SiteData): SiteRelation[] {
  const byId = new Map(data.relations.map((relation) => [relation.relationId, relation]));
  const specimens: SiteRelation[] = [];
  for (const id of STANDING_SPECIMEN_IDS) {
    const relation = byId.get(id);
    if (!relation) continue;
    if (
      relation.relationKind !== "contradiction" ||
      relation.resolution !== "standing" ||
      relation.reviewStatus !== "accepted"
    ) {
      throw new Error(
        `Standing specimen ${id} is no longer an accepted standing contradiction; update STANDING_SPECIMEN_IDS.`,
      );
    }
    specimens.push(relation);
  }
  return specimens;
}

function tensionCard(pagePath: string, data: SiteData, relation: SiteRelation) {
  const side = (claimId: string) => {
    const claim = data.claimsById.get(claimId);
    if (!claim) {
      throw new Error(`Standing specimen ${relation.relationId} cites unknown claim ${claimId}.`);
    }
    const target = data.claimPageById.get(claimId);
    const parsed = target ? splitTarget(target) : undefined;
    const name = parsed
      ? pageLink(pagePath, parsed.path, titleCase(claim.dialogue), parsed.hash)
      : escapeHtml(titleCase(claim.dialogue));
    return `<div class="tp-side">
  <p class="tp-src">${name} <span class="ref">${escapeHtml(claim.stephanusSpan)}</span></p>
  <p class="tp-claim">${escapeHtml(claim.content)}</p>
</div>`;
  };
  return `<article class="tp">
  <div class="tp-pair">${side(relation.claimA)}${side(relation.claimB)}<span class="tp-glyph" aria-hidden="true">⇄</span></div>
  <p class="tp-limits">${escapeHtml(relation.limits)}</p>
</article>`;
}

function patternsPage(data: SiteData) {
  const pagePath = "patterns/index.html";
  const dialogueCount = data.derivedByDialogue.size;
  const patternRows = topPatternDossiers(data.dossiers, 12)
    .map((dossier) => patternRow(pagePath, dossier, dialogueCount))
    .join("\n");
  const patternsSection =
    data.dossiers.length > 0
      ? `<section>
  <h2>What recurs, and where</h2>
  <p class="section-lede">The labels that recur most widely. The figure is the label's accepted observations corpus-wide; each dialogue named links straight into the dossier's evidence for it.</p>
  <div class="pat-rows">
${patternRows}
  </div>
  <p>${pageLink(pagePath, "dossiers/index.html", `All ${data.dossiers.length} dossiers →`)}</p>
</section>`
      : "";

  const standing = data.relations.filter(
    (relation) => relation.relationKind === "contradiction" && relation.resolution === "standing",
  );
  const specimenCards = standingSpecimens(data)
    .map((relation) => tensionCard(pagePath, data, relation))
    .join("\n");
  const relationsSection =
    standing.length > 0
      ? `<section>
  <h2>Contradictions left standing</h2>
  <p class="section-lede">Relation records link claims that strain against each other. Most accepted tensions are verbal echoes; these are the narrow set the ledgers leave unresolved.</p>
  ${specimenCards ? `<div class="tp-grid">\n${specimenCards}\n</div>` : ""}
  <p>${pageLink(pagePath, "relations/standing.html", `All ${standing.length} standing contradiction${standing.length === 1 ? "" : "s"} →`)}</p>
</section>`
      : "";

  const anchorOccurrences = [...data.derivedByDialogue.values()].reduce((sum, row) => sum + row.anchors.length, 0);
  const layerCounts: Record<(typeof LAYER_GUIDE)[number]["title"], number> = {
    Dossiers: data.dossiers.length,
    Clusters: data.clusters.length,
    Families: familyRows(data.observations, data.registry).length,
    Anchors: anchorOccurrences,
    Claims: data.claims.length,
    Relations: data.relations.length,
    "Feature registry": data.registry.length,
  };
  const layerRows = LAYER_GUIDE.map((layer) =>
    layerRow(pagePath, layer.path, layer.title, layer.description, layerCounts[layer.title]),
  ).join("");

  return layout(
    pagePath,
    "Patterns",
    `<section class="hero compact">
  <h1>Patterns across the dialogues</h1>
  <p>Observations are labeled by textual function; labels that recur become evidence dossiers; claims made in the text are linked by relation records where they support or strain against each other. This page is the corpus-level view of those layers.</p>
</section>
${patternsSection}
${relationsSection}
<section>
  <h2>Browse the layers</h2>
  <div class="layers">${layerRows}</div>
</section>`,
    navState(data),
  );
}

function dialoguesHubPage(data: SiteData) {
  const pagePath = "dialogues/index.html";
  const observationsByDialogue = groupBy(data.observations, (observation) => observation.dialogue);
  // Recurring labels attested per dialogue, for the honest "+ N more" tail.
  const labelsPresent = new Map<string, number>();
  for (const dossier of data.dossiers) {
    for (const entry of dossier.presence) {
      if (entry.acceptedObservations > 0) {
        labelsPresent.set(entry.dialogue, (labelsPresent.get(entry.dialogue) ?? 0) + 1);
      }
    }
  }
  const rows = [...data.derivedByDialogue.keys()]
    .sort()
    .map((dialogue) => {
      const observations = observationsByDialogue.get(dialogue)?.length ?? 0;
      const epigraph = dialogueEpigraph(dialogue);
      const derived = data.derivedByDialogue.get(dialogue);
      const tokens = (derived?.speakers ?? []).reduce((sum, row) => {
        const parsed = Number.parseInt(row.total_tokens ?? "0", 10);
        return sum + (Number.isFinite(parsed) ? parsed : 0);
      }, 0);
      const readLink = data.commentaryByDialogue.has(dialogue)
        ? `<span class="dlg-read">${pageLink(pagePath, `dialogues/${dialogue}/reading.html`, "Read")}</span>`
        : "";
      const tags = dialogueTags(dialogue, data.dossiers);
      const chips = tags.map(
        (tag) =>
          `<a class="tag" href="${pathToRoot(pagePath)}${
            data.dossierPageByFamilyLabel.get(dossierFamilyLabelKey(tag.family, tag.label)) ?? ""
          }" title="${escapeHtml(`${tag.count} of the label's ${tag.corpus} accepted instances are here`)}">${escapeHtml(tag.display)}</a>`,
      );
      const more = (labelsPresent.get(dialogue) ?? 0) - tags.length;
      if (more > 0) {
        chips.push(
          `<a class="tag more" href="${pathToRoot(pagePath)}dialogues/${dialogue}/records.html">+ ${more} more</a>`,
        );
      }
      const tagRow = chips.length > 0 ? `\n  <p class="tags">${chips.join("")}</p>` : "";
      return `<div class="dlg-row filter-item" data-search="${escapeHtml(`${dialogue} ${titleCase(dialogue)}`)}" data-title="${escapeHtml(dialogue)}" data-length="${tokens}" data-records="${observations}">
  <div class="dlg-head">${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}${readLink}</div>
  <p class="dlg-epi">${escapeHtml(epigraph)}</p>${tagRow}
</div>`;
    })
    .join("\n");
  const orderButton = (key: string, label: string, active = false) =>
    `<button type="button" class="chip${active ? " is-on" : ""}" data-sort="${key}" aria-pressed="${active}">${label}</button>`;
  return layout(
    pagePath,
    "Dialogues",
    `<section class="hero compact"><h1>Dialogues</h1>
<p class="section-lede">Every dialogue, with the labels the reading found most concentrated in it — each tag links its dossier of evidence, and the tail counts the rest.</p></section>
<section class="ledger-controls" data-filters>
  <span class="dlg-order" role="group" aria-label="Order">Order ${orderButton("title", "Title", true)}${orderButton("length", "Length")}${orderButton("records", "Records")}</span>
  <label class="search">Filter<input data-filter-search type="search" placeholder="Dialogue"></label>
  <p class="filter-status" role="status" aria-live="polite" data-filter-status></p>
</section>
<div class="dlg-ledger" data-ledger>
${rows}
</div>`,
    navState(data),
  );
}

function familiesHubPage(data: SiteData) {
  const pagePath = "families/index.html";
  const families = familyRows(data.observations, data.registry);
  const rows = families
    .map(
      (family) =>
        `<tr class="filter-item" data-family="${escapeHtml(family.family)}" data-search="${escapeHtml(`${family.family} ${family.kind}`)}"><td>${pageLink(pagePath, `families/${family.family}.html`, family.family)}</td><td>${escapeHtml(family.kind)}</td><td>${family.observationCount}</td><td>${family.featureCandidateCount}</td></tr>`,
    )
    .join("");
  return layout(
    pagePath,
    "Families",
    `<section class="hero compact"><p>${pageLink(pagePath, "index.html", "Index")}</p><h1>Families</h1><div class="metrics">${metric("families", families.length)}</div></section>
${filterControls({ families: families.map((family) => family.family), placeholder: "Family" })}
<table><thead><tr><th>Family</th><th>Kind</th><th>Observations</th><th>Candidates</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function claimsHubPage(data: SiteData) {
  const pagePath = "claims/index.html";
  const rows = countBy(data.claims, (claim) => claim.dialogue)
    .map(([dialogue, claims]) => {
      const first = data.claimShards.find((shard) => shard.dialogue === dialogue);
      return `<tr><td>${first ? pageLink(pagePath, first.path, titleCase(dialogue)) : escapeHtml(titleCase(dialogue))}</td><td>${claims.length}</td><td>${escapeHtml(statusCounts(claims, (claim) => claim.reviewStatus))}</td><td>${escapeHtml(statusCounts(claims, (claim) => claim.finalStatus))}</td></tr>`;
    })
    .join("");
  return layout(
    pagePath,
    "Claims",
    `<section class="hero compact"><p>${pageLink(pagePath, "index.html", "Index")}</p><h1>Claims</h1><div class="metrics">${metric("claims", data.claims.length)}${metric("dialogues", countBy(data.claims, (claim) => claim.dialogue).length)}</div></section>
<table><thead><tr><th>Dialogue</th><th>Claims</th><th>Review Status</th><th>Final Status</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function relationsHubPage(data: SiteData) {
  const pagePath = "relations/index.html";
  const rows = countBy(data.relations, (relation) => relation.dialogue)
    .map(([dialogue, relations]) => {
      const first = data.relationShards.find((shard) => shard.dialogue === dialogue);
      return `<tr><td>${first ? pageLink(pagePath, first.path, titleCase(dialogue)) : escapeHtml(titleCase(dialogue))}</td><td>${relations.length}</td><td>${escapeHtml(statusCounts(relations, (relation) => relation.resolution))}</td></tr>`;
    })
    .join("");
  return layout(
    pagePath,
    "Relations",
    `<section class="hero compact"><p>${pageLink(pagePath, "index.html", "Index")}</p><h1>Relations</h1><div class="metrics">${metric("relations", data.relations.length)}</div>${data.relations.length ? `<p>${pageLink(pagePath, "relations/standing.html", "Standing Relations")}</p>` : ""}</section>
<table><thead><tr><th>Scope</th><th>Relations</th><th>Resolutions</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function readingsHubPage(data: SiteData) {
  const pagePath = "readings/index.html";
  const rows = [...data.commentaryByDialogue.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dialogue, commentary]) => {
      const visible = commentary.blocks.filter(
        (block) => block.reviewStatus === "accepted" || block.reviewStatus === "unreviewed",
      );
      return `<tr><td>${pageLink(pagePath, `dialogues/${dialogue}/reading.html`, titleCase(dialogue))}</td><td>${visible.length}</td><td>${visible.filter((block) => block.reviewStatus === "accepted").length}</td></tr>`;
    })
    .join("");
  return layout(
    pagePath,
    "Guided Readings",
    `<section class="hero compact"><p>${pageLink(pagePath, "index.html", "Index")}</p><h1>Guided Readings</h1><div class="metrics">${metric("dialogues", data.commentaryByDialogue.size)}</div></section>
<table><thead><tr><th>Dialogue</th><th>Visible Blocks</th><th>Accepted</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function audioEditionsPage(data: SiteData) {
  const pagePath = "audio/index.html";
  const dialogues = [...data.derivedByDialogue.keys()].sort();
  const accepted = [...data.recordingsByDialogue.values()].filter((recording) => recording.status === "accepted").length;
  const reviewCandidates = [...data.recordingsByDialogue.values()].filter((recording) => recording.status === "draft").length;
  const rows = dialogues
    .map((dialogue) => {
      const recording = data.recordingsByDialogue.get(dialogue);
      const commentary = data.commentaryByDialogue.get(dialogue);
      if (!recording) {
        const action = commentary
          ? `${pageLink(pagePath, `dialogues/${dialogue}/reading.html`, "Open guided reading")}<br><span class="dim">Audio not yet published.</span>`
          : '<span class="status-unavailable">Not yet published.</span>';
        return `<tr class="filter-item" data-dialogue="${escapeHtml(dialogue)}" data-status="unavailable" data-search="${escapeHtml(`${dialogue} unavailable`)}"><td>${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</td><td><span class="status-unavailable">Unavailable</span></td><td>—</td><td>—</td><td>${action}</td></tr>`;
      }
      const duration = formatRecordingTime(recording.durationSeconds);
      if (recording.status === "accepted") {
        return `<tr class="filter-item" data-dialogue="${escapeHtml(dialogue)}" data-status="available" data-recording-acceptance-status="accepted" data-search="${escapeHtml(`${dialogue} available ${recording.recordingId}`)}"><td>${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</td><td><span class="status-available">Published</span></td><td>${duration}</td><td>${recording.chapters.length}</td><td><span class="recording-catalog-action"><a href="../dialogues/${dialogue}/reading.html#recording-player" data-recording-resume-link data-recording-id="${escapeHtml(recording.recordingId)}" data-recording-dialogue="${escapeHtml(dialogue)}" data-audio-sha256="${recording.audioSha256}" data-recording-duration="${recording.durationSeconds}">Listen</a><span class="dim" data-recording-resume-summary>Checking saved position…</span></span></td></tr>`;
      }
      return `<tr class="filter-item" data-dialogue="${escapeHtml(dialogue)}" data-status="review-candidate" data-recording-acceptance-status="draft" data-search="${escapeHtml(`${dialogue} review candidate ${recording.recordingId}`)}"><td>${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</td><td><span class="status-review-candidate">Review candidate</span><br><span class="dim">This review candidate has not passed final production acceptance.</span></td><td>${duration}</td><td>${recording.chapters.length}</td><td><span class="recording-catalog-action"><a href="../dialogues/${dialogue}/reading.html#recording-player" data-recording-resume-link data-recording-id="${escapeHtml(recording.recordingId)}" data-recording-dialogue="${escapeHtml(dialogue)}" data-audio-sha256="${recording.audioSha256}" data-recording-duration="${recording.durationSeconds}">Listen for review</a><span class="dim" data-recording-resume-summary>Checking saved position…</span></span></td></tr>`;
    })
    .join("");
  return layout(
    pagePath,
    "Audio Editions",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Audio Editions</h1>
  <div class="metrics">${metric("dialogues", dialogues.length)}${metric("published recordings", accepted)}${metric("review candidates", reviewCandidates)}${metric("awaiting recordings", dialogues.length - accepted - reviewCandidates)}</div>
  <p>${reviewCandidates > 0 ? "Accepted, hash-verified production recordings and explicitly included review candidates appear as playable. Review candidates have not passed final production acceptance." : "Only accepted, hash-verified production recordings appear as playable."} Progress is stored locally in this browser and is never sent to a server.</p>
</section>
${filterControls({ dialogues, statuses: reviewCandidates > 0 ? ["available", "review-candidate", "unavailable"] : ["available", "unavailable"], placeholder: "Dialogue or recording ID" })}
<table><thead><tr><th>Dialogue</th><th>Recording</th><th>Duration</th><th>Chapters</th><th>Listen or resume</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

// ---------------------------------------------------------------------------
// Dialogue pages v3.3 (the dialogue-pages v3.3 rollout): the overview/records split.
// ---------------------------------------------------------------------------

// Deterministic thousands grouping (locale-independent; commas are not the
// banned interpunct).
function groupDigits(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
];
function numberWord(count: number) {
  return count >= 0 && count < NUMBER_WORDS.length ? NUMBER_WORDS[count]! : groupDigits(count);
}
function capitalize(value: string) {
  return value ? `${value.slice(0, 1).toUpperCase()}${value.slice(1)}` : value;
}

// count desc, then key code-unit asc (no locale compare); nonzero only.
function orderedCounts(counts: Map<string, number>) {
  return [...counts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

function rel(pagePath: string, target: string) {
  return `${pathToRoot(pagePath)}${target}`;
}

function tagAnchor(href: string, label: string, cls = "tag") {
  return `<a class="${cls}" href="${href}">${escapeHtml(label)}</a>`;
}

function truncateLead(text: string, max = 120) {
  const clean = text.replace(/\s+/gu, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

// Accepted relations joining this dialogue's claims to any claim in the corpus,
// selected by CLAIM MEMBERSHIP (relation.dialogue files every cross-dialogue link
// under "cross-dialogue", so a home-dialogue filter reports a false zero).
function dialogueCorpusRelations(data: SiteData, dialogue: string): SiteRelation[] {
  const claimIds = new Set(
    data.claims.filter((claim) => claim.dialogue === dialogue).map((claim) => claim.claimId),
  );
  const seen = new Set<string>();
  const result: SiteRelation[] = [];
  for (const claimId of [...claimIds].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
    for (const relation of data.relationsByClaimId.get(claimId) ?? []) {
      if (relation.reviewStatus !== "accepted") continue;
      if (seen.has(relation.relationId)) continue;
      seen.add(relation.relationId);
      result.push(relation);
    }
  }
  return result.sort((a, b) => (a.relationId < b.relationId ? -1 : a.relationId > b.relationId ? 1 : 0));
}

// Voices: ordered like curation.orderedSpeakers (total tokens desc, code-unit
// tiebreak, Socrates /^ΣΩ/u to slot 0), carrying turns and tokens; the
// unattributed frame row, if present, trails in gray.
type VoiceRow = { speaker: string; turns: number; tokens: number; unattributed: boolean };
function orderVoiceRows(speakers: readonly ToonRow[]): VoiceRow[] {
  const real = speakers
    .filter((row) => (row.speaker ?? "") !== "(unattributed)")
    .map((row) => ({
      speaker: row.speaker ?? "",
      turns: Number.parseInt(row.turns ?? "0", 10) || 0,
      tokens: Number.parseInt(row.total_tokens ?? "0", 10) || 0,
      unattributed: false,
    }))
    .sort((a, b) => b.tokens - a.tokens || (a.speaker < b.speaker ? -1 : a.speaker > b.speaker ? 1 : 0));
  const socratesIndex = real.findIndex((entry) => /^ΣΩ/u.test(entry.speaker));
  if (socratesIndex > 0) {
    const [socrates] = real.splice(socratesIndex, 1);
    if (socrates) real.unshift(socrates);
  }
  const frame = speakers.find((row) => (row.speaker ?? "") === "(unattributed)");
  if (frame) {
    real.push({
      speaker: "(unattributed)",
      turns: Number.parseInt(frame.turns ?? "0", 10) || 0,
      tokens: Number.parseInt(frame.total_tokens ?? "0", 10) || 0,
      unattributed: true,
    });
  }
  return real;
}

function voicesSection(pagePath: string, data: SiteData, dialogue: string, acceptedObservations: number): string {
  const derived = data.derivedByDialogue.get(dialogue);
  const speakers = derived?.speakers ?? [];
  const recordsHref = rel(pagePath, `dialogues/${dialogue}/records.html`);
  const isUnattributed =
    data.unattributedDialogues.includes(dialogue) ||
    (speakers.length === 1 && (speakers[0]?.speaker ?? "") === "(unattributed)");

  if (isUnattributed) {
    const tokens = Number.parseInt(speakers[0]?.total_tokens ?? "0", 10) || 0;
    return `<section>
  <h2>Voices</h2>
  <div class="voice-rows">
    <div class="voice-row"><span class="voice-name">One unattributed voice</span><span class="voice-track"><span class="voice-fill" style="width:100%;background:${SPEAKER_OTHER}"></span></span><span class="n voice-turns">1 turn</span><span class="n">100%</span></div>
  </div>
  <p class="dim" style="margin-top:8px">The source prints no speaker sigla; the text is indexed as one continuous turn of ${groupDigits(
    tokens,
  )} tokens. Where each of its ${groupDigits(acceptedObservations)} records falls is on <a href="${recordsHref}">the record map</a>.</p>
</section>`;
  }

  const rows = orderVoiceRows(speakers);
  const totalTokens = rows.reduce((sum, row) => sum + row.tokens, 0) || 1;
  let paletteSlot = 0;
  const rowHtml = rows
    .map((row) => {
      const share = (row.tokens / totalTokens) * 100;
      const pct = share.toFixed(1);
      const color = row.unattributed
        ? SPEAKER_OTHER
        : SPEAKER_PALETTE[paletteSlot] ?? SPEAKER_OTHER;
      if (!row.unattributed) paletteSlot += 1;
      const greek = /\p{Script=Greek}/u.test(row.speaker);
      const name = row.unattributed
        ? `<span>Unattributed</span>`
        : `<b${greek ? ' lang="grc"' : ""}>${escapeHtml(row.speaker)}</b> <span>${escapeHtml(
            greekSpeakerName(dialogue, row.speaker),
          )}</span>`;
      return `<div class="voice-row"><span class="voice-name">${name}</span><span class="voice-track"><span class="voice-fill" style="width:${pct}%;background:${color}"></span></span><span class="n voice-turns">${groupDigits(
        row.turns,
      )} ${row.turns === 1 ? "turn" : "turns"}</span><span class="n">${pct}%</span></div>`;
    })
    .join("\n    ");

  return `<section>
  <h2>Voices</h2>
  <div class="voice-rows">
    ${rowHtml}
  </div>
  <p class="dim" style="margin-top:8px">Share of the dialogue's tokens. Full lengths, medians, and long-turn flags are in <a href="${recordsHref}">Records &amp; data</a>.</p>
</section>`;
}

// The course of the dialogue: the guided reading's section titles + ranges, two
// open columns, each row a deep link into the reading at that section's start.
function courseSection(pagePath: string, data: SiteData, dialogue: string): string {
  const commentary = data.commentaryByDialogue.get(dialogue);
  const sections = (commentary?.blocks ?? []).filter((block) => block.blockKind === "section");
  if (sections.length === 0) return "";

  const entry = (block: SiteCommentaryBlock) => {
    const marker = block.sourceRef.startMarker;
    const readingHref = readingMarkerPath(data, dialogue, marker);
    const href = readingHref ? `${rel(pagePath, readingHref)}#loc-${escapeHtml(marker)}` : "#";
    return `<li><a href="${href}"><span class="t">${escapeHtml(block.title)}</span><span class="loc">${escapeHtml(
      block.stephanusSpan,
    )}</span></a></li>`;
  };

  const half = Math.ceil(sections.length / 2);
  const first = sections.slice(0, half).map(entry).join("");
  const second = sections.slice(half).map(entry).join("");
  const secondColumn = second
    ? `<details class="toc-more" data-toc-more open>
      <summary>All ${sections.length} sections</summary>
      <ol class="toc-col">${second}</ol>
    </details>`
    : "";

  return `<section>
  <h2>The course of the dialogue</h2>
  <p class="section-lede">The guided reading's ${sections.length} sections; each link opens the reading at that point.</p>
  <div class="toc-wrap">
    <ol class="toc-col">${first}</ol>
    ${secondColumn}
  </div>
</section>`;
}

// Family label chips: this dialogue's labels for the family, count desc then
// label asc, greedy under a summed-display-character budget, at least one, then
// "+ N more". Chips land on the label's dossier when one exists, else the family.
const FAMILY_CHIP_BUDGET = 72;
function familyLabelChips(
  pagePath: string,
  data: SiteData,
  dialogue: string,
  family: string,
  observations: readonly SiteObservation[],
): string {
  const labelCounts = new Map<string, number>();
  for (const observation of observations) {
    labelCounts.set(observation.featureLabel, (labelCounts.get(observation.featureLabel) ?? 0) + 1);
  }
  const labels = [...labelCounts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([label]) => label);

  const shown: string[] = [];
  let used = 0;
  for (const label of labels) {
    const display = titleCase(label);
    if (shown.length && used + display.length > FAMILY_CHIP_BUDGET) break;
    shown.push(label);
    used += display.length;
  }
  const familyHref = rel(pagePath, `families/${family}.html`);
  const chip = (label: string) => {
    const target = data.dossierPageByFamilyLabel.get(dossierFamilyLabelKey(family, label));
    const href = target ? rel(pagePath, target) : familyHref;
    return tagAnchor(href, titleCase(label));
  };
  const rest = labels.length - shown.length;
  const chips = shown.map(chip).join("");
  const more = rest > 0 ? tagAnchor(familyHref, `+ ${rest} more`, "tag more") : "";
  return `<div class="tags">${chips}${more}</div>`;
}

// Families on the overview: ledger row grammar, top eight unfolded with guide
// line and chips; the rest folded as head lines only.
function familiesSection(
  pagePath: string,
  data: SiteData,
  dialogue: string,
  accepted: readonly SiteObservation[],
): string {
  const byFamily = new Map<string, SiteObservation[]>();
  for (const observation of accepted) {
    const entries = byFamily.get(observation.featureFamily) ?? [];
    entries.push(observation);
    byFamily.set(observation.featureFamily, entries);
  }
  const families = [...byFamily.entries()].sort(
    (a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
  );
  if (families.length === 0) return "";

  const recordsFor = (family: string, count: number) =>
    `<a class="lgr-act" href="${rel(pagePath, `dialogues/${dialogue}/records.html`)}#fam=${escapeHtml(
      family,
    )}">${groupDigits(count)} record${count === 1 ? "" : "s"}</a>`;

  const unfolded = families
    .slice(0, 8)
    .map(([family, entries]) => {
      const name = `<a class="lgr-name" href="${rel(pagePath, `families/${family}.html`)}">${escapeHtml(
        titleCase(family),
      )}</a>`;
      // Soft lookup here so subset/fixture families still render; the full
      // top-eight-union census (every unfolded family has a line) is enforced in
      // curation.test over real ledgers.
      const guide = FAMILY_GUIDE[family];
      const guideLine = guide ? `\n    <p class="lgr-epi">${escapeHtml(guide)}</p>` : "";
      return `<div class="lgr-row">
    <div class="lgr-head">${name}${recordsFor(family, entries.length)}</div>${guideLine}
    ${familyLabelChips(pagePath, data, dialogue, family, entries)}
  </div>`;
    })
    .join("\n  ");

  const rest = families.slice(8);
  const fold = rest.length
    ? `<details class="lgr-fold"><summary>All ${families.length} families</summary>${rest
        .map(
          ([family, entries]) =>
            `<div class="lgr-row"><div class="lgr-head"><a class="lgr-name" href="${rel(
              pagePath,
              `families/${family}.html`,
            )}">${escapeHtml(titleCase(family))}</a>${recordsFor(family, entries.length)}</div></div>`,
        )
        .join("")}</details>`
    : "";

  return `<section>
  <h2>Families</h2>
  <p class="section-lede">The kinds of observation recorded in this dialogue, most frequent first.</p>
  <div class="lgr">
  ${unfolded}
  </div>
  ${fold}
</section>`;
}

function dialogueIndexPage(data: SiteData, dialogue: string, observations: SiteObservation[]) {
  const pagePath = `dialogues/${dialogue}/index.html`;
  const commentary = data.commentaryByDialogue.get(dialogue);
  const derived = data.derivedByDialogue.get(dialogue);
  const accepted = observations.filter((observation) => observation.reviewStatus === "accepted");
  const claims = data.claims.filter((claim) => claim.dialogue === dialogue && claim.reviewStatus === "accepted");
  const corpusLinks = dialogueCorpusRelations(data, dialogue);
  const anchorCount = derived?.anchors.length ?? 0;
  const tags = dialogueTags(dialogue, data.dossiers);
  const tagChips = tags.length
    ? `<div class="tags">${tags
        .map((tag) => {
          const target = data.dossierPageByFamilyLabel.get(dossierFamilyLabelKey(tag.family, tag.label));
          const href = target ? rel(pagePath, target) : rel(pagePath, `families/${tag.family}.html`);
          return tagAnchor(href, tag.display);
        })
        .join("")}</div>`
    : "";

  const readDoor = commentary
    ? `<article class="door">${READ_GLYPH}<h2>${pageLink(
        pagePath,
        `dialogues/${dialogue}/reading.html`,
        "Read",
      )}</h2><p>The full text, Greek beside English, with the model's commentary and the margin records alongside. The audio edition plays here when published.</p></article>`
    : "";
  const recordsDoorCounts = [
    `${groupDigits(accepted.length)} observation${accepted.length === 1 ? "" : "s"}`,
    `${groupDigits(claims.length)} claim${claims.length === 1 ? "" : "s"}`,
    `${groupDigits(corpusLinks.length)} corpus link${corpusLinks.length === 1 ? "" : "s"}`,
    `${groupDigits(anchorCount)} formula occurrence${anchorCount === 1 ? "" : "s"}`,
  ];
  const recordsDoor = `<article class="door">${PATTERNS_GLYPH}<h2>${pageLink(
    pagePath,
    `dialogues/${dialogue}/records.html`,
    "Records & data",
  )}</h2><p>Everything recorded against this text — ${recordsDoorCounts[0]}, ${recordsDoorCounts[1]}, ${recordsDoorCounts[2]}, and ${recordsDoorCounts[3]} — mapped onto the text and browsable in full.</p></article>`;

  // Curated specimen. Renders only when the id resolves to an accepted
  // observation of this dialogue; subset/fixture builds that lack it (or carry a
  // same-named unaccepted stub) simply drop the section, like dialogueTags drops
  // an absent dossier. The full exists/accepted/of-dialogue census over live
  // ledgers is enforced in curation.test.
  const specimenId = dialogueSpecimenId(dialogue);
  const specimenCandidate = data.observationsById.get(specimenId);
  const specimen =
    specimenCandidate && specimenCandidate.reviewStatus === "accepted" && specimenCandidate.dialogue === dialogue
      ? specimenCandidate
      : undefined;
  const fromRecords = specimen
    ? `<section>
  <h2>From the records</h2>
  ${observationCard(pagePath, data, specimen)}
  <p class="more-link">${pageLink(
    pagePath,
    `dialogues/${dialogue}/records.html`,
    `All ${groupDigits(accepted.length)} records on this dialogue`,
  )}</p>
</section>`
    : "";

  return layout(
    pagePath,
    titleCase(dialogue),
    `<section class="hero">
  <p class="crumb">${pageLink(pagePath, "dialogues/index.html", "Dialogues")}</p>
  <h1>${escapeHtml(titleCase(dialogue))}</h1>
  <p class="epigraph">${escapeHtml(dialogueEpigraph(dialogue))}</p>
  ${tagChips}
</section>
<section class="doors">
  ${readDoor}
  ${recordsDoor}
</section>
${voicesSection(pagePath, data, dialogue, accepted.length)}
${courseSection(pagePath, data, dialogue)}
${familiesSection(pagePath, data, dialogue, accepted)}
${fromRecords}`,
    navState(data),
  );
}

// The record map (the dialogue-pages v3.3 rollout): build-time static SVG on one character-position
// Stephanus axis. Lanes — sections, observation spans (row-packed), claim spans
// (row-packed), anchor points. Returns null when the map would exceed the
// single-axis budget (mark count or SVG weight), so the caller can withhold it
// honestly rather than draw a truncated one (a plan STOP condition).
const RECORD_MAP_MAX_MARKS = 2500;
const RECORD_MAP_MAX_BYTES = 300_000;
const RECORD_MAP_LEAD_LIMIT = 600;

type MapMark = {
  kind: "obs" | "claim" | "anch" | "section";
  startChar: number;
  endChar: number;
  family?: string | undefined;
  name: string;
  ref: string;
  lead: string;
  href?: string | undefined;
};

function svgAttr(value: string) {
  return escapeHtml(value);
}

function recordMapSvg(
  data: SiteData,
  dialogue: string,
  sourceWork: string,
  observations: readonly SiteObservation[],
  claims: readonly SiteClaim[],
  markers: readonly StephanusMarker[],
): { svg: string; markCount: number } | null {
  if (markers.length === 0) return null;
  const ACCENT = "#2e63a4", INK = "#16181d", MUTED = "#5c6470", LINE = "#e3e6ea";
  const total = markers.reduce((max, marker) => Math.max(max, marker.endChar), 0);
  if (total <= 0) return null;

  const commentary = data.commentaryByDialogue.get(dialogue);
  const sections = (commentary?.blocks ?? []).filter((block) => block.blockKind === "section");
  const derived = data.derivedByDialogue.get(dialogue);
  const anchors = derived?.anchors ?? [];

  const markCount = observations.length + claims.length + anchors.length + sections.length;
  if (markCount > RECORD_MAP_MAX_MARKS) return null;
  // Thin marks on the larger maps (plan's "shard/simplify" remedy): above this
  // many marks the per-mark lead is dropped from the SVG, so the axis still
  // carries every record — no truncation — and the floating card falls back to
  // the record's name and span. Small maps keep the lead in the card.
  const includeLeads = markCount <= RECORD_MAP_LEAD_LIMIT;

  const W = 1160, RAILX = 92, PADR = 8;
  const plotW = W - RAILX - PADR;
  const X = (charOffset: number) => RAILX + (charOffset / total) * plotW;
  const gapChars = (2 / plotW) * total;

  // First-fit row packing over spans sorted by start then end.
  const pack = <T extends { startChar: number; endChar: number }>(items: T[]) => {
    const rowEnds: number[] = [];
    const rowOf = new Map<T, number>();
    for (const item of [...items].sort((a, b) => a.startChar - b.startChar || a.endChar - b.endChar)) {
      let row = rowEnds.findIndex((end) => end + gapChars <= item.startChar);
      if (row < 0) {
        row = rowEnds.length;
        rowEnds.push(0);
      }
      rowOf.set(item, row);
      rowEnds[row] = item.endChar;
    }
    return { rows: Math.max(rowEnds.length, 1), rowOf };
  };

  const obsSpans = observations.map((observation) => ({
    startChar: observation.sourceRef.startChar,
    endChar: observation.sourceRef.endChar,
    family: observation.featureFamily,
    name: titleCase(observation.featureLabel),
    ref: `${sourceWork} ${observation.stephanusSpan} — ${titleCase(observation.featureFamily)}`,
    lead: truncateLead(observation.observation),
    href: data.observationPageById.get(observation.observationId),
  }));
  const claimSpans = claims.map((claim) => ({
    startChar: claim.sourceRef.startChar,
    endChar: claim.sourceRef.endChar,
    name: `${titleCase(claim.claimKind)} — ${titleCase(claim.finalStatus)}`,
    ref: `${sourceWork} ${claim.stephanusSpan}`,
    lead: truncateLead(claim.content),
    href: data.claimPageById.get(claim.claimId),
  }));

  const obsPack = pack(obsSpans);
  const claimPack = pack(claimSpans);

  const ROWH = 9, ROWGAP = 4, SEC_H = 12;
  const ySec = 6;
  const yObs = ySec + SEC_H + 16;
  const obsH = obsPack.rows * ROWH + (obsPack.rows - 1) * ROWGAP;
  const yClaims = yObs + obsH + 18;
  const claimsH = claimPack.rows * ROWH + (claimPack.rows - 1) * ROWGAP;
  const yAnch = yClaims + claimsH + 18;
  const anchH = 8;
  const yAxis = yAnch + anchH + 14;
  const H = yAxis + 22;

  // Page gridlines behind everything; labels at the first page, multiples of 5,
  // and the final marker.
  const pageFirstChar = new Map<string, number>();
  for (const marker of markers) {
    const page = /^\d+/u.exec(marker.marker)?.[0];
    if (!page) continue;
    if (!pageFirstChar.has(page) || marker.startChar < pageFirstChar.get(page)!) {
      pageFirstChar.set(page, marker.startChar);
    }
  }
  const pages = [...pageFirstChar.entries()].sort((a, b) => a[1] - b[1]);
  const firstPage = pages[0]?.[0];
  const parts: string[] = [];
  for (const [, charOffset] of pages) {
    const x = X(charOffset).toFixed(1);
    parts.push(`<line x1="${x}" y1="${ySec}" x2="${x}" y2="${yAxis}" stroke="${LINE}" stroke-width="1"/>`);
  }
  parts.push(`<line x1="${RAILX}" y1="${yAxis}" x2="${W - PADR}" y2="${yAxis}" stroke="${LINE}" stroke-width="1"/>`);
  for (const [page, charOffset] of pages) {
    if (page !== firstPage && Number.parseInt(page, 10) % 5 !== 0) continue;
    parts.push(
      `<text x="${X(charOffset).toFixed(1)}" y="${yAxis + 15}" font-family="ui-monospace,Menlo,monospace" font-size="10.5" fill="${MUTED}">${svgAttr(
        page,
      )}</text>`,
    );
  }
  const lastMarker = markers[markers.length - 1]?.marker ?? "";
  parts.push(
    `<text x="${W - PADR}" y="${yAxis + 15}" text-anchor="end" font-family="ui-monospace,Menlo,monospace" font-size="10.5" fill="${MUTED}">${svgAttr(
      lastMarker,
    )}</text>`,
  );

  const rail = (label: string, y: number) =>
    `<text x="${RAILX - 12}" y="${y}" text-anchor="end" font-family="ui-monospace,Menlo,monospace" font-size="10.5" fill="${MUTED}">${label}</text>`;
  parts.push(rail("Sections", ySec + SEC_H / 2 + 3.5));
  parts.push(rail("Observations", yObs + obsH / 2 + 3.5));
  parts.push(rail("Claims", yClaims + claimsH / 2 + 3.5));
  parts.push(rail("Anchors", yAnch + anchH / 2 + 3.5));

  const markData = (mark: MapMark) =>
    `class="map-mark" tabindex="0" data-k="${mark.kind}"${
      mark.family ? ` data-f="${svgAttr(mark.family)}"` : ""
    }${mark.href ? ` data-h="${svgAttr(rel(`dialogues/${dialogue}/records.html`, mark.href))}"` : ""} data-t="${svgAttr(
      mark.ref,
    )}" data-n="${svgAttr(mark.name)}"${includeLeads && mark.lead ? ` data-l="${svgAttr(mark.lead)}"` : ""}`;
  const titleFor = (mark: MapMark) => `<title>${svgAttr(mark.name)} — ${svgAttr(mark.ref)}</title>`;

  // Sections band (alternating), hoverable.
  const secRects = sections
    .map((block, index) => {
      const x = X(block.sourceRef.startChar);
      const width = Math.max(X(block.sourceRef.endChar) - x, 2);
      const mark: MapMark = {
        kind: "section",
        startChar: block.sourceRef.startChar,
        endChar: block.sourceRef.endChar,
        name: block.title,
        ref: `${sourceWork} ${block.stephanusSpan}`,
        lead: "Section of the guided reading.",
        href: readingMarkerPath(data, dialogue, block.sourceRef.startMarker),
      };
      return `<rect ${markData(mark)} x="${x.toFixed(1)}" y="${ySec}" width="${(width - 1).toFixed(
        1,
      )}" height="${SEC_H}" rx="1.5" fill="${INK}" fill-opacity="${index % 2 ? 0.14 : 0.07}">${titleFor(mark)}</rect>`;
    })
    .join("");

  const obsMarks = obsSpans
    .map((span) => {
      const x = X(span.startChar);
      const width = Math.max(X(span.endChar) - x, 2.5);
      const y = yObs + (obsPack.rowOf.get(span) ?? 0) * (ROWH + ROWGAP);
      const mark: MapMark = { kind: "obs", ...span };
      return `<rect ${markData(mark)} x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(
        1,
      )}" height="${ROWH}" rx="1.5">${titleFor(mark)}</rect>`;
    })
    .join("");

  const claimMarks = claimSpans
    .map((span) => {
      const x = X(span.startChar);
      const width = Math.max(X(span.endChar) - x, 2.5);
      const y = yClaims + (claimPack.rowOf.get(span) ?? 0) * (ROWH + ROWGAP);
      const mark: MapMark = { kind: "claim", ...span };
      return `<rect ${markData(mark)} x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(
        1,
      )}" height="${ROWH}" rx="1.5">${titleFor(mark)}</rect>`;
    })
    .join("");

  const anchMarks = anchors
    .map((row) => {
      const startChar = Number.parseInt(row.start_char ?? "", 10) || 0;
      const marker = row.marker ?? "";
      const readingHref = readingMarkerPath(data, dialogue, marker);
      const mark: MapMark = {
        kind: "anch",
        startChar,
        endChar: startChar,
        name: titleCase(row.group ?? ""),
        ref: `${sourceWork} ${marker}`,
        lead: "Anchor occurrence; opens the reading at its marker.",
        href: readingHref ? `${readingHref}#loc-${marker}` : undefined,
      };
      const x = X(startChar);
      return `<rect ${markData(mark)} x="${(x - 3).toFixed(
        1,
      )}" y="${yAnch}" width="6.5" height="6.5" rx="1">${titleFor(mark)}</rect>`;
    })
    .join("");

  const ariaLabel = `Record map of ${titleCase(
    dialogue,
  )}: sections, observations, claims, and anchors on one Stephanus axis`;
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${svgAttr(
    ariaLabel,
  )}">${parts.join("")}${secRects}<g id="g-obs" fill="${ACCENT}" fill-opacity="0.78">${obsMarks}</g><g id="g-claims" fill="${ACCENT}" fill-opacity="0.78">${claimMarks}</g><g id="g-anch" fill="${ACCENT}">${anchMarks}</g></svg>`;

  if (svg.length > RECORD_MAP_MAX_BYTES) return null;
  return { svg, markCount };
}

// A layer directory row (ledger grammar) for the records page.
function recordsLayerRow(pagePath: string, target: string, name: string, count: number, description: string) {
  return `<div class="lgr-row"><div class="lgr-head">${pageLink(
    pagePath,
    target,
    name,
  ).replace('<a ', '<a class="lgr-name" ')}<b class="lgr-n">${groupDigits(count)}</b></div><p class="lgr-epi">${escapeHtml(
    description,
  )}</p></div>`;
}

function markerChip(pagePath: string, data: SiteData, dialogue: string, marker: string, label: string) {
  const readingHref = readingMarkerPath(data, dialogue, marker);
  if (!readingHref) return `<span class="mk">${escapeHtml(label)}</span>`;
  return `<a class="mk" href="${rel(pagePath, readingHref)}#loc-${escapeHtml(marker)}">${escapeHtml(label)}</a>`;
}

function claimKindPhrase(kind: string, count: number) {
  const label = titleCase(kind);
  if (count === 1) return `1 ${label}`;
  const plural = /sis$/iu.test(kind) ? label.replace(/sis$/iu, "ses") : `${label}s`;
  return `${groupDigits(count)} ${plural}`;
}

function whatTheTextAssertsSection(pagePath: string, data: SiteData, dialogue: string): string {
  const claims = data.claims.filter((claim) => claim.dialogue === dialogue && claim.reviewStatus === "accepted");
  if (claims.length === 0) return "";

  const kindCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();
  for (const claim of claims) {
    kindCounts.set(claim.claimKind, (kindCounts.get(claim.claimKind) ?? 0) + 1);
    statusCounts.set(claim.finalStatus, (statusCounts.get(claim.finalStatus) ?? 0) + 1);
  }
  const kindParts = orderedCounts(kindCounts).map(([kind, count]) => claimKindPhrase(kind, count));
  const statusParts = orderedCounts(statusCounts).map(
    ([status, count]) => `${groupDigits(count)} ${titleCase(status).toLowerCase()}`,
  );
  const composition = `Recorded against the text: ${groupDigits(claims.length)} claim${
    claims.length === 1 ? "" : "s"
  }${kindParts.length ? ` — ${kindParts.join(", ")}` : ""}. Final status: ${statusParts.join(", ")}.`;

  // Specimen (a): the accepted claim most cited by commentary blocks (ties →
  // lowest claim id).
  const citeCounts = new Map<string, number>();
  for (const block of data.commentaryByDialogue.get(dialogue)?.blocks ?? []) {
    for (const claimId of block.cites.claims) citeCounts.set(claimId, (citeCounts.get(claimId) ?? 0) + 1);
  }
  const byId = new Map(claims.map((claim) => [claim.claimId, claim]));
  const citedRanking = [...claims]
    .map((claim) => ({ claim, cites: citeCounts.get(claim.claimId) ?? 0 }))
    .sort(
      (a, b) =>
        b.cites - a.cites || (a.claim.claimId < b.claim.claimId ? -1 : a.claim.claimId > b.claim.claimId ? 1 : 0),
    );
  const mostCited = citedRanking[0]?.claim;

  // Specimen (b): the earliest accepted claim whose final status is not
  // left_standing (if none: the second most cited).
  const notStanding = [...claims]
    .filter((claim) => claim.finalStatus !== "left_standing")
    .sort(
      (a, b) =>
        a.sourceRef.startChar - b.sourceRef.startChar ||
        (a.claimId < b.claimId ? -1 : a.claimId > b.claimId ? 1 : 0),
    )[0];
  let second = notStanding ?? citedRanking[1]?.claim;
  if (second && mostCited && second.claimId === mostCited.claimId) {
    second = citedRanking.find((entry) => entry.claim.claimId !== mostCited.claimId)?.claim;
  }

  const specimenCards = [mostCited, second]
    .filter((claim): claim is SiteClaim => Boolean(claim))
    .filter((claim, index, all) => all.findIndex((entry) => entry.claimId === claim.claimId) === index)
    .map((claim) => claimCard(pagePath, data, byId.get(claim.claimId) ?? claim))
    .join("\n");

  return `<section>
  <h2>What the text asserts</h2>
  <p class="prose-note">${escapeHtml(composition)}</p>
  <div class="card-grid">${specimenCards}</div>
  <p class="more-link">${pageLink(
    pagePath,
    `dialogues/${dialogue}/claims.html`,
    `All ${groupDigits(claims.length)} claims`,
  )}</p>
</section>`;
}

function corpusSection(pagePath: string, data: SiteData, dialogue: string): string {
  const relations = dialogueCorpusRelations(data, dialogue);
  if (relations.length === 0) return "";

  type Partner = { dialogue: string; relations: SiteRelation[]; spans: Map<string, string> };
  const partners = new Map<string, Partner>();
  const totalKinds = new Map<string, number>();
  for (const relation of relations) {
    const claimA = data.claimsById.get(relation.claimA);
    const claimB = data.claimsById.get(relation.claimB);
    const thisSide = claimA?.dialogue === dialogue ? claimA : claimB?.dialogue === dialogue ? claimB : claimA;
    const otherSide = thisSide === claimA ? claimB : claimA;
    const partnerDialogue = otherSide?.dialogue ?? dialogue;
    const partner: Partner =
      partners.get(partnerDialogue) ?? { dialogue: partnerDialogue, relations: [], spans: new Map() };
    partner.relations.push(relation);
    if (thisSide) partner.spans.set(thisSide.stephanusSpan, thisSide.sourceRef.startMarker);
    partners.set(partnerDialogue, partner);
    totalKinds.set(relation.relationKind, (totalKinds.get(relation.relationKind) ?? 0) + 1);
  }

  const orderedPartners = [...partners.values()].sort(
    (a, b) => b.relations.length - a.relations.length || (a.dialogue < b.dialogue ? -1 : a.dialogue > b.dialogue ? 1 : 0),
  );

  const kindWord = (kind: string) => titleCase(kind).toLowerCase();
  const partnerRows = orderedPartners
    .map((partner) => {
      const kinds = new Map<string, number>();
      for (const relation of partner.relations) kinds.set(relation.relationKind, (kinds.get(relation.relationKind) ?? 0) + 1);
      const kindPhrase = orderedCounts(kinds)
        .map(([kind, count]) => `${numberWord(count)} ${count === 1 ? kindWord(kind) : `${kindWord(kind)}s`}`)
        .join(", ");
      const chips = [...partner.spans.entries()]
        .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
        .map(([span, marker]) => markerChip(pagePath, data, dialogue, marker, span))
        .join("");
      return `<div class="lgr-row"><div class="lgr-head"><a class="lgr-name" href="${rel(
        pagePath,
        `dialogues/${partner.dialogue}/index.html`,
      )}">${escapeHtml(titleCase(partner.dialogue))}</a><b class="lgr-n">${groupDigits(
        partner.relations.length,
      )}</b></div><p class="lgr-epi">${escapeHtml(`${capitalize(kindPhrase)}, attached here at`)}</p><div class="tags">${chips}</div></div>`;
    })
    .join("");

  const kindSummary = orderedCounts(totalKinds)
    .map(([kind, count]) => `${groupDigits(count)} ${count === 1 ? kindWord(kind) : `${kindWord(kind)}s`}`)
    .join(", ");
  const lede = `${groupDigits(relations.length)} accepted corpus link${
    relations.length === 1 ? "" : "s"
  } join this dialogue's claims to ${groupDigits(orderedPartners.length)} other dialogue${
    orderedPartners.length === 1 ? "" : "s"
  }: ${kindSummary}.`;

  const specimenRelation =
    relations.find((relation) => relation.relationKind === "tension") ?? relations[0];
  const specimen = specimenRelation ? tensionCard(pagePath, data, specimenRelation) : "";

  return `<section>
  <h2>Where it meets the corpus</h2>
  <p class="prose-note">${escapeHtml(lede)}</p>
  <div class="lgr">${partnerRows}</div>
  ${specimen}
  <p class="more-link">${pageLink(pagePath, "relations/index.html", "All corpus links")}</p>
</section>`;
}

function formulaeSection(pagePath: string, data: SiteData, dialogue: string): string {
  const anchors = data.derivedByDialogue.get(dialogue)?.anchors ?? [];
  if (anchors.length === 0) return "";

  const groups = new Map<string, { forms: string[]; markers: Array<{ marker: string }>; count: number }>();
  for (const row of anchors) {
    const group = row.group ?? "";
    const entry = groups.get(group) ?? { forms: [], markers: [], count: 0 };
    entry.count += 1;
    const form = row.form ?? "";
    if (form && !entry.forms.includes(form)) entry.forms.push(form);
    entry.markers.push({ marker: row.marker ?? "" });
    groups.set(group, entry);
  }

  const rows = [...groups.entries()]
    .sort((a, b) => b[1].count - a[1].count || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([group, entry]) => {
      const formList = entry.forms.map((form) => `<span lang="grc">${escapeHtml(form)}</span>`);
      const forms =
        formList.length === 1
          ? `The form found here: ${formList[0]}`
          : `The forms found here: ${formList.slice(0, -1).join(", ")}, and ${formList[formList.length - 1]}`;
      const seenMarkers = new Set<string>();
      const chips = entry.markers
        .filter((entry) => {
          if (seenMarkers.has(entry.marker)) return false;
          seenMarkers.add(entry.marker);
          return true;
        })
        .map((entry) => markerChip(pagePath, data, dialogue, entry.marker, entry.marker))
        .join("");
      return `<div class="lgr-row"><div class="lgr-head"><a class="lgr-name" href="${rel(
        pagePath,
        `anchors/${group}.html`,
      )}">${escapeHtml(titleCase(group))}</a><b class="lgr-n">${groupDigits(
        entry.count,
      )}</b></div><p class="lgr-epi">${forms}</p><div class="tags">${chips}</div></div>`;
    })
    .join("");

  return `<section>
  <h2>Verbal formulae</h2>
  <p class="section-lede">Anchor occurrences in this dialogue; each locator opens the reading at its marker.</p>
  <div class="lgr">${rows}</div>
</section>`;
}

function turnsStructureSection(pagePath: string, data: SiteData, dialogue: string): string {
  const derived = data.derivedByDialogue.get(dialogue);
  const speakers = derived?.speakers ?? [];
  const turns = derived?.turns ?? [];
  // turns.html is emitted only for dialogues that have turns; nothing to say
  // (and no page to link) without them.
  if (turns.length === 0) return "";
  const turnsLink = pageLink(pagePath, `dialogues/${dialogue}/turns.html`, "Turn index");
  const structureLink = pageLink(pagePath, `dialogues/${dialogue}/structure.html`, "Structure tables");
  const isUnattributed =
    data.unattributedDialogues.includes(dialogue) ||
    (speakers.length === 1 && (speakers[0]?.speaker ?? "") === "(unattributed)");

  if (isUnattributed) {
    const tokens = Number.parseInt(speakers[0]?.total_tokens ?? "0", 10) || 0;
    const span = turns.length
      ? `${turns[0]?.start_marker ?? ""}-${turns[turns.length - 1]?.end_marker ?? ""}`
      : "";
    return `<section>
  <h2>Turns &amp; structure</h2>
  <p class="prose-note">The source prints no sigla, so the generated index holds a single unattributed turn of ${groupDigits(
    tokens,
  )} tokens${span ? ` spanning ${escapeHtml(span)}` : ""}. Where each record falls is on the record map above.</p>
  <p class="more-link">${turnsLink} — ${structureLink}</p>
</section>`;
  }

  const observationCountByTurnId = new Map<string, number>();
  const strip = structureStripSvg({
    dialogue,
    turns,
    speakers,
    observationCountByTurnId,
    turnPageById: data.turnPageById,
    pagePath,
    includeObservationTicks: false,
  });
  const speakerRows = speakers
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.speaker === "(none)" ? "(unattributed)" : (row.speaker ?? ""))}</td><td class="num">${escapeHtml(
          row.turns ?? "0",
        )}</td><td class="num">${escapeHtml(row.total_tokens ?? "0")}</td><td class="num">${escapeHtml(
          row.median_tokens ?? "0",
        )}</td><td class="num">${escapeHtml(row.p90_tokens ?? "0")}</td><td class="num">${escapeHtml(
          row.long_turns ?? "0",
        )}</td></tr>`,
    )
    .join("");

  return `<section>
  <h2>Turns &amp; structure</h2>
  <p class="section-lede">Who speaks, in reading order, and how the turns distribute across speakers.</p>
  <figure class="structure-strip">${strip}</figure>
  <table><thead><tr><th>Speaker</th><th>Turns</th><th>Tokens</th><th>Median</th><th>P90</th><th>Long turns</th></tr></thead><tbody>${speakerRows}</tbody></table>
  <p class="more-link">${turnsLink} — ${structureLink}</p>
</section>`;
}

function dialogueRecordsPage(data: SiteData, dialogue: string, observations: SiteObservation[]) {
  const pagePath = `dialogues/${dialogue}/records.html`;
  const sourceWork = observations[0]?.sourceWork ?? titleCase(dialogue);
  const accepted = observations.filter((observation) => observation.reviewStatus === "accepted");
  const claims = data.claims.filter((claim) => claim.dialogue === dialogue && claim.reviewStatus === "accepted");
  const corpusLinks = dialogueCorpusRelations(data, dialogue);
  const derived = data.derivedByDialogue.get(dialogue);
  const commentary = data.commentaryByDialogue.get(dialogue);
  const markers = data.stephanusByDialogue.get(dialogue) ?? [];
  const anchorCount = derived?.anchors.length ?? 0;

  // The record map — static SVG, or an honest withheld notice when the single
  // axis would exceed its budget (a plan STOP condition; the layer directory
  // and card lists below still reach every record).
  const map = recordMapSvg(data, dialogue, sourceWork, accepted, claims, markers);
  const familyCounts = orderedCounts(
    new Map(
      [...groupBy(accepted, (observation) => observation.featureFamily).entries()].map(([family, entries]) => [
        family,
        entries.length,
      ]),
    ),
  );
  const chips = map
    ? `<div class="lane-chips" role="group" aria-label="Filter observations by family" data-map-chips>
    <span class="chips-label">Observations</span>
    <button type="button" class="map-chip is-on" data-fam="" data-label="All">All</button>
    ${familyCounts
      .map(
        ([family, count]) =>
          `<button type="button" class="map-chip" data-fam="${escapeHtml(family)}" data-label="${escapeHtml(
            titleCase(family),
          )}">${escapeHtml(titleCase(family))}<b class="n">${groupDigits(count)}</b></button>`,
      )
      .join("\n    ")}
  </div>`
    : "";
  const mapSection = map
    ? `<section data-record-map data-obs="${accepted.length}" data-claims="${claims.length}" data-anch="${anchorCount}">
  <h2>The record map</h2>
  <p class="section-lede">Every record placed on the text, on one Stephanus axis. Sections follow the guided reading's units.</p>
  ${chips}
  <figure class="map-fig">
    ${map.svg}
    <p class="map-status" role="status" aria-live="polite" data-map-status>Showing all ${groupDigits(
      accepted.length,
    )} observations, ${groupDigits(claims.length)} claims, and ${groupDigits(
      anchorCount,
    )} anchor occurrences.</p>
    <figcaption class="map-caption">Hover a mark for the record; clicking opens it in its card list. Without scripts the marks still render and carry native titles; filtering and the floating card are enhancements.</figcaption>
  </figure>
</section>`
    : `<section>
  <h2>The record map</h2>
  <p class="section-lede">Every record placed on the text, on one Stephanus axis.</p>
  <p class="map-withheld">This dialogue holds ${groupDigits(
    accepted.length + claims.length + anchorCount,
  )} accepted records — beyond the single-axis map's budget. Rather than draw a crowded or truncated map, it is withheld here pending a sharding design; every record remains listed below and browsable in full.</p>
</section>`;

  // What is recorded — the layer directory.
  const firstShard = data.shards.find((shard) => shard.dialogue === dialogue);
  const layers: string[] = [];
  if (firstShard) {
    layers.push(
      recordsLayerRow(
        pagePath,
        firstShard.path,
        "Observation records",
        accepted.length,
        "Reviewed textual facts, each tied to its span: what the text does, on what basis, within what limits.",
      ),
    );
  }
  if (claims.length) {
    layers.push(
      recordsLayerRow(
        pagePath,
        `dialogues/${dialogue}/claims.html`,
        "Claims",
        claims.length,
        "What the text asserts, span by span, each carrying its status at the dialogue's end.",
      ),
    );
  }
  if (corpusLinks.length) {
    layers.push(
      recordsLayerRow(
        pagePath,
        "relations/index.html",
        "Corpus links",
        corpusLinks.length,
        "Relations joining this dialogue's claims to claims elsewhere in the corpus, each stating its basis and limits.",
      ),
    );
  }
  if (anchorCount) {
    layers.push(
      recordsLayerRow(
        pagePath,
        "anchors/index.html",
        "Anchors",
        anchorCount,
        "Occurrences of fixed verbal formulae — assent phrases, oath forms, definition prompts — located marker by marker.",
      ),
    );
  }
  if (derived?.turns.length) {
    layers.push(
      recordsLayerRow(
        pagePath,
        `dialogues/${dialogue}/turns.html`,
        "Turns & structure",
        derived.turns.length,
        "The generated conversational index: turns, speakers, lengths, and long-turn flags.",
      ),
    );
  }
  if (commentary) {
    layers.push(
      recordsLayerRow(
        pagePath,
        `dialogues/${dialogue}/reading.html`,
        "Commentary",
        commentary.blocks.length,
        "The guided reading's sections and notes, in the model's voice, citing the records above. Read alongside the text.",
      ),
    );
  }

  return layout(
    pagePath,
    `${titleCase(dialogue)} — Records & data`,
    `<section class="hero">
  <p class="crumb">${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</p>
  <h1>Records &amp; data</h1>
  <p class="hero-lede">What the wiki holds on the ${escapeHtml(
    titleCase(dialogue),
  )}: reviewed observations of what the text does, claims of what it asserts, the links that carry those claims across the corpus, and the formulas and turn measures underneath.</p>
  <p class="dim">Every record on this page is review-accepted; counts include accepted records only.</p>
</section>
${mapSection}
<section>
  <h2>What is recorded</h2>
  <div class="lgr">${layers.join("")}</div>
</section>
${whatTheTextAssertsSection(pagePath, data, dialogue)}
${corpusSection(pagePath, data, dialogue)}
${formulaeSection(pagePath, data, dialogue)}
${turnsStructureSection(pagePath, data, dialogue)}`,
    navState(data),
  );
}

function observationShardPage(data: SiteData, shard: ObservationShard) {
  const pagePath = shard.path;
  const observations = shard.observations;
  return layout(
    pagePath,
    `${titleCase(shard.dialogue)} ${shard.key}`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, `dialogues/${shard.dialogue}/index.html`, titleCase(shard.dialogue))}</p>
  <h1>${escapeHtml(titleCase(shard.dialogue))}: ${escapeHtml(shard.key)}</h1>
  <div class="metrics">${metric("observations", observations.length)}</div>
</section>
${filterControls({
  families: [...new Set(observations.map((observation) => observation.featureFamily))].sort(),
  labels: [...new Set(observations.map((observation) => observation.featureLabel))].sort(),
  statuses: [...new Set(observations.map((observation) => observation.reviewStatus))].sort(),
  placeholder: "Observation text",
})}
<section class="records">${observations.map((observation) => observationCard(pagePath, data, observation)).join("\n")}</section>`,
    navState(data),
  );
}

function turnShardPage(data: SiteData, shard: TurnShard) {
  const pagePath = shard.path;
  const dialogueShards = data.turnShards.filter((entry) => entry.dialogue === shard.dialogue);
  const dialogueTurnCount = dialogueShards.reduce((total, entry) => total + entry.turns.length, 0);
  const dialogueDerived = data.derivedByDialogue.get(shard.dialogue);
  const unattributed =
    dialogueTurnCount === 1 && dialogueDerived?.speakers.length === 1 && dialogueDerived.speakers[0]?.speaker === "(unattributed)";
  const partSuffix = shard.partCount > 1 ? ` (part ${shard.part} of ${shard.partCount})` : "";
  const partLinks =
    shard.partCount > 1
      ? `<nav class="part-nav" aria-label="Turn pages">${dialogueShards
          .map((entry) =>
            entry.part === shard.part
              ? `<strong aria-current="page">${entry.part}</strong>`
              : pageLink(pagePath, entry.path, String(entry.part)),
          )
          .join(" ")}</nav>`
      : "";
  const anchorsByTurn = groupBy(dialogueDerived?.anchors ?? [], (row) => row.turn_id ?? "");
  const cards = shard.turns
    .map((turn) => {
      const turnId = turn.turn_id ?? "";
      const speaker = turn.speaker === "(none)" ? "(unattributed)" : (turn.speaker ?? "");
      const observations = (data.observationIdsByTurnId.get(turnId) ?? []).map((observationId) =>
        requiredIdLink(
          pagePath,
          data.observationPageById.get(observationId),
          observationId,
          "observation",
        ),
      );
      const anchors = (anchorsByTurn.get(turnId) ?? []).map((anchor) => {
        const group = anchor.group ?? "";
        const marker = anchor.marker ? ` ${anchor.marker}` : "";
        return pageLink(pagePath, `anchors/${group}.html`, `${group}${marker}`);
      });
      const flags = [
        turn.dialogue_long_turn === "yes" ? "dialogue long turn" : "",
        turn.speaker_long_turn === "yes" ? "speaker long turn" : "",
      ].filter(Boolean);
      return `<article class="record turn-record" id="${escapeHtml(turnId)}" data-search="${escapeHtml(
        `${turnId} ${speaker} ${turn.start_marker ?? ""} ${turn.end_marker ?? ""}`.toLowerCase(),
      )}">
  <div class="record-head">
    <div><h2 class="record-heading"><a class="record-id" href="#${escapeHtml(turnId)}">${escapeHtml(
      turnId,
    )}</a></h2><p>${escapeHtml(turn.start_marker ?? "")}-${escapeHtml(turn.end_marker ?? "")}</p></div>
    <div class="badges">${badge(speaker)}${flags.map((flag) => badge(flag)).join("")}</div>
  </div>
  <dl class="meta">
    <div><dt>characters</dt><dd>${escapeHtml(turn.greek_char_count ?? "not available")}</dd></div>
    <div><dt>tokens</dt><dd>${escapeHtml(turn.token_count ?? "not available")}</dd></div>
    <div><dt>coordinates</dt><dd>${escapeHtml(turn.start_char ?? "")}-${escapeHtml(turn.end_char ?? "")}</dd></div>
    <div><dt>observations</dt><dd>${observations.length ? observations.join(", ") : "None joined."}</dd></div>
    <div><dt>anchors</dt><dd>${anchors.length ? anchors.join(", ") : "None indexed."}</dd></div>
  </dl>
</article>`;
    })
    .join("\n");

  return layout(
    pagePath,
    `${titleCase(shard.dialogue)} Turns${partSuffix}`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, `dialogues/${shard.dialogue}/index.html`, titleCase(shard.dialogue))}</p>
  <h1>${escapeHtml(titleCase(shard.dialogue))} Turns${escapeHtml(partSuffix)}</h1>
  <div class="metrics">${metric("turns", dialogueTurnCount)}${metric("this part", shard.turns.length)}</div>
</section>
${unattributed ? '<p class="panel dim">The generated index contains one whole-dialogue unattributed turn; no speaker is inferred.</p>' : ""}
${partLinks}
<section class="records">${cards}</section>
${partLinks}`,
    navState(data),
  );
}

function structurePage(data: SiteData, dialogue: string, derived: DialogueDerived | undefined) {
  const pagePath = `dialogues/${dialogue}/structure.html`;
  const longTurns = (derived?.turns ?? []).filter((row) => row.dialogue_long_turn === "yes" || row.speaker_long_turn === "yes");
  const longTurnRows = longTurns
    .slice(0, 100)
    .map(
      (row) =>
        `<tr><td>${turnLink(pagePath, data, row.turn_id ?? "")}</td><td>${escapeHtml(
          row.speaker === "(none)" ? "(unattributed)" : (row.speaker ?? ""),
        )}</td><td>${escapeHtml(
          row.start_marker ?? "",
        )}-${escapeHtml(row.end_marker ?? "")}</td><td>${escapeHtml(row.token_count ?? "")}</td></tr>`,
    )
    .join("");
  const longTurnSummary = derived?.turns.length
    ? `<p>${
        longTurns.length > 100
          ? `Showing 100 of ${longTurns.length} long turns. `
          : `${longTurns.length} long ${longTurns.length === 1 ? "turn" : "turns"}. `
      }${pageLink(pagePath, `dialogues/${dialogue}/turns.html`, "Browse all turns")}</p>`
    : "<p>No turns indexed.</p>";
  const procedureRows = (derived?.procedure ?? [])
    .slice(0, 100)
    .map((row) => `<tr>${Object.values(row).map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`)
    .join("");
  const procedureHeaders = Object.keys(derived?.procedure[0] ?? {})
    .map((key) => `<th>${escapeHtml(key)}</th>`)
    .join("");
  const procedureSummary = (derived?.procedure.length ?? 0) > 100
    ? `<p>Showing 100 of ${derived?.procedure.length ?? 0} procedure candidates.</p>`
    : "";
  const speakerRows = (derived?.speakers ?? [])
    .map((row) => `<tr>${["speaker", "turns", "total_tokens", "median_tokens", "p90_tokens", "max_tokens", "long_turns"]
      .map((key) => `<td>${escapeHtml(row[key] ?? "")}</td>`)
      .join("")}</tr>`)
    .join("");
  const assentRows = (derived?.assent ?? [])
    .map((row) => {
      const startTurnId = row.start_turn_id ?? "";
      const endTurnId = row.end_turn_id ?? "";
      const range = startTurnId === endTurnId
        ? turnLink(pagePath, data, startTurnId)
        : `${turnLink(pagePath, data, startTurnId)} – ${turnLink(pagePath, data, endTurnId)}`;
      return `<tr><td>${escapeHtml(row.stretch_id ?? "")}</td><td>${escapeHtml(
        row.speaker === "(none)" ? "(unattributed)" : (row.speaker ?? ""),
      )}</td><td>${range}</td><td>${escapeHtml(row.turn_count ?? "")}</td><td>${escapeHtml(
        row.assent_token_ids ?? "",
      )}</td></tr>`;
    })
    .join("");

  return layout(
    pagePath,
    `${titleCase(dialogue)} Structure`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</p>
  <h1>${escapeHtml(titleCase(dialogue))} Structure</h1>
  <div class="metrics">
    ${metric("turns", derived?.turns.length ?? 0)}
    ${metric("speakers", derived?.speakers.length ?? 0)}
    ${metric("anchor occurrences", derived?.anchors.length ?? 0)}
    ${metric("procedure candidates", derived?.procedure.length ?? 0)}
    ${metric("assent stretches", derived?.assent.length ?? 0)}
  </div>
</section>
<section>
  <h2>Speaker Metrics</h2>
  <table><thead><tr><th>Speaker</th><th>Turns</th><th>Tokens</th><th>Median</th><th>P90</th><th>Max</th><th>Long Turns</th></tr></thead><tbody>${speakerRows}</tbody></table>
</section>
<section>
  <h2>Long Turns</h2>
  ${longTurnSummary}
  <table><thead><tr><th>Turn</th><th>Speaker</th><th>Span</th><th>Tokens</th></tr></thead><tbody>${longTurnRows}</tbody></table>
</section>
<section>
  <h2>Procedure Candidates</h2>
  ${procedureSummary}
  <table><thead><tr>${procedureHeaders}</tr></thead><tbody>${procedureRows}</tbody></table>
</section>
<section>
  <h2>Assent Stretches</h2>
  <table><thead><tr><th>Stretch</th><th>Speaker</th><th>Turns</th><th>Count</th><th>Token IDs</th></tr></thead><tbody>${assentRows}</tbody></table>
</section>`,
    navState(data),
  );
}

function claimsPage(data: SiteData, shard: ClaimShard) {
  const pagePath = shard.path;
  const dialogueClaims = data.claims.filter((claim) => claim.dialogue === shard.dialogue);
  const partSuffix = shard.partCount > 1 ? ` (part ${shard.part} of ${shard.partCount})` : "";
  const partLinks =
    shard.partCount > 1
      ? `<p>${data.claimShards
          .filter((entry) => entry.dialogue === shard.dialogue)
          .map((entry) =>
            entry.part === shard.part ? `<strong>${entry.part}</strong>` : pageLink(pagePath, entry.path, String(entry.part)),
          )
          .join(" ")}</p>`
      : "";
  const legacyResolvers =
    shard.part === 1 && shard.partCount > 1
      ? data.claimShards
          .filter((entry) => entry.dialogue === shard.dialogue && entry.part > 1)
          .flatMap((entry) => entry.claims.map((claim) => ({ claim, part: entry.part })))
          .map(({ claim, part }) => {
            const target = data.claimPageById.get(claim.claimId);
            const parsed = splitTarget(target ?? "");
            const link = target ? pageLink(pagePath, parsed.path, claim.claimId, parsed.hash) : escapeHtml(claim.claimId);
            return `<li id="${escapeHtml(claim.claimId)}">${link} <span>moved to part ${part}</span></li>`;
          })
          .join("")
      : "";
  return layout(
    pagePath,
    `${titleCase(shard.dialogue)} Claims${partSuffix}`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, `dialogues/${shard.dialogue}/index.html`, titleCase(shard.dialogue))}</p>
  <h1>${escapeHtml(titleCase(shard.dialogue))} Claims${escapeHtml(partSuffix)}</h1>
  <div class="metrics">
    ${metric("claims", dialogueClaims.length)}
    ${metric("this part", shard.claims.length)}
    ${metric("accepted", dialogueClaims.filter((claim) => claim.reviewStatus === "accepted").length)}
    ${metric("standing", dialogueClaims.filter((claim) => claim.finalStatus === "left_standing").length)}
  </div>
  ${partLinks}
</section>
${filterControls({
  statuses: [...new Set(shard.claims.map((claim) => claim.reviewStatus))].sort(),
  placeholder: "Claim text",
})}
<section class="records">${shard.claims.map((claim) => claimCard(pagePath, data, claim)).join("\n")}</section>
${legacyResolvers ? `<details class="legacy-resolvers"><summary>Legacy claim fragments on later parts</summary><ul class="source-list">${legacyResolvers}</ul></details>` : ""}`,
    navState(data),
  );
}

function relationsPage(data: SiteData, shard: RelationShard, hasDialogueIndex: boolean) {
  const pagePath = shard.path;
  const backLink = hasDialogueIndex
    ? pageLink(pagePath, `dialogues/${shard.dialogue}/index.html`, titleCase(shard.dialogue))
    : pageLink(pagePath, "index.html", "Index");
  const partSuffix = shard.partCount > 1 ? ` (part ${shard.part} of ${shard.partCount})` : "";
  const partLinks =
    shard.partCount > 1
      ? `<p>${data.relationShards
          .filter((entry) => entry.dialogue === shard.dialogue)
          .map((entry) =>
            entry.part === shard.part ? `<strong>${entry.part}</strong>` : pageLink(pagePath, entry.path, String(entry.part)),
          )
          .join(" ")}</p>`
      : "";
  return layout(
    pagePath,
    `${titleCase(shard.dialogue)} Relations${partSuffix}`,
    `<section class="hero compact">
  <p>${backLink}</p>
  <h1>${escapeHtml(titleCase(shard.dialogue))} Relations${escapeHtml(partSuffix)}</h1>
  <div class="metrics">${metric("relations", shard.relations.length)}</div>
  ${partLinks}
</section>
<section class="records">${shard.relations.map((relation) => relationCard(pagePath, data, relation)).join("\n")}</section>`,
    navState(data),
  );
}

function familyPage(data: SiteData, family: string, observations: SiteObservation[]) {
  const pagePath = `families/${family}.html`;
  const clusterLink = data.clusters.some((cluster) => cluster.family === family)
    ? ` ${pageLink(pagePath, `clusters/${family}.html`, "Cluster page")}`
    : "";
  const dossiersByLabel = new Map(data.dossiers.filter((dossier) => dossier.family === family).map((dossier) => [dossier.label, dossier]));
  const grouped = [...groupBy(observations, (observation) => observation.featureLabel).entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const recurring = grouped.filter(([, entries]) => entries.length > 1);
  const singletons = grouped.filter(([, entries]) => entries.length === 1);
  const rows = (entries: Array<[string, SiteObservation[]]>) =>
    entries
      .map(([label, labelObservations]) => {
        const sampleLinks = labelObservations
          .slice(0, 12)
          .map((observation) => observationLink(pagePath, data, observation))
          .join(", ");
        return `<tr class="filter-item" data-label="${escapeHtml(label)}" data-search="${escapeHtml(
          `${label} ${labelObservations.map((observation) => observation.observationId).join(" ")}`.toLowerCase(),
        )}"><td>${dossierLink(pagePath, dossiersByLabel.get(label), label)}</td><td>${labelObservations.length}</td><td>${
          new Set(labelObservations.map((observation) => observation.dialogue)).size
        }</td><td>${sampleLinks}</td></tr>`;
      })
      .join("");

  return layout(
    pagePath,
    family,
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}${clusterLink}</p>
  <h1>${escapeHtml(family)}</h1>
  <div class="metrics">
    ${metric("observations", observations.length)}
    ${metric("recurring labels", recurring.length)}
    ${metric("singletons", singletons.length)}
    ${metric("dialogues", new Set(observations.map((observation) => observation.dialogue)).size)}
  </div>
</section>
${filterControls({ labels: grouped.map(([label]) => label), placeholder: "Label or record id" })}
<section>
  <h2>Recurring Labels</h2>
  <table><thead><tr><th>Label</th><th>Observations</th><th>Dialogues</th><th>Sample Records</th></tr></thead><tbody>${rows(recurring)}</tbody></table>
</section>
<section>
  <h2>Singleton Labels</h2>
  <table><thead><tr><th>Label</th><th>Observations</th><th>Dialogues</th><th>Record</th></tr></thead><tbody>${rows(singletons)}</tbody></table>
</section>`,
    navState(data),
  );
}

function registryPage(data: SiteData) {
  const pagePath = "registry.html";
  const parts = data.registryShards
    .map(
      (shard) =>
        `<li>${pageLink(pagePath, shard.path, `Part ${shard.part}`)} <span>${shard.entries.length} entries</span></li>`,
    )
    .join("");
  return layout(
    pagePath,
    "Registry",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Feature Registry</h1>
  <div class="metrics">${metric("candidates", data.registry.length)}${metric("parts", data.registryShards.length)}</div>
</section>
<section><h2>Registry Parts</h2><ul class="link-list">${parts}</ul></section>`,
    navState(data),
  );
}

function registryShardPage(data: SiteData, shard: RegistryShard) {
  const pagePath = shard.path;
  const rows = shard.entries
    .map((entry) => {
      const observationLinks = entry.observations
        .slice(0, 20)
        .map((observationId) => {
          const observation = data.observationsById.get(observationId);
          return observation ? observationLink(pagePath, data, observation) : escapeHtml(observationId);
        })
        .join(", ");
      return `<tr class="filter-item" id="${escapeHtml(entry.id)}" data-family="${escapeHtml(entry.family)}" data-status="${escapeHtml(entry.status)}" data-search="${escapeHtml(`${entry.id} ${entry.proposedName} ${entry.notes}`.toLowerCase())}"><td><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.id)}</a></td><td>${pageLink(
        pagePath,
        `families/${entry.family}.html`,
        entry.family,
      )}</td><td>${escapeHtml(entry.proposedName)}</td><td>${badge(entry.status)}</td><td>${entry.observations.length}</td><td>${observationLinks}</td><td>${escapeHtml(
        entry.notes,
      )}</td></tr>`;
    })
    .join("");
  const partLinks = data.registryShards
    .map((entry) =>
      entry.part === shard.part ? `<strong>${entry.part}</strong>` : pageLink(pagePath, entry.path, String(entry.part)),
    )
    .join(" ");

  return layout(
    pagePath,
    `Registry Part ${shard.part}`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, "registry.html", "Feature Registry")}</p>
  <h1>Feature Registry (part ${shard.part} of ${shard.partCount})</h1>
  <div class="metrics">${metric("total candidates", data.registry.length)}${metric("this part", shard.entries.length)}</div>
  <p>${partLinks}</p>
</section>
${filterControls({
  families: [...new Set(shard.entries.map((entry) => entry.family))].sort(),
  statuses: [...new Set(shard.entries.map((entry) => entry.status))].sort(),
  placeholder: "Registry ID, name, or notes",
})}
<table><thead><tr><th>ID</th><th>Family</th><th>Name</th><th>Status</th><th>Observation Count</th><th>Sample Observations</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function clusterIndexPage(data: SiteData, clusters: SiteCluster[]) {
  const pagePath = "clusters/index.html";
  const byFamily = [...groupBy(clusters, (cluster) => cluster.family).entries()].sort(([a], [b]) => a.localeCompare(b));
  const rows = byFamily
    .map(
      ([family, entries]) =>
        `<tr><td>${pageLink(pagePath, `clusters/${family}.html`, family)}</td><td>${entries.length}</td><td>${[
          ...new Set(entries.flatMap((entry) => entry.dialogues)),
        ]
          .sort()
          .join(", ")}</td></tr>`,
    )
    .join("");

  return layout(
    pagePath,
    "Clusters",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Clusters</h1>
  <div class="metrics">${metric("clusters", clusters.length)}${metric("families", byFamily.length)}</div>
</section>
<table><thead><tr><th>Family</th><th>Clusters</th><th>Dialogues</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function clusterFamilyPage(data: SiteData, family: string, clusters: SiteCluster[]) {
  const pagePath = `clusters/${family}.html`;
  const body = clusters
    .map((cluster) => {
      const links = cluster.observations
        .map((clusterObservation) => {
          const observation = data.observationsById.get(clusterObservation.observationId);
          const source = observation?.sourceRef;
          return `<li>${observation ? observationLink(pagePath, data, observation) : escapeHtml(clusterObservation.observationId)}
            <span>${escapeHtml(clusterObservation.dialogue)} ${escapeHtml(clusterObservation.stephanusSpan)}</span>
            <code>${escapeHtml(source ? `${source.sourcePath}:${source.stephanusSpan}` : cluster.path)}</code></li>`;
        })
        .join("");
      return `<article class="record">
  <div class="record-head">
    <div><h2>${escapeHtml(cluster.label)}</h2><p>${escapeHtml(cluster.dialogues.join(", "))}</p></div>
    ${badge(`${cluster.observations.length} observations`)}
  </div>
  <ul class="source-list">${links}</ul>
</article>`;
    })
    .join("");

  return layout(
    pagePath,
    `${family} Clusters`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, "clusters/index.html", "Clusters")} ${pageLink(pagePath, `families/${family}.html`, "Family page")}</p>
  <h1>${escapeHtml(family)} clusters</h1>
  <div class="metrics">${metric("clusters", clusters.length)}</div>
</section>
<section class="records">${body}</section>`,
    navState(data),
  );
}

function dossierIndexPage(data: SiteData) {
  const pagePath = "dossiers/index.html";
  const rows = data.dossiers
    .map(
      (dossier) =>
        `<tr class="filter-item" data-family="${escapeHtml(dossier.family)}" data-label="${escapeHtml(
          dossier.label,
        )}" data-search="${escapeHtml(`${dossier.family} ${dossier.label}`.toLowerCase())}"><td>${pageLink(
          pagePath,
          dossier.pagePath,
          dossier.family,
        )}</td><td>${pageLink(pagePath, dossier.pagePath, dossier.label, `#${dossier.dossierId}`)}</td><td>${
          dossier.acceptedObservations
        }</td><td>${dossier.dialogues}</td><td>${dossier.counterRecords}</td></tr>`,
    )
    .join("");
  return layout(
    pagePath,
    "Dossiers",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Dossiers</h1>
  <div class="metrics">${metric("dossiers", data.dossiers.length)}${metric(
    "families",
    new Set(data.dossiers.map((dossier) => dossier.family)).size,
  )}</div>
</section>
${filterControls({
  families: [...new Set(data.dossiers.map((dossier) => dossier.family))].sort(),
  labels: [...new Set(data.dossiers.map((dossier) => dossier.label))].sort(),
  placeholder: "Dossier",
})}
<table><thead><tr><th>Family</th><th>Label</th><th>Accepted</th><th>Dialogues</th><th>Counter Records</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function dossierPage(data: SiteData, dossier: SiteDossier) {
  const pagePath = dossier.pagePath;
  const instanceRows = dossier.instances
    .map((instance) => {
      const observation = data.observationsById.get(instance.id);
      return `<tr><td>${observation ? observationLink(pagePath, data, observation) : escapeHtml(instance.id)}</td><td>${escapeHtml(
        instance.dialogue,
      )}</td><td>${escapeHtml(instance.span)}</td><td>${escapeHtml(instance.speakers)}</td><td>${instance.turnCount}</td></tr>`;
    })
    .join("");
  const presenceRows = dossier.presence
    .map(
      (entry) =>
        `<tr class="${entry.acceptedObservations === 0 ? "zero" : ""}"><td>${pageLink(
          pagePath,
          `dialogues/${entry.dialogue}/index.html`,
          entry.dialogue,
        )}</td><td>${entry.acceptedObservations}</td></tr>`,
    )
    .join("");
  const coRows = dossier.cooccurrence
    .map((entry) => {
      const target = data.dossierPageByFamilyLabel.get(dossierFamilyLabelKey(entry.family, entry.label));
      const label = target ? idLink(pagePath, target, entry.label) : escapeHtml(entry.label);
      return `<tr><td>${pageLink(pagePath, `families/${entry.family}.html`, entry.family)}</td><td>${label}</td><td>${entry.overlappingObservations}</td></tr>`;
    })
    .join("");
  const counterevidence = dossier.counterIds.length
    ? `<ul class="source-list">${dossier.counterIds
        .map((observationId) => {
          const observation = data.observationsById.get(observationId);
          if (!observation) throw new Error(`Unknown dossier counter-record target: ${observationId}.`);
          return `<li>${requiredIdLink(
            pagePath,
            data.observationPageById.get(observationId),
            observationId,
            "dossier counter-record",
          )}</li>`;
        })
        .join("")}</ul>`
    : '<p class="dim">No counterevidence recorded.</p>';

  return layout(
    pagePath,
    `${dossier.family}/${dossier.label}`,
    `<section class="hero compact" id="${escapeHtml(dossier.dossierId)}">
  <p>${pageLink(pagePath, "dossiers/index.html", "Dossiers")} ${pageLink(pagePath, `families/${dossier.family}.html`, "Family")}</p>
  <h1>${escapeHtml(dossier.label)}</h1>
  <div class="metrics">
    ${metric("accepted observations", dossier.acceptedObservations)}
    ${metric("dialogues", dossier.dialogues)}
    ${metric("counter records", dossier.counterRecords)}
  </div>
</section>
<section>
  <h2>Instances</h2>
  <table><thead><tr><th>ID</th><th>Dialogue</th><th>Span</th><th>Speakers</th><th>Turns</th></tr></thead><tbody>${instanceRows}</tbody></table>
</section>
<section class="split">
  <div>
    <h2>Presence</h2>
    <table><thead><tr><th>Dialogue</th><th>Accepted</th></tr></thead><tbody>${presenceRows}</tbody></table>
  </div>
  <div>
    <h2>Co-occurrence</h2>
    <table><thead><tr><th>Family</th><th>Label</th><th>Overlap</th></tr></thead><tbody>${coRows}</tbody></table>
  </div>
</section>
<section>
  <h2>Counterevidence</h2>
  ${counterevidence}
</section>`,
    navState(data),
  );
}

function anchorsIndexPage(data: SiteData) {
  const pagePath = "anchors/index.html";
  const allAnchors = [...data.derivedByDialogue.values()].flatMap((derived) => derived.anchors);
  const rows = countBy(allAnchors, (row) => row.group ?? "")
    .map(([group, entries]) => `<tr><td>${pageLink(pagePath, `anchors/${group}.html`, group)}</td><td>${entries.length}</td></tr>`)
    .join("");
  return layout(
    pagePath,
    "Anchors",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Anchors</h1>
  <div class="metrics">${metric("groups", countBy(allAnchors, (row) => row.group ?? "").length)}${metric(
    "occurrences",
    allAnchors.length,
  )}</div>
</section>
<table><thead><tr><th>Group</th><th>Occurrences</th></tr></thead><tbody>${rows}</tbody></table>`,
    navState(data),
  );
}

function anchorsGroupPage(data: SiteData, group: string, rows: Array<ToonRow & { dialogue: string }>) {
  const pagePath = `anchors/${group}.html`;
  const body = rows
    .map(
      (row) =>
        `<tr><td>${pageLink(pagePath, `dialogues/${row.dialogue}/index.html`, row.dialogue)}</td><td>${escapeHtml(
          row.form ?? "",
        )}</td><td>${escapeHtml(row.marker ?? "")}</td><td>${turnLink(
          pagePath,
          data,
          row.turn_id ?? "",
        )}</td><td>${escapeHtml(
          row.token_ids ?? "",
        )}</td></tr>`,
    )
    .join("");
  return layout(
    pagePath,
    `${group} Anchors`,
    `<section class="hero compact">
  <p>${pageLink(pagePath, "anchors/index.html", "Anchors")}</p>
  <h1>${escapeHtml(group)}</h1>
  <div class="metrics">${metric("occurrences", rows.length)}${metric(
    "dialogues",
    new Set(rows.map((row) => row.dialogue)).size,
  )}</div>
</section>
<table><thead><tr><th>Dialogue</th><th>Form</th><th>Marker</th><th>Turn</th><th>Tokens</th></tr></thead><tbody>${body}</tbody></table>`,
    navState(data),
  );
}

function markdownPanel(title: string, content: string) {
  return `<section>
  <h2>${escapeHtml(title)}</h2>
  <pre>${escapeHtml(content || "Not present.")}</pre>
</section>`;
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function share(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function provenanceDetails(summary: string, content: string, unavailable: string) {
  return content
    ? `<details class="provenance"><summary>${escapeHtml(summary)}</summary><pre>${escapeHtml(content)}</pre></details>`
    : `<p class="dim">${escapeHtml(unavailable)}</p>`;
}

function qualityPage(data: SiteData) {
  const pagePath = "quality.html";
  const accepted = data.labelQuality.acceptedOnly;
  const coverage = data.labelQuality.dispositionCoverage;
  const singletonShare = share(accepted.singletonLabels, accepted.totalLabels);
  const singletonCoverage = share(
    coverage.coveredSingletons,
    coverage.coveredSingletons + coverage.uncoveredSingletons,
  );
  const participationRows = [...data.labelQuality.perDialogueParticipation]
    .sort(
      (a, b) =>
        a.crossDialogueObservationShare - b.crossDialogueObservationShare ||
        a.dialogue.localeCompare(b.dialogue),
    )
    .map(
      (entry) => `<tr>
  <td>${pageLink(pagePath, `dialogues/${entry.dialogue}/index.html`, titleCase(entry.dialogue))}</td>
  <td>${entry.acceptedObservations}</td>
  <td>${entry.crossDialogueLabels}</td>
  <td>${entry.crossDialogueObservations}</td>
  <td>${percent(entry.crossDialogueObservationShare)}</td>
</tr>`,
    )
    .join("");
  const uncoveredRows = coverage.topUncoveredSingletonFamilies
    .map(
      (entry) => `<tr><td>${pageLink(
        pagePath,
        `families/${entry.family}.html`,
        entry.family,
      )}</td><td>${entry.uncoveredSingletons}</td></tr>`,
    )
    .join("");
  const familyProfiles = data.labelQuality.familyProfiles
    .map(
      (entry) => `<tr class="filter-item" data-kind="${escapeHtml(entry.kind)}" data-all-singleton="${entry.allSingleton}" data-observations="${entry.observationCount}" data-search="${escapeHtml(
        entry.family.toLowerCase(),
      )}">
  <td>${pageLink(pagePath, `families/${entry.family}.html`, entry.family)}</td>
  <td>${escapeHtml(entry.kind)}</td>
  <td>${entry.labelCount}</td>
  <td>${entry.singletonCount}</td>
  <td>${entry.observationCount}</td>
  <td>${entry.allSingleton ? "yes" : "no"}</td>
  <td>${entry.lawsOnlySingletonCount}</td>
</tr>`,
    )
    .join("");
  const tokenRows = data.labelQuality.labelNameShape.tokenLengthDistribution
    .map((entry) => `<tr><td>${entry.tokens}</td><td>${entry.labels}</td></tr>`)
    .join("");
  const longestRows = data.labelQuality.labelNameShape.longestLabels
    .map((entry) => {
      const observation = data.observationsById.get(entry.observationId);
      return `<tr>
  <td>${pageLink(pagePath, `families/${entry.family}.html`, entry.family)}</td>
  <td>${observation ? observationLink(pagePath, data, observation) : escapeHtml(entry.label)}<span class="dim"> — ${escapeHtml(entry.label)}</span></td>
  <td>${entry.tokens}</td>
</tr>`;
    })
    .join("");
  const adjudication = data.singletonAdjudication;
  const adjudicationPanel = adjudication
    ? `<section>
  <h2>Singleton Adjudication Composition</h2>
  <p>The validated stratified sample contains ${adjudication.sampleSize} labels from a universe of ${adjudication.universeSize}. Weighted shares account for each stratum's population.</p>
  <table>
    <caption>Observed and population-weighted disposition composition for the reviewed singleton sample.</caption>
    <thead><tr><th>Disposition</th><th>Count</th><th>Sample share</th><th>Weighted share</th></tr></thead>
    <tbody>${adjudication.composition
      .map(
        (entry) => `<tr><td>${escapeHtml(entry.adjudication)}</td><td>${entry.count}</td><td>${percent(entry.sampleShare)}</td><td>${percent(entry.weightedShare)}</td></tr>`,
      )
      .join("")}</tbody>
  </table>
</section>`
    : `<section><h2>Singleton Adjudication Composition</h2><p class="dim">Validated singleton adjudication sample unavailable.</p></section>`;
  return layout(
    pagePath,
    "Quality",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Quality</h1>
  <div class="metrics">
    ${metric("accepted labels", accepted.totalLabels)}
    ${metric("singleton labels", accepted.singletonLabels)}
    ${metric("singleton share", percent(singletonShare))}
    ${metric("cross-dialogue labels", accepted.crossDialogueLabels)}
    ${metric("non-singleton observation share", percent(accepted.reuseMass.nonSingletonShare))}
    ${metric("cross-dialogue observation share", percent(accepted.reuseMass.crossDialogueShare))}
    ${metric("covered labels", coverage.coveredLabels)}
    ${metric("uncovered labels", coverage.uncoveredLabels)}
    ${metric("singleton coverage", percent(singletonCoverage))}
  </div>
</section>
<section>
  <h2>Cross-Dialogue Participation</h2>
  <p>Dialogues with the lowest accepted-observation participation in cross-dialogue labels appear first.</p>
  <table>
    <caption>Accepted observations and their participation in labels attested in more than one dialogue.</caption>
    <thead><tr><th>Dialogue</th><th>Accepted observations</th><th>Cross-dialogue labels</th><th>Cross-dialogue observations</th><th>Share</th></tr></thead>
    <tbody>${participationRows}</tbody>
  </table>
</section>
<section>
  <h2>Disposition Coverage</h2>
  <p>${coverage.coveredSingletons} singleton labels are covered by disposition maps; ${coverage.uncoveredSingletons} remain uncovered.</p>
  <table>
    <caption>Families with the largest number of singleton labels not covered by a disposition map.</caption>
    <thead><tr><th>Family</th><th>Uncovered singletons</th></tr></thead>
    <tbody>${uncoveredRows}</tbody>
  </table>
</section>
<section>
  <h2>Family Profiles</h2>
  <p>Filter families by registry kind, whether every label is a singleton, or a minimum observation count.</p>
  <section class="filters" data-filters>
    <label>Kind<select data-filter="kind"><option value="">All</option><option value="seed">seed</option><option value="passthrough">passthrough</option></select></label>
    <label>All singleton<select data-filter="allSingleton"><option value="">All</option><option value="true">yes</option><option value="false">no</option></select></label>
    <label>Minimum observations<input data-filter-min="observations" type="number" min="0" step="1" value="0"></label>
    <label class="search">Search<input data-filter-search type="search" placeholder="Family"></label>
    <p class="filter-status" role="status" aria-live="polite" data-filter-status></p>
  </section>
  <table>
    <caption>All-record label and observation counts by family; laws-only singletons are called out separately.</caption>
    <thead><tr><th>Family</th><th>Kind</th><th>Labels</th><th>Singletons</th><th>Observations</th><th>All singleton</th><th>Laws-only singletons</th></tr></thead>
    <tbody>${familyProfiles}</tbody>
  </table>
</section>
<section class="grid">
  <div>
    <h2>Label Length Distribution</h2>
    <p>Label length is counted in underscore-separated tokens across all records.</p>
    <table>
      <caption>Number of labels at each token length.</caption>
      <thead><tr><th>Tokens</th><th>Labels</th></tr></thead>
      <tbody>${tokenRows}</tbody>
    </table>
  </div>
  <div>
    <h2>Longest Labels</h2>
    <p>The bounded longest-label list links each label to a representative observation.</p>
    <table>
      <caption>The 20 longest current label names, ordered by token count.</caption>
      <thead><tr><th>Family</th><th>Label evidence</th><th>Tokens</th></tr></thead>
      <tbody>${longestRows}</tbody>
    </table>
  </div>
</section>
${adjudicationPanel}
<section>
  <h2>Provenance</h2>
  <p>These source artifacts are retained for inspection; the tables above are rendered from validated typed data.</p>
  ${provenanceDetails("Raw generated report", data.rawLabelQualityMarkdown, "Raw generated report unavailable.")}
  ${provenanceDetails("Signed memo", data.rawSingletonMemoMarkdown, "Signed memo unavailable.")}
</section>`,
    navState(data),
  );
}

function weakSpotsPage(data: SiteData) {
  const pagePath = "weak-spots.html";
  const coverageRows = [...data.coverage]
    .sort((a, b) => a.coverageRatio - b.coverageRatio || a.dialogue.localeCompare(b.dialogue))
    .map(
      (entry) => `<tr>
  <td>${pageLink(pagePath, `dialogues/${entry.dialogue}/index.html`, titleCase(entry.dialogue))}</td>
  <td>${entry.sourceChars}</td>
  <td>${entry.acceptedCoveredChars}</td>
  <td>${percent(entry.coverageRatio)}</td>
  <td>${entry.gaps.length}</td>
</tr>`,
    )
    .join("");
  const gaps = data.coverage
    .flatMap((entry) => entry.gaps)
    .sort((a, b) => a.dialogue.localeCompare(b.dialogue) || a.startChar - b.startChar || a.endChar - b.endChar);
  const gapRows = gaps
    .map(
      (gap) => `<tr>
  <td>${pageLink(pagePath, `dialogues/${gap.dialogue}/index.html`, titleCase(gap.dialogue))}</td>
  <td>${escapeHtml(gap.startMarker)} (${gap.startChar})</td>
  <td>${escapeHtml(gap.endMarker)} (${gap.endChar})</td>
  <td>${gap.endChar - gap.startChar}</td>
  <td>${escapeHtml(gap.classification)}</td>
</tr>`,
    )
    .join("");
  const singletonRows = [...data.labelQuality.familyProfiles]
    .filter((entry) => entry.singletonCount > 0)
    .sort((a, b) => b.singletonCount - a.singletonCount || a.family.localeCompare(b.family))
    .slice(0, 30)
    .map(
      (entry) =>
        `<tr><td>${pageLink(pagePath, `families/${entry.family}.html`, entry.family)}</td><td>${entry.singletonCount}</td><td>${entry.labelCount}</td><td>${entry.observationCount}</td></tr>`,
    )
    .join("");
  const issueStatuses = new Set(["rejected", "needs_split"]);
  const issues = [
    ...data.observations
      .filter((entry) => issueStatuses.has(entry.reviewStatus))
      .map((entry) => ({
        layer: "observations",
        status: entry.reviewStatus,
        dialogue: entry.dialogue,
        id: entry.observationId,
        target: observationLink(pagePath, data, entry),
        context: entry.featureFamily,
      })),
    ...data.claims
      .filter((entry) => issueStatuses.has(entry.reviewStatus))
      .map((entry) => ({
        layer: "claims",
        status: entry.reviewStatus,
        dialogue: entry.dialogue,
        id: entry.claimId,
        target: claimLink(pagePath, data, entry.claimId),
        context: entry.claimKind,
      })),
    ...data.relations
      .filter((entry) => issueStatuses.has(entry.reviewStatus))
      .map((entry) => ({
        layer: "relations",
        status: entry.reviewStatus,
        dialogue: entry.dialogue,
        id: entry.relationId,
        target: relationLink(pagePath, data, entry.relationId),
        context: entry.relationKind,
      })),
  ].sort(
    (a, b) =>
      a.layer.localeCompare(b.layer) ||
      a.status.localeCompare(b.status) ||
      a.dialogue.localeCompare(b.dialogue) ||
      a.id.localeCompare(b.id),
  );
  const issueRows = issues
    .map((entry) => {
      const dialogueTarget = entry.dialogue === "cross-dialogue" && entry.layer === "relations"
        ? splitTarget(data.relationPageById.get(entry.id) ?? "").path
        : `dialogues/${entry.dialogue}/index.html`;
      const dialogue = dialogueTarget
        ? pageLink(pagePath, dialogueTarget, titleCase(entry.dialogue))
        : escapeHtml(titleCase(entry.dialogue));
      return `<tr class="filter-item" data-layer="${entry.layer}" data-status="${entry.status}" data-dialogue="${entry.dialogue}" data-search="${escapeHtml(
        `${entry.id} ${entry.context}`.toLowerCase(),
      )}">
  <td>${escapeHtml(entry.layer)}</td>
  <td>${escapeHtml(entry.status)}</td>
  <td>${dialogue}</td>
  <td>${entry.target}</td>
  <td>${escapeHtml(entry.context)}</td>
</tr>`;
    })
    .join("");
  const allStatuses = [...new Set(
    Object.values(data.reviewStatusCounts).flatMap((entry) => Object.keys(entry.statuses)),
  )].sort();
  const statusSummaryRows = (Object.keys(data.reviewStatusCounts) as Array<keyof typeof data.reviewStatusCounts>)
    .map((layer) => {
      const summary = data.reviewStatusCounts[layer];
      const known = new Set(["accepted", "rejected", "needs_split", "unreviewed"]);
      const other = Object.entries(summary.statuses)
        .filter(([status]) => !known.has(status))
        .reduce((sum, [, count]) => sum + count, 0);
      return `<tr><td>${escapeHtml(layer)}</td><td>${summary.total}</td><td>${summary.statuses.accepted ?? 0}</td><td>${summary.statuses.rejected ?? 0}</td><td>${summary.statuses.needs_split ?? 0}</td><td>${summary.statuses.unreviewed ?? 0}</td><td>${other}</td></tr>`;
    })
    .join("");
  const unattributed = data.unattributedDialogues.length
    ? `<ul>${data.unattributedDialogues
        .map((dialogue) => `<li>${pageLink(pagePath, `dialogues/${dialogue}/index.html`, titleCase(dialogue))}</li>`)
        .join("")}</ul>`
    : `<p class="zero">No wholly unattributed dialogues.</p>`;
  const observationIssues = (data.reviewStatusCounts.observations.statuses.rejected ?? 0) +
    (data.reviewStatusCounts.observations.statuses.needs_split ?? 0);
  const claimIssues = (data.reviewStatusCounts.claims.statuses.rejected ?? 0) +
    (data.reviewStatusCounts.claims.statuses.needs_split ?? 0);
  const relationIssues = (data.reviewStatusCounts.relations.statuses.rejected ?? 0) +
    (data.reviewStatusCounts.relations.statuses.needs_split ?? 0);
  const minimumCoverage = data.coverage.length === 0
    ? 1
    : Math.min(...data.coverage.map((entry) => entry.coverageRatio));

  return layout(
    pagePath,
    "Weak Spots",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Weak Spots</h1>
  <div class="metrics">
    ${metric("minimum coverage", percent(minimumCoverage))}
    ${metric("coverage gaps", gaps.length)}
    ${metric("observation issues", observationIssues)}
    ${metric("claim issues", claimIssues)}
    ${metric("relation issues", relationIssues)}
  </div>
</section>
<section>
  <h2>Coverage by Dialogue</h2>
  <p>Lowest accepted-span coverage appears first; gap counts use the canonical 800-character threshold.</p>
  <table>
    <caption>Source characters, accepted covered characters, coverage ratio, and large-gap count for every dialogue.</caption>
    <thead><tr><th>Dialogue</th><th>Source chars</th><th>Accepted covered chars</th><th>Coverage</th><th>Gaps</th></tr></thead>
    <tbody>${coverageRows}</tbody>
  </table>
</section>
<section>
  <h2>Coverage Gaps</h2>
  <p>Each row classifies a large uncovered interval as never covered or uncovered because its records were rejected.</p>
  ${gaps.length === 0
    ? `<p class="zero">No coverage gaps at the 800-character threshold.</p>`
    : `<table><caption>Canonical large uncovered intervals with source markers and classification.</caption><thead><tr><th>Dialogue</th><th>Start</th><th>End</th><th>Chars</th><th>Classification</th></tr></thead><tbody>${gapRows}</tbody></table>`}
</section>
<section>
  <h2>Review Status by Layer</h2>
  <p>Counts are computed directly from the observation, claim, and relation ledgers.</p>
  <table>
    <caption>Review-status counts for every issue-bearing record layer.</caption>
    <thead><tr><th>Layer</th><th>Total</th><th>Accepted</th><th>Rejected</th><th>Needs split</th><th>Unreviewed</th><th>Other</th></tr></thead>
    <tbody>${statusSummaryRows}</tbody>
  </table>
</section>
<section>
  <h2>Review Issue Queue</h2>
  <p>Rejected and needs-split observations, claims, and relations share one linked, filterable queue.</p>
  ${issues.length === 0
    ? `<p class="zero">No review-status issues in observations, claims, or relations.</p>`
    : `<section class="filters" data-filters>
      <label>Layer<select data-filter="layer"><option value="">All</option><option value="observations">observations</option><option value="claims">claims</option><option value="relations">relations</option></select></label>
      <label>Status<select data-filter="status"><option value="">All</option>${allStatuses
        .filter((status) => issueStatuses.has(status))
        .map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`)
        .join("")}</select></label>
      <label>Dialogue<select data-filter="dialogue"><option value="">All</option>${[...new Set(issues.map((entry) => entry.dialogue))]
        .sort()
        .map((dialogue) => `<option value="${escapeHtml(dialogue)}">${escapeHtml(dialogue)}</option>`)
        .join("")}</select></label>
      <label class="search">Search<input data-filter-search type="search" placeholder="Record id or context"></label>
      <p class="filter-status" role="status" aria-live="polite" data-filter-status></p>
    </section>
    <table><caption>Review work requiring rejection confirmation or record splitting.</caption><thead><tr><th>Layer</th><th>Status</th><th>Dialogue</th><th>ID</th><th>Context</th></tr></thead><tbody>${issueRows}</tbody></table>`}
</section>
<section class="grid">
  <div>
    <h2>Singleton-Heavy Families</h2>
    <p>Families with the most singleton labels appear first.</p>
    <table><caption>The 30 families with the largest singleton-label counts.</caption><thead><tr><th>Family</th><th>Singleton labels</th><th>Labels</th><th>Observations</th></tr></thead><tbody>${singletonRows}</tbody></table>
  </div>
  <div class="panel"><h2>Unattributed Dialogues</h2><p>Dialogues listed here have derived speaker summaries containing no attributed speaker.</p>${unattributed}</div>
</section>
<section>
  <h2>Provenance</h2>
  <p>The generated Markdown is retained for inspection; the tables above use the canonical typed coverage report.</p>
  ${provenanceDetails("Raw generated report", data.rawCoverageMarkdown, "Raw generated report unavailable.")}
</section>`,
    navState(data),
  );
}

function standingRelationsPage(data: SiteData) {
  const pagePath = "relations/standing.html";
  const standing = data.relations.filter((relation) => relation.relationKind === "contradiction" && relation.resolution === "standing");
  const resolved = data.relations.filter((relation) => relation.resolution === "refuted_resolved");
  return layout(
    pagePath,
    "Standing Relations",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Standing Relations</h1>
  <div class="metrics">${metric("standing contradictions", standing.length)}${metric("refuted resolved", resolved.length)}</div>
</section>
<section class="split">
  <div>
    <h2>Standing</h2>
    <div class="records">${standing.map((relation) => relationCard(pagePath, data, relation)).join("\n")}</div>
  </div>
  <div>
    <h2>Resolved</h2>
    <div class="records">${resolved.map((relation) => relationCard(pagePath, data, relation)).join("\n")}</div>
  </div>
</section>`,
    navState(data),
  );
}

function aboutPage(data: SiteData) {
  const pagePath = "about.html";
  return layout(
    pagePath,
    "About",
    `<section class="hero compact">
  <h1>About this edition</h1>
</section>
<section class="panel">
  <h2>What this is</h2>
  <p>This site is a deterministic browser over a repository of reviewed records about Plato's dialogues: observations, claims, relations, evidence dossiers, and authored guided readings, generated by <code>bun run harness site</code>. Where the evidence warrants, the reading view carries the traditional marginal signs of Greek scholarship (†, ※, »).</p>
  <blockquote>This project is a Plato textual fact compiler, not an esotericism detector. Ingest Plato dialogues and produce structured, checkable records about the text. If larger interpretive patterns exist, they should become visible from accumulated records rather than from prompting an LLM to find them.<br>— extraction protocol</blockquote>
</section>
<section class="panel">
  <h2>Method &amp; data quality</h2>
  <p>These are the working dashboards behind the site; they are reference material, not reading material.</p>
  <ul class="link-list">
    <li>${pageLink(pagePath, "quality.html", "Label quality")} <span class="dim">label-quality dashboard</span></li>
    <li>${pageLink(pagePath, "weak-spots.html", "Weak spots")} <span class="dim">coverage gaps and review issues</span></li>
    <li>${pageLink(pagePath, "registry.html", "Feature registry")} <span class="dim">feature-candidate registry</span></li>
  </ul>
</section>
${markdownPanel("Source Attribution", data.sourceAttribution)}`,
    navState(data),
  );
}

function licensePage(data: SiteData) {
  const pagePath = "license.html";
  return layout(
    pagePath,
    "License",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Publication License</h1>
</section>
<section class="panel">
  <h2>CC BY-SA 4.0</h2>
  <p>The Greek and English source material, excerpts, commentary, and derived knowledge-base material on this site that reproduce or adapt the Perseus edition are available under <a href="${CONTENT_LICENSE_URL}">Creative Commons Attribution-ShareAlike 4.0 International</a>.</p>
  <p>Attribution: PerseusDL/canonical-greekLit, pinned commit <code>e37eed2e8a5fed710c3ab0d312249c3fb04d77e0</code>, Plato <code>perseus-grc2</code> and <code>perseus-eng2</code> editions. This site is a modified, generated rendering: changes include TEI-to-text normalization, Stephanus indexing, source-bound record extraction, commentary placement, and static HTML generation.</p>
  <p>The license link, attribution, and modification notice are provided for downstream redistribution. See <a href="about.html">About</a> for the full pinned-source provenance.</p>
</section>`,
    navState(data),
  );
}

function buildCatalogRecords(data: SiteData) {
  // The apparatus lane is deliberately absent here: it has no search shards, no
  // exact-ID shards, and no sitemap-like listing. Discoverability through
  // reading is the presentation form the operator specified; apparatus records
  // remain fully citable and deep-linkable by their `#apx_...` fragment URL.
  const exact: ExactIdRecord[] = [];
  const search: SearchRecordInput[] = [];
  const add = (record: ExactIdRecord, projection: Omit<SearchRecordInput, "id" | "target" | "kind" | "scope">) => {
    exact.push(record);
    search.push({ ...record, ...projection });
  };

  for (const observation of data.observations) {
    const target = data.observationPageById.get(observation.observationId);
    if (!target) continue;
    add(
      { id: observation.observationId, target, kind: "observation", scope: observation.dialogue },
      {
        dialogue: observation.dialogue,
        stephanusSpan: observation.stephanusSpan,
        family: observation.featureFamily,
        label: observation.featureLabel,
        status: observation.reviewStatus,
        title: observation.featureLabel,
        snippet: observation.observation,
      },
    );
  }
  for (const shard of data.turnShards) {
    for (const turn of shard.turns) {
      const turnId = turn.turn_id ?? "";
      const target = data.turnPageById.get(turnId);
      if (!target) throw new Error(`Unknown turn target: ${turnId || "(missing)"}.`);
      const speaker = turn.speaker === "(none)" ? "(unattributed)" : (turn.speaker ?? "");
      const stephanusSpan =
        turn.start_marker === turn.end_marker
          ? (turn.start_marker ?? "")
          : `${turn.start_marker ?? ""}-${turn.end_marker ?? ""}`;
      add(
        { id: turnId, target, kind: "turn", scope: shard.dialogue },
        {
          dialogue: shard.dialogue,
          stephanusSpan,
          speaker,
          title: `${titleCase(shard.dialogue)} turn by ${speaker}`,
        },
      );
    }
  }
  for (const claim of data.claims) {
    const target = data.claimPageById.get(claim.claimId);
    if (!target) continue;
    add(
      { id: claim.claimId, target, kind: "claim", scope: claim.dialogue },
      {
        dialogue: claim.dialogue,
        stephanusSpan: claim.stephanusSpan,
        status: claim.finalStatus,
        speaker: claim.speaker,
        title: claim.claimKind,
        snippet: claim.content,
      },
    );
  }
  for (const relation of data.relations) {
    const target = data.relationPageById.get(relation.relationId);
    if (!target) continue;
    add(
      { id: relation.relationId, target, kind: "relation", scope: relation.dialogue },
      {
        dialogue: relation.dialogue,
        status: relation.reviewStatus,
        relationKind: relation.relationKind,
        resolution: relation.resolution,
        title: relation.relationKind,
        snippet: relation.basis,
      },
    );
  }
  for (const dossier of data.dossiers) {
    const target = `${dossier.pagePath}#${dossier.dossierId}`;
    add(
      { id: dossier.dossierId, target, kind: "dossier", scope: dossier.family },
      { family: dossier.family, label: dossier.label, title: dossier.label },
    );
  }
  for (const entry of data.registry) {
    const target = data.registryPageById.get(entry.id);
    if (!target) continue;
    add(
      { id: entry.id, target, kind: "registry", scope: entry.family },
      { family: entry.family, label: entry.proposedName, status: entry.status, title: entry.proposedName },
    );
  }
  for (const commentary of data.commentaryByDialogue.values()) {
    for (const block of commentary.blocks) {
      const target = data.commentaryPageById.get(block.commentaryId);
      if (!target) continue;
      add(
        { id: block.commentaryId, target, kind: "commentary", scope: commentary.dialogue },
        {
          dialogue: commentary.dialogue,
          stephanusSpan: block.stephanusSpan,
          status: block.reviewStatus,
          title: block.title || block.blockKind,
          snippet: block.body,
        },
      );
    }
  }
  return { exact, search };
}

function searchPage(data: SiteData, records: readonly SearchRecordInput[]) {
  const pagePath = "search.html";
  const values = (field: "kind" | "dialogue" | "family" | "status") =>
    [...new Set(records.map((record) => record[field]).filter((value): value is string => Boolean(value)))].sort();
  const options = (entries: readonly string[]) =>
    entries.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(titleCase(value))}</option>`).join("");

  return layout(
    pagePath,
    "Search",
    `<section class="hero compact">
  <p>${pageLink(pagePath, "index.html", "Index")}</p>
  <h1>Search the Corpus</h1>
  <p>Search bounded record summaries, then follow stable links to the full source-bound records.</p>
</section>
<form class="panel corpus-search" data-corpus-search data-manifest-src="assets/search/manifest.json">
  <label class="search">Query<input data-search-query name="q" type="search" autocomplete="off" placeholder="Record ID, title, or text"></label>
  <label>Record kind<select data-search-filter="kind"><option value="">All</option>${options(values("kind"))}</select></label>
  <label>Dialogue<select data-search-filter="dialogue"><option value="">All</option>${options(values("dialogue"))}</select></label>
  <label>Family<select data-search-filter="family"><option value="">All</option>${options(values("family"))}</select></label>
  <label>Label<input data-search-filter="label" autocomplete="off"></label>
  <label>Status<select data-search-filter="status"><option value="">All</option>${options(values("status"))}</select></label>
  <button type="submit">Search</button>
</form>
<p class="filter-status" role="status" aria-live="polite" data-search-status>Enter a search query.</p>
<ol class="search-results" data-search-results></ol>
<section class="panel">
  <h2>Open a record by ID</h2>
  <form data-id-jump data-index-manifest="assets/index/manifest.json">
    <label>Record ID<input name="id" placeholder="obs_meno_0001"></label>
    <button type="submit">Open</button>
    <p class="dim" role="status" aria-live="polite" data-id-jump-status>${escapeHtml(idJumpStatusText("initial"))}</p>
  </form>
</section>`,
    navState(data),
  );
}

function writePage(outDir: string, path: string, content: string, pages: string[]) {
  const absolutePath = join(outDir, path);
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
  pages.push(path);
}

export function buildStaticSite(options: BuildStaticSiteOptions = {}): BuiltStaticSite {
  const outDir = options.outDir ?? join(getRepoRoot(), "site");
  const sourceResolver = createSourceSpanResolver();
  const data = readSiteData({
    includeDraftRecordings: options.includeDraftRecordings ?? false,
    sourceResolver,
  });
  const recordingArtifactRoot = options.recordingArtifactRoot ?? process.env.PLATO_RECORDING_ARTIFACT_ROOT;
  // Validate every selected recording before deleting a previously good site.
  // Accepted manifests still require their complete production evidence chain;
  // explicitly selected drafts use the narrower review-candidate artifact gate.
  // Materialization remains independently hash-checking so a post-preflight
  // artifact mutation also fails closed.
  validateSiteRecordingEvidence({
    recordings: data.recordingsByDialogue,
    artifactRoot: recordingArtifactRoot,
    outDir,
  });
  const readingPlans = planReadingPages(
    data,
    options.readingPageTargetBytes ?? DEFAULT_READING_PAGE_TARGET_BYTES,
  );
  registerReadingMarkerPaths(data, readingPlans);
  const pages: string[] = [];
  const catalogRecords = buildCatalogRecords(data);
  const exactIdIndex = buildExactIdIndex(catalogRecords.exact, "assets/index");
  const searchIndex = buildSearchIndex(catalogRecords.search, { basePath: "assets/search" });

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "assets"), { recursive: true });
  writeFileSync(join(outDir, "assets/site.css"), siteCss(), "utf8");
  writeFileSync(join(outDir, "assets/site.js"), siteJs(), "utf8");
  pages.push("assets/site.css", "assets/site.js");
  const recordingAssets = materializeSiteRecordings({
    recordings: data.recordingsByDialogue,
    artifactRoot: recordingArtifactRoot,
    outDir,
  });
  pages.push(...recordingAssets.map((asset) => asset.path));
  writePage(outDir, "assets/index/manifest.json", exactIdIndex.manifestJson, pages);
  for (const shard of exactIdIndex.shards) writePage(outDir, shard.path, shard.json, pages);
  writePage(outDir, "assets/search/manifest.json", searchIndex.manifestJson, pages);
  for (const shard of searchIndex.shards) writePage(outDir, shard.path, shard.json, pages);

  writePage(outDir, "index.html", indexPage(data), pages);
  writePage(outDir, "search.html", searchPage(data, catalogRecords.search), pages);
  writePage(outDir, "registry.html", registryPage(data), pages);
  for (const shard of data.registryShards) writePage(outDir, shard.path, registryShardPage(data, shard), pages);
  writePage(outDir, "quality.html", qualityPage(data), pages);
  writePage(outDir, "weak-spots.html", weakSpotsPage(data), pages);
  writePage(outDir, "about.html", aboutPage(data), pages);
  writePage(outDir, "license.html", licensePage(data), pages);
  writePage(outDir, "patterns/index.html", patternsPage(data), pages);
  writePage(outDir, "dialogues/index.html", dialoguesHubPage(data), pages);
  writePage(outDir, "families/index.html", familiesHubPage(data), pages);
  writePage(outDir, "claims/index.html", claimsHubPage(data), pages);
  writePage(outDir, "relations/index.html", relationsHubPage(data), pages);
  writePage(outDir, "readings/index.html", readingsHubPage(data), pages);
  writePage(outDir, "audio/index.html", audioEditionsPage(data), pages);

  const observationsByDialogue = groupBy(data.observations, (observation) => observation.dialogue);
  const dialogues = [...new Set([...data.derivedByDialogue.keys(), ...observationsByDialogue.keys()])].sort();
  for (const dialogue of dialogues) {
    const entries = observationsByDialogue.get(dialogue) ?? [];
    writePage(outDir, `dialogues/${dialogue}/index.html`, dialogueIndexPage(data, dialogue, entries), pages);
    writePage(outDir, `dialogues/${dialogue}/records.html`, dialogueRecordsPage(data, dialogue, entries), pages);
    writePage(outDir, `dialogues/${dialogue}/structure.html`, structurePage(data, dialogue, data.derivedByDialogue.get(dialogue)), pages);
  }

  for (const shard of data.turnShards) writePage(outDir, shard.path, turnShardPage(data, shard), pages);

  for (const shard of data.claimShards) writePage(outDir, shard.path, claimsPage(data, shard), pages);

  const observationDialogues = new Set(data.observations.map((observation) => observation.dialogue));
  for (const shard of data.relationShards) {
    writePage(outDir, shard.path, relationsPage(data, shard, observationDialogues.has(shard.dialogue)), pages);
  }

  for (const plan of readingPlans) {
    const dialoguePlans = readingPlans.filter((entry) => entry.dialogue === plan.dialogue);
    writePage(outDir, plan.path, readingPage(data, plan, dialoguePlans), pages);
  }

  for (const shard of data.shards) writePage(outDir, shard.path, observationShardPage(data, shard), pages);

  for (const [family, entries] of [...groupBy(data.observations, (observation) => observation.featureFamily).entries()].sort()) {
    writePage(outDir, `families/${family}.html`, familyPage(data, family, entries), pages);
  }

  writePage(outDir, "clusters/index.html", clusterIndexPage(data, data.clusters), pages);
  for (const [family, familyClusters] of [...groupBy(data.clusters, (cluster) => cluster.family).entries()].sort()) {
    writePage(outDir, `clusters/${family}.html`, clusterFamilyPage(data, family, familyClusters), pages);
  }

  writePage(outDir, "dossiers/index.html", dossierIndexPage(data), pages);
  for (const dossier of data.dossiers) writePage(outDir, dossier.pagePath, dossierPage(data, dossier), pages);

  writePage(outDir, "anchors/index.html", anchorsIndexPage(data), pages);
  const anchorsByGroup = new Map<string, Array<ToonRow & { dialogue: string }>>();
  for (const [dialogue, derived] of data.derivedByDialogue.entries()) {
    for (const anchor of derived.anchors) {
      const entries = anchorsByGroup.get(anchor.group ?? "") ?? [];
      entries.push({ ...anchor, dialogue });
      anchorsByGroup.set(anchor.group ?? "", entries);
    }
  }
  for (const [group, rows] of [...anchorsByGroup.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    writePage(outDir, `anchors/${group}.html`, anchorsGroupPage(data, group, rows), pages);
  }

  if (data.relations.length > 0) writePage(outDir, "relations/standing.html", standingRelationsPage(data), pages);

  writeFileSync(
    join(outDir, "manifest.txt"),
    pages.map((page) => `${page}\tsite/${page}`).join("\n") + "\n",
    "utf8",
  );
  pages.push("manifest.txt");

  const validation = validateGeneratedSite(outDir, {
    allowedExternalUrls: new Set([CONTENT_LICENSE_URL]),
    recordings: [...data.recordingsByDialogue.values()].map((recording) => ({
      dialogue: recording.dialogue,
      recordingId: recording.recordingId,
      audioSha256: recording.audioSha256,
      durationSeconds: recording.durationSeconds,
      status: recording.status,
      assetPath: recording.siteAssetPath,
      chapterTargets: recording.chapters.map((chapter) => chapter.commentary_id),
      chapterIds: recording.chapters.map((chapter) => chapter.chapter_id),
      chapterStartFrames: recording.chapters.map((chapter) => chapter.start_frame),
      chapterStartSeconds: recording.chapters.map((chapter) => chapter.start_frame / 48_000),
    })),
  });

  const acceptedRecordingCount = [...data.recordingsByDialogue.values()].filter(
    (recording) => recording.status === "accepted",
  ).length;
  const reviewCandidateRecordingCount = [...data.recordingsByDialogue.values()].filter(
    (recording) => recording.status === "draft",
  ).length;

  return {
    outDir,
    pages,
    observationCount: data.observations.length,
    registryEntryCount: data.registry.length,
    clusterCount: data.clusters.length,
    acceptedRecordingCount,
    reviewCandidateRecordingCount,
    validation,
  };
}

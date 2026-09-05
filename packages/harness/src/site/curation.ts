import type { SiteDossier, ToonRow } from "./data.js";
import { escapeHtml, pathToRoot } from "./layout.js";

// Operator-owned copy: one line per dialogue describing dramatic setting and
// stated topic. These are site chrome, not extraction records, and make no
// hidden-meaning claims. Adding a 28th dialogue must FAIL the build until its
// line is written — curation as an invariant.
export const DIALOGUE_EPIGRAPHS: Record<string, string> = {
  apology: "Socrates' defense speech at his trial for impiety and corrupting the young.",
  charmides: "At a wrestling school, sound-mindedness is defined, and the definitions come apart.",
  cratylus: "Are names correct by nature or by convention? Etymologies pile up either way.",
  critias: "The unfinished sequel to Timaeus: ancient Athens and Atlantis, breaking off mid-sentence.",
  crito: "In prison at dawn, Crito urges escape; Socrates answers with the laws of Athens.",
  euthydemus: "Two eristic brothers demonstrate argument as combat while Socrates asks what it is for.",
  euthyphro: "On the way to court, a man prosecuting his own father is asked what piety is.",
  gorgias: "Rhetoric on trial: Gorgias, Polus, and Callicles against the examined life.",
  "greater-hippias": "What is the fine? Hippias offers examples; the questioning wants more.",
  ion: "A rhapsode who commands only Homer: skill, or possession?",
  laches: "Two generals are asked what courage is, with their sons' education at stake.",
  laws: "Three old men walk to the cave of Zeus, legislating a city in speech — Plato's longest work.",
  "lesser-hippias": "Is the truthful man or the liar the better — and can they be the same man?",
  lysis: "Friendship questioned among boys at the palaestra; no definition survives the morning.",
  menexenus: "Socrates recites a funeral oration he says he learned from Aspasia.",
  meno: "Can virtue be taught? A slave boy, a paradox, and recollection.",
  parmenides: "Young Socrates' forms meet the Eleatic examination; then the exercise about the one.",
  phaedo: "Socrates' last day: arguments for the soul's immortality, told by Phaedo.",
  phaedrus: "Outside the walls: speeches on eros, then writing itself put in question.",
  philebus: "Pleasure against intelligence for the rank of the good.",
  protagoras: "The great sophist defends the teachability of virtue before a house of rivals.",
  republic: "Justice in soul and city, from a night at the Piraeus to the myth of Er.",
  sophist: "The Eleatic stranger hunts the sophist by division; non-being has to be.",
  statesman: "The stranger weaves the statesman's definition; the cosmos runs in reverse in the myth.",
  symposium: "Speeches in praise of eros at Agathon's victory party, capped by Alcibiades.",
  theaetetus: "What is knowledge? Perception, true opinion, and opinion-with-account each fail.",
  timaeus: "A likely story of the cosmos, from the demiurge to the human frame.",
};

export function dialogueEpigraph(dialogue: string): string {
  const epigraph = DIALOGUE_EPIGRAPHS[dialogue];
  if (!epigraph) {
    throw new Error(`No curated epigraph for dialogue ${dialogue}. Add one to DIALOGUE_EPIGRAPHS.`);
  }
  return epigraph;
}

// Reader-facing speaker labels for the English reading spine, keyed by the
// exact abbreviation the pinned translation prints at the start of a turn
// line in raw/plato/english/<dialogue>.txt. Display names follow the TEI cast
// list (audio/english-tei-speaker-census.json), shortened to the conventional
// speaker form. Every dialogue with a guided reading MUST have an entry; an
// empty object records a narrated text whose lines carry no printed speaker
// labels — curation as an invariant, like the epigraphs.
export const ENGLISH_SPEAKER_LABELS: Record<string, Record<string, string>> = {
  apology: {},
  charmides: {},
  cratylus: { "Cratylus.": "Cratylus", "Hermogenes.": "Hermogenes", "Socrates.": "Socrates" },
  critias: { "Crit.": "Critias", "Herm.": "Hermocrates", "Soc.": "Socrates", "Tim.": "Timaeus" },
  crito: { "Crito.": "Crito", "Socrates.": "Socrates" },
  euthydemus: { "Cri.": "Crito", "Soc.": "Socrates" },
  euthyphro: { "Euthyphro.": "Euthyphro", "Socrates.": "Socrates" },
  gorgias: {
    "Call.": "Callicles",
    "Chaer.": "Chaerephon",
    "Gorg.": "Gorgias",
    "Pol.": "Polus",
    "Soc.": "Socrates",
  },
  "greater-hippias": { "Hipp.": "Hippias", "Soc.": "Socrates" },
  ion: { "Ion.": "Ion", "Soc.": "Socrates" },
  laches: {
    "Lach.": "Laches",
    "Lys.": "Lysimachus",
    "Mel.": "Melesias",
    "Nic.": "Nicias",
    "Soc.": "Socrates",
    "Son.": "Son",
  },
  laws: { "Ath.": "Athenian", "Clin.": "Clinias", "Meg.": "Megillus" },
  "lesser-hippias": { "Eud.": "Eudicus", "Hipp.": "Hippias", "Soc.": "Socrates" },
  lysis: {},
  menexenus: { "Men.": "Menexenus", "Soc.": "Socrates" },
  meno: { "An.": "Anytus", "Boy.": "Boy", "Men.": "Meno", "Soc.": "Socrates" },
  parmenides: { "Ceph.": "Cephalus" },
  phaedo: { "Echecrates.": "Echecrates", "Phaedo.": "Phaedo" },
  phaedrus: { "Phaedrus.": "Phaedrus", "Socrates.": "Socrates" },
  philebus: { "Phi.": "Philebus", "Pro.": "Protarchus", "Soc.": "Socrates" },
  protagoras: { "Fr.": "Friend", "Soc.": "Socrates" },
  republic: {},
  sophist: { "Soc.": "Socrates", "Str.": "Stranger", "Theaet.": "Theaetetus", "Theo.": "Theodorus" },
  symposium: {},
  statesman: {
    "Soc.": "Socrates",
    "Str.": "Stranger",
    "Theo.": "Theodorus",
    "Y. Soc.": "Young Socrates",
  },
  theaetetus: {
    "EU.": "Euclides",
    "SO.": "Socrates",
    "SOC.": "Socrates",
    "TERP.": "Terpsion",
    "THEAET.": "Theaetetus",
    "THEO.": "Theodorus",
  },
  timaeus: { "Crit.": "Critias", "Herm.": "Hermocrates", "Soc.": "Socrates", "Tim.": "Timaeus" },
};

export function englishSpeakerLabels(dialogue: string): Record<string, string> {
  const labels = ENGLISH_SPEAKER_LABELS[dialogue];
  if (!labels) {
    throw new Error(
      `No curated English speaker labels for dialogue ${dialogue}. Add an entry (empty for narrated texts) to ENGLISH_SPEAKER_LABELS.`,
    );
  }
  return labels;
}

// Conventional English name for each Greek turn siglum, keyed by the exact
// abbreviation the derived speakers table prints (derivedByDialogue.speakers).
// Feeds the Voices panel on the dialogue overview: verbatim siglum in bold, this
// name beside it. Fail-closed like ENGLISH_SPEAKER_LABELS — a dialogue absent
// here fails the build, and a siglum present in the turns but missing here fails
// when Voices renders it. Narrated texts carry an empty map; "(unattributed)" is
// exempt. Names follow the pinned perseus-eng2 TEI cast where the census is
// unambiguous (audio/english-tei-speaker-census.json): protagoras ΕΤ. is the
// "Friend" who opens the narration there; laches ΠΑΙ. keeps the singular "Son"
// already shipped in ENGLISH_SPEAKER_LABELS.
export const GREEK_SPEAKER_NAMES: Record<string, Record<string, string>> = {
  apology: {},
  charmides: {},
  cratylus: { "ΕΡΜ.": "Hermogenes", "ΚΡ.": "Cratylus", "ΣΩ.": "Socrates" },
  critias: { "ΕΡ.": "Hermocrates", "ΚΡΙ.": "Critias", "ΣΩ.": "Socrates", "ΤΙ.": "Timaeus" },
  crito: { "ΚΡ.": "Crito", "ΣΩ.": "Socrates" },
  euthydemus: { "ΚΡ.": "Crito", "ΣΩ.": "Socrates" },
  euthyphro: { "ΕΥΘ.": "Euthyphro", "ΣΩ.": "Socrates" },
  gorgias: {
    "ΓΟΡ.": "Gorgias",
    "ΚΑΛ.": "Callicles",
    "ΠΩΛ.": "Polus",
    "ΣΩ.": "Socrates",
    "ΧΑΙ.": "Chaerephon",
  },
  "greater-hippias": { "ΙΠ.": "Hippias", "ΣΩ.": "Socrates" },
  ion: { "ΙΩΝ.": "Ion", "ΣΩ.": "Socrates" },
  laches: {
    "ΛΑ.": "Laches",
    "ΛΥ.": "Lysimachus",
    "ΜΕ.": "Melesias",
    "ΝΙ.": "Nicias",
    "ΠΑΙ.": "Son",
    "ΣΩ.": "Socrates",
  },
  laws: { "ΑΘ.": "Athenian", "ΚΛ.": "Clinias", "ΜΕ.": "Megillus" },
  "lesser-hippias": { "ΕΥ.": "Eudicus", "ΙΠ.": "Hippias", "ΣΩ.": "Socrates" },
  lysis: {},
  menexenus: { "ΜΕΝ.": "Menexenus", "ΣΩ.": "Socrates" },
  meno: { "ΑΝ.": "Anytus", "ΜΕΝ.": "Meno", "ΠΑΙ.": "Boy", "ΣΩ.": "Socrates" },
  parmenides: {},
  phaedo: { "ΕΧ.": "Echecrates", "ΦΑΙΔ.": "Phaedo" },
  phaedrus: { "ΣΩ.": "Socrates", "ΦΑΙ.": "Phaedrus" },
  philebus: { "ΠΡΩ.": "Protarchus", "ΣΩ.": "Socrates", "ΦΙ.": "Philebus" },
  protagoras: { "ΕΤ.": "Friend", "ΣΩ.": "Socrates" },
  republic: {},
  sophist: { "ΘΕΑΙ.": "Theaetetus", "ΘΕΟ.": "Theodorus", "ΞΕ.": "Stranger", "ΣΩ.": "Socrates" },
  statesman: {
    "ΘΕΟ.": "Theodorus",
    "ΝΕ. ΣΩ.": "Young Socrates",
    "ΞΕ.": "Stranger",
    "ΣΩ.": "Socrates",
  },
  symposium: { "ΑΠΟΛ.": "Apollodorus", "ΕΤΑΙ.": "Companion" },
  theaetetus: {
    "ΕΥ.": "Euclides",
    "ΘΕΑΙ.": "Theaetetus",
    "ΘΕΟ.": "Theodorus",
    "ΣΩ.": "Socrates",
    "ΤΕΡ.": "Terpsion",
  },
  timaeus: { "ΕΡ.": "Hermocrates", "ΚΡ.": "Critias", "ΣΩ.": "Socrates", "ΤΙ.": "Timaeus" },
};

export function greekSpeakerNames(dialogue: string): Record<string, string> {
  const names = GREEK_SPEAKER_NAMES[dialogue];
  if (!names) {
    throw new Error(
      `No curated Greek speaker names for dialogue ${dialogue}. Add an entry (empty for narrated texts) to GREEK_SPEAKER_NAMES.`,
    );
  }
  return names;
}

// Reader-facing English name for one Greek siglum. "(unattributed)" renders no
// name; any other siglum absent from the dialogue's map fails the build — the
// per-dialogue validation against the derived speakers table.
export function greekSpeakerName(dialogue: string, siglum: string): string {
  if (siglum === "(unattributed)") return "";
  const name = greekSpeakerNames(dialogue)[siglum];
  if (!name) {
    throw new Error(`No curated English name for speaker ${siglum} in ${dialogue}. Add it to GREEK_SPEAKER_NAMES.`);
  }
  return name;
}

// Validated categorical speaker palette (CVD separation, chroma, lightness
// band, ≥3:1 on a light surface). Assigned in this FIXED order, never cycled.
export const SPEAKER_PALETTE = ["#2e63a4", "#96530e", "#1e8567", "#7157a8", "#b08a10"] as const;
export const SPEAKER_OTHER = "#8a8375";
// Above this turn count we collapse consecutive same-speaker runs to reduce
// redundant segments. For two-speaker dialogues that alternate nearly every
// turn (cratylus, philebus, sophist, …) merging barely helps, so the true
// alternation count — laws reaches ~1794 — is the real signal, not noise. The
// hard cap only guards against pathological future data; every run below it
// renders (no silent truncation).
export const STRUCTURE_STRIP_MERGE_THRESHOLD = 600;
export const STRUCTURE_STRIP_MAX_SEGMENTS = 2500;

export type StructureStripInput = {
  dialogue: string;
  turns: ToonRow[];
  speakers: ToonRow[];
  observationCountByTurnId: Map<string, number>;
  turnPageById: Map<string, string>;
  pagePath: string;
  // The v3.3 records page moves the strip beside the turn data and drops its
  // observation tick band — the record map above already places every record at
  // its true character span. Defaults to the historical behavior (ticks shown).
  includeObservationTicks?: boolean;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function turnWeight(turn: ToonRow): number {
  const tokens = Number.parseInt(turn.token_count ?? "", 10);
  if (Number.isFinite(tokens) && tokens > 0) return tokens;
  const greek = Number.parseInt(turn.greek_char_count ?? "", 10);
  if (Number.isFinite(greek) && greek > 0) return greek;
  return 1;
}

// Deterministic slot order: total_tokens desc, code-unit tiebreak (locale
// compares are not stable across platforms), then Socrates (any /^ΣΩ/u) is
// pulled to slot 0. Slots 0–4 take the palette; everyone else is SPEAKER_OTHER.
function orderedSpeakers(speakers: StructureStripInput["speakers"]) {
  const ordered = speakers
    .map((row) => ({ speaker: row.speaker ?? "", tokens: Number.parseInt(row.total_tokens ?? "0", 10) || 0 }))
    .sort((a, b) => b.tokens - a.tokens || (a.speaker < b.speaker ? -1 : a.speaker > b.speaker ? 1 : 0));
  const socratesIndex = ordered.findIndex((entry) => /^ΣΩ/u.test(entry.speaker));
  if (socratesIndex > 0) {
    const [socrates] = ordered.splice(socratesIndex, 1);
    if (socrates) ordered.unshift(socrates);
  }
  return ordered;
}

export function structureStripSvg(input: StructureStripInput): string {
  const { dialogue, turns, speakers, observationCountByTurnId, turnPageById, pagePath } = input;
  const includeObservationTicks = input.includeObservationTicks ?? true;
  const isUnattributed = speakers.length === 1 && (speakers[0]?.speaker ?? "") === "(unattributed)";

  const ordered = orderedSpeakers(speakers);
  const colors = new Map<string, string>();
  ordered.forEach((entry, index) => {
    colors.set(entry.speaker, isUnattributed ? SPEAKER_OTHER : index < SPEAKER_PALETTE.length ? SPEAKER_PALETTE[index]! : SPEAKER_OTHER);
  });

  type Segment = {
    turnId: string;
    speaker: string;
    weight: number;
    startMarker: string;
    endMarker: string;
    obs: number;
  };
  let segments: Segment[] = [...turns]
    .sort((a, b) => ((a.turn_id ?? "") < (b.turn_id ?? "") ? -1 : (a.turn_id ?? "") > (b.turn_id ?? "") ? 1 : 0))
    .map((turn) => ({
      turnId: turn.turn_id ?? "",
      speaker: turn.speaker ?? "",
      weight: turnWeight(turn),
      startMarker: turn.start_marker ?? "",
      endMarker: turn.end_marker ?? "",
      obs: observationCountByTurnId.get(turn.turn_id ?? "") ?? 0,
    }));

  if (segments.length > STRUCTURE_STRIP_MERGE_THRESHOLD) {
    // Merge consecutive same-speaker runs; keep the run's first turn as the link
    // target and start marker, the last as the end marker, summing weight+obs.
    const merged: Segment[] = [];
    for (const segment of segments) {
      const last = merged[merged.length - 1];
      if (last && last.speaker === segment.speaker) {
        last.weight += segment.weight;
        last.obs += segment.obs;
        last.endMarker = segment.endMarker;
      } else {
        merged.push({ ...segment });
      }
    }
    segments = merged;
    if (segments.length > STRUCTURE_STRIP_MAX_SEGMENTS) {
      throw new Error(
        `Structure strip for ${dialogue} still has ${segments.length} segments after same-speaker merging (max ${STRUCTURE_STRIP_MAX_SEGMENTS}).`,
      );
    }
  }

  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0) || 1;
  const bandRects: string[] = [];
  const tickRects: string[] = [];
  let x = 0;
  for (const segment of segments) {
    const raw = (segment.weight / totalWeight) * 1000;
    const gap = raw > 3 ? 0.6 : 0;
    const width = Math.max(0.4, raw - gap);
    const rectX = round2(x);
    const rectWidth = round2(width);
    const color = colors.get(segment.speaker) ?? SPEAKER_OTHER;
    const title = isUnattributed
      ? "single unattributed turn"
      : `${segment.speaker}, ${segment.startMarker}–${segment.endMarker}, ${segment.weight} tokens`;
    const rect = `<rect x="${rectX}" y="0" width="${rectWidth}" height="36" fill="${color}"><title>${escapeHtml(
      title,
    )}</title></rect>`;
    const target = turnPageById.get(segment.turnId);
    bandRects.push(target ? `<a href="${pathToRoot(pagePath)}${target}">${rect}</a>` : rect);

    if (includeObservationTicks && segment.obs > 0) {
      const opacity = round2(Math.min(0.9, 0.25 + 0.15 * segment.obs));
      tickRects.push(
        `<rect x="${rectX}" y="40" width="${round2(Math.max(width, 1.6))}" height="16" fill="#211d16" fill-opacity="${opacity}"><title>${segment.obs} accepted observation${segment.obs === 1 ? "" : "s"}</title></rect>`,
      );
    }
    x += raw;
  }

  const ariaLabel = includeObservationTicks
    ? `Turn structure of ${titleCaseDialogue(dialogue)} colored by speaker; tick marks show where accepted observations are anchored`
    : `Turn structure of ${titleCaseDialogue(dialogue)} colored by speaker, in reading order`;
  const viewBoxHeight = includeObservationTicks ? 56 : 40;
  const svg = `<svg viewBox="0 0 1000 ${viewBoxHeight}" role="img" aria-label="${escapeHtml(ariaLabel)}">${bandRects.join("")}${tickRects.join("")}</svg>`;

  const legendSpeakers = ordered.slice(0, SPEAKER_PALETTE.length);
  const overflow = ordered.length - legendSpeakers.length;
  const legend = `<p class="strip-legend">${legendSpeakers
    .map((entry) => {
      const greek = /\p{Script=Greek}/u.test(entry.speaker);
      return `<span class="swatch" style="background:${colors.get(entry.speaker) ?? SPEAKER_OTHER}"></span><span${
        greek ? ' lang="grc"' : ""
      }>${escapeHtml(entry.speaker)}</span>`;
    })
    .join("")}${overflow > 0 ? `<span class="swatch" style="background:${SPEAKER_OTHER}"></span>${overflow} more` : ""}</p>`;

  return `${svg}${legend}`;
}

// Shared square-root magnitude scale so every fingerprint strip is comparable;
// exact counts live in the per-cell tooltips. 0 stays 0 (an outlined, unattested
// cell); everything else is 0.18 + 0.14·√count, capped at 1, rounded to 2 dp.
export function fingerprintOpacity(count: number): number {
  if (count <= 0) return 0;
  return Math.round(Math.min(1, 0.18 + 0.14 * Math.sqrt(count)) * 100) / 100;
}

// Deterministic top-pattern selection: most dialogues first, then most accepted
// observations, then canonical axis/concept key ascending (no locale compare).
export function topPatternDossiers(dossiers: readonly SiteDossier[], limit = 12): SiteDossier[] {
  return [...dossiers]
    .sort(
      (a, b) =>
        b.dialogues - a.dialogues ||
        b.acceptedObservations - a.acceptedObservations ||
        (`${a.axisKey}/${a.conceptKey}` < `${b.axisKey}/${b.conceptKey}`
          ? -1
          : `${a.axisKey}/${a.conceptKey}` > `${b.axisKey}/${b.conceptKey}`
            ? 1
            : 0),
    )
    .slice(0, limit);
}

// Curated tag sets for the dialogues index, keyed by canonical
// `${axisKey}/${conceptKey}`. Two or
// three per dialogue, drafted from the computed candidates (a concept qualifies
// by having at least two accepted instances in the dialogue). Operator-owned
// copy under two build-enforced invariants: every tag must still be a real
// candidate in the dossier evidence, and a row's summed display text must fit
// one line (TAG_ROW_BUDGET). A 28th dialogue without an entry fails the build.
export const TAG_ROW_BUDGET = 72;
export const TAG_MIN_SUPPORT = 2;

export type DialogueTag = {
  axisId: string;
  axisKey: string;
  conceptId: string;
  conceptKey: string;
  display: string;
  count: number;
  corpus: number;
};

export function dialogueTags(dialogue: string, dossiers: readonly SiteDossier[]): DialogueTag[] {
  if (!DIALOGUE_EPIGRAPHS[dialogue]) throw new Error(`No curated epigraph for dialogue ${dialogue}.`);
  const candidates = dossiers
    .map((dossier) => ({
      dossier,
      count: dossier.presence.find((entry) => entry.dialogue === dialogue)?.acceptedObservations ?? 0,
    }))
    .filter(({ count }) => count >= TAG_MIN_SUPPORT)
    .sort(
      (left, right) =>
        right.count - left.count ||
        right.dossier.dialogues - left.dossier.dialogues ||
        right.dossier.acceptedObservations - left.dossier.acceptedObservations ||
        (`${left.dossier.axisKey}/${left.dossier.conceptKey}` <
        `${right.dossier.axisKey}/${right.dossier.conceptKey}`
          ? -1
          : `${left.dossier.axisKey}/${left.dossier.conceptKey}` >
              `${right.dossier.axisKey}/${right.dossier.conceptKey}`
            ? 1
            : 0),
    );
  const tags: DialogueTag[] = [];
  let budget = 0;
  for (const { dossier, count } of candidates) {
    const display = titleCaseDialogue(dossier.conceptKey);
    if (budget + display.length > TAG_ROW_BUDGET) continue;
    tags.push({
      axisId: dossier.axisId,
      axisKey: dossier.axisKey,
      conceptId: dossier.conceptId,
      conceptKey: dossier.conceptKey,
      display,
      count,
      corpus: dossier.acceptedObservations,
    });
    budget += display.length;
    if (tags.length === 3) break;
  }
  return tags;
}

// Curated standing-contradiction specimens for the patterns page, in display
// order. Each must exist, be an accepted contradiction, and be left standing —
// checked at build time so a re-adjudicated record cannot silently linger.
export const STANDING_SPECIMEN_IDS = ["rel_cross-dialogue_0021", "rel_crito_0002"] as const;

// Reader-facing descriptions for the layers appendix on the patterns page.
// Counts are computed at build time; the copy here is operator-owned.
export const LAYER_GUIDE = [
  {
    title: "Dossiers",
    path: "dossiers/index.html",
    description:
      "One evidence file per recurring concept: every accepted instance with its span, speakers, and turns, plus the canonical concepts it co-occurs with.",
  },
  {
    title: "Clusters",
    path: "clusters/index.html",
    description:
      "Observations grouped by the textual work they do — the same device gathered from every dialogue it appears in, so a move can be read across its settings.",
  },
  {
    title: "Axes",
    path: "axes/index.html",
    description:
      "Independent comparison questions that keep textual function, subject matter, presentation form, dramatic context, discourse structure, and lexical form distinct.",
  },
  {
    title: "Anchors",
    path: "anchors/index.html",
    description:
      "Occurrences of fixed verbal formulae — assent phrases, oath forms, definition prompts — located span by span so a formula's whole career is traceable.",
  },
  {
    title: "Claims",
    path: "claims/index.html",
    description:
      "Everything the text asserts, recorded per span with speaker, kind, and final status: left standing, refuted, or withdrawn by the dialogue's end.",
  },
  {
    title: "Relations",
    path: "relations/index.html",
    description:
      "Links between claims that support or strain against each other, within and across dialogues, each carrying the limits of what the link asserts.",
  },
  {
    title: "Concepts",
    path: "concepts/index.html",
    description:
      "Ratified comparison concepts with stable semantic identities, precise definitions, and their complete accepted observation memberships.",
  },
] as const;

// Local title-caser for the aria-label (avoids importing the whole layout
// surface); mirrors layout.titleCase for slugs.
function titleCaseDialogue(dialogue: string): string {
  return dialogue
    .split(/[_-]+/u)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

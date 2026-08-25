import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { collectLabelAudit, type LabelAuditEntry, type LabelAuditObservation } from "./labels.js";
import { getRepoRoot } from "./paths.js";
import { listGreekDialogues } from "./derived/stephanus.js";
import { SEED_FEATURE_FAMILIES } from "./wiki/observation-feature-index.js";

const HISTOGRAM_BUCKETS = ["1", "2", "3-5", "6-10", ">10"] as const;
const TOP_UNCOVERED_SINGLETON_FAMILIES = [
  "craft_analogy",
  "elenchus",
  "turn_geometry",
  "definition_ladder",
  "dramatic_case_setup",
  "prosopography",
  "myth_demarcation",
  "irony_marker",
  "forms_trajectory",
  "frame_depth",
] as const;

type HistogramBucket = (typeof HISTOGRAM_BUCKETS)[number];

export type LabelQualityLensEntry = {
  family: string;
  label: string;
  observations: LabelAuditObservation[];
  dialogues: string[];
  status: "singleton" | "within_dialogue_reuse" | "cross_dialogue";
};

export type LabelQualityLens = {
  name: "all_records" | "accepted_only";
  totalLabels: number;
  totalObservations: number;
  singletonLabels: number;
  withinDialogueReuseLabels: number;
  crossDialogueLabels: number;
  observationsPerLabel: Record<HistogramBucket, number>;
  reuseMass: {
    nonSingletonObservations: number;
    nonSingletonShare: number;
    crossDialogueObservations: number;
    crossDialogueShare: number;
  };
  lawsOnlySingletonLabels: number;
  entries: LabelQualityLensEntry[];
};

export type LabelQualityReport = {
  allRecords: LabelQualityLens;
  acceptedOnly: LabelQualityLens;
  perDialogueParticipation: Array<{
    dialogue: string;
    acceptedObservations: number;
    crossDialogueLabels: number;
    crossDialogueObservations: number;
    crossDialogueObservationShare: number;
  }>;
  dispositionCoverage: {
    maps: string[];
    coveredLabels: number;
    uncoveredLabels: number;
    coveredSingletons: number;
    uncoveredSingletons: number;
    topUncoveredSingletonFamilies: Array<{ family: string; uncoveredSingletons: number }>;
  };
  familyProfiles: Array<{
    family: string;
    kind: "seed" | "passthrough";
    labelCount: number;
    singletonCount: number;
    observationCount: number;
    allSingleton: boolean;
    lawsOnlySingletonCount: number;
  }>;
  labelNameShape: {
    tokenLengthDistribution: Array<{ tokens: number; labels: number }>;
    longestLabels: Array<{ family: string; label: string; tokens: number; observationId: string }>;
  };
};

export type AdjudicationSampleEntry = {
  family: string;
  label: string;
  observation_id: string;
  dialogue: string;
  stephanus_span: string;
  review_status: string;
  stratum: string;
  adjudication: "";
  target: null;
  reason: "";
};

export type AdjudicationSample = {
  version: 1;
  standard: "docs/label-normalization-standards.md";
  seed: string;
  universeSize: number;
  strata: Record<string, { population: number; drawn: number }>;
  entries: AdjudicationSampleEntry[];
};

export type WrittenLabelQuality = {
  path: string;
  report: LabelQualityReport;
};

export type WrittenAdjudicationSample = {
  path: string;
  sample: AdjudicationSample;
};

function labelKey(family: string, label: string) {
  return `${family}::${label}`;
}

function labelStatus(observations: LabelAuditObservation[]): LabelQualityLensEntry["status"] {
  if (observations.length === 1) return "singleton";
  return new Set(observations.map((observation) => observation.dialogue)).size >= 2
    ? "cross_dialogue"
    : "within_dialogue_reuse";
}

function flattenAuditEntries() {
  return collectLabelAudit().families.flatMap((family) => family.entries);
}

function toLensEntry(entry: LabelAuditEntry, observations: LabelAuditObservation[]): LabelQualityLensEntry | undefined {
  if (observations.length === 0) return undefined;
  const sortedObservations = [...observations].sort((a, b) => a.observationId.localeCompare(b.observationId));
  return {
    family: entry.family,
    label: entry.label,
    observations: sortedObservations,
    dialogues: [...new Set(sortedObservations.map((observation) => observation.dialogue))].sort(),
    status: labelStatus(sortedObservations),
  };
}

function histogramBucket(count: number): HistogramBucket {
  if (count === 1) return "1";
  if (count === 2) return "2";
  if (count <= 5) return "3-5";
  if (count <= 10) return "6-10";
  return ">10";
}

function emptyHistogram(): Record<HistogramBucket, number> {
  return { "1": 0, "2": 0, "3-5": 0, "6-10": 0, ">10": 0 };
}

function buildLens(name: LabelQualityLens["name"], entries: LabelQualityLensEntry[]): LabelQualityLens {
  const observationsPerLabel = emptyHistogram();
  for (const entry of entries) {
    observationsPerLabel[histogramBucket(entry.observations.length)] += 1;
  }

  const nonSingletonObservations = entries
    .filter((entry) => entry.status !== "singleton")
    .reduce((sum, entry) => sum + entry.observations.length, 0);
  const crossDialogueObservations = entries
    .filter((entry) => entry.status === "cross_dialogue")
    .reduce((sum, entry) => sum + entry.observations.length, 0);
  const totalObservations = entries.reduce((sum, entry) => sum + entry.observations.length, 0);

  return {
    name,
    totalLabels: entries.length,
    totalObservations,
    singletonLabels: entries.filter((entry) => entry.status === "singleton").length,
    withinDialogueReuseLabels: entries.filter((entry) => entry.status === "within_dialogue_reuse").length,
    crossDialogueLabels: entries.filter((entry) => entry.status === "cross_dialogue").length,
    observationsPerLabel,
    reuseMass: {
      nonSingletonObservations,
      nonSingletonShare: share(nonSingletonObservations, totalObservations),
      crossDialogueObservations,
      crossDialogueShare: share(crossDialogueObservations, totalObservations),
    },
    lawsOnlySingletonLabels: entries.filter(
      (entry) => entry.status === "singleton" && entry.dialogues.length === 1 && entry.dialogues[0] === "laws",
    ).length,
    entries,
  };
}

function currentLabelEntries() {
  const auditEntries = flattenAuditEntries();
  const allRecords = auditEntries
    .map((entry) => toLensEntry(entry, entry.observations))
    .filter((entry): entry is LabelQualityLensEntry => entry !== undefined);
  const acceptedOnly = auditEntries
    .map((entry) => toLensEntry(entry, entry.observations.filter((observation) => observation.reviewStatus === "accepted")))
    .filter((entry): entry is LabelQualityLensEntry => entry !== undefined);

  return { allRecords, acceptedOnly };
}

function share(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function readDispositionCoveredKeys() {
  const repoRoot = getRepoRoot();
  const dir = join(repoRoot, "wiki/label-consolidation");
  const maps: string[] = [];
  const covered = new Set<string>();
  if (!existsSync(dir)) return { maps, covered };

  for (const fileName of readdirSync(dir).filter((name) => name.endsWith(".json")).sort()) {
    const relativePath = `wiki/label-consolidation/${fileName}`;
    maps.push(relativePath);
    const raw = JSON.parse(readFileSync(join(dir, fileName), "utf8")) as {
      dispositions?: Array<{
        family?: string;
        label?: string;
        action?: string;
        to?: { family?: string; label?: string };
      }>;
      createdLabels?: Array<{ family?: string; label?: string }>;
    };
    for (const disposition of raw.dispositions ?? []) {
      if (disposition.action !== "keep" && disposition.action !== "merge") continue;
      if (disposition.family && disposition.label) {
        covered.add(labelKey(disposition.family, disposition.label));
      }
      if (disposition.to?.family && disposition.to.label) {
        covered.add(labelKey(disposition.to.family, disposition.to.label));
      }
    }
    for (const created of raw.createdLabels ?? []) {
      if (created.family && created.label) {
        covered.add(labelKey(created.family, created.label));
      }
    }
  }

  return { maps, covered };
}

function computeDispositionCoverage(entries: LabelQualityLensEntry[], coveredKeys: Set<string>): LabelQualityReport["dispositionCoverage"] {
  const labelEntries = entries.map((entry) => ({ entry, key: labelKey(entry.family, entry.label) }));
  const singletonEntries = labelEntries.filter(({ entry }) => entry.status === "singleton");
  const uncoveredSingletonsByFamily = new Map<string, number>();
  for (const { entry, key } of singletonEntries) {
    if (!coveredKeys.has(key)) {
      uncoveredSingletonsByFamily.set(entry.family, (uncoveredSingletonsByFamily.get(entry.family) ?? 0) + 1);
    }
  }

  const maps = readDispositionCoveredKeys().maps;
  return {
    maps,
    coveredLabels: labelEntries.filter(({ key }) => coveredKeys.has(key)).length,
    uncoveredLabels: labelEntries.filter(({ key }) => !coveredKeys.has(key)).length,
    coveredSingletons: singletonEntries.filter(({ key }) => coveredKeys.has(key)).length,
    uncoveredSingletons: singletonEntries.filter(({ key }) => !coveredKeys.has(key)).length,
    topUncoveredSingletonFamilies: [...uncoveredSingletonsByFamily.entries()]
      .map(([family, uncoveredSingletons]) => ({ family, uncoveredSingletons }))
      .sort((a, b) => b.uncoveredSingletons - a.uncoveredSingletons || a.family.localeCompare(b.family))
      .slice(0, 20),
  };
}

function computePerDialogueParticipation(entries: LabelQualityLensEntry[]) {
  const acceptedByDialogue = new Map<string, number>();
  const crossDialogueLabelCountByDialogue = new Map<string, Set<string>>();
  const crossDialogueObservationCountByDialogue = new Map<string, number>();

  for (const entry of entries) {
    for (const observation of entry.observations) {
      acceptedByDialogue.set(observation.dialogue, (acceptedByDialogue.get(observation.dialogue) ?? 0) + 1);
      if (entry.status === "cross_dialogue") {
        const labels = crossDialogueLabelCountByDialogue.get(observation.dialogue) ?? new Set<string>();
        labels.add(labelKey(entry.family, entry.label));
        crossDialogueLabelCountByDialogue.set(observation.dialogue, labels);
        crossDialogueObservationCountByDialogue.set(
          observation.dialogue,
          (crossDialogueObservationCountByDialogue.get(observation.dialogue) ?? 0) + 1,
        );
      }
    }
  }

  return listGreekDialogues().map((dialogue) => {
    const acceptedObservations = acceptedByDialogue.get(dialogue) ?? 0;
    const crossDialogueObservations = crossDialogueObservationCountByDialogue.get(dialogue) ?? 0;
    return {
      dialogue,
      acceptedObservations,
      crossDialogueLabels: crossDialogueLabelCountByDialogue.get(dialogue)?.size ?? 0,
      crossDialogueObservations,
      crossDialogueObservationShare: share(crossDialogueObservations, acceptedObservations),
    };
  });
}

function computeFamilyProfiles(entries: LabelQualityLensEntry[]): LabelQualityReport["familyProfiles"] {
  const familyEntries = new Map<string, LabelQualityLensEntry[]>();
  for (const entry of entries) {
    familyEntries.set(entry.family, [...(familyEntries.get(entry.family) ?? []), entry]);
  }

  return [...familyEntries.entries()]
    .map(([family, labels]) => ({
      family,
      kind: (SEED_FEATURE_FAMILIES as readonly string[]).includes(family) ? ("seed" as const) : ("passthrough" as const),
      labelCount: labels.length,
      singletonCount: labels.filter((entry) => entry.status === "singleton").length,
      observationCount: labels.reduce((sum, entry) => sum + entry.observations.length, 0),
      allSingleton: labels.every((entry) => entry.status === "singleton"),
      lawsOnlySingletonCount: labels.filter(
        (entry) => entry.status === "singleton" && entry.dialogues.length === 1 && entry.dialogues[0] === "laws",
      ).length,
    }))
    .sort((a, b) => a.family.localeCompare(b.family));
}

function labelTokenCount(label: string) {
  return label.split("_").filter(Boolean).length;
}

function computeLabelNameShape(entries: LabelQualityLensEntry[]): LabelQualityReport["labelNameShape"] {
  const counts = new Map<number, number>();
  for (const entry of entries) {
    const tokens = labelTokenCount(entry.label);
    counts.set(tokens, (counts.get(tokens) ?? 0) + 1);
  }

  return {
    tokenLengthDistribution: [...counts.entries()]
      .map(([tokens, labels]) => ({ tokens, labels }))
      .sort((a, b) => a.tokens - b.tokens),
    longestLabels: [...entries]
      .map((entry) => ({
        family: entry.family,
        label: entry.label,
        tokens: labelTokenCount(entry.label),
        observationId: entry.observations[0]?.observationId ?? "",
      }))
      .sort((a, b) => b.tokens - a.tokens || a.family.localeCompare(b.family) || a.label.localeCompare(b.label))
      .slice(0, 20),
  };
}

export function collectLabelQuality(): LabelQualityReport {
  const entries = currentLabelEntries();
  const { maps, covered } = readDispositionCoveredKeys();
  const dispositionCoverage = computeDispositionCoverage(entries.allRecords, covered);
  return {
    allRecords: buildLens("all_records", entries.allRecords),
    acceptedOnly: buildLens("accepted_only", entries.acceptedOnly),
    perDialogueParticipation: computePerDialogueParticipation(entries.acceptedOnly),
    dispositionCoverage: { ...dispositionCoverage, maps },
    familyProfiles: computeFamilyProfiles(entries.allRecords),
    labelNameShape: computeLabelNameShape(entries.allRecords),
  };
}

function renderLens(lens: LabelQualityLens) {
  return [
    "```yaml",
    `labels: ${lens.totalLabels}`,
    `observations: ${lens.totalObservations}`,
    `singleton_labels: ${lens.singletonLabels}`,
    `within_dialogue_reuse_labels: ${lens.withinDialogueReuseLabels}`,
    `cross_dialogue_labels: ${lens.crossDialogueLabels}`,
    `non_singleton_observations: ${lens.reuseMass.nonSingletonObservations}`,
    `non_singleton_observation_share: ${percent(lens.reuseMass.nonSingletonShare)}`,
    `cross_dialogue_observations: ${lens.reuseMass.crossDialogueObservations}`,
    `cross_dialogue_observation_share: ${percent(lens.reuseMass.crossDialogueShare)}`,
    `laws_only_singleton_labels: ${lens.lawsOnlySingletonLabels}`,
    "observations_per_label:",
    ...HISTOGRAM_BUCKETS.map((bucket) => `  ${bucket}: ${lens.observationsPerLabel[bucket]}`),
    "```",
  ].join("\n");
}

function renderRows<T>(rows: T[], render: (row: T) => string) {
  return rows.length === 0 ? ["```yaml", "[]", "```"].join("\n") : ["```yaml", ...rows.map(render), "```"].join("\n");
}

export function formatLabelQualityMarkdown(report: LabelQualityReport) {
  return [
    "# Label Quality",
    "",
    "Generated by `bun run harness labels report --write`.",
    "",
    "## All records",
    "",
    renderLens(report.allRecords),
    "",
    "## Accepted-only",
    "",
    renderLens(report.acceptedOnly),
    "",
    "## Disposition coverage",
    "",
    "```yaml",
    `merge_maps: [${report.dispositionCoverage.maps.join(", ")}]`,
    `covered_labels: ${report.dispositionCoverage.coveredLabels}`,
    `uncovered_labels: ${report.dispositionCoverage.uncoveredLabels}`,
    `covered_singletons: ${report.dispositionCoverage.coveredSingletons}`,
    `uncovered_singletons: ${report.dispositionCoverage.uncoveredSingletons}`,
    "```",
    "",
    "### Top uncovered singleton families",
    "",
    renderRows(
      report.dispositionCoverage.topUncoveredSingletonFamilies,
      (row) => `- family: ${row.family}; uncovered_singletons: ${row.uncoveredSingletons}`,
    ),
    "",
    "## Per-dialogue cross-dialogue-label participation",
    "",
    renderRows(
      report.perDialogueParticipation,
      (row) =>
        `- dialogue: ${row.dialogue}; accepted_observations: ${row.acceptedObservations}; cross_dialogue_labels: ${row.crossDialogueLabels}; cross_dialogue_observations: ${row.crossDialogueObservations}; cross_dialogue_observation_share: ${percent(row.crossDialogueObservationShare)}`,
    ),
    "",
    "## Family profiles",
    "",
    renderRows(
      report.familyProfiles,
      (row) =>
        `- family: ${row.family}; kind: ${row.kind}; labels: ${row.labelCount}; singletons: ${row.singletonCount}; observations: ${row.observationCount}; all_singleton: ${row.allSingleton}; laws_only_singletons: ${row.lawsOnlySingletonCount}`,
    ),
    "",
    "## Label-name length distribution",
    "",
    renderRows(report.labelNameShape.tokenLengthDistribution, (row) => `- tokens: ${row.tokens}; labels: ${row.labels}`),
    "",
    "### Longest label names",
    "",
    renderRows(
      report.labelNameShape.longestLabels,
      (row) => `- family: ${row.family}; label: ${row.label}; tokens: ${row.tokens}; observation_id: ${row.observationId}`,
    ),
    "",
  ].join("\n");
}

export function writeLabelQuality({ path = "wiki/label-quality.md" }: { path?: string } = {}): WrittenLabelQuality {
  const report = collectLabelQuality();
  const repoRoot = getRepoRoot();
  const absolutePath = join(repoRoot, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatLabelQualityMarkdown(report), "utf8");
  return { path: relative(repoRoot, absolutePath), report };
}

function sampleUniverse(coveredKeys = readDispositionCoveredKeys().covered) {
  return currentLabelEntries().allRecords
    .filter((entry) => entry.status === "singleton" && !coveredKeys.has(labelKey(entry.family, entry.label)))
    .sort((a, b) => a.family.localeCompare(b.family) || a.label.localeCompare(b.label));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function stratumFor(entry: LabelQualityLensEntry) {
  if ((TOP_UNCOVERED_SINGLETON_FAMILIES as readonly string[]).includes(entry.family)) return entry.family;
  const isSeed = (SEED_FEATURE_FAMILIES as readonly string[]).includes(entry.family);
  if (!isSeed && entry.observations.every((observation) => observation.dialogue === "laws")) return "laws-only passthrough";
  return "other";
}

function orderedStratumNames() {
  return [...TOP_UNCOVERED_SINGLETON_FAMILIES, "laws-only passthrough", "other"];
}

function allocateDraws(populations: Map<string, number>, size: number) {
  const nonEmpty = orderedStratumNames().filter((name) => (populations.get(name) ?? 0) > 0);
  const allocations = new Map<string, number>();
  for (const name of nonEmpty) {
    allocations.set(name, Math.min(12, populations.get(name)!));
  }

  let drawn = [...allocations.values()].reduce((sum, count) => sum + count, 0);
  if (drawn > size) {
    throw new Error(`Sample size ${size} is too small for ${nonEmpty.length} non-empty strata.`);
  }

  while (drawn < size) {
    const candidates = nonEmpty
      .map((name) => {
        const population = populations.get(name)!;
        const current = allocations.get(name)!;
        const remainingCapacity = population - current;
        const ideal = (population / [...populations.values()].reduce((sum, count) => sum + count, 0)) * size;
        return { name, population, current, remainingCapacity, deficit: ideal - current };
      })
      .filter((candidate) => candidate.remainingCapacity > 0)
      .sort((a, b) => b.deficit - a.deficit || b.population - a.population || a.name.localeCompare(b.name));
    if (candidates.length === 0) break;
    allocations.set(candidates[0]!.name, candidates[0]!.current + 1);
    drawn += 1;
  }

  return allocations;
}

function shuffled<T>(values: T[], random: () => number) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

export function buildAdjudicationSample({ size = 320 }: { size?: number } = {}): AdjudicationSample {
  const universe = sampleUniverse();
  const universeKeys = universe.map((entry) => labelKey(entry.family, entry.label)).sort();
  const seed = sha256(universeKeys.join("\n")).slice(0, 8);
  const random = mulberry32(Number.parseInt(seed, 16));

  const strataEntries = new Map<string, LabelQualityLensEntry[]>();
  for (const name of orderedStratumNames()) {
    strataEntries.set(name, []);
  }
  for (const entry of universe) {
    const stratum = stratumFor(entry);
    strataEntries.set(stratum, [...(strataEntries.get(stratum) ?? []), entry]);
  }

  const populations = new Map([...strataEntries.entries()].map(([name, entries]) => [name, entries.length]));
  const allocations = allocateDraws(populations, size);
  const entries: AdjudicationSampleEntry[] = [];
  const strata: AdjudicationSample["strata"] = {};

  for (const name of orderedStratumNames()) {
    const stratumEntries = strataEntries.get(name) ?? [];
    const drawn = allocations.get(name) ?? 0;
    strata[name] = { population: stratumEntries.length, drawn };
    const selected = shuffled(
      stratumEntries.sort((a, b) => labelKey(a.family, a.label).localeCompare(labelKey(b.family, b.label))),
      random,
    )
      .slice(0, drawn)
      .sort((a, b) => labelKey(a.family, a.label).localeCompare(labelKey(b.family, b.label)));
    for (const entry of selected) {
      const observation = entry.observations[0]!;
      entries.push({
        family: entry.family,
        label: entry.label,
        observation_id: observation.observationId,
        dialogue: observation.dialogue,
        stephanus_span: observation.stephanusSpan,
        review_status: observation.reviewStatus,
        stratum: name,
        adjudication: "",
        target: null,
        reason: "",
      });
    }
  }

  return {
    version: 1,
    standard: "docs/label-normalization-standards.md",
    seed,
    universeSize: universe.length,
    strata,
    entries,
  };
}

export function writeAdjudicationSample({
  dir = "wiki/review/2026-07-singleton-adjudication",
  size = 320,
}: {
  dir?: string;
  size?: number;
} = {}): WrittenAdjudicationSample {
  const sample = buildAdjudicationSample({ size });
  const repoRoot = getRepoRoot();
  const absolutePath = join(repoRoot, dir, "sample.json");
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
  return { path: relative(repoRoot, absolutePath), sample };
}

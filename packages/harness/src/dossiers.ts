import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { getRepoRoot } from "./paths.js";
import { listGreekDialogues } from "./derived/stephanus.js";
import { observationTurnJoinPath, parseObservationTurnJoinToon, type ObservationTurnJoinRow } from "./derived/joins.js";
import {
  dialogueFromObservationId,
  fieldValue,
  listObservationLedgerPaths,
  nestedFieldValueInParent,
  observationYamlBlocks,
} from "./wiki/observation-ledger.js";

export type DossierObservation = {
  observationId: string;
  dialogue: string;
  stephanusSpan: string;
  featureFamily: string;
  featureLabel: string;
  reviewStatus: string;
  startChar: number;
  endChar: number;
};

export type PatternDossier = {
  family: string;
  label: string;
  instances: Array<{
    observationId: string;
    dialogue: string;
    stephanusSpan: string;
    speakers: string[];
    turnCount: number;
  }>;
  presence: Array<{ dialogue: string; acceptedObservations: number }>;
  cooccurrence: Array<{ family: string; label: string; overlappingObservations: number }>;
  counterevidence: Array<{ observationId: string; dialogue: string; stephanusSpan: string; reviewStatus: string }>;
};

export type WrittenDossierArtifact = {
  path: string;
  dossierCount: number;
};

function labelKey(family: string, label: string) {
  return `${family}::${label}`;
}

function dossierPath(family: string, label: string) {
  return `wiki/dossiers/${family}/${label}.md`;
}

function dossierId(family: string, label: string) {
  return `dossier_${family}_${label}`;
}

function parseObservationRecords() {
  const observations: DossierObservation[] = [];
  for (const path of listObservationLedgerPaths({ absolute: true })) {
    const content = readFileSync(path, "utf8");
    for (const block of observationYamlBlocks(content)) {
      const observationId = fieldValue(block, "observation_id");
      const featureFamily = fieldValue(block, "feature_family");
      const featureLabel = fieldValue(block, "feature_label");
      const stephanusSpan = fieldValue(block, "stephanus_span");
      const reviewStatus = fieldValue(block, "review_status") ?? "unreviewed";
      const startChar = Number(nestedFieldValueInParent(block, "source_ref", "start_char"));
      const endChar = Number(nestedFieldValueInParent(block, "source_ref", "end_char"));
      if (
        !observationId ||
        !featureFamily ||
        !featureLabel ||
        !stephanusSpan ||
        !Number.isInteger(startChar) ||
        !Number.isInteger(endChar) ||
        endChar < startChar
      ) {
        throw new Error(`Malformed observation record for dossier generation: ${observationId ?? "(missing id)"}`);
      }
      observations.push({
        observationId,
        dialogue: dialogueFromObservationId(observationId),
        stephanusSpan,
        featureFamily,
        featureLabel,
        reviewStatus,
        startChar,
        endChar,
      });
    }
  }
  return observations.sort((a, b) => a.observationId.localeCompare(b.observationId));
}

function readJoinRows(dialogues: string[]) {
  const rows = new Map<string, ObservationTurnJoinRow>();
  for (const dialogue of dialogues) {
    const path = observationTurnJoinPath(dialogue);
    const absolutePath = join(getRepoRoot(), path);
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing observation-turn join: ${path}`);
    }
    const index = parseObservationTurnJoinToon(readFileSync(absolutePath, "utf8"));
    for (const row of index.rows) {
      rows.set(row.observationId, row);
    }
  }
  return rows;
}

function overlaps(a: DossierObservation, b: DossierObservation) {
  return a.dialogue === b.dialogue && a.startChar < b.endChar && b.startChar < a.endChar;
}

export function buildDossiers(): PatternDossier[] {
  const observations = parseObservationRecords();
  const accepted = observations.filter((observation) => observation.reviewStatus === "accepted");
  const joinRows = readJoinRows([...new Set(observations.map((observation) => observation.dialogue))].sort());
  const byLabel = new Map<string, DossierObservation[]>();

  for (const observation of accepted) {
    const key = labelKey(observation.featureFamily, observation.featureLabel);
    byLabel.set(key, [...(byLabel.get(key) ?? []), observation]);
  }

  const dialogues = listGreekDialogues();
  return [...byLabel.entries()]
    .filter(([, entries]) => entries.length >= 2)
    .map(([key, instances]) => {
      const [family, label] = key.split("::") as [string, string];
      const instanceIds = new Set(instances.map((observation) => observation.observationId));
      const cooccurrenceIds = new Map<string, Set<string>>();

      for (const instance of instances) {
        for (const other of accepted) {
          if (instanceIds.has(other.observationId)) continue;
          if (!overlaps(instance, other)) continue;
          const otherKey = labelKey(other.featureFamily, other.featureLabel);
          const ids = cooccurrenceIds.get(otherKey) ?? new Set<string>();
          ids.add(other.observationId);
          cooccurrenceIds.set(otherKey, ids);
        }
      }

      const counterevidence = observations
        .filter(
          (observation) =>
            observation.featureFamily === family &&
            observation.featureLabel === label &&
            (observation.reviewStatus === "rejected" || observation.reviewStatus === "needs_split"),
        )
        .map((observation) => ({
          observationId: observation.observationId,
          dialogue: observation.dialogue,
          stephanusSpan: observation.stephanusSpan,
          reviewStatus: observation.reviewStatus,
        }));

      return {
        family,
        label,
        instances: instances.map((observation) => {
          const join = joinRows.get(observation.observationId);
          if (!join) {
            throw new Error(`Missing join row for ${observation.observationId}`);
          }
          return {
            observationId: observation.observationId,
            dialogue: observation.dialogue,
            stephanusSpan: observation.stephanusSpan,
            speakers: join.attributed ? join.speakers : ["(unattributed)"],
            turnCount: join.turnIds.length,
          };
        }),
        presence: dialogues.map((dialogue) => ({
          dialogue,
          acceptedObservations: instances.filter((observation) => observation.dialogue === dialogue).length,
        })),
        cooccurrence: [...cooccurrenceIds.entries()]
          .map(([otherKey, ids]) => {
            const [otherFamily, otherLabel] = otherKey.split("::") as [string, string];
            return { family: otherFamily, label: otherLabel, overlappingObservations: ids.size };
          })
          .sort(
            (a, b) =>
              b.overlappingObservations - a.overlappingObservations ||
              a.family.localeCompare(b.family) ||
              a.label.localeCompare(b.label),
          )
          .slice(0, 15),
        counterevidence,
      };
    })
    .sort((a, b) => a.family.localeCompare(b.family) || a.label.localeCompare(b.label));
}

function yamlList(values: string[]) {
  return `[${values.join(", ")}]`;
}

function renderRows<T>(rows: T[], render: (row: T) => string) {
  return rows.length === 0 ? ["```yaml", "[]", "```"].join("\n") : ["```yaml", ...rows.map(render), "```"].join("\n");
}

export function formatDossierMarkdown(dossier: PatternDossier) {
  const dialogueCount = dossier.presence.filter((entry) => entry.acceptedObservations > 0).length;
  return [
    "Generated by `bun run harness dossiers --write`.",
    "",
    `# Dossier: ${dossier.family}/${dossier.label}`,
    "",
    "```yaml",
    `dossier_id: ${dossierId(dossier.family, dossier.label)}`,
    `feature_family: ${dossier.family}`,
    `feature_label: ${dossier.label}`,
    `accepted_observations: ${dossier.instances.length}`,
    `dialogues: ${dialogueCount}`,
    `counter_records: ${dossier.counterevidence.length}`,
    `instance_ids: ${yamlList(dossier.instances.map((instance) => instance.observationId))}`,
    `counter_ids: ${yamlList(dossier.counterevidence.map((counter) => counter.observationId))}`,
    "```",
    "",
    "## Instances",
    "",
    renderRows(
      dossier.instances,
      (instance) =>
        `- id: ${instance.observationId}; dialogue: ${instance.dialogue}; span: ${instance.stephanusSpan}; speakers: ${yamlList(instance.speakers)}; turn_count: ${instance.turnCount}`,
    ),
    "",
    "## Presence",
    "",
    renderRows(dossier.presence, (entry) => `- dialogue: ${entry.dialogue}; accepted_observations: ${entry.acceptedObservations}`),
    "",
    "## Co-occurrence",
    "",
    renderRows(
      dossier.cooccurrence,
      (entry) => `- family: ${entry.family}; label: ${entry.label}; overlapping_observations: ${entry.overlappingObservations}`,
    ),
    "",
    "## Counterevidence",
    "",
    renderRows(
      dossier.counterevidence,
      (entry) =>
        `- id: ${entry.observationId}; dialogue: ${entry.dialogue}; span: ${entry.stephanusSpan}; review_status: ${entry.reviewStatus}`,
    ),
    "",
  ].join("\n");
}

function formatDossierIndexMarkdown(dossiers: PatternDossier[]) {
  return [
    "Generated by `bun run harness dossiers --write`.",
    "",
    "# Dossier Index",
    "",
    "```yaml",
    `dossiers: ${dossiers.length}`,
    "```",
    "",
    "```yaml",
    ...dossiers.map(
      (dossier) =>
        `- family: ${dossier.family}; label: ${dossier.label}; accepted_obs: ${dossier.instances.length}; dialogues: ${dossier.presence.filter((entry) => entry.acceptedObservations > 0).length}; counter_records: ${dossier.counterevidence.length}`,
    ),
    "```",
    "",
  ].join("\n");
}

export function writeDossierArtifacts(): WrittenDossierArtifact[] {
  const dossiers = buildDossiers();
  const repoRoot = getRepoRoot();
  const dossierDir = join(repoRoot, "wiki/dossiers");
  rmSync(dossierDir, { recursive: true, force: true });
  mkdirSync(dossierDir, { recursive: true });

  const written: WrittenDossierArtifact[] = [];
  for (const dossier of dossiers) {
    const absolutePath = join(repoRoot, dossierPath(dossier.family, dossier.label));
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, formatDossierMarkdown(dossier), "utf8");
    written.push({ path: relative(repoRoot, absolutePath), dossierCount: 1 });
  }

  const indexPath = join(dossierDir, "index.md");
  writeFileSync(indexPath, formatDossierIndexMarkdown(dossiers), "utf8");
  written.push({ path: relative(repoRoot, indexPath), dossierCount: dossiers.length });
  return written;
}

function parseYamlList(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  return trimmed
    .slice(1, -1)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function scalar(content: string, field: string) {
  return new RegExp(`^${field}:\\s*(.*)$`, "mu").exec(content)?.[1]?.trim() ?? "";
}

function listDossierFiles(dir: string, prefix = "wiki/dossiers"): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const childPath = join(dir, entry.name);
    const relativePath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) return listDossierFiles(childPath, relativePath);
    return entry.isFile() && entry.name.endsWith(".md") ? [relativePath] : [];
  });
}

export function validateDossierArtifacts() {
  const repoRoot = getRepoRoot();
  const dossierDir = join(repoRoot, "wiki/dossiers");
  const observations = parseObservationRecords();
  const observationById = new Map(observations.map((observation) => [observation.observationId, observation]));
  const expected = new Map<string, DossierObservation[]>();
  for (const observation of observations.filter((entry) => entry.reviewStatus === "accepted")) {
    const key = labelKey(observation.featureFamily, observation.featureLabel);
    expected.set(key, [...(expected.get(key) ?? []), observation]);
  }
  for (const [key, values] of [...expected.entries()]) {
    if (values.length < 2) expected.delete(key);
  }

  const failures: string[] = [];
  const expectedFiles = new Set(
    [...expected.entries()].map(([key]) => {
      const [family, label] = key.split("::") as [string, string];
      return dossierPath(family, label);
    }),
  );
  if (expectedFiles.size > 0) expectedFiles.add("wiki/dossiers/index.md");

  const actualFiles = new Set(listDossierFiles(dossierDir));
  for (const expectedPath of [...expectedFiles].sort()) {
    if (!actualFiles.has(expectedPath)) failures.push(`${expectedPath}: missing dossier artifact`);
  }
  for (const actualPath of [...actualFiles].sort()) {
    if (!expectedFiles.has(actualPath)) failures.push(`${actualPath}: stale dossier artifact`);
  }
  if (failures.length > 0) return failures;

  for (const path of [...actualFiles].sort()) {
    if (path === "wiki/dossiers/index.md") continue;
    const content = readFileSync(join(repoRoot, path), "utf8");
    const family = scalar(content, "feature_family");
    const label = scalar(content, "feature_label");
    const key = labelKey(family, label);
    const expectedInstances = expected.get(key)?.map((observation) => observation.observationId).sort() ?? [];
    const actualInstances = parseYamlList(scalar(content, "instance_ids")).sort();
    if (expectedInstances.join("\n") !== actualInstances.join("\n")) {
      failures.push(`${path}: instance_ids do not match accepted observations for ${key}`);
    }
    for (const observationId of actualInstances) {
      const observation = observationById.get(observationId);
      if (!observation || observation.reviewStatus !== "accepted") {
        failures.push(`${path}: instance references missing or non-accepted observation ${observationId}`);
      }
    }
    for (const observationId of parseYamlList(scalar(content, "counter_ids"))) {
      const observation = observationById.get(observationId);
      if (!observation || (observation.reviewStatus !== "rejected" && observation.reviewStatus !== "needs_split")) {
        failures.push(`${path}: counterevidence references missing or accepted observation ${observationId}`);
      }
    }
  }

  return failures;
}

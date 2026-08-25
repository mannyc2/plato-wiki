import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { stephanusMarkers } from "../source.js";

export type StephanusIndexEntry = {
  marker: string;
  startChar: number;
  endChar: number;
};

export type StephanusIndex = {
  dialogue: string;
  sourcePath: string;
  sourceSha256: string;
  markers: StephanusIndexEntry[];
};

export type StephanusSegment = {
  dialogue: string;
  startMarker: string;
  endMarker: string;
  startChar: number;
  endChar: number;
  markerCount: number;
  sourceBytes: number;
};

function assertDialogueSlug(dialogue: string) {
  if (!/^[a-z0-9-]+$/u.test(dialogue)) {
    throw new Error(`Dialogue slug must use lowercase letters, numbers, and hyphens: ${dialogue}`);
  }
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function pad(value: string, width: number) {
  return value.padEnd(width, " ");
}

export function markerForOffset(markers: Array<{ marker: string; startChar: number; endChar: number }>, offset: number) {
  return (
    markers.find((marker) => marker.startChar <= offset && offset < marker.endChar)?.marker ??
    [...markers].reverse().find((marker) => marker.startChar <= offset)?.marker ??
    markers[0]?.marker ??
    "(none)"
  );
}

export function stephanusIndexPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/stephanus/${dialogue}.toon`;
}

export function englishStephanusIndexPath(dialogue: string) {
  assertDialogueSlug(dialogue);
  return `derived/plato/stephanus-english/${dialogue}.toon`;
}

export function listGreekDialogues() {
  const greekDir = join(getRepoRoot(), "raw/plato/greek");
  if (!existsSync(greekDir)) return [];

  return readdirSync(greekDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => basename(entry.name, ".txt"))
    .sort();
}

export function listEnglishDialogues() {
  const englishDir = join(getRepoRoot(), "raw/plato/english");
  if (!existsSync(englishDir)) return [];

  return readdirSync(englishDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => basename(entry.name, ".txt"))
    .sort();
}

function buildStephanusIndexFor(dialogue: string, sourcePath: string, missingLabel: string): StephanusIndex {
  assertDialogueSlug(dialogue);
  const absoluteSourcePath = join(getRepoRoot(), sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    throw new Error(`Missing ${missingLabel} text for dialogue: ${dialogue}`);
  }

  const content = readFileSync(absoluteSourcePath, "utf8");
  const markers = stephanusMarkers(content);
  const seen = new Set<string>();
  for (const marker of markers) {
    if (seen.has(marker.marker)) {
      throw new Error(`Duplicate Stephanus marker ${marker.marker} in ${sourcePath}`);
    }
    seen.add(marker.marker);
  }

  return {
    dialogue,
    sourcePath,
    sourceSha256: sha256(content),
    markers: markers.map((marker, index) => ({
      marker: marker.marker,
      startChar: marker.index,
      endChar: markers[index + 1]?.index ?? content.length,
    })),
  };
}

export function buildStephanusIndex(dialogue: string): StephanusIndex {
  return buildStephanusIndexFor(dialogue, `raw/plato/greek/${dialogue}.txt`, "Greek");
}

export function buildEnglishStephanusIndex(dialogue: string): StephanusIndex {
  return buildStephanusIndexFor(dialogue, `raw/plato/english/${dialogue}.txt`, "English");
}

export function formatStephanusIndexToon(index: StephanusIndex) {
  const markerWidth = Math.max("marker".length, ...index.markers.map((entry) => entry.marker.length));
  const startWidth = Math.max("start_char".length, ...index.markers.map((entry) => String(entry.startChar).length));
  const endWidth = Math.max("end_char".length, ...index.markers.map((entry) => String(entry.endChar).length));
  const rows = [
    `  ${pad("marker", markerWidth)} | ${pad("start_char", startWidth)} | ${pad("end_char", endWidth)}`,
    ...index.markers.map(
      (entry) =>
        `  ${pad(entry.marker, markerWidth)} | ${pad(String(entry.startChar), startWidth)} | ${pad(String(entry.endChar), endWidth)}`,
    ),
  ].map((line) => line.trimEnd());

  return [
    `dialogue: ${index.dialogue}`,
    `source_path: ${index.sourcePath}`,
    `source_sha256: ${index.sourceSha256}`,
    `markers[${index.markers.length}]:`,
    ...rows,
    "",
  ].join("\n");
}

export function parseStephanusIndexToon(content: string): StephanusIndex {
  const lines = content.trimEnd().split(/\r?\n/u);
  const dialogue = /^dialogue:\s+([a-z0-9-]+)$/u.exec(lines[0] ?? "")?.[1];
  const sourcePath = /^source_path:\s+(raw\/plato\/(?:greek|english)\/[a-z0-9-]+\.txt)$/u.exec(lines[1] ?? "")?.[1];
  const sourceSha256 = /^source_sha256:\s+([a-f0-9]{64})$/u.exec(lines[2] ?? "")?.[1];
  const markerCount = /^markers\[(\d+)\]:$/u.exec(lines[3] ?? "")?.[1];
  const header = lines[4]?.trim();

  if (!dialogue || !sourcePath || !sourceSha256 || markerCount === undefined || header !== "marker | start_char | end_char") {
    throw new Error("Malformed Stephanus index header.");
  }

  const markers = lines.slice(5).map((line) => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length !== 3 || !/^\d+[a-e]$/u.test(columns[0] ?? "")) {
      throw new Error(`Malformed Stephanus marker row: ${line}`);
    }

    const startChar = Number(columns[1]);
    const endChar = Number(columns[2]);
    if (!Number.isInteger(startChar) || !Number.isInteger(endChar) || startChar < 0 || endChar < startChar) {
      throw new Error(`Malformed Stephanus marker offsets: ${line}`);
    }

    return {
      marker: columns[0]!,
      startChar,
      endChar,
    };
  });

  if (markers.length !== Number(markerCount)) {
    throw new Error(`Stephanus index marker count mismatch: expected ${markerCount}, found ${markers.length}`);
  }

  return {
    dialogue,
    sourcePath,
    sourceSha256,
    markers,
  };
}

export function writeStephanusIndex(dialogue: string) {
  const index = buildStephanusIndex(dialogue);
  const path = stephanusIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatStephanusIndexToon(index), "utf8");
  return { path, markerCount: index.markers.length };
}

export function writeEnglishStephanusIndex(dialogue: string) {
  const index = buildEnglishStephanusIndex(dialogue);
  const path = englishStephanusIndexPath(dialogue);
  const absolutePath = join(getRepoRoot(), path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, formatStephanusIndexToon(index), "utf8");
  return { path, markerCount: index.markers.length };
}

export function planStephanusSegments(dialogue: string, targetBytes = 30_000): StephanusSegment[] {
  const index = buildStephanusIndex(dialogue);
  const segments: StephanusSegment[] = [];
  let startIndex = 0;

  while (startIndex < index.markers.length) {
    const start = index.markers[startIndex]!;
    let endIndex = startIndex;
    while (
      endIndex + 1 < index.markers.length &&
      index.markers[endIndex + 1]!.endChar - start.startChar <= targetBytes
    ) {
      endIndex += 1;
    }

    const end = index.markers[endIndex]!;
    segments.push({
      dialogue,
      startMarker: start.marker,
      endMarker: end.marker,
      startChar: start.startChar,
      endChar: end.endChar,
      markerCount: endIndex - startIndex + 1,
      sourceBytes: end.endChar - start.startChar,
    });
    startIndex = endIndex + 1;
  }

  return segments;
}

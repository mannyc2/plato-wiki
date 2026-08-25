import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";

const CATALOG_PATH = "audio/reference-sources.json";
const CENSUS_PATH = "audio/english-tei-speaker-census.json";
const CHANNEL_ID = "UCK3uRn8icEYzDy8TY5Jns2g";
const DATE = /^\d{4}-\d{2}-\d{2}$/u;
const DIALOGUE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/u;

export type AudioReferenceSourceIssue = {
  path: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function issue(path: string, message: string): AudioReferenceSourceIssue {
  return { path, message };
}

export function validateReferenceSourceCatalog(
  path: string,
  content: string,
  expectedDialogues?: readonly string[],
): AudioReferenceSourceIssue[] {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (error) {
    return [issue(path, `Malformed JSON: ${error instanceof Error ? error.message : String(error)}`)];
  }
  if (!isRecord(raw)) return [issue(path, "Reference source catalog must be an object.")];
  if (!exactKeys(raw, ["schemaVersion", "status", "discoveredAt", "selectionPolicy", "channel", "dialogues"])) {
    return [issue(path, "Reference source catalog fields do not match schema version 2.")];
  }

  const issues: AudioReferenceSourceIssue[] = [];
  if (raw.schemaVersion !== 2 || raw.status !== "source-pool" || typeof raw.discoveredAt !== "string" || !DATE.test(raw.discoveredAt)) {
    issues.push(issue(path, "schemaVersion, status, or discoveredAt is invalid."));
  }
  if (
    !isRecord(raw.selectionPolicy) ||
    !exactKeys(raw.selectionPolicy, [
      "purpose",
      "preferredEdition",
      "automaticSelection",
      "acceptancePolicy",
      "clipRequirement",
    ]) ||
    raw.selectionPolicy.automaticSelection !== true ||
    raw.selectionPolicy.acceptancePolicy !== "operator-authorized-deterministic-v1" ||
    ![raw.selectionPolicy.purpose, raw.selectionPolicy.preferredEdition, raw.selectionPolicy.clipRequirement].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    )
  ) {
    issues.push(issue(path, "selectionPolicy must authorize only the deterministic v1 acceptance policy and document clip requirements."));
  }
  if (
    !isRecord(raw.channel) ||
    !exactKeys(raw.channel, ["name", "channelId", "channelUrl", "discoveryUrl"]) ||
    raw.channel.name !== "Audiobooks Dimension" ||
    raw.channel.channelId !== CHANNEL_ID ||
    raw.channel.channelUrl !== `https://www.youtube.com/channel/${CHANNEL_ID}` ||
    raw.channel.discoveryUrl !== `https://www.youtube.com/channel/${CHANNEL_ID}/videos`
  ) {
    issues.push(issue(path, "channel must pin the selected Audiobooks Dimension channel exactly."));
  }

  const dialogueIds: string[] = [];
  const videoIds = new Set<string>();
  if (!Array.isArray(raw.dialogues) || raw.dialogues.length === 0) {
    issues.push(issue(path, "dialogues must be a non-empty array."));
  } else {
    for (const [dialogueIndex, row] of raw.dialogues.entries()) {
      const location = `dialogues[${dialogueIndex}]`;
      if (!isRecord(row) || !exactKeys(row, ["dialogue", "videos"]) || typeof row.dialogue !== "string" || !DIALOGUE.test(row.dialogue)) {
        issues.push(issue(path, `${location} is malformed.`));
        continue;
      }
      dialogueIds.push(row.dialogue);
      if (!Array.isArray(row.videos) || row.videos.length === 0) {
        issues.push(issue(path, `${location}.videos must be non-empty.`));
        continue;
      }
      for (const [videoIndex, video] of row.videos.entries()) {
        const videoLocation = `${location}.videos[${videoIndex}]`;
        if (
          !isRecord(video) ||
          !exactKeys(video, ["videoId", "title", "durationSeconds", "url"]) ||
          typeof video.videoId !== "string" ||
          !VIDEO_ID.test(video.videoId) ||
          typeof video.title !== "string" ||
          video.title.trim().length === 0 ||
          !Number.isSafeInteger(video.durationSeconds) ||
          (video.durationSeconds as number) <= 0 ||
          video.url !== `https://www.youtube.com/watch?v=${video.videoId}`
        ) {
          issues.push(issue(path, `${videoLocation} is malformed.`));
          continue;
        }
        if (videoIds.has(video.videoId)) issues.push(issue(path, `${videoLocation} duplicates video ${video.videoId}.`));
        videoIds.add(video.videoId);
      }
    }
  }

  if (new Set(dialogueIds).size !== dialogueIds.length) issues.push(issue(path, "dialogue slugs must be unique."));
  if (dialogueIds.some((dialogue, index) => index > 0 && dialogueIds[index - 1]! >= dialogue)) {
    issues.push(issue(path, "dialogues must be sorted by canonical slug."));
  }
  if (expectedDialogues) {
    const expected = [...new Set(expectedDialogues)].sort();
    const actual = [...new Set(dialogueIds)].sort();
    if (expected.length !== actual.length || expected.some((dialogue, index) => dialogue !== actual[index])) {
      issues.push(issue(path, "dialogue coverage does not exactly match the pinned speaker census."));
    }
  }
  return issues;
}

export function validateAudioReferenceSourceArtifacts() {
  const root = getRepoRoot();
  const path = join(root, CATALOG_PATH);
  if (!existsSync(path)) return [];
  let expectedDialogues: string[] | undefined;
  const censusPath = join(root, CENSUS_PATH);
  if (existsSync(censusPath)) {
    const census = JSON.parse(readFileSync(censusPath, "utf8")) as { dialogues?: Array<{ dialogue?: unknown }> };
    expectedDialogues = (census.dialogues ?? []).flatMap((row) =>
      typeof row.dialogue === "string" ? [row.dialogue] : [],
    );
  }
  return validateReferenceSourceCatalog(CATALOG_PATH, readFileSync(path, "utf8"), expectedDialogues);
}

export function formatAudioReferenceSourceIssues(issues: readonly AudioReferenceSourceIssue[]) {
  return issues.map((entry) => `${entry.path}: ${entry.message}`).join("\n");
}

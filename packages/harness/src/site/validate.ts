import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { inspectMp3File, streamFileSha256 } from "./recordings.js";

const DEFAULT_MAX_HTML_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_TOTAL_BYTES = 150 * 1024 * 1024;
const DEFAULT_MAX_HOMEPAGE_BYTES = 150_000;
const DEFAULT_MAX_INDEX_SHARD_BYTES = 1_000_000;

export type GeneratedSiteValidationOptions = {
  maxHtmlBytes?: number;
  maxTotalBytes?: number;
  maxHomepageBytes?: number;
  maxIndexShardBytes?: number;
  allowedExternalUrls?: ReadonlySet<string>;
  allowedExternalAssetUrls?: ReadonlySet<string>;
  recordings?: readonly GeneratedSiteRecordingExpectation[];
};

export type GeneratedSiteRecordingExpectation = {
  dialogue: string;
  recordingId: string;
  status: "accepted" | "draft";
  audioSha256: string;
  durationSeconds: number;
  assetPath: string;
  chapterTargets: readonly string[];
  chapterIds: readonly string[];
  chapterStartFrames: readonly number[];
  chapterStartSeconds: readonly number[];
};

export type GeneratedSiteValidationSummary = {
  htmlFiles: number;
  links: number;
  maxHtmlBytes: number;
  totalBytes: number;
  homepageBytes: number;
  maxIdIndexShardBytes: number;
  maxSearchIndexShardBytes: number;
  coreTotalBytes: number;
  recordingAssets: number;
  recordingBytes: number;
  recordingHashMismatches: number;
  duplicateIds: number;
  brokenPaths: number;
  brokenFragments: number;
  externalUrls: number;
  assetReferences: number;
  externalAssetUrls: number;
};

function listFiles(root: string, dir = root): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = resolve(dir, entry.name);
      return entry.isDirectory() ? listFiles(root, path) : entry.isFile() ? [path] : [];
    })
    .sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
}

function decodeGeneratedAttribute(value: string) {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  return value.replace(/&(?:amp|lt|gt|quot|#39);/gu, (entity) => entities[entity] ?? entity);
}

function attributeValues(content: string, attribute: string) {
  const pattern = new RegExp(`(?:^|\\s)${attribute}="([^"]*)"`, "gu");
  return [...content.matchAll(pattern)].map((match) => decodeGeneratedAttribute(match[1] ?? ""));
}

function elementBlocks(content: string, tag: string) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "giu");
  return [...content.matchAll(pattern)].map((match) => match[0] ?? "");
}

function openingTags(content: string, tag = "[a-z][a-z0-9-]*") {
  const pattern = new RegExp(`<${tag}\\b[^>]*>`, "giu");
  return [...content.matchAll(pattern)].map((match) => match[0] ?? "");
}

function hasAttribute(tag: string, attribute: string) {
  const pattern = new RegExp(`\\s${attribute}(?:\\s*=|\\s|/?>)`, "iu");
  return pattern.test(tag);
}

function attributeValue(tag: string, attribute: string) {
  return attributeValues(tag, attribute)[0];
}

function insideRoot(root: string, target: string) {
  const path = relative(root, target);
  return path === "" || (!isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`));
}

function splitHref(href: string) {
  const hashIndex = href.indexOf("#");
  return hashIndex === -1
    ? { path: href, fragment: "" }
    : { path: href.slice(0, hashIndex), fragment: href.slice(hashIndex + 1) };
}

function displayPath(root: string, path: string) {
  return relative(root, path).split(sep).join("/") || ".";
}

export function validateGeneratedSite(
  outDir: string,
  options: GeneratedSiteValidationOptions = {},
): GeneratedSiteValidationSummary {
  const root = resolve(outDir);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`Generated site output does not exist: ${outDir}`);
  }

  const maxAllowedHtmlBytes = options.maxHtmlBytes ?? DEFAULT_MAX_HTML_BYTES;
  const maxAllowedTotalBytes = options.maxTotalBytes ?? DEFAULT_MAX_TOTAL_BYTES;
  const maxAllowedHomepageBytes = options.maxHomepageBytes ?? DEFAULT_MAX_HOMEPAGE_BYTES;
  const maxAllowedIndexShardBytes = options.maxIndexShardBytes ?? DEFAULT_MAX_INDEX_SHARD_BYTES;
  const allowedExternalUrls = options.allowedExternalUrls ?? new Set<string>();
  const allowedExternalAssetUrls = options.allowedExternalAssetUrls ?? new Set<string>();
  const expectedRecordings = options.recordings ?? [];
  const files = listFiles(root);
  const htmlFiles = files.filter((path) => path.endsWith(".html"));
  const htmlByPath = new Map(htmlFiles.map((path) => [path, readFileSync(path, "utf8")]));
  const idsByPath = new Map<string, Set<string>>();
  const diagnostics: string[] = [];
  let links = 0;
  let maxHtmlBytes = 0;
  let totalBytes = 0;
  let homepageBytes = 0;
  let maxIdIndexShardBytes = 0;
  let maxSearchIndexShardBytes = 0;
  let recordingAssets = 0;
  let recordingBytes = 0;
  let recordingHashMismatches = 0;
  let duplicateIds = 0;
  let brokenPaths = 0;
  let brokenFragments = 0;
  let externalUrls = 0;
  let assetReferences = 0;
  let externalAssetUrls = 0;

  for (const file of files) {
    const bytes = statSync(file).size;
    const generatedPath = displayPath(root, file);
    totalBytes += bytes;
    if (/^assets\/recordings\/[a-z0-9-]+\/complete\.mp3$/u.test(generatedPath)) {
      recordingAssets += 1;
      recordingBytes += bytes;
    }
    if (generatedPath === "index.html") homepageBytes = bytes;
    if (/^assets\/index\/ids-[^/]+\.json$/u.test(generatedPath)) {
      maxIdIndexShardBytes = Math.max(maxIdIndexShardBytes, bytes);
      if (bytes >= maxAllowedIndexShardBytes) {
        diagnostics.push(`${generatedPath}: ID-index shard size ${bytes} bytes must be below ${maxAllowedIndexShardBytes} bytes`);
      }
    }
    if (/^assets\/search\/search-[^/]+\.json$/u.test(generatedPath)) {
      maxSearchIndexShardBytes = Math.max(maxSearchIndexShardBytes, bytes);
      if (bytes >= maxAllowedIndexShardBytes) {
        diagnostics.push(`${generatedPath}: search-index shard size ${bytes} bytes must be below ${maxAllowedIndexShardBytes} bytes`);
      }
    }
  }

  if (homepageBytes >= maxAllowedHomepageBytes) {
    diagnostics.push(`index.html: homepage size ${homepageBytes} bytes must be below ${maxAllowedHomepageBytes} bytes`);
  }

  for (const path of htmlFiles) {
    const content = htmlByPath.get(path) ?? "";
    const page = displayPath(root, path);
    const bytes = Buffer.byteLength(content);
    maxHtmlBytes = Math.max(maxHtmlBytes, bytes);
    if (bytes > maxAllowedHtmlBytes) {
      diagnostics.push(`${page}: HTML size ${bytes} bytes exceeds ${maxAllowedHtmlBytes} bytes`);
    }

    const ids = new Set<string>();
    for (const id of attributeValues(content, "id")) {
      if (ids.has(id)) {
        duplicateIds += 1;
        diagnostics.push(`${page}: duplicate id #${id}`);
      }
      ids.add(id);
    }
    idsByPath.set(path, ids);
  }

  for (const expectation of expectedRecordings) {
    const requiredAssetPath = `assets/recordings/${expectation.dialogue}/complete.mp3`;
    if (expectation.assetPath !== requiredAssetPath) {
      diagnostics.push(
        `${expectation.assetPath}: recording asset path for ${expectation.dialogue} must be ${requiredAssetPath}`,
      );
      continue;
    }
    const asset = resolve(root, expectation.assetPath);
    if (!insideRoot(root, asset)) {
      brokenPaths += 1;
      diagnostics.push(`${expectation.assetPath}: recording asset escapes output root`);
      continue;
    }
    if (!existsSync(asset) || !statSync(asset).isFile()) {
      brokenPaths += 1;
      diagnostics.push(`${expectation.assetPath}: missing recording asset for ${expectation.recordingId}`);
    } else {
      const actualSha256 = streamFileSha256(asset);
      if (actualSha256 !== expectation.audioSha256) {
        recordingHashMismatches += 1;
        diagnostics.push(
          `${expectation.assetPath}: recording hash mismatch for ${expectation.recordingId}; expected ${expectation.audioSha256}; found ${actualSha256}`,
        );
      } else {
        try {
          inspectMp3File(asset, expectation.durationSeconds);
        } catch (error) {
          diagnostics.push(
            `${expectation.assetPath}: invalid recording audio for ${expectation.recordingId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    const readingPath = resolve(root, `dialogues/${expectation.dialogue}/reading.html`);
    const reading = htmlByPath.get(readingPath);
    if (reading === undefined) {
      brokenPaths += 1;
      diagnostics.push(
        `dialogues/${expectation.dialogue}/reading.html: missing reading page for ${expectation.recordingId}`,
      );
      continue;
    }
    const page = `dialogues/${expectation.dialogue}/reading.html`;
    const expectedSource = relative(dirname(readingPath), asset).split(sep).join("/");
    const players = elementBlocks(reading, "section").filter((block) =>
      hasAttribute(openingTags(block, "section")[0] ?? "", "data-recording-player"),
    );
    if (players.length !== 1) {
      diagnostics.push(`${page}: expected exactly one recording player section; found ${players.length}`);
      continue;
    }
    const player = players[0] ?? "";
    const playerTag = openingTags(player, "section")[0] ?? "";
    if (attributeValue(playerTag, "data-recording-id") !== expectation.recordingId) {
      diagnostics.push(`${page}: recording player is missing recording id ${expectation.recordingId}`);
    }
    if (attributeValue(playerTag, "data-recording-acceptance-status") !== expectation.status) {
      diagnostics.push(`${page}: recording player is missing acceptance status ${expectation.status}`);
    }
    if (attributeValue(playerTag, "data-audio-sha256") !== expectation.audioSha256) {
      diagnostics.push(`${page}: recording player is missing audio hash ${expectation.audioSha256}`);
    }
    if (expectation.status === "draft") {
      if (
        !player.includes("Review candidate") ||
        !player.includes("has not passed final production acceptance") ||
        /Production recording|Published/u.test(player)
      ) {
        diagnostics.push(`${page}: draft recording player must be truthfully labeled as a non-accepted Review candidate`);
      }
    } else if (!player.includes("Production recording")) {
      diagnostics.push(`${page}: accepted recording player must retain the production recording label`);
    }

    const statuses = openingTags(player).filter((tag) => hasAttribute(tag, "data-recording-status"));
    const statusTag = statuses[0] ?? "";
    const statusId = attributeValue(statusTag, "id");
    if (
      statuses.length !== 1 ||
      !statusId ||
      attributeValue(statusTag, "role") !== "status" ||
      attributeValue(statusTag, "aria-live") !== "polite"
    ) {
      diagnostics.push(`${page}: recording player must contain one polite live status with an id`);
    }

    const audioBlocks = elementBlocks(player, "audio");
    const audio = audioBlocks[0] ?? "";
    const audioTag = openingTags(audio, "audio")[0] ?? "";
    const audioId = attributeValue(audioTag, "id");
    if (
      audioBlocks.length !== 1 ||
      !hasAttribute(audioTag, "data-recording-audio") ||
      !hasAttribute(audioTag, "controls") ||
      attributeValue(audioTag, "preload") !== "metadata" ||
      !audioId
    ) {
      diagnostics.push(`${page}: recording player must contain one native audio control with id, controls, and preload=metadata`);
    }
    if (statusId && attributeValue(audioTag, "aria-describedby") !== statusId) {
      diagnostics.push(`${page}: recording audio control must be described by #${statusId}`);
    }
    const sources = openingTags(audio, "source");
    if (
      sources.length !== 1 ||
      attributeValue(sources[0] ?? "", "src") !== expectedSource ||
      attributeValue(sources[0] ?? "", "type") !== "audio/mpeg"
    ) {
      diagnostics.push(`${page}: recording audio must contain one audio/mpeg source ${expectedSource}`);
    }

    const chapterButtons = elementBlocks(player, "button").filter((block) =>
      hasAttribute(openingTags(block, "button")[0] ?? "", "data-recording-chapter"),
    );
    const chapterGroups = openingTags(player).filter(
      (tag) => attributeValue(tag, "role") === "group" && attributeValue(tag, "aria-label") === "Recording chapters",
    );
    if (chapterGroups.length !== 1) {
      diagnostics.push(`${page}: recording chapters must have one accessible Recording chapters group`);
    }
    const renderedTargets = chapterButtons.map(
      (block) => attributeValue(openingTags(block, "button")[0] ?? "", "data-chapter-target") ?? "",
    );
    if (
      chapterButtons.length !== expectation.chapterTargets.length ||
      expectation.chapterIds.length !== expectation.chapterTargets.length ||
      expectation.chapterStartFrames.length !== expectation.chapterTargets.length ||
      expectation.chapterStartSeconds.length !== expectation.chapterTargets.length
    ) {
      diagnostics.push(
        `${page}: expected ${expectation.chapterTargets.length} recording chapter controls; found ${chapterButtons.length}`,
      );
    }
    for (const [index, block] of chapterButtons.entries()) {
      const tag = openingTags(block, "button")[0] ?? "";
      const frame = Number(attributeValue(tag, "data-chapter-frame"));
      const seconds = Number(attributeValue(tag, "data-chapter-seconds"));
      if (
        attributeValue(tag, "type") !== "button" ||
        attributeValue(tag, "data-chapter-id") !== expectation.chapterIds[index] ||
        !Number.isSafeInteger(frame) ||
        frame < 0 ||
        frame !== expectation.chapterStartFrames[index] ||
        !Number.isFinite(seconds) ||
        seconds < 0 ||
        seconds >= expectation.durationSeconds ||
        seconds !== expectation.chapterStartSeconds[index] ||
        renderedTargets[index] !== expectation.chapterTargets[index] ||
        !audioId ||
        attributeValue(tag, "aria-controls") !== audioId
      ) {
        diagnostics.push(`${page}: recording chapter control ${index + 1} has invalid seek or audio-control metadata`);
      }
    }
    if (attributeValues(reading, "data-chapter-target").length !== renderedTargets.length) {
      diagnostics.push(`${page}: recording chapter controls must be contained inside the recording player`);
    }
    for (const target of expectation.chapterTargets) {
      if (!renderedTargets.includes(target)) {
        brokenFragments += 1;
        diagnostics.push(
          `${page}: missing recording chapter target #${target}`,
        );
      }
    }
    for (const target of renderedTargets) {
      if (!expectation.chapterTargets.includes(target)) {
        diagnostics.push(
          `${page}: unexpected recording chapter target #${target}`,
        );
      }
    }

  }

  for (const path of htmlFiles) {
    const content = htmlByPath.get(path) ?? "";
    const page = displayPath(root, path);
    const chapterTags = openingTags(content).filter((tag) => hasAttribute(tag, "data-chapter-target"));
    for (const tag of chapterTags) {
      const target = attributeValue(tag, "data-chapter-target") ?? "";
      const href = attributeValue(tag, "data-chapter-href");
      if (!href) {
        if (!(idsByPath.get(path)?.has(target) ?? false)) {
          brokenFragments += 1;
          diagnostics.push(`${page}: missing chapter target #${target}`);
        }
        continue;
      }
      const parsed = splitHref(href);
      const targetPath = parsed.path ? resolve(dirname(path), parsed.path) : path;
      if (!insideRoot(root, targetPath) || !existsSync(targetPath) || !statSync(targetPath).isFile()) {
        brokenPaths += 1;
        diagnostics.push(`${page}: missing chapter target path ${parsed.path || page}`);
        continue;
      }
      let fragment: string;
      try {
        fragment = decodeURIComponent(parsed.fragment);
      } catch {
        brokenFragments += 1;
        diagnostics.push(`${page}: invalid chapter fragment #${parsed.fragment}`);
        continue;
      }
      if (!fragment || fragment !== target || !(idsByPath.get(targetPath)?.has(fragment) ?? false)) {
        brokenFragments += 1;
        diagnostics.push(`${page}: missing chapter target #${target} in ${displayPath(root, targetPath)}`);
      }
    }
    for (const href of attributeValues(content, "href")) {
      links += 1;
      if (/^https?:\/\//u.test(href)) {
        externalUrls += 1;
        if (!allowedExternalUrls.has(href)) diagnostics.push(`${page}: external URL ${href}`);
        continue;
      }
      if (/^[a-z][a-z0-9+.-]*:/iu.test(href)) {
        externalUrls += 1;
        diagnostics.push(`${page}: external URL ${href}`);
        continue;
      }

      const parsed = splitHref(href);
      const target = parsed.path ? resolve(dirname(path), parsed.path) : path;
      if (!insideRoot(root, target)) {
        brokenPaths += 1;
        diagnostics.push(`${page}: target escapes output root: ${href}`);
        continue;
      }
      if (!existsSync(target) || !statSync(target).isFile()) {
        brokenPaths += 1;
        diagnostics.push(`${page}: missing target ${parsed.path || page}`);
        continue;
      }
      if (!parsed.fragment) continue;
      // `#axis=<axis-key>` is a JS-consumed preselect for the record map's ontology-axis
      // filter (the dialogue-pages v3.3 rollout), not an element id — the static render is unaffected
      // without scripts, so it needs no matching target id.
      if (parsed.fragment.startsWith("axis=")) continue;

      let fragment: string;
      try {
        fragment = decodeURIComponent(parsed.fragment);
      } catch {
        brokenFragments += 1;
        diagnostics.push(`${page}: invalid fragment #${parsed.fragment}`);
        continue;
      }
      const targetContent = htmlByPath.get(target);
      const targetIds = idsByPath.get(target) ?? (targetContent ? new Set(attributeValues(targetContent, "id")) : undefined);
      if (!targetIds?.has(fragment)) {
        brokenFragments += 1;
        diagnostics.push(`${page}: missing fragment #${fragment} in ${displayPath(root, target)}`);
      }
    }

    for (const src of attributeValues(content, "src")) {
      assetReferences += 1;
      if (/^https?:\/\//u.test(src)) {
        externalAssetUrls += 1;
        if (!allowedExternalAssetUrls.has(src)) diagnostics.push(`${page}: external asset URL ${src}`);
        continue;
      }
      if (/^[a-z][a-z0-9+.-]*:/iu.test(src)) {
        externalAssetUrls += 1;
        diagnostics.push(`${page}: external asset URL ${src}`);
        continue;
      }
      const target = resolve(dirname(path), src);
      if (!insideRoot(root, target)) {
        brokenPaths += 1;
        diagnostics.push(`${page}: asset target escapes output root: ${src}`);
        continue;
      }
      if (!existsSync(target) || !statSync(target).isFile()) {
        brokenPaths += 1;
        diagnostics.push(`${page}: missing asset target ${src}`);
      }
    }
  }

  const coreTotalBytes = totalBytes - recordingBytes;
  if (coreTotalBytes > maxAllowedTotalBytes) {
    diagnostics.push(`core total output size ${coreTotalBytes} bytes exceeds ${maxAllowedTotalBytes} bytes`);
  }
  if (diagnostics.length > 0) {
    throw new Error(`Generated site validation failed:\n${diagnostics.sort((a, b) => a.localeCompare(b)).join("\n")}`);
  }

  return {
    htmlFiles: htmlFiles.length,
    links,
    maxHtmlBytes,
    totalBytes,
    homepageBytes,
    maxIdIndexShardBytes,
    maxSearchIndexShardBytes,
    coreTotalBytes,
    recordingAssets,
    recordingBytes,
    recordingHashMismatches,
    duplicateIds,
    brokenPaths,
    brokenFragments,
    externalUrls,
    assetReferences,
    externalAssetUrls,
  };
}

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_REVISION = /^[0-9a-f]{40}$/u;

type PublicManifestEntry = { path: string; sha256: string };

export type SiteReleaseMarker = {
  schemaVersion: 1;
  artifactKind: "plato-site-release";
  releaseVersion: string;
  sourceRevision: string;
  sourceCommittedAt: string;
  publicManifestSha256: string;
  publicInventorySha256: string;
};

function sha256(content: string | Uint8Array) {
  return createHash("sha256").update(content).digest("hex");
}

function parsePublicManifest(content: string) {
  const value = JSON.parse(content) as Record<string, unknown>;
  if (typeof value.releaseVersion !== "string" || value.releaseVersion.length === 0) {
    throw new Error("public export manifest requires releaseVersion");
  }
  if (!Array.isArray(value.files) || value.files.length === 0) {
    throw new Error("public export manifest requires a non-empty files array");
  }
  const files = value.files.map((entry, index): PublicManifestEntry => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new Error(`public export manifest files[${index}] must be an object`);
    }
    const record = entry as Record<string, unknown>;
    if (typeof record.path !== "string" || !record.path || typeof record.sha256 !== "string" || !SHA256.test(record.sha256)) {
      throw new Error(`public export manifest files[${index}] must contain a path and lowercase SHA-256`);
    }
    return { path: record.path, sha256: record.sha256 };
  });
  const sorted = [...files].sort((left, right) => left.path === right.path ? 0 : left.path < right.path ? -1 : 1);
  if (files.some((entry, index) => entry.path !== sorted[index]?.path)) {
    throw new Error("public export manifest files must be sorted by path");
  }
  if (files.some((entry, index) => index > 0 && entry.path === files[index - 1]?.path)) {
    throw new Error("public export manifest files must not contain duplicate paths");
  }
  return { releaseVersion: value.releaseVersion, files };
}

export function parseSiteReleaseMarker(value: unknown): SiteReleaseMarker {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("site release marker must be an object");
  }
  const marker = value as Record<string, unknown>;
  if (marker.schemaVersion !== 1 || marker.artifactKind !== "plato-site-release") {
    throw new Error("site release marker has an unsupported identity");
  }
  if (typeof marker.releaseVersion !== "string" || marker.releaseVersion.length === 0) {
    throw new Error("site release marker requires releaseVersion");
  }
  if (typeof marker.sourceRevision !== "string" || !GIT_REVISION.test(marker.sourceRevision)) {
    throw new Error("site release marker requires a lowercase 40-character sourceRevision");
  }
  if (typeof marker.sourceCommittedAt !== "string" || Number.isNaN(Date.parse(marker.sourceCommittedAt))) {
    throw new Error("site release marker requires a valid sourceCommittedAt timestamp");
  }
  for (const field of ["publicManifestSha256", "publicInventorySha256"] as const) {
    if (typeof marker[field] !== "string" || !SHA256.test(marker[field])) {
      throw new Error(`site release marker requires ${field}`);
    }
  }
  return marker as SiteReleaseMarker;
}

export function buildSiteReleaseMarker({
  exportManifestPath,
  sourceRevision,
  sourceCommittedAt,
}: {
  exportManifestPath: string;
  sourceRevision: string;
  sourceCommittedAt: string;
}): SiteReleaseMarker {
  const content = readFileSync(exportManifestPath, "utf8");
  const manifest = parsePublicManifest(content);
  return parseSiteReleaseMarker({
    schemaVersion: 1,
    artifactKind: "plato-site-release",
    releaseVersion: manifest.releaseVersion,
    sourceRevision,
    sourceCommittedAt,
    publicManifestSha256: sha256(content),
    publicInventorySha256: sha256(`${manifest.files.map((entry) => `${entry.path}\0${entry.sha256}`).join("\n")}\n`),
  });
}

export function writeSiteReleaseMarker({
  siteOutDir,
  exportManifestPath,
  sourceRevision,
  sourceCommittedAt,
}: {
  siteOutDir: string;
  exportManifestPath: string;
  sourceRevision: string;
  sourceCommittedAt: string;
}) {
  const siteManifestPath = join(siteOutDir, "manifest.txt");
  if (!existsSync(siteManifestPath)) throw new Error("generated site is missing manifest.txt");
  const marker = buildSiteReleaseMarker({ exportManifestPath, sourceRevision, sourceCommittedAt });
  writeFileSync(join(siteOutDir, "release.json"), `${JSON.stringify(marker, null, 2)}\n`, "utf8");
  const siteManifest = readFileSync(siteManifestPath, "utf8");
  if (siteManifest.includes("release.json")) throw new Error("generated site manifest already names release.json");
  writeFileSync(siteManifestPath, `${siteManifest}release.json\tsite/release.json\n`, "utf8");
  return marker;
}

import { parseSiteReleaseMarker, type SiteReleaseMarker } from "./site-release.js";
import { setTimeout as delay } from "node:timers/promises";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const REQUIRED_RESOURCES = [
  { path: "", contains: "<main" },
  { path: "assets/site.css", contains: ":root" },
  { path: "assets/site.js", contains: "data-corpus-search" },
  { path: "search.html", contains: "data-corpus-search" },
  { path: "assets/search/manifest.json", contains: "schemaVersion" },
  { path: "readings/index.html", contains: "Readings" },
  { path: "license.html", contains: "License" },
  { path: "dialogues/meno/reading.html#comm_meno_0001", contains: 'id="comm_meno_0001"' },
] as const;

function normalizeBaseUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("site base URL must use HTTP or HTTPS");
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

async function fetchText(fetchImpl: FetchLike, url: URL) {
  const response = await fetchImpl(url, { redirect: "follow", cache: "no-store" });
  if (!response.ok) throw new Error(`${url.pathname}: HTTP ${response.status}`);
  return response.text();
}

async function smokeOnce({
  baseUrl,
  expectedRevision,
  expectedManifestSha256,
  fetchImpl,
}: {
  baseUrl: URL;
  expectedRevision: string;
  expectedManifestSha256: string;
  fetchImpl: FetchLike;
}): Promise<SiteReleaseMarker> {
  const markerText = await fetchText(fetchImpl, new URL("release.json", baseUrl));
  const marker = parseSiteReleaseMarker(JSON.parse(markerText));
  if (marker.sourceRevision !== expectedRevision) {
    throw new Error(`release marker revision mismatch: expected ${expectedRevision}; found ${marker.sourceRevision}`);
  }
  if (marker.publicManifestSha256 !== expectedManifestSha256) {
    throw new Error(
      `release marker manifest mismatch: expected ${expectedManifestSha256}; found ${marker.publicManifestSha256}`,
    );
  }
  for (const resource of REQUIRED_RESOURCES) {
    const target = new URL(resource.path, baseUrl);
    const content = await fetchText(fetchImpl, target);
    if (!content.includes(resource.contains)) throw new Error(`${target.pathname}: missing expected generated-site content`);
    if (content.includes("pages.dev")) throw new Error(`${target.pathname}: contains the retired-host domain`);
  }
  return marker;
}

export async function smokeSite({
  baseUrl,
  expectedRevision,
  expectedManifestSha256,
  attempts = 8,
  delayMs = 2_000,
  fetchImpl = fetch,
}: {
  baseUrl: string;
  expectedRevision: string;
  expectedManifestSha256: string;
  attempts?: number;
  delayMs?: number;
  fetchImpl?: FetchLike;
}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await smokeOnce({ baseUrl: normalizedBaseUrl, expectedRevision, expectedManifestSha256, fetchImpl });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(delayMs);
    }
  }
  throw new Error(`site smoke failed after ${attempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

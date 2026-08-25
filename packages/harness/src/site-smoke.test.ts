import { describe, expect, it } from "bun:test";
import { smokeSite } from "./site-smoke.js";

const revision = "a".repeat(40);
const manifestSha = "b".repeat(64);
const inventorySha = "c".repeat(64);

function responseFor(url: URL) {
  if (url.pathname.endsWith("/release.json")) {
    return JSON.stringify({
      schemaVersion: 1,
      artifactKind: "plato-site-release",
      releaseVersion: "2.0.0",
      sourceRevision: revision,
      sourceCommittedAt: "2026-08-25T12:00:00Z",
      publicManifestSha256: manifestSha,
      publicInventorySha256: inventorySha,
    });
  }
  if (url.pathname.endsWith("/assets/site.css")) return ":root {}";
  if (url.pathname.endsWith("/assets/site.js")) return "data-corpus-search";
  if (url.pathname.endsWith("/search.html")) return "data-corpus-search";
  if (url.pathname.endsWith("/assets/search/manifest.json")) return '{"version":1,"shards":[]}';
  if (url.pathname.endsWith("/readings/index.html")) return "Readings";
  if (url.pathname.endsWith("/license.html")) return "License";
  if (url.pathname.endsWith("/dialogues/meno/reading.html")) return '<main id="comm_meno_0001">';
  return "<main>Home</main>";
}

describe("site smoke", () => {
  it("checks the release marker, core assets, and a stable fragment", async () => {
    const requested: string[] = [];
    const marker = await smokeSite({
      baseUrl: "https://example.test/subpath",
      expectedRevision: revision,
      expectedManifestSha256: manifestSha,
      attempts: 1,
      fetchImpl: async (input) => {
        const url = new URL(String(input));
        requested.push(url.pathname);
        return new Response(responseFor(url));
      },
    });
    expect(marker.sourceRevision).toBe(revision);
    expect(requested).toContain("/subpath/dialogues/meno/reading.html");
  });

  it("fails closed when the deployment marker identifies another build", async () => {
    expect(
      smokeSite({
        baseUrl: "https://example.test/",
        expectedRevision: "d".repeat(40),
        expectedManifestSha256: manifestSha,
        attempts: 1,
        fetchImpl: async (input) => new Response(responseFor(new URL(String(input)))),
      }),
    ).rejects.toThrow("revision mismatch");
  });
});

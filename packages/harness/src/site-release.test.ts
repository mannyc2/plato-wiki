import { createHash } from "node:crypto";
import { describe, expect, it } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSiteReleaseMarker, parseSiteReleaseMarker, writeSiteReleaseMarker } from "./site-release.js";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "site-release-"));
  const manifestPath = join(root, "public-manifest.json");
  const manifest = `${JSON.stringify({
    schemaVersion: 1,
    releaseVersion: "2.0.0",
    files: [
      { path: ".github/workflows/ci.yml", sha256: digest("workflow") },
      { path: "README.md", sha256: digest("readme") },
      { path: "wiki/index.md", sha256: digest("wiki") },
    ],
  }, null, 2)}\n`;
  writeFileSync(manifestPath, manifest);
  return { root, manifestPath, manifest };
}

describe("site release marker", () => {
  it("binds a site artifact to one public source revision and inventory", () => {
    const { manifestPath, manifest } = fixture();
    const marker = buildSiteReleaseMarker({
      exportManifestPath: manifestPath,
      sourceRevision: "a".repeat(40),
      sourceCommittedAt: "2026-08-25T12:34:56Z",
    });
    expect(marker).toEqual({
      schemaVersion: 1,
      artifactKind: "plato-site-release",
      releaseVersion: "2.0.0",
      sourceRevision: "a".repeat(40),
      sourceCommittedAt: "2026-08-25T12:34:56Z",
      publicManifestSha256: digest(manifest),
      publicInventorySha256: digest(
        `.github/workflows/ci.yml\0${digest("workflow")}\nREADME.md\0${digest("readme")}\nwiki/index.md\0${digest("wiki")}\n`,
      ),
    });
  });

  it("writes release.json and records it in the generated-site manifest", () => {
    const { root, manifestPath } = fixture();
    const siteOutDir = join(root, "site");
    mkdirSync(siteOutDir);
    writeFileSync(join(siteOutDir, "manifest.txt"), "index.html\tsite/index.html\n");
    const marker = writeSiteReleaseMarker({
      siteOutDir,
      exportManifestPath: manifestPath,
      sourceRevision: "b".repeat(40),
      sourceCommittedAt: "2026-08-25T08:34:56-04:00",
    });
    expect(parseSiteReleaseMarker(JSON.parse(readFileSync(join(siteOutDir, "release.json"), "utf8")))).toEqual(marker);
    expect(readFileSync(join(siteOutDir, "manifest.txt"), "utf8")).toBe(
      "index.html\tsite/index.html\nrelease.json\tsite/release.json\n",
    );
  });

  it("rejects a marker that cannot identify an exact commit", () => {
    expect(() =>
      parseSiteReleaseMarker({
        schemaVersion: 1,
        artifactKind: "plato-site-release",
        releaseVersion: "2.0.0",
        sourceRevision: "main",
        sourceCommittedAt: "unknown",
        publicManifestSha256: digest("manifest"),
        publicInventorySha256: digest("inventory"),
      }),
    ).toThrow("sourceRevision");
  });
});

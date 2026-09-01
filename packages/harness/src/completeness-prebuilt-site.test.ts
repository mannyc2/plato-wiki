import { describe, expect, it } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditPrebuiltStaticSite } from "./completeness.js";
import { setRepoRootForTesting } from "./paths.js";

function withGeneratedSite(run: (repoRoot: string, siteDirectory: string) => void) {
  const repoRoot = mkdtempSync(join(tmpdir(), "completeness-prebuilt-site-"));
  const siteDirectory = join(repoRoot, "generated-site");
  mkdirSync(join(siteDirectory, "nested"), { recursive: true });
  writeFileSync(
    join(siteDirectory, "index.html"),
    '<main id="home"><a href="nested/page.html#target">Open</a></main>',
    "utf8",
  );
  writeFileSync(join(siteDirectory, "nested/page.html"), '<article id="target">Target</article>', "utf8");
  writeFileSync(join(siteDirectory, "asset.txt"), "asset", "utf8");
  writeFileSync(
    join(siteDirectory, "manifest.txt"),
    [
      "index.html\tsite/index.html",
      "nested/page.html\tsite/nested/page.html",
      "asset.txt\tsite/asset.txt",
      "",
    ].join("\n"),
    "utf8",
  );
  const restore = setRepoRootForTesting(repoRoot);
  try {
    run(repoRoot, siteDirectory);
  } finally {
    restore();
    rmSync(repoRoot, { recursive: true, force: true });
  }
}

describe("prebuilt static-site completeness evidence", () => {
  it("derives the same validity counters and exact page count from the generated tree", () => {
    withGeneratedSite((_repoRoot, siteDirectory) => {
      expect(auditPrebuiltStaticSite(siteDirectory)).toEqual({
        valid: true,
        pages: ["index.html", "nested/page.html", "asset.txt", "manifest.txt"],
        evidence: "4 pages; broken_paths=0; broken_fragments=0; duplicate_ids=0",
      });
    });
  });

  it("rejects output-tree tampering instead of trusting the manifest count", () => {
    withGeneratedSite((_repoRoot, siteDirectory) => {
      writeFileSync(
        join(siteDirectory, "manifest.txt"),
        readFileSync(join(siteDirectory, "manifest.txt"), "utf8").replace("asset.txt\tsite/asset.txt\n", ""),
        "utf8",
      );
      expect(() => auditPrebuiltStaticSite(siteDirectory)).toThrow(
        /does not exactly inventory the output tree.*extra=asset\.txt/u,
      );
    });
  });

  it("rejects structural page tampering through the canonical site validator", () => {
    withGeneratedSite((_repoRoot, siteDirectory) => {
      writeFileSync(join(siteDirectory, "index.html"), '<a href="missing.html">Missing</a>', "utf8");
      expect(() => auditPrebuiltStaticSite(siteDirectory)).toThrow(
        /Generated site validation failed:.*missing target missing\.html/su,
      );
    });
  });

  it("rejects duplicate manifest membership instead of inflating the page count", () => {
    withGeneratedSite((_repoRoot, siteDirectory) => {
      writeFileSync(
        join(siteDirectory, "manifest.txt"),
        `${readFileSync(join(siteDirectory, "manifest.txt"), "utf8")}asset.txt\tsite/asset.txt\n`,
        "utf8",
      );
      expect(() => auditPrebuiltStaticSite(siteDirectory)).toThrow(/unsafe or duplicate path: asset\.txt/u);
    });
  });
});

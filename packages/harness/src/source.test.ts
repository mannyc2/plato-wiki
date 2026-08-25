import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import { resolveSourceSpan } from "./source.js";

/**
 * Span resolution caches the source text and its marker table, because callers
 * resolve one span per Stephanus marker and the uncached path re-read and
 * re-hashed the whole dialogue every time. A cache that outlived an edit would
 * hand back the wrong Greek for a correct span, so the invalidation is the part
 * worth testing.
 */
describe("resolved source caching", () => {
  function fixture(body: (dialogue: string, write: (greek: string) => void) => void) {
    const repoRoot = mkdtempSync(join(tmpdir(), "source-cache-"));
    mkdirSync(join(repoRoot, "raw/plato/greek"), { recursive: true });
    const restore = setRepoRootForTesting(repoRoot);
    try {
      body("fixture", (greek) => writeFileSync(join(repoRoot, "raw/plato/greek/fixture.txt"), greek, "utf8"));
    } finally {
      restore();
      rmSync(repoRoot, { recursive: true, force: true });
    }
  }

  it("re-reads a rewritten source even when its length is unchanged", () => {
    fixture((dialogue, write) => {
      write("{1a} ἀλφα βητα\n{1b} γαμμα\n");
      expect(resolveSourceSpan(dialogue, "1a").text).toContain("ἀλφα βητα");

      // Same byte length, different text: only the mtime distinguishes them.
      write("{1a} δελτα ζητα\n{1b} γαμμα\n");
      expect(resolveSourceSpan(dialogue, "1a").text).toContain("δελτα ζητα");
      expect(resolveSourceSpan(dialogue, "1a").text).not.toContain("ἀλφα βητα");
    });
  });

  it("keeps repeated resolutions of one span byte-identical", () => {
    fixture((dialogue, write) => {
      write("{1a} ἀλφα\n{1b} βητα\n{1c} γαμμα\n");
      const first = resolveSourceSpan(dialogue, "1a-1b");
      const second = resolveSourceSpan(dialogue, "1a-1b");
      expect(second).toEqual(first);
      expect(second.source_ref.text_sha256).toBe(first.source_ref.text_sha256);
    });
  });

  it("resolves every marker of a dialogue to its own text", () => {
    fixture((dialogue, write) => {
      write("{1a} ἀλφα\n{1b} βητα\n{1c} γαμμα\n");
      expect(resolveSourceSpan(dialogue, "1a").text).toContain("ἀλφα");
      expect(resolveSourceSpan(dialogue, "1b").text).toContain("βητα");
      expect(resolveSourceSpan(dialogue, "1c").text).toContain("γαμμα");
      expect(resolveSourceSpan(dialogue, "1b").text).not.toContain("γαμμα");
    });
  });
});

/**
 * The activation registry is the ONLY thing that turns reported-turn data into
 * claim-speaker authority (the voice activation contract). Every negative here is load-bearing: a
 * registry that accepts a slug it should not, or a decision note that does not
 * exist, silently re-couples extraction to consumption.
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  activeVoiceCutoverSlugs,
  collectVoiceCutoverRegistryFailures,
  isVoiceCutoverActive,
  readVoiceCutoverRegistry,
  voiceCutoverRegistryPath,
} from "./voice-cutovers.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function write(relative: string, content: string) {
  const absolute = join(root, relative);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function writeRegistry(body: string) {
  write(voiceCutoverRegistryPath(), body);
}

const NOTE = "wiki/review/2026-07-25-fixture-cutover-execution.md";

function validEntry(overrides: { slug?: string; status?: string; note?: string } = {}) {
  return [
    "[[dialogues]]",
    `slug = "${overrides.slug ?? "fixture"}"`,
    `status = "${overrides.status ?? "active"}"`,
    `decision_note = "${overrides.note ?? NOTE}"`,
    "",
  ].join("\n");
}

describe("voice cutover registry", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "voice-cutovers-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    write("raw/plato/greek/fixture.txt", "{2a} ΝΑΡΡ. λόγος");
    write("raw/plato/greek/other.txt", "{2a} ΝΑΡΡ. λόγος");
    write(NOTE, "# Fixture cutover execution\n\nReviewed.\n");
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  describe("valid registries", () => {
    it("reads an active entry and answers activation by slug", () => {
      writeRegistry(`schema_version = 1\n\n${validEntry()}`);

      expect(collectVoiceCutoverRegistryFailures()).toEqual([]);
      expect(readVoiceCutoverRegistry()).toEqual([
        { slug: "fixture", status: "active", decisionNote: NOTE },
      ]);
      expect(activeVoiceCutoverSlugs()).toEqual(["fixture"]);
      expect(isVoiceCutoverActive("fixture")).toBe(true);
      expect(isVoiceCutoverActive("other")).toBe(false);
    });

    it("treats an absent registry as no activation rather than an error", () => {
      // Absence is the pre-cutover state of the whole corpus. It must be inert,
      // not a validation failure, or no dialogue could ever hold standalone data.
      expect(collectVoiceCutoverRegistryFailures()).toEqual([]);
      expect(activeVoiceCutoverSlugs()).toEqual([]);
      expect(isVoiceCutoverActive("fixture")).toBe(false);
    });

    it("returns active slugs in a deterministic order", () => {
      writeRegistry(
        `schema_version = 1\n\n${validEntry({ slug: "other" })}\n${validEntry({ slug: "fixture" })}`,
      );

      expect(activeVoiceCutoverSlugs()).toEqual(["fixture", "other"]);
    });
  });

  describe("rejected registries", () => {
    function failures(body: string) {
      writeRegistry(body);
      return collectVoiceCutoverRegistryFailures().join("\n");
    }

    it("rejects a missing or wrong schema_version", () => {
      expect(failures(validEntry())).toContain("schema_version");
      expect(failures(`schema_version = 2\n\n${validEntry()}`)).toContain("schema_version");
    });

    it("rejects malformed TOML", () => {
      expect(failures("schema_version = = 1")).toContain("cannot be parsed");
    });

    it("rejects duplicate dialogue slugs", () => {
      expect(failures(`schema_version = 1\n\n${validEntry()}\n${validEntry()}`)).toContain("more than once");
    });

    it("rejects a slug that is not a canonical dialogue", () => {
      expect(failures(`schema_version = 1\n\n${validEntry({ slug: "nosuchdialogue" })}`)).toContain(
        "not a canonical dialogue",
      );
    });

    it("rejects any status other than active", () => {
      // There is deliberately no `inactive`: absence is the only way to be
      // non-active, so a rollback has to delete the entry and say so.
      expect(failures(`schema_version = 1\n\n${validEntry({ status: "inactive" })}`)).toContain("status");
      expect(failures(`schema_version = 1\n\n${validEntry({ status: "pending" })}`)).toContain("status");
    });

    it("rejects a missing decision_note", () => {
      const body = ["schema_version = 1", "", "[[dialogues]]", 'slug = "fixture"', 'status = "active"', ""].join("\n");
      expect(failures(body)).toContain("decision_note");
    });

    it("rejects an absolute or traversing decision_note", () => {
      expect(failures(`schema_version = 1\n\n${validEntry({ note: "/etc/passwd" })}`)).toContain("decision_note");
      expect(
        failures(`schema_version = 1\n\n${validEntry({ note: "wiki/review/../../etc/passwd" })}`),
      ).toContain("decision_note");
    });

    it("rejects a decision_note outside wiki/review/", () => {
      expect(failures(`schema_version = 1\n\n${validEntry({ note: "docs/voices-protocol.md" })}`)).toContain(
        "wiki/review/",
      );
    });

    it("rejects a decision_note that does not exist or is empty", () => {
      expect(
        failures(`schema_version = 1\n\n${validEntry({ note: "wiki/review/never-written.md" })}`),
      ).toContain("does not exist");

      write("wiki/review/blank.md", "   \n");
      expect(failures(`schema_version = 1\n\n${validEntry({ note: "wiki/review/blank.md" })}`)).toContain("empty");
    });

    it("makes activation questions fail closed while the registry is invalid", () => {
      writeRegistry(`schema_version = 1\n\n${validEntry({ status: "inactive" })}`);

      expect(() => readVoiceCutoverRegistry()).toThrow(/cutovers\.toml/u);
      expect(() => isVoiceCutoverActive("fixture")).toThrow(/cutovers\.toml/u);
    });
  });
});

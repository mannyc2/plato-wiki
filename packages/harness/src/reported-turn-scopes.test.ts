import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CANONICAL_DIALOGUES } from "./completeness.js";
import {
  collectReportedTurnScopeFailures,
  parseReportedTurnScopes,
  readReportedTurnScopes,
  reportedTurnScopesPath,
} from "./reported-turn-scopes.js";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

const GREEK = "{p} λόγος τις.\n";

function turnIndexFor(dialogue: string, turnIds: string[]) {
  const rows = turnIds.map(
    (turnId, index) =>
      `  ${turnId} | ΣΩ.      | 17a          | 17b        | ${index * 10}          | ${index * 10 + 10}       | ${sha256(GREEK)} | 10`,
  );
  return [
    `dialogue: ${dialogue}`,
    `source_path: raw/plato/greek/${dialogue}.txt`,
    `source_sha256: ${sha256(GREEK)}`,
    "sigla_path: derived/plato/turns/sigla.toml",
    `sigla_sha256: ${sha256("sigla")}`,
    `turns[${turnIds.length}]:`,
    "  turn_id | speaker | start_marker | end_marker | start_char | end_char | text_sha256 | greek_char_count",
    ...rows,
    "",
  ].join("\n");
}

function receiptFor(dialogue: string, sourceSha: string, turnSha: string) {
  return [
    `# ${dialogue} nested reported-turn census`,
    "",
    `**Source**: \`raw/plato/greek/${dialogue}.txt\`, sha256 \`${sourceSha}\``,
    `**Turn index**: \`derived/plato/turns/${dialogue}.toon\`, sha256 \`${turnSha}\``,
    "**Reviewers**: fixture",
    "",
    "## Method",
    "",
    "Cue scan over every outer turn, every hit read in the Greek.",
    "No translation, doctrine, or style evidence was used.",
    "",
    "## Ambiguous boundaries",
    "",
    "None.",
    "",
  ].join("\n");
}

type Fixture = {
  repoRoot: string;
  entryFor: (dialogue: string, overrides?: Record<string, unknown>) => Record<string, unknown>;
  manifest: (entries: Array<Record<string, unknown>>, overrides?: Record<string, unknown>) => string;
  write: (content: string) => void;
};

function withFixture(run: (fixture: Fixture) => void) {
  const repoRoot = mkdtempSync(join(tmpdir(), "reported-turn-scopes-"));
  try {
    mkdirSync(join(repoRoot, "raw/plato/greek"), { recursive: true });
    mkdirSync(join(repoRoot, "derived/plato/turns"), { recursive: true });
    mkdirSync(join(repoRoot, "wiki/review"), { recursive: true });
    const sourceSha = sha256(GREEK);
    const turnShas = new Map<string, string>();
    for (const dialogue of CANONICAL_DIALOGUES) {
      writeFileSync(join(repoRoot, `raw/plato/greek/${dialogue}.txt`), GREEK);
      const turnIndex = turnIndexFor(dialogue, [`turn_${dialogue}_0001`, `turn_${dialogue}_0002`]);
      writeFileSync(join(repoRoot, `derived/plato/turns/${dialogue}.toon`), turnIndex);
      turnShas.set(dialogue, sha256(turnIndex));
      writeFileSync(
        join(repoRoot, `wiki/review/2026-07-26-${dialogue}-reported-turn-census.md`),
        receiptFor(dialogue, sourceSha, sha256(turnIndex)),
      );
    }

    const entryFor = (dialogue: string, overrides: Record<string, unknown> = {}) => {
      const receiptPath = `wiki/review/2026-07-26-${dialogue}-reported-turn-census.md`;
      return {
        dialogue,
        disposition: "none",
        outerTurnIds: [],
        inputs: {
          greekSourcePath: `raw/plato/greek/${dialogue}.txt`,
          greekSourceSha256: sourceSha,
          outerTurnIndexPath: `derived/plato/turns/${dialogue}.toon`,
          outerTurnIndexSha256: turnShas.get(dialogue)!,
        },
        reviewReceipt: {
          path: receiptPath,
          sha256: sha256(receiptFor(dialogue, sourceSha, turnShas.get(dialogue)!)),
        },
        ...overrides,
      };
    };

    const manifest = (entries: Array<Record<string, unknown>>, overrides: Record<string, unknown> = {}) =>
      JSON.stringify({ schemaVersion: 1, dialogues: entries, ...overrides }, null, 2);

    const write = (content: string) => {
      mkdirSync(join(repoRoot, "wiki"), { recursive: true });
      writeFileSync(join(repoRoot, reportedTurnScopesPath()), content);
    };

    run({ repoRoot, entryFor, manifest, write });
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
}

function fields(issues: ReturnType<typeof parseReportedTurnScopes>["issues"]) {
  return issues.map((issue) => issue.field);
}

describe("reported-turn scope manifest", () => {
  it("accepts a complete canonical manifest and reports zero issues", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue))));
      const parsed = readReportedTurnScopes({ repoRoot });
      expect(parsed.issues).toEqual([]);
      expect(parsed.entries).toHaveLength(27);
      expect(collectReportedTurnScopeFailures({ repoRoot })).toEqual([]);
    });
  });

  it("requires every canonical dialogue exactly once and no other slug", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      write(manifest(CANONICAL_DIALOGUES.slice(0, 26).map((dialogue) => entryFor(dialogue))));
      expect(fields(readReportedTurnScopes({ repoRoot }).issues)).toContain("dialogues");
      expect(readReportedTurnScopes({ repoRoot }).issues[0]!.actual).toContain("missing: timaeus");

      write(manifest([...CANONICAL_DIALOGUES, "apology"].map((dialogue) => entryFor(dialogue))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("duplicated: apology"))).toBe(true);

      write(manifest([...CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue)), entryFor("phaedo-appendix")]));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("unknown: phaedo-appendix"))).toBe(true);
    });
  });

  it("refuses a second canonical-dialogue array and a wrong schema version", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue)), { canonicalDialogues: [...CANONICAL_DIALOGUES] }));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("canonicalDialogues"))).toBe(true);

      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue))).replace('"schemaVersion": 1', '"schemaVersion": 2'));
      expect(fields(readReportedTurnScopes({ repoRoot }).issues)).toContain("schemaVersion");
    });
  });

  it("rejects an invalid disposition", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "meno" ? { disposition: "pending" } : {}))));
      const issue = readReportedTurnScopes({ repoRoot }).issues.find((entry) => entry.dialogue === "meno")!;
      expect(issue).toEqual(expect.objectContaining({ field: "disposition", expected: "required or none" }));
    });
  });

  it("holds required turn lists to nonempty, unique, sorted, existing turn IDs", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      const required = (outerTurnIds: string[]) =>
        manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "meno" ? { disposition: "required", outerTurnIds } : {})));

      write(required([]));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual === "empty")).toBe(true);

      write(required(["turn_meno_0002", "turn_meno_0001"]));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.expected === "sorted ascending")).toBe(true);

      write(required(["turn_meno_0001", "turn_meno_0001"]));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("duplicated: turn_meno_0001"))).toBe(true);

      write(required(["turn_meno_0001", "turn_meno_0404"]));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("absent: turn_meno_0404"))).toBe(true);

      write(required(["turn_meno_0001"]));
      expect(readReportedTurnScopes({ repoRoot }).issues).toEqual([]);
    });
  });

  it("refuses a none disposition that still names turns", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "ion" ? { outerTurnIds: ["turn_ion_0001"] } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.expected === "empty for disposition none")).toBe(true);
    });
  });

  it("binds the exact Greek source and outer-turn index bytes", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      write(
        manifest(
          CANONICAL_DIALOGUES.map((dialogue) =>
            entryFor(dialogue, dialogue === "crito" ? { inputs: { ...(entryFor("crito").inputs as Record<string, unknown>), greekSourceSha256: "0".repeat(64) } } : {}),
          ),
        ),
      );
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.field === "inputs.greekSourceSha256")).toBe(true);

      write(
        manifest(
          CANONICAL_DIALOGUES.map((dialogue) =>
            entryFor(dialogue, dialogue === "crito" ? { inputs: { ...(entryFor("crito").inputs as Record<string, unknown>), outerTurnIndexSha256: "0".repeat(64) } } : {}),
          ),
        ),
      );
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.field === "inputs.outerTurnIndexSha256")).toBe(true);
    });
  });

  it("requires exactly the four canonical input fields and slug-derived paths", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      const base = entryFor("laws").inputs as Record<string, unknown>;
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "laws" ? { inputs: { ...base, extra: "x" } } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.field === "inputs")).toBe(true);

      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "laws" ? { inputs: { ...base, greekSourcePath: "raw/plato/greek/meno.txt" } } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.field === "inputs.greekSourcePath")).toBe(true);
    });
  });

  it("requires a receipt that exists, is nonempty, hashes, and carries its contract", () => {
    withFixture(({ repoRoot, entryFor, manifest, write }) => {
      const receipt = entryFor("ion").reviewReceipt as Record<string, unknown>;

      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "ion" ? { reviewReceipt: { ...receipt, path: "docs/elsewhere.md" } } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.field === "reviewReceipt.path")).toBe(true);

      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "ion" ? { reviewReceipt: { ...receipt, path: "wiki/review/absent.md" } } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("does not exist"))).toBe(true);

      writeFileSync(join(repoRoot, "wiki/review/empty.md"), "");
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "ion" ? { reviewReceipt: { path: "wiki/review/empty.md", sha256: sha256("") } } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.actual.includes("is empty"))).toBe(true);

      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "ion" ? { reviewReceipt: { ...receipt, sha256: "0".repeat(64) } } : {}))));
      expect(readReportedTurnScopes({ repoRoot }).issues.some((issue) => issue.field === "reviewReceipt.sha256")).toBe(true);

      const stripped = receiptFor("ion", sha256(GREEK), "0".repeat(64)).replace("No translation, doctrine, or style evidence was used.", "");
      writeFileSync(join(repoRoot, "wiki/review/2026-07-26-ion-reported-turn-census.md"), stripped);
      write(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue, dialogue === "ion" ? { reviewReceipt: { ...receipt, sha256: sha256(stripped) } } : {}))));
      const issues = readReportedTurnScopes({ repoRoot }).issues.filter((issue) => issue.dialogue === "ion");
      expect(issues.some((issue) => issue.expected.includes("No translation, doctrine, or style evidence"))).toBe(true);
      expect(issues.some((issue) => issue.expected.includes("repeats outerTurnIndexSha256"))).toBe(true);
    });
  });

  it("reports a missing manifest instead of silently passing", () => {
    withFixture(({ repoRoot }) => {
      expect(readReportedTurnScopes({ repoRoot }).issues).toEqual([
        expect.objectContaining({ field: "manifest", actual: "missing" }),
      ]);
    });
  });

  it("reports malformed JSON as one manifest-level issue", () => {
    withFixture(({ repoRoot, write }) => {
      write("{ not json");
      const issues = readReportedTurnScopes({ repoRoot }).issues;
      expect(issues).toHaveLength(1);
      expect(issues[0]!.field).toBe("manifest");
    });
  });

  it("parses without touching the filesystem manifest path", () => {
    withFixture(({ repoRoot, entryFor, manifest }) => {
      const parsed = parseReportedTurnScopes(manifest(CANONICAL_DIALOGUES.map((dialogue) => entryFor(dialogue))), { repoRoot });
      expect(parsed.issues).toEqual([]);
      expect(parsed.entries.map((entry) => entry.dialogue)).toEqual([...CANONICAL_DIALOGUES]);
    });
  });
});

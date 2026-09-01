import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildObservationTurnJoin,
  formatObservationTurnJoinToon,
  parseObservationTurnJoinToon,
  writeObservationTurnJoin,
} from "./joins.js";
import { setRepoRootForTesting } from "../paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

const HASH = "a".repeat(64);

function record(id: string, startChar: number, endChar: number, reviewStatus = "accepted") {
  return `\`\`\`yaml
observation_id: ${id}
stephanus_span: 1a
source_ref:
  source_path: raw/plato/greek/meno.txt
  stephanus_span: 1a
  start_marker: 1a
  end_marker: 1a
  start_char: ${startChar}
  end_char: ${endChar}
  text_sha256: ${HASH}
review_status: ${reviewStatus}
\`\`\``;
}

function writeLedger(dialogue: string, records: string[]) {
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  writeFileSync(join(root, "wiki/observations", `${dialogue}.md`), records.join("\n\n"), "utf8");
}

function writeTurnIndex(dialogue: string, rows: Array<{ id: string; speaker: string; start: number; end: number }>) {
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  const body = [
    `dialogue: ${dialogue}`,
    `source_path: raw/plato/greek/${dialogue}.txt`,
    `source_sha256: ${HASH}`,
    "sigla_path: derived/plato/turns/sigla.toml",
    `sigla_sha256: ${HASH}`,
    `turns[${rows.length}]:`,
    "  turn_id        | speaker | start_marker | end_marker | start_char | end_char | text_sha256                                                      | greek_char_count",
    ...rows.map(
      (row) =>
        `  ${row.id.padEnd(14)} | ${row.speaker.padEnd(7)} | 1a           | 1a         | ${String(row.start).padEnd(10)} | ${String(row.end).padEnd(8)} | ${HASH} | 0`,
    ),
    "",
  ].join("\n");
  writeFileSync(join(root, "derived/plato/turns", `${dialogue}.toon`), body, "utf8");
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "joins-test-"));
  restoreRepoRoot = setRepoRootForTesting(root);
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("observation-turn joins", () => {
  it("uses half-open overlap boundaries and records multi-turn spans", () => {
    writeLedger("meno", [
      record("obs_meno_0001", 0, 10),
      record("obs_meno_0002", 10, 20),
      record("obs_meno_0003", 5, 25),
    ]);
    writeTurnIndex("meno", [
      { id: "turn_meno_0001", speaker: "A.", start: 0, end: 10 },
      { id: "turn_meno_0002", speaker: "B.", start: 10, end: 20 },
      { id: "turn_meno_0003", speaker: "A.", start: 20, end: 30 },
    ]);

    const index = buildObservationTurnJoin("meno");

    expect(index.rows[0]?.turnIds).toEqual(["turn_meno_0001"]);
    expect(index.rows[1]?.turnIds).toEqual(["turn_meno_0002"]);
    expect(index.rows[2]?.turnIds).toEqual(["turn_meno_0001", "turn_meno_0002", "turn_meno_0003"]);
    expect(index.rows[2]?.speakers).toEqual(["A.", "B."]);
  });

  it("marks whole-dialogue no-sigla turns as unattributed", () => {
    writeLedger("apology", [record("obs_apology_0001", 0, 10)]);
    writeTurnIndex("apology", [{ id: "turn_apology_0001", speaker: "(none)", start: 0, end: 30 }]);

    const row = buildObservationTurnJoin("apology").rows[0];

    expect(row?.attributed).toBe(false);
    expect(row?.speakers).toEqual(["(unattributed)"]);
  });

  it("throws when an observation overlaps zero turns", () => {
    writeLedger("meno", [record("obs_meno_0001", 30, 40)]);
    writeTurnIndex("meno", [{ id: "turn_meno_0001", speaker: "A.", start: 0, end: 10 }]);

    expect(() => buildObservationTurnJoin("meno")).toThrow(/overlaps zero turns/);
  });

  it("excludes rejected observations from the generated join", () => {
    writeLedger("meno", [
      record("obs_meno_0001", 0, 10),
      record("obs_meno_0002", 30, 40, "rejected"),
    ]);
    writeTurnIndex("meno", [{ id: "turn_meno_0001", speaker: "A.", start: 0, end: 10 }]);

    expect(buildObservationTurnJoin("meno").rows.map((row) => row.observationId)).toEqual([
      "obs_meno_0001",
    ]);
  });

  it("rejects a non-accepted row in a stored join", () => {
    writeLedger("meno", [record("obs_meno_0001", 0, 10)]);
    writeTurnIndex("meno", [{ id: "turn_meno_0001", speaker: "A.", start: 0, end: 10 }]);
    const forged = formatObservationTurnJoinToon(buildObservationTurnJoin("meno")).replace(
      /(^\s*obs_meno_0001\s*\|\s*)accepted/mu,
      "$1rejected",
    );

    expect(() => parseObservationTurnJoinToon(forged)).toThrow(/Malformed observation-turn join row values/u);
  });

  it("writes byte-stable join files", () => {
    writeLedger("meno", [record("obs_meno_0001", 0, 10)]);
    writeTurnIndex("meno", [{ id: "turn_meno_0001", speaker: "A.", start: 0, end: 10 }]);

    const first = writeObservationTurnJoin("meno");
    const firstContent = readFileSync(join(root, first.path), "utf8");
    const second = writeObservationTurnJoin("meno");
    const secondContent = readFileSync(join(root, second.path), "utf8");

    expect(firstContent).toBe(secondContent);
    expect(firstContent).toBe(formatObservationTurnJoinToon(buildObservationTurnJoin("meno")));
  });
});

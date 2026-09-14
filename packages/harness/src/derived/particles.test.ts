import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "../paths.js";
import {
  PARTICLE_FORMS,
  buildParticleMetrics,
  formatParticleMetricsToon,
  validateParticleMetricsArtifacts,
  writeParticleMetrics,
  writeParticleReport,
} from "./particles.js";
import { writeTokenIndex } from "./tokens.js";
import { writeTurnIndex } from "./turns.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;
const sourcePath = "raw/plato/greek/fixture.txt";
const registryPath = "derived/plato/turns/sigla.toml";
const metricsPath = "derived/plato/metrics/particles/fixture.toon";
const reportPath = "derived/plato/metrics/particles/report.md";

function prepare(source: string, sigla: string[] = []) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  writeFileSync(join(root, sourcePath), source, "utf8");
  writeFileSync(
    join(root, registryPath),
    `[[dialogues]]\nslug = "fixture"\nsigla = ${JSON.stringify(sigla)}\n`,
    "utf8",
  );
  writeTurnIndex("fixture");
  writeTokenIndex("fixture");
}

function writeArtifacts() {
  writeParticleMetrics("fixture");
  writeParticleReport();
}

describe("particle form metrics", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "particle-metrics-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("counts case and accent variants as whole token forms without substring matches", () => {
    prepare("{1a} ΜΉΝ μὴν τοίνυν καίτοι ΓΆΡ γὰρ οὖν ΔΉ δὴ δήπου οὐκοῦν μηνός.\n");

    const metrics = buildParticleMetrics("fixture");
    expect(metrics.total.tokenCount).toBe(12);
    expect(metrics.total.counts).toEqual({ μήν: 2, τοίνυν: 1, καίτοι: 1, γάρ: 2, οὖν: 1, δή: 2 });
    expect(metrics.occurrences).toHaveLength(9);
    expect(metrics.speakers.map((row) => [row.id, row.tokenCount])).toEqual([["(none)", 12]]);
  });

  it("excludes every token in multi-part and adjacent printed sigla from both counts and denominators", () => {
    prepare("{b1}\n{1a} {p} ΝΕ. ΣΩ. γάρ.\n{1b} ΓΑΡ.οὖν.\nΑΑ. δή.\n", ["ΝΕ. ΣΩ.", "ΓΑΡ.", "ΑΑ."]);

    const metrics = buildParticleMetrics("fixture");
    expect(metrics.indexedTokenCount).toBe(7);
    expect(metrics.excludedSiglumTokenCount).toBe(4);
    expect(metrics.total.tokenCount).toBe(3);
    expect(metrics.total.counts).toEqual({ μήν: 0, τοίνυν: 0, καίτοι: 0, γάρ: 1, οὖν: 1, δή: 1 });
    expect(metrics.occurrences.map(({ token }) => token.tokenId)).toEqual([
      "tok_fixture_000003",
      "tok_fixture_000005",
      "tok_fixture_000007",
    ]);
    expect(metrics.turns.map((row) => row.tokenCount)).toEqual([1, 1, 1]);
  });

  it("retains unlabelled prose and reconciles every scope with exact token evidence", () => {
    const source = "{1a} γάρ.\nΑΑ. μὴν δή. {1b} γὰρ οὖν.\nΒΒ. καίτοι τοίνυν.\n";
    prepare(source, ["ΑΑ.", "ΒΒ."]);

    const metrics = buildParticleMetrics("fixture");
    expect(metrics.total.tokenCount).toBe(7);
    expect(metrics.total.counts).toEqual({ μήν: 1, τοίνυν: 1, καίτοι: 1, γάρ: 2, οὖν: 1, δή: 1 });
    expect(metrics.turns.map((row) => row.tokenCount)).toEqual([1, 4, 2]);
    expect(metrics.markers.map((row) => [row.id, row.tokenCount])).toEqual([["1a", 3], ["1b", 4]]);
    expect(metrics.speakers.find((row) => row.id === "(none)")?.tokenCount).toBe(1);

    for (const rows of [metrics.speakers, metrics.turns, metrics.markers]) {
      expect(rows.reduce((sum, row) => sum + row.tokenCount, 0)).toBe(metrics.total.tokenCount);
      for (const form of PARTICLE_FORMS) {
        expect(rows.reduce((sum, row) => sum + row.counts[form], 0)).toBe(metrics.total.counts[form]);
      }
    }
    expect(new Set(metrics.occurrences.map(({ token }) => token.tokenId)).size).toBe(7);
    for (const { particle, token } of metrics.occurrences) {
      expect(source.slice(token.startChar, token.endChar)).toBe(token.surface);
      expect(metrics.turns.find((row) => row.id === token.turnId)?.counts[particle]).toBeGreaterThan(0);
      expect(metrics.markers.find((row) => row.id === token.marker)?.counts[particle]).toBeGreaterThan(0);
    }
  });

  it("keeps an empty body at zero after excluding its printed label", () => {
    prepare("{1a} ΑΑ.\n", ["ΑΑ."]);

    const metrics = buildParticleMetrics("fixture");
    expect(metrics.indexedTokenCount).toBe(1);
    expect(metrics.excludedSiglumTokenCount).toBe(1);
    expect(metrics.total.tokenCount).toBe(0);
    expect(Object.values(metrics.total.counts)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(metrics.occurrences).toEqual([]);
    expect(formatParticleMetricsToon(metrics)).not.toMatch(/NaN|Infinity/u);
  });

  it.each([sourcePath, registryPath])("rejects stale canonical input %s", (path) => {
    prepare("{1a} ΑΑ. γάρ.\n", ["ΑΑ."]);
    const original = readFileSync(join(root, path), "utf8");
    writeFileSync(join(root, path), `${original}\n`, "utf8");

    expect(() => buildParticleMetrics("fixture")).toThrow(/stale|source|sigla|registry/iu);
  });

  it("writes deterministic corpus artifacts and validates their exact bytes", () => {
    prepare("{1a} ΑΑ. γὰρ οὖν.\n", ["ΑΑ."]);

    const result = writeParticleMetrics("fixture");
    expect(result).toMatchObject({ path: metricsPath, occurrenceCount: 2, tokenCount: 2 });
    writeParticleReport();
    const paths = [metricsPath, reportPath];
    const first = paths.map((path) => readFileSync(join(root, path), "utf8"));
    expect(validateParticleMetricsArtifacts()).toEqual([]);
    writeArtifacts();
    expect(paths.map((path) => readFileSync(join(root, path), "utf8"))).toEqual(first);
    expect(first.every((content) => content.split("\n").every((line) => !/[ \t]$/u.test(line)))).toBe(true);
  });

  it.each([metricsPath, reportPath])("rejects a missing or tampered artifact %s", (path) => {
    prepare("{1a} γάρ.\n");
    writeArtifacts();
    expect(validateParticleMetricsArtifacts()).toEqual([]);

    rmSync(join(root, path));
    expect(validateParticleMetricsArtifacts().some((failure) => failure.includes(path))).toBe(true);
    writeArtifacts();
    const original = readFileSync(join(root, path), "utf8");
    writeFileSync(join(root, path), `${original}unexpected\n`, "utf8");
    expect(validateParticleMetricsArtifacts().some((failure) => failure.includes(path))).toBe(true);
  });

  it("rejects a particle artifact whose dialogue has no canonical Greek source", () => {
    prepare("{1a} γάρ.\n");
    writeArtifacts();
    const orphanPath = "derived/plato/metrics/particles/orphan.toon";
    writeFileSync(join(root, orphanPath), readFileSync(join(root, metricsPath), "utf8"), "utf8");

    expect(validateParticleMetricsArtifacts().some((failure) => failure.includes(orphanPath))).toBe(true);
  });
});

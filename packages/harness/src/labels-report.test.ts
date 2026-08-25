import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildAdjudicationSample,
  collectLabelQuality,
  formatLabelQualityMarkdown,
  writeLabelQuality,
} from "./labels-report.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function record({
  observationId,
  family,
  label,
  span = "1a",
  reviewStatus = "accepted",
}: {
  observationId: string;
  family: string;
  label: string;
  span?: string;
  reviewStatus?: string;
}) {
  return `\`\`\`yaml
observation_id: ${observationId}
stephanus_span: ${span}
feature_id: feature_candidate_001
feature_family: ${family}
feature_label: ${label}
review_status: ${reviewStatus}
\`\`\``;
}

function writeLedger(name: string, records: string[]) {
  writeFileSync(join(root, "wiki/observations", name), records.join("\n\n"), "utf8");
}

function writeGreekSources(dialogues: string[]) {
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  for (const dialogue of dialogues) {
    writeFileSync(join(root, "raw/plato/greek", `${dialogue}.txt`), "{1a} test", "utf8");
  }
}

function writeMergeMap() {
  mkdirSync(join(root, "wiki/label-consolidation"), { recursive: true });
  writeFileSync(
    join(root, "wiki/label-consolidation/fixture.json"),
    `${JSON.stringify(
      {
        version: 1,
        standard: "docs/label-normalization-standards.md",
        dispositions: [
          { family: "craft_analogy", label: "kept_singleton", action: "keep", reason: "fixture keep" },
          {
            family: "elenchus",
            label: "old_shared_move",
            action: "merge",
            reason: "fixture merge",
            to: { family: "elenchus", label: "shared_move" },
          },
          { family: "statute_family", label: "law_singleton", action: "todo", reason: "" },
        ],
        createdLabels: [{ family: "closure_type", label: "created_singleton" }],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function singletonRecords(family: string, dialogue: string, count: number, start = 1) {
  return Array.from({ length: count }, (_, index) =>
    record({
      observationId: `obs_${dialogue}_${String(start + index).padStart(4, "0")}`,
      family,
      label: `${family}_singleton_${String(index + 1).padStart(3, "0")}`,
    }),
  );
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "label-quality-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("label quality report", () => {
  it("computes reuse mass, disposition coverage, family profiles, and label-name outliers", () => {
    writeGreekSources(["crito", "laws", "meno"]);
    writeMergeMap();
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "shared_move" }),
      record({ observationId: "obs_meno_0002", family: "craft_analogy", label: "kept_singleton" }),
      record({ observationId: "obs_meno_0003", family: "closure_type", label: "created_singleton" }),
      record({
        observationId: "obs_meno_0004",
        family: "misc_family",
        label: "this_is_a_very_long_label_name_for_testing_shape",
        reviewStatus: "rejected",
      }),
    ]);
    writeLedger("crito.md", [record({ observationId: "obs_crito_0001", family: "elenchus", label: "shared_move" })]);
    writeLedger("laws.md", [record({ observationId: "obs_laws_0001", family: "statute_family", label: "law_singleton" })]);

    const report = collectLabelQuality();

    expect(report.allRecords.totalLabels).toBe(5);
    expect(report.allRecords.totalObservations).toBe(6);
    expect(report.allRecords.singletonLabels).toBe(4);
    expect(report.allRecords.crossDialogueLabels).toBe(1);
    expect(report.acceptedOnly.totalLabels).toBe(4);
    expect(report.acceptedOnly.totalObservations).toBe(5);
    expect(report.acceptedOnly.reuseMass.nonSingletonObservations).toBe(2);
    expect(report.acceptedOnly.reuseMass.nonSingletonShare).toBe(0.4);
    expect(report.acceptedOnly.lawsOnlySingletonLabels).toBe(1);
    expect(report.dispositionCoverage.coveredLabels).toBe(3);
    expect(report.dispositionCoverage.uncoveredLabels).toBe(2);
    expect(report.dispositionCoverage.uncoveredSingletons).toBe(2);
    expect(report.familyProfiles.find((entry) => entry.family === "craft_analogy")?.kind).toBe("seed");
    expect(report.familyProfiles.find((entry) => entry.family === "statute_family")?.lawsOnlySingletonCount).toBe(1);
    expect(report.labelNameShape.longestLabels[0]?.label).toBe("this_is_a_very_long_label_name_for_testing_shape");
    expect(report.perDialogueParticipation.find((entry) => entry.dialogue === "meno")?.crossDialogueLabels).toBe(1);
  });

  it("writes deterministic markdown", () => {
    writeGreekSources(["meno"]);
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "single_move" }),
      record({ observationId: "obs_meno_0002", family: "elenchus", label: "other_move" }),
    ]);

    const written = writeLabelQuality();
    const content = readFileSync(join(root, written.path), "utf8");

    expect(written.path).toBe("wiki/label-quality.md");
    expect(formatLabelQualityMarkdown(written.report)).toBe(content);
    expect(formatLabelQualityMarkdown(written.report)).toBe(formatLabelQualityMarkdown(written.report));
    expect(content).toContain("# Label Quality");
    expect(content).toContain("singleton_labels: 2");
  });

  it("builds a deterministic stratified singleton sample with minimum draws", () => {
    writeGreekSources(["laws", "meno"]);
    writeLedger("meno.md", [
      ...singletonRecords("craft_analogy", "meno", 20, 1),
      ...singletonRecords("elenchus", "meno", 20, 101),
      ...singletonRecords("misc_family", "meno", 20, 201),
    ]);
    writeLedger("laws.md", singletonRecords("statute_family", "laws", 20, 1));

    const first = buildAdjudicationSample({ size: 48 });
    const second = buildAdjudicationSample({ size: 48 });

    expect(first).toEqual(second);
    expect(first.entries).toHaveLength(48);
    expect(first.universeSize).toBe(80);
    expect(first.strata.craft_analogy?.drawn).toBe(12);
    expect(first.strata.elenchus?.drawn).toBe(12);
    expect(first.strata["laws-only passthrough"]?.drawn).toBe(12);
    expect(first.strata.other?.drawn).toBe(12);
    expect(first.entries.every((entry) => entry.adjudication === "" && entry.target === null && entry.reason === "")).toBe(true);
  });
});

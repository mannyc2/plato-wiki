import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectLabelAudit, formatLabelAuditMarkdown, writeLabelAudit } from "./labels.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function record({
  observationId,
  family,
  label,
  span = "1a",
}: {
  observationId: string;
  family: string;
  label: string;
  span?: string;
}) {
  return `\`\`\`yaml
observation_id: ${observationId}
stephanus_span: ${span}
feature_id: feature_candidate_001
feature_family: ${family}
feature_label: ${label}
review_status: accepted
\`\`\``;
}

function writeLedger(name: string, records: string[]) {
  writeFileSync(join(root, "wiki/observations", name), records.join("\n\n"), "utf8");
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "label-audit-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("label audit", () => {
  it("counts singleton, within-dialogue, and cross-dialogue labels", () => {
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "shared_move" }),
      record({ observationId: "obs_meno_0002", family: "elenchus", label: "within_dialogue_move" }),
      record({ observationId: "obs_meno_0003", family: "elenchus", label: "within_dialogue_move" }),
    ]);
    writeLedger("crito.md", [
      record({ observationId: "obs_crito_0001", family: "elenchus", label: "shared_move" }),
      record({ observationId: "obs_crito_0002", family: "closure_type", label: "single_move" }),
    ]);

    const report = collectLabelAudit();
    const entries = report.families.flatMap((family) => family.entries);

    expect(report.totalLabels).toBe(3);
    expect(report.totalObservations).toBe(5);
    expect(report.singletonLabels).toBe(1);
    expect(report.crossDialogueLabels).toBe(1);
    expect(entries.find((entry) => entry.label === "shared_move")?.status).toBe("cross_dialogue");
    expect(entries.find((entry) => entry.label === "within_dialogue_move")?.status).toBe("within_dialogue_reuse");
    expect(entries.find((entry) => entry.label === "single_move")?.status).toBe("singleton");
  });

  it("writes deterministic markdown with every observation id", () => {
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "shared_move" }),
      record({ observationId: "obs_meno_0002", family: "elenchus", label: "single_move" }),
    ]);
    writeLedger("crito.md", [record({ observationId: "obs_crito_0001", family: "elenchus", label: "shared_move" })]);

    const written = writeLabelAudit();
    const content = readFileSync(join(root, written.path), "utf8");

    expect(written.path).toBe("wiki/label-audit.md");
    expect(formatLabelAuditMarkdown(written.report)).toBe(content);
    expect(content).toContain("total_labels: 2");
    expect(content).toContain("cross_dialogue_labels: 1");
    expect(content).toContain("obs_crito_0001");
    expect(content).toContain("obs_meno_0001");
    expect(content).toContain("obs_meno_0002");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildClusters, validateClusterArtifacts, writeClusterArtifacts } from "./clusters.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function record({
  observationId,
  family,
  label,
  status = "accepted",
}: {
  observationId: string;
  family: string;
  label: string;
  status?: string;
}) {
  return `\`\`\`yaml
observation_id: ${observationId}
stephanus_span: 2a-2b
feature_id: feature_candidate_001
feature_family: ${family}
feature_label: ${label}
review_status: ${status}
\`\`\``;
}

function writeLedger(fileName: string, records: string[]) {
  writeFileSync(join(root, "wiki/observations", fileName), records.join("\n\n"), "utf8");
}

describe("buildClusters", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "clusters-test-"));
    restoreRepoRoot = setRepoRootForTesting(root);
    mkdirSync(join(root, "wiki/observations"), { recursive: true });
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("groups accepted observations by family and label across dialogues", () => {
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "assent_chain" }),
      record({ observationId: "obs_meno_0002", family: "elenchus", label: "assent_chain" }),
    ]);
    writeLedger("crito.md", [
      record({ observationId: "obs_crito_0001", family: "elenchus", label: "assent_chain" }),
      record({ observationId: "obs_crito_0002", family: "craft_analogy", label: "craft_example" }),
    ]);

    const clusters = buildClusters();

    expect(clusters).toHaveLength(2);
    expect(clusters[1]).toMatchObject({
      family: "elenchus",
      label: "assent_chain",
      dialogues: ["crito", "meno"],
    });
    expect(clusters[1]?.observations.map((observation) => observation.observationId)).toEqual([
      "obs_crito_0001",
      "obs_meno_0001",
      "obs_meno_0002",
    ]);
  });

  it("excludes unreviewed observations unless preview mode is enabled", () => {
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "assent_chain", status: "unreviewed" }),
    ]);

    expect(buildClusters()).toHaveLength(0);
    expect(buildClusters({ includeUnreviewed: true })).toHaveLength(1);
    expect(buildClusters({ includeUnreviewed: true })[0]?.preConvergence).toBe(true);
  });

  it("refuses to write accepted-only clusters before the convergence gate passes", () => {
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "assent_chain" }),
    ]);

    expect(() => writeClusterArtifacts()).toThrow("Cluster convergence gate is not met.");
  });

  it("writes deterministic family cluster files after the convergence gate passes", () => {
    const menoRecords: string[] = [];
    const critoRecords: string[] = [];
    for (let index = 1; index <= 10; index += 1) {
      const label = `shared_label_${String(index).padStart(2, "0")}`;
      menoRecords.push(
        record({
          observationId: `obs_meno_${String(index).padStart(4, "0")}`,
          family: "elenchus",
          label,
        }),
      );
      critoRecords.push(
        record({
          observationId: `obs_crito_${String(index).padStart(4, "0")}`,
          family: "elenchus",
          label,
        }),
      );
    }
    writeLedger("meno.md", menoRecords);
    writeLedger("crito.md", critoRecords);

    const written = writeClusterArtifacts();
    const path = join(root, written[0]!.path);
    const first = readFileSync(path, "utf8");
    writeClusterArtifacts();
    const second = readFileSync(path, "utf8");

    expect(written).toEqual([{ family: "elenchus", path: "wiki/clusters/elenchus.md", clusterCount: 10 }]);
    expect(first).toBe(second);
    expect(first).toContain("cluster_id: cluster_elenchus_shared_label_01");
    expect(first).toContain("observation_ids: [obs_crito_0001, obs_meno_0001]");
  });

  it("reports cluster references that are missing or not accepted", () => {
    mkdirSync(join(root, "wiki/clusters"), { recursive: true });
    writeLedger("meno.md", [
      record({ observationId: "obs_meno_0001", family: "elenchus", label: "assent_chain", status: "unreviewed" }),
    ]);
    writeFileSync(
      join(root, "wiki/clusters/elenchus.md"),
      `# Cluster Family: elenchus

\`\`\`yaml
cluster_id: cluster_elenchus_assent_chain
feature_family: elenchus
feature_label: assent_chain
observation_ids: [obs_meno_0001]
dialogues: [meno]
spans:
  obs_meno_0001: 2a-2b
\`\`\`
`,
      "utf8",
    );

    expect(validateClusterArtifacts()).toEqual([
      "wiki/clusters/elenchus.md: cluster references missing or non-accepted observation obs_meno_0001",
    ]);
  });
});

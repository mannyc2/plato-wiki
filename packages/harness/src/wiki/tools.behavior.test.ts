import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AgentTool } from "@earendil-works/pi-agent-core";
import { setRepoRootForTesting } from "../paths.js";
import { relationCandidateKey } from "../relations.js";
import { resolveSourceSpan } from "../source.js";
import type { TranscriptWriter } from "../transcript.js";
import type { HarnessRunCommand } from "../types.js";
import { createWikiTools, type WikiToolOptions } from "./tools.js";

const transcript: TranscriptWriter = {
  runId: "test",
  runDir: "test",
  eventsPath: "test/events.jsonl",
  summaryPath: "test/summary.md",
  responsePath: "test/response.md",
  usagePath: "test/usage.json",
  usageMarkdownPath: "test/usage.md",
  write: () => {},
  writeSummary: () => {},
  writeResponse: () => {},
  recordAssistantUsage: () => {},
};

type ToolMap = Record<string, AgentTool>;

let root = "";
let restoreRepoRoot: (() => void) | undefined;

function toolMap(command: HarnessRunCommand = "ingest", options: WikiToolOptions = {}): ToolMap {
  return Object.fromEntries(createWikiTools(transcript, command, options).map((tool) => [tool.name, tool]));
}

function readFixture(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function fixtureLedger({
  observationId = "obs_testdialogue_0001",
  span = "2a-2b",
  observation = "The speaker makes a testable procedural claim.",
  reviewStatus = "unreviewed",
  supportsClaimIds = [] as string[],
}: {
  observationId?: string;
  span?: string;
  observation?: string;
  reviewStatus?: string;
  supportsClaimIds?: string[];
} = {}) {
  const { source_ref } = resolveSourceSpan("testdialogue", span);

  return `# Testdialogue Observations

\`\`\`yaml
observation_id: ${observationId}
source_work: Testdialogue
stephanus_span: ${span}
source_ref:
  source_path: ${source_ref.source_path}
  stephanus_span: ${source_ref.stephanus_span}
  start_marker: ${source_ref.start_marker}
  end_marker: ${source_ref.end_marker}
  start_char: ${source_ref.start_char}
  end_char: ${source_ref.end_char}
  text_sha256: ${source_ref.text_sha256}
greek_terms: []
english_gloss: Test gloss.
observation: ${observation}
textual_basis: The cited span contains the procedural exchange.
limits: This observation records only the local exchange.
${supportsClaimIds.length > 0 ? `supports_claim_ids: [${supportsClaimIds.join(", ")}]\n` : ""}review_status: ${reviewStatus}
\`\`\`
`;
}

function fixtureClaimLedger({
  claimId = "claim_testdialogue_0001",
  span = "2a-2b",
  speaker = '"ΣΩ."',
  content = "The speaker makes a testable claim.",
  reviewStatus = "unreviewed",
  observationIds = [] as string[],
}: {
  claimId?: string;
  span?: string;
  speaker?: string;
  content?: string;
  reviewStatus?: string;
  observationIds?: string[];
} = {}) {
  const { source_ref } = resolveSourceSpan("testdialogue", span);

  return `# Testdialogue Claims

\`\`\`yaml
claim_id: ${claimId}
source_work: Testdialogue
stephanus_span: ${span}
source_ref:
  source_path: ${source_ref.source_path}
  stephanus_span: ${source_ref.stephanus_span}
  start_marker: ${source_ref.start_marker}
  end_marker: ${source_ref.end_marker}
  start_char: ${source_ref.start_char}
  end_char: ${source_ref.end_char}
  text_sha256: ${source_ref.text_sha256}
speaker: ${speaker}
claim_kind: thesis
content: "${content}"
greek_terms: []
stance_events:
  - kind: asserted
    stephanus_span: ${span}
    source_ref:
      source_path: ${source_ref.source_path}
      stephanus_span: ${source_ref.stephanus_span}
      start_marker: ${source_ref.start_marker}
      end_marker: ${source_ref.end_marker}
      start_char: ${source_ref.start_char}
      end_char: ${source_ref.end_char}
      text_sha256: ${source_ref.text_sha256}
final_status: left_standing
observation_ids: [${observationIds.join(", ")}]
limits: "No later span in this test ledger coverage retracts this claim."
review_status: ${reviewStatus}
\`\`\`
`;
}

function fixtureClaimLedgerWithSourceRefStubs(options: Parameters<typeof fixtureClaimLedger>[0] = {}) {
  return fixtureClaimLedger(options)
    .replace(/source_ref:\n(?:  .+\n){7}/u, "source_ref:\n")
    .replace(/    source_ref:\n(?:      .+\n){7}/u, "    source_ref:\n");
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "wiki-tools-"));
  restoreRepoRoot = setRepoRootForTesting(root);
  mkdirSync(join(root, "raw/plato/greek"), { recursive: true });
  mkdirSync(join(root, "wiki/observations"), { recursive: true });
  mkdirSync(join(root, "wiki/claims"), { recursive: true });
  mkdirSync(join(root, "derived/plato/turns"), { recursive: true });
  mkdirSync(join(root, "wiki"), { recursive: true });
  writeFileSync(join(root, "wiki/ingest-log.md"), "", "utf8");
  writeFileSync(
    join(root, "raw/plato/greek/testdialogue.txt"),
    "{2a} ΣΩ. πρῶτον μέρος κειμένου. {2b} δεύτερον μέρος. {3a} τρίτον μέρος.",
    "utf8",
  );
  writeFileSync(
    join(root, "derived/plato/turns/sigla.toml"),
    ['[[dialogues]]', 'slug = "testdialogue"', 'sigla = ["ΣΩ."]', ""].join("\n"),
    "utf8",
  );
});

afterEach(() => {
  restoreRepoRoot?.();
  rmSync(root, { recursive: true, force: true });
});

describe("wiki tool behavior", () => {
  it("stages then commits a valid ingest ledger", async () => {
    const tools = toolMap();
    const path = "wiki/observations/testdialogue.md";
    const stageResult = await tools.wiki_stage_observation!.execute("call-stage", {
      path,
      content: fixtureLedger(),
    });

    expect(stageResult.content[0]?.type).toBe("text");
    expect(stageResult.content[0]?.text).toContain("Staged wiki/observations/testdialogue.md");
    expect(existsSync(join(root, path))).toBe(false);

    await tools.wiki_commit_observation!.execute("call-commit", { path });

    expect(readFixture(path)).toContain("observation_id: obs_testdialogue_0001");
  });

  it("rejects commit without a staged ledger", async () => {
    const tools = toolMap();

    await expect(tools.wiki_commit_observation!.execute("call-commit", {
      path: "wiki/observations/testdialogue.md",
    })).rejects.toThrow(/No staged observation content/);
  });

  it("rejects invalid staged ledgers without writing files", async () => {
    const tools = toolMap();
    const path = "wiki/observations/testdialogue.md";
    const invalidLedger = fixtureLedger({ observation: "ΣΩ. Greek text was copied into prose." });

    await expect(tools.wiki_stage_observation!.execute("call-stage", {
      path,
      content: invalidLedger,
    })).rejects.toThrow(/greek_outside_terms/);
    expect(existsSync(join(root, path))).toBe(false);
  });

  it("enforces traversal and guard boundaries through tools", async () => {
    const tools = toolMap();

    await expect(tools.wiki_read_file!.execute("call-read", { path: "../etc/passwd" })).rejects.toThrow(
      /outside the repository/,
    );
    await expect(tools.wiki_read_file!.execute("call-read", { path: "harness.config.json" })).rejects.toThrow(
      /not allowed/,
    );
    await expect(tools.wiki_stage_observation!.execute("call-stage", {
      path: "wiki/observations/../../escape.md",
      content: fixtureLedger(),
    })).rejects.toThrow(/must target wiki\/observations/);
  });

  it("does not expose ingest-log appends to model commands", () => {
    for (const command of ["ingest", "ingest-segmented", "review", "review-segmented"] as const) {
      expect(toolMap(command).wiki_append_ledger).toBeUndefined();
    }
  });

  it("does not expose full-file reads during segmented ingest", () => {
    expect(toolMap("ingest-segmented").wiki_read_file).toBeUndefined();
  });

  it("rejects review observation writes that shrink the ledger", async () => {
    const tools = toolMap("review-segmented");
    const path = "wiki/observations/testdialogue.md";
    const existingLedger = [
      fixtureLedger(),
      fixtureLedger({
        observationId: "obs_testdialogue_0002",
        span: "2b-3a",
        observation: "The second span contains a distinct procedural exchange.",
      }),
    ].join("\n\n");
    writeFileSync(join(root, path), existingLedger, "utf8");

    await expect(tools.wiki_write_observation!.execute("call-review-write", {
      path,
      content: fixtureLedger({ observation: "The review tries to keep only one observation." }),
    })).rejects.toThrow(/preserve ledger observation count/);

    expect([...readFixture(path).matchAll(/^observation_id:/gmu)]).toHaveLength(2);
  });

  it("updates review statuses without rewriting non-target observations", async () => {
    const ingestTools = toolMap("ingest-segmented");
    const tools = toolMap("review-segmented");
    const path = "wiki/observations/testdialogue.md";
    await ingestTools.wiki_append_observations!.execute("call-append-review-fixture", {
      path,
      content: [
        fixtureLedger(),
        fixtureLedger({
          observationId: "obs_testdialogue_0002",
          span: "2b-3a",
          observation: "The second span contains a distinct procedural exchange.",
        }),
      ].join("\n\n"),
    });

    await tools.wiki_update_review_statuses!.execute("call-review-status", {
      path,
      updates: [{ observation_id: "obs_testdialogue_0001", review_status: "accepted" }],
    });

    const ledger = readFixture(path);
    expect(ledger).toContain("observation_id: obs_testdialogue_0001");
    expect(ledger).toContain("observation_id: obs_testdialogue_0002");
    expect(ledger).toContain("review_status: accepted");
    expect(ledger).toContain("review_status: unreviewed");
  });

  it("appends new observation records even when incoming draft ids collide", async () => {
    const tools = toolMap("ingest-segmented");
    const path = "wiki/observations/testdialogue.md";

    await tools.wiki_append_observations!.execute("call-append-1", {
      path,
      content: fixtureLedger(),
    });
    await tools.wiki_append_observations!.execute("call-append-2", {
      path,
      content: [
        fixtureLedger({
          observationId: "obs_testdialogue_0001",
          span: "2b-3a",
          observation: "The second span contains a distinct procedural exchange.",
        }),
      ].join("\n\n"),
    });

    const ledger = readFixture(path);
    expect([...ledger.matchAll(/^observation_id:/gmu)]).toHaveLength(2);
    expect(ledger).toContain("observation_id: obs_testdialogue_0001");
    expect(ledger).toContain("observation_id: obs_testdialogue_0002");

  });

  it("terminates segmented ingest when an empty append marks no observations", async () => {
    const tools = toolMap("ingest-segmented");
    const path = "wiki/observations/testdialogue.md";

    const result = await tools.wiki_append_observations!.execute("call-append-empty", {
      path,
      content: "",
    });

    expect(result.terminate).toBe(true);
  });

  it("assigns append observation ids from persisted records after rejected drafts", async () => {
    const tools = toolMap("ingest-segmented");
    const path = "wiki/observations/testdialogue.md";

    await tools.wiki_append_observations!.execute("call-append-1", {
      path,
      content: fixtureLedger(),
    });

    await expect(tools.wiki_append_observations!.execute("call-append-2", {
      path,
      content: fixtureLedger({
        observationId: "obs_testdialogue_0002",
        span: "2b-3a",
        observation: "ΣΩ. Greek text was copied into prose.",
      }),
    })).rejects.toThrow(/greek_outside_terms/);

    await tools.wiki_append_observations!.execute("call-append-3", {
      path,
      content: fixtureLedger({
        observationId: "obs_testdialogue_0003",
        span: "2b-3a",
        observation: "The second span contains a distinct procedural exchange.",
      }),
    });

    const ledger = readFixture(path);
    expect([...ledger.matchAll(/^observation_id:/gmu)]).toHaveLength(2);
    expect(ledger).toContain("observation_id: obs_testdialogue_0001");
    expect(ledger).toContain("observation_id: obs_testdialogue_0002");
    expect(ledger).not.toContain("observation_id: obs_testdialogue_0003");

  });

  it("rejects bare YAML observation appends instead of silently no-oping", async () => {
    const tools = toolMap("ingest-segmented");
    const path = "wiki/observations/testdialogue.md";

    await expect(tools.wiki_append_observations!.execute("call-append-1", {
      path,
      content: fixtureLedger().replaceAll("```yaml\n", "").replaceAll("\n```", ""),
    })).rejects.toThrow(/fenced YAML/);

    expect(existsSync(join(root, path))).toBe(false);
  });

  it("caps source-span calls during segmented ingest", async () => {
    const tools = toolMap("ingest-segmented");

    for (let index = 0; index < 6; index += 1) {
      await tools.wiki_source_span!.execute(`call-source-${index}`, {
        dialogue: "testdialogue",
        stephanus_span: "2a-2b",
      });
    }

    await expect(tools.wiki_source_span!.execute("call-source-limit", {
      dialogue: "testdialogue",
      stephanus_span: "2b-3a",
    })).rejects.toThrow(/source-span call limit exceeded/);
  });

  it("allows distinct observations on the same source span", async () => {
    const tools = toolMap("ingest-segmented");
    const path = "wiki/observations/testdialogue.md";

    await tools.wiki_append_observations!.execute("call-append-1", {
      path,
      content: fixtureLedger(),
    });

    await tools.wiki_append_observations!.execute("call-append-2", {
      path,
      content: fixtureLedger({
        observationId: "obs_testdialogue_0002",
        span: "2a-2b",
        observation: "The speaker also gives a distinct procedural answer.",
      }),
    });

    const ledger = readFixture(path);
    expect([...ledger.matchAll(/^observation_id:/gmu)]).toHaveLength(2);
    expect(ledger).toContain("The speaker makes a testable procedural claim.");
    expect(ledger).toContain("The speaker also gives a distinct procedural answer.");
  });

  it("rejects an exact duplicate source-bound observation", async () => {
    const tools = toolMap("ingest-segmented");
    const path = "wiki/observations/testdialogue.md";

    await tools.wiki_append_observations!.execute("call-append-1", {
      path,
      content: fixtureLedger(),
    });

    await expect(tools.wiki_append_observations!.execute("call-append-2", {
      path,
      content: fixtureLedger({
        observationId: "obs_testdialogue_0002",
        span: "2a-2b",
      }),
    })).rejects.toThrow(/Duplicate source-bound observation/);

    expect([...readFixture(path).matchAll(/^observation_id:/gmu)]).toHaveLength(1);
  });

  it("appends claim records with assigned ids", async () => {
    const tools = toolMap("claims-segmented");
    const path = "wiki/claims/testdialogue.md";

    await tools.wiki_append_claims!.execute("call-claim-append-1", {
      path,
      content: fixtureClaimLedger(),
    });
    await tools.wiki_append_claims!.execute("call-claim-append-2", {
      path,
      content: fixtureClaimLedger({ claimId: "claim_testdialogue_0001", span: "2b-3a" }),
    });

    const ledger = readFixture(path);
    expect([...ledger.matchAll(/^claim_id:/gmu)]).toHaveLength(2);
    expect(ledger).toContain("claim_id: claim_testdialogue_0001");
    expect(ledger).toContain("claim_id: claim_testdialogue_0002");
  });

  it("canonicalizes segmented claim source refs before validation", async () => {
    const tools = toolMap("claims-segmented");
    const path = "wiki/claims/testdialogue.md";
    const { source_ref } = resolveSourceSpan("testdialogue", "2a-2b");
    const corruptedHash = "0".repeat(64);

    await tools.wiki_append_claims!.execute("call-claim-canonical-source-ref", {
      path,
      content: fixtureClaimLedger().replaceAll(source_ref.text_sha256, corruptedHash),
    });

    const ledger = readFixture(path);
    expect(ledger).toContain(`text_sha256: "${source_ref.text_sha256}"`);
    expect(ledger).not.toContain(corruptedHash);
  });

  it("canonicalizes segmented claim source ref stubs before validation", async () => {
    const tools = toolMap("claims-segmented");
    const path = "wiki/claims/testdialogue.md";
    const { source_ref } = resolveSourceSpan("testdialogue", "2a-2b");

    await tools.wiki_append_claims!.execute("call-claim-canonical-source-ref-stubs", {
      path,
      content: fixtureClaimLedgerWithSourceRefStubs(),
    });

    const ledger = readFixture(path);
    expect(ledger).toContain(`text_sha256: "${source_ref.text_sha256}"`);
    expect(ledger).toContain(`start_char: ${source_ref.start_char}`);
    expect(ledger).toContain(`end_char: ${source_ref.end_char}`);
  });

  it("rejects segmented claim citations outside the current segment bounds", async () => {
    const allowed = resolveSourceSpan("testdialogue", "2a-2b").source_ref;
    const tools = toolMap("claims-segmented", {
      claimSegmentBounds: {
        dialogue: "testdialogue",
        span: "2a-2b",
        startChar: allowed.start_char,
        endChar: allowed.end_char,
      },
    });
    const path = "wiki/claims/testdialogue.md";

    await expect(
      tools.wiki_append_claims!.execute("call-claim-out-of-segment-source-ref", {
        path,
        content: fixtureClaimLedgerWithSourceRefStubs({ span: "2b-3a" }),
      }),
    ).rejects.toThrow(/outside current segment/);

    expect(existsSync(join(root, path))).toBe(false);
  });

  it("updates claim review statuses without changing non-target claims", async () => {
    const appendTools = toolMap("claims-segmented");
    const reviewTools = toolMap("claims-review-segmented");
    const path = "wiki/claims/testdialogue.md";
    writeFileSync(
      join(root, "wiki/observations/testdialogue.md"),
      fixtureLedger({ reviewStatus: "accepted", supportsClaimIds: ["claim_testdialogue_0001"] }),
      "utf8",
    );

    await appendTools.wiki_append_claims!.execute("call-claim-append-review-fixture", {
      path,
      content: [
        fixtureClaimLedger({ observationIds: ["obs_testdialogue_0001"] }),
        fixtureClaimLedger({ claimId: "claim_testdialogue_0002", span: "2b-3a" }),
      ].join("\n\n"),
    });

    await reviewTools.wiki_update_claim_review_statuses!.execute("call-claim-review-status", {
      path,
      updates: [{ claim_id: "claim_testdialogue_0001", review_status: "accepted" }],
    });

    const ledger = readFixture(path);
    expect(ledger).toContain("claim_id: claim_testdialogue_0001");
    expect(ledger).toContain("claim_id: claim_testdialogue_0002");
    expect(ledger).toContain("review_status: accepted");
    expect(ledger).toContain("review_status: unreviewed");
  });

  it("appends relation records and updates relation review statuses", async () => {
    const claimPath = "wiki/claims/testdialogue.md";
    writeFileSync(
      join(root, claimPath),
      [
        fixtureClaimLedger({ claimId: "claim_testdialogue_0001", reviewStatus: "accepted" }),
        fixtureClaimLedger({
          claimId: "claim_testdialogue_0002",
          span: "2b-3a",
          content: "The speaker makes a second testable claim.",
          reviewStatus: "accepted",
        }),
      ].join("\n\n"),
      "utf8",
    );

    const appendTools = toolMap("relations-segmented");
    const reviewTools = toolMap("relations-review-segmented");
    const relationPath = "wiki/relations/testdialogue.md";
    await appendTools.wiki_append_relations!.execute("call-relation-append", {
      path: relationPath,
      content: `\`\`\`yaml
relation_id: rel_testdialogue_0000
pair_id: pair_testdialogue_00001
claim_a: claim_testdialogue_0001
claim_b: claim_testdialogue_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Testdialogue accepted claim coverage only.
review_status: unreviewed
\`\`\``,
    });

    expect(readFixture(relationPath)).toContain("relation_id: rel_testdialogue_0001");
    expect(readFixture(relationPath)).toContain("pair_id: pair_testdialogue_00001");

    await reviewTools.wiki_update_relation_review_statuses!.execute("call-relation-review", {
      path: relationPath,
      updates: [{ relation_id: "rel_testdialogue_0001", review_status: "accepted" }],
    });

    expect(readFixture(relationPath)).toContain("review_status: accepted");
    expect(readFixture(relationPath)).toContain("basis: The two claim contents pull in different directions.");
  });

  it("assigns a fresh ledger pair id after matching the injected claim-pair target", async () => {
    const claimPath = "wiki/claims/testdialogue.md";
    writeFileSync(
      join(root, claimPath),
      [
        fixtureClaimLedger({ claimId: "claim_testdialogue_0001", reviewStatus: "accepted" }),
        fixtureClaimLedger({ claimId: "claim_testdialogue_0002", span: "2b-3a", reviewStatus: "accepted" }),
        fixtureClaimLedger({ claimId: "claim_testdialogue_0003", reviewStatus: "accepted" }),
        fixtureClaimLedger({ claimId: "claim_testdialogue_0004", span: "2b-3a", reviewStatus: "accepted" }),
      ].join("\n\n"),
      "utf8",
    );

    const relationPath = "wiki/relations/testdialogue.md";
    const genericTools = toolMap("relations-segmented");
    await genericTools.wiki_append_relations!.execute("call-existing-relation", {
      path: relationPath,
      content: `\`\`\`yaml
relation_id: rel_testdialogue_0000
pair_id: pair_testdialogue_00001
claim_a: claim_testdialogue_0003
claim_b: claim_testdialogue_0004
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Testdialogue accepted claim coverage only.
review_status: unreviewed
\`\`\``,
    });

    const candidateKey = relationCandidateKey("testdialogue", "claim_testdialogue_0001", "claim_testdialogue_0002");
    const targetTools = toolMap("relations-segmented", {
      relationTargets: [
        {
          candidateKey,
          claimA: "claim_testdialogue_0001",
          claimB: "claim_testdialogue_0002",
          diagnosticPairId: "pair_testdialogue_00001",
        },
      ],
    });
    await targetTools.wiki_append_relations!.execute("call-target-relation", {
      path: relationPath,
      content: `\`\`\`yaml
relation_id: rel_testdialogue_0000
pair_id: pair_testdialogue_00001
claim_a: claim_testdialogue_0001
claim_b: claim_testdialogue_0002
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within Testdialogue accepted claim coverage only.
review_status: unreviewed
\`\`\``,
    });

    const ledger = readFixture(relationPath);
    expect(ledger).toContain("pair_id: pair_testdialogue_00001\nclaim_a: claim_testdialogue_0003");
    expect(ledger).toContain("pair_id: pair_testdialogue_00002\nclaim_a: claim_testdialogue_0001");
  });

  it("rejects an empty relation append when injected targets are nonempty", async () => {
    const claimPath = "wiki/claims/testdialogue.md";
    writeFileSync(
      join(root, claimPath),
      [
        fixtureClaimLedger({ claimId: "claim_testdialogue_0001", reviewStatus: "accepted" }),
        fixtureClaimLedger({ claimId: "claim_testdialogue_0002", span: "2b-3a", reviewStatus: "accepted" }),
      ].join("\n\n"),
      "utf8",
    );

    const candidateKey = relationCandidateKey("testdialogue", "claim_testdialogue_0001", "claim_testdialogue_0002");
    const targetTools = toolMap("relations-segmented", {
      relationTargets: [
        {
          candidateKey,
          claimA: "claim_testdialogue_0001",
          claimB: "claim_testdialogue_0002",
          diagnosticPairId: "pair_testdialogue_00001",
        },
      ],
    });

    await expect(
      targetTools.wiki_append_relations!.execute("call-empty-target-relation", {
        path: "wiki/relations/testdialogue.md",
        content: "",
      }),
    ).rejects.toThrow("omitted target candidate");

    expect(existsSync(join(root, "wiki/relations/testdialogue.md"))).toBe(false);
  });

  it("rejects a relation that reverses an injected cross-dialogue claim-pair target", async () => {
    const claimPath = "wiki/claims/testdialogue.md";
    const otherClaimPath = "wiki/claims/other.md";
    writeFileSync(
      join(root, claimPath),
      fixtureClaimLedger({ claimId: "claim_testdialogue_0001", reviewStatus: "accepted" }),
      "utf8",
    );
    writeFileSync(
      join(root, otherClaimPath),
      fixtureClaimLedger({ claimId: "claim_other_0001", reviewStatus: "accepted" }),
      "utf8",
    );

    const candidateKey = relationCandidateKey("cross-dialogue", "claim_other_0001", "claim_testdialogue_0001");
    const targetTools = toolMap("relations-segmented", {
      relationTargets: [
        {
          candidateKey,
          claimA: "claim_other_0001",
          claimB: "claim_testdialogue_0001",
          diagnosticPairId: "pair_cross-dialogue_00001",
        },
      ],
    });

    await expect(
      targetTools.wiki_append_relations!.execute("call-reversed-cross-relation", {
        path: "wiki/relations/cross-dialogue.md",
        content: `\`\`\`yaml
relation_id: rel_cross-dialogue_0000
pair_id: pair_cross-dialogue_00001
claim_a: claim_testdialogue_0001
claim_b: claim_other_0001
relation_kind: tension
resolution: standing
basis: The two claim contents pull in different directions.
limits: Checked within accepted cross-dialogue claim coverage only.
review_status: unreviewed
\`\`\``,
      }),
    ).rejects.toThrow("preserve target claim order");

    expect(existsSync(join(root, "wiki/relations/cross-dialogue.md"))).toBe(false);
  });

  it("does not expose source-span lookup during segmented claim extraction", () => {
    const tools = toolMap("claims-segmented");
    const reviewTools = toolMap("claims-review-segmented");

    expect(tools.wiki_append_claims).toBeDefined();
    expect(tools.wiki_source_span).toBeUndefined();
    expect(reviewTools.wiki_source_span).toBeDefined();
  });
});

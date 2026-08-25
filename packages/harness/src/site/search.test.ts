import { describe, expect, it } from "bun:test";
import {
  CatalogIndexError,
  buildExactIdIndex,
  buildSearchIndex,
  indexErrorStatus,
  lookupExactId,
  malformedIndexResource,
  matchesStructuralFilters,
  normalizeSearchText,
  parseExactIdManifest,
  parseExactIdShard,
  parseSearchManifest,
  parseSearchShard,
  planSearchShardLoads,
  projectSearchRecord,
  searchRecords,
  selectExactIdShards,
  selectManifestShards,
  truncateCodePoints,
  type SearchRecord,
} from "./search.js";

const records: SearchRecord[] = [
  {
    id: "claim_meno_0002",
    target: "dialogues/meno/claims.html#claim_meno_0002",
    kind: "claim",
    dialogue: "meno",
    status: "accepted",
    speaker: "Socrates",
    title: "Knowledge",
    snippet: "A recollection argument about knowledge.",
  },
  {
    id: "claim_meno_0001",
    target: "dialogues/meno/claims.html#claim_meno_0001",
    kind: "claim",
    dialogue: "meno",
    status: "accepted",
    speaker: "Meno",
    title: "Knowledge begins",
    snippet: "An inquiry into virtue.",
  },
  {
    id: "obs_meno_0001",
    target: "dialogues/meno/observations-a.html#obs_meno_0001",
    kind: "observation",
    dialogue: "meno",
    family: "answer-form",
    label: "direct",
    status: "unreviewed",
    title: "A turn toward knowledge",
  },
  {
    id: "rel_meno_0001",
    target: "dialogues/meno/relations.html#rel_meno_0001",
    kind: "relation",
    dialogue: "meno",
    relationKind: "tension",
    resolution: "standing",
    title: "Knowledge remains contested",
  },
];

describe("Unicode-safe search text", () => {
  it("normalizes case, canonical forms, diacritics, punctuation, and whitespace", () => {
    expect(normalizeSearchText("  MÉNO—ἀρετή\n\tInquiry ")).toBe("meno αρετη inquiry");
    expect(normalizeSearchText("Me\u0301no")).toBe(normalizeSearchText("Méno"));
  });

  it("truncates by Unicode code points and counts the ellipsis in the bound", () => {
    expect(truncateCodePoints("A😀BC", 3)).toBe("A😀…");
    expect(Array.from(truncateCodePoints("A😀BC", 3))).toHaveLength(3);
    expect(truncateCodePoints("😀", 1)).toBe("😀");
    expect(truncateCodePoints("AB", 1)).toBe("…");
    expect(truncateCodePoints("AB", 0)).toBe("");
  });
});

describe("deterministic static index projections", () => {
  it("builds sorted, byte-stable exact-ID manifests and extensible kind/scope shards", () => {
    const source = [
      { id: "turn_meno_0002", target: "dialogues/meno/turns.html#turn_meno_0002", kind: "turn", scope: "meno" },
      { id: "claim_meno_0002", target: "dialogues/meno/claims.html#claim_meno_0002", kind: "claim", scope: "meno" },
      { id: "claim_meno_0001", target: "dialogues/meno/claims.html#claim_meno_0001", kind: "claim", scope: "meno" },
      { id: "claim_crito_0001", target: "dialogues/crito/claims.html#claim_crito_0001", kind: "claim", scope: "crito" },
    ];
    const built = buildExactIdIndex(source);
    const reversed = buildExactIdIndex([...source].reverse());

    expect(built.manifestJson).toBe(reversed.manifestJson);
    expect(built.shards.map((shard) => `${shard.kind}:${shard.scope}`)).toEqual([
      "claim:crito",
      "claim:meno",
      "turn:meno",
    ]);
    expect(built.shards[1]?.records.map((record) => record.id)).toEqual([
      "claim_meno_0001",
      "claim_meno_0002",
    ]);
    expect(built.manifest.shards[1]).toMatchObject({
      firstId: "claim_meno_0001",
      lastId: "claim_meno_0002",
      count: 2,
    });
  });

  it("emits only allowlisted neutral search fields and code-point-bounded snippets", () => {
    const source = {
      id: "obs_meno_0001",
      target: "dialogues/meno/index.html#obs_meno_0001",
      kind: "observation",
      scope: "meno",
      dialogue: "meno",
      title: "  Neutral   title ",
      snippet: "😀 alpha beta",
      greekExcerpt: "MUST NOT LEAK",
      textSha256: "MUST NOT LEAK",
      tokenIds: ["MUST NOT LEAK"],
      body: "MUST NOT LEAK",
      audio: { path: "MUST NOT LEAK" },
    };
    const projected = projectSearchRecord(source, 7);
    const built = buildSearchIndex([source], { maxSnippetCodePoints: 7 });

    expect(projected).toEqual({
      id: "obs_meno_0001",
      target: "dialogues/meno/index.html#obs_meno_0001",
      kind: "observation",
      dialogue: "meno",
      title: "Neutral title",
      snippet: "😀 alph…",
    });
    expect(built.shards[0]?.json).not.toContain("MUST NOT LEAK");
    expect(Object.keys(JSON.parse(built.shards[0]!.json).records[0])).not.toContain("scope");
    expect(built.shards[0]?.records[0]).toEqual(projected);
  });

  it("sorts search records, shards, and manifests regardless of input order", () => {
    const inputs = records.map((record) => ({ ...record, scope: record.dialogue }));
    const a = buildSearchIndex(inputs);
    const b = buildSearchIndex([...inputs].reverse());

    expect(a.manifestJson).toBe(b.manifestJson);
    expect(a.shards.map((shard) => shard.json)).toEqual(b.shards.map((shard) => shard.json));
    expect(a.shards.map((shard) => `${shard.kind}:${shard.scope}`)).toEqual([
      "claim:meno",
      "observation:meno",
      "relation:meno",
    ]);
  });

  it("rejects duplicate IDs instead of producing ambiguous assets", () => {
    expect(() => buildSearchIndex([{ ...records[0]! }, { ...records[0]! }])).toThrow("duplicate record ID");
  });

  it("bounds both title and snippet projections and rejects an oversized natural shard", () => {
    const built = buildSearchIndex(
      [{ ...records[0]!, scope: "meno", title: "A😀BCD", snippet: "Z😀YXW" }],
      { maxTitleCodePoints: 4, maxSnippetCodePoints: 4 },
    );
    expect(built.shards[0]?.records[0]).toMatchObject({ title: "A😀B…", snippet: "Z😀Y…" });
    expect(() =>
      buildSearchIndex([{ ...records[0]!, scope: "meno" }], { maxShardBytes: 50 }),
    ).toThrow("refine its scope");
    expect(() =>
      buildExactIdIndex(
        [{ id: "claim_meno_0001", target: "target", kind: "claim", scope: "meno" }],
        "assets/index",
        50,
      ),
    ).toThrow("refine its scope");
  });
});

describe("shard selection and exact lookup", () => {
  const exact = buildExactIdIndex([
    { id: "claim_crito_0001", target: "crito-target", kind: "claim", scope: "crito" },
    { id: "claim_meno_0001", target: "meno-target-1", kind: "claim", scope: "meno" },
    { id: "claim_meno_0003", target: "meno-target-3", kind: "claim", scope: "meno" },
    { id: "obs_meno_0001", target: "observation-target", kind: "observation", scope: "meno" },
  ]);
  const search = buildSearchIndex(records.map((record) => ({ ...record, scope: record.dialogue }))).manifest;

  it("selects by extensible kind and scope, then safely prunes exact-ID ranges", () => {
    expect(selectManifestShards(exact.manifest, { kind: "claim", scope: "meno" })).toHaveLength(1);
    expect(selectManifestShards(exact.manifest, { scope: ["crito", "missing"] })).toHaveLength(1);
    expect(selectExactIdShards(exact.manifest, "claim_meno_0002").map((shard) => shard.scope)).toEqual([
      "meno",
    ]);
    expect(selectExactIdShards(exact.manifest, "does_not_exist")).toEqual([]);
  });

  it("does not plan a fetch for a blank query and loads only selected search scopes", () => {
    expect(planSearchShardLoads(search, { query: "   ", filters: { kind: "claim" } })).toEqual({
      shouldFetch: false,
      reason: "blank-query",
      shards: [],
    });
    const selected = planSearchShardLoads(search, {
      query: "knowledge",
      filters: { kind: "claim", dialogue: "meno" },
    });
    expect(selected.shouldFetch).toBe(true);
    expect(selected.reason).toBe("search-intent");
    expect(selected.shards.map((shard) => `${shard.kind}:${shard.scope}`)).toEqual(["claim:meno"]);
    expect(planSearchShardLoads(search, { query: "x", filters: { dialogue: "absent" } }).reason).toBe(
      "no-matching-shards",
    );
  });

  it("resolves an exact ID from the smallest plausible loaded shard", () => {
    const descriptor = exact.manifest.shards.find(
      (shard) => shard.kind === "claim" && shard.scope === "meno",
    )!;
    const builtShard = exact.shards.find((shard) => shard.path === descriptor.path)!;
    const loaded = new Map([
      [
        descriptor.path,
        parseExactIdShard(builtShard.json, descriptor.path),
      ],
    ]);
    expect(lookupExactId("claim_meno_0001", exact.manifest, loaded)).toBe("meno-target-1");
  });

  it("distinguishes unknown IDs from unavailable shards", () => {
    expect(() => lookupExactId("does_not_exist", exact.manifest, new Map())).toThrow(
      expect.objectContaining({ code: "unknown-id" }),
    );
    expect(() => lookupExactId("claim_meno_0001", exact.manifest, new Map())).toThrow(
      expect.objectContaining({ code: "missing-shard" }),
    );
  });
});

describe("pure matching, ranking, filtering, and result status", () => {
  it("ranks exact ID, exact field, prefix, substring, then stable ID", () => {
    const response = searchRecords(
      [
        ...records,
        { id: "z-exact", target: "z", kind: "claim", title: "claim_meno_0002" },
        { id: "a-prefix", target: "a", kind: "claim", title: "claim_meno_0002 continuation" },
        { id: "b-substring", target: "b", kind: "claim", title: "See claim_meno_0002 here" },
      ],
      { query: "claim_meno_0002" },
    );
    expect(response.results.map(({ record, match }) => `${match}:${record.id}`)).toEqual([
      "exact-id:claim_meno_0002",
      "exact-field:z-exact",
      "prefix:a-prefix",
      "substring:b-substring",
    ]);

    const ties = searchRecords(records, { query: "knowledge", filters: { kind: "claim" } });
    expect(ties.results.map(({ record }) => record.id)).toEqual(["claim_meno_0002", "claim_meno_0001"]);
    expect(ties.results.map(({ match }) => match)).toEqual(["exact-field", "prefix"]);

    const stable = searchRecords(
      [
        { id: "z-record", target: "z", kind: "claim", title: "contains needle here" },
        { id: "a-record", target: "a", kind: "claim", title: "also contains needle here" },
      ],
      { query: "needle" },
    );
    expect(stable.results.map(({ record }) => record.id)).toEqual(["a-record", "z-record"]);
    expect(stable.results.every(({ match }) => match === "substring")).toBe(true);
  });

  it("applies neutral structural filters exactly after Unicode normalization", () => {
    expect(matchesStructuralFilters(records[0]!, { dialogue: "MÉNO", speaker: "socrates" })).toBe(true);
    expect(matchesStructuralFilters(records[0]!, { status: "unreviewed" })).toBe(false);
    const response = searchRecords(records, {
      query: "knowledge",
      filters: { kind: "observation", family: "answer form", status: "UNREVIEWED" },
    });
    expect(response.results.map(({ record }) => record.id)).toEqual(["obs_meno_0001"]);
  });

  it("returns idle, no-results, bounded, and refine-query states", () => {
    expect(searchRecords(records, { query: "" }).status).toMatchObject({ state: "idle", shown: 0 });
    expect(searchRecords(records, { query: "not present" }).status).toEqual({
      state: "empty",
      message: "No results.",
      total: 0,
      shown: 0,
      capped: false,
    });
    const capped = searchRecords(records, { query: "meno" }, 2);
    expect(capped.results).toHaveLength(2);
    expect(capped.status).toEqual({
      state: "results",
      message: "Showing 2 of 4 results. Refine your query.",
      total: 4,
      shown: 2,
      capped: true,
    });
  });
});

describe("manifest and shard error helpers", () => {
  it("round-trips valid version-1 assets", () => {
    const exact = buildExactIdIndex([
      { id: "claim_meno_0001", target: "target", kind: "claim", scope: "meno" },
    ]);
    const search = buildSearchIndex([{ ...records[0]!, scope: "meno" }]);

    expect(parseExactIdManifest(exact.manifestJson)).toEqual(exact.manifest);
    expect(parseExactIdShard(exact.shards[0]!.json).records).toEqual(exact.shards[0]!.records);
    expect(parseSearchManifest(search.manifestJson)).toEqual(search.manifest);
    expect(parseSearchShard(search.shards[0]!.json).records).toEqual(search.shards[0]!.records);
  });

  it("reports malformed manifests and shards without collapsing them into unknown IDs", () => {
    for (const action of [
      () => parseExactIdManifest("{", "exact-ID manifest"),
      () => parseSearchManifest({ version: 2, shards: [] }, "search manifest"),
      () => parseSearchManifest({ version: 2, shards: [] }, "assets/catalog-v1.json"),
    ]) {
      expect(action).toThrow(expect.objectContaining({ code: "malformed-manifest" }));
    }
    expect(() =>
      parseSearchShard(
        { version: 1, kind: "claim", scope: "meno", records: [{ id: "x", target: "x", kind: "turn" }] },
        "assets/search-claim-meno.json",
      ),
    ).toThrow(expect.objectContaining({ code: "malformed-shard" }));
    expect(() =>
      parseSearchShard(
        {
          version: 1,
          kind: "claim",
          scope: "meno",
          records: [{ id: "x", target: "x", kind: "claim", greekExcerpt: "must not ship" }],
        },
        "assets/search-claim-meno.json",
      ),
    ).toThrow("unexpected field greekExcerpt");
  });

  it("turns load failures into a polite error status", () => {
    const error = malformedIndexResource("assets/search.json", "truncated JSON");
    expect(error).toBeInstanceOf(CatalogIndexError);
    expect(indexErrorStatus(error)).toEqual({
      state: "error",
      message: "Malformed index assets/search.json: truncated JSON",
      total: 0,
      shown: 0,
      capped: false,
    });
    expect(indexErrorStatus(new Error("secret internal detail")).message).not.toContain("secret");
  });
});

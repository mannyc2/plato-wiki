const INDEX_VERSION = 1 as const;
const DEFAULT_RESULT_CAP = 50;
const DEFAULT_TITLE_CODE_POINTS = 120;
const DEFAULT_SNIPPET_CODE_POINTS = 240;
export const STATIC_INDEX_SHARD_MAX_BYTES = 1_000_000;

export type RecordKind = string;

export type ShardDescriptor = {
  kind: RecordKind;
  scope: string;
  path: string;
  count: number;
};

export type ExactIdShardDescriptor = ShardDescriptor & {
  firstId: string;
  lastId: string;
};

export type ExactIdManifest = {
  version: typeof INDEX_VERSION;
  shards: ExactIdShardDescriptor[];
};

export type SearchManifest = {
  version: typeof INDEX_VERSION;
  shards: ShardDescriptor[];
};

export type ExactIdRecord = {
  id: string;
  target: string;
  kind: RecordKind;
  scope: string;
};

export type ExactIdEntry = Pick<ExactIdRecord, "id" | "target">;

export type ExactIdShard = {
  version: typeof INDEX_VERSION;
  kind: RecordKind;
  scope: string;
  records: ExactIdEntry[];
};

/**
 * The deliberately small, source-neutral record emitted to static search
 * assets. Adding a new record kind does not require changing this type.
 */
export type SearchRecord = {
  id: string;
  target: string;
  kind: RecordKind;
  dialogue?: string;
  stephanusSpan?: string;
  family?: string;
  label?: string;
  status?: string;
  speaker?: string;
  relationKind?: string;
  resolution?: string;
  title?: string;
  snippet?: string;
};

export type SearchRecordInput = SearchRecord & {
  /** Used for sharding only; it is not emitted in a search record. */
  scope?: string;
};

export type SearchShard = {
  version: typeof INDEX_VERSION;
  kind: RecordKind;
  scope: string;
  records: SearchRecord[];
};

export type BuiltExactIdIndex = {
  manifest: ExactIdManifest;
  manifestJson: string;
  shards: Array<ExactIdShardDescriptor & { records: ExactIdEntry[]; json: string }>;
};

export type BuiltSearchIndex = {
  manifest: SearchManifest;
  manifestJson: string;
  shards: Array<ShardDescriptor & { records: SearchRecord[]; json: string }>;
};

export type ShardSelector = {
  kind?: string;
  scope?: string | readonly string[];
};

export type SearchFilters = {
  kind?: string;
  dialogue?: string;
  family?: string;
  label?: string;
  status?: string;
  speaker?: string;
  relationKind?: string;
  resolution?: string;
};

export type SearchIntent = {
  query: string;
  filters?: SearchFilters;
  /** Overrides dialogue-based scope inference when a different shard scope is selected. */
  scope?: string | readonly string[];
};

export type SearchShardLoadPlan = {
  shouldFetch: boolean;
  reason: "blank-query" | "no-matching-shards" | "search-intent";
  shards: ShardDescriptor[];
};

export type MatchTier = "exact-id" | "exact-field" | "prefix" | "substring";

export type RankedSearchRecord = {
  record: SearchRecord;
  match: MatchTier;
};

export type SearchStatus = {
  state: "idle" | "results" | "empty" | "error";
  message: string;
  total: number;
  shown: number;
  capped: boolean;
};

export type SearchResponse = {
  results: RankedSearchRecord[];
  status: SearchStatus;
};

export type CatalogIndexErrorCode =
  | "unknown-id"
  | "missing-shard"
  | "malformed-manifest"
  | "malformed-shard";

export class CatalogIndexError extends Error {
  readonly code: CatalogIndexErrorCode;
  readonly resource: string;
  readonly detail: string | undefined;

  constructor(code: CatalogIndexErrorCode, resource: string, message: string, detail?: string) {
    super(message);
    this.name = "CatalogIndexError";
    this.code = code;
    this.resource = resource;
    this.detail = detail;
  }
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareDescriptors(a: ShardDescriptor, b: ShardDescriptor) {
  return compareText(a.kind, b.kind) || compareText(a.scope, b.scope) || compareText(a.path, b.path);
}

function compactText(value: string | undefined) {
  if (value === undefined) return undefined;
  return value.replace(/\s+/gu, " ").trim();
}

function requiredText(value: unknown, field: string, resource: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw malformedIndexResource(resource, `${field} must be a non-blank string`);
  }
  return value;
}

function optionalText(value: unknown, field: string, resource: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw malformedIndexResource(resource, `${field} must be a string when present`);
  }
  return value;
}

function asObject(value: unknown, resource: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw malformedIndexResource(resource, "expected a JSON object");
  }
  return value as Record<string, unknown>;
}

function assertAllowedKeys(object: Record<string, unknown>, allowed: readonly string[], resource: string) {
  const allowedSet = new Set(allowed);
  const unexpected = Object.keys(object).find((key) => !allowedSet.has(key));
  if (unexpected) throw malformedIndexResource(resource, `unexpected field ${unexpected}`);
}

function parseJson(input: string | unknown, resource: string) {
  if (typeof input !== "string") return input;
  try {
    return JSON.parse(input) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw malformedIndexResource(resource, `invalid JSON: ${detail}`);
  }
}

function assertVersion(value: unknown, resource: string) {
  if (value !== INDEX_VERSION) {
    throw malformedIndexResource(resource, `unsupported version ${String(value)}`);
  }
}

function assertCount(value: unknown, resource: string) {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw malformedIndexResource(resource, "count must be a non-negative safe integer");
  }
  return value as number;
}

function filenameSegment(value: string) {
  return [...new TextEncoder().encode(value)]
    .map((byte) => {
      const character = String.fromCharCode(byte);
      return /[A-Za-z0-9-]/u.test(character) ? character : `~${byte.toString(16).padStart(2, "0")}`;
    })
    .join("");
}

function assetPath(basePath: string, prefix: "ids" | "search", kind: string, scope: string) {
  const base = basePath.replace(/\/+$/gu, "");
  return `${base}/${prefix}-${filenameSegment(kind)}-${filenameSegment(scope)}.json`;
}

function groupKey(kind: string, scope: string) {
  return `${kind}\u0000${scope}`;
}

function assertUniqueIds<T extends { id: string }>(records: readonly T[], resource: string) {
  const seen = new Set<string>();
  for (const record of records) {
    if (record.id.trim() === "") throw malformedIndexResource(resource, "record ID must not be blank");
    if (seen.has(record.id)) throw malformedIndexResource(resource, `duplicate record ID ${record.id}`);
    seen.add(record.id);
  }
}

function stableJson(value: unknown) {
  return `${JSON.stringify(value)}\n`;
}

function assertShardByteBudget(json: string, path: string, maxBytes: number) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError("maxShardBytes must be a positive safe integer");
  }
  const bytes = new TextEncoder().encode(json).byteLength;
  if (bytes >= maxBytes) {
    throw malformedIndexResource(path, `shard is ${bytes} bytes; refine its scope below ${maxBytes} bytes`);
  }
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Mark}+/gu, "")
    .toLocaleLowerCase("und")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

/** The returned value never exceeds maxCodePoints, including the ellipsis. */
export function truncateCodePoints(value: string, maxCodePoints: number) {
  if (!Number.isSafeInteger(maxCodePoints) || maxCodePoints < 0) {
    throw new RangeError("maxCodePoints must be a non-negative safe integer");
  }
  const points = Array.from(value);
  if (points.length <= maxCodePoints) return value;
  if (maxCodePoints === 0) return "";
  if (maxCodePoints === 1) return "…";
  return `${points.slice(0, maxCodePoints - 1).join("")}…`;
}

export function projectSearchRecord(
  input: SearchRecordInput,
  maxSnippetCodePoints = DEFAULT_SNIPPET_CODE_POINTS,
  maxTitleCodePoints = DEFAULT_TITLE_CODE_POINTS,
): SearchRecord {
  const projected: SearchRecord = {
    id: input.id,
    target: input.target,
    kind: input.kind,
  };
  const fields: Array<keyof Omit<SearchRecord, "id" | "target" | "kind" | "snippet">> = [
    "dialogue",
    "stephanusSpan",
    "family",
    "label",
    "status",
    "speaker",
    "relationKind",
    "resolution",
  ];
  for (const field of fields) {
    const value = compactText(input[field]);
    if (value) projected[field] = value;
  }
  const title = compactText(input.title);
  if (title) projected.title = truncateCodePoints(title, maxTitleCodePoints);
  const snippet = compactText(input.snippet);
  if (snippet) projected.snippet = truncateCodePoints(snippet, maxSnippetCodePoints);
  return projected;
}

export function serializeExactIdManifest(manifest: ExactIdManifest) {
  const shards = [...manifest.shards].sort(compareDescriptors).map((shard) => ({
    kind: shard.kind,
    scope: shard.scope,
    path: shard.path,
    count: shard.count,
    firstId: shard.firstId,
    lastId: shard.lastId,
  }));
  return stableJson({ version: INDEX_VERSION, shards });
}

export function serializeSearchManifest(manifest: SearchManifest) {
  const shards = [...manifest.shards].sort(compareDescriptors).map((shard) => ({
    kind: shard.kind,
    scope: shard.scope,
    path: shard.path,
    count: shard.count,
  }));
  return stableJson({ version: INDEX_VERSION, shards });
}

export function serializeExactIdShard(shard: ExactIdShard) {
  const records = [...shard.records]
    .sort((a, b) => compareText(a.id, b.id))
    .map(({ id, target }) => ({ id, target }));
  return stableJson({ version: INDEX_VERSION, kind: shard.kind, scope: shard.scope, records });
}

export function serializeSearchShard(shard: SearchShard) {
  const records = [...shard.records]
    .sort((a, b) => compareText(a.id, b.id))
    .map((record) => projectSearchRecord(record));
  return stableJson({ version: INDEX_VERSION, kind: shard.kind, scope: shard.scope, records });
}

export function buildExactIdIndex(
  inputs: readonly ExactIdRecord[],
  basePath = "assets/index",
  maxShardBytes = STATIC_INDEX_SHARD_MAX_BYTES,
): BuiltExactIdIndex {
  assertUniqueIds(inputs, "exact-ID source records");
  const groups = new Map<string, ExactIdRecord[]>();
  for (const input of inputs) {
    requiredText(input.kind, "kind", "exact-ID source records");
    requiredText(input.scope, "scope", "exact-ID source records");
    requiredText(input.target, "target", "exact-ID source records");
    const key = groupKey(input.kind, input.scope);
    groups.set(key, [...(groups.get(key) ?? []), input]);
  }

  const shards = [...groups.values()].map((group) => {
    const sorted = [...group].sort((a, b) => compareText(a.id, b.id));
    const first = sorted[0]!;
    const last = sorted.at(-1)!;
    const path = assetPath(basePath, "ids", first.kind, first.scope);
    const records = sorted.map(({ id, target }) => ({ id, target }));
    const descriptor: ExactIdShardDescriptor = {
      kind: first.kind,
      scope: first.scope,
      path,
      count: records.length,
      firstId: first.id,
      lastId: last.id,
    };
    const json = serializeExactIdShard({
      version: INDEX_VERSION,
      kind: first.kind,
      scope: first.scope,
      records,
    });
    assertShardByteBudget(json, path, maxShardBytes);
    return { ...descriptor, records, json };
  });
  shards.sort(compareDescriptors);
  const manifest: ExactIdManifest = {
    version: INDEX_VERSION,
    shards: shards.map(({ records: _records, json: _json, ...descriptor }) => descriptor),
  };
  return { manifest, manifestJson: serializeExactIdManifest(manifest), shards };
}

export function buildSearchIndex(
  inputs: readonly SearchRecordInput[],
  options: {
    basePath?: string;
    maxTitleCodePoints?: number;
    maxSnippetCodePoints?: number;
    maxShardBytes?: number;
  } = {},
): BuiltSearchIndex {
  assertUniqueIds(inputs, "search source records");
  const basePath = options.basePath ?? "assets/search";
  const maxSnippetCodePoints = options.maxSnippetCodePoints ?? DEFAULT_SNIPPET_CODE_POINTS;
  const maxTitleCodePoints = options.maxTitleCodePoints ?? DEFAULT_TITLE_CODE_POINTS;
  const maxShardBytes = options.maxShardBytes ?? STATIC_INDEX_SHARD_MAX_BYTES;
  const groups = new Map<string, Array<{ scope: string; record: SearchRecord }>>();
  for (const input of inputs) {
    requiredText(input.kind, "kind", "search source records");
    requiredText(input.target, "target", "search source records");
    const scope = compactText(input.scope) || compactText(input.dialogue) || compactText(input.family) || "global";
    const record = projectSearchRecord(input, maxSnippetCodePoints, maxTitleCodePoints);
    const key = groupKey(input.kind, scope);
    groups.set(key, [...(groups.get(key) ?? []), { scope, record }]);
  }

  const shards = [...groups.values()].map((group) => {
    const first = group[0]!;
    const records = group.map(({ record }) => record).sort((a, b) => compareText(a.id, b.id));
    const path = assetPath(basePath, "search", first.record.kind, first.scope);
    const descriptor: ShardDescriptor = {
      kind: first.record.kind,
      scope: first.scope,
      path,
      count: records.length,
    };
    const json = stableJson({
      version: INDEX_VERSION,
      kind: first.record.kind,
      scope: first.scope,
      records,
    });
    assertShardByteBudget(json, path, maxShardBytes);
    return { ...descriptor, records, json };
  });
  shards.sort(compareDescriptors);
  const manifest: SearchManifest = {
    version: INDEX_VERSION,
    shards: shards.map(({ records: _records, json: _json, ...descriptor }) => descriptor),
  };
  return { manifest, manifestJson: serializeSearchManifest(manifest), shards };
}

export function selectManifestShards<T extends ShardDescriptor>(
  manifest: { version: 1; shards: readonly T[] },
  selector: ShardSelector = {},
) {
  const scopes =
    selector.scope === undefined
      ? undefined
      : new Set(Array.isArray(selector.scope) ? selector.scope : [selector.scope]);
  return manifest.shards
    .filter((shard) => selector.kind === undefined || shard.kind === selector.kind)
    .filter((shard) => scopes === undefined || scopes.has(shard.scope))
    .slice()
    .sort(compareDescriptors);
}

export function selectExactIdShards(
  manifest: ExactIdManifest,
  id: string,
  selector: ShardSelector = {},
) {
  return selectManifestShards(manifest, selector).filter(
    (shard) => compareText(shard.firstId, id) <= 0 && compareText(id, shard.lastId) <= 0,
  );
}

export function planSearchShardLoads(manifest: SearchManifest, intent: SearchIntent): SearchShardLoadPlan {
  if (!normalizeSearchText(intent.query)) {
    return { shouldFetch: false, reason: "blank-query", shards: [] };
  }
  const scope = intent.scope ?? intent.filters?.dialogue;
  const selector: ShardSelector = {};
  if (intent.filters?.kind !== undefined) selector.kind = intent.filters.kind;
  if (scope !== undefined) selector.scope = scope;
  const shards = selectManifestShards(manifest, selector);
  return {
    shouldFetch: shards.length > 0,
    reason: shards.length > 0 ? "search-intent" : "no-matching-shards",
    shards,
  };
}

const FILTER_FIELDS = [
  "kind",
  "dialogue",
  "family",
  "label",
  "status",
  "speaker",
  "relationKind",
  "resolution",
] as const satisfies readonly (keyof SearchFilters & keyof SearchRecord)[];

export function matchesStructuralFilters(record: SearchRecord, filters: SearchFilters = {}) {
  return FILTER_FIELDS.every((field) => {
    const selected = filters[field];
    return selected === undefined || normalizeSearchText(record[field] ?? "") === normalizeSearchText(selected);
  });
}

function searchableFields(record: SearchRecord) {
  return [
    record.id,
    record.kind,
    record.dialogue,
    record.stephanusSpan,
    record.family,
    record.label,
    record.status,
    record.speaker,
    record.relationKind,
    record.resolution,
    record.title,
    record.snippet,
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map(normalizeSearchText);
}

export function matchTier(record: SearchRecord, query: string): MatchTier | undefined {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return undefined;
  if (record.id === query.trim()) return "exact-id";
  const fields = searchableFields(record);
  if (fields.some((field) => field === normalizedQuery)) return "exact-field";
  if (fields.some((field) => field.startsWith(normalizedQuery))) return "prefix";
  if (fields.some((field) => field.includes(normalizedQuery))) return "substring";
  return undefined;
}

const MATCH_ORDER: Record<MatchTier, number> = {
  "exact-id": 0,
  "exact-field": 1,
  prefix: 2,
  substring: 3,
};

export function searchRecords(
  records: readonly SearchRecord[],
  intent: SearchIntent,
  resultCap = DEFAULT_RESULT_CAP,
): SearchResponse {
  if (!Number.isSafeInteger(resultCap) || resultCap <= 0) {
    throw new RangeError("resultCap must be a positive safe integer");
  }
  if (!normalizeSearchText(intent.query)) {
    return {
      results: [],
      status: {
        state: "idle",
        message: "Enter a search query.",
        total: 0,
        shown: 0,
        capped: false,
      },
    };
  }

  const ranked = records
    .filter((record) => matchesStructuralFilters(record, intent.filters))
    .map((record) => ({ record, match: matchTier(record, intent.query) }))
    .filter((result): result is RankedSearchRecord => result.match !== undefined)
    .sort(
      (a, b) => MATCH_ORDER[a.match] - MATCH_ORDER[b.match] || compareText(a.record.id, b.record.id),
    );
  const total = ranked.length;
  const results = ranked.slice(0, resultCap);
  const capped = total > resultCap;
  if (total === 0) {
    return {
      results,
      status: { state: "empty", message: "No results.", total, shown: 0, capped: false },
    };
  }
  return {
    results,
    status: {
      state: "results",
      message: capped
        ? `Showing ${results.length} of ${total} results. Refine your query.`
        : `${total} result${total === 1 ? "" : "s"}.`,
      total,
      shown: results.length,
      capped,
    },
  };
}

export function unknownIdError(id: string) {
  return new CatalogIndexError("unknown-id", id, `Unknown record ID: ${id}`);
}

export function missingIndexShard(path: string) {
  return new CatalogIndexError("missing-shard", path, `Index shard is unavailable: ${path}`);
}

export function malformedIndexResource(resource: string, detail: string) {
  return new CatalogIndexError(
    "malformed-shard",
    resource,
    `Malformed index ${resource}: ${detail}`,
    detail,
  );
}

export function malformedManifestResource(resource: string, detail: string) {
  return new CatalogIndexError(
    "malformed-manifest",
    resource,
    `Malformed index ${resource}: ${detail}`,
    detail,
  );
}

export function indexErrorStatus(error: unknown): SearchStatus {
  const message =
    error instanceof CatalogIndexError
      ? error.message
      : "The search index is unavailable. Please try again.";
  return { state: "error", message, total: 0, shown: 0, capped: false };
}

function parseDescriptor(value: unknown, resource: string, exact: boolean) {
  const object = asObject(value, resource);
  assertAllowedKeys(
    object,
    exact
      ? ["kind", "scope", "path", "count", "firstId", "lastId"]
      : ["kind", "scope", "path", "count"],
    resource,
  );
  const descriptor: ExactIdShardDescriptor = {
    kind: requiredText(object.kind, "kind", resource),
    scope: requiredText(object.scope, "scope", resource),
    path: requiredText(object.path, "path", resource),
    count: assertCount(object.count, resource),
    firstId: exact ? requiredText(object.firstId, "firstId", resource) : "",
    lastId: exact ? requiredText(object.lastId, "lastId", resource) : "",
  };
  if (exact && compareText(descriptor.firstId, descriptor.lastId) > 0) {
    throw malformedIndexResource(resource, "firstId must not sort after lastId");
  }
  if (descriptor.count === 0) throw malformedIndexResource(resource, "empty shards must be omitted");
  return descriptor;
}

export function parseExactIdManifest(input: string | unknown, resource = "exact-ID manifest") {
  try {
    const object = asObject(parseJson(input, resource), resource);
    assertAllowedKeys(object, ["version", "shards"], resource);
    assertVersion(object.version, resource);
    if (!Array.isArray(object.shards)) throw malformedIndexResource(resource, "shards must be an array");
    const shards = object.shards.map((value, index) => parseDescriptor(value, `${resource} shard ${index}`, true));
    const paths = new Set<string>();
    for (const shard of shards) {
      if (paths.has(shard.path)) throw malformedIndexResource(resource, `duplicate shard path ${shard.path}`);
      paths.add(shard.path);
    }
    return { version: INDEX_VERSION, shards: shards.sort(compareDescriptors) } satisfies ExactIdManifest;
  } catch (error) {
    if (error instanceof CatalogIndexError && error.code.startsWith("malformed-")) {
      throw malformedManifestResource(resource, error.detail ?? error.message);
    }
    throw error;
  }
}

export function parseSearchManifest(input: string | unknown, resource = "search manifest") {
  try {
    const object = asObject(parseJson(input, resource), resource);
    assertAllowedKeys(object, ["version", "shards"], resource);
    assertVersion(object.version, resource);
    if (!Array.isArray(object.shards)) throw malformedIndexResource(resource, "shards must be an array");
    const shards = object.shards.map((value, index) => {
      const { firstId: _firstId, lastId: _lastId, ...descriptor } = parseDescriptor(
        value,
        `${resource} shard ${index}`,
        false,
      );
      return descriptor;
    });
    const paths = new Set<string>();
    for (const shard of shards) {
      if (paths.has(shard.path)) throw malformedIndexResource(resource, `duplicate shard path ${shard.path}`);
      paths.add(shard.path);
    }
    return { version: INDEX_VERSION, shards: shards.sort(compareDescriptors) } satisfies SearchManifest;
  } catch (error) {
    if (error instanceof CatalogIndexError && error.code.startsWith("malformed-")) {
      throw malformedManifestResource(resource, error.detail ?? error.message);
    }
    throw error;
  }
}

function parseExactIdEntry(value: unknown, resource: string): ExactIdEntry {
  const object = asObject(value, resource);
  assertAllowedKeys(object, ["id", "target"], resource);
  return {
    id: requiredText(object.id, "id", resource),
    target: requiredText(object.target, "target", resource),
  };
}

export function parseExactIdShard(input: string | unknown, resource = "exact-ID shard") {
  const object = asObject(parseJson(input, resource), resource);
  assertAllowedKeys(object, ["version", "kind", "scope", "records"], resource);
  assertVersion(object.version, resource);
  const kind = requiredText(object.kind, "kind", resource);
  const scope = requiredText(object.scope, "scope", resource);
  if (!Array.isArray(object.records)) throw malformedIndexResource(resource, "records must be an array");
  const records = object.records.map((value, index) => parseExactIdEntry(value, `${resource} record ${index}`));
  assertUniqueIds(records, resource);
  records.sort((a, b) => compareText(a.id, b.id));
  return { version: INDEX_VERSION, kind, scope, records } satisfies ExactIdShard;
}

function parseSearchRecord(value: unknown, resource: string) {
  const object = asObject(value, resource);
  const allowed = [
    "id",
    "target",
    "kind",
    "dialogue",
    "stephanusSpan",
    "family",
    "label",
    "status",
    "speaker",
    "relationKind",
    "resolution",
    "title",
    "snippet",
  ];
  assertAllowedKeys(object, allowed, resource);
  const record: SearchRecord = {
    id: requiredText(object.id, "id", resource),
    target: requiredText(object.target, "target", resource),
    kind: requiredText(object.kind, "kind", resource),
  };
  const fields = [
    "dialogue",
    "stephanusSpan",
    "family",
    "label",
    "status",
    "speaker",
    "relationKind",
    "resolution",
    "title",
    "snippet",
  ] as const;
  for (const field of fields) {
    const text = optionalText(object[field], field, resource);
    if (text !== undefined) record[field] = text;
  }
  return record;
}

export function parseSearchShard(input: string | unknown, resource = "search shard") {
  const object = asObject(parseJson(input, resource), resource);
  assertAllowedKeys(object, ["version", "kind", "scope", "records"], resource);
  assertVersion(object.version, resource);
  const kind = requiredText(object.kind, "kind", resource);
  const scope = requiredText(object.scope, "scope", resource);
  if (!Array.isArray(object.records)) throw malformedIndexResource(resource, "records must be an array");
  const records = object.records.map((value, index) => parseSearchRecord(value, `${resource} record ${index}`));
  assertUniqueIds(records, resource);
  if (records.some((record) => record.kind !== kind)) {
    throw malformedIndexResource(resource, "record kind does not match shard kind");
  }
  records.sort((a, b) => compareText(a.id, b.id));
  return { version: INDEX_VERSION, kind, scope, records } satisfies SearchShard;
}

export function lookupExactId(
  id: string,
  manifest: ExactIdManifest,
  loadedShards: ReadonlyMap<string, ExactIdShard>,
  selector: ShardSelector = {},
) {
  const selected = selectExactIdShards(manifest, id, selector);
  if (selected.length === 0) throw unknownIdError(id);
  let match: ExactIdEntry | undefined;
  for (const descriptor of selected) {
    const shard = loadedShards.get(descriptor.path);
    if (!shard) throw missingIndexShard(descriptor.path);
    if (
      shard.kind !== descriptor.kind ||
      shard.scope !== descriptor.scope ||
      shard.records.length !== descriptor.count ||
      shard.records[0]?.id !== descriptor.firstId ||
      shard.records.at(-1)?.id !== descriptor.lastId
    ) {
      throw malformedIndexResource(descriptor.path, "shard metadata does not match its manifest entry");
    }
    const candidate = shard.records.find((record) => record.id === id);
    if (candidate && match) {
      throw malformedIndexResource(descriptor.path, `duplicate exact ID ${id} across shards`);
    }
    match = candidate ?? match;
  }
  if (!match) throw unknownIdError(id);
  return match.target;
}

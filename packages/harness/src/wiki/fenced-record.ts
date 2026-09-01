import { Type, type TSchema } from "typebox";
import { Check } from "typebox/value";
import { parseDocument, stringify } from "yaml";

export type CanonicalYamlScalar = string | number | boolean | null;
export type CanonicalYamlValue = CanonicalYamlScalar | readonly CanonicalYamlValue[] | CanonicalYamlRecord;
export type CanonicalYamlRecord = { readonly [key: string]: CanonicalYamlValue };

export type RawFencedYamlBlock = {
  content: string;
  fullMatch: string;
  startLine: number;
  index: number;
  startOffset: number;
  endOffset: number;
};

export type FencedYamlRecordBlock = RawFencedYamlBlock & {
  record: CanonicalYamlRecord;
};

export type CanonicalYamlParseOptions = {
  context?: string;
  schema?: TSchema;
};

const PLAIN_OBJECT_SCHEMA = Type.Object({}, { additionalProperties: true });
const OPEN_FENCE = /^```yaml[\t ]*$/u;
const CLOSE_FENCE = /^```[\t ]*$/u;
const PARSE_CACHE_LIMIT = 4096;
const parseCache = new Map<string, CanonicalYamlRecord>();

export class CanonicalYamlRecordError extends Error {
  override readonly name = "CanonicalYamlRecordError";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function freezeCanonicalValue(value: unknown, path: string): CanonicalYamlValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new CanonicalYamlRecordError(`${path} contains a non-finite number.`);
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry, index) => freezeCanonicalValue(entry, `${path}[${index}]`)));
  }
  if (value instanceof Map) {
    const record: Record<string, CanonicalYamlValue> = Object.create(null) as Record<string, CanonicalYamlValue>;
    for (const [key, entry] of value.entries()) {
      if (typeof key !== "string") throw new CanonicalYamlRecordError(`${path} contains a non-string mapping key.`);
      if (Object.hasOwn(record, key)) throw new CanonicalYamlRecordError(`${path} contains duplicate key ${JSON.stringify(key)}.`);
      record[key] = freezeCanonicalValue(entry, `${path}.${key}`);
    }
    return Object.freeze(record);
  }
  if (isPlainObject(value)) {
    const record: Record<string, CanonicalYamlValue> = Object.create(null) as Record<string, CanonicalYamlValue>;
    for (const [key, entry] of Object.entries(value)) record[key] = freezeCanonicalValue(entry, `${path}.${key}`);
    return Object.freeze(record);
  }
  throw new CanonicalYamlRecordError(`${path} contains a value that is not JSON-schema safe.`);
}

function cachedBaseRecord(source: string, context: string) {
  const cached = parseCache.get(source);
  if (cached) return cached;

  const document = parseDocument(source, {
    customTags: [],
    merge: false,
    prettyErrors: true,
    resolveKnownTags: false,
    schema: "core",
    strict: true,
    stringKeys: true,
    uniqueKeys: true,
    version: "1.2",
  });
  const diagnostics = [...document.errors, ...document.warnings];
  if (diagnostics.length > 0) {
    throw new CanonicalYamlRecordError(
      `${context} is not one strict YAML 1.2 document:\n${diagnostics.map((diagnostic) => diagnostic.message).join("\n")}`,
    );
  }

  let value: unknown;
  try {
    value = document.toJS({ mapAsMap: true, maxAliasCount: 0 });
  } catch (error) {
    throw new CanonicalYamlRecordError(
      `${context} cannot be converted safely: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const canonical = freezeCanonicalValue(value, context);
  if (!isPlainObject(canonical) || !Check(PLAIN_OBJECT_SCHEMA, canonical)) {
    throw new CanonicalYamlRecordError(`${context} root must be a plain mapping object.`);
  }

  if (parseCache.size >= PARSE_CACHE_LIMIT) parseCache.delete(parseCache.keys().next().value!);
  parseCache.set(source, canonical);
  return canonical;
}

export function parseCanonicalYamlRecord(source: string, options: CanonicalYamlParseOptions = {}) {
  const context = options.context ?? "YAML record";
  const record = cachedBaseRecord(source, context);
  if (options.schema && !Check(options.schema, record)) {
    throw new CanonicalYamlRecordError(`${context} does not match its TypeBox schema.`);
  }
  return record;
}

export function serializeCanonicalYamlRecord(record: CanonicalYamlRecord) {
  const checked = freezeCanonicalValue(record, "YAML record");
  if (!isPlainObject(checked) || !Check(PLAIN_OBJECT_SCHEMA, checked)) {
    throw new CanonicalYamlRecordError("YAML record root must be a plain mapping object.");
  }
  return stringify(checked, {
    aliasDuplicateObjects: false,
    blockQuote: "literal",
    collectionStyle: "block",
    defaultKeyType: "PLAIN",
    defaultStringType: "PLAIN",
    lineWidth: 0,
    merge: false,
    schema: "core",
    version: "1.2",
  });
}

function markdownLines(content: string) {
  const lines: Array<{ start: number; end: number; text: string }> = [];
  let start = 0;
  while (start < content.length) {
    const newline = content.indexOf("\n", start);
    const end = newline === -1 ? content.length : newline + 1;
    const raw = content.slice(start, newline === -1 ? content.length : newline);
    lines.push({ start, end, text: raw.endsWith("\r") ? raw.slice(0, -1) : raw });
    start = end;
  }
  return lines;
}

export function rawFencedYamlBlocks(content: string): RawFencedYamlBlock[] {
  const lines = markdownLines(content);
  const blocks: RawFencedYamlBlock[] = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const opening = lines[lineIndex]!;
    if (!OPEN_FENCE.test(opening.text)) continue;
    let closingIndex = lineIndex + 1;
    while (closingIndex < lines.length && !CLOSE_FENCE.test(lines[closingIndex]!.text)) closingIndex += 1;
    if (closingIndex >= lines.length) {
      throw new CanonicalYamlRecordError(`Unterminated yaml fence beginning at markdown line ${lineIndex + 1}.`);
    }
    const closing = lines[closingIndex]!;
    let contentEnd = closing.start;
    if (contentEnd > opening.end && content[contentEnd - 1] === "\n") contentEnd -= 1;
    if (contentEnd > opening.end && content[contentEnd - 1] === "\r") contentEnd -= 1;
    blocks.push({
      content: content.slice(opening.end, contentEnd),
      fullMatch: content.slice(opening.start, closing.end - (content[closing.end - 1] === "\n" ? 1 : 0)),
      startLine: lineIndex + 1,
      index: blocks.length,
      startOffset: opening.start,
      endOffset: closing.end - (content[closing.end - 1] === "\n" ? 1 : 0),
    });
    lineIndex = closingIndex;
  }
  return blocks;
}

export function fencedYamlRecordBlocks(content: string): FencedYamlRecordBlock[] {
  return rawFencedYamlBlocks(content).map((block) => ({
    ...block,
    record: parseCanonicalYamlRecord(block.content, { context: `yaml fence at markdown line ${block.startLine}` }),
  }));
}

export function replaceFencedYamlRecordBlocks(
  content: string,
  replacer: (block: FencedYamlRecordBlock) => string,
) {
  const blocks = fencedYamlRecordBlocks(content);
  let cursor = 0;
  let result = "";
  for (const block of blocks) {
    result += content.slice(cursor, block.startOffset);
    result += replacer(block);
    cursor = block.endOffset;
  }
  return result + content.slice(cursor);
}

function scalarString(value: CanonicalYamlValue | undefined) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return stringify(value, {
    aliasDuplicateObjects: false,
    collectionStyle: "flow",
    lineWidth: 0,
    schema: "core",
    version: "1.2",
  }).trim();
}

export function recordFieldValue(record: CanonicalYamlRecord, field: string) {
  return scalarString(record[field]);
}

export function fieldValue(block: string, field: string) {
  return recordFieldValue(parseCanonicalYamlRecord(block), field);
}

export function fieldValueOrEmpty(block: string, field: string) {
  return fieldValue(block, field) ?? "";
}

function nestedValue(value: CanonicalYamlValue, field: string): CanonicalYamlValue | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = nestedValue(entry, field);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (!isPlainObject(value)) return undefined;
  if (Object.hasOwn(value, field)) return value[field] as CanonicalYamlValue;
  for (const entry of Object.values(value)) {
    const found = nestedValue(entry as CanonicalYamlValue, field);
    if (found !== undefined) return found;
  }
  return undefined;
}

export function nestedFieldValue(block: string, field: string) {
  const record = parseCanonicalYamlRecord(block);
  for (const value of Object.values(record)) {
    const found = nestedValue(value, field);
    if (found !== undefined) return scalarString(found);
  }
  return undefined;
}

export function nestedFieldValueInParent(block: string, parent: string, field: string) {
  const value = parseCanonicalYamlRecord(block)[parent];
  return isPlainObject(value) ? scalarString(value[field] as CanonicalYamlValue | undefined) ?? "" : "";
}

export function nestedFieldValueInPath(block: string, parents: readonly string[], field: string) {
  let value: CanonicalYamlValue = parseCanonicalYamlRecord(block);
  for (const parent of parents) {
    if (!isPlainObject(value)) return "";
    const next = value[parent];
    if (next === undefined) return "";
    value = next as CanonicalYamlValue;
  }
  return isPlainObject(value) ? scalarString(value[field] as CanonicalYamlValue | undefined) ?? "" : "";
}

export function listFieldValue(block: string, field: string) {
  const value = parseCanonicalYamlRecord(block)[field];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new CanonicalYamlRecordError(`YAML record field ${JSON.stringify(field)} must be a list.`);
  }
  return value.map((entry, index) => {
    const scalar = scalarString(entry);
    if (scalar === undefined || typeof entry === "object") {
      throw new CanonicalYamlRecordError(`YAML record field ${JSON.stringify(field)} item ${index} must be a scalar.`);
    }
    return scalar;
  });
}

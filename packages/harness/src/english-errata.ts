import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import { createSourceSpanResolver } from "./source.js";

declare const Bun: { TOML: { parse(content: string): unknown } };

export const ENGLISH_ERRATA_PATH = "raw/plato/english/errata.toml";

export const ERRATUM_KINDS = ["name", "omission", "addition", "reversal", "sense"] as const;
export type ErratumKind = (typeof ERRATUM_KINDS)[number];

export type Erratum = {
  readonly dialogue: string;
  readonly span: string;
  readonly kind: ErratumKind;
  readonly english: string;
  readonly greek: string;
  readonly correction: string;
};

type SpanText = (dialogue: string, span: string) => string;

const isKind = (value: unknown): value is ErratumKind =>
  typeof value === "string" && (ERRATUM_KINDS as ReadonlyArray<string>).includes(value);

// Both sources wrap names, quotations and paragraphs in `{tag}` markers, so a
// phrase is matched against the words alone.
export const plainSourceText = (text: string): string =>
  text.replace(/\{[^{}]*\}/gu, " ").replace(/\s+/gu, " ").trim();

const occurrences = (haystack: string, needle: string): number => {
  let count = 0;
  for (let at = haystack.indexOf(needle); at >= 0; at = haystack.indexOf(needle, at + 1)) count += 1;
  return count;
};

export function parseEnglishErrata(content: string): { errata: Erratum[]; failures: string[] } {
  const parsed = Bun.TOML.parse(content) as { schema_version?: unknown; erratum?: unknown };
  const failures: string[] = [];
  if (parsed.schema_version !== 1) failures.push("schema_version must be 1");
  const rows = parsed.erratum === undefined ? [] : parsed.erratum;
  if (!Array.isArray(rows)) return { errata: [], failures: [...failures, "erratum must be an array of tables"] };

  const errata: Erratum[] = [];
  rows.forEach((row: unknown, index) => {
    const at = `erratum[${index}]`;
    if (typeof row !== "object" || row === null) {
      failures.push(`${at}: must be a table`);
      return;
    }
    const fields = row as Record<string, unknown>;
    const allowed = new Set(["dialogue", "span", "kind", "english", "greek", "correction"]);
    for (const key of Object.keys(fields)) if (!allowed.has(key)) failures.push(`${at}: unknown field ${key}`);
    const text = (key: string): string | undefined => {
      const value = fields[key];
      if (typeof value === "string" && value.trim() === value && value.length > 0) return value;
      failures.push(`${at}: ${key} must be a non-empty trimmed string`);
      return undefined;
    };
    const dialogue = text("dialogue");
    const span = text("span");
    const english = text("english");
    const greek = text("greek");
    const correction = text("correction");
    if (!isKind(fields.kind)) failures.push(`${at}: kind must be one of ${ERRATUM_KINDS.join(", ")}`);
    if (dialogue && span && english && greek && correction && isKind(fields.kind)) {
      errata.push({ dialogue, span, kind: fields.kind, english, greek, correction });
    }
  });
  return { errata, failures };
}

// Each entry must point at words that exist exactly once in its span, so a
// reader-facing view can mark them without guessing.
export function checkEnglishErrata(errata: ReadonlyArray<Erratum>, english: SpanText, greek: SpanText): string[] {
  const failures: string[] = [];
  const seen = new Set<string>();
  for (const erratum of errata) {
    const at = `${erratum.dialogue} ${erratum.span} "${erratum.english}"`;
    const key = `${erratum.dialogue}\u0000${erratum.english}`;
    if (seen.has(key)) failures.push(`${at}: duplicate erratum`);
    seen.add(key);
    try {
      const count = occurrences(plainSourceText(english(erratum.dialogue, erratum.span)), erratum.english);
      if (count !== 1) failures.push(`${at}: English words occur ${count} times in the span, expected once`);
    } catch (error) {
      failures.push(`${at}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    if (!plainSourceText(greek(erratum.dialogue, erratum.span)).includes(erratum.greek)) {
      failures.push(`${at}: Greek term "${erratum.greek}" is not in the span`);
    }
  }
  return failures;
}

export function loadEnglishErrata(repoRoot = getRepoRoot()): Erratum[] {
  const path = join(repoRoot, ENGLISH_ERRATA_PATH);
  if (!existsSync(path)) return [];
  const { errata, failures } = parseEnglishErrata(readFileSync(path, "utf8"));
  if (failures.length > 0) throw new Error(`${ENGLISH_ERRATA_PATH}:\n${failures.join("\n")}`);
  return errata;
}

export function validateEnglishErrata(repoRoot = getRepoRoot()): string[] {
  const path = join(repoRoot, ENGLISH_ERRATA_PATH);
  if (!existsSync(path)) return [];
  const { errata, failures } = parseEnglishErrata(readFileSync(path, "utf8"));
  const resolver = createSourceSpanResolver();
  return [
    ...failures,
    ...checkEnglishErrata(
      errata,
      (dialogue, span) => resolver.resolveEnglishSpan(dialogue, span).text,
      (dialogue, span) => resolver.resolveSourceSpan(dialogue, span).text,
    ),
  ].map((failure) => `${ENGLISH_ERRATA_PATH}: ${failure}`);
}

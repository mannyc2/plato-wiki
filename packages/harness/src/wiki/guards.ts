export function assertReadableWikiPath(relativePath: string) {
  const allowed =
    relativePath.startsWith("wiki/observations/") ||
    relativePath.startsWith("wiki/claims/") ||
    relativePath.startsWith("raw/plato/greek/");

  if (!allowed) {
    throw new Error(`Read path is not allowed: ${relativePath}`);
  }
}

export function assertObservationWritePath(relativePath: string) {
  if (!relativePath.startsWith("wiki/observations/") || !relativePath.endsWith(".md")) {
    throw new Error(`Observation writes must target wiki/observations/*.md: ${relativePath}`);
  }
}

export function assertClaimWritePath(relativePath: string) {
  if (!relativePath.startsWith("wiki/claims/") || !relativePath.endsWith(".md")) {
    throw new Error(`Claim writes must target wiki/claims/*.md: ${relativePath}`);
  }
}

export function assertRelationWritePath(relativePath: string) {
  if (!relativePath.startsWith("wiki/relations/") || !relativePath.endsWith(".md")) {
    throw new Error(`Relation writes must target wiki/relations/*.md: ${relativePath}`);
  }
}

export function assertLedgerAppendPath(relativePath: string) {
  if (relativePath !== "wiki/ingest-log.md") {
    throw new Error(`Ledger appends must target wiki/ingest-log.md: ${relativePath}`);
  }
}

export function prepareLedgerAppend(rawContent: string) {
  return rawContent.endsWith("\n") ? rawContent : `${rawContent}\n`;
}

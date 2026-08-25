/** Minimal protocol with the same fail-closed audit-contract boundaries as production. */
export const COMMENTARY_PROTOCOL_FIXTURE = [
  "# Commentary protocol",
  "",
  "## What commentary is",
  "",
  "Use accepted citations and apply the listening-quality bar.",
  "",
  "## The record contract",
  "",
  "Fixture record rules.",
  "",
].join("\n");

export function driftedCommentaryProtocolFixture(marker: string) {
  return COMMENTARY_PROTOCOL_FIXTURE.replace(
    "Use accepted citations and apply the listening-quality bar.",
    `Use accepted citations and apply the listening-quality bar. ${marker}`,
  );
}

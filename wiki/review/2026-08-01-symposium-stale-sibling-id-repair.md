# Symposium stale sibling-id references in rationale prose, repaired

Executed 2026-08-01 on branch `symposium-rereview/narrator-repeat-reviewed-licence`.
Greek source only (`raw/plato/greek/symposium.txt`, sha256 `260b7c57…3447a7`); no
translation, claim ledger, commentary, observation, or external editor's speaker
label was consulted.

## The defect

The Symposium re-review's hard-cutover rearchitecture renumbered the Symposium cohort from 168
records to 194. Renumbering moved the records; it did not move the **prose that
cites them**. Every `reviewed_attribution.rationale` that referred to a sibling
record by its four-digit id kept the *pre-cutover* id, which under the current
numbering points at a different record.

Nothing downstream broke and no check caught it, for one reason: rationale prose
is free text and is **not carried into the compiled index at all**. The derived
artifacts contain no rationale, so a stale id there cannot reach a claim, a join,
or the site. It is a defect in the reviewed record's readability, not in its data.

`wiki/review/2026-08-01-symposium-context-span-narrowing.md` recorded this on
2026-08-01 as "reported, not repaired here … a pre-existing defect across the
whole Symposium cohort, not only these 22 records". This pass repairs it.

## Why the ids were repairable mechanically rather than by re-adjudication

Each stale citation carries **both** an id and a byte anchor — a char range, an
offset, or verbatim Greek — and the byte anchors were always correct. So the
repair never had to reconstruct a reviewer's judgment; it only had to restore the
id that the reviewer's own byte anchor already names.

The mapping was derived, not guessed. For every cited id the pre-cutover ledger
at `64932f3^` was read, its `char_span` taken, and the current record carrying the
**byte-identical span** looked up. Every one of the 152 mapped ids resolved to
exactly one current record, and the terminal owner in `voice_chain` was unchanged
in every case but one: old `0041` `[59897, 59982)` carried `ΑΠΟΛ.>ΑΡΙΣΤΟΔ.` and
the same span now carries `ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΣΩ.`, because the re-review resolved it.
That is a chain that got deeper on the same span, not a different record, and the
remapper admits only that shape — a changed terminal owner is refused.

## How the full set was found, and why the first count was too low

The obvious detector — flag a citation whose target is now far away — **undercounts**.
It was run first and reported 21 stale pairs at a 2,000-character threshold. The
threshold is arbitrary, and a renumbering of this kind moves many targets only a
few hundred characters, well inside any plausible bound.

The detector that settles it compares the two numberings directly: a citation is
stale when the *pre-cutover* ledger puts the cited id adjacent to the citing record
and the current ledger does not. That found **33** pairs, not 21 — twelve more that
the threshold had cleared as plausible, among them `0017`'s citation of `0021`,
whose current target sits a wholly believable 513 characters away and is still the
wrong record.

The remaining pair was resolved by reading rather than by counting, and is the
reason a purely mechanical sweep would not have been trustworthy either.
`voice_symposium_0030` cites "the party who gave the preceding λόγος, the
named-ΑΓΑ. **0078**". Current `0078` *is* `ΑΓΑ.`-owned, so no distance test and no
owner test flags it — but current `0078` is a 32-character reply at 199d, and no
reply is a λόγος. The pre-cutover `0078` is `[46444, 52991)`, Agathon's whole
speech at 194e–198a, which is current `0072`. Superficially consistent and wrong.

**All 34 id cross-references in the cohort were stale.** One cause, one fix.

## What changed and what did not

Changed, and only this: the four-digit sibling ids inside
`reviewed_attribution.rationale` on the 25 records below — 42 token occurrences,
25 lines. Byte anchors, Greek quotations, and every word of the surrounding
argument are untouched.

**Not** changed on any record: `char_span`, `source_sha256`, `span_sha256`,
`voice_chain`, `depth`, `resolution`, `reviewed_attribution.kind`,
`candidate_owners`, `context_span`, `limits`, `unresolved_reason`,
`review_status`. **No owner moved.** No other dialogue's ledger, and no claim,
observation, relation, commentary record or audio artifact, was touched. No entry
was added to or removed from `derived/plato/voices/cutovers.toml`.

Records: `0005`, `0008`, `0010`, `0011`, `0012`, `0013`, `0014`, `0015`, `0017`,
`0019`, `0020`, `0022`, `0023`, `0024`, `0025`, `0026`, `0027`, `0028`, `0029`,
`0030`, `0031`, `0032`, `0034`, `0036`, `0115`.

## Spot-checks against the Greek

Three of the twelve pairs the threshold had missed, read out of the source at the
repaired targets:

- `0020` says it "answers `0024`'s ἢ οὐκ ἔχων; by selecting its disjunct verbatim".
  Repaired to `0019` `[57252, 57336)`, which ends
  `… ἢ οὐκ ἔχων;`, and `0020` `[57336, 57373)` reads
  `οὐκ ἔχων, ὡς τὸ εἰκός γε, φάναι.` — the disjunct, verbatim.
- `0024` says "the reply `0030` is ἀληθῆ λέγεις (2nd sg)". Repaired to `0025`
  `[57781, 57799)`, which reads exactly `ἀληθῆ λέγεις.`
- `0017` cites `0021` as the question it assents to. Repaired to `0016`
  `[56958, 57047)`, which ends `ὁ Ἔρως ἔρως ἐστὶν οὐδενὸς ἢ τινός;`, against
  `0017` `[57047, 57078)` = `πάνυ μὲν οὖν ἔστιν.`

## That no owner moved is measured, not asserted

Symposium is the one dialogue activated for claim-speaker consumption
(`derived/plato/voices/cutovers.toml`), so the full cutover sequence was run.

- `derive voices` → the diff of `derived/plato/voices/symposium.toon` is the
  single `ledger_sha256` line, with all **194 compiled rows byte-identical**.
- `derive voice-joins` → the diff of
  `derived/plato/joins/voices/symposium.toon` is the single
  `voice_index_sha256` line, with all **446 join rows byte-identical**.
- `migrate-claim-speakers.ts symposium --plan` → **0 speaker changes**, 185
  already correct, 0 accepted claims blocking.
- `migrate-claim-speakers.ts symposium --verify` → **PASS**, 176 accepted claims
  match the current authority, 0 speakers migrated.
- `wiki/claims/symposium.md` sha256 identical before and after
  (`14a2fbe2…1489fc9`).

That the two compiled diffs are one provenance line each is also the direct
evidence for the claim above that rationale prose never reaches a consumer.

## Gates

`bun run validate` exit 0. Re-running the two-numbering detector over the repaired
ledger reports **0 stale pairs of 34**.

## Authorization and scope note

The corpus reported-turn completion campaign lists "revising Symposium's accepted records while it remains an active
claim consumer" as out of scope, with a matching STOP condition. This repair was
put to the operator with the diagnosis and the measurement, and was authorized on
2026-08-01 as its own commit, on the same bounded pattern as that day's
`context_span` narrowing: prose only, no owner, span, chain, resolution or review
status may move, and `--plan` reporting any claim changing speaker is a hard stop.
The general STOP condition still gates any *other* Symposium record change.

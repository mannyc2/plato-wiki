# Laches reported-turn cohort acceptance

- date: 2026-08-16
- scope: `turn_laches_0099` (192a-b), the sole Laches outer turn required by
  `wiki/reported-turn-scopes.json`
- source: `raw/plato/greek/laches.txt`, chars `28501..28752`, SHA-256
  `a035988ad66603bb28bb451b1b1d53131e572518198a5dbc6f78cb121d97803f`

## Decision

Accept the complete two-record cohort. The depth-1 frame is the printed `ΣΩ.`
turn. Its `{q}`-marked question at `28530..28603` is a depth-2 unresolved
record: `εἰ τοίνυν τίς με ἔροιτο` identifies only an indefinite questioner,
and the in-span vocative `ὦ Σώκρατες` identifies the addressee rather than an
owner. The conditional first-person response `εἴποιμ’ ἂν αὐτῷ` confirms that
the questioner is distinct from Socrates but does not resolve them.

No second child is added for Socrates' hypothetical answer. It is staged for
the already printed speaker himself and therefore introduces no new owner under
the voices protocol.

## Review

The entire required Greek turn, its two boundaries, the printed siglum, the
introducing construction, and both source-span hashes were reviewed directly.
The accepted parent tiles the outer turn; the unresolved child is strictly
nested within it. No attribution relies on doctrine, style, or turn
alternation.

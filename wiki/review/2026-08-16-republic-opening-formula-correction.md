# Republic Book 1 early-formula corrections

- date: 2026-08-16
- scope: `voice_republic_0014`, `voice_republic_0017`,
  `voice_republic_0023`, and `voice_republic_0024` in the Book 1 portion of
  `turn_republic_0001`
- source: `raw/plato/greek/republic.txt`, SHA-256
  `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`

## Decision

The first two rows are directly resolved by their own named parenthetical reporting
formula, rather than by an anaphoric carry-forward:

- `voice_republic_0014` is `ΑΔ.`. Its formula is
  `καὶ ὁ Ἀδείμαντος, ἆρά γε, ἦ δ’ ὅς` at `[1294,1327)`; the reported span is
  `[1312,1385)`.
- `voice_republic_0017` is `ΓΛΑΥ.`. Its formula is
  `καὶ ὁ Γλαύκων, ἔοικεν, ἔφη` at `[1758,1784)`; the reported span is
  `[1773,1800)`.

In each case the formula begins before and ends within the current reported
span. That is the protocol's allowed straddling named-introduction shape, and
the named grammatical subject belongs to the same construction as its reporting
verb. No prior formula, turn alternation, or discourse inference supplies the
owner.

`voice_republic_0023` is separately resolved as `ΣΟΦ.`. The narrative names
`Σοφοκλεῖ` at `[4220,4228)`, then introduces the bounded response with
`καὶ ὅς, {q} εὐφήμει, {/q} ἔφη` at `[4386,4415)`. The name is an antecedent in
the anecdote, not the subject of a preceding reporting formula, so it is valid
for the pronoun under the anaphoric-reporting rule. The record now begins at
that formula (`[4386,4519)`) and cites both pieces of Greek evidence.

`voice_republic_0024` is resolved as the nested `ΣΩ.` turn by extending its
start from `[5188,5397)` to `[5095,5397)`. The added source portion is the
record's own first-person reporting formula, `καὶ ἐγὼ ... καὶ εἶπον` at
`[5095,5186)`, followed immediately by Socrates' direct address to Cephalus.
The formula is now inside the record, as the repeat-owner rule requires; a
pre-span cue or reviewed-attribution substitute was not used.

## Review state

The four rows remain `unreviewed`: this corrects their source-bound candidate
attribution during the ongoing Book 1 review; it does not accept a partial
outer-turn cohort, compile Republic, create a join, or activate a cutover. A
separate independent Greek review confirmed the source claims and offsets before
this canonical correction.

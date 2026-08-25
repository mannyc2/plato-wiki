# Symposium `reviewed_attribution.context_span` narrowing (The corpus reported-turn completion campaign wave 2)

Executed 2026-08-01 on branch `symposium-rereview/narrator-repeat-reviewed-licence`.
Greek source only (`raw/plato/greek/symposium.txt`, sha256 `260b7c57…3447a7`); no
translation, claim ledger, commentary, observation, or external editor's speaker
label was consulted.

## The ruling

`reviewed_attribution.context_span` now carries a universal hard cap of **12,000
characters**, enforced by `VOICE_CONTEXT_SPAN_MAX` in
`packages/harness/src/wiki/voices-validator.ts`. The validator's own words for why:

> A hash over a very wide window proves the reviewer read those bytes, not that
> they were the right ones.

Twenty-two accepted Symposium records shared a single legacy macro-window
`[60542, 82700)` — 22,158 characters, the whole Socrates–Diotima report — and
failed with `reviewed_attribution_context_too_wide`. That window was a lazy
default: every one of the 22 rationales already rested on a *local* handoff, and
in most cases named it. This pass replaced the macro-window with the narrowest
range that actually contains that handoff.

## What changed and what did not

Changed, and only this: `reviewed_attribution.context_span` (`start_char`,
`end_char`, `text_sha256`) and `rationale` prose on the 22 records below.
`text_sha256` is sha256 of `source.slice(start_char, end_char)` over
`raw/plato/greek/symposium.txt`.

**Not** changed on any record: `char_span`, `voice_chain`, `depth`, `resolution`,
`reviewed_attribution.kind`, `candidate_owners`, `limits`, `unresolved_reason`,
`review_status`. **No owner moved.** Symposium is an active claim consumer
(`derived/plato/voices/cutovers.toml`), and `migrate-claim-speakers.ts --plan`
reported zero claims changing speaker after the rebuild. No other dialogue,
claim, observation, relation, commentary record or audio artifact was touched.

Every new context still encloses its record's own `char_span` and sits inside
`turn_symposium_0005` `[3373, 107347)`.

That no owner moved is not only asserted, it is measured. After
`derive voices` and `derive voice-joins`, the diff of
`derived/plato/voices/symposium.toon` is **one line** — `ledger_sha256` — with
all 194 compiled rows byte-identical; the diff of
`derived/plato/joins/voices/symposium.toon` is **one line** —
`voice_index_sha256` — with all 446 join rows byte-identical. The claim ledger's
sha256 is the same before and after migration
(`14a2fbe2…1489fc9`).

## The rationale edits

Two classes of prose change, both narrowing-driven:

1. **Stale cross-references replaced by char offsets.** The rationales cited
   sibling records by id — `0129`, `0130`, `0143`, `0149`, `0158` — under a
   numbering the ledger no longer uses. `voice_symposium_0092`'s "answers 0129
   (ΔΙΟ., ἔφη), whose 2nd-sg οἴει names the answerer" in fact rests on
   `[61446, 61542)`, which is now `voice_symposium_0117`. The offsets are stable
   and lie inside the hashed window; the ids did not. Every such reference is now
   a char range. **This is reported as a finding, not silently repaired: the
   stale ids were a pre-existing defect across the whole cohort, not only these
   22.**
2. **Frame clause re-grounded in the narrowed window.** The eleven ΔΙΟ.-owned
   rationales opened by citing the feminine `ἦ δ’ ἥ` marks at 68801, 70109,
   70502 and 70929 — offsets that fall outside most of the new windows. The
   frame itself (narrator marked `ἦν δ’ ἐγώ` / `ἔφην`, the other party `ἔφη` /
   `ἦ δ’ ἥ`) is retained, but each rationale now names the instance **inside its
   own hashed context**. The A/B adjudication in each is unchanged in substance.

No rationale exceeds 600 characters (longest: 568). No double quote was
introduced into any `rationale`, `limits`, or `unresolved_reason`.

## The 22 records

Old width for all 22: **22,158** (`[60542, 82700)`).

| record | own span | new context | new width | handoff the context now rests on |
|---|---|---|---|---|
| `voice_symposium_0092` | `[61542,61558)` | `[61446,61558)` | 112 | ἔφη-marked question καὶ ἥ, οὐκ εὐφημήσεις; ἔφη· ἢ οἴει … ; at `[61446,61542)`, whose 2nd-sg οἴει names the answerer |
| `voice_symposium_0093` | `[61558,61643)` | `[61446,61922)` | 476 | both marks of the other party in-window (καὶ ἥ … ἔφη @61446, οὐκ οἶσθ’, ἔφη @61710); τί τοῦτο; `[61643,61657)` asks and the ἔφη-marked `[61657,61922)` answers |
| `voice_symposium_0094` | `[61643,61657)` | `[61558,61922)` | 364 | queries the τι μεταξύ posited at `[61558,61643)`; answered by the ἔφη-marked `[61657,61922)` |
| `voice_symposium_0095` | `[62327,62350)` | `[62199,62350)` | 151 | ἦν δ’ ἐγώ-marked `[62199,62268)` reaffirmed against the ἔφη-marked challenge `[62268,62327)` |
| `voice_symposium_0096` | `[62760,62828)` | `[62581,62848)` | 267 | καὶ ἥ, ῥᾳδίως, ἔφη @62581 vs the narrator's μὰ Δί’ οὐκ ἔγωγ’, ἔφην. `[62732,62760)`; assent πάνυ γε. `[62828,62848)` |
| `voice_symposium_0097` | `[62828,62848)` | `[62732,62848)` | 116 | assents to `[62760,62828)`, which follows the narrator's own ἔφην-marked `[62732,62760)` |
| `voice_symposium_0098` | `[62848,62954)` | `[61959,62973)` | 1014 | καὶ ἣ γελάσασα … ἔφη, ὦ Σώκρατες `[62350,62478)` naming its addressee @62386; αὐτὸς ὁμολογεῖς @62068; 2nd-sg ὡμολόγηκας answered by 1st-sg ὡμολόγηκα `[62954,62973)` |
| `voice_symposium_0099` | `[62954,62973)` | `[62848,62973)` | 125 | 1st-sg ὡμολόγηκα answering the 2nd-sg ὡμολόγηκας of `[62848,62954)` |
| `voice_symposium_0100` | `[62973,63032)` | `[62848,63113)` | 265 | ὁρᾷς οὖν, ἔφη, ὅτι καὶ σὺ … νομίζεις; `[63059,63113)` cites this span's answer back to its 2nd-sg addressee |
| `voice_symposium_0101` | `[63032,63059)` | `[62973,63113)` | 140 | concession to `[62973,63032)`, ascribed to the 2nd-sg addressee by the ἔφη-marked `[63059,63113)` |
| `voice_symposium_0102` | `[63154,63169)` | `[63113,63241)` | 128 | narrator's τί οὖν ἄν, ἔφην, … ; `[63113,63154)` and the other party's ὥσπερ τὰ πρότερα, ἔφη, … `[63186,63241)` — both marks in one window |
| `voice_symposium_0103` | `[63169,63186)` | `[63113,63241)` | 128 | same alternation; follows the ἔφην-marked `[63113,63154)` in the 1st-person role, answered by the ἔφη-marked `[63186,63241)` |
| `voice_symposium_0104` | `[63393,64108)` | `[63264,64164)` | 900 | flanked by τίνα, ἦν δ’ ἐγώ, δύναμιν ἔχον; `[63358,63393)` and πατρὸς δέ, ἦν δ’ ἐγώ, … ; `[64108,64164)`; ὦ Σώκρατες @63282 |
| `voice_symposium_0105` | `[67677,67722)` | `[67331,67801)` | 470 | answered by τοῦτ’ εὐπορώτερον, ἦν δ’ ἐγώ, … `[67722,67801)`; verbatim doublet of the ἔφη-marked `[67331,67424)`; substitution ἀντὶ τοῦ καλοῦ τῷ ἀγαθῷ announced at `[67511,67646)` |
| `voice_symposium_0106` | `[67995,68145)` | `[67966,68188)` | 222 | flanked by ἀληθῆ λέγεις, εἶπον ἐγώ. `[67966,67995)` and οὕτως, ἦν δ’ ἐγώ· … `[68145,68188)` |
| `voice_symposium_0107` | `[68539,68768)` | `[68514,69070)` | 556 | answers ὥσπερ τί; ἦν δ’ ἐγώ. `[68514,68539)`; resumed by the ἦ δ’ ἥ-marked `[68786,69070)` (@68801) on the same οἶσθ’ ὅτι frame |
| `voice_symposium_0108` | `[68768,68786)` | `[68539,69070)` | 531 | 2nd-sg λέγεις to the speaker of `[68539,68768)`, who resumes immediately after as ἦ δ’ ἥ @68801 |
| `voice_symposium_0109` | `[69101,69511)` | `[68786,69552)` | 766 | flanked by ἀληθῆ λέγεις, ἔφην. `[69070,69101)` and κινδυνεύεις ἀληθῆ, ἔφην ἐγώ, λέγειν. `[69511,69552)`; extends the ποίησις distinction of the ἦ δ’ ἥ-marked `[68786,69070)` |
| `voice_symposium_0110` | `[70259,70275)` | `[70189,70275)` | 86 | echoes the verbal adjective of the ἔφη-marked τί δέ; οὐ προσθετέον, ἔφη, … ; `[70189,70259)` |
| `voice_symposium_0111` | `[70333,70359)` | `[70275,70359)` | 84 | answers the ἔφη-marked ἆρ’ οὖν, ἔφη, … ; `[70275,70333)` |
| `voice_symposium_0112` | `[71916,71933)` | `[71855,71933)` | 78 | responds to ἔστιν γάρ, ὦ Σώκρατες, ἔφη, οὐ τοῦ καλοῦ ὁ ἔρως, ὡς σὺ οἴει. `[71855,71916)` — vocative @71866 plus 2nd-sg σὺ οἴει name the addressee |
| `voice_symposium_0113` | `[71933,71977)` | `[71855,71998)` | 143 | completes the ἔφη-marked `[71855,71916)`'s own denial οὐ τοῦ καλοῦ ὁ ἔρως across ἀλλὰ τί μήν; `[71916,71933)`; closed by the narrator's εἶεν, ἦν δ’ ἐγώ. `[71977,71998)` |

Widths: minimum 78, **median 186.5**, **maximum 1014**, all 22 well under the
12,000 cap. Total context bytes hashed dropped from 487,476 to 7,122.

`voice_symposium_0102` and `voice_symposium_0103` share the context
`[63113, 63241)` and therefore the same `text_sha256` — they are the two halves of
one four-turn alternation and rest on the same handoff. All other 20 hashes are
distinct.

## Records that could not be narrowed

None. Every one of the 22 narrowed below 12,000 without weakening its
adjudication; the widest, `voice_symposium_0098` at 1014, is wide only because
its rationale reaches back to αὐτὸς ὁμολογεῖς at 62068 and forward to the reply
at 62973, and both endpoints are load-bearing.

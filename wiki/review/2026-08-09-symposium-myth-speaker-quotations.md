# Symposium — staged direct speech of Zeus and Hephaestus inside Aristophanes' myth, added

Executed 2026-08-09 on branch `symposium-rereview/narrator-repeat-reviewed-licence`.
Greek source only (`raw/plato/greek/symposium.txt`, sha256
`260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7`); no
translation, commentary, or external editor's speaker label was consulted.

## The gap

`derived/plato/voices/sigla.toml` has carried `ΖΕΥΣ.` and `ΗΦΑΙ.` as registered
Symposium sigla since the 2026-07-29 operator ruling, each with its licensing
construction written into the registry comment. No record used either. The four
`{q}`-marked spans those constructions govern sat inside
`voice_symposium_0064` — Aristophanes' speech, 189c–193e — and were therefore
attributed to Aristophanes, the reporting voice, rather than to the speakers his
myth quotes.

Registration is not attribution, so the registry entries were not themselves the
defect; the missing records were. This pass adds them.

**This was not a new scope decision.** `docs/voices-protocol.md`, the reported-turn
scope census, the corpus reported-turn completion campaign and the sigla registry already settle that staged direct
speech is in scope whatever the mood of its licensing verb, and that a named
individual inside a myth is a speaker rather than an abstraction. The
counterfactual optative in the Hephaestus formula bears on what the words
evidence, not on who owns them.

## The four spans

All offsets are UTF-16 offsets into the source read as UTF-8, verified by slicing
and by SHA-256 of the exact bytes. Every span is marker-inclusive: it opens at
`{q` and closes at `q}`, and no inquit, repeated formula or Aristophanes narration
falls inside it.

| record | span | Stephanus | owner | bytes |
|---|---|---|---|---|
| `voice_symposium_0195` | `[37386, 37404)` | 190c | `ΖΕΥΣ.` | `{q} δοκῶ μοι, {/q}` |
| `voice_symposium_0196` | `[37410, 37497)` | 190c | `ΖΕΥΣ.` | `{q} ἔχειν μηχανήν, ὡς ἂν εἶέν τε ἅνθρωποι καὶ παύσαιντο τῆς ἀκολασίας ἀσθενέστεροι {/q}` |
| `voice_symposium_0197` | `[41879, 41947)` | 192d | `ΗΦΑΙ.` | `{q} τί ἔσθ’ ὃ βούλεσθε, ὦ ἄνθρωποι, ὑμῖν παρ’ ἀλλήλων γενέσθαι; {/q}` |
| `voice_symposium_0198` | `[41987, 42162)` | 192d | `ΗΦΑΙ.` | `{q} ἆρά γε τοῦδε ἐπιθυμεῖτε … θέλω ὑμᾶς συντῆξαι καὶ {/q}` |

Span hashes:

| record | `span_sha256` |
|---|---|
| `0195` | `762613bc3d514eb7198a00ac85e443f5232f7f05d95abd222c81fa5f3d420828` |
| `0196` | `faec28ffaeaf26a5be7e1996dc98c28d25d978083064bf990cf5dc4d2d38b5d0` |
| `0197` | `0bd73c429cdbfbb9f95e37376bec7b05e62ee8d812897e921ac4f9283a85b4b5` |
| `0198` | `5e430247039b004a6840b775e5b07d3afcd52c88a1c8a5aaacdf861786ab84a8` |

## The licensing constructions

Both are `named_reporting_formula`: a proper name in the nominative governing a
finite speech verb. Both were verified byte-for-byte against the source.

- `[37351, 37385)` — `μόγις δὴ ὁ Ζεὺς ἐννοήσας λέγει ὅτι`. Nominative `ὁ Ζεύς`
  governs the finite `λέγει`, and `ὅτι` recitativum opens the quotation. The
  formula ends one character before `0195` begins.
- `[41835, 41877)` — `ἐπιστὰς ὁ Ἥφαιστος, ἔχων τὰ ὄργανα, ἔροιτο`. Nominative
  `ὁ Ἥφαιστος` governs the finite optative `ἔροιτο`. The formula ends two
  characters before `0197` begins.

Both sit inside the validator's 600-character lookback for each of their two
spans (`0196` is 25 characters after its formula, `0198` 110).

## What was deliberately excluded

- ` ἔφη, ` at `[37404, 37410)` — the inquit around which the edition closes and
  reopens Zeus's quotation. It is narration and stays at the Aristophanes level;
  the single `λέγει ὅτι` governs both halves.
- `καὶ εἰ ἀποροῦντας αὐτοὺς πάλιν ἔροιτο·` at `[41948, 41986)` — the repeated
  formula that reopens Hephaestus' question. Its elided subject is the
  `ὁ Ἥφαιστος` already named at 41835, so it licenses `0198` without being part
  of it.
- `{190d} γενόμενοι. νῦν μὲν γὰρ αὐτούς, ἔφη, διατεμῶ δίχα …` from 37498 and
  `{192e} συμφυσῆσαι εἰς τὸ αὐτό …` from 42162. Both continue the quoted speaker's
  sense, and neither carries `{q}`. The records track the edition's markup, not a
  reconstruction of where the speech "really" ends.

## Geometry

All four nest at depth 4 beneath `voice_symposium_0064` (depth 3,
`[34948, 44505)`, chain `ΑΠΟΛ. > ΑΡΙΣΤΟΔ. > ΑΡΙΣΤΟΦ.`), extending its chain by one
hop. `0064`'s `limits` was amended to record that it now encloses deeper spans it
does not own — the same wording `voice_symposium_0091` already carries for the
Diotima conversation.

Ids are fresh and strictly above the previous maximum `voice_symposium_0194`. No
surviving record was renumbered.

## Effects on the claim ledger

Symposium is active in `derived/plato/voices/cutovers.toml`, so this pass ran the
full migration sequence. Result: **zero claim `speaker` changes.**
`wiki/claims/symposium.md` ends at the same 196 claims with the same speakers;
`migrate-claim-speakers --verify` reports 176 accepted claims matching the current
authority and 0 migrated.

Three accepted claims did have to be re-anchored first, and the first `--plan` run
correctly refused to apply until they were. All three are claims whose context
window contains one of the four new quotations, so what changed is that their
window stopped being single-voiced and their `greek_terms` had to actually locate
their support. Each defect was pre-existing and was merely exposed:

| claim | defect | repair |
|---|---|---|
| `claim_symposium_0056` | `greek_terms` wrote `ἰσχὺν δεινά`; the source reads `ἰσχὺν δεινὰ` at `[36855, 36866)` — the contextual grave, not the lexical acute | corrected the accent |
| `claim_symposium_0057` | same defect: `πλείους τὸν ἀριθμόν` for the source's `πλείους τὸν ἀριθμὸν` at `[37629, 37648)`. Separately, `ἀσθενέστεροι` occurs twice in the window — once inside Zeus's quotation at 37480, once in the unmarked continuation at 37575 — and the two occurrences give different owners | corrected the accent; narrowed the ambiguous term to `ἀσθενέστεροι ἔσονται`, unique at `[37575, 37595)`, which is the occurrence in the same sentence as the claim's other three anchors |
| `claim_symposium_0063` | two terms, `θαυμαστὰ` at 41282 and `φιλίᾳ` at 41304, sat **before** the claim's own window start of 41317, so they were never verifiable; and `συντῆξαι` at 42145 sits inside Hephaestus' quotation, in a voice other than the claim's `ΑΡΙΣΤΟΦ.` | widened the window to 192b–192e `[40927, 42715)`, which is where the sentence the claim summarises actually begins, and replaced `συντῆξαι` with `ἐξαρνηθείη` at `[42453, 42463)` — Aristophanes' own `οὐδ’ ἂν εἷς ἐξαρνηθείη`, which is the byte that supports "they would accept" in the asserting voice |

`claim_symposium_0063`'s widened window and its stance event both carry the
recomputed `text_sha256`
`f1b46b7f256cb8cba1f6fcc542251effe06140ab1988f831ade02012bf36e2cc`.

The 11 `unresolved_but_not_accepted` claims are unchanged in count and identity,
and `already_correct` returned to its pre-change value of 185.

## Every effect on the compiled join, enumerated

`derived/plato/joins/voices/symposium.toon` was regenerated. Excluding the two
provenance hash lines, **exactly five records changed**, and every one of them
cites one of the four new spans — the join names the responsible record ids in
its own evidence column. Nothing outside those four regions moved.

| record | before | after | why |
|---|---|---|---|
| `claim_symposium_0056` | `resolved` ΑΡΙΣΤΟΦ., evidence "single-voiced context window" | `resolved` ΑΡΙΣΤΟΦ., evidence `voice_symposium_0064`, trajectory `ΑΡΙΣΤΟΦ.>(unresolved)` | its window is no longer single-voiced, so the owner now comes from the five anchored terms instead of from the window; the owner is unchanged |
| `claim_symposium_0057` | same | same, 4 anchored terms | same |
| `claim_symposium_0063` | same | same, 5 anchored terms | same |
| `obs_symposium_0048` | `resolved` ΑΡΙΣΤΟΦ. | `cross_voice`, `(unattributed)`, evidence `0064,0195,0196` | its 190b–190c window genuinely contains Zeus's quoted words |
| `obs_symposium_0059` | `resolved` ΑΡΙΣΤΟΦ. | `cross_voice`, `(unattributed)`, evidence `0064,0197,0198` | its 192d–192e window genuinely contains Hephaestus' quoted words |

The three claims' **stance-event** rows moved with the observations, from
`resolved` ΑΡΙΣΤΟΦ. to `cross_voice` / `(unattributed)`. Claim owners are resolved
from anchored support ranges; stance events and observations are resolved from
their declared window, with no anchoring mechanism. So a stance window or an
observation window that really does span two voices is reported as spanning two
voices.

**These two observations and three stance events are not defects and were not
"anchored away".** `packages/harness/src/derived/voice-joins.ts` states the rule
in its own words — "an observation describes a stretch of text, so a broad span
that genuinely covers several voices is correctly `cross_voice` — that is a true
fact about the observation, not a defect to anchor away." Both observations quote
the god verbatim in their `textual_basis`: `obs_symposium_0048` quotes Zeus's
`I think I have a mechanism`, and `obs_symposium_0059` quotes Hephaestus'
`What is it you want, humans`. Before this pass the join called those utterances
Aristophanes'. It now declines to attribute them to one voice, which is a more
accurate statement about the same bytes.

Nothing gates on a join row's `attributed` flag: `bun run completeness` and
`bun run release:audit` are unaffected, and `migrate-claim-speakers --verify`
reads the claim owner, which did not move.

## Independent verification, 2026-08-09

A read-only pass verified the four records and every migration effect against the
source. It returned **no STOP-condition finding** and confirmed confinement in
**both** directions: it enumerated every claim and observation in the dialogue
whose window overlaps any of the four new spans and got exactly the five records
above — so every row that changed intersects a new region, and every record that
intersects a new region changed. It also confirmed that only four `{q}` regions
exist anywhere inside `voice_symposium_0064`, and all four are now recorded with
byte-exact bounds.

It sharpened two things this receipt had stated more weakly. The two downgraded
observations do not merely *contain* a quoted god — each **cites one of his words
as an anchor**: `obs_symposium_0048` lists `μηχανήν`, which occurs once in the
dialogue, at 37420, inside `0196`; `obs_symposium_0059` lists `συντῆξαι` at 42145,
inside `0198`. And the record-level/stance-level asymmetry is pre-existing rather
than introduced here: `HEAD` already carried 78 such divergences in this file and
the working tree carries 81, a delta of exactly these three claims.

It found two defects, both cosmetic and both fixed: `0195`/`0196` cited the inquit
as `ἔφη` at 37405-37409, a range that slices to `ἔφη,` (the quote now carries the
comma), and `0198` cited `καὶ εἰ ἀποροῦντας αὐτοὺς πάλιν ἔροιτο` at 41948-41986, a
range that includes the raised dot (the quote now carries it).

It also reported one **pre-existing** defect left unfixed here, in the same class
as the three this pass repaired: `obs_symposium_0048` lists a `greek_terms` entry
`τιμαί` that occurs **zero** times in `raw/plato/greek/symposium.txt`. It changes
nothing today — the join builder does not consume observation `greek_terms`, so
there is no fail-closed gate on the observation side as there is on the claim side
— but it is unverifiable evidence sitting in an accepted record. It is out of this
pass's scope and is recorded here so a corpus-wide sweep of observation
`greek_terms` can pick it up.

## Final state

| | |
|---|---|
| `wiki/voices/symposium.md` | `5948b5f177e5da0e4a32b99ccaa7f252e6907f896e9be3b6208cd98bae341382` |
| `derived/plato/voices/symposium.toon` | `03a4952e32dba2e645754abf01b10229d3570804c651224a728d9a74034b8ca6` |
| `derived/plato/joins/voices/symposium.toon` | `41369d660055be6cafd5ad72525744625f6bb7f85055fdf7a626d9ca7b82f1d6` |
| `raw/plato/greek/symposium.txt` | `260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7` |
| records / accepted | 198 / 198 |
| depth 1 / 2 / 3 / 4 | 2 / 11 / 120 / 65 |
| resolved / unresolved | 197 / 1 |
| ledger validator | 0 issues |

Owners of the 197 resolved records: ΣΩ. 58, ΔΙΟ. 44, ΑΓΑ. 32, ΑΛΚ. 17, ΕΡΥ. 14,
ΑΡΙΣΤΟΦ. 7, ΑΠΟΛ. 6, ΓΛΑΥ. 6, ΦΑΙ. 5, ΠΑΥ. 2, ΖΕΥΣ. 2, ΗΦΑΙ. 2, ΑΡΙΣΤΟΔ. 1,
ΠΑΙΣ. 1.

`ΖΕΥΣ.` and `ΗΦΑΙ.` are used for the first time by this pass; every other
registered Symposium siglum was already in use.

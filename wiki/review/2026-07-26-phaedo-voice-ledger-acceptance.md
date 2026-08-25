# Phaedo voice ledger — acceptance of the complete reported-turn cohort (the Phaedo discourse attribution review step 6)

**Date**: 2026-07-26
**Source**: `raw/plato/greek/phaedo.txt`, sha256
`b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Authorization**: the Phaedo discourse attribution review, ratified by the operator 2026-07-26 at commit
`ac7c5bb`, whose step 6 instructs the executor to change the accepted cohort
atomically. The operator directed acceptance in this session after being shown
the candidate's counts and the three open decisions below.
**Action**: all 593 records in `wiki/voices/phaedo.md` move
`unreviewed` → `accepted` as one atomic cohort.

## What is being accepted

| Turn | Stephanus | Records | Explicit | Reviewed discourse | Unresolved |
|---|---|---|---|---|---|
| `turn_phaedo_0027` | 59c–88c | 350 | 63 | 286 | 0 |
| `turn_phaedo_0031` | 89a–102a | 112 | 29 | 82 | 1 |
| `turn_phaedo_0035` | 102a–118a | 131 | 21 | 109 | 2 |
| **Total** | | **593** | **113** | **477** | **3** |

The explicit column counts every record resolved by cited bytes, including the
three depth-1 `printed_siglum` records and the three `{q}`-bounded quotations
inside turn 27's opening narration.

Owners, by authority shape, across all three turns:

| Owner | Explicit | Reviewed discourse |
|---|---|---|
| ΣΩ. | 27 | 274 |
| ΚΕΒ. | 36 | 110 |
| ΣΙΜ. | 28 | 90 |
| ΦΑΙΔ. | 11 | 0 |
| ΚΡ. | 5 | 1 |
| ΥΠΗΡ. | 1 | 2 |
| ΘΥΡ. | 1 | 0 |
| ΞΑΝΘ. | 1 | 0 |

Phaedo's eleven are his narrator-participant turns at 89b–d, carried by
first-person formulas. No unit anywhere was assigned to him by discourse
adjudication: where he speaks inside the conversation, the text marks it.

Evidence kinds in the accepted cohort: `named_reporting_formula` 97,
`person_marked_reporting_formula` 11, `printed_siglum` 3,
`role_reporting_formula` 2. `anchored_dialogue_turn` appears nowhere — it is
licensed by a bounded two-party exchange, and this conversation is not one.

## What this accepts, and what it does not

Accepting a `reviewed_attribution` record accepts an **adjudication**, not a
quotation. 477 of these 593 records are of that kind. Each cites a bounded Greek
context by offsets and a SHA-256 of its exact bytes, names the locally plausible
owners it chose between, and states the structural ground. A later reader who
rejects the adjudication can find the bytes it rested on and argue from them,
and can reject all 477 without touching the 113 that rest on cited formulas.
That separation is the reason the Phaedo discourse attribution review introduced a second authority shape
instead of widening the first.

This acceptance **does not activate anything**. Phaedo is absent from
`derived/plato/voices/cutovers.toml`; no claim, observation, relation,
commentary record or audio artifact changes; no voice join is written. The voice activation contract
decoupled compilation from activation precisely so that this step could be taken
on its own merits.

## The provenance behind it

Four review notes, all dated 2026-07-26:

- `2026-07-26-phaedo-reported-turn-census.md` — all 35 outer turns scanned, 3
  with nested discourse, 32 explicit zero results.
- `2026-07-26-phaedo-explicit-formula-adjudication.md` — 130 reporting-cue sites
  in turns 0031 and 0035, four agents in two independent pairs, every offset
  re-verified by exact slice. Zero speaker disagreement.
- `2026-07-26-phaedo-discourse-adjudication.md` — turn 0031's 85 bare units, two
  independent passes, zero speaker disagreement.
- `2026-07-26-phaedo-0027-discourse-adjudication.md` and
  `2026-07-26-phaedo-0035-discourse-adjudication.md` — turns 0027 and 0035, two
  independent passes each over ten and five sequential segments, zero verdict and
  zero speaker disagreement in either.

Across all four passes and all three turns, two blind adjudicators disagreed
about no speaker anywhere in this dialogue.

## Three decisions taken by the operator before acceptance

1. **The 102a joint-speaker ruling extends to 91e.** Both third-person duals in
   turn 0031 carry no depth-2 record, and neither is counted as ambiguity. The
   published genuine-ambiguity count for Phaedo is therefore 3, not 4.
2. **Five turn 0035 formula spans widen by their leading `καὶ`**, to the
   convention the explicit adjudication stated and turn 0031 already followed.
   No speaker and no record span changed.
3. **Proceed to acceptance and compilation.**

## Two defects the acceptance itself surfaced

Both were invisible while the cohort was unreviewed, because the checks that
found them are the ones acceptance turns on.

1. **`role_reporting_formula` was not admitted by the straddling-introduction
   rule.** The attendant of the Eleven's cue at 116c begins in Phaedo's
   narration and closes after the speech's first words, exactly like the named
   introductions the protocol already admits, but the validator's exception
   named only `named_reporting_formula`. Fixed: the exception turns on the cue
   naming its speaker up front, not on whether the source printed a proper noun.
2. **One unresolved reason exceeded the 400-character limit.** The downgraded
   record at 107b was shortened; nothing was dropped from its substance.

## Gates

`bun run test`, `bun run typecheck`, `bun run validate` and `bun run ci` all exit
0 at acceptance. `git diff --check` is clean. `wiki/claims/phaedo.md`,
`wiki/observations/phaedo.md`, `wiki/relations/phaedo.md`,
`derived/plato/joins/voices/phaedo.toon` and
`derived/plato/voices/cutovers.toml` are unchanged.

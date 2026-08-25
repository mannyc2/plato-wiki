# Phaedo explicit reporting formulas — independent adjudication (the Phaedo discourse attribution review step 6, first layer)

**Date**: 2026-07-26
**Source**: `raw/plato/greek/phaedo.txt`, sha256
`b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Scope**: turns `turn_phaedo_0031` and `turn_phaedo_0035`. Turn
`turn_phaedo_0027` already carries a reviewed formula table in
`scripts/voices-2026-07/build-phaedo-voice-ledger.ts` and was not re-reviewed here.
**Status**: reviewed adjudication of the EXPLICIT-EVIDENCE layer only. No voice
record was created, accepted, or compiled by this pass. The reviewed-discourse
layer over the remaining bare cues is separate and not covered here.

## Method

130 reporting-cue sites were extracted with ±320 characters of Greek context and
adjudicated by **four agents in two independent pairs** — two per turn, each
pass blind to its counterpart. Every pass was instructed to work from the Greek
alone: no translation, commentary, edition apparatus, doctrine, style, register,
or vocabulary. Each site was classified as `named_subject`, `role_subject`,
`first_person`, `vocative_only`, `oblique`, or `bare`.

Two passes are not a formality here. The previous Phaedo builder resolved a unit
only when its own paragraph carried a naming formula, and its 288 unresolved
records were read for months as a fact about the Greek. A single unreviewed pass
is the failure mode this lane already had once.

Every offset below was verified a third time by the integrator, by exact slice
comparison against the source. Both agents mis-added their own summary tallies;
the counts here are computed from the per-site data, not from agent summaries.

## Turn geometry these offsets are anchored to

All character offsets in this note are absolute positions in
`raw/plato/greek/phaedo.txt`. The turns they belong to, taken from
`derived/plato/turns/phaedo.toon`:

| turn | span | stephanus |
|---|---|---|
| `turn_phaedo_0027` | `[4681, 74605)` | 59c–88c |
| `turn_phaedo_0031` | `[75971, 105377)` | 89a–102a |
| `turn_phaedo_0035` | `[105695, 143492)` | 102a–118a |

Stated explicitly because an intermediate scan in this session used spans for
0031 and 0035 that were both shifted +162 characters, and the error was invisible
until a unit was seen to begin mid-word. Every span recorded below was
subsequently re-verified against the geometry above: all 29 in 0031 and all 19 in
0035 fall inside their true turn. The 162-character heads the bad window missed
contain no reporting cue in either turn — both are the turns' narration openings
— so no adjudication was lost. Any future scan must read these bounds from the
turn index rather than transcribing them.

## Agreement

| | turn 0031 | turn 0035 |
|---|---|---|
| sites | 60 (+2 recovered, below) | 70 |
| **speaker disagreements** | **0** | **0** |
| span-extent disagreements | 3 | 1 |
| classification-only differences | 0 | 1 |
| named_subject | 18 | 18 |
| role_subject | 0 | 1 |
| first_person (all ΦΑΙΔ.) | 11 | 0 |
| vocative_only | 9 | 8 |
| oblique | 4 | 3 |
| bare | 20 | 40 |

Zero speaker-level disagreement across all 130 sites.

### Disagreements and their disposition

All four span disagreements are the same question — whether the formula span
includes a leading connective or participle — and none changes a speaker.

| site | turn | pass A | pass B | disposition |
|---|---|---|---|---|
| 24 | 0031 | `[82714, 82762)` | `[82710, 82762)` | take the wider span; the `καὶ` is part of the narrative frame that carries the nominative |
| 44 | 0031 | `[91591, 91651)` | `[91587, 91651)` | wider |
| 58 | 0031 | `[103628, 103670)` | `[103624, 103670)` | wider |
| 59 | 0035 | `[140506, 140563)` | `[140514, 140563)` | wider; `ἰδὼν δὲ` is the participle whose subject is the nominative |
| 61 | 0035 | `vocative_only`, addressee ΕΧ. | `bare` | immaterial — neither names a speaker. Recorded as `bare`: `ὦ Ἐχέκρατες` addresses the outer frame, not this utterance |

Convention adopted: **a formula span runs from the first word of the narrative
frame that carries the nominative through the reporting verb.**

## Defects this review found in the extraction

Both are silent-failure orthographic defects in the integrator's scan, not in
the Greek and not in the agents' work.

1. **Two elision marks.** The source uses U+2019 (`δ’`, 67×) *and* U+1FBD Greek
   koronis (`δ᾽`, 4×). The scan matched only U+2019 and dropped four sites, two
   of them `ἦν δ᾽ ἐγώ` at [76330, 76339) and [77806, 77815) — Phaedo as
   narrator-participant, the exact category the Phaedo discourse attribution review flags for review. Recovered
   as sites 61 and 62 and adjudicated by pass B.
2. **Two accentuations.** `ἦ δ’ ὅς` with acute occurs 57× and `ἦ δ’ ὃς` with
   grave 6×; the scan matched only the grave. Fourteen acute cues inside turn
   0031 were missing from the site file, at 77137, 77829, 78130, 82266, 83140,
   83620, 84631, 85221, 87573, 87716, 100090, 101186, 102032, 103684. All
   classify `bare` except 84631 (`ἦ δ’ ὅς, ὦ Σιμμία`), which is `vocative_only`
   addressing ΣΙΜ. **No attribution is lost**, but the scope count was
   understated, and scope is what a completeness check quotes.

The census note's cue counts were corrected accordingly (326 → 336) in the same
commit as this file. A third error — the integrator asserting to both 0035
passes that no koronis occurs in that turn, when 16 do — was caught by pass A
and affected no data, because both passes verified by exact slice rather than by
pattern.

## Joint speakers at 102a: a schema gap, ruled

```
ἀληθέστατα, ἔφη, λέγεις, ὅ τε {pers} Σιμμίας {/pers} ἅμα καὶ ὁ {pers} Κέβης {/pers} .
```

Both passes independently read the delayed compound nominative as the subject of
`ἔφη`: one utterance spoken jointly. The only competing finite verb, `λέγεις`,
is second person and cannot govern a third-person pair; `ἅμα` marks the two as
performing one act. Pass B added independent corroboration — the same pair takes
**dual** verbs nearby (`συνωμολογείτην`, `ἐφάτην`, 91e–92a) — so joint utterance
is an established category in this narration rather than an ad hoc reading.

`voice_chain` terminates in exactly one owner, so the schema cannot express
this. Recording it `unresolved` would assert ambiguity where two independent
passes agree there is none, and would later be miscounted as genuine ambiguity;
two same-depth records would trip `overlap_same_depth`.

**Ruled 2026-07-26 (operator)**: emit **no depth-2 record** for this utterance.
Its characters stay with the printed turn siglum ΦΑΙΔ. This is a known,
documented schema gap, not a resolution and not an ambiguity. A later plan may
add joint-speaker support and backfill it; nothing here authorizes that.

## Adjudicated formulas

Speaker, exact formula bytes, and verified offsets. Spans follow the convention
above. These are the explicit-evidence resolutions only; every other site in
these turns is `bare`, `vocative_only`, or `oblique` and awaits the
reviewed-discourse layer.

### turn_phaedo_0031 — first person (narrator-participant), 11

ΦΑΙΔ. at [76409, 76418), [76755, 76764), [76928, 76932), [77103, 77112),
[78109, 78117), [78456, 78465), [78587, 78596), [79261, 79269), [79821, 79830),
[76330, 76339), [77806, 77815).

### turn_phaedo_0031 — named subject, 18

| speaker | span |
|---|---|
| ΚΕΒ. | [82473, 82499) |
| ΣΙΜ. | [82587, 82615) |
| ΣΩ. | [82710, 82762) |
| ΣΙΜ. | [83576, 83604) |
| ΣΙΜ. | [83709, 83737) |
| ΣΙΜ. | [86123, 86151) |
| ΣΩ. | [89574, 89607) |
| ΚΕΒ. | [89825, 89851) |
| ΣΩ. | [90221, 90250) |
| ΚΕΒ. | [91587, 91651) |
| ΣΩ. | [91716, 91820) |
| ΚΕΒ. | [92089, 92115) |
| ΚΕΒ. | [93675, 93701) |
| ΚΕΒ. | [94049, 94075) |
| ΚΕΒ. | [101129, 101155) |
| ΚΕΒ. | [101687, 101713) |
| ΚΕΒ. | [103624, 103670) |
| (joint, no record — see above) | [105303, 105374) |

### turn_phaedo_0035 — named and role subject, 19

| speaker | span |
|---|---|
| ΚΕΒ. | [107966, 107992) |
| ΣΩ. | [108378, 108459) |
| ΚΕΒ. | [109116, 109142) |
| ΚΕΒ. | [111521, 111547) |
| ΚΕΒ. | [114507, 114533) |
| ΣΩ. | [116683, 116712) |
| ΣΙΜ. | [117722, 117754) |
| ΣΩ. | [117982, 118038) |
| ΣΙΜ. | [120930, 120971) |
| ΣΙΜ. | [121574, 121602) |
| ΣΙΜ. | [122101, 122129) |
| ΣΙΜ. | [124523, 124551) |
| ΚΡ. | [135792, 135827) |
| **ΥΠΗΡ.** | [138592, 138673) — `ὁ τῶν ἕνδεκα ὑπηρέτης`, role subject |
| ΣΩ. | [139188, 139247) |
| ΚΡ. | [139591, 139632) |
| ΣΩ. | [139933, 139976) |
| ΣΩ. | [140506, 140563) |
| ΚΡ. | [143038, 143073) |

## Traps both passes refused

Recorded because a future pattern-based pass will hit them again.

- **`ὡς ἀστεῖος, ἔφη, ὁ ἄνθρωπος`** (0035 site 55). `ὁ ἄνθρωπος` is the subject
  of the exclamation and of the four following finite verbs, not of `ἔφη`.
  Socrates is speaking *about* the attendant. Both passes marked it `bare`;
  attributing it to the attendant would invert the speaker.
- **`εἶπον`** (0035 site 39) is 1sg but sits inside Socrates' quoted speech, so
  its person does not index the narrator.
- **`ὁ ἄνθρωπος`** is the ordinary common noun at 70a, 80c and 87b, not a
  speaker at all. Only the death-scene occurrences denote the attendant.
- **Apollodorus** appears near 141760 as a narrated nominative (weeping) and
  never as the subject of a reporting verb. He has a registered siglum but owns
  no utterance in these turns.

## What this does not establish

- It does not resolve any bare cue. That is the reviewed-discourse layer's work.
- It creates no voice record and changes no claim, observation, or relation.
- Phaedo remains absent from `derived/plato/voices/cutovers.toml`.

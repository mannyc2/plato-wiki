# Timaeus needs_split repair slice B

Scope: `obs_timaeus_0140` at 44c, `obs_timaeus_0142` at 44e,
`obs_timaeus_0147` at 45e, `obs_timaeus_0157` at 47e, and
`obs_timaeus_0168` at 55a.

Method: source text was checked only against `raw/plato/greek/timaeus.txt`.
`source_ref` metadata below comes from
`resolveSourceSpan("timaeus", span)` in `packages/harness/src/source.ts`.
No translations, Pioneer, review-segmented, review-queue, external providers,
or model-backed harness paths were used.

## obs_timaeus_0140

Current status: `needs_split`; current span `44c`.

Recommendation: accepted narrowed/repaired record. Keep the current
`source_ref` span as `44c`; do not expand to `44c-44d`. The exact 44c source
supports the procedural return to more exact causal/body/soul matters, but the
current record's likely-account phrase depends on the `44d` opening and would
pull in the next head/body construction unit.

Proposed `source_ref`: unchanged from current `44c`.

Proposed `greek_terms`: `[ὕστερά, προτεθέντων, ἀκριβέστερον, σωμάτων, ψυχῆς, αἰτίας, προνοίας]`

Proposed `observation`: "Timaeus sets aside the preceding consequences as later matters and redirects the account to a more exact treatment of the proposed topics, including bodily generation by parts, soul, causes, and divine forethought."

Proposed `textual_basis`: "At 44c, Timaeus says the prior consequences come later and that the matters now proposed must be gone through more exactly, naming bodily generation by parts, soul, causes, and the gods' forethought."

Proposed `limits`: "This records the procedural redirection only. It does not include the likely-account standard completed at the opening of 44d or the head/body construction that follows in 44d."

Label guidance: keep `turn_geometry/methodological_return_to_prior_causes`.
The function is a discourse-level return to a prior causal agenda, not a new
substantive doctrine.

## obs_timaeus_0142

Current status: `needs_split`; current span `44e`.

Recommendation: accepted repaired record with a span change to `44d-44e`.
The exact 44e source gives the vehicle, ease of passage, length, and limbs, but
the antecedent head and the rolling-over-earth problem start in 44d. The repair
should not re-record `obs_timaeus_0141`'s head-as-divine-ruler claim.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 44d-44e
start_marker: 44d
end_marker: 44e
start_char: 49788
end_char: 50533
text_sha256: 18dedfbbb31b3016adb9abe087ec601c6189b2cf16384b85151a75fb64b313f6
```

Proposed `greek_terms`: `[κεφαλήν, ὄχημα, εὐπορίαν, μῆκος, κῶλα, πορείαν]`

Proposed `observation`: "The body is assigned to the head as a vehicle and means of passage: because the head would otherwise roll helplessly over uneven earth, the gods give the body length and four flexible limbs for locomotion."

Proposed `textual_basis`: "Across 44d-44e, the head is the antecedent of the problem of rolling over varied ground; the gods then give it a vehicle and ease of passage, and the body receives length and four extended, flexible limbs contrived for movement."

Proposed `limits`: "This records the vehicle/locomotion explanation only. It does not duplicate the separate 44d claim that the head is the divine ruling part, and it does not include later organ-specific construction."

Label guidance: keep `craft_analogy/body_vehicle_for_head`. The vehicle image
is the repeatable function; the head's divine status remains local context.

## obs_timaeus_0147

Current status: `needs_split`; current span `45e`.

Recommendation: accepted repaired record with a span change to `45d-45e`.
The exact 45e source supports inner fire, smoothing, stillness, and sleep, but
the named eyelid safeguard starts at the end of 45d. The repair should exclude
the night cutoff already covered by `obs_timaeus_0146` and the dream-residue
material that continues into 46a.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 45d-45e
start_marker: 45d
end_marker: 45e
start_char: 51776
end_char: 52527
text_sha256: ca3d7875a8f681eae9a178d2d63560cfb2a7eb61e76275c6c14206d7459a25af
```

Proposed `greek_terms`: `[βλεφάρων, πυρὸς ἐντὸς, κινήσεις, ἡσυχία, ὕπνος]`

Proposed `observation`: "The eyelids are described as a safeguard for sight: when they close, they confine the inner fire, smooth the internal motions, and produce the stillness that brings sleep."

Proposed `textual_basis`: "At the 45d-45e boundary, Timaeus names the eyelids as the gods' safeguard for sight; their closing confines the inner fire, which smooths the internal motions, and the smoothing produces stillness and sleep."

Proposed `limits`: "This records the eyelid-and-sleep mechanism only. It does not re-record the 45d night cutoff of sight, and it does not include the later account of dream images from remaining motions."

Label guidance: keep `perception_generation/eyelids_sleep_motion_smoothing`.
It names the local perceptual mechanism precisely.

## obs_timaeus_0157

Current status: `needs_split`; current span `47e`.

Recommendation: accepted narrowed/repaired record. Keep the current
`source_ref` span as `47e`, but drop the rhythm clause from this record. Rhythm
starts in 47d and is only completed at the opening of 47e; preserving it would
require a different span and would mix an auditory/ethical aid with the
methodological transition to necessity.

Proposed `source_ref`: unchanged from current `47e`.

Proposed `greek_terms`: `[διὰ νοῦ, δεδημιουργημένα, δι’ ἀνάγκης, τῷ λόγῳ, παραθέσθαι]`

Proposed `observation`: "Timaeus closes the account of what has been fashioned through intellect and announces that what comes to be through necessity must now be set beside it in the account."

Proposed `textual_basis`: "At 47e, after the preceding account is marked as mostly complete, Timaeus contrasts things made through intellect with things that come to be through necessity and says the latter must be set alongside in the logos."

Proposed `limits`: "This records the methodological transition only. It does not preserve the rhythm-as-helper clause from 47d-47e, and it does not state the 48a claim that intellect persuades necessity."

Label guidance: change to
`methodological_distinction/intelligent_and_necessary_causes_separated`
(`feature_candidate_3368`). The repaired record's function is not simply turn
management; it separates the intellect-made account from the necessity account,
matching the existing reusable methodological distinction used at 46e and
68e-69a.

## obs_timaeus_0168

Current status: `needs_split`; current span `55a`.

Recommendation: explicit split across existing nearby ids. Repair
`obs_timaeus_0168` as the first-and-second-solid enumeration, and leave
`obs_timaeus_0169` as the accepted continuation for the third solid's
completion and the fourth nature's start. Change `obs_timaeus_0168` to
`54e-55a` only because the first solid's construction begins at the 54e/55a
boundary; the replacement prose must not re-record `obs_timaeus_0167`'s
six-triangle plane construction except as setup.

Proposed `source_ref` for repaired `obs_timaeus_0168`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 54e-55a
start_marker: 54e
end_marker: 55a
start_char: 70429
end_char: 71119
text_sha256: 4332cf79261e9bfed902ebfb6885257fd5e77dc84741212e0fb3f3a7dda689ac
```

Proposed `greek_terms`: `[ἰσόπλευρα τρίγωνα, στερεὰν γωνίαν, πρῶτον εἶδος, δεύτερον, ὀκτώ, ἓξ]`

Proposed `observation`: "Timaeus enumerates the first two regular solids from equilateral triangles: the first solid is completed through four solid angles made from equilateral triangle faces, and eight equilateral triangles arranged into six solid angles complete the second."

Proposed `textual_basis`: "Across 54e-55a, equilateral triangles are assembled into solid angles; four such solid angles complete the first solid, while the second is made from eight equilateral triangles and reaches completion through six solid angles."

Proposed `limits`: "This records only the first and second solid enumeration. The third solid's twelve solid angles and twenty triangular bases belong with `obs_timaeus_0169` at 55b, and element assignments begin later."

Label guidance: keep `mathematical_cosmology/regular_solids_enumerated`.
The existing `obs_timaeus_0169` uses the same label for the continuation, so
the repaired pair remains a narrow within-dialogue sequence rather than a new
label family.

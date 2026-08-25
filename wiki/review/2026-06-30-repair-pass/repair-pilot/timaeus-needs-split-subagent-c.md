# Timaeus needs_split repair slice C

Scope: `obs_timaeus_0208`, `obs_timaeus_0210`, `obs_timaeus_0215`,
`obs_timaeus_0216`, and `obs_timaeus_0221`.

Method: inspected the current YAML blocks in
`wiki/observations/timaeus.md` and resolved the relevant spans from
`raw/plato/greek/timaeus.txt` with `resolveSourceSpan()` in
`packages/harness/src/source.ts`. No translations, Pioneer,
review-segmented, review-queue, provider-backed harness run, or external
model-backed path was used. Greek passages are not copied here; only short
`greek_terms` and source refs are cited.

## obs_timaeus_0208

Current status: `needs_split`; current span `58a`; current label
`mathematical_cosmology/cosmic_compression_sustains_motion`.

Current problem: the record combines two textual functions in one claim. The
opening of `58a` completes the motion/rest/inequality principle continued from
`57e`; the rest of `58a` introduces the distinct no-void compression answer to
why the separated kinds do not cease moving through one another. The current
`greek_terms` mix both functions.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `58a`, but remove the motion/rest principle from this record. The
motion/rest assignment belongs with `obs_timaeus_0207` or a separate repair,
not under the compression label.

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`mathematical_cosmology/cosmic_compression_sustains_motion`.

Proposed `source_ref`: unchanged from current `58a`.

Proposed `greek_terms`: `[περίοδος, κυκλοτερής, σφίγγει, κενὴν χώραν, δι’ ἀλλήλων κινήσεως, φορᾶς]`

Proposed `observation`: "Timaeus reopens the unresolved question why the
separated elemental kinds have not stopped moving through one another and
answers first by invoking the circular revolution of the whole, which
compresses all things and leaves no empty space."

Proposed `textual_basis`: "At `58a`, after the motion/rest principle is
completed, Timaeus says the account has not yet explained why the separated
kinds have not ceased their movement through one another. He then names the
circular revolution of the whole as enclosing the kinds, tightening everything,
and leaving no empty place."

Proposed `limits`: "This records only the no-void compression setup at `58a`.
It does not re-record the rest-in-uniformity and motion-in-irregularity
principle, and it does not include the `58b` gap-filling mechanics of small and
large bodies."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0210

Current status: `needs_split`; current span `58c`; current label
`mathematical_cosmology/elemental_subkind_enumeration`.

Current problem: the record combines the final clause of the compression and
irregularity motion account with the beginning of the fire subtype list. The
fire list is not durable as a `58c`-only record because the final fire item
runs into `58d`; widening to `58c-58d` would also overlap the accepted
`obs_timaeus_0211` air and water subtype record. The complete local unit at
`58c` is the continuing-motion conclusion.

Recommendation: accepted narrowed record with a label change. Keep the current
`source_ref` span as `58c`, but drop the fire-subtype enumeration and repair
the record as the concluding motion clause.

Proposed `review_status`: `accepted`.

Proposed label guidance: change to
`mathematical_cosmology/cosmic_compression_sustains_motion`
(`feature_candidate_3429` after regeneration).

Proposed `source_ref`: unchanged from current `58c`.

Proposed `greek_terms`: `[μέγεθος, τόπων, στάσιν, ἀνωμαλότητος, διασῳζομένη γένεσις, ἀεὶ κίνησιν]`

Proposed `observation`: "Timaeus completes the compression account by saying
that when each thing changes size it also changes its position, and that the
preserved generation of irregularity continuously supplies the ongoing motion
of these bodies."

Proposed `textual_basis`: "At `58c`, the first sentence links change of size
with change of place-position, then says that the preserved generation of
irregularity provides the motion of these bodies continuously."

Proposed `limits`: "This records only the continuing-motion conclusion at
`58c`. It does not preserve the fire subtype list that begins later in the
marker, and it does not duplicate the `58d` air and water subtype enumeration
already represented by `obs_timaeus_0211`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0215

Current status: `needs_split`; current span `59c`; current label
`elemental_theory/material_taxonomy_from_water_variants`.

Current problem: the record combines the copper/rust material taxonomy with
the beginning of a methodological aside about likely myths. It also leans on
some `59b` setup when it says "near-gold" and "harder through a slight mixture
of earth"; a `59c` repair should keep only the material facts supported inside
the marker and leave the methodological transition to `obs_timaeus_0216`.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `59c`, but remove the methodological transition from this record and avoid
claims that require the preceding `59b` setup.

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`elemental_theory/material_taxonomy_from_water_variants`.

Proposed `source_ref`: unchanged from current `59c`.

Proposed `greek_terms`: `[χαλκός, διαλείμματα, πηκτῶν, ὑδάτων, γῆς, μειχθέν, ἰός]`

Proposed `observation`: "At `59c`, Timaeus names one bright frozen water kind
with large internal gaps as copper, and says that when the earth mixed with it
separates out again as it ages and becomes visible by itself, it is called
rust."

Proposed `textual_basis`: "The opening material at `59c` identifies copper
from the bright frozen water kind with internal intervals, then describes the
earth mixed into it separating again during aging and becoming visible under
the name rust."

Proposed `limits`: "This records only the copper and rust item at `59c`. It
does not include the gold, adamant, or near-gold setup in `59b`, and it does
not include the later methodological aside on likely myths."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0216

Current status: `needs_split`; current span `59d`; current label
`method_boundary/likely_account_playful_recreation`.

Current problem: the current observation is mostly right as a methodological
record, but the setup for the sentence begins in late `59c`, while the current
`59d` source also includes the start of the next material case involving water
mixed with fire. The fire-mixed water terms should be removed from this record.

Recommendation: accepted repaired record with a span change to `59c-59d`. The
widened span is only to capture the complete methodological sentence; the
replacement prose should exclude the copper/rust material before it and the
fire-mixed water case after it.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 59c-59d
start_marker: 59c
end_marker: 59d
start_char: 79923
end_char: 80774
text_sha256: a188b097994ea2d5941d879912fbe02d0fe8ccb971d94662bcdb64dcdd2a398b
```

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`method_boundary/likely_account_playful_recreation`.

Proposed `greek_terms`: `[εἰκότων μύθων, ἀναπαύσεως, εἰκότας, ἀμεταμέλητον ἡδονήν, παιδιὰν, φρόνιμον]`

Proposed `observation`: "Timaeus frames the pursuit of likely accounts about
becoming as a rest from accounts of what always is, producing blameless
pleasure and amounting to a moderate and intelligent form of play."

Proposed `textual_basis`: "Across late `59c` and the opening of `59d`,
Timaeus says that one who lays aside accounts of beings that always are for
the sake of rest and surveys likely accounts about becoming gains pleasure
without regret and would make a moderate, intelligent play in life."

Proposed `limits`: "This records only the methodological aside. It does not
include the copper/rust taxonomy earlier in `59c`, and it does not include the
next material case involving water mixed with fire later in `59d`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0221

Current status: `needs_split`; current span `59e`; current label
`elemental_theory/material_taxonomy_from_water_variants`.

Current problem: the record combines the named compacted water products at
`59e` with the beginning of the plant-filtered juice taxonomy. The juice
sentence is incomplete at `59e` and continues into `60a`, where neighboring
records already handle the juice names. The term `χυμοί` should not remain in
this narrowed `59e` record.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `59e`, but restrict the record to the compacted water products.

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`elemental_theory/material_taxonomy_from_water_variants`.

Proposed `source_ref`: unchanged from current `59e`.

Proposed `greek_terms`: `[χάλαζα, κρύσταλλος, χιών, πάχνη, ὑπὲρ γῆς, ἐπὶ γῆς, ἡμιπαγές]`

Proposed `observation`: "Timaeus classifies compacted water products by degree
of solidification and location: the stronger case is named hail above earth and
crystal on earth, while the less complete or half-solid case is named snow
above earth and frost on earth."

Proposed `textual_basis`: "At `59e`, the named products are distinguished by
whether the solidifying process is stronger or less complete and by whether
the product occurs above earth or on earth."

Proposed `limits`: "This records only the named compacted water products at
`59e`. It does not preserve the process that begins in `59d`, and it does not
include the plant-filtered juice taxonomy that begins at the end of `59e` and
continues in `60a`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

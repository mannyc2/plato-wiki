# Timaeus needs_split repair slice D

Scope: `obs_timaeus_0252`, `obs_timaeus_0263`,
`obs_timaeus_0265`, `obs_timaeus_0272`, `obs_timaeus_0280`,
`obs_timaeus_0292`, `obs_timaeus_0306`, and `obs_timaeus_0307`.

Method: inspected the current YAML blocks in
`wiki/observations/timaeus.md` and resolved the relevant spans from
`raw/plato/greek/timaeus.txt` with `resolveSourceSpan()` in
`packages/harness/src/source.ts`. No translations, Pioneer,
review-segmented, review-queue, provider-backed harness run, external model
path, or model-backed harness path was used. Greek passages are not copied
here; only short `greek_terms` and source refs are cited.

## obs_timaeus_0252

Current status: `needs_split`; current span `68c`; current label
`perception_generation/color_mixture_taxonomy_by_named_blends`.

Current problem: the current `68c` source starts after the antecedent
`ἐρυθρὸν`, but the record cites that term and says red is mixed with black and
white. The prose also reads like an exact blend catalogue, while the preceding
marker explicitly withholds exact measures. The record can be salvaged as a
sequence-of-named-mixtures record if the source span is widened to include the
red antecedent and the prose is made less formulaic.

Recommendation: accepted repaired record with a span change to `68b-68c`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 68b-68c
start_marker: 68b
end_marker: 68c
start_char: 97799
end_char: 98626
text_sha256: d275af75d858d50eb3170b12a7707b40be1c7088dba89d374ed8ea222053fe01
```

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`perception_generation/color_mixture_taxonomy_by_named_blends`.

Proposed `greek_terms`: `[ἐρυθρὸν, ξανθὸν, κραθὲν, ἁλουργόν, κράσει, φαιὸν, ὠχρόν, κυανοῦν, γλαυκόν, πράσιον]`

Proposed `observation`: "Timaeus presents named colors as products in a
mixture sequence: after naming red and yellow through mixtures, the account
continues through purple, dark, fiery-red, grey, pale, deep blue, blue-grey,
and leek-green as further mixture products."

Proposed `textual_basis`: "Across `68b-68c`, the account uses repeated
mixture vocabulary to move from red and yellow into a sequence of named colors
generated from prior color terms. The same passage withholds exact measures,
so the durable claim is the named mixture sequence, not precise ratios."

Proposed `limits`: "This records the local named-color mixture sequence. It
does not provide exact proportions, and it does not include the `68d` claim
that other colors may be preserved by analogous mixtures."

## obs_timaeus_0263

Current status: `needs_split`; current span `70b`; current label
`teleological_structure/heart_as_thumos_signal_center`.

Current problem: the current `70b` source begins after the noun `καρδίαν`, so
the record's heart claim depends on an antecedent outside the cited span. The
current prose also reaches toward the best-part-leadership clause completed at
`70c`; that can be dropped while preserving a durable heart-as-signal-center
record.

Recommendation: accepted repaired record with a span change to `70a-70b`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 70a-70b
start_marker: 70a
end_marker: 70b
start_char: 101501
end_char: 102349
text_sha256: e90a425b7bc6a3f840632014e49847c951ec55c2c0f04624decd08d19bab9da4
```

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`teleological_structure/heart_as_thumos_signal_center`.

Proposed `greek_terms`: `[καρδίαν, φλεβῶν, πηγὴν, αἵματος, δορυφορικὴν, θυμοῦ, λόγου, παραγγείλαντος, αἰσθητικόν, παρακελεύσεων, ἀπειλῶν]`

Proposed `observation`: "The heart is placed as a blood-and-vein center in the
guard-station so that, when spirited heat responds to reason's report of
injustice, commands and threats can be carried quickly through the body's
perceptive channels and produce obedience."

Proposed `textual_basis`: "Across `70a-70b`, the heart is named and then
described as the knot of veins and source of blood, stationed in the guarding
dwelling. The purpose clause connects reason's report, the boiling of
spiritedness, bodily channels, perception of commands and threats, and
obedience throughout the body."

Proposed `limits`: "This records the heart's signaling role in the spirited
system. It does not re-record the broader placement of the spirited soul-kind
at `70a`, and it does not include the lung-support mechanism that begins at
`70c`."

## obs_timaeus_0265

Current status: `needs_split`; current span `70e`; current label
`craft_analogy/animal_image_for_psychology`.

Current problem: the current `70e` source begins after the explicit
`ἐπιθυμητικόν` setup at `70d`, but the record identifies the appetitive part.
The claim is otherwise good if narrowed to the feeding-animal image and kept
separate from the distance-from-deliberation record already covered by
`obs_timaeus_0266`.

Recommendation: accepted repaired record with a span change to `70d-70e`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 70d-70e
start_marker: 70d
end_marker: 70e
start_char: 102737
end_char: 103544
text_sha256: 8b1a6ffcca6bf19e8407772d22eb38ff065c5ab1d3b1a955baa68bcda491d42a
```

Proposed `review_status`: `accepted`.

Proposed label guidance: keep `craft_analogy/animal_image_for_psychology`.

Proposed `greek_terms`: `[σίτων, ποτῶν, ἐπιθυμητικόν, φάτνην, τροφῇ, θρέμμα ἄγριον, τρέφειν, θνητόν]`

Proposed `observation`: "The appetitive soul-part is figured as a tethered
feeding animal: the makers provide it a trough-like place for bodily
nourishment and bind it there as a wild creature that must still be fed for a
mortal race to exist."

Proposed `textual_basis`: "Across `70d-70e`, the account names the appetite
for food, drink, and bodily needs, places it between the diaphragm and the
navel-boundary, calls that region a feeding trough for bodily nourishment, and
describes the part as a wild creature whose feeding is necessary."

Proposed `limits`: "This records only the feeding-animal image for appetite.
It does not include the separate `70e-71a` reason for placing appetite far from
deliberation, and it does not claim appetite is simply rejected, since the span
says feeding it is necessary."

## obs_timaeus_0272

Current status: `needs_split`; current span `72b`; current label
`mantic_epistemology/liver_signs_clearer_while_living`.

Current problem: the current record is mostly source-backed, but `σημαίνειν`
and the explicit "signify clearly" completion fall after the `72c` marker, not
inside the current `72b` source. The record can be accepted if it stops at the
living/dead contrast actually contained in `72b`.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `72b`.

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`mantic_epistemology/liver_signs_clearer_while_living`.

Proposed `greek_terms`: `[φύσις ἥπατος, τόπῳ, χάριν μαντικῆς, ζῶντος, σημεῖα, ἐναργέστερα, τυφλὸν, μαντεῖα, ἀμυδρότερα]`

Proposed `observation`: "The liver's nature and location are summarized as
serving divination, and its signs are contrasted by life-state: while a person
is alive they are clearer, but once life is removed the liver is blind and its
mantic signs are dimmer."

Proposed `textual_basis`: "At `72b`, the account says the liver has its stated
nature and place for divination, then contrasts clearer signs while each person
lives with blindness and dimmer mantic signs after deprivation of life."

Proposed `limits`: "This records the living/dead contrast in liver signs. It
does not include the clarity-of-signification phrase completed at `72c`, and
it does not include the spleen account that follows."

## obs_timaeus_0280

Current status: `needs_split`; current span `74b-74c`; current label
`teleological_structure/sinew_and_flesh_compensate_bone_limits`.

Current problem: the current record combines two distinct functional records:
sinews bind limbs for bending and extension, while flesh protects against heat,
cold, falls, and seasonal effects. It also cites `ὀστεΐνης`, whose antecedent
is before the `74b` marker. A durable single-record salvage should keep only
the sinew function and drop the flesh-protection and bone-limit framing.

Recommendation: accepted narrowed record with a span change to `74b`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 74b
start_marker: 74b
end_marker: 74b
start_char: 110083
end_char: 110532
text_sha256: 2f01b17dd2747e8d0e27c3779fc87b0ec1a68e691cf3d6a4413fb6d9afb5d8cb
```

Proposed `review_status`: `accepted`.

Proposed label guidance: change within `teleological_structure` to a narrower
label such as `sinews_bind_limbs_for_bending`; the current combined label
should not remain on the narrowed record.

Proposed `greek_terms`: `[νεύρων, συνδήσας, μέλη, ἐπιτεινομένῳ, ἀνιεμένῳ, στρόφιγγας, καμπτόμενον, ἐκτεινόμενον]`

Proposed `observation`: "Sinews are assigned the function of binding the
limbs and, by tightening and relaxing around pivots, making the body able to
bend and extend."

Proposed `textual_basis`: "At `74b`, the account says the makers devise the
kind of sinews and flesh, then gives the sinew-specific purpose: by binding all
the limbs and tightening and relaxing around the pivots, sinews provide bending
and extension for the body."

Proposed `limits`: "This records only the sinew motion function. It does not
preserve the flesh-protection material at `74b-74c`, the internal moisture and
seasonal regulation at `74c`, or the later material recipe for flesh and
sinews."

## obs_timaeus_0292

Current status: `needs_split`; current span `77a`; current label
`teleological_structure/plants_created_as_mortal_body_aid`.

Current problem: the current `77a` source begins after the phrase
`θνητοῦ ζῴου`, but the record's setup depends on that antecedent. The current
prose also folds in the agriculture/tame-plant note, which is not needed for
the aid-to-mortal-body function.

Recommendation: accepted repaired record with a span change to `76e-77a`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 76e-77a
start_marker: 76e
end_marker: 77a
start_char: 115638
end_char: 116419
text_sha256: cf143271869377ba20c7c647e2f483103cc8289cb391709a6d8fcd277d58f8ed
```

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`teleological_structure/plants_created_as_mortal_body_aid`.

Proposed `greek_terms`: `[θνητοῦ ζῴου, πυρὶ, πνεύματι, ἀνάγκης, τηκόμενον, κενούμενόν, βοήθειαν, συγγενῆ φύσεως, φυτεύουσιν]`

Proposed `observation`: "Plants are introduced as divine aid for the mortal
animal's bodily maintenance: because its necessary life in fire and breath
melts, empties, and wastes it, the gods plant another living thing from a
human-kindred nature."

Proposed `textual_basis`: "Across `76e-77a`, after the mortal animal's parts
and limbs are complete, the account says its life must necessarily be in fire
and breath and that it wastes away as these melt and empty it. The gods then
devise help by mixing a human-kindred nature with other forms and perceptions
and planting it as another living thing."

Proposed `limits`: "This records only the teleological introduction of plants
as aid to mortal embodiment. It does not include the preceding nail rationale,
the tame/wild agriculture distinction, or the plant soul-capacity account at
`77b`."

## obs_timaeus_0306

Current status: `needs_split`; current span `80a-80b`; current label
`perception_generation/sound_concord_by_motion_assimilation`.

Current problem: the current record combines the general route through medical
cups, swallowing, and thrown bodies with the sound-concord mechanism and the
affective contrast between unwise pleasure and wise good cheer. It also cites
`ἰατρικὰς σικύας`, which starts before the `80a` marker. The durable salvage
is the sound-concord mechanism only.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `80a-80b`.

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`perception_generation/sound_concord_by_motion_assimilation`.

Proposed `greek_terms`: `[φθόγγοι, ταχεῖς, βραδεῖς, ὀξεῖς, βαρεῖς, ἀνάρμοστοι, ἀνομοιότητα, σύμφωνοι, ὁμοιότητα, κινήσεις]`

Proposed `observation`: "The sound account explains concord and discord by
motion similarity: fast and slow, high and low sounds are discordant when the
movements they produce in us are unlike, but concordant when slower later
motions overtake faster earlier motions as those motions become similar."

Proposed `textual_basis`: "Across `80a-80b`, sounds are sorted as fast or
slow, high or low, discordant through dissimilarity of the motion produced in
us, and concordant through similarity. The slower motions are then described as
catching up with the earlier faster motions as they are ceasing and becoming
similar."

Proposed `limits`: "This records only the acoustic concord mechanism. It does
not preserve the medical-cup, swallowing, and thrown-body examples, and it does
not include the separate affective distinction between pleasure for the unwise
and good cheer for the wise."

## obs_timaeus_0307

Current status: `needs_split`; current span `80c`; current label
`elemental_theory/attraction_reduced_to_no_void_displacement`.

Current problem: the current record is basically salvageable, but it cites
`ὑδάτων` and names water flows, which are outside the `80c` source and belong
to the preceding marker. The durable record should focus on the examples and
mechanism actually inside `80c`.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `80c`.

Proposed `review_status`: `accepted`.

Proposed label guidance: keep
`elemental_theory/attraction_reduced_to_no_void_displacement`.

Proposed `greek_terms`: `[κεραυνῶν, ἠλέκτρων, ἕλξεως, Ἡρακλείων λίθων, ὁλκὴ, κενὸν, περιωθεῖν, διακρινόμενα, συγκρινόμενα, ἕδραν]`

Proposed `observation`: "For thunderbolt falls and the admired attraction
cases of amber and Heraclean stones, Timaeus denies any independent pulling
force and instead appeals to no void, mutual displacement, separation and
combination, and each thing changing toward its own seat."

Proposed `textual_basis`: "At `80c`, the passage lists thunderbolt falls and
the admired attraction cases involving amber and Heraclean stones, says there
is no pulling in any of them, and explains the effects through the absence of
void, mutual pushing, separation, combination, and movement toward each
thing's own place."

Proposed `limits`: "This records the anti-attraction explanation within
`80c`. It does not include water flows from the preceding marker and does not
provide a separate account for each named phenomenon."

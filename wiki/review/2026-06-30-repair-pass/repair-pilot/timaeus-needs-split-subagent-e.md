# Timaeus needs_split repair slice E

Scope: `obs_timaeus_0309`, `obs_timaeus_0338`,
`obs_timaeus_0340`, `obs_timaeus_0343`, `obs_timaeus_0348`,
`obs_timaeus_0349`, `obs_timaeus_0350`, `obs_timaeus_0351`,
`obs_timaeus_0353`, `obs_timaeus_0354`, and `obs_timaeus_0355`.

Method: inspected the current YAML blocks in
`wiki/observations/timaeus.md` and resolved relevant spans from
`raw/plato/greek/timaeus.txt` with `resolveSourceSpan()` in
`packages/harness/src/source.ts`. No translations, Pioneer,
review-segmented, review-queue, provider-backed harness run, external source,
or model-backed harness path was used. Greek passages are not copied here;
only short `greek_terms` and source refs are cited.

Summary: all eleven target records can be salvaged as narrowed accepted
records. Several require span changes because the current source ref begins
mid-sentence or carries a neighboring textual function.

## obs_timaeus_0309

Current status: `needs_split`; current span `81a-81b`.

Current problem: the record is mostly durable, but the current prose lets the
marker-level source ref carry too much. The span includes the general
filling/emptying and growth/decline mechanism, then starts the young-body
triangle account that is already handled by `obs_timaeus_0310`. The repaired
record should not preserve the youth material.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `81a-81b`; restrict the claim to like-to-like filling and the
more-out/less-out growth rule.

Proposed `review_status`: `accepted`.

Proposed `source_ref`: unchanged from current `81a-81b`.

Proposed `greek_terms`: `[πληροῖ, κενουμένου, πληρώσεως, ἀποχωρήσεως, συγγενὲς, ὁμόφυλον, ἔναιμα, κενωθὲν, φθίνει, αὐξάνεται]`

Proposed `observation`: "Bodily filling and emptying follow the cosmic
like-to-like pattern: inner blooded parts, divided within each animal as if
inside its own heaven, move toward what is kindred and refill what has been
emptied. When more departs than flows in, the animal declines; when less
departs than flows in, it grows."

Proposed `textual_basis`: "At `81a-81b`, Timaeus says the way of filling and
departure is like the motion in the whole, in which everything kindred moves
toward itself. External surroundings melt and distribute things toward each
same-natured kind, while blooded things divided inside each animal imitate the
motion of the whole and refill what has been emptied. The passage then states
the more-out/less-out rule for decline and growth."

Proposed `limits`: "This records only the filling, departure, and
growth/decline rule at `81a-81b`. It does not include the new-triangle
explanation of youth that begins later in `81b` and is already represented by
`obs_timaeus_0310`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0338

Current status: `needs_split`; current span `88a-88b`.

Current problem: the current record combines two imbalance cases: stronger
soul disturbing the body, and overgrown body with weak mind producing
ignorance. The first case also begins syntactically in `87e`, where the soul
is named as stronger than the body. The body-dominance/ignorance case should
not remain in this ID.

Recommendation: accepted repaired record with a span change to `87e-88a`,
limited to the soul-dominance case. A separate record would be needed if the
body-dominance/ignorance case is to be retained independently.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 87e-88a
start_marker: 87e
end_marker: 88a
start_char: 138465
end_char: 139253
text_sha256: b949332edc249e9a3791c8a5186de513ef17dbfa437b1519ec4d6a6c4a0a7031
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[ψυχὴ κρείττων, σώματος, διασείουσα, νόσων, μαθήσεις, ζητήσεις, διδαχάς, μάχας, λόγοις, ῥεύματα]`

Proposed `observation`: "A soul stronger than the body can disturb the body
from within and fill it with diseases. The disturbance is intensified by
strenuous studies, inquiries, teaching, and verbal contests, which heat and
shake the body, bring on flows, and mislead most doctors into blaming
innocent causes."

Proposed `textual_basis`: "Across `87e-88a`, Timaeus extends the body/soul
proportion rule to the combined living thing and says that when soul is
stronger than body and grips it eagerly, it shakes the whole body from within
and fills it with diseases. He then specifies intense learning, inquiry,
teaching, and verbal conflict as activities that melt, heat, shake, and induce
flows in the body."

Proposed `limits`: "This records only the stronger-soul imbalance and its
bodily effects. It does not include the contrasting stronger-body case that
produces ignorance in `88a-88b`, and it does not include the reciprocal
training remedy already represented by `obs_timaeus_0339`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0340

Current status: `needs_split`; current span `88d`.

Current problem: the exact `88d` marker starts after the care-of-parts setup
and ends mid-phrase before the body is said to defend itself through all of
itself. The current claim is salvageable only if the source ref includes the
opening of `88e`; the later kinship-ordering material in `88e` should remain
with `obs_timaeus_0341`.

Recommendation: accepted repaired record with a span change to `88d-88e`,
restricted to motion as bodily defense against inner and outer affections.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 88d-88e
start_marker: 88d
end_marker: 88e
start_char: 140033
end_char: 140832
text_sha256: 4ff4d4fd8a3fb63084157c9d2adb8096e1085dfdb97d27f2d9d1f031a6131e61
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[ἀπομιμούμενον, σώματος, καομένου, ψυχομένου, ξηραινομένου, ὑγραινομένου, ἡσυχίαν, κινῇ, σεισμοὺς, ἀμύνηται]`

Proposed `observation`: "Bodily care is framed as imitation of the whole:
because the body is burned and cooled by what enters and dried and moistened
by what comes from outside, a resting body handed over to these motions is
overcome, while a body kept in motion and shaken through itself resists the
inner and outer motions according to nature."

Proposed `textual_basis`: "Across `88d-88e`, Timaeus says the body is affected
from within by incoming things and from without by drying and moistening
motions. If the body is left at rest, those motions master and destroy it; if
one imitates the nurse of the whole, does not allow the body to rest, moves
it, and produces shakings through all of it, the body defends itself against
inner and outer motions according to nature."

Proposed `limits`: "This records only the motion-as-defense rule. It does not
include the later `88e` claim that moderate shaking orders wandering parts by
kinship, already represented by `obs_timaeus_0341`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0343

Current status: `needs_split`; current span `89b-89c`.

Current problem: the current prose reaches back to the `89a` ranking of
motions by calling drug purification a third motion, while the exact
`89b-89c` source supports the practical warning about drugs, disease
constitution, appointed time, and regimen. The repaired record should drop the
motion-ranking frame.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `89b-89c`.

Proposed `review_status`: `accepted`.

Proposed `source_ref`: unchanged from current `89b-89c`.

Proposed `greek_terms`: `[φαρμακευτικῆς, καθάρσεως, ἰατρικόν, νοσήματα, κινδύνους, ἐρεθιστέον, σύστασις, ζῴων, εἱμαρμένον, διαίταις]`

Proposed `observation`: "Drug-based medical purification is allowed only
under strong necessity and otherwise rejected for someone with sense.
Non-dangerous diseases should not be irritated by drugs, because disease
constitutions resemble living beings with appointed life spans; destroying
them before their time tends to turn small and few diseases into great and
many ones."

Proposed `textual_basis`: "At `89b-89c`, Timaeus says the drug-based
purification made by medicine is useful for someone under strong necessity but
otherwise not to be accepted by one with understanding. He warns that diseases
without great dangers should not be irritated by drugs, compares disease
constitutions to living beings with appointed times, and says that destroying
such a constitution with drugs contrary to its allotted time tends to produce
great and many diseases from small and few ones; such cases should instead be
guided by regimens as far as leisure permits."

Proposed `limits`: "This records only the caution about pharmaceutical
intervention and regimen at `89b-89c`. It does not include the prior `89a`
ranking of bodily motions or the self-pedagogy transition at `89d`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0348

Current status: `needs_split`; current span `90c`.

Current problem: the current observation repeats the contrast with appetitive
or competitive lives from `90b`, while exact `90c` supports the positive
learning-oriented result. The end of `90c` also begins the general care rule
that should belong with `obs_timaeus_0349`.

Recommendation: accepted narrowed record. Keep the current `source_ref` span
as `90c`, and restrict the claim to the learner's true-thought, divine-care,
and happiness result.

Proposed `review_status`: `accepted`.

Proposed `source_ref`: unchanged from current `90c`.

Proposed `greek_terms`: `[ἀθάνατα, θεῖα, ἀληθείας, ἀθανασίας, θεραπεύοντα, θεῖον, κεκοσμημένον, δαίμονα, εὐδαίμονα]`

Proposed `observation`: "The learning-oriented person who touches truth is
said to think immortal and divine things, to omit no humanly possible share of
immortality, and to become especially happy by always caring for the divine
element and keeping the indwelling guardian spirit well ordered."

Proposed `textual_basis`: "At `90c`, Timaeus says that the person serious
about learning and true thoughts necessarily thinks immortal and divine
things if he touches truth. He adds that, insofar as human nature can share in
immortality, such a person leaves no part of it aside, because he always cares
for the divine and keeps the indwelling guardian spirit well ordered, and is
therefore especially happy."

Proposed `limits`: "This records only the positive learning-oriented result
inside `90c`. It does not restate the appetitive/rivalrous contrast from
`90b`, and it does not include the general care rule and cosmic-motion
prescription that begin at the end of `90c` and continue in `90d`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0349

Current status: `needs_split`; current span `90d`.

Current problem: exact `90d` starts after the first half of the phrase naming
the divine part's kindred motions. The general care rule and the naming of
cosmic thoughts and revolutions begin in `90c`, so the current source ref is
too narrow for the present claim.

Recommendation: accepted repaired record with a span change to `90c-90d`,
limited to the care rule and cosmic-motion prescription.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 90c-90d
start_marker: 90c
end_marker: 90d
start_char: 143853
end_char: 144674
text_sha256: a0a84ab45b0f4dc39b0ee98eeff9f9c2bae66730302a2af754ae71941527aec4
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[θεραπεία, τροφὰς, κινήσεις, θείῳ, διανοήσεις, περιφοραί, ἐξορθοῦντα, ἁρμονίας, ἐξομοιῶσαι, ἀρίστου βίου]`

Proposed `observation`: "Care has one rule: give each thing its own
nourishments and motions. For the divine part in us, the kindred motions are
the thoughts and revolutions of the whole, and following them corrects the
corrupted head-cycles through learning the whole's harmonies and revolutions,
assimilating the thinking part to what it thinks."

Proposed `textual_basis`: "Across `90c-90d`, Timaeus states that every care
gives each thing its proper nourishments and motions, then identifies the
motions kindred to the divine part in us as the thoughts and revolutions of
the whole. Each person should follow these motions, correcting the corrupted
periods in the head by learning the harmonies and revolutions of the whole and
assimilating the thinking part to the object thought according to ancient
nature."

Proposed `limits`: "This records only the care rule and cosmic-motion
prescription. It does not duplicate the learning-oriented happiness result
from the earlier part of `90c`, and it does not turn the prescription into a
broader hidden doctrine of astronomy."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0350

Current status: `needs_split`; current span `90e-91a`.

Current problem: the current record combines the discourse closure/transition
at `90e`, the first transformation case, and the beginning of the reproductive
mechanism at `91a`. Under the current `closure_type/topic_completion_declared`
function, only the closure and measured transition to other animals should
remain.

Recommendation: accepted narrowed record with a span change to `90e`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 90e
start_marker: 90e
end_marker: 90e
start_char: 144674
end_char: 145122
text_sha256: bb7d7d0a7d2411bbc107bf4c206a2b77da9229b4d65898178dbc07eba89a7b37
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[τέλος, παντὸς, γενέσεως ἀνθρωπίνης, ἄλλα ζῷα, διὰ βραχέων, ἐμμετρότερος, λόγους]`

Proposed `observation`: "Timaeus marks the assigned account of the whole down
to human generation as nearly complete, then introduces a brief recollection
of how the other animals came to be so that the discourse will remain
measured."

Proposed `textual_basis`: "At `90e`, Timaeus says the matters assigned from
the beginning, concerning the whole down to human generation, seem nearly to
have their end. He then says the other animals, insofar as they came to be,
must be recalled briefly rather than lengthened, so that the account about
them may appear more measured."

Proposed `limits`: "This records only the closure-and-transition function at
`90e`. It does not include the transformation of cowardly unjust men into
women that starts later in the marker, and it does not include the
reproductive mechanism that begins in `91a`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0351

Current status: `needs_split`; current span `91b-91c`.

Current problem: the current record combines the male seed/desire mechanism
with the first words of the female womb account at `91c`. The anatomical
channel from the bladder route belongs to the preceding `91a` setup if
retained, but the durable local unit at this ID is the `91b` seed and male
genital characterization.

Recommendation: accepted narrowed record with a span change to `91b`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 91b
start_marker: 91b
end_marker: 91b
start_char: 145524
end_char: 145911
text_sha256: ae65dc38203587f759aa2a49761a368f1dfc0efb4109f929e0c6d05608bedf9d
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[μυελὸν, σπέρμα, ἔμψυχος, ἀναπνοήν, ἐκροῆς, ζωτικὴν ἐπιθυμίαν, γεννᾶν, ἔρωτα, ἀπειθές, αὐτοκρατὲς, ἀνυπήκοον]`

Proposed `observation`: "The marrow previously called seed is described as
ensouled and given breath; by making a life-oriented desire for outflow in the
place where it breathes, it completes the desire to generate. The male genital
nature is then characterized as disobedient, self-ruling, and like a living
thing not obedient to reason."

Proposed `textual_basis`: "At `91b`, Timaeus identifies the compacted marrow
as the seed named earlier, says that because it is ensouled and has received
breath it produces a life-oriented desire for outflow, and names this the
completion of the desire to generate. He then describes the male genital
nature as disobedient and self-ruling, like a living thing not obedient to
reason, attempting to master all through desire-driven stings."

Proposed `limits`: "This records only the seed/desire mechanism and male
genital characterization at `91b`. It does not include the urinary-channel
setup in `91a`, and it does not include the female womb pathology beginning in
`91c`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0353

Current status: `needs_split`; current span `91d-91e`.

Current problem: the current record combines the reproductive field-sowing
image, closure of female generation, bird transformation, and a transition to
terrestrial animals. The reproductive image is a durable local claim; the bird
and terrestrial animal material should be removed from this ID.

Recommendation: accepted narrowed record with a span change to `91d`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 91d
start_marker: 91d
end_marker: 91d
start_char: 146301
end_char: 146745
text_sha256: 29668cffa8b588d0accfbd5f56dfc6aece78361ce975dd5216ef891a22657b91
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[ἔρως, δένδρων καρπὸν, ἄρουραν, μήτραν, ἀόρατα, ἀδιάπλαστα ζῷα, κατασπείραντες, ἐκθρέψωνται, φῶς, ζῴων γένεσιν]`

Proposed `observation`: "Generation is completed through an agricultural
image: eros brings the sexes together, plucks fruit as from trees, sows
invisible and unformed living things into the womb as into a field, rears them
inside until large, and then brings them to light to complete the generation
of living beings."

Proposed `textual_basis`: "At `91d`, Timaeus says eros gathers the sexes
together, as if plucking fruit from trees, and sows invisible, small, unformed
living things into the womb as into a field. These are separated and reared
inside until large, then brought into the light to complete the generation of
living beings; the same marker closes women and the female as having come to
be in this way."

Proposed `limits`: "This records only the reproductive field-sowing image and
female-generation closure at `91d`. It does not include the bird
transformation that begins later in the same marker, and it does not include
the terrestrial animal account in `91e-92a`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0354

Current status: `needs_split`; current span `92a-92b`.

Current problem: exact `92a-92b` starts after the terrestrial-animal setup in
`91e` and includes the aquatic class at `92b`. The durable record should
include the terrestrial setup and exclude the water-dwelling fourth kind.

Recommendation: accepted repaired record with a span change to `91e-92a`,
limited to terrestrial, four-footed, many-footed, and footless crawling kinds.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 91e-92a
start_marker: 91e
end_marker: 92a
start_char: 146745
end_char: 147589
text_sha256: 4f5ec66d766d2bb90fb3cf6d1c950d0e79fa78e11ca8c885359b277ce8a1e52a
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[πεζὸν, θηριῶδες, φιλοσοφίᾳ, οὐρανὸν, κεφαλῇ, περιόδοις, ἐπιτηδευμάτων, κεφαλὰς, γῆν, ἀργίας, τετράπουν, πολύπουν, ἄποδα, ἰλυσπώμενα]`

Proposed `observation`: "Terrestrial animal body-types are assigned to those
who no longer use philosophy or examine the heavenly nature, cease to use the
circuits in the head, and follow the ruling parts around the chest. From these
practices, heads and front limbs are drawn toward earth, producing
four-footed and many-footed kinds, while the most foolish are generated
footless and crawling."

Proposed `textual_basis`: "Across `91e-92a`, Timaeus says the terrestrial and
beastlike kind comes from those who make no use of philosophy and do not
observe the nature around heaven, because they no longer use the head-circuits
but follow the ruling parts around the chest. From these practices, front
limbs and heads are dragged toward earth, the head-circuits are compressed by
idleness, four-footed and many-footed kinds arise with more supports for the
more foolish, and the most foolish become footless crawlers."

Proposed `limits`: "This records only the terrestrial transformation taxonomy.
It does not include the bird material at the opening of `91e`, and it does not
include the water-dwelling fourth kind introduced at `92b`."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

## obs_timaeus_0355

Current status: `needs_split`; current span `92b-92c`.

Current problem: the current record combines the water-dwelling animal class
at `92b`, the cross-animal exchange principle at `92c`, and the final cosmic
completion formula. Under the current closure label, the aquatic class should
be removed and the record should start at `92c`.

Recommendation: accepted narrowed record with a span change to `92c`.

Proposed `source_ref`:

```yaml
source_path: raw/plato/greek/timaeus.txt
stephanus_span: 92c
start_marker: 92c
end_marker: 92c
start_char: 147984
end_char: 148409
text_sha256: 17134980c53d2bd72cdb085a013ed9947e9b2d4d122eb622fd0c5929a50f7ea2
```

Proposed `review_status`: `accepted`.

Proposed `greek_terms`: `[διαμείβεται, ζῷα, νοῦ, ἀνοίας, ἀποβολῇ, κτήσει, τέλος, παντὸς, κόσμος, ζῷον ὁρατὸν, εἰκὼν τοῦ νοητοῦ, θεὸς αἰσθητός, τελεώτατος]`

Proposed `observation`: "The closing summary states that living beings
exchange into one another through loss and acquisition of intellect and folly,
then declares the account of the whole complete: the cosmos, filled with
mortal and immortal living beings, has become one visible living thing
containing visible living things, an image of the intelligible and a
perceptible god."

Proposed `textual_basis`: "At `92c`, after the aquatic-class account has
ended, Timaeus says animals then and now exchange into one another by loss and
acquisition of intellect and folly. He then declares the discourse about the
whole complete, saying that the cosmos has received mortal and immortal living
things, has been filled out, and has become one visible living thing
containing visible living things, an image of the intelligible, a perceptible
god, greatest, best, most beautiful, and most complete."

Proposed `limits`: "This records only the exchange principle and final cosmic
completion formula at `92c`. It does not include the water-dwelling class,
fish, shellfish, or water-breathing penalty material at `92b`, and it does not
treat the closing predicates as a separate metaphysical proof."

Source-method note: Greek-only check against `raw/plato/greek/timaeus.txt`
with `resolveSourceSpan()`; no translations or provider/model-backed harness
path.

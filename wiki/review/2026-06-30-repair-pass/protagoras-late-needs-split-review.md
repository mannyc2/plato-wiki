# Protagoras Late Needs-Split Sidecar Review

Scope: read-only review of `obs_protagoras_0205`, `0214`, `0217`, `0258`,
`0261`, `0282`, `0285`, `0295`, and `0296` against
`wiki/observations/protagoras.md` and `raw/plato/greek/protagoras.txt`.

Constraints observed: no translations, no provider-backed/model harness runs,
no canonical edits.

General formatting note: I found no bullet-prefixed `greek_terms` in these
target records. I did find translation-like/ellipsis placeholder prose in
`obs_protagoras_0205`; replace it with source-backed English prose and short
Greek terms.

## Recommendations

### obs_protagoras_0205

Recommendation: split into one accepted replacement and drop the rest.

Problem: the current record says there are three poetic authorities in
`344c-344d`. The span supports Pittacus as the addressed maxim-source and an
anonymous second poet introduced as witness, but it does not support a durable
single record about "three poetic authorities." The ellipsis-style English
quotation prose is also not durable.

Accepted replacement:

- `stephanus_span`: `344d`
- `feature_family`: `prosopography` or `poetic_quotation_as_argument`
- `feature_label`: `poetic_authority_cited_in_argument`
- `observation`: Socrates introduces another poet as testimony for the claim
  that a good man can become bad at some times.
- `textual_basis`: At `344d`, the argument marks the anonymous poet as another
  witness with `παρ’ ἄλλου ποιητοῦ` and `μαρτυρεῖται`, after the craft examples
  have led to the claim about the good becoming bad.
- `limits`: This records only the anonymous-poet witness formula in this span;
  it does not count Pittacus, Simonides, and the anonymous poet as a single
  prosopographical cluster, and it does not evaluate the quoted verse.
- `greek_terms`: `[παρ’ ἄλλου ποιητοῦ, μαρτυρεῖται, ἀνὴρ ἀγαθός, κακός, ἐσθλός]`
- `review_status`: `accepted`

New source ref:

```yaml
source_ref:
  source_path: raw/plato/greek/protagoras.txt
  stephanus_span: 344d
  start_marker: 344d
  end_marker: 344d
  start_char: 72673
  end_char: 73078
  text_sha256: 544bae6f592dcc267e03f97fa302415ab481f41cd0f236b0acb236ae74e0b88f
```

### obs_protagoras_0214

Recommendation: split into two accepted replacements.

Problem: the current record combines the `εἶναι` / `γενέσθαι` revision, the
time-limited becoming claim, and the continuing-in-goodness claim. The current
`344a-344b` source ref cuts off the continuation into `344c`.

Replacement A:

- `stephanus_span`: `344a`
- `feature_family`: `definition_ladder`
- `feature_label`: `definition_revised_after_objection`
- `observation`: Socrates reads Simonides as answering Pittacus by shifting the
  disputed predicate from being good to becoming a good man.
- `textual_basis`: At `344a`, the contrast is stated with `οὐ ... εἶναι` and
  `ἀλλὰ γενέσθαι`, attached to the quoted description of the good man.
- `limits`: This records only the being/becoming revision; it does not include
  the later temporal qualification or the claim about remaining good.
- `greek_terms`: `[εἶναι, γενέσθαι, ἀγαθὸν]`
- `review_status`: `accepted`

Replacement A source ref:

```yaml
source_ref:
  source_path: raw/plato/greek/protagoras.txt
  stephanus_span: 344a
  start_marker: 344a
  end_marker: 344a
  start_char: 71358
  end_char: 71757
  text_sha256: ca045edba24ea4d5173b8f977351185cb85ddc5f048cbb1e0426051e7471570d
```

Replacement B:

- `stephanus_span`: `344b-344c`
- `feature_family`: `definition_ladder`
- `feature_label`: `definition_temporally_qualified`
- `observation`: Socrates adds a temporal qualification: becoming good is
  possible for a time, but remaining in that condition and being a good man is
  presented as impossible for a human.
- `textual_basis`: The claim begins at `344b` with `ἐπί γε χρόνον τινά` and
  continues at `344c` with `διαμένειν`, `εἶναι`, and `ἀδύνατον`.
- `limits`: This records the temporal qualification in Socrates' reading of
  Simonides; it does not include the later craft examples or the anonymous-poet
  witness.
- `greek_terms`: `[ἐπί γε χρόνον τινά, διαμένειν, εἶναι, ἀδύνατον]`
- `review_status`: `accepted`

Replacement B source ref:

```yaml
source_ref:
  source_path: raw/plato/greek/protagoras.txt
  stephanus_span: 344b-344c
  start_marker: 344b
  end_marker: 344c
  start_char: 71757
  end_char: 72673
  text_sha256: 47acce67deb697fd6b5afe38ebdcf4ba0fa927aa285e3b840e395e052bc6660e
```

### obs_protagoras_0217

Recommendation: accept with source_ref and prose edits.

Problem: the current `344e-345a` span includes unrelated Simonides/Pittacus
material already covered by adjacent accepted records and cuts off the layman
scope point before it completes at `345b`.

Edits:

- `stephanus_span`: `345a-345b`
- Keep `feature_family: elenchus`
- Keep or sharpen `feature_label: scope_delimitation`
- `observation`: Socrates restricts the "bad through bad action" principle to
  someone who already belongs to the relevant craft: a bad doctor must first be
  a doctor, whereas laypeople in medicine do not become bad doctors by acting
  badly.
- `textual_basis`: At `345a-345b`, Socrates says the bad doctor comes from one
  to whom being a doctor first belongs, while `ἰατρικῆς ἰδιῶται` do not become
  doctors or bad doctors through bad action.
- `limits`: This records the scope restriction produced by craft reasoning; it
  does not include the preceding poetic refutation or the wider account of how a
  good man becomes bad.
- `greek_terms`: `[ἰατρικῆς ἰδιῶται, ὑπάρχει ἰατρῷ εἶναι, κακὸς ἰατρός]`
- `review_status`: `accepted`

New source ref:

```yaml
source_ref:
  source_path: raw/plato/greek/protagoras.txt
  stephanus_span: 345a-345b
  start_marker: 345a
  end_marker: 345b
  start_char: 73478
  end_char: 74390
  text_sha256: 177445a4fc9aa63fc7c6e6cf9b22d443b2b625b4e917495ae16ed21811236d6d
```

### obs_protagoras_0258

Recommendation: accept with source_ref and limits edits.

Problem: the observation is coherent, but the current `351a` source ref cuts
off the completion of the confidence/courage contrast at `351b`.

Edits:

- `stephanus_span`: `351a-351b`
- Keep `feature_family: definition_ladder`
- Keep `feature_label: confidence_courage_distinction`
- Keep the observation substantially as-is.
- `textual_basis`: Cite the power/strength analogy in `351a`, the claim that
  courageous people are confident but not all confident people are courageous,
  and the completed source-list at `351a-351b`.
- `limits`: This records the confidence/courage distinction only; it does not
  include the pleasure-topic pivot later in `351b`.
- `greek_terms`: `[δύναμις, ἰσχύς, θάρσος, ἀνδρεία, τέχνης, θυμοῦ, μανίας, φύσεως, εὐτροφίας]`
- `review_status`: `accepted`

New source ref:

```yaml
source_ref:
  source_path: raw/plato/greek/protagoras.txt
  stephanus_span: 351a-351b
  start_marker: 351a
  end_marker: 351b
  start_char: 85781
  end_char: 86545
  text_sha256: 0d552f618b7d132ce0335c072c94d882ea8cb9c9e4d3ee2957c1a040c1f6af8f
```

### obs_protagoras_0261

Recommendation: accept narrowed record with unchanged source_ref.

Problem: the current record combines Protagoras' qualification at `351d` with
Socrates' abstraction to pleasure itself, which is already covered by accepted
`obs_protagoras_0262` at `351e`.

Edits:

- Keep `stephanus_span: 351d`.
- Keep `feature_family: elenchus`.
- Keep `feature_label: pleasant_good_identity_test`.
- `observation`: Protagoras refuses the simple equation of all pleasant things
  with good things and all painful things with bad things, dividing pleasant and
  painful cases into good, bad, and neutral.
- `textual_basis`: At `351d`, Protagoras says some pleasant things are not good,
  some painful things are not bad, some are, and a third class is neither.
- `limits`: This records Protagoras' qualification only; Socrates' follow-up
  question about pleasure itself belongs with `obs_protagoras_0262`.
- `greek_terms`: `[ἡδέα, ἀγαθά, ἀνιαρά, κακά, οὐδέτερα]`
- `review_status`: `accepted`

### obs_protagoras_0282

Recommendation: accept narrowed record with unchanged source_ref.

Problem: the record starts from the no-one-knowingly-does-worse inference,
whose setup begins in `358b` and is already partly covered by accepted
`obs_protagoras_0281`. The durable local record in `358c` is the epistemic
classification of self-defeat/self-mastery and ignorance.

Edits:

- Keep `stephanus_span: 358c`.
- Keep `feature_family: elenchus`.
- Keep `feature_label: knowledge_priority_argument`.
- `observation`: Socrates classifies being weaker than oneself as ignorance and
  being stronger than oneself as wisdom, then secures agreement that ignorance
  is false belief about matters of great value.
- `textual_basis`: At `358c`, the passage equates `ἥττω` with `ἀμαθία`,
  `κρείττω` with `σοφία`, and defines ignorance through `ψευδῆ ... δόξαν`.
- `limits`: This records the epistemic classification; the preceding inference
  from the pleasant-good agreement is handled by `obs_protagoras_0281`.
- `greek_terms`: `[ἥττω, ἀμαθία, κρείττω, σοφία, ψευδῆ, δόξαν]`
- `review_status`: `accepted`

### obs_protagoras_0285

Recommendation: accept narrowed record with unchanged source_ref.

Problem: the current record tries to include the later four-plus-one courage
exception, but that claim completes in `359b` and is already accepted as
`obs_protagoras_0286`. The `359a` record should be procedural.

Edits:

- Keep `stephanus_span: 359a`.
- Keep `feature_family: turn_geometry`.
- Keep `feature_label: recapitulation_or_restart`.
- `observation`: Socrates restarts the courage inquiry from the agreed premises
  and calls on Protagoras to defend his earlier answer, first recalling the
  initial five-part account of virtue before turning to the later answer.
- `textual_basis`: At `359a`, Socrates marks the prior premises as
  `ὑποκειμένων`, calls for Protagoras to answer, and recalls the initial account
  of five parts of virtue, each with its own power.
- `limits`: This records the procedural restart and first recapitulation only;
  the completed courage exception at `359b` belongs to `obs_protagoras_0286`.
- `greek_terms`: `[ὑποκειμένων, ἀπολογείσθω, πέντε, μορίων, ἀρετῆς, δύναμιν]`
- `review_status`: `accepted`

### obs_protagoras_0295

Recommendation: accept narrowed record with unchanged source_ref.

Problem: the current record combines the claim that defining virtue will clarify
teachability with the personified-argument audit. The broader virtue-inquiry
setup is already represented by accepted `obs_protagoras_0294`; the local
`361a` record should keep the personification frame.

Edits:

- Keep `stephanus_span: 361a`.
- Keep `feature_family: elenchus`.
- Keep `feature_label: retrospective_premise_audit`.
- `observation`: Socrates personifies the just-completed course of argument as
  an accuser and mocker of both Socrates and Protagoras for the strange reversal
  in their positions.
- `textual_basis`: At `361a`, Socrates says the argument's outcome would accuse
  and laugh at them if it received a voice, introducing the charge with
  `ἄτοποί`.
- `limits`: This records the personified audit frame; the detailed reversal
  content continues in `obs_protagoras_0296`, and the renewed inquiry into what
  virtue is is handled by `obs_protagoras_0297`.
- `greek_terms`: `[ἔξοδος, κατηγορεῖν, καταγελᾶν, ἄτοποί]`
- `review_status`: `accepted`

### obs_protagoras_0296

Recommendation: accept with source_ref and prose edits.

Problem: the current `361b` source ref starts inside the personified speech and
cuts off the Protagoras half of the reversal. The observation is coherent if
the span expands through `361c` and the limits exclude Socrates' response at
`361c`, which is already accepted as `obs_protagoras_0297`.

Edits:

- `stephanus_span`: `361b-361c`
- Keep `feature_family: elenchus`.
- Keep `feature_label: retrospective_premise_audit`.
- `observation`: The personified audit says Socrates has moved toward making
  justice, moderation, and courage forms of knowledge, which would make virtue
  teachable, while Protagoras now tends toward making virtue anything rather
  than knowledge, which would make it least teachable.
- `textual_basis`: At `361b-361c`, the imagined speech contrasts Socrates'
  knowledge route with Protagoras' opposite tendency away from knowledge.
- `limits`: This records only the detailed reversal inside the personified
  audit; Socrates' proposed next inquiry at `361c` belongs to
  `obs_protagoras_0297`.
- `greek_terms`: `[ἐπιστήμη, δικαιοσύνη, σωφροσύνη, ἀνδρεία, διδακτὸν, τοὐναντίον]`
- `review_status`: `accepted`

New source ref:

```yaml
source_ref:
  source_path: raw/plato/greek/protagoras.txt
  stephanus_span: 361b-361c
  start_marker: 361b
  end_marker: 361c
  start_char: 107346
  end_char: 108186
  text_sha256: 66bf1a097361c9b5151cd1d7f8d59b7d2ab19a147176cd362630778816dcc966
```

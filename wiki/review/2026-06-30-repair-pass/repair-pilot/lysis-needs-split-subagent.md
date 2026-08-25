# Lysis needs_split scratch review

Scope: all records currently marked `needs_split` in
`wiki/observations/lysis.md`.

Method: inspected current records and resolved source spans from
`raw/plato/greek/lysis.txt` with the local `resolveSourceSpan()` helper in
`packages/harness/src/source.ts`. No translations, Pioneer, provider-backed
harness/model runs, review-segmented, review-queue, or external LLMs were used.
Greek passages are not copied here; only source refs and short `greek_terms`
are cited.

All current `source_ref` hashes for the reviewed records match the deterministic
resolver. Defects below are record-boundary, duplication, or span-scope defects,
not stale offsets.

## obs_lysis_0024

- Current: `205b-205c`;
  `prosopography/ancestral_boasting_in_erotic_context`.
- Recommendation: `split`.
- Suggested split A source ref: `205c`
  (`start=3668`, `end=4123`,
  `sha=8cb24b89304dd86004ddb2538ca902f6a8ee0fd59559545226d7a6d4a3faa948`).
- Suggested split A family/label: keep
  `prosopography/ancestral_boasting_in_erotic_context`, or narrow to
  `prosopography/ancestral_achievement_catalogue`.
- Suggested split A rationale: `205c` supports Ctesippus' report that
  Hippothales repeats public material about Democrates, Lysis' grandfather, the
  ancestors, wealth, horse-breeding, and victories at Pytho, Isthmos, and Nemea.
  This is a catalogue of family status material used in reported erotic praise.
- Suggested split A `greek_terms`: [`Δημοκράτους`, `Λύσιδος τοῦ πάππου`,
  `προγόνων`, `πλούτους`, `ἱπποτροφίας`, `νίκας`].
- Suggested split B source ref: `205c-205d`
  (`start=3668`, `end=4570`,
  `sha=460a5341e5dbeac9a97454e93d108751a09fb75f7c962c382400d2635f35e1cc`).
- Suggested split B family/label:
  `myth_demarcation/heroic_kinship_encomium` or
  `prosopography/heroic_kinship_claim`.
- Suggested split B rationale: the Heracles hospitality item begins at `205c`
  but completes at `205d`; it is a separate antiquated poetic kinship claim, not
  merely another civic achievement in the preceding catalogue.
- Suggested split B `greek_terms`: [`τοῦ Ἡρακλέους ξενισμόν`, `ποιήματί`,
  `συγγένειαν`, `πρόγονος`].
- Source-ref defect: the current `205b-205c` source ref ends mid-sentence before
  the Heracles hospitality claim is complete at `205d`.

## obs_lysis_0039

- Current: `209d-209e`; `elenchus/assent_chain`.
- Recommendation: `accept_narrowed`.
- Exact source ref: `209d-209e`
  (`start=12538`, `end=13362`,
  `sha=89d793868ab636f7da3aa0cee44b29d1e61e381ab1b67b1cf2ef2ffa6f19acb5`).
- Suggested family/label: keep `elenchus/assent_chain`.
- Rationale: the cited span supports a question-and-assent sequence moving from
  household management, to Athenian civic affairs, to the Great King's soup
  example. This record is structural: it records the chained assent form, not
  the substantive knowledge-priority principle.
- Suggested `greek_terms`: keep [`φρονεῖν`, `ἐπιτρέψειν`].
- Uncertainty: the resolver's marker-bounded `209d-209e` slice also includes
  the opening words of the following eye/medicine example before `210a`. The
  observation should not rely on that later example unless widened to `210a`.

## obs_lysis_0040

- Current: `209d-209e`; `elenchus/knowledge_priority_argument`.
- Recommendation: `accept_narrowed`.
- Exact source ref: `209d-209e`
  (`start=12538`, `end=13362`,
  `sha=89d793868ab636f7da3aa0cee44b29d1e61e381ab1b67b1cf2ef2ffa6f19acb5`).
- Suggested family/label: keep `elenchus/knowledge_priority_argument`.
- Rationale: the same span supports a distinct content record: entrusting is
  made conditional on better `φρονεῖν` across household, city, and royal-house
  examples. This is not the same function as `obs_lysis_0039`'s assent-chain
  structure.
- Suggested `greek_terms`: keep [`φρονεῖν`, `ἐπιτρέψειν`, `μέγας βασιλεύς`].
- Uncertainty: avoid extending the observation to the eye/medicine case unless
  the source ref is widened to `209d-210a`.

## obs_lysis_0063

- Current: `212e-213a`; `elenchus/forced_alternative`.
- Recommendation: `reject`.
- Exact source ref: `212e-213a`
  (`start=19304`, `end=20076`,
  `sha=c61bec9b7c893790a773d13869e7ebd73b217ff56b49ce06f7fa8eaa49ed81a2`).
- Rationale: the source supports the beloved-friend inversion and the hated-
  enemy extension, but those are already separated by accepted neighbors:
  `obs_lysis_0062` records the beloved-object inversion, and `obs_lysis_0064`
  records the paradoxical loved-by-enemies / hated-by-friends consequence. A
  repaired split from this record would duplicate those accepted records.
- Suggested family/label if not rejecting: no new label. If a maintainer chooses
  to preserve the enmity step separately, use `elenchus/inversion_counterargument`
  rather than `forced_alternative`, because the source here derives consequences
  after earlier alternatives have already been staged.
- Suggested `greek_terms`: [`φιλούμενον`, `φιλοῦντι`, `μισούμενος`,
  `ἐχθρός`].

## obs_lysis_0092

- Current: `218a-218b`; `definition_ladder/definition_proposed`.
- Recommendation: `split`.
- Suggested split A source ref: `218a-218b`
  (`start=30040`, `end=30875`,
  `sha=4f72707db9ce4fac0851f8fee501a4ac237725a2a82c9127cee4e8c5f8191d57`).
- Suggested split A family/label:
  `definition_ladder/intermediate_epistemic_classification`.
- Suggested split A rationale: `218a-218b` supports the tripartite classification
  about who philosophizes: the already wise do not, the bad/ignorant do not,
  and those still aware of not knowing do. This is a classification step, not
  yet the complete friendship definition.
- Suggested split A `greek_terms`: [`φιλοσοφεῖν`, `σοφοὺς`, `ἄγνοιαν`,
  `ἀμαθεῖς`, `μὴ εἰδέναι`].
- Suggested split B source ref: `218b-218c`
  (`start=30432`, `end=31301`,
  `sha=d03e15d5a87f56baa3833ab4a5a64389a0083b0a9a5817fe8b1f30ee0e7c7cd9`).
- Suggested split B family/label:
  `definition_ladder/definition_recapitulated_as_discovery`.
- Suggested split B rationale: the full statement that Socrates, Lysis, and
  Menexenus have discovered what the friend is and the formula applying it to
  soul, body, and everywhere runs into `218c`; the current source ref cuts off
  before the complete formula.
- Suggested split B `greek_terms`: [`ἐξηυρήκαμεν`, `τὸ φίλον`,
  `μήτε κακὸν μήτε ἀγαθόν`, `παρουσίαν`].
- Source-ref defect: the current `218a-218b` source ref ends mid-formula after
  `κατὰ τὸ`; the complete definition statement requires `218c`.

## obs_lysis_0125

- Current: `222e-223a`;
  `dramatic_case_setup/dramatic_disruption_or_pause`.
- Recommendation: `split`.
- Suggested split A source ref: `223a`
  (`start=40241`, `end=40644`,
  `sha=0a3ca752e403d87c4c590d988ee2d131906292555493971089e4497ed530a412`).
- Suggested split A family/label:
  `turn_geometry/dramatic_disruption_or_pause`.
- Suggested split A rationale: `223a` supports the interruption of Socrates'
  intended move to an older interlocutor by the paidagogoi, their summoning of
  the boys home, and the late-hour reason. The feature function is interruption
  of procedure, so `turn_geometry` is a better family than
  `dramatic_case_setup`.
- Suggested split A `greek_terms`: [`πρεσβυτέρων κινεῖν`, `δαίμονές τινες`,
  `παιδαγωγοί`, `οἴκαδ' ἀπιέναι`, `ὀψέ`].
- Suggested split B source ref: `223a-223b`
  (`start=40241`, `end=41070`,
  `sha=835ed5788486c81fcd5b4ba86232da09b00baf8bb3f93873f37baaf72aec11b1`).
- Suggested split B family/label:
  `closure_type/external_interruption_closes_dialogue`.
- Suggested split B rationale: the forced end of the gathering is not complete
  until `223b`, where the group is defeated by the intruders and dissolves the
  conversation.
- Suggested split B `greek_terms`: [`ὑποβαρβαρίζοντες`, `Ἑρμαίοις`,
  `ἡττηθέντες`, `διελύσαμεν τὴν συνουσίαν`].
- Source-ref defect: the current source ref includes `222e` aporia material
  already covered by `obs_lysis_0126`, while its textual basis relies on
  termination details that continue into `223b`.

## obs_lysis_0136

- Current: `219b`;
  `definition_ladder/definition_explicitly_retained_while_suspect`.
- Recommendation: `reject`.
- Exact source ref: `219b`
  (`start=32436`, `end=32902`,
  `sha=e7a7d31198733f4c6c8d7eef4d52b0595ade2408b6ac6ceff09aeee4bb2b3c72`).
- Rationale: the record compresses three units: the dear-for-the-sake-of-dear
  conclusion, Socrates' vigilance warning, and the setting-aside of the
  dear-to-dear and like-to-like claims. The last two are already accepted as
  `obs_lysis_0137` (`elenchus/self_interruption_for_vigilance`) and
  `obs_lysis_0138` (`definition_ladder/previous_thesis_set_aside_not_refuted`).
  The current label is also misleading: Socrates does not explicitly retain the
  result; he warns against deception and lets the prior claims go.
- Suggested family/label if not rejecting: a standalone record for the opening
  conclusion could use `definition_ladder/for_the_sake_relation_conclusion`,
  but it would be weak next to the accepted follow-up records.
- Suggested `greek_terms`: [`ἕνεκα τοῦ φίλου`, `διὰ τὸ ἐχθρόν`,
  `πρόσσχωμεν τὸν νοῦν`, `ἐῶ χαίρειν`].

## obs_lysis_0139

- Current: `219c`;
  `definition_ladder/for_the_sake_of_regress_stopped_by_first_principle`.
- Recommendation: `split`.
- Suggested split A source ref: `219c`
  (`start=32902`, `end=33279`,
  `sha=855a418188ded6a4c4ba9267b08228357d70db90dee747e0cf9313e6a9f99786`).
- Suggested split A family/label:
  `definition_ladder/for_the_sake_regress`.
- Suggested split A rationale: `219c` supports the recursive structure: medical
  art is dear for health, health is dear for something, and that further item
  must also be dear for the sake of a dear thing if the prior agreement is
  followed.
- Suggested split A `greek_terms`: [`ἰατρική`, `ὑγιείας`, `ἕνεκά του`,
  `φίλου`].
- Suggested split B source ref: `219c-219d`
  (`start=32902`, `end=33667`,
  `sha=e7bc7b92c815d7399843084dd6e69310874442a548556e86f0f7a221696ef48c`).
- Suggested split B family/label:
  `definition_ladder/first_friend_as_regress_terminus`.
- Suggested split B rationale: the first-principle terminus is not complete in
  `219c`; `πρῶτον φίλον` and the statement that other dear things are dear for
  its sake appear at `219d`.
- Suggested split B `greek_terms`: [`ἀρχήν`, `πρῶτον φίλον`,
  `οὗ ἕνεκα`].
- Source-ref defect: the current `219c` source ref ends mid-clause before the
  phrase naming the first friend at `219d`.

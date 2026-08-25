# Critias needs_split scratch review

Scope: all records currently marked `needs_split` in
`wiki/observations/critias.md`.

Method: inspected the current records and exact source spans from
`raw/plato/greek/critias.txt` using the local `resolveSourceSpan()` helper in
`packages/harness/src/source.ts` and the generated Stephanus index. No
translations, Pioneer, provider-backed harness/model runs, review-segmented,
review-queue, external LLMs, or canonical edits were used. Greek is cited only
as short terms.

All current `source_ref` hashes for the reviewed records match the deterministic
resolver. Defects below are span-boundary, duplication, or record-scope defects,
not stale offsets.

## obs_critias_0001

- Current: `106a-106c`; `frame_depth/speaker_transition_with_relief_marker`.
- Recommendation: `accept_narrowed`.
- Exact source span: `106a-106b`
  (`start=0`, `end=676`,
  `sha=9a827e283fe1cdcf17a65c1bc259a29e7297b0b1e15f9139a92cc6c0f148e000`).
- Suggested family/label: `turn_geometry/speaker_transition_with_relief_marker`
  or keep the current label only after changing family away from `frame_depth`.
- Rationale: `106a` supports Timaeus' relief marker after a difficult passage,
  and `106b` supports the formal handoff of the next logos to Critias according
  to the agreements. The prayer content is already separately accepted in
  `obs_critias_0002`, and Critias' mirrored indulgence request is already
  accepted in `obs_critias_0003`.
- Suggested `greek_terms`: [`ἀναπεπαυμένος`, `διαπορείας`, `ἀπήλλαγμαι`,
  `παραδίδομεν`].
- Source-ref defect or uncertainty: the current `106a-106c` source ref is
  valid, but the record combines three textual functions. It should not retain
  the prayer or Critias' indulgence request as part of this observation.

## obs_critias_0005

- Current: `107a-107b`; `rhetorical_disclaimer/speaker_requests_indulgence`.
- Recommendation: `accept_narrowed`.
- Exact source span: `107a-107b`
  (`start=787`, `end=1659`,
  `sha=784aa34fbc045e67b7b9620dd89e72aaaf2f7bb07e595ccec700fe66b295b9b1`).
- Suggested family/label: keep
  `rhetorical_disclaimer/speaker_requests_indulgence`, or narrow label to
  `speaker_requests_greater_indulgence`.
- Rationale: `107a-107b` supports Critias' claim that the forthcoming speech
  needs more indulgence because speaking about mortals to humans is harder than
  seeming adequate about gods to humans, with audience inexperience and
  ignorance around divine matters giving a speaker freedom. The painting
  analogy beginning at `107b` is already separately accepted in
  `obs_critias_0004`.
- Suggested `greek_terms`: [`παραίτησιν`, `συγγνώμης`, `ἀπειρία`, `ἄγνοια`,
  `εὐπορίαν`].
- Source-ref defect or uncertainty: the current basis says mortals can
  scrutinize mortal claims; that scrutiny is developed in `107c-107d`, outside
  the current span. Either remove that clause or widen into the painting
  analogy, but widening would duplicate accepted nearby records.

## obs_critias_0017

- Current: `109b-109c`;
  `myth_demarcation/divine_genealogy_used_to_bifurcate_subject`.
- Recommendation: `accept_narrowed`.
- Exact source span: `109b`
  (`start=5109`, `end=5510`,
  `sha=012380542a937692421d6c50e29e741eee9e639f7878689971ac1bca10a22ac1`).
- Suggested family/label:
  `myth_demarcation/divine_allotment_without_strife`, or merge later into
  `myth_demarcation/divine_allotment_of_earth` if the no-strife rationale is
  kept local in the observation fields.
- Rationale: `109b` supports a narrow record: the gods allot the earth without
  strife, because divine ignorance or competitive seizure is explicitly denied,
  and the positive mechanism is just allotment. The Hephaestus/Athena pairing at
  `109c` is already accepted in `obs_critias_0019`; the shepherd/steering
  governance image is already accepted in `obs_critias_0018`.
- Suggested `greek_terms`: [`οὐ κατ' ἔριν`, `δίκης δὴ κλήροις`].
- Source-ref defect or uncertainty: the source ref is valid, but the current
  record's label says "bifurcate subject" and its prose includes `109c`
  material covered by accepted neighbors. The no-strife allotment is the
  salvageable source-backed record.

## obs_critias_0050

- Current: `112e-113a`; `prosopography/named_historical_figure`.
- Recommendation: `split`.
- Suggested split A source span: `113a`
  (`start=12913`, `end=13321`,
  `sha=f2d2a4dac93afeb65f8cafdd5bff23e847ffeb98d3aef0689e71f46644a361e3`).
- Suggested split A family/label: `prosopography/named_historical_intermediary`.
- Suggested split A rationale: `113a` names Solon and describes his role in
  asking about the force of the names and discovering the Egyptian prior
  rendering. This is a named intermediary in the account's transmission and
  naming frame.
- Suggested split A `greek_terms`: [`Σόλων`, `διαπυνθανόμενος`,
  `τὴν τῶν ὀνομάτων δύναμιν`, `Αἰγυπτίους`].
- Suggested split B source span: `113a-113b`
  (`start=12913`, `end=13742`,
  `sha=48bc879c0bad1e0affbbdaadfe1f0c55efdf260fa65daa76dc2d923144e5bc24`).
- Suggested split B family/label:
  `frame_depth/narratological_account_of_greek_translation`.
- Suggested split B rationale: the full claim that Solon rendered each name
  into Greek is not complete until `113b`, where the text also adds the written
  chain through Critias' grandfather and Critias' childhood study. This is
  already substantially covered by accepted `obs_critias_0043`.
- Source-ref defect or uncertainty: the current `112e-113a` source ref starts
  with the previous Athenian transition and ends mid-sentence before Solon's
  Greek rendering is complete. If duplication with `obs_critias_0043` is not
  wanted, keep only split A and reject split B as already covered.

## obs_critias_0051

- Current: `112e-113a`; `turn_geometry/argument_transition_marker`.
- Recommendation: `accept_narrowed`.
- Exact source span: `113a`
  (`start=12913`, `end=13321`,
  `sha=f2d2a4dac93afeb65f8cafdd5bff23e847ffeb98d3aef0689e71f46644a361e3`).
- Suggested family/label: keep `turn_geometry/argument_transition_marker`.
- Rationale: `113a` supports a narrow transition record: before the adversary
  story proceeds, Critias pauses to make a small preliminary point so the
  audience will not be surprised by Greek names for barbarian men. The source
  also begins the cause of the naming situation.
- Suggested `greek_terms`: [`βραχὺ πρὸ τοῦ λόγου`, `δεῖ δηλῶσαι`,
  `Ἑλληνικὰ`, `βαρβάρων ἀνδρῶν ὀνόματα`].
- Source-ref defect or uncertainty: the current source ref includes irrelevant
  `112e` material. The full Solon translation explanation continues into
  `113b` and is already accepted in `obs_critias_0043`; this record should stay
  on the transition/pause, not the full translation chain.

## obs_critias_0055

- Current: `114c-114d`; `prosopography/named_cast_entry_or_catalog`.
- Recommendation: `accept_narrowed`.
- Exact source span: `114c`
  (`start=15895`, `end=16292`,
  `sha=2db342f8c80f7c9e2b65747e8a9c09ffffd64d588cc6d0c6d577eea810f4e386`).
- Suggested family/label: keep
  `prosopography/named_cast_entry_or_catalog`.
- Rationale: `114c` supports a clean catalog record for the remaining named
  sons of Poseidon: Autochthon, Elasippos, Mestor, Azaes, and Diaprepes, with
  ordinal/pairing markers. The succession rule beginning at `114d` is already
  accepted separately in `obs_critias_0056`.
- Suggested `greek_terms`: [`Αὐτόχθονα`, `Ἐλάσιππον`, `Μήστορα`, `Ἀζάης`,
  `Διαπρέπης`].
- Source-ref defect or uncertainty: the current `114c-114d` source ref is
  valid but includes the start of a separate hereditary-succession record. The
  observation should avoid relying on earlier `114a-114b` names except as
  local context outside the claim.

## obs_critias_0083

- Current: `118e-119a`;
  `dramatic_case_setup/military_contributions_numerical_scheme`.
- Recommendation: `accept_narrowed`.
- Exact source span: `119a`
  (`start=25951`, `end=26392`,
  `sha=a0e23fb81c245c6428ee217a3aba05fc0d6812e06261379fd8fb71843124daaf`).
- Suggested family/label:
  `military_catalogue/fractional_chariot_quota`, or keep the current label only
  after changing family away from `dramatic_case_setup`.
- Rationale: `119a` supports the fractional chariot contribution: each leader
  is assigned to provide a sixth part of a war-chariot toward ten thousand
  chariots. The broader numbered unit muster continues in `119b` and is already
  accepted in `obs_critias_0084`.
- Suggested `greek_terms`: [`ἕκτον μὲν ἅρματος πολεμιστηρίου μόριον`,
  `εἰς μύρια ἅρματα`].
- Source-ref defect or uncertainty: the current `118e-119a` source ref starts
  with unrelated agriculture/transport material and ends after `ἵππους δὲ δύο
  καὶ`, before the riders and other unit details in `119b`. Remove the
  "horses and riders" clause unless widening to `119a-119b`, which would
  overlap accepted `obs_critias_0084`.

## obs_critias_0089

- Current: `120a-120b`;
  `dramatic_case_setup/ritual_with_darkness_and_garment_change`.
- Recommendation: `accept_narrowed`.
- Exact source span: `120b`
  (`start=28380`, `end=28770`,
  `sha=4450a505f0a3ae21195b385b25d8eede590001ae8bf9c00a8dbb155a8b8cdffe`).
- Suggested family/label: keep
  `dramatic_case_setup/ritual_with_darkness_and_garment_change`.
- Rationale: `120b` supports the nocturnal staging: after drinking, depositing
  the bowl, dining, darkness, and cooled sacrificial fire, the kings put on a
  beautiful dark-blue robe and sit on the ground among the burnt oath-offerings.
  The oath and constitutional constraints in `120a-120b` are already accepted
  in `obs_critias_0087` and `obs_critias_0088`.
- Suggested `greek_terms`: [`σκότος`, `ἐψυγμένον`, `κυανῆν στολήν`,
  `χαμαὶ καθίζοντες`, `νύκτωρ`].
- Source-ref defect or uncertainty: the current claim that they conduct their
  judgment through the night depends on `120c`, outside the current span. Either
  remove that clause or split a second record at `120c` for the judgment and
  dawn inscription sequence.

## obs_critias_0097

- Current: `120e-121a`; `myth_demarcation/divine_inheritance_dilution`.
- Recommendation: `split`.
- Suggested split A source span: `120e`
  (`start=29617`, `end=29954`,
  `sha=686fc44ffecc8fe5a5971586b512fde54c26e4b73629078dfa74cf89437322e3`).
- Suggested split A family/label:
  `myth_demarcation/divine_kinship_sustains_obedience`.
- Suggested split A rationale: `120e` supports the first stage: while the
  divine nature suffices and the kings are friendly toward the kindred divine,
  they obey the laws and display high-minded, measured conduct.
- Suggested split A `greek_terms`: [`ἡ τοῦ θεοῦ φύσις`, `κατήκοοί`,
  `τὸ συγγενὲς θεῖον`].
- Suggested split B source span: `121a-121b`
  (`start=29954`, `end=30961`,
  `sha=e82589fb633b422cb8dde2c466a125bbafdfb0f139d1d5c45ef960b1ce211014`).
- Suggested split B family/label:
  `myth_demarcation/divine_inheritance_dilution`.
- Suggested split B rationale: `121a-121b` supports the decline mechanism: the
  divine portion becomes faded through repeated mixture with much mortal
  nature, and the human character prevails. This is distinct from the earlier
  obedience-sustaining divine kinship.
- Suggested split B `greek_terms`: [`ἡ τοῦ θεοῦ μοῖρα`, `ἐξίτηλος`,
  `πολλῷ τῷ θνητῷ`, `ἀνακεραννυμένη`, `ἀνθρώπινον ἦθος`].
- Source-ref defect or uncertainty: the current `120e-121a` source ref ends
  before the mortal admixture phrase is complete at `121b`. Accepted neighbors
  `obs_critias_0098` and `obs_critias_0099` already cover the wealth-as-burden
  simile and the friendship/virtue growth-decay contrast, so the repair should
  keep this record on the divine-element stages only.

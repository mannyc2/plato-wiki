# Laws needs_split repair notes - subagent F

Scope: `obs_laws_1070`, `obs_laws_1094`, `obs_laws_1127`,
`obs_laws_1137`, `obs_laws_1175`, and `obs_laws_1195`.

Method: inspected current Laws YAML blocks, nearby accepted records, and Greek
source spans resolved with `resolveSourceSpan()` from
`packages/harness/src/source.ts`. I did not use translation files, Pioneer,
pioneer-flash, pioneer-pro, review-segmented, review-queue, or any
provider-backed harness path. I did not edit canonical files or derived outputs.

## obs_laws_1070

- Current span/status: `898d` / `needs_split`.
- Recommendation: accept a narrowed record. Keep the source span at `898d`
  (`start_char: 517446`, `end_char: 517844`,
  `text_sha256: cfa1823bd2b6c41c01269152910fe4bb2c2f8f57fde8028b86967a8e92ac67f8`).
- Label guidance: keep `soul_visibility`, but change label to
  `sun_body_visible_soul_unseen`.
- Source-bound guidance: observe only the move from heavenly bodies in general
  to one example, the sun, and the visible-body/unseen-soul contrast. Basis
  should cite `Ἥλιον`, `σελήνην`, `ἄστρα`, `σῶμα`, `ὁρᾷ`, `ψυχὴν`,
  `οὐδείς`. Limits should exclude the `898e` claim that the soul-kind is not
  perceived by bodily senses and the three solar-guidance alternatives already
  covered by `obs_laws_1071`.
- Terms/text to remove: remove `αἰσθήσεσι` and the claim that bodily sense is
  not the mode by which soul is grasped; those belong to `898e`.

## obs_laws_1094

- Current span/status: `909b-909d` / `needs_split`.
- Recommendation: accept a narrowed penalty-package record. Keep the source
  span at `909b-909d` (`start_char: 539048`, `end_char: 540348`,
  `text_sha256: 71fe34fa6155063bdbb1d01b5b48affae7acad3c14ab0b81125492ba5b273159`).
- Label guidance: keep `impiety_penalty_law`, but shorten the label to
  `manipulative_impiety_receives_isolated_prison_unburied_disposal_and_child_care`.
- Source-bound guidance: observe only the offender class defined at `909b` by
  soul-leading claims, promises to persuade gods through sacrifices, prayers,
  and charms, and money-motivated harm to persons, households, and cities; then
  record the corresponding sentence to the inland prison, no free visitors,
  slave-mediated food, unburied disposal outside the borders, and child care as
  orphans from conviction. Basis should cite `ψυχαγωγῶσι`, `θυσίαις`,
  `εὐχαῖς`, `ἐπῳδαῖς`, `γοητεύοντες`, `χρημάτων`, `μεσογέων δεσμωτηρίῳ`,
  `ἄταφον`, `ὀρφανῶν`. Limits should exclude the less malicious corrective
  track in `obs_laws_1093` and the private-shrine/common-cult law that begins
  later inside the `909d` marker and is already covered by `obs_laws_1095`.
- Terms/text to remove: remove `θηριώδεις` and "beastlike" unless the main
  repair deliberately expands the source span back to `909a`; do not use the
  private-household shrine terms from the latter part of `909d`.

## obs_laws_1127

- Current span/status: `924a-924b` / `needs_split`.
- Recommendation: accept a narrowed guardianship-selection record, with one
  explicit follow-up if the succession contingency should be preserved.
- Suggested span for accepted narrowed record: keep `924a-924b`
  (`start_char: 565367`, `end_char: 566262`,
  `text_sha256: f59ddbb539e9be84b09dcb3bc1c2a974a5ac776dd3e03f9b8969b44a845ff2ad`).
- Label guidance: keep `orphan_guardianship_law`, but change label to
  `guardian_selection_by_will_and_kinship_fallback`.
- Source-bound guidance: observe only that written willing guardians are
  authoritative when children need guardians, and that missing or incomplete
  guardian selection falls back to nearest paternal and maternal kin plus one
  friend, installed by the law-guardians for the orphan in need. Basis should
  cite `ἐπιτρόπων`, `ἐπιτροπεύσειν`, `ἐγγύτατα γένει`, `πρὸς πατρός`,
  `πρὸς μητρός`, `φίλων`, `νομοφύλακες`, `ὀρφανῶν`. Limits should exclude
  substitute-child succession, the childless testator's tenth of acquired
  property, and the `924c` law-guardian rotation covered by `obs_laws_1128`.
- Explicit follow-up: if preserving the removed succession material, create a
  separate `inheritance_law/substitute_child_and_tenth_limit_for_childless_testator`
  record. Prefer span `923e-924a` (`start_char: 564911`,
  `end_char: 565815`,
  `text_sha256: 8f67d8fb50a5da6aff17b6e2f83164a00e87f4b683e56854c2b928893b59316a`);
  basis should start at the son-dies-young condition after the prior heir rule
  and cover only naming a second child plus the childless testator's tenth and
  adopted-heir remainder.
- Terms to remove from the narrowed guardianship record: `ὑός`, `γεννητὸς`,
  `ποιητός`, `ἄπαις`, `δεκατημόριον`, `ἐπικτήτου`, and the non-source-form
  `συγγενεῖς`.

## obs_laws_1137

- Current span/status: `927d` / `needs_split`.
- Recommendation: accept a narrowed penalty-contrast record. Keep the source
  span at `927d` (`start_char: 573416`, `end_char: 573814`,
  `text_sha256: 51fc90ef5386177fbf5eaede0920881ffd049ecc2fe35388d605a9cd7ea48ba1`).
- Label guidance: keep `orphan_guardianship_law`, but change label to
  `orphan_wrongdoing_receives_double_damages`.
- Source-bound guidance: observe only that a disobedient person who wrongs
  someone bereft of father or mother must pay double the whole harm compared
  with wrongdoing against a child with both parents. Basis should cite
  `ἀπειθὴς`, `ἔρημον`, `ἀδικῶν`, `διπλῆν`, `βλάβην`, `ἀμφιθαλῆ`. Limits
  should exclude the `927a-927c` prelegal myth already covered by
  `obs_laws_1136` and the following administrative rules for guardians.
- Terms/text to remove: remove `μύθῳ`, `ὀρφανὸν`, `ὑβρίσας`, and the claim
  about the person persuaded by the preceding myth; those terms sit before the
  current `927d` marker.

## obs_laws_1175

- Current span/status: `943d` / `needs_split`.
- Recommendation: accept after correcting the source span one marker backward
  for checkability. Use `943c-943d` (`start_char: 600639`,
  `end_char: 601425`,
  `text_sha256: d6314bf06ef278d8431bd19a449fd948f84f9513638da10e8c20fa750ff2a081`).
- Label guidance: keep
  `desertion_law/premature_departure_before_command_release_is_tried_like_nonservice`.
- Source-bound guidance: observe only the final condition in `943c` plus the
  rule in `943d`: one who has served but goes home before the officers lead
  the force back is charged with desertion in the same venues as nonservice,
  with the same previously stated penalties. Basis should cite
  `στρατεύσηται`, `ἀπαγαγόντων`, `ἀρχόντων`, `οἴκαδε`, `προαπέλθῃ`,
  `λιποταξίου`, `ἀστρατείας`, `τιμωρίαι`. Limits should exclude the military
  excellence award material earlier in `943c` and the false-prosecution warning
  that begins later in `943d`.
- Terms to remove: none if the span is changed to `943c-943d`; if the span is
  left at `943d`, remove `στρατεύσηται` and weaken the observation because the
  serving condition is out of span.

## obs_laws_1195

- Current span/status: `950a-950d` / `needs_split`.
- Recommendation: accept a narrowed preamble record with a shorter span:
  `950a-950c` (`start_char: 614246`, `end_char: 615597`,
  `text_sha256: 74d46cb1a8c12748a3880845fcc606bb035744aa8bf0d730c9a50f196590328a`).
- Label guidance: keep `legislative_preamble`, but change label to
  `foreign_contact_risk_and_reputation_preamble`.
- Source-bound guidance: observe only that foreign contact introduces
  innovations harmful to well-governed cities, while total non-reception and
  non-travel is impossible and appears harsh, so reputation for goodness should
  not be dismissed because even bad observers can often distinguish better and
  worse people in speech and opinion. Basis should cite `καινοτομίας`,
  `ξένοις`, `βλάβην`, `ξενηλασίαις`, `δοκεῖν`, `εὐδοξίαν`, `δόξαις`.
  Limits should exclude the city-specific virtue/reputation completion and
  travel-rule transition at `950d`, which is already covered by
  `obs_laws_1196` for the rule itself.
- Terms/text to remove: remove `ἐπιμειξία` and `ἤθη`, which occur before
  `950a`, and remove `ἀρετήν` if using the narrowed `950a-950c` span. Do not
  keep the actual forty-year/public-mission travel rule in this record.

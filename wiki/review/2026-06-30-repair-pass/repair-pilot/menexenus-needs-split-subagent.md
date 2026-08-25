# Menexenus needs_split repair review

Method: scratch-only review of `wiki/observations/menexenus.md`.
I inspected the current `needs_split` records, nearby accepted/rejected records
in the same local area, and Greek spans from `raw/plato/greek/menexenus.txt`
using `resolveSourceSpan("menexenus", span)` from `packages/harness/src/source.ts`.
I did not use translations, Pioneer, provider/model-backed harness paths, or
non-dry-run review commands.

## obs_menexenus_0005

- Recommendation: `accept_narrowed`.
- Suggested span: `235a-235b`.
- Resolver: `start_char: 1089`, `end_char: 1919`, `text_sha256: cd368f2b77b2727225a1553fa399007f558ef463563c6fd5a5df4eaea7cc40a6`.
- Suggested feature: `irony_marker / feature_candidate_1400 / socratic_self_deprecation_under_rhetoric`.
- Greek terms: `ἐξέστηκα`, `κηλούμενος`, `μείζων`, `γενναιότερος`.
- Rationale: the current `234c-235a` span overlaps the accepted
  `obs_menexenus_0004` enchantment record and stops before the "greater,
  nobler, more beautiful" self-effect at `235b`. The durable component is
  Socrates' self-presentation as transported while listening and praised.
- Duplicate notes: `obs_menexenus_0004` already covers `ποικίλλοντες` /
  `γοητεύουσιν`; do not repeat that enchantment claim here.

## obs_menexenus_0018

- Recommendation: `accept_narrowed`.
- Suggested span: `236e-237a`.
- Resolver: `start_char: 4887`, `end_char: 5706`, `text_sha256: 6d458d45730855ccca6b5be2472af8b75637562d7c1f8395e26169208f249a9f`.
- Suggested feature: `frame_depth / feature_candidate_1568 / reported_speech_setup`.
- Greek terms: `λόγου`, `ἐπαινέσεται`, `παραινέσεται`, `παρακελευόμενος`, `παραμυθούμενος`.
- Rationale: keep only the frame/setup component: the embedded funeral speech is
  introduced by listing what such a speech must do before Socrates begins the
  oration. Remove the inaccurate "dialogue opens" wording and do not make this
  a topic-sequence or definition-ladder record.
- Duplicate notes: `obs_menexenus_0019` is already rejected for topic sequence;
  `obs_menexenus_0020` covers the `κατὰ φύσιν` procedural principle at the same
  local span.

## obs_menexenus_0031

- Recommendation: `accept_narrowed`.
- Suggested span: `237c-237d`.
- Resolver: `start_char: 6096`, `end_char: 6947`, `text_sha256: 170fb0a82c9b96aa42fdd1dab3a1c89c5661f7c4426fbe5c4db6c75dbc707a7e`.
- Suggested feature: no obvious existing feature label. Keep in
  `dramatic_case_setup` only if the label is renamed away from
  `divine_origin_of_land_claimed`; the source supports divine favor/testimony
  for the land, not divine origin of the land.
- Greek terms: `θεοφιλής`, `μαρτυρεῖ`, `ἀμφισβητησάντων`, `ἔρις`, `κρίσις`.
- Rationale: the current span stops before the contest/judgment clause at
  `237d`. The durable record is the oration's claim that the land deserves
  praise because it is god-beloved and witnessed by the gods' dispute/judgment.
- Duplicate notes: `obs_menexenus_0030` covers autochthony and mother-land
  language in the same area; do not fold those claims into this record.

## obs_menexenus_0032

- Recommendation: `accept_narrowed`.
- Suggested span: `237a-237b`.
- Resolver: `start_char: 5296`, `end_char: 6096`, `text_sha256: f0d1b5779538bc473cbcec0f01b7d80501cd555702933a100d8b93a0f8775bbd`.
- Suggested feature: `dramatic_case_setup / feature_candidate_1691 / funeral_oration_praise_sequence_announced`.
- Greek terms: `εὐγένειαν`, `πρῶτον`, `δεύτερον`, `τροφήν`, `παιδείαν`, `ἔργων πρᾶξιν`.
- Rationale: the current `237b-237c` source starts too late for the announced
  sequence. The record is repairable if it is anchored to `237a-237b`, where
  noble birth, upbringing/education, and deeds are ordered.
- Duplicate notes: `obs_menexenus_0020` covers the `κατὰ φύσιν` procedural
  principle; this record should only cover the funeral-oration sequence itself.

## obs_menexenus_0033

- Recommendation: `accept_narrowed`.
- Suggested span: `239d-239e`.
- Resolver: `start_char: 10584`, `end_char: 11218`, `text_sha256: ea657e5f1a2c72b81f0bb33e0e52c4581209436b6a4646cd04280859bb0030b2`.
- Suggested feature: `prosopography / feature_candidate_1283 / named_historical_cast`.
- Greek terms: `Πέρσας`, `Κῦρος`, `ὁ δὲ ὑὸς`, `Δαρεῖος`.
- Rationale: the source supports a Persian-ruler sequence with Cyrus, his son,
  and Darius. Narrow the prose by removing the unsourced parenthetical
  identification of the son as Cambyses.
- Duplicate notes: `obs_menexenus_0034` covers the praise-method instruction at
  the same span; `obs_menexenus_0035` covers autochthonous descent language.

## obs_menexenus_0035

- Recommendation: `accept_narrowed`.
- Suggested span: `239d`.
- Resolver: `start_char: 10584`, `end_char: 10990`, `text_sha256: 8be2007ab918d8c0ffe65febfb28dcb5bd48e4238173b2b637bb55b79d8bfb0c`.
- Suggested feature: `dramatic_case_setup / feature_candidate_1591 / autochthony_claim`.
- Greek terms: `τῆσδε τῆς χώρας ἔκγονοι`, `γονῆς δὲ ἡμέτεροι`.
- Rationale: the autochthony component is source-backed at `239d` and does not
  require the Persian-king catalogue in `239e`.
- Duplicate notes: same reusable function as accepted `obs_menexenus_0030` and
  `obs_menexenus_0047`, but the passage is a separate local recurrence rather
  than a duplicate of those source spans.

## obs_menexenus_0037

- Recommendation: `accept_narrowed`.
- Suggested span: `239c`.
- Resolver: `start_char: 10188`, `end_char: 10584`, `text_sha256: f77eaff0e4fd95aa2640fc80dde5553ff049dfe937eb7bc203287fb5a489176f`.
- Suggested feature: `frame_depth / feature_candidate_1020 / speaker_introduces_argumentative_procedure`.
- Greek terms: `λόγῳ ψιλῷ`, `ἐᾶν`, `ἐν ἀμνηστίᾳ`, `ἐπιμνησθῆναι`.
- Rationale: the source backs a procedural boundary: leave already-hymned deeds
  aside and commemorate deeds that remain without worthy poetic reputation.
- Duplicate notes: `obs_menexenus_0036` covers the poetry/civic filter, and
  `obs_menexenus_0038` covers the myth/logos boundary. This record should be
  narrowed to the positive criterion for what the present oration will treat.

## obs_menexenus_0063

- Recommendation: `accept_narrowed`.
- Suggested span: `244b-244c`.
- Resolver: `start_char: 19497`, `end_char: 20304`, `text_sha256: 439c8a2c0885c18df65a65dc922b512ee1439ad2d5a7622b95bf0e64f1df7f9d`.
- Suggested feature: `dramatic_case_setup / feature_candidate_1837 / war_ethic_doublestandard_kinsman_vs_barbarian`.
- Greek terms: `βαρβάροις`, `συγγιγνώσκουσα`, `Ἕλλησιν`, `ἀγανακτοῦσα`, `χάριν`.
- Rationale: the current `244a-244b` span includes the accepted misfortune
  explanation and cuts off before the Greek-returned-benefit clause. The
  repaired record should begin at `244b` and include `244c`.
- Duplicate notes: `obs_menexenus_0062` already covers `κακίᾳ` / `ἔχθρᾳ` /
  `δυστυχίᾳ`; do not repeat the civil-war-attributed-to-misfortune record.

## obs_menexenus_0065

- Recommendation: `reject`.
- Suggested span: none. Current inspected span: `242e-243a`.
- Resolver for inspected span: `start_char: 16781`, `end_char: 17568`, `text_sha256: f9082cceb79ebcdcccc3831582c5ebdee269ba6f1e809bc16eb9fb7d12ea01e1`.
- Suggested feature: none.
- Greek terms: `τοὺς προεστῶτας τῶν ἄλλων Ἑλλήνων`, `κοινῇ`, `ἰδίᾳ`.
- Rationale: the source backs a war-catalog reversal, not speaker
  ventriloquism. The "without distancing or critique" component is an
  interpretive absence claim rather than a durable extracted record.
- Duplicate notes: `obs_menexenus_0064` already covers the source-backed war
  catalogue in this span.

## obs_menexenus_0066

- Recommendation: `reject`.
- Suggested span: none. Current inspected span: `242e-243a`.
- Resolver for inspected span: `start_char: 16781`, `end_char: 17568`, `text_sha256: f9082cceb79ebcdcccc3831582c5ebdee269ba6f1e809bc16eb9fb7d12ea01e1`.
- Suggested feature: none.
- Greek terms: `τρίτος πόλεμος`, `Σικελίαν`, `Ἑλλήσποντον`.
- Rationale: this span has no local frame-depth marker beyond the general fact
  that the funeral oration continues. The source-backed local content is the
  war catalogue, not the absence of interruption by the outer dialogue.
- Duplicate notes: `obs_menexenus_0064` covers the catalogued conflicts; the
  basic embedded-speech setup belongs near the start of the oration, not as a
  repeated record for every uninterrupted segment.

## obs_menexenus_0084

- Recommendation: `accept_narrowed`.
- Suggested span: `247d-247e`.
- Resolver: `start_char: 26233`, `end_char: 27085`, `text_sha256: a0a01b581adc7f780e1abe95df196471b9b88dfb8ff04ba944fcc452f9426ae2`.
- Suggested feature: `appearance_reality_marker / feature_candidate_2206 / to_onti_reality_marker`.
- Greek terms: `τῷ ὄντι`, `δόξουσι`, `φαινομένους`, `ὄντας`.
- Rationale: keep a localized appearance/reality marker for the consolation to
  parents, but correct the prose: the span contains more than the two uses
  described in the current record, and the proverb use should not drive this
  record.
- Duplicate notes: `obs_menexenus_0083` already covers the proverbial closure
  and its `τῷ γὰρ ὄντι εὖ λέγεται` confirmation.

## obs_menexenus_0088

- Recommendation: `accept_narrowed`.
- Suggested span: `247a`.
- Resolver: `start_char: 25064`, `end_char: 25464`, `text_sha256: 29fb9b6a76e96b23d63fc10d93c5e05c1bd7fc82b01bb78fab2e5cbc02706592`.
- Suggested feature: `turn_geometry / feature_candidate_1899 / speaker_ventriloquism`.
- Greek terms: `ἡμῖν`, `νικῶμεν`, `ὑμᾶς`, `ἀρετῇ`.
- Rationale: do not keep this as `reported_speech_chain`; that chain is
  already explicit at `246c-246d`. The repairable component is the dead fathers'
  first-person voice addressing the living inside the oration.
- Duplicate notes: `obs_menexenus_0085` covers the transmission hedge and
  reported-speech chain; `obs_menexenus_0087` covers the ethical-inversion
  maxim in the same broader area.

## obs_menexenus_0095

- Recommendation: `accept_narrowed`.
- Suggested span: `248e`.
- Resolver: `start_char: 28664`, `end_char: 29122`, `text_sha256: 419a26d0370b15fe61d8bc79c67b6f33479910c89876d2b670d556e26f861ce1`.
- Suggested feature: `turn_geometry / feature_candidate_1899 / speaker_ventriloquism`.
- Greek terms: `ἐπέσκηπτον`, `ἀπαγγέλλειν`, `ἀπαγγέλλω`.
- Rationale: the durable component is the closing transmission formula: the
  dead charged the message and the speaker now reports it. The current
  `248e-249a` span should not include the city's orphan-care/institutional
  material.
- Duplicate notes: `obs_menexenus_0096` covers the city-as-father role at
  `249a`; `obs_menexenus_0097` covers the preceding direct first-person speech
  at `248c-248d`.

## Summary

- `accept_narrowed`: `obs_menexenus_0005`, `obs_menexenus_0018`,
  `obs_menexenus_0031`, `obs_menexenus_0032`, `obs_menexenus_0033`,
  `obs_menexenus_0035`, `obs_menexenus_0037`, `obs_menexenus_0063`,
  `obs_menexenus_0084`, `obs_menexenus_0088`, `obs_menexenus_0095`.
- `reject`: `obs_menexenus_0065`, `obs_menexenus_0066`.
- No target required `leave_blocked_source_ref`.
- No target requires a true multi-record split; the split pressure is resolved
  by narrowing source spans/prose, changing the obvious feature for
  `obs_menexenus_0088`, and rejecting two non-durable records.

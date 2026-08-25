# Laws needs_split repair notes - subagent E

Scope: `obs_laws_0946`, `obs_laws_0949`, `obs_laws_0951`,
`obs_laws_0982`, and `obs_laws_0990` in `wiki/observations/laws.md`.

Method: inspected the current YAML blocks, nearby accepted records, label audit
entries, and Greek source spans resolved with `resolveSourceSpan()` from
`packages/harness/src/source.ts`. I did not use translation files, Pioneer,
pioneer-flash, pioneer-pro, review-segmented, review-queue, or any
provider-backed harness path. I did not edit canonical files or derived outputs.

## obs_laws_0946

- Current span/status: `847b-847c` / `needs_split`.
- Recommendation: split into two accepted records. The current label fuses
  craft-dispute jurisdiction with import/export policy.
- Suggested spans:
  - craft-dispute record: `847b`
    (`start_char: 419531`, `end_char: 419962`,
    `text_sha256: 27eab3b4e62a25b95930cc5eb14a96c5b7841c8c4c2c1f641f24038c4308edf3`)
  - trade-boundary record: `847b-847c`
    (`start_char: 419531`, `end_char: 420349`,
    `text_sha256: 10278fe776917c276ea81c599209221db13cd3603bd74933cfd376136f707bb0`)
- Label guidance:
  - craft-dispute record: change to
    `judicial_procedure/craft_dispute_value_thresholds`.
  - trade-boundary record: keep `trade_law`, but change label to
    `import_export_tax_exemption_and_nonessential_trade_ban`.
- Source-bound guidance:
  - Craft record: observe only that disputes over craftsmen's wages, taking up
    works, and craft-related wrongs are routed by amount: city-wardens up to
    fifty drachmas, common courts above that. Basis should cite `μισθῶν`,
    `ἔργων`, `δραχμῶν`, `ἀστυνόμοι`, `δικαστήρια`. Limits should exclude the
    following import/export rules and the preceding one-craft rule already
    covered by `obs_laws_0945`.
  - Trade record: observe only the tax/import/export boundary: no tax on goods
    imported or exported, non-necessary foreign imports such as incense and
    purple/dyed colors barred, domestic necessities not exported, twelve
    law-guardians supervising after the five eldest are removed. Limits should
    exclude military import exceptions at `847d-847e` and produce distribution.
- Terms to remove from the craft record: `τέλος`, `χρημάτων`, `λιβανωτὸν`,
  `πορφύραν`, `νομοφυλάκων`.
- Terms to remove from the trade record: `μισθῶν`, `ἔργων`, `δραχμῶν`,
  `ἀστυνόμοι`, `δικαστήρια`.

## obs_laws_0949

- Current span/status: `848c-849a` / `needs_split`.
- Recommendation: accept a narrowed civic-space record, and handle the removed
  produce-equality clause only as explicit follow-up if the main repair wants
  to preserve it. The equality sentence begins at `848b` and only tails into
  `848c`; it should not remain hidden inside this civic-space record.
- Suggested span for accepted narrowed record: `848c-848e`
  (`start_char: 422024`, `end_char: 423464`,
  `text_sha256: 5c2d5f389d97733cc69ec78272e8969f821ad0735c2c809f0e7a28ffbef4a352`).
- Label guidance: keep
  `civic_space/villages_and_craft_settlement_are_ordered_around_shrines_and_farming_needs`.
- Source-bound guidance: observe only the settlement sequence: twelve villages
  centered in the twelve parts, shrines and market reserved in each village,
  high-place guard reception, craftsmen divided between city and villages, and
  agronomoi supervising rural craft placement useful to farmers. Basis should
  cite `οἰκήσεις`, `δώδεκα`, `κώμας`, `ἱερὰ`, `ἀγορὰν`, `φρουροῖς`,
  `δημιουργῶν`, `ἀγρονόμων`. Limits should exclude produce-quality equality
  and animal-feed calculation, plus the city/market-warden transition at
  `849a-849b` already covered by `obs_laws_0950`.
- Explicit follow-up if preserving the removed distribution claim: create or
  adjust a `food_distribution` record with span `848b-848c`
  (`text_sha256: d9fdc940ee8646999ebbdea5d81aadf422f085e208019fdaa85c66f362ef26c1`)
  for the same-quality/equality rule across the three shares.
- Terms to remove from the narrowed civic-space record: `νομὴ`, `ἰσότητα`,
  `πολίτων`, `δούλοις`, `ἐλευθέροις`. `ἰσότητα` is out of the current
  `848c-849a` span and belongs to the `848b-848c` follow-up if kept.

## obs_laws_0951

- Current span/status: `849b-849e` / `needs_split`.
- Recommendation: split into three accepted records. The current record fuses
  a monthly sales calendar, status-separated staple retailing, and common-market
  no-credit exchange.
- Suggested replacement A, preserving `obs_laws_0951`: span `849b-849c`
  (`start_char: 423901`, `end_char: 424760`,
  `text_sha256: 245e83b4913d329fa1e095afff35de599ff3d1b4148162f1e78a7abdb50d053f`).
  Label: `market_law/monthly_market_calendar_for_grain_liquids_animals_and_equipment`.
  Observation/basis should cover only new-moon grain, tenth-day liquids, and
  twenty-third-day animals/equipment. Limits should exclude retail-status rules
  and common-market exchange.
- Suggested replacement B, new ID: span `849c-849e`
  (`start_char: 424303`, `end_char: 425652`,
  `text_sha256: fb3d1178328eaccae11469ab2073230f3d6e26ea2c93ec22755e0aeb17b24005`).
  Label: `market_law/staple_retail_routed_through_foreign_markets`. Observation
  should cover the ban on citizens and their slaves retailing staples, foreign
  market sales to craftsmen and their slaves, cooks' distribution of slaughtered
  animals, and foreign firewood sale. Limits should exclude the monthly calendar
  and the common-market/no-credit rule.
- Suggested replacement C, new ID: span `849e`
  (`start_char: 425158`, `end_char: 425652`,
  `text_sha256: d26ea9bcd3e67d86b0df12ebc2046c271fd53aab8383d0e3b00fa57afc49bff1`).
  Label: reuse or align with
  `market_exchange_law/valid_exchange_requires_market_place_and_immediate_payment`.
  Observation should cover other goods/equipment being exchanged only in marked
  common-market seats, coin-for-goods immediate exchange, and the trust-credit
  party having no legal action. Limits should exclude the calendar/status rules
  and the registration rules beginning at `850a`.
- Terms to distribute/remove:
  - Calendar record: keep `μηνὸς`, `νέᾳ`, `σίτου`, `ἀγορᾷ`, `δεκάτῃ`,
    `ὑγρῶν`, `ζῴων`; remove `καπηλείας`, `ξένων`, `νόμισμα`.
  - Status-retail record: keep `καπηλείας`, `κριθῶν`, `πυρῶν`, `ξένων`,
    `δημιουργοῖς`, `μάγειροι`, `ὕλην`; remove calendar terms and `νόμισμα`.
  - Common-market exchange record: keep `κοινὴν ἀγορὰν`, `νομοφύλακες`,
    `ἀγορανόμοι`, `ἀστυνόμων`, `ἕδρας`, `νόμισμα`, `ἀλλαγήν`; remove calendar
    and staple-retail terms.

## obs_laws_0982

- Current span/status: `864a-864c` / `needs_split`.
- Recommendation: accept a narrowed definition record, but change the span
  backward to `863e-864a`; do not create a second replacement for `864b-864c`
  because accepted `obs_laws_0983` already covers the three/five-kind legal
  classification in that range.
- Suggested source_ref change: `863e-864a`
  (`start_char: 449163`, `end_char: 449985`,
  `text_sha256: 1f6c67e45e46837ba42d4ac9a18dbd73b21f807239fcac9bd6bfb52e8930debc`).
- Label guidance: change to
  `injustice_theory/psychic_tyranny_and_best_opinion_define_unjust_and_just`.
  This avoids the current `right_opinion` wording, which is less source-bound
  for `864a` than "opinion of the best."
- Source-bound guidance: observe the paired definition only: tyranny in the
  soul by spirit/fear/pleasure/pain/envy/desires is called injustice whether or
  not harm results; opinion of the best ruling in souls orders action called
  just even if it errs, while many call the resulting harm involuntary
  injustice. Basis should cite `θυμοῦ`, `φόβου`, `ἡδονῆς`, `λύπης`,
  `φθόνων`, `ἐπιθυμιῶν`, `τυραννίδα`, `ἀδικίαν`, `ἀρίστου`, `δόξαν`,
  `δίκαιον`, `βλάβην`. Limits should exclude the `864b-864c` recall of error
  kinds and two legal modes.
- Terms to remove from this record: `ἁμαρτανομένων`, `νόμους`, and the
  `864b-864c` forms used only for `obs_laws_0983`. Replace current `θυμὸν`
  with source-form `θυμοῦ` if keeping that term.

## obs_laws_0990

- Current span/status: `866b-866c` / `needs_split`.
- Recommendation: split into two accepted records. The current record combines
  a kin-nonprosecution pollution rule with a distinct foreigner/resident-alien
  involuntary-homicide rule.
- Suggested replacement A, preserving `obs_laws_0990`: span `866b`
  (`start_char: 454159`, `end_char: 454550`,
  `text_sha256: 5f08b33eea17580c365b6e88b201393ba8689145f4f5eb76cd0d22d6ef855025`).
  Label: `homicide_law/kin_nonprosecution_transfers_pollution_and_public_suit`.
  Observation should cover only the nearest relative's failure to prosecute:
  pollution turns toward him, anyone willing may bring suit, and the sanction
  is five years away from his homeland. Limits should exclude the preceding
  double-penalty clause covered by `obs_laws_0989` and the following foreigner
  rule.
- Suggested replacement B, new ID: span `866b-866c` if the opening condition
  must be explicit, or `866c` if the main repair accepts the pronoun-only start
  after context. Prefer `866b-866c` for checkability
  (`start_char: 454159`, `end_char: 454947`,
  `text_sha256: 407fc0bbd3daaee792ff459e4e096d5210d3e451e87d6a7e123f1fcbefbc3c9c`).
  Label: `homicide_law/foreign_involuntary_homicide_exile_by_residence_status`.
  Observation should cover any-person prosecution when a foreigner unwillingly
  kills a foreigner in the city, the resident alien's one-year absence, and the
  complete foreigner's lifelong exclusion after purification when he kills a
  foreigner, resident alien, or citizen. Limits should exclude kin
  nonprosecution and the unlawful/accidental return penalties already opened in
  `obs_laws_0991`.
- Terms to distribute/remove:
  - Kin-pollution record: keep `προσήκων`, `μίασμα`, `ὁ βουλόμενος`, `δίκην`,
    `πέντε ἔτη`; remove `ξένος`, `μέτοικος`, `ἀπενιαυτησάτω`, `καθαρμῷ`,
    `νομοφύλακες`.
  - Foreigner-status record: keep `ξένος`, `ὁ βουλόμενος`, `μέτοικος`,
    `ἀπενιαυτησάτω`, `καθαρμῷ`, `εἰργέσθω`; remove `προσήκων`, `μίασμα`,
    `πέντε ἔτη`, and `νομοφύλακες`. `νομοφύλακες` belongs to the unlawful
    return branch, not this replacement.

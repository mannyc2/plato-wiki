# Laws needs_split repair notes - subagent C

Scope: `obs_laws_0598`, `obs_laws_0599`, `obs_laws_0633`,
`obs_laws_0634`, and `obs_laws_0665` in `wiki/observations/laws.md`.

Method: inspected the current ledger records, resolved the cited Laws spans
against `raw/plato/greek/laws.txt` with `resolveSourceSpan()`, and checked
nearby accepted observations for duplicate coverage. No translation files were
used.

## obs_laws_0598

- Current span/status: `736c` / `needs_split`.
- Recommended status: `accepted`, with narrowed prose.
- Recommended span/source_ref change: keep `736c`; existing source_ref is
  valid.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 736c
  start_marker: 736c
  end_marker: 736c
  start_char: 209597
  end_char: 210015
  text_sha256: 71f5b0bfd726db3db0d60b5177a968bb776da2edf656b647ecca92e4c4348d37
```

- Short rationale: the current record pulls `λόγῳ`, `συλλογὴ`, and
  `καθαρότης` from the preceding `736b` material. The actual `736c` span
  supports a narrower entrant-screening rule: bad prospective citizens are
  tested by persuasion and time and prevented from entering, while good ones
  are welcomed as far as possible.
- Nearby duplicate/overlap note: `obs_laws_0597` covers the `736b`
  water/purity image. No nearby accepted record covers the `736c`
  entrant-screening rule. `obs_laws_0599` may overlap at marker `736c` if
  repaired to cover the following land/debt sentence, but it records a distinct
  property-legislation problem.

Proposed accepted fields:

```yaml
greek_terms:
  - πολιτευσομένους
  - πειθοῖ
  - χρόνῳ
  - διαβασανίσαντες
  - διακωλύσωμεν
  - ἀγαθοὺς
observation: >-
  The founding account screens prospective settlers by moral quality: bad
  would-be citizens are to be tested by persuasion and sufficient time and then
  kept from entering, while good settlers are to be welcomed as far as possible.
textual_basis: >-
  At 736c the speaker says that people attempting to join the present city as
  future citizens should be tested by every persuasion and sufficient time if
  they are bad, blocked from arriving, and, if good, brought in with goodwill
  as far as possible.
limits: >-
  This records the entrant-screening rule in the cited marker. It does not
  include the preceding spoken-foundation proviso or the water-purity image at
  736b.
```

## obs_laws_0599

- Current span/status: `736d` / `needs_split`.
- Recommended status: `accepted`, with source_ref widened to the sentence that
  names the land/debt problem and narrowed away from the `736e` moderation
  material.
- Recommended span/source_ref change: replace `736d` with `736c-736d`.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 736c-736d
  start_marker: 736c
  end_marker: 736d
  start_char: 209597
  end_char: 210364
  text_sha256: 31304c5440dd0b816e936d4e51453f72dd5059cea7900875eb9aefa50eb18e18
```

- Short rationale: `736d` alone starts after the land/debt dispute has been
  named. The `736c-736d` range covers the complete claim that old cities face a
  dangerous land/debt reform problem that cannot be left untouched or moved
  directly, leaving only a prayer-like, small, cautious, long-term transition.
- Nearby duplicate/overlap note: `obs_laws_0600` already covers the following
  `736e` material on sharing, moderation, and poverty as insatiability. No
  accepted nearby record covers the old-city land/debt impasse itself.

Proposed accepted fields:

```yaml
greek_terms:
  - γῆς
  - χρεῶν
  - ἀκίνητον
  - κινεῖν
  - εὐχὴ
  - μετάβασις
observation: >-
  The Athenian treats inherited land-and-debt disputes as an old-city problem
  that cannot simply be left untouched or directly moved. The remaining remedy
  is described as nearly prayer-like: a small, cautious transition over a long
  time.
textual_basis: >-
  At 736c-736d, after saying the Heraclid colony avoided a dangerous dispute
  over cutting and distributing land and debts, the speaker says that a city
  compelled to legislate about such ancient arrangements can neither leave them
  unmoved nor move them directly. What remains is almost only prayer and a
  small cautious transition over much time.
limits: >-
  This records the legal impasse and transition strategy for old land/debt
  arrangements. It does not include the subsequent owner-debtor sharing,
  moderation, or poverty-as-insatiability material at 736e.
```

## obs_laws_0633

- Current span/status: `745a` / `needs_split`.
- Recommended status: `accepted`, with source_ref widened to include the
  upper-limit setup in the preceding marker.
- Recommended span/source_ref change: replace `745a` with `744e-745a`.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 744e-745a
  start_marker: 744e
  end_marker: 745a
  start_char: 227427
  end_char: 228215
  text_sha256: 1d8ce59168715fcd20bc4d8397f121d8481d2f5ec56c36c1e6c1db90ff9f52c2
```

- Short rationale: `745a` alone begins after the permitted multiples have been
  introduced. The `744e-745a` range covers the poverty-measure baseline, the
  permitted double/triple/quadruple holdings, surplus assignment to the city
  and gods, and the disclosure/penalty rule for disobedience. The accepted
  record should avoid redoing the lower poverty floor as its main point.
- Nearby duplicate/overlap note: `obs_laws_0632` already covers the lower
  property boundary at `744e`. No nearby accepted record covers the upper
  ceiling, surplus surrender, and forfeiture mechanism. `obs_laws_0634` should
  cover the following public property register.

Proposed accepted fields:

```yaml
greek_terms:
  - μέτρον
  - διπλάσιον
  - τριπλάσιον
  - τετραπλασίου
  - περιγιγνόμενα
  - πόλει
  - θεοῖς
  - ἀζήμιος
  - ἀπειθῇ
observation: >-
  The property law sets an upper wealth ceiling by multiples of the poverty
  measure and assigns surplus beyond that ceiling to the city and its gods.
  Voluntary surrender is honorable and penalty-free, while disobedience
  triggers disclosure and an added forfeiture divided between the revealer and
  the gods.
textual_basis: >-
  At 744e-745a the speaker allows acquisition up to double, triple, and as far
  as quadruple the measure, then directs excess acquired by finding, gift,
  trading, or chance to the city and its gods. He adds that obedience brings
  good repute and no penalty, while disobedience may be exposed by any willing
  revealer, with the penalty divided between the revealer and the gods.
limits: >-
  This records the upper wealth ceiling and its surplus-forfeiture enforcement.
  It does not repeat the lower poverty floor already covered at 744e or the
  public property register that follows.
```

## obs_laws_0634

- Current span/status: `745b` / `needs_split`.
- Recommended status: `accepted`, with source_ref widened to cover the command
  that begins before the `745b` marker.
- Recommended span/source_ref change: replace `745b` with `745a-745b`.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 745a-745b
  start_marker: 745a
  end_marker: 745b
  start_char: 227777
  end_char: 228613
  text_sha256: dbaf2c14faa8811b876f273f377b29de48dd16baf42fc132a7cda97fe7d202ea
```

- Short rationale: `745b` alone only contains the tail of the money-case
  purpose clause and then turns to city-site selection. The register command
  itself begins in `745a`, so the source_ref must include `745a-745b`.
- Nearby duplicate/overlap note: no nearby accepted observation covers the
  movable-property register. `obs_laws_0633` should cover the preceding
  surplus-forfeiture rule, and `obs_laws_0635` begins the following territorial
  division at `745c`.

Proposed accepted fields:

```yaml
greek_terms:
  - κτῆσις
  - χωρὶς τοῦ κλήρου
  - φανερῷ
  - γεγράφθω
  - φύλαξιν
  - δίκαι
  - χρήματα
observation: >-
  Possessions apart from the assigned land lot are made publicly legible:
  every such holding must be written openly before law-appointed guardians so
  that money-related lawsuits are easy and clear.
textual_basis: >-
  At 745a-745b the speaker orders every possession apart from the lot to be
  written in public before the guardian officials appointed by law, so that all
  cases concerning money will be easy and very clear.
limits: >-
  This records the public register for property outside the land lot. It does
  not include the preceding surplus-forfeiture sanction or the following
  city-site and twelve-part division instructions.
```

## obs_laws_0665

- Current span/status: `757a` / `needs_split`.
- Recommended status: `accepted`, with source_ref widened to include the
  regime-mixing sentence immediately before the `757a` marker.
- Recommended span/source_ref change: replace `757a` with `756e-757a`.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 756e-757a
  start_marker: 756e
  end_marker: 757a
  start_char: 245937
  end_char: 246858
  text_sha256: fc390ff241737f3a6b119b32f2c315f38d95ed0717d281fd3689b137645497d4
```

- Short rationale: `757a` alone starts after the claim that the election holds
  the middle between monarchic and democratic constitution. The `756e-757a`
  range captures that claim and the immediate explanation that civic friendship
  is destroyed by master/slave relations and by declaring unequal people equal
  in honors.
- Nearby duplicate/overlap note: `obs_laws_0664` already covers the final
  vote/lot/examination mechanics at `756e`, while `obs_laws_0666` covers the
  two equalities distinguished at `757b`. No accepted nearby record covers the
  middle-constitution rationale itself.

Proposed accepted fields:

```yaml
greek_terms:
  - αἵρεσις
  - μέσον
  - μοναρχικῆς
  - δημοκρατικῆς
  - φίλοι
  - ἴσαις τιμαῖς
  - ἀνίσοις
  - στάσεων
observation: >-
  The council-election arrangement is explicitly framed as a constitutional
  middle between monarchic and democratic forms. Its rationale is that civic
  friendship fails where master/slave relations remain or where unequal people
  are declared equal in honors, and such errors fill constitutions with
  factions.
textual_basis: >-
  At 756e-757a, after the council selection procedure, the speaker says that
  this mode of election would hold the middle between monarchic and democratic
  constitution. He explains at 757a that slaves and masters cannot become
  friends, nor can bad and serious people when declared in equal honors, since
  equal things become unequal for unequal people unless they attain measure,
  and both errors fill constitutions with factions.
limits: >-
  This records the regime-mixing rationale attached to the election procedure.
  It does not repeat the final council-selection mechanics covered at 756e or
  the two-equality taxonomy that begins at 757b.
```

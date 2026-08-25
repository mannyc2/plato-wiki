# Laws needs_split repair notes - subagent D

Scope: `obs_laws_0699`, `obs_laws_0706`, and `obs_laws_0715` in
`wiki/observations/laws.md`.

Method: inspected the current YAML blocks and nearby accepted records, then
resolved the relevant Laws spans from `raw/plato/greek/laws.txt` with
`resolveSourceSpan()` in `packages/harness/src/source.ts`. I did not use
translation files, Pioneer, pioneer-flash, pioneer-pro, review-segmented,
review-queue, or any provider-backed harness path. I did not edit canonical
files or derived outputs.

## obs_laws_0699

- Current span/status: `765d` / `needs_split`.
- Recommended status: split into two accepted observations.
- Recommended source_ref change: keep `765d` for both replacement records;
  existing source_ref is valid.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 765d
  start_marker: 765d
  end_marker: 765d
  start_char: 264291
  end_char: 264714
  text_sha256: fe550f26d7544ab1299f3dd5598a7bff4daeafbadd7d98b7e324afd38d3aeef6
```

- Short reason: `765d` contains a closing failed-scrutiny replacement rule for
  the preceding office-selection sequence and then opens a distinct education
  superintendent profile. `obs_laws_0698` explicitly excludes the failed
  scrutiny replacement rule, while `obs_laws_0700` begins the rank/rationale for
  the education office at `765e`, so both parts are locally useful and neither
  should remain fused.

Proposed replacement A, preserving `obs_laws_0699` for the main new office
profile:

```yaml
greek_terms:
  - παιδείας
  - ἐπιμελητὴς
  - θηλειῶν
  - ἀρρένων
  - πεντήκοντα
  - παίδων
feature_family: education_offices
feature_label: education_superintendent_profile
observation: >-
  The remaining education office is a single superintendent over all female and
  male education, legally installed, at least fifty years old, and a father of
  legitimate children, preferably both sons and daughters.
textual_basis: >-
  At 765d the Athenian introduces the remaining official over the matters
  already discussed as the superintendent of all education for females and
  males. The same marker requires one person to rule these matters according to
  law, to be no younger than fifty, and to be father of legitimate children,
  preferably sons and daughters or at least one of the two.
limits: >-
  This records the basic profile of the education superintendent. It does not
  include the preceding failed-scrutiny replacement rule or the later rationale
  for the office's rank.
```

Proposed replacement B, new ID to be assigned during canonical repair:

```yaml
greek_terms:
  - ἀποδοκιμασθῇ
  - ἀρχῆς
  - λῆξιν
  - κρίσιν
  - ἀνθαιρεῖσθαι
  - δοκιμασίαν
feature_family: office_selection
feature_label: failed_scrutiny_replaced_by_same_selection_procedure
observation: >-
  When a selected official fails scrutiny after any lot and judgment, replacement
  candidates are to be chosen by the same procedure and subjected to the same
  scrutiny.
textual_basis: >-
  At 765d the Athenian says that if someone is rejected under any office lot and
  judgment, others are to be counter-selected in the same way and their scrutiny
  is to be conducted likewise.
limits: >-
  This records only the same-procedure replacement rule after failed scrutiny.
  It does not include the following introduction of the education superintendent.
```

## obs_laws_0706

- Current span/status: `767a` / `needs_split`.
- Recommended status: `accepted`, with narrowed prose.
- Recommended source_ref change: keep `767a`; existing source_ref is valid.

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 767a
  start_marker: 767a
  end_marker: 767a
  start_char: 266952
  end_char: 267421
  text_sha256: bd73dfab7b71bef04b5880da3a7a188d44b96f7552d7a2248e8317a4ab2b7e50
```

- Greek terms to keep/change: keep `ἀμφισβητουμένας`, `κρίσιν`,
  `δικαστήριον`, `διαλλάξαι`, `δίκῃ`; drop `δικαστηρίων`, `ἀρχόντων`,
  `δικαστὴν` from this record because those belong to the court-as-office
  transition.
- Short reason: the first sentence of `767a` supports a complete private-dispute
  escalation record. The second sentence starts the courts-as-office framing,
  but adjacent accepted `obs_laws_0707` already records that judges are treated
  as rulers before the court taxonomy. A new replacement record would mostly
  duplicate that neighbor.

Proposed accepted fields:

```yaml
greek_terms:
  - ἀμφισβητουμένας
  - κρίσιν
  - δικαστήριον
  - διαλλάξαι
  - δίκῃ
feature_family: judicial_procedure
feature_label: private_disputes_escalate_to_final_court
observation: >-
  Private disputed actions move from the earlier local judges to another court
  if adequate judgment is not obtained, and a third court ends the lawsuit if
  the first two courts cannot reconcile the parties.
textual_basis: >-
  At 767a, after the direction to go first to neighbors, friends, and those most
  aware of the facts, the Athenian says that someone who does not receive
  adequate judgment there should go to another court. If the two courts cannot
  reconcile the parties, the third court is to put an end to the lawsuit.
limits: >-
  This records the escalation rule for disputed private actions. It does not
  include the following transition that treats court establishments as selections
  of rulers or the court taxonomy continued at 767b.
```

## obs_laws_0715

- Current span/status: `769a-769b` / `needs_split`.
- Recommended status: split into two accepted observations.
- Recommended source_ref change: keep `769a-769b` for the painting-process
  record; use `769a` for the separate thoughtful-play frame.

Current full-span source_ref, retained for the painting-process record:

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 769a-769b
  start_marker: 769a
  end_marker: 769b
  start_char: 271297
  end_char: 272046
  text_sha256: 9c969e0c4f3f5fcca2e4cf28c4f1de7121c3b6afa19ccc5fa224106557824d43
```

Narrow source_ref for the thoughtful-play frame:

```yaml
source_ref:
  source_path: raw/plato/greek/laws.txt
  stephanus_span: 769a
  start_marker: 769a
  end_marker: 769a
  start_char: 271297
  end_char: 271694
  text_sha256: 32e5907ad14b74337e6645d749bb9187a987e0cbcded1bb70e1ec3a5a45f6490
```

- Short reason: the first exchange at `769a` explicitly labels the preceding
  civic discussion as old men's thoughtful play and beautiful seriousness. The
  following painting comparison, crossing `769a-769b`, is a separate analogy
  about an unfinished craft-process. `obs_laws_0716` already handles the next
  step of the analogy, mortality and successors, so the painting record should
  stop before that application.

Proposed replacement A, preserving `obs_laws_0715` for the current
`analogy_structure` label:

```yaml
greek_terms:
  - ζωγράφων
  - ζῴων
  - πέρας
  - χραίνειν
  - ἀποχραίνειν
  - κοσμοῦσα
  - καλλίω
  - φανερώτερα
feature_family: analogy_structure
feature_label: painting_work_never_fully_stops_improving_image
observation: >-
  Painting is introduced as an unfinished craft-process: work on each living
  figure seems to have no fixed limit because coloring and retouching can keep
  making the painted images more beautiful and clearer.
textual_basis: >-
  At 769a-769b the Athenian asks them to consider painters, saying that their
  work concerning each living figure seems to have no limit. He names coloring
  and removing color, or whatever the painters' children call such procedures,
  and says the activity never seems to stop adorning the painted things so that
  they no longer admit improvement toward being more beautiful and clearer.
limits: >-
  This records the painting analogy's unfinished-improvement structure. It does
  not include the preceding old-men/play framing or the later successor
  requirement at 769c.
```

Proposed replacement B, new ID to be assigned during canonical repair:

```yaml
greek_terms:
  - πρεσβυτῶν
  - ἔμφρων
  - παιδιὰ
  - σπουδὴν
feature_family: turn_geometry
feature_label: play_serious_contrast_marker
observation: >-
  The dialogue marks the preceding discussion as old men's thoughtful play, and
  Clinias immediately restates that frame as a beautiful seriousness.
textual_basis: >-
  At 769a the Athenian says that what they have played through up to this point
  would be old men's thoughtful play. Clinias responds that he appears to be
  indicating the men's beautiful seriousness, and the Athenian accepts the
  response before turning to the painting comparison.
limits: >-
  This records the explicit play/seriousness framing at the transition. It does
  not include the painting analogy that follows in the same marker.
```

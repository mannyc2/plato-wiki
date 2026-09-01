# Known Limits

> Historical v1 audit snapshot. Current ontology limits and invariants are
> recorded in `docs/ontology-vnext.md` and the content-addressed audit package.

Generated for the v1.0 completion audit. Numeric claims below name the
artifact or command that reproduced them.

## Source Publication

- `raw/plato/SOURCES.md` identifies all 27 Greek source files and the four
  legacy English translation files. The translation rows now map to pinned
  `perseus-eng2` TEI headers for Euthyphro, Apology, Crito, and Phaedo.
- The repository and generated site remain private for v1.0 by operator
  sign-off in `raw/plato/SOURCES.md`. Public exposure is deferred to a
  post-v1.0 task, where share-alike/redistribution mechanics must be confirmed
  before release.
- The extraction protocol uses `raw/plato/greek/` as canonical input. The
  legacy files under `raw/plato/translations/` are not extraction inputs and
  are not copied into the static site.

## Speaker Attribution

- Five dialogues have no speaker sigla and therefore one whole-file
  unattributed turn each: apology, charmides, lysis, parmenides, republic.
  Reproduced by `bun run harness derive turns`.
- Consequences: speaker pages, turn metrics, and claim `speaker` fields for
  those dialogues are absent or `(unattributed)` rather than person-resolved.
- Narrated interior speech is not segmented corpus-wide. The turn extractor
  recognizes explicit line-start sigla; reported speech inside narration is a
  post-v1.0 task. The reported-speech voice attribution rollout opened the voices lane against this limit and piloted
  it on the Symposium only.

### Claim `speaker` semantics (plans 071, 076)

- In an **activated** dialogue, `speaker` means the **innermost textually
  licensed owner of the claim**, not the outer printed turn siglum. Within such
  a dialogue this is a hard cutover: no compatibility field, alias, or fallback
  exists. Narration structure is represented only in
  `derived/plato/joins/voices/<dialogue>.toon`, as `outer_turn_speaker` and
  `voice_chain`. See `docs/voices-protocol.md`.
- **Symposium is the only activated dialogue.** Its cutover was applied at
  `3a3a5bd` on 2026-07-25 and is recorded in
  `derived/plato/voices/cutovers.toml`. For the other 26 dialogues `speaker`
  still holds the outer turn siglum.
- Activation is a registry decision, not an inference (the voice activation contract). Extracting,
  accepting, and compiling nested reported turns are three earlier states that
  change no claim. A dialogue may hold accepted, compiled, fully validated
  reported-turn data and still have every claim on its pre-cutover speaker; that
  data must have no stored join at all. Only an entry in `cutovers.toml`
  authorizes consumption.
- Consequently, reported-turn extraction for Phaedo, Euthydemus, Protagoras and
  the rest is **not** gated on their claim ledgers. The previous coupling made it
  look as if compiling Phaedo's index would have to strip `turn_level`
  attribution from 102 accepted claims in the same act.
- The cutover is all-or-nothing within a dialogue. `--apply` refuses while any
  accepted claim in scope resolves to no single owner, because migrating some
  would leave two meanings of `speaker` in one ledger. Unresolved claims must
  first be anchored or moved to a non-accepted status through the
  provenance-backed review lane.
- Acceptance of voice records is atomic per turn. Accepting a parent span without
  its deeper children derives nothing at all, rather than silently returning the
  children's characters to the parent.
- The nested-reported-turn lane and the English audio speaker-attribution
  pipeline under `scripts/audio/` are independent. Neither reads the other's
  data, and neither `cutovers.toml` nor any voice record affects audio.

### Symposium voice pilot, measured 2026-07-19 (corrective pass)

- `wiki/voices/symposium.md` holds 113 unreviewed records covering 100.00% of
  `turn_symposium_0005` (103,974 characters; 80,598 Greek letters). 95.53% of the
  turn resolves to a licensed voice; 4.47% is recorded as explicitly unresolved.
  Reproduced by `bun scripts/voices-2026-07/preview-symposium.ts`.
- The two conversational regions are segmented at utterance granularity from the
  source's own `{p}` discourse boundaries — the Socrates-Agathon elenchus
  (199c-201c, 41 utterances) and the Socrates-Diotima conversation (201e-212b,
  86 utterances) — and **split inside a `{p}` wherever the text hands off**. A
  paragraph is a discourse boundary, not a speaker boundary; the source proves it
  at 199e, where `{p} … εἰπεῖν τὸν Σωκράτη … φάναι εἶναι.` puts Socrates's
  question and Agathon's answer in one paragraph. Diotima has resolved spans
  totalling 16,565 characters.
- A span resolves only when exactly one party's discriminating cue occurs in it
  AND no unattributed reporting act does. A clause-final `φάναι εἶναι.` or
  `ὡμολόγει.` marks a second speech act that no cue names; attributing it to the
  other party would be dialogue-alternation reasoning, which is not permitted
  evidence, so it is split off and left unresolved.
- Claim ownership is derived from exact support ranges, not the Stephanus context
  window: 151 of 189 claims resolve to one owner, 35 are `needs_anchor`, 2 are
  `unresolved_span` and 1 is genuinely `cross_voice`.
- `needs_anchor` is an anchoring gap, not a cross-voice verdict. Of 509 reviewed
  `greek_terms`, 64 do not occur verbatim in their own claim window (53 claims
  affected) and 41 occur more than once (37 claims). The commonest cause is an
  elided quotation: the ledger records `μέγα τεκμήριον` where the source reads
  `μέγα {195b} δὲ τεκμήριον`. An absent term fails closed; an ambiguous one
  resolves only if every one of its occurrences lands on the same voice.
- Claim ownership and stance-event actors are joined separately. **194 stance
  events are joined; 130 resolve to one actor and 64 are `cross_voice`.** Joined
  is not resolved — a cross-voice row names no actor. A claim challenged by
  another speaker keeps its owner.
- The `{sN}` markers in `raw/plato/greek/symposium.txt` are the only such markers
  in the corpus (16, symposium-only). They mark sections, not speakers: `{s9}`
  opens mid-speech, five open narration interludes, and none marks the speaker
  alternations inside 199c-201c or 212c-215a. They are not used as attribution
  evidence anywhere, and the voice attribution inventory's `unit_inventory` must not treat them as a
  mechanical segmentation.

## Ontology

- The six-family pass reduced all-record labels from 3,658 to 3,602 and
  singleton labels from 2,900 to 2,837 across the unchanged 7,470
  observations. Accepted-only labels moved from 3,617 to 3,561 and accepted
  singletons from 2,878 to 2,815 across the unchanged 7,332 accepted records.
- The pass merged 56 source labels into 30 existing targets and changed label
  fields on 58 accepted observation records. It created no label, changed no
  family, and changed no observation prose or source anchor. The full decision
  evidence is recorded in
  `wiki/review/2026-08-17-six-family-label-normalization.md`.
- Accepted non-singleton observation share increased from 60.7% to 61.6%; the
  accepted cross-dialogue observation share increased from 49.8% to 50.6%.
- Disposition coverage moved from 1,498 covered and 2,160 uncovered labels to
  2,333 covered and 1,269 uncovered. Covered singletons moved from 960 to
  1,648, leaving 1,189 uncovered instead of 1,940.
- The remaining uncovered-singleton tail begins with `legislative_method`
  (39), `constitutional_design` (36), `perception_generation` (33),
  `teleological_structure` (32), and `education_law` (31). This pass proves
  review coverage, not that remaining singletons are duplicate-free; future
  work should reopen a named family only when new same-function evidence
  justifies it.
- Per-dialogue cross-dialogue-label participation is published in
  `wiki/label-quality.md`. Lowest accepted-observation shares are Laws 20.2%,
  Timaeus 21.3%, Cratylus 35.3%, Critias 44.4%, and Menexenus 45.6%.

## Coverage

- `wiki/coverage-gaps.md`, regenerated by `bun run harness coverage --write`,
  reports 27 dialogues and a 94.9% minimum accepted-character coverage.
- All dialogues have `gap_count: 0` under the report threshold.
- Coverage floor by dialogue:
  apology 100.0%; charmides 99.6%; cratylus 98.0%; critias 100.0%;
  crito 100.0%; euthydemus 100.0%; euthyphro 100.0%; gorgias 98.9%;
  greater-hippias 100.0%; ion 100.0%; laches 94.9%; laws 99.3%;
  lesser-hippias 95.3%; lysis 100.0%; menexenus 96.4%; meno 100.0%;
  parmenides 97.0%; phaedo 99.0%; phaedrus 98.5%; philebus 97.9%;
  protagoras 98.7%; republic 98.0%; sophist 96.3%; statesman 99.3%;
  symposium 100.0%; theaetetus 99.1%; timaeus 97.5%.

## Claims And Relations

- Claim ledgers exist for all 27 dialogues. `bun run validate` reports
  0 unreviewed claims.
- Claim totals from fenced YAML ledgers: 4,495 records; review statuses:
  accepted 4,190, rejected 287, needs_split 18. Final statuses:
  left_standing 4,039, posed_only 370, unresolved_challenge 48,
  refuted 23, revised 14, withdrawn 1.
- Relation ledgers exist for 25 scopes. Scopes without relation ledgers have
  no generated relation ledger output in v1.0. `bun run validate` reports
  0 unreviewed relations.
- Relation totals from fenced YAML ledgers: 2,080 records; review statuses:
  accepted 1,902, rejected 156, needs_split 22. Kinds:
  tension 1,101, restatement 773, revision 163, contradiction 43.
  Resolutions: standing 1,780, verbal_only 185, superseded 75,
  refuted_resolved 40.
- Relation candidate generation is intentionally bounded. Intra-dialogue
  pairs require accepted claims, an allowed claim-kind pair
  (`definition::definition`, `definition::thesis`, `method_rule::method_rule`,
  `thesis::definition`, `thesis::thesis`), and at least one shared normalized
  Greek term. Cross-dialogue pairs require accepted `definition` or `thesis`
  claims with `left_standing` or `revised` final status and at least one shared
  normalized Greek term. Source: `packages/harness/src/relations.ts`.
- This generator is discovery-only under ontology vNext. Exact surface-term
  overlap is neither necessary nor sufficient for a substantive semantic
  relation, and generated pairs do not define the canonical relation set.
  Candidate absence is not textual absence or counterevidence; candidate
  presence does not authorize an automatic accepted or rejected decision.

## Anchors And Tokens

- Token indexes cover 27 dialogues and 522,589 Greek tokens, reproduced by
  `bun run harness derive tokens`.
- Tokenization is conservative: contiguous Greek-letter spans with normalized
  surfaces and offsets. It is not lemmatization or morphological analysis.
- Anchor indexes cover 27 dialogues and 1,947 occurrences, reproduced by
  `bun run harness derive anchors`. The lexicon has 6 groups and 17 forms in
  `derived/plato/anchors/lexicon.toml`.
- Anchor detection is lexicon-bounded. Absence from the anchor report is not
  evidence that a concept is absent from Plato.

## Site And Repo-Only Artifacts

- `bun run harness site` writes 1,965 static site files. The refreshed site is
  57M by `du -sh site`.
- No generated page exceeds 2 MB. Largest page after regeneration:
  `site/registry.html`, 1,871,300 bytes.
- Token indexes, transcripts, scratch logs, and raw source files remain
  repo-only; the site renders the knowledge base views and stable links over
  accepted/generated records.

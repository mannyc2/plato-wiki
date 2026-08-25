# protagoras: register `ΘΥΡ.` for the doorkeeper at 314d

**Date**: 2026-08-01
**Plan**: 079 wave 1 (protagoras candidate)
**Authorization**: the operator ruling of 2026-08-01 that registering voice sigla
is authorised inside The corpus reported-turn completion campaign, with full provenance. This note is that provenance
for one entry.
**Artifact changed**: `derived/plato/voices/sigla.toml`, protagoras block only.
**Source**: `raw/plato/greek/protagoras.txt`, sha256
`f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b`.

## What is registered

One identifier, `ΘΥΡ.`, for the doorkeeper of Callias' house. Registration only:
per the superset contract in `docs/voices-protocol.md`, an entry in this registry
earns no attribution by itself, and the licensing evidence for every attribution
stays on the voice record.

## The licensing Greek, verbatim with offsets

```text
char 11146   ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
char 11331   ἔα, ἔφη, σοφισταί τινες· οὐ σχολὴ αὐτῷ·
char 11473   καὶ ὃς ἐγκεκλῃμένης τῆς θύρας ἀποκρινόμενος εἶπεν
char 11524   ὦ ἄνθρωποι, ἔφη, οὐκ ἀκηκόατε ὅτι οὐ σχολὴ αὐτῷ;
```

The full sentence, so the syntax can be checked rather than taken on trust:

```text
δοκεῖ οὖν μοι, ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν, κινδυνεύει δὲ {314d} διὰ
τὸ πλῆθος τῶν σοφιστῶν ἄχθεσθαι τοῖς φοιτῶσιν εἰς τὴν οἰκίαν· ἐπειδὴ γοῦν
ἐκρούσαμεν τὴν θύραν, ἀνοίξας καὶ ἰδὼν ἡμᾶς, ἔα, ἔφη, σοφισταί τινες· οὐ σχολὴ
αὐτῷ· … καὶ ἡμεῖς πάλιν ἐκρούομεν, καὶ ὃς ἐγκεκλῃμένης τῆς θύρας ἀποκρινόμενος
εἶπεν, ὦ ἄνθρωποι, ἔφη, οὐκ ἀκηκόατε ὅτι οὐ σχολὴ αὐτῷ;
```

## Checked against all three parts of "Case is not the test"

The `role_reporting_formula` amendment of 2026-07-29 states three requirements.
Each was checked against the bytes, not inferred from the shape of the phrase.

1. **Grammatical subject of the reporting construction.** `ὁ θυρωρός` is
   nominative and is the subject of the finite `κατήκουεν` and of the participles
   `ἀνοίξας καὶ ἰδὼν` that govern the `ἔφη` at 11331. The trap the amendment names
   — an accusative that is the *object* of the governing verb, as `τὸν Σωκράτη` is
   the object of `ὁρᾶν` at Symposium 213b — does not arise: the only object here
   is the genitive `ἡμῶν` after `κατήκουεν`.
2. **Denotes one specific individual by role.** Every verb and participle the
   phrase governs is third person singular: `κατήκουεν`, `ἀνοίξας`, `ἰδών`, `ἔφη`,
   `ἐπήραξεν` (11436), `εἶπεν` (11521). The indefinite `τις` in `εὐνοῦχός τις`
   does not disqualify it — the amendment says outright that Greek introduces a
   first-mentioned individual that way. `ὦ ἄνθρωποι` at 11524 is his vocative to
   Socrates and Hippocrates, an addressee, not a plural subject; it is not a
   collective owner of the kind the `φάναι δὴ πάντας` clause excludes. The strings
   `θυρωρ-` and `εὐνοῦχ-` each occur exactly once in the whole source, so there is
   no second holder of the office to confuse him with.
3. **Registered siglum for that dialogue.** That is what this entry supplies. It
   remains never a `named_reporting_formula`: the source prints no proper name for
   him anywhere.

## `ΘΥΡ.` is already used for phaedo, for a different man

`ΘΥΡ.` is registered in the phaedo block for `ὁ θυρωρός` at Phaedo 59e, subject of
`εἶπεν`. Protagoras' `ὁ θυρωρός, εὐνοῦχός τις` at 314d is **a different individual
in a different house**, and nothing in this registration says or implies otherwise.

Sigla are scoped per dialogue block, so there is no mechanical collision, and the
form is reused because the *office* is the same — the same practice by which `ΣΩ.`
and `ΚΡ.` recur across blocks for the same persons. What is not permitted is
reading a cross-dialogue identity into the shared form, or reusing `ΘΥΡ.` inside
protagoras for a second servant. The man who finally opens the door at 11759
(`μόγις οὖν ποτε ἡμῖν ἅνθρωπος ἀνέῳξεν τὴν θύραν`) is this same doorkeeper, but
that clause is narrated action and not speech, so it licenses nothing and gets no
record.

This is the hazard the `ΠΑΙΣ.` entry in the symposium block records for the
symmetric case, where a form collides with a *printed* siglum for a different
person; the care taken there is the care taken here.

## Why the registry needed the entry

Two utterances at 314d are bounded direct speech transmitted below the printed
`ΣΩ.` siglum, so `docs/voices-protocol.md` requires a record for both: the words
must not be left silently with the printed turn speaker. Their owner is not in
doubt in the Greek — the text names him by his office — but the registry had no
identifier for him.

That produced a state the contract cannot express. An unresolved record needs at
least **two** locally plausible **registered** candidate owners; here the Greek
names exactly one speaker and the registry could express none, so any two-element
candidate set would have asserted a local plausibility the text denies. Before
this entry the two records carried no candidate set at all and said so in their
reasons. With `ΘΥΡ.` registered they are ordinary resolved records and the
protagoras cohort has no record without a candidate set.

## The two attributions this licenses

Both are on the voice records, not on this file, and both are byte-verified.

1. `voice` span `[11331, 11370)` — `ἔα, ἔφη, σοφισταί τινες· οὐ σχολὴ αὐτῷ·`.
   Evidence kind **`role_reporting_formula`**, citing `ὁ θυρωρός, εὐνοῦχός τις,
   κατήκουεν ἡμῶν` at 11146. `ὁ θυρωρός` is the nominative subject of `κατήκουεν`
   and of the participles `ἀνοίξας καὶ ἰδὼν` that govern this `ἔφη`, so it is the
   grammatical subject of the reporting construction, which is the test the
   2026-07-29 amendment states. The source prints no proper name here, which is
   exactly why the kind is not `named_reporting_formula`. The formula stands 161
   characters before the span, inside the 600-character introducing bound.

   This is the same construction, and the same office, that Phaedo 59e already
   carries `ΘΥΡ.` for: `ἐξελθὼν ὁ θυρωρός … εἶπεν` is the worked example printed
   in the `role_reporting_formula` row of the protocol.

2. `voice` span `[11524, 11572)` — `ὦ ἄνθρωποι, ἔφη, οὐκ ἀκηκόατε ὅτι οὐ σχολὴ
   αὐτῷ;`. Evidence kind **`anaphoric_reporting_formula`**, citing `καὶ ὃς
   ἐγκεκλῃμένης τῆς θύρας ἀποκρινόμενος εἶπεν` at 11473 with the antecedent `ὁ
   θυρωρός, εὐνοῦχός τις` at 11146 cited by bytes, which precedes the formula as
   the protocol requires.

   **This is not previous-speaker carry-forward.** The 2026-07-25 ruling rejects
   citing the named subject of the immediately preceding reporting formula as an
   antecedent *inside a bounded two-party exchange*, because a two-party bound
   narrows the referents without establishing ownership. Nothing of that shape
   applies here. The reference is fixed by morphology: the only other noun phrase
   in the sentence is `ἡμεῖς`, first person plural, and `ὅς` is masculine
   singular, so the pronoun has exactly one possible antecedent whoever spoke
   last. No alternation, adjacency, or turn-taking reasoning is used.

## What was deliberately NOT registered

- **Epimetheus, Hermes and Zeus** inside Protagoras' myth (320d-322d). No record
  in this cohort needs them: the myth is one continuous held-floor speech by
  Protagoras and the quoted lines sit inside it, which is the Phaedo 94d row —
  the citing speaker keeps the floor.
- **`οἱ ἄνθρωποι` and the `ὑβριστής`** of Socrates' staged interrogation
  (353c-357e). These are collectives and an indefinite hypothetical questioner.
  Registering either would invent a speaker the Greek does not single out, which
  the `οἱ σοφοί φασιν` row forbids outright.
- **Homer, Simonides, Pittacus.** Every occurrence is verse cited inside the
  citing speaker's own argument. The census receipt reaches the same conclusion
  for `turn_protagoras_0052` and for the staged Pittacus/Simonides exchange of
  344a-346e.

## Scope of this note

It registers one identifier and records the Greek that licenses the two
attributions built on it. It changes no `review_status`, creates no join,
activates nothing in `derived/plato/voices/cutovers.toml`, and confers no
authority on any claim. The protagoras cohort remains entirely `unreviewed`.

## Verification

- `bun test scripts/voices-2026-07/build-protagoras-voice-ledger.test.ts` — 10 pass,
  including `the doorkeeper's two utterances are resolved, not parked as unresolved`
  and `every chain names registered sigla and opens on the printed turn speaker`.
- `validateVoicesLedger` over `wiki/voices/protagoras.md` — 0 issues.
- `bun run validate` — exit 0.

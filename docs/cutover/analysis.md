# Rebuild idea classification and analytics from the observation layer

Status: proposed implementation plan; no ontology, record, review status or recording has changed.
Priority P1; effort L; risk MEDIUM (a semantic change made with paid model calls). Planned at Plato
`8a5e4c2` on 2026-10-27. These operator planning documents stay private: add `docs/cutover/` to
`exclude` in `release/public-files.toml` in the same commit that first tracks it
([platform P0](platform-and-audio.md#p0--before-these-plans-are-committed)).

On 2026-09-07 the user ratified the [ontology v2 target](../ontology-v2-target.md). It replaces the
tag-list ontology with authored comparison questions and closed answer classes, and classifies every
accepted observation against the whole catalog in one multi-label pass. Its phase 0 landed in
`7e59c0e`: the CMP-ONTOLOGY gates now hold `knowledge-base` and `audio-edition` at INCOMPLETE. Its
phases 1–6 never ran. The cutover index then listed "new philosophical classifications" and
"Decisions API integration" as out of scope, which in effect deferred the target.

On 2026-10-27 the user ended that deferral and asked to rebuild data processing from the lowest
useful layer. This lane executes the ratified target with amendments and adds reader analytics:

- **A1:** the membership pass uses the Decisions API rather than 27 manual agent jobs;
- **A2:** classifier memberships carry typed evidence;
- **A3:** every idea gets consumer copy;
- **A4:** voice records change in the same cutover (approved with DEC-19, 2026-10-27).

The target's admission rules, gates O1–O4 and C1–C6, tooling T1–T3, fixed phase order and four
signed decisions stand unless an amendment below says otherwise. Every paid call waits for DEC-17:
its agent-session forecast before AN1, its Decisions budget before AN4.

Before implementation, run `git diff --stat 8a5e4c2..HEAD -- wiki raw/plato derived/plato packages/harness docs SPEC.md AGENTS.md`
and `git status --short`, and recompute the counts below if the corpus has changed. Every
`bun run harness analysis …` command and every file under `packages/classifier/` is **proposed**;
implement it before claiming a run.

## Evidence

All counts were recomputed on 2026-10-27 from the ledgers at `8a5e4c2`, the v2.0.0 commit
`8a13190` and the accepted audit package under `wiki/ontology-audits/`. An independent reviewer
checked them, and its corrections are applied here.

### How the classification was built

1. **Feature-driven extraction.** Agents read the Greek and recorded one neutral fact per
   observation. They tagged each fact with a `feature_family` and a free-form `feature_label`.
   Eleven seed families had real definitions
   (`8a13190:docs/plato-wiki-extraction-protocol.md`, lines 63–87); anything else became a new
   passthrough family.
2. **Label normalization, July and August.** Bottom-up passes merged labels within families
   ([August decision](../feature-normalization-decision-2026-08.md),
   [July memo](../label-convergence-memo-2026-07.md)). The target measured that they moved the
   singleton label count only from 2,900 to 2,837.
3. **The v2.0.0 knowledge base (`8a13190`, 2026-08-26).** It held 7,470 observations, 7,332 of them
   accepted.
   - The accepted records use 504 families and 3,561 distinct family/label pairs.
   - The 11 seed families hold 5,943 of them (81%).
   - 2,815 of the pairs (79%) occur only once. Across all 7,470 records the count is the target's
     2,837.
4. **Ontology vNext hard cut and full audit (`49249b0`, 2026-09-01).** Families became axes and
   labels became concepts. The concept audit carried the surviving assignments over, keeping 6,805
   and moving 19. A typical `assignment_basis` reads "matches the registry semantic pair; keep that
   assignment". The audit added 5,468 observations: 1,257 children of 163 split records and 4,211
   repairs of source omissions. It also rejected 343 records and retired the feature fields.

### What is wrong with the classification layer

The ratified target's measurements, re-checked:

- **The ideas are the old labels under new names.** There are 483 axes, 3,557 concepts and 7,644
  memberships, exactly one per classified observation.
  - Concepts: 2,667 have one membership, 144 have none and 39 have 20 or more.
  - Axes: 427 have five memberships or fewer, and 294 have a single concept.
- **No idea has a description.** All concept definitions follow 2 templates and all axis questions
  follow 6. "Definition proposed" (`definition_ladder/definition_proposed`, 112 memberships) is
  defined as "A source-bound definition ladder concept for observations whose cited text explicitly
  records definition proposed …".
- **The same idea sits under several axes.** Examples are `assent_chain` under `elenchus` (133) and
  `turn_geometry` (6), and `aporia_reported` under three axes. In all, 64 keys repeat across axes.
- **38% of accepted observations belong to no idea.** 4,648 of the 12,292 have no membership.
  - Of the 4,211 omission repairs, only 15 received one.
  - Of the 820 audit additions that have memberships, 805 are split children that inherited their
    parent's.
- **A model labelled mechanical patterns.** `turn_geometry` (974 accepted feature-era observations,
  381 of them `explicit_procedure_control`) and `frame_depth` describe structure that the turn
  index, the assent lexicon and the voice chains can measure deterministically.

### What held up

- **The observations.** On the 7,470 baseline IDs the audit changed `greek_terms` on about 1,460
  records (1,461–1,466, depending on the parser) and `review_status` on 508. It changed no
  `observation` or `english_gloss`. It edited `limits` on 4 records and `textual_basis` on 2, to
  remove references to other records and copied Greek; the other textual differences are YAML
  formatting. Accepted observations cover 99.5% of the Greek characters, which needs the audit's
  4,211 omission repairs.
- **Most of the audit's removals.** Of the 508 baseline records it removed from readers:
  - 163 were split into atomic children and 2 were merged as duplicates.
  - 257 were rejected, 256 of them under the existing no-interpretation rule; 243 involve irony
    readings. The other, `obs_crito_0013`, records a merge into an empty target.
  - 86 were rejected fail-closed instead of receiving the action their finding proposed. That was
    revision alone for 39, retyping for 26, a duplicate merge for 8, and a combination including a
    split or retype for 13. For example, `obs_euthyphro_0002` was rejected for rendering τετανότριχα
    as "straight hair".
- **Voice attribution, in part.** 3,730 accepted voice records carry an ordered `voice_chain`.
  - Chain lengths: 1,655 have length 1, 1,701 length 2, 281 length 3 and 93 length 4.
  - The `depth` field also counts unresolved inner voices, giving 260 / 3,061 / 176 / 233. An
    unresolved record keeps its known outer members and leaves out the unknown inner voice.
  - 1,570 records are `unresolved`.
  - The Parmenides frame is ΚΕΦ. › ΑΝΤΙΦ. › ΠΥΘ.; the Symposium reaches ΑΠΟΛ. › ΑΡΙΣΤΟΔ. › ΑΡΙΣΤΟΦ. › ΖΕΥΣ.
- **Deterministic indexes.** `derived/plato/turns/` gives each turn's speaker, offsets and Greek
  letter count. `derived/plato/tokens/` and `derived/plato/metrics/{assent,procedure,turn-lengths}/`
  give word and lexicon measures.

## Where the rebuild starts

| Layer | Disposition | Reason |
| --- | --- | --- |
| Greek sources, Stephanus spine, tokens, turns, sigla and metrics | Keep | Deterministic and verified |
| All 12,938 observations from both extraction eras, with their status history | Keep as the base | The facts held up; complete coverage needs both eras. The ratified target forbids status changes; DEC-18 may re-review the 86 fail-closed and the irony rejections later |
| Voices and reported-turn scopes | Keep; under A4, DEC-19 extends them for seven dialogues | They encode the frames, but 1,570 records are unresolved |
| Frames, persons and the assent lexicon | AN1 drafts a frames table, a person map and a lexicon extension; AN6 commits them | The analytics need them. The two new tables need an owner in the audit package, which only AN6 can give, and all three land with one receipt |
| Feature-era family and label tags | Read from `8a13190` in scratch as authoring and calibration evidence only | Retired fields; never written to live records or reader projections ([SPEC](../../SPEC.md)) |
| Axes, concepts and memberships, with clusters, dossiers and `wiki/ontology-quality.md` regenerated from them | Rebuild under the ratified target (AN2–AN6) | See the evidence above |
| Claims, relations and commentary prose | Unchanged, apart from the 272 commentary dossier citations, which C2 remaps | Out of the target's scope; DEC-18 covers claims and relations |
| Recordings and speaker attributions | Unchanged | AN6 regenerates screenplays whose commentary inputs change |

This is the lowest useful layer that needs no new observation extraction. Re-extracting from the
Greek would repeat work whose observation prose survived an independent full-corpus audit
unchanged.

## What the audit freeze allows before the cutover

The accepted audit package fixes a digest over every file under `raw/plato/greek` and eleven `wiki/`
directories, `wiki/review/` among them, plus five named files (`canonicalInputPaths` in
`packages/harness/src/wiki/ontology-audit.ts`). `bun run validate` re-observes the working tree,
uncommitted files included, and fails on any difference (`validate.ts`, lines 705–708). Every file
under `derived/plato/` must also belong to a known generator, so a path that no generator owns, such
as `structure/`, fails as well.
Only one package can be accepted at a time.

Until AN6, therefore:

- receipts, adjudications and the run record stay in gitignored `scratch/`;
- the user's decisions are recorded under DEC-16 in the [decision register](README.md#decision-register),
  with their evidence;
- AN1's frames table, person map and lexicon extension stay in scratch;
- code may land: T1, T3, the analytics projections and the classifier adapter.

AN6 commits all of it with the C1 receipt and the C4 package. The phase-0 job briefs, which put the
phase-1 receipt under `wiki/review/` (`jobs.ts`, line 222; `wiki/ontology-quality.ts`, line 310),
would fail validation the same way, so AN3 corrects them.

## Amendments to the ratified target

DEC-16 approves A1–A3; DEC-19 approves A4.

### Taxonomy

The ratified fields stand: axis key, dimension and authored question; concept key of at most four
tokens with an authored `definition`, unique within its axis. A3 adds consumer copy, which the user
approves before classification:

- **Axis:** a sentence-case `title` and a short reader question.
- **Concept:** a sentence-case `title`, unique across the corpus, and a `summary` of one plain
  sentence (at most 25 words).

The authored `definition` remains the decision rule that the classifier and the labellers apply. The
target's admission rules still govern:

- at least three answer classes per axis and at least three dialogues;
- a split review above twelve classes;
- at least two members per concept at cutover;
- the eleven spine keys retained where their question survives.

`turn_geometry` and `frame_depth` keep their keys only if a non-mechanical question survives. Their
mechanical content moves to the analytics below.

### Classification with the Decisions API (A1)

The [Decisions guide](https://developers.openai.com/api/docs/guides/decisions), read on 2026-10-27,
describes a generally available API:

- `POST /v1/decisions` takes the model `gpt-6-luna` and 1–400 questions per request.
- Question types are `predicate` (a probability), `choice` (one value with probabilities) and `score`.
- Uncached input costs $0.10 per million tokens, and output is free.
- Thresholds come from labelled examples. Calibration, rate limits, batch support and whether
  question text is billed are not documented; AN4 measures them.

Each request classifies one accepted observation against the whole frozen catalog:

- **Input.** Per T3, one user message with `input_json` holding the observation's `observation`,
  `greek_terms`, `stephanus_span` and `limits`. No Greek source text and no English translation is
  included.
- **Questions.** One `predicate` per concept, posed from its definition. A catalog above 400 concepts
  splits into two requests.
- **Storage.** All probabilities are kept outside the repository in gitignored `scratch/`, keyed by
  a digest of the request. Unchanged inputs are never paid for twice on this host, and losing the
  store costs at most one pass. Thresholds can be retuned without new calls, and a revised axis
  reruns only its own questions.
- **Results.** Each concept at or above its threshold becomes a membership. An observation with none
  receives a `no_axis_applies` disposition, per the target's signed decision. A refusal yields
  neither and goes to agent review.
- **Calibration set.** Two independent agents label it against the catalog from the observation
  text, and the integrating agent adjudicates. AN3 builds the first stage: a random sample of about
  600 records, stratified by dialogue and era, plus the candidate observations named in phase 1. AN4
  adds, from its candidate pass over every accepted observation, each concept's highest-probability
  records not yet labelled, until each concept has 15 adjudicated positives or is shown to be rare.
- **Thresholds.** A concept's threshold is the lowest whose precision on that set is at least 0.9
  (proposed). A concept with fewer than 15 positives uses its axis's pooled threshold. The O4 sample
  stays disjoint from the calibration set, so the recall it measures is honest.

### Membership evidence (A2)

The target requires each `assignment_basis` to name the textual feature that places the observation
in the class, but a Decisions answer contains no text. A2 therefore gives each membership an
evidence type, and O3's lint checks each type:

- **classifier:** the accepted run's ID and a probability at or above the concept's threshold. The
  observation's own `greek_terms` and `textual_basis` carry the textual warrant, and O4 measures
  correctness.
- **adjudicated:** a reference to the C1 receipt and the named textual feature the target requires.
  This covers O4 additions, resolved refusals, concepts proposed after the run, and reassignments
  during pruning.

Each concept row carries its threshold. The accepted run's record (model, catalog and question-set
digests, input digest, thresholds, calibration and O4 metrics, usage) is a fenced YAML block in the
C1 receipt, so `dispositions.jsonl` stays the one new canonical file that signed decision 2 allows. A
disposition the classifier produced names the run in its `basis`.

The alternative to typed classifier evidence is a named term: one further `choice` per accepted
membership over the observation's `greek_terms`, with the fallback values "speaker act" and
"stated provision". It costs under $1 and still writes no prose. The user chooses under DEC-16.

### Voice changes (A4, approved under DEC-19)

The target leaves voices out of scope, and its C4 package binds v2 to "the same source and record
partitions". The user approved DEC-19 on 2026-10-27, so AN6 also lands the voice changes, and the C4
package binds the changed voice partition. Until AN6 the changed ledgers, any new voice sigla and the
receipt stay in ignored scratch, validated there with `validateVoicesLedger` against their canonical
paths, because the audit freeze holds `wiki/voices/` and `wiki/review/`.

### Cost

About 250 input tokens per observation, plus roughly 10,000 for 150–300 described predicates, comes
to about 127 million tokens: about $13 per full pass over 12,292 observations, if question text is
billed. Decisions calls for the lane as a whole cost about $35:

- calibration calls on about 1,000 records across both stages;
- AN4's candidate pass over every accepted observation, whose stored answers AN5 reuses for unchanged
  questions;
- a partial rerun for catalog changes.

DEC-17 must also forecast the agent sessions:

- AN1's table drafting and independent checks;
- AN2's catalog authoring and crosswalk, and their independent overlap review;
- AN4's gap review;
- double labelling of the calibration set;
- the O4 pass and its adjudication;
- refusal reviews;
- DEC-19's voice review, approved: about 9–10 million tokens over about 50 curation and review
  sessions, each measured at 160–195 thousand;
- C2's commentary audit samples, which are Codex sessions under the commentary protocol.

DEC-17 approves the agent-session forecast before AN1 and the Decisions budget before AN4.

No `OPENAI_API_KEY` is configured on this host.

## Analytics

Each analytic is a deterministic, rebuildable projection over accepted records, apart from the ideas'
own memberships. The names are the ones the design session uses in its version 7 work; the
[design system](design-system.md) owns their copy.

| Name | Definition | Source | Data |
| --- | --- | --- | --- |
| How it's told | The frame type from the frames table: performed, narrated or a speech. For a narrated dialogue: the chain of tellers from the outer narrator to the speaking voice, retellings as the number of tellers before that voice, the share of text at each depth, and the deepest resolved chain. Parmenides: three retellings, ΚΕΦ. › ΑΝΤΙΦ. › ΠΥΘ. › the speakers. Symposium dinner: two, ΑΠΟΛ. › ΑΡΙΣΤΟΔ. › the speakers, with Diotima one deeper inside Socrates' speech | Frames table and resolved voice chains | Chains exist; the frame type needs AN1's table |
| Who speaks | Each speaker's share of the dialogue's Greek letters, the unit the turn index counts. A letter counts for the innermost resolved voice of depth 2 or more, otherwise the turn's speaker. A resolved depth-1 voice names an unlabelled turn's owner. Letters in an unresolved voice count for the innermost resolved speaker above them, shown as quoted by that speaker, when that speaker sits at or below the scene's level (DEC-19): the Crito's objector at 48a is quoted by Socrates, and a quotation inside the Laws' speech would be quoted by the Laws. Letters whose scene-level speaker is unknown form a separate "not yet attributed" share. Letters that no speaker owns, such as the titles that open the Phaedrus and the Statesman, are excluded. Shown when at most 10% is not yet attributed and, in a narrated dialogue, when voices of depth 2 or more cover at least half of the narration the frames table records (both proposed) | Turns, voices and frames table | 20 dialogues; see below |
| Role in the dialogue | Computed over the scene, which the frames table separates from its frames: outer frame conversations and the narrator's own narration. Each scene letter counts for the member of its voice chain at the scene's level, so a speech recited, reported or quoted in the scene counts for whoever delivers it there, however deeply nested. The table marks a live speaker printed inside another's turn, such as Meletus answering in the Apology, as a scene voice. Shares are of all scene letters, unattributed ones included. *narrates*: tells or transmits the story at any level of the frame. *hears the story*: speaks only in a frame. *leads*: the largest share, at least 25%. *takes part*: at least 5%. *mostly listens*: under 5%. *absent*: in the cast with no speech. A narrator who leads shows both. Shown when at most 10% of the scene lacks a known speaker at its level and the coverage rule above holds. All thresholds are proposed | Turns, voices, frames table and person map | 22 dialogues; see below |
| Pace and agreement | Pace: turn-length distribution, long speeches and questions per turn; AN1 adds the question count from the ASCII semicolons that the Greek sources use as question marks. Agreement: runs of short assent replies, which replace the model label "assent chain". Today's `assent_concession` group has three forms (ναί, πάνυ γε, ὁμολογεῖς) and finds assent in only 2 of the Crito's more than 30 replies of six words or fewer | Turns, tokens and assent lexicon | Turn lengths exist; questions and agreement need AN1 |
| Ideas in this dialogue, and where | Passages per idea and their positions along the Stephanus range. An idea is listed for readers when it has at least five passages in at least two dialogues (proposed) | Memberships | Needs AN5 |
| Often found with | For idea A, the ideas B sharing at least 3 passages in at least 2 dialogues, ranked by lift (P(B given A) / P(B)) so the largest ideas do not always win. Today 41 pairs qualify, 30 of them through `turn_geometry` concepts (24 through `explicit_procedure_control`), mechanical labels that AN1's analytics replace | Memberships | Needs AN5 |
| A person across dialogues | Dialogues, share, role in each and the ideas found in their speech, keyed by the person map. A count across dialogues covers only dialogues whose figures verify and says how many it leaves out | All of the above | Needs AN5 and the person map; DEC-19 extends it |

A passage is one distinct source span: one source path with one start and one end offset. The 12,292
accepted observations sit on 7,550 distinct spans, and 2,998 spans carry more than one observation.
Counting observations would therefore inflate idea counts, as today's dossiers do:
`wiki/dossiers/dramatic_case_setup/prison_execution_frame.json` lists 14 observations on 7 spans.

The turn index cannot supply speakers inside a narration. In the Republic and the Parmenides the
narration is a single unlabelled turn, and in the Symposium a single ΑΠΟΛ. turn of 80,598 Greek
letters. Structure cannot identify a narration either: the Apology is one unlabelled turn but a
speech, while the Phaedo, Symposium, Protagoras and Euthydemus narrations sit inside labelled turns.
Only a table can separate the Theaetetus' opening frame (142a–143c), whose Euclides and Terpsion
turns look like any other. The frames table therefore records each dialogue's type, frames and scene
explicitly.

The figures below use interim frame types until the table exists. The Republic, Charmides, Lysis,
Protagoras, Euthydemus and Phaedo are narrated with the scene at level 2, the Symposium at 3 and the
Parmenides at 4; every other dialogue is performed, with the scene at level 1.

Who speaks is credible now for 20 dialogues: Apology, Cratylus, Critias, Crito, Euthyphro, Gorgias,
Ion, Laches, Laws, Lesser Hippias, Menexenus, Meno, Phaedo, Philebus, Protagoras, Sophist,
Statesman, Symposium, Theaetetus and Timaeus. In Greek letters, for example:

- Euthyphro: ΣΩ. 74.5%, ΕΥΘ. 25.5%.
- Crito: ΣΩ. 40.4%, ΝΟΜ. 37.2%, ΚΡ. 22.0%, with 0.3% not yet attributed.
- Symposium: ΔΙΟ. 17.8%, ΑΛΚ. 16.4%, ΣΩ. 13.7%.
- Menexenus: ΑΣΠ. 68.7%, ΠΑΤ. 14.2%, ΣΩ. 12.7%.

Protagoras (9.0% not yet attributed) and Theaetetus (5.0%) qualify and show that share; Theaetetus
sits too close to a 5% cut for one to be safe. Seven dialogues are not ready:

| Dialogue | Why not |
| --- | --- |
| Republic | No inner voice records after 354c; inner voices cover 10% of the text |
| Parmenides | 86% not yet attributed |
| Lysis | 60% |
| Charmides | 44% |
| Phaedrus | 17% |
| Euthydemus | 15% |
| Greater Hippias | 13% |

The audio speaker attributions cannot fill the gap, because they follow
`reported-speech-inherits-active-character-v1` and give the Republic wholly to Socrates. Phaedrus and
Greater Hippias are performed dialogues whose unresolved voices are quotations. Under DEC-19, Who
speaks shows them as quoted by their speaker, which makes both ready: the Phaedrus at ΣΩ. 80.6%
(10.0 points quoted) and ΦΑΙ. 19.4% (7.0 points reading Lysias), and the Greater Hippias at ΣΩ. 74.3%
(13.3 points quoted) and ΙΠ. 25.7%. If the voice review registers Lysias or Theuth, as Diotima is
registered, their words move to their own shares.

Role needs only the speaker at the scene's level. In a performed dialogue, labelled turns already
give it; in a narrated one it comes from the voice records, which is why four narrated dialogues
fail. Role is therefore ready for 22 dialogues: the 20 above, plus Phaedrus (ΣΩ. 80.6%, ΦΑΙ. 19.4%) and Greater Hippias
(ΣΩ. 74.3%, ΙΠ. 25.7%), whose unresolved voices sit inside known speakers' turns. For example:

- **Symposium.** The dinner is 90.2% of the letters. Socrates holds 33.9% of it and leads, because
  Diotima's words reach the dinner through his speech; Who speaks still shows ΔΙΟ. 17.8%.
- **Menexenus.** Socrates holds 95.7% and leads, because he delivers Aspasia's speech and the
  fathers' address inside it.
- **Crito.** Socrates holds 78.0%, the Laws included.
- **Protagoras.** ΣΩ. 56.7% and ΠΡΩΤ. 28.9%, with 7.7% of the scene not yet attributed.
- **Apology.** Socrates holds about 99.3% and Meletus 0.7%, once the table marks Meletus' 18 answers
  as scene voices.
- **Theaetetus.** Until the table marks the opening frame, Euclides and Terpsion show as mostly
  listening.

Role is not ready for the Parmenides, Lysis, Charmides and Euthydemus, where 89.2%, 67.3%, 46.6% and
20.8% of the scene lacks a known speaker. Nor is it ready for the Republic, which fails the coverage
rule and leaves 35.0% of its small scene unknown. The design session reproduced these Role figures independently.

## Ordered implementation

Each step names the target phase it carries out. AN0 and AN2 write no repository code. AN1's
projections may land in `packages/harness/src/derived/` beside the existing metrics and move with the
harness. AN3's T1 and T3 extend the harness, as ratified. The classifier adapter is new effectful
code: it lands in `packages/classifier/` on platform P1's pins, so P1's pin-and-boundary step
precedes it if it has not already landed. The AGENTS.md amendment under
[Governance changes](#governance-changes) lands before AN3 merges the adapter.

### AN0. Assemble the fact base in scratch

Feeds phases 1 and 3. Export to gitignored `scratch/` every observation with:

- its exact Greek slice, verified against `text_sha256`;
- its era;
- its feature-era family and label from `8a13190`, inherited by split children through the split
  adjudications' replacement targets;
- its status then and now, and the audit adjudication's action and defect classes.

Then add per-family label inventories with counts, dialogues and one example each. This is scratch
evidence, not a repository artifact.

**Verify:** the export holds 12,938 records: 7,470 baseline, 1,257 split children and 4,211 omission
repairs, with zero hash mismatches. Two runs are byte-identical.

### AN1. Build the deterministic analytics

Draft three inputs in scratch:

- **The frames table** that BACKLOG's Frame Skeleton proposes, for
  `derived/plato/structure/frames.toml`. It records each dialogue's frame type, its frame spans (outer
  frame conversations and narration) with the teller at each level, and the scene's level. It also
  lists live speakers printed inside another speaker's turn; the resolved voices show one case,
  Meletus' 18 answers in the Apology.
- **A person map** for `derived/plato/structure/persons.toml`. It maps each dialogue's Greek sigla and
  voice names to persons and lists each dialogue's cast. It is keyed by the character IDs in
  `audio/characters.json`, which the audio edition already resolves across dialogues. Sigla collide
  across dialogues: ΚΡ. is Crito, Cratylus or Critias. Voices with no character ID, such as ΘΕΤ.,
  ΠΑΛΔ. and ΑΘΔΙΚ. in the Apology, get new person keys, and audio-only roles such as the commentary
  narrator stay out of every cast.
- **An extension of the `assent_concession` group** in `derived/plato/anchors/lexicon.toml`. It adds
  the reply formulas found in the Greek, such as πάνυ μὲν οὖν, πῶς γὰρ οὔ and ἀληθῆ λέγεις, and a
  polarity rule for negative replies such as οὐδαμῶς and οὐ δῆτα.

An agent drafts each from the Greek, and an independent agent checks it. A frame speaker who tells
or transmits the story narrates. Euclides therefore narrates in the Theaetetus, because the frame has
him write down the conversation that the slave then reads. All three inputs stay in scratch until AN6
commits them with one receipt.

Implement How it's told, Who speaks, Role in the dialogue, and Pace and agreement as build-time
projections, with fixtures and a per-turn count of question marks (ASCII semicolons in these sources). A dialogue hides each figure
whose readiness rule it fails. The site build reads the new tables only after AN6.

**Verify:**
- Fixtures reproduce the chain lengths and letter shares quoted above. Each ready dialogue's shares,
  including its unattributed share, sum to 100%.
- Before DEC-19's voice changes land, the readiness lists equal 22 dialogues for Who speaks (the 20,
  plus the Phaedrus and Greater Hippias under the quoted-by rule) and 22 for Role; after AN6 they are
  recomputed from the changed voices.
- On a labelled sample of short replies (proposed: 200 from six dialogues), the extended lexicon finds
  at least 90% of assent replies at a precision of at least 0.95 (both proposed).
- `bun run validate` still exits 0, because nothing under the audited paths changes.

### AN2. Author the catalog: target phase 1, plus A3

Author axes, questions, enumerated answer classes and definitions top-down under the admission rules.
Use the seed definitions, AN0's inventories and a per-dialogue sample of omission repairs as
evidence; no English rendering enters authoring. Draft the phase-1 receipt in scratch as the target
specifies, including the rejected candidates and an independent overlap review.

The receipt also carries a crosswalk from the feature era, so that no earlier idea is dropped unseen.
It has one row for each feature-era family/label pair with at least three accepted records in at
least two dialogues (321 pairs over 4,112 records at AN0), and one for each family with at least ten
accepted records that lives in only one or two dialogues (18 families, 436 records, such as the
Cratylus' etymologies and the Laws' legislation). Each row names the concept that covers it or the
reason it is dropped. The three-dialogue rule binds axes, not concepts, so one dialogue's material can
be a concept under an axis that compares several. Both thresholds are proposed. A scratch check
compares the crosswalk with AN0's inventory and fails on any pair or family it leaves out. The
independent overlap reviewer also checks the crosswalk.

Add titles and summaries, and publish the catalog as a rendered page, with the crosswalk's drops. The
user then ratifies the catalog count, as the target requires, and approves the consumer copy in the
same review. Record both under DEC-16 in the decision register, with the page URL and version. The
receipt commits in AN6.

**Verify:** normalized-question and definition uniqueness pass, and every axis lists at least three
classes. Any axis over twelve classes has a split review. The crosswalk check passes, and every drop
gives a reason. Count ratification and copy approval are recorded.

### AN3. Build the tooling and the calibration set: target phase 2, plus A1

Build T1 (the ontology stage/commit writer) and T3 (the bounded brief), as ratified. Correct the
ontology job briefs (`jobs.ts`, lines 216–260) and the instructions in `wiki/ontology-quality.ts`, so
that receipts stay in scratch until AN6 and the membership pass names the classifier.

Build the classifier adapter as an implementation of Effect's provider-neutral
`effect/ai/DecisionModel` service for OpenAI's `/v1/decisions`. The local Effect sources
(`.agent-sources/effect` at `66257d2`, read 2026-10-27) implement that service for OpenRouter's alpha
Decisions API, Cloudflare and TypeSafe, but not for OpenAI. The nearest model is
`packages/ai/openrouter/src/OpenRouterDecisionModel.ts` in those sources. If P1's pinned Effect
release lacks the service, keep the same port over a plain typed client. Around it, add:

- pure question builders and answer readers;
- a hard budget cap and concurrency of at most 4;
- answers stored by request digest, outside the repository;
- usage recorded per run.

Build the calibration set's first stage, described under A1, and adjudicate it.

**Verify:**
- T1's round-trip test passes, and T3's brief for `laws` renders all of its accepted observations and
  the full catalog.
- The adapter's builders and readers pass offline tests.
- The first stage's κ per axis is at least 0.6 (proposed). An axis below that has its definitions
  revised, and stops the lane after three revisions.

### AN4. Pilot the classifier

Requires DEC-17's Decisions budget and a key. Run the first stage, then the candidate pass over every
accepted observation. Add each concept's highest-probability records from that pass that are not yet
labelled, adjudicate them, and recheck κ. Measure actual tokens and cost,
latency, refusals, precision and recall per concept, and calibration. Set the thresholds. A scratch
script is acceptable.

Then review the catalog's gaps before AN5 classifies against it. The O4 pass cannot find them, because
its labeller works from the same catalog. The gap pool is every accepted observation for which no
concept reaches its threshold. From a stratified sample of it (proposed: 200, at least half of them
omission repairs, which carry no feature-era tag), an agent independent of the catalog's author gives
each record either the concept that fits or the comparison question the catalog lacks, citing the
record. A proposed question goes through phase 1's admission rules. An admitted change revises the
catalog, reruns only its own questions on the stored inputs, and enters the phase-1 receipt with every
declined proposal. Because the ratified count is a ceiling, the user ratifies the revised count.

**Verify:** recorded usage is within a factor of two of the forecast, or DEC-17 is revisited. κ per
axis stays at least 0.6. Thresholds and metrics are recorded for every concept. The gap pool's size
per dialogue is recorded, and every gap-review proposal is admitted or declined in the phase-1
receipt.

### AN5. Classify, check independently and prune: target phases 3–5, amended by A1 and A2

1. Classify every accepted observation against the frozen catalog, reusing AN4's stored answers for
   unchanged questions. Concepts proposed by labellers enter
   only inside an admitted axis with two named candidate members, as ratified.
2. Run the O4 independent pass: an agent classifies a stratified sample of max(600, 5%) accepted
   observations (615 today), disjoint from the calibration set. Adjudicate every disagreement.
3. Show the user recall and agreement from scratch. The user then sets the recall floor, recorded
   under DEC-16.
4. Prune concepts with fewer than two members and axes in fewer than three dialogues, as ratified.
5. Record the accepted run in scratch for the C1 receipt.

**Verify:** the staged result meets O1–O4. Every accepted observation has a membership or a
disposition, and every membership's evidence passes its type's check. Every dialogue's
memberships-per-observation ratio exceeds 1.0. Spend is within the DEC-17 cap.

### AN6. Cut over: target phase 6

Carry out C1–C6 in one change set:

- replace the three JSONL files and add `dispositions.jsonl`;
- delete `canonicalMembershipAssignmentBasis`, keeping the legacy-alias lint;
- remap all 272 commentary dossier citations (164 distinct, 21 ledgers, rejected blocks included);
- commit AN1's three inputs and the receipts staged in scratch, with DEC-19's voice changes under A4;
- update `wiki/ontology-audit.ts` so that the C4 package binds `derived/plato/structure/` as canonical
  inputs, exempt from generator ownership, and reads the v2 files, `dispositions.jsonl` included;
- regenerate metrics, clusters, dossiers, `wiki/ontology-quality.md` and the site;
- write the C1 receipt, with the O4 adjudications and the run record, and the new audit package
  (C4);
- make the C5 amendments.

Two more consequences are certain and are planned here:

- **Commentary audit samples.** Edited blocks need fresh samples under C2.
- **Screenplays.** Each screenplay hashes its whole commentary ledger and its commentary audit file
  (`audio-screenplay-generator.ts`, lines 672–673, compared at `audio-production.ts:1266–1280`).
  After C2's fresh samples, regenerate the screenplays of every dialogue whose commentary ledger or
  audit changed, with spoken text unchanged. The 27 draft recordings remain review candidates bound to
  their historical inputs.

Update the readers and validators that the cut touches, under `packages/harness/src/` unless stated:

- `clusters.ts`, `dossiers.ts`, `completeness.ts`, `jobs.ts`, `validate.ts`, `review-provenance.ts`
  and the `index.ts` exports;
- `site/data.ts`, `site/index.ts`, `site/layout.ts` and `site/curation.ts`;
- `wiki/observation-validator.ts`, `wiki/commentary-validator.ts`, `wiki/apparatus-validator.ts` and
  `wiki/ontology-quality.ts`;
- `wiki/ontology-vnext*.ts`, `wiki/ontology-concept-audit.ts`,
  `wiki/ontology-regeneration-tree.ts` and `wiki/semantic-remediation.ts`;
- `wiki/ontology-audit.ts`, `wiki/ontology-audit-finalization.ts` and
  `wiki/ontology-audit-final-adjustments.ts`;
- `packages/harness/test-support/ontology-vnext-fixture.ts`;
- the commentary brief, audit and campaign readers.

The vNext ontology must never become active in SQL, so AN6 precedes P4's final import. Data D2's
rehearsals load whichever ontology is canonical, into disposable targets only.

**Verify:** C1–C6 pass, including `bun run ci`, `bun run harness ontology-audit verify` against the
new package and two byte-stable regenerations. `wiki/completeness.md` reports `knowledge-base` READY
only because O1–O4 pass. CMP-AUDIO-SCREENPLAY passes after regeneration. No reader or projection
contains a vNext concept ID.

## Governance changes

- **AGENTS.md, before AN3 merges.** Its ban on model-session and provider-selection machinery would
  otherwise forbid the adapter. With DEC-16's approval, allow typed classification against a ratified
  catalog as the one model-run corpus operation in the repository, under these rules:
  - an operator-approved forecast and a single provider;
  - concurrency of at most 4, and answers reused by request digest from a store outside the
    repository;
  - thresholds from an adjudicated calibration set and an O4 independent pass;
  - one receipt per accepted run.

  The ban on model sessions, provider selection and retry queues stays for everything else.
- **C5, in AN6.** `docs/ontology-vnext.md` "Review and change control" and SPEC's Full-Corpus Audit
  Contract are amended so that ontology edits need a receipt, and only source-binding changes need an
  audit package.
- **`docs/ontology-vnext.md`, in AN6.** Its "Canonical model" gains dispositions, the consumer fields
  and A2's evidence types. Its "Invariants" accept typed evidence in place of a textual basis for
  classifier memberships.
- **SPEC's ontology contract, in AN6.** Add the consumer fields and A2's evidence types.
- **SPEC's dossier-citation contract (lines 136–140).** It still holds, because dossiers remain the
  concept projection.
- **Reader model calls.** DEC-20, which the design system, analysis and application share, has
  curated pages written ahead of time and reviewed; answers generated at reading time wait for their
  own budget approval. Either way, the analytics stay deterministic projections, and a curated block
  names an analytic without restating its numbers.

## Deletions

| Removed | Replacement | Delete when — proof required |
| --- | --- | --- |
| vNext axes, concepts and memberships in `wiki/ontology/` | The ratified catalog, memberships and dispositions at the same path | AN6; C1–C6 pass |
| `canonicalMembershipAssignmentBasis` and the scrubbed bases | A2's typed membership evidence | AN6 (C3) |
| vNext-targeted commentary dossier citations | Remapped citations to regenerated dossiers | AN6 (C2) |
| The vNext audit package as the live binding | The C4 package, which binds the v2 partitions, and under A4 the changed voice partition, to the same sources | AN6; `ontology-audit verify` passes |
| Model-written mechanical `turn_geometry` and `frame_depth` concepts | AN1's deterministic analytics | AN6 |

## Open decisions

[README.md](README.md#decision-register) owns each decision's status; this table gives this plan's
recommendation.

| ID | Decision | This plan's recommendation | Blocks |
| --- | --- | --- | --- |
| DEC-16 | Execute the ratified ontology target with amendments A1–A3 | Adopt A1 (Decisions API classification) and A3 (consumer copy). For A2, choose typed evidence (recommended) or a named term. The base is sources, deterministic indexes, voices and all 12,938 observations. Approving it also approves the AGENTS.md amendment | AN2 onward; P4's final import |
| DEC-17 | Paid work: budget, key and approval | Two approvals. Before AN1: the forecast for the agent sessions listed under Cost. Before AN4: about $35 for Decisions calls with a $60 cap, and a key the user provisions | AN1 onward |
| DEC-18 | Second phase: claims, relations and rejected observations | Decide after AN5. If quality supports it, re-derive "Two views" relations by typed classification of candidate claim pairs, and re-review the 86 fail-closed and the irony rejections | Nothing in activation |
| DEC-19 | Close the speaker gap in seven dialogues | Decided 2026-10-27 by the user, as recommended: resolve unresolved voices, and add the Republic's missing inner voice records, from the Greek with an agent review and receipt; A4 lands the changes in AN6's change set under the C4 package; Who speaks shows unowned quotations as quoted by their speaker. Until AN6, Who speaks stays hidden in the five narrated dialogues and Role in the same five | Who speaks in seven dialogues; Role in five |

## STOP conditions and completion evidence

Stop and report on any of these:

- a paid call without DEC-17 approval, or spend reaching its cap;
- Greek source text or an English translation in classifier input, or an English rendering in
  catalog authoring or a labeller's input;
- an observation's prose or status changed by this lane;
- a file added or changed under the audited paths before AN6;
- an axis below the agreement gate after three revisions;
- a mixed vNext and v2 ontology in any reader;
- any C1–C6 failure, including screenplay or commentary-sample gaps.

Completion is reported as corpus delta first:

- axes and concepts before (483 and 3,557) and after;
- feature-era pairs and families the crosswalk covers, and those it drops, with reasons;
- the gap pool before and after the gap review;
- observations classified for the first time (4,648 now unclassified);
- memberships per observation in each dialogue, by evidence type;
- dispositions;
- bases rewritten (6,813 scrubbed now);
- precision, recall and O4 agreement;
- the dialogues whose Who speaks and Role verify;
- actual spend against forecast.

The phase-1 and C1 receipts and the approved catalog are the evidence. Scripts and schemas are costs,
not progress.

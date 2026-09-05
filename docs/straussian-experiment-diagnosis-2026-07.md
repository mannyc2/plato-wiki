# Straussian Experiment Diagnosis (2026-07)

> Historical v1 diagnosis, retained as snapshot-bound provenance. References to
> label families, label-keyed dossiers, or missing v1 layers describe the
> 2026-07 corpus and are not current ontology contracts. See
> `docs/ontology-vnext.md` for the active comparison model.

Status: analysis artifact, 2026-07-19. Read-only diagnosis of the unfinished founding
experiment, produced under the analysis brief of 2026-07-19. No repository data, code, or
corpus state was modified in producing it. Planning artifacts derived from this diagnosis
are separate files (`docs/voices-protocol.md`+), each requiring operator ratification before execution.
This document asserts no hidden meaning in any text; it diagnoses what the corpus can and
cannot represent.

Evidence basis (all read-only, gathered 2026-07-19):

- Founding session `~/.codex/sessions/2026/06/06/rollout-2026-06-06T14-24-00-*.jsonl`
  ("F1", 5,116 lines), the original idea attachment
  `~/.codex/attachments/71d7f991-*/pasted-text.txt` ("F2", 75 lines), and the July 3
  retrospective `~/.codex/sessions/2026/07/03/rollout-2026-07-03T10-57-05-*.jsonl`
  ("F3", 103 lines). Line numbers are physical file lines.
- The committed authority documents (SPEC.md, extraction protocol, feature research
  request, completion target/report, known limits, apparatus protocol, the apparatus-lane contract) plus a
  full-repo leakage census (168 grep hits, every one classified).
- Record-level verification of every Symposium layer (observations, claims, relations,
  turns, Greek source, commentary, apparatus) at HEAD `1edb68f` + clean working copies.
- Strauss, *Persecution and the Art of Writing* (1952; "PAW"), Contents, Introduction
  pp. 7–21, title essay pp. 22–37 in full, Guide essay pp. 38–40 and 68–77 targeted.
- Strauss, *On Plato's Symposium* (ed. Benardete; "OPS") — Foreword pp. v–ix plus ~116
  targeted pages across chs. 1–3, 5–9, 11–12. Two caveats travel with every OPS cite:
  the available PDF is an image-only scan with missing leaves, two of them
  task-relevant (p. 271, Strauss's comment on the 218b audience division; p. 285, the
  closing dozing scene); and the edition's own mediation is documented — the 1966
  revised manuscript was lost and the edition was redone in 1999 from incomplete tapes
  (Foreword p. vii; "[Tape change.]" survives at p. 282).

All Symposium data files cited below are git-tracked and clean; the working tree's
uncommitted changes (plans 064–070, completeness/public-release work) touch none of them.

---

## 1. The founding objective and its scope shifts, cited

The project's history divides into a seed, a founding statement, an immediate
methodological refinement, a long deliberate detour, and a retrospective re-scoping. The
detour was not drift; it is documented as a decision.

**1. The seed was domain-generic.** F2, the original "LLM-wiki" attachment, proposes a
persistent, incrementally maintained wiki between an LLM and immutable raw sources — "the
LLM is rediscovering knowledge from scratch on every question. There's no accumulation"
(F2:9); "incrementally builds and maintains a persistent wiki" (F2:11); raw sources "are
immutable ... your source of truth" (F2:29). F2 never mentions Plato, Greek, Strauss, or
esotericism. The application is the user's.

**2. The founding statement (user, F1:7, 2026-06-06).** "i wanna create a llm wiki. raw
data is like platos writings. and then we want to evaluate straussian claims." Asked what
success looks like: "See if LLMs can find esotericism. I think one idea is like, if we
explicitly tell the LLM building the wiki to 'find esotericism' they will have bad
results. We need some more determinism." Anchoring was decided in the same turn ("Strict
Stephanus + Greek terms", F1:7; "As close to the canonical plato writings as possible ...
Then we can use greek", F1:47). Whether Strauss's own writings would join the corpus was
left undecided and never subsequently adopted.

**3. The first-hour refinement (user, F1:27).** The discovery goal was immediately
recast as substrate-first, in the user's own words: extraction "should intrinsically aid
us towards our goals without explicitly telling the LLM 'find esotericism'. LLMs
shouldn't even be tasked with 'generating hypothesis' ... the agent runs a fixed
extraction pass that produces a record, not a reading." And the thesis in one line: "we
should be not thinking about esotericism. Rather, we should be building an LLM wiki that
would make it obvious of such esotericism, although that isnt the intent."

**4. Assistant-proposed framings, subsequently ratified.** The label "Plato textual fact
compiler ... not an 'esotericism detector'" originates in an assistant turn (F1:42) and
became the extraction protocol's first sentence
(`docs/plato-wiki-extraction-protocol.md:5`). Likewise assistant-origin: the
banned-phrase list (F1:42 → protocol's Forbidden list, protocol:46–52), the
discover-then-freeze ontology (F1:55), and the later re-description of esotericism as
"the hypothesis-under-test, not the task prompt" (F3:51). One assistant proposal was
never ratified and never appears in any committed document: negative controls
("include mundane passages where no hidden signal should be found", F1:22). It remains
the only evaluation control ever discussed.

**5. The build era.** The remainder of F1 (through 2026-06-09) and plans 001–045 are
extraction and infrastructure exclusively: Greek import, harness, ingest runs, review,
turn/label/claim/relation layers, v1.0 gates. A grep of both session logs for "find
esoteric*" returns only methodological framing — no turn reports running a discovery
experiment. No committed document states the discovery experiment as a goal; the
committed trace of the founding intent is exactly two things: the prohibition side
(protocol:5, SPEC.md:29–32, the hard-coded system-prompt line at
`packages/harness/src/run.ts:462`) and the promissory side ("If larger interpretive
patterns exist, they should become visible from accumulated records rather than from
prompting an LLM to find them", protocol:7–9).

**6. The July 3 re-scoping (user, F3:6, F3:56–86).** The retrospective states the shift
explicitly: "When I first started this project, the main motivator was like 'can LLMs
find esoteric [Straussian] writing from first principles?'. But, I then decided to defer
this motivation completely and build some Palantir-like ontology instead." Two theses
are kept separate: (i) agents "could better analyze Plato's dialogues with these
features-first rather than source first"; (ii) the naive direct test is invalid — the
agents "would have these Straussian ideas in-distribution and the results would have
been predetermined ... The failure mode is prompt-induced confirmation: the model treats
the premise as a target to satisfy, not a hypothesis to test." Completion was redefined
twice in the same session, in different senses: operationally (single version with a
frontend, F3:66; later ratified as `docs/completion-target.md`, gated and signed
2026-07-03) and research-wise ("complete is more like 'found for/against evidence of
strauss esotericism implicitly'", F3:56). Posture: "this is a Plato knowledge-base/wiki
first. Our Straussian ideas are simply an extension or view over that" (F3:86); "I don't
think we will ever mention 'esotericism' or 'Strauss' to these agent's we're planning
currently" (F3:66). Ambition: data "more informed and better than Strauss in various
metrics" (F3:6), "did better than strauss [by some metric/ideas/etc]" (F3:56).

**7. Since then.** v1.0 was completed and audited in the operational sense
(`docs/completion-report-v1.md`). The apparatus-lane contract (commit 4e80eaf) built the apparatus lane —
schema, validator, rendering, concealment rules — while placing all data production out
of scope: "Producing any apparatus data. No LLM detection pass ... The detection/authoring
lane is a separate future plan requiring explicit operator authorization" (plan
062:146–153). `wiki/apparatus/` does not exist in the tree; the lane holds zero records.

**Correction to the brief's framing.** The brief says the founding discovery experiment
"was never run." True, but incomplete: the record shows the *naive* form of the
experiment was deliberately abandoned as methodologically invalid (F3:6, thesis ii), the
endpoint reconceived as implicit accumulation plus a deferred "better than Strauss"
comparison, and a "wider harness" left conditional ("I don't think we are there yet",
F3:6). What was never designed, then, is the *valid* form: a discovery-and-evaluation
experiment that takes prompt-induced confirmation seriously as a design constraint
rather than a reason for indefinite deferral.

---

## 2. Source-authority table

| Authority class | Contents | Where |
|---|---|---|
| User decisions (binding) | Plato as corpus; Greek + strict Stephanus as anchors; never prompt extraction/discovery agents toward esotericism/Strauss; records-not-readings; no hypothesis generation at ingest; KB-first posture with Straussian work as a view; single "done" version with frontend; non-explicit esoteric presentation ("not an 'Esoteric' page"); ambition to end up "better than Strauss" by some metric | F1:7, F1:27, F1:47; F3:6, :56, :66, :86; the apparatus-lane contract:42–47 (operator directive) |
| Assistant proposals, ratified into committed docs | "Fact compiler, not esotericism detector"; forbidden-phrase list; discover-then-freeze ontology; esotericism as hypothesis-under-test | F1:42, F1:55, F3:51 → protocol:5, :46–52; SPEC.md:29–32 |
| Assistant proposals, never ratified | Negative controls over mundane passages (F1:22); concrete "better than Strauss" metrics — better evidence coverage, falsifiability, cross-dialogue retrieval (F3:51). User endorsed the aim, not the metric set | F1:22; F3:51 |
| Committed protocol (binding until amended) | SPEC.md observation contract and prohibitions; extraction protocol incl. underclaiming bias (":200–201") and review neutrality; completion-target neutral-vocabulary rule (":8–13") and fixed v1 page inventory (":118"); known-limits admissions; apparatus protocol (closed 3-sign set :71–77, change-control :79–80, one-way boundary :5–9, site concealment :90–96); commentary protocol (authored lane contract) | respective docs |
| Current repo facts (verified 2026-07-19) | §3 below | this document |
| Strauss's published method | PAW — the only self-stated methodology; defines "Strauss-style" for this project | §4 page cites |
| Edited lecture transcript | OPS — editorially mediated application to the Symposium; authority for *Strauss's practice*, never for *Plato's text*. Mediation is documented in the volume itself: lost 1966 revision, 1999 re-edition from incomplete tapes (Foreword p. vii) | §4–5, §8.1 |

Two "complete"s must never be conflated again: the ratified operational sense
(completion-target gates, achieved) and the user's research sense ("found for/against
evidence of strauss esotericism implicitly", F3:56, not achieved, no committed
definition). Section 8.4 proposes how future documents should disambiguate.

---

## 3. Verified current state of the Symposium spine

Every factual claim in the brief was checked against the tree. Results, with corrections:

| Brief's claim | Verified state |
|---|---|
| ~250 observations | Exactly 250 (`wiki/observations/symposium.md`, IDs 0001–0250 complete) |
| The listed dramatic/verbal details are represented | 14 of 15 probed items present as accepted neutral records with Greek terms (§5 cites). The 15th: no record marks Aristodemus as the attendee who gives no speech — confirmed ABSENT |
| Turn index has 5 turns, collapsing the banquet | Confirmed: `derived/plato/turns/symposium.toon` has 5 turns; turn_symposium_0005 = ΑΠΟΛ., 173e→223d, 80,598 Greek chars — the whole narrated banquet. Contrast: gorgias 1,107 turns, phaedrus 401 |
| All 189 claims name Apollodorus as speaker | Confirmed: 189/189 `speaker: ΑΠΟΛ.` (159 bare + 30 quoted), including pure Agathon doctrine (claim_symposium_0073, "Eros is the youngest of the gods") and pure Diotima doctrine (claim_symposium_0106, "Eros is a great daimon"). Mechanism confirmed: `derived/plato/joins/symposium.toon` maps all 250 observations onto turn_0005 → ΑΠΟΛ., `attributed: true` — the attribution is *confidently wrong*, not missing |
| Relation ledger has 8 records, all restatement/revision | Confirmed: 8 records, kinds restatement×5 / revision×3, all intra-Symposium. No contradiction or tension record exists for the Symposium. Contrast: laws 210, republic 88, cross-dialogue 1,294; corpus total 2,080 |
| Central contrasts (oldest/youngest, god/not-god) unrepresented | Confirmed: obs_symposium_0017 (Phaedrus, πρεσβύτατον), 0066 (Agathon, νεώτατος — whose label is even `predecessor_claim_contradicted`), and 0102/0103 (daimon μεταξύ) all exist, but no relation joins any of them |
| Seating, triads, centers, rings, speaker-interest, expected omissions, cast comparisons unstructured | Confirmed as *layers*: no persons-across-dialogues registry, no dramatic dates, no seating/positional layer, no center/count layer, no expected-set/omission record kind anywhere in the corpus. But the raw *ingredients* are better than the brief implies: speaking order and seating exist as observations (0009, 0012–0014, 0148, 0150, 0167–0169, 0179 — "each of us in turn from left to right", "All the rest of us have spoken") |
| Aristodemus's silence not represented as meaningful absence | Confirmed (and no absence-record kind exists that could represent it) |
| Historical context (mysteries, Sicily, dates) not integrated | Confirmed: no such layer exists |
| Parmenides-order source question | Confirmed as a real edition divergence: repo Greek (`raw/plato/greek/symposium.txt:35–36`, {178b}–{178c}) reads Hesiod → Acusilaus → Parmenides, Parmenides quoted *last*; the Benardete edition prints Hesiod → Parmenides → Acousilaus and Strauss's center argument names Parmenides accordingly (OPS p. 47). Full treatment §8.1 |
| Missing observations ≠ textual absence; missing relations ≠ no tension | Affirmed by protocol itself: extraction biases toward underclaiming (protocol:200–201); relation candidate generation is intentionally bounded (known-limits:78–84 — shared normalized Greek term + claim-kind gates); the anchor lexicon disclaims absence-evidence (known-limits:95–96) |

Adjacent verified state that the brief did not know:

- **Commentary lane** (`wiki/commentary/symposium.md`): 71 blocks, every one
  `author: model`; 38 accepted / 33 unreviewed. It already *contains*
  Straussian-pattern readings in prose: the ascent explicitly mapped onto the earlier
  speeches ("the earlier loves of the evening will each find a place on it as a step" —
  the correspondence Strauss draws at OPS p. 237),
  the Silenus surface/depth reading ("what kind of praise needs a hinge"), the
  concealed-purpose reading ("The exposer of masks is caught wearing one"). It does not
  cover the 218b audience division. Consequences in §7.
- **Apparatus lane**: fully specified (protocol + validator + rendering + site
  concealment), zero records, `wiki/apparatus/` absent. The three sign kinds are
  `surface_tension`, `structural_marker`, `address_shift`; the set is closed and
  change-controlled (protocol:71–80).
- **Corpus-wide substrate** relevant to detection (censused 2026-07-17, reconfirmed in
  scope here): irony_marker family 367 obs; frame_depth 146; relations tension 1,101 +
  contradiction 43, restatement 773, revision 163; claim final_status left_standing
  4,028 / posed_only 369 / unresolved_challenge 48 / refuted 23 / revised 16. Caveats
  that carry into any detection use: 69% of accepted cross-dialogue tensions self-hedge;
  dossier counter-records are 100% rejected-observation bookkeeping (zero
  disconfirmations); claim-fate threading exists only for the Theaetetus pilot.
- **Snapshot drift to keep separate**: completion-report-v1 records 776 dossiers and
  3,892 labels (2026-07-08); the current index reports 739 dossiers and post-046
  accepted ontology is 3,617 labels. Cite era when citing numbers. The
  completion report also contains an internal tension (R6 marked PASS at :30 vs "Do not
  tag v1.0 yet" at :89–93) — flagged, not resolved here.

---

## 4. Strauss operation → corpus support matrix

"Strauss-style" is fixed by PAW's own statements. Legitimacy rules he imposes on
himself: reading between the lines is "strictly prohibited in all cases where it would
be less exact than not doing so" (p. 30); it must start from exact attention to explicit
statements, after the work's context, literary character, and plan are grasped (p. 30);
an era of enforced orthodoxy must actually obtain (pp. 32–33); a master writer's
apparent blunder is presumed intentional (p. 30); a character's words must not be
attributed to the author without proof (p. 30); the accuser bears the burden of proving
deliberateness (pp. 26–27); "thoughtless men are careless readers, and only thoughtful
men are careful readers" (p. 25).

Support classes: **A** directly represented and queryable; **B** recoverable manually
from existing records/Greek but not structurally represented; **C** absent, malformed,
misattributed, or unestablishable from current extraction. Confidence is in the
verdict, given this session's verification depth.

| # | Strauss operation | Documented example | Corpus support | Limitation | Class / conf. |
|---|---|---|---|---|---|
| 1 | Contextual warrant: persecution, enforced orthodoxy, author's acknowledgment of concealment | PAW pp. 32–33 (negative + positive criteria); acknowledgment placed inconspicuously (p. 32) | Nothing. No historical-context, dramatic-date, or author-circumstance layer | Not extractable from text-only ingest by design; needs a sourced external-context lane, else warrant condition is unevaluable | C / high |
| 2 | Contradictions, incl. distant and of-implications | PAW pp. 70–71 (subtypes); Maimonides "conscious and intentional contradictions" pp. 68–69; rarity rule p. 73 | 1,144 accepted tension+contradiction relations corpus-wide; claim stance_events; fate statuses | Generation bounded (shared-Greek-term + claim-kind gates); 69% of cross-dialogue tensions self-hedge; Symposium has zero; embedded-speaker contradictions unstatable while all claims say ΑΠΟΛ. | B (corpus) / C (Symposium) / high |
| 3 | Consequential statement made only in passing | PAW pp. 24–25 (casual placement of the decisive point) | Observation prose occasionally notes it; no salience/placement structure | Needs positional representation before "in passing" is a queryable property | B / med |
| 4 | Repetition with small addition/omission/substitution | PAW pp. 36, 70–71 (false repetition silently altered); OPS p. 237 (the ascent as changed recapitulation — Plato never repeats identically) | 773 restatement + 163 revision relations; Symposium rel_0003/0004 do link Aristophanes's doctrine to Diotima's as revision | Relation kinds carry no delta payload — *what* was added/dropped is nowhere structured; the ascent's six-stage/six-speech correspondence is no record (it exists only as commentary prose) | B / high |
| 5 | Altered or unexpected quotation | Maimonides's fourfold Aristotle citation dropping the endoxon markers, PAW pp. 75–76 | Greek source marks quotations ({q}/{quote} tags); Symposium's Hesiod/Parmenides quotes recorded (obs_0017) | No quotation-fidelity layer comparing quoted text to its source tradition | C / high |
| 6 | Silence relative to a justified expected set | Farabi's immortality silence across an ostensibly complete Plato, PAW pp. 13–15 | Nothing. No expected-set machinery, no absence record kind; Aristodemus-as-non-speaker unrecorded; anchor layer explicitly disclaims absence-evidence | The expected set for the Symposium *is* manually derivable (obs_0179 "All the rest of us have spoken" + attendee records) but nothing joins expectation to omission | C / high |
| 7 | Missing argumentative links | PAW p. 30 ambit (exact reading of plan) | stance_events record challenges; nothing represents an absent step | Needs argument-structure representation or an evaluation-lane concept | C / med |
| 8 | Ambiguous, strange, or unusually selected expressions | PAW pp. 36, 71–73 (a word "with two faces") | greek_terms on every record; wordplay/strange-usage observations exist (e.g. obs_0035 "Pausaniou de pausamenou") | Present locally; "strangeness" is not a queryable class, only a label-by-label accident | B / med |
| 9 | Beginnings, endings, centers, counts, groupings, order | PAW pp. 24–25 (center of a short opening section); p. 77 (rashei perakim); order/enumeration of the Guide's lists pp. 70 ff.; OPS p. 47 (center rule at 178b — but see §8.1), p. 96 (the hiccup's swap "Aristophanes' speech becomes the center of the whole"), p. 282 (the two linked triads) | closure_type family covers endings thematically; speaking-order and seating exist as observations (§3); dossiers count by label | No positional layer at all: no center, no count, no ring, no ordinal structure. The 2026-07 census found the same: structural_marker is "the one kind with no existing feature family." The Republic nuptial number sits flat in one observation | C / high |
| 10 | Apparent mistakes, blunders, slips presumed intentional | PAW p. 30 (blunder-warrant); p. 74 (intentional sophisms) | Dramatic accidents are recorded (hiccup, obs_0036) as events | "Blunder" is an evaluative classification the neutral layer rightly refuses; it belongs to an evaluation lane that does not exist | C / high (by design) |
| 11 | Dramatic action, bodily interruption, accident | Aristophanes's hiccup; the porch delay; the sandals | obs_0036/0035/0053 (hiccup, wordplay, cure); obs_0005 (sandals, "kalos para kalon"); obs_0007/0008 (absorption, porch); obs_0245–0248 (ending) | The best-covered operation in the corpus. What's missing is only consequence-linkage (e.g. hiccup → order change) | A / high |
| 12 | Speaker character, interests, conduct, audience, addressee | Alcibiades's initiated/profane division (218b); OPS pp. 268–273 (concealed purpose "never discovers it"; the 218b comment itself falls on a missing scan leaf, p. 271); p. 280 (irony as not "saying the same thing to everyone") | obs_0201 is an exact hit (βέβηλος, "put great doors over their ears"); irony_marker family rich (0093, 0072–0074, 0015) | Structured speaker attribution is broken (§3): character data exists per-span, but claims cannot say *whose* doctrine they are | B / high |
| 13 | Narration depth, transmission, memory, temporal distance | The Apollodorus–Aristodemus chain; OPS p. 21 (chain and 416 dramatic date vs later narration), p. ix ("several removes") | obs_0001 (three removes, cross-checked with Socrates), 0016 (double memory disclaimer, axiomnemoneuton), 0248 (dozing, dawn); frame_depth family 146 corpus-wide | Depth recorded as prose, not as a per-span narration-level index; "who is quoted through whom" is unqueryable | B / high |
| 14 | Present, absent, and silent characters | Aristodemus silent all evening — OPS p. 29 ("He does not speak"; the "true image of eros") | Presence: prosopography observations. Absence/silence: nothing (§3) | Same machinery gap as #6 | C / high |
| 15 | Comparison across works, editions, sources, circumstances | Strauss's constant practice; the 178b order question (§8.1) | 1,294 cross-dialogue claim relations (bounded: accepted definition/thesis, standing/revised, shared term); no cast, date, edition, or variant layer | Cross-work comparison exists for *doctrines* only; dramatic and textual-variant comparison impossible | B (doctrinal) / C (rest) / high |
| 16 | Convergence of several individually weak details | The whole of PAW's method; "Contradictions are the axis of the Guide" (p. 74) as organizing claim | Nothing represents an argument that *joins* records | The corpus has no candidate-reading object at all — the terminal gap every other row feeds | C / high |

Reading of the matrix: the corpus is strongest exactly where extraction could be local
(rows 11–13) and weakest where Strauss's arguments are *relational or positional* (rows
2, 4, 6, 9, 16) or require *non-textual warrant* (row 1). That distribution is the
predictable signature of a span-anchored, single-pass, deliberately selective ingest —
it is what "records, not readings" buys, and what it costs.

---

## 5. End-to-end reconstructions (Symposium)

Four traces from Greek passage → records → relations → the inference a reader would
want. Each shows where the chain holds and where it breaks. None of these asserts the
inference is *true*; that is precisely the evaluation the system cannot yet perform.

### 5.1 The hiccup and the order of speeches

Greek: line 42 ({185c}–{185e}): Παυσανίου δὲ παυσαμένου ... λύγγα ... either cure me "or
speak in my place"; Eryximachus answers he will do both — speak in Aristophanes's turn,
then Aristophanes in his. Records: obs_0035 (the narrator flags the wordplay "when
Pausanias paused" — the text itself advertising the seam), obs_0036 (full event, with
the three escalating remedies), obs_0053 (cure confirmed, transition back). Relations:
none. Turn layer: unusable (one narrated turn). Inference at stake (whatever one makes
of it): the comic poet's body reorders the evening so that the doctor precedes him and
he precedes the tragedian — the speech order becomes Phaedrus, Pausanias, Eryximachus,
Aristophanes, Agathon, Socrates(/Diotima), Alcibiades. Strauss's use of the event is
precisely the unrepresentable consequence: the swap regroups the triads and
"Aristophanes' speech becomes the center of the whole" — centrality gained by a defect
of the body (OPS pp. 95–96). Verdict: the *event* is class A;
the *reordering and its consequences* are class B — a human can reconstruct the order
from the observation set (0148, 0179 with 0036), but no structure represents "order as
announced" vs "order as executed," so no query can surface the displacement, and nothing
could do so for a dialogue where the displacement is subtler.

### 5.2 Oldest, youngest, not a god

Greek: lines 35–36 ({178b}, Phaedrus: no parents; Hesiod, Acusilaus, Parmenides as
witnesses; πρεσβύτατος), Agathon at {195a–c} (νεώτατος, and Necessity not Eros behind
the old violence), Diotima at line 125 ({202c}: those who deny he is a god at all —
δαίμων μέγας at {202d–e}). Records: obs_0017, obs_0066 (label:
predecessor_claim_contradicted — the extractor *saw* the clash), obs_0096/0102/0103;
claims 0073 (Agathon thesis) and 0106 (Diotima definition), both `speaker: ΑΠΟΛ.`.
Relations: none of these records is joined to any other. The designed-sequence reading
is documented: Agathon rejects Phaedrus's claim by name, which Strauss says "makes the
question of his origins more clearly felt" (OPS p. 169), inside the two-triad
architecture (p. 282). Verdict: the corpus contains
every premise of the designed three-step contradiction and cannot state the
contradiction. Two independent defects compose: no relation spans the speeches, and if
one did, both sides would currently be attributed to the same speaker — a Straussian
non-argument (and a violation of Strauss's own voice-discipline rule, PAW p. 30). This
is the cleanest demonstration that the limits are representational and attributional,
not coverage.

### 5.3 Diotima's ascent as changed repetition

Greek: line 198 (the entire ascent {210a}–{212a} on one physical line). Records:
obs_0138–0145, 0155 (eight entries; stages, steps/epanabathmoi, culmination, eidola
contrast). Relations: rel_0003 and rel_0004 *do* mark Diotima's doctrine as a revision
of Aristophanes's (reunification → generation-in-the-beautiful) — the only place in the
ledger where the dialogue's speeches answer each other. Nothing represents the delta as
a delta (what the "repetition" keeps, drops, adds), and the correspondence between the
ascent's rungs and the evening's earlier speeches exists only as commentary prose
("the earlier loves of the evening will each find a place on it as a step",
comm_symposium file line ~1522, author: model). That correspondence is Strauss's own:
six stages, "as many as there are speeches on eros in the dialogue" (OPS p. 237), with
the sixth-within-sixth placement noted at p. 229. Verdict: partially represented (best
relational coverage of the four cases); the *structure* of a changed repetition —
Strauss's device at PAW pp. 70–71 — has no home; and the one place the correspondence is
written down is an interpretive lane that discovery agents must never read (§7).

### 5.4 Aristodemus's silence and the narration chain

Greek: line 6 ({174a} region: the uninvited follower; the chain set up at {172a–173b});
line 34 ({178a}: the double memory disclaimer); line 246 ({223b–d}: the dozing, the
missed dawn arguments, comedy and tragedy, μεθύειν... he did not remember). Records:
obs_0001/0002/0003/0016/0078/0248 — the chain, the barefoot marker, the disclaimers, the
ending. What is missing: any record that Aristodemus, alone of the named symposiasts
present all evening, gives no speech. The expected set is *derivable*: obs_0179 has
Alcibiades told "each of us in turn ... All the rest of us have spoken," and the
attendee records enumerate who reclines where. But absence has no record kind, so the
one fact Strauss-style reading treats as load-bearing about Aristodemus (the narrator of
everything is the man with no logos of his own) cannot exist in the corpus except as a
reader's private synthesis. Strauss states the fact flatly — "He does not speak" — and
builds Aristodemus into "the true image of eros" from it (OPS p. 29). Verdict: class C
with class-B ingredients; the precise gap is a *justified expected set* plus an
*omission record* citing it.

---

## 6. Sufficiency judgments

Four different experiments, four different answers. These are judgments about the
*corpus as substrate*, holding the model constant.

**6.1 Manual recovery of a known reading (Strauss in hand): OFTEN SUFFICIENT, AS AN
INDEX.** For locally-anchored devices, the observation layer is genuinely strong — 14 of
15 probed Symposium details exist as accepted records with Greek terms, and finding them
by Stephanus span is easy. Where the known reading is relational (5.2), positional, or
absence-based (5.4), recovery means leaving the corpus for the Greek. The corpus indexes
the evidence; it does not hold the argument.

**6.2 Corpus-assisted interpretation (no Strauss given, human or agent working with all
layers): PARTIAL.** The two-layer asymmetry decides it: observations dense and reliable;
relations sparse (8 for the Symposium), attribution wrong at the claims layer, and no
positional/absence/variant structure. An interpreter gains a concordance and loses
nothing — but the overlay does not yet do the thing F3's thesis (i) hoped: make the
configurations *visible* rather than findable-by-rereading.

**6.3 Prompt-blind discovery: NOT DEMONSTRATED, AND NOT CURRENTLY RUNNABLE AS
DESIGNED.** Four independent blockers, in order of severity: (1) there is no candidate-
reading object — nothing an agent could *write* that records a configuration before
comparison (the apparatus lane is a publication surface, accepted-records-only by
protocol, and its three sign kinds cover a minority of §4's operations); (2) the
attribution defect forces any discovery agent to parse speaker identity out of prose,
i.e. to re-do ingest work mid-experiment; (3) the blind condition is undefined —
"blind" can only mean *unprompted and firewalled*, never *ignorant*, because the user's
own in-distribution point (F3:6) applies to every model that will ever run this; a
credible design therefore needs baselines (e.g. raw-text-only vs corpus-overlay
conditions) and pre-registration of candidates before any Strauss comparison, not an
assertion of blindness; (4) no controls were ever ratified (F1:22 died as a proposal).
None of these blockers is coverage; re-running extraction would fix none of them.

**6.4 Source-aware evaluation of candidate readings: ABSENT.** Nothing represents an
alternative explanation, a disconfirmation, or a variant. The dossier counter-record
mechanism is bookkeeping (zero disconfirmations corpus-wide); the relation ledger's
tension quality is diluted (69% self-hedging) and its fates are threaded only in the
Theaetetus pilot; there is no edition/variant lane (§8.1), no negative-control set, and
no metric definition for the "better than Strauss" ambition. Today the system could at
most *suggest*; it could not weigh a suggestion against "this is a comedy convention,"
"this is a formulaic transition," or "this center is an artifact of one edition's
ordering."

---

## 7. Provenance and interpretation-leakage assessment

**The neutral layers are provably free of Strauss-the-text.** Full-repo census: 168
hits for strauss/esoter/persecution/"between the lines"/"hidden teaching"/exoteric; the
majority are the repository's own name; every one of the 74 hits inside wiki content
layers is a limits-field disclaimer, a neutral gloss of the text's own secrecy
vocabulary (ἐν ἀπορρήτοις at cratylus, the Protagoras "secret doctrine" irony at
theaetetus), or one mythological false positive (Hera's "persecution" of Dionysus).
`raw/` and `derived/`: zero. The ban is enforced in the ingest system prompt
(`packages/harness/src/run.ts:462`) and regression-tested at the site layer (the
quietness sweep in site.test.ts). The feature taxonomy's origin document is Strauss-free
and lists esoteric claims as anti-goals. No neutral record asserts a hidden teaching.

**Three leakage channels remain, in different epistemic classes:**

1. **Commentary (real, present, containable).** The commentary lane is model-authored
   (71/71 `author: model` for the Symposium) and already contains readings adjacent to
   Strauss's known Symposium arguments (§3): the ascent/speeches correspondence, the
   Silenus hinge, the concealed-purpose verdict. This is exactly what the brief warned
   about: commentary must never be counted as independently discovered evidence, and any
   discovery agent whose inputs include commentary (or the site pages rendering it)
   voids the experiment. The containment already exists contractually — commentary and
   apparatus are one-way lanes ("nothing neutral ever reads it," apparatus-protocol:9) —
   but an experiment design must make it operational: an explicit input manifest per
   agent, checked, not assumed.
2. **Pretraining (real, permanent, designable-around).** Strauss on the Symposium is
   in-distribution for every capable model, as the user stated (F3:6). No grep can
   detect it and no prompt hygiene can remove it. Consequence: independence claims must
   be *measured* (baseline conditions, convergence across models, pre-registered
   candidates) rather than *asserted*. "Prompt-blind" should be renamed in all future
   documents to what it is: unprompted discovery under an input firewall.
3. **Selection bias at ingest (possible, undetectable by inspection).** Extraction was
   selective ("what seemed especially worthy of remembrance" is, fittingly, also the
   corpus's own epistemic situation — protocol:200–201). A model that has read Strauss
   may find "notable" what Strauss found notable, even under neutral instructions. The
   observation layer's 14/15 hit rate on Strauss-relevant details (§3) is evidence of
   rich coverage *and* is consistent with this bias; the two cannot be distinguished
   from inside the corpus. Only a control (e.g. coverage comparison on passages Strauss
   never discusses, or against a non-Straussian commentator's noticings) could estimate
   it.

**Verdict:** provenance hygiene held where it was designed (records), the interpretive
lanes are correctly quarantined by contract but are now *populated* with
Straussian-pattern content, and the deepest channel (weights) is a design constraint for
the experiment, not a flaw to fix in the corpus.

---

## 8. Unresolved discrepancies and open methodological decisions

**8.1 The 178b order/center question (fact established; textual question stays open).**
This repo's Greek gives Hesiod → Acusilaus → Parmenides (symposium.txt:35–36):
Parmenides is quoted *last*. The Benardete edition prints the three authorities as
Hesiod → Parmenides → Acousilaus, and on that ordering Strauss's comment invokes his
center rule — "the most important in Plato is always in the center" — and names
Parmenides the most important, the one authority who makes Eros simply first (OPS
p. 47). So at least one of Strauss's structural arguments rests on a position
Parmenides holds only in that edition's English, not in the transmitted Greek — and
this despite the Foreword's assurance (p. vii) that the translations were revised to
conform more strictly to the Greek. What this session's evidence *cannot* settle: what
Strauss said in 1959, what his working text read, or whether the divergence is
transcriptional or editorial — the volume's own production history (lost manuscript,
tape gaps) blocks certainty. The policy consequence is unchanged and now
evidence-backed: the corpus has no edition/variant representation, so *no structural
argument (center, order, count) can be anchored to "the text" as opposed to "this
edition."* Any future structural layer needs an edition-scope field from day one, and
this case is its seed fixture.

**8.2 The three-sign vocabulary is an illustrative subset, correctly governed.**
Measured against §4: surface_tension covers rows 2 (partially), structural_marker row
9's *display*, address_shift row 12. Nothing covers repetition-delta (4), silence/
expected-set (6, 14), altered quotation (5), blunder (10), transmission depth (13), or
convergence (16). The protocol's closed-set + change-control rule (:79–80) is the right
governance; the error to avoid is treating the current three as a storage ontology for
discovery output. Candidate readings need their own record shape; signs are how
*accepted* results surface.

**8.3 Where candidate readings live is undecided — and is the central architectural
decision.** The apparatus lane publishes accepted records only and carries no
draft/candidate semantics; the dossier lane is label-arithmetic; relations join two
claims, not N records into an argument. A discovery experiment needs a lane whose unit
is "configuration: records + relations + proposed significance + alternatives +
counterevidence + status," reviewable like everything else. Whether that is a fourth
lane, an extension of apparatus with a pre-publication status, or an experiment-local
artifact outside wiki/ is a genuine open choice with quarantine implications (§7.1).

**8.4 "Complete" is a homonym.** Operational completion (ratified, achieved) vs the
research sense (F3:56, never committed). Every future document should say which it
means; this diagnosis uses "operational v1.0" and "the founding experiment"
respectively.

**8.5 "Better than Strauss" has candidate metrics, none ratified.** Assessable
dimensions on the table (assistant-proposed F3:51, user-endorsed in aim only):
evidence coverage per reading; traceability (every premise a citable record); explicit
falsifiability (counterevidence recorded and weighed); reproducibility (independent
agents converge on the configuration without being pointed at it); cross-dialogue reach.
Strauss's own legitimacy rules (PAW p. 30) are themselves usable as evaluation criteria
— a candidate reading that violates the exactness rule loses. Ratifying a metric set is
a user decision; the diagnosis only records that *without one, the ambition is
unfalsifiable.*

**8.6 The completion-report R6 tension** (PASS at :30, "do not tag yet" at :89–93) is a
bookkeeping discrepancy in a ratified document; noted for the operator, out of scope
here.

**8.7 Guardrail affirmations for whatever comes next** (restating the brief's
constraints as standing policy, all consistent with committed protocol): ingest agents
are never asked for hidden meanings; anomaly ≠ concealment; Strauss is comparator, not
ground truth; no feature-count "esotericism score"; absence claims require a defined
expected set; frequency ≠ truth; one edition's structure ≠ the text's structure;
commentary ≠ discovered evidence; the corpus remains a general Plato knowledge base of
which all of this is one view.

---

## 9. The brief's questions, answered

1. *User-stated vs assistant-proposed vs ratified?* — §1 items 2–4, §2 table. The
   discovery goal, anchoring, neutrality, KB-first posture, and concealed presentation
   are user-stated; the fact-compiler framing, forbidden list, freeze, and
   hypothesis-under-test recast are assistant-proposed and ratified; negative controls
   and concrete metrics were proposed and never ratified.
2. *Which components are complete and closed?* — The Greek source layer, the observation
   layer (250/250 verified rich; standing do-not-reopen), the label freeze + 2,080-pair
   relation universe *as v1 decisions*, v1.0 gates, and the commentary protocol's
   one-way boundary. Nothing here requires reopening them; every gap in §4 is additive.
3. *Directly supported operations?* — §4 rows 11 (dramatic action), 12 (speaker/audience
   texture, minus attribution), 13 (narration/memory), plus restatement/revision pairs
   and the irony/frame families.
4. *Manually reconstructible but not queryable?* — §5.1 (order), §5.2 (the triad's
   premises), §5.3 (correspondence), §5.4 (expected set); §4 rows 3, 4, 8, 15.
5. *Never extracted/derived?* — historical context, dramatic dates, persons registry,
   positions/centers/counts, edition variants, quotation fidelity, absence records,
   candidate readings (§4 rows 1, 5, 6, 9, 14, 16).
6. *Failure classification?* — Attribution: claims speaker collapse (mechanism verified:
   turns → joins → claims). Representation: no delta, position, absence, variant, or
   argument objects. Coverage: bounded relation generation; deliberate extraction
   selectivity (a design property, not a defect). Inference: no candidate-reading layer.
   Evaluation: no alternatives/counterevidence/controls/metrics. The Symposium's
   headline problems are attribution + representation; *none* of the four experiment
   types fails primarily for coverage reasons.
7. *Can a meaningful prompt-blind condition still be created?* — As *unprompted +
   firewalled + baselined*, yes (§6.3, §7.2); as ignorance, never. The neutral layers
   are clean inputs; commentary/apparatus/site must be excluded by manifest; candidates
   pre-registered before comparison.
8. *What provenance distinguishes independent evidence?* — Lane authorship + review
   fields already exist (`author: model`, review_status); the missing piece is
   per-experiment input manifests and a recorded provenance chain for any new derived
   layer (who read what). §7.
9. *How to represent ordinary explanations and false positives?* — Not representable
   today (§6.4); requires alternative-explanation and disconfirmation record kinds and
   negative controls; the dossier counter mechanism is not this.
10. *What would "better than Strauss" mean?* — §8.5's five dimensions, pending
    ratification.
11. *Is the three-sign vocabulary adequate?* — Illustrative subset, correctly
    change-controlled, wrong as a discovery ontology (§8.2).
12. *How should edition/transcript disagreements constrain structural arguments?* —
    Hard constraint: no positional claim without edition scope; variant lane seeded by
    the 178b case (§8.1).
13. *How does the project stay a general KB?* — Already ratified posture (F3:86;
    completion-target neutral-vocabulary rule; apparatus concealment). All additions in
    §10 are lanes/views; none renames the project's public face.

---

## 10. Gap register (planning inputs)

Planning was authorized by the operator on 2026-07-19 (in-session). These are the
evidenced gaps this diagnosis licenses plans against — each maps to matrix rows and a
failure class. Plans, not this document, decide scope/sequence/method; a plan may cover
several gaps or split one.

- **G1 — Embedded-speaker attribution.** Claims/turns collapse (§3, §5.2); known-limits
  already names narrated interior speech as post-v1.0 work. Not Symposium-specific
  (measured 2026-07-19): wholesale frame-voice collapse also in phaedo (249/249 → ΕΧ. —
  the frame *listener*, an anomaly of its own), euthydemus (84/84 → ΣΩ.), protagoras
  (76/76 → ΣΩ.); plus 990 claims `(unattributed)` across the five no-sigla dialogues
  (republic 811, parmenides 85, charmides 34, lysis 31, apology 29); plus local
  quoted-discourse spans in turn-rich dialogues (phaedrus/menexenus/theaetetus).
  Fixing attribution is load-bearing for G2, G7, and any discovery run. [Rows 2, 12;
  attribution]
- **G2 — Cross-speech relational structure for narrated dialogues.** Symposium's 8
  relations vs its density of linked doctrine; contradiction/tension kinds unused
  intra-Symposium; repetition-delta payload absent. [Rows 2, 4; representation]
- **G3 — Positional/structural derivation.** Centers, counts, order-as-announced vs
  order-as-executed, rings; deterministic where possible; edition-scoped from day one.
  The zero-family operation. [Row 9; representation]
- **G4 — Expected-set + meaningful-absence machinery.** Justified expectation objects
  and omission records citing them (Aristodemus fixture, §5.4). [Rows 6, 14;
  representation]
- **G5 — Persons, dramatic dates, historical context.** Cast registry across dialogues;
  dramatic/narration dates; sourced external-context lane for warrant conditions (row
  1) kept separate from Plato-text records. [Rows 1, 15; coverage]
- **G6 — Edition/variant lane.** Seeded by the 178b case; prerequisite for any
  structural argument's validity scope. [Row 15, §8.1; representation]
- **G7 — Candidate-reading (configuration) object + discovery lane semantics.** The
  terminal gap (§8.3); includes its quarantine/manifest rules. [Row 16; inference]
- **G8 — Evaluation apparatus.** Alternative explanations, disconfirmations, negative
  controls, metric set for the Strauss comparison. [§6.4; evaluation]
- **G9 — Experiment design.** The unprompted-discovery protocol itself: conditions,
  baselines, pre-registration, input firewalls, leakage measurement, comparison
  procedure against PAW/OPS. [§6.3, §7; evaluation]

Dependency spine: G1 → G2 → (G3, G4, G6 in any order) → G7 → (G8, G9). G5 is parallel.

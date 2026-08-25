# protagoras: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/protagoras.txt`, sha256 `f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b`
**Turn index**: `derived/plato/turns/protagoras.toon`, sha256 `c35d612db3346447e8c4152742e1fdf36476819612db9c7e0c855fbe5e55b5de`, 74 printed-siglum turn(s)
**Disposition**: `required` — 52 outer turn(s) carry nested reported turns
**Reviewers**: two passes. Pass A, an independent reviewer working from the Greek source and the outer-turn index alone, blind to any other pass, to this repository's existing ledgers, and to any earlier census. Pass B, the executing reviewer, who ran a separate mechanical cue scan over every outer turn span and read every turn that carries a reporting cue or quotation marker but was called `no`, which is the direction in which a wrong answer is silent. Disagreements were settled by reading the Greek, and every call that turned on a standard rather than on the text is recorded below.

## Standard applied

A nested reported turn is a bounded stretch of direct speech transmitted below
the printed speaker, licensed by Greek speech machinery. It is not every quoted
phrase, indirect report, remembered proposition, or argumentative recap. Quotation
alone is not enough; direct speech attributed to another owner is enough, even when
the quotation fills the whole printed turn. The case table is in
`docs/voices-protocol.md`, "What counts as a nested reported turn", ruled by the
operator on 2026-07-26 during this census.

This is a scope census, not speaker resolution. It creates, resolves, and changes
no record, and it confers no authority on any claim.

## Method

Mechanical cue scan over each outer turn's exact character span, then reading.

- Cues: `ἔφη`, `ἔφην`, `φησί(ν)`, `φάναι`, `ἔφασαν`, `εἶπε(ν)`, `εἰπεῖν`, `εἶπον`,
  `εἰπών`, `ἦ δ’ ὅς`, `ἦν δ’ ἐγώ`, `ἠρόμην`, `ἤρετο`, `ἀπεκρίνατο`, `ὑπολαβών`,
  `λέγει`/`ἔλεγε(ν)`, and the source's own `{q}` and `{quote}` markers. A cue count
  is a candidate count, never an answer.
- Two orthographic traps are load-bearing, both found by independent review of an
  earlier count that got them wrong: the source uses two elision marks (U+2019 and
  U+1FBD Greek koronis) and prints the same pronoun with two accents (`ἦ δ’ ὅς` and
  `ἦ δ’ ὃς`). A pattern matching one member of either pair silently drops real cues.
  Greek is also not matched with `\b`, which is ASCII-only in JavaScript regexes.
- `{q}` marks quoted strings generally, including mentioned words, and `{quote}`
  marks cited verse. Neither is evidence on its own; both were read.
- Every hit was read in context. A turn is `yes` only on Greek that transmits
  another owner's direct speech, and `no` only after every hit in it was read.

Candidate hits located and inspected: 462.
Turns with no cue and no quotation marker: 21.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

52 of 74 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_protagoras_0022` | ΣΩ. |
| `turn_protagoras_0023` | ΣΩ. |
| `turn_protagoras_0024` | ΣΩ. |
| `turn_protagoras_0025` | ΣΩ. |
| `turn_protagoras_0026` | ΣΩ. |
| `turn_protagoras_0028` | ΣΩ. |
| `turn_protagoras_0029` | ΣΩ. |
| `turn_protagoras_0030` | ΣΩ. |
| `turn_protagoras_0031` | ΣΩ. |
| `turn_protagoras_0032` | ΣΩ. |
| `turn_protagoras_0033` | ΣΩ. |
| `turn_protagoras_0034` | ΣΩ. |
| `turn_protagoras_0035` | ΣΩ. |
| `turn_protagoras_0036` | ΣΩ. |
| `turn_protagoras_0037` | ΣΩ. |
| `turn_protagoras_0038` | ΣΩ. |
| `turn_protagoras_0039` | ΣΩ. |
| `turn_protagoras_0040` | ΣΩ. |
| `turn_protagoras_0041` | ΣΩ. |
| `turn_protagoras_0042` | ΣΩ. |
| `turn_protagoras_0043` | ΣΩ. |
| `turn_protagoras_0044` | ΣΩ. |
| `turn_protagoras_0045` | ΣΩ. |
| `turn_protagoras_0046` | ΣΩ. |
| `turn_protagoras_0047` | ΣΩ. |
| `turn_protagoras_0048` | ΣΩ. |
| `turn_protagoras_0049` | ΣΩ. |
| `turn_protagoras_0050` | ΣΩ. |
| `turn_protagoras_0051` | ΣΩ. |
| `turn_protagoras_0052` | ΣΩ. |
| `turn_protagoras_0053` | ΣΩ. |
| `turn_protagoras_0054` | ΣΩ. |
| `turn_protagoras_0055` | ΣΩ. |
| `turn_protagoras_0056` | ΣΩ. |
| `turn_protagoras_0057` | ΣΩ. |
| `turn_protagoras_0058` | ΣΩ. |
| `turn_protagoras_0059` | ΣΩ. |
| `turn_protagoras_0060` | ΣΩ. |
| `turn_protagoras_0061` | ΣΩ. |
| `turn_protagoras_0062` | ΣΩ. |
| `turn_protagoras_0063` | ΣΩ. |
| `turn_protagoras_0064` | ΣΩ. |
| `turn_protagoras_0065` | ΣΩ. |
| `turn_protagoras_0066` | ΣΩ. |
| `turn_protagoras_0067` | ΣΩ. |
| `turn_protagoras_0068` | ΣΩ. |
| `turn_protagoras_0069` | ΣΩ. |
| `turn_protagoras_0070` | ΣΩ. |
| `turn_protagoras_0071` | ΣΩ. |
| `turn_protagoras_0072` | ΣΩ. |
| `turn_protagoras_0073` | ΣΩ. |
| `turn_protagoras_0074` | ΣΩ. |

The remaining 22 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_protagoras_0023`
- `turn_protagoras_0024`
- `turn_protagoras_0026`
- `turn_protagoras_0030`
- `turn_protagoras_0032`
- `turn_protagoras_0034`
- `turn_protagoras_0042`
- `turn_protagoras_0043`
- `turn_protagoras_0055`
- `turn_protagoras_0056`
- `turn_protagoras_0058`
- `turn_protagoras_0064`
- `turn_protagoras_0065`
- `turn_protagoras_0066`
- `turn_protagoras_0067`
- `turn_protagoras_0068`
- `turn_protagoras_0069`

## Ambiguous boundary decisions

- Ruling applied: turn_protagoras_0002 yes->no: ὃς ἔφη χαριεστάτην ἥβην εἶναι τοῦ πρῶτον ὑπηνήτου is ἔφη + accusative-and-infinitive, i.e. indirect report of Homer with no bounded direct speech. Decided by the Φίληβος φησι + content row (no if indirect report); the Phaedo 94d row points the same way, since Socrates uses the poet inside his own argument and keeps the floor. This empties the frame: turns 0001-0021 are now all no.
- `turn_protagoras_0033` → **yes**: Whole-turn quotation row. These three turns carry zero reporting cues of their own, but each is a continuation chunk of Protagoras’ Great Speech: this edition re-prints the frame narrator’s ΣΩ. siglum at paragraph breaks, the attribution is δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν in turn 0032, and 0036 and 0038 address ὦ Σώκρατες in the second person, which rules out the printed speaker. Uncertain only in that the licensing formula sits in a different outer turn. Greek: ΣΩ. ἃ μὲν γὰρ αὐτῶν σμικρότητι ἤμπισχεν … κλοπῆς δίκη μετῆλθεν. (321a-322a); likewise 0036 (324a-324e) and 0038 (326a-326e)
- `turn_protagoras_0069` → **yes**: Two independent grounds, each with a caveat. (1) Socrates the narrator reporting his own sustained address inside his own narration — the repeated-chain exception, which the ruling preserves for exactly this shape. (2) A {q}-bounded direct question owned by οἱ ἄνθρωποι, licensed by μετὰ τοῦτο ἤρεσθε ἡμᾶς, whose owner is an unregistered collective and must be recorded unresolved rather than invented. Greek: ΣΩ. τί δ’ εἰ ἐν τῇ τοῦ περιττοῦ καὶ ἀρτίου αἱρέσει … (357a-357e), with {q} ὦ Πρωταγόρα τε καὶ Σώκρατες, εἰ μὴ ἔστι τοῦτο τὸ πάθημα ἡδονῆς ἡττᾶσθαι … εἴπατε {357d} ἡμῖν. {/q}
- `turn_protagoras_0067` → **yes**: Sustained staged interrogation: an indefinite ὑβριστής holds the floor across five {q}-bounded direct questions with φήσει, answered by φήσομεν. Comparable to the Laws in Crito in that the hypothetical speaker sustains an exchange rather than supplying one rhetorical line. Same reading applies to 0065, 0066, 0068 and 0069, where οἱ ἄνθρωποι are addressed vocatively (ὦ ἄνθρωποι) and answer (—φήσουσιν.—, —φαῖεν ἄν.—). Owner unregistered in every case. Greek: ἐὰν οὖν τις ἡμᾶς ἔρηται, {q} διὰ τί; {/q} … {q} ὑπὸ τοῦ; {/q} ἐκεῖνος ἐρήσεται ἡμᾶς … γελάσεται καὶ ἐρεῖ· {q} ἦ γελοῖον λέγετε πρᾶγμα … {/q} ἆρα, {/q} φήσει, {q} οὐκ ἀξίων ὄντων νικᾶν …
- `turn_protagoras_0023` → **yes**: These turns are yes beyond doubt on real on-stage direct speech (ἦ δ’ ὅς, ἦν δ’ ἐγώ, ἔφη with named subjects), so the call itself is not at risk. What remains genuinely uncertain is whether the {q}-marked utterances of the indefinite hypothetical questioner inside them are nested reported turns at all. 0042-0043 stage a run of consecutive questions and so read as sustained prosopopoeia; 0030 and 0064 supply a single rhetorical question and read as the current speaker’s argumentative device, which the personified-ὁ λόγος row would exclude. All six are listed in unregisteredOwnerTurns so the corpus reported-turn completion campaign can drop the one-off ones wholesale if it reads that row strictly. Greek: εἴ τίς σε ἤρετο· {q} εἰπέ μοι, μέλλεις τελεῖν, ὦ Ἱππόκρατες, Ἱπποκράτει μισθὸν ὡς τίνι ὄντι; {/q} — also 0024, 0030, 0042, 0043, 0064
- `turn_protagoras_0056` → **yes**: Socrates stages Pittacus and Simonides in a bounded two-turn direct exchange with vocatives on both sides, and in 0058 Simonides speaks in his own first person (ταῦτα δὴ καὶ τῷ Πιττακῷ λέγει ὅτι ἐγώ, ὦ Πιττακέ, οὐ διὰ ταῦτά σε ψέγω). Against: it is explicitly counterfactual (θεῖμεν … ὡς ἂν εἰ λέγοι λόγον) and its content words are {quote}-marked verse, which the Phaedo 94d row excludes on its own. These turns are yes regardless, because they are chunks of Socrates’ own held-floor Simonides speech licensed by ἐγὼ τοίνυν, ἦν δ’ ἐγώ … πειράσομαι ὑμῖν διεξελθεῖν in turn 0054. Only the Simonides/Pittacus owner is at issue, and it is unregistered. Greek: ὥσπερ ἂν εἰ θεῖμεν αὐτὸν λέγοντα τὸν Πιττακὸν καὶ Σιμωνίδην ἀποκρινόμενον εἰπόντα· ὦ ἄνθρωποι, {quote} χαλεπὸν ἐσθλὸν ἔμμεναι {/quote} , τὸν δὲ {344a} ἀποκρινόμενον ὅτι ὦ Πιττακέ, οὐκ ἀληθῆ λέγεις — also 0055 and 0058
- `turn_protagoras_0057` → **yes**: The turn’s only other-voice material is {quote} Simonides verse closed by φησίν, which the Phaedo 94d row excludes. It stays yes solely as a continuation chunk of Socrates’ own held-floor speech under the narrator-reporting-themselves exception. If reconciliation restricts that exception to spans carrying a first-person cue inside the turn itself, 0057 is the most likely turn in the dialogue to flip to no. Greek: {quote} … ἐπί θ’ ὑμῖν εὑρὼν ἀπαγγελέω, {/quote} {345d} φησίν

## Inspected cue hits that yield no reported turn

- `turn_protagoras_0002`: Indirect report (ἔφη + acc-inf) of a poet, cited as authority while Socrates holds the floor. No bounded direct speech, so no nested turn under the ruling. This is the flipped call. Greek: οὐ σὺ μέντοι Ὁμήρου ἐπαινέτης εἶ, {309b} ὃς ἔφη χαριεστάτην ἥβην εἶναι τοῦ {add} πρῶτον {/add} ὑπηνήτου
- `turn_protagoras_0004`: Statement about speech with no transmitted utterance. Greek: καὶ γὰρ πολλὰ ὑπὲρ ἐμοῦ εἶπε βοηθῶν ἐμοί
- `turn_protagoras_0004`: Announcement of intent to speak. Greek: ἄτοπον μέντοι τί σοι ἐθέλω εἰπεῖν
- `turn_protagoras_0018`: Statement about having spoken and heard; nothing transmitted. Greek: πάνυ γε, πολλὰ καὶ εἰπὼν καὶ ἀκούσας
- `turn_protagoras_0027`: Phaedo 94d row applies directly: the Homeric verse is used inside Socrates’ own narrating sentence — the accusative Ἱππίαν and its participles are his syntax — so Socrates owns the unit and Homer is not a local turn owner. Greek: {quote} τὸν δὲ μετ’ εἰσενόησα, {/quote} ἔφη Ὅμηρος, Ἱππίαν τὸν {315c} Ἠλεῖον, καθήμενον …
- `turn_protagoras_0027`: Homeric words spliced into Socrates’ own first-person narration. Same row. Greek: καὶ μὲν δὴ {quote} καὶ Τάνταλόν {/quote} γε {quote} εἰσεῖδον {/quote}
- `turn_protagoras_0027`: Hippias answering is described, never quoted. No direct speech anywhere in this turn — it is the one narration turn that stays no. Greek: ἐφαίνοντο δὲ … διερωτᾶν τὸν Ἱππίαν, ὁ δ’ … διέκρινεν καὶ διεξῄει τὰ ἐρωτώμενα
- `turn_protagoras_0052`: Homeric verse cited inside Socrates’ own simile about calling on Prodicus. Phaedo 94d row. The turn is yes on independent on-stage direct speech. Greek: ὥσπερ ἔφη Ὅμηρος τὸν Σκάμανδρον πολιορκούμενον … τὸν Σιμόεντα παρακαλεῖν, εἰπόντα— {quote} φίλε κασίγνητε, σθένος ἀνέρος ἀμφότεροί περ σχῶμεν, {/quote}
- `turn_protagoras_0043`: {q} here is word-mention quotation of a phrase under discussion, not an utterance. Same in turn 0053 for τὸ {q} χαλεπὸν {/q}, {q} δεινοῦ πλούτου {/q} and the rest of the Prodicus word-list. Both turns are yes on other evidence (ἦ δ’ ὅς, ἦν δ’ ἐγώ, κακόν, ἔφη by Prodicus). Greek: οὐδὲν γὰρ δέομαι τὸ {q} εἰ βούλει {/q} τοῦτο καὶ {q} εἴ σοι δοκεῖ {/q} ἐλέγχεσθαι
- `turn_protagoras_0073`: Personified ὁ λόγος row: no by default. One counterfactual utterance (εἰ φωνὴν λάβοι), not a sustained floor-holding prosopopoeia comparable to the Laws in Crito. The turn is yes anyway on καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη, ὦ Σώκρατες, ἐπαινῶ σου τὴν προθυμίαν. Greek: καί μοι δοκεῖ ἡμῶν ἡ ἄρτι ἔξοδος τῶν λόγων ὥσπερ ἄνθρωπος κατηγορεῖν τε καὶ καταγελᾶν, καὶ εἰ φωνὴν λάβοι, εἰπεῖν ἂν ὅτι {q} ἄτοποί γ’ ἐστέ, ὦ Σώκρατές τε καὶ Πρωταγόρα … {/q}
- `turn_protagoras_0050`: ἔφη + infinitive summarising a refusal. The turn is yes on Hippias’ direct speech running in from turn 0049 and on Socrates’ own direct address (ἀλλὰ δὴ βελτίονα ἡμῶν αἱρήσεσθε … ἀλλ’ οὑτωσὶ ἐθέλω ποιῆσαι). Greek: ἐμέ τε ὁ Καλλίας οὐκ ἔφη ἀφήσειν
- `turn_protagoras_0029`: Idioms, not reporting formulas. Also turn 0037 ὡς ἔπος εἰπεῖν and turn 0068 imperative εἰπὲ. Greek: οἵ γε πολλοὶ ὡς ἔπος εἰπεῖν οὐδὲν αἰσθάνονται; σὺν θεῷ εἰπεῖν

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. The disposition rests on turns 0022-0074, which are chunks of one narration in which Protagoras, Hippocrates, the doorkeeper, Callias, Alcibiades, Critias, Prodicus, Hippias, Zeus, Hermes and Epimetheus all speak in bracketed or formula-licensed direct speech below the printed ΣΩ. siglum — Protagoras narrates in direct speech, not in the Symposium’s accusative-and-infinitive, so the ruling’s indirect-report exclusions remove almost nothing. The frame (0001-0021) is now cleanly empty, its one candidate being indirect. Residual uncertainty is confined to owner identity, not to the yes/no: 17 required turns carry direct speech whose owner is unregistered, and turn 0057 is the one turn whose yes depends entirely on the narrator-reporting-themselves exception.

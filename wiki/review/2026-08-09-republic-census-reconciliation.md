# Republic — reconciliation of the 2026-07-26 scope census with the staged-speech rule

Executed 2026-08-09 on branch `symposium-rereview/narrator-repeat-reviewed-licence`, at
`0dea43e` (the verified pre-Republic checkpoint). Greek source only
(`raw/plato/greek/republic.txt`, sha256
`ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`); no
translation or external editor's speaker label was consulted. All offsets are
UTF-16 offsets into the source read as UTF-8, verified by slicing.

## Why this receipt exists

The scope census (`wiki/review/2026-07-26-republic-reported-turn-scope-census.md`)
predates the 2026-08-04 staged-direct-speech ruling: it excluded hypothetical,
future and optative speech on mood grounds, which is no longer the test. Bounded
direct speech attributed below the printed speaker is in scope whatever the mood
of its licensing verb; edition `{q}…{/q}` bounds decide extent; speech staged
for the printed speaker themselves (including a first-person plural that
includes them) is self-staging and forms no record; staged owners who are
indefinite (`τις`), collective, or otherwise unregisterable yield records left
`unresolved`.

**No new semantic ruling was made.** Every determination below applies the
2026-08-04 rule text and its existing precedents (365d indefinite objector;
Phaedo 94d verse citation; Phaedo 88c self-quotation). The one line worth
stating explicitly because the Republic exercises it repeatedly: first-person
plural staging that includes the printed speaker (`φήσομεν`, `ἐδοκοῦμεν
ἀπολογεῖσθαι λέγοντες`) is self-staging — this follows directly from the rule's
"speech staged for the printed speaker themselves" clause and changes no prior
record in any dialogue.

Nothing in this receipt changes a `review_status`: no Republic ledger exists
yet. This is the pre-build scope adjudication the Wave 2 launch directive
requires before extraction begins.

## Per-locus rulings

Census loci re-checked, plus the loci the `{q}`-marker maps surfaced adjacent to
them. "IN" means the locus yields at least one record when the ledger is built;
"OUT" means it yields none. Offsets give the `{q}`/`{/q}` marker positions.

### 332c — IN, unresolved (census: no → reversed)

`ὥσπερ ἂν εἴ τις ἔροιτο·` stages a bounded `{q}` question to Simonides from an
indefinite questioner. Depth 3 inside Socrates' depth-2 narrated turn. Owner
indefinite `τις` → record written, `unresolved`. Mood was the census's only
ground for exclusion; mood is no longer the test.

### 337b–c — IN, unresolved (census: no → reversed)

Two `{q}`-bounded staged utterances (hypothetical questioner about twelve, and
the staged answer refusals). Both licensed by staging constructions below the
printed speaker; owners hypothetical/indefinite → `unresolved`.

### 365c–366a objections — IN, unresolved (census: no → reversed)

Inside Adeimantus' depth-2 speech:

- `[75537, 75597)` `{q} ἀλλὰ γάρ, φησί τις, οὐ ῥᾴδιον… {/q}` — indefinite
  `φησί τις` → IN, unresolved.
- `[75948, 76005)` `{q} ἀλλὰ δὴ θεοὺς οὔτε λανθάνειν… {/q}` — continuation of
  the same staged objector's sequence (no fresh staging verb; the licence is the
  enclosing `φησί τις … φήσει` exchange). IN, unresolved; the build pass must
  cite the sequence's staging construction honestly.
- `[76672, 76758)` `{q} ἀλλὰ γὰρ ἐν Ἅιδου δίκην δώσομεν… {/q}` followed by
  `ἀλλ', ὦ φίλε, φήσει λογιζόμενος` — future `φήσει`, indefinite reasoner →
  IN, unresolved.
- `[75243, 75257)` `{q} τὸ δοκεῖν {/q}` — OUT. A two-word quoted phrase from
  the σοφοί (adjacent to the `{quote}` Simonides verse), not a bounded
  transmitted turn. Quoted-phrase exclusion.
- `φήσομεν` spans in this stretch — OUT, self-staging (includes the printed
  speaker).
- All `{quote}…{/quote}` verse citations — OUT per the Phaedo 94d precedent.

### 366e–367a long addresses — OUT (no record)

`[78013, 78550)` `{q} ὦ θαυμάσιε, πάντων ὑμῶν, ὅσοι ἐπαινέται φατὲ
δικαιοσύνης… {/q}` and `[78562, 78767)` `{q} εἰ γὰρ οὕτως ἐλέγετο ἐξ ἀρχῆς…
{/q}`. The staging construction (ending at 78012) is `…ὅθενπερ ἅπας ὁ λόγος
οὗτος ὥρμησεν καὶ τῷδε καὶ ἐμοὶ πρὸς σέ, ὦ Σώκρατες, εἰπεῖν, ὅτι {q}` — the
speech is staged for **Glaucon and Adeimantus**, and Adeimantus is the printed
speaker delivering it. First-person staging including the printed speaker =
self-staging → no record. The closing frame (`{p} ταῦτα, ὦ Σώκρατες, ἴσως δὲ
καὶ ἔτι τούτων πλείω Θρασύμαχός τε καὶ ἄλλος πού τις … λέγοιεν ἄν`) attributes
the *content* to Thrasymachus and others counterfactually but stages no bounded
speech for them.

### 383b Thetis — OUT (census: no → affirmed, corrected grounds)

The Thetis speech is an Aeschylus `{quote}…{/quote}` verse citation inside
Socrates' own argument. Phaedo 94d precedent: verse cited within the speaker's
argument is not a transmitted turn. The census reached "no" on mood grounds;
the exclusion survives on citation grounds.

### 392e, 393c–394a — OUT (census: no → affirmed)

392e: `ὁ ποιητής φησι` + accusative-and-infinitive indirect summary — no bounded
direct speech. 393c–394a: Socrates' own `ἄνευ μέτρου ἁπλῆ διήγησις`
demonstration is his paraphrase in his own voice, explicitly marked as such —
no record.

### 414d–415c noble lie — OUT (census: no → affirmed, corrected grounds)

`φήσομεν` self-staging; no `{q}` bounds; the tale is delivered as the printed
speaker's own proposal of what "we shall tell" — includes the printed speaker.

### 420d–421a — OUT (no record)

The objector is reported indirectly (`προσελθών τις ἔψεγε λέγων ὅτι` with no
`{q}` bounds — indirect construction). The two `{q}` replies are staged by
`μετρίως ἂν ἐδοκοῦμεν πρὸς αὐτὸν ἀπολογεῖσθαι λέγοντες·` — "we", including the
printed speaker → self-staging.

### 422d (census locus "422e") — IN, unresolved (census: no → reversed)

`τί δ' ἂν πρεσβείαν πέμψαντες … εἴπωσιν, ὅτι {q} ἡμεῖς μὲν οὐδὲν χρυσίῳ …
ἔχετε τὰ τῶν ἑτέρων; {/q}` — hypothetical envoys, a third-person collective
that does not include the printed speaker → record written, `unresolved`.
Note the bounded span sits at Stephanus 422d, not 422e.

### 453b–c — IN, unresolved (census: no → reversed)

`λέγωμεν δὴ ὑπὲρ αὐτῶν ὅτι {q} ὦ Σώκρατές τε καὶ Γλαύκων … {/q}` explicitly
voices the imagined disputants — a third-party collective spoken *for*, not a
"we" that includes the speaker (the span addresses Socrates and Glaucon by
name). FIVE `{q}` spans in the disputants' voice follow in sequence, answered
by unlabelled `{p}` replies (`ὡμολογήσαμεν οἶμαι…`, `πῶς δ' οὐ διαφέρει;`,
`τί μήν;`) closing with `ἕξεις τι, ὦ θαυμάσιε, πρὸς ταῦτ' ἀπολογεῖσθαι;`.
The disputants' spans are IN, unresolved. The unlabelled replies between them
are the printed speaker's own staged answers to himself — self-staging, part of
the parent turn, no records. The real exchange resumes with `ἔφη / ἦν δ' ἐγώ,
ὦ Γλαύκων`.

### 479a — OUT (no record)

`{q} τούτων γὰρ δή, ὦ ἄριστε, φήσομεν, …` — the parenthetical `φήσομεν` inside
the span stages it for "we" including the printed speaker → self-staging.

### 525e–526a — IN, unresolved (census: no → reversed)

`εἴ τις ἔροιτο αὐτούς· {q} ὦ θαυμάσιοι, περὶ ποίων ἀριθμῶν διαλέγεσθε…
{/q} τί ἂν οἴει αὐτοὺς ἀποκρίνασθαι;` — exact structural parallel to 332c:
indefinite staged questioner → IN, unresolved. (The imagined *answer* is
solicited but not delivered as bounded speech — no second record.)

### 556d–e — IN, unresolved (census: no → reversed)

`ἄλλον ἄλλῳ παραγγέλλειν, ὅταν ἰδίᾳ συγγίγνωνται, ὅτι {q} ἇνδρες ἡμέτεροι·
εἰσὶ γὰρ οὐδέν; {/q}` — the poor as a staged collective not including the
printed speaker → IN, unresolved.

### Er, 614b–621b — census "yes" CONFIRMED but narrowed

Er's tale is transmitted in accusative-and-infinitive indirect discourse
throughout — `ἔφη δέ … τὴν ψυχὴν πορεύεσθαι`, `καθῆσθαι`, `κελεύειν`, through
to `ἰδεῖν ἕωθεν αὑτὸν κείμενον ἐπὶ τῇ πυρᾷ` at the close. A named subject
transmitting *indirect* discourse yields no bounded transmitted turn, so **the
tale as a whole forms no record for Er**. The in-scope material is the bounded
direct speech inside the indirect frame:

- `[544891, 544905)` `{q} οὐχ ἥκει, {/q}` + `[544917, 545375)` `{q} οὐδ' ἂν
  ἥξει δεῦρο. ἐθεασάμεθα γάρ… {/q}` — licensed by `ἔφη οὖν τὸν ἐρωτώμενον
  εἰπεῖν` (615d): the questioned soul answers about Ardiaeus. Owner
  `τὸν ἐρωτώμενον`, an unnamed soul → IN, unresolved. The `φάναι` between the
  two `{q}` spans is parent narration (edition boundary rule: narration between
  closed and reopened quotes belongs to the parent).
- `[545380, 545759)` `{q} ἐνταῦθα δὴ ἄνδρες, ἔφη, ἄγριοι… {/q}` — the same
  soul's narration continues (first-person `ἐθεασάμεθα` sequence carries on;
  the interior `ἔφη` is the transmitting inquit printed inside the edition's
  quotation). IN, unresolved (same unnamed owner). After the close, the text
  returns to a.c.i. (`τοῦτον ὑπερβάλλειν…`) — parent frame, no record.
- `[549295, 549636)` `{q} ἀνάγκης θυγατρὸς κόρης Λαχέσεως λόγος. Ψυχαὶ
  ἐφήμεροι… {/q}` — licensed by `προφήτην οὖν τινα … ἀναβάντα ἐπί τι βῆμα
  ὑψηλὸν εἰπεῖν —` (617d): the prophet's proclamation, closed by `ταῦτα
  εἰπόντα ῥῖψαι`. `προφήτην τινα` is indefinite → IN, unresolved.
- `[552244, 552391)` `{q} καὶ τελευταίῳ ἐπιόντι, ξὺν νῷ ἑλομένῳ… {/q}` —
  the same prophet again, closed by `εἰπόντος δὲ ταῦτα` → IN, unresolved.

Socrates breaks the frame in his own voice at 618b–c (`ἔνθα δή, ὡς ἔοικεν, ὦ
φίλε Γλαύκων…`) and delivers the peroration after the myth (`{p} καὶ οὕτως, ὦ
Γλαύκων, μῦθος ἐσώθη…`) — his own printed-turn material, no records.

### Spot-checks not re-run

328e and 339a–b recap loci were census "no" on recap grounds (`ἔφησθα` recap of
an on-stage turn), which the 2026-08-04 ruling did not touch. Census holding
stands; the build pass will encounter them range-sequentially regardless.

## Consequences for the Wave 2 build

- Census verdict changes: 332c, 337b–c, 365c–366a (three objector spans), 422d,
  453b–c (five disputant spans), 525e–526a, 556d–e move from "no" to
  record-yielding; all yield `unresolved` records (indefinite or collective
  staged owners), which terminate nesting.
- Er remains record-yielding but via its four interior `{q}` spans only.
- No staged owner discovered in this pass is registerable as a siglum: every IN
  ruling above is `unresolved`. Resolved owners in the Republic ledger will come
  from the printed exchange machinery (ἦν δ' ἐγώ / ἔφη / ἦ δ' ὅς cohorts) and
  the depth-1 frame, not from these loci.
- `{q}…{/q}` in the Republic marks depth-3+ bounded speech candidates (43 pairs
  total); `{quote}…{/quote}` (87 pairs) is verse citation, out of scope. The
  depth-2 layer is unmarked and must be reconstructed from inquit grammar and
  `{p}` breaks.

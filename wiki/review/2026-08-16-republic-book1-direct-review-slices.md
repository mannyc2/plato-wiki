# Republic Book 1 direct-review slices

- date: 2026-08-16
- scope: the Greek source slices `[0,9208)`, `[9208,13383)`, `[13383,14000)`,
  `[14000,19000)`, `[19000,25000)`, `[25000,30000)`, `[30000,35000)`,
  `[35000,40000)`, `[40000,45000)`,
  `[45000,50000)`, `[50000,55000)`, and `[55000,60000)` inside Book 1 of
  `turn_republic_0001`
- source: `raw/plato/greek/republic.txt`, SHA-256
  `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`

## Decisions

### Lead slice [0,9208)

Greek-only audit retained all thirty-five intersecting rows
(`voice_republic_0001` through `0035`) without a source-proven correction.
The opening child, Glaucon, Polemarchus, Adeimantus, and first-person Socratic
formulas retain their direct Greek authority; the bare 327c–331d replies
(`0007`, `0008`, `0009`, `0011`, `0013`, and `0034`) remain unresolved rather
than acquiring an owner by alternation or carry-forward.

The Cephalus sequence keeps its bounded Socrates–Cephalus reviewed contexts,
while the Sophocles anecdote retains its indefinite questioner as unresolved
and its separately antecedent-cited Sophocles reply. No child is added for the
328e poetic tag, the Themistocles indirect ἀπεκρίνατο ὅτι at 330a, or the
Pindar quotation inside Cephalus' argument at 331a–b: none transmits a new
direct owner below the current speaker. `0035` remains Polemarchus' directly
named interruption.

### Gap [13383,14000)

The Greek audit found full coverage by `voice_republic_0100` through `0110`;
no new reported turn is transmitted. All eleven intersecting spans stay
unresolved. The surrounding 333c exchange's reciprocal named addresses
`ὦ Πολέμαρχε` and `ὦ Σώκρατες` supply the local `ΣΩ.`/`ΠΟΛ.` candidate set,
but the individual bare questions and responses contain no owner-bearing
formula; `ὦ φίλε` in `0110` remains unnamed. Their old reasons' alternation
implication was removed rather than being allowed to select a terminal owner.

Five bare Socrates–Polemarchus turns now use `reviewed_attribution` rather
than the previously rejected anaphoric shortcut: `voice_republic_0059`,
`0068`, `0085`, `0094`, and `0099`. The context begins with Polemarchus
explicitly taking over the argument and Socrates reopening it, and each target
has its own direct vocative that names the addressee. The decision is limited
to that source-bounded dyad; it does not propagate ownership to adjacent
cue-less replies.

Added `voice_republic_0490` for the formerly uncovered `πάνυ μὲν οὖν.` at
335c `[17609,17622)`. The bounded assent is preserved as unresolved because
the Greek gives no owner-bearing formula.

Three later rows now carry their own explicit Greek authority:

- `0184`: the pronoun-led formula resumes the named narrative antecedent
  `ὁ Θρασύμαχος`, not a preceding reporting formula.
- `0185`: the span begins at its first-person `καὶ εἶπον ὑποτρέμων` formula,
  so the nested Socratic turn has an in-span repeat-owner cue.
- `0186`: the former vocative antecedent was removed. The replacement cites the
  continuous named-Thrasymachus → pronoun narrative chain; it is not a claim
  that Thrasymachus merely spoke before Socrates.

The later direct review removes two previous carry-forward errors:

- `0245` and `0247` are retained as unresolved. Their bare third-person
  formulas do not name Thrasymachus, and their former contexts supplied that
  owner only by reaching past an unresolved intervening response.
- `0279` remains a bounded Socrates–Thrasymachus discourse resolution, but its
  context now begins at the actual named handoff `[34287,34299)` and includes
  both the local question and Socrates' closing first-person response.

Two adjacent direct-formula repairs close the next source slice:

- `0281` is the long Thrasymachus turn closed by the immediately following
  named formula `ταῦτα εἰπὼν ὁ Θρασύμαχος`.
- `0282` begins at Socrates' first-person formula `καὶ δὴ ἔγωγε … εἶπον`, so
  the nested repeat-owner cue is in-span rather than inferred from context.

Two 40–45k decisions are bounded by their own Greek speech machinery:

- `0306` is Socrates' direct utterance: its in-span first-person
  `ἔγωγε … ἔλεγον` and address to Θρασύμαχος select the narrator rather than
  carrying an owner from the preceding bare reply.
- `0311` is Glaucon's immediate first-person answer to Socrates' explicitly
  Γλαύκων-addressed question. Its context stops before Socrates' next marked
  question.

Two 45–50k Socratic questions have their own named addressee within bounded
local exchanges:

- `0332` directly addresses Θρασύμαχος and is followed immediately by his
  answer; the context begins at the local first-person Socratic opening and
  ends before the next first-person formula.
- `0360` likewise directly addresses Θρασύμαχος and receives an immediate
  `ἔγωγε` answer. Its context includes the preceding first-person Socratic
  opening but does not treat either intervening bare reply as an owner cue.

Two 50–55k Socratic turns are likewise locally bounded:

- `0413` directly addresses Θρασύμαχος and receives the immediate `ἔστω`
  response within the preceding first-person-opened dyad.
- `0427` directly addresses Θρασύμαχος; its immediate response has first-person
  `ἔγωγέ` and `σοι` toward Socrates, so the dyad is locally explicit.

Two 55–60k Socratic turns retain their own named evidence:

- `0473` directly addresses Θρασύμαχος and has an immediate `ἀδύνατον`
  response within the first-person-opened dyad.
- `0487` directly addresses Θρασύμαχος, while the immediate response directly
  addresses Socrates; the reciprocal pair fixes the speakers locally.

### Middle slice [25000,30000)

Greek-only audit retained all thirty-five intersecting rows (`0209`–`0243`)
without an owner, boundary, or coverage change. Greek formula or bounded
exchange rows `0212`–`0213`, `0216`, `0230`–`0232`, and `0236`–`0243` keep
their existing authority shapes. Cue-less or addressee-only rows `0209`–`0211`,
`0214`–`0215`, `0217`–`0229`, and `0233`–`0235` stay unresolved: bare
question/answer or third-person formula forms, `ὦ βέλτιστε`, and a vocative
that identifies only an addressee do not select a terminal owner by alternation
or carry-forward.

## Review state

The direct Greek review now covers the full `[0,59067)` Book 1 outer turn.
Its atomic acceptance is recorded in
`2026-08-17-republic-book1-reported-turn-acceptance.md`; that acceptance
compiles a standalone voice index only. It neither creates a join nor activates
a cutover.

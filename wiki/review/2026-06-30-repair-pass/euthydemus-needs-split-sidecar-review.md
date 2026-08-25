# Euthydemus needs_split sidecar repair review

Scope: `obs_euthydemus_0001`, `0006`, `0013`, `0014`, `0020`, `0022`, `0028`, `0032`, `0042`, `0044`, `0055`.

Method: read `wiki/observations/euthydemus.md`; resolved candidate spans with `resolveSourceSpan("euthydemus", span)` against `raw/plato/greek/euthydemus.txt`; no translation files or provider-backed tools used.

## Recommendations

### obs_euthydemus_0001

Accept with narrowing and prose edits.

- Change span to `271a`.
- `source_ref`: `stephanus_span: 271a`, `start_char: 0`, `end_char: 356`, `text_sha256: 4e168e6251df022aa6966a99edb588d404dda6af174a66a0897d9b540a28a2c8`.
- Add local `greek_terms`, e.g. `["χθὲς", "Λυκείῳ", "ὄχλος", "σαφές"]`.
- Tighten observation/textual_basis to the prior-conversation frame: Crito asks about the previous-day Lyceum conversation, says the crowd prevented clear hearing, and relies on Socrates' report. Drop dependence on the 271b character identifications.
- Set `review_status: accepted`.

### obs_euthydemus_0006

Accept only with prose limits tightened; keep current span.

- Keep `271c-271d`, `start_char: 794`, `end_char: 1421`, `text_sha256: 068b4a7aa50552e5a10ced06946d0d2b6443b6147b593c643a6920106b271677`.
- Keep terms `["παγκρατιασταί", "παμμάχω", "μάχῃ"]`.
- Edit observation/textual_basis to say this passage introduces the brothers as pancratiasts/all-fighters and contrasts bodily-only fighters with the brothers' combat skill.
- Remove the claim that this span already establishes verbal battle; that belongs to `272a-272b` and is already covered by accepted `obs_euthydemus_0008`.
- Set `review_status: accepted`.

### obs_euthydemus_0013

Accept with narrowing.

- Change span to `273d`.
- `source_ref`: `stephanus_span: 273d`, `start_char: 4890`, `end_char: 5328`, `text_sha256: 9ae6245da657e4f7ff2fba363a4f2348ba5a59ca1d961326b124ed976187cc38`.
- Use terms such as `["σπουδάζομεν", "παρέργοις", "πάρεργα", "ἀρετήν", "παραδοῦναι"]`.
- Current observation is basically sound once all references to `273e` are removed. The virtue-teaching claim is still inside `273d`.
- Set `review_status: accepted`.

### obs_euthydemus_0014

Accept with narrowing and term cleanup.

- Change span to `273e`.
- `source_ref`: `stephanus_span: 273e`, `start_char: 5328`, `end_char: 5729`, `text_sha256: d1c8e2514428abb241058b509c2ea49b98643d79317de8bcdb55cc56968713a1`.
- Replace `greek_terms` with source-present terms such as `["ὦ Ζεῦ", "ἕρμαιον", "ὥσπερ θεώ"]`; remove the non-source accent variant `ἑρμαῖον`.
- Current observation/textual_basis are sound after the span change.
- Set `review_status: accepted`.

### obs_euthydemus_0020

Accept with narrowing and malformed-term cleanup.

- Change span to `273a`.
- `source_ref`: `stephanus_span: 273a`, `start_char: 3524`, `end_char: 3972`, `text_sha256: 32b5327ae2a1c232e2c2650fc8f0130ce1d724ba10187dc7d8149fbd8a19aadb`.
- Use inline `greek_terms`, e.g. `["Εὐθύδημος", "Διονυσόδωρος", "Κλεινίας", "Κτήσιππος", "Παιανιεύς", "ὑβριστής"]`.
- The current multiline list is parsed by the repo helper as a malformed quote-bullet value (`- "Παιανιεύς`). Inline terms avoid that parser failure.
- Tighten textual_basis to 273a only: the brothers enter with students; Cleinias enters; Ctesippus is named with deme and character sketch. Drop 272e/daimonion material.
- Set `review_status: accepted`.

### obs_euthydemus_0022

Reject.

- The record is duplicative and weaker than existing local records: `obs_euthydemus_0020` covers the entrance/naming at 273a, and accepted `obs_euthydemus_0023` covers the seating arrangement at 273b-273c.
- The claim that the segment "names Socrates" is not source-backed in 273b-273c; he is the narrator/speaker but not named there.
- No replacement needed unless the main thread wants an explicitly redundant prosopography record, which would not be durable.

### obs_euthydemus_0028

Accept with widened span; current span cuts off required evidence.

- Change span to `275a-275b`.
- `source_ref`: `stephanus_span: 275a-275b`, `start_char: 7878`, `end_char: 8813`, `text_sha256: d2a7d852a984808450eea1f7777d8e8286f299068af7027509014151a67de52d`.
- Keep/normalize terms `["Ἀξιόχου", "Ἀλκιβιάδου", "αὐτανεψιός", "Κλεινίας"]`.
- Edit observation/textual_basis to say Socrates identifies the youth by kinship and name across 275a-275b. Current `274e-275a` stops at `αὐτανεψιός` and does not include `Κλεινίας` or the present Alcibiades clause.
- Set `review_status: accepted`.

### obs_euthydemus_0032

Accept with narrowing and malformed-term cleanup.

- Change span to `275e`.
- `source_ref`: `stephanus_span: 275e`, `start_char: 9571`, `end_char: 9968`, `text_sha256: ce4738b08d13218bf2f160c5e98de01752b3282f5aa03f565fb0f1ccfe9f5ddc`.
- Use inline `greek_terms`, e.g. `["προλέγω", "ἐξελεγχθήσεται", "μειδιάσας"]`.
- The current multiline list is parsed as a malformed bullet value (`- προλέγω`) and drops the second term.
- Current observation is sound after removing dependence on 275d setup.
- Set `review_status: accepted`.

### obs_euthydemus_0042

Accept as a widened replacement so the reversal claim is source-backed.

- Change span to `276a-276c`.
- `source_ref`: `stephanus_span: 276a-276c`, `start_char: 9968`, `end_char: 11126`, `text_sha256: 8b0a0a282847d3ba42b6d51fbf35d29dec48342951be572f428dea946e57fcd3`.
- Add terms such as `["σοφοί", "ἀμαθεῖς", "μανθάνουσιν", "ἀποστοματίζοι", "οὐκ εὖ"]`.
- Edit observation/textual_basis to cover the two-step reversal: Euthydemus first gets the conclusion that the ignorant learn; Dionysodorus immediately uses dictation to get the conclusion that the wise learn and says Cleinias answered Euthydemus badly.
- Drop 276d audience reaction and dance-simile material.
- Set `review_status: accepted`.

### obs_euthydemus_0044

Accept with narrowing and label/prose correction.

- Change span to `276d`.
- `source_ref`: `stephanus_span: 276d`, `start_char: 11126`, `end_char: 11607`, `text_sha256: b1c61d6e082c7b23e07a732d77cccc3dc56c7aba4295ad2a3c478f9b0f709aef`.
- Add terms such as `["ὀρχησταί", "διπλᾶ", "ἔστρεφε", "ἐρωτήματα"]`.
- Change `feature_label`; current `athletic_combat_mapped_to_sophistic_skill` is wrong for a dance simile. Suggested label: `dance_simile_for_eristic_questioning` in `craft_analogy`.
- Remove the Dionysodorus-whisper sentence from observation/textual_basis unless the span is widened to `276d-276e`; for this record, the durable local repair is just the dancer/double-turn simile.
- Set `review_status: accepted`.

### obs_euthydemus_0055

Accept with span correction and malformed-term cleanup.

- Change span to `277a-277b`.
- `source_ref`: `stephanus_span: 277a-277b`, `start_char: 11996`, `end_char: 12928`, `text_sha256: 86db1a07373a329f9270b8f560e537ef00fcf96e449bbb3d14db8dd7e9241823`.
- Use inline `greek_terms`, e.g. `["ἀποστοματίζῃ", "γράμματα", "ἐπίστασαι", "μανθάνεις"]`.
- The current `276e-277a` span includes setup but cuts off the conclusion at 277b; it is not enough for the trap as written. The multiline list is also parsed as malformed (`- ἀποστοματίζῃ`).
- Edit textual_basis to focus on the dictation/letters equivocation and the conclusion that Cleinias learns what he knows; avoid relying on 276e unless the replacement is widened to `276e-277b`.
- Set `review_status: accepted`.

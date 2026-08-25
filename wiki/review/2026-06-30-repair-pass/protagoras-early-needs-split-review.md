# Protagoras early needs_split sidecar review

Scope: `obs_protagoras_0016`, `0020`, `0021`, `0031`, `0038`, `0041`, `0042`, `0049`, `0050`, `0063`, `0076`, `0080`, `0085`, `0086`, `0088`.

Method: read `wiki/observations/protagoras.md`; resolved current and candidate spans with `resolveSourceSpan("protagoras", span)` against `raw/plato/greek/protagoras.txt`; no translations or provider-backed tools used.

## Recommendations

### obs_protagoras_0016

Accept with narrowing and prose edits.

- Change span to `313c`.
- `source_ref`: `stephanus_span: 313c`, `start_char: 8673`, `end_char: 9168`, `text_sha256: b429a8aad64bfe4fa6e32305d8e3ff46a30749ead7b48f82195d776cbec1f7c5`.
- Add terms such as `["ἔμπορος", "κάπηλος", "ψυχὴ", "μαθήμασιν", "ἐξαπατήσῃ"]`.
- Tighten observation/textual_basis to the sophist-as-merchant/retailer analogy and the seller-praise deception warning. Drop dependence on the preceding consultation material in 313b.
- Set `review_status: accepted`.

### obs_protagoras_0020

Accept with narrowing.

- Change span to `312e`.
- `source_ref`: `stephanus_span: 312e`, `start_char: 7458`, `end_char: 7774`, `text_sha256: 72b866289cdf6ec9b3e1a31f40650d3eeadb2a1486a3dc6323148a22c4203337`.
- Keep terms `["σοφιστὴς", "ἐπιστήμων", "μαθητὴν"]`.
- Edit observation/textual_basis to cover only Socrates' expertise-domain question and Hippocrates' inability to answer. Remove the 313a soul-risk transition from this record.
- Set `review_status: accepted`.

### obs_protagoras_0021

Accept with narrowing and small prose edits.

- Change span to `313a`.
- `source_ref`: `stephanus_span: 313a`, `start_char: 7774`, `end_char: 8277`, `text_sha256: ffdaa7fd7c3263321bf5ada3769f136a61e5b88334749dbd771f90ef68e25852`.
- Keep/add terms `["κίνδυνον", "ψυχήν", "σῶμα", "ἐπιτρέπειν", "πλείονος"]`.
- Keep the soul/body value asymmetry, but phrase the consultation contrast locally: body-risk would prompt extended deliberation and counsel; the soul is treated as the greater concern.
- Set `review_status: accepted`.

### obs_protagoras_0031

Accept with narrowing and prose cleanup.

- Change span to `312b`.
- `source_ref`: `stephanus_span: 312b`, `start_char: 6063`, `end_char: 6476`, `text_sha256: 071262c9cbbacb92b0300cdf9e3994fd68af0b41824e4caef4d6da1c8d118e0d`.
- Use terms such as `["ψυχὴν", "παρασχεῖν", "ἐπὶ τέχνῃ", "ἐπὶ παιδείᾳ"]`.
- Edit observation/textual_basis to say Socrates pivots from craft-vs-paideia to the warning that Hippocrates is about to hand over his own soul. Remove "to a sophist" unless the span is widened, because `312b` ends before the recipient is named.
- Set `review_status: accepted`.

### obs_protagoras_0038

Split into two accepted replacements.

- Replacement A: named sophist presence at `314c`.
  - `source_ref`: `stephanus_span: 314c`, `start_char: 10770`, `end_char: 11201`, `text_sha256: 162394bf47859902b60f0a35560c18725d0489790d061f1cd46886131724f084`.
  - Terms: `["Ἱππίας", "Πρόδικον", "ἄλλοι πολλοὶ", "σοφοί"]`.
  - Keep `prosopography` / `named_cast_entry_or_catalog`.
- Replacement B: doorway and doorkeeper threshold scene at `314c-314d`.
  - `source_ref`: `stephanus_span: 314c-314d`, `start_char: 10770`, `end_char: 11667`, `text_sha256: 3f21b0842dd8f311c5c11010ea571468a1ab4954f1f059cceceefb98d035d329`.
  - Terms: `["προθύρῳ", "διελεγόμεθα", "θυρωρός", "εὐνοῦχος", "σοφισταί"]`.
  - Use a threshold/doorway setup label rather than a named-cast label.
- Current record mixes cast catalog and doorway action; set replacements to `accepted`.

### obs_protagoras_0041

Accept with specific prose and term edits; keep current span.

- Keep `315b-315c`, `start_char: 12401`, `end_char: 13327`, `text_sha256: f5b151aef5a31d9b5c9da1345d9b1f53769c8a4dd9eac3a340d86d0415b75bc4`.
- Add terms such as `["τὸν δὲ μετ’ εἰσενόησα", "καὶ Τάνταλόν", "εἰσεῖδον"]`.
- The two Homeric quotation tags are source-backed and function as scene-catalog transitions. Keep limits that they are narrative devices, not argumentative authorities.
- Set `review_status: accepted`.

### obs_protagoras_0042

Accept with narrowing and remove the cross-span contrast.

- Change span to `315d`.
- `source_ref`: `stephanus_span: 315d`, `start_char: 13327`, `end_char: 13775`, `text_sha256: 27bbccfd88a3a208e970486bb9f90191fc297d0dfa983a95f95d705bda3a5822`.
- Keep/add terms `["Πρόδικος", "κατέκειτο", "ἐγκεκαλυμμένος", "κῳδίοις", "στρώμασιν"]`.
- Observation should record only Prodicus' placement/reclining/coverings and the converted room context. Drop the contrast with Protagoras' peripatetic presentation.
- Set `review_status: accepted`.

### obs_protagoras_0049

Accept with narrowing and label/prose cleanup.

- Change span to `316b`.
- `source_ref`: `stephanus_span: 316b`, `start_char: 14541`, `end_char: 14989`, `text_sha256: 343fe459453d3d3f626108b4894eba8ed6fa7459570518d66b5cf7f772282f30`.
- Add terms such as `["Ἱπποκράτης", "Ἀπολλοδώρου", "ἐπιχωρίων", "εὐδαίμονος", "ἐνάμιλλος"]`.
- Replace the over-specific `suppliant_recommendation_speech` label with a recommendation-preamble label unless the main pass has a better existing target. The source backs a formal introduction of Hippocrates' local status, patronymic, household, and natural ability.
- Set `review_status: accepted`.

### obs_protagoras_0050

Accept current span with Greek-term cleanup.

- Keep `316c`, `start_char: 14989`, `end_char: 15483`, `text_sha256: 46ffe3902e9c2808f58521c908e5ce670bc4521498deb6b981ee4ed9f50e08fa`.
- Replace romanized `greek_terms` (`xenos`, `sunousia`, `beltious`) with source Greek, e.g. `["ξένον", "πόλεις", "πείθοντα", "συνουσίας", "οἰκείων", "ὀθνείων", "βελτίους"]`.
- Update textual_basis to avoid romanized terms. Current observation is otherwise local and source-backed.
- Set `review_status: accepted`.

### obs_protagoras_0063

Accept with narrowing and term cleanup.

- Change span to `319b`.
- `source_ref`: `stephanus_span: 319b`, `start_char: 20904`, `end_char: 21366`, `text_sha256: 8b60986a23c7dc56643a2c2a78ac8d5f0abec93a63038435c29edd78c2584d29`.
- Add terms such as `["ἐκκλησίαν", "οἰκοδόμους", "συμβούλους", "ναυπηγούς"]`.
- Keep only the craft-recognition premise: Athenians summon builders for building matters and shipwrights for shipbuilding matters. Do not claim this span already completes the political-virtue application.
- Set `review_status: accepted`.

### obs_protagoras_0076

Split into two accepted replacements.

- Replacement A: Pericles and sons at `319e-320a`.
  - Keep current `source_ref`: `start_char: 22227`, `end_char: 22875`, `text_sha256: 542f21fdb233b034a2d3c319b26d3b6aefba16ae3fd18c622a5c51f657c8c8d3`.
  - Terms: `["παραδιδόναι", "Περικλῆς", "παιδεύει", "ἄφετοι", "αὐτόματοι"]`.
  - Observation: the best citizens cannot transmit their virtue; Pericles educates his sons in teacher-led subjects but not in his own wisdom.
- Replacement B: Cleinias and broader counterexample close at `320a-320b`.
  - `source_ref`: `stephanus_span: 320a-320b`, `start_char: 22473`, `end_char: 23338`, `text_sha256: 14b0fae7312854a6150141cf904ac01ae11ccd5525cec7d01198f05daecfc2dd`.
  - Terms: `["Κλεινίαν", "Ἀλκιβιάδου", "Ἀρίφρονος", "ἐπαίδευε", "βελτίω"]`.
  - Observation: Pericles' guardianship/education of Cleinias fails as a further case, followed by the general claim that many good men have made no one better.
- Current record overclaims Cleinias from a span that cuts the example off before its conclusion.

### obs_protagoras_0080

Accept with widened/narrowed replacement span.

- Change span to `321b-321c`.
- `source_ref`: `stephanus_span: 321b-321c`, `start_char: 24826`, `end_char: 25685`, `text_sha256: 6c81dd6b9768fb7d330b2f38f8812968958d9c979d77b74a78e58e10bf6a2e40`.
- Keep/add terms `["Ἐπιμηθεὺς", "οὐ πάνυ τι σοφὸς", "ἄλογα", "ἀκόσμητον", "γυμνόν", "ἀνυπόδητον", "ἄοπλον"]`.
- Current `321a-321b` includes animal provisioning and only begins the Epimetheus failure; the human naked/unshod/unarmed evidence is in `321c`.
- Set `review_status: accepted`.

### obs_protagoras_0085

Accept with widened span and prose edits.

- Change span to `322c-322d`.
- `source_ref`: `stephanus_span: 322c-322d`, `start_char: 27179`, `end_char: 28048`, `text_sha256: 93622166e4298c4e8b33d384bd4a1fec38cf7ebc690ca534da26fe3840a9cdf1`.
- Keep/add terms `["αἰδῶ", "δίκην", "τέχναι", "ἰατρικὴν", "δημιουργοί", "ἐπὶ πάντας", "μετεχόντων"]`.
- If the label remains `political_virtue_distributed_unlike_crafts`, the Zeus answer at 322d is required. Edit limits to say the record does not assess the myth's validity, rather than saying it does not address Zeus's answer.
- Set `review_status: accepted`.

### obs_protagoras_0086

Accept with narrowing to the thesis announcement.

- Change span to `323c`.
- `source_ref`: `stephanus_span: 323c`, `start_char: 29087`, `end_char: 29515`, `text_sha256: e83620cb525e44f3b3e2a6e6f08a546b92125047f3a56f125f1fcd312332e62e`.
- Add terms such as `["οὐ φύσει", "αὐτομάτου", "διδακτόν", "ἐπιμελείας"]`.
- Keep `not_by_nature`: Protagoras announces that political virtue is not by nature or chance but teachable and acquired through care. Move the behavioral criterion to `obs_protagoras_0088`.
- Set `review_status: accepted`.

### obs_protagoras_0088

Accept only after span and label correction.

- Change span to `323d-323e`.
- `source_ref`: `stephanus_span: 323d-323e`, `start_char: 29515`, `end_char: 30105`, `text_sha256: c2c3625ab028d5daa3db97b7535edec4add9dd5dc5e23f07e84e62e3cff8011e`.
- Add terms such as `["φύσει", "τύχῃ", "ἐλεοῦσιν", "ἐπιμελείας", "ἀσκήσεως", "διδαχῆς", "κολάσεις", "νουθετήσεις"]`.
- Replace `craft_analogy` / `expert_craft_analogy`; this is not an explicit craft analogy. Recommended target: reuse `craft_analogy` / `teachability_inferred_from_practice` only if the normalization pass accepts that label's broader practice-based function; otherwise create a criterion/practice label outside `expert_craft_analogy`.
- Observation/textual_basis should say the response pattern distinguishes natural/chance defects from deficiencies in goods thought to arise by care, practice, and teaching.
- Set `review_status: accepted`.

## Cleanup flags

- No target has a literal term value beginning with a bullet character, but several use multiline `greek_terms`; keep them only if the validator accepts them. Inline arrays are safer for mechanical parsers used in sidecar repair notes.
- `obs_protagoras_0050` has romanized `greek_terms`; replace with Greek script.
- `obs_protagoras_0031`, `0063`, `0086`, and `0088` have romanized Greek in prose; replace with short Greek terms in `greek_terms` and English descriptions in prose fields.
- I did not see malformed placeholder prose such as TODO/TBD in the target records.

# Timaeus needs_split repair pilot - subagent A

Scope: `obs_timaeus_0037`, `obs_timaeus_0038`, `obs_timaeus_0039`,
`obs_timaeus_0040`, `obs_timaeus_0052`.

Method: inspected the current Timaeus records and resolved source spans from
`raw/plato/greek/timaeus.txt` with `resolveSourceSpan()` in
`packages/harness/src/source.ts`. No translations, Pioneer, provider-backed
review queues, or external model-backed harness runs were used. Greek passages
are not copied here; only source refs and short `greek_terms` are cited.

## obs_timaeus_0037

- Current: `22e-23a`;
  `myth_demarcation/cyclical_cataclysm_as_recording_mechanism`.
- Recommendation: explicit follow-up, not one accepted narrowed record. The
  current record combines two separable things: the water/topography rationale
  for Egyptian preservation and the later celestial-stream reset of Greek
  writing/civic equipment. It also cites `τοὺς ἀγραμμάτους` from `23a`, but the
  clause is completed only at `23b` with the survivors being left unlettered
  and uneducated.
- Suggested split A source ref: `22d-22e`
  (`start=10737`, `end=11552`,
  `sha=82e9893e810577fc0500d5f9614ec3d7ffcaf5b97fa6690a4d84ff7d5a78acae`).
  Use this only if preserving the Nile/geography rationale.
- Suggested split A label: change to
  `frame_depth/geographic_preservation_rationale`.
- Suggested split A guidance: observation should say that the priest contrasts
  destructive water effects on Greek cities with Egypt's water pattern and the
  Nile as a preserving condition. Textual basis should stay on the local water
  contrast; limits should exclude temple records, celestial stream, and Atlantis
  historicity. Suggested `greek_terms`: [`Νεῖλος`, `σωτήρ`, `ἄνωθεν`,
  `κάτωθεν`].
- Suggested split B source ref: `23a-23b`
  (`start=11552`, `end=12450`,
  `sha=a6fc9c9893f7585491305e0bd426e46335fc255022e51a5948faaaf8b72321ec`).
  Use this only if preserving the periodic memory-reset claim.
- Suggested split B label: change to
  `frame_depth/post_cataclysm_memory_reset`.
- Suggested split B guidance: observation should say that the priest describes a
  periodic celestial stream coming like a disease upon newly equipped cities and
  leaving Greeks without writing or education, so they begin again as young and
  ignorant of old events. Textual basis should cite the celestial stream,
  disease comparison, and reset consequence; limits should exclude Egyptian
  temple archives except as background and should not assess literal truth.
  Suggested `greek_terms`: [`ῥεῦμα οὐράνιον`, `νόσημα`, `ἀγραμμάτους`,
  `ἀμούσους`, `οἷον νέοι`].
- Out-of-span/removal guidance: do not keep `τοὺς ἀγραμμάτους` as a standalone
  term under `22e-23a`; either widen to `23a-23b` and pair it with the `23b`
  completion, or remove it. Do not keep the current myth-demarcation label for
  either narrowed claim.

## obs_timaeus_0038

- Current: `22e-23a`;
  `frame_depth/reported_ancient_inscriptional_source`.
- Recommendation: replace with one narrower accepted record.
- Source ref: change to `23a`
  (`start=11552`, `end=12008`,
  `sha=854f5916059d8a33c09ec5c9a0e1f3a33f952268a63be8e43208ece02c15c5f1`).
- Label: keep `frame_depth/reported_ancient_inscriptional_source`.
- Proposed `observation`: The priest says that notable or distinguished events
  among Greeks, Egyptians, or elsewhere, insofar as they are known by report,
  have been written from ancient times in Egyptian temples and preserved there.
- Proposed `textual_basis`: At `23a`, the claim links reported knowledge with
  ancient writing in temples and preservation there.
- Proposed `limits`: This records the priest's documentary-source claim. It
  does not trace the whole Atlantis transmission chain, evaluate the claim's
  historicity, or include the Nile/topography and celestial-stream mechanism.
- Proposed `greek_terms`: [`ἀκοῇ ἴσμεν`, `γεγραμμένα ἐκ παλαιοῦ`,
  `ἐν τοῖς ἱεροῖς`, `σεσωσμένα`].
- Out-of-span/removal guidance: no required out-of-span Greek term removal, but
  shorten the existing long copied phrase into the short terms above.

## obs_timaeus_0039

- Current: `22e-23a`; `turn_geometry/asymmetrical_knowledge_claim`.
- Recommendation: reject as an independent record. The supported source content
  is already covered by the proposed `0038` archival-source repair and the
  proposed `0037` memory-reset follow-up. The extra claim that the Greek
  listener cannot contest the priest, and that Critias or the Timaeus audience
  is thereby positioned as dependent, is not stated in the cited span.
- Source ref: do not keep `22e-23a` for this record. A source-bound follow-up
  would have to use `23a-23b`, but it should be handled under the `0037` split B
  recommendation rather than duplicated here.
- Label: do not keep `turn_geometry/asymmetrical_knowledge_claim`; the passage
  does not record turn-taking, procedure control, assent pressure, or another
  turn-geometry function.
- Removal guidance: remove the claims about inability to contest,
  counter-evidence, and extension to Critias or the dialogue audience. Remove
  `τοὺς ἀγραμμάτους` unless a separate `23a-23b` record is created with the
  completing `23b` terms.

## obs_timaeus_0040

- Current: `23b-23c`; `myth_demarcation/myth_logos_boundary`.
- Recommendation: replace with one narrower accepted record.
- Source ref: change to `23b`
  (`start=12008`, `end=12450`,
  `sha=58d0d76af02b9dd3995165a2504f9ead9fec379ffad27fdb4e97a47223b61ac2`).
- Label: keep `myth_demarcation/myth_logos_boundary`.
- Proposed `observation`: The priest marks Solon's recent Greek genealogical
  account as differing little from children's myths.
- Proposed `textual_basis`: At `23b`, the priest identifies the genealogies
  Solon has just recounted and compares them to children's myths, immediately
  pointing to the Greek memory of only one flood despite many earlier ones.
- Proposed `limits`: This records a character's explicit demotion of Greek
  genealogical narrative. It does not assert Plato's endorsement, the truth of
  the priest's alternative account, or the reliability of Egyptian records.
- Proposed `greek_terms`: [`γενεαλογηθέντα`, `παίδων ... μύθων`,
  `ἕνα γῆς κατακλυσμόν`].
- Out-of-span/removal guidance: remove the current textual-basis claim about
  Egyptian written records preserving knowledge; that comes from `23a`, not the
  narrowed `23b` myth/logos boundary.

## obs_timaeus_0052

- Current: `25d-25e`;
  `myth_demarcation/catastrophic_destruction_narrative`.
- Recommendation: replace with one narrower accepted record. The catastrophic
  destruction unit is complete in `25d`; `25e` begins the separate frame
  transition already covered by neighboring accepted records.
- Source ref: change to `25d`
  (`start=16901`, `end=17241`,
  `sha=d1648f5b4dde0d83bd201dacd99e1e67ff65a9760522438edd7c7891da91c2d4`).
- Label: keep `myth_demarcation/catastrophic_destruction_narrative`.
- Proposed `observation`: At `25d`, the Atlantis destruction is narrated as a
  bounded catastrophic event: a hard day and night arrive, the whole Athenian
  fighting force sinks into the earth, Atlantis sinks into the sea and
  disappears, and the sea remains impassable and unexplorable because of mud.
- Proposed `textual_basis`: The sentence is structured around the parallel
  sinking of the Athenian force and Atlantis, then gives the present condition
  of the sea as the consequence.
- Proposed `limits`: This records the bounded destruction narrative at `25d`.
  It does not include the `25e` transmission-frame transition, assess the
  account's historicity, or claim that the whole Atlantis story functions as
  myth in the dialogue.
- Proposed `greek_terms`: [`ἡμέρας καὶ νυκτὸς χαλεπῆς`, `ἔδυ κατὰ γῆς`,
  `δῦσα ἠφανίσθη`, `ἄπορον`, `ἀδιερεύνητον`].
- Out-of-span/removal guidance: no Greek terms need removal, but remove `25e`
  from the source ref and avoid the English phrase "severe weather"; the source
  supports "hard day and night" rather than a weather-specific paraphrase.

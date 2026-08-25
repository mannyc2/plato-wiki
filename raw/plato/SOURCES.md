# Plato Source Provenance

## Upstreams

- Repository: PerseusDL/canonical-greekLit, commit
  `e37eed2e8a5fed710c3ab0d312249c3fb04d77e0` (pinned in
  `scripts/import-plato-greek.py`)
- Corpus path: `data/tlg0059` (Plato), `perseus-grc2` editions
- Import: `scripts/import-plato-greek.py` converts TEI XML to plain text
  with `{NNNx}` Stephanus markers, `{bN}` book markers, and lightweight
  TEI inline tokens (`{q}`, `{pers}`, `{del}`, etc.)
- Repository license: Creative Commons Attribution-ShareAlike 4.0
  International License, confirmed from the pinned repository
  `README.md` (no `LICENSE.md` or `LICENSE` file exists at the pinned
  commit)
- TEI header availability statement: no `<availability>` or `<licence>`
  element found in sampled `perseus-grc2` TEI headers at the pinned commit
  (`tlg001`, `tlg002`, `tlg003`, `tlg004`, `tlg005`, `tlg011`, `tlg024`,
  `tlg027`, `tlg030`, `tlg034`)
- Print source of `perseus-grc2` Plato: Burnet, *Platonis Opera* (OCT),
  public domain; the digital edition carries the upstream repository
  license above unless a specific component states otherwise.
- Eight Greek files (`apology`, `crito`, `euthyphro`, `ion`, `meno`,
  `phaedo`, `republic`, and `symposium`) were copied byte-for-byte on
  2026-06-06 from `jtauber/plato-texts` `raw-text/` at commit
  `3b482c7af8a43444a6e0316f8cb7044a18dbd094`. That repository is licensed
  CC BY-SA 4.0 and describes the files as learner-oriented Greek texts derived
  from sources including Perseus, Diorisis, AGLDT, and Vanessa Gorman. These
  eight files predate this repository's TEI importer and are intentionally not
  represented as importer output.

## Files

| file | upstream work | provenance |
| --- | --- | --- |
| english/apology.txt | tlg0059.tlg002.perseus-eng2 | confirmed (script) |
| english/charmides.txt | tlg0059.tlg018.perseus-eng2 | confirmed (script) |
| english/cratylus.txt | tlg0059.tlg005.perseus-eng2 | confirmed (script) |
| english/critias.txt | tlg0059.tlg032.perseus-eng2 | confirmed (script) |
| english/crito.txt | tlg0059.tlg003.perseus-eng2 | confirmed (script) |
| english/euthydemus.txt | tlg0059.tlg021.perseus-eng2 | confirmed (script) |
| english/euthyphro.txt | tlg0059.tlg001.perseus-eng2 | confirmed (script) |
| english/gorgias.txt | tlg0059.tlg023.perseus-eng2 | confirmed (script) |
| english/greater-hippias.txt | tlg0059.tlg025.perseus-eng2 | confirmed (script; one enumerated Stephanus repair) |
| english/ion.txt | tlg0059.tlg027.perseus-eng2 | confirmed (script) |
| english/laches.txt | tlg0059.tlg019.perseus-eng2 | confirmed (script) |
| english/laws.txt | tlg0059.tlg034.perseus-eng2 | confirmed (script) |
| english/lesser-hippias.txt | tlg0059.tlg026.perseus-eng2 | confirmed (script) |
| english/lysis.txt | tlg0059.tlg020.perseus-eng2 | confirmed (script) |
| english/menexenus.txt | tlg0059.tlg028.perseus-eng2 | confirmed (script) |
| english/meno.txt | tlg0059.tlg024.perseus-eng2 | confirmed (script) |
| english/parmenides.txt | tlg0059.tlg009.perseus-eng2 | confirmed (script) |
| english/phaedo.txt | tlg0059.tlg004.perseus-eng2 | confirmed (script) |
| english/phaedrus.txt | tlg0059.tlg012.perseus-eng2 | confirmed (script) |
| english/philebus.txt | tlg0059.tlg010.perseus-eng2 | confirmed (script) |
| english/protagoras.txt | tlg0059.tlg022.perseus-eng2 | confirmed (script) |
| english/republic.txt | tlg0059.tlg030.perseus-eng2 | confirmed (script) |
| english/sophist.txt | tlg0059.tlg007.perseus-eng2 | confirmed (script) |
| english/statesman.txt | tlg0059.tlg008.perseus-eng2 | confirmed (script) |
| english/symposium.txt | tlg0059.tlg011.perseus-eng2 | confirmed (script) |
| english/theaetetus.txt | tlg0059.tlg006.perseus-eng2 | confirmed (script) |
| english/timaeus.txt | tlg0059.tlg031.perseus-eng2 | confirmed (script) |
| greek/apology.txt | jtauber/plato-texts@3b482c7:raw-text/apology.txt | confirmed (byte-identical copy) |
| greek/charmides.txt | tlg0059.tlg018.perseus-grc2 | confirmed (script) |
| greek/cratylus.txt | tlg0059.tlg005.perseus-grc2 | confirmed (script) |
| greek/critias.txt | tlg0059.tlg032.perseus-grc2 | confirmed (script) |
| greek/crito.txt | jtauber/plato-texts@3b482c7:raw-text/crito.txt | confirmed (byte-identical copy) |
| greek/euthydemus.txt | tlg0059.tlg021.perseus-grc2 | confirmed (script) |
| greek/euthyphro.txt | jtauber/plato-texts@3b482c7:raw-text/euthyphro.txt | confirmed (byte-identical copy) |
| greek/gorgias.txt | tlg0059.tlg023.perseus-grc2 | confirmed (script) |
| greek/greater-hippias.txt | tlg0059.tlg025.perseus-grc2 | confirmed (script) |
| greek/ion.txt | jtauber/plato-texts@3b482c7:raw-text/ion.txt | confirmed (byte-identical copy) |
| greek/laches.txt | tlg0059.tlg019.perseus-grc2 | confirmed (script) |
| greek/laws.txt | tlg0059.tlg034.perseus-grc2 | confirmed (script) |
| greek/lesser-hippias.txt | tlg0059.tlg026.perseus-grc2 | confirmed (script) |
| greek/lysis.txt | tlg0059.tlg020.perseus-grc2 | confirmed (script) |
| greek/menexenus.txt | tlg0059.tlg028.perseus-grc2 | confirmed (script) |
| greek/meno.txt | jtauber/plato-texts@3b482c7:raw-text/meno.txt | confirmed (byte-identical copy) |
| greek/parmenides.txt | tlg0059.tlg009.perseus-grc2 | confirmed (script) |
| greek/phaedo.txt | jtauber/plato-texts@3b482c7:raw-text/phaedo.txt | confirmed (byte-identical copy) |
| greek/phaedrus.txt | tlg0059.tlg012.perseus-grc2 | confirmed (script) |
| greek/philebus.txt | tlg0059.tlg010.perseus-grc2 | confirmed (script) |
| greek/protagoras.txt | tlg0059.tlg022.perseus-grc2 | confirmed (script) |
| greek/republic.txt | jtauber/plato-texts@3b482c7:raw-text/republic.txt | confirmed (byte-identical copy) |
| greek/sophist.txt | tlg0059.tlg007.perseus-grc2 | confirmed (script) |
| greek/statesman.txt | tlg0059.tlg008.perseus-grc2 | confirmed (script) |
| greek/symposium.txt | jtauber/plato-texts@3b482c7:raw-text/symposium.txt | confirmed (byte-identical copy) |
| greek/theaetetus.txt | tlg0059.tlg006.perseus-grc2 | confirmed (script) |
| greek/timaeus.txt | tlg0059.tlg031.perseus-grc2 | confirmed (script) |
| translations/apology_eng.txt | tlg0059.tlg002.perseus-eng2 | identified from pinned upstream TEI header: Plato, *Apology*, translator Harold North Fowler, *Plato in Twelve Volumes* vol. 1, Harvard University Press / William Heinemann Ltd., 1914; Perseus Project release 1996, Trustees of Tufts University. Local file is a legacy plain-text conversion and is not used by extraction. |
| translations/crito_eng.txt | tlg0059.tlg003.perseus-eng2 | identified from pinned upstream TEI header: Plato, *Crito*, translator Harold North Fowler, *Plato in Twelve Volumes* vol. 1, Harvard University Press / William Heinemann Ltd., 1914; Perseus Project release 1996, Trustees of Tufts University. Local file is a legacy plain-text conversion and is not used by extraction. |
| translations/euthyphro_eng.txt | tlg0059.tlg001.perseus-eng2 | identified from pinned upstream TEI header: Plato, *Euthyphro*, translator Harold North Fowler, *Plato in Twelve Volumes* vol. 1, Harvard University Press / William Heinemann Ltd., 1914; Perseus Project release 1996, Trustees of Tufts University. Local file is a legacy plain-text conversion and is not used by extraction. |
| translations/phaedo_eng.txt | tlg0059.tlg004.perseus-eng2 | identified from pinned upstream TEI header: Plato, *Phaedo*, translator Harold North Fowler, *Plato in Twelve Volumes* vol. 1, Harvard University Press / William Heinemann Ltd., 1914; Perseus Project release 1996, Trustees of Tufts University. Local file is a legacy plain-text conversion and is not used by extraction. |

## English Reading Spine (`english/`)

Imported 2026-07-08 (Symposium) and 2026-07-12 (the remaining 26 works) by
`scripts/import-plato-greek.py --english` from the same pinned upstream commit
as the Greek. All 27 `perseus-eng2` editions were fetched and their TEI headers
checked at import time. They are the public-domain print translations from
*Plato in Twelve Volumes*, published by Harvard University Press / William
Heinemann Ltd. and digitized by the Perseus Project (Trustees of Tufts
University), release 1996. The translators/editors and print years recorded by
the upstream headers are:

- Harold North Fowler: *Apology* (1914), *Cratylus* (1926), *Crito* (1914),
  *Euthyphro* (1914), *Hippias Major* (1926), *Hippias Minor* (1926),
  *Parmenides* (1926), *Phaedo* (1914), *Phaedrus* (1914), *Philebus* (1925),
  *Sophist* (1921), *Statesman* (1925), and *Theaetetus* (1921).
- Walter Rangeley Maitland Lamb (the Ion header spells the first name
  "William"): *Charmides* (1927), *Euthydemus* (1924), *Gorgias* (1925),
  *Ion* (1925), *Laches* (1924), *Lysis* (1925), *Meno* (1924), *Protagoras*
  (1924), and *Symposium* (1925).
- Robert Gregg Bury: *Critias* (1929), *Laws* (1926), *Menexenus* (1929), and
  *Timaeus* (1929).
- Paul Shorey: *Republic* (1935–1937).

The public-domain print sources and the digital edition's CC BY-SA 4.0 license
have the same publication posture described above for the Greek. Every English
Stephanus index is validated as an order-preserving subset of its Greek index.
The pinned *Hippias Major* TEI repeats `302e` where the corresponding Greek
sequence has `302d`, then `302e`; `ENGLISH_REPAIRS` in the importer changes the
first marker to `302d` using an exact one-occurrence assertion. No prose is
changed. Symposium carries 256 of the Greek's 257 markers (181b is absent
upstream); missing markers in an English subset are allowed, but duplicates or
out-of-order markers fail validation.

`raw/plato/english/` is a rendering and commentary source only: it feeds
the reading view and the commentary authors' briefs, and is excluded from
extraction inputs (AGENTS.md rule, same as `translations/`).

## Publication Posture

The repository remote is PRIVATE and must stay private until the operator
signs off below (AGENTS.md Backup rule). Before any public exposure
(remote visibility, GitHub Pages site, excerpt-bearing exports):

- [x] Upstream license verified and recorded above
- [x] Attribution to the upstream edition included in the generated site's
      about/source-attribution page
- [x] Share-alike/redistribution terms of the license satisfied for the
      republished text and derived files under `derived/plato/`: the public
      artifact identifies the adapted material, links the canonical license,
      states the modifications, applies CC BY-SA 4.0 to the adapted textual
      material, and adds no access or technological restrictions
- [x] Translation files' provenance resolved (identified or removed)

v1.0 audit posture, 2026-07-08: the repository and generated site remain
private. Operator decision for v1.0: stay private; public exposure is deferred
to a post-v1.0 task, where share-alike/redistribution mechanics must be
confirmed before any public release. The four legacy translation files above
are now identified, but they remain quarantined: extraction uses
`raw/plato/greek/`, and the static site does not copy
`raw/plato/translations/`.

Operator sign-off: cjpher, via Codex chat approval ("well i sign off whatever")  Date: 2026-07-08

Public site publication authorization: cjpher, via Codex chat request to push
and publish the generated site, 2026-07-11. The repository remains private;
only the generated static site is published.

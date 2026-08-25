# Republic Book 1 semantic-review packet freeze

Prepared 2026-08-12 from the unreviewed Republic candidate ledger at the
verified Wave 2 checkpoint. This is a mechanical preparation receipt, not a
semantic review receipt and not an acceptance decision.

## Frozen inputs

- Greek source only: `raw/plato/greek/republic.txt`, SHA-256
  `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`,
  UTF-16 length `557124`.
- Ledger: `wiki/voices/republic.md`, SHA-256
  `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be`.
- Required outer turn: `turn_republic_0001` `[0,557124)`; depth-1 frame
  `voice_republic_0001` remains `unreviewed` and is context-only.
- Book 1 review window: `[0,59068)`, mechanically asserted as the newline
  immediately preceding `{b2}` in the Greek source.
- Scope inputs and the 2026-08-09 census-reconciliation receipt are frozen in
  `.wave2-scratch/coord/republic-b1-packets/freeze.json` (SHA-256
  `204e45358dad8179d16bd51054db1b75951531694f99cc076a0396542c3e597c`).

## Packet artifact

`.wave2-scratch/coord/republic-b1-packets/` contains the deterministic
packetizer, verifier, freeze, manifest, assignment TSV, omission-gap TSV, and
seven exact-Greek packet files. The manifest SHA-256 is
`5dbbaf41fcc916527300b5a23f7fb81478fbfc6c3b913d618a3a1646c00677eb`.

The packets partition Book 1 at these UTF-16 boundaries:

`0-8529-16528-24670-32780-40701-48674-59068`.

Each interior boundary is an edition `{p}` marker followed by its immediate
structural whitespace. The packetizer and verifier assert all of the
following:

- 488 non-frame candidate records occur exactly once in 483 complete
  parent/child families;
- 484 candidate-free source gaps occur exactly once for omission review;
- every family and gap is wholly contained in its one packet's exact Greek
  source block;
- packet ranges are contiguous and exactly cover `[0,59068)`;
- freeze, manifest, TSVs, and packet Markdown are byte-exact reconstructions
  from the current source-bound inputs, so jointly edited hashes cannot attest
  altered packets; and
- the focused Republic ledger checker remains clean.

Commands run at freeze:

```text
bun .wave2-scratch/coord/republic-b1-packets/packetize-book1.ts
bun .wave2-scratch/coord/republic-b1-packets/verify-book1-packets.ts
bun scripts/voices-2026-07/check-ledger.ts republic
```

All three passed: packet generation reported 7 packets / 488 records / 483
families / 484 gaps; verification reported exact `[0,59068)` coverage; the
ledger checker reported `0 issue(s)`.

## Worker-dispatch boundary

The local Opus dispatch runner under
`.wave2-scratch/coord/republic-b1-reviews/` is mechanically fail-closed before
any external request: it re-runs packet verification, accepts only a manifest
packet ID, atomically reserves that packet, passes an isolated temporary copy
of only that packet and `docs/voices-protocol.md` to a fresh Opus process, and
allows that process no write or shell tool. Its local capture verifier rejects
missing/extra/out-of-order dispositions, source ranges outside the packet,
stale hashes, or incomplete candidate/gap accountability before atomically
storing an ignored private verdict and its attempt receipt. These controls make
no semantic decision and do not turn an Opus result into acceptance.

## Deliberate boundary of this receipt

No Greek semantic attribution, correction, omission decision, ledger edit,
`review_status` change, acceptance, compilation, join, cutover, claim-speaker
migration, or activation occurred here. The seven packets are the bounded
input to fresh, independent Claude Opus review reports only. Republic remains
one outer-turn cohort, so Book 1 receipts alone cannot change its
`review_status` or permit partial compilation.

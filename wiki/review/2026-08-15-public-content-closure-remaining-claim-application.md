# The public-content closure campaign remaining claim decisions — application

## Status

**COMPLETED GUARDED CORPUS APPLICATION.** The fixed writer replayed every
sealed private input, rechecked all seven live preimages, and installed only
the postimages declared below. Its post-write report recorded every
replacement, file and directory fsync, and lock release; all projected ledgers
validated with zero issues.

This is a claim-corpus operation. It does not change relations, commentary,
voices, audio, compilation, activation, publication, or deployment. The
required `knowledge-base` completeness report is regenerated in this same
change set solely to reflect the changed claim corpus.

## Fixed decision cohort

- Materializer checkpoint: `17827aa` (`Add combined remaining claim materializer`)
- Writer checkpoint: `8ec6131` (`Add remaining claim application wrapper`)
- Materializer framework SHA-256:
  `3f57e97913ba03f5f6c2a079fb26eeabda530e2e6246307d2408959fc94a1e6b`
- Source-preflight digest SHA-256:
  `ed24caca45a1f0a3b1042eeb8ae7657a42e7985f0210671c882c3e51bc85d178`
- Frozen queue: 8 source-bound packets; 2 parent resolutions, 6 parent
  splits, and 21 accepted child records.

| Packet | Existing claim | Final parent decision | Child-final decision | Corpus result |
| --- | --- | --- | --- | --- |
| 001 | `claim_crito_0002` | `bd44fb0d…4b52b96` | — | `needs_split` → `accepted` |
| 002 | `claim_gorgias_0074` | `5e3f4a43…6689c546` | — | `needs_split` → `accepted` |
| 003 | `claim_laws_0352` | `989df571…031d59ce` | `1fa25d46…924c4a64` | parent rejected; 3 children accepted |
| 004 | `claim_laws_1076` | `12aecfb1…ab4911d5` | `dd2c86ab…34b04e1d` | parent rejected; 4 children accepted |
| 005 | `claim_phaedo_0075` | `3ab19cd7…8adfc236` | `beafa72a…d15f8f29` | parent rejected; 2 children accepted |
| 006 | `claim_philebus_0012` | `54895270…70b36d62` | `eb8d8cda…d109422fc` | parent rejected; 3 children accepted |
| 007 | `claim_republic_0284` | `12d038c6…a92fa3560` | `276bc639…288d7d7b` | parent rejected; 4 children accepted |
| 008 | `claim_theaetetus_0117` | `531e5d0d…67d276073` | `88922b33…f645a078` | parent rejected; 5 children accepted |

The packet-005 final explicitly corrects its two child speakers to `ΦΑΙΔ.`;
the sealed final revalidated under the claim registry. No primary or
independent source-review result was changed.

## Exact intended data mutation

The writer has no path arguments. Its fixed target set is
`wiki/claims/crito.md`, `wiki/claims/gorgias.md`, `wiki/claims/laws.md`,
`wiki/claims/phaedo.md`, `wiki/claims/philebus.md`,
`wiki/claims/republic.md`, and `wiki/claims/theaetetus.md`.

| Ledger | Preimage | Expected postimage | Claim count |
| --- | --- | --- | --- |
| `crito` | `9f1628f4801a9130d6bdd64be0a89050156430b73a68b9fa01f248d96820286f` | `da0c94c105f054d983259e014cf5ee76182829c5055a18068e6066c9e969ad44` | 52 → 52 |
| `gorgias` | `a6dc5d95c40d936b80e9d3f44f55bbd0a1d0802ce400c693d0527b91bf5b8970` | `95e986217716caa5bee8a8f221ec6f6105f10bf8d8e0da618aac921ecf837c51` | 331 → 331 |
| `laws` | `89785be2d710b5a057679b54778d67d5298d320b61eb18e9305c33952ce908eb` | `21e31522e030d1b93494fb31e95afd9a7c435c0074852baa90e2453147a05446` | 1182 → 1189 |
| `phaedo` | `2ad458d7a022d4ed8e046c69794f42448bfa2248b057759077fb2ccdb551c593` | `8b8b40216e0b3ef0c8c82b41dcddb2e853b0ca943c21847dfd05afdeb6938ad0` | 249 → 251 |
| `philebus` | `87ab31df57838c66cf1f7f675ed42fd431bb007a22619db5cf180e27ac9bef35` | `16f83af3444d00a782cd5fcfd5d99ad816e8465cf29d1119471e477f452fa06a` | 92 → 95 |
| `republic` | `9ed9f090de96cd940cac7b25cba95fa3bee7962de7bb9a2ee3f5a24965e72e2d` | `27dd2d967156f13e87a3992a002a7324908f12d59f98615d819c4349df03f1df` | 813 → 817 |
| `theaetetus` | `ba84943e31c08cda1c3bd25f63c03bb48b3029843ded5e7eed752efdbd4b19b0` | `420fcbc02a80010c27cd58f661d48ea0d1dd78e8553813f6ee3594f94d4999cd` | 277 → 282 |

The resulting child IDs are deterministic and append-only: Laws
`1183`–`1189`; Phaedo `0250`–`0251`; Philebus `0093`–`0095`; Republic
`0814`–`0817`; and Theaetetus `0278`–`0282`.

## Guard and recovery boundary

The writer holds a fixed cooperative `O_EXCL` lock, rechecks preimages through
contained regular-file `lstat`/`O_NOFOLLOW`/`fstat` reads, and installs each
validated postimage through a same-directory exclusive temporary file, fsync,
and rename. This is a cooperative preimage guard, not hostile-filesystem CAS
or a cross-file atomic transaction. If a failure follows any completed rename,
the writer reports an indeterminate or partial application and retains the lock
for manual recovery.

## Post-write verification

- Writer result: `applied`; mutation:
  `claim_ledger_replacements`.
- The writer revalidated 8 packets, the 2 resolved parents, the 6 split
  parents, all 21 canonical children, and all seven prospective ledgers before
  beginning replacements. Canonical validation reported 0 issues.
- Each installed ledger exactly matches its expected postimage in the table
  above: Crito `da0c94c1…69ad44`; Gorgias `95e98621…837c51`; Laws
  `21e31522…7a05446`; Phaedo `8b8b4021…6938ad0`; Philebus
  `16f83af3…2fa06a`; Republic `27dd2d96…03f1df`; and Theaetetus
  `420fcbc0…d4999cd`.
- Every replacement completed its file fsync and same-directory fsync. The
  cooperative lock was released; no recovery lock or application temporary
  file remains.
- The writer emits its complete report on stdout rather than persisting a
  second mutable report artifact. This receipt captures its installed hashes
  and bounded result; the matching `wiki/ingest-log.md` entry is in this same
  change set.

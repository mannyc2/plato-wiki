# The public-content closure campaign deferred-claim re-extraction — application

## Status

**COMPLETED CORPUS APPLICATION.** The sole guarded writer completed the
predeclared five-ledger replacement after replaying all sealed inputs and
rechecking the five live preimages. It changed only the six source review
statuses and the fifteen append-only child claim records described below.
Relations, commentary, voices, audio, derived artifacts, compilation,
activation, publication, and deployment remain outside this receipt.

## Bounded operation

- Tool checkpoint: `f5f61d4` (`Guard deferred claim re-extraction application`)
- Required no-write application report SHA-256:
  `5e4b099d71dcd185e8ae6425b63c47b71b384966aaa3bbbb1cb4fcfc37965043`
- Report result: `valid`; 6 packets; 5 ledgers; 15 append-only children; 0
  canonical validation issues; mutation: `none`.
- Writer scope is fixed to `wiki/claims/laws.md`, `wiki/claims/republic.md`,
  `wiki/claims/statesman.md`, `wiki/claims/theaetetus.md`, and
  `wiki/claims/timaeus.md`. It accepts no path arguments.
- The writer uses a cooperative fixed lock and pre-rename preimage checks; it
  is not hostile-filesystem CAS and it does not claim a cross-file atomic
  transaction. Any indeterminate post-rename failure retains its lock for
  manual recovery rather than claiming no mutation.

## Reviewed input chain

The no-write projector replayed the six source-bound re-extraction
adjudications and six final canonicalization adjudications. Packet 001 also
replayed the sealed English-content correction chain; it changes only the
three projected Laws child `content` fields, retaining all other child fields.

| Packet | Existing claim | Re-extraction final | Canonicalization final | Result |
| --- | --- | --- | --- | --- |
| 001 | `claim_laws_0711` | `621e34b21c92827c1157735866505967b47065133ff733eeb440cbae21758461` | `7f83eed2859bb21c2bedd319b5ba7dec579c4b1a7e625ae16ce586a7d4a74452` | 3 children; content-correction final `1615c568e2d969fd35c9aa5f03f0059b3078cda3a0d7db6f066192c6421c1871` |
| 002 | `claim_republic_0294` | `1c398a4ef6d532977252ddb1143f5b99137ca7438a1f83ff546d51f27db2be1b` | `012cabb53b444076ddfc8feda6230ace963b45b38493baeb7e305f56fe8dfc5f` | 2 children |
| 003 | `claim_statesman_0088` | `668b034650d07f9abaf936809908b3fbc6d5e24566bc246258dc2ccfc67bb443` | `5d1086019fa4d1a537e33db0af5e38ba516ffe8a225f310858d97aec7b143eec` | 3 children |
| 004 | `claim_statesman_0090` | `6c309aa5b4b62c2e5426c55c4df37ff966753cdef08a84ea26fab7717235dee6` | `7f431cb130604e9dc1319d46ad2c94cfe40d57e9774a891fbd403cdcffbb825f` | 2 children |
| 005 | `claim_theaetetus_0202` | `16e52b8abd8d48457753d5a549436fee6df77a2973bb4451d5482df931024b44` | `16c4a82abadadf1bea6b456efa09e974d54d838a180ae7b227e23265483eb51a` | 2 children |
| 006 | `claim_timaeus_0086` | `e9ca566aa6ab44fe6d572dce0e9c762ec16f6bd7ddcfc257ef73602d0a0366d7` | `15c8a91a0c2b30fb3fd97ff6caa980105d1e021a11b963eb2badbf35ced7c567` | 3 children |

For packet 001, the correction framework is
`9b9166d67cf7d304a4c4c3ad8d7cebe8ae6da967e99e3890a6639f275521224e`;
its immutable-child projection is
`90788559bba897c5a6b73a8e21dc7f164149520339447ee0fe6713d7632890f3`.
The correction primary and independent raw bytes are respectively
`8b264c8dc08178666e3ea0cb50169a4553aeec732790467c277729a32438cf53`
and `ced77c6128e47947f000000b119ca97a94de72e27ac391207ed12a0bff26f2f0`.

## Exact intended status mapping

The six current `needs_split` records are retained as provenance and become
`rejected`: `claim_laws_0711`, `claim_republic_0294`,
`claim_statesman_0088`, `claim_statesman_0090`,
`claim_theaetetus_0202`, and `claim_timaeus_0086`.

The writer appends, in frozen packet/local-record order, fifteen `accepted`
children: Laws `1180`–`1182`; Republic `0812`–`0813`; Statesman `0143`–`0147`;
Theaetetus `0276`–`0277`; and Timaeus `0262`–`0264`. This is a corpus-data
application only. It does not accept commentary, change voice/audio data,
compile, join, activate, or publish anything.

## Expected ledger preimages and postimages

| Ledger | Preimage | Expected postimage | Claim count |
| --- | --- | --- | --- |
| `laws` | `1cc5043c80156ee79be113588164e36afa3793f2daf858c413edbaf2d77f0835` | `89785be2d710b5a057679b54778d67d5298d320b61eb18e9305c33952ce908eb` | 1179 → 1182 |
| `republic` | `3e91e41c91d90ee7ec102489f70d8d0a19d133fe868c1a6f3c65cf59cd0c8f09` | `9ed9f090de96cd940cac7b25cba95fa3bee7962de7bb9a2ee3f5a24965e72e2d` | 811 → 813 |
| `statesman` | `d85de738e51e212082ac36485bcf891b17ead3b47324344734b8c03844e47631` | `71dd0d97680bf52379942c8108c62f611dddaa269d3518fcd706e4af20a7d8e2` | 142 → 147 |
| `theaetetus` | `68206827c4b0e1e6027030e7f111039a74fc02cf0c3083d3a2d5417f850b75b4` | `ba84943e31c08cda1c3bd25f63c03bb48b3029843ded5e7eed752efdbd4b19b0` | 275 → 277 |
| `timaeus` | `f95f2117b0e72806e4907cc6181281b1f036bb0b8fa3dfedd237d23afbc7c7a3` | `52a02346e712e5802fa9efb9250f9bdd786c59c56c2b8231d114a2826b527382` | 261 → 264 |

## Completed post-write verification

- Writer report SHA-256:
  `ec919967d73bfc09e1ec6789b2914fef0c31dbcd23336fbfc23b34340a0fc2d8`
- Result: `applied`; mutation: `claim_ledger_replacements`; all five listed
  ledgers completed their expected replacement, byte/hash verification, file
  fsync, and directory fsync.
- Installed ledger SHA-256 values exactly match the expected postimages:
  Laws `89785be2d710b5a057679b54778d67d5298d320b61eb18e9305c33952ce908eb`;
  Republic `9ed9f090de96cd940cac7b25cba95fa3bee7962de7bb9a2ee3f5a24965e72e2d`;
  Statesman `71dd0d97680bf52379942c8108c62f611dddaa269d3518fcd706e4af20a7d8e2`;
  Theaetetus `ba84943e31c08cda1c3bd25f63c03bb48b3029843ded5e7eed752efdbd4b19b0`;
  Timaeus `52a02346e712e5802fa9efb9250f9bdd786c59c56c2b8231d114a2826b527382`.
- Canonical claim-ledger validation passed inside the revalidated writer
  projection with 0 issues; independent post-write validation is required
  before checkpointing this change set.
- The cooperative lock was acquired and released successfully. No
  indeterminate replacement, recovery lock, or temporary file remains.
- Required `wiki/ingest-log.md` entry: appended in this same change set.

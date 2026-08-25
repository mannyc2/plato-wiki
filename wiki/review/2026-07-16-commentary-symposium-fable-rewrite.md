# Commentary rewrite review: Symposium

Date: 2026-07-16

## Trigger

The content-addressed Claude Fable 5 low-effort audit covered all ten
Symposium sections and all 71 canonical commentary blocks exactly once. All
ten unit verdicts failed: 38 blocks passed, 30 required rewriting, 3 were
marked for removal, and none required splitting. Under the bounded rewrite
contract, removal findings receive replacement candidates rather than being
silently deleted or renumbered.

Audit output-set digest: `467ef940af0cadd7707e1620eeaca9cb79bafddb21e49ccf0fa50e319becbae9`.

## Applied repair wave

Ten schema-valid Fable-low rewrite artifacts were previewed together against
the exact accepted ledger snapshot. The atomic preview validated every
anchor, citation, cross-reference, id, and full prospective ledger before one
locked write. It changed these 33 blocks:

`comm_symposium_0017`, `comm_symposium_0019`, `comm_symposium_0020`,
`comm_symposium_0023`, `comm_symposium_0024`, `comm_symposium_0025`,
`comm_symposium_0026`, `comm_symposium_0027`, `comm_symposium_0031`,
`comm_symposium_0032`, `comm_symposium_0033`, `comm_symposium_0034`,
`comm_symposium_0036`, `comm_symposium_0037`, `comm_symposium_0038`,
`comm_symposium_0043`, `comm_symposium_0046`, `comm_symposium_0048`,
`comm_symposium_0049`, `comm_symposium_0051`, `comm_symposium_0054`,
`comm_symposium_0055`, `comm_symposium_0057`, `comm_symposium_0058`,
`comm_symposium_0061`, `comm_symposium_0062`, `comm_symposium_0064`,
`comm_symposium_0065`, `comm_symposium_0066`, `comm_symposium_0067`,
`comm_symposium_0068`, `comm_symposium_0069`, and `comm_symposium_0070`.

Rewrite output-set digest: `1d7297b5c11fefc0a4d81e9fb8f3d1eda07ec04a233e20afa3af6a3757784787`.

## Status decision

Every changed block was reset from `accepted` to `unreviewed`; the 38
unchanged passing blocks remain accepted. The replacements are shorter and
more single-purpose than the rejected prose, but this repair application does
not claim editorial acceptance, a passing fresh audit, or human quality
acceptance. A fresh Fable-low audit and subsequent status review remain
required before any production screenplay can bind this ledger.


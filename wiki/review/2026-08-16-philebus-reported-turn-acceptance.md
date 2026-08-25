# Philebus reported-turn acceptance

- date: 2026-08-16
- scope: `turn_philebus_0540`, `turn_philebus_1070`, `turn_philebus_1072`, `turn_philebus_1074`, and `turn_philebus_1075`
- source: `raw/plato/greek/philebus.txt`, SHA-256 `8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807`
- turn index: `derived/plato/turns/philebus.toon`, SHA-256 `848bc6c8fbbd31a57d1b35434537a16ab08d19caa50c79ca9d6d3159e8419fba`
- scope census: `wiki/review/2026-07-26-philebus-reported-turn-scope-census.md`

## Decision

Accepted five complete source-bounded cohorts in `wiki/voices/philebus.md`: five
printed-ΣΩ. frames and five depth-2 reported spans.

`turn_philebus_0540` retains the unmarked hypothetical self-question below the
frame but leaves its indefinite τις unresolved. `turn_philebus_1070` transmits
the plural pleasures' q-bounded reply, and `turn_philebus_1072` and
`turn_philebus_1074` transmit plural replies by νοῦς-and-φρόνησις; those three
children remain unresolved because the Greek supplies no singular terminal
owner. In `turn_philebus_1075`, the whole q-bounded answer resolves to ΝΟΥΣ. by
the post-quotation closing formula `τὸν νοῦν … ἀποκρίνασθαι`.

The dialogue-local `ΣΩ.` and `ΝΟΥΣ.` registry entries name only these
source-licensed chains. No cutover, voice join, claim attribution, or other
corpus family changes.

## Method

Direct review used the Greek source, exact turn index, scope census, and
`docs/voices-protocol.md`. No translation, doctrine, style, alternation, or
carry-forward attribution was used.

## Verification

- `bun run harness derive voices philebus` compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.

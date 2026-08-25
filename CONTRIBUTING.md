# Contributing

## Setup

Bun 1.3.9, pinned in `package.json` and enforced in CI. Do not use npm, yarn,
or pnpm — the lockfile is `bun.lock`.

```sh
bun install --frozen-lockfile
```

## The one required command

```sh
bun run ci
```

It runs, in order and stopping at the first failure: `test`, `typecheck`,
`validate`, and a site build into an OS temporary directory. This is the same
entry point hosted CI uses, so a green local run means a green hosted run.

## Deterministic checks vs. billable work

Everything in `bun run ci` is deterministic and offline. It never authenticates
to a model provider, spends money, reaches a remote GPU, fetches network media,
or writes canonical corpus state.

Provider-backed work — ingest runs, the commentary campaign, audio rendering —
is separate, explicitly gated, and never part of CI. Those commands require
`--execute` or `--write` and an operator decision. If you find yourself adding
one to a CI path, stop.

| Purpose | Command |
| --- | --- |
| Everything CI runs | `bun run ci` |
| Tests only | `bun run test` |
| Types only | `bun run typecheck` |
| Ledger + provenance validation | `bun run validate` |
| Edition completeness (read-only) | `bun run completeness -- --target knowledge-base --allow-incomplete` |
| What is still open, as dispatchable jobs | `bun run harness job list` |
| One job's brief, for a dispatched agent | `bun run harness job show <job-id>` |
| Release readiness (read-only) | `bun run release:audit -- --target knowledge-base --allow-incomplete` |
| Full CLI surface | `bun run harness --help` |

## Review provenance

Any change to a `review_status` must land in the same commit as one added or
modified canonical review receipt under `wiki/review/`. Review decisions
without a committed receipt are treated as unreviewed, and `bun run validate`
enforces this. `wiki/ingest-log.md` may record harness run history, but it is
not required review-decision provenance. See `AGENTS.md`.

## Never commit

- `plans/` — working plans are local; durable decisions belong in `docs/`
- `wiki/transcripts/`, `/scratch/` — local audit artifacts
- `.env` and any provider credential
- generated `site/` output
- audio binaries

## Attribution and interpretation

The wiki's neutral layers record what the text does, never what it means. The
words *esoteric*, *Strauss(ian)*, *hidden*, *secret*, *concealed*, and "between
the lines" are banned from prompts, records, and generated artifacts. Speaker
attribution comes from the text's own speech machinery and never from content,
doctrine, style, or turn alternation — see `docs/voices-protocol.md`.

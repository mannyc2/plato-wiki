# Plato Observation Wiki

The v2.0.0 knowledge-base candidate provides 27 source-bound Plato reading
spines with reviewed observations, claims, relations, reported turns, guided
commentary, deterministic comparison layers, and a validated static site. The
separate audio edition is not part of this release.

This repository contains an LLM harness for ingesting Greek Plato dialogues and
producing auditable observation ledgers: bounded textual claims with verifiable
Stephanus-span citations and deterministic validation. The extraction layer
records observations, not interpretations; see [SPEC.md](SPEC.md) for the full
goals and non-goals.

## Quick start

```bash
bun install
cp .env.example .env
# Fill at least one provider key in .env.
bun run validate
bun run harness ingest euthyphro --dry-run
```

## Commands

- `bun run harness ingest <dialogue> [--dry-run] [--profile <name>]`
- `bun run harness review <dialogue> [--dry-run] [--profile <name>]`
- `bun run harness profiles`
- `bun run harness providers`
- `bun run harness models [provider]`
- `bun run harness transcripts`
- `bun run harness trace [run-name]`
- `bun run harness usage [run-name]`
- `bun run harness coverage [--write] [dialogue]`
- `bun run validate`

## Verification gates

Run these after harness, schema, or generated-wiki changes:

```bash
bun run test
bun run typecheck
bun run validate
```

`AGENTS.md` is the local operating rulebook for agent work in this repository.
It requires all three gates after harness, schema, or generated-wiki changes.

## Build the static site

```bash
bun run harness site --out-dir /tmp/plato-site
```

The generated site includes the source attribution, modification notice, and
content-license surface required for redistribution.

## Adding a dialogue

Add a Greek source file at:

```text
raw/plato/greek/<slug>.txt
```

Use `{5d}`-style Stephanus markers in the text. Update the source manifest:

```bash
shasum -a 256 raw/plato/greek/<slug>.txt >> raw/plato/MANIFEST.sha256
```

Record the file's provenance and license in `raw/plato/SOURCES.md`.

Then run:

```bash
bun run harness ingest <slug>
```

## Repository map

- `packages/harness`: provider selection, Pi harness setup, tools, validation,
  transcripts, usage, and deterministic wiki writes.
- `packages/cli`: thin command parser and terminal output layer.
- `raw/plato`: canonical Greek source files, translations kept out of extraction,
  the source manifest, and the source provenance record (`SOURCES.md`).
- `wiki/`: observation ledgers, feature registry, ingest log, review notes, and
  ignored local transcript artifacts.
- `docs/`: extraction protocol, harness operations, runner design, and research
  requests.
- `.pi/`: project-local skills and prompts used by the harness.
- `SPEC.md`, `AGENTS.md`, and `BACKLOG.md`: full system spec, local execution
  rules, and deterministic-data roadmap.

## Licensing

Code and software documentation are MIT-licensed. Textual and data content is
CC BY-SA 4.0 unless a source record states otherwise. See [LICENSE](LICENSE),
[LICENSE-CONTENT](LICENSE-CONTENT), [NOTICE](NOTICE), and
[the publication-license guide](docs/publication-license.md).

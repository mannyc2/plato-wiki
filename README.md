# Plato Observation Wiki

A source-bound Plato knowledge base with 27 reading spines, reviewed
observations, claims, relations, reported turns, guided commentary, and a
validated static site. The audio edition is a separate production target.

Codex or Claude performs semantic curation from bounded Greek source slices.
This repository supplies deterministic citation tools, validated ledger writes,
completeness reports, projections, and publishing checks. Extraction records
observations, not interpretations; see [SPEC.md](SPEC.md).

## Quick start

Install the Bun version pinned in `package.json`, then:

```bash
bun install --frozen-lockfile
bun run validate
bun run harness job list
bun run build
```

The site is written to `site/`. No model-provider key is needed for these
commands. Token indexes are ignored build data; `test`, `validate`, `build`, and
completeness commands rebuild them from canonical inputs. To rebuild explicitly:

```bash
bun run derive
```

## Curation

Start with `bun run harness job show <job-id>`. It provides the current scope,
input files, standing instructions, and submission path. Give independent
agents bounded source scopes; one integrating agent owns each canonical ledger
and its decision receipt. See [the operations guide](docs/harness-operations.md)
and [AGENTS.md](AGENTS.md).

```bash
bun run harness wiki ingest                     # inspect deterministic tool schemas
bun run harness wiki ingest scratch/calls.json  # validate and execute tool calls
bun run harness derive segments euthyphro       # deterministic source partition
bun run harness coverage euthyphro
```

The `wiki` command consumes an array of `{name, arguments}` tool calls. Resolve
citations with `wiki_source_span`; stage a complete observation ledger with
`wiki_stage_observation`, then call `wiki_commit_observation` once in the same
invocation. Review status changes also require one canonical decision receipt
under `wiki/review/`.

Repeated commentary audits use the bounded campaign described in
[the commentary protocol](docs/commentary-protocol.md). Audio synthesis and QA
use [the audio workflow](scripts/audio/README.md). These are separate operations
from offline verification.

## Verification

```bash
bun run ci
```

This runs tests, typecheck, lint, validation, and a disposable site build.
Individual gates are `bun run test`, `bun run typecheck`, `bun run lint`,
`bun run validate`, and `bun run build`.

## Repository map

| Path | Responsibility |
| --- | --- |
| `packages/harness` | Corpus schemas, generic tools, derived data, commentary audit, audio validation, static site |
| `packages/cli` | Command parsing and terminal output |
| `scripts/audio` | Local GPU rendering, cast references, mastering, and QA |
| `raw/plato/greek` | Canonical extraction sources |
| `raw/plato/english` | Rendering/commentary sources, excluded from extraction |
| `wiki` | Canonical semantic ledgers, ontology, accepted evidence, and projections |
| `derived/plato` | Canonical configuration and deterministic indexes; token cache is untracked |
| `docs` | Corpus protocols, architecture decisions, and release documentation |

For the measured code and storage breakdown, see
[repository maintenance](docs/repository-maintenance.md).

## Adding a dialogue

Add `raw/plato/greek/<slug>.txt` with `{5d}`-style Stephanus markers. Record its
provenance and license in `raw/plato/SOURCES.md` and hash in
`raw/plato/MANIFEST.sha256`. Generate source indexes, then curate through the
[extraction protocol](docs/plato-wiki-extraction-protocol.md). Translation files
are never extraction evidence.

## Distribution and licensing

Release candidates include a complete public tree, a static site, a regenerable
token cache, and SHA-256 checksums. Readers can use the site artifact without
cloning the curation repository. See [release packaging](docs/release-packaging.md).

Code and software documentation are MIT-licensed. Textual and data content is
CC BY-SA 4.0 unless a source record states otherwise. See [LICENSE](LICENSE),
[LICENSE-CONTENT](LICENSE-CONTENT), [NOTICE](NOTICE), and
[the publication-license guide](docs/publication-license.md).

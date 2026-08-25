# Wiki Browser Design

## Goals / Non-Goals

The browser is a read-only static rendering of observation records, feature candidates, and validation summaries. It must honor the project constraints: "Extract records, not readings"; "Do not create synthesis essays during ingest"; and "Do not make the CLI the owner of domain logic." Pages may display resolved Greek excerpts from `raw/plato/greek` as build artifacts, but ledgers remain source-ref based and no page adds interpretive synthesis.

## Data Inventory

- Observation id, dialogue, span, source ref, Greek terms, gloss, observation, textual basis, limits, family, label, feature id, review status: `wiki/observations/*.md`; build-phase parser should export a full observation-record parser modeled on the YAML block regex in `observation-validator.ts`.
- Feature id, family, proposed name, status, observations, notes: `wiki/features-so-far.md`; build phase should export `parseFeatureEntries` from `observation-feature-index.ts`.
- Family, label, and drift counts: `validateRepo()` already returns `featureFamilies`, `labelDrift`, and `reviewCoverage`.
- Greek excerpt display: `resolveSourceSpan()` and `derived/plato/stephanus/*.toon`.

## Page Inventory

- Index page: corpus stats, family drift, label drift, review coverage, links to dialogues/families/registry.
- Dialogue page: one page per ledger, stable anchors like `#obs_meno_0042`, record cards with status, span, family/label, source hash, and optional resolved Greek excerpt.
- Family page: all observations for a feature family across dialogues, grouped by label.
- Registry page: feature candidates with status badges, observation links, notes, and review actions as plain text.
- Cluster extension: when the cluster artifact rollout later emits `wiki/clusters/*.md`, add cluster pages without changing observation pages.

## Architecture Decision

Option A is a Bun script or `packages/site` command that emits plain HTML and one CSS file into gitignored `site/`. Option B is a third-party static site generator. Pick Option A. It matches the repo's zero-dependency posture, keeps generation deterministic, and leaves domain parsing in the harness. The trade-off is less templating ergonomics, but the page set is small enough for simple string templates.

## Where The Code Lives

Build implementation should live outside the CLI's argument parsing, either in `packages/harness/src/site/` with a thin CLI command or in `packages/site` if the output grows. Harness exports needed first: a full observation parser, `parseFeatureEntries`, and a site generator function such as `buildStaticSite({ outDir })`. The CLI should only dispatch.

## Greek Text Handling

Inline resolved Greek excerpts on dialogue pages, but mark them display-only and hash-stamped from `source_ref.text_sha256`. This keeps ledgers free of copied passages while making source inspection ergonomic. If excerpt size becomes an issue, collapse excerpts behind `<details>` rather than moving to a separate span page.

## Open Questions

1. Host on GitHub Pages? Recommendation: defer until the repo has a remote and review statuses are meaningful.
2. Commit generated `site/` output? Recommendation: no; regenerate locally and keep `site/` ignored.
3. Show unreviewed records? Recommendation: yes, but make status badges prominent and default filters prefer accepted records after review coverage improves.
4. Include transcript links? Recommendation: no; `wiki/transcripts/` is local ignored data and should not be a browser dependency.
5. Add search? Recommendation: start with static family/dialogue pages; add client-side search only after page volume justifies it.

## Build-Plan Sketch

1. Export observation and registry parsers from the harness.
2. Add deterministic HTML escaping and template helpers.
3. Build index, dialogue, family, and registry pages into `site/`.
4. Add `.gitignore` entry for `site/`.
5. Add smoke tests over generated HTML for stable anchors and escaped content.
6. Add a thin `bun run harness site` command.
7. Re-run `bun run test`, `bun run typecheck`, and `bun run validate`.

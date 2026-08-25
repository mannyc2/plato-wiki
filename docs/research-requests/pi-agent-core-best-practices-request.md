# Research Request: Pi Agent Core Best Practices For A Validated LLM Wiki Harness

You are a Pi-focused LLM agent with strong knowledge of `pi-agent-core`,
`pi-ai`, and the Pi coding-agent ecosystem. Review the harness design below and
recommend best practices, weak spots, and better implementation paths.

This request is self-contained. Do not assume prior chat context.

## Project Goal

We are building an LLM-maintained Plato observation wiki.

The system ingests canonical Greek Plato texts and produces persistent markdown
ledgers:

- `wiki/observations/<dialogue>.md`: checkable textual observations.
- `wiki/features-so-far.md`: accumulating feature registry.
- `wiki/ingest-log.md`: append-only run log.
- `wiki/transcripts/`: local audit artifacts for sessions, events, responses,
and usage.

The goal is not to ask an LLM to find esotericism or generate interpretations.
The goal is to compile structured, checkable textual facts that may later make
larger patterns visible.

## Current Architecture

The repo is a Bun monorepo:

```text
packages/
  harness/
    src/run.ts
    src/wiki/tools.ts
    src/wiki/observation-validator.ts
    src/wiki/feature-registry-validator.ts
  cli/
    src/cli.ts
.pi/
  skills/plato-observation-extraction/SKILL.md
  prompts/ingest-plato-dialogue.md
  prompts/review-plato-features.md
docs/
  plato-wiki-extraction-protocol.md
wiki/
  observations/
  features-so-far.md
  ingest-log.md
```

The CLI is separate from the harness. The harness owns provider selection,
`AgentHarness`, tools, sessions, transcripts, validation, and usage tracking.

Provider profiles include at least Anthropic and DeepSeek. Bun loads `.env`
automatically.

## Current Harness Shape

The harness loads project-local skills and prompt templates:

```ts
const env = new NodeExecutionEnv({ cwd: repoRoot });
const source = (dir: string) => ({ path: dir, source: { type: "project", dir } });

const { skills } = await loadSourcedSkills(env, [source(join(repoRoot, ".pi/skills"))]);
const { promptTemplates } = await loadSourcedPromptTemplates(env, [source(join(repoRoot, ".pi/prompts"))]);
```

It uses file-backed Pi session storage:

```ts
const sessionRepo = new JsonlSessionRepo({
  fs: env,
  sessionsRoot: join(repoRoot, config.transcriptsDir, "sessions"),
});
const session = await sessionRepo.create({
  id: transcript.runId,
  cwd: repoRoot,
});
```

It injects the protocol and current feature registry into the system prompt:

```ts
const protocolContext = readContextFile("docs/plato-wiki-extraction-protocol.md", true);
const featuresContext = readContextFile("wiki/features-so-far.md", false);

systemPrompt: ({ env: harnessEnv, resources }) =>
  [
    "You maintain a Plato textual observation wiki.",
    "Extract records, not readings.",
    "Read canonical Greek from raw/plato/greek. Do not read translation files.",
    "Never ask the model to find esotericism or generate hypotheses.",
    "The extraction protocol and current feature registry are already provided in this system prompt.",
    "Use wiki_read_file before using source text or observation files not included in this system prompt.",
    "Use wiki_source_span for every observation source_ref; do not calculate offsets yourself.",
    "Observation records store references, not source snippets. Keep Greek only in greek_terms; write observation, textual_basis, limits, and gloss fields in English with Stephanus refs.",
    "If wiki_write_observation rejects a ledger, fix the concise validation feedback and call it again.",
    "Persist observation ledgers with wiki_write_observation.",
    "Persist every feature registry change by writing the full updated wiki/features-so-far.md with wiki_write_feature_registry.",
    "The harness records run history automatically; do not write wiki/ingest-log.md.",
    "If wiki_write_feature_registry rejects the registry, fix the concise validation feedback and call it again.",
    "Do not say that a file was created or updated unless the corresponding tool call succeeded.",
    formatSkillsForSystemPrompt(resources.skills ?? []),
    "## Plato Wiki Extraction Protocol",
    protocolContext.trim(),
    "## Current features-so-far",
    featuresContext.trim() || "(none yet)",
    `Wiki directory: ${join(harnessEnv.cwd, "wiki")}`,
    `Greek text directory: ${join(harnessEnv.cwd, "raw/plato/greek")}`,
  ].filter((part) => part.length > 0).join("\n\n")
```

The harness subscribes to agent events and records usage:

```ts
agent.subscribe((event) => {
  transcript.write("agent_event", {
    eventType: event.type,
    ...summarizeEvent(event),
  });

  if (event.type === "message_end" && event.message.role === "assistant") {
    transcript.recordUsage(event.message);
  }
});
```

## Current Tool Boundary

The harness exposes command-specific tools:

```ts
wiki_read_file({ path })
wiki_source_span({ dialogue, stephanus_span, max_chars? })
wiki_stage_observation({ path, content })      // regular ingest
wiki_commit_observation({ path })              // regular ingest
wiki_append_observations({ path, content })    // segmented ingest only
wiki_write_observation({ path, content })      // review
wiki_write_feature_registry({ content })       // review
```

`wiki_read_file` is deliberately narrow. It can read only:

```text
raw/plato/greek/*
wiki/observations/*
```

The protocol and feature registry are not read through tools during a run; they
are harness-owned system context.

`wiki_source_span` resolves Stephanus spans to deterministic source metadata:

```ts
{
  source_ref: {
    source_path: "raw/plato/greek/euthyphro.txt",
    stephanus_span: "5d-6e",
    start_marker: "5d",
    end_marker: "6e",
    start_char: 7263,
    end_char: 10456,
    text_sha256: "..."
  },
  excerpt: "...",
  record_rule: "Copy source_ref into the observation. Do not persist this excerpt or Greek passages; keep Greek only in greek_terms."
}
```

The excerpt is inspect-only. Observation records persist `source_ref`, not
source snippets.

`wiki_write_observation` validates the full markdown ledger before writing. If
validation fails, it throws a concise error so the agent can repair and retry.

Current validation checks include:

- fenced YAML observation records exist
- complete `source_ref`
- raw source slice hash matches `text_sha256`
- Greek text appears only in `greek_terms`
- no unbounded `ff.` references
- Stephanus references in evidence fields stay inside the observation span

`wiki_write_feature_registry` validates the full `wiki/features-so-far.md`
before replacing it. Feature state is edited as a full file, not through a
feature-create tool.

Current feature validation checks include:

- exactly one `## Feature Candidates` heading
- no stale `None yet.` after features exist
- unique feature IDs
- required `proposed_name`, `status`, `observations`, `notes`
- valid status
- unique `proposed_name`
- observation IDs in features exist in `wiki/observations/*.md`
- observation ledgers do not reference missing feature IDs

The model does not receive an ingest-log append tool. The harness appends
`wiki/ingest-log.md` entries after successful ingest and review commands.

## Current Empirical Behavior

An initial run let the agent write long Greek quotations into `textual_basis`.
After adding write-tool validation, the next run behaved better:

- `wiki_write_observation` was called three times.
- First attempt was rejected with 30 issues.
- Second attempt was rejected with 1 issue.
- Third attempt was accepted.
- The final ledger passed deterministic validation.

That suggests tool-time validation can work as a repair loop.

## Known Weak Spots

Please examine these and add any others:

1. System prompt size may grow as `features-so-far.md` grows.
2. Full-file markdown writes are simple but may become expensive and fragile.
3. Feature labels are still noisy. Example: `definition_proposed` is too broad
  and incorrectly includes a legal terminology correction.
4. Tool validation is regex/markdown based rather than parsing a typed document
  format.
5. Observation ledger writes are whole-file writes rather than per-record
  structured writes.
6. Feature registry writes are whole-file writes rather than typed feature
  operations.
7. The same agent turn owns extraction, feature assignment, and persistence.
8. Transcript audit exists, but we need to know whether we are using Pi events,
  sessions, and usage data in the best way.
9. It is unclear whether protocol/features should live in system prompt,
  resources, prompt templates, context files, hooks, or a combination.
10. It is unclear how to best handle command-aware tools: ingest vs review have
  different allowed mutations.

## Questions For The Pi Expert

Answer with concrete recommendations and code-level guidance.

1. For `AgentHarness`, what is the best Pi-native way to inject durable context
  like protocol docs and current feature registry?
  - System prompt closure?
  - `before_agent_start` hook?
  - resources/context files?
  - prompt template expansion?
  - another Pi mechanism?
2. Is the current use of `JsonlSessionRepo` appropriate for auditability?
  Should we store additional metadata in the Pi session itself, or keep most
   audit detail in our separate transcript JSONL?
3. Are we subscribing to `AgentHarness` events correctly?
  What event types should be captured for full transcript audit, tool repair
   loops, provider usage, and future replay?
4. Is throwing tool errors the right way to give the agent repair feedback?
  Is there a better Pi pattern for validation failures that the agent should
   correct and retry?
5. Should observation writes stay as full markdown files, or should we move to
  typed per-record tools?
   If typed per-record tools are better, sketch the API and how the final
   markdown ledger should be materialized.
6. Should feature registry updates stay as full-file writes with validation, or
  should we use typed operations like `create_feature`, `update_feature`,
   `merge_features`, and `attach_observation_to_feature`?
   What is the Pi-agent best practice for mutable registries?
7. How should tools be command-aware?
  For example, should `ingest` forbid feature renames/status changes while
   `review` allows them?
   Should that be enforced in tool construction, tool params, system prompt, or
   validator rules?
8. Are there better ways to keep `features-so-far` available throughout a run
  without bloating every provider request?
   Please discuss when to use a compact feature index, retrieval, snapshots, or
   system context.
9. How should provider support be structured with Pi?
  We need Anthropic and DeepSeek now, possibly more later. Are provider
   profiles and `getApiKeyAndHeaders` the right surface?
10. What should usage tracking include?
  We currently track input, output, cache read/write, total tokens, and
    estimated cost from provider usage. What Pi APIs expose this most reliably?
    Are there provider-specific caveats?
11. What should deterministic validation own versus what should the LLM own?
  Identify validation rules that should move out of prompts and into tools.
12. What are the strongest alternative architectures for this project?
  For each alternative, state when it becomes worth switching.

## Desired Output

Please return:

1. A concise architecture review: what is good, what is weak, what is risky.
2. A recommended near-term design, with specific changes to make next.
3. A longer-term design if the corpus grows large.
4. Pi-specific best practices with API names and code snippets.
5. Any corrections to our current assumptions about `pi-agent-core`,
  `AgentHarness`, sessions, hooks, tools, resources, prompt templates, or
   provider usage.
6. Concrete examples of improved tool definitions or harness setup.
7. A short checklist we can convert into implementation tasks.

Be critical. Do not simply validate the current design. If a different Pi path
is better, say so and show what it would look like.

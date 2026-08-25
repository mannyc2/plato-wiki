# pi-agent-core Wiki Runner Design

## Purpose

This document adapts the generic LLM Wiki pattern to this repository's Plato
observation workflow.

The runner should orchestrate file I/O and agent turns, but the actual domain
behavior must come from the local protocol, skill, prompts, and source files.
The runner should not encode a fixed Plato ontology.

## Important Correction To The Generic Wiki Pattern

Generic LLM Wiki guidance often says to identify entities, concepts,
relationships, contradictions, and topic summaries.

That is too interpretive for this project at the extraction layer. The Plato
wiki uses observation ledgers and feature candidates. It should not create
synthesis pages or interpretive essays during ingest.

## Required Project Resources

The harness should load project-local resources:

- `.pi/skills/plato-observation-extraction/SKILL.md`
- `.pi/skills/plato-label-normalization/SKILL.md`
- `.pi/prompts/ingest-plato-dialogue.md`
- `.pi/prompts/review-plato-features.md`
- `docs/plato-wiki-extraction-protocol.md`
- `docs/label-normalization-standards.md`

The project resources should outrank user-global skills for this workflow. A
generic wiki-maintenance skill must not override the Plato extraction protocol.

For label-normalization runs, `docs/label-normalization-standards.md` is a
policy input, not optional background context. The runner should load it with
`.pi/skills/plato-label-normalization/SKILL.md` before any model proposes
merge-map dispositions, and should persist decisions only through an explicit
merge map that passes harness validation.

## Runner Responsibilities

The runner may:

- load project skills and prompt templates
- inject the protocol as harness-owned system context
- inject the full feature registry at run start and a compact feature index if
  the registry changes during the run
- call an LLM with the local extraction skill available
- write observation ledgers and append logs through the agent environment
- validate observation ledgers and feature-registry writes at the write-tool
  boundary

The runner must not:

- ask the model to find esotericism
- ask the model to generate hypotheses
- create or update synthesis pages during extraction
- rename, merge, or delete feature candidates during extraction
- normalize labels without the label-normalization standard and skill loaded

## Expected Commands

Once implemented, the useful surface should stay small:

```text
ingest <dialogue-slug>
review <dialogue-slug>
validate
```

Possible examples:

```text
ingest euthyphro
review euthyphro
validate
```

Do not build a broad CLI before these three flows are useful.

## Harness Sketch

This is a design sketch, not committed application code:

```typescript
import {
  AgentHarness,
  NodeExecutionEnv,
  Session,
  InMemorySessionStorage,
  formatSkillsForSystemPrompt,
  loadSourcedPromptTemplates,
  loadSourcedSkills,
} from "@earendil-works/pi-agent-core";
import { getModel } from "@earendil-works/pi-ai";
import { join } from "node:path";

const env = new NodeExecutionEnv({ cwd: process.cwd() });
const source = (dir: string) => ({ path: dir, source: { type: "project" as const, dir } });

const { skills } = await loadSourcedSkills(
  env,
  [source(join(env.cwd, ".pi/skills"))],
  (skill, source) => ({ ...skill, source }),
);

const { promptTemplates } = await loadSourcedPromptTemplates(
  env,
  [source(join(env.cwd, ".pi/prompts"))],
  (promptTemplate, source) => ({ ...promptTemplate, source }),
);

const protocolContext = await env.readTextFile("docs/plato-wiki-extraction-protocol.md");
const readFeatureRegistry = () => env.readTextFile("wiki/features-so-far.md").catch(() => "");

const agent = new AgentHarness({
  env,
  session: new Session(new InMemorySessionStorage()),
  model: getModel("openai", "gpt-5.5"),
  thinkingLevel: "high",
  systemPrompt: ({ env, resources }) =>
    [
      "You maintain a Plato textual observation wiki.",
      "Extract records, not readings.",
      "Read canonical Greek from raw/plato/greek.",
      "The extraction protocol is provided in this system prompt. The feature registry is injected by hooks.",
      "Never ask the model to find esotericism or generate hypotheses.",
      formatSkillsForSystemPrompt(resources.skills ?? []),
      "## Plato Wiki Extraction Protocol",
      protocolContext,
      `Wiki directory: ${join(env.cwd, "wiki")}`,
      `Greek source directory: ${join(env.cwd, "raw/plato/greek")}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  resources: {
    skills: skills.map(({ skill }) => skill),
    promptTemplates: promptTemplates.map(({ promptTemplate }) => promptTemplate),
  },
});

agent.on("before_agent_start", async (event) => ({
  systemPrompt: [
    event.systemPrompt,
    "## Current features-so-far",
    (await readFeatureRegistry()).trim() || "(none yet)",
  ].join("\n\n"),
}));
```

## Implementation Gate

Observation ledgers should be validated before they are written.

Candidate validation rules:

- observation records require `observation_id`, `source_work`, and
  `stephanus_span`
- `source_ref` must include offsets, markers, and a matching source hash
- Greek text outside `greek_terms` fails validation
- Stephanus references inside evidence fields must stay inside the observation
  span
- forbidden interpretive phrases fail validation
- `review_status` must be one of `unreviewed`, `accepted`, `rejected`, or
  `needs_split`
- during ingest, feature-registry writes may add new `candidate` features or
  add observation ids to existing features, but must not rename, remove, accept,
  reject, split, or rewrite existing feature candidates

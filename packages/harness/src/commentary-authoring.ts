export type CommentaryAuthoringStage = "outline" | "draft" | "audit" | "rewrite";
export type CommentaryEffort = "medium" | "high";

export const COMMENTARY_CAMPAIGN_ID = "plato-commentary-gpt-5-6-luna" as const;
export const COMMENTARY_MODEL_ARGUMENT = "gpt-5.6-luna" as const;
export const COMMENTARY_AUTHORING_MODEL = "gpt-5.6-luna" as const;
export const COMMENTARY_PERMISSION_MODE = "read-only" as const;
export const COMMENTARY_CODEX_CLI_VERSION = "0.147.0" as const;
export const COMMENTARY_MODEL_CATALOG_PATH = "packages/harness/src/commentary-luna-model-catalog.json" as const;
export const COMMENTARY_CAMPAIGN_SCHEMA_VERSION = 3 as const;
export const COMMENTARY_JOB_STATE_SCHEMA_VERSION = 3 as const;

export const COMMENTARY_STAGE_EFFORT = {
  outline: "high",
  draft: "medium",
  audit: "medium",
  rewrite: "high",
} as const satisfies Record<CommentaryAuthoringStage, CommentaryEffort>;

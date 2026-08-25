import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readConfig } from "./config.js";
import { setRepoRootForTesting } from "./paths.js";

let root = "";
let restoreRepoRoot: (() => void) | undefined;

describe("readConfig", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "harness-config-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("requires harness.config.json instead of inventing a fallback profile", () => {
    expect(() => readConfig()).toThrow("Missing required config file: harness.config.json");
  });

  it("reads the checked-in config shape", () => {
    writeFileSync(
      join(root, "harness.config.json"),
      JSON.stringify({
        defaultProfile: "test",
        transcriptsDir: "wiki/transcripts",
        profiles: {
          test: {
            provider: "openai",
            model: "gpt-5.5",
            apiKeyEnv: "OPENAI_API_KEY",
            baseUrl: "https://api.pioneer.ai/v1",
            apiKeyHeader: "X-API-Key",
            remoteModelId: "deepseek-ai/DeepSeek-V4-Pro",
            disableReasoning: true,
            maxTokens: 4096,
          },
        },
      }),
      "utf8",
    );

    expect(readConfig()).toEqual({
      defaultProfile: "test",
      transcriptsDir: "wiki/transcripts",
      profiles: {
        test: {
          provider: "openai",
          model: "gpt-5.5",
          apiKeyEnv: "OPENAI_API_KEY",
          baseUrl: "https://api.pioneer.ai/v1",
          apiKeyHeader: "X-API-Key",
          remoteModelId: "deepseek-ai/DeepSeek-V4-Pro",
          disableReasoning: true,
          maxTokens: 4096,
        },
      },
    });
  });
});

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "./paths.js";
import type { HarnessConfig } from "./types.js";

export function readConfig(): HarnessConfig {
  const configPath = join(getRepoRoot(), "harness.config.json");
  if (!existsSync(configPath)) {
    throw new Error("Missing required config file: harness.config.json");
  }

  const parsed = JSON.parse(readFileSync(configPath, "utf8")) as Partial<HarnessConfig>;
  if (!parsed.defaultProfile || !parsed.transcriptsDir || !parsed.profiles) {
    throw new Error("harness.config.json must define defaultProfile, transcriptsDir, and profiles");
  }

  return {
    defaultProfile: parsed.defaultProfile,
    transcriptsDir: parsed.transcriptsDir,
    profiles: parsed.profiles,
  };
}

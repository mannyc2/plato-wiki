import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const PACKAGE_ROOT = join(import.meta.dir, "..");

function runCli(...arguments_: string[]) {
  return spawnSync("bun", ["src/cli.ts", ...arguments_], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
  });
}

describe("commentary sample-failure rejection CLI", () => {
  it("publishes separate dry preview and mutating apply commands with every required binding", () => {
    const result = runCli("--help");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "sample-failure-reject-preview <dialogue> --reviewed-on <YYYY-MM-DD> --expected-ledger-sha256 <sha256> --failed-ids <id,id,...> --sample-output <path>",
    );
    expect(result.stdout).toContain(
      "sample-failure-reject-apply <dialogue> --reviewed-on <YYYY-MM-DD> --expected-ledger-sha256 <sha256> --failed-ids <id,id,...> --sample-output <path>",
    );
  });

  it("rejects missing explicit bindings before reading evidence or mutating a ledger", () => {
    const result = runCli("commentary", "sample-failure-reject-apply", "charmides");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Usage: bun run harness commentary <subject>");
  });
});

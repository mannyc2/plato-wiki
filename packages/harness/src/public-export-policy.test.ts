import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isPublicHistoricalCommentaryAuditSample } from "../../../scripts/release/public-export-policy.js";
import { getRepoRoot } from "./paths.js";

const sha256 = (content: Uint8Array) => createHash("sha256").update(content).digest("hex");
const samplePath = (dialogue: string, bytes: Uint8Array) =>
  `wiki/submissions/commentary-audit-sample/${dialogue}/${sha256(bytes)}.json`;

describe("public export historical-plan policy", () => {
  it("permits only exact protocol-bound audit samples carrying the one already-public historical label", () => {
    const root = getRepoRoot();
    const protocolContent = readFileSync(join(root, "docs/commentary-protocol.md"), "utf8");
    const sampleRoot = join(root, "wiki/submissions/commentary-audit-sample");
    const samplePaths = readdirSync(sampleRoot).flatMap((dialogue) =>
      readdirSync(join(sampleRoot, dialogue)).map((file) =>
        `wiki/submissions/commentary-audit-sample/${dialogue}/${file}`
      )
    );
    expect(samplePaths.length).toBeGreaterThan(0);
    for (const path of samplePaths) {
      const bytes = readFileSync(join(root, path));
      expect(isPublicHistoricalCommentaryAuditSample(path, bytes, protocolContent)).toBe(true);
    }

    const firstPath = samplePaths[0]!;
    const firstBytes = readFileSync(join(root, firstPath));
    const first = JSON.parse(firstBytes.toString("utf8")) as Record<string, any>;
    expect(isPublicHistoricalCommentaryAuditSample(firstPath, firstBytes, `${protocolContent}\n`)).toBe(false);
    expect(isPublicHistoricalCommentaryAuditSample(firstPath, Buffer.concat([firstBytes, Buffer.from(" ")]), protocolContent)).toBe(false);

    const rejects = (mutate: (value: Record<string, any>) => void, pathDialogue = first.dialogue as string) => {
      const value = structuredClone(first) as Record<string, any>;
      mutate(value);
      const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
      expect(isPublicHistoricalCommentaryAuditSample(samplePath(pathDialogue, bytes), bytes, protocolContent)).toBe(false);
    };
    rejects((value) => { value.schema_version = 2; });
    rejects((value) => { value.dialogue = "wrong-dialogue"; });
    rejects((value) => { value.sample_packet.sha256 = "0".repeat(64); });
    rejects((value) => {
      value.sample_packet.content = value.sample_packet.content.replace("# Commentary quality-audit contract", "# Altered contract");
      value.sample_packet.sha256 = sha256(Buffer.from(value.sample_packet.content));
    });
    rejects((value) => { value.extra_private_reference = ["Plan", "056"].join(" "); });
    rejects((value) => { value.extra_private_reference = ["Plan", "057"].join(" "); });
  });
});

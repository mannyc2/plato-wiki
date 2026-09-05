import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRepoRoot } from "../paths.js";
import { claimYamlBlocks } from "../wiki/claim-ledger.js";
import { fieldValue } from "../wiki/observation-ledger.js";
import { buildVoiceJoin } from "./voice-joins.js";
import { readVoiceIndex } from "./voices.js";

const REPO = getRepoRoot();

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function claimSpeakers(dialogue: string) {
  const ledger = readFileSync(join(REPO, `wiki/claims/${dialogue}.md`), "utf8");
  return new Map(
    claimYamlBlocks(ledger).map((block) => [
      fieldValue(block, "claim_id")!,
      {
        speaker: fieldValue(block, "speaker")!,
        reviewStatus: fieldValue(block, "review_status")!,
      },
    ]),
  );
}

describe("Apology/Crito/Menexenus/Meno voice and claim-speaker hard cut", () => {
  it("materializes every source-identified collective as a resolved terminal owner", () => {
    const apology = new Map(readVoiceIndex("apology").records.map((record) => [record.voiceId, record]));
    expect(apology.get("voice_apology_0002")?.voiceChain).toEqual(["ΣΩ.", "ΠΑΛΔ."]);
    expect(apology.get("voice_apology_0029")?.voiceChain).toEqual(["ΣΩ.", "ΑΘΔΙΚ."]);

    const crito = readVoiceIndex("crito").records.filter((record) => record.voiceChain.at(-1) === "ΝΟΜ.");
    expect(crito).toHaveLength(14);
    expect(crito.every((record) => record.resolution === "resolved")).toBe(true);

    const menexenus = new Map(readVoiceIndex("menexenus").records.map((record) => [record.voiceId, record]));
    for (const voiceId of ["voice_menexenus_0023", "voice_menexenus_0026", "voice_menexenus_0029"]) {
      expect(menexenus.get(voiceId)?.voiceChain).toEqual(["ΣΩ.", "ΑΣΠ.", "ΠΑΤ."]);
      expect(menexenus.get(voiceId)?.resolution).toBe("resolved");
    }

    const meno = new Map(readVoiceIndex("meno").records.map((record) => [record.voiceId, record]));
    expect(meno.get("voice_meno_0019")?.voiceChain).toEqual(["ΣΩ.", "ΛΑΚ."]);
    expect(meno.get("voice_meno_0019")?.resolution).toBe("resolved");
  });

  it("excludes the retired Meno poetic-citation cohort from voice authority", () => {
    const ids = new Set(readVoiceIndex("meno").records.map((record) => record.voiceId));
    expect(ids.has("voice_meno_0016")).toBe(false);
    expect(ids.has("voice_meno_0017")).toBe(false);

    const scope = JSON.parse(readFileSync(join(REPO, "wiki/reported-turn-scopes.json"), "utf8")) as {
      dialogues: Array<{ dialogue: string; outerTurnIds: string[] }>;
    };
    const meno = scope.dialogues.find((dialogue) => dialogue.dialogue === "meno");
    expect(meno?.outerTurnIds).not.toContain("turn_meno_0478");
  });

  it("anchors the Apology frame at the canonical Greek marker after the presentation prefix", () => {
    const source = readFileSync(join(REPO, "raw/plato/greek/apology.txt"), "utf8");
    const frame = readVoiceIndex("apology").records.find((record) => record.voiceId === "voice_apology_0001")!;
    expect(source.slice(0, frame.startChar)).toBe("{sp1} ");
    expect(source.slice(frame.startChar, frame.startChar + 5)).toBe("{17a}");
    expect(frame.startChar).toBe(6);
    expect(sha256(source.slice(frame.startChar, frame.endChar))).toBe(
      "86d02b0c0f2cd1c32781b0fb8dac115852a7e4ac3d0397ae363a76e59735ec7d",
    );
  });

  it("materializes every accepted claim speaker from current voice/turn authority", () => {
    for (const dialogue of ["apology", "crito", "menexenus", "meno"]) {
      const speakers = claimSpeakers(dialogue);
      const acceptedRows = buildVoiceJoin(dialogue).rows.filter(
        (row) => row.recordKind === "claim" && row.reviewStatus === "accepted",
      );
      expect(acceptedRows.length).toBeGreaterThan(0);
      for (const row of acceptedRows) {
        expect(["resolved", "turn_level"]).toContain(row.status);
        expect(speakers.get(row.recordId)?.speaker).toBe(row.owner);
      }
    }

    const menexenus = claimSpeakers("menexenus");
    for (let ordinal = 7; ordinal <= 24; ordinal += 1) {
      expect(menexenus.get(`claim_menexenus_${String(ordinal).padStart(4, "0")}`)?.speaker).toBe("ΑΣΠ.");
    }
    for (let ordinal = 25; ordinal <= 31; ordinal += 1) {
      expect(menexenus.get(`claim_menexenus_${String(ordinal).padStart(4, "0")}`)?.speaker).toBe("ΠΑΤ.");
    }
  });
});

import { describe, expect, it } from "bun:test";
import {
  inspectCommentaryListenerProse,
  validateCommentaryListenerProse,
} from "./commentary-listener-prose.js";

describe("commentary listener-facing prose", () => {
  it("accepts complete spoken prose", () => {
    expect(validateCommentaryListenerProse(
      "The request shifts attention from performance to judgment.",
      "body",
    )).toBe("The request shifts attention from performance to judgment.");
  });

  it("rejects internal corpus ids and incomplete sentences", () => {
    expect(() => validateCommentaryListenerProse(
      "The accepted claim claim_apology_0001 supports this point.",
      "body",
    )).toThrow("exposes internal record ids");
    expect(() => validateCommentaryListenerProse(
      "The request shifts attention from performance to judgment",
      "body",
    )).toThrow("must end at a complete sentence boundary");
  });

  it("accumulates typed mechanical issues without requiring titles to be sentences", () => {
    expect(inspectCommentaryListenerProse(
      "The accepted claim claim_apology_0001 supports this point",
    )).toEqual([
      {
        code: "internal_record_id",
        internalRecordIds: ["claim_apology_0001"],
        message: "exposes internal record ids in listener-facing prose: claim_apology_0001",
      },
      {
        code: "incomplete_sentence",
        message: "must end at a complete sentence boundary",
      },
    ]);
    expect(() => validateCommentaryListenerProse(
      "The accepted claim claim_apology_0001 supports this point",
      "body",
    )).toThrow(
      "body exposes internal record ids in listener-facing prose: claim_apology_0001; must end at a complete sentence boundary",
    );

    expect(inspectCommentaryListenerProse("Opening question", {
      requireCompleteSentence: false,
    })).toEqual([]);
    expect(inspectCommentaryListenerProse("Opening claim_apology_0001", {
      requireCompleteSentence: false,
    })).toEqual([
      {
        code: "internal_record_id",
        internalRecordIds: ["claim_apology_0001"],
        message: "exposes internal record ids in listener-facing prose: claim_apology_0001",
      },
    ]);
  });
});

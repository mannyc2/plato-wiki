import { describe, expect, it } from "bun:test";
import {
  COMMENTARY_AUTHORING_MODEL,
  COMMENTARY_CAMPAIGN_ID,
  COMMENTARY_MODEL_ARGUMENT,
  COMMENTARY_PERMISSION_MODE,
  COMMENTARY_STAGE_EFFORT,
} from "./commentary-authoring.js";

describe("commentary authoring policy", () => {
  it("pins exact GPT-5.6 Luna and stage-specific effort", () => {
    expect(COMMENTARY_CAMPAIGN_ID).toBe("plato-commentary-gpt-5-6-luna");
    expect(COMMENTARY_MODEL_ARGUMENT).toBe("gpt-5.6-luna");
    expect(COMMENTARY_AUTHORING_MODEL).toBe("gpt-5.6-luna");
    expect(COMMENTARY_PERMISSION_MODE).toBe("read-only");
    expect(COMMENTARY_STAGE_EFFORT).toEqual({
      outline: "high",
      draft: "medium",
      audit: "medium",
      rewrite: "high",
    });
  });
});

import { describe, expect, it } from "bun:test";
import { validateReferenceSourceCatalog } from "./audio-reference-sources.js";

function catalog() {
  return {
    schemaVersion: 2,
    status: "source-pool",
    discoveredAt: "2026-07-12",
    selectionPolicy: {
      purpose: "Dots auditions",
      preferredEdition: "full cast",
      automaticSelection: true,
      acceptancePolicy: "operator-authorized-deterministic-v1",
      clipRequirement: "Exact aligned clip and QA",
    },
    channel: {
      name: "Audiobooks Dimension",
      channelId: "UCK3uRn8icEYzDy8TY5Jns2g",
      channelUrl: "https://www.youtube.com/channel/UCK3uRn8icEYzDy8TY5Jns2g",
      discoveryUrl: "https://www.youtube.com/channel/UCK3uRn8icEYzDy8TY5Jns2g/videos",
    },
    dialogues: [
      {
        dialogue: "crito",
        videos: [
          {
            videoId: "MNDfJMrH1XY",
            title: "Crito",
            durationSeconds: 2014,
            url: "https://www.youtube.com/watch?v=MNDfJMrH1XY",
          },
        ],
      },
    ],
  };
}

describe("audio reference source pool", () => {
  it("accepts the exact deterministic source catalog with complete coverage", () => {
    expect(validateReferenceSourceCatalog("audio/reference-sources.json", JSON.stringify(catalog()), ["crito"])).toEqual([]);
  });

  it("rejects policy drift, URL drift, duplicates, and missing dialogue coverage", () => {
    const value = catalog();
    value.selectionPolicy.automaticSelection = false;
    value.dialogues[0]!.videos.push({
      ...value.dialogues[0]!.videos[0]!,
      url: "https://example.com/not-youtube",
    });
    const messages = validateReferenceSourceCatalog(
      "audio/reference-sources.json",
      JSON.stringify(value),
      ["crito", "symposium"],
    ).map((entry) => entry.message);
    expect(messages.some((message) => message.includes("deterministic v1"))).toBe(true);
    expect(messages.some((message) => message.includes("malformed"))).toBe(true);
    expect(messages.some((message) => message.includes("coverage"))).toBe(true);
  });
});

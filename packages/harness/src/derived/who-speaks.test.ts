import { describe, expect, it } from "bun:test";
import { chaptersOf, readChapters, shortChapterTitle } from "./chapters.js";
import { readWhoSpeaks, whoSpeaks } from "./who-speaks.js";

const turn = (speaker: string, startChar: number, endChar: number) => ({
  turnId: `t${startChar}`,
  speaker,
  startMarker: "1a",
  endMarker: "1a",
  startChar,
  endChar,
  textSha256: "",
  greekCharCount: endChar - startChar,
});

describe("whoSpeaks", () => {
  // Ten letters to A, ten to B, and inside B's turn a voice B performs and an unresolved quotation.
  const source = "αααααααααα ββββββββββ";
  const turns = [turn("Α.", 0, 10), turn("Β.", 11, 21)];

  it("counts letters for turn speakers and the innermost resolved voice", () => {
    const voices = [{ startChar: 11, endChar: 14, depth: 2, voiceChain: ["Β.", "Γ."], resolution: "resolved" }];
    expect(whoSpeaks("x", source, turns, voices, 1).shares).toEqual([
      { speaker: "Α.", letters: 10, quoted: 0 },
      { speaker: "Β.", letters: 7, quoted: 0 },
      { speaker: "Γ.", performer: "Β.", letters: 3, quoted: 0 },
    ]);
  });

  it("gives an unresolved voice to the speaker who quotes it at or below the scene", () => {
    const voices = [{ startChar: 11, endChar: 13, depth: 2, voiceChain: ["Β."], resolution: "unresolved" }];
    const atScene = whoSpeaks("x", source, turns, voices, 1);
    expect(atScene.shares.find(({ speaker }) => speaker === "Β.")).toEqual({ speaker: "Β.", letters: 10, quoted: 2 });
    expect(atScene.notYetAttributed).toBe(0);
    const aboveScene = whoSpeaks("x", source, turns, voices, 2);
    expect(aboveScene.notYetAttributed).toBe(2);
    expect(aboveScene.letters).toBe(20);
  });

  it("names an unlabelled turn's owner from a depth-1 voice and leaves unowned letters out", () => {
    const unlabelled = [turn("(none)", 0, 21)];
    const voices = [{ startChar: 0, endChar: 10, depth: 1, voiceChain: ["Α."], resolution: "resolved" }];
    const figures = whoSpeaks("x", source, unlabelled, voices, 1);
    expect(figures.shares).toEqual([{ speaker: "Α.", letters: 10, quoted: 0 }]);
    expect(figures.letters).toBe(10);
  });
});

// The figures docs/cutover/analysis.md quotes from the committed voices, reproduced here so a change
// to the rules or the records cannot move them unnoticed.
describe("Who speaks over the corpus", () => {
  const percent = (dialogue: string, scene: number) => {
    const figures = readWhoSpeaks(dialogue, scene);
    return Object.fromEntries(
      figures.shares.map(({ speaker, performer, letters }) => [performer ? `${speaker}<${performer}` : speaker, Number(((100 * letters) / figures.letters).toFixed(1))]),
    );
  };

  it("matches the plan's examples", () => {
    expect(percent("euthyphro", 1)).toEqual({ "ΣΩ.": 74.5, "ΕΥΘ.": 25.5 });
    expect(percent("crito", 1)).toMatchObject({ "ΣΩ.": 40.6, "ΝΟΜ.<ΣΩ.": 37.2, "ΚΡ.": 22 });
    expect(percent("menexenus", 1)).toMatchObject({ "ΑΣΠ.<ΣΩ.": 68.7, "ΠΑΤ.<ΑΣΠ.": 14.2, "ΣΩ.": 12.7 });
    expect(percent("symposium", 3)).toMatchObject({ "ΔΙΟ.<ΣΩ.": 17.8, "ΑΛΚ.": 16.4 });
  });

  it("accounts for every counted letter", () => {
    for (const [dialogue, scene] of [["phaedo", 2], ["apology", 1], ["protagoras", 2]] as const) {
      const figures = readWhoSpeaks(dialogue, scene);
      expect(figures.shares.reduce((sum, { letters }) => sum + letters, figures.notYetAttributed)).toBe(figures.letters);
    }
  });
});

describe("chapters", () => {
  it("starts each chapter at its first source line's marker", () => {
    expect(readChapters("crito").map(({ shortTitle, from }) => [shortTitle, from])).toEqual([
      ["Before dawn", "43a"],
      ["Which opinions matter, and what makes life worth living", "46b"],
      ["From agreement to consistency", "48b"],
      ["The Laws speak", "50a"],
      ["Exile, the final warning, and Crito's silence", "52d"],
    ]);
  });

  it("refuses a chapter with no anchored source line", () => {
    expect(() => chaptersOf({ chapters: [{ id: "c", title: "T" }], entries: [{ chapter_id: "c", kind: "commentary" }] })).toThrow(
      "chapter c has no source line with a Stephanus anchor",
    );
  });

  it("shortens a title to its leading clause", () => {
    expect(shortChapterTitle("Convicted — and surprised by the arithmetic")).toBe("Convicted");
    expect(shortChapterTitle("Where are the corrupted? A roll call")).toBe("Where are the corrupted?");
    expect(shortChapterTitle("From agreement to consistency")).toBe("From agreement to consistency");
  });
});

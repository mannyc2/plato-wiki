import { describe, expect, it } from "bun:test";
import { castForms, narrationUnits, passNarration, scoreVoicePass, type Narration } from "./voice-pass.js";

// A narrated exchange in the Republic's manner, with the paragraph marks the sources use.
const narrate = (paragraphs: string[]) => `{p} ${paragraphs.join(" {p} ")}`;
const cast = (source: string) => castForms(source, ["ΣΩ.", "ΓΛΑΥ.", "ΑΔ."]);
const narration = (source: string): Narration => ({
  dialogue: "republic",
  ranges: [[0, source.length]],
  narrator: "ΣΩ.",
  cast: cast(source),
});
const owners = (source: string) => passNarration(source, narration(source)).map((p) => p.owner ?? `? ${p.residue}`);

describe("castForms", () => {
  it("collects the capitalised forms that spell each siglum", () => {
    const source = "ὦ Γλαύκων, ἔφη ὁ Ἀδείμαντος, καὶ Γλαύκωνα εἶδον. ὦ Σώκρατες.";
    expect(cast(source)).toEqual([
      { siglum: "ΣΩ.", forms: ["Σώκρατες"] },
      { siglum: "ΓΛΑΥ.", forms: ["Γλαύκων", "Γλαύκωνα"] },
      { siglum: "ΑΔ.", forms: ["Ἀδείμαντος"] },
    ]);
  });
});

describe("narrationUnits", () => {
  it("cuts at paragraph marks and leaves trailing section markers to what follows", () => {
    const source = "{p} ναί, ἔφη. {357b} {p} οὐκοῦν, ἦν δ’ ἐγώ;";
    expect(narrationUnits(source, narration(source)).map(({ start, end }) => source.slice(start, end))).toEqual([
      "ναί, ἔφη.",
      "οὐκοῦν, ἦν δ’ ἐγώ;",
    ]);
  });
});

describe("passNarration", () => {
  it("owns paragraphs on first-person and named formulas, and alternates between them", () => {
    const source = narrate([
      "τί δέ, ἦν δ’ ἐγώ, ὦ Γλαύκων;",
      "πάνυ μὲν οὖν, ἔφη.",
      "οὐκοῦν τοῦτο;",
      "ἀληθῆ, ἔφη ὁ Γλαύκων.",
    ]);
    expect(owners(source)).toEqual(["ΣΩ.", "ΓΛΑΥ.", "ΣΩ.", "ΓΛΑΥ."]);
  });

  it("sends a run to review when a new speaker is named at its end", () => {
    const source = narrate(["τί δέ, ἦν δ’ ἐγώ, ὦ Γλαύκων;", "πάνυ μὲν οὖν, ἔφη.", "οὐκοῦν τοῦτο;", "ἀληθῆ, ἔφη ὁ Ἀδείμαντος."]);
    expect(owners(source)).toEqual([
      "ΣΩ.",
      "? alternation conflicts with the next anchor",
      "? alternation conflicts with the next anchor",
      "ΑΔ.",
    ]);
  });

  it("keeps the partner the narrator last named", () => {
    const source = narrate(["ἆρα, ἦν δ’ ἐγώ, ὦ Ἀδείμαντε;", "ναί.", "οὐκοῦν, ἦν δ’ ἐγώ;"]);
    expect(castForms(source, ["ΑΔ."])[0]?.forms).toEqual(["Ἀδείμαντε"]);
    expect(owners(source)).toEqual(["ΣΩ.", "ΑΔ.", "ΣΩ."]);
  });

  it("does not take a name the speech is about for its speaker", () => {
    const source = narrate(["οὕτως ἄρα ὁ Γλαύκων πάντα ταῦτα καὶ ἄλλα πολλὰ ποιεῖ, ἔφη."]);
    expect(owners(source)).toEqual(["? no anchor before the run"]);
  });

  it("sends a run to review when alternation cannot reach the next anchor", () => {
    const source = narrate(["τί δέ, ἦν δ’ ἐγώ, ὦ Γλαύκων;", "ναί.", "οὔ.", "πῶς, ἦν δ’ ἐγώ;"]);
    expect(owners(source)).toEqual([
      "ΣΩ.",
      "? alternation conflicts with the next anchor",
      "? alternation conflicts with the next anchor",
      "ΣΩ.",
    ]);
  });

  it("leaves the reply to a plural address open", () => {
    const source = narrate(["τί οὖν ὑμεῖς, ἦν δ’ ἐγώ, ὦ Γλαύκων;", "ναί.", "οὐκοῦν, ἦν δ’ ἐγώ;"]);
    expect(owners(source)).toEqual(["ΣΩ.", "? reply to a plural address", "ΣΩ."]);
  });

  it("treats narration leading into speech as a split", () => {
    const source = narrate(["καὶ ἐγὼ ἀκούσας, ὦ Γλαύκων, ἔφην, τί λέγεις;"]);
    expect(owners(source)).toEqual(["? narrated lead (split candidate)"]);
  });
});

describe("scoreVoicePass", () => {
  it("compares each paragraph's owner with the accepted voice over its letters", () => {
    const source = narrate(["τί δέ, ἦν δ’ ἐγώ, ὦ Γλαύκων;", "πάνυ μὲν οὖν, ἔφη."]);
    const predictions = passNarration(source, narration(source));
    const [first, second] = predictions;
    const voice = (p: typeof first, owner: string, accepted = true) => ({
      startChar: p!.start,
      endChar: p!.end,
      depth: 2,
      owner,
      reviewed: false,
      accepted,
    });
    const agreeing = scoreVoicePass(source, predictions, [voice(first, "ΣΩ."), voice(second, "ΓΛΑΥ.")], 2);
    expect(agreeing.outcomes).toEqual({ agree: 2 });
    expect(agreeing.agreeingLetters).toBe(agreeing.ownedLetters);
    const wrong = scoreVoicePass(source, predictions, [voice(first, "ΣΩ."), voice(second, "ΑΔ.")], 2);
    expect(wrong.outcomes).toEqual({ agree: 1, disagree: 1 });
    expect(wrong.byRule["alternation between anchors"]).toEqual({ agree: 0, disagree: 1 });
    const pending = scoreVoicePass(source, predictions, [voice(first, "ΣΩ."), voice(second, "ΑΔ.", false)], 2);
    expect(pending.outcomes).toEqual({ agree: 1, unscored: 1 });
  });
});

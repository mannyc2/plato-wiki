import { describe, expect, test } from "bun:test";
import { checkEnglishErrata, parseEnglishErrata, plainSourceText } from "./english-errata.js";

const entry = (fields: string) => `schema_version = 1\n\n[[erratum]]\n${fields}\n`;
const valid = [
  'dialogue = "apology"',
  'span = "38b"',
  'kind = "name"',
  'english = "and Aristobulus"',
  'greek = "Ἀπολλόδωρος"',
  'correction = "Apollodorus, not Aristobulus."',
].join("\n");

describe("parseEnglishErrata", () => {
  test("accepts a complete entry", () => {
    const { errata, failures } = parseEnglishErrata(entry(valid));
    expect(failures).toEqual([]);
    expect(errata).toEqual([
      {
        dialogue: "apology",
        span: "38b",
        kind: "name",
        english: "and Aristobulus",
        greek: "Ἀπολλόδωρος",
        correction: "Apollodorus, not Aristobulus.",
      },
    ]);
  });

  test("rejects unknown kinds, unknown fields and untrimmed text", () => {
    const fields = valid.replace('kind = "name"', 'kind = "typo"').replace('greek = "Ἀπολλόδωρος"', 'greek = " Ἀπολλόδωρος"');
    const { errata, failures } = parseEnglishErrata(entry(`${fields}\nnote = "x"`));
    expect(errata).toEqual([]);
    expect(failures).toEqual([
      "erratum[0]: unknown field note",
      "erratum[0]: greek must be a non-empty trimmed string",
      "erratum[0]: kind must be one of name, omission, addition, reversal, sense",
    ]);
  });

  test("requires the schema version", () => {
    expect(parseEnglishErrata("").failures).toEqual(["schema_version must be 1"]);
  });
});

describe("checkEnglishErrata", () => {
  const { errata } = parseEnglishErrata(entry(valid));
  const greek = () => "{38b} … καὶ {pers} Ἀπολλόδωρος {/pers} κελεύουσί …";

  test("matches words across the sources' tags", () => {
    expect(plainSourceText("men of {place} Athens {/place} , and")).toBe("men of Athens , and");
    expect(checkEnglishErrata(errata, () => "Crito and Critobulus, {q} and Aristobulus {/q} tell me", greek)).toEqual([]);
  });

  test("fails when the English words are missing or ambiguous", () => {
    expect(checkEnglishErrata(errata, () => "Crito and Critobulus", greek)).toEqual([
      'apology 38b "and Aristobulus": English words occur 0 times in the span, expected once',
    ]);
    expect(checkEnglishErrata(errata, () => "and Aristobulus and Aristobulus", greek)).toEqual([
      'apology 38b "and Aristobulus": English words occur 2 times in the span, expected once',
    ]);
  });

  test("fails when the Greek term is not in the span", () => {
    expect(checkEnglishErrata(errata, () => "and Aristobulus", () => "Κριτόβουλος")).toEqual([
      'apology 38b "and Aristobulus": Greek term "Ἀπολλόδωρος" is not in the span',
    ]);
  });

  test("fails on a repeated entry", () => {
    expect(checkEnglishErrata([...errata, ...errata], () => "and Aristobulus", greek)).toEqual([
      'apology 38b "and Aristobulus": duplicate erratum',
    ]);
  });
});

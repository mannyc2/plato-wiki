import { describe, expect, it } from "bun:test";
import { siteJs } from "./layout.js";
import { buildSearchIndex, type SearchRecordInput } from "./search.js";

class Element {
  children: Element[] = [];
  className = "";
  textContent = "";
  href = "";

  append(child: Element) {
    this.children.push(child);
  }

  replaceChildren() {
    this.children = [];
  }
}

const records: SearchRecordInput[] = [
  {
    id: "obs_meno_0001", target: "dialogues/meno/records-part-1.html#obs_meno_0001",
    kind: "observation", dialogue: "meno", snippet: "The initial question concerns virtue.",
    axis: "dramatic_case_setup\tanswer_form", concept: "initial_question_stated direct_answer",
  },
  {
    id: "obs_meno_0002", target: "dialogues/meno/records-part-1.html#obs_meno_0002",
    kind: "observation", dialogue: "meno", snippet: "A later question concerns virtue.",
    axis: "subject_matter", concept: "virtue",
  },
  {
    id: "claim_meno_0001", target: "dialogues/meno/claims.html#claim_meno_0001",
    kind: "claim", dialogue: "meno", snippet: "A claim about virtue.",
  },
  {
    id: "obs_sophist_0001", target: "dialogues/sophist/records-part-1.html#obs_sophist_0001",
    kind: "observation", dialogue: "sophist", snippet: "Another dialogue mentions virtue.",
  },
];

function mountSearch() {
  const index = buildSearchIndex(records);
  const resources = new Map([
    ["assets/search/manifest.json", index.manifest],
    ...index.shards.map((shard) => [shard.path, JSON.parse(shard.json)] as const),
  ]);
  const requested: string[] = [];
  const query = { value: "virtue" };
  const controls = ["kind", "dialogue", "axis", "concept", "status"].map((field) => ({
    dataset: { searchFilter: field }, value: "",
  }));
  const status = new Element();
  const results = new Element();
  let submit: ((event: { preventDefault(): void }) => Promise<void>) | undefined;
  const form = {
    dataset: { manifestSrc: "assets/search/manifest.json" },
    querySelector: (selector: string) => selector === "[data-search-query]" ? query : null,
    querySelectorAll: () => controls,
    addEventListener: (_event: string, listener: typeof submit) => { submit = listener; },
  };
  const document = {
    querySelector: (selector: string) => {
      if (selector === "[data-corpus-search]") return form;
      if (selector === "[data-search-status]") return status;
      if (selector === "[data-search-results]") return results;
      return null;
    },
    querySelectorAll: () => [],
    createElement: () => new Element(),
  };
  const fetch = async (path: string) => {
    requested.push(path);
    if (!resources.has(path)) throw new Error(`Unexpected search request: ${path}`);
    return { ok: true, json: async () => resources.get(path) };
  };
  new Function("document", "window", "fetch", siteJs())(
    document, { addEventListener: () => undefined }, fetch,
  );

  return {
    status,
    requested,
    search: async (selected: Record<string, string>) => {
      for (const control of controls) control.value = selected[control.dataset.searchFilter] ?? "";
      if (!submit) throw new Error("Emitted search script did not register form submission");
      await submit({ preventDefault() {} });
      return results.children.map((item) => item.children[0]!.children[0]!.href);
    },
  };
}

describe("emitted corpus search", () => {
  it("renders matching observations from the selected dialogue after form submission", async () => {
    const page = mountSearch();
    expect(new Set(await page.search({ kind: "observation", dialogue: "meno" }))).toEqual(new Set([
      records[0]!.target, records[1]!.target,
    ]));
    expect(page.status.textContent).toBe("2 results.");
    expect(page.requested).toEqual([
      "assets/search/manifest.json", "assets/search/search-observation-meno.json",
    ]);
  });

  it("selects a complete axis membership from records with multiple axes", async () => {
    const page = mountSearch();
    expect(await page.search({ kind: "observation", dialogue: "meno", axis: "answer_form" })).toEqual([
      records[0]!.target,
    ]);
    expect(page.status.textContent).toBe("1 result.");
    expect(await page.search({ kind: "observation", dialogue: "meno", axis: "form" })).toEqual([]);
    expect(page.status.textContent).toBe("No results.");
  });
});

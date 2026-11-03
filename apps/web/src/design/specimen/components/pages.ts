// Components: Pages. A curated page as it is written and as it is drawn, what the checker says
// about a page that misquotes, and the blocks a page can use.
import type { Html, HtmlBuilder } from "foldkit/html";
import { blockView, contextFor } from "../../block-views";
import { parsePage } from "../../blocks";
import explainSource from "../../pages/crito/43b-c.md" with { type: "text" };

const explain = parsePage(explainSource);

// A note that misquotes, cites a person the corpus does not have, and leaves a citation unsourced.
const BROKEN = `## What’s happening

Crito wakes him at once.[^woke] Socrates calls dying at his age a misfortune.[^age]

:::views
- socrates: At his age, death is nothing to be troubled by.[^age]
- plato: He was not there.
:::

[^age]: crito 43b-c "it would be absurd if at my age I were troubled"`;

const BLOCKS: ReadonlyArray<readonly [string, string]> = [
  ["::passage{ref from to lit}", "Words pulled from the text by reference, with a phrase lit. Marked feature, it is set large."],
  [":::moves", "The steps of an argument in order, each with the idea at work. Past four steps, the first three show and the rest open on request."],
  [":::views{unresolved}", "Two speakers’ positions, and whether the passage settles between them. The words cited for each must be that speaker’s."],
  [":::people", "Everyone else in the dialogue, with their portraits and what they are to this person. A row leads to that person’s own page."],
  ["::analytic{name in}", "A figure the app counts, such as who speaks."],
  ["::arc{collection at}", "The story the dialogue belongs to, in the order it happens, with each dialogue’s moment in it."],
  ['[^key]: ref "words"', "A citation. The words must be found at the reference given."],
];

export const pagesSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat"), h.Id("c-pages")],
    [
      h.h3([h.Class("sub")], ["Pages"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Person pages, Explain notes and answers written on request share one format: Markdown with a few named blocks. A page names passages, ideas, people and figures, and the app pulls the words and the counts, so a page never retypes Plato or states a number that can go stale.",
        ],
      ),
      h.div(
        [h.Class("kgrid top")],
        [
          h.div(
            [h.Class("kt wide tall")],
            [
              h.div(
                [h.Class("kt-stage A pg-two")],
                [
                  h.pre([h.Class("md-src")], [h.code([], [explainSource.trim()])]),
                  h.div(
                    [h.Class("a-web-card")],
                    [...explain.page.blocks.map((block) => blockView(block, contextFor(explain.page, "sheet"), h))],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Source and page."]),
                  " The Explain note on Crito 43b–c as it is written and as it is drawn. Tap or hover a number to see the sentence it rests on.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage col")],
                [
                  h.pre([h.Class("md-src")], [h.code([], [BROKEN])]),
                  h.ol([h.Class("chk")], parsePage(BROKEN).problems.map((problem) => h.li([], [problem]))),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["The checker."]),
                  " What the writer of a page that misquotes gets back, whether a person or an agent: one line per problem, in line order. A page is shown only when the list is empty. This is the checker’s real output for the page above it.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage col")],
                [h.dl([h.Class("bk-cat")], BLOCKS.flatMap(([name, what]) => [h.dt([], [h.code([], [name])]), h.dd([], [what])]))],
              ),
              h.p(
                [],
                [
                  h.b([], ["Blocks."]),
                  " Everything else is prose and headings. A template decides where each block sits, such as the side cards on a person page.",
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
];

// Desktop at 1440: Person, drawn from the curated page in pages/crito/socrates.md. The page says
// what each section holds; this template decides that figures, company and the story around the
// dialogue sit beside the reading column, as cards.
import type { Html, HtmlBuilder } from "foldkit/html";
import { blockView, type Context, contextFor, type Section, sections, trailView } from "../../block-views";
import { type Block, parsePage } from "../../blocks";
import { icon } from "../../icons";
import source from "../../pages/crito/socrates.md" with { type: "text" };
import { avatar, type PersonKey } from "../../people";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

const { page } = parsePage(source);
// Crito and the Laws have their own pages in the Crito, so their cast rows lead on.
const pages: ReadonlySet<PersonKey> = new Set(["crito", "laws"]);
const context = { ...contextFor(page, "page", { key: "save", side: "end" }), pages };

const SIDE: ReadonlySet<string> = new Set(["who-speaks", "cast", "arc"]);

// Passages that follow one another sit side by side, so a scene reads as one moment.
const mainBlocks = <Message>(blocks: ReadonlyArray<Block>, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const passages = blocks.filter((block) => block.kind === "passage" && !block.feature);
  if (passages.length < 2 || passages.length !== blocks.length) return blocks.map((block) => blockView(block, context, h));
  return [h.div([h.Class("bk-row")], passages.map((block) => blockView(block, context, h)))];
};

const mainSection = <Message>({ heading, blocks }: Section, h: HtmlBuilder<Message>): ReadonlyArray<Html> =>
  heading
    ? [blockView(heading, context, h), ...mainBlocks(blocks, h)]
    : [h.div([h.Class("bk-lede")], blocks.map((block) => blockView(block, context, h)))];

const sideCard = <Message>({ heading, blocks }: Section, side: Context, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class("w-card")],
    [
      ...(heading ? [h.div([h.Class("w-card-h")], [h.h2([h.Class("a-h3"), h.Id(heading.id)], [heading.text])])] : []),
      ...blocks.map((block) => blockView(block, side, h)),
    ],
  );

export const personFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const all = sections(page);
  const main = all.filter((section) => !SIDE.has(section.heading?.id ?? ""));
  const side = all.filter((section) => SIDE.has(section.heading?.id ?? ""));
  return [
    frame(
      {
        id: "web-person",
        tab: "Socrates in the Crito · Plato",
        caption: {
          title: "Person",
          text: "A person page is curated. Its source is a short Markdown page that names passages, ideas, people and figures; the app pulls the words and the counts, so the page never retypes Plato or states a number that can go stale. This one is Socrates in the Crito. Every claim carries a citation, and its card shows the sentence it rests on. The role counts follow the analysis plan’s proposed rules over the 21 of his dialogues whose scene speakers are marked well enough; the Republic, Parmenides, Charmides, Lysis and Euthydemus join when theirs are. He narrates the Protagoras and leads it, so it counts under both.",
        },
      },
      [
        h.div(
          [h.Class("w-app nobar")],
          [
            sidebar({ place: "explore" }, h),
            h.div(
              [h.Class("w-main"), h.Style({ "--band": "#ECD8CD" })],
              [
                h.div([h.Class("w-band")]),
                h.div(
                  [h.Class("w-in")],
                  [
                    h.span([h.Class("a-ib glass w-back-ib")], [icon("chev-l", h)]),
                    h.div(
                      [h.Class("w-who")],
                      [
                        avatar({ person: "socrates", size: "w-xxl" }, h),
                        h.div(
                          [],
                          [
                            h.h1([h.Class("w-h1")], [page.title ?? ""]),
                            h.p([h.Class("w-bm")], ["In 26 of the 27 dialogues; not in the Laws"]),
                            h.div(
                              [h.Class("w-roles")],
                              [
                                h.span([h.Class("w-role r-leads")], [h.b([], ["Leads"]), h.i([], ["17"])]),
                                h.span([h.Class("w-role r-narrates")], [h.b([], ["Narrates"]), h.i([], ["1"])]),
                                h.span([h.Class("w-role r-mostly")], [h.b([], ["Mostly listens"]), h.i([], ["4"])]),
                                h.span([h.Class("w-roles-n")], ["5 not yet counted"]),
                              ],
                            ),
                          ],
                        ),
                        h.span([h.Class("grow")]),
                        h.span([h.Class("a-btn ghost sm")], [icon("share", h), "Share"]),
                      ],
                    ),
                    h.div(
                      [h.Class("chips")],
                      [h.span([h.Class("a-chip on")], ["In the Crito"]), h.span([h.Class("a-chip")], ["In every dialogue"])],
                    ),
                    h.div(
                      [h.Class("w-cols")],
                      [
                        h.article([h.Class("bk-page")], [...main.flatMap((section) => mainSection(section, h)), trailView(context, h)]),
                        h.aside([h.Class("w-stack")], side.map((section) => sideCard(section, context, h))),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ];
};

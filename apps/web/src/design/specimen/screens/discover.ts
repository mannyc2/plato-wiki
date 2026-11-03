// Phone screens: Finding something.
import type { Html, HtmlBuilder } from "foldkit/html";
import { blockView, contextFor, sections } from "../../block-views";
import { parsePage } from "../../blocks";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { TRAILS, ideaTrail } from "../../idea-trail";
import { IDEAS, ideaBadge } from "../../ideas";
import { IDEA_QUOTES, passageCard } from "../../passage-cards";
import socratesSource from "../../pages/crito/socrates.md" with { type: "text" };
import { avatar } from "../../people";
import { phone } from "../frames";

const truth = IDEAS["truth-priority"];
const socrates = parsePage(socratesSource);
const socratesContext = contextFor(socrates.page, "page");

export const discoverScreens = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  phone(
    { caption: { title: "Home", text: "Continue card in the way you last took the dialogue, then shelves. The mini player floats above the tab bar only while something is loaded to play." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-head")],
            [
              h.h1([h.Class("a-title")], ["Reading now"]),
              h.span([h.Class("a-me")], [icon("user", h)]),
            ],
          ),
          h.div(
            [h.Class("a-continue")],
            [
              cover({ dialogue: "crito", size: "md" }, h),
              " ",
              h.div(
                [h.Class("a-continue-b")],
                [
                  h.b([h.Class("a-continue-t")], ["Crito"]),
                  " ",
                  h.span([h.Class("a-meta")], ["Chapter 2 of 5 · 3 chapters left"]),
                  " ",
                  h.span(
                    [h.Class("w-segs"), h.Style({ "--n": "5" })],
                    [
                      h.i([h.Class("done")]),
                      h.i([h.Class("part"), h.Style({ "--f": "45%" })]),
                      h.i([]),
                      h.i([]),
                      h.i([]),
                    ],
                  ),
                  " ",
                  h.span(
                    [h.Class("a-row")],
                    [
                      h.span([h.Class("a-btn fill sm")], ["Continue reading"]),
                      h.span([h.Class("a-ib"), h.AriaLabel("Listen from here")], [icon("headphones", h)]),
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("a-sec")],
            [
              h.h2([h.Class("a-h2")], ["The trial and death of Socrates"]),
              h.span([h.Class("a-link")], ["See all"]),
            ],
          ),
          h.p([h.Class("a-sec-sub")], ["Four dialogues, best read in order."]),
          h.div(
            [h.Class("a-shelf")],
            [
              h.span(
                [h.Class("a-book")],
                [
                  cover({ dialogue: "euthyphro" }, h),
                  h.b([], ["Euthyphro"]),
                  h.span([], ["29 min"]),
                ],
              ),
              h.span(
                [h.Class("a-book")],
                [
                  cover({ dialogue: "apology" }, h),
                  h.b([], ["Apology"]),
                  h.span([], ["50 min"]),
                ],
              ),
              h.span(
                [h.Class("a-book")],
                [
                  cover({ dialogue: "crito" }, h),
                  h.b([], ["Crito"]),
                  h.span([], ["24 min"]),
                ],
              ),
              h.span(
                [h.Class("a-book")],
                [
                  cover({ dialogue: "phaedo" }, h),
                  h.b([], ["Phaedo"]),
                  h.span([], ["1 h 57 min"]),
                ],
              ),
            ],
          ),
        ],
      ),
      h.nav(
        [h.Class("tb")],
        [
          h.span(
            [h.Class("tb-pill")],
            [
              h.span([h.Class("on")], [icon("home", h), h.b([], ["Home"])]),
              h.span([h.Class("")], [icon("books", h), h.b([], ["Library"])]),
              h.span([h.Class("")], [icon("compass", h), h.b([], ["Explore"])]),
            ],
          ),
          h.span([h.Class("tb-search")], [icon("search", h)]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Library", text: "Covers in a grid with progress under each. Filter chips instead of tabs." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-head")],
            [
              h.h1([h.Class("a-title")], ["Library"]),
              h.span(
                [h.Class("a-row")],
                [
                  h.span([h.Class("a-ib soft")], [icon("grid", h)]),
                  h.span([h.Class("a-ib soft")], [icon("more", h)]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("chips")],
            [
              h.span([h.Class("a-chip on")], ["All"]),
              h.span([h.Class("a-chip")], ["Reading"]),
              h.span([h.Class("a-chip")], ["Listening"]),
              h.span([h.Class("a-chip")], ["Finished"]),
            ],
          ),
          h.div(
            [h.Class("lib")],
            [
              h.span(
                [h.Class("lib-i")],
                [
                  cover({ dialogue: "crito", size: "fill" }, h),
                  h.span(
                    [h.Class("lib-m")],
                    [
                      h.span([h.Class("lib-s")], [h.b([], ["25%"])]),
                      h.span([h.Class("lib-more")], [icon("more", h)]),
                    ],
                  ),
                ],
              ),
              h.span(
                [h.Class("lib-i")],
                [
                  cover({ dialogue: "apology", size: "fill" }, h),
                  h.span(
                    [h.Class("lib-m")],
                    [
                      h.span([h.Class("lib-s done")], [icon("check", h), "Finished"]),
                      h.span([h.Class("lib-more")], [icon("more", h)]),
                    ],
                  ),
                ],
              ),
              h.span(
                [h.Class("lib-i")],
                [
                  cover({ dialogue: "phaedo", size: "fill" }, h),
                  h.span(
                    [h.Class("lib-m")],
                    [
                      h.span([h.Class("lib-s")], [icon("headphones", h), "1 h 12 min left"]),
                      h.span([h.Class("lib-more")], [icon("more", h)]),
                    ],
                  ),
                ],
              ),
              h.span(
                [h.Class("lib-i")],
                [
                  cover({ dialogue: "euthyphro", size: "fill" }, h),
                  h.span(
                    [h.Class("lib-m")],
                    [
                      h.span([h.Class("lib-s new")], ["New"]),
                      h.span([h.Class("lib-more")], [icon("more", h)]),
                    ],
                  ),
                ],
              ),
              h.span(
                [h.Class("lib-i")],
                [
                  cover({ dialogue: "meno", size: "fill" }, h),
                  h.span(
                    [h.Class("lib-m")],
                    [
                      h.span([h.Class("lib-s")], [h.b([], ["8%"])]),
                      h.span([h.Class("lib-more")], [icon("more", h)]),
                    ],
                  ),
                ],
              ),
              h.span(
                [h.Class("lib-i")],
                [
                  cover({ dialogue: "symposium", size: "fill" }, h),
                  h.span(
                    [h.Class("lib-m")],
                    [
                      h.span([h.Class("lib-s new")], ["New"]),
                      h.span([h.Class("lib-more")], [icon("more", h)]),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("mp")],
        [
          cover({ dialogue: "crito", size: "xs" }, h),
          h.span([h.Class("mp-t")], [h.b([], ["Before dawn"]), h.span([], ["Crito · Chapter 1"])]),
          h.span([h.Class("mp-b")], [icon("back15", h)]),
          h.span([h.Class("mp-b")], [icon("pause", h)]),
        ],
      ),
      h.nav(
        [h.Class("tb")],
        [
          h.span(
            [h.Class("tb-pill")],
            [
              h.span([h.Class("")], [icon("home", h), h.b([], ["Home"])]),
              h.span([h.Class("on")], [icon("books", h), h.b([], ["Library"])]),
              h.span([h.Class("")], [icon("compass", h), h.b([], ["Explore"])]),
            ],
          ),
          h.span([h.Class("tb-search")], [icon("search", h)]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Explore", text: "Ideas from the corpus’s comparison index, grouped into sections. The counts are real; the section names are proposed copy." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-head")],
            [
              h.h1([h.Class("a-title")], ["Explore"]),
              h.span([h.Class("a-me")], [icon("user", h)]),
            ],
          ),
          h.div(
            [h.Class("coll")],
            [
              h.span(
                [h.Class("coll-cv")],
                [
                  cover({ dialogue: "euthyphro", size: "sm" }, h),
                  cover({ dialogue: "apology", size: "sm" }, h),
                  cover({ dialogue: "crito", size: "sm" }, h),
                  cover({ dialogue: "phaedo", size: "sm" }, h),
                ],
              ),
              h.span(
                [h.Class("coll-b")],
                [
                  h.b([], ["The trial and death of Socrates"]),
                  h.span([], ["4 dialogues · best read in order"]),
                ],
              ),
              icon("chev-r", h),
            ],
          ),
          h.div(
            [h.Class("a-sec")],
            [
              h.h2([h.Class("a-h2")], ["Analogies and images"]),
              h.span([h.Class("a-link")], ["See all"]),
            ],
          ),
          h.div(
            [h.Class("ideas")],
            [
              h.span(
                [h.Class("it")],
                [
                  ideaBadge({ idea: "expert-craft" }, h),
                  h.b([], ["Expert craft analogy"]),
                  h.span([], ["In 18 dialogues"]),
                ],
              ),
              h.span(
                [h.Class("it")],
                [
                  ideaBadge({ idea: "poetic-citation" }, h),
                  h.b([], ["Poetic citation as argument"]),
                  h.span([], ["In 11 dialogues"]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("a-sec")],
            [
              h.h2([h.Class("a-h2")], ["How the argument moves"]),
              h.span([h.Class("a-link")], ["See all"]),
            ],
          ),
          h.div(
            [h.Class("ideas")],
            [
              h.span(
                [h.Class("it")],
                [
                  ideaBadge({ idea: "definition" }, h),
                  h.b([], ["Definition proposed"]),
                  h.span([], ["In 22 dialogues"]),
                ],
              ),
              h.span(
                [h.Class("it")],
                [
                  ideaBadge({ idea: "forced-alternative" }, h),
                  h.b([], ["Forced alternative"]),
                  h.span([], ["In 14 dialogues"]),
                ],
              ),
              h.span(
                [h.Class("it")],
                [
                  ideaBadge({ idea: "aporia" }, h),
                  h.b([], ["Aporia reported"]),
                  h.span([], ["In 15 dialogues"]),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("mp")],
        [
          cover({ dialogue: "crito", size: "xs" }, h),
          h.span([h.Class("mp-t")], [h.b([], ["Before dawn"]), h.span([], ["Crito · Chapter 1"])]),
          h.span([h.Class("mp-b")], [icon("back15", h)]),
          h.span([h.Class("mp-b")], [icon("pause", h)]),
        ],
      ),
      h.nav(
        [h.Class("tb")],
        [
          h.span(
            [h.Class("tb-pill")],
            [
              h.span([h.Class("")], [icon("home", h), h.b([], ["Home"])]),
              h.span([h.Class("")], [icon("books", h), h.b([], ["Library"])]),
              h.span([h.Class("on")], [icon("compass", h), h.b([], ["Explore"])]),
            ],
          ),
          h.span([h.Class("tb-search")], [icon("search", h)]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Search", text: "English search across the dialogues: “opinion” appears in 467 passages. Ideas show their passages; each title appears once." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div([h.Class("a-head")], [h.h1([h.Class("a-title")], ["Search"])]),
          h.div(
            [h.Class("chips")],
            [
              h.span([h.Class("a-chip on")], ["All"]),
              h.span([h.Class("a-chip")], ["Passages"]),
              h.span([h.Class("a-chip")], ["Ideas"]),
              h.span([h.Class("a-chip")], ["Dialogues"]),
            ],
          ),
          h.div(
            [h.Class("sr-h")],
            [
              h.h2([h.Class("a-h3")], ["Passages"]),
              h.span([], ["467 in 25 dialogues"]),
            ],
          ),
          h.div(
            [h.Class("sr")],
            [
              cover({ dialogue: "crito", size: "xs" }, h),
              h.div(
                [],
                [
                  h.span([h.Class("sr-m")], ["Crito · 47c · Socrates"]),
                  h.p(
                    [],
                    [
                      "…ought we to follow and fear the ",
                      h.mark([], ["opinion"]),
                      " of the many or that of the one, if there is anyone who knows about them, whom we ought to revere and fear more than all the others?",
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("sr")],
            [
              cover({ dialogue: "crito", size: "xs" }, h),
              h.div(
                [],
                [
                  h.span([h.Class("sr-m")], ["Crito · 44d · Crito"]),
                  h.p(
                    [],
                    [
                      "But you see it is necessary, Socrates, to care for the ",
                      h.mark([], ["opinion"]),
                      " of the public, for this very trouble we are in now shows that the public is able to accomplish not by any means the least, but almost the greatest of evils…",
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("sr")],
            [
              cover({ dialogue: "crito", size: "xs" }, h),
              h.div(
                [],
                [
                  h.span([h.Class("sr-m")], ["Crito · 48a · Socrates"]),
                  h.p(
                    [],
                    [
                      "…when you began by saying we ought to consider the ",
                      h.mark([], ["opinion"]),
                      " of the multitude about the right and the noble and the good and their opposites.",
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div([h.Class("sr-h")], [h.h2([h.Class("a-h3")], ["Ideas"])]),
          h.div(
            [h.Class("sr-i")],
            [
              ideaBadge({ idea: "common-opinion" }, h),
              h.span(
                [h.Class("sr-ib")],
                [
                  h.b([], ["Common opinion deployed as challenge"]),
                  h.span([], ["7 passages · 5 dialogues"]),
                ],
              ),
              icon("chev-r", h),
            ],
          ),
          h.div(
            [h.Class("sr-i")],
            [
              ideaBadge({ idea: "knowledge-opinion" }, h),
              h.span(
                [h.Class("sr-ib")],
                [
                  h.b([], ["Knowledge vs right opinion"]),
                  h.span([], ["6 passages · 2 dialogues"]),
                ],
              ),
              icon("chev-r", h),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("sbar")],
        [
          h.span(
            [h.Class("sf")],
            [
              icon("search", h),
              h.b([], ["opinion"]),
              h.span([h.Class("sf-x")], [icon("x", h)]),
            ],
          ),
          h.span([h.Class("tb-search")], [icon("x", h)]),
        ],
      ),
    ],
    h,
  ),
  phone(
    {
      caption: {
        title: "Idea",
        text: "The idea’s emblem, its line and real counts, then where you stand with it: where you met it and where it comes next in what you are hearing. Its passages follow, quoted from the text by reference.",
      },
    },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-topbar")],
            [h.span([h.Class("a-ib soft")], [icon("chev-l", h)]), h.span([h.Class("grow")]), h.span([h.Class("a-ib soft")], [icon("share", h)])],
          ),
          h.div(
            [h.Class("idea-h")],
            [ideaBadge({ idea: "truth-priority", size: "md" }, h), h.h1([h.Class("idea-t")], [truth.name]), h.p([], [truth.line])],
          ),
          h.div(
            [h.Class("a-facts two")],
            [h.span([], [h.b([], [String(truth.passages)]), "Passages"]), h.span([], [h.b([], [String(truth.dialogues)]), "Dialogues"])],
          ),
          h.div([h.Class("a-sec tight")], [h.h2([h.Class("a-h3")], ["You and this idea"])]),
          ...ideaTrail({ stops: TRAILS["truth-priority"].stops, beyond: [] }, h),
          h.div([h.Class("a-sec tight")], [h.h2([h.Class("a-h3")], ["Passages"])]),
          ...IDEA_QUOTES["truth-priority"].slice(0, 2).map((passage) => passageCard(passage, h)),
        ],
      ),
    ],
    h,
  ),
  phone(
    {
      caption: {
        title: "Person",
        text: "The same curated page as on a computer, in one column: his portrait, how the morning finds him, and how he argues, each claim with its source one tap away. Who speaks, the others in the Crito and the story the dialogue belongs to follow further down.",
      },
    },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-topbar")],
            [h.span([h.Class("a-ib soft")], [icon("chev-l", h)]), h.span([h.Class("grow")]), h.span([h.Class("a-ib soft")], [icon("share", h)])],
          ),
          h.div(
            [h.Class("pp")],
            [
              avatar({ person: "socrates", size: "xl" }, h),
              h.h1([h.Class("pp-t")], [socrates.page.title ?? ""]),
              h.p([], ["In 26 of the 27 dialogues; not in the Laws"]),
            ],
          ),
          h.div([h.Class("chips pp-chips")], [h.span([h.Class("a-chip on")], ["In the Crito"]), h.span([h.Class("a-chip")], ["In every dialogue"])]),
          h.div(
            [h.Class("pp-page")],
            sections(socrates.page)
              .filter(({ heading }) => heading === undefined || heading.id === "moves")
              .flatMap(({ heading, blocks }) => [
                ...(heading ? [h.h2([h.Class("a-h3"), h.Id(heading.id)], [heading.text])] : []),
                h.div([h.Class(heading ? "" : "bk-lede")], blocks.map((block) => blockView(block, socratesContext, h))),
              ]),
          ),
        ],
      ),
    ],
    h,
  ),
];

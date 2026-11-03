// Phone screens: A dialogue.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { avatar } from "../../people";
import { phone } from "../frames";

export const dialogueScreens = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  phone(
    { caption: { title: "Dialogue", text: "Cover, lengths, the two actions and the chapters. The recording is labelled as a preview." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div([h.Class("a-band"), h.Style({ "--band": "#D6DCD6" })]),
          h.div(
            [h.Class("a-topbar")],
            [
              h.span([h.Class("a-ib glass")], [icon("chev-l", h)]),
              h.span([h.Class("grow")]),
              h.span([h.Class("a-ib glass")], [icon("share", h)]),
              h.span([h.Class("a-ib glass")], [icon("more", h)]),
            ],
          ),
          h.div([h.Class("a-hero")], [cover({ dialogue: "crito", size: "lg" }, h)]),
          h.h1([h.Class("a-dtitle")], ["Crito"]),
          h.p([h.Class("a-by")], ["Plato"]),
          h.div(
            [h.Class("a-facts")],
            [
              h.span([], [h.b([], ["24 min"]), "Read"]),
              h.span([], [h.b([], ["33 min"]), "Listen"]),
              h.span([], [h.b([], ["5"]), "Chapters"]),
            ],
          ),
          h.div(
            [h.Class("a-cta")],
            [
              h.span([h.Class("a-btn fill")], [icon("bookopen", h), "Read"]),
              h.span([h.Class("a-btn tint")], [icon("headphones", h), "Listen"]),
            ],
          ),
          h.p([h.Class("a-note")], [icon("info", h), "The recording is an early preview."]),
          h.div(
            [h.Class("a-sec tight")],
            [
              h.h2([h.Class("a-h3")], ["Chapters"]),
              h.span([h.Class("a-link")], ["See all"]),
            ],
          ),
          h.ol(
            [h.Class("a-chaps")],
            [
              h.li(
                [],
                [
                  h.span([h.Class("a-num on")], ["1"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["Before dawn: a friend’s grief and Socrates’ composure"]),
                      h.span([], ["8 min listen"]),
                    ],
                  ),
                ],
              ),
              h.li(
                [],
                [
                  h.span([h.Class("a-num")], ["2"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["Which opinions matter, and what makes life worth living"]),
                      h.span([], ["5 min listen"]),
                    ],
                  ),
                ],
              ),
              h.li(
                [],
                [
                  h.span([h.Class("a-num")], ["3"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["From agreement to consistency"]),
                      h.span([], ["6 min listen"]),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Further down", text: "About, the people in it, its ideas and the rest of its collection." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-nb")],
            [
              h.span([h.Class("a-ib soft")], [icon("chev-l", h)]),
              h.b([], ["Crito"]),
              h.span([h.Class("a-ib soft")], [icon("more", h)]),
            ],
          ),
          h.h2([h.Class("a-h3 first")], ["About"]),
          h.p(
            [h.Class("a-about")],
            [
              "Before dawn, Crito sits silently beside Socrates, unable to sleep, while Socrates sleeps peacefully in prison. Crito’s hard news is that the ship from Delos is expected today, making tomorrow the expected day of death. ",
              h.span([h.Class("a-more")], ["More"]),
            ],
          ),
          h.div([h.Class("a-sec tight")], [h.h2([h.Class("a-h3")], ["People"])]),
          h.div(
            [h.Class("ppl")],
            [
              h.span(
                [h.Class("ppl-i")],
                [
                  avatar({ person: "socrates", size: "lg" }, h),
                  h.b([], ["Socrates"]),
                  h.span([], ["26 dialogues"]),
                ],
              ),
              h.span(
                [h.Class("ppl-i")],
                [
                  avatar({ person: "crito", size: "lg" }, h),
                  h.b([], ["Crito"]),
                  h.span([], ["3 dialogues"]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("a-sec tight")],
            [
              h.h2([h.Class("a-h3")], ["Ideas in the Crito"]),
              h.span([h.Class("a-link")], ["All 6"]),
            ],
          ),
          h.div(
            [h.Class("chips flow")],
            [
              h.span([h.Class("a-chip")], ["Expert craft analogy"]),
              h.span([h.Class("a-chip")], ["Scope delimitation"]),
              h.span([h.Class("a-chip")], ["Prison execution frame"]),
              h.span([h.Class("a-chip")], ["Named cast entry or catalog"]),
              h.span([h.Class("a-chip")], ["Truth priority procedure"]),
              h.span([h.Class("a-chip")], ["Afterlife scenario"]),
            ],
          ),
          h.div(
            [h.Class("a-sec tight")],
            [
              h.h2([h.Class("a-h3")], ["More in this collection"]),
              h.span([h.Class("a-link")], ["See all"]),
            ],
          ),
          h.div(
            [h.Class("a-shelf sm")],
            [
              h.span(
                [h.Class("a-book sm")],
                [
                  cover({ dialogue: "euthyphro", size: "sm2" }, h),
                  h.b([], ["Euthyphro"]),
                ],
              ),
              h.span(
                [h.Class("a-book sm")],
                [
                  cover({ dialogue: "apology", size: "sm2" }, h),
                  h.b([], ["Apology"]),
                ],
              ),
              h.span(
                [h.Class("a-book sm")],
                [
                  cover({ dialogue: "phaedo", size: "sm2" }, h),
                  h.b([], ["Phaedo"]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Chapters", text: "From the reader’s list button. Chapter starts come from the recording." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.article(
        [h.Class("a-reader")],
        [
          h.h1([h.Class("a-ch-t")], ["Before dawn: a friend’s grief and Socrates’ composure"]),
          h.p([h.Class("a-ch-m")], ["Chapter 1 of 5 · 6 min read"]),
        ],
      ),
      h.div([h.Class("a-scrim")]),
      h.div(
        [h.Class("a-sheet tall")],
        [
          h.span([h.Class("a-grab")]),
          h.div([h.Class("sh-h")], [h.b([], ["Chapters"]), h.span([h.Class("a-ib soft")], [icon("x", h)])]),
          h.ol(
            [h.Class("a-chaps sheet")],
            [
              h.li(
                [h.Class("cur")],
                [
                  h.span([h.Class("a-num on")], ["1"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["Before dawn: a friend’s grief and Socrates’ composure"]),
                      h.span([], ["Reading · 6 min left"]),
                      h.span([h.Class("a-prog")], [h.i([h.Style({ width: "25%" })])]),
                    ],
                  ),
                ],
              ),
              h.li(
                [h.Class("")],
                [
                  h.span([h.Class("a-num")], ["2"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["Which opinions matter, and what makes life worth living"]),
                      h.span([], ["Starts at 8:23 · 5 min listen"]),
                    ],
                  ),
                ],
              ),
              h.li(
                [h.Class("")],
                [
                  h.span([h.Class("a-num")], ["3"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["From agreement to consistency"]),
                      h.span([], ["Starts at 13:36 · 6 min listen"]),
                    ],
                  ),
                ],
              ),
              h.li(
                [h.Class("")],
                [
                  h.span([h.Class("a-num")], ["4"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["The Laws speak: judgment, nurture, and agreement"]),
                      h.span([], ["Starts at 19:09 · 8 min listen"]),
                    ],
                  ),
                ],
              ),
              h.li(
                [h.Class("")],
                [
                  h.span([h.Class("a-num")], ["5"]),
                  h.span(
                    [h.Class("a-chap-b")],
                    [
                      h.b([], ["Exile, the final warning, and Crito’s silence"]),
                      h.span([], ["Starts at 27:19 · 5 min listen"]),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
    h,
  ),
  ];

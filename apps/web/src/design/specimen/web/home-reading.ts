// Desktop at 1440: Home, while reading.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaRow } from "../../ideas";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

export const homeReadingFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-home", tab: "Plato", caption: { title: "Home, while reading", text: "You last read the Crito, so Home offers Continue reading and counts what is left in chapters. Listening is the second button, starting from the same line. No player bar: nothing is playing. On the right, your week and the ideas you have met so far." } },
    [
      h.div(
        [h.Class("w-app nobar")],
        [
          sidebar({ place: "home" }, h),
          h.div(
            [h.Class("w-main"), h.Style({ "--band": "#D6DCD6" })],
            [
              h.div([h.Class("w-band")]),
              h.div(
                [h.Class("w-in")],
                [
                  h.section(
                    [h.Class("w-hero")],
                    [
                      cover({ dialogue: "crito" }, h),
                      " ",
                      h.div(
                        [h.Class("w-hero-b")],
                        [
                          h.h1([h.Class("w-h1")], ["Crito"]),
                          h.p([h.Class("w-bm")], ["Which opinions matter, and what makes life worth living"]),
                          " ",
                          h.span(
                            [h.Class("w-segs"), h.Style({ "--n": "5" }), h.Role("img"), h.AriaLabel("Chapter 2 of 5, nearly half read")],
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
                            [h.Class("w-pc")],
                            [
                              h.span([], ["Chapter 2 of 5"]),
                              h.span([], [h.b([], ["3 chapters"]), " left after this one"]),
                            ],
                          ),
                          " ",
                          h.div(
                            [h.Class("a-row")],
                            [
                              h.span([h.Class("a-btn fill")], [icon("bookopen", h), "Continue reading"]),
                              h.span([h.Class("a-btn ghost")], [icon("headphones", h), "Listen from here"]),
                            ],
                          ),
                        ],
                      ),
                      h.aside(
                        [h.Class("w-where")],
                        [
                          h.div([h.Class("a-guide-h")], [icon("bookmark", h), h.b([], ["Where you stopped"])]),
                          h.div(
                            [h.Class("w-stop")],
                            [
                              h.p(
                                [],
                                [
                                  h.span([h.Class("a-sp")], ["Socrates"]),
                                  "If a man is an athlete and makes that his business, does he pay attention to every man’s praise and blame and opinion or to those of one man only who is a physician or a trainer?",
                                ],
                              ),
                              h.p(
                                [h.Class("last")],
                                [
                                  h.span([h.Class("a-sp")], ["Crito"]),
                                  "To those of one man only.",
                                ],
                              ),
                            ],
                          ),
                          h.span([h.Class("w-stop-m")], ["Yesterday evening"]),
                          h.span([h.Class("a-link sm")], ["Read the chapter guide"]),
                        ],
                      ),
                    ],
                  ),
                  h.div(
                    [h.Class("w-cols")],
                    [
                      h.section(
                        [],
                        [
                          h.div(
                            [h.Class("a-sec")],
                            [
                              h.h2([h.Class("a-h2")], ["The trial and death of Socrates"]),
                              h.span([h.Class("a-link")], ["See all"]),
                            ],
                          ),
                          h.p([h.Class("a-sec-sub")], ["Four dialogues, best read in order."]),
                          h.div(
                            [h.Class("w-shelf")],
                            [
                              h.span(
                                [h.Class("w-bk")],
                                [
                                  cover({ dialogue: "euthyphro" }, h),
                                  h.b([], ["Euthyphro"]),
                                  h.span([], ["29 min read"]),
                                ],
                              ),
                              h.span(
                                [h.Class("w-bk")],
                                [
                                  cover({ dialogue: "apology" }, h),
                                  h.b([], ["Apology"]),
                                  h.span([], [icon("check", h), "Finished"]),
                                ],
                              ),
                              h.span(
                                [h.Class("w-bk")],
                                [
                                  cover({ dialogue: "crito" }, h),
                                  h.b([], ["Crito"]),
                                  h.span([], [icon("bookopen", h), "Chapter 2 of 5"]),
                                ],
                              ),
                              h.span(
                                [h.Class("w-bk")],
                                [
                                  cover({ dialogue: "phaedo" }, h),
                                  h.b([], ["Phaedo"]),
                                  h.span([], [icon("headphones", h), "1 h 12 min left"]),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.aside(
                        [h.Class("w-stack")],
                        [
                          h.div(
                            [h.Class("w-card")],
                            [
                              h.div(
                                [h.Class("w-card-h")],
                                [
                                  h.h2([h.Class("a-h3")], ["Last 7 days"]),
                                  h.span([h.Class("w-cap")], ["5 of 7 days"]),
                                ],
                              ),
                              h.div(
                                [h.Class("w-wk-t")],
                                [
                                  h.span([], [h.i([h.Class("w-key r")]), h.b([], ["1 h 4 min"]), " reading"]),
                                  h.span([], [h.i([h.Class("w-key l")]), h.b([], ["55 min"]), " listening"]),
                                ],
                              ),
                              h.div(
                                [h.Class("w-wk"), h.Role("img"), h.AriaLabel("Minutes read and heard on each of the last seven days")],
                                [
                                  h.span(
                                    [],
                                    [
                                      h.span([], [h.i([h.Class("r"), h.Style({ "--h": "17px" })])]),
                                      "W",
                                    ],
                                  ),
                                  h.span(
                                    [],
                                    [
                                      h.span([], [h.i([h.Class("l"), h.Style({ "--h": "31px" })])]),
                                      "T",
                                    ],
                                  ),
                                  h.span(
                                    [],
                                    [
                                      h.span([], [h.i([h.Class("r"), h.Style({ "--h": "25px" })])]),
                                      "F",
                                    ],
                                  ),
                                  h.span([], [h.span([]), "S"]),
                                  h.span(
                                    [],
                                    [
                                      h.span(
                                        [],
                                        [
                                          h.i([h.Class("l"), h.Style({ "--h": "21px" })]),
                                          h.i([h.Class("r"), h.Style({ "--h": "35px" })]),
                                        ],
                                      ),
                                      "S",
                                    ],
                                  ),
                                  h.span(
                                    [],
                                    [
                                      h.span(
                                        [],
                                        [
                                          h.i([h.Class("l"), h.Style({ "--h": "25px" })]),
                                          h.i([h.Class("r"), h.Style({ "--h": "13px" })]),
                                        ],
                                      ),
                                      "M",
                                    ],
                                  ),
                                  h.span([h.Class("today")], [h.span([]), "T"]),
                                ],
                              ),
                            ],
                          ),
                          h.div(
                            [h.Class("w-card")],
                            [
                              h.div(
                                [h.Class("w-card-h")],
                                [
                                  h.h2([h.Class("a-h3")], ["Ideas you’ve met"]),
                                  h.span([h.Class("a-link sm")], ["Explore"]),
                                ],
                              ),
                              h.p(
                                [h.Class("w-card-sub")],
                                [
                                  "From what you’ve read, and where each comes back.",
                                ],
                              ),
                              ideaRow({ idea: "expert-craft", where: "Met in chapter 2 · in 17 more dialogues" }, h),
                              ideaRow({ idea: "truth-priority", where: "Met in chapter 2 · in 8 more dialogues" }, h),
                              ideaRow({ idea: "prison", where: "Twice in chapter 1 · also in the Phaedo" }, h),
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
        ],
      ),
    ],
  ),
  ];

// Desktop at 1440: Home, while listening.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaRow } from "../../ideas";
import { sidebar, UNDERWAY, type Underway } from "../../sidebar";
import type { Frame } from "../frames";

// Listening to the Crito, paused, so its row counts time instead of chapters.
const LISTENING: ReadonlyArray<Underway> = [
  { dialogue: "crito", mode: "listening", left: "Paused · 31 min left", progress: 7 },
  ...UNDERWAY.slice(1),
];

export const homeListeningFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-home-listening", tab: "Plato", caption: { title: "Home, while listening", text: "The same dialogue, last used by ear. Home says Continue listening and counts time; the progress is drawn as sound, grouped by chapter. The chapters sit beside it, and the player bar is there because the recording is loaded. Closing the bar with × ends the session and hides it." } },
    [
      h.div(
        [h.Class("w-app")],
        [
          sidebar({ place: "home", underway: LISTENING }, h),
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
                          h.p([h.Class("w-bm")], ["Before dawn: a friend’s grief and Socrates’ composure"]),
                          " ",
                          h.span(
                            [h.Class("w-wave"), h.Role("img"), h.AriaLabel("2 minutes 14 seconds of 33 minutes heard")],
                            [
                              h.span(
                                [],
                                [
                                  h.i([h.Class("on"), h.Style({ "--h": "10px" })]),
                                  h.i([h.Class("on"), h.Style({ "--h": "20px" })]),
                                  h.i([h.Class("on"), h.Style({ "--h": "26px" })]),
                                  h.i([h.Class("on"), h.Style({ "--h": "28px" })]),
                                  h.i([h.Class("on"), h.Style({ "--h": "26px" })]),
                                  h.i([h.Style({ "--h": "30px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "22px" })]),
                                  h.i([h.Style({ "--h": "20px" })]),
                                  h.i([h.Style({ "--h": "14px" })]),
                                  h.i([h.Style({ "--h": "8px" })]),
                                  h.i([h.Style({ "--h": "30px" })]),
                                  h.i([h.Style({ "--h": "24px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "28px" })]),
                                  h.i([h.Style({ "--h": "20px" })]),
                                  h.i([h.Style({ "--h": "12px" })]),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "12px" })]),
                                  h.i([h.Style({ "--h": "12px" })]),
                                  h.i([h.Style({ "--h": "16px" })]),
                                  h.i([h.Style({ "--h": "14px" })]),
                                  h.i([h.Style({ "--h": "22px" })]),
                                  h.i([h.Style({ "--h": "24px" })]),
                                  h.i([h.Style({ "--h": "10px" })]),
                                  h.i([h.Style({ "--h": "8px" })]),
                                  h.i([h.Style({ "--h": "26px" })]),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  h.i([h.Style({ "--h": "16px" })]),
                                  h.i([h.Style({ "--h": "14px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "10px" })]),
                                  h.i([h.Style({ "--h": "20px" })]),
                                  h.i([h.Style({ "--h": "26px" })]),
                                  h.i([h.Style({ "--h": "28px" })]),
                                  h.i([h.Style({ "--h": "26px" })]),
                                  h.i([h.Style({ "--h": "30px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "22px" })]),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  h.i([h.Style({ "--h": "20px" })]),
                                  h.i([h.Style({ "--h": "14px" })]),
                                  h.i([h.Style({ "--h": "8px" })]),
                                  h.i([h.Style({ "--h": "30px" })]),
                                  h.i([h.Style({ "--h": "24px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "28px" })]),
                                  h.i([h.Style({ "--h": "20px" })]),
                                  h.i([h.Style({ "--h": "12px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "12px" })]),
                                  h.i([h.Style({ "--h": "12px" })]),
                                  h.i([h.Style({ "--h": "16px" })]),
                                  h.i([h.Style({ "--h": "14px" })]),
                                  h.i([h.Style({ "--h": "22px" })]),
                                  h.i([h.Style({ "--h": "24px" })]),
                                  h.i([h.Style({ "--h": "10px" })]),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  h.i([h.Style({ "--h": "8px" })]),
                                  h.i([h.Style({ "--h": "26px" })]),
                                  h.i([h.Style({ "--h": "16px" })]),
                                  h.i([h.Style({ "--h": "14px" })]),
                                  h.i([h.Style({ "--h": "18px" })]),
                                  h.i([h.Style({ "--h": "10px" })]),
                                  h.i([h.Style({ "--h": "20px" })]),
                                  h.i([h.Style({ "--h": "26px" })]),
                                  h.i([h.Style({ "--h": "28px" })]),
                                  h.i([h.Style({ "--h": "26px" })]),
                                  h.i([h.Style({ "--h": "30px" })]),
                                ],
                              ),
                            ],
                          ),
                          " ",
                          h.span(
                            [h.Class("w-pc")],
                            [
                              h.span([], ["Chapter 1 of 5 · 2:14"]),
                              h.span([], [h.b([], ["31 min"]), " left"]),
                            ],
                          ),
                          " ",
                          h.div(
                            [h.Class("a-row")],
                            [
                              h.span([h.Class("a-btn fill")], [icon("headphones", h), "Continue listening"]),
                              h.span([h.Class("a-btn ghost")], [icon("bookopen", h), "Read from here"]),
                            ],
                          ),
                        ],
                      ),
                      h.aside(
                        [h.Class("w-where w-q")],
                        [
                          h.div(
                            [h.Class("w-card-h")],
                            [
                              h.h2([h.Class("a-h3")], ["Chapters"]),
                              h.span([h.Class("w-cap")], ["33 min"]),
                            ],
                          ),
                          h.ol(
                            [h.Class("w-ql")],
                            [
                              h.li(
                                [h.Class("on")],
                                [
                                  h.span([h.Class("a-num play")], [icon("eq", h)]),
                                  h.b([], ["Before dawn"]),
                                  h.span([], ["6 min left"]),
                                ],
                              ),
                              h.li(
                                [],
                                [
                                  h.span([h.Class("a-num")], ["2"]),
                                  h.b([], ["Which opinions matter"]),
                                  h.span([], ["8:23"]),
                                ],
                              ),
                              h.li(
                                [],
                                [
                                  h.span([h.Class("a-num")], ["3"]),
                                  h.b([], ["From agreement to consistency"]),
                                  h.span([], ["13:36"]),
                                ],
                              ),
                              h.li(
                                [],
                                [
                                  h.span([h.Class("a-num")], ["4"]),
                                  h.b([], ["The Laws speak"]),
                                  h.span([], ["19:09"]),
                                ],
                              ),
                              h.li(
                                [],
                                [
                                  h.span([h.Class("a-num")], ["5"]),
                                  h.b([], ["Exile and silence"]),
                                  h.span([], ["27:19"]),
                                ],
                              ),
                            ],
                          ),
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
          h.div(
            [h.Class("w-bar v7")],
            [
              h.div(
                [h.Class("w-bar-ctl")],
                [
                  h.span([h.Class("w-ic")], [icon("back15", h)]),
                  h.span([h.Class("w-pp")], [icon("play", h)]),
                  h.span([h.Class("w-ic")], [icon("fwd30", h)]),
                ],
              ),
              h.div(
                [h.Class("w-bar-s")],
                [
                  h.span([], ["2:14"]),
                  h.span(
                    [h.Class("a-prog")],
                    [
                      h.i([h.Style({ width: "27%" })]),
                      h.b([h.Style({ left: "27%" })]),
                    ],
                  ),
                  h.span([], ["8:23"]),
                ],
              ),
              h.div(
                [h.Class("w-bar-r")],
                [
                  h.span([h.Class("w-chip")], ["1×"]),
                  h.span([h.Class("w-ic"), h.Title("Follow the text")], [icon("align", h)]),
                  h.span([h.Class("w-ic"), h.Title("Chapters")], [icon("list", h)]),
                  h.span(
                    [h.Class("w-vol")],
                    [
                      icon("speaker", h),
                      h.span([h.Class("a-prog")], [h.i([h.Style({ width: "68%" })])]),
                    ],
                  ),
                  h.span([h.Class("w-ic"), h.Title("Now playing")], [icon("expand", h)]),
                  h.span([h.Class("w-bar-sep")]),
                  h.span([h.Class("w-ic"), h.Title("Stop listening")], [icon("x", h)]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

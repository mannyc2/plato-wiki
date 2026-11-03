// Desktop at 1440: Dialogue.
import type { Html, HtmlBuilder } from "foldkit/html";
import { whoSpeaks } from "../../block-views";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaRow } from "../../ideas";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

export const dialogueFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-dialogue", tab: "Crito · Plato", caption: { title: "Dialogue", text: "The buttons follow how you use this dialogue, and each chapter shows both its reading and listening time. Above the chapters, its pace: every turn as a bar, with where you stopped ringed. On the right, how it’s told and who speaks, from the voice records, then its ideas, each placed on the dialogue. Idea descriptions are proposed copy." } },
    [
      h.div(
        [h.Class("w-app nobar")],
        [
          sidebar({ place: "library" }, h),
          h.div(
            [h.Class("w-main"), h.Style({ "--band": "#D6DCD6" })],
            [
              h.div([h.Class("w-band tall")]),
              h.div(
                [h.Class("w-in")],
                [
                  h.div(
                    [h.Class("w-topb")],
                    [
                      h.span([h.Class("a-ib glass"), h.AriaLabel("Back")], [icon("chev-l", h)]),
                      h.span(
                        [h.Class("a-ib glass"), h.AriaLabel("More: add to a collection, share")],
                        [
                          icon("more", h),
                        ],
                      ),
                    ],
                  ),
                  h.section(
                    [h.Class("w-dh")],
                    [
                      cover({ dialogue: "crito" }, h),
                      " ",
                      h.div(
                        [h.Class("w-dh-b")],
                        [
                          h.h1([h.Class("w-dt")], ["Crito"]),
                          h.p([h.Class("w-bm")], ["Plato"]),
                          h.div(
                            [h.Class("w-facts")],
                            [
                              h.span([], [icon("bookopen", h), "24 min read"]),
                              h.span([], [icon("headphones", h), "33 min listen"]),
                              h.span([], [icon("list", h), "5 chapters"]),
                            ],
                          ),
                          h.div(
                            [h.Class("a-row w-cta")],
                            [
                              h.span([h.Class("a-btn fill")], [icon("bookopen", h), "Continue reading"]),
                              h.span([h.Class("a-btn ghost")], [icon("headphones", h), "Listen from here"]),
                            ],
                          ),
                          h.p([h.Class("w-note")], [icon("info", h), "The recording is an early preview."]),
                        ],
                      ),
                      h.aside(
                        [h.Class("w-dh-a")],
                        [
                          h.h2([h.Class("a-h3 z")], ["About"]),
                          h.p(
                            [h.Class("w-about")],
                            [
                              "Before dawn, Crito sits silently beside Socrates, unable to sleep, while Socrates sleeps peacefully in prison. Crito’s hard news is that the ship from Delos is expected today, making tomorrow the expected day of death. ",
                              h.span([h.Class("a-more")], ["More"]),
                            ],
                          ),
                          h.h2([h.Class("a-h3")], ["Opening line"]),
                          h.p(
                            [h.Class("w-open")],
                            [
                              h.span([h.Class("a-sp")], ["Socrates"]),
                              "Why have you come at this time, Crito? Or isn’t it still early?",
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
                              h.h2([h.Class("a-h2")], ["Chapters"]),
                              h.span([h.Class("a-link")], ["Read from the start"]),
                            ],
                          ),
                          h.div(
                            [h.Class("w-pace")],
                            [
                              h.div(
                                [h.Class("w-pace-h")],
                                [
                                  h.b([], ["Pace"]),
                                  h.span([], ["Each bar is one turn, by its length"]),
                                ],
                              ),
                              h.div(
                                [h.Class("w-pace-g"), h.Role("img"), h.AriaLabel("Short exchanges through chapters 1 to 3, then long speeches by the Laws in 4 and 5. You stopped in chapter 2.")],
                                [
                                  h.span(
                                    [h.Style({ "--g": "6456" })],
                                    [
                                      h.i([h.Style({ "--g": "11", "--h": "15px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "4", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "3", "--h": "11px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "10", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "18", "--h": "17px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "6", "--h": "12px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "10", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "64", "--h": "27px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "15", "--h": "16px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "23", "--h": "19px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "9", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "32", "--h": "21px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "14", "--h": "16px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "42", "--h": "23px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "19", "--h": "17px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "4", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "17", "--h": "17px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "8", "--h": "13px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "32", "--h": "21px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "7", "--h": "13px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "24", "--h": "19px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "6", "--h": "12px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "10", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "90", "--h": "31px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "27", "--h": "20px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "42", "--h": "23px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "45", "--h": "24px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "53", "--h": "25px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "33", "--h": "21px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "9", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "344", "--h": "55px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "58", "--h": "26px", "--c": "#2F5D50" })]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Style({ "--g": "4276" })],
                                    [
                                      h.i([h.Style({ "--g": "254", "--h": "48px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "56", "--h": "26px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "10", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "12", "--h": "15px", "--c": "#A8461F" })]),
                                      h.i([h.Style({ "--g": "4", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Style({ "--g": "35", "--h": "22px", "--c": "#A8461F" })]),
                                      h.i([h.Class("here"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "19", "--h": "17px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "27", "--h": "20px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "27", "--h": "20px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "4", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "16", "--h": "16px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "9", "--h": "14px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "88", "--h": "31px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "5", "--h": "12px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "36", "--h": "22px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "11", "--h": "15px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "38", "--h": "22px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "68", "--h": "28px", "--c": "#A8461F" })]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Style({ "--g": "3445" })],
                                    [
                                      h.i([h.Class("ahead"), h.Style({ "--g": "12", "--h": "15px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "39", "--h": "22px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "15", "--h": "16px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "135", "--h": "36px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "12", "--h": "15px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "68", "--h": "28px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "112", "--h": "34px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "5", "--h": "12px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "14", "--h": "16px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "10", "--h": "14px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "6", "--h": "12px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "14", "--h": "16px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "11", "--h": "15px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "125", "--h": "35px", "--c": "#A8461F" })]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Style({ "--g": "6563" })],
                                    [
                                      h.i([h.Class("ahead"), h.Style({ "--g": "9", "--h": "14px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "21", "--h": "18px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "10px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "31", "--h": "21px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "12", "--h": "15px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "136", "--h": "37px", "--c": "#A8461F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "6", "--h": "12px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "197", "--h": "43px", "--c": "#75633F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "227", "--h": "45px", "--c": "#75633F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "3", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "198", "--h": "43px", "--c": "#75633F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "267", "--h": "49px", "--c": "#75633F" })]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Style({ "--g": "4923" })],
                                    [
                                      h.i([h.Class("ahead"), h.Style({ "--g": "4", "--h": "11px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "47", "--h": "24px", "--c": "#75633F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "364", "--h": "56px", "--c": "#75633F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "295", "--h": "51px", "--c": "#75633F" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "7", "--h": "13px", "--c": "#2F5D50" })]),
                                      h.i([h.Class("ahead"), h.Style({ "--g": "13", "--h": "15px", "--c": "#A8461F" })]),
                                    ],
                                  ),
                                ],
                              ),
                              h.div(
                                [h.Class("w-pace-n"), h.AriaHidden(true)],
                                [
                                  h.span([h.Style({ "--g": "6456" })], ["1"]),
                                  h.span([h.Style({ "--g": "4276" })], ["2"]),
                                  h.span([h.Style({ "--g": "3445" })], ["3"]),
                                  h.span([h.Style({ "--g": "6563" })], ["4"]),
                                  h.span([h.Style({ "--g": "4923" })], ["5"]),
                                ],
                              ),
                              h.div(
                                [h.Class("w-pace-k")],
                                [
                                  h.span([h.Style({ "--c": "#A8461F" })], ["Socrates"]),
                                  h.span([h.Style({ "--c": "#75633F" })], ["The Laws"]),
                                  h.span([h.Style({ "--c": "#2F5D50" })], ["Crito"]),
                                  h.em(
                                    [],
                                    [
                                      "Crito answers in a few words 30 times, then the Laws hold the floor.",
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                          h.ol(
                            [h.Class("w-chaps v7")],
                            [
                              h.li(
                                [h.Class("done")],
                                [
                                  h.span([h.Class("a-num done")], [icon("check", h)]),
                                  h.span(
                                    [h.Class("a-chap-b")],
                                    [
                                      h.b([], ["Before dawn: a friend’s grief and Socrates’ composure"]),
                                      h.span([], ["Read"]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-dur")],
                                    [
                                      h.span([], [icon("bookopen", h), "6 min"]),
                                      h.span([], [icon("headphones", h), "8 min"]),
                                    ],
                                  ),
                                  h.span([]),
                                ],
                              ),
                              h.li(
                                [h.Class("cur")],
                                [
                                  h.span([h.Class("a-num on")], ["2"]),
                                  h.span(
                                    [h.Class("a-chap-b")],
                                    [
                                      h.b([], ["Which opinions matter, and what makes life worth living"]),
                                      h.span([], ["Reading · stopped in chapter 2"]),
                                      h.span([h.Class("a-prog")], [h.i([h.Style({ width: "45%" })])]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-dur")],
                                    [
                                      h.span([], [icon("bookopen", h), "4 min"]),
                                      h.span([], [icon("headphones", h), "5 min"]),
                                    ],
                                  ),
                                  h.span([h.Class("a-ib soft")], [icon("bookopen", h)]),
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
                                      h.span([], ["Starts at 13:36 in the recording"]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-dur")],
                                    [
                                      h.span([], [icon("bookopen", h), "4 min"]),
                                      h.span([], [icon("headphones", h), "6 min"]),
                                    ],
                                  ),
                                  h.span([]),
                                ],
                              ),
                              h.li(
                                [],
                                [
                                  h.span([h.Class("a-num")], ["4"]),
                                  h.span(
                                    [h.Class("a-chap-b")],
                                    [
                                      h.b([], ["The Laws speak: judgment, nurture, and agreement"]),
                                      h.span([], ["Starts at 19:09 in the recording"]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-dur")],
                                    [
                                      h.span([], [icon("bookopen", h), "6 min"]),
                                      h.span([], [icon("headphones", h), "8 min"]),
                                    ],
                                  ),
                                  h.span([]),
                                ],
                              ),
                              h.li(
                                [],
                                [
                                  h.span([h.Class("a-num")], ["5"]),
                                  h.span(
                                    [h.Class("a-chap-b")],
                                    [
                                      h.b([], ["Exile, the final warning, and Crito’s silence"]),
                                      h.span([], ["Starts at 27:19 in the recording"]),
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-dur")],
                                    [
                                      h.span([], [icon("bookopen", h), "4 min"]),
                                      h.span([], [icon("headphones", h), "5 min"]),
                                    ],
                                  ),
                                  h.span([]),
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
                                  h.h2([h.Class("a-h3")], ["How it’s told"]),
                                  icon("layers", h),
                                ],
                              ),
                              h.p(
                                [h.Class("w-card-sub")],
                                [
                                  "Acted out, with no narrator. Twice, Socrates speaks in someone else’s voice.",
                                ],
                              ),
                              h.div(
                                [h.Class("w-frame")],
                                [
                                  h.b([], ["Socrates and Crito"]),
                                  h.span([], ["In the prison, before dawn"]),
                                  h.div(
                                    [h.Class("w-frame-row")],
                                    [
                                      h.div(
                                        [h.Class("w-frame")],
                                        [
                                          h.b([], ["The Laws of Athens"]),
                                          h.span([], ["Chapters 4 and 5"]),
                                        ],
                                      ),
                                      h.div(
                                        [h.Class("w-frame")],
                                        [
                                          h.b([], ["A woman in white"]),
                                          h.span([], ["In his dream, quoting Homer"]),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              h.h3([h.Class("w-mini-h")], ["Who speaks"]),
                              whoSpeaks("crito", h),
                            ],
                          ),
                          h.div(
                            [h.Class("w-card")],
                            [
                              h.div(
                                [h.Class("w-card-h")],
                                [
                                  h.h2([h.Class("a-h3")], ["Ideas in the Crito"]),
                                  h.span([h.Class("a-link sm")], ["All 6"]),
                                ],
                              ),
                              ideaRow({ idea: "expert-craft", where: "4 passages here, all in chapter 2 · in 18 dialogues" }, h),
                              ideaRow({ idea: "scope", where: "3 here, in chapter 3 · in 14 dialogues" }, h),
                              ideaRow({ idea: "prison", where: "2 here, in chapter 1 · also in the Phaedo" }, h),
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

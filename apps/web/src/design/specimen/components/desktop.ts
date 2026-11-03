// Components: Desktop.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { whoSpeaks } from "../../block-views";
import { TRAILS, ideaTrail } from "../../idea-trail";
import { ideaRow } from "../../ideas";

export const desktopSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat"), h.Id("c-desktop")],
    [
      h.h3([h.Class("sub")], ["Desktop"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Parts that only appear on a computer. They sit on the ground colour, one step darker than the page.",
        ],
      ),
      h.div(
        [h.Class("kgrid top")],
        [
          h.div(
            [h.Class("kt wide")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-demo")],
                    [
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
                  h.div(
                    [h.Class("w-demo night A")],
                    [
                      h.div(
                        [h.Class("w-bar v7")],
                        [
                          h.div(
                            [h.Class("w-bar-ctl")],
                            [
                              h.span([h.Class("w-ic")], [icon("back15", h)]),
                              h.span([h.Class("w-pp")], [icon("pause", h)]),
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
                              h.span([h.Class("w-ic on"), h.Title("Follow the text")], [icon("align", h)]),
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
              h.p(
                [],
                [
                  h.b([], ["Player bar."]),
                  " Only while a recording is loaded. Controls, then the chapter’s scrubber, then speed, follow the text, chapters, volume, the full-screen player and ×, which ends listening and hides the bar. Below, playing in Night with the page following along.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt tall")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-demo side")],
                    [
                      h.aside(
                        [h.Class("w-side")],
                        [
                          h.b([h.Class("w-logo")], ["Plato"]),
                          " ",
                          h.nav(
                            [h.Class("w-nav")],
                            [
                              h.span([h.Class("on")], [icon("home", h), h.b([], ["Home"])]),
                              h.span([h.Class("")], [icon("books", h), h.b([], ["Library"])]),
                              h.span([h.Class("")], [icon("compass", h), h.b([], ["Explore"])]),
                              h.span(
                                [h.Class("")],
                                [
                                  icon("search", h),
                                  h.b([], ["Search"]),
                                  h.kbd([h.Class("w-kbd")], ["/"]),
                                ],
                              ),
                            ],
                          ),
                          " ",
                          h.b([h.Class("w-sh")], ["Reading now"]),
                          " ",
                          h.span(
                            [h.Class("w-rn on")],
                            [
                              cover({ dialogue: "crito", size: "xs" }, h),
                              h.span(
                                [h.Class("w-rn-t")],
                                [
                                  h.b([], ["Crito"]),
                                  h.span([], [icon("bookopen", h), "Chapter 2 of 5"]),
                                ],
                              ),
                              h.span([h.Class("w-ring"), h.Style({ "--p": "30%" }), h.Role("img"), h.AriaLabel("30% read")]),
                            ],
                          ),
                          h.span(
                            [h.Class("w-rn")],
                            [
                              cover({ dialogue: "phaedo", size: "xs" }, h),
                              h.span(
                                [h.Class("w-rn-t")],
                                [
                                  h.b([], ["Phaedo"]),
                                  h.span([], [icon("headphones", h), "1 h 12 min left"]),
                                ],
                              ),
                              h.span([h.Class("w-ring"), h.Style({ "--p": "38%" }), h.Role("img"), h.AriaLabel("38% heard")]),
                            ],
                          ),
                          h.span(
                            [h.Class("w-rn")],
                            [
                              cover({ dialogue: "meno", size: "xs" }, h),
                              h.span(
                                [h.Class("w-rn-t")],
                                [
                                  h.b([], ["Meno"]),
                                  h.span([], [icon("bookopen", h), "Chapter 1 of 8"]),
                                ],
                              ),
                              h.span([h.Class("w-ring"), h.Style({ "--p": "8%" }), h.Role("img"), h.AriaLabel("8% read")]),
                            ],
                          ),
                          " ",
                          h.b([h.Class("w-sh")], ["Collections"]),
                          " ",
                          h.span(
                            [h.Class("w-rn")],
                            [
                              h.span(
                                [h.Class("w-fan")],
                                [
                                  cover({ dialogue: "euthyphro", size: "xs" }, h),
                                  cover({ dialogue: "apology", size: "xs" }, h),
                                  cover({ dialogue: "crito", size: "xs" }, h),
                                  cover({ dialogue: "phaedo", size: "xs" }, h),
                                ],
                              ),
                              h.span(
                                [h.Class("w-rn-t")],
                                [
                                  h.b([], ["The trial and death of Socrates"]),
                                  h.span([], ["4 dialogues"]),
                                ],
                              ),
                            ],
                          ),
                          " ",
                          h.span([h.Class("w-side-f")], [icon("sliders", h), h.b([], ["Settings"])]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Sidebar."]),
                  " Four destinations, what you are reading or listening to, and collections. Settings opens a popover. The slash key opens Search.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-glances")],
                    [
                      h.span(
                        [h.Class("w-rn on")],
                        [
                          cover({ dialogue: "crito", size: "xs" }, h),
                          h.span(
                            [h.Class("w-rn-t")],
                            [
                              h.b([], ["Crito"]),
                              h.span([], [icon("bookopen", h), "Chapter 2 of 5"]),
                            ],
                          ),
                          h.span([h.Class("w-ring"), h.Style({ "--p": "30%" }), h.Role("img"), h.AriaLabel("30% read")]),
                        ],
                      ),
                      h.span(
                        [h.Class("w-rn")],
                        [
                          cover({ dialogue: "phaedo", size: "xs" }, h),
                          h.span(
                            [h.Class("w-rn-t")],
                            [
                              h.b([], ["Phaedo"]),
                              h.span([], [icon("headphones", h), "1 h 12 min left"]),
                            ],
                          ),
                          h.span([h.Class("w-ring"), h.Style({ "--p": "38%" }), h.Role("img"), h.AriaLabel("38% heard")]),
                        ],
                      ),
                      h.span(
                        [h.Class("w-rn")],
                        [
                          cover({ dialogue: "crito", size: "xs" }, h),
                          h.span(
                            [h.Class("w-rn-t")],
                            [
                              h.b([], ["Crito"]),
                              h.span([h.Class("live")], [icon("eq", h), "Playing · 31 min left"]),
                            ],
                          ),
                          h.span([h.Class("w-ring"), h.Style({ "--p": "7%" }), h.Role("img"), h.AriaLabel("7% heard")]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Glance rows."]),
                  " The continue card as a single row: chapters for reading, time for listening, and a live mark while playing. Home, the phone card and these rows share one set of facts.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt tall")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-pop static"), h.Role("dialog"), h.AriaLabel("Settings")],
                    [
                      h.b([h.Class("w-pop-h")], ["Settings"]),
                      " ",
                      h.b([h.Class("w-pop-l")], ["Theme"]),
                      " ",
                      h.div(
                        [h.Class("w-themes")],
                        [
                          h.span(
                            [h.Class("w-th on"), h.Style({ "--tp": "#FBF8F3", "--tk": "#1F1B16" })],
                            [
                              h.i([]),
                              "Paper",
                            ],
                          ),
                          h.span(
                            [h.Class("w-th"), h.Style({ "--tp": "#F4ECD8", "--tk": "#3B2F22" })],
                            [
                              h.i([]),
                              "Sepia",
                            ],
                          ),
                          h.span(
                            [h.Class("w-th"), h.Style({ "--tp": "#16130F", "--tk": "#ECE4D6" })],
                            [
                              h.i([]),
                              "Night",
                            ],
                          ),
                          h.span(
                            [h.Class("w-th auto"), h.Style({ "--tk": "#8E8578" })],
                            [
                              h.i([]),
                              "Automatic",
                            ],
                          ),
                        ],
                      ),
                      " ",
                      h.b([h.Class("w-pop-l")], ["Reading"]),
                      " ",
                      h.div(
                        [h.Class("w-prow")],
                        [
                          h.b([], ["Text size"]),
                          h.span(
                            [h.Class("w-step")],
                            [
                              h.span([], [icon("minus", h)]),
                              h.em([], ["20"]),
                              h.span([], [icon("plus", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.div(
                        [h.Class("w-prow")],
                        [
                          h.b([], ["Typeface"]),
                          h.span(
                            [h.Class("w-pills")],
                            [
                              h.span([h.Class("on serif")], ["Literata"]),
                              h.span([], ["Inter"]),
                            ],
                          ),
                        ],
                      ),
                      " ",
                      h.b([h.Class("w-pop-l")], ["Listening"]),
                      " ",
                      h.div(
                        [h.Class("w-prow")],
                        [
                          h.b([], ["Speed"]),
                          h.span(
                            [h.Class("w-pills")],
                            [
                              h.span([], ["0.8×"]),
                              h.span([h.Class("on")], ["1×"]),
                              h.span([], ["1.25×"]),
                              h.span([], ["1.5×"]),
                            ],
                          ),
                        ],
                      ),
                      h.div(
                        [h.Class("w-prow")],
                        [
                          h.b([], ["Page follows the recording"]),
                          h.span([h.Class("w-tog on")]),
                        ],
                      ),
                      h.div(
                        [h.Class("w-plinks")],
                        [
                          h.span(
                            [h.Class("w-plink")],
                            [
                              icon("download", h),
                              h.b([], ["Downloads"]),
                              icon("chev-r", h),
                            ],
                          ),
                          h.span(
                            [h.Class("w-plink")],
                            [
                              icon("info", h),
                              h.b([], ["About and licences"]),
                              icon("chev-r", h),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Settings."]),
                  " A popover, not a page: theme, text, speed and following, then downloads and licences.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
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
                          "Diotima’s teaching reaches you through three other people.",
                        ],
                      ),
                      h.div(
                        [h.Class("w-frame")],
                        [
                          h.b([], ["Apollodorus"]),
                          h.span([], ["Telling a friend, years later"]),
                          h.div(
                            [h.Class("w-frame")],
                            [
                              h.b([], ["Aristodemus"]),
                              h.span([], ["Who was at Agathon’s dinner"]),
                              h.div(
                                [h.Class("w-frame")],
                                [
                                  h.b([], ["Socrates"]),
                                  h.span([], ["Giving his speech on love"]),
                                  h.div(
                                    [h.Class("w-frame")],
                                    [
                                      h.b([], ["Diotima"]),
                                      h.span([], ["As Socrates remembers her"]),
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
              h.p(
                [],
                [
                  h.b([], ["How it’s told."]),
                  " Nested frames, outermost voice first. The Symposium’s deepest chain from the voice records: Diotima is retold three times.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt wide")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("col w")],
                    [
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
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Pace."]),
                  " One bar per turn, as wide and tall as the turn is long, grouped by chapter and coloured by the voice speaking. Where you stopped is ringed; what lies ahead is faded. From the turn index.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-card")],
                    [
                      h.div([h.Class("w-card-h")], [h.h2([h.Class("a-h3")], ["Often found with"])]),
                      ideaRow({ idea: "forced-alternative", where: "Together in 9 passages · 5 dialogues" }, h),
                      ideaRow({ idea: "counterexample", where: "Together in 6 passages · 4 dialogues" }, h),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Often found with."]),
                  " Ideas sharing at least three passages in two dialogues, strongest link first. Sample values until the rebuilt ideas: 30 of today’s 41 qualifying pairs come through turn geometry, a mechanical label that analytics replace.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-card")],
                    [
                      h.div([h.Class("w-card-h")], [h.h2([h.Class("a-h3")], ["You and this idea"])]),
                      ...ideaTrail(TRAILS["truth-priority"], h),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["You and this idea."]),
                  " Where you met an idea, where it comes next in what you are reading or hearing, and where it comes back most. Each place is named by dialogue and by where it falls for you. Real passages; your place in them is a sample.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-card")],
                    [
                      h.div([h.Class("w-card-h")], [h.h2([h.Class("a-h3")], ["Who speaks"])]),
                      whoSpeaks("crito", h),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Who speaks."]),
                  " One bar for the whole dialogue, split by the innermost voice, each with its speaker’s portrait. A named voice someone performs has its own share and says who performs it; an unnamed voice counts for whoever quotes it. Words still waiting for a speaker are their own share, shown from 1% and otherwise mentioned below. The same view draws a page’s analytic block.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
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
                          h.span([], [h.span([], [h.i([h.Class("r"), h.Style({ "--h": "17px" })])]), "W"]),
                          h.span([], [h.span([], [h.i([h.Class("l"), h.Style({ "--h": "31px" })])]), "T"]),
                          h.span([], [h.span([], [h.i([h.Class("r"), h.Style({ "--h": "25px" })])]), "F"]),
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
                ],
              ),
              h.p([], [h.b([], ["Last 7 days."]), " Minutes read and heard, day by day. Sample values."]),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("w-card")],
                    [
                      ideaRow({ idea: "expert-craft", where: "4 passages here, all in chapter 2 · in 18 dialogues" }, h),
                      ideaRow({ idea: "prison", where: "2 here, in chapter 1 · also in the Phaedo" }, h),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Idea row."]),
                  " Name, one plain sentence, where its passages fall in this dialogue, and where else it comes back.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt wide")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("col w")],
                    [
                      h.div(
                        [h.Class("a-row flow")],
                        [
                          h.span([h.Class("w-tb")], [icon("aa", h), "Text"]),
                          h.span([h.Class("w-tb")], [icon("headphones", h), "Listen"]),
                          h.span([h.Class("w-tb on")], [icon("sparkle", h), "Explain"]),
                        ],
                      ),
                      h.div(
                        [h.Class("a-row flow")],
                        [
                          h.span([h.Class("w-tb on")], [icon("eq", h), "Following the recording"]),
                          h.span([h.Class("w-tb")], [icon("aa", h), "Text"]),
                          h.span([h.Class("w-tb")], [icon("sparkle", h), "Explain"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Reading toolbar."]),
                  " On a computer the reader’s buttons carry words. The tinted one is open or on.",
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

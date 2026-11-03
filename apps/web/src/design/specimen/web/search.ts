// Desktop at 1440: Search.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaRow } from "../../ideas";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

export const searchFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-search", tab: "Search · Plato", caption: { title: "Search", text: "Results start in the dialogue you are reading. Matching ideas say what they are instead of showing the corpus’s group names. Only ideas with at least five passages in two dialogues appear, and each title only once." } },
    [
      h.div(
        [h.Class("w-app nobar")],
        [
          sidebar({ place: "search" }, h),
          h.div(
            [h.Class("w-main")],
            [
              h.div(
                [h.Class("w-in")],
                [
                  h.div(
                    [h.Class("w-sf")],
                    [
                      icon("search", h),
                      h.b([], ["opinion", h.i([h.Class("caret")])]),
                      h.span([h.Class("sf-x")], [icon("x", h)]),
                    ],
                  ),
                  h.div(
                    [h.Class("chips w-schips")],
                    [
                      h.span([h.Class("a-chip on")], ["All"]),
                      h.span([h.Class("a-chip")], ["Passages ", h.i([], ["467"])]),
                      h.span([h.Class("a-chip")], ["Ideas ", h.i([], ["2"])]),
                      h.span([h.Class("a-chip")], ["Dialogues ", h.i([], ["25"])]),
                    ],
                  ),
                  h.div(
                    [h.Class("w-cols")],
                    [
                      h.section(
                        [],
                        [
                          h.div(
                            [h.Class("w-srh")],
                            [
                              h.h2([h.Class("a-h2")], ["In the Crito"]),
                              h.span([], ["12 passages, from the dialogue you’re reading"]),
                            ],
                          ),
                          h.div(
                            [h.Class("w-sr")],
                            [
                              cover({ dialogue: "crito", size: "xs" }, h),
                              h.div(
                                [],
                                [
                                  h.span([h.Class("sr-m")], ["47c · Socrates"]),
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
                            [h.Class("w-sr")],
                            [
                              cover({ dialogue: "crito", size: "xs" }, h),
                              h.div(
                                [],
                                [
                                  h.span([h.Class("sr-m")], ["44d · Crito"]),
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
                            [h.Class("w-sr")],
                            [
                              cover({ dialogue: "crito", size: "xs" }, h),
                              h.div(
                                [],
                                [
                                  h.span([h.Class("sr-m")], ["48a · Socrates"]),
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
                          " ",
                          h.span([h.Class("a-link sm w-more")], ["Show all 12 in the Crito"]),
                          " ",
                          h.div(
                            [h.Class("w-srh")],
                            [
                              h.h2([h.Class("a-h2")], ["In other dialogues"]),
                              h.span([], ["455 passages in 24 dialogues"]),
                            ],
                          ),
                          h.div(
                            [h.Class("w-sd")],
                            [
                              h.span(
                                [],
                                [
                                  cover({ dialogue: "theaetetus", size: "xs" }, h),
                                  h.b([], ["Theaetetus"]),
                                  h.i([h.Style({ "--w": "100%", "--c": "#45604F" })]),
                                  h.em([], ["117"]),
                                  icon("chev-r", h),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  cover({ dialogue: "laws", size: "xs" }, h),
                                  h.b([], ["Laws"]),
                                  h.i([h.Style({ "--w": "46%", "--c": "#3B4A2F" })]),
                                  h.em([], ["54"]),
                                  icon("chev-r", h),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  cover({ dialogue: "republic", size: "xs" }, h),
                                  h.b([], ["Republic"]),
                                  h.i([h.Style({ "--w": "46%", "--c": "#2B2B2B" })]),
                                  h.em([], ["54"]),
                                  icon("chev-r", h),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  cover({ dialogue: "philebus", size: "xs" }, h),
                                  h.b([], ["Philebus"]),
                                  h.i([h.Style({ "--w": "35%", "--c": "#6E3B47" })]),
                                  h.em([], ["41"]),
                                  icon("chev-r", h),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  cover({ dialogue: "sophist", size: "xs" }, h),
                                  h.b([], ["Sophist"]),
                                  h.i([h.Style({ "--w": "26%", "--c": "#3D5A5A" })]),
                                  h.em([], ["30"]),
                                  icon("chev-r", h),
                                ],
                              ),
                              h.span(
                                [],
                                [
                                  cover({ dialogue: "meno", size: "xs" }, h),
                                  h.b([], ["Meno"]),
                                  h.i([h.Style({ "--w": "21%", "--c": "#3A4F7A" })]),
                                  h.em([], ["25"]),
                                  icon("chev-r", h),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.aside(
                        [h.Class("w-card")],
                        [
                          h.div([h.Class("w-card-h")], [h.h2([h.Class("a-h3")], ["Ideas"])]),
                          ideaRow({ idea: "common-opinion", where: "7 passages · Gorgias, Philebus and 3 more" }, h),
                          ideaRow({ idea: "knowledge-opinion", where: "6 passages · mostly the Meno" }, h),
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

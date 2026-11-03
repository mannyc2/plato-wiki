// Components: Books.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaBadge } from "../../ideas";

export const booksSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub first")], ["Books"]),
      h.p([h.Class("sub-p")], ["Covers, the continue card and the floating bars."]),
      h.div(
        [h.Class("kgrid")],
        [
          h.div(
            [h.Class("kt wide")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("cvs")],
                    [
                      cover({ dialogue: "crito", size: "sm2" }, h),
                      cover({ dialogue: "apology", size: "sm2" }, h),
                      cover({ dialogue: "euthyphro", size: "sm2" }, h),
                      cover({ dialogue: "phaedo", size: "sm2" }, h),
                      cover({ dialogue: "meno", size: "sm2" }, h),
                      cover({ dialogue: "ion", size: "sm2" }, h),
                      cover({ dialogue: "symposium", size: "sm2" }, h),
                      cover({ dialogue: "republic", size: "sm2" }, h),
                      cover({ dialogue: "gorgias", size: "sm2" }, h),
                      cover({ dialogue: "laches", size: "sm2" }, h),
                      cover({ dialogue: "laws", size: "sm2" }, h),
                      cover({ dialogue: "timaeus", size: "sm2" }, h),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Covers."]),
                  " One per dialogue: cloth, emblem and title. Dialogues without a drawn emblem use a plain ornament until theirs is drawn.",
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
                    [h.Class("a-row end")],
                    [
                      cover({ dialogue: "crito", size: "xs" }, h),
                      cover({ dialogue: "crito", size: "sm" }, h),
                      cover({ dialogue: "crito", size: "md" }, h),
                      cover({ dialogue: "crito", size: "lg" }, h),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Cover sizes."]), " 30, 46, 96 and 150 points wide, and 200 in the player."]),
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
                        [h.Class("a-continue")],
                        [
                          cover({ dialogue: "crito", size: "md" }, h),
                          h.div(
                            [h.Class("a-continue-b")],
                            [
                              h.b([h.Class("a-continue-t")], ["Crito"]),
                              h.span([h.Class("a-meta")], ["Chapter 2 of 5 · 3 chapters left"]),
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
                              h.span(
                                [h.Class("a-row")],
                                [
                                  h.span([h.Class("a-btn fill sm")], ["Continue reading"]),
                                  h.span([h.Class("a-ib")], [icon("headphones", h)]),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.div(
                        [h.Class("a-continue")],
                        [
                          cover({ dialogue: "phaedo", size: "md" }, h),
                          h.div(
                            [h.Class("a-continue-b")],
                            [
                              h.b([h.Class("a-continue-t")], ["Phaedo"]),
                              h.span([h.Class("a-meta")], ["Chapter 3 of 5 · 1 h 12 min left"]),
                              h.span(
                                [h.Class("w-wave"), h.Role("img"), h.AriaLabel("Chapter 3 of 5, 1 hour 12 minutes left")],
                                [
                                  h.span(
                                    [],
                                    [
                                      h.i([h.Class("on"), h.Style({ "--h": "10px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "20px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "26px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "28px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "26px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "30px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "18px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "22px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "20px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "14px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "8px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "30px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "24px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "18px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "28px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "20px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "12px" })]),
                                    ],
                                  ),
                                  h.span(
                                    [],
                                    [
                                      h.i([h.Class("on"), h.Style({ "--h": "18px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "12px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "12px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "16px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "14px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "22px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "24px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "10px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "8px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "26px" })]),
                                    ],
                                  ),
                                  h.span(
                                    [],
                                    [
                                      h.i([h.Class("on"), h.Style({ "--h": "16px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "14px" })]),
                                      h.i([h.Class("on"), h.Style({ "--h": "18px" })]),
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
                              h.span(
                                [h.Class("a-row")],
                                [
                                  h.span([h.Class("a-btn fill sm")], ["Continue listening"]),
                                  h.span([h.Class("a-ib")], [icon("bookopen", h)]),
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
                  h.b([], ["Continue card."]),
                  " In the way you last took the dialogue. Reading counts chapters; listening counts time. The round button switches mode at the same line.",
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
                    [h.Class("tbdemo")],
                    [
                      h.div(
                        [h.Class("mp")],
                        [
                          cover({ dialogue: "crito", size: "xs" }, h),
                          h.span(
                            [h.Class("mp-t")],
                            [
                              h.b([], ["Before dawn"]),
                              h.span([], ["Crito · Chapter 1"]),
                            ],
                          ),
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
                              h.span([h.Class("on")], [icon("home", h), h.b([], ["Home"])]),
                              h.span([h.Class("")], [icon("books", h), h.b([], ["Library"])]),
                              h.span([h.Class("")], [icon("compass", h), h.b([], ["Explore"])]),
                            ],
                          ),
                          h.span([h.Class("tb-search")], [icon("search", h)]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Tab bar and mini player."]),
                  " Both float. Search is its own round button. The mini player appears only while something is loaded to play, and names the chapter, not the file.",
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
                    [h.Class("w-tiles two")],
                    [
                      h.span(
                        [h.Class("w-it")],
                        [
                          ideaBadge({ idea: "expert-craft", size: "md" }, h),
                          h.b([], ["Expert craft analogy"]),
                          h.p(
                            [],
                            [
                              "Comparing a question about how to live to a craft, such as medicine or training, to ask whose knowledge should count.",
                            ],
                          ),
                          h.span(
                            [h.Class("w-it-m")],
                            [
                              h.span([], ["77 passages"]),
                              h.span([], ["18 dialogues"]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-it")],
                        [
                          ideaBadge({ idea: "forced-alternative", size: "md" }, h),
                          h.b([], ["Forced alternative"]),
                          h.p([], ["Someone is made to choose between two answers that cannot both stand."]),
                          h.span(
                            [h.Class("w-it-m")],
                            [
                              h.span([], ["50 passages"]),
                              h.span([], ["14 dialogues"]),
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
                  h.b([], ["Idea tile."]),
                  " The idea’s emblem and name, one plain sentence saying what it is, and real counts. Descriptions are proposed copy.",
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
                    [h.Class("pc")],
                    [
                      cover({ dialogue: "crito", size: "xs" }, h),
                      h.div(
                        [],
                        [
                          h.span([h.Class("pc-m")], [h.b([], ["Crito"]), " 47c · Socrates"]),
                          h.p(
                            [],
                            [
                              "…ought we to follow and fear the ",
                              h.mark([], ["opinion"]),
                              " of the many or that of the one, if there is anyone who knows about them, whom we ought to revere and fear more than all the others?",
                            ],
                          ),
                          h.span([h.Class("a-link sm")], ["Read in context"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Passage card."]),
                  " Search results and idea pages. The match is marked; the reference stays quiet.",
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

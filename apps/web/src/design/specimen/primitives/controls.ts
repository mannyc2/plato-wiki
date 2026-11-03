// Primitives: Controls.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";
import { avatar } from "../../people";

export const controlsSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Controls"]),
      h.p([h.Class("sub-p")], ["The smaller parts that every screen is assembled from."]),
      h.div(
        [h.Class("kgrid")],
        [
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("col")],
                    [
                      h.div(
                        [h.Class("a-row")],
                        [
                          h.span([h.Class("a-chip on")], ["All"]),
                          h.span([h.Class("a-chip")], ["Reading"]),
                          h.span([h.Class("a-chip is-focus")], ["Listening"]),
                        ],
                      ),
                      h.div(
                        [h.Class("a-row")],
                        [
                          h.span([h.Class("a-chip")], ["1×"]),
                          h.span([h.Class("a-chip")], [icon("bookopen", h), "Read along"]),
                          h.span([h.Class("a-chip")], ["Gorgias ", h.i([], ["11"])]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Chips."]),
                  " Filters are chips, ink when selected. The same shape carries quick settings and counts.",
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
                    [h.Class("a-row flow")],
                    [
                      h.span([h.Class("a-tag")], ["Preview recording"]),
                      h.span([h.Class("lib-s done")], [icon("check", h), "Finished"]),
                      h.span([h.Class("lib-s new")], ["New"]),
                      h.span(
                        [h.Class("np-swatch cloth"), h.Style({ "--cl": "#2F5D50" })],
                        [
                          h.span([h.Class("np-tag")], ["Preview"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Tags."]),
                  " Status in words, never codes. A draft recording is always called a preview.",
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
                    [h.Class("seg")],
                    [
                      h.span([h.Class("")], ["0.75×"]),
                      h.span([h.Class("on")], ["1×"]),
                      h.span([h.Class("")], ["1.25×"]),
                      h.span([h.Class("")], ["1.5×"]),
                      h.span([h.Class("")], ["2×"]),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Segmented control."]), " One choice from a short set."]),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("a-row")],
                    [
                      h.span([h.Class("tgl")], [h.i([])]),
                      h.span([h.Class("tgl on")], [h.i([])]),
                      h.span([h.Class("tgl on is-focus")], [h.i([])]),
                      h.span([h.Class("tgl is-disabled")], [h.i([])]),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Switch."]),
                  " Off, on, focused and disabled. Each switch changes something you can see.",
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
                    [h.Class("step")],
                    [
                      h.span([h.Class("step-b")], [icon("minus", h)]),
                      h.span([h.Class("step-v")], [h.b([], ["100%"]), "Text size"]),
                      h.span([h.Class("step-b")], [icon("plus", h)]),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Stepper."]), " For values with a natural order."]),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("col w")],
                    [
                      h.span([h.Class("a-prog")], [h.i([h.Style({ width: "25%" })])]),
                      h.span([h.Class("a-prog thin")], [h.i([h.Style({ width: "60%" })])]),
                      h.span(
                        [h.Class("a-scrub")],
                        [
                          h.span(
                            [h.Class("a-prog")],
                            [
                              h.i([h.Style({ width: "27%" })]),
                              h.b([h.Style({ left: "27%" })]),
                            ],
                          ),
                          h.span([h.Class("a-scrub-t")], [h.span([], ["2:14"]), h.span([], ["−6:09"])]),
                        ],
                      ),
                      h.span(
                        [h.Class("a-scrub drag")],
                        [
                          h.span(
                            [h.Class("a-prog")],
                            [
                              h.i([h.Style({ width: "55%" })]),
                              h.b([h.Style({ left: "55%" })], [h.em([], ["4:36"])]),
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
                  h.b([], ["Progress."]),
                  " Reading progress, a thin chapter bar, and the audio scrubber at rest and while dragging.",
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
                    [h.Class("col w")],
                    [
                      h.span(
                        [h.Class("sf")],
                        [
                          icon("search", h),
                          h.span([h.Class("ph")], ["Search the dialogues"]),
                        ],
                      ),
                      h.span(
                        [h.Class("sf is-focus")],
                        [
                          icon("search", h),
                          h.b([], ["opin", h.i([h.Class("caret")])]),
                        ],
                      ),
                      h.span(
                        [h.Class("sf")],
                        [
                          icon("search", h),
                          h.b([], ["opinion"]),
                          h.span([h.Class("sf-x")], [icon("x", h)]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Search field."]), " Only on the Search screen: empty, typing and filled."]),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("col w")],
                    [
                      h.div(
                        [h.Class("a-lrow z")],
                        [
                          icon("globe", h),
                          h.b([], ["Original Greek"]),
                          icon("chev-r", h),
                        ],
                      ),
                      h.div(
                        [h.Class("lr")],
                        [
                          h.span([h.Class("lr-b")], [h.b([], ["Speaker names"])]),
                          h.span([h.Class("tgl on")], [h.i([])]),
                        ],
                      ),
                      h.div([h.Class("sel-r")], [h.b([], ["15 minutes"]), icon("check", h)]),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["List rows."]),
                  " Go somewhere, switch something, or choose one. Rows are at least 48 points tall.",
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
                      avatar({ person: "socrates", size: "sm" }, h),
                      avatar({ person: "socrates" }, h),
                      avatar({ person: "crito", size: "lg" }, h),
                      avatar({ person: "socrates", size: "xl" }, h),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Avatars."]), " 24, 34, 56 and 88 points."]),
            ],
          ),
          h.div(
            [h.Class("kt sheetdemo")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("a-sheet static")],
                    [
                      h.span([h.Class("a-grab")]),
                      h.div(
                        [h.Class("sh-h")],
                        [
                          h.b([], ["Chapters"]),
                          h.span([h.Class("a-ib soft")], [icon("x", h)]),
                        ],
                      ),
                      h.p([h.Class("sh-demo")], ["Grabber, title and close."]),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Sheet."]),
                  " Sheets rise from the bottom and never cover the line they are about.",
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
                    [h.Class("col")],
                    [
                      h.span(
                        [h.Class("a-menu static")],
                        [
                          h.span([], [icon("sparkle", h), "Explain"]),
                          h.span([], [icon("play", h), "Play from here"]),
                          h.span([], [icon("marker", h)]),
                          h.span([], [icon("copy", h)]),
                        ],
                      ),
                      h.div(
                        [h.Class("om")],
                        [
                          h.span([], [icon("share", h), "Share"]),
                          h.span([], [icon("download", h), "Download"]),
                          h.span([], [icon("check", h), "Mark as finished"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Menus."]),
                  " The selection menu sits above selected text. The overflow menu drops from a More button.",
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
                  h.span([h.Class("toast")], [icon("marker", h), "Highlight saved", h.b([], ["Undo"])]),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Toast."]),
                  " Confirms an action and offers Undo. It stays at least five seconds and pauses on hover or focus; Undo is never the only way back.",
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
                    [h.Class("links")],
                    [
                      h.span([h.Class("a-link")], ["See all"]),
                      h.span([h.Class("a-link sm")], ["Read in context"]),
                      h.p(
                        [],
                        [
                          "Crito’s hard news is that the ship from Delos is expected today. ",
                          h.span([h.Class("a-more")], ["More"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Links."]),
                  " Accent text with no underline. Inside running text a link is also semibold, so colour is never the only cue.",
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
                    [h.Class("a-row")],
                    [
                      h.span([h.Class("a-num on")], ["1"]),
                      h.span([h.Class("a-num play")], [icon("eq", h)]),
                      h.span([h.Class("a-num")], ["3"]),
                      h.span([h.Class("a-num done")], [icon("check", h)]),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Chapter numbers."]), " Current, playing, still to come, and finished."]),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("col w")],
                    [
                      h.span([h.Class("sk ln w60 h18")]),
                      h.span([h.Class("sk ln w90")]),
                      h.span([h.Class("sk ln w75")]),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Skeleton."]),
                  " Placeholder shapes while content loads. They pulse unless motion is reduced.",
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

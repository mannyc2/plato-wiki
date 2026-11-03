// Components: Reading.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";
import { avatar } from "../../people";

export const readingSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Reading"]),
      h.p([h.Class("sub-p")], ["The page, its guide, and what opens from a line."]),
      h.div(
        [h.Class("kgrid")],
        [
          h.div(
            [h.Class("kt wide")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
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
                            ],
                          ),
                        ],
                      ),
                      h.li(
                        [],
                        [
                          h.span([h.Class("a-num play")], [icon("eq", h)]),
                          h.span(
                            [h.Class("a-chap-b")],
                            [
                              h.b([], ["Which opinions matter, and what makes life worth living"]),
                              h.span([], ["Playing · 2:14 of 5:13"]),
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
                              h.span([], ["Starts at 13:36 · 6 min listen"]),
                            ],
                          ),
                        ],
                      ),
                      h.li(
                        [h.Class("done")],
                        [
                          h.span([h.Class("a-num done")], [icon("check", h)]),
                          h.span(
                            [h.Class("a-chap-b")],
                            [
                              h.b([], ["The Laws speak: judgment, nurture, and agreement"]),
                              h.span([], ["Finished"]),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Chapter rows."]), " Current, playing, still to come, and finished."]),
            ],
          ),
          h.div(
            [h.Class("kt")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.aside(
                    [h.Class("a-guide")],
                    [
                      h.div([h.Class("a-guide-h")], [icon("sparkle", h), h.b([], ["Chapter guide"])]),
                      h.p(
                        [],
                        [
                          "Before dawn, Crito sits silently beside Socrates, unable to sleep, while Socrates sleeps peacefully in prison. Crito’s hard news is that the ship from Delos is expected today, making tomorrow the expected day of death. ",
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
                  h.b([], ["Chapter guide."]),
                  " Opens each chapter. Its text is the accepted commentary, shown as written.",
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
                    [h.Class("a-text demo")],
                    [
                      h.p([], [h.span([h.Class("a-sp")], ["Crito"]), "Some little time ago."]),
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.mark([h.Class("a-sel")], ["Then why did you not wake me at once?"]),
                        ],
                      ),
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Crito"]),
                          h.mark([h.Class("a-hl")], ["No, no, by Zeus, Socrates."]),
                        ],
                      ),
                      h.p(
                        [h.Class("now")],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.mark([h.Class("a-now")], ["Why have you come at this time?"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Reading lines."]),
                  " Plain, selected, your highlight, and the line being read aloud.",
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
                    [h.Class("a-views")],
                    [
                      h.div(
                        [h.Class("a-view")],
                        [
                          avatar({ person: "socrates" }, h),
                          h.span(
                            [],
                            [
                              h.b([], ["Socrates"]),
                              h.span(
                                [],
                                [
                                  "It would be out of tune for someone of such an age to be vexed if he must now come to an end.",
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.div(
                        [h.Class("a-view")],
                        [
                          avatar({ person: "crito" }, h),
                          h.span(
                            [],
                            [
                              h.b([], ["Crito"]),
                              h.span(
                                [],
                                [
                                  "Others of such an age are caught in such misfortunes, but their age does not free them from being vexed at their present fortune.",
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.p([h.Class("a-views-f")], [icon("info", h), "The passage leaves this unresolved."]),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Two views."]), " A disagreement between speakers, shown as two voices."]),
            ],
          ),
          h.div(
            [h.Class("kt wide")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("orig")],
                    [
                      h.div([h.Class("orig-h")], [icon("globe", h), h.b([], ["Original Greek"])]),
                      h.p(
                        [h.Class("orig-g"), h.Lang("grc")],
                        [
                          "καὶ γὰρ ἄν, ὦ Κρίτων, πλημμελὲς εἴη ἀγανακτεῖν τηλικοῦτον ὄντα εἰ δεῖ ἤδη τελευτᾶν.",
                        ],
                      ),
                      h.p(
                        [h.Class("orig-t")],
                        [
                          "kai gar an, ō Kritōn, plēmmeles eiē aganaktein tēlikouton onta ei dei ēdē teleutan.",
                        ],
                      ),
                      h.span([h.Class("a-link sm")], ["Hide original"]),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Original Greek."]),
                  " Closed by default. Opens inside Explain, for one line at a time.",
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
                    [h.Class("a-web-card")],
                    [
                      h.div(
                        [h.Class("a-sh-head")],
                        [
                          avatar({ person: "socrates" }, h),
                          h.span([h.Class("a-sh-who")], [h.b([], ["Socrates"])]),
                          h.span([h.Class("a-ib soft")], [icon("x", h)]),
                        ],
                      ),
                      h.p(
                        [h.Class("a-sh-quote")],
                        [
                          "Well, Crito, it would be absurd if at my age I were disturbed because I must die now.",
                        ],
                      ),
                      h.div(
                        [h.Class("a-row")],
                        [
                          h.span([h.Class("a-btn fill sm")], [icon("play", h), "Play from here"]),
                          h.span([h.Class("a-btn ghost sm")], [icon("marker", h), "Highlight"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Explain."]),
                  " Opens from a line: who said it and what you can do with it. Where the line sits is one step away, in the note’s citations, not a reference line at rest. Until the recording’s line timings exist, the first button says Play chapter.",
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

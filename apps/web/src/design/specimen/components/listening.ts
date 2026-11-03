// Components: Listening.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";

export const listeningSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Listening"]),
      h.p([h.Class("sub-p")], ["Everything on the cloth colour uses the cover ink, never the paper palette."]),
      h.div(
        [h.Class("kgrid")],
        [
          h.div(
            [h.Class("kt dark")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("np-demo cloth"), h.Style({ "--cl": "#2F5D50" })],
                    [
                      h.div(
                        [h.Class("np-ctl")],
                        [
                          h.span([h.Class("np-c")], [icon("back15", h)]),
                          h.span([h.Class("np-play")], [icon("pause", h)]),
                          h.span([h.Class("np-c")], [icon("fwd30", h)]),
                        ],
                      ),
                      h.div(
                        [h.Class("np-bot")],
                        [
                          h.span([h.Class("np-chip")], ["1×"]),
                          h.span([h.Class("np-chip")], [icon("timer", h), "Sleep timer"]),
                          h.span([h.Class("np-ic")], [icon("list", h)]),
                          h.span([h.Class("np-chip")], [icon("bookopen", h), "Read along"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p(
                [],
                [
                  h.b([], ["Player controls."]),
                  " Back 15 seconds, play, forward 30, then speed, the sleep timer, chapters and read-along. On a phone the timer is its icon alone; it is never a moon, which reads as a theme switch.",
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("kt dark")],
            [
              h.div(
                [h.Class("kt-stage A")],
                [
                  h.div(
                    [h.Class("np-demo cloth ra-demo"), h.Style({ "--cl": "#2F5D50" })],
                    [
                      h.p(
                        [h.Class("ra-l past")],
                        [
                          h.span([h.Class("a-sp")], ["Crito"]),
                          h.span([], ["Some little time ago."]),
                        ],
                      ),
                      h.p(
                        [h.Class("ra-l now")],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.span(
                            [],
                            [
                              "Then why did you not wake me at once, instead of sitting by me in silence?",
                            ],
                          ),
                        ],
                      ),
                      h.p(
                        [h.Class("ra-l")],
                        [
                          h.span([h.Class("a-sp")], ["Crito"]),
                          h.span([], ["No, no, by Zeus, Socrates…"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Read-along lines."]), " Already read, being read, and still to come."]),
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
                      h.span([h.Class("st-ic sm")], [icon("alert", h)]),
                      h.b([h.Class("st-t sm")], ["This chapter didn’t load"]),
                      h.span([h.Class("a-btn fill sm")], [icon("refresh", h), "Try again"]),
                    ],
                  ),
                ],
              ),
              h.p([], [h.b([], ["Error and empty."]), " Say what happened and offer one way forward."]),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

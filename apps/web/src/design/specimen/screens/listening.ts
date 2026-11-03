// Phone screens: Listening.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { phone } from "../frames";

export const listeningScreens = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  phone(
    { theme: "cloth", cloth: "#2F5D50", caption: { title: "Now playing", text: "Full screen in the cover’s cloth colour. Read along peeks up from the bottom." } },
    [
      h.div(
        [h.Class("np")],
        [
          h.div(
            [h.Class("np-top")],
            [
              h.span([h.Class("a-ib plain")], [icon("chev-d", h)]),
              h.b([], ["Crito"]),
              h.span([h.Class("a-ib plain")], [icon("more", h)]),
            ],
          ),
          h.div([h.Class("np-cv")], [cover({ dialogue: "crito", size: "xl" }, h)]),
          h.div(
            [h.Class("np-tt")],
            [
              h.b([], ["Before dawn: a friend’s grief and Socrates’ composure"]),
              h.span([h.Class("np-sub")], ["Chapter 1 of 5", h.span([h.Class("np-tag")], ["Preview"])]),
            ],
          ),
          h.div(
            [h.Class("np-scrub")],
            [
              h.span([h.Class("np-bar")], [h.i([h.Style({ width: "27%" })]), h.b([h.Style({ left: "27%" })])]),
              h.span([h.Class("np-time")], [h.span([], ["2:14"]), h.span([], ["−6:09"])]),
            ],
          ),
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
              h.span([h.Class("np-ic")], [icon("timer", h)]),
              h.span([h.Class("np-ic")], [icon("list", h)]),
              h.span([h.Class("np-chip")], [icon("bookopen", h), "Read along"]),
            ],
          ),
          h.div(
            [h.Class("np-peek")],
            [
              h.span(
                [h.Class("np-peek-h")],
                [
                  h.b([], ["Read along"]),
                  h.span([h.Class("np-chip sm")], ["Open"]),
                ],
              ),
              h.span(
                [h.Class("np-peek-l")],
                [
                  h.span([h.Class("a-sp")], ["Crito"]),
                  "No, no, by Zeus, Socrates, I only wish I myself were not so sleepless…",
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
    { theme: "cloth", cloth: "#2F5D50", caption: { title: "Read along", text: "The narrator reads the chapter guide first, so it is the first thing highlighted. Following each line needs the recording’s line timings." } },
    [
      h.div(
        [h.Class("ra")],
        [
          h.div(
            [h.Class("np-top")],
            [
              h.span([h.Class("a-ib plain")], [icon("chev-d", h)]),
              h.span([h.Class("ra-tt")], [h.b([], ["Crito"]), h.span([], ["Before dawn"])]),
              h.span([h.Class("a-ib plain")], [icon("more", h)]),
            ],
          ),
          h.div(
            [h.Class("ra-body")],
            [
              h.div(
                [h.Class("ra-guide now")],
                [
                  h.span(
                    [h.Class("ra-gh")],
                    [
                      icon("sparkle", h),
                      h.b([], ["Chapter guide"]),
                      h.span([h.Class("ra-nar")], ["Narrator"]),
                    ],
                  ),
                  h.p(
                    [],
                    [
                      "Before dawn, Crito sits silently beside Socrates, unable to sleep, while Socrates sleeps peacefully in prison. Crito’s hard news is that the ship from Delos is expected today, making tomorrow the expected day of death.",
                    ],
                  ),
                ],
              ),
              h.p(
                [h.Class("ra-l")],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  h.span([], ["Why have you come at this time, Crito? Or isn’t it still early?"]),
                ],
              ),
              h.p([h.Class("ra-l")], [h.span([h.Class("a-sp")], ["Crito"]), h.span([], ["Yes, very early."])]),
              h.p(
                [h.Class("ra-l")],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  h.span([], ["About what time?"]),
                ],
              ),
              h.p(
                [h.Class("ra-l")],
                [
                  h.span([h.Class("a-sp")], ["Crito"]),
                  h.span([], ["Just before dawn."]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("ra-foot")],
            [
              h.span([h.Class("np-bar")], [h.i([h.Style({ width: "2%" })]), h.b([h.Style({ left: "2%" })])]),
              h.span([h.Class("np-time")], [h.span([], ["0:12"]), h.span([], ["−8:11"])]),
              h.div(
                [h.Class("ra-ctl")],
                [
                  h.span([h.Class("np-c")], [icon("back15", h)]),
                  h.span([h.Class("np-play sm")], [icon("pause", h)]),
                  h.span([h.Class("np-c")], [icon("fwd30", h)]),
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
    { theme: "cloth", cloth: "#2F5D50", caption: { title: "Tap while listening", text: "The tapped line lifts out with Explain and Play from here." } },
    [
      h.div(
        [h.Class("ra")],
        [
          h.div(
            [h.Class("np-top")],
            [
              h.span([h.Class("a-ib plain")], [icon("chev-d", h)]),
              h.span([h.Class("ra-tt")], [h.b([], ["Crito"]), h.span([], ["Before dawn"])]),
              h.span([h.Class("a-ib plain")], [icon("more", h)]),
            ],
          ),
          h.div(
            [h.Class("ra-body")],
            [
              h.div(
                [h.Style({ "margin-top": "-70px" })],
                [
                  h.p(
                    [h.Class("ra-l past")],
                    [
                      h.span([h.Class("a-sp")], ["Crito"]),
                      h.span(
                        [],
                        [
                          "…I think so more than ever in this present misfortune, since you bear it so easily and calmly.",
                        ],
                      ),
                    ],
                  ),
                  h.div(
                    [h.Class("ra-pick")],
                    [
                      h.p(
                        [h.Class("ra-l")],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.span(
                            [],
                            [
                              "Well, Crito, it would be absurd if at my age I were disturbed because I must die now.",
                            ],
                          ),
                        ],
                      ),
                      h.div(
                        [h.Class("a-row")],
                        [
                          h.span([h.Class("np-btn fill")], [icon("sparkle", h), "Explain"]),
                          h.span([h.Class("np-btn")], [icon("play", h), "Play from here"]),
                          h.span([h.Class("np-ic")], [icon("share", h)]),
                        ],
                      ),
                    ],
                  ),
                  h.p(
                    [h.Class("ra-l")],
                    [
                      h.span([h.Class("a-sp")], ["Crito"]),
                      h.span(
                        [],
                        [
                          "Other men as old, Socrates, become involved in similar misfortunes, but their age does not in the least prevent them from being disturbed by their fate.",
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("ra-foot")],
            [
              h.span([h.Class("np-bar")], [h.i([h.Style({ width: "27%" })]), h.b([h.Style({ left: "27%" })])]),
              h.span([h.Class("np-time")], [h.span([], ["2:14"]), h.span([], ["−6:09"])]),
              h.div(
                [h.Class("ra-ctl")],
                [
                  h.span([h.Class("np-c")], [icon("back15", h)]),
                  h.span([h.Class("np-play sm")], [icon("pause", h)]),
                  h.span([h.Class("np-c")], [icon("fwd30", h)]),
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
    { theme: "cloth", cloth: "#2F5D50", caption: { title: "Speed and sleep", text: "A segmented control for speed and a checked list for the sleep timer." } },
    [
      h.div(
        [h.Class("np dim")],
        [
          h.div(
            [h.Class("np-top")],
            [
              h.span([h.Class("a-ib plain")], [icon("chev-d", h)]),
              h.b([], ["Crito"]),
              h.span([h.Class("a-ib plain")], [icon("more", h)]),
            ],
          ),
          h.div([h.Class("np-cv")], [cover({ dialogue: "crito", size: "xl" }, h)]),
        ],
      ),
      h.div([h.Class("a-scrim")]),
      h.div(
        [h.Class("a-sheet ss")],
        [
          h.span([h.Class("a-grab")]),
          h.div([h.Class("sh-h")], [h.b([], ["Playback"]), h.span([h.Class("a-ib soft")], [icon("x", h)])]),
          h.h3([h.Class("a-sh-h")], ["Speed"]),
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
          h.h3([h.Class("a-sh-h")], ["Sleep timer"]),
          h.div(
            [h.Class("sel")],
            [
              h.div([h.Class("sel-r")], [h.b([], ["Off"]), icon("check", h)]),
              h.div([h.Class("sel-r")], [h.b([], ["15 minutes"])]),
              h.div([h.Class("sel-r")], [h.b([], ["30 minutes"])]),
              h.div([h.Class("sel-r")], [h.b([], ["End of chapter"])]),
            ],
          ),
        ],
      ),
    ],
    h,
  ),
  ];

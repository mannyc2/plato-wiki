// Desktop at 1440: Now playing.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import type { Frame } from "../frames";

export const nowPlayingFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-listen", tab: "Crito · Plato", theme: "cloth", cloth: "#2F5D50", caption: { title: "Now playing", text: "The full player on the cover colour, kept as it was: the player on the left, the read-along on the right. The sleep timer lives here, named, rather than as a moon in the bar." } },
    [
      h.div(
        [h.Class("w-np")],
        [
          h.div(
            [h.Class("w-np-top")],
            [
              h.span([h.Class("a-ib plain")], [icon("chev-d", h)]),
              h.span([h.Class("ra-tt")], [h.b([], ["Crito"]), h.span([], ["Now playing"])]),
              h.span([h.Class("a-ib plain")], [icon("more", h)]),
            ],
          ),
          h.section(
            [h.Class("w-np-l")],
            [
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
                  h.span(
                    [h.Class("np-bar")],
                    [
                      h.i([h.Style({ width: "27%" })]),
                      h.b([h.Style({ left: "27%" })]),
                    ],
                  ),
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
                  h.span([h.Class("np-chip")], [icon("timer", h), "Sleep timer"]),
                  h.span([h.Class("np-ic")], [icon("list", h)]),
                  h.span(
                    [h.Class("w-npv")],
                    [
                      icon("speaker", h),
                      h.span([h.Class("np-bar")], [h.i([h.Style({ width: "68%" })])]),
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.section(
            [h.Class("w-np-r")],
            [
              h.div(
                [h.Class("w-np-tabs")],
                [
                  h.span([h.Class("np-chip on")], ["Read along"]),
                  h.span([h.Class("np-chip")], ["Chapters"]),
                ],
              ),
              h.div(
                [h.Class("w-ra")],
                [
                  h.div(
                    [h.Class("w-ra-in")],
                    [
                      h.p(
                        [h.Class("ra-l past")],
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
                        [h.Class("ra-l past")],
                        [
                          h.span([h.Class("a-sp")], ["Crito"]),
                          h.span(
                            [],
                            [
                              "No, no, by Zeus, Socrates, I only wish I myself were not so sleepless and sorrowful. But I have been wondering at you for some time, seeing how sweetly you sleep; and I purposely refrained from waking you, that you might pass the time as pleasantly as possible. I have often thought throughout your life hitherto that you were of a happy disposition, and I think so more than ever in this present misfortune, since you bear it so easily and calmly.",
                            ],
                          ),
                        ],
                      ),
                      h.p(
                        [h.Class("ra-l now")],
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
                      h.p(
                        [h.Class("ra-l")],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.span([], ["That is true. But why have you come so early?"]),
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

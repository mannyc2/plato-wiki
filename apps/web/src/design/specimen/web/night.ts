// Desktop at 1440: Night, following the recording.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import type { Frame } from "../frames";

export const nightFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-night", tab: "Crito · Plato", theme: "night", caption: { title: "Night, following the recording", text: "Playing, the page follows the line being read and the bar shows it is following. The bar keeps only the controls and the chapter’s scrubber: the chapter list on the left already says what is playing." } },
    [
      h.div(
        [h.Class("w-rd two")],
        [
          h.aside(
            [h.Class("w-toc")],
            [
              h.span([h.Class("w-back")], [icon("chev-l", h), "Library"]),
              " ",
              h.div(
                [h.Class("w-book")],
                [
                  cover({ dialogue: "crito", size: "sm" }, h),
                  h.span([], [h.b([], ["Crito"]), h.span([], ["24 min read"]), h.span([], ["33 min listen"])]),
                ],
              ),
              h.ol(
                [h.Class("w-tocl")],
                [
                  h.li(
                    [h.Class("on")],
                    [
                      h.span([h.Class("a-num play")], [icon("eq", h)]),
                      h.span(
                        [h.Class("w-tocl-b")],
                        [
                          h.b([], ["Before dawn"]),
                          h.span([], ["Playing · 2:14 of 8:23"]),
                          h.span([h.Class("a-prog")], [h.i([h.Style({ width: "27%" })])]),
                        ],
                      ),
                    ],
                  ),
                  h.li(
                    [h.Class("")],
                    [
                      h.span([h.Class("a-num")], ["2"]),
                      h.span(
                        [h.Class("w-tocl-b")],
                        [
                          h.b([], ["Which opinions matter"]),
                          h.span([], ["4 min read · 5 min listen"]),
                        ],
                      ),
                    ],
                  ),
                  h.li(
                    [h.Class("")],
                    [
                      h.span([h.Class("a-num")], ["3"]),
                      h.span(
                        [h.Class("w-tocl-b")],
                        [
                          h.b([], ["From agreement to consistency"]),
                          h.span([], ["4 min read · 6 min listen"]),
                        ],
                      ),
                    ],
                  ),
                  h.li(
                    [h.Class("")],
                    [
                      h.span([h.Class("a-num")], ["4"]),
                      h.span(
                        [h.Class("w-tocl-b")],
                        [
                          h.b([], ["The Laws speak"]),
                          h.span([], ["6 min read · 8 min listen"]),
                        ],
                      ),
                    ],
                  ),
                  h.li(
                    [h.Class("")],
                    [
                      h.span([h.Class("a-num")], ["5"]),
                      h.span(
                        [h.Class("w-tocl-b")],
                        [
                          h.b([], ["Exile and silence"]),
                          h.span([], ["4 min read · 5 min listen"]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              " ",
              h.span([h.Class("w-side-f")], [icon("sliders", h), h.b([], ["Settings"])]),
            ],
          ),
          h.div(
            [h.Class("w-page")],
            [
              h.div(
                [h.Class("w-ptool")],
                [
                  h.span(
                    [h.Class("w-pt")],
                    [
                      h.b([], ["Before dawn"]),
                      h.span([], ["Chapter 1 of 5 · 5 min left"]),
                    ],
                  ),
                  h.span([h.Class("grow")]),
                  h.span([h.Class("w-tb on")], [icon("eq", h), "Following the recording"]),
                  h.span([h.Class("w-tb")], [icon("aa", h), "Text"]),
                  h.span([h.Class("w-tb")], [icon("sparkle", h), "Explain"]),
                ],
              ),
              h.article(
                [h.Class("w-text")],
                [
                  h.div(
                    [h.Class("a-text")],
                    [
                      h.p([], [h.span([h.Class("a-sp")], ["Crito"]), "Some little time ago."]),
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          "Then why did you not wake me at once, instead of sitting by me in silence?",
                        ],
                      ),
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Crito"]),
                          "No, no, by Zeus, Socrates, I only wish I myself were not so sleepless and sorrowful. But I have been wondering at you for some time, seeing how sweetly you sleep; and I purposely refrained from waking you, that you might pass the time as pleasantly as possible. I have often thought throughout your life hitherto that you were of a happy disposition, and I think so more than ever in this present misfortune, since you bear it so easily and calmly.",
                        ],
                      ),
                      h.p(
                        [h.Class("now")],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.mark(
                            [h.Class("a-now")],
                            [
                              "Well, Crito, it would be absurd if at my age I were disturbed because I must die now.",
                            ],
                          ),
                        ],
                      ),
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Crito"]),
                          "Other men as old, Socrates, become involved in similar misfortunes, but their age does not in the least prevent them from being disturbed by their fate.",
                        ],
                      ),
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          "That is true. But why have you come so early?",
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
  ];

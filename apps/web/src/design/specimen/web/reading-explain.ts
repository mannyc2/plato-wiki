// Desktop at 1440: Reading with Explain.
import type { Html, HtmlBuilder } from "foldkit/html";
import { blockView, contextFor, trailView } from "../../block-views";
import { parsePage } from "../../blocks";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaRow } from "../../ideas";
import source from "../../pages/crito/43b-c.md" with { type: "text" };
import { excerpt } from "../../passages";
import { avatar } from "../../people";
import type { Frame } from "../frames";

// The chosen line, pulled from the text so the page and the panel quote the same words.
const LINE = excerpt("crito 43b-c", "Well, Crito", "must die now.") ?? "";

// Explain's note on the line is a curated page, drawn with the quieter sheet headings.
const { page } = parsePage(source);
const context = contextFor(page, "sheet", { key: "sleepless", side: "start" });

export const readingExplainFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-read", tab: "Crito · Plato", caption: { title: "Reading with Explain", text: "Choosing a line opens Explain beside the page. Its note is a curated page drawn as blocks. Each claim carries a faint number whose card shows the sentence it rests on, opened here on the first, so the panel names no reference until you ask. Below it, the chapter’s people and the ideas at work, each with its emblem. No player bar while you read." } },
    [
      h.div(
        [h.Class("w-rd nobar")],
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
                      h.span([h.Class("a-num on")], ["1"]),
                      h.span(
                        [h.Class("w-tocl-b")],
                        [
                          h.b([], ["Before dawn"]),
                          h.span([], ["Reading · 5 min left"]),
                          h.span([h.Class("a-prog")], [h.i([h.Style({ width: "22%" })])]),
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
                  h.span([h.Class("w-tb")], [icon("aa", h), "Text"]),
                  h.span([h.Class("w-tb")], [icon("headphones", h), "Listen"]),
                  h.span([h.Class("w-tb on")], [icon("sparkle", h), "Explain"]),
                ],
              ),
              h.article(
                [h.Class("w-text")],
                [
                  h.div(
                    [h.Class("a-text")],
                    [
                      h.p(
                        [],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          "Have you just come, or some time ago?",
                        ],
                      ),
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
                        [h.Class("a-selp")],
                        [
                          h.span([h.Class("a-sp")], ["Socrates"]),
                          h.mark(
                            [h.Class("a-sel")],
                            [
                              LINE,
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
          h.aside(
            [h.Class("w-ex")],
            [
              h.div([h.Class("w-ex-h")], [h.b([], [icon("sparkle", h), "Explain"]), h.span([h.Class("a-ib plain")], [icon("x", h)])]),
              h.div(
                [h.Class("w-ex-b")],
                [
                  h.div([h.Class("a-sh-head")], [avatar({ person: "socrates" }, h), h.span([h.Class("a-sh-who")], [h.b([], ["Socrates"])])]),
                  h.p([h.Class("a-sh-quote")], [LINE]),
                  h.div(
                    [h.Class("a-row")],
                    [
                      h.span([h.Class("a-btn fill sm")], [icon("play", h), "Play from here"]),
                      h.span([h.Class("a-btn ghost sm")], [icon("marker", h), "Highlight"]),
                      h.span([h.Class("a-ib soft")], [icon("copy", h)]),
                    ],
                  ),
                  ...page.blocks.map((block) => blockView(block, context, h)),
                  trailView(context, h),
                  h.h3([h.Class("a-sh-h")], ["In this chapter"]),
                  h.div(
                    [h.Class("w-xray")],
                    [
                      h.span([], [avatar({ person: "socrates", size: "sm" }, h), "Socrates"]),
                      h.span([], [avatar({ person: "crito", size: "sm" }, h), "Crito"]),
                      h.span([], [avatar({ person: "woman", size: "sm" }, h), "A woman in a dream"]),
                    ],
                  ),
                  ideaRow({ idea: "prison", where: "Twice in this chapter, and in the Phaedo" }, h),
                  ideaRow({ idea: "named-cast", where: "Crito names Simmias and Cebes · in 8 more dialogues" }, h),
                  h.div([h.Class("a-lrow")], [icon("globe", h), h.b([], ["Original Greek"]), icon("chev-r", h)]),
                  h.div([h.Class("a-lrow")], [icon("list", h), h.b([], ["Key details"]), h.span([h.Class("w-cnt")], ["3"]), icon("chev-r", h)]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

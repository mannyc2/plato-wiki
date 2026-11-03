// Phone screens: Reading.
import type { Html, HtmlBuilder } from "foldkit/html";
import { blockView, contextFor, trailView } from "../../block-views";
import { parsePage } from "../../blocks";
import { cover } from "../../covers";
import { icon } from "../../icons";
import answerSource from "../../pages/samples/answer-crito-54d.md" with { type: "text" };
import explainSource from "../../pages/crito/43b-c.md" with { type: "text" };
import { excerpt } from "../../passages";
import { avatar } from "../../people";
import { phone } from "../frames";

const explain = parsePage(explainSource);
const explainContext = contextFor(explain.page, "sheet");

// A line with no curated note gets one written when the reader asks, checked like any page.
const answer = parsePage(answerSource);
const answerContext = contextFor(answer.page, "sheet", { key: "ring", side: "start" });
const ASKED = excerpt("crito 54d", "And be assured", "speak in vain.") ?? "";

export const readingScreens = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  phone(
    { caption: { title: "Read", text: "Each chapter opens with its guide. Speaker names are quiet labels; there are no marks in the text." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.article(
        [h.Class("a-reader")],
        [
          h.h1([h.Class("a-ch-t")], ["Before dawn: a friend’s grief and Socrates’ composure"]),
          h.p([h.Class("a-ch-m")], ["Chapter 1 of 5 · 6 min read"]),
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
          h.div(
            [h.Class("a-text")],
            [
              h.p(
                [],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  "Why have you come at this time, Crito? Or isn’t it still early?",
                ],
              ),
              h.p([], [h.span([h.Class("a-sp")], ["Crito"]), "Yes, very early."]),
              h.p([], [h.span([h.Class("a-sp")], ["Socrates"]), "About what time?"]),
              h.p([], [h.span([h.Class("a-sp")], ["Crito"]), "Just before dawn."]),
              h.p(
                [],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  "I am surprised that the watchman of the prison was willing to let you in.",
                ],
              ),
              h.p(
                [],
                [
                  h.span([h.Class("a-sp")], ["Crito"]),
                  "He is used to me by this time, Socrates, because I come here so often, and besides I have done something for him.",
                ],
              ),
              h.p([], [h.span([h.Class("a-sp")], ["Socrates"]), "Have you just come, or some time ago?"]),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("a-rfoot")],
        [
          h.span([h.Class("a-prog thin")], [h.i([h.Style({ width: "4%" })])]),
          h.span([], ["6 min left in chapter"]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Tap a line", text: "Selecting a line brings up Explain, Play from here, highlight and copy." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.div(
        [h.Class("a-reader scrolled")],
        [
          h.div(
            [h.Class("a-text"), h.Style({ "margin-top": "0px" })],
            [
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
                  h.span(
                    [h.Class("a-menu")],
                    [
                      h.span([], [icon("sparkle", h), "Explain"]),
                      h.span([], [icon("play", h), "Play from here"]),
                      h.span([], [icon("marker", h)]),
                      h.span([], [icon("copy", h)]),
                    ],
                  ),
                  h.mark(
                    [h.Class("a-sel")],
                    [
                      h.i([h.Class("a-h l")]),
                      "Well, Crito, it would be absurd if at my age I were disturbed because I must die now.",
                      h.i([h.Class("a-h r")]),
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
      h.div(
        [h.Class("a-rfoot")],
        [
          h.span([h.Class("a-prog thin")], [h.i([h.Style({ width: "22%" })])]),
          h.span([], ["5 min left in chapter"]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Explain", text: "What’s happening, the two views in tension and key details, in plain sentences." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.div(
        [h.Class("a-reader scrolled")],
        [
          h.div(
            [h.Class("a-text"), h.Style({ "margin-top": "-505px" })],
            [
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
                [],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  h.mark(
                    [h.Class("a-sel")],
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
      h.div([h.Class("a-scrim")]),
      h.div(
        [h.Class("a-sheet")],
        [
          h.span([h.Class("a-grab")]),
          " ",
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
          ...explain.page.blocks.map((block) => blockView(block, explainContext, h)),
          trailView(explainContext, h),
          h.div([h.Class("a-lrow")], [icon("globe", h), h.b([], ["Original Greek"]), icon("chev-r", h)]),
          h.h3([h.Class("a-sh-h")], ["Key details"]),
          h.ul(
            [h.Class("a-dets")],
            [
              h.li([], ["Crito says that he sat silently beside Socrates while Socrates slept."]),
              h.li([], ["Crito says that Socrates was sleeping sweetly."]),
              h.li([], ["Crito says that Socrates bears his misfortune easily and gently."]),
            ],
          ),
        ],
      ),
    ],
    h,
  ),
  phone(
    {
      caption: {
        title: "Written on request",
        text: "A line without a curated note can have one written when you ask. Before it is shown it passes the checks a curated page passes: every quotation must be found at the place it cites. The note says how it was written; otherwise it looks like any other. A tapped number opens its source below the paragraph.",
      },
    },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.div(
        [h.Class("a-reader scrolled")],
        [
          h.div(
            [h.Class("a-text")],
            [
              h.p(
                [h.Class("a-selp")],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  `${excerpt("crito 54d", "Be well assured", "any other words.") ?? ""} `,
                  h.mark([h.Class("a-sel")], [ASKED]),
                  ` ${excerpt("crito 54d", "Nevertheless", "anything, speak.") ?? ""}`,
                ],
              ),
              h.p([], [h.span([h.Class("a-sp")], ["Crito"]), excerpt("crito 54d", "No, Socrates", "nothing to say.") ?? ""]),
              h.p([], [h.span([h.Class("a-sp")], ["Socrates"]), excerpt("crito 54e", "Then, Crito", "God leads us.") ?? ""]),
            ],
          ),
        ],
      ),
      h.div([h.Class("a-scrim")]),
      h.div(
        [h.Class("a-sheet tall")],
        [
          h.span([h.Class("a-grab")]),
          h.div(
            [h.Class("a-sh-head")],
            [avatar({ person: "socrates" }, h), h.span([h.Class("a-sh-who")], [h.b([], ["Socrates"])]), h.span([h.Class("a-ib soft")], [icon("x", h)])],
          ),
          h.p([h.Class("a-sh-quote")], [ASKED]),
          h.div(
            [h.Class("a-row")],
            [
              h.span([h.Class("a-btn fill sm")], [icon("play", h), "Play from here"]),
              h.span([h.Class("a-btn ghost sm")], [icon("marker", h), "Highlight"]),
            ],
          ),
          ...(answer.page.about.get("written") === "on request"
            ? [h.p([h.Class("a-req")], [icon("sparkle", h), "Written when you asked. Every quotation is checked against the text."])]
            : []),
          ...answer.page.blocks.map((block) => blockView(block, answerContext, h)),
          trailView(answerContext, h),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Original Greek", text: "The Greek for this line with a transliteration, inside Explain." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.div(
        [h.Class("a-reader scrolled")],
        [
          h.div(
            [h.Class("a-text"), h.Style({ "margin-top": "-505px" })],
            [
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
                [],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  h.mark(
                    [h.Class("a-sel")],
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
      h.div([h.Class("a-scrim")]),
      h.div(
        [h.Class("a-sheet full")],
        [
          h.span([h.Class("a-grab")]),
          h.div(
            [h.Class("sh-scroll")],
            [
              h.div(
                [h.Style({ "margin-top": "-322px" })],
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
                  h.h3([h.Class("a-sh-h")], ["What’s happening"]),
                  h.p(
                    [h.Class("a-sh-p")],
                    [
                      "The scene’s first tension is therefore not an argument but a contrast: grief keeps the friend awake; Socrates meets the timetable with calm acceptance.",
                    ],
                  ),
                  h.h3([h.Class("a-sh-h")], ["Two views"]),
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
                  h.h3([h.Class("a-sh-h")], ["Key details"]),
                  h.ul(
                    [h.Class("a-dets")],
                    [
                      h.li([], ["Crito says that he sat silently beside Socrates while Socrates slept."]),
                      h.li([], ["Crito says that Socrates was sleeping sweetly."]),
                      h.li([], ["Crito says that Socrates bears his misfortune easily and gently."]),
                    ],
                  ),
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
    { caption: { title: "Text", text: "Size, three themes, and switches that visibly change the page." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.article(
        [h.Class("a-reader")],
        [
          h.h1([h.Class("a-ch-t")], ["Before dawn: a friend’s grief and Socrates’ composure"]),
          h.p([h.Class("a-ch-m")], ["Chapter 1 of 5 · 6 min read"]),
          h.div(
            [h.Class("a-text")],
            [
              h.p(
                [],
                [
                  h.span([h.Class("a-sp")], ["Socrates"]),
                  "Why have you come at this time, Crito? Or isn’t it still early?",
                ],
              ),
              h.p([], [h.span([h.Class("a-sp")], ["Crito"]), "Yes, very early."]),
              h.p([], [h.span([h.Class("a-sp")], ["Socrates"]), "About what time?"]),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("a-sheet ts")],
        [
          h.span([h.Class("a-grab")]),
          h.div([h.Class("sh-h")], [h.b([], ["Text"]), h.span([h.Class("a-ib soft")], [icon("x", h)])]),
          h.div(
            [h.Class("step")],
            [
              h.span([h.Class("step-b")], [icon("minus", h)]),
              h.span([h.Class("step-v")], [h.b([], ["100%"]), "Text size"]),
              h.span([h.Class("step-b")], [icon("plus", h)]),
            ],
          ),
          h.div(
            [h.Class("themes")],
            [
              h.span([h.Class("th th-paper on")], [h.b([], ["Aa"]), h.span([], ["Paper"])]),
              h.span([h.Class("th th-sepia")], [h.b([], ["Aa"]), h.span([], ["Sepia"])]),
              h.span([h.Class("th th-night")], [h.b([], ["Aa"]), h.span([], ["Night"])]),
            ],
          ),
          h.div(
            [h.Class("lr")],
            [
              h.span(
                [h.Class("lr-b")],
                [
                  h.b([], ["Chapter guides"]),
                  h.span([], ["Show the guide at the start of each chapter"]),
                ],
              ),
              h.span([h.Class("tgl on")], [h.i([])]),
            ],
          ),
          h.div(
            [h.Class("lr")],
            [
              h.span([h.Class("lr-b")], [h.b([], ["Speaker names"])]),
              h.span([h.Class("tgl on")], [h.i([])]),
            ],
          ),
          h.div(
            [h.Class("lr")],
            [
              h.span(
                [h.Class("lr-b")],
                [
                  h.b([], ["Follow the recording"]),
                  h.span([], ["Highlight the line being read"]),
                ],
              ),
              h.span([h.Class("tgl on")], [h.i([])]),
            ],
          ),
        ],
      ),
    ],
    h,
  ),
  phone(
    { theme: "night", caption: { title: "Night, following along", text: "The Night theme while the recording plays: the line being read is tinted. This needs the recording’s line timings." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.div(
        [h.Class("a-reader scrolled")],
        [
          h.div(
            [h.Class("a-text"), h.Style({ "margin-top": "-60px" })],
            [
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
      h.div(
        [h.Class("mp float")],
        [
          cover({ dialogue: "crito", size: "xs" }, h),
          h.span([h.Class("mp-t")], [h.b([], ["Following the recording"]), h.span([], ["2:14 of 8:23"])]),
          h.span([h.Class("mp-b")], [icon("pause", h)]),
        ],
      ),
    ],
    h,
  ),
  ];

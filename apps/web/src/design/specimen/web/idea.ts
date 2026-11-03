// Desktop at 1440: Idea.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";
import { TRAILS, ideaTrail } from "../../idea-trail";
import { IDEAS, ideaBadge } from "../../ideas";
import { IDEA_QUOTES, passageCard } from "../../passage-cards";
import { avatar } from "../../people";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

const idea = IDEAS["truth-priority"];

export const ideaFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    {
      id: "web-idea",
      tab: `${idea.name} · Plato`,
      caption: {
        title: "Idea",
        text: "Each idea has its own emblem, and its passages are quoted from the text by reference. The panel follows you through the idea: where you met it, where it comes next in what you are reading or listening to, and what lies beyond, in place of the grid of dialogues. Who speaks counts its passages by their marked speaker.",
      },
    },
    [
      h.div(
        [h.Class("w-app nobar")],
        [
          sidebar({ place: "explore" }, h),
          h.div(
            [h.Class("w-main"), h.Style({ "--band": "#E3EAF0" })],
            [
              h.div([h.Class("w-band")]),
              h.div(
                [h.Class("w-in")],
                [
                  h.span([h.Class("a-ib glass w-back-ib")], [icon("chev-l", h)]),
                  h.div(
                    [h.Class("w-ih")],
                    [
                      ideaBadge({ idea: "truth-priority", size: "lg" }, h),
                      h.div(
                        [],
                        [
                          h.h1([h.Class("w-h1 sm")], [idea.name]),
                          h.p([h.Class("w-bm")], [`${idea.passages} passages in ${idea.dialogues} dialogues`]),
                        ],
                      ),
                      h.span([h.Class("grow")]),
                      h.span([h.Class("a-btn ghost sm")], [icon("share", h), "Share"]),
                    ],
                  ),
                  h.p(
                    [h.Class("w-ilede")],
                    [
                      `${idea.line} In the Crito: Socrates will not give up his arguments now that his own life depends on them.`,
                    ],
                  ),
                  h.div(
                    [h.Class("chips")],
                    [
                      h.span([h.Class("a-chip on")], ["All ", h.i([], ["13"])]),
                      h.span([h.Class("a-chip")], ["Theaetetus ", h.i([], ["3"])]),
                      h.span([h.Class("a-chip")], ["Phaedo ", h.i([], ["2"])]),
                      h.span([h.Class("a-chip")], ["Philebus ", h.i([], ["2"])]),
                      h.span([h.Class("a-chip")], ["Charmides ", h.i([], ["1"])]),
                      h.span([h.Class("a-chip")], ["Crito ", h.i([], ["1"])]),
                      h.span([h.Class("a-chip")], ["More"]),
                    ],
                  ),
                  h.div(
                    [h.Class("w-cols")],
                    [
                      h.section([h.Class("w-pcs")], IDEA_QUOTES["truth-priority"].map((passage) => passageCard(passage, h))),
                      h.aside(
                        [h.Class("w-stack")],
                        [
                          h.div(
                            [h.Class("w-card")],
                            [
                              h.div([h.Class("w-card-h")], [h.h2([h.Class("a-h3")], ["You and this idea"])]),
                              ...ideaTrail(TRAILS["truth-priority"], h),
                            ],
                          ),
                          h.div(
                            [h.Class("w-card")],
                            [
                              h.div(
                                [h.Class("w-card-h")],
                                [h.h2([h.Class("a-h3")], ["Who’s speaking"]), h.span([h.Class("w-cap")], ["Passages"])],
                              ),
                              h.div(
                                [h.Class("w-who-l")],
                                [
                                  h.span([h.Class("w-pr")], [avatar({ person: "socrates", size: "sm" }, h), h.span([], [h.b([], ["Socrates"])]), h.em([], ["9"])]),
                                  h.span(
                                    [h.Class("w-pr")],
                                    [avatar({ person: "visitor", size: "sm" }, h), h.span([], [h.b([], ["The visitor from Elea"])]), h.em([], ["1"])],
                                  ),
                                  h.span([h.Class("w-pr")], [avatar({ person: "protarchus", size: "sm" }, h), h.span([], [h.b([], ["Protarchus"])]), h.em([], ["1"])]),
                                ],
                              ),
                              h.p([h.Class("w-fine")], ["2 more wait for their speaker to be marked, one of them in the Charmides."]),
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
    ],
  ),
];

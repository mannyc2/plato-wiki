// Desktop at 1440: Explore.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { ideaBadge } from "../../ideas";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

export const exploreFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-explore", tab: "Explore · Plato", caption: { title: "Explore", text: "Every idea says what it is in one sentence, so a name like Forced alternative explains itself. Counts are distinct passages. Assent chains are no longer an idea: the analysis plan measures agreement from the turns. The panel ranks how deep the telling goes, from the voice records. Descriptions are proposed copy." } },
    [
      h.div(
        [h.Class("w-app nobar")],
        [
          sidebar({ place: "explore" }, h),
          h.div(
            [h.Class("w-main")],
            [
              h.div(
                [h.Class("w-in")],
                [
                  h.div([h.Class("w-ph")], [h.h1([h.Class("w-title")], ["Explore"])]),
                  h.p(
                    [h.Class("w-lede")],
                    [
                      "Arguments, images and scenes that recur across the dialogues, each with every passage where it appears.",
                    ],
                  ),
                  h.div(
                    [h.Class("w-cols")],
                    [
                      h.div(
                        [],
                        [
                          h.div(
                            [h.Class("a-sec")],
                            [
                              h.h2([h.Class("a-h2")], ["How the argument moves"]),
                              h.span([h.Class("a-link")], ["See all"]),
                            ],
                          ),
                          h.div(
                            [h.Class("w-tiles")],
                            [
                              h.span(
                                [h.Class("w-it")],
                                [
                                  ideaBadge({ idea: "definition", size: "md" }, h),
                                  h.b([], ["Definition proposed"]),
                                  h.p(
                                    [],
                                    [
                                      "Someone answers a “what is it?” question with a definition, usually to have it tested.",
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["111 passages"]),
                                      h.span([], ["22 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                              h.span(
                                [h.Class("w-it")],
                                [
                                  ideaBadge({ idea: "forced-alternative", size: "md" }, h),
                                  h.b([], ["Forced alternative"]),
                                  h.p(
                                    [],
                                    [
                                      "Someone is made to choose between two answers that cannot both stand.",
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["50 passages"]),
                                      h.span([], ["14 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                              h.span(
                                [h.Class("w-it")],
                                [
                                  ideaBadge({ idea: "aporia", size: "md" }, h),
                                  h.b([], ["Aporia reported"]),
                                  h.p(
                                    [],
                                    [
                                      "A speaker admits the argument has left them stuck, with no answer.",
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["34 passages"]),
                                      h.span([], ["15 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                          h.div(
                            [h.Class("a-sec")],
                            [
                              h.h2([h.Class("a-h2")], ["Analogies and images"]),
                              h.span([h.Class("a-link")], ["See all"]),
                            ],
                          ),
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
                                  ideaBadge({ idea: "poetic-citation", size: "md" }, h),
                                  h.b([], ["Poetic citation as argument"]),
                                  h.p([], ["Lines from a poet, often Homer, quoted as evidence for a point."]),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["26 passages"]),
                                      h.span([], ["11 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                          h.div(
                            [h.Class("a-sec")],
                            [
                              h.h2([h.Class("a-h2")], ["Scenes and speakers"]),
                              h.span([h.Class("a-link")], ["See all"]),
                            ],
                          ),
                          h.div(
                            [h.Class("w-tiles")],
                            [
                              h.span(
                                [h.Class("w-it")],
                                [
                                  ideaBadge({ idea: "figures", size: "md" }, h),
                                  h.b([], ["Figures or types as evidence"]),
                                  h.p(
                                    [],
                                    [
                                      "Famous people or kinds of people cited as proof, such as Themistocles or the craftsmen.",
                                    ],
                                  ),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["51 passages"]),
                                      h.span([], ["13 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                              h.span(
                                [h.Class("w-it")],
                                [
                                  ideaBadge({ idea: "character", size: "md" }, h),
                                  h.b([], ["Character description by speaker"]),
                                  h.p([], ["One speaker describes what another person is like."]),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["22 passages"]),
                                      h.span([], ["11 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                              h.span(
                                [h.Class("w-it")],
                                [
                                  ideaBadge({ idea: "initial-question", size: "md" }, h),
                                  h.b([], ["Initial question stated"]),
                                  h.p([], ["The question the conversation will pursue is put on the table."]),
                                  h.span(
                                    [h.Class("w-it-m")],
                                    [
                                      h.span([], ["17 passages"]),
                                      h.span([], ["9 dialogues"]),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      h.aside(
                        [h.Class("w-stack")],
                        [
                          h.div(
                            [h.Class("w-cc"), h.Style({ "--band": "#E7DCCC" })],
                            [
                              h.span(
                                [h.Class("w-cc-cv")],
                                [
                                  cover({ dialogue: "euthyphro", size: "sm" }, h),
                                  cover({ dialogue: "apology", size: "sm" }, h),
                                  cover({ dialogue: "crito", size: "sm" }, h),
                                  cover({ dialogue: "phaedo", size: "sm" }, h),
                                ],
                              ),
                              h.b([], ["The trial and death of Socrates"]),
                              h.p([], ["Four dialogues, best read in order."]),
                              h.span([h.Class("a-btn fill sm")], ["Start with Euthyphro"]),
                            ],
                          ),
                          h.div(
                            [h.Class("w-card")],
                            [
                              h.div(
                                [h.Class("w-card-h")],
                                [
                                  h.h2([h.Class("a-h3")], ["How deep the telling goes"]),
                                  icon("layers", h),
                                ],
                              ),
                              h.p(
                                [h.Class("w-card-sub")],
                                [
                                  "Eight dialogues reach you through someone’s memory. The other 19 are acted out.",
                                ],
                              ),
                              h.div(
                                [h.Class("w-lad")],
                                [
                                  h.div(
                                    [],
                                    [
                                      h.span(
                                        [h.Class("w-depth"), h.Role("img"), h.AriaLabel("Retold three times")],
                                        [
                                          h.i([h.Class("on")]),
                                          h.i([h.Class("on")]),
                                          h.i([h.Class("on")]),
                                        ],
                                      ),
                                      h.span(
                                        [],
                                        [
                                          h.span(
                                            [h.Class("w-lad-cv")],
                                            [
                                              cover({ dialogue: "parmenides", size: "xs" }, h),
                                            ],
                                          ),
                                          h.b([], ["Retold three times"]),
                                          h.p(
                                            [],
                                            [
                                              "Cephalus repeats what Antiphon heard from Pythodorus, who was there.",
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  h.div(
                                    [],
                                    [
                                      h.span(
                                        [h.Class("w-depth"), h.Role("img"), h.AriaLabel("Retold twice")],
                                        [
                                          h.i([h.Class("on")]),
                                          h.i([h.Class("on")]),
                                          h.i([]),
                                        ],
                                      ),
                                      h.span(
                                        [],
                                        [
                                          h.span(
                                            [h.Class("w-lad-cv")],
                                            [
                                              cover({ dialogue: "symposium", size: "xs" }, h),
                                            ],
                                          ),
                                          h.b([], ["Retold twice"]),
                                          h.p(
                                            [],
                                            [
                                              "Apollodorus repeats what Aristodemus told him of Agathon’s dinner. Diotima’s teaching comes one step further in.",
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  h.div(
                                    [],
                                    [
                                      h.span(
                                        [h.Class("w-depth"), h.Role("img"), h.AriaLabel("One narrator")],
                                        [
                                          h.i([h.Class("on")]),
                                          h.i([]),
                                          h.i([]),
                                        ],
                                      ),
                                      h.span(
                                        [],
                                        [
                                          h.span(
                                            [h.Class("w-lad-cv")],
                                            [
                                              cover({ dialogue: "phaedo", size: "xs" }, h),
                                              cover({ dialogue: "republic", size: "xs" }, h),
                                              cover({ dialogue: "protagoras", size: "xs" }, h),
                                            ],
                                          ),
                                          h.b([], ["One narrator"]),
                                          h.p(
                                            [],
                                            [
                                              "Phaedo tells Echecrates of Socrates’ last day. Socrates narrates the Republic, Protagoras, Charmides, Lysis and Euthydemus.",
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  h.div(
                                    [],
                                    [
                                      h.span(
                                        [h.Class("w-depth"), h.Role("img"), h.AriaLabel("Acted out")],
                                        [
                                          h.i([]),
                                          h.i([]),
                                          h.i([]),
                                        ],
                                      ),
                                      h.span(
                                        [],
                                        [
                                          h.span(
                                            [h.Class("w-lad-cv")],
                                            [
                                              cover({ dialogue: "timaeus", size: "xs" }, h),
                                              cover({ dialogue: "crito", size: "xs" }, h),
                                              cover({ dialogue: "meno", size: "xs" }, h),
                                            ],
                                          ),
                                          h.b([], ["Acted out"]),
                                          h.p(
                                            [],
                                            [
                                              "19 dialogues, with voices still nested inside. In the Timaeus, Critias repeats his grandfather, who repeats an Egyptian priest.",
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
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

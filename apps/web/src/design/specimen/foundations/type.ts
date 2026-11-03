// Foundations: Type.
import type { Html, HtmlBuilder } from "foldkit/html";

export const typeSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Type"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Literata for titles and the page, Inter for anything you tap, and Gentium Book Plus for Greek. Nothing is set in capitals.",
        ],
      ),
      h.div(
        [h.Class("tyt A")],
        [
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Display"]), h.span([], ["Literata 600 · 33 / 36"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-title")], ["Reading now"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Title"]), h.span([], ["Literata 600 · 31 / 34"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-dtitle l")], ["Crito"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Chapter"]), h.span([], ["Literata 600 · 25 / 30"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-ch-t")], ["Before dawn: a friend’s grief"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Section"]), h.span([], ["Literata 600 · 21 / 25"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-h2")], ["The trial and death of Socrates"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Reading"]), h.span([], ["Literata 400 · 18.5 / 30"])]),
              h.span(
                [h.Class("tyr-s")],
                [
                  h.span(
                    [h.Class("ty-read")],
                    [
                      "Why have you come at this time, Crito? Or isn’t it still early?",
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Read along"]), h.span([], ["Literata 700 · 21 / 29"])]),
              h.span(
                [h.Class("tyr-s cloth"), h.Style({ "--cl": "#2F5D50" })],
                [
                  h.span([h.Class("ty-ra")], ["Then why did you not wake me at once?"]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span(
                [h.Class("tyr-n")],
                [
                  h.b([], ["Greek"]),
                  h.span([], ["Gentium Book Plus 400 · 19 / 30"]),
                ],
              ),
              h.span(
                [h.Class("tyr-s")],
                [
                  h.span(
                    [h.Class("ty-grc"), h.Lang("grc")],
                    [
                      "καὶ γὰρ ἄν, ὦ Κρίτων, πλημμελὲς εἴη ἀγανακτεῖν τηλικοῦτον ὄντα εἰ δεῖ ἤδη τελευτᾶν.",
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Heading"]), h.span([], ["Inter 600 · 18 / 22"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-h3 z")], ["What’s happening"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Body"]), h.span([], ["Inter 400 · 15 / 22"])]),
              h.span(
                [h.Class("tyr-s")],
                [
                  h.span(
                    [h.Class("ty-body")],
                    [
                      "Crito says that Socrates bears his misfortune easily and gently.",
                    ],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Label"]), h.span([], ["Inter 600 · 16 and 14.5"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("ty-label")], ["Play from here"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Caption"]), h.span([], ["Inter 400 · 13 / 18"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-meta")], ["Chapter 1 of 5 · 6 min read"])]),
            ],
          ),
          h.div(
            [h.Class("tyr")],
            [
              h.span([h.Class("tyr-n")], [h.b([], ["Speaker"]), h.span([], ["Inter 600 · 12.5"])]),
              h.span([h.Class("tyr-s")], [h.span([h.Class("a-sp z")], ["Socrates"])]),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

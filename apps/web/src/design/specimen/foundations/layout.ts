// Foundations: LayoutPhones: 20-point margins, 26 for reading. Computers: a 252-point sidebar and, only while listening, an 84-point player bar, with each page on a panel with 44-point margins and a 380-point column for the right-hand cards. Reading swaps the sidebar for chapters at 276, keeps the page to 660 (about 66 characters a line) and gives Explain 430. Proposed breakpoints: below 1,280 points Explain becomes a drawer over the page, below 1,024 the sidebar shrinks to icons, and below 760 the phone layout takes over.Chapters276Pageup to 660Explain430.
import type { Html, HtmlBuilder } from "foldkit/html";

export const layoutSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat two")],
    [
      h.div(
        [],
        [
          h.h3([h.Class("sub")], ["Layout"]),
          h.p(
            [h.Class("sub-p")],
            [
              "Phones: 20-point margins, 26 for reading. Computers: a 252-point sidebar and, only while listening, an 84-point player bar, with each page on a panel with 44-point margins and a 380-point column for the right-hand cards. Reading swaps the sidebar for chapters at 276, keeps the page to 660 (about 66 characters a line) and gives Explain 430. Proposed breakpoints: below 1,280 points Explain becomes a drawer over the page, below 1,024 the sidebar shrinks to icons, and below 760 the phone layout takes over.",
            ],
          ),
          h.div(
            [h.Class("lay")],
            [
              h.span([h.Class("lay-s")], ["Chapters", h.br([]), "276"]),
              h.span([h.Class("lay-m")], ["Page", h.br([]), "up to 660"]),
              h.span([h.Class("lay-x")], ["Explain", h.br([]), "430"]),
            ],
          ),
        ],
      ),
      h.div(
        [],
        [
          h.h3([h.Class("sub")], ["Greek and transliteration"]),
          h.p(
            [h.Class("sub-p")],
            [
              "Greek is marked ",
              h.code([], ["lang=\"grc\""]),
              " and always comes with a transliteration, generated rather than written: accents and smooth breathing dropped, iota subscript dropped, rough breathing as h, η as ē, ω as ō, υ as y except in ου, αυ and ευ, θ as th, φ as ph, χ as ch, ψ as ps, ξ as x, and γ before γ, κ, ξ or χ as n.",
            ],
          ),
          h.div(
            [h.Class("A grc-card")],
            [
              h.p(
                [h.Class("ty-grc"), h.Lang("grc")],
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
            ],
          ),
        ],
      ),
    ],
  ),
  ];

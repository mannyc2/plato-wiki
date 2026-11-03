// Foundations: ElevationThree levels, all with warm shadows.RaisedCardsFloatingMini player and tab barSheetExplain and settings.
import type { Html, HtmlBuilder } from "foldkit/html";

export const elevationSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat two")],
    [
      h.div(
        [],
        [
          h.h3([h.Class("sub")], ["Elevation"]),
          h.p([h.Class("sub-p")], ["Three levels, all with warm shadows."]),
          h.div(
            [h.Class("elv A")],
            [
              h.span([h.Class("e1")], [h.b([], ["Raised"]), "Cards"]),
              h.span([h.Class("e2")], [h.b([], ["Floating"]), "Mini player and tab bar"]),
              h.span([h.Class("e3")], [h.b([], ["Sheet"]), "Explain and settings"]),
            ],
          ),
        ],
      ),
      h.div(
        [],
        [
          h.h3([h.Class("sub")], ["Motion"]),
          h.p(
            [h.Class("sub-p")],
            [
              "Short and physical. With reduced motion, slides become fades and read-along jumps to the line instead of scrolling.",
            ],
          ),
          h.div(
            [h.Class("mot")],
            [
              h.div(
                [h.Class("mot-r")],
                [
                  h.b([], ["Press"]),
                  h.code([], ["100 ms"]),
                  h.span([], ["Scale to 97%"]),
                ],
              ),
              h.div(
                [h.Class("mot-r")],
                [
                  h.b([], ["Sheet"]),
                  h.code([], ["280 ms"]),
                  h.span([], ["Slide up, ease out"]),
                ],
              ),
              h.div(
                [h.Class("mot-r")],
                [
                  h.b([], ["Page"]),
                  h.code([], ["320 ms"]),
                  h.span([], ["Push from the right"]),
                ],
              ),
              h.div(
                [h.Class("mot-r")],
                [
                  h.b([], ["Read-along line"]),
                  h.code([], ["240 ms"]),
                  h.span([], ["Fade, then scroll to centre"]),
                ],
              ),
              h.div(
                [h.Class("mot-r")],
                [
                  h.b([], ["Reduced motion"]),
                  h.code([], ["120 ms"]),
                  h.span([], ["Fade only"]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

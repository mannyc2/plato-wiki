// Primitives: Buttons.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";

export const buttonsSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub first")], ["Buttons"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Four variants, one shape. Large buttons are 52 points tall and small ones 40, inside a 44-point touch target. Focus is a 2.5-point ink ring with a 2-point gap, on every control.",
        ],
      ),
      h.div(
        [h.Class("mxs")],
        [
          h.div(
            [h.Class("mx A")],
            [
              h.span([]),
              h.span([h.Class("mx-h")], ["Default"]),
              h.span([h.Class("mx-h")], ["Hover"]),
              h.span([h.Class("mx-h")], ["Pressed"]),
              h.span([h.Class("mx-h")], ["Focus"]),
              h.span([h.Class("mx-h")], ["Disabled"]),
              h.span([h.Class("mx-h")], ["Loading"]),
              h.span([h.Class("mx-r")], ["Filled"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn fill")], [icon("bookopen", h), "Read"])]),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn fill is-hover")], [icon("bookopen", h), "Read"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn fill is-pressed")], [icon("bookopen", h), "Read"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn fill is-focus")], [icon("bookopen", h), "Read"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn fill is-disabled")], [icon("bookopen", h), "Read"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn fill is-loading")], [h.i([h.Class("spin")]), "Loading"]),
                ],
              ),
              h.span([h.Class("mx-r")], ["Tinted"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn tint")], [icon("headphones", h), "Listen"])]),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn tint is-hover")], [icon("headphones", h), "Listen"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn tint is-pressed")], [icon("headphones", h), "Listen"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn tint is-focus")], [icon("headphones", h), "Listen"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn tint is-disabled")], [icon("headphones", h), "Listen"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn tint is-loading")], [h.i([h.Class("spin")]), "Loading"]),
                ],
              ),
              h.span([h.Class("mx-r")], ["Outlined"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn ghost")], [icon("marker", h), "Highlight"])]),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn ghost is-hover")], [icon("marker", h), "Highlight"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn ghost is-pressed")], [icon("marker", h), "Highlight"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn ghost is-focus")], [icon("marker", h), "Highlight"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn ghost is-disabled")], [icon("marker", h), "Highlight"]),
                ],
              ),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn ghost is-loading")], [h.i([h.Class("spin")]), "Loading"]),
                ],
              ),
              h.span([h.Class("mx-r")], ["Plain"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn plain")], ["See all"])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn plain is-hover")], ["See all"])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn plain is-pressed")], ["See all"])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn plain is-focus")], ["See all"])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-btn plain is-disabled")], ["See all"])]),
              h.span(
                [h.Class("mx-c")],
                [
                  h.span([h.Class("a-btn plain is-loading")], [h.i([h.Class("spin")]), "Loading"]),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("szs A")],
        [
          h.span([h.Class("a-btn fill")], [icon("bookopen", h), "Large"]),
          h.span([h.Class("a-btn fill sm")], [icon("play", h), "Small"]),
          h.span([h.Class("a-btn tint sm")], ["Small tinted"]),
          h.span([h.Class("a-btn ghost sm")], ["Small outlined"]),
        ],
      ),
    ],
  ),
  ];

// Primitives: Icon buttons.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";

export const iconButtonsSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Icon buttons"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Round and 44 points. Soft on paper, plain in toolbars, frosted on pictures. Each has a text label for screen readers.",
        ],
      ),
      h.div(
        [h.Class("mxs")],
        [
          h.div(
            [h.Class("mx four A")],
            [
              h.span([]),
              h.span([h.Class("mx-h")], ["Default"]),
              h.span([h.Class("mx-h")], ["Pressed"]),
              h.span([h.Class("mx-h")], ["Focus"]),
              h.span([h.Class("mx-h")], ["Disabled"]),
              h.span([h.Class("mx-r")], ["Soft"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib soft")], [icon("share", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib soft is-pressed")], [icon("share", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib soft is-focus")], [icon("share", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib soft is-disabled")], [icon("share", h)])]),
              h.span([h.Class("mx-r")], ["Plain"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib plain")], [icon("aa", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib plain is-pressed")], [icon("aa", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib plain is-focus")], [icon("aa", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-ib plain is-disabled")], [icon("aa", h)])]),
              h.span([h.Class("mx-r")], ["On a picture"]),
              h.span([h.Class("mx-c pic")], [h.span([h.Class("a-ib glass")], [icon("more", h)])]),
              h.span([h.Class("mx-c pic")], [h.span([h.Class("a-ib glass is-pressed")], [icon("more", h)])]),
              h.span([h.Class("mx-c pic")], [h.span([h.Class("a-ib glass is-focus")], [icon("more", h)])]),
              h.span([h.Class("mx-c pic")], [h.span([h.Class("a-ib glass is-disabled")], [icon("more", h)])]),
              h.span([h.Class("mx-r")], ["Play"]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-play sm")], [icon("play", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-play sm is-pressed")], [icon("play", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-play sm is-focus")], [icon("play", h)])]),
              h.span([h.Class("mx-c")], [h.span([h.Class("a-play sm is-disabled")], [icon("play", h)])]),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

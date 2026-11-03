// Foundations: Colour.
import type { Html, HtmlBuilder } from "foldkit/html";

export const colourSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub first")], ["Colour"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Three palettes share the same token names. Every ratio is computed from the hex values when the page is built, and the build fails if one drops below 4.5:1 for text or 3:1 for controls.",
        ],
      ),
      h.div(
        [h.Class("pal")],
        [
          h.div([h.Class("pal-h")], [h.b([], ["Paper"]), h.span([], ["The default for the whole app."])]),
          h.div(
            [h.Class("pal-g")],
            [
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#FBF8F3" })]),
                  h.span([], [h.b([], ["paper"]), h.code([], ["#FBF8F3"]), h.span([], ["Page background"])]),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#FFFFFF" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["card"]),
                      h.code([], ["#FFFFFF"]),
                      h.span([], ["Cards, sheets, floating bars"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#1F1B16" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["ink"]),
                      h.code([], ["#1F1B16"]),
                      h.span([], ["Text and the focus ring"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["16.2:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#6A6359" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["muted"]),
                      h.code([], ["#6A6359"]),
                      h.span([], ["Secondary text"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["5.6:1"])]),
                      h.span([h.Class("tok-c")], ["on guide ", h.span([h.Class("cr ok")], ["5.1:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#ECE5DA" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["line"]),
                      h.code([], ["#ECE5DA"]),
                      h.span([], ["Dividers and tracks"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#F2EDE5" })]),
                  h.span([], [h.b([], ["chip"]), h.code([], ["#F2EDE5"]), h.span([], ["Soft fills"])]),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#F3EDE3" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["guide"]),
                      h.code([], ["#F3EDE3"]),
                      h.span([], ["Chapter guide card"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#C2412D" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent"]),
                      h.code([], ["#C2412D"]),
                      h.span([], ["Filled buttons and play"]),
                      h.span([h.Class("tok-c")], ["white text ", h.span([h.Class("cr ok")], ["5.1:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#A3321F" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent-text"]),
                      h.code([], ["#A3321F"]),
                      h.span([], ["Links and tinted labels"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["6.5:1"])]),
                      h.span([h.Class("tok-c")], ["on tint ", h.span([h.Class("cr ok")], ["5.7:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#F7E6DF" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent-soft"]),
                      h.code([], ["#F7E6DF"]),
                      h.span([], ["Tinted buttons and tags"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#C2412D" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["progress"]),
                      h.code([], ["#C2412D"]),
                      h.span([], ["Progress fill"]),
                      h.span([h.Class("tok-c")], ["against track ", h.span([h.Class("cr ok")], ["4.1:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#FBE6A2" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["highlight"]),
                      h.code([], ["#FBE6A2"]),
                      h.span([], ["Your highlights"]),
                      h.span([h.Class("tok-c")], ["ink text ", h.span([h.Class("cr ok")], ["13.8:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#8E8578" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["control"]),
                      h.code([], ["#8E8578"]),
                      h.span([], ["Switch track when off"]),
                      h.span([h.Class("tok-c")], ["against card ", h.span([h.Class("cr ok")], ["3.6:1"])]),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("pal")],
        [
          h.div(
            [h.Class("pal-h")],
            [
              h.b([], ["Night"]),
              h.span([], ["Dark mode for the whole app, and a reading theme."]),
            ],
          ),
          h.div(
            [h.Class("pal-g")],
            [
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#16130F" })]),
                  h.span([], [h.b([], ["paper"]), h.code([], ["#16130F"]), h.span([], ["Page background"])]),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#1F1B16" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["card"]),
                      h.code([], ["#1F1B16"]),
                      h.span([], ["Cards, sheets, floating bars"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#ECE4D6" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["ink"]),
                      h.code([], ["#ECE4D6"]),
                      h.span([], ["Text and the focus ring"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["14.7:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#A89F91" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["muted"]),
                      h.code([], ["#A89F91"]),
                      h.span([], ["Secondary text"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["7.1:1"])]),
                      h.span([h.Class("tok-c")], ["on card ", h.span([h.Class("cr ok")], ["6.5:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#2E2923" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["line"]),
                      h.code([], ["#2E2923"]),
                      h.span([], ["Dividers and tracks"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#2A251F" })]),
                  h.span([], [h.b([], ["chip"]), h.code([], ["#2A251F"]), h.span([], ["Soft fills"])]),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#221D18" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["guide"]),
                      h.code([], ["#221D18"]),
                      h.span([], ["Chapter guide card"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#C2412D" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent"]),
                      h.code([], ["#C2412D"]),
                      h.span([], ["Filled buttons and play"]),
                      h.span([h.Class("tok-c")], ["white text ", h.span([h.Class("cr ok")], ["5.1:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#F08A73" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent-text"]),
                      h.code([], ["#F08A73"]),
                      h.span([], ["Links and tinted labels"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["7.6:1"])]),
                      h.span([h.Class("tok-c")], ["on tint ", h.span([h.Class("cr ok")], ["6.1:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#3A2019" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent-soft"]),
                      h.code([], ["#3A2019"]),
                      h.span([], ["Tinted buttons and tags"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#E0654D" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["progress"]),
                      h.code([], ["#E0654D"]),
                      h.span([], ["Progress fill"]),
                      h.span([h.Class("tok-c")], ["against track ", h.span([h.Class("cr ok")], ["4.2:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#5C4A17" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["highlight"]),
                      h.code([], ["#5C4A17"]),
                      h.span([], ["Your highlights"]),
                      h.span([h.Class("tok-c")], ["ink text ", h.span([h.Class("cr ok")], ["6.8:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#7D7366" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["control"]),
                      h.code([], ["#7D7366"]),
                      h.span([], ["Switch track when off"]),
                      h.span([h.Class("tok-c")], ["against card ", h.span([h.Class("cr ok")], ["3.7:1"])]),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class("pal")],
        [
          h.div(
            [h.Class("pal-h")],
            [
              h.b([], ["Sepia"]),
              h.span([], ["A reading theme only; the rest of the app stays Paper."]),
            ],
          ),
          h.div(
            [h.Class("pal-g")],
            [
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#F4ECD8" })]),
                  h.span([], [h.b([], ["paper"]), h.code([], ["#F4ECD8"]), h.span([], ["Page background"])]),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#3B2F22" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["ink"]),
                      h.code([], ["#3B2F22"]),
                      h.span([], ["Text"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["11.0:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#6E604D" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["muted"]),
                      h.code([], ["#6E604D"]),
                      h.span([], ["Secondary text"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["5.2:1"])]),
                      h.span([h.Class("tok-c")], ["on guide ", h.span([h.Class("cr ok")], ["4.6:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#E3D6BC" })]),
                  h.span([], [h.b([], ["line"]), h.code([], ["#E3D6BC"]), h.span([], ["Dividers"])]),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#EADFC6" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["guide"]),
                      h.code([], ["#EADFC6"]),
                      h.span([], ["Chapter guide card"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#9A2F1C" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["accent-text"]),
                      h.code([], ["#9A2F1C"]),
                      h.span([], ["Links and More"]),
                      h.span([h.Class("tok-c")], ["on paper ", h.span([h.Class("cr ok")], ["6.4:1"])]),
                      h.span([h.Class("tok-c")], ["on guide ", h.span([h.Class("cr ok")], ["5.7:1"])]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("tok")],
                [
                  h.i([h.Style({ background: "#F2D27A" })]),
                  h.span(
                    [],
                    [
                      h.b([], ["highlight"]),
                      h.code([], ["#F2D27A"]),
                      h.span([], ["Your highlights"]),
                      h.span([h.Class("tok-c")], ["ink text ", h.span([h.Class("cr ok")], ["8.8:1"])]),
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

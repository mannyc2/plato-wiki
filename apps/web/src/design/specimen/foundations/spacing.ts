// Foundations: SpacingA 4-point scale.4Icon to label8Inside chips, between chips12Between related items16Card padding20Page margin24Between groups32Between sections44Desktop page margins48Between desktop columns.
import type { Html, HtmlBuilder } from "foldkit/html";

export const spacingSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat two")],
    [
      h.div(
        [],
        [
          h.h3([h.Class("sub")], ["Spacing"]),
          h.p([h.Class("sub-p")], ["A 4-point scale."]),
          h.div(
            [h.Class("spc")],
            [
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["4"]),
                  h.i([h.Style({ width: "16px" })]),
                  h.span([], ["Icon to label"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["8"]),
                  h.i([h.Style({ width: "32px" })]),
                  h.span([], ["Inside chips, between chips"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["12"]),
                  h.i([h.Style({ width: "48px" })]),
                  h.span([], ["Between related items"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["16"]),
                  h.i([h.Style({ width: "64px" })]),
                  h.span([], ["Card padding"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["20"]),
                  h.i([h.Style({ width: "80px" })]),
                  h.span([], ["Page margin"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["24"]),
                  h.i([h.Style({ width: "96px" })]),
                  h.span([], ["Between groups"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["32"]),
                  h.i([h.Style({ width: "128px" })]),
                  h.span([], ["Between sections"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["44"]),
                  h.i([h.Style({ width: "176px" })]),
                  h.span([], ["Desktop page margins"]),
                ],
              ),
              h.div(
                [h.Class("spc-r")],
                [
                  h.code([], ["48"]),
                  h.i([h.Style({ width: "192px" })]),
                  h.span([], ["Between desktop columns"]),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [],
        [
          h.h3([h.Class("sub")], ["Radius"]),
          h.p([h.Class("sub-p")], ["Everything you press is round."]),
          h.div(
            [h.Class("rad")],
            [
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-pill")]),
                  h.span(
                    [],
                    [
                      h.b([], ["Pill"]),
                      h.code([], ["999"]),
                      h.span([], ["Buttons, chips, tab bar, mini player"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-circle")]),
                  h.span(
                    [],
                    [
                      h.b([], ["Circle"]),
                      h.code([], ["50%"]),
                      h.span([], ["Icon buttons, avatars, play"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-sheet")]),
                  h.span([], [h.b([], ["Sheet"]), h.code([], ["30"]), h.span([], ["Sheet tops"])]),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-card")]),
                  h.span(
                    [],
                    [
                      h.b([], ["Card"]),
                      h.code([], ["24"]),
                      h.span([], ["Continue card, Explain card"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-tile")]),
                  h.span([], [h.b([], ["Tile"]), h.code([], ["22"]), h.span([], ["Idea tiles, theme tiles"])]),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-guide")]),
                  h.span(
                    [],
                    [
                      h.b([], ["Guide"]),
                      h.code([], ["20"]),
                      h.span([], ["Guide card, grouped notes"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-small")]),
                  h.span([], [h.b([], ["Small"]), h.code([], ["12"]), h.span([], ["Rows that highlight"])]),
                ],
              ),
              h.div(
                [h.Class("rad-r")],
                [
                  h.i([h.Class("rad-cover")]),
                  h.span(
                    [],
                    [
                      h.b([], ["Cover"]),
                      h.code([], ["3 and 7"]),
                      h.span([], ["Spine and fore-edge"]),
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

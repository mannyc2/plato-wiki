// Foundations: Cloth colours.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";

export const clothSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Cloth colours"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Each dialogue has one fixed cloth colour. Covers use it as it is. The player and read-along darken it by 40% behind text, keep a lighter glow behind the cover only, and set text in the cover ink at four strengths.",
        ],
      ),
      h.div(
        [h.Class("cl-g A")],
        [
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#2F5D50", "--g": "#295246", "--d": "#1C3830" })],
                [
                  cover({ dialogue: "crito", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Crito"]),
                  h.code([], ["#2F5D50"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.4:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.4:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#7A2B2B", "--g": "#6B2626", "--d": "#491A1A" })],
                [
                  cover({ dialogue: "apology", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Apology"]),
                  h.code([], ["#7A2B2B"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["7.0:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.8:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#8A5E1C", "--g": "#795319", "--d": "#533811" })],
                [
                  cover({ dialogue: "euthyphro", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Euthyphro"]),
                  h.code([], ["#8A5E1C"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["5.6:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["4.8:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#23304A", "--g": "#1F2A41", "--d": "#151D2C" })],
                [
                  cover({ dialogue: "phaedo", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Phaedo"]),
                  h.code([], ["#23304A"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["7.9:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["6.5:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#3A4F7A", "--g": "#33466B", "--d": "#232F49" })],
                [
                  cover({ dialogue: "meno", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Meno"]),
                  h.code([], ["#3A4F7A"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.6:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.6:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#1F5E6B", "--g": "#1B535E", "--d": "#133840" })],
                [
                  cover({ dialogue: "ion", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Ion"]),
                  h.code([], ["#1F5E6B"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.3:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.3:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#873A53", "--g": "#773349", "--d": "#512332" })],
                [
                  cover({ dialogue: "symposium", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Symposium"]),
                  h.code([], ["#873A53"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.4:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.4:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#2B2B2B", "--g": "#262626", "--d": "#1A1A1A" })],
                [
                  cover({ dialogue: "republic", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Republic"]),
                  h.code([], ["#2B2B2B"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["8.1:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["6.7:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#3E3A6E", "--g": "#373361", "--d": "#252342" })],
                [
                  cover({ dialogue: "gorgias", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Gorgias"]),
                  h.code([], ["#3E3A6E"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["7.3:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["6.0:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#5B3A29", "--g": "#503324", "--d": "#372319" })],
                [
                  cover({ dialogue: "laches", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Laches"]),
                  h.code([], ["#5B3A29"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["7.2:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["6.0:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#3B4A2F", "--g": "#344129", "--d": "#232C1C" })],
                [
                  cover({ dialogue: "laws", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Laws"]),
                  h.code([], ["#3B4A2F"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["7.1:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.9:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#1E3F5A", "--g": "#1A374F", "--d": "#122636" })],
                [
                  cover({ dialogue: "timaeus", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Timaeus"]),
                  h.code([], ["#1E3F5A"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["7.4:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["6.2:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#45604F", "--g": "#3D5446", "--d": "#293A2F" })],
                [
                  cover({ dialogue: "theaetetus", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Theaetetus"]),
                  h.code([], ["#45604F"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.1:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.2:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#8C4A2B", "--g": "#7B4126", "--d": "#542C1A" })],
                [
                  cover({ dialogue: "protagoras", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Protagoras"]),
                  h.code([], ["#8C4A2B"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.1:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.1:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#7B6A3A", "--g": "#6C5D33", "--d": "#4A4023" })],
                [
                  cover({ dialogue: "phaedrus", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Phaedrus"]),
                  h.code([], ["#7B6A3A"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["5.4:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["4.6:1"])]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class("cl")],
            [
              h.span(
                [h.Class("cl-sw"), h.Style({ "--c": "#50466E", "--g": "#463E61", "--d": "#302A42" })],
                [
                  cover({ dialogue: "statesman", size: "xs" }, h),
                  h.b([], ["Aa"]),
                ],
              ),
              h.span(
                [h.Class("cl-b")],
                [
                  h.b([], ["Statesman"]),
                  h.code([], ["#50466E"]),
                  h.span([], ["Secondary ", h.span([h.Class("cr ok")], ["6.8:1"])]),
                  h.span([], ["Coming up ", h.span([h.Class("cr ok")], ["5.7:1"])]),
                ],
              ),
            ],
          ),
        ],
      ),
      h.p(
        [h.Class("sub-p fine")],
        [
          "Across all 27 cloth colours the lowest ratios are 5.4:1 for cover ink on the glow, 5.4:1 for secondary text, 4.6:1 for read-along lines still to come, and 3.2:1 for lines already read, which are large bold text. Page heads on dialogue and person pages sit on a band of that colour mixed with 82% paper; over every band the lowest ratios are 5.5:1 for secondary text and 4.6:1 for links.",
        ],
      ),
    ],
  ),
  ];

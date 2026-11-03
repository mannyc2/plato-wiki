// Foundations: Ideas.
import type { Html, HtmlBuilder } from "foldkit/html";
import { ideaChecks, rounded } from "../../contrast";
import { HUES, IDEA_KEYS, IDEAS, ideaBadge } from "../../ideas";

export const ideasSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["Ideas"]),
      h.p(
        [h.Class("sub-p")],
        [
          "Each idea has an emblem drawn in code on a 40-unit grid: one ink line on a light plate, in one of six hues. An emblem draws the shape of the move rather than its subject: a road to a star for following the argument wherever it leads, a forked path for a forced choice. The ratio is the ink on its plate; a graphic needs 3:1.",
        ],
      ),
      h.div(
        [h.Class("idg A")],
        IDEA_KEYS.map((key) => {
          const { name, hue } = IDEAS[key];
          const ink = ideaChecks(HUES[hue])[0]?.ratio ?? 0;
          return h.span(
            [h.Class("ids")],
            [ideaBadge({ idea: key, size: "md" }, h), h.b([], [name]), h.span([h.Class("cr ok")], [`${rounded(ink).toFixed(1)}:1`])],
          );
        }),
      ),
    ],
  ),
];

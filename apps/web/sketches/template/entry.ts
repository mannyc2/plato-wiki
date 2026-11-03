// A new sketch: one phone screen drawn with the kit. Replace the screen with the idea under review;
// the kit's tokens, components, covers and icons are already loaded.
import { Schema } from "effect";
import { Runtime } from "foldkit";
import type { Document, HtmlBuilder } from "foldkit/html";
import { defineMessageUnion } from "foldkit/message";
import { cover } from "../../src/design/covers";
import { icon, iconSprite } from "../../src/design/icons";
import { phone } from "../../src/design/specimen/frames";

const Model = Schema.Struct({});
type Model = typeof Model.Type;

const Message = defineMessageUnion({ ClickedRead: {} });
type Message = typeof Message.Type;

const view = (_model: Model, h: HtmlBuilder<Message>): Document => ({
  title: "Sketch",
  body: h.div(
    [h.Class("wrap panel")],
    [
      iconSprite(h),
      h.div(
        [h.Class("stage stage-a")],
        [
          h.div(
            [h.Class("shots")],
            [
              phone(
                { caption: { title: "Sketch", text: "What this screen is for, in a sentence." } },
                [
                  h.div(
                    [h.Class("a-page")],
                    [
                      h.div([h.Class("a-head")], [h.h1([h.Class("a-title")], ["Crito"])]),
                      cover({ dialogue: "crito", size: "lg" }, h),
                      h.span([h.Class("a-btn fill")], [icon("bookopen", h), "Read"]),
                    ],
                  ),
                ],
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  ),
});

Runtime.run(
  Runtime.makeApplication({
    Model,
    init: () => ({ model: {} }),
    update: (model: Model) => ({ model }),
    view,
    container: document.getElementById("root"),
  }),
);

// Phone screens: Loading, errors and empty.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";
import { phone } from "../frames";

export const statesScreens = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  phone(
    { caption: { title: "Loading", text: "Placeholders in the page’s own shapes, not a spinner." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div(
            [h.Class("a-topbar")],
            [
              h.span([h.Class("a-ib soft")], [icon("chev-l", h)]),
              h.span([h.Class("grow")]),
            ],
          ),
          h.div([h.Class("sk-c")], [h.span([h.Class("sk cv")])]),
          " ",
          h.span([h.Class("sk ln c w40 h28")]),
          h.span([h.Class("sk ln c w20")]),
          " ",
          h.div([h.Class("sk-r")], [h.span([h.Class("sk pill")]), h.span([h.Class("sk pill")])]),
          " ",
          h.span([h.Class("sk ln w30 h18 mt")]),
          h.span([h.Class("sk ln w90")]),
          h.span([h.Class("sk ln w75")]),
          h.span([h.Class("sk ln w85")]),
          h.span([h.Class("sk ln w60")]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Error", text: "Says what failed and what to do, and that nothing was lost." } },
    [
      h.div(
        [h.Class("a-rtop")],
        [
          h.span([h.Class("a-ib plain")], [icon("chev-l", h)]),
          h.b([], ["Crito"]),
          h.span([h.Class("a-ib plain")], [icon("list", h)]),
          h.span([h.Class("a-ib plain")], [icon("aa", h)]),
          h.span([h.Class("a-ib plain")], [icon("headphones", h)]),
        ],
      ),
      h.div(
        [h.Class("st")],
        [
          h.span([h.Class("st-ic")], [icon("alert", h)]),
          " ",
          h.h2([h.Class("st-t")], ["This chapter didn’t load"]),
          h.p([], ["Check your connection and try again. Your place is saved."]),
          " ",
          h.span([h.Class("a-btn fill")], [icon("refresh", h), "Try again"]),
        ],
      ),
    ],
    h,
  ),
  phone(
    { caption: { title: "Empty", text: "One sentence and one way forward." } },
    [
      h.div(
        [h.Class("a-page")],
        [
          h.div([h.Class("a-head")], [h.h1([h.Class("a-title")], ["Library"])]),
          h.div(
            [h.Class("st in")],
            [
              h.span([h.Class("st-books")], [h.i([]), h.i([]), h.i([])]),
              " ",
              h.h2([h.Class("st-t")], ["Nothing here yet"]),
              h.p([], ["Dialogues you start reading or listening to will appear here."]),
              " ",
              h.span([h.Class("a-btn tint")], ["Browse dialogues"]),
            ],
          ),
        ],
      ),
      h.nav(
        [h.Class("tb")],
        [
          h.span(
            [h.Class("tb-pill")],
            [
              h.span([h.Class("")], [icon("home", h), h.b([], ["Home"])]),
              h.span([h.Class("on")], [icon("books", h), h.b([], ["Library"])]),
              h.span([h.Class("")], [icon("compass", h), h.b([], ["Explore"])]),
            ],
          ),
          h.span([h.Class("tb-search")], [icon("search", h)]),
        ],
      ),
    ],
    h,
  ),
  ];

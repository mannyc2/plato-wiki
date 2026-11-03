// The app's one line icon set: a 24-point grid, 1.9-point strokes, round caps and joins. Every icon
// is decorative; the control that holds it carries the text or label (design plan, Foundations).
// A page draws the set once with `iconSprite` and each icon refers to it by name, so a screen with
// hundreds of icons ships each path once.
import type { Html, HtmlBuilder } from "foldkit/html";

type Draw = <Message>(h: HtmlBuilder<Message>) => ReadonlyArray<Html>;

const ICONS = {
  home: (h) => [
    h.path([h.D("M3.5 10.5 12 3.5l8.5 7")]),
    h.path([h.D("M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9")]),
  ],
  books: (h) => [
    h.rect([h.X("3.5"), h.Y("4"), h.Width("4.5"), h.Height("16"), h.Rx("1.2")]),
    h.rect([h.X("9.5"), h.Y("4"), h.Width("4.5"), h.Height("16"), h.Rx("1.2")]),
    h.path([h.D("m15.9 5.3 3.9-1 3 14.6-3.9 1z")]),
  ],
  compass: (h) => [h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]), h.path([h.D("m15.5 8.5-2 5-5 2 2-5z")])],
  search: (h) => [h.circle([h.Cx("11"), h.Cy("11"), h.R("7")]), h.path([h.D("m20.5 20.5-4.2-4.2")])],
  play: (h) => [
    h.path([h.D("M7.5 5.2v13.6a1 1 0 0 0 1.5.86l11.2-6.8a1 1 0 0 0 0-1.72L9 4.34a1 1 0 0 0-1.5.86z"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  pause: (h) => [
    h.rect([h.X("6"), h.Y("4.5"), h.Width("4.4"), h.Height("15"), h.Rx("1.3"), h.Fill("currentColor"), h.Stroke("none")]),
    h.rect([h.X("13.6"), h.Y("4.5"), h.Width("4.4"), h.Height("15"), h.Rx("1.3"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  back15: (h) => [
    h.path([h.D("M5.2 13.5A7.5 7.5 0 1 0 7.6 6.3")]),
    h.path([h.D("M4.5 3.5v4.4h4.4")]),
    h.text(
      [h.X("12.6"), h.Y("15.6"), h.FontSize("7.4"), h.FontWeight("700"), h.TextAnchor("middle"), h.Fill("currentColor"), h.Stroke("none"), h.FontFamily("Inter, system-ui, sans-serif")],
      [
        "15",
      ],
    ),
  ],
  fwd30: (h) => [
    h.path([h.D("M18.8 13.5a7.5 7.5 0 1 1-2.4-7.2")]),
    h.path([h.D("M19.5 3.5v4.4h-4.4")]),
    h.text(
      [h.X("11.4"), h.Y("15.6"), h.FontSize("7.4"), h.FontWeight("700"), h.TextAnchor("middle"), h.Fill("currentColor"), h.Stroke("none"), h.FontFamily("Inter, system-ui, sans-serif")],
      [
        "30",
      ],
    ),
  ],
  prev: (h) => [
    h.path([h.D("M6 5.5v13")]),
    h.path([h.D("M18.5 6.2v11.6a.8.8 0 0 1-1.25.66L9.2 12.66a.8.8 0 0 1 0-1.32l8.05-5.8a.8.8 0 0 1 1.25.66z"), h.Fill("currentColor")]),
  ],
  next: (h) => [
    h.path([h.D("M18 5.5v13")]),
    h.path([h.D("M5.5 6.2v11.6a.8.8 0 0 0 1.25.66l8.05-5.8a.8.8 0 0 0 0-1.32L6.75 5.54a.8.8 0 0 0-1.25.66z"), h.Fill("currentColor")]),
  ],
  "chev-l": (h) => [h.path([h.D("m14.5 5-7 7 7 7")])],
  "chev-r": (h) => [h.path([h.D("m9.5 5 7 7-7 7")])],
  "chev-d": (h) => [h.path([h.D("m5 9.5 7 7 7-7")])],
  more: (h) => [
    h.circle([h.Cx("5.5"), h.Cy("12"), h.R("1.7"), h.Fill("currentColor"), h.Stroke("none")]),
    h.circle([h.Cx("12"), h.Cy("12"), h.R("1.7"), h.Fill("currentColor"), h.Stroke("none")]),
    h.circle([h.Cx("18.5"), h.Cy("12"), h.R("1.7"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  headphones: (h) => [
    h.path([h.D("M4 15.5V12a8 8 0 0 1 16 0v3.5")]),
    h.rect([h.X("3"), h.Y("14"), h.Width("5"), h.Height("7"), h.Rx("2")]),
    h.rect([h.X("16"), h.Y("14"), h.Width("5"), h.Height("7"), h.Rx("2")]),
  ],
  aa: (h) => [
    h.text(
      [h.X("12"), h.Y("16.8"), h.FontSize("13"), h.FontWeight("600"), h.TextAnchor("middle"), h.Fill("currentColor"), h.Stroke("none"), h.FontFamily("Georgia, serif")],
      [
        "Aa",
      ],
    ),
  ],
  bookmark: (h) => [h.path([h.D("M6.5 3.5h11v17l-5.5-4-5.5 4z")])],
  marker: (h) => [h.path([h.D("m14.8 4.2 5 5-8.6 8.6-5.3.3.3-5.3z")]), h.path([h.D("M3.5 20.5h17")])],
  share: (h) => [
    h.path([h.D("M12 3.5v11")]),
    h.path([h.D("m7.8 7.5 4.2-4.2 4.2 4.2")]),
    h.path([h.D("M5.5 11.5v7.2a1.8 1.8 0 0 0 1.8 1.8h9.4a1.8 1.8 0 0 0 1.8-1.8v-7.2")]),
  ],
  copy: (h) => [
    h.rect([h.X("8.5"), h.Y("8.5"), h.Width("11.5"), h.Height("11.5"), h.Rx("2.4")]),
    h.path([h.D("M15.5 8.5V6.4A2.4 2.4 0 0 0 13.1 4H6.4A2.4 2.4 0 0 0 4 6.4v6.7a2.4 2.4 0 0 0 2.4 2.4h2.1")]),
  ],
  list: (h) => [
    h.path([h.D("M9 6.5h11M9 12h11M9 17.5h11")]),
    h.circle([h.Cx("4.6"), h.Cy("6.5"), h.R("1.2"), h.Fill("currentColor"), h.Stroke("none")]),
    h.circle([h.Cx("4.6"), h.Cy("12"), h.R("1.2"), h.Fill("currentColor"), h.Stroke("none")]),
    h.circle([h.Cx("4.6"), h.Cy("17.5"), h.R("1.2"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  moon: (h) => [h.path([h.D("M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z")])],
  plus: (h) => [h.path([h.D("M12 5v14M5 12h14")])],
  "plus-c": (h) => [h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]), h.path([h.D("M12 8v8M8 12h8")])],
  download: (h) => [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]),
    h.path([h.D("M12 7.5v8.2")]),
    h.path([h.D("m8.6 12.6 3.4 3.4 3.4-3.4")]),
  ],
  check: (h) => [h.path([h.D("m5 12.5 4.5 4.5L19 7.5")])],
  "check-c": (h) => [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("9"), h.Fill("currentColor"), h.Stroke("none")]),
    h.path([h.D("m8 12.3 2.7 2.7L16.2 9.5"), h.Stroke("var(--on-check, #fff)")]),
  ],
  sparkle: (h) => [
    h.path([h.D("M12 3.5c.7 4.1 2.7 6.1 6.8 6.8-4.1.7-6.1 2.7-6.8 6.8-.7-4.1-2.7-6.1-6.8-6.8 4.1-.7 6.1-2.7 6.8-6.8z"), h.Fill("currentColor"), h.StrokeLinejoin("round")]),
    h.path([h.D("M18.6 15.4c.25 1.5 1 2.25 2.4 2.5-1.4.25-2.15 1-2.4 2.5-.25-1.5-1-2.25-2.4-2.5 1.4-.25 2.15-1 2.4-2.5z"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  people: (h) => [
    h.circle([h.Cx("9"), h.Cy("8.5"), h.R("3.5")]),
    h.path([h.D("M2.8 20a6.2 6.2 0 0 1 12.4 0")]),
    h.path([h.D("M15.8 5.1a3.5 3.5 0 0 1 0 6.8")]),
    h.path([h.D("M17.6 14.6a6.2 6.2 0 0 1 3.6 5.4")]),
  ],
  chat: (h) => [
    h.path([h.D("M20.5 11.6c0 4.4-3.8 7.9-8.5 7.9-1.2 0-2.3-.2-3.3-.6L4 20.2l1.3-3.8A7.6 7.6 0 0 1 3.5 11.6C3.5 7.2 7.3 3.7 12 3.7s8.5 3.5 8.5 7.9z")]),
  ],
  info: (h) => [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]),
    h.path([h.D("M12 11v5.5")]),
    h.circle([h.Cx("12"), h.Cy("7.9"), h.R("1.1"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  x: (h) => [h.path([h.D("M6.5 6.5l11 11M17.5 6.5l-11 11")])],
  globe: (h) => [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]),
    h.path([h.D("M3 12h18")]),
    h.path([h.D("M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z")]),
  ],
  wave: (h) => [h.path([h.D("M4 10.5v3M8 7.5v9M12 4.5v15M16 8.5v7M20 10.5v3")])],
  eq: (h) => [
    h.rect([h.X("4.5"), h.Y("9"), h.Width("3.2"), h.Height("11"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
    h.rect([h.X("10.4"), h.Y("4"), h.Width("3.2"), h.Height("16"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
    h.rect([h.X("16.3"), h.Y("12"), h.Width("3.2"), h.Height("8"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  bookopen: (h) => [
    h.path([h.D("M12 6.8C10 5.3 7.6 4.7 3.5 4.7v13.6c4.1 0 6.5.6 8.5 2.1 2-1.5 4.4-2.1 8.5-2.1V4.7c-4.1 0-6.5.6-8.5 2.1z")]),
    h.path([h.D("M12 6.8v13.4")]),
  ],
  bulb: (h) => [
    h.path([h.D("M9.2 18h5.6M10.2 21h3.6")]),
    h.path([h.D("M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V15h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z")]),
  ],
  clock: (h) => [h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]), h.path([h.D("M12 7v5l3.2 2")])],
  user: (h) => [h.circle([h.Cx("12"), h.Cy("8.2"), h.R("4")]), h.path([h.D("M4.5 20.5a7.5 7.5 0 0 1 15 0")])],
  heart: (h) => [
    h.path([h.D("M12 20s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z")]),
  ],
  cast: (h) => [
    h.path([h.D("M3.5 17.5a3 3 0 0 1 3 3M3.5 13.5a7 7 0 0 1 7 7")]),
    h.path([h.D("M3.5 9.5V6.3a1.8 1.8 0 0 1 1.8-1.8h13.4a1.8 1.8 0 0 1 1.8 1.8v11.4a1.8 1.8 0 0 1-1.8 1.8H14")]),
    h.circle([h.Cx("3.6"), h.Cy("20.4"), h.R(".9"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  speaker: (h) => [
    h.path([h.D("M4 9.5h3.5L12 5.5v13l-4.5-4H4z")]),
    h.path([h.D("M15.5 9a4 4 0 0 1 0 6M18.2 6.5a7.5 7.5 0 0 1 0 11")]),
  ],
  sidebar: (h) => [
    h.rect([h.X("3.5"), h.Y("4.5"), h.Width("17"), h.Height("15"), h.Rx("2.5")]),
    h.path([h.D("M9.5 4.5v15")]),
  ],
  edit: (h) => [h.path([h.D("M4 20h4L19.5 8.5l-4-4L4 16z")])],
  signal: (h) => [
    h.rect([h.X("1"), h.Y("14"), h.Width("3.6"), h.Height("6"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
    h.rect([h.X("6.6"), h.Y("10.5"), h.Width("3.6"), h.Height("9.5"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
    h.rect([h.X("12.2"), h.Y("7"), h.Width("3.6"), h.Height("13"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
    h.rect([h.X("17.8"), h.Y("3.5"), h.Width("3.6"), h.Height("16.5"), h.Rx("1"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  wifi: (h) => [
    h.path([h.D("M2.5 9.2a14 14 0 0 1 19 0"), h.StrokeWidth("2.6")]),
    h.path([h.D("M6 12.9a9 9 0 0 1 12 0"), h.StrokeWidth("2.6")]),
    h.path([h.D("M12 19.3 9.3 16.4a3.8 3.8 0 0 1 5.4 0z"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  battery: (h) => [
    h.rect([h.X("1.5"), h.Y("6"), h.Width("19"), h.Height("12"), h.Rx("3.6"), h.StrokeWidth("1.4"), h.Opacity(".45")]),
    h.rect([h.X("3.4"), h.Y("7.9"), h.Width("15.2"), h.Height("8.2"), h.Rx("2.1"), h.Fill("currentColor"), h.Stroke("none")]),
    h.path([h.D("M22.4 10.4v3.2"), h.StrokeWidth("1.6"), h.Opacity(".5")]),
  ],
  alert: (h) => [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("9")]),
    h.path([h.D("M12 7.5v5.5")]),
    h.circle([h.Cx("12"), h.Cy("16.4"), h.R("1.1"), h.Fill("currentColor"), h.Stroke("none")]),
  ],
  refresh: (h) => [h.path([h.D("M19.5 12a7.5 7.5 0 1 1-2.2-5.3")]), h.path([h.D("M19.5 4.5v4.6h-4.6")])],
  sun: (h) => [
    h.circle([h.Cx("12"), h.Cy("12"), h.R("4")]),
    h.path([h.D("M12 2.8v2.2M12 19v2.2M2.8 12h2.2M19 12h2.2M5.5 5.5 7 7M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5")]),
  ],
  minus: (h) => [h.path([h.D("M5 12h14")])],
  sliders: (h) => [
    h.path([h.D("M4 7h9M17 7h3M4 17h3M11 17h9")]),
    h.circle([h.Cx("15"), h.Cy("7"), h.R("2.2")]),
    h.circle([h.Cx("9"), h.Cy("17"), h.R("2.2")]),
  ],
  grid: (h) => [
    h.rect([h.X("4"), h.Y("4"), h.Width("6.5"), h.Height("6.5"), h.Rx("1.6")]),
    h.rect([h.X("13.5"), h.Y("4"), h.Width("6.5"), h.Height("6.5"), h.Rx("1.6")]),
    h.rect([h.X("4"), h.Y("13.5"), h.Width("6.5"), h.Height("6.5"), h.Rx("1.6")]),
    h.rect([h.X("13.5"), h.Y("13.5"), h.Width("6.5"), h.Height("6.5"), h.Rx("1.6")]),
  ],
  expand: (h) => [
    h.path([h.D("M14.5 4.5h5v5")]),
    h.path([h.D("m19.5 4.5-6 6")]),
    h.path([h.D("M9.5 19.5h-5v-5")]),
    h.path([h.D("m4.5 19.5 6-6")]),
  ],
  align: (h) => [h.path([h.D("M4 6h16M4 10.5h11M4 15h16M4 19.5h9")])],
  "chev-u": (h) => [h.path([h.D("m5 14.5 7-7 7 7")])],
  timer: (h) => [
    h.circle([h.Cx("12"), h.Cy("13.5"), h.R("7.5")]),
    h.path([h.D("M12 9.6v4.1l2.6 1.6")]),
    h.path([h.D("M9.6 2.8h4.8")]),
    h.path([h.D("m18.3 6.9 1.5-1.5")]),
  ],
  layers: (h) => [
    h.rect([h.X("3"), h.Y("3.5"), h.Width("18"), h.Height("17"), h.Rx("3.2")]),
    h.rect([h.X("6.8"), h.Y("7.5"), h.Width("10.4"), h.Height("9"), h.Rx("2")]),
    h.path([h.D("M10 12h4")]),
  ],
} satisfies Record<string, Draw>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as ReadonlyArray<IconName>;

export const icon = <Message>(name: IconName, h: HtmlBuilder<Message>, className?: string): Html =>
  h.svg([h.Class(className ? `i ${className}` : "i"), h.AriaHidden(true)], [h.use([h.Attribute("href", `#i-${name}`)])]);

export const iconSprite = <Message>(h: HtmlBuilder<Message>): Html =>
  h.svg(
    [h.Width("0"), h.Height("0"), h.Style({ position: "absolute" }), h.AriaHidden(true)],
    [
      h.defs(
        [],
        ICON_NAMES.map((name) =>
          h.symbol(
            [
              h.Id(`i-${name}`),
              h.ViewBox("0 0 24 24"),
              h.Fill("none"),
              h.Stroke("currentColor"),
              h.StrokeWidth("1.9"),
              h.StrokeLinecap("round"),
              h.StrokeLinejoin("round"),
            ],
            ICONS[name](h),
          ),
        ),
      ),
    ],
  );

// The Bookshelf Design System page: review notes, then five tabs of specimens drawn with the kit.
// Desktop frames are drawn at 1440 and scaled to fit their stage. On a phone that makes a
// thumbnail, so each frame also offers its full size, which scrolls sideways.
import { Effect, Option, Queue, Schema, Stream } from "effect";
import { Command, Dom, Mount, Runtime, Update } from "foldkit";
import type { Document, Html, HtmlBuilder } from "foldkit/html";
import { defineMessageUnion } from "foldkit/message";
import { icon, iconSprite } from "../icons";
import { booksSection } from "./components/books";
import { desktopSection } from "./components/desktop";
import { listeningSection } from "./components/listening";
import { pagesSection } from "./components/pages";
import { readingSection } from "./components/reading";
import { clothSection } from "./foundations/cloth";
import { colourSection } from "./foundations/colour";
import { elevationSection } from "./foundations/elevation";
import { layoutSection } from "./foundations/layout";
import { ideasSection } from "./foundations/ideas";
import { peopleSection } from "./foundations/people";
import { spacingSection } from "./foundations/spacing";
import { typeSection } from "./foundations/type";
import type { Child } from "../html";
import { caption, clothStyle, type Frame, screenClass } from "./frames";
import { buttonsSection } from "./primitives/buttons";
import { controlsSection } from "./primitives/controls";
import { iconButtonsSection } from "./primitives/icon-buttons";
import { iconsSection } from "./primitives/icons";
import { reviewNotes } from "./review";
import { dialogueScreens } from "./screens/dialogue";
import { discoverScreens } from "./screens/discover";
import { listeningScreens } from "./screens/listening";
import { readingScreens } from "./screens/reading";
import { phoneResearch } from "./screens/research";
import { statesScreens } from "./screens/states";
import { dialogueFrame } from "./web/dialogue";
import { exploreFrame } from "./web/explore";
import { homeListeningFrame } from "./web/home-listening";
import { homeReadingFrame } from "./web/home-reading";
import { ideaFrame } from "./web/idea";
import { libraryFrame } from "./web/library";
import { nightFrame } from "./web/night";
import { nowPlayingFrame } from "./web/now-playing";
import { personFrame } from "./web/person";
import { readingExplainFrame } from "./web/reading-explain";
import { webResearch } from "./web/research";
import { searchFrame } from "./web/search";

const TABS = ["screens", "web", "components", "primitives", "foundations"] as const;
const Tab = Schema.Literals(TABS);
type Tab = typeof Tab.Type;
const TAB_LABELS: Record<Tab, string> = {
  screens: "Screens",
  web: "Web",
  components: "Components",
  primitives: "Primitives",
  foundations: "Foundations",
};

// Frames are drawn at this width; a stage narrower than 80% of it is a thumbnail on a phone.
const FRAME_WIDTH = 1440;
const THUMBNAIL_ZOOM = 0.8;

export const Model = Schema.Struct({
  tab: Tab,
  // The width of a desktop frame's stage, or 0 before the Web tab is first laid out.
  stageWidth: Schema.Number,
  fullSize: Schema.Array(Schema.String),
});
export type Model = typeof Model.Type;

export const Flags = Schema.Struct({ hash: Schema.String });
export type Flags = typeof Flags.Type;

export const Message = defineMessageUnion({
  ClickedTab: { tab: Tab },
  PressedTabArrow: { tab: Tab },
  ClickedFullSize: { frame: Schema.String },
  MeasuredStage: { width: Schema.Number },
  CompletedFocusTab: {},
  CompletedScrollToPanel: {},
});
export type Message = typeof Message.Type;
type UpdateReturn = Update.Return<Model, Message>;

const FocusTab = Command.define("FocusTab", {
  args: { tab: Tab },
  messages: [Message.CompletedFocusTab],
  execute: ({ tab }) => Dom.focus(`#tab-${tab}`).pipe(Effect.ignore, Effect.as(Message.CompletedFocusTab())),
});

// A new tab starts at the top of its panel, just under the sticky tabs, when the page has been
// scrolled past them; otherwise the reader lands partway down the new panel.
const ScrollToPanel = Command.define("ScrollToPanel", {
  messages: [Message.CompletedScrollToPanel],
  execute: Effect.sync(() => {
    const header = document.querySelector(".hero");
    if (header) {
      const top = header.getBoundingClientRect().bottom + window.scrollY;
      if (window.scrollY > top) window.scrollTo({ top });
    }
    return Message.CompletedScrollToPanel();
  }),
});

// Every stage on the Web tab has the same width, so each reports it and the latest one wins.
// A hidden tab reports 0, which keeps the last width it had.
const ObserveStage = Mount.defineStream("ObserveStage", {
  messages: [Message.MeasuredStage],
  execute: ({ element }) =>
    Stream.callback<typeof Message.MeasuredStage.Type>((queue) =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const observer = new ResizeObserver(() => {
              Queue.offerUnsafe(queue, Message.MeasuredStage({ width: element.clientWidth }));
            });
            observer.observe(element);
            return observer;
          }),
          (observer) => Effect.sync(() => observer.disconnect()),
        );
        return yield* Effect.never;
      }),
    ),
});

const isTab = (value: string): value is Tab => TABS.some((tab) => tab === value);

export const init = ({ hash }: Flags): UpdateReturn => ({
  model: { tab: isTab(hash) ? hash : "screens", stageWidth: 0, fullSize: [] },
});

export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    ClickedTab: ({ tab }) => ({ model: { ...model, tab }, commands: [ScrollToPanel()] }),
    PressedTabArrow: ({ tab }) => ({ model: { ...model, tab }, commands: [FocusTab({ tab })] }),
    ClickedFullSize: ({ frame }) => ({
      model: {
        ...model,
        fullSize: model.fullSize.includes(frame)
          ? model.fullSize.filter((id) => id !== frame)
          : [...model.fullSize, frame],
      },
    }),
    MeasuredStage: ({ width }) => ({ model: width > 0 ? { ...model, stageWidth: width } : model }),
    CompletedFocusTab: () => ({ model }),
    CompletedScrollToPanel: () => ({ model }),
  });

const neighbour = (tab: Tab, step: number): Tab => TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length] ?? tab;

const tabList = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.nav(
    [h.Class("switch"), h.AriaLabel("Sections")],
    [
      h.div(
        [h.Class("wrap")],
        [
          h.div(
            [h.Class("switch-in"), h.Role("tablist"), h.AriaLabel("Design system sections")],
            TABS.map((tab) =>
              h.button(
                [
                  h.Type("button"),
                  h.Role("tab"),
                  h.Id(`tab-${tab}`),
                  h.AriaControls(tab),
                  h.AriaSelected(tab === model.tab),
                  h.Tabindex(tab === model.tab ? 0 : -1),
                  h.DataAttribute("tab", tab),
                  h.OnClick(Message.ClickedTab({ tab })),
                  h.OnKeyDownPreventDefault((key) =>
                    key === "ArrowRight" || key === "ArrowLeft"
                      ? Option.some(Message.PressedTabArrow({ tab: neighbour(tab, key === "ArrowRight" ? 1 : -1) }))
                      : Option.none(),
                  ),
                ],
                [TAB_LABELS[tab]],
              ),
            ),
          ),
        ],
      ),
    ],
  );

const panel = (tab: Tab, model: Model, content: ReadonlyArray<Child>, h: HtmlBuilder<Message>): Html =>
  h.section(
    [
      h.Class("panel wrap"),
      h.Id(tab),
      h.Role("tabpanel"),
      h.AriaLabelledBy(`tab-${tab}`),
      ...(tab === model.tab ? [] : [h.Hidden(true)]),
    ],
    content,
  );

type Group = { readonly id?: string; readonly title: string; readonly lead: string };

const groupHead = ({ id, title, lead }: Group, first: boolean, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.h3([h.Class(first ? "sub first" : "sub"), ...(id ? [h.Id(id)] : [])], [title]),
  h.p([h.Class("sub-p")], [lead]),
];

const PHONE_GROUPS: ReadonlyArray<Group & { readonly screens: (h: HtmlBuilder<Message>) => ReadonlyArray<Html> }> = [
  {
    id: "g-discover",
    title: "Finding something",
    lead: "Home picks up where you left off. Search is a round button beside the tab bar, not a bar across every screen.",
    screens: discoverScreens,
  },
  {
    id: "g-dialogue",
    title: "A dialogue",
    lead: "Read and Listen are the two main actions. Everything else sits further down the same page.",
    screens: dialogueScreens,
  },
  {
    id: "g-reading",
    title: "Reading",
    lead: "The page stays clean. Notes open from a line, and the Greek appears only when asked for.",
    screens: readingScreens,
  },
  {
    id: "g-listening",
    title: "Listening",
    lead: "Taken from Listen: the player and read-along take on the dialogue’s cover colour, and the text follows the narrator and speakers.",
    screens: listeningScreens,
  },
  {
    id: "g-states",
    title: "Loading, errors and empty",
    lead: "Every screen has these three states, built from the same parts.",
    screens: statesScreens,
  },
];

const FRAME_GROUPS: ReadonlyArray<
  Group & { readonly frames: ReadonlyArray<(frame: Frame, h: HtmlBuilder<Message>) => ReadonlyArray<Html>> }
> = [
  {
    title: "Reading or listening",
    lead: "Home and the sidebar follow how you last used each dialogue. Reading counts chapters; listening counts time. The player bar appears only once something is loaded to play.",
    frames: [homeReadingFrame, homeListeningFrame, dialogueFrame, libraryFrame],
  },
  {
    title: "Finding things",
    lead: "Explore, Search, an idea and a person. Every count is the corpus’s; every one-line description is proposed copy.",
    frames: [exploreFrame, searchFrame, ideaFrame, personFrame],
  },
  {
    title: "Reading",
    lead: "The sidebar steps aside while you read. The page keeps about 66 characters a line; chapters and Explain use the space on either side instead of covering the text.",
    frames: [readingExplainFrame, nightFrame],
  },
  {
    title: "Listening",
    lead: "The listening view from Listen, on the cover colour.",
    frames: [nowPlayingFrame],
  },
];

const frameFor =
  (model: Model, h: HtmlBuilder<Message>): Frame =>
  ({ id, tab, theme, cloth, caption: text }, content) => {
    const zoom = model.stageWidth > 0 ? Math.min(1, model.stageWidth / FRAME_WIDTH) : 1;
    const isFull = model.fullSize.includes(id);
    return h.figure(
      [h.Class(zoom < THUMBNAIL_ZOOM ? "wf small" : "wf")],
      [
        h.button(
          [h.Type("button"), h.Class("fit-b"), h.AriaPressed(String(isFull)), h.OnClick(Message.ClickedFullSize({ frame: id }))],
          [icon("expand", h), h.span([], [isFull ? "Fit to screen" : "Full size"])],
        ),
        h.div(
          [h.Class("stage stage-a")],
          [
            h.div(
              [h.Class("dscroll"), h.OnMount(ObserveStage())],
              [
                h.div(
                  [
                    h.Class("dframe"),
                    h.Id(id),
                    h.DataAttribute("w", String(FRAME_WIDTH)),
                    ...(zoom < 1 && !isFull ? [h.Style({ zoom: String(zoom) })] : []),
                  ],
                  [
                    h.div(
                      [h.Class("dchrome")],
                      [
                        h.span([h.Class("lights")], [h.i([]), h.i([]), h.i([])]),
                        h.span([h.Class("dtab")], [tab]),
                        h.span([h.Class("durl")], ["Plato"]),
                      ],
                    ),
                    h.div([h.Class(screenClass("dbody", theme)), ...clothStyle(cloth, h)], content),
                  ],
                ),
              ],
            ),
          ],
        ),
        caption(text, h),
      ],
    );
  };

const screensPanel = (h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  ...reviewNotes(h),
  ...PHONE_GROUPS.flatMap((group, index) => [
    ...groupHead(group, index === 0, h),
    h.div([h.Class("stage stage-a")], [h.div([h.Class("shots")], group.screens(h))]),
  ]),
  ...phoneResearch(h),
];

const webPanel = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const frame = frameFor(model, h);
  return [
    ...FRAME_GROUPS.flatMap((group, index) => [
      ...groupHead(group, index === 0, h),
      ...group.frames.flatMap((draw) => draw(frame, h)),
    ]),
    ...webResearch(h),
  ];
};

const FACTS = [
  "Literata, Inter and Gentium Book Plus",
  "Paper, Sepia and Night",
  "Vermilion accent",
  "A cloth colour per dialogue",
  "An emblem per idea, a portrait per person",
];

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: "Bookshelf Design System",
  body: h.div(
    [],
    [
      iconSprite(h),
      h.header(
        [h.Class("wrap hero")],
        [
          h.h1([], ["Bookshelf Design System"]),
          h.p(
            [],
            [
              "The Bookshelf direction, worked out in full. Reading stays on paper; listening takes on each dialogue’s cover colour, as in Listen. Every screen uses the real Crito text and chapters and real counts from the corpus. Curated pages are written as Markdown and checked against the text before they are drawn.",
            ],
          ),
          h.div(
            [h.Class("facts lead")],
            FACTS.map((fact) => h.span([], [fact])),
          ),
        ],
      ),
      tabList(model, h),
      h.main(
        [],
        [
          panel("screens", model, screensPanel(h), h),
          panel("web", model, webPanel(model, h), h),
          panel(
            "components",
            model,
            [...booksSection(h), ...readingSection(h), ...pagesSection(h), ...desktopSection(h), ...listeningSection(h)],
            h,
          ),
          panel(
            "primitives",
            model,
            [...buttonsSection(h), ...iconButtonsSection(h), ...controlsSection(h), ...iconsSection(h)],
            h,
          ),
          panel(
            "foundations",
            model,
            [
              ...colourSection(h),
              ...clothSection(h),
              ...peopleSection(h),
              ...ideasSection(h),
              ...typeSection(h),
              ...spacingSection(h),
              ...elevationSection(h),
              ...layoutSection(h),
            ],
            h,
          ),
        ],
      ),
      h.footer(
        [h.Class("wrap foot")],
        [
          "Text: the English rendering the site already uses; every passage is pulled from it by reference when the app is built. Chapters and times: the current review recording, which is still a preview. Ideas and counts: the corpus comparison index, counted as distinct passages of accepted records, keeping ideas with at least five passages in two dialogues. Who speaks, how it’s told and a person’s part: the voice records, counted by Greek letters. Pace: the turn index. Guide and key details: accepted corpus records, shown as written. The person page and the Explain notes are proposed copy, written as pages; their quotations are checked against the text. Idea descriptions and the role thresholds are proposed until the analysis plan settles them. Collections, reading progress, history, your place in an idea and Often found with are sample values. Covers, emblems and portraits are drawn in code.",
        ],
      ),
    ],
  ),
});

export const start = (container: HTMLElement | null) =>
  Runtime.run(Runtime.makeApplication({ Model, Flags, init, update, view, container }), {
    flags: Effect.sync(() => ({ hash: window.location.hash.slice(1) })),
  });

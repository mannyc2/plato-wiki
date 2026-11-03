// The device frames the specimen draws screens in: a phone at 390 by 844 points and a desktop
// window drawn at 1440 by 900. Each comes with the caption that says what the screen is for.
import type { Html, HtmlBuilder } from "foldkit/html";
import type { Child } from "../html";
import { icon } from "../icons";

export type Caption = { readonly title: string; readonly text: string };

// Night and the listening cloth are dark, so their status bar and home bar turn light.
export type ScreenTheme = "night" | "cloth";

export type ScreenConfig = {
  readonly theme?: ScreenTheme;
  // The dialogue's cloth colour on a listening screen; the tokens darken it.
  readonly cloth?: string;
  readonly caption: Caption;
};

export type FrameConfig = ScreenConfig & {
  readonly id: string;
  // The browser tab's label, as the app would set the document title.
  readonly tab: string;
};

// The page owns the desktop frame because it scales each one to fit and can show it at full size.
export type Frame = (config: FrameConfig, content: ReadonlyArray<Child>) => Html;

export const caption = <Message>({ title, text }: Caption, h: HtmlBuilder<Message>): Html =>
  h.figcaption([], [h.strong([], [title]), ` ${text}`]);

export const screenClass = (base: string, theme: ScreenTheme | undefined) => (theme ? `${base} A ${theme}` : `${base} A`);

export const clothStyle = <Message>(cloth: string | undefined, h: HtmlBuilder<Message>) =>
  cloth ? [h.Style({ "--cl": cloth })] : [];

export const statusBar = <Message>(tone: "dark" | "light", h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class(`sb sb-${tone}`)],
    [h.span([], ["9:41"]), h.span([h.Class("sb-r")], [icon("signal", h), icon("wifi", h), icon("battery", h, "bat")])],
  );

export const phone = <Message>(
  { theme, cloth, caption: text }: ScreenConfig,
  content: ReadonlyArray<Child>,
  h: HtmlBuilder<Message>,
): Html =>
  h.figure(
    [h.Class("shot")],
    [
      h.div(
        [h.Class("phone")],
        [
          h.div(
            [h.Class(screenClass("screen", theme)), ...clothStyle(cloth, h)],
            [
              statusBar(theme ? "light" : "dark", h),
              h.span([h.Class("island")]),
              ...content,
              h.span([h.Class("homebar")]),
            ],
          ),
        ],
      ),
      caption(text, h),
    ],
  );

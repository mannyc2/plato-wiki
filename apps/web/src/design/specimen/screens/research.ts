// Mobbin screens the phone layouts draw on.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";

export const phoneResearch = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.h3([h.Class("sub")], ["Research"]),
  h.p(
    [h.Class("sub-p")],
    [
      "Mobbin screens the system draws on. Reading and the shelf come from book apps; the player and read-along come from audio apps.",
    ],
  ),
  h.ul(
    [h.Class("refs")],
    [
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/d6766fdb-6038-4359-99d3-adf6a50ca363"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Apple Books, reader",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/342481e0-86a5-43a9-82db-44743f985dd8"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Apple Books, home",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/3a17e556-460c-43b0-bf46-893f5d49e263"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Headway, book detail",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/8bcb185d-cba6-4fd9-95ef-54e916f9f4b0"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Headway, highlight",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/058e54c1-2c6e-4568-939e-72ca0bd6ef85"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Matter, selection menu",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/2b95de3c-c969-4497-8b12-a1f1dd200caa"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Fable, reader",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/483e9b88-9c17-4fb0-89ca-38da34420862"), h.Target("_blank"), h.Rel("noopener")],
            [
              "The Atlantic, reader",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/040a97be-8e47-4be4-823e-f36cda57588b"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Substack web, article with player",
              icon("share", h),
            ],
          ),
        ],
      ),
    ],
  ),
  h.div([h.Style({ height: "10px" })]),
  h.ul(
    [h.Class("refs")],
    [
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/c9cb0602-c90a-4e10-9e03-14be4407c20c"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Spotify, audiobook player",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/ff9f0bbc-a1da-490e-b875-8ac01e9300c7"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Spotify, lyrics",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/83e3ffb8-e435-4bf8-ab66-c38b44c5c010"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Blinkist, player",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/5c627524-cd63-4845-885a-77c7dace046c"), h.Target("_blank"), h.Rel("noopener")],
            [
              "ElevenReader, read-along",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/e697ffff-a56e-465e-a281-5e58c9e66de2"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Apple Podcasts, transcript",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/b095ecfa-fcae-4be3-9ba8-c57eb30e6117"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Spotify web, audiobook",
              icon("share", h),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

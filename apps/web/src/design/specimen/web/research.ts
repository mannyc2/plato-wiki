// Mobbin web screens the desktop layouts draw on.
import type { Html, HtmlBuilder } from "foldkit/html";
import { icon } from "../../icons";

export const webResearch = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.h3([h.Class("sub")], ["Research"]),
  h.p(
    [h.Class("sub-p")],
    [
      "Mobbin web screens the desktop layouts draw on. The sidebar, hero bands and player bar come from music apps; reading beside Explain comes from transcript and research tools.",
    ],
  ),
  h.ul(
    [h.Class("refs")],
    [
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/fd3a6dc1-98fb-422a-8d9f-2a0c07635516"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Spotify, home",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/42098642-4b2d-429d-8fd9-9afc2711c1ed"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Apple Music, library",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/dc12eb80-5356-4401-a0f5-07251bfd1ae7"), h.Target("_blank"), h.Rel("noopener")],
            [
              "TIDAL, album",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/a8971ae6-42ed-46a4-9336-3199853bac85"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Deezer, browse",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/e3612ad9-aef6-4aa0-93fe-39fdf23de465"), h.Target("_blank"), h.Rel("noopener")],
            [
              "YouTube Music",
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
              "Spotify, audiobook",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/c939c9b8-e195-4e43-92a6-b845d0b99243"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Apple Music, lyrics",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/399111c9-c13a-4d06-8196-d164ac4340aa"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Fireflies, transcript",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/b6ea2099-ac98-4570-a035-0f31b762a90b"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Descript, transcript",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/1e71fae5-25a3-4eac-bb32-d6acccb34cc6"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Craft, document and comments",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/5b5f1c66-1ce8-4620-a0b6-79e407ebcbe3"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Elicit, report and sources",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/374186a9-1431-4480-8386-7c40754f5959"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Amazon, reader",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/903b1614-dfab-4c6f-a6ff-1debbb2372ba"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Biosites, settings popover",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/c02df2b2-764d-40fc-ad10-d155c92a2dba"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Perplexity, theme tiles",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/7bcb3736-9c35-4c45-a615-28c327f4994b"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Literal, currently reading",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/fc669f91-90d3-4040-a326-d3be3a7a924a"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Slite, sidebar progress",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/8abbf832-146c-4049-b2d7-c99e3113d869"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Todoist, insights panel",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/9e1155c3-c5e6-4041-af0c-91b6a919b16c"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Prime Video, X-Ray",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/07d6c5d9-9ff4-4169-b223-86ccb82db220"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Dovetail, tag description",
              icon("share", h),
            ],
          ),
        ],
      ),
      h.li(
        [],
        [
          h.a(
            [h.Href("https://mobbin.com/screens/340c546c-dc88-4997-af8b-ae669bf26ce6"), h.Target("_blank"), h.Rel("noopener")],
            [
              "Otter, speaker share",
              icon("share", h),
            ],
          ),
        ],
      ),
    ],
  ),
  ];

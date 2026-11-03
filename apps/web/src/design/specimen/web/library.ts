// Desktop at 1440: Library, with Settings open.
import type { Html, HtmlBuilder } from "foldkit/html";
import { cover } from "../../covers";
import { icon } from "../../icons";
import { sidebar } from "../../sidebar";
import type { Frame } from "../frames";

export const libraryFrame = <Message>(frame: Frame, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  frame(
    { id: "web-library", tab: "Library · Plato", caption: { title: "Library, with Settings open", text: "Settings is a popover from the foot of the sidebar. The theme lives here now, with text, speed and following. Progress under each cover says how you are taking it: a chapter for reading, time for listening." } },
    [
      h.div(
        [h.Class("w-app nobar")],
        [
          sidebar({ place: "library", settingsOpen: true }, h),
          h.div(
            [h.Class("w-main")],
            [
              h.div(
                [h.Class("w-in")],
                [
                  h.div(
                    [h.Class("w-ph")],
                    [
                      h.h1([h.Class("w-title")], ["Library"]),
                      h.span([h.Class("grow")]),
                      h.span(
                        [h.Class("w-seg")],
                        [
                          h.span([h.Class("on")], [icon("grid", h)]),
                          h.span([], [icon("list", h)]),
                        ],
                      ),
                      h.span([h.Class("a-chip")], [icon("sliders", h), "Recent"]),
                    ],
                  ),
                  h.div(
                    [h.Class("chips")],
                    [
                      h.span([h.Class("a-chip on")], ["All ", h.i([], ["10"])]),
                      h.span([h.Class("a-chip")], ["Reading ", h.i([], ["3"])]),
                      h.span([h.Class("a-chip")], ["Listening ", h.i([], ["1"])]),
                      h.span([h.Class("a-chip")], ["Finished ", h.i([], ["2"])]),
                    ],
                  ),
                  h.div(
                    [h.Class("w-lib")],
                    [
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "crito", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Crito"]),
                                  h.span([h.Class("lib-s")], [icon("bookopen", h), "Chapter 2 of 5"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "phaedo", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Phaedo"]),
                                  h.span([h.Class("lib-s")], [icon("headphones", h), "1 h 12 min left"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "meno", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Meno"]),
                                  h.span([h.Class("lib-s")], [icon("bookopen", h), "Chapter 1 of 8"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "republic", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Republic"]),
                                  h.span([h.Class("lib-s")], [icon("bookopen", h), "Chapter 1 of 5"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "apology", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Apology"]),
                                  h.span([h.Class("lib-s done")], [icon("check", h), "Finished"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "ion", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Ion"]),
                                  h.span([h.Class("lib-s done")], [icon("check", h), "Finished"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "euthyphro", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Euthyphro"]),
                                  h.span([h.Class("lib-s new")], ["New"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "symposium", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Symposium"]),
                                  h.span([h.Class("lib-s new")], ["New"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "gorgias", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Gorgias"]),
                                  h.span([h.Class("lib-s new")], ["New"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
                            ],
                          ),
                        ],
                      ),
                      h.span(
                        [h.Class("w-li")],
                        [
                          cover({ dialogue: "laches", size: "fill" }, h),
                          h.span(
                            [h.Class("w-li-m")],
                            [
                              h.span(
                                [h.Class("w-li-t")],
                                [
                                  h.b([], ["Laches"]),
                                  h.span([h.Class("lib-s new")], ["New"]),
                                ],
                              ),
                              h.span([h.Class("lib-more")], [icon("more", h)]),
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
          h.div(
            [h.Class("w-pop"), h.Role("dialog"), h.AriaLabel("Settings")],
            [
              h.b([h.Class("w-pop-h")], ["Settings"]),
              " ",
              h.b([h.Class("w-pop-l")], ["Theme"]),
              " ",
              h.div(
                [h.Class("w-themes")],
                [
                  h.span(
                    [h.Class("w-th on"), h.Style({ "--tp": "#FBF8F3", "--tk": "#1F1B16" })],
                    [
                      h.i([]),
                      "Paper",
                    ],
                  ),
                  h.span(
                    [h.Class("w-th"), h.Style({ "--tp": "#F4ECD8", "--tk": "#3B2F22" })],
                    [
                      h.i([]),
                      "Sepia",
                    ],
                  ),
                  h.span(
                    [h.Class("w-th"), h.Style({ "--tp": "#16130F", "--tk": "#ECE4D6" })],
                    [
                      h.i([]),
                      "Night",
                    ],
                  ),
                  h.span([h.Class("w-th auto"), h.Style({ "--tk": "#8E8578" })], [h.i([]), "Automatic"]),
                ],
              ),
              " ",
              h.b([h.Class("w-pop-l")], ["Reading"]),
              " ",
              h.div(
                [h.Class("w-prow")],
                [
                  h.b([], ["Text size"]),
                  h.span(
                    [h.Class("w-step")],
                    [
                      h.span([], [icon("minus", h)]),
                      h.em([], ["20"]),
                      h.span([], [icon("plus", h)]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("w-prow")],
                [
                  h.b([], ["Typeface"]),
                  h.span(
                    [h.Class("w-pills")],
                    [
                      h.span([h.Class("on serif")], ["Literata"]),
                      h.span([], ["Inter"]),
                    ],
                  ),
                ],
              ),
              " ",
              h.b([h.Class("w-pop-l")], ["Listening"]),
              " ",
              h.div(
                [h.Class("w-prow")],
                [
                  h.b([], ["Speed"]),
                  h.span(
                    [h.Class("w-pills")],
                    [
                      h.span([], ["0.8×"]),
                      h.span([h.Class("on")], ["1×"]),
                      h.span([], ["1.25×"]),
                      h.span([], ["1.5×"]),
                    ],
                  ),
                ],
              ),
              h.div(
                [h.Class("w-prow")],
                [
                  h.b([], ["Page follows the recording"]),
                  h.span([h.Class("w-tog on")]),
                ],
              ),
              h.div(
                [h.Class("w-plinks")],
                [
                  h.span(
                    [h.Class("w-plink")],
                    [
                      icon("download", h),
                      h.b([], ["Downloads"]),
                      icon("chev-r", h),
                    ],
                  ),
                  h.span(
                    [h.Class("w-plink")],
                    [
                      icon("info", h),
                      h.b([], ["About and licences"]),
                      icon("chev-r", h),
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

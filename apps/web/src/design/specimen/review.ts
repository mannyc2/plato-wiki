// What changed in this version, and what still needs a decision.
import type { Html, HtmlBuilder } from "foldkit/html";
import { type IconName, icon } from "../icons";

type Note = { readonly icon: IconName; readonly title: string; readonly text: string };

const NOTES: ReadonlyArray<Note> = [
  {
    icon: "check",
    title: "Decided: pages are written ahead",
    text: "Each page is checked, then read by you before any reader sees it. A page you pass gets a receipt tied to its exact words, so an edit sends it back to you. The Crito’s pages wait in the Curated Pages artifact. Notes written on request wait for their own budget approval; the Written on request screen shows how one would look, and that it says so.",
  },
  {
    icon: "info",
    title: "A curated person page",
    text: "Socrates in the Crito is written as a page rather than assembled from what the data could fill: where the morning finds him, how he argues in six moves, his words, who speaks, who is with him, and where the Crito falls in the story of his trial and death. The chip beside it would switch to his part in every dialogue, which is not drawn yet.",
  },
  {
    icon: "info",
    title: "One format for pages and notes",
    text: "Person pages, Explain notes and notes written on request are Markdown with a few named blocks, as in kace’s research. A page names passages, ideas, people and figures; the app pulls the words and the counts, so a page never retypes Plato or states a number that goes stale. A checker turns away a page whose quotations are not where it says. Components › Pages shows a page beside its source, and the checker’s output.",
  },
  {
    icon: "info",
    title: "Sources one step away",
    text: "The “Chapter 1 · 43b” line is gone. A claim carries a faint number; its card gives the place and the sentence, with the quoted words lit, Read in context and Play from here. It opens on hover on a computer and on tap on a phone, and in a narrow panel it opens below the paragraph so it never covers the words you are reading. Every source is listed, closed, under “N sources”.",
  },
  {
    icon: "info",
    title: "You and this idea",
    text: "The grid of 18 squares is gone. The panel follows you through the idea: where you met it, where it comes next in what you are reading or hearing, with Play from here, and where it comes back most.",
  },
  {
    icon: "info",
    title: "Emblems for ideas, portraits for people",
    text: "Each of the 18 ideas has an emblem on a plate in one of six hues, the way each dialogue has its cover; they appear wherever an idea does. Thirteen speakers have a portrait, a cream bust on their colour, in place of initials; the Phaedo’s Echecrates, Simmias and Cebes are the newest. Both are drawn in code. Foundations shows every one with its contrast.",
  },
  {
    icon: "info",
    title: "Quoted from the text",
    text: "Passages on the idea and person pages, in the trail and in Explain are pulled from the English rendering by reference when the app is built, so no copy of Plato’s words can drift from it. A quotation cut mid-sentence opens with an ellipsis.",
  },
  {
    icon: "info",
    title: "More varied samples",
    text: "The sidebar lists three collections. The idea page follows Truth priority procedure, Explore leads with Definition proposed and Forced alternative, and search finds Common opinion deployed as challenge and Knowledge vs right opinion, so Expert craft analogy no longer stands in for every idea.",
  },
  {
    icon: "edit",
    title: "Still to draw",
    text: "A person across every dialogue; pages for the other people and ideas; note and source pages; the corpus, weak-spots, anchors and patterns pages; About and licences; the offline state; reading without JavaScript; tablet widths; Night versions of most screens; and pages for a dialogue whose speakers are still hidden.",
  },
];

export const reviewNotes = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.div(
    [h.Class("review")],
    [
      h.h2([], ["For your review"]),
      h.p([], ["What changed in version 10, from your walkthrough of version 9, and what you decided."]),
      ...NOTES.map((note) => h.div([], [icon(note.icon, h), h.span([], [h.b([], [note.title]), note.text])])),
    ],
  ),
];

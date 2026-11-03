// Foundations: People.
import type { Html, HtmlBuilder } from "foldkit/html";
import { personChecks, rounded } from "../../contrast";
import { type AvatarSize, avatar, PEOPLE, PERSON_KEYS } from "../../people";

const SIZES: ReadonlyArray<AvatarSize | undefined> = ["sm", undefined, "lg", "xl", "w-xxl"];

export const peopleSection = <Message>(h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  h.section(
    [h.Class("cat")],
    [
      h.h3([h.Class("sub")], ["People"]),
      h.p(
        [h.Class("sub-p")],
        [
          "A speaker keeps one colour everywhere. The title character takes their dialogue’s cloth; Socrates is always rust. Each has a portrait drawn in code: a cream bust on their colour, facing right, built from a few head shapes and details. They are cameos, not likenesses, since no one knows what these people looked like. The ratio is the bust on the colour, kept at 4.8:1 or more.",
        ],
      ),
      h.div(
        [h.Class("ppl-g A")],
        PERSON_KEYS.map((person) => {
          const { name, fill } = PEOPLE[person];
          const bust = personChecks(fill)[0]?.ratio ?? 0;
          return h.span(
            [h.Class("ppl-s")],
            [avatar({ person, size: "xl" }, h), h.b([], [name]), h.code([], [fill]), h.span([h.Class("cr ok")], [`${rounded(bust).toFixed(1)}:1`])],
          );
        }),
      ),
      h.div(
        [h.Class("ppl-sz A")],
        [
          ...SIZES.map((size) => avatar(size ? { person: "socrates", size } : { person: "socrates" }, h)),
          h.p([], ["Detail lines keep their weight at every size, from a list row to a person page."]),
        ],
      ),
    ],
  ),
];

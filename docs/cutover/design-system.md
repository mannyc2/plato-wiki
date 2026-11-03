# Design system: the Bookshelf reader

## Status and boundary

- Status: proposed plan. DS0, the visual direction, was decided by the user on 2026-10-26. DS1,
  visual approval of the full system, is pending; version 10 of the system artifact was published
  for review on 2026-10-27 (see [the full-system artifact](#the-full-system-artifact)). No
  application code exists; the artifact is built from the design workspace in `apps/web`.
- Priority: P1, because application step 3 consumes it. Effort: M. Risk: medium; the main risks
  are screens shipped without approval and features that need data the corpus does not yet expose.
- Planned at: Plato `8a5e4c2`, 2026-10-26, with the existing uncommitted demo workspace untouched.
- Depends on: [application](application.md) step 1 (DEC-03 runtime, DEC-11 primitive criterion)
  before DS2; [data](data.md), [platform and audio](platform-and-audio.md) and
  [analysis](analysis.md) for the [data requirements](#data-requirements).
- This plan authorizes design review and, later, `apps/web/src/design/`. It authorizes no
  publication, paid model call, or acceptance of recordings. `DEC-` identifiers refer to the
  register in the [cutover index](README.md), which owns their status.

## Outcome and scope

Plato's reader is a consumer app for an English-speaking audience: read or listen to a dialogue,
and tap a line to see what is going on there. Corpus records and the Greek are one tap away and
never in the way. The visual language is Bookshelf: drawn covers, a warm paper page, a quiet serif
text, and sheets for notes. Reading stays on paper; the player and read-along take each dialogue's
cover colour.

This plan owns `apps/web/src/design/` (proposed): tokens, fonts, primitives, components, screen
patterns, content rules and the visual-approval record. [application.md](application.md) keeps
behaviour, data, routes and accessibility outcomes; its features adapt contract data to these
components. The content rules govern consumer views only. Curator, Markdown and agent views keep
record IDs, review statuses and hashes. `packages/demo` is untouched.

Out of scope: the parked interactive-dialogue idea (see [Open decisions](#open-decisions)), a
chatbot, and the demo's visual language. Curated pages and generated answers are in scope under
DEC-20. That decision, from the user's review of version 9, reverses this plan's earlier exclusion
of model-written notes and model calls at reading time. Such content uses the same blocks as
authored content and passes the same checks before anyone sees it, and it never enters the
corpus. The rebuilt idea classification, idea titles and summaries, and the reader analytics
belong to the [analysis lane](analysis.md) (DEC-16); this plan draws them and approves their copy.

## Evidence so far

### The rejected first round

The first round offered three directions; the user chose "B · Codex", then rejected that system
and all three directions on review on 2026-10-26 because none looked like a consumer app. Their
notes are the [content rules](#content-rules): no eyebrows; no record cards, apparatus panels,
record IDs or corpus hash; no Greek/Both/English switch; no marks in the reading text; commentary
that visibly does something; no "Listen from 43a"; rounded buttons; no search bar; primitives
designed and laid out together; Mobbin research on consumer readers before designing the page.

### Three directions and the choice

Three structurally different directions were published on 2026-10-26 in the private "Plato
Design Directions" artifact (<https://claude.ai/code/artifact/33b4d45d-b34b-48d4-ba4a-b3967af721ff>),
each as six phone screens, a desktop layout and a kit, on the real Crito text, chapters, guide and
preview recording.

| Direction | Structure | Outcome |
| --- | --- | --- |
| Bookshelf | Reading-first e-book app: covers on shelves, Literata page, line menu, Explain sheet, player one tap away | Chosen (DS0, DEC-10) |
| Listen | Audio-first dark app: a colour per dialogue, persistent player, lyrics-style read-along, narrator-read guide | Its full-screen player and read-along are adapted into Bookshelf on each dialogue's cover colour |
| Conversation | Each dialogue as a messaging thread with a colour per person | Parked as the reference for a possible interactive-dialogue feature |

The user judged Bookshelf the best overall, said they really liked the audio screens, and kept
the conversational design for a possible interactive dialogue in which the user joins a
conversation as an interlocutor.

### Research

Mobbin screens behind the adopted patterns, read on 2026-10-26.
Bookshelf: [Apple Books reader](https://mobbin.com/screens/d6766fdb-6038-4359-99d3-adf6a50ca363),
[Apple Books home](https://mobbin.com/screens/342481e0-86a5-43a9-82db-44743f985dd8),
[Headway book detail](https://mobbin.com/screens/3a17e556-460c-43b0-bf46-893f5d49e263),
[Headway highlight](https://mobbin.com/screens/8bcb185d-cba6-4fd9-95ef-54e916f9f4b0),
[Matter selection menu](https://mobbin.com/screens/058e54c1-2c6e-4568-939e-72ca0bd6ef85),
[Fable reader](https://mobbin.com/screens/2b95de3c-c969-4497-8b12-a1f1dd200caa),
[The Atlantic reader](https://mobbin.com/screens/483e9b88-9c17-4fb0-89ca-38da34420862),
[Substack web article with player](https://mobbin.com/screens/040a97be-8e47-4be4-823e-f36cda57588b).
Listen: [Spotify audiobook player](https://mobbin.com/screens/c9cb0602-c90a-4e10-9e03-14be4407c20c),
[Spotify lyrics](https://mobbin.com/screens/ff9f0bbc-a1da-490e-b875-8ac01e9300c7),
[Blinkist player](https://mobbin.com/screens/83e3ffb8-e435-4bf8-ab66-c38b44c5c010),
[ElevenReader read-along](https://mobbin.com/screens/5c627524-cd63-4845-885a-77c7dace046c),
[Apple Podcasts transcript](https://mobbin.com/screens/e697ffff-a56e-465e-a281-5e58c9e66de2),
[Headway read or listen](https://mobbin.com/screens/51027dee-1b7a-4c35-ba3a-8f5129a725a3),
[Spotify web audiobook](https://mobbin.com/screens/b095ecfa-fcae-4be3-9ba8-c57eb30e6117),
[Apple Podcasts search](https://mobbin.com/screens/e324b0ef-0159-4a32-b904-1b97d6731ec6).
Desktop, read on 2026-10-27: [Spotify home](https://mobbin.com/screens/fd3a6dc1-98fb-422a-8d9f-2a0c07635516),
[Apple Music library](https://mobbin.com/screens/42098642-4b2d-429d-8fd9-9afc2711c1ed),
[TIDAL album](https://mobbin.com/screens/dc12eb80-5356-4401-a0f5-07251bfd1ae7),
[Deezer browse](https://mobbin.com/screens/a8971ae6-42ed-46a4-9336-3199853bac85),
[YouTube Music](https://mobbin.com/screens/e3612ad9-aef6-4aa0-93fe-39fdf23de465),
[Apple Music lyrics](https://mobbin.com/screens/c939c9b8-e195-4e43-92a6-b845d0b99243),
[Fireflies transcript](https://mobbin.com/screens/399111c9-c13a-4d06-8196-d164ac4340aa),
[Descript transcript](https://mobbin.com/screens/b6ea2099-ac98-4570-a035-0f31b762a90b),
[Craft document and comments](https://mobbin.com/screens/1e71fae5-25a3-4eac-bb32-d6acccb34cc6),
[Elicit report and sources](https://mobbin.com/screens/5b5f1c66-1ce8-4620-a0b6-79e407ebcbe3),
[Amazon reader](https://mobbin.com/screens/374186a9-1431-4480-8386-7c40754f5959).
Version 7, read on 2026-10-27: [Biosites settings popover](https://mobbin.com/screens/903b1614-dfab-4c6f-a6ff-1debbb2372ba),
[Perplexity theme tiles](https://mobbin.com/screens/c02df2b2-764d-40fc-ad10-d155c92a2dba),
[Literal currently reading](https://mobbin.com/screens/7bcb3736-9c35-4c45-a615-28c327f4994b),
[Slite sidebar progress](https://mobbin.com/screens/fc669f91-90d3-4040-a326-d3be3a7a924a),
[Todoist insights panel](https://mobbin.com/screens/8abbf832-146c-4049-b2d7-c99e3113d869),
[Prime Video X-Ray](https://mobbin.com/screens/9e1155c3-c5e6-4041-af0c-91b6a919b16c),
[Dovetail tag description](https://mobbin.com/screens/07d6c5d9-9ff4-4169-b223-86ccb82db220),
[Otter speaker share](https://mobbin.com/screens/340c546c-dc88-4997-af8b-ae669bf26ce6).

### The full-system artifact

Version 10 of the private "Bookshelf Design System" artifact
(<https://claude.ai/code/artifact/3bb80983-a9a1-4f35-88eb-08272266fdc0>) was published on
2026-10-27 for the user's review, after versions 1 to 9 the same day. Version 2 added two review
notes and the toast timing. Version 3 redrew the desktop after the user called the earlier
desktop frames "really terrible and lacking": a 252 px sidebar and an 84 px player bar around
pages on raised panels, light colour bands behind page heads, a Full size view for desktop frames
on a phone, and a review note on idea group labels. Version 4 listed the Mobbin web screens behind
the desktop layouts. Version 5 lightened the bands so links pass on every dialogue's and person's
band, and version 6 aligned the idea-label note with [data requirement 6](#data-requirements).

Version 7 answers the user's recorded walkthrough of version 6:

- Home, the dialogue page and the sidebar follow how each dialogue was last used. Reading counts
  chapters left; listening counts time left and draws its progress as sound.
- The player bar appears only while a recording is loaded and no longer names the chapter.
- Settings is a popover holding the theme. The bar's moon was the sleep timer, which the user read
  as a theme switch; the timer now appears only in Now playing, named and with its own icon.
- The right-hand panels, which the user called the weakest part of every page, are picked by
  fixed rules and show precomputed analytics from [analysis](analysis.md#analytics): How it's told,
  Who speaks, Pace, ideas placed on the dialogue, and a person's part in each dialogue. You and
  this idea is not an analytic: the application joins the reader's progress to an idea's passages.
- Every idea carries a one-sentence description, as proposed copy until analysis AN2. Counts follow
  the analysis rules: distinct passages, and only ideas with at least five passages in two
  dialogues. Assent chains are an analytic, not an idea, and the grey axis labels are gone.
- Often found with appears only as a component with sample values. Of today's 41 qualifying pairs,
  30 come through `turn_geometry` concepts, 24 of them through `explicit_procedure_control`:
  mechanical labels that analytics replace, leaving too few pairs to show.

Version 8 changes only two colours that failed the contrast gate in version 7: the Laws' bronze,
which also fills an avatar, and the grey behind "four others" on the Idea page.

Version 9 applies the analysis plan's revised speaker rules. Who speaks and roles are hidden in
seven dialogues instead of four. A voice someone performs counts toward their part, so Socrates
leads the Menexenus, where he recites Aspasia's speech. Shares round from exact counts: Socrates has
40% of the Crito, not 41%, and 54% of the Protagoras' words, not 55%. His role counts say how
many dialogues they do not cover yet.

Version 10 answers the user's walkthrough of version 9 (DEC-20):

- A person page is curated rather than assembled from what the data can fill. Socrates in the
  Crito is a Markdown page of named blocks: where the morning finds him, six moves of his argument
  with their ideas, a pull quote, Who speaks, the people with him, and where the Crito falls in the
  trial and death of Socrates. His part in every dialogue moves behind a chip and is not drawn.
- Explain's note is a page in the same format, and a phone screen shows a note written on request,
  which says so. The reference line under the speaker is gone. As kace's citation research
  recommends, a claim carries a faint number whose card gives the place and the sentence with the
  quoted words lit; every source is listed, closed, under "N sources".
- The design workspace's checker parses each page and resolves every passage, idea, person,
  analytic and collection it names. It refuses a quotation not found at the cited place and, in
  Two views, words that are not the named speaker's, and reports `line: message` lines. Passages
  are pulled from the English rendering by reference when the app is built.
- You and this idea follows the reader through the idea, where they met it, where it comes next
  in what they are reading or hearing, and where it comes back most, instead of counting the
  dialogues met.
- Each of the 18 ideas has an emblem on a plate in one of six hues, and ten people have cameo
  portraits instead of initials, all drawn in code.
- Samples vary: three collections, and the idea page follows Truth priority procedure.
- Role follows the analysis plan's scene rule, so it is hidden in five dialogues while Who speaks
  stays hidden in seven. Socrates leads 17 of the 21 counted dialogues, among them the Protagoras
  with 57% of its scene, and mostly listens in 4.

Version 10 was republished the same day once DEC-20's timing was decided. Its decision note records
the outcome, Explain draws the Crito 43b–c note as revised for review, and a citation number no
longer wraps onto a line of its own. Who speaks follows DEC-19: the objector Socrates voices at 48a
counts as quoted by him, so he has 41% of the Crito's words and none wait for a speaker.

On the real Crito text, chapters, guide, notes and corpus counts it shows 23 phone screens; eleven
desktop layouts at 1440 by 900 CSS px (Home while reading and while listening, Dialogue, Library
with Settings open, Explore, Search, Idea, Person, reading with Explain, Night while following the
recording, and Now playing); the components, including the desktop player bar, sidebar, glance
rows, Settings popover, analytics panels, and pages beside their Markdown source with the checker's
output; every primitive with its states; and the foundations: Paper, Night and Sepia palettes,
cloth and person colours, portraits, idea emblems, type, spacing, radius, elevation, motion,
layout and transliteration. Collections, Library contents, reading progress, history, the reader's
place in an idea and Often found with in it are sample values, and the curated pages are proposed
copy. Nothing in it is approved yet.

Its build computes every published contrast ratio from the hex values and fails below the floor:
4.5:1 for text, 3:1 for large text and controls. It also fails if a colour added after version 6
lowers a published figure: the cream bust on the Laws' bronze `#75633F` measures 4.9:1, and the
cloths of the five dialogues version 6 never drew stay above every lowest ratio below. The pace
chart fades the turns still ahead; the chapter list under it says in words where you stopped.
WCAG 2.2 ratios measured on 2026-10-27:

| Pair | Ratio | Use |
| --- | ---: | --- |
| ink `#1F1B16` on paper `#FBF8F3` | 16.2 | Reading and interface text |
| muted `#6A6359` on paper; on guide `#F3EDE3` | 5.6; 5.1 | Secondary text |
| white on accent `#C2412D` | 5.1 | Filled buttons and play |
| accent-text `#A3321F` on paper; on accent-soft `#F7E6DF` | 6.5; 5.7 | Links and tinted buttons |
| ink on highlight `#FBE6A2` | 13.8 | Highlighted line |
| progress `#C2412D` against track `#ECE5DA` | 4.1 | Progress fill (3:1 floor) |
| control `#8E8578` against card `#FFFFFF` | 3.6 | Switch track when off (3:1 floor) |
| Night: ink `#ECE4D6` on paper `#16130F`; muted `#A89F91` on card `#1F1B16` | 14.7; 6.5 | Night text |
| Night: accent-text `#F08A73` on paper; progress `#E0654D` against track `#2E2923` | 7.6; 4.2 | Night links and progress |
| Sepia: ink `#3B2F22` on paper `#F4ECD8`; muted `#6E604D` on guide `#EADFC6` | 11.0; 4.6 | Sepia text |
| Lowest over all 27 cloth colours: cover ink `#F4EBD6` on the glow; secondary text; read-along lines to come | 5.4; 5.4; 4.6 | Player and read-along |
| Lowest over all 27 cloth colours: read-along lines already read | 3.2 | Large bold text (3:1 floor) |
| Lowest over every dialogue's and person's page band (the colour mixed with 82% paper): secondary text at 72% ink; accent-text | 5.5; 4.6 | Page heads on phone and desktop |
| Cream `#F4EBD6` busts on person colours | 4.8 or more | Portraits |
| Person colours as chart bars on the card `#FFFFFF` | 3.0 or more | Who speaks (3:1 floor) |
| Emblem ink on its plate, over six hues | 5.1 or more | Idea emblems (3:1 floor) |

The player and read-along mix each cloth with 40% black behind text and keep a 12% mix as a glow
behind the cover only; cover ink is used at four strengths (full, 72%, 64% and 46% mixed into the
darkened cloth).

### Curated pages written ahead

DEC-20's timing was decided by the user on 2026-10-27: pages are written ahead, and each shows only
once the user has read it. The first batch is the whole Crito in 19 pages: Socrates, Crito and the
Laws each have a person page, and 16 line notes cover all 59 of its Stephanus sections. A second
agent checked every claim against the sentence it cites, and its 18 corrections were applied
before the private "Curated Pages" artifact
(<https://claude.ai/code/artifact/1fe00655-b1aa-4863-83d2-802f74e68ef0>) went to the user on
2026-10-27. It draws each page as the app does, with the passage a note explains and whether the
user has read it. The user passed all 19 the same day, keeping the one note that reaches outside
the text (the dream's echo of Homer's Achilles), and each now carries its receipt.

- Pages live in `apps/web/src/design/pages/<dialogue>/`. A line note is named for its span, such
  as `crito/43b-c.md`, and a person page for its person, such as `crito/socrates.md`. Notes in one
  dialogue never overlap.
- `bun run pages check` runs the checker over every page, and `bun run test` runs it too, so CI
  fails on any page it refuses.
- Passages come from the English rendering when the app is built, through a Bun macro, so neither
  a page nor the code holds a copy of Plato's words. The macro holds every section of each
  dialogue with pages and every passage a page names. That suits the workspace and its review
  pages; the application loads a dialogue's passages with its reading data instead, since the
  whole rendering is about 4 MB.
- Once the user passes a page, `bun run pages review <path>` writes its receipt: the date and the
  page's hash, computed by the tool. An edit breaks the hash, and the page drops out until it is
  read again.
- The workspace's speaker check stands in for DEC-20's and refuses only `{q}`-marked speech. Where
  voices nest without that mark, as with the Crito's objector, a page states the contrast in prose
  rather than in Two views.

The second batch, drafted and checked on 2026-10-27, is the Apology (2 person pages and 33 notes),
the Euthyphro (2 and 20) and the Phaedo (5 and 79): 141 pages, every Stephanus section of each
dialogue covered once. Each dialogue was drafted by one agent, or the Phaedo by three, and checked
by another against both the English and the Greek; every correction was applied before the batch
went to the user. Their narrated and nested voices make prose contrasts the default. The Apology
and the Phaedo have no Two views, since every other voice in them is quoted inside a turn; the
Euthyphro has four. Where the English mistranslates (Euthyphro's δοῦλοι as "servants", Phaedo
105a's "ten is not itself an opposite", Apology 38b's "Aristobulus"), a note follows the Greek while
its citation still quotes the English. Echecrates, Simmias and Cebes now have portraits. Idea pages
wait for analysis AN6, which replaces the ideas.

Person pages were redrawn at the user's request on 2026-10-27 and approved on 2026-10-28. The arc
is headed by its collection's title and lists the dialogues top to bottom, each with its moment in
the story. The cast is headed "Also in the <dialogue>", and a row leads to that person's page when
there is one. An argument's steps sit on one thread, and past four steps the first three show with
the rest behind a "Show more steps" button. The heading change put the three Crito person pages
back to the user, who passed them again on 2026-10-28.

Deferred by the user on 2026-10-27, so as not to delay this work: curating further per dialogue,
with the blocks and layout of each page chosen for its dialogue rather than one shape for all.
The user judges it the better result; it comes after every dialogue has its pages.

## Content rules

Each rule has an enforcing test. Test files are **proposed**; DS2 and DS4 create them.

| Rule | Requirement in consumer views | Enforcing test |
| --- | --- | --- |
| No eyebrows | No uppercase, small-capital or caps-variant labels; headings stand alone; speaker names are sentence case | `apps/web/test/application/design-tokens.test.ts` rejects `text-transform: uppercase`, `small-caps` and `font-variant-caps` in `apps/web/src/**/*.css`; `content-rules.e2e.test.ts` rejects a computed uppercase transform on rendered routes |
| No record IDs or hashes | Visible text and accessible names match no entry in the ID guard list below this table. Element `id`s and link fragments may carry stable IDs, because application preserves ID fragments | `apps/web/test/browser/content-rules.e2e.test.ts` checks each guard separately over every consumer route fixture, reading `innerText` plus `aria-label` and `title` |
| English first | No language switch. Greek appears for one line on request (Explain, then Original) with a deterministic transliteration: accents, smooth breathing and iota subscript dropped; rough breathing → h (ῥ → rh), written before a whole diphthong (οὗτος → houtos); η → ē, ω → ō; ου → ou, ευ → eu, αυ → au, ηυ → ēu, υι → ui; a diaeresis keeps its vowel apart from the one before, each transliterated alone, and the mark is dropped; ρρ, also printed ῤῥ, → rrh; φ → ph, θ → th, χ → ch, ψ → ps, ξ → x; υ → y outside diphthongs; γ before γ, κ, ξ, χ → n; the Greek question mark `;` → `?` and the ano teleia `·` → `;` (U+037E and U+0387, which the sources print as U+003B and U+00B7) | `apps/web/test/application/transliterate.test.ts` fixtures, at least one per rule, including `καὶ γὰρ ἂν, ὦ Κρίτων` → `kai gar an, ō Kritōn` and `οὗτος` → `houtos`; the content-rules test finds Greek only inside `lang="grc"` |
| No marks in the text | Reading lines carry no note markers, numbers or underlines; a line's notes open from its line menu on phones, and in Explain beside the text on desktop | Content-rules test: reading units contain no note-marker element |
| Commentary does something | Each chapter with a guide (accepted commentary) opens with its guide card. In audio the narrator reads the guide before the dialogue, as the screenplay's `commentary` entries already do (`audio/scripts/crito.json`). Ten dialogues start with an opening chapter that has no guide, such as `chapter-apology-opening`; it opens on the text | Reader browser test: a chapter fixture with a guide renders it first, and an opening chapter without one renders its first line; player test: in each chapter with a `commentary_id`, the commentary entry precedes the first source entry (the screenplay runs heading, commentary, then source) |
| Buttons say what happens | "Play from here", "Listen", "Read along"; never "Listen from 43a". Stephanus references label quoted passages and source cards; a claim's reference is one step away, behind its citation number | Content-rules test rejects control labels matching a Stephanus reference (`\b\d{1,3}[a-e]\b`) |
| Quoted, not retyped | A page names a passage by reference and the app pulls its words from the rendering when it is built. A citation's quoted words must be found at its reference, and the words cited for a speaker in Two views must be that speaker's | The page checker's tests, and a test that runs the checker over every page; today `apps/web/src/design/blocks.test.ts`, `page-check.test.ts` and `passages.test.ts` in the design workspace |
| Honest audio status | `draft` recordings show "Preview"; nothing presents a draft as accepted | Audio browser test over one `draft` and one `accepted` fixture |
| Rounded, quiet chrome | Pill buttons, round icon buttons, targets of at least 44 × 44 CSS px; no persistent search bar (Search is a tab or icon that opens its screen) | Primitives browser test measures targets; content-rules test finds `input[type=search]` only on the Search route |

The ID guard list. Each entry is its own test case, with a real ID as its positive fixture;
`<dialogue>` is a slug that may contain hyphens, such as `lesser-hippias`:

- record IDs `(obs|claim|rel|comm|voice|turn)_<dialogue>_<digits>`, such as `obs_crito_0023`;
- relation pair IDs `pair_<dialogue>_<digits>`, such as `pair_crito_00001`;
- ontology IDs `(axis|concept)_sha256_<64 hex>`;
- chapter IDs `chapter-<dialogue>_<digits>`, such as `chapter-crito_0001`, and
  `chapter-<dialogue>-opening`, such as `chapter-apology-opening` (two cases);
- recording IDs ending in an 8-hex suffix, such as `lesser-hippias-dots-review-6f5d44e1`;
- screenplay entry IDs `<dialogue>-(heading|commentary|source)-…`, such as `crito-source-turn-000001`;
- raw snake_case keys, such as `expert_craft_analogy` or `subject_matter`;
- 40- or 64-hex digests.

## Foundations

Tokens are CSS custom properties declared once in `apps/web/src/design/tokens.css` (proposed);
script reads computed values only where behaviour needs one. Names are semantic:

| Group | Tokens |
| --- | --- |
| Colour | `--paper`, `--card`, `--ink`, `--muted`, `--line`, `--chip`, `--guide`, `--accent`, `--accent-text`, `--accent-soft`, `--on-accent`, `--progress`, `--highlight`, `--control`, `--focus`, `--scrim`; `--cloth-<dialogue>` for covers, one per dialogue (27), with the darkened cloth, glow and cover-ink strengths derived from it on the audio screens; `--person-<speaker>` for avatars; `--band` and `--band-ink` for page heads: the dialogue's or person's colour mixed with 82% paper, and text at 72% ink over it (Paper values; Night and Sepia bands are set when those screens are drawn) |
| Type | `--font-reading` (Literata), `--font-ui` (Inter), `--font-greek` (Gentium Book Plus); size and line-height steps for display, title, heading, reading, body, label and caption roles |
| Space and shape | A 4 px spacing scale; pill radius for buttons and chips; circles for icon buttons and avatars; large radii for cards and sheets |
| Depth and motion | Flat page, raised card, floating player and menu, modal sheet over a scrim; short ease-out durations for sheets, menus and the mini player |

Values come from the DS1 artifact. Paper is paper `#FBF8F3`, card `#FFFFFF`, ink `#1F1B16`, muted
`#6A6359`, line `#ECE5DA`, accent `#C2412D`, accent-text `#A3321F`, accent-soft `#F7E6DF` and
highlight `#FBE6A2`; the artifact also carries Night, Sepia, the cloth table, sizes and the
remaining values. From 2026-10-27 they are code in the design workspace (DEC-03), as the review
artifact's source. They stay proposed until DS1, and application views consume them only after it.

- **Themes.** Paper and Night follow `prefers-color-scheme`, with a reader override in text
  settings; Sepia is a reading theme only. The player and read-along use the dialogue's darkened
  cover colour in every theme.
- **Contrast gate.** 4.5:1 for text; 3:1 for large text (at least 24 px, or 18.66 px bold), UI
  component boundaries and the focus indicator. Measure every text and background token pair in
  Paper, Night and Sepia; each of the 27 cloth colours wherever it carries text; the cream portrait
  bust on every person colour and every idea emblem on its plate; and the page band of every
  dialogue and person, with its text and links, in each theme that draws one.
- **Type.** Literata for titles and reading, Inter for everything a reader taps, Gentium Book Plus
  for Greek with `lang="grc"` (DEC-12). Reading text follows the reader's size setting, survives
  200% zoom (WCAG 1.4.4) and reflows at 320 CSS px (1.4.10).
- **Motion.** Under `prefers-reduced-motion: reduce`, sheets and menus appear without travel,
  skeletons do not shimmer, and read-along moves between lines without smooth scrolling.
- **Fonts.** Self-hosted WOFF2 under the OFL in `apps/web/src/design/fonts/` (proposed), subset to
  the Latin and Greek ranges used, with licences and source versions recorded in the
  `PROVENANCE.md` that platform P1 creates; `font-display: swap` with metric-compatible fallbacks.
- **Icons.** One stroke icon set drawn for the app; every icon is `aria-hidden`, and its control
  carries text or an `aria-label`.

## Primitives

Native elements first (DEC-11). `@foldkit/ui` components fill only behaviour that native elements
lack, as named below. Every primitive shows hover, pressed, focus-visible and disabled states, plus
selected and loading where relevant, in DS1, and DS3 screenshot-tests each state.

| Primitive | Element | Keyboard and ARIA contract |
| --- | --- | --- |
| Button: filled, tinted, outlined, plain | `<button>`; `<a>` when it navigates | Enter and Space activate; focus ring of at least 3:1; loading keeps its width and sets `aria-busy` |
| IconButton | `<button>` with `aria-label`; icon `aria-hidden` | As Button; a 44 px target even when the glyph is smaller |
| Chip | `<input type="radio">` or `checkbox` with a `<label>`, inside a `<fieldset>` | Arrow keys within a radio group; Space toggles a checkbox chip |
| Tag | `<span>` text | Not interactive; meaning never by colour alone, e.g. "Preview recording" |
| TabBar and top navigation | `<nav>` of links | `aria-current="page"`; these navigate routes and are not ARIA tabs |
| Tabs (in-page, only if a screen needs them) | `@foldkit/ui` Tabs | Arrow keys, Home and End; tablist, tab and tabpanel roles |
| ListRow | `<li>` containing one `<a>` or `<button>` | The whole row is the target; no nested interactive elements |
| Card | `<article>` or `<section>` with a heading | A linked card has one link, on its title, with an expanded hit area |
| Sheet | `<dialog>` opened with `showModal()` on phones; a labelled non-modal `<aside>` beside the text on desktop; below 1280 CSS px Explain opens as a modal drawer over the page, like the phone sheet (proposed) | Esc closes; focus moves in and returns to its trigger; the page behind a modal sheet is inert |
| Menu: line actions and overflow | `popover` element of buttons; `@foldkit/ui` Menu where roving arrow-key focus is required | Opened by a button with `aria-expanded`; Esc closes and restores focus; arrow keys move between items |
| Progress | `<progress>` | Accessible name such as "Chapter progress" |
| Scrubber | `<input type="range">` | Arrow keys step 5 s; `aria-valuetext` such as "2 minutes 14 seconds of 8 minutes 23 seconds" |
| Switch | `<input type="checkbox" role="switch">` | Space toggles; the label names the setting |
| TextField | `<input type="search">` with a visible `<label>` | Search screen only; Enter submits; Esc clears |
| Avatar | `<span aria-hidden="true">` holding the person's portrait, an inline SVG cameo on their colour | The person's name always appears as text beside it; a portrait is drawn in code and never presented as a likeness |
| Idea emblem | `<span aria-hidden="true">` holding an inline SVG on the idea's plate | The idea's name always appears as text beside it; one drawn emblem per idea |
| Cover | Inline SVG, `role="img"` named by the dialogue title, or `aria-hidden` when the title is adjacent | One drawn emblem per dialogue; a dialogue without one gets a typographic cover, never generated art |
| Toast | `role="status"` region | Polite; visible at least 5 s and paused on hover or focus; no action exists only in a toast |
| Skeleton | `aria-hidden` shapes inside a region with `aria-busy="true"` | Removed when content arrives |

Reading lines need one more decision in DS1: per-line menu buttons exposed to assistive technology,
or one tab stop with roving focus across lines and Enter to open the line's actions (the line menu
on phones, Explain on desktop). The artifact proposes the single tab stop, so a chapter is not
hundreds of stops. DS3 verifies the approved pattern by keyboard and with VoiceOver and NVDA.

## Components and screens

Shown means the screen appears in version 10 of the [full-system artifact](#the-full-system-artifact);
nothing is approved until DS1 records approval of the full system.

| Component or screen | Shown in version 10 | Status |
| --- | --- | --- |
| Home: continue card in the mode last used, shelves, tab bar; mini player only while listening | Phone and desktop | Approval pending |
| Desktop frame: sidebar with glance rows, Settings popover, page panels and colour bands; player bar only while listening | Desktop | Approval pending |
| Library, Search, Explore, Idea and Person pages | Phone and desktop | Approval pending; Explore section names, idea titles and summaries (analysis AN2) and the role copy need the user's approval |
| Curated pages: a person in a dialogue, Explain notes, and a note written on request, with citation cards and the sources list | Phone and desktop; a note written on request on phone | Approval pending; a page shows only once the user has read it ([written ahead](#curated-pages-written-ahead)) |
| Dialogue: cover, read and listen times, buttons in the mode last used, About, chapters with pace | Phone and desktop | Approval pending |
| Right-hand panels: How it's told, Who speaks, ideas placed on the dialogue, You and this idea, last 7 days | Desktop | Approval pending; each hides where its analytic does not verify |
| Often found with | Component, sample values | Approval pending; needs analysis AN5 |
| Reader: chapter title, guide card, speaker lines, chapter progress, chapters sheet | Phone and desktop | Approval pending |
| Line menu and Explain: a curated note (What's happening, Two views) with its sources, Original Greek, Key details | Phone: line menu, then Explain sheet. Desktop: selecting a line opens Explain beside the text, with the line's actions at its top | Approval pending |
| Text settings with Paper, Sepia and Night; Night while following the recording | Phone; Night while following also desktop | Approval pending; following needs the timing index |
| Player, read-along, tap while listening, speed and sleep timer, on the cover colour | Phone; player with read-along on desktop | Approval pending; read-along needs the timing index |
| Mini player and desktop player bar | Phone and desktop | Approval pending |
| Loading, error and empty states | Phone | Approval pending |
| A person across every dialogue; pages for the other people and ideas | Not yet | To draw before DS1 approval |
| Record pages (a note or source on its own page), about, licence and quality pages | Not yet | To draw before DS1 approval |
| Corpus, weak-spots, anchors and patterns pages | Not yet | To draw before DS1 approval |
| Offline state; reading without JavaScript | Not yet | To draw before DS1 approval |
| Tablet widths, 391 to 1279 CSS px, with Explain as a drawer below 1280 | Not yet | To draw before DS1 approval |
| Night versions of most screens; desktop text settings, and loading, error and empty states | Not yet | To draw before DS1 approval |

## Data requirements

These requirements are handed to the plans that own the data. Each is a deterministic derivation
from accepted records or verified evidence; none is model-written. Curated pages (DEC-20) cite
them and never become a source for them. A design may need data the corpus lacks. That is
recorded here as a requirement, not a reason to cut the design.

1. **Per-entry timing index, for read-along and Play from here.** Platform P3 step 2 defines the
   `recording_timing` projection, data D3's `rebuild` produces it, and application step 3 consumes
   it. The renderer's assembly sidecar `timing` items give per-segment start and end frames with
   their `entry_ids` (`scripts/audio/render_dots.py:4194–4330`); map them through the mastering
   chapter timeline and edit map (`packages/harness/src/site/mastering-evidence.ts`) into
   complete-master frames. The index is keyed by screenplay entry ID, such as
   `crito-source-turn-000001` in `audio/scripts/<dialogue>.json` (bound to the English source
   hash), and each reading line maps to the source entries that cover it. That line-to-entry key
   does not exist yet and is unresolved (DEC-15): entries carry only `id`, `text` and `anchor.stephanus`
   (Crito has 148 source entries against 102 Greek turns). Each entry ID comes from an attribution
   turn, such as `turn-000001` in `audio/speaker-attributions/<dialogue>.json`, which records
   English `start_char`/`end_char`, but the generator splits turns at chapter and commentary
   boundaries into `-part-NNN` entries without emitting their offsets. The index must add each
   entry's English UTF-16 interval and map lines by overlap. A renderer segment that groups several
   entries gives one interval for the group: task spans record character offsets, not frames.
   "Play from here" on a line inside a grouped interval starts at that interval's start. Until a
   recording's index verifies by tiling each chapter exactly, a line's actions offer "Play chapter"
   instead of "Play from here", and read-along is hidden.
2. **English to Greek line alignment, for Original.** Data owns it as a rebuildable projection,
   consumed by the application's reading contract. Derive it within each Stephanus section from the
   English markers (`derived/plato/stephanus-english/`) and the Greek turns (`derived/plato/turns/`);
   each derived file records its raw source path and hash. `packages/harness/src/site/reading-source.ts`
   reads those raw sources directly, `raw/plato/{greek,english}/<dialogue>.txt`, and checks each for
   a Stephanus spine through `stephanusMarkers`. Where a section's turns do not pair one to one,
   Original shows that section's Greek with its reference, never a guessed line.
3. **Notes for a line.** The application's reading contract supplies them, through note references
   on `getReading` units or a bounded line-notes read over `CorpusRead`. "What's happening" is the
   accepted commentary covering the line's placement. "Two views" is an accepted relation between
   claims whose evidence falls in the line, shown as each speaker's claim text. "Key details" are
   accepted observations whose source spans fall within the line's Greek span. Where requirement 2
   falls back to a whole section, "Two views" and "Key details" cover that section, and the sheet
   says so. Public views show only accepted records (DEC-05). Under DEC-20, a curated note for the
   line takes the place of What's happening and Two views where one exists; it cites passages, is
   checked like any page and never becomes a record, while Key details stay accepted records.
4. **English search.** Data builds a derived full-text index from the immutable English source
   version, under its derived-index rule; the application exposes it through `searchCorpus` with an
   explicit reading scope, and a result opens the reader at its line.
5. **Durations.** Reading minutes per chapter and dialogue come from English word counts at one
   fixed rate, proposed as 240 words per minute and decided in DS1, because the repository has no
   reading-time computation to reuse; listening minutes come from verified frame counts at 48,000
   frames per second. Both are rounded up to whole minutes and tested in the application's render
   model.
6. **Ideas, their titles and summaries.** The [analysis lane](analysis.md) owns them: AN2 drafts a
   title unique across the corpus and a one-sentence summary for each idea and records the user's
   approval of them as consumer copy, AN5 classifies every accepted observation, and AN6 replaces
   the ontology and its projections. Until AN6 the artifact shows today's concepts as stand-ins
   under the analysis display rules. An idea's count is its distinct passages, not its
   observations: the 12,292 accepted observations sit on 7,550 passages. An idea appears only with
   at least five passages in two dialogues, and each title once. Patterns that code measures, such
   as assent chains, turn geometry and frame depth, are analytics, not ideas. Explore's section
   names, such as "Analogies and images" and "How the argument moves", are proposed UI copy that
   needs the user's approval; they never become ontology data. Axis labels no longer appear in
   consumer views.
7. **Reader analytics.** How it's told, Who speaks, Role in the dialogue, Pace and agreement, ideas
   in a dialogue and where they fall, Often found with, and a person across dialogues are defined
   in [analysis: Analytics](analysis.md#analytics) as deterministic projections. The panels show
   them precomputed. A curated page names an analytic and never restates its numbers. A panel is
   hidden where its analytic does not verify, never shown with partial data. Under DEC-19,
   approved by the user on 2026-10-27, Who speaks and Role are hidden in the same five dialogues,
   the Republic, Parmenides, Charmides, Lysis and Euthydemus, until the voice review lands in
   analysis AN6. The Phaedrus and Greater Hippias show Who speaks with the part each speaker
   quotes or puts on marked; version 10 still hides it there. A count across dialogues, such as a person's roles, covers only verified dialogues and says how
   many it leaves out.

## Parity versus new features

P4 activation requires parity: every row of application's preservation table rendered on the
approved system. The reader, Explain and record pages carry dialogue, Greek source, commentary,
turns, voices, claims, relations and apparatus. Explore, Idea and Person pages carry the ontology
views. Search, About, licence, quality, corpus, weak-spots, anchors and patterns pages carry the
catalogue. Library, Dialogue and Player carry the audio catalogue, and application keeps the
canonical URLs and ID fragments.

Read-along, per-line Play from here, Original with its transliteration, per-line Explain notes,
English search, durations and the reader analytics panels are new features. Each ships when its
data requirement verifies; transliteration has none of its own and ships with Original once
`transliterate.test.ts` passes. None blocks activation, and none ships with placeholder data.

## Implementation steps

### DS0. Choose the direction

Decided on 2026-10-26: Bookshelf, with Listen's player and read-along on each dialogue's cover
colour (DEC-10).

**Verify:** README's DEC-10 row records the decision, its date and the directions artifact.

### DS1. Approve the full system visually

Publish one artifact covering Paper, Night and Sepia with measured contrast, every primitive and
state, the components, and every parity and new-feature screen at 390 CSS px and at 1440 CSS px
on desktop, including empty, loading, error and no-JavaScript reading. Approval of a desktop
screen at 1440 covers widths from 1280 to 1440, where the artifact's proposed breakpoints keep the
same columns (Explain becomes a drawer only below 1280). The user approves by viewing it. Record the artifact URL, version and date in this plan, and list any
screen approved later separately. Version 10 is recorded under
[the full-system artifact](#the-full-system-artifact) and awaits review; the screens marked
"Not yet" in [Components and screens](#components-and-screens) must be drawn before approval can
be complete.

**Verify:** the approval record exists; every text and background pair in Paper, Night and Sepia,
each text-bearing cloth colour, every person colour and every page band meets the contrast gate,
with the measurements recorded here; the reading-line keyboard pattern is chosen; the Explore
section names, the role copy and the reading rate are approved. Idea titles and summaries are
approved through analysis AN2.

### DS2. Put tokens and fonts in code

`tokens.css` under `apps/web/src/design/` already drives the review artifact. After DS1 approval
and application step 1's DEC-11 criterion, it holds exactly the approved values, and `fonts/` adds
the self-hosted faces with their licences.

**Verify:** `bun run test:application` runs `apps/web/test/application/design-tokens.test.ts`,
covering contrast for every declared pair in Paper, Night and Sepia, including the cloth, person
and band pairs, and the forbidden-caps scan. Also
`bun run test:browser` runs `apps/web/test/browser/greek-glyphs.e2e.test.ts`: in Chromium and
WebKit the self-hosted Gentium Book Plus renders `ᾶ ῖ ῦ ᾳ ῳ ῥ ἀ ὁ` without fallback
(`document.fonts.check`), and every Greek run carries `lang="grc"`.

### DS3. Build the primitives

Implement them in `apps/web/src/design/primitives/` (proposed), with a private `/design` specimen
route that stays out of public registries, sitemaps and unauthorized production access.

**Verify:** `bun run test:browser` runs `apps/web/test/browser/design-primitives.e2e.test.ts`. It
covers screenshot comparisons per primitive and state in Chromium and WebKit, light and dark, at
390, 1280 and 1440 px. It also covers keyboard paths (Tab order, Enter, Space, Esc, arrows), visible
focus, 44 px targets, and an axe-core scan with no WCAG 2.2 A or AA violations.

### DS4. Build the components and screens

Implement them in `apps/web/src/design/components/` (proposed); application step 3's features
compose them. Screenshot baselines for approved screens change only with a recorded approval added
to this plan. The transliteration lives with the reader feature
(`apps/web/src/features/reader/transliterate.ts`, proposed).

**Verify:** `bun run test:browser` passes `content-rules.e2e.test.ts` and the screen baselines at
390, 1280 and 1440 px, plus the tablet widths once drawn and approved, on rendered consumer routes; `bun run test:application` passes `transliterate.test.ts`; application
step 3's checks pass.

### DS5. Retire the old presentation inside P4

Application step 5 removes its `siteCss()`, `siteJs()` and HTML-assembly Deletions rows once their
proofs pass.

**Verify:** application step 5's checks pass; no route serves `assets/site.css` or
`assets/site.js`; nothing imports `packages/harness/src/site/layout.ts`.

## Deletions

This plan deletes no repository file itself. [application.md](application.md#deletions) owns the
deletion rows; this plan supplies the replacements.

| Application deletion row | Replacement this plan supplies |
| --- | --- |
| Embedded stylesheet: `siteCss()` (`packages/harness/src/site/layout.ts:207`) | Tokens, fonts and components (DS2–DS4) |
| Embedded client script: `siteJs()` (`layout.ts:649`), including the player from line 962 | Player, mini player and read-along components over `apps/web/src/client/audio.ts` |
| HTML assembly and page chrome (`site/index.ts`, `site/layout.ts`) | Screen components that application features compose |

The mockups, screenshots and generators behind the design artifacts live in a session scratch
directory and were never in the repository; nothing in `apps/web/src/design/` may depend on them.

## Open decisions

The [cutover index](README.md) owns status; this table records only this plan's position.

| ID | Decision | This plan's position | Blocks |
| --- | --- | --- | --- |
| DEC-10 | Visual design direction | Bookshelf, decided by the user on 2026-10-26, with Listen's player and read-along on each dialogue's cover colour; full-system approval pending in DS1 | DS1–DS4; application step 3 views |
| DEC-11 | Interactive UI primitive foundation | Native-first, by the user's choice: native elements first; `@foldkit/ui`'s Tabs and Menu only for behaviour they lack, in-page tabs and roving focus; confirmed by application step 1's primitive criterion | DS3; application step 3 interactive views |
| DEC-12 | Typefaces | Gentium Book Plus for Greek, always with `lang="grc"`, by the user's choice; Literata for reading and Inter for UI; self-hosted WOFF2 under the OFL | DS2; application step 3 verification |
| DEC-15 | Key from reading lines to screenplay entries | Needed by [data requirement 1](#data-requirements); read-along and per-line Play from here stay hidden, and a line's actions offer Play chapter, until it exists and the index verifies | Read-along and Play from here only |
| DEC-20 | Curated pages and generated answers | Directed by the user on 2026-10-27, with its timing decided the same day: pages are written ahead, and each shows only once the user has read it. One block catalog and one checker for curated and generated content, drawn by the same components. Writing live per reader waits for its own budget approval | Person, Idea and Explain screens in DS1; application step 3's notes contract |

Deferred, not a cutover decision: an interactive dialogue in which the reader joins a conversation
as an interlocutor, with the Conversation direction as its visual reference. It needs model calls,
a separate product decision and its own design. Nothing in this plan builds toward it. Any such
model output could never enter the corpus or be presented as Plato's text.

## STOP conditions

Stop and report when a screen would ship without recorded visual approval; a design needs data
the corpus lacks and no data requirement records it; idea titles and summaries the user has not
approved would show; curated or generated content would show without passing the block checker
or without a receipt that verifies (DEC-20); a model would be called at reading time before its
budget is approved; a draft recording would
appear accepted; Greek falls back to another face or loses `lang="grc"`; a token pair fails the
contrast gate; or a content-rule test would have to be weakened. Hide a new feature until its data
requirement verifies; never fill it with placeholder data.

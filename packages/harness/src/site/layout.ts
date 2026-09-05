import {
  RECORDING_PROGRESS_SAVE_INTERVAL_MS,
  RECORDING_RESUME_SCHEMA_VERSION,
} from "./player.js";

export function titleCase(value: string) {
  return value
    .split(/[_-]+/u)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

export function pathToRoot(pagePath: string) {
  const depth = pagePath.split("/").length - 1;
  return depth === 0 ? "" : "../".repeat(depth);
}

export function pageLink(fromPage: string, targetPage: string, label: string, hash = "") {
  const prefix = pathToRoot(fromPage);
  return `<a href="${prefix}${targetPage}${hash}">${escapeHtml(label)}</a>`;
}

export function badge(value: string, className = "") {
  return `<span class="badge ${className}">${escapeHtml(value)}</span>`;
}

export function metric(label: string, value: string | number) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

export type NavCounts = {
  dossiers: number;
  clusters: number;
  axes: number;
  concepts: number;
  anchors: number;
  claims: number;
  relations: number;
  readings: number;
};

export function layout(pagePath: string, title: string, body: string, counts: NavCounts) {
  const root = pathToRoot(pagePath);
  const current = (scope: string) => {
    if (scope === "home") return pagePath === "index.html";
    if (scope === "search") return pagePath === "search.html";
    if (scope === "audio") return pagePath === "audio.html" || pagePath.startsWith("audio/");
    if (scope === "dialogues") {
      return pagePath === "dialogues/index.html" || pagePath.startsWith("dialogues/") || pagePath.startsWith("readings/");
    }
    if (scope === "patterns") {
      return (
        pagePath === "patterns/index.html" ||
        ["axes/", "concepts/", "clusters/", "dossiers/", "anchors/", "relations/", "claims/"].some((prefix) =>
          pagePath.startsWith(prefix),
        )
      );
    }
    if (scope === "about") {
      return (
        pagePath === "about.html" ||
        pagePath === "quality.html" ||
        pagePath === "weak-spots.html" ||
        pagePath === "license.html"
      );
    }
    return pagePath === `${scope}.html` || pagePath.startsWith(`${scope}/`);
  };
  const navLink = (target: string, label: string, scope: string) =>
    `<a href="${root}${target}"${current(scope) ? ' aria-current="page"' : ""}>${label}</a>`;
  const panelRow = (target: string, strong: string, span: string, count?: number) =>
    count === undefined || count > 0
      ? `<a href="${root}${target}"><strong>${strong}</strong><span>${span}</span>${count === undefined ? "" : `<b class="n">${count}</b>`}</a>`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — Plato Wiki</title>
  <link rel="stylesheet" href="${root}assets/site.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="${root}index.html"${current("home") ? ' aria-current="page"' : ""}>Plato Wiki</a>
    <nav>
      ${navLink("dialogues/index.html", "Dialogues", "dialogues")}
      <details class="nav-item"${current("patterns") ? " data-current" : ""}>
        <summary aria-label="Patterns menu">Patterns</summary>
        <div class="nav-panel">
          ${panelRow("patterns/index.html", "Overview", "The corpus-level view of every layer")}
          ${panelRow("dossiers/index.html", "Dossiers", "Evidence files per recurring concept", counts.dossiers)}
          ${panelRow("clusters/index.html", "Clusters", "Canonical concept projections", counts.clusters)}
          ${panelRow("axes/index.html", "Axes", "Independent comparison questions", counts.axes)}
          ${panelRow("concepts/index.html", "Concepts", "Ratified ontology concepts", counts.concepts)}
          ${panelRow("anchors/index.html", "Anchors", "Verbal formulae occurrences", counts.anchors)}
          ${panelRow("claims/index.html", "Claims", "Asserted-content records", counts.claims)}
          ${panelRow("relations/index.html", "Relations", "Support and tension links", counts.relations)}
        </div>
      </details>
      ${navLink("audio/index.html", "Listen", "audio")}
      ${navLink("search.html", "Search", "search")}
      <details class="nav-item"${current("about") ? " data-current" : ""}>
        <summary aria-label="About menu">About</summary>
        <div class="nav-panel">
          ${panelRow("about.html", "About this edition", "What the records are and how they are made")}
          ${panelRow("quality.html", "Ontology quality", "Axes, concepts, and memberships")}
          ${panelRow("weak-spots.html", "Weak spots", "Coverage gaps and review issues")}
          ${panelRow("license.html", "License", "CC BY-SA 4.0 and attribution")}
        </div>
      </details>
    </nav>
  </header>
  <main>
${body}
  </main>
  <footer class="site-footer">
    <p>Text: Plato, in the Perseus perseus-grc2 and perseus-eng2 editions,
    under <a href="${root}license.html">CC BY-SA 4.0</a>.
    <a href="${root}about.html">About this edition</a>.</p>
    <p class="dim">Generated deterministically from reviewed records; no scripts leave this page.</p>
  </footer>
  <script src="${root}assets/site.js"></script>
</body>
</html>
`;
}

export function filterStatusText(visible: number, total: number) {
  return visible === 0 ? `No matching records. 0 of ${total} records.` : `${visible} of ${total} records.`;
}

export function idJumpStatusText(status: "initial" | "no-match" | "load-error") {
  if (status === "no-match") return "No matching record ID.";
  if (status === "load-error") return "Record ID index unavailable.";
  return "Enter an exact record ID.";
}

function relativeLuminance(hex: string) {
  const match = /^#([0-9a-f]{6})$/iu.exec(hex);
  if (!match?.[1]) throw new Error(`Expected a six-digit hex color, found ${hex}`);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(match[1]!.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
}

export function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

export function filterControls({
  dialogues,
  axes,
  concepts,
  statuses,
  placeholder = "Search",
}: {
  dialogues?: string[];
  axes?: string[];
  concepts?: string[];
  statuses?: string[];
  placeholder?: string;
}) {
  const options = (values: string[] | undefined) =>
    (values ?? []).map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");

  return `<section class="filters" data-filters>
  ${
    dialogues
      ? `<label>Dialogue<select data-filter="dialogue"><option value="">All</option>${options(dialogues)}</select></label>`
      : ""
  }
  ${
    axes
      ? `<label>Axis<select data-filter="axis"><option value="">All</option>${options(axes)}</select></label>`
      : ""
  }
  ${concepts ? `<label>Concept<select data-filter="concept"><option value="">All</option>${options(concepts)}</select></label>` : ""}
  ${
    statuses
      ? `<label>Status<select data-filter="status"><option value="">All</option>${options(statuses)}</select></label>`
      : ""
  }
  <label class="search">Search<input data-filter-search type="search" placeholder="${escapeHtml(placeholder)}"></label>
  <p class="filter-status" role="status" aria-live="polite" data-filter-status></p>
</section>`;
}

export function siteCss() {
  return `:root {
  color-scheme: light;
  /* Instrument & specimen: cool chrome; serif reserved for source text. */
  --ground: #fbfbfc;
  --panel: #ffffff;
  --ink: #16181d;
  --muted: #5c6470;
  --line: #e3e6ea;
  --accent: #2e63a4;
  --accent-2: #234c80;
  --ok: #2f6f4e;
  --warn: #8a5d1f;
  --bad: #9f3a38;
  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--ground); color: var(--ink); font: 15.5px/1.6 var(--sans); }
a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover, a:active { color: var(--accent-2); }
.v-greek p, .v-english p, .greek-excerpt, blockquote { font-family: var(--serif); }
.loc, .record-anchor .ref, code, .stat-line, td.num { font-family: var(--mono); font-variant-numeric: tabular-nums; }
h1, h2, h3 { font-family: var(--sans); font-weight: 650; letter-spacing: -0.01em; }
.topbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; gap: 24px; align-items: center; padding: 14px 24px; border-bottom: 1px solid var(--line); background: rgba(251, 251, 252, .96); backdrop-filter: blur(8px); }
.brand { color: var(--ink); font-weight: 700; text-decoration: none; white-space: nowrap; }
nav { display: flex; flex-wrap: wrap; gap: 12px; justify-content: end; align-items: center; }
nav > a, .nav-item > summary { color: var(--accent); text-decoration: none; }
nav > a:hover, .nav-item > summary:hover { text-decoration: underline; text-underline-offset: 3px; }
.nav-item { position: relative; margin: 0; }
.nav-item > summary { list-style: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
.nav-item > summary::-webkit-details-marker { display: none; }
.nav-item > summary::after { content: ""; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid currentColor; opacity: .7; }
.nav-item[data-current] > summary { color: var(--ink); font-weight: 650; text-decoration: none; }
.nav-panel { position: absolute; right: 0; top: calc(100% + 8px); min-width: 340px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 8px 24px rgba(22, 24, 29, .09); padding: 6px; display: grid; z-index: 3; }
.nav-panel a { display: grid; grid-template-columns: 1fr auto; align-items: baseline; column-gap: 12px; padding: 8px 10px; border-radius: 4px; color: var(--ink); text-decoration: none; }
.nav-panel a:hover { background: #f1f3f6; }
.nav-panel strong { grid-column: 1; font-size: 13.5px; font-weight: 600; }
.nav-panel span { grid-column: 1; display: block; color: var(--muted); font-size: 12.5px; }
.nav-panel .n { grid-column: 2; grid-row: 1; color: var(--muted); font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 500; }
@media (prefers-reduced-motion: no-preference) {
  .nav-panel { transition: opacity 120ms ease, transform 120ms ease; }
  .nav-item:not([open]) .nav-panel { opacity: 0; transform: translateY(-4px); pointer-events: none; }
}
.site-footer { width: min(1380px, 100%); margin: 40px auto 0; padding: 18px 24px 40px; border-top: 1px solid var(--line); color: var(--muted); font-family: var(--sans); font-size: 13px; }
.site-footer p { margin: 4px 0; }
main { width: min(1380px, 100%); margin: 0 auto; padding: 28px 24px 56px; }
.hero { margin-bottom: 28px; }
.hero h1 { margin: 0 0 18px; font-size: 32px; line-height: 1.08; letter-spacing: -0.01em; }
.hero.compact h1 { font-size: 30px; }
.section-lede { max-width: 70ch; margin: 0 0 4px; color: var(--muted); font-size: 14px; }
.pat-rows { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); overflow: hidden; }
.pat-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: start; padding: 13px 18px 12px; border-top: 1px solid var(--line); }
.pat-row:first-child { border-top: 0; }
.pat-main h3 { margin: 0; font: 650 14.5px/1.4 var(--sans); }
.pat-main h3 a { text-decoration: none; }
.pat-main h3 a:hover { text-decoration: underline; }
.pat-liner { margin: 1px 0 0; color: var(--muted); font-size: 12.5px; max-width: 72ch; }
.pat-where { margin: 3px 0 0; font-size: 12.5px; color: var(--ink); }
.pat-where a { text-decoration: none; font-weight: 600; }
.pat-where a:hover { text-decoration: underline; }
.pat-row > .n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 500; font-size: 12px; color: var(--muted); padding-top: 3px; }
.tp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 14px 0 12px; }
.tp { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); padding: 16px 18px; }
.tp-pair { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.tp-glyph { position: absolute; left: 50%; top: 20px; transform: translateX(-50%); color: var(--muted); font-size: 15px; }
.tp-src { margin: 0 0 6px; font: 650 13px/1.3 var(--sans); }
.tp-src a { text-decoration: none; color: var(--ink); }
.tp-src a:hover { text-decoration: underline; color: var(--accent); }
.tp-src .ref { font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 500; font-size: 11.5px; color: var(--muted); margin-left: 4px; }
.tp-claim { margin: 0; font-size: 13px; line-height: 1.5; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
.tp-limits { margin: 12px 0 0; padding-top: 10px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.layers { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); overflow: hidden; }
.layer-row { display: grid; grid-template-columns: 150px minmax(0, 1fr) auto; gap: 16px; align-items: baseline; padding: 12px 16px; border-top: 1px solid var(--line); }
.layer-row:first-child { border-top: 0; }
.layer-row a { font-weight: 600; font-size: 13.5px; text-decoration: none; }
.layer-row a:hover { text-decoration: underline; }
.layer-desc { color: var(--muted); font-size: 12.5px; line-height: 1.5; max-width: 88ch; }
.layer-row .n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 500; font-size: 12px; color: var(--muted); }
.dlg-ledger { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); overflow: hidden; }
.dlg-row { padding: 15px 22px 14px; border-top: 1px solid var(--line); display: grid; gap: 4px; }
.dlg-row:first-child { border-top: 0; }
.dlg-row.is-hidden { display: none; }
.dlg-head { display: flex; align-items: baseline; gap: 12px; }
.dlg-head > a { font: 650 16.5px/1.25 var(--sans); text-decoration: none; }
.dlg-head > a:hover { text-decoration: underline; }
.dlg-read { margin-left: auto; }
.dlg-read a { font: 600 13.5px/1 var(--sans); text-decoration: none; white-space: nowrap; }
.dlg-read a:hover { text-decoration: underline; }
.dlg-epi { margin: 0; font-size: 13.5px; color: var(--muted); max-width: 84ch; }
.tags { display: flex; flex-wrap: nowrap; gap: 6px; margin: 3px 0 0; max-width: 100%; overflow-x: auto; scrollbar-width: none; }
.tags::-webkit-scrollbar { display: none; }
.tag { flex-shrink: 0; font: 500 12px/1.2 var(--sans); color: var(--ink); text-decoration: none; border: 1px solid var(--line); border-radius: 999px; background: #f1f3f6; padding: 4px 10px; }
.tag:hover { border-color: var(--accent); color: var(--accent); }
.tag.more { background: transparent; color: var(--accent); font-weight: 600; font-variant-numeric: tabular-nums; }
.ledger-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 18px; margin: 14px 0 12px; }
.ledger-controls .dlg-order { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: 11.5px; text-transform: uppercase; letter-spacing: .05em; }
.ledger-controls .chip { width: auto; font: 600 12.5px/1 var(--sans); letter-spacing: 0; text-transform: none; border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; color: var(--accent); background: var(--panel); cursor: pointer; }
.ledger-controls .chip.is-on { background: var(--accent); border-color: var(--accent); color: #fff; }
.ledger-controls .chip:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.ledger-controls .search { flex: 0 1 260px; }
.ledger-controls .filter-status { flex-basis: 100%; margin: 0; color: var(--muted); }
@media (max-width: 720px) { .tp-pair { grid-template-columns: 1fr; gap: 12px; } .tp-glyph { display: none; } .layer-row { grid-template-columns: 1fr auto; } .layer-desc { grid-column: 1 / -1; } }
.epigraph { font-family: var(--sans); font-size: 17px; line-height: 1.5; color: var(--ink); max-width: 60ch; margin: 4px 0 8px; }
.structure-strip { margin: 20px 0; }
.structure-strip svg { width: 100%; height: auto; display: block; }
.structure-strip a:focus-visible rect { stroke: var(--ink); stroke-width: 2; }
.structure-strip figcaption { color: var(--muted); font-size: 12.5px; margin-top: 6px; }
.strip-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; font-family: var(--sans); font-size: 12px; color: var(--muted); margin: 8px 0 0; }
.strip-legend .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
.doors { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 24px 0; align-items: start; }
.door { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 16px; }
.door svg { height: 44px; display: block; margin-bottom: 10px; }
.door h2 { margin: 0 0 4px; font-size: 15.5px; }
.door h2 a { color: var(--accent); text-decoration: none; }
.door h2 a:hover { text-decoration: underline; }
.door p { margin: 0; font-size: 14px; color: var(--ink); }
/* --- Dialogue pages v3.3 (the dialogue-pages v3.3 rollout): overview + records page ------------- */
.hero-lede { font-family: var(--sans); font-size: 15.5px; line-height: 1.6; color: var(--ink); max-width: 72ch; margin: 4px 0 8px; }
.crumb { margin: 0 0 6px; font-size: 14px; }
.prose-note { max-width: 78ch; margin: 0 0 12px; color: var(--ink); font-size: 14px; line-height: 1.6; }
.more-link { margin: 12px 0 0; font-size: 14px; }
/* Voices: share-of-text rows, validated speaker palette, fixed slot order. */
.voice-rows { margin: 14px 0 0; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); overflow: hidden; }
.voice-row { display: grid; grid-template-columns: 210px minmax(0, 1fr) 92px 64px; gap: 18px; align-items: center; padding: 10px 16px; border-top: 1px solid var(--line); }
.voice-row:first-child { border-top: 0; }
.voice-name { font-size: 14px; min-width: 0; }
.voice-name b { font-weight: 700; }
.voice-name span { color: var(--muted); }
.voice-track { height: 10px; border-radius: 3px; background: #f1f3f6; position: relative; }
.voice-fill { position: absolute; inset: 0 auto 0 0; border-radius: 3px; min-width: 3px; }
.voice-row .n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 12px; color: var(--muted); text-align: right; }
@media (max-width: 620px) {
  .voice-row { grid-template-columns: 130px minmax(0, 1fr) 58px; gap: 12px; }
  .voice-row .voice-turns { display: none; }
}
/* The course of the dialogue: two open columns, no card; the second half folds
   below 860px. Ships open, so no-JS narrow viewports show everything. */
.toc-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 0 72px; margin-top: 6px; }
.toc-col { margin: 0; padding: 0; list-style: none; }
.toc-col li { border-bottom: 1px solid #eef0f3; }
.toc-col li:last-child { border-bottom: 0; }
.toc-col a { display: flex; align-items: baseline; gap: 14px; padding: 7px 0; text-decoration: none; }
.toc-col .t { flex: 1; font-size: 13.5px; line-height: 1.45; color: var(--ink); }
.toc-col a:hover .t { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.toc-col .loc { font-size: 11.5px; color: var(--muted); white-space: nowrap; }
.toc-more { display: contents; }
.toc-more > summary { display: none; }
@media (max-width: 860px) {
  .toc-wrap { grid-template-columns: 1fr; }
  .toc-more { display: block; }
  .toc-more > summary { display: list-item; padding: 9px 0 2px; font: 600 13px/1.3 var(--sans); color: var(--accent); cursor: pointer; }
}
/* Ledger row grammar — shared by Families, the layer directory, corpus
   partners, and verbal formulae. Head line with the figure right, description
   or locator chips below. */
.lgr { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); overflow: hidden; }
.lgr-row { padding: 13px 22px 12px; border-top: 1px solid var(--line); display: grid; gap: 3px; }
.lgr-row:first-child { border-top: 0; }
.lgr-head { display: flex; align-items: baseline; gap: 12px; }
.lgr-head > .lgr-name { font: 650 15.5px/1.3 var(--sans); text-decoration: none; }
.lgr-head > .lgr-name:hover { text-decoration: underline; }
.lgr-act { margin-left: auto; font: 600 13px/1.2 var(--sans); font-variant-numeric: tabular-nums; text-decoration: none; white-space: nowrap; }
.lgr-act:hover { text-decoration: underline; }
.lgr-n { margin-left: auto; font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 12px; color: var(--muted); }
.lgr-epi { margin: 0; font-size: 13.5px; color: var(--muted); max-width: 84ch; }
.lgr-row .tags { flex-wrap: nowrap; margin-top: 5px; max-width: 100%; overflow-x: auto; scrollbar-width: none; }
.lgr-row .tags::-webkit-scrollbar { display: none; }
.lgr-fold { margin: 0; border: 1px solid var(--line); border-top: 0; border-radius: 0 0 10px 10px; background: var(--panel); }
.lgr-fold > summary { padding: 11px 22px; font: 600 13px/1.3 var(--sans); color: var(--accent); cursor: pointer; }
.lgr-fold .lgr-row { border-top: 1px solid var(--line); }
/* Specimen card grid on the records page. */
.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
/* The record map: build-time static SVG on one Stephanus axis. */
.lane-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 14px 0 12px; }
.lane-chips .chips-label { color: var(--muted); font: 600 11px/1 var(--sans); text-transform: uppercase; letter-spacing: .05em; margin-right: 4px; }
.map-chip { width: auto; font: 600 12.5px/1 var(--sans); border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; color: var(--accent); background: var(--panel); cursor: pointer; display: inline-flex; gap: 7px; align-items: center; }
.map-chip .n { font-size: 11px; font-weight: 500; color: var(--muted); }
.map-chip.is-on { background: var(--accent); border-color: var(--accent); color: #fff; }
.map-chip.is-on .n { color: rgba(255, 255, 255, .75); }
.map-chip:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.map-fig { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); padding: 18px 18px 12px; margin: 0; }
.map-fig svg { width: 100%; height: auto; display: block; }
.map-status { margin: 8px 0 0; color: var(--muted); font-size: 12.5px; }
.map-caption { margin: 10px 0 0; color: var(--muted); font-size: 12.5px; max-width: 96ch; }
.map-withheld { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); padding: 16px 18px; color: var(--ink); font-size: 14px; }
.map-mark { cursor: pointer; }
.map-mark:focus { outline: none; }
.map-mark:focus-visible { stroke: var(--ink); stroke-width: 1.5; }
.map-tip { position: fixed; z-index: 50; max-width: 380px; background: var(--panel); color: var(--ink); border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 10px 30px rgba(22, 24, 29, .16); padding: 10px 12px; font: 13px/1.5 var(--sans); pointer-events: none; display: none; }
.map-tip .t-ref { font: 500 11.5px/1.6 var(--mono); color: var(--muted); margin: 0 0 2px; }
.map-tip .t-name { font-weight: 650; margin: 0; }
.map-tip .t-lead { margin: 4px 0 0; color: var(--muted); font-size: 12.5px; }
/* Marker locator chips — corpus partners and verbal formulae. */
.mk { display: inline-block; font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 11.5px; color: var(--accent); border: 1px solid var(--line); border-radius: 4px; padding: 2px 6px; margin: 0 4px 2px 0; text-decoration: none; background: #f8f9fb; }
.mk:hover { border-color: var(--accent); }
.home-portals { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 32px 0 40px; }
.home-portal { display: grid; min-width: 0; grid-template-rows: 112px auto; place-items: center; gap: 8px; padding: 17px 18px 18px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--accent); text-decoration: none; }
.home-portal svg { width: min(100%, 180px); height: 104px; display: block; }
.home-portal span { font: 650 15px/1.25 var(--sans); text-align: center; white-space: nowrap; }
.home-portal:hover { background: #f6f7f9; }
.home-portal:hover span { text-decoration: underline; text-underline-offset: 3px; }
.home-portal:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; }
@media (max-width: 900px) {
  .home-portals { grid-template-columns: 1fr; margin-top: 28px; }
  .home-portal { grid-template-rows: 98px auto; gap: 5px; padding: 12px 16px 14px; }
  .home-portal svg { width: 166px; height: 96px; }
}
.lede { max-width: 62ch; font-size: 17px; line-height: 1.55; color: var(--ink); }
.featured-reading { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, auto); gap: 28px; align-items: center; margin: 32px 0; padding: 22px 24px; border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 8px; background: var(--panel); }
.featured-reading-kicker { margin: 0 0 5px; color: var(--muted); font: 600 11px/1.3 var(--mono); letter-spacing: .08em; text-transform: uppercase; }
.featured-reading h2 { margin: 0 0 8px; font-size: 24px; }
.featured-reading-summary { max-width: 68ch; margin: 0; line-height: 1.5; }
.featured-reading-action { display: grid; gap: 7px; justify-items: end; text-align: right; }
.featured-reading-action > a { font-weight: 650; }
.featured-reading-status { max-width: 36ch; margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.4; }
@media (max-width: 720px) {
  .featured-reading { grid-template-columns: 1fr; gap: 16px; padding: 20px; }
  .featured-reading-action { justify-items: start; text-align: left; }
}
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.metric { border: 1px solid var(--line); background: var(--panel); padding: 14px; border-radius: 8px; }
.metric span { display: block; color: var(--muted); font-size: 12px; text-transform: uppercase; }
.metric strong { display: block; margin-top: 2px; font-size: 24px; }
.split { display: grid; grid-template-columns: minmax(240px, .8fr) minmax(0, 1.2fr); gap: 24px; align-items: start; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; align-items: start; }
.panel { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 16px; }
h2 { margin: 24px 0 12px; font-size: 20px; }
h3 { margin: 18px 0 10px; font-size: 16px; }
.link-list { margin: 0; padding: 0; list-style: none; border: 1px solid var(--line); background: var(--panel); border-radius: 8px; overflow: hidden; }
.link-list li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 12px; border-top: 1px solid var(--line); }
.link-list li:first-child { border-top: 0; }
.link-list .n { font-family: var(--mono); font-variant-numeric: tabular-nums; color: var(--muted); }
.link-list .dim { margin-left: 6px; }
table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
caption { padding: 0 0 8px; color: var(--muted); text-align: left; font-size: 13px; }
th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
th { color: var(--muted); font-size: 12px; text-transform: uppercase; background: #f1f3f6; }
tr:last-child td { border-bottom: 0; }
.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 12px 0 16px; }
.corpus-search { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 16px; }
.corpus-search .search { grid-column: span 2; }
.filter-status { grid-column: 1 / -1; margin: 0; color: var(--muted); }
label { display: grid; gap: 5px; color: var(--muted); font-size: 12px; text-transform: uppercase; }
select, input, button { width: 100%; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); color: var(--ink); padding: 9px 10px; font: inherit; }
button { cursor: pointer; background: #f1f3f6; }
.records { display: grid; gap: 14px; }
.search-results { display: grid; gap: 12px; padding: 0; list-style: none; }
.search-result h2, .search-result p { margin: 0; }
.search-result .search-meta { margin-top: 5px; color: var(--muted); }
.part-nav { display: flex; gap: 10px; align-items: center; margin: 12px 0; }
.record { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 16px; scroll-margin-top: 78px; }
.record-head { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 12px; }
.record-head p, .record-head h2, .record-head h3 { margin: 0; }
.record-heading { font-size: 15px; line-height: 1.5; }
.record-id { font-weight: 700; }
.record-context { display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
.record-eyebrow { margin: 0; font-family: var(--sans); font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.record-eyebrow .ref { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.record-anchor { color: inherit; text-decoration: none; }
.record-anchor:hover { text-decoration: underline; }
.record-lead { font-family: var(--sans); font-size: 16px; line-height: 1.55; font-weight: 500; color: var(--ink); margin: 6px 0 10px; }
.stance-line { color: var(--muted); }
.badge-axis { background: transparent; border: 1px solid var(--line); color: var(--muted); text-decoration: none; }
.badge-axis:hover { text-decoration: underline; }
.source-open { width: auto; border: 0; background: transparent; color: var(--accent); font: inherit; font-size: 12.5px; padding: 2px 0; cursor: pointer; }
.source-open:hover { text-decoration: underline; }
.source-dialog { border: 1px solid var(--line); border-radius: 6px; padding: 18px 20px; max-width: 640px; width: calc(100vw - 40px); color: var(--ink); background: var(--panel); }
.source-dialog::backdrop { background: rgba(22, 24, 29, .35); }
.source-dialog .greek-excerpt { font-family: var(--serif); font-size: 17px; line-height: 1.7; margin: 0 0 12px; padding-left: 12px; border-left: 1px solid var(--line); }
.source-dialog .dialog-ref { font-family: var(--mono); font-size: 12.5px; color: var(--muted); }
.source-dialog p { margin: 6px 0; }
.dialog-close { width: auto; margin-top: 12px; }
.badges { display: flex; flex-wrap: wrap; justify-content: end; gap: 6px; }
.badge { display: inline-flex; align-items: center; min-height: 24px; padding: 2px 8px; border: 1px solid var(--line); border-radius: 999px; background: #f1f3f6; color: var(--ink); font-size: 12px; }
.status-accepted, .status-left_standing { border-color: #b7d1c0; background: #e8f3ec; color: var(--ok); }
.status-unreviewed, .status-needs_split, .status-posed_only, .status-unresolved_challenge { border-color: #dfc893; background: #fbf3dd; color: var(--warn); }
.status-rejected, .status-refuted, .status-withdrawn { border-color: #e0aaa7; background: #fbebe9; color: var(--bad); }
.meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin: 0 0 12px; }
.meta div { border: 1px solid var(--line); border-radius: 6px; padding: 8px; min-width: 0; }
dt { color: var(--muted); font-size: 12px; text-transform: uppercase; }
dd { margin: 0; overflow-wrap: anywhere; }
.observation, .claim-content { font-weight: 650; }
.terms { display: flex; flex-wrap: wrap; gap: 6px; }
details { margin-top: 10px; }
summary { cursor: pointer; color: var(--accent-2); }
pre { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 360px; overflow: auto; padding: 12px; border: 1px solid var(--line); border-radius: 6px; background: #f1f3f6; }
.source-list { margin: 0; padding-left: 20px; }
.source-list li { margin: 8px 0; }
.source-list span { color: var(--muted); margin-left: 6px; }
.dim { color: var(--muted); }
.zero { color: var(--muted); background: #f1f3f6; }
.zero a { color: var(--accent); font-weight: 500; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; overflow-wrap: anywhere; }
.is-hidden { display: none; }
/* Reading toolbar: one slim row — language select, layer toggles, marks key. */
.reading-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 26px; margin: 0 0 18px; padding: 9px 2px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.reading-tools label { display: inline-flex; flex-direction: row; align-items: center; gap: 7px; text-transform: none; color: var(--ink); font-size: 13.5px; }
.reading-tools select { width: auto; padding: 4px 8px; font-size: 13.5px; }
.reading-tools input { width: auto; }
.tool-select { color: var(--muted); }
.marks-key { margin: 0 0 0 auto; position: relative; }
.marks-key > summary { list-style: none; color: var(--accent); font-size: 13px; cursor: pointer; }
.marks-key > summary::-webkit-details-marker { display: none; }
.marks-key > summary::after { content: ""; display: inline-block; margin-left: 5px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid currentColor; opacity: .7; vertical-align: 1px; }
.marks-key-panel { position: absolute; right: 0; top: calc(100% + 8px); z-index: 3; width: 350px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 8px 24px rgba(22, 24, 29, .09); padding: 12px 14px; display: grid; gap: 8px; font-size: 12.5px; }
.marks-key-panel p { margin: 0; display: flex; gap: 9px; align-items: baseline; }
.marks-key-panel .mark { flex: none; transform: translateY(1px); }
.key-sign { flex: none; width: 9px; font-family: var(--serif); line-height: 1; text-align: center; }
/* Reading units: the section commentary heads the unit as integrated prose. */
/* Reading page (the two-track reading layout): two centered tracks. Every verse row shares one
   grid so the columns align; the whole track group centers, and with both
   layers off the margin track collapses and the text re-centers. The page
   wrapper is the container the mobile stacking queries against, and every
   band (hero, Listen, toolbar, reading) shares the centered measure. */
.reading-page { container-type: inline-size; }
.reading-page > * { max-width: 1116px; margin-inline: auto; }
.commentary-author { text-transform: uppercase; letter-spacing: .06em; font-size: 10.5px; }
.reading .cites { margin: 8px 0 0; font-size: 13px; }
.reading .cites > summary { color: var(--muted); }
.reading .cites > summary:hover { color: var(--accent-2); }
.cite-list { margin: 6px 0 0; padding-left: 18px; }
.cite-list li { margin: 3px 0; }
.crossrefs { margin-top: 8px; }
/* Verses: one paragraph per speaker turn; rail left, source text center,
   margin entries right of a continuous hairline. Row gaps stay zero so the
   hairline runs unbroken; cells carry the vertical padding. */
.unit { margin: 0; }
.unit + .unit { margin-top: 26px; }
.verse { display: grid; grid-template-columns: 72px minmax(0, 640px) minmax(250px, 340px); column-gap: 32px; justify-content: center; }
.reading.commentary-off.marks-off .verse { grid-template-columns: 72px minmax(0, 640px); }
.reading.commentary-off.marks-off .v-notes { display: none; }
.reading.commentary-off.marks-off.lang-both .verse { grid-template-columns: 72px minmax(0, 1012px); }
.reading.commentary-off.marks-off.lang-both .v-text { display: grid; grid-template-columns: 1fr 1fr; gap: 0 34px; }
.reading.lang-english .v-greek { display: none; }
.reading.lang-greek .v-english { display: none; }
.reading.lang-both .v-greek { margin-bottom: 8px; }
.reading.commentary-off.marks-off.lang-both .v-greek { margin-bottom: 0; }
.v-text { padding: 10px 0; min-width: 0; }
.v-greek p, .v-english p { margin: 0 0 9px; font-size: 17px; line-height: 1.66; }
.v-greek p:last-child, .v-english p:last-child { margin-bottom: 0; }
.v-english .speaker { font: 600 11.5px var(--sans); text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-right: 7px; }
.v-greek .speaker { font-weight: 700; }
.milestone { font: 500 10.5px var(--mono); font-variant-numeric: tabular-nums; color: var(--muted); text-decoration: none; vertical-align: 0.4em; margin: 0 4px 0 2px; }
.milestone:hover, .milestone:focus-visible { color: var(--accent); }
.v-margin { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; text-align: right; padding-top: 14px; }
.loc-slot { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; scroll-margin-top: 78px; }
.loc-slot .loc { font-size: 11px; color: var(--muted); text-decoration: none; }
.loc-slot .loc:hover { color: var(--accent); }
.loc-slot:target .loc { color: var(--accent); font-weight: 700; }
.verse:has(.loc-slot:target) { background: #eef3f9; }
.mark { display: block; width: 9px; height: 9px; border-radius: 2px; text-decoration: none; }
.mark-observation { background: var(--accent); }
.mark-claim { border: 1.5px solid var(--accent); background: transparent; }
.mark-commentary { width: 7px; height: 7px; border-radius: 1.5px; background: color-mix(in srgb, var(--muted) 60%, var(--line)); transform: rotate(45deg); }
.mark:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.mark-sign { width: auto; height: auto; font-family: var(--serif); font-size: 13px; color: var(--ink); line-height: 1; }
/* Margin entries: one pattern for every item — locator line, clickable title
   row, body in a floating card so the dialogue column never reflows. Native
   details name grouping keeps one entry open per unit; no scripts. */
.v-notes { border-left: 1px solid var(--line); padding: 12px 0 12px 24px; min-width: 0; }
.sec-head { margin: 0 0 16px; }
.sec-mobile { display: none; }
.slot-group { margin: 0 0 14px; }
.slot-group:last-child { margin-bottom: 0; }
.slot-loc { margin: 0 0 4px; }
.slot-loc a { font: 500 10.5px var(--mono); font-variant-numeric: tabular-nums; color: var(--muted); text-decoration: none; }
.slot-loc a:hover { color: var(--accent); }
.entry { margin: 0 0 10px; position: relative; }
.entry:last-child { margin-bottom: 0; }
.entry[open] { z-index: 6; }
.entry > summary { display: flex; align-items: baseline; gap: 8px; list-style: none; cursor: pointer; font: 550 13px/1.45 var(--sans); color: var(--ink); }
.entry > summary::-webkit-details-marker { display: none; }
.entry > summary:hover .entry-label, .entry[open] > summary .entry-label { color: var(--accent-2); }
.entry > summary .mark { flex: none; transform: translateY(-1px); }
.entry > summary .mark-commentary, .marks-key-panel .mark-commentary { transform: translateY(-1px) rotate(45deg); }
.section-label { font-size: 14px; font-weight: 640; }
.entry-label { min-width: 0; }
.entry-ref { margin-left: auto; flex: none; font: 400 11px var(--mono); font-variant-numeric: tabular-nums; color: var(--muted); }
.entry[open] > .entry-body { position: absolute; left: 0; top: calc(100% + 5px); width: 100%; z-index: 6; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 10px 26px rgba(22, 24, 29, .12); padding: 9px 11px 8px; }
.entry-body p { margin: 0 0 6px; font-size: 13px; line-height: 1.5; }
.entry-body .entry-act { font-size: 12px; margin-bottom: 0; }
.entry-attr { margin: 8px 0 0; font-size: 11px; color: var(--muted); }
.entry-more { display: inline-block; font-size: 12px; margin: 2px 0 0; }
.entry.apparatus > summary .mark-sign, .entry.apparatus .entry-body { font-family: var(--serif); }
.entry.apparatus .entry-body p { font-size: 14px; }
/* Layer toggles own their groups: Commentary owns section heads and for-comm
   notes, Margin records owns record groups, the apparatus lane always shows. */
.reading.commentary-off .sec-head, .reading.commentary-off .slot-group.for-comm { display: none; }
.reading.marks-off .slot-group:not(.for-comm):not(.for-app) { display: none; }
/* Mobile: the hairline rotates — margin content stacks around its verse as
   left-bordered blocks, locators sit inline above the turn, and floating
   cards return to the flow. */
@container (max-width: 720px) {
  .reading .verse, .reading.commentary-off.marks-off .verse, .reading.commentary-off.marks-off.lang-both .verse { grid-template-columns: 1fr; }
  .v-margin { flex-direction: row; flex-wrap: wrap; align-items: baseline; gap: 12px; padding: 12px 0 0; text-align: left; }
  .loc-slot { flex-direction: row; align-items: baseline; gap: 5px; }
  .v-text { padding: 4px 0 8px; }
  .reading.commentary-off.marks-off.lang-both .v-text { display: block; }
  .v-notes { border-left: 0; padding: 0 0 8px; }
  .sec-desktop { display: none; }
  .sec-mobile { display: block; border-left: 2px solid var(--line); padding: 2px 0 2px 12px; margin: 18px 0 4px; }
  .slot-group { border-left: 2px solid var(--line); padding-left: 12px; }
  .entry[open] { z-index: auto; }
  .entry[open] > .entry-body { position: static; width: auto; border: 0; box-shadow: none; border-radius: 0; background: transparent; padding: 5px 0 2px 17px; }
}
/* Listen panel: compact heading row with inline audio, chapters behind a fold. */
.recording-player { margin: 0 0 24px; padding: 12px 16px; }
.recording-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px 20px; flex-wrap: wrap; }
.recording-title { display: flex; align-items: center; gap: 10px; }
.recording-title h2 { margin: 0; font-size: 17px; }
.recording-player audio { flex: 1 1 280px; max-width: 520px; height: 40px; }
.recording-status { margin: 6px 0 0; color: var(--muted); font-size: 12.5px; }
.recording-review-notice { margin: 4px 0 0; color: var(--warn); font-size: 12.5px; }
.recording-unavailable { margin: 0 0 20px; font-size: 13px; }
.badge.status-review-candidate { border-color: #dfc893; background: #fbf3dd; color: var(--warn); }
.chapter-fold { margin-top: 6px; }
.chapter-fold > summary { font-size: 13px; color: var(--accent-2); }
.chapter-fold .n { margin-left: 8px; font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 500; color: var(--muted); }
.recording-chapters { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin-top: 10px; }
.chapter-button { display: flex; justify-content: space-between; gap: 12px; text-align: left; }
.chapter-button time { color: var(--muted); font-variant-numeric: tabular-nums; }
.chapter-button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status-available { color: var(--ok); }
.status-review-candidate { color: var(--warn); }
.status-unavailable { color: var(--muted); }
.recording-catalog-action { display: grid; gap: 3px; }
.recording-catalog-action .dim { font-size: 12px; }
@media (max-width: 760px) {
  .topbar, .record-head { align-items: stretch; flex-direction: column; }
  .split, .filters { grid-template-columns: 1fr; }
  .recording-player audio { width: 100%; max-width: 100%; }
  .marks-key { margin-left: 0; }
  .marks-key-panel { position: static; width: auto; box-shadow: none; }
  th, td { padding: 8px; }
  .nav-panel { position: static; min-width: 0; box-shadow: none; }
  .nav-item:not([open]) .nav-panel { opacity: 1; transform: none; pointer-events: auto; }
}`;
}

export function siteJs() {
  return `const navItems = [...(document.querySelectorAll?.("nav .nav-item") || [])];
if (navItems.length && document.addEventListener) {
  for (const item of navItems) {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      for (const other of navItems) {
        if (other !== item) other.open = false;
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = navItems.find((item) => item.open);
    if (open) {
      open.open = false;
      open.querySelector("summary")?.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && event.target.closest("nav")) return;
    for (const item of navItems) item.open = false;
  });
}

const sourceOpeners = [...(document.querySelectorAll?.("[data-source-open]") || [])];
if (sourceOpeners.length && document.getElementById) {
  for (const opener of sourceOpeners) {
    const dialog = document.getElementById(opener.dataset.sourceOpen);
    if (!dialog || typeof dialog.showModal !== "function") continue;
    opener.addEventListener("click", () => dialog.showModal());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    const closeButton = dialog.querySelector("[data-dialog-close]");
    if (closeButton) closeButton.addEventListener("click", () => dialog.close());
  }
}

const reading = document.querySelector?.("[data-reading]");
if (reading) {
  const KEY_LANG = "plato-reading-language";
  const langs = ["english", "greek", "both"];
  const setLang = (value) => {
    if (!langs.includes(value)) return;
    reading.classList.remove("lang-english", "lang-greek", "lang-both");
    reading.classList.add("lang-" + value);
  };
  const picker = document.querySelector("[data-language-picker]");
  if (picker) {
    let storedLang = null;
    try { storedLang = localStorage.getItem(KEY_LANG); } catch { /* storage is optional */ }
    if (storedLang && langs.includes(storedLang)) {
      setLang(storedLang);
      picker.value = storedLang;
    }
    picker.addEventListener("change", () => {
      const value = picker.value;
      if (!langs.includes(value)) return;
      setLang(value);
      try { localStorage.setItem(KEY_LANG, value); } catch { /* storage is optional */ }
    });
  }
  const layerToggles = [
    { control: document.querySelector("[data-margin-toggle]"), key: "plato-reading-margin", className: "marks-off" },
    { control: document.querySelector("[data-commentary-toggle]"), key: "plato-reading-commentary", className: "commentary-off" },
  ];
  for (const { control, key, className } of layerToggles) {
    if (!control) continue;
    let stored = null;
    try { stored = localStorage.getItem(key); } catch { /* storage is optional */ }
    if (stored === "off") { reading.classList.add(className); control.checked = false; }
    control.addEventListener("change", () => {
      reading.classList.toggle(className, !control.checked);
      try { localStorage.setItem(key, control.checked ? "on" : "off"); } catch { /* storage is optional */ }
    });
  }
}

const filters = document.querySelector("[data-filters]");
if (filters) {
  const controls = [...filters.querySelectorAll("[data-filter]")];
  const minimumControls = [...filters.querySelectorAll("[data-filter-min]")];
  const search = filters.querySelector("[data-filter-search]");
  const output = filters.querySelector("[data-filter-status]");
  const items = [...document.querySelectorAll(".filter-item, .record")];
  const total = items.length;
  const apply = () => {
    const wanted = Object.fromEntries(controls.map((control) => [control.dataset.filter, control.value]));
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    for (const item of items) {
      const matchesControls = Object.entries(wanted).every(([key, value]) =>
        !value || String(item.dataset[key] || "").split(" ").includes(value)
      );
      const matchesMinimums = minimumControls.every((control) => {
        const minimum = Number(control.value || 0);
        const actual = Number(item.dataset[control.dataset.filterMin] || 0);
        return Number.isFinite(minimum) && Number.isFinite(actual) && actual >= minimum;
      });
      const haystack = item.dataset.search || item.textContent.toLowerCase();
      const matches = matchesControls && matchesMinimums && (query.length === 0 || haystack.includes(query));
      item.classList.toggle("is-hidden", !matches);
      if (matches) visible += 1;
    }
    if (output) {
      if (visible === 0) output.textContent = "No matching records. 0 of " + total + " records.";
      else output.textContent = visible + " of " + total + " records.";
    }
  };
  filters.addEventListener("input", apply);
  filters.addEventListener("change", apply);
  apply();
}

const ledger = document.querySelector("[data-ledger]");
if (ledger) {
  const sortButtons = [...document.querySelectorAll("[data-sort]")];
  for (const button of sortButtons) {
    button.addEventListener("click", () => {
      const key = button.dataset.sort;
      const rows = [...ledger.querySelectorAll(".dlg-row")];
      rows.sort((a, b) => {
        if (key === "title") return a.dataset.title < b.dataset.title ? -1 : a.dataset.title > b.dataset.title ? 1 : 0;
        return Number(b.dataset[key] || 0) - Number(a.dataset[key] || 0);
      });
      for (const row of rows) ledger.append(row);
      for (const other of sortButtons) {
        other.classList.toggle("is-on", other === button);
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      }
    });
  }
}

const fetchJson = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Index request failed");
  return response.json();
};
const validDescriptor = (descriptor) => descriptor &&
  typeof descriptor.kind === "string" &&
  typeof descriptor.scope === "string" &&
  typeof descriptor.path === "string" &&
  Number.isSafeInteger(descriptor.count) && descriptor.count > 0;

const jumpForm = document.querySelector("[data-id-jump]");
if (jumpForm) {
  const input = jumpForm.querySelector("input");
  const output = jumpForm.querySelector("[data-id-jump-status]");
  let manifestPromise;
  const loadManifest = () => manifestPromise ??= fetchJson(
    jumpForm.dataset.indexManifest || "assets/index/manifest.json"
  ).then((manifest) => {
    if (manifest?.version !== 1 || !Array.isArray(manifest.shards) || !manifest.shards.every(
      (shard) => validDescriptor(shard) && typeof shard.firstId === "string" && typeof shard.lastId === "string"
    )) throw new Error("Malformed exact-ID manifest");
    return manifest;
  });
  jumpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = (input?.value || "").trim();
    if (!id) {
      if (output) output.textContent = "${idJumpStatusText("initial")}";
      return;
    }
    try {
      const manifest = await loadManifest();
      const descriptors = manifest.shards.filter((shard) => shard.firstId <= id && id <= shard.lastId);
      if (descriptors.length === 0) {
        if (output) output.textContent = "${idJumpStatusText("no-match")}";
        return;
      }
      const shards = await Promise.all(descriptors.map(async (descriptor) => {
        const shard = await fetchJson(descriptor.path);
        if (shard?.version !== 1 || shard.kind !== descriptor.kind || shard.scope !== descriptor.scope ||
          !Array.isArray(shard.records) || shard.records.length !== descriptor.count ||
          !shard.records.every((record) => typeof record.id === "string" && typeof record.target === "string")) {
          throw new Error("Malformed exact-ID shard");
        }
        return shard;
      }));
      const matches = shards.flatMap((shard) => shard.records).filter((record) => record.id === id);
      if (matches.length > 1) throw new Error("Duplicate exact ID");
      if (matches[0]) window.location.href = matches[0].target;
      else if (output) output.textContent = "${idJumpStatusText("no-match")}";
    } catch {
      if (output) output.textContent = "${idJumpStatusText("load-error")}";
    }
  });
}

const corpusSearch = document.querySelector("[data-corpus-search]");
if (corpusSearch) {
  const queryInput = corpusSearch.querySelector("[data-search-query]");
  const controls = [...corpusSearch.querySelectorAll("[data-search-filter]")];
  const output = document.querySelector("[data-search-status]");
  const resultsList = document.querySelector("[data-search-results]");
  const resultCap = 50;
  const allowedRecordFields = new Set([
    "id", "target", "kind", "dialogue", "stephanusSpan", "axis", "concept", "status",
    "speaker", "relationKind", "resolution", "title", "snippet"
  ]);
  const normalizeSearch = (value) => String(value || "")
    .normalize("NFKD")
    .replace(/\\p{Mark}+/gu, "")
    .toLocaleLowerCase("und")
    .replace(/[^\\p{Letter}\\p{Number}]+/gu, " ")
    .trim()
    .replace(/\\s+/gu, " ");
  const searchableFields = (record) => [
    record.id, record.kind, record.dialogue, record.stephanusSpan, record.axis, record.concept,
    record.status, record.speaker, record.relationKind, record.resolution, record.title, record.snippet
  ].filter((value) => typeof value === "string").map(normalizeSearch);
  const rank = (record, query, normalizedQuery) => {
    if (record.id === query) return 0;
    const fields = searchableFields(record);
    if (fields.some((field) => field === normalizedQuery)) return 1;
    if (fields.some((field) => field.startsWith(normalizedQuery))) return 2;
    if (fields.some((field) => field.includes(normalizedQuery))) return 3;
    return undefined;
  };
  const validSearchRecord = (record, kind) => record &&
    Object.keys(record).every((field) => allowedRecordFields.has(field)) &&
    typeof record.id === "string" && typeof record.target === "string" && record.kind === kind;
  let searchManifestPromise;
  const loadSearchManifest = () => searchManifestPromise ??= fetchJson(
    corpusSearch.dataset.manifestSrc || "assets/search/manifest.json"
  ).then((manifest) => {
    if (manifest?.version !== 1 || !Array.isArray(manifest.shards) ||
      !manifest.shards.every(validDescriptor)) throw new Error("Malformed search manifest");
    return manifest;
  });
  const renderResults = (ranked) => {
    resultsList?.replaceChildren();
    for (const { record } of ranked.slice(0, resultCap)) {
      const item = document.createElement("li");
      item.className = "panel search-result";
      const heading = document.createElement("h2");
      const link = document.createElement("a");
      link.href = record.target;
      link.textContent = record.title ? record.title + " — " + record.id : record.id;
      heading.append(link);
      item.append(heading);
      const metadata = [
        record.kind, record.dialogue, record.stephanusSpan, record.axis, record.concept,
        record.status, record.speaker, record.relationKind, record.resolution
      ].filter(Boolean);
      if (metadata.length > 0) {
        const meta = document.createElement("p");
        meta.className = "search-meta";
        meta.textContent = metadata.join(", ");
        item.append(meta);
      }
      if (record.snippet) {
        const snippet = document.createElement("p");
        snippet.textContent = record.snippet;
        item.append(snippet);
      }
      resultsList?.append(item);
    }
  };

  corpusSearch.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = (queryInput?.value || "").trim();
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) {
      resultsList?.replaceChildren();
      if (output) output.textContent = "Enter a search query.";
      return;
    }
    const selected = Object.fromEntries(controls.map((control) => [control.dataset.searchFilter, control.value]));
    try {
      const manifest = await loadSearchManifest();
      const descriptors = manifest.shards.filter((shard) =>
        (!selected.kind || shard.kind === selected.kind) &&
        (!selected.dialogue || shard.scope === selected.dialogue)
      );
      const shards = await Promise.all(descriptors.map(async (descriptor) => {
        const shard = await fetchJson(descriptor.path);
        if (shard?.version !== 1 || shard.kind !== descriptor.kind || shard.scope !== descriptor.scope ||
          !Array.isArray(shard.records) || shard.records.length !== descriptor.count ||
          !shard.records.every((record) => validSearchRecord(record, shard.kind))) {
          throw new Error("Malformed search shard");
        }
        return shard;
      }));
      const ranked = shards.flatMap((shard) => shard.records)
        .filter((record) => Object.entries(selected).every(([field, value]) =>
          !value ||
          String(record[field] || "")
            .split(/\\s+/u)
            .some((candidate) => normalizeSearch(candidate) === normalizeSearch(value))
        ))
        .map((record) => ({ record, match: rank(record, query, normalizedQuery) }))
        .filter((result) => result.match !== undefined)
        .sort((a, b) => a.match - b.match || (a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0));
      renderResults(ranked);
      if (output) {
        output.textContent = ranked.length > resultCap
          ? "Showing " + resultCap + " of " + ranked.length + " results. Refine your query."
          : ranked.length === 0
            ? "No results."
            : ranked.length + (ranked.length === 1 ? " result." : " results.");
      }
    } catch {
      resultsList?.replaceChildren();
      if (output) output.textContent = "Search index unavailable.";
    }
  });
}

const recordingPlayer = document.querySelector("[data-recording-player]");
if (recordingPlayer) {
  const audio = recordingPlayer.querySelector("[data-recording-audio]");
  const status = recordingPlayer.querySelector("[data-recording-status]");
  const chapterButtons = [...recordingPlayer.querySelectorAll("[data-recording-chapter]")];
  const recordingId = recordingPlayer.dataset.recordingId || "";
  const audioSha256 = recordingPlayer.dataset.audioSha256 || "";
  const resumeKey = "plato-recording-resume:v${RECORDING_RESUME_SCHEMA_VERSION}:" +
    encodeURIComponent(recordingId) + ":" + audioSha256;
  let restored = false;
  let lastSavedAt = 0;
  const setStatus = (message) => { if (status) status.textContent = message; };
  const completionWindow = (duration) => Number.isFinite(duration) && duration > 0
    ? Math.min(10, duration * 0.02)
    : 0;
  const nearCompletion = () => Number.isFinite(audio?.duration) && audio.duration > 0 &&
    audio.duration - audio.currentTime <= completionWindow(audio.duration);
  const readProgress = () => {
    try { return localStorage.getItem(resumeKey); } catch { return null; }
  };
  const removeProgress = () => {
    try { localStorage.removeItem(resumeKey); } catch { /* storage is optional */ }
  };
  const persistProgress = (force = false) => {
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    if (audio.currentTime === 0) {
      removeProgress();
      return;
    }
    if (nearCompletion()) {
      removeProgress();
      return;
    }
    if (!Number.isFinite(audio.currentTime) || audio.currentTime <= 0) return;
    const now = Date.now();
    if (!force && now - lastSavedAt < ${RECORDING_PROGRESS_SAVE_INTERVAL_MS}) return;
    try {
      localStorage.setItem(resumeKey, String(audio.currentTime));
      lastSavedAt = now;
    } catch { /* storage is optional */ }
  };
  const restoreProgress = () => {
    if (restored || !audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    restored = true;
    const value = Number(readProgress());
    if (Number.isFinite(value) && value > 0 && value < audio.duration &&
      audio.duration - value > completionWindow(audio.duration)) {
      audio.currentTime = value;
      setStatus("Resumed at " + Math.floor(value) + " seconds.");
    } else {
      removeProgress();
      setStatus("Recording ready.");
    }
  };

  if (!audio || !recordingId || !/^[a-f0-9]{64}$/.test(audioSha256)) {
    setStatus("Recording unavailable because its publication metadata is invalid.");
  } else {
    audio.addEventListener("loadedmetadata", restoreProgress);
    if (audio.readyState >= 1) restoreProgress();
    audio.addEventListener("timeupdate", () => persistProgress(false));
    audio.addEventListener("pause", () => {
      persistProgress(true);
      if (!audio.ended) setStatus("Paused at " + Math.floor(audio.currentTime) + " seconds.");
    });
    audio.addEventListener("play", () => setStatus("Playing."));
    audio.addEventListener("playing", () => setStatus("Playing."));
    audio.addEventListener("canplay", () => {
      if (!audio.paused || audio.ended) return;
      setStatus(audio.currentTime > 0
        ? "Ready at " + Math.floor(audio.currentTime) + " seconds."
        : "Recording ready.");
    });
    audio.addEventListener("waiting", () => setStatus("Loading audio…"));
    audio.addEventListener("error", () => setStatus("Recording unavailable. The audio file could not be loaded."));
    audio.addEventListener("ended", () => {
      removeProgress();
      setStatus("Finished. Saved progress cleared.");
    });
    window.addEventListener("pagehide", () => persistProgress(true));
    for (const button of chapterButtons) {
      button.addEventListener("click", () => {
        const seconds = Number(button.dataset.chapterSeconds);
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
          setStatus("Recording metadata is still loading.");
          return;
        }
        if (!Number.isFinite(seconds) || seconds < 0 || seconds >= audio.duration) {
          setStatus("This chapter marker is unavailable.");
          return;
        }
        audio.currentTime = seconds;
        persistProgress(true);
        const target = document.getElementById(button.dataset.chapterTarget || "");
        if (target) target.scrollIntoView({ block: "start" });
        else if (button.dataset.chapterHref) window.location.href = button.dataset.chapterHref;
        setStatus("Ready at " + (button.textContent || "chapter").trim() + ".");
      });
    }
  }
}

const recordingResumeLinks = [...(document.querySelectorAll?.("[data-recording-resume-link]") || [])];
for (const link of recordingResumeLinks) {
  const recordingId = link.dataset.recordingId || "";
  const audioSha256 = link.dataset.audioSha256 || "";
  const duration = Number(link.dataset.recordingDuration);
  const status = link.parentElement?.querySelector("[data-recording-resume-summary]");
  if (!recordingId || !/^[a-f0-9]{64}$/.test(audioSha256) || !Number.isFinite(duration) || duration <= 0) {
    if (status) status.textContent = "Resume metadata unavailable.";
    continue;
  }
  const key = "plato-recording-resume:v${RECORDING_RESUME_SCHEMA_VERSION}:" +
    encodeURIComponent(recordingId) + ":" + audioSha256;
  let stored = null;
  try { stored = localStorage.getItem(key); } catch { /* storage is optional */ }
  const seconds = Number(stored);
  const completionWindow = Math.min(10, duration * 0.02);
  if (stored !== null && Number.isFinite(seconds) && seconds > 0 && seconds < duration &&
    duration - seconds > completionWindow) {
    const rounded = Math.floor(seconds);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const remainder = rounded % 60;
    const formatted = hours > 0
      ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0")
      : minutes + ":" + String(remainder).padStart(2, "0");
    link.textContent = "Resume at " + formatted;
    link.setAttribute("aria-label", "Resume " + (link.dataset.recordingDialogue || "recording") + " at " + formatted);
    if (status) status.textContent = "Saved locally in this browser.";
  } else {
    if (stored !== null) {
      try { localStorage.removeItem(key); } catch { /* storage is optional */ }
    }
    if (status) status.textContent = "No saved position.";
  }
}

// Dialogue overview (the dialogue-pages v3.3 rollout): the course-of-the-dialogue second half ships in
// an open <details>; narrow this so a wide viewport keeps both columns while a
// phone folds. No-JS narrow viewports stay open and show everything.
const courseMore = document.querySelector?.("[data-toc-more]");
if (courseMore && typeof matchMedia === "function" && matchMedia("(max-width: 860px)").matches) {
  courseMore.removeAttribute("open");
}

// The record map: static SVG is the no-JS base; ontology-axis filtering, the
// floating card, click-through, and the #axis= preselect are enhancements.
const recordMap = document.querySelector?.("[data-record-map]");
if (recordMap && document.body) {
  const marks = [...recordMap.querySelectorAll(".map-mark")];
  const obsTotal = Number(recordMap.dataset.obs || 0);
  const claimTotal = Number(recordMap.dataset.claims || 0);
  const anchTotal = Number(recordMap.dataset.anch || 0);
  const chipsHost = recordMap.querySelector("[data-map-chips]");
  const status = recordMap.querySelector("[data-map-status]");
  const claimsGroup = recordMap.querySelector("#g-claims");
  const anchGroup = recordMap.querySelector("#g-anch");
  const allText = "Showing all " + obsTotal + " observations, " + claimTotal +
    " claims, and " + anchTotal + " anchor occurrences.";

  const applyFilter = (axis, label) => {
    let shown = 0;
    for (const mark of marks) {
      if (mark.dataset.k !== "obs") continue;
      const hit = !axis || String(mark.dataset.a || "").split(" ").includes(axis);
      mark.style.display = hit ? "" : "none";
      if (hit) shown += 1;
    }
    const dim = axis ? "0.22" : "";
    if (claimsGroup) claimsGroup.style.opacity = dim;
    if (anchGroup) anchGroup.style.opacity = dim;
    if (status) {
      status.textContent = axis
        ? "Showing " + shown + " of " + obsTotal + " observations — " + (label || axis) +
          ". Claims and anchors dimmed."
        : allText;
    }
  };

  if (chipsHost) {
    const chips = [...chipsHost.querySelectorAll(".map-chip")];
    const activate = (chip) => {
      for (const other of chips) other.classList.toggle("is-on", other === chip);
      applyFilter(chip.dataset.axis || "", (chip.dataset.label || "").trim());
    };
    chipsHost.addEventListener("click", (event) => {
      const chip = event.target.closest?.(".map-chip");
      if (chip) activate(chip);
    });
    const axisMatch = /^axis=(.+)$/.exec((location.hash || "").replace(/^#/, ""));
    if (axisMatch) {
      let wanted = axisMatch[1];
      try { wanted = decodeURIComponent(axisMatch[1]); } catch { /* keep raw */ }
      const chip = chips.find((candidate) => candidate.dataset.axis === wanted);
      if (chip) activate(chip);
    }
  }

  let tip = document.querySelector(".map-tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "map-tip";
    tip.setAttribute("role", "presentation");
    document.body.appendChild(tip);
  }
  const hideTip = () => { tip.style.display = "none"; };
  const showTip = (mark, x, y) => {
    tip.replaceChildren();
    const ref = document.createElement("p");
    ref.className = "t-ref";
    ref.textContent = mark.dataset.t || "";
    tip.append(ref);
    const name = document.createElement("p");
    name.className = "t-name";
    name.textContent = mark.dataset.n || "";
    tip.append(name);
    if (mark.dataset.l) {
      const lead = document.createElement("p");
      lead.className = "t-lead";
      lead.textContent = mark.dataset.l;
      tip.append(lead);
    }
    tip.style.display = "block";
    const rect = tip.getBoundingClientRect();
    const px = Math.min(x + 16, window.innerWidth - rect.width - 12);
    const py = y + 18 + rect.height > window.innerHeight ? y - rect.height - 12 : y + 18;
    tip.style.left = Math.max(8, px) + "px";
    tip.style.top = Math.max(8, py) + "px";
  };
  const navigate = (mark) => { if (mark.dataset.h) window.location.href = mark.dataset.h; };
  recordMap.addEventListener("mousemove", (event) => {
    const mark = event.target.closest?.(".map-mark");
    if (mark) showTip(mark, event.clientX, event.clientY);
    else hideTip();
  });
  recordMap.addEventListener("mouseleave", hideTip);
  recordMap.addEventListener("focusin", (event) => {
    const mark = event.target.closest?.(".map-mark");
    if (!mark) { hideTip(); return; }
    const rect = mark.getBoundingClientRect();
    showTip(mark, rect.left + rect.width / 2, rect.bottom + 2);
  });
  recordMap.addEventListener("focusout", hideTip);
  recordMap.addEventListener("click", (event) => {
    const mark = event.target.closest?.(".map-mark");
    if (mark) navigate(mark);
  });
  recordMap.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const mark = event.target.closest?.(".map-mark");
    if (mark) { event.preventDefault(); navigate(mark); }
  });
}
`;
}

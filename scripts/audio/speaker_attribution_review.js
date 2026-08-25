"use strict";

(() => {
  const LANES = [
    "physical-label-confirmation",
    "true-multi-owner",
    "missing-owner",
    "embedded-dialogue",
    "unattributed-longform",
  ];
  const DECISIONS = [
    ["", "Choose an explicit decision…"],
    ["roster-character", "Assign selected roster character"],
    ["keep-unresolved", "Keep unresolved"],
    ["outer-performer", "Outer performer — choose explicitly"],
    ["literary-quotation", "Literary quotation — choose active voice owner"],
    ["nonspoken-glue", "Non-spoken glue"],
  ];
  const ROSTER_REQUIRED = new Set([
    "roster-character",
    "outer-performer",
    "literary-quotation",
  ]);
  const PAGE_SIZE = 100;

  const fatalNode = document.getElementById("fatal-error");
  const appNode = document.getElementById("app");
  const titleNode = document.getElementById("page-title");

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function option(value, label) {
    const node = document.createElement("option");
    node.value = value;
    node.textContent = label;
    return node;
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
        .join(",")}}`;
    }
    return JSON.stringify(value);
  }

  async function sha256(value) {
    if (!globalThis.crypto?.subtle) {
      throw new Error("Web Crypto SHA-256 is unavailable; review is disabled.");
    }
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value),
    );
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function fail(error) {
    fatalNode.hidden = false;
    fatalNode.textContent = `Review disabled: ${error instanceof Error ? error.message : error}`;
    appNode.replaceChildren();
  }

  async function loadPageData() {
    const dataNode = document.getElementById("review-data");
    if (!dataNode) throw new Error("Signed review data is missing.");
    const payload = JSON.parse(dataNode.textContent);
    const signature = payload.page_data_sha256;
    if (!/^[0-9a-f]{64}$/.test(signature || "")) {
      throw new Error("Review page-data signature is missing.");
    }
    const unsigned = { ...payload };
    delete unsigned.page_data_sha256;
    if ((await sha256(stableStringify(unsigned))) !== signature) {
      throw new Error("Review page data was tampered with or became stale.");
    }
    return payload;
  }

  function boot(data) {
    titleNode.textContent = `Speaker-attribution review: ${data.dialogue}`;
    if (!Array.isArray(data.roster) || !Array.isArray(data.nonselectable_evidence)) {
      throw new Error("Character performance-role evidence is missing.");
    }
    const rosterIds = new Set();
    for (const row of data.roster) {
      if (
        !row ||
        typeof row.character_id !== "string" ||
        row.performance_role !== "voice-owner" ||
        !Array.isArray(row.role_flags) ||
        row.role_flags.includes("commentary-narrator") ||
        rosterIds.has(row.character_id)
      ) {
        throw new Error("Selectable roster contains a non-voice-owner role.");
      }
      rosterIds.add(row.character_id);
    }
    for (const row of data.nonselectable_evidence) {
      if (
        !row ||
        typeof row.character_id !== "string" ||
        !["reported-only", "review-required"].includes(row.performance_role) ||
        rosterIds.has(row.character_id)
      ) {
        throw new Error("Nonselectable performance-role evidence is malformed.");
      }
    }
    const atomById = new Map(
      data.source_atoms.map((atom) => [atom.source_atom_id, atom]),
    );
    const unitById = new Map(
      data.review_units.map((unit) => [unit.review_unit_id, unit]),
    );
    const unitByAtom = new Map();
    for (const unit of data.review_units) {
      for (const atomId of unit.source_atom_ids) {
        if (unitByAtom.has(atomId) || !atomById.has(atomId)) {
          throw new Error(`Invalid review-unit partition at ${atomId}.`);
        }
        unitByAtom.set(atomId, unit);
      }
    }
    if (unitByAtom.size !== atomById.size) {
      throw new Error("Review units do not cover every raw atom.");
    }
    const humanUnits = data.review_units.filter((unit) => unit.decision_required);
    const controlsByUnit = new Map();
    const storageKey = [
      "plato-speaker-review-v2",
      data.dialogue,
      data.input_hashes.triage_sha256,
      data.input_hashes.characters_sha256,
      data.page_data_sha256,
    ].join(":");

    function emptyState() {
      return {
        schema_version: 2,
        dialogue: data.dialogue,
        triage_sha256: data.input_hashes.triage_sha256,
        characters_sha256: data.input_hashes.characters_sha256,
        page_data_sha256: data.page_data_sha256,
        unit_decisions: {},
      };
    }

    function sanitizeState(candidate) {
      const clean = emptyState();
      if (
        !candidate ||
        candidate.schema_version !== 2 ||
        candidate.dialogue !== data.dialogue ||
        candidate.triage_sha256 !== data.input_hashes.triage_sha256 ||
        candidate.characters_sha256 !== data.input_hashes.characters_sha256 ||
        candidate.page_data_sha256 !== data.page_data_sha256 ||
        !candidate.unit_decisions ||
        typeof candidate.unit_decisions !== "object"
      ) {
        return clean;
      }
      for (const [unitId, draft] of Object.entries(candidate.unit_decisions)) {
        const unit = unitById.get(unitId);
        if (!unit?.decision_required || !draft || typeof draft !== "object") continue;
        const kind = draft.decision_kind;
        if (!kind || !DECISIONS.some(([value]) => value === kind)) continue;
        const normalized = {
          decision_kind: kind,
          bulk_confirmation: draft.bulk_confirmation === true,
        };
        if (
          ROSTER_REQUIRED.has(kind) &&
          typeof draft.character_id === "string" &&
          rosterIds.has(draft.character_id)
        ) {
          normalized.character_id = draft.character_id;
        }
        if (
          normalized.bulk_confirmation &&
          !(
            unit.lane === "physical-label-confirmation" &&
            unit.lexical_atom_count > 1 &&
            kind === "outer-performer" &&
            rosterIds.has(normalized.character_id)
          )
        ) {
          normalized.bulk_confirmation = false;
        }
        clean.unit_decisions[unitId] = normalized;
      }
      return clean;
    }

    let state = emptyState();
    try {
      state = sanitizeState(JSON.parse(localStorage.getItem(storageKey) || "null"));
    } catch (_error) {
      state = emptyState();
    }

    function persist() {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function draftComplete(unitId) {
      const draft = state.unit_decisions[unitId];
      if (!draft || !DECISIONS.some(([value]) => value === draft.decision_kind)) {
        return false;
      }
      if (ROSTER_REQUIRED.has(draft.decision_kind)) {
        return rosterIds.has(draft.character_id);
      }
      return !draft.character_id;
    }

    const shell = element("section", "review-shell");
    const toolbar = element("section", "toolbar");
    const progress = element("strong", "progress", "0 / 0 human decisions");
    const laneFilter = element("select", "lane-filter");
    laneFilter.append(option("human", "Human units · all lanes"));
    laneFilter.append(option("all", "All units · including deterministic"));
    laneFilter.append(option("deterministic-nonspoken", "deterministic-nonspoken"));
    for (const lane of LANES) laneFilter.append(option(lane, lane));
    laneFilter.value = "human";
    const exportButton = element("button", "primary", "Export signed expanded review");
    exportButton.type = "button";
    const clearButton = element("button", "danger", "Clear local decisions");
    clearButton.type = "button";
    toolbar.append(progress, laneFilter, exportButton, clearButton);

    const policy = element("aside", "policy-note");
    policy.append(
      element(
        "p",
        "",
        `${data.source_atoms.length.toLocaleString()} raw atoms are preserved, but only ${humanUnits.length.toLocaleString()} homogeneous semantic units require a person.`,
      ),
      element(
        "p",
        "",
        "Balanced markup, structural markers, punctuation, and neutral glue expand deterministically to nonspoken decisions. They remain exact rows in export and are inspectable through the deterministic filter.",
      ),
      element(
        "p",
        "",
        "No roster value is preselected. Nearest and parent TEI owners are evidence only and never become a decision automatically.",
      ),
    );
    if (data.nonselectable_evidence.length) {
      const evidence = element("details", "role-evidence");
      evidence.append(
        element(
          "summary",
          "",
          `${data.nonselectable_evidence.length.toLocaleString()} reported or review-required roles are evidence only`,
        ),
        element(
          "p",
          "",
          "These identities remain visible for attribution context but cannot own a performed span until their catalog appearance is a voice-owner.",
        ),
      );
      const evidenceList = element("ul", "role-evidence-list");
      for (const row of data.nonselectable_evidence) {
        const item = element(
          "li",
          "",
          `${row.display_name} · ${row.performance_role} · ${row.role_flags.join(", ")}`,
        );
        if (row.editorial_note) {
          item.append(element("p", "", row.editorial_note));
        }
        evidenceList.append(item);
      }
      evidence.append(evidenceList);
      policy.append(evidence);
    }

    const unitList = element("section", "packet-list");
    const viewportStatus = element("p", "viewport-status");
    const loadMoreButton = element("button", "load-more", "Load more units");
    loadMoreButton.type = "button";
    shell.append(toolbar, policy, viewportStatus, unitList, loadMoreButton);
    appNode.replaceChildren(shell);

    function syncUnitControls(unitId) {
      const draft = state.unit_decisions[unitId] || {};
      const controls = controlsByUnit.get(unitId);
      if (!controls) return;
      controls.kind.value = draft.decision_kind || "";
      const requiresRoster = ROSTER_REQUIRED.has(draft.decision_kind);
      controls.roster.disabled = !requiresRoster;
      controls.roster.value = requiresRoster ? draft.character_id || "" : "";
      controls.status.textContent = draftComplete(unitId)
        ? draft.bulk_confirmation
          ? "complete · explicit physical-label bulk confirmation"
          : "complete · one human decision expanded to lexical children"
        : draft.decision_kind
          ? "incomplete · choose a roster character"
          : "undecided";
      controls.wrapper.dataset.complete = String(draftComplete(unitId));
    }

    function updateProgress() {
      const complete = humanUnits.filter((unit) =>
        draftComplete(unit.review_unit_id),
      ).length;
      progress.textContent = `${complete.toLocaleString()} / ${humanUnits.length.toLocaleString()} human decisions complete`;
      exportButton.disabled = complete !== humanUnits.length;
    }

    function updateDraft(unitId, kind, characterId, bulkConfirmation = false) {
      if (!kind) {
        delete state.unit_decisions[unitId];
      } else {
        const draft = {
          decision_kind: kind,
          bulk_confirmation: bulkConfirmation,
        };
        if (ROSTER_REQUIRED.has(kind) && characterId) draft.character_id = characterId;
        state.unit_decisions[unitId] = draft;
      }
      persist();
      syncUnitControls(unitId);
      updateProgress();
    }

    function rosterSelect() {
      const select = element("select", "roster-choice");
      select.append(option("", "Choose roster character explicitly…"));
      for (const row of data.roster) {
        select.append(
          option(
            row.character_id,
            `${row.display_name} · ${row.performance_role} · ${row.role_flags.join(", ")}`,
          ),
        );
      }
      select.value = "";
      return select;
    }

    function decisionControls(unit) {
      const wrapper = element("section", "decision-controls");
      const kind = element("select", "decision-kind");
      for (const [value, label] of DECISIONS) kind.append(option(value, label));
      const roster = rosterSelect();
      roster.disabled = true;
      const status = element("span", "decision-status", "undecided");
      wrapper.append(kind, roster, status);
      kind.addEventListener("change", () => {
        const existing = state.unit_decisions[unit.review_unit_id];
        updateDraft(
          unit.review_unit_id,
          kind.value,
          ROSTER_REQUIRED.has(kind.value)
            ? existing?.character_id || roster.value
            : undefined,
          false,
        );
      });
      roster.addEventListener("change", () => {
        updateDraft(unit.review_unit_id, kind.value, roster.value, false);
      });
      controlsByUnit.set(unit.review_unit_id, {
        wrapper,
        kind,
        roster,
        status,
      });
      syncUnitControls(unit.review_unit_id);
      return wrapper;
    }

    function rawAtomCard(atom) {
      const text = data.source_text.slice(atom.start_char, atom.end_char);
      const row = element("article", "atom-card");
      const classification = atom.review_classification;
      row.append(
        element(
          "h3",
          "atom-heading",
          `${atom.source_atom_id} · ${atom.start_char}:${atom.end_char} · ${classification.automatic_nonspoken ? "deterministic nonspoken" : "lexical"}`,
        ),
      );
      const context = element("p", "source-context");
      context.append(
        element(
          "span",
          "context-before",
          data.source_text.slice(Math.max(0, atom.start_char - 100), atom.start_char),
        ),
        element("mark", "atom-text", text),
        element(
          "span",
          "context-after",
          data.source_text.slice(atom.end_char, atom.end_char + 100),
        ),
      );
      const facts = element("dl", "atom-facts");
      for (const [name, value] of [
        ["Lane", atom.lane],
        ["Reason", atom.unresolved_reason],
        ["Text SHA-256", atom.text_sha256],
        [
          "Automatic policy",
          classification.automatic_nonspoken
            ? classification.automatic_nonspoken_reason
            : "human lexical child",
        ],
        [
          "Container",
          `${classification.semantic_container.kind}: ${classification.semantic_container.container_id}`,
        ],
      ]) {
        facts.append(element("dt", "", name), element("dd", "", value));
      }
      const provenance = element("details", "provenance");
      provenance.append(element("summary", "", "Full DOM and TEI provenance"));
      provenance.append(
        element("pre", "", JSON.stringify(atom.source_evidence, null, 2)),
      );
      row.append(context, facts, provenance);
      return row;
    }

    function renderUnit(unit) {
      const details = element("details", "packet");
      details.dataset.lane = unit.lane;
      const container = unit.semantic_container.container_id;
      details.append(
        element(
          "summary",
          "packet-summary",
          unit.decision_required
            ? `${unit.review_unit_id} · ${unit.lane} · 1 human decision → ${unit.lexical_atom_count} lexical atoms · ${unit.automatic_nonspoken_atom_count} automatic children · ${container}`
            : `${unit.review_unit_id} · deterministic nonspoken · ${unit.source_atom_count} preserved atoms · ${container}`,
        ),
      );
      const body = element("section", "packet-body");
      if (unit.decision_required) {
        body.append(decisionControls(unit));
        if (
          unit.lane === "physical-label-confirmation" &&
          unit.lexical_atom_count > 1
        ) {
          const bulk = element("section", "bulk-confirm");
          const explicitRoster = rosterSelect();
          const button = element(
            "button",
            "",
            `Confirm one explicit outer performer for ${unit.lexical_atom_count} lexical children`,
          );
          button.type = "button";
          button.disabled = true;
          explicitRoster.addEventListener("change", () => {
            button.disabled = !rosterIds.has(explicitRoster.value);
          });
          button.addEventListener("click", () => {
            if (
              unit.lane !== "physical-label-confirmation" ||
              unit.lexical_atom_count < 2 ||
              !rosterIds.has(explicitRoster.value)
            ) {
              throw new Error("Forbidden bulk confirmation scope.");
            }
            if (
              !globalThis.confirm(
                `Explicitly confirm ${explicitRoster.value} for all ${unit.lexical_atom_count} homogeneous lexical children? Automatic markup remains nonspoken.`,
              )
            ) {
              return;
            }
            updateDraft(
              unit.review_unit_id,
              "outer-performer",
              explicitRoster.value,
              true,
            );
          });
          bulk.append(
            element(
              "p",
              "",
              "This unit is homogeneous by lane, said/quote container, unresolved reason, and direct/descendant relation. No inherited owner is used.",
            ),
            explicitRoster,
            button,
          );
          body.append(bulk);
        }
      } else {
        body.append(
          element(
            "p",
            "decision-status",
            "No human click required. Export expands every child as deterministic nonspoken glue.",
          ),
        );
      }
      const audit = element("details", "raw-atoms");
      audit.append(
        element(
          "summary",
          "",
          `Audit all ${unit.source_atom_count} exact child atoms and provenance`,
        ),
      );
      let auditRendered = false;
      audit.addEventListener("toggle", () => {
        if (!audit.open || auditRendered) return;
        for (const atomId of unit.source_atom_ids) {
          audit.append(rawAtomCard(atomById.get(atomId)));
        }
        auditRendered = true;
      });
      body.append(audit);
      details.append(body);
      unitList.append(details);
    }

    let filteredUnits = [];
    let renderedCount = 0;

    function unitsForFilter() {
      switch (laneFilter.value) {
        case "human":
          return humanUnits;
        case "all":
          return data.review_units;
        case "deterministic-nonspoken":
          return data.review_units.filter((unit) => !unit.decision_required);
        default:
          return humanUnits.filter((unit) => unit.lane === laneFilter.value);
      }
    }

    function renderNextPage() {
      const end = Math.min(renderedCount + PAGE_SIZE, filteredUnits.length);
      for (const unit of filteredUnits.slice(renderedCount, end)) renderUnit(unit);
      renderedCount = end;
      viewportStatus.textContent = `${renderedCount.toLocaleString()} / ${filteredUnits.length.toLocaleString()} matching units rendered`;
      loadMoreButton.hidden = renderedCount >= filteredUnits.length;
      loadMoreButton.textContent = `Load next ${Math.min(PAGE_SIZE, filteredUnits.length - renderedCount).toLocaleString()} units`;
    }

    function resetViewport() {
      unitList.replaceChildren();
      controlsByUnit.clear();
      filteredUnits = unitsForFilter();
      renderedCount = 0;
      renderNextPage();
    }

    laneFilter.addEventListener("change", resetViewport);
    loadMoreButton.addEventListener("click", renderNextPage);

    clearButton.addEventListener("click", () => {
      if (!globalThis.confirm("Clear every human decision for this exact input hash?")) {
        return;
      }
      state = emptyState();
      persist();
      for (const unitId of controlsByUnit.keys()) syncUnitControls(unitId);
      updateProgress();
    });

    async function exportReview() {
      if (humanUnits.some((unit) => !draftComplete(unit.review_unit_id))) {
        throw new Error("Human review-unit decisions are incomplete.");
      }
      const orderedAtoms = [...data.source_atoms].sort(
        (left, right) =>
          left.start_char - right.start_char ||
          left.end_char - right.end_char ||
          left.source_atom_id.localeCompare(right.source_atom_id),
      );
      const laneUnitCounts = Object.fromEntries(LANES.map((lane) => [lane, 0]));
      for (const unit of humanUnits) laneUnitCounts[unit.lane] += 1;
      const bulkUnits = new Set();
      const decisions = orderedAtoms.map((atom) => {
        const unit = unitByAtom.get(atom.source_atom_id);
        const automatic = atom.review_classification.automatic_nonspoken;
        const decision = {
          source_atom_id: atom.source_atom_id,
          review_unit_id: unit.review_unit_id,
          start_char: atom.start_char,
          end_char: atom.end_char,
          text_sha256: atom.text_sha256,
          lane: atom.lane,
          decision_kind: "nonspoken-glue",
          decision_source: "deterministic-structural-policy",
          bulk_confirmation: false,
        };
        if (!automatic) {
          const draft = state.unit_decisions[unit.review_unit_id];
          decision.decision_kind = draft.decision_kind;
          decision.decision_source = "explicit-human-review";
          decision.bulk_confirmation = draft.bulk_confirmation === true;
          if (ROSTER_REQUIRED.has(draft.decision_kind)) {
            decision.character_id = draft.character_id;
          }
          if (decision.bulk_confirmation) bulkUnits.add(unit.review_unit_id);
        }
        return decision;
      });
      const unsigned = {
        schema_version: 1,
        artifact_kind: "speaker-attribution-review",
        editorial_status: "provisional-human-review",
        accepted: false,
        counts_as_production_attribution: false,
        dialogue: data.dialogue,
        input_hashes: {
          triage_sha256: data.input_hashes.triage_sha256,
          scaffold_sha256: data.input_hashes.scaffold_sha256,
          english_sha256: data.input_hashes.english_sha256,
          characters_sha256: data.input_hashes.characters_sha256,
          review_schema_sha256: data.input_hashes.review_schema_sha256,
          review_generator_sha256: data.input_hashes.review_generator_sha256,
          review_page_data_sha256: data.page_data_sha256,
        },
        review_policy: {
          decision_source: "explicit-human-review",
          automatic_nonspoken_source: "deterministic-structural-policy",
          inherited_owner_inference: false,
          production_write_allowed: false,
          bulk_confirmation_lane: "physical-label-confirmation",
          bulk_confirmation_kind: "outer-performer",
        },
        summary: {
          expanded_atom_decision_count: decisions.length,
          human_review_unit_count: humanUnits.length,
          deterministic_nonspoken_atom_count:
            data.summary.deterministic_nonspoken_atom_count,
          bulk_confirmation_unit_count: bulkUnits.size,
          lane_human_review_unit_counts: laneUnitCounts,
        },
        decisions,
      };
      const payload = {
        ...unsigned,
        review_sha256: await sha256(stableStringify(unsigned)),
      };
      const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.dialogue}.speaker-attribution-review.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    exportButton.addEventListener("click", () => exportReview().catch(fail));
    resetViewport();
    updateProgress();
  }

  loadPageData().then(boot).catch(fail);
})();

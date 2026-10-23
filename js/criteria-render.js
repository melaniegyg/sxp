// ============================================================
// TOP CHOICE — criteria renderer
//
//   TopChoiceRender.render("#criteria", TopChoice.build(activity));
//
// Renders the three criteria sections. Every row renders from the same
// shape, so a failing activity needs no separate template — it just
// carries status "not-met" and (optionally) failHelp.
// ============================================================
(function (global) {
  "use strict";

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const ICON_MET =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m16.5 9.5-5.8 6.2L7.5 12.6l1.45-1.37 1.7 1.6L15 8.1z"/><path fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/></svg>';
  // status / circle-slash — "blocked, prohibited, denied". The design uses this
  // for EVERY failed criterion: section rows, the status banner and the metric
  // tiles alike (516:50949, 516:51696, 555:53045). There is no warning glyph.
  const ICON_NOT_MET =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/><path d="m6.343 16.243 9.9-9.9 1.414 1.414-9.9 9.9z"/></svg>';

  const icon = (status) =>
    `<span class="tc-status tc-status--${status}">${status === "met" ? ICON_MET : ICON_NOT_MET}</span>`;

  // Confirmed Trust & Safety cases, itemised (design 516:51482). Columns the
  // export can't fill yet render empty rather than being dropped, so the shape
  // stays honest about what's missing.
  //
  // "Excluded until" holds a bare date. An earlier revision (720:66815) titled
  // it "Notes" and carried prose ("Ban effective until Jan 1, 2027"); 516:51482
  // moves the wording into the header, so the cells are dates only.
  const CASE_COLS = [
    { key: "activity", label: "Activity" },
    { key: "confirmed", label: "Case confirmed" },
    { key: "case_number", label: "Case number" },
    { key: "excluded_until", label: "Excluded until" },
  ];

  function renderCases(cases) {
    if (!cases || !cases.length) return "";
    const head = CASE_COLS.map(
      (c) => `<th class="tc-cases__th tc-cases__col--${c.key}">${esc(c.label)}</th>`
    ).join("");
    const rows = cases
      .map(
        (c) =>
          "<tr>" +
          CASE_COLS.map(
            (col) => `<td class="tc-cases__td">${c[col.key] ? esc(c[col.key]) : ""}</td>`
          ).join("") +
          "</tr>"
      )
      .join("");
    return `
      <table class="tc-cases">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // The expanded "See details" panel: a trend chart, and for the two rate
  // metrics a Top-disruptions breakdown. That breakdown is the defect-cards
  // module lifted from the DBR portal — same rail, advice, FAQ links and CTAs
  // the design shows (672:64888) — so it is reused rather than rebuilt.
  function buildDetail(panel, row) {
    if (!row || !row.details) {
      panel.innerHTML =
        '<p class="tc-details__placeholder">No trend data for this activity yet.</p>';
      return;
    }

    panel.innerHTML = '<div class="tc-trend"></div>';
    if (row.details.trend && row.metric && row.metric.chart) {
      TrendChart.render(panel.querySelector(".tc-trend"), {
        points: row.details.trend,
        max: row.metric.chart.max,
        bar: row.metric.chart.bar,
        kind: row.metric.chart.kind,
        ariaLabel: row.label + " over the assessment period",
      });
    }

    if (row.details.disruptions && row.details.disruptions.length) {
      mountDisruptions(panel, row.details.disruptions);
    }
  }

  // Renders the shared defect-cards rail into `host` and strips the affordances
  // that only make sense in the DBR portal. Used by the metric detail panels
  // and, inline, by the Trust & Safety tag-rate failure (516:52273).
  function mountDisruptions(host, disruptions, opts) {
    const wrap = document.createElement("div");
    wrap.className = "tc-disruptions" + (opts && opts.inline ? " tc-disruptions--inline" : "");
    host.appendChild(wrap);
    // accordion:false keeps the single card open — there is nothing to
    // collapse against when each metric shows one category.
    DefectCards.render(wrap, disruptions, { accordion: false });

    // The card is already inside a collapsible row, so its own collapse
    // affordance is redundant: drop the chevron, and demote the heading from
    // a toggle button to plain text rather than leaving a button that does
    // nothing. Done here so the shared module stays untouched for the DBR
    // portal, which still needs the collapsing behaviour.
    wrap.querySelectorAll(".cc-collapse").forEach((b) => b.remove());
    wrap.querySelectorAll(".cc-left__head").forEach((head) => {
      const plain = document.createElement("div");
      plain.className = head.className;
      plain.innerHTML = head.innerHTML;
      head.replaceWith(plain);
    });
    return wrap;
  }

  function renderRow(row) {
    const failing = row.status === "not-met";
    // The design hides this helper text on passing rows and reveals it on
    // failing ones, alongside a CTA.
    const help =
      failing && row.failHelp
        ? `<p class="tc-row__help">${esc(row.failHelp)}</p>`
        : "";

    if (row.metric) {
      return `
        <div class="tc-row tc-row--metric" data-row="${esc(row.id)}">
          <div class="tc-metric${failing ? " tc-metric--not-met" : ""}">
            ${icon(row.status)}
            <p class="tc-metric__value">${esc(row.metric.value)}</p>
            <p class="tc-metric__bar">${esc(row.metric.barText)}</p>
          </div>
          <div class="tc-row__body">
            <p class="tc-row__label">${esc(row.label)}</p>
            <p class="tc-row__desc">${esc(row.description)}</p>
            ${help}
            <button class="tc-details" type="button" aria-expanded="false">
              See details
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="tc-details__panel hidden" data-detail="${esc(row.id)}"></div>
          </div>
        </div>`;
    }

    // Some gates replace their description outright when they fail, rather
    // than keeping it and adding a note underneath.
    const replaced = failing && row.failDescription;
    // The T&S tag-rate failure shows its tag rail inline, with no "See details"
    // toggle — the design puts it straight under the copy (516:52273). The
    // placeholder is filled after innerHTML, since defect-cards mounts to a node.
    const inlineRail =
      failing && row.details && row.details.disruptions && row.details.disruptions.length
        ? `<div data-inline-disruptions="${esc(row.id)}"></div>`
        : "";
    const body = replaced
      ? `<p class="tc-row__fail-desc">${esc(row.failDescription)}</p>${renderCases(row.cases)}${inlineRail}`
      : `<p class="tc-row__desc">${esc(row.description)}</p>${help}${inlineRail}`;

    return `
      <div class="tc-row" data-row="${esc(row.id)}">
        ${icon(row.status, row.failIcon)}
        <div class="tc-row__body${replaced ? " tc-row__body--replaced" : ""}">
          <p class="tc-row__label">${esc(row.label)}</p>
          ${body}
        </div>
      </div>`;
  }

  function renderSection(section) {
    // A section's rail turns red as soon as any row in it fails.
    const failed = section.rows.some((r) => r.status === "not-met");
    return `
      <section class="tc-section tc-section--${failed ? "not-met" : "met"}" data-section="${esc(section.id)}">
        <div class="tc-section__head">
          <h3 class="tc-section__title">${esc(section.title)}</h3>
        </div>
        <div class="tc-section__rows">${section.rows.map(renderRow).join("")}</div>
      </section>`;
  }

  // Copy is verbatim from the design. The badge name is unquoted and title-case
  // ("Excellent Experience"), matching the revised promo header (566:53353).
  //
  // The two dates are formatted differently ON PURPOSE, as the design has them:
  // the success HEADLINE drops the year ("from January 1") while its own
  // description keeps it ("on January 1, 2027"), as does the failure headline.
  // An earlier note here said carrying the year into the headline was a
  // deliberate divergence — the design now settles it the other way.
  //
  // Note the prepositions differ too: "from" in the success headline, "on"
  // everywhere else. Dates are templated and each clause drops when absent.
  function renderBanner(badge) {
    const date = badge.awardDate ? esc(badge.awardDate) : null;
    const monthDay = badge.awardDateMonthDay ? esc(badge.awardDateMonthDay) : null;

    if (badge.earned) {
      return `
        <div class="tc-banner tc-banner--met">
          <div class="tc-banner__head">
            ${icon("met")}
            <p class="tc-banner__title">Nice work! This activity will receive an Excellent Experience badge${monthDay ? ` from ${monthDay}` : ""}</p>
          </div>
          <p class="tc-banner__desc">As long as you continue to meet all the criteria below, the badge will appear on your listing${date ? ` on ${date}` : ""}.</p>
        </div>`;
    }
    return `
      <div class="tc-banner tc-banner--not-met">
        <div class="tc-banner__head">
          ${icon("not-met")}
          <p class="tc-banner__title">You currently don&rsquo;t meet the requirements to be awarded the Excellent Experience badge${date ? ` on ${date}` : ""}</p>
        </div>
        <p class="tc-banner__desc">This activity doesn&rsquo;t meet the criteria to receive the badge. Keep working on it so you can get awarded with it next time.</p>
      </div>`;
  }

  // Assessment-period select (757:29008), replacing the plain "Assessment
  // period: …" line.
  //
  // DELIBERATELY INERT. Only the current period has data — sxp_activity_criteria
  // holds one row per activity covering one window — so the earlier ranges are
  // generated labels with nothing behind them. There is no change handler: the
  // dropdown opens and a past range can be picked, but the criteria below do
  // not reload, because there is nothing to reload them from.
  //
  // Consequence worth knowing before demoing: pick an earlier range and the
  // label will disagree with the numbers underneath it. Wire this up only once
  // the export carries history, or lock the control to the current period.
  function renderPeriodSelect(period) {
    const opts = (period.options || [])
      .map(
        (o) =>
          `<option${o.current ? " selected" : ""}>${esc(o.label)}</option>`
      )
      .join("");
    return `
      <div class="tc-period">
        <label class="tc-period__label" for="tc-period">Assessment period</label>
        <div class="tc-period__control">
          <select class="tc-period__select" id="tc-period">${opts}</select>
          <svg class="tc-period__chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>`;
  }

  function render(target, model) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;

    // Banner sits under the heading, above the criteria it summarises.
    el.innerHTML = `
      <div class="tc-heading">
        <h2 class="section-heading">How to earn the badge for this activity</h2>
        ${renderPeriodSelect(model.period)}
      </div>
      ${renderBanner(model.badge)}
      <div class="tc-sections">${model.sections.map(renderSection).join("")}</div>`;

    // Build each detail panel lazily — charts and the disruption rail are only
    // worth rendering once a supplier actually opens the row.
    const rowsById = {};
    model.sections.forEach((s) => s.rows.forEach((r) => (rowsById[r.id] = r)));

    // Inline rails (Trust & Safety tag rate) are not behind a toggle, so they
    // mount immediately rather than on first open.
    el.querySelectorAll("[data-inline-disruptions]").forEach((slot) => {
      const row = rowsById[slot.dataset.inlineDisruptions];
      if (row && row.details && row.details.disruptions) {
        mountDisruptions(slot, row.details.disruptions, { inline: true });
      }
    });

    el.querySelectorAll(".tc-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const open = !panel.classList.contains("hidden");
        panel.classList.toggle("hidden", open);
        btn.setAttribute("aria-expanded", String(!open));
        btn.classList.toggle("open", !open);
        if (!open && !panel.dataset.built) {
          buildDetail(panel, rowsById[panel.dataset.detail]);
          panel.dataset.built = "1";
        }
      });
    });
  }

  global.TopChoiceRender = { render };
})(window);

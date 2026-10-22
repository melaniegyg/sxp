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
  const ICON_NOT_MET =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 12.75h-2v-6h2zM12 16.75a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3"/><path fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/></svg>';

  // status / circle-slash — "blocked, prohibited, denied". Used where a gate
  // fails and the outcome is a hard ineligibility rather than a shortfall.
  const ICON_BLOCKED =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/><path d="m6.343 16.243 9.9-9.9 1.414 1.414-9.9 9.9z"/></svg>';

  const icon = (status, variant) => {
    const glyph =
      status === "met" ? ICON_MET : variant === "blocked" ? ICON_BLOCKED : ICON_NOT_MET;
    return `<span class="tc-status tc-status--${status}">${glyph}</span>`;
  };

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
          <div class="tc-metric">
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
            <!-- TODO(data): the design expands a trend chart here. The activity
                 export has no time series — only point-in-time aggregates. -->
            <div class="tc-details__panel hidden">
              <p class="tc-details__placeholder">No trend data in the current export.</p>
            </div>
          </div>
        </div>`;
    }

    // Some gates replace their description outright when they fail, rather
    // than keeping it and adding a note underneath.
    const replaced = failing && row.failDescription;
    const body = replaced
      ? `<p class="tc-row__fail-desc">${esc(row.failDescription)}</p>`
      : `<p class="tc-row__desc">${esc(row.description)}</p>${help}`;

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

  // Copy is verbatim from the design — met 516:50892, not-met 555:53045 —
  // including its lowercase ‘top choice’ and curly quotes. The award date is
  // templated in from the data; the clause drops when a fixture has none.
  function renderBanner(badge) {
    const date = badge.awardDate ? esc(badge.awardDate) : null;

    if (badge.earned) {
      return `
        <div class="tc-banner tc-banner--met">
          <div class="tc-banner__head">
            ${icon("met")}
            <p class="tc-banner__title">Nice work! This activity will receive a &lsquo;top choice&rsquo; badge${date ? ` from ${date}` : ""}</p>
          </div>
          <p class="tc-banner__desc">As long as you continue to meet all the requirements below, the badge will appear on your listing${date ? ` on ${date}` : ""}.</p>
        </div>`;
    }
    return `
      <div class="tc-banner tc-banner--not-met">
        <div class="tc-banner__head">
          ${icon("not-met", "blocked")}
          <p class="tc-banner__title">You currently don&rsquo;t meet the requirements to be awarded the &lsquo;top choice&rsquo; badge${date ? ` on ${date}` : ""}</p>
        </div>
        <p class="tc-banner__desc">This activity doesn&rsquo;t meet the minimum quality standards to receive the badge. Keep working on it so you can get awarded with it next time.</p>
      </div>`;
  }

  function render(target, model) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;

    el.innerHTML = `
      ${renderBanner(model.badge)}
      <div class="tc-heading">
        <h2 class="section-heading">How to earn the badge for this activity</h2>
        <p class="section-desc">${esc(model.period.text)}</p>
      </div>
      <div class="tc-sections">${model.sections.map(renderSection).join("")}</div>`;

    el.querySelectorAll(".tc-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const open = !panel.classList.contains("hidden");
        panel.classList.toggle("hidden", open);
        btn.setAttribute("aria-expanded", String(!open));
        btn.classList.toggle("open", !open);
      });
    });
  }

  global.TopChoiceRender = { render };
})(window);

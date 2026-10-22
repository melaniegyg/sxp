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

  const icon = (status) =>
    `<span class="tc-status tc-status--${status}">${status === "met" ? ICON_MET : ICON_NOT_MET}</span>`;

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

    return `
      <div class="tc-row" data-row="${esc(row.id)}">
        ${icon(row.status)}
        <div class="tc-row__body">
          <p class="tc-row__label">${esc(row.label)}</p>
          <p class="tc-row__desc">${esc(row.description)}</p>
          ${help}
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

  function renderBanner(badge) {
    if (badge.earned) {
      // Copy follows the design (node 516:50324), with "GetYourGuide's choice"
      // swapped for the "Top Choice" working title. The award date is appended
      // only when the data carries one — see badge.awardDate in criteria-model.
      const onDate = badge.awardDate ? ` on ${esc(badge.awardDate)}` : "";
      return `
        <div class="tc-banner tc-banner--met">
          <div class="tc-banner__head">
            ${icon("met")}
            <p class="tc-banner__title">You currently meet the requirements to be awarded a Top Choice badge${onDate}</p>
          </div>
          <p class="tc-banner__desc">As long as you stay in the green for all the criteria you will see the badge appear on your activity${onDate}.</p>
        </div>`;
    }
    // Clears the global minimum but not the stricter bar for a crowded city.
    const cityNote = badge.blockedByCityBar
      ? ` Activities in ${esc(badge.city)} are held to a stricter bar than the global minimum.`
      : "";
    return `
      <div class="tc-banner tc-banner--not-met">
        <div class="tc-banner__head">
          ${icon("not-met")}
          <p class="tc-banner__title">You don't currently meet the requirements for a Top Choice badge</p>
        </div>
        <p class="tc-banner__desc">Here's what to work on before the end of the assessment period.${cityNote}</p>
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

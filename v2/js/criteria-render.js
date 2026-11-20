// ============================================================
// SXP ROUND 2 — renderer
//
//   SXPRender.renderActivity(mount, model, catalogue)
//   SXPRender.renderOverview(mount, supplierModel)
//
// Round 2 does NOT use js/defect-cards.js. That module draws the DBR portal's
// layout — a category card with a left-hand defect nav — and 2423:103908 draws
// a flat accordion of tag cards with a booking-count chip. The module is
// shared and unchanged; its recommended-action copy was lifted into
// data/defect-catalogue.json instead. Trend charts are gone entirely.
// ============================================================
(function (global) {
  "use strict";

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Pass is a checkbox, fail an X in the same dark square. Neither is red or
  // green — colour lives in the section card's top bar. (2423:103908)
  const ICON_MET =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 12.2l3.6 3.6 7.2-7.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_NOT_MET =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="0" y="0" width="24" height="24" rx="4" fill="currentColor"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
  const ICON_CHEVRON =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_EXTERNAL =
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 2h8v8M14 2L6.5 9.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11 10.5V14H2V5h3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_SPARKLE =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8z" fill="currentColor"/><path d="M18.5 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" fill="currentColor"/></svg>';

  const statusIcon = (s) => (s === "met" ? ICON_MET : ICON_NOT_MET);

  // ---------------------------------------------------------------
  // The disruption breakdown
  // ---------------------------------------------------------------
  // Booking counts ARE shown in round 2 (settled 2026-11-19), reversing round
  // 1's strip. They will not always sum to the rate printed above them — the
  // export's booking-level rows and its aggregate disagree for 4 of these 19
  // activities, in both directions. See CLAUDE.md.
  function disruptionCard(entry, catalogue, open) {
    const meta = (catalogue.tags && catalogue.tags[entry.tag]) || null;
    // Fall back to the internal tag name only if the catalogue has no row —
    // better a visible internal string than a blank card.
    const name = (meta && meta.name) || entry.tag;
    const desc = (meta && meta.description) || "";
    const ra =
      meta && meta.recActionKey ? (catalogue.recActions || {})[meta.recActionKey] : null;

    const bookings = entry.count === 1 ? "1 booking" : entry.count + " bookings";

    let body = "";
    if (meta && meta.whatYouCanDo && meta.whatYouCanDo.length) {
      body +=
        '<h5 class="sx-dc__h">What you can do</h5><ul class="sx-dc__list">' +
        meta.whatYouCanDo.map((r) => "<li>" + esc(r) + "</li>").join("") +
        "</ul>";
    }
    if (ra) {
      // fillCount: the drawn "Address X reviews…" is this {count} placeholder.
      const title = String(ra.title).replace(/\{count\}/g, entry.count);
      body +=
        '<div class="sx-ra">' +
        '<div class="sx-ra__main">' +
        '<span class="sx-ra__icon">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M16 13H8v-2h8zm-8 4h8v-2H8z" fill="currentColor"/><path fill="currentColor" fill-rule="evenodd" d="M4 2v16a4 4 0 004 4h8a4 4 0 004-4V6.586L15.414 2zm2 16V4h8v4h4v10a2 2 0 01-2 2H8a2 2 0 01-2-2" clip-rule="evenodd"/></svg>' +
        "</span><div>" +
        '<p class="sx-ra__title">' + esc(title) + "</p>" +
        '<p class="sx-ra__desc">' + esc(ra.description) + "</p>" +
        "</div></div>" +
        '<button type="button" class="sx-btn sx-btn--primary">' +
        esc(ra.buttonLabel || "Take action") +
        "</button></div>";
    }
    if (meta && meta.resources && meta.resources.length) {
      body +=
        '<h5 class="sx-dc__h">Resources</h5><ul class="sx-dc__links">' +
        meta.resources
          .map((r) =>
            r.url
              ? '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
                esc(r.title) + ICON_EXTERNAL + "</a></li>"
              : '<li><span class="sx-dc__link--flat">' + esc(r.title) + ICON_EXTERNAL + "</span></li>"
          )
          .join("") +
        "</ul>";
    }

    return (
      '<article class="sx-dc' + (open ? " is-open" : "") + '">' +
      '<button type="button" class="sx-dc__head" aria-expanded="' + (open ? "true" : "false") + '">' +
      '<span class="sx-dc__text"><span class="sx-dc__name">' + esc(name) + "</span>" +
      (desc ? '<span class="sx-dc__desc">' + esc(desc) + "</span>" : "") +
      "</span>" +
      '<span class="sx-dc__meta"><span class="sx-chip-count">' + esc(bookings) + "</span>" +
      '<span class="sx-dc__chev">' + ICON_CHEVRON + "</span></span>" +
      "</button>" +
      (body ? '<div class="sx-dc__body">' + body + "</div>" : "") +
      "</article>"
    );
  }

  // ---------------------------------------------------------------
  // One criterion row
  // ---------------------------------------------------------------
  function rowHtml(row, catalogue) {
    const failing = row.status === "not-met";

    // The collapsed below-the-gate line: no metric, no detail, just a
    // statement that the metrics are withheld.
    if (row.id === "quality-blocked") {
      return (
        '<div class="sx-row sx-row--blocked">' +
        '<span class="sx-row__icon">' + statusIcon(row.status) + "</span>" +
        '<p class="sx-row__blocked">' + esc(row.label) + "</p>" +
        "</div>"
      );
    }

    const m = row.metric;
    let left = '<span class="sx-row__icon">' + statusIcon(row.status) + "</span>";
    if (m) {
      left +=
        '<span class="sx-row__value">' + esc(m.value) + "</span>" +
        (m.criteria
          ? '<span class="sx-row__criteria">Criteria:<br>' + esc(m.criteria) + "</span>"
          : "");
    }

    // The failing variant replaces the description rather than appending to
    // it — the cancellation row's fail copy tells you what to do instead of
    // restating the rule.
    const desc = failing && row.failDescription ? row.failDescription : row.description;

    let main =
      '<p class="sx-row__label">' + esc(row.label) + "</p>" +
      (desc ? '<p class="sx-row__desc">' + esc(desc) + "</p>" : "");

    // TODO(data): nothing in the export backs the Review summary block; it
    // renders only when a fixture supplies `review_summary`. None does today.
    if (failing && row.reviewSummary) {
      main +=
        '<div class="sx-summary"><p class="sx-summary__h">' + ICON_SPARKLE +
        "Review summary</p><p class=\"sx-summary__body\">" + esc(row.reviewSummary.text) +
        '</p><p class="sx-summary__meta">' + esc(row.reviewSummary.meta) + "</p></div>";
    }

    // `0%` is its own component variant with no toggle, and a passing non-zero
    // rate still expands. So the gate is "is there a breakdown", never "is the
    // rate failing" — the only gate the data supports, since 94.3% of
    // activities with a non-zero rate have no tagged bookings at all.
    const tags = row.disruptions || [];
    if (tags.length) {
      main +=
        '<button type="button" class="sx-see" aria-expanded="false">' +
        '<span>See details</span>' + ICON_CHEVRON + "</button>" +
        '<div class="sx-details" hidden>' +
        '<h4 class="sx-details__h">' + esc(row.disruptionsTitle || "Top complaints for this activity") + "</h4>" +
        tags.map((t, i) => disruptionCard(t, catalogue, i === 0)).join("") +
        "</div>";
    }

    if (row.cta && failing) {
      main += '<button type="button" class="sx-btn sx-btn--secondary sx-row__cta">' +
        esc(row.cta.label) + "</button>";
    }

    return (
      '<div class="sx-row' + (failing ? " is-failing" : "") + '">' +
      '<div class="sx-row__left">' + left + "</div>" +
      '<div class="sx-row__main">' + main + "</div>" +
      "</div>"
    );
  }

  // ---------------------------------------------------------------
  // Activity page
  // ---------------------------------------------------------------
  function renderActivity(mount, model, catalogue) {
    const el = typeof mount === "string" ? document.querySelector(mount) : mount;
    if (!el) return;
    catalogue = catalogue || {};

    const earned = model.badge.earned;
    const banner = earned
      ? '<div class="sx-banner sx-banner--ok">' +
        "<p class=\"sx-banner__h\">Nice work! This activity will receive an Excellent Experience badge in " +
        esc(model.badge.awardMonth) + "</p>" +
        '<p class="sx-banner__b">As long as you continue to meet all the criteria below, the badge will be awarded on <strong>' +
        esc(model.badge.awardDate) + "</strong></p></div>"
      : '<div class="sx-banner sx-banner--no">' +
        '<p class="sx-banner__h">This activity does not yet meet the criteria for the Excellent Experience badge</p>' +
        '<p class="sx-banner__b">Review what is not met below. Criteria are reassessed every month, and the next badges are awarded on <strong>' +
        esc(model.badge.awardDate) + "</strong>" +
        // Only say "keep working on it" where work on THIS activity can
        // actually change the outcome. A supplier-level Trust & Safety ban
        // cannot — which is round 1's documented copy bug. No activity in the
        // round-2 data fails T&S, so this branch is currently unreachable.
        (model.sections.some(
          (s) => s.id === "operational" && s.rows.some((r) => r.id === "trust-safety" && r.status === "not-met")
        )
          ? ". This is a Trust &amp; Safety exclusion and applies across your activities."
          : "") +
        "</p></div>";

    const sections = model.sections
      .map((s) => {
        const failed = s.rows.some((r) => r.status === "not-met");
        return (
          '<section class="sx-card' + (failed ? " is-failing" : "") + '">' +
          '<div class="sx-card__bar"></div>' +
          '<header class="sx-card__head"><h3>' + esc(s.title) + "</h3>" +
          '<span class="sx-card__period">' + esc(model.period.text) + "</span></header>" +
          '<div class="sx-card__rows">' + s.rows.map((r) => rowHtml(r, catalogue)).join("") + "</div>" +
          "</section>"
        );
      })
      .join("");

    el.innerHTML = banner + sections;
    wireToggles(el);
  }

  function wireToggles(root) {
    root.querySelectorAll(".sx-see").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        btn.classList.toggle("is-open", !open);
        if (panel) panel.hidden = open;
      });
    });
    root.querySelectorAll(".sx-dc__head").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".sx-dc");
        const open = card.classList.contains("is-open");
        card.classList.toggle("is-open", !open);
        btn.setAttribute("aria-expanded", open ? "false" : "true");
      });
    });
  }

  // ---------------------------------------------------------------
  // Overview page
  // ---------------------------------------------------------------
  function renderOverview(mount, sup, opts) {
    const el = typeof mount === "string" ? document.querySelector(mount) : mount;
    if (!el) return;
    opts = opts || {};
    const preLaunch = opts.preLaunch;

    const chipHtml = (chip) => {
      if (preLaunch) return '<span class="sx-dash">&mdash;</span>';
      if (!chip) return "";
      return (
        '<span class="sx-chip sx-chip--' + esc(chip.id) + '">' +
        (chip.id === "excellence"
          ? '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 12.3l3 3 6-6.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : "") +
        esc(chip.label) + "</span>"
      );
    };

    const row = (r) =>
      '<tr><td class="sx-t__name">' + esc(r.title) + "</td>" +
      '<td class="sx-t__status">' + chipHtml(r.chip) + "</td>" +
      '<td class="sx-t__act"><a class="sx-btn sx-btn--secondary" href="activity.html#' +
      esc(opts.supplierKey || "") + "/" + esc(r.tourId) + '">View details</a></td></tr>';

    let html =
      '<h2 class="sx-h2">Badge status</h2>' +
      '<div class="sx-tabs" role="tablist">' +
      '<button type="button" class="sx-tab' + (preLaunch ? " is-active" : "") +
      '" data-tab="this">This month</button>' +
      '<button type="button" class="sx-tab' + (preLaunch ? "" : " is-active") +
      '" data-tab="next">Next month</button></div>' +
      '<p class="sx-period">Assessment period: ' + esc(sup.period.text.replace("Period checked: ", "")) + "</p>" +
      '<table class="sx-t"><thead><tr><th>Product</th><th>Badge status</th><th></th></tr></thead><tbody>' +
      sup.eligible.map(row).join("") +
      "</tbody></table>";

    // Ineligible activities are a separate table with a Reason, not a status —
    // they are never assessed, so they have no criteria to meet. The reason
    // stays the generic "Activity type": the warehouse category names
    // (Ticketed / Transfers / Trip Enhancers) are internal and never shown.
    if (sup.ineligible.length) {
      html +=
        '<h2 class="sx-h2">Ineligible activities</h2>' +
        '<table class="sx-t"><thead><tr><th>Product</th><th>Reason</th><th></th></tr></thead><tbody>' +
        sup.ineligible
          .map(
            (r) =>
              '<tr><td class="sx-t__name">' + esc(r.title) + "</td>" +
              '<td class="sx-t__status sx-t__reason">' + esc(r.reason) + "</td>" +
              '<td class="sx-t__act"><a class="sx-btn sx-btn--secondary" href="activity.html#' +
              esc(opts.supplierKey || "") + "/" + esc(r.tourId) + '">View details</a></td></tr>'
          )
          .join("") +
        "</tbody></table>";
    }

    el.innerHTML = html;
  }

  global.SXPRender = { renderActivity, renderOverview };
})(window);

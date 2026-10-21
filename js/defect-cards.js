// ============================================================
// DEFECT CARDS — portable, dependency-free renderer
// Extracted from the DBR portal. No build step, no globals required.
//
//   <link rel="stylesheet" href="defect-cards.css">
//   <script src="defect-cards.js"></script>
//   <script>
//     DefectCards.render("#my-container", DATA);
//   </script>
//
// render(target, data, options)
//   target  : a DOM element or a CSS selector string
//   data    : array of categories (see README / sample-data.js)
//   options : { raCopy?, accordion?, emptyText? }
//       raCopy    – map keyed by defect.recAction -> { title, description,
//                   buttonLabel, icon }. Defaults to the GYG set below.
//                   Titles may contain "{count}", filled from defect.count.
//       accordion – true (default): only one category open at a time.
//       emptyText – message shown when data is empty.
// ============================================================
(function () {
  "use strict";

  // --- Icons (inlined @getyourguide/compass set) --------------
  const cIcon = (inner) =>
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    inner + "</svg>";

  const IC_EXCLAMATION_CIRCLE = cIcon('<path fill="currentColor" d="M12 13.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2m1-1h-2v-4.5h2z"/><path fill="currentColor" fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/>');
  const IC_CROSS_CIRCLE = cIcon('<path fill="currentColor" d="M16.207 9.207 13.414 12l2.793 2.793-1.414 1.414L12 13.414l-2.793 2.793-1.414-1.414L10.586 12 7.793 9.207l1.414-1.414L12 10.586l2.793-2.793z"/><path fill="currentColor" fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/>');
  const IC_HEADPHONES = cIcon('<path fill="currentColor" fill-rule="evenodd" d="M12 3a9 9 0 0 1 9 9v6a3 3 0 0 1-3 3h-3v-8h4v-1a7 7 0 1 0-14 0v1h4v8H6a3 3 0 0 1-3-3v-6a9 9 0 0 1 9-9M5 15v3a1 1 0 0 0 1 1h1v-4zm12 4h1a1 1 0 0 0 1-1v-3h-2z" clip-rule="evenodd"/>');
  const IC_CHAT_BUBBLE = cIcon('<path fill="currentColor" d="M8.5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3.5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m4.5-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/><path fill="currentColor" fill-rule="evenodd" d="m2 22 5.348-1.146A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.68.414 3.263 1.146 4.652zm3.253-5.638-.337-.641A7.96 7.96 0 0 1 4 12a8 8 0 1 1 8 8 7.96 7.96 0 0 1-3.72-.916l-.642-.337-3.035.65z" clip-rule="evenodd"/>');
  const IC_SUITCASE = cIcon('<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M15 3C16.1046 3 17 3.89543 17 5V7.00098H19C20.6569 7.00098 22 8.34412 22 10.001V19L21.9961 19.1543C21.9184 20.6883 20.6883 21.9184 19.1543 21.9961L19 22H5L4.8457 21.9961C3.31166 21.9184 2.08163 20.6883 2.00391 19.1543L2 19V10.001C2 8.34412 3.34315 7.00098 5 7.00098H7V5C7 3.89543 7.89543 3 9 3H15ZM5 9.00098C4.44772 9.00098 4 9.44869 4 10.001V19C4 19.5523 4.44772 20 5 20H5.95215L5.95117 9.00098H5ZM7.95215 20H16.001L16 9.00098H7.95117L7.95215 20ZM18.001 20H19C19.5523 20 20 19.5523 20 19V10.001C20 9.44869 19.5523 9.00098 19 9.00098H18L18.001 20ZM9 7.00098H15V5H9V7.00098Z"/>');
  const IC_CREDIT_CARD_CLOCK = cIcon('<path fill="currentColor" d="m17.5 16.078 1.31 1.31-1.413 1.416-1.897-1.897V14.21h2z"/><path fill="currentColor" fill-rule="evenodd" d="M16.5 11a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11m0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M18 3a3 3 0 0 1 3 3v4.499a7.5 7.5 0 0 0-2-1.072v-.802H4V15a1 1 0 0 0 1 1h4.017a7.6 7.6 0 0 0 .133 2H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM5 5a1 1 0 0 0-1 1v.625h15V6a1 1 0 0 0-1-1z" clip-rule="evenodd"/>');
  const IC_PIN_PERSON = cIcon('<path fill="currentColor" fill-rule="evenodd" d="M12 2a8 8 0 0 1 8 8c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 8-8m0 12.281a5.97 5.97 0 0 0-3.55 1.163c.34.45.698.888 1.063 1.31A34 34 0 0 0 12 19.33a34 34 0 0 0 2.487-2.576c.365-.422.723-.86 1.064-1.31A5.97 5.97 0 0 0 12 14.281M12 4a6 6 0 0 0-6 6c0 .912.34 2.011 1.008 3.242q.15.274.314.549a8 8 0 0 1 1.804-.978 4 4 0 1 1 5.748 0 8 8 0 0 1 1.804.978q.165-.274.314-.549C17.66 12.012 18 10.912 18 10a6 6 0 0 0-6-6m0 4.031a2 2 0 1 0 0 4 2 2 0 0 0 0-4" clip-rule="evenodd"/>');
  const IC_SHUTTLE = cIcon('<path fill="currentColor" fill-rule="evenodd" d="M14.583 4A7.417 7.417 0 0 1 22 11.417V17h-2a3 3 0 1 1-6 0h-4a3 3 0 1 1-6 0H2V6.5A2.5 2.5 0 0 1 4.5 4zM7 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2m10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2M4 12v3h.764c.549-.614 1.348-1 2.236-1s1.687.386 2.236 1h5.528c.549-.614 1.348-1 2.236-1s1.687.386 2.236 1H20v-3zm.5-6a.5.5 0 0 0-.5.5V10h4V6zm5.5 4h4V6h-4zm6 0h3.813A5.43 5.43 0 0 0 16 6.188z" clip-rule="evenodd"/>');
  const IC_USERS = cIcon('<path fill="currentColor" fill-rule="evenodd" d="M14.5 3a3.5 3.5 0 0 1 2.62 5.821 6.6 6.6 0 0 1 2.248 1.756c1.11 1.327 1.736 3.024 1.878 4.582l.099 1.091h-6.19a10.5 10.5 0 0 1 1.092 3.923l.083 1.077H1.67l.083-1.077c.137-1.782.757-3.726 1.93-5.251.66-.859 1.5-1.587 2.518-2.065A4 4 0 0 1 11 6.535V6.5A3.5 3.5 0 0 1 14.5 3M9 14.25c-1.633 0-2.856.753-3.731 1.89-.678.881-1.138 1.987-1.37 3.11h10.202c-.232-1.123-.692-2.229-1.37-3.11-.875-1.137-2.098-1.89-3.731-1.89m5.5-4c-.6 0-1.106.114-1.538.305a4 4 0 0 1-1.163 2.302c.74.348 1.386.827 1.937 1.393h5.32a6.4 6.4 0 0 0-1.223-2.39c-.808-.967-1.917-1.61-3.333-1.61M9 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4m5.5-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" clip-rule="evenodd"/>');
  const IC_SHIELD_CHECK = cIcon('<path fill="currentColor" d="M16.487 10.437 11.44 15.82l-3.405-2.905 1.46-1.711 1.772 1.512 3.579-3.818z"/><path fill="currentColor" fill-rule="evenodd" d="M13.539 2.634c1.945 1.281 4.181 2.052 6.502 2.242l1.334.11V9.54c0 5.2-3.069 9.909-7.826 12.008l-1.468.648-1.547-.67C5.733 19.446 2.625 14.713 2.625 9.481V4.974l1.586-.156a15.4 15.4 0 0 0 6.075-2.095L12.012 1.628zM11.492 4.622a17.4 17.4 0 0 1-6.617 2.385v2.474c0 4.335 2.575 8.256 6.553 9.979l.645.279.568-.25c3.94-1.739 6.484-5.641 6.484-9.949V7.042a17.4 17.4 0 0 1-6.823-2.53l-.313-.205z" clip-rule="evenodd"/>');
  const IC_TICKET_VOUCHER = cIcon('<path fill="currentColor" d="M14.543 12.957 13 11.414V16h-2v-4.586l-1.543 1.543-1.414-1.414L12 7.586l3.957 3.957z"/><path fill="currentColor" fill-rule="evenodd" d="M4 22h4.875l1.02-1.088a2.885 2.885 0 0 1 4.21 0L15.125 22H20V2h-4.875l-1.02 1.088a2.885 2.885 0 0 1-4.21 0L8.875 2H4zm4.436-2.456L8.009 20H6V4h2.009l.427.456a4.885 4.885 0 0 0 7.128 0L15.992 4H18v16h-2.008l-.428-.456a4.885 4.885 0 0 0-7.128 0" clip-rule="evenodd"/>');
  const IC_DOCUMENT = cIcon('<path fill="currentColor" d="M16 13H8v-2h8zm-8 4h8v-2H8z"/><path fill="currentColor" fill-rule="evenodd" d="M4 2v16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V6.586L15.414 2zm2 16V4h8v4h4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" clip-rule="evenodd"/>');
  const IC_CLOCK_DURATION = cIcon('<path fill="currentColor" d="m3.178 21.04.729-2.723a10.2 10.2 0 0 0 5.417 3.581c5.468 1.465 11.089-1.78 12.554-7.248S20.098 3.562 14.63 2.097A10.2 10.2 0 0 0 9 2.188l.582 1.913a8.25 8.25 0 1 1 .26 15.865 8.2 8.2 0 0 1-4.168-2.645l2.693.722.518-1.932-6.025-1.614-1.614 6.025z"/><path fill="currentColor" d="M11 7v6.819l5.39 1.902.665-1.886L13 12.403V7zm-7.091 4.333a1 1 0 1 1-1.818.834 1 1 0 0 1 1.818-.834M4.324 8.5a1 1 0 1 0-.833-1.819A1 1 0 0 0 4.324 8.5m2.176-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>');
  const IC_LINK_OUT = cIcon('<path fill="currentColor" d="M9.286 8v2h3.3l-4.293 4.293 1.414 1.414L14 11.414v3.3h2V8z"/><path fill="currentColor" fill-rule="evenodd" d="M3 3v14a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V3zm2 14V5h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2" clip-rule="evenodd"/>');
  const CHEVRON_UP_INNER = '<path fill="currentColor" fill-rule="evenodd" d="m12 9.826-6.293 6.293-1.414-1.414L12 6.998l7.707 7.707-1.414 1.414z" clip-rule="evenodd"/>';

  const CATEGORY_ICONS = {
    "Activity not as advertised": IC_EXCLAMATION_CIRCLE,
    "Attraction Closed": IC_CROSS_CIRCLE,
    "Audio Guide Problems": IC_HEADPHONES,
    "Communication problems": IC_CHAT_BUBBLE,
    "Missing Items to Bring Info": IC_SUITCASE,
    "Payment problems": IC_CREDIT_CARD_CLOCK,
    "Meeting point problems": IC_PIN_PERSON,
    "Meeting point or pickup problems": IC_SHUTTLE,
    "Pickup Problems": IC_SHUTTLE,
    "Too many people": IC_USERS,
    "Trust & Safety Problems": IC_SHIELD_CHECK,
    "Voucher problems": IC_TICKET_VOUCHER,
  };
  const ICON_DEFAULT = IC_EXCLAMATION_CIRCLE;
  const categoryIcon = (name) => CATEGORY_ICONS[name] || ICON_DEFAULT;

  const ICON_CHEVRON =
    '<svg class="category-card__chevron" width="20" height="20" viewBox="0 0 24 24" ' +
    'fill="currentColor" aria-hidden="true">' + CHEVRON_UP_INNER + "</svg>";
  const ICON_EXTERNAL =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    IC_LINK_OUT.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") + "</svg>";

  // --- Default Recommended-action copy (override via options.raCopy) ---
  // Keyed by defect.recAction. Titles may contain "{count}".
  const DEFAULT_RA_COPY = {
    "Booking defect - Not as advertised": {
      title: "Address {count} reviews mentioning the activity was not as advertised",
      description: "Make sure your activity description matches the experience you provide. Include key details to set clear expectations for travelers.",
      buttonLabel: "Take action",
      icon: IC_DOCUMENT,
    },
    "Booking defect - Duration not as advertised": {
      title: "Address {count} recent reviews that mention duration",
      description: "Update your activity duration to reflect real times and include buffer time for large groups so travelers know what to expect.",
      buttonLabel: "Take action",
      icon: IC_CLOCK_DURATION,
    },
    "Catalog - Update guide details": {
      title: "Add more guide details",
      description: "Add details about the staff who lead or assist during an activity. This helps customers know what to expect and can increase bookings.",
      buttonLabel: "Add details",
      icon: IC_USERS,
    },
    "Booking defect - Audio or language": {
      title: "Address {count} recent reviews that mention audio or language",
      description: "Ensure the languages listed for your audio guide match those consistently offered, and add new options to appeal to more customers.",
      buttonLabel: "Take action",
      icon: IC_HEADPHONES,
    },
    "Booking defect - Missing items": {
      title: "Address {count} recent reviews that mention items to bring",
      description: "Specify any items travelers should bring, such as raincoats or water bottles, in the Know Before You Go section.",
      buttonLabel: "Take action",
      icon: IC_SUITCASE,
    },
    "VizOps - Add meeting point picture": {
      title: "Help customers find your meeting point by adding a photo",
      description: "Recent customer feedback shows your meeting point is hard to find. A photo of the exact location reduces confusion, no-shows, and negative reviews.",
      buttonLabel: "Take action",
      icon: IC_PIN_PERSON,
    },
    "Booking defect - Activity overcrowded": {
      title: "Address {count} recent reviews that mention capacity",
      description: "Review your maximum group size and update it if needed. To prevent overcrowding, ensure participants cannot book beyond the maximum group size.",
      buttonLabel: "Take action",
      icon: IC_USERS,
    },
  };

  // --- Helpers -------------------------------------------------
  const escapeHtml = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const isUrl = (s) => /^https?:\/\//i.test(String(s || "").trim());

  function faqLabel(entry) {
    if (!isUrl(entry)) return entry; // already a human label
    try {
      const path = new URL(entry).pathname;
      let slug = path.split("/").filter(Boolean).pop() || entry;
      slug = decodeURIComponent(slug).replace(/^\d+-/, "").replace(/-/g, " ").trim();
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    } catch (e) {
      return entry;
    }
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  const fillCount = (text, count) =>
    String(text).replace(/\{count\}/g, count == null ? "recent" : count);

  // --- Panels for the selected defect ------------------------
  function renderPanels(content, defect, raCopy) {
    const ra = defect.recAction && raCopy[defect.recAction];
    const hasFaq = defect.faqLinks && defect.faqLinks.length;
    const hasReviews = defect.relatedReviews === true;
    const hasPageLink = !!(defect.pageLinkLabel && defect.pageLinkLabel.trim());

    let html = '<div class="dp-top">';

    html += '<div class="dp-advice"><h4 class="dp-heading">What you can do</h4>';
    if (defect.recommendations && defect.recommendations.length) {
      html += '<ul class="wycd-list">' +
        defect.recommendations.map((r) => "<li>" + escapeHtml(r) + "</li>").join("") + "</ul>";
    } else {
      html += '<p class="dp-empty">Review this defect against your activity details, then update your listing or reach out to affected customers.</p>';
    }
    html += "</div>";

    if (hasFaq) {
      html += '<aside class="dp-faq"><h4 class="dp-heading">FAQ resources</h4><ul class="faq-list">' +
        defect.faqLinks.map((u) => {
          const label = escapeHtml(faqLabel(u));
          if (isUrl(u)) {
            return '<li><a href="' + escapeHtml(u) + '" target="_blank" rel="noopener">' +
              label + ICON_EXTERNAL + "</a></li>";
          }
          return '<li><a class="faq-link--flat" href="#" role="link">' + label + ICON_EXTERNAL + "</a></li>";
        }).join("") +
        "</ul></aside>";
    }
    html += "</div>"; // .dp-top

    if (ra) {
      html += '<div class="dp-ra"><div class="dp-ra-card">' +
        '<div class="dp-ra-card__main">' +
          '<span class="dp-ra-card__icon">' + (ra.icon || IC_DOCUMENT) + "</span>" +
          "<div>" +
            '<p class="dp-ra-card__title">' + escapeHtml(fillCount(ra.title, defect.count)) + "</p>" +
            '<p class="dp-ra-card__desc">' + escapeHtml(ra.description) + "</p>" +
          "</div>" +
        "</div>" +
        '<button type="button" class="btn-primary dp-ra-card__btn">' +
          escapeHtml(ra.buttonLabel || "Take action") + "</button>" +
      "</div></div>";
    } else if (hasReviews || hasPageLink) {
      html += '<div class="dp-actions">';
      if (hasReviews) html += '<button type="button" class="btn-secondary see-reviews-btn">See related reviews</button>';
      if (hasPageLink) html += '<button type="button" class="btn-primary page-link-btn">' + escapeHtml(defect.pageLinkLabel) + "</button>";
      html += "</div>";
    }

    content.innerHTML = html;
  }

  // --- Build one category card -------------------------------
  function buildCard(cat, index, opts) {
    const card = el("section", "category-card");
    if (index !== 0 && opts.accordion) card.classList.add("is-collapsed");

    const body = el("div", "category-card__body");

    const left = el("div", "cc-left");
    const head = el("button", "cc-left__head");
    head.type = "button";
    head.setAttribute("aria-expanded", index === 0 || !opts.accordion ? "true" : "false");
    head.innerHTML =
      '<span class="cc-icon">' + categoryIcon(cat.category) + "</span>" +
      '<span class="cc-title">' + escapeHtml(cat.category) + "</span>";

    const nav = el("div", "defect-nav");
    left.appendChild(head);
    left.appendChild(nav);

    const right = el("div", "cc-right");
    const collapse = el("button", "cc-collapse", ICON_CHEVRON);
    collapse.type = "button";
    collapse.setAttribute("aria-label", "Toggle section");
    const content = el("div", "cc-content");
    right.appendChild(collapse);
    right.appendChild(content);

    (cat.defects || []).forEach((defect, di) => {
      const item = el("button", "defect-nav-item" + (di === 0 ? " is-active" : ""));
      item.type = "button";
      item.innerHTML =
        '<span class="defect-nav-item__title">' + escapeHtml(defect.name) + "</span>" +
        '<span class="defect-nav-item__desc">' + escapeHtml(defect.description) + "</span>";
      item.addEventListener("click", () => {
        nav.querySelectorAll(".defect-nav-item").forEach((n) => n.classList.remove("is-active"));
        item.classList.add("is-active");
        renderPanels(content, defect, opts.raCopy);
      });
      nav.appendChild(item);
    });

    if (cat.defects && cat.defects.length) renderPanels(content, cat.defects[0], opts.raCopy);

    const toggle = () => {
      if (!opts.accordion) {
        card.classList.toggle("is-collapsed");
        head.setAttribute("aria-expanded", card.classList.contains("is-collapsed") ? "false" : "true");
        return;
      }
      const willOpen = card.classList.contains("is-collapsed");
      const container = card.parentNode;
      if (container) {
        container.querySelectorAll(".category-card").forEach((c) => {
          c.classList.add("is-collapsed");
          const h = c.querySelector(".cc-left__head");
          if (h) h.setAttribute("aria-expanded", "false");
        });
      }
      if (willOpen) {
        card.classList.remove("is-collapsed");
        head.setAttribute("aria-expanded", "true");
      }
    };
    head.addEventListener("click", toggle);
    collapse.addEventListener("click", toggle);

    body.appendChild(left);
    body.appendChild(right);
    card.appendChild(body);
    return card;
  }

  // --- Public entry point ------------------------------------
  function render(target, data, options) {
    const container = typeof target === "string" ? document.querySelector(target) : target;
    if (!container) {
      console.error("DefectCards.render: target not found", target);
      return;
    }
    const opts = {
      raCopy: (options && options.raCopy) || DEFAULT_RA_COPY,
      accordion: !options || options.accordion !== false,
      emptyText: (options && options.emptyText) || "No flagged defects.",
    };

    container.classList.add("defect-cards");
    container.innerHTML = "";

    if (!data || !data.length) {
      container.appendChild(el("div", "defect-cards__empty", escapeHtml(opts.emptyText)));
      return;
    }
    data.forEach((cat, i) => container.appendChild(buildCard(cat, i, opts)));
  }

  window.DefectCards = { render: render, DEFAULT_RA_COPY: DEFAULT_RA_COPY };
})();

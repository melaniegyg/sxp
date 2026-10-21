// ============================================================
// TOP CHOICE — criteria model
//
// Turns one row of `sxp_activity_criteria` (see data/activity-21293.json)
// into the section / row structure the design renders.
//
//   TopChoice.build(activity) -> { badge, period, sections: [...] }
//
// Every row comes out shaped the same way, so a passing and a failing
// activity render through one code path:
//
//   { id, label, description, status, metric?, failHelp? }
//     status  : "met" | "not-met"
//     metric  : { value, barText }   — only on the Excellence rows
//
// Source of truth for the thresholds is the activity row itself wherever
// the field exists. Where it doesn't, the constant is marked TODO below
// and should be replaced once the export carries it.
// ============================================================
(function (global) {
  "use strict";

  // --- Thresholds not present in the activity export ----------
  // TODO(data): these are hardcoded from the criteria deck (v3, 15 Oct).
  // `defect_rate_bar` and `rating_bar` DO come from the row and already
  // account for city bars; these do not vary and will silently rot.
  const MIN_REVIEWS = 50;
  const CANCELLATION_HOURS = 24;

  // TODO(data): there is no pickup bar field. The deck applies the same
  // number to quality and pickup ("Quality and pickup defect rates ≤ 2.0%,
  // stricter in 287 crowded cities"), so we follow the quality bar rather
  // than hardcode 2.0% — which would be wrong in every stricter city.
  const pickupBar = (a) => a.defect_rate_bar;

  // --- Labels -------------------------------------------------
  // NOTE(naming): the design calls this row "Disrupted Booking Rate" and
  // reuses the DBR definition. It is NOT DBR — DBR counts all 42 defect
  // tags, this counts 9 quality tags + non-force-majeure cancellation.
  // For this sample activity: platform_dbr = 2.29%, quality_defect_rate =
  // 1.21%. Kept as designed for now; change this one constant when the
  // naming is settled.
  const QUALITY_RATE_LABEL = "Disrupted Booking Rate";

  const pct = (n) => (n * 100).toFixed(n * 100 < 1 ? 2 : 1).replace(/\.0+$/, "") + "%";
  const rating = (n) => n.toFixed(2).replace(/0$/, "");
  const status = (ok) => (ok ? "met" : "not-met");

  const DATE_FMT = { year: "numeric", month: "short", day: "numeric" };
  const fmtDate = (iso) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { ...DATE_FMT, timeZone: "UTC" });

  function build(a) {
    const sections = [
      {
        id: "review-count",
        title: "Review count",
        rows: [
          {
            id: "min-reviews",
            label: `At least ${MIN_REVIEWS} reviews`,
            description: "This allows us to build enough signal about your performance.",
            status: status(a.crit_min_reviews),
            // The design shows pass/fail only. The actual count is far more
            // useful when failing ("38 of 50"), so we carry it through.
            count: a.reviews_in_window,
            failHelp:
              "Keep collecting reviews — we check again at the end of each assessment period.",
          },
        ],
      },
      {
        id: "operational",
        title: "Basic operational standards",
        rows: [
          {
            id: "cancellation",
            label: `${CANCELLATION_HOURS} hour cancellation policy`,
            description: "This ensures the best flexibility for travelers.",
            status: status(a.crit_flexible_cancellation),
            failHelp:
              "Contact your Account Manager or customer care in order to adjust the cancellation policy on your activity.",
          },
          {
            id: "trust-safety",
            label: "Trust and Safety check",
            description:
              "We constantly monitor complaints and reviews related to serious issues on your tours.",
            // Three separate rules collapse into this single row, exactly as
            // designed. Two of them (case rate, tag rate) are judged across
            // ALL of the supplier's activities, so this row can fail because
            // of a different activity — see `scope` below.
            status: status(a.crit_ts_no_severe_case && a.crit_ts_case_rate && a.crit_ts_tag_rate),
            scope: a.crit_ts_no_severe_case ? "supplier" : "activity",
            failHelp:
              "Contact your Account Manager or customer care to understand what was reported.",
          },
        ],
      },
      {
        id: "excellence",
        title: "Exceptional customer experience",
        rows: [
          {
            id: "rating",
            label: "Rating",
            description:
              "The average star rating received from customer reviews of your products. Recent reviews have more influence than older ones, to ensure that customers see a fair representation of your current quality.",
            status: status(a.crit_rating),
            metric: {
              value: rating(a.rating_in_window),
              barText: `Criteria: ${a.rating_bar}`,
            },
          },
          {
            id: "quality-rate",
            label: QUALITY_RATE_LABEL,
            description:
              "Calculated by taking the number of bookings with a complaint or negative experience and dividing it by the total number of conducted bookings.",
            status: status(a.crit_defect_rate),
            metric: {
              value: pct(a.quality_defect_rate),
              barText: `Criteria: ≤ ${pct(a.defect_rate_bar)}`,
            },
          },
          {
            id: "pickup-rate",
            label: "Pickup Problem Rate",
            description:
              "Calculated by taking the number of bookings with a pickup problem and dividing it by the total number of conducted bookings.",
            status: status(a.crit_pickup_rate),
            metric: {
              value: pct(a.pickup_defect_rate),
              barText: `Criteria: ≤ ${pct(pickupBar(a))}`,
            },
          },
        ],
      },
    ];

    return {
      activityTitle: a.activity_title,
      // Gate 0. The design has no state for this — an out-of-scope activity
      // presumably never sees the tab at all. Surfaced so the page can decide.
      inScope: a.crit_in_scope,
      badge: {
        earned: a.has_badge,
        // True when the activity clears the global minimum but not its own
        // (stricter) city bar — i.e. it would qualify in a less crowded city.
        blockedByCityBar: !a.has_badge && a.has_badge_min,
        city: a.home_city,
        cityStep: a.destination_step,
      },
      period: {
        start: fmtDate(a.window_start),
        end: fmtDate(a.window_end),
        text: `Assessment period: ${fmtDate(a.window_start)} – ${fmtDate(a.window_end)}`,
      },
      sections,
    };
  }

  global.TopChoice = { build, QUALITY_RATE_LABEL };
})(window);

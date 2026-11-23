// ============================================================
// SXP ROUND 2 — criteria model
//
// Turns the round-2 supplier export into the structures the two pages render.
//
//   SXP.buildSupplier(file) -> { supplier, eligible: [...], ineligible: [...] }
//   SXP.buildActivity(a)    -> { badge, period, sections: [...] }
//
// The export is one file per SUPPLIER, each holding an `activities` array of
// `sxp_activity_criteria` rows. That is the shape the overview needs; the
// activity page just picks one row out of it.
//
// Round 1's `TopChoice.build()` took a single activity and knew nothing about
// siblings. Keep both entry points — the activity page must not need the
// supplier file's other rows to render.
// ============================================================
(function (global) {
  "use strict";

  // Every supplier-facing string comes from js/i18n.js. Strings are resolved
  // when build() / buildSupplier() run, so a page rebuilds the model after
  // switching language.
  const I18N = global.SXP_I18N;
  const t = (key, vars) => I18N.t(key, vars);

  // --- Thresholds not present in the export -------------------
  // TODO(data): hardcoded from the criteria deck (v3, 15 Oct). `rating_bar`
  // and `defect_rate_bar` DO come from the row and already account for city
  // bars; these two do not vary and will silently rot.
  const MIN_REVIEWS = 50;
  const CANCELLATION_HOURS = 24;

  // TODO(data): there is no pickup bar field. The deck applies the same number
  // to quality and pickup, stricter in crowded cities, so follow the quality
  // bar rather than hardcode 2.0% — which would be wrong in every stricter
  // city. Across these 19 activities the quality bar is 0.5%, 0.75%, 1% or 2%.
  const pickupBar = (a) => a.defect_rate_bar;

  // --- The programme-level dates ------------------------------
  // TODO(data): the export carries each activity's OWN measurement window
  // (window_start / window_end, e.g. 2026-05-15 → 2026-11-10) but no award
  // date and no programme period. Every design draws the same period and the
  // same award date for all activities, so they are fixed here and each row
  // keeps its real window untouched. Same approach as round 1.
  const PERIOD_START = "2026-07-01";
  const PERIOD_END = "2026-12-31"; // inclusive, as the designs label it
  const AWARD_DATE = "2027-01-01";

  // --- Formatting ---------------------------------------------
  // Metric VALUES: one decimal ("2.2%"), two below 1% ("0.59%"), bare "0%".
  // Localised: "2.2%" in English, "2,2 %" in Spanish.
  const pct = (n) => {
    if (!n) return "0" + I18N.pctSuffix();
    const v = n * 100;
    const d = v < 1 ? 2 : 1;
    return I18N.num(v, d, d) + I18N.pctSuffix();
  };
  // A bar drops trailing zeros — "2%" not "2.0%", "0.5%" not "0.50%".
  const barPct = (n) => I18N.num((n || 0) * 100, 0, 2) + I18N.pctSuffix();
  const barNum = (n) => I18N.num(n, 0, 2);
  // Ratings keep two decimals but drop a trailing zero: "4.82", "4.9".
  // Truncated, never rounded: split-local-tours 862564 has 4.7957 against a
  // 4.8 bar, which rounding printed as a failing "4.8". Rounding down means a
  // rating below its bar can never display as reaching it, and a passing one
  // can't drop below, since bars are whole tenths. The 1e-9 absorbs float
  // error (4.8 * 100 is 479.99999999999994 in JS).
  const ratingText = (n) =>
    n == null ? "—" : I18N.num(Math.floor(n * 100 + 1e-9) / 100, 1, 2);
  const status = (ok) => (ok ? "met" : "not-met");

  const fmtDate = (iso, opts) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(I18N.locale(), {
      day: "numeric",
      timeZone: "UTC",
      ...opts,
    });
  const fmtShort = (iso) => fmtDate(iso, { month: "short", year: "numeric" });
  const fmtLong = (iso) => fmtDate(iso, { month: "long", year: "numeric" });
  const fmtMonth = (iso) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(I18N.locale(), { month: "long", timeZone: "UTC" });

  // "Period checked: July 1, 2026 – Dec 31, 2026" — note the design mixes a
  // full month on the start and an abbreviated one on the end. Reproduced.
  // A function, not a constant: it depends on the current language.
  const periodText = () =>
    t("period.checked", { range: fmtLong(PERIOD_START) + " – " + fmtShort(PERIOD_END) });

  // --- Criteria lines -----------------------------------------
  // No row carries a "Criteria:" line under its number any more. The review
  // count's `>50` went with 2423:106466 (label "50 reviews from this
  // period"), which also ends the old clash between `>50` and "At least 50".
  // The quality rows no longer carry a "Criteria:" line under the number —
  // 2519:10642 folds the bar into the description sentence instead, and with
  // INCLUSIVE wording ("4.6 or higher", "2% or lower"), so the old `> 4.6` /
  // `< 2.0%` boundary clash is gone for these rows.
  //
  // The node hardcodes 4.6 and 2%. These bind to the activity's own bars, as
  // every threshold here does — Porto's are 4.8 and 0.5%.
  const ratingSentence = (a) => t("row.rating.desc", { bar: barNum(a.rating_bar) });
  const rateSentence = (key, bar) => t(key, { bar: barPct(bar) });

  // --- Badge outcome ------------------------------------------
  // Recomputed rather than read from `has_badge`, with pickup ignored when the
  // activity has none. The export fails 15,671 rows on `crit_pickup_rate` that
  // have `has_pickup = false` — a bar the deck applies only "if the activity
  // has pickup" — and for 112 of them it is the ONLY failure, which would show
  // every visible criterion green under a refusal banner.
  //
  // The overview MUST use this too, or a chip built from `has_badge` would
  // contradict the page it links to. One activity here is affected (Party
  // Deck's "Wine Tasting", pickup rate 1.0 with has_pickup false); it fails
  // three other criteria, so its outcome does not actually change.
  const earnedBadge = (a, min) => {
    const rating = min ? a.crit_rating_min : a.crit_rating;
    const defect = min ? a.crit_defect_rate_min : a.crit_defect_rate;
    const pickup = min ? a.crit_pickup_rate_min : a.crit_pickup_rate;
    const pickupOk = a.has_pickup ? pickup : true;
    return Boolean(
      a.crit_in_scope && a.meets_entry && a.meets_ts && rating && defect && pickupOk
    );
  };

  // --- Section status, and the overview's chip ----------------
  // The three sections of the activity page are exactly the three badge-status
  // chips on the overview, which is why no separate eligibility logic exists.
  const sectionStatus = (a) => ({
    review: Boolean(a.crit_min_reviews),
    operations: Boolean(
      a.crit_ts_no_severe_case &&
        a.crit_ts_case_rate &&
        a.crit_ts_tag_rate &&
        a.crit_flexible_cancellation
    ),
    quality: Boolean(
      a.crit_rating && a.crit_defect_rate && (a.has_pickup ? a.crit_pickup_rate : true)
    ),
  });

  // CASCADE (settled 2026-11-19): when more than one section fails, the chip
  // names the FIRST in declared order — Review, then Operations, then Quality.
  //
  // That is equivalent to "the section the supplier lands on": the activity
  // page sorts failing sections first and keeps declared order within the
  // failing group, so its topmost section is always this one. Keep the two in
  // sync — changing the page's sort silently breaks the chip's promise.
  //
  // It also stops the chip contradicting the collapsed quality card. Below the
  // review gate the page refuses to state customer-experience performance at
  // all, so chipping such a row "Quality not met" would link to a page that
  // declines to back it. Five of these 19 activities are in that state.
  const chip = (id) => ({ id, label: t("chip." + id) });
  const CHIPS = {
    get review() { return chip("reviews"); },
    get operations() { return chip("operations"); },
    get quality() { return chip("quality"); },
  };
  // A supplier-level exclusion (review manipulation, 2241:42264) fails
  // Operations on EVERY in-scope activity and wins the cascade — the design
  // chips all five rows "Operations not met", including ones that would
  // otherwise read "Reviews not met". Ineligible activities stay where they
  // are: they were never in the program to be excluded from.
  function chipFor(a, exclusion) {
    if (!a.crit_in_scope) return null; // listed under Ineligible instead
    if (exclusion) return CHIPS.operations;
    const s = sectionStatus(a);
    if (!s.review) return CHIPS.review;
    if (!s.operations) return CHIPS.operations;
    if (!s.quality) return CHIPS.quality;
    return chip("excellence");
  }

  // --- Ineligibility ------------------------------------------
  // `crit_in_scope` is exactly "not a ticket, transfer or trip enhancer",
  // verified against the whole table. Read the flag, never the categories:
  // l0 `Other` splits both ways (Cruises, Spa, Self-Guided, Wellness and Ski
  // Access are all in scope).
  //
  // The category names are warehouse taxonomy and NEVER reach the supplier —
  // the Reason stays one generic sentence even though the three groups are
  // distinguishable. Settled 2026-11-19; copy updated by Melanie 2026-11-20
  // (was "Activity type"). The overview adds an info tooltip beside it.
  // Copy lives in i18n.js: "ineligible.reason" and "ineligible.tip".

  // --- Disruption breakdown -----------------------------------
  // `quality_breakdown` / `pickup_breakdown` are {tag: distinctBookings},
  // precomputed in data/ from the export's raw record arrays. The pickup one
  // is re-filtered by TAG NAME — the export builds its records from the
  // `Pickup Problems` CATEGORY, which also contains Change Pick Up Time and
  // Change Pick Up Location, neither of which the pickup rate counts.
  //
  // Counts ARE shown in round 2 (chips reading "6 bookings"), reversing round
  // 1's strip. Settled 2026-11-19. They will not always sum to the rate above
  // them: 4 of these 19 activities do not reconcile, in both directions.
  const breakdown = (map) =>
    Object.entries(map || {})
      .map(([tag, count]) => ({ tag, count }))
      .sort((x, y) => y.count - x.count || x.tag.localeCompare(y.tag));

  // `exclusion` is the supplier file's `supplier_exclusion`, or null.
  function build(a, exclusion = null) {
    const s = sectionStatus(a);
    const belowReviewGate = !s.review;

    const qualityTags = breakdown(a.quality_breakdown);
    const pickupTags = breakdown(a.pickup_breakdown);

    const baseSections = [
      {
        id: "review-count",
        title: t("sec.review-count"),
        rows: [
          {
            id: "min-reviews",
            bannerReason: t("row.reviews.reason"),
            // 2423:106466 / 2423:106417: "50 reviews from this period". The
            // count shows only when failing; passing is the glyph alone.
            label: t("row.reviews.label", { n: MIN_REVIEWS }),
            description: t("row.reviews.desc"),
            status: status(a.crit_min_reviews),
            ...(belowReviewGate
              ? {
                  metric: { value: String(a.reviews_in_window) },
                  cta: { label: t("row.reviews.cta") },
                }
              : {}),
          },
        ],
      },
      {
        id: "operational",
        title: t("sec.operational"),
        rows: [
          {
            // Copy follows 720:66225, which 2423:106930 now draws — settling
            // round 1's four-string disagreement in its favour.
            id: "cancellation",
            bannerReason: t("row.cancel.reason"),
            label: t("row.cancel.label", { h: CANCELLATION_HOURS }),
            description: t("row.cancel.desc"),
            status: status(a.crit_flexible_cancellation),
            failDescription: t("row.cancel.fail"),
            cta: { label: t("row.cancel.cta") },
          },
          {
            id: "trust-safety",
            bannerReason: t("row.ts.reason"),
            label: t("row.ts.label"),
            description: t("row.ts.desc"),
            // Three rules collapse into one row. Two of them (case rate, tag
            // rate) are judged across ALL the supplier's activities, so this
            // row can fail because of a different activity entirely.
            status: status(
              !exclusion &&
                a.crit_ts_no_severe_case && a.crit_ts_case_rate && a.crit_ts_tag_rate
            ),
            // Review manipulation, 2553:99731. The email is underlined in the
            // node; the row renders it as a mailto link.
            ...(exclusion
              ? {
                  // {email} is left in place for the row to render as a link.
                  failDescription: t("row.ts.failManipulation"),
                  failEmail: "supplierpartner.care@getyourguide.com",
                }
              : {}),
            // Only ONE failing variant is drawn (`Severe - Activity`). The
            // other three modes — supplier-level severe, rule B case rate,
            // rule C tag rate — have no design and no data: none of these 19
            // activities fails any T&S rule. The branch below is the drawn
            // sentence; the rest fall back to it rather than inventing copy.
            //
            // TODO(design+data): three T&S failure states undrawn.
            // TODO(data): no field carries the ban expiry. Round 1 hand-wrote
            // `ts_cases`; the round-2 component needs only the date, not the
            // case table, but the six-month invariant still governs it.
            ...(exclusion ? {} : { failDescription: a.ts_excluded_until
              ? t("row.ts.failSevereUntil", { date: fmtLong(a.ts_excluded_until) })
              : t("row.ts.failSevere") }),
          },
        ],
      },
      {
        id: "quality",
        title: t("sec.quality"),
        rows: [
          {
            id: "rating",
            label: t("row.rating.label"),
            description: ratingSentence(a),
            status: status(a.crit_rating),
            metric: { value: ratingText(a.rating_in_window) },
            bannerReason: t("row.rating.reason"),
            // TODO(data): the failing variant carries a "Review summary" AI
            // block ("AI summary based on N reviews … Updated weekly").
            // Nothing in the export backs it, so it renders only when a
            // fixture supplies one. None currently does.
            reviewSummary: a.review_summary || null,
          },
          {
            // Renamed from round 1's "Disrupted booking rate", which was the
            // name of a DIFFERENT metric — DBR counts all 42 tags, this counts
            // 9 quality tags + non-FM cancellation. For Edinburgh:
            // platform_dbr 1.00% vs quality_defect_rate 0.48%.
            id: "quality-rate",
            // "Complaints", per 2519:10642 — was "Complaint rate". Its
            // description now has its own wording ("general complaint"),
            // closing the copy bug where it repeated the pickup row's.
            label: t("row.complaints.label"),
            description: rateSentence("row.complaints.desc", a.defect_rate_bar),
            status: status(a.crit_defect_rate),
            metric: { value: pct(a.quality_defect_rate) },
            bannerReason: t("row.complaints.reason"),
            // `0%` is its own component variant, and `Passing` (drawn at 1.2%,
            // under the bar) still expands. So expandability tracks "are there
            // tagged bookings", not "is the rate failing" — which is the only
            // gate the data supports.
            disruptions: qualityTags,
            disruptionsTitle: t("row.complaints.top"),
          },
          // The pickup bar applies only "if the activity has pickup" (deck,
          // Gate 4). Without pickup there is nothing to measure, so the row is
          // omitted rather than shown passing at 0% — a green tick for a
          // criterion never assessed reads as an achievement.
          ...(a.has_pickup
            ? [
                {
                  id: "pickup-rate",
                  label: t("row.pickup.label"),   // was "Pickup problem rate"; 2519:10642
                  description: rateSentence("row.pickup.desc", pickupBar(a)),
                  status: status(a.crit_pickup_rate),
                  metric: { value: pct(a.pickup_defect_rate) },
                  bannerReason: t("row.pickup.reason"),
                  disruptions: pickupTags,
                  disruptionsTitle: t("row.pickup.top"),
                },
              ]
            : []),
        ],
      },
    ];

    // Below the gate the whole quality section collapses to one line. It stays
    // visible rather than being dropped so the supplier can see the criterion
    // exists and why it is withheld.
    //
    // Copy from 2535:45722 (Gate Card - Quality, "Not enough reviews"),
    // which replaced "We can only show your performance in customer
    // experience metrics once you have 50 new reviews".
    //
    // NOTE(copy): the collapsed line keeps "50 new reviews" while the review
    // row above says "At least 50 reviews" — the same design, two phrasings,
    // in the one state where both are on screen. Drawn form reproduced.
    const byId = (id) => baseSections.find((x) => x.id === id);
    if (belowReviewGate) {
      byId("quality").rows = [
        {
          id: "quality-blocked",
          label: t("row.blocked", { n: MIN_REVIEWS }),
          status: "not-met",
        },
      ];
    }

    // Failing first, original order within each group — so the topmost section
    // is always the one the overview chip names. See the cascade note above.
    const rowFailed = (r) => r.status === "not-met";
    const ordered = baseSections.map((sec) => ({
      ...sec,
      rows: [...sec.rows.filter(rowFailed), ...sec.rows.filter((r) => !rowFailed(r))],
    }));
    const sectionFailed = (sec) => sec.rows.some(rowFailed);
    const failingFirst = [
      ...ordered.filter(sectionFailed),
      ...ordered.filter((sec) => !sectionFailed(sec)),
    ];
    // Excluded, Operational standards leads (2553:99707), even ahead of a
    // failing review count — the same section the overview chip names.
    const sections = exclusion
      ? [...failingFirst.filter((x) => x.id === "operational"), ...failingFirst.filter((x) => x.id !== "operational")]
      : failingFirst;

    // The failing banner, from 2519:10642: "This activity does not meet the
    // quality standards to be awarded the badge" / "This activity doesn't
    // meet the criteria due to complaints. See that section below to find out
    // how to improve."
    //
    // The node draws one case — Quality failing on complaints. Generalised:
    // the headline names the TOPMOST failing section (the one the overview
    // chip names, and the first card on the page), and the body lists every
    // failing row's reason across all sections. "that section" becomes
    // "those sections" when more than one has a real failure. The collapsed
    // below-the-gate quality line is not a failure of its own and adds no
    // reason — it is explained by "too few reviews".
    const failingRows = sections
      .flatMap((sec) => sec.rows.filter((r) => rowFailed(r) && r.bannerReason).map((r) => ({ sec: sec.id, r })));
    const reasons = failingRows.map((x) => x.r.bannerReason);
    const joinList = (xs) =>
      xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + t("list.and") + xs[xs.length - 1];
    const failingSectionCount = new Set(failingRows.map((x) => x.sec)).size;
    const topFailing = sections.find(sectionFailed);
    // Below the review gate the copy is Melanie's own (2026-11-20) — the
    // design draws no banner for this state. It replaces the generic
    // "does not meet the review count…" / "due to too few reviews".
    // Excluded: 2553:99723. Red, no icon — `critical` rather than `warn`.
    const failBanner = exclusion
      ? {
          critical: true,
          headline: t("banner.excluded.headline"),
          body: t("banner.excluded.body"),
        }
      : belowReviewGate
      ? {
          headline: t("banner.reviews.headline"),
          body: t("banner.reviews.body", { n: MIN_REVIEWS }),
        }
      : topFailing
      ? {
          // One key per section rather than lower-casing the title, which
          // does not survive translation.
          headline: t("banner.fail.headline." + topFailing.id),
          body: t(failingSectionCount > 1 ? "banner.fail.body.many" : "banner.fail.body.one", {
            reasons: joinList(reasons),
          }),
        }
      : null;

    return {
      tourId: a.tour_id,
      activityTitle: a.activity_title,
      inScope: a.crit_in_scope,
      badge: {
        earned: !exclusion && earnedBadge(a),
        // Clears the global minimum but not its own stricter city bar — it
        // would qualify in a less crowded city. Four such blocks across three
        // of these activities (Split ×2, Kyoto).
        blockedByCityBar: !exclusion && !earnedBadge(a) && earnedBadge(a, true),
        city: a.home_city,
        cityStep: a.destination_step,
        awardDate: fmtLong(AWARD_DATE),
        awardMonth: fmtMonth(AWARD_DATE),
        failBanner,
      },
      period: { text: periodText(), start: PERIOD_START, end: PERIOD_END },
      sections,
    };
  }

  // --- Supplier view (the overview page) ----------------------
  function buildSupplier(file) {
    const rows = (file.activities || []).map((a) => ({
      tourId: a.tour_id,
      title: a.activity_title,
      inScope: a.crit_in_scope,
      chip: chipFor(a, file.supplier_exclusion || null),
      reason: t("ineligible.reason"),
      activity: a,
    }));
    return {
      supplierId: file.supplier_id,
      supplierName: file.supplier_name,
      period: { text: periodText(), start: PERIOD_START, end: PERIOD_END },
      awardDate: fmtLong(AWARD_DATE),
      awardMonth: fmtMonth(AWARD_DATE),
      // 2241:42264: "Due to review manipulation, your activities are not
      // eligible for the program until February 1, 2027".
      exclusion: file.supplier_exclusion
        ? {
            headline: t("exclusion.headline", { date: fmtLong(file.supplier_exclusion.until) }),
            body: t("exclusion.body"),
          }
        : null,
      eligible: rows.filter((r) => r.inScope),
      ineligible: rows.filter((r) => !r.inScope),
    };
  }

  global.SXP = {
    build,
    buildSupplier,
    chipFor,
    MIN_REVIEWS,
  };
})(window);

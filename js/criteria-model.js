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

  // Both rate charts run 0–10%, per the design's axis labels.
  const RATE_AXIS_MAX = 0.1;

  // TODO(data): `details` carries the monthly trend and the top-disruption
  // breakdown. Neither exists in sxp_activity_criteria — the export holds one
  // aggregate per window — so fixtures supply it by hand. Rows without it fall
  // back to a placeholder in the renderer.
  const detailsFor = (a, id) => (a.details && a.details[id]) || null;

  // --- Badge outcome, with the pickup bar scoped to pickup activities -------
  // The export fails 15,671 activities on `crit_pickup_rate` that have
  // `has_pickup = false` — a bar the criteria deck says applies only "if the
  // activity has pickup". For 112 of them it is the ONLY failure, so taking
  // has_badge at face value denies a badge no visible criterion explains.
  //
  // So the outcome is recomputed here rather than read from has_badge, with
  // pickup ignored when the activity has none. Verified safe to derive: among
  // the 10,190 rows that reach Gate 4,
  //   meets_excellence === crit_rating && crit_defect_rate && crit_pickup_rate
  // holds exactly, and
  //   has_badge === crit_in_scope && meets_entry && meets_ts && meets_excellence
  // holds for all 207,496 rows.
  //
  // NOTE: this makes the page disagree with `has_badge` for those 112
  // activities, deliberately. The export is the thing that needs fixing.
  const earnedBadge = (a, min) => {
    const rating = min ? a.crit_rating_min : a.crit_rating;
    const defect = min ? a.crit_defect_rate_min : a.crit_defect_rate;
    const pickup = min ? a.crit_pickup_rate_min : a.crit_pickup_rate;
    const pickupOk = a.has_pickup ? pickup : true;
    return Boolean(
      a.crit_in_scope && a.meets_entry && a.meets_ts && rating && defect && pickupOk
    );
  };

  // --- Labels -------------------------------------------------
  // NOTE(naming): the design calls this row "Disrupted booking rate" and
  // reuses the DBR definition. It is NOT DBR — DBR counts all 42 defect
  // tags, this counts 9 quality tags + non-force-majeure cancellation.
  // For this sample activity: platform_dbr = 2.29%, quality_defect_rate =
  // 1.21%. Kept as designed for now; change this one constant when the
  // naming is settled.
  const QUALITY_RATE_LABEL = "Disrupted booking rate";

  // Metric VALUES: one decimal ("2.0%", "1.5%", "1.2%"), two below 1%
  // ("0.58%") and a bare "0%" for zero. Don't strip the trailing zero here.
  // The criteria line below the value formats differently — see barPct.
  const pct = (n) => {
    if (!n) return "0%";
    const v = n * 100;
    return v.toFixed(v < 1 ? 2 : 1) + "%";
  };
  // The criteria line drops a trailing ".0": 516:50363 writes "2% or lower",
  // while the metric VALUE above it keeps pct()'s one decimal. Two different
  // formats on the same tile, deliberately.
  const barPct = (n) => pct(n).replace(/\.0%$/, "%");
  const rating = (n) => n.toFixed(2).replace(/0$/, "");
  const status = (ok) => (ok ? "met" : "not-met");

  // The design uses US date style in three forms: abbreviated month for the
  // assessment period ("Jul 1, 2027"), full month for the award date in most
  // places ("January 1, 2027"), and full month with NO year in the success
  // banner's headline ("from January 1") — see the comment on renderBanner.
  const fmtDate = (iso, opts) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      day: "numeric",
      timeZone: "UTC",
      ...opts,
    });
  const fmtShort = (iso) => fmtDate(iso, { month: "short", year: "numeric" });
  const fmtLong = (iso) => fmtDate(iso, { month: "long", year: "numeric" });
  const fmtMonthDay = (iso) => fmtDate(iso, { month: "long" });
  // Short month, no year — the review-count tile's "As of Oct 26" (720:66225).
  const fmtShortMonthDay = (iso) => fmtDate(iso, { month: "short" });

  // The date the review count was measured to. TODO(data): there is no "as of"
  // field in the export. A real row's numbers were measured over its own export
  // window, so its end is the honest answer; synthetic rows have only the
  // intended period, whose end is in the future. Both fixtures that currently
  // fail the gate are real, so the fallback is unused today.
  const asOfDate = (a) => a.export_window_end || a.window_end;

  // --- Assessment period options -----------------------------
  // The badge is re-checked every 3 months over a 180-day window, so the
  // periods on offer are 6-month ranges that step back one quarter at a time.
  // PROTOTYPE ONLY: the earlier ranges are generated, not real. There is one
  // row per activity in sxp_activity_criteria covering one window, so no
  // history exists to switch to — which is why the control is inert. See the
  // note on the renderer.
  const PERIOD_COUNT = 4;
  const shiftMonths = (iso, n) => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCMonth(d.getUTCMonth() + n);
    return d.toISOString().slice(0, 10);
  };
  // window_end is exclusive (Jan 1) but the design labels it inclusively
  // (Dec 31, 2026), so the end date is shown as the day before.
  const dayBefore = (iso) => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const periodOptions = (a) =>
    Array.from({ length: PERIOD_COUNT }, (_, i) => ({
      label: `${fmtShort(shiftMonths(a.window_start, -3 * i))} – ${fmtShort(
        dayBefore(shiftMonths(a.window_end, -3 * i))
      )}`,
      current: i === 0,
    }));

  function build(a) {
    // The T&S tag-rate breakdown, when the tag rule is the reason AND the
    // fixture actually has tags to show. A severe case supersedes it with the
    // case table instead. TODO(data): the export has supplier_ts_tag_bookings
    // as a bare count with no tag split, so this comes from the fixture.
    const tsTagDetail =
      a.crit_ts_no_severe_case && !a.crit_ts_tag_rate
        ? detailsFor(a, "trust-safety")
        : null;

    // Below the review gate the page changes shape, not just copy (720:66225):
    // the excellence metrics collapse to a single explanatory line and the
    // section order changes. See the reordering below the section list.
    const belowReviewGate = !a.crit_min_reviews;

    const baseSections = [
      {
        id: "review-count",
        title: "Review count",
        rows: [
          {
            // Copy here follows 720:66225, the only node that draws this row.
            // It differs from what the page said before ("At least 50 reviews" /
            // "This allows us to build enough signal about your performance"),
            // and the change applies in the passing state too — the design has
            // no separate passing variant of the row.
            id: "min-reviews",
            label: `At least ${MIN_REVIEWS} new reviews`,
            description:
              "This minimum tells us how you have treated customers in general during this period.",
            status: status(a.crit_min_reviews),
            // Failing, the row grows a metric tile showing the count so far.
            // Unlike the excellence tiles it carries no criteria line and no
            // "See details" toggle — there is no trend or breakdown behind it.
            ...(belowReviewGate
              ? {
                  metric: {
                    value: String(a.reviews_in_window),
                    caption: `As of ${fmtShortMonthDay(asOfDate(a))}`,
                  },
                }
              : {}),
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
            // THREE distinct failures live behind this one row, and the design
            // treats each differently. Precedence is severe > tag rate > case
            // rate: severe is the strongest claim and the only one with case
            // evidence; between the other two, the tag rule is the one the
            // design is willing to explain.
            //
            //   confirmed severe case (crit_ts_no_severe_case) — 516:51482
            //     names the offending activities in a table.
            //   T&S tag rate (crit_ts_tag_rate) — 516:52273
            //     shows the tags driving it, with advice. Tags are AI-classified
            //     review text, not investigated cases, so they can be shared.
            //   investigated case rate (crit_ts_case_rate) — 516:51696
            //     gives no detail at all, deliberately — real T&S cases.
            // The tag-rate copy ends "Review the key trends below", so it is
            // used ONLY when there is a breakdown to review. `bft-ts` fails the
            // tag rule but has zero rows in sxp_booking_defect, so there are no
            // tags to list; it falls through to the no-detail copy, which is
            // also accurate there since it fails the case rule too.
            failDescription: !a.crit_ts_no_severe_case
              ? "We track complaints and reviews related to serious issues across all your activities. As you have multiple confirmed cases (below), all your activities are excluded from the program for the current assessment period."
              : tsTagDetail
                ? "We track complaints and reviews related to serious issues across all your activities. This activity has been tagged with a high number of safety issues and it is therefore excluded from the program for the current assessment period. Review the key trends below and take action to improve."
                : "We track complaints and reviews related to serious issues across all your activities. We have identified a high number of cases or investigations related to this activity and it is therefore excluded from the program for the current assessment period. To protect traveler safety, we can’t provide further details at this time.",
            // TODO(data): the export carries supplier_valid_sev12_cases as a
            // bare count — no activity, date, case number or ban expiry. These
            // rows come from a `ts_cases` field the fixtures add by hand.
            cases: !a.crit_ts_no_severe_case ? a.ts_cases || [] : null,
            details: tsTagDetail,
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
              "The average star rating from customer reviews received in this assessment period.",
            status: status(a.crit_rating),
            metric: {
              value: rating(a.rating_in_window),
              barText: `${a.rating_bar} or higher`,
              // Rating uses a 0–5 axis and has no disruption breakdown.
              chart: { kind: "rating", max: 5, bar: a.rating_bar },
            },
            details: detailsFor(a, "rating"),
          },
          {
            id: "quality-rate",
            label: QUALITY_RATE_LABEL,
            description:
              "Calculated by taking the number of bookings tagged with a complaint or negative experience and dividing it by the total number of bookings conducted in this assessment period.",
            status: status(a.crit_defect_rate),
            metric: {
              value: pct(a.quality_defect_rate),
              barText: `${barPct(a.defect_rate_bar)} or lower`,
              chart: { kind: "rate", max: RATE_AXIS_MAX, bar: a.defect_rate_bar },
            },
            details: detailsFor(a, "quality-rate"),
          },
          // The pickup bar only applies "if the activity has pickup" (criteria
          // deck, Gate 4). Without pickup there is nothing to measure, so the
          // row is omitted rather than shown passing at 0% — a green tick for a
          // criterion that was never assessed reads as an achievement.
          //
          // WARNING: this is NOT merely cosmetic, because the export disagrees
          // with the deck. 15,671 rows have has_pickup = false AND
          // crit_pickup_rate = false — they fail a bar they should never have
          // been judged against. For 112 of them pickup is the ONLY failure, so
          // hiding the row leaves every visible criterion green under a "you
          // don't meet the requirements" banner. The badge decision for those
          // 112 looks wrong at source; see "Known problems" in CLAUDE.md.
          // Fixture `porto-fail` is one of the 15,671 (it fails min-reviews too,
          // so its page still explains itself).
          ...(a.has_pickup
            ? [
                {
                  id: "pickup-rate",
                  label: "Pickup problem rate",
                  description:
                    "Calculated by taking the number of bookings tagged with a negative pickup experience and dividing it by the total number of bookings conducted in this assessment period.",
                  status: status(a.crit_pickup_rate),
                  metric: {
                    value: pct(a.pickup_defect_rate),
                    barText: `${barPct(pickupBar(a))} or lower`,
                    chart: { kind: "rate", max: RATE_AXIS_MAX, bar: pickupBar(a) },
                  },
                  details: detailsFor(a, "pickup-rate"),
                },
              ]
            : []),
        ],
      },
    ];

    // Below the gate there are not enough reviews to compute rating, and the
    // design does not show the other two metrics either — the whole section
    // collapses to one line (720:66225). It stays visible rather than being
    // dropped so the supplier can see the criterion exists and why it is
    // withheld; a missing section would just read as a shorter list.
    const byId = (id) => baseSections.find((s) => s.id === id);
    if (belowReviewGate) {
      byId("excellence").rows = [
        {
          id: "excellence-blocked",
          label: `We can only show your performance in customer experience metrics once you have ${MIN_REVIEWS} new reviews`,
          status: "not-met",
        },
      ];
    }
    // Failing sections come first — the reason the badge was refused should be
    // the first thing read, not something to scroll past green ticks to find.
    // Within each group the original order holds, so a passing activity is
    // unchanged (Review count > Basic operational standards > Exceptional
    // customer experience) and a single failure simply rises to the top.
    //
    // This generalises the ordering 720:66225 shows for the review gate: there,
    // review-count and the collapsed excellence section both fail and
    // operational passes, which this rule reproduces exactly.
    //
    // KNOWN GAP: if an activity were below the review gate AND failed a
    // Trust & Safety rule, operational would sort between review-count and the
    // collapsed excellence line, separating that line from the review count it
    // explains. No fixture is in that state and no design covers it. If one
    // appears, the collapsed line probably wants pinning to review-count rather
    // than being sorted like a normal failure.
    // The same rule applies inside a section: the failed check sits above the
    // passing ones (516:50960 puts the Trust & Safety failure above the
    // cancellation policy, reversing their usual order). Filter twice rather
    // than sort, so the original order holds within each group.
    const rowFailed = (r) => r.status === "not-met";
    const orderRows = (s) => ({
      ...s,
      rows: [...s.rows.filter(rowFailed), ...s.rows.filter((r) => !rowFailed(r))],
    });
    const ordered = baseSections.map(orderRows);

    const sectionFailed = (s) => s.rows.some(rowFailed);
    const sections = [
      ...ordered.filter(sectionFailed),
      ...ordered.filter((s) => !sectionFailed(s)),
    ];

    return {
      activityTitle: a.activity_title,
      // Gate 0. The design has no state for this — an out-of-scope activity
      // presumably never sees the tab at all. Surfaced so the page can decide.
      inScope: a.crit_in_scope,
      badge: {
        earned: earnedBadge(a),
        // True when the activity clears the global minimum but not its own
        // (stricter) city bar — i.e. it would qualify in a less crowded city.
        blockedByCityBar: !earnedBadge(a) && earnedBadge(a, true),
        city: a.home_city,
        cityStep: a.destination_step,
        // TODO(data): the design names the date the badge would appear
        // ("on January 1, 2026"). The activity export has no such field —
        // and the criteria deck lists award cadence as still undecided. Read
        // from the fixture so it can vary; the copy drops the clause when
        // absent rather than inventing a date.
        awardDate: a.next_award_date ? fmtLong(a.next_award_date) : null,
        // Same date without the year, for the success headline only.
        awardDateMonthDay: a.next_award_date ? fmtMonthDay(a.next_award_date) : null,
      },
      period: {
        start: fmtShort(a.window_start),
        end: fmtShort(a.window_end),
        text: `Assessment period: ${fmtShort(a.window_start)} – ${fmtShort(a.window_end)}`,
        options: periodOptions(a),
      },
      sections,
    };
  }

  global.TopChoice = { build, QUALITY_RATE_LABEL };
})(window);

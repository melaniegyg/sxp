# SXP — ‘Excellent experience’ badge prototype

Static front-end prototype of the Supplier Portal page where a supplier tracks
progress toward the **‘Excellent experience’** badge (internally the Supplier
Excellence Program, SXP). No build step — plain HTML/CSS/JS.

The badge has been called "Top Choice" and "GetYourGuide's choice" at points;
‘Excellent experience’ is current. Some identifiers still say `TopChoice`.

## Running it

```bash
python3 scripts/serve.py      # http://localhost:8150
```

Use this, **not** `python3 -m http.server`. The latter sends no cache
directives and browsers hold on to stale JS and CSS between edits, which makes
"did my change work?" unanswerable. `scripts/serve.py` sends `no-store`.

Note a plain `navigate` to the same URL with only a different `#hash` does not
reload the page — the in-memory model stays stale. Use `location.reload()`.

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Shell: top nav, sidebar, tabs, promo header, criteria mount |
| `js/criteria-model.js` | One `sxp_activity_criteria` row → sections/rows + status |
| `js/criteria-render.js` | Renders sections, banner, detail panels |
| `js/trend-chart.js` | Metric trend line; shades the months that missed the bar |
| `js/activity-switcher.js` | Top-right fixture switcher, driven by `data/activities.json` |
| `js/defect-cards.js` + `css/defect-cards.css` | "Top disruptions" — lifted from the DBR portal, shared, do not edit for this project |
| `data/*.json` | One fixture per scenario |

Data flows one way: fixture → `TopChoice.build()` → `TopChoiceRender.render()`.
Passing and failing states go through the same template; a row carries
`status: "met" | "not-met"` and optionally `failDescription` / `cases`.

## Fixtures

Add a file to `data/` and one line to `data/activities.json` — nothing else.
Selection is held in the URL hash, so `#severe-case` deep-links a scenario.

| id | Scenario |
|---|---|
| `pass` | Meets everything. **Contains a real activity and supplier** (tour 21293, supplier 363) |
| `rating-miss` | Rating below the bar |
| `ts-miss` | Supplier case *rate* over the bar — no detail shown, by design |
| `severe-case` | Confirmed severe case — itemises the offending activities in a table |
| `excellence-miss` | Rating, quality and pickup all missed; has trend + disruption data |

Of these five, only `pass` is real; the other four are synthetic and marked so in a
`_note` field.

Nine further fixtures are **all real rows**, exported over Apr–Oct 2026. They come
in supplier pairs so the switcher's supplier line reads sensibly:

| id | Supplier | Scenario |
|---|---|---|
| `etna` | ETNA VIBES | Meets everything |
| `porto-pass` | Diamante Douro | Meets everything |
| `porto-fail` | Diamante Douro | Too few reviews; misses DBR and pickup |
| `turismo-pass` | Leçaodouro Turismo Nautico Lda | Meets everything |
| `turismo-fail` | Leçaodouro Turismo Nautico Lda | Too few reviews only |
| `bali-ts` | Potato Bali Tours & Activities | **Real** confirmed severe T&S case |
| `italy-rating` | Towns of Italy | Misses rating — **blocked by city bar** |
| `italy-defect` | Towns of Italy | Misses DBR — **blocked by city bar** |
| `italy-pass` | Towns of Italy | Meets everything |

`italy-rating` and `italy-defect` are the first fixtures to exercise
`badge.blockedByCityBar` (clears the global minimum, fails the stricter city bar).
`turismo-fail` and `porto-fail` are the first to fail `crit_min_reviews`.

Their `quality-rate` and `pickup-rate` panels carry **real** disruption lists,
built from each activity's own rows in `sxp_booking_defect` and filtered to the
tag sets the deck defines (see "The 9 quality tags" below). No metric carries a
trend — that still has no derivable source. Each fixture's `details._caveat_*`
fields explain the remaining gaps.

### How the three Trust & Safety rules are scoped

Easy to get backwards, and the table makes it easier: `activity_weighted_cases`
and `activity_weighted_case_rate` exist right next to the supplier columns, but
**the criteria do not use them**. Verified against all 207,496 rows:

| Rule | Flag | Scope | Formula (exact match, 207,496/207,496) |
|---|---|---|---|
| A · severe case | `crit_ts_no_severe_case` | activity **and** supplier | 1 valid sev 1–2 on the activity, **or 2 on the supplier** |
| B · investigated case rate | `crit_ts_case_rate` | **supplier only** | `supplier_weighted_case_rate > 0.0003 AND supplier_weighted_cases >= 2` |
| C · T&S tag rate | `crit_ts_tag_rate` | **supplier only** | `supplier_ts_tag_rate > 0.005 AND supplier_ts_tag_bookings >= 2` |

Only rule A can fail a single activity on its own. B and C are all-or-nothing
per supplier — a supplier over either bar loses every activity, including ones
with no cases or tags of their own. The activity-level equivalents fit B on only
197,693 rows, so they are definitively not what the flag reads; for C there is
no activity-level column at all. Deck slide 11 says the same: "Rule A per
activity and supplier, rules B–C per supplier."

### Why `bali-ts` lists several cases under one supplier

The ban is at **supplier** level, so the table itemises the supplier's confirmed
severe cases and every one of their activities is excluded — not just the one
being viewed. Deck Rule A: one valid severity 1–2 case on the activity, **or two
on the supplier**, in 6 months.

**Severity level is deliberately not shown to suppliers.** The table gives the
activity, confirmation date, case number and exclusion date, and stops there —
don't add a severity column "for completeness".

For supplier 272440 the data reads: both valid sev 1–2 cases sit on tour 472433
itself (`activity_valid_sev12_cases = 2`), which satisfies the "two on the
supplier" clause. Their other four activities carry **zero** cases of their own
yet are all excluded — the clearest illustration of why "keep working on it" in
the error banner is wrong advice (see "Known problems").

### The 9 quality tags

The quality defect rate counts these nine, plus `Supplier Cancellation (non-FM)`:

`Activity Not As Advertised` · `Guide Language Wrong or Low Proficiency` ·
`Supplier Not Responsive` · `Unexpected Cancellation` ·
`Unclear Meeting Point Location` · `Extra Charge` · `Attraction Closed` ·
`Activity Oversubscribed` · `Unsuitable For Disabled Customers`

Pickup counts exactly two: `Unclear Pickup Information` and
`Pickup/Guide Late or No Show`. T&S counts 13: the 12 tags in the
`Trust & Safety Problems` category plus `Scam Fraud`.

Source: criteria deck appendix "severity & supplier actionability" 1–3, which
**does** carry the tick columns in the plain-text export — the older note that
it drops them and needs a PPTX/XML parse is wrong; `read_file_content` is
enough. One tick is missing from the deck, see "Known problems".

**Their switcher labels say only "Meets" / "Does not meet" — on purpose.** These
are named real suppliers, and the view is supplier-facing; the scenario column
above is for us, not for the dropdown. Don't make these labels descriptive to
match the five synthetic ones, whose suppliers are invented.

All fourteen fixtures show the same assessment period (Jul 1, 2026 – Jan 1, 2027)
and the same award date, so the banner reads identically across the switcher. For
the nine real rows that period is **not** the range they were measured over —
each keeps its true range in `export_window_start` / `export_window_end` and
explains the mismatch in `_note_window`.

## Design system — the rule that is easy to get wrong

The Supplier Portal uses **PrimeVue components**, but `README-UI.md` in
`getyourguide/supply-frontend` requires **Compass icons and Compass
typography** inside them. PrimeIcons ship with PrimeVue and are *not* to be
used for app icons. The type scale here matches
`apps/supplier-portal-nuxt/utils/compass.ts` exactly.

Exception: the badge chip is set in **GYG Sans Headline**, the brand face, not
Compass GT Eesti. Only the Semibold cut is vendored.

Icons are exported from Figma rather than redrawn, and carry their fill baked
in — CSS cannot recolour an `<img>`, so re-exporting resets any colour change.

`css/defect-cards.css` **must** load before `css/tokens.css`: it ships `:root`
token fallbacks for standalone use that otherwise clobber the page's tokens.

## Not in the data export

`sxp_activity_criteria` holds one aggregate per window. Fixtures hand-write:

- `details.*.trend` — monthly series for the charts
- `details.*.disruptions` — top-disruption breakdown
- `ts_cases` — case dates, numbers, ban expiry (the export has only a count).
  `bali-ts` is a real severe-case failure with no case detail available, so its
  table is absent rather than populated with invented case numbers.
- `next_award_date`
- `supplier_name` — **resolvable after all**: `dwh.dim_supplier.company_name`,
  keyed on `user_id` (not `supplier_id` — that column does not exist there).
  `supply.dim_supplier_names` looks right but returns nothing for these ids.
- Thresholds other than `defect_rate_bar` / `rating_bar`, which are hardcoded
  from the criteria deck and will silently rot

## Deliberate divergences from Figma

Documented at each site; don't "fix" them without checking:

- Trend shading uses **weak red**, not the design's amber, to match the rails
  and tiles beside it.
- The success banner carries the **year**; the design omits it there while
  including it everywhere else.
- Thresholds bind to the activity's own bars, so a Venice activity shows
  ≤ 1.5% where the design hardcodes ≤ 2.0%.

## Known problems worth raising, not silently fixing

- **"Disrupted Booking Rate" is not DBR.** The row shows the SXP quality defect
  rate — 9 tags + non-force-majeure cancellation — while DBR counts all 42. For
  the `pass` fixture: DBR 2.29% vs quality rate 1.21%. Same name, two numbers,
  adjacent tabs.
- **`Duration not as advertised` is confirmed NOT a quality tag.** The deck's
  appendix leaves it unticked (severity Low), and empirically it is the *worst*
  of twelve candidates — adding it drops exact agreement with
  `quality_defect_bookings` from 93.8% to 85.1%. The nine real fixtures exclude
  it. The synthetic `excellence-miss` fixture **still lists it** with a count of
  24 in its hand-written Top disruptions; that fixture now contradicts a settled
  fact and should be corrected.
- **Activities without pickup are still failed on pickup.** The deck applies the
  pickup bar only "if the activity has pickup", and the Pickup Problem Rate row
  is hidden when `has_pickup` is false. But **15,671** rows have
  `has_pickup = false` *and* `crit_pickup_rate = false` — judged against a bar
  that should not apply to them. For **112** of those, pickup is the *only*
  failure, so the page shows every visible criterion green beneath a "you don't
  meet the requirements" banner, and their badge denial looks wrong at source.
  Either the flag or the criterion is miscomputed in `sxp_activity_criteria`.
  Fixture `porto-fail` is one of the 15,671.

  **The page works around this.** `criteria-model.js` no longer reads
  `has_badge`; it recomputes the outcome with pickup ignored when `has_pickup`
  is false, so those 112 are shown as earning the badge. That is a deliberate
  disagreement with the export, and the export is what should change. None of
  the 14 fixtures is one of the 112, so no fixture's outcome shifted.
- **The error banner says "keep working on it"** even when the failure is a
  supplier-level Trust & Safety ban that no amount of work on this activity
  affects.
- The deck puts the badge at 1.4% of online activities; the promo says top 5%.
- **`sxp_booking_defect` does not reconcile with `sxp_activity_criteria`.** Two
  separate gaps, both verified against the warehouse (not an export artifact):
  its latest `travel_date` is 2026-09-14 while the criteria windows run to
  2026-10-14, so the final month of every window has no booking-level detail;
  and even inside the covered range the distinct-booking counts fall short of
  the aggregates (tour 10915: 7 booking rows vs `quality_defect_bookings` = 10;
  tour 516233: 1 row vs `defective_bookings_platform` = 4; tours 437878 and
  645277 have no rows at all despite nonzero aggregates). Any "Top disruptions"
  list built from this table will sum to less than the rate printed above it.
- **The deck's appendix ticks 23 tags but its summary says 24.** Slide 18 states
  the split as 9 quality + 2 pickup + 13 T&S. The appendix tick columns give
  13 T&S and 2 pickup (both correct) but only **8** quality. The missing one is
  `Unsuitable For Disabled Customers`: it is the only candidate whose addition
  improves agreement with `quality_defect_bookings` (93.8% → 95.7% exact across
  517 tours whose booking-level data is complete), and every other candidate
  makes it worse. Treated here as a missing tick, not a wrong summary — but the
  deck should be corrected at source.
- **No monthly trend is derivable.** A monthly rate needs a monthly denominator;
  the criteria table holds one window aggregate and the defect table holds only
  the numerator. A monthly rating series has no source at all. The real fixtures
  therefore render an empty chart area above their disruption lists.

## Sources

- Figma `i7e0mBGBdDYwJthO1HzfLT` (Supply Excellence Program)
- Criteria deck, Drive `1nHgIgi1p9a8a3NJgdEa-ZX2N7_Lx2lW_h0KxR57M24A`
  ("SXP badge — how activities earn it", criteria v3 rev. 15 Oct). Read it with
  Drive `read_file_content` — it returns the appendix tick columns intact. The
  earlier advice to export PPTX and parse table XML is unnecessary. Caveat:
  appendix 2/3 has **two** tick columns (T&S and Quality) that flatten into one
  "✓" in text, so resolve those rows by the tag's category.
- `getyourguide/supply-frontend` — private, readable via `gh`
- Databricks `production.supply_analytics.sxp_*`

**Internal use only.**

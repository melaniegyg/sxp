# SXP — Excellent Experience badge prototype

Static front-end prototype of the Supplier Portal page where a supplier tracks
progress toward the **Excellent Experience** badge (internally the Supplier
Excellence Program, SXP). No build step — plain HTML/CSS/JS.

The badge has been called "Top Choice" and "GetYourGuide's choice" at points,
then ‘Excellent experience’ — quoted, lowercase second word. Current is
**Excellent Experience**: unquoted, title case, per 566:53353 and the revised
banners. Some identifiers still say `TopChoice`.

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
| `ts-tag-rate` | T&S **tag** rate over the bar — the one fixture that exercises the inline tag rail |
| `excellence-miss` | Rating, quality and pickup all missed; has trend + disruption data |

Of these six, only `pass` is real; the other five are synthetic and marked so in a
`_note` field.

`pass` also carries a **real** quality-rate disruption breakdown, queried from its
own rows in `sxp_booking_defect` (8 tags over 27 distinct bookings). Its `trend` is
still invented — the two live side by side in the same `details` object, so read the
`_note_details_*` fields before trusting any of it.

Eleven further fixtures are **all real rows**, exported over Apr–Oct 2026. Most
come in supplier pairs so the switcher's supplier line reads sensibly; `etna`,
`bft-ts` and `kyoto-defect` are singletons:

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
| `bft-ts` | BFT GROUP | Fails **both** T&S rate rules (B and C) |
| `kyoto-defect` | Matcha experience　Kyoto | Misses DBR — **blocked by city bar**; the one fixture whose tags reconcile |

`bft-ts` is the only row that fails **both** supplier-level T&S rate rules, and
the only real one to fail rule B. It has no booking-level rows at all, so there
are no tags to list — which is why the tag-rate copy ("Review the key trends
below") is gated on the breakdown actually existing, not just on the rule
failing. Its export also carried a `supplier_email`; that field is dropped from
the fixture and must stay dropped, since these files are served publicly.

`italy-rating` and `italy-defect` are the first fixtures to exercise
`badge.blockedByCityBar` (clears the global minimum, fails the stricter city bar).
`kyoto-defect` is the third and the only one outside Italy: Kyoto is
destination_step 8, so its quality bar is 0.50% against the 2.00% global minimum,
and its 0.845% sits between the two. `turismo-fail` and `porto-fail` are the
first to fail `crit_min_reviews`.

`kyoto-defect` is also the **only fixture whose disruption counts reconcile
exactly** — 3 distinct tagged bookings against a `quality_defect_bookings` of 3,
and 1 against 1 for pickup. That is because its detail comes from the export's
own embedded `dbr_tags` array rather than a separate query against
`sxp_booking_defect`, and its window closes before that table's coverage gap
bites. It is the exception, not a sign the gap is fixed — see "Known problems".
Its export carried a `supplier_email` too; dropped, and must stay dropped.

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

**Tag counts are never shown to the supplier.** A fixture's `defect.count` is
provenance and sort order only; `mountDisruptions()` in `criteria-render.js`
strips it before handing the list to the shared defect-cards module. Two
reasons: a bare "15" invites arguing with the number instead of acting on the
tag, and these counts come from `sxp_booking_defect`, which undercounts the
aggregate printed above them (see "Known problems") — so any figure shown would
visibly fail to add up. `pass` is the clearest case at 27 against a
`quality_defect_bookings` of 61.

The shared module reads `count` in exactly one place, to fill `{count}` in a
recommended-action title, and its `fillCount()` already renders "recent" when
the field is absent — "Address recent reviews that mention capacity". So
stripping is safe and never yields `undefined`. Note no fixture currently sets
`recAction`, so that title is unreachable here today; the strip is what keeps it
safe if one ever does. Don't "restore" the count to make a card look complete,
and don't fix this in `defect-cards.js` — the DBR portal does show counts.

**Their switcher labels say only "Meets" / "Does not meet" — on purpose.** These
are named real suppliers, and the view is supplier-facing; the scenario column
above is for us, not for the dropdown. Don't make these labels descriptive to
match the five synthetic ones, whose suppliers are invented.

All seventeen fixtures show the same assessment period (Jul 1, 2026 – Jan 1, 2027)
and the same award date, so the banner reads identically across the switcher. For
the eleven real rows that period is **not** the range they were measured over —
each keeps its true range in `export_window_start` / `export_window_end` and
explains the mismatch in `_note_window`.

## Failing sections sort to the top

Whichever section holds a failure is shown first; within the failing group and
the passing group the original order holds (Review count → Basic operational
standards → Exceptional customer experience). The reason a badge was refused
should be the first thing read, not something to scroll past green ticks to
find. A passing activity is therefore unchanged, and a single failure simply
rises.

This is one rule, not a per-case layout. It reproduces the order 720:66225
draws for the review gate, and it is what moves the Exceptional-customer-
experience section above the rest on `kyoto-defect` and the other DBR/rating
failures. Of the seventeen fixtures, eleven have a failing section: five fail
excellence, five fail operational (all Trust & Safety), and two fail the review
gate plus the collapsed excellence line.

**Known gap:** an activity below the review gate that *also* failed a T&S rule
would sort operational between review-count and the collapsed excellence line,
separating that line from the review count it explains. No fixture is in that
state and no design covers it. If one appears, the collapsed line probably wants
pinning to review-count rather than being sorted like an ordinary failure.

## Below the review gate, the page changes shape

Design 720:66225. When `crit_min_reviews` is false the page is not merely the
normal layout with one row failing — three things change:

1. **The excellence section collapses to one line.** All of its metric rows are
   replaced by a single statement, "We can only show your performance in
   customer experience metrics once you have 50 new reviews". The section stays
   visible rather than being dropped, so the supplier can see the criterion
   exists and why it is withheld.
2. **The section order changes** to Review count → Exceptional customer
   experience → Basic operational standards. This is not a special case — it
   falls out of the general ordering rule below.
3. **The review-count row grows a metric tile** showing the count so far, with
   a date line instead of a criteria line ("As of Oct 14") and no "See details"
   toggle — there is no trend or breakdown behind it.

The count tile is a **distinct variant** of the metric tile, per 796:29978 which
revises 720:66225: its status icon sits in the row body above the label, not
inside the tile. The excellence tiles keep theirs inside, above the number
(516:50363). Dropping the icon is what takes the tile from 128px to the design's
94px — the height is content-driven, so there is nothing to hardcode. The
renderer tells the two apart by whether the metric states a bar.

`turismo-fail` and `porto-fail` are the only fixtures in this state.

TODO(data): the tile's "as of" date has no field in the export. It uses
`export_window_end` — a real row's numbers were measured to the end of its own
export window — falling back to `window_end`. Both fixtures that reach this
state are real, so the fallback is unused today; a synthetic row would show a
future date.

**The row's own copy also comes from 720:66225** — "At least 50 new reviews" /
"This minimum tells us how you have treated customers in general during this
period." That replaced earlier wording and applies in the passing state too,
since the design draws no separate passing variant of the row.

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
- ~~The success banner carries the **year**.~~ Resolved — the page now follows
  the design: the success *headline* drops the year ("from January 1") while its
  own description and the failure headline keep it ("on January 1, 2027"). The
  prepositions differ too, "from" in that one headline and "on" elsewhere. Both
  are intentional; `awardDate` and `awardDateMonthDay` exist for exactly this.
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

  **Quantified.** Of the **79,134** activities with a non-zero quality defect
  rate, **74,634 (94.3%) have no quality-tagged booking rows at all** — a
  breakdown built for them renders empty. Another 3,564 (4.5%) have tags that
  undercount the rate. Only **936 (1.2%)** have tags that actually account for
  it, and that is an upper bound: the check counted each tour's rows across all
  time against a single window's aggregate. So a rule like "show the tags
  whenever the rate is above 0%" is satisfiable on roughly 1 activity in 85.
  Any copy pointing the supplier at a breakdown ("review the key trends below")
  must be gated on the breakdown existing, not on the rate being non-zero —
  the same gate `crit_ts_tag_rate` already uses.
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
- **The operational rows' copy disagrees with 720:66225.** That node draws the
  two Basic-operational-standards rows differently from what the page shows:

  | | Page | 720:66225 |
  |---|---|---|
  | | `24 hour cancellation policy` | `24-hour cancellation policy` |
  | | `This ensures the best flexibility for travelers.` | `Our standard policy ensures the most flexibility for travelers.` |
  | | `Trust and Safety check` | `Trust and safety check` |
  | | `We constantly monitor complaints…on your tours.` | `We track complaints…across all your activities.` |

  Left alone deliberately. The review-count row was updated because 720:66225 is
  the only node that draws it, but these two rows appear in several nodes and
  changing them would alter every fixture in every state — and the T&S row's own
  *failure* copy already uses the 720 phrasing ("across all your activities"),
  so the page is internally inconsistent either way. Needs one decision about
  which node is authoritative, not four silent edits. Note the 516:* nodes are
  NEWER than the 720:* ones (516:51482 supersedes 720:66815), but no 516 node
  covers these rows.

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

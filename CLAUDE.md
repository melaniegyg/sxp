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

All except `pass` are synthetic and marked so in a `_note` field.

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
- `ts_cases` — case dates, numbers, ban expiry (the export has only a count)
- `next_award_date`, `supplier_name`
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
- **Top disruptions lists `Duration not as advertised`**, which is not one of
  the ticked SXP quality tags, so it should not drive this rate.
- **The error banner says "keep working on it"** even when the failure is a
  supplier-level Trust & Safety ban that no amount of work on this activity
  affects.
- The deck puts the badge at 1.4% of online activities; the promo says top 5%.

## Sources

- Figma `i7e0mBGBdDYwJthO1HzfLT` (Supply Excellence Program)
- Criteria deck, Drive `1nHgIgi1p9a8a3NJgdEa-ZX2N7_Lx2lW_h0KxR57M24A`. Export as
  PPTX and parse the table XML — the plain-text export drops the tick columns.
- `getyourguide/supply-frontend` — private, readable via `gh`
- Databricks `production.supply_analytics.sxp_*`

**Internal use only.**

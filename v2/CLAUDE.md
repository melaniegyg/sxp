# SXP round 2 — what differs from round 1

Read `../CLAUDE.md` first. Everything there still applies: the tag sets, the
T&S rule scoping, the ordering rules, the known problems, the design-system
constraints. This file only records what is specific to round 2.

## Status

**Built.** Round 2 is no longer a copy of round 1. It is two pages:

| | |
|---|---|
| `index.html` | **Activity overview** — one supplier's activities, badge-status chips, Ineligible table |
| `activity.html` | **One activity** — This month promo / Next month assessment |

`activity.html#<supplierKey>/<tourId>` is what the overview's **View details**
links to. The switcher switches **suppliers**, not activities (settled
2026-11-19) — the activity is chosen from the overview table.

| File | Role |
|---|---|
| `js/criteria-model.js` | `SXP.buildSupplier()` (overview) and `SXP.build()` (one activity) |
| `js/primevue-setup.js` | the preset, the component registry, `createSxpApp()` |
| `js/theme/` | the Supplier Portal's PrimeVue preset, ported from `supply-frontend` |
| `js/components.js` | shared components — shell, switcher, cards, rows, breakdown |
| `js/app-overview.js` · `js/app-activity.js` | one Vue root per page |
| `js/supplier-data.js` | fixture loading, hash routing, `?supplier` lock |
| `css/round2.css` | layout and PrimeVue bindings; replaces `criteria.css` |
| `vendor/` | Vue, PrimeVue and the Lara base preset, as browser builds |
| `data/supplier-*.json` | five supplier fixtures + `suppliers.json` index |
| `data/defect-catalogue.json` | generated from the sheet — see below |

**Deleted:** `js/trend-chart.js` (charts are dropped), and — at the PrimeVue
migration — `js/criteria-render.js` and `js/supplier-switcher.js`, whose jobs
are now `js/components.js` and `js/supplier-data.js`.

**Unused but kept:** `js/defect-cards.js`, `css/defect-cards.css`,
`css/criteria.css`, `js/activity-switcher.js`, `js/cards-data.js`. Round 2
loads none of them. `defect-cards.js` stays because it is shared with the DBR
portal and must not be edited; round 2 simply renders its own breakdown, since
2423:103908 draws a flat accordion rather than that module's category card with
a left-hand defect nav. Its recommended-action copy was lifted into the
catalogue instead.

**Not built, for want of data and design:** the supplier-level exclusion
banner, and three of the four Trust & Safety failure states. No activity in the
round-2 data fails T&S, so `Operations not met` never appears.

## Round 2 is built from PrimeVue components

Settled 2026-11-20 by Melanie: *"you should be using primevue for everything."*
Round 2 had been hand-rolled CSS that imitated the design system — a `.sx-chip`
that looked like a Tag, a `.sx-tab` that looked like a SelectButton. Those are
now the real components, on the Supplier Portal's own theme.

**Round 1 is untouched.** It stays frozen and hand-rolled at the repo root.
This section describes `v2/` only.

### Still no build step

Three browser builds in `vendor/`, loaded as plain `<script>` tags before our
own ES modules:

| Global | Package | File |
|---|---|---|
| `window.Vue` | `vue@3.5.43` | `vendor/vue.global.prod.js` |
| `window.PrimeVue` | `primevue@4.3.9` | `vendor/primevue.min.js` |
| `window.PrimeUIX.Themes` | `@primeuix/themes@3.1.1` | `vendor/primeuix-lara.js` |

It is the **global** Vue build, not the runtime-only one, so it carries the
template compiler and components can be written as plain template strings.

**Vendored, not CDN, on purpose.** Round-1 links went to seven real suppliers
and round 2 will go the same way; a CDN stall would blank the page for someone
we asked to look at it. The version is pinned by the file on disk. ~2.1 MB
uncompressed across the three, which GitHub Pages serves gzipped.

### The theme is the portal's, ported file-for-file

`js/theme/` is `apps/supplier-portal-nuxt/config/primevue-theme/` from
`getyourguide/supply-frontend`, converted from TypeScript to ES modules by
stripping `import type` / `export type` / `satisfies` and adding `.js` to the
import paths. **Nothing else was changed** — 55 files, 50 component configs,
the GYG colour namespace and the preset's own `css` function all intact.
`js/primevue-setup.js` composes it the way the portal does,
`definePreset(Lara, gygPreset)`, so a Tag here is the Tag a supplier sees.

**Re-port it rather than editing it by hand.** A hand-edit is how this drifts
back into being an imitation.

What that buys, concretely: the earned chip is `severity="contrast"`, which is
`{GYG.label.primary}` `#1a2b49`; every failure chip is `severity="warn"`, which
is `{GYG.surface.warning}` `#ffecc1` on `{GYG.label.warning}` `#a65200`. The
hand-rolled chip had the background right and the text eyeballed at `#8a5a00`.

### Templates are JS strings, never in-DOM

The HTML parser case-folds tag names, so a `<Button>` written into the document
arrives as the native `<button>` and the component never resolves — the same
trap for `<Select>`, `<Column>` and `<Tag>`. In a string template Vue does its
own parsing and the casing survives. This cost an afternoon once; don't pay it
again by moving a template into the page.

### Which component is which

| Was | Is |
|---|---|
| `.sx-chip` | `Tag`, `contrast` / `warn` |
| `.sx-tab` month toggle | `SelectButton` — a segmented pill, which is what 1970:173336 draws |
| Performance tabs | `Tabs` / `TabList` / `Tab` — the underlined bar |
| `.sx-btn--primary/secondary/pill` | `Button` |
| `.sx-t` tables | `DataTable` + `Column` |
| `.sx-select` | `Select` |
| `.sx-banner` | `Message`, `success` / `warn` |
| `.sx-dc` breakdown | `Accordion` / `AccordionPanel` |
| `.sx-crit`, `.sx-card`, `.sx-promo`, `.sx-benefit` | `Card` |
| `.switcher-menu` | `Menu`, popup |

No PrimeVue equivalent, so still bespoke CSS: the pre-launch six-month
timeline, the criterion row's metric column (status glyph, big number,
"Criteria:" line), and the recommended-action panel.

**Icons are not PrimeIcons.** `README-UI.md` is explicit that PrimeIcons ship
with PrimeVue and are not to be used for app icons. Every icon here is a Figma
export or an inline SVG, and the preset carries no font-family, so
`css/round2.css` sets Compass on `.p-component` once.

### Why `css/round2.css` can still win

PrimeVue's generated CSS goes into a cascade layer (`cssLayer` in
`js/primevue-setup.js`). Unlayered CSS beats layered CSS whatever the
specificity, so the bindings in `round2.css` need no `!important` and no
selector arms race. Keep it that way: anything in that file that recolours
rather than positions belongs in the preset instead.

### Known divergence: the filter selects are 40px, the design draws 44px

The preset's `formField` height wins. Overriding it would put back exactly the
duplication this migration removed, so the design system is treated as
authoritative for control metrics. Raise it with the design-system owners if
44px is deliberate rather than drawn.

## Done: the defect copy is sheet-driven

`data/defect-catalogue.json`, generated 2026-11-19 from the sheet. Fixtures
carry only `{tag: distinctBookings}`; the renderer resolves every string by
internal tag name. A sheet edit is now a regeneration, not ten file edits.

Columns used: `DEFECT NAME [Supplier]` → name, `DESCRIPTION` → description,
**`GYG Advice (Ly 01/09/26) Finalized by Marcus 09/09/26`** → `whatYouCanDo`
(the older plain `GYG Advice` column was NOT used), `FAQ LINKS` → resources,
`SXP Category`, `RELATED REVIEWS`, `REC ACTION (SUPER)`, `PAGE LINK`.

Three things worth knowing about it:

- **`recActionKey` is a key, not copy.** `REC ACTION (SUPER)` holds values like
  `Booking defect - Not as advertised`, which index `DEFAULT_RA_COPY` in
  `js/defect-cards.js`. That is where the title (with `{count}`), description
  and button label live — the sheet has no body column at all. Those four
  entries are copied into the catalogue's `recActions` so round 2 need not load
  the module. Only 4 of the 11 tags have a key; 3 of those appear in the data.
- **All resource URLs resolved**, three of them from cell hyperlink targets
  rather than cell text. The sheet already carries the corrected
  `Adding-Description-and-Highlights-for-Your-Product` slug — the wrong title
  existed only in round 1's hand-written fixtures. Titles for bare-URL cells
  are derived from the URL slug, not quoted from the sheet.
- The sheet's non-FM supplier cancellation row is `DEFECT [Internal] = "--- "`
  with supplier name `Not shown to supplier`, so it is correctly absent.

All three round-1 drifts are closed structurally: supplier-facing names replace
the internal ones, the finalised advice column replaces the superseded one, and
`relatedReviews` comes from the sheet rather than being hardcoded `false`.

### How it was planned (kept for context)

Round 1 hand-wrote **44 defect objects across 10 fixtures** — name, description,
recommendations, FAQ links, page link, all inlined per fixture. Nothing tied
them to the source spreadsheet, so three separate drifts opened without anything
to catch them:

1. `Supplier Cancellation (non-FM)` is displayed in `pass`, though the sheet
   marks it "Not shown to supplier" — it counts toward the rate only.
2. 36 of 42 tag instances use `DEFECT [Internal]` where a supplier-facing page
   should use `DEFECT NAME [Supplier]`. Descriptions are hand-written too and
   differ from the sheet's `DESCRIPTION` column.
3. Recommendations come from the sheet's superseded `GYG Advice` column. The
   finalised one — "GYG Advice (Ly 01/09/26) Finalized by Marcus 09/09/26" — is
   what the Figma screens show word for word. FAQ links are bare titles instead
   of full URLs (at least one wrong: "Adding Description for Your Product"
   should be "Adding Description **and Highlights** for Your Product"), and
   `relatedReviews` is hardcoded `false` where the sheet says `TRUE`.

The intended shape: one generated `data/defect-catalogue.json` built from the
spreadsheet, fixtures carrying only `{tag, count}`, and the renderer resolving
copy by tag name. A sheet edit then becomes a regeneration rather than ten file
edits, and all three drifts close structurally instead of by vigilance.

Source: Drive `1YaM72r6uqwboSD2XWcLAAEAynVUQSXJ1HBU3gerajGQ` — "Defect → Action
Mapping", sheet `SupEx Defects`. It is the source of truth, confirmed by Melanie
2026-11-11. Its `SXP Category` column assigns Quality / Pickup Problem / Trust
and Safety.

## New in round 2: the activity overview

Design 2423:105656 ("Excellence program"), two frames — This month and Next
month. A supplier lands on a table of **all** their activities with a badge
status per row, and `View details` opens the round-1 criteria page for one of
them. Below it a second table, **Ineligible activities**, lists activities with
a `Reason` instead of a status ("Activity type not eligible").

**Ineligible rows carry no `View details`**, and so have no third column —
settled by Melanie 2026-11-20. These activities are never assessed, so the
link would open a criteria page with nothing on it. The two tables therefore
differ in shape, not only in their second column.

**The badge-status chips are the criteria page's three sections**, one chip per
section, which is why this page needs no new eligibility logic — the section
statuses `criteria-model.js` already computes are exactly what it renders:

| Chip | Section | Flags |
|---|---|---|
| `Reviews not met` | Review count | `crit_min_reviews` |
| `Operations not met` | Basic operational standards | the 3 T&S rules + 24h cancellation |
| `Quality not met` | Exceptional customer experience | rating, quality defect rate, pickup |
| `Excellence` | — | all three met |

**When more than one section fails the chip shows the first in this cascade:
Review → Operations → Quality.** Settled by Melanie 2026-11-19.

That is the sections' *declared* order, and it is equivalent to "name the
section the supplier will see at the top after clicking `View details`" — the
criteria page sorts failing sections first and keeps declared order within the
failing group, so its topmost section is always the cascade's winner. The
review-gate reorder (Review → Excellence → Operational) does not break this:
review count fails in that state, so it wins the cascade anyway. **Keep the two
rules in sync** — if the page's sort order is ever changed, the chip stops
naming what the supplier lands on.

The cascade also keeps the chip from contradicting the collapsed excellence
section. Below the review gate the criteria page refuses to state customer-
experience performance at all, so chipping such a row `Quality not met` would
link to a page that declines to back the claim. Review winning prevents it.
`porto-fail` is the only fixture that fails two sections (review count, then
quality via DBR + pickup) and is exactly that case.

### `—` is the pre-launch state

Both frames list the same six activities; This month shows `—` in every row,
Next month shows real statuses. That is **not** a general "current month is
never assessed" rule — it is the pre-launch scenario, where no badge has been
awarded yet and the first awards land next month. Confirmed by Melanie
2026-11-19. So `—` means "not yet assessed", never "no badge".

### The filter row, and where the assessment period sits

1970:173343 draws a row **below** the month tabs holding two 216px selects —
`Filter by badge status` (placeholder "Select status") and `Filter by product`
("All products") — with `Assessment period: …` right-aligned on that **same
line**, bottom-aligned with the select controls rather than with their labels.
The period is not on the tabs' line; it was, and that was wrong.

Three decisions the design does not state:

- **The status options are only the statuses the supplier actually has**, built
  from the rendered chips rather than from the full set. A menu offering
  "Operations not met" to a supplier with no such activity returns an empty
  table for no reason.
- **Pre-launch the status select is disabled.** Every row shows `—`, so there is
  no status to filter by. The product select stays live.
- **The filters narrow the eligible table only.** Ineligible activities are a
  separate section carrying reasons, not statuses, so a badge-status filter has
  nothing to say about them and that table is left alone. If both filters
  exclude everything, the eligible table is replaced by one line rather than
  left as a bare header.

The design also draws the `Product` and `Badge status` headers as **SortHeader**
with an icon — the columns are meant to sort. Not built.

### Eligibility is `crit_in_scope`, and it is already in the export

No new field is needed and no category logic belongs in the page. The flag is
exactly "not a ticket, transfer or trip enhancer", verified against the whole
table — every out-of-scope row is one of three groups and nothing else is:

| `l0_category` | `l1_category` | `crit_in_scope` | Activities |
|---|---|---|---|
| `Ticketed` | (all) | false | 13,092 |
| `Other` | `Transfers` | false | 6,509 |
| `Other` | `Trip Enhancers` | false | 4,761 |
| `Guided` | (all) | true | 170,352 |
| `Other` | the other five l1s | true | 9,929 |

`l0_category` alone is **not** enough — `Other` splits both ways, since
Cruises & Hop-On Hop-Off, Spa Tickets, Self-Guided, Wellness and Ski Access are
all in scope. Read the flag, not the categories. (Those counts come to 204,644
rows; `../CLAUDE.md` quotes 207,496 for the T&S verification, so the table does
move — re-count rather than trusting either figure.)

**The category names are internal and never reach the supplier.** `l0_category`,
`l1_category` and `l2_category` are warehouse taxonomy — `Ticketed`,
`Trip Enhancers`, `Guided` are not words a supplier would recognise or that we
use externally. The three out-of-scope groups *are* distinguishable in the data,
so the Reason column could have named each one; it deliberately does not. It
stays the generic "Activity type". Settled by Melanie 2026-11-19.

This applies to the whole page, not just that column: the fixtures all carry the
three category fields, and none of them is renderable. They are provenance, like
`defect.count` — read them to decide scope, never to print.

**No fixture is out of scope.** All seventeen are `crit_in_scope = true`, so the
Ineligible activities table has nothing to render until a fixture is added.

### Supplier-level exclusion banner — no data source

Design 2241:42264. A supplier-wide exclusion shows a red banner above the table
("Due to review manipulation, your activities are not eligible for the program
until April 1, 2027") and **every** activity chips `Operations not met` while
staying in the main table. Confirmed by Melanie 2026-11-19 as the pattern for
supplier-level Trust & Safety too.

`sxp_activity_criteria` has **no column for this** — no exclusion, ban, expiry
or manipulation field exists; `crit_in_scope`, `crit_min_reviews` and
`reviews_in_window` are the only matches for any of those terms. Like
`ts_cases`, the banner's reason and until-date will have to be hand-written in
the fixture until a source appears.

Note the two words collide: the banner says the activities are "not eligible",
while the **Ineligible activities** table means something else entirely
(category, permanent, no criteria assessed at all). Worth resolving in the
naming work.

**The two nodes' shared copy already disagrees.** Four strings differ between
2423:105656 and 2241:42264 — pick one before building:

| 2423:105656 | 2241:42264 |
|---|---|
| `Calculated every month based on the last 6 months` | `Calculated automatically every month based on bookings in the previous 6 months` |
| `At least 50 new reviews in this period` | `At least 50 reviews in this period` |
| `High customer rating and few complaints` | `High rating and few complaints` |
| `Activity type not eligible` | `Activity type` |

The `new` in "50 new reviews" is load-bearing — 720:66225 and the criteria
page's own review-count row both carry it.

**The table must not read `has_badge`.** `criteria-model.js` deliberately
recomputes the outcome with pickup ignored when `has_pickup` is false, to work
around the 15,671 mis-flagged rows (see "Known problems" in `../CLAUDE.md`). For
the 112 of those where pickup is the only failure, a chip built from `has_badge`
would read `Quality not met` above a criteria page showing every row green.

## New in round 2: the activity page is rebuilt

Design 2423:106930, two frames — `Happy Path Porto - this month` (2423:102829)
and `- next month` (2423:102495). Both are the **passing** state; no failing
frame exists in this section yet, so several round-1 rules below cannot be
checked against it.

The page is now a tab (`Performance overview · Excellence program ·
Competitor report`) on an activity, under the heading **Excellence program
status**, carrying the same This month / Next month toggle as the overview.

### The toggle: This month is the pre-launch promo state

`This month` is not a criteria view at all. It is a promotional pre-launch
panel — "Get rewarded for your excellence!", a JUL→DEC timeline with a `JAN 1 /
Badges awarded` marker, "What your activity will be evaluated on" listing the
three sections each tagged `Tracking since Jul 1`, and a three-card **Benefits**
block. No metrics, no statuses.

`Next month` is the assessment: success banner, then the three section cards.

This matches the overview's `—`: same pre-launch scenario, stated two ways.
**But the two pages disagree on the window.** The overview's This month tab says
`Assessment period: Jun 1, 2026 – Nov 30, 2026` while this page's This month
says the activity is evaluated on `Jul 1 – Dec 31` — the same window its Next
month tab uses. One of the two is wrong.

### Sections renamed, and they now match the overview chips

`Basic operational standards` → **Operational standards**, and
`Exceptional customer experience` → **Quality standards**. (Only the text
changed; the Figma layer names still carry the old ones.) With `Review count`
unchanged, the section names, the overview's banner cards and the overview's
chips finally agree.

**This resolves "which node is authoritative" for the two operational rows** —
the open decision below. The new page draws 720:66225's phrasings:
`24-hour cancellation policy` / "Our standard policy ensures the most
flexibility for travelers." and `Trust and safety check` / "We track complaints
and reviews related to serious issues across all your activities." Round 1's
four competing strings lose.

### `Disrupted booking rate` is renamed `Complaint rate`

This closes the worst naming problem in `../CLAUDE.md` — the row showed the SXP
quality defect rate under the name of a different metric that the adjacent tab
reports with a different number. The Figma component is still called
`criteira_dbr`, but the supplier-facing label is now Complaint rate.

### Charts are dropped; the disruption breakdown stays

Settled by Melanie 2026-11-19. The happy-path frames show no `See details`
because a 0% rate has nothing behind it — the expandable breakdown is alive, and
lives in the component set (2423:103908).

So **`trend-chart.js` retires**, and with it the "no monthly trend is derivable"
problem — the real fixtures' empty chart areas simply go away.
**`defect-cards.js` and the sheet-driven catalogue above survive**, and the
components confirm the catalogue is what's needed: the cards are drawn with the
sheet's supplier-facing names and its corrected link titles.

### Other shape changes

- The coloured rail is now a **bar across the top of each section card**
  (`Gate Card - …`), not round 1's per-row left-rail segments. What a mixed
  pass/fail card does is unknown without a failing frame.
- The status glyph is a **checkbox**, not round 1's status icons.
- `Period checked: July 1, 2026 – Dec 31, 2026` sits in each section header,
  repeated three times, replacing the single assessment-period line.
- The value sits under the checkbox with `Criteria:` beneath it, left of the
  description — not round 1's metric tiles.

### Copy and data problems in this node

- **Complaint rate and Pickup problem rate carry the identical description**,
  both reading "The percentage of bookings with at least one **pickup** issue
  flagged in a review or customer care contact". Complaint rate's is wrong.
- **The thresholds are the global bars, on an activity that does not use them.**
  The frame is Porto (tour 516233, `porto-pass`), `destination_step` 8 — so its
  real bars are **4.8** and **0.5%**, not the drawn `> 4.6` and `< 2.0%`. The
  drawn rating value `4.8` is in fact Porto's *bar*; its real rating is 4.98.
  Round 1 binds thresholds to the activity's own bars and should keep doing so.
- **The operator flipped from inclusive to exclusive.** Round 1 renders
  `${rating_bar} or higher` (≥); the design draws `> 4.6`. They differ at
  exactly the boundary. Same for `< 2.0%` against round 1's "2% or lower".
- **`At least 50 reviews` drops "new" again.** Round 1 says "At least 50 new
  reviews", with a comment in `criteria-model.js` recording that it was changed
  *to* that from "At least 50 reviews" on 720:66225's authority. The overview
  (2423:105656) still says "new"; this node and 2241:42264 do not. The row
  description is new wording too: "This minimum gives us enough evidence to
  understand the quality of your activity".

## The criteria components (2423:103908)

The row-level and section-level components, with their variants. This is the
authoritative list of states round 2 has to render:

| Component | Variants |
|---|---|
| `criteira_reviews` | Passing · Not passing |
| `criteria_24hr` | Passing · Not passing |
| `criteira_ts-check` | Passing · **Severe - Activity** |
| `criteria_rating` | Passed · Not passed |
| `criteira_dbr` | **0%** · Passing · Passing-expanded · Not passing · Not passing-expanded |
| `criteria_pickup` | **0%** · Passing · Passing-expanded · Not passing · Not passing-expanded |
| `Gate Card - Review count` | Default · Variant2 |
| `Gate Card - Operational` | Default · Variant2 |
| `Gate Card - Quality` | Not enough reviews · Not passing · Passing |

Pass is a checkbox glyph, fail an **X** in the same dark square — neither is
red or green. Colour lives in the section card's top bar: green passing, amber
failing. **Round 2 fails in amber, not round 1's red**, matching the overview's
chips. The weak-red trend shading that was chosen to match the rails goes away
with the charts.

### `0%` is its own variant — the breakdown gate is already right

`0%` is separate from `Passing`, and `Passing` (drawn at 1.2%, under the bar)
**still expands**. So expandability tracks "are there tagged bookings", not
"is the rate above the bar" — exactly the gate `../CLAUDE.md` argues for, and
the reason a passing row can still list complaints.

**But the common real case has no variant.** 94.3% of activities with a
non-zero quality rate have *no* quality-tagged booking rows at all. Those are
neither `0%` nor expandable — a fourth state, non-zero rate with nothing behind
it, which the component set does not draw. Needs a design before any real
fixture renders.

### Booking counts ARE shown in round 2 — reversing round 1

Cards carry count chips: `6 bookings`, `2 bookings`, `2 bookings`. **Settled by
Melanie 2026-11-19: show them.**

This is the one place where "everything in `../CLAUDE.md` still applies" does
not hold. That file's rule — "Tag counts are never shown to the supplier" — is
round-1 behaviour and stays true of round 1. Round 2 reverses it. Remove the
strip in `mountDisruptions()` rather than preserving it; it is no longer a
safeguard here.

**The consequence is now supplier-visible.** `sxp_booking_defect` undercounts
the aggregate printed directly above the cards — on `pass`, 27 tagged bookings
against a `quality_defect_bookings` of 61 — so the chips will not sum to the
rate. Round 1 hid that; round 2 puts it on the page. It moves the reconciliation
gap from an internal caveat to something a supplier can query, which raises the
priority of fixing it at source. Say so when raising it.

**The shared module does not draw the chip.** `defect-cards.js` reads
`defect.count` in exactly one place — `fillCount()`, filling `{count}` in a
recommended-action title. There is no count badge in it. So un-stripping alone
gets the recommended actions right but renders no `6 bookings` chip, and
`defect-cards.js` is marked do-not-edit (it is lifted from the DBR portal and
shared). The chip needs either a wrapper in `criteria-render.js`, a v2 fork of
the module, or an upstream change — decide which before building.

Round 1's recAction catalogue already contains the design's exact string:
`"Address {count} reviews mentioning the activity was not as advertised"`
(`defect-cards.js:73`). The drawn `X` is that `{count}`.

**`dominantTag()` retires.** The "Most common" chip existed to rank the list
*without* printing a number — "Order already ranks the list; the chip makes that
explicit without printing a number". With counts on every card the chip has no
job, and the design draws none. Drop it and its four-part guard.

### Recommended actions become mandatory

Each expanded card carries **What you can do** bullets, then a recommended-action
box — "Address X reviews mentioning the activity was not as advertised" with a
**Take action** button — then **Resources** links with external-link icons.

Round 1 already has the mechanism: `recAction`, and `fillCount()` filling
`{count}` with "recent" when absent. No fixture sets it, so it is unreachable
today; now every card needs one. The drawn `X` is that count placeholder.

Note the recommended action uses the internal phrasing ("not as advertised")
while the card title uses the supplier-facing one ("Activity not as described").
Both come from the sheet, in different columns.

**"Top disruptions" is renamed "Top complaints for this activity".**

The supplier-facing names are confirmed in the drawn cards — `Activity not as
described`, `Unclear meeting point location`, `Unexpected extra charge on the
activity`, `Driver/guide were late or did not show up`, `Unclear pickup
information` — as is the corrected link title `Adding Description and Highlights
for Your Product`, the one round 1 got wrong. The sheet is the source.

### The severe-case table is gone

`Severe - Activity` is one sentence: "This activity is not eligible for the
badge because it has a severe trust and safety case confirmed in the last 6
months. From April 1, 2027 it will be eligible again." No activity / date /
case-number table. Round 1's `ts_cases` table was hand-written anyway and
`bali-ts` had none, so this is a simplification — but the **six-month invariant
still governs that date**, and it is still not in the export.

**Three of the four T&S failure modes have no design.** Only activity-level
severe is drawn. Missing: supplier-level severe (two cases on the supplier),
rule B investigated case rate, rule C tag rate. Five fixtures fail T&S and only
`severe-case` is covered — `bali-ts` (supplier severe + B + C), `bft-ts` (B+C),
`ts-miss` (B) and `ts-tag-rate` (C) have nothing to render into. This is the
largest hole in the component set.

### Failing rows gain CTAs, and rating gains an AI summary

New in round 2, none of it in round 1: **Collect more reviews** on review count,
**Contact us** on the cancellation row ("Contact your Account Manager or
customer care in order to adjust the cancellation policy on your activity to 24
hours"), **Take action** in the recommended-action box.

`criteria_rating` **Not passed** also carries a **Review summary** block — "AI
summary based on 128 reviews from the last 6 months · Updated weekly". It
appears only on the failing variant. **No source exists** for it anywhere in
`sxp_activity_criteria`; it will have to be hand-written in fixtures.

### More threshold and copy contradictions

- The review row reads **`At least 50 reviews`** with **`Criteria: >50`**. Those
  disagree at exactly 50 — "at least" is inclusive, `>50` is not. Same clash as
  the rating's `> 4.6` against round 1's "or higher".
- Round 1's count tile carried a date line ("As of Oct 14") and no criteria
  line, per 796:29978. This component carries a criteria line and no date, so
  that variant and its `export_window_end` TODO both go away.
- The collapsed quality line still says **"50 new reviews"** while the review
  row says "At least 50 reviews" — the same design, two phrasings, in the one
  state where both are visible at once.
- "Not eligible" now appears in a third sense: the Ineligible table (category),
  the supplier banner (exclusion), and here (a T&S ban).

## Round-2 fixture data (received 2026-11-19)

`sxp_round2_supplier_jsons.zip` — five files, one per supplier, exported
2026-11-17 for "Supplier Excellence Program - 2nd round (Rally)". **19
activities.** No `supplier_email`, `user_id` or any other personal field, so
these are safe to serve as-is.

The shape is supplier-level — `{supplier_id, supplier_name, summary, activities[],
dbr_tag_scope, source, note}` — which is what the overview needs and what round
1's one-file-per-activity fixtures could not express.

| Supplier | Activities | Badges | Chips |
|---|---|---|---|
| Edinburgh Capital Tours (594168) | 1 | 1 | Excellence |
| Taller Andaluz de Cocina (13075) | 5 | 2 | 2 Excellence, 3 Reviews |
| Party Deck (406783) | 3 | 0 | 1 Quality, 2 Reviews |
| Split Local Tours (499177) | 5 | 0 | 2 Quality, 3 Reviews |
| Liulian Travel (742608) | 5 | 0 | 1 Quality, 2 Reviews, **2 Ineligible** |

### What it covers, and the two things it does not

Covered: `Excellence` ×3, `Reviews not met` ×10, `Quality not met` ×4, and —
for the first time — **`Ineligible` ×2** (Liulian's Nara and Kawaguchiko
activities, both `Other / Trip Enhancers`).

**Not covered: `Operations not met` — zero activities fail any T&S rule or the
cancellation policy across all nineteen.** So the whole Operational standards
failing path is unexercised, as is the supplier-level exclusion banner. That
lines up with the component set, which draws only one of the four T&S failure
variants — but it means neither can be built from this data.

Five activities fail **two** sections (reviews + quality), so the Review →
Operations → Quality cascade and the collapsed quality card are both well
exercised. Four city-bar blocks across three activities: Split Diocletian
(rating), Split–Trogir (rating and pickup), Kyoto (quality).

One `has_pickup = false` **and** `crit_pickup_rate = false` row — Party Deck's
"Wine Tasting", rate 1.0 — so the documented pickup bug is present. It fails
three other criteria, so `criteria-model.js`'s workaround does not flip its
outcome, same as in round 1.

### The reconciliation gap is mostly fixed — different table

Tags now come from `production.on_trip.dim_booking_defect` joined to
`dwh.fact_booking_v2`, **not `sxp_booking_defect`**. Each activity carries a
`dbr_reconciliation` block stating both counts and a `quality_match` /
`pickup_match` boolean. Result: **15/19 quality and 16/19 pickup reconcile
exactly**, against round 1's 94.3% of activities having no rows at all.

That matters now that counts are displayed. The four that still differ do so in
**both** directions — Party Deck's pub crawl has 33 in criteria against 30 in
dim, Liulian's Kyoto 4 against 8 — where round 1's gap only ever undercounted.
Show the chips, but expect these four not to add up.

### Trap: `applicable_records` is category-filtered, not tag-filtered

Pickup detail lives in `pickup_problem_rate.applicable_records`, and it is
built from the **`Pickup Problems` category**, so it contains `Change Pick Up
Time` and `Change Pick Up Location` — the two tags the pickup rate does *not*
count. This is the exact bug round 1 shipped and removed from `bali-ts`.

The arithmetic proves the filter is wrong: Split Diocletian lists 7 records over
6 distinct bookings while `pickup_defect_bookings` is **5** — drop its single
`Change Pick Up Time` row and you get exactly 5. **Re-filter
`applicable_records` to the two named pickup tags before display**, and count
distinct `booking_id`, not rows (several bookings repeat across `defect_source`
values: `relay`, `care_chat`, `review`, `care_api`).

The quality side is already correct — `dbr_tags` holds only the nine, and
`dbr_tag_scope` states the rule in the file, naming the nine displayed tags and
recording non-FM supplier cancellation as counted-not-displayed.

`trust_and_safety_tags` is a third list, bare tag strings with no booking or
date. Split–Trogir carries four while passing every T&S rule — tags are not
breaches, so do not drive the T&S row from them.

### Thresholds confirm round 1 was right to bind per activity

Rating bars across the nineteen are 4.6, 4.7 and 4.8; quality bars 0.5%, 0.75%,
1% and 2%. The components' hardcoded `> 4.6` and `< 2.0%` would be wrong for
almost all of them.

## Decisions round 1 left open

Carried forward deliberately; settle them here rather than inheriting them.

- **Rating chart 0–5 axis.** A passing rating is visually indistinguishable from
  the criteria line. `rating-miss` (failing, 4.26–4.56 against a 4.6 bar) reads
  well; `pass` does not. Needs the design owner.
- **"FAQ resources" vs "Resources".** The design shows the latter; the page
  renders the former. One line in `mountDisruptions()`.
- ~~**The two operational rows' copy** disagrees with 720:66225 on all four
  strings.~~ Resolved — 2423:106930 draws 720:66225's phrasings. See "the
  activity page is rebuilt" above.
- **Quality-rate copy gating.** Only 1.2% of activities with a non-zero rate
  have tags that account for it, so any copy pointing at a breakdown must be
  gated on the breakdown existing, as `crit_ts_tag_rate` already is.
- **The `?supplier` manifest trail.** `data/activities.json` is still fetched in
  that mode and lists every fixture filename, which embeds tour ids.

## Not a round-2 problem

`Unsuitable For Disabled Customers` was briefly flagged as shipped-but-absent
from the sheet. It resolved the other way: the tag was right, the sheet was
behind, and the row was restored on 2026-11-11. No change needed.

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

**Not built, for want of data and design:** three of the four Trust & Safety
failure states. No activity in the export fails T&S; `Operations not met`
appears only through Party Deck's hand-written exclusion (below).

## Open threads (as of 2026-11-20)

Four things a new session cannot infer from the code.

**1. Is Body 16/22 too heavy?** The criteria rows were matched to the nodes on
2026-11-20, which moved labels, descriptions, the breakdown list, the
recommended action and the resource links from Caption 14/20 up to Body 16/22.
That is what 2423:106763 and 2423:105747 specify, but it is a visible step up
and Melanie had flagged the page as feeling big *before* the change — the
culprit there was the metric number at a non-token 26px, now Title 2 24/30. If
16/22 still reads heavy in the browser, the fix is in Figma, not here; record
it as a deliberate divergence rather than quietly shrinking the CSS again.

**2. Selects: 44 or 40?** `css/round2.css` forces 44px because that is the
node's `min-height`. The ported preset's `formField` says 40. Figma and the
code design system genuinely disagree. Settle it with the design-system
owners rather than copying the override to other controls.

**3. The activity page has had its type audited, not its spacing.** The
overview was measured value-by-value against 2423:103412 and agrees on all 21.
The activity page has only had its *fonts* matched (13 of 13 against the two
criteria nodes); its paddings and gaps have not had the same pass. Likely
nodes: 2423:106465 / 106499 / 106522 for the three gate cards.

**4. Nothing is pushed.** Twelve commits sit on local `main`.
`HOW-TO-BUILD-A-PROTOTYPE-LIKE-THIS.md` at the repo root is Melanie's and is
deliberately untracked — leave it alone.

### Working note: check the templates parse

Components are Vue string templates in backticks, so a stray backtick in a
comment inside one silently blanks the page — it has happened twice, both
times from writing a prop name in backticks. After editing any template:

```bash
cd v2 && for f in js/*.js; do node --check "$f" || echo "FAIL $f"; done
```

## Supplier links (`?supplier`)

Same affordance as round 1, see `../CLAUDE.md`: `…/sxp/v2/?supplier#<id>`
turns the switcher into a plain label and fetches only that supplier's file
(plus `suppliers.json` and the defect catalogue). The five links:

| Supplier | Link |
|---|---|
| Edinburgh Capital Tours | `https://melaniegyg.github.io/sxp/v2/?supplier#edinburgh-capital-tours` |
| Liulian Travel | `https://melaniegyg.github.io/sxp/v2/?supplier#liulian-travel` |
| Party Deck | `https://melaniegyg.github.io/sxp/v2/?supplier#party-deck` |
| Split Local Tours | `https://melaniegyg.github.io/sxp/v2/?supplier#split-local-tours` |
| Taller Andaluz de Cocina | `https://melaniegyg.github.io/sxp/v2/?supplier#taller-andaluz-de-cocina-cooking-school` |

**Every link between the two pages must go through `pageHref()`** in
`js/supplier-data.js`. Until 2026-11-20 "View details" and "Back" were built
by hand, dropped `?supplier`, and brought the switcher back after one click.

Still not access control: `suppliers.json` names all five suppliers, every
fixture is readable at `data/*.json`, and editing the hash switches company.

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

**An icon on more than one background must be inlined, not `<img>`-ed.** The
Figma exports carry their fill baked in and CSS cannot recolour an `<img>`.
`arrow-right-24.svg` is `#0071EB`, which is also the fill of the primary
Button — so "Check your status" was drawing a blue arrow on a blue button and
losing it entirely, while the same file was fine on the outlined "Learn more".
Melanie caught it 2026-11-20. It now lives in `ICONS.arrowRight` in
`js/components.js` with the identical path data and `fill="currentColor"`, so
it takes white on the filled button and navy on the outlined one. Any icon
that has to sit on two backgrounds needs the same treatment; one that only
ever sits on white can stay an `<img>`.

### Why `css/round2.css` can still win

PrimeVue's generated CSS goes into a cascade layer (`cssLayer` in
`js/primevue-setup.js`). Unlayered CSS beats layered CSS whatever the
specificity, so the bindings in `round2.css` need no `!important` and no
selector arms race. Keep it that way: anything in that file that recolours
rather than positions belongs in the preset instead.

### …and the trap that comes with it

That same rule cuts both ways. `tokens.css` carries an **unlayered** element
selector:

```css
a { color: var(--gyg-interactive-primary); text-decoration: none; }
a:hover { text-decoration: underline; }
```

A Button rendered `as="a"` — which the overview's **View details** is, because
it navigates — is still an `<a>`, so that one rule outranked every
`.p-button` colour in the `primevue` layer. The result was a button with the
navy outline of `severity="contrast"` and the blue label of a link: half of
one variant, half of another, and not a component in the design system.
Melanie caught it on sight, 2026-11-20.

The fix is in `round2.css`:

```css
a.p-button { color: revert-layer; }
a.p-button:hover { text-decoration: none; }
```

`revert-layer` rolls the declaration back to the previous layer's value, so
every variant supplies its own colour without this file naming any of them.
The underline needs `none` spelled out instead — PrimeVue sets no
text-decoration on a button, so reverting would fall through to the user
agent's underline for links and put the problem back.

**Expect this for any PrimeVue component rendered as an anchor**, and for any
other bare element selector in `tokens.css` or `styles.css`. Check the
computed colour against the preset's token before assuming a variant is
applied — the class list looked perfectly correct the whole time.

### Known divergence: the filter selects are 40px, the design draws 44px

The preset's `formField` height wins. Overriding it would put back exactly the
duplication this migration removed, so the design system is treated as
authoritative for control metrics. Raise it with the design-system owners if
44px is deliberate rather than drawn.

## The overview is matched to 2423:103412

Audited value by value on 2026-11-20 and corrected. Take the node as
authoritative for this page; if something here looks arbitrary, it is probably
measured.

**The column gap carries the page.** `.page-inner` is a flex column with a
24px gap, which is the design's Content frame gap. Every direct child
therefore has **no margin of its own** — a margin does not replace the gap, it
adds to it, which is how `.sx-h2` ended up 56 below the block above it. Two
exceptions, both from the node: the lede sits **16** under the title (the
Header frame groups them tighter), and **Ineligible activities** breaks at
**48** (its frame adds 24 of padding-top).

Values worth not re-guessing: banner is `#ebeef1` with a matching border,
head-to-cards 20; its cards are `#f5f6f8` — lighter grey *on* the grey, not
white — at 18/20 padding, 16 gap, 12 radius; headings are Title 4 18/24;
filter labels Body 16/21 in label-secondary; the period is Caption 14/20 flush
with the bottom of the selects; table radius 8, cells 12x16.

**The datatable in that node is at 82% scale** (13.113px text, 9.835px
padding) — an instance resize, not a spec. The CSS uses those numbers
unscaled, which land exactly on `datatable.config.js`'s own `0.75rem 1rem`.

**The selects are 44px, overriding the preset's 40.** The node's select has
`min-height: 44`; the ported `formField` says 40. Figma and the code design
system disagree, and the design wins here because this page is being matched
to it. Settle it at source rather than copying the override elsewhere.

### Round 2 has the expanded sidebar; round 1 keeps the rail

2423:103459 draws a **288px labelled nav**, not round 1's 56px icon rail, and
the page column only lands where the design puts it — content at x=312, 1104
wide — if the nav is that wide. Rebuilt as `.sidenav` in `css/round2.css`,
settled by Melanie 2026-11-20.

It is a **separate class from `.sidebar`**, so `css/styles.css` stays a
verbatim copy of round 1's and round 1 keeps its rail untouched. The same goes
for the `.page-main` / `.page-inner` overrides, which live in `round2.css`
rather than in the copied stylesheet.

Items are 52px with a 16px icon and a 14/20 Medium label; Performance is the
open parent and its two children are 44px rows behind a 2px left rule — grey
for Overview, blue for Excellence program, the active page. Collapse is pinned
to the bottom by a `flex: 1` spacer, as the node's Bottom frame does.

**It collapses** to round 1's 56px icon rail and back, via the Collapse item
(Melanie, 2026-11-20). The design only draws the expanded state, so the rail
follows round 1's: labels, chevrons and the two children hidden, icons centred,
and the label moved to `title` / `aria-label` so a collapsed icon still says
what it is. Performance takes the active treatment in that state, because the
page you are on is one of the children it has just hidden.

The choice is remembered in `localStorage` under `sxp-nav-collapsed`. It has to
be: this is a click-through prototype of two separate documents, so without it
the rail springs back open on every **View details**. Every access is wrapped
in try/catch and falls back to expanded — that storage throws in a private
window or with site data blocked.

**Performance uses `magnifier-bar-chart-nav.svg`, not `magnifier-bar-chart.svg`.**
Same icon, two exports: the nav one is `#1a2b49` because in this node
Performance is merely the open parent, while the criteria card's is `#0071eb`.
Fills are baked in and CSS cannot recolour an `<img>`, so they are two files.
`star.svg`, `arrow-left.svg` and `chevron-down.svg` were pulled from the same
node for this nav.

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

### Supplier-level exclusion banner — built for Party Deck, hand-written data

**Built 2026-11-20** from section 2553:99986 — overview 2241:42264, activity
page 2553:99707 ("Bali"). Melanie: Party Deck is on the review-manipulation
list. `data/supplier-406783-party-deck.json` carries a hand-written
`supplier_exclusion: {reason, until: "2027-02-01", _note}`; nothing in the
export backs it. What it drives:

- **Overview:** a red banner (`critical-weak` #ffe8ed, ink text, no icon)
  above "Badge status", so it shows on **both** month tabs — it is a fact
  about the account, not an assessment result. Every in-scope activity chips
  `Operations not met`, which beats the Review → Operations → Quality cascade
  (two of Party Deck's three would otherwise read `Reviews not met`).
  Ineligible activities are untouched.
- **Activity page (Next month):** a red banner, "This activity does not meet
  the operational standards to be eligible for the program". Operational
  standards moves to the **top**, ahead of a failing review count, so the
  page still leads with what the chip names. Its T&S row fails with the
  design's text and a mailto link to supplierpartner.care@getyourguide.com.
  The badge is never earned while excluded.
- **Not taken from 2553:99707:** its row labels "Trust and safety" and
  "24-hour free cancellation" (the page keeps "Trust and safety check" and
  "24-hour cancellation policy"). Raise before changing — they'd change on
  every activity, not only excluded ones.

The original notes, kept for context:

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

### Quality rows and the failing banner follow 2519:10642 ("Marrakesh")

Matched 2026-11-20 at Melanie's request. Supersedes the quality-row copy and
the failing banner from the earlier nodes.

- **The criteria moved into the description.** Rating, Complaints and Pickup
  issues no longer have a `Criteria:` line under the number; the bar ends the
  sentence instead — "…must be 4.6 or higher", "…must be 2% or lower". That
  wording is **inclusive**, which settles the `> 4.6` / `< 2.0%` boundary
  clash for these three rows. The review-count row still has its `>50`
  criteria line and still clashes with "At least 50".
- **Bars still bind per activity.** The node hardcodes 4.6 and 2%; the page
  prints each activity's own (4.7 / 4.8, 0.5% / 0.75% / 1%). Bars drop
  trailing zeros: "0.5%", not "0.50%".
- **Labels renamed:** `Complaint rate` → **Complaints**, `Pickup problem rate`
  → **Pickup issues**. Complaints has its own description now ("at least one
  general complaint…"), which closes the bug where it repeated the pickup
  row's text.
- **The failing banner** has a 24px warning triangle (`#a65200`, from Figma)
  beside a Title 3 headline, Body text below, padding 24, radius 12. It no
  longer mentions the award date. The node draws one case, a quality failure
  on complaints. `criteria-model.js` generalises it as `badge.failBanner`:
  the headline names the **topmost failing section** ("…does not meet the
  quality standards…", the section the overview chip also names), and the body
  lists every failing row's reason ("due to its rating, complaints and pickup
  issues"), saying "those sections" when more than one section fails. Below
  the review gate the copy is Melanie's own (2026-11-20), since the design
  draws no banner for it: "This activity does not have enough reviews to be
  eligible for the program" / "This activity is not eligible for the badge
  because it doesn’t have 50 reviews in last 6 months."
- **Review count row** now follows 2423:106466 / 2423:106417 (Melanie asked,
  2026-11-20): label "50 reviews from this period", no `Criteria: >50` line,
  and the count shows only when failing. That ends the old `>50` vs "At least
  50" clash. Still unchanged: the This month promo summarises quality as
  "Rating and complaint rate".

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
  flagged in a review or customer care contact". Complaint rate's is wrong. *(Resolved by 2519:10642 — "general complaint".)*
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

### Booking counts are not shown — a "Most common complaint" Tag instead

Settled by Melanie 2026-11-20, reversing her 2026-11-19 call to show the
`6 bookings` chips the design draws. The list is still ranked by count; the
first card carries a `Most common complaint` Tag (`severity="contrast"`) and no
card prints a number. `count` stays in the data for sort order only — the same
reasoning as round 1's strip: a bare number invites arguing with it, and these
counts don't always sum to the rate above them (4 of the 19 round-2 activities
don't reconcile, in both directions).

The Tag only goes on when it is true: **not when the top two are tied**, and
**not when there is a single complaint**, where "most common" is vacuous. That
is looser than round 1's `dominantTag()` (≥3 bookings and double the
runner-up) — deliberately, since Melanie asked for the top one; tighten it to
round 1's guard if a narrow lead starts reading as an overclaim.

The recommended-action title's `{count}` is filled with "recent", as round 1's
`fillCount()` does when there is no count — "Address recent reviews mentioning
the activity was not as advertised". One catalogue title already reads
"{count} recent reviews", so the fill collapses that to a single "recent".

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

**Not covered by the export: `Operations not met` — zero activities fail any
T&S rule or the cancellation policy across all nineteen.** (Party Deck now
reaches it only through the hand-written exclusion above.) So the whole Operational standards
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

Counts are no longer displayed (2026-11-20), but they still set the order and
which card is "Most common". The four that still differ do so in
**both** directions — Party Deck's pub crawl has 33 in criteria against 30 in
dim, Liulian's Kyoto 4 against 8 — where round 1's gap only ever undercounted.
For these four the ranking may not match the aggregate.

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

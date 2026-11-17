# SXP round 2 — what differs from round 1

Read `../CLAUDE.md` first. Everything there still applies: the tag sets, the
T&S rule scoping, the ordering rules, the known problems, the design-system
constraints. This file only records what is specific to round 2.

## Status

**Scaffold only.** `v2/` is currently a byte-identical copy of the round-1 tree,
serving at `/v2/`. Nothing has been redesigned yet. Round-1 behaviour and copy
are the starting point, not the intended end state.

## Planned, not yet done

**Make the defect copy sheet-driven.** This is the main structural change and
the reason round 2 exists as a rebuild rather than a patch.

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

## Decisions round 1 left open

Carried forward deliberately; settle them here rather than inheriting them.

- **Rating chart 0–5 axis.** A passing rating is visually indistinguishable from
  the criteria line. `rating-miss` (failing, 4.26–4.56 against a 4.6 bar) reads
  well; `pass` does not. Needs the design owner.
- **"FAQ resources" vs "Resources".** The design shows the latter; the page
  renders the former. One line in `mountDisruptions()`.
- **The two operational rows' copy** disagrees with 720:66225 on all four
  strings. Needs one decision about which node is authoritative — see the
  comparison table in `../CLAUDE.md`.
- **Quality-rate copy gating.** Only 1.2% of activities with a non-zero rate
  have tags that account for it, so any copy pointing at a breakdown must be
  gated on the breakdown existing, as `crit_ts_tag_rate` already is.
- **The `?supplier` manifest trail.** `data/activities.json` is still fetched in
  that mode and lists every fixture filename, which embeds tour ids.

## Not a round-2 problem

`Unsuitable For Disabled Customers` was briefly flagged as shipped-but-absent
from the sheet. It resolved the other way: the tag was right, the sheet was
behind, and the row was restored on 2026-11-11. No change needed.

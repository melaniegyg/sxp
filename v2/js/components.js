// ============================================================
// SXP ROUND 2 — components
//
// Replaces js/criteria-render.js, which built pages by concatenating HTML
// strings and then hand-wired the toggles afterwards. Everything a PrimeVue
// component covers is now that component; what is left in css/round2.css is
// page layout and the handful of pieces the library has no equivalent for
// (the pre-launch timeline, the criterion row's metric column).
//
// Templates are JS strings, never in-DOM. The HTML parser case-folds tag
// names, so a <Button> written into the document arrives as the native
// <button> and the component never resolves — the same trap for <Select>,
// <Column> and <Tag>. In a string template Vue does its own parsing and the
// casing survives.
// ============================================================
import { LOCKED, activityCount } from "./supplier-data.js";

// ---------------------------------------------------------------
// Icons
// ---------------------------------------------------------------
// Figma exports, not PrimeIcons. README-UI.md in supply-frontend is explicit:
// PrimeIcons ship with PrimeVue and are NOT to be used for app icons — the
// Supplier Portal uses Compass. These four are drawn inline because they are
// status marks inside our own components rather than icon-font glyphs.
//
// Pass is a checkbox, fail an X in the same dark square. Neither is red or
// green: colour lives in the section card's top bar. (2423:103908)
export const ICONS = {
  met:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 12.2l3.6 3.6 7.2-7.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  notMet:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="0" y="0" width="24" height="24" rx="4" fill="currentColor"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  external:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 2h8v8M14 2L6.5 9.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11 10.5V14H2V5h3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sparkle:
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8z" fill="currentColor"/><path d="M18.5 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" fill="currentColor"/></svg>',
  recAction:
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M16 13H8v-2h8zm-8 4h8v-2H8z" fill="currentColor"/><path fill="currentColor" fill-rule="evenodd" d="M4 2v16a4 4 0 004 4h8a4 4 0 004-4V6.586L15.414 2zm2 16V4h8v4h4v10a2 2 0 01-2 2H8a2 2 0 01-2-2" clip-rule="evenodd"/></svg>',
};

export const StatusIcon = {
  props: { status: String },
  computed: { svg() { return this.status === "met" ? ICONS.met : ICONS.notMet; } },
  template: '<span class="sx-row__icon" v-html="svg"></span>',
};

// ---------------------------------------------------------------
// Badge status chip
// ---------------------------------------------------------------
// A PrimeVue Tag on the portal's own preset, not a reimplementation of one.
// The severities land on the colours round 2 had hand-coded anyway:
//   contrast -> {GYG.label.primary} #1a2b49 on white — the earned chip
//   warn     -> {GYG.surface.warning} #ffecc1 on {GYG.label.warning} #a65200
// The amber text is #a65200 where the hand-rolled chip used #8a5a00. The
// preset's value is the canonical one; the old one was eyeballed.
const SEVERITY = {
  excellence: "contrast",
  reviews: "warn",
  operations: "warn",
  quality: "warn",
};

export const StatusTag = {
  props: { chip: Object, preLaunch: Boolean },
  computed: {
    severity() { return SEVERITY[this.chip && this.chip.id] || "secondary"; },
  },
  // Pre-launch nothing has been assessed, so every row shows an em dash.
  // Confirmed 2026-11-19: the dash means "not yet assessed", never "no badge".
  template: `
    <span v-if="preLaunch" class="sx-dash">&mdash;</span>
    <Tag v-else-if="chip" :value="chip.label" :severity="severity" />
  `,
};

// ---------------------------------------------------------------
// Supplier switcher (top-right chip)
// ---------------------------------------------------------------
export const SupplierSwitcher = {
  props: { suppliers: Array, entry: Object, supplierName: String },
  emits: ["select"],
  data: () => ({ locked: LOCKED }),
  computed: {
    sub() {
      return this.entry ? activityCount(this.entry.activities) : "";
    },
    // Labels name the supplier and how many activities it has — nothing
    // evaluative. These are real companies and the view is supplier-facing.
    items() {
      return this.suppliers.map((s) => ({
        label: s.supplierName,
        meta: activityCount(s.activities),
        id: s.id,
        selected: this.entry && s.id === this.entry.id,
        command: () => this.$emit("select", s),
      }));
    },
  },
  methods: {
    toggle(e) { this.$refs.menu.toggle(e); },
  },
  template: `
    <div class="topnav__user" :class="{ 'is-locked': locked }"
         :role="locked ? null : 'button'" :tabindex="locked ? null : 0"
         :aria-haspopup="locked ? null : 'true'"
         :aria-label="locked ? null : 'Switch supplier'"
         @click="locked || toggle($event)" @keydown.enter="locked || toggle($event)">
      <div class="topnav__avatar"></div>
      <div class="topnav__user-info">
        <span class="topnav__name">{{ supplierName || '\\u00a0' }}</span>
        <span class="topnav__company">{{ locked ? '' : sub }}</span>
      </div>
      <svg v-if="!locked" class="topnav__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="#858995" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <Menu v-if="!locked" ref="menu" :model="items" :popup="true" class="sx-switcher-menu">
        <template #item="{ item, props }">
          <a v-bind="props.action" :class="{ 'is-selected': item.selected }">
            <span>{{ item.label }}</span>
            <span class="sx-switcher-menu__meta">{{ item.meta }}</span>
          </a>
        </template>
      </Menu>
    </div>
  `,
};

// ---------------------------------------------------------------
// App shell — top nav, sidebar, help
// ---------------------------------------------------------------
// Both pages carried an identical copy of this markup. One component now, with
// the page's own content in the default slot.
export const AppShell = {
  components: { SupplierSwitcher },
  props: { suppliers: Array, entry: Object, supplierName: String },
  emits: ["select"],
  data: () => ({
    nav: [
      ["Activities", "monument"], ["Create", "file-plus"], ["Manage", "grid"],
      ["Bookings", "calendar"], ["Performance", "magnifier-bar-chart"], ["Finance", "currency"],
    ],
  }),
  template: `
    <header class="topnav">
      <div style="display:flex;align-items:center;gap:24px;">
        <img src="assets/logo-gyg.svg" alt="GetYourGuide" class="topnav__logo">
      </div>
      <SupplierSwitcher :suppliers="suppliers" :entry="entry"
                        :supplier-name="supplierName" @select="$emit('select', $event)" />
    </header>

    <aside class="sidebar">
      <button v-for="[label, icon] in nav" :key="label" class="sidebar__item"
              :class="{ 'sidebar__item--active': label === 'Performance' }" :aria-label="label">
        <img :src="'assets/icons/' + icon + '.svg'" alt="" width="16" height="16">
      </button>
      <div class="sidebar__spacer"></div>
      <button class="sidebar__item" aria-label="Expand menu">
        <img src="assets/icons/arrow-right.svg" alt="" width="16" height="16">
      </button>
    </aside>

    <main class="page-main">
      <div class="page-inner">
        <slot></slot>
        <div style="height:60px;"></div>
      </div>
    </main>

    <button class="help-btn" aria-label="Help">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="white" stroke-width="1.5"/>
        <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 1.7-1.5 2.2S9 10.2 9 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="9" cy="13.5" r=".75" fill="white"/>
      </svg>
      Help
    </button>
  `,
};

// ---------------------------------------------------------------
// Disruption breakdown
// ---------------------------------------------------------------
// A PrimeVue Accordion. Was .sx-dc — a <button> with aria-expanded, a hidden
// sibling panel and a click handler that toggled a class. The component brings
// the roles, the keyboard handling and the chevron with it.
//
// Booking counts ARE shown in round 2 (settled 2026-11-19), reversing round 1's
// strip. They will not always sum to the rate printed above them — the export's
// booking-level rows and its aggregate disagree for 4 of these 19 activities,
// in both directions. See CLAUDE.md.
export const DisruptionList = {
  props: { title: String, items: Array, catalogue: Object },
  // Single-open, not `multiple`: opening one closes the rest (Melanie,
  // 2026-11-20). A tag card carries what you can do about it, so several open
  // at once is several competing instructions and a lot of scrolling past
  // them. The first opens by default so the list never reads as inert.
  data: () => ({ open: "0" }),
  methods: {
    meta(entry) { return (this.catalogue.tags && this.catalogue.tags[entry.tag]) || null; },
    // Falls back to the internal tag name only if the catalogue has no row —
    // better a visible internal string than a blank card.
    name(entry) { const m = this.meta(entry); return (m && m.name) || entry.tag; },
    desc(entry) { const m = this.meta(entry); return (m && m.description) || ""; },
    doList(entry) { const m = this.meta(entry); return (m && m.whatYouCanDo) || []; },
    resources(entry) { const m = this.meta(entry); return (m && m.resources) || []; },
    rec(entry) {
      const m = this.meta(entry);
      return m && m.recActionKey ? (this.catalogue.recActions || {})[m.recActionKey] : null;
    },
    // fillCount: the drawn "Address X reviews…" is this {count} placeholder.
    recTitle(entry) {
      const ra = this.rec(entry);
      return ra ? String(ra.title).replace(/\{count\}/g, entry.count) : "";
    },
    bookings(entry) { return entry.count === 1 ? "1 booking" : entry.count + " bookings"; },
  },
  template: `
    <div class="sx-details">
      <h4 class="sx-details__h">{{ title }}</h4>
      <Accordion v-model:value="open" class="sx-acc">
        <AccordionPanel v-for="(entry, i) in items" :key="entry.tag" :value="String(i)">
          <AccordionHeader>
            <span class="sx-dc__text">
              <span class="sx-dc__name">{{ name(entry) }}</span>
              <span v-if="desc(entry)" class="sx-dc__desc">{{ desc(entry) }}</span>
            </span>
            <Tag :value="bookings(entry)" severity="contrast" rounded class="sx-dc__count" />
          </AccordionHeader>
          <AccordionContent>
            <template v-if="doList(entry).length">
              <h5 class="sx-dc__h">What you can do</h5>
              <ul class="sx-dc__list"><li v-for="r in doList(entry)" :key="r">{{ r }}</li></ul>
            </template>

            <div v-if="rec(entry)" class="sx-ra">
              <div class="sx-ra__main">
                <span class="sx-ra__icon" v-html="icons.recAction"></span>
                <div>
                  <p class="sx-ra__title">{{ recTitle(entry) }}</p>
                  <p class="sx-ra__desc">{{ rec(entry).description }}</p>
                </div>
              </div>
              <Button :label="rec(entry).buttonLabel || 'Take action'" />
            </div>

            <template v-if="resources(entry).length">
              <h5 class="sx-dc__h">Resources</h5>
              <ul class="sx-dc__links">
                <li v-for="r in resources(entry)" :key="r.title">
                  <a v-if="r.url" :href="r.url" target="_blank" rel="noopener">
                    {{ r.title }}<span v-html="icons.external"></span>
                  </a>
                  <span v-else class="sx-dc__link--flat">
                    {{ r.title }}<span v-html="icons.external"></span>
                  </span>
                </li>
              </ul>
            </template>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  `,
  computed: { icons: () => ICONS },
};

// ---------------------------------------------------------------
// One criterion row
// ---------------------------------------------------------------
export const CriterionRow = {
  components: { StatusIcon, DisruptionList },
  props: { row: Object, catalogue: Object },
  data: () => ({ showDetails: false }),
  computed: {
    failing() { return this.row.status === "not-met"; },
    // The failing variant REPLACES the description rather than appending to it
    // — the cancellation row's fail copy tells you what to do instead of
    // restating the rule.
    desc() {
      return this.failing && this.row.failDescription
        ? this.row.failDescription
        : this.row.description;
    },
    // `0%` is its own variant with no toggle, and a passing non-zero rate still
    // expands. So the gate is "is there a breakdown", never "is the rate
    // failing" — the only gate the data supports, since 94.3% of activities
    // with a non-zero rate have no tagged bookings at all.
    tags() { return this.row.disruptions || []; },
    icons: () => ICONS,
  },
  template: `
    <!-- The collapsed below-the-gate line: no metric, no detail, just a
         statement that the metrics are withheld. -->
    <div v-if="row.id === 'quality-blocked'" class="sx-row sx-row--blocked">
      <StatusIcon :status="row.status" />
      <p class="sx-row__blocked">{{ row.label }}</p>
    </div>

    <div v-else class="sx-row" :class="{ 'is-failing': failing }">
      <div class="sx-row__left">
        <StatusIcon :status="row.status" />
        <template v-if="row.metric">
          <span class="sx-row__value">{{ row.metric.value }}</span>
          <span v-if="row.metric.criteria" class="sx-row__criteria">
            Criteria:<br>{{ row.metric.criteria }}
          </span>
        </template>
      </div>

      <div class="sx-row__main">
        <p class="sx-row__label">{{ row.label }}</p>
        <p v-if="desc" class="sx-row__desc">{{ desc }}</p>

        <!-- TODO(data): nothing in the export backs the Review summary block;
             it renders only when a fixture supplies review_summary. None does. -->
        <div v-if="failing && row.reviewSummary" class="sx-summary">
          <p class="sx-summary__h"><span v-html="icons.sparkle"></span>Review summary</p>
          <p class="sx-summary__body">{{ row.reviewSummary.text }}</p>
          <p class="sx-summary__meta">{{ row.reviewSummary.meta }}</p>
        </div>

        <template v-if="tags.length">
          <Button class="sx-see" variant="text" :label="showDetails ? 'Hide details' : 'See details'"
                  :icon="'pi'" :aria-expanded="String(showDetails)"
                  @click="showDetails = !showDetails">
            <template #icon>
              <svg class="sx-see__chev" :class="{ 'is-open': showDetails }" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </Button>
          <DisruptionList v-if="showDetails"
                          :title="row.disruptionsTitle || 'Top complaints for this activity'"
                          :items="tags" :catalogue="catalogue" />
        </template>

        <Button v-if="row.cta && failing" class="sx-row__cta" severity="contrast" outlined
                :label="row.cta.label" />
      </div>
    </div>
  `,
};

// ---------------------------------------------------------------
// One criteria section
// ---------------------------------------------------------------
// The rail is a bar across the TOP of each card (2423:103908), not round 1's
// per-row left-rail segments. Per section, so a mixed card takes the amber of
// its failing row — which is always its first row, since rows sort failing
// first.
export const SectionCard = {
  components: { CriterionRow },
  props: { section: Object, period: String, catalogue: Object },
  computed: {
    failed() { return this.section.rows.some((r) => r.status === "not-met"); },
  },
  template: `
    <Card class="sx-card" :class="{ 'is-failing': failed }">
      <template #header><div class="sx-card__bar"></div></template>
      <template #title>
        <div class="sx-card__head">
          <h3>{{ section.title }}</h3>
          <span class="sx-card__period">{{ period }}</span>
        </div>
      </template>
      <template #content>
        <div class="sx-card__rows">
          <CriterionRow v-for="row in section.rows" :key="row.id" :row="row" :catalogue="catalogue" />
        </div>
      </template>
    </Card>
  `,
};

// ---------------------------------------------------------------
// The outcome banner
// ---------------------------------------------------------------
export const BadgeBanner = {
  props: { badge: Object, tsExclusion: Boolean },
  template: `
    <Message v-if="badge.earned" severity="success" :closable="false" class="sx-banner">
      <p class="sx-banner__h">
        Nice work! This activity will receive an Excellent Experience badge in {{ badge.awardMonth }}
      </p>
      <p class="sx-banner__b">
        As long as you continue to meet all the criteria below, the badge will be awarded on
        <strong>{{ badge.awardDate }}</strong>
      </p>
    </Message>
    <Message v-else severity="warn" :closable="false" class="sx-banner">
      <p class="sx-banner__h">
        This activity does not yet meet the criteria for the Excellent Experience badge
      </p>
      <!-- Only say "keep working on it" where work on THIS activity can change
           the outcome. A supplier-level Trust & Safety ban cannot — round 1's
           documented copy bug. No round-2 activity fails T&S, so the second
           clause is currently unreachable. -->
      <p class="sx-banner__b">
        Review what is not met below. Criteria are reassessed every month, and the next badges
        are awarded on <strong>{{ badge.awardDate }}</strong><template v-if="tsExclusion">. This is a
        Trust &amp; Safety exclusion and applies across your activities</template>
      </p>
    </Message>
  `,
};

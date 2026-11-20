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
import { LOCKED, activityCount, supportsSpanish } from "./supplier-data.js";

// Copy comes from js/i18n.js. Templates call the global `t` (registered in
// primevue-setup.js); plain JS here uses this.
const t = (key, vars) => window.SXP_I18N.t(key, vars);

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
  // Circled "i", 24px, currentColor — the ineligible table's tooltip trigger.
  info:
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.1" fill="currentColor"/></svg>',
  // features / certifications / compact-badge (Figma 12:12314), inlined with
  // currentColor: the export is white, and it sits on the navy Excellence
  // chip both in the page header (2423:103415) and in the table.
  compactBadge:
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10.8474 6.90216L7.4822 10.492L5.21267 8.55548L6.1863 7.41388L7.36696 8.42169L9.75271 5.87677L10.8474 6.90216Z" fill="currentColor"/><path d="M6.33474 1.65313C7.24797 0.717939 8.75258 0.717902 9.66579 1.65313L10.072 2.07012C10.2301 2.2318 10.4475 2.32177 10.6736 2.31915L11.2556 2.31231C12.5626 2.29674 13.6265 3.35988 13.6111 4.6668L13.6043 5.24884C13.6016 5.47513 13.6914 5.69326 13.8533 5.85138L14.2693 6.25763C15.2046 7.17086 15.2046 8.67545 14.2693 9.58868L13.8533 9.99493C13.6915 10.153 13.6017 10.3703 13.6043 10.5965L13.6111 11.1785C13.6267 12.4856 12.5627 13.5496 11.2556 13.534L10.6736 13.5272C10.4475 13.5245 10.2301 13.6144 10.072 13.7762L9.66579 14.1932C8.75263 15.1283 7.24799 15.1282 6.33474 14.1932L5.92849 13.7762C5.77038 13.6143 5.55225 13.5245 5.32595 13.5272L4.74392 13.534C3.43696 13.5494 2.37386 12.4855 2.38942 11.1785L2.39626 10.5965C2.39886 10.3703 2.3081 10.153 2.14626 9.99493L1.73024 9.58868C0.794995 8.67545 0.794995 7.17086 1.73024 6.25763L2.14626 5.85138C2.30818 5.69326 2.39896 5.47513 2.39626 5.24884L2.38942 4.6668C2.37404 3.35996 3.43706 2.29688 4.74392 2.31231L5.32595 2.31915C5.55223 2.32184 5.77038 2.23202 5.92849 2.07012L6.33474 1.65313ZM8.59255 2.70098C8.2679 2.36851 7.73268 2.36859 7.40798 2.70098L7.00173 3.11798C6.55704 3.57338 5.94483 3.82671 5.30837 3.81915L4.72634 3.81231C4.26163 3.80678 3.88391 4.18453 3.88942 4.64923L3.89626 5.23126C3.90384 5.86772 3.65047 6.47992 3.19509 6.92462L2.7781 7.33087C2.44561 7.65556 2.44559 8.19076 2.7781 8.51544L3.19509 8.92169C3.65037 9.36637 3.90384 9.97866 3.89626 10.615L3.88942 11.1971C3.88409 11.6616 4.26175 12.0395 4.72634 12.034L5.30837 12.0272C5.94483 12.0196 6.55704 12.2729 7.00173 12.7283L7.40798 13.1443C7.73267 13.4769 8.26786 13.4769 8.59255 13.1443L8.9988 12.7283C9.4435 12.2729 10.0557 12.0196 10.6922 12.0272L11.2742 12.034C11.7386 12.0393 12.1164 11.6615 12.1111 11.1971L12.1043 10.615C12.0967 9.97856 12.35 9.36639 12.8054 8.92169L13.2215 8.51544C13.554 8.19075 13.554 7.65556 13.2215 7.33087L12.8054 6.92462C12.35 6.47991 12.0967 5.86775 12.1043 5.23126L12.1111 4.64923C12.1166 4.18468 11.7387 3.80703 11.2742 3.81231L10.6922 3.81915C10.0558 3.82673 9.44349 3.57326 8.9988 3.11798L8.59255 2.70098Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></svg>',
  met:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 12.2l3.6 3.6 7.2-7.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  notMet:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="0" y="0" width="24" height="24" rx="4" fill="currentColor"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  external:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 2h8v8M14 2L6.5 9.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11 10.5V14H2V5h3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sparkle:
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8z" fill="currentColor"/><path d="M18.5 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" fill="currentColor"/></svg>',
  // The same path as assets/icons/arrow-right-24.svg, but `currentColor`
  // instead of that file's baked-in #0071EB. It has to be inline: this arrow
  // rides on two different buttons — white on the filled primary "Check your
  // status", navy on the outlined "Learn more" — and CSS cannot recolour an
  // <img>, so the exported file was drawing blue on blue and vanishing.
  // Any icon that appears on more than one background needs this treatment.
  arrowRight:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20.3682 12L12.7314 20.1826L11.2686 18.8184L16.6992 13H3V11H16.6992L11.2686 5.18262L12.7314 3.81738L20.3682 12Z" fill="currentColor"/></svg>',
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
    icons: () => ICONS,
  },
  // Pre-launch nothing has been assessed, so every row shows an em dash.
  // Confirmed 2026-11-19: the dash means "not yet assessed", never "no badge".
  template: `
    <span v-if="preLaunch" class="sx-dash">&mdash;</span>
    <!-- The earned chip carries the compact-badge icon (Melanie, 2026-11-20),
         matching the header badge; the "not met" chips stay text-only. -->
    <Tag v-else-if="chip && chip.id === 'excellence'" :value="chip.label" :severity="severity"
         class="sx-tag--earned">
      <template #icon><span class="sx-tag__icon" v-html="icons.compactBadge"></span></template>
    </Tag>
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
         :aria-label="locked ? null : t('switcher.aria')"
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
// The sidebar is the EXPANDED nav 2423:103459 draws, not round 1's 56px icon
// rail — settled by Melanie 2026-11-20 so the page column lands where the
// design puts it (content at x=288, 1104 wide). Round 1 keeps its rail.
//
// Items are 52px with a 16px icon and a 14/20 Medium label. Performance is
// open, and its two children are 44px rows indented behind a 2px left rule:
// grey for Overview, blue for Excellence program, which is the active page.
// `trailing` marks the four parents that carry a chevron.
export const AppShell = {
  components: { SupplierSwitcher },
  props: { suppliers: Array, entry: Object, supplierName: String },
  emits: ["select", "lang"],
  data: () => ({
    // `key` is the i18n key; the label is resolved at render time.
    navTop: [
      { key: "nav.home", icon: "monument" },
      { key: "nav.create", icon: "file-plus", chevron: true },
      { key: "nav.manage", icon: "grid", chevron: true },
      { key: "nav.bookings", icon: "calendar", chevron: true },
      // The navy export, not the blue one the criteria cards use: in this
      // node Performance is the open parent, not the active item.
      { key: "nav.performance", icon: "magnifier-bar-chart-nav", chevron: true },
    ],
    navSub: [
      { key: "nav.overview", active: false },
      { key: "nav.excellence", active: true },
    ],
    navRest: [
      { key: "nav.reviews", icon: "star" },
      { key: "nav.finance", icon: "currency" },
    ],
    // Collapsing drops the nav to round 1's 56px icon rail and slides the
    // page left with it. Remembered per viewer, because the prototype is a
    // click-through: the overview and the activity page are separate
    // documents, so without this the rail would spring back open on every
    // "View details". localStorage can throw (private windows, blocked site
    // data), so every touch of it is guarded and false is the fallback.
    collapsed: (() => {
      try { return localStorage.getItem("sxp-nav-collapsed") === "1"; }
      catch (e) { return false; }
    })(),
  }),
  computed: {
    // The language toggle shows only for suppliers offered Spanish.
    bilingual() { return supportsSpanish(this.entry); },
    langOptions() {
      return [
        { label: t("lang.en"), value: "en" },
        { label: t("lang.es"), value: "es" },
      ];
    },
    lang: {
      get() { return window.SXP_I18N.state.lang; },
      set(v) { this.$emit("lang", v); },
    },
  },
  methods: {
    // Collapsed, Performance is the active row, so it takes the blue export
    // of the magnifier — the same file the criteria cards use. Expanded it is
    // only the open parent and stays navy. One icon, two colours, two files:
    // the fill is baked in and CSS cannot recolour an <img>.
    navIcon(item) {
      return this.collapsed && item.key === "nav.performance"
        ? "magnifier-bar-chart"
        : item.icon;
    },
    toggleNav() {
      this.collapsed = !this.collapsed;
      try { localStorage.setItem("sxp-nav-collapsed", this.collapsed ? "1" : "0"); }
      catch (e) { /* not worth failing the click over */ }
    },
  },
  template: `
    <header class="topnav">
      <div style="display:flex;align-items:center;gap:24px;">
        <img src="assets/logo-gyg.svg" alt="GetYourGuide" class="topnav__logo">
      </div>
      <div class="topnav__right">
        <!-- English / Español, for suppliers listed with Spanish in
             data/suppliers.json. A SelectButton, the same control as the
             month toggle. -->
        <SelectButton v-if="bilingual" v-model="lang" :options="langOptions" optionLabel="label"
                      optionValue="value" :allowEmpty="false" class="sx-lang"
                      :aria-label="t('lang.aria')" />
        <SupplierSwitcher :suppliers="suppliers" :entry="entry"
                          :supplier-name="supplierName" @select="$emit('select', $event)" />
      </div>
    </header>

    <aside class="sidenav" :class="{ 'is-collapsed': collapsed }">
      <div class="sidenav__container">
        <div class="sidenav__top">
          <!-- Collapsed, the label is gone, so it becomes the tooltip and the
               accessible name. Performance takes the active treatment in that
               state because the page we are on is one of its children, which
               are themselves hidden. -->
          <button v-for="i in navTop" :key="i.key" class="sidenav__item" type="button"
                  :class="{ 'is-active': collapsed && i.key === 'nav.performance' }"
                  :title="collapsed ? t(i.key) : null"
                  :aria-label="collapsed ? t(i.key) : null">
            <img :src="'assets/icons/' + navIcon(i) + '.svg'" alt="" width="16" height="16">
            <span class="sidenav__label">{{ t(i.key) }}</span>
            <img v-if="i.chevron" class="sidenav__chev" src="assets/icons/chevron-down.svg"
                 alt="" width="16" height="16">
          </button>

          <div v-for="s in navSub" :key="s.key" class="sidenav__subwrap">
            <button class="sidenav__sub" :class="{ 'is-active': s.active }" type="button"
                    :aria-current="s.active ? 'page' : null">
              <span class="sidenav__label">{{ t(s.key) }}</span>
            </button>
          </div>

          <button v-for="i in navRest" :key="i.key" class="sidenav__item" type="button"
                  :title="collapsed ? t(i.key) : null"
                  :aria-label="collapsed ? t(i.key) : null">
            <img :src="'assets/icons/' + i.icon + '.svg'" alt="" width="16" height="16">
            <span class="sidenav__label">{{ t(i.key) }}</span>
          </button>
        </div>

        <div class="sidenav__bottom">
          <button class="sidenav__item" type="button" @click="toggleNav"
                  :aria-expanded="String(!collapsed)"
                  :title="collapsed ? t('nav.expandMenu') : null"
                  :aria-label="collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')">
            <img :src="'assets/icons/arrow-' + (collapsed ? 'right' : 'left') + '.svg'"
                 alt="" width="16" height="16">
            <span class="sidenav__label">{{ t('nav.collapse') }}</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="page-main" :class="{ 'is-nav-collapsed': collapsed }">
      <div class="page-inner">
        <slot></slot>
        <div style="height:60px;"></div>
      </div>
    </main>

    <button class="help-btn" :aria-label="t('help')">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="white" stroke-width="1.5"/>
        <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 1.7-1.5 2.2S9 10.2 9 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="9" cy="13.5" r=".75" fill="white"/>
      </svg>
      {{ t('help') }}
    </button>
  `,
};

// ---------------------------------------------------------------
// Recommended action card — ported from the Supplier Portal
// ---------------------------------------------------------------
// supply-frontend: apps/supplier-portal-nuxt/components/pages/performance/
// recommended-actions/recommended-action-card.vue (+ the action button,
// recommended-action-action-button.vue). Replaces round 2's hand-rolled
// .sx-ra box (Melanie, 2026-11-20: "it's already built in the portal").
//
// Same structure: a PrimeVue Card; icon, then a text column, then the CTA in
// a wrapper that is flex: none so long copy can never squeeze it. Spacing
// follows Figma 2423:104676 rather than the portal's looser desktop margins
// (Melanie, 2026-11-20) — see .sx-rac in round2.css. Left out, for want of a backend: the dismiss button and form,
// eyebrow, footer/uplift tag, analytics, and the dialog actions.
export const RecommendedActionCard = {
  props: { title: String, body: Array, actionLabel: String },
  emits: ["button-click"],
  computed: { icons: () => ICONS },
  template: `
    <Card class="sx-rac" data-testid="recommended-action-card">
      <template #content>
        <div class="sx-rac__row">
          <div class="sx-rac__main">
            <span class="sx-rac__icon" v-html="icons.recAction"></span>
            <div class="sx-rac__text">
              <h3 class="sx-rac__title">{{ title }}</h3>
              <div>
                <p v-for="line in body" :key="line" class="sx-rac__body">{{ line }}</p>
              </div>
            </div>
          </div>
          <div class="sx-rac__action">
            <Button class="sx-rac__btn" :label="actionLabel"
                    @click="$emit('button-click')" />
          </div>
        </div>
      </template>
    </Card>
  `,
};

// ---------------------------------------------------------------
// Disruption breakdown
// ---------------------------------------------------------------
// A PrimeVue Accordion. Was .sx-dc — a <button> with aria-expanded, a hidden
// sibling panel and a click handler that toggled a class. The component brings
// the roles, the keyboard handling and the chevron with it.
//
// Booking counts are NOT shown (Melanie, 2026-11-20 — reversing her own
// 2026-11-19 call to show them). The list is already ranked by count; the top
// card instead carries a "Most common complaint" Tag, so the order is explicit
// without printing a number a supplier can argue with, or one that fails to
// sum to the rate above it (4 of the 19 activities don't reconcile). count
// stays in the data for sorting only.
//
// The Tag goes on the first card only when it really is the most common: not
// when the top two are tied, and not when there is only one complaint, where
// "most common" would be vacuous.
export const DisruptionList = {
  components: { RecommendedActionCard },
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
      // No count on the page, so none here either: round 1's fillCount()
      // fallback, "Address recent reviews…". One title already says
      // "{count} recent reviews", so collapse that first or it reads
      // "recent recent".
      return ra
        ? String(ra.title).replace(/\{count\}\s+recent\b/g, t("dc.recent")).replace(/\{count\}/g, t("dc.recent"))
        : "";
    },
    isMostCommon(i) {
      const it = this.items || [];
      return i === 0 && it.length > 1 && it[0].count > it[1].count;
    },
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
            <!-- severity="secondary", the preset's grey (Melanie, 2026-11-20) —
                 was contrast navy, which read as heavy as the earned badge. -->
            <Tag v-if="isMostCommon(i)" :value="t('dc.mostCommon')" severity="secondary" rounded class="sx-dc__count" />
          </AccordionHeader>
          <AccordionContent>
            <template v-if="doList(entry).length">
              <h5 class="sx-dc__h">{{ t('dc.whatYouCanDo') }}</h5>
              <ul class="sx-dc__list"><li v-for="r in doList(entry)" :key="r">{{ r }}</li></ul>
            </template>

            <RecommendedActionCard v-if="rec(entry)" :title="recTitle(entry)"
                                   :body="[rec(entry).description]"
                                   :action-label="rec(entry).buttonLabel || t('dc.takeAction')" />

            <template v-if="resources(entry).length">
              <h5 class="sx-dc__h">{{ t('dc.resources') }}</h5>
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
    // A description may carry one {email} placeholder (the review-manipulation
    // T&S row), rendered as a mailto link. Split here so the template stays
    // plain text either side of it.
    descParts() {
      const d = this.desc || "";
      const email = this.failing && this.row.failEmail;
      if (!email || !d.includes("{email}")) return null;
      const [before, after] = d.split("{email}");
      return { before, email, after };
    },
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
            {{ t('row.criteria') }}<br>{{ row.metric.criteria }}
          </span>
        </template>
      </div>

      <div class="sx-row__main">
        <p class="sx-row__label">{{ row.label }}</p>
        <p v-if="descParts" class="sx-row__desc">{{ descParts.before }}<a class="sx-row__email" :href="'mailto:' + descParts.email">{{ descParts.email }}</a>{{ descParts.after }}</p>
        <p v-else-if="desc" class="sx-row__desc">{{ desc }}</p>

        <!-- TODO(data): nothing in the export backs the Review summary block;
             it renders only when a fixture supplies review_summary. None does. -->
        <div v-if="failing && row.reviewSummary" class="sx-summary">
          <p class="sx-summary__h"><span v-html="icons.sparkle"></span>{{ t('row.reviewSummary') }}</p>
          <p class="sx-summary__body">{{ row.reviewSummary.text }}</p>
          <p class="sx-summary__meta">{{ row.reviewSummary.meta }}</p>
        </div>

        <template v-if="tags.length">
          <Button class="sx-see" variant="text" :label="showDetails ? t('row.hideDetails') : t('row.seeDetails')"
                  :icon="'pi'" :aria-expanded="String(showDetails)"
                  @click="showDetails = !showDetails">
            <template #icon>
              <svg class="sx-see__chev" :class="{ 'is-open': showDetails }" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </Button>
          <DisruptionList v-if="showDetails"
                          :title="row.disruptionsTitle || t('row.complaints.top')"
                          :items="tags" :catalogue="catalogue" />
        </template>

        <!-- Primary outlined — #0071eb border and label, as 2423:106466 draws
             "Collect more reviews" and 2423:106505 "Contact us". Was
             severity="contrast" (navy) until Melanie, 2026-11-20. -->
        <Button v-if="row.cta && failing" class="sx-row__cta" outlined rounded
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
// Supplier-level exclusion banner (overview), 2241:42264
// ---------------------------------------------------------------
// Red, no icon, Title 3 headline with the until-date, Body underneath.
export const ExclusionBanner = {
  props: { exclusion: Object },
  template: `
    <Message severity="error" :closable="false" class="sx-banner sx-banner--fail sx-banner--critical">
      <p class="sx-banner__h">{{ exclusion.headline }}</p>
      <p class="sx-banner__b">{{ exclusion.body }}</p>
    </Message>
  `,
};

// ---------------------------------------------------------------
// The outcome banner
// ---------------------------------------------------------------
export const BadgeBanner = {
  props: { badge: Object, tsExclusion: Boolean },
  template: `
    <Message v-if="badge.earned" severity="success" :closable="false" class="sx-banner">
      <p class="sx-banner__h">{{ t('banner.earned.headline', { month: badge.awardMonth }) }}</p>
      <p class="sx-banner__b">
        {{ t('banner.earned.body') }} <strong>{{ badge.awardDate }}</strong>
      </p>
    </Message>
    <!-- 2519:10642: warning icon beside a Title 3 headline, Body below it.
         The copy is built in criteria-model.js (badge.failBanner) — the node
         draws one case, the model generalises it. The award date it used to
         carry is gone, as in the design. -->
    <!-- A supplier-level exclusion is red and has no icon (2553:99723);
         everything else is the amber banner with the warning triangle. -->
    <Message v-else-if="badge.failBanner && badge.failBanner.critical" severity="error"
             :closable="false" class="sx-banner sx-banner--fail sx-banner--critical">
      <p class="sx-banner__h">{{ badge.failBanner.headline }}</p>
      <p class="sx-banner__b">{{ badge.failBanner.body }}</p>
    </Message>
    <Message v-else severity="warn" :closable="false" class="sx-banner sx-banner--fail">
      <div class="sx-banner__row">
        <img src="assets/icons/triangle-exclamation-24.svg" alt="" width="24" height="24">
        <p class="sx-banner__h">{{ badge.failBanner.headline }}</p>
      </div>
      <!-- Only say "keep working on it" where work on THIS activity can change
           the outcome. A supplier-level Trust & Safety ban cannot — round 1's
           documented copy bug. No round-2 activity fails T&S, so the second
           sentence is currently unreachable. -->
      <p class="sx-banner__b">
        {{ badge.failBanner.body }}<template v-if="tsExclusion">{{ t('banner.tsExclusion') }}</template>
      </p>
    </Message>
  `,
};

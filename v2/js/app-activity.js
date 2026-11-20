// ============================================================
// ACTIVITY PAGE — activity.html
// ============================================================
import { createSxpApp } from "./primevue-setup.js";
import { AppShell, SectionCard, BadgeBanner, ICONS } from "./components.js";
import { createSupplierState, pageHref, initialMonth } from "./supplier-data.js";
import { confettiRain } from "./confetti.js";

// ---------------------------------------------------------------
// Earned-badge celebration
// ---------------------------------------------------------------
// From Melanie's "badge criteria cascade" concept (2026-11-20), motion only:
// the success banner bounces in, each section card pops (lift + soft green
// glow, then settles — its bar stays the design's soft green), its ticks pop
// and draw, and confetti falls. CSS lives under .sx-celebrate in round2.css.
//
// Only for activities that EARN the badge, and once per visit per activity:
// the first time its Next month view shows in this browser session. Skipped
// entirely under prefers-reduced-motion. sessionStorage can throw (private
// windows, blocked site data); then it simply plays each time.
const CELEBRATE_MS = 5000; // longest card + tick animation, with margin
const reducedMotion = () =>
  !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function firstTimeThisVisit(key) {
  try {
    if (sessionStorage.getItem(key) === "1") return false;
    sessionStorage.setItem(key, "1");
  } catch (e) { /* storage unavailable: treat as first time */ }
  return true;
}

const { reactive } = window.Vue;

// ---------------------------------------------------------------
// THIS MONTH — pre-launch promo
// ---------------------------------------------------------------
// Not a criteria view. Nothing has been awarded yet, so the page sells the
// programme and says when the first assessment lands. The criteria list mirrors
// the three sections but carries "Tracking since" tags rather than statuses.
//
// The timeline is the one block with no PrimeVue equivalent — it is a bespoke
// six-month ruler, not a ProgressBar or a Timeline, so it stays CSS.
const PromoPanel = {
  emits: ["check"],
  computed: {
    icons: () => ICONS,
    // The month ruler's labels are one comma-separated string per language
    // in js/i18n.js; the last one is the current month.
    months() { return this.t("promo.months").split(","); },
    current() { return this.months[this.months.length - 1]; },
  },
  // Keys into js/i18n.js.
  data: () => ({
    criteria: [
      ["compass-badge", "sec.review-count", "promo.crit.reviews"],
      ["compass-eye", "sec.operational", "promo.crit.operational"],
      // Matches the overview's Quality standards card — see app-overview.js.
      ["magnifier-bar-chart", "sec.quality", "promo.crit.quality"],
    ],
    benefits: [
      ["compass-badge", "promo.b1.t", "promo.b1.d"],
      ["compass-magnifier", "promo.b2.t", "promo.b2.d"],
      ["compass-eye", "promo.b3.t", "promo.b3.d"],
    ],
  }),
  template: `
    <Card class="sx-promo">
      <template #content>
        <div class="sx-promo__head">
          <div>
            <h3 class="sx-promo__title">{{ t('promo.title') }}</h3>
            <p class="sx-promo__desc">{{ t('promo.desc') }}</p>
          </div>
          <!-- Default slot, not label + #icon: with a custom icon slot
               PrimeVue ignores iconPos and puts the arrow before the text.
               The arrow is inline SVG so it inherits the button's white — the
               exported file is #0071EB and vanished against the blue fill. -->
          <Button class="sx-promo__cta" rounded @click="$emit('check')">
            <span class="p-button-label">{{ t('promo.cta') }}</span>
            <span class="sx-btn-icon" v-html="icons.arrowRight"></span>
          </Button>
        </div>

        <div class="sx-timeline">
          <div class="sx-timeline__months">
            <div v-for="m in months" :key="m" class="sx-tm" :class="{ 'is-current': m === current }">
              <span class="sx-tm__label">{{ m }}</span>
              <span class="sx-tm__bar"></span>
              <span v-if="m === current" class="sx-tm__today">{{ t('promo.today', { m }) }}</span>
            </div>
          </div>
          <div class="sx-timeline__award">
            <p class="sx-timeline__date">{{ t('promo.awardDate') }}</p>
            <p class="sx-timeline__note">{{ t('promo.awarded') }}</p>
          </div>
        </div>

        <h4 class="sx-promo__h">{{ t('promo.evaluated') }}</h4>
        <ul class="sx-promo__list">
          <li v-for="[icon, title, desc] in criteria" :key="title">
            <img :src="'assets/icons/' + icon + '.svg'" alt="" width="20" height="20">
            <span><strong>{{ t(title) }}</strong><em>{{ t(desc) }}</em></span>
            <Tag :value="t('promo.tracking')" severity="secondary" rounded />
          </li>
        </ul>

        <h4 class="sx-promo__h">{{ t('promo.benefits') }}</h4>
        <div class="sx-benefits">
          <Card v-for="[icon, title, desc] in benefits" :key="title" class="sx-benefit">
            <template #content>
              <img :src="'assets/icons/' + icon + '.svg'" alt="" width="24" height="24">
              <p class="sx-benefit__t">{{ t(title) }}</p>
              <p class="sx-benefit__d">{{ t(desc) }}</p>
            </template>
          </Card>
        </div>
      </template>
    </Card>
  `,
};

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
const App = {
  components: { AppShell, SectionCard, BadgeBanner, PromoPanel },
  setup() {
    const model = reactive({ activity: null, catalogue: {}, catalogueEs: {} });

    // Awaited at render time, not assigned on arrival — the supplier fetch can
    // win the race and render an empty breakdown otherwise.
    fetch("data/defect-catalogue.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((c) => { model.catalogue = c; })
      .catch(() => {});
    // The Spanish overlay: names, descriptions, advice and recommended
    // actions per tag. Merged over the English at render time (see
    // `catalogue` below); resources stay English, as their articles are.
    fetch("data/defect-catalogue.es.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((c) => { model.catalogueEs = c; })
      .catch(() => {});

    const { state, init, select, setLanguage } = createSupplierState(reactive, (file, entry, tourId) => {
      // No activity switcher: the activity comes from the hash, which the
      // overview's "View details" link sets. Falls back to the first.
      const list = file.activities || [];
      const a = list.find((x) => x.tour_id === tourId) || list[0];
      if (!a) return;
      model.activity = window.SXP.build(a, file.supplier_exclusion || null);
      document.title = window.SXP_I18N.t("doc.title", { name: model.activity.activityTitle });
    });
    init();
    return { state, model, select, setLanguage };
  },
  // Opens on NEXT MONTH, like the overview (Melanie, 2026-11-20): the
  // assessment is what "View details" promises; the promo is one click away.
  // …unless "View details" was clicked on This month, which carries over.
  data: () => ({ month: initialMonth(), celebrating: false }),
  computed: {
    act() { return this.model.activity; },
    // Non-null only when this view should celebrate: earned badge, Next month.
    celebrationKey() {
      return this.act && this.act.badge.earned && this.month === "next"
        ? "sxp-celebrated-" + this.act.tourId
        : null;
    },
    months() {
      return [
        { label: this.t("months.this"), value: "this" },
        { label: this.t("months.next"), value: "next" },
      ];
    },
    // English catalogue, with the Spanish overlay laid over each tag and
    // recommended action when the page is in Spanish.
    catalogue() {
      const base = this.model.catalogue || {};
      const es = this.model.catalogueEs || {};
      if (window.SXP_I18N.state.lang !== "es" || !es.tags) return base;
      const tags = {};
      Object.keys(base.tags || {}).forEach((k) => { tags[k] = { ...base.tags[k], ...(es.tags[k] || {}) }; });
      const recActions = {};
      Object.keys(base.recActions || {}).forEach((k) => {
        recActions[k] = { ...base.recActions[k], ...((es.recActions || {})[k] || {}) };
      });
      return { ...base, tags, recActions };
    },
    backHref() { return pageHref("index.html", this.state.entry ? this.state.entry.id : "", this.month); },
    // Round 1's banner said "keep working on it" even for a supplier-level
    // Trust & Safety ban that no work on this activity can lift. No round-2
    // activity fails T&S, so this is false everywhere today.
    tsExclusion() {
      return !!(this.act && this.act.sections.some(
        (s) => s.id === "operational" &&
               s.rows.some((r) => r.id === "trust-safety" && r.status === "not-met")
      ));
    },
  },
  watch: {
    celebrationKey: {
      immediate: true,
      handler(key) {
        if (!key || reducedMotion() || !firstTimeThisVisit(key)) return;
        this.celebrating = false;
        this.$nextTick(() => {
          this.celebrating = true;
          setTimeout(() => confettiRain(), 200);
          setTimeout(() => { this.celebrating = false; }, CELEBRATE_MS);
        });
      },
    },
  },
  methods: {
    // "Check your status" is the promo's way into the assessment — the same
    // destination as Next month, so it drives the toggle rather than going
    // anywhere of its own.
    checkStatus() {
      this.month = "next";
      this.$nextTick(() => {
        const el = this.$refs.months && this.$refs.months.$el;
        if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    },
  },
  template: `
    <AppShell :suppliers="state.suppliers" :entry="state.entry"
              :supplier-name="state.supplierName" @select="select" @lang="setLanguage">

      <a :href="backHref" class="back-link">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('act.back') }}
      </a>

      <h1 class="page-title">{{ act ? act.activityTitle : '\\u00a0' }}</h1>

      <!-- Performance overview and Competitor report are page chrome: they
           exist in the real portal but there is nothing behind them here, so
           they are inert (Melanie, 2026-11-20). Deliberately NOT the disabled
           prop — that greys them to 60% and would tell a supplier the tabs
           are unavailable to them, which is false. They keep their normal
           look and simply do not respond, like the sidebar icons on every
           page of this prototype. See .is-inert in round2.css.
           (No backticks in this comment: the template is a backtick string.) -->
      <Tabs value="excellence" class="sx-perf-tabs">
        <TabList>
          <Tab value="overview" class="is-inert" tabindex="-1" aria-disabled="true">{{ t('act.tab.overview') }}</Tab>
          <Tab value="excellence">{{ t('act.tab.excellence') }}</Tab>
          <Tab value="competitor" class="is-inert" tabindex="-1" aria-disabled="true">{{ t('act.tab.competitor') }}</Tab>
        </TabList>
      </Tabs>

      <h2 class="sx-h2 sx-h2--tight">{{ t('act.status') }}</h2>
      <SelectButton ref="months" v-model="month" :options="months" optionLabel="label"
                    optionValue="value" :allowEmpty="false" class="sx-months" />

      <p v-if="state.error" class="sx-lede">{{ state.error }}</p>

      <PromoPanel v-if="month === 'this'" @check="checkStatus" />

      <template v-else-if="act">
        <!-- display: contents, so the page column's 24px gap still spaces
             the banner and cards; the class only scopes the animations. -->
        <div class="sx-celebrate-scope" :class="{ 'sx-celebrate': celebrating }">
          <BadgeBanner :badge="act.badge" :ts-exclusion="tsExclusion" />
          <SectionCard v-for="(s, i) in act.sections" :key="s.id" :section="s"
                       :period="act.period.text" :catalogue="catalogue"
                       :style="{ '--card-i': i }" />
        </div>
      </template>
    </AppShell>
  `,
};

createSxpApp(App).mount("#app");

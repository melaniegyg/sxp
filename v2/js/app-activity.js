// ============================================================
// ACTIVITY PAGE — activity.html
// ============================================================
import { createSxpApp } from "./primevue-setup.js";
import { AppShell, SectionCard, BadgeBanner, ICONS } from "./components.js";
import { createSupplierState } from "./supplier-data.js";

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
  computed: { icons: () => ICONS },
  data: () => ({
    months: ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    current: "DEC",
    criteria: [
      ["compass-badge", "Review count", "At least 50 reviews"],
      ["compass-eye", "Operational standards", "24-hour cancellation policy & trust and safety check"],
      // Matches the overview's Quality standards card — see app-overview.js.
      ["magnifier-bar-chart", "Quality standards", "Rating and complaint rate"],
    ],
    benefits: [
      ["compass-badge", "Get booked with confidence",
       "The badge puts your commitment to quality front and center for travelers"],
      ["compass-magnifier", "Be seen by more customers",
       "Show up higher in search results and get featured in more emails to travelers"],
      ["compass-eye", "Become the easy choice",
       "When listings look alike, this badge is what sets you apart from competitors"],
    ],
  }),
  template: `
    <Card class="sx-promo">
      <template #content>
        <div class="sx-promo__head">
          <div>
            <h3 class="sx-promo__title">Get rewarded for your excellence!</h3>
            <p class="sx-promo__desc">
              Your activity is being evaluated on the last 6 months of performance data
              (Jul 1 – Dec 31). Badges are awarded Jan 1, then reassessed every month after that.
            </p>
          </div>
          <!-- Default slot, not label + #icon: with a custom icon slot
               PrimeVue ignores iconPos and puts the arrow before the text.
               The arrow is inline SVG so it inherits the button's white — the
               exported file is #0071EB and vanished against the blue fill. -->
          <Button class="sx-promo__cta" rounded @click="$emit('check')">
            <span class="p-button-label">Check your status</span>
            <span class="sx-btn-icon" v-html="icons.arrowRight"></span>
          </Button>
        </div>

        <div class="sx-timeline">
          <div class="sx-timeline__months">
            <div v-for="m in months" :key="m" class="sx-tm" :class="{ 'is-current': m === current }">
              <span class="sx-tm__label">{{ m }}</span>
              <span class="sx-tm__bar"></span>
              <span v-if="m === current" class="sx-tm__today">{{ m }} 1</span>
            </div>
          </div>
          <div class="sx-timeline__award">
            <p class="sx-timeline__date">JAN 1</p>
            <p class="sx-timeline__note">Badges awarded</p>
          </div>
        </div>

        <h4 class="sx-promo__h">What your activity will be evaluated on</h4>
        <ul class="sx-promo__list">
          <li v-for="[icon, title, desc] in criteria" :key="title">
            <img :src="'assets/icons/' + icon + '.svg'" alt="" width="20" height="20">
            <span><strong>{{ title }}</strong><em>{{ desc }}</em></span>
            <Tag value="Tracking since Jul 1" severity="secondary" rounded />
          </li>
        </ul>

        <h4 class="sx-promo__h">Benefits</h4>
        <div class="sx-benefits">
          <Card v-for="[icon, title, desc] in benefits" :key="title" class="sx-benefit">
            <template #content>
              <img :src="'assets/icons/' + icon + '.svg'" alt="" width="24" height="24">
              <p class="sx-benefit__t">{{ title }}</p>
              <p class="sx-benefit__d">{{ desc }}</p>
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
const MONTHS = [
  { label: "This month", value: "this" },
  { label: "Next month", value: "next" },
];

const App = {
  components: { AppShell, SectionCard, BadgeBanner, PromoPanel },
  setup() {
    const model = reactive({ activity: null, catalogue: {} });

    // Awaited at render time, not assigned on arrival — the supplier fetch can
    // win the race and render an empty breakdown otherwise.
    fetch("data/defect-catalogue.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((c) => { model.catalogue = c; })
      .catch(() => {});

    const { state, init, select } = createSupplierState(reactive, (file, entry, tourId) => {
      // No activity switcher: the activity comes from the hash, which the
      // overview's "View details" link sets. Falls back to the first.
      const list = file.activities || [];
      const a = list.find((x) => x.tour_id === tourId) || list[0];
      if (!a) return;
      model.activity = window.SXP.build(a);
      document.title = model.activity.activityTitle + " — Excellence program";
    });
    init();
    return { state, model, select };
  },
  data: () => ({ month: "this", months: MONTHS }),
  computed: {
    act() { return this.model.activity; },
    backHref() { return "index.html#" + (this.state.entry ? this.state.entry.id : ""); },
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
              :supplier-name="state.supplierName" @select="select">

      <a :href="backHref" class="back-link">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
      </a>

      <h1 class="page-title">{{ act ? act.activityTitle : '\\u00a0' }}</h1>

      <Tabs value="excellence" class="sx-perf-tabs">
        <TabList>
          <Tab value="overview">Performance overview</Tab>
          <Tab value="excellence">Excellence program</Tab>
          <Tab value="competitor">Competitor report</Tab>
        </TabList>
      </Tabs>

      <h2 class="sx-h2 sx-h2--tight">Excellence program status</h2>
      <SelectButton ref="months" v-model="month" :options="months" optionLabel="label"
                    optionValue="value" :allowEmpty="false" class="sx-months" />

      <p v-if="state.error" class="sx-lede">{{ state.error }}</p>

      <PromoPanel v-if="month === 'this'" @check="checkStatus" />

      <template v-else-if="act">
        <BadgeBanner :badge="act.badge" :ts-exclusion="tsExclusion" />
        <SectionCard v-for="s in act.sections" :key="s.id" :section="s"
                     :period="act.period.text" :catalogue="model.catalogue" />
      </template>
    </AppShell>
  `,
};

createSxpApp(App).mount("#app");

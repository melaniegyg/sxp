// ============================================================
// OVERVIEW PAGE — index.html
// ============================================================
import { createSxpApp } from "./primevue-setup.js";
import { AppShell, StatusTag, ExclusionBanner, ICONS } from "./components.js";
import { createSupplierState, pageHref, initialMonth } from "./supplier-data.js";

const { reactive } = window.Vue;

// The three cards name the same three sections the criteria page shows and the
// same three chips the table uses. Names agree across all three as of
// 2423:105656 / 2423:106930.
// [icon, title key, description key] — copy is in js/i18n.js.
const CRITERIA = [
  ["star", "sec.review-count",
   // NOTE(copy): this node keeps "new"; 2423:106930 and 2241:42264 drop it.
   // Unresolved — see CLAUDE.md.
   "ov.crit.reviews.d"],
  ["shield-check", "sec.operational", "ov.crit.operational.d"],
  // magnifier-bar-chart, not compass-magnifier: it is the sidebar's
  // Performance icon, which is where this criterion's numbers come from.
  // Settled by Melanie 2026-11-20.
  //
  // It is drawn on a 16px grid where the two compass icons beside it are
  // 24px, which normally means mismatched weight. It happens not to here:
  // the compass ring is 2 units of 24 and these bars are 1.333 of 16, so at
  // the 20px both render at each comes to 1.667px. Re-check that if either
  // icon is re-exported at a different size.
  ["magnifier-bar-chart-ink", "sec.quality", "ov.crit.quality.d"],
];

const App = {
  components: { AppShell, StatusTag, ExclusionBanner },
  setup() {
    const model = reactive({ sup: null });
    const { state, init, select, setLanguage } = createSupplierState(reactive, (file) => {
      model.sup = window.SXP.buildSupplier(file);
      document.title = window.SXP_I18N.t("doc.title", { name: file.supplier_name });
    });
    init();
    return { state, model, select, setLanguage };
  },
  data: () => ({
    // THIS MONTH is the pre-launch state: no badge has been awarded yet, so
    // every row shows an em dash. NEXT MONTH shows the assessment that decides
    // the first awards. The page opens on NEXT MONTH (Melanie, 2026-11-20):
    // the assessment is what a supplier comes here for; the dashes are one
    // click away.
    month: initialMonth(),
    criteria: CRITERIA,
    filterStatus: null,
    filterProduct: null,
  }),
  computed: {
    icons: () => ICONS,
    preLaunch() { return this.month === "this"; },
    sup() { return this.model.sup; },
    months() {
      return [
        { label: this.t("months.this"), value: "this" },
        { label: this.t("months.next"), value: "next" },
      ];
    },
    tip() { return this.t("ineligible.tip"); },
    period() {
      // "Period checked: …", the same wording as the activity page's section
      // cards (Melanie, 2026-11-20) — was "Assessment period: …".
      return this.sup ? this.sup.period.text : "";
    },
    // Status options are only the ones this supplier actually has, so the menu
    // never offers a filter that returns nothing.
    statusOptions() {
      const out = [];
      (this.sup ? this.sup.eligible : []).forEach((r) => {
        if (r.chip && !out.some((s) => s.value === r.chip.id)) {
          out.push({ value: r.chip.id, label: r.chip.label });
        }
      });
      return out;
    },
    productOptions() {
      return (this.sup ? this.sup.eligible : []).map((r) => ({
        value: r.tourId, label: r.title,
      }));
    },
    // The filters narrow the eligible table only. Ineligible activities are a
    // separate section with reasons rather than statuses, so a badge-status
    // filter has nothing to say about them and they stay visible.
    rows() {
      return (this.sup ? this.sup.eligible : []).filter(
        (r) =>
          (!this.filterStatus || (r.chip && r.chip.id === this.filterStatus)) &&
          (!this.filterProduct || r.tourId === this.filterProduct)
      );
    },
  },
  watch: {
    // Pre-launch every row shows an em dash, so there is nothing to filter by.
    // The select is disabled then; clear any choice carried in from Next month
    // so the table is not silently filtered by an invisible control.
    preLaunch(v) { if (v) this.filterStatus = null; },
  },
  methods: {
    href(row) {
      return pageHref("activity.html", (this.state.entry ? this.state.entry.id : "") + "/" + row.tourId, this.month);
    },
  },
  template: `
    <AppShell :suppliers="state.suppliers" :entry="state.entry"
              :supplier-name="state.supplierName" @select="select" @lang="setLanguage">

      <!-- 2423:103415: the Excellence badge sits 8 above the title. -->
      <div class="sx-pagehead">
        <span class="sx-brandbadge">
          <span class="sx-brandbadge__icon" v-html="icons.compactBadge"></span>{{ t('ov.badge') }}
        </span>
        <h1 class="page-title">{{ t('ov.title') }}</h1>
      </div>
      <p class="sx-lede">{{ t('ov.lede') }}</p>

      <Card class="sx-crit">
        <template #content>
          <div class="sx-crit__head">
            <div>
              <h2 class="sx-crit__title">{{ t('ov.crit.title') }}</h2>
              <p class="sx-crit__sub">{{ t('ov.crit.sub') }}</p>
            </div>
            <!-- Label and icon go in the default slot rather than the label/
                 icon props: with a custom #icon slot PrimeVue ignores iconPos
                 and the arrow lands to the left of the text. The arrow is
                 inline SVG so it takes this button's navy from currentColor,
                 and the promo's white on its filled blue twin. -->
            <!-- Primary outlined: 2423:103426 gives border AND label as
                 #0071eb. Not the contrast severity, which is the navy pair.
                 (No backticks in here: the template is a backtick string.) -->
            <Button outlined rounded>
              <span class="p-button-label">{{ t('ov.learnMore') }}</span>
              <span class="sx-btn-icon" v-html="icons.arrowRight"></span>
            </Button>
          </div>
          <div class="sx-crit__cards">
            <Card v-for="[icon, title, desc] in criteria" :key="title" class="sx-crit__card">
              <template #content>
                <img :src="'assets/icons/' + icon + '.svg'" alt="" width="20" height="20">
                <div>
                  <p class="sx-crit__card-t">{{ t(title) }}</p>
                  <p class="sx-crit__card-d">{{ t(desc) }}</p>
                </div>
              </template>
            </Card>
          </div>
        </template>
      </Card>

      <p v-if="state.error" class="sx-lede">{{ state.error }}</p>

      <template v-if="sup">
        <!-- Supplier-level exclusion, 2241:42264. It sits above "Badge status"
             and the month toggle, so it shows on both tabs: the exclusion is
             a standing fact about the account, not an assessment result. -->
        <ExclusionBanner v-if="sup.exclusion" :exclusion="sup.exclusion" />
        <h2 class="sx-h2">{{ t('ov.badgeStatus') }}</h2>
        <SelectButton v-model="month" :options="months" optionLabel="label" optionValue="value"
                      :allowEmpty="false" class="sx-months" />

        <div class="sx-filters">
          <div class="sx-filters__controls">
            <label class="sx-select">
              <span class="sx-select__label">{{ t('ov.filter.status') }}</span>
              <Select v-model="filterStatus" :options="statusOptions" optionLabel="label"
                      optionValue="value" :placeholder="t('ov.filter.statusPh')" showClear
                      :disabled="preLaunch || !statusOptions.length" fluid />
            </label>
            <label class="sx-select">
              <span class="sx-select__label">{{ t('ov.filter.product') }}</span>
              <Select v-model="filterProduct" :options="productOptions" optionLabel="label"
                      optionValue="value" :placeholder="t('ov.filter.productPh')" showClear fluid />
            </label>
          </div>
          <!-- Next month only (Melanie, 2026-11-20). This month is the
               pre-launch state with nothing assessed, so a period there
               reads as if it had been. -->
          <p v-if="!preLaunch" class="sx-period">{{ period }}</p>
        </div>

        <DataTable v-if="rows.length" :value="rows" dataKey="tourId" class="sx-t">
          <Column field="title" :header="t('ov.col.product')" />
          <Column :header="t('ov.col.status')" style="width:220px">
            <template #body="{ data }"><StatusTag :chip="data.chip" :pre-launch="preLaunch" /></template>
          </Column>
          <Column style="width:180px" bodyClass="sx-t__act">
            <template #body="{ data }">
              <!-- Primary outlined, per 2423:103531 — #0071eb border and label. -->
              <Button :label="t('ov.viewDetails')" outlined rounded as="a" :href="href(data)" />
            </template>
          </Column>
        </DataTable>
        <p v-else class="sx-empty">{{ t('ov.empty') }}</p>

        <!-- Ineligible activities are a separate table with a Reason, not a
             status — they are never assessed, so they have no criteria to meet.
             No "View details" and so no third column: the link would open a
             criteria page with nothing on it. The reason is one generic
             sentence; the warehouse category names (Ticketed / Transfers /
             Trip Enhancers) are internal and never shown. Heading, reason and
             tooltip copy: Melanie, 2026-11-20. -->
        <template v-if="sup.ineligible.length">
          <h2 class="sx-h2 sx-h2--section">{{ t('ov.notInProgram') }}</h2>
          <DataTable :value="sup.ineligible" dataKey="tourId" class="sx-t">
            <Column field="title" :header="t('ov.col.product')" />
            <Column :header="t('ov.col.reason')" style="width:55%">
              <template #body="{ data }">
                <span class="sx-reason">
                  {{ data.reason }}
                  <!-- A button, not a bare icon, so the tooltip opens on
                       keyboard focus as well as hover. -->
                  <button type="button" class="sx-reason__info" :aria-label="t('ov.reasonAria')"
                          v-tooltip.bottom="{ value: tip, class: 'sx-tip' }" v-html="icons.info"></button>
                </span>
              </template>
            </Column>
          </DataTable>
        </template>
      </template>
    </AppShell>
  `,
};

createSxpApp(App).mount("#app");

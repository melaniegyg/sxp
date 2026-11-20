// ============================================================
// PRIMEVUE SETUP — round 2
//
// Round 2 uses the Supplier Portal's actual component library rather than
// CSS that imitates it. There is still NO BUILD STEP: the three libraries in
// v2/vendor/ are browser builds loaded as plain <script> tags, and everything
// of ours is an ES module. Vue's *global* build is the one vendored, so it
// carries the template compiler and components can be written as plain
// template strings.
//
//   window.Vue                 vue 3.5.43        vendor/vue.global.prod.js
//   window.PrimeVue            primevue 4.3.9    vendor/primevue.min.js
//   window.PrimeUIX.Themes     @primeuix/themes  vendor/primeuix-lara.js
//
// VENDORED, NOT CDN. Round-1 links went to seven real suppliers and round 2
// will go the same way; a CDN stall would blank the page for someone we asked
// to look at it. The version is pinned by the file on disk.
//
// The theme is the portal's own preset, ported file-for-file into js/theme/.
// supply-frontend composes it the same way — definePreset(Lara, gygPreset) —
// so a Tag here is the Tag a supplier sees in the real portal.
// ============================================================
import gygPreset from "./theme/index.js";

const { createApp } = window.Vue;
const PV = window.PrimeVue;

export const SxpPreset = PV.definePreset(window.PrimeUIX.Themes.Lara, gygPreset);

// Components used anywhere in round 2. Registered globally because both pages
// draw from the same set and neither is big enough to want per-page imports.
// The month toggle is a SelectButton, not Tabs: 1970:173336 draws a segmented
// pill on a grey track, which is SelectButton's form. Tabs/TabList/Tab are the
// underlined bar, which is what the page-level Performance tabs are.
const COMPONENTS = [
  "Accordion", "AccordionPanel", "AccordionHeader", "AccordionContent",
  "Button", "Card", "Column", "DataTable", "Menu", "Message",
  "Select", "SelectButton", "Tab", "TabList", "Tabs", "Tag",
];

export function createSxpApp(rootComponent, props) {
  const app = createApp(rootComponent, props);

  app.use(PV.Config, {
    ripple: false,
    theme: {
      preset: SxpPreset,
      options: {
        // The prototype is light-only: tokens.css defines no dark palette, so
        // letting PrimeVue switch on the OS setting would half-darken the page.
        darkModeSelector: false,
        // PrimeVue's generated CSS goes in a cascade layer. Unlayered CSS beats
        // layered CSS whatever the specificity, so css/round2.css keeps winning
        // without !important or selector arms races.
        cssLayer: { name: "primevue", order: "theme, base, primevue" },
      },
    },
  });

  COMPONENTS.forEach((name) => {
    const c = PV[name];
    if (c) app.component(name, c);
    else console.warn("[sxp] PrimeVue has no component named " + name);
  });

  // v-tooltip — PrimeVue's Tooltip directive (the ineligible table's info
  // icon). The ported preset has no tooltip config, so its colours are
  // Lara's; css/round2.css restyles the one instance to the design.
  if (PV.Tooltip) app.directive("tooltip", PV.Tooltip);
  else console.warn("[sxp] PrimeVue has no Tooltip directive");

  return app;
}

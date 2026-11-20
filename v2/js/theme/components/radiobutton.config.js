// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/radiobutton.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    width: "1.25rem",
    height: "1.25rem",
    borderWidth: "1px",
    checkedBorderColor: "{primary.color}",
    checkedBackground: "{primary.contrast.color}",
    checkedHoverBackground: "{primary.contrast.color}",
  },
  icon: {
    size: "0.75rem",
    checkedColor: "{primary.color}",
    checkedHoverColor: "{primary.700}",
  },
};

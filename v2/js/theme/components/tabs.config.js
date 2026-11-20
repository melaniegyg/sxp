// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/tabs.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  tablist: {
    borderWidth: "0 0 2px 0",
    borderColor: "{surface.200}",
  },
  tab: {
    borderColor: "{surface.200}",
    borderWidth: "0 0 2px 0",
    color: "{surface.500}",
    fontWeight: "400",
    hoverBorderColor: "{surface.200}",
    hoverColor: "{primary.500}",
    margin: "0 0 -2px 0",
    padding: "1.25rem",
  },
  tabpanel: {
    padding: "0.875rem 0 1.125rem 0",
    color: "{surface.700}",
  },
  colorScheme: {
    light: {
      tab: {
        background: "{surface.0}",
        hoverBackground: "{surface.0}",
        activeBackground: "{surface.0}",
      },
    },
  },
};

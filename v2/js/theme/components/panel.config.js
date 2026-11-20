// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/panel.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    borderColor: "{surface.200}",
  },
  header: {
    borderColor: "{surface.200}",
    padding: "1.25rem",
  },
  footer: {
    padding: "0 1.125rem 1.125rem 1.125rem",
  },
  title: {
    fontWeight: "600",
  },
  content: {
    padding: "1.25rem",
  },
  colorScheme: {
    light: {
      root: {
        color: "{primary.700}",
      },
      header: {
        background: "{surface.100}",
        color: "{primary.700}",
      },
    },
  },
};

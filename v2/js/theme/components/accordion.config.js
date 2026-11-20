// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/accordion.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  header: {
    borderWidth: "1px 0 0",
    fontWeight: "600",
    padding: "1rem 1.125rem",
    hoverColor: "{surface.700}",
    activeColor: "{surface.700}",
    first: {
      borderWidth: "0",
    },
  },
  content: {
    borderWidth: "0",
    background: "{surface.0}",
    color: "{surface.700}",
    padding: "0 1.125rem 1.125rem",
  },
  colorScheme: {
    light: {
      header: {
        activeBackground: "{surface.0}",
        background: "{surface.0}",
        color: "{surface.500}",
        hoverBackground: "{surface.0}",
        activeHoverBackground: "{surface.0}",
      },
    },
  },
};

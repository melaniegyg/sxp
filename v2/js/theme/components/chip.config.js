// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/chip.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    paddingY: "0.25rem",
    paddingX: "0.75rem",
    gap: "0.5rem",
  },
  removeIcon: {
    focusRing: {
      color: "{surface.900}",
    },
  },
  colorScheme: {
    light: {
      root: {
        background: "{surface.100}",
        color: "{surface.800}",
      },
    },
  },
};

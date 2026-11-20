// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/fieldset.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    padding: "1.25rem",
  },
  legend: {
    padding: "1rem 1.25rem",
  },
  colorScheme: {
    light: {
      legend: {
        background: "{surface.100}",
      },
    },
  },
};

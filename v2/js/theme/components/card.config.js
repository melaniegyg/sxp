// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/card.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    border: {
      radius: "0.5rem",
    },
    shadow: "0 0 0 1px {GYG.border.primary}",
  },
  body: {
    gap: "0.5rem",
    padding: "1.25rem",
  },
  footer: {
    padding: "0",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  subtitle: {
    color: "{text.muted.color}",
  },
};

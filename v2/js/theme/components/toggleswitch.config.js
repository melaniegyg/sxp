// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/toggleswitch.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    width: "2.5rem",
    height: "1.5rem",
  },
  handle: {
    size: "1rem",
  },
  colorScheme: {
    light: {
      root: {
        background: "{surface.300}",
        hoverBackground: "{surface.400}",
        disabledBackground: "{surface.200}",
      },
    },
  },
};

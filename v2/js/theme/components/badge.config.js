// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/badge.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  colorScheme: {
    light: {
      primary: {
        background: "#dadee3",
        color: "#282e38",
      },
      secondary: {
        background: "{surface.500}",
        color: "{primary.contrast.color}",
      },
      success: {
        background: "{emerald.100}",
        color: "{green.900}",
      },
      info: {
        background: "{sky.200}",
        color: "{primary.800}",
      },
      warn: {
        background: "{yellow.200}",
        color: "{yellow.950}",
      },
      danger: {
        background: "{red.200}",
        color: "{red.900}",
      },
    },
  },
};

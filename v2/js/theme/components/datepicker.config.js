// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/datepicker.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  header: {
    borderColor: "{surface.200}",
    fontWeight: "500",
    padding: "0.25rem",
  },
  date: {
    padding: "0.25rem",
    width: "2rem",
    height: "2rem",
    hoverBackground: "{surface.100}",
  },
  buttonbar: {
    padding: "0.5rem 0 0 0",
  },
  timepicker: {
    padding: "0",
  },
  colorScheme: {
    light: {
      today: {
        background: "{surface.200}",
        color: "{primary.900}",
      },
    },
  },
};

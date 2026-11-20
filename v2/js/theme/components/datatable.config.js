// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/datatable.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  header: {
    borderColor: "{surface.200}",
    borderWidth: "0 0 1px 0",
    fontWeight: "600",
  },
  headerCell: {
    fontWeight: "600",
    borderColor: "{surface.200}",
  },
  row: {
    background: "{transparent}",
  },
  bodyCell: {
    padding: "0.75rem 1rem",
    background: "{transparent}",
  },
  footerCell: {
    padding: "0.75rem 1rem",
    fontWeight: "600",
    borderColor: "{surface.200}",
  },
  footer: {
    fontWeight: "600",
    borderColor: "{surface.200}",
    padding: "0.75rem 1rem",
  },
  colorScheme: {
    light: {
      header: {
        background: "{transparent}",
        color: "{surface.700}",
      },
      headerCell: {
        background: "{transparent}",
        color: "{surface.700}",
        hoverBackground: "{surface.100}",
      },
      footerCell: {
        background: "{transparent}",
        color: "{surface.700}",
      },
      footer: {
        background: "{transparent}",
        color: "{surface.700}",
      },
    },
  },
};

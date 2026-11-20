// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/togglebutton.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    background: "{surface.0}",
    checkedBackground: "{primary.500}",
    checkedColor: "{primary.contrast.color}",
    disabledBorderColor: "{form.field.disabled.border.color}",
    padding: ".5rem 1rem",
    focusRing: {
      offset: "2px",
    },
  },
  content: {
    checkedBackground: "{primary.200}",
  },
  colorScheme: {
    light: {
      root: {
        hoverBackground: "{surface.200}",
        hoverColor: "{surface.600}",
      },
    },
  },
};

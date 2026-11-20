// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/tag.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    fontSize: "0.875rem",
    fontWeight: "500",
    padding: "0.25rem 0.5rem",
    gap: "0.25rem",
    borderRadius: "{content.border.radius}",
    roundedBorderRadius: "{border.radius.xl}",
  },
  icon: {
    size: "1rem",
  },
  colorScheme: {
    light: {
      primary: {
        background: "{GYG.surface.highlight}",
        color: "{GYG.label.primary}",
      },
      secondary: {
        background: "{GYG.surface.secondary}",
        color: "{GYG.label.secondary}",
      },
      success: {
        background: "{GYG.surface.successWeak}",
        color: "{GYG.label.success}",
      },
      info: {
        background: "{sky.100}",
        color: "{sky.700}",
      },
      warn: {
        background: "{GYG.surface.warning}",
        color: "{GYG.label.warning}",
      },
      danger: {
        background: "{GYG.surface.criticalWeak}",
        color: "{GYG.label.critical}",
      },
      contrast: {
        background: "{GYG.label.primary}",
        color: "{surface.0}",
      },
    },
    dark: {
      primary: {
        background: "color-mix(in srgb, {primary.500}, transparent 84%)",
        color: "{primary.300}",
      },
      secondary: {
        background: "{surface.800}",
        color: "{surface.300}",
      },
      success: {
        background: "color-mix(in srgb, {green.500}, transparent 84%)",
        color: "{green.300}",
      },
      info: {
        background: "color-mix(in srgb, {sky.500}, transparent 84%)",
        color: "{sky.300}",
      },
      warn: {
        background: "color-mix(in srgb, {orange.500}, transparent 84%)",
        color: "{orange.300}",
      },
      danger: {
        background: "color-mix(in srgb, {red.500}, transparent 84%)",
        color: "{red.300}",
      },
      contrast: {
        background: "{surface.0}",
        color: "{surface.950}",
      },
    },
  },
};

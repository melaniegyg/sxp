// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/button.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    borderRadius: "9999px",
    iconOnlyWidth: "2.5rem",
    label: {
      fontWeight: "500",
    },
    padding: {
      y: "0.5rem",
    },
  },
  colorScheme: {
    light: {
      root: {
        primary: {
          focusRing: {
            width: "1px",
            style: "solid",
            color: "{primary.500}",
          },
        },
        secondary: {
          hoverBackground: "{surface.600}",
          hoverBorderColor: "{surface.600}",
          hoverColor: "{primary.contrast.color}",
          background: "{surface.500}",
          borderColor: "{surface.500}",
          color: "{primary.contrast.color}",
        },
        info: {
          background: "{blue.100}",
          borderColor: "transparent",
          color: "{primary.700}",
          hoverColor: "{primary.700}",
          hoverBackground: "{blue.200}",
          hoverBorderColor: "transparent",
        },
        success: {
          background: "{green.100}",
          borderColor: "transparent",
          color: "{green.700}",
          hoverColor: "{green.700}",
          hoverBackground: "{green.400}",
          hoverBorderColor: "transparent",
        },
        danger: {
          hoverBackground: "{red.800}",
        },
      },
      outlined: {
        primary: {
          hoverBackground: "rgba(0, 113, 235, .04)",
          background: "transparent",
          borderColor: "{primary.color}",
        },
        secondary: {
          hoverBackground: "rgba(99,104,122,.04)",
          background: "transparent",
          borderColor: "{surface.500}",
          color: "{surface.500}",
        },
        contrast: {
          hoverBackground: "rgba(26,43,73,.04)",
          background: "transparent",
          borderColor: "{primary.700}",
          color: "{primary.700}",
        },
        warn: {
          hoverBackground: "rgba(255,136,51,.04)",
          background: "transparent",
          borderColor: "{orange.500}",
          color: "{orange.500}",
        },
        danger: {
          hoverBackground: "rgba(220,53,69,.04)",
          borderColor: "{red.500}",
        },
      },
    },
  },
};

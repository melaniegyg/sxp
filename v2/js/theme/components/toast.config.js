// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/toast.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    width: "15rem",
    borderWidth: "1px",
  },
  icon: {
    size: "1.125rem",
  },
  content: {
    padding: "0.75rem",
  },
  closeButton: {
    width: "1.5rem",
    height: "1.5rem",
  },
  colorScheme: {
    light: {
      info: {
        borderColor: "transparent",
        background: "{blue.100}",
        color: "{primary.color}",
        shadow: "0 2px 12px 0 rgba(0, 0, 0, 0.1)",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      success: {
        borderColor: "transparent",
        background: "{green.100}",
        color: "{green.700}",
        shadow: "0 2px 12px 0 rgba(0, 0, 0, 0.1)",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      warn: {
        borderColor: "transparent",
        background: "{yellow.100}",
        color: "{yellow.700}",
        shadow: "0 2px 12px 0 rgba(0, 0, 0, 0.1)",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      error: {
        borderColor: "transparent",
        background: "{red.50}",
        color: "{red.500}",
        shadow: "0 2px 12px 0 rgba(0, 0, 0, 0.1)",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
    },
  },
};

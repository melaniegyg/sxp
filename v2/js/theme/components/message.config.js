// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/message.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    borderWidth: "0",
    borderRadius: "0.5rem",
  },
  content: {
    padding: "0.5rem 0.75rem",
  },
  text: {
    fontWeight: "400",
  },
  closeButton: {
    width: "1.75rem",
    height: "1.75rem",
  },
  colorScheme: {
    light: {
      info: {
        background: "{blue.100}",
        color: "{primary.color}",
        shadow: "none",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      success: {
        background: "{green.100}",
        color: "{green.700}",
        shadow: "none",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      warn: {
        background: "{yellow.100}",
        color: "{yellow.700}",
        shadow: "none",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      secondary: {
        background: "{surface.100}",
        color: "{surface.900}",
        shadow: "none",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
      error: {
        background: "{red.50}",
        color: "{red.500}",
        shadow: "none",
        closeButton: {
          hoverBackground: "hsla(0,0%,100%,.5)",
        },
      },
    },
  },
};

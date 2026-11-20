// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/index.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

import compassSemanticColors from "./colors/compass-semantic-colors.js";
import components from "./components/index.js";
import palette from "./primitives/palette.js";

export default {
  primitive: {
    ...palette,
  },
  semantic: {
    transitionDuration: "0.2s",
    disabledOpacity: "0.6",
    iconSize: "1rem",
    anchorGutter: "2px",
    primary: {
      "50": "#e1f0ff",
      "100": "rgba(0,113,235,.24)",
      "200": "#0072eb99",
      "500": "#0071eb",
      "600": "#304c84",
      "700": "#1a2b49",
      "800": "#1e335a",
    },
    focusRing: {
      width: "1px",
      style: "solid",
      color: "{primary.500}",
      offset: "-1px",
      shadow: "0 0 0 2px #ffffff, 0 0 0 4px $ring-color, 0 1px 2px 0 rgba(0, 0, 0, 1.0)",
    },
    formField: {
      paddingX: "0.75rem",
      paddingY: "0.5rem",
      borderRadius: "8px",
      borderColor: "{surface.300}",
      focusRing: {
        width: "{focus.ring.width}",
        style: "{focus.ring.style}",
        color: "{focus.ring.color}",
        offset: "{focus.ring.offset}",
        shadow: "{focus.ring.shadow}",
      },
      transitionDuration: "{transition.duration}",
    },
    list: {
      padding: "0.25rem",
      gap: "0",
      header: {
        padding: "0.5rem 1rem 0 1rem",
        borderWidth: "0",
      },
      option: {
        padding: "0.5rem 0.75rem",
        borderRadius: "4px",
        borderWidth: "0",
        margin: "2px 0",
      },
      optionGroup: {
        borderWidth: "1px",
        borderColor: "{surface.300}",
        padding: "0.25rem 0.25rem",
        fontWeight: "600",
      },
    },
    content: {
      borderRadius: "4px",
    },
    mask: {
      transitionDuration: "0.15s",
    },
    navigation: {
      list: {
        padding: "0.5rem 0",
        gap: "0",
      },
      item: {
        padding: "0.625rem 1rem",
        borderRadius: "8px",
        gap: "0.5rem",
        icon: {
          color: "{surface.400}",
          hoverColor: "{surface.700}",
        },
        hover: {
          background: "{surface.100}",
        },
        focus: {
          background: "{surface.200}",
        },
      },
      submenuLabel: {
        padding: "0.5rem 0.75rem",
        fontWeight: "600",
        color: "{surface.400}",
      },
      submenuIcon: {
        size: "0.875rem",
      },
    },
    overlay: {
      select: {
        borderRadius: "4px",
        shadow: "0 2px 12px 0 rgba(0, 0, 0, 0.1)",
      },
      popover: {
        borderRadius: "6px",
        padding: "8px",
      },
      modal: {
        borderRadius: "4px",
        padding: "1.5rem",
        shadow: "0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)",
      },
      navigation: {
        shadow: "0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -2px rgba(0, 0, 0, .1)",
      },
    },
    colorScheme: {
      light: {
        surface: {
          "0": "#fff",
          "50": "#fff",
          "100": "#ebeef1",
          "200": "#dcdfe4",
          "300": "#dcdfe4",
          "400": "#a0a8b6",
          "500": "#63687a",
          "600": "#494d58",
          "700": "#494d58",
          "800": "#1e2c48",
          "900": "#191b20",
          "950": "#000",
        },
        primary: {
          color: "{primary.500}",
          contrastColor: "{neutral.50}",
          hoverColor: "{primary.600}",
          activeColor: "{primary.700}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.500}",
          focusColor: "{primary.500}",
        },
        focusRing: {
          shadow: "none",
        },
        mask: {
          color: "{surface.700}",
        },
        formField: {
          background: "{surface.0}",
          disabledBackground: "{surface.0}",
          disabledBorderColor: "{surface.200}",
          filledBackground: "{surface.50}",
          filledFocusBackground: "{surface.0}",
          borderColor: "{surface.300}",
          hoverBorderColor: "{surface.400}",
          focusBorderColor: "{surface.400}",
          invalidBorderColor: "{red.600}",
          color: "{surface.700}",
          placeholderColor: "{surface.500}",
          floatLabelColor: "{surface.500}",
          floatLabelFocusColor: "{surface.500}",
          floatLabelInvalidColor: "{red.600}",
          iconColor: "{surface.400}",
          shadow: "none",
        },
        text: {
          color: "{surface.700}",
          hoverColor: "{surface.800}",
          trgftedColor: "{surface.500}",
          hoverMutedColor: "{surface.600}",
        },
        content: {
          background: "{surface.0}",
          hoverBackground: "{surface.100}",
          borderColor: "{surface.200}",
          color: "{primary.700}",
          hoverColor: "{text.hover.color}",
        },
        overlay: {
          select: {
            background: "{surface.0}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
          popover: {
            background: "{surface.0}",
            borderColor: "transparent",
            color: "{primary.700}",
          },
          modal: {
            background: "{surface.0}",
            borderColor: "transparent",
            color: "{primary.700}",
          },
        },
        list: {
          header: {
            background: "{surface.0}",
            color: "{text.color}",
          },
          option: {
            background: "transparent",
            hoverBackground: "{surface.100}",
            hoverColor: "{surface.800}",
            focusBackground: "{surface.100}",
            selectedBackground: "{highlight.background}",
            selectedFocusBackground: "{highlight.focus.background}",
            color: "{text.color}",
            focusColor: "{primary.800}",
            selectedColor: "{highlight.color}",
            selectedFocusColor: "{highlight.focus.color}",
            icon: {
              color: "{surface.400}",
              focusColor: "{surface.500}",
            },
          },
          optionGroup: {
            background: "{surface.0}",
            color: "{text.color}",
          },
        },
        navigation: {
          item: {
            focusBackground: "{surface.100}",
            activeBackground: "{surface.100}",
            color: "{text.color}",
            focusColor: "{text.hover.color}",
            activeColor: "{text.hover.color}",
            icon: {
              color: "{surface.400}",
              focusColor: "{surface.500}",
              activeColor: "{surface.500}",
            },
          },
          submenuLabel: {
            background: "transparent",
            color: "{text.color}",
          },
          submenuIcon: {
            color: "{surface.400}",
            focusColor: "{surface.500}",
            activeColor: "{surface.500}",
          },
        },
      },
    },
  },
  components,
  extend: {
    GYG: {
      ...compassSemanticColors,
    },
  },
  css: ({ dt }) => `
    div.p-multiselect.p-disabled {
      opacity: ${dt("disabled.opacity")};
    }
    button.p-togglebutton:disabled {
      opacity: ${dt("disabled.opacity")};
    }
    .p-togglebutton:disabled.p-togglebutton-checked {
      color: ${dt("primary.contrast.color")};
      background: ${dt("primary.500")};
    }
    button.p-togglebutton::before {
      display: none;
    }
    /* Apply disabled styling to labels associated with disabled radio buttons */
    .p-radiobutton.p-disabled + label,
    label:has(+ .p-radiobutton.p-disabled) {
      opacity: ${dt("disabled.opacity")};
      cursor: not-allowed;
    }

    /* Apply disabled styling to labels associated with disabled checkboxes */
    .p-checkbox.p-disabled + label,
    label:has(+ .p-checkbox.p-disabled) {
      opacity: ${dt("disabled.opacity")};
      cursor: not-allowed;
    }
  `,
};

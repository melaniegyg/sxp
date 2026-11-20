// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/rating.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

import compassSemanticColors from "../colors/compass-semantic-colors.js";

// StarRatingInput (the only Rating consumer; direct imports are lint-restricted) draws its own
// Tailwind focus ring. Chrome also got Lara's ring via .p-focus-visible, doubling it.
// Icon colors match StarRating (text-label-primary / text-label-tertiary) so display and
// interactive stars look the same.
export default {
  root: {
    focusRing: {
      width: "0",
      style: "none",
      color: "transparent",
      offset: "0",
      shadow: "none",
    },
  },
  icon: {
    size: "1rem",
    color: compassSemanticColors.label.tertiary,
    activeColor: compassSemanticColors.label.primary,
    hoverColor: compassSemanticColors.label.primary,
  },
};

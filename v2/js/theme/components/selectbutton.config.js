// Ported verbatim from getyourguide/supply-frontend
//   apps/supplier-portal-nuxt/config/primevue-theme/components/selectbutton.config.ts
// TypeScript stripped, import paths given .js extensions. Nothing else
// changed: this is the portal's real PrimeVue preset, not an imitation.
// Re-port from source rather than editing by hand.

export default {
  root: {
    borderRadius: "8px",
  },
  css: ({ dt }) => `
    .p-selectbutton {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      border: 0;
      border-radius: 8px;
      background: ${dt("surface.100")};
    }
    .p-selectbutton .p-togglebutton {
      border: 0;
      border-radius: 6px;
      padding: 8px 12px;
      background: transparent;
      color: ${dt("surface.500")};
      font-size: 1rem;
      line-height: 1.375rem;
      font-weight: 500;
    }
    .p-selectbutton .p-togglebutton .p-togglebutton-content {
      background: transparent;
    }
    .p-selectbutton .p-togglebutton:not(.p-togglebutton-checked):hover {
      background: transparent;
      color: ${dt("surface.700")};
    }
    .p-selectbutton .p-togglebutton.p-togglebutton-checked {
      background: ${dt("surface.0")};
      color: ${dt("primary.500")};
    }
    .p-selectbutton .p-togglebutton.p-togglebutton-checked .p-togglebutton-content {
      background: transparent;
    }
  `,
};

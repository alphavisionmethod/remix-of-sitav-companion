// ════════════════════════════════════════════════════════════
// Business OS — Module Barrel
// ════════════════════════════════════════════════════════════
// Phase 1 scaffold: re-exports the canonical surfaces & wires the
// pillar so future code can `import from "@/modules/business"`
// without coupling to current file locations.

export const BUSINESS_PILLAR = {
  id: "business",
  label: "Business OS",
  routePrefix: "/business",
  description: "CRM · Sales · Quotes · Lead Recovery · Ads · Support · Operations",
} as const;

export type BusinessPillar = typeof BUSINESS_PILLAR;
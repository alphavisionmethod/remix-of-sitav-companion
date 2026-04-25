// ════════════════════════════════════════════════════════════
// Business OS — Module Barrel (Phase 2)
// ════════════════════════════════════════════════════════════
// Pillar identity + typed capability registry that drives nav,
// launcher ordering, and the architecture validator.

import type { PillarCapability, PillarManifest } from "@/modules/_shared/pillar-contract";

export const BUSINESS_CAPABILITIES: readonly PillarCapability[] = [
  { id: "crm", label: "CRM", route: "/business/crm", maturity: "active", trustTier: "high" },
  { id: "lead-recovery", label: "Lead Recovery", route: "/business/lead-recovery", maturity: "active", trustTier: "high" },
  { id: "revenue-autopilot", label: "Revenue Autopilot", route: "/business/revenue-autopilot", maturity: "active", trustTier: "critical" },
  { id: "quotes", label: "Quotes", route: "/business/quotes", maturity: "active", trustTier: "high" },
  { id: "deal-room", label: "Deal Room", route: "/business/deal-room", maturity: "active", trustTier: "high" },
  { id: "support", label: "Customer Support", route: "/business/support", maturity: "active", trustTier: "medium" },
  { id: "operations", label: "Operations", route: "/business/operations", maturity: "active", trustTier: "medium" },
  { id: "website-builder", label: "Website Builder", route: "/business/website-builder", maturity: "active", trustTier: "medium" },
  { id: "ecommerce", label: "Ecommerce", route: "/business/ecommerce", maturity: "active", trustTier: "high" },
  { id: "ads", label: "Advertising", route: "/business/ads", maturity: "planned", trustTier: "high" },
] as const;

export const BUSINESS_PILLAR = {
  id: "business",
  label: "Business OS",
  routePrefix: "/business",
  description: "CRM · Sales · Quotes · Lead Recovery · Ads · Support · Operations",
  launcherPriority: 1,
  capabilities: BUSINESS_CAPABILITIES,
} as const satisfies PillarManifest;

export type BusinessPillar = typeof BUSINESS_PILLAR;
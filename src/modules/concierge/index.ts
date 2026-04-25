// ════════════════════════════════════════════════════════════
// Concierge OS — Module Barrel (Phase 2)
// ════════════════════════════════════════════════════════════

import type { PillarCapability, PillarManifest } from "@/contracts";

export const CONCIERGE_CAPABILITIES: readonly PillarCapability[] = [
  { id: "travel", label: "Travel", route: "/concierge/travel", maturity: "active", trustTier: "high" },
  { id: "reservations", label: "Reservations", route: "/concierge/reservations", maturity: "active", trustTier: "high" },
  { id: "household", label: "Household", route: "/concierge/household", maturity: "active", trustTier: "medium" },
  { id: "life-admin", label: "Life Admin", route: "/concierge/life-admin", maturity: "active", trustTier: "medium" },
  { id: "scheduling", label: "Scheduling", route: "/concierge/scheduling", maturity: "active", trustTier: "medium" },
  { id: "reminders", label: "Reminders", route: "/concierge/reminders", maturity: "active", trustTier: "low" },
  { id: "events", label: "Events & Day Plan", route: "/concierge/events", maturity: "active", trustTier: "medium" },
  { id: "relationships", label: "Relationships", route: "/concierge/relationships", maturity: "partial", trustTier: "medium" },
] as const;

export const CONCIERGE_PILLAR = {
  id: "concierge",
  label: "Concierge OS",
  routePrefix: "/concierge",
  description: "Travel · Bookings · Household · Life Admin · Errands · Reservations",
  launcherPriority: 2,
  capabilities: CONCIERGE_CAPABILITIES,
} as const satisfies PillarManifest;

export type ConciergePillar = typeof CONCIERGE_PILLAR;
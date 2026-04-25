// ════════════════════════════════════════════════════════════
// Concierge OS — Module Barrel
// ════════════════════════════════════════════════════════════

export const CONCIERGE_PILLAR = {
  id: "concierge",
  label: "Concierge OS",
  routePrefix: "/concierge",
  description: "Travel · Bookings · Household · Life Admin · Errands · Reservations",
} as const;

export type ConciergePillar = typeof CONCIERGE_PILLAR;
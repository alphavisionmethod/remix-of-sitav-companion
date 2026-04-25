// ════════════════════════════════════════════════════════════
// Health OS — Module Barrel (GREENFIELD)
// ════════════════════════════════════════════════════════════

export const HEALTH_PILLAR = {
  id: "health",
  label: "Health OS",
  routePrefix: "/health",
  description: "Nutrition · Wearables · Medical · Fitness · Recovery · Health Planning",
  status: "greenfield",
} as const;

export type HealthPillar = typeof HEALTH_PILLAR;
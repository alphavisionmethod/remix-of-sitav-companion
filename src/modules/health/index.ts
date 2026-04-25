// ════════════════════════════════════════════════════════════
// Health OS — Module Barrel (GREENFIELD — Phase 2)
// ════════════════════════════════════════════════════════════
// Capabilities are scaffolded as stubs at /health/* and represent
// the planned surface — no business logic shipped yet.

import type { PillarCapability, PillarManifest } from "@/platform/contracts/pillar-contract";

export const HEALTH_CAPABILITIES: readonly PillarCapability[] = [
  { id: "nutrition", label: "Nutrition", route: "/health/nutrition", maturity: "stub", trustTier: "medium" },
  { id: "wearables", label: "Wearables", route: "/health/wearables", maturity: "stub", trustTier: "high" },
  { id: "medical", label: "Medical", route: "/health/medical", maturity: "stub", trustTier: "critical" },
  { id: "fitness", label: "Fitness", route: "/health/fitness", maturity: "stub", trustTier: "low" },
  { id: "recovery", label: "Recovery", route: "/health/recovery", maturity: "stub", trustTier: "low" },
  { id: "reminders", label: "Health Reminders", route: "/health/reminders", maturity: "stub", trustTier: "medium" },
] as const;

export const HEALTH_PILLAR = {
  id: "health",
  label: "Health OS",
  routePrefix: "/health",
  description: "Nutrition · Wearables · Medical · Fitness · Recovery · Health Planning",
  launcherPriority: 4,
  status: "greenfield",
  capabilities: HEALTH_CAPABILITIES,
} as const satisfies PillarManifest;

export type HealthPillar = typeof HEALTH_PILLAR;
// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Classification Registry
// Route-level reality classification entries
// ═══════════════════════════════════════════════════════════════

import type { ProductRealityTier } from "./product-reality-tiers";

export interface RealityClassificationEntry {
  /** Route path or feature key */
  routeKey: string;
  /** Human-readable name */
  name: string;
  /** Current reality tier */
  tier: ProductRealityTier;
  /** Percentage of the feature that uses real data (0-100) */
  realDataPercent: number;
  /** Whether AI outputs in this route are grounded */
  aiGrounded: boolean;
  /** Whether the route has real integrations */
  hasRealIntegrations: boolean;
  /** Last audit date */
  lastAuditedAt: string;
  /** Notes */
  notes?: string;
}

export const REALITY_CLASSIFICATIONS: RealityClassificationEntry[] = [
  // ── T1 ──
  { routeKey: "/auth", name: "Authentication", tier: "T1", realDataPercent: 100, aiGrounded: true, hasRealIntegrations: true, lastAuditedAt: "2026-04-15" },
  { routeKey: "/settings", name: "Settings", tier: "T1", realDataPercent: 100, aiGrounded: true, hasRealIntegrations: true, lastAuditedAt: "2026-04-15" },
  { routeKey: "/admin", name: "Admin Dashboard", tier: "T1", realDataPercent: 95, aiGrounded: true, hasRealIntegrations: true, lastAuditedAt: "2026-04-15" },

  // ── T2 ──
  { routeKey: "/business", name: "Business OS", tier: "T2", realDataPercent: 70, aiGrounded: true, hasRealIntegrations: true, lastAuditedAt: "2026-04-15", notes: "CRM and client data real, some connector data pending" },
  { routeKey: "/finance", name: "Finance OS", tier: "T2", realDataPercent: 65, aiGrounded: true, hasRealIntegrations: true, lastAuditedAt: "2026-04-15", notes: "Core accounting real, projections AI-assisted" },
  { routeKey: "/concierge", name: "Concierge OS", tier: "T2", realDataPercent: 60, aiGrounded: true, hasRealIntegrations: true, lastAuditedAt: "2026-04-15" },

  // ── T3 ──
  { routeKey: "/boardroom", name: "Boardroom", tier: "T3", realDataPercent: 30, aiGrounded: false, hasRealIntegrations: false, lastAuditedAt: "2026-04-15", notes: "Scenario-grounded decisions" },
  { routeKey: "/mission-control", name: "Mission Control", tier: "T3", realDataPercent: 25, aiGrounded: false, hasRealIntegrations: false, lastAuditedAt: "2026-04-15" },
  { routeKey: "/advisor", name: "Advisor Board", tier: "T3", realDataPercent: 40, aiGrounded: true, hasRealIntegrations: false, lastAuditedAt: "2026-04-15" },

  // ── T4 ──
  { routeKey: "/mobile", name: "Mobile Preview", tier: "T4", realDataPercent: 0, aiGrounded: false, hasRealIntegrations: false, lastAuditedAt: "2026-04-15", notes: "Visual preview only" },
  { routeKey: "/desktop-preview", name: "Desktop Preview", tier: "T4", realDataPercent: 0, aiGrounded: false, hasRealIntegrations: false, lastAuditedAt: "2026-04-15" },
];

export function getRouteClassification(routeKey: string): RealityClassificationEntry | undefined {
  return REALITY_CLASSIFICATIONS.find((r) => r.routeKey === routeKey);
}

export function getRoutesByTier(tier: ProductRealityTier): RealityClassificationEntry[] {
  return REALITY_CLASSIFICATIONS.filter((r) => r.tier === tier);
}

export function getOverallRealityScore(): number {
  if (REALITY_CLASSIFICATIONS.length === 0) return 0;
  const total = REALITY_CLASSIFICATIONS.reduce((sum, r) => sum + r.realDataPercent, 0);
  return Math.round(total / REALITY_CLASSIFICATIONS.length);
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Home Admin Service
// ═══════════════════════════════════════════════════════════════

import type { PersonalAdminTracker } from "@/packages/concierge-contracts";

export function getExpiringItems(trackers: PersonalAdminTracker[], daysAhead: number = 30): PersonalAdminTracker[] {
  const cutoff = Date.now() + daysAhead * 86400000;
  return trackers.filter(t => t.expiresAt && new Date(t.expiresAt).getTime() <= cutoff && t.status !== "renewed")
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());
}

export function computeAdminLoad(trackers: PersonalAdminTracker[]): { active: number; expiringSoon: number; totalAnnualCost: number } {
  return {
    active: trackers.filter(t => t.status === "active").length,
    expiringSoon: trackers.filter(t => t.status === "expiring-soon").length,
    totalAnnualCost: trackers.reduce((s, t) => s + (t.cost || 0), 0),
  };
}


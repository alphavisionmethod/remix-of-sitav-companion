// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Trip Overview Service
// Domain types imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { TripSummary, TripDashboard } from "@/domains/concierge";

export type { TripDashboard };

export function buildTripDashboard(trips: TripSummary[]): TripDashboard {
  const now = Date.now();
  return {
    upcoming: trips.filter(t => new Date(t.startDate).getTime() > now),
    active: trips.filter(t => new Date(t.startDate).getTime() <= now && new Date(t.endDate).getTime() >= now),
    past: trips.filter(t => new Date(t.endDate).getTime() < now),
    totalBudgetCents: trips.reduce((s, t) => s + t.totalBudgetCents, 0),
    totalSpentCents: trips.reduce((s, t) => s + t.totalSpentCents, 0),
  };
}


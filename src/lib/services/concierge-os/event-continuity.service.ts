// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Event Continuity Service
//
// Lightweight derived event-tracking. Domain types imported from
// `@/domains/concierge` (canonical). The persistent richer
// `EventPlan` entity from `@/packages/concierge-contracts` is
// intentionally distinct from this derived continuity tracker.
//
// The legacy `EventPlan` alias here resolves to the canonical
// derived `EventContinuityPlan` for backwards compatibility.
// ═══════════════════════════════════════════════════════════════

import type { EventContinuityPlan } from "@/domains/concierge";

export type { EventContinuityPlan };
/** @deprecated Use `EventContinuityPlan` from `@/domains/concierge`. */
export type EventPlan = EventContinuityPlan;

export function buildEventPlan(name: string, date: string, tasks: string[]): EventContinuityPlan {
  return { id: `evt-${Date.now()}`, name, date, tasks: tasks.map(t => ({ task: t, done: false })), completionPct: 0 };
}

export function getMockEventPlans(): EventContinuityPlan[] {
  return [
    buildEventPlan("Birthday Party", new Date(Date.now() + 14 * 86400000).toISOString(), ["Book venue", "Order cake", "Send invitations", "Plan activities", "Buy decorations"]),
    buildEventPlan("Anniversary Dinner", new Date(Date.now() + 30 * 86400000).toISOString(), ["Make reservation", "Order flowers", "Arrange babysitter"]),
  ];
}


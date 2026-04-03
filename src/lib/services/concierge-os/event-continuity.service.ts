// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Event Continuity Service
// ═══════════════════════════════════════════════════════════════

export interface EventPlan { id: string; name: string; date: string; tasks: { task: string; done: boolean; assignedTo?: string }[]; completionPct: number; }

export function buildEventPlan(name: string, date: string, tasks: string[]): EventPlan {
  return { id: `evt-${Date.now()}`, name, date, tasks: tasks.map(t => ({ task: t, done: false })), completionPct: 0 };
}

export function getMockEventPlans(): EventPlan[] {
  return [
    buildEventPlan("Birthday Party", new Date(Date.now() + 14 * 86400000).toISOString(), ["Book venue", "Order cake", "Send invitations", "Plan activities", "Buy decorations"]),
    buildEventPlan("Anniversary Dinner", new Date(Date.now() + 30 * 86400000).toISOString(), ["Make reservation", "Order flowers", "Arrange babysitter"]),
  ];
}

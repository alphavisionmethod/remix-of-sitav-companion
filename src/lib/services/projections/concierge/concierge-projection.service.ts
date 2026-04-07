// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Projection Service
// Household load + upcoming tasks
// ═══════════════════════════════════════════════════════════════

export interface ConciergeProjection {
  timestamp: string;
  householdLoad: { totalTasks: number; overdue: number; dueToday: number; dueThisWeek: number };
  memberLoad: { memberId: string; name: string; taskCount: number; overloaded: boolean }[];
  upcomingEvents: { id: string; title: string; date: string; prepItemsRemaining: number }[];
  conflicts: number;
  recurringSuppliesDue: number;
}

export function generateConciergeProjection(): ConciergeProjection {
  return {
    timestamp: new Date().toISOString(),
    householdLoad: { totalTasks: 24, overdue: 2, dueToday: 5, dueThisWeek: 12 },
    memberLoad: [
      { memberId: "m-1", name: "Primary", taskCount: 10, overloaded: false },
      { memberId: "m-2", name: "Partner", taskCount: 8, overloaded: false },
      { memberId: "m-3", name: "Assistant", taskCount: 6, overloaded: false },
    ],
    upcomingEvents: [
      { id: "ev-1", title: "School Parent-Teacher Meeting", date: new Date(Date.now() + 86400000 * 2).toISOString(), prepItemsRemaining: 2 },
      { id: "ev-2", title: "Family Dinner", date: new Date(Date.now() + 86400000 * 5).toISOString(), prepItemsRemaining: 4 },
    ],
    conflicts: 1,
    recurringSuppliesDue: 3,
  };
}


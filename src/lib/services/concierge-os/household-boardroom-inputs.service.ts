// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Household Boardroom Inputs Service
// Domain type imported from `@/domains/concierge` (canonical).
// ═══════════════════════════════════════════════════════════════

import type { HouseholdBoardroomPacket } from "@/domains/concierge";

export type { HouseholdBoardroomPacket };

export function buildHouseholdBoardroomPacket(): HouseholdBoardroomPacket {
  return {
    activeTasks: 6, overdueTasks: 1, loadBalanceScore: 78,
    upcomingEvents: ["Soccer practice (Thu)", "Piano lesson (Fri)", "Birthday party (Sat)"],
    calendarConflicts: 1, schoolItems: 3,
    travelPrep: [{ tripName: "NYC Client Visit", readinessPct: 33 }],
    actionItems: [
      "Resolve Thursday calendar conflict",
      "Complete 3 overdue school items",
      "Advance NYC trip prep checklist",
    ],
    generatedAt: new Date().toISOString(),
  };
}


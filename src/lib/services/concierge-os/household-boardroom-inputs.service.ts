// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Household Boardroom Inputs Service
// ═══════════════════════════════════════════════════════════════

export interface HouseholdBoardroomPacket {
  activeTasks: number; overdueTasks: number; loadBalanceScore: number;
  upcomingEvents: string[]; calendarConflicts: number; schoolItems: number;
  travelPrep: { tripName: string; readinessPct: number }[];
  actionItems: string[];
  generatedAt: string;
}

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

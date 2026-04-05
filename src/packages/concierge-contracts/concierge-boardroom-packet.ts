// SITA OS — Concierge: Boardroom Packet
export interface ConciergeBoardroomPacket {
  generatedAt: string;
  period: string;
  householdHealth: { loadBalanceScore: number; overdueCount: number; completionRate: number };
  calendarDensity: { eventsThisWeek: number; conflictsDetected: number; freeHours: number };
  upcomingObligations: Array<{ title: string; dueDate: string; priority: string; memberId: string }>;
  travelStatus: { activeTrips: number; upcomingTrips: number; totalSpentCents: number };
  groceryStatus: { pendingItems: number; resupplyAlerts: number; estimatedMonthlyCostCents: number };
  schoolStatus: { upcomingEvents: number; unpaidFees: number; volunteerNeeded: number };
  recommendations: string[];
  emotionalLoadScore?: number;
}

// SITA OS — Concierge: Family Load Balance
export interface FamilyLoadBalance {
  generatedAt: string;
  memberLoads: MemberLoad[];
  fairnessScore: number;
  imbalanceAlerts: Array<{ memberId: string; severity: "info" | "warning" | "critical"; message: string }>;
  suggestedReassignments: Array<{ taskId: string; fromMember: string; toMember: string; reason: string }>;
  recommendations: string[];
}

export interface MemberLoad {
  memberId: string;
  name: string;
  role: string;
  activeTasks: number;
  completedThisWeek: number;
  hoursEstimated: number;
  hoursActual: number;
  capacityUtilization: number;
  status: "light" | "balanced" | "heavy" | "overloaded";
  topCategories: Array<{ category: string; count: number }>;
}

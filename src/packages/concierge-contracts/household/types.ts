export type HouseholdRole = "parent" | "child" | "guardian" | "caregiver" | "au-pair" | "other";

export interface HouseholdMember {
  id: string;
  firstName: string;
  lastName: string;
  role: HouseholdRole;
  birthDate?: string;
  email?: string;
  phone?: string;
  isMinor: boolean;
  schoolId?: string;
  medicalNotes?: string;
  dietaryRestrictions?: string[];
  emergencyContacts: { name: string; phone: string; relationship: string }[];
}

export interface HouseholdKpiSummary {
  totalMembers: number;
  activeTasks: number;
  overdueTaskCount: number;
  taskCompletionRate: number;
  loadBalanceScore: number; // 0-100
  upcomingObligations: number;
  weeklyBusyScore: number; // 0-100
  topContributor: string;
  memberLoadDistribution: { memberId: string; name: string; taskCount: number; hoursEstimated: number }[];
  generatedAt: string;
}

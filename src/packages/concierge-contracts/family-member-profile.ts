// SITA OS — Concierge: Family Member Profile
export interface FamilyMemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  role: "parent" | "child" | "guardian" | "caregiver" | "au-pair" | "other";
  birthDate?: string;
  avatarUrl?: string;
  isMinor: boolean;
  schoolId?: string;
  grade?: string;
  allergies: string[];
  dietaryRestrictions: string[];
  medicalNotes?: string;
  emergencyContacts: Array<{ name: string; phone: string; relationship: string }>;
  preferences: Record<string, string>;
  interests: string[];
  bedtime?: string;
  wakeTime?: string;
  transportMode?: string;
  createdAt: string;
  updatedAt: string;
}

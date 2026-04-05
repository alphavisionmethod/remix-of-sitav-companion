// SITA OS — Concierge: Availability Window
export interface AvailabilityWindow {
  id: string;
  memberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: "available" | "busy" | "tentative" | "blocked";
  recurring: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  source: "manual" | "calendar-sync" | "inferred";
  notes?: string;
}

export interface AvailabilityMatrix {
  memberId: string;
  weekOf: string;
  slots: Array<{ day: number; hour: number; status: "free" | "busy" | "tentative" }>;
  utilizationPercent: number;
}

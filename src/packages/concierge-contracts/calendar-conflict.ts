// SITA OS — Concierge: Calendar Conflict
export interface CalendarConflict {
  id: string;
  eventAId: string;
  eventBId: string;
  memberIds: string[];
  type: "time-overlap" | "location-impossible" | "resource-conflict" | "member-double-booked" | "prep-overlap";
  severity: "hard" | "soft";
  overlapMinutes: number;
  suggestedResolution: string;
  autoResolvable: boolean;
  resolvedAt?: string;
  resolution?: string;
  resolvedBy?: string;
  detectedAt: string;
}

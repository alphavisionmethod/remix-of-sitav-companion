// SITA OS — Concierge: Travel Disruption
export interface TravelDisruption {
  id: string;
  tripId: string;
  reservationId?: string;
  type: "flight-delay" | "flight-cancel" | "hotel-overbook" | "weather" | "strike" | "visa-issue" | "health-advisory" | "other";
  severity: "minor" | "moderate" | "major" | "critical";
  title: string;
  description: string;
  detectedAt: string;
  impactedMembers: string[];
  suggestedActions: Array<{ action: string; costDelta: number; timeDelta: number; recommended: boolean }>;
  autoResolvable: boolean;
  resolvedAt?: string;
  resolution?: string;
  insuranceClaimable: boolean;
  status: "detected" | "assessing" | "action-needed" | "resolving" | "resolved";
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Capacity Monetization Signal
// ═══════════════════════════════════════════════════════════════

export interface CapacityMonetizationSignal {
  id: string;
  resourceType: "staff" | "equipment" | "space" | "inventory" | "bandwidth";
  currentUtilization: number;
  maxCapacity: number;
  monetizationPotentialCents: number;
  suggestedAction: string;
  urgency: "immediate" | "this-week" | "this-month" | "planning";
  confidence: number;
  detectedAt: string;
  expiresAt?: string;
}

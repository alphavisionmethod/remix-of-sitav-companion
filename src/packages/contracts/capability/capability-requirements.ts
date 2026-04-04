// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Contracts: Capability Requirements
// Preconditions and environment requirements for capability usage
// ═══════════════════════════════════════════════════════════════

export interface CapabilityRequirement {
  type: "connector" | "permission" | "trust-score" | "policy" | "environment" | "data";
  key: string;
  description: string;
  required: boolean;
  currentlyMet: boolean;
  resolution?: string;
}

export interface CapabilityRequirements {
  capabilityId: string;
  requirements: CapabilityRequirement[];
  allMet: boolean;
  blockers: string[];
  warnings: string[];
}

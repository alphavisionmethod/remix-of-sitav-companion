// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Contracts: Autonomy Tier
// Defines autonomy tiers for capability delegation
// ═══════════════════════════════════════════════════════════════

export type AutonomyTier = "manual" | "assisted" | "supervised" | "autonomous" | "full-autonomy";

export interface CapabilityAutonomyTier {
  capabilityId: string;
  currentTier: AutonomyTier;
  maxAllowedTier: AutonomyTier;
  trustScoreRequired: number;
  successfulExecutions: number;
  executionsForPromotion: number;
  lastPromotedAt?: string;
  lastDemotedAt?: string;
  promotionBlockers: string[];
}

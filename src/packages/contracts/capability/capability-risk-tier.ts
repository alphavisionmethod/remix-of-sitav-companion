// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Contracts: Risk Tier
// Defines risk classification for capabilities
// ═══════════════════════════════════════════════════════════════

import type { RiskTier, DomainId } from "../_contract-scaffold";

export interface CapabilityRiskTier {
  capabilityId: string;
  riskTier: RiskTier;
  domain: DomainId;
  financialImpactCeiling: number;
  reversible: boolean;
  requiresSimulation: boolean;
  requiresDualApproval: boolean;
  cooldownMinutes: number;
  rateLimitPerHour: number;
  escalationPolicy: string;
}

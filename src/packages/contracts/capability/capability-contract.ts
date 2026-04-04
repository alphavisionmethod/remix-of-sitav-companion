// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Contracts: Capability Contract
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "../_contract-scaffold";

export interface CapabilityContract {
  capabilityId: string;
  domain: DomainId;
  family: string;
  riskTier: RiskTier;
  requiresApproval: boolean;
  requiredConnectors: string[];
  requiredPermissions: string[];
}

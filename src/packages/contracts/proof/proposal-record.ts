// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Proposal Record
// Formal proposed action/recommendation record
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "../_contract-scaffold";

export type ProposalStatus = "draft" | "submitted" | "under-review" | "approved" | "rejected" | "expired" | "withdrawn";

export interface ProposalRecord {
  id: string;
  advisorId: string;
  domain: DomainId;
  title: string;
  description: string;
  riskTier: RiskTier;
  estimatedImpact: {
    valueCents?: number;
    riskReduction?: number;
    efficiencyGain?: number;
  };
  requiredApprovals: number;
  status: ProposalStatus;
  linkedExecutionPlanId?: string;
  linkedSimulationId?: string;
  evidence: string[];
  createdAt: string;
  expiresAt?: string;
}

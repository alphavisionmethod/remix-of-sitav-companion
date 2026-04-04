// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Contracts: Autonomy Envelope
// Delegation constraints and autonomy boundaries
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "../_contract-scaffold";
import type { AutonomyTier } from "../capability/capability-autonomy-tier";

export interface AutonomyEnvelope {
  id: string;
  entityId: string;
  entityType: "advisor" | "workflow" | "capability" | "delegate";
  domain: DomainId;
  currentAutonomy: AutonomyTier;
  maxAutonomy: AutonomyTier;
  constraints: AutonomyConstraint[];
  riskCeiling: RiskTier;
  financialCeiling: number;
  requiresReportingAfter: boolean;
  escalationTriggers: string[];
  validFrom: string;
  validUntil?: string;
  grantedBy: string;
}

export interface AutonomyConstraint {
  type: "financial" | "time" | "scope" | "rate" | "approval";
  description: string;
  limit: number | string;
  currentUsage?: number | string;
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust State Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, TenantScoped, TrustFlag, CorrelationContext } from "../_contract-scaffold";

// Re-use TrustDimension from meta-governance and TrustPosture from os-unified
// to avoid duplicate exports. Define local service-specific variants here.

export type TrustStateDimension = "behavioral" | "credential" | "device" | "transactional" | "compliance" | "temporal";

export type TrustStatePosture = "hardened" | "normal" | "elevated-risk" | "lockdown";

export interface TrustStateEvent extends BaseContract, TenantScoped {
  entityId: string;
  entityType: "user" | "advisor" | "agent" | "connector" | "workflow" | "device";
  dimension: TrustStateDimension;
  previousScore: number;
  newScore: number;
  delta: number;
  flags: TrustFlag[];
  reason: string;
  source: string;
  correlation: CorrelationContext;
  posture: TrustStatePosture;
  metadata: Record<string, unknown>;
}

export interface TrustProfile extends BaseContract, TenantScoped {
  entityId: string;
  entityType: TrustStateEvent["entityType"];
  overallScore: number;
  dimensionScores: Record<TrustStateDimension, number>;
  posture: TrustStatePosture;
  activeFlags: TrustFlag[];
  lastEvaluated: string;
  verificationCount: number;
  status: "trusted" | "provisional" | "restricted" | "suspended";
}

export interface TrustRecoveryPlan {
  entityId: string;
  requiredActions: TrustRecoveryAction[];
  estimatedRecoveryScore: number;
  estimatedDuration: string;
}

export interface TrustRecoveryAction {
  id: string;
  type: "verify-identity" | "re-authenticate" | "review-policy" | "manual-approval" | "cool-down";
  label: string;
  completed: boolean;
  scoreImpact: number;
}

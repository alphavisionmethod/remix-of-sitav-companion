// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Evaluation Protocol
// claim → evidence → grade → decision → receipt
// ═══════════════════════════════════════════════════════════════

export type TrustGrade = "A" | "B" | "C" | "D" | "F" | "ungraded";

export type TrustDecisionOutcome = "trusted" | "conditional" | "denied" | "deferred";

export interface TrustClaim {
  claim_id: string;
  claimant_type: "user" | "device" | "agent" | "service" | "external";
  claimant_id: string;
  claim_type: "identity" | "capability" | "data_access" | "action_permission" | "delegation";
  scope: string[];
  context: Record<string, unknown>;
  requested_at: string;
}

export interface TrustEvidence {
  evidence_id: string;
  claim_id: string;
  source: string;
  source_type: "auth_token" | "biometric" | "device_attestation" | "behavioral" | "policy" | "external_api";
  confidence: number;
  freshness: "realtime" | "recent" | "stale" | "expired";
  content_hash?: string;
  collected_at: string;
}

export interface TrustGrading {
  claim_id: string;
  overall_grade: TrustGrade;
  evidence_scores: Array<{ evidence_id: string; score: number; weight: number }>;
  factors: {
    identity_confidence: number;
    device_trust: number;
    behavioral_consistency: number;
    policy_compliance: number;
    temporal_risk: number;
  };
  graded_at: string;
}

export interface TrustDecision {
  claim_id: string;
  outcome: TrustDecisionOutcome;
  grade: TrustGrade;
  conditions?: string[];
  expires_at?: string;
  rationale: string;
  decided_at: string;
}

export interface TrustReceipt {
  receipt_id: string;
  claim_id: string;
  decision: TrustDecisionOutcome;
  grade: TrustGrade;
  proof_hash: string;
  chain_position: number;
  created_at: string;
}

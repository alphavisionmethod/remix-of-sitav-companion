// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Proof Requirements (Phase 3)
//
// Declares the minimum proof bundle required to authorize an action
// in each (domain, riskClass) pair. Bound to the Unified Proof Layer.
// ═══════════════════════════════════════════════════════════════

import type { PolicyDomainKey } from "./policy-domain-map";

export type ProofComponent =
  | "actor-attestation"      // Signed proof of actor identity (auth.uid)
  | "device-trust"           // Device trust record at time of action
  | "policy-decision"        // Snapshot of unified-policy decision
  | "evidence-bundle"        // Underlying evidence (cite-checked)
  | "approval-receipt"       // Approval tier resolution
  | "boardroom-decision"     // Boardroom motion id
  | "biometric-step-up"      // Recent biometric proof
  | "kill-switch-snapshot"   // Active kill-switch state at execution
  | "rollback-pointer";      // Reference to compensating action

export type RiskClass = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export interface ProofRequirement {
  domain: PolicyDomainKey;
  riskClass: RiskClass;
  required: readonly ProofComponent[];
  minEvidenceGrade: "A" | "B" | "C" | "D" | "F" | "n/a";
  description: string;
}

export const PROOF_REQUIREMENTS: readonly ProofRequirement[] = [
  // Money — most stringent
  { domain: "money", riskClass: "R0", required: ["actor-attestation", "policy-decision"], minEvidenceGrade: "C", description: "Read-only finance views." },
  { domain: "money", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle"], minEvidenceGrade: "B", description: "Sub-threshold financial mutations." },
  { domain: "money", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle", "approval-receipt", "kill-switch-snapshot"], minEvidenceGrade: "A", description: "Above-threshold payments / transfers." },
  { domain: "money", riskClass: "R5", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle", "approval-receipt", "boardroom-decision", "biometric-step-up", "kill-switch-snapshot", "rollback-pointer"], minEvidenceGrade: "A", description: "Material capital movement." },

  // Boardroom
  { domain: "boardroom", riskClass: "R3", required: ["actor-attestation", "policy-decision", "evidence-bundle", "approval-receipt"], minEvidenceGrade: "B", description: "Boardroom motion vote." },
  { domain: "boardroom", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle", "approval-receipt", "boardroom-decision"], minEvidenceGrade: "A", description: "Binding boardroom decision." },

  // System / Kernel
  { domain: "system", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision"], minEvidenceGrade: "B", description: "Operator query / read." },
  { domain: "system", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "approval-receipt", "kill-switch-snapshot"], minEvidenceGrade: "A", description: "Operator mutation / kill switch." },
  { domain: "system", riskClass: "R5", required: ["actor-attestation", "device-trust", "policy-decision", "approval-receipt", "kill-switch-snapshot", "biometric-step-up", "rollback-pointer"], minEvidenceGrade: "A", description: "Destructive operator action." },

  // Admin
  { domain: "admin", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision"], minEvidenceGrade: "B", description: "Admin read." },
  { domain: "admin", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "approval-receipt"], minEvidenceGrade: "A", description: "Admin mutation." },

  // Integrations
  { domain: "integrations", riskClass: "R2", required: ["actor-attestation", "policy-decision"], minEvidenceGrade: "C", description: "Connector listing / inspection." },
  { domain: "integrations", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle"], minEvidenceGrade: "B", description: "Connect / disconnect a provider." },
  { domain: "integrations", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "approval-receipt", "kill-switch-snapshot"], minEvidenceGrade: "A", description: "Bulk sync / connector kill." },

  // Identity
  { domain: "identity", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision"], minEvidenceGrade: "B", description: "Profile mutation." },
  { domain: "identity", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "biometric-step-up"], minEvidenceGrade: "A", description: "Role change / biometric enrollment." },

  // Business
  { domain: "business", riskClass: "R1", required: ["actor-attestation", "policy-decision"], minEvidenceGrade: "C", description: "CRM read." },
  { domain: "business", riskClass: "R2", required: ["actor-attestation", "policy-decision", "evidence-bundle"], minEvidenceGrade: "B", description: "CRM mutation." },
  { domain: "business", riskClass: "R3", required: ["actor-attestation", "policy-decision", "evidence-bundle", "approval-receipt"], minEvidenceGrade: "B", description: "Outbound communication." },

  // Concierge
  { domain: "concierge", riskClass: "R0", required: ["actor-attestation"], minEvidenceGrade: "n/a", description: "Personal task views." },
  { domain: "concierge", riskClass: "R1", required: ["actor-attestation", "policy-decision"], minEvidenceGrade: "C", description: "Task mutations." },

  // Files
  { domain: "files", riskClass: "R2", required: ["actor-attestation", "policy-decision"], minEvidenceGrade: "C", description: "File operations." },
  { domain: "files", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle"], minEvidenceGrade: "B", description: "Sensitive document handling." },

  // Trust
  { domain: "trust", riskClass: "R3", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle"], minEvidenceGrade: "A", description: "Proof receipt generation." },
  { domain: "trust", riskClass: "R4", required: ["actor-attestation", "device-trust", "policy-decision", "evidence-bundle", "approval-receipt"], minEvidenceGrade: "A", description: "Proof chain reconciliation." },
] as const;

export function getProofRequirement(
  domain: PolicyDomainKey,
  riskClass: RiskClass,
): ProofRequirement | undefined {
  return PROOF_REQUIREMENTS.find((r) => r.domain === domain && r.riskClass === riskClass);
}

export function isProofComponentRequired(
  domain: PolicyDomainKey,
  riskClass: RiskClass,
  component: ProofComponent,
): boolean {
  const req = getProofRequirement(domain, riskClass);
  return req ? req.required.includes(component) : false;
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Proof Types
// Shared proof taxonomy
// ═══════════════════════════════════════════════════════════════

export type ProofType =
  | "execution-receipt"
  | "approval-receipt"
  | "verification-record"
  | "simulation-receipt"
  | "refusal-receipt"
  | "policy-snapshot"
  | "trust-transition"
  | "observation"
  | "attestation";

export type ProofIntegrity = "verified" | "unverified" | "tampered" | "expired";

export interface ProofMetadata {
  proofType: ProofType;
  integrity: ProofIntegrity;
  generatedAt: string;
  generatedBy: string;
  hash: string;
  previousHash?: string;
  chainPosition?: number;
}

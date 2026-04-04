// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Postcondition Verification
// Formalizes whether expected postconditions were met
// ═══════════════════════════════════════════════════════════════

export type PostconditionResult = "met" | "partially-met" | "unmet" | "indeterminate";

export interface Postcondition {
  id: string;
  description: string;
  expected: string;
  actual: string;
  result: PostconditionResult;
  weight: number; // 0-1, importance
}

export interface PostconditionVerification {
  id: string;
  executionId: string;
  capabilityId: string;
  postconditions: Postcondition[];
  overallResult: PostconditionResult;
  score: number; // 0-100
  verifiedAt: string;
  verifiedBy: string;
  proofIds: string[];
}

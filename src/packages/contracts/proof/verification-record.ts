// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Verification Record
// ═══════════════════════════════════════════════════════════════

export interface VerificationRecord {
  id: string;
  actionId: string;
  expected: Record<string, unknown>;
  actual: Record<string, unknown>;
  match: boolean;
  discrepancies: string[];
  recommendation: "accept" | "review" | "rollback";
  timestamp: string;
}

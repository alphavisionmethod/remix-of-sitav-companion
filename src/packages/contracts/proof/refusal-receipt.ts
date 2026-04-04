// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Refusal Receipt
// Canonical refusal record with provenance
// ═══════════════════════════════════════════════════════════════

export interface RefusalReceipt {
  refused: true;
  reason: string;
  missingInputs: string[];
  staleInputs: string[];
  nextSteps: string[];
  fallbackOutput?: string;
  policyRuleId?: string;
  trustScoreAtRefusal?: number;
  refusedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Contracts: Advisor Vote
// ═══════════════════════════════════════════════════════════════

export interface AdvisorVote {
  id: string;
  deliberationId: string;
  advisorId: string;
  position: string;
  confidence: number; // 0-1
  reasoning: string[];
  evidence: string[];
  caveats: string[];
  votedAt: string;
}

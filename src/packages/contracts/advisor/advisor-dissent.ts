// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Contracts: Advisor Dissent
// ═══════════════════════════════════════════════════════════════

export type DissentSeverity = "material" | "minor" | "procedural";

export interface AdvisorDissent {
  id: string;
  deliberationId: string;
  advisorId: string;
  dissentsFrom: string; // advisor ID or "consensus"
  topic: string;
  severity: DissentSeverity;
  position: string;
  reasoning: string[];
  proposedAlternative?: string;
  evidenceIds: string[];
  filedAt: string;
  resolved: boolean;
  resolution?: string;
}

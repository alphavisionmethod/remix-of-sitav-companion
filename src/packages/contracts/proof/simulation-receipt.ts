// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Simulation Receipt
// Formal output of a simulation run
// ═══════════════════════════════════════════════════════════════

export interface SimulationOutcome {
  stepId: string;
  predicted: Record<string, unknown>;
  confidence: number;
  risks: string[];
  sideEffects: string[];
}

export interface SimulationReceipt {
  id: string;
  executionPlanId: string;
  mode: "full" | "partial" | "monte-carlo";
  outcomes: SimulationOutcome[];
  overallConfidence: number;
  riskScore: number;
  recommendedAction: "proceed" | "modify" | "abort";
  warnings: string[];
  simulatedAt: string;
  durationMs: number;
}

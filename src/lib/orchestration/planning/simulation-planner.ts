// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Planner (Planning Layer)
// Connects to simulation-engine for dry-run planning
// ═══════════════════════════════════════════════════════════════

import type { SimulationSummary, PlannedStep } from "../shared/orchestration-envelope";

export interface SimulationPlanRequest {
  planId: string;
  steps: PlannedStep[];
  domain: string;
  riskTier: string;
}

export function runPlanSimulation(request: SimulationPlanRequest): SimulationSummary {
  const sideEffectSteps = request.steps.filter(s => s.type === "side_effect" || s.type === "capability_call");
  const totalDuration = request.steps.reduce((acc, s) => acc + s.estimatedDurationMs, 0);
  const riskMultiplier = request.riskTier === "critical" ? 0.8 : request.riskTier === "elevated" ? 0.5 : 0.2;

  return {
    simulationId: crypto.randomUUID(),
    passed: riskMultiplier < 0.7,
    riskScore: riskMultiplier,
    sideEffectsDetected: sideEffectSteps.length,
    durationMs: totalDuration,
  };
}

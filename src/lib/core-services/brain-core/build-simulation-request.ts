// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Simulation Request Builder
// Packages intents into simulation payloads
// ═══════════════════════════════════════════════════════════════

import type { ParsedIntent, OrchestrationPlan } from "./orchestrate-intent";

export interface SimulationRequest {
  id: string;
  intentId: string;
  plan: OrchestrationPlan;
  parameters: SimulationParameter[];
  scenarios: SimulationScenario[];
  constraints: string[];
  requestedAt: string;
}

export interface SimulationParameter {
  name: string;
  baseValue: number;
  range: { min: number; max: number };
  unit: string;
}

export interface SimulationScenario {
  id: string;
  label: string;
  description: string;
  adjustments: Record<string, number>;
}

export function buildSimulationRequest(intent: ParsedIntent, plan: OrchestrationPlan): SimulationRequest {
  const parameters = buildDomainParameters(intent.domain);
  const scenarios = buildDefaultScenarios(intent.domain);

  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    intentId: intent.id,
    plan,
    parameters,
    scenarios,
    constraints: [
      "No real-world side effects",
      "Use mock data for external API calls",
      "Time horizon: 90 days",
    ],
    requestedAt: new Date().toISOString(),
  };
}

function buildDomainParameters(domain: string): SimulationParameter[] {
  switch (domain) {
    case "business":
      return [
        { name: "conversionRate", baseValue: 0.15, range: { min: 0.05, max: 0.40 }, unit: "%" },
        { name: "avgDealSize", baseValue: 5000, range: { min: 1000, max: 25000 }, unit: "USD" },
        { name: "churnRate", baseValue: 0.05, range: { min: 0.01, max: 0.20 }, unit: "%" },
      ];
    case "finance":
      return [
        { name: "monthlyIncome", baseValue: 25000, range: { min: 15000, max: 50000 }, unit: "USD" },
        { name: "reserveTarget", baseValue: 50000, range: { min: 20000, max: 100000 }, unit: "USD" },
        { name: "inflationRate", baseValue: 0.03, range: { min: 0.01, max: 0.08 }, unit: "%" },
      ];
    case "concierge":
      return [
        { name: "weeklyTaskLoad", baseValue: 15, range: { min: 5, max: 40 }, unit: "tasks" },
        { name: "memberCount", baseValue: 4, range: { min: 2, max: 8 }, unit: "people" },
      ];
    default:
      return [{ name: "confidence", baseValue: 0.85, range: { min: 0.5, max: 1.0 }, unit: "score" }];
  }
}

function buildDefaultScenarios(domain: string): SimulationScenario[] {
  return [
    { id: "base", label: "Base Case", description: "Current trajectory with no changes", adjustments: {} },
    { id: "optimistic", label: "Optimistic", description: "Best-case assumptions", adjustments: { conversionRate: 1.5, avgDealSize: 1.3 } },
    { id: "pessimistic", label: "Pessimistic", description: "Stress-test assumptions", adjustments: { conversionRate: 0.6, churnRate: 2.0 } },
  ];
}


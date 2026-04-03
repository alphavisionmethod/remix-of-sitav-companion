import { describe, it, expect } from "vitest";
import { GovernanceSimulatorService, type SimulationScenario } from "@/lib/core-services/governance-simulator";

describe("Governance Simulator Service", () => {
  it("simulates a policy change scenario", () => {
    const svc = new GovernanceSimulatorService();
    const scenario: SimulationScenario = {
      id: "sim-1", name: "Increase payment threshold", type: "policy-change",
      description: "What if we increase auto-approve threshold?",
      inputs: [{ label: "Payment $1000", policyContext: { domain: "finance", amount: 1000, userId: "user-1" }, expectedOutcome: "allow" }],
      createdAt: Date.now(),
    };
    const result = svc.runSimulation(scenario);
    expect(result).toBeDefined();
    expect(result.scenarioId).toBe("sim-1");
    expect(result.results.length).toBe(1);
    expect(result.summary).toBeDefined();
  });
});

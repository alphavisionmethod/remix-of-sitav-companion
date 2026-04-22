import { describe, it, expect } from "vitest";
import { canonicalPlanningOrchestrator } from "../planning/planning-orchestrator";
import { createOrchestrationEnvelope, type OrchestrationEnvelope } from "../shared/orchestration-envelope";
import { createDefaultContext } from "../shared/orchestration-context";

function makeEnvelopeWithIntent(riskTier = "standard"): OrchestrationEnvelope {
  const env = createOrchestrationEnvelope({
    sourceSurface: "test",
    sourceUserId: "u1",
    domain: "business",
    capabilityId: "test.action",
    intentRaw: "test",
  });
  return {
    ...env,
    intentState: {
      classification: "action",
      resolvedDomain: "business",
      resolvedCapability: "test.action",
      riskTier,
      confidenceScore: 0.8,
      escalationRequired: false,
      recommendationIds: [],
    },
  };
}

const ctx = createDefaultContext("u1");

describe("CanonicalPlanningOrchestrator", () => {
  it("builds a plan from resolved intent", async () => {
    const result = await canonicalPlanningOrchestrator.buildPlan(makeEnvelopeWithIntent(), ctx);
    expect(result.planningState).toBeDefined();
    expect(result.planningState!.planId).toBeTruthy();
    expect(result.planningState!.steps.length).toBeGreaterThan(0);
  });

  it("requires approval for critical risk tier", async () => {
    const result = await canonicalPlanningOrchestrator.buildPlan(makeEnvelopeWithIntent("critical"), ctx);
    expect(result.planningState!.approvalRequired).toBe(true);
    expect(result.planningState!.approvalStatus).toBe("pending");
  });

  it("does not require approval for standard risk", async () => {
    const result = await canonicalPlanningOrchestrator.buildPlan(makeEnvelopeWithIntent("standard"), ctx);
    expect(result.planningState!.approvalRequired).toBe(false);
    expect(result.planningState!.approvalStatus).toBe("not_required");
  });

  it("simulation mode produces simulationResult", async () => {
    const env = { ...makeEnvelopeWithIntent(), isSimulation: true };
    const result = await canonicalPlanningOrchestrator.buildPlan(env, ctx);
    expect(result.planningState!.simulationResult).toBeDefined();
    expect(result.planningState!.simulationResult!.passed).toBe(true);
  });

  it("dependency graph maps all steps", async () => {
    const result = await canonicalPlanningOrchestrator.buildPlan(makeEnvelopeWithIntent(), ctx);
    const graph = result.planningState!.dependencyGraph;
    for (const step of result.planningState!.steps) {
      expect(graph).toHaveProperty(step.stepId);
    }
  });

  it("throws without intent state", async () => {
    const env = createOrchestrationEnvelope({
      sourceSurface: "test",
      sourceUserId: "u1",
      domain: "business",
      capabilityId: "x",
      intentRaw: "x",
    });
    await expect(canonicalPlanningOrchestrator.buildPlan(env, ctx)).rejects.toThrow();
  });
});
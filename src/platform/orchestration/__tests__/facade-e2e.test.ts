import { describe, it, expect } from "vitest";
import { OrchestrationFacade } from "../orchestration-facade";
import type { ProcessIntentRequest } from "../orchestration-facade";

function makeRequest(overrides: Partial<ProcessIntentRequest> = {}): ProcessIntentRequest {
  return {
    intentRaw: "show me revenue",
    userId: "test-user-001",
    ...overrides,
  };
}

describe("OrchestrationFacade E2E", () => {
  it("processes a query intent end-to-end with receipt", async () => {
    const facade = new OrchestrationFacade();
    const result = await facade.processIntent(makeRequest({ intentRaw: "what is my revenue?" }));
    expect(result).toBeDefined();
    expect(result.outcome).toBe("success");
    expect(result.intentOutcome).toBeDefined();
    expect(result.intentOutcome?.classification).toBe("query");
    expect(result.proofOutcome).toBeDefined();
    expect(result.proofOutcome?.receiptId).toBeTruthy();
  });

  it("processes a financial intent with elevated risk tier", async () => {
    const facade = new OrchestrationFacade();
    const result = await facade.processIntent(makeRequest({ intentRaw: "pay the invoice" }));
    expect(result).toBeDefined();
    expect(result.intentOutcome?.riskTier).toBe("critical");
  });

  it("simulation mode produces a completed result", async () => {
    const facade = new OrchestrationFacade();
    const result = await facade.processIntent(makeRequest({ intentRaw: "show me deals", isSimulation: true }));
    expect(result).toBeDefined();
    expect(result.outcome).not.toBe("failure");
  });

  it("getLastResult returns the most recent result", async () => {
    const facade = new OrchestrationFacade();
    expect(facade.getLastResult()).toBeNull();
    await facade.processIntent(makeRequest());
    expect(facade.getLastResult()).not.toBeNull();
  });

  it("getLastTruthRecord returns a truth record after full pipeline", async () => {
    const facade = new OrchestrationFacade();
    await facade.processIntent(makeRequest({ intentRaw: "show me the dashboard" }));
    const truth = facade.getLastTruthRecord();
    expect(truth).toBeDefined();
    expect(truth?.receipt).toBeDefined();
    expect(truth?.auditTrail).toBeInstanceOf(Array);
    expect(truth?.lineage).toBeInstanceOf(Array);
    expect(truth?.reversibility).toBeDefined();
    expect(truth?.approvalProof).toBeDefined();
  });

  it("result includes planning outcome with step count", async () => {
    const facade = new OrchestrationFacade();
    const result = await facade.processIntent(makeRequest({ intentRaw: "create a report" }));
    expect(result.planningOutcome).toBeDefined();
    expect(result.planningOutcome?.stepCount).toBeGreaterThan(0);
  });

  it("result includes execution outcome with duration", async () => {
    const facade = new OrchestrationFacade();
    const result = await facade.processIntent(makeRequest({ intentRaw: "go to settings" }));
    expect(result.executionOutcome).toBeDefined();
    expect(result.executionOutcome?.durationMs).toBeGreaterThanOrEqual(0);
  });
});
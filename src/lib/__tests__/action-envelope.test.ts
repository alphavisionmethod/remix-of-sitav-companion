import { describe, it, expect } from "vitest";
import {
  createActionEnvelope,
  validateActionEnvelope,
  mapKernelModeToExecutor,
  type ActionEnvelope,
} from "@/packages/contracts/kernel/action-envelope";
import { createSingleStepPlan } from "@/packages/contracts/kernel/action-plan";
import { detectOutputDrift } from "@/packages/contracts/kernel/replay-packet";
import { createNegativeReceipt } from "@/packages/contracts/kernel/negative-receipt";
import { createReasoningTrace, addReasoningStep } from "@/packages/contracts/kernel/reasoning-trace";
import { computeAggregateConfidence, computeAggregateTrust } from "@/packages/contracts/kernel/evidence-pack";

describe("ActionEnvelope", () => {
  const baseParams = {
    actionType: "invoice.create",
    capabilityId: "finance.invoice.create",
    tenantId: "tenant-1",
    actorId: "user-1",
    intent: { action: "create-invoice", domain: "finance", parameters: { amount: 100 } },
  };

  it("creates envelope with defaults", () => {
    const env = createActionEnvelope(baseParams);
    expect(env.schemaVersion).toBe(1);
    expect(env.execution.mode).toBe("REAL");
    expect(env.execution.isReplay).toBe(false);
    expect(env.approval.required).toBe(false);
    expect(env.risk.tier).toBe("standard");
    expect(env.source).toBe("ui");
    expect(env.id).toBeTruthy();
    expect(env.correlationId).toBeTruthy();
    expect(env.traceId).toBeTruthy();
  });

  it("creates envelope with custom mode", () => {
    const env = createActionEnvelope({ ...baseParams, mode: "EMULATED" });
    expect(env.execution.mode).toBe("EMULATED");
  });

  it("validates valid envelope", () => {
    const env = createActionEnvelope(baseParams);
    const result = validateActionEnvelope(env);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates invalid envelope", () => {
    const env = createActionEnvelope(baseParams);
    env.actorId = "";
    const result = validateActionEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing actorId");
  });

  it("rejects REAL mode with approval required but no approvalId", () => {
    const env = createActionEnvelope({
      ...baseParams,
      approval: { required: true, tier: "single" },
    });
    const result = validateActionEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Approval required");
  });

  it("maps kernel modes to executor modes", () => {
    expect(mapKernelModeToExecutor("EMULATED")).toBe("draft");
    expect(mapKernelModeToExecutor("REAL_MOCK")).toBe("simulation");
    expect(mapKernelModeToExecutor("REAL")).toBe("real");
  });
});

describe("ActionPlan", () => {
  it("creates single-step plan from envelope", () => {
    const env = createActionEnvelope({
      actionType: "test",
      capabilityId: "test.cap",
      tenantId: "t1",
      actorId: "u1",
      intent: { action: "test", domain: "system", parameters: {} },
    });
    const plan = createSingleStepPlan(env);
    expect(plan.steps).toHaveLength(1);
    expect(plan.envelopeId).toBe(env.id);
    expect(plan.status).toBe("draft");
  });
});

describe("ReplayPacket", () => {
  it("detects no drift when schemas match", () => {
    const result = detectOutputDrift({ a: 1, b: 2 }, { a: 3, b: 4 });
    expect(result.match).toBe(true);
  });

  it("detects drift when keys differ", () => {
    const result = detectOutputDrift({ a: 1 }, { a: 1, b: 2 });
    expect(result.match).toBe(false);
    expect(result.driftKeys).toContain("extra:b");
  });
});

describe("NegativeReceipt", () => {
  it("creates negative receipt", () => {
    const nr = createNegativeReceipt({
      envelopeId: "e1",
      correlationId: "c1",
      capabilityId: "cap1",
      reason: "policy-denied",
      detail: "Too risky",
      actorId: "u1",
      domain: "finance",
    });
    expect(nr.reason).toBe("policy-denied");
    expect(nr.blockedAt).toBeTruthy();
  });
});

describe("ReasoningTrace", () => {
  it("builds trace with steps", () => {
    let trace = createReasoningTrace("e1", "c1");
    trace = addReasoningStep(trace, {
      stepType: "policy-evaluation",
      input: {},
      output: { effect: "allow" },
      decision: "allowed",
      confidence: 1.0,
      durationMs: 5,
      timestamp: new Date().toISOString(),
    });
    expect(trace.steps).toHaveLength(1);
    expect(trace.totalDurationMs).toBe(5);
  });
});

describe("EvidencePack", () => {
  it("computes aggregate confidence", () => {
    const score = computeAggregateConfidence([
      { id: "1", type: "receipt", sourceId: "s1", sourceLabel: "l1", trustLevel: "verified", confidence: 0.8, ingestedAt: "" },
      { id: "2", type: "memory", sourceId: "s2", sourceLabel: "l2", trustLevel: "verified", confidence: 0.6, ingestedAt: "" },
    ]);
    expect(score).toBeCloseTo(0.7);
  });

  it("computes aggregate trust — all same", () => {
    const level = computeAggregateTrust([
      { id: "1", type: "receipt", sourceId: "s1", sourceLabel: "l1", trustLevel: "verified", confidence: 1, ingestedAt: "" },
    ]);
    expect(level).toBe("verified");
  });

  it("computes aggregate trust — mixed", () => {
    const level = computeAggregateTrust([
      { id: "1", type: "receipt", sourceId: "s1", sourceLabel: "l1", trustLevel: "verified", confidence: 1, ingestedAt: "" },
      { id: "2", type: "external", sourceId: "s2", sourceLabel: "l2", trustLevel: "external", confidence: 0.5, ingestedAt: "" },
    ]);
    expect(level).toBe("mixed");
  });
});

import { describe, it, expect } from "vitest";
import { evaluatePolicy } from "@/lib/core-services/policy-engine";
import { WorkflowEngine } from "@/lib/core-services/workflow-engine";
import { CapabilityRouter, createCapabilityRouter } from "@/lib/core-services/capability-router";

describe("Demo Mode Resolution — Integration", () => {
  it("policy engine allows simulation-mode bypass", () => {
    const result = evaluatePolicy({ isSimulation: true }, undefined, { skipPersist: true });
    expect(result.effect).toBe("allow");
    expect(result.matchedRule?.id).toBe("simulation-bypass");
  });

  it("capability router selects simulation mode for non-critical requests", () => {
    const router = createCapabilityRouter();
    const decision = router.route({
      intentType: "action",
      domain: "business",
      action: "action",
      urgency: "low",
    });

    expect(decision?.selectedMode).not.toBe("real");
  });

  it("workflow engine supports simulation state path", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("demo.test", { mode: "demo" });

    const r1 = engine.transition(wf.id, "proposed");
    expect(r1.success).toBe(true);

    const r2 = engine.transition(wf.id, "drafted");
    expect(r2.success).toBe(true);

    const r3 = engine.transition(wf.id, "simulated");
    expect(r3.success).toBe(true);

    // Simulated can go to approval-requested or queued
    const r4 = engine.transition(wf.id, "queued");
    expect(r4.success).toBe(true);
  });

  it("executor service handles draft mode without execution", async () => {
    const { ExecutorService } = await import("@/lib/core-services/executor-service");
    const executor = new ExecutorService();

    const envelope = {
      id: "draft-test",
      correlationId: "corr-draft",
      capabilityId: "test.draft",
      mode: "draft" as const,
      status: "pending" as const,
      payload: { test: true },
      attemptCount: 0,
      createdAt: Date.now(),
    };

    const result = await executor.execute(envelope);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("draft");
  });

  it("executor service handles simulation mode", async () => {
    const { ExecutorService } = await import("@/lib/core-services/executor-service");
    const executor = new ExecutorService();

    const envelope = {
      id: "sim-test",
      correlationId: "corr-sim",
      capabilityId: "test.sim",
      mode: "simulation" as const,
      status: "pending" as const,
      payload: { test: true },
      attemptCount: 0,
      createdAt: Date.now(),
    };

    const result = await executor.execute(envelope);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("simulation");
  });
});

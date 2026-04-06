import { describe, it, expect } from "vitest";
import { WorkflowEngine } from "@/lib/core-services/workflow-engine";

describe("Workflow Engine Chain — Integration", () => {
  it("creates a workflow in detected state", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("business.create-lead", { name: "Acme" });

    expect(wf.state).toBe("detected");
    expect(wf.capabilityId).toBe("business.create-lead");
    expect(wf.eventLog).toHaveLength(0);
  });

  it("transitions through the happy path", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("finance.pay-invoice", { amount: 1000 });

    const r1 = engine.transition(wf.id, "proposed", "Proposed by advisor");
    expect(r1.success).toBe(true);

    const r2 = engine.transition(wf.id, "drafted");
    expect(r2.success).toBe(true);

    const r3 = engine.transition(wf.id, "simulated");
    expect(r3.success).toBe(true);

    const r4 = engine.transition(wf.id, "approval-requested");
    expect(r4.success).toBe(true);

    const r5 = engine.transition(wf.id, "approved");
    expect(r5.success).toBe(true);

    const r6 = engine.transition(wf.id, "queued");
    expect(r6.success).toBe(true);

    const r7 = engine.transition(wf.id, "executing");
    expect(r7.success).toBe(true);

    const r8 = engine.transition(wf.id, "completed", "Done", { result: { txId: "tx-1" } });
    expect(r8.success).toBe(true);
    expect(r8.workflow.result?.txId).toBe("tx-1");

    const r9 = engine.transition(wf.id, "verified");
    expect(r9.success).toBe(true);
    expect(r9.workflow.eventLog).toHaveLength(9);
  });

  it("rejects invalid transitions", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("test.action", {});

    const result = engine.transition(wf.id, "executing");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid transition");
  });

  it("advances through multiple states", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("test.advance", {});

    const result = engine.advanceThrough(wf.id, [
      "proposed", "drafted", "simulated", "approval-requested", "approved",
    ]);

    expect(result.success).toBe(true);
    expect(result.workflow.state).toBe("approved");
  });

  it("handles failure and recovery path", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("test.fail", {});
    engine.transition(wf.id, "proposed");

    const fail = engine.transition(wf.id, "failed", "Error occurred", {
      errorDetails: { code: "ERR_001" },
    });
    expect(fail.success).toBe(true);
    expect(fail.workflow.errorDetails?.code).toBe("ERR_001");

    // Recovery path: failed → detected (re-attempt)
    const recover = engine.transition(wf.id, "detected", "Retrying");
    expect(recover.success).toBe(true);
    expect(recover.workflow.recoveryAttempts).toBe(1);
  });

  it("returns error for nonexistent workflow", () => {
    const engine = new WorkflowEngine();
    const result = engine.transition("fake-id", "proposed");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});

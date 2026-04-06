import { describe, it, expect } from "vitest";
import { WorkflowEngine, ActionQueue, AutonomousExecutor } from "../workflow-engine";

describe("WorkflowEngine", () => {
  it("creates a workflow in detected state", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap.test", { key: "val" });
    expect(wf.state).toBe("detected");
    expect(wf.capabilityId).toBe("cap.test");
  });

  it("transitions through valid states", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap", {});
    const r1 = engine.transition(wf.id, "proposed");
    expect(r1.success).toBe(true);
    const r2 = engine.transition(wf.id, "drafted");
    expect(r2.success).toBe(true);
  });

  it("rejects invalid transitions", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap", {});
    const result = engine.transition(wf.id, "completed");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid transition");
  });

  it("advanceThrough moves through multiple states", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap", {});
    const result = engine.advanceThrough(wf.id, ["proposed", "drafted", "simulated"]);
    expect(result.success).toBe(true);
    expect(engine.getWorkflow(wf.id)!.state).toBe("simulated");
  });

  it("records event log for each transition", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap", {});
    engine.transition(wf.id, "proposed");
    engine.transition(wf.id, "drafted");
    expect(engine.replay(wf.id)).toHaveLength(2);
  });

  it("recovers from failed state", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap", {});
    engine.transition(wf.id, "failed");
    const r = engine.recover(wf.id, "retry");
    expect(r.success).toBe(true);
    expect(engine.getWorkflow(wf.id)!.state).toBe("detected");
    expect(engine.getWorkflow(wf.id)!.recoveryAttempts).toBe(1);
  });

  it("getValidTransitions returns correct targets", () => {
    const engine = new WorkflowEngine();
    const wf = engine.createWorkflow("cap", {});
    const valid = engine.getValidTransitions(wf.id);
    expect(valid).toContain("proposed");
    expect(valid).toContain("failed");
    expect(valid).not.toContain("completed");
  });

  it("getWorkflowsByState filters correctly", () => {
    const engine = new WorkflowEngine();
    engine.createWorkflow("a", {});
    engine.createWorkflow("b", {});
    expect(engine.getWorkflowsByState("detected")).toHaveLength(2);
  });
});

describe("ActionQueue", () => {
  it("enqueues and dequeues by priority", () => {
    const q = new ActionQueue();
    q.enqueue("low-cap", {}, { priority: "low" });
    q.enqueue("high-cap", {}, { priority: "high" });
    const next = q.dequeue();
    expect(next?.capabilityId).toBe("high-cap");
  });

  it("completes an action", () => {
    const q = new ActionQueue();
    const a = q.enqueue("cap", {});
    q.dequeue();
    const completed = q.complete(a.id);
    expect(completed?.status).toBe("completed");
  });

  it("retries on failure up to maxRetries", () => {
    const q = new ActionQueue();
    const a = q.enqueue("cap", {}, { maxRetries: 2 });
    q.dequeue();
    q.fail(a.id, "err1");
    expect(q.getAll().find(x => x.id === a.id)?.status).toBe("scheduled");
    q.fail(a.id, "err2");
    expect(q.getAll().find(x => x.id === a.id)?.status).toBe("failed");
  });

  it("cancels a pending action", () => {
    const q = new ActionQueue();
    const a = q.enqueue("cap", {});
    expect(q.cancel(a.id)).toBe(true);
    expect(q.getAll().find(x => x.id === a.id)?.status).toBe("cancelled");
  });
});

describe("AutonomousExecutor", () => {
  it("checks trust threshold for auto-advance", () => {
    const exec = new AutonomousExecutor();
    exec.setConfig({ level: "execute", trustThreshold: 80 });
    expect(exec.canAutoAdvance(90, "execute")).toBe(true);
    expect(exec.canAutoAdvance(70, "execute")).toBe(false);
  });

  it("getMaxAutoLevel returns highest affordable level", () => {
    const exec = new AutonomousExecutor();
    expect(exec.getMaxAutoLevel(95)).toBe("execute");
    expect(exec.getMaxAutoLevel(55)).toBe("simulate");
    expect(exec.getMaxAutoLevel(0)).toBe("observe");
  });

  it("shouldAutoExecute checks all conditions", () => {
    const exec = new AutonomousExecutor();
    exec.setConfig({ level: "execute", trustThreshold: 80, maxAutoAmount: 10000, allowedCapabilities: ["pay"] });
    expect(exec.shouldAutoExecute(90, "pay", 5000)).toBe(true);
    expect(exec.shouldAutoExecute(90, "pay", 20000)).toBe(false);
    expect(exec.shouldAutoExecute(90, "other", 5000)).toBe(false);
    expect(exec.shouldAutoExecute(70, "pay", 5000)).toBe(false);
  });
});

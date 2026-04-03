import { describe, it, expect } from "vitest";
import { createWorkflowContext, type WorkflowDefinition, type RetryPolicy } from "@/packages/workflow-primitives";

describe("Workflow Primitives", () => {
  it("creates a workflow execution context with unique IDs", () => {
    const ctx = createWorkflowContext("wf-1", "user-1");
    expect(ctx.workflowId).toBe("wf-1");
    expect(ctx.userId).toBe("user-1");
    expect(ctx.runId).toBeTruthy();
    expect(ctx.correlationId).toBeTruthy();
    expect(ctx.runId).not.toBe(ctx.correlationId);
    expect(ctx.currentStepIndex).toBe(0);
    expect(ctx.variables).toEqual({});
    expect(ctx.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it("generates different run IDs for each context", () => {
    const ctx1 = createWorkflowContext("wf-1", "user-1");
    const ctx2 = createWorkflowContext("wf-1", "user-1");
    expect(ctx1.runId).not.toBe(ctx2.runId);
  });
});

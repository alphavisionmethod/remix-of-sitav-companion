// ═══════════════════════════════════════════════════════════════
// SITA OS — Execute Workflow Step Service
// Advances WorkflowState by executing a single step
// ═══════════════════════════════════════════════════════════════

import type { WorkflowDefinition, WorkflowExecutionContext, WorkflowStepDefinition } from "@/packages/workflow-primitives";

export type StepResult = "success" | "failure" | "skipped" | "waiting";

export interface StepExecutionResult {
  stepId: string;
  result: StepResult;
  output: Record<string, unknown>;
  durationMs: number;
  nextStepId: string | null;
  error?: string;
}

export interface WorkflowState {
  context: WorkflowExecutionContext;
  definition: WorkflowDefinition;
  completedSteps: string[];
  currentStepId: string | null;
  status: "running" | "completed" | "failed" | "paused";
  stepResults: StepExecutionResult[];
}

export function initWorkflowState(definition: WorkflowDefinition, userId: string): WorkflowState {
  return {
    context: {
      workflowId: definition.id,
      runId: crypto.randomUUID(),
      currentStepIndex: 0,
      variables: {},
      startedAt: Date.now(),
      correlationId: crypto.randomUUID(),
      userId,
    },
    definition,
    completedSteps: [],
    currentStepId: definition.steps[0]?.id || null,
    status: "running",
    stepResults: [],
  };
}

export function executeStep(state: WorkflowState): StepExecutionResult {
  const step = state.definition.steps[state.context.currentStepIndex];
  if (!step) {
    return { stepId: "none", result: "failure", output: {}, durationMs: 0, nextStepId: null, error: "No step found at current index" };
  }

  const start = performance.now();
  const result = simulateStepExecution(step, state.context);
  const duration = performance.now() - start;

  const stepResult: StepExecutionResult = {
    stepId: step.id,
    result: result.success ? "success" : "failure",
    output: result.output,
    durationMs: duration,
    nextStepId: result.success ? (step.onSuccess || null) : (step.onFailure || null),
    error: result.error,
  };

  state.stepResults.push(stepResult);
  state.completedSteps.push(step.id);

  if (result.success) {
    state.context.currentStepIndex++;
    state.context.variables = { ...state.context.variables, ...result.output };
    if (state.context.currentStepIndex >= state.definition.steps.length) {
      state.status = "completed";
      state.currentStepId = null;
    } else {
      state.currentStepId = state.definition.steps[state.context.currentStepIndex].id;
    }
  } else {
    state.status = "failed";
  }

  return stepResult;
}

function simulateStepExecution(step: WorkflowStepDefinition, _ctx: WorkflowExecutionContext): { success: boolean; output: Record<string, unknown>; error?: string } {
  switch (step.type) {
    case "action":
      return { success: true, output: { actionResult: "executed", stepName: step.name } };
    case "condition":
      return { success: true, output: { conditionMet: true } };
    case "approval":
      return { success: true, output: { approvalStatus: "auto-approved-simulation" } };
    case "delay":
      return { success: true, output: { delaySkipped: true, reason: "simulation" } };
    case "notification":
      return { success: true, output: { notificationQueued: true } };
    case "transformation":
      return { success: true, output: { transformed: true } };
    case "external-call":
      return { success: true, output: { externalCallSimulated: true } };
    default:
      return { success: false, output: {}, error: `Unknown step type: ${step.type}` };
  }
}

export function canRetry(state: WorkflowState): boolean {
  if (state.status !== "failed") return false;
  const retryCount = state.stepResults.filter((r) => r.result === "failure").length;
  return retryCount <= state.definition.retryPolicy.maxRetries;
}


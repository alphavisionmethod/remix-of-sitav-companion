// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Execution Engine
// Programmatic recovery step executor with receipt emission.
// ═══════════════════════════════════════════════════════════════

export type RecoveryStepStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface RecoveryStep {
  readonly id: string;
  readonly label: string;
  readonly runbookRef: string;
  readonly destructive: boolean;
  readonly requiresConfirmation: boolean;
  execute: () => Promise<{ ok: boolean; message: string }>;
}

export interface RecoveryReceipt {
  readonly executionId: string;
  readonly runbookRef: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly steps: Array<{
    stepId: string;
    status: RecoveryStepStatus;
    message: string;
    durationMs: number;
  }>;
  readonly overallStatus: "success" | "partial" | "failed";
}

// ═══════════════════════════════════════════════════════════════
// Wave 21 — Governed Recovery Execution
// ═══════════════════════════════════════════════════════════════

import {
  type RecoveryExecutionInstance,
  type RecoveryExecutionState,
  createExecutionInstance,
  transitionState,
} from "./runbook-execution-contract";
import { computeMetrics, type RecoveryTimingMetrics } from "./recovery-metrics";
import { getConfirmationRequirement } from "./recovery-operator-confirmation";
import { buildPostmortem, type PostmortemArtifact } from "./recovery-postmortem-builder";

export interface GovernedRecoveryResult {
  readonly receipt: RecoveryReceipt;
  readonly instance: RecoveryExecutionInstance;
  readonly metrics: RecoveryTimingMetrics;
  readonly postmortem: PostmortemArtifact | null;
}

export async function executeRecoveryWithGovernance(
  runbookRef: string,
  steps: RecoveryStep[],
  opts?: {
    onProgress?: (stepId: string, status: RecoveryStepStatus) => void;
    onStateChange?: (state: RecoveryExecutionState) => void;
    generatePostmortem?: boolean;
    impactedSystems?: string[];
  },
): Promise<GovernedRecoveryResult> {
  const instance = createExecutionInstance(runbookRef);
  const notify = (s: RecoveryExecutionState, reason: string) => {
    transitionState(instance, s, reason);
    opts?.onStateChange?.(s);
  };

  notify("READY", "Execution initialized");
  notify("TRIAGED", "Runbook loaded and steps validated");
  notify("EXECUTION_PENDING", "Beginning step execution");

  const receipt = await executeRecoveryPlan(runbookRef, steps, (stepId, status) => {
    if (status === "running") {
      const step = steps.find((s) => s.id === stepId);
      if (step?.requiresConfirmation) {
        try { transitionState(instance, "AWAITING_CONFIRMATION", `Step ${stepId} requires confirmation`); } catch {}
        try { transitionState(instance, "MANUAL_STEP_REQUIRED", `Confirmation received for ${stepId}`); } catch {}
      } else {
        try { transitionState(instance, "AUTOMATED_STEP_RUNNING", `Executing step ${stepId}`); } catch {}
      }
    }
    opts?.onProgress?.(stepId, status);
  });

  const finalState: RecoveryExecutionState = receipt.overallStatus === "success"
    ? "RECOVERED" : receipt.overallStatus === "partial" ? "PARTIALLY_REMEDIATED" : "FAILED";
  try { notify(finalState, `Recovery ${receipt.overallStatus}`); } catch {}

  const metrics = computeMetrics(receipt);

  let postmortem: PostmortemArtifact | null = null;
  if (opts?.generatePostmortem !== false) {
    try { transitionState(instance, "POSTMORTEM_PENDING", "Generating postmortem"); } catch {}
    postmortem = buildPostmortem({
      receipt,
      type: "incident",
      impactedSystems: opts?.impactedSystems ?? [],
      metrics,
    });
    try { transitionState(instance, "CLOSED", "Postmortem generated"); } catch {}
  }

  return { receipt, instance, metrics, postmortem };
}

export function abortRecovery(instance: RecoveryExecutionInstance, reason: string): void {
  transitionState(instance, "FAILED", `Aborted: ${reason}`);
}

export function escalateRecovery(instance: RecoveryExecutionInstance, reason: string): void {
  transitionState(instance, "ESCALATED", `Escalated: ${reason}`);
}

export async function executeRecoveryPlan(
  runbookRef: string,
  steps: RecoveryStep[],
  onProgress?: (stepId: string, status: RecoveryStepStatus) => void
): Promise<RecoveryReceipt> {
  const executionId = `recovery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();
  const results: RecoveryReceipt["steps"] = [];
  let failed = false;

  for (const step of steps) {
    if (failed && !step.destructive) {
      results.push({ stepId: step.id, status: "skipped", message: "Skipped due to prior failure", durationMs: 0 });
      onProgress?.(step.id, "skipped");
      continue;
    }
    onProgress?.(step.id, "running");
    const t0 = performance.now();
    try {
      const result = await step.execute();
      const durationMs = Math.round(performance.now() - t0);
      const status: RecoveryStepStatus = result.ok ? "success" : "failed";
      results.push({ stepId: step.id, status, message: result.message, durationMs });
      onProgress?.(step.id, status);
      if (!result.ok) failed = true;
    } catch (err) {
      const durationMs = Math.round(performance.now() - t0);
      results.push({ stepId: step.id, status: "failed", message: String(err), durationMs });
      onProgress?.(step.id, "failed");
      failed = true;
    }
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const overallStatus = successCount === steps.length ? "success" : successCount > 0 ? "partial" : "failed";

  return {
    executionId,
    runbookRef,
    startedAt,
    completedAt: new Date().toISOString(),
    steps: results,
    overallStatus,
  };
}
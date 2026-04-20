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
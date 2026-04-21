// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Drill Runner (Wave 21)
// Simulation drill runner with typed receipt emission.
// ═══════════════════════════════════════════════════════════════

import { triggerRunbookDrill } from "@/lib/support/runbook-drill-status";

export interface DrillScenario {
  readonly scenarioId: string;
  readonly label: string;
  readonly runbookIds: readonly string[];
  readonly systemsExercised: readonly string[];
  readonly assertions: readonly string[];
}

export interface DrillStepOutcome {
  readonly stepId: string;
  readonly status: "pass" | "fail" | "skipped";
  readonly durationMs: number;
  readonly confirmationRecorded: boolean;
  readonly notes: string;
}

export interface DrillReceipt {
  readonly drillId: string;
  readonly scenarioId: string;
  readonly runbookIds: readonly string[];
  readonly mode: "dry-run" | "live";
  readonly startedAt: string;
  readonly completedAt: string;
  readonly overallResult: "pass" | "partial" | "fail";
  readonly stepOutcomes: readonly DrillStepOutcome[];
  readonly operatorConfirmations: readonly string[];
  readonly skippedSteps: readonly string[];
  readonly findings: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly timingMetrics: {
    readonly totalDurationMs: number;
    readonly triageMs: number;
    readonly firstRemediationMs: number;
  };
}

export async function executeDrill(
  scenario: DrillScenario,
  mode: "dry-run" | "live" = "dry-run",
  triggeredBy: "manual" | "scheduled" | "ci" = "manual",
): Promise<DrillReceipt> {
  const drillId = `drill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();
  const stepOutcomes: DrillStepOutcome[] = [];
  const confirmations: string[] = [];
  const skipped: string[] = [];
  const findings: string[] = [];

  const triageStart = performance.now();

  for (const runbookId of scenario.runbookIds) {
    try {
      const result = await triggerRunbookDrill(runbookId, { mode, triggeredBy });
      if (result.ok && result.result) {
        for (const step of result.result.stepOutcomes) {
          stepOutcomes.push({
            stepId: `${runbookId}-step-${step.order}`,
            status: step.status === "ok" ? "pass" : step.status === "skipped" ? "skipped" : "fail",
            durationMs: step.elapsedMs ?? 0,
            confirmationRecorded: false,
            notes: step.notes ?? "",
          });
          if (step.status === "skipped") skipped.push(`${runbookId}-step-${step.order}`);
        }
      } else {
        stepOutcomes.push({
          stepId: `${runbookId}-invoke`,
          status: "fail",
          durationMs: 0,
          confirmationRecorded: false,
          notes: result.error ?? "Drill invocation failed",
        });
        findings.push(`Runbook ${runbookId} drill failed: ${result.error}`);
      }
    } catch (err) {
      stepOutcomes.push({
        stepId: `${runbookId}-invoke`,
        status: "fail",
        durationMs: 0,
        confirmationRecorded: false,
        notes: String(err),
      });
    }
  }

  const totalDurationMs = Math.round(performance.now() - triageStart);
  const passCount = stepOutcomes.filter((s) => s.status === "pass").length;
  const overallResult = passCount === stepOutcomes.length ? "pass" : passCount > 0 ? "partial" : "fail";

  return {
    drillId,
    scenarioId: scenario.scenarioId,
    runbookIds: scenario.runbookIds,
    mode,
    startedAt,
    completedAt: new Date().toISOString(),
    overallResult,
    stepOutcomes,
    operatorConfirmations: confirmations,
    skippedSteps: skipped,
    findings,
    evidenceRefs: [`drill-receipt:${drillId}`],
    timingMetrics: {
      totalDurationMs,
      triageMs: Math.min(totalDurationMs, 5000),
      firstRemediationMs: stepOutcomes[0]?.durationMs ?? 0,
    },
  };
}
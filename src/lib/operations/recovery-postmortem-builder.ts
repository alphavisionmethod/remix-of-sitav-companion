// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Postmortem Builder (Wave 21)
// Structured postmortem artifact generation from recovery data.
// ═══════════════════════════════════════════════════════════════

import type { RecoveryReceipt } from "./recovery-execution-engine";
import type { RecoveryTimingMetrics } from "./recovery-metrics";
import type { ConfirmationRecord } from "./recovery-operator-confirmation";

export interface PostmortemArtifact {
  readonly postmortemId: string;
  readonly incidentOrDrillId: string;
  readonly type: "incident" | "drill";
  readonly createdAt: string;
  readonly impactedSystems: readonly string[];
  readonly timeline: readonly PostmortemTimelineEntry[];
  readonly runbookPath: {
    readonly runbookId: string;
    readonly stepsFollowed: number;
    readonly stepsSucceeded: number;
    readonly stepsFailed: number;
    readonly stepsSkipped: number;
  };
  readonly metrics: RecoveryTimingMetrics | null;
  readonly operatorActions: readonly ConfirmationRecord[];
  readonly recoveryOutcome: "success" | "partial" | "failed";
  readonly followUpItems: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly lessonsLearned: readonly string[];
}

export interface PostmortemTimelineEntry {
  readonly timestamp: string;
  readonly event: string;
  readonly actor: "system" | "operator";
}

export function buildPostmortem(params: {
  receipt: RecoveryReceipt;
  type: "incident" | "drill";
  impactedSystems: readonly string[];
  metrics?: RecoveryTimingMetrics;
  confirmations?: readonly ConfirmationRecord[];
  followUpItems?: readonly string[];
  lessonsLearned?: readonly string[];
}): PostmortemArtifact {
  const { receipt, type, impactedSystems, metrics, confirmations, followUpItems, lessonsLearned } = params;

  const timeline: PostmortemTimelineEntry[] = [
    { timestamp: receipt.startedAt, event: `Recovery started for ${receipt.runbookRef}`, actor: "system" },
  ];

  for (const step of receipt.steps) {
    timeline.push({
      timestamp: new Date(new Date(receipt.startedAt).getTime() + step.durationMs).toISOString(),
      event: `Step ${step.stepId}: ${step.status} — ${step.message}`,
      actor: "system",
    });
  }

  if (confirmations) {
    for (const c of confirmations) {
      timeline.push({ timestamp: c.confirmedAt, event: `Operator confirmation by ${c.confirmedBy}: ${c.rationale}`, actor: "operator" });
    }
  }

  timeline.push({ timestamp: receipt.completedAt, event: `Recovery completed: ${receipt.overallStatus}`, actor: "system" });
  timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const steps = receipt.steps;

  return {
    postmortemId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    incidentOrDrillId: receipt.executionId,
    type,
    createdAt: new Date().toISOString(),
    impactedSystems,
    timeline,
    runbookPath: {
      runbookId: receipt.runbookRef,
      stepsFollowed: steps.length,
      stepsSucceeded: steps.filter((s) => s.status === "success").length,
      stepsFailed: steps.filter((s) => s.status === "failed").length,
      stepsSkipped: steps.filter((s) => s.status === "skipped").length,
    },
    metrics: metrics ?? null,
    operatorActions: confirmations ?? [],
    recoveryOutcome: receipt.overallStatus,
    followUpItems: followUpItems ?? [],
    evidenceRefs: [`recovery-receipt:${receipt.executionId}`],
    lessonsLearned: lessonsLearned ?? [],
  };
}
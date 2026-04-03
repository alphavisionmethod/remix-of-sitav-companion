// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Explanation Builder
// Generates human-readable explanations for orchestration results
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationResult, OrchestrationPlan, ParsedIntent } from "./orchestrate-intent";

export interface ExplanationPackage {
  headline: string;
  summary: string;
  steps: string[];
  confidence: string;
  trustIndicators: string[];
  nextActions: string[];
}

export function buildExplanationPackage(
  intent: ParsedIntent,
  plan: OrchestrationPlan,
  result: OrchestrationResult
): ExplanationPackage {
  const steps = plan.steps.map(
    (s, i) => `${i + 1}. ${s.action} via ${s.serviceName} (${s.estimatedDurationMs}ms)`
  );

  const trustIndicators: string[] = [];
  if (plan.policyChecks.every(p => p.passed)) trustIndicators.push("All policy checks passed");
  if (result.receipts.length > 0) trustIndicators.push(`${result.receipts.length} immutable receipt(s) generated`);
  if (result.confidenceScore >= 90) trustIndicators.push("High confidence execution");

  const nextActions: string[] = [];
  if (result.status === "awaiting-approval") {
    nextActions.push("Review and approve/reject the pending action");
  } else if (result.status === "completed") {
    nextActions.push("Review receipts in Proof Center");
  } else if (result.status === "failed") {
    nextActions.push("Review error details and retry or escalate");
  }

  const headline = result.status === "completed"
    ? `✓ ${intent.type} completed successfully`
    : result.status === "awaiting-approval"
    ? `⏳ Awaiting your approval`
    : `⚠ ${intent.type} ${result.status}`;

  return {
    headline,
    summary: result.explanation || `Processed ${intent.type} intent for ${intent.domain} domain in ${result.durationMs}ms.`,
    steps,
    confidence: `${result.confidenceScore}% confidence`,
    trustIndicators,
    nextActions,
  };
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60000)}m`;
}

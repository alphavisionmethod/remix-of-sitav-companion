// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Planner (Planning Layer)
// Adapter over existing WorkflowEngine for plan construction
// ═══════════════════════════════════════════════════════════════

import type { PlannedStep } from "../shared/orchestration-envelope";

export interface WorkflowPlanSpec {
  workflowId: string;
  name: string;
  steps: PlannedStep[];
  estimatedDurationMs: number;
  reversible: boolean;
}

export function buildWorkflowPlan(
  capabilityId: string,
  steps: PlannedStep[]
): WorkflowPlanSpec {
  return {
    workflowId: crypto.randomUUID(),
    name: `workflow-${capabilityId}`,
    steps,
    estimatedDurationMs: steps.reduce((acc, s) => acc + s.estimatedDurationMs, 0),
    reversible: steps.every(s => s.reversible),
  };
}

export function reorderByDependencies(steps: PlannedStep[]): PlannedStep[] {
  const resolved = new Set<string>();
  const ordered: PlannedStep[] = [];
  const remaining = [...steps];

  while (remaining.length > 0) {
    const next = remaining.findIndex(s =>
      s.dependsOn.every(dep => resolved.has(dep))
    );
    if (next === -1) break; // circular dependency — bail
    const step = remaining.splice(next, 1)[0];
    resolved.add(step.stepId);
    ordered.push(step);
  }
  // Append any unresolved (circular deps)
  ordered.push(...remaining);
  return ordered;
}

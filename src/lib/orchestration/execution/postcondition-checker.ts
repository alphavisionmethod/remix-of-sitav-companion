// ═══════════════════════════════════════════════════════════════
// SITA OS — Postcondition Checker (Execution Layer)
// Validates postconditions after execution
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";

export interface PostconditionCheck {
  checkId: string;
  name: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  detail?: string;
}

export function checkPostconditions(envelope: OrchestrationEnvelope): PostconditionCheck[] {
  const checks: PostconditionCheck[] = [];
  const execState = envelope.executionState;

  // Check 1: Execution completed
  checks.push({
    checkId: "post-exec-complete",
    name: "Execution Completion",
    passed: execState?.result === "success",
    severity: "critical",
    detail: execState ? `Result: ${execState.result}` : "No execution state",
  });

  // Check 2: All steps completed
  if (execState) {
    checks.push({
      checkId: "post-steps-complete",
      name: "All Steps Completed",
      passed: execState.stepsCompleted === execState.stepsTotal,
      severity: "critical",
      detail: `${execState.stepsCompleted}/${execState.stepsTotal} steps`,
    });
  }

  // Check 3: Side effects recorded
  if (execState && execState.sideEffects.length > 0) {
    checks.push({
      checkId: "post-side-effects-recorded",
      name: "Side Effects Recorded",
      passed: true,
      severity: "info",
      detail: `${execState.sideEffects.length} side effects tracked`,
    });
  }

  // Check 4: Rollback availability
  if (execState) {
    checks.push({
      checkId: "post-rollback-available",
      name: "Rollback Available",
      passed: execState.rollbackAvailable,
      severity: "warning",
      detail: execState.rollbackAvailable ? "Rollback possible" : "No rollback available",
    });
  }

  return checks;
}

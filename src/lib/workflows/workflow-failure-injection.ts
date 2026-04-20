// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Failure Injection
// Declares per-family failure injection points for resilience testing
// ═══════════════════════════════════════════════════════════════

import { WORKFLOW_PROOF_REGISTRY, type WorkflowFamilyId } from "./workflow-proof-registry";

export type FaultType = "timeout" | "error" | "partial" | "permission-denied" | "rate-limited" | "network-failure";
export type FaultSeverity = "critical" | "high" | "medium" | "low";

export interface InjectionPoint {
  familyId: WorkflowFamilyId;
  stepId: string;
  faultType: FaultType;
  severity: FaultSeverity;
  description: string;
  expectedBehavior: string;
}

function buildInjectionPoints(): InjectionPoint[] {
  const points: InjectionPoint[] = [];
  for (const family of Object.values(WORKFLOW_PROOF_REGISTRY)) {
    for (const stepId of family.failureInjectionPoints) {
      points.push(
        { familyId: family.familyId, stepId, faultType: "timeout", severity: "high", description: `Timeout at ${stepId}`, expectedBehavior: "Retry or graceful degradation" },
        { familyId: family.familyId, stepId, faultType: "error", severity: "critical", description: `Error at ${stepId}`, expectedBehavior: "Error state transition with evidence" },
        { familyId: family.familyId, stepId, faultType: "partial", severity: "medium", description: `Partial completion at ${stepId}`, expectedBehavior: "Partial state recorded, retry eligible" },
      );
    }
  }
  return points;
}

export const INJECTION_POINTS: InjectionPoint[] = buildInjectionPoints();

export function getInjectionPointsForFamily(familyId: WorkflowFamilyId): InjectionPoint[] {
  return INJECTION_POINTS.filter(p => p.familyId === familyId);
}

export function injectFault(familyId: WorkflowFamilyId, stepId: string, faultType: FaultType): InjectionPoint | null {
  const point = INJECTION_POINTS.find(p => p.familyId === familyId && p.stepId === stepId && p.faultType === faultType);
  if (!point) return null;
  console.warn(`[FAULT-INJECTION] ${faultType} injected at ${familyId}/${stepId}`);
  return point;
}
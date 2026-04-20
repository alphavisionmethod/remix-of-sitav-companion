// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Rollback Map
// Per-family rollback/recovery semantics
// ═══════════════════════════════════════════════════════════════

import { WORKFLOW_PROOF_REGISTRY, WORKFLOW_FAMILY_IDS, type WorkflowFamilyId } from "./workflow-proof-registry";

export interface RollbackEntry {
  familyId: WorkflowFamilyId;
  reversibleSteps: string[];
  irreversibleSteps: string[];
  compensatingActions: Record<string, string>;
  partialRollbackPaths: string[];
  escalationRules: string[];
  runbookRef: string | null;
  auditRequirements: string[];
}

function buildRollbackMap(): Record<WorkflowFamilyId, RollbackEntry> {
  const map = {} as Record<WorkflowFamilyId, RollbackEntry>;
  for (const id of WORKFLOW_FAMILY_IDS) {
    const family = WORKFLOW_PROOF_REGISTRY[id];
    const rs = family.rollbackSemantics;
    map[id] = {
      familyId: id,
      reversibleSteps: rs.reversibleSteps,
      irreversibleSteps: rs.irreversibleSteps,
      compensatingActions: rs.compensatingActions,
      partialRollbackPaths: rs.reversibleSteps.map(s => `${s}→compensate`),
      escalationRules: rs.escalationRules,
      runbookRef: rs.runbookRef,
      auditRequirements: [
        "rollback-event-logged",
        "compensating-action-receipt-emitted",
        "operator-notified-if-escalated",
      ],
    };
  }
  return map;
}

export const WORKFLOW_ROLLBACK_MAP: Record<WorkflowFamilyId, RollbackEntry> = buildRollbackMap();

export function getRollbackEntry(familyId: WorkflowFamilyId): RollbackEntry {
  return WORKFLOW_ROLLBACK_MAP[familyId];
}

export function isStepReversible(familyId: WorkflowFamilyId, stepId: string): boolean {
  return WORKFLOW_ROLLBACK_MAP[familyId].reversibleSteps.includes(stepId);
}

export function getCompensatingAction(familyId: WorkflowFamilyId, stepId: string): string | null {
  return WORKFLOW_ROLLBACK_MAP[familyId].compensatingActions[stepId] ?? null;
}
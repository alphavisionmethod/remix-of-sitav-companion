// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Replay Engine (governance layer)
// Thin governance wrapper — no duplication of core-services engine
// ═══════════════════════════════════════════════════════════════

import { WORKFLOW_PROOF_REGISTRY, type WorkflowFamilyId } from "./workflow-proof-registry";

export interface ReplayDeclaration {
  familyId: WorkflowFamilyId;
  replayable: boolean;
  replaySafetyRules: string[];
  nonReplayablePaths: string[];
  rollbackVsRerunPolicy: "rollback-first" | "rerun-safe" | "manual-only";
  requiresIdempotencyKey: boolean;
}

export const REPLAY_DECLARATIONS: Record<WorkflowFamilyId, ReplayDeclaration> = {
  auth: { familyId: "auth", replayable: false, replaySafetyRules: ["session-tokens-must-be-unique", "no-replay-of-mfa"], nonReplayablePaths: ["auth.signup", "auth.account-delete", "auth.mfa-challenge"], rollbackVsRerunPolicy: "manual-only", requiresIdempotencyKey: false },
  onboarding: { familyId: "onboarding", replayable: true, replaySafetyRules: ["checkpoint-idempotent", "branch-selection-idempotent"], nonReplayablePaths: ["onboard.complete"], rollbackVsRerunPolicy: "rerun-safe", requiresIdempotencyKey: false },
  "app-lifecycle": { familyId: "app-lifecycle", replayable: false, replaySafetyRules: ["install-must-be-unique-per-version"], nonReplayablePaths: ["app.remove"], rollbackVsRerunPolicy: "rollback-first", requiresIdempotencyKey: true },
  advisor: { familyId: "advisor", replayable: false, replaySafetyRules: ["execution-receipts-immutable", "rollback-tokens-single-use"], nonReplayablePaths: ["advisor.execute", "advisor.rollback"], rollbackVsRerunPolicy: "rollback-first", requiresIdempotencyKey: true },
  boardroom: { familyId: "boardroom", replayable: false, replaySafetyRules: ["approval-is-irreversible", "dispatch-single-use"], nonReplayablePaths: ["board.approve", "board.reconcile"], rollbackVsRerunPolicy: "manual-only", requiresIdempotencyKey: true },
  payment: { familyId: "payment", replayable: false, replaySafetyRules: ["no-double-charge", "settlement-irreversible"], nonReplayablePaths: ["pay.settle", "pay.receipt"], rollbackVsRerunPolicy: "rollback-first", requiresIdempotencyKey: true },
  "crm-connector": { familyId: "crm-connector", replayable: true, replaySafetyRules: ["sync-idempotent-via-cursor", "conflict-resolution-logged"], nonReplayablePaths: ["crm.conflict-resolve"], rollbackVsRerunPolicy: "rerun-safe", requiresIdempotencyKey: false },
  file: { familyId: "file", replayable: true, replaySafetyRules: ["upload-deduplication-by-hash", "processing-idempotent"], nonReplayablePaths: ["file.action-trigger"], rollbackVsRerunPolicy: "rerun-safe", requiresIdempotencyKey: false },
  "desktop-recovery": { familyId: "desktop-recovery", replayable: false, replaySafetyRules: ["restart-limit-enforced"], nonReplayablePaths: ["desktop.safe-mode"], rollbackVsRerunPolicy: "manual-only", requiresIdempotencyKey: false },
  "os-recovery": { familyId: "os-recovery", replayable: false, replaySafetyRules: ["boot-sequence-atomic"], nonReplayablePaths: ["os.boot"], rollbackVsRerunPolicy: "manual-only", requiresIdempotencyKey: false },
  "operator-incident": { familyId: "operator-incident", replayable: false, replaySafetyRules: ["kill-switch-audit-immutable"], nonReplayablePaths: ["incident.close"], rollbackVsRerunPolicy: "manual-only", requiresIdempotencyKey: false },
  "support-bundle": { familyId: "support-bundle", replayable: true, replaySafetyRules: ["bundle-regeneration-safe", "redaction-deterministic"], nonReplayablePaths: ["support.escalate"], rollbackVsRerunPolicy: "rerun-safe", requiresIdempotencyKey: false },
};

export function isReplayable(familyId: WorkflowFamilyId): boolean {
  return REPLAY_DECLARATIONS[familyId].replayable;
}

export function getReplayDeclaration(familyId: WorkflowFamilyId): ReplayDeclaration {
  return REPLAY_DECLARATIONS[familyId];
}

export function canReplayStep(familyId: WorkflowFamilyId, stepId: string): boolean {
  const decl = REPLAY_DECLARATIONS[familyId];
  if (!decl.replayable) return false;
  return !decl.nonReplayablePaths.includes(stepId);
}
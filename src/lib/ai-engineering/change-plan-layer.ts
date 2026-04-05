// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Change Plan Layer
// Every AI-proposed change becomes a structured, auditable plan
// with confidence, evidence, rollback strategy, and approval gate
// ═══════════════════════════════════════════════════════════════

import type { AutonomyMode } from "./planning-layer";

export type ChangePlanStatus =
  | "draft"
  | "proposed"
  | "simulated"
  | "approved"
  | "rejected"
  | "applied"
  | "verified"
  | "rolled_back"
  | "failed";

export interface ChangePlan {
  planId: string;
  missionId: string;
  title: string;
  description: string;
  targetFiles: string[];
  targetSurfaces: string[];
  intendedEffect: string;
  affectedServices: string[];
  affectedRoutes: string[];
  confidence: number;
  testsNeeded: string[];
  testResults?: { name: string; passed: boolean; detail: string }[];
  rollbackStrategy: string;
  deploymentScope: "preview" | "staging" | "production";
  evidenceRefs: { type: string; detail: string }[];
  approvalRequired: boolean;
  autonomyMode: AutonomyMode;
  status: ChangePlanStatus;
  proposedByAgent: string;
  reviewedBy?: string;
  reviewNotes?: string;
  appliedAt?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface ChangePlanValidation {
  valid: boolean;
  blockers: string[];
  warnings: string[];
  score: number; // 0-100
}

export class ChangePlanLayer {
  validate(plan: ChangePlan): ChangePlanValidation {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (plan.confidence < 50) blockers.push("Confidence below minimum threshold (50%)");
    if (plan.targetFiles.length === 0) blockers.push("No target files specified");
    if (!plan.rollbackStrategy) blockers.push("No rollback strategy defined");
    if (plan.approvalRequired && plan.status === "draft") warnings.push("Approval required before apply");
    if (plan.testsNeeded.length === 0) warnings.push("No tests defined for verification");
    if (plan.affectedServices.length > 3) warnings.push("High blast radius — affects 4+ services");
    if (plan.deploymentScope === "production" && plan.confidence < 80) blockers.push("Production deploy requires 80%+ confidence");

    const score = Math.max(0, 100 - (blockers.length * 25) - (warnings.length * 10));
    return { valid: blockers.length === 0, blockers, warnings, score };
  }

  canAutoApply(plan: ChangePlan): boolean {
    if (plan.autonomyMode !== "safe_auto_heal") return false;
    if (plan.approvalRequired) return false;
    if (plan.confidence < 85) return false;
    if (plan.affectedServices.length > 1) return false;
    if (plan.deploymentScope === "production") return false;
    return true;
  }

  createChangePlan(
    missionId: string,
    agent: string,
    title: string,
    opts: Partial<ChangePlan> = {}
  ): ChangePlan {
    return {
      planId: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      missionId,
      title,
      description: opts.description ?? "",
      targetFiles: opts.targetFiles ?? [],
      targetSurfaces: opts.targetSurfaces ?? [],
      intendedEffect: opts.intendedEffect ?? "",
      affectedServices: opts.affectedServices ?? [],
      affectedRoutes: opts.affectedRoutes ?? [],
      confidence: opts.confidence ?? 0,
      testsNeeded: opts.testsNeeded ?? [],
      rollbackStrategy: opts.rollbackStrategy ?? "Manual revert",
      deploymentScope: opts.deploymentScope ?? "preview",
      evidenceRefs: opts.evidenceRefs ?? [],
      approvalRequired: opts.approvalRequired ?? true,
      autonomyMode: opts.autonomyMode ?? "approval_required",
      status: "draft",
      proposedByAgent: agent,
      createdAt: new Date().toISOString(),
    };
  }
}

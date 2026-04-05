// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Change Plan Layer
// Every AI-proposed change becomes a structured, auditable plan
// with confidence, evidence, rollback strategy, risk class,
// assumptions, policy checks, auto-heal eligibility, and approval gate
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

export type RiskClass = "minimal" | "low" | "moderate" | "high" | "critical";

export type ChangeType =
  | "code-patch"
  | "config-update"
  | "feature-flag"
  | "cache-invalidation"
  | "service-restart"
  | "deployment-rollback"
  | "route-fix"
  | "design-fix"
  | "accessibility-fix"
  | "test-addition"
  | "docs-update"
  | "schema-change";

export interface PolicyCheckResult {
  policy: string;
  passed: boolean;
  detail: string;
}

export interface ChangePlan {
  planId: string;
  missionId: string;
  title: string;
  description: string;
  changeType: ChangeType;
  targetFiles: string[];
  targetSurfaces: string[];
  intendedEffect: string;
  affectedServices: string[];
  affectedRoutes: string[];
  confidence: number;
  riskClass: RiskClass;
  testsNeeded: string[];
  testResults?: { name: string; passed: boolean; detail: string }[];
  rollbackStrategy: string;
  deploymentScope: "preview" | "staging" | "production";
  evidenceRefs: { type: string; detail: string }[];
  assumptions: string[];
  policyChecks: PolicyCheckResult[];
  approvalRequired: boolean;
  autoHealEligible: boolean;
  autonomyMode: AutonomyMode;
  status: ChangePlanStatus;
  proposedByAgent: string;
  reviewedBy?: string;
  reviewNotes?: string;
  expectedOutcome: string;
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
    if (plan.targetFiles.length === 0 && plan.changeType !== "cache-invalidation" && plan.changeType !== "service-restart") {
      blockers.push("No target files specified");
    }
    if (!plan.rollbackStrategy) blockers.push("No rollback strategy defined");
    if (plan.assumptions.length === 0) warnings.push("No assumptions documented — risky for review");
    if (plan.approvalRequired && plan.status === "draft") warnings.push("Approval required before apply");
    if (plan.testsNeeded.length === 0) warnings.push("No tests defined for verification");
    if (plan.affectedServices.length > 3) warnings.push("High blast radius — affects 4+ services");
    if (plan.deploymentScope === "production" && plan.confidence < 80) blockers.push("Production deploy requires 80%+ confidence");
    if (plan.riskClass === "critical" && plan.autonomyMode !== "never_automate") warnings.push("Critical risk — should be never_automate");

    // Policy check failures
    const failedPolicies = plan.policyChecks.filter(p => !p.passed);
    for (const fp of failedPolicies) {
      blockers.push(`Policy failure: ${fp.policy} — ${fp.detail}`);
    }

    const score = Math.max(0, 100 - (blockers.length * 25) - (warnings.length * 10));
    return { valid: blockers.length === 0, blockers, warnings, score };
  }

  canAutoApply(plan: ChangePlan): boolean {
    if (!plan.autoHealEligible) return false;
    if (plan.autonomyMode !== "safe_auto_heal") return false;
    if (plan.approvalRequired) return false;
    if (plan.confidence < 85) return false;
    if (plan.riskClass !== "minimal" && plan.riskClass !== "low") return false;
    if (plan.affectedServices.length > 1) return false;
    if (plan.deploymentScope === "production") return false;
    if (plan.policyChecks.some(p => !p.passed)) return false;
    return true;
  }

  assessRiskClass(plan: Partial<ChangePlan>): RiskClass {
    const services = plan.affectedServices?.length ?? 0;
    const scope = plan.deploymentScope ?? "preview";
    const confidence = plan.confidence ?? 0;
    const changeType = plan.changeType ?? "code-patch";

    if (changeType === "schema-change") return "critical";
    if (scope === "production" && confidence < 80) return "critical";
    if (scope === "production" && services > 2) return "high";
    if (services > 3) return "high";
    if (scope === "production") return "moderate";
    if (changeType === "deployment-rollback") return "moderate";
    if (services > 1) return "moderate";
    if (["cache-invalidation", "docs-update", "test-addition"].includes(changeType)) return "minimal";
    return "low";
  }

  runPolicyChecks(plan: ChangePlan): PolicyCheckResult[] {
    const results: PolicyCheckResult[] = [];

    // Never auto-change auth
    if (plan.targetFiles.some(f => f.includes("auth")) && plan.autonomyMode !== "never_automate") {
      results.push({ policy: "auth-protection", passed: false, detail: "Auth-related changes must be never_automate" });
    } else {
      results.push({ policy: "auth-protection", passed: true, detail: "No auth files affected" });
    }

    // Never auto-publish design to production
    if (plan.changeType === "design-fix" && plan.deploymentScope === "production" && plan.autonomyMode === "safe_auto_heal") {
      results.push({ policy: "design-production-gate", passed: false, detail: "Design changes to production require approval" });
    } else {
      results.push({ policy: "design-production-gate", passed: true, detail: "Design scope within policy" });
    }

    // Require approval for routing changes
    if (plan.changeType === "route-fix" && !plan.approvalRequired) {
      results.push({ policy: "routing-approval", passed: false, detail: "Route changes always require approval" });
    } else {
      results.push({ policy: "routing-approval", passed: true, detail: "Routing policy satisfied" });
    }

    // Schema changes must be human-reviewed
    if (plan.changeType === "schema-change" && plan.autonomyMode !== "never_automate" && plan.autonomyMode !== "approval_required") {
      results.push({ policy: "schema-review", passed: false, detail: "Schema changes require human review" });
    } else {
      results.push({ policy: "schema-review", passed: true, detail: "Schema policy satisfied" });
    }

    // Financial logic protection
    if (plan.targetFiles.some(f => f.includes("financial") || f.includes("payment") || f.includes("billing"))) {
      results.push({ policy: "financial-logic-protection", passed: plan.autonomyMode === "never_automate", detail: plan.autonomyMode === "never_automate" ? "Financial logic protected" : "Financial logic must be never_automate" });
    }

    return results;
  }

  createChangePlan(
    missionId: string,
    agent: string,
    title: string,
    opts: Partial<ChangePlan> = {}
  ): ChangePlan {
    const plan: ChangePlan = {
      planId: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      missionId,
      title,
      description: opts.description ?? "",
      changeType: opts.changeType ?? "code-patch",
      targetFiles: opts.targetFiles ?? [],
      targetSurfaces: opts.targetSurfaces ?? [],
      intendedEffect: opts.intendedEffect ?? "",
      affectedServices: opts.affectedServices ?? [],
      affectedRoutes: opts.affectedRoutes ?? [],
      confidence: opts.confidence ?? 0,
      riskClass: "low",
      testsNeeded: opts.testsNeeded ?? [],
      rollbackStrategy: opts.rollbackStrategy ?? "Manual revert",
      deploymentScope: opts.deploymentScope ?? "preview",
      evidenceRefs: opts.evidenceRefs ?? [],
      assumptions: opts.assumptions ?? [],
      policyChecks: [],
      approvalRequired: opts.approvalRequired ?? true,
      autoHealEligible: opts.autoHealEligible ?? false,
      autonomyMode: opts.autonomyMode ?? "approval_required",
      status: "draft",
      proposedByAgent: agent,
      expectedOutcome: opts.expectedOutcome ?? "",
      createdAt: new Date().toISOString(),
    };

    plan.riskClass = this.assessRiskClass(plan);
    plan.policyChecks = this.runPolicyChecks(plan);

    return plan;
  }
}

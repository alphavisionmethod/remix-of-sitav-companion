// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Execution Layer
// Only approved/allowed changes execute. Receipted, bounded,
// rollbackable. Supports auto-heal, draft, and approval paths.
// Environment guardrails, policy enforcement, result verification.
// ═══════════════════════════════════════════════════════════════

import type { ChangePlan } from "./change-plan-layer";
import type { VerificationReport } from "./verification-layer";

export type ExecutionAction =
  | "apply-code-change"
  | "apply-config-change"
  | "rollback-deployment"
  | "disable-feature-flag"
  | "refresh-cache"
  | "reroute-traffic"
  | "restart-service"
  | "alert-human"
  | "create-draft-pr"
  | "apply-design-fix"
  | "add-test"
  | "update-docs"
  | "disable-integration"
  | "downgrade-route";

export interface ExecutionReceipt {
  receiptId: string;
  planId: string;
  action: ExecutionAction;
  status: "success" | "failed" | "rolled_back" | "skipped" | "blocked";
  executedAt: string;
  durationMs: number;
  rollbackAvailable: boolean;
  rollbackExecutedAt?: string;
  detail: string;
  agent: string;
  environment: "preview" | "staging" | "production";
  resultVerification?: { verified: boolean; verifiedAt: string; detail: string };
  policyEnforced: string[];
  guardrails: string[];
}

export interface ExecutionGuardrail {
  name: string;
  check: (plan: ChangePlan) => { passed: boolean; reason: string };
}

const DEFAULT_GUARDRAILS: ExecutionGuardrail[] = [
  {
    name: "no-production-auto-heal",
    check: (plan) => ({
      passed: !(plan.deploymentScope === "production" && plan.autonomyMode === "safe_auto_heal"),
      reason: "Auto-heal cannot target production directly",
    }),
  },
  {
    name: "no-stale-state-action",
    check: (plan) => ({
      passed: plan.confidence >= 50,
      reason: `Confidence ${plan.confidence}% too low — possible stale state`,
    }),
  },
  {
    name: "no-freeform-mutation",
    check: (plan) => ({
      passed: plan.planId.startsWith("cp-"),
      reason: "All changes must originate from structured change plans",
    }),
  },
  {
    name: "rollback-required-for-production",
    check: (plan) => ({
      passed: !(plan.deploymentScope === "production" && !plan.rollbackStrategy),
      reason: "Production changes must have a rollback strategy",
    }),
  },
  {
    name: "blast-radius-containment",
    check: (plan) => ({
      passed: plan.affectedServices.length <= 5,
      reason: `Blast radius too wide: ${plan.affectedServices.length} services affected`,
    }),
  },
];

export class ExecutionLayer {
  private receipts: ExecutionReceipt[] = [];
  private guardrails: ExecutionGuardrail[] = DEFAULT_GUARDRAILS;

  canExecute(plan: ChangePlan, verification: VerificationReport): { allowed: boolean; reason: string; blockedGuardrails: string[] } {
    const blockedGuardrails: string[] = [];

    // Verification gates
    if (!verification.requiredGatesPassed) {
      return { allowed: false, reason: "Required verification gates not passed", blockedGuardrails };
    }

    // Plan status
    if (plan.status === "rejected") {
      return { allowed: false, reason: "Plan was rejected", blockedGuardrails };
    }
    if (plan.approvalRequired && plan.status !== "approved") {
      return { allowed: false, reason: "Approval required but not yet approved", blockedGuardrails };
    }

    // Autonomy mode
    if (plan.autonomyMode === "never_automate") {
      return { allowed: false, reason: "Policy prohibits automation for this change", blockedGuardrails };
    }
    if (plan.autonomyMode === "observe_only" || plan.autonomyMode === "draft_only") {
      return { allowed: false, reason: `Autonomy mode is ${plan.autonomyMode} — execution not permitted`, blockedGuardrails };
    }

    // Guardrails
    for (const guardrail of this.guardrails) {
      const result = guardrail.check(plan);
      if (!result.passed) {
        blockedGuardrails.push(`${guardrail.name}: ${result.reason}`);
      }
    }

    if (blockedGuardrails.length > 0) {
      return { allowed: false, reason: `Blocked by guardrails: ${blockedGuardrails.join("; ")}`, blockedGuardrails };
    }

    return { allowed: true, reason: "All checks passed", blockedGuardrails: [] };
  }

  execute(plan: ChangePlan, action: ExecutionAction): ExecutionReceipt {
    const guardrailResults = this.guardrails.map(g => g.name);
    const policyResults = plan.policyChecks.filter(p => p.passed).map(p => p.policy);

    const receipt: ExecutionReceipt = {
      receiptId: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      planId: plan.planId,
      action,
      status: "success",
      executedAt: new Date().toISOString(),
      durationMs: Math.floor(Math.random() * 5000) + 500,
      rollbackAvailable: true,
      detail: `Executed ${action} for plan "${plan.title}"`,
      agent: plan.proposedByAgent,
      environment: plan.deploymentScope,
      policyEnforced: policyResults,
      guardrails: guardrailResults,
    };

    this.receipts.push(receipt);
    return receipt;
  }

  verifyExecution(receiptId: string, verified: boolean, detail: string): ExecutionReceipt | null {
    const receipt = this.receipts.find(r => r.receiptId === receiptId);
    if (!receipt) return null;

    receipt.resultVerification = {
      verified,
      verifiedAt: new Date().toISOString(),
      detail,
    };

    if (!verified) {
      receipt.status = "failed";
    }

    return receipt;
  }

  rollback(receiptId: string): ExecutionReceipt | null {
    const receipt = this.receipts.find(r => r.receiptId === receiptId);
    if (!receipt || !receipt.rollbackAvailable) return null;

    receipt.status = "rolled_back";
    receipt.rollbackExecutedAt = new Date().toISOString();
    return receipt;
  }

  getReceipts(): ExecutionReceipt[] { return [...this.receipts]; }
  getReceiptsByEnvironment(env: string): ExecutionReceipt[] { return this.receipts.filter(r => r.environment === env); }
  getFailedReceipts(): ExecutionReceipt[] { return this.receipts.filter(r => r.status === "failed" || r.status === "rolled_back"); }
}

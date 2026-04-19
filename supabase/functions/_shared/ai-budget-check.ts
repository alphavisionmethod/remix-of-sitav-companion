/**
 * SITA OS — Canonical AI Budget Check
 * Wraps check_ai_budget_policies RPC for consistent budget enforcement.
 *
 * As of Economic Governance closure: ALSO calls check_user_hard_ceiling
 * BEFORE the class-based RPC (defense in depth).
 *
 * Modes:
 *   default → fail-OPEN on RPC error (legacy callers; logs structured warning).
 *   strict  → fail-CLOSED on RPC error (gateway choke points). Returns
 *             { allowed: false, reason: "enforcement_unavailable" }.
 */

export interface BudgetDecision {
  allowed: boolean;
  shouldDowngrade: boolean;
  shouldBlock: boolean;
  fallbackModelId: string | null;
  reason: string;
  policyKey: string | null;
  pct: number | null;
  alertState: string | null;
  premiumBlocked: boolean;
  /** New (Economic Governance closure) — per-user ceiling state */
  userCeiling?: {
    dailyPct: number;
    monthlyPct: number;
    callsPct: number;
    capExceeded: boolean;
    capKind?: "daily_cost" | "monthly_cost" | "daily_calls";
    resetsAt?: string;
  };
}

export interface CheckAIBudgetOptions {
  /** When true, fail-CLOSED on RPC error (deny request). Default false. */
  strict?: boolean;
}

function warn(payload: Record<string, unknown>): void {
  try {
    console.warn(`[ai-budget-check] ${JSON.stringify(payload)}`);
  } catch {
    console.warn("[ai-budget-check] warn-log-failure");
  }
}

/**
 * Writes a budget decision receipt — append-only audit trail.
 * Best-effort: never throws; receipt failure must not block enforcement.
 */
async function writeDecisionReceipt(
  serviceClient: any,
  params: {
    userId: string;
    capabilityKey: string;
    decision: "allow" | "degrade" | "block";
    reason: string;
    policyRule: string;
    estimatedCostCents: number;
    fallbackModelId: string | null;
    dailyPct: number | null;
    monthlyPct: number | null;
    preCheckState: Record<string, unknown>;
    correlationId?: string;
  },
): Promise<void> {
  try {
    await serviceClient.from("ai_budget_decision_receipts").insert({
      user_id: params.userId,
      capability_key: params.capabilityKey,
      decision: params.decision,
      reason: params.reason,
      policy_rule: params.policyRule,
      cost_estimate_cents: params.estimatedCostCents,
      fallback_model_id: params.fallbackModelId,
      daily_pct: params.dailyPct,
      monthly_pct: params.monthlyPct,
      pre_check_state: params.preCheckState,
      correlation_id: params.correlationId ?? null,
    });
  } catch (e) {
    warn({
      kind: "receipt_write_failed",
      capability_key: params.capabilityKey,
      decision: params.decision,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function checkAIBudget(
  serviceClient: any,
  userId: string,
  capabilityKey: string,
  estimatedCostUsd: number = 0.01,
  options: CheckAIBudgetOptions = {},
): Promise<BudgetDecision> {
  const strict = options.strict === true;
  const estimatedCostCents = Math.max(0, Math.round(estimatedCostUsd * 100));

  // ── PHASE 1: Per-user hard ceiling (defense in depth) ─────────
  let ceilingDecision: any = null;
  try {
    const { data, error } = await serviceClient.rpc("check_user_hard_ceiling", {
      p_user_id: userId,
      p_estimated_cost_cents: estimatedCostCents,
    });
    if (error) {
      warn({ kind: "ceiling_rpc_error", error: error.message ?? String(error) });
    } else {
      ceilingDecision = data ?? null;
    }
  } catch (e) {
    warn({ kind: "ceiling_exception", error: e instanceof Error ? e.message : String(e) });
  }

  if (ceilingDecision && ceilingDecision.allowed === false) {
    // Hard block — write receipt & deny
    const reason = String(ceilingDecision.reason ?? "user_hard_ceiling_exceeded");
    await writeDecisionReceipt(serviceClient, {
      userId,
      capabilityKey,
      decision: "block",
      reason,
      policyRule: "user_hard_ceiling",
      estimatedCostCents,
      fallbackModelId: ceilingDecision.fallback_model_id ?? null,
      dailyPct: ceilingDecision.daily_pct ?? null,
      monthlyPct: ceilingDecision.monthly_pct ?? null,
      preCheckState: ceilingDecision,
    });
    return {
      allowed: false,
      shouldDowngrade: false,
      shouldBlock: true,
      fallbackModelId: ceilingDecision.fallback_model_id ?? null,
      reason,
      policyKey: "user_hard_ceiling",
      pct: ceilingDecision.daily_pct ?? null,
      alertState: "critical",
      premiumBlocked: false,
      userCeiling: {
        dailyPct: ceilingDecision.daily_pct ?? 0,
        monthlyPct: ceilingDecision.monthly_pct ?? 0,
        callsPct: ceilingDecision.calls_pct ?? 0,
        capExceeded: true,
        capKind: reason.includes("daily_cost")
          ? "daily_cost"
          : reason.includes("monthly_cost")
            ? "monthly_cost"
            : "daily_calls",
        resetsAt: ceilingDecision.daily_resets_at ?? ceilingDecision.monthly_resets_at,
      },
    };
  }

  const ceilingShouldDegrade = !!(ceilingDecision && ceilingDecision.should_degrade === true);
  const ceilingFallbackModel = ceilingDecision?.fallback_model_id ?? null;

  // ── PHASE 2: Existing class-based policy check ────────────────
  try {
    const { data, error } = await serviceClient.rpc("check_ai_budget_policies", {
      p_user_id: userId,
      p_capability_key: capabilityKey,
      p_estimated_cost_usd: estimatedCostUsd,
    });

    if (error) {
      warn({
        kind: "rpc_error",
        capability_key: capabilityKey,
        estimated_cost_usd: estimatedCostUsd,
        strict,
        error: error.message ?? String(error),
      });
      if (strict) {
        await writeDecisionReceipt(serviceClient, {
          userId,
          capabilityKey,
          decision: "block",
          reason: "enforcement_unavailable",
          policyRule: "class_policy_rpc_error",
          estimatedCostCents,
          fallbackModelId: null,
          dailyPct: ceilingDecision?.daily_pct ?? null,
          monthlyPct: ceilingDecision?.monthly_pct ?? null,
          preCheckState: { rpc_error: true },
        });
        return {
          allowed: false,
          shouldDowngrade: false,
          shouldBlock: true,
          fallbackModelId: null,
          reason: "enforcement_unavailable",
          policyKey: null,
          pct: null,
          alertState: "critical",
          premiumBlocked: false,
        };
      }
      return {
        allowed: true,
        shouldDowngrade: ceilingShouldDegrade,
        shouldBlock: false,
        fallbackModelId: ceilingShouldDegrade ? ceilingFallbackModel : null,
        reason: "policy_check_error",
        policyKey: null,
        pct: null,
        alertState: null,
        premiumBlocked: false,
      };
    }

    const result = (data ?? {}) as Record<string, unknown>;
    const classShouldBlock = (result.should_block as boolean) ?? false;
    const classShouldDowngrade = (result.should_downgrade as boolean) ?? false;
    const finalShouldDowngrade = classShouldDowngrade || ceilingShouldDegrade;
    const fallbackModelId = (result.fallback_model_id as string)
      ?? (ceilingShouldDegrade ? ceilingFallbackModel : null)
      ?? null;
    const allowed = ((result.allowed as boolean) ?? true) && !classShouldBlock;

    // Write decision receipt
    const decision: "allow" | "degrade" | "block" = classShouldBlock
      ? "block"
      : finalShouldDowngrade
        ? "degrade"
        : "allow";
    await writeDecisionReceipt(serviceClient, {
      userId,
      capabilityKey,
      decision,
      reason: (result.reason as string) ?? (ceilingShouldDegrade ? "approaching_ceiling_80pct" : "within_ceiling"),
      policyRule: classShouldBlock ? "class_policy_block" : ceilingShouldDegrade ? "user_ceiling_degrade" : "class_policy_allow",
      estimatedCostCents,
      fallbackModelId,
      dailyPct: ceilingDecision?.daily_pct ?? null,
      monthlyPct: ceilingDecision?.monthly_pct ?? null,
      preCheckState: { class: result, ceiling: ceilingDecision },
    });

    return {
      allowed,
      shouldDowngrade: finalShouldDowngrade,
      shouldBlock: classShouldBlock,
      fallbackModelId,
      reason: (result.reason as string) ?? "no_policy",
      policyKey: (result.policy_key as string) ?? null,
      pct: (result.pct as number) ?? null,
      alertState: (result.alert_state as string) ?? null,
      premiumBlocked: (result.premium_blocked as boolean) ?? false,
      userCeiling: ceilingDecision
        ? {
            dailyPct: ceilingDecision.daily_pct ?? 0,
            monthlyPct: ceilingDecision.monthly_pct ?? 0,
            callsPct: ceilingDecision.calls_pct ?? 0,
            capExceeded: false,
          }
        : undefined,
    };
  } catch (e) {
    warn({
      kind: "exception",
      capability_key: capabilityKey,
      estimated_cost_usd: estimatedCostUsd,
      strict,
      error: e instanceof Error ? e.message : String(e),
    });
    if (strict) {
      return {
        allowed: false,
        shouldDowngrade: false,
        shouldBlock: true,
        fallbackModelId: null,
        reason: "enforcement_unavailable",
        policyKey: null,
        pct: null,
        alertState: "critical",
        premiumBlocked: false,
      };
    }
    return {
      allowed: true,
      shouldDowngrade: false,
      shouldBlock: false,
      fallbackModelId: null,
      reason: "enforcement_error",
      policyKey: null,
      pct: null,
      alertState: null,
      premiumBlocked: false,
    };
  }
}

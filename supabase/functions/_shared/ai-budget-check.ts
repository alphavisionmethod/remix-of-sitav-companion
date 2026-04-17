/**
 * SITA OS — Canonical AI Budget Check
 * Wraps check_ai_budget_policies RPC for consistent budget enforcement.
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
}

export interface CheckAIBudgetOptions {
  /** When true, fail-CLOSED on RPC error (deny request). Default false. */
  strict?: boolean;
}

function warn(payload: Record<string, unknown>): void {
  // Single structured line so log search filters can find it
  try {
    console.warn(`[ai-budget-check] ${JSON.stringify(payload)}`);
  } catch {
    console.warn("[ai-budget-check] warn-log-failure");
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
        reason: "policy_check_error",
        policyKey: null,
        pct: null,
        alertState: null,
        premiumBlocked: false,
      };
    }

    const result = (data ?? {}) as Record<string, unknown>;
    return {
      allowed: (result.allowed as boolean) ?? true,
      shouldDowngrade: (result.should_downgrade as boolean) ?? false,
      shouldBlock: (result.should_block as boolean) ?? false,
      fallbackModelId: (result.fallback_model_id as string) ?? null,
      reason: (result.reason as string) ?? "no_policy",
      policyKey: (result.policy_key as string) ?? null,
      pct: (result.pct as number) ?? null,
      alertState: (result.alert_state as string) ?? null,
      premiumBlocked: (result.premium_blocked as boolean) ?? false,
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

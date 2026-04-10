/**
 * SITA OS — Canonical AI Budget Check
 * Wraps check_ai_budget_policies RPC for consistent budget enforcement.
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

/**
 * Check AI budget policies before making an AI call.
 * Fails open (returns allowed=true) on RPC errors.
 */
export async function checkAIBudget(
  serviceClient: any,
  userId: string,
  capabilityKey: string,
  estimatedCostUsd: number = 0.01
): Promise<BudgetDecision> {
  try {
    const { data, error } = await serviceClient.rpc("check_ai_budget_policies", {
      p_user_id: userId,
      p_capability_key: capabilityKey,
      p_estimated_cost_usd: estimatedCostUsd,
    });

    if (error) {
      console.error("Budget policy check error:", error);
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

    const result = data as Record<string, unknown>;
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
    console.error("Budget check error:", e);
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

// ═══════════════════════════════════════════════════════════════
// SITA OS — Client-Side Budget Gate
// Enforces AI budget before any invocation reaches the gateway.
// Calls the check-ai-budget edge function for real-time policy check.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface BudgetGateResult {
  allowed: boolean;
  shouldDowngrade: boolean;
  shouldBlock: boolean;
  fallbackModelId: string | null;
  reason: string;
  policyKey: string | null;
  alertState: "ok" | "warning" | "critical" | null;
  premiumBlocked: boolean;
}

const DEFAULT_ALLOW: BudgetGateResult = {
  allowed: true,
  shouldDowngrade: false,
  shouldBlock: false,
  fallbackModelId: null,
  reason: "no_policy",
  policyKey: null,
  alertState: "ok",
  premiumBlocked: false,
};

/**
 * Check budget policies before an AI invocation.
 * Returns allow/deny/downgrade decision from the edge function.
 *
 * @example
 * const gate = await enforceAIBudget("advisor-chat", 0.05);
 * if (!gate.allowed) { showBudgetExceeded(gate.reason); return; }
 * if (gate.shouldDowngrade && gate.fallbackModelId) { useModel(gate.fallbackModelId); }
 */
export async function enforceAIBudget(
  capabilityKey: string,
  estimatedCostUsd: number,
): Promise<BudgetGateResult> {
  try {
    const { data, error } = await supabase.functions.invoke("check-ai-budget", {
      body: { capability_key: capabilityKey, estimated_cost_usd: estimatedCostUsd },
    });

    if (error) {
      // On edge function error, fail-open to avoid blocking users
      console.warn("[BudgetGate] Edge function error, failing open:", error.message);
      return DEFAULT_ALLOW;
    }

    if (!data || typeof data !== "object") return DEFAULT_ALLOW;

    return {
      allowed: data.allowed !== false,
      shouldDowngrade: data.should_downgrade === true,
      shouldBlock: data.should_block === true,
      fallbackModelId: data.fallback_model_id ?? null,
      reason: data.reason ?? "unknown",
      policyKey: data.policy_key ?? null,
      alertState: data.alert_state ?? "ok",
      premiumBlocked: data.premium_blocked === true,
    };
  } catch (err) {
    console.warn("[BudgetGate] Network error, failing open:", err);
    return DEFAULT_ALLOW;
  }
}

/**
 * Quick check if premium reasoning is allowed for the current user.
 * Uses a small estimated cost for Class C/D tasks.
 */
export async function canUsePremiumReasoning(capabilityKey: string): Promise<boolean> {
  const result = await enforceAIBudget(capabilityKey, 0.10);
  return result.allowed && !result.premiumBlocked;
}

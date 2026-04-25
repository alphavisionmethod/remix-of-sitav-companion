// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Budgets + Circuit Breakers (Phase 3)
// Per-advisor token + $ caps. Read-only helpers; the controller
// consults `checkAdvisorBudget()` during dry-run and trips the
// breaker via `tripCircuitBreakerForBudget()` when limits exceed.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { CIRCUIT_OPEN_DURATION_MS } from "./state-machine";

export type BudgetState = {
  advisorId: string;
  /** Daily token budget configured on advisor_agents. */
  dailyTokenBudget: number;
  tokensUsedToday: number;
  tokenPctUsed: number;
  /** Hourly invocation cap. */
  hourlyInvocationCap: number;
  invocationsToday: number;
  /** Sum of plan.financial_impact_cents for queued/executed actions today. */
  financialSpentTodayCents: number;
  /** Per-action max from advisor_autonomy_policies.max_financial_impact_cents. */
  financialActionCapCents: number;
};

export type BudgetCheck =
  | { ok: true; reason: "within_budget" }
  | { ok: false; reason: BudgetExceededReason; state: BudgetState };

export type BudgetExceededReason =
  | "daily_token_budget_exceeded"
  | "hourly_invocation_cap_exceeded"
  | "per_action_financial_cap_exceeded"
  | "daily_financial_spend_exceeded";

/** Hard ceiling for daily $ spend per advisor (in cents). Mirrors L3 caution. */
export const DEFAULT_DAILY_FINANCIAL_CEILING_CENTS = 500_00; // $500

/** Pure decision helper — exported for tests. */
export function decideBudget(
  state: BudgetState,
  estimatedTokenCost: number,
  estimatedFinancialImpactCents: number,
  dailyFinancialCeilingCents: number = DEFAULT_DAILY_FINANCIAL_CEILING_CENTS,
): BudgetCheck {
  if (state.dailyTokenBudget > 0 && state.tokensUsedToday + estimatedTokenCost > state.dailyTokenBudget) {
    return { ok: false, reason: "daily_token_budget_exceeded", state };
  }
  // Hourly invocation: rough proxy — if today's count already at the
  // configured hourly cap × 24 (i.e. saturated for the day), trip.
  if (state.hourlyInvocationCap > 0 && state.invocationsToday >= state.hourlyInvocationCap * 24) {
    return { ok: false, reason: "hourly_invocation_cap_exceeded", state };
  }
  if (
    estimatedFinancialImpactCents > 0 &&
    state.financialActionCapCents > 0 &&
    estimatedFinancialImpactCents > state.financialActionCapCents
  ) {
    return { ok: false, reason: "per_action_financial_cap_exceeded", state };
  }
  if (
    estimatedFinancialImpactCents > 0 &&
    state.financialSpentTodayCents + estimatedFinancialImpactCents > dailyFinancialCeilingCents
  ) {
    return { ok: false, reason: "daily_financial_spend_exceeded", state };
  }
  return { ok: true, reason: "within_budget" };
}

/** Fetch live budget state for an advisor. */
export async function fetchBudgetState(
  userId: string,
  advisorId: string,
  domain: string,
): Promise<BudgetState | null> {
  const [{ data: agent }, { data: policy }, { data: spendRows }] = await Promise.all([
    supabase
      .from("advisor_agents")
      .select("budget_daily_tokens, tokens_used_today, invocations_today, max_invocations_per_hour")
      .eq("user_id", userId)
      .eq("advisor_id", advisorId)
      .maybeSingle(),
    supabase
      .from("advisor_autonomy_policies")
      .select("max_financial_impact_cents")
      .eq("user_id", userId)
      .eq("domain", domain)
      .maybeSingle(),
    supabase
      .from("advisor_action_queue")
      .select("payload, status, created_at")
      .eq("user_id", userId)
      .eq("advisor_id", advisorId)
      .gt("created_at", new Date(Date.now() - 86400_000).toISOString())
      .in("status", ["approved", "executed", "awaiting_approval"]),
  ]);

  const dailyTokenBudget = agent?.budget_daily_tokens ?? 0;
  const tokensUsedToday = agent?.tokens_used_today ?? 0;
  const tokenPctUsed = dailyTokenBudget > 0 ? tokensUsedToday / dailyTokenBudget : 0;

  const financialSpentTodayCents = (spendRows ?? []).reduce((sum, row) => {
    const p = (row.payload ?? {}) as { financial_impact_cents?: number };
    return sum + (typeof p.financial_impact_cents === "number" ? p.financial_impact_cents : 0);
  }, 0);

  return {
    advisorId,
    dailyTokenBudget,
    tokensUsedToday,
    tokenPctUsed,
    hourlyInvocationCap: agent?.max_invocations_per_hour ?? 0,
    invocationsToday: agent?.invocations_today ?? 0,
    financialSpentTodayCents,
    financialActionCapCents: policy?.max_financial_impact_cents ?? 0,
  };
}

/** Trip the breaker for budget overages — separate path from generic failures. */
export async function tripCircuitBreakerForBudget(
  userId: string,
  advisorId: string,
  reason: BudgetExceededReason,
): Promise<void> {
  await supabase
    .from("advisor_autonomy_state")
    .update({
      current_state: "circuit_open",
      circuit_open_until: new Date(Date.now() + CIRCUIT_OPEN_DURATION_MS).toISOString(),
      last_state_change_at: new Date().toISOString(),
      metadata: { breaker_reason: reason, tripped_at: new Date().toISOString() } as never,
    })
    .eq("user_id", userId)
    .eq("advisor_id", advisorId);
}

/** Estimate token cost for a plan. Conservative default — refined as model usage instruments. */
export function estimatePlanTokenCost(): number {
  // Conservative single-shot proposal: ~2k tokens (1k in + 1k out for a draft).
  return 2_000;
}
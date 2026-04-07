// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Cost Governance Service
// Tracks AI token usage, cost per capability, budget enforcement
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface CostRecord {
  model: string;
  provider: string;
  purpose: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
}

export interface CostSummary {
  totalCostCents: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byModel: Record<string, number>;
  byPurpose: Record<string, number>;
  recordCount: number;
}

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Record an AI inference cost */
export async function recordAICost(record: CostRecord): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;

  const { error } = await fromTable("ai_cost_ledger").insert({
    user_id: userId,
    model: record.model,
    provider: record.provider,
    purpose: record.purpose,
    input_tokens: record.inputTokens,
    output_tokens: record.outputTokens,
    cost_cents: record.costCents,
  });

  if (error) { console.error("[cost-governance] insert failed:", error); return false; }
  return true;
}

/** Get cost summary for a period */
export async function getCostSummary(sinceDays = 30): Promise<CostSummary> {
  const userId = await uid();
  if (!userId) return { totalCostCents: 0, totalInputTokens: 0, totalOutputTokens: 0, byModel: {}, byPurpose: {}, recordCount: 0 };

  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  const { data, error } = await fromTable("ai_cost_ledger")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) return { totalCostCents: 0, totalInputTokens: 0, totalOutputTokens: 0, byModel: {}, byPurpose: {}, recordCount: 0 };

  const byModel: Record<string, number> = {};
  const byPurpose: Record<string, number> = {};
  let totalCostCents = 0, totalInputTokens = 0, totalOutputTokens = 0;

  for (const r of data) {
    totalCostCents += r.cost_cents ?? 0;
    totalInputTokens += r.input_tokens ?? 0;
    totalOutputTokens += r.output_tokens ?? 0;
    byModel[r.model] = (byModel[r.model] ?? 0) + (r.cost_cents ?? 0);
    if (r.purpose) byPurpose[r.purpose] = (byPurpose[r.purpose] ?? 0) + (r.cost_cents ?? 0);
  }

  return { totalCostCents, totalInputTokens, totalOutputTokens, byModel, byPurpose, recordCount: data.length };
}

/** Check if a request is within budget */
export async function checkBudget(estimatedCostCents: number): Promise<{ allowed: boolean; reason?: string }> {
  const userId = await uid();
  if (!userId) return { allowed: false, reason: "not_authenticated" };

  const { data } = await (supabase as Record<string, unknown>).rpc("update_ai_budget_usage", {
    p_user_id: userId,
    p_tokens: 0,
    p_cost: estimatedCostCents,
  });

  if (!data) return { allowed: true, reason: "no_budget_set" };
  return { allowed: data.allowed, reason: data.reason };
}

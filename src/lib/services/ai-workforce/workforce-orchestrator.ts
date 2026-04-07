// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Workforce Orchestrator
// DB-backed role invocation, cost tracking, cache, approvals
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface WorkforceRole {
  id: string;
  role_key: string;
  display_name: string;
  purpose: string;
  default_model_tier: string;
  budget_class: string;
  max_autonomy: string;
  approval_required: boolean;
  launch_stage: string;
  is_active: boolean;
  total_invocations: number;
  total_cost_cents: number;
}

export interface WorkforceInvocationRequest {
  role_key: string;
  task_type: string;
  capability_key?: string;
  input_summary: string;
  budget_class?: string;
  mode?: string;
}

export interface WorkforceInvocation {
  id: string;
  role_key: string;
  task_type: string;
  status: string;
  output_summary: string | null;
  output_data: Record<string, unknown> | null;
  cost_cents: number;
  tokens_used: number;
  latency_ms: number | null;
  fallback_occurred: boolean;
  created_at: string;
  completed_at: string | null;
}

// ── Role Registry ──
export async function getWorkforceRoles(): Promise<WorkforceRole[]> {
  const { data, error } = await supabase
    .from("ai_workforce_roles")
    .select("*")
    .order("role_key");

  if (error) {
    console.error("[Workforce] Roles error:", error);
    return [];
  }
  return (data ?? []) as never as WorkforceRole[];
}

// ── Invocations ──
export async function getRecentInvocations(limit = 50): Promise<WorkforceInvocation[]> {
  const { data, error } = await supabase
    .from("ai_workforce_invocations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Workforce] Invocations error:", error);
    return [];
  }
  return (data ?? []) as never as WorkforceInvocation[];
}

export async function createInvocation(
  userId: string,
  req: WorkforceInvocationRequest
): Promise<string | null> {
  const { data, error } = await supabase
    .from("ai_workforce_invocations")
    .insert({
      user_id: userId,
      role_key: req.role_key,
      task_type: req.task_type,
      capability_key: req.capability_key,
      input_summary: req.input_summary,
      budget_class: req.budget_class ?? "economy_admin",
      mode: req.mode ?? "real",
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Workforce] Create invocation error:", error);
    return null;
  }
  return data?.id ?? null;
}

// ── Recommendations ──
export async function getRecommendations(status?: string) {
  let query = supabase
    .from("ai_workforce_recommendations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[Workforce] Recommendations error:", error);
    return [];
  }
  return data ?? [];
}

// ── Approval Queue ──
export async function getApprovalQueue(status = "pending") {
  const { data, error } = await supabase
    .from("ai_workforce_approval_queue")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Workforce] Approval queue error:", error);
    return [];
  }
  return data ?? [];
}

// ── Cached Outputs ──
export async function getCachedOutput(cacheKey: string) {
  const { data, error } = await supabase
    .from("ai_workforce_cached_outputs")
    .select("*")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
}

// ── Workforce Stats ──
export async function getWorkforceStats() {
  const [roles, invocations] = await Promise.all([
    getWorkforceRoles(),
    getRecentInvocations(500),
  ]);

  const activeRoles = roles.filter(r => r.is_active).length;
  const totalCost = invocations.reduce((s, i) => s + (i.cost_cents ?? 0), 0);
  const totalTokens = invocations.reduce((s, i) => s + (i.tokens_used ?? 0), 0);
  const completedCount = invocations.filter(i => i.status === "completed").length;
  const pendingCount = invocations.filter(i => i.status === "pending").length;
  const failedCount = invocations.filter(i => i.status === "failed").length;

  return {
    totalRoles: roles.length,
    activeRoles,
    totalInvocations: invocations.length,
    completedCount,
    pendingCount,
    failedCount,
    totalCostCents: totalCost,
    totalTokens,
    avgLatencyMs: invocations.length > 0
      ? Math.round(invocations.reduce((s, i) => s + (i.latency_ms ?? 0), 0) / invocations.length)
      : 0,
  };
}


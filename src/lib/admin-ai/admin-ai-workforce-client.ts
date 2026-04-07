import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════
// Admin AI Workforce Client — Supabase data access layer
// ═══════════════════════════════════════════════════════════════

export async function fetchWorkforceRoles() {
  const { data, error } = await supabase
    .from("ai_workforce_roles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceTaskTypes() {
  const { data, error } = await supabase
    .from("ai_workforce_task_types")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceRoleTaskPermissions() {
  const { data, error } = await supabase
    .from("ai_workforce_role_task_permissions")
    .select("*");
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceBudgetClasses() {
  const { data, error } = await supabase
    .from("ai_workforce_budget_classes")
    .select("*")
    .order("priority_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceInvocations(limit = 50) {
  const { data, error } = await supabase
    .from("ai_workforce_invocations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceOutputs(invocationId: string) {
  const { data, error } = await supabase
    .from("ai_workforce_outputs")
    .select("*")
    .eq("invocation_id", invocationId);
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceRecommendations(limit = 50) {
  const { data, error } = await supabase
    .from("ai_workforce_recommendations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceRecommendationScores(recommendationId: string) {
  const { data, error } = await supabase
    .from("ai_workforce_recommendation_scores")
    .select("*")
    .eq("recommendation_id", recommendationId);
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceApprovalQueue(status?: string) {
  let query = supabase
    .from("ai_workforce_approval_queue")
    .select("*")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceRoleHealth() {
  const { data, error } = await supabase
    .from("ai_workforce_role_health")
    .select("*");
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceLaunchHonesty() {
  const { data, error } = await supabase
    .from("ai_workforce_launch_honesty")
    .select("*");
  if (error) throw error;
  return data || [];
}

export async function fetchWorkforceCachedOutputs() {
  const { data, error } = await supabase
    .from("ai_workforce_cached_outputs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

// Mutations

export async function updateRecommendationStatus(id: string, status: string) {
  const { error } = await supabase
    .from("ai_workforce_recommendations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function updateApprovalQueueItem(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from("ai_workforce_approval_queue")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function insertRecommendationScore(score: {
  recommendation_id: string;
  score_overall: number;
  score_accuracy?: number;
  score_usefulness?: number;
  score_actionability?: number;
  score_evidence_quality?: number;
  score_cost_efficiency?: number;
  score_launch_honesty_alignment?: number;
  review_method: string;
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("ai_workforce_recommendation_scores")
    .insert({ ...score, user_id: user.id, reviewed_by_user_id: user.id } as never);
  if (error) throw error;
}

export async function invokeWorkforceTask(params: {
  role_key: string;
  task_key: string;
  scope_type?: string;
  scope_ref?: string;
  scope_payload?: Record<string, unknown>;
  budget_posture?: string;
  mode?: string;
}) {
  const { data, error } = await supabase.functions.invoke("admin-ai-workforce-run", {
    body: params,
  });
  if (error) throw error;
  return data;
}

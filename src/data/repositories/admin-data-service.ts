import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
export async function fetchAutomationRules() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await fromTable("ai_self_healing_rules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [] as any[];

  return data.map((r: any) => ({
    id: r.id, name: r.rule_name, trigger: r.trigger_condition,
    action: r.action_type, enabled: r.enabled ?? true,
    lastTriggered: r.last_triggered_at, riskLevel: r.risk_level,
  }));
}

export async function fetchDelegations() {
  return [] as any[];
}

export async function fetchReplayableWorkflows() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await fromTable("platform_replay_verifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return [] as any[];

  return data.map((w: any) => ({
    id: w.id, name: w.replay_type || "Workflow", status: w.status,
    lastRun: w.created_at, steps: [],
  }));
}

export async function fetchAdminUsers() {
  return [] as any[];
}

export async function fetchTokenUsages() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await fromTable("ai_token_usage").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  if (error || !data) return [];

  return data.map((t: any) => ({
    id: t.id, advisor: t.advisor_id, model: t.model, tokens: t.total_tokens || 0,
    costCents: Number(t.cost_cents || 0), category: t.category || "general",
    domain: t.domain || "general", cached: t.cached || false, createdAt: t.created_at,
  }));
}

export async function fetchAdminIncidents() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await fromTable("incidents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return [] as any[];

  return data.map((i: any) => ({
    id: i.id, title: i.title, severity: i.severity || "SEV-3",
    status: i.status, impact: i.description || "",
    description: i.description || "", created_at: i.created_at,
    created_by: i.user_id, assigned_to: null, acknowledged_at: null,
    resolved_at: i.resolved_at, root_cause: null, timeline: [],
  }));
}

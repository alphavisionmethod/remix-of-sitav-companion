// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Runtime Registry (Phase 2 Bridge)
//
// Single source for the runtime loop + admin UI to read combined
// definition + runtime state. Reuses canonical Supabase client.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type InternalAgentDefinitionRow =
  Database["public"]["Tables"]["internal_agent_definitions"]["Row"];
export type InternalAgentRuntimeStateRow =
  Database["public"]["Tables"]["internal_agent_runtime_state"]["Row"];
export type InternalAgentActionRow =
  Database["public"]["Tables"]["internal_agent_actions"]["Row"];
export type CouncilEscalationRow =
  Database["public"]["Tables"]["council_escalations"]["Row"];
export type SupervisorDecisionRow =
  Database["public"]["Tables"]["supervisor_decisions"]["Row"];

export interface AgentRuntimeView {
  definition: InternalAgentDefinitionRow;
  state: InternalAgentRuntimeStateRow | null;
}

export interface CouncilSummary {
  council: string;
  totalAgents: number;
  activeAgents: number;
  suspendedAgents: number;
  cooldownAgents: number;
  errorAgents: number;
  openEscalations: number;
  recentActions24h: number;
  averageTrustScore: number;
}

// ── Read combined definition + state, optionally filtered ──────
export async function loadAllAgentsWithState(filter?: {
  council?: string;
  status?: string;
}): Promise<AgentRuntimeView[]> {
  let query = supabase
    .from("internal_agent_definitions")
    .select(`
      *,
      internal_agent_runtime_state ( * )
    `);

  if (filter?.council) query = query.eq("council", filter.council);

  const { data, error } = await query.order("council").order("agent_id");
  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const stateArr = row.internal_agent_runtime_state;
    const state: InternalAgentRuntimeStateRow | null = Array.isArray(stateArr)
      ? stateArr[0] ?? null
      : stateArr ?? null;
    const { internal_agent_runtime_state, ...definition } = row;
    return { definition: definition as InternalAgentDefinitionRow, state };
  }).filter((v) => !filter?.status || v.state?.current_status === filter.status);
}

// ── Single agent with state + recent actions ───────────────────
export async function loadAgentDetail(agentId: string): Promise<{
  view: AgentRuntimeView | null;
  recentActions: InternalAgentActionRow[];
  openEscalations: CouncilEscalationRow[];
  recentDecisions: SupervisorDecisionRow[];
}> {
  const [defRes, stateRes, actionsRes, escRes, decRes] = await Promise.all([
    supabase.from("internal_agent_definitions").select("*").eq("agent_id", agentId).maybeSingle(),
    supabase.from("internal_agent_runtime_state").select("*").eq("agent_id", agentId).maybeSingle(),
    supabase.from("internal_agent_actions").select("*").eq("agent_id", agentId)
      .order("created_at", { ascending: false }).limit(20),
    supabase.from("council_escalations").select("*").eq("source_agent_id", agentId)
      .in("status", ["open", "acknowledged", "escalated_to_meta"])
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("supervisor_decisions").select("*").eq("target_agent_id", agentId)
      .order("created_at", { ascending: false }).limit(10),
  ]);

  return {
    view: defRes.data ? { definition: defRes.data, state: stateRes.data ?? null } : null,
    recentActions: actionsRes.data ?? [],
    openEscalations: escRes.data ?? [],
    recentDecisions: decRes.data ?? [],
  };
}

// ── Per-council aggregate health ───────────────────────────────
export async function loadCouncilSummaries(): Promise<CouncilSummary[]> {
  const views = await loadAllAgentsWithState();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [actionsRes, escRes] = await Promise.all([
    supabase.from("internal_agent_actions").select("council").gte("created_at", since24h),
    supabase.from("council_escalations").select("source_council").in("status", ["open", "acknowledged"]),
  ]);

  const actionsByCouncil = new Map<string, number>();
  (actionsRes.data ?? []).forEach((a: any) => {
    actionsByCouncil.set(a.council, (actionsByCouncil.get(a.council) ?? 0) + 1);
  });
  const escByCouncil = new Map<string, number>();
  (escRes.data ?? []).forEach((e: any) => {
    escByCouncil.set(e.source_council, (escByCouncil.get(e.source_council) ?? 0) + 1);
  });

  const byCouncil = new Map<string, AgentRuntimeView[]>();
  views.forEach((v) => {
    const arr = byCouncil.get(v.definition.council) ?? [];
    arr.push(v);
    byCouncil.set(v.definition.council, arr);
  });

  return Array.from(byCouncil.entries()).map(([council, agents]) => {
    const total = agents.length;
    const active = agents.filter((a) =>
      a.definition.is_active && (a.state?.current_status === "idle" || a.state?.current_status === "running")
    ).length;
    const suspended = agents.filter((a) => a.state?.current_status === "suspended").length;
    const cooldown = agents.filter((a) => a.state?.current_status === "cooldown").length;
    const error = agents.filter((a) => a.state?.current_status === "error").length;
    const trusts = agents.map((a) => Number(a.state?.trust_score ?? 0.5));
    const avgTrust = trusts.length ? trusts.reduce((s, n) => s + n, 0) / trusts.length : 0;
    return {
      council,
      totalAgents: total,
      activeAgents: active,
      suspendedAgents: suspended,
      cooldownAgents: cooldown,
      errorAgents: error,
      openEscalations: escByCouncil.get(council) ?? 0,
      recentActions24h: actionsByCouncil.get(council) ?? 0,
      averageTrustScore: Math.round(avgTrust * 100) / 100,
    };
  }).sort((a, b) => a.council.localeCompare(b.council));
}

// ── Open escalations (system-wide or by supervisor) ────────────
export async function loadOpenEscalations(supervisorKey?: string) {
  let query = supabase
    .from("council_escalations")
    .select("*")
    .in("status", ["open", "acknowledged", "escalated_to_meta"])
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false });
  if (supervisorKey) query = query.eq("target_supervisor", supervisorKey);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ── Recent supervisor decisions ────────────────────────────────
export async function loadRecentSupervisorDecisions(limit = 25) {
  const { data, error } = await supabase
    .from("supervisor_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

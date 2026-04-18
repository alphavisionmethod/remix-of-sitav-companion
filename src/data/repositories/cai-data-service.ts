// ═══════════════════════════════════════════════════════════════
// SITA OS — CAI (Coordinated Ambient Intelligence) Data Service
// CRUD operations for all 23 CAI tables via Supabase
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

// ── Helpers ─────────────────────────────────────────────────────

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QueryFilters = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QueryFilters & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let query = fromDynamicTable(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) query = query.gte("created_at", filters.since);
  query = query.limit(filters?.limit ?? 100);
  const { data, error } = await query;
  if (error) { console.error(`[cai-data] ${table} fetch failed:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromDynamicTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[cai-data] ${table} insert failed:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromDynamicTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[cai-data] ${table} update failed:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromDynamicTable(table).delete().eq("id", id);
  if (error) { console.error(`[cai-data] ${table} delete failed:`, error); return false; }
  return true;
}

// ── Personal Operating Graph ────────────────────────────────────

export const graphNodes = {
  list: (f?: QueryFilters) => queryTable("personal_operating_graph_nodes", f),
  create: (node: Record<string, unknown>) => insertRow("personal_operating_graph_nodes", node),
  update: (id: string, u: Record<string, unknown>) => updateRow("personal_operating_graph_nodes", id, u),
  delete: (id: string) => deleteRow("personal_operating_graph_nodes", id),
};

export const graphEdges = {
  list: (f?: QueryFilters) => queryTable("personal_operating_graph_edges", f),
  create: (edge: Record<string, unknown>) => insertRow("personal_operating_graph_edges", edge),
  delete: (id: string) => deleteRow("personal_operating_graph_edges", id),
};

// ── Intent Resolution ───────────────────────────────────────────

export const intents = {
  list: (f?: QueryFilters) => queryTable("intent_resolutions", f),
  create: (intent: Record<string, unknown>) => insertRow("intent_resolutions", intent),
  update: (id: string, u: Record<string, unknown>) => updateRow("intent_resolutions", id, u),
};

// ── Command Orchestration ───────────────────────────────────────

export const commands = {
  list: (f?: QueryFilters) => queryTable("command_orchestrations", f),
  create: (cmd: Record<string, unknown>) => insertRow("command_orchestrations", cmd),
  update: (id: string, u: Record<string, unknown>) => updateRow("command_orchestrations", id, u),
};

// ── Priority Stack ──────────────────────────────────────────────

export const priorities = {
  list: (f?: QueryFilters) => queryTable("priority_stacks", f),
  create: (p: Record<string, unknown>) => insertRow("priority_stacks", p),
  update: (id: string, u: Record<string, unknown>) => updateRow("priority_stacks", id, u),
  delete: (id: string) => deleteRow("priority_stacks", id),
};

// ── Attention Decisions ─────────────────────────────────────────

export const attentionDecisions = {
  list: (f?: QueryFilters) => queryTable("attention_decisions", f),
  create: (d: Record<string, unknown>) => insertRow("attention_decisions", d),
};

// ── Trust-Weighted Actions ──────────────────────────────────────

export const trustActions = {
  list: (f?: QueryFilters) => queryTable("trust_weighted_actions", f),
  create: (a: Record<string, unknown>) => insertRow("trust_weighted_actions", a),
  update: (id: string, u: Record<string, unknown>) => updateRow("trust_weighted_actions", id, u),
};

// ── Action Escalations ──────────────────────────────────────────

export const escalations = {
  list: (f?: QueryFilters) => queryTable("action_escalations", f),
  create: (e: Record<string, unknown>) => insertRow("action_escalations", e),
};

// ── Continuity Sessions ─────────────────────────────────────────

export const continuitySessions = {
  list: (f?: QueryFilters) => queryTable("cai_continuity_sessions", f),
  create: (s: Record<string, unknown>) => insertRow("cai_continuity_sessions", s),
  update: (id: string, u: Record<string, unknown>) => updateRow("cai_continuity_sessions", id, u),
};

// ── Handoff Contexts ────────────────────────────────────────────

export const handoffs = {
  list: (f?: QueryFilters) => queryTable("handoff_contexts", f),
  create: (h: Record<string, unknown>) => insertRow("handoff_contexts", h),
  update: (id: string, u: Record<string, unknown>) => updateRow("handoff_contexts", id, u),
};

// ── Assistant Role States ───────────────────────────────────────

export const assistantRoles = {
  list: (f?: QueryFilters) => queryTable("assistant_role_states", f),
  create: (r: Record<string, unknown>) => insertRow("assistant_role_states", r),
  update: (id: string, u: Record<string, unknown>) => updateRow("assistant_role_states", id, u),
};

// ── Coordinated Assistant Sessions ──────────────────────────────

export const assistantSessions = {
  list: (f?: QueryFilters) => queryTable("coordinated_assistant_sessions", f),
  create: (s: Record<string, unknown>) => insertRow("coordinated_assistant_sessions", s),
  update: (id: string, u: Record<string, unknown>) => updateRow("coordinated_assistant_sessions", id, u),
};

// ── Timing Intelligence ─────────────────────────────────────────

export const timingDecisions = {
  list: (f?: QueryFilters) => queryTable("timing_intelligence_decisions", f),
  create: (t: Record<string, unknown>) => insertRow("timing_intelligence_decisions", t),
};

// ── Relationship Contexts ───────────────────────────────────────

export const relationships = {
  list: (f?: QueryFilters) => queryTable("relationship_contexts", f),
  create: (r: Record<string, unknown>) => insertRow("relationship_contexts", r),
  update: (id: string, u: Record<string, unknown>) => updateRow("relationship_contexts", id, u),
};

// ── Human Obligations ───────────────────────────────────────────

export const obligations = {
  list: (f?: QueryFilters) => queryTable("human_obligations", f),
  create: (o: Record<string, unknown>) => insertRow("human_obligations", o),
  update: (id: string, u: Record<string, unknown>) => updateRow("human_obligations", id, u),
};

// ── Digest Compilations ─────────────────────────────────────────

export const digests = {
  list: (f?: QueryFilters) => queryTable("digest_compilations", f),
  create: (d: Record<string, unknown>) => insertRow("digest_compilations", d),
};

// ── Operating Modes ─────────────────────────────────────────────

export const operatingModes = {
  list: (f?: QueryFilters) => queryTable("operating_modes", f),
  create: (m: Record<string, unknown>) => insertRow("operating_modes", m),
  update: (id: string, u: Record<string, unknown>) => updateRow("operating_modes", id, u),
};

// ── Adaptive Interface Profiles ─────────────────────────────────

export const interfaceProfiles = {
  list: (f?: QueryFilters) => queryTable("adaptive_interface_profiles", f),
  create: (p: Record<string, unknown>) => insertRow("adaptive_interface_profiles", p),
  update: (id: string, u: Record<string, unknown>) => updateRow("adaptive_interface_profiles", id, u),
};

// ── Opportunity Signals ─────────────────────────────────────────

export const opportunitySignals = {
  list: (f?: QueryFilters) => queryTable("opportunity_signals", f),
  create: (o: Record<string, unknown>) => insertRow("opportunity_signals", o),
  update: (id: string, u: Record<string, unknown>) => updateRow("opportunity_signals", id, u),
};

// ── Memory Governance ───────────────────────────────────────────

export const memoryGovernance = {
  list: (f?: QueryFilters) => queryTable("memory_governance_records", f),
  create: (m: Record<string, unknown>) => insertRow("memory_governance_records", m),
};

export const memoryCorrections = {
  list: (f?: QueryFilters) => queryTable("memory_corrections", f),
  create: (c: Record<string, unknown>) => insertRow("memory_corrections", c),
};

// ── Boundary Policies ───────────────────────────────────────────

export const boundaryPolicies = {
  list: (f?: QueryFilters) => queryTable("boundary_policies", f),
  create: (b: Record<string, unknown>) => insertRow("boundary_policies", b),
  update: (id: string, u: Record<string, unknown>) => updateRow("boundary_policies", id, u),
};

// ── Experience Signature Rules ──────────────────────────────────

export const experienceRules = {
  list: (f?: QueryFilters) => queryTable("experience_signature_rules", f),
  create: (e: Record<string, unknown>) => insertRow("experience_signature_rules", e),
  update: (id: string, u: Record<string, unknown>) => updateRow("experience_signature_rules", id, u),
};

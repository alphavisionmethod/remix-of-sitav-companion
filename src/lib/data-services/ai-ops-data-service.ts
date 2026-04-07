// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Ops Data Service
// CRUD operations for 8 ai_* orphaned tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QF = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QF & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let q = (supabase as any).from(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) q = q.gte("created_at", filters.since);
  q = q.limit(filters?.limit ?? 100);
  const { data, error } = await q;
  if (error) { console.error(`[ai-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await (supabase as any).from(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[ai-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await (supabase as any).from(table).update(updates).eq("id", id);
  if (error) { console.error(`[ai-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await (supabase as any).from(table).delete().eq("id", id);
  if (error) { console.error(`[ai-ops] ${table} delete:`, error); return false; }
  return true;
}

function crud(table: string) {
  return {
    list: (f?: QF) => queryTable(table, f),
    create: (row: Record<string, unknown>) => insertRow(table, row),
    update: (id: string, u: Record<string, unknown>) => updateRow(table, id, u),
    delete: (id: string) => deleteRow(table, id),
  };
}

export const aiAgentDebateRecords = crud("ai_agent_debate_records");
export const aiChangePlans = crud("ai_change_plans");
export const aiComplianceViolations = crud("ai_compliance_violations");
export const aiDesignDiffs = crud("ai_design_diffs");
export const aiEfficiencyScores = crud("ai_efficiency_scores");
export const aiEngineeringMissions = crud("ai_engineering_missions");
export const aiFixProposals = crud("ai_fix_proposals");
export const aiLearningPatterns = crud("ai_learning_patterns");

// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface & Mode Data Service
// CRUD operations for 11 surface/reality/mode/analytics tables
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
  if (error) { console.error(`[surface-mode] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await (supabase as any).from(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[surface-mode] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await (supabase as any).from(table).update(updates).eq("id", id);
  if (error) { console.error(`[surface-mode] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await (supabase as any).from(table).delete().eq("id", id);
  if (error) { console.error(`[surface-mode] ${table} delete:`, error); return false; }
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

export const surfaceClassRegistry = crud("surface_class_registry");
export const surfaceConstraintRecords = crud("surface_constraint_records");
export const surfaceNotificationGrammars = crud("surface_notification_grammars");
export const surfaceTrustPresentations = crud("surface_trust_presentations");
export const realityModes = crud("reality_modes");
export const realityModeRegistry = crud("reality_mode_registry");
export const realityModeResolutionLog = crud("reality_mode_resolution_log");
export const modeAccessPolicies = crud("mode_access_policies");
export const modeSegregationAudits = crud("mode_segregation_audits");
export const analyticsModePolicies = crud("analytics_mode_policies");
export const routeSurfaceRegistry = crud("route_surface_registry");

// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Ops Data Service
// CRUD operations for 7 integration_* tables
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
  if (error) { console.error(`[integration-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await (supabase as any).from(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[integration-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await (supabase as any).from(table).update(updates).eq("id", id);
  if (error) { console.error(`[integration-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await (supabase as any).from(table).delete().eq("id", id);
  if (error) { console.error(`[integration-ops] ${table} delete:`, error); return false; }
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

export const integrationActionRequests = crud("integration_action_requests");
export const integrationAuditLogs = crud("integration_audit_logs");
export const integrationConnections = crud("integration_connections");
export const integrationCredentials = crud("integration_credentials");
export const integrationProviders = crud("integration_providers");
export const integrationRoutingRules = crud("integration_routing_rules");
export const integrationSyncRuns = crud("integration_sync_runs");

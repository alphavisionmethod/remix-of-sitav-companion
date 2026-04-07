// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Ops Data Service
// CRUD operations for 2 connector_* tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QF = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QF & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let q = fromTable(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) q = q.gte("created_at", filters.since);
  q = q.limit(filters?.limit ?? 100);
  const { data, error } = await q;
  if (error) { console.error(`[connector-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[connector-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[connector-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromTable(table).delete().eq("id", id);
  if (error) { console.error(`[connector-ops] ${table} delete:`, error); return false; }
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

export const connectorAuthSessions = crud("connector_auth_sessions");
export const connectorSyncLogs = crud("connector_sync_logs");

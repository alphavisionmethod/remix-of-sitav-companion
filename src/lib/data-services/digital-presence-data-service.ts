// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Presence Data Service
// CRUD operations for 7 digital/website/product tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QF = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QF & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let q = fromDynamicTable(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) q = q.gte("created_at", filters.since);
  q = q.limit(filters?.limit ?? 100);
  const { data, error } = await q;
  if (error) { console.error(`[digital-presence] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromDynamicTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[digital-presence] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromDynamicTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[digital-presence] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromDynamicTable(table).delete().eq("id", id);
  if (error) { console.error(`[digital-presence] ${table} delete:`, error); return false; }
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

export const digitalAgentDebates = crud("digital_agent_debates");
export const digitalAgentObservations = crud("digital_agent_observations");
export const digitalAgents = crud("digital_agents");
export const digitalPresenceProfiles = crud("digital_presence_profiles");
export const digitalTwins = crud("digital_twins");
export const websiteTwins = crud("website_twins");
export const productPresence = crud("product_presence");

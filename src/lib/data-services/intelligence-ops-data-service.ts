// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Ops Data Service
// CRUD operations for 7 intelligence_* tables
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
  if (error) { console.error(`[intelligence-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[intelligence-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[intelligence-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromTable(table).delete().eq("id", id);
  if (error) { console.error(`[intelligence-ops] ${table} delete:`, error); return false; }
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

export const intelligenceAssetUsages = crud("intelligence_asset_usages");
export const intelligenceAssets = crud("intelligence_assets");
export const intelligenceDigests = crud("intelligence_digests");
export const intelligencePackets = crud("intelligence_packets");
export const intelligencePatterns = crud("intelligence_patterns");
export const intelligenceQualityFeedback = crud("intelligence_quality_feedback");
export const intelligenceReuseOpportunities = crud("intelligence_reuse_opportunities");

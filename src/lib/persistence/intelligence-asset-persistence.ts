// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Asset Persistence
// CRUD for intelligence_assets_library table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface IntelligenceAssetRow {
  id: string;
  user_id: string;
  asset_type: string;
  domain: string;
  title: string;
  content: Record<string, unknown>;
  confidence: number;
  evidence_grade: string;
  reuse_count: number;
  adapted_reuse_count: number;
  cost_avoided_cents: number;
  freshness_score: number;
  decay_rate: number;
  invalidated: boolean;
  invalidation_reason: string | null;
  source_mission_id: string | null;
  source_agent_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const TABLE = "intelligence_assets_library";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createIntelligenceAsset(
  asset: Omit<IntelligenceAssetRow, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<IntelligenceAssetRow | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await (supabase as any).from(TABLE)
    .insert({ ...asset, user_id: userId })
    .select()
    .single();
  if (error) { console.error("[intel-asset] insert failed:", error); return null; }
  return data;
}

export async function fetchIntelligenceAssets(filters?: {
  domain?: string;
  asset_type?: string;
  invalidated?: boolean;
  limit?: number;
}): Promise<IntelligenceAssetRow[]> {
  const userId = await uid();
  if (!userId) return [];
  let q = (supabase as any).from(TABLE).select("*").eq("user_id", userId).order("reuse_count", { ascending: false });
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.asset_type) q = q.eq("asset_type", filters.asset_type);
  if (filters?.invalidated !== undefined) q = q.eq("invalidated", filters.invalidated);
  if (filters?.limit) q = q.limit(filters.limit);
  const { data, error } = await q;
  if (error) { console.error("[intel-asset] fetch failed:", error); return []; }
  return data ?? [];
}

export async function incrementAssetReuse(
  assetId: string,
  costAvoidedCents: number = 0,
  adapted: boolean = false,
): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;

  // Fetch current values
  const { data: current } = await (supabase as any).from(TABLE)
    .select("reuse_count, adapted_reuse_count, cost_avoided_cents")
    .eq("id", assetId).eq("user_id", userId).single();
  if (!current) return false;

  const update: Record<string, unknown> = {
    reuse_count: (current.reuse_count || 0) + 1,
    cost_avoided_cents: (current.cost_avoided_cents || 0) + costAvoidedCents,
  };
  if (adapted) update.adapted_reuse_count = (current.adapted_reuse_count || 0) + 1;

  const { error } = await (supabase as any).from(TABLE).update(update).eq("id", assetId).eq("user_id", userId);
  if (error) { console.error("[intel-asset] reuse increment failed:", error); return false; }
  return true;
}

export async function invalidateAsset(assetId: string, reason: string): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;
  const { error } = await (supabase as any).from(TABLE)
    .update({ invalidated: true, invalidation_reason: reason })
    .eq("id", assetId).eq("user_id", userId);
  if (error) { console.error("[intel-asset] invalidate failed:", error); return false; }
  return true;
}

export async function updateFreshness(assetId: string, freshnessScore: number): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;
  const { error } = await (supabase as any).from(TABLE)
    .update({ freshness_score: freshnessScore })
    .eq("id", assetId).eq("user_id", userId);
  if (error) { console.error("[intel-asset] freshness update failed:", error); return false; }
  return true;
}

export async function getAssetStats(): Promise<{
  total: number;
  totalReuses: number;
  totalCostAvoided: number;
  invalidatedCount: number;
  avgFreshness: number;
}> {
  const userId = await uid();
  if (!userId) return { total: 0, totalReuses: 0, totalCostAvoided: 0, invalidatedCount: 0, avgFreshness: 0 };

  const { data, error } = await (supabase as any).from(TABLE).select("reuse_count, cost_avoided_cents, invalidated, freshness_score").eq("user_id", userId);
  if (error || !data) return { total: 0, totalReuses: 0, totalCostAvoided: 0, invalidatedCount: 0, avgFreshness: 0 };

  const total = data.length;
  const totalReuses = data.reduce((s: number, r: any) => s + (r.reuse_count || 0), 0);
  const totalCostAvoided = data.reduce((s: number, r: any) => s + (r.cost_avoided_cents || 0), 0);
  const invalidatedCount = data.filter((r: any) => r.invalidated).length;
  const avgFreshness = total > 0 ? data.reduce((s: number, r: any) => s + (r.freshness_score || 0), 0) / total : 0;

  return { total, totalReuses, totalCostAvoided, invalidatedCount, avgFreshness };
}

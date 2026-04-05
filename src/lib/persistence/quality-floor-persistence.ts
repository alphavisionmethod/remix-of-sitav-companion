// ═══════════════════════════════════════════════════════════════
// SITA OS — Quality Floor Config Persistence
// CRUD for quality_floor_configs table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface QualityFloorConfigRow {
  id: string;
  user_id: string;
  task_class: string;
  domain: string;
  min_confidence: number;
  min_evidence_completeness: number;
  min_verification_standard: string;
  min_freshness: number;
  enforcement_mode: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const TABLE = "quality_floor_configs";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function fetchQualityFloors(): Promise<QualityFloorConfigRow[]> {
  const userId = await uid();
  if (!userId) return [];
  const { data, error } = await (supabase as any).from(TABLE)
    .select("*").eq("user_id", userId).order("task_class");
  if (error) { console.error("[quality-floor] fetch failed:", error); return []; }
  return data ?? [];
}

export async function upsertQualityFloor(
  config: Omit<QualityFloorConfigRow, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<QualityFloorConfigRow | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await (supabase as any).from(TABLE)
    .upsert(
      { ...config, user_id: userId },
      { onConflict: "user_id,task_class,domain" },
    )
    .select().single();
  if (error) { console.error("[quality-floor] upsert failed:", error); return null; }
  return data;
}

export async function deleteQualityFloor(id: string): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;
  const { error } = await (supabase as any).from(TABLE).delete().eq("id", id).eq("user_id", userId);
  if (error) { console.error("[quality-floor] delete failed:", error); return false; }
  return true;
}

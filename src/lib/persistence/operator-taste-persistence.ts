// ═══════════════════════════════════════════════════════════════
// SITA OS — Operator Taste Profile Persistence
// CRUD for operator_taste_profiles table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface OperatorTasteRow {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: Record<string, unknown>;
  learned_from: string;
  confidence: number;
  times_applied: number;
  last_applied_at: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE = "operator_taste_profiles";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function fetchTasteProfiles(): Promise<OperatorTasteRow[]> {
  const userId = await uid();
  if (!userId) return [];
  const { data, error } = await supabase.from(TABLE)
    .select("*").eq("user_id", userId).order("times_applied", { ascending: false });
  if (error) { console.error("[taste] fetch failed:", error); return []; }
  return data ?? [];
}

export async function upsertTasteProfile(
  key: string,
  value: Record<string, unknown>,
  learnedFrom: string = "observation",
  confidence: number = 0.5,
): Promise<OperatorTasteRow | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await supabase.from(TABLE)
    .upsert(
      {
        user_id: userId,
        preference_key: key,
        preference_value: value,
        learned_from: learnedFrom,
        confidence,
      },
      { onConflict: "user_id,preference_key" },
    )
    .select().single();
  if (error) { console.error("[taste] upsert failed:", error); return null; }
  return data;
}

export async function recordTasteApplication(key: string): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;

  const { data: current } = await supabase.from(TABLE)
    .select("times_applied").eq("user_id", userId).eq("preference_key", key).maybeSingle();
  if (!current) return false;

  const { error } = await supabase.from(TABLE)
    .update({
      times_applied: (current.times_applied || 0) + 1,
      last_applied_at: new Date().toISOString(),
    })
    .eq("user_id", userId).eq("preference_key", key);
  if (error) { console.error("[taste] apply update failed:", error); return false; }
  return true;
}

export async function deleteTasteProfile(key: string): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;
  const { error } = await supabase.from(TABLE)
    .delete().eq("user_id", userId).eq("preference_key", key);
  if (error) { console.error("[taste] delete failed:", error); return false; }
  return true;
}

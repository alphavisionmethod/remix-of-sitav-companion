// ═══════════════════════════════════════════════════════════════
// SITA OS — Conflict Resolver (Phase H)
// ═══════════════════════════════════════════════════════════════
// Lightweight client-side detector. When a new plan / event /
// payment competes with an existing commitment, we record an
// open `sita_conflict_resolutions` row so the user can pick.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type ConflictKind = "calendar" | "budget" | "mission" | "priority";

export interface ConflictOption {
  id: string;
  label: string;
  rationale?: string;
  irreversible?: boolean;
}

export interface SitaConflict {
  id: string;
  user_id: string;
  conflict_kind: ConflictKind;
  description: string;
  options: ConflictOption[];
  recommended_option: string | null;
  resolved_option: string | null;
  resolved_at: string | null;
  status: "open" | "resolved" | "dismissed";
  evidence: unknown[];
  created_at: string;
}

export async function openConflict(input: {
  user_id: string;
  conflict_kind: ConflictKind;
  description: string;
  options: ConflictOption[];
  recommended_option?: string;
  evidence?: unknown[];
}): Promise<SitaConflict> {
  const { data, error } = await supabase
    .from("sita_conflict_resolutions" as never)
    .insert({
      user_id: input.user_id,
      conflict_kind: input.conflict_kind,
      description: input.description,
      options: input.options,
      recommended_option: input.recommended_option ?? null,
      evidence: input.evidence ?? [],
    } as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as SitaConflict;
}

export async function resolveConflict(id: string, optionId: string): Promise<void> {
  await supabase.from("sita_conflict_resolutions" as never)
    .update({ status: "resolved", resolved_option: optionId, resolved_at: new Date().toISOString() } as never)
    .eq("id", id);
}

export async function dismissConflict(id: string): Promise<void> {
  await supabase.from("sita_conflict_resolutions" as never)
    .update({ status: "dismissed", resolved_at: new Date().toISOString() } as never)
    .eq("id", id);
}

export async function listOpenConflicts(userId: string): Promise<SitaConflict[]> {
  const { data, error } = await supabase
    .from("sita_conflict_resolutions" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as unknown as SitaConflict[];
}
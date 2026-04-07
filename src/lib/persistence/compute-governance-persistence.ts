// ═══════════════════════════════════════════════════════════════
// SITA OS — Compute Governance Budget Snapshot Persistence
// CRUD for compute_budget_snapshots table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface ComputeBudgetSnapshotRow {
  id: string;
  user_id: string;
  period: string;
  domain: string;
  allocated_cents: number;
  used_cents: number;
  cache_hit_rate: number;
  margin_posture: string;
  deep_reasoning_pct: number;
  model_mix: Record<string, unknown>;
  anomaly_flags: string[];
  snapshot_at: string;
  created_at: string;
}

const TABLE = "compute_budget_snapshots";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createComputeSnapshot(
  snapshot: Omit<ComputeBudgetSnapshotRow, "id" | "user_id" | "created_at">,
): Promise<ComputeBudgetSnapshotRow | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(TABLE)
    .insert({ ...snapshot, user_id: userId })
    .select().single();
  if (error) { console.error("[compute-gov] snapshot insert failed:", error); return null; }
  return data;
}

export async function fetchComputeSnapshots(opts?: {
  period?: string;
  domain?: string;
  limit?: number;
}): Promise<ComputeBudgetSnapshotRow[]> {
  const userId = await uid();
  if (!userId) return [];
  let q = fromTable(TABLE).select("*").eq("user_id", userId).order("snapshot_at", { ascending: false });
  if (opts?.period) q = q.eq("period", opts.period);
  if (opts?.domain) q = q.eq("domain", opts.domain);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error("[compute-gov] fetch failed:", error); return []; }
  return data ?? [];
}

export async function getLatestSnapshot(domain: string = "platform"): Promise<ComputeBudgetSnapshotRow | null> {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(TABLE)
    .select("*").eq("user_id", userId).eq("domain", domain)
    .order("snapshot_at", { ascending: false }).limit(1).maybeSingle();
  if (error) { console.error("[compute-gov] latest fetch failed:", error); return null; }
  return data;
}

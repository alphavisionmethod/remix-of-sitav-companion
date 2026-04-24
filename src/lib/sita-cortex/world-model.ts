// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Cortex: Persistent World Model (Phase G)
// ═══════════════════════════════════════════════════════════════
// Single rolling snapshot of "what Sita knows right now" — read by
// every Sita surface, debounce-written to sita_world_state.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface WorldModelSnapshot {
  user: { id: string; display_name?: string };
  open_windows: Array<{ id: string; appId: string; title: string; focused: boolean }>;
  focused_app?: string;
  active_intent?: string;
  recent_receipts?: Array<{ id: string; action: string; ts: number }>;
  finance_posture?: { cash_runway_days?: number; bills_due_7d?: number };
  calendar_next_48h?: Array<{ id: string; title: string; starts_at: string }>;
  concierge_open_tasks?: number;
  advisor_signals?: Array<{ advisor_id: string; signal: string; weight: number }>;
  mood?: "calm" | "alert" | "focused" | "celebratory";
  ts: number;
}

const EMPTY: WorldModelSnapshot = {
  user: { id: "" },
  open_windows: [],
  ts: Date.now(),
};

let cache: WorldModelSnapshot = EMPTY;
const listeners = new Set<(s: WorldModelSnapshot) => void>();
let writeTimer: ReturnType<typeof setTimeout> | null = null;

export function readWorldModel(): WorldModelSnapshot {
  return cache;
}

export function subscribeWorldModel(fn: (s: WorldModelSnapshot) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const l of listeners) {
    try { l(cache); } catch (err) { console.warn("[world-model] listener", err); }
  }
}

/** Merge a partial update into the snapshot and debounce-persist. */
export function updateWorldModel(patch: Partial<WorldModelSnapshot>) {
  cache = { ...cache, ...patch, ts: Date.now() };
  emit();
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => { void persist(); }, 1500);
}

async function persist() {
  if (!cache.user.id) return;
  try {
    await supabase
      .from("sita_world_state" as never)
      .upsert({
        user_id: cache.user.id,
        snapshot: cache as unknown as Record<string, unknown>,
        version: (cache as { version?: number }).version ?? 1,
        updated_at: new Date().toISOString(),
      } as never, { onConflict: "user_id" } as never);
  } catch (err) {
    console.warn("[world-model] persist failed", err);
  }
}

export async function hydrateWorldModel(userId: string) {
  cache = { ...cache, user: { ...cache.user, id: userId } };
  try {
    const { data } = await supabase
      .from("sita_world_state" as never)
      .select("snapshot")
      .eq("user_id", userId)
      .maybeSingle();
    const snap = (data as { snapshot?: WorldModelSnapshot } | null)?.snapshot;
    if (snap) cache = { ...cache, ...snap, user: { ...cache.user, ...snap.user, id: userId } };
  } catch { /* noop */ }
  emit();
}
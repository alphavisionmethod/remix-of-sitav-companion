// ═══════════════════════════════════════════════════════════════
// SITA OS — Generic Engine Persistence Adapter
// Persists/loads any engine's serialized state to Supabase
// Uses engine_state (upsert) and engine_events (append-only)
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

// ── Debounce map for auto-save ──────────────────────────────────
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 800;

// ── Get current user ID (cached per session) ────────────────────
let cachedUserId: string | null = null;

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  const { data: { user } } = await supabase.auth.getUser();
  cachedUserId = user?.id ?? null;
  return cachedUserId;
}

// Listen for auth changes to clear cache
supabase.auth.onAuthStateChange(() => { cachedUserId = null; });

// ── Save engine state (upsert) ─────────────────────────────────
export async function persistEngineState(
  engineName: string,
  stateData: Record<string, unknown>,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const row: Record<string, unknown> = { user_id: userId, engine_name: engineName, state_data: stateData };
  const { error } = await fromDynamicTable("engine_state")
    .upsert(row as never, { onConflict: "user_id,engine_name" });

  if (error) {
    console.error(`[persistence] engine_state upsert failed for ${engineName}:`, error);
    return false;
  }
  return true;
}

// ── Debounced save (call freely, writes at most every DEBOUNCE_MS) ──
export function debouncedPersistEngineState(
  engineName: string,
  stateData: Record<string, unknown>,
): void {
  const key = engineName;
  const existing = saveTimers.get(key);
  if (existing) clearTimeout(existing);

  saveTimers.set(
    key,
    setTimeout(() => {
      saveTimers.delete(key);
      persistEngineState(engineName, stateData).catch(console.error);
    }, DEBOUNCE_MS),
  );
}

// ── Load engine state ───────────────────────────────────────────
export async function loadEngineState<T = Record<string, unknown>>(
  engineName: string,
): Promise<T | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await fromDynamicTable("engine_state")
    .select("state_data, version")
    .eq("user_id", userId)
    .eq("engine_name", engineName)
    .maybeSingle();

  if (error) {
    console.error(`[persistence] engine_state load failed for ${engineName}:`, error);
    return null;
  }
  return (data?.state_data ?? null) as T | null;
}

// ── Load all engine states for current user ─────────────────────
export async function loadAllEngineStates(): Promise<
  Record<string, Record<string, unknown>>
> {
  const userId = await getUserId();
  if (!userId) return {};

  const { data, error } = await fromDynamicTable("engine_state")
    .select("engine_name, state_data")
    .eq("user_id", userId);

  if (error) {
    console.error("[persistence] loadAllEngineStates failed:", error);
    return {};
  }

  const result: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    result[row.engine_name] = row.state_data;
  }
  return result;
}

// ── Append engine event ─────────────────────────────────────────
export async function appendEngineEvent(
  engineName: string,
  eventType: string,
  eventData: Record<string, unknown> = {},
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await fromDynamicTable("engine_events")
    .insert({
      user_id: userId,
      engine_name: engineName,
      event_type: eventType,
      event_data: eventData,
    });

  if (error) {
    console.error(`[persistence] engine_event insert failed for ${engineName}:`, error);
    return false;
  }
  return true;
}

// ── Fetch engine events ─────────────────────────────────────────
export async function fetchEngineEvents(
  engineName: string,
  opts?: { eventType?: string; limit?: number },
): Promise<Array<{ id: string; event_type: string; event_data: Record<string, unknown>; created_at: string }>> {
  const userId = await getUserId();
  if (!userId) return [];

  let query = fromDynamicTable("engine_events")
    .select("id, event_type, event_data, created_at")
    .eq("user_id", userId)
    .eq("engine_name", engineName)
    .order("created_at", { ascending: false });

  if (opts?.eventType) query = query.eq("event_type", opts.eventType);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error(`[persistence] engine_events fetch failed for ${engineName}:`, error);
    return [];
  }
  return data ?? [];
}

// ── Delete engine state (for reset/logout) ──────────────────────
export async function clearEngineState(engineName: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await fromDynamicTable("engine_state")
    .delete()
    .eq("user_id", userId)
    .eq("engine_name", engineName);

  if (error) {
    console.error(`[persistence] engine_state delete failed for ${engineName}:`, error);
    return false;
  }
  return true;
}

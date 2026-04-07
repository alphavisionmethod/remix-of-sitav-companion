// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Service Persistence Adapter
// Any service can persist/load state via os_service_state table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

// ── Debounce map ────────────────────────────────────────────────
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 800;

// ── Cached user ID ──────────────────────────────────────────────
let cachedUserId: string | null = null;

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  const { data: { user } } = await supabase.auth.getUser();
  cachedUserId = user?.id ?? null;
  return cachedUserId;
}

supabase.auth.onAuthStateChange(() => { cachedUserId = null; });

// ── Save service state (upsert) ────────────────────────────────
export async function saveServiceState(
  serviceId: string,
  stateSnapshot: Record<string, unknown>,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await fromDynamicTable("os_service_state")
    .upsert(
      {
        user_id: userId,
        service_id: serviceId,
        state_snapshot: stateSnapshot,
        version: 1,
      },
      { onConflict: "user_id,service_id" }
    );

  if (error) {
    console.error(`[persistence] os_service_state upsert failed for ${serviceId}:`, error);
    return false;
  }
  return true;
}

// ── Debounced save ──────────────────────────────────────────────
export function debouncedSaveServiceState(
  serviceId: string,
  stateSnapshot: Record<string, unknown>,
): void {
  const existing = saveTimers.get(serviceId);
  if (existing) clearTimeout(existing);

  saveTimers.set(
    serviceId,
    setTimeout(() => {
      saveTimers.delete(serviceId);
      saveServiceState(serviceId, stateSnapshot).catch(console.error);
    }, DEBOUNCE_MS),
  );
}

// ── Load service state ──────────────────────────────────────────
export async function loadServiceState<T = Record<string, unknown>>(
  serviceId: string,
): Promise<T | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await fromDynamicTable("os_service_state")
    .select("state_snapshot, version")
    .eq("user_id", userId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (error) {
    console.error(`[persistence] os_service_state load failed for ${serviceId}:`, error);
    return null;
  }
  return data?.state_snapshot ?? null;
}

// ── Load all service states for current user ────────────────────
export async function loadAllServiceStates(): Promise<
  Record<string, Record<string, unknown>>
> {
  const userId = await getUserId();
  if (!userId) return {};

  const { data, error } = await fromDynamicTable("os_service_state")
    .select("service_id, state_snapshot")
    .eq("user_id", userId);

  if (error) {
    console.error("[persistence] loadAllServiceStates failed:", error);
    return {};
  }

  const result: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    result[row.service_id] = row.state_snapshot;
  }
  return result;
}

// ── Clear service state ─────────────────────────────────────────
export async function clearServiceState(serviceId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { error } = await fromDynamicTable("os_service_state")
    .delete()
    .eq("user_id", userId)
    .eq("service_id", serviceId);

  if (error) {
    console.error(`[persistence] os_service_state delete failed for ${serviceId}:`, error);
    return false;
  }
  return true;
}

// ── Persistable mixin for class-based services ──────────────────
// Usage:
//   class MyService extends PersistableService("my-service") { ... }
//   or manually: call this.persistState() after mutations
export function createPersistenceHelper(serviceId: string) {
  return {
    save: (state: Record<string, unknown>) => debouncedSaveServiceState(serviceId, state),
    saveImmediate: (state: Record<string, unknown>) => saveServiceState(serviceId, state),
    load: () => loadServiceState(serviceId),
    clear: () => clearServiceState(serviceId),
  };
}

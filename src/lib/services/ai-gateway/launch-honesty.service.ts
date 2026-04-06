// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Launch Honesty Service
// Canonical: reads from ai_launch_honesty + routing + requests
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { LaunchHonestyLevel, AILaunchHonesty } from "./types";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface AICapabilityLaunchStatus {
  capabilityId: string;
  capabilityName: string;
  launchLevel: LaunchHonestyLevel;
  provider: string | null;
  model: string | null;
  hasRoutingPolicy: boolean;
  hasBudget: boolean;
  lastUsedAt: string | null;
  publicClaimAllowed: boolean;
  qualifierRequired: boolean;
  notes: string | null;
}

// ── Raw launch honesty records ─────────────────────────────────
export async function getLaunchHonestyRecords(): Promise<AILaunchHonesty[]> {
  const { data, error } = await supabase
    .from("ai_launch_honesty")
    .select("*")
    .order("capability_key");
  if (error) throw error;
  return data ?? [];
}

/**
 * Build launch honesty board by merging canonical ai_launch_honesty,
 * routing policies, and recent task requests.
 */
export async function getAILaunchHonestyBoard(): Promise<AICapabilityLaunchStatus[]> {
  const [{ data: honesty }, { data: policies }, { data: requests }] = await Promise.all([
    supabase.from("ai_launch_honesty").select("*").order("capability_key"),
    supabase.from("ai_routing_policies").select("capability_id, enabled, default_provider, default_model, domain, task_class").order("capability_id"),
    supabase.from("ai_task_requests").select("capability_id, created_at, status, provider_chosen, model_chosen").order("created_at", { ascending: false }).limit(500),
  ]);

  const honestyMap = new Map((honesty ?? []).map(h => [h.capability_key, h]));
  const policyMap = new Map((policies ?? []).map(p => [p.capability_id, p]));
  const requestMap = new Map<string, (typeof requests extends (infer T)[] ? T : never)>();
  (requests ?? []).forEach(r => {
    if (r.capability_id && !requestMap.has(r.capability_id)) {
      requestMap.set(r.capability_id, r);
    }
  });

  const allIds = new Set([
    ...(honesty ?? []).map(h => h.capability_key),
    ...(policies ?? []).map(p => p.capability_id),
    ...(requests ?? []).filter(r => r.capability_id).map(r => r.capability_id!),
  ]);

  const results: AICapabilityLaunchStatus[] = [];

  for (const id of allIds) {
    const h = honestyMap.get(id);
    const policy = policyMap.get(id);
    const lastReq = requestMap.get(id);

    // Use canonical honesty class if available, otherwise derive
    let level: LaunchHonestyLevel = h?.launch_honesty_class as LaunchHonestyLevel ?? "planned";
    if (!h) {
      if (policy?.enabled && lastReq?.status === "completed") level = "real";
      else if (policy?.enabled && lastReq) level = "partial";
      else if (policy?.enabled) level = "internal_only";
      else if (policy && !policy.enabled) level = "unavailable";
    }

    results.push({
      capabilityId: id,
      capabilityName: id.replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      launchLevel: level,
      provider: policy?.default_provider ?? lastReq?.provider_chosen ?? null,
      model: policy?.default_model ?? lastReq?.model_chosen ?? null,
      hasRoutingPolicy: !!policy,
      hasBudget: !!policy?.domain,
      lastUsedAt: lastReq?.created_at ?? null,
      publicClaimAllowed: h?.public_claim_allowed ?? false,
      qualifierRequired: h?.qualifier_required ?? true,
      notes: h?.notes ?? null,
    });
  }

  return results.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "ai-gateway/launch-honesty";

function _serializeState(): Record<string, unknown> {
  return {
    honestyMap: Array.from(honestyMap.entries()),
    policyMap: Array.from(policyMap.entries()),
    requestMap: Array.from(requestMap.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.honestyMap) { honestyMap.clear(); (state.honestyMap as any[]).forEach(([k, v]: any) => honestyMap.set(k, v)); }
  if (state.policyMap) { policyMap.clear(); (state.policyMap as any[]).forEach(([k, v]: any) => policyMap.set(k, v)); }
  if (state.requestMap) { requestMap.clear(); (state.requestMap as any[]).forEach(([k, v]: any) => requestMap.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}
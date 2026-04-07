// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Launch Honesty Service
// Canonical: reads from ai_launch_honesty + routing + requests
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { LaunchHonestyLevel, AILaunchHonesty } from "./types";


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
    fromTable("ai_launch_honesty").select("*").order("capability_key"),
    fromTable("ai_routing_policies").select("capability_id, enabled, default_provider, default_model, domain, task_class").order("capability_id"),
    fromTable("ai_task_requests").select("capability_id, created_at, status, provider_chosen, model_chosen").order("created_at", { ascending: false }).limit(500),
  ]);

  const honestyMap = new Map<string, any>((honesty ?? []).map((h: any) => [h.capability_key, h]));
  const policyMap = new Map<string, any>((policies ?? []).map((p: any) => [p.capability_id, p]));
  const requestMap = new Map<string, any>();
  (requests ?? []).forEach((r: any) => {
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

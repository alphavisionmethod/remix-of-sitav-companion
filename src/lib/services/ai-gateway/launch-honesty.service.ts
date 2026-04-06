// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Launch Honesty Service
// Tracks which AI capabilities are real, demo, partial, etc.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { LaunchHonestyLevel } from "./types";

export interface AICapabilityLaunchStatus {
  capabilityId: string;
  capabilityName: string;
  launchLevel: LaunchHonestyLevel;
  provider: string | null;
  model: string | null;
  hasRoutingPolicy: boolean;
  hasBudget: boolean;
  lastUsedAt: string | null;
  notes: string | null;
}

/**
 * Build launch honesty view by cross-referencing routing policies,
 * model registry, and task requests.
 */
export async function getAILaunchHonestyBoard(): Promise<AICapabilityLaunchStatus[]> {
  const [{ data: policies }, { data: requests }] = await Promise.all([
    supabase.from("ai_routing_policies").select("capability_id, enabled, default_provider, default_model, domain, task_class").order("capability_id"),
    supabase.from("ai_task_requests").select("capability_id, created_at, status, provider_chosen, model_chosen").order("created_at", { ascending: false }).limit(500),
  ]);

  const policyMap = new Map((policies ?? []).map(p => [p.capability_id, p]));
  const requestMap = new Map<string, typeof requests extends (infer T)[] ? T : never>();
  (requests ?? []).forEach(r => {
    if (r.capability_id && !requestMap.has(r.capability_id)) {
      requestMap.set(r.capability_id, r);
    }
  });

  // Merge unique capability IDs from both sources
  const allIds = new Set([
    ...(policies ?? []).map(p => p.capability_id),
    ...(requests ?? []).filter(r => r.capability_id).map(r => r.capability_id!),
  ]);

  const results: AICapabilityLaunchStatus[] = [];

  for (const id of allIds) {
    const policy = policyMap.get(id);
    const lastReq = requestMap.get(id);

    let level: LaunchHonestyLevel = "planned";
    if (policy?.enabled && lastReq?.status === "completed") level = "real";
    else if (policy?.enabled && lastReq) level = "partial";
    else if (policy?.enabled) level = "internal_only";
    else if (policy && !policy.enabled) level = "unavailable";

    results.push({
      capabilityId: id,
      capabilityName: id.replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      launchLevel: level,
      provider: policy?.default_provider ?? lastReq?.provider_chosen ?? null,
      model: policy?.default_model ?? lastReq?.model_chosen ?? null,
      hasRoutingPolicy: !!policy,
      hasBudget: !!policy?.domain,
      lastUsedAt: lastReq?.created_at ?? null,
      notes: null,
    });
  }

  return results.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
}

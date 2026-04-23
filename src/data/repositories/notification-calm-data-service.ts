// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification/Calm Data Service
// Mode-aware: real Supabase queries in live mode, demo fallback
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
export async function fetchAttentionDecisions(isDemoMode: boolean) {
  if (isDemoMode) return ROUTING_MATRIX;
  const { data, error } = await db.from("attention_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data?.length ? data : ROUTING_MATRIX;
}

export async function fetchFatigueProfiles(isDemoMode: boolean) {
  if (isDemoMode) return FATIGUE_SIGNALS;
  const { data, error } = await db.from("notification_fatigue_profiles")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data?.length ? data : FATIGUE_SIGNALS;
}

export async function fetchAssistantRolePresences(isDemoMode: boolean) {
  if (isDemoMode) return ASSISTANT_ROLES;
  const { data, error } = await db.from("assistant_role_presences")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : ASSISTANT_ROLES;
}

export async function fetchAssistantRoleStates(isDemoMode: boolean) {
  if (isDemoMode) return ASSISTANT_ROLES;
  const { data, error } = await db.from("assistant_role_states")
    .select("*")
    .order("last_active_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : ASSISTANT_ROLES;
}

export async function fetchInterruptionPolicies(isDemoMode: boolean) {
  if (isDemoMode) return CATEGORY_ROUTING;
  const { data, error } = await db.from("interruption_policies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : CATEGORY_ROUTING;
}

export async function fetchNrcLaunchReadiness(isDemoMode: boolean) {
  if (isDemoMode) return NRC_SUBSYSTEMS;
  const { data, error } = await db.from("ecosystem_launch_readiness")
    .select("*")
    .like("target", "nrc_%")
    .order("last_assessed_at", { ascending: false });
  if (error) throw error;
  if (!data?.length) return NRC_SUBSYSTEMS;
  return data.map((r: any) => ({
    target: r.target_name || r.target,
    key: r.target,
    stage: r.launch_stage,
    readiness: r.launch_ready ? 90 : r.pilot_ready ? 60 : r.demo_available ? 40 : 10,
    realRouting: r.launch_ready ?? false,
    ruleBased: r.pilot_ready ?? false,
    demo: r.demo_available ?? false,
    blockers: r.blockers ?? [],
    critical: r.target.includes("routing") || r.target.includes("fatigue") || r.target.includes("queue"),
  }));
}

export async function fetchDeliveryRules(isDemoMode: boolean) {
  if (isDemoMode) return DELIVERY_RULES;
  // No dedicated DB table yet — return demo data
  return DELIVERY_RULES;
}

export async function fetchCrossDeviceSurfaces(isDemoMode: boolean) {
  if (isDemoMode) return CROSS_DEVICE_SURFACES;
  // Sourced from device_families when available
  const { data, error } = await db.from("device_families")
    .select("*")
    .eq("active", true)
    .order("family_key");
  if (error) throw error;
  return data?.length ? data : CROSS_DEVICE_SURFACES;
}

export async function fetchHandoffFlows(isDemoMode: boolean) {
  if (isDemoMode) return HANDOFF_FLOWS;
  return HANDOFF_FLOWS;
}

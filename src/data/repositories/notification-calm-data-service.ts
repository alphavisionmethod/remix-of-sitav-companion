// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification/Calm Data Service
// Mode-aware: real Supabase queries in live mode, demo fallback
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
export async function fetchAttentionDecisions(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  const { data, error } = await db.from("attention_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data?.length ? data : [] as any[];
}

export async function fetchFatigueProfiles(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  const { data, error } = await db.from("notification_fatigue_profiles")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data?.length ? data : [] as any[];
}

export async function fetchAssistantRolePresences(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  const { data, error } = await db.from("assistant_role_presences")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : [] as any[];
}

export async function fetchAssistantRoleStates(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  const { data, error } = await db.from("assistant_role_states")
    .select("*")
    .order("last_active_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : [] as any[];
}

export async function fetchInterruptionPolicies(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  const { data, error } = await db.from("interruption_policies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : [] as any[];
}

export async function fetchNrcLaunchReadiness(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  const { data, error } = await db.from("ecosystem_launch_readiness")
    .select("*")
    .like("target", "nrc_%")
    .order("last_assessed_at", { ascending: false });
  if (error) throw error;
  if (!data?.length) return [] as any[];
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
  if (isDemoMode) return [] as any[];
  // No dedicated DB table yet — return demo data
  return [] as any[];
}

export async function fetchCrossDeviceSurfaces(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  // Sourced from device_families when available
  const { data, error } = await db.from("device_families")
    .select("*")
    .eq("active", true)
    .order("family_key");
  if (error) throw error;
  return data?.length ? data : [] as any[];
}

export async function fetchHandoffFlows(isDemoMode: boolean) {
  if (isDemoMode) return [] as any[];
  return [] as any[];
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification/Calm Data Service
// Mode-aware: real Supabase queries in live mode, demo fallback
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import {
  DEMO_ROUTING_MATRIX,
  DEMO_ASSISTANT_ROLES,
  DEMO_FATIGUE_SIGNALS,
  DEMO_DELIVERY_TYPES,
  DEMO_QUICK_ACTIONS,
  DEMO_CATEGORY_ROUTING,
  DEMO_NRC_SUBSYSTEMS,
  DEMO_DELIVERY_RULES,
  DEMO_CROSS_DEVICE_SURFACES,
  DEMO_HANDOFF_FLOWS,
} from "@/lib/demo-data/notification-calm";

export async function fetchAttentionDecisions(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_ROUTING_MATRIX;
  const { data, error } = await supabase
    .from("attention_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data?.length ? data : DEMO_ROUTING_MATRIX;
}

export async function fetchFatigueProfiles(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_FATIGUE_SIGNALS;
  const { data, error } = await supabase
    .from("notification_fatigue_profiles")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data?.length ? data : DEMO_FATIGUE_SIGNALS;
}

export async function fetchAssistantRolePresences(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_ASSISTANT_ROLES;
  const { data, error } = await supabase
    .from("assistant_role_presences")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : DEMO_ASSISTANT_ROLES;
}

export async function fetchAssistantRoleStates(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_ASSISTANT_ROLES;
  const { data, error } = await supabase
    .from("assistant_role_states")
    .select("*")
    .order("last_active_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : DEMO_ASSISTANT_ROLES;
}

export async function fetchInterruptionPolicies(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_CATEGORY_ROUTING;
  const { data, error } = await supabase
    .from("interruption_policies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : DEMO_CATEGORY_ROUTING;
}

export async function fetchNrcLaunchReadiness(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_NRC_SUBSYSTEMS;
  const { data, error } = await supabase
    .from("ecosystem_launch_readiness")
    .select("*")
    .like("target", "nrc_%")
    .order("last_assessed_at", { ascending: false });
  if (error) throw error;
  if (!data?.length) return DEMO_NRC_SUBSYSTEMS;
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
  if (isDemoMode) return DEMO_DELIVERY_RULES;
  // No dedicated DB table yet — return demo data
  return DEMO_DELIVERY_RULES;
}

export async function fetchCrossDeviceSurfaces(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_CROSS_DEVICE_SURFACES;
  // Sourced from device_families when available
  const { data, error } = await supabase
    .from("device_families")
    .select("*")
    .eq("active", true)
    .order("family_key");
  if (error) throw error;
  return data?.length ? data : DEMO_CROSS_DEVICE_SURFACES;
}

export async function fetchHandoffFlows(isDemoMode: boolean) {
  if (isDemoMode) return DEMO_HANDOFF_FLOWS;
  return DEMO_HANDOFF_FLOWS;
}

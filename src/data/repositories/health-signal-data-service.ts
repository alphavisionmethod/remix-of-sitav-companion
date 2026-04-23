// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Signal Data Service
// Mode-aware: real Supabase queries in live mode, demo fallback
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
export async function fetchWearableProviders(isDemoMode: boolean) {
  if (isDemoMode) return SIGNAL_PROVIDERS;
  const { data, error } = await db.from("wearable_providers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data?.length ? data : SIGNAL_PROVIDERS;
}

export async function fetchHealthSignalConsents(isDemoMode: boolean) {
  if (isDemoMode) return [];
  const { data, error } = await db.from("health_signal_consents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchWearableSignals(isDemoMode: boolean, limit = 50) {
  if (isDemoMode) return [];
  const { data, error } = await db.from("wearable_signals")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchReadinessStates(isDemoMode: boolean, limit = 20) {
  if (isDemoMode) return [];
  const { data, error } = await db.from("readiness_states")
    .select("*")
    .order("assessed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchInterruptionPosture(isDemoMode: boolean) {
  if (isDemoMode) return [];
  const { data, error } = await db.from("interruption_policies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchVisibilityPolicies(isDemoMode: boolean) {
  if (isDemoMode) return [];
  const { data, error } = await db.from("readiness_states")
    .select("*")
    .order("assessed_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSignalSubsystemReadiness(isDemoMode: boolean) {
  if (isDemoMode) return SIGNAL_SUBSYSTEMS;
  const { data, error } = await db.from("ecosystem_launch_readiness")
    .select("*")
    .like("target", "hrs_%")
    .order("last_assessed_at", { ascending: false });
  if (error) throw error;
  if (!data?.length) return SIGNAL_SUBSYSTEMS;
  return data.map((r: any) => ({
    target: r.target_name || r.target,
    key: r.target,
    stage: r.launch_stage,
    readiness: r.launch_ready ? 90 : r.pilot_ready ? 60 : r.demo_available ? 40 : 10,
    demo: r.demo_available ?? false,
    real: r.launch_ready ?? false,
    blockers: r.blockers ?? [],
    critical: r.target.includes("ingest") || r.target.includes("norm") || r.target.includes("derive") || r.target.includes("route"),
  }));
}

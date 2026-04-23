// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Shell Strategy Data Service
// Mode-aware: real Supabase queries in live mode, demo fallback
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
export async function fetchNativeShellPlatforms(isDemoMode: boolean) {
  if (isDemoMode) return PLATFORMS;
  const { data, error } = await db.from("device_families")
    .select("*")
    .eq("active", true)
    .order("family_key");
  if (error) throw error;
  return data?.length ? data : PLATFORMS;
}

export async function fetchCapabilitySurfaceBindings(isDemoMode: boolean) {
  if (isDemoMode) return CAPABILITIES;
  const { data, error } = await db.from("capability_surface_bindings")
    .select("*")
    .order("capability_key");
  if (error) throw error;
  return data?.length ? data : CAPABILITIES;
}

export async function fetchNssLaunchReadiness(isDemoMode: boolean) {
  if (isDemoMode) return NSS_TARGETS;
  const { data, error } = await db.from("ecosystem_launch_readiness")
    .select("*")
    .like("target", "nss_%")
    .order("last_assessed_at", { ascending: false });
  if (error) throw error;
  if (!data?.length) return NSS_TARGETS;
  return data.map((r: any) => ({
    target: r.target_name || r.target,
    key: r.target,
    stage: r.launch_stage,
    readiness: r.launch_ready ? 100 : r.pilot_ready ? 60 : r.demo_available ? 25 : 0,
    webAlt: !r.target.includes("native_only"),
    native: r.target.includes("native") || r.target.includes("app_only"),
    blockers: r.blockers ?? [],
    critical: r.target.includes("iphone") || r.target.includes("android") || r.target.includes("native_only"),
  }));
}

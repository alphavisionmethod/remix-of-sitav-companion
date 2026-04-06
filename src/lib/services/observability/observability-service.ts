// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Service
// DB-backed probe management, health snapshot recording,
// and observability index computation
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { runAllProbes, type ProbeResult } from "@/lib/observability/health-probes";

export interface RuntimeProbe {
  id: string;
  probe_id: string;
  name: string;
  target_system: string;
  environment: string;
  cadence_seconds: number;
  severity: string;
  launch_impact: string;
  owner: string;
  success_criteria: string;
  failure_criteria: string;
  enabled: boolean;
}

export interface ProbeRunRecord {
  probe_id: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency_ms: number;
  message?: string;
}

export interface HealthSnapshot {
  id: string;
  domain: string;
  component: string;
  health_status: string;
  health_score: number;
  details: Record<string, unknown>;
  degraded_capabilities: string[];
  check_duration_ms: number;
  checked_at: string;
  created_at: string;
}

/** Fetch all registered probes */
export async function getRegisteredProbes(): Promise<RuntimeProbe[]> {
  const { data } = await (supabase as any)
    .from("runtime_probes")
    .select("*")
    .order("probe_id");
  return (data ?? []) as RuntimeProbe[];
}

/** Fetch latest health snapshots */
export async function getHealthSnapshots(): Promise<HealthSnapshot[]> {
  const { data } = await (supabase as any)
    .from("platform_health_snapshots")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as HealthSnapshot[];
}

/** Run all client-side probes and record results */
export async function executeAndRecordProbes(): Promise<ProbeResult[]> {
  const results = await runAllProbes();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return results;

    // Record probe runs
    const runs = results.map(r => ({
      user_id: user.id,
      probe_id: r.name.toLowerCase().replace(/\s+/g, "_"),
      status: r.status,
      latency_ms: r.latencyMs,
      message: r.message ?? null,
      checked_at: r.checkedAt,
    }));

    await (supabase as any).from("runtime_probe_runs").insert(runs);

    // Update health snapshots
    const snapshots = results.map(r => ({
      user_id: user.id,
      domain: r.name.toLowerCase().replace(/\s+/g, "_"),
      component: r.name,
      health_status: r.status,
      health_score: r.status === "healthy" ? 100 : r.status === "degraded" ? 60 : 20,
      details: { latency_ms: r.latencyMs, message: r.message },
      degraded_capabilities: r.status !== "healthy" ? [r.name] : [],
      check_duration_ms: r.latencyMs,
    }));

    await (supabase as any).from("platform_health_snapshots").insert(snapshots);
  } catch {
    // Non-blocking recording
  }

  return results;
}

/** Compute observability index from probes and snapshots */
export async function computeObservabilityIndex(): Promise<number> {
  const [probes, snapshots] = await Promise.all([
    getRegisteredProbes(),
    getHealthSnapshots(),
  ]);

  if (probes.length === 0 && snapshots.length === 0) return 0;

  let score = 0;
  let maxScore = 0;

  // Probe coverage: 40 points
  const enabledProbes = probes.filter(p => p.enabled);
  const probeCoverage = enabledProbes.length >= 8 ? 40 : Math.round((enabledProbes.length / 8) * 40);
  score += probeCoverage;
  maxScore += 40;

  // Health snapshot freshness: 30 points
  if (snapshots.length > 0) {
    const latestCheck = new Date(snapshots[0].checked_at ?? snapshots[0].created_at);
    const ageMinutes = (Date.now() - latestCheck.getTime()) / 60000;
    if (ageMinutes < 30) score += 30;
    else if (ageMinutes < 120) score += 20;
    else if (ageMinutes < 1440) score += 10;
  }
  maxScore += 30;

  // Health score average: 30 points
  if (snapshots.length > 0) {
    // Get latest per domain
    const byDomain = new Map<string, HealthSnapshot>();
    for (const s of snapshots) {
      if (!byDomain.has(s.domain)) byDomain.set(s.domain, s);
    }
    const avgScore = Array.from(byDomain.values()).reduce((sum, s) => sum + s.health_score, 0) / byDomain.size;
    score += Math.round((avgScore / 100) * 30);
  }
  maxScore += 30;

  return Math.round((score / maxScore) * 100);
}

/** Compute device readiness index */
export async function computeDeviceReadinessIndex(): Promise<number> {
  const [families, devices, readiness] = await Promise.all([
    (supabase as any).from("device_families").select("*").then((r: any) => r.data ?? []),
    (supabase as any).from("connected_devices").select("*").then((r: any) => r.data ?? []),
    (supabase as any).from("surface_readiness_records").select("*").then((r: any) => r.data ?? []),
  ]);

  if (families.length === 0) return 0;

  let score = 0;

  // Family coverage: 25 points (7 families defined = full)
  score += Math.min(25, Math.round((families.length / 7) * 25));

  // Active devices: 25 points
  const activeDevices = devices.filter((d: any) => d.reachable && d.health_status === "healthy");
  score += activeDevices.length > 0 ? 25 : 0;

  // Readiness records: 25 points
  if (readiness.length > 0) {
    const avgPortability = readiness.reduce((s: number, r: any) => s + Number(r.portability_score ?? 0), 0) / readiness.length;
    score += Math.round((avgPortability / 100) * 25);
  }

  // Live families: 25 points
  const liveFamilies = families.filter((f: any) => f.launch_stage === "live");
  score += Math.round((liveFamilies.length / families.length) * 25);

  return Math.min(100, score);
}
